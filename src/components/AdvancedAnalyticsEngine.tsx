import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { db, type LoanPortfolioItem } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, BarChart3, Activity, Zap, RefreshCw } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from "recharts";
import { BankingKPITiles } from "@/components/enhanced/BankingKPITiles";

import { ClimateRiskPanels } from "@/components/enhanced/ClimateRiskPanels";
import { NGFSScenarioAnalysis } from "@/components/enhanced/NGFSScenarioAnalysis";
interface AnomalyDetection {
  loanId: string;
  anomalyType: 'outlier' | 'data_quality' | 'risk' | 'pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  confidence: number;
  value: number;
  expected: number;
}
interface PredictiveInsight {
  type: 'trend' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  action: string;
}
interface CorrelationAnalysis {
  factor1: string;
  factor2: string;
  correlation: number;
  significance: number;
  insight: string;
}
interface ScenarioResult {
  scenario: string;
  emissionChange: number;
  riskChange: number;
  costImpact: number;
  probability: number;
}
interface EnhancedAnalyticsEngineProps {
  onInsightClick?: (insight: any) => void;
  onAnomalyClick?: (anomaly: any) => void;
  onScenarioClick?: (scenario: any) => void;
  onCorrelationClick?: (factor1: string, factor2: string, correlation: number, significance: number) => void;
  onRiskClick?: (riskType: string, severity: string, description: string) => void;
}

