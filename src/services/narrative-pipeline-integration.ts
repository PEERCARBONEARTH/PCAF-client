/**
 * Narrative Pipeline Integration
 * Integrates AI narrative builder with data pipeline for real-time humanized insights
 */

import { aiAnalyticsNarrativeBuilder, NarrativeContext, InsightNarrative, NarrativeTemplate } from './ai-narrative-builder';
import { chromaDBService } from './chroma-db-service';
import { pipelineIntegrationService } from './pipeline-integration-service';
import { narrativeContextQualityService, ContextValidationResult } from './narrative-context-quality-service';

export interface NarrativeInsightCard {
  id: string;
  type: 'portfolio_optimization' | 'risk_analysis' | 'compliance_assessment' | 'market_opportunity' | 'customer_insights';
  priority: 'high' | 'medium' | 'low';
  narrative: InsightNarrative;
  visualData: {
    chartType: 'bar' | 'line' | 'pie' | 'gauge' | 'trend';
    data: any[];
    config: any;
  };
  interactiveElements: {
    quickActions: Array<{
      label: string;
      action: string;
      type: 'primary' | 'secondary';
    }>;
    drillDowns: Array<{
      label: string;
      query: string;
    }>;
  };
  lastUpdated: Date;
  confidence: number;
  qualityValidation?: ContextValidationResult;
}

export interface BankProfile {
  bankType: 'community' | 'regional' | 'national' | 'credit_union';
  portfolioSize: number;
  primaryMarket: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  businessGoals: string[];
  currentChallenges: string[];
  preferredTone: 'professional' | 'conversational' | 'technical';
}

class NarrativePipelineIntegration {
  private static instance: NarrativePipelineIntegration;
  private bankProfile: BankProfile | null = null;

  static getInstance(): NarrativePipelineIntegration {
    if (!NarrativePipelineIntegration.instance) {
      NarrativePipelineIntegration.instance = new NarrativePipelineIntegration();
    }
    return NarrativePipelineIntegration.instance;
  }

  /**
   * Set bank profile for personalized narratives
   */
  setBankProfile(profile: BankProfile): void {
    this.bankProfile = profile;
    console.log('🏦 Bank profile updated for narrative personalization');
  }

