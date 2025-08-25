import { realTimeService, RealTimeUpdate } from './realTimeService';
import { toast } from '@/hooks/use-toast';

export interface SyncState<T> {
  data: T;
  lastSync: Date;
  isStale: boolean;
  isSyncing: boolean;
  error?: string;
}

export interface SyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

class DataSyncService {
  private static instance: DataSyncService;
  private syncStates: Map<string, SyncState<any>> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private subscribers: Map<string, Array<(state: SyncState<any>) => void>> = new Map();

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  constructor() {
    this.setupRealTimeListeners();
  }

  private setupRealTimeListeners(): void {
    // Listen for real-time updates and mark relevant data as stale
    realTimeService.subscribe('*', (update: RealTimeUpdate) => {
      this.handleRealTimeUpdate(update);
    });
  }

  private handleRealTimeUpdate(update: RealTimeUpdate): void {
    switch (update.type) {
      case 'loan_created':
      case 'loan_updated':
      case 'loan_deleted':
        this.markStale('portfolio');
        this.markStale('loans');
        this.markStale(`loan_${update.data.loan_id}`);
        break;
      
      case 'calculation_completed':
        this.markStale('portfolio');
        this.markStale('portfolio_analytics');
        this.markStale('emissions_summary');
        break;
      
      case 'portfolio_updated':
        this.markStale('portfolio');
        this.markStale('portfolio_analytics');
        break;
      
      case 'batch_calculation_progress':
        // Update batch progress without marking as stale
        this.updateBatchProgress(update.data);
        break;
    }
  }

  private markStale(key: string): void {
    const state = this.syncStates.get(key);
    if (state) {
      state.isStale = true;
      this.notifySubscribers(key, state);
    }
  }

  private updateBatchProgress(progressData: any): void {
    const key = `batch_${progressData.batch_id}`;
    const state = this.syncStates.get(key) || {
      data: null,
      lastSync: new Date(),
      isStale: false,
      isSyncing: true
    };

    state.data = progressData;
    state.lastSync = new Date();
    this.syncStates.set(key, state);
    this.notifySubscribers(key, state);
  }

