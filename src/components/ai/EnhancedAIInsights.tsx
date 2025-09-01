import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Brain,
    TrendingUp,
    Shield,
    Target,
    Lightbulb,
    BarChart3,
    Activity,
    CheckCircle,
    MessageCircle,
    Users,
    Settings
} from 'lucide-react';
import { aiInsightsNarrativeService } from '@/services/aiInsightsNarrativeService';
import { pureDatasetRAGService } from '@/services/pureDatasetRAGService';

interface EnhancedAIInsightsProps {
    portfolioData?: any;
    userRole?: 'executive' | 'risk_manager' | 'compliance_officer' | 'loan_officer';
}

export function EnhancedAIInsights({ portfolioData, userRole = 'risk_manager' }: EnhancedAIInsightsProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [narrativeInsights, setNarrativeInsights] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatQuery, setChatQuery] = useState('');

    useEffect(() => {
        if (portfolioData) {
            generateNarrativeInsights();
        }
    }, [portfolioData, userRole]);

    const generateNarrativeInsights = async () => {
        setIsLoading(true);
        try {
            // Mock portfolio metrics - in real implementation, this would come from portfolioData
            const mockMetrics = {
                totalFinancedEmissions: portfolioData?.totalEmissions || 125000,
                emissionIntensity: portfolioData?.emissionIntensity || 2.4,
                dataQualityScore: portfolioData?.dataQualityScore || 2.8,
                totalLoans: portfolioData?.totalLoans || 2847,
                totalExposure: portfolioData?.totalExposure || 156000000,
                complianceStatus: portfolioData?.complianceStatus || 'compliant'
            };

            const insights = aiInsightsNarrativeService.generatePortfolioOverviewNarrative(mockMetrics, userRole);
            setNarrativeInsights(insights);
        } catch (error) {
            console.error('Failed to generate narrative insights:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickChat = async (query: string) => {
        try {
            const response = await pureDatasetRAGService.processQuery({
                query,
                sessionId: 'ai_insights_session',
                portfolioContext: portfolioData,
                userRole
            });

            // Display response in a modal or expand section
            alert(`AI Response: ${response.response.substring(0, 200)}...`);
        } catch (error) {
            console.error('Chat query failed:', error);
        }
    };

    const getRoleIcon = (role: string) => {
        const icons = {
            executive: Target,
            risk_manager: Shield,
            compliance_officer: CheckCircle,
            loan_officer: Users
        };
        return icons[role as keyof typeof icons] || Shield;
    };

    const quickInsightQueries = [
        "What does my emission intensity tell me about competitive position?",
        "How does my data quality score impact regulatory compliance?",
        "What are the business implications of my current PCAF performance?",
        "How can I improve my portfolio's climate risk profile?",
        "What ESG opportunities does my current performance create?"
    ];

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Role Context */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <Brain className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Enhanced AI Insights</CardTitle>
                                <CardDescription>
                                    Intelligent portfolio analysis with contextual narratives for {userRole.replace('_', ' ')}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {React.createElement(getRoleIcon(userRole), { className: "w-5 h-5 text-primary" })}
                            <Badge variant="secondary" className="capitalize">
                                {userRole.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
                    <TabsTrigger value="narratives">Smart Narratives</TabsTrigger>
                    <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                    <TabsTrigger value="chat">Interactive Chat</TabsTrigger>
                    <TabsTrigger value="insights">Deep Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Key Metrics with Narratives */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Total Financed Emissions</CardTitle>
                                    <Activity className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-2xl font-bold">125,000 <span className="text-sm font-normal text-muted-foreground">tCO₂e</span></div>
                                    <div className="text-xs text-muted-foreground">
                                        <strong>AI Insight:</strong> Your portfolio's climate footprint represents moderate exposure with
                                        <Badge variant="secondary" className="mx-1">75th percentile</Badge>
                                        performance among regional banks
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => handleQuickChat("Explain my total financed emissions in business context")}
                                    >
                                        <MessageCircle className="w-3 h-3 mr-1" />
                                        Ask AI about this metric
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Emission Intensity</CardTitle>
                                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-2xl font-bold">2.4 <span className="text-sm font-normal text-muted-foreground">kg/$1k</span></div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">Above Average</Badge>
                                        <span className="text-xs text-muted-foreground">vs 2.8 industry avg</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <strong>AI Insight:</strong> Strong competitive position enabling ESG product differentiation and
                                        <span className="font-medium">10-15 bps</span> pricing premium potential
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => handleQuickChat("What does my emission intensity mean for business strategy?")}
                                    >
                                        <MessageCircle className="w-3 h-3 mr-1" />
                                        Strategic implications
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">PCAF Data Quality</CardTitle>
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-2xl font-bold">2.8 <span className="text-sm font-normal text-muted-foreground">WDQS</span></div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">Compliant</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <strong>AI Insight:</strong> Meets regulatory threshold with
                                        <span className="font-medium">847 loans</span> offering improvement opportunities for enhanced market positioning
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => handleQuickChat("How can I optimize my PCAF compliance for competitive advantage?")}
                                    >
                                        <MessageCircle className="w-3 h-3 mr-1" />
                                        Optimization strategies
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Comprehensive Narrative */}
                    {narrativeInsights && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-primary" />
                                    {narrativeInsights.title}
                                </CardTitle>
                                <CardDescription>
                                    AI-generated contextual analysis tailored for {userRole.replace('_', ' ')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <div className="whitespace-pre-line text-sm leading-relaxed">
                                        {narrativeInsights.narrative}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="narratives" className="space-y-6">
                    {narrativeInsights && (
                        <>
                            {/* Executive Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="w-5 h-5 text-primary" />
                                        Executive Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Alert>
                                        <Brain className="h-4 w-4" />
                                        <AlertDescription>
                                            {narrativeInsights.executiveSummary}
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            {/* Key Takeaways */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Key Takeaways
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {narrativeInsights.keyTakeaways.map((takeaway: string, index: number) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                                                </div>
                                                <p className="text-sm">{takeaway}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Business Impact Analysis */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Business Impact Assessment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{narrativeInsights.businessImpact}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Risk Assessment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{narrativeInsights.riskAssessment}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6">
                    {narrativeInsights && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-primary" />
                                    AI-Generated Action Items
                                </CardTitle>
                                <CardDescription>
                                    Prioritized recommendations based on your portfolio performance and role
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {narrativeInsights.actionItems.map((action: string, index: number) => (
                                        <div key={index} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-medium text-primary">{index + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{action}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {index < 2 ? 'High Priority' : index < 4 ? 'Medium Priority' : 'Low Priority'}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs h-6"
                                                        onClick={() => handleQuickChat(`How do I implement: ${action}`)}
                                                    >
                                                        <MessageCircle className="w-3 h-3 mr-1" />
                                                        Get implementation guidance
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="chat" className="space-y-6">
                    {/* Quick Chat Interface */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-primary" />
                                Interactive AI Assistant
                            </CardTitle>
                            <CardDescription>
                                Ask specific questions about your portfolio insights and get contextual explanations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Quick Query Buttons */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Quick Insights:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickInsightQueries.map((query, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-auto py-2 px-3"
                                            onClick={() => handleQuickChat(query)}
                                        >
                                            {query}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Query Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask about your portfolio performance, compliance, or strategic implications..."
                                    value={chatQuery}
                                    onChange={(e) => setChatQuery(e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && chatQuery && handleQuickChat(chatQuery)}
                                />
                                <Button
                                    onClick={() => chatQuery && handleQuickChat(chatQuery)}
                                    disabled={!chatQuery.trim()}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="insights" className="space-y-6">
                    {/* Deep Analytics */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Benchmark Comparison</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {narrativeInsights && (
                                    <p className="text-sm text-muted-foreground">{narrativeInsights.benchmarkComparison}</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Market Intelligence</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>ESG Market Access:</span>
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">Full Access</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Competitive Position:</span>
                                        <Badge variant="secondary">Above Average</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Regulatory Standing:</span>
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">Compliant</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Performance Trends & Projections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <TrendingUp className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>12-Month Outlook:</strong> Portfolio trajectory suggests stable to improving performance with
                                    moderate enhancement opportunity through strategic data quality investments and substantial ESG market expansion.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}