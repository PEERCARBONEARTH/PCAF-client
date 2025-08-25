
import { useState } from "react";
import { DealPipelineProvider, useDealPipeline } from "@/contexts/DealPipelineContext";
import { PipelineActionButton } from "@/components/PipelineActionButton";
import { DealPipelineDrawer } from "@/components/DealPipelineDrawer";
import { ProjectQuickPreview } from "@/components/ProjectQuickPreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Leaf,
  Filter,
  Search,
  ArrowUpDown,
  Grid3X3,
  List,
  ChefHat,
  Utensils,
  School
} from "lucide-react";

// Country flag mapping
const countryFlags = {
  "Kenya": "🇰🇪",
  "Uganda": "🇺🇬", 
  "Tanzania": "🇹🇿",
  "Rwanda": "🇷🇼",
  "Ethiopia": "🇪🇹",
  "Burundi": "🇧🇮"
};

// ECOBOX Kitchen deployment data organized by cohorts
const ecoboxDeployments = [
  {
    id: "1",
    name: "St. Mary's Primary School - ECOBOX Kitchen",
    location: "Nairobi, Kenya",
    country: "Kenya" as keyof typeof countryFlags,
    status: "Active",
    progress: 85,
    funding: "$45K",
    beneficiaries: "850 students",
    cohort: "East Africa Cohort 1",
    category: "ECOBOX Kitchen",
    lastUpdated: "2024-01-15",
    milestones: { completed: 8, total: 10 },
    roi: "22-28%",
    fundingGap: "$0",
    carbonCredits: "12 tCO₂e/year",
    riskLevel: "low" as const,
    investmentTimeline: "6 months",
    mealsServed: "2,400/month",
    energySaved: "85%",
    image: "/lovable-uploads/bb941dd4-a4e2-4239-8072-067549ae7021.png"
  },
  {
    id: "2", 
    name: "Mwalimu Secondary School - ECOBOX Kitchen",
    location: "Kampala, Uganda",
    country: "Uganda" as keyof typeof countryFlags,
    status: "Seeking Funding",
    progress: 25,
    funding: "$52K",
    beneficiaries: "1,200 students",
    cohort: "East Africa Cohort 2",
    category: "ECOBOX Kitchen",
    lastUpdated: "2024-01-14",
    milestones: { completed: 2, total: 8 },
    roi: "24-30%",
    fundingGap: "$38K",
    carbonCredits: "18 tCO₂e/year",
    riskLevel: "medium" as const,
    investmentTimeline: "8 months",
    mealsServed: "3,600/month",
    energySaved: "80%",
    image: "/lovable-uploads/bb941dd4-a4e2-4239-8072-067549ae7021.png"
  },
  {
    id: "3",
    name: "Uhuru Primary School - ECOBOX Kitchen",
    location: "Dar es Salaam, Tanzania",
    country: "Tanzania" as keyof typeof countryFlags,
    status: "Pre-Development",
    progress: 10,
    funding: "$38K",
    beneficiaries: "650 students",
    cohort: "East Africa Cohort 2",
    category: "ECOBOX Kitchen",
    lastUpdated: "2024-01-13",
    milestones: { completed: 1, total: 6 },
    roi: "20-26%",
    fundingGap: "$32K",
    carbonCredits: "10 tCO₂e/year",
    riskLevel: "high" as const,
    investmentTimeline: "10 months",
    mealsServed: "1,950/month",
    energySaved: "75%",
    image: "/lovable-uploads/bb941dd4-a4e2-4239-8072-067549ae7021.png"
  },
  {
    id: "4",
    name: "Amani Girls School - ECOBOX Kitchen",
    location: "Kigali, Rwanda",
    country: "Rwanda" as keyof typeof countryFlags,
    status: "Active",
    progress: 60,
    funding: "$48K",
    beneficiaries: "920 students",
    cohort: "East Africa Cohort 1",
    category: "ECOBOX Kitchen",
    lastUpdated: "2024-01-12",
    milestones: { completed: 6, total: 10 },
    roi: "26-32%",
    fundingGap: "$8K",
    carbonCredits: "15 tCO₂e/year",
    riskLevel: "low" as const,
    investmentTimeline: "4 months",
    mealsServed: "2,760/month",
    energySaved: "88%",
    image: "/lovable-uploads/bb941dd4-a4e2-4239-8072-067549ae7021.png"
  },
  {
    id: "5",
    name: "Addis Technical College - ECOBOX Kitchen",
    location: "Addis Ababa, Ethiopia",
    country: "Ethiopia" as keyof typeof countryFlags,
    status: "Seeking Funding",
    progress: 15,
    funding: "$55K",
    beneficiaries: "1,400 students",
    cohort: "East Africa Cohort 3",
    category: "ECOBOX Kitchen",
    lastUpdated: "2024-01-11",
    milestones: { completed: 1, total: 8 },
    roi: "18-24%",
    fundingGap: "$45K",
    carbonCredits: "22 tCO₂e/year",
    riskLevel: "medium" as const,
    investmentTimeline: "12 months",
    mealsServed: "4,200/month",
    energySaved: "70%",
    image: "/lovable-uploads/bb941dd4-a4e2-4239-8072-067549ae7021.png"
  },
  {
    id: "6",
    name: "Hope Academy - ECOBOX Kitchen",
    location: "Bujumbura, Burundi",
    country: "Burundi" as keyof typeof countryFlags,
    status: "Active",
    progress: 40,
    funding: "$42K",
    beneficiaries: "720 students",
    cohort: "East Africa Cohort 3",
    category: "ECOBOX Kitchen",
    lastUpdated: "2024-01-10",
    milestones: { completed: 4, total: 12 },
    roi: "25-30%",
    fundingGap: "$12K",
    carbonCredits: "11 tCO₂e/year",
    riskLevel: "low" as const,
    investmentTimeline: "6 months",
    mealsServed: "2,160/month",
    energySaved: "82%",
    image: "/lovable-uploads/bb941dd4-a4e2-4239-8072-067549ae7021.png"
  }
];

