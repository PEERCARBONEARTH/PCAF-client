import { AlertTriangle, CheckCircle, Info, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ComplianceAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  metric?: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

const mockAlerts: ComplianceAlert[] = [
  {
    id: '1',
    type: 'error',
    title: 'Poor Data Quality Detected',
    description: '21 loans have PCAF quality scores of 4 or higher',
    recommendation: 'Collect more specific vehicle data, actual mileage, or asset-level emissions data',
    priority: 'high'
  },
  {
    id: '2', 
    type: 'warning',
    title: 'PCAF Box 8 WDQS Compliance Risk',
    description: 'Portfolio WDQS of 3.20 exceeds PCAF recommended threshold of 3.0',
    recommendation: 'Improve data collection processes to achieve PCAF Box 8 WDQS compliance standards',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'info',
    title: 'High Attribution Factors',
    description: '8 loans have attribution factors above 80%',
    recommendation: 'Review outstanding balances and vehicle values for accuracy',
    priority: 'medium'
  }
];

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'error': return AlertTriangle;
    case 'warning': return AlertTriangle;
    case 'info': return Info;
    case 'success': return CheckCircle;
    default: return Info;
  }
};

const getAlertStyles = (type: string) => {
  switch (type) {
    case 'error':
      return {
        border: 'border-l-4 border-l-destructive/60',
        background: 'bg-destructive/5',
        icon: 'text-destructive',
        badge: 'bg-destructive/10 text-destructive border-destructive/20'
      };
    case 'warning':
      return {
        border: 'border-l-4 border-l-warning/60',
        background: 'bg-warning/5',
        icon: 'text-warning',
        badge: 'bg-warning/10 text-warning border-warning/20'
      };
    case 'info':
      return {
        border: 'border-l-4 border-l-info/60',
        background: 'bg-info/5',
        icon: 'text-info',
        badge: 'bg-info/10 text-info border-info/20'
      };
    case 'success':
      return {
        border: 'border-l-4 border-l-success/60',
        background: 'bg-success/5',
        icon: 'text-success',
        badge: 'bg-success/10 text-success border-success/20'
      };
    default:
      return {
        border: 'border-l-4 border-l-muted-foreground/60',
        background: 'bg-muted/30',
        icon: 'text-muted-foreground',
        badge: 'bg-muted text-muted-foreground'
      };
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high': return 'High Priority';
    case 'medium': return 'Medium Priority';
    case 'low': return 'Low Priority';
    default: return priority;
  }
};

export function EnhancedComplianceAlerts() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Compliance Overview</h2>
        <Badge variant="outline" className="text-muted-foreground">
          <TrendingUp className="w-3 h-3 mr-1" />
          3 Active Alerts
        </Badge>
      </div>

      <div className="grid gap-4">
        {mockAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const styles = getAlertStyles(alert.type);
          
          return (
            <Card 
              key={alert.id} 
              className={`${styles.border} ${styles.background} transition-all duration-200 hover:shadow-md`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${styles.icon}`} />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground leading-tight">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${styles.badge} text-xs font-medium`}>
                    {getPriorityBadge(alert.priority)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Alert className="border-0 bg-primary/10 p-3">
                  <AlertDescription className="text-sm">
                    <span className="font-medium text-primary">Recommendation:</span>
                    <span className="ml-2 text-foreground">{alert.recommendation}</span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}