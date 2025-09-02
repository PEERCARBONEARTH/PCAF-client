
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to PCAF Platform',
    description: 'Let\'s get you started with financed emissions tracking',
    content: (
      <div className="space-y-4">
        <p>This platform helps you track and analyze financed emissions according to PCAF standards.</p>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Calculate portfolio emissions</li>
          <li>Ensure PCAF compliance</li>
          <li>Generate regulatory reports</li>
          <li>Get AI-powered insights</li>
        </ul>
      </div>
    )
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Overview of your portfolio metrics',
    target: '[data-tour="dashboard-metrics"]',
    content: (
      <div className="space-y-2">
        <p>Here you can see key metrics for your portfolio:</p>
        <ul className="text-sm space-y-1">
          <li>• Total emissions (tCO₂e)</li>
          <li>• PCAF compliance score</li>
          <li>• Data quality indicators</li>
        </ul>
      </div>
    )
  },
  {
    id: 'ai-chat',
    title: 'AI Assistant',
    description: 'Get help anytime with our AI guide',
    target: '[data-tour="ai-chatbot"]',
    position: 'left',
    content: (
      <div className="space-y-2">
        <p>Click the chat icon to get instant help with:</p>
        <ul className="text-sm space-y-1">
          <li>• PCAF methodology questions</li>
          <li>• Data quality improvements</li>
          <li>• Compliance requirements</li>
        </ul>
      </div>
    )
  }
];

export const OnboardingTour = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  useEffect(() => {
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.position = 'relative';
        element.style.zIndex = '1000';
        element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
        element.style.borderRadius = '8px';
      }
    }
    
    return () => {
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [currentStep, step.target]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" />
      
      {/* Tour Card */}
      <Card className="fixed z-50 w-96 shadow-2xl" style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
              <Badge variant="outline">{Math.round(progress)}%</Badge>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>{step.content}</div>
          
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <Button onClick={nextStep}>
              {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < onboardingSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Hook for managing onboarding state
export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('pcaf-onboarding-completed') === 'true';
  });

  const completeOnboarding = () => {
    localStorage.setItem('pcaf-onboarding-completed', 'true');
    setHasSeenOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('pcaf-onboarding-completed');
    setHasSeenOnboarding(false);
  };

  return {
    hasSeenOnboarding,
    completeOnboarding,
    resetOnboarding,
    shouldShowOnboarding: !hasSeenOnboarding
  };
};
