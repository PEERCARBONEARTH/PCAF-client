# Enhanced ChromaDB Metadata Guide

## Overview

The sample data loader now includes comprehensive metadata for all documents stored in ChromaDB. This enables powerful filtering, analytics, and AI-driven insights across the loan portfolio.

## Metadata Structure by Document Type

### 1. Loan Analysis Documents (`type: 'loan_analysis'`)

Each loan document includes 37+ metadata fields:

#### Core Loan Data
- `loanId`: Unique loan identifier (e.g., "AUTO0001")
- `loanAmount`: Original loan amount in dollars
- `outstandingBalance`: Current outstanding balance
- `borrowerName`: Borrower identifier
- `ltv`: Loan-to-value ratio percentage
- `interestRate`: Annual interest rate

#### Vehicle Information
- `vehicleMake`: Vehicle manufacturer (Tesla, Toyota, etc.)
- `vehicleModel`: Vehicle model (Model 3, Prius, etc.)
- `fuelType`: Electric, Hybrid, or Gasoline
- `vehicleYear`: Model year
- `emissions`: Annual emissions in tCO2e

#### PCAF Compliance
- `pcafScore`: Data quality score (1-5 scale)
- `isCompliant`: Boolean - true if PCAF score ≤ 3
- `instrument`: PCAF instrument type ('auto_loans')

#### Risk Assessment
- `riskLevel`: 'low', 'medium', or 'high'
- `climateRisk`: Climate-related risk level
- `creditScore`: Borrower credit score

#### Geographic & Temporal
- `state`: US state code (CA, TX, NY, etc.)
- `region`: Geographic region
- `originationDate`: Loan origination date
- `maturityDate`: Loan maturity date

#### Performance Indicators
- `paymentStatus`: 'current', '30_days_past_due', etc.
- `esgScore`: ESG rating (0-100)
- `carbonIntensity`: tCO2e per $1,000 outstanding

#### Boolean Flags for Easy Filtering
- `isEV`: True for electric vehicles
- `isHybrid`: True for hybrid vehicles
- `isHighEmission`: True if emissions > 6.0 tCO2e
- `isLowEmission`: True if emissions < 2.0 tCO2e
- `isLargeBalance`: True if balance > $30,000

#### Opportunity Identification
- `evUpgradeCandidate`: Gasoline vehicle with balance > $20k
- `dataImprovementCandidate`: PCAF score > 3.5
- `refinanceCandidate`: Eligible for refinancing

### 2. Portfolio Overview Documents (`type: 'portfolio_overview'`)

#### Portfolio Metrics
- `totalLoans`: Total number of active loans
- `portfolioValue`: Total portfolio value in dollars
- `totalEmissions`: Total financed emissions (tCO2e)
- `avgDataQuality`: Average PCAF score
- `evShare`: Electric vehicle percentage
- `complianceRate`: PCAF compliance percentage

#### Performance Indicators
- `emissionIntensity`: kg CO2e per $1,000
- `physicalEmissionIntensity`: tCO2e per vehicle
- `waci`: Weighted Average Carbon Intensity
- `avgAttributionFactor`: Average attribution factor

#### Composition Breakdown
- `electricVehicles`: Count of EVs
- `hybridVehicles`: Count of hybrids
- `gasolineVehicles`: Count of gasoline vehicles
- `electricEmissions`: EV emissions total
- `hybridEmissions`: Hybrid emissions total
- `gasolineEmissions`: Gasoline emissions total

#### Risk Distribution
- `lowRiskLoans`: Count of low-risk loans
- `mediumRiskLoans`: Count of medium-risk loans
- `highRiskLoans`: Count of high-risk loans

#### Target Progress
- `emissionReductionTarget`: Target reduction percentage
- `currentReduction`: Current reduction achieved
- `evTargetShare`: Target EV percentage
- `targetProgress`: Progress toward EV target

### 3. AI Insights Documents (`type: 'ai_insight'`)

#### Insight Classification
- `insightType`: Type of insight (portfolio_optimization, etc.)
- `confidenceLevel`: AI confidence percentage (0-100)
- `priority`: 'high', 'medium', or 'low'
- `category`: 'opportunity', 'risk', 'compliance', etc.

#### Financial Impact
- `revenueImpact`: Annual revenue potential in dollars
- `implementationCost`: Cost to implement
- `roi`: Return on investment percentage
- `paybackPeriod`: Payback period in months

#### Climate Impact
- `emissionReduction`: Annual emission reduction (tCO2e)
- `evTargetContribution`: Contribution to EV target (%)
- `complianceImprovement`: PCAF score improvement

#### Implementation Details
- `timelineMonths`: Implementation timeline
- `complexity`: 'low', 'medium', or 'high'
- `resourcesRequired`: Array of required resources
- `actionItemCount`: Number of action items

#### Risk Assessment
- `marketRisk`: Market risk level
- `executionRisk`: Execution risk level
- `competitiveRisk`: Competitive risk level

