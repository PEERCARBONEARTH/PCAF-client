import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedTaskManager } from "@/components/EnhancedTaskManager";
import { ReviewApprovalFlow } from "@/components/ReviewApprovalFlow";
import { ActionWorkflowManager } from "@/components/ActionWorkflowManager";
import { ConfigurationFlowManager } from "@/components/ConfigurationFlowManager";
import { DataFlowManager } from "@/components/DataFlowManager";
import { CommunicationFlowManager } from "@/components/CommunicationFlowManager";
import { IntegrationWizard } from "@/components/IntegrationWizard";
import { ReportDistributionManager } from "@/components/ReportDistributionManager";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Plus, 
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MessageCircle,
  Send,
  Paperclip,
  Eye,
  MoreHorizontal,
  ArrowRight,
  Flag,
  User,
  FileText,
  Zap,
  Calendar,
  Settings,
  Database,
  Workflow,
  Target,
  TrendingUp
} from "lucide-react";

interface UnifiedTaskWorkflowCenterProps {
  mode?: "tasks" | "workflows" | "both";
  defaultTab?: string;
}

// Shared task/workflow data and handlers
const taskStats = [
  { label: "Active Tasks", value: "34", change: "+12%", icon: MessageSquare, urgent: 5 },
  { label: "Overdue Items", value: "5", change: "-20%", icon: AlertCircle, urgent: 3 },
  { label: "Team Messages", value: "127", change: "+8%", icon: MessageCircle, urgent: 12 },
  { label: "Pending Reviews", value: "18", change: "+3", icon: Clock, urgent: 4 }
];

const workflowStats = {
  activeWorkflows: 2,
  pendingReviews: 3,
  completedToday: 12,
  avgCompletionTime: "18 min"
};

const recentTasks = [
  {
    id: "TSK-001",
    title: "Review carbon verification documents for Kibera project",
    description: "Complete verification of Q4 carbon credits documentation",
    assignee: "Sarah Chen",
    reporter: "Michael Torres",
    priority: "high" as const,
    status: "in_progress" as const,
    dueDate: new Date("2024-01-20"),
    project: "Clean Cooking Kibera",
    messages: 8,
    attachments: 3,
    createdDate: new Date(),
    tags: ['urgent', 'review'],
    watchers: [],
    timeTracked: 120,
    estimatedTime: 480,
    subtasks: []
  },
  {
    id: "TSK-002", 
    title: "Update financial disbursement report",
    description: "Prepare monthly financial report for stakeholders",
    assignee: "David Kim",
    reporter: "Sarah Chen",
    priority: "medium" as const,
    status: "pending" as const,
    dueDate: new Date("2024-01-18"),
    project: "E-Bus Mombasa",
    messages: 2,
    attachments: 1,
    createdDate: new Date(),
    tags: ['review'],
    watchers: [],
    timeTracked: 60,
    estimatedTime: 240,
    subtasks: []
  }
];

const recentMessages = [
  {
    id: 1,
    sender: "Sarah Chen",
    message: "Carbon verification documents have been uploaded for review",
    timestamp: "2 hours ago",
    task: "TSK-001",
    avatar: "SC",
    unread: true
  },
  {
    id: 2,
    sender: "Michael Torres", 
    message: "Financial reports are ready for stakeholder distribution",
    timestamp: "4 hours ago",
    task: "TSK-002",
    avatar: "MT",
    unread: false
  }
];

const teamActivity = [
  { user: "Sarah Chen", action: "completed", item: "Carbon verification review", time: "30 min ago" },
  { user: "Michael Torres", action: "commented on", item: "Financial disbursement task", time: "1 hour ago" },
  { user: "David Kim", action: "uploaded", item: "Site inspection photos", time: "2 hours ago" },
  { user: "Amara Okafor", action: "assigned", item: "New compliance task", time: "3 hours ago" }
];

const quickActions = [
  { title: "Create Task", description: "Assign new task to team member", icon: Plus, color: "text-blue-600" },
  { title: "Send Message", description: "Broadcast to team or project", icon: MessageCircle, color: "text-green-600" },
  { title: "Schedule Review", description: "Set up compliance review", icon: Calendar, color: "text-purple-600" },
  { title: "Generate Report", description: "Create activity summary", icon: FileText, color: "text-orange-600" }
];

// Mock data for workflows
const mockReviewItems = [
  {
    id: "rv-001",
    type: "tranche" as const,
    title: "Kibera Primary School - Milestone 3",
    description: "Review 200 cooking hours achievement and approve $15,000 disbursement",
    requester: "Sarah Kimani",
    requestedAt: "2024-01-15",
    priority: "high" as const,
    status: "pending" as const
  },
  {
    id: "rv-002", 
    type: "compliance" as const,
    title: "Q4 Environmental Impact Report",
    description: "Approve quarterly environmental compliance documentation",
    requester: "James Mwangi",
    requestedAt: "2024-01-14",
    priority: "medium" as const,
    status: "pending" as const
  }
];

