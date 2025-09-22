import { apiClient } from './api';

export interface AvoidedEmissionsInputs {
  projectType: 'technology_substitution' | 'renewable_energy' | 'energy_efficiency';
  // Technology Substitution (EV vs ICE)
  baselineVehicleType?: string;
  baselineFuelEfficiency?: number;
  annualMileage?: number;
  vehicleLifetime?: number;
  // Renewable Energy
  capacity?: number;
  capacityFactor?: number;
  displacedEmissionFactor?: number;
  // Energy Efficiency
  baselineEnergyConsumption?: number;
  projectEnergyConsumption?: number;
  electricityEmissionFactor?: number;
  // Financial
  outstandingAmount: number;
  totalProjectCost: number;
}

export interface AvoidedEmissionsResult {
  projectId: string;
  projectName: string;
  projectType: string;
  annualAvoidedEmissions: number;
  lifetimeAvoidedEmissions: number;
  financedAvoidedEmissions: number;
  attributionFactor: number;
  dataQualityScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  methodology: string;
  validationChecks: {
    additionalityCheck: boolean;
    conservativenessCheck: boolean;
    consistencyCheck: boolean;
    completenessCheck: boolean;
  };
}

export interface AvoidedEmissionsPortfolioSummary {
  totalAvoidedEmissions: number;
  annualAvoidedEmissions: number;
  averageDataQuality: number;
  costOfAvoidance: number;
  projectCount: number;
  highConfidenceShare: number;
}

export interface PCAFComplianceStatus {
  separationFromCredits: boolean;
  methodologyDocumented: boolean;
  baselineJustified: boolean;
  uncertaintyDisclosed: boolean;
  overallCompliance: number;
}

export class AvoidedEmissionsService {
  /**
   * Calculate avoided emissions for a single project
   */
  static async calculateAvoidedEmissions(inputs: AvoidedEmissionsInputs): Promise<AvoidedEmissionsResult> {
    try {
      const response = await apiClient.calculateAvoidedEmissions(inputs);
      return response.data;
    } catch (error) {
      console.error('Failed to calculate avoided emissions:', error);
      throw new Error('Avoided emissions calculation failed');
    }
  }

  /**
   * Get portfolio-level avoided emissions summary
   */
  static async getPortfolioSummary(): Promise<AvoidedEmissionsPortfolioSummary> {
    try {
      const response = await apiClient.getAvoidedEmissionsPortfolioSummary();
      return response.data;
    } catch (error) {
      console.error('Failed to get portfolio summary:', error);
      throw new Error('Portfolio summary retrieval failed');
    }
  }

  /**
   * Get all project-level avoided emissions results
   */
  static async getProjectResults(): Promise<AvoidedEmissionsResult[]> {
    try {
      const response = await apiClient.getAvoidedEmissionsResults();
      return response.data;
    } catch (error) {
      console.error('Failed to get project results:', error);
      throw new Error('Project results retrieval failed');
    }
  }

  /**
   * Get PCAF compliance status for avoided emissions
   */
  static async getPCAFComplianceStatus(): Promise<PCAFComplianceStatus> {
    try {
      const response = await apiClient.getAvoidedEmissionsPCAFCompliance();
      return response.data;
    } catch (error) {
      console.error('Failed to get PCAF compliance status:', error);
      throw new Error('PCAF compliance status retrieval failed');
    }
  }

  /**
   * Generate PCAF-compliant avoided emissions report
   */
  static async generatePCAFReport(): Promise<Blob> {
    try {
      return await apiClient.generateAvoidedEmissionsPCAFReport();
    } catch (error) {
      console.error('Failed to generate PCAF report:', error);
      throw new Error('PCAF report generation failed');
    }
  }

  /**
   * Export avoided emissions data to Excel
   */
  static async exportToExcel(): Promise<Blob> {
    try {
      return await apiClient.exportAvoidedEmissionsToExcel();
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      throw new Error('Excel export failed');
    }
  }

  /**
   * Generate PCAF disclosure statement
   */
  static async generatePCAFDisclosure(): Promise<{
    summary: string;
    detailedDisclosure: string;
    methodologyStatement: string;
    limitations: string;
  }> {
    try {
      const response = await apiClient.generateAvoidedEmissionsPCAFDisclosure();
      return response.data;
    } catch (error) {
      console.error('Failed to generate PCAF disclosure:', error);
      throw new Error('PCAF disclosure generation failed');
    }
  }

  /**
   * Validate avoided emissions inputs
   */
  static validateInputs(inputs: AvoidedEmissionsInputs): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Common validations
    if (!inputs.outstandingAmount || inputs.outstandingAmount <= 0) {
      errors.push('Outstanding amount must be greater than 0');
    }

    if (!inputs.totalProjectCost || inputs.totalProjectCost <= 0) {
      errors.push('Total project cost must be greater than 0');
    }

    if (inputs.outstandingAmount > inputs.totalProjectCost) {
      errors.push('Outstanding amount cannot exceed total project cost');
    }

    // Project type specific validations
    switch (inputs.projectType) {
      case 'technology_substitution':
        if (!inputs.baselineVehicleType) {
          errors.push('Baseline vehicle type is required');
        }
        if (!inputs.baselineFuelEfficiency || inputs.baselineFuelEfficiency <= 0) {
          errors.push('Baseline fuel efficiency must be greater than 0');
        }
        if (!inputs.annualMileage || inputs.annualMileage <= 0) {
          errors.push('Annual mileage must be greater than 0');
        }
        if (!inputs.vehicleLifetime || inputs.vehicleLifetime <= 0) {
          errors.push('Vehicle lifetime must be greater than 0');
        }
        break;

      case 'renewable_energy':
        if (!inputs.capacity || inputs.capacity <= 0) {
          errors.push('Capacity must be greater than 0');
        }
        if (!inputs.capacityFactor || inputs.capacityFactor <= 0 || inputs.capacityFactor > 100) {
          errors.push('Capacity factor must be between 0 and 100');
        }
        if (!inputs.displacedEmissionFactor || inputs.displacedEmissionFactor <= 0) {
          errors.push('Displaced emission factor must be greater than 0');
        }
        break;

      case 'energy_efficiency':
        if (!inputs.baselineEnergyConsumption || inputs.baselineEnergyConsumption <= 0) {
          errors.push('Baseline energy consumption must be greater than 0');
        }
        if (!inputs.projectEnergyConsumption || inputs.projectEnergyConsumption <= 0) {
          errors.push('Project energy consumption must be greater than 0');
        }
        if (inputs.projectEnergyConsumption >= inputs.baselineEnergyConsumption) {
          errors.push('Project energy consumption must be less than baseline');
        }
        if (!inputs.electricityEmissionFactor || inputs.electricityEmissionFactor <= 0) {
          errors.push('Electricity emission factor must be greater than 0');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get project type display name
   */
  static getProjectTypeDisplayName(projectType: string): string {
    switch (projectType) {
      case 'technology_substitution':
        return 'Technology Substitution';
      case 'renewable_energy':
        return 'Renewable Energy';
      case 'energy_efficiency':
        return 'Energy Efficiency';
      default:
        return projectType;
    }
  }

  /**
   * Get confidence level color
   */
  static getConfidenceLevelColor(level: 'high' | 'medium' | 'low'): string {
    switch (level) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Format emissions value for display
   */
  static formatEmissions(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else {
      return value.toFixed(1);
    }
  }
}