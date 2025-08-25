import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { PeercarbonLogo } from "@/components/PeercarbonLogo";
import { ModeToggle } from "@/components/mode-toggle";
import { LandingHero } from "@/components/LandingHero";
import { DashboardMockup } from "@/components/DashboardMockup";
import { NetworkBackground } from "@/components/NetworkBackground";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

import { PlatformProvider, usePlatform } from "@/contexts/PlatformContext";
import { AssumptionsProvider } from "@/contexts/AssumptionsContext";

import { PlatformLayout } from "@/components/shared/PlatformLayout";
import PlatformSelection from "./pages/PlatformSelection";
import PCAFAssetClassSelection from "./pages/PCAFAssetClassSelection";
import Index from "./pages/Index";
import Tranches from "./pages/Tranches";
import TrancheBuilder from "./pages/TrancheBuilder";
import Reporting from "./pages/Reporting";
import TrancheMonitoring from "./pages/TrancheMonitoring";
import ProjectExplorer from "./pages/ProjectExplorer";
import ProjectDetail from "./pages/ProjectDetail";
import AlertsRisk from "./pages/AlertsRisk";
import ComplianceVault from "./pages/ComplianceVault";
import UserAccess from "./pages/UserAccess";

import TaskCenter from "./pages/TaskCenter";
import WorkflowCenter from "./pages/WorkflowCenter";
import Marketplace from "./pages/Marketplace";
import PCAFCalculator from "./pages/PCAFCalculator";
import DeveloperPortal from "./pages/DeveloperPortal";
import InstitutionView from "./pages/InstitutionView";
import Settings from "./pages/Settings";
import AssetMonitoring from "./pages/AssetMonitoring";
import TrancheReview from "./pages/TrancheReview";
import ProgramConfiguration from "./pages/ProgramConfiguration";
import NotFound from "./pages/NotFound";
import PortfolioMap from "./pages/PortfolioMap";
import ImpactReports from "./pages/ImpactReports";
import NewInvestment from "./pages/NewInvestment";
import VARLDashboard from "./pages/VARLDashboard";
import ViewAllOpportunities from "./pages/ViewAllOpportunities";
import Auth from "./pages/Auth";

import UploadPage from "./pages/financed-emissions/Upload";
import LedgerPage from "./pages/financed-emissions/Ledger";
import OverviewPage from "./pages/financed-emissions/Overview";
import ReportsPage from "./pages/financed-emissions/Reports";
import ReportTemplates from "./pages/financed-emissions/ReportTemplates";
import EmissionsSummaryPage from "./pages/financed-emissions/Summary";
import AIInsightsPage from "./pages/financed-emissions/AIInsights";
import ClimateRiskPage from "./pages/financed-emissions/ClimateRisk";
import ScenarioModelingPage from "./pages/financed-emissions/ScenarioModeling";
import RAGManagementPage from "./pages/financed-emissions/RAGManagement";
import FinancedEmissionsSettings from "./pages/financed-emissions/Settings";
import PortfolioDeepAnalysisPresentation from "./pages/financed-emissions/PortfolioDeepAnalysisPresentation";
import { FinancedEmissionsLayout } from "./components/FinancedEmissionsLayout";
import MethodologyPage from "./pages/financed-emissions/Methodology";
import { lazy, Suspense, useEffect } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

import { DealPipelineProvider } from "./contexts/DealPipelineContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { realTimeService } from "./services/realTimeService";

const AmortizationSettings = lazy(() => import("./pages/AmortizationSettings"));
const queryClient = new QueryClient();

