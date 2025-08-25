// REST API endpoints for loan management and emissions calculations
import { db, type LoanPortfolioItem } from '@/lib/db';
import { AmortizationEngine } from '@/lib/amortization';

// API Response interfaces
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoanIntakeRequest {
  loan_id: string;
  loan_amount: number;
  vehicle_type: string;
  fuel_type: string;
  engine_size: string;
  vehicle_value: number;
  estimated_km_per_year: number;
  loan_term_years: number;
  outstanding_balance?: number;
  data_source?: string;
  country?: string;
}

export interface BulkLoanIntakeRequest {
  loans: LoanIntakeRequest[];
  institution_id?: string;
  batch_reference?: string;
}

export interface LoanCalculationResult {
  loan_id: string;
  annual_emissions_tCO2: number;
  attribution_factor: number;
  financed_emissions_tCO2: number;
  emission_factor_kg_co2_km: number;
  data_quality_score: number;
  calculation_timestamp: string;
}

// Emission factor calculation engine
class EmissionCalculationEngine {
  static async calculateEmissions(loanData: LoanIntakeRequest): Promise<LoanCalculationResult> {
    // Get emission factor for vehicle type
    const emissionFactor = await db.emission_factors
      .where('vehicle_type').equals(loanData.vehicle_type)
      .and(factor => factor.fuel_type === loanData.fuel_type)
      .first();

    if (!emissionFactor) {
      throw new Error(`No emission factor found for ${loanData.vehicle_type} with ${loanData.fuel_type}`);
    }

    // Calculate annual emissions (km/year * factor kg/km / 1000 = tonnes)
    const annual_emissions_tCO2 = (loanData.estimated_km_per_year * emissionFactor.emission_factor_kg_co2_km) / 1000;

    // Calculate attribution factor (outstanding_balance / vehicle_value)
    const outstanding_balance = loanData.outstanding_balance || loanData.loan_amount;
    const attribution_factor = outstanding_balance / loanData.vehicle_value;

    // Calculate financed emissions
    const financed_emissions_tCO2 = annual_emissions_tCO2 * attribution_factor;

    // Determine data quality score based on data completeness
    let data_quality_score = emissionFactor.data_quality_level;
    
    // Adjust score based on data availability
    if (!loanData.vehicle_value || loanData.vehicle_value <= 0) data_quality_score = Math.max(data_quality_score, 4);
    if (!loanData.estimated_km_per_year || loanData.estimated_km_per_year <= 0) data_quality_score = Math.max(data_quality_score, 5);

    return {
      loan_id: loanData.loan_id,
      annual_emissions_tCO2,
      attribution_factor,
      financed_emissions_tCO2,
      emission_factor_kg_co2_km: emissionFactor.emission_factor_kg_co2_km,
      data_quality_score,
      calculation_timestamp: new Date().toISOString()
    };
  }
}

// API Endpoints simulation (in real implementation, these would be Express.js routes)
export class LoansAPI {
  
  // POST /api/loans/calculate - Calculate emissions for a single loan
  static async calculateSingleLoan(loanData: LoanIntakeRequest): Promise<APIResponse<LoanCalculationResult>> {
    try {
      const result = await EmissionCalculationEngine.calculateEmissions(loanData);
      
      return {
        success: true,
        data: result,
        message: 'Emissions calculated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Calculation failed'
      };
    }
  }

  // POST /api/loans/intake - Add a single loan to portfolio
  static async intakeSingleLoan(loanData: LoanIntakeRequest): Promise<APIResponse<LoanPortfolioItem>> {
    try {
      const calculation = await EmissionCalculationEngine.calculateEmissions(loanData);
      
      const loanItem: Omit<LoanPortfolioItem, 'id'> = {
        loan_id: loanData.loan_id,
        loan_amount: loanData.loan_amount,
        vehicle_type: loanData.vehicle_type,
        vehicle_category: 'passenger_car', // Default to passenger car for legacy API
        fuel_type: loanData.fuel_type as any,
        engine_size: loanData.engine_size,
        vehicle_value: loanData.vehicle_value,
        estimated_km_per_year: loanData.estimated_km_per_year,
        loan_term_years: loanData.loan_term_years,
        outstanding_balance: loanData.outstanding_balance || loanData.loan_amount,
        
        // Calculated values
        attribution_factor: calculation.attribution_factor,
        annual_emissions: calculation.annual_emissions_tCO2,
        financed_emissions: calculation.financed_emissions_tCO2,
        emission_factor_kg_co2_km: calculation.emission_factor_kg_co2_km,
        data_quality_score: calculation.data_quality_score,
        
        // Temporal attribution (simplified for V1)
        loan_origination_date: new Date().toISOString().split('T')[0],
        reporting_date: new Date().toISOString().split('T')[0],
        temporal_attribution: 1.0,
        
        // Data quality tracking
        data_source: loanData.data_source || 'api_intake',
        emission_factor_source: 'IPCC 2019 Guidelines',
        verification_status: 'unverified',
        pcaf_asset_class: 'motor_vehicle_loans',
        
        // Metadata
        created_at: new Date(),
        updated_at: new Date()
      };

      const id = await db.loans.add(loanItem);
      const savedLoan = await db.loans.get(id);

      // Initialize amortization tracking for the new loan
      try {
        await AmortizationEngine.updateLoanBalance(loanData.loan_id);
      } catch (error) {
        console.warn('Failed to initialize amortization for loan:', error);
      }

      return {
        success: true,
        data: savedLoan!,
        message: 'Loan added to portfolio successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add loan to portfolio'
      };
    }
  }

