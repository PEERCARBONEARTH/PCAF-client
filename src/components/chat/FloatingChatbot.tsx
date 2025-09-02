import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    MessageCircle,
    X,
    Activity,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { RAGChatbot } from "@/components/rag/RAGChatbot";

interface FloatingChatbotProps {
    className?: string;
}

export function FloatingChatbot({ className = "" }: FloatingChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleChat = () => {
        if (isOpen && !isCollapsed) {
            setIsCollapsed(true);
        } else if (isOpen && isCollapsed) {
            setIsCollapsed(false);
        } else {
            setIsOpen(true);
            setIsCollapsed(false);
        }
    };

    const closeChat = () => {
        setIsOpen(false);
        setIsCollapsed(false);
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <Button
                    onClick={toggleChat}
                    className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 ${className}`}
                    size="icon"
                >
                    <MessageCircle className="h-6 w-6 text-primary-foreground" />
                </Button>
            )}

            {/* Floating Chat Window - Expanded */}
            {isOpen && !isCollapsed && (
                <div className="fixed bottom-6 right-6 z-50 w-[500px] h-[500px] transform transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-4 slide-in-from-right-4">
                    <Card className="h-full shadow-2xl border bg-background dark:bg-background">
                        <CardHeader className="pb-3 bg-muted/50 dark:bg-muted/50 border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MessageCircle className="h-5 w-5" />
                                    AI Support Guide
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                        <Activity className="w-3 h-3 mr-1" />
                                        Live
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleChat}
                                        className="h-8 w-8 p-0"
                                        title="Collapse"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={closeChat}
                                        className="h-8 w-8 p-0"
                                        title="Close"
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
                </div>
            )}

            {/* Collapsed Chat Window */}
            {isOpen && isCollapsed && (
                <div className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 ease-in-out">
                    <Card
                        className="w-80 shadow-lg border bg-background dark:bg-background cursor-pointer hover:shadow-xl transition-shadow"
                        onClick={toggleChat}
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">AI Support Guide</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                        <Activity className="w-3 h-3 mr-1" />
                                        Live
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleChat}
                                        className="h-6 w-6 p-0"
                                        title="Expand"
                                    >
                                        <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            closeChat();
                                        }}
                                        className="h-6 w-6 p-0"
                                        title="Close"
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