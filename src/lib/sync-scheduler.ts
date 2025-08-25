// Sync Scheduler for LMS Integration
import { LMSAPIClient } from './lms-api-client';
import { SyncResult, SyncScheduleConfig, LoanDiscrepancy, LMSConfig } from './lms-types';
import { AmortizationEngine } from './amortization';
import { db, LoanPortfolioItem } from './db';

export class SyncScheduler {
  private config: SyncScheduleConfig;
  private lmsClient: LMSAPIClient;
  private isRunning: boolean = false;
  private scheduledTimeout?: NodeJS.Timeout;

  constructor(lmsConfig: LMSConfig, scheduleConfig: SyncScheduleConfig) {
    this.lmsClient = new LMSAPIClient(lmsConfig);
    this.config = scheduleConfig;
  }

  // Start the sync scheduler
  start(): void {
    if (!this.config.enabled) return;

    this.scheduleNextSync();
    console.log('Sync scheduler started');
  }

  // Stop the sync scheduler
  stop(): void {
    if (this.scheduledTimeout) {
      clearTimeout(this.scheduledTimeout);
      this.scheduledTimeout = undefined;
    }
    console.log('Sync scheduler stopped');
  }

  // Schedule the next sync based on configuration
  private scheduleNextSync(): void {
    const nextSyncTime = this.calculateNextSyncTime();
    const delay = nextSyncTime.getTime() - Date.now();

    this.scheduledTimeout = setTimeout(async () => {
      await this.performSync();
      this.scheduleNextSync(); // Schedule next sync after completion
    }, delay);

    this.config.nextSync = nextSyncTime.toISOString();
    console.log(`Next sync scheduled for: ${nextSyncTime.toISOString()}`);
  }

  // Calculate next sync time based on interval
  private calculateNextSyncTime(): Date {
    const now = new Date();
    const [hours, minutes] = this.config.time.split(':').map(Number);
    
    let nextSync = new Date(now);
    nextSync.setHours(hours, minutes, 0, 0);

    // If the scheduled time has passed today, move to next interval
    if (nextSync <= now) {
      nextSync = this.addInterval(nextSync);
    }

    return nextSync;
  }

  // Add interval to date based on configuration
  private addInterval(date: Date): Date {
    const newDate = new Date(date);
    
    switch (this.config.interval) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'bi-monthly':
        newDate.setMonth(newDate.getMonth() + 2);
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
    }

