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
    </div>
  );
}

export default OverviewPage;