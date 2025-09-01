import motorVehicleDataset from '@/data/motorVehicleQADataset.json';
import { portfolioService } from './portfolioService';

export interface DatasetRAGRequest {
  query: string;
  sessionId: string;
  portfolioContext?: any;
  userRole?: 'loan_officer' | 'risk_manager' | 'executive' | 'compliance_officer';
}

export interface DatasetRAGResponse {
  response: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
  followUpQuestions: string[];
  bankingContext: {
    [key: string]: boolean;
  };
  executiveSummary?: string;
  actionItems?: string[];
}

class DatasetRAGService {
  private static instance: DatasetRAGService;
  private dataset: any;

  constructor() {
    this.dataset = motorVehicleDataset;
  }

  static getInstance(): DatasetRAGService {
    if (!DatasetRAGService.instance) {
      DatasetRAGService.instance = new DatasetRAGService();
    }
    return DatasetRAGService.instance;
  }

  async processQuery(request: DatasetRAGRequest): Promise<DatasetRAGResponse> {
    const { query, portfolioContext, userRole = 'loan_officer' } = request;
    
    // 1. Find best matching question from dataset
    const matchedQuestion = this.findBestMatch(query);
    
    if (matchedQuestion) {
      // 2. Enhance response with portfolio context
      const enhancedResponse = await this.enhanceWithPortfolioContext(
        matchedQuestion,
        portfolioContext,
        userRole
      );
      
      // 3. Customize for user role
      const roleCustomizedResponse = this.customizeForRole(enhancedResponse, userRole);
      
      return roleCustomizedResponse;
    }

    // Fallback for unmatched queries
    return this.generateFallbackResponse(query, userRole);
  }

  private findBestMatch(query: string): any {
    const lowerQuery = query.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    // Search through all categories and questions
    Object.values(this.dataset.categories).forEach((category: any) => {
      category.questions?.forEach((question: any) => {
        const score = this.calculateMatchScore(lowerQuery, question);
        if (score > highestScore && score > 0.3) { // Minimum threshold
          highestScore = score;
          bestMatch = { ...question, category: category.description, score };
        }
      });
    });

    return bestMatch;
  }

  private calculateMatchScore(query: string, question: any): number {
    const questionText = question.question.toLowerCase();
    const answerText = question.answer.toLowerCase();
    
    // Exact phrase matching (highest weight)
    const exactPhrases = this.extractKeyPhrases(questionText);
    let exactMatches = 0;
    exactPhrases.forEach(phrase => {
      if (query.includes(phrase)) exactMatches++;
    });
    
    // Keyword matching
    const queryWords = query.split(/\s+/).filter(word => word.length > 3);
    const questionWords = questionText.split(/\s+/).filter(word => word.length > 3);
    
    let keywordMatches = 0;
    queryWords.forEach(word => {
      if (questionWords.includes(word)) keywordMatches++;
    });
    
    // Banking context matching
    let contextMatches = 0;
    if (question.bankingContext) {
      const contextKeywords = Object.keys(question.bankingContext);
      contextKeywords.forEach(context => {
        if (query.includes(context.replace(/([A-Z])/g, ' $1').toLowerCase())) {
          contextMatches++;
        }
      });
    }
    
    // Calculate weighted score
    const exactWeight = 0.5;
    const keywordWeight = 0.3;
    const contextWeight = 0.2;
    
    const score = (
      (exactMatches / exactPhrases.length) * exactWeight +
      (keywordMatches / Math.max(queryWords.length, 1)) * keywordWeight +
      (contextMatches / Math.max(Object.keys(question.bankingContext || {}).length, 1)) * contextWeight
    );
    
    return score;
  }

  private extractKeyPhrases(text: string): string[] {
    // Extract important phrases for matching
    const phrases = [
      'data quality',
      'attribution factor',
      'pcaf score',
      'compliance',
      'portfolio',
      'financed emissions',
      'motor vehicle',
      'loan origination',
      'risk management'
    ];
    
    return phrases.filter(phrase => text.includes(phrase));
  }

  private async enhanceWithPortfolioContext(
    matchedQuestion: any,
    portfolioContext: any,
    userRole: string
  ): Promise<any> {
    
    let enhancedResponse = matchedQuestion.answer;
    
    if (portfolioContext) {
      // Replace placeholder variables with actual portfolio data
      const replacements = this.generatePortfolioReplacements(portfolioContext);
      
      Object.entries(replacements).forEach(([placeholder, value]) => {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        enhancedResponse = enhancedResponse.replace(regex, value);
      });
      
      // Add portfolio-specific insights
      const portfolioInsights = this.generatePortfolioInsights(portfolioContext, userRole);
      if (portfolioInsights) {
        enhancedResponse += '\n\n' + portfolioInsights;
      }
    }
    
    return {
      ...matchedQuestion,
      answer: enhancedResponse
    };
  }

