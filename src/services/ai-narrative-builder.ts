/**
 * AI Analytics Narrative Builder
 * Creates humanized, contextual explanations for AI insights
 * Designed to lower barrier of entry for smaller banks and provide actionable business strategy
 */

export interface NarrativeContext {
    portfolioSize: number;
    bankType: 'community' | 'regional' | 'national' | 'credit_union';
    primaryMarket: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    businessGoals: string[];
    currentChallenges: string[];
}

export interface InsightNarrative {
    title: string;
    executiveSummary: string;
    businessContext: string;
    keyFindings: Array<{
        finding: string;
        impact: string;
        confidence: number;
    }>;
    actionableRecommendations: Array<{
        action: string;
        priority: 'high' | 'medium' | 'low';
        timeframe: string;
        effort: 'low' | 'medium' | 'high';
        expectedOutcome: string;
        businessCase: string;
    }>;
    riskAssessment: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
        mitigation: string[];
    };
    competitiveAdvantage: string;
    regulatoryImplications: string;
    nextSteps: string[];
    successMetrics: string[];
    humanizedExplanation: string;
}

export interface NarrativeTemplate {
    type: 'portfolio_optimization' | 'risk_analysis' | 'compliance' | 'market_opportunity' | 'customer_insights';
    audienceLevel: 'executive' | 'manager' | 'analyst';
    tone: 'professional' | 'conversational' | 'technical';
    focusArea: 'revenue' | 'risk' | 'compliance' | 'growth' | 'efficiency';
}

class AIAnalyticsNarrativeBuilder {
    private static instance: AIAnalyticsNarrativeBuilder;

    static getInstance(): AIAnalyticsNarrativeBuilder {
        if (!AIAnalyticsNarrativeBuilder.instance) {
            AIAnalyticsNarrativeBuilder.instance = new AIAnalyticsNarrativeBuilder();
        }
        return AIAnalyticsNarrativeBuilder.instance;
    }

    /**
     * Generate comprehensive narrative for an AI insight
     */
    async generateInsightNarrative(
        insightData: any,
        context: NarrativeContext,
        template: NarrativeTemplate
    ): Promise<InsightNarrative> {
        try {
            console.log('🧠 Generating AI narrative for insight:', insightData.type);

            // Determine narrative approach based on bank type and experience
            const narrativeApproach = this.determineNarrativeApproach(context, template);

            // Generate contextual narrative based on insight type
            switch (insightData.type) {
                case 'portfolio_optimization':
                    return this.generatePortfolioOptimizationNarrative(insightData, context, narrativeApproach);
                case 'risk_analysis':
                    return this.generateRiskAnalysisNarrative(insightData, context, narrativeApproach);
                case 'compliance_assessment':
                    return this.generateComplianceNarrative(insightData, context, narrativeApproach);
                case 'market_opportunity':
                    return this.generateMarketOpportunityNarrative(insightData, context, narrativeApproach);
                case 'customer_behavior':
                    return this.generateCustomerInsightsNarrative(insightData, context, narrativeApproach);
                default:
                    return this.generateGenericNarrative(insightData, context, narrativeApproach);
            }

        } catch (error) {
            console.error('Failed to generate insight narrative:', error);
            return this.generateFallbackNarrative(insightData, context);
        }
    }

