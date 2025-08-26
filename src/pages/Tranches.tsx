
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Eye,
  Settings,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRight,
  Plus,
  BarChart3,
  Wallet,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickStats = [
  {
    label: "Active Tranches",
    value: "342",
    subtext: "Across all programs",
    icon: FileText,
    trend: "+12 this month",
    color: "text-primary"
  },
  {
    label: "Total Value",
    value: "$2.4M",
    subtext: "Under management",
    icon: DollarSign,
    trend: "+$340K this quarter",
    color: "text-finance"
  },
  {
    label: "Ready to Disburse",
    value: "$127K",
    subtext: "18 tranches pending",
    icon: Wallet,
    trend: "+$23K this week",
    color: "text-success"
  },
  {
    label: "Avg. Completion",
    value: "14 days",
    subtext: "To milestone triggers",
    icon: Clock,
    trend: "-3 days improvement",
    color: "text-warning"
  }
];

const modules = [
  {
    title: "Tranche Builder",
    description: "Design and configure results-based financing structures with milestone-driven disbursements",
    icon: Settings,
    route: "/green-finance/tranches/builder",
    features: [
      "Visual logic editor",
      "Milestone configuration",
      "Template library",
      "Smart contracts"
    ],
    status: "Active",
    color: "border-primary/20 bg-primary/5"
  },
  {
    title: "Tranche Monitoring",
    description: "Track progress, verify milestones, and manage disbursements across your portfolio",
    icon: Eye,
    route: "/green-finance/tranches/monitoring",
    features: [
      "Real-time tracking",
      "Automatic verification",
      "Disbursement controls",
      "Risk management"
    ],
    status: "Active",
    color: "border-finance/20 bg-finance/5"
  }
];

const recentActivity = [
  {
    action: "Tranche Created",
    details: "Kilimani Primary School - Initial Installation",
    value: "$5,000",
    time: "2 hours ago",
    icon: Plus
  },
  {
    action: "Milestone Verified",
    details: "Mombasa Primary School - 75 Hours Cooked",
    value: "$4,200",
    time: "5 hours ago",
    icon: Target
  },
  {
    action: "Disbursement Processed",
    details: "Kampala Technical Institute - Performance Milestone",
    value: "$7,500",
    time: "1 day ago",
    icon: Wallet
  }
];

export default function Tranches() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Tranche Management</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Design, monitor, and manage results-based financing structures
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button size="sm" onClick={() => navigate("/green-finance/tranches/builder")}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Tranche
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">{stat.label}</p>
                      <p className="metric-value mt-2">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.subtext}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  {stat.trend && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm font-medium text-success">
                        {stat.trend}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modules.map((module) => (
              <Card key={module.title} className={`transition-all duration-300 hover:shadow-[var(--shadow-elevated)] cursor-pointer ${module.color}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-background/80">
                        <module.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {module.status}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(module.route)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {module.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => navigate(module.route)}
                  >
                    Access {module.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest tranche operations and milestone achievements
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-sm border border-border bg-background/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{activity.value}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}