# Data Ingestion Workflow - Button Connections & Process Flow

## Overview
The Data Ingestion Workflow has been enhanced with proper button connections and workflow processes. Each step now connects to actual backend services and provides real-time feedback to users.

## Workflow Steps & Connections

### 1. Data Source Step
**Buttons Connected:**
- **CSV Upload**: Connects to `enhancedUploadService.uploadFile()`
- **LMS Integration**: Connects to simulated LMS API integration
- **API Integration**: Connects to custom API configuration

**Process Flow:**
1. User selects data source type
2. For CSV: File upload triggers actual file processing
3. For LMS/API: Connection configuration is validated
4. Data source is processed and validated
5. Step completion triggers navigation to methodology

**Connected Services:**
- `enhancedUploadService` for CSV file handling
- `dataIngestionWorkflowService.processDataSource()` for all source types

### 2. Methodology & Assumptions Step
**Buttons Connected:**
- **Activity Basis Selection**: Updates methodology configuration
- **Fuel Type Selection**: Configures emission factors
- **Regional Settings**: Sets geographical parameters
- **Complete Configuration**: Validates and saves methodology

**Process Flow:**
1. User configures vehicle-specific assumptions
2. Activity factors are selected (distance vs fuel)
3. Regional emission factors are applied
4. Configuration is validated for PCAF compliance
5. Methodology data is saved to workflow state

**Connected Services:**
- `dataIngestionWorkflowService.completeStep()` for state management
- Real-time validation of PCAF methodology requirements

### 3. Data Validation Step
**Buttons Connected:**
- **Start Data Validation**: Triggers `dataIngestionWorkflowService.validateData()`
- **Proceed to Processing**: Advances workflow after validation

**Process Flow:**
1. User initiates validation process
2. Data format validation runs
3. Methodology configuration is verified
4. PCAF compliance checks are performed
5. Data quality scoring is calculated
6. Portfolio coverage is assessed
7. Validation results are displayed with pass/fail status

**Connected Services:**
- `dataIngestionWorkflowService.validateData()` for comprehensive validation
- Real-time progress updates during validation

### 4. Processing Step
**Buttons Connected:**
- **Start Processing**: Triggers `dataIngestionWorkflowService.processEmissions()`
- **Complete & View Results**: Finalizes workflow and navigates to results
- **Open Dashboard**: Opens portfolio overview in new tab

**Process Flow:**
1. User initiates emissions processing
2. Data loading and methodology application
3. Financed emissions calculations
4. Data quality score assignment
5. Final validation and compliance checks
6. Results summary generation
7. Workflow completion and navigation

**Connected Services:**
- `dataIngestionWorkflowService.processEmissions()` for emissions calculations
- `enhancedUploadService.processUpload()` for CSV-based processing
- `realTimeService` for progress updates

## Service Architecture

### DataIngestionWorkflowService
**Key Methods:**
- `completeStep(stepId, data)`: Advances workflow and saves step data
- `processDataSource(config)`: Handles different data source types
- `validateData(config)`: Performs comprehensive data validation
- `processEmissions(config)`: Calculates financed emissions
- `subscribe(listener)`: Provides real-time workflow state updates

**State Management:**
- Tracks current step and completion status
- Maintains step data across workflow
- Provides navigation controls
- Handles error states and recovery

### Integration Points
1. **Enhanced Upload Service**: CSV file processing and validation
2. **Real-time Service**: Progress updates and notifications
3. **Portfolio Service**: Data integration and storage
4. **Toast Notifications**: User feedback and error handling

## User Experience Flow

### Step Navigation
- **Visual Progress**: Step indicators show current position and completion
- **Click Navigation**: Users can navigate to completed steps
- **Validation Gates**: Steps must be completed before advancing
- **Error Handling**: Clear error messages and recovery options

### Real-time Feedback
- **Progress Bars**: Show processing progress for long operations
- **Status Updates**: Real-time status messages during processing
- **Validation Results**: Immediate feedback on data quality and compliance
- **Success Indicators**: Clear confirmation of completed steps

### Completion Actions
- **Workflow Results**: Comprehensive summary of processing results
- **Navigation Options**: Direct links to dashboard and reports
- **Data Persistence**: All workflow data is saved for future reference

## PCAF Compliance Features

### Methodology Validation
- **Activity Factor Sources**: EPA, DEFRA, and regional databases
- **Data Quality Scoring**: Options 1-5 scoring system
- **Vehicle Type Configuration**: Comprehensive vehicle category support
- **Regional Customization**: Location-specific emission factors

### Quality Assurance
- **Format Validation**: Ensures data meets PCAF standards
- **Completeness Checks**: Validates required data fields
- **Consistency Verification**: Cross-validates related data points
- **Compliance Reporting**: Generates PCAF-compliant documentation

## Technical Implementation

### State Management
```typescript
interface WorkflowState {
  currentStep: string;
  steps: Record<string, WorkflowStep>;
  isComplete: boolean;
  results?: any;
}
```

### Service Integration
```typescript
// Data source processing
const result = await dataIngestionWorkflowService.processDataSource(config);

// Validation execution
const validationResults = await dataIngestionWorkflowService.validateData(config);

// Emissions processing
const processingResults = await dataIngestionWorkflowService.processEmissions(config);
```

### Error Handling
- **Try-catch blocks**: Comprehensive error catching
- **User notifications**: Toast messages for errors and success
- **Graceful degradation**: Fallback options for service failures
- **Recovery mechanisms**: Options to retry failed operations

## Future Enhancements

### Planned Features
1. **Batch Processing**: Support for multiple file uploads
2. **Advanced Validation**: Machine learning-based data quality assessment
3. **Custom Methodologies**: User-defined calculation approaches
4. **Integration Expansion**: Additional LMS and API connectors

### Performance Optimizations
1. **Lazy Loading**: Step components loaded on demand
2. **Caching**: Workflow state persistence across sessions
3. **Background Processing**: Non-blocking emissions calculations
4. **Progress Streaming**: Real-time processing updates

This implementation provides a complete, PCAF-compliant data ingestion workflow with proper button connections, service integrations, and user experience enhancements.