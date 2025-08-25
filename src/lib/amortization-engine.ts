// TODO: Replace with MongoDB-based amortization engine

export interface AmortizationPayment {
  payment_number: number;
  payment_date: string;
  payment_amount: number;
  principal_payment: number;
  interest_payment: number;
  remaining_balance: number;
}

export interface AmortizationSchedule {
  loan_id: string;
  schedule: AmortizationPayment[];
  total_payments: number;
  total_interest: number;
  monthly_payment: number;
}

export interface LifecycleEvent {
  id: string;
  loan_id: string;
  event_type: 'early_payoff' | 'refinance' | 'default' | 'payment' | 'modification';
  event_date: string;
  event_details: {
    amount?: number;
    new_balance?: number;
    new_rate?: number;
    new_term?: number;
    reason?: string;
  };
  impact_on_emissions: {
    old_attribution_factor: number;
    new_attribution_factor: number;
    emissions_change: number;
  };
}

export class AmortizationEngine {
  
  /**
   * Generate complete amortization schedule for a loan
   */
  static generateSchedule(
    principal: number,
    annualRate: number,
    termMonths: number,
    originationDate: string
  ): AmortizationSchedule {
    if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
      throw new Error('Invalid loan parameters');
    }

    const monthlyRate = annualRate / 12;
    const monthlyPayment = monthlyRate === 0 
      ? principal / termMonths 
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
        (Math.pow(1 + monthlyRate, termMonths) - 1);

    const schedule: AmortizationPayment[] = [];
    let remainingBalance = principal;
    const startDate = new Date(originationDate);

    for (let i = 1; i <= termMonths; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);
      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      schedule.push({
        payment_number: i,
        payment_date: paymentDate.toISOString().split('T')[0],
        payment_amount: Math.round((interestPayment + principalPayment) * 100) / 100,
        principal_payment: Math.round(principalPayment * 100) / 100,
        interest_payment: Math.round(interestPayment * 100) / 100,
        remaining_balance: Math.round(remainingBalance * 100) / 100
      });

      if (remainingBalance === 0) break;
    }

    const totalInterest = schedule.reduce((sum, payment) => sum + payment.interest_payment, 0);

    return {
      loan_id: '',
      schedule,
      total_payments: schedule.length,
      total_interest: Math.round(totalInterest * 100) / 100,
      monthly_payment: Math.round(monthlyPayment * 100) / 100
    };
  }

  /**
   * Calculate outstanding balance as of a specific date
   */
  static calculateBalanceAsOfDate(
    principal: number,
    annualRate: number,
    termMonths: number,
    originationDate: string,
    asOfDate: string
  ): number {
    const schedule = this.generateSchedule(principal, annualRate, termMonths, originationDate);
    const targetDate = new Date(asOfDate);

    // Find the last payment made before the target date
    let lastPaymentIndex = -1;
    for (let i = 0; i < schedule.schedule.length; i++) {
      const paymentDate = new Date(schedule.schedule[i].payment_date);
      if (paymentDate <= targetDate) {
        lastPaymentIndex = i;
      } else {
        break;
      }
    }

    if (lastPaymentIndex === -1) {
      // No payments made yet
      return principal;
    }

    return schedule.schedule[lastPaymentIndex].remaining_balance;
  }

  /**
   * Process lifecycle events and update loan
   */
  static async processLifecycleEvent(
    loanId: string,
    event: Omit<LifecycleEvent, 'id' | 'impact_on_emissions'>
  ): Promise<LifecycleEvent> {
    try {
      // Get current loan data
      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (loanError || !loan) {
        throw new Error('Loan not found');
      }

      const oldAttributionFactor = loan.attribution_factor || 0;
      let newBalance = loan.outstanding_balance;
      let newAttributionFactor = oldAttributionFactor;

      // Process different event types
      switch (event.event_type) {
        case 'early_payoff':
          newBalance = 0;
          newAttributionFactor = 0;
          break;

        case 'payment':
          if (event.event_details.amount) {
            newBalance = Math.max(0, loan.outstanding_balance - event.event_details.amount);
            newAttributionFactor = this.calculateNewAttributionFactor(
              newBalance,
              loan.vehicle_value_at_origination
            );
          }
          break;

        case 'refinance':
          newBalance = event.event_details.new_balance || loan.outstanding_balance;
          newAttributionFactor = this.calculateNewAttributionFactor(
            newBalance,
            loan.vehicle_value_at_origination
          );
          break;

        case 'modification':
          newBalance = event.event_details.new_balance || loan.outstanding_balance;
          newAttributionFactor = this.calculateNewAttributionFactor(
            newBalance,
            loan.vehicle_value_at_origination
          );
          break;

        case 'default':
          // In case of default, attribution factor may be adjusted based on recovery expectations
          newAttributionFactor = oldAttributionFactor * 0.5; // Example: 50% recovery assumption
          break;
      }

      // Calculate emissions impact
      const emissionsChange = (newAttributionFactor - oldAttributionFactor) * (loan.annual_emissions_tco2e || 0);

      const lifecycleEvent: LifecycleEvent = {
        id: crypto.randomUUID(),
        loan_id: loanId,
        event_type: event.event_type,
        event_date: event.event_date,
        event_details: event.event_details,
        impact_on_emissions: {
          old_attribution_factor: oldAttributionFactor,
          new_attribution_factor: newAttributionFactor,
          emissions_change: emissionsChange
        }
      };

      // Update loan with new values
      const updateData: any = {
        outstanding_balance: newBalance,
        attribution_factor: newAttributionFactor,
        financed_emissions_tco2e: (loan.annual_emissions_tco2e || 0) * newAttributionFactor,
        last_calculated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update loan terms if refinance or modification
      if (event.event_type === 'refinance' || event.event_type === 'modification') {
        if (event.event_details.new_rate !== undefined) {
          updateData.interest_rate = event.event_details.new_rate;
        }
        if (event.event_details.new_term !== undefined) {
          updateData.term_months = event.event_details.new_term;
        }
      }

      const { error: updateError } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', loanId);

      if (updateError) {
        throw updateError;
      }

      return lifecycleEvent;
    } catch (error) {
      console.error('Error processing lifecycle event:', error);
      throw error;
    }
  }

  /**
   * Calculate new attribution factor
   */
  private static calculateNewAttributionFactor(
    newBalance: number,
    vehicleValue: number
  ): number {
    if (vehicleValue <= 0) return 0;
    return Math.min(newBalance / vehicleValue, 1.0);
  }

  /**
   * Generate payment projections for remaining term
   */
  static generatePaymentProjections(
    currentBalance: number,
    annualRate: number,
    remainingMonths: number,
    nextPaymentDate: string
  ): AmortizationPayment[] {
    if (currentBalance <= 0 || remainingMonths <= 0) {
      return [];
    }

    const schedule = this.generateSchedule(
      currentBalance,
      annualRate,
      remainingMonths,
      nextPaymentDate
    );

    return schedule.schedule;
  }

  /**
   * Calculate total interest savings from early payoff
   */
  static calculateEarlyPayoffSavings(
    currentBalance: number,
    annualRate: number,
    remainingMonths: number,
    nextPaymentDate: string
  ): {
    current_balance: number;
    total_interest_remaining: number;
    monthly_payment: number;
    interest_savings: number;
  } {
    const projections = this.generatePaymentProjections(
      currentBalance,
      annualRate,
      remainingMonths,
      nextPaymentDate
    );

    const totalInterestRemaining = projections.reduce(
      (sum, payment) => sum + payment.interest_payment,
      0
    );

    const monthlyPayment = projections.length > 0 ? projections[0].payment_amount : 0;

    return {
      current_balance: currentBalance,
      total_interest_remaining: Math.round(totalInterestRemaining * 100) / 100,
      monthly_payment: Math.round(monthlyPayment * 100) / 100,
      interest_savings: Math.round(totalInterestRemaining * 100) / 100 // Full remaining interest is saved
    };
  }

  /**
   * Update attribution factors for all loans in a portfolio
   */
  static async updatePortfolioAttributionFactors(userId: string): Promise<number> {
    try {
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      if (!loans || loans.length === 0) {
        return 0;
      }

      let updatedCount = 0;

      for (const loan of loans) {
        // Calculate balance as of today
        const today = new Date().toISOString().split('T')[0];
        const currentBalance = this.calculateBalanceAsOfDate(
          loan.loan_amount,
          loan.interest_rate,
          loan.term_months,
          loan.origination_date,
          today
        );

        const newAttributionFactor = this.calculateNewAttributionFactor(
          currentBalance,
          loan.vehicle_value_at_origination
        );

        const newFinancedEmissions = (loan.annual_emissions_tco2e || 0) * newAttributionFactor;

        // Update if values have changed significantly
        if (
          Math.abs(currentBalance - loan.outstanding_balance) > 0.01 ||
          Math.abs(newAttributionFactor - (loan.attribution_factor || 0)) > 0.0001
        ) {
          const { error: updateError } = await supabase
            .from('loans')
            .update({
              outstanding_balance: currentBalance,
              attribution_factor: newAttributionFactor,
              financed_emissions_tco2e: newFinancedEmissions,
              last_calculated: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', loan.id);

          if (!updateError) {
            updatedCount++;
          }
        }
      }

      return updatedCount;
    } catch (error) {
      console.error('Error updating portfolio attribution factors:', error);
      throw error;
    }
  }
}