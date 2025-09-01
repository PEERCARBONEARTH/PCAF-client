import { portfolioService } from './portfolioService';
import { responseValidator, ValidationResult } from './responseValidator';

export interface FocusedRAGRequest {
  query: string;
  sessionId: string;
  assetClass: 'motor_vehicle'; // Only motor vehicles for now
  responseType?: 'methodology' | 'portfolio_analysis' | 'data_quality' | 'calculation';
}

export interface FocusedRAGResponse {
  response: string;
  confidence: 'high' | 'medium' | 'low';
  sources: Array<{
    title: string;
    section: string;
    relevance: number;
    verified: boolean;
  }>;
  followUpQuestions: string[];
  validation?: ValidationResult;
  dataUsed?: {
    portfolioStats?: any;
    specificLoans?: any[];
    calculations?: any;
  };
}

// Focused knowledge base - Motor Vehicle PCAF only
const MOTOR_VEHICLE_KNOWLEDGE = {
  dataQuality: {
    options: {
      1: {
        name: "Real fuel consumption data",
        description: "Actual fuel consumption records from telematics or fuel cards",
        requirements: ["Real fuel consumption records", "Distance traveled data"],
        accuracy: "Highest",
        typical_use: "Fleet vehicles with telematics"
      },
      2: {
        name: "Estimated fuel consumption from mileage",
        description: "Annual mileage × fuel efficiency rating",
        requirements: ["Annual mileage", "Vehicle fuel efficiency rating"],
        accuracy: "High",
        typical_use: "Vehicles with known mileage and efficiency"
      },
      3: {
        name: "Vehicle specifications + average mileage",
        description: "Vehicle make/model/year + regional average mileage",
        requirements: ["Vehicle make", "Vehicle model", "Vehicle year", "Regional average mileage"],
        accuracy: "Medium",
        typical_use: "Most common for auto loans"
      },
      4: {
        name: "Vehicle type + average factors",
        description: "Vehicle type (car/truck/SUV) + average emission factors",
        requirements: ["Vehicle type classification", "Average emission factors"],
        accuracy: "Low-Medium",
        typical_use: "Limited vehicle information available"
      },
      5: {
        name: "Asset class average",
        description: "Motor vehicle asset class average emission factor",
        requirements: ["Outstanding loan amount only"],
        accuracy: "Lowest",
        typical_use: "No vehicle information available"
      }
    },
    scoring: {
      1: { score: 1, description: "Excellent - Real consumption data" },
      2: { score: 2, description: "Good - Mileage-based estimates" },
      3: { score: 3, description: "Fair - Vehicle specs + averages" },
      4: { score: 4, description: "Poor - Vehicle type only" },
      5: { score: 5, description: "Very Poor - Asset class average" }
    }
  },
  
  calculations: {
    attributionFactor: {
      formula: "Outstanding Amount ÷ Asset Value",
      example: "$25,000 loan ÷ $40,000 vehicle = 0.625 (62.5%)",
      notes: "Use loan amount if asset value unknown"
    },
    
    financedEmissions: {
      formula: "Attribution Factor × Annual Vehicle Emissions",
      components: {
        attribution: "Outstanding Amount ÷ Asset Value",
        emissions: "Annual Mileage × Emission Factor"
      }
    },
    
    emissionIntensity: {
      formula: "(Total Financed Emissions ÷ Total Outstanding) × 1000",
      units: "kg CO₂e per $1,000 outstanding",
      benchmark: "Target ≤ 2.5 kg/$1k for good performance"
    }
  },
  
  improvementPaths: {
    "5_to_4": {
      action: "Collect vehicle type (car, truck, SUV, motorcycle)",
      impact: "Moderate improvement in accuracy",
      effort: "Low - single data field",
      priority: "High for large loans"
    },
    "4_to_3": {
      action: "Collect vehicle make, model, year",
      impact: "Significant improvement in accuracy", 
      effort: "Medium - multiple data fields",
      priority: "High - most common improvement"
    },
    "3_to_2": {
      action: "Collect annual mileage data",
      impact: "Good improvement in accuracy",
      effort: "High - requires customer data",
      priority: "Medium - for high-value loans"
    },
    "2_to_1": {
      action: "Implement telematics or fuel tracking",
      impact: "Maximum accuracy",
      effort: "Very High - technology implementation",
      priority: "Low - only for specialized cases"
    }
  }
};

class FocusedRAGService {
  private static instance: FocusedRAGService;

  static getInstance(): FocusedRAGService {
    if (!FocusedRAGService.instance) {
      FocusedRAGService.instance = new FocusedRAGService();
    }
    return FocusedRAGService.instance;
  }

