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
    const message = request.message.toLowerCase();
    
    // Enhanced pattern matching with multiple keywords and phrases
    const responsePatterns = [
      {
        keywords: ['wdqs', 'weighted data quality', 'data quality score'],
        response: 'WDQS (Weighted Data Quality Score) is a measure of data quality in PCAF methodology. Scores range from 1 (best) to 5 (worst). A portfolio WDQS ≤ 3.0 indicates good compliance with PCAF standards. Lower scores indicate higher data quality.',
        sources: ['PCAF Global Standard', 'Data Quality Assessment Guide'],
        followUp: ['How to improve data quality from score 2 to 4?', 'What are PCAF data options?', 'How to calculate WDQS?']
      },
      {
        keywords: ['improve data quality', 'better data quality', 'data quality improvement'],
        response: 'To improve data quality: 1) Add vehicle make/model/year data (moves from Option 5 to 4), 2) Include fuel efficiency ratings (moves to Option 3), 3) Collect annual mileage data (moves to Option 2), 4) Get real-world fuel consumption (achieves Option 1). Focus on high-value loans first for maximum impact.',
        sources: ['PCAF Motor Vehicle Methodology', 'Data Collection Guidelines'],
        followUp: ['What are the PCAF data options?', 'How to prioritize data collection?', 'What is attribution factor?']
      },
      {
        keywords: ['pcaf compliance', 'compliance requirements', 'pcaf standard'],
        response: 'PCAF compliance requires: 1) WDQS ≤ 3.0 for the portfolio, 2) Proper scope 3 category 15 allocation, 3) Attribution factor calculations, 4) Transparent methodology documentation, 5) Annual reporting. Start with data quality improvements for quick wins.',
        sources: ['PCAF Global Standard', 'Compliance Checklist'],
        followUp: ['How to calculate attribution factors?', 'What is scope 3 category 15?', 'PCAF reporting requirements?']
      },
      {
        keywords: ['emissions intensity', 'emission intensity', 'carbon intensity'],
        response: 'Emissions intensity measures kg CO₂e per $1,000 outstanding balance. Lower is better. Target ≤ 2.5 kg/$1k for good performance. Electric vehicles typically show 60-80% lower intensity than ICE vehicles. This metric helps compare portfolio performance over time.',
        sources: ['PCAF Calculation Guide', 'Intensity Metrics'],
        followUp: ['How to reduce emissions intensity?', 'What affects emission intensity?', 'EV vs ICE comparison?']
      },
      {
        keywords: ['attribution factor', 'attribution factors', 'calculate attribution'],
        response: 'Attribution factors determine what portion of an asset\'s emissions to allocate to your loan. For motor vehicles: Attribution Factor = Outstanding Amount / Asset Value. For example, if you have a $20k loan on a $40k car, your attribution factor is 0.5 (50%).',
        sources: ['PCAF Attribution Methodology', 'Calculation Examples'],
        followUp: ['How to get asset values?', 'What if asset value is unknown?', 'Attribution factor examples?']
      },
      {
        keywords: ['emission factors', 'emission factor', 'co2 factors'],
        response: 'Emission factors convert activity data to CO₂ emissions. For vehicles: kg CO₂e per km driven. PCAF recommends using regional factors when available. Default factors vary by vehicle type: passenger cars ~0.2 kg/km, trucks ~0.8 kg/km. Always use the most specific factor available.',
        sources: ['PCAF Emission Factors Database', 'Regional Factor Guidelines'],
        followUp: ['Where to find emission factors?', 'Regional vs global factors?', 'Vehicle-specific factors?']
      },
      {
        keywords: ['data options', 'pcaf options', 'data hierarchy'],
        response: 'PCAF data options (1-5, best to worst): Option 1: Real fuel consumption data, Option 2: Estimated fuel consumption from mileage, Option 3: Vehicle specifications + average mileage, Option 4: Vehicle type + average factors, Option 5: Asset class average. Always aim for the highest option possible.',
        sources: ['PCAF Data Hierarchy', 'Motor Vehicle Methodology'],
        followUp: ['How to move from option 5 to 4?', 'What data is needed for option 3?', 'Option 1 vs option 2 comparison?']
      },
      {
        keywords: ['calculate financed emissions', 'financed emissions calculation', 'how to calculate'],
        response: 'Financed Emissions = Attribution Factor × Asset Emissions. Where: Attribution Factor = Outstanding Amount ÷ Asset Value, and Asset Emissions = Activity Data × Emission Factor. For vehicles: Activity Data is typically annual mileage driven.',
        sources: ['PCAF Calculation Formula', 'Step-by-step Guide'],
        followUp: ['What is attribution factor?', 'How to get activity data?', 'Emission factor selection?']
      },
      {
        keywords: ['tcfd', 'task force', 'climate disclosure'],
        response: 'TCFD (Task Force on Climate-related Financial Disclosures) requires disclosure of financed emissions as part of Scope 3 Category 15. PCAF methodology is the recommended standard for calculating these emissions. Key requirements: governance, strategy, risk management, and metrics & targets.',
        sources: ['TCFD Recommendations', 'PCAF-TCFD Alignment Guide'],
        followUp: ['TCFD reporting requirements?', 'Scope 3 category 15 details?', 'Climate risk assessment?']
      },
      {
        keywords: ['scope 3', 'category 15', 'scope 3 category 15'],
        response: 'Scope 3 Category 15 covers emissions from investments and loans in your portfolio. This includes financed emissions from loans, project finance, and other financial products. PCAF methodology provides the standard approach for calculating these emissions.',
        sources: ['GHG Protocol Scope 3 Standard', 'PCAF Implementation Guide'],
        followUp: ['Other scope 3 categories?', 'Financed vs facilitated emissions?', 'Reporting boundaries?']
      }
    ];

    // Find matching response
    let matchedResponse = null;
    for (const pattern of responsePatterns) {
      if (pattern.keywords.some(keyword => message.includes(keyword))) {
        matchedResponse = pattern;
        break;
      }
    }

    // Default response if no match found
    if (!matchedResponse) {
      matchedResponse = {
        response: 'I can help you with PCAF methodology, data quality improvements, emissions calculations, and compliance questions. Try asking about specific topics like "data quality", "attribution factors", "emission factors", or "PCAF compliance".',
        sources: ['PCAF Global Standard', 'Motor Vehicle Methodology'],
        followUp: ['What is PCAF methodology?', 'How to improve data quality?', 'What are attribution factors?', 'PCAF compliance requirements?']
      };
    }

    // Add some delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    return {
      response: matchedResponse.response,
      sources: matchedResponse.sources || ['PCAF Global Standard'],
      confidence: 'high' as const,
      followUpSuggestions: matchedResponse.followUp || [
        'How do I calculate attribution factors?',
        'What are the PCAF data options?',
        'How to handle missing vehicle data?'
      ],
      metadata: {
        processingTime: 1200,
        tokensUsed: 180,
        contextUsed: true,
        searchPerformed: false
      }
    };
  }
};