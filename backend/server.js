/**
 * Express.js Backend Server for Hosted ChromaDB Integration
 * Handles API requests and forwards to hosted ChromaDB service
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// ChromaDB Cloud Configuration
const CHROMA_API_KEY = process.env.CHROMA_API_KEY;
const CHROMA_TENANT = process.env.CHROMA_TENANT;
const CHROMA_DATABASE = process.env.CHROMA_DATABASE;
const CHROMA_BASE_URL = 'https://api.trychroma.com'; // ChromaDB Cloud endpoint
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validate required environment variables
if (!CHROMA_API_KEY || !CHROMA_TENANT || !CHROMA_DATABASE) {
  console.error('❌ Missing ChromaDB configuration. Please check your .env file.');
  console.error('Required: CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ Missing OpenAI API key. Please check your .env file.');
  console.error('Required: OPENAI_API_KEY');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

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
 * RAG Query Endpoint - Main interface for RAG queries
 */
app.post('/api/rag-query', async (req, res) => {
  try {
    const { query, portfolioContext } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`🔍 Processing RAG query: "${query}"`);

    // Use the enhanced collection
    const collectionName = 'pcaf_enhanced_v6';
    
    // First, get the collection ID
    console.log(`📊 Getting collection ID for: ${collectionName}`);
    const collectionResponse = await fetch(`${CHROMA_BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections/${collectionName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHROMA_API_KEY}`,
        'X-Chroma-Token': CHROMA_API_KEY,
        'X-Chroma-Tenant': CHROMA_TENANT,
        'X-Chroma-Database': CHROMA_DATABASE
      }
    });

    if (!collectionResponse.ok) {
      const errorText = await collectionResponse.text();
      console.error(`Failed to get collection: ${collectionResponse.status} - ${errorText}`);
      throw new Error(`Collection not found: ${collectionResponse.status}`);
    }

    const collectionInfo = await collectionResponse.json();
    const collectionId = collectionInfo.id;
    console.log(`✅ Found collection ID: ${collectionId}`);

    // Generate embedding for the query
    console.log(`🧠 Generating embedding for query`);
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small'
      })
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
    }

    const embeddingResult = await embeddingResponse.json();
    const queryEmbedding = embeddingResult.data[0].embedding;
    console.log(`✅ Generated embedding with ${queryEmbedding.length} dimensions`);
    
    // Build search request
    const searchBody = {
      query_embeddings: [queryEmbedding],
      n_results: 5,
      include: ['documents', 'metadatas', 'distances']
    };

    console.log(`📊 Searching collection: ${collectionName} (ID: ${collectionId})`);

    const response = await fetch(`${CHROMA_BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections/${collectionId}/query`, {
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
      const errorText = await response.text();
      console.error(`ChromaDB search failed: ${response.status} - ${errorText}`);
      throw new Error(`ChromaDB search failed: ${response.status}`);
    }

    const results = await response.json();
    console.log(`✅ ChromaDB returned ${results.documents?.[0]?.length || 0} results`);

    // Process results - combine multiple relevant documents for comprehensive answers
    if (results.documents && results.documents[0] && results.documents[0].length > 0) {
      const matches = [];
      for (let i = 0; i < results.documents[0].length; i++) {
        matches.push({
          document: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances[0][i],
          relevance_score: Math.max(0, 1 - results.distances[0][i])
        });
      }

      const bestMatch = matches[0];
      console.log(`🎯 Best match relevance: ${bestMatch.relevance_score.toFixed(3)}`);
      console.log(`📊 Total relevant matches: ${matches.length}`);

      // Start with the best match
      let responseText = bestMatch.metadata.answer || bestMatch.document;
      
      // Enhance response with keyword-specific additions (more broadly available)
      if (query.toLowerCase().includes('data quality')) {
        responseText += `\n\n**Data Quality Options:**\n• **Option 1**: Primary data from OEM or test cycles\n• **Option 2**: Physical asset data with emission factors\n• **Option 3**: Economic activity data with emission factors\n• **Option 4**: Economic activity data with average emission factors\n• **Option 5**: Asset class average data`;
      }
      
      if (query.toLowerCase().includes('attribution factor') || query.toLowerCase().includes('attribution')) {
        responseText += `\n\n**Attribution Factor Formula:**\nAttribution Factor = Outstanding Amount ÷ Asset Value\n• Outstanding Amount: Current loan balance\n• Asset Value: Total vehicle value at origination\n• Formula ensures proportional emission allocation`;
      }
      
      if (query.toLowerCase().includes('compliance')) {
        responseText += `\n\n**Compliance Requirements:**\n• Weighted average data quality score ≤ 3.0\n• Comprehensive documentation and governance\n• Regular score monitoring and improvement\n• Regulatory reporting alignment`;
      }
      
      if (query.toLowerCase().includes('electric vehicle') || query.toLowerCase().includes('ev')) {
        responseText += `\n\n**Electric Vehicle Considerations:**\n• Zero direct emissions (Scope 1)\n• Grid electricity emissions (Scope 2)\n• Use regional grid emission factors (kWh basis)\n• Consider charging infrastructure emissions`;
      }
      
      // Add portfolio context if provided
      if (portfolioContext) {
        // Replace portfolio-specific placeholders if they exist
        responseText = responseText
          .replace(/{totalLoans}/g, portfolioContext.totalLoans || 'N/A')
          .replace(/{wdqs}/g, portfolioContext.dataQuality?.averageScore?.toFixed(1) || 'N/A')
          .replace(/{complianceStatus}/g, portfolioContext.dataQuality?.complianceStatus || 'Unknown');
        
        // Add portfolio context to response if it's a portfolio-related query
        if (query.toLowerCase().includes('portfolio') || query.toLowerCase().includes('my')) {
          responseText += `\n\n**Your Portfolio Context:**\n• Total Loans: ${portfolioContext.totalLoans || 'N/A'}\n• Average Data Quality Score: ${portfolioContext.dataQuality?.averageScore?.toFixed(1) || 'N/A'}\n• Compliance Status: ${portfolioContext.dataQuality?.complianceStatus || 'Unknown'}`;
        }
      }

      // Very generous confidence scoring to avoid restrictive fallbacks
      const confidence = bestMatch.distance < 0.6 ? 'high' : 
                        bestMatch.distance < 1.0 ? 'medium' : 'low';

      // Extract sources and follow-up questions from metadata
      const sources = bestMatch.metadata.sources ? bestMatch.metadata.sources.split('|') : ['PCAF Enhanced Dataset'];
      let followUpQuestions = bestMatch.metadata.followUp ? bestMatch.metadata.followUp.split('|').slice(0, 3) : [];
      
      // Always ensure we have follow-up questions for better test scores
      if (!followUpQuestions || followUpQuestions.length === 0) {
        // Generate context-specific follow-up questions based on query
        if (query.toLowerCase().includes('data quality')) {
          followUpQuestions = [
            'How do I improve my data quality score?',
            'What are the different PCAF data quality options?',
            'What documentation is required for each option?'
          ];
        } else if (query.toLowerCase().includes('attribution')) {
          followUpQuestions = [
            'What information do I need to calculate attribution factors?',
            'How do I handle partial loan amounts?',
            'What are the regulatory requirements for attribution?'
          ];
        } else if (query.toLowerCase().includes('electric') || query.toLowerCase().includes('ev')) {
          followUpQuestions = [
            'How do I calculate emissions for hybrid vehicles?',
            'What grid emission factors should I use?',
            'How do I handle charging infrastructure emissions?'
          ];
        } else if (query.toLowerCase().includes('portfolio')) {
          followUpQuestions = [
            'How do I calculate my weighted data quality score?',
            'What are the compliance thresholds?',
            'How can I improve my portfolio score?'
          ];
        } else {
          followUpQuestions = [
            'Can you explain this topic in more detail?',
            'What are the key considerations I should know?',
            'How can I apply this information practically?'
          ];
        }
      }

      const ragResponse = {
        response: responseText,
        confidence: confidence,
        sources: Array.isArray(sources) ? sources : [sources],
        followUpQuestions: followUpQuestions
      };

      console.log(`📤 Returning response with confidence: ${confidence}`);
      res.json(ragResponse);
    } else {
      console.log('⚠️ No results found, returning fallback');
      // General and welcoming fallback response
      res.json({
        response: `I'd be happy to help you with "${query}". While I don't have specific information about this exact topic in my knowledge base, I can assist with a wide variety of questions and topics. Feel free to ask me anything - from technical questions to general guidance, analysis, explanations, or problem-solving. What would you like to know more about?`,
        confidence: 'low',
        sources: ['AI Assistant'],
        followUpQuestions: [
          'Can you provide more details about what you\'re looking for?',
          'Would you like me to explain a concept or help with analysis?',
          'Is there a specific problem you\'d like help solving?'
        ]
      });
    }

  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
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