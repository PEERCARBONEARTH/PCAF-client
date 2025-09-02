/**
 * Data Pipeline Service - Orchestrates portfolio data transformation for AI insights
 * Implements ETL pipeline: Extract → Transform → Embed → Store → Retrieve
 */

import { portfolioService, LoanData, PortfolioSummary, PortfolioMetrics } from './portfolioService';
import { clientDocumentsService, ClientDocument } from './client-documents-service';
import { chromaDBService, ChromaDocument } from './chroma-db-service';

export interface DataPipelineConfig {
  batchSize: number;
  embeddingModel: string;
  updateFrequency: 'realtime' | 'hourly' | 'daily';
  dataQualityThreshold: number;
  enableIncrementalUpdates: boolean;
}

export interface ProcessedPortfolioData {
  id: string;
  type: 'loan' | 'portfolio_summary' | 'sector_analysis' | 'risk_profile';
  content: string;
  metadata: {
    loanId?: string;
    sector?: string;
    dataQuality: number;
    emissionsIntensity: number;
    lastUpdated: Date;
    pcafScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  embeddings?: number[];
}

export interface PipelineMetrics {
  totalRecordsProcessed: number;
  successfulEmbeddings: number;
  failedEmbeddings: number;
  averageProcessingTime: number;
  dataQualityDistribution: Record<number, number>;
  lastRunTimestamp: Date;
}

class DataPipelineService {
  private static instance: DataPipelineService;
  private config: DataPipelineConfig;
  private isProcessing: boolean = false;

  constructor() {
    this.config = {
      batchSize: 50,
      embeddingModel: 'text-embedding-ada-002',
      updateFrequency: 'daily',
      dataQualityThreshold: 3.0,
      enableIncrementalUpdates: true
    };
  }

  static getInstance(): DataPipelineService {
    if (!DataPipelineService.instance) {
      DataPipelineService.instance = new DataPipelineService();
    }
    return DataPipelineService.instance;
  }

