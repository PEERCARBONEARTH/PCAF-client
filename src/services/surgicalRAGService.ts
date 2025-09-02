// Surgical RAG Service - Secure server-side ChromaDB queries for PCAF questions
export class SurgicalRAGService {
  private static instance: SurgicalRAGService;

  static getInstance(): SurgicalRAGService {
    if (!SurgicalRAGService.instance) {
      SurgicalRAGService.instance = new SurgicalRAGService();
    }
    return SurgicalRAGService.instance;
  }

  // Pre-defined high-confidence responses for common questions
  private readonly SURGICAL_RESPONSES = {
    // PCAF Data Quality Options
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

    // Attribution Factor Calculation
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

    // Financed Emissions Calculation
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

    // Compliance Requirements
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

    // Data Quality Improvement
    'improve_data_quality': {
      confidence: 'high',
      response: `**Data Quality Improvement Strategy**

**Priority 1: Option 5 → Option 4** (Quick Wins)
• **Action:** Collect vehicle type (car, truck, SUV, motorcycle)
• **Effort:** Low (1 data field)
• **Impact:** Moderate score improvement
• **Method:** Review loan documentation, contact borrowers

**Priority 2: Option 4 → Option 3** (Highest Impact)
• **Action:** Collect make, model, year
• **Effort:** Medium (3 data fields)
• **Impact:** Significant score improvement
• **Method:** VIN lookup, DMV records, borrower surveys

**Priority 3: Option 3 → Option 2** (Advanced)
• **Action:** Collect annual mileage
• **Effort:** High (ongoing data collection)
• **Impact:** Good score improvement
• **Method:** Odometer readings, telematics, borrower reporting

**Focus Areas:**
• Start with largest loan balances for maximum WDQS impact
• Target loans currently at Option 5 (easiest improvements)
• Implement systematic data collection for new loans`,
      sources: ['PCAF Implementation Guide', 'Data Quality Best Practices'],
      followUp: [
        'Which loans should I prioritize first?',
        'How do I collect vehicle specifications efficiently?',
        'What\'s the ROI of data quality improvements?'
      ]
    }
  };

  // Question pattern matching for surgical responses
  private readonly QUESTION_PATTERNS = [
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
      patterns: ['improve data quality', 'better data quality', 'data improvement', 'move from option'],
      responseKey: 'improve_data_quality',
      intent: 'improvement'
    }
  ];

  async processQuery(query: string, portfolioContext?: any): Promise<{
    response: string;
    confidence: 'high' | 'medium' | 'low';
    sources: string[];
    followUpQuestions: string[];
    portfolioInsights?: any;
  }> {
    try {
      // Call secure server-side API endpoint
      const response = await fetch('/api/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          portfolioContext
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('RAG query failed:', error);
      
      // Fallback to basic response if API fails
      return this.generateMethodologyFallback(query);
    }
  }



  // Fallback method for when API fails

  private generateMethodologyFallback(query: string): any {
    return {
      response: `**PCAF Motor Vehicle Knowledge Base**\n\nI have access to 200+ comprehensive PCAF questions covering:\n\n• **Core Methodology** - Attribution factors, emission calculations, data quality scoring\n• **Vehicle Types** - EVs, hybrids, fleets, commercial vehicles, specialty vehicles\n• **Regulatory Compliance** - Supervisory expectations, audit requirements, documentation\n• **Implementation** - System integration, data collection, validation procedures\n• **Global Coverage** - Country-specific factors, international standards\n\n**Try asking specific questions like:**\n• "How do I calculate attribution factors for electric vehicles?"\n• "What PCAF data quality score do I need for compliance?"\n• "How do I handle fleet financing aggregation?"\n• "What are the emission factors for hybrid vehicles?"\n\nI can provide detailed, technical answers from our comprehensive PCAF dataset.`,
      confidence: 'medium' as const,
      sources: ['PCAF Comprehensive Dataset (200 Q&As)', 'PCAF Global Standard'],
      followUpQuestions: [
        'What are the PCAF data quality options for motor vehicles?',
        'How do I calculate financed emissions?',
        'What are regulatory compliance requirements?',
        'How do I handle electric vehicle calculations?'
      ]
    };
  }
}

export const surgicalRAGService = SurgicalRAGService.getInstance();