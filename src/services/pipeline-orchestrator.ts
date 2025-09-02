/**
 * Pipeline Orchestrator - Manages the complete data pipeline lifecycle
 * Coordinates between data extraction, transformation, embedding, and storage
 */

import { dataPipelineService } from './data-pipeline-service';
import { climateNarrativeService } from './climate-narrative-service';
import { portfolioService } from './portfolioService';

export interface PipelineSchedule {
  id: string;
  name: string;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  config: {
    fullRefresh: boolean;
    dataTypes: ('loans' | 'portfolio' | 'sectors' | 'risks')[];
    notifyOnCompletion: boolean;
    retryOnFailure: boolean;
  };
}

export interface PipelineStatus {
  isRunning: boolean;
  currentStage: 'idle' | 'extracting' | 'transforming' | 'embedding' | 'storing' | 'completing';
  progress: number;
  estimatedTimeRemaining: number;
  lastError?: string;
  metrics: {
    recordsProcessed: number;
    successRate: number;
    averageProcessingTime: number;
  };
}

class PipelineOrchestrator {
  private static instance: PipelineOrchestrator;
  private schedules: Map<string, PipelineSchedule> = new Map();
  private currentStatus: PipelineStatus;
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.currentStatus = {
      isRunning: false,
      currentStage: 'idle',
      progress: 0,
      estimatedTimeRemaining: 0,
      metrics: {
        recordsProcessed: 0,
        successRate: 100,
        averageProcessingTime: 0
      }
    };

