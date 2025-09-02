/**
 * Narrative Insights Dashboard
 * Real-time dashboard showing AI-generated narrative insights integrated with data pipeline
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Settings, 
  Filter,
  Search,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  Loader2,
  Sparkles
} from 'lucide-react';
import { NarrativeInsightCard } from './NarrativeInsightCard';
import { narrativePipelineIntegration, NarrativeInsightCard as InsightType, BankProfile } from '@/services/narrative-pipeline-integration';
import { pipelineIntegrationService } from '@/services/pipeline-integration-service';
import { toast } from '@/hooks/use-toast';

interface NarrativeInsightsDashboardProps {
  className?: string;
}

export const NarrativeInsightsDashboard: React.FC<NarrativeInsightsDashboardProps> = ({
  className
}) => {
  const [insights, setInsights] = useState<InsightType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [bankProfile, setBankProfile] = useState<BankProfile | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadInsights();
    loadBankProfile();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const narrativeInsights = await narrativePipelineIntegration.generateNarrativeInsights();
      setInsights(narrativeInsights);
      
      if (narrativeInsights.length > 0) {
        toast({
          title: "Insights Updated",
          description: `Generated ${narrativeInsights.length} AI-powered insights with personalized narratives`,
        });
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
      toast({
        title: "Failed to Load Insights",
        description: "Unable to generate narrative insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBankProfile = () => {
    // Load or set default bank profile
    const defaultProfile: BankProfile = {
      bankType: 'community',
      portfolioSize: 247,
      primaryMarket: 'Regional',
      experienceLevel: 'intermediate',
      businessGoals: ['growth', 'compliance', 'sustainability'],
      currentChallenges: ['data quality', 'regulatory compliance', 'market competition'],
      preferredTone: 'conversational'
    };
    
    setBankProfile(defaultProfile);
    narrativePipelineIntegration.setBankProfile(defaultProfile);
  };

  const handleRefreshInsights = async () => {
    await loadInsights();
  };

  const handleActionClick = async (action: string) => {
    console.log('Action clicked:', action);
    
    // Handle different actions
    switch (action) {
      case 'launch_ev_program':
        toast({
          title: "EV Program Launch",
          description: "Initiating EV incentive program setup...",
        });
        break;
      case 'improve_compliance':
        toast({
          title: "Compliance Improvement",
          description: "Starting PCAF compliance enhancement process...",
        });
        break;
      case 'market_analysis':
        toast({
          title: "Market Analysis",
          description: "Generating detailed market opportunity analysis...",
        });
        break;
      default:
        toast({
          title: "Action Initiated",
          description: `Processing ${action.replace(/_/g, ' ')}...`,
        });
    }
  };

  const handleDrillDown = async (query: string) => {
    try {
      const searchResults = await pipelineIntegrationService.searchDocuments(query, {
        limit: 5
      });
      
      console.log('Drill down results:', searchResults);
      
      toast({
        title: "Search Results",
        description: `Found ${searchResults.length} relevant documents for "${query}"`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to search documents. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateBankProfile = (updates: Partial<BankProfile>) => {
    if (bankProfile) {
      const updatedProfile = { ...bankProfile, ...updates };
      setBankProfile(updatedProfile);
      narrativePipelineIntegration.setBankProfile(updatedProfile);
      
      // Refresh insights with new profile
      loadInsights();
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = searchQuery === '' || 
      insight.narrative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.narrative.executiveSummary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || insight.type === filterType;
    const matchesPriority = filterPriority === 'all' || insight.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'portfolio_optimization':
        return <TrendingUp className="h-4 w-4" />;
      case 'risk_analysis':
        return <AlertTriangle className="h-4 w-4" />;
      case 'compliance_assessment':
        return <CheckCircle className="h-4 w-4" />;
      case 'market_opportunity':
        return <Target className="h-4 w-4" />;
      case 'customer_insights':
        return <Users className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getInsightCounts = () => {
    return {
      total: insights.length,
      high: insights.filter(i => i.priority === 'high').length,
      medium: insights.filter(i => i.priority === 'medium').length,
      low: insights.filter(i => i.priority === 'low').length
    };
  };

  const counts = getInsightCounts();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Narrative Insights
          </h2>
          <p className="text-muted-foreground">
            Humanized, actionable insights tailored for your bank
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={handleRefreshInsights}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Insights
          </Button>
        </div>
      </div>

      {/* Bank Profile Settings */}
      {showSettings && bankProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Profile Settings</CardTitle>
            <CardDescription>
              Customize your profile to get more personalized insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bank Type</label>
                <Select
                  value={bankProfile.bankType}
                  onValueChange={(value) => updateBankProfile({ bankType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="community">Community Bank</SelectItem>
                    <SelectItem value="regional">Regional Bank</SelectItem>
                    <SelectItem value="national">National Bank</SelectItem>
                    <SelectItem value="credit_union">Credit Union</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level</label>
                <Select
                  value={bankProfile.experienceLevel}
                  onValueChange={(value) => updateBankProfile({ experienceLevel: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Preferred Tone</label>
                <Select
                  value={bankProfile.preferredTone}
                  onValueChange={(value) => updateBankProfile({ preferredTone: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{counts.total}</div>
                <div className="text-sm text-muted-foreground">Total Insights</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{counts.high}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{counts.medium}</div>
                <div className="text-sm text-muted-foreground">Medium Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{counts.low}</div>
                <div className="text-sm text-muted-foreground">Low Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="portfolio_optimization">Portfolio Optimization</SelectItem>
                  <SelectItem value="risk_analysis">Risk Analysis</SelectItem>
                  <SelectItem value="compliance_assessment">Compliance</SelectItem>
                  <SelectItem value="market_opportunity">Market Opportunity</SelectItem>
                  <SelectItem value="customer_insights">Customer Insights</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Generating AI narrative insights...</p>
          </div>
        </div>
      ) : filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInsights.map((insight) => (
            <NarrativeInsightCard
              key={insight.id}
              insight={insight}
              onActionClick={handleActionClick}
              onDrillDown={handleDrillDown}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterType !== 'all' || filterPriority !== 'all'
                ? 'No insights match your current filters.'
                : 'Load sample data to generate AI-powered narrative insights.'}
            </p>
            <Button onClick={handleRefreshInsights}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                AI-Powered Narrative Insights
              </h4>
              <p className="text-sm text-blue-700">
                These insights are generated using AI to provide humanized, contextual explanations 
                tailored to your bank type and experience level. Each insight includes actionable 
                recommendations and business context to help you make informed decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NarrativeInsightsDashboard;