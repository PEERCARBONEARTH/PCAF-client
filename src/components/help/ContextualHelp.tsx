import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageSquare, 
  X, 
  Send, 
  Lightbulb,
  ExternalLink,
  Clock,
  Star,
  ChevronRight,
  Search,
  Zap,
  Target,
  Shield,
  BarChart3
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { aiChatService } from '@/services/aiService';

export interface HelpContext {
  currentPage: string;
  userAction: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  availableHelp: HelpResource[];
}

export interface HelpResource {
  id: string;
  type: 'tooltip' | 'tutorial' | 'video' | 'article' | 'ai-chat' | 'quick-tip';
  title: string;
  content: string;
  estimatedTime: number; // minutes
  relevanceScore: number; // 0-1
  category: 'getting-started' | 'calculations' | 'data-quality' | 'reporting' | 'compliance';
  href?: string;
  videoUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  helpful?: boolean;
}

// Contextual help resources based on current page
const HELP_RESOURCES: Record<string, HelpResource[]> = {
  '/financed-emissions/upload': [
    {
      id: 'csv-format-guide',
      type: 'tutorial',
      title: 'CSV Upload Format Guide',
      content: 'Learn the required CSV format for loan data uploads, including mandatory and optional fields.',
      estimatedTime: 3,
      relevanceScore: 0.9,
      category: 'getting-started',
      difficulty: 'beginner'
    },
    {
      id: 'data-mapping-help',
      type: 'article',
      title: 'Data Field Mapping',
      content: 'Understand how to map your existing loan data fields to PCAF requirements.',
      estimatedTime: 5,
      relevanceScore: 0.8,
      category: 'data-quality',
      difficulty: 'intermediate'
    },
    {
      id: 'upload-troubleshooting',
      type: 'quick-tip',
      title: 'Common Upload Issues',
      content: 'Quick fixes for common CSV upload problems like formatting errors and missing data.',
      estimatedTime: 2,
      relevanceScore: 0.7,
      category: 'getting-started',
      difficulty: 'beginner'
    }
  ],
  '/financed-emissions/overview': [
    {
      id: 'understanding-wdqs',
      type: 'tutorial',
      title: 'Understanding WDQS Scores',
      content: 'Learn what Weighted Data Quality Scores mean and how to interpret them for PCAF compliance.',
      estimatedTime: 4,
      relevanceScore: 0.9,
      category: 'compliance',
      difficulty: 'beginner'
    },
    {
      id: 'emissions-intensity-guide',
      type: 'article',
      title: 'Emissions Intensity Explained',
      content: 'Understand emissions intensity metrics and how they compare to industry benchmarks.',
      estimatedTime: 6,
      relevanceScore: 0.8,
      category: 'calculations',
      difficulty: 'intermediate'
    },
    {
      id: 'portfolio-optimization',
      type: 'video',
      title: 'Portfolio Optimization Strategies',
      content: 'Video guide on optimizing your portfolio for better emissions performance.',
      estimatedTime: 8,
      relevanceScore: 0.7,
      category: 'calculations',
      difficulty: 'advanced',
      videoUrl: 'https://example.com/portfolio-optimization'
    }
  ],
  '/financed-emissions/ledger': [
    {
      id: 'loan-level-analysis',
      type: 'tutorial',
      title: 'Loan-Level Analysis',
      content: 'How to analyze individual loan emissions and identify improvement opportunities.',
      estimatedTime: 5,
      relevanceScore: 0.9,
      category: 'calculations',
      difficulty: 'intermediate'
    },
    {
      id: 'data-quality-improvement',
      type: 'article',
      title: 'Improving Data Quality',
      content: 'Step-by-step guide to enhance your loan data quality for better PCAF scores.',
      estimatedTime: 7,
      relevanceScore: 0.8,
      category: 'data-quality',
      difficulty: 'intermediate'
    }
  ],
  '/financed-emissions/reports': [
    {
      id: 'report-generation-guide',
      type: 'tutorial',
      title: 'Generating PCAF Reports',
      content: 'Complete guide to creating professional PCAF-compliant reports for stakeholders.',
      estimatedTime: 6,
      relevanceScore: 0.9,
      category: 'reporting',
      difficulty: 'beginner'
    },
    {
      id: 'customizing-reports',
      type: 'article',
      title: 'Customizing Report Templates',
      content: 'Learn how to customize report templates to match your organization\'s branding and requirements.',
      estimatedTime: 4,
      relevanceScore: 0.7,
      category: 'reporting',
      difficulty: 'intermediate'
    }
  ]
};

