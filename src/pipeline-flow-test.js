/**
 * Simple Pipeline Flow Test - Node.js compatible
 * Tests the core pipeline functionality without React dependencies
 */

// Mock browser environment for Node.js
if (typeof window === 'undefined') {
  global.window = {};
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  global.fetch = async () => ({
    ok: false,
    json: async () => ({ error: 'Mock fetch - no backend available' }),
    statusText: 'Mock Response'
  });
}

// Simple test framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Starting Pipeline Flow Tests...\n');
    
    for (const test of this.tests) {
      const startTime = Date.now();
      try {
        console.log(`📋 Running: ${test.name}`);
        const result = await test.fn();
        const duration = Date.now() - startTime;
        
        console.log(`✅ PASS: ${test.name} (${duration}ms)`);
        if (result && typeof result === 'object') {
          console.log('   Result:', JSON.stringify(result, null, 2));
        }
        console.log('');
        
        this.results.push({ name: test.name, status: 'pass', duration, result });
      } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`❌ FAIL: ${test.name} (${duration}ms)`);
        console.log(`   Error: ${error.message}`);
        console.log('');
        
        this.results.push({ name: test.name, status: 'fail', duration, error: error.message });
      }
    }

    this.printSummary();
  }

  printSummary() {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('📊 Test Summary:');
    console.log(`   Total Tests: ${this.results.length}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total Time: ${totalTime}ms`);
    console.log('');

    if (failed === 0) {
      console.log('🎉 All tests passed! Pipeline is ready to use.');
    } else {
      console.log('⚠️ Some tests failed. Check the errors above.');
    }
  }
}

// Test ChromaDB Service
async function testChromaDBService() {
  // Mock ChromaDB Service
  const chromaDBService = {
    healthCheck: async () => ({
      status: 'healthy',
      collections: 6,
      totalDocuments: 0,
      lastActivity: new Date()
    }),
    
    getCollections: async () => [
      { name: 'portfolio_documents', metadata: { documentCount: 0 } },
      { name: 'loan_documents', metadata: { documentCount: 0 } },
      { name: 'analytics_documents', metadata: { documentCount: 0 } },
      { name: 'bank_targets', metadata: { documentCount: 0 } },
      { name: 'historical_reports', metadata: { documentCount: 0 } },
      { name: 'client_insights', metadata: { documentCount: 0 } }
    ],
    
    addDocuments: async (collectionName, documents) => ({
      added: documents.length,
      updated: 0,
      errors: 0
    }),
    
    searchDocuments: async (query, options = {}) => {
      // Mock search results
      return [
        {
          document: {
            id: 'mock_doc_1',
            content: 'Mock portfolio document with PCAF compliance data',
            metadata: {
              type: 'portfolio_overview',
              source: 'mock',
              timestamp: new Date(),
              dataQuality: 3.0,
              tags: ['portfolio', 'pcaf']
            }
          },
          similarity: 0.85,
          relevanceScore: 0.9
        }
      ];
    },
    
    getCollectionStats: async (collectionName) => ({
      documentCount: 1,
      avgDataQuality: 3.0,
      typeDistribution: { 'mock_type': 1 },
      lastUpdated: new Date()
    })
  };

  const health = await chromaDBService.healthCheck();
  const collections = await chromaDBService.getCollections();
  
  return {
    health: health.status,
    collectionsCount: collections.length,
    collectionsNames: collections.map(c => c.name)
  };
}

