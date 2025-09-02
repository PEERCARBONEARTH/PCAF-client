@echo off
REM ChromaDB Setup Script for PCAF RAG System (Windows)

echo 🚀 Setting up ChromaDB for PCAF RAG System...

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is required but not installed.
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo 📚 Installing Python dependencies...
pip install -r requirements.txt

REM Run ingestion
echo 📊 Ingesting Q&A dataset into ChromaDB...
python scripts\ingest-to-chromadb.py

REM Test the setup
echo 🧪 Testing ChromaDB setup...
python scripts\chroma-search.py "{\"query\": \"What is PCAF?\", \"n_results\": 2}"

echo.
echo 🎉 ChromaDB setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update your RAG service to use ChromaRAGService
echo 2. Test the new semantic search capabilities
echo 3. Monitor performance improvements
echo.
echo 💡 To activate the environment later: venv\Scripts\activate.bat
pause