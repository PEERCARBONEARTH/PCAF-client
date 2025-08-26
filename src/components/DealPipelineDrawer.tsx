
import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useDealPipeline, ProjectType } from "@/contexts/DealPipelineContext";
import { 
  Briefcase, 
  Trash2, 
  Download, 
  Share2, 
  ArrowUpRight, 
  Star,
  Banknote,
  Zap,
  TrendingUp,
  BarChart3,
  MapPin,
  Clock,
  Calendar,
  CheckSquare,
  FileText,
  AlertTriangle
} from "lucide-react";

export function DealPipelineDrawer() {
  const navigate = useNavigate();
  const { 
    pipelineProjects, 
    removeFromPipeline, 
    clearPipeline, 
    pipelineCount,
    selectedForComparison,
    toggleForComparison,
    clearComparison
  } = useDealPipeline();
  
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const totalFunding = pipelineProjects
    .reduce((sum, project) => sum + parseInt(project.funding.replace(/[^0-9]/g, '')), 0);
    
  const handleCompareProjects = () => {
    // In a real implementation, this would navigate to a comparison view
    // For now, we'll just close the drawer
    setOpen(false);
  };
  
  const handleExportPipeline = () => {
    // Simulated export functionality
    const exportData = {
      exportDate: new Date().toISOString(),
      projects: pipelineProjects.map(p => ({
        id: p.id,
        name: p.name,
        location: p.location,
        funding: p.funding,
        status: p.status
      }))
    };
    
    // Create a download link for the JSON data
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "deal-pipeline.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/10 text-green-600";
      case "Planning": return "bg-blue-500/10 text-blue-600";
      case "Completed": return "bg-gray-500/10 text-gray-600";
      case "On Hold": return "bg-yellow-500/10 text-yellow-600";
      case "Concept": return "bg-purple-500/10 text-purple-600";
      case "Due Diligence": return "bg-amber-500/10 text-amber-600";
      case "Approved": return "bg-teal-500/10 text-teal-600";
      case "Rejected": return "bg-red-500/10 text-red-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Briefcase className="h-4 w-4 mr-2" />
          Deal Pipeline
          {pipelineCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
              {pipelineCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md md:max-w-lg">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Your Deal Pipeline
            <Badge variant="outline" className="ml-2">
              {pipelineCount} project{pipelineCount !== 1 ? 's' : ''}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        {pipelineCount > 0 ? (
          <>
            <div className="flex justify-between items-center my-4">
              <div>
                <p className="text-sm font-medium">Total Funding</p>
                <p className="text-2xl font-bold">${(totalFunding/1000).toFixed(1)}K</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportPipeline}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearPipeline}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="comparison">
                  Compare
                  {selectedForComparison.length > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                      {selectedForComparison.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notes">Notes & Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="h-[60vh]">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {pipelineProjects.map((project) => (
                      <div key={project.id} className="p-4 rounded-sm border border-border hover:border-primary/50 bg-background/50 transition-all duration-300">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{project.name}</h3>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {project.location}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleForComparison(project.id)}
                            >
                              <CheckSquare className={`h-4 w-4 ${selectedForComparison.includes(project.id) ? 'text-primary fill-primary' : ''}`} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeFromPipeline(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Funding</p>
                            <p className="font-medium flex items-center gap-1">
                              <Banknote className="h-3 w-3 text-primary" />
                              {project.funding}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">ROI</p>
                            <p className="font-medium flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-success" />
                              {project.roi || '12-15%'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Carbon Credits</p>
                            <p className="font-medium flex items-center gap-1">
                              <Zap className="h-3 w-3 text-green-500" />
                              {project.carbonCredits || '~300 tCO₂e'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Timeline</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-blue-500" />
                              {project.investmentTimeline || '18 months'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="space-y-1 w-full">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Completion</span>
                              <span>{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1.5" />
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="ml-3"
                            onClick={() => navigate(`/green-finance/projects/${project.id}`)}
                          >
                            Site Details
                            <ArrowUpRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="comparison" className="h-[60vh]">
                {selectedForComparison.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{selectedForComparison.length} projects selected</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCompareProjects}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Compare Projects
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearComparison}
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[calc(60vh-60px)] pr-4">
                      <div className="space-y-4">
                        {pipelineProjects
                          .filter(p => selectedForComparison.includes(p.id))
                          .map((project) => (
                            <div key={project.id} className="p-4 rounded-sm border border-primary bg-primary/5 transition-all duration-300">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">{project.name}</h3>
                                    <Badge className={getStatusColor(project.status)}>
                                      {project.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {project.location}
                                  </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => toggleForComparison(project.id)}
                                >
                                  <CheckSquare className="h-4 w-4 text-primary fill-primary" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 mt-2">
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
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Projects Selected</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Select projects from your pipeline to compare them side by side.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="notes" className="h-[60vh]">
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Notes Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    In the future, you'll be able to add notes and tasks for each project in your pipeline.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8">
            <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-medium mb-2">Your Pipeline is Empty</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-8">
              Add projects to your pipeline to track potential investment opportunities.
            </p>
            <SheetClose asChild>
              <Button>
                Browse Projects
              </Button>
            </SheetClose>
          </div>
        )}
        
        <SheetFooter className="flex justify-between sm:justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            {pipelineCount > 0 
              ? `Last updated: ${new Date().toLocaleDateString()}`
              : 'Start building your investment pipeline'}
          </p>
          <SheetClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