  private generatePortfolioReplacements(portfolioContext: any): Record<string, string> {
    const dq = portfolioContext.dataQuality || {};
    const totalLoans = portfolioContext.totalLoans || 0;
    const totalExposure = portfolioContext.totalExposure || totalLoans * 35000; // Estimate
    
    return {
      // Portfolio metrics
      portfolio_wdqs: dq.averageScore?.toFixed(1) || '3.2',
      loan_count: totalLoans.toLocaleString(),
      total_exposure: totalExposure.toLocaleString(),
      
      // Compliance status
      compliance_status: dq.averageScore <= 3.0 ? 'COMPLIANT' : 'NEEDS IMPROVEMENT',
      compliance_status_icon: dq.averageScore <= 3.0 ? '✅' : '⚠️',
      compliance_explanation: dq.averageScore <= 3.0 
        ? 'Portfolio meets PCAF regulatory threshold of ≤3.0'
        : `Portfolio exceeds threshold by ${(dq.averageScore - 3.0).toFixed(1)} points`,
      
      // Improvement metrics
      tier1_count: Math.floor(totalLoans * 0.15).toLocaleString(),
      tier1_exposure: (totalExposure * 0.35).toLocaleString(),
      tier2_count: Math.floor(totalLoans * 0.25).toLocaleString(),
      tier2_exposure: (totalExposure * 0.40).toLocaleString(),
      tier3_count: Math.floor(totalLoans * 0.60).toLocaleString(),
      tier3_exposure: (totalExposure * 0.25).toLocaleString(),
      
      // Financial impact
      capital_impact: (totalExposure * 0.02).toLocaleString(),
      cost_per_loan: '$15',
      wdqs_improvement: '0.3 points',
      capital_savings: (totalExposure * 0.005).toLocaleString(),
      
      // Targets and benchmarks
      current_wdqs: dq.averageScore?.toFixed(1) || '3.2',
      target_wdqs: '2.8',
      percentile_ranking: this.calculatePercentileRanking(dq.averageScore),
      
      // Banking context
      avg_credit_rating: 'BBB+',
      vintage_breakdown: '65% post-2020 originations',
      geo_concentration: '45',
      concentration: '12',
      vehicle_type_concentration: '60% passenger cars, 25% SUVs, 15% trucks',
      rwa_amount: (totalExposure * 0.75).toLocaleString(),
      cecl_coverage: '1.25',
      climate_adjustment: '5'
    };
  }

  private calculatePercentileRanking(wdqs: number): string {
    if (wdqs <= 2.4) return '25th (Industry Leader)';
    if (wdqs <= 2.8) return '50th (Peer Median)';
    if (wdqs <= 3.2) return '75th (Needs Improvement)';
    return '90th (Supervisory Concern)';
  }

  private generatePortfolioInsights(portfolioContext: any, userRole: string): string {
    const dq = portfolioContext.dataQuality || {};
    const improvements = portfolioContext.improvements || {};
    
    let insights = '\n**🎯 Your Portfolio-Specific Insights:**\n\n';
    
    // Role-specific insights
    switch (userRole) {
      case 'executive':
        insights += `**Executive Summary:**\n`;
        insights += `• Strategic Position: ${dq.averageScore <= 2.5 ? 'Market Leader' : dq.averageScore <= 3.0 ? 'Competitive Parity' : 'Competitive Risk'}\n`;
        insights += `• Regulatory Status: ${dq.complianceStatus === 'compliant' ? 'Full Compliance' : 'Action Required'}\n`;
        insights += `• Investment Priority: ${improvements.option_4_to_3?.length > 100 ? 'High' : 'Medium'} (${improvements.option_4_to_3?.length || 0} loans)\n`;
        break;
        
      case 'risk_manager':
        insights += `**Risk Assessment:**\n`;
        insights += `• Portfolio Risk: ${dq.averageScore > 3.5 ? 'High' : dq.averageScore > 3.0 ? 'Medium' : 'Low'}\n`;
        insights += `• Concentration Risk: ${(dq.loansNeedingImprovement / portfolioContext.totalLoans * 100).toFixed(1)}% of portfolio needs improvement\n`;
        insights += `• Regulatory Risk: ${dq.averageScore > 3.0 ? 'Supervisory attention likely' : 'Meets expectations'}\n`;
        break;
        
      case 'compliance_officer':
        insights += `**Compliance Status:**\n`;
        insights += `• Current WDQS: ${dq.averageScore?.toFixed(1)} (Threshold: ≤3.0)\n`;
        insights += `• Examination Readiness: ${dq.averageScore <= 3.0 ? '✅ Ready' : '⚠️ Needs improvement plan'}\n`;
        insights += `• Documentation Status: ${dq.averageScore <= 3.0 ? 'Adequate' : 'Enhancement required'}\n`;
        break;
        
      default: // loan_officer
        insights += `**Operational Focus:**\n`;
        insights += `• Data Collection Priority: ${improvements.option_5_to_4?.length || 0} loans need vehicle type\n`;
        insights += `• VIN Collection Target: ${improvements.option_4_to_3?.length || 0} loans need specifications\n`;
        insights += `• Customer Outreach: ${Math.floor((improvements.option_3_to_2?.length || 0) / 4)} customers/week for mileage data\n`;
    }
    
    return insights;
  }

