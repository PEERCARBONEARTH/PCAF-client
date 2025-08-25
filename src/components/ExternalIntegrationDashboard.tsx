// External Integration Dashboard for Phase 8
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  Database, 
  Cloud, 
  Car,
  Activity,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { externalIntegrationService } from '@/services/external-integration-service';
import { mcpEmissionService } from '@/services/mcp-emission-service';
import { useToast } from '@/hooks/use-toast';

export function ExternalIntegrationDashboard() {
  const [integrationStatus, setIntegrationStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ [key: string]: number }>({});
  const [lmsConfig, setLmsConfig] = useState({
    baseUrl: '',
    apiKey: '',
    authType: 'api_key' as const,
    rateLimitPerMinute: 60,
    timeoutMs: 30000,
    retryAttempts: 3,
    syncIntervalDays: 1,
    toleranceThreshold: 1.0
  });
  const [showLmsConfig, setShowLmsConfig] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrationStatus();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      setLoading(true);
      const status = externalIntegrationService.getIntegrationStatus();
      setIntegrationStatus(status);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load integration status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLmsSync = async () => {
    try {
      setSyncProgress({ lms: 0 });
      
      // Simulate sync progress
      const interval = setInterval(() => {
        setSyncProgress(prev => ({
          ...prev,
          lms: Math.min((prev.lms || 0) + 10, 90)
        }));
      }, 500);

      const result = await externalIntegrationService.triggerManualLMSSync();
      
      clearInterval(interval);
      setSyncProgress({ lms: 100 });

      toast({
        title: "LMS Sync Complete",
        description: `${result.updated} loans updated, ${result.failed} failed`,
      });

      setTimeout(() => {
        setSyncProgress({});
        loadIntegrationStatus();
      }, 2000);

    } catch (error) {
      setSyncProgress({});
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "LMS sync failed",
        variant: "destructive",
      });
    }
  };

  const handleEmissionFactorsSync = async () => {
    try {
      setSyncProgress({ emissions: 0 });
      
      const interval = setInterval(() => {
        setSyncProgress(prev => ({
          ...prev,
          emissions: Math.min((prev.emissions || 0) + 15, 90)
        }));
      }, 300);

      const result = await externalIntegrationService.syncEmissionFactors();
      
      clearInterval(interval);
      setSyncProgress({ emissions: 100 });

      const totalUpdated = result.results.reduce((sum, r) => sum + r.factorsUpdated, 0);
      
      toast({
        title: "Emission Factors Sync Complete",
        description: `${totalUpdated} factors updated from ${result.results.length} providers`,
      });

      setTimeout(() => {
        setSyncProgress({});
        loadIntegrationStatus();
      }, 2000);

    } catch (error) {
      setSyncProgress({});
      toast({
        title: "Sync Failed",
        description: "Emission factors sync failed",
        variant: "destructive",
      });
    }
  };

  const handleBulkVehicleEnrichment = async () => {
    try {
      setSyncProgress({ vehicle_data: 0 });
      
      // Get sample loan IDs (in real implementation, this would get actual loan IDs)
      const sampleLoanIds = ['LOAN-001', 'LOAN-002', 'LOAN-003'];
      
      const interval = setInterval(() => {
        setSyncProgress(prev => ({
          ...prev,
          vehicle_data: Math.min((prev.vehicle_data || 0) + 20, 90)
        }));
      }, 400);

      const result = await externalIntegrationService.bulkEnrichVehicleData(sampleLoanIds);
      
      clearInterval(interval);
      setSyncProgress({ vehicle_data: 100 });

      toast({
        title: "Vehicle Data Enrichment Complete",
        description: `${result.enriched} loans enriched, ${result.failed} failed`,
      });

      setTimeout(() => {
        setSyncProgress({});
        loadIntegrationStatus();
      }, 2000);

    } catch (error) {
      setSyncProgress({});
      toast({
        title: "Enrichment Failed",
        description: "Vehicle data enrichment failed",
        variant: "destructive",
      });
    }
  };

  const handleConfigureLMS = async () => {
    try {
      setLoading(true);
      
      const scheduleConfig = {
        enabled: true,
        interval: 'daily' as const,
        time: '02:00',
        timezone: 'UTC',
        lastSync: '',
        nextSync: '',
        autoResolveMinor: true,
        notificationThreshold: 5.0
      };

      await externalIntegrationService.configureLMSIntegration(lmsConfig, scheduleConfig);
      
      toast({
        title: "LMS Configured",
        description: "LMS integration configured successfully",
      });

      setShowLmsConfig(false);
      loadIntegrationStatus();

    } catch (error) {
      toast({
        title: "Configuration Failed",
        description: error instanceof Error ? error.message : "Failed to configure LMS",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getServiceIcon = (service: string) => {
    if (service.includes('LMS')) return <Database className="h-5 w-5" />;
    if (service.includes('Emission')) return <Cloud className="h-5 w-5" />;
    if (service.includes('Vehicle')) return <Car className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">External Integrations</h2>
          <p className="text-muted-foreground">
            Manage connections to loan management systems, emission factors databases, and vehicle data services
          </p>
        </div>
        <Button onClick={loadIntegrationStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Integration Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {integrationStatus.map((integration, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {getServiceIcon(integration.service)}
                  <span>{integration.service}</span>
                </div>
              </CardTitle>
              {getStatusIcon(integration.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={integration.connected ? "default" : "secondary"}>
                    {integration.connected ? "Connected" : "Disconnected"}
                  </Badge>
                  <Badge variant={
                    integration.status === 'healthy' ? "default" :
                    integration.status === 'warning' ? "destructive" : "outline"
                  }>
                    {integration.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{integration.message}</p>
                {integration.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date(integration.lastSync).toLocaleString()}
                  </p>
                )}
                {integration.syncCount && (
                  <p className="text-xs text-muted-foreground">
                    Records: {integration.syncCount.toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Management Tabs */}
      <Tabs defaultValue="lms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lms">LMS Integration</TabsTrigger>
          <TabsTrigger value="emissions">Emission Factors</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle Data</TabsTrigger>
        </TabsList>

        {/* LMS Integration Tab */}
        <TabsContent value="lms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Loan Management System Integration</span>
              </CardTitle>
              <CardDescription>
                Configure and manage synchronization with your loan management system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Dialog open={showLmsConfig} onOpenChange={setShowLmsConfig}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure LMS
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Configure LMS Integration</DialogTitle>
                      <DialogDescription>
                        Set up connection to your loan management system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="baseUrl">Base URL</Label>
                          <Input
                            id="baseUrl"
                            value={lmsConfig.baseUrl}
                            onChange={(e) => setLmsConfig({ ...lmsConfig, baseUrl: e.target.value })}
                            placeholder="https://api.lms.example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="authType">Authentication Type</Label>
                          <Select
                            value={lmsConfig.authType}
                            onValueChange={(value) => setLmsConfig({ ...lmsConfig, authType: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="api_key">API Key</SelectItem>
                              <SelectItem value="oauth">OAuth</SelectItem>
                              <SelectItem value="basic">Basic Auth</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key / Token</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          value={lmsConfig.apiKey}
                          onChange={(e) => setLmsConfig({ ...lmsConfig, apiKey: e.target.value })}
                          placeholder="Your API key or token"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
                          <Input
                            id="rateLimit"
                            type="number"
                            value={lmsConfig.rateLimitPerMinute}
                            onChange={(e) => setLmsConfig({ ...lmsConfig, rateLimitPerMinute: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timeout">Timeout (ms)</Label>
                          <Input
                            id="timeout"
                            type="number"
                            value={lmsConfig.timeoutMs}
                            onChange={(e) => setLmsConfig({ ...lmsConfig, timeoutMs: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowLmsConfig(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleConfigureLMS} disabled={loading}>
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Save Configuration
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button onClick={handleLmsSync} disabled={!!syncProgress.lms}>
                  {syncProgress.lms ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync Now
                </Button>
              </div>

              {syncProgress.lms !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Synchronizing loans...</span>
                    <span>{syncProgress.lms}%</span>
                  </div>
                  <Progress value={syncProgress.lms} />
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  LMS integration will automatically sync loan data on a daily basis. Manual sync can be triggered at any time.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emission Factors Tab */}
        <TabsContent value="emissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5" />
                <span>Emission Factors Data</span>
              </CardTitle>
              <CardDescription>
                Sync with external emission factors databases for accurate calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={handleEmissionFactorsSync} disabled={!!syncProgress.emissions}>
                  {syncProgress.emissions ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Sync Emission Factors
                </Button>
              </div>

              {syncProgress.emissions !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Updating emission factors...</span>
                    <span>{syncProgress.emissions}%</span>
                  </div>
                  <Progress value={syncProgress.emissions} />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">PCAF Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Connected</Badge>
                      <span className="text-sm text-muted-foreground">2,847 factors</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Climatiq API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Connected</Badge>
                      <span className="text-sm text-muted-foreground">12,453 factors</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">EPA Grid Mix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Connected</Badge>
                      <span className="text-sm text-muted-foreground">843 factors</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Data Tab */}
        <TabsContent value="vehicle">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>Vehicle Data Enrichment</span>
              </CardTitle>
              <CardDescription>
                Automatically enrich loan data with vehicle specifications and efficiency ratings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={handleBulkVehicleEnrichment} disabled={!!syncProgress.vehicle_data}>
                  {syncProgress.vehicle_data ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Bulk Enrich Vehicle Data
                </Button>
              </div>

              {syncProgress.vehicle_data !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Enriching vehicle data...</span>
                    <span>{syncProgress.vehicle_data}%</span>
                  </div>
                  <Progress value={syncProgress.vehicle_data} />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">EPA Fuel Economy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Active</Badge>
                      <span className="text-sm text-muted-foreground">Official ratings</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">NHTSA Database</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Active</Badge>
                      <span className="text-sm text-muted-foreground">Vehicle specs</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Car className="h-4 w-4" />
                <AlertDescription>
                  Vehicle data enrichment uses VIN decoding, EPA fuel economy data, and NHTSA vehicle specifications to improve data quality.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}