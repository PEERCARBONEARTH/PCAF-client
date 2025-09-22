# PCAF AI-Powered Loan Data Pipeline - Master System Architecture

## Complete System Architecture Flowchart

```mermaid
graph TB
    %% User Interface Layer
    subgraph "User Interface Layer"
        UI1[Loan Data Uploader<br/>LoanDataUploader.tsx]
        UI2[Pipeline Demo Page<br/>loan-data-pipeline-demo.tsx]
        UI3[Narrative Insights Dashboard<br/>NarrativeInsightsDashboard.tsx]
        UI4[Pipeline Monitor<br/>PipelineMonitor.tsx]
    end

    %% Data Input Layer
    subgraph "Data Input & Validation Layer"
        INPUT1[File Upload<br/>CSV/JSON]
        INPUT2[PCAF Instrument Selection<br/>Auto Loans | CRE | Project Finance]
        INPUT3[Sample Data Generator<br/>sample-data-loader.ts]
        VALID1[Data Validation<br/>Schema & PCAF Compliance]
    end

    %% Core Processing Layer
    subgraph "Core Data Processing Pipeline"
        PROC1[Loan Data Pipeline Service<br/>loan-data-pipeline-service.ts]
        PROC2[Enhanced Data Pipeline<br/>enhanced-data-pipeline-service.ts]
        PROC3[Pipeline Integration Service<br/>pipeline-integration-service.ts]
        PROC4[Data Transformation<br/>Multi-Instrument Processing]
    end

    %% AI & Vector Database Layer
    subgraph "AI & Vector Database Layer"
        subgraph "Development Environment"
            CHROMA1[Mock ChromaDB Service<br/>chroma-db-service.ts]
        end
        
        subgraph "Production Environment"
            CHROMA2[ChromaDB API Service<br/>chroma-api-service.ts]
            CHROMA3[Production Pipeline Bridge<br/>production-loan-pipeline-service.ts]
        end
        
        EMBED1[Document Embedding<br/>Vector Generation]
        EMBED2[Collection Management<br/>Instrument-Specific Storage]
    end

    %% AI Analysis Engine
    subgraph "AI Analysis & Insights Engine"
        AI1[AI Narrative Builder<br/>ai-narrative-builder.ts]
        AI2[Context Quality Service<br/>narrative-context-quality-service.ts]
        AI3[Narrative Pipeline Integration<br/>narrative-pipeline-integration.ts]
        AI4[Semantic Search Engine<br/>Natural Language Queries]
    end

    %% Analytics & Reporting
    subgraph "Analytics & Reporting Layer"
        ANALYTICS1[Portfolio Analytics<br/>Risk Distribution]
        ANALYTICS2[PCAF Compliance Monitor<br/>Automated Scoring]
        ANALYTICS3[Performance Metrics<br/>Data Quality Assessment]
        ANALYTICS4[Actionable Insights<br/>AI Recommendations]
    end

    %% External Systems
    subgraph "External Systems"
        EXT1[ChromaDB Server<br/>Vector Database]
        EXT2[OpenAI API<br/>Embedding Generation]
        EXT3[File System<br/>Document Storage]
    end

    %% Data Flow Connections
    UI1 --> INPUT1
    UI1 --> INPUT2
    INPUT1 --> VALID1
    INPUT2 --> VALID1
    INPUT3 --> PROC1
    
    VALID1 --> PROC1
    PROC1 --> PROC2
    PROC2 --> PROC3
    PROC3 --> PROC4
    
    PROC4 --> CHROMA1
    PROC4 --> CHROMA3
    CHROMA3 --> CHROMA2
    CHROMA2 --> EXT1
    
    CHROMA1 --> EMBED1
    CHROMA2 --> EMBED1
    EMBED1 --> EMBED2
    EMBED2 --> AI4
    
    AI4 --> AI1
    AI1 --> AI2
    AI2 --> AI3
    AI3 --> ANALYTICS1
    
    ANALYTICS1 --> ANALYTICS2
    ANALYTICS2 --> ANALYTICS3
    ANALYTICS3 --> ANALYTICS4
    
    ANALYTICS4 --> UI2
    ANALYTICS4 --> UI3
    PROC3 --> UI4
    
    %% External API Connections
    EMBED1 -.-> EXT2
    CHROMA2 -.-> EXT1
    INPUT1 -.-> EXT3

    %% Styling
    classDef uiLayer fill:#e1f5fe
    classDef inputLayer fill:#f3e5f5
    classDef processLayer fill:#e8f5e8
    classDef aiLayer fill:#fff3e0
    classDef analyticsLayer fill:#fce4ec
    classDef externalLayer fill:#f5f5f5

    class UI1,UI2,UI3,UI4 uiLayer
    class INPUT1,INPUT2,INPUT3,VALID1 inputLayer
    class PROC1,PROC2,PROC3,PROC4 processLayer
    class CHROMA1,CHROMA2,CHROMA3,EMBED1,EMBED2,AI1,AI2,AI3,AI4 aiLayer
    class ANALYTICS1,ANALYTICS2,ANALYTICS3,ANALYTICS4 analyticsLayer
    class EXT1,EXT2,EXT3 externalLayer
```

