import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Copy,
  Download
} from "lucide-react";
import { ClimateNarrative } from "@/services/climate-narrative-service";
import { useToast } from "@/hooks/use-toast";

interface DataNarrativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  narrative: ClimateNarrative | null;
}

export function DataNarrativeModal({ isOpen, onClose, narrative }: DataNarrativeModalProps) {
  const { toast } = useToast();

  if (!narrative) return null;

  const handleCopyNarrative = () => {
    const fullText = `
${narrative.title}

${narrative.contextualExplanation}

Portfolio Specifics:
${narrative.portfolioSpecifics}

Industry Comparison:
${narrative.industryComparison}

Key Takeaways:
${narrative.keyTakeaways.map(item => `• ${item}`).join('\n')}

Actionable Insights:
${narrative.actionableInsights.map(item => `• ${item}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(fullText);
    toast({
      title: "Copied to clipboard",
      description: "Narrative analysis has been copied to your clipboard.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {narrative.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityColor(narrative.priority)} className="flex items-center gap-1">
                {getPriorityIcon(narrative.priority)}
                {narrative.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {Math.round(narrative.confidence * 100)}% confidence
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analysis Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Contextual Explanation</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {narrative.contextualExplanation}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Portfolio Specifics</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {narrative.portfolioSpecifics}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Industry Comparison</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {narrative.industryComparison}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Takeaways */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {narrative.keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Actionable Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Actionable Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {narrative.actionableInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sources & Metadata */}
          {narrative.sources && narrative.sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Knowledge Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {narrative.sources.slice(0, 3).map((source, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/20">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">{source.question}</h5>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(source.relevanceScore * 100)}% match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {source.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Analysis Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Processing Time</div>
                  <div className="font-medium">{narrative.metadata.processingTime}ms</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Data Quality</div>
                  <div className="font-medium">{narrative.metadata.dataQuality.toFixed(1)}/5</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Context Relevance</div>
                  <div className="font-medium">{Math.round(narrative.metadata.contextRelevance * 100)}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Analysis Type</div>
                  <div className="font-medium capitalize">{narrative.dataType.replace('-', ' ')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Generated by AI • {new Date().toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyNarrative}>
                <Copy className="h-4 w-4 mr-1" />
                Copy Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}