/**
 * Narrative Context Quality Service
 * Ensures AI-generated narratives provide important context with good narration quality
 */

export interface ContextQualityMetrics {
  relevanceScore: number;        // 0-1: How relevant is the content to the user's needs
  clarityScore: number;          // 0-1: How clear and understandable is the narrative
  actionabilityScore: number;    // 0-1: How actionable are the recommendations
  accuracyScore: number;         // 0-1: How accurate is the data interpretation
  engagementScore: number;       // 0-1: How engaging is the narrative style
  completenessScore: number;     // 0-1: How complete is the context provided
  overallQuality: number;        // 0-1: Weighted average of all scores
}

export interface ContextValidationResult {
  isValid: boolean;
  qualityMetrics: ContextQualityMetrics;
  issues: Array<{
    type: 'relevance' | 'clarity' | 'accuracy' | 'completeness' | 'engagement';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
  }>;
  enhancedNarrative?: string;
}

export interface NarrativeQualityRules {
  minRelevanceScore: number;
  minClarityScore: number;
  minActionabilityScore: number;
  minAccuracyScore: number;
  minOverallQuality: number;
  maxNarrativeLength: number;
  minNarrativeLength: number;
  requiredElements: string[];
  forbiddenPhrases: string[];
  industryTermsGlossary: Record<string, string>;
}

class NarrativeContextQualityService {
  private static instance: NarrativeContextQualityService;
  private qualityRules: NarrativeQualityRules;
  private industryContext: Map<string, any> = new Map();

  constructor() {
    this.qualityRules = {
      minRelevanceScore: 0.7,
      minClarityScore: 0.8,
      minActionabilityScore: 0.75,
      minAccuracyScore: 0.9,
      minOverallQuality: 0.75,
      maxNarrativeLength: 2000,
      minNarrativeLength: 100,
      requiredElements: ['business_context', 'actionable_recommendations', 'risk_assessment'],
      forbiddenPhrases: ['might', 'could possibly', 'maybe', 'uncertain'],
      industryTermsGlossary: {
        'PCAF': 'Partnership for Carbon Accounting Financials - the global standard for measuring financed emissions',
        'WDQS': 'Weighted Data Quality Score - measures the quality of emissions data across your portfolio',
        'Box 8': 'PCAF reporting requirement for portfolio-level data quality disclosure',
        'tCO2e': 'Tonnes of carbon dioxide equivalent - the standard unit for measuring greenhouse gas emissions',
        'Attribution Factor': 'The percentage of a loan that should be attributed to financed emissions calculations',
        'Scope 1': 'Direct emissions from owned or controlled sources',
        'Scope 2': 'Indirect emissions from purchased energy',
        'Scope 3': 'All other indirect emissions in the value chain',
        'TCFD': 'Task Force on Climate-related Financial Disclosures',
        'SBTi': 'Science Based Targets initiative',
        'WACI': 'Weighted Average Carbon Intensity'
      }
    };

    this.initializeIndustryContext();
  }

  static getInstance(): NarrativeContextQualityService {
    if (!NarrativeContextQualityService.instance) {
      NarrativeContextQualityService.instance = new NarrativeContextQualityService();
    }
    return NarrativeContextQualityService.instance;
  }

  /**
   * Validate and enhance narrative quality
   */
  async validateNarrativeQuality(
    narrative: any,
    portfolioContext: any,
    bankProfile: any
  ): Promise<ContextValidationResult> {
    try {
      console.log('🔍 Validating narrative quality and context relevance...');

      // Calculate quality metrics
      const qualityMetrics = await this.calculateQualityMetrics(narrative, portfolioContext, bankProfile);
      
      // Identify issues
      const issues = this.identifyQualityIssues(narrative, qualityMetrics);
      
      // Determine if narrative meets quality standards
      const isValid = qualityMetrics.overallQuality >= this.qualityRules.minOverallQuality;
      
      // Enhance narrative if needed
      let enhancedNarrative = undefined;
      if (!isValid || issues.some(i => i.severity === 'high')) {
        enhancedNarrative = await this.enhanceNarrative(narrative, issues, portfolioContext, bankProfile);
      }

      return {
        isValid,
        qualityMetrics,
        issues,
        enhancedNarrative
      };

    } catch (error) {
      console.error('Failed to validate narrative quality:', error);
      return {
        isValid: false,
        qualityMetrics: this.getDefaultQualityMetrics(),
        issues: [{
          type: 'accuracy',
          severity: 'high',
          description: 'Failed to validate narrative quality',
          suggestion: 'Review narrative generation process'
        }]
      };
    }
  }

