import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Eye,
  Download,
  Upload,
  MessageSquare,
  Users
} from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  action?: () => Promise<void>;
  dependencies?: string[];
}

interface ActionWorkflow {
  id: string;
  title: string;
  description: string;
  category: "review" | "configuration" | "data-processing" | "communication" | "integration";
  priority: "high" | "medium" | "low";
  progress: number;
  steps: WorkflowStep[];
  estimatedTime: string;
  nextAction?: string;
}

interface ActionWorkflowManagerProps {
  workflows: ActionWorkflow[];
  onWorkflowComplete: (workflowId: string) => void;
  onStepComplete: (workflowId: string, stepId: string) => void;
}

export function ActionWorkflowManager({ workflows, onWorkflowComplete, onStepComplete }: ActionWorkflowManagerProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "review": return <Eye className="h-4 w-4" />;
      case "configuration": return <Settings className="h-4 w-4" />;
      case "data-processing": return <FileText className="h-4 w-4" />;
      case "communication": return <MessageSquare className="h-4 w-4" />;
      case "integration": return <Upload className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "review": return "border-warning/50 bg-warning/5";
      case "configuration": return "border-primary/50 bg-primary/5";
      case "data-processing": return "border-success/50 bg-success/5";
      case "communication": return "border-info/50 bg-info/5";
      case "integration": return "border-finance/50 bg-finance/5";
      default: return "border-muted";
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "in-progress": return <Clock className="h-4 w-4 text-warning animate-pulse" />;
      case "blocked": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const executeStep = async (workflowId: string, stepId: string, action?: () => Promise<void>) => {
    setProcessingSteps(prev => new Set(prev).add(stepId));
    
    try {
      if (action) {
        await action();
      }
      
      await onStepComplete(workflowId, stepId);
      
      toast({
        title: "Step Completed",
        description: "Workflow step completed successfully. Next step is now available.",
      });

      // Check if workflow is complete
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow) {
        const completedSteps = workflow.steps.filter(s => s.status === "completed").length + 1;
        if (completedSteps === workflow.steps.length) {
          onWorkflowComplete(workflowId);
          toast({
            title: "Workflow Complete!",
            description: `${workflow.title} has been completed successfully.`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Step Failed",
        description: "Unable to complete this step. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(stepId);
        return newSet;
      });
    }
  };

  const incompleteWorkflows = workflows.filter(w => w.progress < 100);
  const completedWorkflows = workflows.filter(w => w.progress === 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Action Workflows</h2>
          <p className="text-sm text-muted-foreground">
            {incompleteWorkflows.length} active workflows • Complete end-to-end processes
          </p>
        </div>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Workflow Templates
        </Button>
      </div>

      {/* Active Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {incompleteWorkflows.map((workflow) => (
          <Card key={workflow.id} className={`transition-all duration-300 hover:shadow-lg ${getCategoryColor(workflow.category)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getCategoryIcon(workflow.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{workflow.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant={workflow.priority === "high" ? "destructive" : workflow.priority === "medium" ? "default" : "secondary"}>
                        {workflow.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Est. {workflow.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveWorkflow(activeWorkflow === workflow.id ? null : workflow.id)}
                >
                  {activeWorkflow === workflow.id ? "Collapse" : "Expand"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{workflow.progress}%</span>
                </div>
                <Progress value={workflow.progress} className="h-2" />
              </div>

              {/* Next Action */}
              {workflow.nextAction && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary">Next: {workflow.nextAction}</p>
                </div>
              )}

              {/* Workflow Steps (Expanded) */}
              {activeWorkflow === workflow.id && (
                <div className="space-y-3 pt-2">
                  <Separator />
                  <h4 className="font-medium text-foreground">Workflow Steps</h4>
                  {workflow.steps.map((step, index) => {
                    const isProcessing = processingSteps.has(step.id);
                    const canExecute = step.status === "pending" && 
                      (!step.dependencies || step.dependencies.every(dep => 
                        workflow.steps.find(s => s.id === dep)?.status === "completed"
                      ));

                    return (
                      <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <div className="mt-0.5">
                          {getStepStatusIcon(step.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-foreground">{step.title}</h5>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.dependencies && step.dependencies.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Depends on: {step.dependencies.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {step.status === "completed" && (
                            <Badge variant="outline" className="text-xs">
                              Done
                            </Badge>
                          )}
                          {canExecute && step.action && (
                            <Button
                              size="sm"
                              onClick={() => executeStep(workflow.id, step.id, step.action)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Clock className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <ArrowRight className="h-3 w-3 mr-1" />
                              )}
                              Execute
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed Workflows */}
      {completedWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Completed Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedWorkflows.slice(0, 5).map((workflow) => (
                <div key={workflow.id} className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{workflow.title}</p>
                    <p className="text-sm text-muted-foreground">Completed • All steps finished</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {incompleteWorkflows.length === 0 && completedWorkflows.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Active Workflows</h3>
            <p className="text-muted-foreground mb-4">
              All processes are up to date. New workflows will appear here when actions are needed.
            </p>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Browse Workflow Templates
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}