import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AIAssistantPanel } from "@/components/enhanced/AIAssistantPanel";
import { ReorganizedAIInsights } from "@/components/ai/ReorganizedAIInsights";
import { SmartEmptyState } from "@/components/ai/SmartEmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Brain, Globe, BarChart3 } from "lucide-react";
import { portfolioService } from "@/services/portfolioService";
import { useToast } from "@/hooks/use-toast";

export default function AIInsightsPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [portfolioContext, setPortfolioContext] = useState<any>(null);
  const [triggerQuery, setTriggerQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'insights');

  useEffect(() => {
    document.title = "AI Insights — Financed Emissions";
    const desc = "Comprehensive AI insights: analytics, climate risk assessment, scenario modeling, and AI assistant.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
    const link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute('href', window.location.href);
    else {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      l.setAttribute('href', window.location.href);
      document.head.appendChild(l);
    }
    
    loadPortfolioContext();
  }, []);

  // Handle tab changes and URL updates
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['insights', 'risk', 'scenarios'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadPortfolioContext = async () => {
    try {
      setLoading(true);
      
      // Load portfolio data from backend
      const { loans, summary } = await portfolioService.getPortfolioSummary();
      const portfolioMetrics = await portfolioService.getPortfolioAnalytics();
      
      if (loans.length > 0) {
        const electricVehicles = loans.filter(loan => 
          loan.vehicle_details.fuel_type.toLowerCase().includes('electric')
        ).length;
        
        // Add calculated fields for the reorganized component
        const enhancedMetrics = {
          ...portfolioMetrics,
          complianceScore: Math.max(0, 100 - (portfolioMetrics.weightedAvgDataQuality - 1) * 25),
          riskScore: Math.min(100, portfolioMetrics.weightedAvgDataQuality * 20 + Math.random() * 20)
        };
        
        setPortfolioContext({
          portfolioSummary: {
            totalLoans: loans.length,
            totalEmissions: portfolioMetrics.totalFinancedEmissions.toFixed(1),
            avgDataQuality: portfolioMetrics.weightedAvgDataQuality.toFixed(2),
            evPercentage: ((electricVehicles / loans.length) * 100).toFixed(1)
          },
          loans,
          metrics: enhancedMetrics,
          insights: [],
          anomalies: []
        });
      }
    } catch (error) {
      console.error('Failed to load portfolio context:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load portfolio data for AI analysis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatTrigger = (query: string) => {
    setTriggerQuery(query);
    setShowChatSidebar(true);
  };

  if (loading) {
    return (
      <main className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading AI insights...</span>
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
          type="ai-insights" 
          portfolioMetrics={portfolioContext?.metrics}
          onGetStarted={() => {
            toast({
              title: "Upload Portfolio Data",
              description: "Upload your loan data to unlock AI-powered insights",
            });
          }}
        />
      </main>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className={`flex-1 overflow-auto ${showChatSidebar ? 'pr-96' : ''} transition-all duration-300`}>
        <main className="p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="risk" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Climate Risk
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Scenarios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="mt-0">
              <ReorganizedAIInsights 
                portfolioMetrics={portfolioContext?.metrics}
                onChatTrigger={handleChatTrigger}
                focusArea="insights"
              />
            </TabsContent>

            <TabsContent value="risk" className="mt-0">
              <ReorganizedAIInsights 
                portfolioMetrics={portfolioContext?.metrics}
                onChatTrigger={handleChatTrigger}
                focusArea="risk"
              />
            </TabsContent>

            <TabsContent value="scenarios" className="mt-0">
              <ReorganizedAIInsights 
                portfolioMetrics={portfolioContext?.metrics}
                onChatTrigger={handleChatTrigger}
                focusArea="scenarios"
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* AI Assistant Sidebar */}
      {showChatSidebar && (
        <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-muted/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">AI Assistant</h3>
                <button
                  onClick={() => setShowChatSidebar(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIAssistantPanel 
                context={portfolioContext}
                defaultAgent="advisory"
                triggerQuery={triggerQuery}
                onQueryProcessed={() => {
                  setTriggerQuery("");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
