import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Thermometer, 
  Zap, 
  Clock, 
  Wifi, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  Gauge
} from 'lucide-react';

interface MRVDataFeedProps {
  projectId: string;
  schoolName: string;
}

interface LiveMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    min: number;
    max: number;
    target: number;
  };
  lastUpdated: string;
}

interface MRVDataPoint {
  timestamp: string;
  metric: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  verified: boolean;
}

export default function SiteMRVDataFeed({ projectId, schoolName }: MRVDataFeedProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const liveMetrics: LiveMetric[] = [
    {
      id: 'steam-hours',
      name: 'Daily Steam Hours',
      value: 8.5,
      unit: 'hours',
      icon: <Clock className="h-5 w-5" />,
      status: 'normal',
      trend: 'up',
      threshold: { min: 6, max: 12, target: 8 },
      lastUpdated: '2 minutes ago'
    },
    {
      id: 'temperature',
      name: 'Operating Temperature',
      value: 85,
      unit: '°C',
      icon: <Thermometer className="h-5 w-5" />,
      status: 'normal',
      trend: 'stable',
      threshold: { min: 75, max: 95, target: 85 },
      lastUpdated: '1 minute ago'
    },
    {
      id: 'efficiency',
      name: 'System Efficiency',
      value: 94,
      unit: '%',
      icon: <Gauge className="h-5 w-5" />,
      status: 'normal',
      trend: 'up',
      threshold: { min: 85, max: 100, target: 90 },
      lastUpdated: '3 minutes ago'
    },
    {
      id: 'fuel-saved',
      name: 'Fuel Saved Today',
      value: 76,
      unit: 'kg',
      icon: <TrendingUp className="h-5 w-5" />,
      status: 'normal',
      trend: 'up',
      threshold: { min: 50, max: 100, target: 70 },
      lastUpdated: '1 minute ago'
    },
    {
      id: 'co2-reduced',
      name: 'CO₂ Reduced Today',
      value: 1.2,
      unit: 'tons',
      icon: <Activity className="h-5 w-5" />,
      status: 'normal',
      trend: 'up',
      threshold: { min: 0.8, max: 2.0, target: 1.0 },
      lastUpdated: '2 minutes ago'
    },
    {
      id: 'uptime',
      name: 'System Uptime',
      value: 98.5,
      unit: '%',
      icon: <Wifi className="h-5 w-5" />,
      status: 'normal',
      trend: 'stable',
      threshold: { min: 95, max: 100, target: 98 },
      lastUpdated: '30 seconds ago'
    }
  ];

  const recentMRVData: MRVDataPoint[] = [
    {
      timestamp: '2024-01-15T14:30:00Z',
      metric: 'Steam Hours',
      value: 8.5,
      unit: 'hours',
      status: 'normal',
      verified: true
    },
    {
      timestamp: '2024-01-15T14:25:00Z',
      metric: 'CO₂ Reduction',
      value: 1.2,
      unit: 'tons',
      status: 'normal',
      verified: true
    },
    {
      timestamp: '2024-01-15T14:20:00Z',
      metric: 'Fuel Savings',
      value: 76,
      unit: 'kg',
      status: 'normal',
      verified: true
    },
    {
      timestamp: '2024-01-15T14:15:00Z',
      metric: 'Temperature',
      value: 85,
      unit: '°C',
      status: 'normal',
      verified: true
    },
    {
      timestamp: '2024-01-15T14:10:00Z',
      metric: 'System Efficiency',
      value: 94,
      unit: '%',
      status: 'normal',
      verified: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getProgressColor = (value: number, threshold: { min: number; max: number; target: number }) => {
    if (value < threshold.min) return 'bg-destructive';
    if (value >= threshold.target) return 'bg-success';
    return 'bg-warning';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Live MRV Data Feed</h3>
          <p className="text-sm text-muted-foreground">{schoolName} - Real-time monitoring & verification</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={isLive ? 'bg-success/10 text-success border-success/20' : 'bg-muted/50 text-muted-foreground border-muted'}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            {isLive ? 'Live Feed' : 'Offline'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setLastRefresh(new Date())}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-success" />
              Connection Status
            </span>
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </CardTitle>
          <CardDescription>
            MRV sensor connectivity and data transmission status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="text-lg font-bold text-success mb-1">6/6</div>
              <div className="text-xs text-muted-foreground">Sensors Online</div>
            </div>
            
            <div className="text-center p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="text-lg font-bold text-success mb-1">98.5%</div>
              <div className="text-xs text-muted-foreground">Data Reliability</div>
            </div>
            
            <div className="text-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="text-lg font-bold text-primary mb-1">24/7</div>
              <div className="text-xs text-muted-foreground">Monitoring Active</div>
            </div>
            
            <div className="text-center p-3 bg-finance/5 border border-finance/20 rounded-lg">
              <div className="text-lg font-bold text-finance mb-1">ISO 14064</div>
              <div className="text-xs text-muted-foreground">MRV Standard</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveMetrics.map((metric) => (
          <Card key={metric.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {metric.icon}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    <CardDescription className="text-xs">{metric.lastUpdated}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {metric.unit}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {metric.threshold.min}{metric.unit}</span>
                    <span>Target: {metric.threshold.target}{metric.unit}</span>
                    <span>Max: {metric.threshold.max}{metric.unit}</span>
                  </div>
                  <Progress 
                    value={(metric.value / metric.threshold.max) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent MRV Data Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Recent MRV Data Log
          </CardTitle>
          <CardDescription>
            Latest verified data points from monitoring sensors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMRVData.map((dataPoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {dataPoint.verified ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {dataPoint.metric}
                    </span>
                  </div>
                  <Badge className={getStatusColor(dataPoint.status)}>
                    {dataPoint.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {dataPoint.value} {dataPoint.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(dataPoint.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing latest 5 data points • All data verified via blockchain
              </p>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality & Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Data Quality & Verification
          </CardTitle>
          <CardDescription>
            Verification status and data quality metrics for MRV compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Data Completeness</p>
              <div className="flex items-center gap-2">
                <Progress value={98.5} className="flex-1 h-2" />
                <span className="text-sm font-medium text-foreground">98.5%</span>
              </div>
              <p className="text-xs text-muted-foreground">1,247 of 1,266 expected readings</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Verification Rate</p>
              <div className="flex items-center gap-2">
                <Progress value={100} className="flex-1 h-2" />
                <span className="text-sm font-medium text-foreground">100%</span>
              </div>
              <p className="text-xs text-muted-foreground">All data points verified</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <div className="flex items-center gap-2">
                <Progress value={96} className="flex-1 h-2" />
                <span className="text-sm font-medium text-foreground">96%</span>
              </div>
              <p className="text-xs text-muted-foreground">ISO 14064 compliant</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">MRV Threshold Met</span>
            </div>
            <p className="text-sm text-muted-foreground">
              System has maintained operational thresholds for 18 consecutive days. 
              Ready for performance verification and disbursement trigger.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}