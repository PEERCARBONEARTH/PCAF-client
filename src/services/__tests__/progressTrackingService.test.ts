import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { progressTrackingService } from '../progressTrackingService';

// Mock the real-time service
vi.mock('../realTimeService', () => ({
  realTimeService: {
    subscribe: vi.fn(() => vi.fn()), // Return unsubscribe function
    send: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('ProgressTrackingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Clear any existing state
    progressTrackingService.clearHistory();
  });

  afterEach(() => {
    // Clean up any timers
    vi.clearAllTimers();
  });

  describe('Operation Management', () => {
    it('should start a new operation', () => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation', 
        100
      );

      expect(operationId).toMatch(/^op_\d+_[a-z0-9]+$/);
      
      const state = progressTrackingService.getProgressState();
      expect(state.isActive).toBe(true);
      expect(state.currentOperation).toBeDefined();
      expect(state.currentOperation?.stepId).toBe('test-step');
      expect(state.currentOperation?.operation).toBe('test-operation');
      expect(state.currentOperation?.totalItems).toBe(100);
      expect(state.currentOperation?.progress).toBe(0);
      expect(state.currentOperation?.status).toBe('in_progress');
    });

    it('should update operation progress', () => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );

      progressTrackingService.updateProgressById(
        operationId, 
        50, 
        'Half way done', 
        25
      );

      const state = progressTrackingService.getProgressState();
      expect(state.currentOperation?.progress).toBe(50);
      expect(state.currentOperation?.message).toBe('Half way done');
      expect(state.currentOperation?.processedItems).toBe(25);
      expect(state.overallProgress).toBe(50);
    });

    it('should complete an operation', () => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );

      progressTrackingService.completeOperation(operationId, 'All done!');

      const state = progressTrackingService.getProgressState();
      expect(state.isActive).toBe(false);
      expect(state.currentOperation).toBeUndefined();
      expect(state.recentUpdates).toHaveLength(2); // Start + complete
      expect(state.recentUpdates[0].status).toBe('completed');
      expect(state.recentUpdates[0].progress).toBe(100);
      expect(state.recentUpdates[0].message).toBe('All done!');
    });

    it('should fail an operation', () => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );

      progressTrackingService.failOperation(operationId, 'Something went wrong');

      const state = progressTrackingService.getProgressState();
      expect(state.isActive).toBe(false);
      expect(state.currentOperation).toBeUndefined();
      expect(state.recentUpdates[0].status).toBe('failed');
      expect(state.recentUpdates[0].message).toBe('Something went wrong');
    });

    it('should pause and resume an operation', () => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );

      // Pause
      progressTrackingService.pauseOperation(operationId, 'User requested pause');
      let state = progressTrackingService.getProgressState();
      expect(state.currentOperation?.status).toBe('paused');
      expect(state.currentOperation?.message).toBe('User requested pause');

      // Resume
      progressTrackingService.resumeOperation(operationId);
      state = progressTrackingService.getProgressState();
      expect(state.currentOperation?.status).toBe('in_progress');
      expect(state.currentOperation?.message).toBe('Operation resumed');
    });
  });

  describe('Progress Calculation', () => {
    it('should clamp progress values between 0 and 100', () => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );

      // Test negative value
      progressTrackingService.updateProgressById(operationId, -10);
      let state = progressTrackingService.getProgressState();
      expect(state.currentOperation?.progress).toBe(0);

      // Test value over 100
      progressTrackingService.updateProgressById(operationId, 150);
      state = progressTrackingService.getProgressState();
      expect(state.currentOperation?.progress).toBe(100);
    });

    it('should maintain recent updates history', () => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );

      // Add multiple updates
      for (let i = 1; i <= 15; i++) {
        progressTrackingService.updateProgressById(
          operationId, 
          i * 5, 
          `Update ${i}`
        );
      }

      const state = progressTrackingService.getProgressState();
      // Should keep only the 10 most recent updates (plus the initial start)
      expect(state.recentUpdates.length).toBe(10);
      expect(state.recentUpdates[0].message).toBe('Update 15');
    });
  });

  describe('State Persistence', () => {
    it('should persist state to localStorage', (done) => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );

      progressTrackingService.updateProgressById(operationId, 50, 'Test message');

      // Wait for persistence timer
      setTimeout(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'pcaf_progress_state',
          expect.stringContaining('"progress":50')
        );
        done();
      }, 2100); // Slightly longer than persistence interval
    });

    it('should load persisted state on initialization', () => {
      const mockState = {
        recentUpdates: [{
          id: 'test-1',
          stepId: 'test-step',
          operation: 'test-op',
          progress: 75,
          status: 'completed',
          message: 'Persisted operation',
          timestamp: new Date().toISOString()
        }],
        overallProgress: 75,
        isActive: false,
        persistedAt: new Date().toISOString()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));

      // Create a new instance to test loading
      const newService = new (progressTrackingService.constructor as any)();
      const state = newService.getProgressState();

      expect(state.recentUpdates).toHaveLength(1);
      expect(state.recentUpdates[0].message).toBe('Persisted operation');
      expect(state.overallProgress).toBe(75);
    });

    it('should ignore expired persisted state', () => {
      const expiredState = {
        recentUpdates: [],
        overallProgress: 50,
        isActive: false,
        persistedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredState));

      // Create a new instance to test loading
      const newService = new (progressTrackingService.constructor as any)();
      const state = newService.getProgressState();

      expect(state.overallProgress).toBe(0); // Should be reset
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('pcaf_progress_state');
    });
  });

  describe('Real-time Integration', () => {
    it('should subscribe to real-time updates on initialization', async () => {
      const { realTimeService } = await import('../realTimeService');
      expect(realTimeService.subscribe).toHaveBeenCalledWith(
        'upload_progress',
        expect.any(Function)
      );
      expect(realTimeService.subscribe).toHaveBeenCalledWith(
        'batch_job_update',
        expect.any(Function)
      );
    });

    it('should handle real-time progress updates', async () => {
      const { realTimeService } = await import('../realTimeService');
      // Get the callback function passed to subscribe
      const mockSubscribe = realTimeService.subscribe as any;
      const progressCallback = mockSubscribe.mock.calls.find(
        (call: any) => call[0] === 'upload_progress'
      )[1];

      const realTimeUpdate = {
        id: 'rt-update-1',
        type: 'upload_progress',
        data: {
          stepId: 'upload',
          operation: 'file_upload',
          progress: 60,
          status: 'processing',
          message: 'Uploading file...',
          totalItems: 100,
          processedItems: 60
        },
        timestamp: new Date()
      };

      progressCallback(realTimeUpdate);

      const state = progressTrackingService.getProgressState();
      expect(state.recentUpdates[0].progress).toBe(60);
      expect(state.recentUpdates[0].message).toBe('Uploading file...');
      expect(state.recentUpdates[0].status).toBe('in_progress');
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate performance metrics', () => {
      // Create some completed operations
      const op1 = progressTrackingService.startOperation('step1', 'op1', 100);
      progressTrackingService.updateProgress({
        id: op1,
        stepId: 'step1',
        operation: 'op1',
        progress: 100,
        status: 'completed',
        message: 'Done',
        timestamp: new Date(),
        totalItems: 100,
        processedItems: 100,
        metadata: { duration: 5000 } // 5 seconds
      });

      const op2 = progressTrackingService.startOperation('step2', 'op2', 50);
      progressTrackingService.updateProgress({
        id: op2,
        stepId: 'step2',
        operation: 'op2',
        progress: 100,
        status: 'failed',
        message: 'Failed',
        timestamp: new Date(),
        totalItems: 50,
        processedItems: 25,
        metadata: { duration: 3000 } // 3 seconds
      });

      const metrics = progressTrackingService.getProgressMetrics();
      
      expect(metrics.successRate).toBe(50); // 1 success out of 2 operations
      expect(metrics.errorRate).toBe(50); // 1 failure out of 2 operations
      expect(metrics.averageProcessingTime).toBe(5000); // Only completed operations
      expect(metrics.itemsPerSecond).toBeGreaterThan(0);
    });

    it('should return zero metrics when no operations exist', () => {
      const metrics = progressTrackingService.getProgressMetrics();
      
      expect(metrics.successRate).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageProcessingTime).toBe(0);
      expect(metrics.itemsPerSecond).toBe(0);
    });
  });

  describe('Subscription Management', () => {
    it('should notify subscribers of state changes', () => {
      const mockListener = vi.fn();
      const unsubscribe = progressTrackingService.subscribe(mockListener);

      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          currentOperation: expect.objectContaining({
            id: operationId,
            stepId: 'test-step'
          })
        })
      );

      // Test unsubscribe
      unsubscribe();
      mockListener.mockClear();

      progressTrackingService.updateProgressById(operationId, 50);
      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      progressTrackingService.subscribe(errorListener);
      progressTrackingService.subscribe(normalListener);

      // This should not throw despite the error listener
      expect(() => {
        progressTrackingService.startOperation('test-step', 'test-operation');
      }).not.toThrow();

      // Normal listener should still be called
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    it('should correctly identify active operations', () => {
      expect(progressTrackingService.isOperationActive()).toBe(false);

      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );
      expect(progressTrackingService.isOperationActive()).toBe(true);

      progressTrackingService.completeOperation(operationId);
      expect(progressTrackingService.isOperationActive()).toBe(false);
    });

    it('should clear history', () => {
      const operationId = progressTrackingService.startOperation(
        'test-step', 
        'test-operation'
      );
      progressTrackingService.completeOperation(operationId);

      let state = progressTrackingService.getProgressState();
      expect(state.recentUpdates.length).toBeGreaterThan(0);

      progressTrackingService.clearHistory();
      state = progressTrackingService.getProgressState();
      expect(state.recentUpdates).toHaveLength(0);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('pcaf_progress_state');
    });
  });
});