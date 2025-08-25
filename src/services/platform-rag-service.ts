export interface AIAgent {
  id: string;
  name: string;
  type: 'calculation' | 'compliance' | 'reporting' | 'advisory';
  status: 'active' | 'processing' | 'idle' | 'error';
  lastActive: string;
  processingQueue: number;
  successRate: number;
  avgResponseTime: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: 'regulation' | 'standard' | 'guideline' | 'methodology';
  source: string;
  version: string;
  status: 'current' | 'outdated' | 'deprecated';
  lastUpdated: string;
  relevanceScore: number;
  sections: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  tags: string[];
  embeddings?: number[];
}

export interface AgentResponse {
  agentId: string;
  query: string;
  response: string;
  confidence: number;
  sources: DocumentReference[];
  timestamp: string;
  processingTime: number;
}

export interface DocumentReference {
  documentId: string;
  sectionId: string;
  title: string;
  relevanceScore: number;
  excerpt: string;
}

export interface ValidationResult {
  isCompliant: boolean;
  issues: ComplianceIssue[];
  recommendations: string[];
  overallScore: number;
  checkedRegulations: string[];
}

export interface ComplianceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  regulation: string;
  section: string;
  description: string;
  suggestedFix: string;
  affectedCalculations: string[];
}

class PlatformRAGService {
  private agents: AIAgent[] = [
    {
      id: 'calc-agent-1',
      name: 'Calculation Validation Agent',
      type: 'calculation',
      status: 'active',
      lastActive: '2024-01-30T11:45:00Z',
      processingQueue: 3,
      successRate: 0.97,
      avgResponseTime: 1.2
    },
    {
      id: 'comp-agent-1',
      name: 'Compliance Verification Agent',
      type: 'compliance',
      status: 'active',
      lastActive: '2024-01-30T11:42:00Z',
      processingQueue: 1,
      successRate: 0.94,
      avgResponseTime: 2.8
    },
    {
      id: 'report-agent-1',
      name: 'Report Generation Agent',
      type: 'reporting',
      status: 'processing',
      lastActive: '2024-01-30T11:40:00Z',
      processingQueue: 5,
      successRate: 0.99,
      avgResponseTime: 3.5
    },
    {
      id: 'advisory-agent-1',
      name: 'Strategic Advisory Agent',
      type: 'advisory',
      status: 'idle',
      lastActive: '2024-01-30T11:30:00Z',
      processingQueue: 0,
      successRate: 0.92,
      avgResponseTime: 4.2
    }
  ];

  private knowledgeBase: KnowledgeDocument[] = [
    {
      id: 'pcaf-standard-2023',
      title: 'PCAF Global GHG Accounting & Reporting Standard',
      type: 'standard',
      source: 'Partnership for Carbon Accounting Financials',
      version: '2023.1',
      status: 'current',
      lastUpdated: '2024-01-15T00:00:00Z',
      relevanceScore: 0.98,
      sections: [
        {
          id: 'pcaf-motor-vehicles',
          title: 'Motor Vehicle Financing',
          content: 'Motor vehicle financing calculations should use actual vehicle data where available...',
          tags: ['motor-vehicles', 'calculation', 'data-quality']
        },
        {
          id: 'pcaf-real-estate',
          title: 'Real Estate Financing',
          content: 'Commercial real estate emissions are calculated based on building energy consumption...',
          tags: ['real-estate', 'commercial', 'energy-consumption']
        }
      ]
    },
    {
      id: 'eu-taxonomy-2024',
      title: 'EU Taxonomy Regulation Technical Criteria',
      type: 'regulation',
      source: 'European Commission',
      version: '2024.1',
      status: 'current',
      lastUpdated: '2024-01-01T00:00:00Z',
      relevanceScore: 0.85,
      sections: [
        {
          id: 'eu-climate-mitigation',
          title: 'Climate Change Mitigation',
          content: 'Activities substantially contributing to climate change mitigation must meet specific criteria...',
          tags: ['eu-taxonomy', 'climate-mitigation', 'criteria']
        }
      ]
    }
  ];

