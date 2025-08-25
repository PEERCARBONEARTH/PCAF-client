import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HelpCircle, Lightbulb, Play } from 'lucide-react';

export function OnboardingCoachBubble() {
  const location = useLocation();
  const navigate = useNavigate();
  const { startOnboarding, setCurrentPhase, setCurrentStep } = useOnboarding();
  const [open, setOpen] = useState(false);

  const tips = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/financed-emissions/ledger')) {
      return {
        title: 'Loan Ledger Tips',
        points: [
          'Hover EF chips to view emission factor provenance.',
          'Use filters to isolate data-quality outliers (score ≥ 4).',
          'Recalculate loans after updating EF region or attribution.',
        ],
        goTo: { phase: 'calculator', step: 'pcaf-calculator' },
      } as const;
    }
    if (path.startsWith('/financed-emissions/upload')) {
      return {
        title: 'Uploading Data',
        points: [
          'Download the CSV template before your first upload.',
          'Validate and preview records prior to import.',
          'Try sample data to explore the workflow quickly.',
        ],
        goTo: { phase: 'data', step: 'upload-tutorial' },
      } as const;
    }
    if (path.startsWith('/financed-emissions/reports')) {
      return {
        title: 'Reporting Guidance',
        points: [
          'Choose a PCAF template aligned with your disclosure scope.',
          'Include EF provenance and data-quality breakdowns.',
          'Export PDF for board and XLSX for auditors.',
        ],
        goTo: { phase: 'reporting', step: 'report-templates' },
      } as const;
    }
    return {
      title: 'Portfolio Overview',
      points: [
        'Start with PCAF basics to align your methodology.',
        'Check readiness: data coverage, EF regions, attribution.',
        'Use wizard to complete setup in minutes.',
      ],
      goTo: { phase: 'intro', step: 'welcome' },
    } as const;
  }, [location.pathname]);

  const openGuide = () => {
    setCurrentPhase(tips.goTo.phase as any);
    setCurrentStep(tips.goTo.step as any);
    startOnboarding();
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-[var(--shadow-elevated)] hover:shadow-[var(--shadow-strong)]"
            aria-label="Open coaching tips"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{tips.title}</h3>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {tips.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={openGuide}>
              <Play className="h-4 w-4 mr-2" /> Open Guide
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/financed-emissions/upload')}>Upload Data</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
