import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/MetricCard";
import { 
  Leaf, 
  Users, 
  Droplet, 
  Zap, 
  Heart, 
  GraduationCap, 
  TreePine,
  Shield,
  DollarSign,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';

// Enhanced impact metrics with SDG alignment
const impactMetrics = [
  {
    category: "Climate Impact",
    icon: Leaf,
    color: "success",
    sdgs: [7, 13, 15],
    metrics: [
      {
        title: "CO₂ Emissions Reduced",
        value: "2,915",
        unit: "tCO₂e",
        target: 3000,
        progress: 97.2,
        trend: { value: "18%", isPositive: true },
        verification: "Gold Standard Verified"
      },
      {
        title: "Clean Stoves Deployed",
        value: "1,247",
        unit: "units",
        target: 1500,
        progress: 83.1,
        trend: { value: "23%", isPositive: true },
        verification: "Field Verified"
      },
      {
        title: "Fuel Wood Saved",
        value: "4,823",
        unit: "tons",
        target: 5000,
        progress: 96.5,
        trend: { value: "34%", isPositive: true },
        verification: "Sensor Monitored"
      }
    ]
  },
  {
    category: "Health & Well-being",
    icon: Heart,
    color: "warning",
    sdgs: [3, 5, 11],
    metrics: [
      {
        title: "Health Cases Prevented",
        value: "567",
        unit: "cases",
        target: 600,
        progress: 94.5,
        trend: { value: "28%", isPositive: true },
        verification: "Medical Partner Verified"
      },
      {
        title: "Women Beneficiaries",
        value: "5,231",
        unit: "people",
        target: 5500,
        progress: 95.1,
        trend: { value: "19%", isPositive: true },
        verification: "Survey Verified"
      },
      {
        title: "Indoor Air Quality Improvement",
        value: "78%",
        unit: "reduction",
        target: 80,
        progress: 97.5,
        trend: { value: "12%", isPositive: true },
        verification: "IoT Monitored"
      }
    ]
  },
  {
    category: "Education & Development",
    icon: GraduationCap,
    color: "primary",
    sdgs: [4, 8, 10],
    metrics: [
      {
        title: "Students Benefiting",
        value: "8,934",
        unit: "students",
        target: 10000,
        progress: 89.3,
        trend: { value: "15%", isPositive: true },
        verification: "School Records"
      },
      {
        title: "Teachers Trained",
        value: "234",
        unit: "teachers",
        target: 250,
        progress: 93.6,
        trend: { value: "31%", isPositive: true },
        verification: "Training Certificates"
      },
      {
        title: "School Meals Improved",
        value: "156",
        unit: "schools",
        target: 180,
        progress: 86.7,
        trend: { value: "22%", isPositive: true },
        verification: "Nutrition Assessment"
      }
    ]
  },
  {
    category: "Economic Impact",
    icon: DollarSign,
    color: "finance",
    sdgs: [1, 8, 9],
    metrics: [
      {
        title: "Household Savings",
        value: "$342",
        unit: "avg/year",
        target: 400,
        progress: 85.5,
        trend: { value: "26%", isPositive: true },
        verification: "Household Survey"
      },
      {
        title: "Local Jobs Created",
        value: "89",
        unit: "jobs",
        target: 100,
        progress: 89.0,
        trend: { value: "78%", isPositive: true },
        verification: "Employment Records"
      },
      {
        title: "Revenue Generated",
        value: "$45.2K",
        unit: "monthly",
        target: 50000,
        progress: 90.4,
        trend: { value: "12%", isPositive: true },
        verification: "Financial Records"
      }
    ]
  }
];

// Real-time verification status
const verificationSources = [
  { name: "IoT Sensors", status: "active", lastUpdate: "2 min ago", coverage: 89 },
  { name: "Satellite Data", status: "active", lastUpdate: "1 hour ago", coverage: 94 },
  { name: "Field Surveys", status: "active", lastUpdate: "1 day ago", coverage: 76 },
  { name: "Partner Reports", status: "active", lastUpdate: "3 hours ago", coverage: 92 }
];

export function ImpactMetricsGrid() {
  return (
    <div className="space-y-8">
      {/* Enhanced Impact Categories */}
      {impactMetrics.map((category, categoryIndex) => {
        const IconComponent = category.icon;
        
        return (
          <Card key={categoryIndex}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${category.color}/10 text-${category.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>Aligned with SDGs:</span>
                      {category.sdgs.map((sdg, index) => (
                        <Badge key={sdg} variant="outline" className="text-xs">
                          SDG {sdg}
                        </Badge>
                      ))}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {category.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{metric.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={metric.progress >= 90 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}
                      >
                        {metric.progress.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {metric.value}
                        <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>
                      </p>
                      {metric.trend && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-sm font-medium ${metric.trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                            {metric.trend.isPositive ? '+' : ''}{metric.trend.value}
                          </span>
                          <span className="text-xs text-muted-foreground">vs target</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Progress value={metric.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Target: {typeof metric.target === 'string' ? metric.target : metric.target.toLocaleString()} {metric.unit}
                        </span>
                        <Badge variant="outline" className="text-xs bg-info/10 text-info">
                          {metric.verification}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Real-time Verification Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Real-time Verification Network
          </CardTitle>
          <CardDescription>
            Live data sources ensuring impact measurement accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {verificationSources.map((source, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{source.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-xs text-success">Live</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Coverage</span>
                    <span className="text-sm font-medium">{source.coverage}%</span>
                  </div>
                  <Progress value={source.coverage} className="h-1" />
                  <p className="text-xs text-muted-foreground">
                    Last update: {source.lastUpdate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}