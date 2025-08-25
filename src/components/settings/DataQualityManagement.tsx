import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Shield, Zap, Database, Fuel, Factory } from "lucide-react";
import { SampleDataManager } from "@/components/SampleDataManager";

interface DataQualityManagementProps {
  activeSubsection?: string;
}

export function DataQualityManagement({ activeSubsection }: DataQualityManagementProps) {
  const renderDataSourcesSection = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Data Sources & Upload Configuration
          </CardTitle>
          <CardDescription>
            Configure data upload settings and validation rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
              <Input 
                id="max-file-size" 
                placeholder="50"
                defaultValue="50"
                type="number"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="allowed-formats">Allowed File Formats</Label>
              <Select defaultValue="csv-xlsx">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv-xlsx">CSV, XLSX</SelectItem>
                  <SelectItem value="csv-only">CSV Only</SelectItem>
                  <SelectItem value="xlsx-only">XLSX Only</SelectItem>
                  <SelectItem value="all-formats">All Formats</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label>Auto-validation on Upload</Label>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Automatically validate data quality upon upload
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label>Duplicate Detection</Label>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Flag potential duplicate entries during upload
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Save Upload Settings</Button>
          </div>
        </CardContent>
      </Card>

      <SampleDataManager />
    </>
  );

  const renderQualityRulesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Quality Rules & Thresholds
        </CardTitle>
        <CardDescription>
          Configure quality scoring and validation thresholds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-quality-score">Minimum Quality Score</Label>
            <Input 
              id="min-quality-score" 
              placeholder="3"
              defaultValue="3"
              type="number"
              min="1"
              max="5"
            />
            <p className="text-xs text-muted-foreground">
              Minimum PCAF quality score (1-5 scale)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fallback-scoring">Fallback Scoring Method</Label>
            <Select defaultValue="conservative">
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative (Higher Score)</SelectItem>
                <SelectItem value="optimistic">Optimistic (Lower Score)</SelectItem>
                <SelectItem value="average">Industry Average</SelectItem>
                <SelectItem value="reject">Reject Low Quality Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Physical Activity Data</Label>
              <p className="text-sm text-muted-foreground">
                Mandate physical activity data for calculations
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-flag Outliers</Label>
              <p className="text-sm text-muted-foreground">
                Automatically flag statistical outliers for review
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Quality Rules</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmissionFactorsSection = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Vehicle Category Emission Factors
          </CardTitle>
          <CardDescription>
            Review and override PCAF default emission factors for vehicle categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border">
            <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/50 font-medium">
              <div>Vehicle Type</div>
              <div>Default EF (kg CO₂e/km)</div>
              <div>Override EF</div>
              <div>Status</div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 p-4 border-b items-center">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Diesel Vehicles
              </div>
              <div className="text-muted-foreground">0.171</div>
              <Input placeholder="Enter override value" className="w-full" />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
            </div>

            <div className="grid grid-cols-4 gap-4 p-4 border-b items-center">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Petrol/Gasoline
              </div>
              <div className="text-muted-foreground">0.192</div>
              <Input placeholder="Enter override value" className="w-full" />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
            </div>

            <div className="grid grid-cols-4 gap-4 p-4 border-b items-center">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4" />
                Hybrid Vehicles
              </div>
              <div className="text-muted-foreground">0.104</div>
              <Input placeholder="Enter override value" className="w-full" />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
            </div>

            <div className="grid grid-cols-4 gap-4 p-4 items-center">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Electric Vehicles
              </div>
              <div className="text-muted-foreground">0.000</div>
              <Input placeholder="Enter override value" className="w-full" />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-blue-900">PCAF Database Connection</p>
              <p className="text-sm text-blue-700">Connected to PCAF Global Emission Factors Database v2.1</p>
            </div>
            <Button variant="outline" size="sm">Update Database</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Grid Mix Assumptions
            </CardTitle>
            <CardDescription>
              Configure regional electricity grid emission factors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grid-region">Grid Region</Label>
              <Select defaultValue="us-national">
                <SelectTrigger>
                  <SelectValue placeholder="Select grid region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-national">US National Average</SelectItem>
                  <SelectItem value="eu-average">EU Average</SelectItem>
                  <SelectItem value="uk-national">UK National Grid</SelectItem>
                  <SelectItem value="custom">Custom Region</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grid-ef">Grid Emission Factor (kg CO₂e/kWh)</Label>
              <Input 
                id="grid-ef"
                placeholder="0.429"
                defaultValue="0.429"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewable-share">Renewable Energy Share (%)</Label>
              <Input 
                id="renewable-share"
                placeholder="20"
                defaultValue="20"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Fuel Consumption Averages
            </CardTitle>
            <CardDescription>
              Institution-specific fuel consumption rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avg-fuel-diesel">Diesel Consumption (L/100km)</Label>
              <Input 
                id="avg-fuel-diesel"
                placeholder="7.5"
                defaultValue="7.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avg-fuel-petrol">Petrol Consumption (L/100km)</Label>
              <Input 
                id="avg-fuel-petrol"
                placeholder="8.2"
                defaultValue="8.2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avg-fuel-hybrid">Hybrid Consumption (L/100km)</Label>
              <Input 
                id="avg-fuel-hybrid"
                placeholder="4.5"
                defaultValue="4.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avg-consumption-ev">EV Consumption (kWh/100km)</Label>
              <Input 
                id="avg-consumption-ev"
                placeholder="18.0"
                defaultValue="18.0"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderSampleDataSection = () => (
    <SampleDataManager />
  );

  if (activeSubsection === "quality-rules") {
    return <div className="space-y-6">{renderQualityRulesSection()}</div>;
  }

  if (activeSubsection === "emission-factors") {
    return <div className="space-y-6">{renderEmissionFactorsSection()}</div>;
  }

  if (activeSubsection === "sample-data") {
    return <div className="space-y-6">{renderSampleDataSection()}</div>;
  }

  // Default to data sources or show all if no subsection
  if (activeSubsection === "data-sources" || !activeSubsection) {
    return (
      <div className="space-y-6">
        {renderDataSourcesSection()}
        {!activeSubsection && (
          <>
            {renderQualityRulesSection()}
            {renderEmissionFactorsSection()}
          </>
        )}
      </div>
    );
  }

  return null;
}