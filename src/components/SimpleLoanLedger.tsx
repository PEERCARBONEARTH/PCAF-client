import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { portfolioService, type LoanData } from "@/services/portfolioService";
import { InstrumentDetailModal } from "@/components/InstrumentDetailModal";
import { useLoanNavigation } from "@/hooks/useLoanNavigation";
import { db, type LoanPortfolioItem } from "@/lib/db";
import {
  Car,
  AlertCircle,
  RefreshCw,
  Eye,
  Filter,
  FileText,
  Shield,
  Building2,
  X,
  Info
} from "lucide-react";

// Filter types
type InstrumentTypeFilter = 'all' | 'loan' | 'lc' | 'guarantee';
type FuelTypeFilter = 'all' | 'gasoline' | 'diesel' | 'electric' | 'hybrid';
type DataQualityFilter = 'all' | 'excellent' | 'good' | 'fair' | 'poor';

interface FilterState {
  instrumentType: InstrumentTypeFilter;
  fuelType: FuelTypeFilter;
  dataQuality: DataQualityFilter;
  searchTerm: string;
  minAmount: string;
  maxAmount: string;
}

export function SimpleLoanLedger() {
  const { toast } = useToast();
  const [instruments, setInstruments] = useState<LoanPortfolioItem[]>([]);
  const [filteredInstruments, setFilteredInstruments] = useState<LoanPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    instrumentType: 'all',
    fuelType: 'all',
    dataQuality: 'all',
    searchTerm: '',
    minAmount: '',
    maxAmount: ''
  });

  const {
    navigationState,
    openLoanDetail,
    closeLoanDetail,
    navigateToPrevious,
    navigateToNext
  } = useLoanNavigation(filteredInstruments);

  useEffect(() => {
    loadInstruments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [instruments, filters]);

  const loadInstruments = async () => {
    try {
      setLoading(true);
      // Load from local database which now includes all instrument types
      const allInstruments = await db.loans.toArray();

      // Debug: Log instrument types
      console.log('Total instruments loaded:', allInstruments.length);
      const typeBreakdown = allInstruments.reduce((acc, instrument) => {
        const type = instrument.instrument_type || 'loan';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Instrument type breakdown:', typeBreakdown);

      setInstruments(allInstruments);
    } catch (error) {
      console.error('Failed to load instruments:', error);
      toast({
        title: "Load Error",
        description: "Failed to load portfolio data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...instruments];

    // Instrument type filter
    if (filters.instrumentType !== 'all') {
      filtered = filtered.filter(instrument => {
        const type = instrument.instrument_type || 'loan';
        return type === filters.instrumentType;
      });
    }

    // Fuel type filter
    if (filters.fuelType !== 'all') {
      filtered = filtered.filter(instrument =>
        instrument.fuel_type === filters.fuelType
      );
    }

    // Data quality filter
    if (filters.dataQuality !== 'all') {
      filtered = filtered.filter(instrument => {
        const score = instrument.data_quality_score;
        switch (filters.dataQuality) {
          case 'excellent': return score <= 2;
          case 'good': return score > 2 && score <= 3;
          case 'fair': return score > 3 && score <= 4;
          case 'poor': return score > 4;
          default: return true;
        }
      });
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(instrument =>
        instrument.loan_id.toLowerCase().includes(searchLower) ||
        (instrument.vehicle_make && instrument.vehicle_make.toLowerCase().includes(searchLower)) ||
        (instrument.vehicle_model && instrument.vehicle_model.toLowerCase().includes(searchLower))
      );
    }

    // Amount range filter
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filtered = filtered.filter(instrument => instrument.loan_amount >= minAmount);
    }
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filtered = filtered.filter(instrument => instrument.loan_amount <= maxAmount);
    }

    setFilteredInstruments(filtered);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      instrumentType: 'all',
      fuelType: 'all',
      dataQuality: 'all',
      searchTerm: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.instrumentType !== 'all' ||
      filters.fuelType !== 'all' ||
      filters.dataQuality !== 'all' ||
      filters.searchTerm !== '' ||
      filters.minAmount !== '' ||
      filters.maxAmount !== '';
  };

  const getDataQualityBadge = (score: number) => {
    if (score <= 2) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score <= 3) return <Badge variant="secondary">Good</Badge>;
    if (score <= 4) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  const getInstrumentTypeIcon = (type?: string) => {
    switch (type) {
      case 'lc': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'guarantee': return <Shield className="h-4 w-4 text-purple-500" />;
      default: return <Car className="h-4 w-4 text-green-500" />;
    }
  };

  const getInstrumentTypeBadge = (type?: string) => {
    switch (type) {
      case 'lc': return <Badge variant="outline" className="text-blue-700 border-blue-300">LC</Badge>;
      case 'guarantee': return <Badge variant="outline" className="text-purple-700 border-purple-300">Guarantee</Badge>;
      default: return <Badge variant="outline" className="text-green-700 border-green-300">Loan</Badge>;
    }
  };

  const formatInstrumentDetails = (instrument: LoanPortfolioItem) => {
    const type = instrument.instrument_type || 'loan';

    if (type === 'lc') {
      return {
        title: 'Letter of Credit',
        subtitle: `Fleet financing • ${instrument.fuel_type}`,
        amount: instrument.loan_amount,
        outstanding: instrument.outstanding_balance
      };
    } else if (type === 'guarantee') {
      return {
        title: 'Guarantee',
        subtitle: `Risk coverage • ${instrument.fuel_type}`,
        amount: instrument.loan_amount,
        outstanding: instrument.outstanding_balance
      };
    } else {
      return {
        title: `${instrument.vehicle_make || 'Unknown'} ${instrument.vehicle_model || 'Vehicle'}`,
        subtitle: `${new Date().getFullYear()} • ${instrument.fuel_type}`,
        amount: instrument.loan_amount,
        outstanding: instrument.outstanding_balance
      };
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Portfolio Ledger
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredInstruments.length} of {instruments.length} instruments
                {hasActiveFilters() && (
                  <span className="text-blue-600 ml-1">(filtered)</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              <Button
                variant="outline"
                onClick={loadInstruments}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const count = await db.loans.count();
                  const instruments = await db.loans.toArray();
                  const breakdown = instruments.reduce((acc, i) => {
                    const type = i.instrument_type || 'loan';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  alert(`Database has ${count} instruments: ${JSON.stringify(breakdown)}`);
                }}
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                Debug
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Superfilter - Instrument Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instrument Type Superfilter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Instrument Type</Label>
            <div className="flex gap-2">
              <Button
                variant={filters.instrumentType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('instrumentType', 'all')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                All ({instruments.length})
              </Button>
              <Button
                variant={filters.instrumentType === 'loan' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('instrumentType', 'loan')}
                className="flex items-center gap-2"
              >
                <Car className="h-4 w-4" />
                Loans ({instruments.filter(i => !i.instrument_type || i.instrument_type === 'loan').length})
              </Button>
              <Button
                variant={filters.instrumentType === 'lc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('instrumentType', 'lc')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Letters of Credit ({instruments.filter(i => i.instrument_type === 'lc').length})
              </Button>
              <Button
                variant={filters.instrumentType === 'guarantee' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('instrumentType', 'guarantee')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Guarantees ({instruments.filter(i => i.instrument_type === 'guarantee').length})
              </Button>
            </div>
          </div>

          <Separator />

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="ID, make, model..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
              />
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <Label>Fuel Type</Label>
              <Select value={filters.fuelType} onValueChange={(value) => updateFilter('fuelType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All fuel types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fuel Types</SelectItem>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Quality */}
            <div className="space-y-2">
              <Label>Data Quality</Label>
              <Select value={filters.dataQuality} onValueChange={(value) => updateFilter('dataQuality', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All quality levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quality Levels</SelectItem>
                  <SelectItem value="excellent">Excellent (≤2)</SelectItem>
                  <SelectItem value="good">Good (2-3)</SelectItem>
                  <SelectItem value="fair">Fair (3-4)</SelectItem>
                  <SelectItem value="poor">Poor (&gt;4)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Amount */}
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => updateFilter('minAmount', e.target.value)}
              />
            </div>

            {/* Max Amount */}
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Amount</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="No limit"
                value={filters.maxAmount}
                onChange={(e) => updateFilter('maxAmount', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruments Table */}
      <Card>
        <CardContent className="p-0">
          {filteredInstruments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">
                {instruments.length === 0 ? 'No instruments found' : 'No instruments match your filters'}
              </h3>
              <p className="text-muted-foreground">
                {instruments.length === 0
                  ? 'Load sample data to get started'
                  : 'Try adjusting your filter criteria'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instrument ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Financed Emissions</TableHead>
                    <TableHead>Data Quality</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstruments.map((instrument) => {
                    const details = formatInstrumentDetails(instrument);
                    return (
                      <TableRow key={instrument.loan_id}>
                        <TableCell className="font-medium">{instrument.loan_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getInstrumentTypeIcon(instrument.instrument_type)}
                            {getInstrumentTypeBadge(instrument.instrument_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{details.title}</div>
                            <div className="text-muted-foreground">{details.subtitle}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">
                            <div className="font-medium">${details.amount.toLocaleString()}</div>
                            <div className="text-muted-foreground">${details.outstanding.toLocaleString()} outstanding</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm">
                            <div className="font-medium text-primary">{instrument.financed_emissions.toFixed(3)} tCO₂e</div>
                            <div className="text-muted-foreground">{instrument.annual_emissions.toFixed(3)} annual</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getDataQualityBadge(instrument.data_quality_score)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openLoanDetail(instrument)}
                            className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instrument Detail Modal */}
      {navigationState.selectedLoan && (
        <InstrumentDetailModal
          instrument={navigationState.selectedLoan}
          isOpen={navigationState.isModalOpen}
          onClose={closeLoanDetail}
          onPrevious={navigateToPrevious}
          onNext={navigateToNext}
          hasPrevious={!!navigationState.previousLoan}
          hasNext={!!navigationState.nextLoan}
          currentIndex={navigationState.currentIndex}
          totalCount={navigationState.totalLoans}
        />
      )}
    </div>
  );
}