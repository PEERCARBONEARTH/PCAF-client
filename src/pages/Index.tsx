import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Map from "@/components/Map";
import { NewProgramForm } from "@/components/NewProgramForm";
import { SustainabilityOverview } from "@/components/SustainabilityOverview";
import { IVBLogicPanel } from "@/components/IVBLogicPanel";
import { ImpactPerformanceGraph } from "@/components/ImpactPerformanceGraph";
import { EnhancedTrancheTracker } from "@/components/EnhancedTrancheTracker";
import { QuickActionButtons } from "@/components/QuickActionButtons";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAsyncData } from "@/hooks/useAsyncData";
import { ProfessionalHeader, ProfessionalButton } from "@/components/enhanced/ProfessionalHeader";
import { ProfessionalMetricCard } from "@/components/enhanced/ProfessionalMetricCard";
import { EnhancedInsightCard } from "@/components/enhanced/EnhancedInsightCard";
import { EnhancedStatusBadge } from "@/components/enhanced/EnhancedStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Leaf,
  Building2,
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  FileText,
  Download,
  Crown
} from "lucide-react";

const Index = () => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock client type - in real app, this would come from user context/API
  const [clientType] = useState<"bank" | "fund" | "standard">("bank");

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  // Enhanced mock data for comprehensive dashboard
  const metrics = [
    {
      title: "Total Capital Committed",
      value: "$2.4M",
      subtitle: "Across 12 programs",
      icon: <DollarSign className="h-5 w-5" />,
      trend: { value: "12%", isPositive: true, period: "vs last month" }
    },
    {
      title: "Capital Disbursed",
      value: "$1.8M",
      subtitle: "75% of committed",
      icon: <TrendingUp className="h-5 w-5" />,
      trend: { value: "8%", isPositive: true, period: "vs last month" }
    },
    {
      title: "CO₂e Saved (Verified)",
      value: "1,247 tCO₂e",
      icon: <Leaf className="h-5 w-5" />,
      trend: { value: "23%", isPositive: true, period: "vs last month" }
    },
    {
      title: "Active Schools",
      value: "89",
      subtitle: "Across 4 regions",
      icon: <Building2 className="h-5 w-5" />,
      trend: { value: "6%", isPositive: true, period: "vs last month" }
    }
  ];

  const recentTranches = [
    {
      id: "TRN-001",
      school: "Kibera Primary School",
      region: "Nairobi, Kenya",
      milestone: "200 cooking hours",
      amount: "$15,000",
      status: "pending" as const,
      progress: 87
    },
    {
      id: "TRN-002", 
      school: "Mwanza Secondary",
      region: "Mwanza, Tanzania",
      milestone: "150 cooking hours",
      amount: "$12,500",
      status: "active" as const,
      progress: 45
    },
    {
      id: "TRN-003",
      school: "Kampala Girls School",
      region: "Kampala, Uganda",
      milestone: "300 cooking hours",
      amount: "$18,000",
      status: "completed" as const,
      progress: 100
    }
  ];

  const handleProgramSubmit = (data: any) => {
    console.log('New program data:', data);
    toast({
      title: "Program Created",
      description: `${data.programName} has been successfully created. Next: Configure disbursement rules.`,
    });
    setProgramDialogOpen(false);
  };

  const handleReviewTranche = (trancheId: string) => {
    toast({
      title: "Review Initiated",
      description: "Opening comprehensive review workflow with approval options.",
    });
    // Navigate to detailed review flow
  };

  const handleMonitorTranche = (trancheId: string) => {
    toast({
      title: "Progress Tracking",
      description: "Viewing real-time progress monitoring with action options.",
    });
    // Navigate to monitoring dashboard with actions
  };

  const handleViewReport = (trancheId: string) => {
    toast({
      title: "Impact Report",
      description: "Generating comprehensive impact report with sharing options.",
    });
    // Navigate to report with download/share actions
  };

  const handleViewAllTranches = () => {
    toast({
      title: "Bulk Review Mode",
      description: "Opening review queue with bulk approval and filtering options.",
    });
    // Navigate to comprehensive review interface
  };

  return (
    <ErrorBoundary>
      <div className="animated-background min-h-screen">
        <div className="p-3 sm:p-5 lg:p-6 space-y-5 lg:space-y-6">
            {/* Professional Header with Enhanced Branding */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-6">
              <div className="flex-1">
                <div className="relative mb-2">
                  <h1 className="text-xl font-medium text-foreground tracking-tight">
                    Impact Dashboard
                  </h1>
                  <div className="professional-header-accent"></div>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  Advanced analytics and management for sustainable investment initiatives
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                <Button 
                  onClick={() => window.location.href = '/green-finance/portfolio-map'}
                  className="professional-btn-primary group text-sm px-4 py-2"
                >
                  <MapPin className="mr-2 h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  Portfolio Map
                </Button>
                <Button 
                  onClick={() => window.location.href = '/green-finance/impact-reports'}
                  className="professional-btn-secondary group text-sm px-4 py-2"
                >
                  <FileText className="mr-2 h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  Impact Report
                </Button>
                <Button 
                  onClick={() => window.location.href = '/green-finance/new-investment'}
                  className="professional-btn-accent group text-sm px-4 py-2"
                >
                  <Plus className="mr-2 h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  New Investment
                </Button>
              </div>
            </div>

            {/* Enhanced Metrics Grid with Staggered Animation */}
            {isLoading ? (
              <LoadingState variant="grid" count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {metrics.map((metric, index) => (
                  <div key={index} className={`stagger-${index + 1}`}>
                    <ProfessionalMetricCard {...metric} />
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Quick Insights & Regional Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
              {/* Enhanced Alert Summary */}
              <Card className="card-enhanced p-5">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-medium text-foreground">Active Alerts</h3>
                </div>
                <div className="space-y-3">
                  <div className="feature-item bg-warning/5 border-warning/20">
                    <div className="feature-dot bg-gradient-to-r from-warning to-warning-light"></div>
                    <div className="flex-1">
                      <p className="text-sm font-normal">MRV Pending</p>
                      <p className="text-xs text-muted-foreground">5 schools awaiting verification</p>
                    </div>
                    <EnhancedStatusBadge status="pending">Review</EnhancedStatusBadge>
                  </div>
                  <div className="feature-item bg-destructive/5 border-destructive/20">
                    <div className="feature-dot bg-gradient-to-r from-destructive to-destructive/60"></div>
                    <div className="flex-1">
                      <p className="text-sm font-normal">School Below Target</p>
                      <p className="text-xs text-muted-foreground">2 schools underperforming</p>
                    </div>
                    <EnhancedStatusBadge status="risk">Action Required</EnhancedStatusBadge>
                  </div>
                </div>
              </Card>

              {/* Enhanced Regional Performance */}
              <Card className="card-enhanced p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-foreground">Regional Performance</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal">Kenya</span>
                    <span className="text-sm text-muted-foreground">34 schools</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal">Tanzania</span>
                    <span className="text-sm text-muted-foreground">28 schools</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal">Uganda</span>
                    <span className="text-sm text-muted-foreground">27 schools</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "82%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal">Rwanda</span>
                    <span className="text-sm text-muted-foreground">15 schools</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-finance h-2 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
              </Card>

              {/* Enhanced Recent Approvals */}
              <Card className="card-enhanced p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <h3 className="font-medium text-foreground">Recent Approvals</h3>
                </div>
                <div className="space-y-3">
                  <div className="feature-item hover:bg-success/10">
                    <div className="feature-dot bg-gradient-to-r from-success to-success-light animate-glow-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal">Baseline Audit</p>
                      <p className="text-xs text-muted-foreground">Mombasa Technical School</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="feature-item hover:bg-finance/10">
                    <div className="feature-dot bg-gradient-to-r from-finance to-finance-light animate-glow-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal">Tranche Disbursed</p>
                      <p className="text-xs text-muted-foreground">$12,500 to Arusha Primary</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="feature-item hover:bg-primary/10">
                    <div className="feature-dot bg-gradient-to-r from-primary to-primary-glow animate-glow-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal">Carbon Credits</p>
                      <p className="text-xs text-muted-foreground">45 tCO₂ verified</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Action Buttons */}
            <QuickActionButtons />

            {/* IVB Logic Panel */}
            <IVBLogicPanel />

            {/* Impact Performance Graph */}
            <ImpactPerformanceGraph />

            {/* Enhanced Live Tranche Tracker */}
            <EnhancedTrancheTracker />

            {/* Sustainability Overview for Bank/Fund Clients */}
            {(clientType === "bank" || clientType === "fund") && (
              <SustainabilityOverview clientType={clientType} />
            )}
          </div>
        </div>
    </ErrorBoundary>
  );
};

export default Index;
