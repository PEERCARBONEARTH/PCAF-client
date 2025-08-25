import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Globe,
  Zap,
  Target,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { portfolioService } from '@/services/portfolioService';
import { aiService } from '@/services/aiService';

interface PortfolioMetrics {
  totalLoans: number;
  totalFinancedEmissions: number;
  weightedAvgDataQuality: number;
  emissionIntensityPerDollar: number;
  complianceScore: number;
  riskScore: number;
}

interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  category: 'compliance' | 'risk' | 'efficiency' | 'data-quality';
  actionable: boolean;
  estimatedValue?: string;
  timeframe?: string;
}

interface RiskFactor {
  id: string;
  type: 'physical' | 'transition';
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: string;
  description: string;
  mitigation?: string;
  timeHorizon: 'short' | 'medium' | 'long';
}

interface ScenarioAnalysis {
  id: string;
  scenario: string;
  description: string;
  emissionChange: number;
  riskChange: number;
  probability: number;
  timeframe: string;
  keyFactors: string[];
  expanded?: boolean;
}

interface ReorganizedAIInsightsProps {
  portfolioMetrics?: PortfolioMetrics;
  onChatTrigger?: (query: string) => void;
  focusArea?: 'insights' | 'risk' | 'scenarios';
}

export function ReorganizedAIInsights({ portfolioMetrics, onChatTrigger, focusArea = 'insights' }: ReorganizedAIInsightsProps) {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeRiskTab, setActiveRiskTab] = useState<'overview' | 'physical' | 'transition'>('overview');
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());
  const [showChatSidebar, setShowChatSidebar] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadAIInsights();
  }, [portfolioMetrics]);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      
      // Load portfolio metrics
      const portfolioData = portfolioMetrics || await portfolioService.getPortfolioAnalytics();
      setMetrics(portfolioData);

      if (portfolioData) {
        // Generate AI recommendations
        const recs = await generateSmartRecommendations(portfolioData);
        setRecommendations(recs);

        // Generate risk factors
        const risks = await generateRiskFactors(portfolioData);
        setRiskFactors(risks);

        // Generate scenario analysis
        const scenarioData = await generateScenarioAnalysis(portfolioData);
        setScenarios(scenarioData);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load AI insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    setRefreshing(true);
    await loadAIInsights();
    setRefreshing(false);
    
    toast({
      title: "Insights Refreshed",
      description: "AI insights have been updated with latest data",
    });
  };

  const generateSmartRecommendations = async (metrics: PortfolioMetrics): Promise<SmartRecommendation[]> => {
    const recs: SmartRecommendation[] = [];

    // PCAF Compliance Recommendations
    if (metrics.weightedAvgDataQuality > 3.0) {
      recs.push({
        id: 'improve-data-quality',
        title: 'Enhance Vehicle Data Quality',
        description: 'Improve PCAF compliance by collecting detailed vehicle specifications for high-value loans',
        impact: 'high',
        effort: 'medium',
        confidence: 0.92,
        category: 'compliance',
        actionable: true,
        estimatedValue: `${(metrics.weightedAvgDataQuality - 3.0).toFixed(1)} WDQS improvement`,
        timeframe: '2-4 weeks'
      });
    }

    // Risk Management Recommendations
    if (metrics.riskScore > 70) {
      recs.push({
        id: 'climate-risk-mitigation',
        title: 'Implement Climate Risk Controls',
        description: 'Deploy risk monitoring for high-exposure geographic regions and vehicle types',
        impact: 'high',
        effort: 'high',
        confidence: 0.85,
        category: 'risk',
        actionable: true,
        estimatedValue: `${Math.round(metrics.riskScore * 0.3)}% risk reduction`,
        timeframe: '1-3 months'
      });
    }

    // Efficiency Recommendations
    if (metrics.emissionIntensityPerDollar > 2.5) {
      recs.push({
        id: 'ev-transition-strategy',
        title: 'Accelerate EV Portfolio Transition',
        description: 'Develop incentive programs for electric vehicle financing to reduce emissions intensity',
        impact: 'medium',
        effort: 'medium',
        confidence: 0.78,
        category: 'efficiency',
        actionable: true,
        estimatedValue: `${((metrics.emissionIntensityPerDollar - 2.5) * 0.6).toFixed(1)} kg CO2e/$1k reduction`,
        timeframe: '3-6 months'
      });
    }

    // Data Quality Recommendations
    recs.push({
      id: 'automated-data-collection',
      title: 'Implement Automated Data Collection',
      description: 'Set up API integrations with vehicle databases to improve data completeness',
      impact: 'medium',
      effort: 'low',
      confidence: 0.88,
      category: 'data-quality',
      actionable: true,
      estimatedValue: '85%+ data completeness',
      timeframe: '1-2 weeks'
    });

    return recs.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  };

  const generateRiskFactors = async (metrics: PortfolioMetrics): Promise<RiskFactor[]> => {
    return [
      // Physical Risks
      {
        id: 'extreme-weather',
        type: 'physical',
        name: 'Extreme Weather Events',
        severity: 'medium',
        probability: 0.65,
        impact: 'Vehicle damage, supply chain disruption',
        description: 'Increased frequency of floods, hurricanes, and heatwaves affecting vehicle operations and infrastructure',
        mitigation: 'Geographic diversification, weather-resistant vehicle requirements',
        timeHorizon: 'short'
      },
      {
        id: 'sea-level-rise',
        type: 'physical',
        name: 'Sea Level Rise',
        severity: 'low',
        probability: 0.85,
        impact: 'Coastal infrastructure risk',
        description: 'Long-term coastal flooding risk for vehicles and charging infrastructure',
        mitigation: 'Avoid high-risk coastal areas, require elevation certificates',
        timeHorizon: 'long'
      },
      // Transition Risks
      {
        id: 'carbon-pricing',
        type: 'transition',
        name: 'Carbon Pricing Mechanisms',
        severity: 'high',
        probability: 0.80,
        impact: 'Increased operational costs for ICE vehicles',
        description: 'Implementation of carbon taxes and cap-and-trade systems affecting vehicle economics',
        mitigation: 'Accelerate EV transition, price carbon costs into lending decisions',
        timeHorizon: 'medium'
      },
      {
        id: 'ice-ban-policies',
        type: 'transition',
        name: 'ICE Vehicle Bans',
        severity: 'critical',
        probability: 0.75,
        impact: 'Stranded assets, reduced resale values',
        description: 'Government policies banning internal combustion engine vehicle sales',
        mitigation: 'Phase out ICE lending, focus on EV and hybrid financing',
        timeHorizon: 'medium'
      },
      {
        id: 'technology-disruption',
        type: 'transition',
        name: 'Technology Disruption',
        severity: 'medium',
        probability: 0.70,
        impact: 'Rapid obsolescence of current vehicle technology',
        description: 'Breakthrough in battery technology or autonomous vehicles disrupting market',
        mitigation: 'Technology monitoring, flexible lending terms',
        timeHorizon: 'short'
      }
    ];
  };

  const generateScenarioAnalysis = async (metrics: PortfolioMetrics): Promise<ScenarioAnalysis[]> => {
    return [
      {
        id: 'net-zero-2050',
        scenario: 'Net Zero 2050',
        description: 'Orderly transition to net-zero emissions by 2050',
        emissionChange: -65,
        riskChange: -30,
        probability: 0.60,
        timeframe: '2025-2050',
        keyFactors: ['Gradual carbon pricing', 'EV adoption incentives', 'Infrastructure development']
      },
      {
        id: 'delayed-transition',
        scenario: 'Delayed Transition',
        description: 'Late but rapid action to limit warming to 2°C',
        emissionChange: -45,
        riskChange: 25,
        probability: 0.25,
        timeframe: '2030-2050',
        keyFactors: ['Sudden policy changes', 'Technology acceleration', 'Market disruption']
      },
      {
        id: 'current-policies',
        scenario: 'Current Policies',
        description: 'Continuation of existing climate policies',
        emissionChange: -15,
        riskChange: 60,
        probability: 0.15,
        timeframe: '2025-2100',
        keyFactors: ['Limited policy action', 'Gradual technology adoption', 'Physical risk increase']
      }
    ];
  };

  const handleRecommendationClick = (rec: SmartRecommendation) => {
    const query = `Help me implement this ${rec.category} recommendation: "${rec.title}". ${rec.description} What are the specific steps and considerations?`;
    onChatTrigger?.(query);
    setShowChatSidebar(true);
  };

  const handleRiskClick = (risk: RiskFactor) => {
    const query = `I need to understand and mitigate this ${risk.type} climate risk: "${risk.name}". ${risk.description} What strategies should I consider?`;
    onChatTrigger?.(query);
    setShowChatSidebar(true);
  };

  const toggleScenario = (scenarioId: string) => {
    const newExpanded = new Set(expandedScenarios);
    if (newExpanded.has(scenarioId)) {
      newExpanded.delete(scenarioId);
    } else {
      newExpanded.add(scenarioId);
    }
    setExpandedScenarios(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading AI insights...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No portfolio data available. Upload your loan data to see AI insights.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render different sections based on focus area
  const renderFocusedContent = () => {
    switch (focusArea) {
      case 'insights':
        return (
          <div className="space-y-8">
            {/* Hero Section with AI Sparkle */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">AI Portfolio Intelligence</h1>
                    <p className="text-indigo-100 text-lg">Unlock hidden insights in your climate finance portfolio</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="h-6 w-6 text-yellow-300" />
                      <span className="font-semibold">Smart Analysis</span>
                    </div>
                    <p className="text-sm text-indigo-100">AI-powered pattern recognition across {metrics?.totalLoans?.toLocaleString() || 0} loans</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-6 w-6 text-green-300" />
                      <span className="font-semibold">Precision Targeting</span>
                    </div>
                    <p className="text-sm text-indigo-100">Identify high-impact opportunities with {Math.round((recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length) * 100)}% confidence</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-6 w-6 text-orange-300" />
                      <span className="font-semibold">Instant Action</span>
                    </div>
                    <p className="text-sm text-indigo-100">Get actionable recommendations in real-time</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={refreshInsights}
                disabled={refreshing}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* AI Recommendations - The Star of the Show */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      AI-Powered Recommendations
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Discover game-changing opportunities in your portfolio
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.id}
                      className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-r from-white to-gray-50 p-6 cursor-pointer transition-all duration-300 hover:border-indigo-200 hover:shadow-xl hover:scale-[1.02]"
                      onClick={() => handleRecommendationClick(rec)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                <h3 className="text-xl font-bold text-gray-900">{rec.title}</h3>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`${getImpactColor(rec.impact)} font-semibold px-3 py-1`}
                              >
                                {rec.impact.toUpperCase()} IMPACT
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">{rec.description}</p>
                          </div>
                          <div className="flex items-center gap-3 ml-6">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-indigo-600">{Math.round(rec.confidence * 100)}%</div>
                              <div className="text-sm text-gray-500">Confidence</div>
                            </div>
                            <ArrowRight className="h-6 w-6 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 mt-6">
                          <div className="bg-blue-50 rounded-xl p-4">
                            <div className="text-sm font-medium text-blue-600 mb-1">Expected Value</div>
                            <div className="text-lg font-bold text-blue-900">{rec.estimatedValue}</div>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4">
                            <div className="text-sm font-medium text-green-600 mb-1">Timeline</div>
                            <div className="text-lg font-bold text-green-900">{rec.timeframe}</div>
                          </div>
                          <div className="bg-purple-50 rounded-xl p-4">
                            <div className="text-sm font-medium text-purple-600 mb-1">Effort Level</div>
                            <div className="text-lg font-bold text-purple-900 capitalize">{rec.effort}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Pulse - Quick Metrics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="h-6 w-6 text-indigo-500" />
                  Portfolio Pulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">{metrics?.totalLoans?.toLocaleString() || 0}</div>
                    <div className="text-sm text-blue-600">Active Loans</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                    <Globe className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">{metrics?.totalFinancedEmissions?.toLocaleString() || 0}</div>
                    <div className="text-sm text-green-600">tCO2e Financed</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50">
                    <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">{metrics?.weightedAvgDataQuality?.toFixed(1) || 0}</div>
                    <div className="text-sm text-purple-600">Data Quality Score</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50">
                    <Shield className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-900">{metrics?.complianceScore || 0}%</div>
                    <div className="text-sm text-orange-600">PCAF Compliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-8">
            {/* Risk Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 p-8 text-white">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Shield className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Climate Risk Intelligence</h1>
                    <p className="text-orange-100 text-lg">Navigate physical and transition risks with AI precision</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="h-6 w-6 text-blue-300" />
                      <span className="font-semibold text-lg">Physical Risks</span>
                    </div>
                    <div className="text-3xl font-bold mb-2">Medium</div>
                    <p className="text-orange-100">Weather events, sea level rise, temperature changes</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-6 w-6 text-purple-300" />
                      <span className="font-semibold text-lg">Transition Risks</span>
                    </div>
                    <div className="text-3xl font-bold mb-2">High</div>
                    <p className="text-orange-100">Policy changes, technology shifts, market evolution</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={refreshInsights}
                disabled={refreshing}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Risk Assessment Tabs */}
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Risk Assessment Matrix</CardTitle>
                <CardDescription>Comprehensive climate risk analysis across your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeRiskTab} onValueChange={(value) => setActiveRiskTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="overview" className="text-lg py-3">Overview</TabsTrigger>
                    <TabsTrigger value="physical" className="text-lg py-3">Physical Risks</TabsTrigger>
                    <TabsTrigger value="transition" className="text-lg py-3">Transition Risks</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Globe className="h-5 w-5" />
                            Physical Climate Risks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {riskFactors.filter(r => r.type === 'physical').map((risk) => (
                              <div key={risk.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                                <span className="font-medium">{risk.name}</span>
                                <Badge className={getSeverityColor(risk.severity)}>
                                  {risk.severity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-orange-800">
                            <TrendingUp className="h-5 w-5" />
                            Transition Climate Risks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {riskFactors.filter(r => r.type === 'transition').map((risk) => (
                              <div key={risk.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                                <span className="font-medium">{risk.name}</span>
                                <Badge className={getSeverityColor(risk.severity)}>
                                  {risk.severity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="physical" className="space-y-6">
                    {riskFactors.filter(r => r.type === 'physical').map((risk) => (
                      <Card key={risk.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500" onClick={() => handleRiskClick(risk)}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{risk.name}</h3>
                              <p className="text-gray-600 leading-relaxed">{risk.description}</p>
                            </div>
                            <Badge className={`${getSeverityColor(risk.severity)} text-lg px-4 py-2`}>
                              {risk.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-blue-600 mb-1">Probability</div>
                              <div className="text-2xl font-bold text-blue-900">{Math.round(risk.probability * 100)}%</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-purple-600 mb-1">Time Horizon</div>
                              <div className="text-2xl font-bold text-purple-900 capitalize">{risk.timeHorizon}-term</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-600 mb-1">Impact</div>
                              <div className="text-lg font-bold text-gray-900">{risk.impact}</div>
                            </div>
                          </div>
                          {risk.mitigation && (
                            <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-l-green-400">
                              <div className="font-semibold text-green-800 mb-2">Mitigation Strategy</div>
                              <p className="text-green-700">{risk.mitigation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="transition" className="space-y-6">
                    {riskFactors.filter(r => r.type === 'transition').map((risk) => (
                      <Card key={risk.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500" onClick={() => handleRiskClick(risk)}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{risk.name}</h3>
                              <p className="text-gray-600 leading-relaxed">{risk.description}</p>
                            </div>
                            <Badge className={`${getSeverityColor(risk.severity)} text-lg px-4 py-2`}>
                              {risk.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-orange-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-orange-600 mb-1">Probability</div>
                              <div className="text-2xl font-bold text-orange-900">{Math.round(risk.probability * 100)}%</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-purple-600 mb-1">Time Horizon</div>
                              <div className="text-2xl font-bold text-purple-900 capitalize">{risk.timeHorizon}-term</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-600 mb-1">Impact</div>
                              <div className="text-lg font-bold text-gray-900">{risk.impact}</div>
                            </div>
                          </div>
                          {risk.mitigation && (
                            <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-l-green-400">
                              <div className="font-semibold text-green-800 mb-2">Mitigation Strategy</div>
                              <p className="text-green-700">{risk.mitigation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        );

      case 'scenarios':
        return (
          <div className="space-y-8">
            {/* Scenarios Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">NGFS Scenario Modeling</h1>
                    <p className="text-indigo-100 text-lg">Stress test your portfolio against climate futures</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingDown className="h-6 w-6 text-green-300" />
                      <span className="font-semibold">Net Zero 2050</span>
                    </div>
                    <div className="text-3xl font-bold text-green-300">-65%</div>
                    <p className="text-indigo-100">Emission Reduction</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-6 w-6 text-orange-300" />
                      <span className="font-semibold">Delayed Transition</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-300">+25%</div>
                    <p className="text-indigo-100">Risk Increase</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="h-6 w-6 text-red-300" />
                      <span className="font-semibold">Current Policies</span>
                    </div>
                    <div className="text-3xl font-bold text-red-300">+60%</div>
                    <p className="text-indigo-100">Risk Exposure</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={refreshInsights}
                disabled={refreshing}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 border-white/30"
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Scenario Analysis */}
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                  Climate Scenario Analysis
                </CardTitle>
                <CardDescription className="text-lg">
                  Explore how different climate pathways impact your portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {scenarios.map((scenario, index) => (
                  <Card key={scenario.id} className="border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 cursor-pointer" onClick={() => toggleScenario(scenario.id)}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                              <h3 className="text-2xl font-bold text-gray-900">{scenario.scenario}</h3>
                              <Badge variant="outline" className="text-sm px-3 py-1">
                                {Math.round(scenario.probability * 100)}% probability
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">{scenario.description}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            {expandedScenarios.has(scenario.id) ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className={`p-4 rounded-xl ${scenario.emissionChange < 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {scenario.emissionChange < 0 ? (
                                <TrendingDown className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingUp className="h-5 w-5 text-red-600" />
                              )}
                              <span className="font-semibold text-gray-700">Emissions Impact</span>
                            </div>
                            <div className={`text-3xl font-bold ${scenario.emissionChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {scenario.emissionChange > 0 ? '+' : ''}{scenario.emissionChange}%
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl ${scenario.riskChange < 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {scenario.riskChange < 0 ? (
                                <TrendingDown className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingUp className="h-5 w-5 text-red-600" />
                              )}
                              <span className="font-semibold text-gray-700">Risk Change</span>
                            </div>
                            <div className={`text-3xl font-bold ${scenario.riskChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {scenario.riskChange > 0 ? '+' : ''}{scenario.riskChange}%
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-xl bg-blue-50">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-700">Timeframe</span>
                            </div>
                            <div className="text-xl font-bold text-blue-600">{scenario.timeframe}</div>
                          </div>
                        </div>
                      </div>
                      
                      {expandedScenarios.has(scenario.id) && (
                        <div className="border-t bg-gray-50 p-6">
                          <h4 className="font-bold text-lg mb-4 text-gray-900">Key Driving Factors</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {scenario.keyFactors.map((factor, factorIndex) => (
                              <div key={factorIndex} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                <span className="text-gray-700">{factor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return renderFocusedContent();
}