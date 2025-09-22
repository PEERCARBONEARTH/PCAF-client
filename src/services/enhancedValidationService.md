# Enhanced Validation Service

The Enhanced Validation Service provides comprehensive, progressive validation for the data ingestion workflow. It validates data at each step of the process and provides detailed feedback with actionable guidance.

## Features

### Progressive Validation
- **Step-by-step validation**: Validates data at each workflow step (source, methodology, validation, processing)
- **Incremental feedback**: Provides immediate validation results as users progress through the wizard
- **Context-aware requirements**: Different validation rules apply based on the current step and configuration

### Detailed Error Reporting
- **Row-level error identification**: Pinpoints specific rows and columns with data quality issues
- **Severity classification**: Categorizes issues as errors, warnings, or informational
- **Actionable guidance**: Provides specific instructions on how to fix identified issues
- **Suggested values**: Offers recommended corrections for invalid data

### File Validation
- **Format validation**: Ensures files are in the correct format (CSV)
- **Size validation**: Checks file size limits and warns about large files
- **Structure analysis**: Validates CSV structure, headers, and basic content
- **Encoding detection**: Handles different file encodings gracefully

### Data Quality Assessment
- **Completeness scoring**: Measures how much required data is present
- **Accuracy validation**: Checks for reasonable value ranges and data types
- **Consistency checking**: Validates relationships between fields
- **PCAF compliance preview**: Estimates PCAF data quality option based on available data

## API Reference

### Core Methods

#### `validateStep(stepId: string, data: any): Promise<StepValidationResult>`
Validates data for a specific workflow step.

**Parameters:**
- `stepId`: The workflow step to validate ('source', 'methodology', 'validation', 'processing')
- `data`: The data to validate for that step

**Returns:** `StepValidationResult` with validation status, errors, warnings, and completeness score

**Example:**
```typescript
const result = await enhancedValidationService.validateStep('methodology', {
  activityFactorSource: 'epa',
  dataQualityApproach: 'pcaf_standard',
  vehicleAssumptions: {
    'passenger_car': {
      activityBasis: 'distance',
      fuelType: 'gasoline',
      annualDistance: 12000,
      region: 'US'
    }
  }
});

if (result.isValid) {
  console.log('Methodology configuration is valid');
} else {
  result.errors.forEach(error => {
    console.error(`${error.field}: ${error.message}`);
  });
}
```

#### `validateFile(file: File): Promise<FileValidationResult>`
Validates a file for upload compatibility.

**Parameters:**
- `file`: The File object to validate

**Returns:** `FileValidationResult` with file validation status and structure analysis

**Example:**
```typescript
const fileResult = await enhancedValidationService.validateFile(csvFile);

if (!fileResult.isValid) {
  fileResult.errors.forEach(error => {
    if (error.severity === 'error') {
      console.error(`File error: ${error.message}`);
    } else {
      console.warn(`File warning: ${error.message}`);
    }
  });
}
```

#### `validateCSVData(csvData: any[]): Promise<DataValidationResult>`
Validates parsed CSV data for quality and completeness.

**Parameters:**
- `csvData`: Array of objects representing CSV rows

**Returns:** `DataValidationResult` with detailed validation analysis

**Example:**
```typescript
const dataResult = await enhancedValidationService.validateCSVData(parsedData);

console.log(`Data quality scores:
  Completeness: ${dataResult.summary.completenessScore}%
  Accuracy: ${dataResult.summary.accuracyScore}%
  Consistency: ${dataResult.summary.consistencyScore}%`);

// Show row-level errors
dataResult.rowLevelErrors.forEach(error => {
  console.log(`Row ${error.rowIndex + 1}, ${error.columnName}: ${error.errorMessage}`);
});
```

#### `getValidationRequirements(stepId: string): ValidationRequirement[]`
Gets validation requirements for a specific step.

**Parameters:**
- `stepId`: The workflow step to get requirements for

**Returns:** Array of `ValidationRequirement` objects with guidance and examples

**Example:**
```typescript
const requirements = enhancedValidationService.getValidationRequirements('methodology');

requirements.forEach(req => {
  console.log(`${req.name}: ${req.description}`);
  console.log(`Guidance: ${req.guidance}`);
  if (req.examples) {
    console.log(`Examples: ${req.examples.join(', ')}`);
  }
});
```

## Data Types

### StepValidationResult
```typescript
interface StepValidationResult {
  stepId: string;
  isValid: boolean;
  canProceed: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
    guidance?: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    impact: string;
    suggestion?: string;
  }>;
  completeness: number; // 0-100 percentage
  nextStepRequirements?: ValidationRequirement[];
}
```

### MethodologyValidationResult
Extends `StepValidationResult` with additional methodology-specific validation:

