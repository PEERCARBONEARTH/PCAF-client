import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Puzzle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  TestTube,
  Monitor,
  RefreshCw,
  Play,
  Pause,
  Zap,
  Database,
  Globe,
  Key,
  Eye,
  RotateCcw
} from "lucide-react";

interface IntegrationConfig {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: "not-configured" | "configuring" | "testing" | "active" | "error" | "disabled";
  progress: number;
  health: "healthy" | "warning" | "critical" | "unknown";
  lastTested?: string;
  lastSync?: string;
  errorCount: number;
  requiredFields: {
    id: string;
    label: string;
    type: "text" | "password" | "url" | "number" | "boolean";
    value?: any;
    required: boolean;
    placeholder?: string;
    description?: string;
  }[];
  optionalFields: {
    id: string;
    label: string;
    type: "text" | "password" | "url" | "number" | "boolean";
    value?: any;
    placeholder?: string;
    description?: string;
  }[];
  testEndpoints: {
    id: string;
    name: string;
    description: string;
    status: "pending" | "testing" | "passed" | "failed";
    lastTested?: string;
    errorMessage?: string;
  }[];
  monitoring: {
    enabled: boolean;
    interval: number;
    alertsEnabled: boolean;
    healthChecks: string[];
  };
}

interface IntegrationWizardProps {
  integrations: IntegrationConfig[];
  onStartConfiguration: (integrationId: string) => void;
  onSaveConfiguration: (integrationId: string, config: Record<string, any>) => Promise<void>;
  onTestIntegration: (integrationId: string) => Promise<boolean>;
  onTestEndpoint: (integrationId: string, endpointId: string) => Promise<boolean>;
  onToggleIntegration: (integrationId: string, enabled: boolean) => void;
  onToggleMonitoring: (integrationId: string, enabled: boolean) => void;
  onRetryConnection: (integrationId: string) => Promise<void>;
}

