import { errorHandlingService } from './errorHandlingService';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
  timeoutMs?: number;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
  successCount: number;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

class RetryService {
  private static instance: RetryService;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['NetworkError', 'TimeoutError', 'ServiceUnavailable', 'InternalServerError'],
    timeoutMs: 30000
  };

  static getInstance(): RetryService {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService();
    }
    return RetryService.instance;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    operationId?: string
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();
    let lastError: Error | undefined;
    
    // Check circuit breaker if operationId provided
    if (operationId && !this.canExecute(operationId)) {
      const circuitState = this.circuitBreakers.get(operationId);
      return {
        success: false,
        error: new Error(`Circuit breaker is open. Next attempt allowed at ${circuitState?.nextAttemptTime}`),
        attempts: 0,
        totalTime: Date.now() - startTime
      };
    }

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        // Add timeout wrapper if specified
        const result = finalConfig.timeoutMs 
          ? await this.withTimeout(operation(), finalConfig.timeoutMs)
          : await operation();
        
        // Success - reset circuit breaker
        if (operationId) {
          this.recordSuccess(operationId);
        }

        return {
          success: true,
          result,
          attempts: attempt,
          totalTime: Date.now() - startTime
        };

      } catch (error) {
        lastError = error as Error;
        
        // Record failure for circuit breaker
        if (operationId) {
          this.recordFailure(operationId);
        }

        // Check if error is retryable
        if (!this.isRetryableError(lastError, finalConfig) || attempt === finalConfig.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
          finalConfig.maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;

        console.warn(`Attempt ${attempt} failed, retrying in ${jitteredDelay}ms:`, lastError.message);
        
        await this.delay(jitteredDelay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: finalConfig.maxAttempts,
      totalTime: Date.now() - startTime
    };
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  }

  private isRetryableError(error: Error, config: RetryConfig): boolean {
    // Use error handling service to classify error
    const isRetryable = errorHandlingService.isRetryableError(error);
    
    // Also check against configured retryable errors
    const errorName = error.name || error.constructor.name;
    const messageMatch = config.retryableErrors.some(retryableError => 
      error.message.toLowerCase().includes(retryableError.toLowerCase()) ||
      errorName.toLowerCase().includes(retryableError.toLowerCase())
    );

    return isRetryable || messageMatch;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Circuit Breaker Implementation
  private canExecute(operationId: string): boolean {
    const state = this.getCircuitBreakerState(operationId);
    
    switch (state.state) {
      case 'closed':
        return true;
      
      case 'open':
        if (state.nextAttemptTime && Date.now() >= state.nextAttemptTime.getTime()) {
          // Transition to half-open
          state.state = 'half-open';
          state.successCount = 0;
          return true;
        }
        return false;
      
      case 'half-open':
        return true;
      
      default:
        return true;
    }
  }

  private recordSuccess(operationId: string): void {
    const state = this.getCircuitBreakerState(operationId);
    
    if (state.state === 'half-open') {
      state.successCount++;
      
      // If we have enough successes, close the circuit
      if (state.successCount >= 3) {
        state.state = 'closed';
        state.failureCount = 0;
        state.successCount = 0;
        state.lastFailureTime = undefined;
        state.nextAttemptTime = undefined;
      }
    } else if (state.state === 'closed') {
      // Reset failure count on success
      state.failureCount = 0;
    }
  }

  private recordFailure(operationId: string): void {
    const state = this.getCircuitBreakerState(operationId);
    state.failureCount++;
    state.lastFailureTime = new Date();
    
    // Open circuit if failure threshold reached
    if (state.failureCount >= 5) {
      state.state = 'open';
      // Wait 30 seconds before allowing next attempt
      state.nextAttemptTime = new Date(Date.now() + 30000);
    } else if (state.state === 'half-open') {
      // If we fail in half-open state, go back to open
      state.state = 'open';
      state.nextAttemptTime = new Date(Date.now() + 30000);
    }
  }

  private getCircuitBreakerState(operationId: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(operationId)) {
      this.circuitBreakers.set(operationId, {
        state: 'closed',
        failureCount: 0,
        successCount: 0
      });
    }
    return this.circuitBreakers.get(operationId)!;
  }

  // Public methods for monitoring
  getCircuitBreakerStatus(operationId: string): CircuitBreakerState {
    return { ...this.getCircuitBreakerState(operationId) };
  }

  resetCircuitBreaker(operationId: string): void {
    this.circuitBreakers.set(operationId, {
      state: 'closed',
      failureCount: 0,
      successCount: 0
    });
  }

  getAllCircuitBreakers(): Record<string, CircuitBreakerState> {
    const result: Record<string, CircuitBreakerState> = {};
    this.circuitBreakers.forEach((state, id) => {
      result[id] = { ...state };
    });
    return result;
  }

  // Utility method for common retry patterns
  async retryApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const result = await this.executeWithRetry(
      apiCall,
      {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000,
        timeoutMs: 15000,
        ...customConfig
      },
      `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`
    );

    if (!result.success) {
      throw result.error || new Error('API call failed after retries');
    }

    return result.result!;
  }

  async retryFileOperation<T>(
    fileOperation: () => Promise<T>,
    operationName: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const result = await this.executeWithRetry(
      fileOperation,
      {
        maxAttempts: 2,
        baseDelay: 500,
        maxDelay: 2000,
        timeoutMs: 60000, // Longer timeout for file operations
        ...customConfig
      },
      `file_${operationName}`
    );

    if (!result.success) {
      throw result.error || new Error('File operation failed after retries');
    }

    return result.result!;
  }
}

export const retryService = RetryService.getInstance();