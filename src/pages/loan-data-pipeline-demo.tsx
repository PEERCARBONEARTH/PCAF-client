/**
 * Loan Data Pipeline Demo Page - Showcases the complete loan data upload and AI pipeline
 */

import React, { useState, useEffect } from 'react';
import { Search, Brain, TrendingUp, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import LoanDataUploader from '../components/loan-upload/LoanDataUploader';
import { loanDataPipelineService, ProcessingResult } from '../services/loan-data-pipeline-service';
import { chromaDBService } from '../services/chroma-db-service';

const LoanDataPipelineDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'analytics' | 'insights'>('upload');
  const [recentUploads, setRecentUploads] = useState<ProcessingResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      // Load analytics for all uploaded data
      const analyticsData = await loanDataPipelineService.getLoanDataAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load demo data:', error);
    }
  };

  const handleUploadComplete = (result: ProcessingResult) => {
    setRecentUploads(prev => [result, ...prev.slice(0, 4)]);
    loadDemoData(); // Refresh analytics
    
    // Auto-generate insights for the new upload
    if (result.success) {
      generateInsights(result.uploadId);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await loanDataPipelineService.searchLoanData(searchQuery, {
        limit: 10
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = async (uploadId?: string) => {
    setIsLoading(true);
    try {
      const generatedInsights = await loanDataPipelineService.generatePortfolioInsights(
        uploadId || recentUploads[0]?.uploadId
      );
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload Data', icon: Database },
    { id: 'search', label: 'AI Search', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Loan Data Pipeline & AI Demo
            </h1>
            <p className="mt-2 text-gray-600">
              Upload loan data across PCAF instruments and experience AI-powered contextual analysis
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <LoanDataUploader onUploadComplete={handleUploadComplete} />
            
            {/* Recent Uploads */}
            {recentUploads.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
                <div className="space-y-4">
                  {recentUploads.map((upload, index) => (
                    <div key={upload.uploadId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          Upload {upload.uploadId.split('_')[1]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {upload.processedLoans} loans • {upload.summary.avgDataQuality.toFixed(1)} avg PCAF score
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {upload.summary.totalEmissions.toFixed(1)} tCO2e
                          </div>
                          <div className="text-xs text-gray-500">Total Emissions</div>
                        </div>
                        {upload.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">AI-Powered Loan Search</h3>
              <p className="text-gray-600 mb-4">
                Search your uploaded loan data using natural language. The AI understands context and finds relevant loans.
              </p>
              
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'high emission vehicles', 'PCAF non-compliant loans', 'electric vehicles in Seattle'"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Search
                </button>
              </div>

              {/* Sample Queries */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Try these sample queries:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'high emission vehicles',
                    'PCAF non-compliant loans',
                    'electric vehicles',
                    'commercial real estate with poor energy ratings',
                    'renewable energy projects'
                  ].map((query) => (
                    <button
                      key={query}
                      onClick={() => setSearchQuery(query)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="font-semibold mb-4">Search Results ({searchResults.length})</h4>
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            Loan {result.loan.id}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {result.loan.instrument.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {(result.similarity * 100).toFixed(0)}% match
                          </div>
                          <div className="text-xs text-gray-500">Relevance</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <span className="ml-1 font-medium">${result.loan.loanAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">PCAF Score:</span>
                          <span className="ml-1 font-medium">{result.loan.pcafScore}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Emissions:</span>
                          <span className="ml-1 font-medium">
                            {result.loan.vehicleDetails?.emissions?.toFixed(1) || 
                             result.loan.propertyDetails?.emissions?.toFixed(1) || 
                             result.loan.projectDetails?.expectedEmissions?.toFixed(1) || 'N/A'} tCO2e
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className={`ml-1 font-medium ${
                            (result.loan.pcafScore || 5) <= 3 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(result.loan.pcafScore || 5) <= 3 ? 'Compliant' : 'Non-Compliant'}
                          </span>
                        </div>
                      </div>

                      {result.insights.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="text-sm font-medium text-blue-900 mb-1">AI Insights:</div>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {result.insights.map((insight: string, i: number) => (
                              <li key={i}>• {insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{analytics.totalLoans}</div>
                <div className="text-gray-500">Total Loans</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{analytics.riskDistribution.low}</div>
                <div className="text-gray-500">Low Risk</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-yellow-600">{analytics.riskDistribution.medium}</div>
                <div className="text-gray-500">Medium Risk</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-red-600">{analytics.riskDistribution.high}</div>
                <div className="text-gray-500">High Risk</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">By Instrument</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.byInstrument).map(([instrument, stats]: [string, any]) => (
                    <div key={instrument} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{instrument.replace('_', ' ')}</span>
                        <span className="text-gray-500">{stats.count} loans</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Avg Emissions</div>
                          <div className="font-medium">{stats.avgEmissions.toFixed(1)} tCO2e</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg PCAF</div>
                          <div className="font-medium">{stats.avgDataQuality.toFixed(1)}/5</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Compliance</div>
                          <div className="font-medium">{stats.complianceRate.toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Top Emitters</h3>
                <div className="space-y-3">
                  {analytics.topEmitters.slice(0, 5).map((emitter: any, index: number) => (
                    <div key={emitter.loanId} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{emitter.loanId}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {emitter.instrument.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          {emitter.emissions.toFixed(1)} tCO2e
                        </div>
                        <div className="text-xs text-gray-500">#{index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">AI-Generated Portfolio Insights</h3>
                <button
                  onClick={() => generateInsights()}
                  disabled={isLoading || recentUploads.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  Generate Insights
                </button>
              </div>

              {insights.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  Upload loan data and generate AI insights to see contextual analysis here.
                </div>
              )}

              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`border-l-4 p-4 rounded-r-lg ${
                    insight.impact === 'high' ? 'border-red-500 bg-red-50' :
                    insight.impact === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{insight.description}</p>
                    
                    {insight.actionItems.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Recommended Actions:</div>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {insight.actionItems.map((action, i) => (
                            <li key={i}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanDataPipelineDemo;