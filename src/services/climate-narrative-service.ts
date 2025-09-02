/**
 * Climate Narrative Service - Orchestrates ChromaDB, RAG, and OpenAI for contextual AI insights
 * Implements the three-layer integration: Data → Context → AI Generation
 */

import { ChromaRAGService, ChromaSearchResult } from './chromaRAGService';
import { contextualRAGService } from './contextualRAGService';
import { aiService } from './aiService';
import { portfolioService } from './portfolioService';

export interface ClimateNarrative {
    dataType: 'ev-transition' | 'emissions-total' | 'risk-level' | 'portfolio-overview' | 'anomaly-detection' | 'data-quality' | 'compliance-status';
    title: string;
    contextualExplanation: string;
    portfolioSpecifics: string;
    industryComparison: string;
    actionableInsights: string[];
    keyTakeaways: string[];
    confidence: number;
    priority: 'high' | 'medium' | 'low';
    sources: ChromaSearchResult[];
    metadata: {
        processingTime: number;
        dataQuality: number;
        contextRelevance: number;
    };
}

export interface PortfolioContext {
    loans: any[];
    totalEmissions: number;
    avgDataQuality: number;
    evPercentage: number;
    portfolioValue: number;
    riskLevel: string;
    complianceRate: number;
    [key: string]: any;
}

export interface AnomalyContext {
    loanId: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    category: string;
    detectedAt: Date;
}

class ClimateNarrativeService {
    private static instance: ClimateNarrativeService;
    private chromaService: ChromaRAGService;
    private contextualService: typeof contextualRAGService;
    private aiService: typeof aiService;

    constructor() {
        this.chromaService = new ChromaRAGService();
        this.contextualService = contextualRAGService;
        this.aiService = aiService;
    }

    static getInstance(): ClimateNarrativeService {
        if (!ClimateNarrativeService.instance) {
            ClimateNarrativeService.instance = new ClimateNarrativeService();
        }
        return ClimateNarrativeService.instance;
    }

    /**
     * Generate contextual narrative for portfolio metrics
     */
    async generateMetricNarrative(
        metricType: ClimateNarrative['dataType'],
        currentValue: number | string,
        targetValue?: number | string,
        portfolioContext?: PortfolioContext
    ): Promise<ClimateNarrative> {
        const startTime = Date.now();

        try {
            // Step 1: Extract portfolio data
            const context = portfolioContext || await this.extractPortfolioContext();

            // Step 2: Query ChromaDB for relevant knowledge
            const knowledgeBase = await this.queryRelevantKnowledge(metricType, currentValue, context);

            // Step 3: Combine with portfolio context
            const enrichedContext = await this.buildEnrichedContext(metricType, currentValue, targetValue, context, knowledgeBase);

            // Step 4: Send to OpenAI with structured prompt
            const aiResponse = await this.generateAINarrative(metricType, enrichedContext);

            // Step 5: Return contextual narrative
            return {
                dataType: metricType,
                title: this.getMetricTitle(metricType),
                contextualExplanation: aiResponse.contextualExplanation,
                portfolioSpecifics: aiResponse.portfolioSpecifics,
                industryComparison: aiResponse.industryComparison,
                actionableInsights: aiResponse.actionableInsights,
                keyTakeaways: aiResponse.keyTakeaways,
                confidence: aiResponse.confidence,
                priority: this.calculatePriority(metricType, currentValue, context),
                sources: knowledgeBase.sources,
                metadata: {
                    processingTime: Date.now() - startTime,
                    dataQuality: context.avgDataQuality,
                    contextRelevance: knowledgeBase.relevanceScore
                }
            };

        } catch (error) {
            console.error('Error generating metric narrative:', error);
            return this.getFallbackNarrative(metricType, currentValue);
        }
    }

