/**
 * Hybrid RAG Service - ChromaDB + JSON Dataset
 * Provides high-performance semantic search with fallback to JSON dataset
 */

import { chromaRAGService, ChromaRAGResponse } from './chromaRAGService';
import { enhancedDatasetRAGService } from './enhancedDatasetRAGService';
import { EnhancedRAGRequest, EnhancedRAGResponse } from './enhancedDatasetRAGService';

export interface HybridRAGConfig {
  preferChromaDB: boolean;
  chromaMinConfidence: number;
  fallbackToJSON: boolean;
  combineResults: boolean;
  maxResponseTime: number; // milliseconds
}

export class HybridRAGService {
  private config: HybridRAGConfig;
  private chromaAvailable: boolean = false;

  constructor(config: Partial<HybridRAGConfig> = {}) {
    this.config = {
      preferChromaDB: true,
      chromaMinConfidence: 0.6,
      fallbackToJSON: true,
      combineResults: false,
      maxResponseTime: 5000,
      ...config
    };

    this.initializeChromaDB();
  }

  /**
   * Initialize ChromaDB and check availability
   */
  private async initializeChromaDB(): Promise<void> {
    try {
      this.chromaAvailable = await chromaRAGService.isAvailable();
      if (this.chromaAvailable) {
        console.log('✅ ChromaDB available - using high-performance semantic search');
      } else {
        console.log('⚠️ ChromaDB not available - using JSON dataset fallback');
      }
    } catch (error) {
      console.warn('ChromaDB initialization failed:', error);
      this.chromaAvailable = false;
    }
  }

  /**
   * Main query method with intelligent routing
   */
  async query(request: EnhancedRAGRequest): Promise<EnhancedRAGResponse> {
    const startTime = Date.now();

    try {
      // Try ChromaDB first if available and preferred
      if (this.chromaAvailable && this.config.preferChromaDB) {
        try {
          const chromaResponse = await this.queryChromaDB(request);
          
          // Check if ChromaDB response meets confidence threshold
          if (chromaResponse.confidence >= this.config.chromaMinConfidence) {
            return this.convertChromaToEnhancedResponse(chromaResponse, request);
          }
          
          console.log(`ChromaDB confidence ${chromaResponse.confidence} below threshold ${this.config.chromaMinConfidence}`);
        } catch (error) {
          console.warn('ChromaDB query failed, falling back to JSON:', error);
        }
      }

      // Fallback to JSON dataset or if ChromaDB not available
      if (this.config.fallbackToJSON) {
        console.log('Using JSON dataset RAG service');
        return await enhancedDatasetRAGService.query(request);
      }

      // No fallback available
      throw new Error('No RAG service available');

    } catch (error) {
      console.error('Hybrid RAG query failed:', error);
      
      // Return error response
      return {
        response: "I apologize, but I'm experiencing technical difficulties accessing my knowledge base. Please try again in a moment or contact support if the issue persists.",
        confidence: 'low',
        sources: [],
        followUpQuestions: [],
        bankingContext: {}
      };
    }
  }

  /**
   * Query ChromaDB with enhanced parameters
   */
  private async queryChromaDB(request: EnhancedRAGRequest): Promise<ChromaRAGResponse> {
    const searchOptions = {
      maxSources: 3,
      includeFollowUp: true,
      contextualizeForBanking: true
    };

    // Add category filtering based on user role
    if (request.userRole) {
      searchOptions['categoryFilter'] = this.mapRoleToCategory(request.userRole);
    }

    // Add insight type filtering
    if (request.insightType) {
      searchOptions['bankingContextFilter'] = this.mapInsightTypeToBankingContext(request.insightType);
    }

    return await chromaRAGService.generateResponse(request.query, searchOptions);
  }

