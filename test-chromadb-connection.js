/**
 * Test ChromaDB Connection and RAG API
 * 
 * This script tests the ChromaDB RAG API endpoint to ensure it's working properly
 */

const testQueries = [
  "What are the PCAF data quality options?",
  "How do I calculate attribution factors?",
  "What are the compliance requirements?",
  "How do I handle electric vehicles?",
  "What is my portfolio data quality score?"
];

async function testRAGAPI() {
  console.log('🧪 Testing ChromaDB RAG API Connection...\n');

  for (const query of testQueries) {
    console.log(`📝 Testing query: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          portfolioContext: {
            totalLoans: 150,
            dataQuality: {
              averageScore: 3.2,
              complianceStatus: 'needs_improvement'
            }
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Success - Confidence: ${result.confidence}`);
        console.log(`📊 Sources: ${result.sources?.length || 0} sources`);
        console.log(`🔗 Follow-ups: ${result.followUpQuestions?.length || 0} questions`);
        console.log(`📝 Response length: ${result.response?.length || 0} chars\n`);
      } else {
        console.log(`❌ Failed - Status: ${response.status}`);
        const error = await response.text();
        console.log(`Error: ${error}\n`);
      }
    } catch (error) {
      console.log(`💥 Network Error: ${error.message}\n`);
    }
  }
}

// Test ChromaDB collection status
async function testCollectionStatus() {
  console.log('📊 Testing ChromaDB Collection Status...\n');
  
  try {
    // Test with a simple query to check if ChromaDB is accessible
    const response = await fetch('http://localhost:3000/api/rag-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "test connection"
      })
    });

    if (response.ok) {
      console.log('✅ ChromaDB API endpoint is accessible');
      const result = await response.json();
      console.log(`📊 Response received with confidence: ${result.confidence}`);
    } else {
      console.log(`❌ ChromaDB API endpoint error: ${response.status}`);
    }
  } catch (error) {
    console.log(`💥 ChromaDB connection failed: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting ChromaDB RAG System Tests\n');
  console.log('=' .repeat(50));
  
  await testCollectionStatus();
  console.log('=' .repeat(50));
  await testRAGAPI();
  
  console.log('🏁 Tests completed!');
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testRAGAPI, testCollectionStatus, runTests };
}

// Always run when called directly
runTests().catch(console.error);