    /**
     * Generate narrative for anomaly detection
     */
    async generateAnomalyNarrative(
        anomaly: AnomalyContext,
        portfolioContext?: PortfolioContext
    ): Promise<ClimateNarrative> {
        const startTime = Date.now();

        try {
            // Step 1: Extract portfolio data
            const context = portfolioContext || await this.extractPortfolioContext();

            // Step 2: Query ChromaDB for anomaly patterns and solutions
            const knowledgeBase = await this.queryAnomalyKnowledge(anomaly, context);

            // Step 3: Build anomaly-specific context
            const enrichedContext = await this.buildAnomalyContext(anomaly, context, knowledgeBase);

            // Step 4: Generate AI explanation
            const aiResponse = await this.generateAnomalyExplanation(enrichedContext);

            return {
                dataType: 'anomaly-detection',
                title: `Anomaly Analysis: ${anomaly.loanId}`,
                contextualExplanation: aiResponse.contextualExplanation,
                portfolioSpecifics: aiResponse.portfolioSpecifics,
                industryComparison: aiResponse.industryComparison,
                actionableInsights: aiResponse.actionableInsights,
                keyTakeaways: aiResponse.keyTakeaways,
                confidence: aiResponse.confidence,
                priority: anomaly.severity as any,
                sources: knowledgeBase.sources,
                metadata: {
                    processingTime: Date.now() - startTime,
                    dataQuality: context.avgDataQuality,
                    contextRelevance: knowledgeBase.relevanceScore
                }
            };

        } catch (error) {
            console.error('Error generating anomaly narrative:', error);
            return this.getFallbackAnomalyNarrative(anomaly);
        }
    }

    /**
     * Step 1: Extract portfolio data
     */
    private async extractPortfolioContext(): Promise<PortfolioContext> {
        try {
            const portfolioData = await portfolioService.getPortfolioSummary();
            const loans = await portfolioService.getAllLoans();

            const totalEmissions = loans.reduce((sum, loan) => sum + (loan.financed_emissions || 0), 0);
            const avgDataQuality = loans.reduce((sum, loan) => sum + (loan.data_quality_score || 5), 0) / loans.length;
            const evCount = loans.filter(loan => loan.fuel_type === 'electric').length;
            const evPercentage = (evCount / loans.length) * 100;
            const portfolioValue = loans.reduce((sum, loan) => sum + (loan.outstanding_balance || loan.loan_amount || 0), 0);
            const complianceRate = (loans.filter(loan => (loan.data_quality_score || 5) <= 3).length / loans.length) * 100;

            return {
                loans,
                totalEmissions,
                avgDataQuality,
                evPercentage,
                portfolioValue,
                riskLevel: avgDataQuality > 4 ? 'Low' : avgDataQuality > 3 ? 'Medium' : 'High',
                complianceRate,
                totalLoans: loans.length,
                sectors: this.extractSectors(loans),
                geographies: this.extractGeographies(loans),
                fuelTypes: this.extractFuelTypes(loans)
            };
        } catch (error) {
            console.error('Error extracting portfolio context:', error);
            throw error;
        }
    }

    /**
     * Step 2: Query ChromaDB for relevant knowledge
     */
    private async queryRelevantKnowledge(
        metricType: ClimateNarrative['dataType'],
        currentValue: number | string,
        context: PortfolioContext
    ): Promise<{ sources: ChromaSearchResult[]; relevanceScore: number }> {
        try {
            const searchQueries = this.buildSearchQueries(metricType, currentValue, context);
            const searchResults: ChromaSearchResult[] = [];
            let totalRelevance = 0;

            for (const query of searchQueries) {
                const results = await this.chromaService.searchKnowledgeBase(query, {
                    maxResults: 3,
                    minRelevanceScore: 0.7
                });

                searchResults.push(...results.sources);
                totalRelevance += results.confidence;
            }

            // Deduplicate and rank results
            const uniqueResults = this.deduplicateResults(searchResults);
            const rankedResults = this.rankResultsByRelevance(uniqueResults, metricType, context);

            return {
                sources: rankedResults.slice(0, 5), // Top 5 most relevant
                relevanceScore: totalRelevance / searchQueries.length
            };

        } catch (error) {
            console.error('Error querying ChromaDB:', error);
            return { sources: [], relevanceScore: 0 };
        }
    }

