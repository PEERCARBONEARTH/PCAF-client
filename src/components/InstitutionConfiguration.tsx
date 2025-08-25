import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Globe,
  FileText,
  Settings,
  Save,
  RotateCcw,
  Info,
  CheckCircle,
  Upload
} from "lucide-react";

export interface InstitutionConfig {
  // Basic Information
  institutionName: string;
  institutionType: 'commercial_bank' | 'development_bank' | 'microfinance' | 'credit_union' | 'other';
  country: string;
  region: string;
  
  // Contact & Branding
  contactEmail: string;
  website: string;
  logoUrl: string;
  
  // Reporting Preferences
  defaultReportingPeriod: string;
  fiscalYearEnd: string;
  includeMethodology: boolean;
  includeBranding: boolean;
  includeDisclaimer: boolean;
  
  // PCAF Configuration
  pcafMembershipNumber: string;
  dataQualityThreshold: number;
  complianceLevel: 'basic' | 'enhanced' | 'premium';
  
  // Regional Settings
  currency: string;
  distanceUnit: 'km' | 'miles';
  emissionUnit: 'tonnes' | 'kg';
  
  // Custom Fields
  customNotes: string;
  regulatoryFramework: string;
  
  // Advanced Settings
  enableAPIAccess: boolean;
  enableWebhooks: boolean;
  autoGenerateReports: boolean;
  
  // Metadata
  lastUpdated: string;
  createdBy: string;
}

const defaultConfig: InstitutionConfig = {
  institutionName: '',
  institutionType: 'commercial_bank',
  country: 'Kenya',
  region: 'East Africa',
  contactEmail: '',
  website: '',
  logoUrl: '',
  defaultReportingPeriod: '2024',
  fiscalYearEnd: 'December',
  includeMethodology: true,
  includeBranding: true,
  includeDisclaimer: true,
  pcafMembershipNumber: '',
  dataQualityThreshold: 3,
  complianceLevel: 'enhanced',
  currency: 'USD',
  distanceUnit: 'km',
  emissionUnit: 'tonnes',
  customNotes: '',
  regulatoryFramework: '',
  enableAPIAccess: false,
  enableWebhooks: false,
  autoGenerateReports: false,
  lastUpdated: new Date().toISOString(),
  createdBy: 'system'
};

