# 🔍 Comprehensive RAG System Analysis & Troubleshooting

## 🎯 **EXECUTIVE SUMMARY**

After conducting a thorough review of your AI chatbot system, I've identified **multiple architectural issues** causing static responses and limited functionality. Your system has **fragmented RAG services** that aren't properly unified, leading to inconsistent user experiences.

## 🏗️ **CURRENT ARCHITECTURE PROBLEMS**

### 1. **Multiple Competing RAG Services** 
You have **7 different RAG services** that aren't unified:
- `surgicalRAGService.ts` - Only calls API endpoint (incomplete)
- `pureDatasetRAGService.ts` - Local dataset matching
- `datasetRAGService.ts` - Enhanced dataset with banking context
- `aiService.ts` - Backend API calls (broken connection)
- `chromaRAGService.ts` - ChromaDB integration
- `contextualRAGService.ts` - Context-aware responses
- `hybridRAGService.ts` - Multiple service combination

**Problem:** Each service has different capabilities, and the chatbot randomly uses different ones, causing inconsistent responses.

### 2. **Broken Backend Connection**
```
WebSocket Error: wss://pcaf-server-production.up.railway.app/ws
```
**Root Cause:** Your frontend is configured to connect to a Railway backend that's either:
- Down/unavailable
- Misconfigured
- Using wrong WebSocket endpoints

### 3. **Static Response Fallbacks**
When ChromaDB/backend fails, the system falls back to **hardcoded static responses** instead of leveraging your comprehensive 200+ Q&A dataset.

### 4. **Environment Variable Confusion**
- Frontend expects `NEXT_PUBLIC_*` variables (client-exposed)
- Backend expects regular environment variables
- Mismatched configuration between local/production

## 🎯 **RECOMMENDED UNIFIED ARCHITECTURE**

### **Single Intelligent RAG Router**
```typescript
// Unified RAG System Architecture
class UnifiedRAGService {
  async processQuery(query: string, context?: any) {
    // 1. Query Classification
    const intent = this.classifyQuery(query);
    
    // 2. Source Selection (Priority Order)
    if (intent.requiresLiveData) {
      return await this.queryBackendRAG(query, context);
    }
    
    if (intent.isMethodologyQuestion) {
      return await this.queryDatasetRAG(query, context);
    }
    
    if (intent.isPortfolioSpecific) {
      return await this.queryPortfolioRAG(query, context);
    }
    
    // 3. Fallback to ChromaDB
    return await this.queryChromaDB(query, context);
  }
}
```

## 🔧 **IMPLEMENTATION PLAN**

### **Phase 1: Unified RAG Service** (Priority: HIGH)

<function_calls>
<invoke name="fsWrite">
<parameter name="path">PCAF-client/src/services/unifiedRAGService.tsUnified RAG Service - Single Point of Truth
 * 
 * This service unifies all RAG capabilities into a single, intelligent router
 * that provides consistent, high-quality responses across all chat interfaces.
 */

import { pureDatasetRAGService } from './pureDatasetRAGService';
import { datasetRAGService } from './datasetRAGService';
import { aiService } from './aiService';

export interface UnifiedRAGRequest {
  query: string;
  sessionId: string;
  context?: {
    portfolioData?: any;
    userRole?: 'executive' | 'risk_manager' | 'compliance_officer' | 'loan_officer';
    conversationHistory?: any[];
    urgency?: 'immediate' | 'planning' | 'research';
  };
}

export interface UnifiedRAGResponse {
  response: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
  followUpQuestions: string[];
  responseType: 'dataset' | 'backend' | 'chromadb' | 'fallback';
  processingPath: string[];
  metadata: {
    processingTime: number;
    sourceUsed: string;
    fallbackReason?: string;
  };
}

export interface QueryClassification {
  intent: 'methodology' | 'calculation' | 'portfolio_analysis' | 'compliance' | 'general';
  complexity: 'simple' | 'moderate' | 'complex';
  requiresLiveData: boolean;
  isPortfolioSpecific: boolean;
  isMethodologyQuestion: boolean;
  confidence: number;
  keywords: string[];
}

class UnifiedRAGService {
  private static instance: UnifiedRAGService;
  private processingStats = {
    totalQueries: 0,
    datasetHits: 0,
    backendHits: 0,
    chromadbHits: 0,
    fallbackHits: 0
  };

  static getInstance(): UnifiedRAGService {
    if (!UnifiedRAGService.instance) {
      UnifiedRAGService.instance = new UnifiedRAGService();
    }
    return UnifiedRAGService.instance;
  }

