
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineActionButton } from "@/components/PipelineActionButton";
import { 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar, 
  Target,
  TrendingUp,
  ExternalLink,
  Clock,
  Zap,
  FileText,
  BarChart3,
  AlertTriangle
} from "lucide-react";

interface ProjectQuickPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    location: string;
    status: string;
    progress: number;
    funding: string;
    beneficiaries: string;
    category: string;
    lastUpdated: string;
    milestones: { completed: number; total: number };
    roi?: string;
    fundingGap?: string;
    carbonCredits?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    investmentTimeline?: string;
  };
  onViewDetail: () => void;
}

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

const getRiskLevelColor = (level?: string) => {
  switch (level) {
    case "low": return "bg-green-500/10 text-green-600";
    case "medium": return "bg-yellow-500/10 text-yellow-600";
    case "high": return "bg-red-500/10 text-red-600";
    default: return "bg-blue-500/10 text-blue-600";
  }
};

export function ProjectQuickPreview({ isOpen, onClose, project, onViewDetail }: ProjectQuickPreviewProps) {
  // Set default values for investment metrics if not provided
  const enrichedProject = {
    ...project,
    roi: project.roi || '12-15%',
    fundingGap: project.fundingGap || '20%',
    carbonCredits: project.carbonCredits || '~300 tCO₂e',
    riskLevel: project.riskLevel || 'medium',
    investmentTimeline: project.investmentTimeline || '18 months'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{project.name}</DialogTitle>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Funding</span>
                </div>
                <p className="font-semibold text-lg">{project.funding}</p>
              </div>
              
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Beneficiaries</span>
                </div>
                <p className="font-semibold text-lg">{project.beneficiaries}</p>
              </div>
              
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Milestones</span>
                </div>
                <p className="font-semibold text-lg">{project.milestones.completed}/{project.milestones.total}</p>
              </div>
              
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Progress</span>
                </div>
                <p className="font-semibold text-lg">{project.progress}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{project.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Category: {project.category}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Last updated {project.lastUpdated}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Project ID: </span>
                <span className="font-mono">{project.id}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="investment" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted-foreground">Expected ROI</span>
                </div>
                <p className="font-semibold text-lg">{enrichedProject.roi}</p>
              </div>
              
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Funding Gap</span>
                </div>
                <p className="font-semibold text-lg">{enrichedProject.fundingGap}</p>
              </div>
              
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Timeline</span>
                </div>
                <p className="font-semibold text-lg">{enrichedProject.investmentTimeline}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-sm border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Risk Assessment</h3>
                </div>
                <Badge className={getRiskLevelColor(enrichedProject.riskLevel)}>
                  {enrichedProject.riskLevel?.toUpperCase() || "MEDIUM"}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Implementation Risk</span>
                    <span>Low</span>
                  </div>
                  <Progress value={30} className="h-1.5" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Financial Risk</span>
                    <span>Medium</span>
                  </div>
                  <Progress value={50} className="h-1.5" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Regulatory Risk</span>
                    <span>Low</span>
                  </div>
                  <Progress value={20} className="h-1.5" />
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-sm border border-border">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Financial Summary</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Project Cost</span>
                  <span className="font-medium">{project.funding}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Committed Funding</span>
                  <span className="font-medium">$38K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Funding Gap</span>
                  <span className="font-medium">$7K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payback Period</span>
                  <span className="font-medium">2.5 years</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Carbon Credits</span>
                </div>
                <p className="font-semibold text-lg">{enrichedProject.carbonCredits}</p>
              </div>
              
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Beneficiaries</span>
                </div>
                <p className="font-semibold text-lg">{project.beneficiaries}</p>
              </div>
              
              <div className="p-4 rounded-sm bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Impact Score</span>
                </div>
                <p className="font-semibold text-lg">87/100</p>
              </div>
            </div>
            
            <div className="p-4 rounded-sm border border-border">
              <h3 className="font-medium mb-3">Environmental Impact</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Carbon Reduction</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Firewood Saved</span>
                    <span className="font-medium">75 tonnes/year</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Water Efficiency</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-sm border border-border">
              <h3 className="font-medium mb-3">Social Impact</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Health Improvement</span>
                    <span className="font-medium">High</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Education Enhancement</span>
                    <span className="font-medium">Medium</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Community Empowerment</span>
                    <span className="font-medium">Very High</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <PipelineActionButton project={enrichedProject} />
          
          <Button onClick={onViewDetail} variant="outline" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Details
          </Button>
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
