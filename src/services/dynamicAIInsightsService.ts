import { portfolioService } from './portfolioService';

interface LoanData {
  id: string;
  loan_amount: number;
  vehicle_details: {
    make?: string;
    model?: string;
    year?: number;
    fuel_type: string;
    engine_size?: number;
    annual_mileage?: number;
  };
  borrower_location?: {
    state?: string;
    zip_code?: string;
  };
  financed_emissions?: number;
  data_quality_score?: number;
}

interface PortfolioAnalysis {
  totalLoans: number;
  totalValue: number;
  totalEmissions: number;
  avgDataQuality: number;
  dataCompleteness: DataCompletenessAnalysis;
  vehicleDistribution: VehicleDistribution;
  geographicDistribution: GeographicDistribution;
  riskFactors: AnalyzedRiskFactor[];
  improvementOpportunities: ImprovementOpportunity[];
}

interface DataCompletenessAnalysis {
  overall: number;
  byField: {
    make: number;
    model: number;
    year: number;
    fuelType: number;
    engineSize: number;
    annualMileage: number;
  };
  missingCriticalData: number;
  highImpactGaps: string[];
}

interface VehicleDistribution {
  byFuelType: Record<string, number>;
  byAge: Record<string, number>;
  byMake: Record<string, number>;
  electricVehiclePercentage: number;
  avgVehicleAge: : number;
    description: string;
  }[];
}

interface DynamicInsight {
  id: string;
  type: 'compliance' | 'risk' | 'efficiency' | 'data-quality' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  dataSource: 'portfolio-analysis' | 'rag-system' | 'calculation' | 'benchmark';
  specificMetrics: {
    affectedLoans?: number;
    potentialImprovement?: string;
    timeframe?: string;
    cost?: string;
  };
  ragReferences?: string[];
  nextActions: string[];
}

interface RAGQueryResult {
  content: string;
  relevance: number;
  source: string;
  section?: string;
}

export class DynamicAIInsightsService {
  private ragApiUrl = '/api/rag-management';

  async generateDynamicInsights(portfolioMetrics?: any): Promise<DynamicInsight[]> {
    try {
      // Get comprehensive portfolio analysis
      const analysis = await this.analyzePortfolioData();
      
      if (!analysis || analysis.totalLoans === 0) {
        return this.generateOnboardingInsights();
      }

      const insights: DynamicInsight[] = [];

      // Generate compliance insights
      insights.push(...await this.generateComplianceInsights(analysis));

      // Generate data quality insights
      insights.push(...await this.generateDataQualityInsights(analysis));

      // Generate risk insights
      insights.push(...await this.generateRiskInsights(analysis));

      // Generate efficiency insights
      insights.push(...await this.generateEfficiencyInsights(analysis));

      // Generate opportunity insights
      insights.push(...await this.generateOpportunityInsights(analysis));

      // Sort by impact and confidence
      return insights.sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        if (impactOrder[a.impact] !== impactOrder[b.impact]) {
          return impactOrder[b.impact] - impactOrder[a.impact];
        }
        return b.confidence - a.confidence;
      });

    } catch (error) {
      console.error('Failed to generate dynamic insights:', error);
      return this.generateFallbackInsights();
    }
  }

  private async analyzePortfolioData(): Promise<PortfolioAnalysis | null> {
    try {
      const { loans } = await portfolioService.getPortfolioSummary();
      const metrics = await portfolioService.getPortfolioAnalytics();

      if (!loans ||