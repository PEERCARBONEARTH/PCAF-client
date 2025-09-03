/**
 * Dynamic Insights Engine
 * Generates contextual AI insights based on bank's actual data, targets, and profile
 */

import { contextualNarrativeService } from './contextual-narrative-service';
import { portfolioService } from './portfolioService';

export interface BankProfile {
    id: string;
    name: string;
    type: 'community' | 'regional' | 'national' | 'credit_union';
    assets: number; // Total assets in millions
    portfolioSize: number; // Number of loans
    primaryMarkets: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    businessGoals: Array<{
        type: 'growth' | 'compliance' | 'sustainability' | 'efficiency' | 'risk_management';
        priority: 'high' | 'medium' | 'low';
        target?: string;
        deadline?: Date;
    }>;
    currentChallenges: Array<{
        type: 'data_quality' | 'regulatory_compliance' | 'market_competition' | 'technology' | 'staffing';
        severity: 'high' | 'medium' | 'low';
        description: string;
    }>;
    climateTargets?: {
        netZeroTarget?: Date;
        emissionReductionTarget?: number; // Percentage
        evPortfolioTarget?: number; // Percentage
        dataQualityTarget?: number; // PCAF score
    };
    preferredTone: 'professional' | 'conversational' | 'technical';
    reportingRequirements: string[];
}

export interface PortfolioContext {
    totalLoans: number;
    totalEmissions: number;
    avgDataQuality: number;
    evPercentage: number;
    complianceStatus: 'compliant' | 'needs_improvement' | 'non_compliant';
    topRisks: Array<{
        type: string;
        severity: 'high' | 'medium' | 'low';
        affectedLoans: number;
    }>;
    recentTrends: {
        emissionsChange: number; // Percentage change
        evGrowth: number; // Percentage change
        dataQualityImprovement: number;
    };
    benchmarkComparison: {
        industryAvgEmissions: number;
        industryAvgEV: number;
        industryAvgDataQuality: number;
    };
    // Additional real data metrics
    hybridPercentage?: number;
    emissionIntensity?: number; // Emissions per $1000 loan value
    totalLoanValue?: number;
    pcafCompliantLoans?: number;
    highEmissionLoans?: number;
}

export interface DynamicInsight {
    id: string;
    type: 'strategic' | 'operational' | 'compliance' | 'risk' | 'opportunity';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    summary: string;
    personalizedMessage: string;
    dataPoints: Array<{
        metric: string;
        current: number | string;
        target?: number | string;
        benchmark?: number | string;
        trend?: 'improving' | 'declining' | 'stable';
    }>;
    recommendations: Array<{
        action: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'high' | 'medium' | 'low';
        timeline: string;
        specificToBank: string;
    }>;
    narrative: any;
    confidence: number;
    lastUpdated: Date;
    triggerConditions: string[];
}

class DynamicInsightsEngine {
    private static instance: DynamicInsightsEngine;
    private bankProfile: BankProfile | null = null;
    private portfolioContext: PortfolioContext | null = null;

    static getInstance(): DynamicInsightsEngine {
        if (!DynamicInsightsEngine.instance) {
            DynamicInsightsEngine.instance = new DynamicInsightsEngine();
        }
        return DynamicInsightsEngine.instance;
    }

    /**
     * Set bank profile for personalized insights
     */
    setBankProfile(profile: BankProfile): void {
        this.bankProfile = profile;
        console.log(`🏦 Bank profile set for ${profile.name} (${profile.type})`);
    }

