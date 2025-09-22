import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enhancedValidationService } from '../enhancedValidationService';
import type {
  FileValidationResult,
  DataValidationResult,
  StepValidationResult,
  MethodologyValidationResult,
} from '../enhancedValidationService';

// Mock file for testing
const createMockFile = (name: string, size: number, type: string, content?: string): File => {
  const file = new File([content || 'test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('EnhancedValidationService', () => {
  describe('File Validation', () => {
    it('should validate CSV file format correctly', async () => {
      const validFile = createMockFile('test.csv', 1024, 'text/csv');
      const result = await enhancedValidationService.validateFile(validFile);

      expect(result.fileName).toBe('test.csv');
      expect(result.fileSize).toBe(1024);
      expect(result.isValid).toBe(true);
    });

    it('should reject non-CSV files', async () => {
      const invalidFile = createMockFile(
        'test.xlsx',
        1024,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      const result = await enhancedValidationService.validateFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'invalid_format',
          severity: 'error',
        })
      );
    });

    it('should warn about large files', async () => {
      const largeFile = createMockFile('large.csv', 15 * 1024 * 1024, 'text/csv'); // 15MB
      const result = await enhancedValidationService.validateFile(largeFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'large_file',
          severity: 'warning',
        })
      );
    });

    it('should reject files that are too large', async () => {
      const tooLargeFile = createMockFile('huge.csv', 60 * 1024 * 1024, 'text/csv'); // 60MB
      const result = await enhancedValidationService.validateFile(tooLargeFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'file_too_large',
          severity: 'error',
        })
      );
    });
  });

  describe('CSV Data Validation', () => {
    it('should validate complete loan data correctly', async () => {
      const validData = [
        {
          loan_id: 'LOAN001',
          outstanding_balance: '25000',
          vehicle_make: 'Toyota',
          vehicle_model: 'Camry',
          vehicle_year: '2020',
          fuel_type: 'gasoline',
          efficiency_mpg: '28',
        },
        {
          loan_id: 'LOAN002',
          outstanding_balance: '35000',
          vehicle_make: 'Honda',
          vehicle_model: 'Accord',
          vehicle_year: '2019',
          fuel_type: 'gasoline',
          efficiency_mpg: '30',
        },
      ];

      const result = await enhancedValidationService.validateCSVData(validData);

      expect(result.isValid).toBe(true);
      expect(result.summary.totalRows).toBe(2);
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.errorRows).toBe(0);
      expect(result.summary.completenessScore).toBeGreaterThan(90);
    });

    it('should identify missing required fields', async () => {
      const invalidData = [
        {
          loan_id: '', // Missing loan ID
          outstanding_balance: '25000',
          vehicle_make: 'Toyota',
        },
        {
          loan_id: 'LOAN002',
          outstanding_balance: '0', // Invalid balance
          vehicle_make: 'Honda',
        },
      ];

      const result = await enhancedValidationService.validateCSVData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.summary.errorRows).toBe(2);
      expect(result.rowLevelErrors).toHaveLength(2);

      // Check for specific errors
      expect(result.rowLevelErrors).toContainEqual(
        expect.objectContaining({
          rowIndex: 0,
          columnName: 'loan_id',
          severity: 'error',
        })
      );

      expect(result.rowLevelErrors).toContainEqual(
        expect.objectContaining({
          rowIndex: 1,
          columnName: 'outstanding_balance',
          severity: 'error',
        })
      );
    });

    it('should warn about unreasonable values', async () => {
      const dataWithWarnings = [
        {
          loan_id: 'LOAN001',
          outstanding_balance: '25000',
          vehicle_year: '1985', // Too old
          efficiency_mpg: '150', // Too high
        },
      ];

      const result = await enhancedValidationService.validateCSVData(dataWithWarnings);

      expect(result.summary.warningRows).toBe(1);
      expect(result.rowLevelErrors.filter(e => e.severity === 'warning')).toHaveLength(2);
    });

    it('should handle empty data gracefully', async () => {
      const result = await enhancedValidationService.validateCSVData([]);

      expect(result.isValid).toBe(false);
      expect(result.summary.totalRows).toBe(0);
      expect(result.recommendations).toContain('No data to validate');
    });
  });

  describe('Step Validation', () => {
    describe('Source Step', () => {
      it('should validate complete source configuration', async () => {
        const sourceData = {
          source: 'csv',
          file: createMockFile('test.csv', 1024, 'text/csv'),
          fileName: 'test.csv',
        };

        const result = await enhancedValidationService.validateStep('source', sourceData);

        expect(result.isValid).toBe(true);
        expect(result.canProceed).toBe(true);
        expect(result.stepId).toBe('source');
        expect(result.completeness).toBeGreaterThan(90);
      });

      it('should require data source selection', async () => {
        const result = await enhancedValidationService.validateStep('source', {});

        expect(result.isValid).toBe(false);
        expect(result.canProceed).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'source',
            severity: 'error',
          })
        );
      });

      it('should require file for CSV source', async () => {
        const sourceData = { source: 'csv' };
        const result = await enhancedValidationService.validateStep('source', sourceData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'file',
            severity: 'error',
          })
        );
      });

      it('should require endpoint for API source', async () => {
        const sourceData = { source: 'api' };
        const result = await enhancedValidationService.validateStep('source', sourceData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'endpoint',
            severity: 'error',
          })
        );
      });
    });

    describe('Methodology Step', () => {
      it('should validate complete methodology configuration', async () => {
        const methodologyData = {
          activityFactorSource: 'epa',
          dataQualityApproach: 'pcaf_standard',
          assumptionsValidated: true,
          vehicleAssumptions: {
            passenger_car: {
              activityBasis: 'distance',
              fuelType: 'gasoline',
              annualDistance: 12000,
              region: 'US',
            },
          },
        };

        const result = (await enhancedValidationService.validateStep(
          'methodology',
          methodologyData
        )) as MethodologyValidationResult;

        expect(result.isValid).toBe(true);
        expect(result.canProceed).toBe(true);
        expect(result.vehicleAssumptionValidation['passenger_car'].isValid).toBe(true);
        expect(result.pcafCompliancePreview.estimatedOption).toBe('2a');
      });

      it('should require activity factor source', async () => {
        const result = await enhancedValidationService.validateStep('methodology', {});

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'activityFactorSource',
            severity: 'error',
          })
        );
      });

      it('should validate vehicle assumptions', async () => {
        const methodologyData = {
          activityFactorSource: 'epa',
          dataQualityApproach: 'pcaf_standard',
          vehicleAssumptions: {
            passenger_car: {
              activityBasis: 'distance',
              fuelType: '', // Missing fuel type
              annualDistance: 0, // Invalid distance
              region: 'US',
            },
          },
        };

        const result = (await enhancedValidationService.validateStep(
          'methodology',
          methodologyData
        )) as MethodologyValidationResult;

        expect(result.isValid).toBe(false);
        expect(result.vehicleAssumptionValidation['passenger_car'].isValid).toBe(false);
        expect(result.vehicleAssumptionValidation['passenger_car'].errors).toContain(
          'Fuel type is required'
        );
        expect(result.vehicleAssumptionValidation['passenger_car'].errors).toContain(
          'Annual distance must be greater than 0'
        );
      });

      it('should warn about high annual distance', async () => {
        const methodologyData = {
          activityFactorSource: 'epa',
          dataQualityApproach: 'pcaf_standard',
          vehicleAssumptions: {
            passenger_car: {
              activityBasis: 'distance',
              fuelType: 'gasoline',
              annualDistance: 60000, // Very high
              region: 'US',
            },
          },
        };

        const result = (await enhancedValidationService.validateStep(
          'methodology',
          methodologyData
        )) as MethodologyValidationResult;

        expect(result.vehicleAssumptionValidation['passenger_car'].warnings).toEqual(
          expect.arrayContaining([expect.stringContaining('High annual distance')])
        );
      });

      it('should validate custom factors when using custom source', async () => {
        const methodologyData = {
          activityFactorSource: 'custom',
          dataQualityApproach: 'pcaf_standard',
          vehicleAssumptions: {
            passenger_car: {
              activityBasis: 'distance',
              fuelType: 'gasoline',
              annualDistance: 12000,
              region: 'US',
            },
          },
          // Missing customFactors
        };

        const result = (await enhancedValidationService.validateStep(
          'methodology',
          methodologyData
        )) as MethodologyValidationResult;

        expect(result.isValid).toBe(false);
        expect(result.customFactorValidation?.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'customFactors',
            severity: 'error',
          })
        );
      });
    });

    describe('Validation Step', () => {
      it('should require validation results', async () => {
        const result = await enhancedValidationService.validateStep('validation', {});

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'validationResults',
            severity: 'error',
          })
        );
      });

      it('should handle high error rates', async () => {
        const validationData = {
          validationResults: {
            summary: {
              totalRows: 100,
              errorRows: 15, // 15% error rate
              completenessScore: 85,
            },
          },
        };

        const result = await enhancedValidationService.validateStep('validation', validationData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'dataQuality',
            severity: 'error',
          })
        );
      });

      it('should allow proceeding with warnings for moderate error rates', async () => {
        const validationData = {
          validationResults: {
            summary: {
              totalRows: 100,
              errorRows: 7, // 7% error rate
              completenessScore: 85,
            },
          },
        };

        const result = await enhancedValidationService.validateStep('validation', validationData);

        expect(result.isValid).toBe(true);
        expect(result.canProceed).toBe(true);
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            field: 'dataQuality',
          })
        );
      });
    });

    describe('Processing Step', () => {
      it('should validate successful processing', async () => {
        const processingData = {
          totalLoans: 100,
          successfulCalculations: 95,
        };

        const result = await enhancedValidationService.validateStep('processing', processingData);

        expect(result.isValid).toBe(true);
        expect(result.canProceed).toBe(true);
      });

      it('should require loan processing', async () => {
        const result = await enhancedValidationService.validateStep('processing', {});

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'totalLoans',
            severity: 'error',
          })
        );
      });

      it('should handle high failure rates', async () => {
        const processingData = {
          totalLoans: 100,
          successfulCalculations: 70, // 30% failure rate
        };

        const result = await enhancedValidationService.validateStep('processing', processingData);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'calculationFailures',
            severity: 'error',
          })
        );
      });
    });
  });

  describe('Validation Requirements', () => {
    it('should return requirements for each step', () => {
      const sourceRequirements = enhancedValidationService.getValidationRequirements('source');
      expect(sourceRequirements).toBeDefined();
      expect(sourceRequirements.length).toBeGreaterThan(0);

      const methodologyRequirements =
        enhancedValidationService.getValidationRequirements('methodology');
      expect(methodologyRequirements).toBeDefined();
      expect(methodologyRequirements.length).toBeGreaterThan(0);

      const validationRequirements =
        enhancedValidationService.getValidationRequirements('validation');
      expect(validationRequirements).toBeDefined();
      expect(validationRequirements.length).toBeGreaterThan(0);
    });

    it('should include guidance and examples in requirements', () => {
      const requirements = enhancedValidationService.getValidationRequirements('file');

      requirements.forEach(req => {
        expect(req.guidance).toBeDefined();
        expect(req.guidance.length).toBeGreaterThan(0);
        expect(req.category).toBeDefined();
        expect(req.severity).toMatch(/^(error|warning|info)$/);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const result = await enhancedValidationService.validateStep('unknown_step', {});

      expect(result.isValid).toBe(false);
      expect(result.canProceed).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'general',
          severity: 'error',
        })
      );
    });

    it('should provide helpful error messages', async () => {
      const result = await enhancedValidationService.validateStep('source', {});

      result.errors.forEach(error => {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
        expect(error.guidance).toBeDefined();
      });
    });
  });
});