  /**
   * Calculate comprehensive quality metrics
   */
  private async calculateQualityMetrics(
    narrative: any,
    portfolioContext: any,
    bankProfile: any
  ): Promise<ContextQualityMetrics> {
    
    // 1. Relevance Score - How relevant is the content to the user's context
    const relevanceScore = this.calculateRelevanceScore(narrative, portfolioContext, bankProfile);
    
    // 2. Clarity Score - How clear and understandable is the narrative
    const clarityScore = this.calculateClarityScore(narrative, bankProfile);
    
    // 3. Actionability Score - How actionable are the recommendations
    const actionabilityScore = this.calculateActionabilityScore(narrative);
    
    // 4. Accuracy Score - How accurate is the data interpretation
    const accuracyScore = this.calculateAccuracyScore(narrative, portfolioContext);
    
    // 5. Engagement Score - How engaging is the narrative style
    const engagementScore = this.calculateEngagementScore(narrative, bankProfile);
    
    // 6. Completeness Score - How complete is the context provided
    const completenessScore = this.calculateCompletenessScore(narrative);

    // Calculate weighted overall quality
    const overallQuality = (
      relevanceScore * 0.25 +
      clarityScore * 0.20 +
      actionabilityScore * 0.20 +
      accuracyScore * 0.15 +
      engagementScore * 0.10 +
      completenessScore * 0.10
    );

    return {
      relevanceScore,
      clarityScore,
      actionabilityScore,
      accuracyScore,
      engagementScore,
      completenessScore,
      overallQuality
    };
  }

