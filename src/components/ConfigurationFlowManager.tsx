import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Save, 
  RotateCcw, 
  TestTube, 
  Shield,
  Database,
  Bell,
  Users,
  Eye
} from "lucide-react";

interface ConfigurationSetting {
  id: string;
  category: string;
  title: string;
  description: string;
  type: "text" | "textarea" | "number" | "boolean" | "select" | "multi-select";
  value: any;
  defaultValue: any;
  options?: { label: string; value: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  dependencies?: string[];
  isAdvanced?: boolean;
}

interface ConfigurationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  settings: ConfigurationSetting[];
  requiresRestart?: boolean;
  hasChanges?: boolean;
}

interface ConfigurationFlowManagerProps {
  categories: ConfigurationCategory[];
  onSave: (categoryId: string, settings: Record<string, any>) => Promise<void>;
  onTest: (categoryId: string, settings: Record<string, any>) => Promise<boolean>;
  onReset: (categoryId: string) => void;
}

export function ConfigurationFlowManager({ categories, onSave, onTest, onReset }: ConfigurationFlowManagerProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    categories.forEach(category => {
      category.settings.forEach(setting => {
        initial[setting.id] = setting.value;
      });
    });
    return initial;
  });
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'save' | 'reset'; categoryId: string } | null>(null);
  const { toast } = useToast();

  const updateSetting = (settingId: string, value: any) => {
    setSettings(prev => ({ ...prev, [settingId]: value }));
  };

  const getCurrentCategory = () => categories.find(c => c.id === activeCategory);

  const hasUnsavedChanges = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return false;
    
    return category.settings.some(setting => 
      settings[setting.id] !== setting.value
    );
  };

  const validateSettings = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { isValid: true, errors: [] };

    const errors: string[] = [];
    
    category.settings.forEach(setting => {
      const value = settings[setting.id];
      const validation = setting.validation;
      
      if (validation?.required && (!value || value === '')) {
        errors.push(`${setting.title} is required`);
      }
      
      if (validation?.min && typeof value === 'number' && value < validation.min) {
        errors.push(`${setting.title} must be at least ${validation.min}`);
      }
      
      if (validation?.max && typeof value === 'number' && value > validation.max) {
        errors.push(`${setting.title} must be at most ${validation.max}`);
      }
      
      if (validation?.pattern && typeof value === 'string') {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push(`${setting.title} format is invalid`);
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleSave = async (categoryId: string) => {
    const validation = validateSettings(categoryId);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const categorySettings = categories.find(c => c.id === categoryId)?.settings || [];
      const categoryValues: Record<string, any> = {};
      categorySettings.forEach(setting => {
        categoryValues[setting.id] = settings[setting.id];
      });

      await onSave(categoryId, categoryValues);
      
      toast({
        title: "Settings Saved",
        description: "Configuration has been saved and applied successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed", 
        description: "Unable to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTest = async (categoryId: string) => {
    const validation = validateSettings(categoryId);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix validation errors before testing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const categorySettings = categories.find(c => c.id === categoryId)?.settings || [];
      const categoryValues: Record<string, any> = {};
      categorySettings.forEach(setting => {
        categoryValues[setting.id] = settings[setting.id];
      });

      const testPassed = await onTest(categoryId, categoryValues);
      setTestResults(prev => ({ ...prev, [categoryId]: testPassed }));
      
      toast({
        title: testPassed ? "Test Passed" : "Test Failed",
        description: testPassed ? 
          "Configuration test completed successfully." : 
          "Configuration test failed. Please check your settings.",
        variant: testPassed ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Unable to test configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    category.settings.forEach(setting => {
      setSettings(prev => ({ ...prev, [setting.id]: setting.defaultValue }));
    });

    onReset(categoryId);
    setTestResults(prev => ({ ...prev, [categoryId]: false }));
    
    toast({
      title: "Settings Reset",
      description: "Configuration has been reset to default values.",
    });
  };

  const confirmAction = (type: 'save' | 'reset', categoryId: string) => {
    setPendingAction({ type, categoryId });
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;
    
    if (pendingAction.type === 'save') {
      await handleSave(pendingAction.categoryId);
    } else {
      handleReset(pendingAction.categoryId);
    }
    
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const renderSettingInput = (setting: ConfigurationSetting) => {
    const value = settings[setting.id];

    switch (setting.type) {
      case "text":
      case "number":
        return (
          <Input
            type={setting.type}
            value={value || ''}
            onChange={(e) => updateSetting(setting.id, setting.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
            placeholder={`Enter ${setting.title.toLowerCase()}...`}
          />
        );
      
      case "textarea":
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            placeholder={`Enter ${setting.title.toLowerCase()}...`}
            className="min-h-[80px]"
          />
        );
      
      case "boolean":
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => updateSetting(setting.id, checked)}
          />
        );
      
      case "select":
        return (
          <Select value={value || ''} onValueChange={(newValue) => updateSetting(setting.id, newValue)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${setting.title.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return <Input value={value || ''} onChange={(e) => updateSetting(setting.id, e.target.value)} />;
    }
  };

  const currentCategory = getCurrentCategory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Configuration Center</h2>
          <p className="text-sm text-muted-foreground">
            Manage system settings with validation and testing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="advanced-mode" className="text-sm">Advanced Mode</Label>
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
            />
          </div>
        </div>
      </div>

      {/* Main Configuration Interface */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.icon}
              <span className="hidden sm:inline">{category.title}</span>
              {hasUnsavedChanges(category.id) && (
                <div className="w-2 h-2 bg-warning rounded-full" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {/* Category Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-sm text-primary">
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults[category.id] && (
                      <Badge variant="outline" className="status-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Tested
                      </Badge>
                    )}
                    {hasUnsavedChanges(category.id) && (
                      <Badge variant="outline" className="status-warning">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Unsaved
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Settings */}
            <Card>
              <CardContent className="p-6 space-y-6">
                {category.settings
                  .filter(setting => isAdvancedMode || !setting.isAdvanced)
                  .map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor={setting.id} className="font-medium">
                            {setting.title}
                            {setting.validation?.required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                            {setting.isAdvanced && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Advanced
                              </Badge>
                            )}
                          </Label>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        {setting.type === "boolean" && renderSettingInput(setting)}
                      </div>
                      {setting.type !== "boolean" && renderSettingInput(setting)}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleTest(category.id)}
                      disabled={isProcessing || !hasUnsavedChanges(category.id)}
                      variant="outline"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Configuration
                    </Button>
                    <Button
                      onClick={() => confirmAction('reset', category.id)}
                      disabled={isProcessing}
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    {category.requiresRestart && hasUnsavedChanges(category.id) && (
                      <p className="text-sm text-warning">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Requires restart
                      </p>
                    )}
                    <Button
                      onClick={() => confirmAction('save', category.id)}
                      disabled={isProcessing || !hasUnsavedChanges(category.id)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save & Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.type === 'save' ? 'Save Configuration' : 'Reset Configuration'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {pendingAction?.type === 'save' 
                ? 'Are you sure you want to save these configuration changes? This will apply the new settings immediately.'
                : 'Are you sure you want to reset this configuration to default values? All current changes will be lost.'
              }
            </p>
            {currentCategory?.requiresRestart && pendingAction?.type === 'save' && (
              <div className="p-3 rounded-sm bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  This configuration requires a system restart to take effect.
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 pt-4">
              <Button onClick={executeAction} disabled={isProcessing}>
                {pendingAction?.type === 'save' ? 'Save Changes' : 'Reset Configuration'}
              </Button>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}