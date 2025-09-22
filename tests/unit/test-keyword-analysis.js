/**
 * Keyword Analysis Test
 * Analyzes what keywords are actually in the responses vs expected
 */

const fetch = require('node-fetch');

const TEST_QUERIES = [
  {
    query: "What are the PCAF data quality options for motor vehicle financed emissions?",
    expectedKeywords: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'motor vehicle', 'financed emissions', 'data quality']
  },
  {
    query: "How do I calculate attribution factors for motor vehicle loans?",
    expectedKeywords: ['outstanding amount', 'asset value', 'attribution factor', 'motor vehicle', 'loan', 'financed emissions']
  },
  {
    query: "What emission factors should I use for gasoline and diesel vehicles?",
    expectedKeywords: ['emission factor', 'gasoline', 'diesel', 'fuel consumption', 'CO2', 'motor vehicle']
  },
  {
    query: "How do I handle electric vehicles in PCAF motor vehicle calculations?",
    expectedKeywords: ['electric vehicle', 'grid emission factor', 'kWh', 'zero tailpipe', 'electricity consumption']
  },
  {
    query: "What vehicle specifications are needed for Option 1 data quality in motor vehicles?",
    expectedKeywords: ['Option 1', 'vehicle specifications', 'fuel consumption', 'distance traveled', 'motor vehicle']
  },
  {
    query: "How do I calculate financed emissions for a motor vehicle portfolio using Option 2 data?",
    expectedKeywords: ['Option 2', 'vehicle type', 'average emission factor', 'distance', 'financed emissions', 'portfolio']
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