import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
// TODO: Replace with MongoDB-based user approval system
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PendingUser {
  id: string;
  user_id: string;
  role: string;
  organization_name: string;
  approval_status: string;
  created_at: string;
  user_email?: { email: string };
}

export function useUserApproval() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasRole } = useAuth();

  const fetchPendingUsers = async () => {
    if (!hasRole('admin')) {
      setError('Unauthorized: Admin access required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { users, error: fetchError } = await AuthService.getPendingUsers();
      
      if (fetchError) {
        setError(fetchError.message);
        toast.error('Failed to fetch pending users');
      } else {
        setPendingUsers(users);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    setLoading(true);
    try {
      const { error: approvalError } = await AuthService.approveUser(userId);
      
      if (approvalError) {
        toast.error('Failed to approve user');
        setError(approvalError.message);
      } else {
        toast.success('User approved successfully');
        await fetchPendingUsers(); // Refresh the list
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const rejectUser = async (userId: string, reason?: string) => {
    setLoading(true);
    try {
      const { error: rejectionError } = await AuthService.rejectUser(userId, reason);
      
      if (rejectionError) {
        toast.error('Failed to reject user');
        setError(rejectionError.message);
      } else {
        toast.success('User rejected successfully');
        await fetchPendingUsers(); // Refresh the list
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [hasRole]);

  // Set up real-time subscription for profile changes
  useEffect(() => {
    if (!hasRole('admin')) return;

    const subscription = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchPendingUsers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [hasRole]);

  return {
    pendingUsers,
    loading,
    error,
    fetchPendingUsers,
    approveUser,
    rejectUser
  };
}