/**
 * Enhanced PCAF API Client
 * Integrates with the new comprehensive PCAF backend system
 */

import { toast } from "@/hooks/use-toast";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = 'v1';

// Enhanced Types for the new backend
export interface CreateInstrumentRequest {
  id?: string;
  borrowerName: string;
  instrumentType: 'LOAN' | 'LC' | 'GUARANTEE';
  instrumentAmount: number;
  instrumentCurrency?: string;
  vehicleValue: number;
  vehicleCurrency?: string;
  underlyingTransactionValue?: number;
  underlyingTransactionCurrency?: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    type: string;
    fuelType: string;
  };
  emissionsData: {
    dataQualityScore: number;
    annualEmissions: number;
    emissionsUnit?: string;
  };
  lcDetails?: {
    lcType: 'DEALER_FLOOR_PLAN' | 'IMPORT_VEHICLE' | 'FLEET_PURCHASE';
    beneficiary: string;
    expiryDate: string;
    lcNumber?: string;
    issuingBank?: string;
  };
  guaranteeDetails?: {
    guaranteeType: 'PERFORMANCE' | 'PAYMENT' | 'RESIDUAL_VALUE';
    probabilityOfActivation: number;
    guaranteeNumber?: string;
    coveredObligations?: string;
    triggerEvents?: string[];
  };
  createdBy?: string;
  correlationId?: string;
}

export interface InstrumentResponse {
  id: string;
  borrowerName: string;
  instrumentType: 'LOAN' | 'LC' | 'GUARANTEE';
  instrumentAmount: number;
  instrumentCurrency: string;
  vehicleValue: number;
  vehicleCurrency: string;
  underlyingTransactionValue?: number;
  underlyingTransactionCurrency?: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    type: string;
    fuelType: string;
  };
  emissionsData: {
    dataQualityScore: number;
    annualEmissions: number;
    emissionsUnit: string;
  };
  lcDetails?: {
    lcType: string;
    beneficiary: string;
    expiryDate: string;
    lcNumber?: string;
    issuingBank?: string;
  };
  guaranteeDetails?: {
    guaranteeType: string;
    probabilityOfActivation: number;
    guaranteeNumber?: string;
    coveredObligations?: string;
    triggerEvents?: string[];
  };
  pcafCalculation: {
    attributionFactor: number;
    financedEmissions: number;
    financedEmissionsUnit: string;
    calculationMethod: string;
    calculationTimestamp: string;
    metadata: {
      instrumentType: string;
      vehicleType: string;
      fuelType: string;
      calculationVersion: string;
    };
  };
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PortfolioAnalytics {
  totalInstruments: number;
  totalAmount: number;
  totalEmissions: number;
  averageDataQuality: number;
  weightedDataQualityScore: number;
  complianceStatus: 'compliant' | 'needs_improvement' | 'non_compliant';
  breakdown: {
    byType: Record<string, { count: number; amount: number; emissions: number }>;
    byDataQuality: Record<number, { count: number; amount: number; emissions: number }>;
    byMonth: Record<string, { count: number; amount: number; emissions: number }>;
  };
  generatedAt: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
  correlationId?: string;
  requestId?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    performance?: {
      duration: number;
      cacheHit: boolean;
    };
    version?: string;
  };
}

export interface APIError {
  success: false;
  error: {
    message: string;
    type: string;
    statusCode: number;
    details?: any;
    correlationId?: string;
  };
  timestamp: string;
  path: string;
}

export interface BulkOperationResponse {
  successCount: number;
  failureCount: number;
  totalCount: number;
  successfulIds: string[];
  failures: Array<{
    index: number;
    error: string;
    data?: any;
  }>;
  correlationId: string;
  completedAt: string;
}

