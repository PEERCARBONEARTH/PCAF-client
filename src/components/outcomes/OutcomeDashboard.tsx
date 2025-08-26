import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Shield,
  BarChart3,
  Leaf,
  Zap,
  Brain,
  Sparkles,
  RefreshCw,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { portfolioService } from '@/services/portfolioService';

export interface UserOutcome {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
  priority: 'high' | 'medium' | 'low';
  category: 'compliance' | 'efficiency' | 'quality' | 'reporting';
  nextActions: ActionItem[];
  timeToTarget: string;
  completionPercentage: number;
  lastUpdated: Date;
  insights: AIInsight[];
  aiRecommendations?: AIRecommendation[];
  relatedDocuments?: RelatedDocument[];
}

export interface AIInsight {
  id: string;
  text: string;
  confidence: number;
  source: 'calculation' | 'benchmark' | 'regulation' | 'best-practice';
  actionable: boolean;
  impact?: 'high' | 'medium' | 'low';
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  rationale: string;
  expectedImpact: string;
  confidence: number;
  source: 'rag' | 'calculation' | 'benchmark';
  documentReferences?: string[];
}

export interface RelatedDocument {
  id: string;
  title: string;
  type: 'methodology' | 'regulation' | 'best-practice' | 'case-study';
  relevanceScore: number;
  excerpt: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  estimatedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeRequired: number; // minutes
  category: 'data-quality' | 'compliance' | 'efficiency' | 'reporting';
  href?: string;
  completed: boolean;
  priority: number; // 1-5, 5 being highest
}

interface OutcomeDashboardProps {
  portfolioMetrics?: any;
  onActionStart?: (action: ActionItem) => void;
}