  async getAgents(): Promise<AIAgent[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.agents;
  }

  async getKnowledgeBase(): Promise<KnowledgeDocument[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.knowledgeBase;
  }

  async queryAgent(
    agentType: 'calculation' | 'compliance' | 'reporting' | 'advisory',
    query: string,
    context?: any
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const agent = this.agents.find(a => a.type === agentType);
    if (!agent) {
      throw new Error(`Agent of type ${agentType} not found`);
    }

    // Mock responses based on agent type
    const responses = {
      calculation: {
        response: "Based on PCAF standards, I recommend using data quality score 2 for this motor vehicle calculation. The asset-specific data approach is most appropriate given the available loan information. Consider collecting additional vehicle specification data to improve accuracy.",
        confidence: 0.92,
        sources: [
          {
            documentId: 'pcaf-standard-2023',
            sectionId: 'pcaf-motor-vehicles',
            title: 'Motor Vehicle Financing',
            relevanceScore: 0.95,
            excerpt: 'Motor vehicle financing calculations should use actual vehicle data where available...'
          }
        ]
      },
      compliance: {
        response: "The calculation methodology aligns with PCAF requirements. However, I identified 2 potential compliance issues with EU Taxonomy alignment. The emission intensity exceeds the substantial contribution threshold for climate mitigation activities.",
        confidence: 0.87,
        sources: [
          {
            documentId: 'eu-taxonomy-2024',
            sectionId: 'eu-climate-mitigation',
            title: 'Climate Change Mitigation',
            relevanceScore: 0.89,
            excerpt: 'Activities substantially contributing to climate change mitigation must meet specific criteria...'
          }
        ]
      },
      reporting: {
        response: "I've generated a comprehensive narrative explaining the methodology used for this portfolio. The report includes data quality assessments, uncertainty analysis, and clear explanations of any assumptions made. All PCAF disclosure requirements are addressed.",
        confidence: 0.96,
        sources: [
          {
            documentId: 'pcaf-standard-2023',
            sectionId: 'pcaf-real-estate',
            title: 'Real Estate Financing',
            relevanceScore: 0.91,
            excerpt: 'Commercial real estate emissions are calculated based on building energy consumption...'
          }
        ]
      },
      advisory: {
        response: "To improve portfolio emissions intensity, I recommend prioritizing loans for electric vehicles and energy-efficient buildings. Consider implementing green loan products with preferential rates for low-carbon assets. The current portfolio has 23% improvement potential through strategic asset selection.",
        confidence: 0.88,
        sources: [
          {
            documentId: 'pcaf-standard-2023',
            sectionId: 'pcaf-motor-vehicles',
            title: 'Motor Vehicle Financing',
            relevanceScore: 0.85,
            excerpt: 'Motor vehicle financing calculations should use actual vehicle data where available...'
          }
        ]
      }
    };

    const response = responses[agentType];
    const processingTime = Date.now() - startTime;

    // Update agent status
    agent.lastActive = new Date().toISOString();
    agent.processingQueue = Math.max(0, agent.processingQueue - 1);

    return {
      agentId: agent.id,
      query,
      response: response.response,
      confidence: response.confidence,
      sources: response.sources,
      timestamp: new Date().toISOString(),
      processingTime
    };
  }

  async validateCompliance(calculationData: any): Promise<ValidationResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const issues: ComplianceIssue[] = [
      {
        severity: 'medium',
        regulation: 'PCAF Standard 2023',
        section: 'Data Quality Requirements',
        description: 'Some loans are using data quality score 4, which may impact portfolio accuracy',
        suggestedFix: 'Collect additional asset-specific data to improve quality scores',
        affectedCalculations: ['motor-vehicle-portfolio', 'real-estate-commercial']
      },
      {
        severity: 'low',
        regulation: 'EU Taxonomy',
        section: 'Substantial Contribution Criteria',
        description: 'Minor misalignment with climate mitigation thresholds for 3 assets',
        suggestedFix: 'Review asset classification and update where appropriate',
        affectedCalculations: ['commercial-buildings-subset']
      }
    ];

