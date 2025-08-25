import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingPhase {
  id: string;
  title: string;
  description: string;
  steps: OnboardingStep[];
  completed: boolean;
}

interface OnboardingContextType {
  phases: OnboardingPhase[];
  currentPhase: string | null;
  currentStep: string | null;
  isOnboardingActive: boolean;
  isOnboardingComplete: boolean;
  startOnboarding: () => void;
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  setCurrentPhase: (phaseId: string) => void;
  setCurrentStep: (stepId: string) => void;
  dismissOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'pcaf-onboarding-progress';

const initialPhases: OnboardingPhase[] = [
  {
    id: 'methodology',
    title: 'PCAF Methodology',
    description: 'Learn the fundamentals of PCAF financed emissions methodology',
    completed: false,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to PCAF',
        description: 'Introduction to PCAF standard and PeerCarbon platform',
        completed: false,
        required: true,
      },
      {
        id: 'asset-classes',
        title: 'Asset Class Guide',
        description: 'Understanding motor vehicle loans and emission attribution',
        completed: false,
        required: true,
      },
      {
        id: 'data-quality',
        title: 'Data Quality Scoring',
        description: 'Learn PCAF data quality scores 1-5',
        completed: false,
        required: true,
      },
    ],
  },
  {
    id: 'data-setup',
    title: 'Data Setup',
    description: 'Configure your data sources and upload requirements',
    completed: false,
    steps: [
      {
        id: 'data-requirements',
        title: 'Data Requirements',
        description: 'Learn what data you need for PCAF calculations',
        completed: false,
        required: true,
      },
      {
        id: 'upload-tutorial',
        title: 'Upload Process',
        description: 'Step-by-step data upload walkthrough',
        completed: false,
        required: false,
      },
      {
        id: 'sample-data',
        title: 'Sample Data',
        description: 'Explore sample data to understand the platform',
        completed: false,
        required: false,
      },
    ],
  },
  {
    id: 'calculations',
    title: 'Emission Calculations',
    description: 'Configure emission factors and calculation settings',
    completed: false,
    steps: [
      {
        id: 'pcaf-calculator',
        title: 'PCAF Calculator',
        description: 'Learn how to use the PCAF carbon calculator',
        completed: false,
        required: true,
      },
      {
        id: 'emission-factors',
        title: 'Emission Factors',
        description: 'Configure regional emission factors',
        completed: false,
        required: false,
      },
    ],
  },
  {
    id: 'reporting',
    title: 'Report Generation',
    description: 'Learn to generate and customize PCAF reports',
    completed: false,
    steps: [
      {
        id: 'report-templates',
        title: 'Report Templates',
        description: 'Choose and configure report templates',
        completed: false,
        required: false,
      },
      {
        id: 'report-workflow',
        title: 'Report Workflow',
        description: 'Generate your first PCAF report',
        completed: false,
        required: false,
      },
    ],
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [phases, setPhases] = useState<OnboardingPhase[]>(initialPhases);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPhases(data.phases || initialPhases);
        setCurrentPhase(data.currentPhase);
        setCurrentStep(data.currentStep);
        setIsOnboardingActive(data.isOnboardingActive || false);
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      }
    }
  }, []);

  useEffect(() => {
    const data = {
      phases,
      currentPhase,
      currentStep,
      isOnboardingActive,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [phases, currentPhase, currentStep, isOnboardingActive]);

  const isOnboardingComplete = phases.every(phase => 
    phase.steps.filter(step => step.required).every(step => step.completed)
  );

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    if (!currentPhase) {
      setCurrentPhase(phases[0].id);
      setCurrentStep(phases[0].steps[0].id);
    }
  };

  const completeStep = (stepId: string) => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      steps: phase.steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      ),
      completed: phase.steps.every(step => 
        step.id === stepId || step.completed || !step.required
      ),
    })));
  };

  const skipStep = (stepId: string) => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      steps: phase.steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      ),
    })));
  };

  const dismissOnboarding = () => {
    setIsOnboardingActive(false);
    setCurrentPhase(null);
    setCurrentStep(null);
  };

  const resetOnboarding = () => {
    setPhases(initialPhases);
    setCurrentPhase(null);
    setCurrentStep(null);
    setIsOnboardingActive(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <OnboardingContext.Provider
      value={{
        phases,
        currentPhase,
        currentStep,
        isOnboardingActive,
        isOnboardingComplete,
        startOnboarding,
        completeStep,
        skipStep,
        setCurrentPhase,
        setCurrentStep,
        dismissOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}