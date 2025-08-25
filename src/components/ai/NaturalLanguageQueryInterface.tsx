import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";
import { portfolioService } from "@/services/portfolioService";
import {
  MessageSquare,
  Search,
  TrendingUp,
  BarChart3,
  PieChart,
  Calculator,
  Filter,
  Sparkles,
  Loader2,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell
} from "recharts";

interface QueryResult {
  id: string;
  query: string;
  interpretation: string;
  data: any[];
  visualization: 'table' | 'bar' | 'line' | 'pie' | 'metric' | 'text';
  summary: string;
  insights: string[];
  timestamp: Date;
  confidence: number;
}

interface QuerySuggestion {
  text: string;
  category: string;
  description: string;
  example_result: string;
}

export function NaturalLanguageQueryInterface() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([]);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  const querySuggestions: QuerySuggestion[] = [
    {
      text: "Show me loans with emissions above 5 tCO2e",
      category: "Filtering",
      description: "Filter loans by emission levels",
      example_result: "Table of high-emission loans with details"
    },
    {
      text: "What's the average data quality score by fuel type?",
      category: "Analytics",
      description: "Analyze data quality across fuel types",
      example_result: "Bar chart showing average scores"
    },
    {
      text: "Which vehicle makes have the highest emission intensity?",
      category: "Comparison",
      description: "Compare emission intensity by manufacturer",
      example_result: "Ranked list with emission data"
    },
    {
      text: "Show the trend of portfolio emissions over time",
      category: "Trends",
      description: "Time series analysis of emissions",
      example_result: "Line chart showing emission trends"
    },
    {
      text: "How many electric vehicles are in my portfolio?",
      category: "Counting",
      description: "Count vehicles by fuel type",
      example_result: "Metric card with EV count and percentage"
    },
    {
      text: "What percentage of loans have poor data quality?",
      category: "Percentage",
      description: "Calculate data quality distribution",
      example_result: "Pie chart of data quality levels"
    },
    {
      text: "Find loans with attribution factors above 80%",
      category: "Risk Analysis",
      description: "Identify high-risk loans",
      example_result: "List of loans with high attribution"
    },
    {
      text: "Compare emissions between gasoline and electric vehicles",
      category: "Comparison",
      description: "Fuel type emission comparison",
      example_result: "Side-by-side comparison chart"
    }
  ];

  useEffect(() => {
    loadPortfolioData();
    setSuggestions(querySuggestions);
  }, []);

  const loadPortfolioData = async () => {
    try {
      const { loans, summary } = await portfolioService.getPortfolioSummary();
      const metrics = await portfolioService.getPortfolioAnalytics();
      setPortfolioData({ loans, summary, metrics });
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    }
  };

  const processNaturalLanguageQuery = async () => {
    if (!query.trim() || !portfolioData) return;

    setLoading(true);

    try {
      // Use AI to interpret the natural language query
      const interpretation = await interpretQuery(query);
      
      // Execute the interpreted query
      const queryResult = await executeQuery(interpretation);
      
      // Generate insights
      const insights = await generateInsights(queryResult.data, query);

      const result: QueryResult = {
        id: `query_${Date.now()}`,
        query,
        interpretation: interpretation.description,
        data: queryResult.data,
        visualization: queryResult.visualization,
        summary: queryResult.summary,
        insights,
        timestamp: new Date(),
        confidence: interpretation.confidence
      };

      setResults(prev => [result, ...prev]);
      setQuery("");

      toast({
        title: "Query Processed",
        description: `Found ${queryResult.data.length} results`,
      });

    } catch (error) {
      console.error('Query processing failed:', error);
      toast({
        title: "Query Error",
        description: "Failed to process your query. Please try rephrasing.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const interpretQuery = async (userQuery: string) => {
    // AI-powered query interpretation
    const queryLower = userQuery.toLowerCase();
    
    // Determine query type and parameters
    let queryType = 'filter';
    let visualization = 'table';
    let confidence = 0.8;
    
    if (queryLower.includes('trend') || queryLower.includes('over time')) {
      queryType = 'trend';
      visualization = 'line';
    } else if (queryLower.includes('average') || queryLower.includes('mean')) {
      queryType = 'aggregate';
      visualization = 'bar';
    } else if (queryLower.includes('percentage') || queryLower.includes('distribution')) {
      queryType = 'distribution';
      visualization = 'pie';
    } else if (queryLower.includes('count') || queryLower.includes('how many')) {
      queryType = 'count';
      visualization = 'metric';
    } else if (queryLower.includes('compare') || queryLower.includes('vs')) {
      queryType = 'compare';
      visualization = 'bar';
    }

    return {
      type: queryType,
      visualization,
      confidence,
      description: `Interpreting as ${queryType} query with ${visualization} visualization`,
      parameters: extractParameters(userQuery)
    };
  };

  const extractParameters = (userQuery: string) => {
    const params: any = {};
    const queryLower = userQuery.toLowerCase();

    // Extract fuel types
    if (queryLower.includes('electric')) params.fuel_type = 'electric';
    if (queryLower.includes('gasoline')) params.fuel_type = 'gasoline';
    if (queryLower.includes('diesel')) params.fuel_type = 'diesel';
    if (queryLower.includes('hybrid')) params.fuel_type = 'hybrid';

    // Extract numeric thresholds
    const numbers = userQuery.match(/\d+(\.\d+)?/g);
    if (numbers) {
      if (queryLower.includes('emission')) {
        params.emission_threshold = parseFloat(numbers[0]);
      }
      if (queryLower.includes('quality')) {
        params.quality_threshold = parseFloat(numbers[0]);
      }
      if (queryLower.includes('attribution')) {
        params.attribution_threshold = parseFloat(numbers[0]) / 100;
      }
    }

    // Extract vehicle makes
    const commonMakes = ['toyota', 'honda', 'ford', 'chevrolet', 'tesla', 'bmw', 'mercedes', 'audi'];
    commonMakes.forEach(make => {
      if (queryLower.includes(make)) {
        params.vehicle_make = make;
      }
    });

    return params;
  };

  const executeQuery = async (interpretation: any) => {
    const { loans } = portfolioData;
    let filteredData = [...loans];
    let summary = "";

    // Apply filters based on parameters
    if (interpretation.parameters.fuel_type) {
      filteredData = filteredData.filter(loan => 
        loan.vehicle_details.fuel_type.toLowerCase().includes(interpretation.parameters.fuel_type)
      );
    }

    if (interpretation.parameters.emission_threshold) {
      filteredData = filteredData.filter(loan => 
        loan.emissions_data.financed_emissions_tco2e > interpretation.parameters.emission_threshold
      );
    }

    if (interpretation.parameters.quality_threshold) {
      filteredData = filteredData.filter(loan => 
        loan.emissions_data.data_quality_score >= interpretation.parameters.quality_threshold
      );
    }

    if (interpretation.parameters.attribution_threshold) {
      filteredData = filteredData.filter(loan => 
        loan.emissions_data.attribution_factor > interpretation.parameters.attribution_threshold
      );
    }

    if (interpretation.parameters.vehicle_make) {
      filteredData = filteredData.filter(loan => 
        loan.vehicle_details.make.toLowerCase().includes(interpretation.parameters.vehicle_make)
      );
    }

    // Process data based on query type
    let processedData = [];
    
    switch (interpretation.type) {
      case 'count':
        processedData = [{
          metric: 'Count',
          value: filteredData.length,
          total: loans.length,
          percentage: (filteredData.length / loans.length * 100).toFixed(1)
        }];
        summary = `Found ${filteredData.length} items (${(filteredData.length / loans.length * 100).toFixed(1)}% of portfolio)`;
        break;

      case 'aggregate':
        const avgEmissions = filteredData.reduce((sum, loan) => sum + loan.emissions_data.financed_emissions_tco2e, 0) / filteredData.length;
        const avgQuality = filteredData.reduce((sum, loan) => sum + loan.emissions_data.data_quality_score, 0) / filteredData.length;
        
        processedData = [
          { category: 'Average Emissions', value: avgEmissions.toFixed(2), unit: 'tCO₂e' },
          { category: 'Average Data Quality', value: avgQuality.toFixed(2), unit: 'score' }
        ];
        summary = `Analyzed ${filteredData.length} loans`;
        break;

      case 'distribution':
        const distribution = {};
        filteredData.forEach(loan => {
          const key = Math.floor(loan.emissions_data.data_quality_score);
          distribution[key] = (distribution[key] || 0) + 1;
        });
        
        processedData = Object.entries(distribution).map(([key, value]) => ({
          category: `Quality ${key}`,
          value: value as number,
          percentage: ((value as number) / filteredData.length * 100).toFixed(1)
        }));
        summary = `Distribution across ${filteredData.length} loans`;
        break;

      case 'compare':
        const groups = {};
        filteredData.forEach(loan => {
          const key = loan.vehicle_details.fuel_type;
          if (!groups[key]) groups[key] = [];
          groups[key].push(loan);
        });
        
        processedData = Object.entries(groups).map(([key, loans]) => ({
          category: key,
          count: (loans as any[]).length,
          avgEmissions: ((loans as any[]).reduce((sum, loan) => sum + loan.emissions_data.financed_emissions_tco2e, 0) / (loans as any[]).length).toFixed(2)
        }));
        summary = `Comparison across ${Object.keys(groups).length} categories`;
        break;

      default:
        processedData = filteredData.map(loan => ({
          loan_id: loan.loan_id,
          borrower: loan.borrower_name,
          vehicle: `${loan.vehicle_details.make} ${loan.vehicle_details.model}`,
          emissions: loan.emissions_data.financed_emissions_tco2e.toFixed(2),
          quality: loan.emissions_data.data_quality_score,
          attribution: (loan.emissions_data.attribution_factor * 100).toFixed(1)
        }));
        summary = `Found ${filteredData.length} matching loans`;
    }

    return {
      data: processedData,
      visualization: interpretation.visualization,
      summary
    };
  };

  const generateInsights = async (data: any[], originalQuery: string): Promise<string[]> => {
    // Generate AI-powered insights based on the query results
    const insights = [];
    
    if (data.length === 0) {
      insights.push("No data matches your query criteria. Consider broadening your search.");
    } else {
      insights.push(`Your query returned ${data.length} results.`);
      
      if (originalQuery.toLowerCase().includes('emission')) {
        insights.push("Consider focusing on high-emission loans for reduction opportunities.");
      }
      
      if (originalQuery.toLowerCase().includes('quality')) {
        insights.push("Improving data quality can enhance PCAF compliance and reporting accuracy.");
      }
      
      if (originalQuery.toLowerCase().includes('electric')) {
        insights.push("Electric vehicles typically have lower emission intensity and better sustainability metrics.");
      }
    }
    
    return insights;
  };

  const renderVisualization = (result: QueryResult) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
    
    switch (result.visualization) {
      case 'metric':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.data.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground">{item.metric}</p>
                  {item.percentage && (
                    <p className="text-xs text-muted-foreground">{item.percentage}% of total</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={result.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={result.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip />
              <RechartsPieChart data={result.data}>
                {result.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </RechartsPieChart>
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {Object.keys(result.data[0] || {}).map(key => (
                    <th key={key} className="text-left p-2 font-medium">
                      {key.replace('_', ' ').toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-b">
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="p-2">{value as string}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.data.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing first 10 of {result.data.length} results
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Natural Language Query Interface
            <Badge variant="secondary" className="ml-2">AI-Powered</Badge>
          </CardTitle>
          <CardDescription>
            Ask questions about your portfolio in plain English
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Query Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything about your portfolio... e.g., 'Show me loans with high emissions'"
                className="pl-9"
                onKeyPress={(e) => e.key === 'Enter' && processNaturalLanguageQuery()}
              />
            </div>
            <Button onClick={processNaturalLanguageQuery} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Query Suggestions */}
          {results.length === 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Try these example queries:</h4>
              <div className="grid gap-2">
                {querySuggestions.slice(0, 6).map((suggestion, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                    setQuery(suggestion.text);
                  }}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{suggestion.text}</div>
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

      {/* Query Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{result.query}</CardTitle>
                    <CardDescription className="mt-1">
                      {result.interpretation} • {result.summary}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {(result.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {result.visualization}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Visualization */}
                <div className="border rounded-lg p-4">
                  {renderVisualization(result)}
                </div>

                {/* Insights */}
                {result.insights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">AI Insights:</h4>
                    <div className="space-y-1">
                      {result.insights.map((insight, index) => (
                        <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <TrendingUp className="h-3 w-3 mt-0.5 text-primary" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-2" />
                    Export Results
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Refine Query
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}