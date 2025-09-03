/**
 * Contextual Narrative Service
 * Provides contextual explanations and narratives for AI insights data
 */

export interface NarrativeContext {
  type: 'explanation' | 'interpretation' | 'recommendation' | 'methodology';
  audience: 'executive' | 'analyst' | 'manager' | 'technical';
  complexity: 'simple' | 'detailed' | 'comprehensive';
}

export interface ContextualNarrative {
  title: string;
  summary: string;
  explanation: string;
  implications: string[];
  actionableInsights: string[];
  methodology?: string;
  sources: string[];
  confidence: number;
}

class ContextualNarrativeService {
  private static instance: ContextualNarrativeService;

  static getInstance(): ContextualNarrativeService {
    if (!ContextualNarrativeService.instance) {
      ContextualNarrativeService.instance = new ContextualNarrativeService();
    }
    return ContextualNarrativeService.instance;
  }

  /**
   * Generate narrative for climate scenarios
   */
  generateClimateScenarioNarrative(scenario: string, impact: number): ContextualNarrative {
    const scenarios = {
      'orderly': {
        title: 'Orderly Transition Scenario',
        summary: 'Early and coordinated climate policy action enables a smooth transition to net-zero emissions.',
        explanation: `In this scenario, governments implement climate policies early and in a coordinated manner. Carbon pricing is introduced gradually, giving businesses time to adapt. The transition to clean energy happens steadily, with clear regulatory signals and adequate time for planning. This creates the most favorable environment for financial institutions and their portfolios.`,
        implications: [
          'Gradual increase in carbon pricing provides predictable transition costs',
          'Early policy signals allow for strategic portfolio repositioning',
          'Green investments become increasingly attractive with policy support',
          'Physical climate risks remain manageable due to effective mitigation'
        ],
        actionableInsights: [
          'Accelerate green financing products to capture early-mover advantage',
          'Develop transition financing for clients adapting to new regulations',
          'Build expertise in climate risk assessment and green taxonomy',
          'Establish partnerships with clean technology providers'
        ],
        methodology: 'Based on NGFS (Network for Greening the Financial System) orderly transition scenario modeling',
        sources: ['NGFS Climate Scenarios', 'TCFD Recommendations', 'PCAF Climate Risk Guidelines']
      },
      'disorderly': {
        title: 'Disorderly Transition Scenario',
        summary: 'Late and uncoordinated climate policy action leads to higher transition costs and market volatility.',
        explanation: `This scenario assumes that climate policies are implemented late and in an uncoordinated manner. Governments delay action until climate impacts become severe, then implement aggressive policies rapidly. This creates significant market disruption, stranded assets, and higher transition costs. Financial institutions face greater uncertainty and potential losses.`,
        implications: [
          'Sudden policy changes create market volatility and uncertainty',
          'Higher stranded asset risks in carbon-intensive sectors',
          'Rapid repricing of climate risks across asset classes',
          'Increased regulatory compliance costs and complexity'
        ],
        actionableInsights: [
          'Stress test portfolio against rapid policy changes',
          'Diversify away from high-carbon assets proactively',
          'Build scenario planning capabilities for policy uncertainty',
          'Develop crisis management protocols for market disruption'
        ],
        methodology: 'Based on NGFS disorderly transition scenario with delayed policy implementation',
        sources: ['NGFS Climate Scenarios', 'Bank for International Settlements', 'Climate Policy Initiative']
      },
      'hothouse': {
        title: 'Hot House World Scenario',
        summary: 'Limited climate action leads to severe physical climate impacts and systemic risks.',
        explanation: `In this scenario, climate policies are insufficient to limit global warming, leading to severe physical climate impacts. Temperatures rise significantly, causing frequent extreme weather events, sea level rise, and ecosystem disruption. Physical risks dominate, with widespread economic damage and potential systemic financial instability.`,
        implications: [
          'Severe physical climate risks affect all economic sectors',
          'Increased frequency of extreme weather events damages assets',
          'Agricultural productivity declines affect food security and prices',
          'Coastal infrastructure faces permanent damage from sea level rise'
        ],
        actionableInsights: [
          'Assess physical climate risk exposure across entire portfolio',
          'Develop adaptation financing products for climate resilience',
          'Avoid investments in high physical risk locations',
          'Build reserves for climate-related losses and business disruption'
        ],
        methodology: 'Based on NGFS hot house world scenario with limited climate action',
        sources: ['NGFS Climate Scenarios', 'IPCC Assessment Reports', 'Physical Risk Assessment Guidelines']
      }
    };

    const scenarioKey = scenario.toLowerCase().replace(/\s+/g, '');
    const scenarioData = scenarios[scenarioKey as keyof typeof scenarios];

    if (!scenarioData) {
      return this.getDefaultNarrative('climate_scenario', impact);
    }

    return {
      ...scenarioData,
      confidence: 0.85
    };
  }

