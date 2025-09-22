// React hook for consuming AI insights with automatic updates
import { useState, useEffect, useCallback } from 'react';
import { aiInsightsService, AIInsightsState, AIInsightsConfig } from '../services/aiInsightsService';
import { InsightNarrative } from '../services/aiInsightsNarrativeService';

export interface UseAIInsightsOptions {
  userRole?: string;
  autoRefresh?: boolean;
  refreshIntervalMinutes?: number;
  loadOnMount?: boolean;
}

export interface UseAIInsightsReturn {
  insights: InsightNarrative | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  dataVersion: string;
  hasRecentInsights: boolean;
  refreshInsights: () => Promise<void>;
  loadInsightsForRole: (role: string) => Promise<void>;
  summary: {
    hasInsights: boolean;
    lastUpdated: string | null;
    keyTakeaway: string | null;
    isStale: boolean;
  };
}

export function useAIInsights(options: UseAIInsightsOptions = {}): UseAIInsightsReturn {
  const {
    userRole = 'risk_manager',
    autoRefresh = true,
    refreshIntervalMinutes = 30,
    loadOnMount = true
  } = options;

  const [state, setState] = useState<AIInsightsState>(aiInsightsService.getState());

  // Subscribe to AI insights updates
  useEffect(() => {
    const unsubscribe = aiInsightsService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Update service configuration when options change
  useEffect(() => {
    const config: Partial<AIInsightsConfig> = {
      userRole,
      autoRefresh,
      refreshIntervalMinutes
    };

    aiInsightsService.updateConfig(config);
  }, [userRole, autoRefresh, refreshIntervalMinutes]);

  // Load insights on mount if requested
  useEffect(() => {
    if (loadOnMount && !state.insights && !state.isLoading) {
      aiInsightsService.refreshInsights(userRole);
    }
  }, [loadOnMount, userRole, state.insights, state.isLoading]);

  // Memoized refresh function
  const refreshInsights = useCallback(async () => {
    await aiInsightsService.refreshInsights(userRole);
  }, [userRole]);

  // Memoized load for role function
  const loadInsightsForRole = useCallback(async (role: string) => {
    await aiInsightsService.loadInsightsForRole(role);
  }, []);

  // Check if insights are recent
  const hasRecentInsights = aiInsightsService.hasRecentInsights(refreshIntervalMinutes);

  // Get insights summary
  const summary = aiInsightsService.getInsightsSummary();

  return {
    insights: state.insights,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    dataVersion: state.dataVersion,
    hasRecentInsights,
    refreshInsights,
    loadInsightsForRole,
    summary
  };
}

// Specialized hook for different user roles
export function useExecutiveInsights(options: Omit<UseAIInsightsOptions, 'userRole'> = {}) {
  return useAIInsights({ ...options, userRole: 'executive' });
}

export function useRiskManagerInsights(options: Omit<UseAIInsightsOptions, 'userRole'> = {}) {
  return useAIInsights({ ...options, userRole: 'risk_manager' });
}

export function useComplianceInsights(options: Omit<UseAIInsightsOptions, 'userRole'> = {}) {
  return useAIInsights({ ...options, userRole: 'compliance_officer' });
}

export function useLoanOfficerInsights(options: Omit<UseAIInsightsOptions, 'userRole'> = {}) {
  return useAIInsights({ ...options, userRole: 'loan_officer' });
}

export function useDataAnalystInsights(options: Omit<UseAIInsightsOptions, 'userRole'> = {}) {
  return useAIInsights({ ...options, userRole: 'data_analyst' });
}