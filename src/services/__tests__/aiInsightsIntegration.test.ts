// AI Insights Integration Tests
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { aiInsightsNarrativeService } from '../aiInsightsNarrativeService';
import { aiInsightsService } from '../aiInsightsService';
import { dataSynchronizationService } from '../dataSynchronizationService';

// Mock window object
const mockEventListeners: { [key: string]: Function[] } = {};
const mockWindow = {
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  removeEventListener: vi.fn()
};

// Store original window methods if they exist
const originalWindow = typeof window !== 'undefined' ? {
  addEventListener: window.addEventListener,
  dispatchEvent: window.dispatchEvent,
  removeEventListener: window.removeEventListener
} : null;

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();
  
  // Clear mock listeners
  Object.keys(mockEventListeners).forEach(key => {
    delete mockEventListeners[key];
  });
  
  // Setup window mock
  if (typeof window !== 'undefined') {
    // Mock window.addEventListener
    window.addEventListener = vi.fn((event: string, listener: Function) => {
      if (!mockEventListeners[event]) {
        mockEventListeners[event] = [];
      }
      mockEventListeners[event].push(listener);
    });
    
    // Mock window.dispatchEvent
    window.dispatchEvent = vi.fn((event: Event) => {
      const eventType = event.type;
      const listeners = mockEventListeners[eventType] || [];
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
      return true;
    });
  } else {
    // Create window mock for Node.js environment
    global.window = mockWindow as any;
    mockWindow.addEventListener.mockImplementation((event: string, listener: Function) => {
      if (!mockEventListeners[event]) {
        mockEventListeners[event] = [];
      }
      mockEventListeners[event].push(listener);
    });
    
    mockWindow.dispatchEvent.mockImplementation((event: Event) => {
      const eventType = event.type;
      const listeners = mockEventListeners[eventType] || [];
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
      return true;
    });
  }
});

afterEach(() => {
  // Restore original functions if they exist
  if (originalWindow && typeof window !== 'undefined') {
    window.addEventListener = originalWindow.addEventListener;
    window.dispatchEvent = originalWindow.dispatchEvent;
    window.removeEventListener = originalWindow.removeEventListener;
  } else if (typeof global !== 'undefined' && global.window) {
    // Clean up global window mock
    delete (global as any).window;
  }
  
  // Clear mock listeners
  Object.keys(mockEventListeners).forEach(key => {
    delete mockEventListeners[key];
  });
});

