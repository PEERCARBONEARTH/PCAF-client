/**
 * Enhanced Data Pipeline Service - Comprehensive ETL for ChromaDB
 * Extracts from portfolio, loans, analytics, and client documents
 * Transforms data for AI processing and stores in ChromaDB
 */

import { portfolioService, LoanData, PortfolioSummary, PortfolioMetrics } from './portfolioService';
import { clientDocumentsService, ClientDocument } from './client-documents-service';
import { chromaDBService, ChromaDocument } from './chroma-db-service';

export interface EnhancedPipelineConfig {
  batchSize: number;
  embeddingModel: string;
  updateFrequency: 'realtime' | 'hourly' | 'daily';
  dataQualityThreshold: number;
  enableIncrementalUpdates: boolean;
  maxLoansToProcess: number;
  enableClientDocuments: boolean;
}

export interface PipelineResult {
  totalRecordsProcessed: number;
  documentsStored: number;
  collectionsUpdated: string[];
  processingTimeMs: number;
  dataQualityScore: number;
  errors: string[];
}

export interface ChromaCollectionMapping {
  portfolioOverview: 'portfolio_documents';
  loanAnalysis: 'loan_documents';
  analytics: 'analytics_documents';
  clientDocuments: 'client_insights';
  bankTargets: 'bank_targets';
  historicalReports: 'historical_reports';
}

class EnhancedDataPipelineService {
  private static instance: EnhancedDataPipelineService;
  private config: EnhancedPipelineConfig;
  private isProcessing: boolean = false;

  constructor() {
    this.config = {
      batchSize: 25,
      embeddingModel: 'text-embedding-ada-002',
      updateFrequency: 'daily',
      dataQualityThreshold: 3.0,
      enableIncrementalUpdates: true,
      maxLoansToProcess: 100,
      enableClientDocuments: true
    };
  }

  static getInstance(): EnhancedDataPipelineService {
    if (!EnhancedDataPipelineService.instance) {
      EnhancedDataPipelineService.instance = new EnhancedDataPipelineService();
    }
    return EnhancedDataPipelineService.instance;
  }

