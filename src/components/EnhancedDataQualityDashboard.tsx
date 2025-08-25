import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { db, type LoanPortfolioItem } from '@/lib/db';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Target,
  BarChart3,
  Info,
  Lightbulb,
  MapPin,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DataQualityMetrics {
  averageScore: number;
  distribution: { score: number; count: number; percentage: number }[];
  totalLoans: number;
  improvementOpportunities: string[];
  regionalCoverage: { region: string; coverage: number; quality: number }[];
  verificationStatus: { status: string; count: number; percentage: number }[];
}

export function EnhancedDataQualityDashboard() {
  const [metrics, setMetrics] = useState<DataQualityMetrics | null>(null);
  const [loans, setLoans] = useState<LoanPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataQualityMetrics();
  }, []);

  const loadDataQualityMetrics = async () => {
    try {
      setLoading(true);
      const allLoans = await db.loans.toArray();
      setLoans(allLoans);
      
      if (allLoans.length === 0) {
        setMetrics(null);
        return;
      }

      // Calculate data quality distribution
      const distribution = [1, 2, 3, 4, 5].map(score => {
        const count = allLoans.filter(loan => loan.data_quality_score === score).length;
        return {
          score,
          count,
          percentage: (count / allLoans.length) * 100
        };
      });

      // Calculate average score
      const averageScore = allLoans.reduce((sum, loan) => sum + loan.data_quality_score, 0) / allLoans.length;

      // Generate improvement opportunities
      const improvementOpportunities = generateImprovementSuggestions(allLoans);

      // Calculate regional coverage (mock data for demo)
      const regionalCoverage = [
        { region: 'Kenya', coverage: 85, quality: 2.3 },
        { region: 'Ghana', coverage: 72, quality: 2.8 },
        { region: 'Nigeria', coverage: 68, quality: 3.1 },
        { region: 'Rwanda', coverage: 91, quality: 2.1 }
      ];

      // Calculate verification status distribution
      const verificationCounts = allLoans.reduce((acc, loan) => {
        const status = loan.verification_status || 'unverified';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const verificationStatus = Object.entries(verificationCounts).map(([status, count]) => ({
        status,
        count,
        percentage: (count / allLoans.length) * 100
      }));

      setMetrics({
        averageScore,
        distribution,
        totalLoans: allLoans.length,
        improvementOpportunities,
        regionalCoverage,
        verificationStatus
      });
    } catch (error) {
      console.error('Failed to load data quality metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateImprovementSuggestions = (loans: LoanPortfolioItem[]): string[] => {
    const suggestions = [];
    
    const poorQualityCount = loans.filter(loan => loan.data_quality_score >= 4).length;
    if (poorQualityCount > 0) {
      suggestions.push(`${poorQualityCount} loans have poor data quality (score 4-5). Consider updating vehicle data or verifying emission factors.`);
    }

    const unverifiedCount = loans.filter(loan => !loan.verification_status || loan.verification_status === 'unverified').length;
    if (unverifiedCount > 0) {
      suggestions.push(`${unverifiedCount} loans lack verification. Implement third-party verification for PCAF compliance.`);
    }

    const missingKmCount = loans.filter(loan => !loan.estimated_annual_km).length;
    if (missingKmCount > 0) {
      suggestions.push(`${missingKmCount} loans missing annual mileage data. Collect actual usage data to improve accuracy.`);
    }

    const hybridElectricCount = loans.filter(loan => ['hybrid', 'electric'].includes(loan.fuel_type)).length;
    if (hybridElectricCount > loans.length * 0.1) {
      suggestions.push('Consider implementing specialized emission factors for hybrid and electric vehicles.');
    }

    return suggestions;
  };

  const getQualityColor = (score: number) => {
    if (score <= 2) return 'hsl(var(--chart-1))'; // Green
    if (score <= 3) return 'hsl(var(--chart-2))'; // Blue
    if (score <= 4) return 'hsl(var(--chart-3))'; // Yellow
    return 'hsl(var(--chart-4))'; // Red
  };

  const getQualityLabel = (score: number) => {
    if (score <= 2) return 'Excellent';
    if (score <= 3) return 'Good';
    if (score <= 4) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="ml-2">Loading data quality metrics...</span>
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
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Data Available</h3>
            <p className="text-muted-foreground">Upload loan data to view data quality analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Average Quality</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.averageScore.toFixed(1)}/5</p>
            <p className="text-xs text-muted-foreground">PCAF Data Quality Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">High Quality</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {metrics.distribution.filter(d => d.score <= 2).reduce((sum, d) => sum + d.count, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Score 1-2 loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Needs Improvement</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {metrics.distribution.filter(d => d.score >= 4).reduce((sum, d) => sum + d.count, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Score 4-5 loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Verified Loans</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {metrics.verificationStatus.find(v => v.status === 'verified')?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.verificationStatus.find(v => v.status === 'verified')?.percentage.toFixed(1) || 0}% of portfolio
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Quality Distribution</TabsTrigger>
          <TabsTrigger value="improvements">Improvement Opportunities</TabsTrigger>
          <TabsTrigger value="regional">Regional Coverage</TabsTrigger>
          <TabsTrigger value="verification">Verification Status</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Score Distribution</CardTitle>
              <CardDescription>
                Distribution of PCAF data quality scores across your loan portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.distribution.filter(d => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="score"
                      >
                        {metrics.distribution.filter(d => d.count > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getQualityColor(entry.score)} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value} loans (${metrics.distribution.find(d => d.score.toString() === name)?.percentage.toFixed(1)}%)`,
                          `Score ${name} - ${getQualityLabel(Number(name))}`
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {metrics.distribution.map((item) => (
                    <div key={item.score} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getQualityColor(item.score) }}
                        />
                        <div>
                          <p className="font-medium">Score {item.score} - {getQualityLabel(item.score)}</p>
                          <p className="text-sm text-muted-foreground">
                            PCAF Quality Level {item.score}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.count}</p>
                        <p className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Data Quality Improvement Opportunities
              </CardTitle>
              <CardDescription>
                Actionable recommendations to enhance your portfolio's data quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.improvementOpportunities.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Excellent! Your portfolio has high data quality with no immediate improvement opportunities identified.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {metrics.improvementOpportunities.map((opportunity, index) => (
                    <Alert key={index}>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>{opportunity}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">General Best Practices:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Collect actual vehicle usage data instead of using estimates</li>
                  <li>• Verify emission factors with regional automotive authorities</li>
                  <li>• Implement third-party verification for PCAF compliance</li>
                  <li>• Use specific emission factors for electric and hybrid vehicles</li>
                  <li>• Regular data validation and cleansing processes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Regional Data Coverage
              </CardTitle>
              <CardDescription>
                Emission factor coverage and data quality by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.regionalCoverage.map((region) => (
                  <div key={region.region} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{region.region}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Quality: {region.quality.toFixed(1)}/5
                        </Badge>
                        <Badge variant={region.coverage >= 80 ? 'default' : region.coverage >= 60 ? 'secondary' : 'destructive'}>
                          {region.coverage}% Coverage
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Emission Factor Coverage</span>
                        <span>{region.coverage}%</span>
                      </div>
                      <Progress value={region.coverage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Verification Status
              </CardTitle>
              <CardDescription>
                Third-party verification status of loan emissions data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.verificationStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="status" 
                        tickFormatter={(value) => value.replace('_', ' ')}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value} loans (${metrics.verificationStatus.find(v => v.status === name)?.percentage.toFixed(1)}%)`,
                          'Count'
                        ]}
                        labelFormatter={(value) => `Status: ${value.replace('_', ' ')}`}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {metrics.verificationStatus.map((status) => (
                    <div key={status.status} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {status.status === 'verified' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {status.status === 'partially_verified' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        {status.status === 'unverified' && <XCircle className="h-4 w-4 text-red-500" />}
                        <div>
                          <p className="font-medium capitalize">{status.status.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {status.status === 'verified' && 'Third-party verified'}
                            {status.status === 'partially_verified' && 'Partially verified data'}
                            {status.status === 'unverified' && 'No verification completed'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{status.count}</p>
                        <p className="text-sm text-muted-foreground">{status.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}