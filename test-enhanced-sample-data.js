/**
 * Test Enhanced Sample Data Loading
 * Verifies that sample data is loaded with comprehensive metadata
 */

import { loadAllSampleData, clearAllSampleData } from './src/services/sample-data-loader.ts';
import { chromaDBService } from './src/services/chroma-db-service.ts';

async function testEnhancedSampleData() {
  console.log('🧪 Testing Enhanced Sample Data Loading...\n');

  try {
    // Clear existing data first
    console.log('1. Clearing existing sample data...');
    await clearAllSampleData();
    console.log('✅ Cleared existing data\n');

    // Load enhanced sample data
    console.log('2. Loading enhanced sample data...');
    const result = await loadAllSampleData({
      numLoans: 10, // Smaller set for testing
      includeHistoricalData: true,
      dataQualityVariation: true
    });

    console.log(`✅ Loaded ${result.totalDocuments} documents across ${result.collectionsPopulated.length} collections`);
    console.log(`   Processing time: ${result.processingTime}ms\n`);

    // Test metadata richness by searching loan documents
    console.log('3. Testing metadata richness...');
    
    // Search for EV loans using metadata
    const evLoans = await chromaDBService.searchDocuments('electric vehicle Tesla', {
      limit: 5,
      filters: { 
        type: 'loan_analysis',
        fuelType: 'Electric',
        isEV: true
      }
    });

    console.log(`✅ Found ${evLoans.length} EV loans with rich metadata`);
    
    if (evLoans.length > 0) {
      const sampleLoan = evLoans[0];
      console.log('\n📊 Sample EV Loan Metadata:');
      console.log(`   - Loan ID: ${sampleLoan.document.metadata.loanId}`);
      console.log(`   - Vehicle: ${sampleLoan.document.metadata.vehicleMake} ${sampleLoan.document.metadata.vehicleModel}`);
      console.log(`   - Fuel Type: ${sampleLoan.document.metadata.fuelType}`);
      console.log(`   - Emissions: ${sampleLoan.document.metadata.emissions} tCO2e`);
      console.log(`   - PCAF Score: ${sampleLoan.document.metadata.pcafScore}/5`);
      console.log(`   - Compliant: ${sampleLoan.document.metadata.isCompliant}`);
      console.log(`   - Risk Level: ${sampleLoan.document.metadata.riskLevel}`);
      console.log(`   - ESG Score: ${sampleLoan.document.metadata.esgScore}`);
      console.log(`   - State: ${sampleLoan.document.metadata.state}`);
      console.log(`   - Credit Score: ${sampleLoan.document.metadata.creditScore}`);
    }

    // Test portfolio overview metadata
    console.log('\n4. Testing portfolio overview metadata...');
    const portfolioOverview = await chromaDBService.searchDocuments('portfolio performance overview', {
      limit: 1,
      filters: { type: 'portfolio_overview' }
    });

    if (portfolioOverview.length > 0) {
      const overview = portfolioOverview[0];
      console.log('✅ Portfolio Overview Metadata:');
      console.log(`   - Total Loans: ${overview.document.metadata.totalLoans}`);
      console.log(`   - Portfolio Value: $${(overview.document.metadata.portfolioValue / 1000000).toFixed(1)}M`);
      console.log(`   - Total Emissions: ${overview.document.metadata.totalEmissions} tCO2e`);
      console.log(`   - EV Share: ${overview.document.metadata.evShare}%`);
      console.log(`   - Compliance Rate: ${overview.document.metadata.complianceRate}%`);
      console.log(`   - PCAF Box Score: ${overview.document.metadata.pcafBoxScore}`);
    }

    // Test AI insights metadata
    console.log('\n5. Testing AI insights metadata...');
    const aiInsights = await chromaDBService.searchDocuments('portfolio optimization opportunity', {
      limit: 1,
      filters: { 
        type: 'ai_insight',
        category: 'opportunity',
        isHighImpact: true
      }
    });

    if (aiInsights.length > 0) {
      const insight = aiInsights[0];
      console.log('✅ AI Insight Metadata:');
      console.log(`   - Insight Type: ${insight.document.metadata.insightType}`);
      console.log(`   - Confidence: ${insight.document.metadata.confidenceLevel}%`);
      console.log(`   - Revenue Impact: $${insight.document.metadata.revenueImpact.toLocaleString()}`);
      console.log(`   - Emission Reduction: ${insight.document.metadata.emissionReduction} tCO2e`);
      console.log(`   - ROI: ${insight.document.metadata.roi}%`);
      console.log(`   - Timeline: ${insight.document.metadata.timelineMonths} months`);
      console.log(`   - Actionable: ${insight.document.metadata.isActionable}`);
    }

    // Test advanced filtering capabilities
    console.log('\n6. Testing advanced filtering...');
    
    // Find high-emission, high-value loans that are EV upgrade candidates
    const upgradeTargets = await chromaDBService.getDocumentsByMetadata({
      type: 'loan_analysis',
      evUpgradeCandidate: true,
      isHighEmission: true,
      isLargeBalance: true
    });

    console.log(`✅ Found ${upgradeTargets.length} EV upgrade candidates`);

    // Find non-compliant loans needing data improvement
    const dataImprovementTargets = await chromaDBService.getDocumentsByMetadata({
      type: 'loan_analysis',
      dataImprovementCandidate: true,
      isCompliant: false
    });

    console.log(`✅ Found ${dataImprovementTargets.length} loans needing data improvement`);

    console.log('\n🎉 Enhanced sample data test completed successfully!');
    console.log('\n📈 Key Benefits of Enhanced Metadata:');
    console.log('   ✓ Rich filtering and search capabilities');
    console.log('   ✓ Detailed loan characteristics and risk factors');
    console.log('   ✓ Financial and ESG metrics for analysis');
    console.log('   ✓ Geographic and temporal data for trends');
    console.log('   ✓ Opportunity flags for AI-driven insights');
    console.log('   ✓ Performance indicators and benchmarks');

  } catch (error) {
    console.error('❌ Enhanced sample data test failed:', error);
    throw error;
  }
}

// Run the test
testEnhancedSampleData().catch(console.error);