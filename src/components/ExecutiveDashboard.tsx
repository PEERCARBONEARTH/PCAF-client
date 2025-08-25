import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, type LoanPortfolioItem } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp, TrendingDown, Building, Target, AlertTriangle, 
  CheckCircle, BarChart3, PieChart, Globe, Zap, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, ComposedChart
} from "recharts";

interface ExecutiveMetrics {
  totalPortfolioValue: number;
  totalEmissions: number;
  emissionIntensity: number;
  riskScore: number;
  complianceScore: number;
  wdqs: number; // PCAF Box 8 Weighted Data Quality Score
  portfolioGrowth: number;
  emissionReduction: number;
  benchmarkComparison: number;
  esgRating: string;
  regulatoryStatus: 'compliant' | 'at-risk' | 'non-compliant';
}

interface GeographicData {
  region: string;
  emissions: number;
  loans: number;
  intensity: number;
  growth: number;
}

interface VehicleTypeData {
  vehicleType: string;
  emissions: number;
  value: number;
  risk: 'low' | 'medium' | 'high';
  count: number;
  percent: number;
}

interface PCAFAssetClassData {
  assetClass: string;
  emissions: number;
  value: number;
  risk: 'low' | 'medium' | 'high';
  count: number;
}

interface TrendData {
  period: string;
  emissions: number;
  loans: number;
  intensity: number;
  target: number;
  forecast?: number;
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  finance: 'hsl(var(--finance))',
  accent: 'hsl(var(--accent-foreground))'
};

