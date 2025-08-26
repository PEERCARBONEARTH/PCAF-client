import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Thermometer,
  Clock,
  TrendingUp,
  Wifi,
  Radio,
  Database,
  Settings
} from 'lucide-react';

interface MRVData {
  operationalDays: number;
  dailyUsageHours: number;
  fuelSavings: string;
  co2Reduction: string;
}

interface ProjectData {
  id: string;
  schoolName: string;
  location: string;
  status: string;
  mrvData: MRVData | null;
  serialNumber: string;
}

interface MRVIntegrationPanelProps {
  projects: ProjectData[];
}

export function MRVIntegrationPanel({ projects }: MRVIntegrationPanelProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  // Mock real-time data
  const realtimeMetrics = {
    activeDevices: 156,
    dataLatency: '2.3s',
    uptime: 99.2,
    lastSync: '1 min ago'
  };

  const thresholds = {
    minOperationalDays: 30,
    minDailyUsage: 2.0,
    minFuelSavings: 70,
    minCO2Reduction: 1.5
  };

  const checkThreshold = (project: ProjectData) => {
    if (!project.mrvData) return { passed: false, score: 0 };
    
    const { operationalDays, dailyUsageHours, fuelSavings, co2Reduction } = project.mrvData;
    const fuelSavingsNum = parseFloat(fuelSavings.replace('%', ''));
    const co2ReductionNum = parseFloat(co2Reduction.replace(' tCO2e', ''));
    
    const checks = [
      operationalDays >= thresholds.minOperationalDays,
      dailyUsageHours >= thresholds.minDailyUsage,
      fuelSavingsNum >= thresholds.minFuelSavings,
      co2ReductionNum >= thresholds.minCO2Reduction
    ];
    
    const score = checks.filter(Boolean).length;
    return { passed: score === 4, score };
  };

  const operationalProjects = projects.filter(p => p.status === 'operational' && p.mrvData);

  return (
    <div className="space-y-6">
      {/* Real-time System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Radio className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Devices</p>
                <p className="text-xl font-bold">{realtimeMetrics.activeDevices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Data Latency</p>
                <p className="text-xl font-bold">{realtimeMetrics.dataLatency}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">System Uptime</p>
                <p className="text-xl font-bold">{realtimeMetrics.uptime}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Last Sync</p>
                <p className="text-xl font-bold">{realtimeMetrics.lastSync}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="thresholds">Threshold Management</TabsTrigger>
          <TabsTrigger value="verification">Performance Verification</TabsTrigger>
          <TabsTrigger value="settings">Integration Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Assets - Live MRV Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operationalProjects.map((project) => {
                  const thresholdCheck = checkThreshold(project);
                  
                  return (
                    <div key={project.id} className="border rounded-sm p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{project.schoolName}</h3>
                          <p className="text-sm text-muted-foreground">{project.location}</p>
                          <p className="text-xs text-muted-foreground">Serial: {project.serialNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={thresholdCheck.passed ? "default" : "secondary"}>
                            {thresholdCheck.passed ? "Verified" : "Monitoring"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Wifi className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">Online</span>
                          </div>
                        </div>
                      </div>

                      {project.mrvData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Operational Days</span>
                            </div>
                            <p className="text-lg font-bold">{project.mrvData.operationalDays}</p>
                            <Progress value={(project.mrvData.operationalDays / thresholds.minOperationalDays) * 100} className="h-1" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Daily Usage</span>
                            </div>
                            <p className="text-lg font-bold">{project.mrvData.dailyUsageHours}h</p>
                            <Progress value={(project.mrvData.dailyUsageHours / 8) * 100} className="h-1" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">Fuel Savings</span>
                            </div>
                            <p className="text-lg font-bold">{project.mrvData.fuelSavings}</p>
                            <Progress value={parseFloat(project.mrvData.fuelSavings.replace('%', ''))} className="h-1" />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-emerald-500" />
                              <span className="text-sm font-medium">CO₂ Reduction</span>
                            </div>
                            <p className="text-lg font-bold">{project.mrvData.co2Reduction}</p>
                            <Progress value={(parseFloat(project.mrvData.co2Reduction.replace(' tCO2e', '')) / 5) * 100} className="h-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disbursement Threshold Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Minimum Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm">Operational Days</span>
                      <Badge variant="outline">{thresholds.minOperationalDays} days</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm">Daily Usage Hours</span>
                      <Badge variant="outline">{thresholds.minDailyUsage} hours</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm">Fuel Savings</span>
                      <Badge variant="outline">{thresholds.minFuelSavings}%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="text-sm">CO₂ Reduction</span>
                      <Badge variant="outline">{thresholds.minCO2Reduction} tCO2e</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Verification Status</h3>
                  <div className="space-y-3">
                    {operationalProjects.map((project) => {
                      const check = checkThreshold(project);
                      return (
                        <div key={project.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <span className="text-sm">{project.schoolName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{check.score}/4</span>
                            {check.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Verification Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operationalProjects.map((project) => {
                  const check = checkThreshold(project);
                  
                  return (
                    <div key={project.id} className="border rounded-sm p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">{project.schoolName}</h3>
                        <Badge variant={check.passed ? "default" : "secondary"}>
                          {check.passed ? "Disbursement Ready" : "Under Review"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Verification Score:</span>
                          <span className="ml-2 font-medium">{check.score}/4 criteria met</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data Quality:</span>
                          <span className="ml-2 font-medium text-green-600">98.5% uptime</span>
                        </div>
                      </div>
                      
                      {check.passed && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <Button size="sm" className="w-full">
                            Trigger Disbursement
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MRV Integration Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">API Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Saastain API Status:</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Sync Interval:</span>
                        <span>5 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Health Check:</span>
                        <span>2 min ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Alert Settings</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Device Offline Alert:</span>
                        <Badge variant="outline">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Threshold Breach Alert:</span>
                        <Badge variant="outline">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Quality Alert:</span>
                        <Badge variant="outline">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure API
                  </Button>
                  <Button variant="outline" size="sm">
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}