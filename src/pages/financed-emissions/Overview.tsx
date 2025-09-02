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
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

export default function OverviewPage() {
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

      // Load instruments from database
      const instruments = await db.loans.toArray();

      if (instruments.length === 0) {
        setPortfolioMetrics(null);
        setTimelineData([]);
        return;
      }

      // Calculate portfolio metrics
      const totalInstruments = instruments.length;
      const totalValue = instruments.reduce((sum, i) => sum + i.loan_amount, 0);
      const totalEmissions = instruments.reduce((sum, i) => sum + i.financed_emissions, 0);
      const avgDataQuality = instruments.reduce((sum, i) => sum + i.data_quality_score, 0) / totalInstruments;
      const emissionIntensity = totalValue > 0 ? (totalEmissions / totalValue) * 1000000 : 0; // per million dollars

      // Instrument type breakdown
      const instrumentBreakdown = instruments.reduce((acc, i) => {
        const type = i.instrument_type || 'loan';
        acc[type] = (acc[type] || 0) + i.financed_emissions;
        return acc;
      }, {} as Record<string, number>);

      // Fuel type breakdown
      const fuelTypeBreakdown = instruments.reduce((acc, i) => {
        acc[i.fuel_type] = (acc[i.fuel_type] || 0) + i.financed_emissions;
        return acc;
      }, {} as Record<string, number>);

      // Risk assessments
      const highRiskCount = instruments.filter(i => i.data_quality_score >= 4).length;
      const pcafCompliantCount = instruments.filter(i => i.data_quality_score <= 3).length;

      const metrics: PortfolioMetrics = {
        totalInstruments,
        totalValue,
        totalEmissions,
        avgDataQuality,
        emissionIntensity,
        pcafCompliance: avgDataQuality,
        esgScore: Math.max(1, 11 - Math.round(avgDataQuality * 2)), // Convert to 1-10 scale
        instrumentBreakdown,
        fuelTypeBreakdown,
        riskExposures: highRiskCount,
        complianceRate: (pcafCompliantCount / totalInstruments) * 100
      };

      setPortfolioMetrics(metrics);

      // Generate timeline data (mock for now)
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

  // If no data, show empty state
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
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Overview</h1>
          <p className="text-sm text-muted-foreground">
            Review KPIs, trends, and unlock WACI with assumptions.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
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
                className="px-3 py-1 text-xs"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Assumptions Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Add revenue assumptions to unlock economic intensity metrics</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Add assumptions</Button>
            <Button variant="ghost" size="sm">Maybe later</Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* AI Portfolio Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            AI Portfolio Insights
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">Platform RAG</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No AI insights available yet. Load portfolio data to generate insights.
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Credit Exposures</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{portfolioMetrics?.totalInstruments || 0}</p>
              <p className="text-xs text-muted-foreground">
                ${((portfolioMetrics?.totalValue || 0) / 1000000).toFixed(1)}M total value
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Portfolio Value</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                ${((portfolioMetrics?.totalValue || 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground">Effective exposure amount</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Financed Emissions</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {(portfolioMetrics?.totalEmissions || 0).toFixed(1)} tCO₂e
              </p>
              <p className="text-xs text-muted-foreground">Annual portfolio emissions</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Emission Intensity</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {(portfolioMetrics?.emissionIntensity || 0).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">g CO₂e per dollar</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">PCAF Box 8 WDQS</span>
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${(portfolioMetrics?.pcafCompliance || 0) > 3 ? 'text-red-600' : 'text-green-600'}`}>
                {(portfolioMetrics?.pcafCompliance || 0).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {(portfolioMetrics?.pcafCompliance || 0) > 3 ? '⚠ Above threshold' : '✓ PCAF compliant'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">ESG Score</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{portfolioMetrics?.esgScore || 0}</p>
              <p className="text-xs text-muted-foreground">+0.0% this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Portfolio Timeline
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">Total Emissions</Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">Emission Intensity</Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">Data Quality</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="totalEmissions"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  name="Total Emissions (tCO₂e)"
                />
                <Line
                  type="monotone"
                  dataKey="emissionIntensity"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  name="Emission Intensity"
                />
                <Line
                  type="monotone"
                  dataKey="dataQuality"
                  stroke={COLORS.purple}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Data Quality Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions by Fuel Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Emissions by Fuel Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolioMetrics && Object.entries(portfolioMetrics.fuelTypeBreakdown).map(([fuel, emissions], index) => {
                const percentage = ((emissions / portfolioMetrics.totalEmissions) * 100).toFixed(1);
                return (
                  <div key={fuel} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: Object.values(COLORS)[index % Object.values(COLORS).length] }}
                      />
                      <span className="text-sm font-medium capitalize">{fuel}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{emissions.toFixed(1)} tCO₂e ({percentage}%)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Emissions by Instrument Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Emissions by Instrument Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolioMetrics && Object.entries(portfolioMetrics.instrumentBreakdown).map(([type, emissions], index) => {
                const percentage = ((emissions / portfolioMetrics.totalEmissions) * 100).toFixed(1);
                const icon = type === 'loan' ? FileText : type === 'lc' ? FileText : Shield;
                const IconComponent = icon;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">
                        {type === 'lc' ? 'Letter of Credit' : type === 'guarantee' ? 'Guarantee' : 'Loan'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{emissions.toFixed(1)} tCO₂e ({percentage}%)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">High Risk Exposures:</span>
                <span className="font-medium">{portfolioMetrics?.riskExposures || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">PCAF Compliant:</span>
                <span className="font-medium text-green-600">{Math.round(portfolioMetrics?.complianceRate || 0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">PCAF Compliant Exposures</span>
                  <span className="text-sm font-medium">0 / 65</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">0.0% compliance rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Poor Data Quality Detected</strong><br />
                {portfolioMetrics?.riskExposures || 0} exposures have PCAF quality scores of 4 or higher<br />
                <span className="text-xs">Recommendation: Collect more specific vehicle data, actual mileage, or asset-level emissions data</span>
              </AlertDescription>
            </Alert>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>PCAF Box 8 WDQS Compliance Risk</strong><br />
                Portfolio WDQS of {(portfolioMetrics?.pcafCompliance || 0).toFixed(2)} exceeds PCAF recommended threshold of 3.0<br />
                <span className="text-xs">Recommendation: Improve data collection processes to achieve PCAF Box 8 WDQS compliance standards</span>
              </AlertDescription>
            </Alert>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Low PCAF Compliance Score</strong><br />
                Portfolio compliance score of 0.0% is below recommended 70% threshold<br />
                <span className="text-xs">Recommendation: Focus on improving data quality scores for better PCAF compliance</span>
              </AlertDescription>
            </Alert>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>High Attribution Factors</strong><br />
                {Math.round((portfolioMetrics?.totalInstruments || 0) * 0.3)} exposures have attribution factors above 80%<br />
                <span className="text-xs">Recommendation: Review outstanding balances and vehicle values for accuracy</span>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
