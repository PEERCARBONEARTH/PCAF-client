import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Eye,
  XCircle,
  Pause,
  Play,
  Target,
  FileCheck,
  Flag
} from "lucide-react";

export type StatusType = 
  | 'completed' | 'passed' | 'approved' | 'success' | 'compliant'
  | 'in_progress' | 'in-progress' | 'active' | 'running'
  | 'pending' | 'waiting' | 'queued'
  | 'review' | 'manual_review' | 'needs_review'
  | 'failed' | 'rejected' | 'error' | 'non-compliant'
  | 'blocked' | 'paused' | 'stopped'
  | 'cancelled' | 'terminated'
  | 'on-track' | 'submitted'
  | 'warning' | 'attention_needed';

export type PriorityType = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  icon?: LucideIcon;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  // Success states
  'completed': {
    label: 'Completed',
    variant: 'default',
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle
  },
  'passed': {
    label: 'Passed',
    variant: 'default',
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle
  },
  'approved': {
    label: 'Approved',
    variant: 'default',
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle
  },
  'success': {
    label: 'Success',
    variant: 'default',
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle
  },
  'compliant': {
    label: 'Compliant',
    variant: 'default',
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle
  },
  
  // Active/Progress states
  'in_progress': {
    label: 'In Progress',
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Clock
  },
  'in-progress': {
    label: 'In Progress',
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Clock
  },
  'active': {
    label: 'Active',
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Play
  },
  'running': {
    label: 'Running',
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Play
  },
  'on-track': {
    label: 'On Track',
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Target
  },
  'submitted': {
    label: 'Submitted',
    variant: 'default',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: FileCheck
  },
  
  // Waiting states
  'pending': {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock
  },
  'waiting': {
    label: 'Waiting',
    variant: 'secondary',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock
  },
  'queued': {
    label: 'Queued',
    variant: 'secondary',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock
  },
  
  // Review states
  'review': {
    label: 'Review',
    variant: 'outline',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: Eye
  },
  'manual_review': {
    label: 'Manual Review',
    variant: 'outline',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: Eye
  },
  'needs_review': {
    label: 'Needs Review',
    variant: 'outline',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: Eye
  },
  
  // Error states
  'failed': {
    label: 'Failed',
    variant: 'destructive',
    icon: XCircle
  },
  'rejected': {
    label: 'Rejected',
    variant: 'destructive',
    icon: XCircle
  },
  'error': {
    label: 'Error',
    variant: 'destructive',
    icon: AlertTriangle
  },
  'non-compliant': {
    label: 'Non-Compliant',
    variant: 'destructive',
    icon: AlertTriangle
  },
  
  // Blocked states
  'blocked': {
    label: 'Blocked',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-muted',
    icon: Pause
  },
  'paused': {
    label: 'Paused',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-muted',
    icon: Pause
  },
  'stopped': {
    label: 'Stopped',
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground border-muted',
    icon: Pause
  },
  
  // Terminal states
  'cancelled': {
    label: 'Cancelled',
    variant: 'outline',
    className: 'bg-muted text-muted-foreground border-muted',
    icon: XCircle
  },
  'terminated': {
    label: 'Terminated',
    variant: 'outline',
    className: 'bg-muted text-muted-foreground border-muted',
    icon: XCircle
  },
  
  // Warning states
  'warning': {
    label: 'Warning',
    variant: 'secondary',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: AlertTriangle
  },
  'attention_needed': {
    label: 'Attention Needed',
    variant: 'secondary',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: AlertTriangle
  }
};

const priorityConfigs: Record<PriorityType, StatusConfig> = {
  'low': {
    label: 'Low',
    variant: 'outline',
    className: 'bg-success/10 text-success border-success/20',
    icon: Flag
  },
  'medium': {
    label: 'Medium',
    variant: 'outline',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Flag
  },
  'high': {
    label: 'High',
    variant: 'destructive',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: Flag
  },
  'urgent': {
    label: 'Urgent',
    variant: 'destructive',
    icon: Flag
  },
  'critical': {
    label: 'Critical',
    variant: 'destructive',
    icon: AlertTriangle
  }
};

interface UnifiedStatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface UnifiedPriorityBadgeProps {
  priority: PriorityType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UnifiedStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className: customClassName
}: UnifiedStatusBadgeProps) {
  const config = statusConfigs[status];
  
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return (
      <Badge variant="outline" className={customClassName}>
        {status}
      </Badge>
    );
  }

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className || ''} ${sizeClasses[size]} ${customClassName || ''}`}
    >
      {showIcon && Icon && (
        <Icon className={`${iconSizes[size]} mr-1`} />
      )}
      {config.label}
    </Badge>
  );
}

export function UnifiedPriorityBadge({ 
  priority, 
  showIcon = true, 
  size = 'md',
  className: customClassName
}: UnifiedPriorityBadgeProps) {
  const config = priorityConfigs[priority];
  
  if (!config) {
    console.warn(`Unknown priority: ${priority}`);
    return (
      <Badge variant="outline" className={customClassName}>
        {priority}
      </Badge>
    );
  }

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className || ''} ${sizeClasses[size]} ${customClassName || ''}`}
    >
      {showIcon && Icon && (
        <Icon className={`${iconSizes[size]} mr-1`} />
      )}
      {config.label}
    </Badge>
  );
}

// Utility functions for getting status/priority configurations
export function getStatusConfig(status: StatusType) {
  return statusConfigs[status];
}

export function getPriorityConfig(priority: PriorityType) {
  return priorityConfigs[priority];
}

// Helper function to determine status category
export function getStatusCategory(status: StatusType): 'success' | 'active' | 'waiting' | 'review' | 'error' | 'blocked' | 'terminal' | 'warning' {
  const successStates: StatusType[] = ['completed', 'passed', 'approved', 'success', 'compliant'];
  const activeStates: StatusType[] = ['in_progress', 'in-progress', 'active', 'running', 'on-track', 'submitted'];
  const waitingStates: StatusType[] = ['pending', 'waiting', 'queued'];
  const reviewStates: StatusType[] = ['review', 'manual_review', 'needs_review'];
  const errorStates: StatusType[] = ['failed', 'rejected', 'error', 'non-compliant'];
  const blockedStates: StatusType[] = ['blocked', 'paused', 'stopped'];
  const terminalStates: StatusType[] = ['cancelled', 'terminated'];
  const warningStates: StatusType[] = ['warning', 'attention_needed'];

  if (successStates.includes(status)) return 'success';
  if (activeStates.includes(status)) return 'active';
  if (waitingStates.includes(status)) return 'waiting';
  if (reviewStates.includes(status)) return 'review';
  if (errorStates.includes(status)) return 'error';
  if (blockedStates.includes(status)) return 'blocked';
  if (terminalStates.includes(status)) return 'terminal';
  if (warningStates.includes(status)) return 'warning';
  
  return 'waiting'; // default
}