/**
 * Test Local RAG API
 * 
 * This script tests the RAG API locally to debug the static response issue
 */

async function testLocalRAGAPI() {
  console.log('🧪 Testing Local RAG API...\n');
  
  const testQueries = [
    'What are PCAF data quality options?',
    'How do I calculate attribution factors?',
    'Electric vehicle calculations',
    'PCAF compliance requirements',
    'What is financed emissions?'
  ];
  
  const baseURL = 'http://localhost:3000';
  
  for (const query of testQueries) {
    console.log(`📝 Testing: "${query}"`);
    
    try {
      const response = await fetch(`${baseURL}/api/rag-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          portfolioContext: null
        })
      });
      
      if (!response.ok) {
        console.log(`   ❌ API Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   Error details: ${errorText}`);
        continue;
      }
      
      const result = await response.json();
      
      if (result.error) {
        console.log(`   ❌ Response Error: ${result.error}`);
        continue;
      }
      
      console.log(`   ✅ Success! Confidence: ${result.confidence}`);
      console.log(`   📄 Response type: ${result.responseType || 'unknown'}`);
      console.log(`   📊 Structured: ${result.structuredData ? 'Yes' : 'No'}`);
      console.log(`   📚 Sources: ${result.sources?.length || 0} sources`);
      console.log(`   ❓ Follow-ups: ${result.followUpQuestions?.length || 0} questions`);
      
      // Check response content to identify source
      const responseText = result.response || '';
      if (responseText.includes('200+ comprehensive PCAF questions')) {
        console.log(`   🔄 Source: Fallback response`);
      } else if (responseText.includes('PCAF Data Quality Options') && responseText.includes('Option 1:')) {
        console.log(`   🎯 Source: Surgical response (static)`);
      } else if (responseText.includes('**') && responseText.length > 500) {
        console.log(`   🌟 Source: ChromaDB response (dynamic)`);
      } else {
        console.log(`   ❓ Source: Unknown (${responseText.length} chars)`);
      }
      
      // Show first 100 characters of response
      console.log(`   📝 Preview: ${responseText.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🧪 Local RAG API test completed!');
}

// Check if we're in Node.js environment
if (typeof fetch === 'undefined') {
  // Use dynamic import for node-fetch
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    testLocalRAGAPI().catch(console.error);
  });
} else {
  testLocalRAGAPI().catch(console.error);
}