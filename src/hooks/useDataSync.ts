import { useState, useEffect, useCallback, useRef } from 'react';
import { dataSyncService, SyncState, SyncOptions } from '@/services/dataSyncService';
import { useRealTimeUpdates } from './useRealTimeUpdates';

interface UseDataSyncOptions<T> extends SyncOptions {
  key: string;
  fetchFunction?: () => Promise<T>;
  dependencies?: any[];
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useDataSync<T>({
  key,
  fetchFunction,
  dependencies = [],
  enabled = true,
  autoSync = true,
  syncInterval = 30000,
  onSuccess,
  onError,
  ...options
}: UseDataSyncOptions<T>) {
  const [syncState, setSyncState] = useState<SyncState<T>>(() => 
    dataSyncService.getSyncState<T>(key) || {
      data: null as T,
      lastSync: new Date(0),
      isStale: true,
      isSyncing: false
    }
  );

  const [isInitialized, setIsInitialized] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { isConnected } = useRealTimeUpdates({ autoConnect: true });

  // Register data source and subscribe to changes
  useEffect(() => {
    if (!enabled) return;

    // Register the data source
    const initialState = dataSyncService.registerDataSource(key, fetchFunction, {
      autoSync,
      syncInterval,
      ...options
    });

    setSyncState(initialState);

    // Subscribe to sync state changes
    unsubscribeRef.current = dataSyncService.subscribe<T>(key, (newState) => {
      setSyncState({ ...newState });
      
      if (newState.data && !newState.error) {
        onSuccess?.(newState.data);
      } else if (newState.error) {
        onError?.(newState.error);
      }
    });

    setIsInitialized(true);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [key, enabled, autoSync, syncInterval, ...dependencies]);

  // Initial sync when component mounts or dependencies change
  useEffect(() => {
    if (!enabled || !isInitialized) return;

    const performInitialSync = async () => {
      try {
        await dataSyncService.syncData(key, fetchFunction);
      } catch (error) {
        console.error(`Initial sync failed for ${key}:`, error);
      }
    };

    performInitialSync();
  }, [key, enabled, isInitialized, ...dependencies]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!enabled) return null;
    
    try {
      return await dataSyncService.forceRefresh(key, fetchFunction);
    } catch (error) {
      console.error(`Manual refresh failed for ${key}:`, error);
      throw error;
    }
  }, [key, fetchFunction, enabled]);

  // Optimistic update function
  const optimisticUpdate = useCallback(async <R>(
    optimisticData: T,
    operation: () => Promise<R>,
    rollbackData?: T
  ): Promise<R> => {
    if (!enabled) {
      throw new Error('Data sync is disabled');
    }

    return dataSyncService.optimisticUpdate(key, optimisticData, operation, rollbackData);
  }, [key, enabled]);

  // Check if data needs refresh
  const needsRefresh = useCallback((maxAge?: number) => {
    return dataSyncService.needsRefresh(key, maxAge);
  }, [key]);

  // Auto-refresh when connection is restored
  useEffect(() => {
    if (isConnected && enabled && syncState.isStale) {
      refresh().catch(console.error);
    }
  }, [isConnected, enabled, syncState.isStale, refresh]);

  return {
    // Data state
    data: syncState.data,
    isLoading: syncState.isSyncing,
    isStale: syncState.isStale,
    error: syncState.error,
    lastSync: syncState.lastSync,
    
    // Connection state
    isConnected,
    
    // Actions
    refresh,
    optimisticUpdate,
    needsRefresh,
    
    // Computed properties
    hasData: syncState.data !== null,
    isError: !!syncState.error,
    isSuccess: !syncState.error && syncState.data !== null,
    age: Date.now() - syncState.lastSync.getTime()
  };
}

// Specialized hooks for common data types
export function usePortfolioSync(options: Omit<UseDataSyncOptions<any>, 'key'> = {}) {
  return useDataSync({
    key: 'portfolio',
    ...options
  });
}

export function usePortfolioAnalyticsSync(options: Omit<UseDataSyncOptions<any>, 'key'> = {}) {
  return useDataSync({
    key: 'portfolio_analytics',
    ...options
  });
}

export function useEmissionsSummarySync(options: Omit<UseDataSyncOptions<any>, 'key'> = {}) {
  return useDataSync({
    key: 'emissions_summary',
    ...options
  });
}

export function useLoanSync(loanId: string, options: Omit<UseDataSyncOptions<any>, 'key'> = {}) {
  return useDataSync({
    key: `loan_${loanId}`,
    dependencies: [loanId],
    ...options
  });
}

// Hook for batch operation progress tracking
export function useBatchProgressSync(batchId: string, options: Omit<UseDataSyncOptions<any>, 'key'> = {}) {
  return useDataSync({
    key: `batch_${batchId}`,
    autoSync: false, // Batch progress is updated via real-time events
    dependencies: [batchId],
    ...options
  });
}