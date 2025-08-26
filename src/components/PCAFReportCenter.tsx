import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PCAFReportGenerator } from "@/lib/reportGenerator";
import { AIAssistantPanel } from "@/components/enhanced/AIAssistantPanel";
import { platformRAGService } from "@/services/platform-rag-service";
import { clientRAGService } from "@/services/client-rag-service";
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  Building2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Settings,
  Eye,
  Brain,
  Sparkles
} from "lucide-react";

interface ReportConfig {
  institutionName: string;
  reportingPeriod: string;
  includeMethodology: boolean;
  includeBranding: boolean;
  customNotes: string;
  includeAINarratives: boolean;
  aiNarrativeType: 'standard' | 'detailed' | 'executive';
}

export function PCAFReportCenter() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ReportConfig>({
    institutionName: '',
    reportingPeriod: '2024',
    includeMethodology: true,
    includeBranding: true,
    customNotes: '',
    includeAINarratives: true,
    aiNarrativeType: 'standard'
  });
  
  const [generating, setGenerating] = useState<string | null>(null);
  const [reportStats, setReportStats] = useState<any>(null);
  const [aiNarratives, setAiNarratives] = useState<any>(null);

  const generateAINarratives = async (reportData: any) => {
    if (!config.includeAINarratives) return null;

    try {
      // Generate AI-powered narratives using dual RAG system
      const platformNarrative = await platformRAGService.generateReportNarrative(
        'portfolio-summary',
        {
          ...reportData,
          reportType: 'PCAF Scope 3 Category 15 Financed Emissions',
          institutionName: config.institutionName,
          reportingPeriod: config.reportingPeriod
        }
      );

      // Get client-specific context integration
      const clientContext = await clientRAGService.getClientContext('pcaf-financed-emissions');

      return {
        platformNarrative,
        clientContext,
        enhancedSections: platformNarrative.sections.map(section => ({
          ...section,
          clientSpecific: clientContext.customNarratives.find(n => 
            n.section === section.title.toLowerCase().replace(/\s+/g, '-')
          )?.content
        }))
      };
    } catch (error) {
      console.error('Failed to generate AI narratives:', error);
      return null;
    }
  };

  const generatePortfolioSummary = async () => {
    setGenerating('portfolio');
    try {
      const reportData = await PCAFReportGenerator.generateReportData();
      
      // Update report data with config
      reportData.portfolioSummary.institutionName = config.institutionName;
      reportData.portfolioSummary.reportingPeriod = config.reportingPeriod;
      
      // Generate AI narratives if enabled
      const narratives = await generateAINarratives(reportData);
      setAiNarratives(narratives);
      
      await PCAFReportGenerator.generatePortfolioSummaryPDF(reportData);
      
      setReportStats({
        totalLoans: reportData.loans.length,
        totalEmissions: reportData.portfolioSummary.totalFinancedEmissions,
        dataQuality: reportData.portfolioSummary.weightedAvgDataQuality,
        compliance: reportData.portfolioSummary.pcafCompliantLoans / reportData.portfolioSummary.totalLoans
      });

      toast({
        title: "Portfolio Summary Generated",
        description: "PCAF-compliant portfolio summary PDF has been downloaded.",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate portfolio summary.",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateDetailedReport = async () => {
    setGenerating('detailed');
    try {
      const reportData = await PCAFReportGenerator.generateReportData();
      reportData.portfolioSummary.institutionName = config.institutionName;
      reportData.portfolioSummary.reportingPeriod = config.reportingPeriod;
      
      await PCAFReportGenerator.generateDetailedLoansPDF(reportData);

      toast({
        title: "Detailed Report Generated",
        description: "Detailed loan-level emissions report PDF has been downloaded.",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate detailed report.",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateExcelReport = async () => {
    setGenerating('excel');
    try {
      const reportData = await PCAFReportGenerator.generateReportData();
      reportData.portfolioSummary.institutionName = config.institutionName;
      reportData.portfolioSummary.reportingPeriod = config.reportingPeriod;
      
      await PCAFReportGenerator.generateExcelReport(reportData);

      toast({
        title: "Excel Report Generated",
        description: "Complete PCAF data export with multiple worksheets has been downloaded.",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate Excel report.",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    };
  };

  const generateAllReports = async () => {
    setGenerating('all');
    try {
      const reportData = await PCAFReportGenerator.generateReportData();
      reportData.portfolioSummary.institutionName = config.institutionName;
      reportData.portfolioSummary.reportingPeriod = config.reportingPeriod;
      
      // Generate all reports sequentially
      await PCAFReportGenerator.generatePortfolioSummaryPDF(reportData);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
      
      await PCAFReportGenerator.generateDetailedLoansPDF(reportData);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await PCAFReportGenerator.generateExcelReport(reportData);

      setReportStats({
        totalLoans: reportData.loans.length,
        totalEmissions: reportData.portfolioSummary.totalFinancedEmissions,
        dataQuality: reportData.portfolioSummary.weightedAvgDataQuality,
        compliance: reportData.portfolioSummary.pcafCompliantLoans / reportData.portfolioSummary.totalLoans
      });

      toast({
        title: "All Reports Generated",
        description: "Complete PCAF report package (PDF Summary, Detailed PDF, Excel) has been downloaded.",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate reports.",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            PCAF Report Center
            <Badge variant="outline" className="ml-2">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </CardTitle>
          <CardDescription>
            Generate PCAF-compliant financed emissions reports with AI-powered narratives and dual RAG intelligence
          </CardDescription>
        </CardHeader>
      </Card>

      {/* AI Assistant Panel for PCAF Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                PCAF AI Assistant
              </CardTitle>
              <CardDescription>
                Get intelligent help with PCAF methodology, calculations, and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIAssistantPanel 
                context={{
                  reportType: 'PCAF Scope 3 Category 15 Financed Emissions',
                  institutionName: config.institutionName,
                  reportingPeriod: config.reportingPeriod,
                  methodology: 'PCAF Standard 2.0 Motor Vehicle Loans'
                }}
                defaultAgent="reporting"
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          {/* AI Narratives Preview */}
          {aiNarratives && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>Enhanced Narrative:</strong>
                  <p className="text-muted-foreground mt-1">
                    {aiNarratives.platformNarrative?.narrative?.substring(0, 150)}...
                  </p>
                </div>
                <div className="text-sm">
                  <strong>Key Sections:</strong>
                  <ul className="text-muted-foreground text-xs mt-1 space-y-1">
                    {aiNarratives.enhancedSections?.slice(0, 3).map((section: any, idx: number) => (
                      <li key={idx}>• {section.title}</li>
                    ))}
                  </ul>
                </div>
                <Badge variant="outline" className="text-xs">
                  Platform + Client RAG
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Customize your reports with institution details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                placeholder="Enter your institution name"
                value={config.institutionName}
                onChange={(e) => setConfig(prev => ({ ...prev, institutionName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="reportingPeriod">Reporting Period</Label>
              <Input
                id="reportingPeriod"
                placeholder="2024"
                value={config.reportingPeriod}
                onChange={(e) => setConfig(prev => ({ ...prev, reportingPeriod: e.target.value }))}
              />
            </div>
          </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customNotes">Custom Notes (Optional)</Label>
                <Textarea
                  id="customNotes"
                  placeholder="Add any additional notes or context for the reports..."
                  value={config.customNotes}
                  onChange={(e) => setConfig(prev => ({ ...prev, customNotes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* AI Enhancement Options */}
              <div className="p-4 border rounded-sm bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">AI Enhancement Settings</Label>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeAINarratives"
                      checked={config.includeAINarratives}
                      onChange={(e) => setConfig(prev => ({ ...prev, includeAINarratives: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="includeAINarratives" className="text-sm">
                      Include AI-generated narratives and explanations
                    </Label>
                  </div>

                  {config.includeAINarratives && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-xs text-muted-foreground">Narrative Style:</Label>
                      <div className="flex gap-2">
                        {['standard', 'detailed', 'executive'].map((type) => (
                          <Button
                            key={type}
                            variant={config.aiNarrativeType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setConfig(prev => ({ ...prev, aiNarrativeType: type as any }))}
                            className="text-xs"
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Report Generation Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Summary Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Portfolio Summary Report
            </CardTitle>
            <CardDescription>
              Executive summary with key metrics and PCAF compliance status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Portfolio-level metrics</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Data quality assessment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>PCAF methodology documentation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Emission breakdowns by category</span>
            </div>
            
            <Button 
              onClick={generatePortfolioSummary}
              disabled={!!generating}
              className="w-full"
            >
              {generating === 'portfolio' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Portfolio Summary PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Detailed Loan Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Detailed Loan Report
            </CardTitle>
            <CardDescription>
              Comprehensive loan-level emissions data with calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Individual loan calculations</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Attribution factors</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Data quality scores</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Verification status</span>
            </div>
            
            <Button 
              onClick={generateDetailedReport}
              disabled={!!generating}
              variant="outline"
              className="w-full"
            >
              {generating === 'detailed' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Detailed PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Excel Export and Complete Package */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Excel Data Export
            </CardTitle>
            <CardDescription>
              Complete dataset with multiple worksheets for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Portfolio summary worksheet</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Complete loan data</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>PCAF methodology reference</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Ready for further analysis</span>
            </div>
            
            <Button 
              onClick={generateExcelReport}
              disabled={!!generating}
              variant="outline"
              className="w-full"
            >
              {generating === 'excel' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Generate Excel Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              Complete Report Package
            </CardTitle>
            <CardDescription>
              Generate all reports at once for comprehensive documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended for regulatory reporting:</strong> Includes portfolio summary, 
                detailed analysis, and raw data in multiple formats.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={generateAllReports}
              disabled={!!generating}
              className="w-full"
              size="lg"
            >
              {generating === 'all' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating All Reports...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Complete Package
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Statistics */}
      {reportStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Last Generated Report Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{reportStats.totalLoans}</div>
                <div className="text-sm text-muted-foreground">Total Loans</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{reportStats.totalEmissions.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">tCO₂e Financed</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{reportStats.dataQuality.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Data Quality</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{(reportStats.compliance * 100).toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">PCAF Compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PCAF Compliance Notice */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>PCAF Standard 2.0 Compliant:</strong> All reports follow Partnership for Carbon 
          Accounting Financials methodology for Category 15 (Motor Vehicle Loans) financed emissions. 
          Reports include data quality assessments and compliance indicators required for regulatory disclosure.
        </AlertDescription>
      </Alert>
    </div>
  );
}