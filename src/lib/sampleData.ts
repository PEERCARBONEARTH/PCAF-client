import { db, type LoanPortfolioItem } from './db';
import { LoansAPI } from '../api/loans';
import { PCAFDataQualityEngine, type LoanDataQualityInput } from './pcaf-data-quality';
import { masterSchoolProjects, portfolioMetrics } from './masterData';

// Sample data generator for financed emissions platform
export class SampleDataGenerator {

  // Generate sample loans matching LoanData interface for modal display
  static generateModalCompatibleSampleLoans(): any[] {
    const loans: any[] = [];
    const now = new Date();

    // Vehicle data for realistic samples
    const vehicleData = [
      { make: 'Toyota', model: 'Camry', type: 'Sedan', fuel: 'gasoline', basePrice: 35000 },
      { make: 'Honda', model: 'Civic', type: 'Sedan', fuel: 'gasoline', basePrice: 28000 },
      { make: 'Ford', model: 'F-150', type: 'Truck', fuel: 'gasoline', basePrice: 45000 },
      { make: 'Tesla', model: 'Model 3', type: 'Sedan', fuel: 'electric', basePrice: 50000 },
      { make: 'BMW', model: 'X5', type: 'SUV', fuel: 'gasoline', basePrice: 65000 },
      { make: 'Chevrolet', model: 'Silverado', type: 'Truck', fuel: 'diesel', basePrice: 48000 },
      { make: 'Nissan', model: 'Leaf', type: 'Hatchback', fuel: 'electric', basePrice: 32000 },
      { make: 'Hyundai', model: 'Tucson', type: 'SUV', fuel: 'hybrid', basePrice: 38000 }
    ];

    const borrowerNames = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
      'Jessica Miller', 'Christopher Moore', 'Ashley Taylor', 'Matthew Anderson', 'Amanda Thomas'
    ];

