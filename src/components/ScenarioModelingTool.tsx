import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, type LoanPortfolioItem } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import {
  Calculator, Target, TrendingUp, TrendingDown, 
  Zap, BarChart3, PieChart, RefreshCw, PlayCircle
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, ReferenceLine
} from "recharts";

interface ScenarioParameters {
  evAdoptionRate: number; // 0-100%
  hybridAdoptionRate: number; // 0-100%
  dataQualityImprovement: number; // 0-100%
  portfolioGrowth: number; // -50% to +100%
  regulatoryStrictness: number; // 0-100%
  carbonPrice: number; // $0-$200 per tonne
}

interface ScenarioResults {
  totalEmissions: number;
  emissionIntensity: number;
  complianceRate: number;
  riskScore: number;
  portfolioValue: number;
  carbonCost: number;
  emissionChange: number;
  costBenefit: number;
}

interface TimeSeriesProjection {
  year: number;
  baselineEmissions: number;
  scenarioEmissions: number;
  cumulativeSavings: number;
  complianceRate: number;
}

interface VehicleTypeImpact {
  vehicleType: string;
  currentCount: number;
  scenarioCount: number;
  emissionChange: number;
  valueChange: number;
}

const DEFAULT_PARAMETERS: ScenarioParameters = {
  evAdoptionRate: 25,
  hybridAdoptionRate: 15,
  dataQualityImprovement: 30,
  portfolioGrowth: 10,
  regulatoryStrictness: 50,
  carbonPrice: 50
};

