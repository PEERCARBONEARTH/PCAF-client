/**
 * Pipeline Integration - Connects all pipeline components for seamless operation
 * Provides a unified interface for the complete data pipeline architecture
 */

import { dataPipelineService } from './data-pipeline-service';
import { pipelineOrchestrator } from './pipeline-orchestrator';
import { climateNarrativeService } from './climate-narrative-service';
import { portfolioService } from './portfolioService';

export interface PipelineIntegrationConfig {
  autoStart: boolean;
  enableRealTimeUpdates: boolean;
  enableScheduledRuns: boolean;
  notificationSettings: {
    onSuccess: boolean;
    onFailure: boolean;
    onDataQualityIssues: boolean;
  };
}

export interface IntegratedInsight {
  id: string;
  type: 'portfolio' | 'loan' | 'sector' | 'risk';
  title: string;
  narrative: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  dataFreshness: Date;
  sources: Array<{
    type: 'portfolio_data' | 'chroma_knowledge' | 'ai_analysis';
    content: string;
    relevance: number;
  }>;
  recommendations: Array<{
    action: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
}

class PipelineIntegration {
  private static instance: PipelineIntegration;
  private config: PipelineIntegrationConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.config = {
      autoStart: true,
      enableRealTimeUpdates: false,
      enableScheduledRuns: true,
      notificationSettings: {
        onSuccess: true,
        onFailure: true,
        onDataQualityIssues: true
      }
    };
  }

  static getInstance(): PipelineIntegration {
    if (!PipelineIntegration.instance) {
      PipelineIntegration.instance = new PipelineIntegration();
    }
    return PipelineIntegration.instance;
  }

  /**
   * Initialize the complete pipeline system
   */
  async initialize(config?: Partial<PipelineIntegrationConfig>): Promise<void> {
    if (this.isInitialized) {
      console.log('Pipeline integration already initialized');
      return;
    }

    console.log('🚀 Initializing Pipeline Integration...');

    // Update configuration
    if (config) {
      this.config = { ...this.config, ...config };
    }

    try {
      // Initialize pipeline orchestrator
      if (this.config.enableScheduledRuns) {
        await pipelineOrchestrator.start();
        console.log('✅ Pipeline orchestrator started');
      }

      // Run initial data pipeline if auto-start is enabled
      if (this.config.autoStart) {
        console.log('🔄 Running initial data pipeline...');
        await this.runInitialPipeline();
        console.log('✅ Initial pipeline completed');
      }

      this.isInitialized = true;
      console.log('🎉 Pipeline Integration initialized successfully');

    } catch (error) {
      console.error('❌ Pipeline Integration initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run the initial data pipeline
   */
  private async runInitialPipeline(): Promise<void> {
    try {
      // Check if we have portfolio data
      const portfolioSummary = await portfolioService.getPortfolioSummary();
      
      if (!portfolioSummary.loans || portfolioSummary.loans.length === 0) {
        console.log('⚠️ No portfolio data found, skipping initial pipeline');
        return;
      }

      // Run full refresh pipeline
      await pipelineOrchestrator.runPipeline({
        fullRefresh: true,
        dataTypes: ['loans', 'portfolio', 'sectors', 'risks'],
        priority: 'normal'
      });

    } catch (error) {
      console.error('Initial pipeline failed:', error);
      // Don't throw - this is not critical for initialization
    }
  }

  /**
   * Generate comprehensive insights using the full pipeline
   */
  async generateComprehensiveInsights(options?: {
    includePortfolioOverview?: boolean;
    includeLoanAnalysis?: boolean;
    includeSectorAnalysis?: boolean;
    includeRiskAssessment?: boolean;
    maxInsights?: number;
  }): Promise<IntegratedInsight[]> {
    const opts = {
      includePortfolioOverview: true,
      includeLoanAnalysis: true,
      includeSectorAnalysis: true,
      includeRiskAssessment: true,
      maxInsights: 10,
      ...options
    };

    const insights: IntegratedInsight[] = [];

    try {
      console.log('🧠 Generating comprehensive insights...');

      // 1. Portfolio Overview Insight
      if (opts.includePortfolioOverview) {
        const portfolioInsight = await this.generatePortfolioInsight();
        if (portfolioInsight) insights.push(portfolioInsight);
      }

      // 2. Data Quality Insight
      const dataQualityInsight = await this.generateDataQualityInsight();
      if (dataQualityInsight) insights.push(dataQualityInsight);

      // 3. Emissions Performance Insight
      const emissionsInsight = await this.generateEmissionsInsight();
      if (emissionsInsight) insights.push(emissionsInsight);

      // 4. Risk Assessment Insights
      if (opts.includeRiskAssessment) {
        const riskInsights = await this.generateRiskInsights();
        insights.push(...riskInsights);
      }

      // 5. Sector Analysis Insights
      if (opts.includeSectorAnalysis) {
        const sectorInsights = await this.generateSectorInsights();
        insights.push(...sectorInsights.slice(0, 2)); // Limit to top 2 sectors
      }

      // Sort by priority and confidence
      insights.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority];
        const bPriority = priorityWeight[b.priority];
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return b.confidence - a.confidence;
      });

      console.log(`✅ Generated ${insights.length} comprehensive insights`);
      return insights.slice(0, opts.maxInsights);

    } catch (error) {
      console.error('Failed to generate comprehensive insights:', error);
      throw error;
    }
  }

