// Test suite for Dataset RAG Service - Comprehensive Q&A with Banking Context

import { DatasetRAGService } from '../datasetRAGService';

describe('DatasetRAGService', () => {
  let service: DatasetRAGService;

  beforeEach(() => {
    service = DatasetRAGService.getInstance();
  });

  describe('High-Confidence Dataset Responses', () => {
    test('Portfolio Data Quality Question with Banking Context', async () => {
      const mockPortfolioContext = {
        totalLoans: 2847,
        totalExposure: 156000000,
        dataQuality: {
          averageScore: 2.8,
          distribution: { 2: 1200, 3: 800, 4: 600, 5: 247 },
          loansNeedingImprovement: 847,
          complianceStatus: 'compliant'
        },
        improvements: {
          option_5_to_4: Array(247).fill(0).map((_, i) => `loan_${i}`),
          option_4_to_3: Array(600).fill(0).map((_, i) => `loan_${i + 247}`)
        }
      };

      const response = await service.processQuery({
        query: 'What is my current portfolio data quality score?',
        sessionId: 'test_session',
        portfolioContext: mockPortfolioContext,
        userRole: 'risk_manager'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('2.8'); // Portfolio WDQS
      expect(response.response).toContain('2,847'); // Loan count
      expect(response.response).toContain('✅'); // Compliance status
      expect(response.response).toContain('COMPLIANT'); // Status text
      expect(response.response).toContain('Risk Assessment'); // Role-specific content
      expect(response.bankingContext.riskManagement).toBe(true);
      expect(response.actionItems).toBeDefined();
      expect(response.actionItems?.length).toBeGreaterThan(0);
    });

    test('PCAF Options Question with Executive Role', async () => {
      const response = await service.processQuery({
        query: 'What are the PCAF data quality options for motor vehicles?',
        sessionId: 'test_session',
        userRole: 'executive'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Option 1: Real Fuel Consumption Data');
      expect(response.response).toContain('Banking Implementation Guide');
      expect(response.response).toContain('Strategic Implementation Roadmap');
      expect(response.response).toContain('Business Case Summary');
      expect(response.executiveSummary).toBeDefined();
      expect(response.executiveSummary).toContain('Executive Summary');
      expect(response.actionItems).toContain('Review strategic implications with senior leadership team');
      expect(response.bankingContext.strategicPlanning).toBe(true);
    });

    test('Attribution Factor Calculation with Loan Officer Role', async () => {
      const response = await service.processQuery({
        query: 'How do I calculate attribution factors for vehicle loans?',
        sessionId: 'test_session',
        userRole: 'loan_officer'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Outstanding Balance ÷ Current Asset Value');
      expect(response.response).toContain('Commercial Banking Scenarios');
      expect(response.response).toContain('Banking System Integration');
      expect(response.response).toContain('Operational Procedures');
      expect(response.actionItems).toContain('Implement process improvements in daily operations');
      expect(response.bankingContext.loanOrigination).toBe(true);
      expect(response.bankingContext.creditRisk).toBe(true);
    });

    test('Compliance Requirements with Compliance Officer Role', async () => {
      const response = await service.processQuery({
        query: 'What PCAF score do I need for compliance?',
        sessionId: 'test_session',
        userRole: 'compliance_officer'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('≤ 3.0');
      expect(response.response).toContain('Supervisory Expectations');
      expect(response.response).toContain('Federal Reserve');
      expect(response.response).toContain('Examination Readiness Checklist');
      expect(response.actionItems).toContain('Review regulatory requirements and examination expectations');
      expect(response.bankingContext.regulatoryCompliance).toBe(true);
      expect(response.bankingContext.supervisoryExamination).toBe(true);
    });
  });

  describe('Portfolio Context Enhancement', () => {
    test('Portfolio Replacements with Real Data', async () => {
      const portfolioContext = {
        totalLoans: 1500,
        totalExposure: 75000000,
        dataQuality: {
          averageScore: 3.2,
          complianceStatus: 'needs_improvement'
        }
      };

      const response = await service.processQuery({
        query: 'What is my current portfolio data quality score?',
        sessionId: 'test_session',
        portfolioContext
      });

      expect(response.response).toContain('1,500'); // Formatted loan count
      expect(response.response).toContain('3.2'); // WDQS
      expect(response.response).toContain('⚠️'); // Non-compliant icon
      expect(response.response).toContain('NEEDS IMPROVEMENT'); // Status
      expect(response.response).toContain('90th (Supervisory Concern)'); // Percentile ranking
    });

    test('Role-Specific Portfolio Insights', async () => {
      const portfolioContext = {
        totalLoans: 2000,
        dataQuality: {
          averageScore: 2.5,
          complianceStatus: 'compliant',
          loansNeedingImprovement: 400
        },
        improvements: {
          option_5_to_4: Array(150).fill(0),
          option_4_to_3: Array(250).fill(0)
        }
      };

      // Test executive insights
      const execResponse = await service.processQuery({
        query: 'What is my portfolio status?',
        sessionId: 'test_session',
        portfolioContext,
        userRole: 'executive'
      });

      expect(execResponse.response).toContain('Executive Summary');
      expect(execResponse.response).toContain('Market Leader'); // WDQS 2.5

      // Test risk manager insights
      const riskResponse = await service.processQuery({
        query: 'What is my portfolio status?',
        sessionId: 'test_session',
        portfolioContext,
        userRole: 'risk_manager'
      });

      expect(riskResponse.response).toContain('Risk Assessment');
      expect(riskResponse.response).toContain('20.0% of portfolio needs improvement'); // 400/2000
    });
  });

  describe('Banking Context Integration', () => {
    test('Strategic Advisory Response includes Business Context', async () => {
      const response = await service.processQuery({
        query: 'How does PCAF compliance impact my competitive position?',
        sessionId: 'test_session',
        userRole: 'executive'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('C-Suite Briefing');
      expect(response.response).toContain('Market Positioning Assessment');
      expect(response.response).toContain('Revenue Impact Analysis');
      expect(response.response).toContain('Board-Level Recommendations');
      expect(response.bankingContext.strategicPlanning).toBe(true);
      expect(response.bankingContext.competitiveStrategy).toBe(true);
      expect(response.bankingContext.boardGovernance).toBe(true);
    });

    test('Operational Excellence includes Technical Implementation', async () => {
      const response = await service.processQuery({
        query: 'How do I integrate PCAF calculations into my loan origination system?',
        sessionId: 'test_session',
        userRole: 'loan_officer'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Enterprise Architecture Overview');
      expect(response.response).toContain('API Integration Points');
      expect(response.response).toContain('Real-Time Integration Example');
      expect(response.response).toContain('Security & Compliance Framework');
      expect(response.bankingContext.systemIntegration).toBe(true);
      expect(response.bankingContext.loanOrigination).toBe(true);
      expect(response.bankingContext.dataGovernance).toBe(true);
    });
  });

  describe('Question Matching Algorithm', () => {
    test('Exact Phrase Matching', async () => {
      const response = await service.processQuery({
        query: 'What are the PCAF data quality options?',
        sessionId: 'test_session'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Option 1');
      expect(response.response).toContain('Option 5');
    });

    test('Keyword Matching with Context', async () => {
      const response = await service.processQuery({
        query: 'How do I calculate attribution for my vehicle loans?',
        sessionId: 'test_session'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Attribution Factor');
      expect(response.response).toContain('Outstanding Amount ÷ Asset Value');
    });

    test('Banking Context Matching', async () => {
      const response = await service.processQuery({
        query: 'What are the regulatory compliance requirements?',
        sessionId: 'test_session'
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Supervisory Expectations');
      expect(response.bankingContext.regulatoryCompliance).toBe(true);
    });
  });

  describe('Role-Based Customization', () => {
    const testQuery = 'What are PCAF compliance requirements?';

    test('Executive Role Customization', async () => {
      const response = await service.processQuery({
        query: testQuery,
        sessionId: 'test_session',
        userRole: 'executive'
      });

      expect(response.executiveSummary).toBeDefined();
      expect(response.actionItems).toContain('Review strategic implications with senior leadership team');
      expect(response.actionItems).toContain('Assess resource allocation requirements and ROI projections');
    });

    test('Risk Manager Role Customization', async () => {
      const response = await service.processQuery({
        query: testQuery,
        sessionId: 'test_session',
        userRole: 'risk_manager'
      });

      expect(response.actionItems).toContain('Conduct risk assessment of current portfolio exposure');
      expect(response.actionItems).toContain('Update risk appetite statements and tolerance levels');
    });

    test('Compliance Officer Role Customization', async () => {
      const response = await service.processQuery({
        query: testQuery,
        sessionId: 'test_session',
        userRole: 'compliance_officer'
      });

      expect(response.actionItems).toContain('Review regulatory requirements and examination expectations');
      expect(response.actionItems).toContain('Update policies and procedures documentation');
    });

    test('Loan Officer Role Customization', async () => {
      const response = await service.processQuery({
        query: testQuery,
        sessionId: 'test_session',
        userRole: 'loan_officer'
      });

      expect(response.actionItems).toContain('Implement process improvements in daily operations');
      expect(response.actionItems).toContain('Update system configurations and data collection procedures');
    });
  });

  describe('Fallback Handling', () => {
    test('Unmatched Query Fallback', async () => {
      const response = await service.processQuery({
        query: 'What is the weather like today?',
        sessionId: 'test_session',
        userRole: 'loan_officer'
      });

      expect(response.confidence).toBe('medium');
      expect(response.response).toContain('I specialize in motor vehicle PCAF methodology');
      expect(response.response).toContain('operational implementation'); // Role-specific context
      expect(response.followUpQuestions.length).toBeGreaterThan(0);
    });

    test('Partial Match with Low Score', async () => {
      const response = await service.processQuery({
        query: 'Tell me about cars',
        sessionId: 'test_session'
      });

      expect(response.confidence).toBe('medium');
      expect(response.response).toContain('Available Topics');
      expect(response.followUpQuestions).toContain('What is my current portfolio data quality score?');
    });
  });

  describe('Dataset Statistics and Validation', () => {
    test('Dataset Statistics', () => {
      const stats = service.getDatasetStats();

      expect(stats.totalQuestions).toBeGreaterThan(0);
      expect(stats.categoryStats).toBeDefined();
      expect(stats.version).toBe('1.0');
      expect(stats.lastUpdated).toBeDefined();
      
      // Verify all categories have questions
      Object.values(stats.categoryStats).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });

    test('Response Quality Validation', async () => {
      const testQueries = [
        'What are PCAF options?',
        'How do I calculate attribution factors?',
        'What are compliance requirements?',
        'How do I improve data quality?'
      ];

      for (const query of testQueries) {
        const response = await service.processQuery({
          query,
          sessionId: 'test_session'
        });

        // All responses should have required elements
        expect(response.response).toBeDefined();
        expect(response.confidence).toBeDefined();
        expect(response.sources).toBeDefined();
        expect(response.followUpQuestions).toBeDefined();
        expect(response.bankingContext).toBeDefined();

        // High-confidence responses should be substantial
        if (response.confidence === 'high') {
          expect(response.response.length).toBeGreaterThan(500);
          expect(response.sources.length).toBeGreaterThan(0);
          expect(response.followUpQuestions.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Performance and Scalability', () => {
    test('Concurrent Query Processing', async () => {
      const queries = [
        'What are PCAF options?',
        'How do I calculate attribution factors?',
        'What are compliance requirements?',
        'How do I improve data quality?',
        'What is my portfolio status?'
      ];

      const promises = queries.map(query => 
        service.processQuery({
          query,
          sessionId: `test_session_${Math.random()}`
        })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.confidence).toBeDefined();
        expect(response.response).toBeDefined();
        expect(response.response.length).toBeGreaterThan(0);
      });
    });

    test('Large Portfolio Context Handling', async () => {
      const largePortfolioContext = {
        totalLoans: 50000,
        totalExposure: 2500000000,
        dataQuality: {
          averageScore: 2.9,
          distribution: { 1: 5000, 2: 15000, 3: 20000, 4: 8000, 5: 2000 },
          loansNeedingImprovement: 10000,
          complianceStatus: 'compliant'
        },
        improvements: {
          option_5_to_4: Array(2000).fill(0),
          option_4_to_3: Array(8000).fill(0),
          option_3_to_2: Array(20000).fill(0)
        }
      };

      const response = await service.processQuery({
        query: 'What is my current portfolio data quality score?',
        sessionId: 'test_session',
        portfolioContext: largePortfolioContext
      });

      expect(response.confidence).toBe('high');
      expect(response.response).toContain('50,000'); // Large loan count
      expect(response.response).toContain('2,500,000,000'); // Large exposure
      expect(response.response).toContain('2.9'); // WDQS
    });
  });
});

// Integration tests with mock portfolio service
describe('DatasetRAG Integration Tests', () => {
  test('End-to-End Query Processing with Portfolio Integration', async () => {
    const service = DatasetRAGService.getInstance();
    
    // Mock realistic portfolio data
    const portfolioContext = {
      totalLoans: 3500,
      totalExposure: 180000000,
      dataQuality: {
        averageScore: 3.1,
        distribution: { 2: 700, 3: 1400, 4: 1000, 5: 400 },
        loansNeedingImprovement: 1400,
        complianceStatus: 'needs_improvement'
      },
      improvements: {
        option_5_to_4: Array(400).fill(0).map((_, i) => `loan_${i}`),
        option_4_to_3: Array(1000).fill(0).map((_, i) => `loan_${i + 400}`),
        option_3_to_2: Array(1400).fill(0).map((_, i) => `loan_${i + 1400}`)
      }
    };

    const response = await service.processQuery({
      query: 'How can I improve my portfolio to achieve PCAF compliance?',
      sessionId: 'integration_test',
      portfolioContext,
      userRole: 'risk_manager'
    });

    // Verify comprehensive response
    expect(response.confidence).toBe('high');
    expect(response.response).toContain('3,500'); // Portfolio size
    expect(response.response).toContain('3.1'); // Current WDQS
    expect(response.response).toContain('⚠️'); // Non-compliant status
    expect(response.response).toContain('Risk Assessment'); // Role-specific content
    
    // Verify banking context
    expect(response.bankingContext.riskManagement).toBe(true);
    expect(response.actionItems).toBeDefined();
    expect(response.actionItems?.length).toBeGreaterThan(0);
    
    // Verify follow-up questions are relevant
    expect(response.followUpQuestions.some(q => 
      q.includes('prioritize') || q.includes('improve') || q.includes('compliance')
    )).toBe(true);
  });
});