// AI Insights Core Functionality Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiInsightsNarrativeService } from '../aiInsightsNarrativeService';
import { dataSynchronizationService } from '../dataSynchronizationService';

describe('AI Insights Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Portfolio Metrics Extraction', () => {
    it('should extract portfolio metrics from ingestion result correctly', () => {
      const mockIngestionResult = {
        uploadId: 'test_upload_123',
        totalLoans: 1000,
        successfulCalculations: 950,
        totalEmissions: 2500.0,
        averageDataQuality: 2.5,
        processingTime: '60 seconds',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        fromMock: false
      };

      // Access private method for testing
      const extractMetrics = (aiInsightsNarrativeService as any)
        .extractPortfolioMetricsFromIngestion;
      
      const metrics = extractMetrics.call(
        aiInsightsNarrativeService,
        mockIngestionResult
      );

      expect(metrics).toEqual({
        totalFinancedEmissions: 2500.0,
        emissionIntensity: 0.05, // (2500 / (1000 * 50000)) * 1000
        dataQualityScore: 2.5,
        totalLoans: 1000,
        totalExposure: 50000000, // 1000 * 50000
        complianceStatus: 'Excellent',
        lastUpdated: new Date('2024-01-15T10:30:00Z'),
        dataVersion: 'ingestion_test_upload_123'
      });
    });

    it('should handle edge cases in metrics extraction', () => {
      const extractMetrics = (aiInsightsNarrativeService as any)
        .extractPortfolioMetricsFromIngestion;

      // Test with zero loans
      const zeroLoansResult = {
        uploadId: 'zero_test',
        totalLoans: 0,
        successfulCalculations: 0,
        totalEmissions: 0,
        averageDataQuality: 3.0,
        processingTime: '0 seconds',
        timestamp: new Date(),
        fromMock: false
      };

      const zeroMetrics = extractMetrics.call(
        aiInsightsNarrativeService,
        zeroLoansResult
      );

      expect(zeroMetrics.emissionIntensity).toBe(0);
      expect(zeroMetrics.totalExposure).toBe(0);
    });
  });

  describe('Emission Intensity Calculation', () => {
    it('should calculate emission intensity correctly', () => {
      const calculateIntensity = (aiInsightsNarrativeService as any)
        .calculateEmissionIntensity;

      expect(calculateIntensity.call(aiInsightsNarrativeService, 1000, 100)).toBe(0.2);
      expect(calculateIntensity.call(aiInsightsNarrativeService, 2500, 1000)).toBe(0.05);
      expect(calculateIntensity.call(aiInsightsNarrativeService, 0, 100)).toBe(0);
      expect(calculateIntensity.call(aiInsightsNarrativeService, 1000, 0)).toBe(0);
    });
  });

  describe('Compliance Status Determination', () => {
    it('should determine compliance status correctly', () => {
      const determineStatus = (aiInsightsNarrativeService as any)
        .determineComplianceStatus;

      expect(determineStatus.call(aiInsightsNarrativeService, 2.0)).toBe('Excellent');
      expect(determineStatus.call(aiInsightsNarrativeService, 2.5)).toBe('Excellent');
      expect(determineStatus.call(aiInsightsNarrativeService, 2.8)).toBe('Compliant');
      expect(determineStatus.call(aiInsightsNarrativeService, 3.0)).toBe('Compliant');
      expect(determineStatus.call(aiInsightsNarrativeService, 3.2)).toBe('Needs Improvement');
      expect(determineStatus.call(aiInsightsNarrativeService, 3.5)).toBe('Needs Improvement');
      expect(determineStatus.call(aiInsightsNarrativeService, 4.0)).toBe('Critical');
    });
  });

  describe('Data Synchronization Service Integration', () => {
    it('should calculate emission intensity in data sync service', () => {
      const mockIngestionResult = {
        uploadId: 'sync_test',
        totalLoans: 200,
        successfulCalculations: 190,
        totalEmissions: 1000.0,
        averageDataQuality: 2.3,
        processingTime: '30 seconds',
        timestamp: new Date(),
        fromMock: false
      };

      const calculateIntensity = (dataSynchronizationService as any)
        .calculateEmissionIntensity;
      
      const intensity = calculateIntensity.call(
        dataSynchronizationService,
        mockIngestionResult
      );

      // Expected: (1000 / (200 * 50000)) * 1000 = 0.1
      expect(intensity).toBe(0.1);
    });

    it('should determine compliance status in data sync service', () => {
      const determineStatus = (dataSynchronizationService as any)
        .determineComplianceStatus;

      expect(determineStatus.call(dataSynchronizationService, 2.0)).toBe('Excellent');
      expect(determineStatus.call(dataSynchronizationService, 2.8)).toBe('Compliant');
      expect(determineStatus.call(dataSynchronizationService, 3.2)).toBe('Needs Improvement');
      expect(determineStatus.call(dataSynchronizationService, 4.0)).toBe('Critical');
    });
  });

  describe('AI Insights Narrative Generation', () => {
    it('should generate insights with portfolio metrics', () => {
      const mockMetrics = {
        totalFinancedEmissions: 2500.0,
        emissionIntensity: 2.5,
        dataQualityScore: 2.8,
        totalLoans: 1000,
        totalExposure: 50000000,
        complianceStatus: 'Compliant',
        lastUpdated: new Date(),
        dataVersion: 'test_v1'
      };

      const insights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
        mockMetrics,
        'risk_manager'
      );

      expect(insights).toBeDefined();
      expect(insights.title).toBe('Portfolio Climate Performance Analysis');
      expect(insights.narrative).toContain('2,500');
      expect(insights.narrative).toContain('1,000');
      expect(insights.keyTakeaways.length).toBeGreaterThanOrEqual(3);
      expect(insights.actionItems.length).toBeGreaterThan(0);
      expect(insights.businessImpact).toBeTruthy();
      expect(insights.riskAssessment).toBeTruthy();
      expect(insights.benchmarkComparison).toBeTruthy();
      expect(insights.executiveSummary).toBeTruthy();
    });

    it('should generate different insights for different roles', () => {
      const mockMetrics = {
        totalFinancedEmissions: 1000.0,
        emissionIntensity: 2.0,
        dataQualityScore: 2.5,
        totalLoans: 500,
        totalExposure: 25000000,
        complianceStatus: 'Excellent'
      };

      const executiveInsights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
        mockMetrics,
        'executive'
      );

      const riskManagerInsights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
        mockMetrics,
        'risk_manager'
      );

      const complianceInsights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
        mockMetrics,
        'compliance_officer'
      );

      // Should have different content for different roles
      expect(executiveInsights.narrative).not.toBe(riskManagerInsights.narrative);
      expect(executiveInsights.actionItems).not.toEqual(riskManagerInsights.actionItems);
      expect(riskManagerInsights.narrative).not.toBe(complianceInsights.narrative);
      
      // All should have the same title
      expect(executiveInsights.title).toBe(riskManagerInsights.title);
      expect(riskManagerInsights.title).toBe(complianceInsights.title);
    });

    it('should handle different performance levels correctly', () => {
      const excellentMetrics = {
        totalFinancedEmissions: 1000.0,
        emissionIntensity: 1.8, // Excellent performance
        dataQualityScore: 2.2,  // Excellent quality
        totalLoans: 500,
        totalExposure: 25000000,
        complianceStatus: 'Excellent'
      };

      const poorMetrics = {
        totalFinancedEmissions: 5000.0,
        emissionIntensity: 3.5, // Poor performance
        dataQualityScore: 4.0,  // Poor quality
        totalLoans: 500,
        totalExposure: 25000000,
        complianceStatus: 'Critical'
      };

      const excellentInsights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
        excellentMetrics,
        'risk_manager'
      );

      const poorInsights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(
        poorMetrics,
        'risk_manager'
      );

      // Should contain different performance indicators
      expect(excellentInsights.narrative).toContain('exceptional');
      expect(poorInsights.narrative).toContain('concerning');
      
      // Should have different key takeaways
      expect(excellentInsights.keyTakeaways[0]).not.toBe(poorInsights.keyTakeaways[0]);
    });
  });

  describe('Portfolio Data Update', () => {
    it('should update portfolio data correctly', async () => {
      const mockMetrics = {
        totalFinancedEmissions: 1500.0,
        emissionIntensity: 3.0,
        dataQualityScore: 2.6,
        totalLoans: 750,
        totalExposure: 37500000,
        complianceStatus: 'Compliant'
      };

      await aiInsightsNarrativeService.updatePortfolioData(mockMetrics);

      // Verify the data was stored (accessing private property for testing)
      const currentMetrics = (aiInsightsNarrativeService as any).currentPortfolioMetrics;
      
      expect(currentMetrics).toBeDefined();
      expect(currentMetrics.totalFinancedEmissions).toBe(1500.0);
      expect(currentMetrics.totalLoans).toBe(750);
      expect(currentMetrics.lastUpdated).toBeInstanceOf(Date);
      expect(currentMetrics.dataVersion).toMatch(/^v\d+$/);
    });
  });

  describe('Insights Staleness Check', () => {
    it('should correctly identify stale insights', () => {
      // Set a timestamp in the past
      const pastTimestamp = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
      (aiInsightsNarrativeService as any).lastAnalysisTimestamp = pastTimestamp;

      expect(aiInsightsNarrativeService.areInsightsStale(30)).toBe(true);
      expect(aiInsightsNarrativeService.areInsightsStale(60)).toBe(false);
    });

    it('should identify fresh insights', () => {
      // Set a recent timestamp
      const recentTimestamp = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
      (aiInsightsNarrativeService as any).lastAnalysisTimestamp = recentTimestamp;

      expect(aiInsightsNarrativeService.areInsightsStale(30)).toBe(false);
      expect(aiInsightsNarrativeService.areInsightsStale(10)).toBe(true);
    });

    it('should handle missing timestamp', () => {
      (aiInsightsNarrativeService as any).lastAnalysisTimestamp = undefined;
      expect(aiInsightsNarrativeService.areInsightsStale(30)).toBe(true);
    });
  });
});