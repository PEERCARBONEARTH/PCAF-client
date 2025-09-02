// RAG Response Types and Structures

export interface RAGResponse {
  response: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
  followUpQuestions: string[];
  portfolioInsights?: PortfolioInsights;
  responseType: ResponseType;
  structuredData?: StructuredResponseData;
}

export type ResponseType = 
  | 'calculation'
  | 'methodology' 
  | 'compliance'
  | 'data_quality'
  | 'portfolio_analysis'
  | 'implementation'
  | 'regulatory'
  | 'vehicle_specific'
  | 'general';

export interface StructuredResponseData {
  type: ResponseType;
  format: ResponseFormat;
  data: any;
}

export type ResponseFormat =
  | 'step_by_step'
  | 'comparison_table'
  | 'checklist'
  | 'formula'
  | 'decision_tree'
  | 'timeline'
  | 'data_requirements'
  | 'compliance_matrix'
  | 'portfolio_summary';

// Specific structured formats
export interface StepByStepResponse {
  title: string;
  steps: Array<{
    number: number;
    title: string;
    description: string;
    example?: string;
    requirements?: string[];
    tips?: string[];
  }>;
  summary: string;
}

export interface ComparisonTableResponse {
  title: string;
  headers: string[];
  rows: Array<{
    label: string;
    values: string[];
    highlight?: boolean;
  }>;
  notes?: string[];
}

export interface ChecklistResponse {
  title: string;
  categories: Array<{
    category: string;
    items: Array<{
      item: string;
      required: boolean;
      description?: string;
      example?: string;
    }>;
  }>;
}

export interface FormulaResponse {
  title: string;
  formula: string;
  variables: Array<{
    symbol: string;
    name: string;
    description: string;
    unit?: string;
    example?: string;
  }>;
  example: {
    scenario: string;
    calculation: string;
    result: string;
  };
  notes?: string[];
}

export interface DecisionTreeResponse {
  title: string;
  rootQuestion: string;
  nodes: Array<{
    id: string;
    question?: string;
    condition?: string;
    result?: string;
    children?: string[];
    action?: string;
  }>;
}

export interface DataRequirementsResponse {
  title: string;
  options: Array<{
    option: string;
    score: number;
    requirements: Array<{
      field: string;
      description: string;
      source: string;
      difficulty: 'easy' | 'medium' | 'hard';
      example?: string;
    }>;
    accuracy: string;
    effort: string;
  }>;
}

export interface ComplianceMatrixResponse {
  title: string;
  requirements: Array<{
    requirement: string;
    description: string;
    mandatory: boolean;
    deadline?: string;
    documentation: string[];
    status?: 'compliant' | 'non_compliant' | 'partial';
  }>;
}

export interface PortfolioSummaryResponse {
  title: string;
  metrics: Array<{
    metric: string;
    value: string;
    status: 'good' | 'warning' | 'critical';
    target?: string;
    improvement?: string;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    effort: string;
  }>;
}

export interface PortfolioInsights {
  complianceStatus: 'compliant' | 'non_compliant' | 'partial';
  currentScore: number;
  loansNeedingImprovement: number;
  quickWins: number;
  majorImprovements: number;
  totalEmissions?: number;
  averageEmissions?: number;
}

// Query classification types
export interface QueryClassification {
  intent: QueryIntent;
  entities: QueryEntity[];
  context: QueryContext;
  complexity: 'simple' | 'moderate' | 'complex';
}

export type QueryIntent =
  | 'calculate'
  | 'explain'
  | 'compare'
  | 'implement'
  | 'comply'
  | 'analyze'
  | 'troubleshoot'
  | 'optimize';

export interface QueryEntity {
  type: 'vehicle_type' | 'calculation_method' | 'data_quality_option' | 'compliance_requirement' | 'portfolio_metric';
  value: string;
  confidence: number;
}

export interface QueryContext {
  domain: 'pcaf' | 'general';
  scope: 'single_loan' | 'portfolio' | 'methodology' | 'regulatory';
  urgency: 'immediate' | 'planning' | 'research';
}