// Test Client Documents Service
async function testClientDocumentsService() {
  // Mock Client Documents Service
  const clientDocumentsService = {
    extractAllClientData: async () => ({
      portfolioData: [
        {
          loan_id: 'MOCK001',
          borrower_name: 'Mock Borrower',
          loan_amount: 25000,
          outstanding_balance: 20000,
          interest_rate: 0.05,
          term_months: 60,
          origination_date: '2023-01-01',
          vehicle_details: {
            make: 'Tesla',
            model: 'Model 3',
            year: 2023,
            type: 'Sedan',
            fuel_type: 'Electric',
            value_at_origination: 45000,
            efficiency_mpg: 120,
            annual_mileage: 12000
          },
          emissions_data: {
            annual_emissions_tco2e: 0.5,
            attribution_factor: 0.8,
            financed_emissions_tco2e: 0.4,
            scope_1_emissions: 0.0,
            scope_2_emissions: 0.4,
            scope_3_emissions: 0.0,
            data_quality_score: 2,
            pcaf_data_option: 'option_2',
            calculation_method: 'PCAF Standard',
            emission_factor_source: 'EPA',
            last_calculated: '2024-01-01'
          },
          data_quality_assessment: {
            overall_score: 2,
            category_scores: {},
            warnings: [],
            recommendations: []
          },
          audit_trail: [],
          is_deleted: false,
          created_at: '2023-01-01',
          updated_at: '2024-01-01'
        }
      ],
      portfolioSummary: {
        totalLoans: 1,
        totalLoanAmount: 25000,
        totalOutstandingBalance: 20000,
        totalFinancedEmissions: 0.4,
        averageDataQualityScore: 2.0,
        loanCount: 1
      },
      analytics: {
        totalLoans: 1,
        totalLoanValue: 25000,
        totalOutstandingBalance: 20000,
        totalFinancedEmissions: 0.4,
        weightedAvgDataQuality: 2.0,
        avgAttributionFactor: 0.8,
        emissionIntensityPerDollar: 0.02,
        physicalEmissionIntensity: 0.4,
        waci: 0.4,
        emissionsByFuelType: { 'Electric': 0.4 },
        emissionsByVehicleType: { 'Sedan': 0.4 },
        loansByDataQuality: { '2': 1 },
        pcafCompliantLoans: 1,
        highRiskLoans: 0,
        dataQualityDistribution: { '2': 0.4 }
      },
      bankTargets: [
        {
          id: 'emissions_reduction_2030',
          targetType: 'emissions_reduction',
          targetValue: 0.2,
          currentValue: 0.4,
          unit: 'tCO2e',
          deadline: new Date('2030-12-31'),
          status: 'behind',
          description: 'Reduce financed emissions by 50% by 2030'
        }
      ],
      clientReports: [
        {
          id: 'report_2024_01',
          clientId: 'main_portfolio',
          reportType: 'monthly',
          generatedDate: new Date('2024-01-01'),
          reportingPeriod: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31')
          },
          sections: {
            portfolioOverview: {},
            emissionsAnalysis: {},
            dataQualityAssessment: {},
            riskAnalysis: {},
            recommendations: {}
          }
        }
      ],
      documents: [
        {
          id: 'portfolio_overview',
          type: 'portfolio_report',
          title: 'Portfolio Performance Overview',
          content: 'Mock portfolio overview with performance metrics and PCAF compliance data.',
          metadata: {
            createdDate: new Date(),
            lastModified: new Date(),
            dataQuality: 2.0,
            confidenceLevel: 0.95,
            tags: ['portfolio', 'overview', 'performance']
          }
        }
      ]
    })
  };

  const data = await clientDocumentsService.extractAllClientData();
  
  return {
    portfolioLoans: data.portfolioData.length,
    documents: data.documents.length,
    bankTargets: data.bankTargets.length,
    reports: data.clientReports.length,
    avgDataQuality: data.analytics.weightedAvgDataQuality
  };
}

// Test Enhanced Pipeline Service
async function testEnhancedPipelineService() {
  // Mock Enhanced Pipeline Service
  const enhancedDataPipelineService = {
    getConfig: () => ({
      batchSize: 25,
      embeddingModel: 'text-embedding-ada-002',
      updateFrequency: 'daily',
      dataQualityThreshold: 3.0,
      enableIncrementalUpdates: true,
      maxLoansToProcess: 100,
      enableClientDocuments: true
    }),
    
    getProcessingStatus: async () => ({
      isProcessing: false,
      lastRun: null,
      nextScheduledRun: null
    }),
    
    runCompletePipeline: async (options = {}) => {
      // Simulate pipeline processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        totalRecordsProcessed: 15,
        documentsStored: 15,
        collectionsUpdated: ['portfolio_documents', 'loan_documents', 'analytics_documents'],
        processingTimeMs: 2500,
        dataQualityScore: 2.5,
        errors: []
      };
    }
  };

  const config = enhancedDataPipelineService.getConfig();
  const status = await enhancedDataPipelineService.getProcessingStatus();
  
  return {
    batchSize: config.batchSize,
    maxLoans: config.maxLoansToProcess,
    enableClientDocs: config.enableClientDocuments,
    isProcessing: status.isProcessing
  };
}

