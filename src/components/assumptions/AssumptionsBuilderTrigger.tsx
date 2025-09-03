import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Edit, FileText } from 'lucide-react';
import { useAssumptionsBuilder } from '@/hooks/useAssumptionsBuilder';
import AssumptionsBuilder from './AssumptionsBuilder';

interface AssumptionsBuilderTriggerProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showStatus?: boolean;
  children?: React.ReactNode;
}

export default function AssumptionsBuilderTrigger({
  variant = 'default',
  size = 'default',
  className = '',
  showStatus = true,
  children
}: AssumptionsBuilderTriggerProps) {
  const {
    isBuilderOpen,
    openBuilder,
    closeBuilder,
    saveAssumptions,
    getCurrentAssumptions,
    hasAssumptions
  } = useAssumptionsBuilder();

  const currentAssumptions = getCurrentAssumptions();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={openBuilder}
        className={`flex items-center gap-2 ${className}`}
      >
        {hasAssumptions ? (
          <Edit className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {children || (
          <>
            {hasAssumptions ? 'Edit Assumptions' : 'Configure Assumptions'}
            {showStatus && hasAssumptions && (
              <Badge variant="secondary" className="ml-1">
                {currentAssumptions.length} types
              </Badge>
            )}
          </>
        )}
      </Button>

      <AssumptionsBuilder
        isOpen={isBuilderOpen}
        onClose={closeBuilder}
        onSave={saveAssumptions}
        initialAssumptions={currentAssumptions}
      />
    </>
  );
}

// Export a simple icon-only version for compact spaces
export function AssumptionsBuilderIcon({
  className = '',
  showTooltip = true
}: {
  className?: string;
  showTooltip?: boolean;
}) {
  const { openBuilder, hasAssumptions, getCurrentAssumptions } = useAssumptionsBuilder();
  const currentAssumptions = getCurrentAssumptions();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openBuilder}
      className={`h-8 w-8 p-0 ${className}`}
      title={showTooltip ? (hasAssumptions ? `Edit ${currentAssumptions.length} assumptions` : 'Configure assumptions') : undefined}
    >
      {hasAssumptions ? (
        <FileText className="h-4 w-4 text-primary" />
      ) : (
        <Settings className="h-4 w-4" />
      )}
    </Button>
  );
}

// Export a card version for dashboard use
export function AssumptionsBuilderCard({
  className = ''
}: {
  className?: string;
}) {
  const { openBuilder, hasAssumptions, getCurrentAssumptions } = useAssumptionsBuilder();
  const currentAssumptions = getCurrentAssumptions();

  return (
    <div
      onClick={openBuilder}
      className={`p-4 border border-border rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-primary/50 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Vehicle Assumptions</h3>
        </div>
        {hasAssumptions && (
          <Badge variant="secondary">
            {currentAssumptions.length} configured
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {hasAssumptions
          ? 'Configure activity basis and statistical sources for emissions calculations'
          : 'Set up vehicle type assumptions for PCAF methodology compliance'
        }
      </p>
      {hasAssumptions && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      )}
    </div>
  );
}