  /**
   * Calculate relevance score based on user context
   */
  private calculateRelevanceScore(narrative: any, portfolioContext: any, bankProfile: any): number {
    let score = 0.5; // Base score

    // Check if narrative addresses bank-specific context
    if (narrative.businessContext && narrative.businessContext.includes(bankProfile?.bankType)) {
      score += 0.2;
    }

    // Check if recommendations match bank size and capabilities
    if (narrative.actionableRecommendations) {
      const appropriateRecommendations = narrative.actionableRecommendations.filter(rec => 
        this.isRecommendationAppropriate(rec, bankProfile)
      );
      score += (appropriateRecommendations.length / narrative.actionableRecommendations.length) * 0.2;
    }

    // Check if narrative addresses current portfolio characteristics
    if (portfolioContext && narrative.keyFindings) {
      const contextualFindings = narrative.keyFindings.filter(finding =>
        this.isContextuallyRelevant(finding, portfolioContext)
      );
      score += (contextualFindings.length / narrative.keyFindings.length) * 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * Calculate clarity score based on readability and structure
   */
  private calculateClarityScore(narrative: any, bankProfile: any): number {
    let score = 0.5; // Base score

    // Check narrative structure
    if (narrative.executiveSummary && narrative.businessContext && narrative.humanizedExplanation) {
      score += 0.2;
    }

    // Check for appropriate complexity level
    const complexityLevel = this.assessComplexityLevel(narrative.humanizedExplanation || '');
    const targetComplexity = bankProfile?.experienceLevel || 'intermediate';
    
    if (this.isAppropriateComplexity(complexityLevel, targetComplexity)) {
      score += 0.2;
    }

    // Check for clear language and avoid jargon overuse
    const jargonScore = this.assessJargonUsage(narrative.humanizedExplanation || '');
    score += jargonScore * 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Calculate actionability score based on recommendation quality
   */
  private calculateActionabilityScore(narrative: any): number {
    if (!narrative.actionableRecommendations || narrative.actionableRecommendations.length === 0) {
      return 0.1;
    }

    let score = 0;
    const recommendations = narrative.actionableRecommendations;

    recommendations.forEach(rec => {
      let recScore = 0;

      // Has specific action
      if (rec.action && rec.action.length > 10) recScore += 0.2;
      
      // Has timeline
      if (rec.timeframe && rec.timeframe !== 'TBD') recScore += 0.2;
      
      // Has effort estimate
      if (rec.effort) recScore += 0.1;
      
      // Has expected outcome
      if (rec.expectedOutcome && rec.expectedOutcome.length > 20) recScore += 0.2;
      
      // Has business case
      if (rec.businessCase && rec.businessCase.length > 30) recScore += 0.3;

      score += recScore;
    });

    return Math.min(1.0, score / recommendations.length);
  }

  /**
   * Calculate accuracy score based on data consistency
   */
  private calculateAccuracyScore(narrative: any, portfolioContext: any): number {
    let score = 0.8; // Start with high base score, deduct for inaccuracies

    // Check for data consistency in key findings
    if (narrative.keyFindings && portfolioContext) {
      narrative.keyFindings.forEach(finding => {
        if (!this.isDataConsistent(finding, portfolioContext)) {
          score -= 0.1;
        }
      });
    }

    // Check for realistic recommendations
    if (narrative.actionableRecommendations) {
      narrative.actionableRecommendations.forEach(rec => {
        if (!this.isRecommendationRealistic(rec)) {
          score -= 0.05;
        }
      });
    }

    // Check for forbidden phrases that indicate uncertainty
    const uncertaintyPenalty = this.checkForUncertaintyPhrases(narrative.humanizedExplanation || '');
    score -= uncertaintyPenalty;

    return Math.max(0.1, score);
  }

  /**
   * Calculate engagement score based on narrative style
   */
  private calculateEngagementScore(narrative: any, bankProfile: any): number {
    let score = 0.5; // Base score

    const text = narrative.humanizedExplanation || '';
    
    // Check for appropriate tone
    const tone = bankProfile?.preferredTone || 'conversational';
    if (this.matchesTone(text, tone)) {
      score += 0.2;
    }

    // Check for storytelling elements
    if (this.hasStorytellingElements(text)) {
      score += 0.15;
    }

    // Check for personal relevance
    if (this.hasPersonalRelevance(text, bankProfile)) {
      score += 0.15;
    }

    // Check for concrete examples
    if (this.hasConcretExamples(text)) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * Calculate completeness score based on required elements
   */
  private calculateCompletenessScore(narrative: any): number {
    let score = 0;
    const requiredElements = this.qualityRules.requiredElements;

    requiredElements.forEach(element => {
      switch (element) {
        case 'business_context':
          if (narrative.businessContext && narrative.businessContext.length > 50) score += 1;
          break;
        case 'actionable_recommendations':
          if (narrative.actionableRecommendations && narrative.actionableRecommendations.length > 0) score += 1;
          break;
        case 'risk_assessment':
          if (narrative.riskAssessment && narrative.riskAssessment.level) score += 1;
          break;
      }
    });

    return score / requiredElements.length;
  }

  /**
   * Identify quality issues in the narrative
   */
  private identifyQualityIssues(narrative: any, metrics: ContextQualityMetrics): Array<{
    type: 'relevance' | 'clarity' | 'accuracy' | 'completeness' | 'engagement';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
  }> {
    const issues = [];

    // Relevance issues
    if (metrics.relevanceScore < 0.6) {
      issues.push({
        type: 'relevance' as const,
        severity: metrics.relevanceScore < 0.4 ? 'high' as const : 'medium' as const,
        description: 'Narrative lacks relevance to user context and bank profile',
        suggestion: 'Include more bank-specific context and appropriate recommendations'
      });
    }

    // Clarity issues
    if (metrics.clarityScore < 0.7) {
      issues.push({
        type: 'clarity' as const,
        severity: metrics.clarityScore < 0.5 ? 'high' as const : 'medium' as const,
        description: 'Narrative is unclear or too complex for target audience',
        suggestion: 'Simplify language and improve structure for better readability'
      });
    }

    // Accuracy issues
    if (metrics.accuracyScore < 0.8) {
      issues.push({
        type: 'accuracy' as const,
        severity: 'high' as const,
        description: 'Narrative contains potential inaccuracies or inconsistencies',
        suggestion: 'Verify data consistency and remove uncertain language'
      });
    }

    // Completeness issues
    if (metrics.completenessScore < 0.8) {
      issues.push({
        type: 'completeness' as const,
        severity: 'medium' as const,
        description: 'Narrative missing required elements or context',
        suggestion: 'Include all required sections: business context, recommendations, risk assessment'
      });
    }

    // Engagement issues
    if (metrics.engagementScore < 0.6) {
      issues.push({
        type: 'engagement' as const,
        severity: 'low' as const,
        description: 'Narrative lacks engagement and personal relevance',
        suggestion: 'Add storytelling elements and concrete examples relevant to the bank'
      });
    }

    return issues;
  }

  /**
   * Enhance narrative based on identified issues
   */
  private async enhanceNarrative(
    originalNarrative: any,
    issues: any[],
    portfolioContext: any,
    bankProfile: any
  ): Promise<string> {
    let enhanced = originalNarrative.humanizedExplanation || '';

    // Address relevance issues
    if (issues.some(i => i.type === 'relevance')) {
      enhanced = this.addBankSpecificContext(enhanced, bankProfile);
    }

    // Address clarity issues
    if (issues.some(i => i.type === 'clarity')) {
      enhanced = this.improveClarity(enhanced, bankProfile?.experienceLevel);
    }

    // Address accuracy issues
    if (issues.some(i => i.type === 'accuracy')) {
      enhanced = this.removeUncertainLanguage(enhanced);
    }

    // Address engagement issues
    if (issues.some(i => i.type === 'engagement')) {
      enhanced = this.addEngagementElements(enhanced, bankProfile);
    }

    return enhanced;
  }

  /**
   * Helper methods for quality assessment
   */
  private isRecommendationAppropriate(rec: any, bankProfile: any): boolean {
    const bankType = bankProfile?.bankType || 'community';
    const portfolioSize = bankProfile?.portfolioSize || 0;

    // Check if recommendation is appropriate for bank size
    if (rec.effort === 'high' && portfolioSize < 1000) return false;
    if (rec.action.includes('enterprise') && bankType === 'community') return false;
    
    return true;
  }

  private isContextuallyRelevant(finding: any, portfolioContext: any): boolean {
    // Check if finding relates to actual portfolio characteristics
    return finding.finding && finding.impact && finding.confidence > 0.5;
  }

  private assessComplexityLevel(text: string): 'simple' | 'moderate' | 'complex' {
    const sentences = text.split('.').length;
    const avgWordsPerSentence = text.split(' ').length / sentences;
    const technicalTerms = this.countTechnicalTerms(text);

    if (avgWordsPerSentence > 20 || technicalTerms > 5) return 'complex';
    if (avgWordsPerSentence > 15 || technicalTerms > 3) return 'moderate';
    return 'simple';
  }

  private isAppropriateComplexity(actual: string, target: string): boolean {
    const complexityMap = { beginner: 'simple', intermediate: 'moderate', advanced: 'complex' };
    return complexityMap[target] === actual;
  }

  private assessJargonUsage(text: string): number {
    const technicalTerms = this.countTechnicalTerms(text);
    const totalWords = text.split(' ').length;
    const jargonRatio = technicalTerms / totalWords;
    
    // Optimal jargon ratio is 2-5%
    if (jargonRatio >= 0.02 && jargonRatio <= 0.05) return 1.0;
    if (jargonRatio < 0.02) return 0.8; // Too little context
    return Math.max(0.3, 1.0 - (jargonRatio - 0.05) * 10); // Too much jargon
  }

  private countTechnicalTerms(text: string): number {
    const terms = Object.keys(this.qualityRules.industryTermsGlossary);
    return terms.filter(term => text.toLowerCase().includes(term.toLowerCase())).length;
  }

  private isDataConsistent(finding: any, portfolioContext: any): boolean {
    // Basic consistency checks - in production, this would be more sophisticated
    return finding.confidence && finding.confidence >= 0.5;
  }

  private isRecommendationRealistic(rec: any): boolean {
    // Check for unrealistic timelines or outcomes
    if (rec.timeframe === '1 day' && rec.effort === 'high') return false;
    if (rec.expectedOutcome && rec.expectedOutcome.includes('1000%')) return false;
    return true;
  }

  private checkForUncertaintyPhrases(text: string): number {
    const uncertainPhrases = this.qualityRules.forbiddenPhrases;
    const matches = uncertainPhrases.filter(phrase => 
      text.toLowerCase().includes(phrase.toLowerCase())
    ).length;
    return matches * 0.05; // 5% penalty per uncertain phrase
  }

  private matchesTone(text: string, tone: string): boolean {
    switch (tone) {
      case 'conversational':
        return text.includes('you') && !text.includes('shall') && !text.includes('pursuant');
      case 'professional':
        return !text.includes('awesome') && !text.includes('cool');
      case 'technical':
        return this.countTechnicalTerms(text) >= 3;
      default:
        return true;
    }
  }

  private hasStorytellingElements(text: string): boolean {
    const storytellingIndicators = ['like', 'imagine', 'think of', 'similar to', 'just as'];
    return storytellingIndicators.some(indicator => 
      text.toLowerCase().includes(indicator)
    );
  }

  private hasPersonalRelevance(text: string, bankProfile: any): boolean {
    const bankType = bankProfile?.bankType || '';
    return text.toLowerCase().includes(bankType.toLowerCase());
  }

  private hasConcretExamples(text: string): boolean {
    const exampleIndicators = ['for example', 'such as', '$', '%', 'like when'];
    return exampleIndicators.some(indicator => 
      text.toLowerCase().includes(indicator)
    );
  }

  private addBankSpecificContext(text: string, bankProfile: any): string {
    const bankType = bankProfile?.bankType || 'community';
    const contextPrefix = `As a ${bankType} bank, `;
    
    if (!text.toLowerCase().includes(bankType)) {
      return contextPrefix + text;
    }
    return text;
  }

  private improveClarity(text: string, experienceLevel: string = 'intermediate'): string {
    // Simplify for beginners
    if (experienceLevel === 'beginner') {
      return text
        .replace(/\b(utilize|implement)\b/g, 'use')
        .replace(/\b(facilitate)\b/g, 'help')
        .replace(/\b(optimize)\b/g, 'improve');
    }
    return text;
  }

  private removeUncertainLanguage(text: string): string {
    return text
      .replace(/\b(might|could possibly|maybe|uncertain)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private addEngagementElements(text: string, bankProfile: any): string {
    if (!this.hasStorytellingElements(text)) {
      const bankType = bankProfile?.bankType || 'community';
      const analogy = `Think of this like upgrading your ${bankType} bank's capabilities. `;
      return analogy + text;
    }
    return text;
  }

  private initializeIndustryContext(): void {
    // Initialize with banking and PCAF-specific context
    this.industryContext.set('banking_best_practices', {
      community_banks: ['relationship_focus', 'local_market_knowledge', 'personalized_service'],
      regional_banks: ['scale_advantages', 'market_agility', 'innovation_capacity'],
      credit_unions: ['member_ownership', 'cooperative_values', 'community_focus']
    });

    this.industryContext.set('pcaf_standards', {
      data_quality_scores: { 1: 'verified', 2: 'partial', 3: 'proxy', 4: 'estimated', 5: 'average' },
      compliance_thresholds: { wdqs: 3.0, box8_reporting: true },
      emission_scopes: ['scope1', 'scope2', 'scope3']
    });
  }

  private getDefaultQualityMetrics(): ContextQualityMetrics {
    return {
      relevanceScore: 0.5,
      clarityScore: 0.5,
      actionabilityScore: 0.5,
      accuracyScore: 0.5,
      engagementScore: 0.5,
      completenessScore: 0.5,
      overallQuality: 0.5
    };
  }

  /**
   * Get quality improvement suggestions
   */
  getQualityImprovementSuggestions(metrics: ContextQualityMetrics): string[] {
    const suggestions = [];

    if (metrics.relevanceScore < 0.7) {
      suggestions.push('Include more bank-specific context and market-relevant examples');
    }

    if (metrics.clarityScore < 0.7) {
      suggestions.push('Simplify language and improve narrative structure');
    }

    if (metrics.actionabilityScore < 0.7) {
      suggestions.push('Add specific timelines, effort estimates, and expected outcomes to recommendations');
    }

    if (metrics.accuracyScore < 0.8) {
      suggestions.push('Verify data consistency and remove uncertain language');
    }

    if (metrics.engagementScore < 0.6) {
      suggestions.push('Add storytelling elements and concrete examples');
    }

    return suggestions;
  }
}

export const narrativeContextQualityService = NarrativeContextQualityService.getInstance();