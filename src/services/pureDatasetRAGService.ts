/**
 * Pure Dataset RAG Service - HALLUCINATION-FREE
 * 
 * This service uses ONLY the curated Q&A dataset to prevent hallucinations.
 * No external AI calls, no generative responses - only validated, pre-authored answers.
 */

import enhancedDataset from '@/data/enhancedMotorVehicleQADataset.json';
import baseDataset from '@/data/motorVehicleQADataset.json';
import { RAG_CONFIG, validateRAGResponse, BLOCKED_OPERATION_MESSAGES } from '@/config/ragConfig';

export interface PureRAGRequest {
  query: string;
  sessionId: string;
  portfolioContext?: any;
  userRole?: 'executive' | 'risk_manager' | 'compliance_officer' | 'loan_officer';
}

export interface PureRAGResponse {
  response: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
  followUpQuestions: string[];
  matchedQuestionId?: string;
  isExactMatch: boolean;
  datasetSource: 'enhanced' | 'base' | 'none';
}

class PureDatasetRAGService {
  private static instance: PureDatasetRAGService;
  private enhancedQuestions: any[] = [];
  private baseQuestions: any[] = [];

  constructor() {
    this.loadDatasets();
  }

  static getInstance(): PureDatasetRAGService {
    if (!PureDatasetRAGService.instance) {
      PureDatasetRAGService.instance = new PureDatasetRAGService();
    }
    return PureDatasetRAGService.instance;
  }

  private loadDatasets(): void {
    // Load enhanced dataset
    if (enhancedDataset.comprehensiveQADatabase) {
      for (const category of Object.values(enhancedDataset.comprehensiveQADatabase)) {
        if ((category as any).questions && Array.isArray((category as any).questions)) {
          this.enhancedQuestions.push(...(category as any).questions);
        }
      }
    }

    // Load base dataset as fallback
    if (baseDataset.motorVehicleQA && Array.isArray(baseDataset.motorVehicleQA)) {
      this.baseQuestions = baseDataset.motorVehicleQA;
    }

    console.log(`Loaded ${this.enhancedQuestions.length} enhanced Q&A pairs`);
    console.log(`Loaded ${this.baseQuestions.length} base Q&A pairs`);
  }

  async processQuery(request: PureRAGRequest): Promise<PureRAGResponse> {
    const { query, portfolioContext, userRole = RAG_CONFIG.DEFAULT_USER_ROLE } = request;
    
    // Log query for monitoring (if enabled)
    if (RAG_CONFIG.LOG_QUERY_MATCHES) {
      console.log(`[PURE RAG] Processing query: "${query}" for role: ${userRole}`);
    }
    
    // 1. Search enhanced dataset first (highest quality)
    const enhancedMatch = this.findBestMatch(query, this.enhancedQuestions);
    if (enhancedMatch.score > RAG_CONFIG.MIN_CONFIDENCE_THRESHOLD) {
      const response = this.formatEnhancedResponse(enhancedMatch, userRole, portfolioContext);
      
      // Validate response before returning
      if (validateRAGResponse(response)) {
        if (RAG_CONFIG.LOG_CONFIDENCE_SCORES) {
          console.log(`[PURE RAG] Enhanced match - Score: ${enhancedMatch.score}, Confidence: ${response.confidence}`);
        }
        return response;
      }
    }

    // 2. Search base dataset as fallback
    const baseMatch = this.findBestMatch(query, this.baseQuestions);
    if (baseMatch.score > RAG_CONFIG.MIN_CONFIDENCE_THRESHOLD) {
      const response = this.formatBaseResponse(baseMatch, userRole);
      
      // Validate response before returning
      if (validateRAGResponse(response)) {
        if (RAG_CONFIG.LOG_CONFIDENCE_SCORES) {
          console.log(`[PURE RAG] Base match - Score: ${baseMatch.score}, Confidence: ${response.confidence}`);
        }
        return response;
      }
    }

    // 3. No good match found - return safe fallback
    if (RAG_CONFIG.LOG_QUERY_MATCHES) {
      console.log(`[PURE RAG] No suitable match found for: "${query}"`);
    }
    return this.createSafeFallbackResponse(query);
  }

  private findBestMatch(query: string, questions: any[]): { question: any; score: number } {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\\s+/).filter(word => word.length > 2);
    
    let bestMatch = { question: null, score: 0 };

    for (const question of questions) {
      const questionText = question.question?.toLowerCase() || '';
      const answerText = question.answer?.toLowerCase() || '';
      const category = question.category?.toLowerCase() || '';
      
      let score = 0;
      
      // Exact phrase matching (highest weight)
      if (questionText.includes(queryLower)) {
        score += 1.0;
      }
      
      // Keyword matching
      for (const word of queryWords) {
        if (questionText.includes(word)) score += 0.3;
        if (answerText.includes(word)) score += 0.1;
        if (category.includes(word)) score += 0.2;
      }
      
      // Category-specific boosting
      if (queryWords.some(word => ['data', 'quality', 'wdqs'].includes(word)) && 
          category.includes('data_quality')) {
        score += 0.2;
      }
      
      if (queryWords.some(word => ['option', 'pcaf', 'methodology'].includes(word)) && 
          category.includes('methodology')) {
        score += 0.2;
      }
      
      if (queryWords.some(word => ['portfolio', 'improve', 'compliance'].includes(word)) && 
          category.includes('portfolio')) {
        score += 0.2;
      }

      if (score > bestMatch.score) {
        bestMatch = { question, score };
      }
    }

