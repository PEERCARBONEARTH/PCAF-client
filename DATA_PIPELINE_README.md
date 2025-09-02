# PCAF Data Pipeline System

A comprehensive ETL (Extract, Transform, Load) pipeline that pulls portfolio data, loans, bank targets, analytics, and client documents, transforms them for AI processing, and stores them in ChromaDB for semantic search and insights generation.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────┐
│   Data Sources  │───▶│   Transform &    │───▶│   ChromaDB      │───▶│ AI Insights  │
│                 │    │   Embed          │    │   Collections   │    │ & Search     │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └──────────────┘
│                      │                       │                      │
├─ Portfolio Data     ├─ Document Creation    ├─ portfolio_documents  ├─ Semantic Search
├─ Loan Details       ├─ Content Enrichment  ├─ loan_documents       ├─ Risk Analysis
├─ Analytics          ├─ Vector Embeddings   ├─ analytics_documents  ├─ Compliance Check
├─ Bank Targets       ├─ Metadata Tagging    ├─ bank_targets         ├─ Opportunities
└─ Client Reports     └─ Quality Assessment  ├─ historical_reports   └─ Recommendations
                                             └─ client_insights
```

## 🚀 Quick Start

### 1. Initialize the Pipeline System

```typescript
import { pipelineIntegrationService } from '@/services/pipeline-integration-service';

// Initialize the complete system
await pipelineIntegrationService.initialize();

// Run quick start to populate ChromaDB
const result = await pipelineIntegrationService.quickStart();
console.log(`Created ${result.documentsCreated} documents in ${result.processingTimeMs}ms`);
```

### 2. Access the Demo Page

Navigate to `/pipeline-demo` to see the complete system in action with:
- Real-time pipeline status
- ChromaDB collection monitoring
- Semantic document search
- AI-generated portfolio insights

## 📊 Data Sources

### Portfolio Service
- **Source**: `portfolioService.getPortfolioSummary()`
- **Data**: Loan details, vehicle information, emissions data
- **Output**: Individual loan documents + portfolio overview

### Analytics Service  
- **Source**: `portfolioService.getPortfolioAnalytics()`
- **Data**: PCAF metrics, emission intensities, compliance rates
- **Output**: Comprehensive analytics document

### Client Documents Service
- **Source**: `clientDocumentsService.extractAllClientData()`
- **Data**: Bank targets, historical reports, client insights
- **Output**: Structured documents with metadata

## 🔄 Pipeline Components

### 1. Enhanced Data Pipeline Service
**File**: `enhanced-data-pipeline-service.ts`

```typescript
// Run complete pipeline
const result = await enhancedDataPipelineService.runCompletePipeline({
  forceFullRefresh: true,
  includeClientDocuments: true,
  maxLoans: 100
});
```

**Features**:
- Extracts from multiple data sources
- Transforms to AI-friendly format
- Generates vector embeddings
- Stores in appropriate ChromaDB collections
- Provides detailed metrics and error handling

### 2. ChromaDB Service
**File**: `chroma-db-service.ts`

```typescript
// Search documents semantically
const results = await chromaDBService.searchDocuments(
  "PCAF compliance issues",
  {
    collectionName: 'portfolio_documents',
    limit: 10,
    minSimilarity: 0.3
  }
);
```

**Collections**:
- `portfolio_documents`: Portfolio overviews and performance
- `loan_documents`: Individual loan analysis
- `analytics_documents`: Comprehensive metrics and KPIs
- `bank_targets`: Climate goals and strategic targets
- `historical_reports`: Time-series data and trends
- `client_insights`: AI-generated insights and recommendations

### 3. Client Documents Service
**File**: `client-documents-service.ts`

```typescript
// Extract all client data
const clientData = await clientDocumentsService.extractAllClientData();
```

**Generates**:
- Portfolio performance reports
- Individual loan analyses
- Bank target tracking
- Historical trend summaries
- Risk assessments

## 🔍 Search & Insights

### Semantic Search
```typescript
// Search across all collections
const results = await pipelineIntegrationService.searchDocuments(
  "high emission intensity loans",
  {
    limit: 5,
    collections: ['loan_documents', 'analytics_documents']
  }
);
```

### AI Insights Generation
```typescript
// Get portfolio insights
const insights = await pipelineIntegrationService.getPortfolioInsights();
// Returns categorized insights: overview, risk, opportunity, compliance
```

## 📈 Monitoring & Management

### Pipeline Monitor Component
**File**: `components/pipeline/PipelineMonitor.tsx`

Features:
- Real-time pipeline status
- Schedule management
- Health metrics
- Data quality assessment

### System Status
```typescript
const status = await pipelineIntegrationService.getSystemStatus();
console.log({
  chromaDBHealth: status.chromaDBHealth,
  totalDocuments: status.totalDocuments,
  collections: status.collections,
  dataFreshness: status.dataFreshness
});
```

## 🛠️ Configuration

### Pipeline Configuration
```typescript
enhancedDataPipelineService.updateConfig({
  batchSize: 25,
  maxLoansToProcess: 100,
  enableClientDocuments: true,
  dataQualityThreshold: 3.0
});
```

### ChromaDB Collections
Each collection is optimized for specific document types:

| Collection | Document Types | Use Case |
|------------|----------------|----------|
| `portfolio_documents` | Portfolio overviews | High-level insights |
| `loan_documents` | Individual loans | Loan-specific analysis |
| `analytics_documents` | Metrics & KPIs | Performance tracking |
| `bank_targets` | Climate goals | Target monitoring |
| `historical_reports` | Time-series data | Trend analysis |
| `client_insights` | AI insights | Recommendations |

## 🔧 API Reference

### Enhanced Data Pipeline Service

#### `runCompletePipeline(options?)`
Runs the complete ETL pipeline.

**Options**:
- `forceFullRefresh?: boolean` - Clear and rebuild all data
- `includeClientDocuments?: boolean` - Include client document processing
- `maxLoans?: number` - Limit number of loans to process

**Returns**: `PipelineResult`

#### `getProcessingStatus()`
Returns current pipeline processing status.

### ChromaDB Service

#### `addDocuments(collectionName, documents)`
Add documents to a ChromaDB collection.

#### `searchDocuments(query, options?)`
Semantic search across documents.

**Options**:
- `collectionName?: string` - Specific collection to search
- `limit?: number` - Maximum results to return
- `minSimilarity?: number` - Minimum similarity threshold
- `filters?: Record<string, any>` - Metadata filters

#### `getCollectionStats(collectionName)`
Get statistics for a specific collection.

### Pipeline Integration Service

#### `quickStart()`
Initialize and run complete pipeline setup.

#### `searchDocuments(query, options?)`
Search across all collections.

#### `getPortfolioInsights(query?)`
Generate AI-powered portfolio insights.

#### `refreshData(dataTypes)`
Refresh specific data types: `['portfolio', 'loans', 'analytics', 'documents']`

## 📝 Document Structure

### Portfolio Document
```typescript
{
  id: 'portfolio_overview',
  content: 'Portfolio Overview:\n- Total Loans: 150\n- Emissions: 1,250 tCO2e...',
  metadata: {
    type: 'portfolio_overview',
    source: 'portfolio_service',
    timestamp: Date,
    dataQuality: 3.2,
    tags: ['portfolio', 'overview', 'pcaf']
  }
}
```

### Loan Document
```typescript
{
  id: 'loan_ABC123',
  content: 'Loan Analysis - ABC123:\n- Vehicle: Tesla Model 3...',
  metadata: {
    type: 'loan_analysis',
    loanId: 'ABC123',
    emissionIntensity: 0.5,
    pcafScore: 2,
    tags: ['loan', 'vehicle', 'electric', 'compliant']
  }
}
```

## 🚨 Error Handling

The pipeline includes comprehensive error handling:

- **Data Extraction Errors**: Graceful fallback to available data
- **Transformation Errors**: Skip problematic records, continue processing
- **Embedding Errors**: Store documents without embeddings as fallback
- **Storage Errors**: Detailed error reporting and retry logic

## 🔄 Scheduling

Use the Pipeline Orchestrator for automated runs:

```typescript
import { pipelineOrchestrator } from '@/services/pipeline-orchestrator';