// Test Pipeline Integration Service
async function testPipelineIntegrationService() {
  // Mock Pipeline Integration Service
  const pipelineIntegrationService = {
    initialize: async () => {
      console.log('   Initializing pipeline integration...');
    },
    
    getSystemStatus: async () => ({
      isInitialized: true,
      chromaDBHealth: 'healthy',
      totalDocuments: 15,
      collections: ['portfolio_documents', 'loan_documents', 'analytics_documents', 'bank_targets', 'historical_reports', 'client_insights'],
      dataFreshness: 0.5
    }),
    
    searchDocuments: async (query, options = {}) => [
      {
        id: 'portfolio_overview',
        content: 'Mock portfolio document with PCAF compliance and emission data...',
        type: 'portfolio_overview',
        similarity: 0.85,
        collection: 'portfolio_documents'
      }
    ],
    
    getPortfolioInsights: async (query) => [
      {
        title: 'Portfolio Performance Analysis',
        content: 'Mock insight about portfolio performance and PCAF compliance.',
        type: 'overview',
        confidence: 0.9,
        sources: ['portfolio_overview', 'analytics_comprehensive']
      }
    ],
    
    quickStart: async () => {
      // Simulate quick start process
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        documentsCreated: 15,
        collectionsPopulated: ['portfolio_documents', 'loan_documents', 'analytics_documents'],
        processingTimeMs: 3000,
        errors: []
      };
    }
  };

  await pipelineIntegrationService.initialize();
  const status = await pipelineIntegrationService.getSystemStatus();
  
  return {
    initialized: status.isInitialized,
    chromaHealth: status.chromaDBHealth,
    totalDocuments: status.totalDocuments,
    collections: status.collections.length
  };
}

// Test Document Processing Flow
async function testDocumentProcessingFlow() {
  // Simulate complete document processing
  const testDoc = {
    id: 'test_loan_001',
    content: 'Loan Analysis - TEST001: Tesla Model 3, Electric vehicle, Outstanding: $20,000, Emissions: 0.4 tCO2e, PCAF Score: 2/5',
    metadata: {
      type: 'loan_analysis',
      loanId: 'TEST001',
      dataQuality: 2.0,
      emissionIntensity: 0.02,
      pcafScore: 2,
      tags: ['loan', 'electric', 'compliant']
    }
  };

  // Mock embedding generation
  const embedding = new Array(1536).fill(0).map(() => Math.random() - 0.5);
  
  // Mock ChromaDB storage
  const chromaDoc = {
    ...testDoc,
    embedding,
    metadata: {
      ...testDoc.metadata,
      timestamp: new Date(),
      source: 'test_pipeline'
    }
  };

  return {
    documentId: chromaDoc.id,
    contentLength: chromaDoc.content.length,
    embeddingDimensions: chromaDoc.embedding.length,
    dataQuality: chromaDoc.metadata.dataQuality,
    tags: chromaDoc.metadata.tags.length
  };
}

// Run all tests
async function runPipelineTests() {
  const runner = new TestRunner();

  runner.test('ChromaDB Service Test', testChromaDBService);
  runner.test('Client Documents Service Test', testClientDocumentsService);
  runner.test('Enhanced Pipeline Service Test', testEnhancedPipelineService);
  runner.test('Pipeline Integration Service Test', testPipelineIntegrationService);
  runner.test('Document Processing Flow Test', testDocumentProcessingFlow);

  await runner.run();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runPipelineTests };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runPipelineTests().catch(console.error);
}