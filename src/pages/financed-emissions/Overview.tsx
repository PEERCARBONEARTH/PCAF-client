import { useEffect, useState } from "react";
import { PortfolioOverviewDashboard } from "@/components/PortfolioOverviewDashboard";
import { OutcomeDashboard } from "@/components/outcomes/OutcomeDashboard";
import { ProgressTracker } from "@/components/progress/ProgressTracker";
import { ContextualHelp } from "@/components/help/ContextualHelp";
import { SmartOnboarding } from "@/components/onboarding/SmartOnboarding";
import { MobileOnboarding } from "@/components/mobile/MobileOnboarding";
import { MobileOptimizedDashboard } from "@/components/mobile/MobileOptimizedDashboard";
import { NewUserExperience } from "@/components/new-user/NewUserExperience";
import { useMobileDevice } from "@/hooks/useMobileGestures";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  BarChart3, 
  Trophy, 
  HelpCircle, 
  Zap, 
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { portfolioService } from "@/services/portfolioService";

export default function OverviewPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);
  const [activeView, setActiveView] = useState('outcomes');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [hasPortfolioData, setHasPortfolioData] = useState(false);
  const { toast } = useToast();
  const { isMobile } = useMobileDevice();

  useEffect(() => {
    document.title = "Portfolio Overview – Financed Emissions";
    const desc = "Portfolio analytics hub: KPIs, trends, breakdowns, and PCAF compliance.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);

    // Check if user is first-time visitor
    checkFirstTimeUser();
    loadPortfolioMetrics();
  }, []);

  const checkFirstTimeUser = () => {
    const hasVisited = localStorage.getItem('financed-emissions-visited');
    const hasCompletedOnboarding = localStorage.getItem('financed-emissions-onboarding');
    
    if (!hasVisited) {
      setIsFirstTime(true);
      setShowOnboarding(true);
      localStorage.setItem('financed-emissions-visited', 'true');
    } else if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  const loadPortfolioMetrics = async () => {
    try {
      const metrics = await portfolioService.getPortfolioAnalytics();
      setPortfolioMetrics(metrics);
      
      // Check if user has meaningful portfolio data
      const hasData = metrics && (
        metrics.totalLoans > 0 || 
        metrics.totalFinancedEmissions > 0 ||
        metrics.totalOutstandingBalance > 0
      );
      setHasPortfolioData(hasData);
      
    } catch (error) {
      console.error('Failed to load portfolio metrics:', error);
      setHasPortfolioData(false);
    }
  };

  const handleOnboardingComplete = (goalId: string) => {
    toast({
      title: "🎉 Great Progress!",
      description: "You're on your way to PCAF mastery. Keep up the excellent work!",
    });
    
    // Mark onboarding as completed
    localStorage.setItem('financed-emissions-onboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem('financed-emissions-onboarding', 'skipped');
  };

  const handleActionStart = (action: any) => {
    toast({
      title: "Action Started",
      description: `Starting: ${action.title}`,
    });
  };

  // Show onboarding for first-time users or those who haven't completed it
  if (showOnboarding) {
    return isMobile ? (
      <MobileOnboarding 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <SmartOnboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </div>
    );
  }

  // Show new user experience if no portfolio data
  if (!hasPortfolioData) {
    return isMobile ? (
      <MobileOptimizedDashboard 
        portfolioMetrics={portfolioMetrics}
        onActionStart={handleActionStart}
      />
    ) : (
      <main className="space-y-6">
        <NewUserExperience 
          onGetStarted={() => {
            toast({
              title: "Let's Get Started!",
              description: "Upload your portfolio to begin your PCAF journey",
            });
          }}
        />
      </main>
    );
  }

  // Use mobile-optimized dashboard for mobile devices
  if (isMobile) {
    return (
      <MobileOptimizedDashboard 
        portfolioMetrics={portfolioMetrics}
        onActionStart={handleActionStart}
      />
    );
  }

  return (
    <main className="space-y-6">
      {/* Enhanced Header with Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <header>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Portfolio Overview
            {isFirstTime && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Welcome!
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your PCAF journey with outcome-focused insights and progress tracking
          </p>
        </header>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowOnboarding(true)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Quick Start Guide
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/financed-emissions/upload'}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Upload Data
          </Button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Ready to Start</h3>
                <p className="text-sm text-green-700">Upload your first portfolio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">PCAF Compliance</h3>
                <p className="text-sm text-blue-700">Track your progress to ≤3.0 WDQS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">Level Up</h3>
                <p className="text-sm text-purple-700">Earn achievements and build expertise</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="outcomes" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Your Goals
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outcomes" className="space-y-6">
          <OutcomeDashboard 
            portfolioMetrics={portfolioMetrics}
            onActionStart={handleActionStart}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PortfolioOverviewDashboard />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressTracker 
            portfolioMetrics={portfolioMetrics}
            onAchievementUnlock={(achievement) => {
              toast({
                title: `🏆 Achievement Unlocked!`,
                description: `${achievement.title} - ${achievement.points} points earned`,
              });
            }}
          />
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <ContextualHelp />
        </TabsContent>
      </Tabs>

      {/* Floating Action Hints */}
      {!portfolioMetrics && (
        <Card className="fixed bottom-6 left-6 max-w-sm border-primary/20 bg-primary/5 shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Get Started in 5 Minutes</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload your loan data to see your first PCAF calculation
                </p>
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = '/financed-emissions/upload'}
                  className="w-full"
                >
                  Upload Now
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
