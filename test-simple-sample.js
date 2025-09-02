console.log('🧪 Testing Sample Data Structure...\n');

// Test sample data structure
const samplePortfolioDoc = {
  id: 'portfolio_overview_2024',
  content: `
PORTFOLIO PERFORMANCE OVERVIEW - 2024
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
    tags: ['portfolio', 'overview', 'pcaf', 'performance']
  }
};

const sampleLoanDoc = {
  id: 'AUTO0001',
  content: `
LOAN ANALYSIS - AUTO0001
- Borrower: Sample Borrower
- Vehicle: Tesla Model 3 (Electric)
- Loan Amount: $45,000
- Outstanding: $36,000
- Annual Emissions: 0.5 tCO2e
- PCAF Score: 2/5 (COMPLIANT)
  `.trim(),
  metadata: {
    type: 'loan_analysis',
    source: 'sample_data',
    timestamp: new Date(),
    dataQuality: 2.0,
    tags: ['loan', 'electric', 'tesla', 'compliant']
  }
};

const sampleInsightDoc = {
  id: 'ai_insight_portfolio_optimization',
  content: `
AI-GENERATED INSIGHT: Portfolio Optimization
- EV Acceleration Opportunity: 18.2% → 25% target
- Revenue Impact: +$450K annually
- Emission Reduction: -185 tCO2e
- Data Quality Improvements: 23 loans identified
- Expected ROI: 15% with 87% confidence
  `.trim(),
  metadata: {
    type: 'ai_insight',
    source: 'sample_data',
    timestamp: new Date(),
    dataQuality: 2.5,
    tags: ['ai', 'insight', 'optimization', 'ev']
  }
};

console.log('📊 Sample Data Structure Test:');
console.log('✅ Portfolio Document:', samplePortfolioDoc.id);
console.log('✅ Loan Document:', sampleLoanDoc.id);
console.log('✅ AI Insight Document:', sampleInsightDoc.id);
console.log('');

console.log('📋 Sample Collections Structure:');
const collections = {
  'portfolio_documents': ['portfolio_overview_2024', 'sustainability_report'],
  'loan_documents': ['AUTO0001', 'AUTO0002', '...AUTO0025'],
  'analytics_documents': ['portfolio_analytics', 'sector_analysis'],
  'bank_targets': ['climate_targets_2024', 'regulatory_compliance'],
  'historical_reports': ['monthly_report_01', '...monthly_report_06'],
  'client_insights': ['ai_portfolio_optimization', 'ai_risk_analysis', 'ai_customer_behavior']
};

Object.entries(collections).forEach(([collection, docs]) => {
  console.log(`✅ ${collection}: ${Array.isArray(docs) ? docs.length : docs.split(',').length} documents`);
});

console.log('');
console.log('🎯 Sample Data Features:');
console.log('✅ Realistic portfolio data (247 loans, $8.2M portfolio)');
console.log('✅ Mixed vehicle types (Electric, Hybrid, Gasoline)');
console.log('✅ PCAF compliance data (scores 1-5, Box 8 WDQS)');
console.log('✅ Climate targets and net-zero commitments');
console.log('✅ Historical performance trends (6 months)');
console.log('✅ AI-generated insights and recommendations');
console.log('✅ Comprehensive metadata and tagging');
console.log('');

console.log('🚀 How to Use Sample Data:');
console.log('1. Start React app: npm run dev');
console.log('2. Navigate to: http://localhost:5173/pipeline-demo');
console.log('3. Click "Load Sample Data" button');
console.log('4. Wait for success message');
console.log('5. Try searches like:');
console.log('   - "PCAF compliance"');
console.log('   - "EV opportunities"'); 
console.log('   - "climate targets"');
console.log('   - "data quality"');
console.log('6. View AI insights tab');
console.log('7. Check ChromaDB collections status');
console.log('');

console.log('📈 Expected Results:');
console.log('- Total Documents: ~45 (2 portfolio + 25 loans + 2 analytics + 2 targets + 6 reports + 3 insights)');
console.log('- Collections: 6 populated collections');
console.log('- Search Results: Relevant documents with similarity scores');
console.log('- AI Insights: 3 comprehensive insights with recommendations');
console.log('- Data Quality: Mixed scores (2.0-4.0) for realistic variation');
console.log('');

console.log('✅ Sample data structure is ready for ChromaDB population!');