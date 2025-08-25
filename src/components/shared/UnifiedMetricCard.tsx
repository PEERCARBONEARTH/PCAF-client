import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  urgent?: number;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    change: "text-muted-foreground"
  },
  success: {
    icon: "bg-success/10 text-success",
    change: "text-success"
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    change: "text-warning"
  },
  destructive: {
    icon: "bg-destructive/10 text-destructive",
    change: "text-destructive"
  },
  info: {
    icon: "bg-info/10 text-info",
    change: "text-info"
  }
};

const trendStyles = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground"
};

export function UnifiedMetricCard({
  label,
  value,
  subtext,
  change,
  icon: Icon,
  variant = 'default',
  urgent,
  progress,
  trend = 'neutral',
  onClick
}: MetricCardProps) {
  const styles = variantStyles[variant];
  const trendStyle = change ? trendStyles[trend] : "text-muted-foreground";

  return (
    <Card 
      className={`metric-card transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="metric-label text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="metric-value text-2xl font-bold text-foreground mt-2">
              {value}
            </p>
            
            {subtext && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtext}
              </p>
            )}
            
            {change && (
              <p className={`text-xs mt-1 ${trendStyle}`}>
                {change}
              </p>
            )}
            
            {urgent && urgent > 0 && (
              <Badge variant="destructive" className="text-xs mt-2">
                {urgent} urgent
              </Badge>
            )}
            
            {progress !== undefined && (
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {progress}% complete
                </p>
              </div>
            )}
          </div>
          
          {Icon && (
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${styles.icon}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricGrid({ 
  metrics, 
  columns = 4 
}: { 
  metrics: MetricCardProps[]; 
  columns?: number;
}) {
  const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`;
  
  return (
    <div className={gridClass}>
      {metrics.map((metric, index) => (
        <UnifiedMetricCard key={index} {...metric} />
      ))}
    </div>
  );
}