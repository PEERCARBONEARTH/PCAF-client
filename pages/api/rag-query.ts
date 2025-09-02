import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseFormatter } from '../../src/services/responseFormatter';
import { RAGResponse, ResponseType } from '../../src/types/ragTypes';
import { type } from 'os';
import { type } from 'os';

interface ChromaDBConfig {
  apiKey: string;
  tenant: string;
  database: string;
  baseURL: string;
  collectionName: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RAGResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, portfolioContext } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const ragResponse = await processRAGQuery(query, portfolioContext);
    res.status(200).json(ragResponse);
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function processRAGQuery(query: string, portfolioContext?: any): Promise<RAGResponse> {
  const chromaDBConfig: ChromaDBConfig = {
    apiKey: process.env.CHROMA_API_KEY || '',
    tenant: process.env.CHROMA_TENANT || '',
    database: process.env.CHROMA_DATABASE || '',
    baseURL: 'https://api.trychroma.com',
    collectionName: 'pcaf_calculation_optimized'
  };

  // 1. Classify the query to determine optimal response structure
  const classification = ResponseFormatter.classifyQuery(query);
  let rawResponse = '';
  let responseType: ResponseType = 'general';
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let sources: string[] = [];

  try {
    // 2. Try ChromaDB search first
    console.log('🔍 Attempting ChromaDB search for query:', query);
    console.log('📋 ChromaDB Config:', {
      hasApiKey: !!chromaDBConfig.apiKey,
      hasTenant: !!chromaDBConfig.tenant,
      hasDatabase: !!chromaDBConfig.database,
      apiKeyPrefix: chromaDBConfig.apiKey?.substring(0, 10) + '...'
    });
    
    const chromaResults = await searchChromaDB(query, chromaDBConfig);
    
    if (chromaResults && chromaResults.length > 0) {
      const bestMatch = chromaResults[0];
      console.log('✅ ChromaDB results found:', {
        resultCount: chromaResults.length,
        bestMatchScore: bestMatch.relevance_score,
        questionId: bestMatch.metadata?.question_id
      });
      
      if (bestMatch.relevance_score > 0.1) {
        console.log('🎯 Using ChromaDB result (score > 0.1)');
        rawResponse = formatChromaDBResponse(bestMatch, chromaResults);
        confidence = getConfidenceFromRelevance(bestMatch.relevance_score);
        sources = extractSources(bestMatch);
        responseType = determineResponseType(bestMatch.metadata);
        
        // Enhance with portfolio context if needed
        if (portfolioContext && needsPortfolioContext(query.toLowerCase())) {
          const portfolioEnhancement = enhanceWithPortfolioData('chromadb_result', portfolioContext);
          rawResponse = combineResponses(rawResponse, portfolioEnhancement);
          responseType = 'portfolio_analysis';
        }
        
        // 3. Apply structured formatting
        return ResponseFormatter.formatResponse(rawResponse, classification, responseType, portfolioContext);
      } else {
        console.log('⚠️ ChromaDB score too low:', bestMatch.relevance_score);
      }
    } else {
      console.log('❌ No ChromaDB results found');
    }
  } catch (error) {
    console.error('💥 ChromaDB search failed:', error.message);
    console.warn('Falling back to static responses');
  }

  // 4. Fallback to surgical responses
  console.log('🔄 Trying surgical response matching...');
  const surgicalMatch = findSurgicalMatch(query.toLowerCase());
  if (surgicalMatch) {
    console.log('✅ Found surgical match:', surgicalMatch.responseKey);
    rawResponse = surgicalMatch.response;
    confidence = surgicalMatch.confidence as 'high' | 'medium' | 'low';
    sources = surgicalMatch.sources;
    responseType = mapSurgicalResponseType(surgicalMatch.responseKey);

    if (portfolioContext && needsPortfolioContext(query.toLowerCase())) {
      const portfolioEnhancement = enhanceWithPortfolioData(surgicalMatch.responseKey, portfolioContext);
      rawResponse = combineResponses(rawResponse, portfolioEnhancement);
      responseType = 'portfolio_analysis';
    }

    // Apply structured formatting
    return ResponseFormatter.formatResponse(rawResponse, classification, responseType, portfolioContext);
  } else {
    console.log('❌ No surgical match found for query patterns');
  }

  // 5. Final fallback with structured formatting
  console.log('🔄 Using final fallback response');
  const fallbackResponse = generateMethodologyFallback(query);
  return ResponseFormatter.formatResponse(
    fallbackResponse.response, 
    classification, 
    'methodology', 
    portfolioContext
  );
}

