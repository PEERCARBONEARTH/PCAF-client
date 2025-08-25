// Data Quality & Validation Dashboard for Phase 9
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  TrendingUp,
  FileCheck,
  AlertCircle,
  Zap,
  Award,
  BarChart3,
  Target,
  Wrench
} from 'lucide-react';
import { dataQualityValidationService } from '@/services/data-quality-validation-service';
import { useToast } from '@/hooks/use-toast';

export function DataQualityDashboard() {
  const [validationReport, setValidationReport] = useState<any>(null);
  const [cleansingResult, setCleansingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeProcess, setActiveProcess] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadValidationReport();
  }, []);

  const loadValidationReport = async () => {
    try {
      setLoading(true);
      const report = await dataQualityValidationService.validatePortfolio();
      setValidationReport(report);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load validation report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataCleansing = async () => {
    try {
      setActiveProcess('cleansing');
      setProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await dataQualityValidationService.cleanseAndStandardizeData();
      setCleansingResult(result);
      
      clearInterval(interval);
      setProgress(100);

      toast({
        title: "Data Cleansing Complete",
        description: `${result.cleaned} loans processed, ${result.fixed} issues fixed`,
      });

      // Reload validation report
      setTimeout(() => {
        setActiveProcess(null);
        setProgress(0);
        loadValidationReport();
      }, 2000);

    } catch (error) {
      setActiveProcess(null);
      setProgress(0);
      toast({
        title: "Cleansing Failed",
        description: "Data cleansing process failed",
        variant: "destructive",
      });
    }
  };

  const handleRevalidate = async () => {
    try {
      setActiveProcess('validation');
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      await loadValidationReport();
      
      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setActiveProcess(null);
        setProgress(0);
      }, 1000);

    } catch (error) {
      setActiveProcess(null);
      setProgress(0);
    }
  };

  const getValidationStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && !validationReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Quality & Validation</h2>
          <p className="text-muted-foreground">
            Comprehensive data quality assessment and PCAF compliance monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleDataCleansing} disabled={!!activeProcess}>
            {activeProcess === 'cleansing' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wrench className="h-4 w-4 mr-2" />
            )}
            Cleanse Data
          </Button>
          <Button onClick={handleRevalidate} disabled={!!activeProcess}>
            {activeProcess === 'validation' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Revalidate
          </Button>
          <Button variant="outline" onClick={() => { window.scrollTo(0,0); window.location.href = '/financed-emissions/methodology'; }}>
            Methodology
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {activeProcess && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {activeProcess === 'cleansing' ? 'Cleansing and standardizing data...' : 'Running validation checks...'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {validationReport && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(validationReport.overallScore)}`}>
                  {validationReport.overallScore}/100
                </div>
                <p className="text-xs text-muted-foreground">
                  Portfolio data quality rating
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{validationReport.totalLoans}</div>
                <p className="text-xs text-muted-foreground">
                  Loans in portfolio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PCAF Compliance</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(validationReport.pcafCompliance.compliantPercentage)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Option 1 & 2 compliance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Completeness</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(100 - validationReport.dataCompleteness.missingDataPercentage)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete records
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="validation">Validation Results</TabsTrigger>
              <TabsTrigger value="pcaf">PCAF Compliance</TabsTrigger>
              <TabsTrigger value="actions">Action Items</TabsTrigger>
              {cleansingResult && <TabsTrigger value="cleansing">Cleansing Results</TabsTrigger>}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>PCAF Option Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Option 1 (Highest Quality)</span>
                      <Badge variant="default">{validationReport.pcafCompliance.option1Count}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Option 2 (Medium Quality)</span>
                      <Badge variant="secondary">{validationReport.pcafCompliance.option2Count}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Option 3 (Lowest Quality)</span>
                      <Badge variant="outline">{validationReport.pcafCompliance.option3Count}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Key Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {validationReport.recommendations.map((rec: string, index: number) => (
                          <Alert key={index}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{rec}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Validation Results Tab */}
            <TabsContent value="validation">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Issues</CardTitle>
                  <CardDescription>
                    Detailed breakdown of data validation results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Loan ID</TableHead>
                        <TableHead>Rule</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Current Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationReport.validationResults.slice(0, 10).map((result: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getValidationStatusIcon(result.status)}
                              <span className="capitalize">{result.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{result.loanId}</TableCell>
                          <TableCell>{result.ruleId}</TableCell>
                          <TableCell className="text-xs">{result.message}</TableCell>
                          <TableCell className="text-xs">
                            {typeof result.currentValue === 'object' 
                              ? JSON.stringify(result.currentValue).slice(0, 50) + '...'
                              : String(result.currentValue)
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {validationReport.validationResults.length > 10 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing 10 of {validationReport.validationResults.length} validation results
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PCAF Compliance Tab */}
            <TabsContent value="pcaf">
              <Card>
                <CardHeader>
                  <CardTitle>PCAF Compliance Analysis</CardTitle>
                  <CardDescription>
                    Partnership for Carbon Accounting Financials data quality assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Average Data Quality Score</Label>
                      <div className="text-2xl font-bold">
                        {validationReport.pcafCompliance.averageDataQualityScore.toFixed(1)}/5.0
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Compliant Loans</Label>
                      <div className="text-2xl font-bold">
                        {Math.round(validationReport.pcafCompliance.compliantPercentage)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Total Assessment</Label>
                      <div className="text-2xl font-bold">
                        {validationReport.totalLoans} loans
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription>
                      PCAF Option 1 and 2 loans are considered compliant with high data quality standards.
                      Option 3 loans should be improved to meet PCAF recommendations.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Data Sources → PCAF Mapping</Label>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data Source</TableHead>
                          <TableHead>Mapped PCAF Option</TableHead>
                          <TableHead>Defense</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Fuel cards (measured liters)</TableCell>
                          <TableCell><Badge variant="default">1a</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">Primary measured consumption tied to vehicle/driver; receipts or API logs.</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Telematics/OBD (actual distance)</TableCell>
                          <TableCell><Badge variant="default">1b</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">Device-sourced odometer/GPX validating distance; efficiency from make/model.</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Odometer photos (periodic)</TableCell>
                          <TableCell><Badge variant="secondary">1b</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">Borrower attestation + image EXIF; sampling with reasonableness checks.</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>VIN/OEM specs + local stats</TableCell>
                          <TableCell><Badge variant="secondary">2a</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">Specific efficiency + local distance datasets (e.g., city registry or surveys).</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>VIN/OEM specs + regional stats</TableCell>
                          <TableCell><Badge variant="secondary">2b</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">Specific efficiency + regional averages when local not available.</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>CSV upload with type only</TableCell>
                          <TableCell><Badge variant="outline">3a</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">Type/category averages + statistical distance; defend with source citations.</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Minimal data (no type/distance)</TableCell>
                          <TableCell><Badge variant="outline">3b</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">Average assumptions with conservative defaults and improvement plan.</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Action Items Tab */}
            <TabsContent value="actions">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>
                    Prioritized action items to improve data quality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {validationReport.actionItems.map((action: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant={getPriorityColor(action.priority) as any}>
                                  {action.priority} priority
                                </Badge>
                                <Badge variant="outline">{action.category}</Badge>
                              </div>
                              <h4 className="font-medium">{action.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                Affected loans: {action.affectedLoans} | Impact: {action.estimatedImpact}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              <Zap className="h-4 w-4 mr-2" />
                              Address
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cleansing Results Tab */}
            {cleansingResult && (
              <TabsContent value="cleansing">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Cleansing Results</CardTitle>
                    <CardDescription>
                      Summary of data standardization and correction actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Processed</Label>
                        <div className="text-2xl font-bold">{cleansingResult.processed}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Cleaned</Label>
                        <div className="text-2xl font-bold text-green-600">{cleansingResult.cleaned}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Fixed</Label>
                        <div className="text-2xl font-bold text-blue-600">{cleansingResult.fixed}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Errors</Label>
                        <div className="text-2xl font-bold text-red-600">{cleansingResult.errors}</div>
                      </div>
                    </div>

                    {cleansingResult.details.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Cleansing Actions</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Loan ID</TableHead>
                              <TableHead>Field</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Before</TableHead>
                              <TableHead>After</TableHead>
                              <TableHead>Confidence</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cleansingResult.details.slice(0, 10).map((detail: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-mono text-xs">{detail.loanId}</TableCell>
                                <TableCell>{detail.field}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{detail.action}</Badge>
                                </TableCell>
                                <TableCell className="text-xs">{String(detail.before)}</TableCell>
                                <TableCell className="text-xs">{String(detail.after)}</TableCell>
                                <TableCell>
                                  <Badge variant={detail.confidence > 0.9 ? "default" : "secondary"}>
                                    {Math.round(detail.confidence * 100)}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}