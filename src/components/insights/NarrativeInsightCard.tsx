import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ContextualNarrative } from '@/services/contextual-narrative-service';

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
  const [isNarrativeOpen, setIsNarrativeOpen] = useState(false);

  const variantStyles = {
    default: 'border-border',
    warning: 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20',
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {Math.round(narrative.confidence * 100)}% confidence
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNarrativeOpen(!isNarrativeOpen)}
                className="h-8 w-8 p-0"
              >
                {isNarrativeOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main content */}
        {children}

        {/* Narrative explanation */}
        {narrative && (
          <Collapsible open={isNarrativeOpen} onOpenChange={setIsNarrativeOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  What does this mean?
                </span>
                {isNarrativeOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                {/* Summary */}
                <div className="mb-3">
                  <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Summary
                  </h5>
                  <p className="text-sm text-muted-foreground">{narrative.summary}</p>
                </div>

                {/* Detailed explanation */}
                <div className="mb-3">
                  <h5 className="font-medium text-sm text-foreground mb-2">Explanation</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {narrative.explanation}
                  </p>
                </div>

                {/* Implications */}
                {narrative.implications.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Key Implications
                    </h5>
                    <ul className="space-y-1">
                      {narrative.implications.map((implication, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {implication}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actionable insights */}
                {narrative.actionableInsights.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Recommended Actions
                    </h5>
                    <ul className="space-y-1">
                      {narrative.actionableInsights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Methodology */}
                {narrative.methodology && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Methodology
                    </h5>
                    <p className="text-xs text-muted-foreground italic">
                      {narrative.methodology}
                    </p>
                  </div>
                )}

                {/* Sources */}
                {narrative.sources.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-purple-500" />
                      Sources
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {narrative.sources.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

export default NarrativeInsightCard;