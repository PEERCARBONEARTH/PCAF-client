/**
 * Test Specific PCAF Query
 */

const fetch = require('node-fetch');

async function testSpecificQuery() {
  console.log('🎯 Testing Specific PCAF Query');
  console.log('=' .repeat(40));
  
  const testQuery = "How do I calculate financed emissions for motor vehicle loans using PCAF methodology with Option 1 data quality?";
  
  try {
    const response = await fetch('http://localhost:3001/api/rag-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: testQuery
      })
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`\\n📝 Query: "${testQuery}"`);
      console.log(`🎯 Confidence: ${result.confidence}`);
      console.log(`📚 Sources: ${result.sources.join(', ')}`);
      console.log(`\\n💬 Response:`);
      console.log(result.response);
      console.log(`\\n❓ Follow-up Questions:`);
      result.followUpQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q}`);
      });
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`💥 Request failed: ${error.message}`);
  }
}

testSpecificQuery().catch(console.error);