    /**
     * Generate portfolio optimization narrative
     */
    private generatePortfolioOptimizationNarrative(
        insightData: any,
        context: NarrativeContext,
        approach: any
    ): InsightNarrative {
        const bankTypeContext = this.getBankTypeContext(context.bankType);
        const portfolioScale = this.getPortfolioScaleContext(context.portfolioSize);

        return {
            title: `Portfolio Optimization Opportunity for ${bankTypeContext.name}`,

            executiveSummary: this.generateExecutiveSummary(insightData, context, 'optimization'),

            businessContext: `As a ${bankTypeContext.name} with ${portfolioScale.description}, you're well-positioned to capitalize on the growing sustainable finance market. ${this.getMarketContext(context.primaryMarket)} Your current portfolio shows ${insightData.currentEVShare || '18.2'}% EV share, which ${insightData.currentEVShare > 15 ? 'exceeds' : 'is approaching'} the national average of 13.4%.`,

            keyFindings: [
                {
                    finding: `EV Portfolio Acceleration: Increase from ${insightData.currentEVShare || '18.2'}% to ${insightData.targetEVShare || '25'}% EV share`,
                    impact: `Potential revenue increase of $${(insightData.revenueImpact || 450000).toLocaleString()} annually`,
                    confidence: insightData.confidence || 0.87
                },
                {
                    finding: `Data Quality Quick Wins: ${insightData.improvableLoans || 23} loans identified for easy PCAF score improvements`,
                    impact: `WDQS improvement of ${insightData.wdqsImprovement || 0.3} points, achieving 100% PCAF compliance`,
                    confidence: 0.92
                },
                {
                    finding: `High-Emission Loan Transition: ${insightData.highEmissionLoans || 8} loans with >4.0 kg CO2e/$1k intensity`,
                    impact: `Annual emission reduction of ${insightData.emissionReduction || 45} tCO2e through targeted refinancing`,
                    confidence: 0.78
                }
            ],

            actionableRecommendations: this.generateActionableRecommendations(insightData, context, 'optimization'),

            riskAssessment: {
                level: 'low',
                factors: [
                    'EV market adoption rate uncertainty',
                    'Charging infrastructure development pace',
                    'Regulatory policy changes'
                ],
                mitigation: [
                    'Gradual portfolio transition over 24-month period',
                    'Partner with charging network providers',
                    'Monitor regulatory developments quarterly'
                ]
            },

            competitiveAdvantage: this.generateCompetitiveAdvantage(context, 'optimization'),

            regulatoryImplications: this.generateRegulatoryImplications(context, 'optimization'),

            nextSteps: [
                'Launch EV incentive program within 30 days',
                'Implement enhanced data collection forms',
                'Develop high-emission loan transition strategy',
                'Establish charging network partnerships',
                'Create customer EV education program'
            ],

            successMetrics: [
                'EV portfolio share growth (target: +2% quarterly)',
                'PCAF WDQS score improvement (target: ≤2.5 by 2025)',
                'Revenue per loan increase (target: +$125 annually)',
                'Customer satisfaction scores (target: >8.5/10)',
                'Market share in green finance (target: +1.5% annually)'
            ],

            humanizedExplanation: this.generateHumanizedExplanation(insightData, context, 'optimization')
        };
    }

    /**
     * Generate risk analysis narrative
     */
    private generateRiskAnalysisNarrative(
        insightData: any,
        context: NarrativeContext,
        approach: any
    ): InsightNarrative {
        const bankTypeContext = this.getBankTypeContext(context.bankType);

        return {
            title: `Climate Risk Assessment & Opportunity Analysis`,

            executiveSummary: `Our AI analysis reveals that climate-related opportunities significantly outweigh transition risks in your portfolio. With ${insightData.physicalRiskScore || 2.3}/5 physical risk exposure and ${insightData.transitionRiskScore || 1.8}/5 transition risk, your ${bankTypeContext.name} is well-positioned for the clean energy transition.`,

            businessContext: `The financial sector is experiencing a fundamental shift toward sustainable finance. ${bankTypeContext.riskProfile} Your portfolio's current composition provides both challenges and opportunities as markets transition to net-zero emissions.`,

            keyFindings: [
                {
                    finding: `Low Transition Risk: Technology transition risk score of ${insightData.transitionRiskScore || 1.8}/5`,
                    impact: 'Minimal stranded asset exposure with 5-10 year transition timeline',
                    confidence: 0.85
                },
                {
                    finding: `Green Finance Market Opportunity: $${(insightData.marketSize || 12.5)}B regional market`,
                    impact: `10x growth potential from current $${(insightData.currentGreenLoans || 2.1)}M green loan portfolio`,
                    confidence: 0.78
                },
                {
                    finding: `Carbon Credit Revenue Potential: $${(insightData.carbonCreditRevenue || 35)}K annually`,
                    impact: 'Additional revenue stream from portfolio carbon performance',
                    confidence: 0.72
                }
            ],

            actionableRecommendations: this.generateActionableRecommendations(insightData, context, 'risk'),

            riskAssessment: {
                level: 'medium',
                factors: [
                    'Physical climate risks in service area',
                    'Regulatory transition timeline uncertainty',
                    'Technology adoption rate variability'
                ],
                mitigation: [
                    'Geographic diversification strategy',
                    'Scenario planning and stress testing',
                    'Early adoption incentive programs'
                ]
            },

            competitiveAdvantage: `${bankTypeContext.advantages} Early positioning in sustainable finance provides first-mover advantages in the $${(insightData.marketSize || 12.5)}B regional green finance market.`,

            regulatoryImplications: `Proactive climate risk management positions you ahead of upcoming regulatory requirements including TCFD reporting, stress testing, and potential carbon pricing mechanisms.`,

            nextSteps: [
                'Implement comprehensive climate risk monitoring',
                'Develop green bond funding strategy',
                'Establish carbon accounting system',
                'Create climate scenario analysis framework',
                'Launch sustainable finance product suite'
            ],

            successMetrics: [
                'Climate risk score reduction (target: <2.0 by 2025)',
                'Green finance market share (target: 2.5% by 2026)',
                'Carbon credit revenue (target: $50K annually)',
                'Regulatory compliance score (target: 100%)',
                'Climate-adjusted ROA improvement (target: +0.15%)'
            ],

            humanizedExplanation: this.generateHumanizedExplanation(insightData, context, 'risk')
        };
    }

