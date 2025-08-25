import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart,
  LineChart,
  Target,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Leaf,
  Shield,
  Globe,
  Calculator,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';

interface AdvancedAnalyticsProps {
  portfolioMetrics?: any;
  onInsightAction?: (insight: any) => void;
}

export function AdvancedAnalytics({ portfolioMetrics, onInsightAction }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('predictive');
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    loadAdvancedInsights();
  }, []);

  const loadAdvancedInsights = async () => {
    setLoading(true);
    try {
      // Simulate advanced AI insights
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockInsights = [
        {
          id: 'pred_1',
          type: 'predictive',
          title: 'Portfolio Emissions Trajectory',
          description: 'Based on current trends, your portfolio emissions intensity will decrease by 15% over the next 12 months',
          confidence: 0.87,
          impact: 'high',
          timeframe: '12 months',
          category: 'emissions',
          data: {
            current: 2.8,
            predicted: 2.38,
            improvement: 15
          }
        },
        {
          id: 'pred_2',
          type: 'predictive',
          title: 'Data Quality Optimization',
          description: 'Focusing on 47 specific loans could improve your WDQS from 3.2 to 2.8 within 6 weeks',
          confidence: 0.92,
          impact: 'high',
          timeframe: '6 weeks',
          category: 'data-quality',
          data: {
            targetLoans: 47,
            currentWDQS: 3.2,
            projectedWDQS: 2.8,
            effort: 'medium'
          }
        },
        {
          id: 'risk_1',
          type: 'risk',
          title: 'Transition Risk Alert',
          description: 'ICE vehicle loans originated after 2020 show 23% higher stranded asset risk by 2030',
          confidence: 0.78,
          impact: 'medium',
          timeframe: '2030',
          category: 'risk',
          data: {
            affectedLoans: 234,
            riskIncrease: 23,
            mitigationOptions: ['EV incentives', 'Early refinancing', 'Portfolio rebalancing']
          }
        },
        {
          id: 'opp_1',
          type: 'opportunity',
          title: 'Green Lending Opportunity',
          description: 'EV loan demand in your market is projected to grow 340% over next 24 months',
          confidence: 0.85,
          impact: 'high',
          timeframe: '24 months',
          category: 'business',
          data: {
            marketGrowth: 340,
            potentialRevenue: 2400000,
            competitiveAdvantage: 'First mover in region'
          }
        }
      ];

      setInsights(mockInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load advanced insights:', error);
      toast({
        title: 'Analysis Error',
        description: 'Unable to load advanced insights. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = () => {
    toast({
      title: 'Refreshing Analysis',
      description: 'Updating insights with latest data...'
    });
    loadAdvancedInsights();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">
            AI-powered predictive insights and risk analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshInsights}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="predictive" className="space-y-6">
          <PredictiveAnalytics insights={insights.filter(i => i.type === 'predictive')} loading={loading} />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <RiskAnalysis insights={insights.filter(i => i.type === 'risk')} loading={loading} />
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <OpportunityAnalysis insights={insights.filter(i => i.type === 'opportunity')} loading={loading} />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <ScenarioModeling portfolioMetrics={portfolioMetrics} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PredictiveAnalytics({ insights, loading }: { insights: any[]; loading: boolean }) {
  if (loading) {
    return <AnalyticsLoader />;
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Predictive insights</strong> use machine learning to forecast portfolio performance 
          based on historical trends, market conditions, and regulatory changes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {insights.map((insight) => (
          <Card key={insight.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <CardDescription className="mt-2">{insight.description}</CardDescription>
                </div>
                <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                  {insight.confidence * 100}% confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <PredictiveInsightDetails insight={insight} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Portfolio Trajectory</h3>
              <p className="text-sm text-muted-foreground">
                Your portfolio is on track to achieve PCAF compliance 3 months ahead of schedule
              </p>
            </div>
            <Button variant="outline">
              View Detailed Forecast
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PredictiveInsightDetails({ insight }: { insight: any }) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emissions': return <Leaf className="h-4 w-4 text-green-600" />;
      case 'data-quality': return <Target className="h-4 w-4 text-blue-600" />;
      case 'compliance': return <Shield className="h-4 w-4 text-purple-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {getCategoryIcon(insight.category)}
        <span className="text-sm font-medium capitalize">{insight.category.replace('-', ' ')}</span>
        <Badge variant="outline" className="ml-auto">
          {insight.timeframe}
        </Badge>
      </div>

      {insight.category === 'emissions' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Intensity</span>
            <span className="font-medium">{insight.data.current} kg/$1k</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Predicted Intensity</span>
            <span className="font-medium text-green-600">{insight.data.predicted} kg/$1k</span>
          </div>
          <Progress value={insight.data.improvement} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {insight.data.improvement}% improvement projected
          </div>
        </div>
      )}

      {insight.category === 'data-quality' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Target Loans</span>
            <span className="font-medium">{insight.data.targetLoans}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Current WDQS</span>
            <span className="font-medium">{insight.data.currentWDQS}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Projected WDQS</span>
            <span className="font-medium text-green-600">{insight.data.projectedWDQS}</span>
          </div>
          <Badge variant="outline" className="w-full justify-center">
            {insight.data.effort} effort required
          </Badge>
        </div>
      )}

      <Button variant="outline" size="sm" className="w-full">
        View Action Plan
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function RiskAnalysis({ insights, loading }: { insights: any[]; loading: boolean }) {
  if (loading) {
    return <AnalyticsLoader />;
  }

  const riskMetrics = [
    { title: 'Transition Risk', value: 'Medium', score: 3.2, color: 'text-yellow-600' },
    { title: 'Physical Risk', value: 'Low', score: 1.8, color: 'text-green-600' },
    { title: 'Regulatory Risk', value: 'High', score: 4.1, color: 'text-red-600' },
    { title: 'Technology Risk', value: 'Medium', score: 2.9, color: 'text-yellow-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {riskMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold">{metric.score}</div>
                <div className="text-sm font-medium">{metric.title}</div>
                <Badge variant="outline" className={metric.color}>
                  {metric.value}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {insights.map((insight) => (
          <Card key={insight.id} className="border-orange-200">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <CardDescription className="mt-2">{insight.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RiskInsightDetails insight={insight} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          <strong>High Priority:</strong> Regulatory risk assessment indicates potential compliance 
          gaps that require immediate attention. Review recommended mitigation strategies.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function RiskInsightDetails({ insight }: { insight: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Affected Loans</span>
        <span className="font-medium">{insight.data.affectedLoans}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm">Risk Increase</span>
        <span className="font-medium text-red-600">+{insight.data.riskIncrease}%</span>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Mitigation Options:</div>
        {insight.data.mitigationOptions.map((option: string, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-3 w-3 text-green-600" />
            {option}
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full">
        Develop Mitigation Plan
        <Shield className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function OpportunityAnalysis({ insights, loading }: { insights: any[]; loading: boolean }) {
  if (loading) {
    return <AnalyticsLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {insights.map((insight) => (
          <Card key={insight.id} className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <CardDescription className="mt-2">{insight.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <OpportunityInsightDetails insight={insight} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-green-500/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Market Opportunity Score</h3>
            <div className="text-4xl font-bold text-green-600">8.7/10</div>
            <p className="text-muted-foreground">
              Excellent conditions for green lending expansion in your market
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              Explore Opportunities
              <TrendingUp className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OpportunityInsightDetails({ insight }: { insight: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Market Growth</span>
        <span className="font-medium text-green-600">+{insight.data.marketGrowth}%</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm">Revenue Potential</span>
        <span className="font-medium">${insight.data.potentialRevenue.toLocaleString()}</span>
      </div>

      <div className="p-3 bg-white rounded-lg border">
        <div className="text-sm font-medium mb-1">Competitive Advantage</div>
        <div className="text-sm text-muted-foreground">{insight.data.competitiveAdvantage}</div>
      </div>

      <Button variant="outline" size="sm" className="w-full">
        Create Business Case
        <DollarSign className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}

function ScenarioModeling({ portfolioMetrics, loading }: { portfolioMetrics?: any; loading: boolean }) {
  if (loading) {
    return <AnalyticsLoader />;
  }

  const scenarios = [
    {
      name: 'NGFS Orderly Transition',
      description: 'Gradual policy implementation with coordinated global action',
      impact: {
        emissions: -25,
        value: -2,
        compliance: 95
      },
      probability: 0.4
    },
    {
      name: 'NGFS Disorderly Transition',
      description: 'Late and sudden policy action with higher transition costs',
      impact: {
        emissions: -35,
        value: -15,
        compliance: 85
      },
      probability: 0.3
    },
    {
      name: 'NGFS Hot House World',
      description: 'Limited climate action leading to severe physical risks',
      impact: {
        emissions: -10,
        value: -25,
        compliance: 70
      },
      probability: 0.2
    }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Climate scenarios</strong> help assess portfolio resilience under different 
          climate policy and physical risk pathways based on NGFS frameworks.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {scenarios.map((scenario, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <CardDescription className="mt-2">{scenario.description}</CardDescription>
                </div>
                <Badge variant="outline">
                  {Math.round(scenario.probability * 100)}% probability
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${scenario.impact.emissions < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {scenario.impact.emissions > 0 ? '+' : ''}{scenario.impact.emissions}%
                  </div>
                  <div className="text-xs text-muted-foreground">Emissions Change</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${scenario.impact.value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {scenario.impact.value > 0 ? '+' : ''}{scenario.impact.value}%
                  </div>
                  <div className="text-xs text-muted-foreground">Portfolio Value</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${scenario.impact.compliance > 80 ? 'text-green-600' : 'text-red-600'}`}>
                    {scenario.impact.compliance}%
                  </div>
                  <div className="text-xs text-muted-foreground">Compliance Rate</div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                Run Detailed Analysis
                <Calculator className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-full text-white">
              <Target className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Scenario Planning Recommendation</h3>
              <p className="text-sm text-muted-foreground">
                Focus on orderly transition preparation while building resilience for disorderly scenarios
              </p>
            </div>
            <Button>
              Create Action Plan
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsLoader() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdvancedAnalytics;