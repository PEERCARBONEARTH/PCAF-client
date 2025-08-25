# PCAF AI RAG System Architecture & Agent Framework

## Overview
The PCAF platform implements a sophisticated AI-powered Retrieval-Augmented Generation (RAG) system with multiple specialized agents for different aspects of financed emissions analysis, compliance, and portfolio management.

## System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PCAF AI RAG SYSTEM ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USER INPUT    │    │  DOCUMENT MGMT  │    │  DATA SOURCES   │
│                 │    │                 │    │                 │
│ • Chat Queries  │    │ • PCAF Docs     │    │ • Loan Data     │
│ • Analysis Req  │    │ • Regulations   │    │ • Portfolio     │
│ • Insights Req  │    │ • Best Practice │    │ • Vehicle Data  │
│ • Recommendations│   │ • Methodology   │    │ • Emissions     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AGENT ORCHESTRATOR                                   │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │  CHAT AGENT     │  │ INSIGHTS AGENT  │  │   RAG AGENT     │                │
│  │                 │  │                 │  │                 │                │
│  │ • Conversational│  │ • Portfolio     │  │ • Recommendations│               │
│  │ • Context Aware │  │   Analysis      │  │ • Data Quality  │                │
│  │ • Multi-turn    │  │ • Risk Assessment│ │ • Emission      │                │
│  │ • PCAF Expert   │  │ • Compliance    │  │   Reduction     │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          KNOWLEDGE RETRIEVAL LAYER                              │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ PLATFORM RAG    │  │  CLIENT RAG     │  │ METHODOLOGY RAG │                │
│  │                 │  │                 │  │                 │                │
│  │ • System Docs   │  │ • Client Data   │  │ • PCAF Standard │                │
│  │ • Best Practices│  │ • Portfolio     │  │ • Calculations  │                │
│  │ • Procedures    │  │ • Loan History  │  │ • Compliance    │                │
│  │ • Templates     │  │ • Custom Rules  │  │ • Regulations   │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VECTOR DATABASE LAYER                                 │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │ PCAF_METHODOLOGY│  │   LOAN_DATA     │  │  REGULATIONS    │                │
│  │                 │  │                 │  │                 │                │
│  │ • Embeddings    │  │ • Embeddings    │  │ • Embeddings    │                │
│  │ • Metadata      │  │ • Metadata      │  │ • Metadata      │                │
│  │ • Versioning    │  │ • Relationships │  │ • Updates       │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
│                                                                                 │
│  ┌─────────────────┐                      ┌─────────────────┐                │
│  │PORTFOLIO_DOCS   │                      │ GLOBAL_SEARCH   │                │
│  │                 │                      │                 │                │
│  │ • Embeddings    │                      │ • Cross-collection│               │
│  │ • Metadata      │                      │ • Similarity    │                │
│  │ • Context       │                      │ • Ranking       │                │
│  └─────────────────┘                      └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AI FOUNDATION                                      │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │   OPENAI GPT    │  │  EMBEDDINGS     │  │  RATE LIMITING  │                │
│  │                 │  │                 │  │                 │                │
│  │ • GPT-4 Turbo   │  │ • text-embed-3  │  │ • 10k req/min   │                │
│  │ • Context Aware │  │ • 1536 dims     │  │ • Circuit Break │                │
│  │ • Temperature   │  │ • Batch Process │  │ • Error Handle  │                │
│  │   Control       │  │ • Similarity    │  │ • Retry Logic   │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Agent System Architecture

### 1. Chat Agent (AIChatService)
**Purpose**: Conversational AI for PCAF methodology questions and general assistance

**Master Prompt Templates**:
```typescript
const CHAT_AGENT_PROMPTS = {
  general: `You are a helpful PCAF and emissions finance expert. Provide clear, accurate answers about financed emissions, PCAF methodology, and portfolio management.`,
  
  portfolio_analysis: `You are a portfolio analysis expert specializing in PCAF financed emissions. Analyze portfolio data and provide insights about emissions, data quality, and compliance.`,
  
  loan_specific: `You are a loan analysis expert. Provide detailed insights about individual loans, their emissions profiles, and improvement opportunities.`,
  
  methodology: `You are a PCAF methodology expert. Explain PCAF concepts, calculation methods, and compliance requirements with precision and clarity.`,
  
  compliance: `You are a PCAF compliance expert. Help with regulatory requirements, disclosure standards, and compliance best practices.`
};
```

