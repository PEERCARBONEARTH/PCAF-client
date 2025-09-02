/**
 * Express.js Backend Server for Hosted ChromaDB Integration
 * Handles API requests and forwards to hosted ChromaDB service
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// ChromaDB Cloud Configuration
const CHROMA_API_KEY = process.env.CHROMA_API_KEY;
const CHROMA_TENANT = process.env.CHROMA_TENANT;
const CHROMA_DATABASE = process.env.CHROMA_DATABASE;
const CHROMA_BASE_URL = 'https://api.trychroma.com'; // ChromaDB Cloud endpoint

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * Check hosted ChromaDB status
 */
app.get('/api/chroma/status', async (req, res) => {
  try {
    const response = await fetch(`${CHROMA_BASE_URL}/api/v1/heartbeat`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY
      }
    });

    if (response.ok) {
      // Get collections info
      const collectionsResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHROMA_API_KEY}`,
          'X-Chroma-Token': CHROMA_API_KEY,
          'X-Chroma-Tenant': CHROMA_TENANT,
          'X-Chroma-Database': CHROMA_DATABASE
        }
      });

      let stats = {
        total_documents: 0,
        categories: [],
        collections: []
      };

      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        stats.collections = collections.map(c => c.name);
        stats.total_documents = collections.reduce((sum, c) => sum + (c.count || 0), 0);
      }

      res.json({
        status: 'available',
        stats: stats,
        message: 'Hosted ChromaDB is available and ready'
      });
    } else {
      res.status(503).json({
        status: 'unavailable',
        error: `HTTP ${response.status}`,
        message: 'Hosted ChromaDB is not responding'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unavailable',
      error: error.message,
      message: 'Failed to connect to hosted ChromaDB'
    });
  }
});

/**
 * Embed Q&A data into hosted ChromaDB
 */
app.post('/api/chroma/embed', async (req, res) => {
  try {
    const { qaPairs, filename, metadata, collectionName = 'pcaf_motor_vehicle_qa' } = req.body;

    if (!qaPairs || !Array.isArray(qaPairs)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid qaPairs data',
        message: 'qaPairs must be an array'
      });
    }

    // Create or get collection
    const collectionResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY,
        'X-Chroma-Tenant': CHROMA_TENANT,
        'X-Chroma-Database': CHROMA_DATABASE
      },
      body: JSON.stringify({
        name: collectionName,
        metadata: {
          filename: filename,
          uploadedAt: new Date().toISOString(),
          totalQuestions: qaPairs.length,
          ...metadata
        }
      })
    });

    // Collection might already exist, that's OK
    if (!collectionResponse.ok && collectionResponse.status !== 409) {
      throw new Error(`Failed to create collection: ${collectionResponse.statusText}`);
    }

    // Prepare documents for embedding
    const documents = [];
    const metadatas = [];
    const ids = [];

    qaPairs.forEach((qa, index) => {
      // Create searchable document text
      const documentText = `
Question: ${qa.question}

Answer: ${qa.answer}

Category: ${qa.categoryDescription || qa.categoryKey || 'general'}

Sources: ${qa.sources ? qa.sources.join(', ') : 'N/A'}

Follow-up Questions: ${qa.followUp ? qa.followUp.join(', ') : 'N/A'}
      `.trim();

      documents.push(documentText);
      
      metadatas.push({
        question_id: qa.id || `qa_${index}`,
        question: qa.question.substring(0, 500), // Truncate for metadata
        answer: qa.answer.substring(0, 1000),
        confidence: qa.confidence || 'medium',
        category: qa.categoryKey || 'general',
        category_description: qa.categoryDescription || qa.categoryKey || 'general',
        sources: qa.sources ? qa.sources.join('|') : '',
        followUp: qa.followUp ? qa.followUp.join('|') : '',
        filename: filename,
        // Banking context flags
        has_risk_management: qa.bankingContext?.riskManagement || false,
        has_regulatory_compliance: qa.bankingContext?.regulatoryCompliance || false,
        has_credit_risk: qa.bankingContext?.creditRisk || false,
        has_capital_allocation: qa.bankingContext?.capitalAllocation || false,
        has_loan_origination: qa.bankingContext?.loanOrigination || false,
        has_strategic_planning: qa.bankingContext?.strategicPlanning || false
      });
      
      ids.push(qa.id || `${filename}_qa_${index}`);
    });

    // Add documents to collection
    const addResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${collectionName}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY,
        'X-Chroma-Tenant': CHROMA_TENANT,
        'X-Chroma-Database': CHROMA_DATABASE
      },
      body: JSON.stringify({
        documents: documents,
        metadatas: metadatas,
        ids: ids
      })
    });

    if (!addResponse.ok) {
      const errorText = await addResponse.text();
      throw new Error(`Failed to add documents: ${errorText}`);
    }

    res.json({
      success: true,
      message: `Successfully embedded ${qaPairs.length} questions from ${filename}`,
      questionsEmbedded: qaPairs.length,
      filename: filename,
      embeddedAt: new Date().toISOString(),
      collectionId: collectionName
    });

  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to embed Q&A data into hosted ChromaDB'
    });
  }
});

/**
 * Get embedded collections from hosted ChromaDB
 */
app.get('/api/chroma/collections', async (req, res) => {
  try {
    const response = await fetch(`${CHROMA_BASE_URL}/api/v1/collections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY,
        'X-Chroma-Tenant': CHROMA_TENANT,
        'X-Chroma-Database': CHROMA_DATABASE
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get collections: ${response.statusText}`);
    }

    const collections = await response.json();
    
    // Get detailed info for each collection
    const detailedCollections = await Promise.all(
      collections.map(async (collection) => {
        try {
          const detailResponse = await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${collection.name}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${CHROMA_API_KEY}`,
              'X-Chroma-Token': CHROMA_API_KEY,
              'X-Chroma-Tenant': CHROMA_TENANT,
              'X-Chroma-Database': CHROMA_DATABASE
            }
          });
          
          if (detailResponse.ok) {
            const details = await detailResponse.json();
            return {
              id: collection.id,
              name: collection.name,
              count: details.count || 0,
              metadata: collection.metadata || {}
            };
          }
          return collection;
        } catch (error) {
          return collection;
        }
      })
    );

    res.json(detailedCollections);

  } catch (error) {
    console.error('Failed to get collections:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to get collections from hosted ChromaDB'
    });
  }
});

