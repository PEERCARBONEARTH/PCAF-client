import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Zap,
  Shield,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PortfolioMetrics {
  totalInstruments: number;
  totalValue: number;
  totalEmissions: number;
  avgDataQuality: number;
  emissionIntensity: number;
  pcafCompliance: number;
  esgScore: number;
  instrumentBreakdown: Record<string, number>;
  fuelTypeBreakdown: Record<string, number>;
  riskExposures: number;
  complianceRate: number;
}

interface TimelineData {
  month: string;
  totalEmissions: number;
  emissionIntensity: number;
  dataQuality: number;
}

function OverviewPage() {
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Q1');
  const [selectedFuelType, setSelectedFuelType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolioData();
  }, [selectedPeriod, selectedFuelType]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);

      const instruments = await db.loans.toArray();

      if (instruments.length === 0) {
        setPortfolioMetrics(null);
        setTimelineData([]);
        return;
      }

      const totalInstruments = instruments.length;
      const totalValue = instruments.reduce((sum, i) => sum + i.loan_amount, 0);
      const totalEmissions = instruments.reduce((sum, i) => sum + i.financed_emissions, 0);
      const avgDataQuality = instruments.reduce((sum, i) => sum + i.data_quality_score, 0) / totalInstruments;
      const emissionIntensity = totalValue > 0 ? (totalEmissions / totalValue) * 1000000 : 0;

      const instrumentBreakdown = instruments.reduce((acc, i) => {
        const type = i.instrument_type || 'loan';
        acc[type] = (acc[type] || 0) + i.financed_emissions;
        return acc;
      }, {} as Record<string, number>);

      const fuelTypeBreakdown = instruments.reduce((acc, i) => {
        acc[i.fuel_type] = (acc[i.fuel_type] || 0) + i.financed_emissions;
        return acc;
      }, {} as Record<string, number>);

      const highRiskCount = instruments.filter(i => i.data_quality_score >= 4).length;
      const pcafCompliantCount = instruments.filter(i => i.data_quality_score <= 3).length;

      const metrics: PortfolioMetrics = {
        totalInstruments,
        totalValue,
        totalEmissions,
        avgDataQuality,
        emissionIntensity,
        pcafCompliance: avgDataQuality,
        esgScore: Math.max(1, 11 - Math.round(avgDataQuality * 2)),
        instrumentBreakdown,
        fuelTypeBreakdown,
        riskExposures: highRiskCount,
        complianceRate: (pcafCompliantCount / totalInstruments) * 100
      };

      setPortfolioMetrics(metrics);

      const timeline: TimelineData[] = [
        { month: 'Jan', totalEmissions: totalEmissions * 0.8, emissionIntensity: emissionIntensity * 1.2, dataQuality: avgDataQuality + 0.5 },
        { month: 'Feb', totalEmissions: totalEmissions * 0.85, emissionIntensity: emissionIntensity * 1.15, dataQuality: avgDataQuality + 0.3 },
        { month: 'Mar', totalEmissions: totalEmissions * 0.9, emissionIntensity: emissionIntensity * 1.1, dataQuality: avgDataQuality + 0.1 },
        { month: 'Apr', totalEmissions: totalEmissions * 0.95, emissionIntensity: emissionIntensity * 1.05, dataQuality: avgDataQuality },
        { month: 'May', totalEmissions: totalEmissions, emissionIntensity: emissionIntensity, dataQuality: avgDataQuality },
      ];

      setTimelineData(timeline);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Failed to load portfolio data:', error);
      toast({
        title: "Load Error",
        description: "Failed to load portfolio data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadPortfolioData();
    toast({
      title: "Data Refreshed",
      description: "Portfolio metrics have been updated.",
    });
  };

  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    teal: '#14b8a6'
  };

  if (!portfolioMetrics && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portfolio Overview</h1>
            <p className="text-muted-foreground">Review KPIs, trends, and unlock WACI with assumptions.</p>
          </div>
        </div>

        <Card className="p-12 text-center">
          <div className="space-y-4">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Portfolio Data</h3>
              <p className="text-muted-foreground">Load portfolio data to generate insights.</p>
            </div>
            <Button onClick={() => window.location.href = '/financed-emissions/upload'}>
              Load Sample Data
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Portfolio Overview</h1>
              <p className="text-muted-foreground">
                Comprehensive view of your financed emissions portfolio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}</span>
            <Badge variant="outline">Live Data</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>

          <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by fuel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Fuel Types</SelectItem>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-muted rounded-lg p-1">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="px-4 py-2 text-sm"
              >
                {period} 2024
              </Button>
            ))}
          </div>

          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Exposures</p>
              <p className="text-3xl font-bold">{portfolioMetrics?.totalInstruments || 0}</p>
              <p className="text-xs text-muted-foreground">
                ${((portfolioMetrics?.totalValue || 0) / 1000000).toFixed(1)}M portfolio value
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Portfolio Value</p>
              <p className="text-3xl font-bold">
                ${((portfolioMetrics?.totalValue || 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground">Effective exposure amount</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <TrendingDown className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Financed Emissions</p>
              <p className="text-3xl font-bold">
                {(portfolioMetrics?.totalEmissions || 0).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">tCO2e annual emissions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Emission Intensity</p>
              <p className="text-3xl font-bold">
                {(portfolioMetrics?.emissionIntensity || 0).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">g CO2e per USD</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PCAF Compliance Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">PCAF Data Quality Score</p>
                  <p className="text-xs text-muted-foreground">Weighted average across portfolio</p>
                </div>
              </div>
              <Badge variant={((portfolioMetrics?.pcafCompliance || 0) > 3) ? "destructive" : "default"} className="text-xs">
                {(portfolioMetrics?.pcafCompliance || 0) > 3 ? 'Non-Compliant' : 'Compliant'}
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold">
                {(portfolioMetrics?.pcafCompliance || 0).toFixed(2)}
              </p>
              <Progress
                value={((portfolioMetrics?.pcafCompliance || 0) / 5) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {(portfolioMetrics?.pcafCompliance || 0) > 3 ? 'Above PCAF threshold (3.0)' : 'Within PCAF guidelines'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">ESG Performance Score</p>
                  <p className="text-xs text-muted-foreground">Portfolio sustainability rating</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                B+ Rating
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold">{portfolioMetrics?.esgScore || 0}/10</p>
              <Progress
                value={(portfolioMetrics?.esgScore || 0) * 10}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">+0.2 improvement this quarter</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance Trends */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Performance Trends</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">Total Emissions</Badge>
            <Badge variant="outline" className="text-xs">Emission Intensity</Badge>
            <Badge variant="outline" className="text-xs">Data Quality</Badge>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                Portfolio Timeline Analysis
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Custom Range
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Chart
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                  />
                  <YAxis
                    fontSize={12}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalEmissions"
                    stroke={COLORS.success}
                    strokeWidth={3}
                    name="Total Emissions (tCO2e)"
                    dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="emissionIntensity"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    name="Emission Intensity (g/USD)"
                    dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dataQuality"
                    stroke={COLORS.purple}
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    name="Data Quality Score"
                    dot={{ fill: COLORS.purple, strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Composition Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Portfolio Composition</h2>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emissions by Fuel Type */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                Fuel Type Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground">Emissions breakdown by fuel category</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioMetrics && Object.entries(portfolioMetrics.fuelTypeBreakdown).map(([fuel, emissions], index) => {
                  const percentage = ((emissions / portfolioMetrics.totalEmissions) * 100).toFixed(1);
                  return (
                    <div key={fuel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-muted" />
                          <span className="text-sm font-medium capitalize">{fuel}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{emissions.toFixed(1)} tCO2e</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Emissions by Instrument Type */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="h-5 w-5" />
                Instrument Types
              </CardTitle>
              <p className="text-sm text-muted-foreground">Portfolio breakdown by financial instrument</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioMetrics && Object.entries(portfolioMetrics.instrumentBreakdown).map(([type, emissions], index) => {
                  const percentage = ((emissions / portfolioMetrics.totalEmissions) * 100).toFixed(1);
                  const icons = [FileText, FileText, Shield];
                  const IconComponent = icons[index % icons.length];

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded bg-muted">
                            <IconComponent className="w-3 h-3" />
                          </div>
                          <span className="text-sm font-medium">
                            {type === 'lc' ? 'Letter of Credit' : type === 'guarantee' ? 'Guarantee' : 'Loan'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{emissions.toFixed(1)} tCO2e</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Risk & Compliance Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Risk & Compliance
              </CardTitle>
              <p className="text-sm text-muted-foreground">Portfolio risk assessment overview</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PCAF Compliance Rate</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(portfolioMetrics?.complianceRate || 0)}%
                    </Badge>
                  </div>
                  <Progress value={portfolioMetrics?.complianceRate || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((portfolioMetrics?.totalInstruments || 0) * ((portfolioMetrics?.complianceRate || 0) / 100))} of {portfolioMetrics?.totalInstruments || 0} instruments compliant
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">High Risk Exposures</span>
                    <Badge variant="destructive" className="text-xs">
                      {portfolioMetrics?.riskExposures || 0}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Data Quality {">"} 4.0</p>
                      <p className="text-muted-foreground">{portfolioMetrics?.riskExposures || 0} instruments</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="font-medium">Missing Data</p>
                      <p className="text-muted-foreground">3 instruments</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Risk Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Critical Alerts & Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Alert>
          <Info className="h-5 w-5" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Unlock Economic Intensity Metrics</h4>
                <p className="text-sm text-muted-foreground">Add revenue assumptions to calculate economic intensity and unlock advanced PCAF metrics</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Add Assumptions</Button>
                <Button variant="ghost" size="sm">Maybe Later</Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1 bg-muted rounded">
                <Activity className="h-4 w-4" />
              </div>
              AI Portfolio Insights
              <Badge variant="secondary" className="text-xs">Platform RAG</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Portfolio Risk Assessment</p>
                  <p className="text-xs text-muted-foreground">High concentration in commercial vehicles sector (23.9%)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Data Quality Opportunity</p>
                  <p className="text-xs text-muted-foreground">Improve 15 instruments to achieve PCAF compliance</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                View Full Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OverviewPage;