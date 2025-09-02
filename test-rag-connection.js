/**
 * Test RAG Service ChromaDB Connection
 * 
 * This script tests the actual ChromaDB connection from the client-side
 * environment to diagnose why the RAG service is returning static responses.
 */

// Simulate the client environment
const chromaDBConfig = {
  apiKey: process.env.NEXT_PUBLIC_CHROMA_API_KEY || '',
  tenant: process.env.NEXT_PUBLIC_CHROMA_TENANT || '',
  database: process.env.NEXT_PUBLIC_CHROMA_DATABASE || '',
  baseURL: 'https://api.trychroma.com',
  collectionName: 'pcaf_calculation_optimized'
};

async function testRAGConnection() {
  console.log('🔍 Testing RAG Service ChromaDB Connection...\n');
  
  console.log('📋 Configuration Check:');
  console.log(`   API Key: ${chromaDBConfig.apiKey ? '✅ Configured (' + chromaDBConfig.apiKey.substring(0, 10) + '...)' : '❌ Missing'}`);
  console.log(`   Tenant: ${chromaDBConfig.tenant || '❌ Missing'}`);
  console.log(`   Database: ${chromaDBConfig.database || '❌ Missing'}`);
  console.log(`   Collection: ${chromaDBConfig.collectionName}`);
  
  if (!chromaDBConfig.apiKey || !chromaDBConfig.tenant || !chromaDBConfig.database) {
    console.log('\n❌ PROBLEM IDENTIFIED: Missing environment variables!');
    console.log('\n🔧 SOLUTION: Configure these in Vercel:');
    console.log('   NEXT_PUBLIC_CHROMA_API_KEY=your_chroma_api_key');
    console.log('   NEXT_PUBLIC_CHROMA_TENANT=efcad529-ed4c-4265-8aa0-f48e2a741582');
    console.log('   NEXT_PUBLIC_CHROMA_DATABASE=peerTing');
    console.log('   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key');
    console.log('\n📝 After configuring, redeploy and test again.');
    return false;
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test collection access
    console.log('\n🔗 Testing collection access...');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${chromaDBConfig.apiKey}`,
      'X-Chroma-Token': chromaDBConfig.apiKey,
      'X-Chroma-Tenant': chromaDBConfig.tenant,
      'X-Chroma-Database': chromaDBConfig.database
    };
    
    const collectionResponse = await fetch(
      `${chromaDBConfig.baseURL}/api/v2/tenants/${chromaDBConfig.tenant}/databases/${chromaDBConfig.database}/collections/${chromaDBConfig.collectionName}`,
      {
        method: 'GET',
        headers
      }
    );
    
    if (!collectionResponse.ok) {
      const errorText = await collectionResponse.text();
      console.log(`❌ Collection access failed: ${collectionResponse.status}`);
      console.log(`   Error: ${errorText}`);
      return false;
    }
    
    const collectionInfo = await collectionResponse.json();
    console.log(`✅ Collection accessible: ${collectionInfo.name}`);
    console.log(`   Documents: ${collectionInfo.count || 'Unknown'}`);
    console.log(`   ID: ${collectionInfo.id}`);
    
    // Test a simple search
    console.log('\n🔍 Testing search functionality...');
    
    const testQuery = 'What are PCAF data quality options?';
    console.log(`   Query: "${testQuery}"`);
    
    // Generate embedding (simplified test)
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.log('❌ OpenAI API key missing - cannot test search');
      return false;
    }
    
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: testQuery,
        model: 'text-embedding-3-small'
      })
    });
    
    if (!embeddingResponse.ok) {
      console.log(`❌ OpenAI embedding failed: ${embeddingResponse.status}`);
      return false;
    }
    
    const embeddingResult = await embeddingResponse.json();
    const queryEmbedding = embeddingResult.data[0].embedding;
    
    // Search ChromaDB
    const searchResponse = await fetch(
      `${chromaDBConfig.baseURL}/api/v2/tenants/${chromaDBConfig.tenant}/databases/${chromaDBConfig.database}/collections/${collectionInfo.id}/query`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query_embeddings: [queryEmbedding],
          n_results: 1,
          include: ['documents', 'metadatas', 'distances']
        })
      }
    );
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.log(`❌ Search failed: ${searchResponse.status}`);
      console.log(`   Error: ${errorText}`);
      return false;
    }
    
    const searchResults = await searchResponse.json();
    
    if (searchResults.documents && searchResults.documents[0] && searchResults.documents[0].length > 0) {
      const result = searchResults.documents[0][0];
      const metadata = searchResults.metadatas[0][0];
      const distance = searchResults.distances[0][0];
      const similarity = (1 - distance).toFixed(3);
      
      console.log(`✅ Search successful! Found result with ${similarity} similarity`);
      console.log(`   Question: ${metadata.question?.substring(0, 100) || 'No question'}...`);
      console.log(`   Category: ${metadata.category || 'Unknown'}`);
      
      console.log('\n🎉 RAG CONNECTION IS WORKING!');
      console.log('   The issue is likely in the frontend implementation or environment variables.');
      return true;
    } else {
      console.log('❌ No search results found');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Connection test failed: ${error.message}`);
    return false;
  }
}

// Run the test
testRAGConnection().then(success => {
  if (success) {
    console.log('\n✅ ChromaDB connection is working properly!');
    console.log('   Check your frontend RAG service implementation.');
  } else {
    console.log('\n❌ ChromaDB connection issues detected.');
    console.log('   Fix the configuration and try again.');
  }
}).catch(console.error);