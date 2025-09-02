/**
 * ChromaDB API Service - Real API integration for production ChromaDB
 * Handles actual HTTP requests to ChromaDB server for embedding and retrieval
 */

export interface ChromaAPIConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface ChromaEmbeddingRequest {
  documents: string[];
  metadata?: Record<string, any>[];
  ids?: string[];
}

export interface ChromaSearchRequest {
  query_texts: string[];
  n_results?: number;
  where?: Record<string, any>;
  where_document?: Record<string, any>;
  include?: string[];
}

export interface ChromaSearchResponse {
  ids: string[][];
  distances: number[][];
  metadatas: Record<string, any>[][];
  documents: string[][];
  embeddings?: number[][][];
}

class ChromaAPIService {
  private static instance: ChromaAPIService;
  private config: ChromaAPIConfig;

  constructor(config: ChromaAPIConfig = {
    baseUrl: process.env.REACT_APP_CHROMA_URL || 'http://localhost:8000',
    timeout: 30000
  }) {
    this.config = config;
  }

  static getInstance(config?: ChromaAPIConfig): ChromaAPIService {
    if (!ChromaAPIService.instance) {
      ChromaAPIService.instance = new ChromaAPIService(config);
    }
    return ChromaAPIService.instance;
  }

  /**
   * Create or get a collection
   */
  async createCollection(
    name: string,
    metadata?: Record<string, any>
  ): Promise<{ name: string; id: string; metadata: Record<string, any> }> {
    try {
      const response = await this.makeRequest('POST', '/api/v1/collections', {
        name,
        metadata: metadata || {},
        get_or_create: true
      });

      console.log(`✅ ChromaDB collection created/retrieved: ${name}`);
      return response;

    } catch (error) {
      console.error(`Failed to create collection ${name}:`, error);
      throw error;
    }
  }

