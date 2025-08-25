
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type ProjectLifecycleStatus = 
  | 'concept' 
  | 'planning' 
  | 'due_diligence' 
  | 'approved' 
  | 'active' 
  | 'deployed' 
  | 'completed' 
  | 'cancelled';

export type ProjectStage = 'pipeline' | 'portfolio' | 'asset_management';

export interface ProjectTransition {
  id: string;
  projectId: string;
  fromStatus: ProjectLifecycleStatus;
  toStatus: ProjectLifecycleStatus;
  fromStage: ProjectStage;
  toStage: ProjectStage;
  triggeredBy: 'manual' | 'investment_approval' | 'first_disbursement' | 'asset_deployment';
  timestamp: string;
  notes?: string;
}

export interface UseProjectLifecycleReturn {
  getProjectStage: (status: ProjectLifecycleStatus) => ProjectStage;
  canTransitionTo: (currentStatus: ProjectLifecycleStatus, targetStatus: ProjectLifecycleStatus) => boolean;
  transitionProject: (
    projectId: string, 
    currentStatus: ProjectLifecycleStatus, 
    targetStatus: ProjectLifecycleStatus,
    triggeredBy: ProjectTransition['triggeredBy'],
    notes?: string
  ) => Promise<void>;
  getTransitionHistory: (projectId: string) => ProjectTransition[];
  getNextPossibleStatuses: (currentStatus: ProjectLifecycleStatus) => ProjectLifecycleStatus[];
}

export function useProjectLifecycle(): UseProjectLifecycleReturn {
  const { toast } = useToast();
  const [transitionHistory, setTransitionHistory] = useState<ProjectTransition[]>([]);

  const getProjectStage = useCallback((status: ProjectLifecycleStatus): ProjectStage => {
    switch (status) {
      case 'concept':
      case 'planning':
      case 'due_diligence':
        return 'pipeline';
      case 'approved':
      case 'active':
        return 'portfolio';
      case 'deployed':
      case 'completed':
        return 'asset_management';
      case 'cancelled':
        return 'pipeline'; // Cancelled projects go back to pipeline for potential re-evaluation
      default:
        return 'pipeline';
    }
  }, []);

  const statusTransitions: Record<ProjectLifecycleStatus, ProjectLifecycleStatus[]> = {
    concept: ['planning', 'cancelled'],
    planning: ['due_diligence', 'cancelled'],
    due_diligence: ['approved', 'cancelled'],
    approved: ['active', 'cancelled'],
    active: ['deployed', 'cancelled'],
    deployed: ['completed'],
    completed: [],
    cancelled: ['concept'] // Can restart from concept
  };

  const canTransitionTo = useCallback((
    currentStatus: ProjectLifecycleStatus, 
    targetStatus: ProjectLifecycleStatus
  ): boolean => {
    return statusTransitions[currentStatus]?.includes(targetStatus) || false;
  }, []);

  const getNextPossibleStatuses = useCallback((
    currentStatus: ProjectLifecycleStatus
  ): ProjectLifecycleStatus[] => {
    return statusTransitions[currentStatus] || [];
  }, []);

  const transitionProject = useCallback(async (
    projectId: string,
    currentStatus: ProjectLifecycleStatus,
    targetStatus: ProjectLifecycleStatus,
    triggeredBy: ProjectTransition['triggeredBy'],
    notes?: string
  ) => {
    if (!canTransitionTo(currentStatus, targetStatus)) {
      toast({
        title: "Invalid Transition",
        description: `Cannot transition from ${currentStatus} to ${targetStatus}`,
        variant: "destructive"
      });
      return;
    }

    const transition: ProjectTransition = {
      id: `transition-${Date.now()}`,
      projectId,
      fromStatus: currentStatus,
      toStatus: targetStatus,
      fromStage: getProjectStage(currentStatus),
      toStage: getProjectStage(targetStatus),
      triggeredBy,
      timestamp: new Date().toISOString(),
      notes
    };

    setTransitionHistory(prev => [...prev, transition]);

    toast({
      title: "Project Status Updated",
      description: `Project transitioned from ${currentStatus} to ${targetStatus}`,
    });
  }, [canTransitionTo, getProjectStage, toast]);

  const getTransitionHistory = useCallback((projectId: string): ProjectTransition[] => {
    return transitionHistory.filter(t => t.projectId === projectId);
  }, [transitionHistory]);

  return {
    getProjectStage,
    canTransitionTo,
    transitionProject,
    getTransitionHistory,
    getNextPossibleStatuses
  };
}