  async processQuery(request: UnifiedRAGRequest): Promise<UnifiedRAGResponse> {
    const startTime = Date.now();
    const processingPath: string[] = [];
    this.processingStats.totalQueries++;

    try {
      // 1. Classify the query to determine optimal processing path
      processingPath.push('query_classification');
      const classification = this.classifyQuery(request.query);
      
      console.log(`[UNIFIED RAG] Query: "${request.query}"`);
      console.log(`[UNIFIED RAG] Classification:`, classification);

      // 2. Route to appropriate service based on classification
      let response: UnifiedRAGResponse;

      // Priority 1: Portfolio-specific queries (requires live data)
      if (classification.isPortfolioSpecific && classification.requiresLiveData) {
        processingPath.push('portfolio_analysis');
        response = await this.handlePortfolioQuery(request, classification, processingPath);
      }
      // Priority 2: Methodology questions (use curated dataset)
      else if (classification.isMethodologyQuestion) {
        processingPath.push('methodology_dataset');
        response = await this.handleMethodologyQuery(request, classification, processingPath);
      }
      // Priority 3: Complex calculations (try backend first)
      else if (classification.intent === 'calculation' && classification.complexity !== 'simple') {
        processingPath.push('calculation_backend');
        response = await this.handleCalculationQuery(request, classification, processingPath);
      }
      // Priority 4: General queries (try multiple sources)
      else {
        processingPath.push('general_query');
        response = await this.handleGeneralQuery(request, classification, processingPath);
      }

      // 3. Enhance response with metadata
      response.processingPath = processingPath;
      response.metadata.processingTime = Date.now() - startTime;

      console.log(`[UNIFIED RAG] Response type: ${response.responseType}, Confidence: ${response.confidence}`);
      return response;

    } catch (error) {
      console.error('[UNIFIED RAG] Processing failed:', error);
      processingPath.push('error_fallback');
      
      return this.createErrorFallback(request.query, processingPath, Date.now() - startTime);
    }
  }

  private classifyQuery(query: string): QueryClassification {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/);
    
    // Extract keywords
    const methodologyKeywords = ['pcaf', 'option', 'data quality', 'wdqs', 'attribution', 'emission factor', 'methodology'];
    const calculationKeywords = ['calculate', 'formula', 'compute', 'equation', 'math', 'number'];
    const portfolioKeywords = ['my portfolio', 'our loans', 'current score', 'my data', 'analyze portfolio'];
    const complianceKeywords = ['compliance', 'regulatory', 'audit', 'requirement', 'standard'];
    
    const foundKeywords = [];
    let methodologyScore = 0;
    let calculationScore = 0;
    let portfolioScore = 0;
    let complianceScore = 0;

