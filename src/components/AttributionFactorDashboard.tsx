import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { db, type LoanPortfolioItem } from "@/lib/db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Percent, AlertTriangle, Info } from "lucide-react";

interface AttributionMetrics {
  averageAttribution: number;
  minAttribution: number;
  maxAttribution: number;
  highRiskLoans: number; // Attribution > 1.0
  totalWeightedEmissions: number;
  attributionDistribution: { range: string; count: number; percentage: number }[];
  trendAnalysis: {
    improving: number;
    stable: number;
    deteriorating: number;
  };
}

export function AttributionFactorDashboard() {
  const [metrics, setMetrics] = useState<AttributionMetrics | null>(null);
  const [loans, setLoans] = useState<LoanPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateAttributionMetrics();
  }, []);

  const calculateAttributionMetrics = async () => {
    try {
      setLoading(true);
      const allLoans = await db.loans.toArray();
      setLoans(allLoans);

      if (allLoans.length === 0) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      // Basic attribution statistics
      const attributionFactors = allLoans.map(loan => loan.attribution_factor);
      const averageAttribution = attributionFactors.reduce((sum, attr) => sum + attr, 0) / attributionFactors.length;
      const minAttribution = Math.min(...attributionFactors);
      const maxAttribution = Math.max(...attributionFactors);
      
      // High-risk loans (attribution > 1.0 indicates over-financing)
      const highRiskLoans = allLoans.filter(loan => loan.attribution_factor > 1.0).length;
      
      // Total emissions weighted by attribution
      const totalWeightedEmissions = allLoans.reduce((sum, loan) => 
        sum + (loan.annual_emissions * loan.attribution_factor), 0
      );

      // Attribution factor distribution
      const ranges = [
        { range: "0.0-0.2", min: 0.0, max: 0.2 },
        { range: "0.2-0.4", min: 0.2, max: 0.4 },
        { range: "0.4-0.6", min: 0.4, max: 0.6 },
        { range: "0.6-0.8", min: 0.6, max: 0.8 },
        { range: "0.8-1.0", min: 0.8, max: 1.0 },
        { range: ">1.0", min: 1.0, max: Infinity }
      ];

      const attributionDistribution = ranges.map(range => {
        const count = allLoans.filter(loan => 
          loan.attribution_factor >= range.min && loan.attribution_factor < range.max
        ).length;
        return {
          range: range.range,
          count,
          percentage: (count / allLoans.length) * 100
        };
      });

      // Simplified trend analysis (would need historical data in real implementation)
      const trendAnalysis = {
        improving: Math.floor(allLoans.length * 0.3), // Mock data
        stable: Math.floor(allLoans.length * 0.5),
        deteriorating: Math.floor(allLoans.length * 0.2)
      };

      setMetrics({
        averageAttribution,
        minAttribution,
        maxAttribution,
        highRiskLoans,
        totalWeightedEmissions,
        attributionDistribution,
        trendAnalysis
      });
    } catch (error) {
      console.error('Error calculating attribution metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttributionRiskColor = (attribution: number) => {
    if (attribution > 1.0) return "text-red-600";
    if (attribution > 0.8) return "text-orange-600";
    if (attribution > 0.6) return "text-yellow-600";
    return "text-green-600";
  };

  const getAttributionRiskLabel = (attribution: number) => {
    if (attribution > 1.0) return "Over-financed";
    if (attribution > 0.8) return "High";
    if (attribution > 0.6) return "Medium";
    return "Low";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Attribution Factor Analysis</CardTitle>
            <CardDescription>Loading attribution metrics...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!metrics || loans.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Attribution Factor Analysis</CardTitle>
            <CardDescription>No loan data available for attribution analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Upload loan portfolio data to view detailed attribution factor analysis and risk assessment.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            Attribution Factor Analysis
          </CardTitle>
          <CardDescription>
            PCAF-compliant attribution factor analysis showing the proportion of asset value financed by each loan
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Attribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.averageAttribution * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Portfolio-weighted average
            </p>
            <Progress value={metrics.averageAttribution * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attribution Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.minAttribution * 100).toFixed(0)}% - {(metrics.maxAttribution * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Min to Max range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-orange-600">{metrics.highRiskLoans}</div>
              {metrics.highRiskLoans > 0 && <AlertTriangle className="h-4 w-4 text-orange-600" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Attribution factor &gt; 100%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weighted Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics.totalWeightedEmissions.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              tCO₂e (attribution-weighted)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attribution Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attribution Factor Distribution</CardTitle>
            <CardDescription>
              Distribution of loans across attribution factor ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.attributionDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} loans`, 'Count']}
                  labelFormatter={(label) => `Attribution Range: ${label}`}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Composition</CardTitle>
            <CardDescription>
              Percentage of loans in each attribution range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.attributionDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="percentage"
                  label={({ range, percentage }) => `${range}: ${percentage.toFixed(1)}%`}
                >
                  {metrics.attributionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* High-Risk Loans Alert */}
      {metrics.highRiskLoans > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>High Risk Alert:</strong> {metrics.highRiskLoans} loans have attribution factors exceeding 100%, 
            indicating the outstanding balance is greater than the asset value. This may indicate over-financing 
            or asset depreciation that should be reviewed for accurate PCAF reporting.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Loans with Attribution Details */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Loans - Attribution Details</CardTitle>
          <CardDescription>
            Latest 10 loans with detailed attribution factor analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loans.slice(0, 10).map((loan) => (
              <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{loan.loan_id}</div>
                  <div className="text-sm text-muted-foreground">
                    ${loan.outstanding_balance.toLocaleString()} / ${loan.vehicle_value.toLocaleString()} 
                    ({loan.vehicle_type} - {loan.fuel_type})
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getAttributionRiskColor(loan.attribution_factor)}`}>
                    {(loan.attribution_factor * 100).toFixed(1)}%
                  </div>
                  <Badge variant={loan.attribution_factor > 1.0 ? "destructive" : "secondary"}>
                    {getAttributionRiskLabel(loan.attribution_factor)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PCAF Methodology Note */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>PCAF Methodology:</strong> Attribution factors represent the proportion of asset emissions 
          that should be attributed to the financing institution. Values above 100% may indicate data quality 
          issues or over-financing situations that require review for accurate Scope 3 Category 15 reporting.
        </AlertDescription>
      </Alert>
    </div>
  );
}