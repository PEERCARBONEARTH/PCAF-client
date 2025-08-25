import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";
import { portfolioService } from "@/services/portfolioService";
import {
  Search,
  Brain,
  FileText,
  Calculator,
  Shield,
  TrendingUp,
  Clock,
  ExternalLink,
  Sparkles,
  Filter,
  SortAsc,
  Loader2
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'loan' | 'calculation' | 'compliance' | 'insight' | 'document';
  relevance: number;
  source: string;
  metadata: {
    loan_id?: string;
    date?: string;
    category?: string;
    confidence?: number;
  };
  highlights: string[];
  actions: Array<{
    label: string;
    action: () => void;
  }>;
}

interface SearchSuggestion {
  query: string;
  category: string;
  description: string;
}

interface SearchFilters {
  type: string;
  dateRange: string;
  relevanceThreshold: number;
  includeAI: boolean;
}

export function IntelligentSearchInterface() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    dateRange: 'all',
    relevanceThreshold: 0.5,
    includeAI: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Predefined search suggestions
  const defaultSuggestions: SearchSuggestion[] = [
    {
      query: "loans with high emission intensity",
      category: "Portfolio Analysis",
      description: "Find loans contributing most to portfolio emissions"
    },
    {
      query: "PCAF data quality issues",
      category: "Compliance",
      description: "Identify data quality problems affecting PCAF scores"
    },
    {
      query: "electric vehicle loan performance",
      category: "Sustainability",
      description: "Analyze EV loan portfolio performance and trends"
    },
    {
      query: "attribution factor calculation methodology",
      category: "Technical",
      description: "Understand how attribution factors are calculated"
    },
    {
      query: "climate risk exposure assessment",
      category: "Risk Management",
      description: "Evaluate portfolio exposure to climate risks"
    },
    {
      query: "regulatory compliance status",
      category: "Compliance",
      description: "Check current regulatory compliance status"
    }
  ];

  useEffect(() => {
    setSuggestions(defaultSuggestions);
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        generateDynamicSuggestions(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions(defaultSuggestions);
    }
  }, [query]);

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const generateDynamicSuggestions = async (searchQuery: string) => {
    try {
      // Generate contextual suggestions based on the current query
      const contextualSuggestions: SearchSuggestion[] = [];
      
      if (searchQuery.toLowerCase().includes('emission')) {
        contextualSuggestions.push({
          query: `${searchQuery} by vehicle type`,
          category: "Breakdown Analysis",
          description: "Analyze emissions breakdown by vehicle categories"
        });
      }
      
      if (searchQuery.toLowerCase().includes('loan')) {
        contextualSuggestions.push({
          query: `${searchQuery} with poor data quality`,
          category: "Data Quality",
          description: "Focus on loans with data quality issues"
        });
      }
      
      if (searchQuery.toLowerCase().includes('risk')) {
        contextualSuggestions.push({
          query: `${searchQuery} mitigation strategies`,
          category: "Risk Management",
          description: "Find risk mitigation recommendations"
        });
      }

      setSuggestions([...contextualSuggestions, ...defaultSuggestions.slice(0, 3)]);
    } catch (error) {
      console.error('Failed to generate dynamic suggestions:', error);
    }
  };

  const performSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    setLoading(true);
    saveRecentSearch(queryToSearch);

    try {
      // Get portfolio context for search
      const { loans, summary } = await portfolioService.getPortfolioSummary();
      
      // Perform AI-powered search
      const searchResults = await performIntelligentSearch(queryToSearch, loans, summary);
      
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast({
          title: "No Results Found",
          description: "Try adjusting your search query or filters.",
        });
      }

    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performIntelligentSearch = async (searchQuery: string, loans: any[], summary: any): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];

    // Search through loans
    const loanResults = searchLoans(searchQuery, loans);
    results.push(...loanResults);

    // Search for insights and calculations
    if (filters.includeAI) {
      const aiResults = await searchWithAI(searchQuery, { loans, summary });
      results.push(...aiResults);
    }

    // Search for compliance-related content
    const complianceResults = searchCompliance(searchQuery, loans);
    results.push(...complianceResults);

    // Filter by relevance threshold
    const filteredResults = results.filter(r => r.relevance >= filters.relevanceThreshold);

    // Sort by relevance
    return filteredResults.sort((a, b) => b.relevance - a.relevance);
  };

  const searchLoans = (searchQuery: string, loans: any[]): SearchResult[] => {
    const query_lower = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    loans.forEach(loan => {
      let relevance = 0;
      const highlights: string[] = [];

      // Check loan ID
      if (loan.loan_id.toLowerCase().includes(query_lower)) {
        relevance += 0.9;
        highlights.push(`Loan ID: ${loan.loan_id}`);
      }

      // Check borrower name
      if (loan.borrower_name.toLowerCase().includes(query_lower)) {
        relevance += 0.8;
        highlights.push(`Borrower: ${loan.borrower_name}`);
      }

      // Check vehicle details
      if (loan.vehicle_details.make.toLowerCase().includes(query_lower) ||
          loan.vehicle_details.model.toLowerCase().includes(query_lower)) {
        relevance += 0.7;
        highlights.push(`Vehicle: ${loan.vehicle_details.make} ${loan.vehicle_details.model}`);
      }

      // Check for emission-related queries
      if (query_lower.includes('emission') || query_lower.includes('carbon')) {
        relevance += 0.6;
        highlights.push(`Emissions: ${loan.emissions_data.financed_emissions_tco2e.toFixed(2)} tCO₂e`);
      }

      // Check for data quality queries
      if (query_lower.includes('quality') || query_lower.includes('pcaf')) {
        relevance += 0.5;
        highlights.push(`Data Quality Score: ${loan.emissions_data.data_quality_score}`);
      }

      if (relevance > 0) {
        results.push({
          id: `loan_${loan.loan_id}`,
          title: `Loan ${loan.loan_id} - ${loan.borrower_name}`,
          content: `${loan.vehicle_details.year} ${loan.vehicle_details.make} ${loan.vehicle_details.model} • ${loan.vehicle_details.fuel_type} • $${loan.loan_amount.toLocaleString()}`,
          type: 'loan',
          relevance,
          source: 'Portfolio Database',
          metadata: {
            loan_id: loan.loan_id,
            date: loan.created_at,
            category: loan.vehicle_details.type
          },
          highlights,
          actions: [
            {
              label: 'View Details',
              action: () => {
                // Navigate to loan details
                console.log('Navigate to loan details:', loan.loan_id);
              }
            },
            {
              label: 'Analyze Emissions',
              action: () => {
                // Open emissions analysis
                console.log('Analyze emissions for loan:', loan.loan_id);
              }
            }
          ]
        });
      }
    });

    return results;
  };

  const searchWithAI = async (searchQuery: string, context: any): Promise<SearchResult[]> => {
    try {
      const aiResponse = await aiService.getAIInsights({
        query: `Search and analyze: ${searchQuery}`,
        context,
        agent: 'advisory'
      });

      return [{
        id: `ai_${Date.now()}`,
        title: 'AI Analysis Result',
        content: aiResponse.response,
        type: 'insight',
        relevance: aiResponse.confidence,
        source: 'AI Analysis Engine',
        metadata: {
          confidence: aiResponse.confidence,
          date: new Date().toISOString()
        },
        highlights: aiResponse.sources.map(s => s.title),
        actions: [
          {
            label: 'Get More Details',
            action: async () => {
              // Get more detailed analysis
              const detailedResponse = await aiService.getAIInsights({
                query: `Provide more detailed analysis on: ${searchQuery}`,
                context,
                agent: 'advisory'
              });
              toast({
                title: "Detailed Analysis",
                description: detailedResponse.response.substring(0, 100) + "...",
              });
            }
          }
        ]
      }];
    } catch (error) {
      console.error('AI search failed:', error);
      return [];
    }
  };

  const searchCompliance = (searchQuery: string, loans: any[]): SearchResult[] => {
    const query_lower = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    if (query_lower.includes('compliance') || query_lower.includes('pcaf') || query_lower.includes('regulation')) {
      const poorQualityLoans = loans.filter(loan => loan.emissions_data.data_quality_score >= 4);
      
      if (poorQualityLoans.length > 0) {
        results.push({
          id: 'compliance_data_quality',
          title: 'Data Quality Compliance Issues',
          content: `${poorQualityLoans.length} loans have PCAF data quality scores of 4 or higher, which may impact compliance reporting.`,
          type: 'compliance',
          relevance: 0.8,
          source: 'Compliance Monitor',
          metadata: {
            category: 'data_quality',
            date: new Date().toISOString()
          },
          highlights: [`${poorQualityLoans.length} loans with poor data quality`],
          actions: [
            {
              label: 'View Affected Loans',
              action: () => {
                console.log('Show poor quality loans:', poorQualityLoans.map(l => l.loan_id));
              }
            },
            {
              label: 'Get Improvement Plan',
              action: async () => {
                const recommendations = await aiService.generateDataQualityRecommendations(poorQualityLoans);
                console.log('Data quality recommendations:', recommendations);
              }
            }
          ]
        });
      }
    }

    return results;
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'loan': return <FileText className="h-4 w-4" />;
      case 'calculation': return <Calculator className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'insight': return <Brain className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'text-green-600 bg-green-50';
    if (relevance >= 0.6) return 'text-blue-600 bg-blue-50';
    if (relevance >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Intelligent Search
            <Badge variant="secondary" className="ml-2">RAG-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search loans, insights, compliance issues..."
                className="pl-9"
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              />
            </div>
            <Button onClick={() => performSearch()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="border-dashed">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Content Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full mt-1 p-2 border rounded"
                    >
                      <option value="all">All Types</option>
                      <option value="loan">Loans</option>
                      <option value="insight">AI Insights</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full mt-1 p-2 border rounded"
                    >
                      <option value="all">All Time</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                      <option value="quarter">Past Quarter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Min Relevance</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={filters.relevanceThreshold}
                      onChange={(e) => setFilters(prev => ({ ...prev, relevanceThreshold: parseFloat(e.target.value) }))}
                      className="w-full mt-1"
                    />
                    <div className="text-xs text-muted-foreground">
                      {(filters.relevanceThreshold * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      id="includeAI"
                      checked={filters.includeAI}
                      onChange={(e) => setFilters(prev => ({ ...prev, includeAI: e.target.checked }))}
                    />
                    <label htmlFor="includeAI" className="text-sm">Include AI Analysis</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Searches</h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(search);
                      performSearch(search);
                    }}
                    className="text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {!loading && results.length === 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Search Suggestions</h4>
              <div className="grid gap-2">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                    setQuery(suggestion.query);
                    performSearch(suggestion.query);
                  }}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{suggestion.query}</div>
                          <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search Results ({results.length})</CardTitle>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort by Relevance
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-primary/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getResultIcon(result.type)}
                          <h4 className="font-medium">{result.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getRelevanceColor(result.relevance)}`}>
                            {(result.relevance * 100).toFixed(0)}% match
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{result.content}</p>
                      
                      {result.highlights.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium mb-1">Highlights:</div>
                          <div className="flex flex-wrap gap-1">
                            {result.highlights.map((highlight, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Source: {result.source}
                          {result.metadata.date && (
                            <> • {new Date(result.metadata.date).toLocaleDateString()}</>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {result.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={action.action}
                              className="text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Searching with AI...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}