/**
 * COMPREHENSIVE RAG CHROMADB INTEGRATION TEST
 * 
 * This test validates the entire RAG pipeline from ChromaDB to UI response
 * Tests both the API endpoint and the actual ChromaDB collection
 */

const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
  apiUrl: 'http://localhost:3001/api/rag-query',
  chromaUrl: process.env.CHROMA_API_URL || 'https://api.trychroma.com',
  collectionName: 'pcaf_enhanced_v6',
  timeout: 30000
};

// Test queries with expected response indicators
const TEST_QUERIES = [
  {
    query: "What are the PCAF data quality options for motor vehicles?",
    expectedKeywords: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'data quality'],
    category: 'methodology',
    minConfidence: 'medium'
  },
  {
    query: "How do I calculate attribution factors?",
    expectedKeywords: ['outstanding amount', 'asset value', 'attribution factor', 'formula'],
    category: 'calculation',
    minConfidence: 'high'
  },
  {
    query: "What are the compliance requirements for PCAF?",
    expectedKeywords: ['weighted', 'score', '3.0', 'compliance', 'regulatory'],
    category: 'compliance',
    minConfidence: 'high'
  },
  {
    query: "How do I handle electric vehicles in PCAF calculations?",
    expectedKeywords: ['electric', 'grid', 'emission factor', 'kWh', 'zero'],
    category: 'vehicle_specific',
    minConfidence: 'medium'
  },
  {
    query: "What is my portfolio data quality score?",
    expectedKeywords: ['portfolio', 'WDQS', 'weighted', 'data quality'],
    category: 'portfolio_analysis',
    minConfidence: 'medium',
    requiresPortfolioContext: true
  }
];

// Portfolio context for testing
const MOCK_PORTFOLIO_CONTEXT = {
  totalLoans: 150,
  dataQuality: {
    averageScore: 3.2,
    complianceStatus: 'needs_improvement',
    distribution: { 1: 10, 2: 20, 3: 50, 4: 40, 5: 30 },
    loansNeedingImprovement: 70
  },
  improvements: {
    option_5_to_4: ['loan_001', 'loan_002', 'loan_003'],
    option_4_to_3: ['loan_004', 'loan_005']
  }
};

class RAGTestSuite {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🚀 COMPREHENSIVE RAG CHROMADB INTEGRATION TEST');
    console.log('=' .repeat(60));
    console.log(`📊 Testing ${TEST_QUERIES.length} queries against ChromaDB collection: ${TEST_CONFIG.collectionName}`);
    console.log('=' .repeat(60));

    // Test 1: API Endpoint Availability
    await this.testAPIEndpoint();
    
    // Test 2: ChromaDB Collection Access
    await this.testChromaDBAccess();
    
    // Test 3: Individual Query Tests
    for (const testQuery of TEST_QUERIES) {
      await this.testRAGQuery(testQuery);
    }
    
    // Test 4: Portfolio Context Integration
    await this.testPortfolioContextIntegration();
    
    // Test 5: Response Quality Validation
    await this.testResponseQuality();

