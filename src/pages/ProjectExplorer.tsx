
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ProjectFilters } from '@/components/ProjectFilters';
import { NewProjectForm } from '@/components/NewProjectForm';
import { ProjectQuickPreview } from '@/components/ProjectQuickPreview';
import { ProjectEditModal } from '@/components/ProjectEditModal';
import { ProjectActionsMenu } from '@/components/ProjectActionsMenu';
import { AssetReadinessTimeline } from '@/components/AssetReadinessTimeline';
import { DealPipelineDrawer } from '@/components/DealPipelineDrawer';
import { PipelineActionButton } from '@/components/PipelineActionButton';
import { DealPipelineProvider } from '@/contexts/DealPipelineContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Search,
  Plus,
  FolderOpen,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  Building2,
  Zap,
  Target,
  Clock,
  Package2,
  CheckCircle,
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from 'react';

const quickStats = [
  {
    label: "Total Assets in Pipeline",
    value: "847",
    subtext: "Ecobox Kitchens across East Africa",
    icon: Package2,
    trend: "+12% vs last month",
    color: "text-primary"
  },
  {
    label: "Assets Deployed",
    value: "892",
    subtext: "72% deployment rate",
    icon: CheckCircle,
    trend: "+89 this quarter",
    color: "text-success"
  },
  {
    label: "Assets Deployment Rate",
    value: "72%",
    subtext: "678 operational",
    icon: Zap,
    trend: "+5% improvement",
    color: "text-warning"
  },
  {
    label: "Total Disbursed",
    value: "$12.4M",
    subtext: "79% of allocated funds",
    icon: DollarSign,
    trend: "+$2.1M this quarter",
    color: "text-finance"
  },
  {
    label: "Pending Disbursed",
    value: "$3.2M",
    subtext: "Awaiting verification",
    icon: Clock,
    trend: "21% of total",
    color: "text-orange-600"
  },
  {
    label: "Average Deployment Time",
    value: "28 days",
    subtext: "From PO to operational",
    icon: Target,
    trend: "-3 days vs target",
    color: "text-indigo-600"
  }
];

const projectCategories = [
  {
    name: "Ecobox Cooking System",
    count: 847,
    icon: Zap,
    color: "bg-yellow-500/10 text-yellow-600"
  }
];

const featuredProjects = [
  {
    id: "PRJ-001",
    name: "Ecobox Steam Kitchen",
    location: "Nairobi County, Kenya",
    status: "Active",
    progress: 100,
    funding: "$45K",
    beneficiaries: "850",
    category: "Ecobox Cooking System",
    lastUpdated: "2 hours ago",
    milestones: { completed: 8, total: 8 },
    roi: "14-16%",
    fundingGap: "$0",
    carbonCredits: "320 tCO₂e",
    riskLevel: "low" as const,
    investmentTimeline: "12 months"
  },
  {
    id: "PRJ-002", 
    name: "Ecobox Steam Kitchen",
    location: "Arusha, Tanzania",
    status: "Active",
    progress: 80,
    funding: "$48K",
    beneficiaries: "920",
    category: "Ecobox Cooking System",
    lastUpdated: "5 hours ago",
    milestones: { completed: 6, total: 8 },
    roi: "12-15%",
    fundingGap: "$10K",
    carbonCredits: "310 tCO₂e",
    riskLevel: "medium" as const,
    investmentTimeline: "18 months"
  },
  {
    id: "PRJ-003",
    name: "Ecobox Steam Kitchen",
    location: "Kampala, Uganda",
    status: "Planning",
    progress: 30,
    funding: "$52K",
    beneficiaries: "1,100",
    category: "Ecobox Cooking System",
    lastUpdated: "1 day ago",
    milestones: { completed: 2, total: 8 },
    roi: "15-18%",
    fundingGap: "$35K",
    carbonCredits: "350 tCO₂e",
    riskLevel: "medium" as const,
    investmentTimeline: "24 months"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-green-500/10 text-green-600";
    case "Planning": return "bg-blue-500/10 text-blue-600";
    case "Completed": return "bg-gray-500/10 text-gray-600";
    case "On Hold": return "bg-yellow-500/10 text-yellow-600";
    case "Concept": return "bg-purple-500/10 text-purple-600";
    default: return "bg-gray-500/10 text-gray-600";
  }
};

