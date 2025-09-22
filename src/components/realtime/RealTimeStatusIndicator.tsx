import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { dataSyncService } from '@/services/dataSyncService';
import {
  Wifi,
  WifiOff,
  Activity,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  Database
} from 'lucide-react';

interface RealTimeStatusIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  showDetails?: boolean;
  compact?: boolean;
}

export function RealTimeStatusIndicator({ 
  position = 'top-right', 
  showDetails = false,
  compact = false 
}: RealTimeStatusIndicatorProps) {
  const { isConnected, connectionStatus, updates, connect, disconnect, requestRefresh } = useRealTimeUpdates();
  const [showPopover, setShowPopover] = useState(false);
  const [syncStats, setSyncStats] = useState(dataSyncService.getStats());

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500 bg-red-50 border-red-200';
    if (connectionStatus.latency > 1000) return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    return 'text-green-500 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    if (connectionStatus.latency > 1000) return <AlertCircle className="h-3 w-3" />;
    return <Wifi className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (connectionStatus.latency > 1000) return 'Slow Connection';
    return 'Connected';
  };

  const getPositionClasses = () => {
    if (position === 'inline') return '';
    
    const baseClasses = 'fixed z-50';
    switch (position) {
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  const formatLatency = (latency: number) => {
    if (latency < 100) return `${latency}ms`;
    if (latency < 1000) return `${Math.round(latency)}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  };

  const recentUpdates = updates.slice(0, 5);

  // Update sync stats periodically
  useState(() => {
    const interval = setInterval(() => {
      setSyncStats(dataSyncService.getStats());
    }, 5000);
    
    return () => clearInterval(interval);
  });

  if (compact) {
    return (
      <div className={getPositionClasses()}>
        <Popover open={showPopover} onOpenChange={setShowPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 px-2 ${getStatusColor()}`}
            >
              {getStatusIcon()}
              {!compact && <span className="ml-1 text-xs">{getStatusText()}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <RealTimeStatusDetails 
              isConnected={isConnected}
              connectionStatus={connectionStatus}
              updates={recentUpdates}
              syncStats={syncStats}
              onConnect={connect}
              onDisconnect={disconnect}
              onRefresh={requestRefresh}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (showDetails) {
    return (
      <div className={getPositionClasses()}>
        <Card className="w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-Time Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealTimeStatusDetails 
              isConnected={isConnected}
              connectionStatus={connectionStatus}
              updates={recentUpdates}
              syncStats={syncStats}
              onConnect={connect}
              onDisconnect={disconnect}
              onRefresh={requestRefresh}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={getPositionClasses()}>
      <Badge variant="outline" className={`${getStatusColor()} flex items-center gap-1`}>
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
        {isConnected && connectionStatus.latency > 0 && (
          <span className="text-xs opacity-75">
            {formatLatency(connectionStatus.latency)}
          </span>
        )}
      </Badge>
    </div>
  );
}

interface RealTimeStatusDetailsProps {
  isConnected: boolean;
  connectionStatus: any;
  updates: any[];
  syncStats: any;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: (dataType: string) => void;
}

function RealTimeStatusDetails({
  isConnected,
  connectionStatus,
  updates,
  syncStats,
  onConnect,
  onDisconnect,
  onRefresh
}: RealTimeStatusDetailsProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'loan_created':
      case 'loan_updated':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'loan_deleted':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'calculation_completed':
        return <Zap className="h-3 w-3 text-blue-500" />;
      case 'portfolio_updated':
        return <RefreshCw className="h-3 w-3 text-purple-500" />;
      default:
        return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatUpdateType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={isConnected ? onDisconnect : onConnect}
          className="h-6 px-2 text-xs"
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>

      {/* Connection Details */}
      {isConnected && (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">Latency</div>
            <div className="font-medium">
              {connectionStatus.latency > 0 ? `${connectionStatus.latency}ms` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Last Heartbeat</div>
            <div className="font-medium">
              {formatTime(connectionStatus.lastHeartbeat)}
            </div>
          </div>
        </div>
      )}

      {/* Data Sync Status */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4" />
          <span className="text-sm font-medium">Data Sync</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">Sources</div>
            <div className="font-medium">{syncStats.registeredSources}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Active Syncs</div>
            <div className="font-medium">{syncStats.activeSyncs}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Stale Data</div>
            <div className={`font-medium ${syncStats.staleData > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {syncStats.staleData}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Errors</div>
            <div className={`font-medium ${syncStats.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {syncStats.errors}
            </div>
          </div>
        </div>
      </div>

      {/* Reconnection Info */}
      {!isConnected && connectionStatus.reconnectAttempts > 0 && (
        <div className="text-xs text-muted-foreground">
          Reconnection attempts: {connectionStatus.reconnectAttempts}
        </div>
      )}

      {/* Recent Updates */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Recent Updates</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRefresh('portfolio')}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
        
        {updates.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {updates.map((update, index) => (
              <div key={update.id || index} className="flex items-start gap-2 text-xs">
                {getUpdateIcon(update.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {formatUpdateType(update.type)}
                  </div>
                  <div className="text-muted-foreground">
                    {update.timestamp instanceof Date 
                      ? update.timestamp.toLocaleTimeString() 
                      : new Date(update.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-2">
            No recent updates
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRefresh('loans')}
          className="flex-1 h-6 text-xs"
        >
          Refresh Loans
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRefresh('portfolio')}
          className="flex-1 h-6 text-xs"
        >
          Refresh Portfolio
        </Button>
      </div>
    </div>
  );
}