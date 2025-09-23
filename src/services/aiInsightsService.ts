// AI Insights Service - Manages AI insights data and integration with data ingestion
import { aiInsightsNarrativeService, InsightNarrative, PortfolioMetrics } from './aiInsightsNarrativeService';
import { dataSynchronizationService } from './dataSynchronizationService';

export interface AIInsightsState {
  insights: InsightNarrative | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  dataVersion: string;
}

export interface AIInsightsConfig {
  userRole: string;
  autoRefresh: boolean;
  refreshIntervalMinutes: number;
}

class AIInsightsService {
  private static instance: AIInsightsService;
  private state: AIInsightsState;
  private config: AIInsightsConfig;
  private listeners: Array<(state: AIInsightsState) => void> = [];
  private refreshTimer?: NodeJS.Timeout;
  private lastRefreshTime: Map<string, number> = new Map();
  private readonly REFRESH_DEBOUNCE_DELAY = 3000; // 3 seconds
  private activeRefreshes: Set<string> = new Set();

  static getInstance(): AIInsightsService {
    if (!AIInsightsService.instance) {
      AIInsightsService.instance = new AIInsightsService();
    }
    return AIInsightsService.instance;
  }

  constructor() {
    this.state = {
      insights: null,
      isLoading: false,
      lastUpdated: null,
      error: null,
      dataVersion: 'v1'
    };

    this.config = {
      userRole: 'risk_manager',
      autoRefresh: true,
      refreshIntervalMinutes: 30
    };

    this.setupDataSynchronizationListeners();
    this.setupAutoRefresh();
  }

  /**
   * Check if refresh should be allowed (prevents rapid successive refreshes)
   */
  private shouldAllowRefresh(refreshId: string): boolean {
    const now = Date.now();
    const lastTime = this.lastRefreshTime.get(refreshId) || 0;
    
    if (now - lastTime < this.REFRESH_DEBOUNCE_DELAY) {
      console.warn('AI Insights refresh debounced', { refreshId, timeSinceLastRefresh: now - lastTime });
      return false;
    }
    
    return true;
  }

  /**
   * Mark refresh as started
   */
  private markRefreshStarted(refreshId: string): void {
    this.activeRefreshes.add(refreshId);
    this.lastRefreshTime.set(refreshId, Date.now());
  }

  /**
   * Mark refresh as completed
   */
  private markRefreshCompleted(refreshId: string): void {
    this.activeRefreshes.delete(refreshId);
  }

  private setupDataSynchronizationListeners(): void {
    // Subscribe to AI insights updates from data synchronization service
    dataSynchronizationService.subscribeToComponent('ai-insights', (updateEvent) => {
      console.log('🤖 AI Insights Service: Received update event', updateEvent);
      
      if (updateEvent.action === 'recalculate') {
        this.handleDataIngestionUpdate(updateEvent.data);
      } else if (updateEvent.action === 'refresh') {
        this.refreshInsights();
      }
    });

    // Subscribe to insights updates from narrative service
    aiInsightsNarrativeService.subscribeToInsightsUpdates((insights) => {
      this.updateState({
        insights,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
        dataVersion: `v${Date.now()}`
      });
    });
  }

  private setupAutoRefresh(): void {
    if (this.config.autoRefresh) {
      this.refreshTimer = setInterval(() => {
        if (aiInsightsNarrativeService.areInsightsStale(this.config.refreshIntervalMinutes)) {
          console.log('🔄 AI Insights: Auto-refreshing stale insights');
          this.refreshInsights();
        }
      }, this.config.refreshIntervalMinutes * 60 * 1000);
    }
  }

  private async handleDataIngestionUpdate(ingestionData: any): Promise<void> {
    const updateId = `ingestion_${ingestionData.uploadId || Date.now()}`;
    
    // Check if update should be allowed (debouncing)
    if (!this.shouldAllowRefresh(updateId)) {
      console.log('🚫 AI Insights ingestion update debounced for:', updateId);
      return;
    }

    console.log('🔄 AI Insights Service: Processing data ingestion update', ingestionData);
    
    this.markRefreshStarted(updateId);
    this.updateState({
      isLoading: true,
      error: null
    });

    try {
      // The AI insights narrative service should already be updated by data synchronization
      // We just need to get the current insights
      const insights = aiInsightsNarrativeService.getCurrentInsights(this.config.userRole);
      
      if (insights) {
        this.updateState({
          insights,
          lastUpdated: new Date(),
          isLoading: false,
          dataVersion: `ingestion_${ingestionData.uploadId || Date.now()}`
        });
      } else {
        // Force refresh if no current insights available (but only if not recently refreshed)
        await this.refreshInsights();
      }
      
    } catch (error) {
      console.error('❌ AI Insights Service: Failed to process ingestion update:', error);
      this.updateState({
        isLoading: false,
        error: `Failed to update insights: ${(error as Error).message}`
      });
    } finally {
      this.markRefreshCompleted(updateId);
    }
  }

