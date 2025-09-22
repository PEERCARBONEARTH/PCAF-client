# Frontend-Backend Integration Guide

This document outlines the comprehensive frontend-backend integration implemented for the Financed Emissions platform.

## Overview

The frontend has been enhanced with robust backend integration services that connect to the Node.js/Express backend API. The integration includes:

- **Real-time data synchronization** via WebSocket connections
- **Enhanced upload processing** with progress tracking
- **AI/RAG service integration** for intelligent insights
- **External service integration** (LMS, EPA API, Vehicle databases)
- **Comprehensive error handling** and user feedback

## Architecture

### Service Layer Architecture

```
Frontend Services
├── api.ts                    # Core API client and utilities
├── portfolioService.ts       # Portfolio data management
├── aiService.ts             # AI/RAG service integration
├── integrationService.ts    # External service integrations
├── enhancedUploadService.ts # Advanced upload processing
└── realTimeService.ts       # WebSocket real-time updates
```

### Key Components

1. **API Client (`api.ts`)**
   - Centralized HTTP client with authentication
   - Standardized error handling
   - Request/response type definitions

2. **Portfolio Service (`portfolioService.ts`)**
   - Portfolio data fetching and analytics
   - PCAF calculation integration
   - Data quality assessment

3. **AI Service (`aiService.ts`)**
   - RAG-powered insights and recommendations
   - Conversational AI chat interface
   - Context-aware analysis

4. **Integration Service (`integrationService.ts`)**
   - LMS synchronization
   - Emission factor management
   - Vehicle specification lookup
   - External service health monitoring

5. **Enhanced Upload Service (`enhancedUploadService.ts`)**
   - CSV validation and processing
   - Progress tracking with real-time updates
   - Batch processing with error handling

6. **Real-time Service (`realTimeService.ts`)**
   - WebSocket connection management
   - Event subscription system
   - Automatic reconnection with backoff

## Backend API Endpoints

### Core Loan Management
- `POST /api/loans/intake` - Single loan intake
- `POST /api/loans/bulk-intake` - Bulk loan processing
- `GET /api/loans/portfolio` - Portfolio data retrieval
- `GET /api/loans/{id}` - Individual loan details
- `PUT /api/loans/{id}` - Update loan data
- `DELETE /api/loans/{id}` - Delete loan

### Integration Endpoints
- `POST /api/integrations/lms/sync` - LMS synchronization
- `GET /api/integrations/lms/status` - LMS connection status
- `POST /api/integrations/lms/test-connection` - Test LMS connection
- `GET /api/integrations/emission-factors` - Get emission factors
- `POST /api/integrations/emission-factors/refresh` - Refresh factors
- `POST /api/integrations/vehicle-lookup` - Vehicle specification lookup
- `GET /api/integrations/external-services/status` - Service health check

### AI/RAG Endpoints
- `POST /api/ai-insights/analyze` - AI-powered analysis
- `POST /api/rag-recommendations/generate` - Generate recommendations
- `POST /api/ai-chat/message` - Conversational AI interface

### Batch Processing
- `POST /api/loans/batch-calculate` - Batch emissions calculation
- `GET /api/loans/batch-jobs/{id}` - Batch job status
- `POST /api/loans/batch-jobs/{id}/cancel` - Cancel batch job

## Real-time Features

### WebSocket Events

The system supports real-time updates through WebSocket connections:

```typescript
// Event types
type EventType = 
  | 'portfolio_update'
  | 'calculation_complete'
  | 'data_quality_alert'
  | 'sync_status'
  | 'ai_insight'
  | 'upload_progress'
  | 'batch_job_update';

// Subscribe to events
const unsubscribe = realTimeService.subscribe('portfolio_update', (event) => {
  // Handle portfolio updates
});
```

### Supported Events

1. **Portfolio Updates** - Real-time portfolio metric changes
2. **Calculation Complete** - PCAF calculation completion notifications
3. **Data Quality Alerts** - Automated data quality issue detection
4. **Sync Status** - LMS and external service sync progress
5. **AI Insights** - New AI recommendations and insights
6. **Upload Progress** - File upload and processing progress
7. **Batch Job Updates** - Batch processing status updates

## Enhanced Upload System

### Features

- **Pre-upload validation** with detailed error reporting
- **Progress tracking** with real-time updates
- **Batch processing** with configurable batch sizes
- **Error handling** with retry mechanisms
- **Upload history** tracking

### Usage Example

