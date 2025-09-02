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

      {/* Instrument Analytics Section */}
      <div className="space-y-6">
        {/* Section Header with Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex bg-muted rounded-lg p-1">
            <Button variant="ghost" size="sm" className="px-4 py-2 text-sm">Portfolio Overview</Button>
            <Button variant="default" size="sm" className="px-4 py-2 text-sm">Instrument Analytics</Button>
            <Button variant="ghost" size="sm" className="px-4 py-2 text-sm">Advanced Analytics</Button>
            <Button variant="ghost" size="sm" className="px-4 py-2 text-sm">PCAF Metrics</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Instrument Analytics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm text-green-700">Total Instruments</p>
                <p className="text-3xl font-bold text-green-900">{portfolioMetrics?.totalInstruments || 0}</p>
                <p className="text-xs text-green-600">Active instrument types</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm text-orange-700">Max Concentration</p>
                <p className="text-3xl font-bold text-orange-900">32.7%</p>
                <p className="text-xs text-orange-600">Highest instrument exposure</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm text-blue-700">Sector Diversity</p>
                <p className="text-3xl font-bold text-blue-900">5</p>
                <p className="text-xs text-blue-600">Different sectors</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm text-purple-700">Country Exposure</p>
                <p className="text-3xl font-bold text-purple-900">6</p>
                <p className="text-xs text-purple-600">Geographic markets</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instrument Type Analysis Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Instrument Type Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">Detailed breakdown by financial instrument type</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Instrument Type</th>
                    <th className="text-right py-3 px-2 font-medium">Count</th>
                    <th className="text-right py-3 px-2 font-medium">Total Exposure</th>
                    <th className="text-right py-3 px-2 font-medium">Total Emissions</th>
                    <th className="text-center py-3 px-2 font-medium">Avg Data Quality</th>
                    <th className="text-right py-3 px-2 font-medium">Concentration %</th>
                    <th className="text-right py-3 px-2 font-medium">Intensity</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioMetrics && Object.entries(portfolioMetrics.instrumentBreakdown).map(([type, emissions]) => {
                    const count = type === 'loan' ? Math.round(portfolioMetrics.totalInstruments * 0.6) :
                      type === 'lc' ? Math.round(portfolioMetrics.totalInstruments * 0.25) :
                        Math.round(portfolioMetrics.totalInstruments * 0.15);
                    const exposure = (emissions / portfolioMetrics.totalEmissions) * portfolioMetrics.totalValue;
                    const concentration = (emissions / portfolioMetrics.totalEmissions) * 100;
                    const intensity = exposure > 0 ? (emissions / exposure) * 1000000 : 0;

                    return (
                      <tr key={type} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {type === 'loan' && <FileText className="h-4 w-4 text-green-500" />}
                            {type === 'lc' && <FileText className="h-4 w-4 text-blue-500" />}
                            {type === 'guarantee' && <Shield className="h-4 w-4 text-purple-500" />}
                            <span className="font-medium capitalize">
                              {type === 'lc' ? 'Letter of Credit' : type === 'guarantee' ? 'Guarantee' : 'Loan'}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 font-medium">{count}</td>
                        <td className="text-right py-3 px-2">${(exposure / 1000000).toFixed(2)}M</td>
                        <td className="text-right py-3 px-2">{emissions.toFixed(2)} tCO₂e</td>
                        <td className="text-center py-3 px-2">
                          <Badge variant="destructive" className="text-xs">5.0</Badge>
                        </td>
                        <td className="text-right py-3 px-2">{concentration.toFixed(1)}%</td>
                        <td className="text-right py-3 px-2">{intensity.toFixed(1)} g/USD</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emissions by Sector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Emissions by Sector
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { sector: 'Commercial Vehicles', emissions: 63.9, percentage: 23.9, color: 'bg-green-500' },
                  { sector: 'Auto Loans', emissions: 54.1, percentage: 20.2, color: 'bg-blue-500' },
                  { sector: 'Transportation', emissions: 53.0, percentage: 19.8, color: 'bg-purple-500' },
                  { sector: 'Logistics', emissions: 49.3, percentage: 18.4, color: 'bg-orange-500' },
                  { sector: 'Fleet Management', emissions: 47.7, percentage: 17.8, color: 'bg-teal-500' }
                ].map((item, index) => (
                  <div key={item.sector} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.sector}</span>
                      <span className="text-muted-foreground">{item.emissions} tCO₂e ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage * 4}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { country: 'GB', emissions: 72.0, percentage: 26.9, color: 'bg-green-500' },
                  { country: 'CA', emissions: 52.0, percentage: 19.4, color: 'bg-blue-500' },
                  { country: 'MX', emissions: 50.9, percentage: 19.0, color: 'bg-purple-500' },
                  { country: 'FR', emissions: 35.9, percentage: 13.4, color: 'bg-orange-500' },
                  { country: 'DE', emissions: 29.8, percentage: 11.1, color: 'bg-teal-500' }
                ].map((item, index) => (
                  <div key={item.country} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.country}</span>
                      <span className="text-muted-foreground">{item.emissions} tCO₂e ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage * 3}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Concentration Risk Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Concentration Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Loans', value: 60, fill: COLORS.success },
                        { name: 'LCs', value: 25, fill: COLORS.primary },
                        { name: 'Guarantees', value: 15, fill: COLORS.purple }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      dataKey="value"
                    />
                    <Tooltip formatter={(value) => `${value}%`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Data Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { quality: 'Score 1', count: 5 },
                    { quality: 'Score 2', count: 12 },
                    { quality: 'Score 3', count: 25 },
                    { quality: 'Score 4', count: 18 },
                    { quality: 'Score 5', count: 8 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quality" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Emission Intensity Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Emission Intensity Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="emissionIntensity"
                      stroke={COLORS.warning}
                      fill={COLORS.warning}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PCAF Compliance Dashboard */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                PCAF Compliance Dashboard
              </CardTitle>
              <p className="text-slate-300 text-sm mt-1">
                Partnership for Carbon Accounting Financials compliance metrics and analysis
              </p>
            </div>
            <Badge variant="destructive" className="bg-red-600 text-white">
              0.0% Compliant
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Compliance Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">PCAF Compliance Status</span>
                  <span className="text-sm text-slate-400">0 of 65 exposures meet PCAF quality standards</span>
                </div>
                <Progress value={0} className="h-3 bg-slate-700" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">Compliance Progress</span>
                  <span className="text-sm text-slate-400">0.0%</span>
                </div>
                <Progress value={0} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400 mt-1">Target: 70% of exposures with quality score ≤ 3</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-300">Data Quality Distribution</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Score 5</span>
                    <span className="text-white font-medium">65</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-300">PCAF Option Distribution</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Option 1b</span>
                    <span className="text-white font-medium">65</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-slate-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Economic and Physical Intensity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Economic Intensity</p>
                  <p className="text-3xl font-bold text-green-400">31.01</p>
                  <p className="text-xs text-slate-400">g CO₂e per USD of exposure</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Physical Intensity</p>
                  <p className="text-3xl font-bold text-green-400">4.12</p>
                  <p className="text-xs text-slate-400">tCO₂e per exposure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Emission Factor Validation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Emission Factor Validation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Portfolio-wide analysis of emission factor coverage and data quality
              </p>
              <p className="text-xs text-muted-foreground">
                Updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              Poor Quality
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Portfolio Factor Quality */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-orange-700 font-medium">Portfolio Factor Quality</p>
                  <p className="text-sm text-orange-600">Aggregate data quality across all emission factors</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-orange-900">4.4 / 5.0</p>
                    <p className="text-xs text-red-600 font-medium">Poor data quality - Immediate attention required</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-blue-700 font-medium">Coverage Analysis</p>
                  <p className="text-sm text-blue-600">Emission factor availability by asset type</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-900">78%</p>
                    <p className="text-xs text-blue-600">Asset types with specific factors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-purple-700 font-medium">Regional Specificity</p>
                  <p className="text-sm text-purple-600">Geographic emission factor coverage</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-purple-900">45%</p>
                    <p className="text-xs text-purple-600">Assets with regional factors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Factor Quality Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Emission Factor Quality by Asset Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { asset: 'Passenger Car - Gasoline', quality: 2.1, status: 'good', count: 45 },
                    { asset: 'Light Truck - Diesel', quality: 3.2, status: 'fair', count: 12 },
                    { asset: 'Heavy Truck - Diesel', quality: 5.0, status: 'poor', count: 4 },
                    { asset: 'Sedan - Electric', quality: 5.0, status: 'missing', count: 3 },
                    { asset: 'SUV - Hybrid', quality: 2.8, status: 'good', count: 8 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.asset}</p>
                        <p className="text-xs text-muted-foreground">{item.count} assets affected</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{item.quality.toFixed(1)}</span>
                        <Badge
                          variant={item.status === 'good' ? 'default' :
                            item.status === 'fair' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {item.status === 'missing' ? 'Missing' :
                            item.status === 'poor' ? 'Poor' :
                              item.status === 'fair' ? 'Fair' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Regional Factor Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { region: 'North America', coverage: 85, assets: 42, color: 'bg-green-500' },
                    { region: 'Europe', coverage: 72, assets: 18, color: 'bg-blue-500' },
                    { region: 'Asia Pacific', coverage: 45, assets: 5, color: 'bg-orange-500' },
                    { region: 'Global Average', coverage: 100, assets: 65, color: 'bg-gray-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.region}</span>
                        <span className="text-muted-foreground">{item.coverage}% ({item.assets} assets)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.coverage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Alerts - Enhanced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Portfolio Alerts
          </CardTitle>
          <p className="text-sm text-muted-foreground">Data Quality Warnings</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Critical Alert */}
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-red-900">Portfolio has significant data quality issues with emission factors</p>
                  <div className="space-y-1 text-sm text-red-800">
                    <p>• Overall portfolio factor quality: 4.4/5.0 (Poor)</p>
                    <p>• 22% of asset types lack regional-specific factors</p>
                    <p>• Critical gaps in heavy vehicle emission factors</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-red-700 border-red-300">
                      Review Factor Library
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-700 border-red-300">
                      Update Regional Data
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Specific Warnings */}
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-orange-900">Using global emission factor - regional data would improve accuracy</p>
                  <p className="text-sm text-orange-800">Affects 12 asset types in your portfolio</p>
                  <div className="text-xs text-orange-700 mt-2">
                    <p>Assets using global factors: Light Commercial Trucks, Medium Trucks, Buses, Motorcycles</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-red-900">No emission factors found for heavy_truck diesel</p>
                  <p className="text-sm text-red-800">Affects 4 asset types - using fallback global average</p>
                  <div className="text-xs text-red-700 mt-2">
                    <p>Missing factors for: Heavy Duty Trucks (Class 8), Construction Equipment, Mining Vehicles</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-red-900">No emission factors found for Sedan</p>
                  <p className="text-sm text-red-800">Affects 3 asset types - manual factor assignment required</p>
                  <div className="text-xs text-red-700 mt-2">
                    <p>Missing specific factors for: Electric Sedans, Luxury Sedans, Compact Sedans</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* PCAF Compliance Alerts */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
