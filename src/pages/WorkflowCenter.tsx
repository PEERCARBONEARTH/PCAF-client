import { useState } from "react";

import { ReviewApprovalFlow } from "@/components/ReviewApprovalFlow";
import { ActionWorkflowManager } from "@/components/ActionWorkflowManager";
import { ConfigurationFlowManager } from "@/components/ConfigurationFlowManager";
import { DataFlowManager } from "@/components/DataFlowManager";
import { CommunicationFlowManager } from "@/components/CommunicationFlowManager";
import { IntegrationWizard } from "@/components/IntegrationWizard";
import { ReportDistributionManager } from "@/components/ReportDistributionManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Clock, 
  Settings, 
  FileText, 
  Users, 
  Shield, 
  Database, 
  Bell,
  Workflow,
  Target,
  TrendingUp,
  MessageSquare
} from "lucide-react";

// Mock data for demonstration
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
  },
  {
    id: "rv-003",
    type: "user" as const,
    title: "Field Manager Access Request",
    description: "Grant advanced monitoring permissions to new field manager",
    requester: "Admin System",
    requestedAt: "2024-01-13",
    priority: "low" as const,
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
      },
      {
        id: "step-4",
        title: "Training & Handover", 
        description: "Train staff and conduct knowledge transfer",
        status: "pending" as const,
        dependencies: ["step-3"]
      }
    ]
  },
  {
    id: "wf-002",
    title: "Monthly Impact Verification",
    description: "Verify monthly impact data and approve milestone disbursements",
    category: "review" as const,
    priority: "medium" as const,
    progress: 25,
    estimatedTime: "30 minutes",
    nextAction: "Review satellite data and field reports",
    steps: [
      {
        id: "step-5",
        title: "Data Collection",
        description: "Aggregate IoT sensor data and field reports",
        status: "completed" as const
      },
      {
        id: "step-6",
        title: "Satellite Verification",
        description: "Cross-reference with satellite imagery data",
        status: "pending" as const,
        action: async () => {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      },
      {
        id: "step-7",
        title: "Impact Calculation",
        description: "Calculate CO2 savings and impact metrics",
        status: "pending" as const,
        dependencies: ["step-6"]
      },
      {
        id: "step-8",
        title: "Disbursement Approval",
        description: "Review and approve milestone-based disbursements",
        status: "pending" as const,
        dependencies: ["step-7"]
      }
    ]
  }
];

const mockConfigCategories = [
  {
    id: "notifications",
    title: "Notification Settings", 
    description: "Configure alerts, reminders, and communication preferences",
    icon: <Bell className="h-5 w-5" />,
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
      },
      {
        id: "notification-frequency",
        category: "notifications", 
        title: "Notification Frequency",
        description: "How often to send digest notifications",
        type: "select" as const,
        value: "daily",
        defaultValue: "daily",
        options: [
          { label: "Real-time", value: "realtime" },
          { label: "Daily", value: "daily" },
          { label: "Weekly", value: "weekly" }
        ]
      }
    ]
  },
  {
    id: "security",
    title: "Security & Access",
    description: "Manage authentication and authorization settings",
    icon: <Shield className="h-5 w-5" />,
    requiresRestart: true,
    settings: [
      {
        id: "session-timeout",
        category: "security",
        title: "Session Timeout",
        description: "Minutes before automatic logout",
        type: "number" as const,
        value: 60,
        defaultValue: 60,
        validation: { min: 15, max: 480, required: true }
      },
      {
        id: "2fa-required",
        category: "security",
        title: "Require Two-Factor Authentication",
        description: "Enforce 2FA for all user accounts",
        type: "boolean" as const,
        value: false,
        defaultValue: false
      }
    ]
  },
  {
    id: "data",
    title: "Data Management",
    description: "Configure data retention and processing settings",
    icon: <Database className="h-5 w-5" />,
    requiresRestart: false,
    settings: [
      {
        id: "data-retention",
        category: "data",
        title: "Data Retention Period",
        description: "How long to keep historical data (months)",
        type: "number" as const,
        value: 24,
        defaultValue: 24,
        validation: { min: 6, max: 120, required: true }
      }
    ]
  },
  {
    id: "users",
    title: "User Management",
    description: "Configure user roles and permissions",
    icon: <Users className="h-5 w-5" />,
    requiresRestart: false,
    settings: [
      {
        id: "default-role",
        category: "users",
        title: "Default User Role",
        description: "Default role assigned to new users",
        type: "select" as const,
        value: "viewer",
        defaultValue: "viewer",
        options: [
          { label: "Viewer", value: "viewer" },
          { label: "Editor", value: "editor" },
          { label: "Admin", value: "admin" }
        ]
      }
    ]
  }
];

export default function WorkflowCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Review & Approval handlers
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

  // Workflow handlers
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
    return Math.random() > 0.3; // 70% success rate for demo
  };

  const handleConfigReset = (categoryId: string) => {
    console.log(`Reset configuration for ${categoryId}`);
  };

  const workflowStats = {
    activeWorkflows: mockWorkflows.filter(w => w.progress < 100).length,
    pendingReviews: mockReviewItems.filter(r => r.status === "pending").length,
    completedToday: 12,
    avgCompletionTime: "18 min"
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflow Center</h1>
            <p className="text-muted-foreground">
              Complete end-to-end processes with guided workflows and automated approvals
            </p>
          </div>
        </div>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
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
              {workflowStats.activeWorkflows > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {workflowStats.activeWorkflows}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data Processing</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Communication</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setActiveTab("configuration")}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">System Settings</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Configure platform preferences
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review & Approval Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <ReviewApprovalFlow
              items={mockReviewItems}
              onApprove={handleApprove}
              onReject={handleReject}
              onComplete={handleReviewComplete}
            />
          </TabsContent>

          {/* Action Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <ActionWorkflowManager
              workflows={mockWorkflows}
              onWorkflowComplete={handleWorkflowComplete}
              onStepComplete={handleStepComplete}
            />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <ConfigurationFlowManager
              categories={mockConfigCategories}
              onSave={handleConfigSave}
              onTest={handleConfigTest}
              onReset={handleConfigReset}
            />
          </TabsContent>

          {/* Data Processing Tab */}
          <TabsContent value="data" className="space-y-6">
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

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <CommunicationFlowManager
              channels={[]}
              templates={[]}
              campaigns={[]}
              onChannelTest={async () => true}
              onChannelToggle={() => {}}
              onTemplateCreate={() => {}}
              onCampaignCreate={() => {}}
              onCampaignSend={async () => {}}
              onCampaignSchedule={() => {}}
            />
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <IntegrationWizard
              integrations={[]}
              onStartConfiguration={() => {}}
              onSaveConfiguration={async () => {}}
              onTestIntegration={async () => true}
              onTestEndpoint={async () => true}
              onToggleIntegration={() => {}}
              onToggleMonitoring={() => {}}
              onRetryConnection={async () => {}}
            />
          </TabsContent>

          {/* Reporting Tab */}
          <TabsContent value="reporting" className="space-y-6">
            <ReportDistributionManager
              schedules={[]}
              exports={[]}
              shareableLinks={[]}
              onCreateSchedule={() => {}}
              onUpdateSchedule={() => {}}
              onDeleteSchedule={() => {}}
              onRunSchedule={async () => {}}
              onCreateExport={async () => {}}
              onDownloadExport={() => {}}
              onCreateShareLink={() => {}}
              onRevokeShareLink={() => {}}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}