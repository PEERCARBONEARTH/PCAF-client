import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Target, Zap, BarChart3, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { masterSchoolProjects, regionalData, portfolioMetrics } from '@/lib/masterData';

// Generate consistent time series data based on master data
const generateTimeSeriesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseMonthlyCredits = portfolioMetrics.totalCarbonCredits / 12;
  
  return months.map((month, index) => {
    const growthFactor = (index + 1) / 12; // Projects come online gradually
    const seasonalVariation = 0.9 + (Math.sin(index * Math.PI / 6) * 0.2); // ±20% seasonal variation
    
    return {
      month,
      actual: Math.round(baseMonthlyCredits * growthFactor * seasonalVariation * 100) / 100,
      target: Math.round(baseMonthlyCredits * growthFactor * 100) / 100,
      cumulative: Math.round(baseMonthlyCredits * growthFactor * (index + 1) * 100) / 100
    };
  });
};

const carbonReductionData = generateTimeSeriesData();

// Generate quarterly disbursement data
const disbursementData = [
  { 
    quarter: 'Q1', 
    disbursed: masterSchoolProjects.filter(p => p.timeline.projectStart.startsWith('2023-01') || p.timeline.projectStart.startsWith('2023-02') || p.timeline.projectStart.startsWith('2023-03')).reduce((sum, p) => sum + p.financials.disbursed, 0),
    planned: masterSchoolProjects.filter(p => p.timeline.projectStart.startsWith('2023-01') || p.timeline.projectStart.startsWith('2023-02') || p.timeline.projectStart.startsWith('2023-03')).reduce((sum, p) => sum + p.financials.totalInvestment, 0)
  },
  { 
    quarter: 'Q2', 
    disbursed: masterSchoolProjects.filter(p => p.timeline.projectStart.startsWith('2023-04') || p.timeline.projectStart.startsWith('2023-05') || p.timeline.projectStart.startsWith('2023-06')).reduce((sum, p) => sum + p.financials.disbursed, 0),
    planned: masterSchoolProjects.filter(p => p.timeline.projectStart.startsWith('2023-04') || p.timeline.projectStart.startsWith('2023-05') || p.timeline.projectStart.startsWith('2023-06')).reduce((sum, p) => sum + p.financials.totalInvestment, 0)
  },
  { 
    quarter: 'Q3', 
    disbursed: masterSchoolProjects.filter(p => p.timeline.projectStart.startsWith('2023-07') || p.timeline.projectStart.startsWith('2023-08') || p.timeline.projectStart.startsWith('2023-09')).reduce((sum, p) => sum + p.financials.disbursed, 0),
    planned: masterSchoolProjects.filter(p => p.timeline.projectStart.startsWith('2023-07') || p.timeline.projectStart.startsWith('2023-08') || p.timeline.projectStart.startsWith('2023-09')).reduce((sum, p) => sum + p.financials.totalInvestment, 0)
  },
  { 
    quarter: 'Q4', 
    disbursed: masterSchoolProjects.filter(p => p.timeline.projectStart.startsWith('2023-10') || p.timeline.projectStart.startsWith('2023-11') || p.timeline.projectStart.startsWith('2023-12')).reduce((sum, p) => sum + p.financials.disbursed, 0),
    planned: masterSchoolProjects.filter(p => p.timeline.projectStart.startsWith('2023-10') || p.timeline.projectStart.startsWith('2023-11') || p.timeline.projectStart.startsWith('2023-12')).reduce((sum, p) => sum + p.financials.totalInvestment, 0)
  }
];

// Add efficiency calculation
const disbursementDataWithEfficiency = disbursementData.map(item => ({
  ...item,
  efficiency: item.planned > 0 ? (item.disbursed / item.planned) * 100 : 0
}));

// Generate regional performance data from master data
const regionalPerformanceData = Object.values(regionalData).map(region => ({
  name: region.name,
  schools: region.totalSchools,
  performance: region.avgProgress,
  color: region.color
}));

// Generate impact metrics from master data
const impactMetricsData = [
  { 
    metric: 'CO₂ Credits', 
    value: Math.round(portfolioMetrics.totalCarbonCredits * 100) / 100, 
    unit: 'tCO₂/mo', 
    target: Math.round(portfolioMetrics.totalCarbonCredits * 1.2 * 100) / 100, 
    progress: (portfolioMetrics.totalCarbonCredits / (portfolioMetrics.totalCarbonCredits * 1.2)) * 100 
  },
  { 
    metric: 'Clean Stoves', 
    value: portfolioMetrics.totalProjects, 
    unit: 'units', 
    target: 10, 
    progress: (portfolioMetrics.totalProjects / 10) * 100 
  },
  { 
    metric: 'Beneficiaries', 
    value: portfolioMetrics.totalBeneficiaries, 
    unit: 'people', 
    target: 6000, 
    progress: (portfolioMetrics.totalBeneficiaries / 6000) * 100 
  },
  { 
    metric: 'Fuel Savings', 
    value: Math.round(portfolioMetrics.totalFuelSavings), 
    unit: 'kg/mo', 
    target: Math.round(portfolioMetrics.totalFuelSavings * 1.3), 
    progress: (portfolioMetrics.totalFuelSavings / (portfolioMetrics.totalFuelSavings * 1.3)) * 100 
  }
];

