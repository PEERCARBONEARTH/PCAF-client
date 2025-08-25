// Amortization Schedule Engine for PCAF Attribution Factor Management
import { db, type LoanPortfolioItem } from '@/lib/db';

export interface AmortizationScheduleEntry {
  period: number;
  payment_date: Date;
  payment_amount: number;
  principal_payment: number;
  interest_payment: number;
  remaining_balance: number;
  attribution_factor: number;
}

export interface AmortizationSchedule {
  loan_id: string;
  schedule: AmortizationScheduleEntry[];
  monthly_payment: number;
  total_interest: number;
  total_payments: number;
}

export interface LifecycleEvent {
  id?: number;
  loan_id: string;
  event_type: 'early_payoff' | 'refinance' | 'default' | 'partial_payment';
  event_date: Date;
  event_amount?: number;
  new_terms?: {
    interest_rate?: number;
    remaining_term_months?: number;
    new_payment_amount?: number;
  };
  notes?: string;
  created_at: Date;
}

export interface AttributionHistory {
  id?: number;
  loan_id: string;
  reporting_date: Date;
  outstanding_balance: number;
  vehicle_value: number;
  attribution_factor: number;
  financed_emissions: number;
  annual_emissions: number;
  calculation_reason: 'scheduled' | 'event_triggered' | 'manual_adjustment';
  created_at: Date;
}

export class AmortizationEngine {
  /**
   * Calculate complete amortization schedule for a loan
   */
  static calculateAmortizationSchedule(
    principal: number,
    annualInterestRate: number,
    termYears: number,
    vehicleValue: number,
    startDate: Date = new Date()
  ): AmortizationSchedule {
    const monthlyRate = annualInterestRate / 12 / 100;
    const totalPayments = termYears * 12;
    
    // Calculate monthly payment using standard formula
    const monthlyPayment = monthlyRate === 0 
      ? principal / totalPayments
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);

    const schedule: AmortizationScheduleEntry[] = [];
    let remainingBalance = principal;
    let totalInterest = 0;

    for (let period = 1; period <= totalPayments; period++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance = Math.max(0, remainingBalance - principalPayment);
      
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + period);
      
      const attributionFactor = vehicleValue > 0 ? remainingBalance / vehicleValue : 0;
      
      schedule.push({
        period,
        payment_date: paymentDate,
        payment_amount: monthlyPayment,
        principal_payment: principalPayment,
        interest_payment: interestPayment,
        remaining_balance: remainingBalance,
        attribution_factor: Math.min(1, attributionFactor)
      });

