/**
 * LMS Integration Service
 * Handles integration with bank Loan Management Systems for automated data ingestion
 */

import { pcafApiClient, CreateInstrumentRequest, InstrumentResponse, BulkOperationResponse } from './pcafApiClient';
import { toast } from "@/hooks/use-toast";

// LMS Data Structures
export interface LMSLoanData {
  loanId: string;
  borrowerName: string;
  borrowerTaxId?: string;
  loanAmount: number;
  currency: string;
  originationDate: string;
  maturityDate?: string;
  interestRate?: number;
  loanPurpose: string;
  collateralType: string;
  vehicleDetails?: {
    vin?: string;
    make: string;
    model: string;
    year: number;
    vehicleType: string;
    fuelType: string;
    estimatedValue: number;
  };
  lmsSystemId: string;
  lastUpdated: string;
  status: 'active' | 'closed' | 'defaulted' | 'restructured';
}

export interface LMSConnectionConfig {
  id: string;
  name: string;
  type: 'REST_API' | 'SOAP' | 'DATABASE' | 'FILE_TRANSFER';
  endpoint: string;
  authentication: {
    type: 'API_KEY' | 'OAUTH2' | 'BASIC_AUTH' | 'CERTIFICATE';
    credentials: Record<string, string>;
  };
  dataMapping: LMSDataMapping;
  syncSchedule: {
    enabled: boolean;
    frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MANUAL';
    time?: string; // For daily/weekly sync
  };
  filters: {
    loanTypes?: string[];
    minAmount?: number;
    maxAmount?: number;
    dateRange?: {
      from: string;
      to: string;
    };
  };
  isActive: boolean;
  lastSyncTime?: string;
  lastSyncStatus?: 'SUCCESS' | 'FAILED' | 'PARTIAL';
}

export interface LMSDataMapping {
  loanId: string;
  borrowerName: string;
  loanAmount: string;
  currency: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleType: string;
  fuelType: string;
  vehicleValue: string;
  // Optional mappings
  borrowerTaxId?: string;
  vin?: string;
  originationDate?: string;
  maturityDate?: string;
  interestRate?: string;
  loanPurpose?: string;
  status?: string;
}

export interface LMSSyncResult {
  connectionId: string;
  startTime: string;
  endTime: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: Array<{
    recordId: string;
    error: string;
    data?: any;
  }>;
  summary: {
    newInstruments: number;
    updatedInstruments: number;
    skippedInstruments: number;
  };
}

export interface EmissionsDataEnrichment {
  source: 'EPA' | 'EU' | 'MANUFACTURER' | 'ESTIMATED';
  dataQualityScore: number;
  annualEmissions: number;
  emissionsUnit: string;
  confidence: number;
  lastUpdated: string;
}

class LMSIntegrationService {
  private connections: Map<string, LMSConnectionConfig> = new Map();
  private syncInProgress: Set<string> = new Set();

  constructor() {
    this.loadConnections();
  }

  // Connection Management
  async createConnection(config: Omit<LMSConnectionConfig, 'id'>): Promise<LMSConnectionConfig> {
    const connection: LMSConnectionConfig = {
      ...config,
      id: this.generateConnectionId(),
      isActive: true,
    };

    // Test connection before saving
    const testResult = await this.testConnection(connection);
    if (!testResult.success) {
      throw new Error(`Connection test failed: ${testResult.error}`);
    }

    this.connections.set(connection.id, connection);
    await this.saveConnections();

    toast({
      title: "LMS Connection Created",
      description: `Successfully connected to ${connection.name}`,
    });

    return connection;
  }

  async updateConnection(id: string, updates: Partial<LMSConnectionConfig>): Promise<LMSConnectionConfig> {
    const connection = this.connections.get(id);
    if (!connection) {
      throw new Error(`Connection ${id} not found`);
    }

    const updatedConnection = { ...connection, ...updates };
    
    // Test connection if credentials or endpoint changed
    if (updates.endpoint || updates.authentication) {
      const testResult = await this.testConnection(updatedConnection);
      if (!testResult.success) {
        throw new Error(`Connection test failed: ${testResult.error}`);
      }
    }

    this.connections.set(id, updatedConnection);
    await this.saveConnections();

    return updatedConnection;
  }

  async deleteConnection(id: string): Promise<void> {
    if (this.syncInProgress.has(id)) {
      throw new Error('Cannot delete connection while sync is in progress');
    }

    this.connections.delete(id);
    await this.saveConnections();

    toast({
      title: "LMS Connection Deleted",
      description: "Connection has been removed successfully",
    });
  }