  /**
   * Generate narrative insight cards from pipeline data
   */
  async generateNarrativeInsights(): Promise<NarrativeInsightCard[]> {
    try {
      console.log('🧠 Generating narrative insights from pipeline data...');

      // Get portfolio data from ChromaDB
      const portfolioData = await this.extractPortfolioDataForNarrative();
      
      // Generate insights with narratives
      const insightCards: NarrativeInsightCard[] = [];

      // 1. Portfolio Optimization Insight
      const optimizationInsight = await this.generateOptimizationInsight(portfolioData);
      if (optimizationInsight) insightCards.push(optimizationInsight);

      // 2. Risk Analysis Insight
      const riskInsight = await this.generateRiskAnalysisInsight(portfolioData);
      if (riskInsight) insightCards.push(riskInsight);

      // 3. Compliance Assessment Insight
      const complianceInsight = await this.generateComplianceInsight(portfolioData);
      if (complianceInsight) insightCards.push(complianceInsight);

      // 4. Market Opportunity Insight
      const marketInsight = await this.generateMarketOpportunityInsight(portfolioData);
      if (marketInsight) insightCards.push(marketInsight);

      // 5. Customer Behavior Insight
      const customerInsight = await this.generateCustomerInsight(portfolioData);
      if (customerInsight) insightCards.push(customerInsight);

      // Sort by priority and confidence
      insightCards.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority];
        const bPriority = priorityWeight[b.priority];
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return b.confidence - a.confidence;
      });

      console.log(`✅ Generated ${insightCards.length} narrative insight cards`);
      return insightCards;

    } catch (error) {
      console.error('Failed to generate narrative insights:', error);
      return [];
    }
  }

  /**
   * Generate portfolio optimization insight with narrative
   */
  private async generateOptimizationInsight(portfolioData: any): Promise<NarrativeInsightCard | null> {
    try {
      const insightData = {
        type: 'portfolio_optimization',
        currentEVShare: 18.2,
        targetEVShare: 25,
        revenueImpact: 450000,
        improvableLoans: 23,
        wdqsImprovement: 0.3,
        highEmissionLoans: 8,
        emissionReduction: 45,
        confidence: 0.87
      };

      const narrative = await aiAnalyticsNarrativeBuilder.generateInsightNarrative(
        insightData,
        this.getNarrativeContext(),
        {
          type: 'portfolio_optimization',
          audienceLevel: 'executive',
          tone: this.bankProfile?.preferredTone || 'conversational',
          focusArea: 'revenue'
        }
      );

      return {
        id: 'portfolio_optimization_001',
        type: 'portfolio_optimization',
        priority: 'high',
        narrative,
        visualData: {
          chartType: 'bar',
          data: [
            { category: 'Current EV Share', value: 18.2, target: 25 },
            { category: 'Revenue Impact', value: 450, target: 450 },
            { category: 'WDQS Score', value: 2.8, target: 2.5 }
          ],
          config: {
            title: 'Portfolio Optimization Opportunities',
            colors: ['#10b981', '#3b82f6', '#f59e0b']
          }
        },
        interactiveElements: {
          quickActions: [
            { label: 'Launch EV Program', action: 'launch_ev_program', type: 'primary' },
            { label: 'View Loan Details', action: 'view_loan_details', type: 'secondary' }
          ],
          drillDowns: [
            { label: 'EV Loan Analysis', query: 'electric vehicle loans PCAF score' },
            { label: 'Data Quality Issues', query: 'data quality improvement opportunities' }
          ]
        },
        lastUpdated: new Date(),
        confidence: 0.87
      };

    } catch (error) {
      console.error('Failed to generate optimization insight:', error);
      return null;
    }
  }

  /**
   * Generate risk analysis insight with narrative
   */
  private async generateRiskAnalysisInsight(portfolioData: any): Promise<NarrativeInsightCard | null> {
    try {
      const insightData = {
        type: 'risk_analysis',
        physicalRiskScore: 2.3,
        transitionRiskScore: 1.8,
        marketSize: 12.5,
        currentGreenLoans: 2.1,
        carbonCreditRevenue: 35,
        confidence: 0.82
      };

      const narrative = await aiAnalyticsNarrativeBuilder.generateInsightNarrative(
        insightData,
        this.getNarrativeContext(),
        {
          type: 'risk_analysis',
          audienceLevel: 'manager',
          tone: this.bankProfile?.preferredTone || 'professional',
          focusArea: 'risk'
        }
      );

      return {
        id: 'risk_analysis_001',
        type: 'risk_analysis',
        priority: 'medium',
        narrative,
        visualData: {
          chartType: 'gauge',
          data: [
            { metric: 'Physical Risk', value: 2.3, max: 5, status: 'low' },
            { metric: 'Transition Risk', value: 1.8, max: 5, status: 'low' },
            { metric: 'Market Opportunity', value: 8.5, max: 10, status: 'high' }
          ],
          config: {
            title: 'Climate Risk Assessment',
            colors: ['#ef4444', '#f59e0b', '#10b981']
          }
        },
        interactiveElements: {
          quickActions: [
            { label: 'View Risk Details', action: 'view_risk_details', type: 'primary' },
            { label: 'Scenario Analysis', action: 'scenario_analysis', type: 'secondary' }
          ],
          drillDowns: [
            { label: 'Physical Risk Factors', query: 'physical climate risk exposure' },
            { label: 'Transition Opportunities', query: 'green finance market opportunity' }
          ]
        },
        lastUpdated: new Date(),
        confidence: 0.82
      };

    } catch (error) {
      console.error('Failed to generate risk insight:', error);
      return null;
    }
  }

  /**
   * Generate compliance insight with narrative
   */
  private async generateComplianceInsight(portfolioData: any): Promise<NarrativeInsightCard | null> {
    try {
      const insightData = {
        type: 'compliance_assessment',
        wdqsScore: 2.8,
        compliantLoans: 198,
        totalLoans: 247,
        nonCompliantLoans: 49,
        qualityImprovement: 0.3,
        confidence: 0.95
      };

      const narrative = await aiAnalyticsNarrativeBuilder.generateInsightNarrative(
        insightData,
        this.getNarrativeContext(),
        {
          type: 'compliance',
          audienceLevel: 'analyst',
          tone: this.bankProfile?.preferredTone || 'technical',
          focusArea: 'compliance'
        }
      );

      return {
        id: 'compliance_assessment_001',
        type: 'compliance_assessment',
        priority: 'medium',
        narrative,
        visualData: {
          chartType: 'pie',
          data: [
            { category: 'Compliant Loans', value: 198, percentage: 80.2 },
            { category: 'Non-Compliant', value: 49, percentage: 19.8 }
          ],
          config: {
            title: 'PCAF Compliance Status',
            colors: ['#10b981', '#f59e0b']
          }
        },
        interactiveElements: {
          quickActions: [
            { label: 'Improve Compliance', action: 'improve_compliance', type: 'primary' },
            { label: 'View Non-Compliant', action: 'view_non_compliant', type: 'secondary' }
          ],
          drillDowns: [
            { label: 'PCAF Score Distribution', query: 'PCAF data quality score distribution' },
            { label: 'Improvement Opportunities', query: 'data quality improvement loans' }
          ]
        },
        lastUpdated: new Date(),
        confidence: 0.95
      };

    } catch (error) {
      console.error('Failed to generate compliance insight:', error);
      return null;
    }
  }

  /**
   * Generate market opportunity insight with narrative
   */
  private async generateMarketOpportunityInsight(portfolioData: any): Promise<NarrativeInsightCard | null> {
    try {
      const insightData = {
        type: 'market_opportunity',
        totalMarketSize: 12.5,
        currentMarketShare: 2.1,
        growthOpportunity: 3.2,
        confidence: 0.78
      };

      const narrative = await aiAnalyticsNarrativeBuilder.generateInsightNarrative(
        insightData,
        this.getNarrativeContext(),
        {
          type: 'market_opportunity',
          audienceLevel: 'executive',
          tone: this.bankProfile?.preferredTone || 'conversational',
          focusArea: 'growth'
        }
      );

      return {
        id: 'market_opportunity_001',
        type: 'market_opportunity',
        priority: 'high',
        narrative,
        visualData: {
          chartType: 'line',
          data: [
            { period: '2024', current: 2.1, projected: 2.1 },
            { period: '2025', current: 2.1, projected: 3.2 },
            { period: '2026', current: 2.1, projected: 4.8 },
            { period: '2027', current: 2.1, projected: 6.9 }
          ],
          config: {
            title: 'Market Growth Projection',
            colors: ['#3b82f6', '#10b981']
          }
        },
        interactiveElements: {
          quickActions: [
            { label: 'Market Analysis', action: 'market_analysis', type: 'primary' },
            { label: 'Competitive Positioning', action: 'competitive_analysis', type: 'secondary' }
          ],
          drillDowns: [
            { label: 'Customer Segments', query: 'customer segmentation analysis' },
            { label: 'Growth Opportunities', query: 'sustainable finance market growth' }
          ]
        },
        lastUpdated: new Date(),
        confidence: 0.78
      };

    } catch (error) {
      console.error('Failed to generate market insight:', error);
      return null;
    }
  }

  /**
   * Generate customer insight with narrative
   */
  private async generateCustomerInsight(portfolioData: any): Promise<NarrativeInsightCard | null> {
    try {
      const insightData = {
        type: 'customer_behavior',
        evAvgLoan: 48000,
        segments: {
          earlyAdopters: 18,
          pragmatists: 24,
          traditionalists: 58
        },
        confidence: 0.89
      };

      const narrative = await aiAnalyticsNarrativeBuilder.generateInsightNarrative(
        insightData,
        this.getNarrativeContext(),
        {
          type: 'customer_insights',
          audienceLevel: 'manager',
          tone: this.bankProfile?.preferredTone || 'conversational',
          focusArea: 'growth'
        }
      );

      return {
        id: 'customer_insights_001',
        type: 'customer_insights',
        priority: 'medium',
        narrative,
        visualData: {
          chartType: 'pie',
          data: [
            { category: 'EV Early Adopters', value: 18, avgLoan: 48000 },
            { category: 'Hybrid Pragmatists', value: 24, avgLoan: 35000 },
            { category: 'ICE Traditionalists', value: 58, avgLoan: 28000 }
          ],
          config: {
            title: 'Customer Segmentation',
            colors: ['#10b981', '#3b82f6', '#f59e0b']
          }
        },
        interactiveElements: {
          quickActions: [
            { label: 'Segment Analysis', action: 'segment_analysis', type: 'primary' },
            { label: 'Customer Journey', action: 'customer_journey', type: 'secondary' }
          ],
          drillDowns: [
            { label: 'EV Customer Profile', query: 'electric vehicle customer behavior' },
            { label: 'Conversion Opportunities', query: 'customer conversion potential' }
          ]
        },
        lastUpdated: new Date(),
        confidence: 0.89
      };

    } catch (error) {
      console.error('Failed to generate customer insight:', error);
      return null;
    }
  }

  /**
   * Extract portfolio data for narrative generation
   */
  private async extractPortfolioDataForNarrative(): Promise<any> {
    try {
      // Search for relevant documents in ChromaDB
      const portfolioResults = await chromaDBService.searchDocuments('portfolio overview analytics', {
        collectionName: 'portfolio_documents',
        limit: 5
      });

      const analyticsResults = await chromaDBService.searchDocuments('portfolio analytics metrics', {
        collectionName: 'analytics_documents',
        limit: 5
      });

      return {
        portfolio: portfolioResults,
        analytics: analyticsResults,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Failed to extract portfolio data for narrative:', error);
      return { portfolio: [], analytics: [], timestamp: new Date() };
    }
  }

  /**
   * Get narrative context from bank profile
   */
  private getNarrativeContext(): NarrativeContext {
    if (!this.bankProfile) {
      // Default context for demo purposes
      return {
        portfolioSize: 247,
        bankType: 'community',
        primaryMarket: 'Regional',
        experienceLevel: 'intermediate',
        businessGoals: ['growth', 'compliance', 'sustainability'],
        currentChallenges: ['data quality', 'regulatory compliance', 'market competition']
      };
    }

    return {
      portfolioSize: this.bankProfile.portfolioSize,
      bankType: this.bankProfile.bankType,
      primaryMarket: this.bankProfile.primaryMarket,
      experienceLevel: this.bankProfile.experienceLevel,
      businessGoals: this.bankProfile.businessGoals,
      currentChallenges: this.bankProfile.currentChallenges
    };
  }

  /**
   * Update narrative insights in real-time as data changes
   */
  async refreshNarrativeInsights(): Promise<NarrativeInsightCard[]> {
    console.log('🔄 Refreshing narrative insights...');
    return await this.generateNarrativeInsights();
  }

  /**
   * Get specific insight by ID with updated narrative
   */
  async getInsightById(id: string): Promise<NarrativeInsightCard | null> {
    try {
      const insights = await this.generateNarrativeInsights();
      return insights.find(insight => insight.id === id) || null;
    } catch (error) {
      console.error('Failed to get insight by ID:', error);
      return null;
    }
  }

  /**
   * Generate narrative for custom insight data
   */
  async generateCustomNarrative(
    insightData: any,
    template: NarrativeTemplate
  ): Promise<InsightNarrative> {
    return await aiAnalyticsNarrativeBuilder.generateInsightNarrative(
      insightData,
      this.getNarrativeContext(),
      template
    );
  }
}

export const narrativePipelineIntegration = NarrativePipelineIntegration.getInstance();