      totalInterest += interestPayment;
    }

    return {
      loan_id: '',
      schedule,
      monthly_payment: monthlyPayment,
      total_interest: totalInterest,
      total_payments: totalPayments
    };
  }

  /**
   * Calculate outstanding balance on any given date
   */
  static calculateBalanceAsOfDate(
    schedule: AmortizationSchedule,
    asOfDate: Date,
    lifecycleEvents: LifecycleEvent[] = []
  ): { balance: number; attribution_factor: number } {
    // Find the most recent payment before or on the asOfDate
    const relevantPayments = schedule.schedule.filter(
      entry => entry.payment_date <= asOfDate
    );

    if (relevantPayments.length === 0) {
      // Before first payment - return original balance
      const originalBalance = schedule.schedule[0]?.remaining_balance + schedule.schedule[0]?.principal_payment || 0;
      return {
        balance: originalBalance,
        attribution_factor: schedule.schedule[0]?.attribution_factor || 0
      };
    }

    // Get the last payment before the asOfDate
    const lastPayment = relevantPayments[relevantPayments.length - 1];
    let adjustedBalance = lastPayment.remaining_balance;
    let adjustedAttributionFactor = lastPayment.attribution_factor;

    // Apply lifecycle events that occurred before or on asOfDate
    const applicableEvents = lifecycleEvents
      .filter(event => event.event_date <= asOfDate)
      .sort((a, b) => a.event_date.getTime() - b.event_date.getTime());

    for (const event of applicableEvents) {
      switch (event.event_type) {
        case 'early_payoff':
          adjustedBalance = 0;
          adjustedAttributionFactor = 0;
          break;
        case 'partial_payment':
          if (event.event_amount) {
            adjustedBalance = Math.max(0, adjustedBalance - event.event_amount);
            // Recalculate attribution factor based on vehicle value
            // This would need vehicle value from the original loan
          }
          break;
        case 'default':
          // For defaults, we typically freeze the balance
          break;
        case 'refinance':
          // For refinancing, we'd need to create a new schedule
          if (event.new_terms) {
            // This is simplified - in reality, refinancing would create a new loan
            adjustedBalance = event.event_amount || adjustedBalance;
          }
          break;
      }
    }

    return {
      balance: adjustedBalance,
      attribution_factor: adjustedAttributionFactor
    };
  }

  /**
   * Update outstanding balance for a loan based on its amortization schedule
   */
  static async updateLoanBalance(loanId: string, asOfDate: Date = new Date()): Promise<void> {
    const loan = await db.loans.where('loan_id').equals(loanId).first();
    if (!loan) {
      throw new Error(`Loan ${loanId} not found`);
    }

    // Get lifecycle events for this loan
    const lifecycleEvents = await db.lifecycle_events?.where('loan_id').equals(loanId).toArray() || [];

    // Calculate amortization schedule
    // Note: We need interest rate - this might need to be added to the loan data structure
    const interestRate = 5.0; // Default rate - should come from loan data
    const schedule = this.calculateAmortizationSchedule(
      loan.loan_amount,
      interestRate,
      loan.loan_term_years || 5,
      loan.vehicle_value,
      loan.loan_origination_date ? new Date(loan.loan_origination_date) : new Date()
    );

    const { balance, attribution_factor } = this.calculateBalanceAsOfDate(
      schedule,
      asOfDate,
      lifecycleEvents
    );

    // Update the loan with new balance and attribution factor
    await db.loans.update(loan.id!, {
      outstanding_balance: balance,
      attribution_factor: attribution_factor,
      updated_at: new Date()
    });

    // Store attribution history
    await this.storeAttributionHistory(loanId, asOfDate, balance, loan.vehicle_value, attribution_factor, loan.annual_emissions || 0, 'scheduled');

    // Recalculate financed emissions
    await this.recalculateFinancedEmissions(loanId);
  }

  /**
   * Process lifecycle events (early payoff, refinance, default)
   */
  static async processLifecycleEvent(
    loanId: string,
    eventType: LifecycleEvent['event_type'],
    eventDate: Date,
    eventData?: Partial<LifecycleEvent>
  ): Promise<void> {
    const loan = await db.loans.where('loan_id').equals(loanId).first();
    if (!loan) {
      throw new Error(`Loan ${loanId} not found`);
    }

    // Create lifecycle event record
    const lifecycleEvent: Omit<LifecycleEvent, 'id'> = {
      loan_id: loanId,
      event_type: eventType,
      event_date: eventDate,
      event_amount: eventData?.event_amount,
      new_terms: eventData?.new_terms,
      notes: eventData?.notes,
      created_at: new Date()
    };

    // Store the event
    if (db.lifecycle_events) {
      await db.lifecycle_events.add(lifecycleEvent);
    }

    // Update the loan record with lifecycle event dates
    const updateData: Partial<LoanPortfolioItem> = {
      updated_at: new Date()
    };

    switch (eventType) {
      case 'early_payoff':
        updateData.early_payoff_date = eventDate.toISOString();
        updateData.outstanding_balance = 0;
        updateData.attribution_factor = 0;
        break;
      case 'refinance':
        updateData.refinance_date = eventDate.toISOString();
        break;
      case 'default':
        updateData.default_date = eventDate.toISOString();
        break;
    }

    await db.loans.update(loan.id!, updateData);

    // Recalculate balance and attribution factor
    await this.updateLoanBalance(loanId, eventDate);
  }

  /**
   * Store attribution factor history for audit trail
   */
  static async storeAttributionHistory(
    loanId: string,
    reportingDate: Date,
    outstandingBalance: number,
    vehicleValue: number,
    attributionFactor: number,
    annualEmissions: number,
    calculationReason: AttributionHistory['calculation_reason']
  ): Promise<void> {
    const historyEntry: Omit<AttributionHistory, 'id'> = {
      loan_id: loanId,
      reporting_date: reportingDate,
      outstanding_balance: outstandingBalance,
      vehicle_value: vehicleValue,
      attribution_factor: attributionFactor,
      financed_emissions: annualEmissions * attributionFactor,
      annual_emissions: annualEmissions,
      calculation_reason: calculationReason,
      created_at: new Date()
    };

    if (db.attribution_history) {
      await db.attribution_history.add(historyEntry);
    }
  }

  /**
   * Recalculate financed emissions based on current attribution factor
   */
  static async recalculateFinancedEmissions(loanId: string): Promise<void> {
    const loan = await db.loans.where('loan_id').equals(loanId).first();
    if (!loan) return;

    const financedEmissions = (loan.annual_emissions || 0) * loan.attribution_factor;
    
    await db.loans.update(loan.id!, {
      financed_emissions: financedEmissions,
      updated_at: new Date()
    });
  }

  /**
   * Batch update all loans' balances for a specific reporting date
   */
  static async batchUpdatePortfolioBalances(reportingDate: Date = new Date()): Promise<void> {
    const allLoans = await db.loans.toArray();
    
    for (const loan of allLoans) {
      try {
        await this.updateLoanBalance(loan.loan_id, reportingDate);
      } catch (error) {
        console.error(`Failed to update balance for loan ${loan.loan_id}:`, error);
      }
    }
  }

  /**
   * Get attribution factor trend for a loan over time
   */
  static async getAttributionTrend(loanId: string, startDate: Date, endDate: Date): Promise<AttributionHistory[]> {
    if (!db.attribution_history) return [];
    
    const history = await db.attribution_history
      .where('loan_id').equals(loanId)
      .and(record => record.reporting_date >= startDate && record.reporting_date <= endDate)
      .toArray();
    
    return history.sort((a, b) => a.reporting_date.getTime() - b.reporting_date.getTime());
  }
}