// Quick tips that appear contextually
const QUICK_TIPS: Record<string, string[]> = {
  '/financed-emissions/upload': [
    'Ensure your CSV has headers in the first row',
    'Vehicle year, make, and model significantly improve data quality',
    'Annual mileage data helps reduce estimation uncertainty'
  ],
  '/financed-emissions/overview': [
    'WDQS scores ≤3.0 indicate PCAF compliance',
    'Lower emissions intensity is better for portfolio performance',
    'Click on any metric for detailed breakdown'
  ],
  '/financed-emissions/ledger': [
    'Sort by data quality score to find improvement opportunities',
    'Focus on high-value loans for maximum impact',
    'Use filters to analyze specific vehicle types or regions'
  ]
};

interface ContextualHelpProps {
  onClose?: () => void;
}

export function ContextualHelp({ onClose }: ContextualHelpProps) {
  const [helpContext, setHelpContext] = useState<HelpContext | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [activeTab, setActiveTab] = useState('resources');
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    updateHelpContext();
  }, [location.pathname]);

  const updateHelpContext = () => {
    const currentPage = location.pathname;
    const availableHelp = HELP_RESOURCES[currentPage] || [];
    
    setHelpContext({
      currentPage,
      userAction: 'viewing',
      difficulty: 'beginner', // Could be determined from user profile
      availableHelp: availableHelp.sort((a, b) => b.relevanceScore - a.relevanceScore)
    });
  };

  const handleResourceClick = (resource: HelpResource) => {
    if (resource.type === 'ai-chat') {
      setShowAIAssistant(true);
    } else if (resource.href) {
      window.open(resource.href, '_blank');
    } else if (resource.videoUrl) {
      window.open(resource.videoUrl, '_blank');
    }
    
    toast({
      title: "Help Resource Opened",
      description: `Opening: ${resource.title}`,
    });
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'tutorial': return <BookOpen className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'ai-chat': return <Bot className="h-4 w-4" />;
      case 'quick-tip': return <Lightbulb className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started': return <Zap className="h-4 w-4 text-green-600" />;
      case 'calculations': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'data-quality': return <Target className="h-4 w-4 text-orange-600" />;
      case 'reporting': return <BookOpen className="h-4 w-4 text-purple-600" />;
      case 'compliance': return <Shield className="h-4 w-4 text-red-600" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredResources = helpContext?.availableHelp.filter(resource =>
    searchQuery === '' || 
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const currentPageTips = QUICK_TIPS[location.pathname] || [];

  return (
    <div className="space-y-4">
      {/* Floating Help Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50"
        onClick={() => setShowAIAssistant(true)}
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* AI Assistant Chat */}
      {showAIAssistant && (
        <AIAssistantChat 
          context={helpContext}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {/* Quick Tips Banner */}
      {currentPageTips.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-2">Quick Tips</h4>
                <ul className="space-y-1">
                  {currentPageTips.map((tip, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Resources Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help & Resources
              </CardTitle>
              <CardDescription>
                Contextual help for {location.pathname.split('/').pop()?.replace('-', ' ')}
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="chat">AI Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="space-y-4">
              <div className="space-y-3">
                {filteredResources.map((resource) => (
                  <HelpResourceCard
                    key={resource.id}
                    resource={resource}
                    onClick={() => handleResourceClick(resource)}
                  />
                ))}
                
                {filteredResources.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No help resources available for this page</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowAIAssistant(true)}
                    >
                      Ask AI Assistant
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search help resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear
                </Button>
              </div>
              
              <div className="space-y-3">
                {filteredResources.map((resource) => (
                  <HelpResourceCard
                    key={resource.id}
                    resource={resource}
                    onClick={() => handleResourceClick(resource)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-medium mb-2">AI Assistant</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant help with PCAF methodology and platform features
                </p>
                <Button onClick={() => setShowAIAssistant(true)}>
                  Start Chat
                  <MessageSquare className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface HelpResourceCardProps {
  resource: HelpResource;
  onClick: () => void;
}

function HelpResourceCard({ resource, onClick }: HelpResourceCardProps) {
  return (
    <div 
      className="p-4 border rounded-sm cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getResourceIcon(resource.type)}
          <h4 className="font-medium text-sm">{resource.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getDifficultyColor(resource.difficulty)}>
            {resource.difficulty}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">{resource.content}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {resource.estimatedTime} min
          </div>
          <div className="flex items-center gap-1">
            {getCategoryIcon(resource.category)}
            <span className="text-xs text-muted-foreground capitalize">
              {resource.category.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.round(resource.relevanceScore * 5)
                  ? 'text-yellow-500 fill-current'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface AIAssistantChatProps {
  context: HelpContext | null;
  onClose: () => void;
}

function AIAssistantChat({ context, onClose }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your PCAF assistant. I can help you with emissions calculations, data quality improvements, and compliance questions. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Create a chat session if needed
      const sessionId = 'help-session';
      
      // Send message to AI chat service
      const response = await aiChatService.processMessage({
        sessionId,
        message,
        context: {
          type: 'methodology',
          focusArea: context?.currentPage.split('/').pop()
        }
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or check our help resources.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const markAsHelpful = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
    
    toast({
      title: helpful ? "Thanks for the feedback!" : "Feedback noted",
      description: helpful ? "This helps us improve our responses" : "We'll work on better answers"
    });
  };

  return (
    <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">PCAF Assistant</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Ask me about PCAF methodology, calculations, or platform features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatBubble 
                key={message.id} 
                message={message} 
                onMarkHelpful={markAsHelpful}
              />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about PCAF methodology..."
              disabled={loading}
              className="text-sm"
            />
            <Button 
              size="sm" 
              onClick={() => handleSendMessage(input)}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1 mt-2">
            {['What is WDQS?', 'How to improve data quality?', 'PCAF compliance'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChatBubbleProps {
  message: ChatMessage;
  onMarkHelpful: (messageId: string, helpful: boolean) => void;
}

function ChatBubble({ message, onMarkHelpful }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-sm p-3 ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
        
        {!isUser && message.helpful === undefined && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
            <span className="text-xs">Helpful?</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => onMarkHelpful(message.id, true)}
            >
              👍
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => onMarkHelpful(message.id, false)}
            >
              👎
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getResourceIcon(type: string) {
  switch (type) {
    case 'tutorial': return <BookOpen className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
    case 'article': return <BookOpen className="h-4 w-4" />;
    case 'ai-chat': return <Bot className="h-4 w-4" />;
    case 'quick-tip': return <Lightbulb className="h-4 w-4" />;
    default: return <HelpCircle className="h-4 w-4" />;
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'getting-started': return <Zap className="h-4 w-4 text-green-600" />;
    case 'calculations': return <BarChart3 className="h-4 w-4 text-blue-600" />;
    case 'data-quality': return <Target className="h-4 w-4 text-orange-600" />;
    case 'reporting': return <BookOpen className="h-4 w-4 text-purple-600" />;
    case 'compliance': return <Shield className="h-4 w-4 text-red-600" />;
    default: return <HelpCircle className="h-4 w-4" />;
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default ContextualHelp;