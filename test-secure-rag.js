/**
 * Test Secure RAG API
 * 
 * This script tests the new secure server-side RAG API endpoint
 * to ensure ChromaDB queries work without exposing API keys.
 */

// Use dynamic import for node-fetch
async function getFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function testSecureRAGAPI() {
  console.log('🔒 Testing Secure RAG API Endpoint...\n');
  
  const fetch = await getFetch();
  
  // Test queries
  const testQueries = [
    'What are PCAF data quality options?',
    'How do I calculate attribution factors?',
    'Electric vehicle calculations',
    'PCAF compliance requirements'
  ];
  
  const baseURL = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  console.log(`🌐 Testing against: ${baseURL}\n`);
  
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
        continue;
      }
      
      const result = await response.json();
      
      if (result.error) {
        console.log(`   ❌ Response Error: ${result.error}`);
        continue;
      }
      
      console.log(`   ✅ Success! Confidence: ${result.confidence}`);
      console.log(`   📄 Response length: ${result.response.length} characters`);
      console.log(`   📚 Sources: ${result.sources.length} sources`);
      console.log(`   ❓ Follow-ups: ${result.followUpQuestions.length} questions`);
      
      // Check if it's a ChromaDB result or fallback
      if (result.response.includes('200+ comprehensive PCAF questions')) {
        console.log(`   ⚠️  Using fallback response (ChromaDB not connected)`);
      } else {
        console.log(`   🎉 Using ChromaDB response (connection working!)`);
      }
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🔒 Secure RAG API test completed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Configure environment variables in Vercel:');
  console.log('      CHROMA_API_KEY=your_chroma_api_key');
  console.log('      CHROMA_TENANT=efcad529-ed4c-4265-8aa0-f48e2a741582');
  console.log('      CHROMA_DATABASE=peerTing');
  console.log('      OPENAI_API_KEY=your_openai_api_key');
  console.log('   2. Deploy to Vercel');
  console.log('   3. Test the live chatbot');
}

// Run the test
testSecureRAGAPI().catch(console.error);