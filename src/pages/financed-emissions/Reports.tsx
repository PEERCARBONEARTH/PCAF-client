import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataQualityDashboard } from "@/components/reports/DataQualityDashboard";
import { ReportConfigurationWizard } from "@/components/reports/ReportConfigurationWizard";
import { ReportGenerationProgress } from "@/components/reports/ReportGenerationProgress";
import { ReportHistoryManager } from "@/components/reports/ReportHistoryManager";
import { ReportTemplatePreview } from "@/components/reports/ReportTemplatePreview";
import { PCAFReportGenerator } from "@/lib/reportGenerator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Settings, 
  History, 
  BarChart3, 
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Layout,
  Plus
} from "lucide-react";

export default function ReportsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [reportConfig, setReportConfig] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Handle navigation from template selection
  useEffect(() => {
    if (location.state?.selectedTemplate) {
      setSelectedTemplate(location.state.selectedTemplate);
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }
    }
  }, [location.state]);

  const handleGenerateReport = async (config: any) => {
    setIsGenerating(true);
    try {
      const reportData = await PCAFReportGenerator.generateReportData();
      // Apply configuration to report data
      (reportData as any).config = config;
      
      toast({
        title: "Report Generation Started",
        description: "Your enhanced PCAF report is being generated with AI insights.",
      });
    } catch (error) {
      toast({
        title: "Generation Error",
        description: "Failed to start report generation. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = (result: any) => {
    setIsGenerating(false);
    if (result.success) {
      toast({
        title: "Report Generated Successfully",
        description: `Generated ${result.generatedFiles.length} files in ${result.totalTime}s.`,
      });
      setActiveTab("history");
    } else {
      toast({
        title: "Generation Failed",
        description: result.error || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Glass Morphism Coming Soon Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-md">
        <div className="relative max-w-md mx-4">
          {/* Glass morphism card */}
          <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold text-foreground">
                PCAF Reports
              </h2>
              
              {/* Message */}
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">
                  Coming Soon
                </p>
                <p className="text-sm text-muted-foreground">
                  Awaiting accreditation
                </p>
              </div>
              
              {/* Additional info */}
              <div className="pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Professional PCAF-compliant reporting will be available once our accreditation process is complete.
                </p>
              </div>
              
              {/* Back button */}
              <Button 
                onClick={() => navigate('/financed-emissions')}
                variant="outline"
                className="mt-6 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-xl -z-10"></div>
        </div>
      </div>

      {/* Original content (blurred in background) */}
      <div className="blur-sm pointer-events-none">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Enhanced PCAF Reports
              <div className="flex items-center gap-1 ml-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-normal text-muted-foreground">AI-Powered</span>
              </div>
            </CardTitle>
            <CardDescription>
              Generate comprehensive PCAF-compliant financed emissions reports with intelligent insights, 
              progressive configuration, and collaborative workflows
            </CardDescription>
          </CardHeader>
        </Card>

      {/* Generation Progress Overlay */}
      {isGenerating && (
        <ReportGenerationProgress 
          isGenerating={isGenerating}
          onComplete={handleGenerationComplete}
          onCancel={() => setIsGenerating(false)}
        />
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Generate</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden md:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Get Started - Left */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Get started
                  </CardTitle>
                  <CardDescription>Follow these steps to create your report</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal ml-4 space-y-2 text-sm text-muted-foreground">
                    <li>Select or upload a template</li>
                    <li>Configure options and data scope</li>
                    <li>Generate and review your report</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions Sidebar */}
            <div className="space-y-4">
              <Card className="card-editorial">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button 
                    onClick={() => navigate('/financed-emissions/reports/templates')}
                    className="w-full p-3 text-left rounded-sm border border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layout className="h-4 w-4 text-primary" />
                      <span className="font-medium">Select Template</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Choose from expert-designed templates</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab("generate")}
                    className="w-full p-3 text-left rounded-sm border border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Plus className="h-4 w-4 text-primary" />
                      <span className="font-medium">Generate Report</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure and generate your report
                    </p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab("history")}
                    className="w-full p-3 text-left rounded-sm border border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <History className="h-4 w-4 text-primary" />
                      <span className="font-medium">Recent Reports</span>
                    </div>
                    <p className="text-xs text-muted-foreground">View and manage existing reports</p>
                  </button>
                  
                  <button 
                    onClick={() => navigate('/financed-emissions/ai-insights')}
                    className="w-full p-3 text-left rounded-sm border border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Open AI Insights for drafting help</p>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          {selectedTemplate ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <selectedTemplate.icon className="h-5 w-5" />
                        <span>{selectedTemplate.name}</span>
                      </CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setPreviewOpen(true)}
                    >
                      Preview Template
                    </Button>
                  </div>
                </CardHeader>
              </Card>
              <ReportConfigurationWizard 
                onConfigUpdate={setReportConfig}
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Template Selected</CardTitle>
                <CardDescription>
                  Start by selecting, creating, or uploading a report template.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const newTemplate: any = {
                      id: `upload-${Date.now()}`,
                      name: file.name.replace(/\.(docx|pdf)$/i, ''),
                      description: `Uploaded ${file.type || 'document'} (${Math.round(file.size / 1024)} KB)`,
                      type: 'Uploaded',
                      format: file.name.split('.').pop()?.toUpperCase(),
                      icon: FileText
                    };
                    setSelectedTemplate(newTemplate);
                    setPreviewOpen(true);
                    toast({
                      title: 'Template Uploaded',
                      description: `${file.name} is ready. You can now configure and generate your report.`,
                    });
                  }}
                />
                <Button onClick={() => navigate('/financed-emissions/reports/templates')}>
                  Select Report Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const name = window.prompt('Name your new template');
                    if (!name) return;
                    const newTemplate: any = {
                      id: `custom-${Date.now()}`,
                      name,
                      description: 'Custom template created by you',
                      type: 'Custom',
                      format: 'DOCX/PDF',
                      icon: FileText
                    };
                    setSelectedTemplate(newTemplate);
                    toast({
                      title: 'Template Created',
                      description: `"${name}" is ready. You can now configure and generate your report.`,
                    });
                  }}
                >
                  Create New Template
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <DataQualityDashboard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-editorial">
              <CardHeader>
                <CardTitle>Report Analytics</CardTitle>
                <CardDescription>
                  Insights into your reporting patterns and data quality trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-editorial">
              <CardHeader>
                <CardTitle>Data Quality Trends</CardTitle>
                <CardDescription>
                  Track improvements in your portfolio data over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Trend analysis coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ReportHistoryManager />
        </TabsContent>
        </Tabs>
        {selectedTemplate && (
          <ReportTemplatePreview
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            template={{
              id: (selectedTemplate as any).id,
              name: (selectedTemplate as any).name,
              description: (selectedTemplate as any).description,
              type: (selectedTemplate as any).type,
              format: (selectedTemplate as any).format,
              icon: (selectedTemplate as any).icon || FileText,
              estimatedTime: "5–10 min",
              audience: "Investors and Sustainability Team",
              preview: "PCAF-aligned report",
              sections: [],
              features: ["PCAF compliant", "Data quality insights", "AI drafting"],
            } as any}
            onUseTemplate={() => setPreviewOpen(false)}
            onEditPresentation={() => setPreviewOpen(false)}
            autoSuggestOnOpen={(selectedTemplate as any)?.type === 'Uploaded'}
          />
        )}
      </div>
    </div>
  );
}