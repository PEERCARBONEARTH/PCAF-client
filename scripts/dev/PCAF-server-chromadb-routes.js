/**
 * ChromaDB API Routes for PCAF-Server
 * Add these routes to your PCAF-server/src/routes/ directory
 */

const express = require('express');
const ChromaDBService = require('../services/chromaDBService'); // Adjust path as needed

const router = express.Router();
const chromaDB = new ChromaDBService();

/**
 * @route GET /api/chroma/status
 * @desc Check ChromaDB Cloud status
 * @access Public
 */
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Checking ChromaDB Cloud status...');
    const status = await chromaDB.checkStatus();
    
    console.log('✅ ChromaDB status:', status.status);
    res.json(status);
  } catch (error) {
    console.error('❌ ChromaDB status check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      message: 'Failed to check ChromaDB status'
    });
  }
});

/**
 * @route POST /api/chroma/embed
 * @desc Embed Q&A data into ChromaDB Cloud
 * @access Public
 */
router.post('/embed', async (req, res) => {
  try {
    const { qaPairs, filename, metadata, collectionName = 'pcaf_motor_vehicle_qa' } = req.body;

    console.log(`📊 Embedding ${qaPairs?.length || 0} Q&A pairs from ${filename}...`);

    if (!qaPairs || !Array.isArray(qaPairs)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid qaPairs data',
        message: 'qaPairs must be an array'
      });
    }

    // Create or get collection
    await chromaDB.createCollection(collectionName, {
      filename: filename,
      uploadedAt: new Date().toISOString(),
      totalQuestions: qaPairs.length,
      ...metadata
    });

    // Process Q&A pairs for embedding
    const { documents, metadatas, ids } = chromaDB.processQAPairs(qaPairs, filename);

    // Add documents to collection
    await chromaDB.addDocuments(collectionName, documents, metadatas, ids);

    console.log(`✅ Successfully embedded ${qaPairs.length} questions into ChromaDB Cloud`);

    res.json({
      success: true,
      message: `Successfully embedded ${qaPairs.length} questions from ${filename}`,
      questionsEmbedded: qaPairs.length,
      filename: filename,
      embeddedAt: new Date().toISOString(),
      collectionId: collectionName
    });

  } catch (error) {
    console.error('❌ ChromaDB embedding failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to embed Q&A data into ChromaDB Cloud'
    });
  }
});

/**
 * @route GET /api/chroma/collections
 * @desc Get all ChromaDB collections
 * @access Public
 */
router.get('/collections', async (req, res) => {
  try {
    console.log('📁 Fetching ChromaDB collections...');
    const collections = await chromaDB.getCollections();
    
    console.log(`✅ Found ${collections.length} collections`);
    res.json(collections);

  } catch (error) {
    console.error('❌ Failed to get collections:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to get collections from ChromaDB Cloud'
    });
  }
});

/**
 * @route DELETE /api/chroma/collections/:collectionName
 * @desc Delete a ChromaDB collection
 * @access Public
 */
router.delete('/collections/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    
    console.log(`🗑️ Deleting collection: ${collectionName}...`);
    const result = await chromaDB.deleteCollection(collectionName);
    
    console.log(`✅ Collection ${collectionName} deleted successfully`);
    res.json(result);

  } catch (error) {
    console.error('❌ Failed to delete collection:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete collection from ChromaDB Cloud'
    });
  }
});

/**
 * @route GET /api/chroma/search
 * @desc Search ChromaDB collections
 * @access Public
 */
router.get('/search', async (req, res) => {
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

    console.log(`🔍 Searching ChromaDB: "${query}" in collection ${collection_name}...`);

    // Build where clause for filtering
    let where = {};
    if (category_filter) {
      where.category = category_filter;
    }

    const results = await chromaDB.searchCollection(
      collection_name, 
      query, 
      parseInt(n_results), 
      where
    );

    console.log(`✅ Found ${results.length} search results`);
    res.json(results);

  } catch (error) {
    console.error('❌ ChromaDB search failed:', error);
    res.status(500).json({
      error: error.message,
      message: 'Search request failed'
    });
  }
});

/**
 * @route POST /api/chroma/search
 * @desc Advanced search with POST body
 * @access Public
 */
router.post('/search', async (req, res) => {
  try {
    const { 
      query, 
      n_results = 5, 
      collection_name = 'pcaf_motor_vehicle_qa',
      where = {},
      include_metadata = true 
    } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }

    console.log(`🔍 Advanced search: "${query}" with filters:`, where);

    const results = await chromaDB.searchCollection(
      collection_name, 
      query, 
      n_results, 
      where
    );

    console.log(`✅ Advanced search found ${results.length} results`);
    res.json({
      query,
      results,
      total_results: results.length,
      collection_name
    });

  } catch (error) {
    console.error('❌ Advanced search failed:', error);
    res.status(500).json({
      error: error.message,
      message: 'Advanced search request failed'
    });
  }
});

module.exports = router;