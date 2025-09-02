/**
 * LMS Integration Dashboard
 * Manages bank LMS connections and data synchronization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Database, 
  Sync, 
  Plus, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Edit,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

import { 
  lmsIntegrationService, 
  LMSConnectionConfig, 
  LMSSyncResult 
} from '@/services/lmsIntegrationService';
import { LMSConnectionForm } from './LMSConnectionForm';
import { LMSSyncMonitor } from './LMSSyncMonitor';

interface LMSIntegrationDashboardProps {
  className?: string;
}

export function LMSIntegrationDashboard({ className }: LMSIntegrationDashboardProps) {
  const [connections, setConnections] = useState<LMSConnectionConfig[]>([]);
  const [syncResults, setSyncResults] = useState<LMSSyncResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [selectedConnection, setSelectedConnection] = useState<LMSConnectionConfig | null>(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [showSyncMonitor, setShowSyncMonitor] = useState(false);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const loadedConnections = lmsIntegrationService.getConnections();
      setConnections(loadedConnections);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load LMS connections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnection = async (connectionData: Omit<LMSConnectionConfig, 'id'>) => {
    try {
      const newConnection = await lmsIntegrationService.createConnection(connectionData);
      setConnections(prev => [...prev, newConnection]);
      setShowConnectionForm(false);
      toast({
        title: "Success",
        description: "LMS connection created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create connection",
        variant: "destructive"
      });
    }
  };

  const handleUpdateConnection = async (id: string, updates: Partial<LMSConnectionConfig>) => {
    try {
      const updatedConnection = await lmsIntegrationService.updateConnection(id, updates);
      setConnections(prev => prev.map(conn => conn.id === id ? updatedConnection : conn));
      toast({
        title: "Success",
        description: "Connection updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update connection",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConnection = async (id: string) => {
    try {
      await lmsIntegrationService.deleteConnection(id);
      setConnections(prev => prev.filter(conn => conn.id !== id));
      toast({
        title: "Success",
        description: "Connection deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete connection",
        variant: "destructive"
      });
    }
  };

  const handleSyncConnection = async (connectionId: string) => {
    try {
      setSyncing(prev => new Set(prev).add(connectionId));
      const result = await lmsIntegrationService.syncConnection(connectionId);
      setSyncResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      
      // Update connection status
      await loadConnections();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync connection",
        variant: "destructive"
      });
    } finally {
      setSyncing(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectionId);
        return newSet;
      });
    }
  };

  const handleSyncAll = async () => {
    try {
      const activeConnections = connections.filter(conn => conn.isActive);
      const syncPromises = activeConnections.map(conn => {
        setSyncing(prev => new Set(prev).add(conn.id));
        return lmsIntegrationService.syncConnection(conn.id);
      });

      const results = await Promise.allSettled(syncPromises);
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<LMSSyncResult> => result.status === 'fulfilled')
        .map(result => result.value);

      setSyncResults(prev => [...successfulResults, ...prev].slice(0, 10));
      await loadConnections();

      toast({
        title: "Bulk Sync Complete",
        description: `Synced ${successfulResults.length} connections`
      });
    } catch (error) {
      toast({
        title: "Bulk Sync Failed",
        description: "Some connections failed to sync",
        variant: "destructive"
      });
    } finally {
      setSyncing(new Set());
    }
  };

  const getConnectionStatusBadge = (connection: LMSConnectionConfig) => {
    if (!connection.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (syncing.has(connection.id)) {
      return <Badge variant="outline" className="animate-pulse">Syncing</Badge>;
    }

    switch (connection.lastSyncStatus) {
      case 'SUCCESS':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'PARTIAL':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Partial</Badge>;
      default:
        return <Badge variant="outline">Not Synced</Badge>;
    }
  };

  const formatLastSync = (lastSyncTime?: string) => {
    if (!lastSyncTime) return 'Never';
    
    const date = new Date(lastSyncTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">LMS Integration</h2>
          <p className="text-muted-foreground">
            Manage bank Loan Management System connections and data synchronization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowSyncMonitor(true)}
            disabled={syncResults.length === 0}
          >
            <Clock className="h-4 w-4 mr-2" />
            Sync History
          </Button>
          <Button
            variant="outline"
            onClick={handleSyncAll}
            disabled={connections.filter(c => c.isActive).length === 0 || syncing.size > 0}
          >
            <Sync className="h-4 w-4 mr-2" />
            Sync All
          </Button>
          <Button onClick={() => setShowConnectionForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Connection
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
            <p className="text-xs text-muted-foreground">
              {connections.filter(c => c.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <Sync className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {connections.filter(c => c.lastSyncStatus === 'SUCCESS').length}
            </div>
            <p className="text-xs text-muted-foreground">
              successful connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncResults.length > 0 ? syncResults[0].recordsSuccessful : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              records processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Syncs</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncing.size}</div>
            <p className="text-xs text-muted-foreground">
              currently running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connections Table */}
      <Card>
        <CardHeader>
          <CardTitle>LMS Connections</CardTitle>
          <CardDescription>
            Manage your bank LMS connections and monitor sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No LMS Connections</h3>
              <p className="text-muted-foreground mb-4">
                Connect to your bank's Loan Management System to automatically import loan data
              </p>
              <Button onClick={() => setShowConnectionForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Connection
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{connection.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {connection.endpoint}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{connection.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {getConnectionStatusBadge(connection)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatLastSync(connection.lastSyncTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {syncResults
                          .filter(r => r.connectionId === connection.id)
                          .slice(0, 1)
                          .map(r => `${r.recordsSuccessful}/${r.recordsProcessed}`)
                          .join('') || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {connection.syncSchedule.enabled ? (
                          <Badge variant="outline" className="text-xs">
                            {connection.syncSchedule.frequency}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Manual
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncConnection(connection.id)}
                          disabled={syncing.has(connection.id) || !connection.isActive}
                        >
                          {syncing.has(connection.id) ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedConnection(connection);
                                setShowConnectionForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateConnection(connection.id, { 
                                isActive: !connection.isActive 
                              })}
                            >
                              {connection.isActive ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteConnection(connection.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Sync Results */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sync Results</CardTitle>
            <CardDescription>
              Latest synchronization results from your LMS connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncResults.slice(0, 5).map((result, index) => (
                <div key={`${result.connectionId}-${result.startTime}`} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {result.status === 'SUCCESS' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : result.status === 'FAILED' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {connections.find(c => c.id === result.connectionId)?.name || 'Unknown Connection'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(result.endTime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {result.recordsSuccessful}/{result.recordsProcessed} records
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.summary.newInstruments} new instruments
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Form Dialog */}
      <Dialog open={showConnectionForm} onOpenChange={setShowConnectionForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedConnection ? 'Edit LMS Connection' : 'Add LMS Connection'}
            </DialogTitle>
            <DialogDescription>
              Configure your bank's Loan Management System connection for automated data import
            </DialogDescription>
          </DialogHeader>
          <LMSConnectionForm
            connection={selectedConnection}
            onSubmit={selectedConnection ? 
              (data) => handleUpdateConnection(selectedConnection.id, data) :
              handleCreateConnection
            }
            onCancel={() => {
              setShowConnectionForm(false);
              setSelectedConnection(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Sync Monitor Dialog */}
      <Dialog open={showSyncMonitor} onOpenChange={setShowSyncMonitor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sync History & Monitoring</DialogTitle>
            <DialogDescription>
              Detailed view of LMS synchronization history and results
            </DialogDescription>
          </DialogHeader>
          <LMSSyncMonitor
            syncResults={syncResults}
            connections={connections}
            onClose={() => setShowSyncMonitor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}