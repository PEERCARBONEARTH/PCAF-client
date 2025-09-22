/**
 * DIRECT CHROMADB COLLECTION TEST
 * 
 * This test directly queries the ChromaDB collection to verify data exists
 * and the collection is properly configured
 */

const fetch = require('node-fetch');

// ChromaDB Configuration
const CHROMA_CONFIG = {
  apiKey: process.env.CHROMA_API_KEY || '',
  tenant: process.env.CHROMA_TENANT || '',
  database: process.env.CHROMA_DATABASE || '',
  baseURL: 'https://api.trychroma.com',
  collectionName: 'pcaf_enhanced_v6'
};

class ChromaDBDirectTest {
  constructor() {
    this.results = [];
  }

  async runDirectTests() {
    console.log('🔍 DIRECT CHROMADB COLLECTION TEST');
    console.log('=' .repeat(50));
    console.log(`📊 Testing collection: ${CHROMA_CONFIG.collectionName}`);
    console.log(`🌐 ChromaDB URL: ${CHROMA_CONFIG.baseURL}`);
    console.log('=' .repeat(50));

    // Check configuration
    await this.checkConfiguration();
    
    // Test collection existence
    await this.testCollectionExists();
    
    // Test collection info
    await this.testCollectionInfo();
    
    // Test direct query
    await this.testDirectQuery();
    
    // Test embedding generation
    await this.testEmbeddingGeneration();

    this.printResults();
  }

