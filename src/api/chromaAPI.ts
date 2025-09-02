/**
 * ChromaDB API Client for Hosted ChromaDB Service
 * Direct integration with hosted ChromaDB - no Python dependencies
 */

export interface ChromaStatus {
  status: 'available' | 'unavailable' | 'checking';
  stats?: {
    total_documents: number;
    categories: string[];
    collections: string[];
  };
  message: string;
}

export interface EmbedRequest {
  qaPairs: any[];
  filename: string;
  metadata: any;
}

export interface EmbedResponse {
  success: boolean;
  message: string;
  questionsEmbedded: number;
  filename: string;
  embeddedAt: string;
  collectionId: string;
}

export interface EmbeddedFile {
  id: string;
  filename: string;
  questionCount: number;
  embeddedAt: string;
  status: string;
  categories: string[];
  collectionId: string;
}

export interface SearchResult {
  id: string;
  question: string;
  answer: string;
  confidence: string;
  category: string;
  sources: string[];
  followUp: string[];
  bankingContext: Record<string, boolean>;
  distance: number;
  relevanceScore: number;
}

class ChromaAPI {
  private baseURL: string;
  private apiKey?: string;

  constructor() {
    // Use your production backend URL
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://pcaf-server-production.up.railway.app';
    this.apiKey = import.meta.env.VITE_CHROMA_API_KEY;
  }

  /**
   * Check hosted ChromaDB status and availability
   */
  async checkStatus(): Promise<ChromaStatus> {
    try {
      const response = await fetch(`${this.baseURL}/api/chroma/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        status: 'available',
        stats: result.stats,
        message: 'Hosted ChromaDB is available and ready'
      };
    } catch (error) {
      console.error('ChromaDB status check failed:', error);
      return {
        status: 'unavailable',
        message: `Failed to connect to hosted ChromaDB: ${error.message}`
      };
    }
  }

  /**
   * Embed Q&A data into hosted ChromaDB
   */
  async embedQAData(request: EmbedRequest): Promise<EmbedResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/chroma/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          ...request,
          collectionName: 'pcaf_motor_vehicle_qa',
          embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: `Successfully embedded ${request.qaPairs.length} questions`,
        questionsEmbedded: request.qaPairs.length,
        filename: request.filename,
        embeddedAt: new Date().toISOString(),
        collectionId: result.collectionId || 'pcaf_motor_vehicle_qa'
      };
    } catch (error) {
      console.error('ChromaDB embedding failed:', error);
      throw new Error(`Failed to embed Q&A data: ${error.message}`);
    }
  }

  /**
   * Get list of embedded collections from hosted ChromaDB
   */
  async getEmbeddedFiles(): Promise<EmbeddedFile[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/chroma/collections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const collections = await response.json();
      
      // Transform collections into embedded files format
      return collections.map((collection: any) => ({
        id: collection.id || collection.name,
        filename: collection.metadata?.filename || collection.name,
        questionCount: collection.count || 0,
        embeddedAt: collection.metadata?.embeddedAt || 'Unknown',
        status: 'active',
        categories: collection.metadata?.categories || [],
        collectionId: collection.name
      }));
    } catch (error) {
      console.error('Failed to get embedded files:', error);
      return [];
    }
  }

  /**
   * Delete an embedded collection from hosted ChromaDB
   */
  async deleteEmbeddedFile(fileId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/chroma/collections/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: `Collection ${fileId} deleted successfully`
      };
    } catch (error) {
      console.error('Failed to delete embedded file:', error);
      throw new Error(`Failed to delete collection: ${error.message}`);
    }
  }

  /**
   * Search hosted ChromaDB for Q&A content
   */
  async searchQA(query: string, options: {
    maxResults?: number;
    minRelevance?: number;
    categoryFilter?: string;
    collectionName?: string;
  } = {}): Promise<SearchResult[]> {
    try {
      const searchParams = new URLSearchParams({
        query,
        n_results: (options.maxResults || 5).toString(),
        collection_name: options.collectionName || 'pcaf_motor_vehicle_qa',
        ...(options.categoryFilter && { category_filter: options.categoryFilter })
      });

      const response = await fetch(`${this.baseURL}/api/chroma/search?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const results = await response.json();
      
      // Transform results to SearchResult format
      return results.map((result: any) => ({
        id: result.id,
        question: result.metadata?.question || 'Question not found',
        answer: result.document || result.metadata?.answer || 'Answer not found',
        confidence: result.metadata?.confidence || 'medium',
        category: result.metadata?.category || 'general',
        sources: result.metadata?.sources || [],
        followUp: result.metadata?.followUp || [],
        bankingContext: result.metadata?.bankingContext || {},
        distance: result.distance || 0,
        relevanceScore: Math.max(0, 1 - (result.distance || 0))
      }));
    } catch (error) {
      console.error('ChromaDB search failed:', error);
      return [];
    }
  }

  /**
   * Test ChromaDB connection with a simple query
   */
  async testConnection(): Promise<boolean> {
    try {
      const status = await this.checkStatus();
      return status.status === 'available';
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const chromaAPI = new ChromaAPI();