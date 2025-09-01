/**
 * RAG Configuration - Hallucination Prevention
 * 
 * This configuration ensures the RAG system uses only validated, 
 * pre-authored responses from our curated dataset.
 */

export const RAG_CONFIG = {
  // HALLUCINATION PREVENTION
  DATASET_ONLY_MODE: true,           // Only use curated Q&A dataset
  DISABLE_EXTERNAL_AI: true,         // Disable external AI API calls
  DISABLE_GENERATIVE_RESPONSES: true, // No AI-generated content
  
  // CONFIDENCE THRESHOLDS
  MIN_CONFIDENCE_THRESHOLD: 0.6,     // Minimum match confidence to return response
  HIGH_CONFIDENCE_THRESHOLD: 0.8,    // Threshold for high confidence responses
  EXACT_MATCH_THRESHOLD: 0.9,        // Threshold for exact matches
  
  // DATASET PREFERENCES
  PREFER_ENHANCED_DATASET: true,      // Prioritize enhanced dataset over base
  ENHANCED_DATASET_BOOST: 0.1,       // Confidence boost for enhanced dataset
  
  // RESPONSE VALIDATION
  VALIDATE_PCAF_SCORES: true,         // Ensure PCAF scores are 1-5
  VALIDATE_FORMULAS: true,            // Check formula accuracy
  VALIDATE_COMPLIANCE_CLAIMS: true,   // Verify compliance statements
  
  // FALLBACK BEHAVIOR
  SAFE_FALLBACK_ENABLED: true,        // Use safe fallback for no matches
  SUGGEST_ALTERNATIVES: true,         // Suggest alternative questions
  PROVIDE_EXAMPLES: true,             // Include example questions in fallbacks
  
  // LOGGING & MONITORING
  LOG_QUERY_MATCHES: true,            // Log query matching for analysis
  LOG_CONFIDENCE_SCORES: true,        // Log confidence calculations
  TRACK_DATASET_USAGE: true,          // Track which dataset entries are used
  
  // PORTFOLIO CONTEXT
  ENABLE_PORTFOLIO_INJECTION: true,   // Allow portfolio data in responses
  PORTFOLIO_PLACEHOLDERS: [           // Allowed portfolio data placeholders
    '{totalLoans}',
    '{wdqs}', 
    '{emissionIntensity}',
    '{totalEmissions}',
    '{complianceStatus}'
  ],
  
  // ROLE-BASED RESPONSES
  ENABLE_ROLE_CUSTOMIZATION: true,    // Use role-specific responses
  DEFAULT_USER_ROLE: 'risk_manager',  // Default role if not specified
  SUPPORTED_ROLES: [
    'executive',
    'risk_manager', 
    'compliance_officer',
    'loan_officer'
  ]
};

// Validation functions
export const validateRAGResponse = (response: any): boolean => {
  if (!RAG_CONFIG.DATASET_ONLY_MODE) return true;
  
  // Ensure response comes from dataset
  if (!response.datasetSource || response.datasetSource === 'none') {
    return false;
  }
  
  // Check confidence threshold
  const confidenceScore = response.confidence === 'high' ? 0.9 : 
                         response.confidence === 'medium' ? 0.7 : 0.5;
  
  if (confidenceScore < RAG_CONFIG.MIN_CONFIDENCE_THRESHOLD) {
    return false;
  }
  
  return true;
};

export const getDatasetStats = () => {
  // This would be called from the pure dataset service
  return {
    mode: 'DATASET_ONLY',
    externalAI: 'DISABLED',
    generativeResponses: 'DISABLED',
    hallucinationPrevention: 'ENABLED'
  };
};

// Error messages for blocked operations
export const BLOCKED_OPERATION_MESSAGES = {
  EXTERNAL_AI_DISABLED: 'External AI calls are disabled to prevent hallucinations. Using curated dataset only.',
  GENERATIVE_DISABLED: 'AI content generation is disabled. Responses come from validated Q&A dataset only.',
  LOW_CONFIDENCE: 'Response confidence below threshold. Providing safe fallback instead.',
  NO_DATASET_MATCH: 'No suitable match found in validated dataset. Suggesting alternative questions.'
};

export default RAG_CONFIG;