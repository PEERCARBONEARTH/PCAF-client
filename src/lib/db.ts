import Dexie, { type EntityTable } from 'dexie';

// Enhanced LoanPortfolioItem interface with PCAF-specific calculations
export interface LoanPortfolioItem {
  id?: number;
  loan_id: string;
  instrument_type?: 'loan' | 'lc' | 'guarantee'; // Added to support all instrument types
  loan_amount: number;
  
  // Enhanced PCAF vehicle data
  vehicle_make?: string;
  vehicle_model?: string;
  
  // Enhanced PCAF vehicle classification (with backward compatibility)
  vehicle_category: 'passenger_car' | 'motorcycle' | 'light_commercial_truck' | 'medium_heavy_commercial_truck' | 'recreational_vehicle' | 'bus' | 'snowmobile_atv' | 'boat' | 'yellow_equipment';
  vehicle_type?: string; // Legacy field for backward compatibility
  vehicle_subcategory?: string; // Detailed vehicle classification
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'natural_gas' | 'propane';
  engine_size?: string;
  
  // PCAF lending type classification
  lending_type?: 'consumer' | 'business'; // Optional for backward compatibility
  fleet_id?: string; // For business loans
  fleet_size?: number; // Number of vehicles in fleet
  
  vehicle_value: number;
  estimated_km_per_year?: number;
  estimated_annual_km?: number;
  loan_term_years?: number;
  outstanding_balance: number;
  
  // Economic metrics (optional, for WACI)
  company_revenue?: number; // Annual revenue for the borrower/company
  
  // PCAF Scope calculations
  scope_1_emissions?: number; // Direct fuel combustion
  scope_2_emissions?: number; // Electricity for EVs/hybrids
  scope_3_emissions?: number; // Embodied emissions (new vehicles only)
  
  // PCAF-specific calculations
  attribution_factor: number; // outstanding_balance / vehicle_value
  annual_emissions: number; // Total scope 1 + 2 emissions
  financed_emissions: number; // annual_emissions * attribution_factor
  emission_factor_kg_co2_km: number;
  grid_emission_factor?: number; // For electric vehicles (kg CO2/kWh)
  
  // Enhanced PCAF data quality tracking (1a, 1b, 2a, 2b, 3a, 3b)
  pcaf_data_option?: '1a' | '1b' | '2a' | '2b' | '3a' | '3b';
  data_quality_score: number; // 1-5 PCAF hierarchy
  data_quality_drivers?: string[]; // What drove the quality score
  
  // PCAF data source indicators
  actual_fuel_consumption?: number;
  actual_distance_traveled?: number;
  distance_data_source?: 'primary' | 'local_statistical' | 'regional_statistical';
  fuel_consumption_source?: 'measured' | 'estimated_specific' | 'estimated_average';
  
  // Temporal attribution
  loan_origination_date?: string;
  reporting_date?: string;
  temporal_attribution?: number; // for mid-year loans
  
  // Data quality tracking
  data_source?: string;
  emission_factor_source?: string;
  verification_status: 'unverified' | 'partially_verified' | 'verified';
  
  // Enhanced fields
  pcaf_asset_class: string;
  region?: string;
  country?: string;
  months_remaining?: number;
  
  // New vehicle tracking (for Scope 3)
  is_new_vehicle?: boolean;
  manufacturing_year?: number;
  
  // Exclusion management
  is_excluded?: boolean;
  exclusion_reason?: string;
  
  // Lifecycle events
  early_payoff_date?: string;
  refinance_date?: string;
  default_date?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// Enhanced Emission Factor Database with PCAF-compliant factors
export interface EmissionFactor {
  id?: number;
  vehicle_category?: string; // Updated to match new classification
  vehicle_type?: string; // Legacy field for backward compatibility
  vehicle_subcategory?: string;
  fuel_type: string;
  engine_size_range: string;
  
  // Scope 1 emission factors
  emission_factor_kg_co2_km: number; // kg CO2 per km for scope 1
  
  // Scope 2 factors (for electric/hybrid vehicles)
  electricity_consumption_kwh_km?: number; // kWh per km
  
