import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp
} from 'lucide-react';
import { ContextualNarrative } from '@/services/contextual-narrative-service';
import AINavigationPopup from '@/components/ui/ai-narrative-popup';

interface NarrativeInsightCardProps {
  title: string;
  children: React.ReactNode;
  narrative?: ContextualNarrative;
  variant?: 'default' | 'warning' | 'success' | 'info';
  className?: string;
}

export function NarrativeInsightCard({ 
  title, 
  children, 
  narrative, 
  variant = 'default',
  className = '' 
}: NarrativeInsightCardProps) {
  const variantStyles = {
    default: 'border-border',
    warning: 'border-brown-200 bg-orange-50/50 dark:border-green-800 dark:bg-orange-950/20',
    success: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20',
    info: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case 'success': return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'info': return <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default: return <BookOpen className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className={`${variantStyles[variant]} ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            {getVariantIcon()}
            {title}
          </CardTitle>
          {narrative && (
            <Badge variant="outline" className="text-xs">
              {Math.round(narrative.confidence * 100)}% confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main content */}
        {children}

        {/* AI Narrative Popup */}
        {narrative && (
          <AINavigationPopup
            narrative={narrative}
            buttonText="What does this mean?"
            buttonVariant="outline"
            buttonSize="sm"
            popupWidth="w-96"
            className="w-full"
          />
        )}
      </CardContent>
    </Card>
  );
}

export default NarrativeInsightCard;