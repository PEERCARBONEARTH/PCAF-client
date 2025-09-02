/**
 * Narrative Insight Card Component
 * Displays AI-generated insights with humanized narratives and actionable recommendations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
  DollarSign,
  Shield,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { NarrativeInsightCard as InsightCardType } from '@/services/narrative-pipeline-integration';

interface NarrativeInsightCardProps {
  insight: InsightCardType;
  onActionClick?: (action: string) => void;
  onDrillDown?: (query: string) => void;
  className?: string;
}

export const NarrativeInsightCard: React.FC<NarrativeInsightCardProps> = ({
  insight,
  onActionClick,
  onDrillDown,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'portfolio_optimization':
        return <TrendingUp className="h-5 w-5" />;
      case 'risk_analysis':
        return <Shield className="h-5 w-5" />;
      case 'compliance_assessment':
        return <CheckCircle className="h-5 w-5" />;
      case 'market_opportunity':
        return <Target className="h-5 w-5" />;
      case 'customer_insights':
        return <Users className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'portfolio_optimization':
        return 'text-green-600 bg-green-50';
      case 'risk_analysis':
        return 'text-orange-600 bg-orange-50';
      case 'compliance_assessment':
        return 'text-blue-600 bg-blue-50';
      case 'market_opportunity':
        return 'text-purple-600 bg-purple-50';
      case 'customer_insights':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor(insight.type)}`}>
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-semibold">
                  {insight.narrative.title}
                </CardTitle>
                <Badge variant={getPriorityColor(insight.priority)}>
                  {insight.priority} priority
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {formatTypeLabel(insight.type)} • Updated {insight.lastUpdated.toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium">
                {(insight.confidence * 100).toFixed(0)}% confidence
              </div>
              <Progress value={insight.confidence * 100} className="w-16 h-2" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Executive Summary */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Key Insight
          </h4>
          <p className="text-sm leading-relaxed">
            {insight.narrative.executiveSummary}
          </p>
        </div>

        {/* Humanized Explanation */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-800">
            What This Means for Your Bank
          </h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            {insight.narrative.humanizedExplanation}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {insight.interactiveElements.quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.type === 'primary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onActionClick?.(action.action)}
              className="flex items-center gap-2"
            >
              {action.label}
              <ArrowRight className="h-3 w-3" />
            </Button>
          ))}
        </div>

        {/* Expandable Details */}
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 w-full justify-center"
          >
            {isExpanded ? 'Show Less' : 'Show More Details'}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {isExpanded && (
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="recommendations">Actions</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  {/* Business Context */}
                  <div>
                    <h4 className="font-medium mb-2">Business Context</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.narrative.businessContext}
                    </p>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <h4 className="font-medium mb-3">Key Findings</h4>
                    <div className="space-y-3">
                      {insight.narrative.keyFindings.map((finding, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-sm">{finding.finding}</h5>
                            <Badge variant="outline">
                              {(finding.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {finding.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitive Advantage */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-800">
                      Competitive Advantage
                    </h4>
                    <p className="text-sm text-green-700">
                      {insight.narrative.competitiveAdvantage}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {insight.narrative.actionableRecommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{rec.action}</h5>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">
                              {rec.effort} effort
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Timeline:
                            </span>
                            <span className="text-muted-foreground ml-1">
                              {rec.timeframe}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Expected Outcome:
                            </span>
                            <span className="text-muted-foreground ml-1">
                              {rec.expectedOutcome}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-muted/50 rounded">
                          <h6 className="font-medium text-sm mb-1">Business Case</h6>
                          <p className="text-sm text-muted-foreground">
                            {rec.businessCase}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="risks" className="space-y-4 mt-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className={`h-4 w-4 ${
                        insight.narrative.riskAssessment.level === 'high' ? 'text-red-500' :
                        insight.narrative.riskAssessment.level === 'medium' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      <h4 className="font-medium">
                        Risk Level: {insight.narrative.riskAssessment.level.toUpperCase()}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Risk Factors</h5>
                        <ul className="space-y-1">
                          {insight.narrative.riskAssessment.factors.map((factor, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Mitigation Strategies</h5>
                        <ul className="space-y-1">
                          {insight.narrative.riskAssessment.mitigation.map((strategy, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Regulatory Implications */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800">
                      Regulatory Implications
                    </h4>
                    <p className="text-sm text-blue-700">
                      {insight.narrative.regulatoryImplications}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4 mt-4">
                  {/* Success Metrics */}
                  <div>
                    <h4 className="font-medium mb-3">Success Metrics to Track</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {insight.narrative.successMetrics.map((metric, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{metric}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h4 className="font-medium mb-3">Immediate Next Steps</h4>
                    <div className="space-y-2">
                      {insight.narrative.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Drill Down Options */}
        {insight.interactiveElements.drillDowns.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 text-sm">Explore Related Data</h4>
            <div className="flex flex-wrap gap-2">
              {insight.interactiveElements.drillDowns.map((drillDown, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => onDrillDown?.(drillDown.query)}
                  className="text-xs flex items-center gap-1"
                >
                  {drillDown.label}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NarrativeInsightCard;