export interface InstrumentFilters {
  instrumentType?: 'LOAN' | 'LC' | 'GUARANTEE';
  borrowerName?: string;
  dataQualityScore?: number;
  minEmissions?: number;
  maxEmissions?: number;
  minAmount?: number;
  maxAmount?: number;
  vehicleType?: string;
  fuelType?: string;
  vehicleMake?: string;
  vehicleYear?: number;
  status?: string;
  createdBy?: string;
  createdFrom?: string;
  createdTo?: string;
  expiryFrom?: string;
  expiryTo?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UserProfile {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

// Enhanced API Client
class PCAFApiClient {
  private baseURL: string;
  private authToken: string | null = null;
  private userProfile: UserProfile | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.initializeAuth();
  }

  private initializeAuth() {
    const token = localStorage.getItem('pcaf_auth_token');
    const profile = localStorage.getItem('pcaf_user_profile');
    
    if (token) {
      this.authToken = token;
    }
    
    if (profile) {
      try {
        this.userProfile = JSON.parse(profile);
      } catch (error) {
        console.warn('Failed to parse user profile from localStorage');
      }
    }
  }

  setAuthToken(token: string, userProfile?: UserProfile) {
    this.authToken = token;
    this.userProfile = userProfile || null;
    
    localStorage.setItem('pcaf_auth_token', token);
    if (userProfile) {
      localStorage.setItem('pcaf_user_profile', JSON.stringify(userProfile));
    }
  }

  clearAuth() {
    this.authToken = null;
    this.userProfile = null;
    localStorage.removeItem('pcaf_auth_token');
    localStorage.removeItem('pcaf_user_profile');
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  hasRole(role: string): boolean {
    return this.userProfile?.roles.includes(role) || false;
  }

  hasPermission(permission: string): boolean {
    return this.userProfile?.permissions.includes(permission) || false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}/api/${API_VERSION}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError: APIError = data;
        throw new Error(JSON.stringify(apiError));
      }

      return data;
    } catch (error) {
      if (error.message.startsWith('{')) {
        // API error
        throw error;
      }
      
      // Network or other errors
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const response = await this.request<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setAuthToken(response.data.token, response.data.user);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearAuth();
    }
  }

  // Instrument Management APIs
  async createInstrument(instrumentData: CreateInstrumentRequest): Promise<InstrumentResponse> {
    const response = await this.request<InstrumentResponse>('/instruments', {
      method: 'POST',
      body: JSON.stringify(instrumentData),
    });
    return response.data;
  }

  async createLoan(loanData: Omit<CreateInstrumentRequest, 'instrumentType'>): Promise<InstrumentResponse> {
    const response = await this.request<InstrumentResponse>('/instruments/loans', {
      method: 'POST',
      body: JSON.stringify({ ...loanData, instrumentType: 'LOAN' }),
    });
    return response.data;
  }

  async createLC(lcData: Omit<CreateInstrumentRequest, 'instrumentType'>): Promise<InstrumentResponse> {
    const response = await this.request<InstrumentResponse>('/instruments/letters-of-credit', {
      method: 'POST',
      body: JSON.stringify({ ...lcData, instrumentType: 'LC' }),
    });
    return response.data;
  }

  async createGuarantee(guaranteeData: Omit<CreateInstrumentRequest, 'instrumentType'>): Promise<InstrumentResponse> {
    const response = await this.request<InstrumentResponse>('/instruments/guarantees', {
      method: 'POST',
      body: JSON.stringify({ ...guaranteeData, instrumentType: 'GUARANTEE' }),
    });
    return response.data;
  }

  async bulkCreateInstruments(instruments: CreateInstrumentRequest[]): Promise<BulkOperationResponse> {
    const response = await this.request<BulkOperationResponse>('/instruments/bulk', {
      method: 'POST',
      body: JSON.stringify({ instruments }),
    });
    return response.data;
  }

  async getInstruments(
    filters?: InstrumentFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<InstrumentResponse>> {
    const params = new URLSearchParams();
    
    // Add pagination params
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    // Add filter params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/instruments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<PaginatedResponse<InstrumentResponse>>(endpoint);
    return response.data;
  }

  async getInstrumentById(id: string, includePCAF = true): Promise<InstrumentResponse> {
    const params = new URLSearchParams();
    if (!includePCAF) params.append('includePCAF', 'false');
    
    const endpoint = `/instruments/${id}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<InstrumentResponse>(endpoint);
    return response.data;
  }

  async searchInstruments(
    query: string,
    options?: {
      searchBorrowers?: boolean;
      searchVehicles?: boolean;
      minRelevance?: number;
    },
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<InstrumentResponse>> {
    const params = new URLSearchParams();
    params.append('query', query);
    
    if (options?.searchBorrowers !== undefined) {
      params.append('searchBorrowers', options.searchBorrowers.toString());
    }
    if (options?.searchVehicles !== undefined) {
      params.append('searchVehicles', options.searchVehicles.toString());
    }
    if (options?.minRelevance !== undefined) {
      params.append('minRelevance', options.minRelevance.toString());
    }
    
    // Add pagination params
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);

    const response = await this.request<PaginatedResponse<InstrumentResponse>>(`/instruments/search?${params.toString()}`);
    return response.data;
  }

  async deleteInstrument(id: string, reason?: string): Promise<void> {
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);
    
    await this.request(`/instruments/${id}${params.toString() ? `?${params.toString()}` : ''}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteInstruments(ids: string[], reason?: string): Promise<BulkOperationResponse> {
    const params = new URLSearchParams();
    if (reason) params.append('reason', reason);
    
    const response = await this.request<BulkOperationResponse>(`/instruments/bulk${params.toString() ? `?${params.toString()}` : ''}`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    return response.data;
  }

  // Analytics APIs
  async getPortfolioAnalytics(filters?: InstrumentFilters): Promise<PortfolioAnalytics> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/instruments/analytics/portfolio${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<PortfolioAnalytics>(endpoint);
    return response.data;
  }

  // Alert APIs
  async getExpiringInstruments(daysFromNow = 30): Promise<InstrumentResponse[]> {
    const response = await this.request<InstrumentResponse[]>(`/instruments/alerts/expiring?daysFromNow=${daysFromNow}`);
    return response.data;
  }

  async getHighEmissionInstruments(threshold = 10.0, limit = 100): Promise<InstrumentResponse[]> {
    const response = await this.request<InstrumentResponse[]>(`/instruments/alerts/high-emissions?threshold=${threshold}&limit=${limit}`);
    return response.data;
  }

  async getPoorDataQualityInstruments(maxScore = 4, limit = 100): Promise<InstrumentResponse[]> {
    const response = await this.request<InstrumentResponse[]>(`/instruments/alerts/poor-data-quality?maxScore=${maxScore}&limit=${limit}`);
    return response.data;
  }

  async getInstrumentsRequiringAttention(): Promise<{
    expiringSoon: InstrumentResponse[];
    highEmissions: InstrumentResponse[];
    poorDataQuality: InstrumentResponse[];
  }> {
    const response = await this.request<{
      expiringSoon: InstrumentResponse[];
      highEmissions: InstrumentResponse[];
      poorDataQuality: InstrumentResponse[];
    }>('/instruments/alerts/attention-required');
    return response.data;
  }

  // Health and System APIs
  async getHealth(): Promise<any> {
    const response = await this.request('/health');
    return response.data;
  }

  async getVersion(): Promise<any> {
    const response = await this.request('/health/version');
    return response.data;
  }
}

// Create and export API client instance
export const pcafApiClient = new PCAFApiClient(API_BASE_URL);

// Utility functions for error handling
export function handlePCAFAPIError(error: unknown): string {
  if (error instanceof Error) {
    try {
      const apiError = JSON.parse(error.message) as APIError;
      return apiError.error.message;
    } catch {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
}

export function showPCAFAPIErrorToast(error: unknown) {
  const message = handlePCAFAPIError(error);
  toast({
    title: "API Error",
    description: message,
    variant: "destructive"
  });
}

// Role-based access control helpers
export const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst', 
  MANAGER: 'manager',
  ADMIN: 'admin'
} as const;

export const PERMISSIONS = {
  INSTRUMENTS_READ: 'instruments:read',
  INSTRUMENTS_CREATE: 'instruments:create',
  INSTRUMENTS_UPDATE: 'instruments:update',
  INSTRUMENTS_DELETE: 'instruments:delete',
  INSTRUMENTS_BULK: 'instruments:bulk',
  ANALYTICS_FULL: 'analytics:full',
  PORTFOLIO_MANAGE: 'portfolio:manage',
  REPORTS_GENERATE: 'reports:generate',
  NOTIFICATIONS_MANAGE: 'notifications:manage',
  USERS_MANAGE: 'users:manage',
  SYSTEM_ADMIN: 'system:admin'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];