  // POST /api/loans/bulk-intake - Add multiple loans to portfolio
  static async bulkIntakeLoans(bulkData: BulkLoanIntakeRequest): Promise<APIResponse<{ processed: number; failed: number; errors: string[] }>> {
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const loanData of bulkData.loans) {
      try {
        await this.intakeSingleLoan(loanData);
        results.processed++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Loan ${loanData.loan_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: results.failed === 0,
      data: results,
      message: `Processed ${results.processed} loans, ${results.failed} failed`
    };
  }

  // GET /api/loans/portfolio - Get portfolio summary
  static async getPortfolioSummary(): Promise<APIResponse<any>> {
    try {
      const loans = await db.loans.toArray();
      
      const summary = {
        total_loans: loans.length,
        total_loan_value: loans.reduce((sum, loan) => sum + loan.loan_amount, 0),
        total_outstanding_balance: loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0),
        total_financed_emissions: loans.reduce((sum, loan) => sum + loan.financed_emissions, 0),
        weighted_avg_data_quality: loans.length > 0 
          ? loans.reduce((sum, loan) => sum + loan.data_quality_score, 0) / loans.length 
          : 0,
        avg_attribution_factor: loans.length > 0
          ? loans.reduce((sum, loan) => sum + loan.attribution_factor, 0) / loans.length
          : 0,
        last_updated: new Date().toISOString()
      };

      return {
        success: true,
        data: summary
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get portfolio summary'
      };
    }
  }

  // GET /api/loans/{loan_id} - Get specific loan details
  static async getLoanDetails(loanId: string): Promise<APIResponse<LoanPortfolioItem>> {
    try {
      const loan = await db.loans.where('loan_id').equals(loanId).first();
      
      if (!loan) {
        return {
          success: false,
          error: 'Loan not found'
        };
      }

      return {
        success: true,
        data: loan
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get loan details'
      };
    }
  }
}

// Webhook handler for bank LMS integration
export class WebhookHandler {
  static async handleLoanApproval(webhookData: any): Promise<APIResponse<any>> {
    try {
      // Validate webhook signature (implement based on bank's requirements)
      // const isValid = this.validateWebhookSignature(webhookData);
      // if (!isValid) throw new Error('Invalid webhook signature');

      // Extract loan data from webhook payload
      const loanData: LoanIntakeRequest = {
        loan_id: webhookData.loan_reference,
        loan_amount: webhookData.approved_amount,
        vehicle_type: webhookData.collateral?.vehicle_type || 'passenger_car',
        fuel_type: webhookData.collateral?.fuel_type || 'gasoline',
        engine_size: webhookData.collateral?.engine_size || '1.5-2.0L',
        vehicle_value: webhookData.collateral?.market_value || webhookData.approved_amount * 1.2,
        estimated_km_per_year: webhookData.collateral?.estimated_annual_mileage || 12000,
        loan_term_years: webhookData.tenure_years || 5,
        outstanding_balance: webhookData.approved_amount,
        data_source: `webhook_${webhookData.source_bank}`,
        country: webhookData.country || 'global'
      };

      const result = await LoansAPI.intakeSingleLoan(loanData);
      
      return {
        success: true,
        data: {
          webhook_processed: true,
          loan_id: loanData.loan_id,
          emissions_calculated: result.success,
          calculation_result: result.data
        },
        message: 'Webhook processed and emissions calculated'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      };
    }
  }
}