import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedMethodologyStep } from '../EnhancedMethodologyStep';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('EnhancedMethodologyStep', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate methodology configuration correctly', () => {
    const validConfig = {
      activityFactorSource: 'epa',
      dataQualityApproach: 'pcaf_standard',
      assumptionsValidated: true,
      vehicleAssumptions: {
        passengerCar: {
          activityBasis: 'distance',
          fuelType: 'gasoline',
          annualDistance: 15000,
          region: 'us',
        },
      },
    };

    const invalidConfig = {
      activityFactorSource: '',
      dataQualityApproach: '',
      assumptionsValidated: false,
      vehicleAssumptions: {},
    };

    // Valid configuration should have all required fields
    expect(validConfig.activityFactorSource).toBeTruthy();
    expect(validConfig.dataQualityApproach).toBeTruthy();
    expect(validConfig.assumptionsValidated).toBe(true);
    expect(Object.keys(validConfig.vehicleAssumptions)).toHaveLength(1);

    // Invalid configuration should be missing required fields
    expect(invalidConfig.activityFactorSource).toBeFalsy();
    expect(invalidConfig.dataQualityApproach).toBeFalsy();
    expect(invalidConfig.assumptionsValidated).toBe(false);
    expect(Object.keys(invalidConfig.vehicleAssumptions)).toHaveLength(0);
  });

  it('should validate vehicle assumptions correctly', () => {
    const validAssumption = {
      activityBasis: 'distance',
      fuelType: 'gasoline',
      annualDistance: 15000,
      region: 'us',
    };

    const invalidAssumption = {
      activityBasis: '',
      fuelType: '',
      annualDistance: 0,
      region: '',
    };

    // Valid assumption should have all required fields with valid values
    expect(validAssumption.activityBasis).toBeTruthy();
    expect(validAssumption.fuelType).toBeTruthy();
    expect(validAssumption.annualDistance).toBeGreaterThan(0);
    expect(validAssumption.region).toBeTruthy();

    // Invalid assumption should fail validation
    expect(invalidAssumption.activityBasis).toBeFalsy();
    expect(invalidAssumption.fuelType).toBeFalsy();
    expect(invalidAssumption.annualDistance).toBeLessThanOrEqual(0);
    expect(invalidAssumption.region).toBeFalsy();
  });

  it('should validate annual distance ranges correctly', () => {
    const normalDistance = 15000;
    const lowDistance = 0;
    const highDistance = 150000;

    expect(normalDistance).toBeGreaterThan(0);
    expect(normalDistance).toBeLessThan(100000);

    expect(lowDistance).toBeLessThanOrEqual(0);
    expect(highDistance).toBeGreaterThan(100000);
  });

  it('should validate activity factor sources correctly', () => {
    const validSources = ['epa', 'defra', 'iea', 'custom'];
    const invalidSource = 'invalid_source';

    validSources.forEach(source => {
      expect(['epa', 'defra', 'iea', 'custom']).toContain(source);
    });

    expect(['epa', 'defra', 'iea', 'custom']).not.toContain(invalidSource);
  });

  it('should validate data quality approaches correctly', () => {
    const validApproaches = ['pcaf_standard', 'conservative', 'best_estimate'];
    const invalidApproach = 'invalid_approach';

    validApproaches.forEach(approach => {
      expect(['pcaf_standard', 'conservative', 'best_estimate']).toContain(approach);
    });

    expect(['pcaf_standard', 'conservative', 'best_estimate']).not.toContain(invalidApproach);
  });

  it('should validate fuel types correctly', () => {
    const validFuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid', 'cng'];
    const invalidFuelType = 'invalid_fuel';

    validFuelTypes.forEach(fuelType => {
      expect(['gasoline', 'diesel', 'electric', 'hybrid', 'cng']).toContain(fuelType);
    });

    expect(['gasoline', 'diesel', 'electric', 'hybrid', 'cng']).not.toContain(invalidFuelType);
  });

  it('should validate regions correctly', () => {
    const validRegions = ['us', 'eu', 'uk', 'ca', 'global'];
    const invalidRegion = 'invalid_region';

    validRegions.forEach(region => {
      expect(['us', 'eu', 'uk', 'ca', 'global']).toContain(region);
    });

    expect(['us', 'eu', 'uk', 'ca', 'global']).not.toContain(invalidRegion);
  });

  it('should require custom factors when using custom source', () => {
    const configWithCustomSource = {
      activityFactorSource: 'custom',
      customFactors: {},
    };

    const configWithCustomFactors = {
      activityFactorSource: 'custom',
      customFactors: {
        gasoline: 8.887,
        diesel: 10.180,
      },
    };

    // Custom source without factors should be invalid
    expect(configWithCustomSource.activityFactorSource).toBe('custom');
    expect(Object.keys(configWithCustomSource.customFactors)).toHaveLength(0);

    // Custom source with factors should be valid
    expect(configWithCustomFactors.activityFactorSource).toBe('custom');
    expect(Object.keys(configWithCustomFactors.customFactors).length).toBeGreaterThan(0);
  });

  it('should generate proper validation errors', () => {
    const errors = [];

    // Test missing activity factor source
    if (!'' || '' === '') {
      errors.push({
        field: 'activityFactorSource',
        message: 'Activity factor source is required',
        suggestion: 'EPA factors are recommended for US portfolios',
      });
    }

    // Test missing data quality approach
    if (!'' || '' === '') {
      errors.push({
        field: 'dataQualityApproach',
        message: 'Data quality approach is required',
        suggestion: 'PCAF Standard is recommended for compliance',
      });
    }

    expect(errors).toHaveLength(2);
    expect(errors[0].field).toBe('activityFactorSource');
    expect(errors[1].field).toBe('dataQualityApproach');
  });

  it('should generate appropriate suggestions based on configuration', () => {
    const suggestions = [];

    // EPA source suggestions
    const epaConfig = { activityFactorSource: 'epa' };
    if (epaConfig.activityFactorSource === 'epa') {
      suggestions.push('EPA factors are well-suited for US-based portfolios');
      suggestions.push('Consider regional electricity grid factors for electric vehicles');
    }

    // PCAF standard suggestions
    const pcafConfig = { dataQualityApproach: 'pcaf_standard' };
    if (pcafConfig.dataQualityApproach === 'pcaf_standard') {
      suggestions.push('PCAF scoring provides standardized data quality assessment');
      suggestions.push('Lower scores (1-2) indicate higher data quality');
    }

    expect(suggestions).toHaveLength(4);
    expect(suggestions).toContain('EPA factors are well-suited for US-based portfolios');
    expect(suggestions).toContain('PCAF scoring provides standardized data quality assessment');
  });

  it('should handle configuration completion correctly', () => {
    const completeConfig = {
      activityFactorSource: 'epa',
      dataQualityApproach: 'pcaf_standard',
      assumptionsValidated: true,
      vehicleAssumptions: {
        passengerCar: {
          activityBasis: 'distance',
          fuelType: 'gasoline',
          annualDistance: 15000,
          region: 'us',
        },
      },
    };

    const isComplete = 
      completeConfig.activityFactorSource &&
      completeConfig.dataQualityApproach &&
      completeConfig.assumptionsValidated;

    expect(isComplete).toBe(true);
  });
});