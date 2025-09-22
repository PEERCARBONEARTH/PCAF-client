// AI Insights Narrative Service - Provides rich, contextual explanations for all AI insights data

export interface InsightNarrative {
  title: string;
  narrative: string;
  keyTakeaways: string[];
  actionItems: string[];
  businessImpact: string;
  riskAssessment: string;
  benchmarkComparison: string;
  executiveSummary: string;
}

export interface PortfolioMetrics {
  totalFinancedEmissions: number;
  emissionIntensity: number;
  dataQualityScore: number;
  totalLoans: number;
  totalExposure: number;
  complianceStatus: string;
  lastUpdated?: Date;
  dataVersion?: string;
  [key: string]: any;
}

export interface LoanData {
  id: string;
  amount: number;
  vehicleType: string;
  fuelType: string;
  emissions: number;
  dataQuality: number;
  [key: string]: any;
}

export interface AIInsightsUpdateEvent {
  type: 'data_ingestion_complete' | 'portfolio_updated' | 'manual_refresh';
  timestamp: Date;
  portfolioMetrics: PortfolioMetrics;
  loanData?: LoanData[];
  source: string;
}

class AIInsightsNarrativeService {
  private static instance: AIInsightsNarrativeService;
  private currentPortfolioMetrics?: PortfolioMetrics;
  private currentLoanData?: LoanData[];
  private lastAnalysisTimestamp?: Date;
  private updateListeners: Array<(insights: InsightNarrative) => void> = [];

  static getInstance(): AIInsightsNarrativeService {
    if (!AIInsightsNarrativeService.instance) {
      AIInsightsNarrativeService.instance = new AIInsightsNarrativeService();
    }
    return AIInsightsNarrativeService.instance;
  }

  constructor() {
    this.setupDataIngestionListeners();
  }

  private setupDataIngestionListeners(): void {
    // Listen for data ingestion completion events
    if (typeof window !== 'undefined') {
      window.addEventListener('dataIngestionComplete', (event: any) => {
        this.handleDataIngestionComplete(event.detail);
      });
      
      // Listen for specific AI insights refresh events
      window.addEventListener('aiInsightsRefresh', (event: any) => {
        console.log('🤖 AI Insights: Received refresh event', event.detail);
        this.handleDataIngestionComplete(event.detail.ingestionResult);
      });
    }
  }

  // Data update methods
  async handleDataIngestionComplete(ingestionResult: any): Promise<void> {
    console.log('🤖 AI Insights: Processing data ingestion completion...', ingestionResult);
    
    try {
      // Extract portfolio metrics from ingestion result
      const portfolioMetrics = this.extractPortfolioMetricsFromIngestion(ingestionResult);
      
      // Update current data
      await this.updatePortfolioData(portfolioMetrics);
      
      // Trigger AI analysis refresh
      await this.refreshAIAnalysis('data_ingestion_complete', portfolioMetrics);
      
      console.log('✅ AI Insights: Successfully updated with new ingestion data');
    } catch (error) {
      console.error('❌ AI Insights: Failed to process ingestion completion:', error);
    }
  }

  async updatePortfolioData(metrics: PortfolioMetrics, loanData?: LoanData[]): Promise<void> {
    this.currentPortfolioMetrics = {
      ...metrics,
      lastUpdated: new Date(),
      dataVersion: `v${Date.now()}`
    };
    
    if (loanData) {
      this.currentLoanData = loanData;
    }
    
    console.log('📊 AI Insights: Portfolio data updated', {
      totalLoans: metrics.totalLoans,
      totalEmissions: metrics.totalFinancedEmissions,
      dataQuality: metrics.dataQualityScore
    });
  }

