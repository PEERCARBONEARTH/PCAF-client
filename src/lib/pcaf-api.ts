// TODO: Replace with MongoDB-based PCAF API


export interface LoanData {
  loan_id: string;
  borrower_name: string;
  loan_amount: number;
  outstanding_balance: number;
  interest_rate: number;
  term_months: number;
  origination_date: string;
  vehicle_details: {
    make: string;
    model: string;
    year: number;
    type: string;
    fuel_type: string;
    value_at_origination: number;
    efficiency_mpg?: number;
    annual_mileage?: number;
  };
}

export interface PortfolioSummary {
  total_loans: number;
  total_financed_emissions: number;
  weighted_data_quality_score: number;
  portfolio_value: number;
  emissions_by_vehicle_type: Record<string, number>;
  emissions_by_fuel_type: Record<string, number>;
}

export interface PCAFMetrics {
  pcaf_compliance: {
    data_quality_distribution: Record<string, number>;
    option_distribution: Record<string, number>;
    compliance_score: number;
  };
  intensity_metrics: {
    economic_intensity: number;
    physical_intensity: number;
  };
  scope_breakdown: {
    scope_1: number;
    scope_2: number;
    scope_3: number;
  };
}

class PCAFApiService {
  private async callEdgeFunction(functionName: string, endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `https://owydrtcpqeftvfiscsvi.supabase.co/functions/v1/${functionName}${endpoint}`,
      {
        ...options,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Network error' } }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Loan Management APIs
  async submitLoan(loanData: LoanData) {
    return this.callEdgeFunction('loan-intake', '', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  }

  async getPortfolio() {
    return this.callEdgeFunction('loan-intake', '', {
      method: 'GET',
    });
  }

  // PCAF Calculation APIs
  async calculateEmissions(loanData: LoanData) {
    return this.callEdgeFunction('pcaf-calculations', '/calculate', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  }

  // Portfolio Analytics APIs
  async getPortfolioSummary(): Promise<{ data: PortfolioSummary }> {
    return this.callEdgeFunction('portfolio-analytics', '/summary', {
      method: 'GET',
    });
  }

  async getPCAFMetrics(): Promise<{ data: PCAFMetrics }> {
    return this.callEdgeFunction('portfolio-analytics', '/metrics', {
      method: 'GET',
    });
  }

  async getHistoricalData() {
    return this.callEdgeFunction('portfolio-analytics', '/historical', {
      method: 'GET',
    });
  }

  async getDataQualityAssessment() {
    return this.callEdgeFunction('portfolio-analytics', '/data-quality', {
      method: 'GET',
    });
  }

  // Amortization APIs
  async generateAmortizationSchedule(params: {
    principal: number;
    annual_rate: number;
    term_months: number;
    origination_date: string;
  }) {
    return this.callEdgeFunction('amortization', '/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async calculateBalanceAsOf(params: {
    principal: number;
    annual_rate: number;
    term_months: number;
    origination_date: string;
    as_of_date: string;
  }) {
    return this.callEdgeFunction('amortization', '/balance-as-of', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async updatePortfolioAttributions() {
    return this.callEdgeFunction('amortization', '/update-portfolio', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Database queries for loans
  async getLoans() {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getLoan(id: string) {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateLoan(id: string, updates: Partial<LoanData>) {
    const { data, error } = await supabase
      .from('loans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteLoan(id: string) {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get emission factors
  async getEmissionFactors() {
    const { data, error } = await supabase
      .from('emission_factors')
      .select('*')
      .order('vehicle_type', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get calculation history
  async getCalculationHistory() {
    const { data, error } = await supabase
      .from('calculation_history')
      .select('*')
      .order('calculation_date', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  }

  // Update existing Supabase loan by loan_id (text)
  async updateLoanByLoanId(loan_id_text: string, updates: {
    attribution_factor: number;
    annual_emissions_tco2e: number;
    financed_emissions_tco2e: number;
    data_quality_score: number;
    pcaf_data_option?: string;
    share_of_financing?: number;
  }) {
    const { data: existing, error: findErr } = await supabase
      .from('loans')
      .select('id')
      .eq('loan_id', loan_id_text)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!existing) return null;

    const updatePayload: any = {
      attribution_factor: updates.attribution_factor,
      annual_emissions_tco2e: updates.annual_emissions_tco2e,
      financed_emissions_tco2e: updates.financed_emissions_tco2e,
      data_quality_score: updates.data_quality_score,
      pcaf_data_option: updates.pcaf_data_option,
      last_calculated: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (typeof updates.share_of_financing === 'number') {
      updatePayload.share_of_financing = updates.share_of_financing;
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updatePayload)
      .eq('id', existing.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

export const pcafApi = new PCAFApiService();