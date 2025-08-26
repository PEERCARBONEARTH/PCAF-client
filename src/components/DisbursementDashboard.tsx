import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Play,
  Pause,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { useDisbursement, DisbursementRequest } from "@/hooks/useDisbursement";
import { cn } from "@/lib/utils";

const getStatusIcon = (status: DisbursementRequest['status']) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'processing': return RefreshCw;
    case 'pending_approval': return Clock;
    case 'failed': return XCircle;
    case 'rejected': return XCircle;
    default: return Clock;
  }
};

const getStatusColor = (status: DisbursementRequest['status']) => {
  switch (status) {
    case 'completed': return 'success';
    case 'processing': return 'warning';
    case 'pending_approval': return 'warning';
    case 'approved': return 'info';
    case 'failed': return 'destructive';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
};

interface AuditModalProps {
  request: DisbursementRequest;
}

function AuditModal({ request }: AuditModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Audit Trail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Trail - {request.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {request.auditTrail.map((entry, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{entry.action.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">{entry.details}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {entry.actor}
                    <Calendar className="h-3 w-3 ml-2" />
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DisbursementDashboard() {
  const {
    requests,
    isProcessing,
    approveDisbursement,
    rejectDisbursement,
    processDisbursement,
    retryDisbursement,
    batchProcess
  } = useDisbursement();

  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending_approval').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalAmount: requests.reduce((sum, r) => sum + r.amount, 0),
    completedAmount: requests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0)
  };

  const pendingRequests = requests.filter(r => r.status === 'pending_approval');
  const processingRequests = requests.filter(r => r.status === 'processing');
  const readyToProcess = requests.filter(r => r.status === 'approved');
  const completedRequests = requests.filter(r => r.status === 'completed');
  const failedRequests = requests.filter(r => r.status === 'failed');

  const handleBatchApproval = () => {
    selectedRequests.forEach(requestId => {
      const request = pendingRequests.find(r => r.id === requestId);
      if (request) {
        approveDisbursement(requestId, 'Batch approval');
      }
    });
    setSelectedRequests([]);
  };

  const handleBatchProcess = () => {
    const approvedIds = selectedRequests.filter(id => 
      readyToProcess.some(r => r.id === id)
    );
    if (approvedIds.length > 0) {
      batchProcess(approvedIds);
      setSelectedRequests([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Total Requests</p>
                <p className="metric-value mt-2">{stats.total}</p>
                <p className="text-sm text-muted-foreground mt-1">All time</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Pending Approval</p>
                <p className="metric-value mt-2">{stats.pending}</p>
                <p className="text-sm text-muted-foreground mt-1">Requires action</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Processing</p>
                <p className="metric-value mt-2">{stats.processing}</p>
                <p className="text-sm text-muted-foreground mt-1">In progress</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-info/10 text-info">
                <RefreshCw className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Completed Amount</p>
                <p className="metric-value mt-2">${stats.completedAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Successfully disbursed</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disbursement Management Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Ready ({readyToProcess.length})
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing ({stats.processing})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({stats.completed})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({failedRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Approval */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending Approval</CardTitle>
                {selectedRequests.length > 0 && (
                  <Button onClick={handleBatchApproval}>
                    Approve Selected ({selectedRequests.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No requests pending approval
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRequests([...selectedRequests, request.id]);
                              } else {
                                setSelectedRequests(selectedRequests.filter(id => id !== request.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.schoolName}</p>
                            <p className="text-sm text-muted-foreground">{request.trancheId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${request.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.paymentMethod.name}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveDisbursement(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectDisbursement(request.id, 'Manual rejection')}
                            >
                              Reject
                            </Button>
                            <AuditModal request={request} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ready to Process */}
        <TabsContent value="ready">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ready to Process</CardTitle>
                {selectedRequests.length > 0 && (
                  <Button onClick={handleBatchProcess} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : `Process Selected (${selectedRequests.length})`}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {readyToProcess.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No disbursements ready to process
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readyToProcess.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRequests([...selectedRequests, request.id]);
                              } else {
                                setSelectedRequests(selectedRequests.filter(id => id !== request.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.schoolName}</p>
                            <p className="text-sm text-muted-foreground">{request.trancheId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${request.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.paymentMethod.name}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => processDisbursement(request.id)}
                              disabled={isProcessing}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Process
                            </Button>
                            <AuditModal request={request} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing */}
        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Currently Processing</CardTitle>
            </CardHeader>
            <CardContent>
              {processingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No disbursements currently processing
                </div>
              ) : (
                <div className="space-y-4">
                  {processingRequests.map((request) => (
                    <Alert key={request.id} className="border-warning/20 bg-warning/5">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <AlertDescription className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{request.schoolName}</span> - 
                          ${request.amount.toLocaleString()} via {request.paymentMethod.name}
                        </div>
                        <Badge variant="outline" className="ml-4">Processing</Badge>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Disbursements</CardTitle>
            </CardHeader>
            <CardContent>
              {completedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed disbursements
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.schoolName}</p>
                            <p className="text-sm text-muted-foreground">{request.trancheId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-success">
                          ${request.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.paymentMethod.name}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {request.processedAt ? new Date(request.processedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {request.transactionId}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Receipt
                            </Button>
                            <AuditModal request={request} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed */}
        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Disbursements</CardTitle>
            </CardHeader>
            <CardContent>
              {failedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No failed disbursements
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.schoolName}</p>
                            <p className="text-sm text-muted-foreground">{request.trancheId}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${request.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.paymentMethod.name}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {request.processedAt ? new Date(request.processedAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-destructive">
                          {request.failureReason}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => retryDisbursement(request.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry
                            </Button>
                            <AuditModal request={request} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}