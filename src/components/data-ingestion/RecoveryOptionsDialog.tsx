import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Wifi,
  WifiOff,
  Settings,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { errorHandlingService, type RecoveryOption, type ErrorContext } from '@/services/errorHandlingService';

interface RecoveryOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  error: Error;
  context: ErrorContext;
  onRecoveryComplete?: (success: boolean) => void;
}

export function RecoveryOptionsDialog({
  isOpen,
  onClose,
  error,
  context,
  onRecoveryComplete,
}: RecoveryOptionsDialogProps) {
  const [selectedOption, setSelectedOption] = useState<RecoveryOption | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionMessage, setExecutionMessage] = useState('');
  const [executionResult, setExecutionResult] = useState<'success' | 'error' | null>(null);

  const errorType = errorHandlingService.classifyError(error);
  const errorMessage = errorHandlingService.getErrorMessage(error);
  const recoveryInstructions = errorHandlingService.getRecoveryInstructions(error);
  const recoveryOptions = errorHandlingService.getRecoveryOptions(error, context);

  const getSeverityColor = (severity: RecoveryOption['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getErrorTypeIcon = () => {
    switch (errorType) {
      case 'network':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      case 'service':
        return <Settings className="h-5 w-5 text-orange-500" />;
      case 'validation':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case 'authentication':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const executeRecoveryOption = async (option: RecoveryOption) => {
    setSelectedOption(option);
    setIsExecuting(true);
    setExecutionProgress(0);
    setExecutionMessage(`Executing ${option.title}...`);
    setExecutionResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, (option.estimatedTime || 5000) / 10);

      // Execute the recovery action
      await option.action();

      // Complete progress
      clearInterval(progressInterval);
      setExecutionProgress(100);
      setExecutionMessage(`${option.title} completed successfully`);
      setExecutionResult('success');

      // Report error as resolved
      const reportId = errorHandlingService.reportError(error, context);
      errorHandlingService.markErrorResolved(reportId);

      setTimeout(() => {
        onRecoveryComplete?.(true);
        onClose();
      }, 2000);
    } catch (recoveryError) {
      setExecutionProgress(0);
      setExecutionMessage(`${option.title} failed: ${(recoveryError as Error).message}`);
      setExecutionResult('error');

      // Increment recovery attempts
      const reportId = errorHandlingService.reportError(error, context);
      errorHandlingService.incrementRecoveryAttempts(reportId);

      setTimeout(() => {
        setIsExecuting(false);
        setSelectedOption(null);
      }, 3000);
    }
  };

  const formatEstimatedTime = (milliseconds?: number) => {
    if (!milliseconds) return 'Unknown';
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getErrorTypeIcon()}
            Error Recovery Options
          </DialogTitle>
          <DialogDescription>
            Choose a recovery option to resolve the issue and continue with your workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Summary */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Error Type:</span>
                  <Badge variant="outline" className={getSeverityColor('high')}>
                    {errorType.charAt(0).toUpperCase() + errorType.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{errorMessage}</p>
              </div>

              <Separator />

              <div>
                <span className="text-sm font-medium">Recovery Instructions:</span>
                <p className="text-sm text-gray-700 mt-1">{recoveryInstructions}</p>
              </div>

              {context.stepId && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Failed Step:</span>
                    <span className="text-gray-700">{context.stepId}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Execution Progress */}
          {isExecuting && selectedOption && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Executing Recovery Action</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                      {selectedOption.title}
                    </Badge>
                  </div>
                  
                  <Progress value={executionProgress} className="h-2" />
                  
                  <div className="flex items-center gap-2 text-sm">
                    {executionResult === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : executionResult === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                    <span className={
                      executionResult === 'success' ? 'text-green-700' :
                      executionResult === 'error' ? 'text-red-700' :
                      'text-blue-700'
                    }>
                      {executionMessage}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recovery Options */}
          {!isExecuting && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Recovery Options</h3>
              
              {recoveryOptions.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No automatic recovery options are available for this error type. 
                    Please contact support or try refreshing the page.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-3">
                  {recoveryOptions.map((option, index) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOption?.id === option.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedOption(option)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{option.title}</h4>
                              <Badge
                                variant="outline"
                                className={getSeverityColor(option.severity)}
                              >
                                {option.severity} risk
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
                              {option.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>~{formatEstimatedTime(option.estimatedTime)}</span>
                              </div>
                              
                              {index === 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alternative Workflow Paths */}
          {!isExecuting && errorType === 'service' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-blue-600" />
                  Alternative Workflow Paths
                </CardTitle>
                <CardDescription>
                  When primary services fail, you can continue with these alternatives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => {
                      // Enable mock mode and continue
                      const mockOption: RecoveryOption = {
                        id: 'enable_mock_mode',
                        title: 'Continue with Mock Data',
                        description: 'Use simulated data to complete the workflow',
                        action: async () => {
                          // This would be implemented by the calling component
                          console.log('Enabling mock mode...');
                        },
                        severity: 'medium',
                        estimatedTime: 2000
                      };
                      executeRecoveryOption(mockOption);
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">Continue with Demo Mode</div>
                      <div className="text-xs text-gray-600">
                        Use simulated data while services are unavailable
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => {
                      // Save progress and exit
                      const saveOption: RecoveryOption = {
                        id: 'save_and_exit',
                        title: 'Save Progress and Exit',
                        description: 'Save current progress and return later',
                        action: async () => {
                          console.log('Saving progress...');
                        },
                        severity: 'low',
                        estimatedTime: 1000
                      };
                      executeRecoveryOption(saveOption);
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">Save Progress and Exit</div>
                      <div className="text-xs text-gray-600">
                        Return to complete the workflow when services are restored
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help and Support */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Need Additional Help?</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                If these recovery options don't resolve your issue, you can get additional support.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/help" target="_blank">
                    View Documentation
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/support" target="_blank">
                    Contact Support
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExecuting}>
            {isExecuting ? 'Processing...' : 'Cancel'}
          </Button>
          
          {selectedOption && !isExecuting && (
            <Button
              onClick={() => executeRecoveryOption(selectedOption)}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Execute {selectedOption.title}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}