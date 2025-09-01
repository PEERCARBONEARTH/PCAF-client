import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageCircle,
  Brain,
  BookOpen,
  Shield,
  Calculator,
  TrendingUp,
  Lightbulb,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Zap,
  Database
} from 'lucide-react';
import { RAGChatbot } from '@/components/rag/RAGChatbot';
import { PortfolioRAGDemo } from '@/components/rag/PortfolioRAGDemo';
import { ConfidenceMonitor } from '@/components/rag/ConfidenceMonitor';
import { DatasetManager } from '@/components/rag/DatasetManager';

export default function RAGChatPage() {
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    document.title = 'AI Chat Assistant — Financed Emissions';
  }, []);

  const chatTypes = [
    {
      id: 'general',
      title: 'General Assistant',
      description: 'Motor vehicle PCAF methodology, calculations, and best practices',
      icon: MessageCircle,
      color: 'bg-blue-500',
      examples: [
        'How can I improve my portfolio data quality?',
        'What are the PCAF data quality options?',
        'How do I calculate attribution factors?'
      ]
    },
    {
      id: 'methodology',
      title: 'Methodology Expert',
      description: 'PCAF motor vehicle standards, calculation methods, and technical guidance',
      icon: BookOpen,
      color: 'bg-green-500',
      examples: [
        'What are PCAF Options 1-5 for motor vehicles?',
        'How to move from Option 5 to Option 4?',
        'What data do I need for Option 3?'
      ]
    },
    {
      id: 'portfolio_analysis',
      title: 'Portfolio Analyst',
      description: 'Analyze motor vehicle portfolio data and get specific recommendations',
      icon: TrendingUp,
      color: 'bg-purple-500',
      examples: [
        'Analyze my motor vehicle portfolio data quality',
        'Which loans need data improvements?',
        'How do I prioritize data collection?'
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance Advisor',
      description: 'Motor vehicle PCAF compliance, reporting, and regulatory requirements',
      icon: Shield,
      color: 'bg-red-500',
      examples: [
        'What PCAF score do I need for compliance?',
        'How to calculate weighted data quality score?',
        'What are motor vehicle reporting requirements?'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Upload Documents',
      description: 'Add new documents to the knowledge base',
      icon: FileText,
      action: () => window.location.href = '/financed-emissions/rag-management?tab=upload'
    },
    {
      title: 'Search Knowledge Base',
      description: 'Search across all uploaded documents',
      icon: Lightbulb,
      action: () => window.location.href = '/financed-emissions/rag-management?tab=search'
    },
    {
      title: 'Manage Collections',
      description: 'View and organize document collections',
      icon: Settings,
      action: () => window.location.href = '/financed-emissions/rag-management?tab=collections'
    }
  ];

  const currentChatType = chatTypes.find(type => type.id === activeTab);

  return (
    <main className="space-y-6">
      {/* Header */}
      <Card className="card-featured animate-slide-up border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 animate-float">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">PCAF AI Chat Assistant</CardTitle>
                <CardDescription>
                  Get instant answers about PCAF methodology, calculations, and compliance using AI-powered knowledge retrieval
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              {chatTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{type.title.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
              <TabsTrigger value="monitor" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="dataset" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Dataset</span>
              </TabsTrigger>
            </TabsList>

            {chatTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TabsContent key={type.id} value={type.id} className="space-y-4">
                  {/* Chat Type Header */}
                  <Card className="card-editorial">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type.color.replace('bg-', 'bg-')}/10`}>
                          <Icon className={`w-5 h-5 ${type.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{type.title}</CardTitle>
                          <CardDescription>{type.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Chat Interface */}
                  <Card className="card-editorial">
                    <CardContent className="p-0">
                      <RAGChatbot
                        defaultSessionType={type.id as any}
                        className="h-[600px]"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}

            {/* Confidence Monitor Tab */}
            <TabsContent value="monitor" className="space-y-4">
              <Card className="card-editorial">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">System Performance Monitor</CardTitle>
                      <CardDescription>Real-time confidence and accuracy metrics for surgical RAG responses</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <ConfidenceMonitor />
            </TabsContent>

            {/* Dataset Management Tab */}
            <TabsContent value="dataset" className="space-y-4">
              <Card className="card-editorial">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Q&A Dataset Management</CardTitle>
                      <CardDescription>Monitor and test the comprehensive motor vehicle PCAF question-answer dataset</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <DatasetManager />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Example Questions */}
          {currentChatType && (
            <Card className="card-editorial animate-scale-in">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Example Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentChatType.examples.map((example, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors text-sm border border-transparent hover:border-primary/20"
                    onClick={() => {
                      // This would trigger sending the example question
                      // Implementation depends on how you want to handle this
                    }}
                  >
                    "{example}"
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="card-editorial animate-scale-in">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={action.action}
                >
                  <div className="flex items-start gap-3">
                    <action.icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="card-editorial animate-scale-in">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Real-time responses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Source attribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Confidence scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span>Follow-up suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Context awareness</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contextual RAG Demo */}
          <Card className="card-editorial animate-scale-in">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioRAGDemo />
            </CardContent>
          </Card>

          {/* Usage Tips */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tips:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Ask about "my portfolio" for personalized insights</li>
                <li>• Be specific in your questions</li>
                <li>• Ask for examples or calculations</li>
                <li>• Use follow-up questions for clarity</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </main>
  );
}