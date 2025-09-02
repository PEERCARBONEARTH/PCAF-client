
// Common Types for Better Type Safety
export interface PortfolioMetrics {
  totalInstruments: number;
  totalValue: number;
  totalEmissions: number;
  avgDataQuality: number;
  emissionIntensity: number;
  pcafCompliance: number;
  esgScore: number;
  instrumentBreakdown: Record<string, number>;
  fuelTypeBreakdown: Record<string, number>;
  riskExposures: number;
  complianceRate: number;
}

export interface AIInsightData {
  id: string;
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  recommendations: AIRecommendation[];
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

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
  message?: string;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  actionable: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  technical?: string;
}
