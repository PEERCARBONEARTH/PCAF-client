import { realTimeService } from './realTimeService';

export interface IngestionResult {
  uploadId: string;
  totalLoans: number;
  successfulCalculations: number;
  totalEmissions: number;
  averageDataQuality: number;
  processingTime: string;
  timestamp: Date;
  fromMock: boolean;
}

export interface PortfolioData {
  totalLoans: number;
  totalEmissions: number;
  averageDataQuality: number;
  lastUpdated: Date;
}

export interface ComplianceData {
  overallScore: number;
  dataQualityScore: number;
  coveragePercentage: number;
  lastUpdated: Date;
}

export interface AvoidedEmissionsData {
  totalAvoidedEmissions: number;
  projectCount: number;
  lastUpdated: Date;
}

export interface ComponentUpdateEvent {
  component: string;
  action: 'refresh' | 'update' | 'recalculate';
  data?: any;
  timestamp: Date;
}

class DataSynchronizationService {
  private static instance: DataSynchronizationService;
  private dataVersions: Map<string, string> = new Map();
  private updateListeners: Map<string, Array<(data: any) => void>> = new Map();
  private lastIngestionResult?: IngestionResult;
  private lastSyncTime: Map<string, number> = new Map();
  private readonly SYNC_DEBOUNCE_DELAY = 5000; // 5 seconds
  private activeSyncs: Set<string> = new Set();

  static getInstance(): DataSynchronizationService {
    if (!DataSynchronizationService.instance) {
      DataSynchronizationService.instance = new DataSynchronizationService();
    }
    return DataSynchronizationService.instance;
  }

  constructor() {
    this.initializeDataVersions();
    this.setupRealTimeListeners();
  }

  /**
   * Check if sync should be allowed (prevents rapid successive syncs)
   */
  private shouldAllowSync(syncId: string): boolean {
    const now = Date.now();
    const lastTime = this.lastSyncTime.get(syncId) || 0;
    
    if (now - lastTime < this.SYNC_DEBOUNCE_DELAY) {
      console.warn('Sync request debounced', { syncId, timeSinceLastSync: now - lastTime });
      return false;
    }
    
    return true;
  }

  /**
   * Mark sync as started
   */
  private markSyncStarted(syncId: string): void {
    this.activeSyncs.add(syncId);
    this.lastSyncTime.set(syncId, Date.now());
  }

  /**
   * Mark sync as completed
   */
  private markSyncCompleted(syncId: string): void {
    this.activeSyncs.delete(syncId);
  }

  private initializeDataVersions(): void {
    const components = [
      'dashboard',
      'ai-insights',
      'pcaf-compliance',
      'avoided-emissions',
      'overview',
      'analytics'
    ];

    components.forEach(component => {
      this.dataVersions.set(component, `v1_${Date.now()}`);
    });
  }

  private setupRealTimeListeners(): void {
    // Listen for workflow completion events
    realTimeService.subscribe('workflow_complete', (update) => {
      if (update.data.workflowId === 'data_ingestion') {
        this.onIngestionComplete(update.data.results);
      }
    });

    // Listen for data update events
    realTimeService.subscribe('portfolio_updated', (update) => {
      this.notifyComponentUpdate('dashboard', 'refresh', update.data);
      this.notifyComponentUpdate('overview', 'refresh', update.data);
    });

    realTimeService.subscribe('calculation_completed', (update) => {
      this.notifyComponentUpdate('pcaf-compliance', 'recalculate', update.data);
      this.notifyComponentUpdate('analytics', 'update', update.data);
    });
  }

