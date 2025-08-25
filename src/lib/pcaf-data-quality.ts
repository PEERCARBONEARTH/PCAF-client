/**
 * PCAF Data Quality Standards Implementation
 * Implements the PCAF Global GHG Accounting and Reporting Standard
 * for Motor Vehicle Loans data quality assessment
 */

// PCAF Option and Data Quality Types
export type PCAFOption = '1a' | '1b' | '2a' | '2b' | '3a' | '3b';

export interface PCAFDataDrivers {
  actual_fuel_consumption: boolean;
  actual_distance_traveled: boolean;
  vehicle_make_model_known: boolean;
  distance_data_source: 'primary' | 'local_statistical' | 'regional_statistical' | 'unknown';
  vehicle_efficiency_known: boolean;
  fuel_consumption_data_type: 'measured' | 'estimated_specific' | 'estimated_average';
  temporal_data_available: boolean;
}

export interface PCAFAssessmentResult {
  option: PCAFOption;
  data_quality_score: number;
  data_quality_drivers: string[];
  compliant: boolean;
  description: string;
  methodology: string;
}

export interface LoanDataQualityInput {
  // Required PCAF fields
  loan_id: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_category: string;
  fuel_type: string;
  
  // Data quality indicators
  actual_fuel_consumption?: number; // For Option 1a
  actual_distance_traveled?: number; // For Option 1b
  vehicle_efficiency_kwh_100km?: number; // For electric vehicles
  estimated_distance_km_year?: number;
  
  // Data sources
  distance_data_source?: 'primary' | 'local_statistical' | 'regional_statistical';
  fuel_consumption_source?: 'measured' | 'estimated_specific' | 'estimated_average';
  
  // Temporal data
  loan_origination_date?: string;
  reporting_date: string;
  
  // Regional context
  country?: string;
  region?: string;
}

/**
 * PCAF Option Determination Logic
 * Based on PCAF Global Standard Box 8 requirements
 */
export class PCAFDataQualityEngine {
  
  /**
   * Determines the PCAF option based on available data
   */
  static determinePCAFOption(input: LoanDataQualityInput): PCAFAssessmentResult {
    const drivers: string[] = [];
    let option: PCAFOption;
    let score: number;
    let description: string;
    let methodology: string;
    
    // Check data availability
    const hasActualFuelConsumption = !!input.actual_fuel_consumption;
    const hasActualDistance = !!input.actual_distance_traveled;
    const hasVehicleMakeModel = !!(input.vehicle_make && input.vehicle_model);
    const hasVehicleEfficiency = !!input.vehicle_efficiency_kwh_100km;
    const hasTemporalData = !!(input.loan_origination_date && input.reporting_date);
    const distanceSource = input.distance_data_source || 'unknown';
    
    // Option 1a: Actual vehicle-specific emissions from fuel consumption
    if (hasActualFuelConsumption && hasVehicleMakeModel) {
      option = '1a';
      score = 1;
      description = "Vehicle emissions calculated based on primary data on actual vehicle fuel consumption";
      methodology = "Measured fuel consumption × emission factor for specific vehicle";
      drivers.push(
        'Actual fuel consumption data available',
        'Vehicle make and model known',
        'Highest data quality - measured consumption'
      );
    }
    // Option 1b: Vehicle efficiency + actual distance traveled
    else if (hasVehicleMakeModel && hasActualDistance && (hasVehicleEfficiency || input.fuel_type !== 'electric')) {
      option = '1b';
      score = 1;
      description = "Vehicle emissions calculated based on vehicle efficiency and actual distance traveled";
      methodology = "Vehicle efficiency × actual distance traveled × emission factor";
      drivers.push(
        'Vehicle make and model known',
        'Actual distance traveled available',
        'Vehicle efficiency data available'
      );
    }
    // Option 2a: Vehicle efficiency + local statistical distance
    else if (hasVehicleMakeModel && distanceSource === 'local_statistical') {
      option = '2a';
      score = 2;
      description = "Vehicle emissions calculated based on vehicle efficiency and local statistical distance data";
      methodology = "Vehicle efficiency × local average distance × emission factor";
      drivers.push(
        'Vehicle make and model known',
        'Local statistical distance data used',
        'Vehicle-specific efficiency available'
      );
    }
    // Option 2b: Vehicle efficiency + regional statistical distance
    else if (hasVehicleMakeModel && distanceSource === 'regional_statistical') {
      option = '2b';
      score = 2;
      description = "Vehicle emissions calculated based on vehicle efficiency and regional statistical distance data";
      methodology = "Vehicle efficiency × regional average distance × emission factor";
      drivers.push(
        'Vehicle make and model known',
        'Regional statistical distance data used',
        'Vehicle-specific efficiency available'
      );
    }
    // Option 3a: Vehicle type known + statistical distance
    else if (input.vehicle_category && (distanceSource === 'local_statistical' || distanceSource === 'regional_statistical')) {
      option = '3a';
      score = 3;
      description = "Vehicle emissions calculated based on vehicle type and statistical distance data";
      methodology = "Vehicle type average efficiency × statistical distance × emission factor";
      drivers.push(
        'Vehicle type/category known',
        'Vehicle make and model unknown',
        'Statistical distance data used'
      );
    }
    // Option 3b: Average vehicle assumptions
    else {
      option = '3b';
      score = 4;
      description = "Vehicle emissions calculated based on average vehicle assumptions";
      methodology = "Average vehicle efficiency × estimated distance × average emission factor";
      drivers.push(
        'Limited vehicle data available',
        'Average assumptions used',
        'Lowest data quality'
      );
    }
    
    // Adjust score for mixed options or data limitations
    if (!hasTemporalData) {
      score = Math.max(score, 4);
      drivers.push('Temporal attribution limited - no origination date');
    }
    
    if (input.estimated_distance_km_year === 15000 && !hasActualDistance) {
      score = Math.max(score, 3);
      drivers.push('Default distance assumption used (15,000 km/year)');
    }
    
    // Apply PCAF mixed option rule - use highest (worst) score
    const finalScore = Math.min(score, 5);
    const compliant = finalScore <= 3; // PCAF recommends quality score ≤ 3
    
    return {
      option,
      data_quality_score: finalScore,
      data_quality_drivers: drivers,
      compliant,
      description,
      methodology
    };
  }
  
