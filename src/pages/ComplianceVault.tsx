
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Eye,
  Archive,
  FileCheck,
  AlertCircle,
  TrendingUp
} from "lucide-react";

const complianceStats = [
  { label: "Active Documents", value: "2,847", change: "+12%", icon: FileText },
  { label: "Pending Reviews", value: "23", change: "-8%", icon: Clock },
  { label: "Compliance Score", value: "94.2%", change: "+2.1%", icon: Shield },
  { label: "Overdue Items", value: "3", change: "-50%", icon: AlertTriangle }
];

const recentDocuments = [
  {
    id: "DOC-2024-001",
    name: "Environmental Impact Assessment - Kibera Phase 2",
    type: "Environmental",
    status: "approved",
    uploadDate: "2024-01-15",
    reviewer: "Sarah Chen",
    project: "Clean Cooking Kibera"
  },
  {
    id: "DOC-2024-002", 
    name: "Financial Audit Q4 2023",
    type: "Financial",
    status: "under_review",
    uploadDate: "2024-01-12",
    reviewer: "Michael Torres",
    project: "E-Bus Mombasa"
  },
  {
    id: "DOC-2024-003",
    name: "Carbon Credit Verification Report",
    type: "Carbon",
    status: "pending",
    uploadDate: "2024-01-10",
    reviewer: "Pending Assignment",
    project: "Solar PV Schools"
  },
  {
    id: "DOC-2024-004",
    name: "Safety Compliance Certificate",
    type: "Safety",
    status: "approved",
    uploadDate: "2024-01-08",
    reviewer: "David Kim",
    project: "Biogas Digesters"
  }
];

const documentCategories = [
  { name: "Environmental", count: 342, pending: 5, icon: Shield, color: "text-green-600" },
  { name: "Financial", count: 298, pending: 8, icon: TrendingUp, color: "text-blue-600" },
  { name: "Carbon", count: 156, pending: 3, icon: FileCheck, color: "text-emerald-600" },
  { name: "Safety", count: 89, pending: 2, icon: AlertCircle, color: "text-orange-600" },
  { name: "Legal", count: 67, pending: 5, icon: FileText, color: "text-purple-600" }
];

const auditTimeline = [
  { date: "2024-01-15", type: "Financial Audit", status: "Completed", auditor: "EY Kenya" },
  { date: "2024-01-10", type: "Environmental Review", status: "In Progress", auditor: "Green Audit Ltd" },
  { date: "2024-01-05", type: "Carbon Verification", status: "Scheduled", auditor: "VCS Verifier" },
  { date: "2023-12-20", type: "Safety Inspection", status: "Completed", auditor: "OSHA Kenya" }
];

function getStatusBadge(status: string) {
  const styles = {
    approved: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
    under_review: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
    pending: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
    rejected: "bg-red-500/10 text-red-600 hover:bg-red-500/20"
  };

  const labels = {
    approved: "Approved",
    under_review: "Under Review", 
    pending: "Pending",
    rejected: "Rejected"
  };

  return (
    <Badge variant="secondary" className={styles[status as keyof typeof styles]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}

export default function ComplianceVault() {
  return (
    <div className="p-6 space-y-6">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Compliance Vault</h1>
            <p className="text-muted-foreground">Document management, audits, and regulatory compliance</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {complianceStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.change} from last month</p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="audits">Audit Trail</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search documents..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.uploadDate}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.reviewer}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.project}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditTimeline.map((audit, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{audit.type}</h4>
                          {getStatusBadge(audit.status.toLowerCase().replace(' ', '_'))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {audit.auditor} • {audit.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className={`h-8 w-8 ${category.color}`} />
                        <Badge variant="outline" className="text-xs">
                          {category.pending} pending
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                      <p className="text-2xl font-bold text-foreground">{category.count}</p>
                      <p className="text-sm text-muted-foreground">Total documents</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Compliance Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">94.2%</div>
                    <p className="text-muted-foreground mb-4">Overall compliance rating</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-green-950/20 rounded-lg">
                      <span className="text-sm font-medium">Environmental permit renewal</span>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                        Due in 7 days
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-green-950/20 rounded-lg">
                      <span className="text-sm font-medium">Annual safety audit</span>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                        Due in 15 days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}