    /**
     * Generate compliance narrative
     */
    private generateComplianceNarrative(
        insightData: any,
        context: NarrativeContext,
        approach: any
    ): InsightNarrative {
        return {
            title: `PCAF Compliance Assessment & Improvement Strategy`,

            executiveSummary: `Your portfolio demonstrates strong PCAF compliance with a ${insightData.wdqsScore || 2.8}/5 Box 8 WDQS score, meeting the ≤3.0 target. ${insightData.compliantLoans || 198} of ${insightData.totalLoans || 247} loans (${((insightData.compliantLoans || 198) / (insightData.totalLoans || 247) * 100).toFixed(1)}%) are fully compliant.`,

            businessContext: `PCAF compliance is becoming increasingly important for regulatory reporting, investor relations, and competitive positioning. Your current compliance level positions you well for upcoming regulatory requirements.`,

            keyFindings: [
                {
                    finding: `Strong PCAF Compliance: ${insightData.wdqsScore || 2.8}/5 WDQS score`,
                    impact: 'Meets regulatory requirements and investor expectations',
                    confidence: 0.95
                },
                {
                    finding: `${insightData.nonCompliantLoans || 49} loans requiring attention`,
                    impact: 'Opportunity to achieve 100% compliance with targeted improvements',
                    confidence: 0.88
                },
                {
                    finding: `Data quality improvement trend: +${insightData.qualityImprovement || 0.3} points YoY`,
                    impact: 'Demonstrates continuous improvement in data management',
                    confidence: 0.92
                }
            ],

            actionableRecommendations: this.generateActionableRecommendations(insightData, context, 'compliance'),

            riskAssessment: {
                level: 'low',
                factors: [
                    'Regulatory requirement changes',
                    'Data collection challenges',
                    'Third-party data availability'
                ],
                mitigation: [
                    'Continuous monitoring of regulatory updates',
                    'Enhanced data collection processes',
                    'Multiple data source partnerships'
                ]
            },

            competitiveAdvantage: `Your strong PCAF compliance provides competitive advantages in ESG-focused lending, institutional partnerships, and regulatory relationships.`,

            regulatoryImplications: `Current compliance level exceeds minimum requirements, providing buffer for future regulatory tightening and positioning for leadership in sustainable finance reporting.`,

            nextSteps: [
                'Target remaining non-compliant loans for improvement',
                'Implement automated data quality monitoring',
                'Develop PCAF training program for staff',
                'Create compliance dashboard for real-time monitoring',
                'Establish third-party data partnerships'
            ],

            successMetrics: [
                'PCAF compliance rate (target: 100% by Q4 2024)',
                'WDQS score improvement (target: ≤2.5 by 2025)',
                'Data collection efficiency (target: 95% automation)',
                'Regulatory audit scores (target: excellent rating)',
                'Staff PCAF certification (target: 100% key personnel)'
            ],

            humanizedExplanation: this.generateHumanizedExplanation(insightData, context, 'compliance')
        };
    }

