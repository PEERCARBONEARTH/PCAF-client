// Response validation to prevent hallucinations and improve confidence

export interface ValidationResult {
  isValid: boolean;
  confidence: 'high' | 'medium' | 'low';
  issues: string[];
  suggestions: string[];
}

export class ResponseValidator {
  private static instance: ResponseValidator;

  static getInstance(): ResponseValidator {
    if (!ResponseValidator.instance) {
      ResponseValidator.instance = new ResponseValidator();
    }
    return ResponseValidator.instance;
  }

  // Known PCAF facts for validation
  private readonly PCAF_FACTS = {
    dataQualityScores: [1, 2, 3, 4, 5],
    complianceThreshold: 3.0,
    assetClasses: ['motor_vehicle', 'real_estate', 'power_generation', 'aviation', 'shipping'],
    motorVehicleOptions: {
      1: 'Real fuel consumption data',
      2: 'Estimated fuel consumption from mileage', 
      3: 'Vehicle specifications + average mileage',
      4: 'Vehicle type + average factors',
      5: 'Asset class average'
    },
    validFormulas: [
      'Attribution Factor = Outstanding Amount ÷ Asset Value',
      'Financed Emissions = Attribution Factor × Annual Vehicle Emissions',
      'Emission Intensity = (Total Financed Emissions ÷ Total Outstanding) × 1000'
    ]
  };

  validateResponse(response: string, query: string, sources: any[]): ValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence: 'high' | 'medium' | 'low' = 'high';

    // 1. Check for hallucinated PCAF scores
    const scoreMatches = response.match(/(?:score|option)\s*:?\s*(\d+(?:\.\d+)?)/gi);
    if (scoreMatches) {
      scoreMatches.forEach(match => {
        const score = parseFloat(match.replace(/[^\d.]/g, ''));
        if (score < 1 || score > 5) {
          issues.push(`Invalid PCAF score: ${score}. Scores must be 1-5.`);
          confidence = 'low';
        }
      });
    }

    // 2. Check for invalid compliance claims
    if (response.includes('compliant') || response.includes('compliance')) {
      const avgScoreMatch = response.match(/average.*score.*?(\d+(?:\.\d+)?)/i);
      if (avgScoreMatch) {
        const avgScore = parseFloat(avgScoreMatch[1]);
        const claimsCompliant = response.toLowerCase().includes('compliant') && 
                               !response.toLowerCase().includes('non-compliant');
        
        if (claimsCompliant && avgScore > 3.0) {
          issues.push(`Compliance claim inconsistent: Average score ${avgScore} > 3.0 threshold`);
          confidence = 'low';
        }
      }
    }

    // 3. Check for made-up formulas
    const formulaPattern = /([A-Za-z\s]+)\s*=\s*([A-Za-z\s÷×+\-()]+)/g;
    const foundFormulas = [...response.matchAll(formulaPattern)];
    
    foundFormulas.forEach(match => {
      const formula = match[0];
      const isValidFormula = this.PCAF_FACTS.validFormulas.some(validFormula => 
        this.normalizeFormula(formula) === this.normalizeFormula(validFormula)
      );
      
      if (!isValidFormula && this.looksLikePCAFFormula(formula)) {
        issues.push(`Potentially incorrect formula: ${formula}`);
        confidence = confidence === 'high' ? 'medium' : 'low';
        suggestions.push('Verify formula against PCAF Global Standard');
      }
    });

    // 4. Check for specific portfolio claims without data
    if (this.hasSpecificPortfolioClaims(response) && (!sources || sources.length === 0)) {
      issues.push('Specific portfolio claims made without portfolio data sources');
      confidence = 'low';
      suggestions.push('Ensure portfolio data is loaded before making specific claims');
    }

    // 5. Check for unrealistic numbers
    const numberPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(loans|million|billion|%|kg|tCO₂e)/gi;
    const numbers = [...response.matchAll(numberPattern)];
    
    numbers.forEach(match => {
      const value = parseFloat(match[1].replace(/,/g, ''));
      const unit = match[2].toLowerCase();
      
      if (this.isUnrealisticValue(value, unit)) {
        issues.push(`Potentially unrealistic value: ${match[0]}`);
        confidence = confidence === 'high' ? 'medium' : 'low';
      }
    });

    // 6. Check response length and structure
    if (response.length < 50) {
      issues.push('Response too brief for complex PCAF query');
      confidence = confidence === 'high' ? 'medium' : confidence;
    }

    if (response.length > 2000) {
      issues.push('Response too verbose - may contain unnecessary information');
      suggestions.push('Focus on most relevant information for the query');
    }