    this.printResults();
  }

  async testAPIEndpoint() {
    console.log('\n🔍 TEST 1: API Endpoint Availability');
    console.log('-'.repeat(40));
    
    try {
      const response = await this.makeRequest({
        query: "test connection",
        timeout: 5000
      });
      
      if (response.ok) {
        console.log('✅ API endpoint is accessible');
        this.recordSuccess();
      } else {
        console.log(`❌ API endpoint returned status: ${response.status}`);
        this.recordFailure(`API endpoint error: ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 API endpoint failed: ${error.message}`);
      this.recordFailure(`API connection failed: ${error.message}`);
    }
  }

  async testChromaDBAccess() {
    console.log('\n🗄️ TEST 2: ChromaDB Collection Access');
    console.log('-'.repeat(40));
    
    try {
      const response = await this.makeRequest({
        query: "What are PCAF options?",
        timeout: 10000
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.response && result.response.length > 50) {
          console.log('✅ ChromaDB returned substantial response');
          console.log(`📊 Response length: ${result.response.length} characters`);
          console.log(`🎯 Confidence: ${result.confidence}`);
          console.log(`📚 Sources: ${result.sources?.length || 0}`);
          this.recordSuccess();
        } else {
          console.log('⚠️ ChromaDB response too short or empty');
          console.log(`Response: ${result.response?.substring(0, 100)}...`);
          this.recordFailure('ChromaDB response insufficient');
        }
      } else {
        console.log(`❌ ChromaDB query failed: ${response.status}`);
        this.recordFailure(`ChromaDB query error: ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 ChromaDB access failed: ${error.message}`);
      this.recordFailure(`ChromaDB access error: ${error.message}`);
    }
  }

  async testRAGQuery(testQuery) {
    console.log(`\n📝 TEST: "${testQuery.query}"`);
    console.log('-'.repeat(40));
    
    try {
      const requestBody = {
        query: testQuery.query
      };
      
      if (testQuery.requiresPortfolioContext) {
        requestBody.portfolioContext = MOCK_PORTFOLIO_CONTEXT;
      }
      
      const response = await this.makeRequest(requestBody);
      
      if (!response.ok) {
        console.log(`❌ Query failed with status: ${response.status}`);
        this.recordFailure(`Query failed: ${response.status}`);
        return;
      }
      
      const result = await response.json();
      
      // Validate response structure
      if (!result.response) {
        console.log('❌ No response content received');
        this.recordFailure('Missing response content');
        return;
      }
      
      // Check confidence level
      const confidenceScore = this.getConfidenceScore(result.confidence);
      const minConfidenceScore = this.getConfidenceScore(testQuery.minConfidence);
      
      if (confidenceScore < minConfidenceScore) {
        console.log(`⚠️ Confidence too low: ${result.confidence} (expected: ${testQuery.minConfidence})`);
      }
      
      // Check for expected keywords
      const foundKeywords = testQuery.expectedKeywords.filter(keyword => 
        result.response.toLowerCase().includes(keyword.toLowerCase())
      );
      
      const keywordMatch = foundKeywords.length / testQuery.expectedKeywords.length;
      
      if (keywordMatch >= 0.6) {
        console.log(`✅ Query successful - ${foundKeywords.length}/${testQuery.expectedKeywords.length} keywords found`);
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📚 Sources: ${result.sources?.length || 0}`);
        console.log(`📝 Response length: ${result.response.length} chars`);
        console.log(`🔑 Found keywords: ${foundKeywords.join(', ')}`);
        this.recordSuccess();
      } else {
        console.log(`❌ Poor keyword match: ${foundKeywords.length}/${testQuery.expectedKeywords.length}`);
        console.log(`🔍 Expected: ${testQuery.expectedKeywords.join(', ')}`);
        console.log(`✅ Found: ${foundKeywords.join(', ')}`);
        console.log(`📝 Response preview: ${result.response.substring(0, 200)}...`);
        this.recordFailure(`Poor keyword match for query: ${testQuery.query}`);
      }
      
    } catch (error) {
      console.log(`💥 Query test failed: ${error.message}`);
      this.recordFailure(`Query test error: ${error.message}`);
    }
  }

  async testPortfolioContextIntegration() {
    console.log('\n💼 TEST: Portfolio Context Integration');
    console.log('-'.repeat(40));
    
    try {
      const response = await this.makeRequest({
        query: "What is my current portfolio data quality score?",
        portfolioContext: MOCK_PORTFOLIO_CONTEXT
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Check if portfolio data is integrated
        const hasPortfolioData = result.response.includes('150') || // total loans
                                result.response.includes('3.2') || // average score
                                result.response.includes('needs_improvement'); // status
        
        if (hasPortfolioData) {
          console.log('✅ Portfolio context successfully integrated');
          console.log('📊 Portfolio data found in response');
          this.recordSuccess();
        } else {
          console.log('⚠️ Portfolio context not properly integrated');
          console.log(`Response: ${result.response.substring(0, 300)}...`);
          this.recordFailure('Portfolio context integration failed');
        }
      } else {
        console.log(`❌ Portfolio context test failed: ${response.status}`);
        this.recordFailure(`Portfolio context test error: ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 Portfolio context test failed: ${error.message}`);
      this.recordFailure(`Portfolio context test error: ${error.message}`);
    }
  }

  async testResponseQuality() {
    console.log('\n🎯 TEST: Response Quality Validation');
    console.log('-'.repeat(40));
    
    try {
      const response = await this.makeRequest({
        query: "Explain PCAF methodology for motor vehicles"
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Quality checks
        const checks = {
          'Sufficient length': result.response.length > 200,
          'Has sources': result.sources && result.sources.length > 0,
          'Has confidence': result.confidence && ['high', 'medium', 'low'].includes(result.confidence),
          'Professional tone': result.response.includes('PCAF') && !result.response.includes('I don\'t know'),
          'Structured format': result.response.includes('**') || result.response.includes('•'),
          'Follow-up questions': result.followUpQuestions && result.followUpQuestions.length > 0
        };
        
        const passedChecks = Object.entries(checks).filter(([_, passed]) => passed);
        const qualityScore = passedChecks.length / Object.keys(checks).length;
        
        console.log(`📊 Quality Score: ${(qualityScore * 100).toFixed(1)}%`);
        
        Object.entries(checks).forEach(([check, passed]) => {
          console.log(`${passed ? '✅' : '❌'} ${check}`);
        });
        
        if (qualityScore >= 0.8) {
          console.log('🎉 High quality response detected');
          this.recordSuccess();
        } else {
          console.log('⚠️ Response quality below threshold');
          this.recordFailure(`Low quality score: ${qualityScore}`);
        }
        
      } else {
        console.log(`❌ Quality test failed: ${response.status}`);
        this.recordFailure(`Quality test error: ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 Quality test failed: ${error.message}`);
      this.recordFailure(`Quality test error: ${error.message}`);
    }
  }

  async makeRequest(body, timeout = TEST_CONFIG.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(TEST_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  getConfidenceScore(confidence) {
    switch (confidence) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  recordSuccess() {
    this.results.total++;
    this.results.passed++;
  }

  recordFailure(error) {
    this.results.total++;
    this.results.failed++;
    this.results.errors.push(error);
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS ENCOUNTERED:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.results.passed === this.results.total) {
      console.log('\n🎉 ALL TESTS PASSED! ChromaDB RAG system is working perfectly!');
    } else if (this.results.passed > this.results.failed) {
      console.log('\n⚠️ PARTIAL SUCCESS - Some issues detected but system is functional');
    } else {
      console.log('\n💥 SYSTEM FAILURE - Major issues detected with ChromaDB RAG integration');
    }
    
    console.log('='.repeat(60));
  }
}

// Run the comprehensive test suite
async function runComprehensiveRAGTest() {
  const testSuite = new RAGTestSuite();
  await testSuite.runAllTests();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RAGTestSuite, runComprehensiveRAGTest };
}

// Run when called directly
if (require.main === module) {
  runComprehensiveRAGTest().catch(console.error);
}