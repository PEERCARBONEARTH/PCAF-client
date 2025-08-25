import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Target, Calculator, FileText, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface UserGoal {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  outcomes: string[];
  prerequisites: string[];
  steps: OnboardingStep[];
  completedAt?: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  href?: string;
  component?: React.ComponentType;
  estimatedTime: number;
  completed: boolean;
}

export interface OnboardingProgress {
  currentGoalId: string | null;
  completedGoals: string[];
  currentStepIndex: number;
  totalProgress: number; // 0-100
  timeSpent: number; // minutes
  lastActiveAt: Date;
}

// Predefined goals for Financed Emissions platform
const FINANCED_EMISSIONS_GOALS: UserGoal[] = [
  {
    id: 'first-calculation',
    title: 'Calculate Your First Portfolio Emissions',
    description: 'Upload loan data and see your PCAF-compliant emissions in 5 minutes',
    estimatedTime: 5,
    difficulty: 'beginner',
    outcomes: [
      'See total financed emissions (tCO₂e)',
      'Understand PCAF data quality scores',
      'Get compliance status overview',
      'Identify improvement opportunities'
    ],
    prerequisites: [],
    steps: [
      {
        id: 'upload-data',
        title: 'Upload Your Loan Data',
        description: 'Upload a CSV file with your loan portfolio data',
        action: 'Upload CSV file or connect via API',
        href: '/financed-emissions/upload',
        estimatedTime: 2,
        completed: false
      },
      {
        id: 'review-calculation',
        title: 'Review Your Emissions',
        description: 'See your calculated financed emissions and data quality scores',
        action: 'Review portfolio overview',
        href: '/financed-emissions/overview',
        estimatedTime: 2,
        completed: false
      },
      {
        id: 'understand-results',
        title: 'Understand Your Results',
        description: 'Learn what your PCAF scores mean and next steps',
        action: 'Explore detailed breakdown',
        href: '/financed-emissions/ledger',
        estimatedTime: 1,
        completed: false
      }
    ]
  },
  {
    id: 'improve-data-quality',
    title: 'Improve Your Data Quality Score',
    description: 'Enhance your PCAF compliance by improving data quality to ≤3.0',
    estimatedTime: 15,
    difficulty: 'intermediate',
    outcomes: [
      'Achieve PCAF score ≤ 3.0',
      'Reduce estimation uncertainty',
      'Enable better decision making',
      'Improve regulatory compliance'
    ],
    prerequisites: ['first-calculation'],
    steps: [
      {
        id: 'analyze-gaps',
        title: 'Analyze Data Gaps',
        description: 'Identify which loans need better data quality',
        action: 'Review data quality insights',
        href: '/financed-emissions/ai-insights',
        estimatedTime: 5,
        completed: false
      },
      {
        id: 'enhance-data',
        title: 'Enhance Vehicle Data',
        description: 'Add missing make/model/year information',
        action: 'Update loan records',
        href: '/financed-emissions/ledger',
        estimatedTime: 8,
        completed: false
      },
      {
        id: 'verify-improvement',
        title: 'Verify Improvements',
        description: 'Recalculate and confirm improved scores',
        action: 'Refresh calculations',
        href: '/financed-emissions/overview',
        estimatedTime: 2,
        completed: false
      }
    ]
  },
  {
    id: 'generate-report',
    title: 'Generate Your First PCAF Report',
    description: 'Create a professional PCAF-compliant report for stakeholders',
    estimatedTime: 10,
    difficulty: 'intermediate',
    outcomes: [
      'Professional PCAF report',
      'Regulatory compliance documentation',
      'Stakeholder communication materials',
      'Baseline for future tracking'
    ],
    prerequisites: ['first-calculation'],
    steps: [
      {
        id: 'select-template',
        title: 'Choose Report Template',
        description: 'Select the appropriate PCAF report template',
        action: 'Browse report templates',
        href: '/financed-emissions/reports/templates',
        estimatedTime: 3,
        completed: false
      },
      {
        id: 'customize-report',
        title: 'Customize Your Report',
        description: 'Add your organization details and preferences',
        action: 'Configure report settings',
        href: '/financed-emissions/reports',
        estimatedTime: 5,
        completed: false
      },
      {
        id: 'export-share',
        title: 'Export and Share',
        description: 'Download or share your completed report',
        action: 'Export final report',
        href: '/financed-emissions/reports',
        estimatedTime: 2,
        completed: false
      }
    ]
  }
];

