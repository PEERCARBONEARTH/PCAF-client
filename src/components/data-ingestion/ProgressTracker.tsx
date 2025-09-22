import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useProgressTracking, 
  useFormattedTimeRemaining 
} from '@/hooks/useProgressTracking';
import { safeToLocaleTimeString } from '@/utils/dateUtils';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';

interface ProgressTrackerProps {
  stepId?: string;
  showMetrics?: boolean;
  showHistory?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProgressTracker({ 
  stepId, 
  showMetrics = false, 
  showHistory = false, 
  compact = false,
  className = '' 
}: ProgressTrackerProps) {
  const {
    progressState,
    currentOperation,
    isActive,
    overallProgress,
    estimatedTimeRemaining,
    recentUpdates,
    metrics,
    pauseOperation,
    resumeOperation,
    clearHistory
  } = useProgressTracking();

  const timeRemainingText = useFormattedTimeRemaining(estimatedTimeRemaining);

  // Filter updates by step if stepId is provided
  const relevantUpdates = stepId 
    ? recentUpdates.filter(update => update.stepId === stepId)
    : recentUpdates;

  const isCurrentStepActive = stepId 
    ? currentOperation?.stepId === stepId && isActive
    : isActive;

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {isCurrentStepActive && currentOperation && (
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 animate-pulse text-blue-500" />
            <span className="font-medium">{currentOperation.message}</span>
            {currentOperation.progress > 0 && (
              <Badge variant="outline" className="text-xs">
                {Math.round(currentOperation.progress)}%
              </Badge>
            )}
          </div>
        )}
        
        {isCurrentStepActive && currentOperation && (
          <Progress 
            value={currentOperation.progress} 
            className="h-2"
          />
        )}
        
        {timeRemainingText && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeRemainingText} remaining</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Operation */}
      {isCurrentStepActive && currentOperation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 animate-pulse text-blue-500" />
              {currentOperation.operation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              <Badge 
                variant={currentOperation.status === 'in_progress' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {currentOperation.status.replace(/_/g, ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{currentOperation.message}</span>
                <span className="text-muted-foreground">
                  {Math.round(currentOperation.progress)}%
                </span>
              </div>
              <Progress value={currentOperation.progress} className="h-2" />
            </div>

            {/* Progress Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {currentOperation.totalItems && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {currentOperation.processedItems || 0} / {currentOperation.totalItems} items
                  </span>
                </div>
              )}
              
              {timeRemainingText && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeRemainingText} remaining</span>
                </div>
              )}
            </div>

            {/* Operation Controls */}
            {currentOperation.status === 'in_progress' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pauseOperation(currentOperation.id, 'Paused by user')}
                  className="text-xs"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              </div>
            )}

            {currentOperation.status === 'paused' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resumeOperation(currentOperation.id)}
                  className="text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Resume
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overall Progress */}
      {!stepId && overallProgress > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Workflow Completion</span>
                <span className="font-medium">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Updates */}
      {showHistory && relevantUpdates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {relevantUpdates.slice(0, 5).map((update) => (
                <div
                  key={update.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {update.status === 'completed' && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    {update.status === 'failed' && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                    {update.status === 'in_progress' && (
                      <Activity className="h-3 w-3 text-blue-500 animate-pulse" />
                    )}
                    <div>
                      <div className="text-xs font-medium">{update.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {safeToLocaleTimeString(update.timestamp)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(update.progress)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {showMetrics && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Success Rate</div>
                <div className="font-medium text-green-600">
                  {Math.round(metrics.successRate)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Processing Speed</div>
                <div className="font-medium">
                  {Math.round(metrics.itemsPerSecond)} items/sec
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Avg. Time</div>
                <div className="font-medium">
                  {Math.round(metrics.averageProcessingTime / 1000)}s
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Error Rate</div>
                <div className="font-medium text-red-600">
                  {Math.round(metrics.errorRate)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Activity State */}
      {!isCurrentStepActive && relevantUpdates.length === 0 && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            No active operations. Progress tracking will appear here when operations begin.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Specialized component for step-specific progress
export function StepProgressTracker({ 
  stepId, 
  className = '' 
}: { 
  stepId: string; 
  className?: string; 
}) {
  return (
    <ProgressTracker
      stepId={stepId}
      compact={true}
      className={className}
    />
  );
}

// Inline progress indicator for buttons and small spaces
export function InlineProgressIndicator({ 
  operationId, 
  className = '' 
}: { 
  operationId?: string; 
  className?: string; 
}) {
  const { currentOperation, isActive } = useProgressTracking();
  
  const isRelevant = operationId 
    ? currentOperation?.id === operationId
    : isActive;

  if (!isRelevant || !currentOperation) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <Activity className="h-3 w-3 animate-pulse text-blue-500" />
      <span>{Math.round(currentOperation.progress)}%</span>
      {currentOperation.estimatedTimeRemaining && (
        <span className="text-muted-foreground">
          ({useFormattedTimeRemaining(currentOperation.estimatedTimeRemaining)})
        </span>
      )}
    </div>
  );
}