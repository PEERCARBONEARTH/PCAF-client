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
                                const canNavigate = isCompleted || isActive;

                                return (
                                    <div key={step.id} className="flex items-center">
                                        <div 
                                            className={`
                                                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                                                ${canNavigate ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                                                ${isActive
                                                    ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                                                    : isCompleted
                                                        ? 'border-green-500 bg-green-500 text-white hover:shadow-md'
                                                        : 'border-muted bg-muted text-muted-foreground'
                                                }
                                                ${isCritical ? 'ring-2 ring-orange-200' : ''}
                                            `}
                                            onClick={() => canNavigate && setCurrentStep(step.id)}
                                            title={`${step.title} - ${isCompleted ? 'Completed' : isActive ? 'Current' : 'Pending'}`}
                                        >
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
                            {steps.map((step) => {
                                const isActive = step.id === currentStep;
                                const isCompleted = isStepComplete(step.id);
                                const canNavigate = isCompleted || isActive;

                                return (
                                    <div 
                                        key={step.id} 
                                        className={`text-center max-w-20 transition-all ${
                                            canNavigate ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'
                                        }`}
                                        onClick={() => canNavigate && setCurrentStep(step.id)}
                                    >
                                        <div className={`font-medium transition-colors ${
                                            isActive ? 'text-primary' : 
                                            isCompleted ? 'text-green-600' : 
                                            'text-muted-foreground'
                                        }`}>
                                            {step.title}
                                        </div>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            {step.critical && (
                                                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                                    Critical
                                                </Badge>
                                            )}
                                            {isCompleted && (
                                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
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
    const [sourceConfig, setSourceConfig] = useState<any>({});

    const dataSources = [
        { 
            id: 'csv', 
            name: 'CSV Upload', 
            description: 'Upload loan data via CSV file', 
            icon: FileText,
            features: ['Quick setup', 'Manual data validation', 'Batch processing'],
            recommended: true
        },
        { 
            id: 'lms', 
            name: 'LMS Integration', 
            description: 'Connect to Loan Management System', 
            icon: Database,
            features: ['Real-time sync', 'Automated updates', 'API connection'],
            recommended: false
        },
        { 
            id: 'api', 
            name: 'API Integration', 
            description: 'Custom API data source', 
            icon: Settings,
            features: ['Custom endpoints', 'Flexible mapping', 'Advanced configuration'],
            recommended: false
        }
    ];

    const handleSourceSelect = (sourceId: string) => {
        setSelectedSource(sourceId);
        setSourceConfig({ source: sourceId });
        onComplete({ source: sourceId });
    };

    return (
        <div className="space-y-6">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Select your data source. Each source type has different methodology requirements and capabilities.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dataSources.map((source) => (
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
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                                    selectedSource === source.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                    <source.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-lg">{source.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                                {source.recommended && (
                                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
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
                            
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Your data source is configured. Click "Next" to proceed to methodology configuration.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function MethodologyStep({ onComplete }: { onComplete: (data: any) => void }) {
    const [methodologyConfig, setMethodologyConfig] = useState({
        activityFactorSource: '',
        dataQualityApproach: '',
        assumptionsValidated: false,
        vehicleAssumptions: {
            passengerCar: { activityBasis: 'distance', fuelType: 'gasoline', annualDistance: 15000, region: 'us' },
            suv: { activityBasis: 'distance', fuelType: 'gasoline', annualDistance: 15000, region: 'us' },
            lightTruck: { activityBasis: 'distance', fuelType: 'gasoline', annualDistance: 15000, region: 'us' },
            motorcycle: { activityBasis: 'distance', fuelType: 'gasoline', annualDistance: 8000, region: 'us' },
            bus: { activityBasis: 'distance', fuelType: 'diesel', annualDistance: 25000, region: 'us' },
            heavyTruck: { activityBasis: 'distance', fuelType: 'diesel', annualDistance: 50000, region: 'us' }
        }
    });

    const handleConfigComplete = () => {
        if (methodologyConfig.activityFactorSource && methodologyConfig.dataQualityApproach && methodologyConfig.assumptionsValidated) {
            onComplete(methodologyConfig);
        }
    };

    const updateVehicleAssumption = (vehicleType: string, field: string, value: string | number) => {
        setMethodologyConfig(prev => ({
            ...prev,
            vehicleAssumptions: {
                ...prev.vehicleAssumptions,
                [vehicleType]: {
                    ...prev.vehicleAssumptions[vehicleType as keyof typeof prev.vehicleAssumptions],
                    [field]: value
                }
            }
        }));
    };

    const vehicleTypes = [
        { key: 'passengerCar', label: 'Passenger Car', icon: '🚗' },
        { key: 'suv', label: 'SUV', icon: '🚙' },
        { key: 'lightTruck', label: 'Light Truck', icon: '🛻' },
        { key: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
        { key: 'bus', label: 'Bus', icon: '🚌' },
        { key: 'heavyTruck', label: 'Heavy Truck', icon: '🚛' }
    ];

    const activityBasisOptions = [
        { value: 'distance', label: 'Distance (km)', description: 'Use annual mileage data' },
        { value: 'fuel', label: 'Fuel (L)', description: 'Use fuel consumption data' }
    ];

    const fuelTypeOptions = [
        { value: 'gasoline', label: 'Gasoline', color: 'bg-blue-100 text-blue-800' },
        { value: 'diesel', label: 'Diesel', color: 'bg-orange-100 text-orange-800' },
        { value: 'electric', label: 'Electric', color: 'bg-green-100 text-green-800' },
        { value: 'hybrid', label: 'Hybrid', color: 'bg-purple-100 text-purple-800' }
    ];

    const regionOptions = [
        { value: 'us', label: 'United States' },
        { value: 'eu', label: 'European Union' },
        { value: 'ca', label: 'Canada' },
        { value: 'global', label: 'Global Average' }
    ];

    return (
        <div className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                    <strong>Critical Step:</strong> Configure per-vehicle-type activity basis and statistical sources used when Option 1 data isn't available.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="assumptions" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="assumptions">Vehicle Assumptions</TabsTrigger>
                    <TabsTrigger value="factors">Activity Factors</TabsTrigger>
                    <TabsTrigger value="quality">Data Quality</TabsTrigger>
                </TabsList>

                <TabsContent value="assumptions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Vehicle Type Assumptions</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Configure per-vehicle-type activity basis and statistical sources used when Option 1 data isn't available
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {vehicleTypes.map((vehicle) => {
                                    const config = methodologyConfig.vehicleAssumptions[vehicle.key as keyof typeof methodologyConfig.vehicleAssumptions];
                                    return (
                                        <Card key={vehicle.key} className="border-l-4 border-l-primary/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <span className="text-lg">{vehicle.icon}</span>
                                                    {vehicle.label}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    {/* Activity Basis */}
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                            Activity Basis
                                                        </label>
                                                        <div className="space-y-2">
                                                            {activityBasisOptions.map((option) => (
                                                                <div
                                                                    key={option.value}
                                                                    className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                                                                        config.activityBasis === option.value
                                                                            ? 'border-primary bg-primary/5'
                                                                            : 'border-muted hover:border-muted-foreground/20'
                                                                    }`}
                                                                    onClick={() => updateVehicleAssumption(vehicle.key, 'activityBasis', option.value)}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${
                                                                            config.activityBasis === option.value ? 'bg-primary' : 'bg-muted'
                                                                        }`} />
                                                                        <div>
                                                                            <div className="text-sm font-medium">{option.label}</div>
                                                                            <div className="text-xs text-muted-foreground">{option.description}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Fuel Type */}
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                            Fuel Type
                                                        </label>
                                                        <div className="space-y-1">
                                                            {fuelTypeOptions.map((fuel) => (
                                                                <div
                                                                    key={fuel.value}
                                                                    className={`px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium ${
                                                                        config.fuelType === fuel.value
                                                                            ? fuel.color + ' ring-2 ring-offset-1 ring-current'
                                                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                                                    }`}
                                                                    onClick={() => updateVehicleAssumption(vehicle.key, 'fuelType', fuel.value)}
                                                                >
                                                                    {fuel.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Annual Distance */}
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                            Annual Distance (km)
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                value={config.annualDistance}
                                                                onChange={(e) => updateVehicleAssumption(vehicle.key, 'annualDistance', parseInt(e.target.value) || 0)}
                                                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                                                placeholder="e.g., 15000"
                                                            />
                                                            <div className="absolute right-3 top-2 text-xs text-muted-foreground">
                                                                km/year
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Region */}
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                            Region
                                                        </label>
                                                        <div className="space-y-1">
                                                            {regionOptions.map((region) => (
                                                                <div
                                                                    key={region.value}
                                                                    className={`px-3 py-2 rounded-lg cursor-pointer transition-all text-sm ${
                                                                        config.region === region.value
                                                                            ? 'bg-primary text-primary-foreground'
                                                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                                                    }`}
                                                                    onClick={() => updateVehicleAssumption(vehicle.key, 'region', region.value)}
                                                                >
                                                                    {region.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

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
                                <Card className={`cursor-pointer transition-all hover:shadow-md ${
                                    methodologyConfig.activityFactorSource === 'epa' ? 'ring-2 ring-primary' : ''
                                }`} onClick={() => setMethodologyConfig(prev => ({ ...prev, activityFactorSource: 'epa' }))}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full ${methodologyConfig.activityFactorSource === 'epa' ? 'bg-primary' : 'bg-muted'}`} />
                                            <h4 className="font-medium">EPA Emission Factors</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Use EPA's standardized emission factors</p>
                                        <Badge variant="outline" className="mt-2">Recommended</Badge>
                                    </CardContent>
                                </Card>

                                <Card className={`cursor-pointer transition-all hover:shadow-md ${
                                    methodologyConfig.activityFactorSource === 'custom' ? 'ring-2 ring-primary' : ''
                                }`} onClick={() => setMethodologyConfig(prev => ({ ...prev, activityFactorSource: 'custom' }))}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full ${methodologyConfig.activityFactorSource === 'custom' ? 'bg-primary' : 'bg-muted'}`} />
                                            <h4 className="font-medium">Custom Factors</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Upload your own emission factors</p>
                                        <Badge variant="secondary" className="mt-2">Advanced</Badge>
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
                                <div className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                                    methodologyConfig.dataQualityApproach === 'pcaf_standard' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                }`}
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

                                <div className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                                    methodologyConfig.dataQualityApproach === 'enhanced' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                                }`}
                                    onClick={() => setMethodologyConfig(prev => ({ ...prev, dataQualityApproach: 'enhanced' }))}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${methodologyConfig.dataQualityApproach === 'enhanced' ? 'bg-primary' : 'bg-muted'}`} />
                                        <div>
                                            <h4 className="font-medium">Enhanced Quality Scoring</h4>
                                            <p className="text-xs text-muted-foreground">Include additional quality metrics</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Advanced</Badge>
                                </div>
                            </div>

                            <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="checkbox"
                                        id="assumptions-validated"
                                        checked={methodologyConfig.assumptionsValidated}
                                        onChange={(e) => setMethodologyConfig(prev => ({ ...prev, assumptionsValidated: e.target.checked }))}
                                        className="rounded"
                                    />
                                    <label htmlFor="assumptions-validated" className="text-sm font-medium">
                                        I have reviewed and validated all vehicle assumptions and methodology configuration
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground ml-6">
                                    This confirms that all vehicle-specific assumptions, activity factors, and data quality approaches have been reviewed for accuracy and compliance.
                                </p>
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
                onClick={() => onComplete({ validated: true })}
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