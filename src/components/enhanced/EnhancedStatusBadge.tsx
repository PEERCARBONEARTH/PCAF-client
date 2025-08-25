import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EnhancedStatusBadgeProps {
  status: "active" | "pending" | "completed" | "review" | "risk" | "default";
  children: ReactNode;
  className?: string;
  withAnimation?: boolean;
}

export function EnhancedStatusBadge({ 
  status, 
  children, 
  className,
  withAnimation = true
}: EnhancedStatusBadgeProps) {
  const statusStyles = {
    active: "bg-success/20 text-success border-success/40 hover:bg-success/30 hover:shadow-[0_4px_20px_hsl(var(--success)/0.4)]",
    pending: "bg-warning/20 text-warning border-warning/40 hover:bg-warning/30 hover:shadow-[0_4px_20px_hsl(var(--warning)/0.4)]",
    completed: "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.4)]",
    review: "bg-info/20 text-info border-info/40 hover:bg-info/30 hover:shadow-[0_4px_20px_hsl(var(--info)/0.4)]",
    risk: "bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/30 hover:shadow-[0_4px_20px_hsl(var(--destructive)/0.4)]",
    default: "bg-muted/80 text-muted-foreground border-border/60 hover:bg-muted hover:shadow-[var(--shadow-soft)]"
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-3 py-1 text-xs font-semibold border transition-all duration-300 rounded-full",
        withAnimation && "hover:scale-110 hover:-translate-y-0.5",
        statusStyles[status],
        className
      )}
    >
      {children}
    </Badge>
  );
}