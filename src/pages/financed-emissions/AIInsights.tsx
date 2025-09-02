import { useEffect, useState } from "react";
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
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAssumptions } from "@/contexts/AssumptionsContext";
import { portfolioService } from "@/services/portfolioService";
import { useToast } from "@/hooks/use-toast";

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


    </div>
  );
}

export default function AIInsightsPage() {
  const [activeView, setActiveView] = useState<'overview' | 'advanced'>('overview');
  
  // Realistic demo data matching sample data loader
  const portfolioData = {
    loans: Array(247).fill(null).map((_, i) => ({ id: `AUTO${String(i + 1).padStart(4, '0')}` })),
    totalEmissions: 1847, // tCO2e annually
    avgDataQuality: 2.8, // PCAF compliant
    evPercentage: 18.2, // 18% EV share (45 vehicles)
    anomalies: [
      {
        loanId: 'AUTO0156',
        severity: 'high',
        description: 'Unusually high emissions for vehicle class (8.2 tCO2e vs 4.1 avg)'
      },
      {
        loanId: 'AUTO0089',
        severity: 'medium', 
        description: 'Missing fuel efficiency data affecting PCAF score'
      },
      {
        loanId: 'AUTO0203',
        severity: 'high',
        description: 'Data quality score 4.5/5 - requires validation'
      },
      {
        loanId: 'AUTO0134',
        severity: 'low',
        description: 'Vehicle age discrepancy in emissions calculation'
      }
    ]
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
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Advanced Analytics
        </h2>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Comprehensive portfolio analysis with detailed insights and recommendations.
              </p>
              <Button onClick={() => setActiveView('overview')}>
                Return to Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
        )}
      </main>
    );
}