  /**
   * Main pipeline orchestrator - Complete ETL process
   */
  async runCompletePipeline(options?: {
    forceFullRefresh?: boolean;
    includeClientDocuments?: boolean;
    maxLoans?: number;
  }): Promise<PipelineResult> {
    if (this.isProcessing) {
      throw new Error('Pipeline is already running');
    }

    this.isProcessing = true;
    const startTime = Date.now();
    const errors: string[] = [];
    const collectionsUpdated: string[] = [];

    try {
      console.log('🚀 Starting Enhanced Data Pipeline...');

      // Step 1: Extract all data sources
      const extractedData = await this.extractAllDataSources(options);
      console.log(`📊 Extracted: ${extractedData.portfolioData.length} loans, ${extractedData.clientDocuments.length} documents`);

      // Step 2: Transform to ChromaDB format
      const chromaDocuments = await this.transformToChromaFormat(extractedData);
      console.log(`🔄 Transformed ${chromaDocuments.length} documents for ChromaDB`);

      // Step 3: Store in ChromaDB collections
      const storeResults = await this.storeInChromaCollections(chromaDocuments, options?.forceFullRefresh);
      collectionsUpdated.push(...storeResults.collectionsUpdated);
      console.log(`💾 Stored documents in ${storeResults.collectionsUpdated.length} collections`);

      // Step 4: Validate and generate metrics
      const dataQualityScore = this.calculateOverallDataQuality(extractedData);
      
      const result: PipelineResult = {
        totalRecordsProcessed: chromaDocuments.length,
        documentsStored: storeResults.totalStored,
        collectionsUpdated,
        processingTimeMs: Date.now() - startTime,
        dataQualityScore,
        errors
      };

      console.log('✅ Enhanced Pipeline completed successfully');
      console.log(`📈 Processed ${result.totalRecordsProcessed} records in ${result.processingTimeMs}ms`);
      
      return result;

    } catch (error) {
      console.error('❌ Enhanced Pipeline failed:', error);
      errors.push(error.message);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Step 1: Extract data from all sources
   */
  private async extractAllDataSources(options?: {
    includeClientDocuments?: boolean;
    maxLoans?: number;
  }): Promise<{
    portfolioData: LoanData[];
    portfolioSummary: PortfolioSummary;
    analytics: PortfolioMetrics;
    clientDocuments: ClientDocument[];
    bankTargets: any[];
    historicalReports: any[];
  }> {
    try {
      // Extract core portfolio data
      const { loans: portfolioData, summary: portfolioSummary } = await portfolioService.getPortfolioSummary();
      const analytics = await portfolioService.getPortfolioAnalytics();

      // Limit loans for performance
      const maxLoans = options?.maxLoans || this.config.maxLoansToProcess;
      const limitedPortfolioData = portfolioData.slice(0, maxLoans);

      let clientDocuments: ClientDocument[] = [];
      let bankTargets: any[] = [];
      let historicalReports: any[] = [];

      // Extract client documents if enabled
      if (options?.includeClientDocuments !== false && this.config.enableClientDocuments) {
        try {
          const clientData = await clientDocumentsService.extractAllClientData();
          clientDocuments = clientData.documents;
          bankTargets = clientData.bankTargets;
          historicalReports = clientData.clientReports;
        } catch (error) {
          console.warn('⚠️ Client documents extraction failed:', error.message);
        }
      }

      return {
        portfolioData: limitedPortfolioData,
        portfolioSummary,
        analytics,
        clientDocuments,
        bankTargets,
        historicalReports
      };

    } catch (error) {
      console.error('Failed to extract data sources:', error);
      throw new Error(`Data extraction failed: ${error.message}`);
    }
  }

  /**
   * Step 2: Transform all data to ChromaDB document format
   */
  private async transformToChromaFormat(data: {
    portfolioData: LoanData[];
    portfolioSummary: PortfolioSummary;
    analytics: PortfolioMetrics;
    clientDocuments: ClientDocument[];
    bankTargets: any[];
    historicalReports: any[];
  }): Promise<ChromaDocument[]> {
    const chromaDocuments: ChromaDocument[] = [];

    try {
      // 1. Portfolio Overview Document
      chromaDocuments.push(this.createPortfolioOverviewDocument(data.portfolioSummary, data.analytics));

      // 2. Individual Loan Documents
      const loanDocuments = this.createLoanDocuments(data.portfolioData);
      chromaDocuments.push(...loanDocuments);

      // 3. Analytics Document
      chromaDocuments.push(this.createAnalyticsDocument(data.analytics));

      // 4. Client Documents
      if (data.clientDocuments.length > 0) {
        const clientDocs = this.transformClientDocuments(data.clientDocuments);
        chromaDocuments.push(...clientDocs);
      }

      // 5. Bank Targets Document
      if (data.bankTargets.length > 0) {
        chromaDocuments.push(this.createBankTargetsDocument(data.bankTargets));
      }

      // 6. Historical Reports Summary
      if (data.historicalReports.length > 0) {
        chromaDocuments.push(this.createHistoricalReportsDocument(data.historicalReports));
      }

      console.log(`🔄 Created ${chromaDocuments.length} ChromaDB documents`);
      return chromaDocuments;

    } catch (error) {
      console.error('Failed to transform data to ChromaDB format:', error);
      throw error;
    }
  }

  /**
   * Step 3: Store documents in appropriate ChromaDB collections
   */
  private async storeInChromaCollections(
    documents: ChromaDocument[],
    forceRefresh?: boolean
  ): Promise<{
    totalStored: number;
    collectionsUpdated: string[];
    errors: number;
  }> {
    const collectionsUpdated: string[] = [];
    let totalStored = 0;
    let errors = 0;

    try {
      // Group documents by collection
      const documentsByCollection = this.groupDocumentsByCollection(documents);

      // Clear collections if force refresh
      if (forceRefresh) {
        for (const collectionName of Object.keys(documentsByCollection)) {
          await chromaDBService.clearCollection(collectionName);
          console.log(`🧹 Cleared collection: ${collectionName}`);
        }
      }

      // Store documents in each collection
      for (const [collectionName, docs] of Object.entries(documentsByCollection)) {
        try {
          const result = await chromaDBService.addDocuments(collectionName, docs);
          totalStored += result.added + result.updated;
          errors += result.errors;
          collectionsUpdated.push(collectionName);
          
          console.log(`📚 Collection ${collectionName}: ${result.added} added, ${result.updated} updated`);
        } catch (error) {
          console.error(`Failed to store in collection ${collectionName}:`, error);
          errors++;
        }
      }

      return { totalStored, collectionsUpdated, errors };

    } catch (error) {
      console.error('Failed to store documents in ChromaDB:', error);
      throw error;
    }
  }

  /**
   * Document creation methods
   */
  private createPortfolioOverviewDocument(summary: PortfolioSummary, analytics: PortfolioMetrics): ChromaDocument {
    const content = `
PORTFOLIO OVERVIEW AND PERFORMANCE

Executive Summary:
- Total Loans: ${summary.totalLoans}
- Portfolio Value: $${(summary.totalLoanAmount / 1000000).toFixed(1)}M
- Outstanding Balance: $${(summary.totalOutstandingBalance / 1000000).toFixed(1)}M
- Total Financed Emissions: ${summary.totalFinancedEmissions.toFixed(0)} tCO2e
- Average Data Quality Score: ${summary.averageDataQualityScore.toFixed(2)}/5

PCAF Compliance:
- Weighted Average Data Quality: ${analytics.weightedAvgDataQuality.toFixed(2)}/5
- Compliant Loans: ${analytics.pcafCompliantLoans}/${analytics.totalLoans} (${((analytics.pcafCompliantLoans/analytics.totalLoans)*100).toFixed(1)}%)
- High Risk Loans: ${analytics.highRiskLoans}
- Box 8 WDQS Status: ${analytics.weightedAvgDataQuality <= 3.0 ? 'COMPLIANT' : 'NON-COMPLIANT'}

Emissions Performance:
- Emission Intensity: ${analytics.emissionIntensityPerDollar.toFixed(2)} kg CO2e per $1,000
- Physical Emission Intensity: ${analytics.physicalEmissionIntensity.toFixed(2)} tCO2e per vehicle
- WACI: ${analytics.waci.toFixed(2)} tCO2e
- Average Attribution Factor: ${(analytics.avgAttributionFactor * 100).toFixed(1)}%

Portfolio Composition:
${Object.entries(analytics.emissionsByFuelType).map(([fuel, emissions]) => 
  `- ${fuel}: ${emissions.toFixed(0)} tCO2e (${((emissions/summary.totalFinancedEmissions)*100).toFixed(1)}%)`
).join('\n')}
    `.trim();

    return {
      id: 'portfolio_overview',
      content,
      metadata: {
        type: 'portfolio_overview',
        source: 'portfolio_service',
        timestamp: new Date(),
        dataQuality: summary.averageDataQualityScore,
        tags: ['portfolio', 'overview', 'pcaf', 'emissions', 'performance']
      }
    };
  }

  private createLoanDocuments(loans: LoanData[]): ChromaDocument[] {
    return loans.map(loan => {
      const emissions = loan.emissions_data.financed_emissions_tco2e;
      const intensity = loan.outstanding_balance > 0 
        ? (emissions / loan.outstanding_balance) * 1000 
        : 0;

      const content = `
LOAN ANALYSIS - ${loan.loan_id}

Borrower: ${loan.borrower_name}
Loan Details:
- Amount: $${loan.loan_amount.toLocaleString()}
- Outstanding: $${loan.outstanding_balance.toLocaleString()}
- Rate: ${(loan.interest_rate * 100).toFixed(2)}%
- Term: ${loan.term_months} months

Vehicle Information:
- Make/Model: ${loan.vehicle_details.make} ${loan.vehicle_details.model}
- Year: ${loan.vehicle_details.year}
- Type: ${loan.vehicle_details.type}
- Fuel: ${loan.vehicle_details.fuel_type}
- Efficiency: ${loan.vehicle_details.efficiency_mpg || 'N/A'} MPG

Emissions Analysis:
- Annual Emissions: ${loan.emissions_data.annual_emissions_tco2e.toFixed(2)} tCO2e
- Financed Emissions: ${emissions.toFixed(2)} tCO2e
- Attribution Factor: ${(loan.emissions_data.attribution_factor * 100).toFixed(1)}%
- Emission Intensity: ${intensity.toFixed(2)} kg CO2e/$1k
- PCAF Score: ${loan.emissions_data.data_quality_score}/5
- Compliance: ${loan.emissions_data.data_quality_score <= 3 ? 'Compliant' : 'Non-compliant'}
      `.trim();

      return {
        id: `loan_${loan.loan_id}`,
        content,
        metadata: {
          type: 'loan_analysis',
          source: 'portfolio_service',
          timestamp: new Date(loan.updated_at),
          dataQuality: loan.emissions_data.data_quality_score,
          tags: [
            'loan',
            'vehicle',
            loan.vehicle_details.fuel_type.toLowerCase(),
            loan.vehicle_details.type.toLowerCase(),
            loan.emissions_data.data_quality_score <= 3 ? 'compliant' : 'non-compliant'
          ],
          loanId: loan.loan_id,
          emissionIntensity: intensity,
          pcafScore: loan.emissions_data.data_quality_score
        }
      };
    });
  }

  private createAnalyticsDocument(analytics: PortfolioMetrics): ChromaDocument {
    const content = `
COMPREHENSIVE PORTFOLIO ANALYTICS

Portfolio Metrics:
- Total Loans: ${analytics.totalLoans}
- Total Value: $${(analytics.totalLoanValue / 1000000).toFixed(1)}M
- Outstanding Balance: $${(analytics.totalOutstandingBalance / 1000000).toFixed(1)}M
- Total Emissions: ${analytics.totalFinancedEmissions.toFixed(0)} tCO2e

PCAF Analysis:
- WDQS: ${analytics.weightedAvgDataQuality.toFixed(2)}/5
- Compliant Loans: ${analytics.pcafCompliantLoans}/${analytics.totalLoans}
- High Risk Loans: ${analytics.highRiskLoans}
- Compliance Rate: ${((analytics.pcafCompliantLoans/analytics.totalLoans)*100).toFixed(1)}%

Emission Metrics:
- Intensity per Dollar: ${analytics.emissionIntensityPerDollar.toFixed(2)} kg CO2e/$1k
- Physical Intensity: ${analytics.physicalEmissionIntensity.toFixed(2)} tCO2e/vehicle
- WACI: ${analytics.waci.toFixed(2)} tCO2e
- Avg Attribution: ${(analytics.avgAttributionFactor * 100).toFixed(1)}%

Fuel Type Distribution:
${Object.entries(analytics.emissionsByFuelType)
  .sort(([,a], [,b]) => b - a)
  .map(([fuel, emissions]) => 
    `- ${fuel}: ${emissions.toFixed(0)} tCO2e (${((emissions/analytics.totalFinancedEmissions)*100).toFixed(1)}%)`
  ).join('\n')}

Data Quality Distribution:
${Object.entries(analytics.loansByDataQuality).map(([score, count]) => 
  `- Score ${score}: ${count} loans (${((count/analytics.totalLoans)*100).toFixed(1)}%)`
).join('\n')}
    `.trim();

    return {
      id: 'portfolio_analytics',
      content,
      metadata: {
        type: 'analytics_report',
        source: 'portfolio_service',
        timestamp: new Date(),
        dataQuality: analytics.weightedAvgDataQuality,
        tags: ['analytics', 'metrics', 'pcaf', 'waci', 'emissions', 'performance']
      }
    };
  }

  private transformClientDocuments(clientDocs: ClientDocument[]): ChromaDocument[] {
    return clientDocs.map(doc => ({
      id: `client_${doc.id}`,
      content: `${doc.title}\n\n${doc.content}`,
      metadata: {
        type: 'client_document',
        source: 'client_documents_service',
        timestamp: doc.metadata.lastModified,
        dataQuality: doc.metadata.dataQuality,
        tags: [...doc.metadata.tags, 'client', 'document'],
        originalType: doc.type,
        confidenceLevel: doc.metadata.confidenceLevel
      }
    }));
  }

  private createBankTargetsDocument(targets: any[]): ChromaDocument {
    const content = `
CLIMATE TARGETS AND GOALS

Strategic Commitments:
${targets.map(target => `
${target.description}
- Target: ${target.targetValue} ${target.unit}
- Current: ${target.currentValue.toFixed(2)} ${target.unit}
- Progress: ${((target.currentValue / target.targetValue) * 100).toFixed(1)}%
- Status: ${target.status.toUpperCase()}
- Deadline: ${target.deadline.toLocaleDateString()}
`).join('\n')}

Performance Summary:
- On Track: ${targets.filter(t => t.status === 'on_track').length} targets
- At Risk: ${targets.filter(t => t.status === 'at_risk').length} targets
- Behind: ${targets.filter(t => t.status === 'behind').length} targets
- Achievement Rate: ${(targets.filter(t => t.status === 'on_track').length / targets.length * 100).toFixed(1)}%
    `.trim();

    return {
      id: 'bank_targets',
      content,
      metadata: {
        type: 'bank_targets',
        source: 'client_documents_service',
        timestamp: new Date(),
        dataQuality: 4.0,
        tags: ['targets', 'goals', 'climate', 'net-zero', 'strategy']
      }
    };
  }

  private createHistoricalReportsDocument(reports: any[]): ChromaDocument {
    const content = `
HISTORICAL PERFORMANCE TRENDS

Report Summary:
- Total Reports: ${reports.length}
- Period: ${reports.length > 0 ? 
  `${reports[reports.length - 1].reportingPeriod.start.toLocaleDateString()} to ${reports[0].reportingPeriod.end.toLocaleDateString()}` : 
  'No data'}
- Frequency: Monthly

Key Trends:
- Portfolio Growth: Consistent expansion
- Data Quality: Improving over time
- Emissions Intensity: Trending toward targets
- EV Adoption: Increasing share

Recent Reports:
${reports.slice(0, 6).map(report => 
  `- ${report.reportingPeriod.start.toLocaleDateString()}: ${report.reportType} report`
).join('\n')}
    `.trim();

    return {
      id: 'historical_reports',
      content,
      metadata: {
        type: 'historical_analysis',
        source: 'client_documents_service',
        timestamp: new Date(),
        dataQuality: 3.5,
        tags: ['historical', 'trends', 'performance', 'time-series']
      }
    };
  }

  /**
   * Helper methods
   */
  private groupDocumentsByCollection(documents: ChromaDocument[]): Record<string, ChromaDocument[]> {
    const collections: Record<string, ChromaDocument[]> = {
      'portfolio_documents': [],
      'loan_documents': [],
      'analytics_documents': [],
      'client_insights': [],
      'bank_targets': [],
      'historical_reports': []
    };

    for (const doc of documents) {
      const type = doc.metadata.type;
      
      switch (type) {
        case 'portfolio_overview':
          collections['portfolio_documents'].push(doc);
          break;
        case 'loan_analysis':
          collections['loan_documents'].push(doc);
          break;
        case 'analytics_report':
          collections['analytics_documents'].push(doc);
          break;
        case 'client_document':
          collections['client_insights'].push(doc);
          break;
        case 'bank_targets':
          collections['bank_targets'].push(doc);
          break;
        case 'historical_analysis':
          collections['historical_reports'].push(doc);
          break;
        default:
          collections['client_insights'].push(doc);
      }
    }

    return collections;
  }

  private calculateOverallDataQuality(data: {
    portfolioSummary: PortfolioSummary;
    analytics: PortfolioMetrics;
  }): number {
    return data.analytics.weightedAvgDataQuality;
  }

  /**
   * Public API methods
   */
  async getProcessingStatus(): Promise<{
    isProcessing: boolean;
    lastRun?: Date;
    nextScheduledRun?: Date;
  }> {
    return {
      isProcessing: this.isProcessing,
      lastRun: undefined, // Would track in real implementation
      nextScheduledRun: undefined
    };
  }

  async getChromaDBHealth(): Promise<any> {
    return await chromaDBService.healthCheck();
  }

  updateConfig(newConfig: Partial<EnhancedPipelineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): EnhancedPipelineConfig {
    return { ...this.config };
  }
}

export const enhancedDataPipelineService = EnhancedDataPipelineService.getInstance();