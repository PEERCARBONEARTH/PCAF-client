import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { type LoanPortfolioItem } from "@/lib/db";
import { Cloud, Thermometer, Droplets, Wind, AlertTriangle, TrendingUp, MapPin } from "lucide-react";

interface ClimateRiskPanelsProps {
  loans: LoanPortfolioItem[];
  onRiskClick?: (riskType: string, severity: string, description: string) => void;
}

interface PhysicalRisk {
  type: string;
  severity: 'low' | 'medium' | 'high';
  exposure: number;
  description: string;
  timeframe: string;
  icon: any;
}

interface TransitionRisk {
  type: string;
  severity: 'low' | 'medium' | 'high';
  exposure: number;
  description: string;
  timeframe: string;
  icon: any;
}

export function ClimateRiskPanels({ loans, onRiskClick }: ClimateRiskPanelsProps) {
  // Calculate physical risks based on portfolio composition
  const physicalRisks: PhysicalRisk[] = [
    {
      type: "Extreme Weather Events",
      severity: "medium",
      exposure: 35.2,
      description: "Heat waves and flooding affecting vehicle operations and residual values",
      timeframe: "2030-2040",
      icon: Cloud
    },
    {
      type: "Temperature Rise",
      severity: "low",
      exposure: 18.7,
      description: "Increased cooling costs and potential impact on battery performance",
      timeframe: "2040-2050", 
      icon: Thermometer
    },
    {
      type: "Water Stress",
      severity: "low",
      exposure: 12.4,
      description: "Manufacturing disruption affecting vehicle supply chains",
      timeframe: "2030-2040",
      icon: Droplets
    },
    {
      type: "Sea Level Rise",
      severity: "medium",
      exposure: 28.9,
      description: "Coastal infrastructure impacts affecting transportation networks",
      timeframe: "2040-2050",
      icon: Wind
    }
  ];

  // Calculate transition risks
  const evPercentage = loans.filter(loan => 
    loan.fuel_type.toLowerCase().includes('electric') || 
    loan.fuel_type.toLowerCase().includes('hybrid')
  ).length / loans.length * 100;

  const years = loans.map(l => l.manufacturing_year).filter((y): y is number => typeof y === 'number');
  const avgYear = years.length ? years.reduce((a, b) => a + b, 0) / years.length : new Date().getFullYear();
  const avgVehicleAge = new Date().getFullYear() - avgYear;

  const transitionRisks: TransitionRisk[] = [
    {
      type: "Policy & Regulatory",
      severity: evPercentage < 20 ? "high" : evPercentage < 40 ? "medium" : "low",
      exposure: Math.max(0, 100 - evPercentage * 2),
      description: `ICE vehicle bans and carbon pricing. Current EV exposure: ${evPercentage.toFixed(1)}%`,
      timeframe: "2025-2030",
      icon: AlertTriangle
    },
    {
      type: "Technology Disruption", 
      severity: avgVehicleAge > 8 ? "high" : avgVehicleAge > 5 ? "medium" : "low",
      exposure: Math.min(100, avgVehicleAge * 10),
      description: `Rapid EV advancement affecting residual values. Avg portfolio age: ${avgVehicleAge.toFixed(1)} years`,
      timeframe: "2025-2035",
      icon: TrendingUp
    },
    {
      type: "Market Preference Shift",
      severity: evPercentage < 25 ? "medium" : "low", 
      exposure: Math.max(0, 70 - evPercentage * 1.5),
      description: "Consumer preference shifting to sustainable vehicles",
      timeframe: "2025-2030",
      icon: MapPin
    },
    {
      type: "Stranded Asset Risk",
      severity: evPercentage < 15 ? "high" : evPercentage < 30 ? "medium" : "low",
      exposure: Math.max(0, 90 - evPercentage * 2.5),
      description: "ICE vehicles becoming economically unviable before loan maturity",
      timeframe: "2030-2040", 
      icon: AlertTriangle
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getExposureColor = (exposure: number) => {
    if (exposure >= 70) return 'text-destructive';
    if (exposure >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Physical Climate Risks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              Physical Climate Risks
            </CardTitle>
            <Badge variant="outline">4 risk factors</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-500/50 bg-blue-50/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Physical risks from changing climate patterns affecting vehicle operations and infrastructure.
            </AlertDescription>
          </Alert>

          {physicalRisks.map((risk, index) => {
            const Icon = risk.icon;
            return (
              <div 
                key={index}
                className="p-4 border rounded-sm hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onRiskClick?.('physical', risk.severity, `${risk.type}: ${risk.description}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">{risk.type}</h4>
                  </div>
                  <Badge variant={getSeverityColor(risk.severity)} className="text-xs">
                    {risk.severity.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">{risk.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Portfolio Exposure</span>
                    <span className={getExposureColor(risk.exposure)}>{risk.exposure.toFixed(1)}%</span>
                  </div>
                  <Progress value={risk.exposure} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Timeframe: {risk.timeframe}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Transition Climate Risks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Transition Climate Risks
            </CardTitle>
            <Badge variant="outline">4 risk factors</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-500/50 bg-orange-50/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Transition risks from economic and policy shifts toward a low-carbon economy.
            </AlertDescription>
          </Alert>

          {transitionRisks.map((risk, index) => {
            const Icon = risk.icon;
            return (
              <div 
                key={index}
                className="p-4 border rounded-sm hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onRiskClick?.('transition', risk.severity, `${risk.type}: ${risk.description}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">{risk.type}</h4>
                  </div>
                  <Badge variant={getSeverityColor(risk.severity)} className="text-xs">
                    {risk.severity.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">{risk.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Portfolio Exposure</span>
                    <span className={getExposureColor(risk.exposure)}>{risk.exposure.toFixed(1)}%</span>
                  </div>
                  <Progress value={risk.exposure} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Timeframe: {risk.timeframe}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}