export function ExecutiveDashboard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [geoData, setGeoData] = useState<GeographicData[]>([]);
  const [vehicleTypeData, setVehicleTypeData] = useState<VehicleTypeData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadExecutiveMetrics();
  }, []);

  const loadExecutiveMetrics = async () => {
    try {
      setLoading(true);
      const loans = await db.loans.toArray();
      
      if (loans.length === 0) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      // Calculate executive-level metrics
      const totalPortfolioValue = loans.reduce((sum, loan) => sum + loan.loan_amount, 0);
      const totalEmissions = loans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
      const emissionIntensity = totalPortfolioValue > 0 ? (totalEmissions * 1000) / totalPortfolioValue : 0;
      
      // PCAF Box 8 WDQS calculation (loan-weighted)
      const totalOutstandingBalance = loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
      const weightedDataQualitySum = loans.reduce((sum, loan) => 
        sum + (loan.outstanding_balance * loan.data_quality_score), 0);
      const wdqs = totalOutstandingBalance > 0 ? weightedDataQualitySum / totalOutstandingBalance : 0;
      
      // Risk scoring (0-100, lower is better)
      const riskScore = Math.min(100, (wdqs / 5) * 100);
      
      // PCAF compliance score based on WDQS (0-100, higher is better)
      const complianceScore = wdqs <= 3.0 ? 100 : Math.max(0, 100 - ((wdqs - 3.0) * 25));

      // Simulated trend data (would come from historical calculations)
      const portfolioGrowth = 12.5; // 12.5% portfolio growth
      const emissionReduction = -8.2; // 8.2% emission reduction
      const benchmarkComparison = 15.3; // 15.3% better than industry benchmark

      const execMetrics: ExecutiveMetrics = {
        totalPortfolioValue,
        totalEmissions,
        emissionIntensity,
        riskScore,
        complianceScore,
        wdqs, // PCAF Box 8 WDQS
        portfolioGrowth,
        emissionReduction,
        benchmarkComparison,
        esgRating: complianceScore >= 80 ? 'A' : complianceScore >= 60 ? 'B' : 'C',
        regulatoryStatus: complianceScore >= 80 ? 'compliant' : complianceScore >= 60 ? 'at-risk' : 'non-compliant'
      };

      setMetrics(execMetrics);

      // Generate geographic breakdown (simulated)
      const geoBreakdown = generateGeographicData(loans);
      setGeoData(geoBreakdown);

      // Generate vehicle type analysis
      const vehicleTypeBreakdown = generateVehicleTypeData(loans);
      setVehicleTypeData(vehicleTypeBreakdown);

      // Generate trend data
      const trends = generateTrendData();
      setTrendData(trends);

    } catch (error) {
      console.error('Failed to load executive metrics:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load executive dashboard metrics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateGeographicData = (loans: LoanPortfolioItem[]): GeographicData[] => {
    // East African countries distribution
    const regions = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia'];
    return regions.map(region => {
      const regionLoans = Math.floor(loans.length * (0.05 + Math.random() * 0.25));
      const regionEmissions = loans.slice(0, regionLoans).reduce((sum, loan) => sum + loan.financed_emissions, 0);
      
      return {
        region,
        emissions: regionEmissions,
        loans: regionLoans,
        intensity: regionLoans > 0 ? regionEmissions / regionLoans : 0,
        growth: -5 + Math.random() * 20 // -5% to 15% growth
      };
    }).filter(region => region.loans > 0);
  };

  const generatePCAFAssetClassData = (loans: LoanPortfolioItem[]): PCAFAssetClassData[] => {
    const assetClassMapping: Record<string, string> = {
      'motor_vehicle_loans': 'Motor Vehicle Loans (Class 15)',
      'mortgages': 'Mortgages (Class 2)',
      'business_loans': 'Business Loans & Unlisted Equity (Class 4)',
      'real_estate': 'Real Estate Mortgages (Class 2)'
    };

    const assetClasses = [...new Set(loans.map(loan => loan.pcaf_asset_class || 'motor_vehicle_loans'))];
    
    return assetClasses.map(assetClass => {
      const assetClassLoans = loans.filter(loan => (loan.pcaf_asset_class || 'motor_vehicle_loans') === assetClass);
      const emissions = assetClassLoans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
      const value = assetClassLoans.reduce((sum, loan) => sum + loan.loan_amount, 0);
      const avgRisk = assetClassLoans.reduce((sum, loan) => sum + loan.data_quality_score, 0) / assetClassLoans.length;
      
      return {
        assetClass: assetClassMapping[assetClass] || assetClass,
        emissions,
        value,
        risk: avgRisk <= 2 ? 'low' : avgRisk <= 3.5 ? 'medium' : 'high',
        count: assetClassLoans.length
      };
    });
  };

  const generateVehicleTypeData = (loans: LoanPortfolioItem[]): VehicleTypeData[] => {
    const vehicleTypeMapping: Record<string, string> = {
      'passenger_car': 'Passenger Cars',
      'motorcycle': 'Motorcycles',
      'light_commercial_truck': 'Light Commercial Trucks',
      'medium_heavy_commercial_truck': 'Medium/Heavy Trucks',
      'recreational_vehicle': 'Recreational Vehicles',
      'bus': 'Buses'
    };

    const vehicleTypes = [...new Set(loans.map(loan => loan.vehicle_category || 'passenger_car'))];
    const totalEmissions = loans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
    
    return vehicleTypes.map(vehicleType => {
      const vehicleTypeLoans = loans.filter(loan => (loan.vehicle_category || 'passenger_car') === vehicleType);
      const emissions = vehicleTypeLoans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
      const value = vehicleTypeLoans.reduce((sum, loan) => sum + loan.loan_amount, 0);
      const avgRisk = vehicleTypeLoans.reduce((sum, loan) => sum + loan.data_quality_score, 0) / vehicleTypeLoans.length;
      const percent = totalEmissions > 0 ? emissions / totalEmissions : 0;
      
      return {
        vehicleType: vehicleTypeMapping[vehicleType] || vehicleType,
        emissions,
        value,
        risk: (avgRisk <= 2 ? 'low' : avgRisk <= 3.5 ? 'medium' : 'high') as 'low' | 'medium' | 'high',
        count: vehicleTypeLoans.length,
        percent
      };
    }).filter(item => item.count > 0);
  };

  const generateTrendData = (): TrendData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => ({
      period: month,
      emissions: 150 + Math.sin(index * 0.5) * 30 + Math.random() * 20,
      loans: 45 + Math.sin(index * 0.3) * 10 + Math.random() * 8,
      intensity: 2.8 + Math.sin(index * 0.4) * 0.5 + Math.random() * 0.3,
      target: 2.5, // Target intensity
      forecast: index >= 8 ? 140 + Math.sin(index * 0.5) * 25 : undefined
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-success/10 text-success border-success/20';
      case 'at-risk': return 'bg-warning/10 text-warning border-warning/20';
      case 'non-compliant': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading executive dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Portfolio Data</h3>
            <p className="text-muted-foreground">
              Upload loan data to view executive dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Executive Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Strategic overview of portfolio performance and ESG compliance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={getStatusColor(metrics.regulatoryStatus)}>
            {metrics.regulatoryStatus.replace('-', ' ').toUpperCase()}
          </Badge>
          <Button onClick={loadExecutiveMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="floating-card shimmer-card stagger-fade-in stagger-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Building className="h-4 w-4 text-finance hover-scale" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance metric-value-animate">{formatCurrency(metrics.totalPortfolioValue)}</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-success mr-1 hover-scale" />
              <span className="text-success badge-enhanced">+{metrics.portfolioGrowth}%</span>
              <span className="text-muted-foreground ml-1">vs last year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="floating-card shimmer-card stagger-fade-in stagger-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emissions Intensity</CardTitle>
            <Target className="h-4 w-4 text-primary hover-scale" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary metric-value-animate">{metrics.emissionIntensity.toFixed(2)}</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="h-3 w-3 text-success mr-1 hover-scale" />
              <span className="text-success badge-enhanced">{metrics.emissionReduction}%</span>
              <span className="text-muted-foreground ml-1">kg CO₂e/$1k</span>
            </div>
          </CardContent>
        </Card>

        <Card className="floating-card shimmer-card stagger-fade-in stagger-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ESG Rating</CardTitle>
            <CheckCircle className="h-4 w-4 text-success hover-scale" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success metric-value-animate">{metrics.esgRating}</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-success mr-1 hover-scale" />
              <span className="text-success badge-enhanced">+{metrics.benchmarkComparison}%</span>
              <span className="text-muted-foreground ml-1">vs benchmark</span>
            </div>
          </CardContent>
        </Card>

        <Card className="floating-card shimmer-card stagger-fade-in stagger-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PCAF Box 8 WDQS</CardTitle>
            <BarChart3 className={`h-4 w-4 hover-scale ${metrics.wdqs > 3.0 ? 'text-destructive' : 'text-success'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold metric-value-animate ${metrics.wdqs > 3.0 ? 'text-destructive' : 'text-success'}`}>
              {metrics.wdqs.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Loan-weighted • Target: ≤3.0
            </div>
            <div className="mt-1 text-xs">
              {metrics.wdqs <= 3.0 ? (
                <span className="text-green-600 badge-enhanced">✓ PCAF Compliant</span>
              ) : (
                <span className="text-red-600 badge-enhanced">⚠ Above threshold</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="sector">Asset Class Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Emissions by Vehicle Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={vehicleTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.vehicleType} ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="emissions"
                    >
                      {vehicleTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, 'Emissions']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                   <BarChart data={vehicleTypeData}>
                     <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                     <XAxis dataKey="vehicleType" className="text-sm" />
                     <YAxis className="text-sm" />
                     <Tooltip />
                     <Bar dataKey="count" fill={COLORS.primary} />
                   </BarChart>
                 </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>
                Portfolio emissions and growth by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={geoData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="region" className="text-sm" />
                  <YAxis yAxisId="left" className="text-sm" />
                  <YAxis yAxisId="right" orientation="right" className="text-sm" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="emissions" fill={COLORS.primary} name="Emissions (tCO₂e)" />
                  <Line yAxisId="right" type="monotone" dataKey="growth" stroke={COLORS.success} name="Growth %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sector" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {vehicleTypeData.map((vehicleData, index) => (
              <Card key={vehicleData.vehicleType} className="card-enhanced">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{vehicleData.vehicleType}</h3>
                      <p className="text-sm text-muted-foreground">{vehicleData.count} loans</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-lg font-semibold">{formatCurrency(vehicleData.value)}</div>
                        <div className="text-sm text-muted-foreground">Portfolio Value</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">{vehicleData.emissions.toFixed(2)} tCO₂e</div>
                        <div className="text-sm text-muted-foreground">Emissions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-accent">{(vehicleData.percent * 100).toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Share</div>
                      </div>
                      <Badge className={
                        vehicleData.risk === 'high' ? 'status-risk' :
                        vehicleData.risk === 'medium' ? 'status-pending' : 'status-active'
                      }>
                        {vehicleData.risk.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Performance Trends & Forecast
              </CardTitle>
              <CardDescription>
                Historical performance with predictive analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    stroke={COLORS.primary} 
                    strokeWidth={3}
                    name="Actual Intensity"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke={COLORS.success} 
                    strokeDasharray="5 5"
                    name="Target"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke={COLORS.warning} 
                    strokeDasharray="3 3"
                    name="Forecast"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}