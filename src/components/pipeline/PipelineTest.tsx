/**
 * Pipeline Test Component - Interactive testing interface for the data pipeline
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Database,
  Search,
  BarChart3,
  FileText
} from 'lucide-react';
import { pipelineIntegrationService } from '@/services/pipeline-integration-service';
import { enhancedDataPipelineService } from '@/services/enhanced-data-pipeline-service';
import { chromaDBService } from '@/services/chroma-db-service';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
  duration?: number;
}

const PipelineTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: any, duration?: number) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        existing.duration = duration;
        return [...prev];
      } else {
        return [...prev, { name, status, message, details, duration }];
      }
    });
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    setCurrentTest(testName);
    updateTestResult(testName, 'running', 'Running...');
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'success', 'Completed successfully', result, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, 'error', error.message, error, duration);
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      toast({
        title: "Starting Pipeline Tests",
        description: "Running comprehensive pipeline flow tests...",
      });

      // Test 1: ChromaDB Health Check
      await runTest('ChromaDB Health Check', async () => {
        const health = await chromaDBService.healthCheck();
        const collections = await chromaDBService.getCollections();
        return {
          status: health.status,
          collections: collections.length,
          totalDocuments: health.totalDocuments
        };
      });

      // Test 2: Add Test Document
      await runTest('Document Storage Test', async () => {
        const testDoc = {
          id: `test_doc_${Date.now()}`,
          content: 'Test portfolio document with PCAF compliance data and emission metrics for testing semantic search capabilities.',
          metadata: {
            type: 'test_document',
            source: 'pipeline_test',
            timestamp: new Date(),
            dataQuality: 2.5,
            tags: ['test', 'portfolio', 'pcaf', 'emissions']
          }
        };

        const result = await chromaDBService.addDocuments('portfolio_documents', [testDoc]);
        return {
          documentId: testDoc.id,
          added: result.added,
          errors: result.errors
        };
      });

      // Test 3: Semantic Search Test
      await runTest('Semantic Search Test', async () => {
        const searchResults = await chromaDBService.searchDocuments('PCAF compliance emissions', {
          collectionName: 'portfolio_documents',
          limit: 5,
          minSimilarity: 0.1
        });

        return {
          resultsFound: searchResults.length,
          topSimilarity: searchResults.length > 0 ? searchResults[0].similarity : 0,
          results: searchResults.map(r => ({
            id: r.document.id,
            similarity: r.similarity,
            type: r.document.metadata.type
          }))
        };
      });

      // Test 4: Pipeline Integration Service
      await runTest('Pipeline Integration Test', async () => {
        await pipelineIntegrationService.initialize();
        const status = await pipelineIntegrationService.getSystemStatus();
        
        return {
          initialized: status.isInitialized,
          chromaHealth: status.chromaDBHealth,
          totalDocuments: status.totalDocuments,
          collections: status.collections
        };
      });

      // Test 5: Enhanced Pipeline Configuration
      await runTest('Enhanced Pipeline Config', async () => {
        const config = enhancedDataPipelineService.getConfig();
        const status = await enhancedDataPipelineService.getProcessingStatus();
        
        return {
          batchSize: config.batchSize,
          maxLoans: config.maxLoansToProcess,
          enableClientDocs: config.enableClientDocuments,
          isProcessing: status.isProcessing
        };
      });

      // Test 6: Integrated Search
      await runTest('Integrated Search Test', async () => {
        const results = await pipelineIntegrationService.searchDocuments('test portfolio emissions', {
          limit: 3
        });

        return {
          resultsFound: results.length,
          collections: [...new Set(results.map(r => r.collection))],
          results: results.map(r => ({
            id: r.id,
            type: r.type,
            similarity: r.similarity,
            collection: r.collection
          }))
        };
      });

      // Test 7: Portfolio Insights Generation
      await runTest('Portfolio Insights Test', async () => {
        const insights = await pipelineIntegrationService.getPortfolioInsights('portfolio performance test');
        
        return {
          insightsGenerated: insights.length,
          types: [...new Set(insights.map(i => i.type))],
          avgConfidence: insights.length > 0 
            ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length 
            : 0
        };
      });

      // Test 8: Collection Statistics
      await runTest('Collection Statistics', async () => {
        const collections = ['portfolio_documents', 'loan_documents', 'analytics_documents'];
        const stats = {};

        for (const collection of collections) {
          try {
            const collectionStats = await chromaDBService.getCollectionStats(collection);
            stats[collection] = {
              documents: collectionStats.documentCount,
              avgDataQuality: collectionStats.avgDataQuality,
              types: Object.keys(collectionStats.typeDistribution).length
            };
          } catch (error) {
            stats[collection] = { error: error.message };
          }
        }

        return stats;
      });

      toast({
        title: "All Tests Completed",
        description: "Pipeline flow tests completed successfully!",
      });

    } catch (error) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runQuickStart = async () => {
    setIsRunning(true);
    try {
      toast({
        title: "Starting Quick Start",
        description: "Running complete pipeline setup...",
      });

      const result = await runTest('Pipeline Quick Start', async () => {
        return await pipelineIntegrationService.quickStart();
      });

      if (result.success) {
        toast({
          title: "Quick Start Successful",
          description: `Created ${result.documentsCreated} documents in ${(result.processingTimeMs / 1000).toFixed(1)}s`,
        });
      } else {
        toast({
          title: "Quick Start Failed",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Quick Start Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'running': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Pipeline Flow Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of the data pipeline components and flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run All Tests
            </Button>
            <Button
              onClick={runQuickStart}
              disabled={isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              Quick Start Pipeline
            </Button>
          </div>

          {isRunning && currentTest && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="font-medium">Currently running: {currentTest}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Results from pipeline component tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {testResults.map((test, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${getStatusColor(test.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.duration && (
                          <Badge variant="outline">
                            {test.duration}ms
                          </Badge>
                        )}
                        <Badge variant={
                          test.status === 'success' ? 'default' :
                          test.status === 'error' ? 'destructive' :
                          test.status === 'running' ? 'secondary' : 'outline'
                        }>
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{test.message}</p>
                    
                    {test.details && (
                      <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Test Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Core Components</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ChromaDB Service Health & Operations</li>
                <li>• Document Storage & Retrieval</li>
                <li>• Semantic Search Functionality</li>
                <li>• Pipeline Integration Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Advanced Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enhanced Pipeline Configuration</li>
                <li>• Cross-Collection Search</li>
                <li>• AI Insights Generation</li>
                <li>• Collection Statistics & Monitoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineTest;