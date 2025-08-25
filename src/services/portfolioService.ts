import { handleAPIError } from './api';
import { toast } from '@/hooks/use-toast';

export interface PortfolioMetrics {
  totalLoans: number;
  totalLoanValue: number;
  totalOutstandingBalance: number;
  totalFinancedEmissions: number;
  weightedAvgDataQuality: number;
  avgAttributionFactor: number;
  emissionIntensityPerDollar: number;
  
  // PCAF Metrics
  physicalEmissionIntensity: number;
  waci: number;
  
  // Breakdowns
  emissionsByFuelType: Record<string, number>;
  emissionsByVehicleType: Record<string, number>;
  loansByDataQuality: Record<string, number>;
  
  // Trends and insights
  pcafCompliantLoans: number;
  highRiskLoans: number;
  dataQualityDistribution: Record<string, number>;
}

export interface TimeSeriesData {
  date: string;
  totalEmissions: number;
  emissionIntensity: number;
  totalLoans: number;
  avgDataQuality: number;
}

export interface DataQualityAlert {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  loanCount: number;
  recommendation: string;
}

export interface PortfolioSummary {
  totalLoans: number;
  totalLoanAmount: number;
  totalOutstandingBalance: number;
  totalFinancedEmissions: number;
  averageDataQualityScore: number;
  loanCount: number;
}

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
    vin?: string;
    engine_size?: number;
  };
  emissions_data: {
    annual_emissions_tco2e: number;
    attribution_factor: number;
    financed_emissions_tco2e: number;
    scope_1_emissions: number;
    scope_2_emissions: number;
    scope_3_emissions: number;
    data_quality_score: number;
    pcaf_data_option: string;
    calculation_method: string;
    emission_factor_source: string;
    last_calculated: string;
  };
  data_quality_assessment: {
    overall_score: number;
    category_scores: Record<string, number>;
    warnings: string[];
    recommendations: string[];
  };
  audit_trail: Array<{
    action: string;
    timestamp: string;
    user_id: string;
    details: any;
  }>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

class PortfolioService {
  private static instance: PortfolioService;

