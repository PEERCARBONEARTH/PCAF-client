/**
 * Pipeline Demo Page - Demonstrates the complete data pipeline system
 * Shows how to extract, transform, embed, and store portfolio data in ChromaDB
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Database, 
  Search, 
  FileText, 
  BarChart3, 
  Target,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { pipelineIntegrationService } from '@/services/pipeline-integration-service';
import { toast } from '@/hooks/use-toast';

const PipelineDemoPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [quickStartResult, setQuickStartResult] = useState<any>(null);

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

  const handleQuickStart = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Starting Pipeline",
        description: "Initializing complete data pipeline system...",
      });

      const result = await pipelineIntegrationService.quickStart();
      setQuickStartResult(result);
      
      if (result.success) {
        toast({
          title: "Pipeline Complete",
          description: `Successfully processed ${result.documentsCreated} documents in ${(result.processingTimeMs / 1000).toFixed(1)}s`,
        });
        await loadSystemStatus();
        await loadInsights();
      } else {
        toast({
          title: "Pipeline Failed",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Pipeline Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Loading Sample Data",
        description: "Populating ChromaDB with comprehensive sample portfolio data...",
      });

      const result = await pipelineIntegrationService.loadSampleData({
        numLoans: 25,
        includeHistoricalData: true,
        clearExisting: true
      });
      
      if (result.success) {
        toast({
          title: "Sample Data Loaded",
          description: `Successfully loaded ${result.totalDocuments} documents across ${result.collectionsPopulated.length} collections`,
        });
        await loadSystemStatus();
        await loadInsights();
        setQuickStartResult({
          success: true,
          documentsCreated: result.totalDocuments,
          collectionsPopulated: result.collectionsPopulated,
          processingTimeMs: result.processingTime,
          errors: []
        });
      } else {
        toast({
          title: "Sample Data Loading Failed",
          description: "Failed to load sample data into ChromaDB",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sample Data Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const results = await pipelineIntegrationService.searchDocuments(searchQuery, {
        limit: 10
      });
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const portfolioInsights = await pipelineIntegrationService.getPortfolioInsights();
      setInsights(portfolioInsights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'overview': return <BarChart3 className="h-4 w-4" />;
      case 'risk': return <AlertCircle className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Pipeline Demo</h1>
          <p className="text-muted-foreground">
            Complete ETL pipeline: Portfolio → Transform → ChromaDB → AI Insights
          </p>
        </div>
        <Button
          onClick={handleQuickStart}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Quick Start Pipeline
        </Button>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current status of the data pipeline and ChromaDB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className={`text-2xl font-bold ${getStatusColor(systemStatus?.chromaDBHealth)}`}>
                {systemStatus?.chromaDBHealth || 'Unknown'}
              </div>
              <div className="text-sm text-muted-foreground">ChromaDB Health</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{systemStatus?.totalDocuments || 0}</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{systemStatus?.collections?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Collections</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {systemStatus?.dataFreshness ? `${systemStatus.dataFreshness.toFixed(1)}h` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Data Age</div>
            </div>
          </div>

          {systemStatus?.collections && systemStatus.collections.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Active Collections:</p>
              <div className="flex flex-wrap gap-2">
                {systemStatus.collections.map((collection: string) => (
                  <Badge key={collection} variant="outline">
                    {collection.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Start Result */}
      {quickStartResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {quickStartResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Pipeline Execution Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Documents Created</p>
                <p className="text-2xl font-bold">{quickStartResult.documentsCreated}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Collections Populated</p>
                <p className="text-2xl font-bold">{quickStartResult.collectionsPopulated.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Processing Time</p>
                <p className="text-2xl font-bold">{(quickStartResult.processingTimeMs / 1000).toFixed(1)}s</p>
              </div>
            </div>

            {quickStartResult.collectionsPopulated.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Collections Updated:</p>
                <div className="flex flex-wrap gap-2">
                  {quickStartResult.collectionsPopulated.map((collection: string) => (
                    <Badge key={collection} variant="default">
                      {collection}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {quickStartResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 text-red-600">Errors:</p>
                <div className="space-y-1">
                  {quickStartResult.errors.map((error: string, index: number) => (
                    <div key={index} className="text-sm text-red-600">
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Document Search</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Semantic Document Search
              </CardTitle>
              <CardDescription>
                Search across all portfolio documents using AI-powered semantic search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for portfolio insights, PCAF compliance, emissions data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{result.id}</span>
                        <Badge variant="outline">{result.type}</Badge>
                      </div>
                      <Badge variant="secondary">
                        {(result.similarity * 100).toFixed(1)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Collection: {result.collection}
                    </p>
                    <p className="text-sm">{result.content}</p>
                  </div>
                ))}

                {searchResults.length === 0 && searchQuery && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-xs mt-2">Try running the pipeline first to populate the database</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Portfolio Insights</h3>
              <p className="text-sm text-muted-foreground">
                AI-generated insights from your portfolio data
              </p>
            </div>
            <Button onClick={loadInsights} disabled={isLoading} variant="outline">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Refresh Insights
            </Button>
          </div>

          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    {insight.title}
                    <Badge variant={
                      insight.type === 'risk' ? 'destructive' :
                      insight.type === 'opportunity' ? 'default' :
                      insight.type === 'compliance' ? 'secondary' :
                      'outline'
                    }>
                      {insight.type}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Confidence: {(insight.confidence * 100).toFixed(1)}% • 
                    Sources: {insight.sources.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{insight.content}</p>
                </CardContent>
              </Card>
            ))}

            {insights.length === 0 && !isLoading && (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No insights available</p>
                  <p className="text-xs mt-2">Run the pipeline to generate AI-powered insights</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PipelineDemoPage;