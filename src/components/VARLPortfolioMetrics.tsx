import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Package, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  Target,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface PortfolioMetrics {
  totalProjects: number;
  totalAssets: number;
  assetsDeployed: number;
  assetsOperational: number;
  totalDisbursed: number;
  pendingDisbursement: number;
  averageDeploymentTime: number;
  verificationRate: number;
}

interface VARLPortfolioMetricsProps {
  metrics: PortfolioMetrics;
}

export function VARLPortfolioMetrics({ metrics }: VARLPortfolioMetricsProps) {
  const deploymentRate = Math.round((metrics.assetsDeployed / metrics.totalAssets) * 100);
  const operationalRate = Math.round((metrics.assetsOperational / metrics.assetsDeployed) * 100);
  const disbursementRate = Math.round((metrics.totalDisbursed / (metrics.totalDisbursed + metrics.pendingDisbursement)) * 100);

  const metricCards = [
    {
      title: 'Total Assets in Pipeline',
      value: metrics.totalAssets.toLocaleString(),
      subtitle: `${metrics.totalProjects} projects`,
      icon: Package,
      color: 'blue',
      trend: '+12% vs last month'
    },
    {
      title: 'Assets Deployed',
      value: metrics.assetsDeployed.toLocaleString(),
      subtitle: `${deploymentRate}% deployment rate`,
      icon: CheckCircle,
      color: 'green',
      progress: deploymentRate
    },
    {
      title: 'Assets Deployment Rate',
      value: `${deploymentRate}%`,
      subtitle: `${metrics.assetsOperational} operational`,
      icon: Zap,
      color: 'emerald',
      progress: deploymentRate
    },
    {
      title: 'Total Disbursed',
      value: `$${(metrics.totalDisbursed / 1000000).toFixed(1)}M`,
      subtitle: `${disbursementRate}% of allocated funds`,
      icon: DollarSign,
      color: 'purple',
      progress: disbursementRate
    },
    {
      title: 'Pending Disbursed',
      value: `$${(metrics.pendingDisbursement / 1000000).toFixed(1)}M`,
      subtitle: 'Awaiting verification',
      icon: Clock,
      color: 'orange',
      alert: metrics.pendingDisbursement > 3000000
    },
    {
      title: 'Average Deployment Time',
      value: `${metrics.averageDeploymentTime} days`,
      subtitle: 'From PO to operational',
      icon: Target,
      color: 'indigo',
      trend: '-3 days vs target'
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'emerald': return 'text-emerald-600 bg-emerald-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-sm ${getIconColor(metric.color)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {metric.alert && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  
                  <h3 className="text-xs font-medium text-muted-foreground mb-1">
                    {metric.title}
                  </h3>
                  
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">
                      {metric.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {metric.subtitle}
                    </p>
                  </div>

                  {metric.progress && (
                    <div className="mt-3">
                      <Progress value={metric.progress} className="h-1.5" />
                    </div>
                  )}

                  {metric.trend && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {metric.trend}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
