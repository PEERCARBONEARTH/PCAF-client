import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Activity,
  Settings,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react';
import { integrationService, type ExternalServicesStatus, type LMSSyncResult } from '@/services/integrationService';
import { realTimeService, type RealTimeUpdate } from '@/services/realTimeService';
import { useToast } from '@/hooks/use-toast';

interface IntegrationDashboardProps {
  className?: string;
}

export function IntegrationDashboard({ className }: IntegrationDashboardProps) {
  const { toast } = useToast();
  const [servicesStatus, setServicesStatus] = useState<ExternalServicesStatus | null>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [apiUsageStats, setApiUsageStats] = useState<any[]>([]);
  const [activeSyncs, setActiveSyncs] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Subscribe to real-time sync updates
    const unsubscribe = realTimeService.subscribe('sync_status', handleSyncUpdate);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [status, history, usage] = await Promise.all([
        integrationService.getExternalServicesStatus(),
        integrationService.getSyncHistory({ limit: 10 }),
        integrationService.getAPIUsageStats({ granularity: 'daily' })
      ]);

      setServicesStatus(status);
      setSyncHistory(history.history);
      setApiUsageStats(usage);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load integration dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncUpdate = (update: RealTimeUpdate) => {
    if (update.data.status === 'started') {
      setActiveSyncs(prev => {
        const newMap = new Map(prev);
        newMap.set(update.data.syncId, update.data);
        return newMap;
      });
    } else if (update.data.status === 'completed' || update.data.status === 'failed') {
      setActiveSyncs(prev => {
        const newMap = new Map(prev);
        newMap.delete(update.data.syncId);
        return newMap;
      });
      
      // Refresh sync history
      loadSyncHistory();
    }
  };

  const loadSyncHistory = async () => {
    try {
      const history = await integrationService.getSyncHistory({ limit: 10 });
      setSyncHistory(history.history);
    } catch (error) {
      console.error('Failed to load sync history:', error);
    }
  };

  const refreshStatus = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
      toast({
        title: "Status Refreshed",
        description: "Integration status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh integration status.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const testAllServices = async () => {
    try {
      setRefreshing(true);
      const results = await integrationService.testExternalServices();
      
      const successCount = results.summary.successful;
      const totalCount = results.summary.total;
      
      toast({
        title: "Connection Test Complete",
        description: `${successCount}/${totalCount} services are working correctly.`,
        variant: successCount === totalCount ? "default" : "destructive"
      });
      
      // Refresh status after testing
      await loadDashboardData();
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test service connections.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const startLMSSync = async () => {
    try {
      const result = await integrationService.syncWithLMS({
        syncType: 'incremental',
        includePaymentHistory: true,
        includeLoanModifications: true,
        dryRun: false
      });

      toast({
        title: "LMS Sync Started",
        description: `Sync initiated with request ID: ${result.requestId}`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to start LMS synchronization.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (connected: boolean, health?: string) => {
    if (!connected) return 'destructive';
    if (health === 'healthy') return 'default';
    if (health === 'degraded') return 'secondary';
    return 'destructive';
  };

  const getStatusIcon = (connected: boolean, health?: string) => {
    if (!connected) return <AlertCircle className="h-4 w-4" />;
    if (health === 'healthy') return <CheckCircle className="h-4 w-4" />;
    if (health === 'degraded') return <Clock className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading integration status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Dashboard</h2>
          <p className="text-muted-foreground">Monitor external service connections and data synchronization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshStatus} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={testAllServices} disabled={refreshing}>
            <Shield className="h-4 w-4 mr-2" />
            Test All
          </Button>
        </div>
      </div>

      {/* Active Syncs */}
      {activeSyncs.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Synchronizations ({activeSyncs.size})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from(activeSyncs.values()).map((sync) => (
              <div key={sync.syncId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{sync.service} Sync</span>
                    <Badge variant="outline">{sync.syncType}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {sync.processedRecords || 0} records processed
                  </span>
                </div>
                {sync.progress !== undefined && (
                  <Progress value={sync.progress} className="h-2" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Service Status</TabsTrigger>
          <TabsTrigger value="sync">Sync History</TabsTrigger>
          <TabsTrigger value="usage">API Usage</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {servicesStatus && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* LMS Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    LMS Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant={getStatusColor(servicesStatus.lms.connected, servicesStatus.lms.connectionHealth)}>
                        {getStatusIcon(servicesStatus.lms.connected, servicesStatus.lms.connectionHealth)}
                        {servicesStatus.lms.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    {servicesStatus.lms.lastSyncDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Sync</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(servicesStatus.lms.lastSyncDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* EPA API Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    EPA API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant={getStatusColor(servicesStatus.epa_api.connected)}>
                        {getStatusIcon(servicesStatus.epa_api.connected)}
                        {servicesStatus.epa_api.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Database Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Vehicle DB
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant={getStatusColor(servicesStatus.vehicle_db.connected)}>
                        {getStatusIcon(servicesStatus.vehicle_db.connected)}
                        {servicesStatus.vehicle_db.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emission Factors API Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Emission Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant={getStatusColor(servicesStatus.emission_factors_api.connected)}>
                        {getStatusIcon(servicesStatus.emission_factors_api.connected)}
                        {servicesStatus.emission_factors_api.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Overall Health */}
          {servicesStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Overall System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {servicesStatus.overall.healthy ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {servicesStatus.overall.healthy ? 'All Systems Operational' : 'System Issues Detected'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Last checked: {new Date(servicesStatus.overall.lastChecked).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Synchronizations</CardTitle>
            </CardHeader>
            <CardContent>
              {syncHistory.length > 0 ? (
                <div className="space-y-2">
                  {syncHistory.map((sync, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {sync.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{sync.service}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(sync.startTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {sync.recordsSuccessful}/{sync.recordsProcessed} records
                        </div>
                        <Badge variant={sync.status === 'success' ? 'default' : 'destructive'}>
                          {sync.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No synchronization history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {apiUsageStats.length > 0 ? (
                <div className="space-y-4">
                  {apiUsageStats.map((stat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{stat.service}</span>
                        <span className="text-sm text-muted-foreground">{stat.date}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Requests</div>
                          <div className="font-medium">{stat.requestCount}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Success Rate</div>
                          <div className="font-medium">
                            {((stat.successfulRequests / stat.requestCount) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Response</div>
                          <div className="font-medium">{stat.averageResponseTime}ms</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No usage statistics available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>LMS Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={startLMSSync} className="w-full">
                  Start Incremental Sync
                </Button>
                <Button variant="outline" className="w-full">
                  Test LMS Connection
                </Button>
                <Button variant="outline" className="w-full">
                  View Sync History
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  Refresh Emission Factors
                </Button>
                <Button variant="outline" className="w-full">
                  Update Vehicle Database
                </Button>
                <Button variant="outline" className="w-full">
                  Validate Loan Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}