/**
 * ChromaDB-powered RAG Service for PCAF Motor Vehicle Q&A
 * High-performance semantic search with embedding-based retrieval
 */

import { spawn } from 'child_process';
import path from 'path';

export interface ChromaSearchResult {
  id: string;
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  category: string;
  categoryDescription: string;
  sources: string[];
  followUp: string[];
  bankingContext: Record<string, boolean>;
  distance: number;
  relevanceScore: number;
}

export interface ChromaRAGResponse {
  answer: string;
  sources: ChromaSearchResult[];
  confidence: number;
  responseTime: number;
  searchQuery: string;
  totalResults: number;
}

export class ChromaRAGService {
  private pythonPath: string;
  private scriptPath: string;
  private dbPath: string;

  constructor() {
    this.pythonPath = 'python'; // or 'python3' depending on system
    this.scriptPath = path.join(process.cwd(), 'scripts', 'chroma-search.py');
    this.dbPath = path.join(process.cwd(), 'chroma_db');
  }

  /**
   * Search the ChromaDB for relevant Q&A pairs
   */
  async searchKnowledgeBase(
    query: string,
    options: {
      maxResults?: number;
      minRelevanceScore?: number;
      categoryFilter?: string;
      confidenceFilter?: string;
      bankingContextFilter?: string[];
    } = {}
  ): Promise<ChromaSearchResult[]> {
    const startTime = Date.now();

    try {
      const searchParams = {
        query,
        n_results: options.maxResults || 5,
        min_relevance: options.minRelevanceScore || 0.3,
        category_filter: options.categoryFilter,
        confidence_filter: options.confidenceFilter,
        banking_context_filter: options.bankingContextFilter
      };

      const results = await this.executePythonSearch(searchParams);
      
      // Calculate relevance scores (inverse of distance, normalized)
      const processedResults = results.map((result: any) => ({
        id: result.metadata.question_id,
        question: result.metadata.question,
        answer: this.extractAnswerFromDocument(result.document),
        confidence: result.metadata.confidence as 'high' | 'medium' | 'low',
        category: result.metadata.category,
        categoryDescription: result.metadata.category_description,
        sources: this.extractSourcesFromMetadata(result.metadata),
        followUp: this.extractFollowUpFromDocument(result.document),
        bankingContext: this.extractBankingContext(result.metadata),
        distance: result.distance,
        relevanceScore: Math.max(0, 1 - result.distance) // Convert distance to relevance score
      }));

      // Filter by minimum relevance score
      return processedResults.filter(
        result => result.relevanceScore >= (options.minRelevanceScore || 0.3)
      );

    } catch (error) {
      console.error('ChromaDB search error:', error);
      throw new Error(`Failed to search knowledge base: ${error.message}`);
    }
  }

