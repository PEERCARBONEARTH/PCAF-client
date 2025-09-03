import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { contextualNarrativeService, ContextualNarrative } from '@/services/contextual-narrative-service';

interface AIContextTooltipProps {
  metricType: string;
  metricValue: string | number;
  additionalData?: any;
  className?: string;
}

export function AIContextTooltip({ 
  metricType, 
  metricValue, 
  additionalData, 
  className = '' 
}: AIContextTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [narrative, setNarrative] = useState<ContextualNarrative | null>(null);

  const handleClick = async () => {
    if (!isOpen) {
      // Generate contextual narrative based on metric type
      let generatedNarrative: ContextualNarrative | null = null;
      
      switch (metricType) {
        case 'ev_percentage':
          generatedNarrative = contextualNarrativeService.generateStrategicInsightNarrative('ev_transition', {
            evPercentage: metricValue,
            ...additionalData
          });
          break;
        case 'emissions':
          generatedNarrative = contextualNarrativeService.generateEmissionsForecastNarrative('base_case', Number(metricValue));
          break;
        case 'data_quality':
          generatedNarrative = contextualNarrativeService.generateStrategicInsightNarrative('data_quality', {
            avgDataQuality: metricValue,
            ...additionalData
          });
          break;
        case 'portfolio_health':
          generatedNarrative = contextualNarrativeService.generateStrategicInsightNarrative('portfolio_optimization', {
            portfolioHealth: metricValue,
            ...additionalData
          });
          break;
        case 'climate_scenario':
          generatedNarrative = contextualNarrativeService.generateClimateScenarioNarrative(
            additionalData?.scenario || 'orderly', 
            Number(metricValue)
          );
          break;
        case 'risk_analytics':
          generatedNarrative = contextualNarrativeService.generateRiskAnalyticsNarrative(
            additionalData?.riskType || 'transition_risk',
            additionalData?.severity || 'medium'
          );
          break;
        default:
          generatedNarrative = {
            title: 'Metric Analysis',
            summary: `Analysis of ${metricType} metric`,
            explanation: `This metric shows ${metricValue} which indicates the current performance level.`,
            implications: ['Monitor this metric for changes', 'Consider benchmarking against industry standards'],
            actionableInsights: ['Review underlying data', 'Set targets for improvement'],
            sources: ['Portfolio Analysis', 'Industry Standards'],
            confidence: 0.8
          };
      }
      
      setNarrative(generatedNarrative);
    }
    setIsOpen(!isOpen);
  };

  const getIcon = () => {
    switch (metricType) {
      case 'ev_percentage':
        return <TrendingUp className="h-3 w-3" />;
      case 'emissions':
        return <AlertTriangle className="h-3 w-3" />;
      case 'data_quality':
        return <CheckCircle className="h-3 w-3" />;
      case 'portfolio_health':
        return <Lightbulb className="h-3 w-3" />;
      default:
        return <Brain className="h-3 w-3" />;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="h-6 w-6 p-0 hover:bg-primary/10 rounded-full"
        title="Get AI explanation"
      >
        <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary" />
      </Button>

      {isOpen && narrative && (
        <div className="absolute z-50 top-8 right-0 w-80 bg-card border border-border rounded-lg shadow-lg p-4 animate-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getIcon()}
              <h4 className="font-semibold text-sm text-foreground">{narrative.title}</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Summary */}
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">{narrative.summary}</p>
          </div>

          {/* Explanation */}
          <div className="mb-3">
            <h5 className="text-xs font-medium text-foreground mb-1">What this means:</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">{narrative.explanation}</p>
          </div>

          {/* Key Implications */}
          {narrative.implications.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-foreground mb-1">Key implications:</h5>
              <ul className="space-y-1">
                {narrative.implications.slice(0, 2).map((implication, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    {implication}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Actions */}
          {narrative.actionableInsights.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-foreground mb-1">Recommended actions:</h5>
              <ul className="space-y-1">
                {narrative.actionableInsights.slice(0, 2).map((insight, index) => (
                  <li key={index} className="text-xs text-green-600 dark:text-green-400 flex items-start gap-1">
                    <CheckCircle className="w-2 h-2 mt-1.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence & Sources */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {Math.round(narrative.confidence * 100)}% confidence
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {narrative.sources.slice(0, 2).join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIContextTooltip;