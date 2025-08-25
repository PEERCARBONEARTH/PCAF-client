import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUserApproval, type PendingUser } from '@/hooks/useUserApproval';
import { CheckCircle2, XCircle, Clock, Building2, Mail, Calendar, Loader2 } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';

export function UserApprovalDashboard() {
  const { pendingUsers, loading, error, approveUser, rejectUser } = useUserApproval();
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [bulkApproving, setBulkApproving] = useState(false);

  const handleApprove = async (userId: string) => {
    await approveUser(userId);
  };

  const handleReject = async () => {
    if (selectedUser) {
      await rejectUser(selectedUser.user_id, rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedUser(null);
    }
  };

  const openRejectDialog = (user: PendingUser) => {
    setSelectedUser(user);
    setShowRejectDialog(true);
  };

  const handleBulkApprove = async () => {
    setBulkApproving(true);
    try {
      for (const user of pendingUsers) {
        await approveUser(user.user_id);
      }
    } finally {
      setBulkApproving(false);
    }
  };

  if (loading && pendingUsers.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Approval Management</h2>
          <p className="text-muted-foreground">Review and approve pending user registrations</p>
        </div>
        {pendingUsers.length > 0 && (
          <Button 
            onClick={handleBulkApprove}
            disabled={bulkApproving || loading}
            className="gap-2"
          >
            {bulkApproving && <Loader2 className="h-4 w-4 animate-spin" />}
            <CheckCircle2 className="h-4 w-4" />
            Approve All ({pendingUsers.length})
          </Button>
        )}
      </div>

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
              <p>No pending user approvals</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => (
            <Card key={user.user_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">New User Registration</CardTitle>
                    <CardDescription>
                      Pending approval since {new Date(user.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.user_email?.email || 'Email not available'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.organization_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Role: {user.role}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleApprove(user.user_id)}
                    disabled={loading}
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => openRejectDialog(user)}
                    disabled={loading}
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this user's registration. This will help them understand why their request was denied.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}