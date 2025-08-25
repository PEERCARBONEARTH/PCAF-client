import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, XCircle, CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function ApprovalStatusBanner() {
  const { user, signOut } = useAuth();

  if (!user || user.approval_status === 'approved') {
    return null;
  }

  if (user.approval_status === 'pending') {
    return (
      <Alert className="border-warning bg-warning/10">
        <Clock className="h-4 w-4" />
        <AlertTitle>Account Pending Approval</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Your account registration is currently under review by our administrators.</p>
          <p>You'll receive an email notification once your account has been approved.</p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Check Status
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (user.approval_status === 'rejected') {
    return (
      <Alert className="border-destructive bg-destructive/10">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Account Registration Rejected</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Unfortunately, your account registration has been rejected.</p>
          {user.rejection_reason && (
            <p className="font-medium">Reason: {user.rejection_reason}</p>
          )}
          <p>Please contact support if you believe this was in error.</p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@peercarbon.com">
                <Mail className="h-4 w-4 mr-1" />
                Contact Support
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}