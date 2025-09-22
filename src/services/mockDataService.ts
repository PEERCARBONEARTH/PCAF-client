import { UploadResult, UploadValidationResult, LoanUploadData } from './enhancedUploadService';

export interface MockProcessingResult {
  totalLoans: number;
  processedLoans: number;
  successfulCalculations: number;
  averageDataQuality: number;
  totalEmissions: number;
  processingTime: string;
  complianceStatus: string;
  uploadId?: string;
}

export interface MockValidationResult {
  dataFormat: { passed: boolean; message: string };
  methodology: { passed: boolean; message: string };
  pcafCompliance: { passed: boolean; message: string };
  dataQuality: { passed: boolean; score: number; message: string };
  coverage: { passed: boolean; percentage: number; message: string };
}

class MockDataService {
  private static instance: MockDataService;

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  // Simulate network delay for realistic experience
  async simulateNetworkDelay(minMs: number = 500, maxMs: number = 2000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Simulate processing time based on item count
  async simulateProcessingTime(itemCount: number): Promise<void> {
    // Simulate ~100ms per item with some variance
    const baseTime = itemCount * 100;
    const variance = baseTime * 0.3; // 30% variance
    const delay = baseTime + (Math.random() - 0.5) * variance;
    return new Promise(resolve => setTimeout(resolve, Math.max(delay, 1000)));
  }

  // Generate mock CSV upload result
  generateMockUploadResult(fileName?: string, recordCount?: number): UploadResult {
    const totalRecords = recordCount || Math.floor(Math.random() * 500) + 50;
    const successfulRecords = Math.floor(totalRecords * (0.85 + Math.random() * 0.1)); // 85-95% success
    const failedRecords = totalRecords - successfulRecords;

    const results = [];
    
    // Generate successful results
    for (let i = 0; i < successfulRecords; i++) {
      results.push({
        row: i + 1,
        loanId: `LOAN_${Date.now()}_${i.toString().padStart(4, '0')}`,
        status: 'success' as const,
        emissions: {
          annual_emissions: Math.random() * 15 + 5, // 5-20 tCO2e
          financed_emissions: Math.random() * 12 + 3, // 3-15 tCO2e
          data_quality_score: Math.random() * 2 + 3 // 3-5 quality score
        }
      });
    }

    // Generate failed results
    const errorMessages = [
      'Invalid vehicle type specified',
      'Missing required field: loan_amount',
      'Invalid date format in origination_date',
      'Vehicle year out of acceptable range',
      'Fuel efficiency value not realistic'
    ];

    for (let i = 0; i < failedRecords; i++) {
      results.push({
        row: successfulRecords + i + 1,
        status: 'failed' as const,
        error: errorMessages[Math.floor(Math.random() * errorMessages.length)]
      });
    }

    return {
      jobId: `mock_upload_${Date.now()}`,
      success: failedRecords === 0,
      summary: {
        totalProcessed: totalRecords,
        successful: successfulRecords,
        failed: failedRecords,
        skipped: 0
      },
      results,
      processingTime: Math.random() * 30000 + 5000, // 5-35 seconds
      validationReport: this.generateMockValidationResult(totalRecords)
    };
  }

  // Generate mock validation result
  generateMockValidationResult(totalRows?: number): UploadValidationResult {
    const rows = totalRows || Math.floor(Math.random() * 500) + 50;
    const errorRate = Math.random() * 0.15; // 0-15% error rate
    const warningRate = Math.random() * 0.25; // 0-25% warning rate
    
    const errorRows = Math.floor(rows * errorRate);
    const warningRows = Math.floor(rows * warningRate);
    const validRows = rows - errorRows;

    const errors = [];
    const warnings = [];

    // Generate sample errors
    const errorTypes = [
      { field: 'loan_amount', message: 'Loan amount must be greater than 0' },
      { field: 'vehicle_year', message: 'Vehicle year must be between 1990 and current year' },
      { field: 'borrower_name', message: 'Borrower name is required' },
      { field: 'fuel_type', message: 'Invalid fuel type specified' },
      { field: 'origination_date', message: 'Invalid date format' }
    ];

    for (let i = 0; i < errorRows; i++) {
      const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      errors.push({
        row: Math.floor(Math.random() * rows) + 1,
        field: errorType.field,
        message: errorType.message,
        severity: 'error' as const
      });
    }

    // Generate sample warnings
    const warningTypes = [
      { field: 'fuel_efficiency_mpg', message: 'Fuel efficiency seems unusually high' },
      { field: 'vehicle_value', message: 'Vehicle value may be outdated' },
      { field: 'estimated_annual_mileage', message: 'Annual mileage estimate is very high' },
      { field: 'vin', message: 'VIN format could not be validated' }
    ];

    for (let i = 0; i < warningRows; i++) {
      const warningType = warningTypes[Math.floor(Math.random() * warningTypes.length)];
      warnings.push({
        row: Math.floor(Math.random() * rows) + 1,
        field: warningType.field,
        message: warningType.message
      });
    }

    return {
      isValid: errorRows === 0,
      errors,
      warnings,
      summary: {
        totalRows: rows,
        validRows,
        errorRows,
        warningRows
      }
    };
  }

  // Generate mock processing result
  generateMockProcessingResult(uploadId?: string): MockProcessingResult {
    const totalLoans = Math.floor(Math.random() * 500) + 100;
    const successRate = 0.85 + Math.random() * 0.1; // 85-95% success
    const successfulCalculations = Math.floor(totalLoans * successRate);
    
    return {
      totalLoans,
      processedLoans: totalLoans,
      successfulCalculations,
      averageDataQuality: Math.random() * 1.5 + 2.5, // 2.5-4.0 quality score
      totalEmissions: Math.random() * 50000 + 10000, // 10k-60k tCO2e
      processingTime: `${(Math.random() * 25 + 5).toFixed(1)} seconds`,
      complianceStatus: 'PCAF Compliant',
      uploadId
    };
  }

  // Generate mock data validation result
  generateMockDataValidation(): MockValidationResult {
    const passRate = Math.random();
    
    return {
      dataFormat: {
        passed: passRate > 0.1,
        message: passRate > 0.1 ? 'Data format validation passed' : 'Some data format issues detected'
      },
      methodology: {
        passed: passRate > 0.05,
        message: passRate > 0.05 ? 'Methodology configuration validated' : 'Methodology configuration needs review'
      },
      pcafCompliance: {
        passed: passRate > 0.02,
        message: passRate > 0.02 ? 'PCAF compliance check passed' : 'PCAF compliance issues found'
      },
      dataQuality: {
        passed: true,
        score: Math.random() * 1.5 + 2.5,
        message: `Average data quality score: ${(Math.random() * 1.5 + 2.5).toFixed(1)} (PCAF compliant)`
      },
      coverage: {
        passed: passRate > 0.15,
        percentage: Math.floor(Math.random() * 20 + 80), // 80-100% coverage
        message: `${Math.floor(Math.random() * 20 + 80)}% portfolio coverage achieved`
      }
    };
  }

  // Generate sample loan data for testing
  generateSampleLoanData(count: number = 10): LoanUploadData[] {
    const sampleData: LoanUploadData[] = [];
    
    const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Nissan'];
    const vehicleModels = ['Camry', 'Accord', 'F-150', 'Silverado', '3 Series', 'C-Class', 'A4', 'Altima'];
    const vehicleTypes = ['passenger_car', 'light_truck', 'passenger_car', 'light_truck'] as const;
    const fuelTypes = ['gasoline', 'diesel', 'hybrid', 'electric'] as const;
    
    for (let i = 0; i < count; i++) {
      const vehicleYear = 2018 + Math.floor(Math.random() * 6); // 2018-2023
      const loanAmount = Math.floor(Math.random() * 40000) + 15000; // $15k-$55k
      
      sampleData.push({
        borrower_name: `Sample Borrower ${i + 1}`,
        loan_amount: loanAmount,
        interest_rate: Math.random() * 5 + 2, // 2-7%
        term_months: [36, 48, 60, 72][Math.floor(Math.random() * 4)],
        origination_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        vehicle_make: vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)],
        vehicle_model: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
        vehicle_year: vehicleYear,
        vehicle_type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        fuel_type: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
        vehicle_value: loanAmount * (1.1 + Math.random() * 0.3), // 110-140% of loan amount
        estimated_annual_mileage: Math.floor(Math.random() * 10000) + 8000, // 8k-18k miles
        fuel_efficiency_mpg: Math.floor(Math.random() * 20) + 20, // 20-40 MPG
        vin: `1HGBH41JXMN${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        engine_size: ['1.8L', '2.0L', '2.5L', '3.0L', '3.5L'][Math.floor(Math.random() * 5)]
      });
    }
    
    return sampleData;
  }

  // Simulate various error conditions for testing
  simulateError(errorType: 'network' | 'timeout' | 'service' | 'validation' | 'system'): Error {
    const errors = {
      network: new Error('Network connection failed'),
      timeout: new Error('Request timeout after 30 seconds'),
      service: new Error('Service temporarily unavailable (503)'),
      validation: new Error('Data validation failed: missing required fields'),
      system: new Error('Unexpected system error occurred')
    };
    
    return errors[errorType];
  }

  // Simulate service failure
  simulateServiceFailure(): void {
    throw new Error('Mock service failure for testing');
  }

  // Generate realistic progress updates
  generateProgressUpdates(totalItems: number, callback: (progress: number, message: string) => void): void {
    let processed = 0;
    const interval = setInterval(() => {
      processed += Math.floor(Math.random() * 10) + 1;
      
      if (processed >= totalItems) {
        processed = totalItems;
        callback(100, 'Processing complete');
        clearInterval(interval);
      } else {
        const percentage = Math.floor((processed / totalItems) * 100);
        const messages = [
          `Processing loan ${processed} of ${totalItems}`,
          `Calculating emissions for ${processed} loans`,
          `Validating data quality (${processed}/${totalItems})`,
          `Running PCAF compliance checks`
        ];
        callback(percentage, messages[Math.floor(Math.random() * messages.length)]);
      }
    }, 200 + Math.random() * 300); // 200-500ms intervals
  }
}

export const mockDataService = MockDataService.getInstance();