  /**
   * Generate narrative for risk analytics
   */
  generateRiskAnalyticsNarrative(riskType: string, severity: string): ContextualNarrative {
    const riskNarratives = {
      'transition_risk': {
        title: 'Climate Transition Risk Assessment',
        summary: 'Risks arising from the transition to a low-carbon economy, including policy, technology, and market changes.',
        explanation: `Transition risks emerge as society shifts toward a low-carbon economy. These include policy risks from new regulations and carbon pricing, technology risks from clean energy disruption, market risks from changing consumer preferences, and reputation risks from stakeholder expectations. For financial institutions, transition risks can affect asset values, credit quality, and business models.`,
        implications: [
          'Carbon-intensive assets may become stranded or lose value',
          'New regulations may increase compliance costs and operational complexity',
          'Technology disruption may affect traditional business models',
          'Market preferences may shift toward sustainable products and services'
        ],
        actionableInsights: [
          'Conduct transition risk stress testing across portfolio',
          'Develop green finance capabilities and products',
          'Engage with clients on their transition plans and strategies',
          'Monitor regulatory developments and policy signals'
        ]
      },
      'physical_risk': {
        title: 'Physical Climate Risk Assessment',
        summary: 'Risks from physical climate impacts including extreme weather events and long-term climate changes.',
        explanation: `Physical risks result from climate change impacts on the physical environment. Acute risks include extreme weather events like hurricanes, floods, and heatwaves that can damage assets and disrupt operations. Chronic risks include long-term changes like sea level rise, temperature increases, and precipitation pattern changes that gradually affect asset values and business viability.`,
        implications: [
          'Property and infrastructure assets face direct physical damage',
          'Agricultural and natural resource sectors experience productivity changes',
          'Supply chains may be disrupted by extreme weather events',
          'Insurance costs may increase for climate-exposed assets'
        ],
        actionableInsights: [
          'Map portfolio exposure to physical climate hazards',
          'Incorporate climate projections into credit risk models',
          'Develop adaptation financing products for resilience building',
          'Consider climate factors in asset valuation and underwriting'
        ]
      },
      'policy_risk': {
        title: 'Climate Policy Risk Assessment',
        summary: 'Risks from changes in climate-related policies, regulations, and government interventions.',
        explanation: `Policy risks arise from government actions to address climate change. These include carbon pricing mechanisms, emissions regulations, renewable energy mandates, building efficiency standards, and disclosure requirements. Policy changes can affect asset values, operational costs, and competitive dynamics across sectors.`,
        implications: [
          'Carbon pricing increases operational costs for high-emission activities',
          'Emissions regulations may require costly technology upgrades',
          'Disclosure requirements increase reporting and compliance burdens',
          'Subsidy changes affect the competitiveness of different technologies'
        ],
        actionableInsights: [
          'Monitor policy developments in key jurisdictions',
          'Assess portfolio sensitivity to carbon pricing scenarios',
          'Engage with policymakers on regulatory design and implementation',
          'Develop expertise in climate policy analysis and interpretation'
        ]
      }
    };

    const riskKey = riskType.toLowerCase().replace(/\s+/g, '_');
    const riskData = riskNarratives[riskKey as keyof typeof riskNarratives];

    if (!riskData) {
      return this.getDefaultNarrative('risk_analytics', severity);
    }

    // Adjust implications based on severity
    const severityAdjustments = {
      'high': 'immediate attention and mitigation strategies',
      'medium': 'monitoring and gradual risk reduction measures',
      'low': 'awareness and periodic reassessment'
    };

    return {
      ...riskData,
      implications: riskData.implications.map(imp => 
        `${imp} - requires ${severityAdjustments[severity as keyof typeof severityAdjustments] || 'appropriate risk management'}`
      ),
      methodology: 'Based on TCFD risk classification framework and PCAF climate risk guidelines',
      sources: ['TCFD Recommendations', 'PCAF Climate Risk Guidelines', 'NGFS Supervisory Guidance'],
      confidence: 0.88
    };
  }

