/**
 * Enhanced Instrument Ledger
 * Comprehensive ledger supporting Loans, Letters of Credit, and Guarantees
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  pcafApiClient, 
  type InstrumentResponse, 
  type InstrumentFilters, 
  type PaginationParams,
  ROLES,
  PERMISSIONS
} from "@/services/pcafApiClient";
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
  Eye,
  Plus,
  FileText,
  Shield,
  Calendar,
  DollarSign,
  Leaf,
  BarChart3,
  Settings,
  Bell
} from "lucide-react";

type SortField = 'borrowerName' | 'instrumentAmount' | 'financedEmissions' | 'dataQualityScore' | 'createdAt';
type SortDirection = 'ASC' | 'DESC';
type InstrumentType = 'ALL' | 'LOAN' | 'LC' | 'GUARANTEE';

interface FilterState extends InstrumentFilters {
  searchTerm: string;
  instrumentTypeFilter: InstrumentType;
}

export function InstrumentLedger() {
  const { toast } = useToast();
  const [instruments, setInstruments] = useState<InstrumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<InstrumentType>('ALL');
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    instrumentTypeFilter: 'ALL',
    dataQualityScore: undefined,
    minEmissions: undefined,
    maxEmissions: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    vehicleType: undefined,
    fuelType: undefined,
    status: 'active'
  });

  // User permissions
  const userProfile = pcafApiClient.getUserProfile();
  const canCreate = pcafApiClient.hasPermission(PERMISSIONS.INSTRUMENTS_CREATE);
  const canDelete = pcafApiClient.hasPermission(PERMISSIONS.INSTRUMENTS_DELETE);
  const canBulkOps = pcafApiClient.hasPermission(PERMISSIONS.INSTRUMENTS_BULK);
  const canViewAnalytics = pcafApiClient.hasPermission(PERMISSIONS.ANALYTICS_FULL);

  useEffect(() => {
    loadInstruments();
  }, [currentPage, sortField, sortDirection, filters, activeTab]);

  const loadInstruments = async () => {
    try {
      setLoading(true);
      
      // Build API filters
      const apiFilters: InstrumentFilters = {
        ...filters,
        instrumentType: activeTab !== 'ALL' ? activeTab : undefined
      };
      
      // Remove empty values
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key as keyof InstrumentFilters] === undefined || 
            apiFilters[key as keyof InstrumentFilters] === '') {
          delete apiFilters[key as keyof InstrumentFilters];
        }
      });

      const pagination: PaginationParams = {
        page: currentPage,
        limit: 50,
        sortBy: sortField,
        sortOrder: sortDirection
      };
      
      const response = await pcafApiClient.getInstruments(apiFilters, pagination);
      
      setInstruments(response.items);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalItems);
      
    } catch (error) {
      console.error('Failed to load instruments:', error);
      toast({
        title: "Load Error",
        description: "Failed to load instrument portfolio data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('ASC');
    }
    setCurrentPage(1);
  };

  const deleteInstrument = async (id: string) => {
    if (!canDelete) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete instruments.",
        variant: "destructive"
      });
      return;
    }

    try {
      await pcafApiClient.deleteInstrument(id, 'Deleted from ledger');
      await loadInstruments();
      toast({
        title: "Instrument Deleted",
        description: `Instrument has been removed from the portfolio.`,
      });
    } catch (error) {
      console.error('Failed to delete instrument:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete instrument.",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    const headers = [
      'ID', 'Borrower Name', 'Type', 'Amount', 'Currency', 'Vehicle Make', 'Vehicle Model',
      'Vehicle Year', 'Vehicle Type', 'Fuel Type', 'Vehicle Value', 'Attribution Factor', 
      'Annual Emissions (tCO₂e)', 'Financed Emissions (tCO₂e)', 'Data Quality Score',
      'Calculation Method', 'Created Date', 'Status'
    ];

    const csvData = instruments.map(instrument => [
      instrument.id,
      instrument.borrowerName,
      instrument.instrumentType,
      instrument.instrumentAmount,
      instrument.instrumentCurrency,
      instrument.vehicle.make,
      instrument.vehicle.model,
      instrument.vehicle.year,
      instrument.vehicle.type,
      instrument.vehicle.fuelType,
      instrument.vehicleValue,
      (instrument.pcafCalculation.attributionFactor * 100).toFixed(1) + '%',
      instrument.emissionsData.annualEmissions.toFixed(3),
      instrument.pcafCalculation.financedEmissions.toFixed(3),
      instrument.emissionsData.dataQualityScore,
      instrument.pcafCalculation.calculationMethod,
      new Date(instrument.createdAt).toLocaleDateString(),
      instrument.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `instrument_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Instrument ledger exported to CSV file.",
    });
  };

  const getInstrumentTypeIcon = (type: string) => {
    switch (type) {
      case 'LOAN': return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'LC': return <FileText className="h-4 w-4 text-green-500" />;
      case 'GUARANTEE': return <Shield className="h-4 w-4 text-purple-500" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getInstrumentTypeBadge = (type: string) => {
    const variants = {
      'LOAN': 'default',
      'LC': 'secondary', 
      'GUARANTEE': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'} className="text-xs">
        {type}
      </Badge>
    );
  };

  const getDataQualityBadge = (score: number) => {
    if (score <= 2) return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</Badge>;
    if (score <= 3) return <Badge variant="secondary">Good</Badge>;
    if (score <= 4) return <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const getComplianceStatusBadge = (wdqs: number) => {
    if (wdqs <= 3.0) return <Badge variant="default" className="bg-green-100 text-green-800">Compliant</Badge>;
    if (wdqs <= 4.0) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Needs Improvement</Badge>;
    return <Badge variant="destructive">Non-Compliant</Badge>;
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalAmount = instruments.reduce((sum, inst) => sum + inst.instrumentAmount, 0);
    const totalEmissions = instruments.reduce((sum, inst) => sum + inst.pcafCalculation.financedEmissions, 0);
    const avgDataQuality = instruments.length > 0 
      ? instruments.reduce((sum, inst) => sum + inst.emissionsData.dataQualityScore, 0) / instruments.length 
      : 0;
    
    const typeBreakdown = instruments.reduce((acc, inst) => {
      acc[inst.instrumentType] = (acc[inst.instrumentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAmount,
      totalEmissions,
      avgDataQuality,
      typeBreakdown
    };
  }, [instruments]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading instrument portfolio...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Portfolio</p>
                <p className="text-2xl font-bold">${summaryStats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Emissions</p>
                <p className="text-2xl font-bold">{summaryStats.totalEmissions.toFixed(1)} tCO₂e</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900">
                <BarChart3 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Data Quality</p>
                <p className="text-2xl font-bold">{summaryStats.avgDataQuality.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                <Car className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Instruments</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Instrument Portfolio Ledger
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {instruments.length} of {totalCount} instruments displayed
                {userProfile && (
                  <span className="ml-2">
                    • Logged in as {userProfile.email} ({userProfile.roles.join(', ')})
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {canViewAnalytics && (
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/analytics'}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              )}
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
                disabled={instruments.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={loadInstruments}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              {canCreate && (
                <Button
                  onClick={() => window.location.href = '/instruments/create'}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Instrument
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Instrument Type Tabs */}
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InstrumentType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ALL" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                All ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="LOAN" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Loans ({summaryStats.typeBreakdown.LOAN || 0})
              </TabsTrigger>
              <TabsTrigger value="LC" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Letters of Credit ({summaryStats.typeBreakdown.LC || 0})
              </TabsTrigger>
              <TabsTrigger value="GUARANTEE" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Guarantees ({summaryStats.typeBreakdown.GUARANTEE || 0})
              </TabsTrigger>
            </TabsList>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search instruments..."
                        className="pl-9"
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select 
                      value={filters.vehicleType || 'all'} 
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        vehicleType: value === 'all' ? undefined : value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="passenger_car">Passenger Car</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select 
                      value={filters.fuelType || 'all'} 
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        fuelType: value === 'all' ? undefined : value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All fuels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All fuels</SelectItem>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="qualityScore">Data Quality</Label>
                    <Select 
                      value={filters.dataQualityScore?.toString() || 'all'} 
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        dataQualityScore: value === 'all' ? undefined : parseInt(value) 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All scores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All scores</SelectItem>
                        <SelectItem value="1">1 (Excellent)</SelectItem>
                        <SelectItem value="2">2 (Good)</SelectItem>
                        <SelectItem value="3">3 (Fair)</SelectItem>
                        <SelectItem value="4">4 (Poor)</SelectItem>
                        <SelectItem value="5">5 (Very Poor)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={filters.status || 'all'} 
                      onValueChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        status: value === 'all' ? undefined : value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Instruments Table */}
            <TabsContent value={activeTab} className="mt-4">
              {instruments.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No instruments found</h3>
                  <p className="text-muted-foreground">
                    {totalCount === 0 
                      ? "Create your first instrument to get started" 
                      : "Try adjusting your filters"
                    }
                  </p>
                  {canCreate && totalCount === 0 && (
                    <Button 
                      className="mt-4" 
                      onClick={() => window.location.href = '/instruments/create'}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Instrument
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50" 
                          onClick={() => handleSort('borrowerName')}
                        >
                          <div className="flex items-center gap-1">
                            Borrower
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Vehicle Info</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 text-right" 
                          onClick={() => handleSort('instrumentAmount')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Amount
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Attribution</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 text-right" 
                          onClick={() => handleSort('financedEmissions')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Financed Emissions
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50" 
                          onClick={() => handleSort('dataQualityScore')}
                        >
                          <div className="flex items-center gap-1">
                            Data Quality
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {instruments.map((instrument) => (
                        <TableRow key={instrument.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getInstrumentTypeIcon(instrument.instrumentType)}
                              {getInstrumentTypeBadge(instrument.instrumentType)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{instrument.borrowerName}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {instrument.id.substring(0, 8)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {instrument.vehicle.make} {instrument.vehicle.model} ({instrument.vehicle.year})
                              </div>
                              <div className="text-muted-foreground capitalize">
                                {instrument.vehicle.type.replace('_', ' ')} • {instrument.vehicle.fuelType}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <div className="font-medium">
                                {instrument.instrumentCurrency} {instrument.instrumentAmount.toLocaleString()}
                              </div>
                              <div className="text-muted-foreground">
                                Vehicle: {instrument.vehicleCurrency} {instrument.vehicleValue.toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-medium">
                              {(instrument.pcafCalculation.attributionFactor * 100).toFixed(1)}%
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <div className="font-medium text-primary">
                                {instrument.pcafCalculation.financedEmissions.toFixed(3)} tCO₂e
                              </div>
                              <div className="text-muted-foreground">
                                {instrument.emissionsData.annualEmissions.toFixed(3)} annual
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getDataQualityBadge(instrument.emissionsData.dataQualityScore)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {instrument.instrumentType === 'LC' && instrument.lcDetails && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Expires: {new Date(instrument.lcDetails.expiryDate).toLocaleDateString()}
                                </div>
                              )}
                              {instrument.instrumentType === 'GUARANTEE' && instrument.guaranteeDetails && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <TrendingUp className="h-3 w-3" />
                                  Risk: {(instrument.guaranteeDetails.probabilityOfActivation * 100).toFixed(0)}%
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {instrument.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInstrument(instrument)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteInstrument(instrument.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} • {totalCount} total instruments
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}