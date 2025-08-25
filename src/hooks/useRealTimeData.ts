import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Simulated API calls
const fetchDashboardData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    metrics: [
      {
        title: "Total Capital Committed",
        value: "$2.4M",
        subtitle: "Across 12 programs",
        trend: { value: "12%", isPositive: true }
      },
      {
        title: "Capital Disbursed", 
        value: "$1.8M",
        subtitle: "75% of committed",
        trend: { value: "8%", isPositive: true }
      },
      {
        title: "CO₂ Saved",
        value: "1,247 tCO₂",
        subtitle: "Verified emissions reduction",
        trend: { value: "23%", isPositive: true }
      },
      {
        title: "Active Schools",
        value: "89",
        subtitle: "Across 3 regions", 
        trend: { value: "6%", isPositive: true }
      }
    ],
    tranches: [
      {
        id: "TRN-001",
        school: "Kibera Primary School",
        region: "Nairobi, Kenya",
        milestone: "200 cooking hours",
        amount: "$15,000",
        status: "pending",
        progress: 87
      },
      {
        id: "TRN-002",
        school: "Mwanza Secondary", 
        region: "Mwanza, Tanzania",
        milestone: "150 cooking hours",
        amount: "$12,500",
        status: "active",
        progress: 45
      }
    ],
    lastUpdated: new Date().toISOString()
  };
};

const fetchReportsData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    quickStats: [
      { label: "Reports Generated", value: "147", subtext: "This month", trend: "+12%" },
      { label: "Download Volume", value: "2.3k", subtext: "Total downloads", trend: "+8%" },
      { label: "SDG Coverage", value: "17/17", subtext: "All goals tracked", trend: "100%" },
      { label: "Impact Verification", value: "Real-time", subtext: "Live IoT feeds", trend: "99.5%" }
    ],
    sdgData: {
      totalCoverage: "17/17",
      highImpactSDGs: 5,
      beneficiariesReached: "89.4K",
      verificationSources: 4,
      realTimeAccuracy: 99.5
    },
    lastUpdated: new Date().toISOString()
  };
};

const fetchTasksData = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    stats: [
      { label: "Active Tasks", value: "34", change: "+12%", urgent: 5 },
      { label: "Overdue Items", value: "5", change: "-20%", urgent: 3 },
      { label: "Team Messages", value: "127", change: "+8%", urgent: 12 },
      { label: "Pending Reviews", value: "18", change: "+3", urgent: 4 }
    ],
    tasks: [
      {
        id: "TSK-001",
        title: "Review carbon verification documents for Kibera project",
        assignee: "Sarah Chen",
        priority: "high",
        status: "in_progress",
        dueDate: "2024-01-20",
        project: "Clean Cooking Kibera",
        messages: 8,
        attachments: 3,
        isOverdue: false
      }
    ],
    lastUpdated: new Date().toISOString()
  };
};

export function useRealTimeData() {
  const queryClient = useQueryClient();
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Dashboard data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Reports data
  const {
    data: reportsData,
    isLoading: isReportsLoading,
    error: reportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReportsData,
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    staleTime: 15000,
  });

  // Tasks data
  const {
    data: tasksData,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasksData,
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    staleTime: 5000, // Tasks update more frequently
  });

  // Manual refresh all data
  const refreshAllData = () => {
    Promise.all([
      refetchDashboard(),
      refetchReports(),
      refetchTasks()
    ]);
  };

  // Update refresh settings
  const updateRefreshSettings = (interval: number, autoRefresh: boolean) => {
    setRefreshInterval(interval);
    setIsAutoRefresh(autoRefresh);
  };

  // Prefetch related data
  const prefetchProjectData = (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['project', projectId],
      queryFn: () => fetchProjectDetails(projectId),
      staleTime: 60000,
    });
  };

  return {
    // Data
    dashboardData,
    reportsData,
    tasksData,
    
    // Loading states
    isDashboardLoading,
    isReportsLoading,
    isTasksLoading,
    isAnyLoading: isDashboardLoading || isReportsLoading || isTasksLoading,
    
    // Errors
    dashboardError,
    reportsError,
    tasksError,
    hasAnyError: !!(dashboardError || reportsError || tasksError),
    
    // Actions
    refreshAllData,
    refetchDashboard,
    refetchReports, 
    refetchTasks,
    prefetchProjectData,
    
    // Settings
    refreshInterval,
    isAutoRefresh,
    updateRefreshSettings,
  };
}

// Mutation for updating task status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { taskId, status, updatedAt: new Date().toISOString() };
    },
    onSuccess: (data) => {
      // Update the tasks cache
      queryClient.setQueryData(['tasks'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          tasks: oldData.tasks.map((task: any) => 
            task.id === data.taskId 
              ? { ...task, status: data.status, updatedAt: data.updatedAt }
              : task
          ),
          lastUpdated: data.updatedAt
        };
      });
    },
  });
}

// Hook for real-time notifications
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        type: Math.random() > 0.7 ? 'warning' : 'info',
        title: 'Real-time Update',
        message: `New data available at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    }, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    markAsRead,
    dismiss,
    unreadCount: notifications.filter(n => !n.read).length
  };
}

// Simulated fetch for project details (for prefetching)
const fetchProjectDetails = async (projectId: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    id: projectId,
    name: `Project ${projectId}`,
    status: 'active',
    details: 'Project details...'
  };
};