async function searchChromaDB(query: string, config: ChromaDBConfig): Promise<any[]> {
  if (!config.apiKey || !config.tenant || !config.database) {
    throw new Error('ChromaDB configuration missing');
  }

  // Get collection ID
  const collectionId = await getCollectionId(config);
  
  // Generate embedding
  const queryEmbedding = await generateQueryEmbedding(query);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
    'X-Chroma-Token': config.apiKey,
    'X-Chroma-Tenant': config.tenant,
    'X-Chroma-Database': config.database
  };

  const searchBody = {
    query_embeddings: [queryEmbedding],
    n_results: 3,
    include: ['documents', 'metadatas', 'distances']
  };

  const response = await fetch(
    `${config.baseURL}/api/v2/tenants/${config.tenant}/databases/${config.database}/collections/${collectionId}/query`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(searchBody)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ChromaDB search failed: ${response.status} ${errorText}`);
  }

  const results = await response.json();
  
  const formattedResults = [];
  if (results.documents && results.documents[0]) {
    for (let i = 0; i < results.documents[0].length; i++) {
      const document = results.documents[0][i];
      const metadata = results.metadatas[0][i];
      const distance = results.distances[0][i];
      
      formattedResults.push({
        id: metadata.question_id || `result_${i}`,
        document: document,
        metadata: metadata,
        distance: distance,
        relevance_score: Math.max(0, 1 - distance)
      });
    }
  }

  return formattedResults;
}

async function getCollectionId(config: ChromaDBConfig): Promise<string> {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
    'X-Chroma-Token': config.apiKey,
    'X-Chroma-Tenant': config.tenant,
    'X-Chroma-Database': config.database
  };

  const response = await fetch(
    `${config.baseURL}/api/v2/tenants/${config.tenant}/databases/${config.database}/collections/${config.collectionName}`,
    {
      method: 'GET',
      headers
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get collection info: ${response.status} ${response.statusText}`);
  }

  const collectionInfo = await response.json();
  return collectionInfo.id;
}

async function generateQueryEmbedding(query: string): Promise<number[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: query,
      model: 'text-embedding-3-small'
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  return result.data[0].embedding;
}/
/ Helper functions for response formatting and matching
function formatChromaDBResponse(bestMatch: any, allResults: any[]): string {
  const metadata = bestMatch.metadata;
  const question = metadata.question || 'PCAF Question';
  const answer = metadata.answer || bestMatch.document;
  
  let response = `**${question}**\n\n${answer}`;
  
  if (allResults.length > 1) {
    response += '\n\n**Related Questions:**\n';
    allResults.slice(1, 3).forEach((result, index) => {
      const relatedQuestion = result.metadata.question || `Related question ${index + 1}`;
      response += `• ${relatedQuestion}\n`;
    });
  }
  
  return response;
}

function getConfidenceFromRelevance(relevanceScore: number): 'high' | 'medium' | 'low' {
  if (relevanceScore > 0.7) return 'high';
  if (relevanceScore > 0.4) return 'medium';
  return 'low';
}

function extractSources(result: any): string[] {
  const metadata = result.metadata;
  const sources = [];
  
  if (metadata.sources) {
    sources.push(...metadata.sources);
  } else {
    sources.push('PCAF Global Standard', 'Motor Vehicle Methodology');
  }
  
  if (metadata.category) {
    sources.push(`Category: ${metadata.category}`);
  }
  
  return sources;
}