  /**
   * Generate narrative for emissions forecasts
   */
  generateEmissionsForecastNarrative(scenario: string, reduction: number): ContextualNarrative {
    const forecastNarratives = {
      'optimistic': {
        title: 'Optimistic Emissions Reduction Scenario',
        summary: 'Aggressive decarbonization through accelerated EV adoption and portfolio optimization.',
        explanation: `This scenario assumes rapid adoption of electric vehicles, implementation of green financing incentives, and proactive portfolio management. It represents the best-case outcome where all planned initiatives succeed and market conditions remain favorable for clean technology adoption.`,
        implications: [
          'Significant reduction in portfolio carbon footprint',
          'Improved PCAF compliance and regulatory positioning',
          'Enhanced reputation and ESG credentials',
          'Potential for green finance revenue growth'
        ],
        actionableInsights: [
          'Accelerate EV financing program rollout',
          'Implement green loan incentives and preferential rates',
          'Partner with EV manufacturers and dealers',
          'Develop carbon offset and credit programs'
        ]
      },
      'base_case': {
        title: 'Base Case Emissions Projection',
        summary: 'Steady emissions reduction through normal market evolution and planned initiatives.',
        explanation: `This scenario reflects expected outcomes based on current market trends, planned initiatives, and normal business operations. It assumes moderate success in green financing programs and steady but not accelerated adoption of clean technologies by customers.`,
        implications: [
          'Gradual improvement in portfolio emissions intensity',
          'Meeting basic PCAF compliance requirements',
          'Maintaining competitive position in sustainable finance',
          'Balanced approach to risk and opportunity management'
        ],
        actionableInsights: [
          'Continue current green financing initiatives',
          'Monitor market trends and adjust strategies accordingly',
          'Invest in staff training and capability building',
          'Develop partnerships with sustainability consultants'
        ]
      },
      'conservative': {
        title: 'Conservative Emissions Scenario',
        summary: 'Limited emissions reduction due to market challenges and slower technology adoption.',
        explanation: `This scenario assumes slower than expected adoption of clean technologies, market headwinds, and implementation challenges. It represents a cautious outlook where external factors limit the effectiveness of decarbonization efforts.`,
        implications: [
          'Slower progress toward emissions reduction goals',
          'Potential regulatory compliance challenges',
          'Increased transition risk exposure',
          'Need for enhanced risk management strategies'
        ],
        actionableInsights: [
          'Develop contingency plans for slower progress',
          'Increase focus on data quality and measurement accuracy',
          'Explore alternative decarbonization strategies',
          'Strengthen risk management and scenario planning capabilities'
        ]
      }
    };

    const scenarioKey = scenario.toLowerCase().replace(/\s+/g, '_');
    const scenarioData = forecastNarratives[scenarioKey as keyof typeof forecastNarratives];

    if (!scenarioData) {
      return this.getDefaultNarrative('emissions_forecast', reduction);
    }

    return {
      ...scenarioData,
      methodology: 'Based on portfolio composition analysis, market trend projections, and PCAF emission calculation methodology',
      sources: ['PCAF Global Standard', 'IEA Energy Transition Outlook', 'EV Market Analysis Reports'],
      confidence: 0.82
    };
  }

