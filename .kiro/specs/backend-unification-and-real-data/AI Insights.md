import { useEffect, useState } from "react";
import { AnalyticsDataProvider, useAnalyticsData } from "@/contexts/AnalyticsDataContext";
import { useAssumptions } from "@/contexts/AssumptionsContext";
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
  Activity
} from "lucide-react";
import { TargetAwareInsights } from "@/components/analytics/TargetAwareInsights";
import { TargetNudge } from "@/components/targets/TargetNudge";
import { AdvancedAnalyticsEngine } from "@/components/AdvancedAnalyticsEngine";
import { useNavigate } from "react-router-dom";
import { NarrativeButton } from "@/components/shared/NarrativeButton";
import { DataNarrativeModal } from "@/components/shared/DataNarrativeModal";
import { climateNarrativeService } from "@/services/climate-narrative-service";

// Executive Summary Component
function ExecutiveSummary() {
  const { loans, totalEmissions, avgDataQuality, evPercentage, loading } = useAnalyticsData();
  const [selectedNarrative, setSelectedNarrative] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingNarrative, setLoadingNarrative] = useState<string | null>(null);
  
  if (loading) return null;

  const portfolioValue = loans.reduce((sum, loan) => sum + (loan.outstanding_balance || loan.loan_amount || 0), 0);
  const riskLevel = avgDataQuality > 4 ? 'Low' : avgDataQuality > 3 ? 'Medium' : 'High';
  const riskColor = avgDataQuality > 4 ? 'text-green-600' : avgDataQuality > 3 ? 'text-yellow-600' : 'text-destructive';

  const handleExplainMetric = async (metricType: string, currentValue: number | string, targetValue?: number | string) => {
    setLoadingNarrative(metricType);
    try {
      const narrative = await climateNarrativeService.generateMetricNarrative(
        metricType as any,
        currentValue,
        targetValue,
        { loans, totalEmissions, avgDataQuality, evPercentage }
      );
      setSelectedNarrative(narrative);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating narrative:', error);
    } finally {
      setLoadingNarrative(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Overview</CardTitle>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-primary" />
                <NarrativeButton
                  onClick={() => handleExplainMetric('portfolio-overview', loans.length)}
                  loading={loadingNarrative === 'portfolio-overview'}
                  tooltip="Explain portfolio metrics"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loans.length}</div>
            <p className="text-sm text-muted-foreground">
              ${(portfolioValue / 1000000).toFixed(1)}M total value
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">EV Transition</CardTitle>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-green-500" />
                <NarrativeButton
                  onClick={() => handleExplainMetric('ev-transition', evPercentage)}
                  loading={loadingNarrative === 'ev-transition'}
                  tooltip="Explain EV adoption progress"
                />
              </div>
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
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-orange-500" />
                <NarrativeButton
                  onClick={() => handleExplainMetric('emissions-total', totalEmissions)}
                  loading={loadingNarrative === 'emissions-total'}
                  tooltip="Explain emissions analysis"
                />
              </div>
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
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <NarrativeButton
                  onClick={() => handleExplainMetric('risk-level', riskLevel)}
                  loading={loadingNarrative === 'risk-level'}
                  tooltip="Explain risk assessment"
                />
              </div>
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

      <DataNarrativeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        narrative={selectedNarrative}
      />
    </>
  );
}

