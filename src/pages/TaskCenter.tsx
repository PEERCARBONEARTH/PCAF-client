import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedTaskManager } from "@/components/EnhancedTaskManager";
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
  Calendar
} from "lucide-react";

const taskStats = [
  { label: "Active Tasks", value: "34", change: "+12%", icon: MessageSquare, urgent: 5 },
  { label: "Overdue Items", value: "5", change: "-20%", icon: AlertCircle, urgent: 3 },
  { label: "Team Messages", value: "127", change: "+8%", icon: MessageCircle, urgent: 12 },
  { label: "Pending Reviews", value: "18", change: "+3", icon: Clock, urgent: 4 }
];

const recentTasks = [
  {
    id: "TSK-001",
    title: "Review carbon verification documents for Kibera project",
    description: "Complete verification of Q4 carbon credits documentation",
    assignee: "Sarah Chen",
    reporter: "Michael Torres",
    priority: "high",
    status: "in_progress",
    dueDate: "2024-01-20",
    project: "Clean Cooking Kibera",
    messages: 8,
    attachments: 3
  },
  {
    id: "TSK-002", 
    title: "Update financial disbursement report",
    description: "Prepare monthly financial report for stakeholders",
    assignee: "David Kim",
    reporter: "Sarah Chen",
    priority: "medium",
    status: "pending",
    dueDate: "2024-01-18",
    project: "E-Bus Mombasa",
    messages: 2,
    attachments: 1
  },
  {
    id: "TSK-003",
    title: "Conduct site inspection for new deployment",
    description: "Physical verification of installation requirements",
    assignee: "Amara Okafor",
    reporter: "System",
    priority: "low",
    status: "completed",
    dueDate: "2024-01-15",
    project: "Solar PV Schools",
    messages: 12,
    attachments: 6
  },
  {
    id: "TSK-004",
    title: "Approve tranche disbursement for Phase 2",
    description: "Review and approve funding release conditions",
    assignee: "Michael Torres",
    reporter: "David Kim",
    priority: "high",
    status: "review",
    dueDate: "2024-01-22",
    project: "Biogas Digesters",
    messages: 5,
    attachments: 2
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
  },
  {
    id: 3,
    sender: "David Kim",
    message: "Site inspection completed successfully. All systems operational.",
    timestamp: "1 day ago",
    task: "TSK-003",
    avatar: "DK",
    unread: false
  },
  {
    id: 4,
    sender: "System",
    message: "Automated reminder: Tranche approval deadline approaching",
    timestamp: "2 days ago",
    task: "TSK-004",
    avatar: "SY",
    unread: false
  }
];

const teamActivity = [
  { user: "Sarah Chen", action: "completed", item: "Carbon verification review", time: "30 min ago" },
  { user: "Michael Torres", action: "commented on", item: "Financial disbursement task", time: "1 hour ago" },
  { user: "David Kim", action: "uploaded", item: "Site inspection photos", time: "2 hours ago" },
  { user: "Amara Okafor", action: "assigned", item: "New compliance task", time: "3 hours ago" },
  { user: "System", action: "created", item: "Automated reminder", time: "4 hours ago" }
];

const quickActions = [
  { title: "Create Task", description: "Assign new task to team member", icon: Plus, color: "text-blue-600" },
  { title: "Send Message", description: "Broadcast to team or project", icon: MessageCircle, color: "text-green-600" },
  { title: "Schedule Review", description: "Set up compliance review", icon: Calendar, color: "text-purple-600" },
  { title: "Generate Report", description: "Create activity summary", icon: FileText, color: "text-orange-600" }
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

export default function TaskCenter() {
  const { tasksData, isTasksLoading, tasksError, refetchTasks } = useRealTimeData();
  const { toast } = useToast();
  const [tasks, setTasks] = useState(recentTasks.map(task => ({
    ...task,
    priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
    status: task.status as 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked',
    dueDate: new Date(task.dueDate),
    createdDate: new Date(),
    tags: ['urgent', 'review'],
    watchers: [],
    timeTracked: Math.floor(Math.random() * 480),
    estimatedTime: 480,
    subtasks: []
  })));

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

  if (tasksError) {
    return (
      <div className="p-6">
        <div className="p-6">
          <ErrorState 
            title="Failed to load tasks"
            message="Unable to fetch the latest task data. Please try again."
            onRetry={refetchTasks}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Center</h1>
            <p className="text-muted-foreground">Communication hub and task management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Task
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
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Enhanced Tasks</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="activity">Team Activity</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

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

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.filter(task => task.status !== 'completed').map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{task.title}</h4>
                          {getPriorityBadge(task.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Due: {task.dueDate} • Assigned to {task.assignee}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}