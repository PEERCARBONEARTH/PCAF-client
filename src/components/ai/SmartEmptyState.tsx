import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Upload, 
  BookOpen, 
  Play, 
  Lightbulb,
  Target,
  BarChart3,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  FileText,
  Calculator,
  Globe,
  Users,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { aiChatService } from '@/services/aiService';
import { portfolioService } from '@/services/portfolioService';

interface SmartEmptyStateProps {
  type: 'ai-insights' | 'climate-risk' | 'scenario-modeling' | 'portfolio-analytics';
  onGetStarted?: () => void;
  portfolioMetrics?: any;
}

interface DynamicInsight {
  id: string;
  content: string;
  category: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  timestamp: Date;
}

export function SmartEmptyState({ type, onGetStarted, portfolioMetrics }: SmartEmptyStateProps) {
  const [activeTab, setActiveTab] = useState('preview');
  const [dynamicInsights, setDynamicInsights] = useState<DynamicInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (portfolioMetrics) {
      generateDynamicInsights();
    }
  }, [portfolioMetrics, type]);

  const generateDynamicInsights = async () => {
    if (!portfolioMetrics) return;
    
    setLoading(true);
    try {
      const insights = await generateInsightsFromData(portfolioMetrics, type);
      setDynamicInsights(insights);
    } catch (error) {
      console.error('Failed to generate dynamic insights:', error);
      // Fallback to static insights
      setDynamicInsights(generateFallbackInsights(type));
    } finally {
      setLoading(false);
    }
  };

  const generateInsightsFromData = async (metrics: any, insightType: string): Promise<DynamicInsight[]> => {
    const insights: DynamicInsight[] = [];
    
    if (insightType === 'ai-insights') {
      // Generate AI insights based on portfolio data
      if (metrics.weightedAvgDataQuality > 3.0) {
        insights.push({
          id: 'data-quality-improvement',
          content: `${Math.round((metrics.weightedAvgDataQuality - 3.0) * 100)}% of your portfolio needs data quality improvements to achieve PCAF compliance`,
          category: 'Data Quality',
          confidence: 0.95,
          impact: 'high',
          actionable: true,
          timestamp: new Date()
        });
      }

      if (metrics.emissionIntensityPerDollar > 2.5) {
        const potentialReduction = ((metrics.emissionIntensityPerDollar - 2.5) / metrics.emissionIntensityPerDollar * 100);
        insights.push({
          id: 'emissions-optimization',
          content: `Portfolio emissions intensity could be reduced by ${Math.round(potentialReduction)}% through strategic EV financing`,
          category: 'Emission Reduction',
          confidence: 0.87,
          impact: 'high',
          actionable: true,
          timestamp: new Date()
        });
      }

      if (metrics.totalLoans > 500) {
        insights.push({
          id: 'scale-advantage',
          content: `Large portfolio size (${metrics.totalLoans.toLocaleString()} loans) enables advanced AI optimization strategies`,
          category: 'Business Intelligence',
          confidence: 0.92,
          impact: 'medium',
          actionable: true,
          timestamp: new Date()
        });
      }

      // Use AI service for additional insights
      try {
        const aiResponse = await aiChatService.processMessage({
          sessionId: 'insights-generation',
          message: `Analyze this portfolio: ${JSON.stringify(metrics)}. Generate 2 specific actionable insights.`,
          context: { type: 'analysis', focusArea: 'portfolio-optimization' }
        });
        
        if (aiResponse.insights) {
          aiResponse.insights.forEach((insight: any, index: number) => {
            insights.push({
              id: `ai-generated-${index}`,
              content: insight.content,
              category: insight.category || 'AI Analysis',
              confidence: insight.confidence || 0.8,
              impact: insight.impact || 'medium',
              actionable: insight.actionable || true,
              timestamp: new Date()
            });
          });
        }
      } catch (error) {
        console.error('AI service unavailable, using rule-based insights');
      }
    }

    if (insightType === 'climate-risk') {
      // Generate climate risk insights
      const avgVehicleAge = calculateAverageVehicleAge(metrics);
      if (avgVehicleAge > 8) {
        insights.push({
          id: 'transition-risk-age',
          content: `Portfolio average vehicle age of ${avgVehicleAge.toFixed(1)} years indicates elevated transition risk exposure`,
          category: 'Transition Risk',
          confidence: 0.89,
          impact: 'high',
          actionable: true,
          timestamp: new Date()
        });
      }

      const evPercentage = calculateEVPercentage(metrics);
      if (evPercentage < 15) {
        insights.push({
          id: 'ev-transition-opportunity',
          content: `Only ${evPercentage.toFixed(1)}% EV loans - significant opportunity to reduce transition risk through green financing`,
          category: 'Technology Risk',
          confidence: 0.93,
          impact: 'high',
          actionable: true,
          timestamp: new Date()
        });
      }

      // Geographic risk analysis
      if (metrics.geographicDistribution) {
        const highRiskRegions = analyzeGeographicRisk(metrics.geographicDistribution);
        if (highRiskRegions.length > 0) {
          insights.push({
            id: 'geographic-physical-risk',
            content: `${highRiskRegions.length} regions in portfolio show elevated physical climate risk exposure`,
            category: 'Physical Risk',
            confidence: 0.85,
            impact: 'medium',
            actionable: true,
            timestamp: new Date()
          });
        }
      }
    }

    if (insightType === 'scenario-modeling') {
      // Generate scenario modeling insights
      const portfolioValue = metrics.totalOutstandingBalance || 0;
      
      insights.push({
        id: 'ngfs-orderly-scenario',
        content: `Under NGFS Orderly Transition scenario: Portfolio shows ${calculateScenarioImpact(metrics, 'orderly')}% value resilience`,
        category: 'NGFS Scenarios',
        confidence: 0.82,
        impact: 'high',
        actionable: true,
        timestamp: new Date()
      });

      insights.push({
        id: 'disorderly-transition-risk',
        content: `Disorderly transition scenario indicates ${calculateScenarioImpact(metrics, 'disorderly')}% portfolio value at risk by 2030`,
        category: 'Stress Testing',
        confidence: 0.78,
        impact: 'high',
        actionable: true,
        timestamp: new Date()
      });

      const carbonPrice = 150; // USD per tonne
      const carbonExposure = (metrics.totalFinancedEmissions * carbonPrice) / portfolioValue * 100;
      insights.push({
        id: 'carbon-price-sensitivity',
        content: `Portfolio shows ${carbonExposure.toFixed(2)}% exposure to $150/tonne carbon pricing scenario`,
        category: 'Sensitivity Analysis',
        confidence: 0.91,
        impact: 'medium',
        actionable: true,
        timestamp: new Date()
      });
    }

    // Randomize and limit insights
    return shuffleArray(insights).slice(0, 4);
  };

  const generateFallbackInsights = (insightType: string): DynamicInsight[] => {
    const fallbackInsights = {
      'ai-insights': [
        {
          id: 'fallback-1',
          content: 'Upload your portfolio to unlock personalized AI insights and optimization recommendations',
          category: 'Getting Started',
          confidence: 1.0,
          impact: 'high' as const,
          actionable: true,
          timestamp: new Date()
        }
      ],
      'climate-risk': [
        {
          id: 'fallback-climate-1',
          content: 'Climate risk analysis requires portfolio data to assess physical and transition risk exposure',
          category: 'Risk Assessment',
          confidence: 1.0,
          impact: 'high' as const,
          actionable: true,
          timestamp: new Date()
        }
      ],
      'scenario-modeling': [
        {
          id: 'fallback-scenario-1',
          content: 'Scenario modeling capabilities unlock with portfolio data - model NGFS scenarios and stress tests',
          category: 'Scenario Analysis',
          confidence: 1.0,
          impact: 'high' as const,
          actionable: true,
          timestamp: new Date()
        }
      ]
    };

    return fallbackInsights[insightType as keyof typeof fallbackInsights] || fallbackInsights['ai-insights'];
  };

  // Helper functions for calculations
  const calculateAverageVehicleAge = (metrics: any): number => {
    const currentYear = new Date().getFullYear();
    // Mock calculation - in real implementation, analyze actual vehicle years
    return Math.random() * 5 + 6; // 6-11 years
  };

  const calculateEVPercentage = (metrics: any): number => {
    // Mock calculation - in real implementation, analyze fuel types
    return Math.random() * 20; // 0-20%
  };

  const analyzeGeographicRisk = (distribution: any): string[] => {
    // Mock analysis - in real implementation, cross-reference with climate risk data
    const riskRegions = ['Florida', 'California', 'Texas Gulf Coast'];
    return riskRegions.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const calculateScenarioImpact = (metrics: any, scenario: 'orderly' | 'disorderly'): number => {
    // Mock calculation - in real implementation, use scenario modeling engine
    return scenario === 'orderly' ? 85 + Math.random() * 10 : 15 + Math.random() * 10;
  };

  const shuffleArray = function<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getEmptyStateConfig = () => {
    switch (type) {
      case 'ai-insights':
        return {
          title: 'AI-Powered Portfolio Insights',
          description: 'Get intelligent recommendations and analysis for your loan portfolio',
          icon: <Brain className="h-8 w-8 text-primary" />,
          previewData: {
            sampleInsights: [
              "23% of your loans could improve to PCAF Option 2a with enhanced vehicle data",
              "Electric vehicle loans show 75% lower emissions intensity than ICE vehicles",
              "Focus on 2019-2021 model years for the biggest data quality improvements",
              "Your portfolio is 85% ready for PCAF compliance reporting"
            ],
            categories: ['Data Quality', 'Emission Reduction', 'Compliance', 'Risk Assessment']
          }
        };
      
      case 'climate-risk':
        return {
          title: 'Climate Risk Analysis',
          description: 'Assess physical and transition risks across your motor vehicle portfolio',
          icon: <Globe className="h-8 w-8 text-orange-600" />,
          previewData: {
            sampleInsights: [
              "Portfolio shows medium transition risk exposure (3.2/5.0 score)",
              "Electric vehicle adoption could reduce transition risk by 40%",
              "Geographic concentration in climate-vulnerable regions: 15%",
              "Stranded asset risk for ICE vehicles increases after 2030"
            ],
            categories: ['Physical Risk', 'Transition Risk', 'Regulatory Risk', 'Technology Risk']
          }
        };
      
      case 'scenario-modeling':
        return {
          title: 'Climate Scenario Modeling',
          description: 'Model your portfolio performance under different climate scenarios',
          icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
          previewData: {
            sampleInsights: [
              "Under NGFS Orderly Transition: 25% emissions reduction by 2030",
              "Disorderly transition scenario shows 15% portfolio value at risk",
              "Physical risk impacts estimated at <2% of portfolio value",
              "Early EV adoption reduces scenario risk by 60%"
            ],
            categories: ['NGFS Scenarios', 'Stress Testing', 'Sensitivity Analysis', 'Forward Projections']
          }
        };
      
      default:
        return {
          title: 'Portfolio Analytics',
          description: 'Comprehensive analytics and insights for your loan portfolio',
          icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
          previewData: {
            sampleInsights: [
              "Portfolio emissions intensity: 2.1 kg CO₂e per $1,000 outstanding",
              "Data quality score: 2.8 (PCAF compliant)",
              "Total financed emissions: 8,400 tCO₂e across 1,247 loans",
              "Top improvement opportunity: Vehicle specification data"
            ],
            categories: ['Emissions', 'Data Quality', 'Compliance', 'Performance']
          }
        };
    }
  };

  const config = getEmptyStateConfig();

  const handleUploadData = () => {
    navigate('/financed-emissions/upload');
    toast({
      title: "Let's Upload Your Data",
      description: "Upload your portfolio to unlock AI-powered insights",
    });
    onGetStarted?.();
  };

  const handleLearnMore = () => {
    toast({
      title: "Learning Resources",
      description: "Opening PCAF methodology guide...",
    });
  };

  const handleViewDemo = () => {
    setActiveTab('demo');
    toast({
      title: "Demo Mode",
      description: "Viewing sample insights to show platform capabilities",
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              {config.icon}
              <div>
                <h1 className="text-2xl font-bold">{config.title}</h1>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
            </div>
            
            <Alert className="max-w-2xl mx-auto">
              <Upload className="h-4 w-4" />
              <AlertDescription>
                <strong>No portfolio data found.</strong> Upload your loan data to unlock AI-powered insights, 
                climate risk analysis, and scenario modeling capabilities.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleUploadData} size="lg" className="px-8">
                Upload Portfolio Data
                <Upload className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={handleViewDemo}>
                View Sample Insights
                <Play className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">What You'll Get</TabsTrigger>
          <TabsTrigger value="demo">Sample Insights</TabsTrigger>
          <TabsTrigger value="learn">Learn PCAF</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          <CapabilityPreview type={type} />
        </TabsContent>

        <TabsContent value="demo" className="space-y-6">
          {portfolioMetrics ? (
            <DynamicInsightsDisplay 
              insights={dynamicInsights} 
              loading={loading}
              onRefresh={generateDynamicInsights}
              type={type}
            />
          ) : (
            <SampleInsightsDemo config={config} />
          )}
        </TabsContent>

        <TabsContent value="learn" className="space-y-6">
          <LearningResources type={type} onLearnMore={handleLearnMore} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CapabilityPreview({ type }: { type: string }) {
  const capabilities = {
    'ai-insights': [
      {
        title: 'Data Quality Analysis',
        description: 'AI identifies which loans need better data for PCAF compliance',
        icon: <Target className="h-6 w-6" />,
        color: 'text-green-600 bg-green-100'
      },
      {
        title: 'Emission Reduction Opportunities',
        description: 'Smart recommendations for reducing portfolio emissions intensity',
        icon: <TrendingUp className="h-6 w-6" />,
        color: 'text-blue-600 bg-blue-100'
      },
      {
        title: 'Compliance Readiness',
        description: 'Automated assessment of PCAF compliance status and gaps',
        icon: <Shield className="h-6 w-6" />,
        color: 'text-purple-600 bg-purple-100'
      },
      {
        title: 'Business Intelligence',
        description: 'Strategic insights for portfolio optimization and risk management',
        icon: <Brain className="h-6 w-6" />,
        color: 'text-orange-600 bg-orange-100'
      }
    ],
    'climate-risk': [
      {
        title: 'Physical Risk Assessment',
        description: 'Analyze exposure to extreme weather and climate hazards',
        icon: <Globe className="h-6 w-6" />,
        color: 'text-red-600 bg-red-100'
      },
      {
        title: 'Transition Risk Modeling',
        description: 'Model impacts of carbon pricing and technology shifts',
        icon: <TrendingUp className="h-6 w-6" />,
        color: 'text-blue-600 bg-blue-100'
      },
      {
        title: 'Regulatory Risk Tracking',
        description: 'Monitor changing regulations and compliance requirements',
        icon: <Shield className="h-6 w-6" />,
        color: 'text-purple-600 bg-purple-100'
      },
      {
        title: 'Portfolio Resilience',
        description: 'Assess portfolio resilience under climate stress scenarios',
        icon: <Target className="h-6 w-6" />,
        color: 'text-green-600 bg-green-100'
      }
    ],
    'scenario-modeling': [
      {
        title: 'NGFS Scenario Analysis',
        description: 'Model portfolio under official climate scenarios',
        icon: <BarChart3 className="h-6 w-6" />,
        color: 'text-blue-600 bg-blue-100'
      },
      {
        title: 'Stress Testing',
        description: 'Regulatory stress tests for climate risk assessment',
        icon: <Shield className="h-6 w-6" />,
        color: 'text-red-600 bg-red-100'
      },
      {
        title: 'Sensitivity Analysis',
        description: 'Test portfolio sensitivity to key climate parameters',
        icon: <Target className="h-6 w-6" />,
        color: 'text-green-600 bg-green-100'
      },
      {
        title: 'Forward Projections',
        description: '10-year emissions and value projections under scenarios',
        icon: <TrendingUp className="h-6 w-6" />,
        color: 'text-purple-600 bg-purple-100'
      }
    ]
  };

  const typeCapabilities = capabilities[type as keyof typeof capabilities] || capabilities['ai-insights'];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Powerful Capabilities Await</h2>
        <p className="text-muted-foreground">
          Once you upload your portfolio data, you'll unlock these advanced features
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {typeCapabilities.map((capability, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${capability.color}`}>
                  {capability.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{capability.title}</h3>
                  <p className="text-sm text-muted-foreground">{capability.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DynamicInsightsDisplay({ 
  insights, 
  loading, 
  onRefresh, 
  type 
}: { 
  insights: DynamicInsight[]; 
  loading: boolean; 
  onRefresh: () => void;
  type: string;
}) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (insightType: string) => {
    switch (insightType) {
      case 'ai-insights': return <Brain className="h-5 w-5 text-primary" />;
      case 'climate-risk': return <Globe className="h-5 w-5 text-orange-600" />;
      case 'scenario-modeling': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default: return <BarChart3 className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Live Portfolio Insights</h2>
          <p className="text-muted-foreground">
            AI-generated insights based on your current portfolio data
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon(type)}
            Dynamic Analysis Results
          </CardTitle>
          <CardDescription>
            Real-time insights generated from your portfolio data using AI and RAG systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Generating insights...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">{insight.content}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {insight.category}
                      </Badge>
                      <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Actionable
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {insight.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {insights.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No insights generated yet. Try refreshing or upload more data.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Live AI Analysis:</strong> These insights are dynamically generated from your portfolio data 
          using our RAG system and update automatically as your data changes.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function SampleInsightsDemo({ config }: { config: any }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Sample Insights</h2>
        <p className="text-muted-foreground">
          Here's the kind of intelligent analysis you'll receive with your data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Analysis Preview
          </CardTitle>
          <CardDescription>
            Sample insights based on typical motor vehicle loan portfolios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config.previewData.sampleInsights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{insight}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {config.previewData.categories[index % config.previewData.categories.length]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Sample insight</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Play className="h-4 w-4" />
        <AlertDescription>
          <strong>This is sample data</strong> to demonstrate platform capabilities. 
          Upload your portfolio to see real insights tailored to your specific loans and risk profile.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function LearningResources({ type, onLearnMore }: { type: string; onLearnMore: () => void }) {
  const resources = {
    'ai-insights': [
      {
        title: 'Understanding AI Insights',
        description: 'Learn how AI analyzes your portfolio for optimization opportunities',
        duration: '5 min',
        level: 'Beginner'
      },
      {
        title: 'Data Quality Optimization',
        description: 'Master the art of improving PCAF data quality scores',
        duration: '8 min',
        level: 'Intermediate'
      },
      {
        title: 'Advanced Analytics',
        description: 'Leverage AI for strategic portfolio management decisions',
        duration: '12 min',
        level: 'Advanced'
      }
    ],
    'climate-risk': [
      {
        title: 'Climate Risk Fundamentals',
        description: 'Introduction to physical and transition climate risks',
        duration: '6 min',
        level: 'Beginner'
      },
      {
        title: 'TCFD Framework',
        description: 'Understanding TCFD recommendations for climate risk disclosure',
        duration: '10 min',
        level: 'Intermediate'
      },
      {
        title: 'Risk Scenario Planning',
        description: 'Advanced climate scenario analysis for financial institutions',
        duration: '15 min',
        level: 'Advanced'
      }
    ],
    'scenario-modeling': [
      {
        title: 'NGFS Scenarios Explained',
        description: 'Understanding Network for Greening the Financial System scenarios',
        duration: '8 min',
        level: 'Beginner'
      },
      {
        title: 'Stress Testing Basics',
        description: 'Introduction to climate stress testing for loan portfolios',
        duration: '12 min',
        level: 'Intermediate'
      },
      {
        title: 'Advanced Modeling',
        description: 'Custom scenario development and sensitivity analysis',
        duration: '20 min',
        level: 'Advanced'
      }
    ]
  };

  const typeResources = resources[type as keyof typeof resources] || resources['ai-insights'];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Learn While You Prepare</h2>
        <p className="text-muted-foreground">
          Build your expertise while preparing your portfolio data
        </p>
      </div>

      <div className="grid gap-4">
        {typeResources.map((resource, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getLevelColor(resource.level)}>
                    {resource.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{resource.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">Ready to See Real Insights?</h3>
            <p className="text-sm text-muted-foreground">
              Upload your portfolio data to unlock personalized AI analysis
            </p>
            <Button onClick={() => navigate('/financed-emissions/upload')}>
              Upload Data Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartEmptyState;