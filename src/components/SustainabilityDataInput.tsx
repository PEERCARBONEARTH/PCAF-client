import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Target,
  Building2,
  FileCheck,
  Database,
  Upload,
  Save,
  RefreshCw
} from "lucide-react";

interface SustainabilityDataInputProps {
  clientType: "bank" | "fund";
  onClose?: () => void;
}

export function SustainabilityDataInput({ clientType, onClose }: SustainabilityDataInputProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("targets");
  const [loading, setLoading] = useState(false);

  // Net-Zero Targets
  const [netZeroData, setNetZeroData] = useState({
    commitmentYear: 2050,
    baselineYear: 2020,
    scope1And2Target: 50,
    scope3Target: 30,
    financeEmissionsTarget: 25,
    currentScope1And2: 45,
    currentScope3: 23,
    currentFinanceEmissions: 18
  });

  // Portfolio Targets
  const [portfolioTargets, setPortfolioTargets] = useState({
    greenFinanceAllocation: 50,
    carbonIntensityTarget: 95,
    esgScoreTarget: 8.5,
    climateRiskExposureTarget: 10,
    currentGreenFinance: 34.5,
    currentCarbonIntensity: 142,
    currentEsgScore: 7.2,
    currentClimateRisk: 15.8
  });

  // Data Sources
  const [dataSources, setDataSources] = useState({
    coreSystemsIntegrated: false,
    esgDataProvider: "",
    carbonAccountingPlatform: "",
    regulatoryReportingSystem: "",
    automatedDataFeeds: false,
    manualDataEntry: true
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Sustainability targets and data sources have been updated successfully.",
      });
      
      onClose?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Sustainability Data Configuration
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure your institution's sustainability targets and data sources
            </p>
          </div>
          <Badge variant="secondary" className="capitalize">
            <Building2 className="h-3 w-3 mr-1" />
            {clientType} Configuration
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="targets">Net-Zero Targets</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio Metrics</TabsTrigger>
            <TabsTrigger value="datasources">Data Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="targets" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Net-Zero Commitment Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="commitmentYear">Net-Zero Target Year</Label>
                    <Input
                      id="commitmentYear"
                      type="number"
                      value={netZeroData.commitmentYear}
                      onChange={(e) => setNetZeroData(prev => ({ ...prev, commitmentYear: parseInt(e.target.value) }))}
                      min="2025"
                      max="2070"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="baselineYear">Baseline Year</Label>
                    <Input
                      id="baselineYear"
                      type="number"
                      value={netZeroData.baselineYear}
                      onChange={(e) => setNetZeroData(prev => ({ ...prev, baselineYear: parseInt(e.target.value) }))}
                      min="2010"
                      max="2025"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scope1And2Target">Scope 1 & 2 Reduction Target (%)</Label>
                    <Input
                      id="scope1And2Target"
                      type="number"
                      value={netZeroData.scope1And2Target}
                      onChange={(e) => setNetZeroData(prev => ({ ...prev, scope1And2Target: parseInt(e.target.value) }))}
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="scope3Target">Scope 3 Reduction Target (%)</Label>
                    <Input
                      id="scope3Target"
                      type="number"
                      value={netZeroData.scope3Target}
                      onChange={(e) => setNetZeroData(prev => ({ ...prev, scope3Target: parseInt(e.target.value) }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <h4 className="font-medium mb-4">Current Progress</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentScope1And2">Current Scope 1 & 2 Reduction (%)</Label>
                  <Input
                    id="currentScope1And2"
                    type="number"
                    value={netZeroData.currentScope1And2}
                    onChange={(e) => setNetZeroData(prev => ({ ...prev, currentScope1And2: parseInt(e.target.value) }))}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currentScope3">Current Scope 3 Reduction (%)</Label>
                  <Input
                    id="currentScope3"
                    type="number"
                    value={netZeroData.currentScope3}
                    onChange={(e) => setNetZeroData(prev => ({ ...prev, currentScope3: parseInt(e.target.value) }))}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currentFinanceEmissions">Current Financed Emissions Reduction (%)</Label>
                  <Input
                    id="currentFinanceEmissions"
                    type="number"
                    value={netZeroData.currentFinanceEmissions}
                    onChange={(e) => setNetZeroData(prev => ({ ...prev, currentFinanceEmissions: parseInt(e.target.value) }))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Portfolio Sustainability Targets
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Target Values</h4>
                  
                  <div>
                    <Label htmlFor="greenFinanceTarget">Green Finance Allocation Target (%)</Label>
                    <Input
                      id="greenFinanceTarget"
                      type="number"
                      value={portfolioTargets.greenFinanceAllocation}
                      onChange={(e) => setPortfolioTargets(prev => ({ ...prev, greenFinanceAllocation: parseFloat(e.target.value) }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="carbonIntensityTarget">Carbon Intensity Target (tCO₂e/€M)</Label>
                    <Input
                      id="carbonIntensityTarget"
                      type="number"
                      value={portfolioTargets.carbonIntensityTarget}
                      onChange={(e) => setPortfolioTargets(prev => ({ ...prev, carbonIntensityTarget: parseFloat(e.target.value) }))}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="esgScoreTarget">ESG Portfolio Score Target (/10)</Label>
                    <Input
                      id="esgScoreTarget"
                      type="number"
                      value={portfolioTargets.esgScoreTarget}
                      onChange={(e) => setPortfolioTargets(prev => ({ ...prev, esgScoreTarget: parseFloat(e.target.value) }))}
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Current Values</h4>
                  
                  <div>
                    <Label htmlFor="currentGreenFinance">Current Green Finance Allocation (%)</Label>
                    <Input
                      id="currentGreenFinance"
                      type="number"
                      value={portfolioTargets.currentGreenFinance}
                      onChange={(e) => setPortfolioTargets(prev => ({ ...prev, currentGreenFinance: parseFloat(e.target.value) }))}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentCarbonIntensity">Current Carbon Intensity (tCO₂e/€M)</Label>
                    <Input
                      id="currentCarbonIntensity"
                      type="number"
                      value={portfolioTargets.currentCarbonIntensity}
                      onChange={(e) => setPortfolioTargets(prev => ({ ...prev, currentCarbonIntensity: parseFloat(e.target.value) }))}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentEsgScore">Current ESG Portfolio Score (/10)</Label>
                    <Input
                      id="currentEsgScore"
                      type="number"
                      value={portfolioTargets.currentEsgScore}
                      onChange={(e) => setPortfolioTargets(prev => ({ ...prev, currentEsgScore: parseFloat(e.target.value) }))}
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="datasources" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Data Source Configuration
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="coreSystemsIntegrated">Core Banking Systems Integration</Label>
                    <p className="text-sm text-muted-foreground">Connect to existing loan and portfolio systems</p>
                  </div>
                  <Switch
                    id="coreSystemsIntegrated"
                    checked={dataSources.coreSystemsIntegrated}
                    onCheckedChange={(checked) => setDataSources(prev => ({ ...prev, coreSystemsIntegrated: checked }))}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="esgDataProvider">ESG Data Provider</Label>
                    <Input
                      id="esgDataProvider"
                      placeholder="e.g., MSCI, Sustainalytics, Bloomberg ESG"
                      value={dataSources.esgDataProvider}
                      onChange={(e) => setDataSources(prev => ({ ...prev, esgDataProvider: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="carbonAccountingPlatform">Carbon Accounting Platform</Label>
                    <Input
                      id="carbonAccountingPlatform"
                      placeholder="e.g., Carbon Trust, Persefoni, Plan A"
                      value={dataSources.carbonAccountingPlatform}
                      onChange={(e) => setDataSources(prev => ({ ...prev, carbonAccountingPlatform: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="regulatoryReportingSystem">Regulatory Reporting System</Label>
                    <Input
                      id="regulatoryReportingSystem"
                      placeholder="e.g., Internal TCFD system, Third-party compliance platform"
                      value={dataSources.regulatoryReportingSystem}
                      onChange={(e) => setDataSources(prev => ({ ...prev, regulatoryReportingSystem: e.target.value }))}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="automatedDataFeeds">Automated Data Feeds</Label>
                    <p className="text-sm text-muted-foreground">Enable automatic data synchronization</p>
                  </div>
                  <Switch
                    id="automatedDataFeeds"
                    checked={dataSources.automatedDataFeeds}
                    onCheckedChange={(checked) => setDataSources(prev => ({ ...prev, automatedDataFeeds: checked }))}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="h-4 w-4 text-primary" />
                    <span className="font-medium">Data Upload Options</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload quarterly sustainability reports, ESG data files, or carbon footprint assessments
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Data Files
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Data will be validated and integrated with existing sustainability metrics
            </span>
          </div>
          
          <div className="flex gap-3">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}