  /**
   * Get detailed explanation for each PCAF option
   */
  static getPCAFOptionDetails(option: PCAFOption): {
    name: string;
    description: string;
    requirements: string[];
    score_range: number[];
  } {
    const options = {
      '1a': {
        name: 'Option 1a: Actual Fuel Consumption',
        description: 'Vehicle emissions calculated based on primary data on actual vehicle fuel consumption',
        requirements: [
          'Actual vehicle fuel consumption data',
          'Known vehicle make and model',
          'Direct measurement from borrower'
        ],
        score_range: [1, 1]
      },
      '1b': {
        name: 'Option 1b: Vehicle Efficiency + Actual Distance',
        description: 'Vehicle emissions calculated based on vehicle efficiency and actual distance traveled',
        requirements: [
          'Vehicle efficiency and fuel type from known make/model',
          'Primary data for actual vehicle distance traveled',
          'Known vehicle characteristics'
        ],
        score_range: [1, 1]
      },
      '2a': {
        name: 'Option 2a: Vehicle Efficiency + Local Statistical Distance',
        description: 'Vehicle emissions calculated based on vehicle efficiency and local statistical distance data',
        requirements: [
          'Vehicle efficiency and fuel type from known make/model',
          'Estimated distance from local statistical data',
          'Regional data availability'
        ],
        score_range: [2, 2]
      },
      '2b': {
        name: 'Option 2b: Vehicle Efficiency + Regional Statistical Distance',
        description: 'Vehicle emissions calculated based on vehicle efficiency and regional statistical distance data',
        requirements: [
          'Vehicle efficiency and fuel type from known make/model',
          'Estimated distance from regional statistical data',
          'Broader regional averages used'
        ],
        score_range: [2, 2]
      },
      '3a': {
        name: 'Option 3a: Vehicle Type + Statistical Distance',
        description: 'Vehicle emissions calculated based on vehicle type and statistical distance data',
        requirements: [
          'Vehicle type known (make/model unknown)',
          'Vehicle efficiency from type averages',
          'Statistical distance data'
        ],
        score_range: [3, 3]
      },
      '3b': {
        name: 'Option 3b: Average Vehicle Assumptions',
        description: 'Vehicle emissions calculated based on average vehicle assumptions',
        requirements: [
          'Vehicle type may be unknown',
          'Average vehicle efficiency used',
          'Estimated distance from general assumptions'
        ],
        score_range: [4, 5]
      }
    };
    
    return options[option];
  }
  
