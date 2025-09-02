/**
 * Sample Data Loader - Populates ChromaDB with realistic portfolio data
 */

import { chromaDBService, ChromaDocument } from './chroma-db-service';

export interface SampleDataConfig {
  numLoans: number;
  includeHistoricalData: boolean;
  dataQualityVariation: boolean;
}

class SampleDataLoader {
  private static instance: SampleDataLoader;

  static getInstance(): SampleDataLoader {
    if (!SampleDataLoader.instance) {
      SampleDataLoader.instance = new SampleDataLoader();
    }
    return SampleDataLoader.instance;
  }

  constructor() {
    // Empty constructor
  }

  /**
   * Load all sample data into ChromaDB collections
   */
  async loadAllSampleData(config: SampleDataConfig = {
    numLoans: 25,
    includeHistoricalData: true,
    dataQualityVariation: true
  }): Promise<{
    totalDocuments: number;
    collectionsPopulated: string[];
    processingTime: number;
  }> {
    const startTime = Date.now();
    console.log('🚀 Loading sample data into ChromaDB...');

    try {
      let totalDocuments = 0;
      const collectionsPopulated: string[] = [];

      // 1. Portfolio Documents
      const portfolioDocuments = this.generatePortfolioDocuments();
      await chromaDBService.addDocuments('portfolio_documents', portfolioDocuments);
      totalDocuments += portfolioDocuments.length;
      collectionsPopulated.push('portfolio_documents');
      console.log(`✅ Loaded ${portfolioDocuments.length} portfolio documents`);

      // 2. Loan Documents
      const loanDocuments = this.generateLoanDocuments(config.numLoans);
      await chromaDBService.addDocuments('loan_documents', loanDocuments);
      totalDocuments += loanDocuments.length;
      collectionsPopulated.push('loan_documents');
      console.log(`✅ Loaded ${loanDocuments.length} loan documents`);

      // 3. Analytics Documents
      const analyticsDocuments = this.generateAnalyticsDocuments();
      await chromaDBService.addDocuments('analytics_documents', analyticsDocuments);
      totalDocuments += analyticsDocuments.length;
      collectionsPopulated.push('analytics_documents');
      console.log(`✅ Loaded ${analyticsDocuments.length} analytics documents`);

      // 4. Bank Targets
      const bankTargets = this.generateBankTargets();
      await chromaDBService.addDocuments('bank_targets', bankTargets);
      totalDocuments += bankTargets.length;
      collectionsPopulated.push('bank_targets');
      console.log(`✅ Loaded ${bankTargets.length} bank target documents`);

      // 5. Historical Reports
      if (config.includeHistoricalData) {
        const historicalReports = this.generateHistoricalReports();
        await chromaDBService.addDocuments('historical_reports', historicalReports);
        totalDocuments += historicalReports.length;
        collectionsPopulated.push('historical_reports');
        console.log(`✅ Loaded ${historicalReports.length} historical reports`);
      }

      // 6. Client Insights
      const clientInsights = this.generateClientInsights();
      await chromaDBService.addDocuments('client_insights', clientInsights);
      totalDocuments += clientInsights.length;
      collectionsPopulated.push('client_insights');
      console.log(`✅ Loaded ${clientInsights.length} client insights`);

      const processingTime = Date.now() - startTime;
      console.log(`🎉 Sample data loading completed in ${processingTime}ms`);

      return {
        totalDocuments,
        collectionsPopulated,
        processingTime
      };

    } catch (error) {
      console.error('❌ Sample data loading failed:', error);
      throw error;
    }
  }

