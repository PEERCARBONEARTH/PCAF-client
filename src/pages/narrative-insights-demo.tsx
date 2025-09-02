/**
 * Narrative Insights Demo Page
 * Showcases the AI narrative builder integrated with the data pipeline
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Building2,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { NarrativeInsightsDashboard } from '@/components/insights/NarrativeInsightsDashboard';
import { pipelineIntegrationService } from '@/services/pipeline-integration-service';
import { toast } from '@/hooks/use-toast';

const NarrativeInsightsDemoPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const status = await pipelineIntegrationService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const handleLoadSampleData = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Loading Sample Data",
        description: "Populating ChromaDB with sample portfolio data for AI insights...",
      });

      const result = await pipelineIntegrationService.loadSampleData({
        numLoans: 25,
        includeHistoricalData: true,
        clearExisting: true
      });

      if (result.success) {
        toast({
          title: "Sample Data Loaded",
          description: `Successfully loaded ${result.totalDocuments} documents. AI insights are now available!`,
        });
        await loadSystemStatus();
      } else {
        toast({
          title: "Failed to Load Data",
          description: "Unable to load sample data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold">AI Narrative Insights</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Humanized, contextual AI insights that make complex portfolio analytics accessible 
          to banks of all sizes. Get actionable business strategy recommendations tailored 
          to your bank type and experience level.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Personalized for Your Bank</CardTitle>
            <CardDescription>
              Narratives adapt to your bank type (community, regional, national, credit union) 
              and experience level for maximum relevance.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Actionable Recommendations</CardTitle>
            <CardDescription>
              Every insight includes specific, prioritized actions with timelines, 
              effort estimates, and expected business outcomes.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Real-Time Integration</CardTitle>
            <CardDescription>
              Insights update automatically as your portfolio data changes, 
              ensuring recommendations stay current and relevant.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current status of the AI narrative system and data pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {systemStatus?.chromaDBHealth === 'healthy' ? (
                  <span className="text-green-600">Healthy</span>
                ) : (
                  <span className="text-yellow-600">Initializing</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">ChromaDB Status</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{systemStatus?.totalDocuments || 0}</div>
              <div className="text-sm text-muted-foreground">Documents Available</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{systemStatus?.collections?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Data Collections</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {systemStatus?.isInitialized ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">AI System Ready</div>
            </div>
          </div>

          {(!systemStatus?.totalDocuments || systemStatus.totalDocuments === 0) && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Load Sample Data</h4>
                  <p className="text-sm text-blue-700">
                    Load sample portfolio data to see AI narrative insights in action
                  </p>
                </div>
                <Button onClick={handleLoadSampleData} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Load Sample Data'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">AI Narrative Insights</TabsTrigger>
          <TabsTrigger value="about">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <NarrativeInsightsDashboard />
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How AI Narrative Insights Work</CardTitle>
              <CardDescription>
                Understanding the technology behind humanized portfolio analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Data Pipeline Integration
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The system continuously monitors your portfolio data from ChromaDB, 
                    analyzing loans, emissions, PCAF scores, and performance metrics in real-time.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    AI Analysis Engine
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI algorithms identify patterns, opportunities, and risks, 
                    generating insights tailored to your specific bank type and market context.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Narrative Generation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Complex analytics are transformed into clear, actionable narratives 
                    using language appropriate for your experience level and business context.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Actionable Recommendations
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Each insight includes prioritized action items with timelines, 
                    effort estimates, and expected business outcomes for immediate implementation.
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Key Benefits for Banks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium">Lower Barrier to Entry</h5>
                      <p className="text-sm text-muted-foreground">
                        Complex PCAF analytics made accessible to smaller banks without specialized expertise
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium">Actionable Strategy</h5>
                      <p className="text-sm text-muted-foreground">
                        Move beyond static reports to dynamic, actionable business recommendations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium">Personalized Context</h5>
                      <p className="text-sm text-muted-foreground">
                        Insights adapted to your bank type, size, and market for maximum relevance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium">Real-Time Updates</h5>
                      <p className="text-sm text-muted-foreground">
                        Insights evolve with your portfolio, ensuring recommendations stay current
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Ready to Get Started?</h4>
                  <p className="text-blue-700">
                    Load sample data to experience AI-powered narrative insights tailored for your bank.
                  </p>
                </div>
                <Button 
                  onClick={handleLoadSampleData} 
                  disabled={isLoading}
                  className="ml-auto"
                >
                  {isLoading ? 'Loading...' : 'Try It Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NarrativeInsightsDemoPage;