  private notifySubscribers(key: string, state: SyncState<any>): void {
    const subscribers = this.subscribers.get(key) || [];
    subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in sync state subscriber:', error);
      }
    });
  }

  // Register a data source for synchronization
  registerDataSource<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: SyncOptions = {}
  ): SyncState<T> {
    const {
      autoSync = false,
      syncInterval = 30000, // 30 seconds
      retryAttempts = 3,
      retryDelay = 1000
    } = options;

    // Initialize sync state
    const initialState: SyncState<T> = {
      data: null as T,
      lastSync: new Date(0),
      isStale: true,
      isSyncing: false
    };

    this.syncStates.set(key, initialState);

    // Set up auto-sync if enabled
    if (autoSync) {
      const interval = setInterval(() => {
        this.syncData(key, fetchFunction, { retryAttempts, retryDelay });
      }, syncInterval);
      
      this.syncIntervals.set(key, interval);
    }

    return initialState;
  }

  // Manually sync data
  async syncData<T>(
    key: string,
    fetchFunction?: () => Promise<T>,
    options: { retryAttempts?: number; retryDelay?: number } = {}
  ): Promise<T> {
    const { retryAttempts = 3, retryDelay = 1000 } = options;
    const state = this.syncStates.get(key);
    
    if (!state) {
      throw new Error(`Data source '${key}' not registered`);
    }

    if (state.isSyncing) {
      // Return existing data if already syncing
      return state.data;
    }

    state.isSyncing = true;
    state.error = undefined;
    this.notifySubscribers(key, state);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        let data: T;
        
        if (fetchFunction) {
          data = await fetchFunction();
        } else {
          // Use default fetch functions based on key
          data = await this.getDefaultFetchFunction<T>(key)();
        }

        state.data = data;
        state.lastSync = new Date();
        state.isStale = false;
        state.isSyncing = false;
        state.error = undefined;

        this.syncStates.set(key, state);
        this.notifySubscribers(key, state);

        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Sync failed');
        
        if (attempt < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    // All attempts failed
    state.isSyncing = false;
    state.error = lastError?.message || 'Sync failed';
    this.notifySubscribers(key, state);

    throw lastError;
  }

  private getDefaultFetchFunction<T>(key: string): () => Promise<T> {
    switch (key) {
      case 'portfolio':
        return async () => {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/loans/portfolio`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
          });
          if (!response.ok) throw new Error(`Portfolio fetch failed: ${response.statusText}`);
          const data = await response.json();
          return data.data;
        };
      
      case 'portfolio_analytics':
        return async () => {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analytics/portfolio`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
          });
          if (!response.ok) throw new Error(`Portfolio analytics fetch failed: ${response.statusText}`);
          const data = await response.json();
          return data.data;
        };
      
      case 'emissions_summary':
        return async () => {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analytics/emissions-summary`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
          });
          if (!response.ok) throw new Error(`Emissions summary fetch failed: ${response.statusText}`);
          const data = await response.json();
          return data.data;
        };
      
      default:
        if (key.startsWith('loan_')) {
          const loanId = key.replace('loan_', '');
          return async () => {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/loans/${loanId}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            if (!response.ok) throw new Error(`Loan fetch failed: ${response.statusText}`);
            const data = await response.json();
            return data.data;
          };
        }
        
        throw new Error(`No default fetch function for key: ${key}`);
    }
  }

  // Subscribe to sync state changes
  subscribe<T>(key: string, callback: (state: SyncState<T>) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    
    this.subscribers.get(key)!.push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  // Get current sync state
  getSyncState<T>(key: string): SyncState<T> | null {
    return this.syncStates.get(key) || null;
  }

  // Force refresh data (ignores cache)
  async forceRefresh<T>(key: string, fetchFunction?: () => Promise<T>): Promise<T> {
    const state = this.syncStates.get(key);
    if (state) {
      state.isStale = true;
    }
    
    return this.syncData(key, fetchFunction);
  }

  // Optimistic update with rollback capability
  async optimisticUpdate<T, R>(
    key: string,
    optimisticData: T,
    operation: () => Promise<R>,
    rollbackData?: T
  ): Promise<R> {
    const state = this.syncStates.get(key);
    if (!state) {
      throw new Error(`Data source '${key}' not registered`);
    }

    const originalData = state.data;
    
    // Apply optimistic update
    state.data = optimisticData;
    state.lastSync = new Date();
    this.notifySubscribers(key, state);

    try {
      // Perform actual operation
      const result = await operation();
      
      // Operation succeeded, keep optimistic data
      // (Real-time updates will provide the actual server state)
      return result;

    } catch (error) {
      // Rollback to original or provided rollback data
      state.data = rollbackData !== undefined ? rollbackData : originalData;
      state.error = error instanceof Error ? error.message : 'Operation failed';
      this.notifySubscribers(key, state);

      toast({
        title: "Update Failed",
        description: "Changes have been reverted",
        variant: "destructive"
      });

      throw error;
    }
  }

  // Batch sync multiple data sources
  async batchSync(keys: string[]): Promise<{ [key: string]: any }> {
    const results: { [key: string]: any } = {};
    const promises = keys.map(async (key) => {
      try {
        results[key] = await this.syncData(key);
      } catch (error) {
        results[key] = { error: error.message };
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Check if data needs refresh based on age and staleness
  needsRefresh(key: string, maxAge: number = 300000): boolean { // 5 minutes default
    const state = this.syncStates.get(key);
    if (!state) return true;
    
    const age = Date.now() - state.lastSync.getTime();
    return state.isStale || age > maxAge;
  }

  // Clean up resources
  unregisterDataSource(key: string): void {
    const interval = this.syncIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(key);
    }
    
    this.syncStates.delete(key);
    this.subscribers.delete(key);
  }

  // Get sync statistics
  getStats(): any {
    const stats = {
      registeredSources: this.syncStates.size,
      activeSyncs: 0,
      staleData: 0,
      errors: 0
    };

    this.syncStates.forEach((state) => {
      if (state.isSyncing) stats.activeSyncs++;
      if (state.isStale) stats.staleData++;
      if (state.error) stats.errors++;
    });

    return stats;
  }

  // Shutdown and cleanup
  shutdown(): void {
    // Clear all intervals
    this.syncIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    
    this.syncIntervals.clear();
    this.syncStates.clear();
    this.subscribers.clear();
  }
}

export const dataSyncService = DataSyncService.getInstance();