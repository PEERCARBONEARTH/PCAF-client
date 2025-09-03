import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Bot,
  User,
  BarChart3,
  Calculator,
  Shield,
  TrendingUp,
  Clock,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Zap,
  FileText,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    content: string;
    relevance: number;
  }>;
  followUpQuestions?: string[];
  confidence?: number;
}

export default function AICoPilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get portfolio context if query suggests it's needed
      let portfolioContext = null;

      // Use ChromaDB RAG service for enhanced knowledge base search
      try {
        const needsPortfolio = userMessage.content.toLowerCase().includes('my') ||
          userMessage.content.toLowerCase().includes('portfolio') ||
          userMessage.content.toLowerCase().includes('current');

        if (needsPortfolio) {
          try {
            const { portfolioService } = await import('@/services/portfolioService');
            const { loans } = await portfolioService.getPortfolioSummary();

            // Analyze portfolio for contextual responses
            const motorVehicleLoans = loans.filter((loan: any) =>
              loan.asset_class === 'motor_vehicle' || loan.vehicle_details || !loan.asset_class
            );

            if (motorVehicleLoans.length > 0) {
              const dataQualityAnalysis = {
                averageScore: motorVehicleLoans.reduce((sum, loan) =>
                  sum + (loan.emissions_data?.data_quality_score || 5), 0) / motorVehicleLoans.length,
                distribution: motorVehicleLoans.reduce((acc, loan) => {
                  const score = loan.emissions_data?.data_quality_score || 5;
                  acc[score] = (acc[score] || 0) + 1;
                  return acc;
                }, {} as Record<number, number>),
                loansNeedingImprovement: motorVehicleLoans.filter(l =>
                  (l.emissions_data?.data_quality_score || 5) >= 4).length,
                complianceStatus: 'compliant'
              };

              dataQualityAnalysis.complianceStatus =
                dataQualityAnalysis.averageScore <= 3.0 ? 'compliant' : 'needs_improvement';

              portfolioContext = {
                totalLoans: motorVehicleLoans.length,
                dataQuality: dataQualityAnalysis,
                improvements: {
                  option_5_to_4: motorVehicleLoans.filter(l =>
                    (l.emissions_data?.data_quality_score || 5) === 5).map(l => l.loan_id),
                  option_4_to_3: motorVehicleLoans.filter(l =>
                    (l.emissions_data?.data_quality_score || 5) === 4).map(l => l.loan_id)
                }
              };
            }
          } catch (portfolioError) {
            console.warn('Could not load portfolio context:', portfolioError);
          }
        }

        // Call ChromaDB RAG API on main PCAF-server
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        const ragResponse = await fetch(`${apiUrl}/api/chroma/rag-query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: userMessage.content,
            portfolioContext: portfolioContext
          })
        });

        if (!ragResponse.ok) {
          throw new Error(`RAG API error: ${ragResponse.status}`);
        }

        const ragData = await ragResponse.json();

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: ragData.response,
          timestamp: new Date(),
          sources: ragData.sources?.map((source: string) => ({
            title: source,
            content: `Reference from ${source}`,
            relevance: ragData.confidence === 'high' ? 0.95 :
              ragData.confidence === 'medium' ? 0.8 : 0.6
          })) || [],
          confidence: ragData.confidence === 'high' ? 0.95 :
            ragData.confidence === 'medium' ? 0.8 : 0.6,
          followUpQuestions: ragData.followUpQuestions || []
        };

        setMessages(prev => [...prev, assistantMessage]);
        return;
      } catch (chromaError) {
        console.warn('ChromaDB RAG failed, falling back to AI service:', chromaError);
      }

      // Fallback to OpenAI service for real AI responses
      const { openaiService } = await import('@/services/openaiService');

      if (openaiService.isConfigured()) {
        // Use real OpenAI API
        const conversationHistory = messages.slice(-6).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

        const openaiResponse = await openaiService.generatePCAFResponse(
          userMessage.content,
          conversationHistory,
          portfolioContext
        );

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: openaiResponse.response,
          timestamp: new Date(),
          sources: openaiResponse.sources.map((source: string) => ({
            title: source,
            content: `Reference from ${source}`,
            relevance: 0.9
          })),
          confidence: openaiResponse.confidence,
          followUpQuestions: openaiResponse.followUpQuestions
        };

        setMessages(prev => [...prev, assistantMessage]);
        return;
      } else {
        // Fallback to static responses if OpenAI not configured
        const { aiChatService } = await import('@/services/aiService');

        const fallbackResponse = await aiChatService.processMessage({
          sessionId: 'default',
          message: userMessage.content,
          context: { type: 'advisory' }
        });

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: fallbackResponse.response || 'I apologize, but I couldn\'t generate a response. Please try again.',
          timestamp: new Date(),
          sources: fallbackResponse.sources?.map((source: string) => ({
            title: source,
            content: `Reference from ${source}`,
            relevance: 0.8
          })) || [],
          confidence: fallbackResponse.confidence === 'high' ? 0.9 :
            fallbackResponse.confidence === 'medium' ? 0.7 : 0.5,
          followUpQuestions: fallbackResponse.followUpSuggestions || []
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response from AI Co-Pilot. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedPrompts = [
    {
      icon: Calculator,
      title: 'PCAF Methodology',
      prompt: 'Explain the PCAF methodology for calculating financed emissions',
      category: 'methodology'
    },
    {
      icon: BarChart3,
      title: 'Portfolio Analysis',
      prompt: 'Analyze my current portfolio for emission reduction opportunities',
      category: 'analysis'
    },
    {
      icon: Shield,
      title: 'Compliance Check',
      prompt: 'What are the key PCAF compliance requirements I need to meet?',
      category: 'compliance'
    },
    {
      icon: TrendingUp,
      title: 'Data Quality',
      prompt: 'How can I improve my portfolio data quality score?',
      category: 'quality'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* KIMI-style Header */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">PCAF COPILOT</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          AI-powered assistant for PCAF methodology guidance, portfolio analysis, emissions calculations, 
          and regulatory compliance. Get expert insights on financed emissions, data quality assessment, 
          and climate risk management.
        </p>
        
        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1" />
            {import.meta.env.VITE_OPENAI_API_KEY ? 'OpenAI GPT-4 + ChromaDB' : 'Static Responses'}
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4">
        <ScrollArea className="h-[60vh] mb-6">
          <div className="space-y-6">
            {messages.length === 0 ? (
              /* Suggested Prompts - KIMI Style */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {suggestedPrompts.map((prompt, index) => (
                  <div
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] bg-card border border-border rounded-xl p-5 hover:bg-muted/30 group"
                    onClick={() => setInputMessage(prompt.prompt)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <prompt.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground">{prompt.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground text-left leading-relaxed">
                      {prompt.prompt}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-primary">
                      <span>Click to ask</span>
                      <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Chat Messages */
              messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl p-4 ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted'
                      }`}>
                      <div className="prose prose-sm max-w-none">
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className={message.role === 'user' ? 'text-primary-foreground' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {message.timestamp.toLocaleTimeString()}

                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {message.confidence && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </Badge>
                      </div>
                    )}

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Sources ({message.sources.length})
                        </h5>
                        <div className="space-y-1">
                          {message.sources.slice(0, 3).map((source, i) => (
                            <div key={i} className="text-xs p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium truncate">{source.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(source.relevance * 100)}%
                                </Badge>
                              </div>
                              <p className="text-muted-foreground line-clamp-2">
                                {source.content.substring(0, 100)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Suggested questions
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message.followUpQuestions.map((question, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-auto py-1 px-2 transition-all duration-200 hover:bg-primary/10"
                              onClick={() => setInputMessage(question)}
                              title={`Ask: ${question}`}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* KIMI-style Input Area */}
      <div className="max-w-4xl mx-auto w-full px-4 pb-8">
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything..."
            className="pr-12 h-12 text-base rounded-xl border-2 focus:border-primary/50"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 p-0 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Press Enter to send</span>
            <Badge variant="outline" className="text-xs">
              PCAF Compliant
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}