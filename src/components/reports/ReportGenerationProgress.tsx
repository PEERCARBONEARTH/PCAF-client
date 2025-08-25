import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Calculator, 
  Brain, 
  FileText, 
  CheckCircle, 
  Pause, 
  Play, 
  X,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface GenerationStep {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  estimatedTime: string;
  details?: string;
}

interface GenerationProgressProps {
  isGenerating: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onComplete?: (result: any) => void;
}

export function ReportGenerationProgress({ 
  isGenerating, 
  onPause, 
  onResume, 
  onCancel, 
  onComplete 
}: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedRemaining, setEstimatedRemaining] = useState(0);

  const [steps, setSteps] = useState<GenerationStep[]>([
    {
      id: 'data-collection',
      name: 'Data Collection',
      description: 'Gathering loan portfolio data and emission factors',
      icon: Database,
      status: 'pending',
      progress: 0,
      estimatedTime: '30s',
      details: 'Loading 1,247 loan records...'
    },
    {
      id: 'calculations',
      name: 'Emission Calculations',
      description: 'Computing financed emissions using PCAF methodology',
      icon: Calculator,
      status: 'pending',
      progress: 0,
      estimatedTime: '45s',
      details: 'Processing attribution factors...'
    },
    {
      id: 'ai-narratives',
      name: 'AI Narrative Generation',
      description: 'Creating intelligent insights and explanations',
      icon: Brain,
      status: 'pending',
      progress: 0,
      estimatedTime: '60s',
      details: 'Generating executive summary...'
    },
    {
      id: 'report-formatting',
      name: 'Report Assembly',
      description: 'Formatting and assembling final report documents',
      icon: FileText,
      status: 'pending',
      progress: 0,
      estimatedTime: '20s',
      details: 'Creating PDF layout...'
    }
  ]);

  // Simulate progress when generation starts
  useEffect(() => {
    if (!isGenerating || isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        let currentStepIndex = newSteps.findIndex(step => step.status === 'running');
        
        if (currentStepIndex === -1) {
          currentStepIndex = newSteps.findIndex(step => step.status === 'pending');
          if (currentStepIndex !== -1) {
            newSteps[currentStepIndex].status = 'running';
            setCurrentStep(currentStepIndex);
          }
        }

        if (currentStepIndex !== -1) {
          const step = newSteps[currentStepIndex];
          step.progress = Math.min(step.progress + Math.random() * 5, 100);
          
          // Update step details based on progress
          if (step.id === 'data-collection') {
            const loaded = Math.floor((step.progress / 100) * 1247);
            step.details = `Loading ${loaded}/1,247 loan records...`;
          } else if (step.id === 'calculations') {
            const processed = Math.floor((step.progress / 100) * 1247);
            step.details = `Calculated emissions for ${processed}/1,247 loans...`;
          } else if (step.id === 'ai-narratives') {
            if (step.progress < 30) {
              step.details = 'Analyzing portfolio composition...';
            } else if (step.progress < 60) {
              step.details = 'Generating executive insights...';
            } else {
              step.details = 'Creating compliance narratives...';
            }
          } else if (step.id === 'report-formatting') {
            if (step.progress < 50) {
              step.details = 'Creating PDF layout...';
            } else {
              step.details = 'Finalizing formatting...';
            }
          }

          if (step.progress >= 100) {
            step.status = 'completed';
            step.progress = 100;
            step.details = 'Completed successfully';
          }
        }

        // Calculate overall progress
        const completedSteps = newSteps.filter(s => s.status === 'completed').length;
        const runningStep = newSteps.find(s => s.status === 'running');
        const runningProgress = runningStep ? runningStep.progress / 100 : 0;
        const overall = ((completedSteps + runningProgress) / newSteps.length) * 100;
        setOverallProgress(overall);

        // Check if all steps are completed
        if (completedSteps === newSteps.length) {
          onComplete?.({
            success: true,
            totalTime: elapsedTime,
            generatedFiles: ['portfolio-summary.pdf', 'detailed-analysis.pdf', 'data-export.xlsx']
          });
        }

        return newSteps;
      });

      // Update estimated remaining time
      if (overallProgress > 0) {
        const totalEstimated = (elapsedTime / overallProgress) * 100;
        setEstimatedRemaining(Math.max(0, totalEstimated - elapsedTime));
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isGenerating, isPaused, elapsedTime, overallProgress, onComplete]);

  const handlePause = () => {
    setIsPaused(true);
    onPause?.();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isGenerating) return null;

  return (
    <Card className="card-featured border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="animate-spin">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Generating PCAF Report</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isPaused ? (
              <Button variant="outline" size="sm" onClick={handleResume}>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
        <CardDescription>
          Processing your portfolio data with AI-enhanced analytics
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Elapsed: {formatTime(elapsedTime)}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Remaining: ~{formatTime(Math.round(estimatedRemaining))}
              </div>
            </div>
          </div>

          {/* Step Progress */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.status === 'running';
              const isCompleted = step.status === 'completed';
              const hasError = step.status === 'error';

              return (
                <div key={step.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full border-2 transition-all ${
                    isCompleted 
                      ? 'bg-success/10 border-success text-success' 
                      : isActive 
                        ? 'bg-primary/10 border-primary text-primary animate-pulse'
                        : hasError
                          ? 'bg-destructive/10 border-destructive text-destructive'
                          : 'bg-muted/10 border-border text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : hasError ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{step.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isCompleted ? "default" : isActive ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {isCompleted ? 'Completed' : isActive ? 'Running' : hasError ? 'Error' : 'Pending'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{step.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    
                    {(isActive || isCompleted) && (
                      <div className="space-y-1">
                        <Progress value={step.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground">{step.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isPaused && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 text-warning">
                <Pause className="h-4 w-4" />
                <span className="text-sm font-medium">Generation Paused</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Click Resume to continue generating your report
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}