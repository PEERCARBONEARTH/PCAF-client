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
      
      // Generate both old format (for calculations) and new format (for modal display)
      const sampleLoans = this.generateSampleLoans();
      const modalCompatibleLoans = this.generateModalCompatibleSampleLoans();
      
      // Add old format to database for existing functionality
      await db.loans.bulkAdd(sampleLoans);
      
      // Store modal-compatible loans in a separate table or merge with existing
      // For now, we'll use the LoansAPI to store the new format
      try {
        const loansAPI = new LoansAPI();
        for (const loan of modalCompatibleLoans) {
          await loansAPI.createLoan(loan);
        }
      } catch (apiError) {
        console.log('API not available, using local storage only');
      }
      
      // Generate historical portfolio calculations for timeline
      await this.generateHistoricalCalculations();
      
      return {
        success: true,
        message: `Successfully loaded ${sampleLoans.length} sample loans with enhanced modal compatibility`,
        count: sampleLoans.length
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
    const loans = await db.loans.toArray();
    const now = new Date();
    
    if (loans.length === 0) return;
    
    // Aggregate calculations
    const totalLoans = loans.length;
    const totalLoanValue = loans.reduce((sum, loan) => sum + loan.loan_amount, 0);
    const totalOutstandingBalance = loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
    const totalFinancedEmissions = loans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
    const weightedAvgDataQuality = loans.reduce((sum, loan) => sum + loan.data_quality_score, 0) / loans.length;
    
    // Breakdowns
    const emissionsByFuelType: Record<string, number> = {};
    const emissionsByVehicleType: Record<string, number> = {};
    const loansByDataQuality: Record<string, number> = {};
    
    loans.forEach(loan => {
      // By fuel type
      emissionsByFuelType[loan.fuel_type] = (emissionsByFuelType[loan.fuel_type] || 0) + loan.financed_emissions;
      
      // By vehicle type  
      emissionsByVehicleType[loan.vehicle_type] = (emissionsByVehicleType[loan.vehicle_type] || 0) + loan.financed_emissions;
      
      // By data quality
      const qualityKey = `quality_${loan.data_quality_score}`;
      loansByDataQuality[qualityKey] = (loansByDataQuality[qualityKey] || 0) + 1;
    });
    
    // Portfolio metrics
    const emissionIntensityPerDollar = totalFinancedEmissions / totalOutstandingBalance * 1000000; // per million dollars
    const avgAttributionFactor = loans.reduce((sum, loan) => sum + loan.attribution_factor, 0) / loans.length;
    
    // Save to database
    await db.portfolio_calculations.add({
      calculation_date: now,
      total_loans: totalLoans,
      total_loan_value: Math.round(totalLoanValue),
      total_outstanding_balance: Math.round(totalOutstandingBalance), 
      total_financed_emissions: Math.round(totalFinancedEmissions * 1000) / 1000,
      weighted_avg_data_quality: Math.round(weightedAvgDataQuality * 100) / 100,
      emissions_by_fuel_type: emissionsByFuelType,
      emissions_by_vehicle_type: emissionsByVehicleType,
      loans_by_data_quality: loansByDataQuality,
      emission_intensity_per_dollar: Math.round(emissionIntensityPerDollar * 1000) / 1000,
      avg_attribution_factor: Math.round(avgAttributionFactor * 10000) / 10000,
      created_at: now
    });
  }

  // Generate historical portfolio calculations for timeline charts
  static async generateHistoricalCalculations() {
    const loans = await db.loans.toArray();
    if (loans.length === 0) return;

    const now = new Date();
    
    // Generate 12 months of historical data
    for (let monthsBack = 11; monthsBack >= 0; monthsBack--) {
      const calculationDate = new Date(now.getTime() - (monthsBack * 30 * 24 * 60 * 60 * 1000));
      
      // Simulate portfolio growth over time
      const growthFactor = 0.7 + (monthsBack * 0.025); // Portfolio grew by ~2.5% per month
      const loansSubset = loans.slice(0, Math.floor(loans.length * growthFactor));
      
      if (loansSubset.length === 0) continue;

      // Calculate metrics for this time period
      const totalLoans = loansSubset.length;
      const totalLoanValue = loansSubset.reduce((sum, loan) => sum + loan.loan_amount, 0);
      const totalOutstandingBalance = loansSubset.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
      const totalFinancedEmissions = loansSubset.reduce((sum, loan) => sum + loan.financed_emissions, 0);
      const weightedAvgDataQuality = loansSubset.reduce((sum, loan) => sum + loan.data_quality_score, 0) / loansSubset.length;
      
      // Simulate improving data quality over time
      const dataQualityImprovement = (11 - monthsBack) * 0.05; // 0.05 improvement per month
      const adjustedDataQuality = Math.max(weightedAvgDataQuality - dataQualityImprovement, 1.5);
      
      // Breakdowns
      const emissionsByFuelType: Record<string, number> = {};
      const emissionsByVehicleType: Record<string, number> = {};
      const loansByDataQuality: Record<string, number> = {};
      
      loansSubset.forEach(loan => {
        emissionsByFuelType[loan.fuel_type] = (emissionsByFuelType[loan.fuel_type] || 0) + loan.financed_emissions;
        emissionsByVehicleType[loan.vehicle_type] = (emissionsByVehicleType[loan.vehicle_type] || 0) + loan.financed_emissions;
        const qualityKey = `quality_${loan.data_quality_score}`;
        loansByDataQuality[qualityKey] = (loansByDataQuality[qualityKey] || 0) + 1;
      });
      
      // Portfolio metrics
      const emissionIntensityPerDollar = totalOutstandingBalance > 0 
        ? (totalFinancedEmissions * 1000) / totalOutstandingBalance
        : 0;
      const avgAttributionFactor = loansSubset.reduce((sum, loan) => sum + loan.attribution_factor, 0) / loansSubset.length;
      
      // Add some realistic variance to emission intensity
      const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
      const adjustedEmissionIntensity = emissionIntensityPerDollar * (1 + variance);
      
      await db.portfolio_calculations.add({
        calculation_date: calculationDate,
        total_loans: totalLoans,
        total_loan_value: Math.round(totalLoanValue),
        total_outstanding_balance: Math.round(totalOutstandingBalance),
        total_financed_emissions: Math.round(totalFinancedEmissions * 1000) / 1000,
        weighted_avg_data_quality: Math.round(adjustedDataQuality * 100) / 100,
        emissions_by_fuel_type: emissionsByFuelType,
        emissions_by_vehicle_type: emissionsByVehicleType,
        loans_by_data_quality: loansByDataQuality,
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
    const [loansCount, latestCalculation] = await Promise.all([
      db.loans.count(),
      db.portfolio_calculations.orderBy('calculation_date').last()
    ]);
    
    return {
      totalLoans: loansCount,
      hasData: loansCount > 0,
      latestCalculation
    };
  }
}
