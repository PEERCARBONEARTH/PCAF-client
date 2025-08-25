
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDealPipeline, ProjectType } from "@/contexts/DealPipelineContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { ShoppingCart, CheckCircle, Plus, Briefcase, Target, TrendingUp } from "lucide-react";

interface PipelineActionButtonProps {
  project: ProjectType;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export function PipelineActionButton({ 
  project, 
  variant = "default", 
  size = "default",
  showText = true,
  className = ""
}: PipelineActionButtonProps) {
  const { addToPipeline, removeFromPipeline, isInPipeline, approveForInvestment, moveToPortfolio } = useDealPipeline();
  const { isInPortfolio, addToPortfolio } = usePortfolio();
  const { toast } = useToast();
  
  const inPipeline = isInPipeline(project.id);
  const inPortfolio = isInPortfolio(project.id);
  
  const handleToggle = () => {
    if (inPortfolio) {
      // Already in portfolio - show status
      toast({
        title: "In Portfolio",
        description: `${project.name} is already in your active portfolio.`,
      });
      return;
    }

    if (inPipeline) {
      // In pipeline - check if ready to move to portfolio
      if (project.lifecycleStatus === 'approved') {
        // Move to portfolio
        const investmentAmount = 50000; // This would come from a form in real implementation
        addToPortfolio(project, investmentAmount);
        moveToPortfolio(project.id);
      } else {
        // Remove from pipeline
        removeFromPipeline(project.id);
        toast({
          title: "Removed from Pipeline",
          description: `${project.name} has been removed from your deal pipeline.`,
          variant: "destructive",
        });
      }
    } else {
      // Add to pipeline
      addToPipeline(project);
      toast({
        title: "Added to Pipeline",
        description: `${project.name} has been added to your deal pipeline.`,
      });
    }
  };
  
  const getButtonContent = () => {
    if (inPortfolio) {
      return {
        icon: <Target className="h-4 w-4 mr-2" />,
        text: "In Portfolio",
        className: "border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-400 dark:text-blue-400"
      };
    }
    
    if (inPipeline) {
      if (project.lifecycleStatus === 'approved') {
        return {
          icon: <TrendingUp className="h-4 w-4 mr-2" />,
          text: "Move to Portfolio",
          className: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
        };
      }
      return {
        icon: <CheckCircle className="h-4 w-4 mr-2" />,
        text: "In Pipeline",
        className: "border-green-500 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:border-green-400 dark:text-green-400"
      };
    }
    
    return {
      icon: <ShoppingCart className="h-4 w-4 mr-2" />,
      text: "Add to Deal Pipeline",
      className: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
    };
  };
  
  const buttonContent = getButtonContent();
  
  return (
    <Button
      variant={inPipeline || inPortfolio ? "outline" : "default"}
      size={size}
      onClick={handleToggle}
      className={`${className} ${buttonContent.className}`}
    >
      {buttonContent.icon}
      {showText && buttonContent.text}
    </Button>
  );
}
