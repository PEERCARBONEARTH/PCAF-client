import { useEffect, useState, useCallback, useRef } from 'react';
import { realTimeService, type RealTimeUpdate, type ConnectionStatus } from '@/services/realTimeService';

interface UseRealTimeUpdatesOptions {
  eventTypes?: string[];
  autoConnect?: boolean;
  onUpdate?: (update: RealTimeUpdate) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const {
    eventTypes = ['*'],
    autoConnect = true,
    onUpdate,
    onConnectionChange
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    realTimeService.getConnectionStatus()
  );
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeFunctions = useRef<Array<() => void>>([]);

  const handleUpdate = useCallback((update: RealTimeUpdate) => {
    setUpdates(prev => [update, ...prev.slice(0, 99)]); // Keep last 100 updates
    onUpdate?.(update);
  }, [onUpdate]);

  const handleConnectionChange = useCallback((update: RealTimeUpdate) => {
    if (update.type === 'system_status') {
      const status = update.data as ConnectionStatus;
      setConnectionStatus(status);
      setIsConnected(status.connected);
      onConnectionChange?.(status);
    }
  }, [onConnectionChange]);

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribeStatus = realTimeService.subscribe('connection_status', handleConnectionChange);
    unsubscribeFunctions.current.push(unsubscribeStatus);

    // Subscribe to specified event types
    eventTypes.forEach(eventType => {
      const unsubscribe = realTimeService.subscribe(eventType, handleUpdate);
      unsubscribeFunctions.current.push(unsubscribe);
    });

    // Auto-connect if enabled
    if (autoConnect) {
      realTimeService.connect();
    }

    // Update initial connection status
    setConnectionStatus(realTimeService.getConnectionStatus());
    setIsConnected(realTimeService.getConnectionStatus().connected);

    return () => {
      // Cleanup subscriptions
      unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
      unsubscribeFunctions.current = [];
    };
  }, [eventTypes, autoConnect, handleUpdate, handleConnectionChange]);

  const connect = useCallback(() => {
    realTimeService.connect();
  }, []);

  const disconnect = useCallback(() => {
    realTimeService.disconnect();
  }, []);

  const requestRefresh = useCallback((dataType: string) => {
    realTimeService.requestRefresh(dataType);
  }, []);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  const getUpdatesByType = useCallback((type: string) => {
    return updates.filter(update => update.type === type);
  }, [updates]);

  const getLatestUpdate = useCallback((type?: string) => {
    if (type) {
      return updates.find(update => update.type === type) || null;
    }
    return updates[0] || null;
  }, [updates]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    
    // Updates
    updates,
    latestUpdate: getLatestUpdate(),
    
    // Actions
    connect,
    disconnect,
    requestRefresh,
    clearUpdates,
    
    // Utilities
    getUpdatesByType,
    getLatestUpdate
  };
}

// Specialized hooks for common use cases
export function usePortfolioUpdates() {
  return useRealTimeUpdates({
    eventTypes: ['loan_created', 'loan_updated', 'loan_deleted', 'portfolio_updated']
  });
}

export function useCalculationUpdates() {
  return useRealTimeUpdates({
    eventTypes: ['calculation_completed', 'batch_calculation_progress']
  });
}

export function useSystemStatus() {
  return useRealTimeUpdates({
    eventTypes: ['system_status', 'connection_status']
  });
}