function generateFollowUpFromChroma(result: any): string[] {
  const metadata = result.metadata;
  
  if (metadata.followUp && Array.isArray(metadata.followUp)) {
    return metadata.followUp.slice(0, 3);
  }
  
  const category = metadata.category || '';
  if (category.includes('calculation')) {
    return [
      'How do I validate this calculation?',
      'What data do I need for this?',
      'What are common implementation challenges?'
    ];
  } else if (category.includes('compliance')) {
    return [
      'What documentation is required?',
      'How do regulators examine this?',
      'What are the penalties for non-compliance?'
    ];
  } else {
    return [
      'Can you provide more details?',
      'What are the implementation steps?',
      'How does this relate to my portfolio?'
    ];
  }
}

// Static surgical responses with comprehensive coverage
const SURGICAL_RESPONSES = {
  'pcaf_options': {
    confidence: 'high',
    response: `**PCAF Data Quality Options for Motor Vehicles**

**Option 1: Real fuel consumption data** (Score: 1)
• Requirements: Actual fuel consumption records, distance traveled
• Source: Telematics, fuel cards, fleet management systems
• Accuracy: Highest possible

**Option 2: Estimated fuel consumption from mileage** (Score: 2)
• Requirements: Annual mileage + vehicle fuel efficiency rating
• Source: Odometer readings + manufacturer specifications
• Accuracy: High

**Option 3: Vehicle specifications + average mileage** (Score: 3)
• Requirements: Make, model, year + regional average mileage
• Source: Vehicle registration + statistical averages
• Accuracy: Medium (PCAF compliance threshold)

**Option 4: Vehicle type + average factors** (Score: 4)
• Requirements: Vehicle classification (car/truck/SUV)
• Source: Basic loan documentation
• Accuracy: Low-Medium

**Option 5: Asset class average** (Score: 5)
• Requirements: Outstanding loan amount only
• Source: Loan system data
• Accuracy: Lowest

**Compliance Target:** Portfolio weighted average ≤ 3.0`,
    sources: ['PCAF Global Standard - Motor Vehicle Methodology'],
    followUp: [
      'How do I move from Option 5 to Option 4?',
      'What data do I need for Option 3?',
      'How do I calculate my weighted score?'
    ]
  },
  
  'attribution_factor': {
    confidence: 'high',
    response: `**Attribution Factor Calculation**

**Formula:** Outstanding Amount ÷ Asset Value

**Example:**
• Loan: $25,000 outstanding
• Vehicle value: $40,000
• Attribution Factor = $25,000 ÷ $40,000 = 0.625 (62.5%)

**Key Points:**
• Use current outstanding balance, not original loan amount
• Asset value should be current market value when possible
• If asset value unknown, use outstanding amount (attribution = 1.0)
• For leases, use lease liability as outstanding amount

**Common Scenarios:**
• Outstanding > Asset Value: Use actual ratio (may exceed 1.0)
• Total loss vehicle: Attribution factor becomes 0
• Refinanced loan: Use new outstanding amount`,
    sources: ['PCAF Global Standard - Attribution Methodology'],
    followUp: [
      'How do I get accurate vehicle valuations?',
      'What if outstanding exceeds asset value?',
      'How do I handle lease vs loan products?'
    ]
  },
  
  'financed_emissions': {
    confidence: 'high',
    response: `**Financed Emissions Calculation**

**Formula:** Attribution Factor × Annual Vehicle Emissions

**Step-by-Step:**
1. **Calculate Attribution Factor**
   Outstanding Amount ÷ Asset Value

2. **Calculate Annual Vehicle Emissions**
   Annual Mileage × Emission Factor (kg CO₂e/km)

3. **Calculate Financed Emissions**
   Attribution Factor × Annual Vehicle Emissions

**Example:**
• Attribution Factor: 0.75 (75%)
• Annual mileage: 15,000 km
• Emission factor: 0.2 kg CO₂e/km
• Vehicle emissions: 15,000 × 0.2 = 3,000 kg CO₂e
• **Financed emissions: 0.75 × 3,000 = 2,250 kg CO₂e**

**Units:** Always express in kg CO₂e or tCO₂e (tonnes)`,
    sources: ['PCAF Global Standard - Calculation Methodology'],
    followUp: [
      'What emission factors should I use?',
      'How do I estimate annual mileage?',
      'What about electric vehicles?'
    ]
  },
  
  'compliance_requirements': {
    confidence: 'high',
    response: `**PCAF Compliance Requirements for Motor Vehicles**

**Primary Requirement:**
Portfolio weighted data quality score ≤ 3.0

**Calculation:**
WDQS = Σ(Outstanding Amount × Data Quality Score) ÷ Total Outstanding

**Example:**
• $50M at Option 2 (score 2): $50M × 2 = $100M
• $30M at Option 4 (score 4): $30M × 4 = $120M
• Total: $80M portfolio
• WDQS = ($100M + $120M) ÷ $80M = 2.75 ✅ Compliant

**Additional Requirements:**
• Methodology disclosure and documentation
• Annual recalculation and reporting
• Data quality improvement plan if WDQS > 3.0
• Scope 3 Category 15 reporting under TCFD

**Documentation Needed:**
• Data sources and collection methods
• Calculation procedures and assumptions
• Quality assurance processes
• Improvement initiatives and timelines`,
    sources: ['PCAF Global Standard - Compliance Requirements'],
    followUp: [
      'How do I calculate my current WDQS?',
      'What if my score exceeds 3.0?',
      'What documentation do I need for audit?'
    ]
  },
  
  'electric_vehicles': {
    confidence: 'high',
    response: `**Electric Vehicle PCAF Calculations**

**Key Differences:**
• Zero direct emissions (no tailpipe emissions)
• Emissions come from electricity generation
• Use grid emission factors by region

**Calculation Steps:**
1. **Energy Consumption:** kWh per km driven
2. **Grid Emission Factor:** kg CO₂e per kWh (by region)
3. **Annual Emissions:** Annual km × kWh/km × Grid Factor

**Example:**
• Annual mileage: 15,000 km
• EV efficiency: 0.2 kWh/km
• Grid factor (US avg): 0.4 kg CO₂e/kWh
• Annual emissions: 15,000 × 0.2 × 0.4 = 1,200 kg CO₂e

**Data Quality Options:**
• Option 1: Actual charging data + grid factors
• Option 2: Vehicle efficiency + mileage + grid factors
• Option 3: Vehicle specs + average mileage + grid factors`,
    sources: ['PCAF Global Standard - Electric Vehicle Methodology'],
    followUp: [
      'Where do I find grid emission factors?',
      'How do I handle renewable energy charging?',
      'What about plug-in hybrids?'
    ]
  }
};

