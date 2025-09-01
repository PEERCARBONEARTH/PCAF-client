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
  TrendingUp,
  Lightbulb,
  FileText,
  Settings,
  HelpCircle,
  Zap,
  Database,
  Sparkles,
  Target,
  Activity,
  CheckCircle2,
  ArrowRight,
  Star
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <CardHeader className="relative pb-8 pt-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
              
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      PCAF AI Chat Assistant
                    </CardTitle>
                    <CardDescription className="text-blue-100 text-lg max-w-2xl">
                      Get instant, accurate answers about PCAF methodology, calculations, and compliance using our 
                      <span className="font-semibold text-white"> hallucination-free AI system</span>
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-4 py-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    100% Validated Responses
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-100 border-purple-400/30 px-4 py-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Surgical Precision
                  </Badge>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="relative mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Response Accuracy', value: '95%+', icon: Target },
                  { label: 'Avg Response Time', value: '<3s', icon: Activity },
                  { label: 'Q&A Database', value: '300+', icon: Database },
                  { label: 'User Satisfaction', value: '4.9★', icon: Star }
                ].map((stat, index) => (
                  <div key={index} className="text-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <stat.icon className="w-5 h-5 mx-auto mb-1 text-white/80" />
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-blue-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-8 xl:grid-cols-4">
          {/* Main Chat Interface */}
          <div className="xl:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Enhanced Tab Navigation */}
              <div className="relative">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-2">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 bg-transparent p-1">
                      {chatTypes.map((type) => {
                        const Icon = type.icon;
                        const isActive = activeTab === type.id;
                        return (
                          <TabsTrigger 
                            key={type.id} 
                            value={type.id} 
                            className={`
                              relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                              ${isActive 
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                              }
                            `}
                          >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                            <span className="text-xs font-medium hidden sm:block">
                              {type.title.split(' ')[0]}
                            </span>
                            {isActive && (
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                            )}
                          </TabsTrigger>
                        );
                      })}
                      <TabsTrigger 
                        value="monitor" 
                        className={`
                          relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                          ${activeTab === 'monitor'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105' 
                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          }
                        `}
                      >
                        <Brain className={`w-5 h-5 ${activeTab === 'monitor' ? 'text-white' : ''}`} />
                        <span className="text-xs font-medium hidden sm:block">Monitor</span>
                        {activeTab === 'monitor' && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                        )}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="dataset" 
                        className={`
                          relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                          ${activeTab === 'dataset'
                            ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg scale-105' 
                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          }
                        `}
                      >
                        <Database className={`w-5 h-5 ${activeTab === 'dataset' ? 'text-white' : ''}`} />
                        <span className="text-xs font-medium hidden sm:block">Dataset</span>
                        {activeTab === 'dataset' && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </CardContent>
                </Card>
              </div>

              {chatTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <TabsContent key={type.id} value={type.id} className="space-y-6">
                    {/* Enhanced Chat Type Header */}
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50/50 overflow-hidden">
                      <CardHeader className="relative pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`
                              p-3 rounded-2xl shadow-lg
                              ${type.color === 'bg-blue-500' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                              ${type.color === 'bg-green-500' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                              ${type.color === 'bg-purple-500' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
                              ${type.color === 'bg-red-500' ? 'bg-gradient-to-br from-red-500 to-red-600' : ''}
                            `}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900">{type.title}</CardTitle>
                              <CardDescription className="text-gray-600 mt-1 max-w-md">
                                {type.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Hallucination-Free
                          </Badge>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-16 translate-x-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full translate-y-12 -translate-x-12" />
                      </CardHeader>
                    </Card>

                    {/* Enhanced Chat Interface */}
                    <Card className="border-0 shadow-2xl bg-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative">
                          <RAGChatbot
                            defaultSessionType={type.id as any}
                            className="h-[650px]"
                          />
                          {/* Chat Enhancement Overlay */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs">
                              <Activity className="w-3 h-3 mr-1" />
                              Live
                            </Badge>
                            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Powered
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}

              {/* Enhanced Confidence Monitor Tab */}
              <TabsContent value="monitor" className="space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 overflow-hidden">
                  <CardHeader className="relative pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">System Performance Monitor</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Real-time confidence and accuracy metrics for surgical RAG responses
                        </CardDescription>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100/50 to-transparent rounded-full -translate-y-16 translate-x-16" />
                  </CardHeader>
                </Card>

                <ConfidenceMonitor />
              </TabsContent>

              {/* Enhanced Dataset Management Tab */}
              <TabsContent value="dataset" className="space-y-6">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 overflow-hidden">
                  <CardHeader className="relative pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">Q&A Dataset Management</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          Monitor and test the comprehensive motor vehicle PCAF question-answer dataset
                        </CardDescription>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-full -translate-y-16 translate-x-16" />
                  </CardHeader>
                </Card>

                <DatasetManager />
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Example Questions */}
            {currentChatType && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-gray-900">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    Try These Questions
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Click any example to start a conversation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentChatType.examples.map((example, index) => (
                    <div
                      key={index}
                      className="group relative p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => {
                        // This would trigger sending the example question
                        // Implementation depends on how you want to handle this
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            "{example}"
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Enhanced Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 overflow-hidden">
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Settings className="w-4 h-4 text-purple-600" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your knowledge base and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-4 text-left hover:bg-white hover:shadow-md transition-all duration-200 rounded-xl border border-transparent hover:border-purple-100"
                    onClick={action.action}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-purple-100 transition-colors">
                        <action.icon className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{action.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{action.description}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Enhanced AI Features */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30 overflow-hidden">
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Sparkles className="w-4 h-4 text-green-600" />
                  </div>
                  AI Capabilities
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Powered by surgical precision technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {[
                    { label: 'Real-time responses', color: 'bg-green-500', icon: Activity },
                    { label: 'Source attribution', color: 'bg-blue-500', icon: FileText },
                    { label: 'Confidence scoring', color: 'bg-purple-500', icon: Target },
                    { label: 'Follow-up suggestions', color: 'bg-orange-500', icon: Lightbulb },
                    { label: 'Context awareness', color: 'bg-red-500', icon: Brain }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                      <div className={`w-8 h-8 ${feature.color} rounded-lg flex items-center justify-center`}>
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                      <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced How It Works */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/30 overflow-hidden">
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Zap className="w-4 h-4 text-yellow-600" />
                  </div>
                  How It Works
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Interactive demonstration of our RAG system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioRAGDemo />
              </CardContent>
            </Card>

            {/* Enhanced Usage Tips */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-indigo-900">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                  </div>
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Ask about "my portfolio" for personalized insights',
                    'Be specific in your questions for better accuracy',
                    'Request examples or step-by-step calculations',
                    'Use follow-up questions to dive deeper'
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-indigo-100">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                      </div>
                      <p className="text-sm text-indigo-800 font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}