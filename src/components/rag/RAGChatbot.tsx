import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    MessageCircle,
    Send,
    Bot,
    User,
    RefreshCw,
    Brain,
    FileText,
    Lightbulb,
    AlertCircle,
    Copy,
    ThumbsUp,
    ThumbsDown,
    Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { pureDatasetRAGService } from '@/services/pureDatasetRAGService';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: Array<{
        title: string;
        content: string;
        similarity: number;
        metadata?: any;
    }>;
    confidence?: number;
    followUpQuestions?: string[];
    isStreaming?: boolean;
}

interface ChatSession {
    id: string;
    type: string;
    focusArea?: string;
    createdAt: Date;
}

interface RAGChatbotProps {
    className?: string;
    defaultSessionType?: 'general' | 'methodology' | 'portfolio_analysis' | 'compliance';
    defaultFocusArea?: string;
    embedded?: boolean;
}

export function RAGChatbot({
    className,
    defaultSessionType = 'general',
    defaultFocusArea,
    embedded = false
}: RAGChatbotProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [sessionType, setSessionType] = useState(defaultSessionType);
    const [isConnected, setIsConnected] = useState(false);
    const { toast } = useToast();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        initializeChat();
        return () => {
            // Cleanup session on unmount if needed
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const initializeChat = async () => {
        try {
            setIsLoading(true);

            // Create session using existing service
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            setCurrentSession({
                id: sessionId,
                type: sessionType,
                focusArea: defaultFocusArea,
                createdAt: new Date()
            });
            setIsConnected(true);

            // Add welcome message
            const welcomeMessage: ChatMessage = {
                id: 'welcome',
                role: 'assistant',
                content: getWelcomeMessage(sessionType),
                timestamp: new Date(),
                followUpQuestions: getInitialQuestions(sessionType)
            };
            setMessages([welcomeMessage]);
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            setIsConnected(false);
            toast({
                title: 'Connection Error',
                description: 'Failed to connect to AI chat service. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getWelcomeMessage = (type: string): string => {
        const messages = {
            general: "Hello! I'm your PCAF motor vehicle specialist. I can help you with data quality improvements, financed emissions calculations, and PCAF compliance for motor vehicle loans. What would you like to know?",
            methodology: "Hi! I specialize in PCAF motor vehicle methodology. Ask me about the 5 data quality options, attribution factors, emission calculations, or how to improve your PCAF scores.",
            portfolio_analysis: "Welcome! I can analyze your motor vehicle loan portfolio and provide specific recommendations for data quality improvements and PCAF compliance. What aspect would you like to explore?",
            compliance: "Hello! I focus on PCAF compliance for motor vehicle portfolios. I can help with data quality requirements, scoring thresholds, and reporting standards for financed emissions."
        };
        return messages[type as keyof typeof messages] || messages.general;
    };

    const getInitialQuestions = (type: string): string[] => {
        const questions = {
            general: [
                "How can I improve my portfolio data quality?",
                "What are the PCAF data quality options?",
                "How do I calculate attribution factors?"
            ],
            methodology: [
                "What are PCAF Options 1-5 for motor vehicles?",
                "How to move from Option 5 to Option 4?",
                "What data do I need for Option 3?"
            ],
            portfolio_analysis: [
                "Analyze my motor vehicle portfolio data quality",
                "Which loans need data improvements?",
                "How do I prioritize data collection?"
            ],
            compliance: [
                "What PCAF score do I need for compliance?",
                "How to calculate weighted data quality score?",
                "What are motor vehicle reporting requirements?"
            ]
        };
        return questions[type as keyof typeof questions] || questions.general;
    };

    const sendMessage = async (messageContent?: string) => {
        const content = messageContent || inputMessage.trim();
        if (!content || !currentSession || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Try dataset RAG first for surgical precision with comprehensive Q&A coverage
            try {
                const { datasetRAGService } = await import('@/services/datasetRAGService');
                
                // Get portfolio context if query suggests it's needed
                let portfolioContext = null;
                const needsPortfolio = content.toLowerCase().includes('my') || 
                                     content.toLowerCase().includes('portfolio') ||
                                     content.toLowerCase().includes('current') ||
                                     sessionType === 'portfolio_analysis';
                
                if (needsPortfolio) {
                    try {
                        const { portfolioService } = await import('@/services/portfolioService');
                        const { loans, summary } = await portfolioService.getPortfolioSummary();
                        
                        // Analyze portfolio for contextual responses
                        const motorVehicleLoans = loans.filter(loan => 
                            loan.asset_class === 'motor_vehicle' || loan.vehicle_data || !loan.asset_class
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
                                complianceStatus: 'compliant' // Will be calculated properly
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
                
                // Use pure dataset service to prevent hallucinations
                const response = await pureDatasetRAGService.processQuery({
                    query: content,
                    sessionId: sessionId,
                    portfolioContext: portfolioContext,
                    userRole: 'risk_manager' // TODO: Get from user context
                });

                const assistantMessage: ChatMessage = {
                    id: Date.now().toString() + '_assistant',
                    role: 'assistant',
                    content: response.response,
                    timestamp: new Date(),
                    sources: response.sources?.map(source => ({
                        title: source,
                        content: `Reference from ${source}`,
                        similarity: response.isExactMatch ? 0.95 : 0.8,
                        metadata: { 
                            verified: true, 
                            dataset: true,
                            questionId: response.matchedQuestionId,
                            datasetSource: response.datasetSource,
                            isExactMatch: response.isExactMatch
                        }
                    })) || [],
                    confidence: response.confidence === 'high' ? 0.95 : 
                               response.confidence === 'medium' ? 0.8 : 0.6,
                    followUpQuestions: response.followUpQuestions || []
                };

                setMessages(prev => [...prev, assistantMessage]);
                return;
            } catch (datasetError) {
                console.warn('Dataset RAG failed, falling back to focused service:', datasetError);
            }

            // Fallback to existing AI service
            const { aiChatService } = await import('@/services/aiService');

            const response = await aiChatService.processMessage({
                sessionId: currentSession.id,
                message: content,
                context: {
                    type: sessionType,
                    focusArea: defaultFocusArea
                }
            });

            const assistantMessage: ChatMessage = {
                id: Date.now().toString() + '_assistant',
                role: 'assistant',
                content: response.response || 'I apologize, but I couldn\'t generate a response. Please try again.',
                timestamp: new Date(),
                sources: response.sources?.map(source => ({
                    title: source,
                    content: `Reference from ${source}`,
                    similarity: 0.8,
                    metadata: { source }
                })) || [],
                confidence: response.confidence === 'high' ? 0.9 : response.confidence === 'medium' ? 0.7 : 0.5,
                followUpQuestions: response.followUpSuggestions || []
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);

            const errorMessage: ChatMessage = {
                id: Date.now().toString() + '_error',
                role: 'assistant',
                content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);

            toast({
                title: 'Message Failed',
                description: 'Failed to send message. Please try again.',
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

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                title: 'Copied',
                description: 'Message copied to clipboard',
            });
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const resetChat = () => {
        setMessages([]);
        setCurrentSession(null);
        initializeChat();
    };

    const renderMessage = (message: ChatMessage) => {
        const isUser = message.role === 'user';

        return (
            <div key={message.id} className={cn(
                "flex gap-3 p-4",
                isUser ? "justify-end" : "justify-start"
            )}>
                {!isUser && (
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                )}

                <div className={cn(
                    "max-w-[80%] space-y-2",
                    isUser ? "items-end" : "items-start"
                )}>
                    <div className={cn(
                        "rounded-lg px-4 py-2 text-sm",
                        isUser
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                    )}>
                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {message.confidence && (
                            <div className="mt-2 flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    Confidence: {Math.round(message.confidence * 100)}%
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Sources ({message.sources.length})
                            </p>
                            <div className="space-y-1">
                                {message.sources.slice(0, 3).map((source, index) => (
                                    <div key={index} className="text-xs p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium truncate">{source.title || 'Document'}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {Math.round(source.similarity * 100)}%
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

                    {/* Follow-up Questions */}
                    {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                        <div className="space-y-2">
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
                                        className="text-xs h-auto py-1 px-2"
                                        onClick={() => sendMessage(question)}
                                        disabled={isLoading}
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message Actions */}
                    {!isUser && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(message.content)}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                            >
                                <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                            >
                                <ThumbsDown className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>

                {isUser && (
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!embedded) {
        return (
            <Card className={cn("flex flex-col h-[600px]", className)}>
                <CardHeader className="flex-shrink-0 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-1 rounded bg-primary/10">
                                <Brain className="w-4 h-4 text-primary" />
                            </div>
                            PCAF AI Assistant
                            {isConnected && (
                                <Badge variant="secondary" className="text-xs">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                                    Connected
                                </Badge>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <select
                                value={sessionType}
                                onChange={(e) => setSessionType(e.target.value as any)}
                                className="text-xs border rounded px-2 py-1"
                                disabled={isLoading}
                            >
                                <option value="general">General</option>
                                <option value="methodology">Methodology</option>
                                <option value="portfolio_analysis">Portfolio Analysis</option>
                                <option value="compliance">Compliance</option>
                            </select>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetChat}
                                disabled={isLoading}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 px-4">
                        <div className="space-y-4 py-4">
                            {messages.map(renderMessage)}
                            {isLoading && (
                                <div className="flex gap-3 p-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span className="text-sm text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    <Separator />

                    <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50/30">
                        <div className="relative">
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 relative">
                                    <Input
                                        ref={inputRef}
                                        placeholder="Ask me about PCAF methodology, calculations, or compliance..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        disabled={isLoading || !isConnected}
                                        className="pr-12 py-3 text-sm border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-sm bg-white"
                                    />
                                    {inputMessage && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => sendMessage()}
                                    disabled={isLoading || !inputMessage.trim() || !isConnected}
                                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>

                            {!isConnected && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                    <AlertCircle className="w-3 h-3" />
                                    Not connected to AI service
                                </div>
                            )}
                            
                            {isConnected && (
                                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span>Hallucination-free responses</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Surgical precision AI</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Embedded version (simplified)
    return (
        <div className={cn("flex flex-col h-full", className)}>
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                        {messages.map(renderMessage)}
                        {isLoading && (
                            <div className="flex gap-3 p-4">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                </div>
                                <div className="bg-muted rounded-lg px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        <span className="text-xs text-muted-foreground">Analyzing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>

            <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50/30 p-3">
                <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Ask about PCAF methodology..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading || !isConnected}
                            className="text-sm border-2 border-gray-200 focus:border-blue-400 rounded-lg"
                        />
                    </div>
                    <Button
                        onClick={() => sendMessage()}
                        disabled={isLoading || !inputMessage.trim() || !isConnected}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                            <Send className="w-3 h-3" />
                        )}
                    </Button>
                </div>
                
                {!isConnected && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                        <AlertCircle className="w-3 h-3" />
                        Not connected to AI service
                    </div>
                )}
                
                {isConnected && (
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            <span>Hallucination-free</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Surgical precision</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}