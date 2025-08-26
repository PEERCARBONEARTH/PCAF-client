import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Database,
  RefreshCw,
  Eye,
  Download,
  Send,
  Filter
} from "lucide-react";

interface DataProcessingRule {
  id: string;
  name: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  validationRules: string[];
  transformations: string[];
  status: "active" | "inactive" | "error";
}

interface DataProcessingJob {
  id: string;
  name: string;
  type: "validation" | "transformation" | "integration" | "export";
  source: string;
  target?: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
  errors: string[];
  startedAt: string;
  completedAt?: string;
  autoNext?: boolean;
}

interface DataFlowManagerProps {
  jobs: DataProcessingJob[];
  rules: DataProcessingRule[];
  onJobCreate: (job: Omit<DataProcessingJob, 'id' | 'status' | 'progress' | 'recordsProcessed' | 'startedAt'>) => void;
  onJobProcess: (jobId: string) => Promise<void>;
  onJobRetry: (jobId: string) => Promise<void>;
  onJobCancel: (jobId: string) => void;
  onRuleCreate: (rule: Omit<DataProcessingRule, 'id'>) => void;
  onRuleToggle: (ruleId: string) => void;
}

export function DataFlowManager({ jobs, rules, onJobCreate, onJobProcess, onJobRetry, onJobCancel, onRuleCreate, onRuleToggle }: DataFlowManagerProps) {
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState<string>("");
  const [newJobData, setNewJobData] = useState({
    name: "",
    source: "",
    target: "",
    totalRecords: 0,
    autoNext: false
  });
  const [newRuleData, setNewRuleData] = useState({
    name: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
    validationRules: [""],
    transformations: [""],
    status: "active" as const
  });
  const [processingJobs, setProcessingJobs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleJobProcess = async (jobId: string) => {
    setProcessingJobs(prev => new Set(prev).add(jobId));
    try {
      await onJobProcess(jobId);
      toast({
        title: "Processing Complete",
        description: "Data processing job completed successfully. Next step is now available.",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Data processing job failed. Check error logs for details.",
        variant: "destructive",
      });
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleJobRetry = async (jobId: string) => {
    setProcessingJobs(prev => new Set(prev).add(jobId));
    try {
      await onJobRetry(jobId);
      toast({
        title: "Job Restarted",
        description: "Processing job has been restarted with error fixes applied.",
      });
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: "Unable to retry job. Please check configuration.",
        variant: "destructive",
      });
    } finally {
      setProcessingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const createJob = () => {
    if (!newJobData.name || !newJobData.source || !selectedJobType) return;
    
    onJobCreate({
      ...newJobData,
      type: selectedJobType as any,
      errors: [],
      totalRecords: newJobData.totalRecords || 1000
    });
    
    setNewJobData({ name: "", source: "", target: "", totalRecords: 0, autoNext: false });
    setSelectedJobType("");
    setShowJobDialog(false);
    
    toast({
      title: "Job Created",
      description: "Data processing job created and queued for execution.",
    });
  };

  const createRule = () => {
    if (!newRuleData.name || !newRuleData.description) return;
    
    onRuleCreate({
      ...newRuleData,
      validationRules: newRuleData.validationRules.filter(r => r.trim()),
      transformations: newRuleData.transformations.filter(t => t.trim())
    });
    
    setNewRuleData({
      name: "",
      description: "",
      inputFormat: "",
      outputFormat: "",
      validationRules: [""],
      transformations: [""],
      status: "active"
    });
    setShowRuleDialog(false);
    
    toast({
      title: "Rule Created",
      description: "Data processing rule created and is now available for jobs.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "processing": return "text-warning";
      case "failed": case "error": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "processing": return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case "failed": case "error": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Database className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const activeJobs = jobs.filter(j => j.status === "processing" || j.status === "pending");
  const completedJobs = jobs.filter(j => j.status === "completed");
  const failedJobs = jobs.filter(j => j.status === "failed");
  const activeRules = rules.filter(r => r.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Data Flow Manager</h2>
          <p className="text-sm text-muted-foreground">
            Process, validate, and integrate data with automated workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowRuleDialog(true)}>
            <Filter className="h-4 w-4 mr-2" />
            New Rule
          </Button>
          <Button onClick={() => setShowJobDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Active Jobs</p>
                <p className="text-lg font-bold">{activeJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-lg font-bold">{completedJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-lg font-bold">{failedJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Active Rules</p>
                <p className="text-lg font-bold">{activeRules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Processing Jobs */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-warning" />
              Active Processing Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeJobs.map((job) => (
              <div key={job.id} className="p-4 rounded-sm border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <h4 className="font-medium text-foreground">{job.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {job.type} • {job.source} → {job.target || "Output"}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{job.recordsProcessed}/{job.totalRecords} records</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {job.status === "pending" && (
                    <Button 
                      size="sm" 
                      onClick={() => handleJobProcess(job.id)}
                      disabled={processingJobs.has(job.id)}
                    >
                      Start Processing
                    </Button>
                  )}
                  {job.status === "failed" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleJobRetry(job.id)}
                      disabled={processingJobs.has(job.id)}
                    >
                      Retry with Fixes
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onJobCancel(job.id)}
                  >
                    Cancel
                  </Button>
                </div>

                {job.errors.length > 0 && (
                  <div className="mt-3 p-3 rounded bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive mb-1">Errors:</p>
                    <ul className="text-xs text-destructive space-y-1">
                      {job.errors.slice(0, 3).map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                      {job.errors.length > 3 && (
                        <li>• +{job.errors.length - 3} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Processing Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Data Processing Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-sm border border-border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{rule.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.status === "active" ? "default" : "secondary"}>
                      {rule.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onRuleToggle(rule.id)}
                    >
                      {rule.status === "active" ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                <div className="text-xs text-muted-foreground">
                  <p>{rule.inputFormat} → {rule.outputFormat}</p>
                  <p className="mt-1">{rule.validationRules.length} validation rules</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Job Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Data Processing Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Name</Label>
                <Input
                  value={newJobData.name}
                  onChange={(e) => setNewJobData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter job name..."
                />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="validation">Data Validation</SelectItem>
                    <SelectItem value="transformation">Data Transformation</SelectItem>
                    <SelectItem value="integration">Data Integration</SelectItem>
                    <SelectItem value="export">Data Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Input
                  value={newJobData.source}
                  onChange={(e) => setNewJobData(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="Data source..."
                />
              </div>
              <div className="space-y-2">
                <Label>Target (Optional)</Label>
                <Input
                  value={newJobData.target}
                  onChange={(e) => setNewJobData(prev => ({ ...prev, target: e.target.value }))}
                  placeholder="Output target..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={createJob}>Create & Queue Job</Button>
              <Button variant="outline" onClick={() => setShowJobDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Processing Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                value={newRuleData.name}
                onChange={(e) => setNewRuleData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter rule name..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newRuleData.description}
                onChange={(e) => setNewRuleData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this rule does..."
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={createRule}>Create Rule</Button>
              <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}