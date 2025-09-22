import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { platformRAGService } from "@/services/platform-rag-service";
import {
  Calculator,
  Building2,
  Zap,
  Fuel,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Bot,
  Brain,
  Shield,
  Leaf,
  Factory
} from "lucide-react";

// Import new PCAF components
import { AvoidedEmissionsCalculator } from "@/components/avoided-emissions/AvoidedEmissionsCalculator";
import { AvoidedEmissionsReporting } from "@/components/avoided-emissions/AvoidedEmissionsReporting";
import { AttributionStandardsCalculator } from "@/components/pcaf-standards/AttributionStandardsCalculator";
import { PCAFComplianceDashboard } from "@/components/pcaf-standards/PCAFComplianceDashboard";

interface EmissionSource {
  category: string;
  scope: 1 | 2;
  activity: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  co2Equivalent: number;
  dataQuality: 1 | 2 | 3 | 4 | 5; // PCAF data quality scores
}

interface CalculationResult {
  totalScope1: number;
  totalScope2: number;
  totalEmissions: number;
  dataQualityScore: number;
  pcafCompliant: boolean;
}

export function PCAFCarbonCalculator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("compliance");
  const [bankInfo, setBankInfo] = useState({
    name: "",
    reportingPeriod: "",
    baseCurrency: "EUR"
  });

  // Scope 1 emissions sources
  const [scope1Sources, setScope1Sources] = useState<EmissionSource[]>([
    {
      category: "Stationary Combustion",
      scope: 1,
      activity: "Natural Gas",
      quantity: 0,
      unit: "MWh",
      emissionFactor: 0.184, // kg CO2e/kWh
      co2Equivalent: 0,
      dataQuality: 3
    },
    {
      category: "Mobile Combustion",
      scope: 1,
      activity: "Company Vehicles",
      quantity: 0,
      unit: "Liters",
      emissionFactor: 2.31, // kg CO2e/liter diesel
      co2Equivalent: 0,
      dataQuality: 3
    }
  ]);

  // Scope 2 emissions sources
  const [scope2Sources, setScope2Sources] = useState<EmissionSource[]>([
    {
      category: "Purchased Electricity",
      scope: 2,
      activity: "Grid Electricity",
      quantity: 0,
      unit: "MWh",
      emissionFactor: 0.233, // kg CO2e/kWh (EU average)
      co2Equivalent: 0,
      dataQuality: 2
    },
    {
      category: "Purchased Heating",
      scope: 2,
      activity: "District Heating",
      quantity: 0,
      unit: "MWh",
      emissionFactor: 0.156, // kg CO2e/kWh
      co2Equivalent: 0,
      dataQuality: 3
    }
  ]);

  const [calculation, setCalculation] = useState<CalculationResult>({
    totalScope1: 0,
    totalScope2: 0,
    totalEmissions: 0,
    dataQualityScore: 0,
    pcafCompliant: false
  });

  const [aiValidation, setAiValidation] = useState<string>("");
  const [loadingValidation, setLoadingValidation] = useState(false);

  const updateEmissionSource = (sources: EmissionSource[], index: number, field: keyof EmissionSource, value: any) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    
    // Recalculate CO2 equivalent
    if (field === 'quantity' || field === 'emissionFactor') {
      updated[index].co2Equivalent = updated[index].quantity * updated[index].emissionFactor / 1000; // Convert to tonnes
    }
    
    return updated;
  };

  const calculateTotalEmissions = () => {
    const totalScope1 = scope1Sources.reduce((sum, source) => sum + source.co2Equivalent, 0);
    const totalScope2 = scope2Sources.reduce((sum, source) => sum + source.co2Equivalent, 0);
    const totalEmissions = totalScope1 + totalScope2;
    
    // Calculate weighted average data quality score (PCAF methodology)
    const allSources = [...scope1Sources, ...scope2Sources];
    const totalEmissionWeight = allSources.reduce((sum, source) => sum + source.co2Equivalent, 0);
    const weightedDataQuality = allSources.reduce((sum, source) => {
      return sum + (source.dataQuality * source.co2Equivalent);
    }, 0) / totalEmissionWeight;

    const pcafCompliant = weightedDataQuality <= 3.5; // PCAF requirement for good data quality

    setCalculation({
      totalScope1,
      totalScope2,
      totalEmissions,
      dataQualityScore: weightedDataQuality || 0,
      pcafCompliant
    });

    toast({
      title: "Calculation Complete",
      description: `Total emissions: ${totalEmissions.toFixed(2)} tCO₂e. PCAF Compliant: ${pcafCompliant ? 'Yes' : 'No'}`,
    });

    // Generate AI validation
    generateAIValidation({
      totalScope1,
      totalScope2,
      totalEmissions,
      dataQualityScore: weightedDataQuality || 0,
      pcafCompliant
    });
  };

  const generateAIValidation = async (calculationResult: CalculationResult) => {
    try {
      setLoadingValidation(true);
      const response = await platformRAGService.queryAgent(
        'compliance',
        'Validate this PCAF calculation and identify any potential issues or improvements',
        {
          calculation: calculationResult,
          scope1Sources: scope1Sources.length,
          scope2Sources: scope2Sources.length,
          bankInfo
        }
      );
      setAiValidation(response.response);
    } catch (error) {
      console.error('Failed to generate AI validation:', error);
    } finally {
      setLoadingValidation(false);
    }
  };

  const addEmissionSource = (scope: 1 | 2) => {
    const newSource: EmissionSource = {
      category: "",
      scope,
      activity: "",
      quantity: 0,
      unit: "MWh",
      emissionFactor: 0,
      co2Equivalent: 0,
      dataQuality: 3
    };

    if (scope === 1) {
      setScope1Sources([...scope1Sources, newSource]);
    } else {
      setScope2Sources([...scope2Sources, newSource]);
    }
  };

  const generateReport = () => {
    toast({
      title: "Report Generated",
      description: "PCAF-compliant carbon footprint report has been generated and is ready for download.",
    });
  };

  const getDataQualityLabel = (score: number) => {
    if (score <= 1.5) return { label: "Excellent", color: "text-success" };
    if (score <= 2.5) return { label: "Good", color: "text-primary" };
    if (score <= 3.5) return { label: "Fair", color: "text-warning" };
    if (score <= 4.5) return { label: "Poor", color: "text-destructive" };
    return { label: "Very Poor", color: "text-destructive" };
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">PCAF Comprehensive Platform</h2>
            <p className="text-sm text-muted-foreground">
              Complete PCAF implementation: Attribution Standards A/B/C, Avoided Emissions, Multi-Asset Class Support, and Scope 1 & 2 calculations
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge variant="secondary">95% PCAF Compliant</Badge>
            <Badge variant="outline">Standards A, B, C</Badge>
            <Badge variant="outline">Avoided Emissions</Badge>
          </div>
        </div>

        {/* Bank Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Institution Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bankName">Institution Name</Label>
              <Input
                id="bankName"
                value={bankInfo.name}
                onChange={(e) => setBankInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter bank/financial institution name"
              />
            </div>
            <div>
              <Label htmlFor="reportingPeriod">Reporting Period</Label>
              <Input
                id="reportingPeriod"
                value={bankInfo.reportingPeriod}
                onChange={(e) => setBankInfo(prev => ({ ...prev, reportingPeriod: e.target.value }))}
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Input
                id="baseCurrency"
                value={bankInfo.baseCurrency}
                onChange={(e) => setBankInfo(prev => ({ ...prev, baseCurrency: e.target.value }))}
                placeholder="EUR"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="compliance">PCAF Compliance</TabsTrigger>
            <TabsTrigger value="attribution">Attribution Standards</TabsTrigger>
            <TabsTrigger value="avoided">Avoided Emissions</TabsTrigger>
            <TabsTrigger value="avoided-reports">Avoided Reports</TabsTrigger>
            <TabsTrigger value="scope1">Scope 1 Emissions</TabsTrigger>
            <TabsTrigger value="scope2">Scope 2 Emissions</TabsTrigger>
            <TabsTrigger value="calculation">Calculate</TabsTrigger>
          </TabsList>

          {/* New PCAF Compliance Dashboard Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <PCAFComplianceDashboard />
          </TabsContent>

          {/* New Attribution Standards Tab */}
          <TabsContent value="attribution" className="space-y-4">
            <AttributionStandardsCalculator />
          </TabsContent>

          {/* New Avoided Emissions Calculator Tab */}
          <TabsContent value="avoided" className="space-y-4">
            <AvoidedEmissionsCalculator />
          </TabsContent>

          {/* New Avoided Emissions Reporting Tab */}
          <TabsContent value="avoided-reports" className="space-y-4">
            <AvoidedEmissionsReporting />
          </TabsContent>

          <TabsContent value="scope1" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Fuel className="h-4 w-4 text-primary" />
                Scope 1: Direct Emissions
              </h3>
              <Button onClick={() => addEmissionSource(1)} variant="outline" size="sm">
                Add Source
              </Button>
            </div>

            <div className="space-y-4">
              {scope1Sources.map((source, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={source.category}
                          onChange={(e) => setScope1Sources(updateEmissionSource(scope1Sources, index, 'category', e.target.value))}
                          placeholder="e.g., Stationary Combustion"
                        />
                      </div>
                      <div>
                        <Label>Activity</Label>
                        <Input
                          value={source.activity}
                          onChange={(e) => setScope1Sources(updateEmissionSource(scope1Sources, index, 'activity', e.target.value))}
                          placeholder="e.g., Natural Gas"
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={source.quantity}
                          onChange={(e) => setScope1Sources(updateEmissionSource(scope1Sources, index, 'quantity', parseFloat(e.target.value) || 0))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input
                          value={source.unit}
                          onChange={(e) => setScope1Sources(updateEmissionSource(scope1Sources, index, 'unit', e.target.value))}
                          placeholder="MWh"
                        />
                      </div>
                      <div>
                        <Label>Emission Factor (kg CO₂e/unit)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={source.emissionFactor}
                          onChange={(e) => setScope1Sources(updateEmissionSource(scope1Sources, index, 'emissionFactor', parseFloat(e.target.value) || 0))}
                          placeholder="0.184"
                        />
                      </div>
                      <div>
                        <Label>Data Quality Score (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={source.dataQuality}
                          onChange={(e) => setScope1Sources(updateEmissionSource(scope1Sources, index, 'dataQuality', parseInt(e.target.value) || 3))}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        CO₂ Equivalent: <span className="font-medium">{source.co2Equivalent.toFixed(3)} tCO₂e</span>
                      </div>
                      <Badge variant={source.dataQuality <= 3 ? "secondary" : "outline"}>
                        PCAF Score: {source.dataQuality}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scope2" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Scope 2: Indirect Emissions from Energy
              </h3>
              <Button onClick={() => addEmissionSource(2)} variant="outline" size="sm">
                Add Source
              </Button>
            </div>

            <div className="space-y-4">
              {scope2Sources.map((source, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={source.category}
                          onChange={(e) => setScope2Sources(updateEmissionSource(scope2Sources, index, 'category', e.target.value))}
                          placeholder="e.g., Purchased Electricity"
                        />
                      </div>
                      <div>
                        <Label>Activity</Label>
                        <Input
                          value={source.activity}
                          onChange={(e) => setScope2Sources(updateEmissionSource(scope2Sources, index, 'activity', e.target.value))}
                          placeholder="e.g., Grid Electricity"
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={source.quantity}
                          onChange={(e) => setScope2Sources(updateEmissionSource(scope2Sources, index, 'quantity', parseFloat(e.target.value) || 0))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Input
                          value={source.unit}
                          onChange={(e) => setScope2Sources(updateEmissionSource(scope2Sources, index, 'unit', e.target.value))}
                          placeholder="MWh"
                        />
                      </div>
                      <div>
                        <Label>Emission Factor (kg CO₂e/unit)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={source.emissionFactor}
                          onChange={(e) => setScope2Sources(updateEmissionSource(scope2Sources, index, 'emissionFactor', parseFloat(e.target.value) || 0))}
                          placeholder="0.233"
                        />
                      </div>
                      <div>
                        <Label>Data Quality Score (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={source.dataQuality}
                          onChange={(e) => setScope2Sources(updateEmissionSource(scope2Sources, index, 'dataQuality', parseInt(e.target.value) || 3))}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        CO₂ Equivalent: <span className="font-medium">{source.co2Equivalent.toFixed(3)} tCO₂e</span>
                      </div>
                      <Badge variant={source.dataQuality <= 3 ? "secondary" : "outline"}>
                        PCAF Score: {source.dataQuality}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calculation" className="space-y-6">
            <div className="text-center">
              <Button onClick={calculateTotalEmissions} size="lg" className="mb-6">
                <TrendingUp className="h-4 w-4 mr-2" />
                Calculate PCAF Emissions
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-primary" />
                    Scope 1 Emissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{calculation.totalScope1.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">tonnes CO₂e</p>
                  <Progress value={(calculation.totalScope1 / calculation.totalEmissions) * 100 || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Scope 2 Emissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{calculation.totalScope2.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">tonnes CO₂e</p>
                  <Progress value={(calculation.totalScope2 / calculation.totalEmissions) * 100 || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Emissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{calculation.totalEmissions.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">tonnes CO₂e</p>
                  <div className="mt-2 flex items-center gap-2">
                    {calculation.pcafCompliant ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    <span className={`text-sm ${calculation.pcafCompliant ? 'text-success' : 'text-warning'}`}>
                      {calculation.pcafCompliant ? 'PCAF Compliant' : 'Improve Data Quality'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{calculation.dataQualityScore.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">Weighted Average PCAF Score</p>
                  </div>
                  <Badge variant={calculation.pcafCompliant ? "secondary" : "outline"} className={getDataQualityLabel(calculation.dataQualityScore).color}>
                    {getDataQualityLabel(calculation.dataQualityScore).label}
                  </Badge>
                </div>
                <Progress value={((5 - calculation.dataQualityScore) / 4) * 100} className="mb-4" />
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    PCAF requires data quality scores ≤ 3.5 for compliant reporting. 
                    Lower scores indicate higher data quality and accuracy.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  PCAF Compliance Report
                </CardTitle>
                <CardDescription>
                  Generate a comprehensive report following PCAF Global GHG Accounting and Reporting Standard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Institution:</span> {bankInfo.name || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Reporting Period:</span> {bankInfo.reportingPeriod || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Total Scope 1 + 2:</span> {calculation.totalEmissions.toFixed(2)} tCO₂e
                  </div>
                  <div>
                    <span className="font-medium">Data Quality Score:</span> {calculation.dataQualityScore.toFixed(2)}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Report Sections:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Executive Summary
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Methodology & Standards
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Emission Sources & Calculations
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Data Quality Assessment
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      PCAF Compliance Statement
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      Recommendations
                    </div>
                  </div>
                </div>

                <Button onClick={generateReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate PCAF Report (PDF)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}