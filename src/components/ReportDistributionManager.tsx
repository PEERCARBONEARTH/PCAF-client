import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  FileText, 
  Download, 
  Send, 
  Clock, 
  Calendar as CalendarIcon,
  Share2,
  Settings,
  Users,
  Mail,
  Link,
  Filter,
  RefreshCw,
  CheckCircle,
  Eye,
  Pause,
  Play,
  Copy,
  Archive
} from "lucide-react";

interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  reportType: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: {
    emails: string[];
    groups: string[];
    webhooks: string[];
  };
  format: "pdf" | "excel" | "csv" | "json";
  filters: Record<string, any>;
  lastRun?: string;
  nextRun: string;
  status: "active" | "paused" | "error";
  deliveryCount: number;
  errorCount: number;
}

interface ReportExport {
  id: string;
  name: string;
  reportType: string;
  format: "pdf" | "excel" | "csv" | "json" | "powerbi" | "tableau";
  size: string;
  createdAt: string;
  downloadCount: number;
  status: "generating" | "ready" | "expired" | "error";
  shareLink?: string;
  expiresAt?: string;
  customizations: {
    includeLogo: boolean;
    includeCharts: boolean;
    includeRawData: boolean;
    customStyling?: string;
  };
}

interface ShareableLink {
  id: string;
  reportId: string;
  reportName: string;
  linkType: "view" | "download" | "embed";
  url: string;
  accessLevel: "public" | "restricted" | "password";
  password?: string;
  expiresAt?: string;
  viewCount: number;
  lastAccessed?: string;
  allowedDomains: string[];
  downloadEnabled: boolean;
}

interface ReportDistributionManagerProps {
  schedules: ReportSchedule[];
  exports: ReportExport[];
  shareableLinks: ShareableLink[];
  onCreateSchedule: (schedule: Omit<ReportSchedule, 'id' | 'deliveryCount' | 'errorCount'>) => void;
  onUpdateSchedule: (scheduleId: string, updates: Partial<ReportSchedule>) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onRunSchedule: (scheduleId: string) => Promise<void>;
  onCreateExport: (exportConfig: Omit<ReportExport, 'id' | 'size' | 'createdAt' | 'downloadCount' | 'status'>) => Promise<void>;
  onDownloadExport: (exportId: string) => void;
  onCreateShareLink: (linkConfig: Omit<ShareableLink, 'id' | 'url' | 'viewCount'>) => void;
  onRevokeShareLink: (linkId: string) => void;
}