  async onIngestionComplete(ingestionResult: IngestionResult): Promise<void> {
    const syncId = `ingestion_${ingestionResult.uploadId}`;
    
    // Check if we should allow this sync (debouncing)
    if (!this.shouldAllowSync(syncId)) {
      console.log('🚫 Sync request debounced for:', syncId);
      return;
    }

    // Check if sync is already in progress
    if (this.activeSyncs.has(syncId)) {
      console.log('⏳ Sync already in progress for:', syncId);
      return;
    }

    console.log('🚀 Data ingestion completed, synchronizing all components...', ingestionResult);
    
    this.lastIngestionResult = ingestionResult;
    this.markSyncStarted(syncId);
    
    try {
      // Update all components in parallel
      await Promise.all([
        this.updateDashboard(this.extractPortfolioData(ingestionResult)),
        this.updateAIInsights(ingestionResult),
        this.updatePCAFCompliance(this.extractComplianceData(ingestionResult)),
        this.updateAvoidedEmissions(this.extractAvoidedEmissionsData(ingestionResult)),
        this.updateOverviewAndAnalytics(ingestionResult)
      ]);

      console.log('All components synchronized successfully');
      
      // Notify real-time service of successful synchronization
      realTimeService.send({
        type: 'sync_complete',
        data: {
          components: Array.from(this.dataVersions.keys()),
          timestamp: Date.now(),
          ingestionId: ingestionResult.uploadId
        }
      });

    } catch (error) {
      console.error('Error during component synchronization:', error);
      
      // Notify of synchronization failure
      realTimeService.send({
        type: 'sync_failed',
        data: {
          error: error.message,
          timestamp: Date.now(),
          ingestionId: ingestionResult.uploadId
        }
      });
    } finally {
      this.markSyncCompleted(syncId);
    }
  }

  async refreshAllComponents(): Promise<void> {
    console.log('Refreshing all components...');
    
    const refreshPromises = Array.from(this.dataVersions.keys()).map(component => 
      this.refreshComponent(component)
    );

    try {
      await Promise.all(refreshPromises);
      console.log('All components refreshed successfully');
    } catch (error) {
      console.error('Error refreshing components:', error);
    }
  }

  private async refreshComponent(componentName: string): Promise<void> {
    // Update data version to trigger refresh
    this.setDataVersion(componentName, `v${Date.now()}`);
    
    // Notify component listeners
    this.notifyComponentUpdate(componentName, 'refresh');
  }

  async updateDashboard(portfolioData: PortfolioData): Promise<void> {
    console.log('Updating dashboard with new portfolio data...', portfolioData);
    
    // Simulate API call to update dashboard data
    await this.simulateApiCall('/dashboard/update', portfolioData);
    
    this.setDataVersion('dashboard', `v${Date.now()}`);
    this.notifyComponentUpdate('dashboard', 'update', portfolioData);
  }

