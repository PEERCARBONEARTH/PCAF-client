// Phase 9: Data Quality & Validation Services
import { PCAFDataQualityEngine, PCAFOption, LoanDataQualityInput } from '@/lib/pcaf-data-quality';
// TODO: Replace with MongoDB-based data quality validation service

export interface ValidationRule {
  id: string;
  name: string;
  category: 'completeness' | 'accuracy' | 'consistency' | 'compliance';
  severity: 'error' | 'warning' | 'info';
  field: string;
  condition: string;
  message: string;
  autoFix?: boolean;
}

export interface ValidationResult {
  ruleId: string;
  loanId: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  currentValue: any;
  suggestedValue?: any;
  autoFixed?: boolean;
}

export interface DataCleansingResult {
  processed: number;
  cleaned: number;
  fixed: number;
  errors: number;
  details: Array<{
    loanId: string;
    field: string;
    action: 'standardized' | 'corrected' | 'enriched' | 'flagged';
    before: any;
    after: any;
    confidence: number;
  }>;
}

export interface ComprehensiveValidationReport {
  portfolioId: string;
  reportDate: string;
  overallScore: number;
  totalLoans: number;
  validationResults: ValidationResult[];
  pcafCompliance: {
    option1Count: number;
    option2Count: number;
    option3Count: number;
    averageDataQualityScore: number;
    compliantPercentage: number;
  };
  dataCompleteness: {
    completeRecords: number;
    missingDataPercentage: number;
    criticalMissingFields: string[];
  };
  recommendations: string[];
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    affectedLoans: number;
    estimatedImpact: string;
  }>;
}

class DataQualityValidationService {
  private validationRules: ValidationRule[] = [
    // Completeness Rules
    {
      id: 'complete-vehicle-info',
      name: 'Complete Vehicle Information',
      category: 'completeness',
      severity: 'error',
      field: 'vehicle_make,vehicle_model,vehicle_year',
      condition: 'NOT NULL AND length > 0',
      message: 'Vehicle make, model, and year are required for accurate emissions calculation'
    },
    {
      id: 'fuel-efficiency-present',
      name: 'Fuel Efficiency Data',
      category: 'completeness',
      severity: 'warning',
      field: 'efficiency_mpg',
      condition: 'NOT NULL AND > 0',
      message: 'Fuel efficiency data improves calculation accuracy'
    },
    {
      id: 'annual-mileage-present',
      name: 'Annual Mileage Data',
      category: 'completeness',
      severity: 'warning',
      field: 'annual_mileage',
      condition: 'NOT NULL AND > 0',
      message: 'Annual mileage data enables more precise attribution calculations'
    },

    // Accuracy Rules
    {
      id: 'reasonable-fuel-efficiency',
      name: 'Reasonable Fuel Efficiency',
      category: 'accuracy',
      severity: 'error',
      field: 'efficiency_mpg',
      condition: 'BETWEEN 5 AND 100',
      message: 'Fuel efficiency must be between 5 and 100 MPG'
    },
    {
      id: 'reasonable-mileage',
      name: 'Reasonable Annual Mileage',
      category: 'accuracy',
      severity: 'error',
      field: 'annual_mileage',
      condition: 'BETWEEN 1000 AND 100000',
      message: 'Annual mileage must be between 1,000 and 100,000 miles'
    },
    {
      id: 'valid-vehicle-year',
      name: 'Valid Vehicle Year',
      category: 'accuracy',
      severity: 'error',
      field: 'vehicle_year',
      condition: 'BETWEEN 1990 AND 2025',
      message: 'Vehicle year must be between 1990 and 2025'
    },

    // Consistency Rules
    {
      id: 'loan-amount-consistency',
      name: 'Loan Amount Consistency',
      category: 'consistency',
      severity: 'warning',
      field: 'outstanding_balance,loan_amount',
      condition: 'outstanding_balance <= loan_amount',
      message: 'Outstanding balance should not exceed original loan amount'
    },
    {
      id: 'vehicle-value-consistency',
      name: 'Vehicle Value Consistency',
      category: 'consistency',
      severity: 'info',
      field: 'vehicle_value_at_origination,loan_amount',
      condition: 'loan_amount <= vehicle_value_at_origination * 1.2',
      message: 'Loan amount typically should not exceed 120% of vehicle value'
    },

    // Compliance Rules
    {
      id: 'pcaf-minimum-data',
      name: 'PCAF Minimum Data Requirements',
      category: 'compliance',
      severity: 'error',
      field: 'fuel_type,vehicle_type',
      condition: 'NOT NULL',
      message: 'Fuel type and vehicle type are required for PCAF compliance'
    }
  ];

