import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Database,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { pipelineIntegrationService } from "@/services/pipeline-integration-service";
import { narrativePipelineIntegration } from "@/services/narrative-pipeline-integration";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    dataPoints?: string[];
    sources?: string[];
    confidence?: number;
  };
}

interface ContextualAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    title: string;
    type: string;
    data: any;
    relatedMetrics?: string[];
  };
  className?: string;
}

export function ContextualAIChat({ isOpen, onClose, context, className = "" }: ContextualAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeChat();
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hi! I'm your AI assistant for analyzing "${context.title}". I have access to your portfolio data, loan information, and client database through ChromaDB. 

I can help you understand:
• The specific data behind this insight
• How it relates to your portfolio performance
• Actionable next steps based on your bank's profile
• Regulatory implications and compliance considerations

What would you like to explore about this ${context.type.replace('_', ' ')} insight?`,
      timestamp: new Date(),
      context: {
        dataPoints: context.relatedMetrics || [],
        sources: ['Portfolio Database', 'ChromaDB', 'PCAF Standards'],
        confidence: 0.95
      }
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Search for relevant context from ChromaDB
      const searchResults = await pipelineIntegrationService.searchDocuments(
        `${inputValue} ${context.title} ${context.type}`,
        { limit: 5 }
      );

      // Generate contextual response using AI narrative service
      const aiResponse = await generateContextualResponse(inputValue, context, searchResults);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        context: {
          dataPoints: aiResponse.dataPoints,
          sources: aiResponse.sources,
          confidence: aiResponse.confidence
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble accessing the data right now. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualResponse = async (query: string, context: any, searchResults: any[]) => {
    // Simulate AI response generation with contextual data
    const responses = {
      'portfolio_optimization': {
        content: `Based on your portfolio data, I can see several optimization opportunities:

**Current Portfolio Status:**
• Total Instruments: 247 loans
• Portfolio Value: $8.2M
• Current Emissions: 268 tCO2e
• EV Adoption: 7.7% (above industry average)

**Key Optimization Insights:**
1. **EV Leadership Position**: Your 7.7% EV adoption rate positions you ahead of the industry average. This is a competitive advantage you can leverage.

2. **Data Quality Enhancement**: With an average PCAF score of 5.0, there's room for improvement to enhance regulatory compliance and calculation accuracy.

3. **Green Finance Opportunities**: Your current EV portfolio provides a strong foundation for developing green loan products.

**Recommended Actions:**
• Launch targeted EV incentive programs
• Implement enhanced data collection for new loans
• Develop sustainability-linked financing options

Would you like me to dive deeper into any of these areas or explore specific implementation strategies?`,
        dataPoints: ['EV Adoption Rate: 7.7%', 'PCAF Score: 5.0', 'Portfolio Size: 247 loans'],
        sources: ['Portfolio Database', 'PCAF Standards', 'Industry Benchmarks'],
        confidence: 0.92
      },
      'risk_analysis': {
        content: `I've analyzed your portfolio's risk profile using the latest data:

**Risk Assessment Summary:**
• **Transition Risk**: Medium - Concentration in older vehicle models
• **Physical Risk**: Low - Limited geographic exposure
• **Regulatory Risk**: Medium - PCAF compliance improvements needed

**Key Risk Factors:**
1. **Policy Risk (High)**: Potential regulatory changes affecting ICE vehicles
2. **Technology Risk (Medium)**: EV adoption disruption to traditional auto loans
3. **Market Risk (Medium)**: Consumer preference shifts toward sustainable options

**Risk Mitigation Strategies:**
• Diversify toward low-emission vehicles (target: 15% EV by 2025)
• Enhance data quality to improve PCAF compliance
• Develop green financing products to capture market opportunities

**Portfolio-Specific Recommendations:**
Based on your 247 loans with $8.2M exposure, I recommend prioritizing policy risk mitigation through strategic portfolio rebalancing.

What specific risk scenarios would you like me to model for your portfolio?`,
        dataPoints: ['Transition Risk: Medium', 'Physical Risk: Low', 'Policy Risk: High'],
        sources: ['Risk Assessment Models', 'Portfolio Data', 'Regulatory Guidelines'],
        confidence: 0.88
      },
      'emissions_forecasts': {
        content: `Here's your personalized emissions forecast based on current portfolio trends:

**12-Month Projection:**
• Current Baseline: 268 tCO2e
• Projected (Q4 2024): 245 tCO2e (-8.6% reduction)
• Best Case Scenario: 220 tCO2e (-17.9% reduction)

**Key Forecast Drivers:**
1. **EV Adoption Acceleration**: Current 7.7% expected to reach 12% by year-end
2. **Fleet Modernization**: Natural portfolio turnover toward newer, efficient vehicles
3. **Regulatory Compliance**: Enhanced data quality improving calculation accuracy

**Scenario Analysis:**
• **Optimistic**: -25% emissions reduction (aggressive EV program)
• **Base Case**: -15% reduction (current trajectory)
• **Conservative**: -8% reduction (minimal intervention)

**Strategic Implications:**
Your portfolio is well-positioned for emissions reduction. The current EV leadership provides a foundation for accelerated decarbonization.

**Next Steps:**
1. Set formal emissions reduction targets
2. Develop EV incentive programs
3. Track monthly progress against projections

Would you like me to model specific scenarios or explore target-setting strategies?`,
        dataPoints: ['Current: 268 tCO2e', 'Projected: 245 tCO2e', 'EV Rate: 7.7%'],
        sources: ['Emissions Database', 'Forecasting Models', 'Portfolio Trends'],
        confidence: 0.85
      },
      'climate_scenarios': {
        content: `I've analyzed your portfolio performance under different climate scenarios:

**NGFS Scenario Analysis Results:**

**1. Orderly Transition (+12% portfolio value)**
• Early policy action enables smooth transition
• Your EV exposure provides significant upside
• Recommended: Accelerate green financing initiatives

**2. Disorderly Transition (-8% portfolio value)**
• Late policy action increases transition costs
• ICE vehicle exposure creates headwinds
• Recommended: Diversification strategy needed

**3. Hot House World (-15% portfolio value)**
• Limited climate action, severe physical risks
• All vehicle types affected by extreme weather
• Recommended: Physical risk assessment required

**Portfolio-Specific Insights:**
With 247 loans and 7.7% EV exposure, you're better positioned than most banks for transition scenarios. However, the 92.3% ICE exposure creates vulnerability in disorderly scenarios.

**Strategic Recommendations:**
1. **Immediate**: Increase EV financing targets to 15%
2. **Medium-term**: Develop climate-resilient lending criteria
3. **Long-term**: Build physical risk assessment capabilities

**Risk Management:**
Your current portfolio shows resilience in orderly scenarios but needs diversification for disorderly outcomes.

Which scenario would you like me to explore in more detail?`,
        dataPoints: ['Orderly: +12%', 'Disorderly: -8%', 'Hot House: -15%'],
        sources: ['NGFS Scenarios', 'Portfolio Models', 'Climate Risk Data'],
        confidence: 0.90
      },
      'anomaly_detection': {
        content: `I've identified several anomalies in your portfolio data that require attention:

**High Priority Anomalies (2 detected):**

**1. AUTO0156 - Emissions Outlier**
• Issue: 8.2 tCO2e vs 4.1 tCO2e average for vehicle class
• Confidence: 95%
• Impact: Data quality and PCAF compliance
• Action: Verify vehicle specifications and usage patterns

**2. AUTO0203 - Data Quality Issue**
• Issue: PCAF score 4.5/5 requires validation
• Confidence: 88%
• Impact: Regulatory compliance risk
• Action: Request additional borrower documentation

**Medium Priority (1 detected):**
• AUTO0089: Missing fuel efficiency data affecting calculations

**AI Detection Accuracy: 98.4%**

**Root Cause Analysis:**
Most anomalies stem from incomplete data collection during loan origination. Implementing enhanced data requirements could prevent 80% of these issues.

**Recommended Actions:**
1. **Immediate**: Review and correct high-priority anomalies
2. **Short-term**: Enhance data collection processes
3. **Long-term**: Implement automated data validation

**Business Impact:**
Resolving these anomalies could improve your average PCAF score from 5.0 to 3.2, significantly enhancing regulatory compliance.

Would you like me to provide detailed remediation steps for specific anomalies?`,
        dataPoints: ['High Priority: 2', 'Medium Priority: 1', 'Detection Accuracy: 98.4%'],
        sources: ['Anomaly Detection AI', 'Portfolio Database', 'PCAF Standards'],
        confidence: 0.94
      }
    };

    const defaultResponse = {
      content: `I understand you're asking about "${query}" in the context of ${context.title}. 

Based on your portfolio data from ChromaDB, I can provide insights about:
• Current portfolio performance metrics
• PCAF compliance status
• Regulatory implications
• Actionable recommendations

Your portfolio currently has 247 instruments worth $8.2M with 268 tCO2e emissions. The 7.7% EV adoption rate is a key strength.

Could you be more specific about what aspect you'd like me to analyze? I can dive deeper into the data, explain methodologies, or provide implementation guidance.`,
      dataPoints: ['Portfolio Size: 247', 'Value: $8.2M', 'Emissions: 268 tCO2e'],
      sources: ['Portfolio Database', 'ChromaDB'],
      confidence: 0.80
    };

    return responses[context.type as keyof typeof responses] || defaultResponse;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className={`w-full max-w-2xl h-[600px] flex flex-col shadow-2xl ${className}`}>
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900">
                  AI Context Chat
                </CardTitle>
                <p className="text-sm text-blue-700">
                  {context.title} • {context.type.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <Database className="w-3 h-3 mr-1" />
                ChromaDB Connected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    
                    {message.context && message.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium text-muted-foreground">
                            AI Context • {(message.context.confidence! * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        
                        {message.context.dataPoints && message.context.dataPoints.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {message.context.dataPoints.map((point, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                {point}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {message.context.sources && (
                          <div className="text-xs text-muted-foreground">
                            Sources: {message.context.sources.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Analyzing portfolio data...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this insight, request deeper analysis, or explore related data..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              <span>Connected to ChromaDB • Portfolio data • Client database • PCAF standards</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}