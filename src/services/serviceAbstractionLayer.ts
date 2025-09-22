import { errorHandlingService, ErrorContext } from './errorHandlingService';
import { retryService } from './retryService';

export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime?: number;
  errorRate: number;
  uptime: number;
}

export interface ServiceConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  retryConfig?: any;
  healthCheckEndpoint?: string;
  fallbackToMock: boolean;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: Error;
  fromMock: boolean;
  responseTime: number;
  attempts: number;
}

class ServiceAbstractionLayer {
  private static instance: ServiceAbstractionLayer;
  private services: Map<string, ServiceConfig> = new Map();
  private healthStatus: Map<string, ServiceHealth> = new Map();
  private mockMode: Set<string> = new Set();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): ServiceAbstractionLayer {
    if (!ServiceAbstractionLayer.instance) {
      ServiceAbstractionLayer.instance = new ServiceAbstractionLayer();
    }
    return ServiceAbstractionLayer.instance;
  }

  constructor() {
    this.initializeDefaultServices();
    this.startHealthChecking();
  }

  private initializeDefaultServices(): void {
    // Register default services
    this.registerService({
      name: 'upload',
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
      timeout: 30000,
      healthCheckEndpoint: '/health',
      fallbackToMock: true
    });

    this.registerService({
      name: 'validation',
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
      timeout: 15000,
      healthCheckEndpoint: '/health',
      fallbackToMock: true
    });

    this.registerService({
      name: 'processing',
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
      timeout: 60000,
      healthCheckEndpoint: '/health',
      fallbackToMock: true
    });

    this.registerService({
      name: 'realtime',
      baseUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
      timeout: 10000,
      fallbackToMock: true
    });
  }

  registerService(config: ServiceConfig): void {
    this.services.set(config.name, config);
    this.healthStatus.set(config.name, {
      serviceName: config.name,
      status: 'healthy',
      lastCheck: new Date(),
      errorRate: 0,
      uptime: 100
    });
  }

  async callService<T>(
    serviceName: string,
    endpoint: string,
    options: RequestInit = {},
    mockFallback?: () => Promise<T>
  ): Promise<ServiceResponse<T>> {
    const startTime = Date.now();
    const service = this.services.get(serviceName);
    
    if (!service) {
      throw new Error(`Service ${serviceName} not registered`);
    }

    // Check if service is in mock mode or unhealthy
    if (this.shouldUseMock(serviceName)) {
      if (mockFallback) {
        try {
          const mockData = await mockFallback();
          return {
            success: true,
            data: mockData,
            fromMock: true,
            responseTime: Date.now() - startTime,
            attempts: 1
          };
        } catch (error) {
          return {
            success: false,
            error: error as Error,
            fromMock: true,
            responseTime: Date.now() - startTime,
            attempts: 1
          };
        }
      } else {
        return {
          success: false,
          error: new Error(`Service ${serviceName} unavailable and no mock fallback provided`),
          fromMock: false,
          responseTime: Date.now() - startTime,
          attempts: 0
        };
      }
    }

    // Attempt real service call with retry logic
    try {
      const result = await retryService.retryApiCall(
        async () => {
          const url = `${service.baseUrl}${endpoint}`;
          const response = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return await response.json();
        },
        endpoint,
        service.retryConfig
      );

      // Record successful call
      this.recordServiceCall(serviceName, true, Date.now() - startTime);

      return {
        success: true,
        data: result,
        fromMock: false,
        responseTime: Date.now() - startTime,
        attempts: 1 // retryService handles attempt counting internally
      };

    } catch (error) {
      // Record failed call
      this.recordServiceCall(serviceName, false, Date.now() - startTime);

      // Report error
      const context: ErrorContext = errorHandlingService.createErrorContext(
        `service_call_${serviceName}`,
        {
          serviceEndpoint: endpoint,
          requestData: options.body
        }
      );
      errorHandlingService.reportError(error as Error, context);

      // Try mock fallback if available and service allows it
      if (service.fallbackToMock && mockFallback) {
        console.warn(`Service ${serviceName} failed, falling back to mock data`);
        this.enableMockMode(serviceName);
        
        try {
          const mockData = await mockFallback();
          return {
            success: true,
            data: mockData,
            fromMock: true,
            responseTime: Date.now() - startTime,
            attempts: 1
          };
        } catch (mockError) {
          return {
            success: false,
            error: mockError as Error,
            fromMock: true,
            responseTime: Date.now() - startTime,
            attempts: 1
          };
        }
      }

      return {
        success: false,
        error: error as Error,
        fromMock: false,
        responseTime: Date.now() - startTime,
        attempts: 1
      };
    }
  }

  private shouldUseMock(serviceName: string): boolean {
    if (this.mockMode.has(serviceName)) {
      return true;
    }

    const health = this.healthStatus.get(serviceName);
    return health?.status === 'unhealthy';
  }

  private recordServiceCall(serviceName: string, success: boolean, responseTime: number): void {
    const health = this.healthStatus.get(serviceName);
    if (!health) return;

    // Update response time (simple moving average)
    health.responseTime = health.responseTime 
      ? (health.responseTime + responseTime) / 2 
      : responseTime;

    // Update error rate (exponential moving average)
    const errorWeight = success ? 0 : 1;
    health.errorRate = health.errorRate * 0.9 + errorWeight * 0.1;

    // Update status based on error rate and response time
    if (health.errorRate > 0.5 || (health.responseTime && health.responseTime > 30000)) {
      health.status = 'unhealthy';
    } else if (health.errorRate > 0.2 || (health.responseTime && health.responseTime > 10000)) {
      health.status = 'degraded';
    } else {
      health.status = 'healthy';
    }

    health.lastCheck = new Date();
  }

  private startHealthChecking(): void {
    // Check service health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000);
  }

  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, config] of this.services.entries()) {
      if (!config.healthCheckEndpoint) continue;

      try {
        const startTime = Date.now();
        const response = await fetch(`${config.baseUrl}${config.healthCheckEndpoint}`, {
          method: 'GET',
          timeout: 5000
        } as any);

        const responseTime = Date.now() - startTime;
        const success = response.ok;

        this.recordServiceCall(serviceName, success, responseTime);

        // If service was in mock mode but is now healthy, consider disabling mock mode
        if (success && this.mockMode.has(serviceName)) {
          const health = this.healthStatus.get(serviceName);
          if (health?.status === 'healthy') {
            console.log(`Service ${serviceName} recovered, disabling mock mode`);
            this.disableMockMode(serviceName);
          }
        }

      } catch (error) {
        this.recordServiceCall(serviceName, false, 5000);
      }
    }
  }

  // Public methods for mock mode management
  enableMockMode(serviceName: string): void {
    this.mockMode.add(serviceName);
    console.log(`Mock mode enabled for service: ${serviceName}`);
  }

  disableMockMode(serviceName: string): void {
    this.mockMode.delete(serviceName);
    console.log(`Mock mode disabled for service: ${serviceName}`);
  }

  isInMockMode(serviceName: string): boolean {
    return this.mockMode.has(serviceName);
  }

  enableGlobalMockMode(): void {
    for (const serviceName of this.services.keys()) {
      this.enableMockMode(serviceName);
    }
  }

  disableGlobalMockMode(): void {
    this.mockMode.clear();
  }

  // Service health monitoring
  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthStatus.get(serviceName);
  }

  getAllServiceHealth(): Record<string, ServiceHealth> {
    const result: Record<string, ServiceHealth> = {};
    this.healthStatus.forEach((health, name) => {
      result[name] = { ...health };
    });
    return result;
  }

  getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const healths = Array.from(this.healthStatus.values());
    
    if (healths.some(h => h.status === 'unhealthy')) {
      return 'unhealthy';
    }
    
    if (healths.some(h => h.status === 'degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  // Cleanup
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

export const serviceAbstractionLayer = ServiceAbstractionLayer.getInstance();