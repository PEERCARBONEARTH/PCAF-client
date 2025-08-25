import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Users, 
  Building, 
  TrendingUp, 
  Shield, 
  Globe,
  ChevronLeft,
  Search,
  Filter,
  Eye,
  ArrowRight
} from "lucide-react";
import ReportTemplatePreview, { PreviewReportTemplate as ReportTemplatePreviewType } from "@/components/reports/ReportTemplatePreview";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  format: string;
  icon: any;
  estimatedTime: string;
  audience: string;
  preview: string;
  sections: string[];
  features: string[];
  complexity: "Simple" | "Standard" | "Advanced";
  compliance: string[];
}


const templates: ReportTemplate[] = [
  {
    id: "regulatory-filing",
    name: "Regulatory Filing Report",
    description: "Comprehensive PCAF-compliant report for regulatory submissions and compliance documentation.",
    type: "Regulatory",
    format: "PDF, Excel",
    icon: Shield,
    estimatedTime: "15-20 minutes",
    audience: "Regulators, Compliance Teams",
    preview: "Detailed methodology section, comprehensive data tables, audit trail documentation",
    sections: ["Executive Summary", "Methodology", "Portfolio Analysis", "Data Quality Assessment", "Compliance Statement", "Appendices"],
    features: ["PCAF Standard 2.0 Compliance", "Audit Trail", "Data Lineage", "Quality Assurance", "Regulatory Footnotes"],
    complexity: "Advanced",
    compliance: ["PCAF Standard 2.0", "TCFD", "EU Taxonomy"]
  },
  {
    id: "stakeholder-presentation",
    name: "Stakeholder Presentation",
    description: "Executive-level presentation focusing on key insights and strategic implications for stakeholders.",
    type: "Executive",
    format: "PowerPoint, PDF",
    icon: Users,
    estimatedTime: "8-12 minutes",
    audience: "Board Members, Investors, Executive Team",
    preview: "Visual dashboard summaries, trend analysis charts, strategic recommendations",
    sections: ["Executive Dashboard", "Key Findings", "Trend Analysis", "Strategic Insights", "Action Items", "Appendix"],
    features: ["Visual Charts", "Executive Summary", "Trend Analysis", "Strategic Recommendations", "Action Planning"],
    complexity: "Standard",
    compliance: ["TCFD", "SASB"]
  },
  {
    id: "portfolio-deep-dive",
    name: "Portfolio Deep Dive Analysis",
    description: "Comprehensive analysis of portfolio emissions with detailed breakdowns and improvement opportunities.",
    type: "Analytical",
    format: "PDF, Excel, Interactive",
    icon: TrendingUp,
    estimatedTime: "12-18 minutes",
    audience: "Portfolio Managers, Risk Teams, Sustainability Officers",
    preview: "Detailed portfolio breakdown, sector analysis, improvement recommendations",
    sections: ["Portfolio Overview", "Sector Analysis", "Emission Hotspots", "Data Quality Review", "Improvement Opportunities", "Action Plan"],
    features: ["Interactive Charts", "Drill-down Analysis", "Benchmark Comparison", "Improvement Roadmap", "ROI Analysis"],
    complexity: "Advanced",
    compliance: ["PCAF Standard 2.0", "SBTi"]
  },
  {
    id: "public-disclosure",
    name: "Public Disclosure Report",
    description: "Investor-ready report for public disclosure and sustainability reporting requirements.",
    type: "Public",
    format: "PDF, HTML",
    icon: Globe,
    estimatedTime: "10-15 minutes",
    audience: "Investors, Public, Rating Agencies",
    preview: "Executive summary, methodology overview, key metrics, forward-looking statements",
    sections: ["Executive Summary", "Methodology Overview", "Key Metrics", "Progress Tracking", "Forward-Looking Statements", "Governance"],
    features: ["Public-Ready Language", "Visual Infographics", "Progress Tracking", "Future Commitments", "Governance Information"],
    complexity: "Standard",
    compliance: ["TCFD", "GRI", "SASB"]
  },
  {
    id: "portfolio-deep-analysis",
    name: "Portfolio Deep Analysis",
    description: "Deep portfolio diagnostics with hotspots, benchmarking, and action roadmap.",
    type: "Analytical",
    format: "PDF, PowerPoint",
    icon: TrendingUp,
    estimatedTime: "10-15 minutes",
    audience: "Portfolio Managers, Risk & Sustainability Teams",
    preview: "Hotspots and drivers, peer benchmarking, and an actionable decarbonization plan.",
    sections: [
      "Executive Snapshot",
      "Portfolio Breakdown",
      "Emission Hotspots",
      "Drivers & Attribution",
      "Peer Benchmarking",
      "Opportunities & ROI",
      "Action Roadmap"
    ],
    features: [
      "Drill-down charts",
      "Benchmark comparison",
      "Attribution analysis",
      "Improvement roadmap"
    ],
    complexity: "Advanced",
    compliance: ["PCAF Standard 2.0", "SBTi"]
  },
  {
    id: "quarterly-update",
    name: "Quarterly Performance Update",
    description: "Quick quarterly snapshot for internal tracking and regular stakeholder updates.",
    type: "Internal",
    format: "PDF, Dashboard",
    icon: FileText,
    estimatedTime: "5-8 minutes",
    audience: "Internal Teams, Management",
    preview: "Key metrics summary, quarterly trends, action items, upcoming priorities",
    sections: ["Executive Summary", "Key Metrics", "Quarterly Trends", "Action Items", "Next Quarter Priorities"],
    features: ["Quick Generation", "Trend Comparison", "Action Tracking", "Performance Alerts", "Simple Language"],
    complexity: "Simple",
    compliance: ["Internal Standards"]
  },
  {
    id: "client-report",
    name: "Client Portfolio Report",
    description: "Client-facing report showing portfolio performance and sustainability metrics for specific clients.",
    type: "Client",
    format: "PDF, Interactive Dashboard",
    icon: Building,
    estimatedTime: "10-12 minutes",
    audience: "Clients, Account Managers",
    preview: "Client-specific metrics, portfolio performance, recommendations, next steps",
    sections: ["Client Portfolio Overview", "Performance Metrics", "Sustainability Analysis", "Recommendations", "Next Steps"],
    features: ["Client Branding", "Personalized Insights", "Performance Benchmarks", "Actionable Recommendations", "Meeting Ready"],
    complexity: "Standard",
    compliance: ["Client Requirements", "PCAF Standard 2.0"]
  }
];

