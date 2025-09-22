import { useState, useEffect, useCallback } from 'react';
import { 
  progressTrackingService, 
  type ProgressState, 
  type ProgressUpdate,
  type ProgressMetrics 
} from '@/services/progressTrackingService';

export interface UseProgressTrackingReturn {
  progressState: ProgressState;
  currentOperation: ProgressUpdate | undefined;
  isActive: boolean;
  overallProgress: number;
  estimatedTimeRemaining: number | undefined;
  recentUpdates: ProgressUpdate[];
  metrics: ProgressMetrics;
  
  // Control methods
  startOperation: (stepId: string, operation: string, totalItems?: number) => string;
  updateProgress: (operationId: string, progress: number, message?: string, processedItems?: number) => void;
  completeOperation: (operationId: string, message?: string) => void;
  failOperation: (operationId: string, error: string) => void;
  pauseOperation: (operationId: string, reason?: string) => void;
  resumeOperation: (operationId: string) => void;
  clearHistory: () => void;
}

export function useProgressTracking(): UseProgressTrackingReturn {
  const [progressState, setProgressState] = useState<ProgressState>(
    progressTrackingService.getProgressState()
  );
  const [metrics, setMetrics] = useState<ProgressMetrics>(
    progressTrackingService.getProgressMetrics()
  );

  useEffect(() => {
    const unsubscribe = progressTrackingService.subscribe((state) => {
      setProgressState(state);
      setMetrics(progressTrackingService.getProgressMetrics());
    });

    return unsubscribe;
  }, []);

  const startOperation = useCallback((stepId: string, operation: string, totalItems?: number) => {
    return progressTrackingService.startOperation(stepId, operation, totalItems);
  }, []);

  const updateProgress = useCallback((
    operationId: string, 
    progress: number, 
    message?: string, 
    processedItems?: number
  ) => {
    progressTrackingService.updateProgressById(operationId, progress, message, processedItems);
  }, []);

  const completeOperation = useCallback((operationId: string, message?: string) => {
    progressTrackingService.completeOperation(operationId, message);
  }, []);

  const failOperation = useCallback((operationId: string, error: string) => {
    progressTrackingService.failOperation(operationId, error);
  }, []);

  const pauseOperation = useCallback((operationId: string, reason?: string) => {
    progressTrackingService.pauseOperation(operationId, reason);
  }, []);

  const resumeOperation = useCallback((operationId: string) => {
    progressTrackingService.resumeOperation(operationId);
  }, []);

  const clearHistory = useCallback(() => {
    progressTrackingService.clearHistory();
  }, []);

  return {
    progressState,
    currentOperation: progressState.currentOperation,
    isActive: progressState.isActive,
    overallProgress: progressState.overallProgress,
    estimatedTimeRemaining: progressState.estimatedTimeRemaining,
    recentUpdates: progressState.recentUpdates,
    metrics,
    
    startOperation,
    updateProgress,
    completeOperation,
    failOperation,
    pauseOperation,
    resumeOperation,
    clearHistory
  };
}

// Specialized hook for step-specific progress tracking
export function useStepProgressTracking(stepId: string) {
  const progressTracking = useProgressTracking();
  
  const isCurrentStep = progressTracking.currentOperation?.stepId === stepId;
  const stepProgress = isCurrentStep ? progressTracking.currentOperation : undefined;
  
  const startStepOperation = useCallback((operation: string, totalItems?: number) => {
    return progressTracking.startOperation(stepId, operation, totalItems);
  }, [stepId, progressTracking.startOperation]);

  return {
    ...progressTracking,
    isCurrentStep,
    stepProgress,
    startStepOperation
  };
}

// Hook for formatting time remaining
export function useFormattedTimeRemaining(milliseconds?: number): string {
  if (!milliseconds || milliseconds <= 0) {
    return '';
  }

  const seconds = Math.ceil(milliseconds / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}