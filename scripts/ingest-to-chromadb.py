#!/usr/bin/env python3
"""
ChromaDB Ingestion Script for PCAF Motor Vehicle Q&A Dataset
Converts JSON dataset to ChromaDB for efficient semantic search
"""

import json
import chromadb
from chromadb.config import Settings
import uuid
from typing import List, Dict, Any
import os
import sys
from pathlib import Path

class PCAFChromaDBIngester:
    def __init__(self, db_path: str = "./chroma_db"):
        """Initialize ChromaDB client and collection"""
        self.db_path = Path(db_path)
        self.db_path.mkdir(exist_ok=True)
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=str(self.db_path),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection(
            name="pcaf_motor_vehicle_qa",
            metadata={
                "description": "PCAF Motor Vehicle Q&A Dataset for RAG",
                "version": "1.0",
                "asset_class": "motor_vehicle"
            }
        )
    
    def load_dataset(self, json_path: str) -> Dict[str, Any]:
        """Load the Q&A dataset from JSON file"""
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def extract_qa_pairs(self, dataset: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract all Q&A pairs from the dataset structure"""
        qa_pairs = []
        
        # Extract metadata
        metadata = dataset.get('metadata', {})
        
        # Process each category
        categories = dataset.get('categories', {})
        
        for category_key, category_data in categories.items():
            category_description = category_data.get('description', '')
            questions = category_data.get('questions', [])
            
            for question_data in questions:
                qa_pair = {
                    'id': question_data.get('id'),
                    'question': question_data.get('question'),
                    'answer': question_data.get('answer'),
                    'confidence': question_data.get('confidence', 'medium'),
                    'sources': question_data.get('sources', []),
                    'followUp': question_data.get('followUp', []),
                    'bankingContext': question_data.get('bankingContext', {}),
                    'category': category_key,
                    'category_description': category_description,
                    'dataset_version': metadata.get('version'),
                    'asset_class': metadata.get('assetClass'),
                    'last_updated': metadata.get('lastUpdated')
                }
                qa_pairs.append(qa_pair)
        
        return qa_pairs
    
    def prepare_documents(self, qa_pairs: List[Dict[str, Any]]) -> tuple:
        """Prepare documents, metadata, and IDs for ChromaDB ingestion"""
        documents = []
        metadatas = []
        ids = []
        
        for qa_pair in qa_pairs:
            # Create searchable document text
            # Combine question and answer for better semantic search
            document_text = f"""
Question: {qa_pair['question']}

Answer: {qa_pair['answer']}

Category: {qa_pair['category_description']}

Sources: {', '.join(qa_pair['sources'])}

Follow-up Questions: {', '.join(qa_pair['followUp'])}
            """.strip()
            
            # Prepare metadata (ChromaDB requires simple types)
            metadata = {
                'question_id': qa_pair['id'],
                'question': qa_pair['question'][:500],  # Truncate for metadata
                'confidence': qa_pair['confidence'],
                'category': qa_pair['category'],
                'category_description': qa_pair['category_description'],
                'asset_class': qa_pair['asset_class'],
                'dataset_version': qa_pair['dataset_version'],
                'last_updated': qa_pair['last_updated'],
                'sources_count': len(qa_pair['sources']),
                'followup_count': len(qa_pair['followUp']),
                # Banking context flags
                'has_risk_management': qa_pair['bankingContext'].get('riskManagement', False),
                'has_regulatory_compliance': qa_pair['bankingContext'].get('regulatoryCompliance', False),
                'has_credit_risk': qa_pair['bankingContext'].get('creditRisk', False),
                'has_capital_allocation': qa_pair['bankingContext'].get('capitalAllocation', False),
                'has_loan_origination': qa_pair['bankingContext'].get('loanOrigination', False),
                'has_strategic_planning': qa_pair['bankingContext'].get('strategicPlanning', False)
            }
            
            documents.append(document_text)
            metadatas.append(metadata)
            ids.append(qa_pair['id'] or str(uuid.uuid4()))
        
        return documents, metadatas, ids
    
    def ingest_data(self, json_path: str) -> Dict[str, Any]:
        """Main ingestion process"""
        print(f"🔄 Loading dataset from {json_path}...")
        dataset = self.load_dataset(json_path)
        
        print("📊 Extracting Q&A pairs...")
        qa_pairs = self.extract_qa_pairs(dataset)
        
        print(f"📝 Found {len(qa_pairs)} Q&A pairs")
        
        print("🔧 Preparing documents for ChromaDB...")
        documents, metadatas, ids = self.prepare_documents(qa_pairs)
        
        print("🚀 Ingesting into ChromaDB...")
        
        # Clear existing data if any
        try:
            self.collection.delete()
            print("🗑️ Cleared existing collection data")
        except:
            pass
        
        # Add documents to collection
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        # Verify ingestion
        collection_count = self.collection.count()
        
        result = {
            'status': 'success',
            'total_documents': len(documents),
            'collection_count': collection_count,
            'categories': list(set(qa['category'] for qa in qa_pairs)),
            'confidence_levels': list(set(qa['confidence'] for qa in qa_pairs)),
            'database_path': str(self.db_path)
        }
        
        print(f"✅ Successfully ingested {collection_count} documents")
        print(f"📁 Database location: {self.db_path}")
        
        return result
    
    def test_search(self, query: str, n_results: int = 3) -> Dict[str, Any]:
        """Test the ingested data with a sample search"""
        print(f"\n🔍 Testing search with query: '{query}'")
        
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            include=['documents', 'metadatas', 'distances']
        )
        
        print(f"📋 Found {len(results['documents'][0])} results:")
        
        for i, (doc, metadata, distance) in enumerate(zip(
            results['documents'][0],
            results['metadatas'][0], 
            results['distances'][0]
        )):
            print(f"\n{i+1}. Question ID: {metadata['question_id']}")
            print(f"   Category: {metadata['category']}")
            print(f"   Confidence: {metadata['confidence']}")
            print(f"   Distance: {distance:.4f}")
            print(f"   Question: {metadata['question'][:100]}...")
        
        return results

def main():
    """Main execution function"""
    print("🚀 PCAF ChromaDB Ingestion Starting...")
    
    # Configuration - check for command line argument
    if len(sys.argv) > 1:
        json_path = sys.argv[1]
    else:
        json_path = "src/data/motorVehicleQADataset.json"
    
    db_path = "./chroma_db"
    
    # Check if JSON file exists
    if not os.path.exists(json_path):
        print(f"❌ Error: Dataset file not found at {json_path}")
        return
    
    try:
        # Initialize ingester
        ingester = PCAFChromaDBIngester(db_path)
        
        # Ingest data
        result = ingester.ingest_data(json_path)
        
        # Print summary
        print("\n📊 Ingestion Summary:")
        print(f"   Status: {result['status']}")
        print(f"   Documents: {result['total_documents']}")
        print(f"   Categories: {', '.join(result['categories'])}")
        print(f"   Database: {result['database_path']}")
        
        # Test searches
        test_queries = [
            "What is my portfolio data quality score?",
            "How do I calculate attribution factors?",
            "PCAF compliance requirements",
            "Motor vehicle emission calculations"
        ]
        
        print("\n🧪 Running test searches...")
        for query in test_queries:
            ingester.test_search(query, n_results=2)
        
        print("\n🎉 ChromaDB ingestion completed successfully!")
        print(f"💡 You can now use the ChromaDB at: {db_path}")
        
    except Exception as e:
        print(f"❌ Error during ingestion: {str(e)}")
        raise

if __name__ == "__main__":
    main()