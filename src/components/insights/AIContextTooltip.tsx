import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import {
  contextualNarrativeService,
  ContextualNarrative,
} from '@/services/contextual-narrative-service';
import AINavigationPopup from '@/components/ui/ai-narrative-popup';

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
  className = '',
}: AIContextTooltipProps) {
  const [narrative, setNarrative] = useState<ContextualNarrative | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const generateNarrative = async (): Promise<ContextualNarrative> => {
    if (narrative) return narrative;

    setIsLoading(true);

    try {
      // First, try to get AI-powered explanation using OpenAI + ChromaDB RAG
      const aiQuery = `Explain the ${metricType} metric with value ${metricValue} in the context of PCAF financed emissions analysis. ${additionalData ? `Additional context: ${JSON.stringify(additionalData)}` : ''}`;

      // Call the AI service with ChromaDB RAG integration
      const aiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chroma/rag-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          query: aiQuery,
          collection_name: 'pcaf_calculation_optimized',
          max_results: 3,
          include_metadata: true,
          context_type: 'metric_explanation',
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();

        // Transform AI response to narrative format
        const generatedNarrative = {
          title: `AI Analysis: ${metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          summary: aiData.response || `AI-powered analysis of ${metricType} metric`,
          explanation: aiData.detailed_explanation || aiData.response,
          implications: aiData.implications || ['AI-generated insights based on PCAF methodology'],
          actionableInsights: aiData.recommendations || [
            'Consult PCAF guidelines for specific actions',
          ],
          methodology:
            'Generated using OpenAI GPT-4 with ChromaDB vector search of PCAF knowledge base',
          sources: aiData.sources?.map((s: any) => s.title || s.source) || [
            'PCAF Knowledge Base',
            'AI Analysis',
          ],
          confidence: aiData.confidence || 0.85,
        };

        setNarrative(generatedNarrative);
        return generatedNarrative;
      } else {
        throw new Error('AI service unavailable');
      }
    } catch (error) {
      console.warn('AI service unavailable, falling back to contextual service:', error);

      // Fallback to contextual narrative service
      let generatedNarrative: ContextualNarrative;

      switch (metricType) {
        case 'ev_percentage':
          generatedNarrative = contextualNarrativeService.generateStrategicInsightNarrative(
            'ev_transition',
            {
              evPercentage: metricValue,
              ...additionalData,
            }
          );
          break;
        case 'emissions':
          generatedNarrative = contextualNarrativeService.generateEmissionsForecastNarrative(
            'base_case',
            Number(metricValue)
          );
          break;
        case 'data_quality':
          generatedNarrative = contextualNarrativeService.generateStrategicInsightNarrative(
            'data_quality',
            {
              avgDataQuality: metricValue,
              ...additionalData,
            }
          );
          break;
        case 'portfolio_health':
          generatedNarrative = contextualNarrativeService.generateStrategicInsightNarrative(
            'portfolio_optimization',
            {
              portfolioHealth: metricValue,
              ...additionalData,
            }
          );
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
            implications: [
              'Monitor this metric for changes',
              'Consider benchmarking against industry standards',
            ],
            actionableInsights: ['Review underlying data', 'Set targets for improvement'],
            methodology: 'Fallback analysis when AI service is unavailable',
            sources: ['Portfolio Analysis', 'Industry Standards'],
            confidence: 0.75,
          };
      }

      setNarrative(generatedNarrative);
      return generatedNarrative;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerClick = async () => {
    if (!narrative && !isLoading) {
      await generateNarrative();
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <AINavigationPopup
        narrative={narrative}
        popupWidth="w-80"
        trigger={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTriggerClick}
            disabled={isLoading}
            className="h-6 w-6 p-0 hover:bg-primary/10 rounded-full"
            title="Get AI explanation"
          >
            <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-primary" />
          </Button>
        }
      />
    </div>
  );
}

export default AIContextTooltip;
