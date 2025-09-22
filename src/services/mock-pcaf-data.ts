// Mock data for PCAF components during development
export const mockAvoidedEmissionsData = {
  portfolioSummary: {
    totalAvoidedEmissions: 33258,
    annualAvoidedEmissions: 4366,
    averageDataQuality: 3.7,
    costOfAvoidance: 1.36,
    projectCount: 3,
    highConfidenceShare: 1.0
  },
  
  projectResults: [
    {
      projectId: 'proj-001',
      projectName: 'Electric Vehicle Fleet',
      projectType: 'technology_substitution',
      annualAvoidedEmissions: 4264,
      lifetimeAvoidedEmissions: 42644,
      financedAvoidedEmissions: 31983,
      attributionFactor: 0.75,
      dataQualityScore: 4,
      confidenceLevel: 'high' as const,
      methodology: 'EV vs ICE Baseline'
    },
    {
      projectId: 'proj-002',
      projectName: 'Solar Power Plant',
      projectType: 'renewable_energy',
      annualAvoidedEmissions: 102,
      lifetimeAvoidedEmissions: 2550,
      financedAvoidedEmissions: 1273,
      attributionFactor: 0.5,
      dataQualityScore: 3,
      confidenceLevel: 'medium' as const,
      methodology: 'Solar vs Coal Grid'
    },
    {
      projectId: 'proj-003',
      projectName: 'Building Efficiency',
      projectType: 'energy_efficiency',
      annualAvoidedEmissions: 0.26,
      lifetimeAvoidedEmissions: 3.9,
      financedAvoidedEmissions: 2.6,
      attributionFactor: 0.667,
      dataQualityScore: 4,
      confidenceLevel: 'high' as const,
      methodology: 'HVAC Upgrade'
    }
  ],
  
  complianceStatus: {
    separationFromCredits: true,
    methodologyDocumented: true,
    baselineJustified: true,
    uncertaintyDisclosed: true,
    overallCompliance: 95
  }
};

export const mockAttributionResult = {
  attributionFactor: 0.7286,
  standard: 'B',
  assetClass: 'motor_vehicles',
  methodology: 'Outstanding Balance ÷ Vehicle Value at Origination',
  dataQualityAdjustment: 0.05,
  finalAttributionFactor: 0.7650,
  validationChecks: {
    inputValidation: true,
    rangeValidation: true,
    consistencyCheck: true
  },
  recommendations: [
    'Consider collecting more specific vehicle data to improve data quality score',
    'Verify vehicle value at origination with independent appraisal'
  ]
};

export const mockComplianceData = {
  overallCompliance: 95,
  methodologyImplementation: {
    motorVehicles: 100,
    multiAssetClass: 100,
    avoidedEmissions: 100,
    dataQuality: 92,
    attribution: 100
  },
  standardsCoverage: {
    standardA: {
      implemented: true,
      assetClasses: ['Listed Equity', 'Corporate Bonds', 'Sovereign Bonds'],
      coverage: 100
    },
    standardB: {
      implemented: true,
      assetClasses: ['Business Loans', 'Motor Vehicles', 'Mortgages', 'Commercial Real Estate'],
      coverage: 100
    },
    standardC: {
      implemented: true,
      assetClasses: ['Project Finance'],
      coverage: 100
    }
  },
  dataQualityMetrics: {
    averageScore: 3.7,
    distribution: { 1: 2, 2: 5, 3: 15, 4: 25, 5: 8 },
    improvementOpportunities: [
      'Collect more vehicle-specific data for motor vehicle loans',
      'Implement automated data validation for loan origination',
      'Establish data quality monitoring dashboard'
    ]
  },
  avoidedEmissionsStatus: {
    implemented: true,
    projectTypes: ['Technology Substitution', 'Renewable Energy', 'Energy Efficiency'],
    totalAvoidedEmissions: 33258,
    pcafCompliant: true
  }
};