export function IntegrationWizard({ integrations, onStartConfiguration, onSaveConfiguration, onTestIntegration, onTestEndpoint, onToggleIntegration, onToggleMonitoring, onRetryConnection }: IntegrationWizardProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [testingStates, setTestingStates] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: "select", title: "Select Integration", icon: <Puzzle className="h-4 w-4" /> },
    { id: "configure", title: "Configure Settings", icon: <Settings className="h-4 w-4" /> },
    { id: "test", title: "Test Connection", icon: <TestTube className="h-4 w-4" /> },
    { id: "monitor", title: "Setup Monitoring", icon: <Monitor className="h-4 w-4" /> },
    { id: "complete", title: "Activation", icon: <CheckCircle className="h-4 w-4" /> }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-success" />;
      case "testing": case "configuring": return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case "error": return <XCircle className="h-4 w-4 text-destructive" />;
      case "disabled": return <Pause className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy": return <CheckCircle className="h-3 w-3 text-success" />;
      case "warning": return <AlertTriangle className="h-3 w-3 text-warning" />;
      case "critical": return <XCircle className="h-3 w-3 text-destructive" />;
      default: return <AlertTriangle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "data-analytics": return <Database className="h-4 w-4" />;
      case "financial": return <Zap className="h-4 w-4" />;
      case "communication": return <Globe className="h-4 w-4" />;
      default: return <Puzzle className="h-4 w-4" />;
    }
  };

  const startConfigurationWizard = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setCurrentStep(integration.status === "not-configured" ? 1 : 2);
    
    // Initialize config values with existing values
    const initialValues: Record<string, any> = {};
    [...integration.requiredFields, ...integration.optionalFields].forEach(field => {
      initialValues[field.id] = field.value || "";
    });
    setConfigValues(initialValues);
    
    setShowConfigDialog(true);
    onStartConfiguration(integration.id);
  };

  const saveConfiguration = async () => {
    if (!selectedIntegration) return;
    
    setIsProcessing(true);
    try {
      await onSaveConfiguration(selectedIntegration.id, configValues);
      toast({
        title: "Configuration Saved",
        description: "Integration settings have been saved successfully.",
      });
      setCurrentStep(2); // Move to testing step
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save configuration. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const testIntegration = async () => {
    if (!selectedIntegration) return;
    
    setIsProcessing(true);
    try {
      const success = await onTestIntegration(selectedIntegration.id);
      if (success) {
        toast({
          title: "Test Successful",
          description: "Integration is working correctly and ready for activation.",
        });
        setCurrentStep(3); // Move to monitoring step
      } else {
        toast({
          title: "Test Failed",
          description: "Integration test failed. Please check configuration and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Unable to test integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const testEndpoint = async (endpointId: string) => {
    if (!selectedIntegration) return;
    
    setTestingStates(prev => ({ ...prev, [endpointId]: true }));
    try {
      const success = await onTestEndpoint(selectedIntegration.id, endpointId);
      toast({
        title: success ? "Endpoint Test Passed" : "Endpoint Test Failed",
        description: success ? 
          "Endpoint is responding correctly." : 
          "Endpoint test failed. Check configuration.",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Unable to test endpoint.",
        variant: "destructive",
      });
    } finally {
      setTestingStates(prev => ({ ...prev, [endpointId]: false }));
    }
  };

  const completeSetup = () => {
    if (!selectedIntegration) return;
    
    onToggleIntegration(selectedIntegration.id, true);
    toast({
      title: "Integration Activated!",
      description: `${selectedIntegration.name} is now active and being monitored.`,
    });
    setShowConfigDialog(false);
    setSelectedIntegration(null);
    setCurrentStep(0);
  };

  const activeIntegrations = integrations.filter(i => i.status === "active");
  const errorIntegrations = integrations.filter(i => i.status === "error");
  const notConfiguredIntegrations = integrations.filter(i => i.status === "not-configured");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Integration Setup Wizard</h2>
          <p className="text-sm text-muted-foreground">
            Configure, test, and monitor third-party integrations with guided workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            {activeIntegrations.length} Active
          </Badge>
          {errorIntegrations.length > 0 && (
            <Badge variant="destructive">
              {errorIntegrations.length} Errors
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-lg font-bold">{activeIntegrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium">Errors</p>
                <p className="text-lg font-bold">{errorIntegrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Not Configured</p>
                <p className="text-lg font-bold">{notConfiguredIntegrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Monitor className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Monitored</p>
                <p className="text-lg font-bold">{integrations.filter(i => i.monitoring.enabled).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getCategoryIcon(integration.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{integration.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(integration.status)}
                  <Badge variant={integration.status === "active" ? "default" : integration.status === "error" ? "destructive" : "secondary"}>
                    {integration.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Bar for Configuration */}
              {integration.status === "configuring" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Configuration Progress</span>
                    <span>{integration.progress}%</span>
                  </div>
                  <Progress value={integration.progress} className="h-2" />
                </div>
              )}

              {/* Health Status */}
              {integration.status === "active" && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    {getHealthIcon(integration.health)}
                    <span className="text-sm font-medium">Health: {integration.health}</span>
                  </div>
                  {integration.lastSync && (
                    <span className="text-xs text-muted-foreground">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Error Information */}
              {integration.status === "error" && integration.errorCount > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">
                    {integration.errorCount} errors detected
                  </p>
                  <p className="text-xs text-destructive/80 mt-1">
                    Last attempt: {integration.lastTested ? new Date(integration.lastTested).toLocaleString() : "Never"}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {integration.status === "not-configured" && (
                  <Button onClick={() => startConfigurationWizard(integration)}>
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                )}
                
                {integration.status === "error" && (
                  <Button 
                    variant="outline" 
                    onClick={() => onRetryConnection(integration.id)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
                
                {(integration.status === "active" || integration.status === "error") && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => startConfigurationWizard(integration)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onToggleIntegration(integration.id, integration.status !== "active")}
                    >
                      {integration.status === "active" ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                      {integration.status === "active" ? "Disable" : "Enable"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Wizard Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration?.name} - Setup Wizard
            </DialogTitle>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      index === currentStep ? "bg-primary text-primary-foreground" :
                      index < currentStep ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                    }`}>
                      {step.icon}
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-border" />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <Tabs value={steps[currentStep]?.id} className="w-full">
                {/* Configure Step */}
                <TabsContent value="configure" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Required Configuration</h3>
                    {selectedIntegration.requiredFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                          {field.label}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        {field.description && (
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        )}
                        {field.type === "boolean" ? (
                          <Switch
                            id={field.id}
                            checked={configValues[field.id] || false}
                            onCheckedChange={(checked) => 
                              setConfigValues(prev => ({ ...prev, [field.id]: checked }))
                            }
                          />
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
                            value={configValues[field.id] || ""}
                            onChange={(e) => 
                              setConfigValues(prev => ({ ...prev, [field.id]: e.target.value }))
                            }
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}

                    {selectedIntegration.optionalFields.length > 0 && (
                      <>
                        <h3 className="font-medium text-foreground mt-6">Optional Settings</h3>
                        {selectedIntegration.optionalFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.id}>{field.label}</Label>
                            {field.description && (
                              <p className="text-xs text-muted-foreground">{field.description}</p>
                            )}
                            <Input
                              id={field.id}
                              type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
                              value={configValues[field.id] || ""}
                              onChange={(e) => 
                                setConfigValues(prev => ({ ...prev, [field.id]: e.target.value }))
                              }
                              placeholder={field.placeholder}
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <Button onClick={saveConfiguration} disabled={isProcessing}>
                      Save & Continue
                    </Button>
                    <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </TabsContent>

                {/* Test Step */}
                <TabsContent value="test" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Connection Testing</h3>
                    <p className="text-sm text-muted-foreground">
                      Test your integration to ensure it's working correctly before activation.
                    </p>
                    
                    <div className="space-y-3">
                      {selectedIntegration.testEndpoints.map((endpoint) => (
                        <div key={endpoint.id} className="p-3 rounded-lg border border-border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">{endpoint.name}</h4>
                              <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                endpoint.status === "passed" ? "default" : 
                                endpoint.status === "failed" ? "destructive" : 
                                "secondary"
                              }>
                                {endpoint.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => testEndpoint(endpoint.id)}
                                disabled={testingStates[endpoint.id]}
                              >
                                {testingStates[endpoint.id] ? "Testing..." : "Test"}
                              </Button>
                            </div>
                          </div>
                          {endpoint.errorMessage && (
                            <p className="text-xs text-destructive mt-2">{endpoint.errorMessage}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <Button onClick={testIntegration} disabled={isProcessing}>
                      Run Full Test
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Skip to Monitoring
                    </Button>
                  </div>
                </TabsContent>

                {/* Monitor Step */}
                <TabsContent value="monitor" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Monitoring Setup</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure monitoring and alerting for this integration.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Enable Monitoring</p>
                          <p className="text-sm text-muted-foreground">Monitor integration health and performance</p>
                        </div>
                        <Switch
                          checked={selectedIntegration.monitoring.enabled}
                          onCheckedChange={(enabled) => onToggleMonitoring(selectedIntegration.id, enabled)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Check Interval (minutes)</Label>
                        <Select defaultValue={selectedIntegration.monitoring.interval.toString()}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <Button onClick={() => setCurrentStep(4)}>
                      Continue to Activation
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back to Testing
                    </Button>
                  </div>
                </TabsContent>

                {/* Complete Step */}
                <TabsContent value="complete" className="space-y-4">
                  <div className="text-center space-y-4">
                    <CheckCircle className="h-12 w-12 text-success mx-auto" />
                    <h3 className="font-medium text-foreground">Ready for Activation</h3>
                    <p className="text-sm text-muted-foreground">
                      Your integration is configured, tested, and ready to go live.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4 justify-center">
                    <Button onClick={completeSetup}>
                      Activate Integration
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back to Monitoring
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}