  async updateAIInsights(ingestionResult: IngestionResult): Promise<void> {
    const aiInsightsId = `ai_insights_${ingestionResult.uploadId}`;
    
    // Check if AI insights update should be allowed
    if (!this.shouldAllowSync(aiInsightsId)) {
      console.log('🚫 AI insights update debounced for:', aiInsightsId);
      return;
    }

    console.log('🤖 Updating AI insights with new loan data...', ingestionResult);
    
    try {
      // Import AI insights service dynamically to avoid circular dependencies
      const { aiInsightsNarrativeService } = await import('./aiInsightsNarrativeService');
      
      // Extract portfolio metrics from ingestion result
      const portfolioMetrics = {
        totalFinancedEmissions: ingestionResult.totalEmissions,
        emissionIntensity: this.calculateEmissionIntensity(ingestionResult),
        dataQualityScore: ingestionResult.averageDataQuality,
        totalLoans: ingestionResult.totalLoans,
        totalExposure: ingestionResult.totalLoans * 50000, // Estimate average loan amount
        complianceStatus: this.determineComplianceStatus(ingestionResult.averageDataQuality),
        lastUpdated: ingestionResult.timestamp,
        dataVersion: `ingestion_${ingestionResult.uploadId}`
      };
      
      // Update AI insights with new portfolio data (with debouncing)
      await aiInsightsNarrativeService.updatePortfolioData(portfolioMetrics);
      
      // Trigger AI analysis refresh (only if not recently refreshed)
      await aiInsightsNarrativeService.refreshAIAnalysis('data_ingestion_complete', portfolioMetrics);
      
      // Simulate API call for backend integration (if needed)
      await this.simulateApiCall('/ai-insights/recalculate', {
        uploadId: ingestionResult.uploadId,
        loanCount: ingestionResult.totalLoans,
        dataQuality: ingestionResult.averageDataQuality,
        portfolioMetrics
      });
      
      this.setDataVersion('ai-insights', `v${Date.now()}`);
      this.notifyComponentUpdate('ai-insights', 'recalculate', {
        ...ingestionResult,
        portfolioMetrics
      });
      
      // Mark AI insights sync as completed
      this.markSyncCompleted(aiInsightsId);
      
      console.log('✅ AI insights updated successfully with ingestion data');
      
    } catch (error) {
      console.error('❌ Failed to update AI insights:', error);
      
      // Fallback to basic update without AI service integration
      await this.simulateApiCall('/ai-insights/recalculate', {
        uploadId: ingestionResult.uploadId,
        loanCount: ingestionResult.totalLoans,
        dataQuality: ingestionResult.averageDataQuality
      });
      
      this.setDataVersion('ai-insights', `v${Date.now()}`);
      this.notifyComponentUpdate('ai-insights', 'recalculate', ingestionResult);
      
      // Mark AI insights sync as completed even on error
      this.markSyncCompleted(aiInsightsId);
    }
  }

  private calculateEmissionIntensity(ingestionResult: IngestionResult): number {
    if (ingestionResult.totalLoans === 0) return 0;
    // Calculate emissions per $1000 of exposure (assuming average loan of $50k)
    const totalExposure = ingestionResult.totalLoans * 50000;
    return (ingestionResult.totalEmissions / totalExposure) * 1000;
  }

  private determineComplianceStatus(dataQualityScore: number): string {
    if (dataQualityScore <= 2.5) return 'Excellent';
    if (dataQualityScore <= 3.0) return 'Compliant';
    if (dataQualityScore <= 3.5) return 'Needs Improvement';
    return 'Critical';
  }

  async updatePCAFCompliance(complianceData: ComplianceData): Promise<void> {
    console.log('Updating PCAF compliance metrics...', complianceData);
    
    // Simulate PCAF compliance update
    await this.simulateApiCall('/pcaf-compliance/update', complianceData);
    
    this.setDataVersion('pcaf-compliance', `v${Date.now()}`);
    this.notifyComponentUpdate('pcaf-compliance', 'update', complianceData);
  }

  async updateAvoidedEmissions(avoidedEmissionsData: AvoidedEmissionsData): Promise<void> {
    console.log('Updating avoided emissions calculations...', avoidedEmissionsData);
    
    // Simulate avoided emissions update
    await this.simulateApiCall('/avoided-emissions/update', avoidedEmissionsData);
    
    this.setDataVersion('avoided-emissions', `v${Date.now()}`);
    this.notifyComponentUpdate('avoided-emissions', 'update', avoidedEmissionsData);
  }

  private async updateOverviewAndAnalytics(ingestionResult: IngestionResult): Promise<void> {
    console.log('Updating overview and analytics pages...', ingestionResult);
    
    const analyticsData = {
      totalEmissions: ingestionResult.totalEmissions,
      loanCount: ingestionResult.totalLoans,
      dataQuality: ingestionResult.averageDataQuality,
      lastUpdated: ingestionResult.timestamp
    };

    // Update both overview and analytics
    await Promise.all([
      this.simulateApiCall('/overview/update', analyticsData),
      this.simulateApiCall('/analytics/update', analyticsData)
    ]);
    
    this.setDataVersion('overview', `v${Date.now()}`);
    this.setDataVersion('analytics', `v${Date.now()}`);
    
    this.notifyComponentUpdate('overview', 'update', analyticsData);
    this.notifyComponentUpdate('analytics', 'update', analyticsData);
  }

