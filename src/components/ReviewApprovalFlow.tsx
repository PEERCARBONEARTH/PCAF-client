import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText, User } from "lucide-react";

interface ReviewItem {
  id: string;
  type: "tranche" | "compliance" | "report" | "user";
  title: string;
  description: string;
  requester: string;
  requestedAt: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected";
  details?: Record<string, any>;
}

interface ReviewApprovalFlowProps {
  items: ReviewItem[];
  onApprove: (id: string, comments?: string) => void;
  onReject: (id: string, reason: string) => void;
  onComplete: () => void;
}

export function ReviewApprovalFlow({ items, onApprove, onReject, onComplete }: ReviewApprovalFlowProps) {
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!selectedItem) return;
    
    setIsProcessing(true);
    try {
      await onApprove(selectedItem.id, approvalComments);
      toast({
        title: "Approved Successfully",
        description: `${selectedItem.title} has been approved and next steps have been initiated.`,
      });
      setShowApprovalDialog(false);
      setApprovalComments("");
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Unable to process approval. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) return;
    
    setIsProcessing(true);
    try {
      await onReject(selectedItem.id, rejectionReason);
      toast({
        title: "Rejected",
        description: `${selectedItem.title} has been rejected and requester has been notified.`,
      });
      setShowApprovalDialog(false);
      setRejectionReason("");
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Unable to process rejection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openApprovalDialog = (item: ReviewItem) => {
    setSelectedItem(item);
    setShowApprovalDialog(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-destructive/50 bg-destructive/5";
      case "medium": return "border-warning/50 bg-warning/5";
      default: return "border-muted";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tranche": return <FileText className="h-4 w-4" />;
      case "compliance": return <AlertTriangle className="h-4 w-4" />;
      case "report": return <FileText className="h-4 w-4" />;
      case "user": return <User className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingItems = items.filter(item => item.status === "pending");
  const completedItems = items.filter(item => item.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Review & Approval Queue</h2>
          <p className="text-sm text-muted-foreground">
            {pendingItems.length} items pending review
          </p>
        </div>
        {pendingItems.length === 0 && (
          <Button onClick={onComplete} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            All Caught Up
          </Button>
        )}
      </div>

      {/* Pending Reviews */}
      {pendingItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingItems.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-sm border ${getPriorityColor(item.priority)} hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                        <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Requested by {item.requester}</span>
                        <span>•</span>
                        <span>{new Date(item.requestedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openApprovalDialog(item)}
                      disabled={isProcessing}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Decisions */}
      {completedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-sm bg-muted/30">
                  <div className={`p-1 rounded ${item.status === "approved" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                    {item.status === "approved" ? 
                      <CheckCircle className="h-3 w-3" /> : 
                      <XCircle className="h-3 w-3" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.status === "approved" ? "Approved" : "Rejected"} • {new Date(item.requestedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review: {selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* Item Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Requester</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.requester}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Priority</h4>
                    <Badge variant={selectedItem.priority === "high" ? "destructive" : selectedItem.priority === "medium" ? "default" : "secondary"}>
                      {selectedItem.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Decision Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Make Decision</h4>
                
                {/* Approval Comments */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Comments (Optional)</label>
                  <Textarea
                    placeholder="Add any comments or conditions for approval..."
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                {/* Rejection Reason */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rejection Reason</label>
                  <Textarea
                    placeholder="Provide a reason for rejection (required if rejecting)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Process
                </Button>
                <Button 
                  onClick={handleReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject & Notify
                </Button>
                <Button 
                  onClick={() => setShowApprovalDialog(false)}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}