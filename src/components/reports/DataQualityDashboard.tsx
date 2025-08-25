import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database, 
  TrendingUp, 
  FileWarning,
  ArrowRight,
  Target
} from "lucide-react";

interface DataQualityMetric {
  label: string;
  score: number;
  status: 'excellent' | 'good' | 'poor' | 'missing';
  details: string;
  impact: 'high' | 'medium' | 'low';
}

interface ValidationWarning {
  type: 'missing' | 'inconsistent' | 'outdated';
  message: string;
  affected: number;
  severity: 'critical' | 'warning' | 'info';
}

export function DataQualityDashboard() {
  const overallReadiness = 87;
  
  const qualityMetrics: DataQualityMetric[] = [
    { label: "Loan Portfolio Completeness", score: 95, status: 'excellent', details: "947/995 loans with complete data", impact: 'high' },
    { label: "Emission Factor Coverage", score: 82, status: 'good', details: "Current PCAF factors available", impact: 'high' },
    { label: "Attribution Data Quality", score: 76, status: 'good', details: "Vehicle type & year data", impact: 'medium' },
    { label: "Geographic Mapping", score: 91, status: 'excellent', details: "Postal codes validated", impact: 'medium' },
    { label: "Temporal Consistency", score: 65, status: 'poor', details: "Mixed reporting periods", impact: 'low' }
  ];

  const validationWarnings: ValidationWarning[] = [
    { type: 'missing', message: "48 loans missing vehicle year data", affected: 48, severity: 'warning' },
    { type: 'inconsistent', message: "12 loans with future origination dates", affected: 12, severity: 'critical' },
    { type: 'outdated', message: "Using 2023 emission factors for 2024 reporting", affected: 995, severity: 'info' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'missing': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-success/10 text-success border-success/20';
      case 'good': return 'bg-success/10 text-success border-success/20';
      case 'poor': return 'bg-warning/10 text-warning border-warning/20';
      case 'missing': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Readiness */}
      <Card className="card-featured">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Portfolio Report Readiness
          </CardTitle>
          <CardDescription>
            Data quality assessment for PCAF-compliant reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">{overallReadiness}%</span>
              <Badge variant={overallReadiness >= 90 ? "default" : overallReadiness >= 75 ? "secondary" : "destructive"}>
                {overallReadiness >= 90 ? "Ready" : overallReadiness >= 75 ? "Good" : "Needs Attention"}
              </Badge>
            </div>
            <Progress value={overallReadiness} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Your portfolio data meets PCAF standards for reliable financed emissions reporting
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {qualityMetrics.map((metric, index) => (
          <Card key={index} className="metric-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {getStatusIcon(metric.status)}
                <Badge variant="outline" className={`text-xs ${getStatusColor(metric.status)}`}>
                  {metric.score}%
                </Badge>
              </div>
              <h4 className="font-medium text-sm mb-1">{metric.label}</h4>
              <p className="text-xs text-muted-foreground mb-2">{metric.details}</p>
              <div className="flex items-center justify-between">
                <Progress value={metric.score} className="h-1 flex-1 mr-2" />
                <Badge variant="outline" className="text-xs">
                  {metric.impact} impact
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-warning" />
              Data Validation Alerts
            </CardTitle>
            <CardDescription>
              Issues that may affect report accuracy or compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationWarnings.map((warning, index) => (
                <Alert key={index} variant={warning.severity === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{warning.message}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({warning.affected} affected)
                      </span>
                    </div>
                    <Badge variant={getSeverityColor(warning.severity)} className="text-xs">
                      {warning.severity}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Improve Data Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Upload Emission Factors
              <ArrowRight className="h-3 w-3 ml-auto" />
            </Button>
            <Button variant="outline" className="justify-start" size="sm">
              <FileWarning className="h-4 w-4 mr-2" />
              Review Data Issues
              <ArrowRight className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}