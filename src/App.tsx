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
import AICoPilotPage from "./pages/financed-emissions/AICoPilot";
import ClimateRiskPage from "./pages/financed-emissions/ClimateRisk";
import ScenarioModelingPage from "./pages/financed-emissions/ScenarioModeling";
import RAGManagementPage from "./pages/financed-emissions/RAGManagement";
import FinancedEmissionsSettings from "./pages/financed-emissions/Settings";
import PortfolioDeepAnalysisPresentation from "./pages/financed-emissions/PortfolioDeepAnalysisPresentation";
import { FinancedEmissionsLayout } from "./components/FinancedEmissionsLayout";


import React, { lazy, Suspense, useEffect } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import { ConnectionStatus } from "@/components/ConnectionStatus";

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
        <Route path="ai-copilot" element={<AICoPilotPage />} />
        {/* Legacy routes redirect to unified AI insights */}
        <Route path="climate-risk" element={<Navigate to="/financed-emissions/ai-insights?tab=risk" replace />} />
        <Route path="scenario-modeling" element={<Navigate to="/financed-emissions/ai-insights?tab=scenarios" replace />} />
        <Route path="rag-management" element={<RAGManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/templates" element={<ReportTemplates />} />
        <Route path="reports/presentation/portfolio-deep-analysis" element={<PortfolioDeepAnalysisPresentation />} />
        <Route path="pcaf-calculator" element={<PCAFCalculator />} />

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

// Component to handle green finance routing with new layout
const GreenFinanceRoutes = () => {
  const { setPlatform } = usePlatform();

  // Auto-set platform to green-finance when accessing these routes
  useEffect(() => {
    console.log('Setting platform to green-finance');
    setPlatform('green-finance');
  }, [setPlatform]);

  console.log('GreenFinanceRoutes rendering');

  return (
    <PlatformLayout>
      <Routes>
        <Route index element={<Index />} />
        <Route path="tranches" element={<Tranches />} />
        <Route path="tranches/builder" element={<TrancheBuilder />} />
        <Route path="tranches/monitoring" element={<TrancheMonitoring />} />
        <Route path="reports" element={<Reporting />} />
        <Route path="projects" element={<ProjectExplorer />} />
        <Route path="opportunities" element={<ViewAllOpportunities />} />
        <Route path="projects/:projectId" element={<ProjectDetail />} />
        <Route path="alerts-risk" element={<AlertsRisk />} />
        <Route path="compliance" element={<ComplianceVault />} />
        <Route path="users" element={<UserAccess />} />
        <Route path="tasks" element={<TaskCenter />} />
        <Route path="workflows" element={<WorkflowCenter />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="pcaf-calculator" element={<PCAFCalculator />} />
        <Route path="institution-view" element={<InstitutionView />} />
        <Route path="developer" element={<DeveloperPortal />} />
        <Route path="settings" element={<Settings />} />
        <Route path="portfolio-map" element={<PortfolioMap />} />
        <Route path="impact-reports" element={<ImpactReports />} />
        <Route path="new-investment" element={<NewInvestment />} />
        <Route path="varl" element={<VARLDashboard />} />
        <Route path="asset-monitoring" element={<AssetMonitoring />} />
        <Route path="tranche-review" element={<TrancheReview />} />
        <Route path="program-configuration" element={<ProgramConfiguration />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PlatformLayout>
  );
};

// Component to handle platform-aware routing
const PlatformRoutes = () => {
  const { currentPlatform } = usePlatform();

  // If no platform is selected, show platform selection
  if (!currentPlatform) {
    return <PlatformSelection />;
  }

  // Redirect to appropriate platform
  return <Navigate to={`/${currentPlatform}`} replace />;
};

function App() {
  const { user, loading, isApproved } = useAuth();

  // Always call isApproved to maintain consistent hook order
  const userIsApproved = isApproved();

  // Initialize real-time service when user is authenticated
  useEffect(() => {
    if (user) {
      // Skip real-time connection for AI insights page to prevent WebSocket errors
      const currentPath = window.location.pathname;
      if (currentPath.includes('/ai-insights')) {
        console.log('Skipping real-time service for AI insights page');
        return;
      }

      // Delay real-time connection to avoid interfering with page load
      const connectionTimer = setTimeout(() => {
        try {
          realTimeService.connect();
        } catch (error) {
          console.warn('Real-time service connection failed, continuing without real-time features:', error);
          realTimeService.enableGracefulDegradation();
        }
      }, 3000); // Increased delay to 3 seconds

      return () => {
        clearTimeout(connectionTimer);
        try {
          realTimeService.disconnect();
        } catch (error) {
          console.warn('Error disconnecting real-time service:', error);
        }
      };
    }

    return () => {
      try {
        realTimeService.disconnect();
      } catch (error) {
        console.warn('Error disconnecting real-time service:', error);
      }
    };
  }, [user]);

  // Force re-render when authentication state changes
  useEffect(() => {
    // This effect ensures the component re-renders when auth state changes
    if (!loading) {
      // Small delay to ensure all state updates are processed
      const timer = setTimeout(() => {
        // Force a re-render by updating a dummy state if needed
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

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
              {/* Global Floating Chatbot - only show for authenticated users */}
              {user && <FloatingChatbot />}
              {/* Connection Status Indicator */}
              {user && <ConnectionStatus />}
              <BrowserRouter>
                <Routes>
                  {/* Public route for authentication */}
                  <Route path="/auth" element={<Auth />} />

                  {/* Approval status check for authenticated users */}

                  {/* Protected routes */}
                  {/* Financed Emissions Platform Routes */}
                  <Route
                    path="/financed-emissions"
                    element={<Navigate to="/financed-emissions/overview" replace />}
                  />
                  <Route
                    path="/financed-emissions/*"
                    element={
                      <ProtectedRoute>
                        <PlatformProvider>
                          <AssumptionsProvider>
                            <FinancedEmissionsRoutes />
                          </AssumptionsProvider>
                        </PlatformProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Green Finance Platform Routes */}
                  <Route
                    path="/green-finance/*"
                    element={
                      <ProtectedRoute>
                        <PlatformProvider>
                          <GreenFinanceRoutes />
                        </PlatformProvider>
                      </ProtectedRoute>
                    }
                  />

                  {/* Standalone Pages */}
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

                  {/* Root route - redirect to platform selection */}
                  <Route
                    path="/"
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

                  {/* Catch-all for unmatched routes */}
                  <Route path="*" element={<NotFound />} />
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