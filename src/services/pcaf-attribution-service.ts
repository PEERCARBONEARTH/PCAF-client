import { apiClient } from './api';

export interface AttributionInputs {
  standard: 'A' | 'B' | 'C';
  assetClass: string;
  // Standard A (Enterprise Value-based)
  outstandingAmount?: number;
  enterpriseValueIncludingCash?: number;
  // Standard B (Outstanding Amount-based)
  totalEquityPlusDebt?: number;
  vehicleValueAtOrigination?: number; // For motor vehicles
  // Standard C (Committed Amount-based)
  committedAmount?: number;
  totalProjectCost?: number;
  drawdownAmount?: number;
  // Common
  dataQualityLevel: number;
}

export interface AttributionResult {
  attributionFactor: number;
  standard: string;
  assetClass: string;
  methodology: string;
  dataQualityAdjustment: number;
  finalAttributionFactor: number;
  validationChecks: {
    inputValidation: boolean;
    rangeValidation: boolean;
    consistencyCheck: boolean;
  };
  recommendations: string[];
}

export interface MultiAssetPortfolioSummary {
  totalFinancedEmissions: number;
  portfolioAttributionFactor: number;
  assetClassBreakdown: {
    [assetClass: string]: {
      emissions: number;
      attributionFactor: number;
      standard: string;
      count: number;
    };
  };
  standardsBreakdown: {
    standardA: { emissions: number; count: number };
    standardB: { emissions: number; count: number };
    standardC: { emissions: number; count: number };
  };
  dataQualityMetrics: {
    averageQuality: number;
    qualityDistribution: { [level: number]: number };
  };
}

export const ASSET_CLASSES = {
  'A': [
    { value: 'listed_equity', label: 'Listed Equity', description: 'Publicly traded company shares' },
    { value: 'corporate_bonds', label: 'Corporate Bonds', description: 'Corporate debt securities' },
    { value: 'sovereign_bonds', label: 'Sovereign Bonds', description: 'Government debt securities' }
  ],
  'B': [
    { value: 'business_loans', label: 'Business Loans', description: 'Commercial lending to businesses' },
    { value: 'unlisted_equity', label: 'Unlisted Equity', description: 'Private company investments' },
    { value: 'motor_vehicles', label: 'Motor Vehicles', description: 'Vehicle financing' },
    { value: 'mortgages', label: 'Mortgages', description: 'Residential property loans' },
    { value: 'commercial_real_estate', label: 'Commercial Real Estate', description: 'Commercial property financing' }
  ],
  'C': [
    { value: 'project_finance', label: 'Project Finance', description: 'Infrastructure and energy project financing' }
  ]
};

export class PCAFAttributionService {
  /**
   * Calculate attribution factor for a single asset
   */
  static async calculateAttribution(inputs: AttributionInputs): Promise<AttributionResult> {
    try {
      const response = await apiClient.calculateAttribution(inputs);
      return response.data;
    } catch (error) {
      console.error('Failed to calculate attribution:', error);
      throw new Error('Attribution calculation failed');
    }
  }

  /**
   * Get multi-asset class portfolio summary
   */
  static async getPortfolioSummary(): Promise<MultiAssetPortfolioSummary> {
    try {
      const response = await apiClient.getAttributionPortfolioSummary();
      return response.data;
    } catch (error) {
      console.error('Failed to get portfolio summary:', error);
      throw new Error('Portfolio summary retrieval failed');
    }
  }

  /**
   * Batch calculate attribution for multiple assets
   */
  static async batchCalculateAttribution(inputs: AttributionInputs[]): Promise<AttributionResult[]> {
    try {
      const response = await apiClient.batchCalculateAttribution(inputs);
      return response.data;
    } catch (error) {
      console.error('Failed to batch calculate attribution:', error);
      throw new Error('Batch attribution calculation failed');
    }
  }

