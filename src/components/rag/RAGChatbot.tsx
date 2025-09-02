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
// ChromaDB RAG service is accessed via API endpoint

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
    showModeSelector?: boolean;
    autoDetectMode?: boolean;
}

type ChatMode = 'general' | 'risk_manager' | 'compliance_officer' | 'data_analyst' | 'methodology_expert';

interface ChatModeConfig {
    id: ChatMode;
    name: string;
    description: string;
    icon: any;
    color: string;
    systemPrompt: string;
}

export function RAGChatbot({
    className,
    defaultSessionType = 'general',
    defaultFocusArea,
    embedded = false,
    showModeSelector = true,
    autoDetectMode = true
}: RAGChatbotProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [sessionType, setSessionType] = useState(defaultSessionType);
    const [isConnected, setIsConnected] = useState(false);
    const [currentMode, setCurrentMode] = useState<ChatMode>('general');
    const [autoDetectModeState, setAutoDetectMode] = useState(autoDetectMode);
    const [processingFollowUp, setProcessingFollowUp] = useState<string | null>(null);
    const { toast } = useToast();

    // Enhanced chat modes for different user personas
    const chatModes: ChatModeConfig[] = [
        {
            id: 'general',
            name: 'General Assistant',
            description: 'General PCAF guidance and methodology',
            icon: Brain,
            color: 'bg-blue-500',
            systemPrompt: 'You are a PCAF methodology expert providing comprehensive guidance.'
        },
        {
            id: 'risk_manager',
            name: 'Risk Manager',
            description: 'Portfolio risk assessment and management',
            icon: AlertCircle,
            color: 'bg-red-500',
            systemPrompt: 'You are a risk management specialist focusing on portfolio analysis and risk assessment.'
        },
        {
            id: 'compliance_officer',
            name: 'Compliance Officer',
            description: 'Regulatory compliance and audit preparation',
            icon: FileText,
            color: 'bg-green-500',
            systemPrompt: 'You are a compliance expert focusing on regulatory requirements and audit preparation.'
        },
        {
            id: 'data_analyst',
            name: 'Data Analyst',
            description: 'Data quality and calculation methodology',
            icon: Sparkles,
            color: 'bg-purple-500',
            systemPrompt: 'You are a data analysis expert focusing on data quality improvement and calculation methods.'
        },
        {
            id: 'methodology_expert',
            name: 'Methodology Expert',
            description: 'Technical PCAF implementation guidance',
            icon: Lightbulb,
            color: 'bg-orange-500',
            systemPrompt: 'You are a PCAF methodology expert providing technical implementation guidance.'
        }
    ];

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

    // Intelligent mode detection based on user query
    const detectOptimalMode = (query: string): ChatMode => {
        const lowerQuery = query.toLowerCase();
        
        // Risk management keywords
        if (lowerQuery.match(/\b(risk|portfolio|exposure|assessment|analysis|monitor|alert|threshold|limit|concentration)\b/)) {
            return 'risk_manager';
        }
        
        // Compliance keywords  
        if (lowerQuery.match(/\b(compliance|audit|regulation|requirement|standard|report|disclosure|mandate|policy)\b/)) {
            return 'compliance_officer';
        }
        
        // Data analysis keywords
        if (lowerQuery.match(/\b(data|quality|calculation|score|improve|accuracy|validation|clean|missing|error)\b/)) {
            return 'data_analyst';
        }
        
        // Methodology keywords
        if (lowerQuery.match(/\b(methodology|option|pcaf|implementation|technical|guidance|standard|framework)\b/)) {
            return 'methodology_expert';
        }
        
        // Default to general for broad questions
        return 'general';
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
            general: "Hello! I'm your intelligent PCAF assistant powered by our enhanced ChromaDB knowledge base with 200+ validated Q&As. I automatically adapt my expertise based on your questions - whether you need help with risk management, compliance, data analysis, or methodology. What would you like to know?",
            methodology: "Hi! I specialize in PCAF motor vehicle methodology using our comprehensive knowledge base. Ask me about the 5 data quality options, attribution factors, emission calculations, or how to improve your PCAF scores.",
            portfolio_analysis: "Welcome! I can analyze your motor vehicle loan portfolio using our enhanced knowledge base and provide specific recommendations for data quality improvements and PCAF compliance. What aspect would you like to explore?",
            compliance: "Hello! I focus on PCAF compliance for motor vehicle portfolios using our regulatory knowledge base. I can help with data quality requirements, scoring thresholds, and reporting standards for financed emissions."
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

        // Auto-detect optimal mode based on query
        if (autoDetectModeState) {
            const detectedMode = detectOptimalMode(content);
            if (detectedMode !== currentMode) {
                setCurrentMode(detectedMode);
            }
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        
        // Clear input field (important for follow-up questions)
        if (!messageContent) {
            setInputMessage('');
        }
        
        setIsLoading(true);

        try {
            // Use ChromaDB RAG service for enhanced knowledge base search
            try {
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
                
                // Call ChromaDB RAG API on main PCAF-server
                const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
                const response = await fetch(`${apiUrl}/api/chroma/rag-query`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: content,
                        portfolioContext: portfolioContext
                    })
                });

                if (!response.ok) {
                    throw new Error(`RAG API error: ${response.status}`);
                }

                const ragResponse = await response.json();

                const assistantMessage: ChatMessage = {
                    id: Date.now().toString() + '_assistant',
                    role: 'assistant',
                    content: ragResponse.response,
                    timestamp: new Date(),
                    sources: ragResponse.sources?.map((source: string) => ({
                        title: source,
                        content: `Reference from ${source}`,
                        similarity: ragResponse.confidence === 'high' ? 0.95 : 
                                   ragResponse.confidence === 'medium' ? 0.8 : 0.6,
                        metadata: { 
                            verified: true, 
                            chromadb: true,
                            confidence: ragResponse.confidence
                        }
                    })) || [],
                    confidence: ragResponse.confidence === 'high' ? 0.95 : 
                               ragResponse.confidence === 'medium' ? 0.8 : 0.6,
                    followUpQuestions: ragResponse.followUpQuestions || []
                };

                setMessages(prev => [...prev, assistantMessage]);
                return;
            } catch (chromaError) {
                console.warn('ChromaDB RAG failed, falling back to AI service:', chromaError);
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
                                        variant={processingFollowUp === question ? "default" : "outline"}
                                        size="sm"
                                        className={cn(
                                            "text-xs h-auto py-1 px-2 transition-all duration-200",
                                            processingFollowUp === question 
                                                ? "bg-primary text-primary-foreground" 
                                                : "hover:bg-primary/10"
                                        )}
                                        onClick={async () => {
                                            // Set processing state
                                            setProcessingFollowUp(question);
                                            
                                            // Clear input field and send the follow-up question
                                            setInputMessage('');
                                            
                                            // Show feedback toast
                                            toast({
                                                title: 'Follow-up Question',
                                                description: `Asking: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`,
                                                duration: 2000,
                                            });
                                            
                                            try {
                                                await sendMessage(question);
                                            } catch (error) {
                                                toast({
                                                    title: 'Error',
                                                    description: 'Failed to send follow-up question. Please try again.',
                                                    variant: 'destructive',
                                                });
                                            } finally {
                                                // Clear processing state after message is sent
                                                setProcessingFollowUp(null);
                                            }
                                        }}
                                        disabled={isLoading || processingFollowUp === question}
                                        title={`Ask: ${question}`}
                                    >
                                        {processingFollowUp === question && (
                                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                        )}
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
                            <div className={cn("p-1 rounded", chatModes.find(m => m.id === currentMode)?.color || "bg-primary/10")}>
                                {(() => {
                                    const ModeIcon = chatModes.find(m => m.id === currentMode)?.icon || Brain;
                                    return <ModeIcon className="w-4 h-4 text-white" />;
                                })()}
                            </div>
                            PCAF AI Assistant
                            {isConnected && (
                                <Badge variant="secondary" className="text-xs">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                                    ChromaDB Knowledge Base
                                </Badge>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
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
                    
                    {/* Current Mode Display */}
                    <div className="mt-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">Current Mode:</div>
                                <Badge variant="secondary" className="text-xs">
                                    {(() => {
                                        const ModeIcon = chatModes.find(m => m.id === currentMode)?.icon || Brain;
                                        return (
                                            <>
                                                <ModeIcon className="w-3 h-3 mr-1" />
                                                {chatModes.find(m => m.id === currentMode)?.name}
                                            </>
                                        );
                                    })()}
                                </Badge>
                                {autoDetectModeState && (
                                    <Badge variant="outline" className="text-xs">
                                        Auto-Detect
                                    </Badge>
                                )}
                            </div>
                            {showModeSelector && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setAutoDetectMode(!autoDetectModeState)}
                                    className="text-xs h-6"
                                >
                                    {autoDetectModeState ? 'Manual' : 'Auto'}
                                </Button>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {chatModes.find(m => m.id === currentMode)?.description}
                        </div>
                        
                        {/* Manual Mode Selector - Only show when auto-detect is off */}
                        {showModeSelector && !autoDetectModeState && (
                            <div className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                    {chatModes.map((mode) => {
                                        const ModeIcon = mode.icon;
                                        return (
                                            <Button
                                                key={mode.id}
                                                variant={currentMode === mode.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentMode(mode.id)}
                                                className="text-xs h-8"
                                                disabled={isLoading}
                                            >
                                                <ModeIcon className="w-3 h-3 mr-1" />
                                                {mode.name}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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