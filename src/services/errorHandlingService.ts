export type ErrorType = 'network' | 'service' | 'validation' | 'system' | 'authentication' | 'timeout';

export interface ErrorContext {
  stepId?: string;
  action: string;
  timestamp: Date;
  userAgent: string;
  sessionId: string;
  workflowState?: any;
  serviceEndpoint?: string;
  requestData?: any;
}

export interface RecoveryOption {
  id: string;
  title: string;
  description: string;
  action: () => Promise<void>;
  severity: 'low' | 'medium' | 'high';
  estimatedTime?: number;
}

export interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  timestamp: Date;
  resolved: boolean;
  recoveryAttempts: number;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorHistory: ErrorReport[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('connection') || name.includes('networkerror')) {
      return 'network';
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('aborted') || 
        name.includes('timeouterror')) {
      return 'timeout';
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('forbidden') || 
        message.includes('authentication') || message.includes('401') || 
        message.includes('403')) {
      return 'authentication';
    }

    // Service errors
    if (message.includes('service') || message.includes('server') || 
        message.includes('api') || message.includes('500') || 
        message.includes('502') || message.includes('503')) {
      return 'service';
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || 
        message.includes('required') || message.includes('format')) {
      return 'validation';
    }

    // Default to system error
    return 'system';
  }

  isRetryableError(error: Error): boolean {
    const errorType = this.classifyError(error);
    const retryableTypes: ErrorType[] = ['network', 'timeout', 'service'];
    
    // Check for specific non-retryable conditions
    const message = error.message.toLowerCase();
    if (message.includes('401') || message.includes('403') || 
        message.includes('400') || message.includes('404')) {
      return false;
    }

    return retryableTypes.includes(errorType);
  }

  getRecoveryOptions(error: Error, context: ErrorContext): RecoveryOption[] {
    const errorType = this.classifyError(error);
    const options: RecoveryOption[] = [];

    switch (errorType) {
      case 'network':
        options.push({
          id: 'retry_network',
          title: 'Retry Connection',
          description: 'Attempt to reconnect to the service',
          action: async () => {
            // Will be implemented by calling service
          },
          severity: 'low',
          estimatedTime: 5000
        });
        
        options.push({
          id: 'offline_mode',
          title: 'Work Offline',
          description: 'Continue with mock data while offline',
          action: async () => {
            // Enable graceful degradation
          },
          severity: 'medium',
          estimatedTime: 1000
        });
        break;

      case 'service':
        options.push({
          id: 'retry_service',
          title: 'Retry Request',
          description: 'Try the request again',
          action: async () => {
            // Will be implemented by calling service
          },
          severity: 'low',
          estimatedTime: 3000
        });

        options.push({
          id: 'fallback_service',
          title: 'Use Backup Service',
          description: 'Switch to alternative service endpoint',
          action: async () => {
            // Switch to fallback endpoint
          },
          severity: 'medium',
          estimatedTime: 5000
        });
        break;

      case 'validation':
        options.push({
          id: 'fix_validation',
          title: 'Fix Data Issues',
          description: 'Review and correct the data problems',
          action: async () => {
            // Navigate back to data entry
          },
          severity: 'high',
          estimatedTime: 30000
        });

        options.push({
          id: 'skip_validation',
          title: 'Skip Validation',
          description: 'Proceed with warnings (not recommended)',
          action: async () => {
            // Skip validation step
          },
          severity: 'high',
          estimatedTime: 1000
        });
        break;

      case 'authentication':
        options.push({
          id: 'reauth',
          title: 'Re-authenticate',
          description: 'Log in again to refresh your session',
          action: async () => {
            // Trigger re-authentication
          },
          severity: 'medium',
          estimatedTime: 10000
        });
        break;

      case 'timeout':
        options.push({
          id: 'retry_timeout',
          title: 'Retry with Longer Timeout',
          description: 'Try again with extended timeout period',
          action: async () => {
            // Retry with longer timeout
          },
          severity: 'low',
          estimatedTime: 10000
        });
        break;

      default:
        options.push({
          id: 'generic_retry',
          title: 'Try Again',
          description: 'Attempt the operation again',
          action: async () => {
            // Generic retry
          },
          severity: 'medium',
          estimatedTime: 5000
        });
    }

    return options;
  }

  getErrorMessage(error: Error): string {
    const errorType = this.classifyError(error);
    
    const friendlyMessages: Record<ErrorType, string> = {
      network: 'Unable to connect to the server. Please check your internet connection.',
      service: 'The service is temporarily unavailable. Please try again in a moment.',
      validation: 'There are issues with the data that need to be corrected.',
      system: 'An unexpected error occurred. Please try again.',
      authentication: 'Your session has expired. Please log in again.',
      timeout: 'The operation took too long to complete. Please try again.'
    };

    return friendlyMessages[errorType] || error.message;
  }

  getRecoveryInstructions(error: Error): string {
    const errorType = this.classifyError(error);
    
    const instructions: Record<ErrorType, string> = {
      network: 'Check your internet connection and try again. If the problem persists, you can work offline with limited functionality.',
      service: 'The service may be experiencing high load. Wait a moment and try again, or use the backup service option.',
      validation: 'Review the highlighted fields and correct any errors. Make sure all required information is provided in the correct format.',
      system: 'This appears to be a temporary issue. Try refreshing the page or restarting the operation.',
      authentication: 'Your login session has expired for security reasons. Please log in again to continue.',
      timeout: 'The operation is taking longer than expected. You can try again or break it into smaller steps.'
    };

    return instructions[errorType] || 'Please try the operation again or contact support if the problem continues.';
  }

  reportError(error: Error, context: ErrorContext): string {
    const reportId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const report: ErrorReport = {
      id: reportId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as Error,
      context: {
        ...context,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId
      },
      timestamp: new Date(),
      resolved: false,
      recoveryAttempts: 0
    };

    this.errorHistory.push(report);

    // Keep only last 50 errors to prevent memory issues
    if (this.errorHistory.length > 50) {
      this.errorHistory = this.errorHistory.slice(-50);
    }

    // Log to console for debugging
    console.error('Error reported:', {
      id: reportId,
      type: this.classifyError(error),
      message: error.message,
      context: context
    });

    return reportId;
  }

  getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory];
  }

  markErrorResolved(reportId: string): void {
    const report = this.errorHistory.find(r => r.id === reportId);
    if (report) {
      report.resolved = true;
    }
  }

  incrementRecoveryAttempts(reportId: string): void {
    const report = this.errorHistory.find(r => r.id === reportId);
    if (report) {
      report.recoveryAttempts++;
    }
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  // Helper method to create error context
  createErrorContext(action: string, additionalContext: Partial<ErrorContext> = {}): ErrorContext {
    return {
      action,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      ...additionalContext
    };
  }
}

export const errorHandlingService = ErrorHandlingService.getInstance();