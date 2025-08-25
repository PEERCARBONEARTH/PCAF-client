import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type LoanPortfolioItem } from "@/lib/db";
import { TrendingUp, TrendingDown, DollarSign, Target, ExternalLink, AlertTriangle } from "lucide-react";

interface NGFSScenarioAnalysisProps {
  loans: LoanPortfolioItem[];
  onScenarioClick?: (scenario: NGFSScenario) => void;
}

interface NGFSScenario {
  name: string;
  category: 'orderly' | 'disorderly' | 'hot-house';
  description: string;
  emissionChange: number;
  riskChange: number;
  costImpact: number;
  probability: number;
  timeframe: string;
  keyAssumptions: string[];
  portfolioImpact: {
    evDemand: number;
    iceValueLoss: number;
    regulatoryCost: number;
    operationalRisk: number;
  };
}

export function NGFSScenarioAnalysis({ loans, onScenarioClick }: NGFSScenarioAnalysisProps) {
  const totalPortfolioValue = loans.reduce((sum, loan) => sum + loan.loan_amount, 0);
  const currentEvPercentage = loans.filter(loan => 
    loan.fuel_type.toLowerCase().includes('electric') || 
    loan.fuel_type.toLowerCase().includes('hybrid')
  ).length / loans.length * 100;

  const scenarios: NGFSScenario[] = [
    {
      name: "Net Zero 2050",
      category: "orderly",
      description: "Immediate policy reaction and smooth transition to net zero by 2050",
      emissionChange: -65.8,
      riskChange: -25.3,
      costImpact: 180000,
      probability: 0.35,
      timeframe: "2024-2050",
      keyAssumptions: [
        "Carbon price reaches $150/tCO2 by 2030",
        "ICE vehicle sales ban by 2035",
        "Massive EV infrastructure investment"
      ],
      portfolioImpact: {
        evDemand: 85,
        iceValueLoss: 45,
        regulatoryCost: 15,
        operationalRisk: 10
      }
    },
    {
      name: "Below 2°C",
      category: "orderly", 
      description: "Gradual policy tightening achieving below 2°C warming",
      emissionChange: -45.2,
      riskChange: -15.8,
      costImpact: 120000,
      probability: 0.45,
      timeframe: "2024-2070",
      keyAssumptions: [
        "Carbon price reaches $100/tCO2 by 2040",
        "ICE phase-out by 2040-2045",
        "Moderate transition support"
      ],
      portfolioImpact: {
        evDemand: 70,
        iceValueLoss: 30,
        regulatoryCost: 12,
        operationalRisk: 8
      }
    },
    {
      name: "Delayed Transition",
      category: "disorderly",
      description: "Late but rapid policy action leading to economic disruption",
      emissionChange: -55.7,
      riskChange: 45.2,
      costImpact: 320000,
      probability: 0.25,
      timeframe: "2030-2050",
      keyAssumptions: [
        "Sudden carbon price spike to $200/tCO2",
        "Emergency ICE ban in 2030",
        "Supply chain disruptions"
      ],
      portfolioImpact: {
        evDemand: 90,
        iceValueLoss: 65,
        regulatoryCost: 35,
        operationalRisk: 40
      }
    },
    {
      name: "Divergent Net Zero",
      category: "disorderly",
      description: "Uneven policy implementation across regions",
      emissionChange: -35.4,
      riskChange: 28.9,
      costImpact: 220000,
      probability: 0.30,
      timeframe: "2024-2060",
      keyAssumptions: [
        "Regional policy fragmentation",
        "Trade barriers for high-carbon vehicles",
        "Technology access inequality"
      ],
      portfolioImpact: {
        evDemand: 55,
        iceValueLoss: 40,
        regulatoryCost: 25,
        operationalRisk: 30
      }
    },
    {
      name: "Current Policies",
      category: "hot-house",
      description: "No additional climate policies, 3°C+ warming",
      emissionChange: 15.8,
      riskChange: 65.7,
      costImpact: 450000,
      probability: 0.15,
      timeframe: "2024-2100",
      keyAssumptions: [
        "Minimal carbon pricing",
        "No ICE phase-out",
        "Severe physical climate impacts"
      ],
      portfolioImpact: {
        evDemand: 25,
        iceValueLoss: 20,
        regulatoryCost: 5,
        operationalRisk: 70
      }
    },
    {
      name: "Nationally Determined",
      category: "hot-house", 
      description: "Current NDCs only, 2.5-3°C warming",
      emissionChange: -5.3,
      riskChange: 52.1,
      costImpact: 380000,
      probability: 0.20,
      timeframe: "2024-2080",
      keyAssumptions: [
        "Limited carbon pricing ($50/tCO2)",
        "Partial ICE restrictions",
        "Moderate physical risks"
      ],
      portfolioImpact: {
        evDemand: 40,
        iceValueLoss: 25,
        regulatoryCost: 8,
        operationalRisk: 55
      }
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'orderly': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'disorderly': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'hot-house': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'orderly': return 'Orderly Transition';
      case 'disorderly': return 'Disorderly Transition';
      case 'hot-house': return 'Hot House World';
      default: return category;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            NGFS Climate Scenarios
          </CardTitle>
          <Badge variant="outline">
            Based on NGFS Phase IV
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Analysis based on Network for Greening the Financial System (NGFS) climate scenarios. 
            Current portfolio EV exposure: {currentEvPercentage.toFixed(1)}%
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 text-left justify-start"
              onClick={() => onScenarioClick?.(scenario)}
            >
              <div className="w-full space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{scenario.name}</h4>
                    <Badge className={`text-xs mt-1 ${getCategoryColor(scenario.category)}`}>
                      {getCategoryLabel(scenario.category)}
                    </Badge>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {scenario.emissionChange > 0 ? 
                      <TrendingUp className="h-3 w-3 text-red-500" /> : 
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    }
                    <span className={scenario.emissionChange > 0 ? 'text-red-600' : 'text-green-600'}>
                      {scenario.emissionChange > 0 ? '+' : ''}{scenario.emissionChange.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-orange-500" />
                    <span className="text-orange-600">
                      ${(scenario.costImpact / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>

                {/* Portfolio Impact Preview */}
                <div className="text-xs text-muted-foreground">
                  <div>EV Demand: {scenario.portfolioImpact.evDemand}%</div>
                  <div>ICE Value Loss: {scenario.portfolioImpact.iceValueLoss}%</div>
                </div>

                {/* Probability */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Probability</span>
                  <Badge variant="outline" className="text-xs">
                    {(scenario.probability * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Summary Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {scenarios.filter(s => s.category === 'orderly').length}
            </div>
            <div className="text-sm text-muted-foreground">Orderly Scenarios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {scenarios.filter(s => s.category === 'disorderly').length}
            </div>
            <div className="text-sm text-muted-foreground">Disorderly Scenarios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {scenarios.filter(s => s.category === 'hot-house').length}
            </div>
            <div className="text-sm text-muted-foreground">Hot House Scenarios</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}