```typescript
interface MethodologyValidationResult extends StepValidationResult {
  vehicleAssumptionValidation: Record<string, {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completeness: number;
  }>;
  customFactorValidation?: {
    isValid: boolean;
    missingFactors: string[];
    invalidFactors: Array<{
      factor: string;
      value: number;
      issue: string;
    }>;
  };
  pcafCompliancePreview: {
    estimatedOption: string;
    dataQualityScore: number;
    improvementSuggestions: string[];
  };
}
```

### FileValidationResult
```typescript
interface FileValidationResult {
  isValid: boolean;
  fileName: string;
  fileSize: number;
  mimeType: string;
  encoding?: string;
  errors: Array<{
    code: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  structure?: {
    headers: string[];
    rowCount: number;
    columnCount: number;
    hasHeaders: boolean;
  };
}
```

### DataValidationResult
```typescript
interface DataValidationResult {
  isValid: boolean;
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    completenessScore: number;
    accuracyScore: number;
    consistencyScore: number;
  };
  rowLevelErrors: RowLevelError[];
  fieldAnalysis: Record<string, {
    completeness: number;
    uniqueness: number;
    validity: number;
    commonIssues: string[];
  }>;
  recommendations: string[];
}
```

### RowLevelError
```typescript
interface RowLevelError {
  rowIndex: number;
  columnName: string;
  currentValue: any;
  expectedType: string;
  errorMessage: string;
  suggestedValue?: any;
  severity: 'error' | 'warning';
}
```

## Validation Rules

### File Validation Rules
1. **File Format**: Must be CSV format
2. **File Size**: 
   - Warning for files > 10MB
   - Error for files > 50MB
3. **File Structure**: Must have headers and data rows
4. **Encoding**: UTF-8 recommended

### Data Validation Rules
1. **Required Fields**:
   - `loan_id`: Must be present and non-empty
   - `outstanding_balance`: Must be positive number
   
2. **Data Accuracy**:
   - `vehicle_year`: Between 1990 and current year + 1
   - `efficiency_mpg`: Between 5 and 100 MPG
   - `annual_mileage`: Between 1,000 and 100,000 miles

3. **Data Consistency**:
   - Outstanding balance ≤ original loan amount
   - Vehicle value consistency with loan amount

### Methodology Validation Rules
1. **Activity Factor Source**: Must be selected
2. **Data Quality Approach**: Must be selected
3. **Vehicle Assumptions**: Required for each vehicle type
   - Activity basis required
   - Fuel type required
   - Annual distance > 0
   - Warning for distances > 50,000 miles
4. **Custom Factors**: Required when using custom source
   - Must be positive numbers
   - Warning for unusually high values (> 1000)

## Integration Examples

### With Data Ingestion Wizard
```typescript
// In DataIngestionWizard component
const handleStepValidation = async (stepId: string, data: any) => {
  const result = await enhancedValidationService.validateStep(stepId, data);
  
  if (!result.isValid) {
    setValidationErrors(result.errors);
    setCanProceed(false);
  } else {
    setValidationErrors([]);
    setCanProceed(true);
    
    // Show warnings if any
    if (result.warnings.length > 0) {
      setValidationWarnings(result.warnings);
    }
  }
  
  setCompleteness(result.completeness);
};
```

### With File Upload Component
```typescript
// In EnhancedFileUpload component
const handleFileValidation = async (file: File) => {
  const fileResult = await enhancedValidationService.validateFile(file);
  
  if (!fileResult.isValid) {
    setFileErrors(fileResult.errors);
    return;
  }
  
  // Parse and validate data
  const csvData = await parseCSV(file);
  const dataResult = await enhancedValidationService.validateCSVData(csvData);
  
  setValidationSummary(dataResult.summary);
  setRowErrors(dataResult.rowLevelErrors);
  setRecommendations(dataResult.recommendations);
};
```

## Error Handling

The service includes comprehensive error handling:

1. **Graceful Degradation**: Continues validation even if some checks fail
2. **Test Environment Support**: Adapts behavior for testing scenarios
3. **Detailed Error Context**: Provides specific guidance for each error type
4. **Recovery Suggestions**: Offers actionable steps to resolve issues

## Performance Considerations

1. **Efficient File Reading**: Only reads file previews for structure analysis
2. **Incremental Validation**: Validates data progressively to avoid blocking UI
3. **Memory Management**: Handles large datasets efficiently
4. **Caching**: Reuses validation results where appropriate

## Testing

The service includes comprehensive test coverage:
- File validation scenarios
- CSV data validation with various data quality issues
- Step validation for all workflow steps
- Error handling and edge cases
- Integration scenarios

Run tests with:
```bash
npm test -- enhancedValidationService.test.ts
```

## Future Enhancements

1. **Custom Validation Rules**: Allow users to define custom validation rules
2. **Batch Validation**: Support for validating multiple files simultaneously
3. **Real-time Validation**: Validate data as users type or paste
4. **Machine Learning**: Use ML to suggest data corrections
5. **Integration APIs**: Connect with external data quality services