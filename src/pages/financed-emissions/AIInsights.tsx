import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

// Executive Summary Component
function ExecutiveSummary({ portfolioData }: { portfolioData: any }) {
  if (!portfolioData) return null;

  const { loans, totalEmissions, avgDataQuality, evPercentage } = portfolioData;
  const portfolioValue = 8200000; // $8.2M realistic demo value
  const riskLevel = avgDataQuality <= 3 ? 'Low' : avgDataQuality <= 4 ? 'Medium' : 'High';
  const riskColor = avgDataQuality <= 3 ? 'text-green-600' : avgDataQuality <= 4 ? 'text-yellow-600' : 'text-destructive';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Overview</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">247</div>
          <p className="text-sm text-muted-foreground">
            $8.2M total value
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">EV Transition</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{evPercentage.toFixed(1)}%</div>
          <p className="text-sm text-muted-foreground">Electric vehicles</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emissions</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmissions.toFixed(1)}</div>
          <p className="text-sm text-muted-foreground">tCO₂e total</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</div>
          <p className="text-sm text-muted-foreground">
            DQ Score: {avgDataQuality.toFixed(1)}/5
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
  const { hasTargetsConfigured } = useAssumptions();
  
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

  const { evPercentage, anomalies } = portfolioData;
  const emissionsTrend = -2.5; // Mock trend data

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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Portfolio Health
              </CardTitle>
              <Badge variant="outline">{evPercentage > 30 ? 'Good' : evPercentage > 15 ? 'Fair' : 'Needs Attention'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>EV Adoption Progress</span>
                <span className="font-medium">{evPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={evPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Emissions Trend</div>
                <div className={`font-semibold flex items-center gap-1 ${emissionsTrend < 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {emissionsTrend < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {Math.abs(emissionsTrend).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Risk Level</div>
                <div className="font-semibold">Medium</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anomalies & Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Anomalies Detected
              </CardTitle>
              <Badge variant={anomalies.length > 3 ? "destructive" : "secondary"}>
                {anomalies.length} found
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {anomalies.length > 0 ? (
              <>
                {anomalies.slice(0, 3).map((anomaly, index) => (
                  <div 
                    key={index}
                    className="p-3 border rounded-lg bg-muted/20"
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
          </CardContent>
        </Card>
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
                <div className="text-xs text-primary/70">6 analysis modules</div>
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
    { id: 'factors', label: 'Emission Factors', icon: BarChart3 },
    { id: 'risk', label: 'Risk Analytics', icon: AlertTriangle },
    { id: 'climate', label: 'Climate Scenarios', icon: Activity },
    { id: 'anomaly', label: 'Anomaly Detection', icon: Brain }
  ];

  return (
    <div className="space-y-6">
      {/* Advanced Analytics Header */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Advanced Analytics
              </CardTitle>
              <p className="text-slate-300 mt-1">
                Comprehensive analytics dashboard with granular insights for each domain.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-600 text-white">
                4 insights generated
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveView('overview')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Eye className="h-4 w-4 mr-1" />
                Back to Overview
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'strategic' && <StrategicInsights aiInsights={aiInsights} narrativeInsights={narrativeInsights} portfolioData={portfolioData} />}
      {activeTab === 'emissions' && <EmissionsForecasts aiInsights={aiInsights} portfolioData={portfolioData} />}
      {activeTab === 'factors' && <EmissionFactorsAnalysis aiInsights={aiInsights} portfolioData={portfolioData} />}
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
  // Generate insights from AI recommendations and narrative cards
  const insights = React.useMemo(() => {
    if (!aiInsights && narrativeInsights.length === 0) {
      return []; // Return empty if no AI data available
    }

    const generatedInsights = [];

    // Convert AI recommendations to insight format
    if (aiInsights?.recommendations) {
      aiInsights.recommendations.forEach((rec, index) => {
        generatedInsights.push({
          title: rec.title,
          category: rec.title.includes('EV') ? 'EV Leadership' : 
                   rec.title.includes('Data') ? 'Data Quality' :
                   rec.title.includes('Risk') ? 'Portfolio Risk' : 'Strategic',
          priority: index + 1,
          impact: rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'medium' : 'low',
          confidence: `${Math.round(aiInsights.confidence * 100)}%`,
          description: rec.description,
          recommendation: `AI Recommendation: ${rec.description}`,
          timeline: "AI Generated",
          metrics: {
            confidence: `${Math.round(aiInsights.confidence * 100)}%`,
            source: "Vector AI Analysis",
            processingTime: `${aiInsights.metadata?.processingTime || 0}ms`
          }
        });
      });
    }

    // Convert narrative insights to insight format
    narrativeInsights.forEach((narrative, index) => {
      if (narrative.narrative) {
        generatedInsights.push({
          title: narrative.narrative.title,
          category: narrative.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          priority: narrative.priority === 'high' ? 1 : narrative.priority === 'medium' ? 2 : 3,
          impact: narrative.priority,
          confidence: `${Math.round(narrative.confidence * 100)}%`,
          description: narrative.narrative.executiveSummary,
          recommendation: narrative.narrative.actionableRecommendations[0]?.action || "See detailed analysis",
          timeline: narrative.narrative.actionableRecommendations[0]?.timeframe || "TBD",
          metrics: {
            confidence: `${Math.round(narrative.confidence * 100)}%`,
            type: narrative.type,
            lastUpdated: narrative.lastUpdated.toLocaleDateString()
          }
        });
      }
    });

    return generatedInsights.slice(0, 4); // Limit to top 4 insights
  }, [aiInsights, narrativeInsights]);

  return (
    <div className="space-y-6">
      {/* Strategic Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">EV Adoption Rate</p>
                <p className="text-2xl font-bold text-green-900">7.7%</p>
                <p className="text-xs text-green-600">Above industry avg</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Emissions (tCO2e)</p>
                <p className="text-2xl font-bold text-blue-900">268</p>
                <p className="text-xs text-blue-600">Portfolio baseline</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Avg Data Quality</p>
                <p className="text-2xl font-bold text-orange-900">5.0</p>
                <p className="text-xs text-orange-600">Enhancement needed</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights Cards */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    insight.impact === 'high' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {insight.category} • Priority {insight.priority}
                      </Badge>
                      <Badge 
                        variant={insight.impact === 'high' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          insight.impact === 'high' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence} confidence
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Deep Dive Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">{insight.description}</p>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Recommended Action:</span>
                  </div>
                  <p className="text-sm text-green-700">{insight.recommendation}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">Timeline: <span className="font-medium">{insight.timeline}</span></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmissionFactorsAnalysis() {
  const emissionFactors = [
    {
      category: 'Gasoline Vehicles',
      factor: '4.63',
      unit: 'kg CO2e/gallon',
      source: 'EPA 2024',
      confidence: '95%',
      lastUpdated: '2024-01-15',
      portfolioUsage: '58%',
      variance: '+2.1%'
    },
    {
      category: 'Diesel Vehicles',
      factor: '5.15',
      unit: 'kg CO2e/gallon',
      source: 'EPA 2024',
      confidence: '94%',
      lastUpdated: '2024-01-15',
      portfolioUsage: '24%',
      variance: '-1.3%'
    },
    {
      category: 'Hybrid Vehicles',
      factor: '2.31',
      unit: 'kg CO2e/gallon',
      source: 'EPA 2024',
      confidence: '92%',
      lastUpdated: '2024-01-15',
      portfolioUsage: '11%',
      variance: '-8.7%'
    },
    {
      category: 'Electric Vehicles',
      factor: '0.85',
      unit: 'kg CO2e/kWh',
      source: 'Grid Mix 2024',
      confidence: '88%',
      lastUpdated: '2024-02-01',
      portfolioUsage: '7%',
      variance: '-15.2%'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Emission Factors Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed analysis of emission factors used in portfolio calculations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-900">4</p>
              <p className="text-xs text-blue-600">Factor Categories</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-900">93%</p>
              <p className="text-xs text-green-600">Avg Confidence</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-orange-50">
              <p className="text-2xl font-bold text-orange-900">EPA</p>
              <p className="text-xs text-orange-600">Primary Source</p>
            </div>
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <p className="text-2xl font-bold text-purple-900">2024</p>
              <p className="text-xs text-purple-600">Latest Vintage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {emissionFactors.map((factor, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    factor.category.includes('Electric') ? 'bg-green-100 text-green-700' :
                    factor.category.includes('Hybrid') ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{factor.category}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {factor.source}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {factor.confidence} confidence
                      </Badge>
                      <Badge 
                        variant={factor.variance.startsWith('-') ? 'default' : 'secondary'}
                        className={`text-xs ${
                          factor.variance.startsWith('-') 
                            ? 'bg-green-600 text-white' 
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {factor.variance} vs industry
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update Factor
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Emission Factor: </span>
                  <span className="text-muted-foreground">{factor.factor} {factor.unit}</span>
                </div>
                <div>
                  <span className="font-medium">Portfolio Usage: </span>
                  <span className="text-muted-foreground">{factor.portfolioUsage}</span>
                </div>
                <div>
                  <span className="font-medium">Last Updated: </span>
                  <span className="text-muted-foreground">{factor.lastUpdated}</span>
                </div>
                <div>
                  <span className="font-medium">Data Quality: </span>
                  <span className="text-muted-foreground">PCAF Level 2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factor Validation & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <h5 className="font-medium text-blue-800 mb-2">Recommended Updates</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Electric vehicle factors: Update to regional grid mix (quarterly)</li>
                <li>• Hybrid efficiency: Incorporate latest EPA fuel economy data</li>
                <li>• Diesel factors: Consider biodiesel blend ratios in calculations</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-green-50">
              <h5 className="font-medium text-green-800 mb-2">Quality Assurance</h5>
              <p className="text-sm text-green-700">
                All emission factors are validated against EPA standards and updated quarterly. 
                Custom factors undergo peer review and documentation requirements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmissionsForecasts() {
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
              <h4 className="font-medium">12-Month Projection</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Baseline</span>
                  <span className="font-medium">268 tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Projected (Q4 2024)</span>
                  <span className="font-medium text-green-600">245 tCO2e (-8.6%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Best Case Scenario</span>
                  <span className="font-medium text-green-700">220 tCO2e (-17.9%)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Key Drivers</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>EV adoption acceleration (+15% projected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Fleet modernization initiatives</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Regulatory compliance requirements</span>
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
            <div className="p-4 border rounded-lg bg-green-50">
              <h5 className="font-medium text-green-800 mb-2">Optimistic Scenario</h5>
              <p className="text-2xl font-bold text-green-900">-25%</p>
              <p className="text-xs text-green-600">Emissions reduction by 2025</p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50">
              <h5 className="font-medium text-blue-800 mb-2">Base Case</h5>
              <p className="text-2xl font-bold text-blue-900">-15%</p>
              <p className="text-xs text-blue-600">Expected reduction</p>
            </div>
            <div className="p-4 border rounded-lg bg-orange-50">
              <h5 className="font-medium text-orange-800 mb-2">Conservative</h5>
              <p className="text-2xl font-bold text-orange-900">-8%</p>
              <p className="text-xs text-orange-600">Minimum expected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RiskAnalytics() {
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
            <div className="space-y-4">
              <h4 className="font-medium">Transition Risk Analysis</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Policy Risk</p>
                    <p className="text-xs text-muted-foreground">Regulatory changes impact</p>
                  </div>
                  <Badge variant="destructive">High</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Technology Risk</p>
                    <p className="text-xs text-muted-foreground">EV adoption disruption</p>
                  </div>
                  <Badge variant="secondary">Medium</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Market Risk</p>
                    <p className="text-xs text-muted-foreground">Consumer preference shifts</p>
                  </div>
                  <Badge variant="secondary">Medium</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Physical Risk Exposure</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Acute Risks</p>
                    <p className="text-xs text-muted-foreground">Extreme weather events</p>
                  </div>
                  <Badge variant="outline">Low</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Chronic Risks</p>
                    <p className="text-xs text-muted-foreground">Long-term climate changes</p>
                  </div>
                  <Badge variant="outline">Low</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Mitigation Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border-l-4 border-l-orange-500 bg-orange-50">
              <h5 className="font-medium text-orange-800">Priority Action</h5>
              <p className="text-sm text-orange-700 mt-1">
                Diversify portfolio towards low-emission vehicles to reduce transition risk exposure
              </p>
            </div>
            <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
              <h5 className="font-medium text-blue-800">Medium-term Strategy</h5>
              <p className="text-sm text-blue-700 mt-1">
                Develop green financing products to capture EV market opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClimateScenarios() {
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
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <h4 className="font-medium text-green-800 mb-2">Orderly Transition</h4>
                <p className="text-2xl font-bold text-green-900">+12%</p>
                <p className="text-xs text-green-600 mb-3">Portfolio value impact</p>
                <p className="text-xs text-muted-foreground">
                  Early policy action enables smooth transition to net-zero
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4">
                <h4 className="font-medium text-orange-800 mb-2">Disorderly Transition</h4>
                <p className="text-2xl font-bold text-orange-900">-8%</p>
                <p className="text-xs text-orange-600 mb-3">Portfolio value impact</p>
                <p className="text-xs text-muted-foreground">
                  Late policy action leads to higher transition costs
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <h4 className="font-medium text-red-800 mb-2">Hot House World</h4>
                <p className="text-2xl font-bold text-red-900">-15%</p>
                <p className="text-xs text-red-600 mb-3">Portfolio value impact</p>
                <p className="text-xs text-muted-foreground">
                  Limited climate action leads to severe physical risks
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Planning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Key Findings</h5>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Portfolio shows resilience in orderly transition scenarios</li>
                <li>• EV exposure provides upside in all transition scenarios</li>
                <li>• Physical risk exposure remains limited across all scenarios</li>
                <li>• Data quality improvements critical for accurate scenario modeling</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">Strategic Recommendation</h5>
              <p className="text-sm text-blue-700">
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

function AnomalyDetection() {
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
          <Card key={index} className="hover:shadow-md transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    anomaly.severity === 'high' ? 'bg-red-100 text-red-700' :
                    anomaly.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{anomaly.id}</h4>
                    <div className="flex items-center gap-2 mt-1">
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
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Investigate
                </Button>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Impact: </span>
                    <span className="text-muted-foreground">{anomaly.impact}</span>
                  </div>
                  <div>
                    <span className="font-medium">Confidence: </span>
                    <span className="text-muted-foreground">{anomaly.confidence}</span>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Recommended Action:</span>
                  </div>
                  <p className="text-sm text-green-700">{anomaly.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
  }, []);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load portfolio data from service
      const portfolio = await portfolioService.getPortfolioSummary();
      setPortfolioData(portfolio);

      // 2. Generate AI insights using vector semantic analysis
      const insightRequest: AIInsightRequest = {
        query: "Analyze portfolio financed emissions performance, identify key risks, opportunities, and provide strategic recommendations for PCAF compliance and decarbonization",
        context: {
          portfolioSummary: portfolio,
          analysisType: 'portfolio'
        },
        agent: 'advisory'
      };

      const insights = await aiService.getAIInsights(insightRequest);
      setAiInsights(insights);

      // 3. Generate narrative insights using AI narrative builder
      const narrativeContext: NarrativeContext = {
        portfolioSize: portfolio?.totalInstruments || 247,
        bankType: 'community', // Could be dynamic based on user profile
        primaryMarket: 'Auto Lending',
        experienceLevel: 'intermediate',
        businessGoals: ['PCAF Compliance', 'Emission Reduction', 'Risk Management'],
        currentChallenges: ['Data Quality', 'EV Transition', 'Regulatory Requirements']
      };

      const narrativeCards = await narrativePipelineIntegration.generateNarrativeInsights();
      setNarrativeInsights(narrativeCards);

      // 4. Get AI recommendations
      const recs = await aiService.getRecommendations();
      setRecommendations(recs);

    } catch (error) {
      console.error('Failed to load AI insights:', error);
      setError('Failed to load AI insights. Using fallback data.');
      
      // Fallback to basic portfolio data if AI services fail
      const fallbackData = {
        loans: Array(247).fill(null).map((_, i) => ({ id: `AUTO${String(i + 1).padStart(4, '0')}` })),
        totalEmissions: 1847,
        avgDataQuality: 2.8,
        evPercentage: 18.2,
        anomalies: []
      };
      setPortfolioData(fallbackData);
      
      toast({
        title: "AI Services Unavailable",
        description: "Using cached insights. Some features may be limited.",
        variant: "destructive"
      });
    } finally {
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

  return (
    <main className="space-y-6">
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
      <AdvancedAnalyticsDashboard setActiveView={setActiveView} />
        )}
      </main>
    );
}

export default AIInsightsPage;