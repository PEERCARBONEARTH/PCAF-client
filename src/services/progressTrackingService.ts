import { realTimeService, type RealTimeUpdate } from './realTimeService';

export interface ProgressUpdate {
  id: string;
  stepId: string;
  operation: string;
  progress: number; // 0-100
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
  message: string;
  timestamp: Date;
  estimatedTimeRemaining?: number; // in milliseconds
  totalItems?: number;
  processedItems?: number;
  metadata?: Record<string, any>;
}

export interface ProgressState {
  currentOperation?: ProgressUpdate;
  recentUpdates: ProgressUpdate[];
  overallProgress: number;
  estimatedTimeRemaining?: number;
  isActive: boolean;
  persistedAt?: Date;
}

export interface ProgressMetrics {
  averageProcessingTime: number;
  itemsPerSecond: number;
  successRate: number;
  errorRate: number;
}

class ProgressTrackingService {
  private static instance: ProgressTrackingService;
  private progressState: ProgressState;
  private listeners: Array<(state: ProgressState) => void> = [];
  private progressHistory: ProgressUpdate[] = [];
  private readonly STORAGE_KEY = 'pcaf_progress_state';
  private readonly MAX_HISTORY = 100;
  private readonly PERSISTENCE_INTERVAL = 2000; // 2 seconds
  private persistenceTimer: NodeJS.Timeout | null = null;
  private realTimeUnsubscribe: (() => void) | null = null;

  static getInstance(): ProgressTrackingService {
    if (!ProgressTrackingService.instance) {
      ProgressTrackingService.instance = new ProgressTrackingService();
    }
    return ProgressTrackingService.instance;
  }

  constructor() {
    this.progressState = this.initializeProgressState();
    this.loadPersistedState();
    this.setupRealTimeSubscription();
    this.startPersistenceTimer();
  }

  private initializeProgressState(): ProgressState {
    return {
      recentUpdates: [],
      overallProgress: 0,
      isActive: false
    };
  }

  private setupRealTimeSubscription(): void {
    // Subscribe to real-time progress updates
    this.realTimeUnsubscribe = realTimeService.subscribe('upload_progress', (update: RealTimeUpdate) => {
      this.handleRealTimeProgressUpdate(update);
    });

    // Also subscribe to batch job updates
    realTimeService.subscribe('batch_job_update', (update: RealTimeUpdate) => {
      this.handleRealTimeBatchUpdate(update);
    });
  }

  private handleRealTimeProgressUpdate(update: RealTimeUpdate): void {
    const progressUpdate: ProgressUpdate = {
      id: update.id,
      stepId: update.data.stepId || 'unknown',
      operation: update.data.operation || 'upload',
      progress: update.data.progress || 0,
      status: this.mapRealTimeStatus(update.data.status),
      message: update.data.message || 'Processing...',
      timestamp: new Date(update.timestamp),
      estimatedTimeRemaining: update.data.estimatedTimeRemaining,
      totalItems: update.data.totalItems,
      processedItems: update.data.processedItems,
      metadata: update.data.metadata
    };

    this.updateProgress(progressUpdate);
  }

  private handleRealTimeBatchUpdate(update: RealTimeUpdate): void {
    const progressUpdate: ProgressUpdate = {
      id: update.id,
      stepId: update.data.stepId || 'processing',
      operation: update.data.jobType || 'batch_processing',
      progress: update.data.progress || 0,
      status: this.mapRealTimeStatus(update.data.status),
      message: update.data.message || `${update.data.jobType} in progress...`,
      timestamp: new Date(update.timestamp),
      estimatedTimeRemaining: update.data.estimatedTimeRemaining,
      totalItems: update.data.totalItems,
      processedItems: update.data.processedItems,
      metadata: update.data
    };

    this.updateProgress(progressUpdate);
  }

  private mapRealTimeStatus(status: string): ProgressUpdate['status'] {
    switch (status) {
      case 'started':
      case 'processing':
      case 'running':
        return 'in_progress';
      case 'completed':
      case 'success':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      case 'paused':
        return 'paused';
      default:
        return 'pending';
    }
  }

  private startPersistenceTimer(): void {
    this.persistenceTimer = setInterval(() => {
      this.persistState();
    }, this.PERSISTENCE_INTERVAL);
  }

