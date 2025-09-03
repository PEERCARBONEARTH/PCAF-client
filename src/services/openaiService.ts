import { toast } from '@/hooks/use-toast';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  confidence: number;
}

class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured. Using fallback responses.');
    }
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private getSystemPrompt(): string {
    return `You are a PCAF (Partnership for Carbon Accounting Financials) methodology expert specializing in motor vehicle financed emissions calculations. You provide accurate, technical guidance on:

1. PCAF Data Quality Options (1-5, where 1 is highest quality)
2. Attribution factor calculations (Outstanding Balance ÷ Asset Value)
3. Financed emissions calculations
4. PCAF compliance requirements (WDQS ≤ 3.0)
5. Data collection strategies and improvements
6. Scope 3 Category 15 reporting

Key Facts to Remember:
- PCAF data quality hierarchy: Option 1 (best) to Option 5 (worst)
- WDQS compliance threshold: ≤ 3.0 (exactly)
- Attribution Factor = Outstanding Amount ÷ Asset Value
- Financed Emissions = Attribution Factor × Asset Emissions
- Asset Emissions = Activity Data × Emission Factor

Always provide:
- Technically accurate information
- Practical, actionable guidance
- Specific examples when helpful
- References to PCAF methodology
- Clear explanations of calculations

Be concise but comprehensive. Focus on practical implementation.`;
  }

  async chatCompletion(
    messages: OpenAIMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      portfolioContext?: any;
    } = {}
  ): Promise<OpenAIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      model = 'gpt-4',
      temperature = 0.3, // Lower temperature for more consistent technical responses
      maxTokens = 1000
    } = options;

    try {
      // Add system message with PCAF expertise
      const systemMessage: OpenAIMessage = {
        role: 'system',
        content: this.getSystemPrompt()
      };

      // Add portfolio context if provided
      let contextualMessages = [systemMessage, ...messages];
      if (options.portfolioContext) {
        const contextMessage: OpenAIMessage = {
          role: 'system',
          content: `Portfolio Context: ${JSON.stringify(options.portfolioContext, null, 2)}`
        };
        contextualMessages = [systemMessage, contextMessage, ...messages];
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: contextualMessages,
          temperature,
          max_tokens: maxTokens,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI API');
      }

      const choice = data.choices[0];
      const content = choice.message?.content || '';

      // Calculate confidence based on finish_reason and response quality
      let confidence = 0.8; // Default confidence
      if (choice.finish_reason === 'stop') {
        confidence = 0.9; // High confidence for complete responses
      } else if (choice.finish_reason === 'length') {
        confidence = 0.7; // Lower confidence for truncated responses
      }

      return {
        content,
        usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        model: data.model || model,
        confidence
      };

    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  async generatePCAFResponse(
    userQuery: string,
    conversationHistory: OpenAIMessage[] = [],
    portfolioContext?: any
  ): Promise<{
    response: string;
    sources: string[];
    followUpQuestions: string[];
    confidence: number;
    metadata: {
      model: string;
      tokensUsed: number;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();

    try {
      // Prepare messages for OpenAI
      const messages: OpenAIMessage[] = [
        ...conversationHistory.slice(-6), // Keep last 6 messages for context
        {
          role: 'user',
          content: userQuery
        }
      ];

      const openaiResponse = await this.chatCompletion(messages, {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 1000,
        portfolioContext
      });

      // Generate follow-up questions based on the topic
      const followUpQuestions = this.generateFollowUpQuestions(userQuery, openaiResponse.content);

      // Determine relevant sources based on content
      const sources = this.identifyRelevantSources(openaiResponse.content);

      return {
        response: openaiResponse.content,
        sources,
        followUpQuestions,
        confidence: openaiResponse.confidence,
        metadata: {
          model: openaiResponse.model,
          tokensUsed: openaiResponse.usage.total_tokens,
          processingTime: Date.now() - startTime
        }
      };

    } catch (error) {
      console.error('Failed to generate PCAF response:', error);
      throw error;
    }
  }

  private generateFollowUpQuestions(userQuery: string, response: string): string[] {
    const query = userQuery.toLowerCase();
    const responseText = response.toLowerCase();

    // Generate contextual follow-up questions based on the topic
    if (query.includes('data quality') || responseText.includes('option')) {
      return [
        'How do I prioritize which loans to improve first?',
        'What data is needed to move from Option 5 to Option 4?',
        'How much will data quality improvement cost?'
      ];
    }

    if (query.includes('attribution') || responseText.includes('attribution')) {
      return [
        'How do I get accurate asset values?',
        'What if the asset value is unknown?',
        'How often should attribution factors be updated?'
      ];
    }

    if (query.includes('compliance') || responseText.includes('wdqs')) {
      return [
        'How do I calculate my current WDQS?',
        'What happens if I don\'t meet the 3.0 threshold?',
        'How to prepare for PCAF audits?'
      ];
    }

    if (query.includes('emissions') || responseText.includes('calculate')) {
      return [
        'Where do I find emission factors?',
        'How to handle missing activity data?',
        'What about electric vehicles?'
      ];
    }

    // Default follow-up questions
    return [
      'How does this apply to my specific portfolio?',
      'What are the next steps to implement this?',
      'Are there any common pitfalls to avoid?'
    ];
  }

  private identifyRelevantSources(response: string): string[] {
    const sources: string[] = [];
    const responseText = response.toLowerCase();

    // Identify relevant sources based on content
    if (responseText.includes('data quality') || responseText.includes('option')) {
      sources.push('PCAF Global Standard', 'Motor Vehicle Methodology');
    }

    if (responseText.includes('attribution') || responseText.includes('outstanding')) {
      sources.push('PCAF Attribution Methodology', 'Calculation Examples');
    }

    if (responseText.includes('compliance') || responseText.includes('wdqs')) {
      sources.push('PCAF Global Standard', 'Compliance Checklist');
    }

    if (responseText.includes('emission factor') || responseText.includes('co2')) {
      sources.push('PCAF Emission Factors Database', 'Regional Factor Guidelines');
    }

    if (responseText.includes('scope 3') || responseText.includes('category 15')) {
      sources.push('GHG Protocol Scope 3 Standard', 'PCAF Implementation Guide');
    }

    if (responseText.includes('tcfd') || responseText.includes('disclosure')) {
      sources.push('TCFD Recommendations', 'PCAF-TCFD Alignment Guide');
    }

    // Ensure we always have at least one source
    if (sources.length === 0) {
      sources.push('PCAF Global Standard');
    }

    return [...new Set(sources)]; // Remove duplicates
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const openaiService = OpenAIService.getInstance();