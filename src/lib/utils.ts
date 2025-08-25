import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PCAFDataQualityEngine, type PCAFOption } from "./pcaf-data-quality"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced PCAF Box 8 WDQS Calculator - Loan-weighted formula with PCAF option tracking
export function calculateWDQS(loans: { outstanding_balance: number; data_quality_score: number; pcaf_data_option?: PCAFOption }[]): number {
  if (loans.length === 0) return 0;
  
  const totalOutstandingBalance = loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
  
  if (totalOutstandingBalance === 0) return 0;
  
  const weightedScoreSum = loans.reduce((sum, loan) => 
    sum + (loan.outstanding_balance * loan.data_quality_score), 0);
    
  return weightedScoreSum / totalOutstandingBalance;
}

export function validateWDQSCompliance(score: number): boolean {
  return score <= 3.0; // PCAF recommended threshold
}

export function getWDQSComplianceLevel(score: number): {
  level: string;
  color: string;
  description: string;
} {
  if (score <= 2.5) {
    return {
      level: 'Excellent',
      color: 'text-green-600',
      description: 'Exceeds PCAF recommendations'
    };
  } else if (score <= 3.0) {
    return {
      level: 'Good',
      color: 'text-green-500',
      description: 'Meets PCAF recommendations'
    };
  } else if (score <= 3.5) {
    return {
      level: 'Acceptable',
      color: 'text-yellow-500',
      description: 'Acceptable but room for improvement'
    };
  } else {
    return {
      level: 'Needs Improvement',
      color: 'text-red-500',
      description: 'Below PCAF recommendations'
    };
  }
}

// Physical Emission Intensity Calculator
export function calculatePhysicalEmissionIntensity(loans: { financed_emissions: number; vehicle_count?: number }[]): {
  emissionsPerVehicle: number;
  vehicleCount: number;
} {
  if (loans.length === 0) return { emissionsPerVehicle: 0, vehicleCount: 0 };
  
  const totalEmissions = loans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
  const totalVehicles = loans.reduce((sum, loan) => sum + (loan.vehicle_count || 1), 0);
  
  return {
    emissionsPerVehicle: totalVehicles > 0 ? totalEmissions / totalVehicles : 0,
    vehicleCount: totalVehicles
  };
}

// Weighted Average Carbon Intensity (WACI) Calculator
export function calculateWACI(loans: { financed_emissions: number; outstanding_balance: number; company_revenue?: number }[]): number {
  if (loans.length === 0) return 0;
  
  // Group by company and calculate company-level metrics
  const companyMap = new Map<string, { emissions: number; exposure: number; revenue: number }>();
  
  loans.forEach(loan => {
    const companyId = `company_${Math.floor(Math.random() * 10) + 1}`; // Simulate company grouping
    const revenue = loan.company_revenue || loan.outstanding_balance * 2; // Estimate revenue
    
    if (!companyMap.has(companyId)) {
      companyMap.set(companyId, { emissions: 0, exposure: 0, revenue: 0 });
    }
    
    const company = companyMap.get(companyId)!;
    company.emissions += loan.financed_emissions;
    company.exposure += loan.outstanding_balance;
    company.revenue = Math.max(company.revenue, revenue);
  });
  
  let totalWeightedEmissions = 0;
  let totalWeightedRevenue = 0;
  
  companyMap.forEach(company => {
    totalWeightedEmissions += company.emissions * company.exposure;
    totalWeightedRevenue += company.revenue * company.exposure;
  });
  
  return totalWeightedRevenue > 0 ? (totalWeightedEmissions * 1000000) / totalWeightedRevenue : 0; // tCO2e/$M revenue
}