// Generate project status data from master data
const projectStatusData = [
  { name: 'Active', value: masterSchoolProjects.filter(p => p.status === 'active').length, color: '#059669' },
  { name: 'Pending', value: masterSchoolProjects.filter(p => p.status === 'pending').length, color: '#eab308' },
  { name: 'Completed', value: masterSchoolProjects.filter(p => p.status === 'completed').length, color: '#2563eb' },
  { name: 'On Hold', value: masterSchoolProjects.filter(p => p.status === 'on_hold').length, color: '#dc2626' }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            {entry.name.includes('CO₂') && ' tCO₂'}
            {entry.name.includes('disbursed') && ' USD'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface InteractiveChartsProps {
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

export function InteractiveCharts({ timeRange = "12months", onTimeRangeChange }: InteractiveChartsProps) {
  const [activeTab, setActiveTab] = useState("carbon");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Portfolio Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Real-time insights from {portfolioMetrics.totalProjects} school projects across {Object.keys(regionalData).length} countries
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="12months">12 Months</SelectItem>
                  <SelectItem value="24months">24 Months</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chart Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="carbon">Carbon Impact</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="carbon" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carbon Reduction Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  CO₂ Credits Progress
                  <Badge variant="outline" className="bg-success/10 text-success">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {portfolioMetrics.totalCarbonCredits.toFixed(1)} tCO₂/mo
                  </Badge>
                </CardTitle>
                <CardDescription>Monthly carbon credits from active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={carbonReductionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stackId="1"
                      stroke="#059669"
                      fill="#059669"
                      fillOpacity={0.6}
                      name="Actual CO₂ Credits"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#dc2626"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cumulative Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Cumulative Impact</CardTitle>
                <CardDescription>Total verified carbon credits to date</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={carbonReductionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#2563eb"
                      strokeWidth={3}
                      name="Cumulative CO₂ Credits"
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Impact Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Impact Metrics</CardTitle>
              <CardDescription>Progress towards portfolio targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {impactMetricsData.map((metric, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{metric.metric}</h4>
                      <Badge variant="outline" className={metric.progress >= 90 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                        {metric.progress.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {metric.value.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${metric.progress >= 90 ? 'bg-success' : 'bg-warning'}`}
                          style={{ width: `${Math.min(metric.progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Target: {metric.target.toLocaleString()} {metric.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disbursement Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Disbursements</CardTitle>
                <CardDescription>Planned vs actual fund distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={disbursementData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="quarter" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="planned" fill="#94a3b8" name="Planned" />
                    <Bar dataKey="disbursed" fill="#2563eb" name="Disbursed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Disbursement Efficiency</CardTitle>
                <CardDescription>Percentage of planned funds distributed</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={disbursementDataWithEfficiency}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="quarter" className="text-xs" />
                    <YAxis domain={[0, 120]} className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#059669"
                      strokeWidth={3}
                      name="Efficiency %"
                      dot={{ fill: '#059669', strokeWidth: 2, r: 5 }}
                    />
                    <ReferenceLine y={100} stroke="#dc2626" strokeDasharray="5 5" label="Target 100%" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>Average progress by country</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalPerformanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="performance" name="Performance %" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* School Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>School Distribution</CardTitle>
                <CardDescription>Number of schools by region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regionalPerformanceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="schools"
                      label={({ name, schools }) => `${name}: ${schools}`}
                    >
                      {regionalPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Status */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>Current project distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Real-time portfolio metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Portfolio Value</h4>
                        <TrendingUp className="h-4 w-4 text-success" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        ${(portfolioMetrics.totalInvestment / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-success">Total Investment</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Active Projects</h4>
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{portfolioMetrics.totalProjects}</p>
                      <p className="text-xs text-muted-foreground">across {Object.keys(regionalData).length} countries</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Avg Progress</h4>
                        <Badge variant="outline" className="bg-success/10 text-success">Good</Badge>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{portfolioMetrics.avgProgress.toFixed(1)}%</p>
                      <p className="text-xs text-success">Portfolio average</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Data Quality</h4>
                        <Zap className="h-4 w-4 text-warning" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{portfolioMetrics.avgDataQuality.toFixed(1)}</p>
                      <p className="text-xs text-success">PCAF average score</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
