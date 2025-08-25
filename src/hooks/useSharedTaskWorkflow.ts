import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  reporter: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
  dueDate: Date;
  createdDate: Date;
  project: string;
  messages: number;
  attachments: number;
  tags: string[];
  watchers: string[];
  timeTracked: number;
  estimatedTime: number;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dependencies?: string[];
  action?: () => Promise<void>;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  category: 'review' | 'data-processing' | 'communication' | 'integration';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  estimatedTime: string;
  nextAction: string;
  steps: WorkflowStep[];
}

export interface ReviewItem {
  id: string;
  type: 'tranche' | 'compliance' | 'user' | 'configuration';
  title: string;
  description: string;
  requester: string;
  requestedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'review';
}

export interface TaskWorkflowStats {
  activeTasks: number;
  activeWorkflows: number;
  pendingReviews: number;
  completedToday: number;
  avgCompletionTime: string;
  overdueItems: number;
  teamMessages: number;
}

export function useSharedTaskWorkflow() {
  const { toast } = useToast();
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed stats
  const stats = useMemo<TaskWorkflowStats>(() => ({
    activeTasks: tasks.filter(t => t.status !== 'completed').length,
    activeWorkflows: workflows.filter(w => w.progress < 100).length,
    pendingReviews: reviewItems.filter(r => r.status === 'pending').length,
    completedToday: tasks.filter(t => {
      const today = new Date();
      const taskDate = new Date(t.createdDate);
      return t.status === 'completed' && 
             taskDate.toDateString() === today.toDateString();
    }).length,
    avgCompletionTime: "18 min", // Mock value
    overdueItems: tasks.filter(t => 
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length,
    teamMessages: tasks.reduce((sum, t) => sum + t.messages, 0)
  }), [tasks, workflows, reviewItems]);

  // Task operations
  const createTask = useCallback((taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      title: taskData.title || '',
      description: taskData.description || '',
      assignee: taskData.assignee || '',
      reporter: taskData.reporter || '',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'pending',
      dueDate: taskData.dueDate || new Date(),
      createdDate: new Date(),
      project: taskData.project || '',
      messages: 0,
      attachments: 0,
      tags: taskData.tags || [],
      watchers: taskData.watchers || [],
      timeTracked: 0,
      estimatedTime: taskData.estimatedTime || 480,
      subtasks: taskData.subtasks || []
    };

    setTasks(prev => [newTask, ...prev]);
    
    toast({
      title: "Task Created",
      description: `"${newTask.title}" has been assigned to ${newTask.assignee}`,
    });

    return newTask;
  }, [tasks.length, toast]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
    
    toast({
      title: "Task Updated",
      description: "Task has been successfully updated",
    });
  }, [toast]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    toast({
      title: "Task Deleted",
      description: "Task has been removed from the system",
      variant: "destructive"
    });
  }, [toast]);

  // Workflow operations
  const createWorkflow = useCallback((workflowData: Partial<Workflow>) => {
    const newWorkflow: Workflow = {
      id: `WF-${String(workflows.length + 1).padStart(3, '0')}`,
      title: workflowData.title || '',
      description: workflowData.description || '',
      category: workflowData.category || 'data-processing',
      priority: workflowData.priority || 'medium',
      progress: 0,
      estimatedTime: workflowData.estimatedTime || '30 min',
      nextAction: workflowData.nextAction || '',
      steps: workflowData.steps || []
    };

    setWorkflows(prev => [newWorkflow, ...prev]);
    
    toast({
      title: "Workflow Created",
      description: `"${newWorkflow.title}" workflow has been initiated`,
    });

    return newWorkflow;
  }, [workflows.length, toast]);

  const updateWorkflow = useCallback((workflowId: string, updates: Partial<Workflow>) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId ? { ...workflow, ...updates } : workflow
    ));
  }, []);

  const completeWorkflowStep = useCallback(async (workflowId: string, stepId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Find the workflow and step
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const step = workflow.steps.find(s => s.id === stepId);
      if (!step) {
        throw new Error('Step not found');
      }

      // Execute step action if present
      if (step.action) {
        await step.action();
      }

      // Update step status
      const updatedSteps = workflow.steps.map(s => 
        s.id === stepId ? { ...s, status: 'completed' as const } : s
      );

      // Calculate new progress
      const completedSteps = updatedSteps.filter(s => s.status === 'completed').length;
      const newProgress = Math.round((completedSteps / updatedSteps.length) * 100);

      // Update workflow
      updateWorkflow(workflowId, {
        steps: updatedSteps,
        progress: newProgress
      });

      toast({
        title: "Step Completed",
        description: `"${step.title}" has been marked as completed`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete step';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [workflows, updateWorkflow, toast]);

  // Review operations
  const approveReview = useCallback(async (reviewId: string, comments?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setReviewItems(prev => prev.map(item => 
        item.id === reviewId ? { ...item, status: 'approved' as const } : item
      ));

      toast({
        title: "Review Approved",
        description: `Review ${reviewId} has been approved`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve review';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const rejectReview = useCallback(async (reviewId: string, reason: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setReviewItems(prev => prev.map(item => 
        item.id === reviewId ? { ...item, status: 'rejected' as const } : item
      ));

      toast({
        title: "Review Rejected",
        description: `Review ${reviewId} has been rejected: ${reason}`,
        variant: "destructive"
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject review';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Bulk operations
  const bulkUpdateTasks = useCallback((taskIds: string[], updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      taskIds.includes(task.id) ? { ...task, ...updates } : task
    ));

    toast({
      title: "Bulk Update Completed",
      description: `${taskIds.length} tasks have been updated`,
    });
  }, [toast]);

  const bulkDeleteTasks = useCallback((taskIds: string[]) => {
    setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));

    toast({
      title: "Bulk Delete Completed",
      description: `${taskIds.length} tasks have been removed`,
      variant: "destructive"
    });
  }, [toast]);

  // Search and filter utilities
  const filterTasks = useCallback((filters: {
    status?: Task['status'][];
    priority?: Task['priority'][];
    assignee?: string[];
    project?: string[];
    tags?: string[];
    dueDateRange?: { start: Date; end: Date };
  }) => {
    return tasks.filter(task => {
      if (filters.status && !filters.status.includes(task.status)) return false;
      if (filters.priority && !filters.priority.includes(task.priority)) return false;
      if (filters.assignee && !filters.assignee.includes(task.assignee)) return false;
      if (filters.project && !filters.project.includes(task.project)) return false;
      if (filters.tags && !filters.tags.some(tag => task.tags.includes(tag))) return false;
      if (filters.dueDateRange) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < filters.dueDateRange.start || dueDate > filters.dueDateRange.end) return false;
      }
      return true;
    });
  }, [tasks]);

  const searchTasks = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      task.assignee.toLowerCase().includes(lowercaseQuery) ||
      task.project.toLowerCase().includes(lowercaseQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [tasks]);

  return {
    // State
    tasks,
    workflows,
    reviewItems,
    stats,
    isLoading,
    error,

    // Task operations
    createTask,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    bulkDeleteTasks,

    // Workflow operations
    createWorkflow,
    updateWorkflow,
    completeWorkflowStep,

    // Review operations
    approveReview,
    rejectReview,

    // Utilities
    filterTasks,
    searchTasks,

    // Actions
    setTasks,
    setWorkflows,
    setReviewItems,
    setError
  };
}