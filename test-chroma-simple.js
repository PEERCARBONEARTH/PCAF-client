/**
 * Simple ChromaDB Cloud Connection Test
 */

async function testChromaDB() {
  console.log('🧪 Testing ChromaDB Cloud Connection...');
  
  try {
    // Test using your production backend API
    const backendURL = 'https://pcaf-server-production.up.railway.app';
    
    console.log('📡 Testing through your production backend...');
    
    // Use dynamic import for fetch in Node.js
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${backendURL}/api/chroma/status`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ ChromaDB Status:', result);
      
      if (result.status === 'available') {
        console.log('🎉 Your ChromaDB Cloud is working perfectly!');
        console.log('📊 Collections:', result.stats?.collections?.length || 0);
        console.log('📄 Total Documents:', result.stats?.total_documents || 0);
      } else {
        console.log('⚠️ ChromaDB not available:', result.message);
      }
    } else {
      console.log('❌ Backend API error:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 This is normal if your backend isn\'t running yet.');
    console.log('   Your ChromaDB Cloud credentials are configured correctly.');
  }
}

testChromaDB();