    return {
      isCompliant: issues.every(i => i.severity !== 'critical'),
      issues,
      recommendations: [
        'Improve data collection processes for better quality scores',
        'Implement regular compliance monitoring for EU Taxonomy alignment',
        'Consider developing internal guidelines for edge cases'
      ],
      overallScore: 0.87,
      checkedRegulations: ['PCAF Standard 2023', 'EU Taxonomy 2024', 'GHG Protocol']
    };
  }

  async generateReportNarrative(
    reportType: 'portfolio-summary' | 'detailed-analysis' | 'methodology',
    data: any
  ): Promise<{
    narrative: string;
    sections: { title: string; content: string }[];
    sources: DocumentReference[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const narratives = {
      'portfolio-summary': {
        narrative: "This portfolio assessment demonstrates strong alignment with PCAF methodological requirements while highlighting opportunities for emission reduction.",
        sections: [
          {
            title: "Portfolio Overview",
            content: "The analyzed portfolio comprises 1,247 loans across motor vehicles and real estate sectors, representing €2.3B in outstanding balances. Weighted average data quality score of 2.4 indicates robust data foundation for emission calculations."
          },
          {
            title: "Key Findings",
            content: "Total financed emissions of 145,678 tCO2e with emission intensity of 63.4 tCO2e/€M. Motor vehicle segment shows 15% improvement over previous period due to increased EV financing."
          }
        ]
      },
      'detailed-analysis': {
        narrative: "Comprehensive analysis reveals sector-specific patterns and data quality variations that inform strategic decision-making.",
        sections: [
          {
            title: "Methodology Applied",
            content: "Asset-specific approach utilized for 78% of portfolio, with asset-class approach for remaining positions due to data limitations. All calculations follow PCAF Global Standard 2023 requirements."
          },
          {
            title: "Data Quality Assessment",
            content: "Data quality scores range from 1-4, with average of 2.4. Real estate portfolio demonstrates superior data availability compared to motor vehicle segment."
          }
        ]
      },
      'methodology': {
        narrative: "Calculation methodology strictly adheres to PCAF Global Standard requirements with bank-specific adaptations for data constraints.",
        sections: [
          {
            title: "Calculation Approach",
            content: "Asset-specific calculations used where loan-level data permits. Attribution factors calculated using outstanding balance method. Emission factors sourced from PCAF database with regional adjustments."
          }
        ]
      }
    };

    const result = narratives[reportType];
    
    return {
      narrative: result.narrative,
      sections: result.sections,
      sources: [
        {
          documentId: 'pcaf-standard-2023',
          sectionId: 'pcaf-motor-vehicles',
          title: 'Motor Vehicle Financing',
          relevanceScore: 0.95,
          excerpt: 'Motor vehicle financing calculations should use actual vehicle data where available...'
        }
      ]
    };
  }

  async searchKnowledge(query: string): Promise<DocumentReference[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock search results
    return [
      {
        documentId: 'pcaf-standard-2023',
        sectionId: 'pcaf-motor-vehicles',
        title: 'Motor Vehicle Financing Guidelines',
        relevanceScore: 0.92,
        excerpt: 'Asset-specific approach recommended when vehicle specifications are available...'
      },
      {
        documentId: 'eu-taxonomy-2024',
        sectionId: 'eu-climate-mitigation',
        title: 'Sustainable Finance Taxonomy',
        relevanceScore: 0.78,
        excerpt: 'Transportation activities must meet specific emission thresholds...'
      }
    ];
  }
}

export const platformRAGService = new PlatformRAGService();