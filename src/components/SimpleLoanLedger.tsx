import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { portfolioService, type LoanData } from "@/services/portfolioService";
import { LoanDetailModal } from "@/components/LoanDetailModal";
import { useLoanNavigation } from "@/hooks/useLoanNavigation";
import {
  Car,
  AlertCircle,
  RefreshCw,
  Eye
} from "lucide-react";

export function SimpleLoanLedger() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const {
    navigationState,
    openLoanDetail,
    closeLoanDetail,
    navigateToPrevious,
    navigateToNext
  } = useLoanNavigation(loans);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const { loans: portfolioLoans } = await portfolioService.getPortfolioSummary();
      setLoans(portfolioLoans);
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

  const getDataQualityBadge = (score: number) => {
    if (score <= 2) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score <= 3) return <Badge variant="secondary">Good</Badge>;
    if (score <= 4) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
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
                <Car className="h-5 w-5 text-primary" />
                Loan Portfolio Ledger
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {loans.length} loans in portfolio
              </p>
            </div>
            <Button
              variant="outline"
              onClick={loadLoans}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardContent className="p-0">
          {loans.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No loans found</h3>
              <p className="text-muted-foreground">
                Upload loan data to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Vehicle Info</TableHead>
                    <TableHead className="text-right">Loan Amount</TableHead>
                    <TableHead className="text-right">Financed Emissions</TableHead>
                    <TableHead>Data Quality</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.loan_id}>
                      <TableCell className="font-medium">{loan.loan_id}</TableCell>
                      <TableCell>{loan.borrower_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{loan.vehicle_details.make} {loan.vehicle_details.model}</div>
                          <div className="text-muted-foreground">{loan.vehicle_details.year} • {loan.vehicle_details.fuel_type}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          <div className="font-medium">${loan.loan_amount.toLocaleString()}</div>
                          <div className="text-muted-foreground">${loan.outstanding_balance.toLocaleString()} outstanding</div>
                        </div>
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
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLoanDetail(loan)}
                          className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
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
      {navigationState.selectedLoan && (
        <LoanDetailModal
          loan={navigationState.selectedLoan}
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