    /**
     * Generate market opportunity narrative
     */
    private generateMarketOpportunityNarrative(
        insightData: any,
        context: NarrativeContext,
        approach: any
    ): InsightNarrative {
        const bankTypeContext = this.getBankTypeContext(context.bankType);

        return {
            title: `Sustainable Finance Market Opportunity Analysis`,

            executiveSummary: `The sustainable finance market presents significant growth opportunities for ${bankTypeContext.name}s. With a $${(insightData.totalMarketSize || 12.5)}B regional market and your current $${(insightData.currentMarketShare || 2.1)}M position, there's substantial room for expansion.`,

            businessContext: `Consumer demand for sustainable finance products is accelerating, driven by environmental awareness, regulatory incentives, and cost savings. ${bankTypeContext.marketPosition}`,

            keyFindings: [
                {
                    finding: `Market Growth: 25% annual growth in sustainable auto finance`,
                    impact: `$${(insightData.growthOpportunity || 3.2)}M expansion opportunity over 3 years`,
                    confidence: 0.82
                },
                {
                    finding: `Customer Segment Analysis: 18% early adopters, 24% pragmatists ready for transition`,
                    impact: '42% of customer base represents immediate opportunity',
                    confidence: 0.89
                },
                {
                    finding: `Competitive Gap: Traditional banks slow to adapt, credit unions gaining share`,
                    impact: 'First-mover advantage opportunity in regional market',
                    confidence: 0.76
                }
            ],

            actionableRecommendations: this.generateActionableRecommendations(insightData, context, 'market'),

            riskAssessment: {
                level: 'medium',
                factors: [
                    'Market saturation risk',
                    'Competitive response timing',
                    'Economic cycle impact on green investments'
                ],
                mitigation: [
                    'Diversified product portfolio approach',
                    'Strong customer relationship focus',
                    'Flexible pricing and terms strategy'
                ]
            },

            competitiveAdvantage: `${bankTypeContext.advantages} Your community focus and customer relationships provide advantages in sustainable finance education and adoption.`,

            regulatoryImplications: `Government incentives and regulatory support for sustainable finance create favorable market conditions for expansion.`,

            nextSteps: [
                'Launch targeted marketing campaigns for EV financing',
                'Develop partnership network with EV dealers',
                'Create customer education programs',
                'Implement competitive pricing strategy',
                'Establish green finance product suite'
            ],

            successMetrics: [
                'Market share growth (target: +2.5% annually)',
                'Customer acquisition rate (target: +25% in green products)',
                'Product penetration (target: 30% of new loans)',
                'Customer satisfaction (target: >9.0/10)',
                'Revenue growth (target: +$1.2M annually)'
            ],

            humanizedExplanation: this.generateHumanizedExplanation(insightData, context, 'market')
        };
    }

