import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  TrendingUp, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Settings
} from 'lucide-react';

interface LoanLedgerRecommendationsProps {
  totalLoans: number;
  lmsConnected: boolean;
  dataFreshness: 'fresh' | 'stale' | 'critical';
  avgDataQuality: number;
  onConfigureLMS: () => void;
  onSyncData: () => void;
  onImproveQuality: () => void;
}

export function LoanLedgerRecommendations({
  totalLoans,
  lmsConnected,
  dataFreshness,
  avgDataQuality,
  onConfigureLMS,
  onSyncData,
  onImproveQuality
}: LoanLedgerRecommendationsProps) {
  const recommendations = [];

  // LMS Integration Recommendation
  if (!lmsConnected) {
    recommendations.push({
      id: 'lms-integration',
      priority: 'high',
      title: 'Connect Your Loan Management System',
      description: 'Automate data synchronization to ensure your portfolio is always up-to-date with real-time loan information.',
      impact: 'Eliminates manual data entry and reduces errors by 95%',
      action: 'Set Up LMS Integration',
      onClick: onConfigureLMS,
      icon: <Database className="h-5 w-5 text-blue-500" />
    });
  }

  // Data Freshness Recommendation
  if (lmsConnected && dataFreshness !== 'fresh') {
    recommendations.push({
      id: 'sync-data',
      priority: dataFreshness === 'critical' ? 'high' : 'medium',
      title: 'Sync Your Data',
      description: 'Your loan data appears to be outdated. Sync with your LMS to get the latest information.',
      impact: `Updates ${totalLoans} loans with current balances and payment status`,
      action: 'Sync Now',
      onClick: onSyncData,
      icon: <RefreshCw className="h-5 w-5 text-orange-500" />
    });
  }

  // Data Quality Recommendation
  if (avgDataQuality > 3.0) {
    recommendations.push({
      id: 'improve-quality',
      priority: 'medium',
      title: 'Improve Data Quality Score',
      description: 'Your portfolio has a PCAF data quality score above 3.0. Collect more detailed vehicle information to improve compliance.',
      impact: 'Achieves PCAF Box 8 compliance and improves emission accuracy',
      action: 'View Quality Guide',
      onClick: onImproveQuality,
      icon: <TrendingUp className="h-5 w-5 text-green-500" />
    });
  }

  // Portfolio Size Recommendation
  if (totalLoans === 0) {
    recommendations.push({
      id: 'add-loans',
      priority: 'high',
      title: 'Add Your First Loans',
      description: 'Start building your financed emissions portfolio by uploading loan data or connecting your LMS.',
      impact: 'Begin tracking and managing your climate-related financial risks',
      action: 'Upload Data',
      onClick: () => window.location.href = '/financed-emissions/upload',
      icon: <Lightbulb className="h-5 w-5 text-purple-500" />
    });
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
      default:
        return null;
    }
  };

  if (recommendations.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Portfolio Optimized</div>
              <div className="text-sm">Your loan ledger is well-configured and up-to-date.</div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex items-start gap-4 p-4 border rounded-sm hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {rec.icon}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  {getPriorityBadge(rec.priority)}
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 font-medium">Impact:</span>
                  <span className="text-muted-foreground">{rec.impact}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={rec.onClick}
                className="flex items-center gap-2"
              >
                {rec.action}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}