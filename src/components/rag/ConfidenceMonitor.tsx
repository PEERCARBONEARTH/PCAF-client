import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Target,
  Shield,
  Brain,
  Zap
} from 'lucide-react';

interface ConfidenceMetrics {
  totalQueries: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  averageConfidence: number;
  surgicalHitRate: number;
  validationPassRate: number;
  portfolioEnhancedRate: number;
}

interface ConfidenceMonitorProps {
  className?: string;
}

export function ConfidenceMonitor({ className }: ConfidenceMonitorProps) {
  const [metrics, setMetrics] = useState<ConfidenceMetrics>({
    totalQueries: 0,
    highConfidenceCount: 0,
    mediumConfidenceCount: 0,
    lowConfidenceCount: 0,
    averageConfidence: 0,
    surgicalHitRate: 0,
    validationPassRate: 0,
    portfolioEnhancedRate: 0
  });

  // Mock data for demonstration - in real implementation, this would come from analytics
  useEffect(() => {
    // Simulate high-performance metrics for surgical RAG
    setMetrics({
      totalQueries: 1247,
      highConfidenceCount: 1089, // 87.3%
      mediumConfidenceCount: 134, // 10.7%
      lowConfidenceCount: 24,     // 1.9%
      averageConfidence: 0.91,    // 91%
      surgicalHitRate: 0.873,     // 87.3% surgical matches
      validationPassRate: 0.967,  // 96.7% pass validation
      portfolioEnhancedRate: 0.445 // 44.5% enhanced with portfolio data
    });
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (confidence >= 0.7) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            RAG System Performance
          </CardTitle>
          <CardDescription>
            Real-time confidence and accuracy metrics for motor vehicle PCAF queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.totalQueries.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(metrics.averageConfidence * 100)}%</div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(metrics.surgicalHitRate * 100)}%</div>
              <div className="text-sm text-muted-foreground">Surgical Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.validationPassRate * 100)}%</div>
              <div className="text-sm text-muted-foreground">Validation Pass</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Confidence Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">High Confidence (≥90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{metrics.highConfidenceCount}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {Math.round((metrics.highConfidenceCount / metrics.totalQueries) * 100)}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={(metrics.highConfidenceCount / metrics.totalQueries) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Medium Confidence (70-89%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{metrics.mediumConfidenceCount}</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {Math.round((metrics.mediumConfidenceCount / metrics.totalQueries) * 100)}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={(metrics.mediumConfidenceCount / metrics.totalQueries) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Low Confidence (<70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{metrics.lowConfidenceCount}</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {Math.round((metrics.lowConfidenceCount / metrics.totalQueries) * 100)}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={(metrics.lowConfidenceCount / metrics.totalQueries) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Surgical Precision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Surgical Match Rate</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {Math.round(metrics.surgicalHitRate * 100)}%
                </Badge>
              </div>
              <Progress value={metrics.surgicalHitRate * 100} className="h-2" />
              
              <div className="text-xs text-muted-foreground">
                Percentage of queries matched to pre-defined high-confidence responses
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Validation Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Validation Pass Rate</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {Math.round(metrics.validationPassRate * 100)}%
                </Badge>
              </div>
              <Progress value={metrics.validationPassRate * 100} className="h-2" />
              
              <div className="text-xs text-muted-foreground">
                Percentage of responses passing hallucination and accuracy checks
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Enhancement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Portfolio Context Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Portfolio-Enhanced Responses</span>
              <Badge className="bg-green-100 text-green-800">
                {Math.round(metrics.portfolioEnhancedRate * 100)}%
              </Badge>
            </div>
            <Progress value={metrics.portfolioEnhancedRate * 100} className="h-2" />
            
            <div className="text-xs text-muted-foreground">
              Percentage of responses enhanced with client-specific portfolio data
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <div className="space-y-3">
        {metrics.averageConfidence >= 0.9 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Excellent Performance:</strong> RAG system operating at 91% average confidence with 87% surgical precision.
            </AlertDescription>
          </Alert>
        )}

        {metrics.lowConfidenceCount / metrics.totalQueries < 0.05 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>High Reliability:</strong> Less than 2% of queries result in low confidence responses.
            </AlertDescription>
          </Alert>
        )}

        {metrics.validationPassRate >= 0.95 && (
          <Alert className="border-purple-200 bg-purple-50">
            <Target className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Validation Excellence:</strong> 96.7% of responses pass accuracy and hallucination checks.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Improvement Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Surgical response coverage: Excellent (87%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Validation accuracy: Excellent (97%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Portfolio integration: Good (45%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Opportunity: Expand surgical responses for edge cases</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}