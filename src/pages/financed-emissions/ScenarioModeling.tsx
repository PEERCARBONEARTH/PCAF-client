import { useEffect, useState } from "react";
import { SmartEmptyState } from "@/components/ai/SmartEmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, BarChart3, Target, Zap, AlertTriangle } from "lucide-react";
import { portfolioService } from "@/services/portfolioService";
import { useToast } from "@/hooks/use-toast";

export default function ScenarioModelingPage() {
  const { toast } = useToast();
  const [portfolioContext, setPortfolioContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Scenario Modeling — Financed Emissions";
    const desc = "Climate scenario modeling for motor vehicle loan portfolios: NGFS scenarios, stress testing, and forward projections.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
    
    loadPortfolioContext();
  }, []);

  const loadPortfolioContext = async () => {
    try {
      setLoading(true);
      
      const { loans, summary } = await portfolioService.getPortfolioSummary();
      const portfolioMetrics = await portfolioService.getPortfolioAnalytics();
      
      if (loans.length > 0) {
        setPortfolioContext({
          portfolioSummary: {
            totalLoans: loans.length,
            totalEmissions: portfolioMetrics.totalFinancedEmissions.toFixed(1),
            avgDataQuality: portfolioMetrics.weightedAvgDataQuality.toFixed(2),
          },
          loans,
          metrics: portfolioMetrics
        });
      }
    } catch (error) {
      console.error('Failed to load portfolio context:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load portfolio data for scenario modeling.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading scenario modeling...</span>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Show smart empty state if no portfolio data
  if (!portfolioContext || !portfolioContext.loans || portfolioContext.loans.length === 0) {
    return (
      <main className="space-y-8">
        <SmartEmptyState 
          type="scenario-modeling" 
          portfolioMetrics={portfolioContext?.metrics}
          onGetStarted={() => {
            toast({
              title: "Upload Portfolio Data",
              description: "Upload your loan data to unlock scenario modeling capabilities",
            });
          }}
        />
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-purple-100 text-purple-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Climate Scenario Modeling</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Model portfolio performance under different climate scenarios and stress tests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 font-medium">
                NGFS Scenarios
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dynamic Scenario Insights */}
      <SmartEmptyState 
        type="scenario-modeling" 
        portfolioMetrics={portfolioContext?.metrics}
        onGetStarted={() => {}}
      />

      {/* NGFS Scenarios */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Orderly Transition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">-25%</div>
                <div className="text-sm text-muted-foreground">Emissions by 2030</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Portfolio Value Impact</span>
                  <span className="font-medium text-green-600">+5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>EV Adoption Rate</span>
                  <span className="font-medium">60% by 2030</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Carbon Price</span>
                  <span className="font-medium">$130/tonne</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Disorderly Transition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">-35%</div>
                <div className="text-sm text-muted-foreground">Emissions by 2030</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Portfolio Value Impact</span>
                  <span className="font-medium text-red-600">-15%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>EV Adoption Rate</span>
                  <span className="font-medium">45% by 2030</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Carbon Price</span>
                  <span className="font-medium">$200/tonne</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Hot House World
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">+10%</div>
                <div className="text-sm text-muted-foreground">Emissions by 2030</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Portfolio Value Impact</span>
                  <span className="font-medium text-red-600">-25%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>EV Adoption Rate</span>
                  <span className="font-medium">20% by 2030</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Physical Risk Impact</span>
                  <span className="font-medium text-red-600">High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Analysis Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Scenario Analysis Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col">
              <Target className="h-6 w-6 mb-2" />
              <span className="text-sm">Stress Testing</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Sensitivity Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Monte Carlo</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Zap className="h-6 w-6 mb-2" />
              <span className="text-sm">Custom Scenarios</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Forward Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            10-Year Forward Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">2030</div>
              <div className="text-sm text-muted-foreground mb-4">Target Year</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Emissions Reduction</span>
                  <span className="font-medium text-green-600">-30%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>EV Portfolio Share</span>
                  <span className="font-medium">55%</span>
                </div>
              </div>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">2035</div>
              <div className="text-sm text-muted-foreground mb-4">Mid-term</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Emissions Reduction</span>
                  <span className="font-medium text-green-600">-50%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>EV Portfolio Share</span>
                  <span className="font-medium">75%</span>
                </div>
              </div>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">2040</div>
              <div className="text-sm text-muted-foreground mb-4">Long-term</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Emissions Reduction</span>
                  <span className="font-medium text-green-600">-70%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>EV Portfolio Share</span>
                  <span className="font-medium">90%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}