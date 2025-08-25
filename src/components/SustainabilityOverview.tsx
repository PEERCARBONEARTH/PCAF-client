import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePlatform } from "@/contexts/PlatformContext";
import { InstitutionalMetrics } from "./InstitutionalMetrics";
import { ComplianceTracker } from "./ComplianceTracker";
import { PortfolioImpactAggregation } from "./PortfolioImpactAggregation";
import { SustainabilityDataInput } from "./SustainabilityDataInput";
import { InstitutionViewDashboard } from "./InstitutionViewDashboard";
import {
  Building2,
  Target,
  TrendingUp,
  Leaf,
  FileCheck,
  Settings,
  Crown,
  Lock
} from "lucide-react";

interface SustainabilityOverviewProps {
  clientType?: "bank" | "fund" | "standard";
}

export function SustainabilityOverview({ clientType = "standard" }: SustainabilityOverviewProps) {
  // DEBUG: Component entry point
  console.log("🚀 SustainabilityOverview component starting with clientType:", clientType);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentPlatform } = usePlatform();
  const [viewMode, setViewMode] = useState<"project" | "institution">("project");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleBackToProjectView = () => {
    setViewMode("project");
    toast({
      title: "Switched to Project View",
      description: "Returned to project-level sustainability overview."
    });
  };
  
  // Show enhanced view only for bank/fund clients
  const showInstitutionalView = clientType === "bank" || clientType === "fund";

  // Debug logging
  console.log("SustainabilityOverview rendered:", { clientType, viewMode, showInstitutionalView });

  // Component mount verification
  useEffect(() => {
    console.log("✅ SustainabilityOverview component mounted successfully!");
    console.log("📊 Props received:", { clientType, showInstitutionalView });
    console.log("🔍 Current view mode:", viewMode);
    
    // Check if button will be rendered
    if (showInstitutionalView && viewMode === "project") {
      console.log("🎯 Button should be visible and clickable!");
    } else {
      console.log("⚠️ Button may not be visible due to conditions:", {
        showInstitutionalView,
        viewMode,
        buttonVisible: showInstitutionalView && viewMode === "project"
      });
    }
  }, [clientType, viewMode, showInstitutionalView]);

  const handleViewModeToggle = (checked: boolean) => {
    console.log("🔄 Toggle clicked:", checked);
    const newMode = checked ? "institution" : "project";
    setViewMode(newMode);
    
    toast({
      title: `Switched to ${newMode === "institution" ? "Institution" : "Project"} View`,
      description: `Now showing ${newMode === "institution" ? "institutional sustainability metrics and compliance tracking" : "project-level impact data and portfolio overview"}.`,
    });
  };

  const handleViewInstitutionMetrics = () => {
    console.log("🔥 BUTTON CLICKED! handleViewInstitutionMetrics called!");
    console.log("Current platform:", currentPlatform);
    console.log("Current state:", { viewMode, isLoading, clientType });
    
    if (!currentPlatform) {
      console.error("No platform selected");
      toast({
        title: "Platform Required",
        description: "Please select a platform first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Navigate to the correct platform-specific institution view
    const institutionViewPath = `/${currentPlatform}/institution-view`;
    console.log("🚀 Navigating to:", institutionViewPath);
    
    setTimeout(() => {
      navigate(institutionViewPath);
      setIsLoading(false);
      toast({
        title: "Opening Institution View",
        description: "Navigating to premium portfolio analytics dashboard.",
      });
    }, 500);
  };

  const handleExportReport = () => {
    console.log("Export Report clicked");
    toast({
      title: "Export Report",
      description: "Sustainability report export has been initiated. You'll receive an email when ready.",
    });
  };

  const handleConfigureDataClose = () => {
    console.log("Configure Data dialog closed");
    setDialogOpen(false);
    // Trigger a data refresh or update
    toast({
      title: "Configuration Updated",
      description: "Your sustainability data configuration has been saved successfully.",
    });
  };

  if (!showInstitutionalView) {
    console.log("Not showing institutional view for client type:", clientType);
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-2">
              <Target className="h-6 w-6 text-primary stroke-[2.5]" />
              Institutional Sustainability Dashboard
            </h2>
            <p className="text-sm text-muted-foreground font-medium tracking-tight">
              Comprehensive tracking of sustainability commitments, net-zero progress, and environmental impact
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-3 shadow-sm">
              <span className={`text-sm font-semibold transition-colors ${viewMode === "project" ? "text-primary" : "text-muted-foreground"}`}>
                Project View
              </span>
              <Switch
                checked={viewMode === "institution"}
                onCheckedChange={handleViewModeToggle}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`text-sm font-semibold transition-colors ${viewMode === "institution" ? "text-primary" : "text-muted-foreground"}`}>
                Institution View
              </span>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <SustainabilityDataInput 
                    clientType={clientType} 
                    onClose={handleConfigureDataClose}
                  />
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportReport}
                className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
        
        {/* Client Type Badge */}
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            <Building2 className="h-3 w-3 mr-1" />
            {clientType} Client
          </Badge>
          <Badge variant="outline">
            Net-Zero Banking Alliance Member
          </Badge>
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold">
            <Crown className="h-3 w-3 mr-1" />
            Premium Feature
          </Badge>
        </div>
      </Card>

      {/* Content based on view mode */}
      {viewMode === "institution" ? (
        <div className="space-y-6">
          {/* Quick Action Bar for Institution View */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Building2 className="h-3 w-3 mr-1" />
                  Institution View Active
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Showing comprehensive institutional sustainability metrics
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewModeToggle(false)}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Leaf className="h-4 w-4 mr-2" />
                Switch to Project View
              </Button>
            </div>
          </Card>

          {/* Institutional Metrics */}
          <InstitutionalMetrics clientType={clientType} />
          
          {/* Compliance Tracker */}
          <ComplianceTracker clientType={clientType} />
          
          {/* Portfolio Impact Aggregation */}
          <PortfolioImpactAggregation />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project View Quick Actions */}
          <Card className="p-4 bg-muted/20 border-muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-muted/50">
                  <Leaf className="h-3 w-3 mr-1" />
                  Project View Active
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Showing project-level impact data and portfolio overview
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewModeToggle(true)}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Switch to Institution View
                </Button>
              </div>
            </div>
          </Card>

          {/* Main Project View Content */}
          <Card className="p-6">
            <div className="text-center py-8">
              <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Project-Level Impact View</h3>
              <p className="text-muted-foreground mb-6">
                Access comprehensive institutional sustainability metrics, compliance tracking, and portfolio analytics with our premium dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleViewInstitutionMetrics}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 border border-yellow-300 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                  onMouseEnter={() => console.log("Button hovered")}
                  onMouseDown={() => console.log("Button pressed")}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Opening Dashboard...
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Open Premium Dashboard
                      <Badge variant="secondary" className="ml-2 bg-black/20 text-black">
                        <Lock className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => handleViewModeToggle(true)}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Switch to Institution View
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}