```typescript
import { enhancedUploadService } from '@/services/enhancedUploadService';

const uploadId = await enhancedUploadService.uploadCSVData(
  csvData,
  {
    batchSize: 50,
    onProgress: (progress) => {
      console.log(`Progress: ${progress.progress}%`);
    },
    onComplete: (result) => {
      console.log(`Upload complete: ${result.summary.successful} successful`);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    }
  }
);
```

## AI/RAG Integration

### Capabilities

1. **Portfolio Analysis** - Comprehensive AI-powered portfolio insights
2. **Data Quality Recommendations** - Intelligent suggestions for data improvement
3. **Compliance Assessment** - PCAF compliance checking with AI guidance
4. **Risk Analysis** - Climate risk assessment and mitigation strategies
5. **Conversational Interface** - Natural language queries about portfolio data

### Usage Example

```typescript
import { aiService } from '@/services/aiService';

// Get AI insights
const insights = await aiService.getAIInsights({
  query: 'Analyze my portfolio for PCAF compliance issues',
  context: { portfolioSummary, loans },
  agent: 'compliance'
});

// Chat with AI
const response = await aiService.chatWithAI(
  'How can I improve my data quality scores?',
  'advisory',
  portfolioContext
);
```

## Integration Dashboard

The `IntegrationDashboard` component provides:

- **Service Status Monitoring** - Real-time external service health
- **Sync History** - Historical synchronization records
- **API Usage Statistics** - Usage metrics and performance data
- **Quick Actions** - One-click operations for common tasks

## Error Handling

### Standardized Error Responses

All API responses follow a consistent error format:

```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id: string;
    validation_errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

### Error Handling Utilities

```typescript
import { handleAPIError, showAPIErrorToast } from '@/services/api';

try {
  await apiOperation();
} catch (error) {
  const message = handleAPIError(error);
  showAPIErrorToast(error);
}
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here

# AI Services
VITE_OPENAI_API_KEY=your_openai_key_here

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_LMS_INTEGRATION=true
```

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

## Testing Integration

### Manual Testing

1. **Upload Test** - Use the Upload page to test CSV processing
2. **Real-time Test** - Monitor WebSocket connections in browser dev tools
3. **AI Test** - Try the AI Insights page for RAG functionality
4. **Integration Test** - Check the Integration Dashboard for service status

### Automated Testing

```bash
# Run frontend tests
npm run test

# Run integration tests
npm run test:integration
```

## Performance Considerations

### Optimization Strategies

1. **Connection Pooling** - Reuse HTTP connections
2. **Request Batching** - Combine multiple API calls
3. **Caching** - Cache frequently accessed data
4. **Lazy Loading** - Load components on demand
5. **WebSocket Management** - Efficient event subscription

### Monitoring

- **Real-time Connection Status** - Monitor WebSocket health
- **API Response Times** - Track performance metrics
- **Error Rates** - Monitor failure rates
- **Upload Performance** - Track processing times

## Security

### Authentication

- **JWT Tokens** - Secure API authentication
- **Token Refresh** - Automatic token renewal
- **Role-based Access** - Permission-based feature access

### Data Protection

- **Input Validation** - Client and server-side validation
- **Error Sanitization** - Safe error message display
- **Secure WebSocket** - WSS for production environments

## Deployment

### Production Configuration

1. **Environment Variables** - Set production API URLs
2. **Build Optimization** - Enable production builds
3. **CDN Configuration** - Optimize asset delivery
4. **Monitoring Setup** - Configure error tracking

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Troubleshooting

### Common Issues

1. **Connection Errors** - Check API_BASE_URL configuration
2. **WebSocket Issues** - Verify WS_URL and firewall settings
3. **Upload Failures** - Check file format and size limits
4. **AI Service Errors** - Verify OpenAI API key configuration

### Debug Mode

Enable debug mode for detailed logging:

```bash
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## Future Enhancements

### Planned Features

1. **Offline Support** - Service worker implementation
2. **Advanced Caching** - Redis integration
3. **Streaming Uploads** - Large file support
4. **Enhanced AI** - More sophisticated RAG capabilities
5. **Mobile Optimization** - Responsive design improvements

### API Versioning

The system supports API versioning for backward compatibility:

```typescript
const apiClient = new APIClient('http://localhost:3001/api/v2');
```

This integration provides a robust, scalable foundation for the Financed Emissions platform with comprehensive backend connectivity, real-time features, and intelligent AI-powered insights.