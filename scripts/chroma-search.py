#!/usr/bin/env python3
"""
ChromaDB Search Script for PCAF RAG System
Handles semantic search queries from the TypeScript RAG service
"""

import json
import sys
import chromadb
from chromadb.config import Settings
from pathlib import Path
from typing import List, Dict, Any, Optional

class ChromaSearchEngine:
    def __init__(self, db_path: str = "./chroma_db"):
        """Initialize ChromaDB client"""
        self.db_path = Path(db_path)
        
        if not self.db_path.exists():
            raise FileNotFoundError(f"ChromaDB not found at {db_path}. Run ingestion script first.")
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=str(self.db_path),
            settings=Settings(
                anonymized_telemetry=False
            )
        )
        
        # Get the collection
        try:
            self.collection = self.client.get_collection("pcaf_motor_vehicle_qa")
        except Exception as e:
            raise RuntimeError(f"Failed to load collection: {e}")
    
    def search(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Execute semantic search with filters"""
        query = params.get('query', '')
        n_results = params.get('n_results', 5)
        min_relevance = params.get('min_relevance', 0.3)
        
        # Build where clause for filtering
        where_clause = {}
        
        # Category filter
        if params.get('category_filter'):
            where_clause['category'] = params['category_filter']
        
        # Confidence filter
        if params.get('confidence_filter'):
            where_clause['confidence'] = params['confidence_filter']
        
        # Banking context filters
        banking_filters = params.get('banking_context_filter', [])
        for context in banking_filters:
            context_key = f"has_{context.lower().replace(' ', '_')}"
            where_clause[context_key] = True
        
        # Execute search
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_clause if where_clause else None,
                include=['documents', 'metadatas', 'distances']
            )
            
            # Format results
            formatted_results = []
            
            if results['documents'] and len(results['documents'][0]) > 0:
                for i in range(len(results['documents'][0])):
                    document = results['documents'][0][i]
                    metadata = results['metadatas'][0][i]
                    distance = results['distances'][0][i]
                    
                    # Calculate relevance score (inverse of distance)
                    relevance_score = max(0, 1 - distance)
                    
                    # Filter by minimum relevance
                    if relevance_score >= min_relevance:
                        formatted_results.append({
                            'document': document,
                            'metadata': metadata,
                            'distance': distance,
                            'relevance_score': relevance_score
                        })
            
            return formatted_results
            
        except Exception as e:
            raise RuntimeError(f"Search failed: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            count = self.collection.count()
            
            # Get sample of metadata to extract categories
            sample_results = self.collection.get(
                limit=100,
                include=['metadatas']
            )
            
            categories = set()
            confidence_levels = set()
            
            if sample_results['metadatas']:
                for metadata in sample_results['metadatas']:
                    if 'category' in metadata:
                        categories.add(metadata['category'])
                    if 'confidence' in metadata:
                        confidence_levels.add(metadata['confidence'])
            
            return {
                'total_documents': count,
                'categories': list(categories),
                'confidence_levels': list(confidence_levels),
                'database_path': str(self.db_path)
            }
            
        except Exception as e:
            raise RuntimeError(f"Failed to get stats: {e}")

def main():
    """Main execution function"""
    try:
        # Get parameters from command line
        if len(sys.argv) < 2:
            print(json.dumps({'error': 'No parameters provided'}))
            sys.exit(1)
        
        params = json.loads(sys.argv[1])
        
        # Initialize search engine
        search_engine = ChromaSearchEngine()
        
        # Handle different actions
        action = params.get('action', 'search')
        
        if action == 'stats':
            result = search_engine.get_stats()
        else:
            result = search_engine.search(params)
        
        # Output results as JSON
        print(json.dumps(result, ensure_ascii=False, indent=None))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'type': type(e).__name__
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()