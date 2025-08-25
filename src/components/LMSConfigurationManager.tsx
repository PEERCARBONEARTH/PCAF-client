import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Clock, Play, RefreshCw, Settings, Calendar } from 'lucide-react';
// TODO: Replace with MongoDB-based LMS configuration
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface LMSSyncSettings {
  id?: string;
  enabled: boolean;
  interval: 'hourly' | 'daily' | 'weekly' | 'bi-monthly' | 'monthly' | 'quarterly';
  time: string;
  timezone: string;
  tolerance_threshold: number;
  auto_resolve_minor: boolean;
  notification_threshold: number;
  last_sync: string | null;
  next_sync: string | null;
}

interface SyncRun {
  id: string;
  status: 'running' | 'success' | 'partial' | 'error';
  started_at: string;
  finished_at: string | null;
  processed: number;
  updated: number;
  failed: number;
  skipped: number;
  duration_ms: number | null;
  errors: string[];
  discrepancies: any[];
}

export function LMSConfigurationManager() {
  const [settings, setSettings] = useState<LMSSyncSettings>({
    enabled: false,
    interval: 'daily',
    time: '02:00',
    timezone: 'UTC',
    tolerance_threshold: 0.05,
    auto_resolve_minor: true,
    notification_threshold: 5,
    last_sync: null,
    next_sync: null,
  });
  
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadSyncRuns();
  }, []);

  const loadSettings = async () => {
    try {
      // TODO: Implement MongoDB-based settings loading
      console.log('Loading LMS settings - MongoDB implementation needed');
      
      // Mock data for now
      setSettings({
        id: '1',
        enabled: false,
        interval: 'daily',
        time: '02:00',
        timezone: 'UTC',
        tolerance_threshold: 0.05,
        auto_resolve_minor: false,
        notification_threshold: 0.1,
        last_sync: null,
        next_sync: null,
      });
    } catch (error) {
      console.error('Failed to load LMS sync settings:', error);
      toast({
        title: "Error",
        description: "Failed to load LMS sync settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSyncRuns = async () => {
    try {
      // TODO: Implement MongoDB-based sync runs loading
      console.log('Loading sync runs - MongoDB implementation needed');
      setSyncRuns([]);
    } catch (error) {
      console.error('Failed to load sync runs:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement MongoDB-based settings saving
      console.log('Saving LMS settings - MongoDB implementation needed', settings);

      toast({
        title: "Settings Saved",
        description: "LMS sync settings have been updated successfully",
      });

      await loadSettings(); // Refresh to get any computed values
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save LMS sync settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const triggerManualSync = async () => {
    setSyncing(true);
    try {
      // TODO: Implement MongoDB-based manual sync
      console.log('Manual sync triggered - MongoDB implementation needed');

      toast({
        title: "Sync Complete",
        description: "Manual sync completed (MongoDB implementation needed)",
      });

      await loadSyncRuns(); // Refresh sync runs
      await loadSettings(); // Refresh settings for last_sync time
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Manual sync could not be completed. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />Running</Badge>;
      case 'success':
        return <Badge variant="default" className="flex items-center gap-1 bg-success text-success-foreground"><CheckCircle className="h-3 w-3" />Success</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Partial</Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LMS Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            LMS Integration Settings
          </CardTitle>
          <CardDescription>
            Configure automatic synchronization with your Loan Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="history">Sync History</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable LMS Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically synchronize loan data with your LMS
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interval">Sync Frequency</Label>
                  <Select
                    value={settings.interval}
                    onValueChange={(interval: any) => setSettings({ ...settings, interval })}
                  >
                    <SelectTrigger id="interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-monthly">Bi-monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Sync Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={settings.time}
                    onChange={(e) => setSettings({ ...settings, time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(timezone) => setSettings({ ...settings, timezone })}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tolerance">Tolerance Threshold (%)</Label>
                  <Input
                    id="tolerance"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.tolerance_threshold * 100}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      tolerance_threshold: parseFloat(e.target.value) / 100 
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage difference threshold for triggering updates
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-resolve Minor Discrepancies</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically update loans with minor differences
                  </p>
                </div>
                <Switch
                  checked={settings.auto_resolve_minor}
                  onCheckedChange={(auto_resolve_minor) => 
                    setSettings({ ...settings, auto_resolve_minor })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                  {settings.last_sync && (
                    <p className="text-sm text-muted-foreground">
                      Last sync: {format(new Date(settings.last_sync), 'PPp')}
                    </p>
                  )}
                  {settings.next_sync && (
                    <p className="text-sm text-muted-foreground">
                      Next sync: {format(new Date(settings.next_sync), 'PPp')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={triggerManualSync}
                    disabled={syncing}
                    className="flex items-center gap-2"
                  >
                    {syncing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Button>

                  <Button onClick={saveSettings} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Recent Sync Runs</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSyncRuns}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Processed</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Failed</TableHead>
                        <TableHead>Skipped</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncRuns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No sync runs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        syncRuns.map((run) => (
                          <TableRow key={run.id}>
                            <TableCell>{getStatusBadge(run.status)}</TableCell>
                            <TableCell>
                              {format(new Date(run.started_at), 'MMM d, yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              {run.duration_ms ? `${Math.round(run.duration_ms / 1000)}s` : '-'}
                            </TableCell>
                            <TableCell>{run.processed}</TableCell>
                            <TableCell>{run.updated}</TableCell>
                            <TableCell>{run.failed}</TableCell>
                            <TableCell>{run.skipped}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}