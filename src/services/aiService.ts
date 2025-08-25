import { handleAPIError } from './api';
import { portfolioService } from './portfolioService';
import { toast } from '@/hooks/use-toast';

export interface AIInsightRequest {
  query: string;
  context?: {
    portfolioSummary?: any;
    loans?: any[];
    specificLoanId?: string;
    analysisType?: 'portfolio' | 'loan' | 'compliance' | 'risk';
  };
  agent?: 'advisory' | 'calculation' | 'compliance' | 'risk';
}

export interface AIInsightResponse {
  response: string;
  confidence: number;
  sources: Array<{
    title: string;
    content: string;
    relevance: number;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
  metadata: {
    processingTime: number;
    tokensUsed: number;
    model: string;
  };
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'data-quality' | 'emission-reduction' | 'compliance' | 'risk-management' | 'business-intelligence';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  actionable: boolean;
  actions: Array<{
    title: string;
    description: string;
    estimatedTime: string;
  }>;
  relatedLoans?: string[];
  expectedOutcome: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any;
  sources?: Array<{
    title: string;
    content: string;
    relevance: number;
  }>;
}

class AIService {
  private static instance: AIService;
  private chatHistory: ChatMessage[] = [];

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async getAIInsights(request: AIInsightRequest): Promise<AIInsightResponse> {
    try {
      // Call backend AI insights endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai-insights/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query: request.query,
          context: request.context,
          agent_type: request.agent || 'advisory',
          include_sources: true,
          include_recommendations: true,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`AI insights request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform backend response to frontend format
      return {
        response: data.data.response,
        confidence: data.data.confidence || 0.8,
        sources: data.data.sources || [],
        recommendations: data.data.recommendations || [],
        metadata: {
          processingTime: data.data.processing_time || 0,
          tokensUsed: data.data.tokens_used || 0,
          model: data.data.model || 'gpt-4'
        }
      };
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async getRecommendations(portfolioId?: string): Promise<AIRecommendation[]> {
    try {
      // Call backend RAG recommendations endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/rag-recommendations/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          include_data_quality: true,
          include_compliance: true,
          include_risk_management: true,
          include_business_intelligence: true,
          max_recommendations: 10,
          min_confidence: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Recommendations request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform backend recommendations to frontend format
      return data.data.recommendations.map((rec: any) => ({
        id: rec.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: rec.title,
        description: rec.description,
        category: rec.category || 'business-intelligence',
        priority: rec.priority || 'medium',
        confidence: rec.confidence || 0.8,
        impact: rec.impact || 'medium',
        effort: rec.effort || 'medium',
        actionable: rec.actionable !== false,
        actions: rec.actions || [{
          title: 'Implement Recommendation',
          description: rec.description,
          estimatedTime: '1-2 weeks'
        }],
        relatedLoans: rec.related_loans || [],
        expectedOutcome: rec.expected_outcome || 'Improved portfolio performance'
      }));
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async chatWithAI(message: string, agent: string = 'advisory', context?: any): Promise<ChatMessage> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
        context
      };
      this.chatHistory.push(userMessage);

      // Get portfolio context if not provided
      let chatContext = context;
      if (!chatContext) {
        try {
          const { loans, summary } = await portfolioService.getPortfolioSummary();
          chatContext = {
            portfolioSummary: summary,
            totalLoans: loans.length,
            recentActivity: loans.slice(0, 5)
          };
        } catch (error) {
          console.warn('Could not load portfolio context for chat:', error);
        }
      }

      // Call backend AI chat endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai-chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          message,
          agent_type: agent,
          context: chatContext,
          conversation_history: this.chatHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString()
          })),
          include_sources: true,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`AI chat request failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Add AI response to history
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
        sources: data.data.sources || []
      };
      this.chatHistory.push(aiMessage);

      return aiMessage;
    } catch (error) {
      console.error('Failed to chat with AI:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async analyzePortfolioWithAI(): Promise<AIInsightResponse> {
    try {
      const { loans, summary } = await portfolioService.getPortfolioSummary();

      const analysisRequest: AIInsightRequest = {
        query: 'Provide a comprehensive analysis of this motor vehicle loan portfolio, including PCAF compliance, data quality assessment, emission reduction opportunities, and risk factors.',
        context: {
          portfolioSummary: summary,
          loans: loans.slice(0, 100), // Limit to first 100 loans for analysis
          analysisType: 'portfolio'
        },
        agent: 'advisory'
      };

      return await this.getAIInsights(analysisRequest);
    } catch (error) {
      console.error('Failed to analyze portfolio with AI:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async analyzeLoanWithAI(loanId: string): Promise<AIInsightResponse> {
    try {
      // Fetch loan data directly
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/loans/${loanId}?include_amortization=true&include_emissions_history=true&include_audit_trail=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch loan data: ${response.statusText}`);
      }

      const loanResponse = await response.json();

      const analysisRequest: AIInsightRequest = {
        query: `Analyze this specific motor vehicle loan for PCAF compliance, data quality issues, emission calculation accuracy, and potential improvements.`,
        context: {
          specificLoanId: loanId,
          loans: [loanResponse.data],
          analysisType: 'loan'
        },
        agent: 'calculation'
      };

      return await this.getAIInsights(analysisRequest);
    } catch (error) {
      console.error('Failed to analyze loan with AI:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async getComplianceInsights(): Promise<AIInsightResponse> {
    try {
      const portfolioMetrics = await portfolioService.getPortfolioAnalytics();

      const complianceRequest: AIInsightRequest = {
        query: 'Assess PCAF compliance status, identify regulatory risks, and recommend actions to ensure full compliance with financed emissions reporting standards.',
        context: {
          portfolioSummary: portfolioMetrics,
          analysisType: 'compliance'
        },
        agent: 'compliance'
      };

      return await this.getAIInsights(complianceRequest);
    } catch (error) {
      console.error('Failed to get compliance insights:', error);
      throw new Error(handleAPIError(error));
    }
  }

  async getRiskAssessment(): Promise<AIInsightResponse> {
    try {
      const portfolioMetrics = await portfolioService.getPortfolioAnalytics();

      const riskRequest: AIInsightRequest = {
        query: 'Conduct a comprehensive climate risk assessment for this motor vehicle loan portfolio, including transition risks, physical risks, and regulatory risks.',
        context: {
          portfolioSummary: portfolioMetrics,
          analysisType: 'risk'
        },
        agent: 'risk'
      };

      return await this.getAIInsights(riskRequest);
    } catch (error) {
      console.error('Failed to get risk assessment:', error);
      throw new Error(handleAPIError(error));
    }
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }

  async generateDataQualityRecommendations(loans: any[]): Promise<AIRecommendation[]> {
    try {
      const poorQualityLoans = loans.filter(loan =>
        loan.emissions_data?.data_quality_score >= 4
      );

      if (poorQualityLoans.length === 0) {
        return [];
      }

      const request: AIInsightRequest = {
        query: `Analyze these ${poorQualityLoans.length} loans with poor data quality (score >= 4) and provide specific recommendations for improving their PCAF data quality scores.`,
        context: {
          loans: poorQualityLoans,
          analysisType: 'portfolio'
        },
        agent: 'advisory'
      };

      const response = await this.getAIInsights(request);

      // Convert AI response to structured recommendations
      return response.recommendations.map((rec, index) => ({
        id: `dq_${index}`,
        title: rec.title,
        description: rec.description,
        category: 'data-quality' as const,
        priority: rec.priority,
        confidence: response.confidence,
        impact: 'high' as const,
        effort: 'medium' as const,
        actionable: rec.actionable,
        actions: [{
          title: 'Implement Recommendation',
          description: rec.description,
          estimatedTime: '1-2 weeks'
        }],
        relatedLoans: poorQualityLoans.map(loan => loan.loan_id),
        expectedOutcome: 'Improved PCAF data quality score and compliance'
      }));
    } catch (error) {
      console.error('Failed to generate data quality recommendations:', error);
      return [];
    }
  }

  async explainPCAFCalculation(loanId: string): Promise<string> {
    try {
      const request: AIInsightRequest = {
        query: `Explain the PCAF calculation methodology used for this loan, including the data quality assessment, attribution factor calculation, and emission factor selection. Make it understandable for non-technical users.`,
        context: {
          specificLoanId: loanId,
          analysisType: 'loan'
        },
        agent: 'calculation'
      };

      const response = await this.getAIInsights(request);
      return response.response;
    } catch (error) {
      console.error('Failed to explain PCAF calculation:', error);
      return 'Unable to generate explanation at this time.';
    }
  }
}

export const aiService = AIService.getInstance();

// AI Chat Service for contextual help
export const aiChatService = {
  async createChatSession(userId?: string, context?: any) {
    return `session_${Date.now()}`;
  },

  async processMessage(request: {
    sessionId: string;
    message: string;
    context?: any;
  }) {
    // Mock AI responses based on common PCAF questions
    const responses = {
      'what is wdqs': 'WDQS (Weighted Data Quality Score) is a measure of data quality in PCAF methodology. Scores range from 1 (best) to 5 (worst). A portfolio WDQS ≤ 3.0 indicates good compliance with PCAF standards.',
      'how to improve data quality': 'To improve data quality: 1) Add vehicle make/model/year data, 2) Include fuel efficiency ratings, 3) Collect annual mileage data, 4) Verify vehicle specifications. Focus on high-value loans first for maximum impact.',
      'pcaf compliance': 'PCAF compliance requires: 1) WDQS ≤ 3.0 for the portfolio, 2) Proper scope allocation, 3) Attribution factor calculations, 4) Transparent methodology documentation. Start with data quality improvements for quick wins.',
      'emissions intensity': 'Emissions intensity measures kg CO₂e per $1,000 outstanding balance. Lower is better. Target ≤ 2.5 kg/$1k for good performance. Electric vehicles typically show 60-80% lower intensity than ICE vehicles.',
      'default': 'I can help you with PCAF methodology, data quality improvements, emissions calculations, and compliance questions. What specific topic would you like to explore?'
    };

    const message = request.message.toLowerCase();
    let response = responses.default;

    // Simple keyword matching
    for (const [key, value] of Object.entries(responses)) {
      if (key !== 'default' && message.includes(key.replace(/\s+/g, ' '))) {
        response = value;
        break;
      }
    }

    // Add some delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return {
      response,
      sources: ['PCAF Global Standard', 'Motor Vehicle Methodology'],
      confidence: 'high' as const,
      followUpSuggestions: [
        'How do I calculate attribution factors?',
        'What are the PCAF data options?',
        'How to handle missing vehicle data?'
      ],
      metadata: {
        processingTime: 1500,
        tokensUsed: 150,
        contextUsed: true,
        searchPerformed: false
      }
    };
  }
};