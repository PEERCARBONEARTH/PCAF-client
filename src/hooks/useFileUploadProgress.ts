import { useState, useCallback, useRef } from 'react';

export interface FileUploadProgress {
  uploadId: string;
  status: 'idle' | 'validating' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  processedItems: number;
  totalItems: number;
  estimatedTimeRemaining?: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
  startTime?: Date;
}

export interface UseFileUploadProgressReturn {
  progress: FileUploadProgress | null;
  startProgress: (uploadId: string, totalItems: number) => void;
  updateProgress: (updates: Partial<FileUploadProgress>) => void;
  completeProgress: () => void;
  failProgress: (error: string) => void;
  cancelProgress: () => void;
  resetProgress: () => void;
}

export function useFileUploadProgress(): UseFileUploadProgressReturn {
  const [progress, setProgress] = useState<FileUploadProgress | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const startProgress = useCallback((uploadId: string, totalItems: number) => {
    const startTime = new Date();
    startTimeRef.current = startTime;
    
    setProgress({
      uploadId,
      status: 'validating',
      progress: 0,
      currentStep: 'Initializing upload...',
      processedItems: 0,
      totalItems,
      errors: [],
      startTime,
    });
  }, []);

  const updateProgress = useCallback((updates: Partial<FileUploadProgress>) => {
    setProgress(prev => {
      if (!prev) return null;

      const updated = { ...prev, ...updates };

      // Calculate estimated time remaining if progress is available
      if (updated.progress > 0 && updated.progress < 100 && startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current.getTime();
        const estimatedTotal = (elapsed / updated.progress) * 100;
        updated.estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed);
      }

      return updated;
    });
  }, []);

  const completeProgress = useCallback(() => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        status: 'completed',
        progress: 100,
        currentStep: 'Upload completed successfully',
        estimatedTimeRemaining: 0,
      };
    });
  }, []);

  const failProgress = useCallback((error: string) => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        status: 'failed',
        currentStep: 'Upload failed',
        errors: [
          ...prev.errors,
          {
            row: 0,
            error,
          },
        ],
      };
    });
  }, []);

  const cancelProgress = useCallback(() => {
    setProgress(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        status: 'cancelled',
        currentStep: 'Upload cancelled',
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(null);
    startTimeRef.current = null;
  }, []);

  return {
    progress,
    startProgress,
    updateProgress,
    completeProgress,
    failProgress,
    cancelProgress,
    resetProgress,
  };
}