    // Score different intents
    methodologyKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        methodologyScore += 1;
        foundKeywords.push(keyword);
      }
    });

    calculationKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        calculationScore += 1;
        foundKeywords.push(keyword);
      }
    });

    portfolioKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        portfolioScore += 2; // Higher weight for portfolio queries
        foundKeywords.push(keyword);
      }
    });

    complianceKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        complianceScore += 1;
        foundKeywords.push(keyword);
      }
    });

    // Determine primary intent
    let intent: QueryClassification['intent'] = 'general';
    let confidence = 0.5;

    if (portfolioScore > 0) {
      intent = 'portfolio_analysis';
      confidence = Math.min(0.9, 0.6 + portfolioScore * 0.1);
    } else if (methodologyScore >= calculationScore && methodologyScore >= complianceScore) {
      intent = 'methodology';
      confidence = Math.min(0.9, 0.6 + methodologyScore * 0.1);
    } else if (calculationScore > 0) {
      intent = 'calculation';
      confidence = Math.min(0.9, 0.6 + calculationScore * 0.1);
    } else if (complianceScore > 0) {
      intent = 'compliance';
      confidence = Math.min(0.9, 0.6 + complianceScore * 0.1);
    }

    // Determine complexity
    let complexity: QueryClassification['complexity'] = 'simple';
    if (words.length > 15 || foundKeywords.length > 3) {
      complexity = 'complex';
    } else if (words.length > 8 || foundKeywords.length > 1) {
      complexity = 'moderate';
    }

    return {
      intent,
      complexity,
      requiresLiveData: portfolioScore > 0 || lowerQuery.includes('current') || lowerQuery.includes('my'),
      isPortfolioSpecific: portfolioScore > 0,
      isMethodologyQuestion: methodologyScore > 0 && portfolioScore === 0,
      confidence,
      keywords: foundKeywords
    };
  }

  private async handlePortfolioQuery(
    request: UnifiedRAGRequest, 
    classification: QueryClassification, 
    processingPath: string[]
  ): Promise<UnifiedRAGResponse> {
    
    try {
      // Try backend service first for live portfolio data
      processingPath.push('backend_api_call');
      const backendResponse = await aiService.chatWithAI(
        request.query, 
        'advisory', 
        request.context?.portfolioData
      );

      this.processingStats.backendHits++;
      
      return {
        response: backendResponse.content,
        confidence: 'high',
        sources: backendResponse.sources?.map(s => s.title) || ['Portfolio Analysis Engine'],
        followUpQuestions: this.generateContextualFollowUps(classification),
        responseType: 'backend',
        processingPath,
        metadata: {
          processingTime: 0, // Will be set by caller
          sourceUsed: 'backend_api'
        }
      };

    } catch (error) {
      console.warn('[UNIFIED RAG] Backend failed for portfolio query:', error);
      processingPath.push('portfolio_fallback_to_dataset');
      
      // Fallback to enhanced dataset with portfolio context
      return await this.handleMethodologyQuery(request, classification, processingPath);
    }
  }

  private async handleMethodologyQuery(
    request: UnifiedRAGRequest, 
    classification: QueryClassification, 
    processingPath: string[]
  ): Promise<UnifiedRAGResponse> {
    
    try {
      // Use pure dataset service for methodology questions
      processingPath.push('pure_dataset_search');
      const datasetResponse = await pureDatasetRAGService.processQuery({
        query: request.query,
        sessionId: request.sessionId,
        portfolioContext: request.context?.portfolioData,
        userRole: request.context?.userRole
      });

      this.processingStats.datasetHits++;

      return {
        response: datasetResponse.response,
        confidence: datasetResponse.confidence,
        sources: datasetResponse.sources,
        followUpQuestions: datasetResponse.followUpQuestions,
        responseType: 'dataset',
        processingPath,
        metadata: {
          processingTime: 0, // Will be set by caller
          sourceUsed: `dataset_${datasetResponse.datasetSource}`
        }
      };

    } catch (error) {
      console.warn('[UNIFIED RAG] Dataset service failed:', error);
      processingPath.push('methodology_fallback_to_chromadb');
      
      // Fallback to ChromaDB
      return await this.handleChromaDBQuery(request, classification, processingPath);
    }
  }

  private async handleCalculationQuery(
    request: UnifiedRAGRequest, 
    classification: QueryClassification, 
    processingPath: string[]
  ): Promise<UnifiedRAGResponse> {
    
    try {
      // Try backend for complex calculations
      processingPath.push('calculation_backend_api');
      const backendResponse = await aiService.chatWithAI(
        request.query, 
        'calculation', 
        request.context?.portfolioData
      );

      this.processingStats.backendHits++;

      return {
        response: backendResponse.content,
        confidence: 'high',
        sources: backendResponse.sources?.map(s => s.title) || ['PCAF Calculation Engine'],
        followUpQuestions: this.generateContextualFollowUps(classification),
        responseType: 'backend',
        processingPath,
        metadata: {
          processingTime: 0,
          sourceUsed: 'backend_calculation'
        }
      };

    } catch (error) {
      console.warn('[UNIFIED RAG] Backend calculation failed:', error);
      processingPath.push('calculation_fallback_to_dataset');
      
      // Fallback to dataset for calculation methodology
      return await this.handleMethodologyQuery(request, classification, processingPath);
    }
  }

  private async handleGeneralQuery(
    request: UnifiedRAGRequest, 
    classification: QueryClassification, 
    processingPath: string[]
  ): Promise<UnifiedRAGResponse> {
    
    // Try multiple sources in order of preference
    
    // 1. Try enhanced dataset first
    try {
      processingPath.push('general_enhanced_dataset');
      const enhancedResponse = await datasetRAGService.processQuery({
        query: request.query,
        sessionId: request.sessionId,
        portfolioContext: request.context?.portfolioData,
        userRole: request.context?.userRole
      });

      if (enhancedResponse.confidence === 'high') {
        this.processingStats.datasetHits++;
        
        return {
          response: enhancedResponse.response,
          confidence: enhancedResponse.confidence,
          sources: enhancedResponse.sources,
          followUpQuestions: enhancedResponse.followUpQuestions,
          responseType: 'dataset',
          processingPath,
          metadata: {
            processingTime: 0,
            sourceUsed: 'enhanced_dataset'
          }
        };
      }
    } catch (error) {
      console.warn('[UNIFIED RAG] Enhanced dataset failed:', error);
    }

    // 2. Try ChromaDB
    processingPath.push('general_chromadb_fallback');
    return await this.handleChromaDBQuery(request, classification, processingPath);
  }

  private async handleChromaDBQuery(
    request: UnifiedRAGRequest, 
    classification: QueryClassification, 
    processingPath: string[]
  ): Promise<UnifiedRAGResponse> {
    
    try {
      // Use the secure API endpoint for ChromaDB
      processingPath.push('chromadb_api_call');
      const response = await fetch('/api/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: request.query,
          portfolioContext: request.context?.portfolioData
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.processingStats.chromadbHits++;
        
        return {
          response: result.response,
          confidence: result.confidence,
          sources: result.sources,
          followUpQuestions: result.followUpQuestions,
          responseType: 'chromadb',
          processingPath,
          metadata: {
            processingTime: 0,
            sourceUsed: 'chromadb_api'
          }
        };
      }
    } catch (error) {
      console.warn('[UNIFIED RAG] ChromaDB API failed:', error);
    }

    // Final fallback
    processingPath.push('final_fallback');
    return this.createMethodologyFallback(request.query, processingPath);
  }

  private createMethodologyFallback(query: string, processingPath: string[]): UnifiedRAGResponse {
    this.processingStats.fallbackHits++;
    
    return {
      response: `**PCAF Motor Vehicle Knowledge Base**

I have access to comprehensive PCAF methodology covering:

• **Data Quality Options** - PCAF Options 1-5 for motor vehicles
• **Calculations** - Attribution factors, financed emissions, WDQS
• **Compliance** - Regulatory requirements and reporting standards
• **Implementation** - Best practices and system integration

**Try asking specific questions like:**
• "What are the PCAF data quality options?"
• "How do I calculate attribution factors?"
• "What is the WDQS compliance threshold?"
• "How do I improve from Option 4 to Option 3?"

I can provide detailed, technical guidance based on PCAF Global Standards.`,
      confidence: 'medium',
      sources: ['PCAF Global Standard', 'Motor Vehicle Methodology'],
      followUpQuestions: [
        'What are the PCAF data quality options for motor vehicles?',
        'How do I calculate weighted data quality score?',
        'What are attribution factors in PCAF?',
        'How can I improve my portfolio data quality?'
      ],
      responseType: 'fallback',
      processingPath,
      metadata: {
        processingTime: 0,
        sourceUsed: 'static_fallback',
        fallbackReason: 'All primary sources unavailable'
      }
    };
  }

  private createErrorFallback(query: string, processingPath: string[], processingTime: number): UnifiedRAGResponse {
    this.processingStats.fallbackHits++;
    
    return {
      response: `I apologize, but I encountered an error processing your question: "${query}". 

Please try:
• Rephrasing your question more specifically
• Asking about PCAF methodology topics
• Checking your connection and trying again

I'm here to help with PCAF motor vehicle calculations, data quality, and compliance questions.`,
      confidence: 'low',
      sources: ['Error Handler'],
      followUpQuestions: [
        'What are PCAF data quality options?',
        'How do I calculate financed emissions?',
        'What are PCAF compliance requirements?'
      ],
      responseType: 'fallback',
      processingPath,
      metadata: {
        processingTime,
        sourceUsed: 'error_fallback',
        fallbackReason: 'System error occurred'
      }
    };
  }

  private generateContextualFollowUps(classification: QueryClassification): string[] {
    const baseFollowUps = {
      methodology: [
        'What are the PCAF data quality options?',
        'How do I calculate attribution factors?',
        'What is the WDQS compliance threshold?'
      ],
      calculation: [
        'Can you show me a step-by-step example?',
        'What data do I need for this calculation?',
        'How do I validate the results?'
      ],
      portfolio_analysis: [
        'Which loans should I prioritize for improvement?',
        'What\'s my current compliance status?',
        'How can I reduce my portfolio emissions?'
      ],
      compliance: [
        'What documentation do I need for audit?',
        'What are the regulatory deadlines?',
        'How do I prepare for examination?'
      ],
      general: [
        'Can you provide more specific guidance?',
        'What are the implementation steps?',
        'How does this relate to PCAF standards?'
      ]
    };

    return baseFollowUps[classification.intent] || baseFollowUps.general;
  }

  // Analytics and monitoring methods
  getProcessingStats() {
    return {
      ...this.processingStats,
      successRate: ((this.processingStats.totalQueries - this.processingStats.fallbackHits) / 
                   Math.max(this.processingStats.totalQueries, 1) * 100).toFixed(1) + '%',
      primarySourceHitRate: ((this.processingStats.datasetHits + this.processingStats.backendHits) / 
                            Math.max(this.processingStats.totalQueries, 1) * 100).toFixed(1) + '%'
    };
  }

  resetStats() {
    this.processingStats = {
      totalQueries: 0,
      datasetHits: 0,
      backendHits: 0,
      chromadbHits: 0,
      fallbackHits: 0
    };
  }
}

export const unifiedRAGService = UnifiedRAGService.getInstance();