  async refreshInsights(userRole?: string): Promise<void> {
    const roleToUse = userRole || this.config.userRole;
    const refreshId = `refresh_${roleToUse}`;
    
    // Check if refresh should be allowed (debouncing)
    if (!this.shouldAllowRefresh(refreshId)) {
      console.log('🚫 AI Insights refresh debounced for role:', roleToUse);
      return;
    }

    // Check if refresh is already in progress
    if (this.activeRefreshes.has(refreshId)) {
      console.log('⏳ AI Insights refresh already in progress for role:', roleToUse);
      return;
    }
    
    console.log(`🔄 AI Insights Service: Refreshing insights for role: ${roleToUse}`);
    
    this.markRefreshStarted(refreshId);
    this.updateState({
      isLoading: true,
      error: null
    });

    try {
      const insights = await aiInsightsNarrativeService.forceRefreshInsights(roleToUse);
      
      this.updateState({
        insights,
        lastUpdated: new Date(),
        isLoading: false,
        dataVersion: `refresh_${Date.now()}`
      });
      
      console.log('✅ AI Insights Service: Insights refreshed successfully');
      
    } catch (error) {
      console.error('❌ AI Insights Service: Failed to refresh insights:', error);
      this.updateState({
        isLoading: false,
        error: `Failed to refresh insights: ${(error as Error).message}`
      });
    } finally {
      this.markRefreshCompleted(refreshId);
    }
  }

  async loadInsightsForRole(userRole: string): Promise<void> {
    if (userRole !== this.config.userRole) {
      this.config.userRole = userRole;
      await this.refreshInsights(userRole);
    }
  }

  getState(): AIInsightsState {
    return { ...this.state };
  }

  subscribe(listener: (state: AIInsightsState) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately call with current state
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private updateState(updates: Partial<AIInsightsState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error notifying AI insights listener:', error);
      }
    });
  }

  updateConfig(config: Partial<AIInsightsConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...config };
    
    // Restart auto-refresh if interval changed
    if (config.refreshIntervalMinutes && config.refreshIntervalMinutes !== oldConfig.refreshIntervalMinutes) {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
      this.setupAutoRefresh();
    }
    
    // Refresh insights if user role changed
    if (config.userRole && config.userRole !== oldConfig.userRole) {
      this.refreshInsights(config.userRole);
    }
  }

  // Check if insights are available and recent
  hasRecentInsights(maxAgeMinutes: number = 30): boolean {
    if (!this.state.insights || !this.state.lastUpdated) {
      return false;
    }
    
    const now = Date.now();
    const lastUpdated = this.state.lastUpdated instanceof Date 
      ? this.state.lastUpdated.getTime() 
      : new Date(this.state.lastUpdated).getTime();
    const maxAge = maxAgeMinutes * 60 * 1000;
    
    return (now - lastUpdated) < maxAge;
  }

  // Get insights summary for quick display
  getInsightsSummary(): { 
    hasInsights: boolean; 
    lastUpdated: string | null; 
    keyTakeaway: string | null;
    isStale: boolean;
  } {
    const hasInsights = !!this.state.insights;
    const lastUpdated = this.state.lastUpdated 
      ? (this.state.lastUpdated instanceof Date 
          ? this.state.lastUpdated.toLocaleString() 
          : new Date(this.state.lastUpdated).toLocaleString())
      : null;
    const keyTakeaway = this.state.insights?.keyTakeaways?.[0] || null;
    const isStale = !this.hasRecentInsights();
    
    return {
      hasInsights,
      lastUpdated,
      keyTakeaway,
      isStale
    };
  }

  // Cleanup method
  destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    this.listeners = [];
  }
}

export const aiInsightsService = AIInsightsService.getInstance();