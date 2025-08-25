import React, { useMemo, useState } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAssumptions, type CurrencyCode } from "@/contexts/AssumptionsContext";

interface AssumptionsDrawerProps {
  children?: React.ReactNode; // optional custom trigger
}

export function AssumptionsDrawer({ children }: AssumptionsDrawerProps) {
  const { assumptions, save } = useAssumptions();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [totalRevenue, setTotalRevenue] = useState<string>(
    assumptions.total_portfolio_revenue != null ? String(assumptions.total_portfolio_revenue) : ""
  );
  const [currency, setCurrency] = useState<CurrencyCode>(assumptions.currency || "USD");
  const [periodYear, setPeriodYear] = useState<string>(assumptions.period_year || new Date().getFullYear().toString());
  const [evidenceUrl, setEvidenceUrl] = useState<string>(assumptions.evidence_url || "");
  const [notes, setNotes] = useState<string>(assumptions.notes || "");

  const isValid = useMemo(() => {
    const val = parseFloat(totalRevenue);
    return !isNaN(val) && val > 0;
  }, [totalRevenue]);

  const onSave = () => {
    if (!isValid) return;
    save({
      total_portfolio_revenue: parseFloat(totalRevenue),
      currency,
      period_year: periodYear,
      evidence_url: evidenceUrl || undefined,
      notes: notes || undefined,
    });
    toast({ title: "Assumptions saved", description: "These will be used to compute WACI and related metrics." });
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="outline" size="sm">Add assumptions</Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Assumptions & Evidence</DrawerTitle>
          <DrawerDescription>Provide portfolio-wide assumptions used for economic intensity metrics (e.g., WACI).</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total-revenue">Total Portfolio Revenue ({currency})</Label>
            <Input
              id="total-revenue"
              inputMode="decimal"
              placeholder="e.g., 250000000"
              value={totalRevenue}
              onChange={(e) => setTotalRevenue(e.target.value.replace(/[^0-9.]/g, ""))}
            />
            <p className="text-xs text-muted-foreground">Annual revenue covering borrowers in scope; used as denominator for WACI.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="KES">KES</option>
              <option value="UGX">UGX</option>
              <option value="TZS">TZS</option>
              <option value="NGN">NGN</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="period-year">Reporting Year</Label>
            <Input id="period-year" placeholder="e.g., 2024" value={periodYear} onChange={(e) => setPeriodYear(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="evidence">Evidence URL (audited report, filing, etc.)</Label>
            <Input id="evidence" placeholder="https://example.com/report.pdf" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Any context on scope, coverage, or methodology" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DrawerFooter>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">We recommend linking to audited financials for assurance.</div>
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button onClick={onSave} disabled={!isValid}>Save</Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
