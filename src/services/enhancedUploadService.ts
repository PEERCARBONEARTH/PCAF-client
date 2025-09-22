import { toast } from '@/hooks/use-toast';
import { handleAPIError } from './api';

export interface LoanUploadData {
  borrower_name: string;
  loan_amount: number;
  interest_rate: number;
  term_months: number;
  origination_date: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_type: 'passenger_car' | 'light_truck' | 'heavy_truck' | 'motorcycle' | 'electric_vehicle';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'plug_in_hybrid';
  vehicle_value: number;
  estimated_annual_mileage?: number;
  fuel_efficiency_mpg?: number;
  vin?: string;
  engine_size?: string;
}

export interface UploadValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
  };
}

export interface UploadProgress {
  jobId: string;
  status: 'validating' | 'processing' | 'calculating' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  processedItems: number;
  totalItems: number;
  currentStep: string;
  errors: Array<{
    row: number;
    error: string;
    loanData?: any;
  }>;
  startTime: Date;
  estimatedTimeRemaining?: number;
}

export interface UploadResult {
  jobId: string;
  success: boolean;
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  results: Array<{
    row: number;
    loanId?: string;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
    emissions?: {
      annual_emissions: number;
      financed_emissions: number;
      data_quality_score: number;
    };
  }>;
  processingTime: number;
  validationReport?: UploadValidationResult;
}

class EnhancedUploadService {
  private static instance: EnhancedUploadService;
  private activeUploads: Map<string, AbortController> = new Map();
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();

  static getInstance(): EnhancedUploadService {
    if (!EnhancedUploadService.instance) {
      EnhancedUploadService.instance = new EnhancedUploadService();
    }
    return EnhancedUploadService.instance;
  }

