import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Leaf,
  Building2,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface InstitutionalMetricsProps {
  clientType: "bank" | "fund";
}

export function InstitutionalMetrics({ clientType }: InstitutionalMetricsProps) {
  const netZeroData = {
    commitmentYear: 2050,
    currentYear: 2024,
    progressPercentage: 28,
    scope1And2Reduction: 45,
    scope3Reduction: 23,
    financeEmissionsReduction: 18
  };

  const portfolioMetrics = [
    {
      title: "Green Finance Allocation",
      current: 34.5,
      target: 50,
      unit: "%",
      trend: "up",
      icon: <Leaf className="h-4 w-4" />,
      status: "on-track"
    },
    {
      title: "Portfolio Carbon Intensity",
      current: 142,
      target: 95,
      unit: "tCO₂e/€M",
      trend: "down",
      icon: <TrendingDown className="h-4 w-4" />,
      status: "attention"
    },
    {
      title: "ESG Portfolio Score",
      current: 7.2,
      target: 8.5,
      unit: "/10",
      trend: "up",
      icon: <Shield className="h-4 w-4" />,
      status: "on-track"
    },
    {
      title: "Climate Risk Exposure",
      current: 15.8,
      target: 10,
      unit: "%",
      trend: "down",
      icon: <AlertTriangle className="h-4 w-4" />,
      status: "improving"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track": return "text-success";
      case "attention": return "text-warning";
      case "improving": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track": return <Badge className="bg-success/10 text-success border-success/20">On Track</Badge>;
      case "attention": return <Badge className="bg-warning/10 text-warning border-warning/20">Needs Attention</Badge>;
      case "improving": return <Badge className="bg-primary/10 text-primary border-primary/20">Improving</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Net-Zero Progress */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Net-Zero Commitment Progress</h3>
          <Badge variant="outline">2050 Target</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-foreground">{netZeroData.progressPercentage}%</div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </div>
            <Progress value={netZeroData.progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {2050 - 2024} years remaining
            </p>
          </div>
          
          <div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-success">{netZeroData.scope1And2Reduction}%</div>
              <p className="text-sm text-muted-foreground">Scope 1 & 2 Reduction</p>
            </div>
            <Progress value={netZeroData.scope1And2Reduction} className="h-2" />
            <div className="flex items-center justify-center mt-2">
              <CheckCircle className="h-3 w-3 text-success mr-1" />
              <span className="text-xs text-success">Ahead of target</span>
            </div>
          </div>
          
          <div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-warning">{netZeroData.scope3Reduction}%</div>
              <p className="text-sm text-muted-foreground">Scope 3 Reduction</p>
            </div>
            <Progress value={netZeroData.scope3Reduction} className="h-2" />
            <div className="flex items-center justify-center mt-2">
              <AlertTriangle className="h-3 w-3 text-warning mr-1" />
              <span className="text-xs text-warning">Action needed</span>
            </div>
          </div>
          
          <div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-primary">{netZeroData.financeEmissionsReduction}%</div>
              <p className="text-sm text-muted-foreground">Financed Emissions</p>
            </div>
            <Progress value={netZeroData.financeEmissionsReduction} className="h-2" />
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="h-3 w-3 text-primary mr-1" />
              <span className="text-xs text-primary">Improving</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Portfolio Sustainability Metrics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Portfolio Sustainability Metrics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioMetrics.map((metric, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-muted ${getStatusColor(metric.status)}`}>
                  {metric.icon}
                </div>
                {getStatusBadge(metric.status)}
              </div>
              
              <h4 className="font-medium text-sm text-foreground mb-2">{metric.title}</h4>
              
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{metric.current}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  <div className={`flex items-center ${metric.trend === 'up' ? 'text-success' : 'text-primary'}`}>
                    {metric.trend === 'up' ? 
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    }
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Current</span>
                    <span>Target: {metric.target}{metric.unit}</span>
                  </div>
                  <Progress 
                    value={(metric.current / metric.target) * 100} 
                    className="h-1" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Green Finance Breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Green Finance Allocation</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">€2.4B</div>
            <p className="text-sm font-medium text-foreground">Green Loans</p>
            <p className="text-xs text-muted-foreground">Renewable energy, efficiency</p>
            <Progress value={68} className="h-2 mt-2" />
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">€1.8B</div>
            <p className="text-sm font-medium text-foreground">Green Bonds</p>
            <p className="text-xs text-muted-foreground">Sustainable infrastructure</p>
            <Progress value={52} className="h-2 mt-2" />
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-finance mb-2">€850M</div>
            <p className="text-sm font-medium text-foreground">Climate Finance</p>
            <p className="text-xs text-muted-foreground">RBF, adaptation projects</p>
            <Progress value={34} className="h-2 mt-2" />
          </div>
        </div>
      </Card>
    </div>
  );
}