#!/usr/bin/env node

/**
 * Frontend Polishing Script
 * Automated improvements for user experience and code quality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Frontend Polishing Process...\n');

// Configuration
const config = {
  srcDir: './src',
  componentsDir: './src/components',
  pagesDir: './src/pages',
  servicesDir: './src/services',
  outputDir: './polished-components'
};

// Utility functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

// 1. Type Safety Improvements
function generateTypeDefinitions() {
  log('📝 Generating improved type definitions...', 'info');
  
  const commonTypes = `
// Common Types for Better Type Safety
export interface PortfolioMetrics {
  totalInstruments: number;
  totalValue: number;
  totalEmissions: number;
  avgDataQuality: number;
  emissionIntensity: number;
  pcafCompliance: number;
  esgScore: number;
  instrumentBreakdown: Record<string, number>;
  fuelTypeBreakdown: Record<string, number>;
  riskExposures: number;
  complianceRate: number;
}

export interface AIInsightData {
  id: string;
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  recommendations: AIRecommendation[];
  metadata: {
    processingTime: number;
    tokensUsed: number;
    model: string;
  };
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'data-quality' | 'emission-reduction' | 'compliance' | 'risk-management' | 'business-intelligence';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  actionable: boolean;
  actions: Array<{
    title: string;
    description: string;
    estimatedTime: string;
  }>;
  relatedLoans?: string[];
  expectedOutcome: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
  message?: string;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  actionable: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  technical?: string;
}
`;

  fs.writeFileSync('./src/types/improved-types.ts', commonTypes);
  log('✅ Type definitions generated', 'success');
}

// 2. Loading State Components
function generateLoadingComponents() {
  log('⏳ Creating enhanced loading components...', 'info');
  
  const loadingComponents = `
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Skeleton Loaders for Different Content Types
export const MetricsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="flex space-x-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex space-x-4">
        {[...Array(4)].map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// AI Processing Indicator
export const AIProcessingIndicator = ({ 
  message = "AI is analyzing your data...", 
  progress 
}: { 
  message?: string; 
  progress?: number; 
}) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
    </div>
    <div className="text-center space-y-2">
      <p className="text-sm font-medium">{message}</p>
      {progress !== undefined && (
        <div className="w-64">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
        </div>
      )}
    </div>
  </div>
);

// Smart Loading Wrapper
export const SmartLoader = ({ 
  isLoading, 
  error, 
  children, 
  skeleton,
  loadingMessage 
}: {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  loadingMessage?: string;
}) => {
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  if (isLoading) {
    return skeleton || <AIProcessingIndicator message={loadingMessage} />;
  }
  
  return <>{children}</>;
};
`;

  if (!fs.existsSync('./src/components/loading')) {
    fs.mkdirSync('./src/components/loading', { recursive: true });
  }
  
  fs.writeFileSync('./src/components/loading/LoadingComponents.tsx', loadingComponents);
  log('✅ Loading components created', 'success');
}

// 3. Error Handling Components
function generateErrorComponents() {
  log('🚨 Creating user-friendly error components...', 'info');
  
  const errorComponents = `
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, HelpCircle, ExternalLink } from "lucide-react";
import { UserFriendlyError } from "@/types/improved-types";

// User-Friendly Error Display
export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  showTechnical = false 
}: { 
  error: string | UserFriendlyError; 
  onRetry?: () => void;
  showTechnical?: boolean;
}) => {
  const errorData = typeof error === 'string' 
    ? { title: 'Something went wrong', message: error, actionable: !!onRetry }
    : error;

  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {errorData.title}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{errorData.message}</p>
        
        {(onRetry || errorData.actions) && (
          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {errorData.actions?.map((action, index) => (
              <Button 
                key={index} 
                onClick={action.action} 
                size="sm" 
                variant="outline"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
        
        {showTechnical && typeof error === 'object' && error.technical && (
          <details className="mt-2">
            <summary className="text-xs cursor-pointer">Technical Details</summary>
            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
              {error.technical}
            </pre>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Connection Error Handler
export const ConnectionError = ({ onRetry }: { onRetry: () => void }) => (
  <Card className="max-w-md mx-auto">
    <CardHeader className="text-center">
      <CardTitle className="flex items-center justify-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        Connection Issue
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center space-y-4">
      <p className="text-muted-foreground">
        We're having trouble connecting to our servers. Your data is safe.
      </p>
      <div className="flex gap-2 justify-center">
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
        <Button variant="outline" asChild>
          <a href="/help" target="_blank">
            <HelpCircle className="h-4 w-4 mr-2" />
            Get Help
          </a>
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Data Loading Error
export const DataError = ({ 
  dataType = "data", 
  onRetry 
}: { 
  dataType?: string; 
  onRetry: () => void; 
}) => (
  <ErrorDisplay
    error={{
      title: \`Unable to load \${dataType}\`,
      message: \`We couldn't retrieve your \${dataType}. This might be a temporary issue.\`,
      actionable: true,
      actions: [
        { label: 'Retry', action: onRetry },
        { label: 'Refresh Page', action: () => window.location.reload() }
      ]
    }}
  />
);

// AI Processing Error
export const AIError = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorDisplay
    error={{
      title: 'AI Analysis Unavailable',
      message: 'Our AI services are temporarily unavailable. You can still view your data and try the analysis again.',
      actionable: true,
      actions: [
        { label: 'Retry Analysis', action: onRetry },
        { label: 'View Raw Data', action: () => window.location.href = '/data' }
      ]
    }}
  />
);
`;

  if (!fs.existsSync('./src/components/errors')) {
    fs.mkdirSync('./src/components/errors', { recursive: true });
  }
  
  fs.writeFileSync('./src/components/errors/ErrorComponents.tsx', errorComponents);
  log('✅ Error components created', 'success');
}

// 4. Accessibility Improvements
function generateAccessibilityHelpers() {
  log('♿ Creating accessibility helpers...', 'info');
  
  const a11yHelpers = `
import { useEffect, useRef } from 'react';

// Screen Reader Announcements
export const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };
  
  return { announce };
};

// Focus Management
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);
  
  const focusElement = (element?: HTMLElement) => {
    const target = element || focusRef.current;
    if (target) {
      target.focus();
    }
  };
  
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  };
  
  return { focusRef, focusElement, trapFocus };
};

// Keyboard Navigation Hook
export const useKeyboardNavigation = (
  items: any[], 
  onSelect: (item: any, index: number) => void
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSelect(items[selectedIndex], selectedIndex);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  };
  
  return { selectedIndex, handleKeyDown };
};
`;

  if (!fs.existsSync('./src/hooks')) {
    fs.mkdirSync('./src/hooks', { recursive: true });
  }
  
  fs.writeFileSync('./src/hooks/useAccessibility.ts', a11yHelpers);
  log('✅ Accessibility helpers created', 'success');
}

// 5. Performance Optimization Script
function generatePerformanceOptimizations() {
  log('⚡ Creating performance optimization utilities...', 'info');
  
  const perfUtils = `
import { lazy, Suspense } from 'react';
import { LoadingComponents } from '@/components/loading/LoadingComponents';

// Lazy Loading Wrapper
export const LazyWrapper = ({ 
  component, 
  fallback 
}: { 
  component: () => Promise<{ default: React.ComponentType<any> }>; 
  fallback?: React.ReactNode; 
}) => {
  const LazyComponent = lazy(component);
  
  return (
    <Suspense fallback={fallback || <LoadingComponents.AIProcessingIndicator />}>
      <LazyComponent />
    </Suspense>
  );
};

// Bundle Splitting Recommendations
export const lazyComponents = {
  // Heavy components that should be lazy loaded
  AIInsights: () => import('@/pages/financed-emissions/AIInsights'),
  DataIngestionWizard: () => import('@/components/data-ingestion/DataIngestionWizard'),
  AdvancedAnalytics: () => import('@/components/analytics/AdvancedAnalytics'),
  ReportGenerator: () => import('@/components/reports/ReportGenerator'),
};

// Performance Monitoring
export const usePerformanceMonitoring = () => {
  const measurePerformance = (name: string, fn: () => Promise<any>) => {
    return async (...args: any[]) => {
      const start = performance.now();
      try {
        const result = await fn.apply(null, args);
        const end = performance.now();
        console.log(\`\${name} took \${end - start} milliseconds\`);
        return result;
      } catch (error) {
        const end = performance.now();
        console.error(\`\${name} failed after \${end - start} milliseconds\`, error);
        throw error;
      }
    };
  };
  
  return { measurePerformance };
};
`;

  if (!fs.existsSync('./src/utils')) {
    fs.mkdirSync('./src/utils', { recursive: true });
  }
  
  fs.writeFileSync('./src/utils/performance.tsx', perfUtils);
  log('✅ Performance utilities created', 'success');
}

// 6. User Onboarding System
function generateOnboardingSystem() {
  log('🎯 Creating user onboarding system...', 'info');
  
  const onboardingSystem = `
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
    description: 'Let\\'s get you started with financed emissions tracking',
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
`;

  if (!fs.existsSync('./src/components/onboarding')) {
    fs.mkdirSync('./src/components/onboarding', { recursive: true });
  }
  
  fs.writeFileSync('./src/components/onboarding/OnboardingSystem.tsx', onboardingSystem);
  log('✅ Onboarding system created', 'success');
}

// Main execution
async function main() {
  try {
    log('🎨 Frontend Polishing & UX Enhancement', 'info');
    log('=====================================\n', 'info');

    // Create output directory
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Run improvements
    generateTypeDefinitions();
    generateLoadingComponents();
    generateErrorComponents();
    generateAccessibilityHelpers();
    generatePerformanceOptimizations();
    generateOnboardingSystem();

    log('\n🎉 Frontend polishing complete!', 'success');
    log('\nNext steps:', 'info');
    log('1. Import and use the new components in your pages', 'info');
    log('2. Replace any types with the improved type definitions', 'info');
    log('3. Add data-tour attributes to elements for onboarding', 'info');
    log('4. Test accessibility with screen readers', 'info');
    log('5. Monitor performance improvements', 'info');

    log('\n📊 Expected improvements:', 'success');
    log('• Better type safety and fewer runtime errors', 'success');
    log('• Enhanced loading states and user feedback', 'success');
    log('• User-friendly error handling and recovery', 'success');
    log('• Improved accessibility and keyboard navigation', 'success');
    log('• Guided onboarding for new users', 'success');

  } catch (error) {
    log(`❌ Error during polishing: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateTypeDefinitions,
  generateLoadingComponents,
  generateErrorComponents,
  generateAccessibilityHelpers,
  generatePerformanceOptimizations,
  generateOnboardingSystem
};