    for (let i = 1; i <= 50; i++) {
      const vehicle = vehicleData[Math.floor(Math.random() * vehicleData.length)];
      const borrower = borrowerNames[Math.floor(Math.random() * borrowerNames.length)];

      // Loan details
      const loanAmount = vehicle.basePrice * (0.8 + Math.random() * 0.2); // 80-100% of vehicle price
      const monthsElapsed = Math.floor(Math.random() * 36);
      const outstandingBalance = loanAmount * (1 - (monthsElapsed / 60 * 0.8));
      const originationDate = new Date(now.getTime() - (monthsElapsed * 30 * 24 * 60 * 60 * 1000));

      // Vehicle efficiency and emissions
      let mpg = 25;
      let annualMileage = 12000 + Math.random() * 8000;

      switch (vehicle.fuel) {
        case 'electric':
          mpg = 120; // MPGe
          break;
        case 'hybrid':
          mpg = 45;
          break;
        case 'diesel':
          mpg = 30;
          break;
      }

      // Emissions calculations
      const attributionFactor = Math.min(outstandingBalance / vehicle.basePrice, 1);
      let emissionFactor = 0.4; // kg CO2/mile for gasoline

      switch (vehicle.fuel) {
        case 'electric':
          emissionFactor = 0.1;
          break;
        case 'hybrid':
          emissionFactor = 0.2;
          break;
        case 'diesel':
          emissionFactor = 0.35;
          break;
      }

      const annualEmissions = (annualMileage * emissionFactor) / 1000; // tonnes CO2
      const financedEmissions = annualEmissions * attributionFactor;

      // Data quality assessment
      const dataQualityScore = 2 + Math.random() * 3; // 2-5 range
      const pcafOption = dataQualityScore >= 4 ? 'Option 1' : dataQualityScore >= 3 ? 'Option 2' : 'Option 3';

      loans.push({
        loan_id: `VL-${String(i).padStart(6, '0')}`,
        borrower_name: borrower,
        loan_amount: Math.round(loanAmount),
        outstanding_balance: Math.round(Math.max(outstandingBalance, 0)),
        interest_rate: 0.045 + Math.random() * 0.03, // 4.5-7.5%
        term_months: 60,
        origination_date: originationDate.toISOString().split('T')[0],
        vehicle_details: {
          make: vehicle.make,
          model: vehicle.model,
          year: 2020 + Math.floor(Math.random() * 4),
          type: vehicle.type,
          fuel_type: vehicle.fuel,
          value_at_origination: vehicle.basePrice,
          efficiency_mpg: mpg,
          annual_mileage: Math.round(annualMileage),
          vin: `1HGBH41JXMN${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
          engine_size: vehicle.fuel === 'electric' ? undefined : 2.0 + Math.random() * 2.0
        },
        emissions_data: {
          annual_emissions_tco2e: Math.round(annualEmissions * 1000) / 1000,
          attribution_factor: Math.round(attributionFactor * 10000) / 10000,
          financed_emissions_tco2e: Math.round(financedEmissions * 1000) / 1000,
          scope_1_emissions: Math.round(financedEmissions * 0.8 * 1000) / 1000,
          scope_2_emissions: Math.round(financedEmissions * 0.15 * 1000) / 1000,
          scope_3_emissions: Math.round(financedEmissions * 0.05 * 1000) / 1000,
          data_quality_score: Math.round(dataQualityScore * 10) / 10,
          pcaf_data_option: pcafOption,
          calculation_method: 'Asset-specific method',
          emission_factor_source: 'EPA 2024 Emission Factors',
          last_calculated: now.toISOString()
        },
        data_quality_assessment: {
          overall_score: Math.round(dataQualityScore * 10) / 10,
          category_scores: {
            'Vehicle Specifications': Math.round((dataQualityScore + Math.random() - 0.5) * 10) / 10,
            'Usage Data': Math.round((dataQualityScore + Math.random() - 0.5) * 10) / 10,
            'Emission Factors': Math.round((dataQualityScore + Math.random() - 0.5) * 10) / 10
          },
          warnings: dataQualityScore < 3 ? ['Limited vehicle specification data', 'Estimated usage patterns'] : [],
          recommendations: dataQualityScore < 4 ? ['Collect actual mileage data', 'Verify vehicle specifications'] : ['Data quality is good']
        },
        audit_trail: [
          {
            action: 'Loan Created',
            timestamp: originationDate.toISOString(),
            user_id: 'system',
            details: { source: 'sample_data' }
          },
          {
            action: 'Emissions Calculated',
            timestamp: now.toISOString(),
            user_id: 'system',
            details: { method: 'PCAF Standard' }
          }
        ],
        is_deleted: false,
        created_at: originationDate.toISOString(),
        updated_at: now.toISOString()
      });
    }

    return loans;
  }

  // Generate sample LC (Letter of Credit) instruments
  static generateSampleLCs(): any[] {
    const lcs: any[] = [];
    const now = new Date();

    const lcTypes = ['dealer_floor_plan', 'import_vehicle', 'fleet_purchase'];
    const beneficiaries = [
      'AutoMax Dealership', 'Premier Motors', 'Fleet Solutions Inc', 'Vehicle Import Co',
      'Commercial Auto Group', 'Metro Car Sales', 'Elite Fleet Services', 'Global Auto Imports'
    ];

    for (let i = 1; i <= 25; i++) {
      const lcType = lcTypes[Math.floor(Math.random() * lcTypes.length)];
      const beneficiary = beneficiaries[Math.floor(Math.random() * beneficiaries.length)];

      // LC amounts are typically higher than individual loans
      const lcAmount = 500000 + Math.random() * 2000000; // $500k - $2.5M
      const vehicleValue = lcAmount * (0.8 + Math.random() * 0.4); // 80-120% of LC amount

      // Expiry date (3-12 months from now)
      const expiryDate = new Date(now.getTime() + (90 + Math.random() * 270) * 24 * 60 * 60 * 1000);

      // Vehicle fleet details for LC
      const fleetSize = Math.floor(10 + Math.random() * 50); // 10-60 vehicles
      const avgEmissionsPerVehicle = 3 + Math.random() * 8; // 3-11 tCO2e per vehicle
      const totalEmissions = fleetSize * avgEmissionsPerVehicle;

      // Attribution factor for LC (typically lower due to contingent nature)
      const attributionFactor = 0.3 + Math.random() * 0.4; // 30-70%
      const financedEmissions = totalEmissions * attributionFactor;

      lcs.push({
        instrument_id: `LC-${String(i).padStart(6, '0')}`,
        instrument_type: 'lc',
        borrower_name: beneficiary,
        lc_amount: Math.round(lcAmount),
        lc_type: lcType,
        lc_number: `LC${now.getFullYear()}${String(i).padStart(4, '0')}`,
        beneficiary: beneficiary,
        expiry_date: expiryDate.toISOString().split('T')[0],
        issuing_bank: 'First National Bank',
        advising_bank: Math.random() > 0.5 ? 'Regional Trust Bank' : undefined,

        vehicle_details: {
          fleet_size: fleetSize,
          vehicle_types: lcType === 'dealer_floor_plan' ? 'Mixed passenger vehicles' :
            lcType === 'import_vehicle' ? 'Imported luxury vehicles' : 'Commercial fleet vehicles',
          estimated_value: Math.round(vehicleValue),
          fuel_mix: {
            gasoline: Math.round(60 + Math.random() * 30),
            diesel: Math.round(10 + Math.random() * 20),
            electric: Math.round(5 + Math.random() * 15),
            hybrid: Math.round(5 + Math.random() * 10)
          }
        },

        emissions_data: {
          total_fleet_emissions_tco2e: Math.round(totalEmissions * 1000) / 1000,
          attribution_factor: Math.round(attributionFactor * 10000) / 10000,
          financed_emissions_tco2e: Math.round(financedEmissions * 1000) / 1000,
          data_quality_score: 2 + Math.random() * 2, // 2-4 range (LCs typically have less detailed data)
          pcaf_data_option: 'Option 2', // LCs typically fall into Option 2 or 3
          calculation_method: 'Portfolio-based approach',
          emission_factor_source: 'PCAF Global Standard 2024',
          last_calculated: now.toISOString()
        },

        created_at: new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: now.toISOString()
      });
    }

    return lcs;
  }

  // Generate sample Guarantee instruments
  static generateSampleGuarantees(): any[] {
    const guarantees: any[] = [];
    const now = new Date();

    const guaranteeTypes = ['residual_value', 'performance', 'payment'];
    const obligors = [
      'Fleet Leasing Corp', 'Auto Finance Solutions', 'Commercial Vehicle Trust',
      'Municipal Fleet Services', 'Corporate Auto Group', 'Logistics Partners Inc'
    ];

    for (let i = 1; i <= 25; i++) {
      const guaranteeType = guaranteeTypes[Math.floor(Math.random() * guaranteeTypes.length)];
      const obligor = obligors[Math.floor(Math.random() * obligors.length)];

      // Guarantee amounts vary by type
      let guaranteeAmount = 100000 + Math.random() * 500000; // Base $100k - $600k
      if (guaranteeType === 'residual_value') guaranteeAmount *= 1.5; // Higher for residual value

      const vehicleValue = guaranteeAmount * (1.2 + Math.random() * 0.8); // 120-200% of guarantee

      // Probability of activation varies by guarantee type
      let probabilityOfActivation = 0.1 + Math.random() * 0.3; // 10-40% base
      if (guaranteeType === 'payment') probabilityOfActivation *= 0.5; // Lower for payment guarantees
      if (guaranteeType === 'residual_value') probabilityOfActivation *= 1.5; // Higher for residual value
      probabilityOfActivation = Math.min(probabilityOfActivation, 0.8); // Cap at 80%

      // Vehicle details for guarantee
      const vehicleCount = Math.floor(5 + Math.random() * 25); // 5-30 vehicles
      const avgEmissionsPerVehicle = 4 + Math.random() * 6; // 4-10 tCO2e per vehicle
      const totalEmissions = vehicleCount * avgEmissionsPerVehicle;

      // Attribution factor includes probability of activation
      const baseAttributionFactor = guaranteeAmount / vehicleValue;
      const riskWeightedAttribution = baseAttributionFactor * probabilityOfActivation;
      const financedEmissions = totalEmissions * riskWeightedAttribution;

      guarantees.push({
        instrument_id: `GU-${String(i).padStart(6, '0')}`,
        instrument_type: 'guarantee',
        borrower_name: obligor,
        guarantee_amount: Math.round(guaranteeAmount),
        guarantee_type: guaranteeType,
        guarantee_number: `GU${now.getFullYear()}${String(i).padStart(4, '0')}`,
        probability_of_activation: Math.round(probabilityOfActivation * 10000) / 10000,
        covered_obligations: guaranteeType === 'residual_value' ? 'Vehicle residual value protection' :
          guaranteeType === 'performance' ? 'Contract performance obligations' :
            'Payment default protection',

        vehicle_details: {
          vehicle_count: vehicleCount,
          vehicle_category: guaranteeType === 'residual_value' ? 'Leased fleet vehicles' :
            guaranteeType === 'performance' ? 'Commercial service vehicles' :
              'Financed vehicle portfolio',
          estimated_total_value: Math.round(vehicleValue),
          average_vehicle_value: Math.round(vehicleValue / vehicleCount),
          fuel_distribution: {
            gasoline: Math.round(50 + Math.random() * 40),
            diesel: Math.round(20 + Math.random() * 30),
            electric: Math.round(5 + Math.random() * 20),
            hybrid: Math.round(5 + Math.random() * 15)
          }
        },

        emissions_data: {
          total_portfolio_emissions_tco2e: Math.round(totalEmissions * 1000) / 1000,
          base_attribution_factor: Math.round(baseAttributionFactor * 10000) / 10000,
          risk_weighted_attribution: Math.round(riskWeightedAttribution * 10000) / 10000,
          financed_emissions_tco2e: Math.round(financedEmissions * 1000) / 1000,
          data_quality_score: 2.5 + Math.random() * 1.5, // 2.5-4 range
          pcaf_data_option: Math.random() > 0.6 ? 'Option 2' : 'Option 3',
          calculation_method: 'Risk-weighted attribution approach',
          emission_factor_source: 'PCAF Global Standard 2024',
          last_calculated: now.toISOString()
        },

        created_at: new Date(now.getTime() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: now.toISOString()
      });
    }

    return guarantees;
  }

  // Generate realistic sample loans (keeping existing motor vehicle loan logic)
  static generateSampleLoans(): LoanPortfolioItem[] {
    const loans: LoanPortfolioItem[] = [];
    const now = new Date();

    // Expanded vehicle types and lending categories
    const vehicleTypeData = [
      { type: 'passenger_car', lending: 'consumer', baseAmount: 35000, variance: 25000, weight: 40 },
      { type: 'motorcycle', lending: 'consumer', baseAmount: 15000, variance: 10000, weight: 8 },
      { type: 'light_commercial_truck', lending: 'business', baseAmount: 45000, variance: 20000, weight: 20 },
      { type: 'medium_heavy_commercial_truck', lending: 'business', baseAmount: 80000, variance: 40000, weight: 15 },
      { type: 'recreational_vehicle', lending: 'consumer', baseAmount: 120000, variance: 80000, weight: 10 },
      { type: 'bus', lending: 'business', baseAmount: 150000, variance: 100000, weight: 7 }
    ];

    const fuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid'];
    const engineSizes = ['1.0-1.5L', '1.5-2.0L', '2.0L+', 'all'];

    // Generate 100 sample loans with realistic data across vehicle types
    for (let i = 1; i <= 100; i++) {
      // Select vehicle type based on weighted distribution
      const random = Math.random() * 100;
      let cumulativeWeight = 0;
      let selectedVehicleData = vehicleTypeData[0];

      for (const vehicleData of vehicleTypeData) {
        cumulativeWeight += vehicleData.weight;
        if (random <= cumulativeWeight) {
          selectedVehicleData = vehicleData;
          break;
        }
      }

      const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];

      // Realistic loan amounts based on vehicle type
      const baseLoanAmount = selectedVehicleData.baseAmount + (Math.random() * selectedVehicleData.variance);
      const vehicleValue = baseLoanAmount * (1.1 + Math.random() * 0.3); // 110-140% of loan

      // Age-based depreciation for outstanding balance
      const monthsElapsed = Math.floor(Math.random() * 36); // 0-36 months old
      const paymentsMade = monthsElapsed;
      const totalPayments = 60; // 5 year loan
      const outstandingBalance = baseLoanAmount * (1 - (paymentsMade / totalPayments * 0.8));

      // Realistic km per year based on vehicle type and fuel type
      let estimatedKmPerYear = 15000 + (Math.random() * 10000); // Base: 15k-25k km/year

      // Adjust by vehicle type
      switch (selectedVehicleData.type) {
        case 'motorcycle':
          estimatedKmPerYear *= 0.6; // Motorcycles driven less
          break;
        case 'light_commercial_truck':
          estimatedKmPerYear *= 1.3; // Commercial use
          break;
        case 'medium_heavy_commercial_truck':
          estimatedKmPerYear *= 2.0; // Heavy commercial use
          break;
        case 'recreational_vehicle':
          estimatedKmPerYear *= 0.3; // RVs used seasonally
          break;
        case 'bus':
          estimatedKmPerYear *= 3.0; // Buses run constantly
          break;
      }

      // Adjust by fuel type
      if (fuelType === 'electric') estimatedKmPerYear *= 0.8; // EV drivers drive less on average
      if (fuelType === 'diesel') estimatedKmPerYear *= 1.2; // Diesel for longer trips

      // Engine size logic
      let engineSize = engineSizes[Math.floor(Math.random() * 3)]; // Exclude 'all'
      if (fuelType === 'electric' || fuelType === 'hybrid') {
        engineSize = 'all';
      }

      // Calculate attribution factor
      const attributionFactor = Math.min(outstandingBalance / vehicleValue, 1);

      // Estimate emissions based on fuel type and vehicle type
      let emissionFactorKg = 0.15; // Default gasoline passenger car

      // Base emission factors by fuel type
      switch (fuelType) {
        case 'gasoline':
          emissionFactorKg = 0.15;
          break;
        case 'diesel':
          emissionFactorKg = 0.13;
          break;
        case 'electric':
          emissionFactorKg = 0.05;
          break;
        case 'hybrid':
          emissionFactorKg = 0.08;
          break;
      }

      // Adjust emission factors by vehicle type
      switch (selectedVehicleData.type) {
        case 'motorcycle':
          emissionFactorKg *= 0.4; // Motorcycles more efficient
          break;
        case 'light_commercial_truck':
          emissionFactorKg *= 1.3; // Light trucks less efficient
          break;
        case 'medium_heavy_commercial_truck':
          emissionFactorKg *= 2.2; // Heavy trucks much less efficient
          break;
        case 'recreational_vehicle':
          emissionFactorKg *= 1.8; // RVs less efficient
          break;
        case 'bus':
          emissionFactorKg *= 2.5; // Buses less efficient
          break;
      }

      const annualEmissions = (estimatedKmPerYear * emissionFactorKg) / 1000; // tonnes CO2
      const financedEmissions = annualEmissions * attributionFactor;

      // Loan origination date (last 3 years)
      const originationDate = new Date(now.getTime() - (monthsElapsed * 30 * 24 * 60 * 60 * 1000));

      // Generate loan ID based on vehicle type and lending type
      const loanPrefix = selectedVehicleData.lending === 'business' ? 'BVL' : 'CVL';

      // Enhanced PCAF data quality assessment
      const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Hyundai'];
      const vehicleModels = ['Camry', 'Civic', 'F-150', 'Silverado', 'Model S', 'C-Class', 'A4', 'Sentra', 'Elantra'];

      // Simulate data availability based on realistic scenarios
      const hasVehicleSpecs = Math.random() > 0.3; // 70% have make/model
      const hasActualDistance = Math.random() > 0.7; // 30% have actual distance
      const hasActualFuelData = Math.random() > 0.9; // 10% have actual fuel consumption

      const pcafInput: LoanDataQualityInput = {
        loan_id: `${loanPrefix}-${String(i).padStart(6, '0')}`,
        vehicle_make: hasVehicleSpecs ? vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)] : undefined,
        vehicle_model: hasVehicleSpecs ? vehicleModels[Math.floor(Math.random() * vehicleModels.length)] : undefined,
        vehicle_category: selectedVehicleData.type,
        fuel_type: fuelType,
        actual_fuel_consumption: hasActualFuelData ? Math.random() * 50 + 20 : undefined, // L/100km or kWh/100km
        actual_distance_traveled: hasActualDistance ? estimatedKmPerYear : undefined,
        estimated_distance_km_year: estimatedKmPerYear,
        distance_data_source: hasActualDistance ? 'primary' : (Math.random() > 0.5 ? 'local_statistical' : 'regional_statistical'),
        loan_origination_date: originationDate.toISOString().split('T')[0],
        reporting_date: now.toISOString().split('T')[0],
        country: 'United States'
      };

      // Use PCAF engine to determine data quality
      const pcafAssessment = PCAFDataQualityEngine.determinePCAFOption(pcafInput);
      const dataQualityScore = pcafAssessment.data_quality_score;

      loans.push({
        loan_id: pcafInput.loan_id,
        loan_amount: Math.round(baseLoanAmount),

        // Enhanced PCAF vehicle data
        vehicle_make: pcafInput.vehicle_make,
        vehicle_model: pcafInput.vehicle_model,
        vehicle_type: selectedVehicleData.type,
        vehicle_category: selectedVehicleData.type as "passenger_car" | "motorcycle" | "light_commercial_truck" | "medium_heavy_commercial_truck" | "recreational_vehicle" | "bus",
        fuel_type: fuelType as "gasoline" | "diesel" | "electric" | "hybrid",
        engine_size: engineSize,
        lending_type: selectedVehicleData.lending as "consumer" | "business",

        // PCAF data quality indicators
        actual_fuel_consumption: pcafInput.actual_fuel_consumption,
        actual_distance_traveled: pcafInput.actual_distance_traveled,
        distance_data_source: pcafInput.distance_data_source,
        fuel_consumption_source: hasActualFuelData ? 'measured' : 'estimated_average',

        vehicle_value: Math.round(vehicleValue),
        estimated_km_per_year: Math.round(estimatedKmPerYear),
        estimated_annual_km: Math.round(estimatedKmPerYear),
        loan_term_years: selectedVehicleData.lending === 'business' ? 7 : 5,
        outstanding_balance: Math.round(Math.max(outstandingBalance, 0)),

        // PCAF compliant calculations
        attribution_factor: Math.round(attributionFactor * 10000) / 10000,
        annual_emissions: Math.round(annualEmissions * 1000) / 1000,
        financed_emissions: Math.round(financedEmissions * 1000) / 1000,
        emission_factor_kg_co2_km: Math.round(emissionFactorKg * 1000) / 1000,

        // Enhanced data quality tracking
        pcaf_data_option: pcafAssessment.option,
        data_quality_score: Math.round(dataQualityScore * 10) / 10,
        data_quality_drivers: pcafAssessment.data_quality_drivers,

        loan_origination_date: originationDate.toISOString().split('T')[0],
        reporting_date: now.toISOString().split('T')[0],
        temporal_attribution: 1.0,
        data_source: 'sample_data_pcaf_compliant',
        emission_factor_source: 'PCAF Global Standard 2024',
        verification_status: selectedVehicleData.lending === 'business'
          ? (Math.random() > 0.5 ? 'verified' : 'partially_verified')
          : (Math.random() > 0.7 ? 'verified' : 'unverified'),
        pcaf_asset_class: 'motor_vehicle_loans',
        country: pcafInput.country,
        created_at: now,
        updated_at: now
      });
    }

    return loans;
  }

  // Load sample data into the database
  static async loadSampleData(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      // Check if data already exists
      const existingCount = await db.loans.count();
      if (existingCount > 0) {
        return {
          success: false,
          message: 'Sample data already exists. Clear the database first if you want to reload.',
          count: existingCount
        };
      }

      // Generate all three instrument types
      const sampleLoans = this.generateSampleLoans();
      const sampleLCs = this.generateSampleLCs();
      const sampleGuarantees = this.generateSampleGuarantees();
      const modalCompatibleLoans = this.generateModalCompatibleSampleLoans();

      // Convert LC and Guarantee data to LoanPortfolioItem format for database storage
      const lcPortfolioItems: LoanPortfolioItem[] = sampleLCs.map(lc => ({
        loan_id: lc.instrument_id,
        instrument_type: 'lc' as const,
        loan_amount: lc.lc_amount,
        vehicle_category: 'light_commercial_truck' as const, // Default for fleet vehicles
        fuel_type: 'gasoline' as const, // Default mixed fuel
        vehicle_value: lc.vehicle_details.estimated_value,
        estimated_annual_km: 15000, // Default for fleet
        outstanding_balance: lc.lc_amount, // Full LC amount as exposure
        attribution_factor: lc.emissions_data.attribution_factor,
        annual_emissions: lc.emissions_data.total_fleet_emissions_tco2e,
        financed_emissions: lc.emissions_data.financed_emissions_tco2e,
        emission_factor_kg_co2_km: 0.15, // Default gasoline factor
        data_quality_score: lc.emissions_data.data_quality_score,
        verification_status: 'partially_verified' as const,
        pcaf_asset_class: 'motor_vehicle_lc',
        country: 'United States',
        created_at: new Date(lc.created_at),
        updated_at: new Date(lc.updated_at)
      }));

      const guaranteePortfolioItems: LoanPortfolioItem[] = sampleGuarantees.map(guarantee => ({
        loan_id: guarantee.instrument_id,
        instrument_type: 'guarantee' as const,
        loan_amount: guarantee.guarantee_amount,
        vehicle_category: 'passenger_car' as const, // Default for guaranteed vehicles
        fuel_type: 'gasoline' as const, // Default mixed fuel
        vehicle_value: guarantee.vehicle_details.estimated_total_value,
        estimated_annual_km: 12000, // Default for guaranteed vehicles
        outstanding_balance: guarantee.guarantee_amount * guarantee.probability_of_activation, // Risk-weighted exposure
        attribution_factor: guarantee.emissions_data.risk_weighted_attribution,
        annual_emissions: guarantee.emissions_data.total_portfolio_emissions_tco2e,
        financed_emissions: guarantee.emissions_data.financed_emissions_tco2e,
        emission_factor_kg_co2_km: 0.15, // Default gasoline factor
        data_quality_score: guarantee.emissions_data.data_quality_score,
        verification_status: 'partially_verified' as const,
        pcaf_asset_class: 'motor_vehicle_guarantee',
        country: 'United States',
        created_at: new Date(guarantee.created_at),
        updated_at: new Date(guarantee.updated_at)
      }));

      // Add all instrument types to database
      await db.loans.bulkAdd([...sampleLoans, ...lcPortfolioItems, ...guaranteePortfolioItems]);

      // Store all instrument types in the API
      try {
        const loansAPI = new LoansAPI();

        // Store loans
        for (const loan of modalCompatibleLoans) {
          await loansAPI.createLoan(loan);
        }

        // Store LCs (Letter of Credits)
        for (const lc of sampleLCs) {
          await loansAPI.createLoan(lc); // Using same endpoint for now
        }

        // Store Guarantees
        for (const guarantee of sampleGuarantees) {
          await loansAPI.createLoan(guarantee); // Using same endpoint for now
        }
      } catch (apiError) {
        console.log('API not available, using local storage only');
      }

      // Generate historical portfolio calculations for timeline
      await this.generateHistoricalCalculations();

      const totalInstruments = sampleLoans.length + sampleLCs.length + sampleGuarantees.length;

      return {
        success: true,
        message: `Successfully loaded ${totalInstruments} sample instruments: ${sampleLoans.length} loans, ${sampleLCs.length} LCs, ${sampleGuarantees.length} guarantees`,
        count: totalInstruments
      };
    } catch (error) {
      console.error('Error loading sample data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        count: 0
      };
    }
  }

  // Calculate portfolio-level summary using consistent data
  static async calculatePortfolioSummary() {
    const instruments = await db.loans.toArray();
    const now = new Date();

    if (instruments.length === 0) return;

    // Separate by instrument type
    const loans = instruments.filter(i => !i.instrument_type || i.instrument_type === 'loan');
    const lcs = instruments.filter(i => i.instrument_type === 'lc');
    const guarantees = instruments.filter(i => i.instrument_type === 'guarantee');

    // Aggregate calculations
    const totalInstruments = instruments.length;
    const totalInstrumentValue = instruments.reduce((sum, instrument) => sum + instrument.loan_amount, 0);
    const totalOutstandingBalance = instruments.reduce((sum, instrument) => sum + instrument.outstanding_balance, 0);
    const totalFinancedEmissions = instruments.reduce((sum, instrument) => sum + instrument.financed_emissions, 0);
    const weightedAvgDataQuality = instruments.reduce((sum, instrument) => sum + instrument.data_quality_score, 0) / instruments.length;

    // Breakdowns
    const emissionsByFuelType: Record<string, number> = {};
    const emissionsByVehicleType: Record<string, number> = {};
    const emissionsByInstrumentType: Record<string, number> = {};
    const instrumentsByDataQuality: Record<string, number> = {};

    instruments.forEach(instrument => {
      // By fuel type
      emissionsByFuelType[instrument.fuel_type] = (emissionsByFuelType[instrument.fuel_type] || 0) + instrument.financed_emissions;

      // By vehicle type  
      const vehicleType = instrument.vehicle_type || instrument.vehicle_category;
      emissionsByVehicleType[vehicleType] = (emissionsByVehicleType[vehicleType] || 0) + instrument.financed_emissions;

      // By instrument type
      const instrumentType = instrument.instrument_type || 'loan';
      emissionsByInstrumentType[instrumentType] = (emissionsByInstrumentType[instrumentType] || 0) + instrument.financed_emissions;

      // By data quality
      const qualityKey = `quality_${instrument.data_quality_score}`;
      instrumentsByDataQuality[qualityKey] = (instrumentsByDataQuality[qualityKey] || 0) + 1;
    });

    // Portfolio metrics
    const emissionIntensityPerDollar = totalFinancedEmissions / totalOutstandingBalance * 1000000; // per million dollars
    const avgAttributionFactor = loans.reduce((sum, loan) => sum + loan.attribution_factor, 0) / loans.length;

    // Save to database
    await db.portfolio_calculations.add({
      calculation_date: now,
      total_loans: totalInstruments, // Now includes all instrument types
      total_loan_value: Math.round(totalInstrumentValue),
      total_outstanding_balance: Math.round(totalOutstandingBalance),
      total_financed_emissions: Math.round(totalFinancedEmissions * 1000) / 1000,
      weighted_avg_data_quality: Math.round(weightedAvgDataQuality * 100) / 100,
      emissions_by_fuel_type: emissionsByFuelType,
      emissions_by_vehicle_type: emissionsByVehicleType,
      loans_by_data_quality: instrumentsByDataQuality,
      emission_intensity_per_dollar: Math.round(emissionIntensityPerDollar * 1000) / 1000,
      avg_attribution_factor: Math.round(avgAttributionFactor * 10000) / 10000,
      created_at: now,
      // Add breakdown by instrument type
      emissions_by_instrument_type: emissionsByInstrumentType,
      instrument_counts: {
        loans: loans.length,
        lcs: lcs.length,
        guarantees: guarantees.length
      }
    } as any); // Using 'as any' since we're extending the interface
  }

  // Generate historical portfolio calculations for timeline charts
  static async generateHistoricalCalculations() {
    const instruments = await db.loans.toArray();
    if (instruments.length === 0) return;

    const now = new Date();

    // Generate 12 months of historical data
    for (let monthsBack = 11; monthsBack >= 0; monthsBack--) {
      const calculationDate = new Date(now.getTime() - (monthsBack * 30 * 24 * 60 * 60 * 1000));

      // Simulate portfolio growth over time
      const growthFactor = 0.7 + (monthsBack * 0.025); // Portfolio grew by ~2.5% per month
      const instrumentsSubset = instruments.slice(0, Math.floor(instruments.length * growthFactor));

      if (instrumentsSubset.length === 0) continue;

      // Calculate metrics for this time period
      const totalInstruments = instrumentsSubset.length;
      const totalInstrumentValue = instrumentsSubset.reduce((sum, instrument) => sum + instrument.loan_amount, 0);
      const totalOutstandingBalance = instrumentsSubset.reduce((sum, instrument) => sum + instrument.outstanding_balance, 0);
      const totalFinancedEmissions = instrumentsSubset.reduce((sum, instrument) => sum + instrument.financed_emissions, 0);
      const weightedAvgDataQuality = instrumentsSubset.reduce((sum, instrument) => sum + instrument.data_quality_score, 0) / instrumentsSubset.length;

      // Simulate improving data quality over time
      const dataQualityImprovement = (11 - monthsBack) * 0.05; // 0.05 improvement per month
      const adjustedDataQuality = Math.max(weightedAvgDataQuality - dataQualityImprovement, 1.5);

      // Breakdowns
      const emissionsByFuelType: Record<string, number> = {};
      const emissionsByVehicleType: Record<string, number> = {};
      const instrumentsByDataQuality: Record<string, number> = {};

      instrumentsSubset.forEach(instrument => {
        emissionsByFuelType[instrument.fuel_type] = (emissionsByFuelType[instrument.fuel_type] || 0) + instrument.financed_emissions;
        const vehicleType = instrument.vehicle_type || instrument.vehicle_category;
        emissionsByVehicleType[vehicleType] = (emissionsByVehicleType[vehicleType] || 0) + instrument.financed_emissions;
        const qualityKey = `quality_${instrument.data_quality_score}`;
        instrumentsByDataQuality[qualityKey] = (instrumentsByDataQuality[qualityKey] || 0) + 1;
      });

      // Portfolio metrics
      const emissionIntensityPerDollar = totalOutstandingBalance > 0
        ? (totalFinancedEmissions * 1000) / totalOutstandingBalance
        : 0;
      const avgAttributionFactor = instrumentsSubset.reduce((sum, instrument) => sum + instrument.attribution_factor, 0) / instrumentsSubset.length;

      // Add some realistic variance to emission intensity
      const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
      const adjustedEmissionIntensity = emissionIntensityPerDollar * (1 + variance);

      await db.portfolio_calculations.add({
        calculation_date: calculationDate,
        total_loans: totalInstruments,
        total_loan_value: Math.round(totalInstrumentValue),
        total_outstanding_balance: Math.round(totalOutstandingBalance),
        total_financed_emissions: Math.round(totalFinancedEmissions * 1000) / 1000,
        weighted_avg_data_quality: Math.round(adjustedDataQuality * 100) / 100,
        emissions_by_fuel_type: emissionsByFuelType,
        emissions_by_vehicle_type: emissionsByVehicleType,
        loans_by_data_quality: instrumentsByDataQuality,
        emission_intensity_per_dollar: Math.round(adjustedEmissionIntensity * 1000) / 1000,
        avg_attribution_factor: Math.round(avgAttributionFactor * 10000) / 10000,
        created_at: calculationDate
      });
    }
  }

  // Clear all data
  static async clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
      await db.loans.clear();
      await db.portfolio_calculations.clear();
      await db.validation_results.clear();

      return {
        success: true,
        message: 'All data cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error clearing data'
      };
    }
  }

  // Get portfolio statistics
  static async getPortfolioStats() {
    const [instrumentsCount, latestCalculation] = await Promise.all([
      db.loans.count(),
      db.portfolio_calculations.orderBy('calculation_date').last()
    ]);

    // Get breakdown by instrument type
    const instruments = await db.loans.toArray();
    const loans = instruments.filter(i => !i.instrument_type || i.instrument_type === 'loan');
    const lcs = instruments.filter(i => i.instrument_type === 'lc');
    const guarantees = instruments.filter(i => i.instrument_type === 'guarantee');

    return {
      totalLoans: instrumentsCount, // Keep name for backward compatibility
      totalInstruments: instrumentsCount,
      instrumentBreakdown: {
        loans: loans.length,
        lcs: lcs.length,
        guarantees: guarantees.length
      },
      hasData: instrumentsCount > 0,
      latestCalculation
    };
  }
}
