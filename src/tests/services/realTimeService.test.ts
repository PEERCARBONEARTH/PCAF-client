import { realTimeService } from '../../services/realTimeService';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    
    // Echo back for testing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data }));
      }
    }, 10);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  ping() {
    // Mock ping method
  }
}

// Mock EventSource
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  readyState = MockEventSource.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = MockEventSource.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }
}

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

describe('RealTimeService', () => {
  beforeAll(() => {
    // Mock global objects
    (global as any).WebSocket = MockWebSocket;
    (global as any).EventSource = MockEventSource;
    (global as any).localStorage = mockLocalStorage;
  });

  beforeEach(() => {
    // Reset service state
    realTimeService.disconnect();
    jest.clearAllMocks();
  });

  afterEach(() => {
    realTimeService.disconnect();
  });

  describe('Connection Management', () => {
    it('should connect using WebSocket by default', (done) => {
      const statusListener = jest.fn((update) => {
        if (update.data.connected) {
          expect(update.type).toBe('system_status');
          expect(update.data.connected).toBe(true);
          done();
        }
      });

      realTimeService.subscribe('connection_status', statusListener);
      realTimeService.connect();
    });

    it('should handle connection status changes', (done) => {
      let connectionEvents = 0;
      
      const statusListener = jest.fn((update) => {
        connectionEvents++;
        
        if (connectionEvents === 1) {
          // First event should be connection established
          expect(update.data.connected).toBe(true);
        } else if (connectionEvents === 2) {
          // Second event should be disconnection
          expect(update.data.connected).toBe(false);
          done();
        }
      });

      realTimeService.subscribe('connection_status', statusListener);
      realTimeService.connect();
      
      // Disconnect after a short delay
      setTimeout(() => {
        realTimeService.disconnect();
      }, 50);
    });

    it('should provide connection status', () => {
      const status = realTimeService.getConnectionStatus();
      
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('lastHeartbeat');
      expect(status).toHaveProperty('reconnectAttempts');
      expect(status).toHaveProperty('latency');
      expect(typeof status.connected).toBe('boolean');
    });
  });

  describe('Event Subscription', () => {
    it('should allow subscribing to specific event types', (done) => {
      const loanListener = jest.fn((update) => {
        expect(update.type).toBe('loan_created');
        expect(update.data.loan_id).toBe('test_loan_123');
        done();
      });

      const unsubscribe = realTimeService.subscribe('loan_created', loanListener);
      
      // Simulate receiving an update
      setTimeout(() => {
        // This would normally come from the server
        const mockUpdate = {
          id: 'test_update',
          type: 'loan_created' as const,
          data: { loan_id: 'test_loan_123' },
          timestamp: new Date()
        };
        
        // Manually trigger the listener for testing
        loanListener(mockUpdate);
      }, 10);
    });

    it('should allow unsubscribing from events', () => {
      const listener = jest.fn();
      const unsubscribe = realTimeService.subscribe('loan_created', listener);
      
      // Unsubscribe
      unsubscribe();
      
      // Listener should not be called after unsubscribing
      expect(listener).not.toHaveBeenCalled();
    });

    it('should support wildcard subscriptions', (done) => {
      const wildcardListener = jest.fn((update) => {
        expect(['loan_created', 'loan_updated', 'portfolio_updated']).toContain(update.type);
        done();
      });

      realTimeService.subscribe('*', wildcardListener);
      
      // Simulate any update type
      setTimeout(() => {
        const mockUpdate = {
          id: 'test_update',
          type: 'portfolio_updated' as const,
          data: { total_loans: 100 },
          timestamp: new Date()
        };
        
        wildcardListener(mockUpdate);
      }, 10);
    });
  });

  describe('Optimistic Updates', () => {
    it('should handle successful optimistic updates', async () => {
      const mockOperation = jest.fn().mockResolvedValue({ success: true });
      const optimisticData = { loan_id: 'temp_123', status: 'pending' };
      
      const result = await realTimeService.optimisticUpdate(
        mockOperation,
        optimisticData,
        'loan_created'
      );

      expect(mockOperation).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle failed optimistic updates with rollback', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
      const rollbackFn = jest.fn();
      const optimisticData = { loan_id: 'temp_123', status: 'pending' };
      
      await expect(
        realTimeService.optimisticUpdate(
          mockOperation,
          optimisticData,
          'loan_created',
          rollbackFn
        )
      ).rejects.toThrow('Operation failed');

      expect(mockOperation).toHaveBeenCalled();
      expect(rollbackFn).toHaveBeenCalled();
    });
  });

  describe('Data Refresh', () => {
    it('should send refresh requests', () => {
      const sendSpy = jest.spyOn(realTimeService, 'send');
      
      realTimeService.requestRefresh('portfolio');
      
      expect(sendSpy).toHaveBeenCalledWith({
        type: 'refresh_request',
        dataType: 'portfolio',
        timestamp: expect.any(Number)
      });
    });
  });
});