#### Action Flags
- `isActionable`: Can be acted upon immediately
- `isHighImpact`: Has significant impact
- `isLowRisk`: Low implementation risk
- `requiresImmediateAction`: Urgent action needed

### 4. Analytics Documents (`type: 'analytics_comprehensive'`)

#### Analysis Metadata
- `analysisType`: Type of analysis performed
- `metricsIncluded`: Array of included metrics
- `portfolioGrade`: Overall portfolio grade (A+, B, etc.)
- `benchmarkComparison`: Performance vs benchmarks
- `trendDirection`: 'improving', 'stable', or 'declining'

#### Key Performance Indicators
- `totalLoans`: Total loan count
- `outstandingBalance`: Total outstanding balance
- `totalEmissions`: Total emissions
- `wdqs`: Weighted Data Quality Score
- `complianceRate`: PCAF compliance rate

#### Fuel Type Analytics
- `evCount`, `evPercentage`, `evEmissions`
- `hybridCount`, `hybridPercentage`, `hybridEmissions`
- `gasolineCount`, `gasolinePercentage`, `gasolineEmissions`

#### Risk Analytics
- `lowRiskCount`, `lowRiskPercentage`
- `mediumRiskCount`, `mediumRiskPercentage`
- `highRiskCount`, `highRiskPercentage`

## Query Examples

### 1. Find EV Loans with High ESG Scores
```javascript
const evLoans = await chromaDBService.getDocumentsByMetadata({
  type: 'loan_analysis',
  isEV: true,
  esgScore: { min: 80 }
});
```

### 2. Identify EV Upgrade Candidates
```javascript
const upgradeCandidates = await chromaDBService.getDocumentsByMetadata({
  type: 'loan_analysis',
  evUpgradeCandidate: true,
  isHighEmission: true,
  isLargeBalance: true
});
```

### 3. Find Non-Compliant Loans Needing Data Improvement
```javascript
const dataImprovementTargets = await chromaDBService.getDocumentsByMetadata({
  type: 'loan_analysis',
  isCompliant: false,
  dataImprovementCandidate: true
});
```

### 4. Get High-Impact AI Insights
```javascript
const highImpactInsights = await chromaDBService.getDocumentsByMetadata({
  type: 'ai_insight',
  isHighImpact: true,
  isActionable: true,
  priority: 'high'
});
```

### 5. Analyze Regional Performance
```javascript
const californiaLoans = await chromaDBService.getDocumentsByMetadata({
  type: 'loan_analysis',
  state: 'CA',
  isCompliant: true
});
```

### 6. Find Refinancing Opportunities
```javascript
const refinanceOpportunities = await chromaDBService.getDocumentsByMetadata({
  type: 'loan_analysis',
  refinanceCandidate: true,
  paymentStatus: 'current',
  creditScore: { min: 700 }
});
```

## Advanced Analytics Capabilities

### Portfolio Segmentation
- Segment by fuel type, risk level, compliance status
- Geographic analysis by state/region
- Performance analysis by credit score ranges
- Temporal analysis by origination periods

### Risk Analysis
- Identify high-risk concentrations
- Climate risk assessment by fuel type
- Data quality risk identification
- Credit risk correlation analysis

### Opportunity Identification
- EV transition candidates
- Portfolio optimization opportunities
- Revenue enhancement possibilities
- Compliance improvement targets

### Performance Benchmarking
- Compare against industry standards
- Track progress toward targets
- Monitor key performance indicators
- Identify best-performing segments

## Benefits of Enhanced Metadata

1. **Rich Filtering**: Query by any combination of 37+ fields
2. **AI-Powered Insights**: Contextual data enables better AI analysis
3. **Performance Analytics**: Comprehensive metrics for benchmarking
4. **Risk Assessment**: Multi-dimensional risk evaluation
5. **Opportunity Identification**: Automated flagging of opportunities
6. **Compliance Monitoring**: Real-time PCAF compliance tracking
7. **Geographic Analysis**: Regional performance insights
8. **Temporal Trends**: Historical analysis and forecasting
9. **ESG Integration**: Environmental and social governance metrics
10. **Strategic Planning**: Data-driven decision support

## Usage in AI Insights

The enhanced metadata enables the AI system to:

- **Contextual Analysis**: Understand loan characteristics beyond just text
- **Pattern Recognition**: Identify trends across multiple dimensions
- **Risk Correlation**: Find relationships between risk factors
- **Opportunity Scoring**: Quantify potential opportunities
- **Performance Prediction**: Forecast outcomes based on historical patterns
- **Personalized Recommendations**: Tailor insights to specific loan segments
- **Automated Flagging**: Identify loans requiring attention
- **Benchmarking**: Compare performance against targets and peers

This comprehensive metadata structure transforms ChromaDB from a simple document store into a powerful analytical engine for portfolio management and AI-driven insights.