  /**
   * Main pipeline orchestrator - runs the complete ETL process
   */
  async runPipeline(forceFullRefresh: boolean = false): Promise<PipelineMetrics> {
    if (this.isProcessing) {
      throw new Error('Pipeline is already running');
    }

    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting data pipeline...');

      // Step 1: Extract portfolio data
      const rawData = await this.extractPortfolioData();
      console.log(`📊 Extracted ${rawData.portfolioData.length} loans and ${rawData.clientDocuments.length} documents`);

      // Step 2: Transform data into AI-ready format
      const transformedData = await this.transformPortfolioData(rawData);
      console.log(`🔄 Transformed ${transformedData.length} data records`);

      // Step 3: Generate embeddings
      const embeddedData = await this.generateEmbeddings(transformedData);
      console.log(`🧠 Generated embeddings for ${embeddedData.length} records`);

      // Step 4: Store in ChromaDB
      const storeResults = await this.storeInVectorDatabase(embeddedData, forceFullRefresh);
      console.log(`💾 Stored ${storeResults.stored} records in ChromaDB`);

      // Step 5: Generate pipeline metrics
      const metrics = this.calculatePipelineMetrics(transformedData, embeddedData, startTime);
      console.log('✅ Pipeline completed successfully');

      return metrics;

    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Step 1: Extract comprehensive client data from all sources
   */
  private async extractPortfolioData(): Promise<{
    portfolioData: LoanData[];
    portfolioSummary: PortfolioSummary;
    analytics: PortfolioMetrics;
    clientDocuments: ClientDocument[];
    extractedAt: Date;
  }> {
    try {
      console.log('🔍 Extracting comprehensive client data...');
      
      // Extract all client data including documents
      const clientData = await clientDocumentsService.extractAllClientData();
      
      return {
        portfolioData: clientData.portfolioData,
        portfolioSummary: clientData.portfolioSummary,
        analytics: clientData.analytics,
        clientDocuments: clientData.documents,
        extractedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to extract portfolio data:', error);
      throw new Error(`Data extraction failed: ${error.message}`);
    }
  }

  /**
   * Step 2: Transform data into AI-ready format
   */
  private async transformPortfolioData(rawData: {
    portfolioData: LoanData[];
    portfolioSummary: PortfolioSummary;
    analytics: PortfolioMetrics;
    clientDocuments: ClientDocument[];
  }): Promise<ProcessedPortfolioData[]> {
    const transformedData: ProcessedPortfolioData[] = [];

    // Transform portfolio summary
    const portfolioSummary = this.transformPortfolioSummary(rawData.portfolioSummary, rawData.analytics);
    transformedData.push(portfolioSummary);

    // Transform individual loans (limit to first 50 for performance)
    const loanData = await this.transformLoans(rawData.portfolioData.slice(0, 50));
    transformedData.push(...loanData);

    // Transform sector analysis
    const sectorAnalysis = this.transformSectorAnalysis(rawData.portfolioData);
    transformedData.push(...sectorAnalysis);

    // Transform risk profiles
    const riskProfiles = this.transformRiskProfiles(rawData.portfolioData);
    transformedData.push(...riskProfiles);

    // Transform client documents
    const documentData = this.transformClientDocuments(rawData.clientDocuments);
    transformedData.push(...documentData);

    return transformedData;
  }

  private transformPortfolioSummary(summary: PortfolioSummary, analytics: PortfolioMetrics): ProcessedPortfolioData {
    const totalEmissions = summary.totalFinancedEmissions || 0;
    const totalValue = summary.totalOutstandingBalance || 0;
    const emissionsIntensity = totalValue > 0 ? (totalEmissions / totalValue) * 1000 : 0;
    const avgDataQuality = summary.averageDataQualityScore || 5;

    const content = `
Portfolio Overview:
- Total Loans: ${summary.total_loans || 0}
- Portfolio Value: $${(totalValue / 1000000).toFixed(1)}M
- Total Financed Emissions: ${totalEmissions.toFixed(0)} tCO2e
- Emissions Intensity: ${emissionsIntensity.toFixed(2)} kg CO2e/$1k
- Average Data Quality Score: ${avgDataQuality.toFixed(1)}/5
- PCAF Compliance Rate: ${((summary.compliant_loans || 0) / (summary.total_loans || 1) * 100).toFixed(1)}%
- EV Percentage: ${((summary.ev_loans || 0) / (summary.total_loans || 1) * 100).toFixed(1)}%

Performance Insights:
- Data Quality: ${avgDataQuality <= 3 ? 'Compliant' : 'Needs Improvement'}
- Emissions Trend: ${emissionsIntensity <= 2.5 ? 'Good' : 'Above Target'}
- Portfolio Risk Level: ${this.assessPortfolioRisk(avgDataQuality, emissionsIntensity)}
    `.trim();

    return {
      id: 'portfolio_summary',
      type: 'portfolio_summary',
      content,
      metadata: {
        dataQuality: avgDataQuality,
        emissionsIntensity,
        lastUpdated: new Date(),
        pcafScore: avgDataQuality,
        riskLevel: this.assessPortfolioRisk(avgDataQuality, emissionsIntensity)
      }
    };
  }

  /**
   * Transform client documents into processed format
   */
  private transformClientDocuments(documents: ClientDocument[]): ProcessedPortfolioData[] {
    return documents.map(doc => ({
      id: `client_doc_${doc.id}`,
      type: 'portfolio_summary' as const,
      content: `${doc.title}\n\n${doc.content}`,
      metadata: {
        dataQuality: doc.metadata.dataQuality,
        emissionsIntensity: 0,
        lastUpdated: doc.metadata.lastModified,
        pcafScore: doc.metadata.dataQuality,
        riskLevel: doc.metadata.dataQuality > 3 ? 'high' : doc.metadata.dataQuality > 2 ? 'medium' : 'low'
      }
    }));
  }

  private async transformLoans(loans: LoanData[]): Promise<ProcessedPortfolioData[]> {
    return loans.map(loan => {
      const emissions = loan.emissions_data.financed_emissions_tco2e || 0;
      const balance = loan.outstanding_balance || loan.loan_amount || 0;
      const intensity = balance > 0 ? (emissions / balance) * 1000 : 0;
      const dataQuality = loan.emissions_data.data_quality_score || 5;

      const content = `
Loan Analysis - ${loan.loan_id}:
- Vehicle: ${loan.vehicle_make || 'Unknown'} ${loan.vehicle_model || ''} ${loan.vehicle_year || ''}
- Fuel Type: ${loan.fuel_type || 'Unknown'}
- Outstanding Balance: $${balance.toLocaleString()}
- Annual Emissions: ${emissions.toFixed(1)} tCO2e
- Emissions Intensity: ${intensity.toFixed(2)} kg CO2e/$1k
- Data Quality Score: ${dataQuality}/5
- PCAF Compliance: ${dataQuality <= 3 ? 'Compliant' : 'Non-compliant'}
- Risk Assessment: ${this.assessLoanRisk(dataQuality, intensity)}

Data Completeness:
- Vehicle Data: ${loan.vehicle_make ? 'Complete' : 'Missing'}
- Emissions Data: ${emissions > 0 ? 'Available' : 'Missing'}
- Mileage Data: ${loan.annual_mileage ? 'Available' : 'Estimated'}
      `.trim();

      return {
        id: `loan_${loan.loan_id}`,
        type: 'loan' as const,
        content,
        metadata: {
          loanId: loan.loan_id,
          sector: loan.sector || 'Motor Vehicle',
          dataQuality,
          emissionsIntensity: intensity,
          lastUpdated: new Date(),
          pcafScore: dataQuality,
          riskLevel: this.assessLoanRisk(dataQuality, intensity)
        }
      };
    });
  }

  private transformSectorAnalysis(loans: any[]): ProcessedPortfolioData[] {
    const sectorGroups = loans.reduce((acc, loan) => {
      const sector = loan.sector || 'Motor Vehicle';
      if (!acc[sector]) acc[sector] = [];
      acc[sector].push(loan);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(sectorGroups).map(([sector, sectorLoans]) => {
      const totalEmissions = sectorLoans.reduce((sum, loan) => sum + (loan.financed_emissions || 0), 0);
      const totalValue = sectorLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);
      const avgDataQuality = sectorLoans.reduce((sum, loan) => sum + (loan.data_quality_score || 5), 0) / sectorLoans.length;
      const intensity = totalValue > 0 ? (totalEmissions / totalValue) * 1000 : 0;

      const content = `
Sector Analysis - ${sector}:
- Total Loans: ${sectorLoans.length}
- Sector Value: $${(totalValue / 1000000).toFixed(1)}M
- Sector Emissions: ${totalEmissions.toFixed(0)} tCO2e
- Emissions Intensity: ${intensity.toFixed(2)} kg CO2e/$1k
- Average Data Quality: ${avgDataQuality.toFixed(1)}/5
- Portfolio Share: ${((sectorLoans.length / loans.length) * 100).toFixed(1)}%

Performance vs Portfolio:
- Intensity Comparison: ${intensity <= 2.5 ? 'Below average' : 'Above average'}
- Data Quality: ${avgDataQuality <= 3 ? 'Compliant' : 'Needs improvement'}
- Risk Level: ${this.assessSectorRisk(avgDataQuality, intensity, sectorLoans.length)}
      `.trim();

      return {
        id: `sector_${sector.toLowerCase().replace(/\s+/g, '_')}`,
        type: 'sector_analysis' as const,
        content,
        metadata: {
          sector,
          dataQuality: avgDataQuality,
          emissionsIntensity: intensity,
          lastUpdated: new Date(),
          pcafScore: avgDataQuality,
          riskLevel: this.assessSectorRisk(avgDataQuality, intensity, sectorLoans.length)
        }
      };
    });
  }

  private transformRiskProfiles(loans: any[]): ProcessedPortfolioData[] {
    const riskProfiles = ['low', 'medium', 'high'] as const;
    
    return riskProfiles.map(riskLevel => {
      const riskLoans = loans.filter(loan => {
        const dataQuality = loan.data_quality_score || 5;
        const balance = loan.outstanding_balance || 0;
        const emissions = loan.financed_emissions || 0;
        const intensity = balance > 0 ? (emissions / balance) * 1000 : 0;
        return this.assessLoanRisk(dataQuality, intensity) === riskLevel;
      });

      const totalValue = riskLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);
      const totalEmissions = riskLoans.reduce((sum, loan) => sum + (loan.financed_emissions || 0), 0);
      const avgDataQuality = riskLoans.length > 0 
        ? riskLoans.reduce((sum, loan) => sum + (loan.data_quality_score || 5), 0) / riskLoans.length 
        : 5;

      const content = `
Risk Profile Analysis - ${riskLevel.toUpperCase()} Risk:
- Loans in Category: ${riskLoans.length}
- Total Value: $${(totalValue / 1000000).toFixed(1)}M
- Total Emissions: ${totalEmissions.toFixed(0)} tCO2e
- Average Data Quality: ${avgDataQuality.toFixed(1)}/5
- Portfolio Share: ${((riskLoans.length / loans.length) * 100).toFixed(1)}%

Risk Characteristics:
- Data Quality Issues: ${riskLoans.filter(l => (l.data_quality_score || 5) > 3).length} loans
- High Emission Loans: ${riskLoans.filter(l => {
  const balance = l.outstanding_balance || 0;
  const emissions = l.financed_emissions || 0;
  return balance > 0 && (emissions / balance) * 1000 > 3.0;
}).length} loans
- Missing Data: ${riskLoans.filter(l => !l.vehicle_make || !l.financed_emissions).length} loans

Recommended Actions:
${this.getRiskRecommendations(riskLevel, riskLoans)}
      `.trim();

      return {
        id: `risk_profile_${riskLevel}`,
        type: 'risk_profile' as const,
        content,
        metadata: {
          dataQuality: avgDataQuality,
          emissionsIntensity: totalValue > 0 ? (totalEmissions / totalValue) * 1000 : 0,
          lastUpdated: new Date(),
          pcafScore: avgDataQuality,
          riskLevel
        }
      };
    });
  }

  /**
   * Step 3: Generate embeddings for transformed data
   */
  private async generateEmbeddings(data: ProcessedPortfolioData[]): Promise<ProcessedPortfolioData[]> {
    const embeddedData: ProcessedPortfolioData[] = [];
    
    for (let i = 0; i < data.length; i += this.config.batchSize) {
      const batch = data.slice(i, i + this.config.batchSize);
      
      try {
        const batchEmbeddings = await this.generateBatchEmbeddings(batch);
        embeddedData.push(...batchEmbeddings);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to generate embeddings for batch ${i}:`, error);
        // Add data without embeddings as fallback
        embeddedData.push(...batch);
      }
    }

    return embeddedData;
  }

  private async generateBatchEmbeddings(batch: ProcessedPortfolioData[]): Promise<ProcessedPortfolioData[]> {
    try {
      // In a real implementation, this would call OpenAI's embedding API
      // For now, we'll simulate embeddings
      return batch.map(item => ({
        ...item,
        embeddings: this.generateMockEmbedding(item.content)
      }));
    } catch (error) {
      console.error('Batch embedding generation failed:', error);
      return batch; // Return without embeddings
    }
  }

  private generateMockEmbedding(text: string): number[] {
    // Mock embedding generation - in production, use OpenAI API
    const embedding = new Array(1536).fill(0).map(() => Math.random() - 0.5);
    return embedding;
  }

  /**
   * Step 4: Store in ChromaDB
   */
  private async storeInVectorDatabase(data: ProcessedPortfolioData[], forceRefresh: boolean): Promise<{ stored: number; updated: number; errors: number }> {
    let stored = 0;
    let updated = 0;
    let errors = 0;

    for (const item of data) {
      try {
        // In a real implementation, this would use ChromaDB's upsert functionality
        // For now, we'll simulate the storage
        console.log(`Storing ${item.type}: ${item.id}`);
        stored++;
      } catch (error) {
        console.error(`Failed to store ${item.id}:`, error);
        errors++;
      }
    }

    return { stored, updated, errors };
  }

  /**
   * Step 5: Calculate pipeline metrics
   */
  private calculatePipelineMetrics(
    transformedData: ProcessedPortfolioData[],
    embeddedData: ProcessedPortfolioData[],
    startTime: number
  ): PipelineMetrics {
    const dataQualityDistribution = transformedData.reduce((acc, item) => {
      const score = Math.floor(item.metadata.dataQuality);
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalRecordsProcessed: transformedData.length,
      successfulEmbeddings: embeddedData.filter(item => item.embeddings).length,
      failedEmbeddings: embeddedData.filter(item => !item.embeddings).length,
      averageProcessingTime: Date.now() - startTime,
      dataQualityDistribution,
      lastRunTimestamp: new Date()
    };
  }

  /**
   * Helper methods for risk assessment
   */
  private assessPortfolioRisk(dataQuality: number, emissionsIntensity: number): 'low' | 'medium' | 'high' {
    if (dataQuality > 4 || emissionsIntensity > 4.0) return 'high';
    if (dataQuality > 3 || emissionsIntensity > 2.5) return 'medium';
    return 'low';
  }

  private assessLoanRisk(dataQuality: number, emissionsIntensity: number): 'low' | 'medium' | 'high' {
    if (dataQuality >= 5 || emissionsIntensity > 5.0) return 'high';
    if (dataQuality >= 4 || emissionsIntensity > 3.0) return 'medium';
    return 'low';
  }

  private assessSectorRisk(dataQuality: number, emissionsIntensity: number, loanCount: number): 'low' | 'medium' | 'high' {
    if (dataQuality > 4 || emissionsIntensity > 4.0 || loanCount < 5) return 'high';
    if (dataQuality > 3 || emissionsIntensity > 2.5) return 'medium';
    return 'low';
  }

  private getRiskRecommendations(riskLevel: 'low' | 'medium' | 'high', loans: any[]): string {
    const recommendations = {
      low: '- Continue monitoring\n- Maintain data quality standards\n- Consider portfolio expansion',
      medium: '- Improve data collection for high-value loans\n- Monitor emissions trends\n- Implement quarterly reviews',
      high: '- Immediate data quality improvement required\n- Consider loan restructuring\n- Implement enhanced monitoring\n- Prioritize EV transition support'
    };
    return recommendations[riskLevel];
  }

  /**
   * Public methods for pipeline management
   */
  async getLastRunMetrics(): Promise<PipelineMetrics | null> {
    // In production, this would fetch from a database
    return null;
  }

  async scheduleIncrementalUpdate(): Promise<void> {
    if (this.config.enableIncrementalUpdates) {
      console.log('Scheduling incremental update...');
      // Implementation would depend on your scheduling system
    }
  }

  updateConfig(newConfig: Partial<DataPipelineConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): DataPipelineConfig {
    return { ...this.config };
  }

  isRunning(): boolean {
    return this.isProcessing;
  }
}

export const dataPipelineService = DataPipelineService.getInstance();