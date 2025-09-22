# Loan Data Pipeline & AI System

## Overview

This system provides a comprehensive loan data pipeline that automatically processes uploaded loan data across all three PCAF instruments, embeds it into ChromaDB for contextual AI analysis, and provides intelligent insights for portfolio management.

## Features

### 🚀 Multi-Instrument Support
- **Auto Loans**: Vehicle financing with emissions tracking
- **Commercial Real Estate**: Property financing with energy metrics  
- **Project Finance**: Infrastructure and energy project funding

### 🧠 AI-Powered Analysis
- Automatic document embedding using ChromaDB
- Semantic search across loan portfolios
- Contextual AI insights and recommendations
- Real-time PCAF compliance monitoring

### 📊 Advanced Analytics
- Portfolio performance metrics
- Risk distribution analysis
- Emissions tracking and reporting
- Data quality assessment

## Quick Start

### 1. Access the Demo
Navigate to `/financed-emissions/loan-data-pipeline` to access the demo interface.

### 2. Upload Loan Data
- Select your PCAF instrument (Auto Loans, CRE, or Project Finance)
- Upload CSV or JSON files with loan data
- System automatically processes and embeds data

### 3. Explore AI Features
- **Search**: Use natural language to find relevant loans
- **Analytics**: View comprehensive portfolio metrics
- **Insights**: Get AI-generated recommendations

## Data Format

### CSV Format Example (Auto Loans)
```csv
id,loanAmount,outstandingBalance,originationDate,pcafScore,make,model,year,fuelType,emissions
AUTO001,35000,28000,2023-06-15,2,Tesla,Model 3,2023,Electric,0.5
AUTO002,28000,22000,2023-08-20,3,Toyota,Prius,2023,Hybrid,2.1
```

### JSON Format Example
```json
[
  {
    "id": "AUTO001",
    "instrument": "auto_loans",
    "loanAmount": 35000,
    "outstandingBalance": 28000,
    "originationDate": "2023-06-15",
    "pcafScore": 2,
    "vehicleDetails": {
      "make": "Tesla",
      "model": "Model 3",
      "year": 2023,
      "fuelType": "Electric",
      "emissions": 0.5
    }
  }
]
```

## API Integration

### ChromaDB Setup
The system supports both mock and production ChromaDB integration:

```typescript
// Mock ChromaDB (for demo)
import { loanDataPipelineService } from './services/loan-data-pipeline-service';

// Production ChromaDB
import { productionLoanPipelineService } from './services/production-loan-pipeline-service';
```

### Environment Variables
```env
REACT_APP_CHROMA_URL=http://localhost:8000
REACT_APP_CHROMA_API_KEY=your_api_key_here
```

## Demo Features

### Upload Interface
- Drag & drop file upload
- Real-time processing feedback
- Comprehensive result summary
- Sample data generation

### AI Search
- Natural language queries
- Contextual loan matching
- Relevance scoring
- Automated insights

### Analytics Dashboard
- Portfolio overview metrics
- Risk distribution charts
- Instrument-specific analysis
- Top emitters identification

### AI Insights
- Automated risk assessment
- Compliance recommendations
- Opportunity identification
- Action item generation

## Technical Architecture

### Services
- `loan-data-pipeline-service.ts`: Core pipeline logic
- `chroma-api-service.ts`: ChromaDB API integration
- `production-loan-pipeline-service.ts`: Production ChromaDB bridge

### Components
- `LoanDataUploader.tsx`: Upload interface
- `LoanDataPipelineDemo.tsx`: Main demo page

### Data Flow
1. File Upload → Data Validation
2. Loan Processing → Document Generation
3. ChromaDB Embedding → Vector Storage
4. AI Analysis → Insight Generation

This system is ready for your demo and can be easily extended for production use with real ChromaDB integration.