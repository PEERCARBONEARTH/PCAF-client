import { toast } from "@/hooks/use-toast";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Types for API requests and responses
export interface LoanIntakeRequest {
  borrower_name: string;
  loan_amount: number;
  interest_rate: number;
  term_months: number;
  origination_date: string;
  vehicle_details: {
    make: string;
    model: string;
    year: number;
    type: 'passenger_car' | 'light_truck' | 'heavy_truck' | 'motorcycle' | 'electric_vehicle';
    fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'plug_in_hybrid';
    value_at_origination: number;
    efficiency_mpg?: number;
    annual_mileage?: number;
    vin?: string;
    engine_size?: number;
  };
}

export interface BulkLoanIntakeRequest {
  loans: LoanIntakeRequest[];
  validate_only?: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  metadata?: {
    requestId: string;
    [key: string]: any;
  };
}

export interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id: string;
    validation_errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface UploadProgress {
  jobId: string;
  progress: number;
  processedItems: number;
  totalItems: number;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  errors?: Array<{
    index: number;
    error: string;
    loanData?: any;
  }>;
}

// API Client class
class APIClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
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
        throw new APIError(data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new Error(`Network error: ${error.message}`);
    }
  }

  // Loan Management APIs
  async createLoan(loanData: LoanIntakeRequest): Promise<APIResponse> {
    return this.request('/loans/intake', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  }

  async bulkCreateLoans(bulkData: BulkLoanIntakeRequest): Promise<APIResponse> {
    return this.request('/loans/bulk-intake', {
      method: 'POST',
      body: JSON.stringify(bulkData),
    });
  }

  async getPortfolio(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    filter_by_vehicle_type?: string;
    filter_by_fuel_type?: string;
    min_loan_amount?: number;
    max_loan_amount?: number;
    origination_date_from?: string;
    origination_date_to?: string;
  }): Promise<APIResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/loans/portfolio${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getLoanById(loanId: string, options?: {
    include_amortization?: boolean;
    include_emissions_history?: boolean;
    include_audit_trail?: boolean;
  }): Promise<APIResponse> {
    const queryParams = new URLSearchParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/loans/${loanId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async updateLoan(loanId: string, updateData: Partial<LoanIntakeRequest> & { recalculate_emissions?: boolean }): Promise<APIResponse> {
    return this.request(`/loans/${loanId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteLoan(loanId: string, reason?: string): Promise<APIResponse> {
    return this.request(`/loans/${loanId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async processPayment(loanId: string, paymentData: {
    payment_amount: number;
    payment_date: string;
    payment_type: 'regular' | 'extra_principal' | 'payoff';
  }): Promise<APIResponse> {
    return this.request(`/loans/${loanId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getAmortizationSchedule(loanId: string, options?: {
    as_of_date?: string;
    include_future_payments?: boolean;
  }): Promise<APIResponse> {
    const queryParams = new URLSearchParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/loans/${loanId}/amortization${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Batch Processing APIs
  async batchCalculateEmissions(batchData: {
    loan_ids?: string[];
    reporting_date?: string;
    batch_size?: number;
    max_concurrency?: number;
    transaction_mode?: boolean;
  }): Promise<APIResponse> {
    return this.request('/loans/batch-calculate', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  async getBatchJobStatus(jobId: string): Promise<APIResponse<UploadProgress>> {
    return this.request(`/loans/batch-jobs/${jobId}`);
  }

  async cancelBatchJob(jobId: string): Promise<APIResponse> {
    return this.request(`/loans/batch-jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  }

  async batchDataQualityAssessment(batchData: {
    loan_ids?: string[];
    batch_size?: number;
  }): Promise<APIResponse> {
    return this.request('/loans/batch-data-quality', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  // PCAF Attribution Standards APIs
  async calculateAttribution(inputs: any): Promise<APIResponse> {
    return this.request('/api/v1/pcaf-attribution/calculate', {
      method: 'POST',
      body: JSON.stringify(inputs),
    });
  }

  async getAttributionPortfolioSummary(): Promise<APIResponse> {
    return this.request('/api/v1/pcaf-attribution/portfolio-summary');
  }

  async batchCalculateAttribution(inputs: any[]): Promise<APIResponse> {
    return this.request('/api/v1/pcaf-attribution/batch-calculate', {
      method: 'POST',
      body: JSON.stringify({ inputs }),
    });
  }

  async getAttributionComplianceReport(): Promise<APIResponse> {
    return this.request('/api/v1/pcaf-attribution/compliance-report');
  }

  // Avoided Emissions APIs
  async calculateAvoidedEmissions(inputs: any): Promise<APIResponse> {
    return this.request('/api/v1/avoided-emissions/calculate', {
      method: 'POST',
      body: JSON.stringify(inputs),
    });
  }

  async getAvoidedEmissionsPortfolioSummary(): Promise<APIResponse> {
    return this.request('/api/v1/avoided-emissions/portfolio-summary');
  }

  async getAvoidedEmissionsResults(): Promise<APIResponse> {
    return this.request('/api/v1/avoided-emissions/results');
  }

  async getAvoidedEmissionsPCAFCompliance(): Promise<APIResponse> {
    return this.request('/api/v1/avoided-emissions/pcaf-compliance');
  }

  async generateAvoidedEmissionsPCAFReport(): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/v1/avoided-emissions/pcaf-report`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate PCAF report');
    }
    
    return response.blob();
  }

  async exportAvoidedEmissionsToExcel(): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/v1/avoided-emissions/export-excel`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export to Excel');
    }
    
    return response.blob();
  }

  async generateAvoidedEmissionsPCAFDisclosure(): Promise<APIResponse> {
    return this.request('/api/v1/avoided-emissions/pcaf-disclosure', {
      method: 'POST',
    });
  }

  // PCAF Compliance APIs
  async getPCAFComplianceOverview(): Promise<APIResponse> {
    return this.request('/api/v1/pcaf-compliance/overview');
  }

  async generatePCAFComplianceReport(): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/v1/pcaf-compliance/report`, {
      method: 'POST',
      headers: {
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate compliance report');
    }
    
    return response.blob();
  }
}

// Create API client instance
export const apiClient = new APIClient(API_BASE_URL);

// Upload service with progress tracking
export class UploadService {
  private static instance: UploadService;
  private activeUploads: Map<string, AbortController> = new Map();

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  async uploadCSVData(
    csvData: LoanIntakeRequest[],
    options: {
      validateOnly?: boolean;
      onProgress?: (progress: UploadProgress) => void;
      onError?: (error: APIError) => void;
      onComplete?: (result: APIResponse) => void;
    } = {}
  ): Promise<string> {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const abortController = new AbortController();
    this.activeUploads.set(uploadId, abortController);

    try {
      // Show initial progress
      options.onProgress?.({
        jobId: uploadId,
        progress: 0,
        processedItems: 0,
        totalItems: csvData.length,
        status: 'processing'
      });

      // Validate data first if requested
      if (options.validateOnly) {
        const validationResult = await apiClient.bulkCreateLoans({
          loans: csvData,
          validate_only: true
        });

        options.onProgress?.({
          jobId: uploadId,
          progress: 100,
          processedItems: csvData.length,
          totalItems: csvData.length,
          status: 'completed'
        });

        options.onComplete?.(validationResult);
        return uploadId;
      }

      // Process in batches for better performance and progress tracking
      const batchSize = 50;
      const batches = [];
      for (let i = 0; i < csvData.length; i += batchSize) {
        batches.push(csvData.slice(i, i + batchSize));
      }

      let processedItems = 0;
      const results = [];
      const errors = [];

      for (let i = 0; i < batches.length; i++) {
        if (abortController.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        try {
          const batchResult = await apiClient.bulkCreateLoans({
            loans: batches[i],
            validate_only: false
          });

          results.push(batchResult);
          processedItems += batches[i].length;

          // Update progress
          const progress = Math.round((processedItems / csvData.length) * 100);
          options.onProgress?.({
            jobId: uploadId,
            progress,
            processedItems,
            totalItems: csvData.length,
            status: 'processing'
          });

        } catch (error) {
          errors.push({
            batchIndex: i,
            error: error.message,
            batchData: batches[i]
          });
        }
      }

      // Final result
      const finalResult = {
        success: errors.length === 0,
        data: {
          totalBatches: batches.length,
          successfulBatches: results.length,
          failedBatches: errors.length,
          totalProcessed: processedItems,
          results,
          errors: errors.length > 0 ? errors : undefined
        },
        metadata: {
          requestId: uploadId,
          processingTimestamp: new Date(),
          batchSize
        }
      };

      options.onProgress?.({
        jobId: uploadId,
        progress: 100,
        processedItems,
        totalItems: csvData.length,
        status: errors.length === 0 ? 'completed' : 'failed',
        errors: errors.length > 0 ? errors : undefined
      });

      options.onComplete?.(finalResult);
      return uploadId;

    } catch (error) {
      const apiError = error as APIError;
      options.onError?.(apiError);
      
      options.onProgress?.({
        jobId: uploadId,
        progress: 0,
        processedItems: 0,
        totalItems: csvData.length,
        status: 'failed'
      });

      throw error;
    } finally {
      this.activeUploads.delete(uploadId);
    }
  }

  cancelUpload(uploadId: string): boolean {
    const controller = this.activeUploads.get(uploadId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }

  getActiveUploads(): string[] {
    return Array.from(this.activeUploads.keys());
  }
}

// Export upload service instance
export const uploadService = UploadService.getInstance();

// Utility functions for error handling
export function handleAPIError(error: unknown): string {
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

export function showAPIErrorToast(error: unknown) {
  const message = handleAPIError(error);
  toast({
    title: "API Error",
    description: message,
    variant: "destructive"
  });
}

// Initialize auth token from localStorage or other auth provider
const initializeAuth = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    apiClient.setAuthToken(token);
  }
};

// Call initialization
initializeAuth();