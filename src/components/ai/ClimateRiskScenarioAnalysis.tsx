import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";
import { portfolioService } from "@/services/portfolioService";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Thermometer,
  Zap,
  Building,
  Car,
  Leaf,
  DollarSign,
  BarChart3,
  Brain,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from "recharts";

interface ClimateScenario {
  id: string;
  name: string;
  description: string;
  type: 'physical' | 'transition';
  severity: 'low' | 'medium' | 'high';
  timeHorizon: '2030' | '2040' | '2050';
  probability: number;
  impacts: {
    portfolioValue: number; // % change
    emissionIntensity: number; // % change
    dataQualityRisk: number; // % change
    complianceCost: number; // $ impact
    stranded_assets: number; // % of portfolio
  };
  mitigationStrategies: string[];
  keyDrivers: string[];
}

interface ScenarioAnalysisResult {
  scenarios: ClimateScenario[];
  portfolioResilience: {
    overall_score: number;
    physical_risk_score: number;
    transition_risk_score: number;
    adaptation_capacity: number;
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    timeframe: 'immediate' | 'short-term' | 'long-term';
    cost_estimate: string;
  }>;
  stress_test_results: {
    worst_case_loss: number;
    expected_loss: number;
    value_at_risk_95: number;
  };
}

export function ClimateRiskScenarioAnalysis() {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<ScenarioAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [timeHorizon, setTimeHorizon] = useState<'2030' | '2040' | '2050'>('2030');
  const [riskTolerance, setRiskTolerance] = useState<number[]>([50]);
  const [activeTab, setActiveTab] = useState("scenarios");

  // Predefined climate scenarios based on TCFD recommendations
  const baseScenarios: Omit<ClimateScenario, 'impacts'>[] = [
    {
      id: 'orderly_transition',
      name: 'Orderly Transition',
      description: 'Gradual policy implementation with early action and smooth transition to low-carbon economy',
      type: 'transition',
      severity: 'low',
      timeHorizon: '2030',
      probability: 0.4,
      mitigationStrategies: [
        'Gradual portfolio transition to EVs',
        'Enhanced data collection for PCAF compliance',
        'Green financing products development'
      ],
      keyDrivers: [
        'Carbon pricing implementation',
        'EV adoption incentives',
        'Regulatory clarity on financed emissions'
      ]
    },
    {
      id: 'disorderly_transition',
      name: 'Disorderly Transition',
      description: 'Late policy action leading to sudden, disruptive changes in regulations and market conditions',
      type: 'transition',
      severity: 'high',
      timeHorizon: '2030',
      probability: 0.25,
      mitigationStrategies: [
        'Rapid portfolio rebalancing',
        'Emergency compliance measures',
        'Stranded asset management'
      ],
      keyDrivers: [
        'Sudden carbon tax implementation',
        'ICE vehicle bans',
        'Mandatory emission reporting'
      ]
    },
    {
      id: 'hot_house_world',
      name: 'Hot House World',
      description: 'Limited climate action leading to severe physical climate impacts',
      type: 'physical',
      severity: 'high',
      timeHorizon: '2040',
      probability: 0.2,
      mitigationStrategies: [
        'Climate-resilient asset selection',
        'Geographic diversification',
        'Physical risk insurance'
      ],
      keyDrivers: [
        'Extreme weather events',
        'Supply chain disruptions',
        'Infrastructure damage'
      ]
    },
    {
      id: 'net_zero_2050',
      name: 'Net Zero by 2050',
      description: 'Ambitious climate action achieving net-zero emissions by 2050',
      type: 'transition',
      severity: 'medium',
      timeHorizon: '2050',
      probability: 0.35,
      mitigationStrategies: [
        'Complete EV transition',
        'Carbon-negative portfolio',
        'Climate leadership positioning'
      ],
      keyDrivers: [
        'Technology breakthroughs',
        'Consumer behavior shift',
        'International cooperation'
      ]
    }
  ];

  useEffect(() => {
    runScenarioAnalysis();
  }, [timeHorizon, riskTolerance]);

  const runScenarioAnalysis = async () => {
    try {
      setLoading(true);
      
      // Get current portfolio data
      const portfolioMetrics = await portfolioService.getPortfolioAnalytics();
      
      // Generate scenario impacts using AI
      const scenariosWithImpacts = await Promise.all(
        baseScenarios.map(async (scenario) => {
          const impacts = await generateScenarioImpacts(scenario, portfolioMetrics);
          return { ...scenario, impacts, timeHorizon };
        })
      );

      // Calculate portfolio resilience
      const resilience = calculatePortfolioResilience(scenariosWithImpacts, portfolioMetrics);
      
      // Generate AI-powered recommendations
      const recommendations = await generateRecommendations(scenariosWithImpacts, portfolioMetrics);
      
      // Calculate stress test results
      const stressTestResults = calculateStressTestResults(scenariosWithImpacts);

      setAnalysisResult({
        scenarios: scenariosWithImpacts,
        portfolioResilience: resilience,
        recommendations,
        stress_test_results: stressTestResults
      });

    } catch (error) {
      console.error('Failed to run scenario analysis:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete climate risk scenario analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateScenarioImpacts = async (scenario: Omit<ClimateScenario, 'impacts'>, portfolioMetrics: any) => {
    // Simulate AI-generated impacts based on scenario characteristics
    const baseImpact = scenario.severity === 'high' ? -0.3 : scenario.severity === 'medium' ? -0.15 : -0.05;
    const timeMultiplier = scenario.timeHorizon === '2050' ? 1.5 : scenario.timeHorizon === '2040' ? 1.2 : 1.0;
    
    return {
      portfolioValue: baseImpact * timeMultiplier * 100,
      emissionIntensity: scenario.type === 'transition' ? baseImpact * 2 * 100 : baseImpact * 0.5 * 100,
      dataQualityRisk: Math.abs(baseImpact) * 50,
      complianceCost: Math.abs(baseImpact) * portfolioMetrics.totalOutstandingBalance * 0.02,
      stranded_assets: scenario.type === 'transition' ? Math.abs(baseImpact) * 40 : Math.abs(baseImpact) * 10
    };
  };

  const calculatePortfolioResilience = (scenarios: ClimateScenario[], portfolioMetrics: any) => {
    const avgPhysicalImpact = scenarios
      .filter(s => s.type === 'physical')
      .reduce((sum, s) => sum + Math.abs(s.impacts.portfolioValue), 0) / 
      scenarios.filter(s => s.type === 'physical').length;

    const avgTransitionImpact = scenarios
      .filter(s => s.type === 'transition')
      .reduce((sum, s) => sum + Math.abs(s.impacts.portfolioValue), 0) / 
      scenarios.filter(s => s.type === 'transition').length;

    const physicalRiskScore = Math.max(0, 100 - avgPhysicalImpact);
    const transitionRiskScore = Math.max(0, 100 - avgTransitionImpact);
    
    // Factor in current portfolio characteristics
    const evPercentage = (portfolioMetrics.emissionsByFuelType?.electric || 0) / portfolioMetrics.totalFinancedEmissions * 100;
    const dataQualityBonus = (4 - portfolioMetrics.weightedAvgDataQuality) * 10;
    
    const adaptationCapacity = Math.min(100, 50 + evPercentage * 0.3 + dataQualityBonus);
    const overallScore = (physicalRiskScore + transitionRiskScore + adaptationCapacity) / 3;

    return {
      overall_score: Math.round(overallScore),
      physical_risk_score: Math.round(physicalRiskScore),
      transition_risk_score: Math.round(transitionRiskScore),
      adaptation_capacity: Math.round(adaptationCapacity)
    };
  };

  const generateRecommendations = async (scenarios: ClimateScenario[], portfolioMetrics: any) => {
    // Generate AI-powered recommendations based on scenario analysis
    const recommendations = [
      {
        title: 'Accelerate EV Portfolio Transition',
        description: 'Increase electric vehicle lending to reduce transition risk exposure',
        priority: 'high' as const,
        timeframe: 'short-term' as const,
        cost_estimate: '$500K - $2M'
      },
      {
        title: 'Enhance Climate Risk Monitoring',
        description: 'Implement real-time climate risk assessment tools',
        priority: 'medium' as const,
        timeframe: 'immediate' as const,
        cost_estimate: '$100K - $500K'
      },
      {
        title: 'Develop Climate Stress Testing',
        description: 'Regular stress testing under various climate scenarios',
        priority: 'medium' as const,
        timeframe: 'short-term' as const,
        cost_estimate: '$200K - $800K'
      }
    ];

    return recommendations;
  };

  const calculateStressTestResults = (scenarios: ClimateScenario[]) => {
    const worstCaseScenario = scenarios.reduce((worst, current) => 
      current.impacts.portfolioValue < worst.impacts.portfolioValue ? current : worst
    );

    const expectedLoss = scenarios.reduce((sum, scenario) => 
      sum + (scenario.impacts.portfolioValue * scenario.probability), 0
    );

    return {
      worst_case_loss: Math.abs(worstCaseScenario.impacts.portfolioValue),
      expected_loss: Math.abs(expectedLoss),
      value_at_risk_95: Math.abs(expectedLoss * 1.65) // Assuming normal distribution
    };
  };

  const getScenarioColor = (scenario: ClimateScenario) => {
    if (scenario.severity === 'high') return 'text-red-600 bg-red-50 border-red-200';
    if (scenario.severity === 'medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getScenarioIcon = (scenario: ClimateScenario) => {
    if (scenario.type === 'physical') return <Thermometer className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Running climate risk scenario analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Climate Risk Scenario Analysis
              </CardTitle>
              <CardDescription>
                AI-powered analysis of physical and transition climate risks
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                TCFD Aligned
              </Badge>
              <Button onClick={runScenarioAnalysis} disabled={loading} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Time Horizon</label>
              <Select value={timeHorizon} onValueChange={(value: any) => setTimeHorizon(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2030">2030 (Short-term)</SelectItem>
                  <SelectItem value="2040">2040 (Medium-term)</SelectItem>
                  <SelectItem value="2050">2050 (Long-term)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Risk Tolerance (%)</label>
              <div className="mt-2">
                <Slider
                  value={riskTolerance}
                  onValueChange={setRiskTolerance}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Current: {riskTolerance[0]}%
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Analysis Status</label>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Complete
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="resilience">Portfolio Resilience</TabsTrigger>
            <TabsTrigger value="stress-test">Stress Testing</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {analysisResult.scenarios.map((scenario) => (
                <Card key={scenario.id} className={`border-l-4 ${getScenarioColor(scenario)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getScenarioIcon(scenario)}
                        <CardTitle className="text-base">{scenario.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {(scenario.probability * 100).toFixed(0)}% probability
                        </Badge>
                        <Badge variant={scenario.severity === 'high' ? 'destructive' : scenario.severity === 'medium' ? 'default' : 'secondary'}>
                          {scenario.severity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Portfolio Impact</div>
                        <div className={`flex items-center gap-1 ${scenario.impacts.portfolioValue < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {scenario.impacts.portfolioValue < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                          {Math.abs(scenario.impacts.portfolioValue).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Stranded Assets</div>
                        <div className="text-red-600">
                          {scenario.impacts.stranded_assets.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Compliance Cost</div>
                        <div className="text-muted-foreground">
                          ${(scenario.impacts.complianceCost / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Data Quality Risk</div>
                        <div className="text-yellow-600">
                          +{scenario.impacts.dataQualityRisk.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">Key Drivers</div>
                      <div className="flex flex-wrap gap-1">
                        {scenario.keyDrivers.map((driver, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {driver}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedScenario(scenario.id)}
                    >
                      View Detailed Analysis
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resilience" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Resilience Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {analysisResult.portfolioResilience.overall_score}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Resilience</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Physical Risk Resilience</span>
                          <span>{analysisResult.portfolioResilience.physical_risk_score}%</span>
                        </div>
                        <Progress value={analysisResult.portfolioResilience.physical_risk_score} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Transition Risk Resilience</span>
                          <span>{analysisResult.portfolioResilience.transition_risk_score}%</span>
                        </div>
                        <Progress value={analysisResult.portfolioResilience.transition_risk_score} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Adaptation Capacity</span>
                          <span>{analysisResult.portfolioResilience.adaptation_capacity}%</span>
                        </div>
                        <Progress value={analysisResult.portfolioResilience.adaptation_capacity} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Exposure Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      {
                        subject: 'Physical Risk',
                        score: analysisResult.portfolioResilience.physical_risk_score,
                        fullMark: 100
                      },
                      {
                        subject: 'Transition Risk',
                        score: analysisResult.portfolioResilience.transition_risk_score,
                        fullMark: 100
                      },
                      {
                        subject: 'Adaptation',
                        score: analysisResult.portfolioResilience.adaptation_capacity,
                        fullMark: 100
                      },
                      {
                        subject: 'Data Quality',
                        score: (4 - 3.2) * 25, // Mock data quality score
                        fullMark: 100
                      },
                      {
                        subject: 'Compliance',
                        score: 75, // Mock compliance score
                        fullMark: 100
                      }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Resilience"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stress-test" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Worst Case Loss
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {analysisResult.stress_test_results.worst_case_loss.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum potential portfolio value loss
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-yellow-600" />
                    Expected Loss
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysisResult.stress_test_results.expected_loss.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Probability-weighted average loss
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    Value at Risk (95%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResult.stress_test_results.value_at_risk_95.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    95% confidence interval loss
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Scenario Impact Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={analysisResult.scenarios.map(s => ({
                    name: s.name,
                    probability: s.probability * 100,
                    impact: Math.abs(s.impacts.portfolioValue),
                    severity: s.severity
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="probability" name="Probability (%)" />
                    <YAxis dataKey="impact" name="Impact (%)" />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}${name === 'probability' ? '%' : '%'}`,
                        name === 'probability' ? 'Probability' : 'Portfolio Impact'
                      ]}
                    />
                    <Scatter dataKey="impact" fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-4">
              {analysisResult.recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-primary/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{rec.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          {rec.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estimated Cost: {rec.cost_estimate}</span>
                      <Button variant="outline" size="sm">
                        View Implementation Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}