  getConnections(): LMSConnectionConfig[] {
    return Array.from(this.connections.values());
  }

  getConnection(id: string): LMSConnectionConfig | undefined {
    return this.connections.get(id);
  }

  // Data Synchronization
  async syncConnection(connectionId: string): Promise<LMSSyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    if (this.syncInProgress.has(connectionId)) {
      throw new Error('Sync already in progress for this connection');
    }

    this.syncInProgress.add(connectionId);

    try {
      const result = await this.performSync(connection);
      
      // Update connection with sync status
      connection.lastSyncTime = result.endTime;
      connection.lastSyncStatus = result.status;
      this.connections.set(connectionId, connection);
      await this.saveConnections();

      toast({
        title: "LMS Sync Complete",
        description: `Processed ${result.recordsProcessed} records, ${result.recordsSuccessful} successful`,
      });

      return result;
    } finally {
      this.syncInProgress.delete(connectionId);
    }
  }

  async syncAllConnections(): Promise<LMSSyncResult[]> {
    const activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.isActive && !this.syncInProgress.has(conn.id));

    const results = await Promise.allSettled(
      activeConnections.map(conn => this.syncConnection(conn.id))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<LMSSyncResult> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  // Data Processing
  async processLMSData(
    connectionId: string,
    lmsData: LMSLoanData[]
  ): Promise<BulkOperationResponse> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    // Convert LMS data to PCAF instrument format
    const instruments: CreateInstrumentRequest[] = [];
    const enrichmentPromises: Promise<EmissionsDataEnrichment>[] = [];

    for (const lmsLoan of lmsData) {
      try {
        // Enrich with emissions data
        const emissionsPromise = this.enrichEmissionsData(lmsLoan.vehicleDetails!);
        enrichmentPromises.push(emissionsPromise);

        // Convert to PCAF format (will be updated with emissions data later)
        const instrument = await this.convertLMSDataToPCAF(lmsLoan, connection.dataMapping);
        instruments.push(instrument);
      } catch (error) {
        console.error(`Failed to process LMS loan ${lmsLoan.loanId}:`, error);
      }
    }

    // Wait for all emissions enrichment to complete
    const emissionsData = await Promise.allSettled(enrichmentPromises);

    // Update instruments with enriched emissions data
    emissionsData.forEach((result, index) => {
      if (result.status === 'fulfilled' && instruments[index]) {
        instruments[index].emissionsData = {
          dataQualityScore: result.value.dataQualityScore,
          annualEmissions: result.value.annualEmissions,
          emissionsUnit: result.value.emissionsUnit,
        };
      }
    });

    // Bulk create instruments
    return await pcafApiClient.bulkCreateInstruments(instruments);
  }

  // Private Methods
  private async performSync(connection: LMSConnectionConfig): Promise<LMSSyncResult> {
    const startTime = new Date().toISOString();
    let recordsProcessed = 0;
    let recordsSuccessful = 0;
    let recordsFailed = 0;
    const errors: Array<{ recordId: string; error: string; data?: any }> = [];

    try {
      // Fetch data from LMS
      const lmsData = await this.fetchLMSData(connection);
      recordsProcessed = lmsData.length;

      // Process in batches to avoid overwhelming the API
      const batchSize = 50;
      const batches = this.chunkArray(lmsData, batchSize);

      for (const batch of batches) {
        try {
          const result = await this.processLMSData(connection.id, batch);
          recordsSuccessful += result.successCount;
          recordsFailed += result.failureCount;

          // Add batch errors to overall errors
          result.failures.forEach(failure => {
            errors.push({
              recordId: batch[failure.index]?.loanId || `batch-${failure.index}`,
              error: failure.error,
              data: failure.data,
            });
          });
        } catch (error) {
          recordsFailed += batch.length;
          batch.forEach(loan => {
            errors.push({
              recordId: loan.loanId,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          });
        }
      }

      const endTime = new Date().toISOString();
      const status: LMSSyncResult['status'] = recordsFailed === 0 ? 'SUCCESS' : 
                                            recordsSuccessful === 0 ? 'FAILED' : 'PARTIAL';

      return {
        connectionId: connection.id,
        startTime,
        endTime,
        status,
        recordsProcessed,
        recordsSuccessful,
        recordsFailed,
        errors,
        summary: {
          newInstruments: recordsSuccessful, // Simplified - in reality would track new vs updated
          updatedInstruments: 0,
          skippedInstruments: 0,
        },
      };
    } catch (error) {
      const endTime = new Date().toISOString();
      return {
        connectionId: connection.id,
        startTime,
        endTime,
        status: 'FAILED',
        recordsProcessed,
        recordsSuccessful,
        recordsFailed: recordsProcessed,
        errors: [{
          recordId: 'sync',
          error: error instanceof Error ? error.message : 'Unknown sync error',
        }],
        summary: {
          newInstruments: 0,
          updatedInstruments: 0,
          skippedInstruments: 0,
        },
      };
    }
  }

  private async fetchLMSData(connection: LMSConnectionConfig): Promise<LMSLoanData[]> {
    switch (connection.type) {
      case 'REST_API':
        return await this.fetchFromRestAPI(connection);
      case 'SOAP':
        return await this.fetchFromSOAP(connection);
      case 'DATABASE':
        return await this.fetchFromDatabase(connection);
      case 'FILE_TRANSFER':
        return await this.fetchFromFileTransfer(connection);
      default:
        throw new Error(`Unsupported connection type: ${connection.type}`);
    }
  }

  private async fetchFromRestAPI(connection: LMSConnectionConfig): Promise<LMSLoanData[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication headers
    switch (connection.authentication.type) {
      case 'API_KEY':
        headers['X-API-Key'] = connection.authentication.credentials.apiKey;
        break;
      case 'BASIC_AUTH':
        const auth = btoa(`${connection.authentication.credentials.username}:${connection.authentication.credentials.password}`);
        headers['Authorization'] = `Basic ${auth}`;
        break;
      case 'OAUTH2':
        headers['Authorization'] = `Bearer ${connection.authentication.credentials.accessToken}`;
        break;
    }

    // Build query parameters from filters
    const params = new URLSearchParams();
    if (connection.filters.loanTypes?.length) {
      params.append('loanTypes', connection.filters.loanTypes.join(','));
    }
    if (connection.filters.minAmount) {
      params.append('minAmount', connection.filters.minAmount.toString());
    }
    if (connection.filters.maxAmount) {
      params.append('maxAmount', connection.filters.maxAmount.toString());
    }
    if (connection.filters.dateRange) {
      params.append('fromDate', connection.filters.dateRange.from);
      params.append('toDate', connection.filters.dateRange.to);
    }

    const url = `${connection.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`LMS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapLMSResponse(data, connection.dataMapping);
  }

  private async fetchFromSOAP(connection: LMSConnectionConfig): Promise<LMSLoanData[]> {
    // SOAP implementation would go here
    throw new Error('SOAP integration not yet implemented');
  }

  private async fetchFromDatabase(connection: LMSConnectionConfig): Promise<LMSLoanData[]> {
    // Database integration would go here
    throw new Error('Database integration not yet implemented');
  }

  private async fetchFromFileTransfer(connection: LMSConnectionConfig): Promise<LMSLoanData[]> {
    // File transfer integration would go here
    throw new Error('File transfer integration not yet implemented');
  }

  private mapLMSResponse(data: any, mapping: LMSDataMapping): LMSLoanData[] {
    // This would map the LMS response to our standard format
    // Implementation depends on the specific LMS response structure
    if (!Array.isArray(data)) {
      data = data.loans || data.data || [data];
    }

    return data.map((item: any) => ({
      loanId: this.getNestedValue(item, mapping.loanId),
      borrowerName: this.getNestedValue(item, mapping.borrowerName),
      borrowerTaxId: mapping.borrowerTaxId ? this.getNestedValue(item, mapping.borrowerTaxId) : undefined,
      loanAmount: parseFloat(this.getNestedValue(item, mapping.loanAmount)),
      currency: this.getNestedValue(item, mapping.currency) || 'USD',
      originationDate: mapping.originationDate ? this.getNestedValue(item, mapping.originationDate) : new Date().toISOString(),
      loanPurpose: 'vehicle_financing',
      collateralType: 'motor_vehicle',
      vehicleDetails: {
        make: this.getNestedValue(item, mapping.vehicleMake),
        model: this.getNestedValue(item, mapping.vehicleModel),
        year: parseInt(this.getNestedValue(item, mapping.vehicleYear)),
        vehicleType: this.getNestedValue(item, mapping.vehicleType) || 'passenger_car',
        fuelType: this.getNestedValue(item, mapping.fuelType) || 'gasoline',
        estimatedValue: parseFloat(this.getNestedValue(item, mapping.vehicleValue)),
        vin: mapping.vin ? this.getNestedValue(item, mapping.vin) : undefined,
      },
      lmsSystemId: 'lms_system',
      lastUpdated: new Date().toISOString(),
      status: mapping.status ? this.getNestedValue(item, mapping.status) : 'active',
    }));
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async convertLMSDataToPCAF(
    lmsData: LMSLoanData,
    mapping: LMSDataMapping
  ): Promise<CreateInstrumentRequest> {
    return {
      borrowerName: lmsData.borrowerName,
      instrumentType: 'LOAN',
      instrumentAmount: lmsData.loanAmount,
      instrumentCurrency: lmsData.currency,
      vehicleValue: lmsData.vehicleDetails!.estimatedValue,
      vehicleCurrency: lmsData.currency,
      vehicle: {
        make: lmsData.vehicleDetails!.make,
        model: lmsData.vehicleDetails!.model,
        year: lmsData.vehicleDetails!.year,
        type: lmsData.vehicleDetails!.vehicleType,
        fuelType: lmsData.vehicleDetails!.fuelType,
      },
      emissionsData: {
        dataQualityScore: 5, // Will be updated with enriched data
        annualEmissions: 0, // Will be updated with enriched data
        emissionsUnit: 'tCO2e',
      },
      correlationId: `lms-${lmsData.lmsSystemId}-${lmsData.loanId}`,
    };
  }

  private async enrichEmissionsData(vehicleDetails: LMSLoanData['vehicleDetails']): Promise<EmissionsDataEnrichment> {
    if (!vehicleDetails) {
      throw new Error('Vehicle details required for emissions enrichment');
    }

    try {
      // This would integrate with external emissions databases
      // For now, return estimated data based on vehicle type and fuel
      const estimatedEmissions = this.estimateEmissions(vehicleDetails);
      
      return {
        source: 'ESTIMATED',
        dataQualityScore: 4, // Estimated data is typically quality score 4
        annualEmissions: estimatedEmissions,
        emissionsUnit: 'tCO2e',
        confidence: 0.7,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      // Fallback to default values
      return {
        source: 'ESTIMATED',
        dataQualityScore: 5,
        annualEmissions: 5.0, // Default estimate
        emissionsUnit: 'tCO2e',
        confidence: 0.3,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  private estimateEmissions(vehicleDetails: LMSLoanData['vehicleDetails']): number {
    if (!vehicleDetails) return 5.0;

    // Simple estimation based on vehicle type and fuel type
    const baseEmissions = {
      passenger_car: { gasoline: 4.5, diesel: 4.2, electric: 0, hybrid: 3.0 },
      suv: { gasoline: 6.5, diesel: 6.0, electric: 0, hybrid: 4.5 },
      truck: { gasoline: 8.0, diesel: 7.5, electric: 0, hybrid: 6.0 },
      commercial: { gasoline: 9.0, diesel: 8.5, electric: 0, hybrid: 7.0 },
    };

    const vehicleType = vehicleDetails.vehicleType as keyof typeof baseEmissions;
    const fuelType = vehicleDetails.fuelType as keyof typeof baseEmissions.passenger_car;
    
    return baseEmissions[vehicleType]?.[fuelType] || 5.0;
  }

  private async testConnection(connection: LMSConnectionConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Simplified connection test - in reality would test actual connectivity
      if (!connection.endpoint) {
        return { success: false, error: 'Endpoint is required' };
      }

      if (!connection.authentication.credentials) {
        return { success: false, error: 'Authentication credentials are required' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  private generateConnectionId(): string {
    return `lms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private async loadConnections(): Promise<void> {
    try {
      const stored = localStorage.getItem('pcaf_lms_connections');
      if (stored) {
        const connections = JSON.parse(stored) as LMSConnectionConfig[];
        connections.forEach(conn => this.connections.set(conn.id, conn));
      }
    } catch (error) {
      console.error('Failed to load LMS connections:', error);
    }
  }

  private async saveConnections(): Promise<void> {
    try {
      const connections = Array.from(this.connections.values());
      localStorage.setItem('pcaf_lms_connections', JSON.stringify(connections));
    } catch (error) {
      console.error('Failed to save LMS connections:', error);
    }
  }
}

// Export singleton instance
export const lmsIntegrationService = new LMSIntegrationService();

// Export types for use in components
export type {
  LMSLoanData,
  LMSConnectionConfig,
  LMSDataMapping,
  LMSSyncResult,
  EmissionsDataEnrichment,
};