import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, 
  Calendar, 
  FileText, 
  Palette, 
  Brain, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Target,
  Filter,
  Download,
  Sparkles
} from "lucide-react";

interface ReportConfig {
  // Step 1: Portfolio Selection
  portfolioFilter: {
    dateRange: { start: string; end: string };
    loanTypes: string[];
    geographicRegions: string[];
    minimumAmount: string;
  };
  // Step 2: PCAF Methodology
  methodology: {
    emissionFactorSource: string;
    attributionMethod: string;
    dataQualityThreshold: number;
    includeScopeBreakdown: boolean;
  };
  // Step 3: Output Preferences
  output: {
    formats: string[];
    branding: {
      institutionName: string;
      logo: boolean;
      customColors: boolean;
    };
    distribution: {
      email: string[];
      automaticScheduling: boolean;
    };
  };
  // Step 4: AI Enhancement
  aiSettings: {
    enabled: boolean;
    narrativeDepth: 'standard' | 'detailed' | 'executive';
    complianceFocus: string[];
    customPrompts: string;
  };
}

export function ReportConfigurationWizard({ onConfigUpdate }: { onConfigUpdate: (config: ReportConfig) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<ReportConfig>({
    portfolioFilter: {
      dateRange: { start: '2024-01-01', end: '2024-12-31' },
      loanTypes: ['motor-vehicle'],
      geographicRegions: ['all'],
      minimumAmount: '0'
    },
    methodology: {
      emissionFactorSource: 'pcaf-2024',
      attributionMethod: 'outstanding-amount',
      dataQualityThreshold: 3,
      includeScopeBreakdown: true
    },
    output: {
      formats: ['pdf'],
      branding: {
        institutionName: '',
        logo: true,
        customColors: false
      },
      distribution: {
        email: [],
        automaticScheduling: false
      }
    },
    aiSettings: {
      enabled: true,
      narrativeDepth: 'standard',
      complianceFocus: ['pcaf-compliance', 'data-quality'],
      customPrompts: ''
    }
  });

  const steps = [
    { 
      id: 'portfolio', 
      title: 'Portfolio Selection', 
      icon: Filter,
      description: 'Define the scope and filters for your report'
    },
    { 
      id: 'methodology', 
      title: 'PCAF Methodology', 
      icon: Target,
      description: 'Configure emission factors and calculation methods'
    },
    { 
      id: 'output', 
      title: 'Output Preferences', 
      icon: FileText,
      description: 'Set formats, branding, and distribution options'
    },
    { 
      id: 'ai', 
      title: 'AI Enhancement', 
      icon: Brain,
      description: 'Configure AI-powered narratives and insights'
    }
  ];

  const updateConfig = (section: keyof ReportConfig, updates: any) => {
    const newConfig = {
      ...config,
      [section]: { ...config[section], ...updates }
    };
    setConfig(newConfig);
    onConfigUpdate(newConfig);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepProgress = () => ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="card-featured">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Report Configuration Wizard</CardTitle>
          </div>
          <Badge variant="outline" className="text-sm">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <CardDescription>
          Configure your PCAF financed emissions report with guided setup
        </CardDescription>
        <Progress value={getStepProgress()} className="h-2" />
      </CardHeader>
      
      <CardContent>
        {/* Step Navigation */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : isCompleted 
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-muted/20 text-muted-foreground border border-border/20'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium hidden md:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Portfolio Selection & Filtering</h3>
                <p className="text-muted-foreground">Define which loans to include in your report</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Reporting Period Start</Label>
                  <Input 
                    type="date" 
                    value={config.portfolioFilter.dateRange.start}
                    onChange={(e) => updateConfig('portfolioFilter', {
                      dateRange: { ...config.portfolioFilter.dateRange, start: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Reporting Period End</Label>
                  <Input 
                    type="date" 
                    value={config.portfolioFilter.dateRange.end}
                    onChange={(e) => updateConfig('portfolioFilter', {
                      dateRange: { ...config.portfolioFilter.dateRange, end: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Loan Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['motor-vehicle', 'commercial-vehicle', 'motorcycle', 'electric-vehicle'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type}
                        checked={config.portfolioFilter.loanTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          const newTypes = checked 
                            ? [...config.portfolioFilter.loanTypes, type]
                            : config.portfolioFilter.loanTypes.filter(t => t !== type);
                          updateConfig('portfolioFilter', { loanTypes: newTypes });
                        }}
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Minimum Loan Amount (USD)</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={config.portfolioFilter.minimumAmount}
                  onChange={(e) => updateConfig('portfolioFilter', { minimumAmount: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">PCAF Methodology Configuration</h3>
                <p className="text-muted-foreground">Set emission factors and calculation parameters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Emission Factor Source</Label>
                  <Select 
                    value={config.methodology.emissionFactorSource}
                    onValueChange={(value) => updateConfig('methodology', { emissionFactorSource: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcaf-2024">PCAF Standard 2024</SelectItem>
                      <SelectItem value="pcaf-2023">PCAF Standard 2023</SelectItem>
                      <SelectItem value="custom">Custom Factors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Attribution Method</Label>
                  <Select 
                    value={config.methodology.attributionMethod}
                    onValueChange={(value) => updateConfig('methodology', { attributionMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outstanding-amount">Outstanding Amount</SelectItem>
                      <SelectItem value="committed-amount">Committed Amount</SelectItem>
                      <SelectItem value="drawn-amount">Drawn Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Data Quality Threshold: Score {config.methodology.dataQualityThreshold}</Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={config.methodology.dataQualityThreshold}
                  onChange={(e) => updateConfig('methodology', { dataQualityThreshold: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 (Estimated)</span>
                  <span>3 (Partial)</span>
                  <span>5 (Actual)</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scope-breakdown"
                  checked={config.methodology.includeScopeBreakdown}
                  onCheckedChange={(checked) => updateConfig('methodology', { includeScopeBreakdown: checked })}
                />
                <Label htmlFor="scope-breakdown">Include detailed scope breakdown analysis</Label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Output Preferences</h3>
                <p className="text-muted-foreground">Configure formats, branding, and distribution</p>
              </div>

              <div>
                <Label className="mb-3 block">Report Formats</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['pdf', 'excel', 'word', 'powerpoint'].map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox 
                        id={format}
                        checked={config.output.formats.includes(format)}
                        onCheckedChange={(checked) => {
                          const newFormats = checked 
                            ? [...config.output.formats, format]
                            : config.output.formats.filter(f => f !== format);
                          updateConfig('output', { formats: newFormats });
                        }}
                      />
                      <Label htmlFor={format} className="text-sm">
                        {format.toUpperCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Institution Name</Label>
                <Input 
                  placeholder="Enter your institution name"
                  value={config.output.branding.institutionName}
                  onChange={(e) => updateConfig('output', {
                    branding: { ...config.output.branding, institutionName: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-logo"
                    checked={config.output.branding.logo}
                    onCheckedChange={(checked) => updateConfig('output', {
                      branding: { ...config.output.branding, logo: checked }
                    })}
                  />
                  <Label htmlFor="include-logo">Include institution logo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="custom-colors"
                    checked={config.output.branding.customColors}
                    onCheckedChange={(checked) => updateConfig('output', {
                      branding: { ...config.output.branding, customColors: checked }
                    })}
                  />
                  <Label htmlFor="custom-colors">Use custom brand colors</Label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">AI Enhancement Configuration</h3>
                <p className="text-muted-foreground">Customize AI-powered narratives and insights</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enable-ai"
                  checked={config.aiSettings.enabled}
                  onCheckedChange={(checked) => updateConfig('aiSettings', { enabled: checked })}
                />
                <Label htmlFor="enable-ai" className="font-medium">Enable AI-powered report enhancement</Label>
              </div>

              {config.aiSettings.enabled && (
                <>
                  <div>
                    <Label>Narrative Depth</Label>
                    <Select 
                      value={config.aiSettings.narrativeDepth}
                      onValueChange={(value) => updateConfig('aiSettings', { narrativeDepth: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard - Balanced insights</SelectItem>
                        <SelectItem value="detailed">Detailed - Comprehensive analysis</SelectItem>
                        <SelectItem value="executive">Executive - High-level summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-3 block">Compliance Focus Areas</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['pcaf-compliance', 'data-quality', 'trend-analysis', 'risk-assessment'].map((focus) => (
                        <div key={focus} className="flex items-center space-x-2">
                          <Checkbox 
                            id={focus}
                            checked={config.aiSettings.complianceFocus.includes(focus)}
                            onCheckedChange={(checked) => {
                              const newFocus = checked 
                                ? [...config.aiSettings.complianceFocus, focus]
                                : config.aiSettings.complianceFocus.filter(f => f !== focus);
                              updateConfig('aiSettings', { complianceFocus: newFocus });
                            }}
                          />
                          <Label htmlFor={focus} className="text-sm">
                            {focus.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Custom AI Prompts (Optional)</Label>
                    <Textarea 
                      placeholder="Add specific instructions for AI narrative generation..."
                      value={config.aiSettings.customPrompts}
                      onChange={(e) => updateConfig('aiSettings', { customPrompts: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border/20">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? (
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Generate Report
                <Sparkles className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}