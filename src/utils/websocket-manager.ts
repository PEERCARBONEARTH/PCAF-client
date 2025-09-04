/**
 * WebSocket Manager with JWT Token Refresh
 * Handles WebSocket connections with automatic token refresh
 */

interface WebSocketConfig {
  url: string;
  token?: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: (event: Event) => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface TokenRefreshFunction {
  (): Promise<string>;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private tokenRefreshFn?: TokenRefreshFunction;
  private reconnectCount = 0;
  private isConnecting = false;
  private shouldReconnect = true;

  constructor(config: WebSocketConfig, tokenRefreshFn?: TokenRefreshFunction) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      ...config
    };
    this.tokenRefreshFn = tokenRefreshFn;
  }

  public connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const url = this.config.token 
      ? `${this.config.url}?token=${this.config.token}`
      : this.config.url;

    console.log('🔌 Connecting to WebSocket:', url.substring(0, 50) + '...');

    this.ws = new WebSocket(url);

    this.ws.onopen = (event) => {
      console.log('✅ WebSocket connected');
      this.isConnecting = false;
      this.reconnectCount = 0;
      this.config.onOpen?.(event);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.config.onMessage?.(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('🔒 WebSocket closed:', event.code, event.reason);
      this.isConnecting = false;
      
      // Check if it's a JWT expired error
      if (event.code === 1008) {
        try {
          const errorData = JSON.parse(event.reason);
          if (errorData.error === 'jwt expired') {
            console.log('🔄 JWT token expired, attempting refresh...');
            this.handleTokenExpired();
            return;
          }
        } catch (e) {
          // Reason is not JSON, continue with normal reconnect
        }
      }

      this.config.onClose?.(event);
      this.attemptReconnect();
    };

    this.ws.onerror = (event) => {
      console.error('❌ WebSocket error:', event);
      this.isConnecting = false;
      this.config.onError?.(event);
    };
  }

  private async handleTokenExpired(): Promise<void> {
    if (!this.tokenRefreshFn) {
      console.error('No token refresh function provided');
      return;
    }

    try {
      console.log('🔑 Refreshing JWT token...');
      const newToken = await this.tokenRefreshFn();
      this.config.token = newToken;
      console.log('✅ Token refreshed, reconnecting...');
      
      // Reconnect with new token
      setTimeout(() => {
        this.connect();
      }, 1000);
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Fall back to normal reconnect logic
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (!this.shouldReconnect || this.reconnectCount >= (this.config.reconnectAttempts || 5)) {
      console.log('🚫 Max reconnection attempts reached');
      return;
    }

    this.reconnectCount++;
    const delay = (this.config.reconnectDelay || 1000) * Math.pow(2, this.reconnectCount - 1);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectCount})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Example usage function
export function createWebSocketConnection(
  serverUrl: string, 
  token: string,
  onTokenRefresh: () => Promise<string>
): WebSocketManager {
  
  const wsManager = new WebSocketManager({
    url: serverUrl,
    token: token,
    onMessage: (data) => {
      console.log('📨 Received:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'system_status':
          if (data.data.type === 'connected') {
            console.log('🎉 Successfully connected to server');
          }
          break;
        case 'portfolio_update':
          console.log('📊 Portfolio data updated');
          break;
        case 'calculation_complete':
          console.log('🧮 Calculation completed');
          break;
        default:
          console.log('📋 Unknown message type:', data.type);
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    onClose: (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
    },
    onOpen: () => {
      console.log('WebSocket opened successfully');
    }
  }, onTokenRefresh);

  return wsManager;
}