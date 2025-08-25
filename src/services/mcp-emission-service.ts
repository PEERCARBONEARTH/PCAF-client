export interface EmissionFactor {
  id: string;
  source: 'PCAF' | 'Climatiq' | 'Regional' | 'Custom';
  category: string;
  subcategory: string;
  factor: number;
  unit: string;
  region: string;
  vintage: number;
  dataQuality: 1 | 2 | 3 | 4 | 5;
  lastUpdated: string;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  action: 'created' | 'updated' | 'verified' | 'deprecated';
  user: string;
  source: string;
  previousValue?: number;
  newValue?: number;
  reason: string;
}

export interface MCPProvider {
  id: string;
  name: string;
  type: 'PCAF' | 'Climatiq' | 'Regional';
  apiEndpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  factorCount: number;
}

export interface EmissionFactorComparison {
  category: string;
  pcafDefault: number;
  providorValue: number;
  customOverride?: number;
  recommendation: 'use_pcaf' | 'use_provider' | 'use_custom';
  reasoning: string;
  dataQualityScore: number;
}

class MCPEmissionService {
  private providers: MCPProvider[] = [
    {
      id: 'pcaf-1',
      name: 'PCAF Global Database',
      type: 'PCAF',
      apiEndpoint: 'https://api.pcaf.org/v2',
      status: 'connected',
      lastSync: '2024-01-30T10:30:00Z',
      factorCount: 2847
    },
    {
      id: 'climatiq-1',
      name: 'Climatiq API',
      type: 'Climatiq',
      apiEndpoint: 'https://api.climatiq.io/v1',
      status: 'connected',
      lastSync: '2024-01-30T09:15:00Z',
      factorCount: 12453
    },
    {
      id: 'regional-us',
      name: 'US EPA Grid Mix',
      type: 'Regional',
      apiEndpoint: 'https://api.epa.gov/emissions',
      status: 'connected',
      lastSync: '2024-01-30T08:00:00Z',
      factorCount: 843
    }
  ];

  private mockFactors: EmissionFactor[] = [
    {
      id: 'ef-1',
      source: 'PCAF',
      category: 'Motor Vehicles',
      subcategory: 'Passenger Cars - Gasoline',
      factor: 0.2041,
      unit: 'kg CO2e/km',
      region: 'Global',
      vintage: 2023,
      dataQuality: 2,
      lastUpdated: '2024-01-30T10:30:00Z',
      auditTrail: [
        {
          timestamp: '2024-01-30T10:30:00Z',
          action: 'updated',
          user: 'system',
          source: 'PCAF Database Sync',
          previousValue: 0.2039,
          newValue: 0.2041,
          reason: 'Annual factor update from PCAF'
        }
      ]
    },
    {
      id: 'ef-2',
      source: 'Climatiq',
      category: 'Real Estate',
      subcategory: 'Commercial Buildings - Electricity',
      factor: 0.3542,
      unit: 'kg CO2e/kWh',
      region: 'US',
      vintage: 2023,
      dataQuality: 1,
      lastUpdated: '2024-01-30T09:15:00Z',
      auditTrail: [
        {
          timestamp: '2024-01-30T09:15:00Z',
          action: 'verified',
          user: 'compliance-team',
          source: 'Climatiq Verification',
          reason: 'Quarterly compliance verification completed'
        }
      ]
    }
  ];

  async getProviders(): Promise<MCPProvider[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.providers;
  }

  async syncProvider(providerId: string): Promise<{ success: boolean; message: string; factorsUpdated: number }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }

    // Simulate sync process
    const factorsUpdated = Math.floor(Math.random() * 50) + 10;
    provider.lastSync = new Date().toISOString();
    
    return {
      success: true,
      message: `Successfully synced ${factorsUpdated} emission factors`,
      factorsUpdated
    };
  }

  async searchEmissionFactors(query: {
    category?: string;
    region?: string;
    vintage?: number;
    source?: string;
  }): Promise<EmissionFactor[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Filter mock factors based on query
    let results = this.mockFactors;
    
    if (query.category) {
      results = results.filter(f => 
        f.category.toLowerCase().includes(query.category!.toLowerCase()) ||
        f.subcategory.toLowerCase().includes(query.category!.toLowerCase())
      );
    }
    
    if (query.region) {
      results = results.filter(f => f.region === query.region);
    }
    
    if (query.vintage) {
      results = results.filter(f => f.vintage === query.vintage);
    }
    
    if (query.source) {
      results = results.filter(f => f.source === query.source);
    }
    
    return results;
  }

  async compareFactors(category: string, region: string): Promise<EmissionFactorComparison[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock comparison data
    return [
      {
        category: 'Motor Vehicles - Gasoline',
        pcafDefault: 0.2041,
        providorValue: 0.2038,
        customOverride: 0.2045,
        recommendation: 'use_custom',
        reasoning: 'Custom factor includes regional fuel composition variations',
        dataQualityScore: 2.1
      },
      {
        category: 'Commercial Real Estate - Electricity',
        pcafDefault: 0.3542,
        providorValue: 0.3498,
        recommendation: 'use_provider',
        reasoning: 'Provider factor is more recent and region-specific',
        dataQualityScore: 1.8
      }
    ];
  }

  async validateCalculation(
    loanData: any,
    selectedFactors: EmissionFactor[]
  ): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
    dataQualityScore: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Mock validation logic
    if (selectedFactors.some(f => f.dataQuality > 3)) {
      issues.push('Some emission factors have data quality scores above 3');
      recommendations.push('Consider using higher quality factors from primary sources');
    }
    
    if (selectedFactors.some(f => f.vintage < 2022)) {
      issues.push('Some emission factors are older than 2 years');
      recommendations.push('Update to more recent emission factors where available');
    }
    
    const avgDataQuality = selectedFactors.reduce((sum, f) => sum + f.dataQuality, 0) / selectedFactors.length;
    
    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
      dataQualityScore: avgDataQuality
    };
  }

  async createCustomFactor(factor: Omit<EmissionFactor, 'id' | 'lastUpdated' | 'auditTrail'>): Promise<EmissionFactor> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newFactor: EmissionFactor = {
      ...factor,
      id: `custom-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'created',
          user: 'current-user',
          source: 'Manual Entry',
          newValue: factor.factor,
          reason: 'Custom factor created for specific calculation requirements'
        }
      ]
    };
    
    this.mockFactors.push(newFactor);
    return newFactor;
  }
}

export const mcpEmissionService = new MCPEmissionService();