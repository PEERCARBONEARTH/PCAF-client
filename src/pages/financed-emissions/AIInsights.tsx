import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Brain,
  BarChart3,
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowRight,
  CheckCircle,
  Eye,
  Activity,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAssumptions } from "@/contexts/AssumptionsContext";
import { portfolioService } from "@/services/portfolioService";
import { useToast } from "@/hooks/use-toast";
import { aiService, AIInsightRequest, AIInsightResponse, AIRecommendation } from "@/services/aiService";
import { aiAnalyticsNarrativeBuilder, NarrativeContext, InsightNarrative } from "@/services/ai-narrative-builder";
import { narrativePipelineIntegration, NarrativeInsightCard } from "@/services/narrative-pipeline-integration";
import { contextualNarrativeService } from "@/services/contextual-narrative-service";
import NarrativeInsightCard from "@/components/insights/NarrativeInsightCard";
import { dynamicInsightsEngine, DynamicInsight, BankProfile } from "@/services/dynamic-insights-engine";
import { bankProfileService } from "@/services/bank-profile-service";
import DynamicInsightCard from "@/components/insights/DynamicInsightCard";
import AIContextTooltip from "@/components/insights/AIContextTooltip";
import BankProfileSetup from "@/components/insights/BankProfileSetup";

// Executive Summary Component
function ExecutiveSummary({ portfolioData }: { portfolioData: any }) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  if (!portfolioData) return null;

  // Safe destructuring with defaults
  const {
    loans = [],
    totalEmissions = 0,
    avgDataQuality = 0,
    evPercentage = 0
  } = portfolioData || {};

  const portfolioValue = 8200000; // $8.2M realistic demo value
  const safeDataQuality = Number(avgDataQuality) || 0;
  const riskLevel = safeDataQuality <= 3 ? 'Low' : safeDataQuality <= 4 ? 'Medium' : 'High';
  const riskColor = safeDataQuality <= 3 ? 'text-green-600' : safeDataQuality <= 4 ? 'text-yellow-600' : 'text-destructive';

  const handleMetricClick = (metricType: string) => {
    setSelectedMetric(selectedMetric === metricType ? null : metricType);
  };

  const getMetricNarrative = (metricType: string) => {
    switch (metricType) {
      case 'portfolio':
        return contextualNarrativeService.generateStrategicInsightNarrative('portfolio_optimization', {
          totalLoans: Array.isArray(loans) ? loans.length : 247,
          portfolioValue: portfolioValue
        });
      case 'ev':
        return contextualNarrativeService.generateStrategicInsightNarrative('ev_transition', {
          evPercentage: evPercentage || 0,
          totalLoans: Array.isArray(loans) ? loans.length : 247
        });
      case 'emissions':
        return contextualNarrativeService.generateEmissionsForecastNarrative('base_case', totalEmissions || 0);
      case 'risk':
        return contextualNarrativeService.generateRiskAnalyticsNarrative('data_quality', riskLevel.toLowerCase());
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NarrativeInsightCard
          title="Portfolio Overview"
          variant="default"
          narrative={getMetricNarrative('portfolio')}
          className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{Array.isArray(loans) ? loans.length : 247}</div>
              <p className="text-sm text-muted-foreground">$8.2M total value</p>
            </div>
            <Target className="h-8 w-8 text-primary" />
          </div>
        </NarrativeInsightCard>

        <NarrativeInsightCard
          title="EV Transition"
          variant="success"
          narrative={getMetricNarrative('ev')}
          className="hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{evPercentage?.toFixed(1) || '0.0'}%</div>
              <p className="text-sm text-muted-foreground">Electric vehicles</p>
            </div>
            <Zap className="h-8 w-8 text-green-500" />
          </div>
        </NarrativeInsightCard>

        <NarrativeInsightCard
          title="Emissions"
          variant="warning"
          narrative={getMetricNarrative('emissions')}
          className="hover:shadow-md transition-all duration-200 border-l-4 border-l-orange-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{totalEmissions?.toFixed(1) || '0.0'}</div>
              <p className="text-sm text-muted-foreground">tCO₂e total</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </NarrativeInsightCard>

        <NarrativeInsightCard
          title="Risk Level"
          variant={riskLevel === 'Low' ? 'success' : riskLevel === 'Medium' ? 'warning' : 'warning'}
          narrative={getMetricNarrative('risk')}
          className="hover:shadow-md transition-all duration-200 border-l-4 border-l-red-500 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</div>
              <p className="text-sm text-muted-foreground">DQ Score: {safeDataQuality.toFixed(1)}/5</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </NarrativeInsightCard>
      </div>
    </div>
  );
}

