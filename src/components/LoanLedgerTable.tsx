import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { portfolioService, type LoanData } from "@/services/portfolioService";
import { apiClient } from "@/services/api";
import { LoanDetailView } from "@/components/LoanDetailView";
import { LMSSyncStatusIndicator } from "@/components/LMSSyncStatusIndicator";
import { LoanLedgerRecommendations } from "@/components/LoanLedgerRecommendations";
import {
  ArrowUpDown,
  Filter,
  Download,
  Car,
  AlertCircle,
  TrendingUp,
  Search,
  RefreshCw,
  Trash2,
  Eye
} from "lucide-react";

type SortField = 'loan_id' | 'loan_amount' | 'financed_emissions' | 'data_quality_score' | 'attribution_factor';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  vehicleType: string;
  dataSource: string;
  dataQualityMin: number;
  dataQualityMax: number;
  searchTerm: string;
}

export function LoanLedgerTable() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('loan_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [dataFreshness, setDataFreshness] = useState<'fresh' | 'stale' | 'unknown'>('unknown');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFilters] = useState<FilterState>({
    vehicleType: 'all',
    dataSource: 'all',
    dataQualityMin: 1,
    dataQualityMax: 5,
    searchTerm: ''
  });

  useEffect(() => {
    loadLoans();
  }, [currentPage, sortField, sortDirection, filters]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [loans]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      
      // Build filters for API call
      const apiFilters: any = {};
      if (filters.vehicleType && filters.vehicleType !== 'all') {
        apiFilters.filter_by_vehicle_type = filters.vehicleType;
      }
      
      const response = await apiClient.getPortfolio({
        page: currentPage,
        limit: 50,
        sort_by: sortField === 'financed_emissions' ? 'emissions' : sortField,
        sort_order: sortDirection,
        ...apiFilters
      });
      
      setLoans(response.data.loans);
      setTotalPages(response.data.pagination.totalPages);
      setTotalCount(response.data.pagination.totalCount);
      
      // Check for LMS sync status
      checkLMSSyncStatus();
      
    } catch (error) {
      console.error('Failed to load loans:', error);
      toast({
        title: "Load Error",
        description: "Failed to load loan portfolio data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkLMSSyncStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/lms/sync-status`);
      if (response.ok) {
        const syncStatus = await response.json();
        setLastSyncTime(syncStatus.lastSync ? new Date(syncStatus.lastSync) : null);
        setDataFreshness(syncStatus.dataFreshness || 'unknown');
      }
    } catch (error) {
      console.warn('Could not check LMS sync status:', error);
    }
  };

  const triggerLMSSync = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/lms/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: "LMS Sync Initiated",
          description: "Synchronizing with Loan Management System...",
        });
        
        // Reload data after sync
        setTimeout(() => {
          loadLoans();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not sync with LMS. Check configuration.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Emission factor metadata is now handled by the backend

  const applyFiltersAndSort = () => {
    let filtered = [...loans];

    // Apply client-side filters for data quality and search
    filtered = filtered.filter(loan => 
      loan.emissions_data.data_quality_score >= filters.dataQualityMin && 
      loan.emissions_data.data_quality_score <= filters.dataQualityMax
    );
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(loan => 
        loan.loan_id.toLowerCase().includes(searchLower) ||
        loan.vehicle_details.type.toLowerCase().includes(searchLower) ||
        loan.vehicle_details.fuel_type.toLowerCase().includes(searchLower) ||
        loan.borrower_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLoans(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const deleteLoan = async (loanId: string) => {
    try {
      await apiClient.deleteLoan(loanId, 'Deleted from ledger');
      await loadLoans();
      toast({
        title: "Loan Deleted",
        description: `Loan ${loanId} has been removed from the portfolio.`,
      });
    } catch (error) {
      console.error('Failed to delete loan:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete loan.",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Loan ID', 'Borrower Name', 'Loan Amount', 'Outstanding Balance', 'Vehicle Make', 'Vehicle Model',
      'Vehicle Year', 'Vehicle Type', 'Fuel Type', 'Vehicle Value', 'Attribution Factor', 
      'Annual Emissions (tCO₂e)', 'Financed Emissions (tCO₂e)', 'Data Quality Score'
    ];

    const csvData = filteredLoans.map(loan => [
      loan.loan_id,
      loan.borrower_name,
      loan.loan_amount,
      loan.outstanding_balance,
      loan.vehicle_details.make,
      loan.vehicle_details.model,
      loan.vehicle_details.year,
      loan.vehicle_details.type,
      loan.vehicle_details.fuel_type,
      loan.vehicle_details.value_at_origination,
      (loan.emissions_data.attribution_factor * 100).toFixed(1) + '%',
      loan.emissions_data.annual_emissions_tco2e.toFixed(3),
      loan.emissions_data.financed_emissions_tco2e.toFixed(3),
      loan.emissions_data.data_quality_score
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loan_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Loan ledger exported to CSV file.",
    });
  };

  const getDataQualityBadge = (score: number) => {
    if (score <= 2) return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 badge-enhanced">Excellent</Badge>;
    if (score <= 3) return <Badge variant="secondary" className="badge-enhanced">Good</Badge>;
    if (score <= 4) return <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400 badge-enhanced">Fair</Badge>;
    return <Badge variant="destructive" className="badge-enhanced">Poor</Badge>;
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 badge-enhanced">Verified</Badge>;
      case 'partially_verified': return <Badge variant="secondary" className="badge-enhanced">Partial</Badge>;
      default: return <Badge variant="outline" className="badge-enhanced">Unverified</Badge>;
    }
  };

  const handleRecalcAll = async () => {
    try {
      if (filteredLoans.length === 0) {
        toast({ title: 'No loans to recalculate', description: 'Adjust filters and try again.' });
        return;
      }
      
      toast({ 
        title: 'Recalculation started', 
        description: `Processing ${filteredLoans.length} loans...` 
      });
      
      // Trigger backend recalculation
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/loans/batch-calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_ids: filteredLoans.map(loan => loan.loan_id),
          reporting_date: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        await loadLoans();
        toast({ 
          title: 'Recalculation complete', 
          description: 'All loans have been recalculated successfully.' 
        });
      } else {
        throw new Error('Recalculation failed');
      }
    } catch (e) {
      console.error('Batch recalc error', e);
      toast({ 
        title: 'Batch Error', 
        description: 'Recalculate all failed.', 
        variant: 'destructive' 
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading loan portfolio...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* LMS Sync Status */}
      <LMSSyncStatusIndicator 
        onConfigureClick={() => {
          // Navigate to LMS configuration
          window.location.href = '/financed-emissions/settings';
        }}
        onSyncClick={() => {
          // Reload loans after sync
          setTimeout(() => loadLoans(), 1000);
        }}
      />

      {/* Smart Recommendations */}
      <LoanLedgerRecommendations
        totalLoans={loans.length}
        lmsConnected={lastSyncTime !== null}
        dataFreshness={dataFreshness}
        avgDataQuality={loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.emissions_data.data_quality_score, 0) / loans.length : 0}
        onConfigureLMS={() => window.location.href = '/financed-emissions/settings'}
        onSyncData={triggerLMSSync}
        onImproveQuality={() => window.location.href = '/financed-emissions/data-quality'}
      />

      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Loan Portfolio Ledger
              </CardTitle>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {filteredLoans.length} of {loans.length} loans displayed
                </p>
                {lastSyncTime && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={dataFreshness === 'fresh' ? 'default' : dataFreshness === 'stale' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {dataFreshness === 'fresh' ? '🟢 Fresh' : dataFreshness === 'stale' ? '🔴 Stale' : '⚪ Unknown'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Last sync: {lastSyncTime.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={filteredLoans.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={loadLoans}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={triggerLMSSync}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Sync LMS
              </Button>
              <Button
                onClick={handleRecalcAll}
                className="flex items-center gap-2"
                disabled={filteredLoans.length === 0 || refreshing}
                title={filteredLoans.length === 0 ? 'No loans to recalc' : undefined}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Recalculate All
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters Panel */}
        {showFilters && (
          <CardContent className="border-t bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search loans..."
                    className="pl-9"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select 
                  value={filters.vehicleType} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, vehicleType: value }))}
                >
                  <SelectTrigger className="bg-background border-border z-50">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="passenger_car">Passenger Car</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="commercial_vehicle">Commercial Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dataSource">Source of Data</Label>
                <Select 
                  value={filters.dataSource} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dataSource: value }))}
                >
                  <SelectTrigger className="bg-background border-border z-50">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <SelectItem value="all">All sources</SelectItem>
                    <SelectItem value="csv">CSV Upload</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="qualityMin">Min Quality Score</Label>
                <Select 
                  value={filters.dataQualityMin.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dataQualityMin: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-background border-border z-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <SelectItem value="1">1 (Excellent)</SelectItem>
                    <SelectItem value="2">2 (Good)</SelectItem>
                    <SelectItem value="3">3 (Fair)</SelectItem>
                    <SelectItem value="4">4 (Poor)</SelectItem>
                    <SelectItem value="5">5 (Very Poor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="qualityMax">Max Quality Score</Label>
                <Select 
                  value={filters.dataQualityMax.toString()} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dataQualityMax: parseInt(value) }))}
                >
                  <SelectTrigger className="bg-background border-border z-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <SelectItem value="1">1 (Excellent)</SelectItem>
                    <SelectItem value="2">2 (Good)</SelectItem>
                    <SelectItem value="3">3 (Fair)</SelectItem>
                    <SelectItem value="4">4 (Poor)</SelectItem>
                    <SelectItem value="5">5 (Very Poor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loans Table */}
      <Card>
        <CardContent className="p-0">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No loans found</h3>
              <p className="text-muted-foreground">
                {loans.length === 0 
                  ? "Upload loan data to get started" 
                  : "Try adjusting your filters"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50" 
                      onClick={() => handleSort('loan_id')}
                    >
                      <div className="flex items-center gap-1">
                        Loan ID
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Vehicle Info</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right" 
                      onClick={() => handleSort('loan_amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Loan Amount
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right" 
                      onClick={() => handleSort('attribution_factor')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Attribution
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 text-right" 
                      onClick={() => handleSort('financed_emissions')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Financed Emissions
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50" 
                      onClick={() => handleSort('data_quality_score')}
                    >
                      <div className="flex items-center gap-1">
                        Data Quality
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => (
                    <TableRow key={loan.loan_id} className="table-row-hover">
                      <TableCell className="font-medium">{loan.loan_id}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium capitalize">{loan.vehicle_details.type.replace('_', ' ')}</div>
                          <div className="text-muted-foreground capitalize">{loan.vehicle_details.fuel_type}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">PCAF</Badge>
                            <Badge variant="outline" className="text-xs">{loan.emissions_data.pcaf_data_option}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          <div className="font-medium">${loan.loan_amount.toLocaleString()}</div>
                          <div className="text-muted-foreground">${loan.outstanding_balance.toLocaleString()} outstanding</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{(loan.emissions_data.attribution_factor * 100).toFixed(1)}%</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          <div className="font-medium text-primary">{loan.emissions_data.financed_emissions_tco2e.toFixed(3)} tCO₂e</div>
                          <div className="text-muted-foreground">{loan.emissions_data.annual_emissions_tco2e.toFixed(3)} annual</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getDataQualityBadge(loan.emissions_data.data_quality_score)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLoan(loan)}
                            className="flex items-center gap-1 hover-scale"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLoan(loan.loan_id)}
                            className="text-destructive hover:text-destructive hover-scale"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Detail Modal */}
      {selectedLoan && (
        <LoanDetailView 
          loan={selectedLoan} 
          onClose={() => setSelectedLoan(null)} 
        />
      )}
    </div>
  );
}