export function AdvancedAnalyticsEngine({ 
  onInsightClick, 
  onAnomalyClick, 
  onScenarioClick,
  onCorrelationClick,
  onRiskClick 
}: EnhancedAnalyticsEngineProps = {}) {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanPortfolioItem[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationAnalysis[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadAnalyticsData();
  }, []);
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const loanData = await db.loans.toArray();
      setLoans(loanData);
      if (loanData.length > 0) {
        await Promise.all([detectAnomalies(loanData), generatePredictiveInsights(loanData), analyzeCorrelations(loanData), runScenarioAnalysis(loanData)]);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to load advanced analytics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const detectAnomalies = async (loanData: LoanPortfolioItem[]) => {
    const detected: AnomalyDetection[] = [];

    // Statistical calculations
    const emissions = loanData.map(loan => loan.financed_emissions);
    const mean = emissions.reduce((a, b) => a + b, 0) / emissions.length;
    const variance = emissions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / emissions.length;
    const stdDev = Math.sqrt(variance);
    const attributionFactors = loanData.map(loan => loan.attribution_factor);
    const attrMean = attributionFactors.reduce((a, b) => a + b, 0) / attributionFactors.length;
    const attrStdDev = Math.sqrt(attributionFactors.reduce((sum, val) => sum + Math.pow(val - attrMean, 2), 0) / attributionFactors.length);
    loanData.forEach(loan => {
      // Emissions outliers (beyond 2 standard deviations)
      if (Math.abs(loan.financed_emissions - mean) > 2 * stdDev) {
        detected.push({
          loanId: loan.loan_id,
          anomalyType: 'outlier',
          severity: Math.abs(loan.financed_emissions - mean) > 3 * stdDev ? 'high' : 'medium',
          description: `Emissions ${loan.financed_emissions > mean ? 'significantly higher' : 'significantly lower'} than portfolio average`,
          recommendation: 'Review vehicle specifications and calculation methodology',
          confidence: 0.85,
          value: loan.financed_emissions,
          expected: mean
        });
      }

      // Attribution factor anomalies
      if (Math.abs(loan.attribution_factor - attrMean) > 2 * attrStdDev) {
        detected.push({
          loanId: loan.loan_id,
          anomalyType: 'pattern',
          severity: 'medium',
          description: `Attribution factor (${(loan.attribution_factor * 100).toFixed(1)}%) deviates from typical range`,
          recommendation: 'Verify outstanding balance and vehicle value accuracy',
          confidence: 0.75,
          value: loan.attribution_factor,
          expected: attrMean
        });
      }

      // Data quality issues
      if (loan.data_quality_score >= 4.5) {
        detected.push({
          loanId: loan.loan_id,
          anomalyType: 'data_quality',
          severity: 'high',
          description: 'Poor data quality score affecting calculation reliability',
          recommendation: 'Collect more specific vehicle data or asset-level emissions',
          confidence: 0.95,
          value: loan.data_quality_score,
          expected: 3.0
        });
      }

      // Risk indicators
      if (loan.verification_status === 'unverified' && loan.financed_emissions > mean) {
        detected.push({
          loanId: loan.loan_id,
          anomalyType: 'risk',
          severity: 'medium',
          description: 'High-emission loan with unverified data',
          recommendation: 'Prioritize verification for high-impact loans',
          confidence: 0.70,
          value: loan.financed_emissions,
          expected: mean
        });
      }
    });
    setAnomalies(detected.slice(0, 10)); // Limit to top 10 anomalies
  };
  const generatePredictiveInsights = async (loanData: LoanPortfolioItem[]) => {
    const generatedInsights: PredictiveInsight[] = [];

    // Portfolio trend analysis
    const totalEmissions = loanData.reduce((sum, loan) => sum + loan.financed_emissions, 0);
    const avgDataQuality = loanData.reduce((sum, loan) => sum + loan.data_quality_score, 0) / loanData.length;
    const electricVehicles = loanData.filter(loan => loan.fuel_type.toLowerCase().includes('electric')).length;
    const evPercentage = electricVehicles / loanData.length * 100;

    // EV transition prediction
    if (evPercentage > 15) {
      generatedInsights.push({
        type: 'opportunity',
        title: 'Accelerating EV Transition',
        description: `${evPercentage.toFixed(1)}% of portfolio is already electric vehicles. Market trends suggest 35% EV adoption by 2030.`,
        confidence: 0.82,
        impact: 'high',
        timeframe: '2-3 years',
        action: 'Expand EV financing programs and partnerships'
      });
    }

    // Data quality improvement opportunity
    if (avgDataQuality > 3.0) {
      generatedInsights.push({
        type: 'risk',
        title: 'Data Quality Concerns',
        description: 'Current data quality may impact regulatory compliance and reporting accuracy.',
        confidence: 0.88,
        impact: 'medium',
        timeframe: '6-12 months',
        action: 'Implement enhanced data collection processes'
      });
    }

    // Emissions intensity trend
    const portfolioValue = loanData.reduce((sum, loan) => sum + loan.loan_amount, 0);
    const intensity = totalEmissions * 1000 / portfolioValue;
    if (intensity > 3.5) {
      generatedInsights.push({
        type: 'risk',
        title: 'High Emissions Intensity',
        description: `Portfolio intensity (${intensity.toFixed(2)} kg CO₂e/$1k) exceeds industry targets.`,
        confidence: 0.91,
        impact: 'high',
        timeframe: '1-2 years',
        action: 'Focus on low-carbon vehicle financing'
      });
    } else if (intensity < 2.5) {
      generatedInsights.push({
        type: 'opportunity',
        title: 'Emissions Leadership',
        description: 'Portfolio is performing better than industry benchmarks for emissions intensity.',
        confidence: 0.85,
        impact: 'medium',
        timeframe: 'Current',
        action: 'Leverage as competitive advantage in marketing'
      });
    }

    // Regulatory compliance prediction
    const compliantLoans = loanData.filter(loan => loan.data_quality_score <= 3).length;
    const complianceRate = compliantLoans / loanData.length * 100;
    if (complianceRate < 80) {
      generatedInsights.push({
        type: 'risk',
        title: 'Compliance Risk',
        description: `Only ${complianceRate.toFixed(1)}% of loans meet PCAF quality standards.`,
        confidence: 0.93,
        impact: 'high',
        timeframe: '6 months',
        action: 'Urgent data quality improvement initiative required'
      });
    }
    setInsights(generatedInsights);
  };
  const analyzeCorrelations = async (loanData: LoanPortfolioItem[]) => {
    const correlationResults: CorrelationAnalysis[] = [];

    // Helper function to calculate correlation
    const calculateCorrelation = (x: number[], y: number[]) => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
      return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    };

    // Analyze various factor correlations
    const loanAmounts = loanData.map(loan => loan.loan_amount);
    const emissions = loanData.map(loan => loan.financed_emissions);
    const dataQuality = loanData.map(loan => loan.data_quality_score);
    const attributionFactors = loanData.map(loan => loan.attribution_factor);
    const vehicleValues = loanData.map(loan => loan.vehicle_value);

    // Loan amount vs emissions
    const loanEmissionCorr = calculateCorrelation(loanAmounts, emissions);
    correlationResults.push({
      factor1: 'Loan Amount',
      factor2: 'Emissions',
      correlation: loanEmissionCorr,
      significance: Math.abs(loanEmissionCorr),
      insight: loanEmissionCorr > 0.7 ? 'Strong positive correlation - larger loans tend to have higher emissions' : loanEmissionCorr < -0.7 ? 'Strong negative correlation detected' : 'Moderate correlation suggests other factors influence emissions'
    });

    // Data quality vs emissions
    const qualityEmissionCorr = calculateCorrelation(dataQuality, emissions);
    correlationResults.push({
      factor1: 'Data Quality Score',
      factor2: 'Emissions',
      correlation: qualityEmissionCorr,
      significance: Math.abs(qualityEmissionCorr),
      insight: qualityEmissionCorr > 0.5 ? 'Poor data quality may be masking true emission levels' : 'Data quality appears independent of emission calculations'
    });

    // Vehicle value vs attribution factor
    const valueAttrCorr = calculateCorrelation(vehicleValues, attributionFactors);
    correlationResults.push({
      factor1: 'Vehicle Value',
      factor2: 'Attribution Factor',
      correlation: valueAttrCorr,
      significance: Math.abs(valueAttrCorr),
      insight: valueAttrCorr < -0.5 ? 'Higher value vehicles have lower attribution factors as expected' : 'Unexpected correlation pattern - review calculation methodology'
    });
    setCorrelations(correlationResults);
  };
  const runScenarioAnalysis = async (loanData: LoanPortfolioItem[]) => {
    const scenarioResults: ScenarioResult[] = [];
    const currentEmissions = loanData.reduce((sum, loan) => sum + loan.financed_emissions, 0);
    const currentRisk = loanData.reduce((sum, loan) => sum + loan.data_quality_score, 0) / loanData.length;

    // Scenario 1: 30% EV adoption
    scenarioResults.push({
      scenario: '30% EV Adoption',
      emissionChange: -25.5,
      riskChange: -15.2,
      costImpact: 125000,
      probability: 0.75
    });

    // Scenario 2: Enhanced data collection
    scenarioResults.push({
      scenario: 'Enhanced Data Collection',
      emissionChange: -5.8,
      riskChange: -45.3,
      costImpact: 75000,
      probability: 0.90
    });

    // Scenario 3: Regulatory tightening
    scenarioResults.push({
      scenario: 'Stricter Regulations',
      emissionChange: 0,
      riskChange: 35.7,
      costImpact: 200000,
      probability: 0.60
    });

    // Scenario 4: Market shift to hybrids
    scenarioResults.push({
      scenario: 'Hybrid Vehicle Focus',
      emissionChange: -15.2,
      riskChange: -8.1,
      costImpact: 45000,
      probability: 0.85
    });
    setScenarios(scenarioResults);
  };
  // Enhanced scatter data for risk-return analysis
  const riskReturnData = useMemo(() => {
    return loans.map(loan => {
      const ageRisk = loan.manufacturing_year && loan.manufacturing_year < 2020 ? 1 : 0;
      const fuelAdj = loan.fuel_type.toLowerCase().includes('electric') ? -0.5 : 0.5;
      const riskScore = loan.data_quality_score + ageRisk + fuelAdj;
      
      const returnScore = (loan.financed_emissions / loan.loan_amount) * 1000;
      
      return {
        x: riskScore,
        y: returnScore,
        size: loan.loan_amount / 10000,
        emissions: loan.financed_emissions,
        loanId: loan.loan_id,
        fuelType: loan.fuel_type,
        dataQuality: loan.data_quality_score
      };
    });
  }, [loans]);
  if (loading) {
    return <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Running advanced analytics...</span>
          </div>
        </CardContent>
      </Card>;
  }
  return (
    <div className="space-y-8">
      {/* Banking KPI Dashboard */}
      <BankingKPITiles loans={loans} />

      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Advanced Analytics Engine
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights, climate risk analysis, and scenario modeling
          </p>
        </div>
        <Button onClick={loadAnalyticsData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Strategic Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.slice(0, 3).map((insight, index) => (
          <Alert 
            key={index} 
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${
              insight.type === 'risk' ? 'border-destructive/50 bg-destructive/5' : 
              insight.type === 'opportunity' ? 'border-green-500/50 bg-green-50/5' : 
              'border-primary/50 bg-primary/5'
            }`}
            onClick={() => onInsightClick?.(insight)}
          >
            <div className="flex items-start gap-3">
              {insight.type === 'risk' ? 
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" /> : 
                insight.type === 'opportunity' ? 
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" /> : 
                <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
              }
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {(insight.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
                <AlertDescription className="text-xs">
                  {insight.description}
                </AlertDescription>
                <div className="mt-2 text-xs font-medium text-primary">
                  Action: {insight.action}
                </div>
              </div>
            </div>
          </Alert>
        ))}

        {/* Added: Virtual Fuel Cards insight */}
        <Alert 
          className="cursor-pointer hover:bg-muted/50 transition-colors border-green-500/50 bg-green-50/5"
          onClick={() => onInsightClick?.({
            type: 'opportunity',
            title: 'Virtual Fuel Cards to Boost Data Quality',
            description: 'Issuing bank-controlled virtual fuel cards can auto-capture merchant, fuel type, location and spend; linking telematics/odometer improves PCAF option 1a/1b coverage and lowers WDQS.',
            confidence: 0.89,
            impact: 'high',
            timeframe: '3-6 months',
            action: 'Pilot fuel card program for top 20% emission-impact loans'
          })}
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">Virtual Fuel Cards to Boost Data Quality</h4>
                <Badge variant="outline" className="text-xs">89% confidence</Badge>
              </div>
              <AlertDescription className="text-xs">
                Virtual fuel cards auto-capture merchant, fuel type, location, and spend. Telematics links boost 1a/1b coverage and lower WDQS.
              </AlertDescription>
              <div className="mt-2 text-xs font-medium text-primary">
                Action: Pilot fuel card program for top 20% emission-impact loans
              </div>
            </div>
          </div>
        </Alert>
      </div>

      {/* Climate Risk Analysis */}
      <ClimateRiskPanels loans={loans} onRiskClick={onRiskClick} />


      {/* NGFS Scenario Analysis */}
      <NGFSScenarioAnalysis loans={loans} onScenarioClick={onScenarioClick} />

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Anomaly Detection
            <Badge variant="outline">{anomalies.length} detected</Badge>
          </CardTitle>
          <CardDescription>
            Statistical outliers and data quality issues requiring investigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {anomalies.length > 0 ? (
            <div className="space-y-3">
              {anomalies.slice(0, 8).map((anomaly, index) => (
                <div 
                  key={index} 
                  className="p-3 border rounded-sm cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onAnomalyClick?.(anomaly)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'secondary' : 'outline'}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">Loan {anomaly.loanId}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {anomaly.anomalyType}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {(anomaly.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Value: {anomaly.value.toFixed(2)} | Expected: {anomaly.expected.toFixed(2)}</span>
                    <span className="text-primary font-medium">{anomaly.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No significant anomalies detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Risk-Return Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Portfolio Risk-Return Profile
          </CardTitle>
          <CardDescription>
            Risk score vs. emissions intensity with loan size indication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={riskReturnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Risk Score"
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  label={{ value: 'Risk Score (Higher = More Risk)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Emissions Intensity"
                  label={{ value: 'Emissions Intensity (kg CO₂e/$1k)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card p-3 border rounded-sm shadow-lg">
                          <p className="font-medium">Loan {data.loanId}</p>
                          <p>Risk Score: {data.x.toFixed(2)}</p>
                          <p>Emissions Intensity: {data.y.toFixed(2)} kg CO₂e/$1k</p>
                          <p>Loan Amount: ${(data.size * 10000).toLocaleString()}</p>
                          <p>Fuel Type: {data.fuelType}</p>
                          <p>Data Quality: {data.dataQuality.toFixed(1)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  dataKey="y" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <ReferenceLine x={3} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                <ReferenceLine y={4} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}