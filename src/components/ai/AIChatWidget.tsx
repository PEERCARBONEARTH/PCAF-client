import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiService, type ChatMessage } from "@/services/aiService";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Lightbulb,
  HelpCircle,
  Calculator,
  Shield,
  FileText,
  Loader2,
  Sparkles
} from "lucide-react";

interface AIChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultOpen?: boolean;
  contextualHelp?: {
    page?: string;
    section?: string;
    data?: any;
  };
}

interface QuickAction {
  label: string;
  query: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

export function AIChatWidget({ 
  position = 'bottom-right', 
  defaultOpen = false,
  contextualHelp 
}: AIChatWidgetProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<'advisory' | 'calculation' | 'compliance' | 'reporting'>('advisory');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Agent-specific quick actions
  const getQuickActionsForAgent = (agentId: string): QuickAction[] => {
    switch (agentId) {
      case 'calculation':
        return [
          {
            label: "Explain PCAF methodology",
            query: "Can you explain the PCAF calculation methodology for motor vehicle loans, including attribution factors and emission factors?",
            icon: Calculator,
            category: "Methodology"
          },
          {
            label: "Validate calculation",
            query: "Can you validate the emissions calculation for a specific loan and explain each step?",
            icon: Calculator,
            category: "Validation"
          },
          {
            label: "Data quality impact",
            query: "How does data quality affect PCAF calculations and what are the different data quality options?",
            icon: Calculator,
            category: "Data Quality"
          },
          {
            label: "Amortization schedule",
            query: "How do amortization schedules affect attribution factors over time?",
            icon: Calculator,
            category: "Attribution"
          }
        ];
      
      case 'compliance':
        return [
          {
            label: "PCAF compliance check",
            query: "What are the current PCAF compliance requirements and how does my portfolio measure up?",
            icon: Shield,
            category: "Standards"
          },
          {
            label: "Regulatory updates",
            query: "Are there any recent regulatory changes or upcoming requirements I should be aware of?",
            icon: Shield,
            category: "Regulations"
          },
          {
            label: "Data quality standards",
            query: "What are the PCAF data quality standards and how can I improve my scores?",
            icon: Shield,
            category: "Quality"
          },
          {
            label: "Audit preparation",
            query: "How should I prepare for a PCAF compliance audit and what documentation is needed?",
            icon: Shield,
            category: "Audit"
          }
        ];
      
      case 'reporting':
        return [
          {
            label: "Generate report summary",
            query: "Can you generate a comprehensive emissions report summary for my portfolio?",
            icon: FileText,
            category: "Summary"
          },
          {
            label: "Disclosure requirements",
            query: "What are the key disclosure requirements for financed emissions reporting?",
            icon: FileText,
            category: "Disclosure"
          },
          {
            label: "Report templates",
            query: "What report formats and templates are recommended for PCAF reporting?",
            icon: FileText,
            category: "Templates"
          },
          {
            label: "Stakeholder communication",
            query: "How should I communicate emissions results to different stakeholders?",
            icon: FileText,
            category: "Communication"
          }
        ];
      
      case 'advisory':
      default:
        return [
          {
            label: "Portfolio insights",
            query: "What strategic insights can you provide about my motor vehicle loan portfolio's emissions performance?",
            icon: Lightbulb,
            category: "Strategy"
          },
          {
            label: "Risk assessment",
            query: "What are the key climate risks in my portfolio and how should I address them?",
            icon: Lightbulb,
            category: "Risk"
          },
          {
            label: "Improvement opportunities",
            query: "What are the best opportunities to reduce my portfolio's emission intensity?",
            icon: Lightbulb,
            category: "Optimization"
          },
          {
            label: "Best practices",
            query: "What are the industry best practices for financed emissions management?",
            icon: Lightbulb,
            category: "Best Practices"
          }
        ];
    }
  };

  const agents = [
    { 
      id: 'advisory', 
      name: 'Advisory', 
      icon: Lightbulb, 
      color: 'text-blue-600',
      description: 'Strategic insights and recommendations',
      specialties: ['Portfolio strategy', 'Risk assessment', 'Best practices', 'Optimization']
    },
    { 
      id: 'calculation', 
      name: 'Calculation', 
      icon: Calculator, 
      color: 'text-green-600',
      description: 'PCAF methodology and emissions calculations',
      specialties: ['PCAF calculations', 'Attribution factors', 'Data quality', 'Validation']
    },
    { 
      id: 'compliance', 
      name: 'Compliance', 
      icon: Shield, 
      color: 'text-purple-600',
      description: 'Regulatory compliance and standards',
      specialties: ['PCAF standards', 'Regulations', 'Audit prep', 'Quality assurance']
    },
    { 
      id: 'reporting', 
      name: 'Reporting', 
      icon: FileText, 
      color: 'text-orange-600',
      description: 'Report generation and disclosure',
      specialties: ['Report generation', 'Disclosures', 'Templates', 'Communication']
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && contextualHelp) {
      initializeWithContext();
    }
  }, [isOpen, contextualHelp]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeWithContext = async () => {
    if (!contextualHelp || messages.length > 0) return;

    const currentAgent = agents.find(a => a.id === selectedAgent);
    let contextualMessage = `Hi! I'm the ${currentAgent?.name} Agent. ${currentAgent?.description}.\n\n`;
    
    if (contextualHelp.page) {
      contextualMessage += `I see you're on the ${contextualHelp.page} page. `;
    }
    
    if (contextualHelp.section) {
      contextualMessage += `I can help you with ${contextualHelp.section}. `;
    }
    
    contextualMessage += `\nMy specialties include:\n${currentAgent?.specialties.map(s => `• ${s}`).join('\n')}\n\nWhat would you like to know?`;

    const welcomeMessage: ChatMessage = {
      id: `welcome_${Date.now()}`,
      role: 'assistant',
      content: contextualMessage,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    setInputMessage("");
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await aiService.chatWithAI(
        textToSend,
        selectedAgent,
        contextualHelp?.data
      );

      // Get updated chat history
      const updatedHistory = aiService.getChatHistory();
      setMessages(updatedHistory);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response from AI assistant.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.query);
  };

  const switchAgent = (newAgentId: string) => {
    setSelectedAgent(newAgentId as any);
    setShowQuickActions(true);
    
    // Add a message about switching agents
    const switchMessage: ChatMessage = {
      id: `switch_${Date.now()}`,
      role: 'assistant',
      content: `I've switched to the ${agents.find(a => a.id === newAgentId)?.name} Agent. How can I help you with ${agents.find(a => a.id === newAgentId)?.description.toLowerCase()}?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  const clearChat = () => {
    setMessages([]);
    aiService.clearChatHistory();
    setShowQuickActions(true);
    if (contextualHelp) {
      initializeWithContext();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getAgentIcon = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.icon || Bot;
  };

  const getAgentColor = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.color || 'text-primary';
  };

  if (!isOpen) {
    return (
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <Card className={`w-96 shadow-xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}>
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">AI Assistant</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {agents.find(a => a.id === selectedAgent)?.name} Agent
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <div className="flex gap-1 mt-2">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <Button
                    key={agent.id}
                    variant={selectedAgent === agent.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchAgent(agent.id)}
                    className="h-6 px-2 text-xs"
                    title={agent.description}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {agent.name}
                  </Button>
                );
              })}
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-3 max-h-[300px]">
              {messages.length === 0 && showQuickActions ? (
                <div className="space-y-3">
                  <div className="text-center text-sm text-muted-foreground">
                    {(() => {
                      const currentAgent = agents.find(a => a.id === selectedAgent);
                      const Icon = currentAgent?.icon || Bot;
                      return (
                        <div>
                          <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center ${currentAgent?.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="font-medium">{currentAgent?.name} Agent</p>
                          <p className="text-xs">{currentAgent?.description}</p>
                          <p className="text-xs mt-1">Choose a quick action or ask me anything:</p>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="grid gap-2">
                    {getQuickActionsForAgent(selectedAgent).slice(0, 4).map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="justify-start text-xs h-auto py-2 px-3"
                        >
                          <Icon className="h-3 w-3 mr-2" />
                          <div className="text-left">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs text-muted-foreground">{action.category}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  
                  {/* Agent Specialties */}
                  <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                    <div className="font-medium mb-1">My specialties:</div>
                    <div className="flex flex-wrap gap-1">
                      {agents.find(a => a.id === selectedAgent)?.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ${getAgentColor(selectedAgent)}`}>
                          {(() => {
                            const Icon = getAgentIcon(selectedAgent);
                            return <Icon className="h-3 w-3" />;
                          })()}
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-sm p-2 text-xs ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center ${getAgentColor(selectedAgent)}`}>
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                      <div className="bg-muted rounded-sm p-2 text-xs">
                        <p className="text-muted-foreground">AI is thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="h-8 w-8"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              {messages.length > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-xs h-6"
                  >
                    Clear Chat
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {messages.length} messages
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}