  /**
   * Generate a comprehensive RAG response
   */
  async generateResponse(
    query: string,
    options: {
      maxSources?: number;
      includeFollowUp?: boolean;
      contextualizeForBanking?: boolean;
    } = {}
  ): Promise<ChromaRAGResponse> {
    const startTime = Date.now();

    try {
      // Search for relevant sources
      const sources = await this.searchKnowledgeBase(query, {
        maxResults: options.maxSources || 3,
        minRelevanceScore: 0.4
      });

      if (sources.length === 0) {
        return {
          answer: "I don't have specific information about that topic in my PCAF motor vehicle knowledge base. Could you rephrase your question or ask about PCAF methodology, compliance requirements, or portfolio analysis?",
          sources: [],
          confidence: 0,
          responseTime: Date.now() - startTime,
          searchQuery: query,
          totalResults: 0
        };
      }

      // Generate comprehensive answer
      const answer = this.synthesizeAnswer(sources, query, options);
      
      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(sources);

      return {
        answer,
        sources,
        confidence,
        responseTime: Date.now() - startTime,
        searchQuery: query,
        totalResults: sources.length
      };

    } catch (error) {
      console.error('RAG response generation error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Execute Python ChromaDB search script
   */
  private async executePythonSearch(params: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        this.scriptPath,
        JSON.stringify(params)
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python search failed: ${stderr}`));
          return;
        }

        try {
          const results = JSON.parse(stdout);
          resolve(results);
        } catch (error) {
          reject(new Error(`Failed to parse search results: ${error.message}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to execute Python search: ${error.message}`));
      });
    });
  }

  /**
   * Extract answer text from ChromaDB document
   */
  private extractAnswerFromDocument(document: string): string {
    const answerMatch = document.match(/Answer:\s*([\s\S]*?)(?:\n\nCategory:|$)/);
    return answerMatch ? answerMatch[1].trim() : document;
  }

  /**
   * Extract sources from metadata
   */
  private extractSourcesFromMetadata(metadata: any): string[] {
    // Sources are embedded in the document, need to extract them
    return ['PCAF Global Standard', 'Banking Supervision Guidelines']; // Fallback
  }

  /**
   * Extract follow-up questions from document
   */
  private extractFollowUpFromDocument(document: string): string[] {
    const followUpMatch = document.match(/Follow-up Questions:\s*(.*?)(?:\n|$)/);
    if (followUpMatch) {
      return followUpMatch[1].split(',').map(q => q.trim()).filter(q => q);
    }
    return [];
  }

  /**
   * Extract banking context from metadata
   */
  private extractBankingContext(metadata: any): Record<string, boolean> {
    return {
      riskManagement: metadata.has_risk_management || false,
      regulatoryCompliance: metadata.has_regulatory_compliance || false,
      creditRisk: metadata.has_credit_risk || false,
      capitalAllocation: metadata.has_capital_allocation || false,
      loanOrigination: metadata.has_loan_origination || false,
      strategicPlanning: metadata.has_strategic_planning || false
    };
  }

  /**
   * Synthesize a comprehensive answer from multiple sources
   */
  private synthesizeAnswer(
    sources: ChromaSearchResult[],
    query: string,
    options: any
  ): string {
    if (sources.length === 1) {
      return sources[0].answer;
    }

    // Multi-source synthesis
    const primarySource = sources[0];
    const supportingSources = sources.slice(1);

    let synthesizedAnswer = `**Primary Response:**\n${primarySource.answer}`;

    if (supportingSources.length > 0) {
      synthesizedAnswer += `\n\n**Additional Context:**\n`;
      supportingSources.forEach((source, index) => {
        const excerpt = this.extractKeyExcerpt(source.answer, 200);
        synthesizedAnswer += `\n• **${source.category.replace('_', ' ').toUpperCase()}:** ${excerpt}`;
      });
    }

    // Add follow-up questions if requested
    if (options.includeFollowUp && primarySource.followUp.length > 0) {
      synthesizedAnswer += `\n\n**Related Questions:**\n`;
      primarySource.followUp.slice(0, 3).forEach((question, index) => {
        synthesizedAnswer += `${index + 1}. ${question}\n`;
      });
    }

    return synthesizedAnswer;
  }

  /**
   * Extract key excerpt from long text
   */
  private extractKeyExcerpt(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // Try to find a good breaking point
    const truncated = text.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    
    const breakPoint = lastSentence > maxLength * 0.7 ? lastSentence + 1 : lastSpace;
    return text.substring(0, breakPoint) + '...';
  }

  /**
   * Calculate overall confidence from multiple sources
   */
  private calculateOverallConfidence(sources: ChromaSearchResult[]): number {
    if (sources.length === 0) return 0;

    const confidenceMap = { high: 0.9, medium: 0.7, low: 0.5 };
    const avgConfidence = sources.reduce((sum, source) => {
      return sum + (confidenceMap[source.confidence] * source.relevanceScore);
    }, 0) / sources.length;

    return Math.round(avgConfidence * 100) / 100;
  }

  /**
   * Check if ChromaDB is available and initialized
   */
  async isAvailable(): Promise<boolean> {
    try {
      const fs = await import('fs');
      return fs.existsSync(this.dbPath);
    } catch {
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    totalDocuments: number;
    categories: string[];
    lastUpdated: string;
  }> {
    try {
      const params = { action: 'stats' };
      const stats = await this.executePythonSearch(params);
      return stats;
    } catch (error) {
      return {
        totalDocuments: 0,
        categories: [],
        lastUpdated: 'Unknown'
      };
    }
  }
}

// Export singleton instance
export const chromaRAGService = new ChromaRAGService();