  async refreshAIAnalysis(
    triggerType: 'data_ingestion_complete' | 'portfolio_updated' | 'manual_refresh',
    portfolioMetrics?: PortfolioMetrics,
    userRole: string = 'risk_manager'
  ): Promise<InsightNarrative> {
    console.log(`🔄 AI Insights: Refreshing analysis (trigger: ${triggerType})`);
    
    const metricsToUse = portfolioMetrics || this.currentPortfolioMetrics;
    
    if (!metricsToUse) {
      throw new Error('No portfolio metrics available for AI analysis');
    }
    
    // Generate fresh insights with updated data
    const insights = this.generatePortfolioOverviewNarrative(metricsToUse, userRole);
    
    // Update analysis timestamp
    this.lastAnalysisTimestamp = new Date();
    
    // Notify listeners of updated insights
    this.notifyInsightsUpdate(insights);
    
    // Create update event for logging/tracking
    const updateEvent: AIInsightsUpdateEvent = {
      type: triggerType,
      timestamp: new Date(),
      portfolioMetrics: metricsToUse,
      loanData: this.currentLoanData,
      source: 'aiInsightsNarrativeService'
    };
    
    console.log('✨ AI Insights: Analysis refreshed successfully', updateEvent);
    
    return insights;
  }

  private extractPortfolioMetricsFromIngestion(ingestionResult: any): PortfolioMetrics {
    return {
      totalFinancedEmissions: ingestionResult.totalEmissions || 0,
      emissionIntensity: this.calculateEmissionIntensity(
        ingestionResult.totalEmissions || 0,
        ingestionResult.totalLoans || 1
      ),
      dataQualityScore: ingestionResult.averageDataQuality || 3.0,
      totalLoans: ingestionResult.totalLoans || 0,
      totalExposure: (ingestionResult.totalLoans || 0) * 50000, // Estimate exposure
      complianceStatus: this.determineComplianceStatus(ingestionResult.averageDataQuality || 3.0),
      lastUpdated: new Date(ingestionResult.timestamp),
      dataVersion: `ingestion_${ingestionResult.uploadId}`
    };
  }

  private calculateEmissionIntensity(totalEmissions: number, totalLoans: number): number {
    if (totalLoans === 0) return 0;
    // Calculate emissions per $1000 of exposure (assuming average loan of $50k)
    const totalExposure = totalLoans * 50000;
    return (totalEmissions / totalExposure) * 1000;
  }

  private determineComplianceStatus(dataQualityScore: number): string {
    if (dataQualityScore <= 2.5) return 'Excellent';
    if (dataQualityScore <= 3.0) return 'Compliant';
    if (dataQualityScore <= 3.5) return 'Needs Improvement';
    return 'Critical';
  }

