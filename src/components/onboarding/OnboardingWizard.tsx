import React from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { PCAFMethodologyIntro } from './PCAFMethodologyIntro';
import { DataUploadTutorial } from './DataUploadTutorial';
import { EmissionCalculatorGuide } from './EmissionCalculatorGuide';
import { ReportWorkflowGuide } from './ReportWorkflowGuide';

export function OnboardingWizard() {
  const {
    phases,
    currentPhase,
    currentStep,
    isOnboardingActive,
    completeStep,
    skipStep,
    setCurrentPhase,
    setCurrentStep,
    dismissOnboarding,
  } = useOnboarding();

  if (!isOnboardingActive || !currentPhase) {
    return null;
  }

  const activePhase = phases.find(p => p.id === currentPhase);
  const activeStep = activePhase?.steps.find(s => s.id === currentStep);
  
  if (!activePhase || !activeStep) {
    return null;
  }

  const totalSteps = phases.reduce((total, phase) => total + phase.steps.length, 0);
  const completedSteps = phases.reduce((total, phase) => 
    total + phase.steps.filter(step => step.completed).length, 0
  );
  const progressPercent = (completedSteps / totalSteps) * 100;

  const handleNext = () => {
    completeStep(activeStep.id);
    
    const currentStepIndex = activePhase.steps.findIndex(s => s.id === currentStep);
    const nextStepIndex = currentStepIndex + 1;
    
    if (nextStepIndex < activePhase.steps.length) {
      setCurrentStep(activePhase.steps[nextStepIndex].id);
    } else {
      const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);
      const nextPhaseIndex = currentPhaseIndex + 1;
      
      if (nextPhaseIndex < phases.length) {
        setCurrentPhase(phases[nextPhaseIndex].id);
        setCurrentStep(phases[nextPhaseIndex].steps[0].id);
      } else {
        dismissOnboarding();
      }
    }
  };

  const handleSkip = () => {
    if (!activeStep.required) {
      skipStep(activeStep.id);
      handleNext();
    }
  };

  const renderStepContent = () => {
    switch (activeStep.id) {
      case 'welcome':
      case 'asset-classes':
      case 'data-quality':
        return <PCAFMethodologyIntro stepId={activeStep.id} />;
      case 'data-requirements':
      case 'upload-tutorial':
      case 'sample-data':
        return <DataUploadTutorial stepId={activeStep.id} />;
      case 'pcaf-calculator':
      case 'emission-factors':
        return <EmissionCalculatorGuide stepId={activeStep.id} />;
      case 'report-templates':
      case 'report-workflow':
        return <ReportWorkflowGuide stepId={activeStep.id} />;
      default:
        return <div>Step content not found</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-0">
      <Card className="w-full max-w-4xl h-[min(90vh,calc(100vh-2rem))] max-h-[90vh] overflow-hidden flex flex-col min-h-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            <CardTitle className="text-xl">
              {activePhase.title}: {activeStep.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {activeStep.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeStep.required && (
              <Badge variant="secondary">Required</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissOnboarding}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 flex flex-col space-y-6 bg-card">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedSteps} of {totalSteps} steps</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <ScrollArea className="flex-1 min-h-0 pr-2">
            <div className="min-h-[400px] py-0.5">
              {renderStepContent()}
            </div>
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={`w-3 h-3 rounded-full ${
                    phase.completed
                      ? 'bg-green-500'
                      : phase.id === currentPhase
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {!activeStep.required && (
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext}>
                {activeStep.completed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Continue
                  </>
                ) : (
                  <>
                    Complete & Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}