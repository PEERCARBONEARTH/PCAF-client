import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Target, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Users,
  Leaf,
  Heart
} from 'lucide-react';

// Theory of Change data structure
const theoryOfChangeData = {
  program: "Clean Cooking Program - East Africa",
  sdgAlignment: [7, 3, 5, 13, 15],
  stages: [
    {
      stage: "Inputs",
      icon: Users,
      color: "secondary",
      items: [
        { name: "Financial Capital", value: "$2.4M", status: "committed" },
        { name: "Technology Partner", value: "Ecobox", status: "active" },
        { name: "Local Staff", value: "23 staff", status: "deployed" },
        { name: "Training Materials", value: "5 languages", status: "complete" }
      ]
    },
    {
      stage: "Activities", 
      icon: Activity,
      color: "primary",
      items: [
        { name: "Stove Manufacturing", value: "1,247 units", status: "ongoing" },
        { name: "Community Training", value: "156 sessions", status: "completed" },
        { name: "Installation Support", value: "89% coverage", status: "active" },
        { name: "Maintenance Network", value: "45 technicians", status: "trained" }
      ]
    },
    {
      stage: "Outputs",
      icon: CheckCircle,
      color: "success", 
      items: [
        { name: "Deployed Stoves", value: "1,247", status: "verified" },
        { name: "Trained Users", value: "8,934", status: "certified" },
        { name: "Schools Equipped", value: "156", status: "operational" },
        { name: "Support Centers", value: "12", status: "established" }
      ]
    },
    {
      stage: "Outcomes",
      icon: BarChart3,
      color: "warning",
      items: [
        { name: "Fuel Consumption", value: "-67%", status: "measured" },
        { name: "Cooking Time", value: "-45%", status: "reported" },
        { name: "Smoke Exposure", value: "-78%", status: "monitored" },
        { name: "Cost Savings", value: "$342/year", status: "calculated" }
      ]
    },
    {
      stage: "Impacts",
      icon: TrendingUp,
      color: "finance",
      items: [
        { name: "CO₂ Reduction", value: "2,915 tCO₂", status: "verified" },
        { name: "Health Cases Prevented", value: "567 cases", status: "documented" },
        { name: "Women's Time Saved", value: "12 hrs/week", status: "surveyed" },
        { name: "Educational Outcomes", value: "+23% attendance", status: "tracked" }
      ]
    }
  ]
};

const statusColors = {
  committed: "bg-info/10 text-info",
  active: "bg-success/10 text-success", 
  deployed: "bg-primary/10 text-primary",
  complete: "bg-success/10 text-success",
  ongoing: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  trained: "bg-primary/10 text-primary",
  verified: "bg-success/10 text-success",
  certified: "bg-primary/10 text-primary",
  operational: "bg-success/10 text-success",
  established: "bg-success/10 text-success",
  measured: "bg-info/10 text-info",
  reported: "bg-warning/10 text-warning",
  monitored: "bg-primary/10 text-primary",
  calculated: "bg-info/10 text-info",
  documented: "bg-success/10 text-success",
  surveyed: "bg-warning/10 text-warning",
  tracked: "bg-info/10 text-info"
};

export function TheoryOfChangeFlow() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Theory of Change Visualization
              </CardTitle>
              <CardDescription className="mt-2">
                {theoryOfChangeData.program} - Impact pathway from inputs to long-term outcomes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">SDG Alignment:</span>
              {theoryOfChangeData.sdgAlignment.map((sdg) => (
                <Badge key={sdg} variant="outline" className="text-xs">
                  SDG {sdg}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Theory of Change Flow */}
      <div className="space-y-6">
        {/* Stage Flow Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {theoryOfChangeData.stages.map((stage, index) => {
            const IconComponent = stage.icon;
            const isLast = index === theoryOfChangeData.stages.length - 1;
            
            return (
              <div key={stage.stage} className="relative">
                {/* Stage Card */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${stage.color}/10 text-${stage.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{stage.stage}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stage.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-foreground leading-tight">
                            {item.name}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${statusColors[item.status as keyof typeof statusColors]}`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-primary">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Arrow between stages */}
                {!isLast && (
                  <div className="hidden lg:flex absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <div className="flex items-center justify-center w-12 h-12 bg-background border border-border rounded-full">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Attribution & Measurement Framework */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Impact Attribution
              </CardTitle>
              <CardDescription>
                How we isolate program impact from external factors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">Randomized Control</h4>
                    <p className="text-xs text-muted-foreground">Control vs treatment schools</p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">Baseline Measurements</h4>
                    <p className="text-xs text-muted-foreground">Pre-intervention data</p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Complete
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">External Factor Analysis</h4>
                    <p className="text-xs text-muted-foreground">Weather, economic, policy</p>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning">
                    Ongoing
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Measurement Timeline
              </CardTitle>
              <CardDescription>
                When and how we capture impact data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Baseline (T0)</h4>
                    <p className="text-xs text-muted-foreground">Pre-installation measurements</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Complete</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/10 text-warning">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">6-Month Review (T1)</h4>
                    <p className="text-xs text-muted-foreground">Early impact assessment</p>
                  </div>
                  <span className="text-xs text-muted-foreground">In Progress</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Annual Review (T2)</h4>
                    <p className="text-xs text-muted-foreground">Full impact evaluation</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Planned</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Theory of Change Actions</CardTitle>
            <CardDescription>
              Manage and analyze your impact pathway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Target className="w-4 h-4 mr-2" />
                Edit Logic Model
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Attribution Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Stakeholder Map
              </Button>
              <Button variant="outline" size="sm">
                <Leaf className="w-4 h-4 mr-2" />
                Environmental Factors
              </Button>
              <Button size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Generate Impact Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}