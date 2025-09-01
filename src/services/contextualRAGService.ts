import { portfolioService } from './portfolioService';

export interface ContextualRAGRequest {
  query: string;
  sessionId: string;
  includePortfolioContext?: boolean;
  includeMethodologyContext?: boolean;
  specificLoanIds?: string[];
  analysisType?: 'general' | 'portfolio' | 'loan' | 'compliance' | 'methodology';
}

export interface ContextualRAGResponse {
  response: string;
  sources: Array<{
    title: string;
    content: string;
    similarity: number;
    type: 'platform' | 'client' | 'portfolio';
    metadata?: any;
  }>;
  confidence: number;
  followUpQuestions: string[];
  portfolioInsights?: {
    relevantLoans: any[];
    dataQualityIssues: string[];
    complianceStatus: string;
    recommendations: string[];
  };
}

class ContextualRAGService {
  private static instance: ContextualRAGService;

  static getInstance(): ContextualRAGService {
    if (!ContextualRAGService.instance) {
      ContextualRAGService.instance = new ContextualRAGService();
    }
    return ContextualRAGService.instance;
  }

  async processContextualQuery(request: ContextualRAGRequest): Promise<ContextualRAGResponse> {
    try {
      // 1. Analyze query to determine context needs
      const queryAnalysis = this.analyzeQuery(request.query);
      
      // 2. Gather portfolio context if needed
      let portfolioContext = null;
      if (request.includePortfolioContext || queryAnalysis.needsPortfolioData) {
        portfolioContext = await this.getPortfolioContext(request.specificLoanIds);
      }

      // 3. Search Platform RAG (methodology, regulations)
      const platformResults = await this.searchPlatformRAG(request.query, queryAnalysis);

      // 4. Search Client RAG (portfolio-specific data)
      const clientResults = await this.searchClientRAG(request.query, portfolioContext);

      // 5. Combine and contextualize results
      const combinedResponse = await this.synthesizeResponse({
        query: request.query,
        platformResults,
        clientResults,
        portfolioContext,
        analysisType: request.analysisType || queryAnalysis.type
      });

      return combinedResponse;
    } catch (error) {
      console.error('Contextual RAG processing failed:', error);
      throw error;
    }
  }

  private analyzeQuery(query: string): {
    type: 'general' | 'portfolio' | 'loan' | 'compliance' | 'methodology';
    needsPortfolioData: boolean;
    keywords: string[];
    intent: string;
  } {
    const lowerQuery = query.toLowerCase();
    
    // Portfolio-specific indicators
    const portfolioIndicators = [
      'my portfolio', 'our portfolio', 'this portfolio', 'portfolio analysis',
      'my loans', 'our loans', 'these loans', 'loan analysis',
      'my data', 'our data', 'current data', 'uploaded data'
    ];

    // Methodology indicators
    const methodologyIndicators = [
      'pcaf methodology', 'calculation method', 'how to calculate',
      'data quality', 'attribution factor', 'emission factor',
      'pcaf standard', 'compliance requirement'
    ];

    // Compliance indicators
    const complianceIndicators = [
      'compliance', 'tcfd', 'reporting', 'disclosure',
      'regulatory', 'standard', 'requirement'
    ];

    const needsPortfolioData = portfolioIndicators.some(indicator => 
      lowerQuery.includes(indicator)
    );

    let type: 'general' | 'portfolio' | 'loan' | 'compliance' | 'methodology' = 'general';
    
    if (needsPortfolioData) {
      type = 'portfolio';
    } else if (methodologyIndicators.some(ind => lowerQuery.includes(ind))) {
      type = 'methodology';
    } else if (complianceIndicators.some(ind => lowerQuery.includes(ind))) {
      type = 'compliance';
    }

    return {
      type,
      needsPortfolioData,
      keywords: this.extractKeywords(query),
      intent: this.determineIntent(query)
    };
  }

