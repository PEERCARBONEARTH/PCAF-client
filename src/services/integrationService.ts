import { handleAPIError, APIResponse } from './api';
import { toast } from '@/hooks/use-toast';

export interface LMSConnectionConfig {
  provider: 'encompass' | 'ellie_mae' | 'black_knight' | 'custom';
  baseUrl: string;
  apiKey: string;
  clientId?: string;
  clientSecret?: string;
  environment?: 'sandbox' | 'production';
}

export interface LMSSyncConfig {
  syncType: 'full' | 'incremental' | 'specific_loans';
  lastSyncDate?: Date;
  loanIds?: string[];
  includePaymentHistory: boolean;
  includeLoanModifications: boolean;
  dryRun: boolean;
}

export interface LMSSyncResult {
  requestId: string;
  syncedLoans: number;
  totalProcessed: number;
  errors: Array<{
    loanId?: string;
    error: string;
    severity: 'error' | 'warning';
  }>;
  duration: number;
  dryRun: boolean;
}

export interface LMSConnectionStatus {
  connected: boolean;
  connectionHealth: 'healthy' | 'degraded' | 'unhealthy';
  lastSyncDate?: Date;
  lastTestDate?: Date;
  provider: string;
  environment: string;
  apiVersion?: string;
  rateLimitStatus?: {
    remaining: number;
    resetTime: Date;
  };
}

export interface EmissionFactorFilter {
  region?: string;
  vehicleType?: string;
  fuelType?: string;
  year?: number;
  source?: string;
}

export interface EmissionFactor {
  id: string;
  vehicleType: string;
  fuelType: string;
  region: string;
  year?: number;
  emissionFactorKgCO2Km: number;
  dataQualityLevel: number;
  source: string;
  lastUpdated: Date;
  metadata?: Record<string, any>;
}

export interface VehicleLookupRequest {
  vehicles: Array<{
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    engineSize?: string;
  }>;
  includeSpecifications: boolean;
  includeEfficiencyData: boolean;
  includeEmissionStandards: boolean;
  validateOnly: boolean;
}

export interface VehicleSpecification {
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  fuelType: string;
  engineSize?: string;
  found: boolean;
  specifications?: {
    mpg?: number;
    engineDisplacement?: number;
    transmission?: string;
    drivetrain?: string;
  };
  efficiencyData?: {
    cityMpg?: number;
    highwayMpg?: number;
    combinedMpg?: number;
    fuelEconomyScore?: number;
  };
  emissionStandards?: {
    tier?: string;
    certificationLevel?: string;
    emissionStandard?: string;
  };
}

export interface ExternalServicesStatus {
  lms: LMSConnectionStatus;
  epa_api: {
    connected: boolean;
    connectionHealth: 'healthy' | 'degraded' | 'unhealthy';
    lastChecked?: Date;
  };
  vehicle_db: {
    connected: boolean;
    connectionHealth: 'healthy' | 'degraded' | 'unhealthy';
    lastChecked?: Date;
  };
  emission_factors_api: {
    connected: boolean;
    connectionHealth: 'healthy' | 'degraded' | 'unhealthy';
    lastChecked?: Date;
  };
  overall: {
    healthy: boolean;
    lastChecked: Date;
  };
}

export interface SyncHistoryEntry {
  id: string;
  service: string;
  syncType: string;
  status: 'success' | 'failed' | 'partial';
  startTime: Date;
  endTime: Date;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors?: string[];
  metadata?: Record<string, any>;
}

export interface APIUsageStats {
  service: string;
  date: string;
  requestCount: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  rateLimitHits: number;
  errorBreakdown: Record<string, number>;
}

