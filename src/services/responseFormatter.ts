import { 
  RAGResponse, 
  ResponseType, 
  ResponseFormat,
  StepByStepResponse,
  ComparisonTableResponse,
  ChecklistResponse,
  FormulaResponse,
  DataRequirementsResponse,
  ComplianceMatrixResponse,
  PortfolioSummaryResponse,
  QueryClassification
} from '../types/ragTypes';

export class ResponseFormatter {
  
  /**
   * Classify query to determine appropriate response structure
   */
  static classifyQuery(query: string): QueryClassification {
    const lowerQuery = query.toLowerCase();
    
    // Intent classification
    let intent: QueryClassification['intent'] = 'explain';
    if (lowerQuery.includes('calculate') || lowerQuery.includes('formula')) intent = 'calculate';
    else if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('difference')) intent = 'compare';
    else if (lowerQuery.includes('implement') || lowerQuery.includes('how to') || lowerQuery.includes('steps')) intent = 'implement';
    else if (lowerQuery.includes('comply') || lowerQuery.includes('requirement') || lowerQuery.includes('audit')) intent = 'comply';
    else if (lowerQuery.includes('analyze') || lowerQuery.includes('portfolio') || lowerQuery.includes('my loans')) intent = 'analyze';
    
    // Entity extraction
    const entities = [];
    const vehicleTypes = ['electric', 'hybrid', 'ev', 'truck', 'car', 'suv', 'motorcycle'];
    const dataQualityOptions = ['option 1', 'option 2', 'option 3', 'option 4', 'option 5'];
    
    vehicleTypes.forEach(type => {
      if (lowerQuery.includes(type)) {
        entities.push({ type: 'vehicle_type' as const, value: type, confidence: 0.9 });
      }
    });
    
    dataQualityOptions.forEach(option => {
      if (lowerQuery.includes(option)) {
        entities.push({ type: 'data_quality_option' as const, value: option, confidence: 0.95 });
      }
    });
    
    // Context determination
    const scope = lowerQuery.includes('portfolio') || lowerQuery.includes('my loans') ? 'portfolio' : 
                 lowerQuery.includes('compliance') || lowerQuery.includes('regulatory') ? 'regulatory' :
                 lowerQuery.includes('methodology') || lowerQuery.includes('pcaf') ? 'methodology' : 'single_loan';
    
