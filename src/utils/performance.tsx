
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
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
      } catch (error) {
        const end = performance.now();
        console.error(`${name} failed after ${end - start} milliseconds`, error);
        throw error;
      }
    };
  };
  
  return { measurePerformance };
};