  /**
   * Validate data completeness for target PCAF option
   */
  static validateForTargetOption(input: LoanDataQualityInput, targetOption: PCAFOption): {
    valid: boolean;
    missing_requirements: string[];
    recommendations: string[];
  } {
    const missing: string[] = [];
    const recommendations: string[] = [];
    
    const optionDetails = this.getPCAFOptionDetails(targetOption);
    
    switch (targetOption) {
      case '1a':
        if (!input.actual_fuel_consumption) missing.push('Actual fuel consumption data');
        if (!input.vehicle_make || !input.vehicle_model) missing.push('Vehicle make and model');
        break;
        
      case '1b':
        if (!input.actual_distance_traveled) missing.push('Actual distance traveled');
        if (!input.vehicle_make || !input.vehicle_model) missing.push('Vehicle make and model');
        if (input.fuel_type === 'electric' && !input.vehicle_efficiency_kwh_100km) {
          missing.push('Vehicle efficiency (kWh/100km) for electric vehicle');
        }
        break;
        
      case '2a':
      case '2b':
        if (!input.vehicle_make || !input.vehicle_model) missing.push('Vehicle make and model');
        if (!input.distance_data_source) {
          missing.push('Statistical distance data source');
        }
        break;
        
      case '3a':
        if (!input.vehicle_category) missing.push('Vehicle category/type');
        break;
        
      case '3b':
        // No specific requirements - this is the fallback option
        recommendations.push('Consider collecting vehicle type data to improve to Option 3a');
        break;
    }
    
    // General recommendations
    if (!input.loan_origination_date) {
      recommendations.push('Add loan origination date for proper temporal attribution');
    }
    
    if (input.estimated_distance_km_year === 15000) {
      recommendations.push('Collect actual distance data to improve data quality');
    }
    
    return {
      valid: missing.length === 0,
      missing_requirements: missing,
      recommendations
    };
  }
  
  /**
   * Get data quality level description
   */
  static getDataQualityDescription(score: number): {
    level: string;
    color: string;
    description: string;
    compliance: 'excellent' | 'good' | 'acceptable' | 'needs-improvement' | 'poor';
  } {
    const levels = {
      1: {
        level: 'Level 1 - Verified Actual',
        color: 'text-green-600',
        description: 'Asset-specific measured data with high confidence',
        compliance: 'excellent' as const
      },
      2: {
        level: 'Level 2 - Partially Verified',
        color: 'text-blue-600',
        description: 'Mix of asset-specific and statistical data',
        compliance: 'good' as const
      },
      3: {
        level: 'Level 3 - Estimated Proxy',
        color: 'text-yellow-600',
        description: 'Representative proxy data with reasonable confidence',
        compliance: 'acceptable' as const
      },
      4: {
        level: 'Level 4 - Estimated Average',
        color: 'text-orange-600',
        description: 'Average proxy data with limited confidence',
        compliance: 'needs-improvement' as const
      },
      5: {
        level: 'Level 5 - Very Estimated',
        color: 'text-red-600',
        description: 'Highly uncertain data with very limited confidence',
        compliance: 'poor' as const
      }
    };
    
    return levels[Math.min(score, 5) as keyof typeof levels] || levels[5];
  }
  
  /**
   * Calculate portfolio-wide data quality metrics
   */
  static calculatePortfolioDataQuality(loans: Array<{ 
    outstanding_balance: number; 
    data_quality_score: number;
    pcaf_option?: PCAFOption;
  }>): {
    wdqs: number; // Weighted Data Quality Score
    compliant_percentage: number;
    option_distribution: Record<PCAFOption, number>;
    recommendations: string[];
  } {
    if (loans.length === 0) {
      return {
        wdqs: 0,
        compliant_percentage: 0,
        option_distribution: {} as Record<PCAFOption, number>,
        recommendations: ['No loans available for assessment']
      };
    }
    
    const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
    
    // Calculate WDQS (loan-weighted data quality score)
    const wdqs = loans.reduce((sum, loan) => {
      return sum + (loan.data_quality_score * loan.outstanding_balance);
    }, 0) / totalOutstanding;
    
    // Calculate compliance percentage
    const compliantLoans = loans.filter(loan => loan.data_quality_score <= 3).length;
    const compliant_percentage = (compliantLoans / loans.length) * 100;
    
    // Option distribution
    const option_distribution: Record<PCAFOption, number> = {
      '1a': 0, '1b': 0, '2a': 0, '2b': 0, '3a': 0, '3b': 0
    };
    
    loans.forEach(loan => {
      if (loan.pcaf_option) {
        option_distribution[loan.pcaf_option]++;
      }
    });
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (wdqs > 3) {
      recommendations.push('Portfolio WDQS exceeds PCAF recommended threshold (≤3). Focus on improving data collection.');
    }
    
    if (compliant_percentage < 80) {
      recommendations.push('Less than 80% of loans meet PCAF compliance. Consider data quality improvement initiatives.');
    }
    
    const level4_5_count = loans.filter(loan => loan.data_quality_score >= 4).length;
    if (level4_5_count > loans.length * 0.2) {
      recommendations.push('More than 20% of loans have poor data quality (Level 4-5). Prioritize data collection for these loans.');
    }
    
    return {
      wdqs: Math.round(wdqs * 100) / 100,
      compliant_percentage: Math.round(compliant_percentage * 10) / 10,
      option_distribution,
      recommendations
    };
  }
}