/**
 * ChromaDB Service - Vector database for AI-powered document search and retrieval
 * Handles embedding storage, similarity search, and knowledge retrieval
 */

export interface ChromaDocument {
  id: string;
  content: string;
  metadata: {
    type: string;
    source: string;
    timestamp: Date;
    dataQuality: number;
    tags: string[];
    [key: string]: any;
  };
  embedding?: number[];
}

export interface SearchResult {
  document: ChromaDocument;
  similarity: number;
  relevanceScore: number;
}

export interface ChromaCollection {
  name: string;
  metadata: {
    description: string;
    created: Date;
    documentCount: number;
    lastUpdated: Date;
  };
}

class ChromaDBService {
  private static instance: ChromaDBService;
  private collections: Map<string, ChromaDocument[]> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initializeCollections();
  }

  static getInstance(): ChromaDBService {
    if (!ChromaDBService.instance) {
      ChromaDBService.instance = new ChromaDBService();
    }
    return ChromaDBService.instance;
  }

  /**
   * Initialize ChromaDB collections
   */
  private initializeCollections(): void {
    // Initialize main collections
    this.collections.set('portfolio_documents', []);
    this.collections.set('loan_documents', []);
    this.collections.set('analytics_documents', []);
    this.collections.set('bank_targets', []);
    this.collections.set('historical_reports', []);
    this.collections.set('client_insights', []);
    
    this.isInitialized = true;
    console.log('✅ ChromaDB collections initialized');
  }

  /**
   * Add documents to ChromaDB with embeddings
   */
  async addDocuments(
    collectionName: string, 
    documents: ChromaDocument[]
  ): Promise<{ added: number; updated: number; errors: number }> {
    if (!this.isInitialized) {
      throw new Error('ChromaDB not initialized');
    }

    let added = 0;
    let updated = 0;
    let errors = 0;

    try {
      const collection = this.collections.get(collectionName) || [];

      for (const doc of documents) {
        try {
          // Generate embedding if not provided
          if (!doc.embedding) {
            doc.embedding = await this.generateEmbedding(doc.content);
          }

          // Check if document already exists
          const existingIndex = collection.findIndex(d => d.id === doc.id);
          
          if (existingIndex >= 0) {
            // Update existing document
            collection[existingIndex] = {
              ...doc,
              metadata: {
                ...doc.metadata,
                timestamp: new Date()
              }
            };
            updated++;
          } else {
            // Add new document
            collection.push({
              ...doc,
              metadata: {
                ...doc.metadata,
                timestamp: new Date()
              }
            });
            added++;
          }

        } catch (error) {
          console.error(`Failed to process document ${doc.id}:`, error);
          errors++;
        }
      }

      this.collections.set(collectionName, collection);
      console.log(`📚 ChromaDB: Added ${added}, Updated ${updated}, Errors ${errors} in collection ${collectionName}`);

      return { added, updated, errors };

    } catch (error) {
      console.error(`ChromaDB addDocuments failed for collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Search documents using semantic similarity
   */
  async searchDocuments(
    query: string,
    options?: {
      collectionName?: string;
      limit?: number;
      minSimilarity?: number;
      filters?: Record<string, any>;
    }
  ): Promise<SearchResult[]> {
    const opts = {
      collectionName: 'portfolio_documents',
      limit: 10,
      minSimilarity: 0.3,
      ...options
    };

    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Get documents from specified collection or all collections
      const collections = opts.collectionName 
        ? [opts.collectionName]
        : Array.from(this.collections.keys());

      const allResults: SearchResult[] = [];

      for (const collectionName of collections) {
        const collection = this.collections.get(collectionName) || [];
        
        for (const doc of collection) {
          if (!doc.embedding) continue;

          // Apply filters if specified
          if (opts.filters && !this.matchesFilters(doc, opts.filters)) {
            continue;
          }

          // Calculate similarity
          const similarity = this.calculateCosineSimilarity(queryEmbedding, doc.embedding);
          
          if (similarity >= opts.minSimilarity) {
            allResults.push({
              document: doc,
              similarity,
              relevanceScore: this.calculateRelevanceScore(doc, query, similarity)
            });
          }
        }
      }

      // Sort by relevance score and limit results
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      return allResults.slice(0, opts.limit);

    } catch (error) {
      console.error('ChromaDB search failed:', error);
      throw error;
    }
  }

  /**
   * Get documents by metadata filters
   */
  async getDocumentsByMetadata(
    filters: Record<string, any>,
    collectionName?: string
  ): Promise<ChromaDocument[]> {
    try {
      const collections = collectionName 
        ? [collectionName]
        : Array.from(this.collections.keys());

      const results: ChromaDocument[] = [];

      for (const name of collections) {
        const collection = this.collections.get(name) || [];
        
        for (const doc of collection) {
          if (this.matchesFilters(doc, filters)) {
            results.push(doc);
          }
        }
      }

      return results;

    } catch (error) {
      console.error('ChromaDB metadata query failed:', error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName: string): Promise<{
    documentCount: number;
    avgDataQuality: number;
    typeDistribution: Record<string, number>;
    lastUpdated: Date | null;
  }> {
    try {
      const collection = this.collections.get(collectionName) || [];
      
      if (collection.length === 0) {
        return {
          documentCount: 0,
          avgDataQuality: 0,
          typeDistribution: {},
          lastUpdated: null
        };
      }

      const typeDistribution: Record<string, number> = {};
      let totalDataQuality = 0;
      let lastUpdated: Date | null = null;

      for (const doc of collection) {
        // Type distribution
        const type = doc.metadata.type || 'unknown';
        typeDistribution[type] = (typeDistribution[type] || 0) + 1;

        // Data quality
        totalDataQuality += doc.metadata.dataQuality || 0;

        // Last updated
        const docTimestamp = doc.metadata.timestamp;
        if (!lastUpdated || docTimestamp > lastUpdated) {
          lastUpdated = docTimestamp;
        }
      }

      return {
        documentCount: collection.length,
        avgDataQuality: totalDataQuality / collection.length,
        typeDistribution,
        lastUpdated
      };

    } catch (error) {
      console.error('ChromaDB stats query failed:', error);
      throw error;
    }
  }

  /**
   * Delete documents from collection
   */
  async deleteDocuments(
    collectionName: string,
    documentIds: string[]
  ): Promise<{ deleted: number; notFound: number }> {
    try {
      const collection = this.collections.get(collectionName) || [];
      let deleted = 0;
      let notFound = 0;

      for (const id of documentIds) {
        const index = collection.findIndex(doc => doc.id === id);
        if (index >= 0) {
          collection.splice(index, 1);
          deleted++;
        } else {
          notFound++;
        }
      }

      this.collections.set(collectionName, collection);
      console.log(`🗑️ ChromaDB: Deleted ${deleted} documents, ${notFound} not found`);

      return { deleted, notFound };

    } catch (error) {
      console.error('ChromaDB delete failed:', error);
      throw error;
    }
  }

  /**
   * Clear entire collection
   */
  async clearCollection(collectionName: string): Promise<void> {
    try {
      this.collections.set(collectionName, []);
      console.log(`🧹 ChromaDB: Cleared collection ${collectionName}`);
    } catch (error) {
      console.error('ChromaDB clear collection failed:', error);
      throw error;
    }
  }

  /**
   * Get all collections info
   */
  async getCollections(): Promise<ChromaCollection[]> {
    try {
      const collections: ChromaCollection[] = [];

      for (const [name, docs] of this.collections) {
        const stats = await this.getCollectionStats(name);
        
        collections.push({
          name,
          metadata: {
            description: this.getCollectionDescription(name),
            created: new Date(), // In real implementation, track creation date
            documentCount: stats.documentCount,
            lastUpdated: stats.lastUpdated || new Date()
          }
        });
      }

      return collections;

    } catch (error) {
      console.error('ChromaDB get collections failed:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text content
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // In a real implementation, this would call OpenAI's embedding API
      // For now, we'll generate a mock embedding based on text characteristics
      
      const words = text.toLowerCase().split(/\s+/);
      const embedding = new Array(1536).fill(0);
      
      // Simple hash-based embedding simulation
      for (let i = 0; i < words.length && i < 100; i++) {
        const word = words[i];
        const hash = this.simpleHash(word);
        const index = Math.abs(hash) % 1536;
        embedding[index] += 1.0 / Math.sqrt(words.length);
      }

      // Normalize the embedding
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      if (magnitude > 0) {
        for (let i = 0; i < embedding.length; i++) {
          embedding[i] /= magnitude;
        }
      }

      return embedding;

    } catch (error) {
      console.error('Embedding generation failed:', error);
      // Return zero vector as fallback
      return new Array(1536).fill(0);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculate relevance score combining similarity and metadata
   */
  private calculateRelevanceScore(
    doc: ChromaDocument, 
    query: string, 
    similarity: number
  ): number {
    let score = similarity;

    // Boost score based on data quality
    const dataQualityBoost = (5 - (doc.metadata.dataQuality || 5)) * 0.1;
    score += dataQualityBoost;

    // Boost score for recent documents
    const daysSinceUpdate = (Date.now() - doc.metadata.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, (30 - daysSinceUpdate) / 30) * 0.1;
    score += recencyBoost;

    // Boost score for exact tag matches
    const queryWords = query.toLowerCase().split(/\s+/);
    const tagMatches = doc.metadata.tags.filter(tag => 
      queryWords.some(word => tag.toLowerCase().includes(word))
    ).length;
    score += tagMatches * 0.05;

    return Math.min(1.0, score);
  }

  /**
   * Check if document matches metadata filters
   */
  private matchesFilters(doc: ChromaDocument, filters: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filters)) {
      const docValue = doc.metadata[key];
      
      if (Array.isArray(value)) {
        if (!value.includes(docValue)) return false;
      } else if (typeof value === 'object' && value !== null) {
        // Range queries
        if (value.min !== undefined && docValue < value.min) return false;
        if (value.max !== undefined && docValue > value.max) return false;
      } else {
        if (docValue !== value) return false;
      }
    }
    return true;
  }

  /**
   * Simple hash function for text
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Get collection description
   */
  private getCollectionDescription(name: string): string {
    const descriptions = {
      'portfolio_documents': 'Portfolio overview and performance documents',
      'loan_documents': 'Individual loan analysis and details',
      'analytics_documents': 'Comprehensive portfolio analytics and metrics',
      'bank_targets': 'Climate targets and strategic goals',
      'historical_reports': 'Historical performance and trend analysis',
      'client_insights': 'AI-generated insights and recommendations'
    };
    return descriptions[name] || 'Document collection';
  }

  /**
   * Health check for ChromaDB service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    collections: number;
    totalDocuments: number;
    lastActivity: Date | null;
  }> {
    try {
      const collections = await this.getCollections();
      const totalDocuments = collections.reduce((sum, col) => sum + col.metadata.documentCount, 0);
      const lastActivity = collections.reduce((latest, col) => {
        return !latest || col.metadata.lastUpdated > latest 
          ? col.metadata.lastUpdated 
          : latest;
      }, null as Date | null);

      return {
        status: this.isInitialized ? 'healthy' : 'unhealthy',
        collections: collections.length,
        totalDocuments,
        lastActivity
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        collections: 0,
        totalDocuments: 0,
        lastActivity: null
      };
    }
  }
}

export const chromaDBService = ChromaDBService.getInstance();