const QUESTION_PATTERNS = [
  {
    patterns: ['pcaf options', 'data quality options', '5 options', 'option 1', 'option 2', 'option 3', 'option 4', 'option 5'],
    responseKey: 'pcaf_options',
    intent: 'methodology'
  },
  {
    patterns: ['attribution factor', 'calculate attribution', 'outstanding amount', 'asset value'],
    responseKey: 'attribution_factor',
    intent: 'calculation'
  },
  {
    patterns: ['financed emissions', 'calculate emissions', 'emission calculation', 'annual emissions'],
    responseKey: 'financed_emissions',
    intent: 'calculation'
  },
  {
    patterns: ['compliance', 'pcaf compliant', 'weighted score', 'wdqs', 'score 3.0'],
    responseKey: 'compliance_requirements',
    intent: 'compliance'
  },
  {
    patterns: ['electric vehicle', 'ev', 'electric car', 'zero emission', 'grid factor'],
    responseKey: 'electric_vehicles',
    intent: 'vehicle_specific'
  }
];

function findSurgicalMatch(query: string): any {
  for (const pattern of QUESTION_PATTERNS) {
    if (pattern.patterns.some(p => query.includes(p))) {
      return {
        ...SURGICAL_RESPONSES[pattern.responseKey as keyof typeof SURGICAL_RESPONSES],
        responseKey: pattern.responseKey,
        intent: pattern.intent
      };
    }
  }
  return null;
}

