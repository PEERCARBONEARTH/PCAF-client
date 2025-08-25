// TODO: Replace with MongoDB-based PCAF calculation engine

export interface VehicleData {
  make: string;
  model: string;
  year: number;
  type: 'passenger_car' | 'light_truck' | 'suv' | 'motorcycle' | 'commercial_vehicle';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'plug_in_hybrid' | 'natural_gas';
  value_at_origination: number;
  efficiency_mpg?: number;
  annual_mileage?: number;
}

export interface LoanData {
  loan_id: string;
  borrower_name: string;
  loan_amount: number;
  outstanding_balance: number;
  interest_rate: number;
  term_months: number;
  origination_date: string;
  vehicle_details: VehicleData;
}

export interface PCAFCalculationResult {
  loan_id: string;
  calculation_date: string;
  methodology: 'motor_vehicle_loans';
  data_option: '1a' | '1b' | '2a' | '2b' | '3a' | '3b';
  inputs: {
    outstanding_balance: number;
    vehicle_value_at_origination: number;
    vehicle_make_model?: string;
    vehicle_type: string;
    fuel_type: string;
    annual_mileage: number;
    fuel_efficiency: number;
  };
  calculations: {
    attribution_factor: number;
    annual_vehicle_emissions: number;
    financed_emissions: number;
    emission_factor_used: number;
  };
  data_quality: {
    score: number;
    drivers: string[];
    recommendations: string[];
  };
}

export interface EmissionFactor {
  vehicle_type: string;
  fuel_type: string;
  region: string;
  emission_factor_kg_co2e_per_mile: number;
  efficiency_mpg: number;
  data_source: string;
}

export class PCAFCalculationEngine {
  
  /**
   * Calculate attribution factor using PCAF methodology
   * Attribution Factor = Outstanding Amount / Total Vehicle Value at Origination
   */
  static calculateAttributionFactor(outstandingAmount: number, vehicleValue: number): number {
    if (vehicleValue <= 0) {
      throw new Error('Vehicle value must be greater than 0');
    }
    return Math.min(outstandingAmount / vehicleValue, 1.0);
  }

  /**
   * Get emission factor for vehicle type and fuel type
   */
  static async getEmissionFactor(vehicleType: string, fuelType: string, region = 'US'): Promise<EmissionFactor | null> {
    try {
      const { data, error } = await supabase
        .from('emission_factors')
        .select('*')
        .eq('vehicle_type', vehicleType)
        .eq('fuel_type', fuelType)
        .eq('region', region)
        .order('effective_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching emission factor:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getEmissionFactor:', error);
      return null;
    }
  }

  /**
   * Calculate vehicle emissions using PCAF options
   */
  static async calculateVehicleEmissions(vehicleData: VehicleData): Promise<{
    annual_emissions: number;
    emission_factor: number;
    data_option: string;
  }> {
    // Get emission factor from database
    const emissionFactor = await this.getEmissionFactor(vehicleData.type, vehicleData.fuel_type);
    
    if (!emissionFactor) {
      throw new Error(`No emission factor found for ${vehicleData.type} ${vehicleData.fuel_type}`);
    }

    let annual_emissions: number;
    let data_option: string;
    
    // PCAF Option 1a: Actual vehicle-specific emissions (best data quality)
    if (vehicleData.efficiency_mpg && vehicleData.annual_mileage) {
      // Use actual vehicle efficiency and mileage
      annual_emissions = (vehicleData.annual_mileage / vehicleData.efficiency_mpg) * emissionFactor.emission_factor_kg_co2e_per_mile;
      data_option = '1a';
    }
    // PCAF Option 1b: Vehicle efficiency with estimated mileage
    else if (vehicleData.efficiency_mpg) {
      // Use actual efficiency but estimated mileage based on vehicle type
      const estimatedMileage = this.getEstimatedAnnualMileage(vehicleData.type);
      annual_emissions = (estimatedMileage / vehicleData.efficiency_mpg) * emissionFactor.emission_factor_kg_co2e_per_mile;
      data_option = '1b';
    }
    // PCAF Option 2a: Vehicle-specific data with statistical estimates
    else if (vehicleData.make && vehicleData.model && vehicleData.year) {
      // Use vehicle-specific averages based on make/model/year
      const efficiency = emissionFactor.efficiency_mpg || this.getVehicleEfficiency(vehicleData);
      const mileage = vehicleData.annual_mileage || this.getEstimatedAnnualMileage(vehicleData.type);
      annual_emissions = (mileage / efficiency) * emissionFactor.emission_factor_kg_co2e_per_mile;
      data_option = '2a';
    }
    // PCAF Option 2b: Vehicle type averages with statistical data
    else {
      // Use vehicle type averages
      const efficiency = emissionFactor.efficiency_mpg || 25; // Default efficiency
      const mileage = this.getEstimatedAnnualMileage(vehicleData.type);
      annual_emissions = (mileage / efficiency) * emissionFactor.emission_factor_kg_co2e_per_mile;
      data_option = '2b';
    }

    // Convert kg to tonnes
    annual_emissions = annual_emissions / 1000;

    return {
      annual_emissions,
      emission_factor: emissionFactor.emission_factor_kg_co2e_per_mile,
      data_option
    };
  }

