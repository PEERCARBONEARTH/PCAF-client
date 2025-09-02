/**
 * Pipeline Integration Service - Unified interface for all pipeline operations
 * Coordinates between enhanced pipeline, ChromaDB, and client documents
 */

import { enhancedDataPipelineService } from './enhanced-data-pipeline-service';
import { chromaDBService } from './chroma-db-service';
import { portfolioService } from './portfolioService';
import { loadAllSampleData, clearAllSampleData, SampleDataConfig } from './sample-data-loader';

export interface PipelineIntegrationStatus {
  isInitialized: boolean;
  lastPipelineRun?: Date;
  chromaDBHealth: 'healthy' | 'degraded' | 'unhealthy';
  totalDocuments: number;
  collections: string[];
  dataFreshness: number; // hours since last update
}

export interface QuickStartResult {
  success: boolean;
  documentsCreated: number;
  collectionsPopulated: string[];
  processingTimeMs: number;
  errors: string[];
}

class PipelineIntegrationService {
  private static instance: PipelineIntegrationService;
  private isInitialized: boolean = false;

  static getInstance(): PipelineIntegrationService {
    if (!PipelineIntegrationService.instance) {
      PipelineIntegrationService.instance = new PipelineIntegrationService();
    }
    return PipelineIntegrationService.instance;
  }

  /**
   * Initialize the complete pipeline system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Pipeline integration already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Pipeline Integration System...');

      // Check ChromaDB health
      const chromaHealth = await chromaDBService.healthCheck();
      console.log(`📊 ChromaDB Status: ${chromaHealth.status}`);

      // Check if we have portfolio data
      try {
        const portfolioSummary = await portfolioService.getPortfolioSummary();
        console.log(`💼 Portfolio: ${portfolioSummary.loans.length} loans available`);
      } catch (error) {
        console.warn('⚠️ Portfolio data not available:', error.message);
      }

      this.isInitialized = true;
      console.log('✅ Pipeline Integration System initialized');

    } catch (error) {
      console.error('❌ Pipeline Integration initialization failed:', error);
      throw error;
    }
  }

  /**
   * Quick start - Run a complete pipeline with sample data
   */
  async quickStart(): Promise<QuickStartResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      console.log('🚀 Starting Quick Pipeline Setup...');

      // Ensure system is initialized
      await this.initialize();

      // Load sample data directly into ChromaDB
      console.log('📊 Loading comprehensive sample data...');
      const sampleResult = await loadAllSampleData({
        numLoans: 25,
        includeHistoricalData: true,
        dataQualityVariation: true
      });

      console.log('✅ Quick start completed successfully');