  async processQuery(request: FocusedRAGRequest): Promise<FocusedRAGResponse> {
    try {
      // 1. Analyze query intent and extract key concepts
      const queryAnalysis = this.analyzeQuery(request.query);
      
      // 2. Get portfolio context if needed
      let portfolioContext = null;
      if (queryAnalysis.needsPortfolioData) {
        portfolioContext = await this.getMotorVehiclePortfolioContext();
      }

      // 3. Generate focused response based on query type
      const response = await this.generateFocusedResponse(
        queryAnalysis,
        portfolioContext,
        request.responseType
      );

      // 4. Validate response for accuracy and confidence
      const validation = responseValidator.validateResponse(
        response.response,
        request.query,
        response.sources
      );

      // 5. Clean response if validation issues found
      if (!validation.isValid || validation.confidence === 'low') {
        if (validation.issues.length > 2) {
          // Too many issues - use fallback response
          return {
            ...response,
            response: responseValidator.generateFallbackResponse(request.query),
            confidence: 'medium',
            validation,
            sources: [
              { title: 'PCAF Global Standard', section: 'Motor Vehicle Methodology', relevance: 1.0, verified: true }
            ]
          };
        } else {
          // Clean the response
          response.response = responseValidator.cleanResponse(response.response, validation);
          response.confidence = validation.confidence;
        }
      }

      response.validation = validation;
      return response;
    } catch (error) {
      console.error('Focused RAG processing failed:', error);
      return this.getErrorResponse();
    }
  }

  private analyzeQuery(query: string): {
    intent: 'data_quality' | 'calculation' | 'improvement' | 'methodology' | 'portfolio_status';
    needsPortfolioData: boolean;
    keywords: string[];
    confidence: number;
  } {
    const lowerQuery = query.toLowerCase();
    
    // High-confidence intent detection
    if (lowerQuery.includes('improve') && (lowerQuery.includes('data quality') || lowerQuery.includes('portfolio'))) {
      return {
        intent: 'improvement',
        needsPortfolioData: true,
        keywords: ['improve', 'data quality', 'portfolio'],
        confidence: 0.9
      };
    }
    
    if (lowerQuery.includes('calculate') || lowerQuery.includes('attribution') || lowerQuery.includes('emission')) {
      return {
        intent: 'calculation',
        needsPortfolioData: lowerQuery.includes('my') || lowerQuery.includes('portfolio'),
        keywords: ['calculate', 'attribution', 'emission'],
        confidence: 0.8
      };
    }
    
    if (lowerQuery.includes('data quality') || lowerQuery.includes('pcaf score') || lowerQuery.includes('option')) {
      return {
        intent: 'data_quality',
        needsPortfolioData: lowerQuery.includes('my') || lowerQuery.includes('portfolio'),
        keywords: ['data quality', 'pcaf', 'option'],
        confidence: 0.8
      };
    }

    // Default to methodology with lower confidence
    return {
      intent: 'methodology',
      needsPortfolioData: false,
      keywords: this.extractKeywords(query),
      confidence: 0.6
    };
  }