## Detailed Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI as Upload Interface
    participant Pipeline as Data Pipeline
    participant ChromaDB as Vector Database
    participant AI as AI Engine
    participant Dashboard as Analytics Dashboard

    User->>UI: Select PCAF Instrument
    User->>UI: Upload CSV/JSON File
    
    UI->>Pipeline: Validate & Parse Data
    Pipeline->>Pipeline: Transform Loan Records
    Pipeline->>Pipeline: Extract Metadata
    
    Pipeline->>ChromaDB: Generate Embeddings
    ChromaDB->>ChromaDB: Store Vector Documents
    ChromaDB->>ChromaDB: Create Collections
    
    Pipeline->>AI: Trigger Analysis
    AI->>ChromaDB: Semantic Search Query
    ChromaDB-->>AI: Return Similar Documents
    
    AI->>AI: Generate Narratives
    AI->>AI: Validate Context Quality
    AI->>AI: Create Insights
    
    AI->>Dashboard: Update Analytics
    Dashboard->>Dashboard: Calculate Metrics
    Dashboard->>Dashboard: Assess Compliance
    
    Dashboard-->>User: Display Results
    Dashboard-->>User: Show Recommendations
```

## Service Architecture & Dependencies

```mermaid
graph LR
    subgraph "Frontend Components"
        A[LoanDataUploader] --> B[loan-data-pipeline-demo]
        B --> C[NarrativeInsightsDashboard]
    end
    
    subgraph "Core Services"
        D[loan-data-pipeline-service] --> E[pipeline-integration-service]
        E --> F[enhanced-data-pipeline-service]
        F --> G[sample-data-loader]
    end
    
    subgraph "AI Services"
        H[ai-narrative-builder] --> I[narrative-context-quality-service]
        I --> J[narrative-pipeline-integration]
    end
    
    subgraph "Database Services"
        K[chroma-db-service] --> L[chroma-api-service]
        L --> M[production-loan-pipeline-service]
    end
    
    %% Dependencies
    A --> D
    B --> D
    B --> E
    C --> J
    
    D --> K
    E --> K
    J --> E
    H --> K
    
    M --> L
    
    %% External Dependencies
    L -.-> N[ChromaDB Server]
    H -.-> O[OpenAI API]
```

## PCAF Instrument Processing Flow

```mermaid
flowchart TD
    START([User Uploads Loan Data]) --> SELECT{Select PCAF Instrument}
    
    SELECT -->|Auto Loans| AUTO[Process Vehicle Data<br/>- Make/Model/Year<br/>- Fuel Type<br/>- Emissions Data]
    SELECT -->|Commercial Real Estate| CRE[Process Property Data<br/>- Property Type<br/>- Square Footage<br/>- Energy Rating]
    SELECT -->|Project Finance| PROJ[Process Project Data<br/>- Project Type<br/>- Sector/Location<br/>- Expected Emissions]
    
    AUTO --> VALIDATE[PCAF Compliance Validation<br/>Data Quality Scoring]
    CRE --> VALIDATE
    PROJ --> VALIDATE
    
    VALIDATE --> TRANSFORM[Data Transformation<br/>Standardization & Enrichment]
    TRANSFORM --> EMBED[Generate Embeddings<br/>ChromaDB Vectorization]
    
    EMBED --> STORE[Store in Collections<br/>Instrument-Specific Storage]
    STORE --> ANALYZE[AI Analysis<br/>Generate Insights]
    
    ANALYZE --> INSIGHTS[Present Results<br/>- Analytics Dashboard<br/>- Risk Assessment<br/>- Recommendations]
    
    INSIGHTS --> END([Complete])
```

## Real-time Processing Pipeline

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Uploading : File Selected
    Uploading --> Validating : File Parsed
    Validating --> Processing : Validation Passed
    Validating --> Error : Validation Failed
    
    Processing --> Embedding : Data Transformed
    Embedding --> Storing : Vectors Generated
    Storing --> Analyzing : Documents Stored
    
    Analyzing --> Generating : Analysis Complete
    Generating --> Complete : Insights Generated
    
    Complete --> Idle : Reset for New Upload
    Error --> Idle : User Retry
    
    state Processing {
        [*] --> ParseData
        ParseData --> TransformLoans
        TransformLoans --> ExtractMetadata
        ExtractMetadata --> [*]
    }
    
    state Analyzing {
        [*] --> SemanticSearch
        SemanticSearch --> GenerateNarratives
        GenerateNarratives --> ValidateQuality
        ValidateQuality --> [*]
    }
```

## System Integration Points

```mermaid
C4Context
    title PCAF Loan Data Pipeline - System Context
    
    Person(user, "Bank User", "Uploads loan data and views insights")
    
    System(pcaf, "PCAF Pipeline System", "AI-powered loan data processing and analysis")
    
    System_Ext(chromadb, "ChromaDB", "Vector database for semantic search")
    System_Ext(openai, "OpenAI API", "Embedding generation service")
    System_Ext(filesystem, "File System", "Document and data storage")
    
    Rel(user, pcaf, "Uploads loan data, views analytics")
    Rel(pcaf, chromadb, "Stores vectors, performs searches")
    Rel(pcaf, openai, "Generates embeddings")
    Rel(pcaf, filesystem, "Reads/writes files")
```

## Key Features Summary

### 🎯 **Multi-Instrument Support**
- Auto Loans with vehicle emissions tracking
- Commercial Real Estate with energy metrics
- Project Finance with infrastructure details

### 🧠 **AI-Powered Analysis**
- Automatic document embedding and vectorization
- Semantic search across loan portfolios
- Context-aware insight generation
- Quality validation and scoring

### 📊 **Real-time Analytics**
- PCAF compliance monitoring
- Risk distribution analysis
- Performance metrics tracking
- Actionable recommendations

### 🔄 **Scalable Architecture**
- Development and production environments
- Batch and real-time processing
- Horizontal scaling support
- API-first design

This architecture supports both demo and production deployments, with seamless switching between mock and real ChromaDB integration for development and production environments.