import React from 'react';
import { Layout } from '@/components/Layout';
import { UserApprovalDashboard } from '@/components/admin/UserApprovalDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function UserManagement() {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin mx-auto border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasRole('admin')) {
    return (
      <Layout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Access denied. Admin privileges required.</p>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <UserApprovalDashboard />
      </div>
    </Layout>
  );
}