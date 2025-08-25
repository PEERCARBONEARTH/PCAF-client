import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  History, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Eye, 
  Star, 
  Copy, 
  Trash2,
  BarChart3,
  Clock,
  User,
  Tag,
  ArrowUpDown,
  Plus,
  Settings,
  Brain
} from "lucide-react";

import { PCAFReportGenerator } from "@/lib/reportGenerator";

interface ReportHistory {
  id: string;
  name: string;
  type: string;
  format: string;
  createdAt: string;
  createdBy: string;
  size: string;
  status: 'completed' | 'failed' | 'processing';
  downloadCount: number;
  isFavorite: boolean;
  tags: string[];
  config: any;
  description?: string;
  methodologyNotes?: string;
}

export function ReportHistoryManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const reportHistory: ReportHistory[] = [
    {
      id: "rpt-pcaf-kenya-q2-2025",
      name: "PCAF Portfolio Summary - Kenya Pilot (Q2 2025)",
      type: "Portfolio Summary",
      format: "PDF",
      createdAt: new Date().toISOString(),
      createdBy: "Demo Agent",
      size: "2.6 MB",
      status: "completed",
      downloadCount: 4,
      isFavorite: true,
      tags: ["pcaf", "kenya", "pilot", "compliance"],
      config: { period: "Q2 2025" },
      description: "PCAF-aligned portfolio summary for the Kenya pilot",
      methodologyNotes:
        "PCAF motor vehicle loans; Option 2 where borrower fuel/usage unavailable; TTW basis; attribution = outstanding_balance ÷ vehicle_value_at_origination; EF v2025.1 (Kenya, gasoline/diesel mix); scope allocation per fuel type; weighted DQ score shown."
    },
    {
      id: "rpt-pcaf-loans-detail",
      name: "PCAF Loan-Level Detailed Report - Motor Vehicle Loans",
      type: "Detailed Analysis",
      format: "Excel",
      createdAt: new Date().toISOString(),
      createdBy: "Demo Agent",
      size: "3.1 MB",
      status: "completed",
      downloadCount: 2,
      isFavorite: false,
      tags: ["pcaf", "loan-level", "data-quality"],
      config: { period: "2025 YTD" },
      description: "Loan-level financed emissions with PCAF data quality flags",
      methodologyNotes:
        "Loan-level financed emissions using annual mileage × EF × attribution; Option 1 where telemetry present, else Option 2; economic intensity (tCO₂e/USD) and physical intensity (gCO₂e/km) included; data quality flags per PCAF v1.6."
    },
    {
      id: "rpt-001",
      name: "Q4 2024 Portfolio Summary",
      type: "Portfolio Summary",
      format: "PDF",
      createdAt: "2024-12-15T14:30:00Z",
      createdBy: "John Smith",
      size: "2.4 MB",
      status: "completed",
      downloadCount: 12,
      isFavorite: true,
      tags: ["quarterly", "board-presentation"],
      config: { period: "Q4 2024", aiEnabled: true },
      description: "Quarterly board presentation with AI insights"
    },
    {
      id: "rpt-002", 
      name: "Regulatory Filing - Annual 2024",
      type: "Regulatory Filing",
      format: "PDF",
      createdAt: "2024-12-10T09:15:00Z",
      createdBy: "Sarah Johnson",
      size: "5.7 MB",
      status: "completed",
      downloadCount: 8,
      isFavorite: false,
      tags: ["annual", "regulatory", "compliance"],
      config: { period: "2024", template: "regulatory-filing" },
      description: "Annual regulatory submission report"
    },
    {
      id: "rpt-003",
      name: "Detailed Analytics - November",
      type: "Detailed Analysis",
      format: "Excel",
      createdAt: "2024-11-30T16:45:00Z",
      createdBy: "Mike Chen",
      size: "8.2 MB",
      status: "completed",
      downloadCount: 15,
      isFavorite: true,
      tags: ["monthly", "analytics", "internal"],
      config: { period: "Nov 2024", includeLoansLevel: true },
      description: "Monthly internal analytics with loan-level data"
    },
    {
      id: "rpt-004",
      name: "Stakeholder Presentation",
      type: "Stakeholder Report",
      format: "PowerPoint",
      createdAt: "2024-11-28T11:20:00Z",
      createdBy: "Emily Davis",
      size: "12.1 MB",
      status: "completed",
      downloadCount: 6,
      isFavorite: false,
      tags: ["presentation", "stakeholders"],
      config: { template: "stakeholder-presentation" },
      description: "Investor relations presentation"
    },
    {
      id: "rpt-005",
      name: "October Portfolio Update",
      type: "Portfolio Summary",
      format: "PDF",
      createdAt: "2024-10-31T13:00:00Z",
      createdBy: "John Smith",
      size: "2.1 MB",
      status: "failed",
      downloadCount: 0,
      isFavorite: false,
      tags: ["monthly"],
      config: { period: "Oct 2024" },
      description: "Failed due to missing emission factors"
    }
  ];

  const schedules = [
    {
      id: "sch-001",
      name: "Monthly Portfolio Summary",
      frequency: "Monthly",
      nextRun: "2024-12-31T23:59:00Z",
      template: "Portfolio Summary",
      recipients: ["board@company.com", "risk@company.com"],
      isActive: true
    },
    {
      id: "sch-002",
      name: "Quarterly Regulatory Report",
      frequency: "Quarterly",
      nextRun: "2025-03-31T23:59:00Z", 
      template: "Regulatory Filing",
      recipients: ["compliance@company.com"],
      isActive: true
    }
  ];

  const filteredReports = reportHistory
    .filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === "all" || report.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "downloads": return b.downloadCount - a.downloadCount;
        default: return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'processing': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (report: ReportHistory) => {
    try {
      const data = await PCAFReportGenerator.generateReportData();
      const clientName = localStorage.getItem('clientName') || 'Kenya Pilot Bank (Demo)';
      (data as any).portfolioSummary.institutionName = clientName;
      if ((report as any).config?.period) {
        (data as any).portfolioSummary.reportingPeriod = (report as any).config.period;
      }
      if (report.format === 'Excel') {
        await PCAFReportGenerator.generateExcelReport(data);
      } else if (report.type === 'Detailed Analysis' && report.format === 'PDF') {
        await PCAFReportGenerator.generateDetailedLoansPDF(data);
      } else {
        await PCAFReportGenerator.generatePortfolioSummaryPDF(data);
      }
    } catch (e) {
      console.error('Failed to generate report', e);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Report Management
        </CardTitle>
        <CardDescription>
          View, manage, and schedule your PCAF reports
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search reports by name or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Portfolio Summary">Portfolio Summary</SelectItem>
                    <SelectItem value="Regulatory Filing">Regulatory Filing</SelectItem>
                    <SelectItem value="Detailed Analysis">Detailed Analysis</SelectItem>
                    <SelectItem value="Stakeholder Report">Stakeholder Report</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="downloads">Most Downloaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:bg-muted/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{report.name}</h4>
                          {report.isFavorite && (
                            <Star className="h-4 w-4 text-warning fill-warning" />
                          )}
                          <Badge variant="outline" className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.description || `${report.type} report in ${report.format} format`}
                        </p>
                        {report.methodologyNotes && (
                          <div className="mt-1 text-xs text-muted-foreground flex items-start gap-2">
                            <Brain className="h-3.5 w-3.5 mt-0.5" />
                            <span>{report.methodologyNotes}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(report.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {report.createdBy}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {report.size}
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {report.downloadCount} downloads
                          </div>
                        </div>

                        {report.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {report.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(report)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Star className={`h-4 w-4 ${report.isFavorite ? 'text-warning fill-warning' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Scheduled Reports</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Schedule
              </Button>
            </div>

            <div className="space-y-3">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{schedule.name}</h4>
                          <Badge variant={schedule.isActive ? "default" : "secondary"}>
                            {schedule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {schedule.frequency}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Next: {formatDate(schedule.nextRun)}
                            </div>
                          </div>
                          <div>
                            Recipients: {schedule.recipients.join(", ")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Report Templates</h3>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Monthly Summary", uses: 12, lastUsed: "2024-12-15" },
                { name: "Quarterly Board Report", uses: 4, lastUsed: "2024-12-10" },
                { name: "Annual Regulatory Filing", uses: 1, lastUsed: "2024-12-10" },
                { name: "Investor Presentation", uses: 3, lastUsed: "2024-11-28" }
              ].map((template, index) => (
                <Card key={index} className="hover:bg-muted/20 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-1">{template.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          <div>Used {template.uses} times</div>
                          <div>Last used: {formatDate(template.lastUsed + "T00:00:00Z")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}