  /**
   * Convert ChromaDB response to Enhanced RAG response format
   */
  private convertChromaToEnhancedResponse(
    chromaResponse: ChromaRAGResponse,
    request: EnhancedRAGRequest
  ): EnhancedRAGResponse {
    // Extract follow-up questions from sources
    const followUpQuestions = chromaResponse.sources
      .flatMap(source => source.followUp)
      .slice(0, 3);

    // Combine banking context from all sources
    const bankingContext = chromaResponse.sources.reduce((combined, source) => {
      return { ...combined, ...source.bankingContext };
    }, {});

    // Generate executive summary for executive users
    const executiveSummary = request.userRole === 'executive' 
      ? this.generateExecutiveSummary(chromaResponse)
      : undefined;

    // Extract action items from response
    const actionItems = this.extractActionItems(chromaResponse.answer);

    return {
      response: chromaResponse.answer,
      confidence: this.mapConfidenceLevel(chromaResponse.confidence),
      sources: chromaResponse.sources.map(s => s.category),
      followUpQuestions,
      executiveSummary,
      actionItems,
      bankingContext
    };
  }

  /**
   * Map user role to search category
   */
  private mapRoleToCategory(role: string): string {
    const roleMapping = {
      'executive': 'strategic_advisory',
      'risk_manager': 'portfolio_analysis',
      'compliance_officer': 'compliance_regulatory',
      'loan_officer': 'operational_excellence',
      'data_analyst': 'methodology_deep'
    };
    return roleMapping[role] || '';
  }

  /**
   * Map insight type to banking context filters
   */
  private mapInsightTypeToBankingContext(insightType: string): string[] {
    const contextMapping = {
      'portfolio_overview': ['riskManagement', 'capitalAllocation'],
      'risk_assessment': ['creditRisk', 'riskManagement'],
      'compliance_analysis': ['regulatoryCompliance', 'supervisoryExamination'],
      'strategic_advisory': ['strategicPlanning', 'competitiveStrategy']
    };
    return contextMapping[insightType] || [];
  }

  /**
   * Map numeric confidence to categorical confidence
   */
  private mapConfidenceLevel(confidence: number): 'surgical' | 'high' | 'medium' | 'low' {
    if (confidence >= 0.9) return 'surgical';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Generate executive summary from ChromaDB response
   */
  private generateExecutiveSummary(chromaResponse: ChromaRAGResponse): string {
    const keyPoints = chromaResponse.answer
      .split('\n')
      .filter(line => line.includes('•') || line.includes('**'))
      .slice(0, 3)
      .map(point => point.replace(/[•*]/g, '').trim())
      .join('. ');

    return `Executive Summary: ${keyPoints}`;
  }

  /**
   * Extract action items from response text
   */
  private extractActionItems(response: string): string[] {
    const actionPatterns = [
      /(?:Action|Recommendation|Next step|Should|Must|Need to):\s*([^.\n]+)/gi,
      /(?:•\s*)([^.\n]*(?:implement|develop|establish|create|review)[^.\n]*)/gi
    ];

    const actionItems: string[] = [];
    
    actionPatterns.forEach(pattern => {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          actionItems.push(match[1].trim());
        }
      }
    });

    return actionItems.slice(0, 5); // Limit to 5 action items
  }

  /**
   * Get service statistics and health
   */
  async getServiceHealth(): Promise<{
    chromaAvailable: boolean;
    jsonFallbackAvailable: boolean;
    totalDocuments?: number;
    categories?: string[];
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    let chromaStats = null;
    if (this.chromaAvailable) {
      try {
        chromaStats = await chromaRAGService.getStats();
      } catch (error) {
        console.warn('Failed to get ChromaDB stats:', error);
      }
    }

    return {
      chromaAvailable: this.chromaAvailable,
      jsonFallbackAvailable: true, // JSON dataset is always available
      totalDocuments: chromaStats?.totalDocuments,
      categories: chromaStats?.categories,
      responseTime: Date.now() - startTime
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HybridRAGConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Force refresh ChromaDB availability
   */
  async refreshChromaAvailability(): Promise<boolean> {
    await this.initializeChromaDB();
    return this.chromaAvailable;
  }
}

// Export singleton instance
export const hybridRAGService = new HybridRAGService();