  private persistState(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const stateToSave = {
        ...this.progressState,
        persistedAt: new Date()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to persist progress state:', error);
    }
  }

  private loadPersistedState(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (!savedState) return;

      const parsedState = JSON.parse(savedState);
      
      // Check if state is not too old (1 hour)
      if (parsedState.persistedAt) {
        const savedTime = new Date(parsedState.persistedAt).getTime();
        const now = Date.now();
        
        if (now - savedTime > 60 * 60 * 1000) {
          console.log('Persisted progress state expired, starting fresh');
          this.clearPersistedState();
          return;
        }
      }

      // Restore state but mark as inactive since we're loading from storage
      this.progressState = {
        ...parsedState,
        isActive: false // Don't resume active operations
      };

      console.log('Restored progress state from previous session');
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to load persisted progress state:', error);
      this.clearPersistedState();
    }
  }

  private clearPersistedState(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted progress state:', error);
    }
  }

  // Public API methods
  startOperation(stepId: string, operation: string, totalItems?: number): string {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const progressUpdate: ProgressUpdate = {
      id: operationId,
      stepId,
      operation,
      progress: 0,
      status: 'in_progress',
      message: `Starting ${operation}...`,
      timestamp: new Date(),
      totalItems,
      processedItems: 0
    };

    this.progressState.currentOperation = progressUpdate;
    this.progressState.isActive = true;
    this.updateProgress(progressUpdate);

    return operationId;
  }

  updateProgress(update: ProgressUpdate): void {
    // Update current operation if it matches
    if (this.progressState.currentOperation?.id === update.id) {
      this.progressState.currentOperation = { ...this.progressState.currentOperation, ...update };
    }

    // Add to recent updates
    this.progressState.recentUpdates.unshift(update);
    if (this.progressState.recentUpdates.length > 10) {
      this.progressState.recentUpdates = this.progressState.recentUpdates.slice(0, 10);
    }

    // Add to history
    this.progressHistory.unshift(update);
    if (this.progressHistory.length > this.MAX_HISTORY) {
      this.progressHistory = this.progressHistory.slice(0, this.MAX_HISTORY);
    }

    // Update overall progress
    this.calculateOverallProgress();

    // Calculate estimated time remaining
    this.calculateEstimatedTimeRemaining(update);

    // Check if operation is complete
    if (update.status === 'completed' || update.status === 'failed') {
      if (this.progressState.currentOperation?.id === update.id) {
        this.progressState.isActive = false;
        this.progressState.currentOperation = undefined;
      }
    }

    this.notifyListeners();
  }

  updateProgressById(
    operationId: string, 
    progress: number, 
    message?: string, 
    processedItems?: number
  ): void {
    const currentOp = this.progressState.currentOperation;
    if (currentOp?.id === operationId) {
      const update: ProgressUpdate = {
        ...currentOp,
        progress: Math.min(100, Math.max(0, progress)),
        message: message || currentOp.message,
        processedItems: processedItems ?? currentOp.processedItems,
        timestamp: new Date()
      };

      this.updateProgress(update);
    }
  }

  completeOperation(operationId: string, message?: string): void {
    const currentOp = this.progressState.currentOperation;
    if (currentOp?.id === operationId) {
      const update: ProgressUpdate = {
        ...currentOp,
        progress: 100,
        status: 'completed',
        message: message || 'Operation completed successfully',
        timestamp: new Date()
      };

      this.updateProgress(update);
    }
  }

  failOperation(operationId: string, error: string): void {
    const currentOp = this.progressState.currentOperation;
    if (currentOp?.id === operationId) {
      const update: ProgressUpdate = {
        ...currentOp,
        status: 'failed',
        message: error,
        timestamp: new Date()
      };

      this.updateProgress(update);
    }
  }

  pauseOperation(operationId: string, reason?: string): void {
    const currentOp = this.progressState.currentOperation;
    if (currentOp?.id === operationId) {
      const update: ProgressUpdate = {
        ...currentOp,
        status: 'paused',
        message: reason || 'Operation paused',
        timestamp: new Date()
      };

      this.updateProgress(update);
    }
  }

  resumeOperation(operationId: string): void {
    const currentOp = this.progressState.currentOperation;
    if (currentOp?.id === operationId && currentOp.status === 'paused') {
      const update: ProgressUpdate = {
        ...currentOp,
        status: 'in_progress',
        message: 'Operation resumed',
        timestamp: new Date()
      };

      this.updateProgress(update);
    }
  }

  private calculateOverallProgress(): void {
    if (this.progressState.currentOperation) {
      this.progressState.overallProgress = this.progressState.currentOperation.progress;
    } else if (this.progressState.recentUpdates.length > 0) {
      // Use the most recent completed operation
      const lastUpdate = this.progressState.recentUpdates[0];
      this.progressState.overallProgress = lastUpdate.status === 'completed' ? 100 : lastUpdate.progress;
    }
  }

  private calculateEstimatedTimeRemaining(update: ProgressUpdate): void {
    if (update.status !== 'in_progress' || !update.totalItems || !update.processedItems) {
      return;
    }

    // Find similar operations in history for better estimation
    const similarOps = this.progressHistory.filter(op => 
      op.operation === update.operation && 
      op.status === 'completed' &&
      op.totalItems
    );

    if (similarOps.length > 0) {
      // Use historical data for estimation
      const avgTimePerItem = similarOps.reduce((sum, op) => {
        const duration = op.timestamp.getTime() - (op.metadata?.startTime || op.timestamp.getTime());
        return sum + (duration / (op.totalItems || 1));
      }, 0) / similarOps.length;

      const remainingItems = update.totalItems - update.processedItems;
      this.progressState.estimatedTimeRemaining = remainingItems * avgTimePerItem;
    } else {
      // Fallback to simple calculation based on current progress
      const elapsedTime = Date.now() - update.timestamp.getTime();
      const progressRate = update.progress / Math.max(elapsedTime, 1000); // progress per ms
      const remainingProgress = 100 - update.progress;
      
      if (progressRate > 0) {
        this.progressState.estimatedTimeRemaining = remainingProgress / progressRate;
      }
    }
  }

  // Subscription methods
  subscribe(listener: (state: ProgressState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getProgressState());
      } catch (error) {
        console.error('Error in progress tracking listener:', error);
      }
    });
  }

  // Getter methods
  getProgressState(): ProgressState {
    return { ...this.progressState };
  }

  getCurrentOperation(): ProgressUpdate | undefined {
    return this.progressState.currentOperation ? { ...this.progressState.currentOperation } : undefined;
  }

  getProgressHistory(): ProgressUpdate[] {
    return [...this.progressHistory];
  }

  getProgressMetrics(): ProgressMetrics {
    const completedOps = this.progressHistory.filter(op => op.status === 'completed');
    const failedOps = this.progressHistory.filter(op => op.status === 'failed');
    
    const totalOps = completedOps.length + failedOps.length;
    
    if (totalOps === 0) {
      return {
        averageProcessingTime: 0,
        itemsPerSecond: 0,
        successRate: 0,
        errorRate: 0
      };
    }

    const avgProcessingTime = completedOps.reduce((sum, op) => {
      const duration = op.metadata?.duration || 0;
      return sum + duration;
    }, 0) / Math.max(completedOps.length, 1);

    const totalItems = completedOps.reduce((sum, op) => sum + (op.totalItems || 0), 0);
    const totalTime = completedOps.reduce((sum, op) => sum + (op.metadata?.duration || 0), 0);
    const itemsPerSecond = totalTime > 0 ? (totalItems / (totalTime / 1000)) : 0;

    return {
      averageProcessingTime: avgProcessingTime,
      itemsPerSecond,
      successRate: (completedOps.length / totalOps) * 100,
      errorRate: (failedOps.length / totalOps) * 100
    };
  }

  // Utility methods
  isOperationActive(): boolean {
    return this.progressState.isActive && this.progressState.currentOperation?.status === 'in_progress';
  }

  clearHistory(): void {
    this.progressHistory = [];
    this.progressState.recentUpdates = [];
    this.clearPersistedState();
    this.notifyListeners();
  }

  // Cleanup method
  destroy(): void {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
      this.persistenceTimer = null;
    }

    if (this.realTimeUnsubscribe) {
      this.realTimeUnsubscribe();
      this.realTimeUnsubscribe = null;
    }

    this.listeners = [];
    this.persistState(); // Final save
  }
}

export const progressTrackingService = ProgressTrackingService.getInstance();