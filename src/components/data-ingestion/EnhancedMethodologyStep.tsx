import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Calculator,
  HelpCircle,
  Lightbulb,
  Target,
} from 'lucide-react';

interface MethodologyConfig {
  activityFactorSource: string;
  dataQualityApproach: string;
  assumptionsValidated: boolean;
  vehicleAssumptions: Record<string, VehicleAssumption>;
  customFactors?: Record<string, number>;
  regionSpecificSettings?: RegionSettings;
}

interface VehicleAssumption {
  activityBasis: string;
  fuelType: string;
  annualDistance: number;
  region: string;
  customEmissionFactor?: number;
}

interface RegionSettings {
  electricityGridFactor: number;
  fuelCarbonContent: Record<string, number>;
  transportationMix: Record<string, number>;
}

interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
}

interface EnhancedMethodologyStepProps {
  onComplete: (data: MethodologyConfig) => void;
  initialData?: Partial<MethodologyConfig>;
}

const ACTIVITY_FACTOR_SOURCES = [
  {
    id: 'epa',
    name: 'EPA Emission Factors',
    description: 'US EPA official emission factors',
    recommended: true,
    coverage: 'US',
    lastUpdated: '2024',
    dataQuality: 5,
  },
  {
    id: 'defra',
    name: 'DEFRA Factors',
    description: 'UK DEFRA emission factors',
    recommended: false,
    coverage: 'UK/EU',
    lastUpdated: '2024',
    dataQuality: 5,
  },
  {
    id: 'iea',
    name: 'IEA Global Factors',
    description: 'International Energy Agency factors',
    recommended: false,
    coverage: 'Global',
    lastUpdated: '2023',
    dataQuality: 4,
  },
  {
    id: 'custom',
    name: 'Custom Factors',
    description: 'User-defined emission factors',
    recommended: false,
    coverage: 'Custom',
    lastUpdated: 'User-defined',
    dataQuality: 3,
  },
];

const DATA_QUALITY_APPROACHES = [
  {
    id: 'pcaf_standard',
    name: 'PCAF Standard (1-5 Scale)',
    description: 'Use PCAF data quality scoring methodology',
    recommended: true,
    compliance: 'PCAF Compliant',
    features: ['Standardized scoring', 'Industry benchmarks', 'Audit trail'],
  },
  {
    id: 'conservative',
    name: 'Conservative Approach',
    description: 'Apply conservative assumptions for missing data',
    recommended: false,
    compliance: 'Conservative',
    features: ['Higher estimates', 'Risk mitigation', 'Precautionary principle'],
  },
  {
    id: 'best_estimate',
    name: 'Best Estimate',
    description: 'Use most likely values based on available data',
    recommended: false,
    compliance: 'Best Estimate',
    features: ['Realistic estimates', 'Data-driven', 'Balanced approach'],
  },
];

const DEFAULT_VEHICLE_ASSUMPTIONS = {
  passengerCar: {
    activityBasis: 'distance',
    fuelType: 'gasoline',
    annualDistance: 15000,
    region: 'us',
  },
  suv: {
    activityBasis: 'distance',
    fuelType: 'gasoline',
    annualDistance: 15000,
    region: 'us',
  },
  lightTruck: {
    activityBasis: 'distance',
    fuelType: 'gasoline',
    annualDistance: 15000,
    region: 'us',
  },
  motorcycle: {
    activityBasis: 'distance',
    fuelType: 'gasoline',
    annualDistance: 8000,
    region: 'us',
  },
  bus: {
    activityBasis: 'distance',
    fuelType: 'diesel',
    annualDistance: 25000,
    region: 'us',
  },
  heavyTruck: {
    activityBasis: 'distance',
    fuelType: 'diesel',
    annualDistance: 50000,
    region: 'us',
  },
};

