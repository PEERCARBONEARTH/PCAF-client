/**
 * Pipeline Monitor - Real-time dashboard for data pipeline status and metrics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  TrendingUp,
  Settings
} from 'lucide-react';
import { pipelineOrchestrator } from '@/services/pipeline-orchestrator';
import { toast } from '@/hooks/use-toast';

interface PipelineMonitorProps {
  className?: string;
}

export const PipelineMonitor: React.FC<PipelineMonitorProps> = ({ className }) => {
  const [status, setStatus] = useState(pipelineOrchestrator.getStatus());
  const [schedules, setSchedules] = useState(pipelineOrchestrator.getSchedules());
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [dataQuality, setDataQuality] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set up real-time status updates
    const interval = setInterval(() => {
      setStatus(pipelineOrchestrator.getStatus());
      setSchedules(pipelineOrchestrator.getSchedules());
    }, 1000);

    // Load initial data
    loadHealthMetrics();
    loadDataQuality();

    return () => clearInterval(interval);
  }, []);

  const loadHealthMetrics = async () => {
    try {
      const metrics = await pipelineOrchestrator.getHealthMetrics();
      setHealthMetrics(metrics);
    } catch (error) {
      console.error('Failed to load health metrics:', error);
    }
  };

  const loadDataQuality = async () => {
    try {
      const quality = await pipelineOrchestrator.assessDataQuality();
      setDataQuality(quality);
    } catch (error) {
      console.error('Failed to load data quality:', error);
    }
  };

  const handleRunPipeline = async (fullRefresh = false) => {
    setIsLoading(true);
    try {
      await pipelineOrchestrator.runPipeline({ fullRefresh });
      toast({
        title: "Pipeline Started",
        description: `${fullRefresh ? 'Full refresh' : 'Incremental update'} pipeline started successfully.`,
      });
      await loadHealthMetrics();
      await loadDataQuality();
    } catch (error) {
      toast({
        title: "Pipeline Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSchedule = async (scheduleId: string, enabled: boolean) => {
    try {
      pipelineOrchestrator.toggleSchedule(scheduleId, enabled);
      setSchedules(pipelineOrchestrator.getSchedules());
      toast({
        title: "Schedule Updated",
        description: `Schedule ${enabled ? 'enabled' : 'disabled'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Schedule Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (stage: string) => {
    const colors = {
      idle: 'bg-gray-500',
      extracting: 'bg-blue-500',
      transforming: 'bg-yellow-500',
      embedding: 'bg-purple-500',
      storing: 'bg-green-500',
      completing: 'bg-emerald-500'
    };
    return colors[stage] || 'bg-gray-500';
  };

  const getHealthColor = (health: string) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    };
    return colors[health] || 'text-gray-600';
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pipeline Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Pipeline Monitor
              </CardTitle>
              <CardDescription>
                Real-time monitoring of portfolio data processing pipeline
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleRunPipeline(false)}
                disabled={status.isRunning || isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Incremental
              </Button>
              <Button
                onClick={() => handleRunPipeline(true)}
                disabled={status.isRunning || isLoading}
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Full Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Current Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status.currentStage)}`} />
                <span className="font-medium capitalize">{status.currentStage}</span>
              </div>
              {status.isRunning && (
                <Progress value={status.progress} className="h-2" />
              )}
            </div>

            {/* Records Processed */}
            <div className="text-center">
              <div className="text-2xl font-bold">{status.metrics.recordsProcessed.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Records Processed</div>
            </div>

            {/* Success Rate */}
            <div className="text-center">
              <div className="text-2xl font-bold">{status.metrics.successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>

            {/* Processing Time */}
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatDuration(status.metrics.averageProcessingTime)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Processing Time</div>
            </div>
          </div>

          {status.lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Last Error:</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{status.lastError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="health">Health Metrics</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Schedules</CardTitle>
              <CardDescription>
                Manage automated pipeline execution schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{schedule.name}</h4>
                        <Badge variant={schedule.enabled ? "default" : "secondary"}>
                          {schedule.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {schedule.frequency}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {schedule.lastRun && (
                          <span>Last run: {schedule.lastRun.toLocaleString()}</span>
                        )}
                        {schedule.nextRun && schedule.enabled && (
                          <span className="ml-4">Next run: {schedule.nextRun.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Data types: {schedule.config.dataTypes.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSchedule(schedule.id, !schedule.enabled)}
                      >
                        {schedule.enabled ? (
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
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Metrics Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  {healthMetrics?.pipelineHealth === 'healthy' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  <div>
                    <div className={`font-medium ${getHealthColor(healthMetrics?.pipelineHealth)}`}>
                      {healthMetrics?.pipelineHealth || 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground">Pipeline Health</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">
                      {healthMetrics?.lastSuccessfulRun 
                        ? healthMetrics.lastSuccessfulRun.toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Last Success</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">{healthMetrics?.failureRate.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Failure Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">
                      {healthMetrics?.dataFreshness.toFixed(1)}h
                    </div>
                    <div className="text-sm text-muted-foreground">Data Age</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Score</CardTitle>
                <CardDescription>
                  Overall PCAF data quality assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold">
                    {dataQuality?.overallScore.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average PCAF Score (1=Best, 5=Worst)
                  </div>
                  <Progress 
                    value={dataQuality ? (5 - dataQuality.overallScore) * 20 : 0} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Issues</CardTitle>
                <CardDescription>
                  Identified issues requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataQuality?.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                        issue.severity === 'high' ? 'text-red-500' :
                        issue.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{issue.description}</div>
                        <div className="text-sm text-muted-foreground">
                          Affects {issue.affectedRecords} records
                        </div>
                      </div>
                      <Badge variant={
                        issue.severity === 'high' ? 'destructive' :
                        issue.severity === 'medium' ? 'default' :
                        'secondary'
                      }>
                        {issue.severity}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-8">
                      No data quality issues detected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {dataQuality?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggested actions to improve data quality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dataQuality.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PipelineMonitor;