  /**
   * Generate portfolio overview documents
   */
  private generatePortfolioDocuments(): ChromaDocument[] {
    return [
      {
        id: 'portfolio_overview_2024',
        content: `
PORTFOLIO PERFORMANCE OVERVIEW - 2024

Executive Summary:
- Total Loans: 247 active auto loans
- Portfolio Value: $8.2M outstanding balance
- Total Financed Emissions: 1,847 tCO2e annually
- Average Data Quality Score: 2.8/5 (PCAF compliant)
- EV Portfolio Share: 18% (45 electric vehicles)

PCAF Compliance Metrics:
- Box 8 WDQS: 2.8 (Target: ≤3.0) ✅ COMPLIANT
- Compliant Loans: 198/247 (80.2%)
- High Risk Loans: 23 loans requiring data improvement

Emissions Performance:
- Emission Intensity: 2.25 kg CO2e per $1,000 outstanding
- Physical Emission Intensity: 7.48 tCO2e per vehicle
- WACI: 1,847 tCO2e
- Average Attribution Factor: 78%

Portfolio Composition by Fuel Type:
- Electric: 332 tCO2e (18% of portfolio, 45 vehicles)
- Hybrid: 445 tCO2e (24% of portfolio, 59 vehicles) 
- Gasoline: 1,070 tCO2e (58% of portfolio, 143 vehicles)
        `.trim(),
        metadata: {
          type: 'portfolio_overview',
          source: 'sample_data',
          timestamp: new Date(),
          dataQuality: 2.8,
          tags: ['portfolio', 'overview', 'pcaf', 'performance', '2024'],

          // Portfolio metrics
          totalLoans: 247,
          portfolioValue: 8200000,
          totalEmissions: 1847,
          avgDataQuality: 2.8,
          evShare: 18.2,
          complianceRate: 80.2,

          // Performance indicators
          emissionIntensity: 2.25, // kg CO2e per $1,000
          physicalEmissionIntensity: 7.48, // tCO2e per vehicle
          waci: 1847, // Weighted Average Carbon Intensity
          avgAttributionFactor: 78,

          // Composition
          electricVehicles: 45,
          hybridVehicles: 59,
          gasolineVehicles: 143,
          electricEmissions: 332,
          hybridEmissions: 445,
          gasolineEmissions: 1070,

          // Risk distribution
          lowRiskLoans: 156,
          mediumRiskLoans: 68,
          highRiskLoans: 23,

          // Compliance
          compliantLoans: 198,
          nonCompliantLoans: 49,
          pcafBoxScore: 2.8,

          // Targets
          emissionReductionTarget: 50, // % by 2030
          currentReduction: 24.6, // % achieved
          evTargetShare: 30, // % by 2028
          targetProgress: 60.7, // % of target achieved

          // Financial
          avgLoanAmount: 33200,
          avgOutstandingBalance: 25800,
          portfolioGrowthRate: 12.5,

          // Temporal
          reportingPeriod: '2024',
          lastUpdated: new Date(),
          nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now

          // Flags for easy filtering
          isCompliant: true,
          hasHighRiskLoans: true,
          meetingTargets: true,
          requiresAttention: false
        }
      }
    ];
  }

