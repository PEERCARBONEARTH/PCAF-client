import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className 
}: MetricCardProps) {
  return (
    <Card className={cn("enhanced-metric-card group stagger-fade-in", className)}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="enhanced-metric-label truncate">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70 mt-1 truncate uppercase tracking-wide">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-sm  bg-primary/10 text-primary shrink-0 ml-3 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
              {icon}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <p className="enhanced-metric-value break-words">{value}</p>
          
          {trend && (
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
                trend.isPositive 
                  ? "bg-success/10 text-success border border-success/20" 
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              )}>
                {trend.isPositive ? "↗" : "↘"} {trend.isPositive ? "+" : ""}{trend.value}
              </span>
              <span className="text-xs text-muted-foreground/60 hidden sm:inline">vs last period</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 rounded-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Card>
  );
}