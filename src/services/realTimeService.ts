import { toast } from '@/hooks/use-toast';

export interface RealTimeUpdate {
  id: string;
  type: 'loan_created' | 'loan_updated' | 'loan_deleted' | 'calculation_completed' | 'portfolio_updated' | 'system_status' | 'data_quality_alert' | 'sync_status' | 'ai_insight' | 'upload_progress' | 'batch_job_update';
  data: any;
  timestamp: Date;
  userId?: string;
  requestId?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastHeartbeat: Date | null;
  reconnectAttempts: number;
  latency: number;
}

class RealTimeService {
  private static instance: RealTimeService;
  private eventSource: EventSource | null = null;
  private websocket: WebSocket | null = null;
  private connectionStatus: ConnectionStatus = {
    connected: false,
    lastHeartbeat: null,
    reconnectAttempts: 0,
    latency: 0
  };
  private listeners: Map<string, Array<(update: RealTimeUpdate) => void>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private useWebSocket = true; // Prefer WebSocket over SSE

  static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  connect(): void {
    if (this.useWebSocket) {
      this.connectWebSocket();
    } else {
      this.connectEventSource();
    }
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.connectionStatus.connected = false;
    this.notifyStatusChange();
  }

  private connectWebSocket(): void {
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3001'}/ws`;
    const token = localStorage.getItem('auth_token');

    try {
      this.websocket = new WebSocket(`${wsUrl}?token=${token}`);

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatus.connected = true;
        this.connectionStatus.reconnectAttempts = 0;
        this.connectionStatus.lastHeartbeat = new Date();
        this.notifyStatusChange();
        this.startHeartbeat();
      };

      this.websocket.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          this.handleUpdate(update);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.connectionStatus.connected = false;
        this.notifyStatusChange();
        
        if (event.code !== 1000) { // Not a normal closure
          this.scheduleReconnect();
        }
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus.connected = false;
        this.notifyStatusChange();
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.fallbackToEventSource();
    }
  }

  private connectEventSource(): void {
    const sseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'}/events/stream`;
    const token = localStorage.getItem('auth_token');

    try {
      this.eventSource = new EventSource(`${sseUrl}?token=${token}`);

      this.eventSource.onopen = () => {
        console.log('EventSource connected');
        this.connectionStatus.connected = true;
        this.connectionStatus.reconnectAttempts = 0;
        this.connectionStatus.lastHeartbeat = new Date();
        this.notifyStatusChange();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          this.handleUpdate(update);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        this.connectionStatus.connected = false;
        this.notifyStatusChange();
        this.scheduleReconnect();
      };

    } catch (error) {
      console.error('Failed to create EventSource connection:', error);
    }
  }

  private fallbackToEventSource(): void {
    console.log('Falling back to EventSource');
    this.useWebSocket = false;
    this.connectEventSource();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    const delay = Math.min(1000 * Math.pow(2, this.connectionStatus.reconnectAttempts), 30000);
    this.connectionStatus.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log(`Attempting to reconnect (attempt ${this.connectionStatus.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        const startTime = Date.now();
        this.websocket.send(JSON.stringify({ type: 'ping', timestamp: startTime }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private handleUpdate(update: RealTimeUpdate): void {
    // Update connection latency if this is a pong response
    if (update.type === 'system_status' && update.data.type === 'pong') {
      this.connectionStatus.latency = Date.now() - update.data.timestamp;
      this.connectionStatus.lastHeartbeat = new Date();
      return;
    }

    // Notify all listeners for this update type
    const typeListeners = this.listeners.get(update.type) || [];
    const allListeners = this.listeners.get('*') || [];
    
    [...typeListeners, ...allListeners].forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Error in real-time update listener:', error);
      }
    });

    // Show toast notification for important updates
    this.showNotification(update);
  }

  private showNotification(update: RealTimeUpdate): void {
    switch (update.type) {
      case 'loan_created':
        toast({
          title: "New Loan Added",
          description: `Loan ${update.data.loan_id} has been created`,
        });
        break;
      
      case 'loan_updated':
        toast({
          title: "Loan Updated",
          description: `Loan ${update.data.loan_id} has been updated`,
        });
        break;
      
      case 'calculation_completed':
        toast({
          title: "Calculation Complete",
          description: `PCAF calculations completed for ${update.data.count} loans in ${update.data.duration}ms`,
        });
        break;
      
      case 'portfolio_updated':
        toast({
          title: "Portfolio Updated",
          description: "Portfolio metrics have been recalculated",
        });
        break;

      case 'data_quality_alert':
        toast({
          title: "Data Quality Alert",
          description: update.data.message,
          variant: update.data.severity === 'high' ? 'destructive' : 'default'
        });
        break;
      
      case 'sync_status':
        if (update.data.status === 'completed') {
          toast({
            title: "Sync Complete",
            description: `${update.data.service} synchronization completed successfully`,
          });
        } else if (update.data.status === 'failed') {
          toast({
            title: "Sync Failed",
            description: `${update.data.service} synchronization failed: ${update.data.error}`,
            variant: "destructive"
          });
        }
        break;

      case 'upload_progress':
        if (update.data.status === 'completed') {
          toast({
            title: "Upload Complete",
            description: `Successfully processed ${update.data.processedItems} items`,
          });
        } else if (update.data.status === 'failed') {
          toast({
            title: "Upload Failed",
            description: update.data.error || 'Upload processing failed',
            variant: "destructive"
          });
        }
        break;

      case 'batch_job_update':
        if (update.data.status === 'completed') {
          toast({
            title: "Batch Job Complete",
            description: `${update.data.jobType} completed successfully`,
          });
        } else if (update.data.status === 'failed') {
          toast({
            title: "Batch Job Failed",
            description: `${update.data.jobType} failed: ${update.data.error}`,
            variant: "destructive"
          });
        }
        break;

      case 'ai_insight':
        if (update.data.type === 'recommendation') {
          toast({
            title: "New AI Recommendation",
            description: update.data.title,
          });
        }
        break;
    }
  }

  private notifyStatusChange(): void {
    const statusListeners = this.listeners.get('connection_status') || [];
    statusListeners.forEach(listener => {
      try {
        listener({
          id: 'status',
          type: 'system_status',
          data: this.connectionStatus,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in connection status listener:', error);
      }
    });
  }

  subscribe(eventType: string, listener: (update: RealTimeUpdate) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  // Optimistic update methods
  async optimisticUpdate<T>(
    operation: () => Promise<T>,
    optimisticData: any,
    updateType: string,
    rollbackFn?: () => void
  ): Promise<T> {
    // Apply optimistic update immediately
    this.handleUpdate({
      id: `optimistic_${Date.now()}`,
      type: updateType as any,
      data: { ...optimisticData, optimistic: true },
      timestamp: new Date()
    });

    try {
      // Perform actual operation
      const result = await operation();
      
      // Send confirmation update
      this.handleUpdate({
        id: `confirmed_${Date.now()}`,
        type: updateType as any,
        data: { ...result, optimistic: false },
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      // Rollback optimistic update
      if (rollbackFn) {
        rollbackFn();
      }
      
      this.handleUpdate({
        id: `rollback_${Date.now()}`,
        type: 'system_status' as any,
        data: { type: 'rollback', originalType: updateType, error: error.message },
        timestamp: new Date()
      });

      throw error;
    }
  }

  // Send data to server (for WebSocket bidirectional communication)
  send(data: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
    }
  }

  // Request immediate data refresh
  requestRefresh(dataType: string): void {
    this.send({
      type: 'refresh_request',
      dataType,
      timestamp: Date.now()
    });
  }
}

export const realTimeService = RealTimeService.getInstance();