export interface ClientDocument {
  id: string;
  name: string;
  type: 'policy' | 'procedure' | 'methodology' | 'template' | 'regulation';
  uploadDate: string;
  status: 'processing' | 'indexed' | 'error' | 'quarantined';
  size: number;
  language: string;
  extractedSections: number;
  confidenceScore: number;
  tags: string[];
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  author?: string;
  version?: string;
  effectiveDate?: string;
  reviewDate?: string;
  department?: string;
  approver?: string;
  relatedPolicies?: string[];
}

export interface ClientKnowledgeExtraction {
  documentId: string;
  extractedConcepts: ConceptExtraction[];
  customMethodologies: MethodologyOverride[];
  complianceRequirements: ComplianceRequirement[];
  conflictAnalysis: ConflictAnalysis;
}

export interface ConceptExtraction {
  id: string;
  concept: string;
  definition: string;
  context: string;
  confidence: number;
  relatedStandards: string[];
}

export interface MethodologyOverride {
  id: string;
  standardMethod: string;
  clientMethod: string;
  justification: string;
  impactAssessment: string;
  approvalRequired: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ComplianceRequirement {
  id: string;
  requirement: string;
  source: string;
  applicability: string;
  frequency: string;
  responsibility: string;
  automatable: boolean;
}

export interface ConflictAnalysis {
  hasConflicts: boolean;
  conflicts: PolicyConflict[];
  resolutionRecommendations: string[];
}

export interface PolicyConflict {
  id: string;
  conflictType: 'methodology' | 'threshold' | 'reporting' | 'governance';
  standardRequirement: string;
  clientRequirement: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  resolution: string;
}

export interface ClientContextIntegration {
  reportType: string;
  applicablePolicies: string[];
  methodologyAdjustments: MethodologyOverride[];
  customNarratives: CustomNarrative[];
  complianceChecks: ComplianceRequirement[];
}

export interface CustomNarrative {
  section: string;
  content: string;
  source: string;
  confidence: number;
}

class ClientRAGService {
  private clientDocuments: ClientDocument[] = [
    {
      id: 'doc-1',
      name: 'Sustainable Finance Policy 2024',
      type: 'policy',
      uploadDate: '2024-01-15T10:00:00Z',
      status: 'indexed',
      size: 2457600,
      language: 'en',
      extractedSections: 12,
      confidenceScore: 0.94,
      tags: ['sustainable-finance', 'esg', 'risk-management'],
      metadata: {
        author: 'Risk Management Team',
        version: '2024.1',
        effectiveDate: '2024-01-01',
        reviewDate: '2024-12-31',
        department: 'Risk & Compliance',
        approver: 'Chief Risk Officer'
      }
    },
    {
      id: 'doc-2',
      name: 'Carbon Accounting Methodology',
      type: 'methodology',
      uploadDate: '2024-01-10T14:30:00Z',
      status: 'indexed',
      size: 1876543,
      language: 'en',
      extractedSections: 8,
      confidenceScore: 0.91,
      tags: ['carbon-accounting', 'methodology', 'calculations'],
      metadata: {
        author: 'ESG Analytics Team',
        version: '3.2',
        effectiveDate: '2024-01-01',
        department: 'ESG & Sustainability'
      }
    },
    {
      id: 'doc-3',
      name: 'Loan Classification Guidelines',
      type: 'procedure',
      uploadDate: '2024-01-20T09:15:00Z',
      status: 'processing',
      size: 987432,
      language: 'en',
      extractedSections: 0,
      confidenceScore: 0,
      tags: [],
      metadata: {
        author: 'Credit Risk Team',
        version: '2024.1',
        department: 'Credit Risk'
      }
    }
  ];

  private mockExtractions: ClientKnowledgeExtraction[] = [
    {
      documentId: 'doc-1',
      extractedConcepts: [
        {
          id: 'concept-1',
          concept: 'Green Asset Classification',
          definition: 'Assets meeting internal sustainability criteria including emission thresholds and environmental impact assessments',
          context: 'Used for preferential pricing and portfolio allocation decisions',
          confidence: 0.92,
          relatedStandards: ['EU Taxonomy', 'PCAF']
        }
      ],
      customMethodologies: [
        {
          id: 'method-1',
          standardMethod: 'PCAF Asset-Specific Approach',
          clientMethod: 'Enhanced Asset-Specific with Internal ESG Scoring',
          justification: 'Incorporates additional ESG risk factors beyond standard emission calculations',
          impactAssessment: 'May result in 5-10% variation from standard PCAF calculations',
          approvalRequired: true,
          riskLevel: 'medium'
        }
      ],
      complianceRequirements: [
        {
          id: 'req-1',
          requirement: 'Quarterly ESG risk assessment for all loans >€5M',
          source: 'Internal Sustainable Finance Policy 2024',
          applicability: 'All loan origination and portfolio monitoring',
          frequency: 'Quarterly',
          responsibility: 'ESG Risk Team',
          automatable: true
        }
      ],
      conflictAnalysis: {
        hasConflicts: false,
        conflicts: [],
        resolutionRecommendations: []
      }
    }
  ];

  async getClientDocuments(): Promise<ClientDocument[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.clientDocuments;
  }

  async uploadDocument(
    file: File,
    metadata: Partial<DocumentMetadata>
  ): Promise<{ documentId: string; status: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newDoc: ClientDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: 'policy', // Would be determined by AI classification
      uploadDate: new Date().toISOString(),
      status: 'processing',
      size: file.size,
      language: 'en',
      extractedSections: 0,
      confidenceScore: 0,
      tags: [],
      metadata: metadata as DocumentMetadata
    };
    