// Enable daily full refresh
pipelineOrchestrator.toggleSchedule('daily_full_refresh', true);

// Enable hourly incremental updates
pipelineOrchestrator.toggleSchedule('hourly_incremental', true);
```

## 📊 Performance Metrics

The pipeline tracks:
- **Processing Time**: End-to-end pipeline execution time
- **Document Count**: Number of documents processed and stored
- **Success Rate**: Percentage of successful operations
- **Data Quality Score**: Average PCAF data quality score
- **Collection Health**: Document count and freshness per collection

## 🎯 Use Cases

### 1. Portfolio Risk Analysis
```typescript
const riskResults = await pipelineIntegrationService.searchDocuments(
  "high risk loans PCAF score above 4",
  { collections: ['loan_documents'] }
);
```

### 2. Compliance Monitoring
```typescript
const complianceInsights = await pipelineIntegrationService.getPortfolioInsights(
  "PCAF Box 8 WDQS compliance status"
);
```

### 3. EV Opportunity Analysis
```typescript
const evOpportunities = await pipelineIntegrationService.searchDocuments(
  "electric vehicle financing opportunities",
  { collections: ['analytics_documents', 'bank_targets'] }
);
```

### 4. Historical Trend Analysis
```typescript
const trends = await pipelineIntegrationService.searchDocuments(
  "emission intensity trends over time",
  { collections: ['historical_reports'] }
);
```

## 🔐 Security & Privacy

- All sensitive data is processed locally
- No external API calls for embeddings (mock implementation)
- Configurable data retention policies
- Audit trail for all pipeline operations

## 🚀 Getting Started

1. **Install Dependencies**: Ensure all required services are available
2. **Initialize System**: Run `pipelineIntegrationService.initialize()`
3. **Quick Start**: Execute `pipelineIntegrationService.quickStart()`
4. **Monitor**: Use the Pipeline Monitor component for real-time status
5. **Search & Analyze**: Use semantic search and AI insights for analysis

## 📚 Additional Resources

- **Pipeline Monitor**: `/src/components/pipeline/PipelineMonitor.tsx`
- **Demo Page**: `/src/pages/pipeline-demo.tsx`
- **Service Files**: `/src/services/*-service.ts`
- **Integration Guide**: This README

The PCAF Data Pipeline System provides a complete solution for transforming portfolio data into AI-ready insights, enabling advanced analytics, compliance monitoring, and strategic decision-making.