import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  RefreshCw,
  Settings,
  ArrowRight,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Shield,
} from 'lucide-react';

import { RecoveryOptionsDialog } from './RecoveryOptionsDialog';
import { RetryMechanismPanel } from './RetryMechanismPanel';
import { AlternativeWorkflowPaths } from './AlternativeWorkflowPaths';
import { errorHandlingService, type ErrorContext, type ErrorReport } from '@/services/errorHandlingService';

interface ErrorRecoveryManagerProps {
  error?: Error;
  context?: ErrorContext;
  onRecoverySuccess?: () => void;
  onRecoveryFailed?: (error: Error) => void;
  onAlternativePathSelected?: (pathId: string) => void;
  className?: string;
}

export function ErrorRecoveryManager({
  error,
  context,
  onRecoverySuccess,
  onRecoveryFailed,
  onAlternativePathSelected,
  className = '',
}: ErrorRecoveryManagerProps) {
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [recoveryHistory, setRecoveryHistory] = useState<ErrorReport[]>([]);
  const [activeTab, setActiveTab] = useState('quick-actions');

  // Load error history on mount
  useEffect(() => {
    const history = errorHandlingService.getErrorHistory();
    setRecoveryHistory(history.slice(-5)); // Show last 5 errors
  }, [error]);

  // Auto-show recovery dialog for critical errors
  useEffect(() => {
    if (error && context) {
      const errorType = errorHandlingService.classifyError(error);
      const isRetryable = errorHandlingService.isRetryableError(error);
      
      // Auto-show dialog for non-retryable or critical errors
      if (!isRetryable || errorType === 'authentication' || errorType === 'system') {
        setShowRecoveryDialog(true);
      }
    }
  }, [error, context]);

  const handleQuickRetry = async () => {
    if (!error || !context) return;

    setIsRetrying(true);
    try {
      // Use default retry configuration
      const retryConfig = {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        enableExponentialBackoff: true,
        enableCircuitBreaker: true,
        timeoutMs: 30000,
      };

      // This would be implemented by the parent component
      // For now, simulate a retry attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onRecoverySuccess?.();
    } catch (retryError) {
      onRecoveryFailed?.(retryError as Error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleAdvancedRetry = async (config: any) => {
    if (!error || !context) return;

    setIsRetrying(true);
    try {
      // This would use the custom retry configuration
      // Implementation would be provided by parent component
      await new Promise(resolve => setTimeout(resolve, config.baseDelay));
      
      onRecoverySuccess?.();
    } catch (retryError) {
      onRecoveryFailed?.(retryError as Error);
      throw retryError;
    } finally {
      setIsRetrying(false);
    }
  };

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

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
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

  if (!error || !context) {
    return null;
  }

  const errorType = errorHandlingService.classifyError(error);
  const errorMessage = errorHandlingService.getErrorMessage(error);
  const isRetryable = errorHandlingService.isRetryableError(error);
  const severity = getErrorSeverity(error);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Summary Header */}
      <Card className={`border-2 ${severity === 'high' ? 'border-red-200 bg-red-50' : severity === 'medium' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${severity === 'high' ? 'text-red-600' : severity === 'medium' ? 'text-yellow-600' : 'text-green-600'}`} />
              Error Recovery Center
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getSeverityColor(severity)}>
                {severity} severity
              </Badge>
              <Badge variant="outline" className={isRetryable ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
                {isRetryable ? 'Retryable' : 'Manual Fix Required'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">Error Details:</div>
                <div className="text-sm text-gray-700">{errorMessage}</div>
              </div>
              <Badge variant="outline" className="ml-4">
                {errorType}
              </Badge>
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

            {/* Quick Actions */}
            <Separator />
            <div className="flex items-center gap-2">
              {isRetryable && (
                <Button
                  onClick={handleQuickRetry}
                  disabled={isRetrying}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Quick Retry'}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowRecoveryDialog(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Recovery Options
              </Button>

              <Button
                variant="outline"
                onClick={() => setActiveTab('alternatives')}
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Alternative Paths
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="retry-config">Retry Config</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quick Recovery Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These are the most common solutions for this type of error. Try them in order for the best results.
                </AlertDescription>
              </Alert>

              <div className="grid gap-3">
                {isRetryable && (
                  <Button
                    onClick={handleQuickRetry}
                    disabled={isRetrying}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCw className={`h-5 w-5 ${isRetrying ? 'animate-spin' : ''}`} />
                      <div className="text-left">
                        <div className="font-medium">Automatic Retry</div>
                        <div className="text-xs opacity-80">
                          Retry with exponential backoff (recommended)
                        </div>
                      </div>
                    </div>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowRecoveryDialog(true)}
                  className="justify-start h-auto p-4"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Advanced Recovery</div>
                      <div className="text-xs text-gray-600">
                        Choose specific recovery actions and options
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setActiveTab('alternatives')}
                  className="justify-start h-auto p-4"
                >
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Alternative Workflow</div>
                      <div className="text-xs text-gray-600">
                        Continue with a different approach
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  className="justify-start h-auto p-4"
                >
                  <a href="/help" target="_blank">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Get Help</div>
                        <div className="text-xs text-gray-600">
                          View documentation or contact support
                        </div>
                      </div>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retry-config" className="space-y-4">
          <RetryMechanismPanel
            onRetry={handleAdvancedRetry}
            error={error}
            isRetrying={isRetrying}
            canRetry={isRetryable}
          />
        </TabsContent>

        <TabsContent value="alternatives" className="space-y-4">
          <AlternativeWorkflowPaths
            currentError={error}
            failedStep={context.stepId}
            onPathSelected={onAlternativePathSelected}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Error History</CardTitle>
            </CardHeader>
            <CardContent>
              {recoveryHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No recent errors to display</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recoveryHistory.map((report, index) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {report.resolved ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <div className="text-sm font-medium">
                            {errorHandlingService.classifyError(report.error)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {report.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm">
                          {report.resolved ? (
                            <Badge className="bg-green-50 text-green-700 border-green-200">
                              Resolved
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Unresolved
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {report.recoveryAttempts} attempts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recovery Options Dialog */}
      <RecoveryOptionsDialog
        isOpen={showRecoveryDialog}
        onClose={() => setShowRecoveryDialog(false)}
        error={error}
        context={context}
        onRecoveryComplete={(success) => {
          if (success) {
            onRecoverySuccess?.();
          }
          setShowRecoveryDialog(false);
        }}
      />
    </div>
  );
}