// Landing page component for non-authenticated users
const LandingPage = () => {
  return (
    <div className="animated-background min-h-screen relative overflow-hidden">
      {/* Dark mode toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      
      {/* Moving Glass Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 backdrop-blur-md rounded-full animate-[float-background_25s_ease-in-out_infinite] opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-finance/8 backdrop-blur-lg rounded-full animate-[float-background_30s_ease-in-out_infinite_reverse] opacity-50" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/6 backdrop-blur-xl rounded-full animate-[float-background_35s_ease-in-out_infinite] opacity-40" />
        <div className="absolute top-1/6 right-1/3 w-48 h-48 bg-primary/12 backdrop-blur-sm rounded-full animate-[float-background_20s_ease-in-out_infinite_reverse] opacity-70" />
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/5" />
      
      {/* Network background overlay */}
      <NetworkBackground />
      
      {/* Billboard Layout - Left/Right Split */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Hero & Platform Selection (60%) */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <LandingHero />
          </div>
        </div>

        {/* Right Side - Dashboard Mockup (40%) with light green tint */}
        <div className="hidden lg:flex w-2/5 items-center justify-center p-8 bg-gradient-to-br from-primary/15 via-finance/12 to-muted/25 backdrop-blur-sm border-l border-border/30">
          <div className="w-full max-w-md">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to handle financed emissions routing with new layout
const FinancedEmissionsRoutes = () => {
  const { setPlatform } = usePlatform();
  
  // Auto-set platform to financed-emissions when accessing these routes
  useEffect(() => {
    setPlatform('financed-emissions');
  }, [setPlatform]);

  return (
    <FinancedEmissionsLayout>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="summary" element={<EmissionsSummaryPage />} />
        <Route path="ledger" element={<LedgerPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        {/* Legacy routes redirect to unified AI insights */}
        <Route path="climate-risk" element={<Navigate to="/financed-emissions/ai-insights?tab=risk" replace />} />
        <Route path="scenario-modeling" element={<Navigate to="/financed-emissions/ai-insights?tab=scenarios" replace />} />
        <Route path="rag-management" element={<RAGManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/templates" element={<ReportTemplates />} />
        <Route path="reports/presentation/portfolio-deep-analysis" element={<PortfolioDeepAnalysisPresentation />} />
        <Route path="pcaf-calculator" element={<PCAFCalculator />} />
        <Route path="methodology" element={<MethodologyPage />} />
        <Route path="amortization" element={
          <Suspense fallback={<div className="min-h-[120px] flex items-center justify-center">Loading…</div>}>
            <AmortizationSettings />
          </Suspense>
        } />
        <Route path="settings" element={<FinancedEmissionsSettings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </FinancedEmissionsLayout>
  );
};

// Component to handle platform-aware routing
const PlatformRoutes = () => {
  const { currentPlatform } = usePlatform();

  // If no platform is selected, show platform selection
  if (!currentPlatform) {
    return <PlatformSelection />;
  }

  // Show platform-specific routes wrapped in layout
  return (
    <PlatformLayout>
      <Routes>
        {currentPlatform === 'green-finance' && (
          <>
            <Route path="/" element={<Navigate to="/green-finance" replace />} />
            <Route path="/green-finance" element={<Index />} />
            <Route path="/green-finance/tranches" element={<Tranches />} />
            <Route path="/green-finance/tranches/builder" element={<TrancheBuilder />} />
            <Route path="/green-finance/tranches/monitoring" element={<TrancheMonitoring />} />
            <Route path="/green-finance/reports" element={<Reporting />} />
            <Route path="/green-finance/projects" element={<ProjectExplorer />} />
            <Route path="/green-finance/opportunities" element={<ViewAllOpportunities />} />
            <Route path="/green-finance/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/green-finance/alerts-risk" element={<AlertsRisk />} />
            <Route path="/green-finance/compliance" element={<ComplianceVault />} />
            <Route path="/green-finance/users" element={<UserAccess />} />
            
            <Route path="/green-finance/tasks" element={<TaskCenter />} />
            <Route path="/green-finance/workflows" element={<WorkflowCenter />} />
            <Route path="/green-finance/marketplace" element={<Marketplace />} />
            <Route path="/green-finance/pcaf-calculator" element={<PCAFCalculator />} />
            <Route path="/green-finance/institution-view" element={<InstitutionView />} />
            <Route path="/green-finance/developer" element={<DeveloperPortal />} />
            <Route path="/green-finance/settings" element={<Settings />} />
            <Route path="/green-finance/portfolio-map" element={<PortfolioMap />} />
            <Route path="/green-finance/impact-reports" element={<ImpactReports />} />
            <Route path="/green-finance/new-investment" element={<NewInvestment />} />
            <Route path="/green-finance/varl" element={<VARLDashboard />} />
          </>
        )}
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PlatformLayout>
  );
};

function App() {
  const { user, loading, isApproved } = useAuth();

  // Always call isApproved to maintain consistent hook order
  const userIsApproved = isApproved();

  // Initialize real-time service when user is authenticated
  useEffect(() => {
    if (user) {
      realTimeService.connect();
    }
    
    return () => {
      if (user) {
        realTimeService.disconnect();
      }
    };
  }, [user]);

  // PWA and mobile optimizations
  useEffect(() => {
    // Add PWA manifest link
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);

    // Add mobile viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Add theme color meta tags
    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#2563eb';
    document.head.appendChild(themeColorMeta);

    const msApplicationTileColor = document.createElement('meta');
    msApplicationTileColor.name = 'msapplication-TileColor';
    msApplicationTileColor.content = '#2563eb';
    document.head.appendChild(msApplicationTileColor);

    // Add apple-mobile-web-app meta tags
    const appleMobileCapable = document.createElement('meta');
    appleMobileCapable.name = 'apple-mobile-web-app-capable';
    appleMobileCapable.content = 'yes';
    document.head.appendChild(appleMobileCapable);

    const appleStatusBarStyle = document.createElement('meta');
    appleStatusBarStyle.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusBarStyle.content = 'default';
    document.head.appendChild(appleStatusBarStyle);

    const appleTitle = document.createElement('meta');
    appleTitle.name = 'apple-mobile-web-app-title';
    appleTitle.content = 'PCAF Engine';
    document.head.appendChild(appleTitle);

    // Cleanup function
    return () => {
      document.head.removeChild(manifestLink);
      document.head.removeChild(themeColorMeta);
      document.head.removeChild(msApplicationTileColor);
      document.head.removeChild(appleMobileCapable);
      document.head.removeChild(appleStatusBarStyle);
      document.head.removeChild(appleTitle);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin mx-auto border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

return (
  <DealPipelineProvider>
    <QueryClientProvider client={queryClient}>
      <PortfolioProvider>
        <ThemeProvider defaultTheme="system" storageKey="peercarbon-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <BrowserRouter>
              <Routes>
                {/* Public route for authentication */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Approval status check for authenticated users */}
                
                {/* Protected routes */}
                <Route 
                  path="/financed-emissions/*" 
                  element={
                    <ProtectedRoute>
                      <PlatformProvider>
                        {/* AssumptionsProvider wraps FE routes to make data available */}
                        <AssumptionsProvider>
                          <FinancedEmissionsRoutes />
                        </AssumptionsProvider>
                      </PlatformProvider>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/platform-selection" 
                  element={
                    <ProtectedRoute>
                      <PlatformProvider>
                        <PlatformSelection />
                      </PlatformProvider>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/pcaf-asset-class" 
                  element={
                    <ProtectedRoute>
                      <PlatformProvider>
                        <PCAFAssetClassSelection />
                      </PlatformProvider>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/amortization-settings" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<div className="min-h-[120px] flex items-center justify-center">Loading…</div>}>
                        <AmortizationSettings />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Root and authenticated routes */}
                <Route 
                  path="/*" 
                  element={
                    user ? (
                      <ProtectedRoute>
                        <PlatformProvider>
                          <PlatformRoutes />
                        </PlatformProvider>
                      </ProtectedRoute>
                    ) : (
                      <LandingPage />
                    )
                  } 
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </PortfolioProvider>
    </QueryClientProvider>
  </DealPipelineProvider>
);
}

export default App;