    return bestMatch;
  }

  private formatEnhancedResponse(
    match: { question: any; score: number }, 
    userRole: string, 
    portfolioContext?: any
  ): PureRAGResponse {
    const question = match.question;
    
    // Use role-specific response if available
    let response = question.answer;
    if (question.roleSpecificResponses && question.roleSpecificResponses[userRole]) {
      response = question.roleSpecificResponses[userRole];
    }

    // Inject portfolio context if available and response supports it
    if (portfolioContext && response.includes('{')) {
      response = this.injectPortfolioContext(response, portfolioContext);
    }

    return {
      response,
      confidence: this.calculateConfidence(match.score, 'enhanced'),
      sources: question.sources || ['Enhanced PCAF Motor Vehicle Dataset'],
      followUpQuestions: question.followUp || [],
      matchedQuestionId: question.id,
      isExactMatch: match.score > 0.9,
      datasetSource: 'enhanced'
    };
  }

  private formatBaseResponse(
    match: { question: any; score: number }, 
    userRole: string
  ): PureRAGResponse {
    const question = match.question;
    
    return {
      response: question.answer,
      confidence: this.calculateConfidence(match.score, 'base'),
      sources: question.sources || ['PCAF Motor Vehicle Dataset'],
      followUpQuestions: question.followUp || [],
      matchedQuestionId: question.id,
      isExactMatch: match.score > 0.9,
      datasetSource: 'base'
    };
  }

  private createSafeFallbackResponse(query: string): PureRAGResponse {
    return {
      response: `**No Exact Match Found**

I couldn't find a specific answer to "${query}" in my validated PCAF motor vehicle knowledge base.

**To get accurate information, please try:**

• **Be more specific**: Ask about specific PCAF topics like "data quality options" or "attribution factors"
• **Use PCAF terminology**: Include terms like "WDQS", "Option 1-5", or "motor vehicle emissions"
• **Focus on motor vehicles**: This system specializes in motor vehicle PCAF methodology only

**Common topics I can help with:**
• PCAF data quality options (1-5)
• Weighted Data Quality Score (WDQS) calculations
• Attribution factors and emission calculations
• Portfolio data quality improvement strategies
• Compliance requirements and thresholds

**Example questions:**
• "What are the PCAF data quality options?"
• "How do I calculate WDQS?"
• "How can I improve from Option 4 to Option 3?"`,
      confidence: 'low',
      sources: ['System Guidance'],
      followUpQuestions: [
        'What are the PCAF data quality options for motor vehicles?',
        'How do I calculate weighted data quality score?',
        'How can I improve my portfolio data quality?'
      ],
      isExactMatch: false,
      datasetSource: 'none'
    };
  }

  private calculateConfidence(matchScore: number, source: 'enhanced' | 'base'): 'high' | 'medium' | 'low' {
    // Enhanced dataset gets confidence boost
    const boost = source === 'enhanced' ? 0.1 : 0;
    const adjustedScore = matchScore + boost;
    
    if (adjustedScore >= 0.8) return 'high';
    if (adjustedScore >= 0.6) return 'medium';
    return 'low';
  }

  private injectPortfolioContext(response: string, portfolioContext: any): string {
    // Simple template replacement for portfolio data
    const replacements: { [key: string]: string } = {
      '{totalLoans}': portfolioContext.totalLoans?.toLocaleString() || 'N/A',
      '{wdqs}': portfolioContext.wdqs?.toFixed(1) || 'N/A',
      '{emissionIntensity}': portfolioContext.emissionIntensity?.toFixed(1) || 'N/A',
      '{totalEmissions}': portfolioContext.totalEmissions?.toLocaleString() || 'N/A',
      '{complianceStatus}': portfolioContext.complianceStatus || 'Unknown'
    };

    let contextualResponse = response;
    for (const [placeholder, value] of Object.entries(replacements)) {
      contextualResponse = contextualResponse.replace(new RegExp(placeholder, 'g'), value);
    }

    return contextualResponse;
  }

  // Method to get dataset statistics
  getDatasetStats(): { enhanced: number; base: number; total: number } {
    return {
      enhanced: this.enhancedQuestions.length,
      base: this.baseQuestions.length,
      total: this.enhancedQuestions.length + this.baseQuestions.length
    };
  }

  // Method to search for specific question by ID
  getQuestionById(id: string): any | null {
    const enhanced = this.enhancedQuestions.find(q => q.id === id);
    if (enhanced) return enhanced;
    
    const base = this.baseQuestions.find(q => q.id === id);
    return base || null;
  }

  // Method to get all questions in a category
  getQuestionsByCategory(category: string): any[] {
    const enhanced = this.enhancedQuestions.filter(q => 
      q.category?.toLowerCase().includes(category.toLowerCase())
    );
    const base = this.baseQuestions.filter(q => 
      q.category?.toLowerCase().includes(category.toLowerCase())
    );
    
    return [...enhanced, ...base];
  }
}

export const pureDatasetRAGService = PureDatasetRAGService.getInstance();