  // Comprehensive Portfolio Validation
  async validatePortfolio(userId?: string): Promise<ComprehensiveValidationReport> {
    try {
      // Get all loans for validation
      let query = supabase.from('loans').select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: loans, error } = await query;
      if (error) throw error;

      const validationResults: ValidationResult[] = [];
      const pcafAssessments: any[] = [];
      
      // Validate each loan
      for (const loan of loans || []) {
        const loanResults = await this.validateLoan(loan);
        validationResults.push(...loanResults);

        // Assess PCAF compliance
        const pcafInput: LoanDataQualityInput = {
          loan_id: loan.loan_id,
          vehicle_make: loan.vehicle_make,
          vehicle_model: loan.vehicle_model,
          vehicle_category: loan.vehicle_type || 'passenger_car',
          fuel_type: loan.fuel_type || 'gasoline',
          estimated_distance_km_year: loan.annual_mileage ? loan.annual_mileage * 1.60934 : undefined, // Convert miles to km
          distance_data_source: loan.annual_mileage ? 'primary' : 'regional_statistical',
          fuel_consumption_source: loan.efficiency_mpg ? 'estimated_specific' : 'estimated_average',
          reporting_date: new Date().toISOString(),
          loan_origination_date: loan.origination_date,
          country: 'US',
          region: 'North America'
        };

        const pcafResult = PCAFDataQualityEngine.determinePCAFOption(pcafInput);
        pcafAssessments.push({
          loanId: loan.loan_id,
          outstandingBalance: loan.outstanding_balance,
          ...pcafResult
        });
      }

      // Calculate PCAF compliance metrics
      const pcafCompliance = this.calculatePCAFCompliance(pcafAssessments);
      
      // Calculate data completeness
      const dataCompleteness = this.calculateDataCompleteness(loans || []);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(validationResults, pcafCompliance, dataCompleteness);
      
      // Generate action items
      const actionItems = this.generateActionItems(validationResults, loans || []);

      // Calculate overall score
      const overallScore = this.calculateOverallScore(pcafCompliance, dataCompleteness, validationResults);

      return {
        portfolioId: userId || 'global',
        reportDate: new Date().toISOString(),
        overallScore,
        totalLoans: loans?.length || 0,
        validationResults,
        pcafCompliance,
        dataCompleteness,
        recommendations,
        actionItems
      };

    } catch (error) {
      throw new Error(`Portfolio validation failed: ${error}`);
    }
  }

  // Individual Loan Validation
  async validateLoan(loan: any): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const rule of this.validationRules) {
      const result = await this.applyValidationRule(loan, rule);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  private async applyValidationRule(loan: any, rule: ValidationRule): Promise<ValidationResult | null> {
    const fields = rule.field.split(',');
    let passed = true;
    let message = rule.message;
    let currentValue: any = {};

    // Extract field values
    for (const field of fields) {
      currentValue[field] = loan[field.trim()];
    }

    // Apply validation logic based on rule
    switch (rule.id) {
      case 'complete-vehicle-info':
        passed = !!(loan.vehicle_make && loan.vehicle_model && loan.vehicle_year);
        break;
      case 'fuel-efficiency-present':
        passed = !!(loan.efficiency_mpg && loan.efficiency_mpg > 0);
        break;
      case 'annual-mileage-present':
        passed = !!(loan.annual_mileage && loan.annual_mileage > 0);
        break;
      case 'reasonable-fuel-efficiency':
        passed = loan.efficiency_mpg >= 5 && loan.efficiency_mpg <= 100;
        break;
      case 'reasonable-mileage':
        passed = loan.annual_mileage >= 1000 && loan.annual_mileage <= 100000;
        break;
      case 'valid-vehicle-year':
        passed = loan.vehicle_year >= 1990 && loan.vehicle_year <= 2025;
        break;
      case 'loan-amount-consistency':
        passed = !loan.outstanding_balance || !loan.loan_amount || loan.outstanding_balance <= loan.loan_amount;
        break;
      case 'vehicle-value-consistency':
        passed = !loan.loan_amount || !loan.vehicle_value_at_origination || 
                 loan.loan_amount <= loan.vehicle_value_at_origination * 1.2;
        break;
      case 'pcaf-minimum-data':
        passed = !!(loan.fuel_type && loan.vehicle_type);
        break;
    }

    // Only return results for failed validations or warnings
    if (!passed || rule.severity === 'warning') {
      return {
        ruleId: rule.id,
        loanId: loan.loan_id,
        status: passed ? 'warning' : 'failed',
        message,
        currentValue,
        suggestedValue: this.getSuggestedValue(rule, loan),
        autoFixed: false
      };
    }

    return null;
  }

  private getSuggestedValue(rule: ValidationRule, loan: any): any {
    switch (rule.id) {
      case 'reasonable-fuel-efficiency':
        if (loan.efficiency_mpg < 5) return 25; // Reasonable default
        if (loan.efficiency_mpg > 100) return 50; // Reasonable default
        break;
      case 'reasonable-mileage':
        if (loan.annual_mileage < 1000) return 12000; // National average
        if (loan.annual_mileage > 100000) return 15000; // Reasonable high value
        break;
      case 'valid-vehicle-year':
        if (loan.vehicle_year < 1990) return 2020; // Recent year
        if (loan.vehicle_year > 2025) return new Date().getFullYear();
        break;
    }
    return undefined;
  }

  // Data Cleansing and Standardization
  async cleanseAndStandardizeData(userId?: string): Promise<DataCleansingResult> {
    const result: DataCleansingResult = {
      processed: 0,
      cleaned: 0,
      fixed: 0,
      errors: 0,
      details: []
    };

    try {
      // Get loans to cleanse
      let query = supabase.from('loans').select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: loans, error } = await query;
      if (error) throw error;

      for (const loan of loans || []) {
        result.processed++;

        try {
          const cleansingActions = await this.processLoanCleansing(loan);
          result.details.push(...cleansingActions);
          
          if (cleansingActions.length > 0) {
            result.cleaned++;
            
            // Count fixed items
            const fixedCount = cleansingActions.filter(a => 
              a.action === 'corrected' || a.action === 'standardized'
            ).length;
            result.fixed += fixedCount;
          }

        } catch (error) {
          result.errors++;
        }
      }

    } catch (error) {
      throw new Error(`Data cleansing failed: ${error}`);
    }

    return result;
  }

  private async processLoanCleansing(loan: any): Promise<Array<{
    loanId: string;
    field: string;
    action: 'standardized' | 'corrected' | 'enriched' | 'flagged';
    before: any;
    after: any;
    confidence: number;
  }>> {
    const actions = [];
    const updates: any = {};

    // Standardize fuel type
    if (loan.fuel_type) {
      const standardizedFuelType = this.standardizeFuelType(loan.fuel_type);
      if (standardizedFuelType !== loan.fuel_type) {
        actions.push({
          loanId: loan.loan_id,
          field: 'fuel_type',
          action: 'standardized' as const,
          before: loan.fuel_type,
          after: standardizedFuelType,
          confidence: 0.95
        });
        updates.fuel_type = standardizedFuelType;
      }
    }

    // Standardize vehicle type
    if (loan.vehicle_type) {
      const standardizedVehicleType = this.standardizeVehicleType(loan.vehicle_type);
      if (standardizedVehicleType !== loan.vehicle_type) {
        actions.push({
          loanId: loan.loan_id,
          field: 'vehicle_type',
          action: 'standardized' as const,
          before: loan.vehicle_type,
          after: standardizedVehicleType,
          confidence: 0.90
        });
        updates.vehicle_type = standardizedVehicleType;
      }
    }

    // Correct unreasonable values
    if (loan.efficiency_mpg && (loan.efficiency_mpg < 5 || loan.efficiency_mpg > 100)) {
      const correctedEfficiency = this.correctFuelEfficiency(loan);
      if (correctedEfficiency !== loan.efficiency_mpg) {
        actions.push({
          loanId: loan.loan_id,
          field: 'efficiency_mpg',
          action: 'corrected' as const,
          before: loan.efficiency_mpg,
          after: correctedEfficiency,
          confidence: 0.75
        });
        updates.efficiency_mpg = correctedEfficiency;
      }
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('loans')
        .update(updates)
        .eq('loan_id', loan.loan_id);

      if (error) {
        throw error;
      }
    }

    return actions;
  }

  private standardizeFuelType(fuelType: string): string {
    const standardMap: { [key: string]: string } = {
      'gas': 'gasoline',
      'petrol': 'gasoline',
      'diesel': 'diesel',
      'electric': 'electric',
      'hybrid': 'hybrid',
      'plug-in hybrid': 'plug_in_hybrid',
      'ethanol': 'ethanol',
      'natural gas': 'natural_gas',
      'cng': 'natural_gas'
    };

    const lower = fuelType.toLowerCase().trim();
    return standardMap[lower] || fuelType;
  }

  private standardizeVehicleType(vehicleType: string): string {
    const standardMap: { [key: string]: string } = {
      'car': 'passenger_car',
      'sedan': 'passenger_car',
      'coupe': 'passenger_car',
      'hatchback': 'passenger_car',
      'truck': 'pickup_truck',
      'pickup': 'pickup_truck',
      'suv': 'suv',
      'crossover': 'suv',
      'van': 'van',
      'minivan': 'van',
      'motorcycle': 'motorcycle'
    };

    const lower = vehicleType.toLowerCase().trim();
    return standardMap[lower] || vehicleType;
  }

  private correctFuelEfficiency(loan: any): number {
    // Use vehicle type and year to estimate reasonable fuel efficiency
    const typeEfficiencyMap: { [key: string]: number } = {
      'passenger_car': 28,
      'suv': 22,
      'pickup_truck': 20,
      'van': 19,
      'motorcycle': 50
    };

    const baseEfficiency = typeEfficiencyMap[loan.vehicle_type] || 25;
    
    // Adjust for vehicle year (newer cars are more efficient)
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - (loan.vehicle_year || 2015);
    const yearAdjustment = Math.max(-5, Math.min(5, yearDiff * 0.5));
    
    return Math.round(baseEfficiency + yearAdjustment);
  }

  // Helper Methods for Report Generation
  private calculatePCAFCompliance(assessments: any[]): any {
    const option1Count = assessments.filter(a => 
      a.option === '1a' || a.option === '1b'
    ).length;
    
    const option2Count = assessments.filter(a => 
      a.option === '2a' || a.option === '2b'
    ).length;
    
    const option3Count = assessments.filter(a => 
      a.option === '3a' || a.option === '3b'
    ).length;

    const averageDataQualityScore = assessments.length > 0 
      ? assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length 
      : 0;

    const compliantPercentage = assessments.length > 0 
      ? ((option1Count + option2Count) / assessments.length) * 100 
      : 0;

    return {
      option1Count,
      option2Count,
      option3Count,
      averageDataQualityScore,
      compliantPercentage
    };
  }

  private calculateDataCompleteness(loans: any[]): any {
    const completeRecords = loans.filter(loan => 
      loan.vehicle_make && loan.vehicle_model && loan.vehicle_year &&
      loan.fuel_type && loan.efficiency_mpg && loan.annual_mileage
    ).length;

    const missingDataPercentage = loans.length > 0 
      ? ((loans.length - completeRecords) / loans.length) * 100 
      : 0;

    // Identify critical missing fields
    const fieldCounts = {
      vehicle_make: loans.filter(l => !l.vehicle_make).length,
      vehicle_model: loans.filter(l => !l.vehicle_model).length,
      fuel_type: loans.filter(l => !l.fuel_type).length,
      efficiency_mpg: loans.filter(l => !l.efficiency_mpg).length,
      annual_mileage: loans.filter(l => !l.annual_mileage).length
    };

    const criticalMissingFields = Object.entries(fieldCounts)
      .filter(([_, count]) => count > loans.length * 0.25) // Missing in >25% of loans
      .map(([field, _]) => field);

    return {
      completeRecords,
      missingDataPercentage,
      criticalMissingFields
    };
  }

  private generateRecommendations(validationResults: ValidationResult[], pcafCompliance: any, dataCompleteness: any): string[] {
    const recommendations = [];

    if (dataCompleteness.missingDataPercentage > 50) {
      recommendations.push('Implement systematic data collection processes - over 50% of loans have incomplete data');
    }

    if (pcafCompliance.compliantPercentage < 70) {
      recommendations.push('Focus on improving PCAF compliance - less than 70% of loans meet quality standards');
    }

    const errorCount = validationResults.filter(r => r.status === 'failed').length;
    if (errorCount > 0) {
      recommendations.push(`Address ${errorCount} data quality errors to improve calculation accuracy`);
    }

    if (dataCompleteness.criticalMissingFields.length > 0) {
      recommendations.push(`Prioritize collecting: ${dataCompleteness.criticalMissingFields.join(', ')}`);
    }

    return recommendations;
  }

  private generateActionItems(validationResults: ValidationResult[], loans: any[]): any[] {
    const actionItems = [];

    // High priority: Data quality errors
    const errorCount = validationResults.filter(r => r.status === 'failed').length;
    if (errorCount > 0) {
      actionItems.push({
        priority: 'high' as const,
        category: 'Data Quality',
        description: 'Fix data validation errors',
        affectedLoans: errorCount,
        estimatedImpact: 'Immediate improvement in calculation accuracy'
      });
    }

    // Medium priority: Missing vehicle data
    const missingVehicleData = loans.filter(l => !l.vehicle_make || !l.vehicle_model).length;
    if (missingVehicleData > 0) {
      actionItems.push({
        priority: 'medium' as const,
        category: 'Data Enrichment',
        description: 'Collect missing vehicle information',
        affectedLoans: missingVehicleData,
        estimatedImpact: 'Upgrade to higher PCAF option levels'
      });
    }

    // Low priority: Efficiency data
    const missingEfficiency = loans.filter(l => !l.efficiency_mpg).length;
    if (missingEfficiency > 0) {
      actionItems.push({
        priority: 'low' as const,
        category: 'Data Enhancement',
        description: 'Obtain fuel efficiency ratings',
        affectedLoans: missingEfficiency,
        estimatedImpact: 'Enhanced calculation precision'
      });
    }

    return actionItems;
  }

  private calculateOverallScore(pcafCompliance: any, dataCompleteness: any, validationResults: ValidationResult[]): number {
    const pcafScore = Math.min(100, (pcafCompliance.compliantPercentage / 100) * 100);
    const completenessScore = Math.min(100, ((100 - dataCompleteness.missingDataPercentage) / 100) * 100);
    const errorScore = Math.max(0, 100 - (validationResults.filter(r => r.status === 'failed').length * 5));

    return Math.round((pcafScore + completenessScore + errorScore) / 3);
  }
}

export const dataQualityValidationService = new DataQualityValidationService();