  /**
   * Assess data quality according to PCAF methodology
   */
  static assessDataQuality(vehicleData: VehicleData, dataOption: string): {
    score: number;
    drivers: string[];
    recommendations: string[];
  } {
    let score = 1;
    const drivers: string[] = [];
    const recommendations: string[] = [];

    // Base score on PCAF data option
    switch (dataOption) {
      case '1a':
        score = 5;
        drivers.push('Actual vehicle-specific data available');
        break;
      case '1b':
        score = 4;
        drivers.push('Vehicle efficiency known, mileage estimated');
        recommendations.push('Collect actual annual mileage data');
        break;
      case '2a':
        score = 3;
        drivers.push('Vehicle-specific estimates used');
        recommendations.push('Collect actual efficiency and mileage data');
        break;
      case '2b':
        score = 2;
        drivers.push('Vehicle type averages used');
        recommendations.push('Collect vehicle-specific data');
        break;
      default:
        score = 1;
        drivers.push('Limited data available');
        recommendations.push('Improve data collection processes');
    }

    // Adjust score based on data completeness
    if (vehicleData.make && vehicleData.model) {
      drivers.push('Vehicle make/model known');
    } else {
      score = Math.max(score - 1, 1);
      recommendations.push('Collect vehicle make and model information');
    }

    if (vehicleData.year >= 2020) {
      drivers.push('Recent vehicle model');
    } else if (vehicleData.year < 2010) {
      score = Math.max(score - 1, 1);
      drivers.push('Older vehicle model may have less accurate data');
    }

    return { score: Math.min(score, 5), drivers, recommendations };
  }

  /**
   * Calculate complete PCAF emissions for motor vehicle loan
   */
  static async calculateMotorVehicleEmissions(loanData: LoanData): Promise<PCAFCalculationResult> {
    try {
      // Calculate attribution factor
      const attribution_factor = this.calculateAttributionFactor(
        loanData.outstanding_balance,
        loanData.vehicle_details.value_at_origination
      );

      // Calculate vehicle emissions
      const emissionsResult = await this.calculateVehicleEmissions(loanData.vehicle_details);
      
      // Calculate financed emissions
      const financed_emissions = emissionsResult.annual_emissions * attribution_factor;

      // Assess data quality
      const data_quality = this.assessDataQuality(loanData.vehicle_details, emissionsResult.data_option);

      const result: PCAFCalculationResult = {
        loan_id: loanData.loan_id,
        calculation_date: new Date().toISOString(),
        methodology: 'motor_vehicle_loans',
        data_option: emissionsResult.data_option as any,
        inputs: {
          outstanding_balance: loanData.outstanding_balance,
          vehicle_value_at_origination: loanData.vehicle_details.value_at_origination,
          vehicle_make_model: `${loanData.vehicle_details.make} ${loanData.vehicle_details.model}`,
          vehicle_type: loanData.vehicle_details.type,
          fuel_type: loanData.vehicle_details.fuel_type,
          annual_mileage: loanData.vehicle_details.annual_mileage || this.getEstimatedAnnualMileage(loanData.vehicle_details.type),
          fuel_efficiency: loanData.vehicle_details.efficiency_mpg || this.getVehicleEfficiency(loanData.vehicle_details)
        },
        calculations: {
          attribution_factor,
          annual_vehicle_emissions: emissionsResult.annual_emissions,
          financed_emissions,
          emission_factor_used: emissionsResult.emission_factor
        },
        data_quality
      };

      return result;
    } catch (error) {
      console.error('Error calculating PCAF emissions:', error);
      throw error;
    }
  }

