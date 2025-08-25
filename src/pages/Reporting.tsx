import { useState } from "react";
import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { ErrorState } from "@/components/ErrorBoundary";
import { PortfolioOverviewDashboard } from "@/components/reports/PortfolioOverviewDashboard";
import { ImpactAnalyticsDashboard } from "@/components/reports/ImpactAnalyticsDashboard";
import { ReportGenerationCenter } from "@/components/reports/ReportGenerationCenter";
import { 
  BarChart3, 
  Filter,
  Settings
} from "lucide-react";

export default function Reporting() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const { reportsError, refetchReports } = useRealTimeData();

  if (reportsError) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Failed to load reports data"
          message="Unable to fetch the latest reporting data. Please try again."
          onRetry={refetchReports}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Portfolio Reports & Analytics</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Track portfolio performance, impact metrics, and generate comprehensive reports
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter Data
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Simplified Reporting Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio Overview</TabsTrigger>
            <TabsTrigger value="analytics">Impact Analytics</TabsTrigger>
            <TabsTrigger value="reports">Generate Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-8">
            <PortfolioOverviewDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <ImpactAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-8">
            <ReportGenerationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}