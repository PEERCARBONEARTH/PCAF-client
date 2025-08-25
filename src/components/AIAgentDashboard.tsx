import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  MessageSquare, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  FileText,
  Shield,
  TrendingUp,
  Send,
  RefreshCcw
} from "lucide-react";
import { platformRAGService, AIAgent, AgentResponse } from "@/services/platform-rag-service";
import { useToast } from "@/hooks/use-toast";

interface AgentConversation {
  id: string;
  agentType: string;
  messages: {
    type: 'user' | 'agent';
    content: string;
    timestamp: string;
    confidence?: number;
  }[];
}

export function AIAgentDashboard() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setRefreshing(true);
      const agentData = await platformRAGService.getAgents();
      setAgents(agentData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load AI agents",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim() || !selectedAgent) return;

    setLoading(true);
    try {
      const agent = agents.find(a => a.id === selectedAgent);
      if (!agent) return;

      // Add user message to conversation
      const userMsg = {
        type: 'user' as const,
        content: userMessage,
        timestamp: new Date().toISOString()
      };

      let conversation = conversations.find(c => c.agentType === agent.type);
      if (!conversation) {
        conversation = {
          id: `conv-${Date.now()}`,
          agentType: agent.type,
          messages: []
        };
        setConversations(prev => [...prev, conversation!]);
      }

      conversation.messages.push(userMsg);
      setConversations(prev => [...prev]);

      // Get agent response
      const response = await platformRAGService.queryAgent(agent.type, userMessage);
      
      const agentMsg = {
        type: 'agent' as const,
        content: response.response,
        timestamp: response.timestamp,
        confidence: response.confidence
      };

      conversation.messages.push(agentMsg);
      setConversations(prev => [...prev]);
      setUserMessage('');

      toast({
        title: "Response received",
        description: `${agent.name} responded with ${Math.round(response.confidence * 100)}% confidence`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get agent response",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'calculation': return <Bot className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'reporting': return <FileText className="h-4 w-4" />;
      case 'advisory': return <Brain className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'processing': return 'secondary';
      case 'idle': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const currentConversation = conversations.find(c => 
    c.agentType === agents.find(a => a.id === selectedAgent)?.type
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">AI Agent Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and interact with AI agents for enhanced carbon calculations
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadAgents}
          disabled={refreshing}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Agent Overview</TabsTrigger>
          <TabsTrigger value="interaction">Agent Interaction</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Agent Status Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getAgentIcon(agent.type)}
                    {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
                  </CardTitle>
                  <Badge variant={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Queue:</span>
                      <span className="font-medium">{agent.processingQueue}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-medium">{Math.round(agent.successRate * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Response:</span>
                      <span className="font-medium">{agent.avgResponseTime}s</span>
                    </div>
                    <Progress value={agent.successRate * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Knowledge Base</p>
                    <p className="text-sm text-muted-foreground">98.7% up-to-date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Average Response</p>
                    <p className="text-sm text-muted-foreground">2.4 seconds</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Success Rate</p>
                    <p className="text-sm text-muted-foreground">95.8% overall</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interaction" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Agent Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant={selectedAgent === agent.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    {getAgentIcon(agent.type)}
                    <span className="ml-2">{agent.name}</span>
                    <Badge className="ml-auto" variant={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Conversation */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-64 w-full border rounded-md p-4">
                  {currentConversation ? (
                    <div className="space-y-4">
                      {currentConversation.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.type === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            {message.confidence && (
                              <p className="text-xs mt-1 opacity-70">
                                Confidence: {Math.round(message.confidence * 100)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Select an agent to start a conversation
                    </div>
                  )}
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask the AI agent a question..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    className="min-h-[60px]"
                    disabled={!selectedAgent}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!selectedAgent || !userMessage.trim() || loading}
                    size="sm"
                  >
                    {loading ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">PCAF Standards</span>
                    <Badge>Current</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">EU Taxonomy</span>
                    <Badge>Current</Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Regional Regulations</span>
                    <Badge variant="secondary">Updating</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">PCAF Standard Updated</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">New Regional Factors</p>
                      <p className="text-xs text-muted-foreground">Processing...</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">EU Taxonomy Sync</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}