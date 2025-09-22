import { describe, it, expect, beforeEach, vi } from 'vitest';
import { retryService } from '../retryService';

describe('RetryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Retry Logic', () => {
    it('should succeed on first attempt', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      
      const result = await retryService.executeWithRetry(mockOperation);
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('Network connection failed'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValue('success');
      
      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 3,
        baseDelay: 100
      });
      
      // Fast-forward through delays
      vi.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(3);
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent error'));
      
      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 2,
        baseDelay: 100
      });
      
      vi.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Persistent error');
      expect(result.attempts).toBe(2);
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Unauthorized (401)'));
      
      const result = await retryService.executeWithRetry(mockOperation);
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Exponential Backoff', () => {
    it('should implement exponential backoff', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 3,
        baseDelay: 1000,
        backoffMultiplier: 2
      });
      
      // First retry after 1000ms
      vi.advanceTimersByTime(1000);
      expect(mockOperation).toHaveBeenCalledTimes(2);
      
      // Second retry after additional 2000ms (exponential backoff)
      vi.advanceTimersByTime(2000);
      expect(mockOperation).toHaveBeenCalledTimes(3);
      
      await promise;
    });

    it('should respect max delay', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 3,
        baseDelay: 5000,
        maxDelay: 3000, // Lower than base delay * multiplier
        backoffMultiplier: 2
      });
      
      // Should use maxDelay instead of calculated delay
      vi.advanceTimersByTime(3000);
      expect(mockOperation).toHaveBeenCalledTimes(2);
      
      vi.advanceTimersByTime(3000);
      await promise;
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout operations', async () => {
      const mockOperation = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 5000))
      );
      
      const promise = retryService.executeWithRetry(mockOperation, {
        timeoutMs: 1000
      });
      
      vi.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timed out');
    });

    it('should not timeout fast operations', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      
      const result = await retryService.executeWithRetry(mockOperation, {
        timeoutMs: 1000
      });
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after failures', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Service error'));
      
      // Fail 5 times to open circuit
      for (let i = 0; i < 5; i++) {
        await retryService.executeWithRetry(mockOperation, {}, 'test-service');
        vi.advanceTimersByTime(1000);
      }
      
      // Circuit should be open now
      const result = await retryService.executeWithRetry(mockOperation, {}, 'test-service');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Circuit breaker is open');
      expect(result.attempts).toBe(0);
    });

    it('should transition to half-open after timeout', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Service error'));
      
      // Open circuit
      for (let i = 0; i < 5; i++) {
        await retryService.executeWithRetry(mockOperation, {}, 'test-service');
        vi.advanceTimersByTime(1000);
      }
      
      // Wait for circuit breaker timeout (30 seconds)
      vi.advanceTimersByTime(30000);
      
      // Should allow one attempt in half-open state
      mockOperation.mockResolvedValueOnce('success');
      const result = await retryService.executeWithRetry(mockOperation, {}, 'test-service');
      
      expect(result.success).toBe(true);
    });

    it('should close circuit after successful attempts in half-open', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Service error'));
      
      // Open circuit
      for (let i = 0; i < 5; i++) {
        await retryService.executeWithRetry(mockOperation, {}, 'test-service');
        vi.advanceTimersByTime(1000);
      }
      
      // Wait for circuit breaker timeout
      vi.advanceTimersByTime(30000);
      
      // Succeed 3 times to close circuit
      mockOperation.mockResolvedValue('success');
      for (let i = 0; i < 3; i++) {
        await retryService.executeWithRetry(mockOperation, {}, 'test-service');
      }
      
      // Circuit should be closed now
      const status = retryService.getCircuitBreakerStatus('test-service');
      expect(status.state).toBe('closed');
    });

    it('should reset circuit breaker', () => {
      // Open circuit first
      const status1 = retryService.getCircuitBreakerStatus('test-service');
      status1.state = 'open';
      status1.failureCount = 5;
      
      retryService.resetCircuitBreaker('test-service');
      
      const status2 = retryService.getCircuitBreakerStatus('test-service');
      expect(status2.state).toBe('closed');
      expect(status2.failureCount).toBe(0);
    });
  });

  describe('API Call Helpers', () => {
    it('should retry API calls', async () => {
      const mockApiCall = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ data: 'success' });
      
      const promise = retryService.retryApiCall(mockApiCall, '/api/test');
      
      vi.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(result).toEqual({ data: 'success' });
      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    it('should retry file operations with longer timeout', async () => {
      const mockFileOperation = vi.fn().mockResolvedValue('file processed');
      
      const result = await retryService.retryFileOperation(
        mockFileOperation,
        'upload'
      );
      
      expect(result).toBe('file processed');
    });

    it('should throw on API call failure', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('Persistent error'));
      
      const promise = retryService.retryApiCall(mockApiCall, '/api/test');
      
      vi.advanceTimersByTime(10000);
      
      await expect(promise).rejects.toThrow('Persistent error');
    });
  });

  describe('Configuration', () => {
    it('should use custom retry configuration', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 5,
        baseDelay: 2000,
        backoffMultiplier: 3
      });
      
      vi.advanceTimersByTime(2000);
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('should handle custom retryable errors', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Custom retryable error'));
      
      const promise = retryService.executeWithRetry(mockOperation, {
        maxAttempts: 2,
        baseDelay: 100,
        retryableErrors: ['Custom retryable error']
      });
      
      vi.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2);
    });
  });

  describe('Monitoring', () => {
    it('should track all circuit breakers', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Error'));
      
      await retryService.executeWithRetry(mockOperation, {}, 'service-1');
      await retryService.executeWithRetry(mockOperation, {}, 'service-2');
      
      const allBreakers = retryService.getAllCircuitBreakers();
      
      expect(Object.keys(allBreakers)).toContain('service-1');
      expect(Object.keys(allBreakers)).toContain('service-2');
    });

    it('should provide circuit breaker status', () => {
      const status = retryService.getCircuitBreakerStatus('new-service');
      
      expect(status.state).toBe('closed');
      expect(status.failureCount).toBe(0);
      expect(status.successCount).toBe(0);
    });
  });
});