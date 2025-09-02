/**
 * ChromaDB Cloud Service for PCAF-Server
 * Add this to your PCAF-server/src/services/ directory
 */

const fetch = require('node-fetch');

class ChromaDBService {
  constructor() {
    // Use your existing environment variables
    this.apiKey = process.env.CHROMA_API_KEY;
    this.tenant = process.env.CHROMA_TENANT;
    this.database = process.env.CHROMA_DATABASE;
    this.baseURL = 'https://api.trychroma.com';
    
    if (!this.apiKey || !this.tenant || !this.database) {
      console.warn('ChromaDB configuration incomplete. Check environment variables.');
    }
  }

  /**
   * Get common headers for ChromaDB Cloud requests
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Chroma-Token': this.apiKey,
      'X-Chroma-Tenant': this.tenant,
      'X-Chroma-Database': this.database
    };
  }

  /**
   * Check ChromaDB Cloud status
   */
  async checkStatus() {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/heartbeat`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (response.ok) {
        // Get collections info
        const collectionsResponse = await fetch(`${this.baseURL}/api/v1/collections`, {
          headers: this.getHeaders()
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

        return {
          status: 'available',
          stats: stats,
          message: 'ChromaDB Cloud is available and ready'
        };
      } else {
        return {
          status: 'unavailable',
          error: `HTTP ${response.status}`,
          message: 'ChromaDB Cloud is not responding'
        };
      }
    } catch (error) {
      return {
        status: 'unavailable',
        error: error.message,
        message: 'Failed to connect to ChromaDB Cloud'
      };
    }
  }

  /**
   * Create or get collection
   */
  async createCollection(collectionName, metadata = {}) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/collections`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: collectionName,
          metadata: {
            ...metadata,
            created_at: new Date().toISOString()
          }
        })
      });

      // Collection might already exist (409), that's OK
      if (response.ok || response.status === 409) {
        return { success: true, collectionName };
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to create collection: ${errorText}`);
      }
    } catch (error) {
      throw new Error(`Collection creation failed: ${error.message}`);
    }
  }

  /**
   * Add documents to collection
   */
  async addDocuments(collectionName, documents, metadatas, ids) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/collections/${collectionName}/add`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          documents: documents,
          metadatas: metadatas,
          ids: ids
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add documents: ${errorText}`);
      }

      return { success: true, documentsAdded: documents.length };
    } catch (error) {
      throw new Error(`Document addition failed: ${error.message}`);
    }
  }

  /**
   * Search collection
   */
  async searchCollection(collectionName, query, nResults = 5, where = {}) {
    try {
      const searchBody = {
        query_texts: [query],
        n_results: nResults,
        include: ['documents', 'metadatas', 'distances'],
        ...(Object.keys(where).length > 0 && { where })
      };

      const response = await fetch(`${this.baseURL}/api/v1/collections/${collectionName}/query`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(searchBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Search failed: ${errorText}`);
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

      return formattedResults;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get all collections
   */
  async getCollections() {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/collections`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get collections: ${response.statusText}`);
      }

      const collections = await response.json();
      
      // Get detailed info for each collection
      const detailedCollections = await Promise.all(
        collections.map(async (collection) => {
          try {
            const detailResponse = await fetch(`${this.baseURL}/api/v1/collections/${collection.name}`, {
              headers: this.getHeaders()
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

      return detailedCollections;
    } catch (error) {
      throw new Error(`Failed to get collections: ${error.message}`);
    }
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionName) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/collections/${collectionName}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to delete collection: ${response.statusText}`);
      }

      return { success: true, message: `Collection ${collectionName} deleted successfully` };
    } catch (error) {
      throw new Error(`Failed to delete collection: ${error.message}`);
    }
  }

  /**
   * Process Q&A pairs for embedding
   */
  processQAPairs(qaPairs, filename) {
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

    return { documents, metadatas, ids };
  }
}

module.exports = ChromaDBService;