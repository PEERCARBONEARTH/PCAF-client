import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Using toast from sonner instead of useToast hook
import {
  dataIngestionWorkflowService,
  type WorkflowState,
} from '@/services/dataIngestionWorkflowService';
import { EnhancedFileUpload } from './EnhancedFileUpload';
import { EnhancedMethodologyStep } from './EnhancedMethodologyStep';
import { ProgressTracker, StepProgressTracker } from './ProgressTracker';
import {
  Upload,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Database,
  Calculator,
  Target,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface DataIngestionWizardProps {
  onComplete?: (data: any) => void;
  className?: string;
}

type IngestionStep = 'source' | 'methodology' | 'validation' | 'processing';

export function DataIngestionWizard({ onComplete, className = '' }: DataIngestionWizardProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>(
    dataIngestionWorkflowService.getWorkflowState()
  );
  // Using toast from sonner import

  useEffect(() => {
    const unsubscribe = dataIngestionWorkflowService.subscribe(setWorkflowState);
    return unsubscribe;
  }, []);

  const steps = [
    {
      id: 'source' as IngestionStep,
      title: 'Data Source',
      description: 'Select and configure your data source',
      icon: Upload,
      required: true,
    },
    {
      id: 'methodology' as IngestionStep,
      title: 'Methodology & Assumptions',
      description: 'Configure activity factors and data sources',
      icon: Calculator,
      required: true,
      critical: true,
    },
    {
      id: 'validation' as IngestionStep,
      title: 'Data Validation',
      description: 'Review and validate data quality',
      icon: CheckCircle,
      required: true,
    },
    {
      id: 'processing' as IngestionStep,
      title: 'Processing',
      description: 'Process and calculate emissions',
      icon: Target,
      required: true,
    },
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === workflowState.currentStep);
  const getStepProgress = () => ((getCurrentStepIndex() + 1) / steps.length) * 100;

  const handleStepComplete = async (stepId: IngestionStep, data: any) => {
    try {
      await dataIngestionWorkflowService.completeStep(stepId, data);

      toast.success(`${steps.find(s => s.id === stepId)?.title} completed successfully.`);

      // Check if workflow is complete
      if (workflowState.isComplete) {
        console.log('🎉 Workflow completed, triggering data synchronization...');
        onComplete?.(workflowState.results);
      }
    } catch (error) {
      console.error('❌ Step completion failed:', error);
      toast.error('Failed to complete step. Please try again.');
    }
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      const nextStepId = steps[currentIndex + 1].id;
      dataIngestionWorkflowService.navigateToStep(nextStepId);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      const prevStepId = steps[currentIndex - 1].id;
      dataIngestionWorkflowService.navigateToStep(prevStepId);
    }
  };

  const isStepComplete = (stepId: IngestionStep) =>
    workflowState.steps[stepId]?.status === 'completed';
  
  const isStepActive = (stepId: IngestionStep) =>
    workflowState.currentStep === stepId;
  
  const isStepError = (stepId: IngestionStep) =>
    workflowState.steps[stepId]?.status === 'error';
  
  const canProceed = () => {
    const currentStep = workflowState.currentStep as IngestionStep;
    const stepStatus = workflowState.steps[currentStep]?.status;
    
    // Can proceed if step is completed or if we have data and no blocking errors
    return stepStatus === 'completed' || 
           (workflowState.steps[currentStep]?.data && stepStatus !== 'error');
  };
  
  const canNavigateToStep = (stepId: IngestionStep) => {
    // Can navigate to completed steps or current active step
    return isStepComplete(stepId) || isStepActive(stepId);
  };
  
  const getStepStatusIcon = (stepId: IngestionStep) => {
    if (isStepComplete(stepId)) {
      return CheckCircle;
    } else if (isStepError(stepId)) {
      return AlertTriangle;
    } else {
      const step = steps.find(s => s.id === stepId);
      return step?.icon || Upload;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Ingestion Workflow
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete all steps to ensure PCAF-compliant data processing
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Step {getCurrentStepIndex() + 1} of {steps.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getStepProgress()} className="h-2" />

            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = isStepActive(step.id);
                const isCompleted = isStepComplete(step.id);
                const hasError = isStepError(step.id);
                const isCritical = step.critical;
                const canNavigate = canNavigateToStep(step.id);
                const StatusIcon = getStepStatusIcon(step.id);

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                        ${canNavigate ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'}
                        ${
                          hasError
                            ? 'border-red-500 bg-red-500 text-white shadow-lg'
                            : isActive
                              ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                              : isCompleted
                                ? 'border-green-500 bg-green-500 text-white hover:shadow-md'
                                : 'border-muted bg-muted text-muted-foreground'
                        }
                        ${isCritical ? 'ring-2 ring-orange-200' : ''}
                      `}
                      onClick={() =>
                        canNavigate && dataIngestionWorkflowService.navigateToStep(step.id)
                      }
                      title={`${step.title} - ${
                        hasError ? 'Error' : isCompleted ? 'Completed' : isActive ? 'Current' : 'Pending'
                      }`}
                    >
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`
                          w-12 h-0.5 mx-2 transition-colors
                          ${isCompleted ? 'bg-green-500' : hasError ? 'bg-red-300' : 'bg-muted'}
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Labels */}
            <div className="flex items-center justify-between text-xs">
              {steps.map(step => {
                const isActive = isStepActive(step.id);
                const isCompleted = isStepComplete(step.id);
                const hasError = isStepError(step.id);
                const canNavigate = canNavigateToStep(step.id);

                return (
                  <div
                    key={step.id}
                    className={`text-center max-w-20 transition-all ${
                      canNavigate ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'
                    }`}
                    onClick={() =>
                      canNavigate && dataIngestionWorkflowService.navigateToStep(step.id)
                    }
                  >
                    <div
                      className={`font-medium transition-colors ${
                        hasError
                          ? 'text-red-600'
                          : isActive
                            ? 'text-primary'
                            : isCompleted
                              ? 'text-green-600'
                              : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {step.critical && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                        >
                          Critical
                        </Badge>
                      )}
                      {hasError && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-50 text-red-700 border-red-200"
                        >
                          ⚠ Error
                        </Badge>
                      )}
                      {isCompleted && !hasError && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          ✓ Done
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <ProgressTracker 
        stepId={workflowState.currentStep}
        showHistory={true}
        compact={false}
      />

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const currentStepData = steps.find(s => s.id === workflowState.currentStep);
              if (currentStepData?.icon) {
                const IconComponent = currentStepData.icon;
                return <IconComponent className="h-5 w-5" />;
              }
              return null;
            })()}
            {steps.find(s => s.id === workflowState.currentStep)?.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {steps.find(s => s.id === workflowState.currentStep)?.description}
          </p>
          
          {/* Inline step progress */}
          <StepProgressTracker stepId={workflowState.currentStep} />
        </CardHeader>
        <CardContent>
          {workflowState.currentStep === 'source' && (
            <DataSourceStep onComplete={data => handleStepComplete('source', data)} />
          )}
          {workflowState.currentStep === 'methodology' && (
            <EnhancedMethodologyStep 
              onComplete={data => handleStepComplete('methodology', data)}
              initialData={workflowState.steps.methodology?.data}
            />
          )}
          {workflowState.currentStep === 'validation' && (
            <ValidationStep onComplete={data => handleStepComplete('validation', data)} />
          )}
          {workflowState.currentStep === 'processing' && (
            <ProcessingStep onComplete={data => handleStepComplete('processing', data)} />
          )}
        </CardContent>
      </Card>

      {/* Error and Warning Display */}
      {(workflowState.errors.length > 0 || workflowState.warnings.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            {workflowState.errors.filter(e => !e.resolved).length > 0 && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {workflowState.errors.filter(e => !e.resolved).length} error(s) need attention.
                  {workflowState.canRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => dataIngestionWorkflowService.retryStep(workflowState.currentStep)}
                    >
                      Retry
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {workflowState.warnings.filter(w => !w.acknowledged).length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {workflowState.warnings.filter(w => !w.acknowledged).length} warning(s) to review.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mock Mode Indicator */}
      {workflowState.mockMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> Using simulated data due to service unavailability.
            {workflowState.degradationReason && ` Reason: ${workflowState.degradationReason}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={getCurrentStepIndex() === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {/* Show retry button if current step has error */}
          {isStepError(workflowState.currentStep as IngestionStep) && workflowState.canRetry && (
            <Button
              variant="outline"
              onClick={() => dataIngestionWorkflowService.retryStep(workflowState.currentStep)}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Retry
            </Button>
          )}
          
          {getCurrentStepIndex() === steps.length - 1 ? (
            <Button
              onClick={async () => {
                console.log('🚀 Manual completion triggered');
                
                // Force trigger data synchronization if workflow is complete
                if (workflowState.isComplete && workflowState.results) {
                  try {
                    // Import and call synchronization service directly
                    const { dataSynchronizationService } = await import('@/services/dataSynchronizationService');
                    
                    const processingData = workflowState.steps.processing?.data;
                    const ingestionResult = {
                      uploadId: workflowState.steps.source?.data?.uploadId || `manual_${Date.now()}`,
                      totalLoans: processingData?.totalLoans || 247,
                      successfulCalculations: processingData?.successfulCalculations || 247,
                      totalEmissions: processingData?.totalEmissions || 45678.9,
                      averageDataQuality: processingData?.averageDataQuality || 3.2,
                      processingTime: processingData?.processingTime || '8.5 seconds',
                      timestamp: new Date(),
                      fromMock: processingData?.fromMock || true
                    };
                    
                    console.log('🔄 Manually triggering data synchronization:', ingestionResult);
                    await dataSynchronizationService.onIngestionComplete(ingestionResult);
                    console.log('✅ Manual data synchronization completed');
                    
                  } catch (error) {
                    console.error('❌ Manual synchronization failed:', error);
                  }
                }
                
                onComplete?.(workflowState.results);
              }}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Complete Ingestion
              <CheckCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={goToNextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function DataSourceStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [sourceConfig, setSourceConfig] = useState<any>({});

  const dataSources = [
    {
      id: 'csv',
      name: 'CSV Upload',
      description: 'Upload loan data via CSV file',
      icon: FileText,
      features: ['Quick setup', 'Manual data validation', 'Batch processing'],
      recommended: true,
    },
    {
      id: 'lms',
      name: 'LMS Integration',
      description: 'Connect to Loan Management System',
      icon: Database,
      features: ['Real-time sync', 'Automated updates', 'API connection'],
      recommended: false,
    },
    {
      id: 'api',
      name: 'API Integration',
      description: 'Custom API data source',
      icon: Settings,
      features: ['Custom endpoints', 'Flexible mapping', 'Advanced configuration'],
      recommended: false,
    },
  ];

  const handleSourceSelect = async (sourceId: string) => {
    setSelectedSource(sourceId);
    const config = { source: sourceId };
    setSourceConfig(config);

    // For CSV, wait for file upload before completing
    if (sourceId !== 'csv') {
      try {
        const result = await dataIngestionWorkflowService.processDataSource(config);
        onComplete({ ...config, ...result });
      } catch (error) {
        console.error('Data source processing failed:', error);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    const config = { ...sourceConfig, file, fileName: file.name };
    setSourceConfig(config);

    try {
      const result = await dataIngestionWorkflowService.processDataSource(config);
      onComplete({ ...config, ...result });
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Select your data source. Each source type has different methodology requirements and
          capabilities.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dataSources.map(source => (
          <Card
            key={source.id}
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
              selectedSource === source.id
                ? 'ring-2 ring-primary bg-primary/5 shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSourceSelect(source.id)}
          >
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                    selectedSource === source.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <source.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">{source.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                {source.recommended && (
                  <Badge
                    variant="outline"
                    className="mt-2 bg-green-50 text-green-700 border-green-200"
                  >
                    Recommended
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Features:</h4>
                <ul className="space-y-1">
                  {source.features.map((feature, index) => (
                    <li key={index} className="text-xs flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedSource === source.id && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <CheckCircle className="h-4 w-4" />
                    Selected
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSource && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Data Source Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium">Selected Source</h4>
                  <p className="text-sm text-muted-foreground">
                    {dataSources.find(s => s.id === selectedSource)?.name}
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Ready
                </Badge>
              </div>

              {selectedSource === 'csv' && (
                <EnhancedFileUpload
                  onFileProcessed={(data) => {
                    const config = { 
                      ...sourceConfig, 
                      file: data.file, 
                      fileName: data.file.name,
                      validationResult: data.validationResult,
                      uploadId: data.uploadId
                    };
                    setSourceConfig(config);
                    handleFileUpload(data.file);
                  }}
                  onError={(error) => {
                    console.error('File upload error:', error);
                    toast.error(`File Upload Error: ${error.message}`);
                  }}
                  acceptedFileTypes={['.csv']}
                  maxFileSize={10}
                  showPreview={true}
                />
              )}

              {selectedSource === 'lms' && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">LMS Connection Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">API Endpoint</label>
                        <input
                          type="url"
                          placeholder="https://your-lms.com/api"
                          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                          onChange={e =>
                            setSourceConfig({ ...sourceConfig, endpoint: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">API Key</label>
                        <input
                          type="password"
                          placeholder="Enter your API key"
                          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                          onChange={e =>
                            setSourceConfig({ ...sourceConfig, apiKey: e.target.value })
                          }
                        />
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedSource === 'api' && (
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Custom API Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">API Endpoint</label>
                        <input
                          type="url"
                          placeholder="https://api.example.com/loans"
                          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                          onChange={e =>
                            setSourceConfig({ ...sourceConfig, endpoint: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Authentication Method</label>
                        <select
                          className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                          onChange={e =>
                            setSourceConfig({ ...sourceConfig, authMethod: e.target.value })
                          }
                        >
                          <option value="">Select method</option>
                          <option value="api_key">API Key</option>
                          <option value="bearer_token">Bearer Token</option>
                          <option value="oauth">OAuth 2.0</option>
                        </select>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Configure Mapping
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your data source is configured. Click "Next" to proceed to methodology
                  configuration.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


function ValidationStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const results = await dataIngestionWorkflowService.validateData({});
      setValidationResults(results);
      onComplete({ validationResults: results, validatedAt: new Date() });
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  if (isValidating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Validating Data</h3>
        <p className="text-muted-foreground">Running PCAF compliance and data quality checks...</p>
      </div>
    );
  }

  if (!validationResults) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Validation Failed</h3>
        <p className="text-muted-foreground mb-4">Unable to validate data. Please try again.</p>
        <Button onClick={runValidation}>Retry Validation</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Data validation completed successfully. Review the results below.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(validationResults).map(([key, result]: [string, any]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <Badge variant={result.passed ? 'default' : 'destructive'}>
                  {result.passed ? 'Passed' : 'Failed'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{result.message}</p>
              {result.score && (
                <div className="mt-2">
                  <div className="text-sm font-medium">Score: {result.score}</div>
                </div>
              )}
              {result.percentage && (
                <div className="mt-2">
                  <div className="text-sm font-medium">Coverage: {result.percentage}%</div>
                  <Progress value={result.percentage} className="h-2 mt-1" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProcessingStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [processingResults, setProcessingResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const runProcessing = async () => {
    setIsProcessing(true);
    try {
      const results = await dataIngestionWorkflowService.processEmissions({});
      setProcessingResults(results);
      onComplete({ results, processedAt: new Date() });
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    runProcessing();
  }, []);

  if (isProcessing) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Processing Emissions</h3>
        <p className="text-muted-foreground">
          Calculating financed emissions using PCAF methodology...
        </p>
      </div>
    );
  }

  if (!processingResults) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Processing Failed</h3>
        <p className="text-muted-foreground mb-4">Unable to process emissions. Please try again.</p>
        <Button onClick={runProcessing}>Retry Processing</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Emissions processing completed successfully. Your data is ready for analysis.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{processingResults.totalLoans}</div>
            <div className="text-sm text-muted-foreground">Total Loans</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {processingResults.successfulCalculations}
            </div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {processingResults.averageDataQuality}
            </div>
            <div className="text-sm text-muted-foreground">Avg Quality</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {processingResults.totalEmissions.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">tCO2e</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Processing Time:</span>
              <span className="font-medium">{processingResults.processingTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Compliance Status:</span>
              <Badge variant="default">{processingResults.complianceStatus}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Total Emissions:</span>
              <span className="font-medium">
                {processingResults.totalEmissions.toLocaleString()} tCO2e
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