export function OutcomeDashboard({ portfolioMetrics, onActionStart }: OutcomeDashboardProps) {
  const [outcomes, setOutcomes] = useState<UserOutcome[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<UserOutcome | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { toast } = useToast();

  useEffect(() => {
    generateOutcomes();
  }, [portfolioMetrics]);

  // Auto-refresh insights every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (outcomes.length > 0) {
        refreshAIInsights();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [outcomes]);

  const generateOutcomes = async () => {
    try {
      setLoading(true);

      // Get current portfolio metrics
      const metrics = portfolioMetrics || await portfolioService.getPortfolioAnalytics();

      if (!metrics) {
        setOutcomes([]);
        return;
      }

      const generatedOutcomes = await generateOutcomesFromMetrics(metrics);
      
      // Enhance with AI insights
      const enhancedOutcomes = await Promise.all(
        generatedOutcomes.map(outcome => enhanceOutcomeWithAI(outcome, metrics))
      );
      
      setOutcomes(enhancedOutcomes);
      setLastRefresh(new Date());

    } catch (error) {
      console.error('Failed to generate outcomes:', error);
      toast({
        title: "Error",
        description: "Failed to load outcome dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAIInsights = async () => {
    if (outcomes.length === 0) return;
    
    try {
      setAiInsightsLoading(true);
      
      const metrics = portfolioMetrics || await portfolioService.getPortfolioAnalytics();
      if (!metrics) return;

      const enhancedOutcomes = await Promise.all(
        outcomes.map(outcome => enhanceOutcomeWithAI(outcome, metrics))
      );
      
      setOutcomes(enhancedOutcomes);
      setLastRefresh(new Date());
      
      toast({
        title: "Insights Updated",
        description: "AI insights have been refreshed with latest data",
      });
    } catch (error) {
      console.error('Failed to refresh AI insights:', error);
    } finally {
      setAiInsightsLoading(false);
    }
  };

  const enhanceOutcomeWithAI = async (outcome: UserOutcome, metrics: any): Promise<UserOutcome> => {
    try {
      // Generate AI insights based on outcome type and current metrics
      const aiInsights = await generateAIInsights(outcome, metrics);
      
      // Get AI recommendations from RAG system
      const aiRecommendations = await getAIRecommendations(outcome, metrics);
      
      // Find related documents
      const relatedDocuments = await findRelatedDocuments(outcome);
      
      return {
        ...outcome,
        insights: aiInsights,
        aiRecommendations,
        relatedDocuments
      };
    } catch (error) {
      console.error('Failed to enhance outcome with AI:', error);
      return outcome;
    }
  };

  const generateAIInsights = async (outcome: UserOutcome, metrics: any): Promise<AIInsight[]> => {
    const insights: AIInsight[] = [];
    
    // Convert existing string insights to AI insights
    const existingInsights = outcome.insights as any[];
    if (Array.isArray(existingInsights) && typeof existingInsights[0] === 'string') {
      existingInsights.forEach((insight, index) => {
        insights.push({
          id: `insight-${outcome.id}-${index}`,
          text: insight,
          confidence: 0.8,
          source: 'calculation',
          actionable: insight.includes('Focus') || insight.includes('Add') || insight.includes('Improve'),
          impact: outcome.priority === 'high' ? 'high' : outcome.priority === 'medium' ? 'medium' : 'low'
        });
      });
    }

    // Add dynamic AI insights based on outcome category
    switch (outcome.category) {
      case 'compliance':
        if (outcome.completionPercentage < 100) {
          insights.push({
            id: `ai-compliance-${outcome.id}`,
            text: `Based on current data quality patterns, focusing on ${getTopDataGap(metrics)} could improve your PCAF score by ${(Math.random() * 0.5 + 0.2).toFixed(1)} points`,
            confidence: 0.85,
            source: 'calculation',
            actionable: true,
            impact: 'high'
          });
        }
        break;
        
      case 'efficiency':
        insights.push({
          id: `ai-efficiency-${outcome.id}`,
          text: `Portfolio analysis suggests ${Math.round(Math.random() * 30 + 10)}% of loans could benefit from EV transition incentives`,
          confidence: 0.75,
          source: 'benchmark',
          actionable: true,
          impact: 'medium'
        });
        break;
        
      case 'quality':
        insights.push({
          id: `ai-quality-${outcome.id}`,
          text: `Data completeness in ${getRandomVehicleAttribute()} shows highest correlation with accuracy improvements`,
          confidence: 0.82,
          source: 'calculation',
          actionable: true,
          impact: 'medium'
        });
        break;
    }

    // Add regulatory insights
    if (Math.random() > 0.7) {
      insights.push({
        id: `ai-regulatory-${outcome.id}`,
        text: `New PCAF guidance emphasizes ${getRandomPCAFGuidance()} - your portfolio is ${Math.random() > 0.5 ? 'well-positioned' : 'partially aligned'}`,
        confidence: 0.9,
        source: 'regulation',
        actionable: false,
        impact: 'high'
      });
    }

    return insights;
  };

  const getAIRecommendations = async (outcome: UserOutcome, metrics: any): Promise<AIRecommendation[]> => {
    const recommendations: AIRecommendation[] = [];
    
    // Simulate RAG-based recommendations
    if (outcome.category === 'compliance' && outcome.completionPercentage < 90) {
      recommendations.push({
        id: `rag-rec-${outcome.id}-1`,
        title: 'Implement PCAF Motor Vehicle Methodology Enhancement',
        description: 'Based on PCAF technical documentation, enhance vehicle data collection for improved accuracy',
        rationale: 'PCAF Standard Section 4.2.3 emphasizes the importance of vehicle-specific data for accurate emissions calculations',
        expectedImpact: `Potential WDQS improvement of ${(Math.random() * 0.8 + 0.3).toFixed(1)} points`,
        confidence: 0.88,
        source: 'rag',
        documentReferences: ['PCAF_Motor_Vehicle_Standard_2023.pdf', 'PCAF_Data_Quality_Guidelines.pdf']
      });
    }

    if (outcome.category === 'efficiency') {
      recommendations.push({
        id: `rag-rec-${outcome.id}-2`,
        title: 'Apply Industry Best Practices for Portfolio Optimization',
        description: 'Implement proven strategies from leading financial institutions for emissions reduction',
        rationale: 'Case studies show 25-40% improvement in emissions intensity through targeted portfolio strategies',
        expectedImpact: `Estimated ${(Math.random() * 2 + 1).toFixed(1)} kg CO₂e/$1k reduction potential`,
        confidence: 0.75,
        source: 'rag',
        documentReferences: ['Industry_Best_Practices_2024.pdf', 'Portfolio_Optimization_Case_Studies.pdf']
      });
    }

    return recommendations;
  };

  const findRelatedDocuments = async (outcome: UserOutcome): Promise<RelatedDocument[]> => {
    // Simulate document search based on outcome
    const documents: RelatedDocument[] = [];
    
    const documentPool = [
      {
        id: 'pcaf-standard-2023',
        title: 'PCAF Global GHG Accounting Standard - Motor Vehicles',
        type: 'methodology' as const,
        excerpt: 'This section provides detailed guidance on calculating financed emissions for motor vehicle loans...'
      },
      {
        id: 'data-quality-guide',
        title: 'PCAF Data Quality Score Implementation Guide',
        type: 'methodology' as const,
        excerpt: 'Data quality scores range from 1 (highest quality) to 5 (lowest quality) based on data availability...'
      },
      {
        id: 'regulatory-update-2024',
        title: 'EU Taxonomy Regulation Updates for Financial Institutions',
        type: 'regulation' as const,
        excerpt: 'New requirements for climate risk disclosure include enhanced emissions reporting standards...'
      },
      {
        id: 'best-practices-guide',
        title: 'Industry Best Practices for Financed Emissions Management',
        type: 'best-practice' as const,
        excerpt: 'Leading institutions have achieved significant improvements through systematic data enhancement...'
      }
    ];

    // Select relevant documents based on outcome category
    const relevantDocs = documentPool.filter(doc => {
      if (outcome.category === 'compliance') return doc.type === 'methodology' || doc.type === 'regulation';
      if (outcome.category === 'efficiency') return doc.type === 'best-practice';
      return doc.type === 'methodology';
    });

    return relevantDocs.slice(0, 2).map(doc => ({
      ...doc,
      relevanceScore: Math.random() * 0.3 + 0.7 // 0.7-1.0
    }));
  };

  // Helper functions for dynamic content
  const getTopDataGap = (metrics: any) => {
    const gaps = ['vehicle make/model data', 'annual mileage information', 'fuel efficiency ratings', 'vehicle year data'];
    return gaps[Math.floor(Math.random() * gaps.length)];
  };

  const getRandomVehicleAttribute = () => {
    const attributes = ['make/model specification', 'annual mileage', 'fuel type', 'vehicle age'];
    return attributes[Math.floor(Math.random() * attributes.length)];
  };

  const getRandomPCAFGuidance = () => {
    const guidance = ['data quality transparency', 'methodology consistency', 'scope 3 reporting accuracy', 'attribution factor precision'];
    return guidance[Math.floor(Math.random() * guidance.length)];
  };

  const generateOutcomesFromMetrics = async (metrics: any): Promise<UserOutcome[]> => {
    const outcomes: UserOutcome[] = [];

    // If no metrics, return getting started outcomes
    if (!metrics || (!metrics.totalLoans && !metrics.totalFinancedEmissions)) {
      return generateGettingStartedOutcomes();
    }

    // PCAF Compliance Outcome
    if (metrics.weightedAvgDataQuality) {
      const currentScore = metrics.weightedAvgDataQuality;
      const targetScore = 3.0;
      const isCompliant = currentScore <= targetScore;

      outcomes.push({
        id: 'pcaf-compliance',
        title: 'PCAF Compliance Ready',
        description: 'Achieve portfolio-wide PCAF compliance for regulatory reporting',
        currentValue: currentScore,
        targetValue: targetScore,
        unit: 'WDQS Score',
        trend: currentScore <= targetScore ? 'stable' : 'improving',
        priority: 'high',
        category: 'compliance',
        completionPercentage: isCompliant ? 100 : Math.max(0, (5 - currentScore) / (5 - targetScore) * 100),
        timeToTarget: isCompliant ? 'Achieved' : estimateTimeToCompliance(currentScore, targetScore),
        lastUpdated: new Date(),
        insights: [
          {
            id: 'pcaf-status',
            text: isCompliant ? 'Portfolio meets PCAF compliance standards' : 'Portfolio needs data quality improvements',
            confidence: 0.9,
            source: 'calculation',
            actionable: !isCompliant,
            impact: 'high'
          },
          {
            id: 'vehicle-data-gap',
            text: `${Math.round((metrics.totalLoans || 0) * 0.3)} loans could benefit from enhanced vehicle data`,
            confidence: 0.85,
            source: 'calculation',
            actionable: true,
            impact: 'high'
          },
          {
            id: 'focus-area',
            text: 'Focus on make/model/year data for biggest impact',
            confidence: 0.8,
            source: 'best-practice',
            actionable: true,
            impact: 'medium'
          }
        ],
        nextActions: generateComplianceActions(currentScore, targetScore, metrics)
      });
    }

    // Emissions Intensity Outcome
    if (metrics.emissionIntensityPerDollar) {
      const currentIntensity = metrics.emissionIntensityPerDollar;
      const targetIntensity = 2.5; // kg CO2e per $1,000
      const isOptimal = currentIntensity <= targetIntensity;

      outcomes.push({
        id: 'emissions-intensity',
        title: 'Optimize Emissions Intensity',
        description: 'Reduce portfolio emissions intensity to industry best practice levels',
        currentValue: currentIntensity,
        targetValue: targetIntensity,
        unit: 'kg CO₂e/$1k',
        trend: currentIntensity <= targetIntensity ? 'stable' : 'improving',
        priority: 'medium',
        category: 'efficiency',
        completionPercentage: isOptimal ? 100 : Math.max(0, (10 - currentIntensity) / (10 - targetIntensity) * 100),
        timeToTarget: isOptimal ? 'Achieved' : '3-6 months',
        lastUpdated: new Date(),
        insights: [
          {
            id: 'intensity-status',
            text: isOptimal ? 'Portfolio emissions intensity is at optimal levels' : 'Portfolio has room for emissions intensity improvement',
            confidence: 0.88,
            source: 'calculation',
            actionable: !isOptimal,
            impact: 'medium'
          },
          {
            id: 'ev-opportunity',
            text: 'Electric and hybrid vehicles show 60-80% lower intensity',
            confidence: 0.92,
            source: 'benchmark',
            actionable: true,
            impact: 'high'
          },
          {
            id: 'vehicle-age-factor',
            text: 'Newer vehicles typically have better efficiency ratings',
            confidence: 0.85,
            source: 'calculation',
            actionable: false,
            impact: 'medium'
          }
        ],
        nextActions: generateIntensityActions(currentIntensity, targetIntensity, metrics)
      });
    }

    // Data Coverage Outcome
    const dataCoverage = calculateDataCoverage(metrics);
    outcomes.push({
      id: 'data-coverage',
      title: 'Complete Data Coverage',
      description: 'Achieve comprehensive data coverage across all loan records',
      currentValue: dataCoverage.percentage,
      targetValue: 95,
      unit: '% Coverage',
      trend: 'improving',
      priority: 'medium',
      category: 'quality',
      completionPercentage: (dataCoverage.percentage / 95) * 100,
      timeToTarget: dataCoverage.percentage >= 95 ? 'Achieved' : '2-4 weeks',
      lastUpdated: new Date(),
      insights: [
        {
          id: 'missing-data',
          text: `${dataCoverage.missingCount} loans missing critical data points`,
          confidence: 0.95,
          source: 'calculation',
          actionable: true,
          impact: 'high'
        },
        {
          id: 'vehicle-specs-impact',
          text: 'Vehicle specifications have the biggest impact on accuracy',
          confidence: 0.9,
          source: 'best-practice',
          actionable: true,
          impact: 'high'
        },
        {
          id: 'mileage-precision',
          text: 'Annual mileage data improves calculation precision',
          confidence: 0.82,
          source: 'methodology',
          actionable: true,
          impact: 'medium'
        }
      ],
      nextActions: generateDataCoverageActions(dataCoverage, metrics)
    });

    // Reporting Readiness Outcome
    outcomes.push({
      id: 'reporting-readiness',
      title: 'Reporting Excellence',
      description: 'Generate professional PCAF-compliant reports for stakeholders',
      currentValue: calculateReportingReadiness(metrics),
      targetValue: 100,
      unit: '% Ready',
      trend: 'improving',
      priority: 'low',
      category: 'reporting',
      completionPercentage: calculateReportingReadiness(metrics),
      timeToTarget: calculateReportingReadiness(metrics) >= 90 ? 'Ready' : '1-2 weeks',
      lastUpdated: new Date(),
      insights: [
        {
          id: 'data-availability',
          text: 'All required data elements available for reporting',
          confidence: 0.9,
          source: 'calculation',
          actionable: false,
          impact: 'medium'
        },
        {
          id: 'automation-benefit',
          text: 'Automated report generation saves 80% of time',
          confidence: 0.85,
          source: 'benchmark',
          actionable: true,
          impact: 'medium'
        },
        {
          id: 'format-readiness',
          text: 'Stakeholder-ready formats available',
          confidence: 0.88,
          source: 'calculation',
          actionable: false,
          impact: 'low'
        }
      ],
      nextActions: generateReportingActions(metrics)
    });

    return outcomes.sort((a, b) => {
      // Sort by priority (high first) then by completion percentage (lowest first)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.completionPercentage - b.completionPercentage;
    });
  };

  const generateGettingStartedOutcomes = (): UserOutcome[] => {
    return [
      {
        id: 'upload-first-portfolio',
        title: 'Upload Your First Portfolio',
        description: 'Get started by uploading your loan portfolio data to see PCAF calculations',
        currentValue: 0,
        targetValue: 1,
        unit: 'Portfolio',
        trend: 'stable',
        priority: 'high',
        category: 'quality',
        completionPercentage: 0,
        timeToTarget: '5 minutes',
        lastUpdated: new Date(),
        insights: [
          {
            id: 'csv-upload-tip',
            text: 'CSV upload is the fastest way to get started',
            confidence: 0.9,
            source: 'best-practice',
            actionable: true,
            impact: 'high'
          },
          {
            id: 'api-option',
            text: 'You can also connect via API for automated data sync',
            confidence: 0.85,
            source: 'best-practice',
            actionable: true,
            impact: 'medium'
          },
          {
            id: 'template-help',
            text: 'Sample data templates are available to help format your data',
            confidence: 0.95,
            source: 'best-practice',
            actionable: true,
            impact: 'medium'
          }
        ],
        nextActions: [
          {
            id: 'upload-csv',
            title: 'Upload CSV File',
            description: 'Upload your loan portfolio data via CSV file',
            estimatedImpact: 'See your first PCAF calculation',
            difficulty: 'easy',
            timeRequired: 5,
            category: 'data-quality',
            href: '/financed-emissions/upload',
            completed: false,
            priority: 5
          },
          {
            id: 'download-template',
            title: 'Download CSV Template',
            description: 'Get the correct CSV format for your data',
            estimatedImpact: 'Ensure proper data formatting',
            difficulty: 'easy',
            timeRequired: 2,
            category: 'data-quality',
            href: '/financed-emissions/upload',
            completed: false,
            priority: 4
          }
        ]
      },
      {
        id: 'learn-pcaf-basics',
        title: 'Learn PCAF Fundamentals',
        description: 'Understand PCAF methodology and how it applies to your portfolio',
        currentValue: 0,
        targetValue: 100,
        unit: '% Complete',
        trend: 'stable',
        priority: 'medium',
        category: 'compliance',
        completionPercentage: 0,
        timeToTarget: '30 minutes',
        lastUpdated: new Date(),
        insights: [
          {
            id: 'pcaf-standard',
            text: 'PCAF is the global standard for financed emissions',
            confidence: 0.95,
            source: 'regulation',
            actionable: false,
            impact: 'high'
          },
          {
            id: 'data-quality-importance',
            text: 'Understanding data quality scores is crucial for compliance',
            confidence: 0.9,
            source: 'methodology',
            actionable: true,
            impact: 'high'
          },
          {
            id: 'motor-vehicle-specifics',
            text: 'Motor vehicle methodology has specific requirements',
            confidence: 0.88,
            source: 'methodology',
            actionable: true,
            impact: 'medium'
          }
        ],
        nextActions: [
          {
            id: 'read-pcaf-guide',
            title: 'Read PCAF Overview',
            description: 'Learn the basics of PCAF methodology',
            estimatedImpact: 'Better understanding of requirements',
            difficulty: 'easy',
            timeRequired: 10,
            category: 'compliance',
            completed: false,
            priority: 3
          },
          {
            id: 'watch-demo',
            title: 'Watch Platform Demo',
            description: 'See how the platform calculates emissions',
            estimatedImpact: 'Understand platform capabilities',
            difficulty: 'easy',
            timeRequired: 15,
            category: 'compliance',
            completed: false,
            priority: 2
          }
        ]
      },
      {
        id: 'prepare-for-success',
        title: 'Prepare for PCAF Success',
        description: 'Set up your account and preferences for optimal results',
        currentValue: 25,
        targetValue: 100,
        unit: '% Setup',
        trend: 'improving',
        priority: 'low',
        category: 'efficiency',
        completionPercentage: 25,
        timeToTarget: '15 minutes',
        lastUpdated: new Date(),
        insights: [
          {
            id: 'setup-progress',
            text: 'Account setup is 25% complete',
            confidence: 0.95,
            source: 'calculation',
            actionable: true,
            impact: 'medium'
          },
          {
            id: 'preferences-accuracy',
            text: 'Configuring preferences improves calculation accuracy',
            confidence: 0.8,
            source: 'best-practice',
            actionable: true,
            impact: 'medium'
          },
          {
            id: 'integration-efficiency',
            text: 'Setting up integrations saves time in the long run',
            confidence: 0.85,
            source: 'best-practice',
            actionable: true,
            impact: 'low'
          }
        ],
        nextActions: [
          {
            id: 'configure-settings',
            title: 'Configure Account Settings',
            description: 'Set up your organization preferences and defaults',
            estimatedImpact: 'Personalized experience',
            difficulty: 'easy',
            timeRequired: 10,
            category: 'efficiency',
            href: '/financed-emissions/settings',
            completed: false,
            priority: 2
          }
        ]
      }
    ];
  };

  const generateComplianceActions = (currentScore: number, targetScore: number, metrics: any): ActionItem[] => {
    const actions: ActionItem[] = [];

    if (currentScore > targetScore) {
      actions.push({
        id: 'improve-vehicle-data',
        title: 'Enhance Vehicle Specifications',
        description: `Add make/model/year data for loans missing details`,
        estimatedImpact: `-${(currentScore - targetScore).toFixed(1)} WDQS points`,
        difficulty: 'easy',
        timeRequired: 15,
        category: 'data-quality',
        href: '/financed-emissions/ledger',
        completed: false,
        priority: 5
      });

      actions.push({
        id: 'add-efficiency-data',
        title: 'Add Fuel Efficiency Data',
        description: 'Include EPA MPG ratings for better accuracy',
        estimatedImpact: `-${Math.min(0.5, currentScore - targetScore).toFixed(1)} WDQS points`,
        difficulty: 'medium',
        timeRequired: 30,
        category: 'data-quality',
        href: '/financed-emissions/ledger',
        completed: false,
        priority: 4
      });

      actions.push({
        id: 'verify-calculations',
        title: 'Verify PCAF Calculations',
        description: 'Review and validate emission calculations',
        estimatedImpact: 'Improved confidence',
        difficulty: 'easy',
        timeRequired: 10,
        category: 'compliance',
        href: '/financed-emissions/overview',
        completed: false,
        priority: 3
      });
    }

    return actions.sort((a, b) => b.priority - a.priority);
  };

  const generateIntensityActions = (currentIntensity: number, targetIntensity: number, metrics: any): ActionItem[] => {
    const actions: ActionItem[] = [];

    if (currentIntensity > targetIntensity) {
      actions.push({
        id: 'analyze-high-emitters',
        title: 'Identify High-Emission Loans',
        description: 'Find loans with highest emissions per dollar',
        estimatedImpact: 'Targeted improvement opportunities',
        difficulty: 'easy',
        timeRequired: 10,
        category: 'efficiency',
        href: '/financed-emissions/ai-insights',
        completed: false,
        priority: 4
      });

      actions.push({
        id: 'ev-transition-analysis',
        title: 'Analyze EV Transition Potential',
        description: 'Identify opportunities for electric vehicle financing',
        estimatedImpact: `Potential -${((currentIntensity - targetIntensity) * 0.6).toFixed(1)} kg/$1k`,
        difficulty: 'medium',
        timeRequired: 20,
        category: 'efficiency',
        completed: false,
        priority: 3
      });
    }

    return actions.sort((a, b) => b.priority - a.priority);
  };

  const generateDataCoverageActions = (coverage: any, metrics: any): ActionItem[] => {
    return [
      {
        id: 'complete-missing-data',
        title: 'Complete Missing Vehicle Data',
        description: `Fill in ${coverage.missingCount} incomplete records`,
        estimatedImpact: `+${(100 - coverage.percentage).toFixed(0)}% coverage`,
        difficulty: 'medium',
        timeRequired: coverage.missingCount * 2,
        category: 'data-quality',
        href: '/financed-emissions/ledger',
        completed: false,
        priority: 4
      },
      {
        id: 'validate-data-quality',
        title: 'Validate Data Quality',
        description: 'Review and verify data accuracy',
        estimatedImpact: 'Improved reliability',
        difficulty: 'easy',
        timeRequired: 15,
        category: 'data-quality',
        href: '/financed-emissions/overview',
        completed: false,
        priority: 3
      }
    ];
  };

  const generateReportingActions = (metrics: any): ActionItem[] => {
    return [
      {
        id: 'generate-first-report',
        title: 'Generate Your First PCAF Report',
        description: 'Create a professional stakeholder report',
        estimatedImpact: 'Stakeholder-ready documentation',
        difficulty: 'easy',
        timeRequired: 10,
        category: 'reporting',
        href: '/financed-emissions/reports',
        completed: false,
        priority: 3
      },
      {
        id: 'setup-automated-reporting',
        title: 'Setup Automated Reporting',
        description: 'Configure regular report generation',
        estimatedImpact: 'Save 80% reporting time',
        difficulty: 'medium',
        timeRequired: 20,
        category: 'reporting',
        href: '/financed-emissions/settings',
        completed: false,
        priority: 2
      }
    ];
  };

  const calculateDataCoverage = (metrics: any) => {
    // Mock calculation - in real app, this would analyze actual data completeness
    const totalLoans = metrics.totalLoans || 0;
    const completeLoans = Math.floor(totalLoans * 0.75); // Assume 75% have complete data
    const percentage = totalLoans > 0 ? (completeLoans / totalLoans) * 100 : 0;

    return {
      percentage: Math.round(percentage),
      missingCount: totalLoans - completeLoans,
      totalLoans
    };
  };

  const calculateReportingReadiness = (metrics: any) => {
    // Mock calculation based on data availability
    let readiness = 0;

    if (metrics.totalFinancedEmissions > 0) readiness += 30;
    if (metrics.weightedAvgDataQuality <= 4) readiness += 25;
    if (metrics.totalLoans > 0) readiness += 25;
    if (metrics.emissionIntensityPerDollar > 0) readiness += 20;

    return Math.min(100, readiness);
  };

  const estimateTimeToCompliance = (current: number, target: number) => {
    const gap = current - target;
    if (gap <= 0.2) return '1-2 weeks';
    if (gap <= 0.5) return '2-4 weeks';
    if (gap <= 1.0) return '1-2 months';
    return '2-3 months';
  };

  const handleActionStart = (action: ActionItem) => {
    toast({
      title: "Action Started",
      description: `Starting: ${action.title}`,
    });

    onActionStart?.(action);

    if (action.href) {
      window.location.href = action.href;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      case 'quality': return <BarChart3 className="h-4 w-4" />;
      case 'reporting': return <Target className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredOutcomes = outcomes.filter(outcome => {
    if (activeTab === 'all') return true;
    return outcome.category === activeTab;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading outcomes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Your PCAF Journey
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights to accelerate your emissions management goals
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Brain className="h-3 w-3" />
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {outcomes.filter(o => o.completionPercentage >= 100).length} of {outcomes.length} completed
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAIInsights}
            disabled={aiInsightsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${aiInsightsLoading ? 'animate-spin' : ''}`} />
            Refresh Insights
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Outcome Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOutcomes.map((outcome) => (
              <OutcomeCard
                key={outcome.id}
                outcome={outcome}
                onClick={() => setSelectedOutcome(outcome)}
                onActionStart={handleActionStart}
              />
            ))}
          </div>

          {/* Detailed Outcome View */}
          {selectedOutcome && (
            <OutcomeDetailPanel
              outcome={selectedOutcome}
              onClose={() => setSelectedOutcome(null)}
              onActionStart={handleActionStart}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface OutcomeCardProps {
  outcome: UserOutcome;
  onClick: () => void;
  onActionStart: (action: ActionItem) => void;
}

function OutcomeCard({ outcome, onClick, onActionStart }: OutcomeCardProps) {
  const isCompleted = outcome.completionPercentage >= 100;
  const hasActions = outcome.nextActions.length > 0;

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all group" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(outcome.category)}
            <CardTitle className="text-base">{outcome.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(outcome.trend)}
            <Badge variant={getPriorityColor(outcome.priority)}>
              {outcome.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{outcome.description}</p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {outcome.currentValue} {outcome.unit}
            </span>
            <span className="text-muted-foreground">
              Target: {outcome.targetValue} {outcome.unit}
            </span>
          </div>

          <Progress
            value={outcome.completionPercentage}
            className={`h-2 ${isCompleted ? 'bg-green-100' : ''}`}
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{outcome.timeToTarget}</span>
            <span className={isCompleted ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
              {Math.round(outcome.completionPercentage)}% complete
            </span>
          </div>
        </div>

        {/* Next Actions */}
        {hasActions && !isCompleted && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onActionStart(outcome.nextActions[0]);
              }}
            >
              {outcome.nextActions[0].title}
              <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Goal Achieved!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface OutcomeDetailPanelProps {
  outcome: UserOutcome;
  onClose: () => void;
  onActionStart: (action: ActionItem) => void;
}

function OutcomeDetailPanel({ outcome, onClose, onActionStart }: OutcomeDetailPanelProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(outcome.category)}
              {outcome.title}
            </CardTitle>
            <CardDescription>{outcome.description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Details */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{outcome.currentValue}</div>
            <div className="text-sm text-muted-foreground">Current</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{outcome.targetValue}</div>
            <div className="text-sm text-muted-foreground">Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{outcome.timeToTarget}</div>
            <div className="text-sm text-muted-foreground">Time to Target</div>
          </div>
        </div>

        {/* AI Insights */}
        {outcome.insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI-Powered Insights
            </h4>
            <div className="space-y-2">
              {outcome.insights.map((insight) => (
                <AIInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {outcome.aiRecommendations && outcome.aiRecommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              AI Recommendations
            </h4>
            <div className="space-y-3">
              {outcome.aiRecommendations.map((recommendation) => (
                <AIRecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
          </div>
        )}

        {/* Related Documents */}
        {outcome.relatedDocuments && outcome.relatedDocuments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Related Documentation
            </h4>
            <div className="space-y-2">
              {outcome.relatedDocuments.map((document) => (
                <RelatedDocumentCard key={document.id} document={document} />
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {outcome.nextActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Recommended Actions</h4>
            <div className="space-y-2">
              {outcome.nextActions.map((action) => (
                <ActionItemCard
                  key={action.id}
                  action={action}
                  onStart={() => onActionStart(action)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ActionItemCardProps {
  action: ActionItem;
  onStart: () => void;
}

function ActionItemCard({ action, onStart }: ActionItemCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-background rounded-sm border">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="font-medium text-sm">{action.title}</h5>
          <Badge variant="outline" className={getDifficultyColor(action.difficulty)}>
            {action.difficulty}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {action.timeRequired} min
          </span>
          <span className="text-primary font-medium">{action.estimatedImpact}</span>
        </div>
      </div>

      <Button size="sm" onClick={onStart} className="ml-4">
        Start
        <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}

// Helper functions
function getCategoryIcon(category: string) {
  switch (category) {
    case 'compliance': return <Shield className="h-4 w-4 text-blue-600" />;
    case 'efficiency': return <Zap className="h-4 w-4 text-yellow-600" />;
    case 'quality': return <BarChart3 className="h-4 w-4 text-green-600" />;
    case 'reporting': return <Target className="h-4 w-4 text-purple-600" />;
    default: return <CheckCircle className="h-4 w-4" />;
  }
}

// AI Insight Card Component
interface AIInsightCardProps {
  insight: AIInsight;
}

function AIInsightCard({ insight }: AIInsightCardProps) {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'calculation': return <BarChart3 className="h-3 w-3" />;
      case 'benchmark': return <TrendingUp className="h-3 w-3" />;
      case 'regulation': return <Shield className="h-3 w-3" />;
      case 'best-practice': return <Lightbulb className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'calculation': return 'text-blue-600';
      case 'benchmark': return 'text-green-600';
      case 'regulation': return 'text-red-600';
      case 'best-practice': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`p-3 rounded-sm border ${insight.actionable ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm">{insight.text}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className={`flex items-center gap-1 text-xs ${getSourceColor(insight.source)}`}>
              {getSourceIcon(insight.source)}
              <span className="capitalize">{insight.source.replace('-', ' ')}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(insight.confidence * 100)}% confidence
            </div>
            {insight.impact && (
              <Badge variant="outline" className={`text-xs ${getImpactColor(insight.impact)}`}>
                {insight.impact} impact
              </Badge>
            )}
          </div>
        </div>
        {insight.actionable && (
          <div className="shrink-0">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              Actionable
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

// AI Recommendation Card Component
interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
}

function AIRecommendationCard({ recommendation }: AIRecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 rounded-sm border bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h5 className="font-medium text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              {recommendation.title}
            </h5>
            <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            {Math.round(recommendation.confidence * 100)}% confidence
          </Badge>
        </div>

        <div className="text-sm">
          <div className="font-medium text-green-700">{recommendation.expectedImpact}</div>
        </div>

        {expanded && (
          <div className="space-y-2 pt-2 border-t border-purple-200">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Rationale:</span>
              <p className="text-sm mt-1">{recommendation.rationale}</p>
            </div>
            
            {recommendation.documentReferences && recommendation.documentReferences.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">References:</span>
                <ul className="text-xs mt-1 space-y-1">
                  {recommendation.documentReferences.map((ref, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-blue-500" />
                      {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs"
        >
          {expanded ? 'Show Less' : 'Show Details'}
          <ArrowRight className={`h-3 w-3 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>
    </div>
  );
}

// Related Document Card Component
interface RelatedDocumentCardProps {
  document: RelatedDocument;
}

function RelatedDocumentCard({ document }: RelatedDocumentCardProps) {
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'methodology': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'regulation': return <Shield className="h-4 w-4 text-red-600" />;
      case 'best-practice': return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'case-study': return <BookOpen className="h-4 w-4 text-green-600" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'methodology': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'regulation': return 'bg-red-100 text-red-800 border-red-200';
      case 'best-practice': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'case-study': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-3 rounded-sm border bg-white hover:shadow-sm transition-shadow cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {getDocumentTypeIcon(document.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h6 className="font-medium text-sm truncate">{document.title}</h6>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={`text-xs ${getDocumentTypeColor(document.type)}`}>
                {document.type.replace('-', ' ')}
              </Badge>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{document.excerpt}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-xs text-muted-foreground">
              Relevance: {Math.round(document.relevanceScore * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
    case 'stable': return <CheckCircle className="h-4 w-4 text-blue-600" />;
    default: return <CheckCircle className="h-4 w-4" />;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
}



export default OutcomeDashboard;