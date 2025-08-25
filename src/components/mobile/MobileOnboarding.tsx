import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  CheckCircle, 
  Clock, 
  Target, 
  Calculator, 
  FileText, 
  ArrowRight, 
  Play,
  ChevronLeft,
  ChevronRight,
  Zap,
  Trophy,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMobileGestures, useMobileDevice } from '@/hooks/useMobileGestures';
import { UserGoal, OnboardingStep } from '@/components/onboarding/SmartOnboarding';

interface MobileOnboardingProps {
  onComplete?: (goalId: string) => void;
  onSkip?: () => void;
}

export function MobileOnboarding({ onComplete, onSkip }: MobileOnboardingProps) {
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showGoalDetails, setShowGoalDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, orientation } = useMobileDevice();

  // Mobile-optimized goals
  const mobileGoals: UserGoal[] = [
    {
      id: 'first-calculation',
      title: 'First PCAF Calculation',
      description: 'Upload data and see emissions in 5 minutes',
      estimatedTime: 5,
      difficulty: 'beginner',
      outcomes: [
        'See total emissions (tCO₂e)',
        'Understand PCAF scores',
        'Get compliance status'
      ],
      prerequisites: [],
      steps: [
        {
          id: 'upload-data',
          title: 'Upload Portfolio',
          description: 'Add your loan data via CSV or API',
          action: 'Upload Now',
          href: '/financed-emissions/upload',
          estimatedTime: 2,
          completed: false
        },
        {
          id: 'review-results',
          title: 'Review Results',
          description: 'See your emissions calculation',
          action: 'View Dashboard',
          href: '/financed-emissions/overview',
          estimatedTime: 2,
          completed: false
        },
        {
          id: 'understand-scores',
          title: 'Understand Scores',
          description: 'Learn about PCAF data quality',
          action: 'Learn More',
          estimatedTime: 1,
          completed: false
        }
      ]
    },
    {
      id: 'improve-quality',
      title: 'Improve Data Quality',
      description: 'Enhance PCAF compliance to ≤3.0',
      estimatedTime: 15,
      difficulty: 'intermediate',
      outcomes: [
        'Achieve PCAF score ≤3.0',
        'Reduce uncertainty',
        'Better decision making'
      ],
      prerequisites: ['first-calculation'],
      steps: [
        {
          id: 'analyze-gaps',
          title: 'Find Data Gaps',
          description: 'Identify improvement opportunities',
          action: 'Analyze Now',
          estimatedTime: 5,
          completed: false
        },
        {
          id: 'enhance-data',
          title: 'Add Vehicle Data',
          description: 'Include make/model/year info',
          action: 'Update Records',
          estimatedTime: 8,
          completed: false
        },
        {
          id: 'verify-improvement',
          title: 'Check Progress',
          description: 'Confirm improved scores',
          action: 'Recalculate',
          estimatedTime: 2,
          completed: false
        }
      ]
    },
    {
      id: 'generate-report',
      title: 'Create PCAF Report',
      description: 'Generate professional compliance report',
      estimatedTime: 10,
      difficulty: 'intermediate',
      outcomes: [
        'Professional PCAF report',
        'Compliance documentation',
        'Stakeholder materials'
      ],
      prerequisites: ['first-calculation'],
      steps: [
        {
          id: 'choose-template',
          title: 'Select Template',
          description: 'Pick report format',
          action: 'Browse Templates',
          estimatedTime: 3,
          completed: false
        },
        {
          id: 'customize-report',
          title: 'Customize Report',
          description: 'Add organization details',
          action: 'Configure',
          estimatedTime: 5,
          completed: false
        },
        {
          id: 'export-share',
          title: 'Export & Share',
          description: 'Download final report',
          action: 'Export',
          estimatedTime: 2,
          completed: false
        }
      ]
    }
  ];

  const currentGoal = mobileGoals[currentGoalIndex];
  const currentStep = currentGoal?.steps[currentStepIndex];

  // Swipe gesture handling
  const { ref: gestureRef } = useMobileGestures({
    onSwipe: (gesture) => {
      if (gesture.direction === 'left' && currentGoalIndex < mobileGoals.length - 1) {
        setCurrentGoalIndex(prev => prev + 1);
        setCurrentStepIndex(0);
      } else if (gesture.direction === 'right' && currentGoalIndex > 0) {
        setCurrentGoalIndex(prev => prev - 1);
        setCurrentStepIndex(0);
      }
    }
  });

  useEffect(() => {
    const totalSteps = mobileGoals.reduce((acc, goal) => acc + goal.steps.length, 0);
    const completedSteps = mobileGoals
      .slice(0, currentGoalIndex)
      .reduce((acc, goal) => acc + goal.steps.length, 0) + currentStepIndex;
    
    setProgress((completedSteps / totalSteps) * 100);
  }, [currentGoalIndex, currentStepIndex]);

  const handleStepAction = (step: OnboardingStep) => {
    if (step.href) {
      navigate(step.href);
    }
    
    // Move to next step
    if (currentStepIndex < currentGoal.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentGoalIndex < mobileGoals.length - 1) {
      // Move to next goal
      setCurrentGoalIndex(prev => prev + 1);
      setCurrentStepIndex(0);
      
      toast({
        title: "🎉 Goal Complete!",
        description: `Great job completing "${currentGoal.title}"!`,
      });
    } else {
      // All goals completed
      onComplete?.(currentGoal.id);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else if (currentGoalIndex > 0) {
      setCurrentGoalIndex(prev => prev - 1);
      setCurrentStepIndex(mobileGoals[currentGoalIndex - 1].steps.length - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < currentGoal.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentGoalIndex < mobileGoals.length - 1) {
      setCurrentGoalIndex(prev => prev + 1);
      setCurrentStepIndex(0);
    }
  };

  if (!isMobile) {
    // Fallback to desktop onboarding
    return null;
  }

  return (
    <div 
      ref={gestureRef}
      className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4"
    >
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Welcome to PCAF</h1>
          <p className="text-sm text-muted-foreground">Let's get you started</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Goal Navigation Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {mobileGoals.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentGoalIndex(index);
              setCurrentStepIndex(0);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentGoalIndex 
                ? 'bg-primary scale-125' 
                : index < currentGoalIndex 
                  ? 'bg-green-500' 
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Current Goal Card */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                {currentGoal.id === 'first-calculation' && <Calculator className="h-4 w-4" />}
                {currentGoal.id === 'improve-quality' && <Target className="h-4 w-4" />}
                {currentGoal.id === 'generate-report' && <FileText className="h-4 w-4" />}
              </div>
              <div>
                <CardTitle className="text-lg">{currentGoal.title}</CardTitle>
                <CardDescription className="text-sm">
                  Goal {currentGoalIndex + 1} of {mobileGoals.length}
                </CardDescription>
              </div>
            </div>
            <Badge className={getDifficultyColor(currentGoal.difficulty)}>
              {currentGoal.difficulty}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm">{currentGoal.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{currentGoal.estimatedTime} min
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {currentGoal.outcomes.length} outcomes
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowGoalDetails(true)}
          >
            View Goal Details
          </Button>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStep && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{currentStep.title}</CardTitle>
              <Badge variant="outline">
                Step {currentStepIndex + 1}/{currentGoal.steps.length}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              ~{currentStep.estimatedTime} min
            </div>

            <Button 
              onClick={() => handleStepAction(currentStep)}
              className="w-full"
            >
              {currentStep.action}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePreviousStep}
          disabled={currentGoalIndex === 0 && currentStepIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex gap-1">
          {currentGoal.steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStepIndex 
                  ? 'bg-primary' 
                  : index < currentStepIndex 
                    ? 'bg-green-500' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleNextStep}
          disabled={
            currentGoalIndex === mobileGoals.length - 1 && 
            currentStepIndex === currentGoal.steps.length - 1
          }
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Goal Details Sheet */}
      <Sheet open={showGoalDetails} onOpenChange={setShowGoalDetails}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>{currentGoal.title}</SheetTitle>
            <SheetDescription>
              What you'll achieve in ~{currentGoal.estimatedTime} minutes
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Expected Outcomes:</h4>
              <ul className="space-y-2">
                {currentGoal.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Steps:</h4>
              <div className="space-y-2">
                {currentGoal.steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`p-3 rounded-lg border ${
                      index === currentStepIndex 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{step.title}</h5>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {step.estimatedTime}m
                        </span>
                        {index === currentStepIndex && (
                          <Play className="h-3 w-3 text-primary" />
                        )}
                        {index < currentStepIndex && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default MobileOnboarding;