  /**
   * Get attribution standards compliance report
   */
  static async getComplianceReport(): Promise<{
    overallCompliance: number;
    standardsImplemented: string[];
    assetClassesCovered: string[];
    dataQualityMetrics: any;
    recommendations: string[];
  }> {
    try {
      const response = await apiClient.getAttributionComplianceReport();
      return response.data;
    } catch (error) {
      console.error('Failed to get compliance report:', error);
      throw new Error('Compliance report retrieval failed');
    }
  }

  /**
   * Validate attribution inputs
   */
  static validateInputs(inputs: AttributionInputs): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Common validations
    if (!inputs.standard || !['A', 'B', 'C'].includes(inputs.standard)) {
      errors.push('Valid attribution standard (A, B, or C) is required');
    }

    if (!inputs.assetClass) {
      errors.push('Asset class is required');
    }

    if (!inputs.dataQualityLevel || inputs.dataQualityLevel < 1 || inputs.dataQualityLevel > 5) {
      errors.push('Data quality level must be between 1 and 5');
    }

    // Standard-specific validations
    switch (inputs.standard) {
      case 'A':
        if (!inputs.outstandingAmount || inputs.outstandingAmount <= 0) {
          errors.push('Outstanding amount must be greater than 0');
        }
        if (!inputs.enterpriseValueIncludingCash || inputs.enterpriseValueIncludingCash <= 0) {
          errors.push('Enterprise value including cash must be greater than 0');
        }
        if (inputs.outstandingAmount && inputs.enterpriseValueIncludingCash && 
            inputs.outstandingAmount > inputs.enterpriseValueIncludingCash) {
          errors.push('Outstanding amount cannot exceed enterprise value');
        }
        break;

      case 'B':
        if (!inputs.outstandingAmount || inputs.outstandingAmount <= 0) {
          errors.push('Outstanding amount must be greater than 0');
        }
        
        if (inputs.assetClass === 'motor_vehicles') {
          if (!inputs.vehicleValueAtOrigination || inputs.vehicleValueAtOrigination <= 0) {
            errors.push('Vehicle value at origination must be greater than 0');
          }
          if (inputs.outstandingAmount && inputs.vehicleValueAtOrigination && 
              inputs.outstandingAmount > inputs.vehicleValueAtOrigination) {
            errors.push('Outstanding amount cannot exceed vehicle value');
          }
        } else {
          if (!inputs.totalEquityPlusDebt || inputs.totalEquityPlusDebt <= 0) {
            errors.push('Total equity plus debt must be greater than 0');
          }
          if (inputs.outstandingAmount && inputs.totalEquityPlusDebt && 
              inputs.outstandingAmount > inputs.totalEquityPlusDebt) {
            errors.push('Outstanding amount cannot exceed total equity plus debt');
          }
        }
        break;

      case 'C':
        if (!inputs.committedAmount || inputs.committedAmount <= 0) {
          errors.push('Committed amount must be greater than 0');
        }
        if (!inputs.totalProjectCost || inputs.totalProjectCost <= 0) {
          errors.push('Total project cost must be greater than 0');
        }
        if (inputs.committedAmount && inputs.totalProjectCost && 
            inputs.committedAmount > inputs.totalProjectCost) {
          errors.push('Committed amount cannot exceed total project cost');
        }
        if (inputs.drawdownAmount && inputs.drawdownAmount < 0) {
          errors.push('Drawdown amount cannot be negative');
        }
        if (inputs.drawdownAmount && inputs.totalProjectCost && 
            inputs.drawdownAmount > inputs.totalProjectCost) {
          errors.push('Drawdown amount cannot exceed total project cost');
        }
        break;
    }

