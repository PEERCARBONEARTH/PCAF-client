# RAG Knowledge Base Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup ChromaDB (Vector Database)
```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

### 3. Configure Environment
```bash
cp backend/.env.example backend/.env
# Edit .env file with your OpenAI API key and other settings
```

### 4. Upload Documents
```bash
# Create upload directory
mkdir -p backend/uploads/rag-documents

# Add your documents to the directory:
# - PCAF methodology documents (PDF, DOCX)
# - TCFD guidance documents
# - Regulatory documents
# - Best practice guides

# Run ingestion script
cd backend
npm run ingest-documents
```

### 5. Start Backend Server
```bash
cd backend
npm run dev
```

## Document Upload Methods

### Method 1: Web Interface
1. Navigate to `/financed-emissions/rag-management`
2. Use the upload interface to drag and drop files
3. Documents are automatically processed and categorized

### Method 2: Command Line
```bash
# Upload specific directory
npm run ingest-documents -- --dir /path/to/your/documents

# Upload default directory
npm run ingest-documents
```

### Method 3: API Endpoint
```bash
curl -X POST http://localhost:3001/api/v1/rag/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "documents=@pcaf-standard.pdf" \
  -F "documents=@tcfd-guidance.pdf"
```

## Supported Document Types

- **PDF Files** (.pdf) - Automatically extracted using PDF.js
- **Word Documents** (.docx) - Extracted using Mammoth
- **Text Files** (.txt) - Direct text processing
- **Markdown Files** (.md) - Direct text processing

## Document Categories

Documents are automatically categorized based on filename and content:

- **PCAF Methodology** - Files containing 'pcaf'
- **TCFD Guidance** - Files containing 'tcfd'
- **NGFS Scenarios** - Files containing 'ngfs'
- **Regulations** - Files containing 'regulation' or 'compliance'
- **Calculations** - Files containing 'calculation' or 'formula'
- **Best Practices** - All other documents

## RAG Collections

The system creates separate vector collections for different document types:

- `pcaf_methodology` - PCAF standards and calculation guides
- `pcaf_regulation` - Regulatory documents and compliance guides
- `pcaf_calculation` - Calculation methodologies and formulas
- `pcaf_best_practice` - Industry best practices and guides

## API Endpoints

### Upload Documents
```
POST /api/v1/rag/upload
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

Form data:
- documents: File[] (multiple files)
```

### Search Documents
```
POST /api/v1/rag/search
Content-Type: application/json
Authorization: Bearer TOKEN

Body:
{
  "query": "How to calculate PCAF data quality score?",
  "collectionType": "methodology",
  "limit": 5
}
```

### List Collections
```
GET /api/v1/rag/collections
Authorization: Bearer TOKEN
```

### Collection Statistics
```
GET /api/v1/rag/collections/{name}/stats
Authorization: Bearer TOKEN
```

## Example Documents to Upload

### PCAF Methodology
- PCAF Global GHG Accounting Standard
- PCAF Motor Vehicle Methodology
- PCAF Real Estate Methodology
- Data Quality Assessment Guidelines

### Regulatory Documents
- TCFD Recommendations
- EU Taxonomy Regulation
- Central Bank Climate Guidance
- NGFS Scenario Documentation

### Best Practices
- Industry implementation guides
- Calculation examples
- Compliance checklists
- Quality assurance procedures

## Troubleshooting

### ChromaDB Connection Issues
```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# Restart ChromaDB
chroma run --host localhost --port 8000
```

### OpenAI API Issues
- Verify API key in .env file
- Check API quota and billing
- Monitor rate limits

### Document Processing Errors
- Check file permissions
- Verify file formats are supported
- Check file size limits (50MB max)

### Memory Issues
- Reduce batch size in embedding generation
- Process documents in smaller batches
- Monitor system memory usage

## Performance Optimization

### Embedding Generation
- Use batch processing for multiple documents
- Implement rate limiting for OpenAI API
- Cache embeddings to avoid regeneration

### Vector Search
- Optimize similarity thresholds
- Use metadata filtering for better results
- Implement result caching

### Storage Optimization
- Regular cleanup of old embeddings
- Compress document content
- Archive unused collections

## Security Considerations

- Store API keys securely in environment variables
- Implement proper authentication for upload endpoints
- Validate file types and content before processing
- Monitor for malicious document uploads
- Regular security updates for dependencies

## Monitoring and Maintenance

### Health Checks
```bash
# Check RAG system health
curl http://localhost:3001/api/v1/rag/health

# Monitor collection sizes
curl http://localhost:3001/api/v1/rag/collections
```

### Regular Maintenance
- Update documents when new versions are released
- Clean up duplicate or outdated content
- Monitor embedding quality and relevance
- Update OpenAI models when available

### Backup and Recovery
- Regular backup of ChromaDB data
- Export document metadata and embeddings
- Version control for document sources
- Disaster recovery procedures