const mockWorkflows = [
  {
    id: "wf-001",
    title: "New School Onboarding",
    description: "Complete end-to-end process for adding a new school to the program",
    category: "data-processing" as const,
    priority: "high" as const,
    progress: 60,
    estimatedTime: "45 minutes",
    nextAction: "Verify baseline data and approve initial disbursement",
    steps: [
      {
        id: "step-1",
        title: "School Registration",
        description: "Collect basic school information and documentation",
        status: "completed" as const
      },
      {
        id: "step-2", 
        title: "Baseline Assessment",
        description: "Conduct initial cooking usage and infrastructure assessment",
        status: "completed" as const
      },
      {
        id: "step-3",
        title: "Equipment Installation",
        description: "Install cooking equipment and monitoring sensors",
        status: "in-progress" as const,
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    ]
  }
];

const mockConfigCategories = [
  {
    id: "notifications",
    title: "Notification Settings", 
    description: "Configure alerts, reminders, and communication preferences",
    icon: <Bell className="h-4 w-4" />,
    requiresRestart: false,
    settings: [
      {
        id: "email-notifications",
        category: "notifications",
        title: "Email Notifications",
        description: "Enable email alerts for important events",
        type: "boolean" as const,
        value: true,
        defaultValue: true
      }
    ]
  }
];

function getPriorityBadge(priority: string) {
  const styles = {
    high: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
    low: "bg-green-500/10 text-green-600 hover:bg-green-500/20"
  };

  const icons = {
    high: Flag,
    medium: Flag, 
    low: Flag
  };

  const Icon = icons[priority as keyof typeof icons];

  return (
    <Badge variant="secondary" className={styles[priority as keyof typeof styles]}>
      <Icon className="h-3 w-3 mr-1" />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

function getStatusBadge(status: string) {
  const styles = {
    completed: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
    in_progress: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
    pending: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
    review: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
  };

  const labels = {
    completed: "Completed",
    in_progress: "In Progress",
    pending: "Pending",
    review: "Review"
  };

  const icons = {
    completed: CheckCircle,
    in_progress: Clock,
    pending: AlertCircle,
    review: Eye
  };

  const Icon = icons[status as keyof typeof icons];

  return (
    <Badge variant="secondary" className={styles[status as keyof typeof styles]}>
      <Icon className="h-3 w-3 mr-1" />
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}

function getUserAvatar(name: string, avatar: string) {
  return (
    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
      {avatar}
    </div>
  );
}

export function UnifiedTaskWorkflowCenter({ mode = "both", defaultTab = "overview" }: UnifiedTaskWorkflowCenterProps) {
  const { tasksData, isTasksLoading, tasksError, refetchTasks } = useRealTimeData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [tasks, setTasks] = useState(recentTasks);

  // Task handlers
  const handleTaskCreate = (newTask: any) => {
    const task = {
      ...newTask,
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      createdDate: new Date(),
      messages: 0,
      attachments: 0,
      subtasks: [],
      timeTracked: 0
    };
    setTasks(prev => [task, ...prev]);
    toast({
      title: "Task Created",
      description: `"${task.title}" has been assigned to ${task.assignee}`,
    });
  };

  const handleTaskUpdate = (taskId: string, updates: any) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
    toast({
      title: "Task Updated",
      description: "Task has been successfully updated",
    });
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Task has been removed from the system",
      variant: "destructive"
    });
  };

  // Workflow handlers
  const handleApprove = async (id: string, comments?: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Approved ${id} with comments:`, comments);
  };

  const handleReject = async (id: string, reason: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Rejected ${id} with reason:`, reason);
  };

  const handleReviewComplete = () => {
    toast({
      title: "Review Queue Complete",
      description: "All pending items have been processed. Great work!",
    });
  };

  const handleWorkflowComplete = (workflowId: string) => {
    console.log(`Workflow ${workflowId} completed`);
  };

  const handleStepComplete = async (workflowId: string, stepId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Step ${stepId} in workflow ${workflowId} completed`);
  };

  // Configuration handlers
  const handleConfigSave = async (categoryId: string, settings: Record<string, any>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Saved configuration for ${categoryId}:`, settings);
  };

  const handleConfigTest = async (categoryId: string, settings: Record<string, any>) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`Tested configuration for ${categoryId}:`, settings);
    return Math.random() > 0.3;
  };

  const handleConfigReset = (categoryId: string) => {
    console.log(`Reset configuration for ${categoryId}`);
  };

  if (tasksError) {
    return (
      <Layout>
        <div className="p-6">
          <ErrorState 
            title="Failed to load task/workflow data"
            message="Unable to fetch the latest data. Please try again."
            onRetry={refetchTasks}
          />
        </div>
      </Layout>
    );
  }

  const shouldShowTasks = mode === "tasks" || mode === "both";
  const shouldShowWorkflows = mode === "workflows" || mode === "both";

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {mode === "tasks" ? "Task Center" : mode === "workflows" ? "Workflow Center" : "Task & Workflow Center"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "tasks" ? "Communication hub and task management" : 
               mode === "workflows" ? "Complete end-to-end processes with guided workflows" :
               "Unified task management and workflow automation"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {shouldShowTasks ? "New Task" : "New Workflow"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {isTasksLoading ? (
          <LoadingState variant="grid" count={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(tasksData?.stats || taskStats).map((stat, index) => {
              const Icon = (stat as any).icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-green-600">{stat.change} from last week</p>
                        {stat.urgent > 0 && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            {stat.urgent} urgent
                          </Badge>
                        )}
                      </div>
                      {Icon && <Icon className="h-8 w-8 text-muted-foreground" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button key={index} variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${action.color}`} />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${mode === "both" ? "grid-cols-8" : shouldShowTasks ? "grid-cols-4" : "grid-cols-6"}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            
            {shouldShowTasks && (
              <>
                <TabsTrigger value="tasks">Enhanced Tasks</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="activity">Team Activity</TabsTrigger>
              </>
            )}
            
            {shouldShowWorkflows && (
              <>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Reviews</span>
                  {workflowStats.pendingReviews > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {workflowStats.pendingReviews}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  <span className="hidden sm:inline">Workflows</span>
                </TabsTrigger>
                <TabsTrigger value="configuration" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configuration</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Data Processing</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {shouldShowWorkflows && (
                <>
                  <Card className="metric-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="metric-label">Active Workflows</p>
                          <p className="metric-value mt-2">{workflowStats.activeWorkflows}</p>
                          <p className="text-sm text-muted-foreground mt-1">In progress</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                          <Workflow className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="metric-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="metric-label">Pending Reviews</p>
                          <p className="metric-value mt-2">{workflowStats.pendingReviews}</p>
                          <p className="text-sm text-muted-foreground mt-1">Awaiting approval</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                          <Clock className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <Card className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Completed Today</p>
                      <p className="metric-value mt-2">{workflowStats.completedToday}</p>
                      <p className="text-sm text-muted-foreground mt-1">Tasks finished</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Avg. Time</p>
                      <p className="metric-value mt-2">{workflowStats.avgCompletionTime}</p>
                      <p className="text-sm text-muted-foreground mt-1">Per workflow</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-info/10 text-info">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Jump to the most important workflows and pending tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {shouldShowTasks && (
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => setActiveTab("tasks")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Manage Tasks</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {taskStats[0].value} active tasks to review
                      </span>
                    </Button>
                  )}
                  
                  {shouldShowWorkflows && (
                    <>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-start"
                        onClick={() => setActiveTab("reviews")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Process Reviews</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {workflowStats.pendingReviews} items waiting for approval
                        </span>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-start"
                        onClick={() => setActiveTab("workflows")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Workflow className="h-4 w-4" />
                          <span className="font-medium">Continue Workflows</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {workflowStats.activeWorkflows} workflows in progress
                        </span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task-related tabs */}
          {shouldShowTasks && (
            <>
              <TabsContent value="tasks">
                <EnhancedTaskManager
                  tasks={tasks}
                  onTaskCreate={handleTaskCreate}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                />
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Messages</CardTitle>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Compose
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentMessages.map((message) => (
                        <div key={message.id} className={`flex items-start gap-4 p-4 border border-border rounded-sm ${message.unread ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}>
                          <div className="flex-shrink-0">
                            {getUserAvatar(message.sender, message.avatar)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-foreground">{message.sender}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                {message.unread && <div className="h-2 w-2 rounded-full bg-blue-600"></div>}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{message.message}</p>
                            <Badge variant="outline" className="text-xs">
                              {message.task}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Activity Feed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamActivity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">
                              <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.item}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {/* Workflow-related tabs */}
          {shouldShowWorkflows && (
            <>
              <TabsContent value="reviews">
                <ReviewApprovalFlow
                  items={mockReviewItems}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onComplete={handleReviewComplete}
                />
              </TabsContent>

              <TabsContent value="workflows">
                <ActionWorkflowManager
                  workflows={mockWorkflows}
                  onWorkflowComplete={handleWorkflowComplete}
                  onStepComplete={handleStepComplete}
                />
              </TabsContent>

              <TabsContent value="configuration">
                <ConfigurationFlowManager
                  categories={mockConfigCategories}
                  onSave={handleConfigSave}
                  onTest={handleConfigTest}
                  onReset={handleConfigReset}
                />
              </TabsContent>

              <TabsContent value="data">
                <DataFlowManager 
                  jobs={[]}
                  rules={[]}
                  onJobCreate={() => {}}
                  onJobProcess={async () => {}}
                  onJobRetry={async () => {}}
                  onJobCancel={() => {}}
                  onRuleCreate={() => {}}
                  onRuleToggle={() => {}}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}