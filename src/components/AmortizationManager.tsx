// Amortization and Lifecycle Event Management Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AmortizationEngine, type LifecycleEvent, type AttributionHistory } from '@/lib/amortization';
import { db, type LoanPortfolioItem } from '@/lib/db';

interface AmortizationManagerProps {
  loanId?: string;
  onUpdate?: () => void;
}

export function AmortizationManager({ loanId, onUpdate }: AmortizationManagerProps) {
  const [loans, setLoans] = useState<LoanPortfolioItem[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanPortfolioItem | null>(null);
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [attributionHistory, setAttributionHistory] = useState<AttributionHistory[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_type: 'early_payoff' as LifecycleEvent['event_type'],
    event_date: '',
    event_amount: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [loanId]);

  const loadData = async () => {
    try {
      if (loanId) {
        const loan = await db.loans.where('loan_id').equals(loanId).first();
        if (loan) {
          setSelectedLoan(loan);
          setLoans([loan]);
          await loadLoanDetails(loanId);
        }
      } else {
        const allLoans = await db.loans.toArray();
        setLoans(allLoans);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load loan data');
    }
  };

  const loadLoanDetails = async (loan_id: string) => {
    try {
      // Load lifecycle events
      if (db.lifecycle_events) {
        const events = await db.lifecycle_events.where('loan_id').equals(loan_id).toArray();
        setLifecycleEvents(events);
      }

      // Load attribution history
      if (db.attribution_history) {
        const history = await db.attribution_history
          .where('loan_id').equals(loan_id)
          .toArray();
        history.sort((a, b) => a.reporting_date.getTime() - b.reporting_date.getTime());
        setAttributionHistory(history);
      }
    } catch (error) {
      console.error('Error loading loan details:', error);
    }
  };

  const handleLoanSelect = async (loan: LoanPortfolioItem) => {
    setSelectedLoan(loan);
    await loadLoanDetails(loan.loan_id);
  };

  const updateLoanBalance = async (loan_id: string) => {
    try {
      await AmortizationEngine.updateLoanBalance(loan_id);
      toast.success('Loan balance updated successfully');
      await loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating loan balance:', error);
      toast.error('Failed to update loan balance');
    }
  };

  const processLifecycleEvent = async () => {
    if (!selectedLoan || !newEvent.event_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await AmortizationEngine.processLifecycleEvent(
        selectedLoan.loan_id,
        newEvent.event_type,
        new Date(newEvent.event_date),
        {
          event_amount: newEvent.event_amount ? parseFloat(newEvent.event_amount) : undefined,
          notes: newEvent.notes
        }
      );

      toast.success('Lifecycle event processed successfully');
      setIsEventDialogOpen(false);
      setNewEvent({
        event_type: 'early_payoff',
        event_date: '',
        event_amount: '',
        notes: ''
      });
      await loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error processing lifecycle event:', error);
      toast.error('Failed to process lifecycle event');
    }
  };

  const batchUpdatePortfolio = async () => {
    try {
      await AmortizationEngine.batchUpdatePortfolioBalances();
      toast.success('Portfolio balances updated successfully');
      await loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error('Failed to update portfolio balances');
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'early_payoff': return 'default';
      case 'refinance': return 'secondary';
      case 'default': return 'destructive';
      case 'partial_payment': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Amortization Management</h2>
        <div className="flex gap-2">
          <Button onClick={batchUpdatePortfolio} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Update All Balances
          </Button>
          {selectedLoan && (
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Add Lifecycle Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Lifecycle Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Event Type</Label>
                    <Select 
                      value={newEvent.event_type} 
                      onValueChange={(value) => setNewEvent({...newEvent, event_type: value as LifecycleEvent['event_type']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="early_payoff">Early Payoff</SelectItem>
                        <SelectItem value="refinance">Refinance</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="partial_payment">Partial Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Event Date</Label>
                    <Input 
                      type="date" 
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({...newEvent, event_date: e.target.value})}
                    />
                  </div>
                  {(newEvent.event_type === 'partial_payment' || newEvent.event_type === 'refinance') && (
                    <div>
                      <Label>Amount</Label>
                      <Input 
                        type="number" 
                        placeholder="Enter amount"
                        value={newEvent.event_amount}
                        onChange={(e) => setNewEvent({...newEvent, event_amount: e.target.value})}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Notes</Label>
                    <Input 
                      placeholder="Optional notes"
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                    />
                  </div>
                  <Button onClick={processLifecycleEvent} className="w-full">
                    Process Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className={`p-3 border rounded-sm cursor-pointer transition-colors ${
                    selectedLoan?.id === loan.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleLoanSelect(loan)}
                >
                  <div className="font-medium">{loan.loan_id}</div>
                  <div className="text-sm text-muted-foreground">
                    ${loan.outstanding_balance.toLocaleString()} / ${loan.loan_amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Attribution: {(loan.attribution_factor * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loan Details and Management */}
        <div className="lg:col-span-2">
          {selectedLoan ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Lifecycle Events</TabsTrigger>
                <TabsTrigger value="history">Attribution History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Loan Overview
                      <Button 
                        onClick={() => updateLoanBalance(selectedLoan.loan_id)}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Update Balance
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Loan ID</Label>
                        <div className="font-medium">{selectedLoan.loan_id}</div>
                      </div>
                      <div>
                        <Label>Original Amount</Label>
                        <div className="font-medium">${selectedLoan.loan_amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label>Outstanding Balance</Label>
                        <div className="font-medium">${selectedLoan.outstanding_balance.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label>Vehicle Value</Label>
                        <div className="font-medium">${selectedLoan.vehicle_value.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label>Attribution Factor</Label>
                        <div className="font-medium">
                          {(selectedLoan.attribution_factor * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <Label>Financed Emissions</Label>
                        <div className="font-medium">
                          {selectedLoan.financed_emissions.toFixed(2)} tCO2e
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle>Lifecycle Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lifecycleEvents.length > 0 ? (
                      <div className="space-y-3">
                        {lifecycleEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getEventBadgeVariant(event.event_type)}>
                                  {event.event_type.replace('_', ' ')}
                                </Badge>
                                <span className="font-medium">
                                  {event.event_date.toLocaleDateString()}
                                </span>
                              </div>
                              {event.event_amount && (
                                <div className="text-sm text-muted-foreground">
                                  Amount: ${event.event_amount.toLocaleString()}
                                </div>
                              )}
                              {event.notes && (
                                <div className="text-sm text-muted-foreground">
                                  {event.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No lifecycle events recorded
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Attribution Factor History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attributionHistory.length > 0 ? (
                      <div className="space-y-2">
                        {attributionHistory.slice(-10).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-2 border-b">
                            <div>
                              <div className="font-medium">
                                {record.reporting_date.toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {record.calculation_reason}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {(record.attribution_factor * 100).toFixed(2)}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ${record.outstanding_balance.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No attribution history available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Loan</h3>
                <p className="text-muted-foreground">
                  Choose a loan from the list to view amortization details and manage lifecycle events.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}