    // Asset class validation
    const validAssetClasses = ASSET_CLASSES[inputs.standard]?.map(ac => ac.value) || [];
    if (!validAssetClasses.includes(inputs.assetClass)) {
      errors.push(`Asset class ${inputs.assetClass} is not valid for Standard ${inputs.standard}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get standard description
   */
  static getStandardDescription(standard: 'A' | 'B' | 'C'): string {
    switch (standard) {
      case 'A':
        return 'Enterprise Value-Based Attribution - Used for listed equity, corporate bonds, and sovereign bonds';
      case 'B':
        return 'Outstanding Amount-Based Attribution - Used for business loans, unlisted equity, motor vehicles, mortgages, and commercial real estate';
      case 'C':
        return 'Committed Amount-Based Attribution - Used for project finance';
      default:
        return '';
    }
  }

  /**
   * Get asset class information
   */
  static getAssetClassInfo(assetClass: string): {
    label: string;
    description: string;
    standard: 'A' | 'B' | 'C';
  } | null {
    for (const [standard, classes] of Object.entries(ASSET_CLASSES)) {
      const classInfo = classes.find(c => c.value === assetClass);
      if (classInfo) {
        return {
          ...classInfo,
          standard: standard as 'A' | 'B' | 'C'
        };
      }
    }
    return null;
  }

  /**
   * Get data quality level description
   */
  static getDataQualityDescription(level: number): {
    label: string;
    description: string;
    color: string;
  } {
    const descriptions = {
      5: { label: 'Verified Actual', description: 'Asset-specific measured data with high confidence', color: 'text-green-600' },
      4: { label: 'Specific Data', description: 'Asset-specific data with medium confidence', color: 'text-blue-600' },
      3: { label: 'Average Data', description: 'Sector or regional average data', color: 'text-yellow-600' },
      2: { label: 'Proxy Data', description: 'Proxy data with significant uncertainty', color: 'text-orange-600' },
      1: { label: 'Estimated Data', description: 'Highly uncertain estimated data', color: 'text-red-600' }
    };

    return descriptions[level as keyof typeof descriptions] || descriptions[3];
  }

  /**
   * Calculate data quality adjustment factor
   */
  static getDataQualityAdjustment(level: number): number {
    const adjustments = {
      5: 0.0,   // No adjustment for highest quality
      4: 0.02,  // 2% adjustment
      3: 0.05,  // 5% adjustment
      2: 0.10,  // 10% adjustment
      1: 0.15   // 15% adjustment
    };

    return adjustments[level as keyof typeof adjustments] || 0.05;
  }

  /**
   * Format attribution factor for display
   */
  static formatAttributionFactor(factor: number): string {
    return `${(factor * 100).toFixed(2)}%`;
  }

  /**
   * Get attribution factor color based on value
   */
  static getAttributionFactorColor(factor: number): string {
    if (factor >= 0.5) return 'text-red-600';      // High attribution (>50%)
    if (factor >= 0.25) return 'text-orange-600';  // Medium attribution (25-50%)
    if (factor >= 0.1) return 'text-yellow-600';   // Low-medium attribution (10-25%)
    return 'text-green-600';                       // Low attribution (<10%)
  }

  /**
   * Generate attribution methodology explanation
   */
  static getMethodologyExplanation(standard: 'A' | 'B' | 'C', assetClass: string): string {
    switch (standard) {
      case 'A':
        return `Attribution Factor = Outstanding Amount ÷ Enterprise Value Including Cash. This method is used for ${assetClass} as it reflects the financial institution's share of the company's total enterprise value.`;
      
      case 'B':
        if (assetClass === 'motor_vehicles') {
          return `Attribution Factor = Outstanding Balance ÷ Vehicle Value at Origination. This method is used for motor vehicles as it reflects the financial institution's share of the vehicle's value.`;
        } else {
          return `Attribution Factor = Outstanding Amount ÷ Total Equity Plus Debt. This method is used for ${assetClass} as it reflects the financial institution's share of the borrower's total financing.`;
        }
      
      case 'C':
        return `Attribution Factor = Committed Amount ÷ Total Project Cost (with drawdown adjustments if applicable). This method is used for project finance as it reflects the financial institution's commitment to the project.`;
      
      default:
        return '';
    }
  }
}