export function InstitutionConfiguration() {
  const { toast } = useToast();
  const [config, setConfig] = useState<InstitutionConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('institution_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading saved configuration:', error);
      }
    }
  }, []);

  const updateConfig = (field: keyof InstitutionConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const updatedConfig = {
        ...config,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('institution_config', JSON.stringify(updatedConfig));
      setConfig(updatedConfig);
      setHasChanges(false);
      
      toast({
        title: "Configuration Saved",
        description: "Institution settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetConfiguration = () => {
    setConfig(defaultConfig);
    setHasChanges(true);
    toast({
      title: "Configuration Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const countries = [
    'Kenya', 'Ghana', 'Rwanda', 'Nigeria', 'Tanzania', 'Uganda', 'Zambia', 'Malawi', 'Global'
  ];

  const currencies = [
    'USD', 'KES', 'GHS', 'RWF', 'NGN', 'TZS', 'UGX', 'ZMW', 'MWK', 'EUR', 'GBP'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Institution Configuration
          </CardTitle>
          <CardDescription>
            Configure your institution settings for PCAF-compliant reporting and API integration
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <CardDescription>
            Core institution details that will appear on all reports and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institutionName">Institution Name *</Label>
              <Input
                id="institutionName"
                placeholder="e.g., Kenya Commercial Bank"
                value={config.institutionName}
                onChange={(e) => updateConfig('institutionName', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This name will appear on all generated reports and documentation
              </p>
            </div>
            
            <div>
              <Label htmlFor="institutionType">Institution Type</Label>
              <Select value={config.institutionType} onValueChange={(value: any) => updateConfig('institutionType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial_bank">Commercial Bank</SelectItem>
                  <SelectItem value="development_bank">Development Bank</SelectItem>
                  <SelectItem value="microfinance">Microfinance Institution</SelectItem>
                  <SelectItem value="credit_union">Credit Union</SelectItem>
                  <SelectItem value="other">Other Financial Institution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={config.country} onValueChange={(value) => updateConfig('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="sustainability@institution.com"
                value={config.contactEmail}
                onChange={(e) => updateConfig('contactEmail', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reporting Configuration</CardTitle>
          <CardDescription>
            Default settings for generated reports and compliance documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="defaultReportingPeriod">Default Reporting Period</Label>
              <Input
                id="defaultReportingPeriod"
                placeholder="2024"
                value={config.defaultReportingPeriod}
                onChange={(e) => updateConfig('defaultReportingPeriod', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={config.currency} onValueChange={(value) => updateConfig('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
              <Select value={config.fiscalYearEnd} onValueChange={(value) => updateConfig('fiscalYearEnd', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fiscal year end" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="December">December</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includeMethodology">Include PCAF Methodology</Label>
                <p className="text-xs text-muted-foreground">Add methodology section to reports</p>
              </div>
              <Switch
                id="includeMethodology"
                checked={config.includeMethodology}
                onCheckedChange={(checked) => updateConfig('includeMethodology', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includeBranding">Include Institution Branding</Label>
                <p className="text-xs text-muted-foreground">Add logo and branding to reports</p>
              </div>
              <Switch
                id="includeBranding"
                checked={config.includeBranding}
                onCheckedChange={(checked) => updateConfig('includeBranding', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includeDisclaimer">Include Compliance Disclaimer</Label>
                <p className="text-xs text-muted-foreground">Add regulatory disclaimer to reports</p>
              </div>
              <Switch
                id="includeDisclaimer"
                checked={config.includeDisclaimer}
                onCheckedChange={(checked) => updateConfig('includeDisclaimer', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PCAF Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">PCAF Configuration</CardTitle>
          <CardDescription>
            Partnership for Carbon Accounting Financials specific settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pcafMembershipNumber">PCAF Membership Number (Optional)</Label>
              <Input
                id="pcafMembershipNumber"
                placeholder="PCAF-2024-001234"
                value={config.pcafMembershipNumber}
                onChange={(e) => updateConfig('pcafMembershipNumber', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="complianceLevel">Compliance Level</Label>
              <Select value={config.complianceLevel} onValueChange={(value: any) => updateConfig('complianceLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select compliance level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - Core requirements</SelectItem>
                  <SelectItem value="enhanced">Enhanced - Additional metrics</SelectItem>
                  <SelectItem value="premium">Premium - Full audit trail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dataQualityThreshold">Data Quality Threshold (1-5 PCAF Scale)</Label>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={config.dataQualityThreshold}
                onChange={(e) => updateConfig('dataQualityThreshold', parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline">{config.dataQualityThreshold}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Loans below this threshold will be flagged for data quality review
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API & Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API & Integration Settings</CardTitle>
          <CardDescription>
            Configure API access and webhook integration with your loan management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableAPIAccess">Enable API Access</Label>
                <p className="text-xs text-muted-foreground">Allow external systems to access loan data</p>
              </div>
              <Switch
                id="enableAPIAccess"
                checked={config.enableAPIAccess}
                onCheckedChange={(checked) => updateConfig('enableAPIAccess', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableWebhooks">Enable Webhooks</Label>
                <p className="text-xs text-muted-foreground">Receive real-time loan approvals from LMS</p>
              </div>
              <Switch
                id="enableWebhooks"
                checked={config.enableWebhooks}
                onCheckedChange={(checked) => updateConfig('enableWebhooks', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoGenerateReports">Auto-Generate Reports</Label>
                <p className="text-xs text-muted-foreground">Automatically generate monthly reports</p>
              </div>
              <Switch
                id="autoGenerateReports"
                checked={config.autoGenerateReports}
                onCheckedChange={(checked) => updateConfig('autoGenerateReports', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customNotes">Custom Notes</Label>
            <Textarea
              id="customNotes"
              placeholder="Add any additional notes or context for your institution's reporting requirements..."
              value={config.customNotes}
              onChange={(e) => updateConfig('customNotes', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="regulatoryFramework">Regulatory Framework</Label>
            <Input
              id="regulatoryFramework"
              placeholder="e.g., Central Bank of Kenya Climate Risk Guidelines"
              value={config.regulatoryFramework}
              onChange={(e) => updateConfig('regulatoryFramework', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetConfiguration}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <div className="flex gap-3">
              {hasChanges && (
                <Badge variant="secondary">Unsaved Changes</Badge>
              )}
              <Button
                onClick={saveConfiguration}
                disabled={saving || !config.institutionName}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Institution Name Requirement:</strong> The institution name is required for all PCAF reports 
          as it identifies the reporting entity in compliance documentation. This ensures proper attribution 
          and regulatory compliance for financed emissions reporting. All other fields can be configured 
          based on your specific reporting requirements and regulatory framework.
        </AlertDescription>
      </Alert>
    </div>
  );
}