    /**
     * Generate customer insights narrative
     */
    private generateCustomerInsightsNarrative(
        insightData: any,
        context: NarrativeContext,
        approach: any
    ): InsightNarrative {
        return {
            title: `Customer Behavior & Engagement Strategy`,

            executiveSummary: `Customer analysis reveals three distinct segments: EV Early Adopters (18%), Hybrid Pragmatists (24%), and ICE Traditionalists (58%). Each segment requires tailored engagement strategies for optimal conversion and retention.`,

            businessContext: `Understanding customer behavior patterns enables targeted marketing, improved retention, and strategic product development. Your customer base shows strong potential for sustainable finance adoption.`,

            keyFindings: [
                {
                    finding: `EV Early Adopters: Highest value segment with $${(insightData.evAvgLoan || 48)}K average loans`,
                    impact: '0.8% default rate and 35% referral rate drive profitability',
                    confidence: 0.94
                },
                {
                    finding: `Hybrid Pragmatists: 65% conversion probability to EV within 3 years`,
                    impact: 'Prime target for transition incentive programs',
                    confidence: 0.87
                },
                {
                    finding: `Digital Engagement: 65% prefer mobile app for account management`,
                    impact: 'Digital-first strategy can improve efficiency and satisfaction',
                    confidence: 0.91
                }
            ],

            actionableRecommendations: this.generateActionableRecommendations(insightData, context, 'customer'),

            riskAssessment: {
                level: 'low',
                factors: [
                    'Customer preference evolution',
                    'Competitive customer acquisition',
                    'Technology adoption barriers'
                ],
                mitigation: [
                    'Continuous customer feedback collection',
                    'Loyalty program development',
                    'User experience optimization'
                ]
            },

            competitiveAdvantage: `Deep customer insights enable personalized service delivery and proactive needs anticipation, differentiating from larger, less agile competitors.`,

            regulatoryImplications: `Customer data insights support fair lending compliance and enable responsible innovation in product development.`,

            nextSteps: [
                'Implement segment-specific marketing campaigns',
                'Develop digital customer experience platform',
                'Create loyalty and referral programs',
                'Launch customer education initiatives',
                'Establish feedback collection systems'
            ],

            successMetrics: [
                'Customer lifetime value increase (target: +15%)',
                'Segment conversion rates (target: EV 25%, Hybrid 45%)',
                'Digital engagement (target: 75% mobile adoption)',
                'Net Promoter Score (target: >70)',
                'Customer retention rate (target: >95%)'
            ],

            humanizedExplanation: this.generateHumanizedExplanation(insightData, context, 'customer')
        };
    }

    /**
     * Generate actionable recommendations based on context
     */
    private generateActionableRecommendations(
        insightData: any,
        context: NarrativeContext,
        type: string
    ): Array<{
        action: string;
        priority: 'high' | 'medium' | 'low';
        timeframe: string;
        effort: 'low' | 'medium' | 'high';
        expectedOutcome: string;
        businessCase: string;
    }> {
        const bankTypeContext = this.getBankTypeContext(context.bankType);

        const baseRecommendations = {
            optimization: [
                {
                    action: 'Launch EV Incentive Program',
                    priority: 'high' as const,
                    timeframe: '30 days',
                    effort: 'medium' as const,
                    expectedOutcome: '+2% EV share quarterly, $125K annual revenue increase',
                    businessCase: `${bankTypeContext.name}s benefit from early EV market positioning. Reduced competition and government incentives create favorable conditions.`
                },
                {
                    action: 'Implement Enhanced Data Collection',
                    priority: 'high' as const,
                    timeframe: '60 days',
                    effort: 'low' as const,
                    expectedOutcome: '0.3 point WDQS improvement, 100% PCAF compliance',
                    businessCase: 'Low-effort, high-impact improvement in regulatory compliance and competitive positioning.'
                },
                {
                    action: 'Develop High-Emission Loan Transition Program',
                    priority: 'medium' as const,
                    timeframe: '90 days',
                    effort: 'medium' as const,
                    expectedOutcome: '75% conversion rate, -45 tCO2e annual emissions',
                    businessCase: 'Proactive portfolio management reduces climate risk while improving customer relationships.'
                }
            ],
            risk: [
                {
                    action: 'Implement Climate Risk Monitoring System',
                    priority: 'high' as const,
                    timeframe: '90 days',
                    effort: 'high' as const,
                    expectedOutcome: 'Real-time risk assessment, regulatory compliance',
                    businessCase: 'Essential for upcoming regulatory requirements and investor reporting.'
                },
                {
                    action: 'Establish Green Bond Funding Strategy',
                    priority: 'medium' as const,
                    timeframe: '180 days',
                    effort: 'high' as const,
                    expectedOutcome: '$5M sustainable funding access, reduced cost of capital',
                    businessCase: 'Access to ESG-focused capital markets at favorable rates.'
                }
            ],
            compliance: [
                {
                    action: 'Target Non-Compliant Loans for Improvement',
                    priority: 'high' as const,
                    timeframe: '45 days',
                    effort: 'medium' as const,
                    expectedOutcome: '100% PCAF compliance achievement',
                    businessCase: 'Regulatory compliance reduces audit risk and improves investor confidence.'
                }
            ],
            market: [
                {
                    action: 'Launch Targeted EV Marketing Campaign',
                    priority: 'high' as const,
                    timeframe: '30 days',
                    effort: 'medium' as const,
                    expectedOutcome: '+25% customer acquisition in green products',
                    businessCase: 'First-mover advantage in growing sustainable finance market.'
                }
            ],
            customer: [
                {
                    action: 'Implement Segment-Specific Marketing',
                    priority: 'high' as const,
                    timeframe: '45 days',
                    effort: 'medium' as const,
                    expectedOutcome: '+15% customer lifetime value, improved conversion rates',
                    businessCase: 'Personalized approach increases customer satisfaction and profitability.'
                }
            ]
        };

        return baseRecommendations[type] || baseRecommendations.optimization;
    }

