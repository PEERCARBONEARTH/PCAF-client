import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InsightItem {
  title: string;
  subtitle: string;
  detail?: string;
  status?: "success" | "warning" | "info" | "danger";
  action?: ReactNode;
  value?: string | number;
  trend?: 'up' | 'down' | 'stable';
}

interface EnhancedInsightCardProps {
  title: string;
  icon: ReactNode;
  items: InsightItem[];
  variant?: "default" | "success" | "warning" | "info" | "opportunity";
  className?: string;
  confidence?: number;
  priority?: 'high' | 'medium' | 'low';
  actionable?: boolean;
  onActionClick?: () => void;
  actionLabel?: string;
}

export function EnhancedInsightCard({ 
  title, 
  icon, 
  items, 
  variant = "default",
  className,
  confidence,
  priority,
  actionable,
  onActionClick,
  actionLabel = "Take Action"
}: EnhancedInsightCardProps) {
  const variantStyles = {
    default: "border-border/30 hover:border-primary/30",
    success: "border-success/20 hover:border-success/40 bg-gradient-to-br from-success/[2%] to-transparent",
    warning: "border-warning/20 hover:border-warning/40 bg-gradient-to-br from-warning/[2%] to-transparent",
    info: "border-info/20 hover:border-info/40 bg-gradient-to-br from-info/[2%] to-transparent",
    opportunity: "border-primary/30 hover:border-primary/50 bg-gradient-to-br from-primary/[3%] to-transparent"
  };

  const iconColors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning", 
    info: "text-info",
    opportunity: "text-primary"
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-muted/10 text-muted-foreground border-muted/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      case "stable":
        return "→";
      default:
        return null;
    }
  };

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success border-success/20 hover:bg-success/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20";
      case "info":
        return "bg-info/10 text-info border-info/20 hover:bg-info/20";
      case "danger":
        return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
      default:
        return "bg-muted/50 text-muted-foreground border-border/20 hover:bg-muted/70";
    }
  };

  return (
    <Card className={cn(
      "p-6 transition-all duration-500 hover:shadow-[0_12px_32px_hsl(var(--primary)/0.1)]",
      "hover:scale-[1.01] hover:-translate-y-1 backdrop-blur-sm relative overflow-hidden",
      variantStyles[variant],
      className
    )}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-sm transition-all duration-300",
            variant === "success" && "bg-success/10 hover:bg-success/20",
            variant === "warning" && "bg-warning/10 hover:bg-warning/20",
            variant === "info" && "bg-info/10 hover:bg-info/20",
            variant === "opportunity" && "bg-primary/10 hover:bg-primary/20",
            variant === "default" && "bg-primary/10 hover:bg-primary/20"
          )}>
            <div className={cn("h-5 w-5", iconColors[variant])}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg tracking-tight">{title}</h3>
            {confidence && (
              <p className="text-xs text-muted-foreground">
                {confidence}% confidence
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {priority && (
            <Badge variant="outline" className={cn("text-xs px-2 py-1", getPriorityColor(priority))}>
              {priority.toUpperCase()}
            </Badge>
          )}
          {actionable && onActionClick && (
            <button
              onClick={onActionClick}
              className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
      
      {/* Enhanced Items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className={cn(
            "group flex items-center justify-between p-4 rounded-sm border transition-all duration-300",
            "hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 cursor-pointer",
            getStatusStyles(item.status)
          )}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Status Indicator Dot */}
              <div className={cn(
                "w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-125",
                item.status === "success" && "bg-gradient-to-r from-success to-success-light shadow-md shadow-success/30",
                item.status === "warning" && "bg-gradient-to-r from-warning to-warning-light shadow-md shadow-warning/30",
                item.status === "info" && "bg-gradient-to-r from-info to-info-light shadow-md shadow-info/30",
                item.status === "danger" && "bg-gradient-to-r from-destructive to-destructive/70 shadow-md shadow-destructive/30",
                !item.status && "bg-gradient-to-r from-muted-foreground to-muted shadow-md shadow-muted/30"
              )} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  {item.trend && (
                    <span className="text-xs text-muted-foreground">
                      {getTrendIcon(item.trend)}
                    </span>
                  )}
                  {item.value && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 ml-auto">
                      {item.value}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.subtitle}
                </p>
                {item.detail && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
            
            {item.action && (
              <div className="shrink-0 ml-3">
                {item.action}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-transparent via-primary/10 to-transparent pointer-events-none" />
    </Card>
  );
}