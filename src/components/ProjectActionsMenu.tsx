import React, { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  MoreHorizontal,
  Download,
  Share2,
  Copy,
  Archive,
  Bell,
  BarChart3,
  MapPin,
  Trash2,
  Star,
  ExternalLink
} from "lucide-react";

interface ProjectActionsMenuProps {
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
  };
  onNavigateToAssets?: () => void;
  onGenerateReport?: () => void;
  onViewOnMap?: () => void;
}

export function ProjectActionsMenu({ 
  project, 
  onNavigateToAssets, 
  onGenerateReport, 
  onViewOnMap 
}: ProjectActionsMenuProps) {
  const { toast } = useToast();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleExportData = async () => {
    toast({
      title: "Exporting Data",
      description: "Preparing project data export...",
    });

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${project.name} data has been exported to CSV.`,
      });
    }, 2000);
  };

  const handleShareProject = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/projects/${project.id}`);
      toast({
        title: "Link Copied",
        description: "Project share link copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not copy share link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateProject = () => {
    toast({
      title: "Project Duplicated",
      description: `Created a copy of ${project.name} as a template.`,
    });
  };

  const handleSetupAlerts = () => {
    toast({
      title: "Alert Setup",
      description: "Opening alert configuration for project monitoring.",
    });
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Report Generated",
        description: `Impact report for ${project.name} is ready for download.`,
      });
      
      if (onGenerateReport) {
        onGenerateReport();
      }
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleArchiveProject = () => {
    toast({
      title: "Project Archived",
      description: `${project.name} has been moved to the archive.`,
    });
  };

  const handleViewAssets = () => {
    if (onNavigateToAssets) {
      onNavigateToAssets();
    } else {
      toast({
        title: "Asset Monitoring",
        description: `Opening asset monitoring dashboard for ${project.name}.`,
      });
    }
  };

  const handleViewOnMap = () => {
    if (onViewOnMap) {
      onViewOnMap();
    } else {
      toast({
        title: "Map View",
        description: `Opening geographic view for ${project.name} in ${project.location}.`,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="hover-scale">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border-border shadow-lg">
        <DropdownMenuLabel className="font-medium">Project Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleViewAssets} className="cursor-pointer">
          <BarChart3 className="w-4 h-4 mr-2" />
          Asset Monitoring
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleViewOnMap} className="cursor-pointer">
          <MapPin className="w-4 h-4 mr-2" />
          View on Map
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSetupAlerts} className="cursor-pointer">
          <Bell className="w-4 h-4 mr-2" />
          Setup Alerts
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleGenerateReport} 
          disabled={isGeneratingReport}
          className="cursor-pointer"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGeneratingReport ? "Generating..." : "Generate Report"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportData} className="cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          Export Data
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleShareProject} className="cursor-pointer">
          <Share2 className="w-4 h-4 mr-2" />
          Share Project
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDuplicateProject} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Duplicate as Template
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleArchiveProject} className="cursor-pointer">
          <Archive className="w-4 h-4 mr-2" />
          Archive Project
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}