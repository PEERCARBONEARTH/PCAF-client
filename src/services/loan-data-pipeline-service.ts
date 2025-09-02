/**
 * Loan Data Pipeline Service - Handles uploaded loan data across PCAF instruments
 * Automatically processes, embeds, and stores loan data in ChromaDB for contextual AI
 */

import { chromaDBService, ChromaDocument } from './chroma-db-service';

// PCAF Instrument Types
export type PCAFInstrument = 'auto_loans' | 'commercial_real_estate' | 'project_finance';

// Loan data structure for different instruments
export interface LoanDataUpload {
  instrument: PCAFInstrument;
  loans: LoanRecord[];
  metadata: {
    uploadId: string;
    uploadDate: Date;
    source: string;
    bankId?: string;
    dataQuality?: number;
  };
}

export interface LoanRecord {
  id: string;
  instrument: PCAFInstrument;
  
  // Common fields across all instruments
  loanAmount: number;
  outstandingBalance: number;
  originationDate: Date;
  maturityDate?: Date;
  interestRate?: number;
  borrowerName?: string;
  
  // Auto Loans specific
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    fuelType: 'Electric' | 'Hybrid' | 'Gasoline' | 'Diesel';
    emissions?: number; // tCO2e annually
    efficiency?: number; // mpg or kWh/100mi
  };
  
  // Commercial Real Estate specific
  propertyDetails?: {
    propertyType: 'Office' | 'Retail' | 'Industrial' | 'Multifamily' | 'Hotel' | 'Other';
    squareFootage: number;
    location: string;
    energyRating?: string;
    annualEnergyUse?: number; // kWh
    emissions?: number; // tCO2e annually
  };
  
  // Project Finance specific
  projectDetails?: {
    projectType: 'Renewable Energy' | 'Infrastructure' | 'Oil & Gas' | 'Mining' | 'Other';
    sector: string;
    location: string;
    capacity?: number;
    expectedEmissions?: number; // tCO2e annually
    projectStatus: 'Planning' | 'Construction' | 'Operational' | 'Completed';
  };
  
  // PCAF Data Quality
  pcafScore?: number; // 1-5 scale
  dataQualityNotes?: string;
  
  // Additional metadata
  customFields?: Record<string, any>;
}

export interface ProcessingResult {
  success: boolean;
  uploadId: string;
  totalLoans: number;
  processedLoans: number;
  embeddedDocuments: number;
  collectionName: string;
  processingTimeMs: number;
  errors: string[];
  summary: {
    byInstrument: Record<PCAFInstrument, number>;
    avgDataQuality: number;
    totalEmissions: number;
    complianceRate: number;
  };
}

class LoanDataPipelineService {
  private static instance: LoanDataPipelineService;

  static getInstance(): LoanDataPipelineService {
    if (!LoanDataPipelineService.instance) {
      LoanDataPipelineService.instance = new LoanDataPipelineService();
    }
    return LoanDataPipelineService.instance;
  }

  /**
   * Process uploaded loan data and embed into ChromaDB
   */
  async processLoanDataUpload(uploadData: LoanDataUpload): Promise<ProcessingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    console.log(`🚀 Processing loan data upload: ${uploadData.metadata.uploadId}`);
    console.log(`📊 Instrument: ${uploadData.instrument}, Loans: ${uploadData.loans.length}`);