      return {
        success: true,
        documentsCreated: sampleResult.totalDocuments,
        collectionsPopulated: sampleResult.collectionsPopulated,
        processingTimeMs: Date.now() - startTime,
        errors
      };

    } catch (error) {
      console.error('❌ Quick start failed:', error);
      errors.push(error.message);

      // Fallback: try to run enhanced pipeline
      try {
        console.log('🔄 Attempting fallback pipeline...');
        const pipelineResult = await enhancedDataPipelineService.runCompletePipeline({
          forceFullRefresh: true,
          includeClientDocuments: true,
          maxLoans: 25
        });

        return {
          success: true,
          documentsCreated: pipelineResult.totalRecordsProcessed,
          collectionsPopulated: pipelineResult.collectionsUpdated,
          processingTimeMs: Date.now() - startTime,
          errors: [...errors, ...pipelineResult.errors]
        };
      } catch (fallbackError) {
        errors.push(fallbackError.message);
      }

      return {
        success: false,
        documentsCreated: 0,
        collectionsPopulated: [],
        processingTimeMs: Date.now() - startTime,
        errors
      };
    }
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<PipelineIntegrationStatus> {
    try {
      // Get ChromaDB health and stats
      const chromaHealth = await chromaDBService.healthCheck();
      const collections = await chromaDBService.getCollections();

      // Calculate data freshness
      let dataFreshness = 24; // Default to 24 hours if no data
      if (chromaHealth.lastActivity) {
        dataFreshness = (Date.now() - chromaHealth.lastActivity.getTime()) / (1000 * 60 * 60);
      }

      return {
        isInitialized: this.isInitialized,
        chromaDBHealth: chromaHealth.status,
        totalDocuments: chromaHealth.totalDocuments,
        collections: collections.map(c => c.name),
        dataFreshness
      };

    } catch (error) {
      console.error('Failed to get system status:', error);
      return {
        isInitialized: false,
        chromaDBHealth: 'unhealthy',
        totalDocuments: 0,
        collections: [],
        dataFreshness: 24
      };
    }
  }

  /**
   * Search across all ChromaDB collections
   */
  async searchDocuments(
    query: string,
    options?: {
      limit?: number;
      collections?: string[];
      filters?: Record<string, any>;
    }
  ): Promise<Array<{
    id: string;
    content: string;
    type: string;
    similarity: number;
    collection: string;
  }>> {
    try {
      const results = [];
      const collections = options?.collections || [
        'portfolio_documents',
        'loan_documents',
        'analytics_documents',
        'client_insights',
        'bank_targets',
        'historical_reports'
      ];

      for (const collectionName of collections) {
        try {
          const searchResults = await chromaDBService.searchDocuments(query, {
            collectionName,
            limit: options?.limit || 5,
            filters: options?.filters
          });

          for (const result of searchResults) {
            results.push({
              id: result.document.id,
              content: result.document.content.substring(0, 500) + '...',
              type: result.document.metadata.type,
              similarity: result.similarity,
              collection: collectionName
            });
          }
        } catch (error) {
          console.warn(`Search failed for collection ${collectionName}:`, error.message);
        }
      }

      // Sort by similarity and limit results
      results.sort((a, b) => b.similarity - a.similarity);
      return results.slice(0, options?.limit || 10);

    } catch (error) {
      console.error('Document search failed:', error);
      return [];
    }
  }

  /**
   * Get portfolio insights using AI-powered search
   */
  async getPortfolioInsights(query?: string): Promise<Array<{
    title: string;
    content: string;
    type: 'overview' | 'risk' | 'opportunity' | 'compliance';
    confidence: number;
    sources: string[];
  }>> {
    try {
      const insights = [];

      // Default queries if none provided
      const queries = query ? [query] : [
        'portfolio performance and emissions',
        'PCAF compliance and data quality issues',
        'high risk loans and recommendations',
        'EV financing opportunities'
      ];

      for (const searchQuery of queries) {
        const results = await this.searchDocuments(searchQuery, {
          limit: 3,
          collections: ['portfolio_documents', 'analytics_documents', 'loan_documents']
        });

        if (results.length > 0) {
          const topResult = results[0];

          insights.push({
            title: this.generateInsightTitle(searchQuery, topResult.type),
            content: topResult.content,
            type: this.categorizeInsight(topResult.type),
            confidence: topResult.similarity,
            sources: results.map(r => r.id)
          });
        }
      }

      return insights;

    } catch (error) {
      console.error('Failed to get portfolio insights:', error);
      return [];
    }
  }

  /**
   * Refresh specific data types
   */
  async refreshData(dataTypes: ('portfolio' | 'loans' | 'analytics' | 'documents')[]): Promise<{
    success: boolean;
    updatedCollections: string[];
    errors: string[];
  }> {
    try {
      console.log(`🔄 Refreshing data types: ${dataTypes.join(', ')}`);

      const result = await enhancedDataPipelineService.runCompletePipeline({
        forceFullRefresh: false,
        includeClientDocuments: dataTypes.includes('documents'),
        maxLoans: dataTypes.includes('loans') ? 50 : 0
      });

      return {
        success: true,
        updatedCollections: result.collectionsUpdated,
        errors: result.errors
      };

    } catch (error) {
      console.error('Data refresh failed:', error);
      return {
        success: false,
        updatedCollections: [],
        errors: [error.message]
      };
    }
  }

  /**
   * Helper methods
   */
  private generateInsightTitle(query: string, type: string): string {
    const titles = {
      'portfolio performance and emissions': 'Portfolio Performance Overview',
      'PCAF compliance and data quality issues': 'PCAF Compliance Assessment',
      'high risk loans and recommendations': 'Risk Analysis & Recommendations',
      'EV financing opportunities': 'EV Financing Opportunities'
    };
    return titles[query] || `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Analysis`;
  }

  private categorizeInsight(type: string): 'overview' | 'risk' | 'opportunity' | 'compliance' {
    if (type.includes('risk') || type.includes('alert')) return 'risk';
    if (type.includes('compliance') || type.includes('pcaf')) return 'compliance';
    if (type.includes('opportunity') || type.includes('ev')) return 'opportunity';
    return 'overview';
  }

  /**
   * Load sample data into all collections
   */
  async loadSampleData(config?: {
    numLoans?: number;
    includeHistoricalData?: boolean;
    clearExisting?: boolean;
  }): Promise<{
    success: boolean;
    totalDocuments: number;
    collectionsPopulated: string[];
    processingTime: number;
  }> {
    try {
      const options = {
        numLoans: 25,
        includeHistoricalData: true,
        dataQualityVariation: true,
        ...config
      };

      // Clear existing data if requested
      if (config?.clearExisting) {
        await clearAllSampleData();
      }

      // Load sample data
      const result = await loadAllSampleData(options);

      return {
        success: true,
        totalDocuments: result.totalDocuments,
        collectionsPopulated: result.collectionsPopulated,
        processingTime: result.processingTime
      };

    } catch (error) {
      console.error('Failed to load sample data:', error);
      return {
        success: false,
        totalDocuments: 0,
        collectionsPopulated: [],
        processingTime: 0
      };
    }
  }

  /**
   * Get sample data statistics
   */
  async getSampleDataStats(): Promise<{
    collections: Array<{
      name: string;
      documentCount: number;
      avgDataQuality: number;
    }>;
    totalDocuments: number;
  }> {
    const collections = [
      'portfolio_documents',
      'loan_documents',
      'analytics_documents',
      'bank_targets',
      'historical_reports',
      'client_insights'
    ];

    const stats = [];
    let totalDocuments = 0;

    for (const collection of collections) {
      try {
        const collectionStats = await chromaDBService.getCollectionStats(collection);
        stats.push({
          name: collection,
          documentCount: collectionStats.documentCount,
          avgDataQuality: collectionStats.avgDataQuality
        });
        totalDocuments += collectionStats.documentCount;
      } catch (error) {
        stats.push({
          name: collection,
          documentCount: 0,
          avgDataQuality: 0
        });
      }
    }

    return {
      collections: stats,
      totalDocuments
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Pipeline Integration System...');
    this.isInitialized = false;
    console.log('✅ Pipeline Integration System shutdown complete');
  }
}

export const pipelineIntegrationService = PipelineIntegrationService.getInstance();