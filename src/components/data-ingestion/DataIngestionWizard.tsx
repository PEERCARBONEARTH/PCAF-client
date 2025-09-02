import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BookOpen,
  Target,
  Info
} from "lucide-react";

interface DataIngestionWizardProps {
  onComplete?: (data: any) => void;
  className?: string;
}

type IngestionStep = 'source' | 'methodology' | 'validation' | 'processing';

export function DataIngestionWizard({ onComplete, className = "" }: DataIngestionWizardProps) {
  const [currentStep, setCurrentStep] = useState<IngestionStep>('source');
  const [completedSteps, setCompletedSteps] = useState<Set<IngestionStep>>(new Set());
  const [stepData, setStepData] = useState<Record<string, any>>({});

  const steps = [
    {
      id: 'source' as IngestionStep,
      title: 'Data Source',
      description: 'Select and configure your data source',
      icon: Upload,
      required: true
    },
    {
      id: 'methodology' as IngestionStep,
      title: 'Methodology & Assumptions',
      description: 'Configure activity factors and data sources',
      icon: Calculator,
      required: true,
      critical: true
    },
    {
      id: 'validation' as IngestionStep,
      title: 'Data Validation',
      description: 'Review and validate data quality',
      icon: CheckCircle,
      required: true
    },
    {
      id: 'processing' as IngestionStep,
      title: 'Processing',
      description: 'Process and calculate emissions',
      icon: Target,
      required: true
    }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const getStepProgress = () => ((getCurrentStepIndex() + 1) / steps.length) * 100;

  const markStepComplete = (stepId: IngestionStep, data?: any) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    if (data) {
      setStepData(prev => ({ ...prev, [stepId]: data }));
    }
  };

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const isStepComplete = (stepId: IngestionStep) => completedSteps.has(stepId);
  const canProceed = () => isStepComplete(currentStep);

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
                const isActive = step.id === currentStep;
                const isCompleted = isStepComplete(step.id);
                const isCritical = step.critical;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${isActive 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : isCompleted 
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-muted bg-muted text-muted-foreground'
                      }
                      ${isCritical ? 'ring-2 ring-orange-200' : ''}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`
                        w-12 h-0.5 mx-2 transition-colors
                        ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Step Labels */}
            <div className="flex items-center justify-between text-xs">
              {steps.map((step) => (
                <div key={step.id} className="text-center max-w-20">
                  <div className={`font-medium ${step.id === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                  {step.critical && (
                    <Badge variant="outline" className="text-xs mt-1 bg-orange-50 text-orange-700 border-orange-200">
                      Critical
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const currentStepData = steps.find(s => s.id === currentStep);
              if (currentStepData?.icon) {
                const IconComponent = currentStepData.icon;
                return <IconComponent className="h-5 w-5" />;
              }
              return null;
            })()}
            {steps.find(s => s.id === currentStep)?.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {steps.find(s => s.id === currentStep)?.description}
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === 'source' && <DataSourceStep onComplete={(data) => markStepComplete('source', data)} />}
          {currentStep === 'methodology' && <MethodologyStep onComplete={(data) => markStepComplete('methodology', data)} />}
          {currentStep === 'validation' && <ValidationStep onComplete={(data) => markStepComplete('validation', data)} />}
          {currentStep === 'processing' && <ProcessingStep onComplete={(data) => markStepComplete('processing', data)} />}
        </CardContent>
      </Card>

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
          {getCurrentStepIndex() === steps.length - 1 ? (
            <Button
              onClick={() => onComplete?.(stepData)}
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

  const dataSources = [
    { id: 'csv', name: 'CSV Upload', description: 'Upload loan data via CSV file', icon: FileText },
    { id: 'lms', name: 'LMS Integration', description: 'Connect to Loan Management System', icon: Database },
    { id: 'api', name: 'API Integration', description: 'Custom API data source', icon: Settings }
  ];

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSource(sourceId);
    onComplete({ source: sourceId });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Select your data source. Each source type has different methodology requirements.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dataSources.map((source) => (
          <Card 
            key={source.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSource === source.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSourceSelect(source.id)}
          >
            <CardContent className="p-4 text-center">
              <source.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium">{source.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MethodologyStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [methodologyConfig, setMethodologyConfig] = useState({
    activityFactorSource: '',
    dataQualityApproach: '',
    assumptionsValidated: false
  });

  const handleConfigComplete = () => {
    if (methodologyConfig.activityFactorSource && methodologyConfig.dataQualityApproach && methodologyConfig.assumptionsValidated) {
      onComplete(methodologyConfig);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Critical Step:</strong> Methodology configuration directly impacts PCAF compliance and data quality scores.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="factors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="factors">Activity Factors</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="factors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Factor Sources</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how emission factors are determined for your portfolio
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md" onClick={() => setMethodologyConfig(prev => ({ ...prev, activityFactorSource: 'epa' }))}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${methodologyConfig.activityFactorSource === 'epa' ? 'bg-primary' : 'bg-muted'}`} />
                      <h4 className="font-medium">EPA Emission Factors</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Use EPA's standardized emission factors</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md" onClick={() => setMethodologyConfig(prev => ({ ...prev, activityFactorSource: 'custom' }))}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${methodologyConfig.activityFactorSource === 'custom' ? 'bg-primary' : 'bg-muted'}`} />
                      <h4 className="font-medium">Custom Factors</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Upload your own emission factors</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Quality Methodology</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define how PCAF data quality scores are calculated
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                     onClick={() => setMethodologyConfig(prev => ({ ...prev, dataQualityApproach: 'pcaf_standard' }))}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${methodologyConfig.dataQualityApproach === 'pcaf_standard' ? 'bg-primary' : 'bg-muted'}`} />
                    <div>
                      <h4 className="font-medium">PCAF Standard Methodology</h4>
                      <p className="text-xs text-muted-foreground">Use standard PCAF data quality scoring</p>
                    </div>
                  </div>
                  <Badge variant="outline">Recommended</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                     onClick={() => setMethodologyConfig(prev => ({ ...prev, dataQualityApproach: 'enhanced' }))}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${methodologyConfig.dataQualityApproach === 'enhanced' ? 'bg-primary' : 'bg-muted'}`} />
                    <div>
                      <h4 className="font-medium">Enhanced Quality Scoring</h4>
                      <p className="text-xs text-muted-foreground">Include additional quality metrics</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assumptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assumptions Validation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and validate key assumptions for your calculations
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-medium mb-2">Key Assumptions to Review:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Vehicle fuel efficiency assumptions</li>
                    <li>• Annual mileage estimates</li>
                    <li>• Loan attribution methodology</li>
                    <li>• Emission factor sources and vintages</li>
                  </ul>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <input 
                    type="checkbox" 
                    id="assumptions-validated"
                    checked={methodologyConfig.assumptionsValidated}
                    onChange={(e) => setMethodologyConfig(prev => ({ ...prev, assumptionsValidated: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="assumptions-validated" className="text-sm font-medium">
                    I have reviewed and validated all key assumptions for this data ingestion
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleConfigComplete}
        disabled={!methodologyConfig.activityFactorSource || !methodologyConfig.dataQualityApproach || !methodologyConfig.assumptionsValidated}
        className="w-full"
      >
        Complete Methodology Configuration
      </Button>
    </div>
  );
}

function ValidationStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [validationComplete, setValidationComplete] = useState(false);

  return (
    <div className="space-y-4">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Data validation ensures quality and PCAF compliance before processing.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-3">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Validation Checks</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Data format validation passed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Methodology configuration validated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>PCAF compliance check passed</span>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={() => {
          setValidationComplete(true);
          onComplete({ validated: true });
        }}
        className="w-full"
      >
        Proceed to Processing
      </Button>
    </div>
  );
}

function ProcessingStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [processing, setProcessing] = useState(false);

  const startProcessing = () => {
    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      onComplete({ processed: true });
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          Ready to process your data with the configured methodology and assumptions.
        </AlertDescription>
      </Alert>
      
      {processing ? (
        <div className="space-y-4">
          <Progress value={66} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Processing data with PCAF methodology...
          </p>
        </div>
      ) : (
        <Button onClick={startProcessing} className="w-full">
          Start Processing
        </Button>
      )}
    </div>
  );
}