// Critical Alerts Component
function CriticalAlerts() {
  const { anomalies, loading, loans } = useAnalyticsData();
  const [selectedNarrative, setSelectedNarrative] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingNarrative, setLoadingNarrative] = useState<string | null>(null);
  
  if (loading || anomalies.length === 0) return null;

  const criticalAnomalies = anomalies.filter(a => a.severity === 'high').slice(0, 3);
  
  if (criticalAnomalies.length === 0) return null;

  const handleExplainAnomalies = async () => {
    setLoadingNarrative('critical-alerts');
    try {
      // Generate narrative for the first critical anomaly as representative
      const anomaly = criticalAnomalies[0];
      const narrative = await climateNarrativeService.generateAnomalyNarrative(
        anomaly,
        { loans, totalAnomalies: anomalies.length, criticalCount: criticalAnomalies.length }
      );
      setSelectedNarrative(narrative);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating anomaly narrative:', error);
    } finally {
      setLoadingNarrative(null);
    }
  };

  return (
    <>
      <Alert className="border-destructive/50 bg-destructive/5">
        <div className="flex items-start justify-between">
          <div className="flex">
            <AlertTriangle className="h-4 w-4 text-destructive mr-3 mt-0.5" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold text-destructive">
                  {criticalAnomalies.length} Critical Alert{criticalAnomalies.length > 1 ? 's' : ''} Detected
                </div>
                {criticalAnomalies.slice(0, 2).map((anomaly, index) => (
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
          <div className="ml-2">
            <NarrativeButton
              onClick={handleExplainAnomalies}
              loading={loadingNarrative === 'critical-alerts'}
              tooltip="Explain critical alerts"
              variant="ghost"
            />
          </div>
        </div>
      </Alert>

      <DataNarrativeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        narrative={selectedNarrative}
      />
    </>
  );
}

// Main Dashboard Content
function DashboardContent({ onViewAdvanced }: {
  onViewAdvanced?: () => void;
}) {
  const navigate = useNavigate();
  const { hasTargetsConfigured } = useAssumptions();
  const { anomalies, forecasts, evPercentage, loading, loans } = useAnalyticsData();
  const [selectedNarrative, setSelectedNarrative] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingNarrative, setLoadingNarrative] = useState<string | null>(null);

  const handleExplainPortfolioHealth = async () => {
    setLoadingNarrative('portfolio-health');
    try {
      const narrative = await climateNarrativeService.generateMetricNarrative(
        'portfolio-overview',
        evPercentage,
        undefined,
        { loans, evPercentage, healthStatus: evPercentage > 30 ? 'Good' : evPercentage > 15 ? 'Fair' : 'Needs Attention' }
      );
      narrative.title = 'Portfolio Health Analysis';
      narrative.dataType = 'portfolio-health';
      setSelectedNarrative(narrative);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating portfolio health narrative:', error);
    } finally {
      setLoadingNarrative(null);
    }
  };

  const handleExplainAnomalies = async () => {
    setLoadingNarrative('anomalies-detected');
    try {
      if (anomalies.length > 0) {
        const narrative = await climateNarrativeService.generateAnomalyNarrative(
          anomalies[0],
          { loans, totalAnomalies: anomalies.length }
        );
        narrative.title = 'Anomalies Detection Analysis';
        setSelectedNarrative(narrative);
      } else {
        // Generate a narrative for no anomalies detected
        setSelectedNarrative({
          dataType: 'anomaly-detection',
          title: 'No Anomalies Detected',
          contextualExplanation: 'Your portfolio is performing within normal parameters with no significant anomalies detected. This indicates good portfolio health and consistent data quality.',
          portfolioSpecifics: 'All loans in your portfolio are showing expected performance patterns and data consistency.',
          industryComparison: 'Maintaining zero anomalies is excellent performance compared to industry averages.',
          actionableInsights: ['Continue current monitoring practices', 'Maintain data quality standards', 'Regular portfolio health reviews'],
          keyTakeaways: ['Excellent portfolio health', 'Strong data quality', 'Effective monitoring systems'],
          confidence: 0.95,
          priority: 'low' as const
        });
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating anomalies narrative:', error);
    } finally {
      setLoadingNarrative(null);
    }
  };
  
  if (loading) {
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

  const emissionsTrend = forecasts.length >= 2 ? 
    ((forecasts[11]?.emissions || 0) - (forecasts[0]?.emissions || 0)) / (forecasts[0]?.emissions || 1) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Target Progress or Setup Nudge */}
      {!hasTargetsConfigured ? (
        <TargetNudge 
          variant="banner"
          onSetupTargets={() => navigate('/financed-emissions/settings')}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Target Progress & Strategic Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
          <TargetAwareInsights onViewDetails={(category) => {
            // Map category to correct route
            const routeMap: Record<string, string> = {
              'decarbonization': '/financed-emissions/insights/forecasting-detail',
              'ev_adoption': '/financed-emissions/insights/ev-leadership', 
              'green_finance': '/financed-emissions/insights/green-finance',
              'data_quality': '/financed-emissions/insights/data-quality',
              'regulatory': '/financed-emissions/settings'
            };
            const route = routeMap[category] || `/financed-emissions/insights/${category.replace('_', '-')}`;
            navigate(route);
          }} />
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
                <NarrativeButton
                  onClick={handleExplainPortfolioHealth}
                  loading={loadingNarrative === 'portfolio-health'}
                  tooltip="Explain portfolio health"
                />
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
                <NarrativeButton
                  onClick={handleExplainAnomalies}
                  loading={loadingNarrative === 'anomalies-detected'}
                  tooltip="Explain anomaly detection"
                />
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
              className="justify-start h-auto p-4"
              onClick={onViewAdvanced}
            >
              <div className="text-left">
                <div className="font-medium">Advanced Analytics</div>
                <div className="text-xs text-muted-foreground">Comprehensive view</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataNarrativeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        narrative={selectedNarrative}
      />
    </div>
  );
}

export default function AIInsightsPage() {
  const [activeView, setActiveView] = useState<'overview' | 'advanced'>('overview');

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
    <AnalyticsDataProvider>
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
              <ExecutiveSummary />
            </section>

            {/* Critical Alerts */}
            <CriticalAlerts />

        {/* Main Dashboard */}
        <section>
          <DashboardContent 
            onViewAdvanced={() => setActiveView('advanced')}
          />
        </section>
      </>
    ) : (
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Advanced Analytics
        </h2>
        <AdvancedAnalyticsEngine />
      </section>
        )}
      </main>
    </AnalyticsDataProvider>
  );
}
