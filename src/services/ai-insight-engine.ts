import { LoanPortfolioItem } from "@/lib/db";

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: 'data-quality' | 'emission-reduction' | 'business-intelligence' | 'regulatory-compliance' | 'risk-assessment';
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  items: {
    title: string;
    subtitle: string;
    detail?: string;
    status?: "success" | "warning" | "info" | "danger";
    value?: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  recommendations: string[];
  estimatedTimeToImplement?: string;
  potentialImpact?: string;
}

export interface PortfolioAnalysis {
  totalLoans: number;
  totalEmissions: number;
  averageDataQuality: number;
  evPercentage: number;
  highRiskLoans: number;
  complianceScore: number;
  fuelTypeDistribution: Record<string, number>;
  vehicleTypeDistribution: Record<string, number>;
  dataQualityDistribution: Record<string, number>;
}

export class AIInsightEngine {
  
  static analyzePortfolio(loans: LoanPortfolioItem[]): PortfolioAnalysis {
    if (!loans.length) {
      return {
        totalLoans: 0,
        totalEmissions: 0,
        averageDataQuality: 0,
        evPercentage: 0,
        highRiskLoans: 0,
        complianceScore: 0,
        fuelTypeDistribution: {},
        vehicleTypeDistribution: {},
        dataQualityDistribution: {}
      };
    }

    const totalEmissions = loans.reduce((sum, loan) => sum + (loan.financed_emissions || 0), 0);
    const averageDataQuality = loans.reduce((sum, loan) => sum + loan.data_quality_score, 0) / loans.length;
    const evCount = loans.filter(loan => loan.fuel_type === 'electric' || loan.fuel_type === 'hybrid').length;
    const highRiskLoans = loans.filter(loan => loan.attribution_factor > 0.8 || loan.data_quality_score < 3).length;
    
    const fuelTypeDistribution = loans.reduce((acc, loan) => {
      acc[loan.fuel_type] = (acc[loan.fuel_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vehicleTypeDistribution = loans.reduce((acc, loan) => {
      const type = loan.vehicle_category || loan.vehicle_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dataQualityDistribution = loans.reduce((acc, loan) => {
      const score = loan.data_quality_score.toString();
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const complianceScore = this.calculateComplianceScore(loans);

    return {
      totalLoans: loans.length,
      totalEmissions,
      averageDataQuality,
      evPercentage: (evCount / loans.length) * 100,
      highRiskLoans,
      complianceScore,
      fuelTypeDistribution,
      vehicleTypeDistribution,
      dataQualityDistribution
    };
  }

  static generateInsights(loans: LoanPortfolioItem[]): AIInsight[] {
    if (!loans.length) return [];

    const analysis = this.analyzePortfolio(loans);
    const insights: AIInsight[] = [];

    // Data Quality Insights
    insights.push(...this.generateDataQualityInsights(loans, analysis));
    
    // Emission Reduction Insights
    insights.push(...this.generateEmissionReductionInsights(loans, analysis));
    
    // Business Intelligence Insights
    insights.push(...this.generateBusinessIntelligenceInsights(loans, analysis));
    
    // Regulatory Compliance Insights
    insights.push(...this.generateRegulatoryComplianceInsights(loans, analysis));
    
    // Risk Assessment Insights
    insights.push(...this.generateRiskAssessmentInsights(loans, analysis));

    return insights.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority] || b.confidence - a.confidence;
    });
  }

  private static generateDataQualityInsights(loans: LoanPortfolioItem[], analysis: PortfolioAnalysis): AIInsight[] {
    const insights: AIInsight[] = [];
    
    const lowQualityLoans = loans.filter(loan => loan.data_quality_score <= 2);
    const missingDataLoans = loans.filter(loan => !loan.estimated_annual_km || !loan.emission_factor_kg_co2_km);
    
    if (lowQualityLoans.length > loans.length * 0.3) {
      insights.push({
        id: 'data-quality-improvement',
        title: 'Virtual Fuel Cards to Boost Data Quality',
        description: 'Significant opportunity to improve PCAF data quality through automated fuel monitoring',
        category: 'data-quality',
        priority: 'high',
        confidence: 85,
        impact: 'high',
        actionable: true,
        items: [
          {
            title: `${lowQualityLoans.length} loans with low data quality`,
            subtitle: `${Math.round((lowQualityLoans.length / loans.length) * 100)}% of portfolio needs improvement`,
            status: 'warning',
            value: `Score: ${analysis.averageDataQuality.toFixed(1)}/5`
          },
          {
            title: 'Virtual fuel card program available',
            subtitle: 'Automated tracking can move loans from Option 3b to 2a',
            status: 'info',
            detail: 'Potential 2-point data quality improvement'
          },
          {
            title: 'Estimated improvement impact',
            subtitle: `Could improve ${Math.round(lowQualityLoans.length * 0.7)} loan data quality scores`,
            status: 'success'
          }
        ],
        recommendations: [
          'Implement virtual fuel card program for high-value loans',
          'Prioritize customers with poor data quality scores',
          'Start with commercial fleet customers for maximum impact'
        ],
        estimatedTimeToImplement: '2-3 months',
        potentialImpact: 'Move 70% of low-quality loans up 2 PCAF levels'
      });
    }

    return insights;
  }

  private static generateEmissionReductionInsights(loans: LoanPortfolioItem[], analysis: PortfolioAnalysis): AIInsight[] {
    const insights: AIInsight[] = [];
    
    const highEmissionLoans = loans.filter(loan => loan.financed_emissions > 5); // 5+ tCO2e
    const evOpportunityLoans = loans.filter(loan => 
      loan.fuel_type === 'gasoline' && 
      loan.vehicle_category === 'passenger_car' &&
      (loan.estimated_annual_km || 0) > 15000
    );

    if (analysis.evPercentage < 15) {
      insights.push({
        id: 'ev-transition-opportunity',
        title: 'EV Transition Opportunities',
        description: 'Identify high-mileage customers for EV refinancing programs',
        category: 'emission-reduction',
        priority: 'high',
        confidence: 78,
        impact: 'high',
        actionable: true,
        items: [
          {
            title: `${evOpportunityLoans.length} high-mileage gas vehicles`,
            subtitle: 'Prime candidates for EV transition financing',
            status: 'info',
            value: `${analysis.evPercentage.toFixed(1)}% EV portfolio`
          },
          {
            title: 'Potential emission reduction',
            subtitle: `Up to ${Math.round(evOpportunityLoans.length * 3.2)} tCO2e annual savings`,
            status: 'success'
          },
          {
            title: 'Customer engagement opportunity',
            subtitle: 'Cross-sell green financing products',
            status: 'info'
          }
        ],
        recommendations: [
          'Launch targeted EV refinancing campaign',
          'Offer incentive rates for EV transitions',
          'Partner with EV dealers for customer referrals'
        ],
        estimatedTimeToImplement: '1-2 months',
        potentialImpact: '25-40% emission reduction for participating customers'
      });
    }

    if (highEmissionLoans.length > 0) {
      insights.push({
        id: 'emission-hotspots',
        title: 'Carbon Emission Hotspots',
        description: 'Focus on highest impact loans for emission reduction initiatives',
        category: 'emission-reduction',
        priority: 'medium',
        confidence: 82,
        impact: 'medium',
        actionable: true,
        items: [
          {
            title: `${highEmissionLoans.length} high-emission loans identified`,
            subtitle: `Contributing ${Math.round((highEmissionLoans.reduce((sum, loan) => sum + loan.financed_emissions, 0) / analysis.totalEmissions) * 100)}% of portfolio emissions`,
            status: 'warning'
          },
          {
            title: 'Primary emission drivers',
            subtitle: Object.keys(analysis.fuelTypeDistribution)[0] || 'Diesel vehicles',
            status: 'info'
          }
        ],
        recommendations: [
          'Prioritize high-emission loans for efficiency programs',
          'Offer green refinancing options',
          'Implement emission-based pricing strategies'
        ]
      });
    }

    return insights;
  }

  private static generateBusinessIntelligenceInsights(loans: LoanPortfolioItem[], analysis: PortfolioAnalysis): AIInsight[] {
    const insights: AIInsight[] = [];
    
    const fleetLoans = loans.filter(loan => loan.lending_type === 'business' || (loan.fleet_size && loan.fleet_size > 1));
    const highValueLoans = loans.filter(loan => loan.vehicle_value > 50000);

    if (fleetLoans.length > 0) {
      insights.push({
        id: 'fleet-expansion-opportunity',
        title: 'Fleet Customer Expansion',
        description: 'Cross-sell opportunities with existing fleet customers',
        category: 'business-intelligence',
        priority: 'medium',
        confidence: 72,
        impact: 'medium',
        actionable: true,
        items: [
          {
            title: `${fleetLoans.length} fleet customers identified`,
            subtitle: 'Opportunity for fleet expansion financing',
            status: 'success'
          },
          {
            title: 'Average fleet loan value',
            subtitle: `$${Math.round(fleetLoans.reduce((sum, loan) => sum + loan.loan_amount, 0) / fleetLoans.length).toLocaleString()}`,
            status: 'info'
          },
          {
            title: 'Sustainability program potential',
            subtitle: 'Fleet electrification financing opportunities',
            status: 'info'
          }
        ],
        recommendations: [
          'Develop fleet-specific green financing products',
          'Create fleet sustainability scorecards',
          'Offer volume discounts for fleet electrification'
        ]
      });
    }

    return insights;
  }

  private static generateRegulatoryComplianceInsights(loans: LoanPortfolioItem[], analysis: PortfolioAnalysis): AIInsight[] {
    const insights: AIInsight[] = [];
    
    const pcafGapLoans = loans.filter(loan => !loan.pcaf_data_option || loan.data_quality_score < 3);
    
    if (analysis.complianceScore < 80) {
      insights.push({
        id: 'pcaf-compliance-gaps',
        title: 'PCAF Reporting Readiness',
        description: 'Address compliance gaps for regulatory reporting requirements',
        category: 'regulatory-compliance',
        priority: 'high',
        confidence: 90,
        impact: 'high',
        actionable: true,
        items: [
          {
            title: 'Compliance score',
            subtitle: `${analysis.complianceScore}% ready for PCAF reporting`,
            status: analysis.complianceScore < 70 ? 'danger' : 'warning',
            value: `${pcafGapLoans.length} loans need attention`
          },
          {
            title: 'Data quality requirements',
            subtitle: 'PCAF Option 2a or better recommended',
            status: 'info'
          },
          {
            title: 'Reporting deadline preparation',
            subtitle: 'Ensure readiness for upcoming requirements',
            status: 'warning'
          }
        ],
        recommendations: [
          'Prioritize data collection for low-quality loans',
          'Implement systematic PCAF methodology',
          'Establish regular data quality monitoring'
        ],
        estimatedTimeToImplement: '3-4 months',
        potentialImpact: 'Full regulatory compliance readiness'
      });
    }

    return insights;
  }

  private static generateRiskAssessmentInsights(loans: LoanPortfolioItem[], analysis: PortfolioAnalysis): AIInsight[] {
    const insights: AIInsight[] = [];
    
    if (analysis.highRiskLoans > loans.length * 0.15) {
      insights.push({
        id: 'portfolio-risk-concentration',
        title: 'Portfolio Risk Assessment',
        description: 'Monitor concentration risk and attribution factor exposure',
        category: 'risk-assessment',
        priority: 'medium',
        confidence: 75,
        impact: 'medium',
        actionable: true,
        items: [
          {
            title: `${analysis.highRiskLoans} high-risk loans`,
            subtitle: `${Math.round((analysis.highRiskLoans / loans.length) * 100)}% of portfolio above risk threshold`,
            status: 'warning'
          },
          {
            title: 'Attribution factor exposure',
            subtitle: 'High attribution factors increase emission liability',
            status: 'info'
          }
        ],
        recommendations: [
          'Diversify portfolio across vehicle types',
          'Monitor attribution factor trends',
          'Implement risk-based pricing strategies'
        ]
      });
    }

    return insights;
  }

  private static calculateComplianceScore(loans: LoanPortfolioItem[]): number {
    if (!loans.length) return 0;
    
    let score = 0;
    loans.forEach(loan => {
      // Base score for having data
      if (loan.data_quality_score >= 3) score += 20;
      if (loan.pcaf_data_option && ['1a', '1b', '2a', '2b'].includes(loan.pcaf_data_option)) score += 15;
      if (loan.estimated_annual_km) score += 10;
      if (loan.emission_factor_kg_co2_km > 0) score += 15;
      if (loan.financed_emissions > 0) score += 20;
    });
    
    return Math.min(100, Math.round(score / loans.length));
  }
}