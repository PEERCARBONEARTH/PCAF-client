import React from 'react';
import { Shield, Lock, CheckCircle } from 'lucide-react';

export const SecurityAssurance: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-card/40 border border-border/30">
      <Lock className="h-4 w-4 text-accent" />
      <span className="text-sm text-muted-foreground">
        Enterprise-grade security
      </span>
      <div className="flex items-center gap-1">
        <Shield className="h-3 w-3 text-accent" />
        <span className="text-xs text-accent font-medium">ISO 27001</span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-accent" />
        <span className="text-xs text-accent font-medium">OAuth 2.0</span>
      </div>
    </div>
  );
};