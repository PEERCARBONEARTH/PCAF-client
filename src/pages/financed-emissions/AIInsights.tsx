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
import { dynamicInsightsEngine, DynamicInsight } from "@/services/dynamic-insights-engine";
import { bankProfileService } from "@/services/bank-profile-service";
import DynamicInsightCard from "@/components/insights/DynamicInsightCard";
import AIContextTooltip from "@/components/insights/AIContextTooltip";

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
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</div>
          <p className="text-sm text-muted-foreground">
            DQ Score: {safeDataQuality.toFixed(1)}/5
          </p>
        </CardContent>
      </Card>
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
          className="cursor-pointer"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-primary" />
              <Badge variant="outline">{safeEvPercentage > 30 ? 'Good' : safeEvPercentage > 15 ? 'Fair' : 'Needs Attention'}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>EV Adoption Progress</span>
                <span className="font-medium">{safeEvPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={safeEvPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Emissions Trend</div>
                <div className={`font-semibold flex items-center gap-1 ${emissionsTrend < 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {emissionsTrend < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {Math.abs(emissionsTrend || 0).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Risk Level</div>
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
                    className="p-3 border border-border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      // Could open detailed anomaly view
                      console.log('Anomaly clicked:', anomaly);
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-medium">{anomaly.loanId}</span>
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
      <div className="flex justify-between items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border">
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

  // Load dynamic insights based on bank profile and portfolio data
  React.useEffect(() => {
    const loadDynamicInsights = async () => {
      setIsLoadingInsights(true);
      try {
        // Initialize or load bank profile
        let profile = bankProfileService.getCurrentProfile();
        if (!profile) {
          profile = bankProfileService.initializeDemoProfile();
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

  return (
    <div className="space-y-6">
      {/* Strategic Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 dark:from-green-400/10 dark:to-green-500/10 dark:border-green-400/20 hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">EV Adoption Rate</p>
                  <AIContextTooltip 
                    metricType="ev_percentage" 
                    metricValue="7.7"
                    additionalData={{ 
                      industryAvg: 12.5,
                      trend: 'improving',
                      totalLoans: portfolioData?.totalLoans || 247
                    }}
                  />
                </div>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">7.7%</p>
                <p className="text-xs text-green-600 dark:text-green-400">Above industry avg</p>
              </div>
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 dark:from-blue-400/10 dark:to-blue-500/10 dark:border-blue-400/20 hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Emissions (tCO2e)</p>
                  <AIContextTooltip 
                    metricType="emissions" 
                    metricValue="268"
                    additionalData={{ 
                      trend: 'declining',
                      emissionIntensity: 2.1,
                      portfolioSize: portfolioData?.totalLoans || 247
                    }}
                  />
                </div>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">268</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Portfolio baseline</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 dark:from-orange-400/10 dark:to-orange-500/10 dark:border-orange-400/20 hover:shadow-lg transition-all duration-200 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Data Quality</p>
                  <AIContextTooltip 
                    metricType="data_quality" 
                    metricValue="5.0"
                    additionalData={{ 
                      target: 3.0,
                      complianceStatus: 'needs_improvement',
                      improvableLoans: Math.round((portfolioData?.totalLoans || 247) * 0.6)
                    }}
                  />
                </div>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">5.0</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Enhancement needed</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Strategic Insights */}
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
        ) : (
          <Card className="p-6 text-center">
            <Brain className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
            <p className="text-muted-foreground mb-4">
              Complete your bank profile to get personalized AI insights.
            </p>
            <Button onClick={() => {
              // This would open a profile setup modal or navigate to settings
              console.log('Setup profile clicked');
            }}>
              Setup Bank Profile
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
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Baseline</span>
                  <span className="font-medium text-foreground">268 tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Projected (Q4 2024)</span>
                  <span className="font-medium text-green-600 dark:text-green-400">245 tCO2e (-8.6%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Best Case Scenario</span>
                  <span className="font-medium text-green-700 dark:text-green-300">220 tCO2e (-17.9%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Key Drivers</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">EV adoption acceleration (+15% projected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">Fleet modernization initiatives</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-muted-foreground">Regulatory compliance requirements</span>
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
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Portfolio Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NarrativeInsightCard
              title="Transition Risk Analysis"
              variant="warning"
              narrative={contextualNarrativeService.generateRiskAnalyticsNarrative('transition_risk', 'high')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Policy Risk</p>
                    <p className="text-xs text-muted-foreground">Regulatory changes impact</p>
                  </div>
                  <Badge variant="destructive">High</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Technology Risk</p>
                    <p className="text-xs text-muted-foreground">EV adoption disruption</p>
                  </div>
                  <Badge variant="secondary">Medium</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Market Risk</p>
                    <p className="text-xs text-muted-foreground">Consumer preference shifts</p>
                  </div>
                  <Badge variant="secondary">Medium</Badge>
                </div>
              </div>
            </NarrativeInsightCard>

            <NarrativeInsightCard
              title="Physical Risk Exposure"
              variant="info"
              narrative={contextualNarrativeService.generateRiskAnalyticsNarrative('physical_risk', 'low')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Acute Risks</p>
                    <p className="text-xs text-muted-foreground">Extreme weather events</p>
                  </div>
                  <Badge variant="outline">Low</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Chronic Risks</p>
                    <p className="text-xs text-muted-foreground">Long-term climate changes</p>
                  </div>
                  <Badge variant="outline">Low</Badge>
                </div>
              </div>
            </NarrativeInsightCard>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Mitigation Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border-l-4 border-l-orange-500 bg-orange-500/10 dark:bg-orange-400/10">
              <h5 className="font-medium text-orange-700 dark:text-orange-300">Priority Action</h5>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                Diversify portfolio towards low-emission vehicles to reduce transition risk exposure
              </p>
            </div>
            <div className="p-4 border-l-4 border-l-blue-500 bg-blue-500/10 dark:bg-blue-400/10">
              <h5 className="font-medium text-blue-700 dark:text-blue-300">Medium-term Strategy</h5>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Develop green financing products to capture EV market opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClimateScenarios({ aiInsights, portfolioData }: { aiInsights: AIInsightResponse | null; portfolioData: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Climate Scenario Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Portfolio performance under different climate scenarios (NGFS scenarios)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NarrativeInsightCard
              title="Orderly Transition"
              variant="success"
              narrative={contextualNarrativeService.generateClimateScenarioNarrative('orderly', 12)}
              className="bg-green-500/10 border-green-500/20 dark:bg-green-400/10 dark:border-green-400/20"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">+12%</p>
                <p className="text-xs text-green-600 dark:text-green-400 mb-3">Portfolio value impact</p>
                <p className="text-xs text-muted-foreground">
                  Early policy action enables smooth transition to net-zero
                </p>
              </div>
            </NarrativeInsightCard>

            <NarrativeInsightCard
              title="Disorderly Transition"
              variant="warning"
              narrative={contextualNarrativeService.generateClimateScenarioNarrative('disorderly', -8)}
              className="bg-orange-500/10 border-orange-500/20 dark:bg-orange-400/10 dark:border-orange-400/20"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">-8%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">Portfolio value impact</p>
                <p className="text-xs text-muted-foreground">
                  Late policy action leads to higher transition costs
                </p>
              </div>
            </NarrativeInsightCard>

            <NarrativeInsightCard
              title="Hot House World"
              variant="warning"
              narrative={contextualNarrativeService.generateClimateScenarioNarrative('hothouse', -15)}
              className="bg-red-500/10 border-red-500/20 dark:bg-red-400/10 dark:border-red-400/20"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">-15%</p>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">Portfolio value impact</p>
                <p className="text-xs text-muted-foreground">
                  Limited climate action leads to severe physical risks
                </p>
              </div>
            </NarrativeInsightCard>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Planning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-card">
              <h5 className="font-medium mb-2 text-foreground">Key Findings</h5>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Portfolio shows resilience in orderly transition scenarios</li>
                <li>• EV exposure provides upside in all transition scenarios</li>
                <li>• Physical risk exposure remains limited across all scenarios</li>
                <li>• Data quality improvements critical for accurate scenario modeling</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg dark:bg-blue-400/10 dark:border-blue-400/20">
              <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Strategic Recommendation</h5>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Accelerate EV financing initiatives to maximize benefits from transition scenarios
                while maintaining diversification to manage disorderly transition risks.
              </p>
            </div>
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
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-xs text-muted-foreground">High Severity</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">1</p>
              <p className="text-xs text-muted-foreground">Medium Severity</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">1</p>
              <p className="text-xs text-muted-foreground">Low Severity</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">98.4%</p>
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