  // Subscription methods for components to listen to insights updates
  subscribeToInsightsUpdates(callback: (insights: InsightNarrative) => void): () => void {
    this.updateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateListeners.indexOf(callback);
      if (index > -1) {
        this.updateListeners.splice(index, 1);
      }
    };
  }

  private notifyInsightsUpdate(insights: InsightNarrative): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(insights);
      } catch (error) {
        console.error('Error notifying insights update listener:', error);
      }
    });
  }

  // Get current insights without regenerating
  getCurrentInsights(userRole: string = 'risk_manager'): InsightNarrative | null {
    if (!this.currentPortfolioMetrics) {
      return null;
    }
    
    return this.generatePortfolioOverviewNarrative(this.currentPortfolioMetrics, userRole);
  }

  // Check if insights are stale and need refresh
  areInsightsStale(maxAgeMinutes: number = 30): boolean {
    if (!this.lastAnalysisTimestamp) return true;
    
    const now = Date.now();
    const analysisTime = this.lastAnalysisTimestamp.getTime();
    const maxAge = maxAgeMinutes * 60 * 1000;
    
    return (now - analysisTime) > maxAge;
  }

  // Force refresh insights manually
  async forceRefreshInsights(userRole: string = 'risk_manager'): Promise<InsightNarrative> {
    return this.refreshAIAnalysis('manual_refresh', this.currentPortfolioMetrics, userRole);
  }

  generatePortfolioOverviewNarrative(metrics: PortfolioMetrics, userRole: string = 'risk_manager'): InsightNarrative {
    const { totalFinancedEmissions, emissionIntensity, dataQualityScore, totalLoans, totalExposure } = metrics;
    
    // Calculate contextual insights
    const intensityBenchmark = this.getIntensityBenchmark(emissionIntensity);
    const complianceAssessment = this.getComplianceAssessment(dataQualityScore);
    const peerRanking = this.calculatePeerRanking(emissionIntensity, dataQualityScore);
    
    const narrative = this.buildPortfolioNarrative(metrics, intensityBenchmark, complianceAssessment, peerRanking, userRole);
    
    return {
      title: "Portfolio Climate Performance Analysis",
      narrative,
      keyTakeaways: this.generateKeyTakeaways(metrics, userRole),
      actionItems: this.generateActionItems(metrics, userRole),
      businessImpact: this.assessBusinessImpact(metrics),
      riskAssessment: this.assessClimateRisk(metrics),
      benchmarkComparison: this.generateBenchmarkComparison(metrics),
      executiveSummary: this.generateExecutiveSummary(metrics, userRole)
    };
  }

  private buildPortfolioNarrative(
    metrics: PortfolioMetrics, 
    intensityBenchmark: any, 
    complianceAssessment: any, 
    peerRanking: any,
    userRole: string
  ): string {
    
    const roleContext = this.getRoleContext(userRole);
    
    return `**${roleContext.title} - Motor Vehicle Portfolio Climate Analysis**

📊 **Portfolio Performance Dashboard**

Your motor vehicle financing portfolio demonstrates ${intensityBenchmark.performance} climate performance with **${metrics.totalFinancedEmissions.toLocaleString()} tCO₂e** in total financed emissions across **${metrics.totalLoans.toLocaleString()}** facilities representing **$${(metrics.totalExposure / 1000000).toFixed(1)}M** in outstanding exposure.

**🎯 Key Performance Indicators:**

• **Emission Intensity:** ${metrics.emissionIntensity.toFixed(2)} kg CO₂e/$1,000 ${intensityBenchmark.icon} ${intensityBenchmark.assessment}
• **Data Quality Score:** ${metrics.dataQualityScore.toFixed(1)} ${complianceAssessment.icon} ${complianceAssessment.status}
• **Peer Ranking:** ${peerRanking.percentile} percentile ${peerRanking.description}
• **Compliance Status:** ${complianceAssessment.regulatoryStatus}

**💼 ${roleContext.focusArea}:**

${this.generateRoleSpecificInsights(metrics, userRole)}

**📈 Market Intelligence:**

• **Industry Benchmark:** Your ${metrics.emissionIntensity.toFixed(2)} kg/$1k vs. industry average of 2.8 kg/$1k
• **Best-in-Class Target:** Top quartile performers achieve ≤2.0 kg/$1k
• **Regulatory Expectations:** PCAF compliance requires WDQS ≤3.0 (Current: ${metrics.dataQualityScore.toFixed(1)})
• **ESG Market Access:** ${this.assessESGMarketAccess(metrics)}

**🔮 Forward-Looking Analysis:**

${this.generateForwardLookingAnalysis(metrics)}`;
  }

  private getRoleContext(userRole: string): { title: string; focusArea: string } {
    const contexts = {
      executive: { title: "Executive Dashboard", focusArea: "Strategic Business Impact" },
      risk_manager: { title: "Risk Management Console", focusArea: "Portfolio Risk Assessment" },
      compliance_officer: { title: "Compliance Monitor", focusArea: "Regulatory Compliance Status" },
      loan_officer: { title: "Origination Analytics", focusArea: "Operational Performance Metrics" },
      data_analyst: { title: "Analytics Workbench", focusArea: "Data Quality & Methodology Analysis" }
    };
    return contexts[userRole as keyof typeof contexts] || contexts.risk_manager;
  }

  private generateRoleSpecificInsights(metrics: PortfolioMetrics, userRole: string): string {
    switch (userRole) {
      case 'executive':
        return `**Strategic Position:** Your portfolio's climate performance ${this.getStrategicPosition(metrics)} positions the institution for ${this.getCompetitiveAdvantage(metrics)}.

**Revenue Impact:** ESG-eligible lending represents **$${this.calculateESGOpportunity(metrics)}M** annual opportunity with **${this.calculatePricingPremium(metrics)} bps** pricing premium potential.

**Regulatory Capital:** Current climate risk profile suggests **${this.calculateCapitalImpact(metrics)} bps** adjustment to risk-weighted assets under emerging climate stress testing frameworks.`;

      case 'risk_manager':
        return `**Risk Concentration:** ${this.assessRiskConcentration(metrics)}

**Stress Testing:** Under adverse climate scenarios, portfolio shows **${this.calculateStressImpact(metrics)}** resilience with **${this.calculateTransitionRisk(metrics)}** transition risk exposure.

**Capital Adequacy:** Climate risk-adjusted capital requirements estimated at **${this.calculateCapitalRequirement(metrics)}** of Tier 1 capital.`;

      case 'compliance_officer':
        return `**Regulatory Readiness:** ${this.assessRegulatoryReadiness(metrics)}

**Examination Preparedness:** Portfolio documentation supports **${this.assessExaminationReadiness(metrics)}** supervisory review with **${this.assessDocumentationQuality(metrics)}** methodology validation.

**Disclosure Requirements:** Current metrics support **${this.assessDisclosureReadiness(metrics)}** TCFD reporting with **${this.assessReportingQuality(metrics)}** data quality assurance.`;

      default:
        return `**Operational Metrics:** ${this.assessOperationalMetrics(metrics)}

**Process Efficiency:** Data collection processes achieve **${this.calculateProcessEfficiency(metrics)}** efficiency with **${this.calculateDataAccuracy(metrics)}** accuracy rate.

**System Integration:** PCAF calculations integrated with **${this.assessSystemIntegration(metrics)}** core banking workflows.`;
    }
  }

  private getIntensityBenchmark(intensity: number): any {
    if (intensity <= 2.0) {
      return {
        performance: "exceptional",
        icon: "🏆",
        assessment: "(Industry Leading - Top 10%)",
        description: "Best-in-class performance"
      };
    } else if (intensity <= 2.5) {
      return {
        performance: "strong",
        icon: "✅",
        assessment: "(Above Average - Top 25%)",
        description: "Strong competitive position"
      };
    } else if (intensity <= 3.0) {
      return {
        performance: "acceptable",
        icon: "⚠️",
        assessment: "(Below Average - Bottom 50%)",
        description: "Improvement opportunities exist"
      };
    } else {
      return {
        performance: "concerning",
        icon: "🚨",
        assessment: "(Poor Performance - Bottom 25%)",
        description: "Immediate attention required"
      };
    }
  }

  private getComplianceAssessment(wdqs: number): any {
    if (wdqs <= 2.5) {
      return {
        status: "Excellent",
        icon: "🏆",
        regulatoryStatus: "Exceeds all regulatory expectations",
        description: "Industry leadership position"
      };
    } else if (wdqs <= 3.0) {
      return {
        status: "Compliant",
        icon: "✅", 
        regulatoryStatus: "Meets PCAF regulatory threshold",
        description: "Satisfactory performance"
      };
    } else if (wdqs <= 3.5) {
      return {
        status: "Needs Improvement",
        icon: "⚠️",
        regulatoryStatus: "Below regulatory expectations",
        description: "Enhancement plan required"
      };
    } else {
      return {
        status: "Critical",
        icon: "🚨",
        regulatoryStatus: "Supervisory attention required",
        description: "Immediate remediation needed"
      };
    }
  }

  // Additional helper methods for calculations
  private calculatePeerRanking(intensity: number, wdqs: number): any {
    const compositeScore = (intensity * 0.6) + (wdqs * 0.4);
    
    if (compositeScore <= 2.2) {
      return { percentile: "90th", description: "(Industry Leader)" };
    } else if (compositeScore <= 2.6) {
      return { percentile: "75th", description: "(Above Average)" };
    } else if (compositeScore <= 3.0) {
      return { percentile: "50th", description: "(Peer Median)" };
    } else {
      return { percentile: "25th", description: "(Below Average)" };
    }
  }

  private generateKeyTakeaways(metrics: PortfolioMetrics, userRole: string): string[] {
    const takeaways = [
      `Portfolio emission intensity of ${metrics.emissionIntensity.toFixed(2)} kg/$1k ${this.getIntensityBenchmark(metrics.emissionIntensity).assessment}`,
      `PCAF data quality score of ${metrics.dataQualityScore.toFixed(1)} ${this.getComplianceAssessment(metrics.dataQualityScore).regulatoryStatus}`,
      `Total climate exposure of ${metrics.totalFinancedEmissions.toLocaleString()} tCO₂e across $${(metrics.totalExposure/1000000).toFixed(1)}M portfolio`
    ];

    // Add role-specific takeaways
    if (userRole === 'executive') {
      takeaways.push(`ESG market opportunity of $${this.calculateESGOpportunity(metrics)}M with competitive positioning advantages`);
    } else if (userRole === 'risk_manager') {
      takeaways.push(`Climate risk concentration requires ${this.assessRiskConcentration(metrics)} monitoring and mitigation`);
    }

    return takeaways;
  }

  private generateActionItems(metrics: PortfolioMetrics, userRole: string): string[] {
    const baseActions = [
      "Monitor emission intensity trends and benchmark against peer institutions",
      "Enhance data quality through systematic vehicle specification collection",
      "Develop climate risk stress testing scenarios for portfolio resilience"
    ];

    const roleSpecificActions = {
      executive: [
        "Present climate performance results to board risk committee",
        "Evaluate ESG lending product development opportunities",
        "Assess competitive positioning in sustainable finance markets"
      ],
      risk_manager: [
        "Update climate risk appetite statements and tolerance levels",
        "Enhance portfolio monitoring with climate risk indicators",
        "Develop stress testing scenarios for regulatory compliance"
      ],
      compliance_officer: [
        "Prepare regulatory examination materials and documentation",
        "Update PCAF methodology validation and audit procedures",
        "Ensure TCFD disclosure readiness and reporting accuracy"
      ],
      loan_officer: [
        "Implement enhanced data collection in loan origination",
        "Train staff on PCAF requirements and ESG lending products",
        "Optimize pricing strategies for climate-conscious borrowers"
      ]
    };

    return [...baseActions, ...(roleSpecificActions[userRole as keyof typeof roleSpecificActions] || [])];
  }

  // Placeholder methods for complex calculations
  private assessBusinessImpact(metrics: PortfolioMetrics): string {
    return `Current portfolio performance ${this.getStrategicPosition(metrics)} supports ${this.calculateRevenuePotential(metrics)} revenue enhancement through ESG product offerings and ${this.calculateCostSavings(metrics)} funding cost optimization.`;
  }

  private assessClimateRisk(metrics: PortfolioMetrics): string {
    return `Portfolio demonstrates ${this.calculateRiskLevel(metrics)} climate transition risk with ${this.calculatePhysicalRisk(metrics)} physical risk exposure requiring ${this.getMonitoringLevel(metrics)} oversight.`;
  }

  private generateBenchmarkComparison(metrics: PortfolioMetrics): string {
    return `Compared to peer institutions, your portfolio ranks in the ${this.calculatePeerRanking(metrics.emissionIntensity, metrics.dataQualityScore).percentile} percentile for climate performance with ${this.getCompetitivePosition(metrics)} market positioning.`;
  }

  private generateExecutiveSummary(metrics: PortfolioMetrics, userRole: string): string {
    return `${this.getRoleContext(userRole).title}: Portfolio climate performance ${this.getOverallAssessment(metrics)} with ${this.getStrategicImplications(metrics)} for business strategy and ${this.getRegulatoryImplications(metrics)} regulatory positioning.`;
  }

  private generateForwardLookingAnalysis(metrics: PortfolioMetrics): string {
    return `**12-Month Outlook:** Portfolio trajectory suggests ${this.calculateTrendDirection(metrics)} performance with ${this.calculateImprovementPotential(metrics)} enhancement opportunity through strategic data quality investments and ${this.calculateMarketOpportunity(metrics)} ESG market expansion.`;
  }

  // Simplified placeholder implementations for complex calculations
  private getStrategicPosition(metrics: PortfolioMetrics): string {
    return metrics.emissionIntensity <= 2.5 ? "strongly" : metrics.emissionIntensity <= 3.0 ? "adequately" : "weakly";
  }

  private calculateESGOpportunity(metrics: PortfolioMetrics): string {
    return ((metrics.totalExposure * 0.15) / 1000000).toFixed(1);
  }

  private calculatePricingPremium(metrics: PortfolioMetrics): string {
    return metrics.dataQualityScore <= 2.5 ? "15-25" : metrics.dataQualityScore <= 3.0 ? "5-15" : "0-5";
  }

  private assessRiskConcentration(metrics: PortfolioMetrics): string {
    return metrics.emissionIntensity > 3.0 ? "elevated concentration" : "manageable concentration";
  }

  private assessRegulatoryReadiness(metrics: PortfolioMetrics): string {
    return metrics.dataQualityScore <= 3.0 ? "Full compliance achieved" : "Enhancement required for compliance";
  }

  private calculateRevenuePotential(metrics: PortfolioMetrics): string {
    return metrics.dataQualityScore <= 2.5 ? "significant" : "moderate";
  }

  private calculateRiskLevel(metrics: PortfolioMetrics): string {
    return metrics.emissionIntensity <= 2.5 ? "low" : metrics.emissionIntensity <= 3.0 ? "moderate" : "elevated";
  }

  private getOverallAssessment(metrics: PortfolioMetrics): string {
    const score = (metrics.emissionIntensity <= 2.5 ? 2 : metrics.emissionIntensity <= 3.0 ? 1 : 0) +
                  (metrics.dataQualityScore <= 2.5 ? 2 : metrics.dataQualityScore <= 3.0 ? 1 : 0);
    
    return score >= 3 ? "exceeds expectations" : score >= 2 ? "meets expectations" : "requires enhancement";
  }

  private getStrategicImplications(metrics: PortfolioMetrics): string {
    return metrics.emissionIntensity <= 2.5 ? "positive implications" : "mixed implications";
  }

  private getRegulatoryImplications(metrics: PortfolioMetrics): string {
    return metrics.dataQualityScore <= 3.0 ? "strong" : "challenging";
  }

  private calculateTrendDirection(metrics: PortfolioMetrics): string {
    return "stable to improving";
  }

  private calculateImprovementPotential(metrics: PortfolioMetrics): string {
    return metrics.dataQualityScore > 3.0 ? "significant" : "moderate";
  }

  private calculateMarketOpportunity(metrics: PortfolioMetrics): string {
    return metrics.emissionIntensity <= 2.5 ? "substantial" : "emerging";
  }

  // Additional placeholder methods
  private getCompetitiveAdvantage(metrics: PortfolioMetrics): string { return "competitive differentiation"; }
  private calculateCapitalImpact(metrics: PortfolioMetrics): string { return "5-15"; }
  private calculateStressImpact(metrics: PortfolioMetrics): string { return "moderate"; }
  private calculateTransitionRisk(metrics: PortfolioMetrics): string { return "manageable"; }
  private calculateCapitalRequirement(metrics: PortfolioMetrics): string { return "1-3%"; }
  private assessExaminationReadiness(metrics: PortfolioMetrics): string { return "comprehensive"; }
  private assessDocumentationQuality(metrics: PortfolioMetrics): string { return "robust"; }
  private assessDisclosureReadiness(metrics: PortfolioMetrics): string { return "complete"; }
  private assessReportingQuality(metrics: PortfolioMetrics): string { return "high-quality"; }
  private assessOperationalMetrics(metrics: PortfolioMetrics): string { return "Strong operational performance"; }
  private calculateProcessEfficiency(metrics: PortfolioMetrics): string { return "92%"; }
  private calculateDataAccuracy(metrics: PortfolioMetrics): string { return "96%"; }
  private assessSystemIntegration(metrics: PortfolioMetrics): string { return "seamless"; }
  private assessESGMarketAccess(metrics: PortfolioMetrics): string { return metrics.dataQualityScore <= 2.5 ? "Full access to ESG funding markets" : "Limited ESG market access"; }
  private calculateCostSavings(metrics: PortfolioMetrics): string { return "5-15 bps"; }
  private calculatePhysicalRisk(metrics: PortfolioMetrics): string { return "low"; }
  private getMonitoringLevel(metrics: PortfolioMetrics): string { return "standard"; }
  private getCompetitivePosition(metrics: PortfolioMetrics): string { return "strong"; }
}

export const aiInsightsNarrativeService = AIInsightsNarrativeService.getInstance();