    return newDate;
  }

  // Perform the actual sync operation
  async performSync(): Promise<SyncResult> {
    if (this.isRunning) {
      throw new Error('Sync already in progress');
    }

    this.isRunning = true;
    const startTime = Date.now();
    const result: SyncResult = {
      processed: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      discrepancies: [],
      duration: 0,
      timestamp: new Date().toISOString(),
    };

    try {
      console.log('Starting LMS sync...');

      // Test connection first
      const connectionTest = await this.lmsClient.testConnection();
      if (!connectionTest.success) {
        throw new Error(`LMS connection failed: ${connectionTest.error}`);
      }

      // Get all portfolio loans
      const portfolioLoans = await db.loans.toArray();
      const loanIds = portfolioLoans.map(loan => loan.loan_id);

      // Fetch updated loans from LMS
      const lastSync = this.config.lastSync ? new Date(this.config.lastSync) : new Date(0);
      const lmsResponse = await this.lmsClient.getUpdatedLoans(lastSync);

      if (!lmsResponse.success || !lmsResponse.data) {
        throw new Error(`Failed to fetch loans from LMS: ${lmsResponse.error}`);
      }

      const lmsLoans = lmsResponse.data;
      result.processed = lmsLoans.length;

      // Process each loan
      for (const lmsLoan of lmsLoans) {
        try {
          const existingLoan = portfolioLoans.find(loan => 
            loan.loan_id === lmsLoan.loan_id
          );

          if (!existingLoan) {
            result.skipped++;
            continue;
          }

          // Compare and detect discrepancies
          const discrepancies = this.detectDiscrepancies(existingLoan, lmsLoan);
          result.discrepancies.push(...discrepancies);

          // Update loan data if significant changes detected
          if (this.shouldUpdateLoan(discrepancies)) {
            await this.updateLoanFromLMS(existingLoan, lmsLoan);
            result.updated++;
          } else {
            result.skipped++;
          }

        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to process loan ${lmsLoan.loan_id}: ${error}`);
        }
      }

      this.config.lastSync = new Date().toISOString();
      console.log(`Sync completed: ${result.updated} updated, ${result.failed} failed`);

    } catch (error) {
      result.errors.push(`Sync failed: ${error}`);
      console.error('Sync error:', error);
    } finally {
      result.duration = Date.now() - startTime;
      this.isRunning = false;
    }

    return result;
  }

  // Detect discrepancies between internal and LMS data
  private detectDiscrepancies(internalLoan: LoanPortfolioItem, lmsLoan: any): LoanDiscrepancy[] {
    const discrepancies: LoanDiscrepancy[] = [];
    const mappedLmsLoan = this.lmsClient.mapToInternalFormat(lmsLoan);

    // Check outstanding balance
    const balanceDiff = Math.abs(internalLoan.outstanding_balance - mappedLmsLoan.outstanding_balance);
    const balancePercent = (balanceDiff / internalLoan.outstanding_balance) * 100;

    if (balancePercent > 0.01) { // More than 0.01% difference
      discrepancies.push({
        loan_id: internalLoan.loan_id,
        field: 'outstanding_balance',
        lms_value: mappedLmsLoan.outstanding_balance,
        internal_value: internalLoan.outstanding_balance,
        difference_percentage: balancePercent,
        severity: balancePercent > 5 ? 'critical' : balancePercent > 1 ? 'major' : 'minor',
        auto_resolved: false,
      });
    }

    // Check if loan has early payoff or default dates (status indicators)
    const hasStatusChange = (internalLoan.early_payoff_date && !mappedLmsLoan.early_payoff_date) ||
                           (internalLoan.default_date && !mappedLmsLoan.default_date);
    
    if (hasStatusChange) {
      discrepancies.push({
        loan_id: internalLoan.loan_id,
        field: 'loan_status_change',
        lms_value: 'status_updated',
        internal_value: 'status_original',
        difference_percentage: 100,
        severity: 'major',
        auto_resolved: false,
      });
    }

    return discrepancies;
  }

  // Determine if loan should be updated based on discrepancies
  private shouldUpdateLoan(discrepancies: LoanDiscrepancy[]): boolean {
    return discrepancies.some(d => 
      d.severity === 'critical' || 
      (d.severity === 'major' && this.config.autoResolveMinor) ||
      d.difference_percentage > this.config.notificationThreshold
    );
  }

  // Update internal loan data with LMS data
  private async updateLoanFromLMS(internalLoan: LoanPortfolioItem, lmsLoan: any): Promise<void> {
    const mappedData = this.lmsClient.mapToInternalFormat(lmsLoan);

    // Update loan portfolio
    await db.loans.update(internalLoan.id!, {
      outstanding_balance: mappedData.outstanding_balance,
      updated_at: new Date(),
    });

    // Process new payments if any
    if (mappedData.payment_history && mappedData.payment_history.length > 0) {
      for (const payment of mappedData.payment_history) {
        // Check if partial payment event already exists
        const existingEvent = await db.lifecycle_events
          .where({ loan_id: internalLoan.loan_id })
          .and(event => 
            event.event_type === 'partial_payment' && 
            Math.abs(new Date(event.event_date).getTime() - payment.payment_date.getTime()) < 24 * 60 * 60 * 1000 // Within 24 hours
          )
          .first();

        if (!existingEvent && payment.type === 'regular') {
          await AmortizationEngine.processLifecycleEvent(
            internalLoan.loan_id,
            'partial_payment',
            payment.payment_date,
            {
              event_amount: payment.amount,
              notes: `Regular payment: $${payment.principal_portion} principal, $${payment.interest_portion} interest`,
            }
          );
        }
      }
    }

    // Recalculate attribution factors
    await AmortizationEngine.updateLoanBalance(internalLoan.loan_id);
  }

  // Manual sync trigger
  async triggerManualSync(): Promise<SyncResult> {
    return this.performSync();
  }

  // Get sync status
  getStatus(): {
    isRunning: boolean;
    lastSync: string;
    nextSync: string;
    enabled: boolean;
  } {
    return {
      isRunning: this.isRunning,
      lastSync: this.config.lastSync,
      nextSync: this.config.nextSync,
      enabled: this.config.enabled,
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<SyncScheduleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled) {
      this.stop();
      this.start();
    } else {
      this.stop();
    }
  }
}