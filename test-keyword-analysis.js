/**
 * Keyword Analysis Test
 * Analyzes what keywords are actually in the responses vs expected
 */

const fetch = require('node-fetch');

const TEST_QUERIES = [
  {
    query: "What are the PCAF data quality options for motor vehicles?",
    expectedKeywords: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'data quality']
  },
  {
    query: "How do I calculate attribution factors?",
    expectedKeywords: ['outstanding amount', 'asset value', 'attribution factor', 'formula']
  },
  {
    query: "What are the compliance requirements for PCAF?",
    expectedKeywords: ['weighted', 'score', '3.0', 'compliance', 'regulatory']
  },
  {
    query: "How do I handle electric vehicles in PCAF calculations?",
    expectedKeywords: ['electric', 'grid', 'emission factor', 'kWh', 'zero']
  }
];

async function analyzeKeywords() {
  console.log('🔍 KEYWORD ANALYSIS TEST');
  console.log('=' .repeat(50));
  
  for (const testQuery of TEST_QUERIES) {
    console.log(`\\n📝 Query: "${testQuery.query}"`);
    console.log('-'.repeat(40));
    
    try {
      const response = await fetch('http://localhost:3001/api/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: testQuery.query
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📚 Sources: ${result.sources.join(', ')}`);
        console.log(`\\n💬 Full Response:`);
        console.log(result.response);
        
        // Analyze keywords
        const foundKeywords = testQuery.expectedKeywords.filter(keyword => 
          result.response.toLowerCase().includes(keyword.toLowerCase())
        );
        const missingKeywords = testQuery.expectedKeywords.filter(keyword => 
          !result.response.toLowerCase().includes(keyword.toLowerCase())
        );
        
        console.log(`\\n🔑 Keyword Analysis:`);
        console.log(`✅ Found (${foundKeywords.length}/${testQuery.expectedKeywords.length}): ${foundKeywords.join(', ')}`);
        console.log(`❌ Missing: ${missingKeywords.join(', ')}`);
        
        // Suggest improvements
        if (missingKeywords.length > 0) {
          console.log(`\\n💡 Suggestions:`);
          missingKeywords.forEach(keyword => {
            console.log(`   - Add "${keyword}" to response or ChromaDB documents`);
          });
        }
        
      } else {
        console.log(`❌ Query failed: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`💥 Error: ${error.message}`);
    }
  }
}

analyzeKeywords().catch(console.error);