/**
 * API Error Details Test
 * 
 * This script gets detailed error information from the RAG API
 */

const fetch = require('node-fetch');

async function testAPIErrorDetails() {
  console.log('🔍 Testing RAG API Error Details');
  console.log('=' .repeat(40));
  
  try {
    const response = await fetch('http://localhost:3001/api/rag-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'What are PCAF options?'
      })
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);
    
    const responseText = await response.text();
    console.log(`📝 Response Body:`);
    console.log(responseText);
    
    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log(`\n📊 Parsed JSON:`);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log(`\n⚠️ Response is not valid JSON`);
    }
    
  } catch (error) {
    console.log(`💥 Request failed: ${error.message}`);
  }
}

testAPIErrorDetails().catch(console.error);