    this.initializeDefaultSchedules();
  }

  static getInstance(): PipelineOrchestrator {
    if (!PipelineOrchestrator.instance) {
      PipelineOrchestrator.instance = new PipelineOrchestrator();
    }
    return PipelineOrchestrator.instance;
  }

  /**
   * Initialize default pipeline schedules
   */
  private initializeDefaultSchedules(): void {
    const defaultSchedules: PipelineSchedule[] = [
      {
        id: 'daily_full_refresh',
        name: 'Daily Full Data Refresh',
        frequency: 'daily',
        enabled: true,
        config: {
          fullRefresh: true,
          dataTypes: ['loans', 'portfolio', 'sectors', 'risks'],
          notifyOnCompletion: true,
          retryOnFailure: true
        }
      },
      {
        id: 'hourly_incremental',
        name: 'Hourly Incremental Update',
        frequency: 'hourly',
        enabled: false,
        config: {
          fullRefresh: false,
          dataTypes: ['loans', 'portfolio'],
          notifyOnCompletion: false,
          retryOnFailure: true
        }
      },
      {
        id: 'realtime_critical',
        name: 'Real-time Critical Updates',
        frequency: 'realtime',
        enabled: false,
        config: {
          fullRefresh: false,
          dataTypes: ['loans'],
          notifyOnCompletion: false,
          retryOnFailure: false
        }
      }
    ];

    defaultSchedules.forEach(schedule => {
      this.schedules.set(schedule.id, schedule);
    });
  }

  /**
   * Start the pipeline orchestrator
   */
  async start(): Promise<void> {
    console.log('🎯 Starting Pipeline Orchestrator...');

    // Start scheduled pipelines
    for (const [id, schedule] of this.schedules) {
      if (schedule.enabled) {
        this.scheduleJob(id, schedule);
      }
    }

    console.log('✅ Pipeline Orchestrator started');
  }

  /**
   * Stop the pipeline orchestrator
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Pipeline Orchestrator...');

    // Clear all scheduled jobs
    for (const [id, intervalId] of this.intervalIds) {
      clearInterval(intervalId);
      this.intervalIds.delete(id);
    }

    console.log('✅ Pipeline Orchestrator stopped');
  }

  /**
   * Run pipeline manually with custom configuration
   */
  async runPipeline(config?: {
    fullRefresh?: boolean;
    dataTypes?: string[];
    priority?: 'low' | 'normal' | 'high';
  }): Promise<void> {
    if (this.currentStatus.isRunning) {
      throw new Error('Pipeline is already running');
    }

    const startTime = Date.now();
    
    try {
      this.updateStatus({
        isRunning: true,
        currentStage: 'extracting',
        progress: 0,
        estimatedTimeRemaining: 300000 // 5 minutes estimate
      });

      console.log('🚀 Manual pipeline execution started');

      // Stage 1: Data Extraction (20%)
      this.updateStatus({ currentStage: 'extracting', progress: 20 });
      await this.sleep(1000); // Simulate processing time

      // Stage 2: Data Transformation (40%)
      this.updateStatus({ currentStage: 'transforming', progress: 40 });
      await this.sleep(1500);

      // Stage 3: Embedding Generation (70%)
      this.updateStatus({ currentStage: 'embedding', progress: 70 });
      await this.sleep(2000);

      // Stage 4: Data Storage (90%)
      this.updateStatus({ currentStage: 'storing', progress: 90 });
      
      // Run the actual pipeline
      const metrics = await dataPipelineService.runPipeline(config?.fullRefresh || false);

      // Stage 5: Completion (100%)
      this.updateStatus({ 
        currentStage: 'completing', 
        progress: 100,
        metrics: {
          recordsProcessed: metrics.totalRecordsProcessed,
          successRate: ((metrics.successfulEmbeddings / metrics.totalRecordsProcessed) * 100),
          averageProcessingTime: metrics.averageProcessingTime
        }
      });

      await this.sleep(500);

      console.log('✅ Manual pipeline execution completed');
      console.log(`📊 Processed ${metrics.totalRecordsProcessed} records in ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error('❌ Pipeline execution failed:', error);
      this.updateStatus({ 
        lastError: error.message,
        currentStage: 'idle',
        isRunning: false 
      });
      throw error;
    } finally {
      this.updateStatus({
        isRunning: false,
        currentStage: 'idle',
        progress: 0,
        estimatedTimeRemaining: 0
      });
    }
  }

  /**
   * Schedule a pipeline job
   */
  private scheduleJob(id: string, schedule: PipelineSchedule): void {
    const intervalMs = this.getIntervalMs(schedule.frequency);
    
    if (intervalMs > 0) {
      const intervalId = setInterval(async () => {
        try {
          console.log(`⏰ Running scheduled pipeline: ${schedule.name}`);
          await this.runScheduledPipeline(schedule);
          
          // Update last run time
          schedule.lastRun = new Date();
          schedule.nextRun = new Date(Date.now() + intervalMs);
          
        } catch (error) {
          console.error(`❌ Scheduled pipeline failed: ${schedule.name}`, error);
          
          if (schedule.config.retryOnFailure) {
            console.log(`🔄 Retrying pipeline: ${schedule.name}`);
            setTimeout(() => this.runScheduledPipeline(schedule), 60000); // Retry in 1 minute
          }
        }
      }, intervalMs);

      this.intervalIds.set(id, intervalId);
      
      // Set next run time
      schedule.nextRun = new Date(Date.now() + intervalMs);
    }
  }

  /**
   * Run a scheduled pipeline
   */
  private async runScheduledPipeline(schedule: PipelineSchedule): Promise<void> {
    if (this.currentStatus.isRunning) {
      console.log(`⏸️ Skipping scheduled pipeline (already running): ${schedule.name}`);
      return;
    }

    await this.runPipeline({
      fullRefresh: schedule.config.fullRefresh,
      dataTypes: schedule.config.dataTypes,
      priority: 'normal'
    });

    if (schedule.config.notifyOnCompletion) {
      this.notifyPipelineCompletion(schedule);
    }
  }

  /**
   * Get interval in milliseconds for frequency
   */
  private getIntervalMs(frequency: string): number {
    const intervals = {
      realtime: 0, // Handled separately
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000
    };
    return intervals[frequency] || 0;
  }

  /**
   * Update pipeline status
   */
  private updateStatus(updates: Partial<PipelineStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...updates };
    
    // Emit status update event (in a real app, you'd use an event emitter)
    console.log(`📊 Pipeline Status: ${this.currentStatus.currentStage} (${this.currentStatus.progress}%)`);
  }

  /**
   * Notify pipeline completion
   */
  private notifyPipelineCompletion(schedule: PipelineSchedule): void {
    console.log(`✅ Pipeline completed: ${schedule.name}`);
    // In a real implementation, this would send notifications via email, Slack, etc.
  }

  /**
   * Utility method for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Public API methods
   */

  /**
   * Get current pipeline status
   */
  getStatus(): PipelineStatus {
    return { ...this.currentStatus };
  }

  /**
   * Get all pipeline schedules
   */
  getSchedules(): PipelineSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Add or update a pipeline schedule
   */
  setSchedule(schedule: PipelineSchedule): void {
    const existingSchedule = this.schedules.get(schedule.id);
    
    // Clear existing interval if updating
    if (existingSchedule && this.intervalIds.has(schedule.id)) {
      clearInterval(this.intervalIds.get(schedule.id)!);
      this.intervalIds.delete(schedule.id);
    }

    this.schedules.set(schedule.id, schedule);

    // Start new schedule if enabled
    if (schedule.enabled) {
      this.scheduleJob(schedule.id, schedule);
    }
  }

  /**
   * Enable/disable a schedule
   */
  toggleSchedule(scheduleId: string, enabled: boolean): void {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }

    schedule.enabled = enabled;

    if (enabled) {
      this.scheduleJob(scheduleId, schedule);
    } else {
      const intervalId = this.intervalIds.get(scheduleId);
      if (intervalId) {
        clearInterval(intervalId);
        this.intervalIds.delete(scheduleId);
      }
    }
  }

  /**
   * Get pipeline health metrics
   */
  async getHealthMetrics(): Promise<{
    pipelineHealth: 'healthy' | 'warning' | 'critical';
    lastSuccessfulRun: Date | null;
    failureRate: number;
    averageRunTime: number;
    dataFreshness: number; // hours since last update
  }> {
    const metrics = await dataPipelineService.getLastRunMetrics();
    
    return {
      pipelineHealth: 'healthy', // Would be calculated based on recent runs
      lastSuccessfulRun: metrics?.lastRunTimestamp || null,
      failureRate: 0, // Would be calculated from run history
      averageRunTime: metrics?.averageProcessingTime || 0,
      dataFreshness: metrics ? (Date.now() - metrics.lastRunTimestamp.getTime()) / (1000 * 60 * 60) : 24
    };
  }

  /**
   * Trigger data quality assessment
   */
  async assessDataQuality(): Promise<{
    overallScore: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      affectedRecords: number;
    }>;
    recommendations: string[];
  }> {
    try {
      const portfolioData = await portfolioService.getPortfolioSummary();
      const loans = portfolioData.loans || [];
      
      const issues = [];
      let totalScore = 0;
      let scoreCount = 0;

      // Assess data quality issues
      const missingVehicleData = loans.filter(loan => !loan.vehicle_make || !loan.vehicle_model);
      if (missingVehicleData.length > 0) {
        issues.push({
          type: 'missing_vehicle_data',
          severity: 'medium' as const,
          description: 'Missing vehicle make/model data affects PCAF scoring',
          affectedRecords: missingVehicleData.length
        });
      }

      const missingEmissions = loans.filter(loan => !loan.financed_emissions || loan.financed_emissions === 0);
      if (missingEmissions.length > 0) {
        issues.push({
          type: 'missing_emissions',
          severity: 'high' as const,
          description: 'Missing emissions calculations prevent accurate reporting',
          affectedRecords: missingEmissions.length
        });
      }

      const poorDataQuality = loans.filter(loan => (loan.data_quality_score || 5) >= 4);
      if (poorDataQuality.length > 0) {
        issues.push({
          type: 'poor_data_quality',
          severity: 'high' as const,
          description: 'Poor PCAF data quality scores (≥4) indicate compliance issues',
          affectedRecords: poorDataQuality.length
        });
      }

      // Calculate overall score
      loans.forEach(loan => {
        if (loan.data_quality_score) {
          totalScore += loan.data_quality_score;
          scoreCount++;
        }
      });

      const overallScore = scoreCount > 0 ? totalScore / scoreCount : 5;

      const recommendations = [
        'Prioritize collecting vehicle specifications for high-value loans',
        'Implement automated emission calculations for missing data',
        'Focus on improving loans with PCAF scores ≥4',
        'Consider third-party data providers for missing information'
      ];

      return {
        overallScore,
        issues,
        recommendations
      };

    } catch (error) {
      console.error('Data quality assessment failed:', error);
      throw error;
    }
  }
}

export const pipelineOrchestrator = PipelineOrchestrator.getInstance();