  data_quality_level: number; // 1-5 PCAF hierarchy
  pcaf_data_option: '1a' | '1b' | '2a' | '2b' | '3a' | '3b';
  geographic_scope: string;
  temporal_scope: string;
  source: string;
  
  // Regional specificity
  country?: string;
  region?: string;
  
  created_at: Date;
}

// Grid emission factors for Scope 2 calculations
export interface GridEmissionFactor {
  id?: number;
  country: string;
  region?: string;
  utility_name?: string;
  emission_factor_kg_co2_kwh: number; // kg CO2 per kWh
  renewable_percentage?: number;
  data_quality_level: number;
  source: string;
  valid_from: Date;
  valid_to?: Date;
  created_at: Date;
}

// PCAF data quality options and criteria
export interface PCAFDataQualityOption {
  id?: number;
  option_code: '1a' | '1b' | '2a' | '2b' | '3a' | '3b';
  option_name: string;
  description: string;
  quality_score: number; // 1-5
  required_data_fields: string[];
  criteria: string;
}

// Portfolio-level calculations and aggregations
export interface PortfolioCalculation {
  id?: number;
  calculation_date: Date;
  total_loans: number;
  total_loan_value: number;
  total_outstanding_balance: number;
  total_financed_emissions: number;
  weighted_avg_data_quality: number;
  
  // Breakdown by categories
  emissions_by_fuel_type: Record<string, number>;
  emissions_by_vehicle_type: Record<string, number>;
  loans_by_data_quality: Record<string, number>;
  
  // Portfolio metrics
  emission_intensity_per_dollar: number; // tonnes CO2 per $ outstanding
  avg_attribution_factor: number;
  
