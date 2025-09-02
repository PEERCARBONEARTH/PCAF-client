import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    MessageCircle,
    X,
    Minimize2,
    Activity,
    Info
} from "lucide-react";
import { RAGChatbot } from "@/components/rag/RAGChatbot";

interface FloatingChatbotProps {
    className?: string;
}

export function FloatingChatbot({ className = "" }: FloatingChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const toggleChat = () => {
        if (isOpen && !isMinimized) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
            setIsMinimized(false);
        }
    };

    const minimizeChat = () => {
        setIsMinimized(true);
    };

    const closeChat = () => {
        setIsOpen(false);
        setIsMinimized(false);
    };

    return (
        <>
            {/* Floating Chat Button */}
            {(!isOpen || isMinimized) && (
                <Button
                    onClick={toggleChat}
                    className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 bg-blue-600 hover:bg-blue-700 ${className}`}
                    size="icon"
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                </Button>
            )}

            {/* Floating Chat Window */}
            {isOpen && !isMinimized && (
                <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] transform transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-4 slide-in-from-right-4">
                    <Card className="h-full shadow-2xl border-2 border-blue-200 bg-white">
                        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                                    <MessageCircle className="h-5 w-5" />
                                    AI Support Guide
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                        <Activity className="w-3 h-3 mr-1" />
                                        Live
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={minimizeChat}
                                        className="h-8 w-8 p-0 hover:bg-blue-200"
                                    >
                                        <Minimize2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={closeChat}
                                        className="h-8 w-8 p-0 hover:bg-blue-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 h-[calc(100%-80px)]">
                            <RAGChatbot
                                className="h-full border-0 rounded-none"
                                defaultSessionType="portfolio_analysis"
                                defaultFocusArea="motor_vehicle_portfolio"
                                embedded={true}
                                showModeSelector={true}
                                autoDetectMode={true}
                            />
                        </CardContent>
                    </Card>

                    {/* Helper Text - Only show when first opened */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-blue-900">Your AI Support Guide</p>
                                <p className="text-blue-700 mt-1">
                                    Ask me anything about your portfolio, PCAF methodology, data quality improvements, or compliance requirements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Minimized Chat Window */}
            {isOpen && isMinimized && (
                <div className="fixed bottom-20 right-6 z-50 transform transition-all duration-300 ease-in-out">
                    <Card
                        className="w-64 shadow-lg border-2 border-blue-200 bg-white cursor-pointer hover:shadow-xl transition-shadow"
                        onClick={() => setIsMinimized(false)}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">AI Support Guide</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                        <Activity className="w-3 h-3 mr-1" />
                                        Live
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeChat();
                                        }}
                                        className="h-6 w-6 p-0 hover:bg-blue-200"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}