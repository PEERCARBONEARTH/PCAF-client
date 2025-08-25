import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Database,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface LMSSyncStatus {
  connected: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  syncInProgress: boolean;
  totalLoans: number;
  syncedLoans: number;
  failedLoans: number;
  dataFreshness: 'fresh' | 'stale' | 'critical';
  provider: string;
  errors: string[];
}

interface LMSSyncStatusIndicatorProps {
  onConfigureClick?: () => void;
  onSyncClick?: () => void;
}

export function LMSSyncStatusIndicator({ onConfigureClick, onSyncClick }: LMSSyncStatusIndicatorProps) {
  const [status, setStatus] = useState<LMSSyncStatus>({
    connected: false,
    lastSync: null,
    nextSync: null,
    syncInProgress: false,
    totalLoans: 0,
    syncedLoans: 0,
    failedLoans: 0,
    dataFreshness: 'critical',
    provider: 'Not configured',
    errors: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/lms/sync-status`);
      if (response.ok) {
        const data = await response.json();
        setStatus({
          connected: data.connected || false,
          lastSync: data.lastSync ? new Date(data.lastSync) : null,
          nextSync: data.nextSync ? new Date(data.nextSync) : null,
          syncInProgress: data.syncInProgress || false,
          totalLoans: data.totalLoans || 0,
          syncedLoans: data.syncedLoans || 0,
          failedLoans: data.failedLoans || 0,
          dataFreshness: data.dataFreshness || 'critical',
          provider: data.provider || 'Not configured',
          errors: data.errors || []
        });
      } else {
        // LMS not configured or unavailable
        setStatus(prev => ({
          ...prev,
          connected: false,
          provider: 'Not configured'
        }));
      }
    } catch (error) {
      console.warn('Could not load LMS sync status:', error);
      setStatus(prev => ({
        ...prev,
        connected: false,
        errors: ['Connection failed']
      }));
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      setStatus(prev => ({ ...prev, syncInProgress: true }));
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/lms/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: "LMS Sync Started",
          description: "Synchronizing loan data with your LMS...",
        });
        onSyncClick?.();
      } else {
        throw new Error('Sync request failed');
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not start LMS synchronization. Check your configuration.",
        variant: "destructive"
      });
      setStatus(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  const getConnectionIcon = () => {
    if (status.syncInProgress) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (status.connected) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (status.syncInProgress) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Syncing</Badge>;
    }
    if (!status.connected) {
      return <Badge variant="destructive">Disconnected</Badge>;
    }
    
    switch (status.dataFreshness) {
      case 'fresh':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Fresh</Badge>;
      case 'stale':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Stale</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSyncProgress = () => {
    if (status.totalLoans === 0) return 0;
    return (status.syncedLoans / status.totalLoans) * 100;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Checking LMS status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <CardTitle className="text-base">LMS Integration</CardTitle>
            {getStatusBadge()}
          </div>
          <div className="flex gap-2">
            {status.connected && (
              <Button
                variant="outline"
                size="sm"
                onClick={triggerSync}
                disabled={status.syncInProgress}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${status.syncInProgress ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onConfigureClick}
              className="flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Configure
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Provider:</span>
            <div className="font-medium">{status.provider}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <div className="font-medium">
              {status.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Sync Progress */}
        {status.syncInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Syncing loans...</span>
              <span>{status.syncedLoans}/{status.totalLoans}</span>
            </div>
            <Progress value={getSyncProgress()} className="h-2" />
          </div>
        )}

        {/* Last Sync Info */}
        {status.lastSync && (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Last sync:</span>
              <span className="font-medium">{format(status.lastSync, 'MMM d, yyyy HH:mm')}</span>
            </div>
            {status.nextSync && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Next sync:</span>
                <span className="font-medium">{format(status.nextSync, 'MMM d, yyyy HH:mm')}</span>
              </div>
            )}
          </div>
        )}

        {/* Sync Statistics */}
        {status.connected && status.totalLoans > 0 && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-bold text-blue-600">{status.totalLoans}</div>
              <div className="text-blue-600 text-xs">Total</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-bold text-green-600">{status.syncedLoans}</div>
              <div className="text-green-600 text-xs">Synced</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-bold text-red-600">{status.failedLoans}</div>
              <div className="text-red-600 text-xs">Failed</div>
            </div>
          </div>
        )}

        {/* Errors */}
        {status.errors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Sync Issues:</div>
                {status.errors.map((error, index) => (
                  <div key={index} className="text-sm">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Not Connected State */}
        {!status.connected && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">LMS Not Connected</div>
                <div className="text-sm">
                  Configure your Loan Management System integration to automatically sync loan data.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConfigureClick}
                  className="mt-2"
                >
                  Set Up LMS Integration
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}