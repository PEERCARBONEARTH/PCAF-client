import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseFormatter } from '../../src/services/responseFormatter';
import { RAGResponse, ResponseType } from '../../src/types/ragTypes';

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
    const chromaResults = await searchChromaDB(query, chromaDBConfig);
    
    if (chromaResults && chromaResults.length > 0) {
      const bestMatch = chromaResults[0];
      
      if (bestMatch.relevance_score > 0.3) {
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
      }
    }
  } catch (error) {
    console.warn('ChromaDB search failed, falling back to static responses:', error);
  }

  // 4. Fallback to surgical responses
  const surgicalMatch = findSurgicalMatch(query.toLowerCase());
  if (surgicalMatch) {
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
  }

  // 5. Final fallback with structured formatting
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

// Static surgical responses (same as before)
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
  }
  // Add other surgical responses as needed...
};

const QUESTION_PATTERNS = [
  {
    patterns: ['pcaf options', 'data quality options', '5 options', 'option 1', 'option 2', 'option 3', 'option 4', 'option 5'],
    responseKey: 'pcaf_options',
    intent: 'methodology'
  }
  // Add other patterns as needed...
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