  /**
   * Generate portfolio overview insight
   */
  private async generatePortfolioInsight(): Promise<IntegratedInsight | null> {
    try {
      const portfolioData = await portfolioService.getPortfolioSummary();
      const totalEmissions = portfolioData.summary?.total_financed_emissions || 0;
      const totalLoans = portfolioData.summary?.total_loans || 0;

      if (totalLoans === 0) return null;

      const narrative = await climateNarrativeService.generateMetricNarrative(
        'portfolio-overview',
        totalLoans,
        undefined
      );

      return {
        id: 'portfolio_overview',
        type: 'portfolio',
        title: 'Portfolio Performance Overview',
        narrative: narrative.contextualExplanation,
        confidence: narrative.confidence,
        priority: narrative.priority,
        dataFreshness: new Date(),
        sources: [
          {
            type: 'portfolio_data',
            content: `${totalLoans} loans with ${totalEmissions.toFixed(0)} tCO2e total emissions`,
            relevance: 1.0
          },
          ...narrative.sources.map(source => ({
            type: 'chroma_knowledge' as const,
            content: source.answer,
            relevance: source.relevanceScore
          }))
        ],
        recommendations: narrative.actionableInsights.map(insight => ({
          action: insight,
          impact: 'medium' as const,
          effort: 'medium' as const,
          timeline: '1-3 months'
        }))
      };

    } catch (error) {
      console.error('Failed to generate portfolio insight:', error);
      return null;
    }
  }

  /**
   * Generate data quality insight
   */
  private async generateDataQualityInsight(): Promise<IntegratedInsight | null> {
    try {
      const portfolioData = await portfolioService.getPortfolioSummary();
      const avgDataQuality = portfolioData.summary?.average_data_quality_score || 5;

      const narrative = await climateNarrativeService.generateMetricNarrative(
        'data-quality',
        avgDataQuality,
        3.0 // Target PCAF score
      );

      return {
        id: 'data_quality_assessment',
        type: 'portfolio',
        title: 'Data Quality Assessment',
        narrative: narrative.contextualExplanation,
        confidence: narrative.confidence,
        priority: avgDataQuality > 3 ? 'high' : 'medium',
        dataFreshness: new Date(),
        sources: [
          {
            type: 'portfolio_data',
            content: `Average PCAF score: ${avgDataQuality.toFixed(1)}/5`,
            relevance: 1.0
          }
        ],
        recommendations: narrative.actionableInsights.map(insight => ({
          action: insight,
          impact: 'high' as const,
          effort: 'medium' as const,
          timeline: '2-4 weeks'
        }))
      };

    } catch (error) {
      console.error('Failed to generate data quality insight:', error);
      return null;
    }
  }

  /**
   * Generate emissions performance insight
   */
  private async generateEmissionsInsight(): Promise<IntegratedInsight | null> {
    try {
      const portfolioData = await portfolioService.getPortfolioSummary();
      const totalEmissions = portfolioData.summary?.total_financed_emissions || 0;

      const narrative = await climateNarrativeService.generateMetricNarrative(
        'emissions-total',
        totalEmissions,
        undefined
      );

      return {
        id: 'emissions_performance',
        type: 'portfolio',
        title: 'Emissions Performance Analysis',
        narrative: narrative.contextualExplanation,
        confidence: narrative.confidence,
        priority: narrative.priority,
        dataFreshness: new Date(),
        sources: [
          {
            type: 'portfolio_data',
            content: `Total financed emissions: ${totalEmissions.toFixed(0)} tCO2e`,
            relevance: 1.0
          }
        ],
        recommendations: narrative.actionableInsights.map(insight => ({
          action: insight,
          impact: 'high' as const,
          effort: 'medium' as const,
          timeline: '3-6 months'
        }))
      };

    } catch (error) {
      console.error('Failed to generate emissions insight:', error);
      return null;
    }
  }