  /**
   * Add documents to a collection with automatic embedding
   */
  async addDocuments(
    collectionName: string,
    documents: string[],
    metadata?: Record<string, any>[],
    ids?: string[]
  ): Promise<{ success: boolean; added: number }> {
    try {
      // Ensure collection exists
      await this.createCollection(collectionName);

      // Generate IDs if not provided
      const documentIds = ids || documents.map((_, index) => 
        `doc_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      );

      const response = await this.makeRequest(
        'POST', 
        `/api/v1/collections/${collectionName}/add`,
        {
          documents,
          metadatas: metadata || documents.map(() => ({})),
          ids: documentIds
        }
      );

      console.log(`✅ Added ${documents.length} documents to ChromaDB collection: ${collectionName}`);
      return { success: true, added: documents.length };

    } catch (error) {
      console.error(`Failed to add documents to collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Search documents using semantic similarity
   */
  async searchDocuments(
    collectionName: string,
    queryText: string,
    options?: {
      nResults?: number;
      where?: Record<string, any>;
      whereDocument?: Record<string, any>;
      includeEmbeddings?: boolean;
    }
  ): Promise<{
    ids: string[];
    distances: number[];
    documents: string[];
    metadatas: Record<string, any>[];
    embeddings?: number[][];
  }> {
    try {
      const searchRequest: ChromaSearchRequest = {
        query_texts: [queryText],
        n_results: options?.nResults || 10,
        include: ['documents', 'metadatas', 'distances']
      };

      if (options?.where) {
        searchRequest.where = options.where;
      }

      if (options?.whereDocument) {
        searchRequest.where_document = options.whereDocument;
      }

      if (options?.includeEmbeddings) {
        searchRequest.include?.push('embeddings');
      }

      const response: ChromaSearchResponse = await this.makeRequest(
        'POST',
        `/api/v1/collections/${collectionName}/query`,
        searchRequest
      );

      // Flatten the response arrays (ChromaDB returns nested arrays)
      return {
        ids: response.ids[0] || [],
        distances: response.distances[0] || [],
        documents: response.documents[0] || [],
        metadatas: response.metadatas[0] || [],
        embeddings: response.embeddings?.[0]
      };

    } catch (error) {
      console.error(`Failed to search collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get documents by IDs
   */
  async getDocuments(
    collectionName: string,
    ids?: string[],
    where?: Record<string, any>,
    limit?: number,
    offset?: number
  ): Promise<{
    ids: string[];
    documents: string[];
    metadatas: Record<string, any>[];
  }> {
    try {
      const request: any = {
        include: ['documents', 'metadatas']
      };

      if (ids) request.ids = ids;
      if (where) request.where = where;
      if (limit) request.limit = limit;
      if (offset) request.offset = offset;

      const response = await this.makeRequest(
        'POST',
        `/api/v1/collections/${collectionName}/get`,
        request
      );

      return {
        ids: response.ids || [],
        documents: response.documents || [],
        metadatas: response.metadatas || []
      };

    } catch (error) {
      console.error(`Failed to get documents from collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update documents in a collection
   */
  async updateDocuments(
    collectionName: string,
    ids: string[],
    documents?: string[],
    metadata?: Record<string, any>[]
  ): Promise<{ success: boolean; updated: number }> {
    try {
      const updateRequest: any = { ids };

      if (documents) updateRequest.documents = documents;
      if (metadata) updateRequest.metadatas = metadata;

      await this.makeRequest(
        'POST',
        `/api/v1/collections/${collectionName}/update`,
        updateRequest
      );

      console.log(`✅ Updated ${ids.length} documents in ChromaDB collection: ${collectionName}`);
      return { success: true, updated: ids.length };

    } catch (error) {
      console.error(`Failed to update documents in collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete documents from a collection
   */
  async deleteDocuments(
    collectionName: string,
    ids?: string[],
    where?: Record<string, any>
  ): Promise<{ success: boolean; deleted: number }> {
    try {
      const deleteRequest: any = {};

      if (ids) deleteRequest.ids = ids;
      if (where) deleteRequest.where = where;

      const response = await this.makeRequest(
        'POST',
        `/api/v1/collections/${collectionName}/delete`,
        deleteRequest
      );

      const deletedCount = ids?.length || 0; // ChromaDB doesn't return count
      console.log(`✅ Deleted documents from ChromaDB collection: ${collectionName}`);
      return { success: true, deleted: deletedCount };

    } catch (error) {
      console.error(`Failed to delete documents from collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get collection information
   */
  async getCollection(name: string): Promise<{
    name: string;
    id: string;
    metadata: Record<string, any>;
  }> {
    try {
      const response = await this.makeRequest('GET', `/api/v1/collections/${name}`);
      return response;

    } catch (error) {
      console.error(`Failed to get collection ${name}:`, error);
      throw error;
    }
  }

  /**
   * List all collections
   */
  async listCollections(): Promise<Array<{
    name: string;
    id: string;
    metadata: Record<string, any>;
  }>> {
    try {
      const response = await this.makeRequest('GET', '/api/v1/collections');
      return response || [];

    } catch (error) {
      console.error('Failed to list collections:', error);
      throw error;
    }
  }

  /**
   * Delete a collection
   */
  async deleteCollection(name: string): Promise<{ success: boolean }> {
    try {
      await this.makeRequest('DELETE', `/api/v1/collections/${name}`);
      console.log(`✅ Deleted ChromaDB collection: ${name}`);
      return { success: true };

    } catch (error) {
      console.error(`Failed to delete collection ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get collection count
   */
  async getCollectionCount(collectionName: string): Promise<number> {
    try {
      const response = await this.makeRequest('GET', `/api/v1/collections/${collectionName}/count`);
      return response.count || 0;

    } catch (error) {
      console.error(`Failed to get count for collection ${collectionName}:`, error);
      return 0;
    }
  }

  /**
   * Health check for ChromaDB server
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    version?: string;
    uptime?: number;
  }> {
    try {
      const response = await this.makeRequest('GET', '/api/v1/heartbeat', null, 5000);
      
      return {
        status: 'healthy',
        version: response.version,
        uptime: response.uptime
      };

    } catch (error) {
      console.error('ChromaDB health check failed:', error);
      return { status: 'unhealthy' };
    }
  }

  /**
   * Reset the entire database (use with caution!)
   */
  async resetDatabase(): Promise<{ success: boolean }> {
    try {
      await this.makeRequest('POST', '/api/v1/reset');
      console.log('⚠️ ChromaDB database reset completed');
      return { success: true };

    } catch (error) {
      console.error('Failed to reset ChromaDB database:', error);
      throw error;
    }
  }

  /**
   * Private method to make HTTP requests to ChromaDB
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    timeout?: number
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const requestTimeout = timeout || this.config.timeout || 30000;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ChromaDB API error (${response.status}): ${errorText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return {};
      }

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`ChromaDB request timeout after ${requestTimeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ChromaAPIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ChromaAPIConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const chromaAPIService = ChromaAPIService.getInstance();

// Export class for custom instances
export { ChromaAPIService };