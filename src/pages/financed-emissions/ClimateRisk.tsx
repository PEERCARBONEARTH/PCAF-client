import { useEffect, useState } from "react";
import { SmartEmptyState } from "@/components/ai/SmartEmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw, TrendingUp, Shield, AlertTriangle, Thermometer } from "lucide-react";
import { portfolioService } from "@/services/portfolioService";
import { useToast } from "@/hooks/use-toast";

export default function ClimateRiskPage() {
  const { toast } = useToast();
  const [portfolioContext, setPortfolioContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Climate Risk Analysis — Financed Emissions";
    const desc = "Climate risk analysis for motor vehicle loan portfolios: physical risks, transition risks, and scenario modeling.";
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
        description: "Failed to load portfolio data for climate risk analysis.",
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
              <span className="ml-2">Loading climate risk analysis...</span>
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
          type="climate-risk" 
          portfolioMetrics={portfolioContext?.metrics}
          onGetStarted={() => {
            toast({
              title: "Upload Portfolio Data",
              description: "Upload your loan data to unlock climate risk analysis",
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
              <div className="p-2 rounded-sm bg-orange-100 text-orange-600">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Climate Risk Analysis</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Physical and transition climate risk assessment for your motor vehicle portfolio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-medium">
                TCFD Aligned
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dynamic Climate Risk Insights */}
      <SmartEmptyState 
        type="climate-risk" 
        portfolioMetrics={portfolioContext?.metrics}
        onGetStarted={() => {}}
      />

      {/* Risk Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              Physical Climate Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-sm border">
                <h4 className="font-medium mb-2">Extreme Weather Events</h4>
                <p className="text-sm text-muted-foreground">
                  Assess portfolio exposure to floods, hurricanes, and extreme temperatures
                </p>
                <Badge variant="outline" className="mt-2">
                  Geographic Analysis
                </Badge>
              </div>
              <div className="p-4 bg-white rounded-sm border">
                <h4 className="font-medium mb-2">Sea Level Rise</h4>
                <p className="text-sm text-muted-foreground">
                  Coastal region exposure analysis for vehicle collateral
                </p>
                <Badge variant="outline" className="mt-2">
                  Long-term Risk
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Transition Climate Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-sm border">
                <h4 className="font-medium mb-2">Technology Transition</h4>
                <p className="text-sm text-muted-foreground">
                  EV adoption impact on ICE vehicle values and demand
                </p>
                <Badge variant="outline" className="mt-2">
                  Market Risk
                </Badge>
              </div>
              <div className="p-4 bg-white rounded-sm border">
                <h4 className="font-medium mb-2">Policy & Regulation</h4>
                <p className="text-sm text-muted-foreground">
                  Carbon pricing and emission standards impact
                </p>
                <Badge variant="outline" className="mt-2">
                  Regulatory Risk
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Portfolio Risk Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">Medium</div>
              <div className="text-sm text-muted-foreground">Physical Risk</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">High</div>
              <div className="text-sm text-muted-foreground">Transition Risk</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">15%</div>
              <div className="text-sm text-muted-foreground">Value at Risk</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-muted-foreground">Resilience Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}