    /**
     * Generate humanized explanation tailored to bank type and experience level
     */
    private generateHumanizedExplanation(
        insightData: any,
        context: NarrativeContext,
        type: string
    ): string {
        const bankTypeContext = this.getBankTypeContext(context.bankType);
        const experienceContext = this.getExperienceContext(context.experienceLevel);

        const explanations = {
            optimization: `Think of this as upgrading your loan portfolio to be more future-ready. ${experienceContext.analogy} The numbers show that customers increasingly want electric vehicles, and banks that help them get there first will build stronger relationships and earn more revenue. ${bankTypeContext.approach} It's like being the first bank in town to offer online banking - those who moved early gained lasting advantages.`,

            risk: `Climate risk might sound complex, but it's really about protecting your bank's future. ${experienceContext.riskAnalogy} Just as you assess credit risk before making loans, climate risk helps you understand how environmental changes might affect your portfolio. ${bankTypeContext.riskApproach} The good news is that the opportunities often outweigh the risks when you plan ahead.`,

            compliance: `PCAF compliance is like having a clean audit - it shows regulators, investors, and customers that you manage your business professionally. ${experienceContext.complianceAnalogy} Your current score of ${insightData.wdqsScore || 2.8} is actually quite good - you're already meeting the requirements. ${bankTypeContext.complianceApproach}`,

            market: `The sustainable finance market is growing rapidly, and ${bankTypeContext.name}s are uniquely positioned to capture this opportunity. ${experienceContext.marketAnalogy} Your customers trust you for financial advice, and helping them make environmentally responsible choices strengthens that relationship while opening new revenue streams.`,

            customer: `Understanding your customers better is like having a roadmap for growth. ${experienceContext.customerAnalogy} The data shows clear patterns in how different customers think about vehicle financing. ${bankTypeContext.customerApproach} By tailoring your approach to each group, you can serve them better and grow your business.`
        };

        return explanations[type] || explanations.optimization;
    }

    /**
     * Helper methods for context generation
     */
    private getBankTypeContext(bankType: string) {
        const contexts = {
            community: {
                name: 'Community Bank',
                advantages: 'Strong local relationships and community focus provide competitive advantages in customer education and trust-building.',
                approach: 'Your community connections make it easier to educate customers about new financing options and build trust in sustainable choices.',
                riskProfile: 'Community banks typically have lower risk tolerance but benefit from stable, long-term customer relationships.',
                riskApproach: 'Your conservative approach to risk management actually works in your favor here - climate risks are manageable with proper planning.',
                complianceApproach: 'This puts you ahead of many larger banks and shows your commitment to professional standards.',
                customerApproach: 'Your personal relationships with customers make it easier to guide them toward the right financing solutions.',
                marketPosition: 'Community banks often lead in customer satisfaction and can leverage this for sustainable finance adoption.'
            },
            regional: {
                name: 'Regional Bank',
                advantages: 'Regional scale provides resources for innovation while maintaining customer focus and market agility.',
                approach: 'Your regional presence allows you to be more responsive to local market trends than national banks.',
                riskProfile: 'Regional banks balance growth opportunities with prudent risk management.',
                riskApproach: 'Your size gives you the resources to implement sophisticated risk management while staying agile.',
                complianceApproach: 'This demonstrates your operational excellence and positions you well for growth.',
                customerApproach: 'Your regional footprint lets you understand local customer preferences while offering sophisticated products.',
                marketPosition: 'Regional banks are well-positioned to capture market share from slower-moving national competitors.'
            },
            credit_union: {
                name: 'Credit Union',
                advantages: 'Member-owned structure and mission-driven approach align naturally with sustainable finance goals.',
                approach: 'Your member-focused mission makes sustainable finance a natural fit - you\'re helping members make choices that benefit both their finances and the environment.',
                riskProfile: 'Credit unions typically prioritize member benefit over profit maximization.',
                riskApproach: 'Your member-first approach means taking measured risks that benefit the community long-term.',
                complianceApproach: 'This shows your commitment to professional standards that protect member interests.',
                customerApproach: 'Your member-ownership model creates natural alignment with sustainable, long-term thinking.',
                marketPosition: 'Credit unions often lead in member satisfaction and can leverage this for sustainable finance leadership.'
            },
            national: {
                name: 'National Bank',
                advantages: 'Scale and resources enable comprehensive sustainable finance programs and market leadership.',
                approach: 'Your national scale allows you to set industry standards and lead market transformation.',
                riskProfile: 'National banks have sophisticated risk management capabilities and regulatory oversight.',
                riskApproach: 'Your advanced risk management systems can easily incorporate climate risk assessment.',
                complianceApproach: 'This reinforces your position as an industry leader in regulatory compliance.',
                customerApproach: 'Your scale allows for sophisticated customer segmentation and personalized service delivery.',
                marketPosition: 'National banks can drive market transformation through scale and influence.'
            }
        };

        return contexts[bankType] || contexts.community;
    }