// Enhanced PCAF Metrics Compliance Status with Option Analysis
export function getPCAFMetricsCompliance(metrics: {
  absoluteEmissions: number;
  economicIntensity: number;
  physicalIntensity: number;
  waci: number;
  wdqs: number;
  pcafOptionDistribution?: Record<PCAFOption, number>;
}): {
  overall: 'excellent' | 'good' | 'acceptable' | 'needs-improvement';
  individual: Record<string, { status: string; color: string; message: string }>;
  pcafAnalysis?: {
    optionQuality: 'excellent' | 'good' | 'acceptable' | 'needs-improvement';
    recommendations: string[];
  };
} {
  const individual = {
    absoluteEmissions: {
      status: 'good',
      color: 'text-green-600',
      message: 'Baseline established for climate action'
    },
    economicIntensity: {
      status: metrics.economicIntensity <= 2.5 ? 'excellent' : metrics.economicIntensity <= 5.0 ? 'good' : 'needs-improvement',
      color: metrics.economicIntensity <= 2.5 ? 'text-green-600' : metrics.economicIntensity <= 5.0 ? 'text-blue-600' : 'text-red-600',
      message: metrics.economicIntensity <= 2.5 ? 'Excellent economic efficiency' : metrics.economicIntensity <= 5.0 ? 'Good economic performance' : 'Above industry benchmarks'
    },
    physicalIntensity: {
      status: metrics.physicalIntensity <= 3.0 ? 'excellent' : metrics.physicalIntensity <= 5.0 ? 'good' : 'needs-improvement',
      color: metrics.physicalIntensity <= 3.0 ? 'text-green-600' : metrics.physicalIntensity <= 5.0 ? 'text-blue-600' : 'text-red-600',
      message: metrics.physicalIntensity <= 3.0 ? 'Efficient per-vehicle emissions' : metrics.physicalIntensity <= 5.0 ? 'Acceptable vehicle efficiency' : 'High per-vehicle emissions'
    },
    waci: {
      status: metrics.waci <= 200 ? 'excellent' : metrics.waci <= 400 ? 'good' : 'needs-improvement',
      color: metrics.waci <= 200 ? 'text-green-600' : metrics.waci <= 400 ? 'text-blue-600' : 'text-red-600',
      message: metrics.waci <= 200 ? 'Low carbon intensity exposure' : metrics.waci <= 400 ? 'Moderate carbon exposure' : 'High carbon intensity exposure'
    },
    wdqs: {
      status: metrics.wdqs <= 2.5 ? 'excellent' : metrics.wdqs <= 3.0 ? 'good' : 'needs-improvement',
      color: metrics.wdqs <= 2.5 ? 'text-green-600' : metrics.wdqs <= 3.0 ? 'text-blue-600' : 'text-red-600',
      message: metrics.wdqs <= 2.5 ? 'Exceeds PCAF standards' : metrics.wdqs <= 3.0 ? 'Meets PCAF standards' : 'Below PCAF standards'
    }
  };
  
  const scores = Object.values(individual).map(item => {
    switch (item.status) {
      case 'excellent': return 4;
      case 'good': return 3;
      case 'acceptable': return 2;
      default: return 1;
    }
  });
  
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const overall = avgScore >= 3.5 ? 'excellent' : avgScore >= 2.5 ? 'good' : avgScore >= 1.5 ? 'acceptable' : 'needs-improvement';
  
  // Enhanced PCAF Option Analysis
  let pcafAnalysis: {
    optionQuality: 'excellent' | 'good' | 'acceptable' | 'needs-improvement';
    recommendations: string[];
  } | undefined;

  if (metrics.pcafOptionDistribution) {
    const optionDistribution = metrics.pcafOptionDistribution;
    const total = Object.values(optionDistribution).reduce((sum, count) => sum + count, 0);
    
    // Calculate quality based on option distribution
    const highQualityPercentage = ((optionDistribution['1a'] || 0) + (optionDistribution['1b'] || 0)) / total * 100;
    const mediumQualityPercentage = ((optionDistribution['2a'] || 0) + (optionDistribution['2b'] || 0)) / total * 100;
    const lowQualityPercentage = ((optionDistribution['3a'] || 0) + (optionDistribution['3b'] || 0)) / total * 100;
    
    let optionQuality: 'excellent' | 'good' | 'acceptable' | 'needs-improvement';
    const recommendations: string[] = [];
    
    if (highQualityPercentage >= 70) {
      optionQuality = 'excellent';
      recommendations.push('Excellent data quality - 70%+ using Options 1a/1b');
    } else if (highQualityPercentage >= 50) {
      optionQuality = 'good';
      recommendations.push('Good data quality - 50%+ using high-quality options');
    } else if (mediumQualityPercentage >= 30) {
      optionQuality = 'acceptable';
      recommendations.push('Acceptable data quality but room for improvement');
      if (lowQualityPercentage > 30) {
        recommendations.push('Consider collecting vehicle-specific data for Option 2a/2b loans');
      }
    } else {
      optionQuality = 'needs-improvement';
      recommendations.push('Data quality needs significant improvement');
      recommendations.push('Prioritize collecting actual fuel consumption or distance data');
      recommendations.push('Focus on obtaining vehicle make/model information');
    }
    
    // Add specific recommendations based on distribution
    if ((optionDistribution['3b'] || 0) / total > 0.2) {
      recommendations.push('More than 20% of loans using Option 3b - highest priority for data improvement');
    }
    
    if ((optionDistribution['1a'] || 0) / total < 0.1) {
      recommendations.push('Consider implementing fuel consumption tracking systems');
    }
    
    pcafAnalysis = { optionQuality, recommendations };
  }

  return { overall, individual, pcafAnalysis };
}

