import { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export function useOnboardingTrigger() {
  const { 
    isOnboardingComplete, 
    isOnboardingActive, 
    startOnboarding, 
    phases 
  } = useOnboarding();

  useEffect(() => {
    // Check if this is likely a first-time user
    const hasSeenOnboarding = localStorage.getItem('pcaf-onboarding-seen');
    const hasUploadedData = localStorage.getItem('pcaf-has-data'); // This would be set when user uploads data
    
    // Trigger onboarding for new users who haven't seen it and don't have data
    if (!hasSeenOnboarding && !hasUploadedData && !isOnboardingActive && !isOnboardingComplete) {
      // Small delay to let the app render first
      const timer = setTimeout(() => {
        startOnboarding();
        localStorage.setItem('pcaf-onboarding-seen', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnboardingComplete, isOnboardingActive, startOnboarding]);

  const getOnboardingProgress = () => {
    const totalSteps = phases.reduce((total, phase) => total + phase.steps.length, 0);
    const completedSteps = phases.reduce((total, phase) => 
      total + phase.steps.filter(step => step.completed).length, 0
    );
    return { completedSteps, totalSteps, percentage: (completedSteps / totalSteps) * 100 };
  };

  const getIncompleteRequiredSteps = () => {
    return phases.flatMap(phase => 
      phase.steps.filter(step => step.required && !step.completed)
    );
  };

  return {
    getOnboardingProgress,
    getIncompleteRequiredSteps,
    triggerOnboarding: startOnboarding,
  };
}