  /**
   * Generate narrative for strategic insights
   */
  generateStrategicInsightNarrative(insightType: string, data: any): ContextualNarrative {
    const strategicNarratives = {
      'portfolio_optimization': {
        title: 'Portfolio Optimization Opportunity',
        summary: 'Strategic opportunities to enhance portfolio performance through targeted improvements.',
        explanation: `Portfolio optimization involves identifying and implementing changes that improve financial performance while reducing climate risk. This includes increasing the share of low-emission assets, improving data quality for better risk assessment, and developing new products that meet evolving market demands.`,
        implications: [
          'Enhanced portfolio resilience to climate transition risks',
          'Improved regulatory compliance and reporting accuracy',
          'Competitive advantage in sustainable finance markets',
          'Potential for new revenue streams and customer segments'
        ],
        actionableInsights: [
          'Prioritize high-impact, low-effort optimization opportunities',
          'Develop implementation roadmap with clear milestones',
          'Allocate resources for capability building and system upgrades',
          'Monitor progress and adjust strategies based on results'
        ]
      },
      'ev_transition': {
        title: 'Electric Vehicle Transition Strategy',
        summary: 'Strategic approach to capturing opportunities in the growing electric vehicle market.',
        explanation: `The EV transition represents both an opportunity and a necessity for financial institutions. As EV adoption accelerates, banks that develop strong EV financing capabilities will capture market share and reduce portfolio emissions. This requires understanding EV technology, customer needs, and market dynamics.`,
        implications: [
          'Growing market opportunity as EV adoption accelerates',
          'Reduced portfolio emissions and improved ESG profile',
          'Need for new expertise in EV technology and market dynamics',
          'Potential for partnerships with EV manufacturers and charging networks'
        ],
        actionableInsights: [
          'Develop specialized EV financing products and expertise',
          'Build relationships with EV dealers and manufacturers',
          'Create customer education programs about EV benefits',
          'Consider financing for charging infrastructure and related services'
        ]
      },
      'data_quality': {
        title: 'Data Quality Enhancement Strategy',
        summary: 'Systematic approach to improving data quality for better risk management and compliance.',
        explanation: `Data quality is fundamental to effective climate risk management and PCAF compliance. Better data enables more accurate emissions calculations, improved risk assessment, and enhanced decision-making. Investment in data quality pays dividends across multiple business functions.`,
        implications: [
          'More accurate emissions calculations and risk assessments',
          'Improved PCAF compliance and regulatory reporting',
          'Enhanced ability to identify opportunities and risks',
          'Better customer service through improved data insights'
        ],
        actionableInsights: [
          'Implement systematic data collection processes and standards',
          'Invest in staff training and data management systems',
          'Develop data quality metrics and monitoring processes',
          'Create incentives for customers to provide better data'
        ]
      }
    };

    const insightKey = insightType.toLowerCase().replace(/\s+/g, '_');
    const insightData = strategicNarratives[insightKey as keyof typeof strategicNarratives];

    if (!insightData) {
      return this.getDefaultNarrative('strategic_insight', data);
    }

    return {
      ...insightData,
      methodology: 'Based on portfolio analysis, industry best practices, and strategic planning frameworks',
      sources: ['PCAF Implementation Guide', 'Sustainable Finance Best Practices', 'Climate Risk Management Guidelines'],
      confidence: 0.87
    };
  }

