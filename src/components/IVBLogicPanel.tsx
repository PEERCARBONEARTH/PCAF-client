import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Play, ArrowRight, Zap } from "lucide-react";

interface IVBTrigger {
  id: string;
  description: string;
  threshold: string;
  amount: string;
  status: "active" | "pending" | "completed";
}

export const IVBLogicPanel = () => {
  const triggers: IVBTrigger[] = [
    {
      id: "TRG-001",
      description: "Verified cooking hours milestone",
      threshold: "200 hours",
      amount: "$15,000",
      status: "active"
    },
    {
      id: "TRG-002", 
      description: "MRV audit completion",
      threshold: "Baseline + 3 months",
      amount: "$8,500",
      status: "pending"
    },
    {
      id: "TRG-003",
      description: "CO₂ savings verification",
      threshold: "50 tCO₂e",
      amount: "$12,000",
      status: "completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "completed": return "bg-muted/10 text-muted-foreground border-muted/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-finance" />
              IVB Logic Engine
            </CardTitle>
            <CardDescription>
              Automated disbursement triggers for results-based finance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-finance/10 text-finance border-finance/20">
              <Play className="h-3 w-3 mr-1" />
              Powered by VeriFund
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {triggers.map((trigger) => (
            <div key={trigger.id} className="feature-item">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(trigger.status)}`}
                  >
                    {trigger.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{trigger.id}</span>
                </div>
                <p className="font-medium text-sm">{trigger.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span className="font-mono">{trigger.threshold}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-semibold text-finance">{trigger.amount}</span>
                  <span className="text-xs">auto-released</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Next Auto-Release</p>
              <p className="text-xs text-muted-foreground">Kibera Primary - 13 hours remaining</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-finance">$15,000</p>
              <p className="text-xs text-muted-foreground">Pending verification</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};