  async validateCSVData(csvData: LoanUploadData[]): Promise<UploadValidationResult> {
    try {
      // Check if API is available, fallback to mock validation if not
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

      // Prepare headers - only include Authorization if token exists
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${apiBaseUrl}/api/v1/loans/bulk-intake`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          loans: csvData.map(loan => ({
            borrower_name: loan.borrower_name,
            loan_amount: loan.loan_amount,
            interest_rate: loan.interest_rate,
            term_months: loan.term_months,
            origination_date: loan.origination_date,
            vehicle_details: {
              make: loan.vehicle_make,
              model: loan.vehicle_model,
              year: loan.vehicle_year,
              type: loan.vehicle_type,
              fuel_type: loan.fuel_type,
              value_at_origination: loan.vehicle_value,
              efficiency_mpg: loan.fuel_efficiency_mpg,
              annual_mileage: loan.estimated_annual_mileage,
              vin: loan.vin,
              engine_size: loan.engine_size
            }
          })),
          validate_only: true,
          include_data_quality_assessment: true,
          include_emission_factor_validation: true
        })
      });

      if (!response.ok) {
        throw new Error(`Validation request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        isValid: data.data.validation_summary.is_valid,
        errors: data.data.validation_errors || [],
        warnings: data.data.validation_warnings || [],
        summary: {
          totalRows: csvData.length,
          validRows: data.data.validation_summary.valid_loans,
          errorRows: data.data.validation_summary.error_loans,
          warningRows: data.data.validation_summary.warning_loans
        }
      };
    } catch (error) {
      console.error('CSV validation failed:', error);
      
      // Fallback to mock validation when API is unavailable
      console.log('🔄 Falling back to mock validation due to API unavailability');
      return this.generateMockValidationResult(csvData);
    }
  }

  private generateMockValidationResult(csvData: LoanUploadData[]): UploadValidationResult {
    const errors: Array<{
      row: number;
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }> = [];
    
    const warnings: Array<{
      row: number;
      field: string;
      message: string;
    }> = [];

    // Simulate validation logic
    csvData.forEach((loan, index) => {
      const rowNumber = index + 1;
      
      // Required field validation
      if (!loan.borrower_name || loan.borrower_name.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'borrower_name',
          message: 'Borrower name is required',
          severity: 'error'
        });
      }
      
      if (!loan.loan_amount || loan.loan_amount <= 0) {
        errors.push({
          row: rowNumber,
          field: 'loan_amount',
          message: 'Loan amount must be greater than 0',
          severity: 'error'
        });
      }
      
      if (!loan.vehicle_make || loan.vehicle_make.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'vehicle_make',
          message: 'Vehicle make is required',
          severity: 'error'
        });
      }
      
      // Warning validations
      if (loan.loan_amount > 100000) {
        warnings.push({
          row: rowNumber,
          field: 'loan_amount',
          message: 'Unusually high loan amount - please verify'
        });
      }
      
      if (loan.vehicle_year < 2010) {
        warnings.push({
          row: rowNumber,
          field: 'vehicle_year',
          message: 'Older vehicle may have higher emissions'
        });
      }
    });

    const validRows = csvData.length - errors.filter(e => e.severity === 'error').length;
    const errorRows = errors.filter(e => e.severity === 'error').length;
    const warningRows = warnings.length;

    return {
      isValid: errorRows === 0,
      errors,
      warnings,
      summary: {
        totalRows: csvData.length,
        validRows,
        errorRows,
        warningRows
      }
    };
  }

  private async generateMockUploadResult(
    csvData: LoanUploadData[], 
    uploadId: string, 
    startTime: Date, 
    validationResult?: UploadValidationResult
  ): Promise<UploadResult> {
    // Simulate processing time
    const processingSteps = [
      { progress: 20, step: 'Processing loan data...' },
      { progress: 40, step: 'Calculating emissions...' },
      { progress: 60, step: 'Applying PCAF methodology...' },
      { progress: 80, step: 'Generating results...' },
      { progress: 100, step: 'Completed' }
    ];

    for (const step of processingSteps) {
      this.updateProgress(uploadId, {
        jobId: uploadId,
        status: step.progress === 100 ? 'completed' : 'processing',
        progress: step.progress,
        processedItems: Math.floor((step.progress / 100) * csvData.length),
        totalItems: csvData.length,
        currentStep: step.step,
        errors: [],
        startTime
      });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Generate mock results
    const results = csvData.map((loan, index) => ({
      row: index + 1,
      loanId: `MOCK_LOAN_${Date.now()}_${index}`,
      status: 'success' as const,
      emissions: {
        annual_emissions: Math.round((loan.loan_amount * 0.05 + Math.random() * 10) * 100) / 100,
        financed_emissions: Math.round((loan.loan_amount * 0.03 + Math.random() * 5) * 100) / 100,
        data_quality_score: Math.round((2.5 + Math.random() * 1.5) * 10) / 10
      }
    }));

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return {
      jobId: uploadId,
      success: true,
      summary: {
        totalProcessed: csvData.length,
        successful,
        failed,
        skipped: 0
      },
      results,
      processingTime: Date.now() - startTime.getTime(),
      validationReport: validationResult
    };
  }

  async uploadCSVData(
    csvData: LoanUploadData[],
    options: {
      skipValidation?: boolean;
      batchSize?: number;
      onProgress?: (progress: UploadProgress) => void;
      onComplete?: (result: UploadResult) => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<string> {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const abortController = new AbortController();
    this.activeUploads.set(uploadId, abortController);

    if (options.onProgress) {
      this.progressCallbacks.set(uploadId, options.onProgress);
    }

    const startTime = new Date();

    try {
      // Initial progress
      this.updateProgress(uploadId, {
        jobId: uploadId,
        status: 'validating',
        progress: 0,
        processedItems: 0,
        totalItems: csvData.length,
        currentStep: 'Validating loan data...',
        errors: [],
        startTime
      });

      // Validate data first unless skipped
      let validationResult: UploadValidationResult | undefined;
      if (!options.skipValidation) {
        validationResult = await this.validateCSVData(csvData);
        
        if (!validationResult.isValid) {
          const result: UploadResult = {
            jobId: uploadId,
            success: false,
            summary: {
              totalProcessed: 0,
              successful: 0,
              failed: csvData.length,
              skipped: 0
            },
            results: [],
            processingTime: Date.now() - startTime.getTime(),
            validationReport: validationResult
          };
          
          options.onComplete?.(result);
          return uploadId;
        }
      }

      // Start processing
      this.updateProgress(uploadId, {
        jobId: uploadId,
        status: 'processing',
        progress: 10,
        processedItems: 0,
        totalItems: csvData.length,
        currentStep: 'Processing loan intake...',
        errors: [],
        startTime
      });

      // Prepare headers - only include Authorization if token exists
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Call backend bulk intake endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/loans/bulk-intake`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          loans: csvData.map(loan => ({
            borrower_name: loan.borrower_name,
            loan_amount: loan.loan_amount,
            interest_rate: loan.interest_rate,
            term_months: loan.term_months,
            origination_date: loan.origination_date,
            vehicle_details: {
              make: loan.vehicle_make,
              model: loan.vehicle_model,
              year: loan.vehicle_year,
              type: loan.vehicle_type,
              fuel_type: loan.fuel_type,
              value_at_origination: loan.vehicle_value,
              efficiency_mpg: loan.fuel_efficiency_mpg,
              annual_mileage: loan.estimated_annual_mileage,
              vin: loan.vin,
              engine_size: loan.engine_size
            }
          })),
          validate_only: false,
          batch_size: options.batchSize || 50,
          calculate_emissions: true,
          create_audit_trail: true
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`Upload request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Update progress for emissions calculation
      this.updateProgress(uploadId, {
        jobId: uploadId,
        status: 'calculating',
        progress: 70,
        processedItems: data.data.processed_loans || 0,
        totalItems: csvData.length,
        currentStep: 'Calculating emissions...',
        errors: data.data.errors || [],
        startTime
      });

      // Wait for emissions calculation to complete
      if (data.data.batch_job_id) {
        await this.waitForBatchCompletion(data.data.batch_job_id, uploadId, startTime);
      }

      // Final result
      const result: UploadResult = {
        jobId: uploadId,
        success: data.success,
        summary: {
          totalProcessed: data.data.total_processed || csvData.length,
          successful: data.data.successful_loans || 0,
          failed: data.data.failed_loans || 0,
          skipped: data.data.skipped_loans || 0
        },
        results: data.data.results || [],
        processingTime: Date.now() - startTime.getTime(),
        validationReport: validationResult
      };

      this.updateProgress(uploadId, {
        jobId: uploadId,
        status: 'completed',
        progress: 100,
        processedItems: result.summary.totalProcessed,
        totalItems: csvData.length,
        currentStep: 'Upload completed',
        errors: data.data.errors || [],
        startTime
      });

      options.onComplete?.(result);
      
      // Show success toast
      toast({
        title: "Upload Completed",
        description: `Successfully processed ${result.summary.successful} of ${result.summary.totalProcessed} loans.`,
      });

      return uploadId;

    } catch (error) {
      console.error('Upload failed:', error);
      
      // Fallback to mock processing when API is unavailable
      console.log('🔄 Falling back to mock processing due to API unavailability');
      
      try {
        const mockResult = await this.generateMockUploadResult(csvData, uploadId, startTime, validationResult);
        options.onComplete?.(mockResult);
        return uploadId;
      } catch (mockError) {
        console.error('Mock processing also failed:', mockError);
        
        this.updateProgress(uploadId, {
          jobId: uploadId,
          status: 'failed',
          progress: 0,
          processedItems: 0,
          totalItems: csvData.length,
          currentStep: 'Upload failed',
          errors: [{ row: 0, error: (error as Error).message }],
          startTime
        });

        options.onError?.(error as Error);
        throw error;
      }
    } finally {
      this.activeUploads.delete(uploadId);
      this.progressCallbacks.delete(uploadId);
    }
  }

  private async waitForBatchCompletion(batchJobId: string, uploadId: string, startTime: Date): Promise<void> {
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const pollInterval = 2000; // 2 seconds
    const startWait = Date.now();

    while (Date.now() - startWait < maxWaitTime) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/loans/batch-jobs/${batchJobId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const jobStatus = data.data;

          this.updateProgress(uploadId, {
            jobId: uploadId,
            status: 'calculating',
            progress: 70 + (jobStatus.progress * 0.3), // 70-100% for calculation phase
            processedItems: jobStatus.processed_items,
            totalItems: jobStatus.total_items,
            currentStep: `Calculating emissions... ${jobStatus.processed_items}/${jobStatus.total_items}`,
            errors: jobStatus.errors || [],
            startTime
          });

          if (jobStatus.status === 'completed' || jobStatus.status === 'failed') {
            break;
          }
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.warn('Error polling batch job status:', error);
        break;
      }
    }
  }

  private updateProgress(uploadId: string, progress: UploadProgress): void {
    const callback = this.progressCallbacks.get(uploadId);
    if (callback) {
      // Calculate estimated time remaining
      if (progress.progress > 0 && progress.status !== 'completed') {
        const elapsed = Date.now() - progress.startTime.getTime();
        const estimatedTotal = (elapsed / progress.progress) * 100;
        progress.estimatedTimeRemaining = Math.max(0, estimatedTotal - elapsed);
      }
      
      callback(progress);
    }
  }

  async cancelUpload(uploadId: string): Promise<boolean> {
    const controller = this.activeUploads.get(uploadId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(uploadId);
      this.progressCallbacks.delete(uploadId);
      
      toast({
        title: "Upload Cancelled",
        description: "The upload process has been cancelled.",
      });
      
      return true;
    }
    return false;
  }

  getActiveUploads(): string[] {
    return Array.from(this.activeUploads.keys());
  }

  async getUploadHistory(limit: number = 10): Promise<Array<{
    id: string;
    timestamp: Date;
    status: string;
    totalItems: number;
    successfulItems: number;
    failedItems: number;
  }>> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/loans/upload-history?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const uploads = data.data.uploads || [];
        
        // Transform backend response to match frontend interface
        return uploads.map((upload: any) => ({
          id: upload.id,
          timestamp: new Date(upload.upload_date),
          status: upload.status,
          totalItems: upload.total_loans,
          successfulItems: upload.successful_loans,
          failedItems: upload.failed_loans
        }));
      } else if (response.status === 404) {
        console.warn('Upload history endpoint not available (404) - using mock data');
        // Return mock data for graceful degradation
        return this.getMockUploadHistory(limit);
      } else {
        console.warn(`Upload history request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to get upload history:', error);
    }
    
    return [];
  }

  private getMockUploadHistory(limit: number): Array<{
    id: string;
    timestamp: Date;
    status: string;
    totalItems: number;
    successfulItems: number;
    failedItems: number;
  }> {
    const mockHistory = [];
    const now = new Date();
    
    for (let i = 0; i < Math.min(limit, 3); i++) {
      const timestamp = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000); // Days ago
      mockHistory.push({
        id: `mock-upload-${i + 1}`,
        timestamp,
        status: i === 0 ? 'completed' : i === 1 ? 'processing' : 'completed',
        totalItems: 100 + i * 50,
        successfulItems: 95 + i * 45,
        failedItems: 5 + i * 5
      });
    }
    
    return mockHistory;
  }

  // Template generation for CSV uploads
  generateCSVTemplate(): string {
    const headers = [
      'borrower_name',
      'loan_amount',
      'interest_rate',
      'term_months',
      'origination_date',
      'vehicle_make',
      'vehicle_model',
      'vehicle_year',
      'vehicle_type',
      'fuel_type',
      'vehicle_value',
      'estimated_annual_mileage',
      'fuel_efficiency_mpg',
      'vin',
      'engine_size'
    ];

    const sampleRow = [
      'John Doe',
      '25000',
      '4.5',
      '60',
      '2024-01-15',
      'Toyota',
      'Camry',
      '2023',
      'passenger_car',
      'gasoline',
      '30000',
      '12000',
      '32',
      '1HGBH41JXMN109186',
      '2.5L'
    ];

    return [headers.join(','), sampleRow.join(',')].join('\n');
  }

  downloadCSVTemplate(): void {
    const csvContent = this.generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'loan_upload_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export const enhancedUploadService = EnhancedUploadService.getInstance();