interface SmartOnboardingProps {
  onComplete?: (goalId: string) => void;
  onSkip?: () => void;
}

export function SmartOnboarding({ onComplete, onSkip }: SmartOnboardingProps) {
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentGoalId: null,
    completedGoals: [],
    currentStepIndex: 0,
    totalProgress: 0,
    timeSpent: 0,
    lastActiveAt: new Date()
  });
  
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [showGoalSelection, setShowGoalSelection] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('financed-emissions-onboarding');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
        
        // Resume current goal if exists
        if (parsed.currentGoalId) {
          const goal = FINANCED_EMISSIONS_GOALS.find(g => g.id === parsed.currentGoalId);
          if (goal) {
            setSelectedGoal(goal);
            setCurrentStep(goal.steps[parsed.currentStepIndex] || null);
            setShowGoalSelection(false);
          }
        }
      } catch (error) {
        console.error('Failed to load onboarding progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('financed-emissions-onboarding', JSON.stringify(progress));
  }, [progress]);

  const handleGoalSelect = (goal: UserGoal) => {
    // Check prerequisites
    const missingPrereqs = goal.prerequisites.filter(
      prereq => !progress.completedGoals.includes(prereq)
    );
    
    if (missingPrereqs.length > 0) {
      toast({
        title: "Prerequisites Required",
        description: `Complete these goals first: ${missingPrereqs.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setSelectedGoal(goal);
    setCurrentStep(goal.steps[0]);
    setShowGoalSelection(false);
    setStartTime(new Date());
    
    setProgress(prev => ({
      ...prev,
      currentGoalId: goal.id,
      currentStepIndex: 0,
      lastActiveAt: new Date()
    }));

    toast({
      title: "Goal Started",
      description: `Let's ${goal.title.toLowerCase()}! Estimated time: ${goal.estimatedTime} minutes`,
    });
  };

  const handleStepComplete = (stepId: string) => {
    if (!selectedGoal || !currentStep) return;

    const stepIndex = selectedGoal.steps.findIndex(s => s.id === stepId);
    const nextStepIndex = stepIndex + 1;
    
    // Mark step as completed
    selectedGoal.steps[stepIndex].completed = true;
    
    if (nextStepIndex < selectedGoal.steps.length) {
      // Move to next step
      setCurrentStep(selectedGoal.steps[nextStepIndex]);
      setProgress(prev => ({
        ...prev,
        currentStepIndex: nextStepIndex,
        totalProgress: ((nextStepIndex) / selectedGoal.steps.length) * 100
      }));
    } else {
      // Goal completed
      handleGoalComplete(selectedGoal.id);
    }
  };

  const handleGoalComplete = (goalId: string) => {
    const timeSpent = startTime ? Math.round((Date.now() - startTime.getTime()) / 60000) : 0;
    
    setProgress(prev => ({
      ...prev,
      completedGoals: [...prev.completedGoals, goalId],
      currentGoalId: null,
      currentStepIndex: 0,
      totalProgress: 100,
      timeSpent: prev.timeSpent + timeSpent
    }));

    toast({
      title: "🎉 Goal Completed!",
      description: `Great job! You completed "${selectedGoal?.title}" in ${timeSpent} minutes.`,
    });

    onComplete?.(goalId);
    
    // Show goal selection for next goal
    setShowGoalSelection(true);
    setSelectedGoal(null);
    setCurrentStep(null);
  };

  const handleStepAction = (step: OnboardingStep) => {
    if (step.href) {
      navigate(step.href);
    }
    
    // Auto-mark step as completed after navigation
    setTimeout(() => {
      handleStepComplete(step.id);
    }, 1000);
  };

  const getAvailableGoals = () => {
    return FINANCED_EMISSIONS_GOALS.filter(goal => {
      const isCompleted = progress.completedGoals.includes(goal.id);
      const hasPrereqs = goal.prerequisites.every(prereq => 
        progress.completedGoals.includes(prereq)
      );
      return !isCompleted && hasPrereqs;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (showGoalSelection) {
    const availableGoals = getAvailableGoals();
    
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome to PCAF Emissions Engine</h1>
              <p className="text-muted-foreground">Choose your goal to get started with guided assistance</p>
            </div>
          </div>
          
          {progress.completedGoals.length > 0 && (
            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {progress.completedGoals.length} goals completed
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {progress.timeSpent} minutes saved
              </Badge>
            </div>
          )}
        </div>

        {/* Goal Selection */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onSelect={() => handleGoalSelect(goal)}
              isRecommended={goal.id === 'first-calculation' && progress.completedGoals.length === 0}
            />
          ))}
        </div>

        {/* Skip Option */}
        <div className="text-center pt-4 border-t">
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            Skip guided setup - I'll explore on my own
          </Button>
        </div>
      </div>
    );
  }

  // Step-by-step guidance
  if (selectedGoal && currentStep) {
    const stepProgress = ((progress.currentStepIndex) / selectedGoal.steps.length) * 100;
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  {selectedGoal.title}
                </CardTitle>
                <CardDescription>
                  Step {progress.currentStepIndex + 1} of {selectedGoal.steps.length}
                </CardDescription>
              </div>
              <Badge className={getDifficultyColor(selectedGoal.difficulty)}>
                {selectedGoal.difficulty}
              </Badge>
            </div>
            <Progress value={stepProgress} className="h-2" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Current Step */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{currentStep.title}</h3>
                <p className="text-muted-foreground">{currentStep.description}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => handleStepAction(currentStep)}
                  className="flex items-center gap-2"
                >
                  {currentStep.action}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{currentStep.estimatedTime} min
                </div>
              </div>
            </div>

            {/* Expected Outcomes */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">What you'll achieve:</h4>
              <ul className="space-y-1 text-sm">
                {selectedGoal.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowGoalSelection(true)}
              >
                Back to Goals
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => handleStepComplete(currentStep.id)}
              >
                Mark as Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

interface GoalCardProps {
  goal: UserGoal;
  onSelect: () => void;
  isRecommended?: boolean;
}

function GoalCard({ goal, onSelect, isRecommended }: GoalCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGoalIcon = (goalId: string) => {
    switch (goalId) {
      case 'first-calculation': return <Calculator className="h-5 w-5" />;
      case 'improve-data-quality': return <Target className="h-5 w-5" />;
      case 'generate-report': return <FileText className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
        isRecommended ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getGoalIcon(goal.id)}
            </div>
            <div>
              <CardTitle className="text-base">{goal.title}</CardTitle>
              {isRecommended && (
                <Badge variant="default" className="mt-1">
                  Recommended First
                </Badge>
              )}
            </div>
          </div>
          <Badge className={getDifficultyColor(goal.difficulty)}>
            {goal.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{goal.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            ~{goal.estimatedTime} min
          </div>
          <div className="text-muted-foreground">
            {goal.steps.length} steps
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">You'll achieve:</p>
          <ul className="space-y-1">
            {goal.outcomes.slice(0, 2).map((outcome, index) => (
              <li key={index} className="text-xs flex items-center gap-1">
                <CheckCircle className="h-2 w-2 text-green-600" />
                {outcome}
              </li>
            ))}
            {goal.outcomes.length > 2 && (
              <li className="text-xs text-muted-foreground">
                +{goal.outcomes.length - 2} more outcomes
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default SmartOnboarding;