  /**
     * Generate individual loan documents
     */
  private generateLoanDocuments(numLoans: number): ChromaDocument[] {
    const loanDocuments: ChromaDocument[] = [];

    const vehicleTypes = [
      { make: 'Tesla', model: 'Model 3', fuel: 'Electric', emissions: 0.5 },
      { make: 'Toyota', model: 'Prius', fuel: 'Hybrid', emissions: 2.1 },
      { make: 'Honda', model: 'Civic', fuel: 'Gasoline', emissions: 4.1 },
      { make: 'Ford', model: 'F-150', fuel: 'Gasoline', emissions: 8.2 },
      { make: 'BMW', model: 'i4', fuel: 'Electric', emissions: 0.4 }
    ];

    for (let i = 1; i <= numLoans; i++) {
      const vehicle = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const loanAmount = Math.floor(Math.random() * 40000) + 15000;
      const outstandingBalance = Math.floor(loanAmount * (0.6 + Math.random() * 0.4));
      const dataQuality = vehicle.fuel === 'Electric' ? 2 : vehicle.fuel === 'Hybrid' ? 2.5 : 3.2;

      const loanId = `AUTO${String(i).padStart(4, '0')}`;

      const content = `
LOAN ANALYSIS - ${loanId}

Borrower: Borrower ${i}
Loan Amount: $${loanAmount.toLocaleString()}
Outstanding Balance: $${outstandingBalance.toLocaleString()}

Vehicle Details:
- Make/Model: ${vehicle.make} ${vehicle.model}
- Fuel Type: ${vehicle.fuel}
- Annual Emissions: ${vehicle.emissions.toFixed(2)} tCO2e
- PCAF Score: ${dataQuality}/5
- Compliance: ${dataQuality <= 3 ? 'COMPLIANT' : 'NON-COMPLIANT'}

Risk Assessment:
- Data Quality Risk: ${dataQuality >= 4 ? 'High' : dataQuality >= 3 ? 'Medium' : 'Low'}
- Climate Risk: ${vehicle.fuel === 'Gasoline' ? 'Medium' : 'Low'}
      `.trim();

      loanDocuments.push({
        id: loanId,
        content,
        metadata: {
          type: 'loan_analysis',
          source: 'sample_data',
          timestamp: new Date(),
          dataQuality,
          tags: ['loan', 'vehicle', vehicle.fuel.toLowerCase(), vehicle.make.toLowerCase()],

          // Loan-specific metadata
          loanId: loanId,
          loanAmount: loanAmount,
          outstandingBalance: outstandingBalance,
          borrowerName: `Borrower ${i}`,

          // Vehicle metadata
          vehicleMake: vehicle.make,
          vehicleModel: vehicle.model,
          fuelType: vehicle.fuel,
          emissions: vehicle.emissions,
          vehicleYear: 2020 + Math.floor(Math.random() * 4),

          // PCAF metadata
          pcafScore: dataQuality,
          isCompliant: dataQuality <= 3,
          instrument: 'auto_loans',

          // Risk metadata
          riskLevel: dataQuality >= 4 ? 'high' : dataQuality >= 3 ? 'medium' : 'low',
          climateRisk: vehicle.fuel === 'Gasoline' ? 'medium' : 'low',

          // Financial metadata
          ltv: Math.round((outstandingBalance / loanAmount) * 100),
          interestRate: 3.5 + Math.random() * 4,

          // Geographic metadata (sample locations)
          state: ['CA', 'TX', 'NY', 'FL', 'WA'][Math.floor(Math.random() * 5)],
          region: ['West', 'South', 'Northeast', 'Southeast', 'Northwest'][Math.floor(Math.random() * 5)],

          // Temporal metadata
          originationDate: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          maturityDate: new Date(2027 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),

          // Performance metadata
          paymentStatus: ['current', 'current', 'current', 'current', '30_days_past_due'][Math.floor(Math.random() * 5)],
          creditScore: 650 + Math.floor(Math.random() * 200),

          // ESG metadata
          esgScore: vehicle.fuel === 'Electric' ? 85 + Math.random() * 15 :
            vehicle.fuel === 'Hybrid' ? 70 + Math.random() * 15 :
              45 + Math.random() * 25,
          carbonIntensity: vehicle.emissions / (outstandingBalance / 1000), // tCO2e per $1k

          // Additional searchable fields
          isEV: vehicle.fuel === 'Electric',
          isHybrid: vehicle.fuel === 'Hybrid',
          isHighEmission: vehicle.emissions > 6.0,
          isLowEmission: vehicle.emissions < 2.0,
          isLargeBalance: outstandingBalance > 30000,

          // Opportunity flags
          evUpgradeCandidate: vehicle.fuel === 'Gasoline' && outstandingBalance > 20000,
          dataImprovementCandidate: dataQuality > 3.5,
          refinanceCandidate: Math.random() > 0.8
        }
      });
    }

    return loanDocuments;
  }

  /**
   * Generate analytics documents
   */
  private generateAnalyticsDocuments(): ChromaDocument[] {
    return [
      {
        id: 'portfolio_analytics_comprehensive',
        content: `
COMPREHENSIVE PORTFOLIO ANALYTICS

Portfolio Metrics Summary:
- Total Loans: 247 active loans
- Outstanding Balance: $8.2M
- Total Financed Emissions: 1,847 tCO2e annually
- Portfolio Weighted Average Data Quality: 2.8/5

PCAF Compliance Analysis:
- Box 8 WDQS: 2.8 (Compliant - Target ≤3.0)
- Compliant Loans: 198/247 (80.2%)
- Non-Compliant Loans: 49/247 (19.8%)

Fuel Type Performance:
- Electric Vehicles: 45 vehicles (18.2%), 332 tCO2e
- Hybrid Vehicles: 59 vehicles (23.9%), 445 tCO2e  
- Gasoline Vehicles: 143 vehicles (57.9%), 1,070 tCO2e

Risk Distribution:
- Low Risk: 156 loans (63.2%)
- Medium Risk: 68 loans (27.5%)
- High Risk: 23 loans (9.3%)
        `.trim(),
        metadata: {
          type: 'analytics_comprehensive',
          source: 'sample_data',
          timestamp: new Date(),
          dataQuality: 2.8,
          tags: ['analytics', 'metrics', 'pcaf', 'performance'],

          // Analytics metadata
          analysisType: 'comprehensive_portfolio',
          metricsIncluded: ['emissions', 'compliance', 'risk', 'performance'],

          // Key metrics
          totalLoans: 247,
          outstandingBalance: 8200000,
          totalEmissions: 1847,
          wdqs: 2.8,
          complianceRate: 80.2,

          // Fuel type breakdown
          evCount: 45,
          evPercentage: 18.2,
          evEmissions: 332,
          hybridCount: 59,
          hybridPercentage: 23.9,
          hybridEmissions: 445,
          gasolineCount: 143,
          gasolinePercentage: 57.9,
          gasolineEmissions: 1070,

          // Risk analysis
          lowRiskCount: 156,
          lowRiskPercentage: 63.2,
          mediumRiskCount: 68,
          mediumRiskPercentage: 27.5,
          highRiskCount: 23,
          highRiskPercentage: 9.3,

          // Performance indicators
          portfolioGrade: 'B+',
          benchmarkComparison: 'above_average',
          trendDirection: 'improving',

          // Flags
          isCurrentAnalysis: true,
          requiresAction: false,
          hasRiskConcerns: true,
          meetsBenchmarks: true
        }
      }
    ];
  }

