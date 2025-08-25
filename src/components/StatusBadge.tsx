import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "pending" | "risk" | "completed" | "overdue";
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusClasses = {
    active: "status-active",
    completed: "status-active",
    pending: "status-pending",
    risk: "status-risk",
    overdue: "status-risk"
  };

  return (
    <Badge className={cn("text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-300 hover:scale-105 hover:-translate-y-0.5", statusClasses[status])}>
      {children}
    </Badge>
  );
}