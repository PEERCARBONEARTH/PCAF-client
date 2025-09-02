/**
 * Sample Data Loader - Populates ChromaDB with realistic portfolio data
 */

import { chromaDBService, ChromaDocument } from './chroma-db-service';

export interface SampleDataConfig {
  numLoans: number;
  includeHistoricalData: boolean;
  dataQualityVariation: boolean;
}

/**
 * Load all sample data into ChromaDB collections
 */
export async function loadAllSampleData(config: SampleDataConfig = {
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
    const portfolioDocuments = generatePortfolioDocuments();
    await chromaDBService.addDocuments('portfolio_documents', portfolioDocuments);
    totalDocuments += portfolioDocuments.length;
    collectionsPopulated.push('portfolio_documents');
    console.log(`✅ Loaded ${portfolioDocuments.length} portfolio documents`);

    // 2. Loan Documents
    const loanDocuments = generateLoanDocuments(config.numLoans);
    await chromaDBService.addDocuments('loan_documents', loanDocuments);
    totalDocuments += loanDocuments.length;
    collectionsPopulated.push('loan_documents');
    console.log(`✅ Loaded ${loanDocuments.length} loan documents`);

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
 * Clear all sample data
 */
export async function clearAllSampleData(): Promise<void> {
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

/**
 * Generate portfolio overview documents
 */
function generatePortfolioDocuments(): ChromaDocument[] {
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
      `.trim(),
      metadata: {
        type: 'portfolio_overview',
        source: 'sample_data',
        timestamp: new Date(),
        dataQuality: 2.8,
        tags: ['portfolio', 'overview', 'pcaf', 'performance', '2024']
      }
    }
  ];
}

/**
 * Generate individual loan documents
 */
function generateLoanDocuments(numLoans: number): ChromaDocument[] {
  const loanDocuments: ChromaDocument[] = [];
  
  const vehicleTypes = [
    { make: 'Tesla', model: 'Model 3', fuel: 'Electric', emissions: 0.5 },
    { make: 'Toyota', model: 'Prius', fuel: 'Hybrid', emissions: 2.1 },
    { make: 'Honda', model: 'Civic', fuel: 'Gasoline', emissions: 4.1 }
  ];

  for (let i = 1; i <= numLoans; i++) {
    const vehicle = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const loanAmount = Math.floor(Math.random() * 40000) + 15000;
    const dataQuality = vehicle.fuel === 'Electric' ? 2 : 3.2;
    
    const loanId = `AUTO${String(i).padStart(4, '0')}`;

    const content = `
LOAN ANALYSIS - ${loanId}

Vehicle Details:
- Make/Model: ${vehicle.make} ${vehicle.model}
- Fuel Type: ${vehicle.fuel}
- Annual Emissions: ${vehicle.emissions.toFixed(2)} tCO2e
- PCAF Score: ${dataQuality}/5
    `.trim();

    loanDocuments.push({
      id: loanId,
      content,
      metadata: {
        type: 'loan_analysis',
        source: 'sample_data',
        timestamp: new Date(),
        dataQuality,
        tags: ['loan', 'vehicle', vehicle.fuel.toLowerCase()]
      }
    });
  }

  return loanDocuments;
}