**Key Features**:
- Multi-turn conversation with context retention
- Session management (24-hour timeout)
- Context-aware responses based on conversation type
- Follow-up question generation
- Confidence scoring
- Source attribution

### 2. Insights Agent (AIInsightsService)
**Purpose**: Deep portfolio analysis, risk assessment, and compliance checking

**Master Prompt Templates**:
```typescript
const INSIGHTS_AGENT_PROMPTS = {
  portfolio_analysis: `You are a PCAF compliance and emissions analysis expert. Provide detailed, actionable insights based on loan portfolio data and PCAF methodology.`,
  
  risk_assessment: `You are a portfolio risk assessment expert for loan portfolios. Provide specific, actionable risk recommendations for {category} risk including risk factors, mitigation strategies, and monitoring recommendations.`,
  
  compliance_check: `You are a PCAF compliance auditor. Assess portfolio compliance with PCAF standards and provide detailed findings.`,
  
  data_quality: `You are a PCAF data quality expert. Provide specific, actionable recommendations for improving loan data quality scores.`
};
```

**Analysis Types**:
- **Comprehensive**: Full portfolio assessment
- **Emissions**: Financed emissions analysis
- **Risk**: Multi-category risk assessment
- **Data Quality**: PCAF data quality scoring
- **Compliance**: PCAF standard compliance

### 3. RAG Recommendation Agent (RAGRecommendationService)
**Purpose**: Generate specific, actionable recommendations using RAG-enhanced AI

**Master Prompt Templates**:
```typescript
const RAG_AGENT_PROMPTS = {
  data_quality: `You are a PCAF data quality expert. Provide specific, actionable recommendations for improving loan data quality. Return valid JSON only.`,
  
  emission_reduction: `You are an emissions reduction expert specializing in financed emissions and PCAF methodology. Provide specific, actionable recommendations for reducing portfolio emissions.`,
  
  risk_mitigation: `You are a {category} risk assessment expert for loan portfolios. Provide specific, actionable risk recommendations. Return valid JSON only.`,
  
  reporting: `You are a {reportType} reporting expert for PCAF compliance. Provide specific, actionable reporting recommendations. Return valid JSON only.`
};
```

**Recommendation Categories**:
- **Data Quality**: PCAF option improvements, missing data identification
- **Emission Reduction**: Portfolio optimization strategies
- **Risk Assessment**: Credit, operational, compliance, market risks
- **Report Generation**: Compliance, emissions, executive reports

## RAG Knowledge Base Structure

### 1. Platform RAG
**Purpose**: Train the system on platform capabilities and procedures

**Collections**:
- `platform_documentation`: System features, workflows, procedures
- `best_practices`: Industry best practices, implementation guides
- `templates`: Report templates, calculation templates
- `troubleshooting`: Common issues and solutions

**Content Types**:
- User manuals and guides
- API documentation
- Workflow procedures
- System capabilities
- Feature explanations

### 2. Client RAG
**Purpose**: Understand client-specific data, rules, and context

**Collections**:
- `client_portfolio`: Portfolio-specific documents and analysis
- `client_policies`: Client-specific policies and procedures
- `historical_analysis`: Past analysis results and insights
- `custom_rules`: Client-defined calculation rules and exceptions

**Content Types**:
- Portfolio summaries and analysis
- Client-specific methodologies
- Historical performance data
- Custom business rules
- Regulatory requirements specific to client

### 3. Methodology RAG
**Purpose**: Deep knowledge of PCAF standards and calculations

**Collections**:
- `pcaf_methodology`: Official PCAF standard documents
- `regulations`: Regulatory requirements and updates
- `calculation_guides`: Step-by-step calculation procedures
- `compliance_standards`: Compliance requirements and checklists

**Content Types**:
- PCAF Global GHG Accounting Standard
- Regulatory guidance documents
- Calculation methodologies
- Data quality assessment guides
- Compliance checklists

## Agent Interaction Flow

