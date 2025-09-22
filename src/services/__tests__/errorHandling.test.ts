import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorHandlingService } from '../errorHandlingService';

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    errorHandlingService.clearErrorHistory();
    vi.clearAllMocks();
  });

  describe('Error Classification', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('Network connection failed');
      const type = errorHandlingService.classifyError(networkError);
      expect(type).toBe('network');
    });

    it('should classify timeout errors correctly', () => {
      const timeoutError = new Error('Request timeout after 30 seconds');
      const type = errorHandlingService.classifyError(timeoutError);
      expect(type).toBe('timeout');
    });

    it('should classify authentication errors correctly', () => {
      const authError = new Error('Unauthorized access (401)');
      const type = errorHandlingService.classifyError(authError);
      expect(type).toBe('authentication');
    });

    it('should classify service errors correctly', () => {
      const serviceError = new Error('Internal server error (500)');
      const type = errorHandlingService.classifyError(serviceError);
      expect(type).toBe('service');
    });

    it('should classify validation errors correctly', () => {
      const validationError = new Error('Invalid data format');
      const type = errorHandlingService.classifyError(validationError);
      expect(type).toBe('validation');
    });

    it('should default to system error for unknown types', () => {
      const unknownError = new Error('Something went wrong');
      const type = errorHandlingService.classifyError(unknownError);
      expect(type).toBe('system');
    });
  });

  describe('Retry Logic', () => {
    it('should identify retryable errors', () => {
      const networkError = new Error('Network connection failed');
      const isRetryable = errorHandlingService.isRetryableError(networkError);
      expect(isRetryable).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      const authError = new Error('Unauthorized (401)');
      const isRetryable = errorHandlingService.isRetryableError(authError);
      expect(isRetryable).toBe(false);
    });

    it('should handle timeout errors as retryable', () => {
      const timeoutError = new Error('Request timeout');
      const isRetryable = errorHandlingService.isRetryableError(timeoutError);
      expect(isRetryable).toBe(true);
    });
  });

  describe('Error Messages', () => {
    it('should provide user-friendly messages for network errors', () => {
      const networkError = new Error('fetch failed');
      const message = errorHandlingService.getErrorMessage(networkError);
      expect(message).toBe('Unable to connect to the server. Please check your internet connection.');
    });

    it('should provide user-friendly messages for validation errors', () => {
      const validationError = new Error('Invalid format');
      const message = errorHandlingService.getErrorMessage(validationError);
      expect(message).toBe('There are issues with the data that need to be corrected.');
    });

    it('should provide recovery instructions', () => {
      const networkError = new Error('Network failed');
      const instructions = errorHandlingService.getRecoveryInstructions(networkError);
      expect(instructions).toContain('Check your internet connection');
    });
  });

  describe('Recovery Options', () => {
    it('should provide recovery options for network errors', () => {
      const networkError = new Error('Network failed');
      const context = errorHandlingService.createErrorContext('test_action');
      const options = errorHandlingService.getRecoveryOptions(networkError, context);
      
      expect(options.length).toBeGreaterThan(0);
      expect(options.some(option => option.id === 'retry_network')).toBe(true);
      expect(options.some(option => option.id === 'offline_mode')).toBe(true);
    });

    it('should provide recovery options for validation errors', () => {
      const validationError = new Error('Invalid data');
      const context = errorHandlingService.createErrorContext('validation');
      const options = errorHandlingService.getRecoveryOptions(validationError, context);
      
      expect(options.some(option => option.id === 'fix_validation')).toBe(true);
      expect(options.some(option => option.id === 'skip_validation')).toBe(true);
    });

    it('should provide recovery options for authentication errors', () => {
      const authError = new Error('Unauthorized');
      const context = errorHandlingService.createErrorContext('api_call');
      const options = errorHandlingService.getRecoveryOptions(authError, context);
      
      expect(options.some(option => option.id === 'reauth')).toBe(true);
    });
  });

  describe('Error Reporting', () => {
    it('should report and track errors', () => {
      const error = new Error('Test error');
      const context = errorHandlingService.createErrorContext('test_action');
      
      const reportId = errorHandlingService.reportError(error, context);
      
      expect(reportId).toBeDefined();
      expect(reportId).toMatch(/^error_\d+_[a-z0-9]+$/);
      
      const history = errorHandlingService.getErrorHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe(reportId);
    });

    it('should track error resolution', () => {
      const error = new Error('Test error');
      const context = errorHandlingService.createErrorContext('test_action');
      const reportId = errorHandlingService.reportError(error, context);
      
      errorHandlingService.markErrorResolved(reportId);
      
      const history = errorHandlingService.getErrorHistory();
      expect(history[0].resolved).toBe(true);
    });

    it('should track recovery attempts', () => {
      const error = new Error('Test error');
      const context = errorHandlingService.createErrorContext('test_action');
      const reportId = errorHandlingService.reportError(error, context);
      
      errorHandlingService.incrementRecoveryAttempts(reportId);
      errorHandlingService.incrementRecoveryAttempts(reportId);
      
      const history = errorHandlingService.getErrorHistory();
      expect(history[0].recoveryAttempts).toBe(2);
    });

    it('should limit error history size', () => {
      // Report more than 50 errors
      for (let i = 0; i < 60; i++) {
        const error = new Error(`Test error ${i}`);
        const context = errorHandlingService.createErrorContext(`test_action_${i}`);
        errorHandlingService.reportError(error, context);
      }
      
      const history = errorHandlingService.getErrorHistory();
      expect(history.length).toBe(50);
    });
  });

  describe('Error Context', () => {
    it('should create proper error context', () => {
      const context = errorHandlingService.createErrorContext('test_action', {
        stepId: 'source',
        serviceEndpoint: '/api/test'
      });
      
      expect(context.action).toBe('test_action');
      expect(context.stepId).toBe('source');
      expect(context.serviceEndpoint).toBe('/api/test');
      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.userAgent).toBeDefined();
      expect(context.sessionId).toBeDefined();
    });
  });

  describe('Error History Management', () => {
    it('should clear error history', () => {
      const error = new Error('Test error');
      const context = errorHandlingService.createErrorContext('test_action');
      errorHandlingService.reportError(error, context);
      
      expect(errorHandlingService.getErrorHistory().length).toBe(1);
      
      errorHandlingService.clearErrorHistory();
      
      expect(errorHandlingService.getErrorHistory().length).toBe(0);
    });

    it('should handle concurrent error reporting', () => {
      const errors = Array.from({ length: 10 }, (_, i) => new Error(`Error ${i}`));
      const contexts = errors.map((_, i) => 
        errorHandlingService.createErrorContext(`action_${i}`)
      );
      
      // Report errors concurrently
      const reportIds = errors.map((error, i) => 
        errorHandlingService.reportError(error, contexts[i])
      );
      
      expect(reportIds.length).toBe(10);
      expect(new Set(reportIds).size).toBe(10); // All IDs should be unique
      expect(errorHandlingService.getErrorHistory().length).toBe(10);
    });
  });
});