  /**
   * Generate bank target documents
   */
  private generateBankTargets(): ChromaDocument[] {
    return [
      {
        id: 'climate_targets_2024',
        content: `
CLIMATE TARGETS & NET ZERO COMMITMENT

Strategic Climate Goals:

1. EMISSION REDUCTION TARGET
   50% financed emissions reduction by 2030
   - Baseline (2020): 2,450 tCO2e
   - Current (2024): 1,847 tCO2e (24.6% reduction achieved)
   - Target (2030): 1,225 tCO2e
   - Status: ON TRACK

2. DATA QUALITY TARGET
   PCAF Box 8 WDQS ≤3.0 by end of 2024
   - Current Score: 2.8/5
   - Status: ✅ ACHIEVED

3. EV PORTFOLIO TARGET
   30% Electric Vehicle share by 2028
   - Current: 18.2%
   - Target: 30%
   - Progress: 60.7% of target achieved

Net Zero Commitment: 2050
Science-Based Targets: Validated by SBTi
        `.trim(),
        metadata: {
          type: 'climate_targets',
          source: 'sample_data',
          timestamp: new Date(),
          dataQuality: 4.0,
          tags: ['targets', 'climate', 'net-zero', 'pcaf'],

          // Target metadata
          targetType: 'climate_commitment',
          netZeroYear: 2050,
          interimTargetYear: 2030,

          // Emission targets
          emissionReductionTarget: 50, // % by 2030
          baselineYear: 2020,
          baselineEmissions: 2450, // tCO2e
          currentEmissions: 1847, // tCO2e
          targetEmissions: 1225, // tCO2e by 2030
          currentReduction: 24.6, // % achieved

          // Data quality targets
          pcafTargetScore: 3.0,
          currentPcafScore: 2.8,
          pcafTargetAchieved: true,

          // EV targets
          evTargetShare: 30, // % by 2028
          currentEvShare: 18.2,
          evTargetProgress: 60.7, // % of target achieved

          // Validation
          sbtiValidated: true,
          parisAligned: true,

          // Progress tracking
          onTrackEmissions: true,
          onTrackDataQuality: true,
          onTrackEv: true,
          overallProgress: 'on_track',

          // Timeline
          targetHorizon: 6, // years to 2030
          reviewFrequency: 'quarterly',
          lastReview: new Date(),
          nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days

          // Flags
          isStrategic: true,
          isPublicCommitment: true,
          requiresReporting: true,
          isAchievable: true
        }
      }
    ];
  }

  /**
   * Generate historical report documents
   */
  private generateHistoricalReports(): ChromaDocument[] {
    const reports: ChromaDocument[] = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];