export default function ReportTemplates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterComplexity, setFilterComplexity] = useState<string>("all");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || template.type === filterType;
    const matchesComplexity = filterComplexity === "all" || template.complexity === filterComplexity;
    
    return matchesSearch && matchesType && matchesComplexity;
  });

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
  };

  const handleContinueToConfiguration = () => {
    if (selectedTemplate) {
      // Navigate to reports page with selected template
      navigate('/financed-emissions/reports', { 
        state: { selectedTemplate, activeTab: 'generate' }
      });
    }
  };


  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Simple": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Standard": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Advanced": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Regulatory": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Executive": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Analytical": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Public": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Internal": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Client": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/financed-emissions/reports')}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Reports</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Select Report Template</h1>
                <p className="text-muted-foreground">Choose a template that best fits your reporting needs</p>
              </div>
            </div>
            {selectedTemplate && (
              <Button onClick={handleContinueToConfiguration} className="flex items-center space-x-2">
                <span>Continue with {selectedTemplate.name}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Regulatory">Regulatory</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
              <SelectItem value="Analytical">Analytical</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Internal">Internal</SelectItem>
              <SelectItem value="Client">Client</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterComplexity} onValueChange={setFilterComplexity}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Complexity</SelectItem>
              <SelectItem value="Simple">Simple</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate?.id === template.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-muted-foreground/50'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <template.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.audience}</CardDescription>
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getTypeColor(template.type)}>{template.type}</Badge>
                    <Badge className={getComplexityColor(template.complexity)}>{template.complexity}</Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Estimated Time:</strong> {template.estimatedTime}</p>
                    <p><strong>Format:</strong> {template.format}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Sections:</h4>
                    <div className="text-xs text-muted-foreground">
                      {template.sections.slice(0, 3).map((section, index) => (
                        <span key={section}>
                          {section}
                          {index < Math.min(template.sections.length - 1, 2) && " • "}
                        </span>
                      ))}
                      {template.sections.length > 3 && (
                        <span> • +{template.sections.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Features:</h4>
                    <div className="text-xs text-muted-foreground">
                      {template.features.slice(0, 2).map((feature, index) => (
                        <span key={feature}>
                          {feature}
                          {index < Math.min(template.features.length - 1, 1) && " • "}
                        </span>
                      ))}
                      {template.features.length > 2 && (
                        <span> • +{template.features.length - 2} more</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center space-x-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      {template.compliance.length} compliance standards
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No templates match your current filters.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
                setFilterComplexity("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {previewTemplate && (
        <ReportTemplatePreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          template={previewTemplate as ReportTemplatePreviewType}
          onUseTemplate={() => {
            setPreviewOpen(false);
            navigate('/financed-emissions/reports', { state: { selectedTemplate: previewTemplate, activeTab: 'generate' } });
          }}
          onEditPresentation={() => {
            setPreviewOpen(false);
            navigate('/financed-emissions/reports/presentation/portfolio-deep-analysis');
          }}
        />
      )}
    </div>
  );
}