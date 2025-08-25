import React, { useEffect, useMemo, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronDown, ChevronUp, ListChecks, Play } from 'lucide-react';

interface OnboardingChecklistPanelProps {
  className?: string;
}

// Lightweight, persistent checklist panel to complement the modal wizard
export function OnboardingChecklistPanel({ className }: OnboardingChecklistPanelProps) {
  const {
    phases,
    isOnboardingActive,
    startOnboarding,
    isOnboardingComplete,
    setCurrentPhase,
    setCurrentStep,
  } = useOnboarding();

  const STORAGE_KEY = 'pcaf-onboarding-checklist-collapsed';
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return s === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
  }, [collapsed]);

  const { totalSteps, completedSteps, percent } = useMemo(() => {
    const total = phases.reduce((t, p) => t + p.steps.length, 0);
    const done = phases.reduce((t, p) => t + p.steps.filter(s => s.completed).length, 0);
    return { totalSteps: total, completedSteps: done, percent: total ? (done / total) * 100 : 0 };
  }, [phases]);

  if (isOnboardingComplete) return null;

  // Floating container
  return (
    <div className={"fixed right-4 bottom-4 z-50 " + (className ?? '')}>
      {/* Collapsed pill */}
      {collapsed && (
        <button
          aria-label="Expand onboarding checklist"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full bg-card/90 border border-border shadow-[var(--shadow-card)] px-3 py-2 backdrop-blur-md hover:shadow-[var(--shadow-elevated)] transition-[var(--transition-smooth)]"
        >
          <ListChecks className="h-4 w-4 text-primary" />
          <span className="text-sm">Onboarding ({completedSteps}/{totalSteps})</span>
          <ChevronUp className="h-4 w-4" />
        </button>
      )}

      {!collapsed && (
        <Card className="w-[320px] bg-card/95 backdrop-blur-md border-border shadow-[var(--shadow-elevated)]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Guided Setup</CardTitle>
              <p className="text-xs text-muted-foreground">PCAF onboarding checklist</p>
            </div>
            <button
              aria-label="Collapse onboarding checklist"
              onClick={() => setCollapsed(true)}
              className="rounded-md p-1 hover:bg-muted/40 transition-[var(--transition-smooth)]"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{completedSteps} of {totalSteps}</span>
              </div>
              <Progress value={percent} className="h-2" />
            </div>

            <div className="max-h-60 overflow-auto pr-1 space-y-3">
              {phases.map((phase) => (
                <div key={phase.id} className="rounded-md border border-border p-2 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {phase.title}
                    </div>
                    {phase.completed ? (
                      <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Done</Badge>
                    ) : (
                      <Badge variant="outline">In progress</Badge>
                    )}
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {phase.steps.map((step) => (
                      <li key={step.id} className="flex items-start gap-2">
                        <CheckCircle className={"mt-0.5 h-3.5 w-3.5 " + (step.completed ? 'text-primary' : 'text-muted-foreground')} />
                        <button
                          className="text-left text-xs hover:underline"
                          onClick={() => {
                            setCurrentPhase(phase.id);
                            setCurrentStep(step.id);
                            if (!isOnboardingActive) startOnboarding();
                          }}
                        >
                          <div className="font-medium text-foreground/90">{step.title}</div>
                          {step.required && (
                            <div className="text-[10px] text-muted-foreground">Required</div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (!isOnboardingActive) startOnboarding();
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                {isOnboardingActive ? 'Resume Wizard' : 'Start Wizard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