  created_at: Date;
}

// Data validation rules and results
export interface ValidationResult {
  id?: number;
  loan_id: string;
  validation_date: Date;
  validation_rules: Record<string, boolean>;
  errors: string[];
  warnings: string[];
  data_completeness_score: number;
  pcaf_readiness: boolean;
}

// Enhanced database interfaces for amortization and lifecycle management
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

export interface AmortizationSchedule {
  id?: number;
  loan_id: string;
  payment_number: number;
  payment_date: Date;
  payment_amount: number;
  principal_payment: number;
  interest_payment: number;
  remaining_balance: number;
  attribution_factor: number;
  created_at: Date;
}

// IndexedDB database with Dexie
const db = new Dexie('FinancedEmissionsDB') as Dexie & {
  loans: EntityTable<LoanPortfolioItem, 'id'>;
  emission_factors: EntityTable<EmissionFactor, 'id'>;
  grid_emission_factors: EntityTable<GridEmissionFactor, 'id'>;
  pcaf_data_quality_options: EntityTable<PCAFDataQualityOption, 'id'>;
  portfolio_calculations: EntityTable<PortfolioCalculation, 'id'>;
  validation_results: EntityTable<ValidationResult, 'id'>;
  lifecycle_events: EntityTable<LifecycleEvent, 'id'>;
  attribution_history: EntityTable<AttributionHistory, 'id'>;
  amortization_schedules: EntityTable<AmortizationSchedule, 'id'>;
};

// Database schema - updated to version 3 for instrument types
db.version(3).stores({
  loans: '++id, loan_id, instrument_type, vehicle_category, fuel_type, lending_type, outstanding_balance, financed_emissions, data_quality_score, pcaf_data_option, early_payoff_date, refinance_date, default_date, created_at',
  emission_factors: '++id, vehicle_category, fuel_type, engine_size_range, data_quality_level, pcaf_data_option, country, created_at',
  grid_emission_factors: '++id, country, region, emission_factor_kg_co2_kwh, data_quality_level, valid_from, created_at',
  pcaf_data_quality_options: '++id, option_code, quality_score',
  portfolio_calculations: '++id, calculation_date, total_financed_emissions, weighted_avg_data_quality',
  validation_results: '++id, loan_id, validation_date, pcaf_readiness',
  lifecycle_events: '++id, loan_id, event_type, event_date, created_at',
  attribution_history: '++id, loan_id, reporting_date, attribution_factor, created_at',
  amortization_schedules: '++id, loan_id, payment_number, payment_date, created_at'
});

// Seed enhanced emission factors database with comprehensive PCAF vehicle factors
db.on('ready', async () => {
  const emissionFactorsCount = await db.emission_factors.count();
  const gridFactorsCount = await db.grid_emission_factors.count();
  const qualityOptionsCount = await db.pcaf_data_quality_options.count();
  
  // Seed PCAF Data Quality Options
  if (qualityOptionsCount === 0) {
    await db.pcaf_data_quality_options.bulkAdd([
      {
        option_code: '1a',
        option_name: 'Verified Actual - Vehicle Specific',
        description: 'Actual fuel consumption + vehicle-specific emission factor',
        quality_score: 1,
        required_data_fields: ['actual_fuel_consumption', 'vehicle_specific_emission_factor'],
        criteria: 'Asset-specific measured data'
      },
      {
        option_code: '1b',
        option_name: 'Partially Verified - Known Vehicle',
        description: 'Known vehicle specifications + actual km/year',
        quality_score: 1,
        required_data_fields: ['vehicle_make_model', 'actual_annual_km'],
        criteria: 'Known vehicle with actual distance data'
      },
      {
        option_code: '2a',
        option_name: 'Estimated - Statistical km/year',
        description: 'Statistical km/year + known vehicle specifications',
        quality_score: 2,
        required_data_fields: ['vehicle_specifications', 'statistical_annual_km'],
        criteria: 'Representative proxy data with statistical distance'
      },
      {
        option_code: '2b',
        option_name: 'Estimated - Known Vehicle Type',
        description: 'Known vehicle type + statistical data',
        quality_score: 2,
        required_data_fields: ['vehicle_type', 'statistical_data'],
        criteria: 'Known vehicle type with proxy data'
      },
      {
        option_code: '3a',
        option_name: 'Proxy - Vehicle Category',
        description: 'Vehicle category + average proxy data',
        quality_score: 3,
        required_data_fields: ['vehicle_category', 'average_proxy_data'],
        criteria: 'Vehicle category with average data'
      },
      {
        option_code: '3b',
        option_name: 'Proxy - Assumed Average',
        description: 'Assumed vehicle type or average vehicle data',
        quality_score: 4,
        required_data_fields: ['assumed_vehicle_data'],
        criteria: 'Highly uncertain proxy data'
      }
    ]);
  }
  
  // Seed comprehensive emission factors for all PCAF vehicle types
  if (emissionFactorsCount === 0) {
    await db.emission_factors.bulkAdd([
      // Passenger Cars
      {
        vehicle_category: 'passenger_car',
        fuel_type: 'gasoline',
        engine_size_range: '1.0-1.5L',
        emission_factor_kg_co2_km: 0.12,
        data_quality_level: 3,
        pcaf_data_option: '3a',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IPCC 2019 Guidelines',
        created_at: new Date()
      },
      {
        vehicle_category: 'passenger_car',
        fuel_type: 'gasoline',
        engine_size_range: '1.5-2.0L',
        emission_factor_kg_co2_km: 0.15,
        data_quality_level: 3,
        pcaf_data_option: '3a',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IPCC 2019 Guidelines',
        created_at: new Date()
      },
      {
        vehicle_category: 'passenger_car',
        fuel_type: 'diesel',
        engine_size_range: '1.5-2.0L',
        emission_factor_kg_co2_km: 0.13,
        data_quality_level: 3,
        pcaf_data_option: '3a',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IPCC 2019 Guidelines',
        created_at: new Date()
      },
      {
        vehicle_category: 'passenger_car',
        fuel_type: 'electric',
        engine_size_range: 'all',
        emission_factor_kg_co2_km: 0.05,
        electricity_consumption_kwh_km: 0.15,
        data_quality_level: 4,
        pcaf_data_option: '3b',
        geographic_scope: 'global_average',
        temporal_scope: '2023',
        source: 'IEA Global EV Outlook 2023',
        created_at: new Date()
      },
      {
        vehicle_category: 'passenger_car',
        fuel_type: 'hybrid',
        engine_size_range: 'all',
        emission_factor_kg_co2_km: 0.08,
        data_quality_level: 3,
        pcaf_data_option: '3a',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'ICCT 2023',
        created_at: new Date()
      },
      
      // Motorcycles
      {
        vehicle_category: 'motorcycle',
        fuel_type: 'gasoline',
        engine_size_range: '125-400cc',
        emission_factor_kg_co2_km: 0.07,
        data_quality_level: 4,
        pcaf_data_option: '3b',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IPCC 2019 Guidelines',
        created_at: new Date()
      },
      
      // Light Commercial Trucks (e.g., vans)
      {
        vehicle_category: 'light_commercial_truck',
        fuel_type: 'diesel',
        engine_size_range: '2.0-3.0L',
        emission_factor_kg_co2_km: 0.18,
        data_quality_level: 3,
        pcaf_data_option: '3a',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IPCC 2019 Guidelines',
        created_at: new Date()
      },
      
      // Medium/Heavy Commercial Trucks
      {
        vehicle_category: 'medium_heavy_commercial_truck',
        fuel_type: 'diesel',
        engine_size_range: '6.0L+',
        emission_factor_kg_co2_km: 0.35,
        data_quality_level: 3,
        pcaf_data_option: '3a',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IPCC 2019 Guidelines',
        created_at: new Date()
      },
      
      // Buses
      {
        vehicle_category: 'bus',
        fuel_type: 'diesel',
        engine_size_range: '8.0L+',
        emission_factor_kg_co2_km: 0.85,
        data_quality_level: 3,
        pcaf_data_option: '3a',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IPCC 2019 Guidelines',
        created_at: new Date()
      },
      
      // Recreational Vehicles
      {
        vehicle_category: 'recreational_vehicle',
        fuel_type: 'gasoline',
        engine_size_range: '3.0L+',
        emission_factor_kg_co2_km: 0.25,
        data_quality_level: 4,
        pcaf_data_option: '3b',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'EPA 2023',
        created_at: new Date()
      },
      
      // Boats
      {
        vehicle_category: 'boat',
        fuel_type: 'gasoline',
        engine_size_range: 'outboard',
        emission_factor_kg_co2_km: 0.45,
        data_quality_level: 4,
        pcaf_data_option: '3b',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IMO 2023',
        created_at: new Date()
      },
      
      // Yellow Equipment (Construction/Mining)
      {
        vehicle_category: 'yellow_equipment',
        fuel_type: 'diesel',
        engine_size_range: '10.0L+',
        emission_factor_kg_co2_km: 1.2,
        data_quality_level: 4,
        pcaf_data_option: '3b',
        geographic_scope: 'global',
        temporal_scope: '2023',
        source: 'IPCC 2019 Guidelines',
        created_at: new Date()
      }
    ]);
  }
  
  // Seed grid emission factors for Scope 2 calculations
  if (gridFactorsCount === 0) {
    await db.grid_emission_factors.bulkAdd([
      {
        country: 'Global Average',
        emission_factor_kg_co2_kwh: 0.47,
        data_quality_level: 4,
        source: 'IEA World Energy Outlook 2023',
        valid_from: new Date('2023-01-01'),
        created_at: new Date()
      },
      {
        country: 'United States',
        emission_factor_kg_co2_kwh: 0.386,
        renewable_percentage: 22,
        data_quality_level: 2,
        source: 'EPA eGRID 2023',
        valid_from: new Date('2023-01-01'),
        created_at: new Date()
      },
      {
        country: 'European Union',
        emission_factor_kg_co2_kwh: 0.276,
        renewable_percentage: 42,
        data_quality_level: 2,
        source: 'European Environment Agency 2023',
        valid_from: new Date('2023-01-01'),
        created_at: new Date()
      },
      {
        country: 'China',
        emission_factor_kg_co2_kwh: 0.555,
        renewable_percentage: 31,
        data_quality_level: 3,
        source: 'NCSC China 2023',
        valid_from: new Date('2023-01-01'),
        created_at: new Date()
      },
      {
        country: 'India',
        emission_factor_kg_co2_kwh: 0.708,
        renewable_percentage: 11,
        data_quality_level: 3,
        source: 'CEA India 2023',
        valid_from: new Date('2023-01-01'),
        created_at: new Date()
      }
    ]);
  }
});

export { db };