  /**
   * Generate risk assessment insights
   */
  private async generateRiskInsights(): Promise<IntegratedInsight[]> {
    try {
      const portfolioData = await portfolioService.getPortfolioSummary();
      const avgDataQuality = portfolioData.summary?.average_data_quality_score || 5;

      const narrative = await climateNarrativeService.generateMetricNarrative(
        'risk-level',
        avgDataQuality > 3 ? 'High' : 'Medium',
        'Low'
      );

      return [{
        id: 'risk_assessment',
        type: 'risk',
        title: 'Climate Risk Assessment',
        narrative: narrative.contextualExplanation,
        confidence: narrative.confidence,
        priority: narrative.priority,
        dataFreshness: new Date(),
        sources: [
          {
            type: 'portfolio_data',
            content: `Risk level based on data quality: ${avgDataQuality.toFixed(1)}/5`,
            relevance: 1.0
          }
        ],
        recommendations: narrative.actionableInsights.map(insight => ({
          action: insight,
          impact: 'high' as const,
          effort: 'high' as const,
          timeline: '6-12 months'
        }))
      }];

    } catch (error) {
      console.error('Failed to generate risk insights:', error);
      return [];
    }
  }

  /**
   * Generate sector analysis insights
   */
  private async generateSectorInsights(): Promise<IntegratedInsight[]> {
    try {
      // For now, return a placeholder sector insight
      // In a full implementation, this would analyze each sector
      return [{
        id: 'sector_motor_vehicle',
        type: 'sector',
        title: 'Motor Vehicle Sector Analysis',
        narrative: 'Motor vehicle portfolio shows opportunities for EV transition and data quality improvements.',
        confidence: 0.8,
        priority: 'medium',
        dataFreshness: new Date(),
        sources: [
          {
            type: 'portfolio_data',
            content: 'Motor vehicle sector analysis',
            relevance: 1.0
          }
        ],
        recommendations: [
          {
            action: 'Increase EV financing opportunities',
            impact: 'high',
            effort: 'medium',
            timeline: '6-12 months'
          }
        ]
      }];

    } catch (error) {
      console.error('Failed to generate sector insights:', error);
      return [];
    }
  }

  /**
   * Get pipeline health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    components: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      message: string;
    }>;
    lastUpdate: Date;
  }> {
    const components = [];

    try {
      // Check pipeline orchestrator
      const orchestratorStatus = pipelineOrchestrator.getStatus();
      components.push({
        name: 'Pipeline Orchestrator',
        status: orchestratorStatus.isRunning ? 'healthy' : 'warning',
        message: orchestratorStatus.isRunning ? 'Running' : 'Idle'
      });

      // Check data pipeline service
      const pipelineRunning = dataPipelineService.isRunning();
      components.push({
        name: 'Data Pipeline',
        status: pipelineRunning ? 'healthy' : 'warning',
        message: pipelineRunning ? 'Processing' : 'Ready'
      });

      // Check portfolio service
      try {
        await portfolioService.getPortfolioSummary();
        components.push({
          name: 'Portfolio Service',
          status: 'healthy',
          message: 'Connected'
        });
      } catch (error) {
        components.push({
          name: 'Portfolio Service',
          status: 'critical',
          message: 'Connection failed'
        });
      }

      // Determine overall status
      const criticalCount = components.filter(c => c.status === 'critical').length;
      const warningCount = components.filter(c => c.status === 'warning').length;

      let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (criticalCount > 0) overallStatus = 'critical';
      else if (warningCount > 0) overallStatus = 'warning';

      return {
        status: overallStatus,
        components,
        lastUpdate: new Date()
      };

    } catch (error) {
      return {
        status: 'critical',
        components: [{
          name: 'System Check',
          status: 'critical',
          message: 'Health check failed'
        }],
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Shutdown the pipeline system
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Pipeline Integration...');

    try {
      await pipelineOrchestrator.stop();
      this.isInitialized = false;
      console.log('✅ Pipeline Integration shutdown complete');
    } catch (error) {
      console.error('❌ Pipeline Integration shutdown failed:', error);
      throw error;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PipelineIntegrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PipelineIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Check if system is initialized
   */
  isSystemInitialized(): boolean {
    return this.isInitialized;
  }
}

export const pipelineIntegration = PipelineIntegration.getInstance();