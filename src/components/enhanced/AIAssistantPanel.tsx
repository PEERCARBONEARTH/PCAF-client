import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { aiService, type ChatMessage } from "@/services/aiService";
import {
  Bot,
  Send,
  Brain,
  Calculator,
  Shield,
  FileText,
  Lightbulb,
  MessageSquare,
  Loader2
} from "lucide-react";

// Using ChatMessage from aiService

interface AIAssistantPanelProps {
  context?: any;
  defaultAgent?: 'calculation' | 'compliance' | 'reporting' | 'advisory';
  triggerQuery?: string;
  onQueryProcessed?: () => void;
}

export function AIAssistantPanel({ 
  context, 
  defaultAgent = 'advisory', 
  triggerQuery, 
  onQueryProcessed 
}: AIAssistantPanelProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<'calculation' | 'compliance' | 'reporting' | 'advisory'>(defaultAgent);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Auto-initialize with portfolio context
  React.useEffect(() => {
    if (context && !isInitialized) {
      initializeWithContext();
      setIsInitialized(true);
    }
  }, [context, isInitialized]);

  // Handle triggered queries
  React.useEffect(() => {
    if (triggerQuery && triggerQuery.trim()) {
      console.log('Received trigger query:', triggerQuery);
      sendMessage(triggerQuery);
      onQueryProcessed?.();
    }
  }, [triggerQuery]);

  const agents = [
    {
      type: 'calculation' as const,
      name: 'Calculation',
      icon: Calculator,
      description: 'PCAF methodology and emissions calculations',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    },
    {
      type: 'compliance' as const,
      name: 'Compliance',
      icon: Shield,
      description: 'Regulatory compliance and validation',
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    },
    {
      type: 'reporting' as const,
      name: 'Reporting',
      icon: FileText,
      description: 'Report generation and narratives',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    },
    {
      type: 'advisory' as const,
      name: 'Advisory',
      icon: Lightbulb,
      description: 'Strategic insights and recommendations',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
    }
  ];

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend.trim()) return;

    if (!customMessage) setInputMessage("");
    setIsLoading(true);

    try {
      const assistantMessage = await aiService.chatWithAI(
        messageToSend,
        selectedAgent,
        context
      );

      // Get updated chat history from the service
      const updatedHistory = aiService.getChatHistory();
      setMessages(updatedHistory);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Message Failed",
        description: "Failed to get response from AI agent.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWithContext = async () => {
    if (!context) return;

    setIsLoading(true);
    try {
      let contextSummary = "Please provide an overview of my portfolio and suggest areas where I can get the most value from our conversation.";
      
      const assistantMessage = await aiService.chatWithAI(
        contextSummary,
        selectedAgent,
        context
      );

      // Get updated chat history from the service
      const updatedHistory = aiService.getChatHistory();
      setMessages(updatedHistory);
    } catch (error) {
      console.error('Failed to initialize context:', error);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize AI assistant with portfolio context.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentIcon = (agentType?: string) => {
    const agent = agents.find(a => a.type === agentType);
    return agent?.icon || Bot;
  };

  // Load existing chat history on component mount
  React.useEffect(() => {
    const existingHistory = aiService.getChatHistory();
    if (existingHistory.length > 0) {
      setMessages(existingHistory);
    }
  }, []);

  const generateContextualFollowUps = (lastMessage: string) => {
    const followUps = [];
    
    if (lastMessage.includes('emission') || lastMessage.includes('carbon')) {
      followUps.push("How can we reduce our portfolio's emissions intensity?");
      followUps.push("What are the regulatory implications of these emissions?");
    }
    
    if (lastMessage.includes('anomaly') || lastMessage.includes('outlier')) {
      followUps.push("Which loans should we prioritize for investigation?");
      followUps.push("What's causing these data quality issues?");
    }
    
    if (lastMessage.includes('scenario') || lastMessage.includes('prediction')) {
      followUps.push("What's the financial impact of these scenarios?");
      followUps.push("How should we prepare for regulatory changes?");
    }

    return followUps.slice(0, 3);
  };

  return (
    <Card className="h-[600px] flex flex-col w-full">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Assistant
          <Badge variant="outline" className="ml-auto">
            Platform RAG
          </Badge>
        </CardTitle>
        
        {/* Agent Selection */}
        <div className="flex gap-2 mt-2">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent === agent.type;
            
            return (
              <Button
                key={agent.type}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAgent(agent.type)}
                className="flex items-center gap-1"
              >
                <Icon className="h-3 w-3" />
                {agent.name}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Message History */}
        <ScrollArea className="flex-1 p-4 max-h-[400px]">
          {messages.length === 0 && !isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation with the AI assistant</p>
              <p className="text-xs mt-1">
                Current agent: {agents.find(a => a.type === selectedAgent)?.name}
              </p>
              {context && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={initializeWithContext}
                >
                  Initialize with Portfolio Context
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {messages.map((message, index) => {
                const isLastAssistantMessage = message.role === 'assistant' && 
                  index === messages.length - 1 && 
                  !isLoading;
                const followUps = isLastAssistantMessage ? 
                  generateContextualFollowUps(message.content) : [];

                return (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {(() => {
                            const Icon = getAgentIcon(message.agentType);
                            return <Icon className="h-4 w-4 text-primary" />;
                          })()}
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Contextual Follow-ups */}
                    {followUps.length > 0 && (
                      <div className="ml-11 flex flex-wrap gap-2">
                        {followUps.map((followUp, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs h-auto py-1 px-2"
                             onClick={() => {
                               setInputMessage(followUp);
                               sendMessage(followUp);
                             }}
                          >
                            {followUp}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      {agents.find(a => a.type === selectedAgent)?.name} agent is thinking...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <Separator />
        
        {/* Message Input */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask the ${agents.find(a => a.type === selectedAgent)?.name} agent...`}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
              disabled={isLoading}
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