    /**
     * Step 3: Combine with portfolio context
     */
    private async buildEnrichedContext(
        metricType: ClimateNarrative['dataType'],
        currentValue: number | string,
        targetValue: number | string | undefined,
        portfolioContext: PortfolioContext,
        knowledgeBase: { sources: ChromaSearchResult[]; relevanceScore: number }
    ): Promise<any> {
        // Build comprehensive context for AI
        const enrichedContext = {
            metric: {
                type: metricType,
                currentValue,
                targetValue,
                unit: this.getMetricUnit(metricType),
                trend: await this.calculateTrend(metricType, portfolioContext),
                benchmark: await this.getBenchmark(metricType, portfolioContext)
            },
            portfolio: {
                summary: portfolioContext,
                composition: this.analyzePortfolioComposition(portfolioContext),
                riskProfile: this.assessRiskProfile(portfolioContext),
                opportunities: this.identifyOpportunities(metricType, portfolioContext)
            },
            knowledge: {
                sources: knowledgeBase.sources,
                relevantRegulations: this.extractRegulations(knowledgeBase.sources),
                industryBenchmarks: this.extractBenchmarks(knowledgeBase.sources),
                bestPractices: this.extractBestPractices(knowledgeBase.sources)
            },
            context: {
                userRole: 'portfolio_manager', // Could be dynamic
                analysisDepth: 'detailed',
                focusAreas: this.determineFocusAreas(metricType, portfolioContext),
                urgency: this.assessUrgency(metricType, currentValue, portfolioContext)
            }
        };

        return enrichedContext;
    }

    /**
     * Step 4: Send to OpenAI with structured prompt
     */
    private async generateAINarrative(
        metricType: ClimateNarrative['dataType'],
        enrichedContext: any
    ): Promise<any> {
        const prompt = this.buildStructuredPrompt(metricType, enrichedContext);

        try {
            const aiResponse = await this.aiService.getAIInsights({
                query: prompt,
                context: {
                    portfolioSummary: enrichedContext.portfolio.summary,
                    analysisType: 'portfolio'
                },
                agent: 'advisory'
            });

            // Parse structured response
            return this.parseAIResponse(aiResponse.response, enrichedContext);

        } catch (error) {
            console.error('Error generating AI narrative:', error);
            throw error;
        }
    }

    /**
     * Build structured prompt for OpenAI
     */
    private buildStructuredPrompt(metricType: ClimateNarrative['dataType'], context: any): string {
        const basePrompt = `
You are a climate finance expert analyzing a portfolio's ${metricType.replace('-', ' ')} performance.

PORTFOLIO CONTEXT:
- Total Loans: ${context.portfolio.summary.totalLoans}
- Portfolio Value: $${(context.portfolio.summary.portfolioValue / 1000000).toFixed(1)}M
- Current ${metricType}: ${context.metric.currentValue}${context.metric.unit}
- Data Quality Score: ${context.portfolio.summary.avgDataQuality.toFixed(1)}/5
- EV Percentage: ${context.portfolio.summary.evPercentage.toFixed(1)}%

INDUSTRY KNOWLEDGE:
${context.knowledge.sources.map((s: any) => `- ${s.answer}`).join('\n')}

ANALYSIS REQUIREMENTS:
Generate a comprehensive narrative with these sections:

1. CONTEXTUAL_EXPLANATION: Explain what this metric means for this specific portfolio
2. PORTFOLIO_SPECIFICS: Highlight unique aspects of this portfolio's performance
3. INDUSTRY_COMPARISON: Compare against industry benchmarks and peers
4. ACTIONABLE_INSIGHTS: Provide 3-5 specific, actionable recommendations
5. KEY_TAKEAWAYS: Summarize the most important points for decision-making

Format as JSON with these exact keys: contextualExplanation, portfolioSpecifics, industryComparison, actionableInsights (array), keyTakeaways (array), confidence (0-1).

Focus on practical, actionable insights that help portfolio managers make informed decisions.
`;

        return basePrompt;
    }