    for (let i = 0; i < 6; i++) {
      const month = months[i];
      const progressFactor = (i + 1) / 6;
      const baseLoans = 200 + Math.floor(47 * progressFactor);
      const evShare = 12 + Math.floor(6.2 * progressFactor);

      reports.push({
        id: `monthly_report_2024_${String(i + 1).padStart(2, '0')}`,
        content: `
MONTHLY PORTFOLIO REPORT - ${month} 2024

Portfolio Snapshot:
- Total Active Loans: ${baseLoans}
- Portfolio Value: $${((baseLoans * 35000) / 1000000).toFixed(1)}M
- EV Share: ${evShare}%

Monthly Performance:
- New Originations: ${Math.floor(Math.random() * 15) + 10}
- Portfolio Growth: +${(Math.random() * 2 + 0.5).toFixed(1)}%
- EV Adoption: +${(Math.random() * 1.5 + 0.2).toFixed(1)}%

PCAF Compliance:
- Data Quality Score: ${(3.2 - (0.4 * progressFactor)).toFixed(1)}/5
- Compliant Loans: ${Math.floor(baseLoans * 0.8)}
        `.trim(),
        metadata: {
          type: 'monthly_report',
          source: 'sample_data',
          timestamp: new Date(2024, i, 15),
          dataQuality: 3.2 - (0.4 * progressFactor),
          tags: ['monthly', 'report', 'historical', month.toLowerCase()],

          // Report metadata
          reportMonth: month,
          reportYear: 2024,
          reportPeriod: `${month}_2024`,

          // Portfolio metrics
          totalLoans: baseLoans,
          portfolioValue: (baseLoans * 35000),
          evShare: evShare,
          newOriginations: Math.floor(Math.random() * 15) + 10,
          portfolioGrowth: +(Math.random() * 2 + 0.5).toFixed(1),
          evAdoption: +(Math.random() * 1.5 + 0.2).toFixed(1),

          // PCAF metrics
          pcafScore: +(3.2 - (0.4 * progressFactor)).toFixed(1),
          compliantLoans: Math.floor(baseLoans * 0.8),
          complianceRate: 80,

          // Trends
          monthOverMonth: progressFactor > 0 ? 'improving' : 'stable',
          trendDirection: 'positive',

          // Performance indicators
          performanceGrade: progressFactor > 0.5 ? 'A-' : 'B+',
          benchmarkComparison: 'above_average',

          // Flags
          isHistorical: true,
          showsTrend: true,
          hasGrowth: true,
          isCompliant: true
        }
      });
    }