export function EnhancedMethodologyStep({ onComplete, initialData }: EnhancedMethodologyStepProps) {
  const [methodologyConfig, setMethodologyConfig] = useState<MethodologyConfig>({
    activityFactorSource: initialData?.activityFactorSource || '',
    dataQualityApproach: initialData?.dataQualityApproach || '',
    assumptionsValidated: initialData?.assumptionsValidated || false,
    vehicleAssumptions: initialData?.vehicleAssumptions || DEFAULT_VEHICLE_ASSUMPTIONS,
    customFactors: initialData?.customFactors || {},
    regionSpecificSettings: initialData?.regionSpecificSettings,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Using toast from sonner import

  // Real-time validation
  const validateConfiguration = useCallback(
    async (config: MethodologyConfig): Promise<ValidationError[]> => {
      const errors: ValidationError[] = [];

      // Validate activity factor source
      if (!config.activityFactorSource) {
        errors.push({
          field: 'activityFactorSource',
          message: 'Activity factor source is required',
          suggestion: 'EPA factors are recommended for US portfolios',
        });
      }

      // Validate data quality approach
      if (!config.dataQualityApproach) {
        errors.push({
          field: 'dataQualityApproach',
          message: 'Data quality approach is required',
          suggestion: 'PCAF Standard is recommended for compliance',
        });
      }

      // Validate vehicle assumptions
      Object.entries(config.vehicleAssumptions).forEach(([vehicleType, assumptions]) => {
        if (assumptions.annualDistance <= 0) {
          errors.push({
            field: `vehicleAssumptions.${vehicleType}.annualDistance`,
            message: `Invalid annual distance for ${vehicleType}`,
            suggestion: 'Annual distance must be greater than 0',
          });
        }

        if (assumptions.annualDistance > 100000) {
          errors.push({
            field: `vehicleAssumptions.${vehicleType}.annualDistance`,
            message: `Unusually high annual distance for ${vehicleType}`,
            suggestion: 'Consider reviewing this value - typical ranges are 8,000-50,000 miles',
          });
        }
      });

      // Validate custom factors if using custom source
      if (
        config.activityFactorSource === 'custom' &&
        (!config.customFactors || Object.keys(config.customFactors).length === 0)
      ) {
        errors.push({
          field: 'customFactors',
          message: 'Custom factors are required when using custom source',
          suggestion: 'Define emission factors for each fuel type',
        });
      }

      return errors;
    },
    []
  );

  // Generate suggestions based on current configuration
  const generateSuggestions = useCallback((config: MethodologyConfig): string[] => {
    const suggestions: string[] = [];

    // Source-specific suggestions
    if (config.activityFactorSource === 'epa') {
      suggestions.push('EPA factors are well-suited for US-based portfolios');
      suggestions.push('Consider regional electricity grid factors for electric vehicles');
    } else if (config.activityFactorSource === 'defra') {
      suggestions.push('DEFRA factors are optimized for UK/EU portfolios');
      suggestions.push('Ensure your portfolio geography aligns with these factors');
    } else if (config.activityFactorSource === 'custom') {
      suggestions.push('Document the source and methodology for custom factors');
      suggestions.push('Consider third-party verification for custom emission factors');
    }

    // Data quality approach suggestions
    if (config.dataQualityApproach === 'pcaf_standard') {
      suggestions.push('PCAF scoring provides standardized data quality assessment');
      suggestions.push('Lower scores (1-2) indicate higher data quality');
    } else if (config.dataQualityApproach === 'conservative') {
      suggestions.push('Conservative approach may result in higher emission estimates');
      suggestions.push('Consider documenting conservative assumptions for stakeholders');
    }

    // Vehicle-specific suggestions
    const highMileageVehicles = Object.entries(config.vehicleAssumptions)
      .filter(([, assumptions]) => assumptions.annualDistance > 30000)
      .map(([type]) => type);

    if (highMileageVehicles.length > 0) {
      suggestions.push(`High mileage assumptions detected for: ${highMileageVehicles.join(', ')}`);
    }

    return suggestions;
  }, []);

  // Real-time validation effect
  useEffect(() => {
    const validateAsync = async () => {
      setIsValidating(true);
      const errors = await validateConfiguration(methodologyConfig);
      const newSuggestions = generateSuggestions(methodologyConfig);

      setValidationErrors(errors);
      setSuggestions(newSuggestions);
      setIsValidating(false);
    };

    const debounceTimer = setTimeout(validateAsync, 300);
    return () => clearTimeout(debounceTimer);
  }, [methodologyConfig, validateConfiguration, generateSuggestions]);

  const updateConfig = (updates: Partial<MethodologyConfig>) => {
    setMethodologyConfig(prev => ({ ...prev, ...updates }));
  };

  const updateVehicleAssumption = (vehicleType: string, updates: Partial<VehicleAssumption>) => {
    setMethodologyConfig(prev => ({
      ...prev,
      vehicleAssumptions: {
        ...prev.vehicleAssumptions,
        [vehicleType]: {
          ...prev.vehicleAssumptions[vehicleType],
          ...updates,
        },
      },
    }));
  };

  const handleConfigComplete = async () => {
    const errors = await validateConfiguration(methodologyConfig);

    if (errors.length > 0) {
      toast.error(
        `Configuration Incomplete: Please fix ${errors.length} validation error(s) before proceeding.`
      );
      return;
    }

    if (!methodologyConfig.assumptionsValidated) {
      toast.error(
        'Validation Required: Please confirm that the methodology settings are appropriate.'
      );
      return;
    }

    toast.success('Methodology Configured: PCAF methodology configuration completed successfully.');

    onComplete(methodologyConfig);
  };

  const isConfigComplete =
    methodologyConfig.activityFactorSource &&
    methodologyConfig.dataQualityApproach &&
    methodologyConfig.assumptionsValidated &&
    validationErrors.length === 0;

  const getFieldError = (fieldName: string) =>
    validationErrors.find(error => error.field === fieldName);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Configure your PCAF methodology settings. These settings will be applied to all data
            processing. Real-time validation is active.
          </AlertDescription>
        </Alert>

        {/* Validation Status */}
        {isValidating && (
          <Alert>
            <Settings className="h-4 w-4 animate-spin" />
            <AlertDescription>Validating configuration...</AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">
                  {validationErrors.length} configuration error(s) need attention:
                </div>
                <ul className="space-y-1 text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{error.message}</div>
                        {error.suggestion && (
                          <div className="text-red-600/80 mt-1">{error.suggestion}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && validationErrors.length === 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Configuration suggestions:</div>
                <ul className="space-y-1 text-sm">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div>{suggestion}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Activity Factor Source */}
        <Card className={getFieldError('activityFactorSource') ? 'border-red-500' : ''}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Activity Factor Source
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the primary source for emission factors and activity data</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the primary source for emission factors and activity data
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACTIVITY_FACTOR_SOURCES.map(source => (
                <div
                  key={source.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    methodologyConfig.activityFactorSource === source.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => updateConfig({ activityFactorSource: source.id })}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        methodologyConfig.activityFactorSource === source.id
                          ? 'border-primary bg-primary'
                          : 'border-muted'
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{source.name}</h4>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {source.recommended && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Recommended
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {source.coverage}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Quality: {source.dataQuality}/5
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Quality Approach */}
        <Card className={getFieldError('dataQualityApproach') ? 'border-red-500' : ''}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Data Quality Approach
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose how to handle data quality assessment and scoring</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose how to handle data quality assessment and scoring
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DATA_QUALITY_APPROACHES.map(approach => (
                <div
                  key={approach.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    methodologyConfig.dataQualityApproach === approach.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => updateConfig({ dataQualityApproach: approach.id })}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        methodologyConfig.dataQualityApproach === approach.id
                          ? 'border-primary bg-primary'
                          : 'border-muted'
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{approach.name}</h4>
                      <p className="text-sm text-muted-foreground">{approach.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {approach.recommended && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Recommended
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {approach.compliance}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {approach.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Assumptions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Vehicle Type Assumptions
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Default assumptions for vehicle categories (can be customized per loan)</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure default assumptions for vehicle categories
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(methodologyConfig.vehicleAssumptions).map(
                ([vehicleType, assumptions]) => {
                  const fieldError = getFieldError(
                    `vehicleAssumptions.${vehicleType}.annualDistance`
                  );

                  return (
                    <div
                      key={vehicleType}
                      className={`p-4 border rounded-lg ${fieldError ? 'border-red-500' : ''}`}
                    >
                      <h4 className="font-medium capitalize mb-3">
                        {vehicleType.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`${vehicleType}-fuel`} className="text-sm">
                            Fuel Type
                          </Label>
                          <Select
                            value={assumptions.fuelType}
                            onValueChange={value =>
                              updateVehicleAssumption(vehicleType, { fuelType: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gasoline">Gasoline</SelectItem>
                              <SelectItem value="diesel">Diesel</SelectItem>
                              <SelectItem value="electric">Electric</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="cng">CNG</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`${vehicleType}-distance`} className="text-sm">
                            Annual Distance (miles)
                          </Label>
                          <Input
                            id={`${vehicleType}-distance`}
                            type="number"
                            value={assumptions.annualDistance}
                            onChange={e =>
                              updateVehicleAssumption(vehicleType, {
                                annualDistance: parseInt(e.target.value) || 0,
                              })
                            }
                            className={`mt-1 ${fieldError ? 'border-red-500' : ''}`}
                            min="1"
                            max="100000"
                          />
                          {fieldError && (
                            <p className="text-sm text-red-600 mt-1">{fieldError.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`${vehicleType}-region`} className="text-sm">
                            Region
                          </Label>
                          <Select
                            value={assumptions.region}
                            onValueChange={value =>
                              updateVehicleAssumption(vehicleType, { region: value })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="eu">European Union</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="global">Global Average</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Advanced Settings
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
              </Button>
            </CardTitle>
          </CardHeader>
          {showAdvancedSettings && (
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Advanced settings are optional and should only be modified by experienced users.
                  </AlertDescription>
                </Alert>

                {methodologyConfig.activityFactorSource === 'custom' && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Custom Emission Factors</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Gasoline (kg CO2/gallon)</Label>
                        <Input type="number" step="0.001" placeholder="8.887" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm">Diesel (kg CO2/gallon)</Label>
                        <Input type="number" step="0.001" placeholder="10.180" className="mt-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Configuration Validation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="assumptions-validated"
                  checked={methodologyConfig.assumptionsValidated}
                  onChange={e => updateConfig({ assumptionsValidated: e.target.checked })}
                  className="mt-1"
                />
                <label htmlFor="assumptions-validated" className="text-sm">
                  <div className="font-medium">
                    I confirm that these methodology settings are appropriate for my portfolio
                  </div>
                  <div className="text-muted-foreground mt-1">
                    These settings will be applied to all loan calculations. You can modify
                    individual loan assumptions later if needed.
                  </div>
                </label>
              </div>

              <Button
                onClick={handleConfigComplete}
                disabled={!isConfigComplete}
                className="w-full"
              >
                {isConfigComplete ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Methodology Configuration
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Complete Required Settings ({validationErrors.length} errors remaining)
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success State */}
        {isConfigComplete && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Methodology configuration is complete and validated. Click "Next" to proceed to data
              validation.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
}