/**
 * Delete collection from hosted ChromaDB
 */
app.delete('/api/chroma/collections/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;

    const response = await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${collectionName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY,
        'X-Chroma-Tenant': CHROMA_TENANT,
        'X-Chroma-Database': CHROMA_DATABASE
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete collection: ${response.statusText}`);
    }

    res.json({
      success: true,
      message: `Collection ${collectionName} deleted successfully`
    });

  } catch (error) {
    console.error('Failed to delete collection:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete collection from hosted ChromaDB'
    });
  }
});

/**
 * Search hosted ChromaDB
 */
app.get('/api/chroma/search', async (req, res) => {
  try {
    const { 
      query, 
      n_results = 5, 
      collection_name = 'pcaf_motor_vehicle_qa',
      category_filter 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    // Build where clause for filtering
    let where = {};
    if (category_filter) {
      where.category = category_filter;
    }

    const searchBody = {
      query_texts: [query],
      n_results: parseInt(n_results),
      include: ['documents', 'metadatas', 'distances'],
      ...(Object.keys(where).length > 0 && { where })
    };

    const response = await fetch(`${CHROMA_BASE_URL}/api/v1/collections/${collection_name}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY,
        'X-Chroma-Tenant': CHROMA_TENANT,
        'X-Chroma-Database': CHROMA_DATABASE
      },
      body: JSON.stringify(searchBody)
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const results = await response.json();
    
    // Transform results to expected format
    const formattedResults = [];
    
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        const document = results.documents[0][i];
        const metadata = results.metadatas[0][i];
        const distance = results.distances[0][i];
        
        formattedResults.push({
          id: metadata.question_id || `result_${i}`,
          document: document,
          metadata: metadata,
          distance: distance,
          relevance_score: Math.max(0, 1 - distance)
        });
      }
    }

    res.json(formattedResults);

  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({
      error: error.message,
      message: 'Search request failed'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ChromaDB API Server'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ChromaDB API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 ChromaDB status: http://localhost:${PORT}/api/chroma/status`);
});

module.exports = app;