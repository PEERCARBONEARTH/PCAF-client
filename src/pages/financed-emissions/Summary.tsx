import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { portfolioService, type LoanData } from "@/services/portfolioService";
import { useToast } from "@/hooks/use-toast";
import { usePortfolioSync, usePortfolioAnalyticsSync } from "@/hooks/useDataSync";
import { PortfolioOverviewDashboard } from "@/components/PortfolioOverviewDashboard";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import { AdvancedAnalyticsEngine } from "@/components/AdvancedAnalyticsEngine";
import { ScenarioModelingTool } from "@/components/ScenarioModelingTool";
import EVFleetTransitionSimulator from "@/components/EVFleetTransitionSimulator";
import { UnifiedMetricCard } from "@/components/shared/UnifiedMetricCard";
import { CheckCircle, AlertTriangle, Clock, FileWarning, Info, Building, Brain, Calculator, BarChart3 } from "lucide-react";
export default function EmissionsSummaryPage() {
  const { toast } = useToast();
  const [recentLoans, setRecentLoans] = useState<LoanData[]>([]);
  
  // Use data sync hooks for real-time updates
  const { 
    data: portfolioData, 
    isLoading: portfolioLoading, 
    refresh: refreshPortfolio,
    isStale: portfolioStale 
  } = usePortfolioSync({
    fetchFunction: () => portfolioService.getPortfolioSummary({}).then(result => result),
    onSuccess: (data) => {
      // Update recent loans when portfolio data changes
      if (data?.loans) {
        const sortedLoans = data.loans.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentLoans(sortedLoans.slice(0, 5));
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive"
      });
    }
  });

  const { 
    data: analyticsData, 
    isLoading: analyticsLoading,
    refresh: refreshAnalytics 
  } = usePortfolioAnalyticsSync({
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    }
  });

  const loading = portfolioLoading || analyticsLoading;
  const getStatusInfo = (loan: LoanData) => {
    if (!loan.vehicle_details.value_at_origination || loan.vehicle_details.value_at_origination <= 0) {
      return {
        status: 'Missing Fields',
        color: 'destructive',
        icon: FileWarning
      };
    }
    if (loan.emissions_data.data_quality_score >= 4) {
      return {
        status: 'Needs Review',
        color: 'secondary',
        icon: AlertTriangle
      };
    }
    if (loan.emissions_data.financed_emissions_tco2e > 0) {
      return {
        status: 'Calculated',
        color: 'default',
        icon: CheckCircle
      };
    }
    return {
      status: 'Processing',
      color: 'secondary',
      icon: Clock
    };
  };
  if (recentLoans.length === 0 && !loading) {
    return <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Portfolio Carbon Footprint Summary
            </h1>
            <p className="text-muted-foreground">
              Scope 3 Category 15 emissions overview and recent activity
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>No loan data found. Load sample data or Upload your loan portfolio data to see emissions calculations and summary.</AlertDescription>
          </Alert>
        </div>
      </div>;
  }
  return <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Scope 3 Category 15 Emissions Portal
          </h1>
          <p className="text-muted-foreground">
            Portfolio Carbon Footprint analytics and emissions attributed to loans
          </p>
        </div>

        {/* Enhanced Tabbed Interface */}
        <Tabs defaultValue="executive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="executive" className="flex items-center gap-2 hover-glow">
              <Building className="h-4 w-4 hover-scale" />
              Executive
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 hover-glow">
              <BarChart3 className="h-4 w-4 hover-scale" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 hover-glow">
              <Brain className="h-4 w-4 hover-scale" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2 hover-glow">
              <Calculator className="h-4 w-4 hover-scale" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 hover-glow">
              <Clock className="h-4 w-4 hover-scale" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <ExecutiveDashboard />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioOverviewDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdvancedAnalyticsEngine />
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <ScenarioModelingTool />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Recent Activity Section */}
            {recentLoans.length > 0 ? (
              <Card className="floating-card shimmer-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary hover-scale" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest loan uploads and calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentLoans.map(loan => {
                  const statusInfo = getStatusInfo(loan);
                  const StatusIcon = statusInfo.icon;
                  return <div key={loan.loan_id} className="feature-item">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <StatusIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{loan.loan_id}</div>
                                <div className="text-sm text-muted-foreground">
                                  {loan.vehicle_details.type} • {loan.vehicle_details.fuel_type} • ${loan.loan_amount.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{loan.emissions_data.financed_emissions_tco2e.toFixed(2)} tCO₂e</div>
                              <div className="text-xs text-muted-foreground">
                                Attributed Emissions: {(loan.emissions_data.attribution_factor * 100).toFixed(1)}%
                              </div>
                            </div>
                            
                             <Badge variant={statusInfo.color as any} className={`badge-enhanced ${
                               statusInfo.color === 'destructive' ? 'status-risk' :
                               statusInfo.color === 'secondary' ? 'status-pending' : 'status-active'
                             }`}>
                               {statusInfo.status}
                             </Badge>
                            
                            <div className="text-center">
                              <div className="text-sm font-medium">Q{loan.emissions_data.data_quality_score}</div>
                              <div className="text-xs text-muted-foreground">Quality</div>
                            </div>
                          </div>
                        </div>;
                })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Recent Activity</h3>
                    <p className="text-muted-foreground">
                      Upload loan data to track portfolio activity
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* EV Fleet Transition Simulator */}
            <EVFleetTransitionSimulator />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}