    return {
      intent,
      entities,
      context: {
        domain: 'pcaf',
        scope,
        urgency: lowerQuery.includes('urgent') || lowerQuery.includes('asap') ? 'immediate' : 'planning'
      },
      complexity: entities.length > 2 || lowerQuery.split(' ').length > 10 ? 'complex' : 'simple'
    };
  }
  
  /**
   * Determine optimal response format based on query classification
   */
  static determineResponseFormat(classification: QueryClassification, content: string): ResponseFormat {
    const { intent, context } = classification;
    
    // Format mapping based on intent and content
    if (intent === 'calculate' && content.includes('formula')) return 'formula';
    if (intent === 'implement' || content.includes('step')) return 'step_by_step';
    if (intent === 'compare' || content.includes('option')) return 'comparison_table';
    if (intent === 'comply' && content.includes('requirement')) return 'compliance_matrix';
    if (context.scope === 'portfolio') return 'portfolio_summary';
    if (content.includes('data') && content.includes('need')) return 'data_requirements';
    if (content.includes('checklist') || content.includes('ensure')) return 'checklist';
    
    return 'step_by_step'; // Default fallback
  }
  
  /**
   * Format response based on determined structure
   */
  static formatResponse(
    rawResponse: string, 
    classification: QueryClassification,
    responseType: ResponseType,
    portfolioContext?: any
  ): RAGResponse {
    
    const format = this.determineResponseFormat(classification, rawResponse);
    let structuredData = null;
    let formattedResponse = rawResponse;
    
    try {
      switch (format) {
        case 'formula':
          structuredData = this.extractFormulaStructure(rawResponse);
          formattedResponse = this.renderFormula(structuredData);
          break;
          
        case 'step_by_step':
          structuredData = this.extractStepByStepStructure(rawResponse);
          formattedResponse = this.renderStepByStep(structuredData);
          break;
          
        case 'comparison_table':
          structuredData = this.extractComparisonStructure(rawResponse);
          formattedResponse = this.renderComparisonTable(structuredData);
          break;
          
        case 'data_requirements':
          structuredData = this.extractDataRequirementsStructure(rawResponse);
          formattedResponse = this.renderDataRequirements(structuredData);
          break;
          
        case 'compliance_matrix':
          structuredData = this.extractComplianceStructure(rawResponse);
          formattedResponse = this.renderComplianceMatrix(structuredData);
          break;
          
        case 'portfolio_summary':
          if (portfolioContext) {
            structuredData = this.createPortfolioSummary(portfolioContext);
            formattedResponse = this.renderPortfolioSummary(structuredData);
          }
          break;
          
        case 'checklist':
          structuredData = this.extractChecklistStructure(rawResponse);
          formattedResponse = this.renderChecklist(structuredData);
          break;
      }
    } catch (error) {
      console.warn('Failed to structure response, using raw format:', error);
    }
    
    return {
      response: formattedResponse,
      confidence: this.determineConfidence(classification, structuredData),
      sources: this.extractSources(rawResponse),
      followUpQuestions: this.generateContextualFollowUps(classification, responseType),
      responseType,
      structuredData: structuredData ? { type: responseType, format, data: structuredData } : undefined
    };
  }
  
  /**
   * Extract formula structure from response
   */
  private static extractFormulaStructure(response: string): FormulaResponse {
    // Parse formula patterns from response
    const formulaMatch = response.match(/\*\*Formula:\*\*\s*(.+?)(?:\n|$)/);
    const formula = formulaMatch ? formulaMatch[1].trim() : '';
    
    // Extract variables (simplified parsing)
    const variables = [];
    const variableMatches = response.matchAll(/•\s*(.+?):\s*(.+?)(?:\n|$)/g);
    for (const match of variableMatches) {
      variables.push({
        symbol: match[1].split(' ')[0],
        name: match[1],
        description: match[2],
        unit: match[2].includes('kg') ? 'kg CO₂e' : undefined
      });
    }
    
    return {
      title: 'PCAF Calculation Formula',
      formula,
      variables,
      example: {
        scenario: 'Sample calculation',
        calculation: formula,
        result: 'See detailed example above'
      }
    };
  }
  
  /**
   * Extract step-by-step structure
   */
  private static extractStepByStepStructure(response: string): StepByStepResponse {
    const steps = [];
    const stepMatches = response.matchAll(/(\d+)\.\s*\*\*(.+?)\*\*\s*\n(.+?)(?=\n\d+\.|$)/gs);
    
    let stepNumber = 1;
    for (const match of stepMatches) {
      steps.push({
        number: stepNumber++,
        title: match[2].trim(),
        description: match[3].trim().replace(/\n/g, ' ')
      });
    }
    
    return {
      title: 'Implementation Steps',
      steps,
      summary: 'Follow these steps to implement PCAF methodology correctly.'
    };
  }
  
  /**
   * Extract comparison table structure
   */
  private static extractComparisonStructure(response: string): ComparisonTableResponse {
    const rows = [];
    
    // Parse PCAF options format
    const optionMatches = response.matchAll(/\*\*Option (\d+):\s*(.+?)\*\*\s*\(Score:\s*(\d+)\)\s*\n(.+?)(?=\*\*Option|\n\n|$)/gs);
    
    for (const match of optionMatches) {
      const requirements = match[4].match(/•\s*Requirements:\s*(.+?)(?:\n|$)/)?.[1] || '';
      const source = match[4].match(/•\s*Source:\s*(.+?)(?:\n|$)/)?.[1] || '';
      const accuracy = match[4].match(/•\s*Accuracy:\s*(.+?)(?:\n|$)/)?.[1] || '';
      
      rows.push({
        label: `Option ${match[1]}`,
        values: [match[2], match[3], requirements, source, accuracy]
      });
    }
    
    return {
      title: 'PCAF Data Quality Options Comparison',
      headers: ['Option', 'Score', 'Requirements', 'Source', 'Accuracy'],
      rows
    };
  }
  
  /**
   * Extract data requirements structure
   */
  private static extractDataRequirementsStructure(response: string): DataRequirementsResponse {
    const options = [];
    
    const optionMatches = response.matchAll(/\*\*Option (\d+):\s*(.+?)\*\*\s*\(Score:\s*(\d+)\)/g);
    
    for (const match of optionMatches) {
      options.push({
        option: `Option ${match[1]}`,
        score: parseInt(match[3]),
        requirements: [{
          field: match[2],
          description: `Data required for ${match[2]}`,
          source: 'Various sources',
          difficulty: parseInt(match[3]) <= 2 ? 'hard' : parseInt(match[3]) <= 3 ? 'medium' : 'easy'
        }],
        accuracy: parseInt(match[3]) <= 2 ? 'High' : parseInt(match[3]) <= 3 ? 'Medium' : 'Low',
        effort: parseInt(match[3]) <= 2 ? 'High' : parseInt(match[3]) <= 3 ? 'Medium' : 'Low'
      });
    }
    
    return {
      title: 'PCAF Data Requirements by Option',
      options
    };
  }
  
  /**
   * Extract compliance structure
   */
  private static extractComplianceStructure(response: string): ComplianceMatrixResponse {
    return {
      title: 'PCAF Compliance Requirements',
      requirements: [
        {
          requirement: 'Portfolio Weighted Data Quality Score ≤ 3.0',
          description: 'Achieve compliant data quality across motor vehicle portfolio',
          mandatory: true,
          documentation: ['Calculation methodology', 'Data sources', 'Quality assurance procedures']
        },
        {
          requirement: 'Annual Recalculation and Reporting',
          description: 'Update financed emissions calculations annually',
          mandatory: true,
          documentation: ['Annual reports', 'Methodology updates', 'Data quality improvements']
        }
      ]
    };
  }
  
  /**
   * Create portfolio summary structure
   */
  private static createPortfolioSummary(portfolioContext: any): PortfolioSummaryResponse {
    const dq = portfolioContext.dataQuality;
    
    return {
      title: 'Portfolio Analysis Summary',
      metrics: [
        {
          metric: 'Weighted Data Quality Score',
          value: dq.averageScore.toFixed(1),
          status: dq.averageScore <= 3.0 ? 'good' : 'critical',
          target: '≤ 3.0',
          improvement: dq.averageScore > 3.0 ? 'Improve data quality for high-value loans' : undefined
        },
        {
          metric: 'Total Loans',
          value: portfolioContext.totalLoans.toString(),
          status: 'good'
        },
        {
          metric: 'Loans Needing Improvement',
          value: dq.loansNeedingImprovement.toString(),
          status: dq.loansNeedingImprovement > portfolioContext.totalLoans * 0.5 ? 'warning' : 'good'
        }
      ],
      recommendations: [
        {
          priority: 'high',
          action: 'Focus on Option 5 → Option 4 improvements',
          impact: 'Quick WDQS improvement',
          effort: 'Low'
        },
        {
          priority: 'medium',
          action: 'Collect vehicle specifications for high-value loans',
          impact: 'Significant WDQS improvement',
          effort: 'Medium'
        }
      ]
    };
  }
  
  /**
   * Extract checklist structure
   */
  private static extractChecklistStructure(response: string): ChecklistResponse {
    return {
      title: 'PCAF Implementation Checklist',
      categories: [
        {
          category: 'Data Collection',
          items: [
            { item: 'Vehicle make, model, year', required: true, description: 'For Option 3 data quality' },
            { item: 'Annual mileage', required: false, description: 'For Option 2 data quality' },
            { item: 'Fuel consumption records', required: false, description: 'For Option 1 data quality' }
          ]
        }
      ]
    };
  }
  
  // Rendering methods
  private static renderFormula(data: FormulaResponse): string {
    let output = `## ${data.title}\n\n`;
    output += `**Formula:** \`${data.formula}\`\n\n`;
    output += `**Variables:**\n`;
    data.variables.forEach(v => {
      output += `• **${v.symbol}** - ${v.name}: ${v.description}${v.unit ? ` (${v.unit})` : ''}\n`;
    });
    output += `\n**Example:**\n${data.example.scenario}\n\`${data.example.calculation}\`\n\n${data.example.result}`;
    return output;
  }
  
  private static renderStepByStep(data: StepByStepResponse): string {
    let output = `## ${data.title}\n\n`;
    data.steps.forEach(step => {
      output += `### ${step.number}. ${step.title}\n${step.description}\n\n`;
      if (step.example) output += `*Example:* ${step.example}\n\n`;
    });
    output += `**Summary:** ${data.summary}`;
    return output;
  }
  
  private static renderComparisonTable(data: ComparisonTableResponse): string {
    let output = `## ${data.title}\n\n`;
    output += `| ${data.headers.join(' | ')} |\n`;
    output += `|${data.headers.map(() => '---').join('|')}|\n`;
    data.rows.forEach(row => {
      output += `| ${row.values.join(' | ')} |\n`;
    });
    return output;
  }
  
  private static renderDataRequirements(data: DataRequirementsResponse): string {
    let output = `## ${data.title}\n\n`;
    data.options.forEach(option => {
      output += `### ${option.option} (Score: ${option.score})\n`;
      output += `**Accuracy:** ${option.accuracy} | **Effort:** ${option.effort}\n\n`;
      option.requirements.forEach(req => {
        output += `• **${req.field}** - ${req.description} (${req.difficulty})\n`;
      });
      output += '\n';
    });
    return output;
  }
  
  private static renderComplianceMatrix(data: ComplianceMatrixResponse): string {
    let output = `## ${data.title}\n\n`;
    data.requirements.forEach(req => {
      output += `### ${req.requirement} ${req.mandatory ? '(Mandatory)' : '(Optional)'}\n`;
      output += `${req.description}\n\n`;
      output += `**Documentation Required:**\n`;
      req.documentation.forEach(doc => output += `• ${doc}\n`);
      output += '\n';
    });
    return output;
  }
  
  private static renderPortfolioSummary(data: PortfolioSummaryResponse): string {
    let output = `## ${data.title}\n\n`;
    output += `### Key Metrics\n`;
    data.metrics.forEach(metric => {
      const statusIcon = metric.status === 'good' ? '✅' : metric.status === 'warning' ? '⚠️' : '❌';
      output += `• **${metric.metric}:** ${metric.value} ${statusIcon}`;
      if (metric.target) output += ` (Target: ${metric.target})`;
      output += '\n';
    });
    output += `\n### Recommendations\n`;
    data.recommendations.forEach(rec => {
      const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      output += `${priorityIcon} **${rec.action}**\n`;
      output += `   Impact: ${rec.impact} | Effort: ${rec.effort}\n\n`;
    });
    return output;
  }
  
  private static renderChecklist(data: ChecklistResponse): string {
    let output = `## ${data.title}\n\n`;
    data.categories.forEach(category => {
      output += `### ${category.category}\n`;
      category.items.forEach(item => {
        const checkbox = item.required ? '☐' : '◯';
        output += `${checkbox} **${item.item}**${item.required ? ' (Required)' : ''}\n`;
        if (item.description) output += `   ${item.description}\n`;
      });
      output += '\n';
    });
    return output;
  }
  
  // Helper methods
  private static determineConfidence(classification: QueryClassification, structuredData: any): 'high' | 'medium' | 'low' {
    if (structuredData && classification.complexity === 'simple') return 'high';
    if (classification.entities.length > 0) return 'medium';
    return 'low';
  }
  
  private static extractSources(response: string): string[] {
    return ['PCAF Global Standard', 'Motor Vehicle Methodology'];
  }
  
  private static generateContextualFollowUps(classification: QueryClassification, responseType: ResponseType): string[] {
    const { intent, context } = classification;
    
    if (intent === 'calculate') {
      return [
        'How do I validate this calculation?',
        'What if I don\'t have all the required data?',
        'Can you show me a different example?'
      ];
    }
    
    if (context.scope === 'portfolio') {
      return [
        'Which loans should I prioritize for improvement?',
        'What\'s the fastest way to improve my score?',
        'How do I track progress over time?'
      ];
    }
    
    return [
      'Can you provide more details on this topic?',
      'What are the common implementation challenges?',
      'How does this relate to regulatory requirements?'
    ];
  }
}