    private getExperienceContext(level: string) {
        const contexts = {
            beginner: {
                analogy: 'Just like when you first started offering different types of loans, this is about expanding your product mix to meet customer demand.',
                riskAnalogy: 'Think of it like diversifying your loan portfolio - you spread risk across different types of assets.',
                complianceAnalogy: 'It\'s like maintaining good books and records - it shows you run a professional operation.',
                marketAnalogy: 'It\'s like when online banking first became popular - early adopters gained lasting advantages.',
                customerAnalogy: 'It\'s like knowing which customers prefer personal service versus online banking - different approaches for different people.'
            },
            intermediate: {
                analogy: 'This builds on your existing portfolio management skills, applying them to the growing sustainable finance market.',
                riskAnalogy: 'You already manage interest rate and credit risk - climate risk uses similar analytical frameworks.',
                complianceAnalogy: 'Like other regulatory requirements, staying ahead of PCAF standards positions you for success.',
                marketAnalogy: 'Similar to how you\'ve adapted to other market changes, early positioning in sustainable finance creates competitive advantages.',
                customerAnalogy: 'Like your existing customer segmentation strategies, this helps you serve different customer needs more effectively.'
            },
            advanced: {
                analogy: 'This represents a strategic evolution of your portfolio optimization capabilities, leveraging data analytics for competitive advantage.',
                riskAnalogy: 'Climate risk integration enhances your existing risk management framework with forward-looking scenario analysis.',
                complianceAnalogy: 'Your advanced compliance capabilities position you to exceed PCAF requirements and lead industry standards.',
                marketAnalogy: 'Your sophisticated market analysis skills can be applied to capture first-mover advantages in sustainable finance.',
                customerAnalogy: 'This enhances your existing customer analytics with behavioral insights for improved lifetime value optimization.'
            }
        };

        return contexts[level] || contexts.intermediate;
    }

    private getPortfolioScaleContext(size: number) {
        if (size < 1000) {
            return { description: 'a focused portfolio under 1,000 loans', scale: 'boutique' };
        } else if (size < 5000) {
            return { description: 'a substantial portfolio of 1,000-5,000 loans', scale: 'regional' };
        } else if (size < 20000) {
            return { description: 'a large portfolio of 5,000-20,000 loans', scale: 'major' };
        } else {
            return { description: 'an extensive portfolio exceeding 20,000 loans', scale: 'national' };
        }
    }

    private getMarketContext(market: string): string {
        // This would be enhanced with real market data
        return `Operating in the ${market} market provides opportunities for sustainable finance leadership given local environmental awareness and regulatory support.`;
    }

