import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeUpdates, usePortfolioUpdates, useCalculationUpdates } from '@/hooks/useRealTimeUpdates';
import { useDataSync, usePortfolioSync } from '@/hooks/useDataSync';
import { useOptimisticLoanUpdates } from '@/hooks/useOptimisticUpdates';
import { RealTimeStatusIndicator } from '@/components/realtime/RealTimeStatusIndicator';
import { apiClient } from '@/services/api';
import { 
  Activity, 
  Database, 
  Zap, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export function RealTimeDemo() {
  const [demoLoan, setDemoLoan] = useState({
    borrower_name: 'Demo Borrower',
    loan_amount: 25000,
    interest_rate: 5.5,
    term_months: 60,
    origination_date: new Date().toISOString().split('T')[0],
    vehicle_details: {
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      type: 'passenger_car' as const,
      fuel_type: 'gasoline' as const,
      value_at_origination: 25000,
      efficiency_mpg: 32,
      annual_mileage: 12000
    }
  });

  // Real-time updates hooks
  const { 
    isConnected, 
    updates, 
    latestUpdate, 
    connect, 
    disconnect, 
    requestRefresh 
  } = useRealTimeUpdates({ autoConnect: true });

  const portfolioUpdates = usePortfolioUpdates();
  const calculationUpdates = useCalculationUpdates();

  // Data sync hooks
  const { 
    data: portfolioData, 
    isLoading: portfolioLoading, 
    isStale: portfolioStale,
    refresh: refreshPortfolio,
    optimisticUpdate: portfolioOptimisticUpdate
  } = usePortfolioSync({
    autoSync: true,
    syncInterval: 30000
  });

  // Optimistic updates hook
  const {
    data: loans,
    isOptimistic,
    error: optimisticError,
    addLoan,
    updateLoan,
    deleteLoan
  } = useOptimisticLoanUpdates(portfolioData?.loans || []);

  const handleCreateLoan = async () => {
    try {
      await addLoan(
        demoLoan,
        () => apiClient.createLoan(demoLoan)
      );
    } catch (error) {
      console.error('Failed to create loan:', error);
    }
  };

  const handleUpdateLoan = async (loanId: string) => {
    try {
      const updates = { loan_amount: 30000 };
      await updateLoan(
        loanId,
        updates,
        () => apiClient.updateLoan(loanId, updates)
      );
    } catch (error) {
      console.error('Failed to update loan:', error);
    }
  };

  const handleDeleteLoan = async (loanId: string) => {
    try {
      await deleteLoan(
        loanId,
        () => apiClient.deleteLoan(loanId)
      );
    } catch (error) {
      console.error('Failed to delete loan:', error);
    }
  };

  const handleOptimisticPortfolioUpdate = async () => {
    try {
      const optimisticMetrics = {
        ...portfolioData,
        total_loans: (portfolioData?.total_loans || 0) + 1,
        total_emissions: (portfolioData?.total_emissions || 0) + 2.5
      };

      await portfolioOptimisticUpdate(
        optimisticMetrics,
        () => new Promise(resolve => setTimeout(() => resolve(optimisticMetrics), 2000))
      );
    } catch (error) {
      console.error('Failed to update portfolio:', error);
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'loan_created':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'loan_updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'loan_deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'calculation_completed':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'portfolio_updated':
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUpdateType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Real-Time System Demo</h1>
        <RealTimeStatusIndicator position="inline" showDetails={false} />
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={connect}
                disabled={isConnected}
              >
                Connect
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnect}
                disabled={!isConnected}
              >
                Disconnect
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => requestRefresh('portfolio')}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="updates">Real-Time Updates</TabsTrigger>
          <TabsTrigger value="data-sync">Data Sync</TabsTrigger>
          <TabsTrigger value="optimistic">Optimistic Updates</TabsTrigger>
          <TabsTrigger value="demo-actions">Demo Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Updates Feed</CardTitle>
              <CardDescription>
                Real-time updates from the server ({updates.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {updates.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {updates.slice(0, 10).map((update, index) => (
                    <div key={update.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getUpdateIcon(update.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatUpdateType(update.type)}</span>
                          <Badge variant="outline" className="text-xs">
                            {update.timestamp.toLocaleTimeString()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {JSON.stringify(update.data, null, 2).slice(0, 100)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No updates received yet
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Latest: {portfolioUpdates.latestUpdate?.timestamp.toLocaleString() || 'None'}
                </div>
                <div className="text-sm">
                  Count: {portfolioUpdates.updates.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculation Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Latest: {calculationUpdates.latestUpdate?.timestamp.toLocaleString() || 'None'}
                </div>
                <div className="text-sm">
                  Count: {calculationUpdates.updates.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data-sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Synchronization Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {portfolioLoading ? (
                      <Clock className="h-6 w-6 animate-spin mx-auto" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Loading</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {portfolioStale ? (
                      <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Freshness</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{portfolioData?.total_loans || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Loans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {portfolioData?.total_emissions?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Emissions</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={refreshPortfolio}
                  disabled={portfolioLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Portfolio
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleOptimisticPortfolioUpdate}
                >
                  Test Optimistic Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimistic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimistic Updates</CardTitle>
              <CardDescription>
                Test optimistic updates with automatic rollback on failure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optimisticError && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{optimisticError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2 mb-4">
                {isOptimistic && (
                  <Badge variant="outline" className="animate-pulse">
                    Optimistic Update Active
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Loans in state: {loans?.length || 0}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button onClick={handleCreateLoan} disabled={isOptimistic}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Loan
                </Button>
                <Button 
                  onClick={() => loans?.[0] && handleUpdateLoan(loans[0].loan_id)}
                  disabled={isOptimistic || !loans?.[0]}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Update First Loan
                </Button>
                <Button 
                  onClick={() => loans?.[0] && handleDeleteLoan(loans[0].loan_id)}
                  disabled={isOptimistic || !loans?.[0]}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete First Loan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demo-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demo Loan Data</CardTitle>
              <CardDescription>
                Modify the demo loan data for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Borrower Name</label>
                  <input
                    type="text"
                    value={demoLoan.borrower_name}
                    onChange={(e) => setDemoLoan(prev => ({ ...prev, borrower_name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Loan Amount</label>
                  <input
                    type="number"
                    value={demoLoan.loan_amount}
                    onChange={(e) => setDemoLoan(prev => ({ ...prev, loan_amount: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Vehicle Make</label>
                  <input
                    type="text"
                    value={demoLoan.vehicle_details.make}
                    onChange={(e) => setDemoLoan(prev => ({ 
                      ...prev, 
                      vehicle_details: { ...prev.vehicle_details, make: e.target.value }
                    }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Vehicle Model</label>
                  <input
                    type="text"
                    value={demoLoan.vehicle_details.model}
                    onChange={(e) => setDemoLoan(prev => ({ 
                      ...prev, 
                      vehicle_details: { ...prev.vehicle_details, model: e.target.value }
                    }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={handleCreateLoan} className="w-full">
                  Create Demo Loan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}