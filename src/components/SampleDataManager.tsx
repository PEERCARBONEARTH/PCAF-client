import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SampleDataGenerator } from '@/lib/sampleData';
import { 
  Database, 
  Download, 
  Trash2, 
  BarChart3, 
  Car, 
  Fuel, 
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function SampleDataManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(true);

  const refreshStats = async () => {
    console.log('SampleDataManager: Refreshing stats...');
    setRefreshing(true);
    try {
      const portfolioStats = await SampleDataGenerator.getPortfolioStats();
      console.log('SampleDataManager: Portfolio stats:', portfolioStats);
      setStats(portfolioStats);
    } catch (error) {
      console.error('SampleDataManager: Error refreshing stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleLoadSampleData = async () => {
    setLoading(true);
    try {
      const result = await SampleDataGenerator.loadSampleData();
      
      if (result.success) {
        toast({
          title: "Sample Data Loaded Successfully! 🎉",
          description: `${result.message}. Navigate to Portfolio Overview to see your data.`,
        });
        await refreshStats();
      } else {
        toast({
          title: "Load Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sample data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all loan data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await SampleDataGenerator.clearAllData();
      
      if (result.success) {
        toast({
          title: "Data Cleared",
          description: result.message,
        });
        await refreshStats();
      } else {
        toast({
          title: "Clear Failed", 
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Portfolio Data Manager</CardTitle>
          </div>
          <CardDescription>
            Load sample motor vehicle loan data to explore the financed emissions platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {stats?.hasData ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">
                  {refreshing ? 'Checking...' : stats?.hasData ? 'Portfolio Loaded' : 'No Portfolio Data'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {refreshing ? 'Loading status...' : stats?.hasData 
                    ? `${stats.totalInstruments || stats.totalLoans} instruments in database` 
                    : 'Load sample data to get started'
                  }
                </p>
              </div>
            </div>
            
            {stats?.hasData && (
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {stats.totalInstruments || stats.totalLoans} total
                </Badge>
                {stats?.instrumentBreakdown && (
                  <>
                    <Badge variant="outline">{stats.instrumentBreakdown.loans} loans</Badge>
                    <Badge variant="outline">{stats.instrumentBreakdown.lcs} LCs</Badge>
                    <Badge variant="outline">{stats.instrumentBreakdown.guarantees} guarantees</Badge>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Portfolio Summary */}
          {stats?.latestCalculation && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Portfolio Summary
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Instruments</p>
                  <p className="text-lg font-semibold">{stats.latestCalculation.total_loans}</p>
                  {stats?.instrumentBreakdown && (
                    <p className="text-xs text-muted-foreground">
                      {stats.instrumentBreakdown.loans}L • {stats.instrumentBreakdown.lcs}LC • {stats.instrumentBreakdown.guarantees}G
                    </p>
                  )}
                </div>
                
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Outstanding Balance</p>
                  <p className="text-lg font-semibold">
                    ${(stats.latestCalculation.total_outstanding_balance / 1000000).toFixed(1)}M
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Financed Emissions</p>
                  <p className="text-lg font-semibold">
                    {stats.latestCalculation.total_financed_emissions.toFixed(1)} tCO₂e
                  </p>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Avg Data Quality</p>
                  <p className="text-lg font-semibold">
                    {stats.latestCalculation.weighted_avg_data_quality.toFixed(1)}/5
                  </p>
                </div>
              </div>

              {/* Fuel Type Breakdown */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium flex items-center gap-2">
                  <Fuel className="h-3 w-3" />
                  Emissions by Fuel Type
                </h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.latestCalculation.emissions_by_fuel_type).map(([fuel, emissions]) => (
                    <Badge key={fuel} variant="outline" className="text-xs">
                      {fuel}: {(emissions as number).toFixed(1)} tCO₂e
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={(e) => {
                console.log('SampleDataManager: Load Sample Data button clicked');
                console.log('SampleDataManager: Current state - loading:', loading, 'hasData:', stats?.hasData);
                handleLoadSampleData();
              }}
              disabled={loading || stats?.hasData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Loading...' : 'Load Sample Data'}
            </Button>

            {stats?.hasData && (
              <Button 
                variant="outline"
                onClick={handleClearData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Data
              </Button>
            )}
          </div>

          {/* Sample Data Description */}
          <div className="p-4 bg-muted/50 rounded-sm space-y-2">
            <h4 className="font-medium">Sample Data Includes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>100 Motor Vehicle Loans</strong> ($25k - $60k range)</li>
              <li>• <strong>25 Letters of Credit</strong> ($500k - $2.5M dealer/import financing)</li>
              <li>• <strong>25 Guarantees</strong> ($100k - $900k residual value/performance/payment)</li>
              <li>• Mix of gasoline, diesel, electric, and hybrid vehicles</li>
              <li>• PCAF-compliant emissions calculations and attribution factors</li>
              <li>• Varied data quality scores (1-5 PCAF hierarchy)</li>
              <li>• Risk-weighted attribution for contingent instruments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}