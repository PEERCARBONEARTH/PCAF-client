import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  FileText,
  Download,
  Share2,
  Calendar as CalendarIcon,
  TrendingUp,
  Leaf,
  Building2,
  DollarSign,
  Eye,
  Filter,
  RefreshCw
} from "lucide-react";

const ImpactReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('quarter');
  const [selectedReport, setSelectedReport] = useState<string>('comprehensive');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock impact data
  const impactMetrics = {
    totalInvestment: "$2.4M",
    co2Reduction: "1,247 tCO₂e",
    schoolsImpacted: 89,
    beneficiaries: 15420,
    avgReduction: "23%",
    complianceScore: 94
  };

  const reportTypes = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Impact Report',
      description: 'Full portfolio analysis including financial and environmental metrics',
      status: 'available',
      lastGenerated: '2024-01-15',
      pages: 24
    },
    {
      id: 'carbon',
      name: 'Carbon Impact Assessment',
      description: 'Detailed CO₂ reduction analysis and verification status',
      status: 'available',
      lastGenerated: '2024-01-14',
      pages: 12
    },
    {
      id: 'financial',
      name: 'Financial Performance Report',
      description: 'Investment performance, disbursement tracking, and ROI analysis',
      status: 'generating',
      lastGenerated: '2024-01-10',
      pages: 18
    },
    {
      id: 'compliance',
      name: 'Compliance & Risk Report',
      description: 'Regulatory compliance status and risk assessment',
      status: 'available',
      lastGenerated: '2024-01-12',
      pages: 16
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Q4 2023 Impact Summary',
      type: 'Quarterly',
      generated: '2024-01-15',
      status: 'completed',
      downloads: 24
    },
    {
      id: 2,
      name: 'Carbon Verification Report',
      type: 'Verification',
      generated: '2024-01-12',
      status: 'completed',
      downloads: 18
    },
    {
      id: 3,
      name: 'Monthly Portfolio Analysis',
      type: 'Monthly',
      generated: '2024-01-08',
      status: 'completed',
      downloads: 31
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'generating': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Impact Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage comprehensive impact reports for your portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Dashboard
          </Button>
          <Button className="flex items-center gap-2" onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Impact Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-finance" />
            <span className="text-sm font-medium">Total Investment</span>
          </div>
          <p className="text-2xl font-bold">{impactMetrics.totalInvestment}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">CO₂ Reduced</span>
          </div>
          <p className="text-2xl font-bold">{impactMetrics.co2Reduction}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Schools</span>
          </div>
          <p className="text-2xl font-bold">{impactMetrics.schoolsImpacted}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-info" />
            <span className="text-sm font-medium">Beneficiaries</span>
          </div>
          <p className="text-2xl font-bold">{impactMetrics.beneficiaries.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Avg Reduction</span>
          </div>
          <p className="text-2xl font-bold">{impactMetrics.avgReduction}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Compliance</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{impactMetrics.complianceScore}%</p>
            <Progress value={impactMetrics.complianceScore} className="h-1" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate New Report</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Custom Report</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <Label>Report Type</Label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="carbon">Carbon Impact</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Time Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPeriod === 'custom' && (
                <>
                  <div>
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </div>

            {isGenerating && (
              <Card className="p-4 mb-6 bg-muted/50">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Generating Report...</p>
                    <p className="text-sm text-muted-foreground">Processing data and creating comprehensive analysis</p>
                  </div>
                  <Progress value={60} className="w-24" />
                </div>
              </Card>
            )}

            <div className="flex gap-3">
              <Button onClick={handleGenerateReport} disabled={isGenerating} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((report) => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{report.name}</h3>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>Last generated: {report.lastGenerated}</span>
                  <span>{report.pages} pages</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{report.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Type: {report.type}</span>
                        <span>Generated: {report.generated}</span>
                        <span>Downloads: {report.downloads}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImpactReports;