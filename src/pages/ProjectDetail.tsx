import { useParams, useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { useDealPipeline, type ProjectType } from "@/contexts/DealPipelineContext";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SiteFinancialPotential from "@/components/SiteFinancialPotential";
import SiteVerificationStatus from "@/components/SiteVerificationStatus";
import SiteMRVDataFeed from "@/components/SiteMRVDataFeed";
import { 
  ArrowLeft,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Zap,
  Activity,
  CheckCircle,
  BarChart3,
  Download,
  Share,
  Settings,
  Wifi,
  Timer,
  Target,
  Leaf,
  Shield
} from "lucide-react";

// Extended project interface for full details
interface ExtendedProject extends ProjectType {
  description?: string;
  startDate?: string;
  expectedCompletion?: string;
  totalUnits?: number;
  deployedUnits?: number;
  totalCapacity?: string;
  monthlySavings?: string;
  co2Reduction?: string;
  totalDisbursed?: string;
  systemUptime?: string;
  verificationStatus?: string;
  schoolFinancials?: {
    payAsYouCookRevenue: string;
    annualRevenue: string;
    carbonCreditsEarned: string;
    carbonCreditValue: string;
    fuelCostSavings: string;
    totalAnnualBenefit: string;
    paybackPeriod: string;
    roi: string;
  };
  asset?: {
    id: string;
    siteName: string;
    model: string;
    status: string;
    efficiency: number;
    currentOutput: string;
    temperature: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
    case "Operational": 
      return "status-active";
    case "Planning": 
      return "bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/15";
    case "Maintenance": 
      return "status-pending";
    case "Completed": 
      return "bg-muted/50 text-muted-foreground border border-border/30";
    default: 
      return "bg-muted/50 text-muted-foreground border border-border/30";
  }
};

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentPlatform } = usePlatform();
  const { isInPipeline, addToPipeline, pipelineProjects } = useDealPipeline();

  const handleAssetClick = (assetId: string) => {
    const assetPath = currentPlatform ? `/${currentPlatform}/assets/${assetId}/monitoring` : `/assets/${assetId}/monitoring`;
    navigate(assetPath);
  };
  
  // Find project in pipeline
  const project = projectId ? pipelineProjects.find(p => p.id === projectId) : null;

  // Check if project is in deal pipeline
  const showSiteData = project && isInPipeline(project.id);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-gentle-fade">
          <h1 className="text-hero mb-6">Project Not Found</h1>
          <p className="text-quiet mb-8 max-w-md">The project you're looking for doesn't exist in our system.</p>
          <Button 
            onClick={() => navigate(currentPlatform ? `/${currentPlatform}` : "/")}
            className="btn-organic-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  if (!showSiteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="card-featured max-w-lg text-center animate-gentle-fade padding-balanced">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-emphasis mb-4">Site Access Restricted</h1>
          <p className="text-quiet mb-8">
            This site's detailed data is only available for projects in your deal pipeline. 
            Add this project to access comprehensive financial projections, verification status, and real-time monitoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => {
                addToPipeline({
                  id: project.id,
                  name: project.name,
                  location: project.location,
                  status: project.status,
                  progress: project.progress,
                  funding: project.funding,
                  beneficiaries: project.beneficiaries,
                  category: project.category,
                  lastUpdated: new Date().toISOString().split('T')[0],
                  milestones: { completed: 4, total: 6 },
                  roi: "14-16%",
                  fundingGap: "$15K",
                  carbonCredits: "14.4 tCO₂e",
                  riskLevel: "low" as const,
                  investmentTimeline: "6 months"
                });
                window.location.reload();
              }}
              className="btn-organic-primary"
            >
              Add to Pipeline & View Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(currentPlatform ? `/${currentPlatform}` : "/")}
              className="btn-organic-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Create extended project with thoughtful mock data
  const extendedProject: ExtendedProject = {
    ...project,
    description: "Deploying a steam-powered clean cooking system to reduce fuel costs, improve air quality, and generate verified carbon credits for sustainable revenue.",
    startDate: "2024-01-15",
    expectedCompletion: "2024-12-31",
    totalUnits: 1,
    deployedUnits: 1,
    totalCapacity: "30 kW",
    monthlySavings: "$285",
    co2Reduction: "1.2 tons/month",
    totalDisbursed: "$45K",
    systemUptime: "98.5%",
    verificationStatus: "RBF-Ready",
    schoolFinancials: {
      payAsYouCookRevenue: "$1,850/month",
      annualRevenue: "$22,200",
      carbonCreditsEarned: "14.4 tCO₂e",
      carbonCreditValue: "$720/year",
      fuelCostSavings: "$3,420/year",
      totalAnnualBenefit: "$26,820",
      paybackPeriod: "2.7 years",
      roi: "37%"
    },
    asset: {
      id: "ECO-001",
      siteName: project.name,
      model: "EcoBox Pro 30kW",
      status: "Operational",
      efficiency: 94,
      currentOutput: "28.5 kW",
      temperature: "85°C"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header - Editorial Layout */}
      <div className="layout-organic space-breathe-lg">
        <div className="panel-featured card-featured animate-gentle-fade stagger-1">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(currentPlatform ? `/${currentPlatform}` : "/")}
                className="btn-organic-ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-8 w-px bg-border/30" />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-hero">{extendedProject.name}</h1>
                  <Badge className={getStatusColor(extendedProject.status)}>
                    {extendedProject.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-quiet">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {extendedProject.location}
                  </span>
                  <span className="text-data">ID: {extendedProject.id}</span>
                  <span>{extendedProject.category}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="btn-organic-secondary">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="btn-organic-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate(currentPlatform ? `/${currentPlatform}/tranches/builder?projectId=${projectId}` : `/tranches/builder?projectId=${projectId}`)}
                className="btn-organic-primary"
              >
                <Settings className="w-4 h-4 mr-2" />
                Tranche Builder
              </Button>
            </div>
          </div>
          
          <p className="text-editorial max-w-3xl">{extendedProject.description}</p>
        </div>

        {/* Status Indicator - Asymmetric Design */}
        <div className="panel-compact animate-gentle-fade stagger-2">
          <div className="card-editorial padding-top-heavy">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="text-emphasis">Pipeline Project Active</span>
            </div>
            <p className="text-quiet mb-4">
              Access comprehensive site data, financial projections, and real-time monitoring.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(currentPlatform ? `/${currentPlatform}/view-all-opportunities` : "/view-all-opportunities")}
              className="btn-organic-ghost"
            >
              View All Opportunities
            </Button>
          </div>
        </div>
      </div>

      {/* Live Metrics - Organic Grid */}
      <div className="layout-organic space-breathe-md">
        <div className="col-span-12">
          <h2 className="text-emphasis mb-6 animate-gentle-fade stagger-3">Live Performance Metrics</h2>
        </div>
        
        <div className="panel-compact animate-gentle-fade stagger-4">
          <div className="metric-card delight-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Total Investment</p>
                <p className="metric-value text-finance">{extendedProject.funding}</p>
                <p className="text-quiet mt-1">Project value</p>
              </div>
              <div className="w-12 h-12 bg-finance/10 text-finance rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="panel-compact animate-gentle-fade stagger-5">
          <div className="metric-card delight-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Impact Reach</p>
                <p className="metric-value text-success">{extendedProject.beneficiaries}</p>
                <p className="text-quiet mt-1">Students & staff</p>
              </div>
              <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="panel-compact animate-gentle-fade stagger-6">
          <div className="metric-card delight-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">System Capacity</p>
                <p className="metric-value text-primary">{extendedProject.totalCapacity}</p>
                <p className="text-quiet mt-1">Installed power</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="panel-compact animate-gentle-fade stagger-7">
          <div className="metric-card delight-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Carbon Impact</p>
                <p className="metric-value text-success">{extendedProject.co2Reduction}</p>
                <p className="text-quiet mt-1">Monthly reduction</p>
              </div>
              <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="panel-compact animate-gentle-fade stagger-8">
          <div className="metric-card delight-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Funds Disbursed</p>
                <p className="metric-value text-finance">{extendedProject.totalDisbursed}</p>
                <p className="text-quiet mt-1">Capital deployed</p>
              </div>
              <div className="w-12 h-12 bg-finance/10 text-finance rounded-full flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="panel-compact animate-gentle-fade stagger-9">
          <div className="metric-card delight-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">System Uptime</p>
                <p className="metric-value text-success">{extendedProject.systemUptime}</p>
                <p className="text-quiet mt-1">Operational status</p>
              </div>
              <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs - Human-Centered Design */}
      <div className="layout-organic space-breathe-xl">
        <div className="col-span-12">
          <Tabs defaultValue="overview" className="animate-gentle-fade">
            <TabsList className="tabs-organic grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="tab-trigger">Project Overview</TabsTrigger>
              <TabsTrigger value="financial" className="tab-trigger">Financial Potential</TabsTrigger>
              <TabsTrigger value="verification" className="tab-trigger">Verification Status</TabsTrigger>
              <TabsTrigger value="mrv" className="tab-trigger">Live MRV Data</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-breathe-lg">
              {/* Progress Overview - Wide Layout */}
              <div className="panel-wide">
                <div className="card-featured padding-balanced space-breathe-md">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <h3 className="text-emphasis">Project Progress</h3>
                  </div>
                  
                  <div className="space-breathe-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-quiet">Overall Completion</span>
                      <span className="text-data font-bold">{extendedProject.progress}%</span>
                    </div>
                    <div className="progress-organic">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${extendedProject.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                    <div className="text-center">
                      <div className="text-quiet mb-1">Start Date</div>
                      <div className="text-data font-medium">{new Date(extendedProject.startDate!).toLocaleDateString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-quiet mb-1">Expected Completion</div>
                      <div className="text-data font-medium">{new Date(extendedProject.expectedCompletion!).toLocaleDateString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-quiet mb-1">Units Deployed</div>
                      <div className="text-data font-medium">{extendedProject.deployedUnits}/{extendedProject.totalUnits}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-quiet mb-1">Monthly Savings</div>
                      <div className="text-data font-medium">{extendedProject.monthlySavings}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Compact Panel */}
              <div className="panel-compact">
                <div className="card-editorial padding-balanced text-center">
                  <div className="w-16 h-16 bg-success/10 text-success rounded-full mx-auto mb-6 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-emphasis mb-4">Site Data Access Enabled</h3>
                  <p className="text-quiet mb-6">
                    Comprehensive financial projections, verification tracking, and real-time monitoring available.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => handleAssetClick(extendedProject.asset?.id || "")}
                      className="btn-organic-primary w-full delight-scale"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Asset Monitoring
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(currentPlatform ? `/${currentPlatform}/tranches/builder?projectId=${projectId}` : `/tranches/builder?projectId=${projectId}`)}
                      className="btn-organic-secondary w-full"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Tranches
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial">
              <SiteFinancialPotential 
                projectId={extendedProject.id}
                schoolName={extendedProject.name}
              />
            </TabsContent>

            <TabsContent value="verification">
              <SiteVerificationStatus 
                projectId={extendedProject.id}
                schoolName={extendedProject.name}
              />
            </TabsContent>

            <TabsContent value="mrv">
              <SiteMRVDataFeed 
                projectId={extendedProject.id}
                schoolName={extendedProject.name}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}