  private customizeForRole(response: any, userRole: string): DatasetRAGResponse {
    let customizedResponse = response.answer;
    let executiveSummary: string | undefined;
    let actionItems: string[] = [];
    
    // Add role-specific customizations
    switch (userRole) {
      case 'executive':
        executiveSummary = this.generateExecutiveSummary(response);
        actionItems = this.generateExecutiveActionItems(response);
        break;
        
      case 'risk_manager':
        actionItems = this.generateRiskActionItems(response);
        break;
        
      case 'compliance_officer':
        actionItems = this.generateComplianceActionItems(response);
        break;
        
      case 'loan_officer':
        actionItems = this.generateOperationalActionItems(response);
        break;
    }
    
    return {
      response: customizedResponse,
      confidence: response.confidence || 'high',
      sources: response.sources || [],
      followUpQuestions: response.followUp || [],
      bankingContext: response.bankingContext || {},
      executiveSummary,
      actionItems: actionItems.length > 0 ? actionItems : undefined
    };
  }

  private generateExecutiveSummary(response: any): string {
    return `**Executive Summary:** ${response.category} analysis indicates ${
      response.score > 0.8 ? 'strong strategic alignment' : 
      response.score > 0.6 ? 'moderate strategic impact' : 
      'limited strategic relevance'
    } with current business objectives. Recommended for ${
      response.bankingContext?.strategicPlanning ? 'board-level discussion' : 'management review'
    }.`;
  }

  private generateExecutiveActionItems(response: any): string[] {
    return [
      'Review strategic implications with senior leadership team',
      'Assess resource allocation requirements and ROI projections',
      'Evaluate competitive positioning and market opportunities',
      'Consider regulatory relationship and supervisory expectations'
    ];
  }

  private generateRiskActionItems(response: any): string[] {
    return [
      'Conduct risk assessment of current portfolio exposure',
      'Update risk appetite statements and tolerance levels',
      'Enhance monitoring and reporting frameworks',
      'Validate stress testing and scenario analysis capabilities'
    ];
  }

  private generateComplianceActionItems(response: any): string[] {
    return [
      'Review regulatory requirements and examination expectations',
      'Update policies and procedures documentation',
      'Assess training needs for staff and management',
      'Prepare examination readiness materials and evidence'
    ];
  }

  private generateOperationalActionItems(response: any): string[] {
    return [
      'Implement process improvements in daily operations',
      'Update system configurations and data collection procedures',
      'Train front-line staff on new requirements',
      'Monitor performance metrics and quality indicators'
    ];
  }

  private generateFallbackResponse(query: string, userRole: string): DatasetRAGResponse {
    const roleContext = {
      executive: 'strategic business implications',
      risk_manager: 'risk management considerations',
      compliance_officer: 'regulatory compliance requirements',
      loan_officer: 'operational implementation'
    };

    return {
      response: `I specialize in motor vehicle PCAF methodology with focus on ${roleContext[userRole as keyof typeof roleContext] || 'banking operations'}. 

**Available Topics:**
• **Portfolio Analysis** - Data quality assessment, risk evaluation
• **Methodology** - PCAF options, calculations, compliance requirements  
• **Strategic Advisory** - Competitive positioning, business case development
• **Operational Excellence** - System integration, process optimization

Please ask a specific question about motor vehicle PCAF methodology or your portfolio management needs.`,
      confidence: 'medium',
      sources: ['PCAF Global Standard - Motor Vehicle Asset Class'],
      followUpQuestions: [
        'What is my current portfolio data quality score?',
        'How do I calculate attribution factors?',
        'What are PCAF compliance requirements?',
        'How do I integrate PCAF into loan origination?'
      ],
      bankingContext: {
        generalGuidance: true
      }
    };
  }

  // Utility method to get dataset statistics
  getDatasetStats(): any {
    let totalQuestions = 0;
    const categoryStats: Record<string, number> = {};

    Object.entries(this.dataset.categories).forEach(([key, category]: [string, any]) => {
      const questionCount = category.questions?.length || 0;
      totalQuestions += questionCount;
      categoryStats[key] = questionCount;
    });

    return {
      totalQuestions,
      categoryStats,
      version: this.dataset.metadata.version,
      lastUpdated: this.dataset.metadata.lastUpdated
    };
  }
}

export const datasetRAGService = DatasetRAGService.getInstance();