    // 7. Check for motor vehicle focus
    if (query.toLowerCase().includes('motor vehicle') || query.toLowerCase().includes('vehicle')) {
      if (!response.toLowerCase().includes('motor vehicle') && !response.toLowerCase().includes('vehicle')) {
        issues.push('Query about vehicles but response lacks vehicle-specific content');
        confidence = 'medium';
      }
    }

    return {
      isValid: issues.length === 0,
      confidence,
      issues,
      suggestions
    };
  }

  private normalizeFormula(formula: string): string {
    return formula.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .trim();
  }

  private looksLikePCAFFormula(formula: string): boolean {
    const pcafTerms = [
      'attribution', 'emission', 'outstanding', 'asset', 'financed', 
      'intensity', 'factor', 'annual', 'total'
    ];
    
    return pcafTerms.some(term => 
      formula.toLowerCase().includes(term)
    );
  }

  private hasSpecificPortfolioClaims(response: string): boolean {
    const specificClaims = [
      /\d+\s+loans/i,
      /\$[\d,]+/i,
      /average.*score.*\d/i,
      /your portfolio/i,
      /\d+%.*portfolio/i
    ];
    
    return specificClaims.some(pattern => pattern.test(response));
  }

  private isUnrealisticValue(value: number, unit: string): boolean {
    switch (unit.toLowerCase()) {
      case 'loans':
        return value > 100000; // More than 100k loans seems unrealistic for most portfolios
      
      case '%':
        return value > 100 || value < 0;
      
      case 'million':
      case 'billion':
        return value > 1000; // More than 1000 million/billion seems unrealistic
      
      case 'kg':
      case 'tco₂e':
        return value > 1000000; // More than 1M kg CO2e per loan seems unrealistic
      
      default:
        return false;
    }
  }

  // Clean up response by removing low-confidence sections
  cleanResponse(response: string, validation: ValidationResult): string {
    if (validation.isValid && validation.confidence === 'high') {
      return response;
    }

    let cleanedResponse = response;

    // Remove sections with validation issues
    validation.issues.forEach(issue => {
      if (issue.includes('Invalid PCAF score')) {
        // Remove lines with invalid scores
        cleanedResponse = cleanedResponse.replace(/.*(?:score|option)\s*:?\s*\d+(?:\.\d+)?.*\n?/gi, '');
      }
      
      if (issue.includes('Potentially incorrect formula')) {
        // Add disclaimer to formulas
        cleanedResponse = cleanedResponse.replace(
          /([A-Za-z\s]+\s*=\s*[A-Za-z\s÷×+\-()]+)/g,
          '$1 *(Please verify against PCAF Standard)*'
        );
      }
    });

    // Add confidence disclaimer for medium/low confidence responses
    if (validation.confidence !== 'high') {
      cleanedResponse += `\n\n*Note: This response has ${validation.confidence} confidence. Please verify against official PCAF documentation.*`;
    }

    return cleanedResponse;
  }

  // Generate alternative response for invalid responses
  generateFallbackResponse(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('data quality')) {
      return `**PCAF Data Quality for Motor Vehicles**

PCAF defines 5 data quality options for motor vehicles:
• **Option 1**: Real fuel consumption data (Score: 1)
• **Option 2**: Estimated fuel consumption from mileage (Score: 2)  
• **Option 3**: Vehicle specifications + average mileage (Score: 3)
• **Option 4**: Vehicle type + average factors (Score: 4)
• **Option 5**: Asset class average (Score: 5)

Portfolio compliance requires weighted average score ≤ 3.0.

For specific portfolio analysis, please ensure your loan data is uploaded and processed.`;
    }
    
    if (lowerQuery.includes('calculate') || lowerQuery.includes('attribution')) {
      return `**PCAF Motor Vehicle Calculations**

**Attribution Factor:**
Formula: Outstanding Amount ÷ Asset Value
Example: $25,000 loan ÷ $40,000 vehicle = 0.625 (62.5%)

**Financed Emissions:**
Formula: Attribution Factor × Annual Vehicle Emissions

**Emission Intensity:**
Formula: (Total Financed Emissions ÷ Total Outstanding) × 1000
Units: kg CO₂e per $1,000 outstanding

For calculations using your specific portfolio data, please ensure your loans are uploaded and processed.`;
    }

    return `I can help you with PCAF motor vehicle methodology questions. Please ask about:

• **Data Quality**: PCAF options 1-5 and scoring
• **Calculations**: Attribution factors and financed emissions  
• **Portfolio Analysis**: Assessing your loan data (requires uploaded data)
• **Compliance**: PCAF requirements and thresholds

Please be more specific about what you'd like to know.`;
  }
}

export const responseValidator = ResponseValidator.getInstance();