// PCAF Option Distribution Calculator
export function calculatePCAFOptionDistribution(loans: { pcaf_data_option?: PCAFOption }[]): Record<PCAFOption, number> {
  const distribution: Record<PCAFOption, number> = {
    '1a': 0, '1b': 0, '2a': 0, '2b': 0, '3a': 0, '3b': 0
  };
  
  loans.forEach(loan => {
    if (loan.pcaf_data_option) {
      distribution[loan.pcaf_data_option]++;
    }
  });
  
  return distribution;
}

// Enhanced PCAF Data Quality Assessment
export function assessPCAFDataQuality(loans: { 
  outstanding_balance: number; 
  data_quality_score: number; 
  pcaf_data_option?: PCAFOption;
  data_quality_drivers?: string[];
}[]): {
  wdqs: number;
  compliance_percentage: number;
  option_distribution: Record<PCAFOption, number>;
  quality_breakdown: {
    excellent: number;
    good: number;
    acceptable: number;
    needs_improvement: number;
  };
  recommendations: string[];
} {
  if (loans.length === 0) {
    return {
      wdqs: 0,
      compliance_percentage: 0,
      option_distribution: { '1a': 0, '1b': 0, '2a': 0, '2b': 0, '3a': 0, '3b': 0 },
      quality_breakdown: { excellent: 0, good: 0, acceptable: 0, needs_improvement: 0 },
      recommendations: ['No loans available for assessment']
    };
  }
  
  const wdqs = calculateWDQS(loans);
  const compliantLoans = loans.filter(loan => loan.data_quality_score <= 3).length;
  const compliance_percentage = (compliantLoans / loans.length) * 100;
  
  const option_distribution = calculatePCAFOptionDistribution(loans);
  
  // Quality breakdown
  const quality_breakdown = {
    excellent: loans.filter(loan => loan.data_quality_score <= 1.5).length,
    good: loans.filter(loan => loan.data_quality_score > 1.5 && loan.data_quality_score <= 2.5).length,
    acceptable: loans.filter(loan => loan.data_quality_score > 2.5 && loan.data_quality_score <= 3.5).length,
    needs_improvement: loans.filter(loan => loan.data_quality_score > 3.5).length
  };
  
  // Generate actionable recommendations
  const recommendations: string[] = [];
  
  if (wdqs > 3) {
    recommendations.push('Portfolio WDQS exceeds PCAF threshold (≤3). Prioritize data quality improvements.');
  }
  
  if (compliance_percentage < 80) {
    recommendations.push(`Only ${Math.round(compliance_percentage)}% of loans meet PCAF compliance. Target 80%+ compliance.`);
  }
  
  if (quality_breakdown.needs_improvement > loans.length * 0.2) {
    recommendations.push('More than 20% of loans have poor data quality. Focus on these high-impact improvements.');
  }
  
  // Option-specific recommendations
  const total = Object.values(option_distribution).reduce((sum, count) => sum + count, 0);
  const highQualityCount = (option_distribution['1a'] || 0) + (option_distribution['1b'] || 0);
  
  if (highQualityCount / total < 0.3) {
    recommendations.push('Less than 30% using high-quality options (1a/1b). Implement data collection programs.');
  }
  
  if ((option_distribution['3b'] || 0) / total > 0.3) {
    recommendations.push('High usage of Option 3b (lowest quality). Prioritize vehicle specification collection.');
  }
  
  return {
    wdqs: Math.round(wdqs * 100) / 100,
    compliance_percentage: Math.round(compliance_percentage * 10) / 10,
    option_distribution,
    quality_breakdown,
    recommendations
  };
}