  private extractKeywords(query: string): string[] {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'how', 'what', 'where', 'when', 'why', 'my', 'our'];
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5);
  }

  private async getMotorVehiclePortfolioContext(): Promise<any> {
    try {
      const { loans, summary } = await portfolioService.getPortfolioSummary();
      
      // Filter only motor vehicle loans and analyze
      const motorVehicleLoans = loans.filter(loan => 
        loan.asset_class === 'motor_vehicle' || 
        loan.vehicle_data || 
        !loan.asset_class // Assume motor vehicle if not specified
      );

      if (motorVehicleLoans.length === 0) {
        return null;
      }

      // Calculate focused metrics
      const dataQualityAnalysis = this.analyzeDataQuality(motorVehicleLoans);
      const improvementOpportunities = this.identifyImprovements(motorVehicleLoans);
      
      return {
        totalLoans: motorVehicleLoans.length,
        dataQuality: dataQualityAnalysis,
        improvements: improvementOpportunities,
        portfolioValue: motorVehicleLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0)
      };
    } catch (error) {
      console.warn('Could not load portfolio context:', error);
      return null;
    }
  }

  private analyzeDataQuality(loans: any[]): any {
    const qualityDistribution = loans.reduce((acc, loan) => {
      const score = loan.emissions_data?.data_quality_score || 5;
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const totalLoans = loans.length;
    const avgScore = loans.reduce((sum, loan) => 
      sum + (loan.emissions_data?.data_quality_score || 5), 0) / totalLoans;

    const complianceStatus = avgScore <= 3.0 ? 'compliant' : 'needs_improvement';
    
    return {
      averageScore: Math.round(avgScore * 10) / 10,
      distribution: qualityDistribution,
      totalLoans,
      complianceStatus,
      loansNeedingImprovement: loans.filter(l => (l.emissions_data?.data_quality_score || 5) >= 4).length
    };
  }

  private identifyImprovements(loans: any[]): any {
    const improvements = {
      option_5_to_4: [],
      option_4_to_3: [],
      option_3_to_2: [],
      missing_vehicle_data: []
    };

    loans.forEach(loan => {
      const score = loan.emissions_data?.data_quality_score || 5;
      const hasVehicleData = loan.vehicle_data && 
        (loan.vehicle_data.make || loan.vehicle_data.model || loan.vehicle_data.year);

      if (score === 5) {
        improvements.option_5_to_4.push(loan.loan_id);
      } else if (score === 4) {
        improvements.option_4_to_3.push(loan.loan_id);
      } else if (score === 3) {
        improvements.option_3_to_2.push(loan.loan_id);
      }

      if (!hasVehicleData) {
        improvements.missing_vehicle_data.push(loan.loan_id);
      }
    });

    return improvements;
  }

  private async generateFocusedResponse(
    analysis: any,
    portfolioContext: any,
    responseType?: string
  ): Promise<FocusedRAGResponse> {
    
    if (analysis.intent === 'improvement' && portfolioContext) {
      return this.generateImprovementResponse(portfolioContext);
    }
    
    if (analysis.intent === 'data_quality') {
      return this.generateDataQualityResponse(portfolioContext);
    }
    
    if (analysis.intent === 'calculation') {
      return this.generateCalculationResponse(portfolioContext);
    }

    // Default methodology response
    return this.generateMethodologyResponse(analysis.keywords);
  }

  private generateImprovementResponse(portfolioContext: any): FocusedRAGResponse {
    const dq = portfolioContext.dataQuality;
    const improvements = portfolioContext.improvements;
    
    let response = `**Your Motor Vehicle Portfolio Data Quality**\n\n`;
    
    // Current status
    response += `📊 **Current Status:**\n`;
    response += `• ${portfolioContext.totalLoans} motor vehicle loans\n`;
    response += `• Average PCAF score: ${dq.averageScore} ${dq.complianceStatus === 'compliant' ? '✅ (Compliant)' : '⚠️ (Needs Improvement)'}\n`;
    response += `• ${dq.loansNeedingImprovement} loans need data quality improvements\n\n`;

    // Specific improvement actions
    response += `🎯 **Recommended Actions (Prioritized):**\n\n`;
    
    if (improvements.option_4_to_3.length > 0) {
      response += `**1. Collect Vehicle Specifications (${improvements.option_4_to_3.length} loans)**\n`;
      response += `• Add: Vehicle make, model, year\n`;
      response += `• Impact: Moves from PCAF Option 4 → 3\n`;
      response += `• Effort: Medium (3 data fields per loan)\n`;
      response += `• Priority: HIGH - Most common improvement\n\n`;
    }

    if (improvements.option_5_to_4.length > 0) {
      response += `**2. Add Vehicle Type Classification (${improvements.option_5_to_4.length} loans)**\n`;
      response += `• Add: Vehicle type (car, truck, SUV)\n`;
      response += `• Impact: Moves from PCAF Option 5 → 4\n`;
      response += `• Effort: Low (1 data field per loan)\n`;
      response += `• Priority: HIGH - Quick wins\n\n`;
    }

    if (improvements.option_3_to_2.length > 0) {
      response += `**3. Collect Annual Mileage (${improvements.option_3_to_2.length} loans)**\n`;
      response += `• Add: Annual mileage driven\n`;
      response += `• Impact: Moves from PCAF Option 3 → 2\n`;
      response += `• Effort: High (requires customer data)\n`;
      response += `• Priority: MEDIUM - For high-value loans\n\n`;
    }

    return {
      response,
      confidence: 'high',
      sources: [
        { title: 'Your Portfolio Analysis', section: 'Data Quality Assessment', relevance: 1.0, verified: true },
        { title: 'PCAF Motor Vehicle Methodology', section: 'Data Quality Options', relevance: 0.9, verified: true }
      ],
      followUpQuestions: [
        'Which loans should I prioritize for data collection?',
        'How do I collect vehicle specifications efficiently?',
        'What is the ROI of improving from Option 4 to 3?'
      ],
      dataUsed: {
        portfolioStats: dq,
        specificLoans: improvements
      }
    };
  }

  private generateDataQualityResponse(portfolioContext: any): FocusedRAGResponse {
    const knowledge = MOTOR_VEHICLE_KNOWLEDGE.dataQuality;
    
    let response = `**PCAF Data Quality Options for Motor Vehicles**\n\n`;
    
    Object.entries(knowledge.options).forEach(([option, details]) => {
      const scoring = knowledge.scoring[option as keyof typeof knowledge.scoring];
      response += `**Option ${option}: ${details.name}** (Score: ${scoring.score})\n`;
      response += `• ${details.description}\n`;
      response += `• Requirements: ${details.requirements.join(', ')}\n`;
      response += `• Accuracy: ${details.accuracy}\n`;
      response += `• Typical Use: ${details.typical_use}\n\n`;
    });

    if (portfolioContext) {
      const dq = portfolioContext.dataQuality;
      response += `**Your Portfolio Status:**\n`;
      response += `• Average Score: ${dq.averageScore}\n`;
      response += `• Distribution: ${Object.entries(dq.distribution).map(([score, count]) => 
        `Option ${score}: ${count} loans`).join(', ')}\n`;
    }

    return {
      response,
      confidence: 'high',
      sources: [
        { title: 'PCAF Global Standard', section: 'Motor Vehicle Data Quality', relevance: 1.0, verified: true }
      ],
      followUpQuestions: [
        'How do I move from Option 5 to Option 4?',
        'What vehicle data should I collect first?',
        'How does data quality affect my PCAF compliance?'
      ]
    };
  }

  private generateCalculationResponse(portfolioContext: any): FocusedRAGResponse {
    const calcs = MOTOR_VEHICLE_KNOWLEDGE.calculations;
    
    let response = `**PCAF Motor Vehicle Calculations**\n\n`;
    
    response += `**Attribution Factor:**\n`;
    response += `• Formula: ${calcs.attributionFactor.formula}\n`;
    response += `• Example: ${calcs.attributionFactor.example}\n`;
    response += `• Note: ${calcs.attributionFactor.notes}\n\n`;
    
    response += `**Financed Emissions:**\n`;
    response += `• Formula: ${calcs.financedEmissions.formula}\n`;
    response += `• Components:\n`;
    response += `  - Attribution: ${calcs.financedEmissions.components.attribution}\n`;
    response += `  - Emissions: ${calcs.financedEmissions.components.emissions}\n\n`;
    
    response += `**Emission Intensity:**\n`;
    response += `• Formula: ${calcs.emissionIntensity.formula}\n`;
    response += `• Units: ${calcs.emissionIntensity.units}\n`;
    response += `• Benchmark: ${calcs.emissionIntensity.benchmark}\n`;

    return {
      response,
      confidence: 'high',
      sources: [
        { title: 'PCAF Global Standard', section: 'Motor Vehicle Calculations', relevance: 1.0, verified: true }
      ],
      followUpQuestions: [
        'How do I calculate attribution factors for my loans?',
        'What emission factors should I use?',
        'How do I handle missing asset values?'
      ]
    };
  }

  private generateMethodologyResponse(keywords: string[]): FocusedRAGResponse {
    return {
      response: `**PCAF Motor Vehicle Methodology**\n\nI can help you with specific motor vehicle PCAF topics:\n\n• **Data Quality**: Understanding PCAF Options 1-5\n• **Calculations**: Attribution factors and financed emissions\n• **Portfolio Analysis**: Assessing your loan data quality\n• **Improvements**: Moving up the PCAF data hierarchy\n\nPlease ask a more specific question about motor vehicle financed emissions.`,
      confidence: 'medium',
      sources: [
        { title: 'PCAF Global Standard', section: 'Motor Vehicle Asset Class', relevance: 0.8, verified: true }
      ],
      followUpQuestions: [
        'How do PCAF data quality options work?',
        'How do I calculate financed emissions?',
        'How can I improve my portfolio data quality?'
      ]
    };
  }

  private getErrorResponse(): FocusedRAGResponse {
    return {
      response: 'I apologize, but I encountered an error processing your question. Please try asking about PCAF motor vehicle methodology, data quality, or calculations.',
      confidence: 'low',
      sources: [],
      followUpQuestions: [
        'What are PCAF data quality options?',
        'How do I calculate attribution factors?',
        'How can I improve my data quality?'
      ]
    };
  }
}

export const focusedRAGService = FocusedRAGService.getInstance();