  static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  async getPortfolioSummary(filters?: {
    filter_by_vehicle_type?: string;
    filter_by_fuel_type?: string;
    min_loan_amount?: number;
    max_loan_amount?: number;
    origination_date_from?: string;
    origination_date_to?: string;
  }): Promise<{ loans: LoanData[]; summary: PortfolioSummary }> {
    try {
      // Call the backend portfolio endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/v1/loans/portfolio`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Portfolio request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform backend data to frontend format
      const loans: LoanData[] = data.data.loans.map((loan: any) => {
        // Handle both flat structure (old) and nested structure (new)
        if (loan.vehicle_details && loan.emissions_data) {
          // New nested structure - use as is
          return {
            loan_id: loan.loan_id,
            borrower_name: loan.borrower_name || 'N/A',
            loan_amount: loan.loan_amount,
            outstanding_balance: loan.outstanding_balance,
            interest_rate: loan.interest_rate || 0.05,
            term_months: loan.term_months || 60,
            origination_date: loan.origination_date,
            vehicle_details: loan.vehicle_details,
            emissions_data: loan.emissions_data,
            data_quality_assessment: loan.data_quality_assessment || {
              overall_score: loan.emissions_data.data_quality_score,
              category_scores: {},
              warnings: [],
              recommendations: []
            },
            audit_trail: loan.audit_trail || [],
            is_deleted: loan.is_deleted || false,
            created_at: loan.created_at,
            updated_at: loan.updated_at
          };
        } else {
          // Old flat structure - transform to nested
          return {
            loan_id: loan.loan_id,
            borrower_name: loan.borrower_name || 'N/A',
            loan_amount: loan.outstanding_balance,
            outstanding_balance: loan.outstanding_balance,
            interest_rate: 0.05,
            term_months: 60,
            origination_date: loan.created_at,
            vehicle_details: {
              make: loan.vehicle_make || 'Unknown',
              model: loan.vehicle_model || 'Unknown',
              year: loan.vehicle_year || new Date().getFullYear(),
              type: loan.vehicle_type || 'Sedan',
              fuel_type: loan.fuel_type || (loan.vehicle_make?.toLowerCase().includes('tesla') ? 'Electric' : 'Gasoline'),
              value_at_origination: loan.outstanding_balance,
              efficiency_mpg: 30,
              annual_mileage: loan.annual_mileage || loan.estimated_km_per_year || 12000,
              vin: loan.loan_id,
              engine_size: 2.0
            },
            emissions_data: {
              annual_emissions_tco2e: loan.annual_emissions || loan.financed_emissions * 2,
              attribution_factor: loan.attribution_factor || 0.8,
              financed_emissions_tco2e: loan.financed_emissions,
              scope_1_emissions: loan.financed_emissions * 0.8,
              scope_2_emissions: loan.financed_emissions * 0.1,
              scope_3_emissions: loan.financed_emissions * 0.1,
              data_quality_score: loan.data_quality_score,
              pcaf_data_option: loan.pcaf_data_option || 'option_3b',
              calculation_method: 'PCAF Standard',
              emission_factor_source: 'EPA',
              last_calculated: loan.updated_at
            },
            data_quality_assessment: {
              overall_score: loan.data_quality_score,
              category_scores: {},
              warnings: [],
              recommendations: []
            },
            audit_trail: [],
            is_deleted: false,
            created_at: loan.created_at,
            updated_at: loan.updated_at
          };
        }
      });

      const summary: PortfolioSummary = {
        totalLoans: data.data.analytics.totalLoans,
        totalLoanAmount: data.data.analytics.totalOutstandingBalance,
        totalOutstandingBalance: data.data.analytics.totalOutstandingBalance,
        totalFinancedEmissions: data.data.analytics.totalFinancedEmissions,
        averageDataQualityScore: data.data.analytics.weightedAvgDataQuality,
        loanCount: data.data.analytics.totalLoans
      };

      return { loans, summary };
    } catch (error) {
      console.error('Failed to fetch portfolio summary:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async getPortfolioAnalytics(): Promise<PortfolioMetrics> {
    try {
      // Get portfolio data
      const { loans, summary } = await this.getPortfolioSummary();
      
      if (loans.length === 0) {
        throw new Error('No portfolio data available');
      }

      // Calculate metrics from loan data
      const totalLoans = loans.length;
      const totalLoanValue = summary.totalLoanAmount;
      const totalOutstandingBalance = summary.totalOutstandingBalance;
      const totalFinancedEmissions = summary.totalFinancedEmissions;
      
      // Calculate weighted average data quality score (PCAF Box 8 WDQS)
      const weightedAvgDataQuality = totalOutstandingBalance > 0 
        ? loans.reduce((sum, loan) => sum + (loan.outstanding_balance * loan.emissions_data.data_quality_score), 0) / totalOutstandingBalance
        : 0;

      // Average attribution factor
      const avgAttributionFactor = loans.reduce((sum, loan) => sum + loan.emissions_data.attribution_factor, 0) / totalLoans;
      
      // Emission intensity per dollar outstanding
      const emissionIntensityPerDollar = totalOutstandingBalance > 0 
        ? (totalFinancedEmissions * 1000) / totalOutstandingBalance // kg CO2 per dollar
        : 0;

      // Calculate PCAF metrics
      const physicalEmissionIntensity = this.calculatePhysicalEmissionIntensity(loans);
      const waci = this.calculateWACI(loans);

      // Breakdowns by fuel type and vehicle type
      const emissionsByFuelType: Record<string, number> = {};
      const emissionsByVehicleType: Record<string, number> = {};
      const loansByDataQuality: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      const dataQualityDistribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

      loans.forEach(loan => {
        // Fuel type breakdown
        const fuelType = loan.vehicle_details.fuel_type;
        if (!emissionsByFuelType[fuelType]) {
          emissionsByFuelType[fuelType] = 0;
        }
        emissionsByFuelType[fuelType] += loan.emissions_data.financed_emissions_tco2e;

        // Vehicle type breakdown
        const vehicleType = loan.vehicle_details.type;
        if (!emissionsByVehicleType[vehicleType]) {
          emissionsByVehicleType[vehicleType] = 0;
        }
        emissionsByVehicleType[vehicleType] += loan.emissions_data.financed_emissions_tco2e;

        // Data quality distribution
        const qualityScore = Math.floor(loan.emissions_data.data_quality_score).toString();
        loansByDataQuality[qualityScore]++;
        dataQualityDistribution[qualityScore] += loan.emissions_data.financed_emissions_tco2e;
      });

      // Risk assessment
      const pcafCompliantLoans = loans.filter(loan => loan.emissions_data.data_quality_score <= 3).length;
      const highRiskLoans = loans.filter(loan => 
        loan.emissions_data.data_quality_score >= 4 || 
        loan.emissions_data.attribution_factor > 0.9
      ).length;

      return {
        totalLoans,
        totalLoanValue,
        totalOutstandingBalance,
        totalFinancedEmissions,
        weightedAvgDataQuality,
        avgAttributionFactor,
        emissionIntensityPerDollar,
        physicalEmissionIntensity,
        waci,
        emissionsByFuelType,
        emissionsByVehicleType,
        loansByDataQuality,
        pcafCompliantLoans,
        highRiskLoans,
        dataQualityDistribution
      };

    } catch (error) {
      console.error('Failed to calculate portfolio analytics:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async getHistoricalAnalytics(): Promise<TimeSeriesData[]> {
    try {
      // For now, we'll simulate historical data
      // In a real implementation, this would call a backend endpoint for historical analytics
      const currentMetrics = await this.getPortfolioAnalytics();
      
      // Generate mock historical data for demonstration
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentDate = new Date();
      const historicalData: TimeSeriesData[] = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthLabel = months[date.getMonth()];
        
        // Simulate gradual improvement in metrics over time
        const progressFactor = (12 - i) / 12;
        
        historicalData.push({
          date: monthLabel,
          totalEmissions: currentMetrics.totalFinancedEmissions * (0.8 + 0.2 * progressFactor),
          emissionIntensity: currentMetrics.emissionIntensityPerDollar * (1.2 - 0.2 * progressFactor),
          totalLoans: Math.floor(currentMetrics.totalLoans * (0.6 + 0.4 * progressFactor)),
          avgDataQuality: currentMetrics.weightedAvgDataQuality * (1.1 - 0.1 * progressFactor)
        });
      }

      return historicalData;
    } catch (error) {
      console.error('Failed to fetch historical analytics:', error);
      return [];
    }
  }

  generateDataQualityAlerts(loans: LoanData[], metrics: PortfolioMetrics): DataQualityAlert[] {
    const alerts: DataQualityAlert[] = [];

    // High data quality score alert
    const poorQualityLoans = loans.filter(loan => loan.emissions_data.data_quality_score >= 4);
    if (poorQualityLoans.length > 0) {
      alerts.push({
        type: 'error',
        title: 'Poor Data Quality Detected',
        message: `${poorQualityLoans.length} loans have PCAF quality scores of 4 or higher`,
        loanCount: poorQualityLoans.length,
        recommendation: 'Collect more specific vehicle data, actual mileage, or asset-level emissions data'
      });
    }

    // PCAF Box 8 WDQS compliance warning
    if (metrics.weightedAvgDataQuality > 3.0) {
      alerts.push({
        type: 'warning',
        title: 'PCAF Box 8 WDQS Compliance Risk',
        message: `Portfolio WDQS of ${metrics.weightedAvgDataQuality.toFixed(2)} exceeds PCAF recommended threshold of 3.0`,
        loanCount: loans.length,
        recommendation: 'Improve data collection processes to achieve PCAF Box 8 WDQS compliance standards'
      });
    }

    // High attribution factor alert
    const highAttributionLoans = loans.filter(loan => loan.emissions_data.attribution_factor > 0.8);
    if (highAttributionLoans.length > 0) {
      alerts.push({
        type: 'info',
        title: 'High Attribution Factors',
        message: `${highAttributionLoans.length} loans have attribution factors above 80%`,
        loanCount: highAttributionLoans.length,
        recommendation: 'Review outstanding balances and vehicle values for accuracy'
      });
    }

    return alerts;
  }

  private calculatePhysicalEmissionIntensity(loans: LoanData[]): number {
    if (loans.length === 0) return 0;
    
    const totalVehicles = loans.length;
    const totalEmissions = loans.reduce((sum, loan) => sum + loan.emissions_data.annual_emissions_tco2e, 0);
    
    return totalEmissions / totalVehicles; // tCO2e per vehicle
  }

  private calculateWACI(loans: LoanData[]): number {
    // Weighted Average Carbon Intensity calculation
    // This is a simplified version - in practice, this would require revenue data
    const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
    
    if (totalOutstanding === 0) return 0;
    
    const weightedEmissions = loans.reduce((sum, loan) => {
      const weight = loan.outstanding_balance / totalOutstanding;
      return sum + (loan.emissions_data.financed_emissions_tco2e * weight);
    }, 0);
    
    return weightedEmissions;
  }

  async refreshPortfolioData(): Promise<void> {
    try {
      // Trigger a refresh of portfolio calculations on the backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/loans/batch-calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          reporting_date: new Date().toISOString(),
          batch_size: 100,
          max_concurrency: 5,
          transaction_mode: false
        })
      });

      if (!response.ok) {
        throw new Error(`Batch calculation request failed: ${response.statusText}`);
      }

      toast({
        title: "Portfolio Refresh Initiated",
        description: "Portfolio calculations are being updated in the background.",
      });
    } catch (error) {
      console.error('Failed to refresh portfolio data:', error);
      toast({
        title: "Refresh Failed",
        description: handleAPIError(error),
        variant: "destructive"
      });
    }
  }
}

export const portfolioService = PortfolioService.getInstance();