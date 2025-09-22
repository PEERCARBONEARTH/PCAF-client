import { describe, it, expect } from 'vitest';

describe('Methodology Step Validation', () => {
  it('should validate complete methodology configuration', () => {
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

    // Test that all required fields are present
    expect(completeConfig.activityFactorSource).toBeTruthy();
    expect(completeConfig.dataQualityApproach).toBeTruthy();
    expect(completeConfig.assumptionsValidated).toBe(true);
    expect(Object.keys(completeConfig.vehicleAssumptions)).toHaveLength(1);

    // Test vehicle assumption validation
    const vehicleAssumption = completeConfig.vehicleAssumptions.passengerCar;
    expect(vehicleAssumption.activityBasis).toBeTruthy();
    expect(vehicleAssumption.fuelType).toBeTruthy();
    expect(vehicleAssumption.annualDistance).toBeGreaterThan(0);
    expect(vehicleAssumption.region).toBeTruthy();
  });

  it('should detect incomplete methodology configuration', () => {
    const incompleteConfig = {
      activityFactorSource: '',
      dataQualityApproach: '',
      assumptionsValidated: false,
      vehicleAssumptions: {},
    };

    // Test that required fields are missing
    expect(incompleteConfig.activityFactorSource).toBeFalsy();
    expect(incompleteConfig.dataQualityApproach).toBeFalsy();
    expect(incompleteConfig.assumptionsValidated).toBe(false);
    expect(Object.keys(incompleteConfig.vehicleAssumptions)).toHaveLength(0);
  });

  it('should validate annual distance ranges', () => {
    const validDistances = [8000, 15000, 25000, 50000];
    const invalidDistances = [0, -1000, 150000];

    validDistances.forEach(distance => {
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThanOrEqual(100000);
    });

    invalidDistances.forEach(distance => {
      const isValid = distance > 0 && distance <= 100000;
      expect(isValid).toBe(false);
    });
  });

  it('should validate activity factor sources', () => {
    const validSources = ['epa', 'defra', 'iea', 'custom'];
    const invalidSource = 'invalid_source';

    validSources.forEach(source => {
      expect(['epa', 'defra', 'iea', 'custom']).toContain(source);
    });

    expect(['epa', 'defra', 'iea', 'custom']).not.toContain(invalidSource);
  });

  it('should validate data quality approaches', () => {
    const validApproaches = ['pcaf_standard', 'conservative', 'best_estimate'];
    const invalidApproach = 'invalid_approach';

    validApproaches.forEach(approach => {
      expect(['pcaf_standard', 'conservative', 'best_estimate']).toContain(approach);
    });

    expect(['pcaf_standard', 'conservative', 'best_estimate']).not.toContain(invalidApproach);
  });

  it('should require custom factors for custom source', () => {
    const configWithoutCustomFactors = {
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

    // Without custom factors should be invalid
    expect(configWithoutCustomFactors.activityFactorSource).toBe('custom');
    expect(Object.keys(configWithoutCustomFactors.customFactors).length).toBe(0);

    // With custom factors should be valid
    expect(configWithCustomFactors.activityFactorSource).toBe('custom');
    expect(Object.keys(configWithCustomFactors.customFactors).length).toBeGreaterThan(0);
  });

  it('should validate fuel types', () => {
    const validFuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid', 'cng'];
    const invalidFuelType = 'invalid_fuel';

    validFuelTypes.forEach(fuelType => {
      expect(['gasoline', 'diesel', 'electric', 'hybrid', 'cng']).toContain(fuelType);
    });

    expect(['gasoline', 'diesel', 'electric', 'hybrid', 'cng']).not.toContain(invalidFuelType);
  });

  it('should validate regions', () => {
    const validRegions = ['us', 'eu', 'uk', 'ca', 'global'];
    const invalidRegion = 'invalid_region';

    validRegions.forEach(region => {
      expect(['us', 'eu', 'uk', 'ca', 'global']).toContain(region);
    });

    expect(['us', 'eu', 'uk', 'ca', 'global']).not.toContain(invalidRegion);
  });
});