    /**
     * Update portfolio context from real data
     */
    async updatePortfolioContext(): Promise<void> {
        try {
            // Get real portfolio data from the service
            const { loans, summary } = await portfolioService.getPortfolioSummary();

            if (!loans || loans.length === 0) {
                console.warn('No loan data available for insights generation');
                return;
            }

            // Calculate real metrics from actual portfolio data
            const totalEmissions = loans.reduce((sum, loan) =>
                sum + (loan.emissions_data?.financed_emissions_tco2e || loan.emissions_data?.annual_emissions_tco2e || 0), 0);

            const validDataQualityScores = loans
                .map(loan => loan.emissions_data?.data_quality_score || loan.data_quality_assessment?.overall_score)
                .filter(score => score !== undefined && score !== null);

            const avgDataQuality = validDataQualityScores.length > 0
                ? validDataQualityScores.reduce((sum, score) => sum + score, 0) / validDataQualityScores.length
                : 5.0;

            // Calculate EV percentage from real data
            const evLoans = loans.filter(loan => {
                const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase();
                return fuelType === 'electric' || fuelType === 'ev' || fuelType === 'battery electric' ||
                    loan.vehicle_details?.type?.toLowerCase().includes('electric');
            });
            const evPercentage = loans.length > 0 ? (evLoans.length / loans.length) * 100 : 0;

            // Calculate hybrid percentage
            const hybridLoans = loans.filter(loan => {
                const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase();
                return fuelType === 'hybrid' || fuelType?.includes('hybrid');
            });
            const hybridPercentage = loans.length > 0 ? (hybridLoans.length / loans.length) * 100 : 0;

            // Calculate real trends from data (simplified - in production would use historical data)
            const currentYear = new Date().getFullYear();
            const recentLoans = loans.filter(loan => {
                const originationYear = new Date(loan.origination_date).getFullYear();
                return originationYear >= currentYear - 1;
            });

            const recentEVLoans = recentLoans.filter(loan => {
                const fuelType = loan.vehicle_details?.fuel_type?.toLowerCase();
                return fuelType === 'electric' || fuelType === 'ev';
            });

            const recentEVPercentage = recentLoans.length > 0 ? (recentEVLoans.length / recentLoans.length) * 100 : 0;
            const evGrowth = recentEVPercentage - evPercentage; // Simplified growth calculation

            // Calculate data quality improvement trend
            const recentDataQuality = recentLoans.length > 0
                ? recentLoans.reduce((sum, loan) => sum + (loan.emissions_data?.data_quality_score || 5), 0) / recentLoans.length
                : avgDataQuality;
            const dataQualityImprovement = avgDataQuality - recentDataQuality; // Negative means improvement (lower scores are better)

            // Calculate emissions change trend
            const totalLoanValue = loans.reduce((sum, loan) => sum + (loan.outstanding_balance || loan.loan_amount || 0), 0);
            const emissionIntensity = totalLoanValue > 0 ? (totalEmissions / totalLoanValue) * 1000 : 0; // per $1000
            const recentEmissionIntensity = recentLoans.length > 0 && recentLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || loan.loan_amount || 0), 0) > 0
                ? (recentLoans.reduce((sum, loan) => sum + (loan.emissions_data?.financed_emissions_tco2e || 0), 0) /
                    recentLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || loan.loan_amount || 0), 0)) * 1000
                : emissionIntensity;
            const emissionsChange = emissionIntensity > 0 ? ((recentEmissionIntensity - emissionIntensity) / emissionIntensity) * 100 : 0;

            const recentTrends = {
                emissionsChange: Math.round(emissionsChange * 10) / 10,
                evGrowth: Math.round(evGrowth * 10) / 10,
                dataQualityImprovement: Math.round(dataQualityImprovement * 10) / 10
            };

            // Industry benchmarks (these would ideally come from external data sources)
            const benchmarkComparison = {
                industryAvgEmissions: emissionIntensity * 1.15, // Assume 15% above industry average
                industryAvgEV: 12.5, // Industry average EV percentage
                industryAvgDataQuality: 3.2 // Industry average data quality
            };

            // Calculate compliance status based on real data
            const complianceStatus: 'compliant' | 'needs_improvement' | 'non_compliant' =
                avgDataQuality <= 3.0 ? 'compliant' :
                    avgDataQuality <= 4.0 ? 'needs_improvement' : 'non_compliant';

            this.portfolioContext = {
                totalLoans: loans.length,
                totalEmissions: Math.round(totalEmissions * 100) / 100,
                avgDataQuality: Math.round(avgDataQuality * 10) / 10,
                evPercentage: Math.round(evPercentage * 10) / 10,
                complianceStatus,
                topRisks: this.identifyTopRisks(loans),
                recentTrends,
                benchmarkComparison,
                // Additional real data metrics
                hybridPercentage: Math.round(hybridPercentage * 10) / 10,
                emissionIntensity: Math.round(emissionIntensity * 100) / 100,
                totalLoanValue: Math.round(totalLoanValue),
                pcafCompliantLoans: loans.filter(loan => (loan.emissions_data?.data_quality_score || 5) <= 3.0).length,
                highEmissionLoans: loans.filter(loan => {
                    const emissions = loan.emissions_data?.financed_emissions_tco2e || 0;
                    const avgEmissions = totalEmissions / loans.length;
                    return emissions > avgEmissions * 1.5;
                }).length
            };

            console.log('📊 Portfolio context updated with real data:', {
                totalLoans: this.portfolioContext.totalLoans,
                totalEmissions: this.portfolioContext.totalEmissions,
                avgDataQuality: this.portfolioContext.avgDataQuality,
                evPercentage: this.portfolioContext.evPercentage,
                complianceStatus: this.portfolioContext.complianceStatus
            });
        } catch (error) {
            console.error('Failed to update portfolio context:', error);
            // Set minimal context to prevent errors
            this.portfolioContext = {
                totalLoans: 0,
                totalEmissions: 0,
                avgDataQuality: 5.0,
                evPercentage: 0,
                complianceStatus: 'non_compliant',
                topRisks: [],
                recentTrends: { emissionsChange: 0, evGrowth: 0, dataQualityImprovement: 0 },
                benchmarkComparison: { industryAvgEmissions: 0, industryAvgEV: 12.5, industryAvgDataQuality: 3.2 }
            };
        }
    }

    /**
     * Generate dynamic insights based on bank profile and portfolio data using AI
     */
    async generateDynamicInsights(): Promise<DynamicInsight[]> {
        if (!this.bankProfile || !this.portfolioContext) {
            console.warn('Bank profile or portfolio context not set, using defaults');
            return this.getDefaultInsights();
        }

        const insights: DynamicInsight[] = [];

        try {
            // Use AI to generate personalized insights
            const aiInsights = await this.generateAIPersonalizedInsights();
            insights.push(...aiInsights);
        } catch (error) {
            console.warn('AI insights generation failed, falling back to rule-based insights:', error);

            // Fallback to rule-based insights
            // 1. Generate compliance-focused insights
            const complianceInsight = this.generateComplianceInsight();
            if (complianceInsight) insights.push(complianceInsight);

            // 2. Generate goal-specific insights
            for (const goal of this.bankProfile.businessGoals) {
                const goalInsight = this.generateGoalBasedInsight(goal);
                if (goalInsight) insights.push(goalInsight);
            }

            // 3. Generate challenge-specific insights
            for (const challenge of this.bankProfile.currentChallenges) {
                const challengeInsight = this.generateChallengeBasedInsight(challenge);
                if (challengeInsight) insights.push(challengeInsight);
            }

            // 4. Generate opportunity insights based on performance vs benchmarks
            const opportunityInsights = this.generateOpportunityInsights();
            insights.push(...opportunityInsights);

            // 5. Generate risk-specific insights
            const riskInsights = this.generateRiskInsights();
            insights.push(...riskInsights);

            // Sort by priority and relevance
            return insights
                .sort((a, b) => {
                    const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
                    return priorityWeight[b.priority] - priorityWeight[a.priority];
                })
                .slice(0, 8); // Limit to top 8 insights
        }

        // Return insights after successful AI generation
        return insights
            .sort((a, b) => {
                const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
                return priorityWeight[b.priority] - priorityWeight[a.priority];
            })
            .slice(0, 8); // Limit to top 8 insights
    }

    /**
     * Generate compliance-focused insight
     */
    private generateComplianceInsight(): DynamicInsight | null {
        if (!this.portfolioContext || !this.bankProfile) return null;

        const { avgDataQuality, complianceStatus, totalLoans } = this.portfolioContext;
        const { climateTargets, name, type } = this.bankProfile;

        const nonCompliantLoans = Math.round(totalLoans * (avgDataQuality > 3.0 ? 0.4 : 0.1));
        const targetScore = climateTargets?.dataQualityTarget || 3.0;
        const gapToTarget = Math.max(0, avgDataQuality - targetScore);

        return {
            id: 'compliance_insight',
            type: 'compliance',
            priority: complianceStatus === 'non_compliant' ? 'critical' : complianceStatus === 'needs_improvement' ? 'high' : 'medium',
            title: `PCAF Compliance Status for ${name}`,
            summary: `Your ${type} bank's portfolio has a ${avgDataQuality.toFixed(1)} PCAF data quality score`,
            personalizedMessage: gapToTarget > 0
                ? `To meet your target of ${targetScore}, you need to improve ${nonCompliantLoans} loans by an average of ${gapToTarget.toFixed(1)} points.`
                : `Congratulations! You're meeting your PCAF compliance targets.`,
            dataPoints: [
                {
                    metric: 'Current PCAF Score',
                    current: avgDataQuality.toFixed(1),
                    target: targetScore.toString(),
                    benchmark: '3.2',
                    trend: 'improving'
                },
                {
                    metric: 'Compliant Loans',
                    current: `${totalLoans - nonCompliantLoans}/${totalLoans}`,
                    target: totalLoans.toString(),
                    trend: 'improving'
                }
            ],
            recommendations: [
                {
                    action: 'Focus on high-value loans first',
                    impact: 'high',
                    effort: 'medium',
                    timeline: '2-4 weeks',
                    specificToBank: `For a ${type} bank like ${name}, prioritizing your top ${Math.round(totalLoans * 0.2)} loans by value will give maximum compliance impact.`
                },
                {
                    action: 'Implement systematic data collection',
                    impact: 'high',
                    effort: 'high',
                    timeline: '1-3 months',
                    specificToBank: `Given your ${this.bankProfile.experienceLevel} experience level, consider partnering with a PCAF consultant for implementation.`
                }
            ],
            narrative: contextualNarrativeService.generateStrategicInsightNarrative('data_quality', {
                avgDataQuality,
                targetScore,
                bankType: type
            }),
            confidence: 0.92,
            lastUpdated: new Date(),
            triggerConditions: ['data_quality_change', 'compliance_target_update']
        };
    }

    /**
     * Generate goal-based insights
     */
    private generateGoalBasedInsight(goal: BankProfile['businessGoals'][0]): DynamicInsight | null {
        if (!this.portfolioContext || !this.bankProfile) return null;

        switch (goal.type) {
            case 'sustainability':
                return this.generateSustainabilityGoalInsight(goal);
            case 'growth':
                return this.generateGrowthGoalInsight(goal);
            case 'compliance':
                return this.generateComplianceGoalInsight(goal);
            default:
                return null;
        }
    }

    /**
     * Generate sustainability goal insight
     */
    private generateSustainabilityGoalInsight(goal: BankProfile['businessGoals'][0]): DynamicInsight {
        const { evPercentage, totalEmissions, recentTrends, hybridPercentage, totalLoans } = this.portfolioContext!;
        const { name, climateTargets } = this.bankProfile!;

        const evTarget = climateTargets?.evPortfolioTarget || 25;
        const gapToTarget = Math.max(0, evTarget - evPercentage);
        const loansNeeded = Math.round((totalLoans * gapToTarget) / 100);

        // Calculate potential emissions reduction from reaching EV target
        const avgEmissionsPerLoan = totalLoans > 0 ? totalEmissions / totalLoans : 0;
        const potentialEmissionReduction = loansNeeded * avgEmissionsPerLoan * 0.8; // Assume 80% reduction per EV loan

        // Determine priority based on current performance vs target
        const priority = gapToTarget > 15 ? 'high' : gapToTarget > 5 ? 'medium' : 'low';

        return {
            id: 'sustainability_goal',
            type: 'strategic',
            priority: priority as 'high' | 'medium' | 'low',
            title: `EV Portfolio Growth Strategy for ${name}`,
            summary: `Current EV share: ${evPercentage.toFixed(1)}% | Target: ${evTarget}% | Gap: ${gapToTarget.toFixed(1)}%`,
            personalizedMessage: gapToTarget > 0
                ? `Based on your current portfolio of ${totalLoans} loans, you need approximately ${loansNeeded} more EV loans to reach your ${evTarget}% target. This could reduce emissions by ${potentialEmissionReduction.toFixed(1)} tCO2e annually.`
                : `Excellent! You've exceeded your EV portfolio target of ${evTarget}% with ${evPercentage.toFixed(1)}% EV loans.`,
            dataPoints: [
                {
                    metric: 'Current EV Portfolio',
                    current: `${evPercentage.toFixed(1)}% (${Math.round(totalLoans * evPercentage / 100)} loans)`,
                    target: `${evTarget}% (${Math.round(totalLoans * evTarget / 100)} loans)`,
                    benchmark: '12.5%',
                    trend: recentTrends.evGrowth > 0 ? 'improving' : recentTrends.evGrowth < 0 ? 'declining' : 'stable'
                },
                {
                    metric: 'Hybrid Portfolio',
                    current: `${hybridPercentage?.toFixed(1) || '0.0'}%`,
                    trend: 'stable'
                },
                {
                    metric: 'EV Growth Trend',
                    current: `${recentTrends.evGrowth >= 0 ? '+' : ''}${recentTrends.evGrowth.toFixed(1)}%`,
                    trend: recentTrends.evGrowth > 0 ? 'improving' : 'declining'
                },
                {
                    metric: 'Potential Emission Reduction',
                    current: `${potentialEmissionReduction.toFixed(1)} tCO2e`,
                    trend: 'improving'
                }
            ],
            recommendations: [
                {
                    action: gapToTarget > 10 ? 'Launch aggressive EV financing program' : 'Enhance existing EV initiatives',
                    impact: gapToTarget > 10 ? 'high' : 'medium',
                    effort: 'medium',
                    timeline: gapToTarget > 15 ? '6-12 months' : '3-6 months',
                    specificToBank: `With ${totalLoans} total loans and ${Math.round(totalLoans * evPercentage / 100)} current EV loans, focus on ${this.bankProfile!.primaryMarkets.join(' and ')} markets where EV adoption is growing.`
                },
                {
                    action: 'Offer competitive EV loan rates',
                    impact: 'medium',
                    effort: 'low',
                    timeline: '1-2 months',
                    specificToBank: `Consider 0.25-0.5% rate reduction for EV loans. With your current ${evPercentage.toFixed(1)}% EV share, this could accelerate growth significantly.`
                },
                {
                    action: 'Partner with EV dealers and charging networks',
                    impact: 'high',
                    effort: 'medium',
                    timeline: '2-4 months',
                    specificToBank: `Target partnerships in your ${this.bankProfile!.primaryMarkets.join(', ')} markets to capture the ${loansNeeded} additional EV loans needed.`
                }
            ],
            narrative: contextualNarrativeService.generateStrategicInsightNarrative('ev_transition', {
                currentEV: evPercentage,
                targetEV: evTarget,
                bankName: name,
                totalLoans,
                loansNeeded,
                potentialReduction: potentialEmissionReduction
            }),
            confidence: totalLoans > 50 ? 0.88 : 0.75, // Higher confidence with more data
            lastUpdated: new Date(),
            triggerConditions: ['ev_percentage_change', 'sustainability_target_update', 'portfolio_composition_change']
        };
    }

    /**
     * Generate growth goal insight
     */
    private generateGrowthGoalInsight(goal: BankProfile['businessGoals'][0]): DynamicInsight {
        const { evPercentage, benchmarkComparison, totalLoans, totalLoanValue, hybridPercentage, recentTrends } = this.portfolioContext!;
        const { name, type, assets } = this.bankProfile!;

        // Calculate real market opportunity based on actual portfolio
        const marketOpportunity = Math.max(0, benchmarkComparison.industryAvgEV - evPercentage);
        const avgLoanSize = totalLoans > 0 ? (totalLoanValue || 0) / totalLoans : 35000; // Default if no data

        // Calculate potential revenue from green finance growth
        const potentialGreenLoans = Math.round((totalLoans * marketOpportunity) / 100);
        const potentialLoanVolume = potentialGreenLoans * avgLoanSize;
        const estimatedMarginImprovement = 0.0025; // 25 basis points premium for green loans
        const potentialRevenue = potentialLoanVolume * estimatedMarginImprovement;

        // Calculate current green finance position
        const currentGreenLoans = Math.round(totalLoans * (evPercentage + (hybridPercentage || 0)) / 100);
        const currentGreenVolume = currentGreenLoans * avgLoanSize;

        // Assess competitive position
        const competitivePosition = evPercentage > benchmarkComparison.industryAvgEV ? 'leading' :
            evPercentage > benchmarkComparison.industryAvgEV * 0.8 ? 'competitive' : 'lagging';

        return {
            id: 'growth_opportunity',
            type: 'opportunity',
            priority: marketOpportunity > 10 ? 'high' : marketOpportunity > 5 ? 'medium' : 'low',
            title: `Green Finance Growth Opportunity for ${name}`,
            summary: `Market gap: ${marketOpportunity.toFixed(1)}% | Potential: ${potentialGreenLoans} loans | Revenue: $${(potentialRevenue / 1000).toFixed(0)}K`,
            personalizedMessage: `Your ${type} bank currently has ${currentGreenLoans} green loans (${(evPercentage + (hybridPercentage || 0)).toFixed(1)}% of portfolio). The market opportunity represents ${potentialGreenLoans} additional loans worth $${(potentialLoanVolume / 1000000).toFixed(1)}M in loan volume.`,
            dataPoints: [
                {
                    metric: 'Current Green Portfolio',
                    current: `${(evPercentage + (hybridPercentage || 0)).toFixed(1)}% (${currentGreenLoans} loans)`,
                    benchmark: `${benchmarkComparison.industryAvgEV}%`,
                    trend: recentTrends.evGrowth > 0 ? 'improving' : 'stable'
                },
                {
                    metric: 'Market Opportunity',
                    current: `${potentialGreenLoans} loans`,
                    target: `${Math.round(totalLoans * benchmarkComparison.industryAvgEV / 100)} loans`,
                    trend: 'improving'
                },
                {
                    metric: 'Potential Loan Volume',
                    current: `$${(potentialLoanVolume / 1000000).toFixed(1)}M`,
                    trend: 'improving'
                },
                {
                    metric: 'Estimated Annual Revenue',
                    current: `$${(potentialRevenue / 1000).toFixed(0)}K`,
                    trend: 'improving'
                }
            ],
            recommendations: [
                {
                    action: competitivePosition === 'lagging' ? 'Accelerate green finance program development' : 'Expand existing green finance offerings',
                    impact: 'high',
                    effort: competitivePosition === 'lagging' ? 'high' : 'medium',
                    timeline: competitivePosition === 'lagging' ? '6-12 months' : '3-6 months',
                    specificToBank: `As a ${type} bank with ${totalLoans} loans, you're currently ${competitivePosition} in green finance. Target the ${potentialGreenLoans} loan opportunity in your ${this.bankProfile!.primaryMarkets.join(' and ')} markets.`
                },
                {
                    action: 'Implement green loan pricing strategy',
                    impact: 'medium',
                    effort: 'low',
                    timeline: '1-2 months',
                    specificToBank: `With average loan size of $${avgLoanSize.toLocaleString()}, consider offering 25-50 basis point rate reductions for green loans to capture market share.`
                },
                {
                    action: 'Develop green finance marketing campaign',
                    impact: 'medium',
                    effort: 'medium',
                    timeline: '2-3 months',
                    specificToBank: `Focus marketing on your ${this.bankProfile!.primaryMarkets.join(', ')} markets. Highlight your ${competitivePosition} position and target environmentally conscious borrowers.`
                },
                {
                    action: 'Build green finance expertise',
                    impact: 'high',
                    effort: 'high',
                    timeline: '6-9 months',
                    specificToBank: `For a ${type} bank, consider ${assets > 1000 ? 'hiring a dedicated green finance specialist' : 'training existing staff and partnering with green finance consultants'}.`
                }
            ],
            narrative: contextualNarrativeService.generateStrategicInsightNarrative('portfolio_optimization', {
                marketOpportunity,
                bankType: type,
                potentialRevenue: potentialRevenue / 1000,
                competitivePosition,
                totalLoans,
                currentGreenLoans
            }),
            confidence: totalLoans > 50 ? 0.85 : 0.70, // Higher confidence with more data
            lastUpdated: new Date(),
            triggerConditions: ['portfolio_composition_change', 'market_data_update', 'growth_target_change']
        };
    }

    /**
     * Generate compliance goal insight
     */
    private generateComplianceGoalInsight(goal: BankProfile['businessGoals'][0]): DynamicInsight {
        const { avgDataQuality, complianceStatus } = this.portfolioContext!;
        const { name, reportingRequirements } = this.bankProfile!;

        return {
            id: 'compliance_goal',
            type: 'compliance',
            priority: complianceStatus === 'non_compliant' ? 'critical' : 'medium',
            title: `Regulatory Compliance Readiness for ${name}`,
            summary: `PCAF Score: ${avgDataQuality.toFixed(1)} | Status: ${complianceStatus.replace('_', ' ')}`,
            personalizedMessage: `Your bank needs to meet ${reportingRequirements.length} reporting requirements.`,
            dataPoints: [
                {
                    metric: 'PCAF Compliance Score',
                    current: avgDataQuality.toFixed(1),
                    target: '3.0',
                    trend: 'improving'
                }
            ],
            recommendations: [
                {
                    action: 'Prepare for upcoming regulations',
                    impact: 'high',
                    effort: 'medium',
                    timeline: '3-6 months',
                    specificToBank: `Focus on ${reportingRequirements.join(', ')} requirements specific to your reporting obligations.`
                }
            ],
            narrative: contextualNarrativeService.generateStrategicInsightNarrative('compliance_assessment', {
                complianceStatus,
                reportingRequirements
            }),
            confidence: 0.90,
            lastUpdated: new Date(),
            triggerConditions: ['compliance_status_change', 'regulation_update']
        };
    }

    /**
     * Generate challenge-based insights
     */
    private generateChallengeBasedInsight(challenge: BankProfile['currentChallenges'][0]): DynamicInsight | null {
        if (!this.portfolioContext || !this.bankProfile) return null;

        switch (challenge.type) {
            case 'data_quality':
                return this.generateDataQualityChallengeInsight(challenge);
            case 'regulatory_compliance':
                return this.generateComplianceChallengeInsight(challenge);
            default:
                return null;
        }
    }

    /**
     * Generate data quality challenge insight
     */
    private generateDataQualityChallengeInsight(challenge: BankProfile['currentChallenges'][0]): DynamicInsight {
        const { avgDataQuality, totalLoans, pcafCompliantLoans, recentTrends } = this.portfolioContext!;
        const { name, experienceLevel, climateTargets } = this.bankProfile!;

        // Calculate real improvement needs based on actual data
        const nonCompliantLoans = totalLoans - (pcafCompliantLoans || 0);
        const targetScore = climateTargets?.dataQualityTarget || 3.0;
        const scoreGap = Math.max(0, avgDataQuality - targetScore);

        // Estimate loans that need improvement (score > 3.0)
        const improvableLoans = nonCompliantLoans;
        const improvementPercentage = totalLoans > 0 ? (improvableLoans / totalLoans) * 100 : 0;

        // Adjust timeline based on experience and scope
        const baseTimeline = experienceLevel === 'beginner' ? 8 : experienceLevel === 'intermediate' ? 6 : 4;
        const scopeMultiplier = improvementPercentage > 50 ? 1.5 : improvementPercentage > 25 ? 1.2 : 1.0;
        const adjustedWeeks = Math.round(baseTimeline * scopeMultiplier);
        const timelineAdjustment = `${adjustedWeeks} weeks`;

        // Calculate potential compliance improvement
        const potentialComplianceGain = improvableLoans;
        const estimatedCostSavings = potentialComplianceGain * 50; // Rough estimate of $50 per loan in compliance cost savings

        return {
            id: 'data_quality_challenge',
            type: 'operational',
            priority: scoreGap > 1.0 ? 'high' : scoreGap > 0.5 ? 'medium' : 'low',
            title: `Data Quality Improvement Plan for ${name}`,
            summary: `${improvableLoans} of ${totalLoans} loans need data quality improvements (${improvementPercentage.toFixed(1)}%)`,
            personalizedMessage: `Your current PCAF score of ${avgDataQuality.toFixed(1)} needs to improve to ${targetScore} to meet compliance. With your ${experienceLevel} experience level, we recommend focusing on the ${improvableLoans} highest-impact loans first.`,
            dataPoints: [
                {
                    metric: 'Current PCAF Score',
                    current: avgDataQuality.toFixed(1),
                    target: targetScore.toString(),
                    benchmark: '3.2',
                    trend: recentTrends.dataQualityImprovement < 0 ? 'improving' : recentTrends.dataQualityImprovement > 0 ? 'declining' : 'stable'
                },
                {
                    metric: 'Non-Compliant Loans',
                    current: `${improvableLoans} (${improvementPercentage.toFixed(1)}%)`,
                    target: '0',
                    trend: recentTrends.dataQualityImprovement < 0 ? 'improving' : 'stable'
                },
                {
                    metric: 'Compliant Loans',
                    current: `${pcafCompliantLoans || 0} (${((pcafCompliantLoans || 0) / totalLoans * 100).toFixed(1)}%)`,
                    target: `${totalLoans} (100%)`,
                    trend: 'improving'
                },
                {
                    metric: 'Estimated Cost Savings',
                    current: `$${estimatedCostSavings.toLocaleString()}`,
                    trend: 'improving'
                }
            ],
            recommendations: [
                {
                    action: improvableLoans > totalLoans * 0.5 ? 'Implement systematic data collection overhaul' : 'Focus on high-value loan data improvements',
                    impact: 'high',
                    effort: improvableLoans > totalLoans * 0.5 ? 'high' : 'medium',
                    timeline: timelineAdjustment,
                    specificToBank: `For ${name} with ${totalLoans} loans, prioritize the ${Math.min(improvableLoans, Math.round(totalLoans * 0.2))} highest-value loans first. Your ${experienceLevel} experience level suggests ${experienceLevel === 'beginner' ? 'partnering with a PCAF consultant' : 'leveraging internal expertise'}.`
                },
                {
                    action: 'Create standardized data collection templates',
                    impact: 'high',
                    effort: 'low',
                    timeline: '2-3 weeks',
                    specificToBank: `Design templates specifically for your loan officers to capture vehicle make, model, year, and fuel efficiency data for the ${improvableLoans} loans needing improvement.`
                },
                {
                    action: 'Train loan officers on PCAF data requirements',
                    impact: 'medium',
                    effort: 'medium',
                    timeline: '4-6 weeks',
                    specificToBank: `Given your ${experienceLevel} experience level, focus training on the specific data points that will move your ${improvableLoans} non-compliant loans to compliant status.`
                }
            ],
            narrative: contextualNarrativeService.generateStrategicInsightNarrative('data_quality', {
                avgDataQuality,
                experienceLevel,
                improvableLoans,
                targetScore,
                totalLoans,
                bankName: name
            }),
            confidence: totalLoans > 20 ? 0.90 : 0.75, // Higher confidence with more data points
            lastUpdated: new Date(),
            triggerConditions: ['data_quality_change', 'challenge_severity_update', 'loan_portfolio_update']
        };
    }

    /**
     * Generate compliance challenge insight
     */
    private generateComplianceChallengeInsight(challenge: BankProfile['currentChallenges'][0]): DynamicInsight {
        const { complianceStatus } = this.portfolioContext!;
        const { name, reportingRequirements } = this.bankProfile!;

        return {
            id: 'compliance_challenge',
            type: 'compliance',
            priority: 'high',
            title: `Compliance Readiness Assessment for ${name}`,
            summary: `Current status: ${complianceStatus.replace('_', ' ')}`,
            personalizedMessage: `Your bank must prepare for ${reportingRequirements.length} specific reporting requirements.`,
            dataPoints: [
                {
                    metric: 'Compliance Status',
                    current: complianceStatus.replace('_', ' '),
                    target: 'compliant',
                    trend: 'improving'
                }
            ],
            recommendations: [
                {
                    action: 'Develop compliance roadmap',
                    impact: 'high',
                    effort: 'medium',
                    timeline: '4-6 weeks',
                    specificToBank: `Create a specific plan for ${reportingRequirements.join(', ')} requirements.`
                }
            ],
            narrative: contextualNarrativeService.generateStrategicInsightNarrative('compliance_assessment', {
                complianceStatus,
                reportingRequirements
            }),
            confidence: 0.88,
            lastUpdated: new Date(),
            triggerConditions: ['compliance_status_change', 'regulation_update']
        };
    }

    /**
     * Generate opportunity insights based on benchmarks
     */
    private generateOpportunityInsights(): DynamicInsight[] {
        if (!this.portfolioContext || !this.bankProfile) return [];

        const insights: DynamicInsight[] = [];
        const { evPercentage, benchmarkComparison } = this.portfolioContext;
        const { name, type } = this.bankProfile;

        // EV opportunity insight
        if (evPercentage < benchmarkComparison.industryAvgEV) {
            insights.push({
                id: 'ev_opportunity',
                type: 'opportunity',
                priority: 'medium',
                title: `EV Market Opportunity for ${name}`,
                summary: `You're ${(benchmarkComparison.industryAvgEV - evPercentage).toFixed(1)}% below industry average`,
                personalizedMessage: `As a ${type} bank, you have significant room to grow your EV portfolio.`,
                dataPoints: [
                    {
                        metric: 'EV Gap to Industry',
                        current: `${evPercentage.toFixed(1)}%`,
                        benchmark: `${benchmarkComparison.industryAvgEV}%`,
                        trend: 'improving'
                    }
                ],
                recommendations: [
                    {
                        action: 'Launch EV promotion campaign',
                        impact: 'medium',
                        effort: 'low',
                        timeline: '1-2 months',
                        specificToBank: `Target your existing customers in ${this.bankProfile!.primaryMarkets.join(' and ')} markets.`
                    }
                ],
                narrative: contextualNarrativeService.generateStrategicInsightNarrative('ev_transition', {
                    currentEV: evPercentage,
                    industryAvg: benchmarkComparison.industryAvgEV
                }),
                confidence: 0.78,
                lastUpdated: new Date(),
                triggerConditions: ['benchmark_update', 'ev_percentage_change']
            });
        }

        return insights;
    }

    /**
     * Generate risk insights
     */
    private generateRiskInsights(): DynamicInsight[] {
        if (!this.portfolioContext || !this.bankProfile) return [];

        const insights: DynamicInsight[] = [];
        const { topRisks } = this.portfolioContext;
        const { name } = this.bankProfile;

        for (const risk of topRisks.slice(0, 2)) { // Top 2 risks
            insights.push({
                id: `risk_${risk.type}`,
                type: 'risk',
                priority: risk.severity === 'high' ? 'high' : 'medium',
                title: `${risk.type.replace('_', ' ')} Risk Alert for ${name}`,
                summary: `${risk.affectedLoans} loans affected`,
                personalizedMessage: `This ${risk.severity} severity risk requires your attention.`,
                dataPoints: [
                    {
                        metric: 'Affected Loans',
                        current: risk.affectedLoans.toString(),
                        trend: 'stable'
                    }
                ],
                recommendations: [
                    {
                        action: `Address ${risk.type.replace('_', ' ')} risk`,
                        impact: risk.severity === 'high' ? 'high' : 'medium',
                        effort: 'medium',
                        timeline: '2-4 weeks',
                        specificToBank: `Focus on the ${risk.affectedLoans} loans in your portfolio that are most exposed.`
                    }
                ],
                narrative: contextualNarrativeService.generateRiskAnalyticsNarrative(risk.type, risk.severity),
                confidence: 0.82,
                lastUpdated: new Date(),
                triggerConditions: ['risk_assessment_update', 'portfolio_change']
            });
        }

        return insights;
    }

    /**
     * Identify top risks from portfolio data
     */
    private identifyTopRisks(loans: any[]): PortfolioContext['topRisks'] {
        const risks: PortfolioContext['topRisks'] = [];

        if (!loans || loans.length === 0) return risks;

        // 1. Data quality risk - based on PCAF scores
        const poorQualityLoans = loans.filter(loan => {
            const score = loan.emissions_data?.data_quality_score || loan.data_quality_assessment?.overall_score || 5;
            return score >= 4; // PCAF scores 4-5 are poor quality
        });

        if (poorQualityLoans.length > 0) {
            const riskPercentage = (poorQualityLoans.length / loans.length) * 100;
            risks.push({
                type: 'data_quality_risk',
                severity: riskPercentage > 40 ? 'high' : riskPercentage > 20 ? 'medium' : 'low',
                affectedLoans: poorQualityLoans.length
            });
        }

        // 2. High emission intensity risk
        const emissionsData = loans
            .map(loan => loan.emissions_data?.financed_emissions_tco2e || loan.emissions_data?.annual_emissions_tco2e || 0)
            .filter(emissions => emissions > 0);

        if (emissionsData.length > 0) {
            const avgEmissions = emissionsData.reduce((sum, emissions) => sum + emissions, 0) / emissionsData.length;
            const highEmissionLoans = loans.filter(loan => {
                const emissions = loan.emissions_data?.financed_emissions_tco2e || loan.emissions_data?.annual_emissions_tco2e || 0;
                return emissions > avgEmissions * 1.5; // 50% above average
            });

            if (highEmissionLoans.length > 0) {
                const riskPercentage = (highEmissionLoans.length / loans.length) * 100;
                risks.push({
                    type: 'high_emission_intensity',
                    severity: riskPercentage > 25 ? 'high' : riskPercentage > 15 ? 'medium' : 'low',
                    affectedLoans: highEmissionLoans.length
                });
            }
        }

        // 3. Concentration risk - too many loans in high-emission vehicle types
        const vehicleTypes = loans.reduce((acc, loan) => {
            const type = loan.vehicle_details?.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const highEmissionTypes = ['truck', 'suv', 'pickup', 'van'];
        const highEmissionCount = highEmissionTypes.reduce((sum, type) => {
            return sum + Object.keys(vehicleTypes).reduce((typeSum, vehicleType) => {
                return typeSum + (vehicleType.toLowerCase().includes(type) ? vehicleTypes[vehicleType] : 0);
            }, 0);
        }, 0);

        if (highEmissionCount > loans.length * 0.6) {
            risks.push({
                type: 'portfolio_concentration',
                severity: highEmissionCount > loans.length * 0.8 ? 'high' : 'medium',
                affectedLoans: highEmissionCount
            });
        }

        // 4. Compliance risk - loans with missing critical data
        const missingDataLoans = loans.filter(loan => {
            const hasVehicleDetails = loan.vehicle_details?.make && loan.vehicle_details?.model && loan.vehicle_details?.year;
            const hasEmissionsData = loan.emissions_data?.financed_emissions_tco2e !== undefined;
            return !hasVehicleDetails || !hasEmissionsData;
        });

        if (missingDataLoans.length > 0) {
            const riskPercentage = (missingDataLoans.length / loans.length) * 100;
            risks.push({
                type: 'compliance_risk',
                severity: riskPercentage > 30 ? 'high' : riskPercentage > 15 ? 'medium' : 'low',
                affectedLoans: missingDataLoans.length
            });
        }

        // 5. Attribution factor risk - loans with high attribution factors (high exposure)
        const highAttributionLoans = loans.filter(loan => {
            const attributionFactor = loan.emissions_data?.attribution_factor || 0;
            return attributionFactor > 0.8; // More than 80% attribution
        });

        if (highAttributionLoans.length > 0) {
            const riskPercentage = (highAttributionLoans.length / loans.length) * 100;
            if (riskPercentage > 10) { // Only flag if significant
                risks.push({
                    type: 'high_attribution_risk',
                    severity: riskPercentage > 30 ? 'high' : riskPercentage > 20 ? 'medium' : 'low',
                    affectedLoans: highAttributionLoans.length
                });
            }
        }

        // Sort risks by severity and affected loan count
        return risks
            .sort((a, b) => {
                const severityWeight = { high: 3, medium: 2, low: 1 };
                const severityDiff = severityWeight[b.severity] - severityWeight[a.severity];
                if (severityDiff !== 0) return severityDiff;
                return b.affectedLoans - a.affectedLoans;
            })
            .slice(0, 5); // Return top 5 risks
    }

    /**
     * Generate AI-powered personalized insights using OpenAI + ChromaDB
     */
    private async generateAIPersonalizedInsights(): Promise<DynamicInsight[]> {
        const aiQuery = `Generate personalized strategic insights for a ${this.bankProfile!.type} bank with ${this.bankProfile!.assets}M in assets. 
    
    Bank Profile:
    - Experience Level: ${this.bankProfile!.experienceLevel}
    - Primary Goals: ${this.bankProfile!.businessGoals.map(g => g.type).join(', ')}
    - Current Challenges: ${this.bankProfile!.currentChallenges.map(c => c.type).join(', ')}
    
    Portfolio Context:
    - Total Loans: ${this.portfolioContext!.totalLoans}
    - Total Emissions: ${this.portfolioContext!.totalEmissions} tCO2e
    - EV Percentage: ${this.portfolioContext!.evPercentage}%
    - Data Quality Score: ${this.portfolioContext!.avgDataQuality}
    - Compliance Status: ${this.portfolioContext!.complianceStatus}
    
    Please provide 3-5 specific, actionable insights with recommendations tailored to this bank's profile and current portfolio performance.`;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chroma/rag-query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
                query: aiQuery,
                collection_name: 'pcaf_calculation_optimized',
                max_results: 5,
                include_metadata: true,
                context_type: 'strategic_insights',
                bank_profile: {
                    type: this.bankProfile!.type,
                    assets: this.bankProfile!.assets,
                    experience: this.bankProfile!.experienceLevel
                },
                portfolio_context: this.portfolioContext
            })
        });

        if (!response.ok) {
            throw new Error('AI insights service unavailable');
        }

        const aiData = await response.json();

        // Transform AI response into DynamicInsight format
        const aiInsights: DynamicInsight[] = [];

        if (aiData.insights && Array.isArray(aiData.insights)) {
            aiData.insights.forEach((insight: any, index: number) => {
                aiInsights.push({
                    id: `ai_insight_${Date.now()}_${index}`,
                    type: insight.type || 'strategic',
                    priority: insight.priority || 'high',
                    title: insight.title,
                    summary: insight.summary,
                    personalizedMessage: insight.personalized_message || `Tailored for ${this.bankProfile!.name}`,
                    dataPoints: insight.data_points || [],
                    recommendations: insight.recommendations || [],
                    narrative: {
                        summary: insight.summary,
                        explanation: insight.detailed_explanation,
                        methodology: 'Generated using OpenAI GPT-4 with ChromaDB PCAF knowledge base'
                    },
                    confidence: insight.confidence || 0.85,
                    lastUpdated: new Date(),
                    triggerConditions: insight.trigger_conditions || ['portfolio_change', 'target_update']
                });
            });
        } else {
            // Parse single response into insights
            const singleInsight: DynamicInsight = {
                id: `ai_insight_${Date.now()}`,
                type: 'strategic',
                priority: 'high',
                title: 'AI-Generated Strategic Recommendation',
                summary: aiData.response || 'AI-powered analysis of your portfolio',
                personalizedMessage: `Based on your ${this.bankProfile!.type} bank profile and current portfolio performance`,
                dataPoints: [
                    {
                        metric: 'Current EV Percentage',
                        current: `${this.portfolioContext!.evPercentage}%`,
                        benchmark: '12.5%',
                        trend: this.portfolioContext!.recentTrends.evGrowth > 0 ? 'improving' : 'stable'
                    },
                    {
                        metric: 'Data Quality Score',
                        current: this.portfolioContext!.avgDataQuality.toFixed(1),
                        target: '3.0',
                        trend: this.portfolioContext!.recentTrends.dataQualityImprovement > 0 ? 'improving' : 'stable'
                    }
                ],
                recommendations: aiData.recommendations?.map((rec: any) => ({
                    action: rec.action || rec,
                    impact: 'high',
                    effort: 'medium',
                    timeline: '3-6 months',
                    specificToBank: `Tailored for ${this.bankProfile!.type} banks with ${this.bankProfile!.experienceLevel} PCAF experience`
                })) || [
                        {
                            action: 'Implement AI-recommended portfolio optimization strategy',
                            impact: 'high' as const,
                            effort: 'medium' as const,
                            timeline: '3-6 months',
                            specificToBank: `Designed for ${this.bankProfile!.type} banks`
                        }
                    ],
                narrative: {
                    summary: aiData.response,
                    explanation: aiData.detailed_explanation || aiData.response,
                    methodology: 'Generated using OpenAI GPT-4 with ChromaDB PCAF knowledge base'
                },
                confidence: aiData.confidence || 0.85,
                lastUpdated: new Date(),
                triggerConditions: ['portfolio_change', 'target_update', 'compliance_status_change']
            };

            aiInsights.push(singleInsight);
        }

        return aiInsights;
    }

    /**
     * Get default insights when profile/context not available
     */
    private getDefaultInsights(): DynamicInsight[] {
        return [
            {
                id: 'default_insight',
                type: 'strategic',
                priority: 'medium',
                title: 'Portfolio Analysis Needed',
                summary: 'Set up your bank profile for personalized insights',
                personalizedMessage: 'Configure your bank profile and targets to get customized AI insights.',
                dataPoints: [],
                recommendations: [
                    {
                        action: 'Complete bank profile setup',
                        impact: 'high',
                        effort: 'low',
                        timeline: '15 minutes',
                        specificToBank: 'This will unlock personalized insights for your specific situation.'
                    }
                ],
                narrative: contextualNarrativeService.generateStrategicInsightNarrative('portfolio_optimization', {}),
                confidence: 0.5,
                lastUpdated: new Date(),
                triggerConditions: ['profile_setup']
            }
        ];
    }
}

export const dynamicInsightsEngine = DynamicInsightsEngine.getInstance();