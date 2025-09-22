import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { enhancedUploadService, type UploadProgress, type UploadValidationResult } from '@/services/enhancedUploadService';
import { errorHandlingService } from '@/services/errorHandlingService';
import { useFileUploadProgress } from '@/hooks/useFileUploadProgress';

interface FileValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
  value?: string;
}

interface FileUploadState {
  file: File | null;
  isDragOver: boolean;
  isValidating: boolean;
  isUploading: boolean;
  validationResult: UploadValidationResult | null;
  uploadProgress: UploadProgress | null;
  errors: FileValidationError[];
  previewData: any[] | null;
}

interface EnhancedFileUploadProps {
  onFileProcessed: (data: {
    file: File;
    validationResult: UploadValidationResult;
    uploadId?: string;
  }) => void;
  onError: (error: Error) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  showPreview?: boolean;
  className?: string;
}

export function EnhancedFileUpload({
  onFileProcessed,
  onError,
  acceptedFileTypes = ['.csv'],
  maxFileSize = 10,
  showPreview = true,
  className = '',
}: EnhancedFileUploadProps) {
  // Using toast from sonner import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { progress, startProgress, updateProgress, completeProgress, failProgress, resetProgress } = useFileUploadProgress();
  
  const [state, setState] = useState<FileUploadState>({
    file: null,
    isDragOver: false,
    isValidating: false,
    isUploading: false,
    validationResult: null,
    uploadProgress: null,
    errors: [],
    previewData: null,
  });

  // File validation
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`,
      };
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return {
        isValid: false,
        error: `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size (${maxFileSize}MB)`,
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty',
      };
    }

    return { isValid: true };
  }, [acceptedFileTypes, maxFileSize]);

  // Parse CSV content for preview and validation
  const parseCSVContent = useCallback(async (file: File): Promise<{
    headers: string[];
    rows: any[];
    errors: FileValidationError[];
  }> => {
    const content = await file.text();
    const lines = content.trim().split('\n');
    const errors: FileValidationError[] = [];

    if (lines.length < 2) {
      errors.push({
        row: 0,
        field: 'file',
        message: 'CSV file must contain at least a header row and one data row',
        severity: 'error',
      });
      return { headers: [], rows: [], errors };
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    // Validate required headers
    const requiredHeaders = [
      'borrower_name', 'loan_amount', 'interest_rate', 'term_months',
      'origination_date', 'vehicle_make', 'vehicle_model', 'vehicle_year',
      'vehicle_type', 'fuel_type', 'vehicle_value'
    ];

    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      errors.push({
        row: 1,
        field: 'headers',
        message: `Missing required columns: ${missingHeaders.join(', ')}`,
        severity: 'error',
      });
    }

    // Parse data rows
    const rows = [];
    for (let i = 1; i < Math.min(lines.length, 101); i++) { // Limit preview to 100 rows
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Basic validation for preview
      if (row.loan_amount && isNaN(parseFloat(row.loan_amount))) {
        errors.push({
          row: i + 1,
          field: 'loan_amount',
          message: 'Must be a valid number',
          severity: 'error',
          value: row.loan_amount,
        });
      }

      if (row.interest_rate && (isNaN(parseFloat(row.interest_rate)) || parseFloat(row.interest_rate) < 0)) {
        errors.push({
          row: i + 1,
          field: 'interest_rate',
          message: 'Must be a positive number',
          severity: 'error',
          value: row.interest_rate,
        });
      }

      rows.push(row);
    }

    return { headers, rows, errors };
  }, []);

  // Handle file processing
  const processFile = useCallback(async (file: File) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setState(prev => ({ ...prev, isValidating: true, errors: [] }));
    startProgress(uploadId, 100); // Start with 100 as total for percentage-based progress

    try {
      // Step 1: Parse CSV content (0-30%)
      updateProgress({
        status: 'validating',
        progress: 10,
        currentStep: 'Parsing CSV file...',
      });

      const { headers, rows, errors: parseErrors } = await parseCSVContent(file);
      
      updateProgress({
        progress: 30,
        currentStep: 'Validating file structure...',
      });

      setState(prev => ({
        ...prev,
        file,
        errors: parseErrors,
        previewData: showPreview ? rows.slice(0, 5) : null, // Show first 5 rows for preview
      }));

      if (parseErrors.some(e => e.severity === 'error')) {
        failProgress(`Found ${parseErrors.filter(e => e.severity === 'error').length} critical errors`);
        
        toast.error(`File Validation Failed: Found ${parseErrors.filter(e => e.severity === 'error').length} critical errors`);
        setState(prev => ({ ...prev, isValidating: false }));
        return;
      }

      // Step 2: Convert to upload format (30-50%)
      updateProgress({
        progress: 40,
        currentStep: 'Converting data format...',
      });

      const uploadData = rows.map(row => ({
        borrower_name: row.borrower_name,
        loan_amount: parseFloat(row.loan_amount) || 0,
        interest_rate: parseFloat(row.interest_rate) || 0,
        term_months: parseInt(row.term_months) || 0,
        origination_date: row.origination_date,
        vehicle_make: row.vehicle_make,
        vehicle_model: row.vehicle_model,
        vehicle_year: parseInt(row.vehicle_year) || 0,
        vehicle_type: row.vehicle_type,
        fuel_type: row.fuel_type,
        vehicle_value: parseFloat(row.vehicle_value) || 0,
        estimated_annual_mileage: row.estimated_annual_mileage ? parseInt(row.estimated_annual_mileage) : undefined,
        fuel_efficiency_mpg: row.fuel_efficiency_mpg ? parseFloat(row.fuel_efficiency_mpg) : undefined,
        vin: row.vin || undefined,
        engine_size: row.engine_size || undefined,
      }));

      updateProgress({
        progress: 50,
        currentStep: 'Preparing validation request...',
      });

      // Step 3: Validate with backend (50-100%)
      updateProgress({
        progress: 60,
        currentStep: 'Validating data with backend...',
      });

      const validationResult = await enhancedUploadService.validateCSVData(uploadData);
      
      updateProgress({
        progress: 90,
        currentStep: 'Processing validation results...',
      });

      setState(prev => ({
        ...prev,
        validationResult,
        isValidating: false,
      }));

      if (validationResult.isValid) {
        completeProgress();
        
        toast.success(`File Validation Successful: ${validationResult.summary.validRows} valid rows ready for processing`);
        
        onFileProcessed({
          file,
          validationResult,
          uploadId,
        });
      } else {
        updateProgress({
          status: 'completed',
          progress: 100,
          currentStep: 'Validation completed with issues',
        });

        toast.warning(`Validation Issues Found: ${validationResult.errors.length} errors need to be resolved`);
      }

    } catch (error) {
      console.error('File processing failed:', error);
      const errorMessage = errorHandlingService.getErrorMessage(error as Error);
      
      failProgress(errorMessage);
      
      setState(prev => ({
        ...prev,
        isValidating: false,
        errors: [{
          row: 0,
          field: 'file',
          message: errorMessage,
          severity: 'error',
        }],
      }));

      toast.error(`File Processing Failed: ${errorMessage}`);

      onError(error as Error);
    }
  }, [parseCSVContent, showPreview, onFileProcessed, onError, toast, startProgress, updateProgress, completeProgress, failProgress]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      toast.error(`Invalid File: ${validation.error}`);
      return;
    }

    processFile(file);
  }, [validateFile, processFile, toast]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: false }));

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // File input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Clear file
  const clearFile = useCallback(() => {
    setState({
      file: null,
      isDragOver: false,
      isValidating: false,
      isUploading: false,
      validationResult: null,
      uploadProgress: null,
      errors: [],
      previewData: null,
    });
    
    resetProgress();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetProgress]);

  // Download template
  const downloadTemplate = useCallback(() => {
    enhancedUploadService.downloadCSVTemplate();
    toast.success('Template Downloaded: CSV template with sample data has been downloaded');
  }, [toast]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Template Download */}
      <Alert>
        <Download className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Step 1:</strong> Download the CSV template with required fields and sample data.
          </div>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </AlertDescription>
      </Alert>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
              ${state.isDragOver 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
              ${state.file ? 'border-green-500 bg-green-50' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes.join(',')}
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              {state.isValidating ? (
                <>
                  <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                  <div>
                    <h3 className="text-lg font-medium">Validating File...</h3>
                    <p className="text-muted-foreground">Please wait while we process your file</p>
                  </div>
                </>
              ) : state.file ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-medium text-green-800">{state.file.name}</h3>
                    <p className="text-muted-foreground">
                      {(state.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearFile}>
                    <X className="h-4 w-4 mr-2" />
                    Remove File
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">
                      {state.isDragOver ? 'Drop your file here' : 'Upload CSV File'}
                    </h3>
                    <p className="text-muted-foreground">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Accepted: {acceptedFileTypes.join(', ')} • Max size: {maxFileSize}MB
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      {progress && progress.status !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {progress.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : progress.status === 'failed' ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              )}
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.currentStep}</span>
                <span>{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
              {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    ~{Math.ceil(progress.estimatedTimeRemaining / 1000)}s remaining
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Badge 
                variant={
                  progress.status === 'completed' ? 'default' :
                  progress.status === 'failed' ? 'destructive' :
                  'secondary'
                }
              >
                {progress.status === 'validating' ? 'Validating' :
                 progress.status === 'uploading' ? 'Uploading' :
                 progress.status === 'processing' ? 'Processing' :
                 progress.status === 'completed' ? 'Completed' :
                 progress.status === 'failed' ? 'Failed' :
                 progress.status}
              </Badge>
              
              {progress.status === 'failed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (state.file) {
                      processFile(state.file);
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>

            {progress.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {progress.errors.length} error(s) occurred during processing
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {state.validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {state.validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{state.validationResult.summary.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{state.validationResult.summary.validRows}</div>
                <div className="text-sm text-muted-foreground">Valid</div>
              </div>
              <div className="text-center p-3 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{state.validationResult.summary.errorRows}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center p-3 bg-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{state.validationResult.summary.warningRows}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge 
                variant={state.validationResult.isValid ? "default" : "destructive"}
                className="text-sm px-4 py-2"
              >
                {state.validationResult.isValid ? 'Ready for Processing' : 'Validation Failed'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors and Warnings */}
      {(state.errors.length > 0 || (state.validationResult && (state.validationResult.errors.length > 0 || state.validationResult.warnings.length > 0))) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File parsing errors */}
            {state.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">File Processing Errors</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {state.errors.map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                      <strong>Row {error.row}, {error.field}:</strong> {error.message}
                      {error.value && <span className="text-muted-foreground"> (Value: "{error.value}")</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backend validation errors */}
            {state.validationResult?.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">
                  Validation Errors ({state.validationResult.errors.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {state.validationResult.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                      <strong>Row {error.row}, {error.field}:</strong> {error.message}
                    </div>
                  ))}
                  {state.validationResult.errors.length > 10 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      ... and {state.validationResult.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Backend validation warnings */}
            {state.validationResult?.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600">
                  Warnings ({state.validationResult.warnings.length})
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {state.validationResult.warnings.slice(0, 5).map((warning, index) => (
                    <div key={index} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <strong>Row {warning.row}, {warning.field}:</strong> {warning.message}
                    </div>
                  ))}
                  {state.validationResult.warnings.length > 5 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      ... and {state.validationResult.warnings.length - 5} more warnings
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {showPreview && state.previewData && state.previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Data Preview (First 5 Rows)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-muted">
                    {Object.keys(state.previewData[0]).slice(0, 8).map((header) => (
                      <th key={header} className="border border-gray-200 px-2 py-1 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      {Object.values(row).slice(0, 8).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-200 px-2 py-1">
                          {String(value).substring(0, 50)}
                          {String(value).length > 50 && '...'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Object.keys(state.previewData[0]).length > 8 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing first 8 columns. Full data will be processed.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}