  /**
   * Get estimated annual mileage based on vehicle type
   */
  private static getEstimatedAnnualMileage(vehicleType: string): number {
    const defaults = {
      passenger_car: 12000,
      light_truck: 14000,
      suv: 13000,
      motorcycle: 4000,
      commercial_vehicle: 25000
    };
    return defaults[vehicleType as keyof typeof defaults] || 12000;
  }

  /**
   * Get vehicle efficiency estimate based on vehicle characteristics
   */
  private static getVehicleEfficiency(vehicleData: VehicleData): number {
    // Apply year-based efficiency improvements
    const baseYear = 2010;
    const currentYear = new Date().getFullYear();
    const yearFactor = Math.max(0.8, 1 + (vehicleData.year - baseYear) * 0.02);

    const baseEfficiencies = {
      passenger_car: { gasoline: 25, diesel: 30, electric: 120, hybrid: 45, plug_in_hybrid: 55, natural_gas: 22 },
      light_truck: { gasoline: 20, diesel: 24, electric: 90, hybrid: 35, plug_in_hybrid: 45, natural_gas: 18 },
      suv: { gasoline: 18, diesel: 22, electric: 85, hybrid: 32, plug_in_hybrid: 42, natural_gas: 16 },
      motorcycle: { gasoline: 45, diesel: 50, electric: 150, hybrid: 50, plug_in_hybrid: 55, natural_gas: 40 },
      commercial_vehicle: { gasoline: 12, diesel: 15, electric: 60, hybrid: 18, plug_in_hybrid: 25, natural_gas: 10 }
    };

    const typeEfficiencies = baseEfficiencies[vehicleData.type as keyof typeof baseEfficiencies];
    const baseEfficiency = typeEfficiencies?.[vehicleData.fuel_type as keyof typeof typeEfficiencies] || 25;

    return Math.round(baseEfficiency * yearFactor);
  }

  /**
   * Aggregate portfolio-level emissions
   */
  static async aggregatePortfolioEmissions(userId: string): Promise<{
    total_loans: number;
    total_financed_emissions: number;
    weighted_data_quality_score: number;
    emissions_by_vehicle_type: Record<string, number>;
    emissions_by_fuel_type: Record<string, number>;
  }> {
    try {
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      if (!loans || loans.length === 0) {
        return {
          total_loans: 0,
          total_financed_emissions: 0,
          weighted_data_quality_score: 0,
          emissions_by_vehicle_type: {},
          emissions_by_fuel_type: {}
        };
      }

      const total_loans = loans.length;
      const total_financed_emissions = loans.reduce((sum, loan) => sum + (loan.financed_emissions_tco2e || 0), 0);
      
      // Calculate weighted average data quality score
      const totalBalance = loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
      const weighted_data_quality_score = totalBalance > 0 
        ? loans.reduce((sum, loan) => sum + (loan.data_quality_score || 0) * loan.outstanding_balance, 0) / totalBalance
        : 0;

      // Aggregate by vehicle type
      const emissions_by_vehicle_type: Record<string, number> = {};
      const emissions_by_fuel_type: Record<string, number> = {};

      loans.forEach(loan => {
        const emissions = loan.financed_emissions_tco2e || 0;
        
        emissions_by_vehicle_type[loan.vehicle_type] = 
          (emissions_by_vehicle_type[loan.vehicle_type] || 0) + emissions;
        
        emissions_by_fuel_type[loan.fuel_type] = 
          (emissions_by_fuel_type[loan.fuel_type] || 0) + emissions;
      });

      return {
        total_loans,
        total_financed_emissions,
        weighted_data_quality_score: Math.round(weighted_data_quality_score * 100) / 100,
        emissions_by_vehicle_type,
        emissions_by_fuel_type
      };
    } catch (error) {
      console.error('Error aggregating portfolio emissions:', error);
      throw error;
    }
  }
}