describe('AI Insights Integration', () => {
  describe('Data Ingestion Event Handling', () => {
    it('should listen for data ingestion completion events', () => {
      // Verify that event listeners are set up
      expect(window.addEventListener).toHaveBeenCalledWith(
        'dataIngestionComplete',
        expect.any(Function)
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        'aiInsightsRefresh',
        expect.any(Function)
      );
    });

    it('should update AI insights when data ingestion completes', async () => {
      const mockIngestionResult = {
        uploadId: 'test_upload_123',
        totalLoans: 500,
        successfulCalculations: 485,
        totalEmissions: 1250.5,
        averageDataQuality: 2.8,
        processingTime: '30 seconds',
        timestamp: new Date(),
        fromMock: false
      };

      // Spy on the handleDataIngestionComplete method
      const handleIngestionSpy = vi.spyOn(
        aiInsightsNarrativeService as any,
        'handleDataIngestionComplete'
      );

      // Dispatch the event
      const event = {
        type: 'dataIngestionComplete',
        detail: mockIngestionResult
      } as CustomEvent;
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(event as any);
      } else {
        mockWindow.dispatchEvent(event as any);
      }

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the handler was called
      expect(handleIngestionSpy).toHaveBeenCalledWith(mockIngestionResult);
    });

    it('should extract correct portfolio metrics from ingestion result', () => {
      const mockIngestionResult = {
        uploadId: 'test_upload_456',
        totalLoans: 1000,
        successfulCalculations: 950,
        totalEmissions: 2500.0,
        averageDataQuality: 2.5,
        processingTime: '60 seconds',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        fromMock: false
      };

      // Access private method for testing
      const extractMetrics = (aiInsightsNarrativeService as any)
        .extractPortfolioMetricsFromIngestion;
      
      const metrics = extractMetrics.call(
        aiInsightsNarrativeService,
        mockIngestionResult
      );

      expect(metrics).toEqual({
        totalFinancedEmissions: 2500.0,
        emissionIntensity: 50.0, // (2500 / (1000 * 50000)) * 1000
        dataQualityScore: 2.5,
        totalLoans: 1000,
        totalExposure: 50000000, // 1000 * 50000
        complianceStatus: 'Excellent',
        lastUpdated: new Date('2024-01-15T10:30:00Z'),
        dataVersion: 'ingestion_test_upload_456'
      });
    });
  });

  describe('AI Insights Service Integration', () => {
    it('should update insights state when data synchronization occurs', async () => {
      const mockUpdateEvent = {
        component: 'ai-insights',
        action: 'recalculate' as const,
        data: {
          uploadId: 'test_789',
          totalLoans: 750,
          totalEmissions: 1875.0,
          averageDataQuality: 2.2
        },
        timestamp: new Date()
      };

      // Get initial state
      const initialState = aiInsightsService.getState();
      expect(initialState.insights).toBeNull();

      // Simulate data synchronization update
      const subscribers = (dataSynchronizationService as any).updateListeners.get('ai-insights') || [];
      
      // Manually trigger the update (simulating what dataSynchronizationService would do)
      subscribers.forEach((callback: Function) => {
        callback(mockUpdateEvent);
      });

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify state was updated
      const updatedState = aiInsightsService.getState();
      expect(updatedState.lastUpdated).toBeTruthy();
    });

    it('should handle errors gracefully during insight updates', async () => {
      const mockIngestionResult = {
        uploadId: 'error_test',
        totalLoans: 0, // This might cause division by zero
        successfulCalculations: 0,
        totalEmissions: 0,
        averageDataQuality: 5.0, // Invalid data quality score
        processingTime: '0 seconds',
        timestamp: new Date(),
        fromMock: false
      };

      // This should not throw an error
      expect(async () => {
        await aiInsightsNarrativeService.handleDataIngestionComplete(mockIngestionResult);
      }).not.toThrow();

      // Verify error state is handled
      const state = aiInsightsService.getState();
      // The service should either have insights or an error, but not crash
      expect(state.error !== null || state.insights !== null).toBe(true);
    });
  });

  describe('Data Synchronization Service Integration', () => {
    it('should call AI insights update during ingestion completion', async () => {
      const mockIngestionResult = {
        uploadId: 'sync_test_123',
        totalLoans: 300,
        successfulCalculations: 295,
        totalEmissions: 750.0,
        averageDataQuality: 2.7,
        processingTime: '25 seconds',
        timestamp: new Date(),
        fromMock: false
      };

      // Spy on the updateAIInsights method
      const updateAIInsightsSpy = vi.spyOn(
        dataSynchronizationService,
        'updateAIInsights'
      );

      // Call onIngestionComplete
      await dataSynchronizationService.onIngestionComplete(mockIngestionResult);

      // Verify AI insights update was called
      expect(updateAIInsightsSpy).toHaveBeenCalledWith(mockIngestionResult);
    });

    it('should calculate emission intensity correctly', () => {
      const mockIngestionResult = {
        uploadId: 'intensity_test',
        totalLoans: 100,
        successfulCalculations: 100,
        totalEmissions: 500.0,
        averageDataQuality: 2.0,
        processingTime: '10 seconds',
        timestamp: new Date(),
        fromMock: false
      };

      // Access private method for testing
      const calculateIntensity = (dataSynchronizationService as any)
        .calculateEmissionIntensity;
      
      const intensity = calculateIntensity.call(
        dataSynchronizationService,
        mockIngestionResult
      );

      // Expected: (500 / (100 * 50000)) * 1000 = 10.0
      expect(intensity).toBe(10.0);
    });

    it('should determine compliance status correctly', () => {
      const determineStatus = (dataSynchronizationService as any)
        .determineComplianceStatus;

      expect(determineStatus.call(dataSynchronizationService, 2.0)).toBe('Excellent');
      expect(determineStatus.call(dataSynchronizationService, 2.8)).toBe('Compliant');
      expect(determineStatus.call(dataSynchronizationService, 3.2)).toBe('Needs Improvement');
      expect(determineStatus.call(dataSynchronizationService, 4.0)).toBe('Critical');
    });
  });

  describe('End-to-End Integration', () => {
    it('should complete full integration flow from ingestion to insights', async () => {
      const mockIngestionResult = {
        uploadId: 'e2e_test_456',
        totalLoans: 1500,
        successfulCalculations: 1450,
        totalEmissions: 3750.0,
        averageDataQuality: 2.3,
        processingTime: '90 seconds',
        timestamp: new Date(),
        fromMock: false
      };

      // Track state changes
      const stateChanges: any[] = [];
      const unsubscribe = aiInsightsService.subscribe((state) => {
        stateChanges.push({ ...state });
      });

      try {
        // Simulate the complete flow
        await dataSynchronizationService.onIngestionComplete(mockIngestionResult);
        
        // Wait for all async operations
        await new Promise(resolve => setTimeout(resolve, 300));

        // Verify we got state updates
        expect(stateChanges.length).toBeGreaterThan(0);
        
        // Verify final state has insights
        const finalState = aiInsightsService.getState();
        expect(finalState.insights).toBeTruthy();
        expect(finalState.lastUpdated).toBeTruthy();
        expect(finalState.error).toBeNull();

      } finally {
        unsubscribe();
      }
    });
  });
});

describe('AI Insights Narrative Generation', () => {
  it('should generate insights with updated portfolio data', () => {
    const mockMetrics = {
      totalFinancedEmissions: 2500.0,
      emissionIntensity: 2.5,
      dataQualityScore: 2.8,
      totalLoans: 1000,
      totalExposure: 50000000,
      complianceStatus: 'Compliant',
      lastUpdated: new Date(),
      dataVersion: 'test_v1'
    };

    const insights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
      mockMetrics,
      'risk_manager'
    );

    expect(insights).toBeDefined();
    expect(insights.title).toBe('Portfolio Climate Performance Analysis');
    expect(insights.narrative).toContain('2,500');
    expect(insights.narrative).toContain('1,000');
    expect(insights.keyTakeaways).toHaveLength(3);
    expect(insights.actionItems.length).toBeGreaterThan(0);
    expect(insights.businessImpact).toBeTruthy();
    expect(insights.riskAssessment).toBeTruthy();
  });

  it('should generate role-specific insights', () => {
    const mockMetrics = {
      totalFinancedEmissions: 1000.0,
      emissionIntensity: 2.0,
      dataQualityScore: 2.5,
      totalLoans: 500,
      totalExposure: 25000000,
      complianceStatus: 'Excellent'
    };

    const executiveInsights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
      mockMetrics,
      'executive'
    );

    const riskManagerInsights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
      mockMetrics,
      'risk_manager'
    );

    // Should have different content for different roles
    expect(executiveInsights.narrative).not.toBe(riskManagerInsights.narrative);
    expect(executiveInsights.actionItems).not.toEqual(riskManagerInsights.actionItems);
  });
});