    this.clientDocuments.push(newDoc);
    
    // Simulate processing
    setTimeout(() => {
      newDoc.status = 'indexed';
      newDoc.extractedSections = Math.floor(Math.random() * 15) + 3;
      newDoc.confidenceScore = 0.8 + Math.random() * 0.2;
      newDoc.tags = ['auto-classified', 'newly-processed'];
    }, 3000);
    
    return {
      documentId: newDoc.id,
      status: 'processing'
    };
  }

  async processDocument(documentId: string): Promise<ClientKnowledgeExtraction> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock processing results
    return {
      documentId,
      extractedConcepts: [
        {
          id: `concept-${Date.now()}`,
          concept: 'Custom Risk Threshold',
          definition: 'Internal risk categorization specific to client methodology',
          context: 'Applied during loan origination and portfolio review processes',
          confidence: 0.88,
          relatedStandards: ['PCAF', 'Basel III']
        }
      ],
      customMethodologies: [
        {
          id: `method-${Date.now()}`,
          standardMethod: 'Standard PCAF Calculation',
          clientMethod: 'Client-Specific Calculation with Internal Adjustments',
          justification: 'Reflects specific business model and risk appetite',
          impactAssessment: 'Minor impact on overall portfolio metrics',
          approvalRequired: false,
          riskLevel: 'low'
        }
      ],
      complianceRequirements: [
        {
          id: `req-${Date.now()}`,
          requirement: 'Monthly carbon footprint reporting for large exposures',
          source: document.getElementById(documentId)?.textContent || 'Client Document',
          applicability: 'Loans >€10M',
          frequency: 'Monthly',
          responsibility: 'Portfolio Management',
          automatable: true
        }
      ],
      conflictAnalysis: {
        hasConflicts: false,
        conflicts: [],
        resolutionRecommendations: []
      }
    };
  }

  async getClientContext(reportType: string): Promise<ClientContextIntegration> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      reportType,
      applicablePolicies: ['doc-1', 'doc-2'],
      methodologyAdjustments: [
        {
          id: 'adj-1',
          standardMethod: 'PCAF Data Quality Scoring',
          clientMethod: 'Enhanced Quality Scoring with Internal Verifications',
          justification: 'Additional quality controls required by internal policy',
          impactAssessment: 'Improved data reliability, minimal calculation impact',
          approvalRequired: false,
          riskLevel: 'low'
        }
      ],
      customNarratives: [
        {
          section: 'Methodology Overview',
          content: 'This analysis follows PCAF Global Standard requirements while incorporating [Bank Name] specific enhancements as outlined in our Sustainable Finance Policy 2024. Additional ESG risk factors are considered to provide comprehensive portfolio assessment.',
          source: 'Sustainable Finance Policy 2024',
          confidence: 0.95
        },
        {
          section: 'Data Quality Assurance',
          content: 'All calculations undergo additional verification procedures as required by internal risk management protocols. Data quality scores reflect both PCAF standards and enhanced internal validation processes.',
          source: 'Carbon Accounting Methodology v3.2',
          confidence: 0.91
        }
      ],
      complianceChecks: [
        {
          id: 'check-1',
          requirement: 'Board-level ESG reporting quarterly',
          source: 'Sustainable Finance Policy 2024',
          applicability: 'All financed emissions reports',
          frequency: 'Quarterly',
          responsibility: 'ESG Team',
          automatable: false
        }
      ]
    };
  }

  async validateAgainstClientPolicies(
    calculationData: any
  ): Promise<{
    isCompliant: boolean;
    policyConflicts: PolicyConflict[];
    recommendations: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      isCompliant: true,
      policyConflicts: [],
      recommendations: [
        'Consider adding ESG risk scoring to enhance standard PCAF methodology',
        'Include quarterly board reporting metrics as required by internal policy',
        'Verify data collection processes align with enhanced quality requirements'
      ]
    };
  }

  async searchClientKnowledge(query: string): Promise<{
    documents: ClientDocument[];
    concepts: ConceptExtraction[];
    methodologies: MethodologyOverride[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const relevantDocs = this.clientDocuments.filter(doc => 
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    return {
      documents: relevantDocs,
      concepts: this.mockExtractions[0]?.extractedConcepts || [],
      methodologies: this.mockExtractions[0]?.customMethodologies || []
    };
  }

  async getDocumentStatus(documentId: string): Promise<{
    status: string;
    progress: number;
    nextStep: string;
    estimatedCompletion?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const doc = this.clientDocuments.find(d => d.id === documentId);
    if (!doc) {
      throw new Error('Document not found');
    }
    
    const statusInfo = {
      'processing': {
        progress: 45,
        nextStep: 'Extracting key concepts and methodologies',
        estimatedCompletion: '2024-01-30T12:30:00Z'
      },
      'indexed': {
        progress: 100,
        nextStep: 'Ready for use in calculations and reports'
      },
      'error': {
        progress: 0,
        nextStep: 'Please re-upload document or contact support'
      },
      'quarantined': {
        progress: 0,
        nextStep: 'Manual review required due to policy conflicts'
      }
    };
    
    return {
      status: doc.status,
      ...statusInfo[doc.status]
    };
  }
}

export const clientRAGService = new ClientRAGService();