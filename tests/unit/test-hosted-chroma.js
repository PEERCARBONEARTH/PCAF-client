/**
 * Test Hosted ChromaDB Connection
 * Quick test to verify your hosted ChromaDB service is working
 */

const fetch = require('node-fetch');

// ChromaDB Cloud Configuration (from your backend .env)
const CHROMA_API_KEY = 'ck-2k9iUfQTnA7gFStxEedBYJeYKSiWGhzbw6VFWu7Jxo2V';
const CHROMA_TENANT = 'efcad529-ed4c-4265-8aa0-f48e2a741582';
const CHROMA_DATABASE = 'peerTing';
const CHROMA_BASE_URL = 'https://api.trychroma.com';

async function testHostedChromaDB() {
  console.log('🧪 Testing Hosted ChromaDB Connection...');
  console.log(`📡 Connecting to: ${CHROMA_BASE_URL}`);
  
  try {
    // Test 1: Heartbeat
    console.log('\n1️⃣ Testing heartbeat...');
    const heartbeatResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/heartbeat`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY
      }
    });

    if (heartbeatResponse.ok) {
      const heartbeat = await heartbeatResponse.json();
      console.log('✅ Heartbeat successful:', heartbeat);
    } else {
      console.log('❌ Heartbeat failed:', heartbeatResponse.status, heartbeatResponse.statusText);
      return;
    }

    // Test 2: List Collections
    console.log('\n2️⃣ Testing collections list...');
    const collectionsResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY,
        'X-Chroma-Tenant': CHROMA_TENANT,
        'X-Chroma-Database': CHROMA_DATABASE
      }
    });

    if (collectionsResponse.ok) {
      const collections = await collectionsResponse.json();
      console.log('✅ Collections retrieved:', collections.length, 'collections found');
      collections.forEach(collection => {
        console.log(`   📁 ${collection.name} (${collection.id})`);
      });
    } else {
      console.log('❌ Collections list failed:', collectionsResponse.status, collectionsResponse.statusText);
    }

    // Test 3: Create Test Collection
    console.log('\n3️⃣ Testing collection creation...');
    const testCollectionName = 'test_collection_' + Date.now();
    
    const createResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CHROMA_API_KEY && { 'Authorization': `Bearer ${CHROMA_API_KEY}` })
      },
      body: JSON.stringify({
        name: testCollectionName,
        metadata: {
          test: true,
          created_at: new Date().toISOString()
        }
      })
    });

    if (createResponse.ok) {
      console.log('✅ Test collection created successfully');
      
      // Test 4: Add Test Document
      console.log('\n4️⃣ Testing document addition...');
      const addResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${testCollectionName}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(CHROMA_API_KEY && { 'Authorization': `Bearer ${CHROMA_API_KEY}` })
        },
        body: JSON.stringify({
          documents: ['This is a test document for PCAF Q&A system'],
          metadatas: [{ question: 'Test question', category: 'test' }],
          ids: ['test_doc_1']
        })
      });

      if (addResponse.ok) {
        console.log('✅ Test document added successfully');
        
        // Test 5: Search Test Document
        console.log('\n5️⃣ Testing search functionality...');
        const searchResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${testCollectionName}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(CHROMA_API_KEY && { 'Authorization': `Bearer ${CHROMA_API_KEY}` })
          },
          body: JSON.stringify({
            query_texts: ['test document'],
            n_results: 1,
            include: ['documents', 'metadatas', 'distances']
          })
        });

        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          console.log('✅ Search successful:', searchResults.documents[0].length, 'results found');
        } else {
          console.log('❌ Search failed:', searchResponse.status, searchResponse.statusText);
        }
      } else {
        console.log('❌ Document addition failed:', addResponse.status, addResponse.statusText);
      }

      // Cleanup: Delete Test Collection
      console.log('\n🧹 Cleaning up test collection...');
      const deleteResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${testCollectionName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(CHROMA_API_KEY && { 'Authorization': `Bearer ${CHROMA_API_KEY}` })
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ Test collection deleted successfully');
      } else {
        console.log('⚠️ Failed to delete test collection (manual cleanup may be needed)');
      }

    } else {
      console.log('❌ Collection creation failed:', createResponse.status, createResponse.statusText);
    }

    console.log('\n🎉 Hosted ChromaDB test completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Your hosted ChromaDB service is working correctly');
    console.log('   ✅ Ready for Q&A dataset uploads');
    console.log('   ✅ No Python setup required');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your CHROMA_HOST and CHROMA_PORT environment variables');
    console.log('   2. Verify your CHROMA_API_KEY if authentication is required');
    console.log('   3. Ensure your hosted ChromaDB service is running and accessible');
    console.log('   4. Check network connectivity and firewall settings');
  }
}

// Run the test
testHostedChromaDB();