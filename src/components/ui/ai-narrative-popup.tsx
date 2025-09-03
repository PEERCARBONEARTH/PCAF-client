import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  ExternalLink,
  X,
  Brain
} from 'lucide-react';
import { ContextualNarrative } from '@/services/contextual-narrative-service';

interface AINavigationPopupProps {
  narrative?: ContextualNarrative;
  trigger?: React.ReactNode;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'default' | 'lg';
  popupWidth?: string;
  className?: string;
  disabled?: boolean;
}

export function AINavigationPopup({ 
  narrative,
  trigger,
  buttonText = "What does this mean?",
  buttonVariant = "outline",
  buttonSize = "sm",
  popupWidth = "w-96",
  className = "",
  disabled = false
}: AINavigationPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Calculate optimal popup position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Default to bottom, but adjust if there's not enough space
      let newPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
      
      // Check if there's enough space below
      if (triggerRect.bottom + 400 > viewportHeight) {
        // Not enough space below, try above
        if (triggerRect.top - 400 > 0) {
          newPosition = 'top';
        } else {
          // Not enough space above or below, try sides
          if (triggerRect.right + 400 < viewportWidth) {
            newPosition = 'right';
          } else if (triggerRect.left - 400 > 0) {
            newPosition = 'left';
          } else {
            // Force bottom with scroll if needed
            newPosition = 'bottom';
          }
        }
      }
      
      setPosition(newPosition);
    }
  }, [isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const getPositionClasses = () => {
    const baseClasses = "absolute z-50 bg-card border border-border rounded-lg shadow-xl";
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-full mt-2 left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} right-full mr-2 top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-full ml-2 top-1/2 transform -translate-y-1/2`;
      default:
        return `${baseClasses} top-full mt-2 left-1/2 transform -translate-x-1/2`;
    }
  };

  const getAnimationClasses = () => {
    switch (position) {
      case 'top':
        return 'animate-in slide-in-from-bottom-2 fade-in-0';
      case 'bottom':
        return 'animate-in slide-in-from-top-2 fade-in-0';
      case 'left':
        return 'animate-in slide-in-from-right-2 fade-in-0';
      case 'right':
        return 'animate-in slide-in-from-left-2 fade-in-0';
      default:
        return 'animate-in slide-in-from-top-2 fade-in-0';
    }
  };

  if (!narrative) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <Button
          ref={triggerRef}
          variant={buttonVariant}
          size={buttonSize}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="justify-between"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {buttonText}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Popup Content */}
      {isOpen && (
        <div 
          ref={popupRef}
          className={`${getPositionClasses()} ${popupWidth} ${getAnimationClasses()}`}
          style={{ maxHeight: '80vh', overflowY: 'auto' }}
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">AI Analysis</h4>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {Math.round(narrative.confidence * 100)}% confidence
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-4">
              <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Summary
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">{narrative.summary}</p>
            </div>

            {/* Detailed explanation */}
            <div className="mb-4">
              <h5 className="font-medium text-sm text-foreground mb-2">Detailed Explanation</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {narrative.explanation}
              </p>
            </div>

            {/* Implications */}
            {narrative.implications.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Key Implications
                </h5>
                <ul className="space-y-2">
                  {narrative.implications.map((implication, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      {implication}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actionable insights */}
            {narrative.actionableInsights.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Recommended Actions
                </h5>
                <ul className="space-y-2">
                  {narrative.actionableInsights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Methodology */}
            {narrative.methodology && (
              <div className="mb-4">
                <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Methodology
                </h5>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {narrative.methodology}
                </p>
              </div>
            )}

            {/* Sources */}
            {narrative.sources.length > 0 && (
              <div className="pt-3 border-t border-border/50">
                <h5 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-purple-500" />
                  Sources
                </h5>
                <div className="flex flex-wrap gap-1">
                  {narrative.sources.map((source, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AINavigationPopup;