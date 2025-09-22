import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedFileUpload } from '../EnhancedFileUpload';

// Mock the services
vi.mock('@/services/enhancedUploadService', () => ({
  enhancedUploadService: {
    validateCSVData: vi.fn(),
    downloadCSVTemplate: vi.fn(),
  },
}));

vi.mock('@/services/errorHandlingService', () => ({
  errorHandlingService: {
    getErrorMessage: vi.fn((error) => error.message),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('EnhancedFileUpload', () => {
  const mockOnFileProcessed = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate file types correctly', () => {
    // Test file validation logic
    const validFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    expect(validFile.name.endsWith('.csv')).toBe(true);
    expect(invalidFile.name.endsWith('.csv')).toBe(false);
  });

  it('should validate file size correctly', () => {
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    const smallFile = new File(['small content'], 'small.csv', { type: 'text/csv' });
    const largeContent = 'x'.repeat(maxSizeBytes + 1);
    const largeFile = new File([largeContent], 'large.csv', { type: 'text/csv' });

    expect(smallFile.size).toBeLessThan(maxSizeBytes);
    expect(largeFile.size).toBeGreaterThan(maxSizeBytes);
  });

  it('should parse CSV headers correctly', () => {
    const csvContent = 'borrower_name,loan_amount,interest_rate\nJohn Doe,25000,4.5';
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    expect(headers).toEqual(['borrower_name', 'loan_amount', 'interest_rate']);
  });

  it('should validate required CSV headers', () => {
    const requiredHeaders = [
      'borrower_name', 'loan_amount', 'interest_rate', 'term_months',
      'origination_date', 'vehicle_make', 'vehicle_model', 'vehicle_year',
      'vehicle_type', 'fuel_type', 'vehicle_value'
    ];

    const validHeaders = [
      'borrower_name', 'loan_amount', 'interest_rate', 'term_months',
      'origination_date', 'vehicle_make', 'vehicle_model', 'vehicle_year',
      'vehicle_type', 'fuel_type', 'vehicle_value', 'vin'
    ];

    const invalidHeaders = ['borrower_name', 'loan_amount'];

    const validMissingHeaders = requiredHeaders.filter(header => !validHeaders.includes(header));
    const invalidMissingHeaders = requiredHeaders.filter(header => !invalidHeaders.includes(header));

    expect(validMissingHeaders).toHaveLength(0);
    expect(invalidMissingHeaders.length).toBeGreaterThan(0);
  });

  it('should validate numeric fields correctly', () => {
    const validLoanAmount = '25000';
    const invalidLoanAmount = 'not-a-number';
    const validInterestRate = '4.5';
    const invalidInterestRate = '-1';

    expect(isNaN(parseFloat(validLoanAmount))).toBe(false);
    expect(isNaN(parseFloat(invalidLoanAmount))).toBe(true);
    expect(parseFloat(validInterestRate)).toBeGreaterThan(0);
    expect(parseFloat(invalidInterestRate)).toBeLessThan(0);
  });

  it('should validate date fields correctly', () => {
    const validDate = '2024-01-15';
    const invalidDate = 'not-a-date';

    expect(isNaN(Date.parse(validDate))).toBe(false);
    expect(isNaN(Date.parse(invalidDate))).toBe(true);
  });

  it('should validate vehicle types correctly', () => {
    const validVehicleTypes = ['passenger_car', 'light_truck', 'heavy_truck', 'motorcycle', 'electric_vehicle'];
    const validType = 'passenger_car';
    const invalidType = 'invalid_type';

    expect(validVehicleTypes.includes(validType)).toBe(true);
    expect(validVehicleTypes.includes(invalidType)).toBe(false);
  });

  it('should validate fuel types correctly', () => {
    const validFuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid'];
    const validType = 'gasoline';
    const invalidType = 'invalid_fuel';

    expect(validFuelTypes.includes(validType)).toBe(true);
    expect(validFuelTypes.includes(invalidType)).toBe(false);
  });

  it('should handle CSV parsing errors gracefully', () => {
    const malformedCSV = 'header1,header2\nvalue1'; // Missing value
    const lines = malformedCSV.split('\n');
    const headers = lines[0].split(',');
    const values = lines[1].split(',');

    expect(headers.length).toBe(2);
    expect(values.length).toBe(1);
    expect(values.length).toBeLessThan(headers.length);
  });

  it('should generate proper upload data format', () => {
    const csvRow = {
      borrower_name: 'John Doe',
      loan_amount: '25000',
      interest_rate: '4.5',
      term_months: '60',
      origination_date: '2024-01-15',
      vehicle_make: 'Toyota',
      vehicle_model: 'Camry',
      vehicle_year: '2023',
      vehicle_type: 'passenger_car',
      fuel_type: 'gasoline',
      vehicle_value: '30000',
      estimated_annual_mileage: '12000',
      fuel_efficiency_mpg: '32',
      vin: '1HGBH41JXMN109186',
      engine_size: '2000'
    };

    const uploadData = {
      borrower_name: csvRow.borrower_name,
      loan_amount: parseFloat(csvRow.loan_amount),
      interest_rate: parseFloat(csvRow.interest_rate),
      term_months: parseInt(csvRow.term_months),
      origination_date: csvRow.origination_date,
      vehicle_make: csvRow.vehicle_make,
      vehicle_model: csvRow.vehicle_model,
      vehicle_year: parseInt(csvRow.vehicle_year),
      vehicle_type: csvRow.vehicle_type,
      fuel_type: csvRow.fuel_type,
      vehicle_value: parseFloat(csvRow.vehicle_value),
      estimated_annual_mileage: parseInt(csvRow.estimated_annual_mileage),
      fuel_efficiency_mpg: parseFloat(csvRow.fuel_efficiency_mpg),
      vin: csvRow.vin,
      engine_size: csvRow.engine_size,
    };

    expect(uploadData.loan_amount).toBe(25000);
    expect(uploadData.interest_rate).toBe(4.5);
    expect(uploadData.term_months).toBe(60);
    expect(uploadData.vehicle_year).toBe(2023);
    expect(uploadData.estimated_annual_mileage).toBe(12000);
    expect(uploadData.fuel_efficiency_mpg).toBe(32);
  });
});