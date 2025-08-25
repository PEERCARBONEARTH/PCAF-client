import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useDealPipeline } from '@/contexts/DealPipelineContext';
import { useToast } from '@/hooks/use-toast';
import { platformRAGService } from '@/services/platform-rag-service';
import { AIAssistantPanel } from '@/components/enhanced/AIAssistantPanel';
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  TrendingUp,
  Globe,
  Clock,
  FileSpreadsheet,
  Mail,
  Settings,
  Bot,
  Brain
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'impact' | 'executive' | 'compliance';
  format: 'PDF' | 'Excel' | 'Both';
  icon: React.ComponentType<any>;
  estimatedSize: string;
  generateTime: string;
}

export function ReportGenerationCenter() {
  const { portfolioProjects, portfolioStats } = usePortfolio();
  const { pipelineProjects } = useDealPipeline();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [generatingReports, setGeneratingReports] = useState<string[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'portfolio-summary',
      name: 'Portfolio Performance Summary',
      description: 'Comprehensive overview of portfolio metrics, project performance, and key insights',
      type: 'executive',
      format: 'PDF',
      icon: TrendingUp,
      estimatedSize: '2.1 MB',
      generateTime: '30 seconds'
    },
    {
      id: 'impact-report',
      name: 'Impact Measurement Report',
      description: 'Detailed analysis of climate impact, CO₂ reduction, and beneficiary metrics',
      type: 'impact',
      format: 'Both',
      icon: Globe,
      estimatedSize: '3.4 MB',
      generateTime: '45 seconds'
    },
    {
      id: 'financial-dashboard',
      name: 'Financial Performance Dashboard',
      description: 'Investment flows, disbursements, ROI analysis, and financial KPIs',
      type: 'financial',
      format: 'Excel',
      icon: FileSpreadsheet,
      estimatedSize: '1.8 MB',
      generateTime: '25 seconds'
    },
    {
      id: 'investor-update',
      name: 'Investor Update Package',
      description: 'Executive summary, highlights, challenges, and forward-looking statements',
      type: 'executive',
      format: 'PDF',
      icon: Users,
      estimatedSize: '1.5 MB',
      generateTime: '20 seconds'
    },
    {
      id: 'compliance-report',
      name: 'ESG Compliance Report',
      description: 'Regulatory compliance, ESG metrics, and sustainability reporting standards',
      type: 'compliance',
      format: 'Both',
      icon: FileText,
      estimatedSize: '4.2 MB',
      generateTime: '60 seconds'
    }
  ];

const recentReports: {
  name: string;
  type: string;
  generated: string;
  downloads: number;
  size: string;
  methodologyNotes?: string;
}[] = [
  {
    name: 'PCAF Portfolio Summary - Kenya Pilot (Q2 2025)',
    type: 'Compliance',
    generated: 'just now',
    downloads: 4,
    size: '2.6 MB',
    methodologyNotes:
      'PCAF motor vehicle loans; Option 2 where borrower fuel/usage unavailable; TTW basis; attribution = outstanding_balance ÷ vehicle_value_at_origination; EF v2025.1 (Kenya, gasoline/diesel mix); scope allocation per fuel type; weighted DQ score shown in report.'
  },
  {
    name: 'PCAF Loan-Level Detailed Report - Motor Vehicle Loans',
    type: 'Compliance',
    generated: 'just now',
    downloads: 2,
    size: '3.1 MB',
    methodologyNotes:
      'Loan-level financed emissions using annual mileage × EF × attribution; Option 1 where telemetry present, else Option 2; economic intensity (tCO₂e/USD) and physical intensity (gCO₂e/km) included; data quality flags per PCAF v1.6.'
  },
  {
    name: 'Q3 2024 Portfolio Summary',
    type: 'Executive',
    generated: '2 hours ago',
    downloads: 12,
    size: '2.1 MB'
  },
  {
    name: 'October Impact Analysis',
    type: 'Impact',
    generated: '1 day ago',
    downloads: 8,
    size: '3.4 MB'
  },
  {
    name: 'Financial Dashboard - YTD',
    type: 'Financial',
    generated: '3 days ago',
    downloads: 15,
    size: '1.8 MB'
  }
];

  const generateReport = async (templateId: string) => {
    setGeneratingReports([...generatingReports, templateId]);
    
    try {
      // Generate AI-powered report narrative
      const template = reportTemplates.find(t => t.id === templateId);
      if (template) {
        const narrative = await platformRAGService.generateReportNarrative(
          template.type as any,
          portfolioSummaryData
        );
        
        // Simulate report generation with AI narrative
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "AI-Enhanced Report Generated",
          description: `${template.name} with AI narrative has been generated successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the report.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReports(generatingReports.filter(id => id !== templateId));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'executive': return 'primary';
      case 'financial': return 'success';
      case 'impact': return 'warning';
      case 'compliance': return 'secondary';
      default: return 'outline';
    }
  };

  const portfolioSummaryData = {
    totalProjects: portfolioProjects.length,
    pipelineProjects: pipelineProjects.length,
    totalInvested: portfolioStats.totalInvested,
    totalDisbursed: portfolioStats.totalDisbursed,
    lastUpdated: new Date().toLocaleDateString()
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Generation Center</h2>
          <p className="text-muted-foreground">Generate comprehensive reports from your portfolio data</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Portfolio Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Portfolio Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{portfolioSummaryData.totalProjects}</div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{portfolioSummaryData.pipelineProjects}</div>
              <p className="text-sm text-muted-foreground">Pipeline Projects</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(portfolioSummaryData.totalInvested / 1000000).toFixed(1)}M
              </div>
              <p className="text-sm text-muted-foreground">Total Invested</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${(portfolioSummaryData.totalDisbursed / 1000000).toFixed(1)}M
              </div>
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Real-time</div>
              <p className="text-sm text-muted-foreground">Data Currency</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Report Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate reports using real-time data from your portfolio
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                const isGenerating = generatingReports.includes(template.id);
                
                return (
                  <div key={template.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {template.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{template.format}</span>
                          <span>•</span>
                          <span>{template.estimatedSize}</span>
                          <span>•</span>
                          <span>~{template.generateTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => generateReport(template.id)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{report.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{report.type}</Badge>
                      <span>•</span>
                      <span>{report.generated}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{report.size}</span>
                      <span>•</span>
                      <span>{report.downloads} downloads</span>
                    </div>
                    {report.methodologyNotes && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-start gap-2">
                        <Brain className="w-3.5 h-3.5 mt-0.5" />
                        <span>{report.methodologyNotes}</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Report Calendar
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Template Builder
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAIAssistant && (
        <div className="mt-6">
          <AIAssistantPanel 
            context={portfolioSummaryData}
            defaultAgent="reporting"
          />
        </div>
      )}
    </div>
  );
}