export default function ProjectExplorer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = React.useState(featuredProjects);
  const [filteredProjects, setFilteredProjects] = React.useState(featuredProjects);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [selectedProjectForPreview, setSelectedProjectForPreview] = React.useState<any>(null);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = React.useState<any>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const handleApplyFilters = (filters: any) => {
    let filtered = [...projects];
    
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.location) {
      filtered = filtered.filter(p => p.location === filters.location);
    }
    
    setFilteredProjects(filtered);
    
    toast({
      title: "Filters Applied",
      description: `Found ${filtered.length} matching projects`,
    });
  };

  const handleProjectCreated = (newProject: any) => {
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    setFilteredProjects(updatedProjects);
  };

  const handleViewProject = (project: any) => {
    setSelectedProjectForPreview(project);
    setPreviewOpen(true);
  };

  const handleEditProject = (project: any) => {
    setSelectedProjectForEdit(project);
    setEditOpen(true);
  };

  const handleProjectUpdated = (updatedProject: any) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    const updatedFilteredProjects = filteredProjects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    
    setProjects(updatedProjects);
    setFilteredProjects(updatedFilteredProjects);
  };

  const handleViewDetailFromPreview = () => {
    if (selectedProjectForPreview) {
      navigate(`/green-finance/projects/${selectedProjectForPreview.id}`);
      setPreviewOpen(false);
    }
  };

  return (
    <DealPipelineProvider>
      <div className="min-h-screen bg-background">
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="border-b border-border bg-card/50">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Ecobox Kitchen Assets</h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    Deploying clean cooking infrastructure across East African schools
                  </p>
                </div>
                <div className="flex gap-3">
                  <DealPipelineDrawer />
                  
                  <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </DialogTrigger>
                    <ProjectFilters 
                      onApplyFilters={handleApplyFilters} 
                      onClose={() => setFiltersOpen(false)} 
                    />
                  </Dialog>
                  
                  <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <NewProjectForm 
                      onClose={() => setNewProjectOpen(false)}
                      onProjectCreated={handleProjectCreated}
                    />
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickStats.map((stat, index) => (
                <Card key={index} className="metric-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="metric-label">{stat.label}</p>
                        <p className="metric-value mt-2">{stat.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{stat.subtext}</p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                    {stat.trend && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm font-medium text-success">
                          {stat.trend}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Header Card with Asset Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Ecobox Kitchens Deployment
                </CardTitle>
                <CardDescription>
                  Deploying clean cooking solutions across East African schools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Ecobox Cooking Systems</h3>
                      <p className="text-sm text-muted-foreground">Sustainable, clean cooking infrastructure for schools in Kenya, Tanzania, and Uganda</p>
                    </div>
                    <Badge className="self-start md:self-auto bg-green-500/10 text-green-600 py-1 px-3">
                      847 Schools
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="p-3 rounded-sm border border-border">
                      <p className="text-xs text-muted-foreground">Deployment Focus</p>
                      <p className="font-medium">East Africa</p>
                    </div>
                    <div className="p-3 rounded-sm border border-border">
                      <p className="text-xs text-muted-foreground">Technology Partner</p>
                      <p className="font-medium">EcoTech Solutions</p>
                    </div>
                    <div className="p-3 rounded-sm border border-border">
                      <p className="text-xs text-muted-foreground">Target Impact</p>
                      <p className="font-medium">425K Beneficiaries</p>
                    </div>
                    <div className="p-3 rounded-sm border border-border">
                      <p className="text-xs text-muted-foreground">Carbon Reduction</p>
                      <p className="font-medium">~85% per kitchen</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Readiness Timeline */}
            <AssetReadinessTimeline projects={filteredProjects.map(project => ({
              id: project.id,
              schoolName: project.name,
              location: project.location,
              assetType: project.category,
              status: project.status.toLowerCase().replace(' ', '-'),
              progress: project.progress,
              orderDate: '2024-01-15',
              deploymentDate: project.status === 'Active' ? '2024-02-20' : null,
              verificationDate: project.status === 'Active' ? '2024-03-01' : null,
              serialNumber: `SN-${project.id}`,
              partnerOEM: 'EcoTech Solutions'
            }))} />

            {/* Asset Pipeline */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Investment Opportunities
                    </CardTitle>
                    <CardDescription>
                      Available Ecobox Kitchen projects seeking financing
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/green-finance/opportunities')}
                  >
                    View All Opportunities
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProjects.map((project, index) => (
                    <div key={index} className="p-4 rounded-sm border border-border bg-background/50 hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{project.name}</h3>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {project.location}
                            </span>
                            <span>ID: {project.id}</span>
                            <span>Updated {project.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <PipelineActionButton
                            project={project}
                            variant="ghost"
                            size="sm"
                            showText={false}
                            className="hover-scale"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover-scale"
                            onClick={() => handleViewProject(project)}
                            title="Quick preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover-scale"
                            onClick={() => handleEditProject(project)}
                            title="Edit project"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <ProjectActionsMenu 
                            project={project}
                            onNavigateToAssets={() => navigate(`/assets/projects/${project.id}`)}
                            onViewOnMap={() => navigate(`/map?project=${project.id}`)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Funding</p>
                          <p className="font-medium">{project.funding}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className="font-medium">{project.roi || '12-15%'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Carbon Credits</p>
                          <p className="font-medium">{project.carbonCredits || '~300 tCO₂e'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className="font-medium">{project.investmentTimeline || '18 months'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Modal Components */}
          {selectedProjectForPreview && (
            <ProjectQuickPreview
              isOpen={previewOpen}
              onClose={() => setPreviewOpen(false)}
              project={selectedProjectForPreview}
              onViewDetail={handleViewDetailFromPreview}
            />
          )}

          {selectedProjectForEdit && (
            <ProjectEditModal
              isOpen={editOpen}
              onClose={() => setEditOpen(false)}
              project={selectedProjectForEdit}
              onProjectUpdated={handleProjectUpdated}
            />
          )}
        </div>
      </div>
    </DealPipelineProvider>
  );
}