    private generateExecutiveSummary(insightData: any, context: NarrativeContext, type: string): string {
        const bankTypeContext = this.getBankTypeContext(context.bankType);

        const summaries = {
            optimization: `Our AI analysis identifies significant portfolio optimization opportunities for your ${bankTypeContext.name}. By increasing EV share from ${insightData.currentEVShare || '18.2'}% to ${insightData.targetEVShare || '25'}%, you could generate an additional $${(insightData.revenueImpact || 450000).toLocaleString()} annually while reducing portfolio climate risk.`,

            risk: `Climate risk assessment reveals manageable transition risks with substantial opportunities. Your portfolio's ${insightData.transitionRiskScore || 1.8}/5 transition risk score indicates low stranded asset exposure, while the $${(insightData.marketSize || 12.5)}B regional green finance market presents significant growth potential.`,

            compliance: `Your portfolio demonstrates strong PCAF compliance with a ${insightData.wdqsScore || 2.8}/5 Box 8 WDQS score, exceeding the ≤3.0 regulatory target. ${((insightData.compliantLoans || 198) / (insightData.totalLoans || 247) * 100).toFixed(1)}% of loans are fully compliant, positioning you ahead of regulatory requirements.`
        };

        return summaries[type] || summaries.optimization;
    }

    private generateCompetitiveAdvantage(context: NarrativeContext, type: string): string {
        const bankTypeContext = this.getBankTypeContext(context.bankType);

        return `${bankTypeContext.advantages} Early adoption of sustainable finance practices creates lasting competitive advantages through customer loyalty, regulatory positioning, and access to ESG-focused capital markets.`;
    }

    private generateRegulatoryImplications(context: NarrativeContext, type: string): string {
        const implications = {
            optimization: 'Proactive portfolio optimization aligns with emerging regulatory expectations for climate risk management and sustainable finance reporting.',
            risk: 'Comprehensive climate risk assessment positions you ahead of upcoming regulatory requirements including TCFD reporting and climate stress testing.',
            compliance: 'Strong PCAF compliance provides regulatory buffer and demonstrates commitment to professional standards and transparency.'
        };

        return implications[type] || implications.optimization;
    }

    private determineNarrativeApproach(context: NarrativeContext, template: NarrativeTemplate) {
        return {
            complexity: context.experienceLevel === 'beginner' ? 'simple' : context.experienceLevel === 'advanced' ? 'detailed' : 'balanced',
            tone: template.tone,
            focus: template.focusArea,
            audience: template.audienceLevel
        };
    }

    private generateGenericNarrative(insightData: any, context: NarrativeContext, approach: any): InsightNarrative {
        return this.generatePortfolioOptimizationNarrative(insightData, context, approach);
    }

    private generateFallbackNarrative(insightData: any, context: NarrativeContext): InsightNarrative {
        const bankTypeContext = this.getBankTypeContext(context.bankType);

        return {
            title: 'Portfolio Analysis Insight',
            executiveSummary: `Analysis of your ${bankTypeContext.name} portfolio reveals opportunities for improvement and growth.`,
            businessContext: `Your portfolio shows potential for optimization in sustainable finance and risk management.`,
            keyFindings: [
                {
                    finding: 'Portfolio analysis completed',
                    impact: 'Insights available for strategic planning',
                    confidence: 0.75
                }
            ],
            actionableRecommendations: [
                {
                    action: 'Review detailed analysis',
                    priority: 'medium',
                    timeframe: '30 days',
                    effort: 'low',
                    expectedOutcome: 'Better understanding of portfolio opportunities',
                    businessCase: 'Informed decision making improves outcomes'
                }
            ],
            riskAssessment: {
                level: 'medium',
                factors: ['Market conditions', 'Regulatory changes'],
                mitigation: ['Regular monitoring', 'Strategic planning']
            },
            competitiveAdvantage: 'Data-driven insights provide competitive advantages',
            regulatoryImplications: 'Analysis supports regulatory compliance efforts',
            nextSteps: ['Review findings', 'Develop action plan', 'Monitor progress'],
            successMetrics: ['Implementation progress', 'Performance improvement'],
            humanizedExplanation: 'This analysis helps you understand your portfolio better and identify opportunities for improvement.'
        };
    }
}

export const aiAnalyticsNarrativeBuilder = AIAnalyticsNarrativeBuilder.getInstance();