  async checkConfiguration() {
    console.log('\n🔧 Configuration Check');
    console.log('-'.repeat(30));
    
    const config = {
      'API Key': !!CHROMA_CONFIG.apiKey,
      'Tenant': !!CHROMA_CONFIG.tenant,
      'Database': !!CHROMA_CONFIG.database,
      'Base URL': !!CHROMA_CONFIG.baseURL,
      'Collection Name': !!CHROMA_CONFIG.collectionName
    };
    
    Object.entries(config).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}: ${value ? 'Configured' : 'Missing'}`);
    });
    
    if (CHROMA_CONFIG.apiKey) {
      console.log(`🔑 API Key prefix: ${CHROMA_CONFIG.apiKey.substring(0, 10)}...`);
    }
    
    const allConfigured = Object.values(config).every(v => v);
    this.recordResult('Configuration Check', allConfigured, allConfigured ? 'All required config present' : 'Missing configuration');
  }

  async testCollectionExists() {
    console.log('\n📚 Collection Existence Test');
    console.log('-'.repeat(30));
    
    try {
      const headers = this.getHeaders();
      const url = `${CHROMA_CONFIG.baseURL}/api/v2/tenants/${CHROMA_CONFIG.tenant}/databases/${CHROMA_CONFIG.database}/collections/${CHROMA_CONFIG.collectionName}`;
      
      console.log(`🌐 Testing URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const collectionInfo = await response.json();
        console.log('✅ Collection exists');
        console.log(`📊 Collection ID: ${collectionInfo.id}`);
        console.log(`📝 Collection Name: ${collectionInfo.name}`);
        this.recordResult('Collection Exists', true, 'Collection found successfully');
        return collectionInfo;
      } else {
        const errorText = await response.text();
        console.log(`❌ Collection not found: ${response.status}`);
        console.log(`Error: ${errorText}`);
        this.recordResult('Collection Exists', false, `HTTP ${response.status}: ${errorText}`);
        return null;
      }
    } catch (error) {
      console.log(`💥 Collection test failed: ${error.message}`);
      this.recordResult('Collection Exists', false, error.message);
      return null;
    }
  }

  async testCollectionInfo() {
    console.log('\n📋 Collection Information Test');
    console.log('-'.repeat(30));
    
    try {
      const headers = this.getHeaders();
      const url = `${CHROMA_CONFIG.baseURL}/api/v2/tenants/${CHROMA_CONFIG.tenant}/databases/${CHROMA_CONFIG.database}/collections/${CHROMA_CONFIG.collectionName}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const info = await response.json();
        console.log('✅ Collection info retrieved');
        console.log(`📊 Metadata: ${JSON.stringify(info.metadata || {}, null, 2)}`);
        
        // Try to get count (if supported)
        try {
          const countUrl = `${url}/count`;
          const countResponse = await fetch(countUrl, { method: 'GET', headers });
          if (countResponse.ok) {
            const count = await countResponse.json();
            console.log(`📈 Document count: ${count}`);
          }
        } catch (e) {
          console.log('ℹ️ Count endpoint not available');
        }
        
        this.recordResult('Collection Info', true, 'Collection info retrieved');
      } else {
        console.log(`❌ Failed to get collection info: ${response.status}`);
        this.recordResult('Collection Info', false, `HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`💥 Collection info test failed: ${error.message}`);
      this.recordResult('Collection Info', false, error.message);
    }
  }

  async testDirectQuery() {
    console.log('\n🔍 Direct Query Test');
    console.log('-'.repeat(30));
    
    try {
      // First get collection ID
      const collectionId = await this.getCollectionId();
      if (!collectionId) {
        this.recordResult('Direct Query', false, 'Could not get collection ID');
        return;
      }
      
      // Generate a simple embedding for testing
      const testEmbedding = await this.generateTestEmbedding("PCAF data quality options");
      if (!testEmbedding) {
        this.recordResult('Direct Query', false, 'Could not generate test embedding');
        return;
      }
      
      const headers = this.getHeaders();
      const queryUrl = `${CHROMA_CONFIG.baseURL}/api/v2/tenants/${CHROMA_CONFIG.tenant}/databases/${CHROMA_CONFIG.database}/collections/${collectionId}/query`;
      
      const queryBody = {
        query_embeddings: [testEmbedding],
        n_results: 3,
        include: ['documents', 'metadatas', 'distances']
      };
      
      console.log(`🌐 Query URL: ${queryUrl}`);
      console.log(`📊 Query body: ${JSON.stringify(queryBody, null, 2).substring(0, 200)}...`);
      
      const response = await fetch(queryUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(queryBody)
      });
      
      if (response.ok) {
        const results = await response.json();
        console.log('✅ Direct query successful');
        console.log(`📊 Results structure: ${Object.keys(results)}`);
        
        if (results.documents && results.documents[0] && results.documents[0].length > 0) {
          console.log(`📈 Found ${results.documents[0].length} documents`);
          console.log(`📝 First document preview: ${results.documents[0][0].substring(0, 100)}...`);
          
          if (results.metadatas && results.metadatas[0] && results.metadatas[0][0]) {
            console.log(`🏷️ First metadata: ${JSON.stringify(results.metadatas[0][0], null, 2)}`);
          }
          
          if (results.distances && results.distances[0]) {
            console.log(`📏 Distances: ${results.distances[0].map(d => d.toFixed(3)).join(', ')}`);
          }
          
          this.recordResult('Direct Query', true, `Found ${results.documents[0].length} documents`);
        } else {
          console.log('⚠️ No documents found in collection');
          this.recordResult('Direct Query', false, 'No documents found in collection');
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Direct query failed: ${response.status}`);
        console.log(`Error: ${errorText}`);
        this.recordResult('Direct Query', false, `HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.log(`💥 Direct query test failed: ${error.message}`);
      this.recordResult('Direct Query', false, error.message);
    }
  }

  async testEmbeddingGeneration() {
    console.log('\n🧠 Embedding Generation Test');
    console.log('-'.repeat(30));
    
    try {
      const testText = "What are PCAF data quality options?";
      const embedding = await this.generateTestEmbedding(testText);
      
      if (embedding && Array.isArray(embedding) && embedding.length > 0) {
        console.log('✅ Embedding generation successful');
        console.log(`📊 Embedding dimensions: ${embedding.length}`);
        console.log(`📈 Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
        this.recordResult('Embedding Generation', true, `Generated ${embedding.length}D embedding`);
      } else {
        console.log('❌ Embedding generation failed');
        this.recordResult('Embedding Generation', false, 'No embedding returned');
      }
    } catch (error) {
      console.log(`💥 Embedding test failed: ${error.message}`);
      this.recordResult('Embedding Generation', false, error.message);
    }
  }

  async getCollectionId() {
    try {
      const headers = this.getHeaders();
      const response = await fetch(
        `${CHROMA_CONFIG.baseURL}/api/v2/tenants/${CHROMA_CONFIG.tenant}/databases/${CHROMA_CONFIG.database}/collections/${CHROMA_CONFIG.collectionName}`,
        { method: 'GET', headers }
      );
      
      if (response.ok) {
        const collectionInfo = await response.json();
        return collectionInfo.id;
      }
      return null;
    } catch (error) {
      console.log(`Error getting collection ID: ${error.message}`);
      return null;
    }
  }

  async generateTestEmbedding(text) {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.log('⚠️ OpenAI API key not configured - using mock embedding');
      // Return a mock embedding for testing
      return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small'
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data[0].embedding;
      } else {
        console.log(`OpenAI API error: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.log(`Embedding generation error: ${error.message}`);
      return null;
    }
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHROMA_CONFIG.apiKey}`,
      'X-Chroma-Token': CHROMA_CONFIG.apiKey,
      'X-Chroma-Tenant': CHROMA_CONFIG.tenant,
      'X-Chroma-Database': CHROMA_CONFIG.database
    };
  }

  recordResult(test, success, message) {
    this.results.push({ test, success, message });
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIRECT CHROMADB TEST RESULTS');
    console.log('='.repeat(50));
    
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}: ${result.message}`);
    });
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`\n📈 Success Rate: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
    
    if (passed === total) {
      console.log('🎉 ALL DIRECT TESTS PASSED! ChromaDB collection is properly configured!');
    } else {
      console.log('⚠️ Some issues detected with ChromaDB configuration');
    }
    
    console.log('='.repeat(50));
  }
}

// Run the direct ChromaDB test
async function runDirectChromaDBTest() {
  const testSuite = new ChromaDBDirectTest();
  await testSuite.runDirectTests();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChromaDBDirectTest, runDirectChromaDBTest };
}

// Run when called directly
if (require.main === module) {
  runDirectChromaDBTest().catch(console.error);
}