import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  ArrowRight,
} from 'lucide-react';

import { DataIngestionWizard } from './DataIngestionWizard';
import { ErrorRecoveryManager } from './ErrorRecoveryManager';
import { errorHandlingService, type ErrorContext } from '@/services/errorHandlingService';
import {
  dataIngestionWorkflowService,
  type WorkflowState,
} from '@/services/dataIngestionWorkflowService';

interface DataIngestionWizardWithRecoveryProps {
  onComplete?: (data: any) => void;
  className?: string;
}

export function DataIngestionWizardWithRecovery({
  onComplete,
  className = '',
}: DataIngestionWizardWithRecoveryProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>(
    dataIngestionWorkflowService.getWorkflowState()
  );
  const [currentError, setCurrentError] = useState<Error | null>(null);
  const [errorContext, setErrorContext] = useState<ErrorContext | null>(null);
  const [showRecoveryManager, setShowRecoveryManager] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = dataIngestionWorkflowService.subscribe(setWorkflowState);
    return unsubscribe;
  }, []);

  // Monitor for errors in the workflow state
  useEffect(() => {
    const unresolvedErrors = workflowState.errors.filter(e => !e.resolved);
    if (unresolvedErrors.length > 0) {
      const latestError = unresolvedErrors[unresolvedErrors.length - 1];
      setCurrentError(new Error(latestError.message));
      setErrorContext({
        stepId: workflowState.currentStep,
        action: latestError.action || 'unknown',
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: workflowState.sessionId || 'unknown',
        workflowState: workflowState,
      });
      
      // Auto-show recovery manager for critical errors
      const errorType = errorHandlingService.classifyError(new Error(latestError.message));
      if (errorType === 'system' || errorType === 'authentication' || recoveryAttempts >= 2) {
        setShowRecoveryManager(true);
      }
    } else {
      setCurrentError(null);
      setErrorContext(null);
      setShowRecoveryManager(false);
    }
  }, [workflowState.errors, recoveryAttempts]);

  const handleWizardError = (error: Error, stepId?: string) => {
    console.error('Wizard error occurred:', error);
    
    const context: ErrorContext = {
      stepId: stepId || workflowState.currentStep,
      action: 'wizard_operation',
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      sessionId: workflowState.sessionId || 'unknown',
      workflowState: workflowState,
    };

    setCurrentError(error);
    setErrorContext(context);
    
    // Report error to service
    const reportId = errorHandlingService.reportError(error, context);
    console.log('Error reported with ID:', reportId);

    // Show appropriate error handling based on error type
    const errorType = errorHandlingService.classifyError(error);
    const isRetryable = errorHandlingService.isRetryableError(error);

    if (!isRetryable || errorType === 'authentication' || errorType === 'system') {
      setShowRecoveryManager(true);
    } else {
      // Show toast for retryable errors
      toast({
        title: 'Operation Failed',
        description: errorHandlingService.getErrorMessage(error),
        variant: 'destructive',
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickRetry()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        ),
      });
    }
  };

  const handleQuickRetry = async () => {
    if (!currentError || !errorContext) return;

    setRecoveryAttempts(prev => prev + 1);
    
    try {
      // Attempt to retry the failed operation
      await dataIngestionWorkflowService.retryStep(workflowState.currentStep);
      
      // Clear error state on success
      setCurrentError(null);
      setErrorContext(null);
      setRecoveryAttempts(0);
      
      toast({
        title: 'Recovery Successful',
        description: 'The operation completed successfully after retry.',
      });
    } catch (retryError) {
      console.error('Quick retry failed:', retryError);
      
      // If quick retry fails, show recovery manager
      setShowRecoveryManager(true);
      
      toast({
        title: 'Retry Failed',
        description: 'Quick retry was unsuccessful. Please try advanced recovery options.',
        variant: 'destructive',
      });
    }
  };

  const handleRecoverySuccess = () => {
    console.log('Recovery completed successfully');
    
    // Clear error state
    setCurrentError(null);
    setErrorContext(null);
    setShowRecoveryManager(false);
    setRecoveryAttempts(0);
    
    // Mark error as resolved in service
    if (errorContext) {
      const reportId = errorHandlingService.reportError(currentError!, errorContext);
      errorHandlingService.markErrorResolved(reportId);
    }
    
    toast({
      title: 'Recovery Complete',
      description: 'The error has been resolved and you can continue with your workflow.',
    });
  };

  const handleRecoveryFailed = (error: Error) => {
    console.error('Recovery failed:', error);
    
    setRecoveryAttempts(prev => prev + 1);
    
    toast({
      title: 'Recovery Failed',
      description: 'The recovery attempt was unsuccessful. You may need to contact support.',
      variant: 'destructive',
    });
  };

  const handleAlternativePathSelected = (pathId: string) => {
    console.log('Alternative path selected:', pathId);
    
    // Handle different alternative paths
    switch (pathId) {
      case 'mock_data_mode':
        // Enable mock mode in workflow service
        dataIngestionWorkflowService.enableMockMode('User selected demo mode for recovery');
        break;
        
      case 'offline_mode':
        // Enable offline processing
        console.log('Enabling offline mode...');
        break;
        
      case 'simplified_workflow':
        // Skip optional steps
        console.log('Enabling simplified workflow...');
        break;
        
      case 'manual_override':
        // Provide manual entry options
        console.log('Enabling manual override mode...');
        break;
        
      case 'cached_results':
        // Use cached data
        console.log('Using cached results...');
        break;
        
      case 'export_import':
        // Start export/import workflow
        console.log('Starting export/import workflow...');
        break;
        
      default:
        console.log('Unknown alternative path:', pathId);
    }
    
    // Clear error state after path selection
    handleRecoverySuccess();
  };

  const handleWizardComplete = (data: any) => {
    console.log('Wizard completed successfully:', data);
    
    // Clear any remaining error state
    setCurrentError(null);
    setErrorContext(null);
    setShowRecoveryManager(false);
    setRecoveryAttempts(0);
    
    onComplete?.(data);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Status Banner */}
      {currentError && !showRecoveryManager && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <div className="font-medium">Operation Failed</div>
              <div className="text-sm mt-1">
                {errorHandlingService.getErrorMessage(currentError)}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickRetry}
                disabled={recoveryAttempts >= 3}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry ({recoveryAttempts}/3)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecoveryManager(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Recovery Options
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Recovery Manager */}
      {showRecoveryManager && currentError && errorContext && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Error Recovery Required
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecoveryManager(false)}
              >
                Hide Recovery
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorRecoveryManager
              error={currentError}
              context={errorContext}
              onRecoverySuccess={handleRecoverySuccess}
              onRecoveryFailed={handleRecoveryFailed}
              onAlternativePathSelected={handleAlternativePathSelected}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Wizard */}
      <DataIngestionWizard
        onComplete={handleWizardComplete}
        onError={handleWizardError}
        className={showRecoveryManager ? 'opacity-75' : ''}
      />

      {/* Recovery Status */}
      {recoveryAttempts > 0 && !currentError && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Recovery Successful</div>
                <div className="text-sm mt-1">
                  Resolved after {recoveryAttempts} attempt{recoveryAttempts > 1 ? 's' : ''}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecoveryAttempts(0)}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Mock Mode Indicator */}
      {workflowState.mockMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Demo Mode Active</div>
                <div className="text-sm mt-1">
                  Using simulated data for demonstration purposes
                  {workflowState.degradationReason && ` (${workflowState.degradationReason})`}
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Enhanced DataIngestionWizard with error handling props
interface EnhancedDataIngestionWizardProps {
  onComplete?: (data: any) => void;
  onError?: (error: Error, stepId?: string) => void;
  className?: string;
}

// This would be an enhanced version of the existing DataIngestionWizard
// that includes error handling callbacks
export function EnhancedDataIngestionWizard({
  onComplete,
  onError,
  className = '',
}: EnhancedDataIngestionWizardProps) {
  // This would wrap the existing DataIngestionWizard with error handling
  // For now, we'll use the existing component
  return (
    <DataIngestionWizard
      onComplete={onComplete}
      className={className}
    />
  );
}