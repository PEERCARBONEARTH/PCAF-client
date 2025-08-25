import { useParams, useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Activity, Zap, Gauge, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";

export default function AssetMonitoring() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { currentPlatform } = usePlatform();

  const handleBack = () => {
    const projectPath = currentPlatform ? `/${currentPlatform}/projects/PRJ-001` : "/";
    navigate(projectPath);
  };

  // Mock asset data
  const assetData = {
    id: assetId,
    name: `Solar Panel Array ${assetId?.slice(-3)}`,
    type: "Solar",
    status: "operational",
    capacity: "250 kW",
    efficiency: 94.2,
    uptime: 99.8,
    powerGenerated: "2,847 kWh",
    co2Avoided: "1.42 tons",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15"
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-500";
      case "maintenance": return "text-yellow-500";
      case "offline": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return CheckCircle;
      case "maintenance": return AlertTriangle;
      case "offline": return AlertTriangle;
      default: return Activity;
    }
  };

  const StatusIcon = getStatusIcon(assetData.status);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{assetData.name}</h1>
            <p className="text-muted-foreground">Asset ID: {assetData.id}</p>
          </div>
        </div>
        <Badge variant="outline" className={getStatusColor(assetData.status)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {assetData.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Capacity"
          value={assetData.capacity}
          icon="zap"
          trend={{ value: "0%", isPositive: true }}
        />
        <MetricCard
          title="Efficiency"
          value={`${assetData.efficiency}%`}
          icon="gauge"
          trend={{ value: "2.1%", isPositive: true }}
        />
        <MetricCard
          title="Uptime"
          value={`${assetData.uptime}%`}
          icon="activity"
          trend={{ value: "0.3%", isPositive: true }}
        />
        <MetricCard
          title="CO₂ Avoided"
          value={assetData.co2Avoided}
          icon="trending-up"
          trend={{ value: "5.2%", isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Real-time asset performance data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Power Output</span>
                <span className="text-sm text-muted-foreground">235 kW / 250 kW</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Daily Target</span>
                <span className="text-sm text-muted-foreground">2,847 kWh / 3,000 kWh</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">System Health</span>
                <span className="text-sm text-muted-foreground">Excellent</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
            <CardDescription>Upcoming maintenance and service history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Maintenance</span>
                <span className="text-sm text-muted-foreground">{assetData.lastMaintenance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Next Scheduled</span>
                <span className="text-sm text-muted-foreground">{assetData.nextMaintenance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline" className="text-green-500">
                  On Schedule
                </Badge>
              </div>
            </div>
            <div className="pt-4">
              <Button className="w-full" variant="outline">
                Schedule Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}