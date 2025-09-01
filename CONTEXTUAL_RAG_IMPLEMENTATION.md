# Contextual RAG Implementation

## Overview

We've implemented a sophisticated contextual RAG (Retrieval-Augmented Generation) system that combines **Platform RAG** and **Client RAG** to provide portfolio-aware AI assistance for PCAF methodology and financed emissions management.

## Architecture

### Multi-RAG System
```
┌─────────────────┐    ┌─────────────────┐
│   PLATFORM RAG  │    │   CLIENT RAG    │
│                 │    │                 │
│ • PCAF Methodology │ │ • Portfolio Data │
│ • Regulations   │    │ • Loan Records   │
│ • Best Practices│    │ • Data Quality   │
│ • Calculations  │    │ • Custom Rules   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────────────────────────────┐
│        CONTEXTUAL AI ENGINE             │
│                                         │
│ • Query Analysis                        │
│ • Context Synthesis                     │
│ • Portfolio-Aware Responses             │
│ • Actionable Recommendations            │
└─────────────────────────────────────────┘
```

## Key Features

### 1. Portfolio-Aware Intelligence
- **Real-time Portfolio Analysis**: Automatically analyzes your uploaded loan data
- **Data Quality Assessment**: Identifies specific loans needing improvement
- **Contextual Examples**: Uses actual data from your portfolio in explanations
- **Prioritized Recommendations**: Focuses on highest-impact actions first

### 2. Methodology Grounding
- **PCAF Standard Compliance**: All advice follows official PCAF methodology
- **Regulatory Alignment**: Incorporates TCFD, EU Taxonomy, and other requirements
- **Best Practice Integration**: Leverages industry best practices and guidelines

### 3. Intelligent Query Processing
- **Intent Recognition**: Understands whether you're asking about methodology or your specific data
- **Context Switching**: Seamlessly combines platform knowledge with client data
- **Follow-up Generation**: Suggests relevant next questions based on your portfolio

## Implementation Components

### 1. Contextual RAG Service (`contextualRAGService.ts`)
```typescript
// Main service that orchestrates Platform + Client RAG
await contextualRAGService.processContextualQuery({
  query: "How can I improve my portfolio data quality?",
  includePortfolioContext: true,
  includeMethodologyContext: true,
  analysisType: 'portfolio'
});
```

**Key Functions:**
- `analyzeQuery()`: Determines if query needs portfolio context
- `getPortfolioContext()`: Fetches and analyzes current loan data
- `searchPlatformRAG()`: Queries PCAF methodology knowledge base
- `searchClientRAG()`: Generates portfolio-specific insights
- `synthesizeResponse()`: Combines both knowledge sources

### 2. Enhanced AI Chat Service (`aiService.ts`)
- **Improved Pattern Matching**: Better keyword recognition for PCAF topics
- **Comprehensive Responses**: Detailed answers for common questions
- **Dynamic Follow-ups**: Contextually relevant next questions

### 3. RAG Chatbot Component (`RAGChatbot.tsx`)
- **Contextual Integration**: Uses contextual RAG service first, falls back to basic AI
- **Portfolio Context**: Automatically includes portfolio data when relevant
- **Source Attribution**: Shows whether information comes from platform or client knowledge

### 4. Portfolio RAG Demo (`PortfolioRAGDemo.tsx`)
- **Interactive Explanation**: Shows how Platform + Client RAG work together
- **Example Queries**: Demonstrates portfolio-aware responses
- **Visual Architecture**: Helps users understand the system

## Example Interactions

### Portfolio-Specific Query
**User:** "How can I improve my portfolio data quality?"

**AI Response:**
```
Based on your portfolio of 2,847 loans with average PCAF score 2.8:

**Your Current Status:** ✅ Compliant (score ≤ 3.0)

**Improvement Opportunities:**
• 423 loans could move from Option 5→4 by adding vehicle specifications
• Focus on your 156 highest-value loans first for maximum impact
• Collecting make/model/year data would improve 67% of your portfolio

**PCAF Methodology:** Data quality improves by moving up the hierarchy...
```

**Sources:** Your Portfolio Analysis, PCAF Data Quality Guide, Motor Vehicle Methodology

### Methodology Query with Portfolio Context
**User:** "What are attribution factors?"

**AI Response:**
```
**Attribution Factors in PCAF:**
Attribution Factor = Outstanding Amount ÷ Asset Value

**In Your Portfolio:**
• Average attribution factor: 0.73
• 234 loans have attribution factors > 0.9 (high exposure)
• 89 loans missing asset values (using loan amount as proxy)

**Example from your data:**
Loan #LN-2024-1567: $28,000 outstanding on $35,000 vehicle
Attribution Factor = $28,000 ÷ $35,000 = 0.8 (80%)
```

## Navigation & Access

### 1. Dedicated RAG Chat Page
- **URL**: `/financed-emissions/rag-chat`
- **Features**: Full-featured chat interface with multiple agent types
- **Navigation**: Available in main sidebar as "AI Chat"

### 2. Embedded Chat in RAG Management
- **Location**: RAG Management page → "AI Chat" tab
- **Purpose**: Quick assistance while managing documents
- **Integration**: Seamless with document upload/search workflows

### 3. Multiple Chat Modes
- **General Assistant**: Broad PCAF questions and guidance
- **Methodology Expert**: Deep technical PCAF methodology
- **Portfolio Analyst**: Portfolio-specific analysis and recommendations
- **Compliance Advisor**: Regulatory requirements and reporting

## Technical Benefits

### 1. Intelligent Context Switching
- Automatically determines when to include portfolio data
- Seamlessly combines methodology knowledge with client-specific insights
- Provides fallback to basic AI service if contextual RAG fails

### 2. Performance Optimized
- Lazy loading of contextual RAG service
- Efficient portfolio data caching
- Minimal API calls through intelligent query analysis

### 3. Extensible Architecture
- Easy to add new knowledge sources
- Modular design allows for different RAG strategies
- Configurable context inclusion based on query type

## Future Enhancements

### 1. Real-time Learning
- Learn from user interactions to improve responses
- Adapt to client-specific terminology and preferences
- Build custom knowledge graphs for each client

### 2. Advanced Analytics
- Portfolio benchmarking against industry standards
- Predictive analytics for data quality improvements
- Automated compliance monitoring and alerts

### 3. Integration Expansion
- Connect with external data sources (vehicle databases, emission factors)
- Integration with client's existing systems
- Real-time data streaming for live portfolio updates

## Usage Guidelines

### For Best Results:
1. **Be Specific**: Ask about "my portfolio" or "our loans" for personalized insights
2. **Use Context**: Reference specific loan IDs or portfolio characteristics
3. **Follow Up**: Use suggested follow-up questions to dive deeper
4. **Combine Queries**: Ask both methodology and portfolio questions in sequence

### Example Effective Queries:
- "How can I improve data quality for my worst-performing loans?"
- "What vehicle data should I collect next for my portfolio?"
- "How does my portfolio's emission intensity compare to PCAF benchmarks?"
- "Which of my loans need attribution factor corrections?"

This implementation provides a powerful, context-aware AI assistant that truly understands both PCAF methodology and your specific portfolio characteristics, enabling more effective financed emissions management and PCAF compliance.