  /**
   * Generate narrative for anomaly detection
   */
  generateAnomalyNarrative(anomaly: any): ContextualNarrative {
    const severityNarratives = {
      'high': {
        title: 'High-Severity Anomaly Detected',
        summary: 'Critical data anomaly requiring immediate attention and investigation.',
        explanation: `High-severity anomalies indicate significant deviations from expected patterns that could affect PCAF compliance, risk assessment accuracy, or regulatory reporting. These anomalies may indicate data quality issues, calculation errors, or genuine outliers that require investigation.`,
        implications: [
          'Potential impact on PCAF compliance and regulatory reporting',
          'Risk of inaccurate emissions calculations and risk assessments',
          'Possible data quality or system issues requiring correction',
          'Need for immediate investigation and remediation'
        ],
        actionableInsights: [
          'Investigate anomaly root cause immediately',
          'Verify data accuracy and calculation methodology',
          'Implement corrective measures and process improvements',
          'Monitor for similar anomalies in other portfolio segments'
        ]
      },
      'medium': {
        title: 'Medium-Severity Anomaly Identified',
        summary: 'Notable data anomaly that warrants investigation and potential correction.',
        explanation: `Medium-severity anomalies represent deviations that are significant but not immediately critical. They may indicate data quality issues, unusual but legitimate transactions, or areas where additional verification would be beneficial for accuracy and compliance.`,
        implications: [
          'Potential minor impact on calculation accuracy',
          'Opportunity to improve data quality and processes',
          'May indicate need for additional data verification',
          'Could affect portfolio-level metrics if widespread'
        ],
        actionableInsights: [
          'Schedule investigation within reasonable timeframe',
          'Review data collection and validation processes',
          'Consider additional verification for similar cases',
          'Update procedures to prevent similar anomalies'
        ]
      },
      'low': {
        title: 'Low-Severity Anomaly Noted',
        summary: 'Minor data anomaly for monitoring and potential process improvement.',
        explanation: `Low-severity anomalies are minor deviations that don't significantly impact calculations or compliance but may indicate opportunities for process improvement or data quality enhancement. They serve as early warning indicators for potential issues.`,
        implications: [
          'Minimal impact on current calculations and compliance',
          'Opportunity for continuous improvement',
          'May indicate emerging patterns worth monitoring',
          'Could be useful for process optimization'
        ],
        actionableInsights: [
          'Monitor for patterns or increasing frequency',
          'Consider process improvements when convenient',
          'Use as learning opportunity for staff training',
          'Document for future reference and analysis'
        ]
      }
    };

    const severity = anomaly.severity || 'medium';
    const severityData = severityNarratives[severity as keyof typeof severityNarratives];

    return {
      ...severityData,
      methodology: 'Based on statistical analysis, PCAF data quality standards, and anomaly detection algorithms',
      sources: ['PCAF Data Quality Guidelines', 'Statistical Analysis Methods', 'Anomaly Detection Best Practices'],
      confidence: 0.91
    };
  }

  /**
   * Get default narrative when specific type not found
   */
  private getDefaultNarrative(type: string, data: any): ContextualNarrative {
    return {
      title: `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Analysis`,
      summary: 'Analysis of current data patterns and trends.',
      explanation: 'This analysis provides insights based on current portfolio data and industry standards.',
      implications: [
        'Data-driven insights for informed decision making',
        'Alignment with industry best practices and standards',
        'Opportunities for continuous improvement and optimization'
      ],
      actionableInsights: [
        'Review detailed analysis and recommendations',
        'Consider implementation of suggested improvements',
        'Monitor progress and adjust strategies as needed'
      ],
      methodology: 'Based on portfolio analysis and industry best practices',
      sources: ['Portfolio Data Analysis', 'Industry Standards', 'Best Practice Guidelines'],
      confidence: 0.75
    };
  }
}

export const contextualNarrativeService = ContextualNarrativeService.getInstance();