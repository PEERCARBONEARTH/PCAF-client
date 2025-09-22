import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataIngestionWorkflowService } from '../dataIngestionWorkflowService';
import { mockDataService } from '../mockDataService';

// Mock dependencies
vi.mock('../serviceAbstractionLayer');
vi.mock('../mockDataService');
vi.mock('../errorHandlingService');
vi.mock('../dataSynchronizationService');
vi.mock('../realTimeService');

describe('DataIngestionWorkflowService', () => {
  beforeEach(() => {
    // Reset workflow state before each test
    dataIngestionWorkflowService.resetWorkflow();
    vi.clearAllMocks();
  });

  describe('Workflow State Management', () => {
    it('should initialize with correct default state', () => {
      const state = dataIngestionWorkflowService.getWorkflowState();
      
      expect(state.currentStep).toBe('source');
      expect(state.isComplete).toBe(false);
      expect(state.errors).toEqual([]);
      expect(state.warnings).toEqual([]);
      expect(state.mockMode).toBe(false);
      expect(state.overallProgress).toBe(0);
    });

    it('should persist state to localStorage', () => {
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

      // Complete a step to trigger state save
      dataIngestionWorkflowService.completeStep('source', { test: 'data' });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'pcaf_workflow_state',
        expect.stringContaining('"currentStep":"methodology"')
      );
    });

    it('should handle step completion correctly', async () => {
      const testData = { fileName: 'test.csv', recordCount: 100 };
      
      await dataIngestionWorkflowService.completeStep('source', testData);
      
      const state = dataIngestionWorkflowService.getWorkflowState();
      expect(state.steps.source.status).toBe('completed');
      expect(state.steps.source.data).toEqual(testData);
      expect(state.currentStep).toBe('methodology');
      expect(state.overallProgress).toBe(25); // 1/4 steps complete
    });

    it('should handle step errors correctly', async () => {
      const mockError = new Error('Test error');
      
      // Mock a failing step
      vi.spyOn(dataIngestionWorkflowService, 'processDataSource').mockRejectedValue(mockError);
      
      try {
        await dataIngestionWorkflowService.completeStep('source', {});
      } catch (error) {
        // Expected to throw
      }
      
      const state = dataIngestionWorkflowService.getWorkflowState();
      expect(state.errors.length).toBeGreaterThan(0);
      expect(state.canRetry).toBe(true);
      expect(state.steps.source.status).toBe('error');
    });
  });

  describe('Mock Mode and Graceful Degradation', () => {
    it('should enable mock mode when services fail', async () => {
      dataIngestionWorkflowService.enableMockMode('Service unavailable');
      
      const state = dataIngestionWorkflowService.getWorkflowState();
      expect(state.mockMode).toBe(true);
      expect(state.degradationReason).toBe('Service unavailable');
    });

    it('should use mock data when in mock mode', async () => {
      dataIngestionWorkflowService.enableMockMode();
      
      const result = await dataIngestionWorkflowService.processDataSource({
        source: 'csv',
        fileName: 'test.csv'
      });
      
      expect(result.fromMock).toBe(true);
      expect(result.recordCount).toBeGreaterThan(0);
    });

    it('should fallback to mock mode on service failure', async () => {
      // Mock service failure
      vi.spyOn(dataIngestionWorkflowService, 'processCsvUpload').mockRejectedValue(
        new Error('Service unavailable')
      );
      
      const result = await dataIngestionWorkflowService.processDataSource({
        source: 'csv',
        fileName: 'test.csv'
      });
      
      expect(result.fromMock).toBe(true);
    });
  });

  describe('Data Processing', () => {
    it('should process CSV upload successfully', async () => {
      const config = {
        source: 'csv',
        fileName: 'test.csv',
        file: new File(['test'], 'test.csv', { type: 'text/csv' })
      };
      
      const result = await dataIngestionWorkflowService.processDataSource(config);
      
      expect(result.type).toBe('csv');
      expect(result.fileName).toBe('test.csv');
      expect(result.status).toBe('uploaded');
    });

    it('should validate data correctly', async () => {
      const validationConfig = { validateFormat: true };
      
      const result = await dataIngestionWorkflowService.validateData(validationConfig);
      
      expect(result).toHaveProperty('dataFormat');
      expect(result).toHaveProperty('methodology');
      expect(result).toHaveProperty('pcafCompliance');
    });

    it('should process emissions calculations', async () => {
      // Set up prerequisite data
      await dataIngestionWorkflowService.completeStep('source', { uploadId: 'test123' });
      await dataIngestionWorkflowService.completeStep('methodology', { activityFactorSource: 'epa' });
      
      const result = await dataIngestionWorkflowService.processEmissions({});
      
      expect(result).toHaveProperty('totalLoans');
      expect(result).toHaveProperty('totalEmissions');
      expect(result).toHaveProperty('averageDataQuality');
    });
  });

  describe('Error Handling', () => {
    it('should classify and handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      
      try {
        await dataIngestionWorkflowService.completeStep('source', {});
      } catch (error) {
        // Expected
      }
      
      const state = dataIngestionWorkflowService.getWorkflowState();
      expect(state.errors.length).toBeGreaterThan(0);
    });

    it('should provide retry functionality', async () => {
      // Simulate error
      const state = dataIngestionWorkflowService.getWorkflowState();
      state.canRetry = true;
      state.steps.source.status = 'error';
      
      await dataIngestionWorkflowService.retryStep('source');
      
      const updatedState = dataIngestionWorkflowService.getWorkflowState();
      expect(updatedState.steps.source.status).toBe('active');
      expect(updatedState.currentStep).toBe('source');
    });

    it('should allow skipping steps with warnings', () => {
      dataIngestionWorkflowService.skipStep('methodology', 'User requested skip');
      
      const state = dataIngestionWorkflowService.getWorkflowState();
      expect(state.steps.methodology.status).toBe('completed');
      expect(state.warnings.length).toBeGreaterThan(0);
      expect(state.currentStep).toBe('validation');
    });
  });

  describe('Complete Workflow', () => {
    it('should complete entire workflow successfully', async () => {
      // Complete all steps
      await dataIngestionWorkflowService.completeStep('source', { 
        uploadId: 'test123', 
        recordCount: 100 
      });
      
      await dataIngestionWorkflowService.completeStep('methodology', { 
        activityFactorSource: 'epa' 
      });
      
      await dataIngestionWorkflowService.completeStep('validation', { 
        dataFormat: { passed: true } 
      });
      
      await dataIngestionWorkflowService.completeStep('processing', { 
        totalLoans: 100,
        totalEmissions: 1000,
        averageDataQuality: 3.0
      });
      
      const state = dataIngestionWorkflowService.getWorkflowState();
      expect(state.isComplete).toBe(true);
      expect(state.overallProgress).toBe(100);
      expect(state.results).toBeDefined();
    });

    it('should trigger data synchronization on completion', async () => {
      const mockSyncService = vi.mocked(await import('../dataSynchronizationService'));
      
      // Complete workflow
      await dataIngestionWorkflowService.completeStep('source', { uploadId: 'test123' });
      await dataIngestionWorkflowService.completeStep('methodology', {});
      await dataIngestionWorkflowService.completeStep('validation', {});
      await dataIngestionWorkflowService.completeStep('processing', {
        totalLoans: 100,
        totalEmissions: 1000,
        averageDataQuality: 3.0
      });
      
      // Verify synchronization was triggered
      expect(mockSyncService.dataSynchronizationService.onIngestionComplete).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should allow navigation to completed steps', () => {
      // Complete source step
      dataIngestionWorkflowService.completeStep('source', { test: 'data' });
      
      // Should be able to navigate back to source
      dataIngestionWorkflowService.navigateToStep('source');
      
      const state = dataIngestionWorkflowService.getWorkflowState();
      expect(state.currentStep).toBe('source');
    });

    it('should prevent navigation to incomplete steps', () => {
      // Try to navigate to validation without completing previous steps
      expect(() => {
        dataIngestionWorkflowService.navigateToStep('validation');
      }).toThrow();
    });
  });

  describe('State Persistence', () => {
    it('should save and restore workflow state', () => {
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue(JSON.stringify({
          currentStep: 'methodology',
          steps: {
            source: { status: 'completed', data: { test: 'data' } }
          },
          isComplete: false,
          errors: [],
          warnings: [],
          mockMode: false,
          sessionId: 'test-session',
          overallProgress: 25,
          savedAt: new Date().toISOString()
        })),
        removeItem: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      
      // Create new service instance to trigger state loading
      const newService = new (dataIngestionWorkflowService.constructor as any)();
      const state = newService.getWorkflowState();
      
      expect(state.currentStep).toBe('methodology');
      expect(state.steps.source.status).toBe('completed');
    });

    it('should clear expired state', () => {
      const expiredState = {
        savedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago
      };
      
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn().mockReturnValue(JSON.stringify(expiredState)),
        removeItem: vi.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      
      // Should clear expired state
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('pcaf_workflow_state');
    });
  });
});