  private extractKeywords(query: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'how', 'what', 'where', 'when', 'why'];
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  private determineIntent(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('how to') || lowerQuery.includes('how do')) return 'instruction';
    if (lowerQuery.includes('what is') || lowerQuery.includes('what are')) return 'definition';
    if (lowerQuery.includes('analyze') || lowerQuery.includes('assessment')) return 'analysis';
    if (lowerQuery.includes('improve') || lowerQuery.includes('optimize')) return 'optimization';
    if (lowerQuery.includes('compliance') || lowerQuery.includes('requirement')) return 'compliance';
    
    return 'general';
  }

  private async getPortfolioContext(specificLoanIds?: string[]): Promise<any> {
    try {
      const { loans, summary } = await portfolioService.getPortfolioSummary();
      
      // Filter to specific loans if requested
      const relevantLoans = specificLoanIds 
        ? loans.filter(loan => specificLoanIds.includes(loan.loan_id))
        : loans;

      // Analyze portfolio characteristics
      const portfolioAnalysis = this.analyzePortfolioCharacteristics(relevantLoans);

      return {
        totalLoans: relevantLoans.length,
        portfolioSummary: summary,
        loans: relevantLoans.slice(0, 50), // Limit for context size
        analysis: portfolioAnalysis,
        dataQuality: this.assessDataQuality(relevantLoans),
        emissionsProfile: this.getEmissionsProfile(relevantLoans)
      };
    } catch (error) {
      console.warn('Could not load portfolio context:', error);
      return null;
    }
  }

  private analyzePortfolioCharacteristics(loans: any[]): any {
    const totalValue = loans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);
    const avgLoanSize = totalValue / loans.length;
    
    // Vehicle type distribution
    const vehicleTypes = loans.reduce((acc, loan) => {
      const type = loan.vehicle_data?.vehicle_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Data quality distribution
    const dataQualityDist = loans.reduce((acc, loan) => {
      const score = loan.emissions_data?.data_quality_score || 5;
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {});

    return {
      totalValue,
      avgLoanSize,
      vehicleTypes,
      dataQualityDist,
      hasEmissionsData: loans.filter(l => l.emissions_data).length,
      hasVehicleData: loans.filter(l => l.vehicle_data).length
    };
  }

  private assessDataQuality(loans: any[]): any {
    const scores = loans.map(loan => loan.emissions_data?.data_quality_score || 5);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const distribution = scores.reduce((acc, score) => {
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const poorQualityLoans = loans.filter(loan => 
      (loan.emissions_data?.data_quality_score || 5) >= 4
    );

    return {
      averageScore: avgScore,
      distribution,
      poorQualityCount: poorQualityLoans.length,
      poorQualityLoans: poorQualityLoans.slice(0, 10) // Sample for analysis
    };
  }

  private getEmissionsProfile(loans: any[]): any {
    const totalEmissions = loans.reduce((sum, loan) => 
      sum + (loan.emissions_data?.annual_emissions || 0), 0
    );
    
    const totalBalance = loans.reduce((sum, loan) => 
      sum + (loan.outstanding_balance || 0), 0
    );

    const intensity = totalBalance > 0 ? (totalEmissions / totalBalance) * 1000 : 0;

    return {
      totalEmissions,
      totalBalance,
      emissionIntensity: intensity,
      loansWithEmissions: loans.filter(l => l.emissions_data?.annual_emissions).length
    };
  }

  private async searchPlatformRAG(query: string, analysis: any): Promise<any[]> {
    // This would call your existing RAG search endpoint for platform knowledge
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/v1/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query,
          collectionType: 'methodology',
          limit: 5,
          includeMetadata: true,
          keywords: analysis.keywords
        })
      });

      if (response.ok) {
        const data = await response.json();
        return (data.data?.results || []).map((result: any) => ({
          ...result,
          type: 'platform'
        }));
      }
    } catch (error) {
      console.warn('Platform RAG search failed:', error);
    }
    
    return [];
  }

  private async searchClientRAG(query: string, portfolioContext: any): Promise<any[]> {
    if (!portfolioContext) return [];

    // Generate contextual responses based on portfolio data
    const clientResults = [];

    // Add portfolio-specific insights
    if (portfolioContext.analysis) {
      clientResults.push({
        title: 'Portfolio Overview',
        content: `Your portfolio contains ${portfolioContext.totalLoans} loans with total value of $${(portfolioContext.analysis.totalValue / 1000000).toFixed(1)}M. Average data quality score: ${portfolioContext.dataQuality.averageScore.toFixed(1)}.`,
        similarity: 0.9,
        type: 'client',
        metadata: { source: 'portfolio_analysis' }
      });
    }

    // Add data quality insights if relevant
    if (query.toLowerCase().includes('data quality') && portfolioContext.dataQuality) {
      const dq = portfolioContext.dataQuality;
      clientResults.push({
        title: 'Your Portfolio Data Quality',
        content: `${dq.poorQualityCount} loans (${((dq.poorQualityCount / portfolioContext.totalLoans) * 100).toFixed(1)}%) have poor data quality (score ≥4). Focus on improving these for better PCAF compliance.`,
        similarity: 0.95,
        type: 'client',
        metadata: { source: 'data_quality_analysis' }
      });
    }

    // Add emissions insights if relevant
    if (query.toLowerCase().includes('emission') && portfolioContext.emissionsProfile) {
      const ep = portfolioContext.emissionsProfile;
      clientResults.push({
        title: 'Your Portfolio Emissions',
        content: `Total financed emissions: ${ep.totalEmissions.toFixed(0)} tCO₂e. Emission intensity: ${ep.emissionIntensity.toFixed(2)} kg/$1k. ${ep.loansWithEmissions} of ${portfolioContext.totalLoans} loans have emission data.`,
        similarity: 0.9,
        type: 'client',
        metadata: { source: 'emissions_analysis' }
      });
    }

    return clientResults;
  }

  private async synthesizeResponse(params: {
    query: string;
    platformResults: any[];
    clientResults: any[];
    portfolioContext: any;
    analysisType: string;
  }): Promise<ContextualRAGResponse> {
    
    const { query, platformResults, clientResults, portfolioContext, analysisType } = params;
    
    // Combine platform and client knowledge
    const allSources = [...platformResults, ...clientResults];
    
    // Generate contextual response
    let response = '';
    let portfolioInsights = null;

    if (analysisType === 'portfolio' && portfolioContext) {
      response = await this.generatePortfolioSpecificResponse(query, allSources, portfolioContext);
      portfolioInsights = this.generatePortfolioInsights(portfolioContext);
    } else if (analysisType === 'methodology') {
      response = await this.generateMethodologyResponse(query, platformResults);
    } else {
      response = await this.generateGeneralResponse(query, allSources);
    }

    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(query, analysisType, portfolioContext);

    return {
      response,
      sources: allSources,
      confidence: this.calculateConfidence(allSources, portfolioContext),
      followUpQuestions,
      portfolioInsights
    };
  }

  private async generatePortfolioSpecificResponse(query: string, sources: any[], portfolioContext: any): Promise<string> {
    const dq = portfolioContext.dataQuality;
    const ep = portfolioContext.emissionsProfile;
    const analysis = portfolioContext.analysis;

    let response = `Based on your portfolio of ${portfolioContext.totalLoans} loans:\n\n`;

    if (query.toLowerCase().includes('data quality')) {
      response += `**Data Quality Assessment:**\n`;
      response += `• Average PCAF score: ${dq.averageScore.toFixed(1)} ${dq.averageScore <= 3 ? '✅ (Compliant)' : '⚠️ (Needs improvement)'}\n`;
      response += `• ${dq.poorQualityCount} loans need data quality improvements\n`;
      response += `• Focus on collecting vehicle specifications for Option 4 → 3 improvement\n\n`;
    }

    if (query.toLowerCase().includes('emission')) {
      response += `**Emissions Profile:**\n`;
      response += `• Total financed emissions: ${ep.totalEmissions.toFixed(0)} tCO₂e\n`;
      response += `• Emission intensity: ${ep.emissionIntensity.toFixed(2)} kg CO₂e/$1k ${ep.emissionIntensity <= 2.5 ? '✅ (Good)' : '⚠️ (Above target)'}\n`;
      response += `• ${ep.loansWithEmissions} of ${portfolioContext.totalLoans} loans have emission calculations\n\n`;
    }

    // Add methodology guidance from platform RAG
    const methodologySource = sources.find(s => s.type === 'platform');
    if (methodologySource) {
      response += `**PCAF Methodology Guidance:**\n${methodologySource.content}\n\n`;
    }

    return response;
  }

  private async generateMethodologyResponse(query: string, platformResults: any[]): Promise<string> {
    if (platformResults.length === 0) {
      return "I don't have specific methodology information for that query. Please try asking about PCAF data quality, attribution factors, or emission calculations.";
    }

    const topResult = platformResults[0];
    return `**PCAF Methodology:**\n\n${topResult.content}\n\nThis guidance comes from the ${topResult.metadata?.source || 'PCAF Global Standard'}.`;
  }

  private async generateGeneralResponse(query: string, allSources: any[]): Promise<string> {
    if (allSources.length === 0) {
      return "I can help you with PCAF methodology questions and portfolio analysis. Try asking about data quality, emissions calculations, or compliance requirements.";
    }

    const platformSources = allSources.filter(s => s.type === 'platform');
    const clientSources = allSources.filter(s => s.type === 'client');

    let response = '';

    if (platformSources.length > 0) {
      response += `**PCAF Guidance:**\n${platformSources[0].content}\n\n`;
    }

    if (clientSources.length > 0) {
      response += `**Your Portfolio Context:**\n${clientSources[0].content}\n\n`;
    }

    return response;
  }

  private generatePortfolioInsights(portfolioContext: any): any {
    const dq = portfolioContext.dataQuality;
    const analysis = portfolioContext.analysis;

    const recommendations = [];
    
    if (dq.averageScore > 3) {
      recommendations.push('Improve data quality by collecting vehicle specifications');
    }
    
    if (analysis.hasVehicleData < portfolioContext.totalLoans * 0.8) {
      recommendations.push('Collect missing vehicle data for better accuracy');
    }

    return {
      relevantLoans: dq.poorQualityLoans || [],
      dataQualityIssues: [
        `${dq.poorQualityCount} loans with poor data quality`,
        `Average PCAF score: ${dq.averageScore.toFixed(1)}`
      ],
      complianceStatus: dq.averageScore <= 3 ? 'Compliant' : 'Needs Improvement',
      recommendations
    };
  }

  private generateFollowUpQuestions(query: string, analysisType: string, portfolioContext: any): string[] {
    const baseQuestions = [
      'How can I improve my portfolio data quality?',
      'What are the next steps for PCAF compliance?',
      'Show me loans that need attention'
    ];

    if (analysisType === 'portfolio' && portfolioContext) {
      return [
        'How to improve data quality for my worst loans?',
        'What vehicle data should I collect next?',
        'How does my portfolio compare to benchmarks?'
      ];
    }

    if (analysisType === 'methodology') {
      return [
        'What are the PCAF data options?',
        'How to calculate attribution factors?',
        'What emission factors should I use?'
      ];
    }

    return baseQuestions;
  }

  private calculateConfidence(sources: any[], portfolioContext: any): number {
    let confidence = 0.5; // Base confidence

    if (sources.length > 0) confidence += 0.2;
    if (sources.some(s => s.type === 'platform')) confidence += 0.2;
    if (portfolioContext) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }
}

export const contextualRAGService = ContextualRAGService.getInstance();