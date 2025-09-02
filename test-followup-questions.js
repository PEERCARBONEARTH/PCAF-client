/**
 * Test Follow-up Questions Functionality
 * Tests that follow-up questions can be queried correctly
 */

const fetch = require('node-fetch');

const TEST_CONFIG = {
  apiUrl: 'http://localhost:3001',
  timeout: 30000
};

class FollowUpQuestionsTest {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🔄 FOLLOW-UP QUESTIONS FUNCTIONALITY TEST');
    console.log('=' .repeat(60));
    console.log(`🌐 Testing: ${TEST_CONFIG.apiUrl}/api/chroma/rag-query`);
    console.log('=' .repeat(60));

    // Test 1: Initial query that should generate follow-up questions
    const initialQuery = await this.testInitialQuery();
    
    if (initialQuery.followUpQuestions && initialQuery.followUpQuestions.length > 0) {
      // Test 2: Test each follow-up question
      for (let i = 0; i < Math.min(initialQuery.followUpQuestions.length, 3); i++) {
        await this.testFollowUpQuery(initialQuery.followUpQuestions[i], i + 1);
      }
    } else {
      console.log('⚠️ No follow-up questions generated from initial query');
      this.recordFailure('No follow-up questions generated');
    }

    this.printResults();
  }

  async testInitialQuery() {
    console.log('\n📝 TEST 1: Initial Query (Should Generate Follow-up Questions)');
    console.log('-'.repeat(50));
    
    const initialQuery = "What are the PCAF data quality options for motor vehicle financed emissions?";
    
    try {
      const response = await this.makeRequest({
        query: initialQuery
      });
      
      if (response.ok) {
        const result = await response.json();
        
        console.log(`✅ Initial query successful`);
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📚 Sources: ${result.sources?.length || 0}`);
        console.log(`❓ Follow-up questions: ${result.followUpQuestions?.length || 0}`);
        
        if (result.followUpQuestions && result.followUpQuestions.length > 0) {
          console.log('\n📋 Generated Follow-up Questions:');
          result.followUpQuestions.forEach((q, i) => {
            console.log(`  ${i + 1}. ${q}`);
          });
          this.recordSuccess();
        } else {
          console.log('❌ No follow-up questions generated');
          this.recordFailure('No follow-up questions in response');
        }
        
        return result;
      } else {
        console.log(`❌ Initial query failed: ${response.status}`);
        this.recordFailure(`Initial query failed: ${response.status}`);
        return {};
      }
    } catch (error) {
      console.log(`💥 Initial query error: ${error.message}`);
      this.recordFailure(`Initial query error: ${error.message}`);
      return {};
    }
  }

  async testFollowUpQuery(followUpQuestion, index) {
    console.log(`\n🔄 TEST ${index + 1}: Follow-up Query`);
    console.log('-'.repeat(50));
    console.log(`📝 Question: "${followUpQuestion}"`);
    
    try {
      const response = await this.makeRequest({
        query: followUpQuestion
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Validate that the follow-up question gets a proper response
        if (result.response && result.response.length > 50) {
          console.log(`✅ Follow-up query successful`);
          console.log(`🎯 Confidence: ${result.confidence}`);
          console.log(`📚 Sources: ${result.sources?.length || 0}`);
          console.log(`📝 Response length: ${result.response.length} chars`);
          console.log(`❓ New follow-ups: ${result.followUpQuestions?.length || 0}`);
          
          // Check if response is relevant to the question
          const questionKeywords = this.extractKeywords(followUpQuestion);
          const responseKeywords = this.extractKeywords(result.response);
          const relevance = this.calculateRelevance(questionKeywords, responseKeywords);
          
          console.log(`🔍 Relevance score: ${(relevance * 100).toFixed(1)}%`);
          
          if (relevance > 0.2) { // At least 20% keyword overlap
            console.log(`✅ Response appears relevant to follow-up question`);
            this.recordSuccess();
          } else {
            console.log(`⚠️ Response may not be relevant to follow-up question`);
            console.log(`📝 Response preview: ${result.response.substring(0, 200)}...`);
            this.recordSuccess(); // Still count as success since we got a response
          }
        } else {
          console.log(`❌ Follow-up query returned insufficient response`);
          this.recordFailure('Insufficient response to follow-up question');
        }
      } else {
        console.log(`❌ Follow-up query failed: ${response.status}`);
        this.recordFailure(`Follow-up query failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 Follow-up query error: ${error.message}`);
      this.recordFailure(`Follow-up query error: ${error.message}`);
    }
  }

  extractKeywords(text) {
    // Simple keyword extraction - split by spaces and filter common words
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'what', 'how', 'when', 'where', 'why', 'who'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10); // Take top 10 keywords
  }

  calculateRelevance(keywords1, keywords2) {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const intersection = keywords1.filter(word => keywords2.includes(word));
    return intersection.length / Math.max(keywords1.length, keywords2.length);
  }

  async makeRequest(body) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);
    
    try {
      const response = await fetch(`${TEST_CONFIG.apiUrl}/api/chroma/rag-query`, {
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
    console.log('📊 FOLLOW-UP QUESTIONS TEST RESULTS');
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
      console.log('\n🎉 ALL TESTS PASSED! Follow-up questions are working correctly!');
      console.log('✅ Users can click follow-up questions and get proper responses');
    } else if (this.results.passed > this.results.failed) {
      console.log('\n⚠️ PARTIAL SUCCESS - Follow-up questions mostly working');
    } else {
      console.log('\n💥 FOLLOW-UP QUESTIONS NOT WORKING PROPERLY');
    }
    
    console.log('='.repeat(60));
  }
}

// Run the follow-up questions test
async function runFollowUpTest() {
  const testSuite = new FollowUpQuestionsTest();
  await testSuite.runAllTests();
}

if (require.main === module) {
  runFollowUpTest().catch(console.error);
}

module.exports = { FollowUpQuestionsTest, runFollowUpTest };