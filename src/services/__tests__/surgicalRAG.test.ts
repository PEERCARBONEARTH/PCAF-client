// Test suite for Surgical RAG Service - Ensuring maximum precision and confidence

import { SurgicalRAGService } from '../surgicalRAGService';

describe('SurgicalRAGService', () => {
  let service: SurgicalRAGService;

  beforeEach(() => {
    service = SurgicalRAGService.getInstance();
  });

  describe('High-Confidence Methodology Questions', () => {
    test('PCAF Options Question', async () => {
      const response = await service.processQuery('What are the PCAF data quality options?');
      
      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Option 1: Real fuel consumption data');
      expect(response.response).toContain('Option 5: Asset class average');
      expect(response.response).toContain('Portfolio weighted average ≤ 3.0');
      expect(response.sources).toContain('PCAF Global Standard - Motor Vehicle Methodology');
    });

    test('Attribution Factor Calculation', async () => {
      const response = await service.processQuery('How do I calculate attribution factors?');
      
      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Outstanding Amount ÷ Asset Value');
      expect(response.response).toContain('$25,000 ÷ $40,000 = 0.625');
      expect(response.followUpQuestions).toContain('How do I get accurate vehicle valuations?');
    });

    test('Financed Emissions Calculation', async () => {
      const response = await service.processQuery('How do I calculate financed emissions?');
      
      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Attribution Factor × Annual Vehicle Emissions');
      expect(response.response).toContain('kg CO₂e');
      expect(response.response).toMatch(/\d+,\d+ kg CO₂e/); // Should contain example calculation
    });

    test('Compliance Requirements', async () => {
      const response = await service.processQuery('What are PCAF compliance requirements?');
      
      expect(response.confidence).toBe('high');
      expect(response.response).toContain('≤ 3.0');
      expect(response.response).toContain('WDQS');
      expect(response.response).toContain('Scope 3 Category 15');
    });

    test('Data Quality Improvement', async () => {
      const response = await service.processQuery('How can I improve my data quality?');
      
      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Option 5 → Option 4');
      expect(response.response).toContain('make, model, year');
      expect(response.response).toContain('Priority');
    });
  });

  describe('Portfolio-Enhanced Responses', () => {
    const mockPortfolioContext = {
      totalLoans: 2847,
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

    test('Portfolio Data Quality Analysis', async () => {
      const response = await service.processQuery('What is my current data quality score?', mockPortfolioContext);
      
      expect(response.confidence).toBe('high');
      expect(response.response).toContain('2,847');
      expect(response.response).toContain('2.8');
      expect(response.response).toContain('✅ Compliant');
      expect(response.response).toContain('847 loans need');
    });

    test('PCAF Options with Portfolio Context', async () => {
      const response = await service.processQuery('What are the PCAF options for my portfolio?', mockPortfolioContext);
      
      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Option 1: Real fuel consumption');
      expect(response.response).toContain('Your Portfolio Status');
      expect(response.response).toContain('2,847 motor vehicle loans');
      expect(response.response).toContain('Current WDQS: 2.8');
    });

    test('Improvement Strategy with Portfolio Data', async () => {
      const response = await service.processQuery('How do I improve my portfolio data quality?', mockPortfolioContext);
      
      expect(response.confidence).toBe('high');
      expect(response.response).toContain('Your Improvement Opportunities');
      expect(response.response).toContain('247 loans can move Option 5→4');
      expect(response.response).toContain('600 loans can move Option 4→3');
    });
  });

  describe('Edge Cases and Validation', () => {
    test('Vague Question Handling', async () => {
      const response = await service.processQuery('Tell me about PCAF');
      
      expect(response.confidence).toBe('medium');
      expect(response.response).toContain('I specialize in motor vehicle PCAF');
      expect(response.followUpQuestions.length).toBeGreaterThan(0);
    });

    test('Non-Motor Vehicle Question', async () => {
      const response = await service.processQuery('How do I calculate real estate emissions?');
      
      expect(response.confidence).toBe('medium');
      expect(response.response).toContain('motor vehicle PCAF');
      expect(response.followUpQuestions).toContain('What are the PCAF data quality options?');
    });

    test('Complex Portfolio Question Without Context', async () => {
      const response = await service.processQuery('Which of my loans have the worst data quality?');
      
      // Should still provide helpful response even without portfolio data
      expect(response.confidence).toBe('medium');
      expect(response.response).toContain('motor vehicle');
    });
  });

  describe('Response Quality Validation', () => {
    test('All High-Confidence Responses Include Required Elements', async () => {
      const testQueries = [
        'What are PCAF options?',
        'How do I calculate attribution factors?',
        'What are compliance requirements?',
        'How do I improve data quality?'
      ];

      for (const query of testQueries) {
        const response = await service.processQuery(query);
        
        if (response.confidence === 'high') {
          expect(response.sources.length).toBeGreaterThan(0);
          expect(response.followUpQuestions.length).toBeGreaterThan(0);
          expect(response.response.length).toBeGreaterThan(100); // Substantial content
          expect(response.response).not.toContain('I don\'t know'); // No uncertainty
        }
      }
    });

    test('Responses Contain No Hallucinated PCAF Scores', async () => {
      const response = await service.processQuery('What are the PCAF data quality options?');
      
      // Check that all mentioned scores are valid (1-5)
      const scoreMatches = response.response.match(/(?:score|option)\s*:?\s*(\d+)/gi);
      if (scoreMatches) {
        scoreMatches.forEach(match => {
          const score = parseInt(match.replace(/[^\d]/g, ''));
          expect(score).toBeGreaterThanOrEqual(1);
          expect(score).toBeLessThanOrEqual(5);
        });
      }
    });

    test('Attribution Factor Formula is Correct', async () => {
      const response = await service.processQuery('How do I calculate attribution factors?');
      
      expect(response.response).toContain('Outstanding Amount ÷ Asset Value');
      expect(response.response).not.toContain('Asset Value ÷ Outstanding Amount'); // Wrong formula
    });

    test('Compliance Threshold is Accurate', async () => {
      const response = await service.processQuery('What is the PCAF compliance threshold?');
      
      expect(response.response).toContain('≤ 3.0');
      expect(response.response).not.toContain('< 3.0'); // Should be ≤ not <
      expect(response.response).not.toContain('≤ 2.0'); // Wrong threshold
    });
  });

  describe('Follow-up Question Quality', () => {
    test('Follow-up Questions are Contextually Relevant', async () => {
      const response = await service.processQuery('What are PCAF data quality options?');
      
      const followUps = response.followUpQuestions;
      expect(followUps).toContain('How do I move from Option 5 to Option 4?');
      expect(followUps).toContain('What data do I need for Option 3?');
      
      // Should not contain irrelevant follow-ups
      expect(followUps.join(' ')).not.toContain('real estate');
      expect(followUps.join(' ')).not.toContain('power generation');
    });

    test('Portfolio Questions Generate Portfolio-Specific Follow-ups', async () => {
      const mockContext = {
        totalLoans: 100,
        dataQuality: { averageScore: 4.2, complianceStatus: 'needs_improvement' },
        improvements: { option_5_to_4: ['loan1'], option_4_to_3: ['loan2'] }
      };

      const response = await service.processQuery('What is my portfolio status?', mockContext);
      
      expect(response.followUpQuestions.some(q => 
        q.includes('prioritize') || q.includes('collect') || q.includes('improve')
      )).toBe(true);
    });
  });

  describe('Performance and Reliability', () => {
    test('Service Handles Multiple Concurrent Requests', async () => {
      const queries = [
        'What are PCAF options?',
        'How do I calculate attribution factors?',
        'What are compliance requirements?'
      ];

      const promises = queries.map(query => service.processQuery(query));
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.confidence).toBeDefined();
        expect(response.response).toBeDefined();
        expect(response.sources).toBeDefined();
      });
    });

    test('Service Provides Consistent Responses', async () => {
      const query = 'What are PCAF data quality options?';
      
      const response1 = await service.processQuery(query);
      const response2 = await service.processQuery(query);

      expect(response1.response).toBe(response2.response);
      expect(response1.confidence).toBe(response2.confidence);
    });
  });
});

// Integration test with actual portfolio service
describe('SurgicalRAG Integration', () => {
  test('Integration with Portfolio Service', async () => {
    // This would test actual integration with portfolio service
    // when portfolio data is available
    const service = SurgicalRAGService.getInstance();
    
    // Mock portfolio context that matches real data structure
    const mockPortfolioContext = {
      totalLoans: 1500,
      dataQuality: {
        averageScore: 3.2,
        distribution: { 3: 500, 4: 700, 5: 300 },
        loansNeedingImprovement: 1000,
        complianceStatus: 'needs_improvement'
      },
      improvements: {
        option_5_to_4: Array(300).fill(0).map((_, i) => `loan_${i}`),
        option_4_to_3: Array(700).fill(0).map((_, i) => `loan_${i + 300}`)
      }
    };

    const response = await service.processQuery('How can I improve my portfolio compliance?', mockPortfolioContext);
    
    expect(response.confidence).toBe('high');
    expect(response.response).toContain('1,500');
    expect(response.response).toContain('3.2');
    expect(response.response).toContain('⚠️'); // Non-compliant indicator
    expect(response.portfolioInsights).toBeDefined();
    expect(response.portfolioInsights.complianceStatus).toBe('needs_improvement');
  });
});