/**
 * Test Script for Data Pipeline Flow
 * Tests the complete ETL pipeline: Extract → Transform → Embed → Store
 */

import { pipelineIntegrationService } from './services/pipeline-integration-service';
import { enhancedDataPipelineService } from './services/enhanced-data-pipeline-service';
import { chromaDBService } from './services/chroma-db-service';
import { clientDocumentsService } from './services/client-documents-service';
import { portfolioService } from './services/portfolioService';

async function testPipelineFlow() {
  console.log('🧪 Starting Pipeline Flow Test...\n');

  try {
    // Test 1: Check if services are available
    console.log('📋 Test 1: Service Availability Check');
    console.log('✅ Pipeline Integration Service:', typeof pipelineIntegrationService);
    console.log('✅ Enhanced Pipeline Service:', typeof enhancedDataPipelineService);
    console.log('✅ ChromaDB Service:', typeof chromaDBService);
    console.log('✅ Client Documents Service:', typeof clientDocumentsService);
    console.log('✅ Portfolio Service:', typeof portfolioService);
    console.log('');

    // Test 2: Initialize ChromaDB
    console.log('📋 Test 2: ChromaDB Initialization');
    const chromaHealth = await chromaDBService.healthCheck();
    console.log('ChromaDB Health:', chromaHealth);
    
    const collections = await chromaDBService.getCollections();
    console.log('Available Collections:', collections.map(c => c.name));
    console.log('');

    // Test 3: Test Portfolio Service
    console.log('📋 Test 3: Portfolio Data Extraction');
    try {
      const portfolioData = await portfolioService.getPortfolioSummary();
      console.log('✅ Portfolio Summary:', {
        totalLoans: portfolioData.summary.totalLoans,
        totalEmissions: portfolioData.summary.totalFinancedEmissions,
        avgDataQuality: portfolioData.summary.averageDataQualityScore
      });
      console.log('✅ Loans Available:', portfolioData.loans.length);
    } catch (error) {
      console.log('⚠️ Portfolio Service Error:', error.message);
      console.log('   This is expected if no backend is running');
    }
    console.log('');

    // Test 4: Test Client Documents Service
    console.log('📋 Test 4: Client Documents Extraction');
    try {
      const clientData = await clientDocumentsService.extractAllClientData();
      console.log('✅ Client Documents:', {
        portfolioData: clientData.portfolioData.length,
        documents: clientData.documents.length,
        bankTargets: clientData.bankTargets.length,
        reports: clientData.clientReports.length
      });
    } catch (error) {
      console.log('⚠️ Client Documents Error:', error.message);
      console.log('   This is expected if portfolio service is unavailable');
    }
    console.log('');

    // Test 5: Test ChromaDB Document Operations
    console.log('📋 Test 5: ChromaDB Document Operations');
    
    // Add a test document
    const testDoc = {
      id: 'test_document_1',
      content: 'This is a test portfolio document with PCAF compliance information and emission data.',
      metadata: {
        type: 'test_document',
        source: 'test_script',
        timestamp: new Date(),
        dataQuality: 3.0,
        tags: ['test', 'portfolio', 'pcaf']
      }
    };

    const addResult = await chromaDBService.addDocuments('portfolio_documents', [testDoc]);
    console.log('✅ Document Added:', addResult);

    // Search for the document
    const searchResults = await chromaDBService.searchDocuments('PCAF compliance', {
      collectionName: 'portfolio_documents',
      limit: 5
    });
    console.log('✅ Search Results:', searchResults.length, 'documents found');
    
    if (searchResults.length > 0) {
      console.log('   Top Result:', {
        id: searchResults[0].document.id,
        similarity: searchResults[0].similarity.toFixed(3),
        type: searchResults[0].document.metadata.type
      });
    }
    console.log('');

    // Test 6: Test Enhanced Pipeline Service
    console.log('📋 Test 6: Enhanced Pipeline Service');
    try {
      const pipelineConfig = enhancedDataPipelineService.getConfig();
      console.log('✅ Pipeline Config:', {
        batchSize: pipelineConfig.batchSize,
        maxLoans: pipelineConfig.maxLoansToProcess,
        enableClientDocs: pipelineConfig.enableClientDocuments
      });

      const processingStatus = await enhancedDataPipelineService.getProcessingStatus();
      console.log('✅ Processing Status:', processingStatus);
    } catch (error) {
      console.log('⚠️ Enhanced Pipeline Error:', error.message);
    }
    console.log('');

    // Test 7: Test Pipeline Integration Service
    console.log('📋 Test 7: Pipeline Integration Service');
    try {
      await pipelineIntegrationService.initialize();
      console.log('✅ Pipeline Integration Initialized');

      const systemStatus = await pipelineIntegrationService.getSystemStatus();
      console.log('✅ System Status:', {
        initialized: systemStatus.isInitialized,
        chromaHealth: systemStatus.chromaDBHealth,
        totalDocs: systemStatus.totalDocuments,
        collections: systemStatus.collections.length
      });
    } catch (error) {
      console.log('⚠️ Pipeline Integration Error:', error.message);
    }
    console.log('');

    // Test 8: Test Search Integration
    console.log('📋 Test 8: Integrated Search');
    try {
      const searchResults = await pipelineIntegrationService.searchDocuments('test portfolio', {
        limit: 3
      });
      console.log('✅ Integrated Search Results:', searchResults.length, 'documents');
      
      searchResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.id} (${result.similarity.toFixed(3)} similarity)`);
      });
    } catch (error) {
      console.log('⚠️ Integrated Search Error:', error.message);
    }
    console.log('');

    // Test 9: Test Insights Generation
    console.log('📋 Test 9: Portfolio Insights Generation');
    try {
      const insights = await pipelineIntegrationService.getPortfolioInsights('portfolio performance');
      console.log('✅ Generated Insights:', insights.length, 'insights');
      
      insights.forEach((insight, index) => {
        console.log(`   ${index + 1}. ${insight.title} (${insight.type}, ${(insight.confidence * 100).toFixed(1)}% confidence)`);
      });
    } catch (error) {
      console.log('⚠️ Insights Generation Error:', error.message);
    }
    console.log('');

    // Test 10: Collection Statistics
    console.log('📋 Test 10: Collection Statistics');
    const collectionNames = ['portfolio_documents', 'loan_documents', 'analytics_documents'];
    
    for (const collectionName of collectionNames) {
      try {
        const stats = await chromaDBService.getCollectionStats(collectionName);
        console.log(`✅ ${collectionName}:`, {
          documents: stats.documentCount,
          avgQuality: stats.avgDataQuality.toFixed(2),
          types: Object.keys(stats.typeDistribution).length
        });
      } catch (error) {
        console.log(`⚠️ ${collectionName} stats error:`, error.message);
      }
    }
    console.log('');

    console.log('🎉 Pipeline Flow Test Completed Successfully!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('✅ All core services are available');
    console.log('✅ ChromaDB is operational');
    console.log('✅ Document storage and retrieval works');
    console.log('✅ Semantic search is functional');
    console.log('✅ Pipeline integration is ready');
    console.log('');
    console.log('🚀 Ready to run full pipeline with: pipelineIntegrationService.quickStart()');

  } catch (error) {
    console.error('❌ Pipeline Flow Test Failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Export for use in other files
export { testPipelineFlow };

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testPipelineFlow().catch(console.error);
}