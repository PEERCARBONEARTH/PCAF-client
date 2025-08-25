import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfessionalMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    period?: string;
  };
  className?: string;
  variant?: "default" | "premium" | "impact";
}

export function ProfessionalMetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className,
  variant = "default"
}: ProfessionalMetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)} M`;
      } else if (val >= 1000) {
        return `$${(val / 1000).toFixed(0)} K`;
      } else {
        return `$${val.toLocaleString()}`;
      }
    }
    return val;
  };

  const variantStyles = {
    default: "bg-card border-border/30 hover:border-primary/30",
    premium: "bg-gradient-to-br from-primary/5 to-finance/5 border-primary/20 hover:border-primary/40",
    impact: "bg-gradient-to-br from-success/5 to-primary/5 border-success/20 hover:border-success/40"
  };

  return (
    <Card className={cn(
      "relative overflow-hidden p-6 group transition-all duration-500 cursor-pointer",
      "hover:shadow-[0_20px_40px_hsl(var(--primary)/0.12)]",
      "hover:scale-[1.02] hover:-translate-y-2",
      "backdrop-blur-sm",
      variantStyles[variant],
      className
    )}>
      {/* Enhanced Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        variant === "premium" && "bg-gradient-to-br from-primary/[8%] to-finance/[5%]",
        variant === "impact" && "bg-gradient-to-br from-success/[8%] to-primary/[5%]",
        variant === "default" && "bg-gradient-to-br from-primary/[5%] to-accent/[3%]"
      )} />
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider mb-2 transition-colors duration-300 group-hover:text-primary">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/60 uppercase tracking-wide font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl shrink-0 ml-4",
              "transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
              variant === "premium" && "bg-primary/10 text-primary group-hover:bg-primary/20",
              variant === "impact" && "bg-success/10 text-success group-hover:bg-success/20",
              variant === "default" && "bg-primary/10 text-primary group-hover:bg-primary/20"
            )}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <p className="text-4xl font-black text-foreground transition-all duration-300 group-hover:scale-105 group-hover:text-primary break-words">
            {formatValue(value)}
          </p>
          
          {trend && (
            <div className="flex items-center gap-3">
              <span className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
                "group-hover:scale-110 group-hover:-translate-y-0.5",
                trend.isPositive 
                  ? "bg-success/15 text-success border border-success/30 hover:bg-success/25" 
                  : "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25"
              )}>
                <span className="mr-1">{trend.isPositive ? "↗" : "↘"}</span>
                {trend.isPositive ? "+" : ""}{trend.value}
              </span>
              {trend.period && (
                <span className="text-xs text-muted-foreground/60 font-medium">
                  {trend.period}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Professional Badge */}
      {variant === "premium" && (
        <div className="absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-full">
            PRO
          </div>
        </div>
      )}
    </Card>
  );
}