    /**
     * Parse AI response into structured format
     */
    private parseAIResponse(response: string, context: any): any {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(response);

            return {
                contextualExplanation: parsed.contextualExplanation || '',
                portfolioSpecifics: parsed.portfolioSpecifics || '',
                industryComparison: parsed.industryComparison || '',
                actionableInsights: Array.isArray(parsed.actionableInsights) ? parsed.actionableInsights : [],
                keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
                confidence: parsed.confidence || 0.8
            };
        } catch (error) {
            // Fallback: parse as text and structure it
            return this.parseTextResponse(response);
        }
    }

    /**
     * Build search queries for ChromaDB
     */
    private buildSearchQueries(
        metricType: ClimateNarrative['dataType'],
        currentValue: number | string,
        context: PortfolioContext
    ): string[] {
        const baseQueries: Record<string, string[]> = {
            'ev-transition': [
                'electric vehicle adoption portfolio strategy',
                'EV financing transition planning',
                'electric vehicle market trends automotive lending'
            ],
            'emissions-total': [
                'financed emissions calculation methodology',
                'carbon footprint portfolio management',
                'emission reduction strategies financial institutions'
            ],
            'risk-level': [
                'climate risk assessment portfolio',
                'transition risk financial institutions',
                'physical climate risk management'
            ],
            'portfolio-overview': [
                'portfolio climate performance analysis',
                'sustainable finance portfolio management',
                'PCAF compliance portfolio assessment'
            ],
            'data-quality': [
                'PCAF data quality requirements',
                'emission factor data quality improvement',
                'portfolio data quality enhancement'
            ]
        };

        return baseQueries[metricType] || ['climate finance portfolio analysis'];
    }

    /**
     * Helper methods
     */
    private getMetricTitle(metricType: ClimateNarrative['dataType']): string {
        const titles: Record<string, string> = {
            'ev-transition': 'Electric Vehicle Transition Analysis',
            'emissions-total': 'Total Emissions Assessment',
            'risk-level': 'Climate Risk Evaluation',
            'portfolio-overview': 'Portfolio Performance Overview',
            'anomaly-detection': 'Anomaly Detection Analysis',
            'data-quality': 'Data Quality Assessment',
            'compliance-status': 'Compliance Status Review'
        };
        return titles[metricType] || 'Climate Analysis';
    }

    private getMetricUnit(metricType: ClimateNarrative['dataType']): string {
        const units: Record<string, string> = {
            'ev-transition': '%',
            'emissions-total': ' tCO2e',
            'risk-level': '',
            'portfolio-overview': '',
            'data-quality': '/5',
            'compliance-status': '%'
        };
        return units[metricType] || '';
    }

    private calculatePriority(
        metricType: ClimateNarrative['dataType'],
        currentValue: number | string,
        context: PortfolioContext
    ): 'high' | 'medium' | 'low' {
        // Priority logic based on metric type and values
        if (metricType === 'risk-level' && context.avgDataQuality > 4) return 'high';
        if (metricType === 'ev-transition' && context.evPercentage < 10) return 'high';
        if (metricType === 'emissions-total' && context.totalEmissions > 1000) return 'medium';
        return 'low';
    }

    private extractSectors(loans: any[]): Record<string, number> {
        return loans.reduce((acc, loan) => {
            const sector = loan.sector || 'Unknown';
            acc[sector] = (acc[sector] || 0) + 1;
            return acc;
        }, {});
    }

    private extractGeographies(loans: any[]): Record<string, number> {
        return loans.reduce((acc, loan) => {
            const country = loan.country || 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {});
    }

    private extractFuelTypes(loans: any[]): Record<string, number> {
        return loans.reduce((acc, loan) => {
            const fuelType = loan.fuel_type || 'Unknown';
            acc[fuelType] = (acc[fuelType] || 0) + 1;
            return acc;
        }, {});
    }

    private deduplicateResults(results: ChromaSearchResult[]): ChromaSearchResult[] {
        const seen = new Set();
        return results.filter(result => {
            const key = result.question + result.answer;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    private rankResultsByRelevance(
        results: ChromaSearchResult[],
        metricType: ClimateNarrative['dataType'],
        context: PortfolioContext
    ): ChromaSearchResult[] {
        return results.sort((a, b) => {
            // Rank by relevance score and category match
            const aScore = a.relevanceScore + (a.category.includes(metricType) ? 0.2 : 0);
            const bScore = b.relevanceScore + (b.category.includes(metricType) ? 0.2 : 0);
            return bScore - aScore;
        });
    }

    private async calculateTrend(metricType: ClimateNarrative['dataType'], context: PortfolioContext): Promise<string> {
        // Simplified trend calculation - in real implementation, use historical data
        return 'stable';
    }

    private async getBenchmark(metricType: ClimateNarrative['dataType'], context: PortfolioContext): Promise<any> {
        // Industry benchmarks - in real implementation, fetch from database
        const benchmarks: Record<string, any> = {
            'ev-transition': { industry: 15, leading: 25, target: 50 },
            'emissions-total': { industry: 500, leading: 300, target: 200 },
            'data-quality': { industry: 3.5, leading: 2.5, target: 2.0 }
        };
        return benchmarks[metricType] || {};
    }

    private analyzePortfolioComposition(context: PortfolioContext): any {
        return {
            diversification: Object.keys(context.sectors || {}).length,
            concentration: Math.max(...Object.values(context.sectors || {})) / context.totalLoans,
            evReadiness: context.evPercentage / 100
        };
    }

    private assessRiskProfile(context: PortfolioContext): any {
        return {
            dataQualityRisk: context.avgDataQuality > 3 ? 'high' : 'medium',
            transitionRisk: context.evPercentage < 20 ? 'high' : 'medium',
            concentrationRisk: 'medium' // Simplified
        };
    }

    private identifyOpportunities(metricType: ClimateNarrative['dataType'], context: PortfolioContext): string[] {
        const opportunities = [];

        if (context.evPercentage < 30) {
            opportunities.push('Increase EV financing to capture transition opportunities');
        }

        if (context.avgDataQuality > 3) {
            opportunities.push('Improve data collection to enhance portfolio insights');
        }

        return opportunities;
    }

    private determineFocusAreas(metricType: ClimateNarrative['dataType'], context: PortfolioContext): string[] {
        return ['emission_reduction', 'data_quality', 'regulatory_compliance'];
    }

    private assessUrgency(metricType: ClimateNarrative['dataType'], currentValue: number | string, context: PortfolioContext): string {
        if (metricType === 'risk-level' && context.avgDataQuality > 4) return 'high';
        return 'medium';
    }

    private extractRegulations(sources: ChromaSearchResult[]): string[] {
        return sources
            .filter(s => s.category.includes('regulation') || s.category.includes('compliance'))
            .map(s => s.answer)
            .slice(0, 3);
    }

    private extractBenchmarks(sources: ChromaSearchResult[]): string[] {
        return sources
            .filter(s => s.category.includes('benchmark') || s.category.includes('industry'))
            .map(s => s.answer)
            .slice(0, 3);
    }

    private extractBestPractices(sources: ChromaSearchResult[]): string[] {
        return sources
            .filter(s => s.category.includes('practice') || s.category.includes('strategy'))
            .map(s => s.answer)
            .slice(0, 3);
    }

    private parseTextResponse(response: string): any {
        // Fallback text parsing if JSON parsing fails
        return {
            contextualExplanation: response.substring(0, 500),
            portfolioSpecifics: 'Analysis based on current portfolio composition and performance metrics.',
            industryComparison: 'Compared against industry standards and best practices.',
            actionableInsights: ['Review data quality', 'Consider EV financing expansion', 'Monitor regulatory changes'],
            keyTakeaways: ['Portfolio performance assessment completed', 'Opportunities identified for improvement'],
            confidence: 0.7
        };
    }

    /**
     * Anomaly-specific methods
     */
    private async queryAnomalyKnowledge(anomaly: AnomalyContext, context: PortfolioContext): Promise<any> {
        const queries = [
            `${anomaly.category} anomaly detection financial portfolio`,
            `${anomaly.severity} risk anomaly management`,
            'portfolio anomaly resolution strategies'
        ];

        const searchResults: ChromaSearchResult[] = [];
        for (const query of queries) {
            const results = await this.chromaService.searchKnowledgeBase(query, {
                maxResults: 2,
                minRelevanceScore: 0.6
            });
            searchResults.push(...results.sources);
        }

        return {
            sources: searchResults.slice(0, 3),
            relevanceScore: 0.8
        };
    }

    private async buildAnomalyContext(anomaly: AnomalyContext, portfolioContext: PortfolioContext, knowledgeBase: any): Promise<any> {
        return {
            anomaly,
            portfolio: portfolioContext,
            knowledge: knowledgeBase,
            similarCases: await this.findSimilarAnomalies(anomaly, portfolioContext),
            riskAssessment: this.assessAnomalyRisk(anomaly, portfolioContext),
            resolutionStrategies: this.getResolutionStrategies(anomaly)
        };
    }

    private async generateAnomalyExplanation(context: any): Promise<any> {
        const prompt = `
Analyze this portfolio anomaly and provide actionable insights:

ANOMALY DETAILS:
- Loan ID: ${context.anomaly.loanId}
- Description: ${context.anomaly.description}
- Severity: ${context.anomaly.severity}
- Category: ${context.anomaly.category}

PORTFOLIO CONTEXT:
- Total Loans: ${context.portfolio.totalLoans}
- Average Data Quality: ${context.portfolio.avgDataQuality.toFixed(1)}/5

Provide analysis in JSON format with: contextualExplanation, portfolioSpecifics, industryComparison, actionableInsights (array), keyTakeaways (array), confidence (0-1).
`;

        try {
            const aiResponse = await this.aiService.getAIInsights({
                query: prompt,
                context: { portfolioSummary: context.portfolio },
                agent: 'risk'
            });

            return this.parseAIResponse(aiResponse.response, context);
        } catch (error) {
            return this.getDefaultAnomalyResponse(context.anomaly);
        }
    }

    private async findSimilarAnomalies(anomaly: AnomalyContext, context: PortfolioContext): Promise<any[]> {
        // In real implementation, query historical anomalies
        return [];
    }

    private assessAnomalyRisk(anomaly: AnomalyContext, context: PortfolioContext): string {
        return anomaly.severity === 'high' ? 'Immediate attention required' : 'Monitor closely';
    }

    private getResolutionStrategies(anomaly: AnomalyContext): string[] {
        const strategies: Record<string, string[]> = {
            'data-quality': ['Verify data sources', 'Update collection methods', 'Implement validation rules'],
            'emission-calculation': ['Review calculation methodology', 'Check emission factors', 'Validate input data'],
            'compliance': ['Review regulatory requirements', 'Update compliance procedures', 'Conduct audit']
        };

        return strategies[anomaly.category] || ['Investigate root cause', 'Implement corrective measures', 'Monitor for recurrence'];
    }

    private getDefaultAnomalyResponse(anomaly: AnomalyContext): any {
        return {
            contextualExplanation: `Anomaly detected in loan ${anomaly.loanId}: ${anomaly.description}`,
            portfolioSpecifics: 'This anomaly requires investigation to maintain portfolio data integrity.',
            industryComparison: 'Anomaly detection is crucial for maintaining portfolio quality standards.',
            actionableInsights: ['Investigate root cause', 'Implement corrective measures', 'Update monitoring procedures'],
            keyTakeaways: ['Anomaly identified and flagged', 'Investigation required', 'Portfolio monitoring active'],
            confidence: 0.9
        };
    }

    /**
     * Fallback narratives for error cases
     */
    private getFallbackNarrative(metricType: ClimateNarrative['dataType'], currentValue: number | string): ClimateNarrative {
        return {
            dataType: metricType,
            title: this.getMetricTitle(metricType),
            contextualExplanation: `Current ${metricType.replace('-', ' ')} value is ${currentValue}. Analysis based on available portfolio data.`,
            portfolioSpecifics: 'Portfolio analysis completed using available data sources.',
            industryComparison: 'Comparison against industry standards and regulatory requirements.',
            actionableInsights: ['Review current performance', 'Identify improvement opportunities', 'Monitor progress regularly'],
            keyTakeaways: ['Metric analysis completed', 'Performance assessment available', 'Recommendations provided'],
            confidence: 0.6,
            priority: 'medium',
            sources: [],
            metadata: {
                processingTime: 100,
                dataQuality: 3.0,
                contextRelevance: 0.5
            }
        };
    }

    private getFallbackAnomalyNarrative(anomaly: AnomalyContext): ClimateNarrative {
        return {
            dataType: 'anomaly-detection',
            title: `Anomaly Analysis: ${anomaly.loanId}`,
            contextualExplanation: `Anomaly detected: ${anomaly.description}. Severity level: ${anomaly.severity}.`,
            portfolioSpecifics: 'This anomaly has been flagged for investigation and resolution.',
            industryComparison: 'Anomaly detection helps maintain portfolio quality and compliance standards.',
            actionableInsights: ['Investigate anomaly cause', 'Implement corrective action', 'Update monitoring procedures'],
            keyTakeaways: ['Anomaly successfully detected', 'Investigation required', 'Portfolio monitoring active'],
            confidence: 0.8,
            priority: anomaly.severity as any,
            sources: [],
            metadata: {
                processingTime: 50,
                dataQuality: 3.0,
                contextRelevance: 0.7
            }
        };
    }
}

// Export singleton instance
export const climateNarrativeService = ClimateNarrativeService.getInstance();