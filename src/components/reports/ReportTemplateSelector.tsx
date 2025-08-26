import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  BarChart3, 
  Presentation,
  FileSpreadsheet,
  Eye,
  Download,
  Clock,
  Users,
  Building2,
  TrendingUp,
  Shield,
  Target,
  Sparkles
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'regulatory' | 'stakeholder' | 'internal' | 'executive';
  format: 'pdf' | 'excel' | 'powerpoint';
  icon: any;
  estimatedTime: string;
  sections: string[];
  audience: string;
  preview: string;
  features: string[];
  recommended?: boolean;
}

export function ReportTemplateSelector({ onTemplateSelect }: { onTemplateSelect: (template: ReportTemplate) => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const templates: ReportTemplate[] = [
    {
      id: 'regulatory-filing',
      name: 'Regulatory Filing Report',
      description: 'Comprehensive PCAF-compliant report for regulatory submissions',
      type: 'regulatory',
      format: 'pdf',
      icon: Shield,
      estimatedTime: '8-12 minutes',
      audience: 'Financial regulators, compliance teams',
      preview: 'Detailed portfolio emissions with full methodology disclosure, data quality scores, and PCAF compliance verification',
      sections: [
        'Executive Summary',
        'Portfolio Overview',
        'Emission Calculations',
        'Data Quality Assessment',
        'Methodology Documentation',
        'Compliance Statements',
        'Appendices'
      ],
      features: [
        'Full PCAF compliance',
        'Detailed methodology',
        'Data quality scores',
        'Regulatory annexes'
      ],
      recommended: true
    },
    {
      id: 'stakeholder-presentation',
      name: 'Stakeholder Presentation',
      description: 'Executive summary for board presentations and investor relations',
      type: 'stakeholder',
      format: 'powerpoint',
      icon: Presentation,
      estimatedTime: '5-8 minutes',
      audience: 'Board members, investors, senior management',
      preview: 'High-level portfolio insights with visual charts, key trends, and strategic implications for climate risk management',
      sections: [
        'Key Metrics Dashboard',
        'Emission Trends',
        'Portfolio Breakdown',
        'Climate Risk Insights',
        'Next Steps'
      ],
      features: [
        'Visual dashboards',
        'Executive summary',
        'Trend analysis',
        'Strategic insights'
      ]
    },
    {
      id: 'detailed-analysis',
      name: 'Detailed Analytics Report',
      description: 'In-depth analysis for risk management and portfolio optimization',
      type: 'internal',
      format: 'pdf',
      icon: BarChart3,
      estimatedTime: '6-10 minutes',
      audience: 'Risk managers, portfolio analysts, sustainability teams',
      preview: 'Comprehensive analysis including loan-level data, attribution factors, geographic breakdowns, and optimization recommendations',
      sections: [
        'Portfolio Analytics',
        'Loan-Level Analysis',
        'Geographic Distribution',
        'Attribution Analysis',
        'Risk Assessment',
        'Optimization Opportunities'
      ],
      features: [
        'Loan-level detail',
        'Attribution analysis',
        'Geographic insights',
        'Risk metrics'
      ]
    },
    {
      id: 'excel-dataset',
      name: 'Data Export Package',
      description: 'Complete dataset for further analysis and modeling',
      type: 'internal',
      format: 'excel',
      icon: FileSpreadsheet,
      estimatedTime: '3-5 minutes',
      audience: 'Data analysts, modelers, technical teams',
      preview: 'Raw and calculated data across multiple worksheets with loan details, emissions, factors, and quality scores',
      sections: [
        'Loan Portfolio Data',
        'Emission Calculations',
        'Attribution Factors',
        'Data Quality Scores',
        'Methodology Notes'
      ],
      features: [
        'Raw data export',
        'Multiple worksheets',
        'Calculation details',
        'Quality metrics'
      ]
    }
  ];

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template.id);
    onTemplateSelect(template);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'regulatory': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'stakeholder': return 'bg-primary/10 text-primary border-primary/20';
      case 'internal': return 'bg-success/10 text-success border-success/20';
      case 'executive': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Templates
          </CardTitle>
          <CardDescription>
            Choose a template based on your audience and requirements
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => {
          const TemplateIcon = template.icon;
          const isSelected = selectedTemplate === template.id;
          const isPreview = showPreview === template.id;

          return (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
              } ${template.recommended ? 'card-featured' : 'card-editorial'}`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-sm bg-primary/10">
                      <TemplateIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {template.recommended && (
                          <Badge variant="default" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className={getTypeColor(template.type)}>
                    {template.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.format.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedTime}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Target Audience
                    </h4>
                    <p className="text-sm">{template.audience}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Features</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {template.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isPreview && (
                    <div className="p-3 bg-muted/30 rounded-sm border-l-2 border-primary">
                      <h4 className="text-sm font-medium mb-1">Preview</h4>
                      <p className="text-xs text-muted-foreground">{template.preview}</p>
                      <div className="mt-2">
                        <h5 className="text-xs font-medium mb-1">Sections included:</h5>
                        <div className="grid grid-cols-2 gap-1">
                          {template.sections.slice(0, 6).map((section, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              • {section}
                            </div>
                          ))}
                          {template.sections.length > 6 && (
                            <div className="text-xs text-muted-foreground">
                              • +{template.sections.length - 6} more...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreview(isPreview ? null : template.id);
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {isPreview ? 'Hide' : 'Preview'}
                    </Button>
                    
                    {isSelected && (
                      <Button size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Generate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTemplate && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  Selected: {templates.find(t => t.id === selectedTemplate)?.name}
                </span>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Proceed to Generation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}