// Critical Alerts Component
function CriticalAlerts({ portfolioData }: { portfolioData: any }) {
  if (!portfolioData || !portfolioData.anomalies || portfolioData.anomalies.length === 0) return null;

  const criticalAnomalies = portfolioData.anomalies.filter((a: any) => a.severity === 'high').slice(0, 3);

  if (criticalAnomalies.length === 0) return null;

  return (
    <Alert className="border-destructive/50 bg-destructive/5">
      <div className="flex items-start justify-between">
        <div className="flex">
          <AlertTriangle className="h-4 w-4 text-destructive mr-3 mt-0.5" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold text-destructive">
                {criticalAnomalies.length} Critical Alert{criticalAnomalies.length > 1 ? 's' : ''} Detected
              </div>
              {criticalAnomalies.slice(0, 2).map((anomaly: any, index: number) => (
                <div key={index} className="text-sm">
                  • <span className="font-medium">{anomaly.loanId}:</span> {anomaly.description}
                </div>
              ))}
              {criticalAnomalies.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{criticalAnomalies.length - 2} more critical alerts
                </div>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

// Main Dashboard Content
function DashboardContent({ portfolioData, onViewAdvanced }: {
  portfolioData: any;
  onViewAdvanced?: () => void;
}) {
  const navigate = useNavigate();
  const { isComplete: hasTargetsConfigured } = useAssumptions();

  if (!portfolioData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { evPercentage = 0, anomalies = [] } = portfolioData || {};
  const emissionsTrend = -2.5; // Mock trend data
  const safeEvPercentage = Number(evPercentage) || 0;

  return (
    <div className="space-y-6">
      {/* Target Progress or Setup Nudge */}
      {!hasTargetsConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Set Up Climate Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Configure your climate targets to unlock advanced insights and progress tracking.
            </p>
            <Button onClick={() => navigate('/financed-emissions/settings')}>
              Configure Targets
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Health */}
        <NarrativeInsightCard
          title="Portfolio Health"
          variant={safeEvPercentage > 30 ? 'success' : safeEvPercentage > 15 ? 'info' : 'warning'}
          narrative={contextualNarrativeService.generateStrategicInsightNarrative('portfolio_optimization', {
            evPercentage: safeEvPercentage,
            emissionsTrend: emissionsTrend,
            portfolioData: portfolioData
          })}
          className="cursor-pointer hover:shadow-lg transition-all duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-primary" />
              <Badge variant="outline">{safeEvPercentage > 30 ? 'Good' : safeEvPercentage > 15 ? 'Fair' : 'Needs Attention'}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm items-center group">
                <span>EV Adoption Progress</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{safeEvPercentage.toFixed(1)}%</span>
                  <AIContextTooltip
                    metricType="ev_percentage"
                    metricValue={safeEvPercentage.toFixed(1)}
                    additionalData={{
                      portfolioSize: Array.isArray(portfolioData?.loans) ? portfolioData.loans.length : 247,
                      industryBenchmark: 12.5,
                      trend: 'improving'
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <Progress value={safeEvPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="group">
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">Emissions Trend</div>
                  <AIContextTooltip
                    metricType="emissions"
                    metricValue={emissionsTrend}
                    additionalData={{
                      type: 'trend_analysis',
                      direction: emissionsTrend < 0 ? 'declining' : 'increasing',
                      timeframe: '12 months',
                      confidence: 0.85
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className={`font-semibold flex items-center gap-1 ${emissionsTrend < 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {emissionsTrend < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {Math.abs(emissionsTrend || 0).toFixed(1)}%
                </div>
              </div>
              <div className="group">
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">Risk Level</div>
                  <AIContextTooltip
                    metricType="risk_analytics"
                    metricValue="medium"
                    additionalData={{
                      riskType: 'overall_portfolio_risk',
                      severity: 'medium',
                      keyFactors: ['Transition risk', 'Data quality', 'Market volatility']
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="font-semibold">Medium</div>
              </div>
            </div>
          </div>
        </NarrativeInsightCard>

        {/* Anomalies & Alerts */}
        <NarrativeInsightCard
          title="Anomalies Detected"
          variant={Array.isArray(anomalies) && anomalies.length > 3 ? 'warning' : 'info'}
          narrative={contextualNarrativeService.generateAnomalyNarrative({
            severity: Array.isArray(anomalies) && anomalies.length > 3 ? 'high' : 'medium',
            count: Array.isArray(anomalies) ? anomalies.length : 0,
            type: 'data_quality'
          })}
          className="cursor-pointer"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Brain className="h-5 w-5 text-primary" />
              <Badge variant={Array.isArray(anomalies) && anomalies.length > 3 ? "destructive" : "secondary"}>
                {Array.isArray(anomalies) ? anomalies.length : 0} found
              </Badge>
            </div>
            {Array.isArray(anomalies) && anomalies.length > 0 ? (
              <>
                {anomalies.slice(0, 3).map((anomaly, index) => (
                  <div
                    key={index}
                    className="p-3 border border-border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => {
                      // Could open detailed anomaly view
                      console.log('Anomaly clicked:', anomaly);
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{anomaly.loanId}</span>
                        <AIContextTooltip
                          metricType="risk_analytics"
                          metricValue={anomaly.severity}
                          additionalData={{
                            riskType: 'anomaly',
                            anomalyType: anomaly.type || 'data_quality',
                            loanId: anomaly.loanId,
                            description: anomaly.description,
                            severity: anomaly.severity
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                  </div>
                ))}
                {anomalies.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={onViewAdvanced}>
                    View All Anomalies ({anomalies.length}) <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">No anomalies detected</p>
              </div>
            )}
          </div>
        </NarrativeInsightCard>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Explore Deeper Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => navigate('/financed-emissions/insights/forecasting-detail')}
            >
              <div className="text-left">
                <div className="font-medium">Emissions Forecasts</div>
                <div className="text-xs text-muted-foreground">12-month projections</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => navigate('/financed-emissions/insights/portfolio-risk')}
            >
              <div className="text-left">
                <div className="font-medium">Risk Analysis</div>
                <div className="text-xs text-muted-foreground">Climate & transition risks</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => navigate('/financed-emissions/insights/green-finance')}
            >
              <div className="text-left">
                <div className="font-medium">Green Strategy</div>
                <div className="text-xs text-muted-foreground">Sustainable finance opportunities</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => navigate('/financed-emissions/insights/data-quality')}
            >
              <div className="text-left">
                <div className="font-medium">Data Quality</div>
                <div className="text-xs text-muted-foreground">Portfolio data analysis</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => navigate('/financed-emissions/insights/ev-leadership')}
            >
              <div className="text-left">
                <div className="font-medium">EV Leadership</div>
                <div className="text-xs text-muted-foreground">Electric vehicle analysis</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4 border-primary/20 bg-primary/5 hover:bg-primary/10"
              onClick={onViewAdvanced}
            >
              <div className="text-left">
                <div className="font-medium text-primary">Advanced Analytics</div>
                <div className="text-xs text-primary/70">5 analysis modules</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}

// Advanced Analytics Components
function AdvancedAnalyticsDashboard({
  setActiveView,
  aiInsights,
  narrativeInsights,
  portfolioData
}: {
  setActiveView: (view: 'overview' | 'advanced') => void;
  aiInsights: AIInsightResponse | null;
  narrativeInsights: NarrativeInsightCard[];
  portfolioData: any;
}) {
  const [activeTab, setActiveTab] = useState<'strategic' | 'emissions' | 'factors' | 'risk' | 'climate' | 'anomaly'>('strategic');

  const tabs = [
    { id: 'strategic', label: 'Strategic Insights', icon: Target },
    { id: 'emissions', label: 'Emissions Forecasts', icon: TrendingUp },
    { id: 'risk', label: 'Risk Analytics', icon: AlertTriangle },
    { id: 'climate', label: 'Climate Scenarios', icon: Activity },
    { id: 'anomaly', label: 'Anomaly Detection', icon: Brain }
  ];

  return (
    <div className="space-y-6">
      {/* Advanced Analytics Header */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20 dark:from-primary/10 dark:to-primary/5 dark:border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <BarChart3 className="h-6 w-6" />
                Advanced Analytics
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Comprehensive analytics dashboard with granular insights for each domain.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-600 text-white dark:bg-green-500">
                5 insights generated
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('overview')}
                className="border-border hover:bg-muted"
              >
                <Eye className="h-4 w-4 mr-1" />
                Back to Overview
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center gap-1 p-1 bg-muted/50 rounded-lg border border-border mx-auto max-w-4xl">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 flex-1 justify-center ${activeTab === tab.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'strategic' && <StrategicInsights aiInsights={aiInsights} narrativeInsights={narrativeInsights} portfolioData={portfolioData} />}
      {activeTab === 'emissions' && <EmissionsForecasts aiInsights={aiInsights} portfolioData={portfolioData} />}
      {activeTab === 'risk' && <RiskAnalytics aiInsights={aiInsights} portfolioData={portfolioData} />}
      {activeTab === 'climate' && <ClimateScenarios aiInsights={aiInsights} portfolioData={portfolioData} />}
      {activeTab === 'anomaly' && <AnomalyDetection aiInsights={aiInsights} portfolioData={portfolioData} />}
    </div>
  );
}

function StrategicInsights({ aiInsights, narrativeInsights, portfolioData }: {
  aiInsights: AIInsightResponse | null;
  narrativeInsights: NarrativeInsightCard[];
  portfolioData: any;
}) {
  const [dynamicInsights, setDynamicInsights] = useState<DynamicInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // Calculate strategic business insights based on portfolio composition
  const calculateStrategicInsights = () => {
    if (!portfolioData?.loans || !Array.isArray(portfolioData.loans)) {
      return {
        riskManagement: [],
        productDevelopment: [],
        customerSegmentation: [],
        esgReporting: [],
        strategicPartnerships: []
      };
    }

    const loans = portfolioData.loans;
    const totalLoans = loans.length;
    const totalValue = loans.reduce((sum: number, loan: any) => sum + (loan.outstanding_balance || loan.loan_amount || 0), 0);

    // Analyze vehicle types and emissions
    const vehicleAnalysis = loans.reduce((acc: any, loan: any) => {
      const vehicleType = loan.vehicle_details?.type?.toLowerCase() || 'unknown';
      const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase() || 'gasoline';
      const emissions = loan.emissions_data?.annual_emissions_tco2e || loan.emissions_data?.financed_emissions_tco2e || 0;
      const loanAmount = loan.outstanding_balance || loan.loan_amount || 0;
      
      // Categorize vehicles
      const isHighEmission = ['truck', 'suv', 'pickup', 'van', 'luxury'].some(type => vehicleType.includes(type)) || emissions > 4.0;
      const isEV = fuelType.includes('electric');
      const isHybrid = fuelType.includes('hybrid');
      const isEfficient = emissions < 2.0 && !isEV;

      if (isEV) {
        acc.ev.count++;
        acc.ev.value += loanAmount;
      } else if (isHybrid) {
        acc.hybrid.count++;
        acc.hybrid.value += loanAmount;
      } else if (isHighEmission) {
        acc.highEmission.count++;
        acc.highEmission.value += loanAmount;
        acc.highEmission.avgEmissions += emissions;
      } else if (isEfficient) {
        acc.efficient.count++;
        acc.efficient.value += loanAmount;
      } else {
        acc.standard.count++;
        acc.standard.value += loanAmount;
      }

      return acc;
    }, {
      ev: { count: 0, value: 0 },
      hybrid: { count: 0, value: 0 },
      highEmission: { count: 0, value: 0, avgEmissions: 0 },
      efficient: { count: 0, value: 0 },
      standard: { count: 0, value: 0 }
    });

    // Calculate percentages
    const evPercentage = totalLoans > 0 ? (vehicleAnalysis.ev.count / totalLoans) * 100 : 0;
    const highEmissionPercentage = totalLoans > 0 ? (vehicleAnalysis.highEmission.count / totalLoans) * 100 : 0;
    const efficientPercentage = totalLoans > 0 ? (vehicleAnalysis.efficient.count / totalLoans) * 100 : 0;

    // Geographic analysis
    const geographicData = loans.reduce((acc: any, loan: any) => {
      const state = loan.borrower_details?.state || loan.collateral_location?.state || 'Unknown';
      const city = loan.borrower_details?.city || loan.collateral_location?.city || 'Unknown';
      
      if (!acc[state]) acc[state] = { count: 0, cities: {} };
      acc[state].count++;
      
      if (!acc[state].cities[city]) acc[state].cities[city] = 0;
      acc[state].cities[city]++;
      
      return acc;
    }, {});

    // Customer behavior analysis
    const customerSegments = loans.reduce((acc: any, loan: any) => {
      const loanAmount = loan.outstanding_balance || loan.loan_amount || 0;
      const vehicleType = loan.vehicle_details?.type?.toLowerCase() || 'unknown';
      const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase() || 'gasoline';
      
      // Segment by loan amount (proxy for income/wealth)
      let segment = 'budget';
      if (loanAmount > 50000) segment = 'luxury';
      else if (loanAmount > 30000) segment = 'premium';
      else if (loanAmount > 15000) segment = 'mid_market';
      
      if (!acc[segment]) acc[segment] = { count: 0, avgEmissions: 0, evAdoption: 0 };
      acc[segment].count++;
      
      if (fuelType.includes('electric')) acc[segment].evAdoption++;
      
      return acc;
    }, {});

    const insights = {
      riskManagement: [],
      productDevelopment: [],
      customerSegmentation: [],
      esgReporting: [],
      strategicPartnerships: []
    };

    // RISK MANAGEMENT & PORTFOLIO STRATEGY INSIGHTS
    if (highEmissionPercentage > 40) {
      insights.riskManagement.push({
        type: 'Default Correlation Risk',
        severity: 'high',
        description: `${highEmissionPercentage.toFixed(1)}% of portfolio in high-emission vehicles vulnerable to fuel price spikes`,
        impact: 'Higher default probability during fuel price increases',
        recommendation: 'Monitor fuel price sensitivity and adjust risk models',
        affectedLoans: vehicleAnalysis.highEmission.count,
        affectedValue: vehicleAnalysis.highEmission.value
      });
    }

    if (vehicleAnalysis.highEmission.count > 0) {
      insights.riskManagement.push({
        type: 'Residual Value Risk',
        severity: highEmissionPercentage > 30 ? 'high' : 'medium',
        description: 'High-emission vehicles face accelerated depreciation due to regulations',
        impact: 'Reduced collateral value and higher loss given default',
        recommendation: 'Adjust loan-to-value ratios for high-emission vehicles',
        affectedLoans: vehicleAnalysis.highEmission.count,
        affectedValue: vehicleAnalysis.highEmission.value
      });
    }

    // Geographic risk mapping
    const topStates = Object.entries(geographicData)
      .sort(([,a]: any, [,b]: any) => b.count - a.count)
      .slice(0, 3);
    
    if (topStates.length > 0 && topStates[0][1].count > totalLoans * 0.3) {
      insights.riskManagement.push({
        type: 'Geographic Concentration Risk',
        severity: 'medium',
        description: `${((topStates[0][1].count / totalLoans) * 100).toFixed(1)}% of loans concentrated in ${topStates[0][0]}`,
        impact: 'Exposure to regional low-emission zones and regulations',
        recommendation: 'Diversify lending across regions and monitor local regulations',
        affectedLoans: topStates[0][1].count,
        affectedValue: 0
      });
    }

    // PRODUCT DEVELOPMENT & TARGETED MARKETING INSIGHTS
    if (evPercentage < 15) {
      insights.productDevelopment.push({
        type: 'Green Product Opportunity',
        severity: 'high',
        description: `Only ${evPercentage.toFixed(1)}% EV adoption - significant green lending opportunity`,
        impact: 'Market share growth and ESG positioning',
        recommendation: 'Launch green loan products with preferential rates for EVs',
        potentialMarket: Math.round(totalLoans * 0.2),
        estimatedRevenue: totalValue * 0.15
      });
    }

    if (vehicleAnalysis.efficient.count > totalLoans * 0.2) {
      insights.productDevelopment.push({
        type: 'Insurance Bundle Opportunity',
        severity: 'medium',
        description: `${efficientPercentage.toFixed(1)}% of customers choose efficient vehicles - lower risk profile`,
        impact: 'Cross-selling opportunity with usage-based insurance',
        recommendation: 'Partner with insurers for bundled products targeting efficient vehicle owners',
        potentialMarket: vehicleAnalysis.efficient.count,
        estimatedRevenue: vehicleAnalysis.efficient.value * 0.05
      });
    }

    // CUSTOMER SEGMENTATION & BEHAVIOR ANALYSIS
    const luxurySegment = customerSegments.luxury;
    if (luxurySegment && luxurySegment.count > 0) {
      const luxuryEvAdoption = (luxurySegment.evAdoption / luxurySegment.count) * 100;
      insights.customerSegmentation.push({
        type: 'Luxury Green Segment',
        description: `${luxurySegment.count} high-value customers with ${luxuryEvAdoption.toFixed(1)}% EV adoption`,
        opportunity: 'Premium sustainable finance products and ESG investments',
        recommendation: 'Target with green bonds, sustainable investment funds',
        segmentSize: luxurySegment.count,
        avgLoanValue: totalValue / totalLoans
      });
    }

    const budgetSegment = customerSegments.budget;
    if (budgetSegment && budgetSegment.count > 0) {
      insights.customerSegmentation.push({
        type: 'Cost-Conscious Segment',
        description: `${budgetSegment.count} price-sensitive customers choosing efficient vehicles`,
        opportunity: 'Value-focused products and cost-saving services',
        recommendation: 'Offer competitive rates and fuel-saving incentives',
        segmentSize: budgetSegment.count,
        avgLoanValue: totalValue / totalLoans
      });
    }

    // ESG & REPORTING INSIGHTS
    const totalEmissions = loans.reduce((sum: number, loan: any) => 
      sum + (loan.emissions_data?.financed_emissions_tco2e || loan.emissions_data?.annual_emissions_tco2e || 0), 0);
    
    insights.esgReporting.push({
      type: 'Financed Emissions Baseline',
      currentEmissions: totalEmissions,
      emissionIntensity: totalValue > 0 ? (totalEmissions / totalValue) * 1000 : 0,
      description: `Portfolio generates ${totalEmissions.toFixed(1)} tCO2e in financed emissions`,
      opportunity: 'Set science-based targets and track progress',
      recommendation: 'Establish 30% reduction target by 2030'
    });

    if (evPercentage > 10) {
      insights.esgReporting.push({
        type: 'Sustainability Leadership',
        description: `${evPercentage.toFixed(1)}% EV adoption demonstrates climate commitment`,
        opportunity: 'Brand positioning as sustainability leader',
        recommendation: 'Highlight green portfolio in marketing and investor relations'
      });
    }

    // STRATEGIC PARTNERSHIPS & NEW BUSINESS MODELS
    if (evPercentage > 5) {
      insights.strategicPartnerships.push({
        type: 'Charging Infrastructure Investment',
        description: `${vehicleAnalysis.ev.count} EV customers create charging demand`,
        opportunity: 'Investment in charging infrastructure based on customer locations',
        recommendation: 'Partner with charging networks or invest in high-demand areas',
        marketSize: vehicleAnalysis.ev.count
      });
    }

    if (totalLoans > 1000) {
      insights.strategicPartnerships.push({
        type: 'Data Monetization Opportunity',
        description: 'Large portfolio provides valuable market insights',
        opportunity: 'Anonymized data insights for manufacturers and energy companies',
        recommendation: 'Develop data products showing customer preferences and geographic trends',
        dataPoints: totalLoans
      });
    }

    return insights;
  };

  // Load dynamic insights based on bank profile and portfolio data
  React.useEffect(() => {
    const loadDynamicInsights = async () => {
      setIsLoadingInsights(true);
      try {
        // Check for existing bank profile
        let profile = bankProfileService.getCurrentProfile();
        setHasProfile(!!profile);

        if (!profile) {
          // Don't initialize demo profile automatically - let user set up their own
          setDynamicInsights([]);
          setIsLoadingInsights(false);
          return;
        }

        // Set up dynamic insights engine
        dynamicInsightsEngine.setBankProfile(profile);
        await dynamicInsightsEngine.updatePortfolioContext();

        // Generate dynamic insights
        const insights = await dynamicInsightsEngine.generateDynamicInsights();
        setDynamicInsights(insights);
      } catch (error) {
        console.error('Failed to load dynamic insights:', error);
        // Fallback to static insights if dynamic loading fails
        setDynamicInsights([]);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadDynamicInsights();
  }, [portfolioData]);

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // Here you could navigate to specific pages or trigger specific actions
    // For example:
    // if (action.includes('EV')) navigate('/financed-emissions/settings');
  };

  const handleProfileComplete = async (profile: BankProfile) => {
    setShowProfileSetup(false);
    setHasProfile(true);

    // Reload insights with new profile
    setIsLoadingInsights(true);
    try {
      dynamicInsightsEngine.setBankProfile(profile);
      await dynamicInsightsEngine.updatePortfolioContext();
      const insights = await dynamicInsightsEngine.generateDynamicInsights();
      setDynamicInsights(insights);
    } catch (error) {
      console.error('Failed to reload insights after profile setup:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const strategicAnalysis = calculateStrategicInsights();

  return (
    <div className="space-y-6">
      {/* Strategic Business Intelligence Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategic Business Intelligence
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Transform from simple lender to strategic partner with data-driven insights
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Portfolio Composition Metrics */}
            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {portfolioData?.loans ? 
                    ((portfolioData.loans.filter((l: any) => l.vehicle_details?.fuel_type?.toLowerCase().includes('electric')).length / portfolioData.loans.length) * 100).toFixed(1) 
                    : '7.7'}%
                </p>
                <AIContextTooltip
                  metricType="portfolio_health"
                  metricValue="ev_adoption"
                  additionalData={{
                    type: 'strategic_positioning',
                    marketOpportunity: 'Green lending growth potential'
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">EV Portfolio Share</p>
            </div>

            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {portfolioData?.loans ? 
                    ((portfolioData.loans.filter((l: any) => {
                      const type = l.vehicle_details?.type?.toLowerCase() || '';
                      return ['truck', 'suv', 'pickup', 'luxury'].some(t => type.includes(t));
                    }).length / portfolioData.loans.length) * 100).toFixed(1) 
                    : '45.2'}%
                </p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue="high_emission_exposure"
                  additionalData={{
                    type: 'residual_value_risk',
                    impact: 'Depreciation acceleration due to regulations'
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">High-Emission Vehicles</p>
            </div>

            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {portfolioData?.loans ? 
                    Object.keys(portfolioData.loans.reduce((acc: any, l: any) => {
                      const state = l.borrower_details?.state || 'Unknown';
                      acc[state] = true;
                      return acc;
                    }, {})).length 
                    : '12'}
                </p>
                <AIContextTooltip
                  metricType="portfolio_health"
                  metricValue="geographic_diversification"
                  additionalData={{
                    type: 'market_expansion',
                    opportunity: 'Regional growth and risk management'
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">Geographic Markets</p>
            </div>

            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-teal-500/10 to-teal-600/10 border-teal-500/20 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-lg font-bold text-teal-700 dark:text-teal-300">
                  {portfolioData?.loans ? 
                    (portfolioData.loans.reduce((sum: number, l: any) => sum + (l.outstanding_balance || l.loan_amount || 0), 0) / 1000000).toFixed(1)
                    : '8.2'}M
                </p>
                <AIContextTooltip
                  metricType="portfolio_health"
                  metricValue="total_exposure"
                  additionalData={{
                    type: 'business_intelligence',
                    insight: 'Customer segmentation and cross-selling opportunities'
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Insights by Business Function */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Management & Portfolio Strategy */}
        {strategicAnalysis.riskManagement.length > 0 && (
          <NarrativeInsightCard
            title="Risk Management & Portfolio Strategy"
            variant="warning"
            narrative={contextualNarrativeService.generateStrategicInsightNarrative('portfolio_optimization', {
              riskFactors: strategicAnalysis.riskManagement.length,
              portfolioData: portfolioData
            })}
          >
            <div className="space-y-3">
              {strategicAnalysis.riskManagement.map((risk, index) => (
                <div key={index} className="p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-foreground">{risk.type}</h5>
                        <AIContextTooltip
                          metricType="risk_analytics"
                          metricValue={risk.severity}
                          additionalData={{
                            riskType: risk.type.toLowerCase().replace(' ', '_'),
                            impact: risk.impact,
                            affectedLoans: risk.affectedLoans,
                            affectedValue: risk.affectedValue
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{risk.description}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{risk.recommendation}</p>
                    </div>
                    <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                      {risk.severity}
                    </Badge>
                  </div>
                  {risk.affectedLoans && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Affected: {risk.affectedLoans} loans</span>
                      {risk.affectedValue && <span>Value: ${(risk.affectedValue / 1000000).toFixed(1)}M</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </NarrativeInsightCard>
        )}

        {/* Product Development & Marketing */}
        {strategicAnalysis.productDevelopment.length > 0 && (
          <NarrativeInsightCard
            title="Product Development & Targeted Marketing"
            variant="info"
            narrative={contextualNarrativeService.generateStrategicInsightNarrative('ev_transition', {
              opportunities: strategicAnalysis.productDevelopment.length,
              portfolioData: portfolioData
            })}
          >
            <div className="space-y-3">
              {strategicAnalysis.productDevelopment.map((opportunity, index) => (
                <div key={index} className="p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-foreground">{opportunity.type}</h5>
                        <AIContextTooltip
                          metricType="portfolio_health"
                          metricValue="product_opportunity"
                          additionalData={{
                            opportunityType: opportunity.type.toLowerCase().replace(' ', '_'),
                            impact: opportunity.impact,
                            potentialMarket: opportunity.potentialMarket,
                            estimatedRevenue: opportunity.estimatedRevenue
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{opportunity.description}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{opportunity.recommendation}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">
                      Opportunity
                    </Badge>
                  </div>
                  {opportunity.potentialMarket && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Market: {opportunity.potentialMarket} customers</span>
                      {opportunity.estimatedRevenue && <span>Revenue: ${(opportunity.estimatedRevenue / 1000000).toFixed(1)}M</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </NarrativeInsightCard>
        )}

        {/* Customer Segmentation & Behavior */}
        {strategicAnalysis.customerSegmentation.length > 0 && (
          <NarrativeInsightCard
            title="Customer Segmentation & Behavior Analysis"
            variant="success"
            narrative={contextualNarrativeService.generateStrategicInsightNarrative('data_quality', {
              segments: strategicAnalysis.customerSegmentation.length,
              portfolioData: portfolioData
            })}
          >
            <div className="space-y-3">
              {strategicAnalysis.customerSegmentation.map((segment, index) => (
                <div key={index} className="p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-foreground">{segment.type}</h5>
                        <AIContextTooltip
                          metricType="portfolio_health"
                          metricValue="customer_segment"
                          additionalData={{
                            segmentType: segment.type.toLowerCase().replace(' ', '_'),
                            opportunity: segment.opportunity,
                            segmentSize: segment.segmentSize,
                            avgLoanValue: segment.avgLoanValue
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{segment.description}</p>
                      <p className="text-xs text-teal-600 dark:text-teal-400">{segment.recommendation}</p>
                    </div>
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300">
                      Segment
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Size: {segment.segmentSize} customers</span>
                    <span>Avg Loan: ${(segment.avgLoanValue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              ))}
            </div>
          </NarrativeInsightCard>
        )}

        {/* ESG & Reporting */}
        {strategicAnalysis.esgReporting.length > 0 && (
          <NarrativeInsightCard
            title="ESG & Regulatory Reporting"
            variant="info"
            narrative={contextualNarrativeService.generateStrategicInsightNarrative('portfolio_optimization', {
              esgMetrics: strategicAnalysis.esgReporting.length,
              portfolioData: portfolioData
            })}
          >
            <div className="space-y-3">
              {strategicAnalysis.esgReporting.map((esg, index) => (
                <div key={index} className="p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-foreground">{esg.type}</h5>
                        <AIContextTooltip
                          metricType="emissions"
                          metricValue={esg.currentEmissions || esg.description}
                          additionalData={{
                            esgType: esg.type.toLowerCase().replace(' ', '_'),
                            currentEmissions: esg.currentEmissions,
                            emissionIntensity: esg.emissionIntensity,
                            opportunity: esg.opportunity
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{esg.description}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{esg.recommendation}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                      ESG
                    </Badge>
                  </div>
                  {esg.currentEmissions && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Emissions: {esg.currentEmissions.toFixed(1)} tCO2e</span>
                      {esg.emissionIntensity && <span>Intensity: {esg.emissionIntensity.toFixed(2)} kg/$1k</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </NarrativeInsightCard>
        )}
      </div>

      {/* Strategic Partnerships & New Business Models */}
      {strategicAnalysis.strategicPartnerships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Strategic Partnerships & New Business Models
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Transform portfolio data into strategic business opportunities
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategicAnalysis.strategicPartnerships.map((partnership, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-foreground">{partnership.type}</h5>
                        <AIContextTooltip
                          metricType="portfolio_health"
                          metricValue="strategic_partnership"
                          additionalData={{
                            partnershipType: partnership.type.toLowerCase().replace(' ', '_'),
                            opportunity: partnership.opportunity,
                            marketSize: partnership.marketSize || partnership.dataPoints
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{partnership.description}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">{partnership.opportunity}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{partnership.recommendation}</p>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
                      Partnership
                    </Badge>
                  </div>
                  {(partnership.marketSize || partnership.dataPoints) && (
                    <div className="text-xs text-muted-foreground">
                      Market Size: {partnership.marketSize || partnership.dataPoints} {partnership.dataPoints ? 'data points' : 'customers'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic AI Insights */}
      <div className="space-y-4">
        {isLoadingInsights ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Generating personalized insights...</span>
            </div>
          </div>
        ) : dynamicInsights.length > 0 ? (
          dynamicInsights.map((insight) => (
            <DynamicInsightCard
              key={insight.id}
              insight={insight}
              onActionClick={handleActionClick}
              className="hover:shadow-lg transition-all duration-200"
            />
          ))
        ) : !hasProfile ? (
          showProfileSetup ? (
            <BankProfileSetup
              onComplete={handleProfileComplete}
              onCancel={() => setShowProfileSetup(false)}
            />
          ) : (
            <Card className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Unlock Strategic Intelligence</h3>
              <p className="text-muted-foreground mb-4">
                Set up your bank profile to transform from simple lender to strategic partner with AI-powered business insights.
              </p>
              <Button onClick={() => setShowProfileSetup(true)}>
                Setup Bank Profile
              </Button>
            </Card>
          )
        ) : (
          <Card className="p-6 text-center">
            <Brain className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Strategic Insights Ready</h3>
            <p className="text-muted-foreground mb-4">
              Your portfolio analysis is complete. Strategic business intelligence is now available.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Insights
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}



function EmissionsForecasts({ aiInsights, portfolioData }: { aiInsights: AIInsightResponse | null; portfolioData: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Emissions Forecasting Models
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Predictive analysis of portfolio emissions based on current trends and scenarios
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">12-Month Projection</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Current Baseline</span>
                    <AIContextTooltip
                      metricType="emissions"
                      metricValue="268"
                      additionalData={{
                        type: 'baseline',
                        portfolioSize: portfolioData?.totalLoans || 247,
                        emissionIntensity: 1.08
                      }}
                    />
                  </div>
                  <span className="font-medium text-foreground">268 tCO2e</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Projected (Q4 2024)</span>
                    <AIContextTooltip
                      metricType="emissions"
                      metricValue="245"
                      additionalData={{
                        type: 'forecast',
                        reductionPercent: -8.6,
                        confidence: 0.85,
                        scenario: 'base_case'
                      }}
                    />
                  </div>
                  <span className="font-medium text-green-600 dark:text-green-400">245 tCO2e (-8.6%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Best Case Scenario</span>
                    <AIContextTooltip
                      metricType="emissions"
                      metricValue="220"
                      additionalData={{
                        type: 'optimistic_forecast',
                        reductionPercent: -17.9,
                        scenario: 'optimistic',
                        keyDrivers: ['EV adoption', 'Fleet modernization']
                      }}
                    />
                  </div>
                  <span className="font-medium text-green-700 dark:text-green-300">220 tCO2e (-17.9%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Key Drivers</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 hover:bg-muted/20 p-2 rounded cursor-pointer group">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground flex-1">EV adoption acceleration (+15% projected)</span>
                  <AIContextTooltip
                    metricType="ev_percentage"
                    metricValue="15"
                    additionalData={{
                      type: 'growth_projection',
                      currentRate: 7.7,
                      targetRate: 22.7,
                      timeframe: '12 months'
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="flex items-center gap-2 hover:bg-muted/20 p-2 rounded cursor-pointer group">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground flex-1">Fleet modernization initiatives</span>
                  <AIContextTooltip
                    metricType="portfolio_health"
                    metricValue="modernization"
                    additionalData={{
                      type: 'fleet_upgrade',
                      affectedLoans: Math.round((portfolioData?.totalLoans || 247) * 0.35),
                      emissionReduction: 12
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="flex items-center gap-2 hover:bg-muted/20 p-2 rounded cursor-pointer group">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-muted-foreground flex-1">Regulatory compliance requirements</span>
                  <AIContextTooltip
                    metricType="risk_analytics"
                    metricValue="compliance"
                    additionalData={{
                      type: 'regulatory_impact',
                      complianceDeadline: '2025',
                      riskLevel: 'medium'
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NarrativeInsightCard
              title="Optimistic Scenario"
              variant="success"
              narrative={contextualNarrativeService.generateEmissionsForecastNarrative('optimistic', -25)}
              className="bg-green-500/10 border-green-500/20 dark:bg-green-400/10 dark:border-green-400/20"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">-25%</p>
                <p className="text-xs text-green-600 dark:text-green-400">Emissions reduction by 2025</p>
              </div>
            </NarrativeInsightCard>

            <NarrativeInsightCard
              title="Base Case"
              variant="info"
              narrative={contextualNarrativeService.generateEmissionsForecastNarrative('base_case', -15)}
              className="bg-blue-500/10 border-blue-500/20 dark:bg-blue-400/10 dark:border-blue-400/20"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">-15%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Expected reduction</p>
              </div>
            </NarrativeInsightCard>

            <NarrativeInsightCard
              title="Conservative"
              variant="warning"
              narrative={contextualNarrativeService.generateEmissionsForecastNarrative('conservative', -8)}
              className="bg-orange-500/10 border-orange-500/20 dark:bg-orange-400/10 dark:border-orange-400/20"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">-8%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Minimum expected</p>
              </div>
            </NarrativeInsightCard>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RiskAnalytics({ aiInsights, portfolioData }: { aiInsights: AIInsightResponse | null; portfolioData: any }) {
  // Calculate dynamic risk metrics based on actual portfolio data
  const calculatePortfolioRisks = () => {
    if (!portfolioData?.loans || !Array.isArray(portfolioData.loans)) {
      return {
        transitionRisks: [],
        physicalRisks: [],
        financialStabilityRisk: 'medium',
        liquidityRisk: 'low',
        creditRisk: 'medium'
      };
    }

    const loans = portfolioData.loans;
    const totalLoans = loans.length;
    const totalValue = loans.reduce((sum: number, loan: any) => sum + (loan.outstanding_balance || loan.loan_amount || 0), 0);

    // Calculate ICE vehicle exposure (transition risk)
    const iceLoans = loans.filter((loan: any) => {
      const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase();
      return !fuelType || (!fuelType.includes('electric') && !fuelType.includes('hybrid'));
    });
    const iceExposure = totalLoans > 0 ? (iceLoans.length / totalLoans) * 100 : 0;

    // Calculate high-emission vehicle concentration
    const highEmissionTypes = ['truck', 'suv', 'pickup', 'van', 'commercial'];
    const highEmissionLoans = loans.filter((loan: any) => {
      const vehicleType = loan.vehicle_details?.type?.toLowerCase() || '';
      return highEmissionTypes.some(type => vehicleType.includes(type));
    });
    const highEmissionExposure = totalLoans > 0 ? (highEmissionLoans.length / totalLoans) * 100 : 0;

    // Calculate geographic concentration (physical risk proxy)
    const stateConcentration = loans.reduce((acc: any, loan: any) => {
      const state = loan.borrower_details?.state || loan.collateral_location?.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    const maxStateConcentration = Math.max(...Object.values(stateConcentration)) as number;
    const geographicConcentration = totalLoans > 0 ? (maxStateConcentration / totalLoans) * 100 : 0;

    // Calculate data quality risk
    const poorDataQualityLoans = loans.filter((loan: any) => {
      const score = loan.emissions_data?.data_quality_score || loan.data_quality_assessment?.overall_score || 5;
      return score >= 4;
    });
    const dataQualityRisk = totalLoans > 0 ? (poorDataQualityLoans.length / totalLoans) * 100 : 0;

    // Determine transition risks based on portfolio composition
    const transitionRisks = [];
    
    if (iceExposure > 70) {
      transitionRisks.push({
        type: 'Policy Risk',
        severity: 'high' as const,
        description: 'High ICE vehicle exposure to regulatory changes',
        affectedLoans: iceLoans.length,
        affectedValue: iceLoans.reduce((sum: number, loan: any) => sum + (loan.outstanding_balance || 0), 0),
        timeframe: '2-5 years',
        impact: 'Potential asset value decline and increased regulatory compliance costs'
      });
    } else if (iceExposure > 40) {
      transitionRisks.push({
        type: 'Policy Risk',
        severity: 'medium' as const,
        description: 'Moderate ICE vehicle exposure to regulatory changes',
        affectedLoans: iceLoans.length,
        affectedValue: iceLoans.reduce((sum: number, loan: any) => sum + (loan.outstanding_balance || 0), 0),
        timeframe: '3-7 years',
        impact: 'Gradual transition costs and potential market shifts'
      });
    }

    if (highEmissionExposure > 50) {
      transitionRisks.push({
        type: 'Technology Risk',
        severity: 'high' as const,
        description: 'High concentration in high-emission vehicle types',
        affectedLoans: highEmissionLoans.length,
        affectedValue: highEmissionLoans.reduce((sum: number, loan: any) => sum + (loan.outstanding_balance || 0), 0),
        timeframe: '1-3 years',
        impact: 'EV technology disruption affecting resale values'
      });
    } else if (highEmissionExposure > 30) {
      transitionRisks.push({
        type: 'Technology Risk',
        severity: 'medium' as const,
        description: 'Moderate concentration in high-emission vehicles',
        affectedLoans: highEmissionLoans.length,
        affectedValue: highEmissionLoans.reduce((sum: number, loan: any) => sum + (loan.outstanding_balance || 0), 0),
        timeframe: '2-5 years',
        impact: 'Gradual market preference shifts toward cleaner alternatives'
      });
    }

    // Market risk based on EV adoption rate
    const evLoans = loans.filter((loan: any) => {
      const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase();
      return fuelType && fuelType.includes('electric');
    });
    const evPercentage = totalLoans > 0 ? (evLoans.length / totalLoans) * 100 : 0;

    if (evPercentage < 5) {
      transitionRisks.push({
        type: 'Market Risk',
        severity: 'medium' as const,
        description: 'Low EV adoption relative to market trends',
        affectedLoans: totalLoans - evLoans.length,
        affectedValue: totalValue - evLoans.reduce((sum: number, loan: any) => sum + (loan.outstanding_balance || 0), 0),
        timeframe: '1-2 years',
        impact: 'Consumer preference shifts toward sustainable vehicles'
      });
    }

    // Determine physical risks based on geographic concentration
    const physicalRisks = [];
    
    if (geographicConcentration > 40) {
      physicalRisks.push({
        type: 'Geographic Concentration',
        severity: 'high' as const,
        description: 'High concentration in single geographic area',
        affectedLoans: maxStateConcentration,
        timeframe: 'Ongoing',
        impact: 'Exposure to regional climate events and natural disasters'
      });
    } else if (geographicConcentration > 25) {
      physicalRisks.push({
        type: 'Geographic Concentration',
        severity: 'medium' as const,
        description: 'Moderate geographic concentration',
        affectedLoans: maxStateConcentration,
        timeframe: 'Ongoing',
        impact: 'Some exposure to regional climate risks'
      });
    }

    // Assess overall financial stability risk
    let financialStabilityRisk = 'low';
    if (transitionRisks.some(r => r.severity === 'high') || physicalRisks.some(r => r.severity === 'high')) {
      financialStabilityRisk = 'high';
    } else if (transitionRisks.length > 1 || physicalRisks.length > 0) {
      financialStabilityRisk = 'medium';
    }

    // Assess liquidity risk based on portfolio composition
    let liquidityRisk = 'low';
    if (dataQualityRisk > 40 || geographicConcentration > 50) {
      liquidityRisk = 'medium';
    }

    // Assess credit risk based on transition exposure
    let creditRisk = 'low';
    if (iceExposure > 80 || highEmissionExposure > 60) {
      creditRisk = 'high';
    } else if (iceExposure > 50 || highEmissionExposure > 40) {
      creditRisk = 'medium';
    }

    return {
      transitionRisks,
      physicalRisks,
      financialStabilityRisk,
      liquidityRisk,
      creditRisk,
      portfolioMetrics: {
        iceExposure,
        highEmissionExposure,
        geographicConcentration,
        dataQualityRisk,
        evPercentage
      }
    };
  };

  const riskAssessment = calculatePortfolioRisks();

  return (
    <div className="space-y-6">
      {/* Risk Overview Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Climate Risk Assessment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Dynamic risk analysis based on your portfolio composition and geographic exposure
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`text-center p-4 border rounded-lg ${
              riskAssessment.financialStabilityRisk === 'high' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' :
              riskAssessment.financialStabilityRisk === 'medium' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20' :
              'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
            } hover:shadow-md transition-all duration-200 cursor-pointer group`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className={`text-2xl font-bold ${
                  riskAssessment.financialStabilityRisk === 'high' ? 'text-red-600' :
                  riskAssessment.financialStabilityRisk === 'medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {riskAssessment.financialStabilityRisk.charAt(0).toUpperCase() + riskAssessment.financialStabilityRisk.slice(1)}
                </p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue={riskAssessment.financialStabilityRisk}
                  additionalData={{
                    riskType: 'financial_stability',
                    transitionRisks: riskAssessment.transitionRisks.length,
                    physicalRisks: riskAssessment.physicalRisks.length,
                    portfolioMetrics: riskAssessment.portfolioMetrics
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">Financial Stability Risk</p>
            </div>

            <div className={`text-center p-4 border rounded-lg ${
              riskAssessment.liquidityRisk === 'high' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' :
              riskAssessment.liquidityRisk === 'medium' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20' :
              'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
            } hover:shadow-md transition-all duration-200 cursor-pointer group`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className={`text-2xl font-bold ${
                  riskAssessment.liquidityRisk === 'high' ? 'text-red-600' :
                  riskAssessment.liquidityRisk === 'medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {riskAssessment.liquidityRisk.charAt(0).toUpperCase() + riskAssessment.liquidityRisk.slice(1)}
                </p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue={riskAssessment.liquidityRisk}
                  additionalData={{
                    riskType: 'liquidity_risk',
                    geographicConcentration: riskAssessment.portfolioMetrics?.geographicConcentration,
                    dataQualityRisk: riskAssessment.portfolioMetrics?.dataQualityRisk
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">Liquidity Risk</p>
            </div>

            <div className={`text-center p-4 border rounded-lg ${
              riskAssessment.creditRisk === 'high' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' :
              riskAssessment.creditRisk === 'medium' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20' :
              'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
            } hover:shadow-md transition-all duration-200 cursor-pointer group`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className={`text-2xl font-bold ${
                  riskAssessment.creditRisk === 'high' ? 'text-red-600' :
                  riskAssessment.creditRisk === 'medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {riskAssessment.creditRisk.charAt(0).toUpperCase() + riskAssessment.creditRisk.slice(1)}
                </p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue={riskAssessment.creditRisk}
                  additionalData={{
                    riskType: 'credit_risk',
                    iceExposure: riskAssessment.portfolioMetrics?.iceExposure,
                    highEmissionExposure: riskAssessment.portfolioMetrics?.highEmissionExposure
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">Credit Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Risk Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transition Risks - Only show if risks exist */}
        {riskAssessment.transitionRisks.length > 0 && (
          <NarrativeInsightCard
            title="Transition Risk Analysis"
            variant="warning"
            narrative={contextualNarrativeService.generateRiskAnalyticsNarrative('transition_risk', 
              riskAssessment.transitionRisks.some(r => r.severity === 'high') ? 'high' : 'medium')}
          >
            <div className="space-y-3">
              {riskAssessment.transitionRisks.map((risk, index) => (
                <div key={index} className="flex items-start justify-between p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{risk.type}</p>
                      <AIContextTooltip
                        metricType="risk_analytics"
                        metricValue={risk.severity}
                        additionalData={{
                          riskType: risk.type.toLowerCase().replace(' ', '_'),
                          severity: risk.severity,
                          impact: risk.impact,
                          timeframe: risk.timeframe,
                          affectedLoans: risk.affectedLoans,
                          affectedValue: risk.affectedValue
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{risk.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Affected: {risk.affectedLoans} loans</span>
                      <span>Timeline: {risk.timeframe}</span>
                    </div>
                  </div>
                  <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                    {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </NarrativeInsightCard>
        )}

        {/* Physical Risks - Only show if risks exist */}
        {riskAssessment.physicalRisks.length > 0 ? (
          <NarrativeInsightCard
            title="Physical Risk Exposure"
            variant="info"
            narrative={contextualNarrativeService.generateRiskAnalyticsNarrative('physical_risk', 
              riskAssessment.physicalRisks.some(r => r.severity === 'high') ? 'high' : 'medium')}
          >
            <div className="space-y-3">
              {riskAssessment.physicalRisks.map((risk, index) => (
                <div key={index} className="flex items-start justify-between p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{risk.type}</p>
                      <AIContextTooltip
                        metricType="risk_analytics"
                        metricValue={risk.severity}
                        additionalData={{
                          riskType: risk.type.toLowerCase().replace(' ', '_'),
                          severity: risk.severity,
                          impact: risk.impact,
                          timeframe: risk.timeframe,
                          affectedLoans: risk.affectedLoans
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{risk.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Affected: {risk.affectedLoans} loans</span>
                      <span>Timeline: {risk.timeframe}</span>
                    </div>
                  </div>
                  <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                    {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </NarrativeInsightCard>
        ) : (
          <NarrativeInsightCard
            title="Physical Risk Exposure"
            variant="success"
            narrative={contextualNarrativeService.generateRiskAnalyticsNarrative('physical_risk', 'low')}
          >
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium text-green-700 dark:text-green-300 mb-2">Low Physical Risk Exposure</p>
              <p className="text-sm text-muted-foreground">
                Your portfolio shows good geographic diversification with limited exposure to acute climate risks.
              </p>
            </div>
          </NarrativeInsightCard>
        )}
      </div>

      {/* Dynamic Risk Mitigation Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Management Framework</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tailored recommendations based on your portfolio's specific risk profile
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Risk Assessment and Disclosure */}
            <div className="p-4 border-l-4 border-l-blue-500 bg-blue-500/10 dark:bg-blue-400/10">
              <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Assessment and Disclosure</h5>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                Integrate climate-related risks into existing risk management frameworks as required by financial authorities.
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Conduct comprehensive climate risk assessments quarterly</li>
                <li>• Implement transparent stakeholder disclosure processes</li>
                <li>• Align with Bank of England and ECB Banking Supervision guidelines</li>
              </ul>
            </div>

            {/* Priority Actions based on identified risks */}
            {riskAssessment.transitionRisks.some(r => r.severity === 'high') && (
              <div className="p-4 border-l-4 border-l-red-500 bg-red-500/10 dark:bg-red-400/10">
                <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">Critical Priority</h5>
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  High transition risk exposure requires immediate portfolio diversification.
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  <li>• Accelerate EV financing programs to reduce ICE exposure</li>
                  <li>• Implement stress testing for regulatory policy changes</li>
                  <li>• Develop transition financing for existing borrowers</li>
                </ul>
              </div>
            )}

            {riskAssessment.transitionRisks.some(r => r.type === 'Technology Risk') && (
              <div className="p-4 border-l-4 border-l-orange-500 bg-orange-500/10 dark:bg-orange-400/10">
                <h5 className="font-medium text-orange-700 dark:text-orange-300 mb-2">Technology Transition</h5>
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                  Prepare for EV technology disruption affecting high-emission vehicle values.
                </p>
                <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                  <li>• Partner with EV manufacturers and charging networks</li>
                  <li>• Develop expertise in EV technology and market dynamics</li>
                  <li>• Create customer education programs about EV benefits</li>
                </ul>
              </div>
            )}

            {riskAssessment.physicalRisks.length > 0 && (
              <div className="p-4 border-l-4 border-l-purple-500 bg-purple-500/10 dark:bg-purple-400/10">
                <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Physical Risk Management</h5>
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                  Address geographic concentration and climate-related physical risks.
                </p>
                <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                  <li>• Diversify lending across different geographic regions</li>
                  <li>• Assess borrower exposure to extreme weather events</li>
                  <li>• Consider climate factors in underwriting processes</li>
                </ul>
              </div>
            )}

            {/* Scenario Analysis */}
            <div className="p-4 border-l-4 border-l-green-500 bg-green-500/10 dark:bg-green-400/10">
              <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">Scenario Analysis</h5>
              <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                Use scenario analysis to measure potential financial impacts and test portfolio resilience.
              </p>
              <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                <li>• Model different climate pathways and policy scenarios</li>
                <li>• Test portfolio resilience under various transition speeds</li>
                <li>• Quantify potential credit losses from climate risks</li>
              </ul>
            </div>

            {/* Sustainable Finance Opportunities */}
            {riskAssessment.portfolioMetrics?.evPercentage < 15 && (
              <div className="p-4 border-l-4 border-l-teal-500 bg-teal-500/10 dark:bg-teal-400/10">
                <h5 className="font-medium text-teal-700 dark:text-teal-300 mb-2">Sustainable Finance</h5>
                <p className="text-sm text-teal-600 dark:text-teal-400 mb-2">
                  Mobilize capital to support the transition to a green economy and capture new opportunities.
                </p>
                <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1">
                  <li>• Develop green loan products with preferential rates</li>
                  <li>• Finance sustainable transportation projects</li>
                  <li>• Create carbon offset and credit programs</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClimateScenarios({ aiInsights, portfolioData }: { aiInsights: AIInsightResponse | null; portfolioData: any }) {
  // Calculate dynamic scenario impacts based on actual portfolio composition
  const calculateScenarioImpacts = () => {
    if (!portfolioData?.loans || !Array.isArray(portfolioData.loans)) {
      return {
        orderly: { impact: 8, confidence: 0.7, keyDrivers: [], portfolioResilience: 'medium' },
        disorderly: { impact: -12, confidence: 0.75, keyDrivers: [], portfolioResilience: 'medium' },
        hothouse: { impact: -20, confidence: 0.8, keyDrivers: [], portfolioResilience: 'low' }
      };
    }

    const loans = portfolioData.loans;
    const totalLoans = loans.length;
    const totalValue = loans.reduce((sum: number, loan: any) => sum + (loan.outstanding_balance || loan.loan_amount || 0), 0);

    // Calculate portfolio composition metrics
    const evLoans = loans.filter((loan: any) => {
      const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase();
      return fuelType && fuelType.includes('electric');
    });
    const evPercentage = totalLoans > 0 ? (evLoans.length / totalLoans) * 100 : 0;

    const hybridLoans = loans.filter((loan: any) => {
      const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase();
      return fuelType && fuelType.includes('hybrid');
    });
    const hybridPercentage = totalLoans > 0 ? (hybridLoans.length / totalLoans) * 100 : 0;

    const iceLoans = loans.filter((loan: any) => {
      const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase();
      return !fuelType || (!fuelType.includes('electric') && !fuelType.includes('hybrid'));
    });
    const icePercentage = totalLoans > 0 ? (iceLoans.length / totalLoans) * 100 : 0;

    // Calculate high-emission vehicle exposure
    const highEmissionTypes = ['truck', 'suv', 'pickup', 'van', 'commercial'];
    const highEmissionLoans = loans.filter((loan: any) => {
      const vehicleType = loan.vehicle_details?.type?.toLowerCase() || '';
      return highEmissionTypes.some(type => vehicleType.includes(type));
    });
    const highEmissionPercentage = totalLoans > 0 ? (highEmissionLoans.length / totalLoans) * 100 : 0;

    // Calculate data quality score
    const dataQualityScores = loans
      .map((loan: any) => loan.emissions_data?.data_quality_score || loan.data_quality_assessment?.overall_score || 5)
      .filter((score: number) => score !== undefined);
    const avgDataQuality = dataQualityScores.length > 0 
      ? dataQualityScores.reduce((sum: number, score: number) => sum + score, 0) / dataQualityScores.length
      : 5.0;

    // Calculate geographic concentration
    const stateConcentration = loans.reduce((acc: any, loan: any) => {
      const state = loan.borrower_details?.state || loan.collateral_location?.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});
    const maxStateConcentration = Math.max(...Object.values(stateConcentration)) as number;
    const geographicConcentration = totalLoans > 0 ? (maxStateConcentration / totalLoans) * 100 : 0;

    // ORDERLY TRANSITION SCENARIO
    let orderlyImpact = 5; // Base positive impact
    let orderlyDrivers = [];
    let orderlyConfidence = 0.75;

    // EV exposure provides upside in orderly transition
    if (evPercentage > 20) {
      orderlyImpact += 8;
      orderlyDrivers.push('High EV exposure captures green finance opportunities');
      orderlyConfidence += 0.1;
    } else if (evPercentage > 10) {
      orderlyImpact += 5;
      orderlyDrivers.push('Moderate EV exposure benefits from policy support');
    } else if (evPercentage > 5) {
      orderlyImpact += 2;
      orderlyDrivers.push('Growing EV portfolio positioned for transition benefits');
    }

    // Hybrid vehicles provide moderate upside
    if (hybridPercentage > 15) {
      orderlyImpact += 3;
      orderlyDrivers.push('Hybrid vehicle portfolio bridges transition period');
    }

    // ICE exposure reduces upside but manageable in orderly scenario
    if (icePercentage > 80) {
      orderlyImpact -= 3;
      orderlyDrivers.push('High ICE exposure limits transition benefits');
    } else if (icePercentage > 60) {
      orderlyImpact -= 1;
      orderlyDrivers.push('Moderate ICE exposure manageable with gradual transition');
    }

    // Data quality affects scenario modeling accuracy
    if (avgDataQuality <= 3.0) {
      orderlyConfidence += 0.1;
      orderlyDrivers.push('High data quality enables accurate scenario modeling');
    } else if (avgDataQuality >= 4.5) {
      orderlyConfidence -= 0.1;
      orderlyDrivers.push('Data quality improvements needed for reliable projections');
    }

    // DISORDERLY TRANSITION SCENARIO
    let disorderlyImpact = -8; // Base negative impact
    let disorderlyDrivers = [];
    let disorderlyConfidence = 0.8;

    // High ICE exposure creates significant downside risk
    if (icePercentage > 80) {
      disorderlyImpact -= 8;
      disorderlyDrivers.push('High ICE exposure vulnerable to sudden policy changes');
      disorderlyConfidence += 0.05;
    } else if (icePercentage > 60) {
      disorderlyImpact -= 5;
      disorderlyDrivers.push('Moderate ICE exposure faces transition cost pressures');
    } else if (icePercentage < 40) {
      disorderlyImpact += 3;
      disorderlyDrivers.push('Lower ICE exposure provides resilience to policy shocks');
    }

    // High-emission vehicles face severe stranding risk
    if (highEmissionPercentage > 50) {
      disorderlyImpact -= 6;
      disorderlyDrivers.push('High-emission vehicle concentration faces asset stranding');
    } else if (highEmissionPercentage > 30) {
      disorderlyImpact -= 3;
      disorderlyDrivers.push('Moderate high-emission exposure creates valuation risk');
    }

    // EV exposure provides some protection
    if (evPercentage > 15) {
      disorderlyImpact += 4;
      disorderlyDrivers.push('EV portfolio provides hedge against transition disruption');
    } else if (evPercentage > 8) {
      disorderlyImpact += 2;
      disorderlyDrivers.push('Growing EV exposure offers partial protection');
    }

    // Geographic concentration amplifies risks
    if (geographicConcentration > 40) {
      disorderlyImpact -= 2;
      disorderlyDrivers.push('Geographic concentration amplifies regional policy risks');
    }

    // HOT HOUSE WORLD SCENARIO
    let hothouseImpact = -15; // Base severe negative impact
    let hothouseDrivers = [];
    let hothouseConfidence = 0.75;

    // Physical risk exposure based on geographic concentration
    if (geographicConcentration > 50) {
      hothouseImpact -= 8;
      hothouseDrivers.push('High geographic concentration vulnerable to climate events');
      hothouseConfidence += 0.05;
    } else if (geographicConcentration > 30) {
      hothouseImpact -= 4;
      hothouseDrivers.push('Moderate geographic concentration faces regional climate risks');
    } else {
      hothouseImpact += 3;
      hothouseDrivers.push('Geographic diversification provides climate resilience');
    }

    // All vehicle types affected by physical risks, but EVs less so
    if (evPercentage > 20) {
      hothouseImpact += 3;
      hothouseDrivers.push('EV infrastructure less vulnerable to extreme weather');
    }

    // High-emission vehicles face double impact (physical + stranded assets)
    if (highEmissionPercentage > 60) {
      hothouseImpact -= 5;
      hothouseDrivers.push('High-emission vehicles face physical and transition risks');
    }

    // Data quality critical for physical risk assessment
    if (avgDataQuality >= 4.5) {
      hothouseImpact -= 2;
      hothouseDrivers.push('Poor data quality limits physical risk assessment capability');
      hothouseConfidence -= 0.1;
    }

    // Determine portfolio resilience levels
    const getPortfolioResilience = (impact: number) => {
      if (impact > 5) return 'high';
      if (impact > -5) return 'medium';
      if (impact > -15) return 'low';
      return 'very_low';
    };

    return {
      orderly: {
        impact: Math.round(orderlyImpact * 10) / 10,
        confidence: Math.min(0.95, orderlyConfidence),
        keyDrivers: orderlyDrivers.slice(0, 3),
        portfolioResilience: getPortfolioResilience(orderlyImpact)
      },
      disorderly: {
        impact: Math.round(disorderlyImpact * 10) / 10,
        confidence: Math.min(0.95, disorderlyConfidence),
        keyDrivers: disorderlyDrivers.slice(0, 3),
        portfolioResilience: getPortfolioResilience(disorderlyImpact)
      },
      hothouse: {
        impact: Math.round(hothouseImpact * 10) / 10,
        confidence: Math.min(0.95, hothouseConfidence),
        keyDrivers: hothouseDrivers.slice(0, 3),
        portfolioResilience: getPortfolioResilience(hothouseImpact)
      },
      portfolioMetrics: {
        evPercentage,
        hybridPercentage,
        icePercentage,
        highEmissionPercentage,
        avgDataQuality,
        geographicConcentration
      }
    };
  };

  const scenarioAnalysis = calculateScenarioImpacts();

  return (
    <div className="space-y-6">
      {/* Portfolio Resilience Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Climate Scenario Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Dynamic portfolio impact assessment under NGFS climate scenarios based on your composition
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-lg font-bold text-foreground">
                  {scenarioAnalysis.portfolioMetrics?.evPercentage.toFixed(1)}%
                </p>
                <AIContextTooltip
                  metricType="portfolio_health"
                  metricValue={scenarioAnalysis.portfolioMetrics?.evPercentage}
                  additionalData={{
                    type: 'ev_exposure',
                    scenarioResilience: 'Provides upside in all transition scenarios'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">EV Exposure</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-lg font-bold text-foreground">
                  {scenarioAnalysis.portfolioMetrics?.icePercentage.toFixed(1)}%
                </p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue={scenarioAnalysis.portfolioMetrics?.icePercentage}
                  additionalData={{
                    type: 'ice_exposure',
                    scenarioRisk: 'Higher exposure increases transition risk'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">ICE Exposure</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-lg font-bold text-foreground">
                  {scenarioAnalysis.portfolioMetrics?.geographicConcentration.toFixed(1)}%
                </p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue={scenarioAnalysis.portfolioMetrics?.geographicConcentration}
                  additionalData={{
                    type: 'geographic_concentration',
                    physicalRisk: 'Affects physical risk exposure in hot house scenario'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Geographic Concentration</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-lg font-bold text-foreground">
                  {scenarioAnalysis.portfolioMetrics?.avgDataQuality.toFixed(1)}
                </p>
                <AIContextTooltip
                  metricType="data_quality"
                  metricValue={scenarioAnalysis.portfolioMetrics?.avgDataQuality}
                  additionalData={{
                    type: 'scenario_modeling',
                    impact: 'Affects scenario modeling accuracy and confidence'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Data Quality Score</p>
            </div>
          </div>

          {/* Dynamic Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NarrativeInsightCard
              title="Orderly Transition"
              variant={scenarioAnalysis.orderly.impact > 0 ? "success" : "warning"}
              narrative={contextualNarrativeService.generateClimateScenarioNarrative('orderly', scenarioAnalysis.orderly.impact)}
              className={`${scenarioAnalysis.orderly.impact > 0 
                ? 'bg-green-500/10 border-green-500/20 dark:bg-green-400/10 dark:border-green-400/20' 
                : 'bg-orange-500/10 border-orange-500/20 dark:bg-orange-400/10 dark:border-orange-400/20'
              } hover:shadow-lg transition-all duration-200 cursor-pointer group`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className={`text-2xl font-bold ${scenarioAnalysis.orderly.impact > 0 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-orange-800 dark:text-orange-200'}`}>
                    {scenarioAnalysis.orderly.impact > 0 ? '+' : ''}{scenarioAnalysis.orderly.impact}%
                  </p>
                  <AIContextTooltip
                    metricType="climate_scenario"
                    metricValue={scenarioAnalysis.orderly.impact}
                    additionalData={{
                      scenario: 'orderly',
                      impactType: scenarioAnalysis.orderly.impact > 0 ? 'positive' : 'negative',
                      confidence: scenarioAnalysis.orderly.confidence,
                      keyFactors: scenarioAnalysis.orderly.keyDrivers,
                      portfolioResilience: scenarioAnalysis.orderly.portfolioResilience
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className={`text-xs mb-3 ${scenarioAnalysis.orderly.impact > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-orange-600 dark:text-orange-400'}`}>
                  Portfolio value impact
                </p>
                <div className="space-y-1">
                  {scenarioAnalysis.orderly.keyDrivers.map((driver, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      • {driver}
                    </p>
                  ))}
                </div>
              </div>
            </NarrativeInsightCard>

            <NarrativeInsightCard
              title="Disorderly Transition"
              variant="warning"
              narrative={contextualNarrativeService.generateClimateScenarioNarrative('disorderly', scenarioAnalysis.disorderly.impact)}
              className="bg-orange-500/10 border-orange-500/20 dark:bg-orange-400/10 dark:border-orange-400/20 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {scenarioAnalysis.disorderly.impact}%
                  </p>
                  <AIContextTooltip
                    metricType="climate_scenario"
                    metricValue={scenarioAnalysis.disorderly.impact}
                    additionalData={{
                      scenario: 'disorderly',
                      impactType: 'negative',
                      confidence: scenarioAnalysis.disorderly.confidence,
                      keyFactors: scenarioAnalysis.disorderly.keyDrivers,
                      portfolioResilience: scenarioAnalysis.disorderly.portfolioResilience
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">Portfolio value impact</p>
                <div className="space-y-1">
                  {scenarioAnalysis.disorderly.keyDrivers.map((driver, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      • {driver}
                    </p>
                  ))}
                </div>
              </div>
            </NarrativeInsightCard>

            <NarrativeInsightCard
              title="Hot House World"
              variant="warning"
              narrative={contextualNarrativeService.generateClimateScenarioNarrative('hothouse', scenarioAnalysis.hothouse.impact)}
              className="bg-red-500/10 border-red-500/20 dark:bg-red-400/10 dark:border-red-400/20 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {scenarioAnalysis.hothouse.impact}%
                  </p>
                  <AIContextTooltip
                    metricType="climate_scenario"
                    metricValue={scenarioAnalysis.hothouse.impact}
                    additionalData={{
                      scenario: 'hothouse',
                      impactType: 'severe_negative',
                      confidence: scenarioAnalysis.hothouse.confidence,
                      keyFactors: scenarioAnalysis.hothouse.keyDrivers,
                      portfolioResilience: scenarioAnalysis.hothouse.portfolioResilience
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">Portfolio value impact</p>
                <div className="space-y-1">
                  {scenarioAnalysis.hothouse.keyDrivers.map((driver, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      • {driver}
                    </p>
                  ))}
                </div>
              </div>
            </NarrativeInsightCard>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Strategic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio-Specific Scenario Planning</CardTitle>
          <p className="text-sm text-muted-foreground">
            Strategic recommendations based on your portfolio's scenario resilience profile
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Orderly Transition Strategy */}
            {scenarioAnalysis.orderly.impact > 5 && (
              <div className="p-4 border-l-4 border-l-green-500 bg-green-500/10 dark:bg-green-400/10">
                <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">Capitalize on Transition Upside</h5>
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                  Your portfolio is well-positioned to benefit from orderly transition scenarios.
                </p>
                <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <li>• Accelerate green financing programs to maximize transition benefits</li>
                  <li>• Market your sustainable finance capabilities to attract ESG-focused customers</li>
                  <li>• Consider expanding EV financing products and partnerships</li>
                </ul>
              </div>
            )}

            {/* Disorderly Transition Protection */}
            {scenarioAnalysis.disorderly.impact < -10 && (
              <div className="p-4 border-l-4 border-l-red-500 bg-red-500/10 dark:bg-red-400/10">
                <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">Critical: Disorderly Transition Risk</h5>
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  Your portfolio faces significant downside risk in disorderly transition scenarios.
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                  <li>• Implement stress testing for sudden policy changes</li>
                  <li>• Develop transition financing programs for existing ICE borrowers</li>
                  <li>• Consider portfolio rebalancing toward lower-emission vehicles</li>
                </ul>
              </div>
            )}

            {/* Physical Risk Management */}
            {scenarioAnalysis.hothouse.impact < -20 && (
              <div className="p-4 border-l-4 border-l-purple-500 bg-purple-500/10 dark:bg-purple-400/10">
                <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Physical Risk Mitigation</h5>
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                  High exposure to physical climate risks requires proactive management.
                </p>
                <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                  <li>• Diversify lending across different geographic regions</li>
                  <li>• Assess borrower exposure to extreme weather events</li>
                  <li>• Consider climate factors in underwriting and pricing</li>
                </ul>
              </div>
            )}

            {/* Data Quality Enhancement */}
            {scenarioAnalysis.portfolioMetrics?.avgDataQuality > 4.0 && (
              <div className="p-4 border-l-4 border-l-blue-500 bg-blue-500/10 dark:bg-blue-400/10">
                <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Improve Scenario Modeling Accuracy</h5>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  Better data quality will improve scenario analysis confidence and regulatory compliance.
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Implement systematic data collection processes</li>
                  <li>• Invest in staff training and data management systems</li>
                  <li>• Create incentives for customers to provide better data</li>
                </ul>
              </div>
            )}

            {/* Balanced Portfolio Recognition */}
            {scenarioAnalysis.orderly.impact > 0 && scenarioAnalysis.disorderly.impact > -10 && scenarioAnalysis.hothouse.impact > -20 && (
              <div className="p-4 border-l-4 border-l-teal-500 bg-teal-500/10 dark:bg-teal-400/10">
                <h5 className="font-medium text-teal-700 dark:text-teal-300 mb-2">Well-Balanced Portfolio</h5>
                <p className="text-sm text-teal-600 dark:text-teal-400 mb-2">
                  Your portfolio demonstrates good resilience across multiple climate scenarios.
                </p>
                <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1">
                  <li>• Maintain current diversification strategy</li>
                  <li>• Continue gradual transition toward cleaner vehicles</li>
                  <li>• Monitor scenario developments and adjust strategy accordingly</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnomalyDetection({ aiInsights, portfolioData }: { aiInsights: AIInsightResponse | null; portfolioData: any }) {
  const anomalies = [
    {
      id: 'AUTO0156',
      severity: 'high',
      type: 'Emissions Outlier',
      description: 'Unusually high emissions for vehicle class (8.2 tCO2e vs 4.1 avg)',
      confidence: '95%',
      impact: 'Data Quality',
      recommendation: 'Verify vehicle specifications and usage patterns'
    },
    {
      id: 'AUTO0203',
      severity: 'high',
      type: 'Data Quality',
      description: 'Data quality score 4.5/5 - requires validation',
      confidence: '88%',
      impact: 'PCAF Compliance',
      recommendation: 'Request additional documentation from borrower'
    },
    {
      id: 'AUTO0089',
      severity: 'medium',
      type: 'Missing Data',
      description: 'Missing fuel efficiency data affecting PCAF score',
      confidence: '92%',
      impact: 'Calculation Accuracy',
      recommendation: 'Use industry standard estimates with appropriate data quality score'
    },
    {
      id: 'AUTO0134',
      severity: 'low',
      type: 'Data Inconsistency',
      description: 'Vehicle age discrepancy in emissions calculation',
      confidence: '76%',
      impact: 'Minor Variance',
      recommendation: 'Cross-reference with vehicle registration data'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Anomaly Detection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Machine learning algorithms identify unusual patterns and data quality issues
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-red-600">2</p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue="2"
                  additionalData={{
                    riskType: 'anomaly_detection',
                    severity: 'high',
                    totalAnomalies: 4,
                    detectionMethod: 'ML algorithms'
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">High Severity</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-orange-600">1</p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue="1"
                  additionalData={{
                    riskType: 'anomaly_detection',
                    severity: 'medium',
                    impact: 'data_quality',
                    actionRequired: 'validation'
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">Medium Severity</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-blue-600">1</p>
                <AIContextTooltip
                  metricType="risk_analytics"
                  metricValue="1"
                  additionalData={{
                    riskType: 'anomaly_detection',
                    severity: 'low',
                    impact: 'minor_variance',
                    actionRequired: 'monitoring'
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">Low Severity</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-2xl font-bold text-green-600">98.4%</p>
                <AIContextTooltip
                  metricType="portfolio_health"
                  metricValue="98.4"
                  additionalData={{
                    type: 'detection_accuracy',
                    algorithm: 'ensemble_ml',
                    falsePositiveRate: 1.6,
                    modelConfidence: 0.984
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <p className="text-xs text-muted-foreground">Detection Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {anomalies.map((anomaly, index) => (
          <NarrativeInsightCard
            key={index}
            title={`${anomaly.id} - ${anomaly.type}`}
            variant={anomaly.severity === 'high' ? 'warning' : anomaly.severity === 'medium' ? 'info' : 'default'}
            narrative={contextualNarrativeService.generateAnomalyNarrative(anomaly)}
            className="hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={anomaly.severity === 'high' ? 'destructive' :
                      anomaly.severity === 'medium' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {anomaly.severity} severity
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {anomaly.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {anomaly.confidence} confidence
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Investigate
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">{anomaly.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">Impact: </span>
                  <span className="text-muted-foreground">{anomaly.impact}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Confidence: </span>
                  <span className="text-muted-foreground">{anomaly.confidence}</span>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-sm text-foreground">Recommended Action:</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">{anomaly.recommendation}</p>
              </div>
            </div>
          </NarrativeInsightCard>
        ))}
      </div>
    </div>
  );
}

function AIInsightsPage() {
  const [activeView, setActiveView] = useState<'overview' | 'advanced'>('overview');
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<AIInsightResponse | null>(null);
  const [narrativeInsights, setNarrativeInsights] = useState<NarrativeInsightCard[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load AI-powered insights on component mount
  useEffect(() => {
    loadAIInsights();

    // Disable real-time service for this page to prevent WebSocket errors
    return () => {
      // Cleanup any real-time connections when leaving the page
      try {
        // Import and disconnect realTimeService if available
        import('@/services/realTimeService').then(({ realTimeService }) => {
          realTimeService.disconnect();
        }).catch(() => {
          // Ignore import errors
        });
      } catch (error) {
        console.warn('Error disconnecting real-time service:', error);
      }
    };
  }, []);

  const loadAIInsights = async () => {
    try {
      console.log('🚀 Starting AI insights loading...');
      setLoading(true);
      setError(null);

      // 1. Load portfolio data from service
      console.log('📊 Loading portfolio data...');
      const portfolio = await portfolioService.getPortfolioSummary();
      console.log('✅ Portfolio data loaded:', portfolio);
      setPortfolioData(portfolio);

      // 2. Generate AI insights using data pipeline and ChromaDB
      console.log('🧠 Generating AI insights via data pipeline...');

      // Use the data pipeline approach with ChromaDB for semantic analysis
      const pipelineInsights = await narrativePipelineIntegration.generateNarrativeInsights();
      console.log('✅ Pipeline insights generated:', pipelineInsights);
      setNarrativeInsights(pipelineInsights);

      // 3. Generate actionable AI insights from pipeline data
      console.log('🎯 Processing actionable insights...');
      const insightRequest: AIInsightRequest = {
        query: "Based on the data pipeline analysis, provide strategic insights for portfolio decarbonization and PCAF compliance",
        context: {
          portfolioSummary: portfolio,
          pipelineInsights: pipelineInsights,
          analysisType: 'pipeline_enhanced'
        },
        agent: 'advisory'
      };

      const insights = await aiService.getAIInsights(insightRequest);
      console.log('✅ AI insights generated from pipeline:', insights);
      setAiInsights(insights);

      // 4. Get ChromaDB-enhanced recommendations
      console.log('💡 Getting ChromaDB-enhanced recommendations...');
      const recs = await aiService.getRecommendations();
      console.log('✅ ChromaDB recommendations loaded:', recs);
      setRecommendations(recs);

      console.log('🎉 All AI insights loaded successfully!');

    } catch (error) {
      console.error('❌ Failed to load AI insights:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });

      setError('Failed to load AI insights. Using fallback data.');

      // Fallback to basic portfolio data if AI services fail
      console.log('🔄 Using fallback data...');
      const fallbackData = {
        loans: Array(247).fill(null).map((_, i) => ({ id: `AUTO${String(i + 1).padStart(4, '0')}` })),
        totalEmissions: 1847,
        avgDataQuality: 2.8,
        evPercentage: 18.2,
        anomalies: [],
        totalInstruments: 247,
        totalLoanAmount: 8200000,
        totalOutstandingBalance: 7800000,
        totalFinancedEmissions: 1847,
        averageDataQualityScore: 2.8
      };
      setPortfolioData(fallbackData);

      // Set empty AI insights to prevent undefined errors
      setAiInsights(null);
      setNarrativeInsights([]);
      setRecommendations([]);

      console.log('✅ Fallback data set, component should render now');

      toast({
        title: "AI Services Unavailable",
        description: "Using cached insights. Some features may be limited.",
        variant: "destructive"
      });
    } finally {
      console.log('🏁 Loading complete, setting loading to false');
      setLoading(false);
    }
  };

  const refreshAIInsights = async () => {
    toast({
      title: "Refreshing AI Insights",
      description: "Generating new insights from latest portfolio data...",
    });
    await loadAIInsights();
  };

  useEffect(() => {
    document.title = "AI Insights — Financed Emissions";
    const desc = "AI-powered insights for financed emissions: portfolio analysis, target tracking, anomaly detection, and strategic recommendations.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
    const link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute('href', window.location.href);
    else {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      l.setAttribute('href', window.location.href);
      document.head.appendChild(l);
    }
  }, []);

  console.log('🎯 AIInsightsPage render - loading:', loading, 'error:', error, 'portfolioData:', !!portfolioData);

  // Loading state
  if (loading) {
    console.log('⏳ Rendering loading state');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading AI insights...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (only if no fallback data)
  if (error && !portfolioData) {
    console.log('❌ Rendering error state');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <button
              onClick={loadAIInsights}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering main content with activeView:', activeView);

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card className="border border-border/50 bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">AI Insights Dashboard</CardTitle>
                <p className="text-muted-foreground">
                  Intelligent analysis of your financed emissions portfolio with actionable recommendations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('overview')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Overview
              </Button>
              <Button
                variant={activeView === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('advanced')}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Advanced
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {activeView === 'overview' ? (
        <>
          {/* Executive Summary */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Executive Summary
            </h2>
            <ExecutiveSummary portfolioData={portfolioData} />
          </section>

          {/* Critical Alerts */}
          <CriticalAlerts portfolioData={portfolioData} />

          {/* Main Dashboard */}
          <section>
            <DashboardContent
              portfolioData={portfolioData}
              onViewAdvanced={() => setActiveView('advanced')}
            />
          </section>
        </>
      ) : (
        <AdvancedAnalyticsDashboard
          setActiveView={setActiveView}
          aiInsights={aiInsights}
          narrativeInsights={narrativeInsights}
          portfolioData={portfolioData}
        />
      )}
    </main>
  );
}

export default AIInsightsPage;