export function ReportDistributionManager({ schedules, exports, shareableLinks, onCreateSchedule, onUpdateSchedule, onDeleteSchedule, onRunSchedule, onCreateExport, onDownloadExport, onCreateShareLink, onRevokeShareLink }: ReportDistributionManagerProps) {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    description: "",
    reportType: "",
    frequency: "weekly" as const,
    time: "09:00",
    timezone: "UTC",
    recipients: { emails: [], groups: [], webhooks: [] },
    format: "pdf" as const,
    filters: {},
    nextRun: "",
    status: "active" as const
  });
  const [newExport, setNewExport] = useState({
    name: "",
    reportType: "",
    format: "pdf" as const,
    customizations: {
      includeLogo: true,
      includeCharts: true,
      includeRawData: false
    }
  });
  const [newShareLink, setNewShareLink] = useState({
    reportId: "",
    reportName: "",
    linkType: "view" as const,
    accessLevel: "restricted" as "public" | "restricted" | "password",
    password: "",
    expiresAt: "",
    allowedDomains: [],
    downloadEnabled: true,
    lastAccessed: ""
  });
  const [processingStates, setProcessingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.reportType) return;
    
    onCreateSchedule({
      ...newSchedule,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    });
    
    setNewSchedule({
      name: "",
      description: "",
      reportType: "",
      frequency: "weekly",
      time: "09:00",
      timezone: "UTC",
      recipients: { emails: [], groups: [], webhooks: [] },
      format: "pdf",
      filters: {},
      nextRun: "",
      status: "active"
    });
    setShowScheduleDialog(false);
    
    toast({
      title: "Schedule Created",
      description: "Report schedule created and will run automatically.",
    });
  };

  const handleCreateExport = async () => {
    if (!newExport.name || !newExport.reportType) return;
    
    setProcessingStates(prev => ({ ...prev, export: true }));
    try {
      await onCreateExport(newExport);
      
      setNewExport({
        name: "",
        reportType: "",
        format: "pdf",
        customizations: {
          includeLogo: true,
          includeCharts: true,
          includeRawData: false
        }
      });
      setShowExportDialog(false);
      
      toast({
        title: "Export Started",
        description: "Report export is being generated. You'll be notified when ready.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to create export. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingStates(prev => ({ ...prev, export: false }));
    }
  };

  const handleCreateShareLink = () => {
    if (!newShareLink.reportId) return;
    
    onCreateShareLink(newShareLink);
    
    setNewShareLink({
      reportId: "",
      reportName: "",
      linkType: "view",
      accessLevel: "restricted",
      password: "",
      expiresAt: "",
      allowedDomains: [],
      downloadEnabled: true,
      lastAccessed: ""
    });
    setShowShareDialog(false);
    
    toast({
      title: "Share Link Created",
      description: "Shareable link has been generated and is ready to use.",
    });
  };

  const handleRunSchedule = async (scheduleId: string) => {
    setProcessingStates(prev => ({ ...prev, [scheduleId]: true }));
    try {
      await onRunSchedule(scheduleId);
      toast({
        title: "Schedule Executed",
        description: "Report has been generated and distributed to recipients.",
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "Unable to run scheduled report. Please check configuration.",
        variant: "destructive",
      });
    } finally {
      setProcessingStates(prev => ({ ...prev, [scheduleId]: false }));
    }
  };

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": case "ready": return <CheckCircle className="h-4 w-4 text-success" />;
      case "generating": return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case "paused": return <Pause className="h-4 w-4 text-muted-foreground" />;
      case "error": case "expired": return <Archive className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf": return <FileText className="h-4 w-4 text-red-500" />;
      case "excel": return <FileText className="h-4 w-4 text-green-500" />;
      case "csv": return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const activeSchedules = schedules.filter(s => s.status === "active");
  const readyExports = exports.filter(e => e.status === "ready");
  const activeLinks = shareableLinks.filter(l => !l.expiresAt || new Date(l.expiresAt) > new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Report Distribution Center</h2>
          <p className="text-sm text-muted-foreground">
            Schedule, export, and share reports with automated distribution workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Create Share Link
          </Button>
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setShowScheduleDialog(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Active Schedules</p>
                <p className="text-lg font-bold">{activeSchedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Ready Exports</p>
                <p className="text-lg font-bold">{readyExports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Share2 className="h-4 w-4 text-info" />
              <div>
                <p className="text-sm font-medium">Active Links</p>
                <p className="text-lg font-bold">{activeLinks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="h-4 w-4 text-warning" />
              <div>
                <p className="text-sm font-medium">Total Deliveries</p>
                <p className="text-lg font-bold">{schedules.reduce((acc, s) => acc + s.deliveryCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="p-4 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{schedule.name}</h4>
                    <p className="text-sm text-muted-foreground">{schedule.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{schedule.frequency}</span>
                      <span>•</span>
                      <span>{schedule.format.toUpperCase()}</span>
                      <span>•</span>
                      <span>{schedule.recipients.emails.length + schedule.recipients.groups.length} recipients</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(schedule.status)}
                    <Badge variant={schedule.status === "active" ? "default" : schedule.status === "error" ? "destructive" : "secondary"}>
                      {schedule.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Next Run</p>
                    <p className="font-medium">{new Date(schedule.nextRun).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivered</p>
                    <p className="font-medium">{schedule.deliveryCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Errors</p>
                    <p className="font-medium">{schedule.errorCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button 
                    size="sm"
                    onClick={() => handleRunSchedule(schedule.id)}
                    disabled={processingStates[schedule.id]}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Run Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onUpdateSchedule(schedule.id, { status: schedule.status === "active" ? "paused" : "active" })}
                  >
                    {schedule.status === "active" ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                    {schedule.status === "active" ? "Pause" : "Resume"}
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onDeleteSchedule(schedule.id)}
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            {schedules.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No scheduled reports yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setShowScheduleDialog(true)}
                >
                  Create Your First Schedule
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-success" />
            Recent Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exports.slice(0, 5).map((exportItem) => (
              <div key={exportItem.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {getFormatIcon(exportItem.format)}
                  <div>
                    <h4 className="font-medium text-foreground">{exportItem.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{exportItem.format.toUpperCase()}</span>
                      <span>•</span>
                      <span>{exportItem.size}</span>
                      <span>•</span>
                      <span>{new Date(exportItem.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{exportItem.downloadCount} downloads</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(exportItem.status)}
                  {exportItem.status === "ready" && (
                    <Button 
                      size="sm"
                      onClick={() => onDownloadExport(exportItem.id)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shareable Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-info" />
            Shareable Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shareableLinks.slice(0, 5).map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <h4 className="font-medium text-foreground">{link.reportName}</h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{link.linkType}</span>
                    <span>•</span>
                    <span>{link.accessLevel}</span>
                    <span>•</span>
                    <span>{link.viewCount} views</span>
                    {link.expiresAt && (
                      <>
                        <span>•</span>
                        <span>Expires {new Date(link.expiresAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyShareLink(link.url)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Link
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onRevokeShareLink(link.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Report Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Schedule Name</Label>
                <Input
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter schedule name..."
                />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={newSchedule.reportType} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, reportType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="impact-dashboard">Impact Dashboard</SelectItem>
                    <SelectItem value="financial-summary">Financial Summary</SelectItem>
                    <SelectItem value="compliance-report">Compliance Report</SelectItem>
                    <SelectItem value="performance-metrics">Performance Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newSchedule.description}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the scheduled report..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={newSchedule.frequency} onValueChange={(value: any) => setNewSchedule(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={newSchedule.format} onValueChange={(value: any) => setNewSchedule(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={handleCreateSchedule}>Create Schedule</Button>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Report Export</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Export Name</Label>
                <Input
                  value={newExport.name}
                  onChange={(e) => setNewExport(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter export name..."
                />
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={newExport.format} onValueChange={(value: any) => setNewExport(prev => ({ ...prev, format: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="powerbi">Power BI</SelectItem>
                    <SelectItem value="tableau">Tableau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Customization Options</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Include Logo</p>
                    <p className="text-sm text-muted-foreground">Add company branding to reports</p>
                  </div>
                  <Switch
                    checked={newExport.customizations.includeLogo}
                    onCheckedChange={(checked) => 
                      setNewExport(prev => ({ 
                        ...prev, 
                        customizations: { ...prev.customizations, includeLogo: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Include Charts</p>
                    <p className="text-sm text-muted-foreground">Add visual charts and graphs</p>
                  </div>
                  <Switch
                    checked={newExport.customizations.includeCharts}
                    onCheckedChange={(checked) => 
                      setNewExport(prev => ({ 
                        ...prev, 
                        customizations: { ...prev.customizations, includeCharts: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Include Raw Data</p>
                    <p className="text-sm text-muted-foreground">Append raw data tables</p>
                  </div>
                  <Switch
                    checked={newExport.customizations.includeRawData}
                    onCheckedChange={(checked) => 
                      setNewExport(prev => ({ 
                        ...prev, 
                        customizations: { ...prev.customizations, includeRawData: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={handleCreateExport} disabled={processingStates.export}>
                {processingStates.export ? "Generating..." : "Create Export"}
              </Button>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Share Link Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Shareable Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report</Label>
              <Select value={newShareLink.reportId} onValueChange={(value) => setNewShareLink(prev => ({ ...prev, reportId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report to share..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="impact-dashboard">Impact Dashboard</SelectItem>
                  <SelectItem value="financial-summary">Financial Summary</SelectItem>
                  <SelectItem value="compliance-report">Compliance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link Type</Label>
                <Select value={newShareLink.linkType} onValueChange={(value: any) => setNewShareLink(prev => ({ ...prev, linkType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="download">Download</SelectItem>
                    <SelectItem value="embed">Embed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select value={newShareLink.accessLevel} onValueChange={(value: any) => setNewShareLink(prev => ({ ...prev, accessLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="password">Password Protected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newShareLink.accessLevel === "password" && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newShareLink.password}
                  onChange={(e) => setNewShareLink(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password..."
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={handleCreateShareLink}>Create Share Link</Button>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}