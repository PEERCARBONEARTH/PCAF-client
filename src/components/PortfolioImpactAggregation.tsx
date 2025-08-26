import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Leaf,
  TrendingUp,
  Target,
  Users,
  Globe,
  Zap,
  Droplets,
  TreePine
} from "lucide-react";

export function PortfolioImpactAggregation() {
  const portfolioSummary = {
    totalCarbonAvoidance: 45670,
    portfolioEmissionsReduction: 23.4,
    scope3Contribution: 18.2,
    greenFinanceTarget: 75,
    greenFinanceActual: 58.3,
    beneficiariesReached: 127500
  };

  const impactCategories = [
    {
      title: "Climate Impact",
      metrics: [
        { label: "Total CO₂ Avoided", value: "45,670", unit: "tCO₂e", icon: <Leaf className="h-4 w-4" /> },
        { label: "Renewable Energy Generated", value: "234", unit: "GWh", icon: <Zap className="h-4 w-4" /> },
        { label: "Energy Efficiency Savings", value: "12.3", unit: "TWh", icon: <TrendingUp className="h-4 w-4" /> }
      ],
      color: "success"
    },
    {
      title: "Environmental Co-benefits",
      metrics: [
        { label: "Water Saved", value: "2.4M", unit: "liters", icon: <Droplets className="h-4 w-4" /> },
        { label: "Trees Equivalent", value: "187K", unit: "trees", icon: <TreePine className="h-4 w-4" /> },
        { label: "Land Protected", value: "5,420", unit: "hectares", icon: <Globe className="h-4 w-4" /> }
      ],
      color: "primary"
    },
    {
      title: "Social Impact",
      metrics: [
        { label: "People Benefited", value: "127,500", unit: "individuals", icon: <Users className="h-4 w-4" /> },
        { label: "Jobs Created", value: "2,840", unit: "positions", icon: <TrendingUp className="h-4 w-4" /> },
        { label: "Communities Reached", value: "89", unit: "locations", icon: <Globe className="h-4 w-4" /> }
      ],
      color: "finance"
    }
  ];

  const sdgContribution = [
    { goal: "SDG 7", name: "Clean Energy", score: 92, color: "bg-yellow-500" },
    { goal: "SDG 13", name: "Climate Action", score: 89, color: "bg-green-500" },
    { goal: "SDG 3", name: "Good Health", score: 76, color: "bg-blue-500" },
    { goal: "SDG 1", name: "No Poverty", score: 68, color: "bg-red-500" },
    { goal: "SDG 8", name: "Decent Work", score: 58, color: "bg-purple-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Portfolio Impact Summary</h3>
          <Badge variant="outline">Net-Zero Contribution</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-success/5 rounded-sm border border-success/20">
            <Leaf className="h-8 w-8 text-success mx-auto mb-3" />
            <div className="text-3xl font-bold text-success mb-1">
              {portfolioSummary.totalCarbonAvoidance.toLocaleString()}
            </div>
            <p className="text-sm font-medium text-foreground">tCO₂e Avoided</p>
            <p className="text-xs text-muted-foreground">Contributes {portfolioSummary.scope3Contribution}% to Scope 3 reduction</p>
          </div>
          
          <div className="text-center p-4 bg-primary/5 rounded-sm border border-primary/20">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary mb-1">
              {portfolioSummary.greenFinanceActual}%
            </div>
            <p className="text-sm font-medium text-foreground">Green Finance Deployed</p>
            <Progress value={portfolioSummary.greenFinanceActual} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground">Target: {portfolioSummary.greenFinanceTarget}%</p>
          </div>
          
          <div className="text-center p-4 bg-finance/5 rounded-sm border border-finance/20">
            <Users className="h-8 w-8 text-finance mx-auto mb-3" />
            <div className="text-3xl font-bold text-finance mb-1">
              {portfolioSummary.beneficiariesReached.toLocaleString()}
            </div>
            <p className="text-sm font-medium text-foreground">People Benefited</p>
            <p className="text-xs text-muted-foreground">Across all funded projects</p>
          </div>
        </div>
      </Card>

      {/* Impact Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {impactCategories.map((category, index) => (
          <Card key={index} className="p-6">
            <h4 className="font-semibold text-foreground mb-4">{category.title}</h4>
            <div className="space-y-4">
              {category.metrics.map((metric, metricIndex) => (
                <div key={metricIndex} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded text-${category.color}`}>
                      {metric.icon}
                    </div>
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">{metric.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* SDG Portfolio Alignment */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">SDG Portfolio Alignment</h3>
          <Badge className="bg-primary/10 text-primary border-primary/20">Portfolio Level</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {sdgContribution.map((sdg, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold ${sdg.color}`}>
                {sdg.goal.split(' ')[1]}
              </div>
              <h5 className="font-medium text-sm text-foreground mb-1">{sdg.goal}</h5>
              <p className="text-xs text-muted-foreground mb-2">{sdg.name}</p>
              <div className="text-lg font-bold text-foreground">{sdg.score}%</div>
              <Progress value={sdg.score} className="h-1 mt-1" />
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/5 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">83%</div>
            <p className="text-sm font-medium text-foreground">Overall SDG Alignment Score</p>
            <p className="text-xs text-muted-foreground">Based on portfolio-weighted impact assessment</p>
          </div>
        </div>
      </Card>

      {/* Scenario Analysis */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Net-Zero Pathway Projection</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-success mb-1">2031</div>
            <p className="text-sm font-medium text-foreground">50% Reduction Target</p>
            <p className="text-xs text-muted-foreground">On current trajectory</p>
            <Badge className="bg-success/10 text-success border-success/20 mt-2">Achievable</Badge>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-warning mb-1">2038</div>
            <p className="text-sm font-medium text-foreground">75% Reduction Target</p>
            <p className="text-xs text-muted-foreground">Requires acceleration</p>
            <Badge className="bg-warning/10 text-warning border-warning/20 mt-2">Challenging</Badge>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">2050</div>
            <p className="text-sm font-medium text-foreground">Net-Zero Target</p>
            <p className="text-xs text-muted-foreground">With current portfolio</p>
            <Badge className="bg-primary/10 text-primary border-primary/20 mt-2">Feasible</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}