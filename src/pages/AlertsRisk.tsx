
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  BarChart3,
  Filter,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const riskMetrics = [
  {
    label: "High Risk Projects",
    value: "8",
    subtext: "Requires immediate attention",
    icon: AlertTriangle,
    trend: "+2 this week",
    color: "text-destructive",
    bgColor: "bg-destructive/10"
  },
  {
    label: "Medium Risk",
    value: "24",
    subtext: "Under monitoring",
    icon: AlertCircle,
    trend: "-3 from last week",
    color: "text-warning",
    bgColor: "bg-warning/10"
  },
  {
    label: "Low Risk",
    value: "156",
    subtext: "Stable performance",
    icon: CheckCircle,
    trend: "+12 this month",
    color: "text-success",
    bgColor: "bg-success/10"
  },
  {
    label: "Risk Score",
    value: "7.2/10",
    subtext: "Portfolio average",
    icon: Shield,
    trend: "Improved by 0.8",
    color: "text-primary",
    bgColor: "bg-primary/10"
  }
];

const recentAlerts = [
  {
    id: 1,
    type: "Performance",
    severity: "high",
    title: "Cooking Hours Below Threshold",
    description: "Mombasa Primary School - 40% reduction in daily usage",
    location: "Mombasa, Kenya",
    time: "2 hours ago",
    project: "KEN-EDU-001",
    icon: TrendingDown,
    status: "active"
  },
  {
    id: 2,
    type: "Financial",
    severity: "medium",
    title: "Disbursement Delay Risk",
    description: "Pending milestone verification for 5 days",
    location: "Kampala, Uganda",
    time: "6 hours ago",
    project: "UGA-TEC-003",
    icon: Clock,
    status: "investigating"
  },
  {
    id: 3,
    type: "Operational",
    severity: "high",
    title: "Equipment Malfunction Detected",
    description: "Multiple sensor failures reported",
    location: "Nairobi, Kenya",
    time: "1 day ago",
    project: "KEN-SEC-007",
    icon: AlertTriangle,
    status: "resolved"
  },
  {
    id: 4,
    type: "Compliance",
    severity: "medium",
    title: "Carbon Verification Pending",
    description: "Documentation missing for Q4 credit issuance",
    location: "Dar es Salaam, Tanzania",
    time: "2 days ago",
    project: "TZA-CAR-002",
    icon: Shield,
    status: "active"
  }
];

const riskCategories = [
  {
    name: "Performance Risk",
    score: 3.2,
    description: "Usage patterns, efficiency metrics, and operational targets",
    projects: 45,
    alerts: 12,
    color: "warning"
  },
  {
    name: "Financial Risk",
    score: 2.8,
    description: "Payment delays, funding gaps, and cash flow issues",
    projects: 23,
    alerts: 6,
    color: "success"
  },
  {
    name: "Operational Risk",
    score: 4.1,
    description: "Equipment failures, maintenance needs, and technical issues",
    projects: 67,
    alerts: 18,
    color: "destructive"
  },
  {
    name: "Compliance Risk",
    score: 2.1,
    description: "Regulatory requirements, audit findings, and documentation",
    projects: 34,
    alerts: 4,
    color: "primary"
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high": return "text-destructive bg-destructive/10 border-destructive/20";
    case "medium": return "text-warning bg-warning/10 border-warning/20";
    case "low": return "text-success bg-success/10 border-success/20";
    default: return "text-muted-foreground bg-muted/10 border-border";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "status-destructive";
    case "investigating": return "status-warning";
    case "resolved": return "status-success";
    default: return "status-muted";
  }
};

export default function AlertsRisk() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Alerts & Risk Management</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Monitor risks, track alerts, and ensure portfolio stability
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Alerts
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Risk Settings
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert Rule
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Risk Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {riskMetrics.map((metric, index) => (
              <Card key={index} className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">{metric.label}</p>
                      <p className="metric-value mt-2">{metric.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{metric.subtext}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-sm ${metric.bgColor} ${metric.color}`}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                  </div>
                  {metric.trend && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {metric.trend}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
              <TabsTrigger value="risks">Risk Categories</TabsTrigger>
              <TabsTrigger value="analytics">Risk Analytics</TabsTrigger>
              <TabsTrigger value="settings">Alert Settings</TabsTrigger>
            </TabsList>

            {/* Active Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Recent Alerts
                      </CardTitle>
                      <CardDescription>
                        Latest risk alerts and performance warnings across your portfolio
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Alerts
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className="border border-border rounded-sm p-4 hover:shadow-[var(--shadow-elevated)] transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-sm ${getSeverityColor(alert.severity)}`}>
                              <alert.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-foreground">{alert.title}</h4>
                                <Badge variant="outline" className={getStatusColor(alert.status)}>
                                  {alert.status}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {alert.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {alert.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {alert.time}
                                </span>
                                <span>Project: {alert.project}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk Categories Tab */}
            <TabsContent value="risks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {riskCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-[var(--shadow-elevated)] transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <Badge variant="outline" className={`status-${category.color}`}>
                          Risk Score: {category.score}
                        </Badge>
                      </div>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Risk Level</span>
                          <span className="font-medium">{category.score}/5.0</span>
                        </div>
                        <Progress value={category.score * 20} className="w-full" />
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{category.projects}</p>
                            <p className="text-sm text-muted-foreground">Projects</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{category.alerts}</p>
                            <p className="text-sm text-muted-foreground">Active Alerts</p>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full">
                          View Risk Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Risk Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Risk Trend Analysis
                    </CardTitle>
                    <CardDescription>
                      Risk score evolution over the past 12 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Risk trend chart will be displayed here</p>
                        <p className="text-sm">Interactive analytics coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                    <CardDescription>
                      Portfolio risk breakdown by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-${category.color}`}></div>
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{category.projects} projects</span>
                            <span className="text-sm font-medium">{Math.round(category.score * 20)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Alert Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Alert Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure alert thresholds and notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { name: "Performance Alerts", description: "Usage below 70% of target for 3 consecutive days", enabled: true },
                      { name: "Financial Alerts", description: "Disbursement delays exceeding 5 business days", enabled: true },
                      { name: "Operational Alerts", description: "Equipment failures or maintenance requirements", enabled: false },
                      { name: "Compliance Alerts", description: "Missing documentation or certification deadlines", enabled: true }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground">{setting.name}</h4>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={setting.enabled ? "secondary" : "outline"}>
                            {setting.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
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
    </div>
  );
}