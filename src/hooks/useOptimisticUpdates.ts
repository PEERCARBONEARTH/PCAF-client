import { useState, useCallback, useRef } from 'react';
import { realTimeService } from '@/services/realTimeService';
import { dataSyncService } from '@/services/dataSyncService';
import { useToast } from '@/hooks/use-toast';

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  error?: string;
}

interface UseOptimisticUpdatesOptions<T> {
  initialData: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  showToasts?: boolean;
}

export function useOptimisticUpdates<T>({
  initialData,
  onSuccess,
  onError,
  showToasts = true
}: UseOptimisticUpdatesOptions<T>) {
  const { toast } = useToast();
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false
  });
  
  const rollbackDataRef = useRef<T>(initialData);

  const performOptimisticUpdate = useCallback(async <R>(
    optimisticData: T,
    operation: () => Promise<R>,
    updateType: string,
    successMessage?: string,
    errorMessage?: string,
    syncKey?: string
  ): Promise<R> => {
    // Store current data for potential rollback
    rollbackDataRef.current = state.data;

    // Apply optimistic update
    setState({
      data: optimisticData,
      isOptimistic: true,
      error: undefined
    });

    if (showToasts) {
      toast({
        title: "Updating...",
        description: "Changes are being processed",
      });
    }

    try {
      let result: R;

      // Use data sync service if sync key is provided
      if (syncKey) {
        result = await dataSyncService.optimisticUpdate(
          syncKey,
          optimisticData,
          operation,
          rollbackDataRef.current
        );
      } else {
        // Fallback to real-time service
        result = await realTimeService.optimisticUpdate(
          operation,
          optimisticData,
          updateType,
          () => {
            // Rollback function
            setState({
              data: rollbackDataRef.current,
              isOptimistic: false,
              error: 'Operation failed - changes reverted'
            });
          }
        );
      }

      // Update with confirmed data
      setState({
        data: optimisticData, // In a real app, this would be the server response
        isOptimistic: false,
        error: undefined
      });

      if (showToasts && successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      onSuccess?.(optimisticData);
      return result;

    } catch (error) {
      // Rollback to previous state
      setState({
        data: rollbackDataRef.current,
        isOptimistic: false,
        error: error instanceof Error ? error.message : 'Operation failed'
      });

      if (showToasts) {
        toast({
          title: "Error",
          description: errorMessage || "Operation failed - changes reverted",
          variant: "destructive"
        });
      }

      onError?.(error instanceof Error ? error : new Error('Operation failed'), rollbackDataRef.current);
      throw error;
    }
  }, [state.data, onSuccess, onError, showToasts, toast]);

  const updateData = useCallback((newData: T) => {
    setState({
      data: newData,
      isOptimistic: false,
      error: undefined
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    error: state.error,
    performOptimisticUpdate,
    updateData,
    clearError
  };
}

// Specialized hooks for common operations
export function useOptimisticLoanUpdates(initialLoans: any[] = []) {
  const optimistic = useOptimisticUpdates({
    initialData: initialLoans,
    showToasts: true
  });

  const addLoan = useCallback(async (newLoan: any, createOperation: () => Promise<any>) => {
    const optimisticLoans = [...optimistic.data, { ...newLoan, id: `temp_${Date.now()}` }];
    
    return optimistic.performOptimisticUpdate(
      optimisticLoans,
      createOperation,
      'loan_created',
      'Loan added successfully',
      'Failed to add loan',
      'portfolio'
    );
  }, [optimistic]);

  const updateLoan = useCallback(async (loanId: string, updates: any, updateOperation: () => Promise<any>) => {
    const optimisticLoans = optimistic.data.map(loan => 
      loan.loan_id === loanId ? { ...loan, ...updates } : loan
    );
    
    return optimistic.performOptimisticUpdate(
      optimisticLoans,
      updateOperation,
      'loan_updated',
      'Loan updated successfully',
      'Failed to update loan',
      'portfolio'
    );
  }, [optimistic]);

  const deleteLoan = useCallback(async (loanId: string, deleteOperation: () => Promise<any>) => {
    const optimisticLoans = optimistic.data.filter(loan => loan.loan_id !== loanId);
    
    return optimistic.performOptimisticUpdate(
      optimisticLoans,
      deleteOperation,
      'loan_deleted',
      'Loan deleted successfully',
      'Failed to delete loan',
      'portfolio'
    );
  }, [optimistic]);

  return {
    ...optimistic,
    addLoan,
    updateLoan,
    deleteLoan
  };
}

export function useOptimisticPortfolioUpdates(initialMetrics: any = {}) {
  const optimistic = useOptimisticUpdates({
    initialData: initialMetrics,
    showToasts: false // Portfolio updates are usually silent
  });

  const updateMetrics = useCallback(async (newMetrics: any, recalculateOperation: () => Promise<any>) => {
    return optimistic.performOptimisticUpdate(
      newMetrics,
      recalculateOperation,
      'portfolio_updated',
      undefined,
      'Failed to update portfolio metrics',
      'portfolio_analytics'
    );
  }, [optimistic]);

  return {
    ...optimistic,
    updateMetrics
  };
}