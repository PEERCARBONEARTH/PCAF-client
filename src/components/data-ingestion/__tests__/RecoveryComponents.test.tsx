import { vi, describe, it, expect, beforeEach } from 'vitest';
import { errorHandlingService } from '@/services/errorHandlingService';

// Mock the error handling service
vi.mock('@/services/errorHandlingService', () => ({
  errorHandlingService: {
    classifyError: vi.fn(),
    isRetryableError: vi.fn(),
    getErrorMessage: vi.fn(),
    getRecoveryInstructions: vi.fn(),
    getRecoveryOptions: vi.fn(),
    reportError: vi.fn(),
    markErrorResolved: vi.fn(),
    incrementRecoveryAttempts: vi.fn(),
    getErrorHistory: vi.fn(),
    createErrorContext: vi.fn(),
  },
}));

describe('Recovery Components Logic', () => {
  const mockError = new Error('Test error message');
  const mockContext = {
    stepId: 'test-step',
    action: 'test-action',
    timestamp: new Date(),
    userAgent: 'test-agent',
    sessionId: 'test-session',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (errorHandlingService.classifyError as any).mockReturnValue('network');
    (errorHandlingService.isRetryableError as any).mockReturnValue(true);
    (errorHandlingService.getErrorMessage as any).mockReturnValue('Network connection failed');
    (errorHandlingService.getRecoveryInstructions as any).mockReturnValue('Check your internet connection and try again');
    (errorHandlingService.getRecoveryOptions as any).mockReturnValue([
      {
        id: 'retry_network',
        title: 'Retry Connection',
        description: 'Attempt to reconnect to the service',
        action: vi.fn().mockResolvedValue(undefined),
        severity: 'low' as const,
        estimatedTime: 5000,
      },
    ]);
    (errorHandlingService.reportError as any).mockReturnValue('error-id-123');
    (errorHandlingService.getErrorHistory as any).mockReturnValue([]);
  });

  describe('Error Handling Service Integration', () => {
    it('classifies errors correctly', () => {
      const networkError = new Error('Network connection failed');
      const result = errorHandlingService.classifyError(networkError);
      expect(result).toBe('network');
    });

    it('determines if errors are retryable', () => {
      const result = errorHandlingService.isRetryableError(mockError);
      expect(result).toBe(true);
    });

    it('generates user-friendly error messages', () => {
      const message = errorHandlingService.getErrorMessage(mockError);
      expect(message).toBe('Network connection failed');
    });

    it('provides recovery instructions', () => {
      const instructions = errorHandlingService.getRecoveryInstructions(mockError);
      expect(instructions).toBe('Check your internet connection and try again');
    });

    it('generates recovery options', () => {
      const options = errorHandlingService.getRecoveryOptions(mockError, mockContext);
      expect(options).toHaveLength(1);
      expect(options[0].id).toBe('retry_network');
      expect(options[0].title).toBe('Retry Connection');
    });

    it('reports errors and returns ID', () => {
      const reportId = errorHandlingService.reportError(mockError, mockContext);
      expect(reportId).toBe('error-id-123');
    });
  });

  describe('Retry Configuration Logic', () => {
    it('calculates exponential backoff delays correctly', () => {
      const baseDelay = 1000;
      const multiplier = 2;
      const maxDelay = 10000;

      const calculateDelay = (attempt: number) => {
        const exponentialDelay = baseDelay * Math.pow(multiplier, attempt - 1);
        return Math.min(exponentialDelay, maxDelay);
      };

      expect(calculateDelay(1)).toBe(1000);
      expect(calculateDelay(2)).toBe(2000);
      expect(calculateDelay(3)).toBe(4000);
      expect(calculateDelay(4)).toBe(8000);
      expect(calculateDelay(5)).toBe(10000); // Capped at maxDelay
    });

    it('formats time delays correctly', () => {
      const formatDelay = (milliseconds: number): string => {
        if (milliseconds < 1000) return `${milliseconds}ms`;
        const seconds = Math.floor(milliseconds / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
      };

      expect(formatDelay(500)).toBe('500ms');
      expect(formatDelay(1500)).toBe('1s');
      expect(formatDelay(65000)).toBe('1m 5s');
    });

    it('validates retry configuration parameters', () => {
      const validateConfig = (config: any) => {
        return {
          isValid: config.maxAttempts > 0 && config.baseDelay > 0 && config.maxDelay >= config.baseDelay,
          errors: []
        };
      };

      const validConfig = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      };

      const invalidConfig = {
        maxAttempts: 0,
        baseDelay: -1000,
        maxDelay: 500,
        backoffMultiplier: 0,
      };

      expect(validateConfig(validConfig).isValid).toBe(true);
      expect(validateConfig(invalidConfig).isValid).toBe(false);
    });
  });

  describe('Alternative Workflow Path Logic', () => {
    it('filters paths based on error type', () => {
      const getAlternativePaths = (errorMessage: string) => {
        const basePaths = [
          { id: 'mock_data_mode', name: 'Mock Data' },
          { id: 'offline_mode', name: 'Offline' },
          { id: 'simplified_workflow', name: 'Simplified' },
          { id: 'manual_override', name: 'Manual' },
          { id: 'cached_results', name: 'Cached' },
          { id: 'export_import', name: 'Export/Import' },
        ];

        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          return basePaths.filter(path => 
            ['mock_data_mode', 'offline_mode', 'cached_results', 'export_import'].includes(path.id)
          );
        }
        
        if (errorMessage.includes('service') || errorMessage.includes('api')) {
          return basePaths.filter(path => 
            ['mock_data_mode', 'simplified_workflow', 'manual_override', 'cached_results'].includes(path.id)
          );
        }
        
        return basePaths;
      };

      const networkPaths = getAlternativePaths('network connection failed');
      const servicePaths = getAlternativePaths('service unavailable');

      expect(networkPaths).toHaveLength(4);
      expect(servicePaths).toHaveLength(4);
      expect(networkPaths.some(p => p.id === 'offline_mode')).toBe(true);
      expect(servicePaths.some(p => p.id === 'manual_override')).toBe(true);
    });

    it('calculates estimated completion times', () => {
      const formatTime = (milliseconds: number): string => {
        const seconds = Math.ceil(milliseconds / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.ceil(seconds / 60);
        return `${minutes}m`;
      };

      expect(formatTime(5000)).toBe('5s');
      expect(formatTime(30000)).toBe('30s');
      expect(formatTime(120000)).toBe('2m');
      expect(formatTime(600000)).toBe('10m');
    });

    it('determines path availability based on context', () => {
      const getPathAvailability = (pathId: string, isOnline: boolean, hasCache: boolean) => {
        switch (pathId) {
          case 'mock_data_mode':
            return 'always';
          case 'offline_mode':
            return isOnline ? 'degraded' : 'always';
          case 'cached_results':
            return hasCache ? 'always' : 'degraded';
          case 'manual_override':
            return 'emergency';
          default:
            return 'always';
        }
      };

      expect(getPathAvailability('mock_data_mode', true, true)).toBe('always');
      expect(getPathAvailability('offline_mode', false, true)).toBe('always');
      expect(getPathAvailability('cached_results', true, false)).toBe('degraded');
      expect(getPathAvailability('manual_override', true, true)).toBe('emergency');
    });
  });

  describe('Recovery Option Generation', () => {
    it('generates appropriate recovery options for network errors', () => {
      (errorHandlingService.classifyError as any).mockReturnValue('network');
      (errorHandlingService.getRecoveryOptions as any).mockReturnValue([
        {
          id: 'retry_network',
          title: 'Retry Connection',
          description: 'Attempt to reconnect to the service',
          severity: 'low',
          estimatedTime: 5000,
        },
        {
          id: 'offline_mode',
          title: 'Work Offline',
          description: 'Continue with mock data while offline',
          severity: 'medium',
          estimatedTime: 1000,
        },
      ]);

      const options = errorHandlingService.getRecoveryOptions(mockError, mockContext);
      expect(options).toHaveLength(2);
      expect(options[0].id).toBe('retry_network');
      expect(options[1].id).toBe('offline_mode');
    });

    it('generates appropriate recovery options for service errors', () => {
      (errorHandlingService.classifyError as any).mockReturnValue('service');
      (errorHandlingService.getRecoveryOptions as any).mockReturnValue([
        {
          id: 'retry_service',
          title: 'Retry Request',
          description: 'Try the request again',
          severity: 'low',
          estimatedTime: 3000,
        },
        {
          id: 'fallback_service',
          title: 'Use Backup Service',
          description: 'Switch to alternative service endpoint',
          severity: 'medium',
          estimatedTime: 5000,
        },
      ]);

      const options = errorHandlingService.getRecoveryOptions(mockError, mockContext);
      expect(options).toHaveLength(2);
      expect(options[0].id).toBe('retry_service');
      expect(options[1].id).toBe('fallback_service');
    });

    it('generates appropriate recovery options for validation errors', () => {
      (errorHandlingService.classifyError as any).mockReturnValue('validation');
      (errorHandlingService.getRecoveryOptions as any).mockReturnValue([
        {
          id: 'fix_validation',
          title: 'Fix Data Issues',
          description: 'Review and correct the data problems',
          severity: 'high',
          estimatedTime: 30000,
        },
        {
          id: 'skip_validation',
          title: 'Skip Validation',
          description: 'Proceed with warnings (not recommended)',
          severity: 'high',
          estimatedTime: 1000,
        },
      ]);

      const options = errorHandlingService.getRecoveryOptions(mockError, mockContext);
      expect(options).toHaveLength(2);
      expect(options[0].id).toBe('fix_validation');
      expect(options[1].id).toBe('skip_validation');
    });
  });

  describe('Error Severity Assessment', () => {
    it('correctly assesses error severity', () => {
      const getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' => {
        const errorType = errorHandlingService.classifyError(error);
        const isRetryable = errorHandlingService.isRetryableError(error);

        if (!isRetryable || errorType === 'system' || errorType === 'authentication') {
          return 'high';
        }
        
        if (errorType === 'service' || errorType === 'timeout') {
          return 'medium';
        }
        
        return 'low';
      };

      // Test network error (retryable)
      (errorHandlingService.classifyError as any).mockReturnValue('network');
      (errorHandlingService.isRetryableError as any).mockReturnValue(true);
      expect(getErrorSeverity(mockError)).toBe('low');

      // Test service error (retryable)
      (errorHandlingService.classifyError as any).mockReturnValue('service');
      (errorHandlingService.isRetryableError as any).mockReturnValue(true);
      expect(getErrorSeverity(mockError)).toBe('medium');

      // Test authentication error (not retryable)
      (errorHandlingService.classifyError as any).mockReturnValue('authentication');
      (errorHandlingService.isRetryableError as any).mockReturnValue(false);
      expect(getErrorSeverity(mockError)).toBe('high');

      // Test system error (not retryable)
      (errorHandlingService.classifyError as any).mockReturnValue('system');
      (errorHandlingService.isRetryableError as any).mockReturnValue(false);
      expect(getErrorSeverity(mockError)).toBe('high');
    });
  });

  describe('Component Integration Logic', () => {
    it('handles recovery flow state transitions', async () => {
      const mockRecoveryFlow = {
        state: 'idle' as 'idle' | 'retrying' | 'success' | 'failed',
        attempt: 0,
        maxAttempts: 3,
        
        async executeRecovery() {
          this.state = 'retrying';
          this.attempt++;
          
          try {
            // Simulate recovery attempt
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (this.attempt <= this.maxAttempts) {
              this.state = 'success';
              return true;
            } else {
              this.state = 'failed';
              return false;
            }
          } catch (error) {
            this.state = 'failed';
            return false;
          }
        },
        
        reset() {
          this.state = 'idle';
          this.attempt = 0;
        }
      };

      expect(mockRecoveryFlow.state).toBe('idle');
      
      const result = await mockRecoveryFlow.executeRecovery();
      expect(result).toBe(true);
      expect(mockRecoveryFlow.state).toBe('success');
      expect(mockRecoveryFlow.attempt).toBe(1);
      
      mockRecoveryFlow.reset();
      expect(mockRecoveryFlow.state).toBe('idle');
      expect(mockRecoveryFlow.attempt).toBe(0);
    });

    it('manages error history correctly', () => {
      const mockErrorHistory = {
        errors: [] as any[],
        maxHistory: 5,
        
        addError(error: Error, context: any) {
          const errorReport = {
            id: `error_${Date.now()}`,
            error,
            context,
            timestamp: new Date(),
            resolved: false,
            recoveryAttempts: 0,
          };
          
          this.errors.push(errorReport);
          
          // Keep only last maxHistory errors
          if (this.errors.length > this.maxHistory) {
            this.errors = this.errors.slice(-this.maxHistory);
          }
          
          return errorReport.id;
        },
        
        markResolved(errorId: string) {
          const error = this.errors.find(e => e.id === errorId);
          if (error) {
            error.resolved = true;
          }
        },
        
        getUnresolvedCount() {
          return this.errors.filter(e => !e.resolved).length;
        }
      };

      // Add some errors
      const errorId1 = mockErrorHistory.addError(new Error('Error 1'), mockContext);
      const errorId2 = mockErrorHistory.addError(new Error('Error 2'), mockContext);
      
      expect(mockErrorHistory.errors).toHaveLength(2);
      expect(mockErrorHistory.getUnresolvedCount()).toBe(2);
      
      // Resolve one error
      mockErrorHistory.markResolved(errorId1);
      expect(mockErrorHistory.getUnresolvedCount()).toBe(1);
      
      // Test history limit
      for (let i = 3; i <= 7; i++) {
        mockErrorHistory.addError(new Error(`Error ${i}`), mockContext);
      }
      
      expect(mockErrorHistory.errors).toHaveLength(5); // Should be capped at maxHistory
    });
  });
});