  // Data extraction helpers
  private extractPortfolioData(ingestionResult: IngestionResult): PortfolioData {
    return {
      totalLoans: ingestionResult.totalLoans,
      totalEmissions: ingestionResult.totalEmissions,
      averageDataQuality: ingestionResult.averageDataQuality,
      lastUpdated: ingestionResult.timestamp
    };
  }

  private extractComplianceData(ingestionResult: IngestionResult): ComplianceData {
    return {
      overallScore: Math.min(95, 85 + (ingestionResult.averageDataQuality - 3) * 5), // Simulate score based on data quality
      dataQualityScore: ingestionResult.averageDataQuality,
      coveragePercentage: Math.min(100, 80 + (ingestionResult.successfulCalculations / ingestionResult.totalLoans) * 20),
      lastUpdated: ingestionResult.timestamp
    };
  }

  private extractAvoidedEmissionsData(ingestionResult: IngestionResult): AvoidedEmissionsData {
    return {
      totalAvoidedEmissions: ingestionResult.totalEmissions * 0.15, // Simulate 15% avoided emissions
      projectCount: Math.floor(ingestionResult.totalLoans * 0.3), // Simulate 30% of loans have avoided emissions
      lastUpdated: ingestionResult.timestamp
    };
  }

  // Component subscription methods
  subscribeToComponent(componentName: string, callback: (data: any) => void): () => void {
    if (!this.updateListeners.has(componentName)) {
      this.updateListeners.set(componentName, []);
    }
    
    this.updateListeners.get(componentName)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.updateListeners.get(componentName);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  private notifyComponentUpdate(componentName: string, action: 'refresh' | 'update' | 'recalculate', data?: any): void {
    const listeners = this.updateListeners.get(componentName) || [];
    const updateEvent: ComponentUpdateEvent = {
      component: componentName,
      action,
      data,
      timestamp: new Date()
    };

    listeners.forEach(listener => {
      try {
        listener(updateEvent);
      } catch (error) {
        console.error(`Error notifying ${componentName} listener:`, error);
      }
    });
  }

  // Data versioning methods
  getDataVersion(component: string): string {
    return this.dataVersions.get(component) || 'v1';
  }

  setDataVersion(component: string, version: string): void {
    this.dataVersions.set(component, version);
  }

  isDataStale(component: string, clientVersion?: string): boolean {
    if (!clientVersion) return true;
    
    const currentVersion = this.getDataVersion(component);
    return clientVersion !== currentVersion;
  }

  // Utility methods
  private async simulateApiCall(endpoint: string, data: any): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    console.log(`Simulated API call to ${endpoint}:`, data);
    
    // In a real implementation, this would make actual API calls
    // For now, we just simulate the delay and logging
  }

  getLastIngestionResult(): IngestionResult | undefined {
    return this.lastIngestionResult;
  }

  // Check if we have recent ingestion data
  hasRecentIngestionData(): boolean {
    if (!this.lastIngestionResult) return false;
    
    const now = Date.now();
    const ingestionTime = this.lastIngestionResult.timestamp.getTime();
    const oneHour = 60 * 60 * 1000;
    
    return (now - ingestionTime) < oneHour; // Data is recent if within last hour
  }

  // Force refresh specific component
  async forceRefreshComponent(componentName: string): Promise<void> {
    console.log(`Force refreshing component: ${componentName}`);
    await this.refreshComponent(componentName);
  }

  // Get synchronization status
  getSynchronizationStatus(): Record<string, { version: string; lastUpdated: Date }> {
    const status: Record<string, { version: string; lastUpdated: Date }> = {};
    
    this.dataVersions.forEach((version, component) => {
      status[component] = {
        version,
        lastUpdated: new Date() // In real implementation, track actual update times
      };
    });
    
    return status;
  }
}

export const dataSynchronizationService = DataSynchronizationService.getInstance();