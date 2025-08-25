
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Download,
  Eye,
  Play,
  RefreshCw,
  Wallet,
  FileText,
  MapPin,
  Calendar,
  MoreHorizontal,
  CreditCard,
  Shield
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { DisbursementModal } from "@/components/DisbursementModal";
import { DisbursementDashboard } from "@/components/DisbursementDashboard";
import { ComplianceCenter } from "@/components/ComplianceCenter";
import { TrancheFilters } from "@/components/TrancheFilters";
import { TranchePagination } from "@/components/TranchePagination";
import { useTrancheData } from "@/hooks/useTrancheData";
import { TrancheData } from "@/api/tranches";
import { FolderOpen, Target } from "lucide-react";

const getStatusBadgeType = (status: string): "active" | "pending" | "risk" | "completed" | "overdue" => {
  switch (status) {
    case "Ready to Disburse":
      return "pending";
    case "Disbursed":
      return "completed";
    case "In Progress":
      return "active";
    case "At Risk":
      return "risk";
    default:
      return "pending";
  }
};

const getProgressColor = (progress: number, status: string) => {
  if (status === "At Risk") return "bg-destructive";
  if (progress >= 100) return "bg-success";
  if (progress >= 70) return "bg-warning";
  return "bg-primary";
};

export default function TrancheMonitoring() {
  const {
    tranches,
    loading,
    error,
    pagination,
    filters,
    stats,
    setFilters,
    setPage,
    setPageSize,
    refreshData,
    clearFilters
  } = useTrancheData();

  const [selectedTranche, setSelectedTranche] = useState<TrancheData | null>(null);
  const [disbursementModalOpen, setDisbursementModalOpen] = useState(false);

  const handleDisbursement = (tranche: TrancheData) => {
    setSelectedTranche(tranche);
    setDisbursementModalOpen(true);
  };

  const readyTranches = tranches.filter(t => t.status === "Ready to Disburse");

  // Loading skeleton for stats
  const StatsLoading = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Tranche Monitoring & Disbursement</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Track milestone progress and manage results-based disbursements
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button size="sm" onClick={refreshData} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sync Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quick Stats */}
          {loading && !stats ? (
            <StatsLoading />
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Total Tranches</p>
                      <p className="metric-value mt-2">{stats.totalTranches}</p>
                      <p className="text-sm text-muted-foreground mt-1">Across all programs</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Ready to Disburse</p>
                      <p className="metric-value mt-2">${(stats.readyToDisburse.amount / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-muted-foreground mt-1">{stats.readyToDisburse.count} tranches pending</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Monitoring Active</p>
                      <p className="metric-value mt-2">{stats.monitoring.percentage}%</p>
                      <p className="text-sm text-muted-foreground mt-1">Schools transmitting</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="metric-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Avg. Trigger Time</p>
                      <p className="metric-value mt-2">{stats.avgTriggerTime} days</p>
                      <p className="text-sm text-muted-foreground mt-1">To milestone completion</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Main Content Tabs */}
          <Tabs defaultValue="monitoring" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Tranche Monitoring
              </TabsTrigger>
              <TabsTrigger value="disbursements" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Disbursement Management
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance Center
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring" className="space-y-8">
              {/* Search and Filters */}
              <TrancheFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
                loading={loading}
              />

              {/* Disbursement Actions */}
              {readyTranches.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-primary" />
                          Ready for Disbursement
                        </CardTitle>
                        <CardDescription>
                          Tranches that have met their trigger conditions and are ready for fund release
                        </CardDescription>
                      </div>
                      <Button>
                        <Play className="w-4 h-4 mr-2" />
                        Process All Ready
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {readyTranches.slice(0, 4).map((tranche) => (
                        <div key={tranche.id} className="p-4 rounded-lg border border-success/20 bg-success/5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{tranche.schoolName}</p>
                              <p className="text-sm text-muted-foreground">
                                Tranche {tranche.trancheNumber} • ${tranche.targetAmount.toLocaleString()}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleDisbursement(tranche)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tranche Monitoring Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Tranches</CardTitle>
                  <CardDescription>
                    Complete overview of all tranches across your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/6" />
                          </div>
                          <Skeleton className="h-4 w-1/6" />
                          <Skeleton className="h-4 w-1/8" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>School & Location</TableHead>
                            <TableHead>Tranche</TableHead>
                            <TableHead>Trigger & Progress</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Update</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tranches.map((tranche) => (
                            <TableRow key={tranche.id}>
                              <TableCell>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-foreground">{tranche.schoolName}</p>
                                    {tranche.isInPipeline && (
                                      <Badge variant="outline" className="text-xs">
                                        <FolderOpen className="h-3 w-3 mr-1" />
                                        Pipeline
                                      </Badge>
                                    )}
                                    {tranche.isInPortfolio && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Target className="h-3 w-3 mr-1" />
                                        Portfolio
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {tranche.region}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">#{tranche.trancheNumber}</p>
                                  <p className="text-sm text-muted-foreground">{tranche.milestone}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">{tranche.triggerType}</p>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(tranche.progress, tranche.status)}`}
                                      style={{ width: `${Math.min(tranche.progress, 100)}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">{tranche.progress}% complete</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">${tranche.targetAmount.toLocaleString()}</p>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={getStatusBadgeType(tranche.status)}>
                                  {tranche.status}
                                </StatusBadge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {tranche.lastUpdate}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {tranche.status === "Ready to Disburse" && (
                                    <Button 
                                      size="sm"
                                      onClick={() => handleDisbursement(tranche)}
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      Disburse
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {pagination && (
                        <div className="mt-6">
                          <TranchePagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            pageSize={pagination.limit}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Disbursement Management Tab */}
            <TabsContent value="disbursements">
              <DisbursementDashboard />
            </TabsContent>

            {/* Compliance Center Tab */}
            <TabsContent value="compliance">
              <ComplianceCenter />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Disbursement Modal */}
      {selectedTranche && (
        <DisbursementModal
          open={disbursementModalOpen}
          onOpenChange={setDisbursementModalOpen}
          tranche={selectedTranche}
        />
      )}
    </div>
  );
}