function ViewAllOpportunities() {
  const { pipelineProjects, selectedForComparison, toggleForComparison } = useDealPipeline();
  const [selectedProject, setSelectedProject] = useState<typeof ecoboxDeployments[0] | null>(null);
  const [isDealPipelineOpen, setIsDealPipelineOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cohortFilter, setCohortFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and sort opportunities
  const filteredOpportunities = ecoboxDeployments.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesCohort = cohortFilter === "all" || project.cohort === cohortFilter;
    const matchesRisk = riskFilter === "all" || project.riskLevel === riskFilter;
    
    return matchesSearch && matchesStatus && matchesCohort && matchesRisk;
  }).sort((a, b) => {
    switch (sortBy) {
      case "funding":
        return parseInt(b.funding.replace(/[$K,M]/g, "")) - parseInt(a.funding.replace(/[$K,M]/g, ""));
      case "roi":
        return parseInt(b.roi.split("-")[1]) - parseInt(a.roi.split("-")[1]);
      case "progress":
        return b.progress - a.progress;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Seeking Funding": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Pre-Development": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getCohortColor = (cohort: string) => {
    switch (cohort) {
      case "East Africa Cohort 1": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "East Africa Cohort 2": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "East Africa Cohort 3": return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            ECOBOX Kitchen Deployments
          </h1>
          <p className="text-muted-foreground">Sustainable school kitchen solutions across East Africa</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsDealPipelineOpen(true)}
            className="relative"
          >
            Deal Pipeline
            {pipelineProjects.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pipelineProjects.length}
              </Badge>
            )}
          </Button>
          {selectedForComparison.length > 0 && (
            <Button variant="default">
              Compare ({selectedForComparison.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Seeking Funding">Seeking Funding</SelectItem>
                <SelectItem value="Pre-Development">Pre-Development</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cohortFilter} onValueChange={setCohortFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cohort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                <SelectItem value="East Africa Cohort 1">Cohort 1</SelectItem>
                <SelectItem value="East Africa Cohort 2">Cohort 2</SelectItem>
                <SelectItem value="East Africa Cohort 3">Cohort 3</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">School Name</SelectItem>
                  <SelectItem value="funding">Funding Amount</SelectItem>
                  <SelectItem value="roi">ROI</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredOpportunities.length} of {ecoboxDeployments.length} ECOBOX Kitchen deployments
        </p>
      </div>

      {/* Opportunities Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
        : "space-y-6"
      }>
        {filteredOpportunities.map((project) => (
          <Card key={project.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <Badge className={getCohortColor(project.cohort)}>
                  {project.cohort}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 text-2xl">
                {countryFlags[project.country]}
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                    <School className="h-4 w-4 text-primary" />
                    {project.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedForComparison.includes(project.id)}
                    onCheckedChange={() => toggleForComparison(project.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge className={getRiskColor(project.riskLevel)}>
                  {project.riskLevel} risk
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">{project.funding}</p>
                    <p className="text-muted-foreground">Total Cost</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{project.roi}</p>
                    <p className="text-muted-foreground">Expected ROI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium">{project.beneficiaries}</p>
                    <p className="text-muted-foreground">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-medium">{project.mealsServed}</p>
                    <p className="text-muted-foreground">Meals/Month</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Implementation Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    {project.energySaved} energy saved
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {project.investmentTimeline}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs text-muted-foreground">
                  {project.carbonCredits} carbon credits
                </div>
                
                <div className="flex flex-col gap-2">
                  <PipelineActionButton 
                    project={project} 
                    className="w-full" 
                    size="sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProject(project)}
                    className="w-full hover:bg-secondary"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No ECOBOX deployments found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {selectedProject && (
        <ProjectQuickPreview
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onViewDetail={() => {
            setSelectedProject(null);
            // Navigate to detailed project view
          }}
        />
      )}

      <DealPipelineDrawer />
    </div>
  );
}

// Wrap the component with DealPipelineProvider
export default function ViewAllOpportunitiesWrapper() {
  return (
    <DealPipelineProvider>
      <ViewAllOpportunities />
    </DealPipelineProvider>
  );
}