class IntegrationService {
  private static instance: IntegrationService;

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  // LMS Integration Methods
  async syncWithLMS(config: LMSSyncConfig): Promise<LMSSyncResult> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/lms/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          sync_type: config.syncType,
          last_sync_date: config.lastSyncDate?.toISOString(),
          loan_ids: config.loanIds,
          include_payment_history: config.includePaymentHistory,
          include_loan_modifications: config.includeLoanModifications,
          dry_run: config.dryRun
        })
      });

      if (!response.ok) {
        throw new Error(`LMS sync failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('LMS sync failed:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async getLMSStatus(): Promise<LMSConnectionStatus> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/lms/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get LMS status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to get LMS status:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async testLMSConnection(config?: LMSConnectionConfig): Promise<{
    successful: boolean;
    responseTime: number;
    message: string;
    details?: any;
  }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/lms/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          connection_config: config
        })
      });

      if (!response.ok) {
        throw new Error(`LMS connection test failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('LMS connection test failed:', error);
      throw new Error(handleAPIError(error));
    }
  }

  // Emission Factors Methods
  async getEmissionFactors(filters: EmissionFactorFilter = {}): Promise<EmissionFactor[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/emission-factors?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get emission factors: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.factors;
    } catch (error) {
      console.error('Failed to get emission factors:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async refreshEmissionFactors(options: {
    sources?: string[];
    forceUpdate?: boolean;
    updateExistingCalculations?: boolean;
  } = {}): Promise<{
    updated: number;
    added: number;
    errors: string[];
  }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/emission-factors/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          sources: options.sources || ['all'],
          force_update: options.forceUpdate || false,
          update_existing_calculations: options.updateExistingCalculations || false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh emission factors: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to refresh emission factors:', error);
      throw new Error(handleAPIError(error));
    }
  }

  // Vehicle Lookup Methods
  async lookupVehicleSpecs(request: VehicleLookupRequest): Promise<{
    results: VehicleSpecification[];
    summary: {
      total: number;
      found: number;
      notFound: number;
    };
  }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/vehicle-lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          vehicles: request.vehicles,
          include_specifications: request.includeSpecifications,
          include_efficiency_data: request.includeEfficiencyData,
          include_emission_standards: request.includeEmissionStandards,
          validate_only: request.validateOnly
        })
      });

      if (!response.ok) {
        throw new Error(`Vehicle lookup failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Vehicle lookup failed:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async getVehicleMakes(year?: number, vehicleType?: string): Promise<string[]> {
    try {
      const queryParams = new URLSearchParams();
      if (year) queryParams.append('year', year.toString());
      if (vehicleType) queryParams.append('vehicle_type', vehicleType);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/vehicle-makes?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get vehicle makes: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.makes;
    } catch (error) {
      console.error('Failed to get vehicle makes:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async getVehicleModels(make: string, year?: number, vehicleType?: string): Promise<string[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('make', make);
      if (year) queryParams.append('year', year.toString());
      if (vehicleType) queryParams.append('vehicle_type', vehicleType);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/vehicle-models?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get vehicle models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.models;
    } catch (error) {
      console.error('Failed to get vehicle models:', error);
      throw new Error(handleAPIError(error));
    }
  }

  // Data Validation Methods
  async validateLoanData(loanIds: string[], validationTypes: string[], options: {
    updateOnValidation?: boolean;
    createAuditTrail?: boolean;
  } = {}): Promise<{
    results: Array<{
      loanId: string;
      isValid: boolean;
      updated: boolean;
      validationDetails: Record<string, any>;
    }>;
    summary: {
      total: number;
      valid: number;
      invalid: number;
      updated: number;
    };
  }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/validate-loan-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          loan_ids: loanIds,
          validation_types: validationTypes,
          update_on_validation: options.updateOnValidation || false,
          create_audit_trail: options.createAuditTrail || true
        })
      });

      if (!response.ok) {
        throw new Error(`Loan data validation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Loan data validation failed:', error);
      throw new Error(handleAPIError(error));
    }
  }

  // External Services Status
  async getExternalServicesStatus(): Promise<ExternalServicesStatus> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/external-services/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get external services status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to get external services status:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async testExternalServices(services: string[] = ['lms', 'epa_api', 'vehicle_db', 'emission_factors_api']): Promise<{
    results: Array<{
      service: string;
      status: 'success' | 'failed';
      successful: boolean;
      responseTime: number;
      timestamp: Date;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/external-services/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          services,
          include_detailed_response: true
        })
      });

      if (!response.ok) {
        throw new Error(`External services test failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('External services test failed:', error);
      throw new Error(handleAPIError(error));
    }
  }

  // Sync History
  async getSyncHistory(filters: {
    service?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    history: SyncHistoryEntry[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/sync-history?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get sync history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to get sync history:', error);
      throw new Error(handleAPIError(error));
    }
  }

  // API Usage Statistics
  async getAPIUsageStats(options: {
    service?: string;
    startDate?: Date;
    endDate?: Date;
    granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  } = {}): Promise<APIUsageStats[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/api-usage-stats?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get API usage stats: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.usage;
    } catch (error) {
      console.error('Failed to get API usage stats:', error);
      throw new Error(handleAPIError(error));
    }
  }

  // Webhook handling (for frontend notification)
  async handleLMSWebhook(webhookData: any): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/integrations/lms/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Webhook processing failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Show success notification
      toast({
        title: "LMS Webhook Processed",
        description: `Loan ${webhookData.loan_id} has been processed successfully.`,
      });

      return data.data;
    } catch (error) {
      console.error('Webhook processing failed:', error);
      toast({
        title: "Webhook Processing Failed",
        description: handleAPIError(error),
        variant: "destructive"
      });
      throw new Error(handleAPIError(error));
    }
  }
}

export const integrationService = IntegrationService.getInstance();