function needsPortfolioContext(query: string): boolean {
  const portfolioIndicators = [
    'my portfolio', 'our portfolio', 'my loans', 'our loans',
    'current score', 'my score', 'my data quality'
  ];
  return portfolioIndicators.some(indicator => query.includes(indicator));
}

function enhanceWithPortfolioData(responseKey: string, portfolioContext: any): string {
  if (!portfolioContext) return '';
  
  const dq = portfolioContext.dataQuality;
  const totalLoans = portfolioContext.totalLoans;

  if (responseKey === 'pcaf_options') {
    return `\n\n**Your Portfolio Status:**\n• ${totalLoans} motor vehicle loans\n• Current WDQS: ${dq.averageScore.toFixed(1)} ${dq.complianceStatus === 'compliant' ? '✅ Compliant' : '⚠️ Needs Improvement'}`;
  }
  
  return '';
}

function combineResponses(surgical: string, portfolio: string): string {
  return surgical + portfolio;
}

function generatePortfolioInsights(portfolioContext: any): any {
  const dq = portfolioContext.dataQuality;
  return {
    complianceStatus: dq.complianceStatus,
    currentScore: dq.averageScore,
    loansNeedingImprovement: dq.loansNeedingImprovement
  };
}

function generateMethodologyFallback(query: string): RAGResponse {
  return {
    response: `**PCAF Motor Vehicle Knowledge Base**\n\nI have access to 200+ comprehensive PCAF questions covering:\n\n• **Core Methodology** - Attribution factors, emission calculations, data quality scoring\n• **Vehicle Types** - EVs, hybrids, fleets, commercial vehicles, specialty vehicles\n• **Regulatory Compliance** - Supervisory expectations, audit requirements, documentation\n• **Implementation** - System integration, data collection, validation procedures\n• **Global Coverage** - Country-specific factors, international standards\n\n**Try asking specific questions like:**\n• "How do I calculate attribution factors for electric vehicles?"\n• "What PCAF data quality score do I need for compliance?"\n• "How do I handle fleet financing aggregation?"\n• "What are the emission factors for hybrid vehicles?"\n\nI can provide detailed, technical answers from our comprehensive PCAF dataset.`,
    confidence: 'medium',
    sources: ['PCAF Comprehensive Dataset (200 Q&As)', 'PCAF Global Standard'],
    followUpQuestions: [
      'What are the PCAF data quality options for motor vehicles?',
      'How do I calculate financed emissions?',
      'What are regulatory compliance requirements?',
      'How do I handle electric vehicle calculations?'
    ]
  };
}
//
 Helper functions for response type determination
function determineResponseType(metadata: any): ResponseType {
  const category = metadata.category?.toLowerCase() || '';
  const question = metadata.question?.toLowerCase() || '';
  
  if (category.includes('calculation') || question.includes('calculate')) return 'calculation';
  if (category.includes('compliance') || question.includes('compliance')) return 'compliance';
  if (category.includes('data quality') || question.includes('data quality')) return 'data_quality';
  if (category.includes('vehicle') || question.includes('electric') || question.includes('hybrid')) return 'vehicle_specific';
  if (category.includes('regulatory') || question.includes('regulatory')) return 'regulatory';
  if (category.includes('implementation') || question.includes('implement')) return 'implementation';
  
  return 'methodology';
}

function mapSurgicalResponseType(responseKey: string): ResponseType {
  switch (responseKey) {
    case 'pcaf_options': return 'data_quality';
    case 'attribution_factor': return 'calculation';
    case 'financed_emissions': return 'calculation';
    case 'compliance_requirements': return 'compliance';
    case 'improve_data_quality': return 'implementation';
    default: return 'methodology';
  }
}

function needsPortfolioContext(query: string): boolean {
  const portfolioIndicators = [
    'my portfolio', 'our portfolio', 'my loans', 'our loans',
    'current score', 'my score', 'my data quality'
  ];
  return portfolioIndicators.some(indicator => query.includes(indicator));
}