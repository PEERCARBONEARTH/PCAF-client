import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  TrendingUp, 
  Brain, 
  Zap, 
  Target, 
  AlertTriangle,
  Calendar,
  BarChart3,
  LineChart,
  Activity,
  Lightbulb,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { 
  aiEmissionsForecastingService, 
  EmissionsForecastData, 
  ForecastScenario, 
  AIForecastInsights 
} from '@/services/ai-emissions-forecasting';
import AIContextTooltip from './AIContextTooltip';

interface AIEmissionsForecastChartProps {
  portfolioData?: any;
  className?: string;
}

export function AIEmissionsForecastChart({ portfolioData, className = '' }: AIEmissionsForecastChartProps) {
  const [forecastData, setForecastData] = useState<EmissionsForecastData[]>([]);
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([]);
  const [insights, setInsights] = useState<AIForecastInsights | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('steady_transition');
  const [timeHorizon, setTimeHorizon] = useState<number>(24);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'scenarios' | 'insights'>('chart');

  useEffect(() => {
    loadForecastData();
  }, [timeHorizon, portfolioData]);

  const loadForecastData = async () => {
    setIsLoading(true);
    try {
      const [forecast, scenarioData, forecastInsights] = await Promise.all([
        aiEmissionsForecastingService.generateEmissionsForecast(timeHorizon),
        aiEmissionsForecastingService.generateForecastScenarios(),
        aiEmissionsForecastingService.generateForecastInsights()
      ]);

      setForecastData(forecast);
      setScenarios(scenarioData);
      setInsights(forecastInsights);
    } catch (error) {
      console.error('Failed to load forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentEmissions = () => {
    return forecastData.find(d => d.actualEmissions)?.actualEmissions || 0;
  };

  const getFinalProjection = (scenario: 'baseline' | 'optimistic' | 'pessimistic') => {
    const lastPoint = forecastData[forecastData.length - 1];
    if (!lastPoint) return 0;
    
    switch (scenario) {
      case 'optimistic': return lastPoint.optimisticProjection;
      case 'pessimistic': return lastPoint.pessimisticProjection;
      default: return lastPoint.baselineProjection;
    }
  };

  const getReductionPercentage = (scenario: 'baseline' | 'optimistic' | 'pessimistic') => {
    const current = getCurrentEmissions();
    const final = getFinalProjection(scenario);
    return current > 0 ? ((current - final) / current) * 100 : 0;
  };

  const renderForecastChart = () => {
    if (forecastData.length === 0) return null;

    const maxValue = Math.max(...forecastData.map(d => 
      Math.max(d.baselineProjection, d.optimisticProjection, d.pessimisticProjection)
    ));

    return (
      <div className="space-y-6">
        {/* Chart Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Emissions Forecast</h3>
            <p className="text-sm text-muted-foreground">
              Predictive analysis based on portfolio composition and market trends
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <AIContextTooltip 
              metricType="emissions_forecast"
              metricValue={getCurrentEmissions()}
              additionalData={{ 
                timeHorizon,
                confidence: insights?.trendAnalysis.confidence || 0.8
              }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Optimistic Scenario</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    -{getReductionPercentage('optimistic').toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {getFinalProjection('optimistic').toFixed(1)} tCO₂e
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Base Case</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    -{getReductionPercentage('baseline').toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {getFinalProjection('baseline').toFixed(1)} tCO₂e
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Conservative</p>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    -{getReductionPercentage('pessimistic').toFixed(1)}%
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {getFinalProjection('pessimistic').toFixed(1)} tCO₂e
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simplified Chart Visualization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Emissions Trajectory</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={timeHorizon === 12 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeHorizon(12)}
                >
                  1Y
                </Button>
                <Button
                  variant={timeHorizon === 24 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeHorizon(24)}
                >
                  2Y
                </Button>
                <Button
                  variant={timeHorizon === 36 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeHorizon(36)}
                >
                  3Y
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Optimistic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Base Case</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Conservative</span>
                </div>
              </div>

              {/* Simplified Chart Bars */}
              <div className="space-y-3">
                {forecastData.filter((_, index) => index % 6 === 0).map((dataPoint, index) => {
                  const date = new Date(dataPoint.date);
                  const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{monthYear}</span>
                        <span className="text-muted-foreground">
                          {dataPoint.baselineProjection.toFixed(1)} tCO₂e
                        </span>
                      </div>
                      <div className="relative">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-orange-500 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(dataPoint.baselineProjection / maxValue) * 100}%` 
                            }}
                          />
                        </div>
                        <div className="absolute top-0 left-0 h-2 w-full flex">
                          <div 
                            className="h-full bg-green-500/80 rounded-l-full"
                            style={{ 
                              width: `${(dataPoint.optimisticProjection / maxValue) * 100}%` 
                            }}
                          />
                          <div 
                            className="h-full bg-orange-500/80 rounded-r-full ml-auto"
                            style={{ 
                              width: `${((maxValue - dataPoint.pessimisticProjection) / maxValue) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Drivers */}
        {forecastData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Key Forecast Drivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Current Trends</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {forecastData[0]?.keyDrivers.map((driver, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {driver}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Key Assumptions</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {forecastData[0]?.assumptions.slice(0, 3).map((assumption, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderScenarios = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Strategic Scenarios</h3>
        <Badge variant="outline">
          {scenarios.length} scenarios analyzed
        </Badge>
      </div>

      {scenarios.map((scenario) => (
        <Card 
          key={scenario.id} 
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedScenario === scenario.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedScenario(scenario.id)}
        >
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: scenario.color }}
                    />
                    <h4 className="font-semibold">{scenario.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {(scenario.probability * 100).toFixed(0)}% probability
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {scenario.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    -{scenario.emissionReduction}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    emission reduction
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Required Actions</h5>
                  <ul className="space-y-1">
                    {scenario.requiredActions.slice(0, 2).map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <Zap className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Key Assumptions</h5>
                  <ul className="space-y-1">
                    {scenario.keyAssumptions.slice(0, 2).map((assumption, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <Target className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                  Timeline: {scenario.timeline}
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderInsights = () => {
    if (!insights) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI Forecast Insights</h3>
          <Badge variant="outline" className="bg-primary/10">
            <Brain className="h-3 w-3 mr-1" />
            {Math.round(insights.trendAnalysis.confidence * 100)}% confidence
          </Badge>
        </div>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  insights.trendAnalysis.direction === 'improving' ? 'text-green-600' :
                  insights.trendAnalysis.direction === 'declining' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {insights.trendAnalysis.direction === 'improving' ? <TrendingDown className="h-8 w-8 mx-auto" /> :
                   insights.trendAnalysis.direction === 'declining' ? <TrendingUp className="h-8 w-8 mx-auto" /> :
                   <Target className="h-8 w-8 mx-auto" />}
                </div>
                <p className="text-sm font-medium capitalize">{insights.trendAnalysis.direction}</p>
                <p className="text-xs text-muted-foreground">Direction</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary capitalize">
                  {insights.trendAnalysis.strength}
                </div>
                <p className="text-sm font-medium">Strength</p>
                <p className="text-xs text-muted-foreground">Trend intensity</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(insights.trendAnalysis.confidence * 100)}%
                </div>
                <p className="text-sm font-medium">Confidence</p>
                <p className="text-xs text-muted-foreground">Prediction accuracy</p>
              </div>
            </div>
            <div className="mt-4">
              <h5 className="font-medium mb-2">Key Factors</h5>
              <ul className="space-y-1">
                {insights.trendAnalysis.keyFactors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium">{rec.action}</h5>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(rec.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Expected Impact:</span>
                      <span className="ml-2 font-medium text-green-600">+{rec.impact}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="ml-2 font-medium">{rec.timeline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Generating AI-powered emissions forecast...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('chart')}
            className="flex items-center gap-2"
          >
            <LineChart className="h-4 w-4" />
            Forecast
          </Button>
          <Button
            variant={viewMode === 'scenarios' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('scenarios')}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Scenarios
          </Button>
          <Button
            variant={viewMode === 'insights' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('insights')}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI Insights
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={loadForecastData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Content */}
      {viewMode === 'chart' && renderForecastChart()}
      {viewMode === 'scenarios' && renderScenarios()}
      {viewMode === 'insights' && renderInsights()}
    </div>
  );
}

export default AIEmissionsForecastChart;