### 1. Query Processing Flow
```
User Query → Agent Orchestrator → Context Analysis → Agent Selection
     ↓
Agent Processing → RAG Retrieval → Context Enhancement → AI Generation
     ↓
Response Generation → Source Attribution → Confidence Scoring → User Response
```

### 2. Multi-Agent Collaboration
```
Chat Agent ←→ Insights Agent ←→ RAG Agent
     ↓              ↓              ↓
Platform RAG ←→ Client RAG ←→ Methodology RAG
     ↓              ↓              ↓
Vector Database ←→ Embeddings ←→ Similarity Search
```

## Key Technical Features

### 1. Embedding Strategy
- **Model**: OpenAI text-embedding-3-small (1536 dimensions)
- **Chunking**: 1000 tokens with 200 token overlap
- **Metadata**: Source, type, category, date, version
- **Batch Processing**: Efficient bulk embedding generation

### 2. Similarity Search
- **Threshold**: 0.6-0.8 depending on context
- **Ranking**: Cosine similarity with metadata boosting
- **Filtering**: Type, category, date range filters
- **Cross-Collection**: Global search across all collections

### 3. Context Management
- **Session Persistence**: 24-hour chat sessions
- **Context Windows**: Optimized for GPT-4 context limits
- **Memory Management**: Last 20 messages retained
- **Context Types**: General, portfolio, loan, methodology, compliance

### 4. Quality Assurance
- **Confidence Scoring**: Multi-factor confidence assessment
- **Source Attribution**: Full traceability to source documents
- **Hallucination Prevention**: RAG-grounded responses only
- **Response Validation**: Structured output validation

## Agent Specialization Matrix

| Agent Type | Primary Use Case | RAG Sources | Temperature | Max Tokens |
|------------|------------------|-------------|-------------|------------|
| Chat Agent | Q&A, Explanations | All Collections | 0.2-0.7 | 2000 |
| Insights Agent | Analysis, Assessment | Methodology + Client | 0.3 | 3000 |
| RAG Agent | Recommendations | Platform + Methodology | 0.2-0.3 | 1500-2000 |

## Implementation Status

### ✅ Implemented Features
- Multi-agent architecture with specialized agents
- Vector database with ChromaDB integration
- OpenAI GPT-4 and embedding integration
- RAG retrieval with similarity search
- Context-aware conversation management
- Structured recommendation generation
- Rate limiting and error handling

### 🔄 Platform RAG Training
- System documentation embedding
- Best practices knowledge base
- Template and procedure documentation
- Troubleshooting guides

### 🔄 Client RAG Training
- Portfolio-specific document processing
- Historical analysis embedding
- Client policy integration
- Custom rule documentation

### ✅ Methodology RAG Training
- PCAF standard documentation
- Regulatory requirement embedding
- Calculation methodology guides
- Compliance standard integration

## Usage Examples

### Chat Agent Usage
```typescript
// Create chat session
const sessionId = await aiChatService.createChatSession(userId, {
  type: 'methodology',
  focusArea: 'data_quality'
});

// Process message
const response = await aiChatService.processMessage({
  sessionId,
  message: "How do I improve my PCAF data quality score from 2 to 4?",
  context: { type: 'methodology' }
});
```

### Insights Agent Usage
```typescript
// Portfolio analysis
const analysis = await aiInsightsService.analyzePortfolio({
  loans: portfolioLoans,
  analysisType: 'comprehensive',
  focusAreas: ['emissions', 'data_quality']
});

// Compliance check
const compliance = await aiInsightsService.performComplianceCheck(portfolioLoans);
```

### RAG Agent Usage
```typescript
// Data quality recommendations
const recommendations = await ragRecommendationService.generateDataQualityRecommendations(
  loans,
  { type: 'data_quality', targetEntity: 'portfolio', priority: 'high' }
);

// Emission reduction strategies
const strategies = await ragRecommendationService.generateEmissionReductionRecommendations(
  loans,
  { type: 'emission_reduction', targetEntity: 'portfolio', timeframe: 'short_term' }
);
```

This architecture provides a comprehensive AI-powered system that combines the strengths of multiple specialized agents with a robust RAG knowledge base to deliver accurate, contextual, and actionable insights for PCAF compliance and financed emissions management.