    try {
      // Validate upload data
      const validationResult = this.validateUploadData(uploadData);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Generate collection name based on instrument and upload
      const collectionName = this.generateCollectionName(uploadData.instrument, uploadData.metadata.uploadId);

      // Process each loan into ChromaDB documents
      const documents: ChromaDocument[] = [];
      let processedLoans = 0;
      let totalEmissions = 0;
      let totalDataQuality = 0;
      let compliantLoans = 0;

      const byInstrument: Record<PCAFInstrument, number> = {
        auto_loans: 0,
        commercial_real_estate: 0,
        project_finance: 0
      };

      for (const loan of uploadData.loans) {
        try {
          // Generate comprehensive document content for embedding
          const documentContent = this.generateLoanDocumentContent(loan, uploadData.metadata);
          
          // Calculate emissions and compliance
          const emissions = this.calculateLoanEmissions(loan);
          const pcafScore = loan.pcafScore || uploadData.metadata.dataQuality || 3;
          const isCompliant = pcafScore <= 3;

          // Create ChromaDB document
          const document: ChromaDocument = {
            id: `${uploadData.metadata.uploadId}_${loan.id}`,
            content: documentContent,
            metadata: {
              type: 'uploaded_loan',
              source: uploadData.metadata.source,
              timestamp: uploadData.metadata.uploadDate,
              dataQuality: pcafScore,
              tags: this.generateLoanTags(loan),
              
              // Loan-specific metadata
              instrument: loan.instrument,
              loanId: loan.id,
              uploadId: uploadData.metadata.uploadId,
              loanAmount: loan.loanAmount,
              outstandingBalance: loan.outstandingBalance,
              emissions: emissions,
              pcafScore: pcafScore,
              isCompliant: isCompliant,
              
              // Instrument-specific metadata
              ...this.generateInstrumentMetadata(loan)
            }
          };

          documents.push(document);
          processedLoans++;
          totalEmissions += emissions;
          totalDataQuality += pcafScore;
          byInstrument[loan.instrument]++;
          
          if (isCompliant) compliantLoans++;

        } catch (error) {
          console.error(`Failed to process loan ${loan.id}:`, error);
          errors.push(`Loan ${loan.id}: ${error.message}`);
        }
      }

      // Store documents in ChromaDB
      console.log(`📚 Embedding ${documents.length} loan documents into ChromaDB...`);
      const addResult = await chromaDBService.addDocuments(collectionName, documents);

      // Generate processing summary
      const summary = {
        byInstrument,
        avgDataQuality: totalDataQuality / processedLoans,
        totalEmissions,
        complianceRate: (compliantLoans / processedLoans) * 100
      };

      const result: ProcessingResult = {
        success: true,
        uploadId: uploadData.metadata.uploadId,
        totalLoans: uploadData.loans.length,
        processedLoans,
        embeddedDocuments: addResult.added + addResult.updated,
        collectionName,
        processingTimeMs: Date.now() - startTime,
        errors,
        summary
      };

      console.log(`✅ Loan data processing completed:`);
      console.log(`   - Processed: ${processedLoans}/${uploadData.loans.length} loans`);
      console.log(`   - Embedded: ${result.embeddedDocuments} documents`);
      console.log(`   - Avg PCAF Score: ${summary.avgDataQuality.toFixed(1)}`);
      console.log(`   - Compliance Rate: ${summary.complianceRate.toFixed(1)}%`);
      console.log(`   - Total Emissions: ${summary.totalEmissions.toFixed(1)} tCO2e`);

      return result;

    } catch (error) {
      console.error('❌ Loan data processing failed:', error);
      return {
        success: false,
        uploadId: uploadData.metadata.uploadId,
        totalLoans: uploadData.loans.length,
        processedLoans: 0,
        embeddedDocuments: 0,
        collectionName: '',
        processingTimeMs: Date.now() - startTime,
        errors: [error.message],
        summary: {
          byInstrument: { auto_loans: 0, commercial_real_estate: 0, project_finance: 0 },
          avgDataQuality: 0,
          totalEmissions: 0,
          complianceRate: 0
        }
      };
    }
  }

  /**
   * Search uploaded loan data using AI-powered semantic search
   */
  async searchLoanData(
    query: string,
    options?: {
      instrument?: PCAFInstrument;
      uploadId?: string;
      minDataQuality?: number;
      maxEmissions?: number;
      limit?: number;
    }
  ): Promise<Array<{
    loan: LoanRecord;
    similarity: number;
    relevanceScore: number;
    insights: string[];
  }>> {
    try {
      // Build search filters
      const filters: Record<string, any> = {
        type: 'uploaded_loan'
      };

      if (options?.instrument) {
        filters.instrument = options.instrument;
      }
      if (options?.uploadId) {
        filters.uploadId = options.uploadId;
      }
      if (options?.minDataQuality) {
        filters.dataQuality = { max: options.minDataQuality };
      }
      if (options?.maxEmissions) {
        filters.emissions = { max: options.maxEmissions };
      }

      // Perform semantic search
      const searchResults = await chromaDBService.searchDocuments(query, {
        limit: options?.limit || 20,
        filters,
        minSimilarity: 0.3
      });

      // Process results and generate insights
      const results = [];
      for (const result of searchResults) {
        const loanData = this.reconstructLoanFromDocument(result.document);
        const insights = this.generateLoanInsights(loanData, query);

        results.push({
          loan: loanData,
          similarity: result.similarity,
          relevanceScore: result.relevanceScore,
          insights
        });
      }

      return results;

    } catch (error) {
      console.error('Loan data search failed:', error);
      return [];
    }
  }

  /**
   * Get analytics for uploaded loan data
   */
  async getLoanDataAnalytics(uploadId?: string): Promise<{
    totalLoans: number;
    byInstrument: Record<PCAFInstrument, {
      count: number;
      avgEmissions: number;
      avgDataQuality: number;
      complianceRate: number;
    }>;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
    topEmitters: Array<{
      loanId: string;
      emissions: number;
      instrument: PCAFInstrument;
    }>;
    dataQualityDistribution: Record<number, number>;
  }> {
    try {
      const filters: Record<string, any> = { type: 'uploaded_loan' };
      if (uploadId) filters.uploadId = uploadId;

      const documents = await chromaDBService.getDocumentsByMetadata(filters);

      const analytics = {
        totalLoans: documents.length,
        byInstrument: {
          auto_loans: { count: 0, avgEmissions: 0, avgDataQuality: 0, complianceRate: 0 },
          commercial_real_estate: { count: 0, avgEmissions: 0, avgDataQuality: 0, complianceRate: 0 },
          project_finance: { count: 0, avgEmissions: 0, avgDataQuality: 0, complianceRate: 0 }
        },
        riskDistribution: { low: 0, medium: 0, high: 0 },
        topEmitters: [] as Array<{ loanId: string; emissions: number; instrument: PCAFInstrument }>,
        dataQualityDistribution: {} as Record<number, number>
      };

      // Process each document
      const emittersList: Array<{ loanId: string; emissions: number; instrument: PCAFInstrument }> = [];

      for (const doc of documents) {
        const instrument = doc.metadata.instrument as PCAFInstrument;
        const emissions = doc.metadata.emissions || 0;
        const dataQuality = doc.metadata.dataQuality || 5;
        const isCompliant = doc.metadata.isCompliant || false;

        // By instrument analytics
        const instrumentStats = analytics.byInstrument[instrument];
        instrumentStats.count++;
        instrumentStats.avgEmissions += emissions;
        instrumentStats.avgDataQuality += dataQuality;
        if (isCompliant) instrumentStats.complianceRate++;

        // Risk distribution
        if (dataQuality <= 2) analytics.riskDistribution.low++;
        else if (dataQuality <= 3) analytics.riskDistribution.medium++;
        else analytics.riskDistribution.high++;

        // Data quality distribution
        analytics.dataQualityDistribution[dataQuality] = (analytics.dataQualityDistribution[dataQuality] || 0) + 1;

        // Top emitters
        emittersList.push({
          loanId: doc.metadata.loanId,
          emissions,
          instrument
        });
      }

      // Calculate averages and percentages
      for (const instrument of Object.keys(analytics.byInstrument) as PCAFInstrument[]) {
        const stats = analytics.byInstrument[instrument];
        if (stats.count > 0) {
          stats.avgEmissions /= stats.count;
          stats.avgDataQuality /= stats.count;
          stats.complianceRate = (stats.complianceRate / stats.count) * 100;
        }
      }

      // Top 10 emitters
      analytics.topEmitters = emittersList
        .sort((a, b) => b.emissions - a.emissions)
        .slice(0, 10);

      return analytics;

    } catch (error) {
      console.error('Failed to get loan data analytics:', error);
      throw error;
    }
  }

  /**
   * Generate contextual AI insights for loan portfolio
   */
  async generatePortfolioInsights(uploadId: string): Promise<Array<{
    type: 'risk' | 'opportunity' | 'compliance' | 'performance';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionItems: string[];
    affectedLoans: string[];
  }>> {
    try {
      const analytics = await this.getLoanDataAnalytics(uploadId);
      const insights = [];

      // Risk insights
      if (analytics.riskDistribution.high > analytics.totalLoans * 0.2) {
        insights.push({
          type: 'risk' as const,
          title: 'High Data Quality Risk Detected',
          description: `${analytics.riskDistribution.high} loans (${((analytics.riskDistribution.high / analytics.totalLoans) * 100).toFixed(1)}%) have PCAF scores above 3, indicating poor data quality.`,
          impact: 'high' as const,
          actionItems: [
            'Implement data collection improvements',
            'Engage borrowers for better data',
            'Consider third-party data sources'
          ],
          affectedLoans: analytics.topEmitters.slice(0, 5).map(e => e.loanId)
        });
      }

      // Opportunity insights
      const autoLoansStats = analytics.byInstrument.auto_loans;
      if (autoLoansStats.count > 0 && autoLoansStats.avgEmissions > 3.0) {
        insights.push({
          type: 'opportunity' as const,
          title: 'EV Transition Opportunity',
          description: `Auto loan portfolio has high average emissions (${autoLoansStats.avgEmissions.toFixed(1)} tCO2e). Promoting EV financing could reduce emissions significantly.`,
          impact: 'medium' as const,
          actionItems: [
            'Launch EV-specific loan products',
            'Offer preferential rates for EVs',
            'Partner with EV manufacturers'
          ],
          affectedLoans: []
        });
      }

      // Compliance insights
      const overallCompliance = Object.values(analytics.byInstrument)
        .reduce((sum, stats) => sum + (stats.complianceRate * stats.count), 0) / analytics.totalLoans;

      if (overallCompliance < 80) {
        insights.push({
          type: 'compliance' as const,
          title: 'PCAF Compliance Below Target',
          description: `Portfolio compliance rate is ${overallCompliance.toFixed(1)}%, below the 80% target. Focus on data quality improvements.`,
          impact: 'high' as const,
          actionItems: [
            'Prioritize data quality initiatives',
            'Implement automated data validation',
            'Train staff on PCAF requirements'
          ],
          affectedLoans: []
        });
      }

      return insights;

    } catch (error) {
      console.error('Failed to generate portfolio insights:', error);
      return [];
    }
  }

  /**
   * Private helper methods
   */

  private validateUploadData(uploadData: LoanDataUpload): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!uploadData.metadata.uploadId) {
      errors.push('Upload ID is required');
    }

    if (!uploadData.loans || uploadData.loans.length === 0) {
      errors.push('No loan data provided');
    }

    if (!['auto_loans', 'commercial_real_estate', 'project_finance'].includes(uploadData.instrument)) {
      errors.push('Invalid PCAF instrument type');
    }

    // Validate individual loans
    for (const loan of uploadData.loans || []) {
      if (!loan.id) errors.push(`Loan missing ID`);
      if (!loan.loanAmount || loan.loanAmount <= 0) errors.push(`Loan ${loan.id}: Invalid loan amount`);
      if (!loan.outstandingBalance || loan.outstandingBalance < 0) errors.push(`Loan ${loan.id}: Invalid outstanding balance`);
    }

    return { isValid: errors.length === 0, errors };
  }

  private generateCollectionName(instrument: PCAFInstrument, uploadId: string): string {
    return `uploaded_loans_${instrument}_${uploadId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private generateLoanDocumentContent(loan: LoanRecord, metadata: any): string {
    let content = `
LOAN ANALYSIS - ${loan.id}

Upload Information:
- Upload ID: ${metadata.uploadId}
- Source: ${metadata.source}
- Upload Date: ${metadata.uploadDate.toISOString().split('T')[0]}
- Instrument: ${loan.instrument.replace('_', ' ').toUpperCase()}

Loan Details:
- Loan Amount: $${loan.loanAmount.toLocaleString()}
- Outstanding Balance: $${loan.outstandingBalance.toLocaleString()}
- Origination Date: ${loan.originationDate.toISOString().split('T')[0]}
- Interest Rate: ${loan.interestRate ? loan.interestRate.toFixed(2) + '%' : 'N/A'}
- Borrower: ${loan.borrowerName || 'Not specified'}
`;

    // Add instrument-specific details
    if (loan.vehicleDetails) {
      content += `
Vehicle Information:
- Make/Model: ${loan.vehicleDetails.make} ${loan.vehicleDetails.model}
- Year: ${loan.vehicleDetails.year}
- Fuel Type: ${loan.vehicleDetails.fuelType}
- Annual Emissions: ${loan.vehicleDetails.emissions?.toFixed(2) || 'N/A'} tCO2e
- Efficiency: ${loan.vehicleDetails.efficiency || 'N/A'}
`;
    }

    if (loan.propertyDetails) {
      content += `
Property Information:
- Type: ${loan.propertyDetails.propertyType}
- Square Footage: ${loan.propertyDetails.squareFootage.toLocaleString()} sq ft
- Location: ${loan.propertyDetails.location}
- Energy Rating: ${loan.propertyDetails.energyRating || 'N/A'}
- Annual Energy Use: ${loan.propertyDetails.annualEnergyUse?.toLocaleString() || 'N/A'} kWh
- Annual Emissions: ${loan.propertyDetails.emissions?.toFixed(2) || 'N/A'} tCO2e
`;
    }

    if (loan.projectDetails) {
      content += `
Project Information:
- Type: ${loan.projectDetails.projectType}
- Sector: ${loan.projectDetails.sector}
- Location: ${loan.projectDetails.location}
- Status: ${loan.projectDetails.projectStatus}
- Capacity: ${loan.projectDetails.capacity || 'N/A'}
- Expected Emissions: ${loan.projectDetails.expectedEmissions?.toFixed(2) || 'N/A'} tCO2e
`;
    }

    // Add PCAF information
    content += `
PCAF Assessment:
- Data Quality Score: ${loan.pcafScore || 'N/A'}/5
- Compliance Status: ${(loan.pcafScore || 5) <= 3 ? 'COMPLIANT' : 'NON-COMPLIANT'}
- Data Quality Notes: ${loan.dataQualityNotes || 'None'}
`;

    return content.trim();
  }

  private generateLoanTags(loan: LoanRecord): string[] {
    const tags = [loan.instrument, 'uploaded_loan'];

    if (loan.vehicleDetails) {
      tags.push(loan.vehicleDetails.fuelType.toLowerCase(), loan.vehicleDetails.make.toLowerCase());
    }

    if (loan.propertyDetails) {
      tags.push(loan.propertyDetails.propertyType.toLowerCase(), 'real_estate');
    }

    if (loan.projectDetails) {
      tags.push(loan.projectDetails.projectType.toLowerCase().replace(/\s+/g, '_'), 'project_finance');
    }

    const pcafScore = loan.pcafScore || 5;
    tags.push(pcafScore <= 3 ? 'compliant' : 'non_compliant');
    tags.push(`pcaf_${pcafScore}`);

    return tags;
  }

  private generateInstrumentMetadata(loan: LoanRecord): Record<string, any> {
    const metadata: Record<string, any> = {};

    if (loan.vehicleDetails) {
      metadata.vehicleMake = loan.vehicleDetails.make;
      metadata.vehicleModel = loan.vehicleDetails.model;
      metadata.fuelType = loan.vehicleDetails.fuelType;
      metadata.vehicleYear = loan.vehicleDetails.year;
    }

    if (loan.propertyDetails) {
      metadata.propertyType = loan.propertyDetails.propertyType;
      metadata.squareFootage = loan.propertyDetails.squareFootage;
      metadata.propertyLocation = loan.propertyDetails.location;
    }

    if (loan.projectDetails) {
      metadata.projectType = loan.projectDetails.projectType;
      metadata.projectSector = loan.projectDetails.sector;
      metadata.projectStatus = loan.projectDetails.projectStatus;
    }

    return metadata;
  }

  private calculateLoanEmissions(loan: LoanRecord): number {
    if (loan.vehicleDetails?.emissions) return loan.vehicleDetails.emissions;
    if (loan.propertyDetails?.emissions) return loan.propertyDetails.emissions;
    if (loan.projectDetails?.expectedEmissions) return loan.projectDetails.expectedEmissions;
    
    // Estimate emissions based on loan amount and instrument type
    const emissionFactors = {
      auto_loans: 0.0003, // tCO2e per dollar
      commercial_real_estate: 0.0001,
      project_finance: 0.0005
    };
    
    return loan.outstandingBalance * (emissionFactors[loan.instrument] || 0.0002);
  }

  private reconstructLoanFromDocument(document: ChromaDocument): LoanRecord {
    const metadata = document.metadata;
    
    const loan: LoanRecord = {
      id: metadata.loanId,
      instrument: metadata.instrument,
      loanAmount: metadata.loanAmount,
      outstandingBalance: metadata.outstandingBalance,
      originationDate: new Date(),
      pcafScore: metadata.pcafScore
    };

    // Reconstruct instrument-specific details from metadata
    if (metadata.vehicleMake) {
      loan.vehicleDetails = {
        make: metadata.vehicleMake,
        model: metadata.vehicleModel,
        year: metadata.vehicleYear,
        fuelType: metadata.fuelType,
        emissions: metadata.emissions
      };
    }

    if (metadata.propertyType) {
      loan.propertyDetails = {
        propertyType: metadata.propertyType,
        squareFootage: metadata.squareFootage,
        location: metadata.propertyLocation,
        emissions: metadata.emissions
      };
    }

    if (metadata.projectType) {
      loan.projectDetails = {
        projectType: metadata.projectType,
        sector: metadata.projectSector,
        location: metadata.projectLocation || '',
        projectStatus: metadata.projectStatus,
        expectedEmissions: metadata.emissions
      };
    }

    return loan;
  }

  private generateLoanInsights(loan: LoanRecord, query: string): string[] {
    const insights: string[] = [];

    // Data quality insights
    const pcafScore = loan.pcafScore || 5;
    if (pcafScore > 3) {
      insights.push(`High data quality risk (PCAF ${pcafScore}/5) - consider data improvement initiatives`);
    }

    // Emissions insights
    if (loan.vehicleDetails) {
      const emissions = loan.vehicleDetails.emissions || 0;
      if (emissions > 4.0) {
        insights.push(`High-emission vehicle - consider EV refinancing program`);
      } else if (emissions < 1.0) {
        insights.push(`Low-emission vehicle - good for green portfolio metrics`);
      }
    }

    // Compliance insights
    if (pcafScore <= 3) {
      insights.push(`PCAF compliant - contributes to regulatory requirements`);
    }

    return insights;
  }
}

export const loanDataPipelineService = LoanDataPipelineService.getInstance();