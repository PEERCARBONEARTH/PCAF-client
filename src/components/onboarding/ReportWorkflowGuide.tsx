import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Settings, Share, CheckCircle, TrendingUp, Download } from 'lucide-react';

interface ReportWorkflowGuideProps {
  stepId: string;
}

export function ReportWorkflowGuide({ stepId }: ReportWorkflowGuideProps) {
  const renderReportTemplatesContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold">PCAF Report Templates</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from pre-configured report templates designed to meet various PCAF 
          disclosure requirements and stakeholder needs.
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              PCAF Standard Report
              <Badge variant="secondary" className="ml-auto">Recommended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Comprehensive report following PCAF methodology requirements
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm mb-2">Includes:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Total financed emissions by asset class</li>
                  <li>• Data quality score breakdown</li>
                  <li>• Attribution methodology details</li>
                  <li>• Year-over-year comparison</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-sm mb-2">Best for:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Regulatory compliance</li>
                  <li>• Annual sustainability reports</li>
                  <li>• TCFD disclosures</li>
                  <li>• Investor communications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                High-level overview for senior leadership
              </p>
              <div className="space-y-1">
                <p className="text-xs font-medium">Key metrics only</p>
                <p className="text-xs font-medium">Visual dashboards</p>
                <p className="text-xs font-medium">Trend analysis</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Detailed methodology and calculation breakdowns
              </p>
              <div className="space-y-1">
                <p className="text-xs font-medium">Calculation methods</p>
                <p className="text-xs font-medium">Data sources</p>
                <p className="text-xs font-medium">Quality assessments</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Quality Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Specialized report highlighting data quality improvements and recommendations
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded">
                <p className="font-medium text-sm">Quality Scores</p>
                <p className="text-xs text-muted-foreground">Current vs target</p>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <p className="font-medium text-sm">Improvements</p>
                <p className="text-xs text-muted-foreground">Action recommendations</p>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <p className="font-medium text-sm">Progress</p>
                <p className="text-xs text-muted-foreground">Historical trends</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportWorkflowContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold">Generate Your First PCAF Report</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Step-by-step walkthrough of the report generation process, from configuration 
          to final distribution.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            step: 1,
            title: "Configure Report Settings",
            description: "Select template, date range, and output preferences",
            details: [
              "Choose report template (PCAF Standard recommended)",
              "Set reporting period (e.g., 2024 fiscal year)",
              "Select output format (PDF, Excel, or both)",
              "Configure branding and organization details"
            ],
            icon: Settings,
            color: "bg-blue-500"
          },
          {
            step: 2,
            title: "Data Quality Review",
            description: "Review and validate your portfolio data quality",
            details: [
              "Check data completeness and quality scores",
              "Review any validation warnings or errors",
              "Update missing data if needed",
              "Confirm calculation parameters"
            ],
            icon: CheckCircle,
            color: "bg-green-500"
          },
          {
            step: 3,
            title: "Generate Report",
            description: "Process calculations and create the final report",
            details: [
              "AI-enhanced narrative generation",
              "Automated chart and table creation",
              "PCAF methodology compliance checks",
              "Quality assurance validation"
            ],
            icon: FileText,
            color: "bg-purple-500"
          },
          {
            step: 4,
            title: "Review & Distribute",
            description: "Review final report and share with stakeholders",
            details: [
              "Preview report before finalizing",
              "Download in preferred formats",
              "Schedule automatic updates",
              "Share with team members or external parties"
            ],
            icon: Share,
            color: "bg-orange-500"
          }
        ].map((item) => (
          <Card key={item.step}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4" />
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.description}
                  </p>
                  <ul className="space-y-1">
                    {item.details.map((detail, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">AI-Enhanced Reporting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Our AI system automatically generates professional narratives and insights for your reports:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm mb-2">Automated Content:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Executive summary generation</li>
                  <li>• Trend analysis and insights</li>
                  <li>• Data quality explanations</li>
                  <li>• Improvement recommendations</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-sm mb-2">Smart Features:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Context-aware explanations</li>
                  <li>• Industry benchmarking</li>
                  <li>• Regulatory compliance notes</li>
                  <li>• Custom branding integration</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ready to Generate Your Report?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you have uploaded your portfolio data, you can navigate to the Reports section 
            to start generating your first PCAF-compliant financed emissions report.
          </p>
          <Button className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Go to Report Generation
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  switch (stepId) {
    case 'report-templates':
      return renderReportTemplatesContent();
    case 'report-workflow':
      return renderReportWorkflowContent();
    default:
      return <div>Step content not found</div>;
  }
}