export function ScenarioModelingTool() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanPortfolioItem[]>([]);
  const [parameters, setParameters] = useState<ScenarioParameters>(DEFAULT_PARAMETERS);
  const [results, setResults] = useState<ScenarioResults | null>(null);
  const [baselineResults, setBaselineResults] = useState<ScenarioResults | null>(null);
  const [projections, setProjections] = useState<TimeSeriesProjection[]>([]);
  const [vehicleImpacts, setVehicleImpacts] = useState<VehicleTypeImpact[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("parameters");

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      const loanData = await db.loans.toArray();
      setLoans(loanData);
      
      if (loanData.length > 0) {
        // Calculate baseline scenario
        const baseline = calculateScenario(loanData, {
          evAdoptionRate: 0,
          hybridAdoptionRate: 0,
          dataQualityImprovement: 0,
          portfolioGrowth: 0,
          regulatoryStrictness: 0,
          carbonPrice: 0
        });
        setBaselineResults(baseline);
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load portfolio data for scenario modeling.",
        variant: "destructive"
      });
    }
  };

  const runScenario = async () => {
    if (loans.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please upload portfolio data to run scenarios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Calculate scenario results
      const scenarioResults = calculateScenario(loans, parameters);
      setResults(scenarioResults);

      // Generate time series projections
      const timeProjections = generateTimeSeriesProjections(loans, parameters);
      setProjections(timeProjections);

      // Calculate vehicle type impacts
      const vehicleTypeAnalysis = analyzeVehicleTypeImpacts(loans, parameters);
      setVehicleImpacts(vehicleTypeAnalysis);

      toast({
        title: "Scenario Complete",
        description: "Scenario analysis has been generated successfully.",
        variant: "default"
      });

    } catch (error) {
      console.error('Failed to run scenario:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to complete scenario analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateScenario = (loanData: LoanPortfolioItem[], params: ScenarioParameters): ScenarioResults => {
    // Simulate portfolio changes based on parameters
    let modifiedLoans = [...loanData];
    
    // Apply portfolio growth
    const growthFactor = 1 + (params.portfolioGrowth / 100);
    const portfolioValue = modifiedLoans.reduce((sum, loan) => sum + loan.loan_amount, 0) * growthFactor;

    // Simulate EV adoption (reduce emissions for converted vehicles)
    const evConversions = Math.floor(modifiedLoans.length * (params.evAdoptionRate / 100));
    const hybridConversions = Math.floor(modifiedLoans.length * (params.hybridAdoptionRate / 100));

    // Apply emission reductions
    modifiedLoans = modifiedLoans.map((loan, index) => {
      let emissionReduction = 0;
      
      // EV conversions (90% emission reduction)
      if (index < evConversions && !loan.fuel_type.toLowerCase().includes('electric')) {
        emissionReduction += 0.90;
      }
      // Hybrid conversions (40% emission reduction)
      else if (index < evConversions + hybridConversions && !loan.fuel_type.toLowerCase().includes('hybrid')) {
        emissionReduction += 0.40;
      }

      // Data quality improvements reduce uncertainty but don't change emissions
      const qualityImprovement = params.dataQualityImprovement / 100;
      const improvedQuality = Math.max(1, loan.data_quality_score * (1 - qualityImprovement * 0.5));

      return {
        ...loan,
        financed_emissions: loan.financed_emissions * (1 - emissionReduction),
        data_quality_score: improvedQuality,
        loan_amount: loan.loan_amount * growthFactor
      };
    });

    // Calculate results
    const totalEmissions = modifiedLoans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
    const emissionIntensity = portfolioValue > 0 ? (totalEmissions * 1000) / portfolioValue : 0;
    const avgDataQuality = modifiedLoans.reduce((sum, loan) => sum + loan.data_quality_score, 0) / modifiedLoans.length;
    const compliantLoans = modifiedLoans.filter(loan => loan.data_quality_score <= 3).length;
    const complianceRate = (compliantLoans / modifiedLoans.length) * 100;
    const riskScore = Math.min(100, (avgDataQuality / 5) * 100);
    const carbonCost = totalEmissions * params.carbonPrice;

    // Calculate change from baseline
    const originalEmissions = loanData.reduce((sum, loan) => sum + loan.financed_emissions, 0);
    const emissionChange = originalEmissions > 0 ? ((totalEmissions - originalEmissions) / originalEmissions) * 100 : 0;

    // Cost-benefit analysis (simplified)
    const implementationCost = (params.evAdoptionRate + params.hybridAdoptionRate + params.dataQualityImprovement) * 1000;
    const carbonSavings = (originalEmissions - totalEmissions) * params.carbonPrice;
    const costBenefit = carbonSavings - implementationCost;

    return {
      totalEmissions,
      emissionIntensity,
      complianceRate,
      riskScore,
      portfolioValue,
      carbonCost,
      emissionChange,
      costBenefit
    };
  };

  const generateTimeSeriesProjections = (loanData: LoanPortfolioItem[], params: ScenarioParameters): TimeSeriesProjection[] => {
    const projections: TimeSeriesProjection[] = [];
    const baselineEmissions = loanData.reduce((sum, loan) => sum + loan.financed_emissions, 0);
    
    for (let year = 2024; year <= 2030; year++) {
      const yearOffset = year - 2024;
      
      // Progressive implementation of changes
      const progressFactor = Math.min(1, yearOffset / 3); // Full implementation by year 3
      
      const adjustedParams = {
        ...params,
        evAdoptionRate: params.evAdoptionRate * progressFactor,
        hybridAdoptionRate: params.hybridAdoptionRate * progressFactor,
        dataQualityImprovement: params.dataQualityImprovement * progressFactor
      };
      
      const scenarioResult = calculateScenario(loanData, adjustedParams);
      const cumulativeSavings = (baselineEmissions - scenarioResult.totalEmissions) * yearOffset;
      
      projections.push({
        year,
        baselineEmissions: baselineEmissions * (1 + yearOffset * 0.05), // 5% annual growth
        scenarioEmissions: scenarioResult.totalEmissions,
        cumulativeSavings,
        complianceRate: scenarioResult.complianceRate
      });
    }
    
    return projections;
  };

  const analyzeVehicleTypeImpacts = (loanData: LoanPortfolioItem[], params: ScenarioParameters): VehicleTypeImpact[] => {
    const vehicleTypes = [...new Set(loanData.map(loan => loan.vehicle_type))];
    
    return vehicleTypes.map(vehicleType => {
      const typeLoans = loanData.filter(loan => loan.vehicle_type === vehicleType);
      const currentCount = typeLoans.length;
      const currentEmissions = typeLoans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
      const currentValue = typeLoans.reduce((sum, loan) => sum + loan.loan_amount, 0);
      
      // Simulate impact based on conversion potential
      let conversionRate = 0;
      if (vehicleType.toLowerCase().includes('passenger')) {
        conversionRate = (params.evAdoptionRate + params.hybridAdoptionRate) / 100;
      } else if (vehicleType.toLowerCase().includes('commercial')) {
        conversionRate = params.hybridAdoptionRate / 100 * 0.5; // Lower conversion for commercial
      }
      
      const scenarioCount = Math.floor(currentCount * (1 + params.portfolioGrowth / 100));
      const emissionReduction = currentEmissions * conversionRate * 0.6; // Average 60% reduction
      const valueIncrease = currentValue * (params.portfolioGrowth / 100);
      
      return {
        vehicleType,
        currentCount,
        scenarioCount,
        emissionChange: -emissionReduction,
        valueChange: valueIncrease
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3" />;
    if (value < 0) return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Scenario Modeling Tool
          </h2>
          <p className="text-muted-foreground">
            Model portfolio changes and their impact on emissions and compliance
          </p>
        </div>
        <Button onClick={runScenario} disabled={loading} className="gradient-primary text-white">
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4 mr-2" />
          )}
          Run Scenario
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="impacts">Impact Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Technology Parameters</CardTitle>
                <CardDescription>Adjust adoption rates for different vehicle technologies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Electric Vehicle Adoption Rate: {parameters.evAdoptionRate}%</Label>
                  <Slider
                    value={[parameters.evAdoptionRate]}
                    onValueChange={([value]) => setParameters(prev => ({ ...prev, evAdoptionRate: value }))}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of portfolio transitioning to electric vehicles
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Hybrid Vehicle Adoption Rate: {parameters.hybridAdoptionRate}%</Label>
                  <Slider
                    value={[parameters.hybridAdoptionRate]}
                    onValueChange={([value]) => setParameters(prev => ({ ...prev, hybridAdoptionRate: value }))}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of portfolio transitioning to hybrid vehicles
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Data Quality Improvement: {parameters.dataQualityImprovement}%</Label>
                  <Slider
                    value={[parameters.dataQualityImprovement]}
                    onValueChange={([value]) => setParameters(prev => ({ ...prev, dataQualityImprovement: value }))}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Improvement in data collection and quality processes
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio & Market Parameters</CardTitle>
                <CardDescription>Configure portfolio growth and market conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Portfolio Growth Rate: {parameters.portfolioGrowth}%</Label>
                  <Slider
                    value={[parameters.portfolioGrowth]}
                    onValueChange={([value]) => setParameters(prev => ({ ...prev, portfolioGrowth: value }))}
                    min={-50}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Annual portfolio growth or contraction rate
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Regulatory Strictness: {parameters.regulatoryStrictness}%</Label>
                  <Slider
                    value={[parameters.regulatoryStrictness]}
                    onValueChange={([value]) => setParameters(prev => ({ ...prev, regulatoryStrictness: value }))}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Level of regulatory requirements and compliance standards
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Carbon Price: ${parameters.carbonPrice}/tonne</Label>
                  <Slider
                    value={[parameters.carbonPrice]}
                    onValueChange={([value]) => setParameters(prev => ({ ...prev, carbonPrice: value }))}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Carbon pricing for cost-benefit analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Scenarios</CardTitle>
              <CardDescription>Pre-configured scenario templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setParameters({
                    evAdoptionRate: 50,
                    hybridAdoptionRate: 30,
                    dataQualityImprovement: 40,
                    portfolioGrowth: 15,
                    regulatoryStrictness: 30,
                    carbonPrice: 75
                  })}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <div className="font-semibold">Aggressive EV Transition</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    50% EV, 30% Hybrid adoption with enhanced data quality
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setParameters({
                    evAdoptionRate: 20,
                    hybridAdoptionRate: 40,
                    dataQualityImprovement: 60,
                    portfolioGrowth: 25,
                    regulatoryStrictness: 70,
                    carbonPrice: 100
                  })}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <div className="font-semibold">Regulatory Compliance</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Focus on data quality and regulatory compliance
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setParameters({
                    evAdoptionRate: 15,
                    hybridAdoptionRate: 25,
                    dataQualityImprovement: 20,
                    portfolioGrowth: 35,
                    regulatoryStrictness: 40,
                    carbonPrice: 50
                  })}
                  className="h-auto p-4 flex flex-col items-start"
                >
                  <div className="font-semibold">Balanced Growth</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Moderate technology adoption with portfolio expansion
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results && baselineResults ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="card-enhanced">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Emissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{results.totalEmissions.toFixed(2)}</div>
                    <div className={`flex items-center text-xs ${getChangeColor(results.emissionChange)}`}>
                      {getChangeIcon(results.emissionChange)}
                      <span className="ml-1">{results.emissionChange.toFixed(1)}% vs baseline</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-enhanced">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Emission Intensity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-finance">{results.emissionIntensity.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">kg CO₂e / $1,000</div>
                  </CardContent>
                </Card>

                <Card className="card-enhanced">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Compliance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">{results.complianceRate.toFixed(1)}%</div>
                    <div className={`flex items-center text-xs ${getChangeColor(results.complianceRate - baselineResults.complianceRate)}`}>
                      {getChangeIcon(results.complianceRate - baselineResults.complianceRate)}
                      <span className="ml-1">{(results.complianceRate - baselineResults.complianceRate).toFixed(1)}% change</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-enhanced">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cost-Benefit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${results.costBenefit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(results.costBenefit)}
                    </div>
                    <div className="text-xs text-muted-foreground">Net impact</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Scenario vs Baseline Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">Portfolio Value</span>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(results.portfolioValue)}</div>
                          <div className="text-xs text-muted-foreground">
                            vs {formatCurrency(baselineResults.portfolioValue)} baseline
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">Risk Score</span>
                        <div className="text-right">
                          <div className={`font-semibold ${results.riskScore < baselineResults.riskScore ? 'text-success' : 'text-destructive'}`}>
                            {results.riskScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            vs {baselineResults.riskScore.toFixed(1)} baseline
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-medium">Carbon Cost</span>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(results.carbonCost)}</div>
                          <div className="text-xs text-muted-foreground">
                            Annual carbon pricing impact
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { metric: 'Emissions', baseline: baselineResults.totalEmissions, scenario: results.totalEmissions },
                        { metric: 'Intensity', baseline: baselineResults.emissionIntensity, scenario: results.emissionIntensity },
                        { metric: 'Risk Score', baseline: baselineResults.riskScore, scenario: results.riskScore }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="metric" className="text-sm" />
                        <YAxis className="text-sm" />
                        <Tooltip />
                        <Bar dataKey="baseline" fill="hsl(var(--muted))" name="Baseline" />
                        <Bar dataKey="scenario" fill="hsl(var(--primary))" name="Scenario" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Scenario Results</h3>
                  <p className="text-muted-foreground">
                    Configure parameters and run a scenario to see results
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          {projections.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Multi-Year Projections (2024-2030)
                </CardTitle>
                <CardDescription>
                  Projected emissions and compliance rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" className="text-sm" />
                    <YAxis yAxisId="left" className="text-sm" />
                    <YAxis yAxisId="right" orientation="right" className="text-sm" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="baselineEmissions"
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--muted-foreground))"
                      fillOpacity={0.3}
                      name="Baseline Emissions"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="scenarioEmissions"
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Scenario Emissions"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="complianceRate"
                      stroke="hsl(var(--success))"
                      strokeWidth={3}
                      name="Compliance Rate %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Projection Data</h3>
                  <p className="text-muted-foreground">
                    Run a scenario to generate multi-year projections
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="impacts" className="space-y-6">
          {vehicleImpacts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Vehicle Type Impact Analysis
                </CardTitle>
                <CardDescription>
                  Scenario impacts by vehicle category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicleImpacts.map((impact, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <h4 className="font-semibold">{impact.vehicleType}</h4>
                        <div className="text-sm text-muted-foreground">
                          {impact.currentCount} → {impact.scenarioCount} loans
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-semibold ${getChangeColor(-impact.emissionChange)}`}>
                            {impact.emissionChange > 0 ? '+' : ''}{impact.emissionChange.toFixed(2)} tCO₂e
                          </div>
                          <div className="text-xs text-muted-foreground">Emission Change</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${getChangeColor(impact.valueChange)}`}>
                            {formatCurrency(impact.valueChange)}
                          </div>
                          <div className="text-xs text-muted-foreground">Value Change</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Impact Analysis</h3>
                  <p className="text-muted-foreground">
                    Run a scenario to analyze vehicle type impacts
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}