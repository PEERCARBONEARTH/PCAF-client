#!/bin/bash
# ChromaDB Setup Script for PCAF RAG System

echo "🚀 Setting up ChromaDB for PCAF RAG System..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Make Python scripts executable
echo "🔐 Setting script permissions..."
chmod +x scripts/ingest-to-chromadb.py
chmod +x scripts/chroma-search.py

# Run ingestion
echo "📊 Ingesting Q&A dataset into ChromaDB..."
python scripts/ingest-to-chromadb.py

# Test the setup
echo "🧪 Testing ChromaDB setup..."
python scripts/chroma-search.py '{"query": "What is PCAF?", "n_results": 2}'

echo ""
echo "🎉 ChromaDB setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your RAG service to use ChromaRAGService"
echo "2. Test the new semantic search capabilities"
echo "3. Monitor performance improvements"
echo ""
echo "💡 To activate the environment later: source venv/bin/activate"