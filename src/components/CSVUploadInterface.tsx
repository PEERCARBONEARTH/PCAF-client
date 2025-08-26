import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { uploadService, apiClient, handleAPIError, type LoanIntakeRequest, type UploadProgress } from "@/services/api";
import { platformRAGService } from "@/services/platform-rag-service";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Car,
  Database,
  Bot,
  Brain,
  Zap,
  Pause,
  Play
} from "lucide-react";

interface CSVRow {
  loan_id: string;
  borrower_name: string;
  loan_amount: string;
  interest_rate: string;
  term_months: string;
  origination_date: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_type: string;
  fuel_type: string;
  vehicle_value: string;
  efficiency_mpg?: string;
  annual_mileage?: string;
  vin?: string;
  engine_size?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface UploadResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  processedData: LoanIntakeRequest[];
}

export function CSVUploadInterface({ onValidationSummaryChange }: { onValidationSummaryChange?: (summary: { errors: number; rows: number }) => void }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [validationMode, setValidationMode] = useState(false);

// CSV Template definition
const csvTemplate: CSVRow = {
  loan_id: "MVL-2024-001",
  borrower_name: "John Doe",
  loan_amount: "50000",
  interest_rate: "5.5",
  term_months: "60",
  origination_date: "2024-01-15",
  vehicle_make: "Toyota",
  vehicle_model: "Camry",
  vehicle_year: "2024",
  vehicle_type: "passenger_car",
  fuel_type: "gasoline",
  vehicle_value: "45000",
  efficiency_mpg: "28",
  annual_mileage: "15000",
  vin: "1HGBH41JXMN109186",
  engine_size: "2000"
};

  const requiredFields = ['loan_id', 'borrower_name', 'loan_amount', 'interest_rate', 'term_months', 'origination_date', 'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_type', 'fuel_type', 'vehicle_value'];
  const vehicleTypes = ['passenger_car', 'light_truck', 'heavy_truck', 'motorcycle', 'electric_vehicle'];
  const fuelTypes = ['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid'];

  const downloadTemplate = () => {
const headers = Object.keys(csvTemplate);
const sampleRows = [
  Object.values(csvTemplate),
  ['MVL-2024-002', 'Jane Smith', '35000', '4.8', '48', '2024-02-01', 'Tesla', 'Model 3', '2024', 'electric_vehicle', 'electric', '32000', '120', '12000', '5YJ3E1EA4KF123456', '0'],
  ['MVL-2024-003', 'Bob Johnson', '25000', '6.2', '36', '2024-03-10', 'Honda', 'Civic', '2023', 'passenger_car', 'gasoline', '22000', '32', '8000', '2HGFC2F59NH123456', '1500']
];

    const csvContent = [headers, ...sampleRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'motor_vehicle_loans_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template with sample data has been downloaded.",
    });
  };

  const validateRow = (row: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check required fields
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === '') {
        errors.push({
          row: rowIndex,
          field,
          message: `${field} is required`
        });
      }
    }

    // Validate data types and values
    if (row.loan_amount && isNaN(parseFloat(row.loan_amount))) {
      errors.push({ row: rowIndex, field: 'loan_amount', message: 'Must be a valid number' });
    }

    if (row.interest_rate && (isNaN(parseFloat(row.interest_rate)) || parseFloat(row.interest_rate) < 0 || parseFloat(row.interest_rate) > 100)) {
      errors.push({ row: rowIndex, field: 'interest_rate', message: 'Must be a number between 0 and 100' });
    }

    if (row.term_months && (isNaN(parseInt(row.term_months)) || parseInt(row.term_months) < 1 || parseInt(row.term_months) > 600)) {
      errors.push({ row: rowIndex, field: 'term_months', message: 'Must be between 1 and 600 months' });
    }

    if (row.vehicle_value && isNaN(parseFloat(row.vehicle_value))) {
      errors.push({ row: rowIndex, field: 'vehicle_value', message: 'Must be a valid number' });
    }

    if (row.vehicle_year && (isNaN(parseInt(row.vehicle_year)) || parseInt(row.vehicle_year) < 1900 || parseInt(row.vehicle_year) > new Date().getFullYear() + 1)) {
      errors.push({ row: rowIndex, field: 'vehicle_year', message: 'Must be a valid year' });
    }

    if (row.vehicle_type && !vehicleTypes.includes(row.vehicle_type)) {
      errors.push({ 
        row: rowIndex, 
        field: 'vehicle_type', 
        message: `Must be one of: ${vehicleTypes.join(', ')}` 
      });
    }

    if (row.fuel_type && !fuelTypes.includes(row.fuel_type)) {
      errors.push({ 
        row: rowIndex, 
        field: 'fuel_type', 
        message: `Must be one of: ${fuelTypes.join(', ')}` 
      });
    }

    // Validate optional numeric fields
    if (row.efficiency_mpg && row.efficiency_mpg.trim() !== '' && isNaN(parseFloat(row.efficiency_mpg))) {
      errors.push({ row: rowIndex, field: 'efficiency_mpg', message: 'Must be a valid number' });
    }

    if (row.annual_mileage && row.annual_mileage.trim() !== '' && isNaN(parseInt(row.annual_mileage))) {
      errors.push({ row: rowIndex, field: 'annual_mileage', message: 'Must be a valid integer' });
    }

    if (row.engine_size && row.engine_size.trim() !== '' && isNaN(parseFloat(row.engine_size))) {
      errors.push({ row: rowIndex, field: 'engine_size', message: 'Must be a valid number (engine displacement in cc)' });
    }

    // Validate dates
    if (row.origination_date && isNaN(Date.parse(row.origination_date))) {
      errors.push({ row: rowIndex, field: 'origination_date', message: 'Invalid date format (use YYYY-MM-DD)' });
    }

    return errors;
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }

    return rows;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(null);

    try {
      const csvText = await file.text();
      const rows = parseCSV(csvText);
      
      const errors: ValidationError[] = [];
      const processedData: LoanIntakeRequest[] = [];

      // Validate each row
      for (let i = 0; i < rows.length; i++) {
        const rowErrors = validateRow(rows[i], i + 2); // +2 because row 1 is headers, and we want 1-based indexing
        errors.push(...rowErrors);

        if (rowErrors.length === 0) {
          // Process valid row
          const processedRow: LoanIntakeRequest = {
            borrower_name: rows[i].borrower_name,
            loan_amount: parseFloat(rows[i].loan_amount),
            interest_rate: parseFloat(rows[i].interest_rate),
            term_months: parseInt(rows[i].term_months),
            origination_date: rows[i].origination_date,
            vehicle_details: {
              make: rows[i].vehicle_make,
              model: rows[i].vehicle_model,
              year: parseInt(rows[i].vehicle_year),
              type: rows[i].vehicle_type as any,
              fuel_type: rows[i].fuel_type as any,
              value_at_origination: parseFloat(rows[i].vehicle_value),
              efficiency_mpg: rows[i].efficiency_mpg ? parseFloat(rows[i].efficiency_mpg) : undefined,
              annual_mileage: rows[i].annual_mileage ? parseInt(rows[i].annual_mileage) : undefined,
              vin: rows[i].vin || undefined,
              engine_size: rows[i].engine_size ? parseFloat(rows[i].engine_size) : undefined,
            }
          };
          processedData.push(processedRow);
        }
      }

      const result: UploadResult = {
        totalRows: rows.length,
        validRows: processedData.length,
        invalidRows: rows.length - processedData.length,
        errors,
        processedData
      };

      setUploadResult(result);
      onValidationSummaryChange?.({ errors: result.errors.length, rows: result.totalRows });
      
      toast({
        title: "File Processed",
        description: `${result.validRows} valid rows, ${result.invalidRows} rows with errors`,
      });

      // Generate AI suggestions for data quality improvement
      if (result.errors.length > 0) {
        generateAISuggestions(result.errors, result.processedData);
      }

    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process CSV file. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult(null);
      processFile(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
    }
  };

  const saveToDatabase = async () => {
    if (!uploadResult || uploadResult.validRows === 0) return;

    try {
      setIsProcessing(true);
      
      // Upload to backend API
      const uploadId = await uploadService.uploadCSVData(
        uploadResult.processedData,
        {
          validateOnly: false,
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
          onError: (error) => {
            console.error('Upload error:', error);
            toast({
              title: "Upload Error",
              description: handleAPIError(error),
              variant: "destructive"
            });
          },
          onComplete: (result) => {
            toast({
              title: "Data Uploaded Successfully",
              description: `${uploadResult.validRows} loan records processed and saved.`,
            });

            // Reset state
            setFile(null);
            setUploadResult(null);
            setUploadProgress(null);
            setCurrentUploadId(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            onValidationSummaryChange?.({ errors: 0, rows: 0 });
          }
        }
      );

      setCurrentUploadId(uploadId);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: handleAPIError(error),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateOnly = async () => {
    if (!uploadResult || uploadResult.validRows === 0) return;

    try {
      setIsProcessing(true);
      setValidationMode(true);
      
      // Validate with backend API
      const uploadId = await uploadService.uploadCSVData(
        uploadResult.processedData,
        {
          validateOnly: true,
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
          onError: (error) => {
            console.error('Validation error:', error);
            toast({
              title: "Validation Error",
              description: handleAPIError(error),
              variant: "destructive"
            });
          },
          onComplete: (result) => {
            toast({
              title: "Validation Complete",
              description: `${uploadResult.validRows} loan records validated successfully.`,
            });
            setUploadProgress(null);
            setCurrentUploadId(null);
          }
        }
      );

      setCurrentUploadId(uploadId);

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Error",
        description: handleAPIError(error),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setValidationMode(false);
    }
  };

  const cancelUpload = () => {
    if (currentUploadId) {
      const cancelled = uploadService.cancelUpload(currentUploadId);
      if (cancelled) {
        toast({
          title: "Upload Cancelled",
          description: "The upload process has been cancelled.",
        });
        setUploadProgress(null);
        setCurrentUploadId(null);
        setIsProcessing(false);
      }
    }
  };

  const generateAISuggestions = async (errors: ValidationError[], validData: LoanIntakeRequest[]) => {
    try {
      setLoadingSuggestions(true);
      const response = await platformRAGService.queryAgent(
        'calculation',
        'Analyze these data validation errors and provide suggestions for improving data quality',
        {
          totalErrors: errors.length,
          errorTypes: errors.map(e => e.field),
          validRowsCount: validData.length,
          commonIssues: errors.reduce((acc, error) => {
            acc[error.field] = (acc[error.field] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      );
      setAiSuggestions(response.response);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            CSV Upload Interface
          </CardTitle>
          <CardDescription>
            Upload motor vehicle loan data for PCAF emissions calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-sm p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Upload CSV File</h3>
                <p className="text-muted-foreground">Select your loan portfolio CSV file</p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="max-w-sm"
              />
            </div>
          </div>

          {/* Processing Progress */}
          {(isProcessing || uploadProgress) && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {isProcessing && !uploadProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing file...</span>
                      </div>
                      <Progress value={undefined} className="animate-pulse" />
                    </div>
                  )}
                  
                  {uploadProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {uploadProgress.status === 'processing' ? 'Uploading to backend...' : 
                           uploadProgress.status === 'completed' ? 'Upload completed' :
                           uploadProgress.status === 'failed' ? 'Upload failed' : 'Upload cancelled'}
                        </span>
                        <span>{uploadProgress.progress}%</span>
                      </div>
                      <Progress value={uploadProgress.progress} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{uploadProgress.processedItems} / {uploadProgress.totalItems} items</span>
                        {currentUploadId && uploadProgress.status === 'processing' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelUpload}
                            className="h-6 px-2"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-sm text-center">
                    <div className="text-2xl font-bold">{uploadResult.totalRows}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-sm text-center">
                    <div className="text-2xl font-bold text-green-600">{uploadResult.validRows}</div>
                    <div className="text-sm text-muted-foreground">Valid Rows</div>
                  </div>
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-sm text-center">
                    <div className="text-2xl font-bold text-red-600">{uploadResult.invalidRows}</div>
                    <div className="text-sm text-muted-foreground">Invalid Rows</div>
                  </div>
                </div>

                {/* AI Data Quality Suggestions */}
                {(aiSuggestions || loadingSuggestions) && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        AI Data Quality Assistant
                        <Badge variant="secondary" className="ml-auto">
                          Platform RAG
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingSuggestions ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Brain className="h-4 w-4 animate-pulse" />
                          Analyzing data quality issues...
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <p className="text-sm leading-relaxed">{aiSuggestions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Validation Errors */}
                {uploadResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Validation Errors ({uploadResult.errors.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uploadResult.errors.map((error, index) => (
                        <div key={index} className="text-sm p-2 bg-destructive/10 rounded border border-destructive/20">
                          <strong>Row {error.row}, {error.field}:</strong> {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {uploadResult.validRows > 0 && !uploadProgress && (
                    <>
                      <Button 
                        onClick={validateOnly} 
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Validate {uploadResult.validRows} Loans
                      </Button>
                      <Button 
                        onClick={saveToDatabase} 
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Upload {uploadResult.validRows} Loans to Backend
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFile(null);
                      setUploadResult(null);
                      setUploadProgress(null);
                      setCurrentUploadId(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      onValidationSummaryChange?.({ errors: 0, rows: 0 });
                    }}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Field Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CSV Field Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-primary mb-2">Required Fields:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• loan_id (unique identifier)</li>
                    <li>• borrower_name (string)</li>
                    <li>• loan_amount (number)</li>
                    <li>• interest_rate (0-100)</li>
                    <li>• term_months (1-600)</li>
                    <li>• origination_date (YYYY-MM-DD)</li>
                    <li>• vehicle_make (string)</li>
                    <li>• vehicle_model (string)</li>
                    <li>• vehicle_year (1900-{new Date().getFullYear() + 1})</li>
                    <li>• vehicle_type ({vehicleTypes.join(', ')})</li>
                    <li>• fuel_type ({fuelTypes.join(', ')})</li>
                    <li>• vehicle_value (number)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-primary mb-2">Optional Fields:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• efficiency_mpg (number)</li>
                    <li>• annual_mileage (integer)</li>
                    <li>• vin (vehicle identification number)</li>
                    <li>• engine_size (displacement in cc)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}