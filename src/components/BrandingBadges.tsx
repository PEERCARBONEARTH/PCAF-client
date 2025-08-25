import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';

export const BrandingBadges: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start animate-fade-in animation-delay-400">
      <Badge 
        variant="outline" 
        className="px-3 py-1 bg-primary/5 border-primary/30 text-primary hover:bg-primary/10 transition-colors"
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Powered by VeriFund™
      </Badge>
      <Badge 
        variant="outline" 
        className="px-3 py-1 bg-finance/5 border-finance/30 text-finance hover:bg-finance/10 transition-colors"
      >
        <Zap className="h-3 w-3 mr-1" />
        IVB Logic Engine
      </Badge>
    </div>
  );
};