    return reports;
  }

  /**
   * Generate client insight documents
   */
  private generateClientInsights(): ChromaDocument[] {
    return [
      {
        id: 'ai_insight_portfolio_optimization',
        content: `
AI-GENERATED INSIGHT: Portfolio Optimization Opportunities

Key Findings:

1. EV ACCELERATION OPPORTUNITY
   Current EV Share: 18.2% | Optimal Target: 25% by 2025
   - Financial Impact: +$450K annual revenue potential
   - Climate Impact: -185 tCO2e annual emissions reduction
   - Action: Implement EV-specific marketing and preferential rates

2. DATA QUALITY QUICK WINS
   23 loans with easily improvable data quality scores
   - WDQS Improvement: 0.3 point potential
   - Timeline: 60-90 days implementation
   - Compliance Benefit: 100% PCAF compliance achievable

3. HIGH-EMISSION LOAN TRANSITION
   8 loans with emission intensity >4.0 kg CO2e/$1k
   - Refinancing Opportunity: $285K outstanding balance
   - EV Upgrade Program: 75% conversion rate potential
   - Emission Reduction: -45 tCO2e annually

Expected Outcomes:
- Portfolio WDQS: 2.8 → 2.4 (14% improvement)
- EV Share: 18.2% → 25% (37% increase)
- Annual Emissions: 1,847 → 1,515 tCO2e (18% reduction)
- Revenue Growth: +$125K annually

Confidence Level: 87%
        `.trim(),
        metadata: {
          type: 'ai_insight',
          source: 'sample_data',
          timestamp: new Date(),
          dataQuality: 2.5,
          tags: ['ai', 'insight', 'optimization', 'ev', 'revenue'],

          // Insight metadata
          insightType: 'portfolio_optimization',
          confidenceLevel: 87,
          priority: 'high',
          category: 'opportunity',

          // Financial impact
          revenueImpact: 450000, // Annual revenue potential
          implementationCost: 125000,
          roi: 260, // % return on investment
          paybackPeriod: 8, // months

          // Climate impact
          emissionReduction: 185, // tCO2e annually
          evTargetContribution: 6.8, // % toward EV target
          complianceImprovement: 0.3, // WDQS improvement

          // Implementation
          timelineMonths: 6,
          complexity: 'medium',
          resourcesRequired: ['marketing', 'product', 'operations'],

          // Affected portfolio
          affectedLoans: 23,
          affectedValue: 285000,
          conversionRate: 75, // % expected conversion

          // Opportunity metrics
          evShareIncrease: 6.8, // percentage points
          currentEvShare: 18.2,
          targetEvShare: 25,

          // Risk factors
          marketRisk: 'low',
          executionRisk: 'medium',
          competitiveRisk: 'low',

          // Action items
          actionItemCount: 3,
          quickWins: true,
          requiresApproval: true,

          // Flags
          isActionable: true,
          isHighImpact: true,
          isLowRisk: true,
          requiresImmediateAction: false
        }
      },
      {
        id: 'ai_insight_risk_analysis',
        content: `
AI-GENERATED INSIGHT: Climate Risk & Opportunity Analysis

Climate Risk Assessment:

1. TRANSITION RISK ANALYSIS
   Technology Transition Risk Score: 1.8/5 (Low)
   - ICE Stranded Asset Risk: 5-10 year horizon
   - Portfolio Exposure: $4.3M (52.4% of portfolio)
   - Mitigation: Accelerated EV transition program

2. OPPORTUNITY ANALYSIS
   Green Finance Market: $12.5B regional market
   - Current Share: 0.8% ($2.1M green loans)
   - Growth Potential: 25% annually for 5 years
   - Competitive Advantage: Early mover position

Scenario Analysis Results:

1.5°C SCENARIO (Paris Aligned):
- EV Demand: +150% by 2030
- Revenue Opportunity: +$2.3M annually by 2030
- Required Investment: $500K in EV programs

2°C SCENARIO (Current Policy):
- EV Demand: +75% by 2030
- Revenue Opportunity: +$1.2M annually by 2030
- Required Investment: $300K in programs

Strategic Recommendations:
1. Launch comprehensive EV incentive program
2. Establish charging network partnerships
3. Develop green bond funding strategy
4. Create climate risk monitoring system

Risk-Adjusted Return: +$125K annual revenue, 15% IRR
Confidence: 78%
        `.trim(),
        metadata: {
          type: 'ai_risk_analysis',
          source: 'sample_data',
          timestamp: new Date(),
          dataQuality: 3.2,
          tags: ['ai', 'risk', 'climate', 'opportunity', 'strategy'],

          // Risk analysis metadata
          analysisType: 'climate_risk_opportunity',
          confidenceLevel: 78,
          priority: 'high',
          category: 'strategic',

          // Risk scores
          transitionRiskScore: 1.8,
          physicalRiskScore: 2.1,
          overallRiskScore: 2.0,
          riskHorizon: 10, // years

          // Market opportunity
          marketSize: 12500000000, // $12.5B regional market
          currentMarketShare: 0.8,
          growthPotential: 25, // % annually
          competitivePosition: 'early_mover',

          // Scenario analysis
          parisAlignedRevenue: 2300000, // Annual revenue by 2030
          currentPolicyRevenue: 1200000,
          requiredInvestment: 500000,
          expectedIrr: 15, // %

          // Portfolio exposure
          strandedAssetRisk: 4300000, // ICE portfolio value at risk
          exposurePercentage: 52.4,
          mitigationTimeframe: 7, // years

          // Strategic recommendations
          recommendationCount: 4,
          investmentRequired: 500000,
          expectedReturn: 125000, // Annual
          implementationTimeframe: 24, // months

          // Climate scenarios
          scenario1_5c: true,
          scenario2c: true,
          currentPolicy: true,

          // Flags
          requiresStrategicAction: true,
          hasSignificantOpportunity: true,
          hasManageableRisk: true,
          isStrategicallyImportant: true
        }
      }
    ];
  }

  /**
   * Clear all sample data
   */
  async clearAllSampleData(): Promise<void> {
    console.log('🧹 Clearing all sample data...');

    const collections = [
      'portfolio_documents',
      'loan_documents',
      'analytics_documents',
      'bank_targets',
      'historical_reports',
      'client_insights'
    ];

    for (const collection of collections) {
      await chromaDBService.clearCollection(collection);
    }
  }
}

// Create and export instance
const sampleDataLoaderInstance = new SampleDataLoader();

// Export functions that use the instance
export const loadAllSampleData = (config?: SampleDataConfig) =>
  sampleDataLoaderInstance.loadAllSampleData(config);

export const clearAllSampleData = () =>
  sampleDataLoaderInstance.clearAllSampleData();

// Export the class for direct instantiation if needed
export { SampleDataLoader };