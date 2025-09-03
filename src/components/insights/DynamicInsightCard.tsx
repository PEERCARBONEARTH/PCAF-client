import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Lightbulb,
  Building2,
  Zap
} from 'lucide-react';
import { DynamicInsight } from '@/services/dynamic-insights-engine';

interface DynamicInsightCardProps {
  insight: DynamicInsight;
  onActionClick?: (action: string) => void;
  className?: string;
}

export function DynamicInsightCard({ insight, onActionClick, className = '' }: DynamicInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: DynamicInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-green-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-brown-200 dark:text-orange-400 dark:bg-brown-950/20 dark:border-green-800';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-800';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800';
    }
  };

  const getTypeIcon = (type: DynamicInsight['type']) => {
    switch (type) {
      case 'strategic': return <Target className="h-4 w-4" />;
      case 'operational': return <Building2 className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity': return <Zap className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend?: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'declining': return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'stable': return <Minus className="h-3 w-3 text-gray-500" />;
      default: return null;
    }
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEffortColor = (effort: 'high' | 'medium' | 'low') => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  return (
    <Card className={`${getPriorityColor(insight.priority)} ${className} transition-all duration-200 hover:shadow-lg`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {getTypeIcon(insight.type)}
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{insight.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {insight.type}
                </Badge>
                <Badge 
                  variant={insight.priority === 'critical' ? 'destructive' : 'secondary'}
                  className="text-xs capitalize"
                >
                  {insight.priority} priority
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(insight.confidence * 100)}% confidence
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div>
          <p className="text-sm font-medium text-foreground mb-1">{insight.summary}</p>
          <p className="text-sm text-muted-foreground">{insight.personalizedMessage}</p>
        </div>

        {/* Key Data Points */}
        {insight.dataPoints.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-foreground">Key Metrics</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insight.dataPoints.map((dataPoint, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{dataPoint.metric}</span>
                    {getTrendIcon(dataPoint.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{dataPoint.current}</span>
                    {dataPoint.target && (
                      <>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Target: {dataPoint.target}</span>
                      </>
                    )}
                  </div>
                  {dataPoint.benchmark && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Industry: {dataPoint.benchmark}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Recommendation */}
        {insight.recommendations.length > 0 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Recommended Action</span>
            </div>
            <p className="text-sm text-foreground mb-2">{insight.recommendations[0].action}</p>
            <div className="flex items-center gap-2 text-xs">
              <Badge className={`${getImpactColor(insight.recommendations[0].impact)} text-xs`}>
                {insight.recommendations[0].impact} impact
              </Badge>
              <Badge className={`${getEffortColor(insight.recommendations[0].effort)} text-xs`}>
                {insight.recommendations[0].effort} effort
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {insight.recommendations[0].timeline}
              </div>
            </div>
          </div>
        )}

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            {/* Bank-Specific Context */}
            {insight.recommendations.length > 0 && insight.recommendations[0].specificToBank && (
              <div className="p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg dark:bg-blue-950/20 dark:border-blue-800/50">
                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Specific to Your Bank
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {insight.recommendations[0].specificToBank}
                </p>
              </div>
            )}

            {/* All Recommendations */}
            {insight.recommendations.length > 1 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-foreground">All Recommendations</h5>
                {insight.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{rec.action}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onActionClick?.(rec.action)}
                        className="ml-2"
                      >
                        Take Action
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rec.specificToBank}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getImpactColor(rec.impact)} text-xs`}>
                        {rec.impact} impact
                      </Badge>
                      <Badge className={`${getEffortColor(rec.effort)} text-xs`}>
                        {rec.effort} effort
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {rec.timeline}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Narrative Context */}
            {insight.narrative && (
              <div className="p-3 bg-muted/20 border border-border/50 rounded-lg">
                <h5 className="text-sm font-medium text-foreground mb-2">Context & Background</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.narrative.summary || insight.narrative.explanation}
                </p>
              </div>
            )}

            {/* Trigger Conditions */}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Updates when:</span> {insight.triggerConditions.join(', ')}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Updated {insight.lastUpdated.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Learn More'}
            </Button>
            {insight.recommendations.length > 0 && (
              <Button
                size="sm"
                onClick={() => onActionClick?.(insight.recommendations[0].action)}
              >
                Take Action
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DynamicInsightCard;