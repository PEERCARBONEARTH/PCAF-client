import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { type LoanPortfolioItem } from '@/lib/db';
import { 
  Car, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Info,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAssumptions, type CategoryAssumption } from '@/contexts/AssumptionsContext';

interface LoanDetailViewProps {
  loan: LoanPortfolioItem;
  onClose: () => void;
}

export function LoanDetailView({ loan, onClose }: LoanDetailViewProps) {
  // Generate multi-year emissions data based on loan term and declining balance
  const generateMultiYearData = () => {
    const data = [];
    const loanTerm = 5; // Assume 5 year term
    const annualPayment = loan.loan_amount / loanTerm;
    
    for (let year = 1; year <= loanTerm; year++) {
      const outstandingBalance = Math.max(0, loan.loan_amount - (annualPayment * (year - 1)));
      const attributionFactor = outstandingBalance / loan.vehicle_value;
      const financedEmissions = loan.annual_emissions * attributionFactor;
      
      data.push({
        year,
        outstandingBalance,
        attributionFactor,
        financedEmissions,
        cumulativeEmissions: data.reduce((sum, item) => sum + item.financedEmissions, 0) + financedEmissions
      });
    }
    
    return data;
  };

  const multiYearData = generateMultiYearData();
  const totalLifetimeEmissions = multiYearData.reduce((sum, item) => sum + item.financedEmissions, 0);
  const currentYear = new Date().getFullYear();

  const getDataQualityColor = (score: number) => {
    if (score <= 2) return 'text-green-600';
    if (score <= 3) return 'text-blue-600';
    if (score <= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDataQualityDescription = (score: number) => {
    if (score <= 2) return 'High-quality data with verified inputs';
    if (score <= 3) return 'Good data quality with minor estimates';
    if (score <= 4) return 'Fair data quality with some proxy data';
    return 'Lower data quality with significant estimates';
  };

  // Methodology & assumptions context
  const { assumptions, getCategory } = useAssumptions();
  const category = (getCategory && getCategory(loan.vehicle_type)) || assumptions.categories?.[loan.vehicle_type];

  const inferPCAF = (c?: CategoryAssumption): '1a' | '1b' | '2a' | '2b' | '3a' | '3b' => {
    // Minimal heuristic based on configured basis and region
    if (!c) return '3a';
    if (c.basis === 'fuel') return '1a';
    if (c.basis === 'distance') {
      if (c.region === 'local') return '2a';
      if (c.region === 'regional' || c.region === 'national') return '2b';
      return '3a';
    }
    return '3a';
  };

  const likelyPCAF = inferPCAF(category);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-primary" />
            <div>
              <DialogTitle className="text-xl">Loan Detail: {loan.loan_id}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {loan.vehicle_type.replace('_', ' ')} • {loan.fuel_type} • Originated {new Date(loan.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Loan Amount</span>
                </div>
                <p className="text-2xl font-bold mt-1">${loan.loan_amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">${loan.outstanding_balance.toLocaleString()} outstanding</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Attribution</span>
                </div>
                <p className="text-2xl font-bold mt-1">{(loan.attribution_factor * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">of vehicle emissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Annual Emissions</span>
                </div>
                <p className="text-2xl font-bold mt-1">{loan.financed_emissions.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">tCO₂e financed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Data Quality</span>
                </div>
                <p className={`text-2xl font-bold mt-1 ${getDataQualityColor(loan.data_quality_score)}`}>
                  {loan.data_quality_score}/5
                </p>
                <p className="text-xs text-muted-foreground">PCAF hierarchy</p>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Year Emissions Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Multi-Year Emissions Profile
              </CardTitle>
              <CardDescription>
                Financed emissions over the loan lifecycle based on outstanding balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={multiYearData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        tickFormatter={(value) => `Year ${value} (${currentYear + value - 1})`}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'financedEmissions' ? `${value.toFixed(2)} tCO₂e` : 
                          name === 'attributionFactor' ? `${(value * 100).toFixed(1)}%` : 
                          `$${value.toLocaleString()}`,
                          name === 'financedEmissions' ? 'Financed Emissions' :
                          name === 'attributionFactor' ? 'Attribution Factor' : 
                          'Outstanding Balance'
                        ]}
                        labelFormatter={(value) => `Year ${value} (${currentYear + value - 1})`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="financedEmissions" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        name="financedEmissions"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="attributionFactor" 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="attributionFactor"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Lifetime Emissions</p>
                    <p className="text-lg font-semibold text-primary">{totalLifetimeEmissions.toFixed(2)} tCO₂e</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Annual Emissions</p>
                    <p className="text-lg font-semibold">{Math.max(...multiYearData.map(d => d.financedEmissions)).toFixed(2)} tCO₂e</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Attribution</p>
                    <p className="text-lg font-semibold">
                      {(multiYearData.reduce((sum, d) => sum + d.attributionFactor, 0) / multiYearData.length * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle & Loan Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Vehicle Type</Label>
                    <p className="capitalize">{loan.vehicle_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fuel Type</Label>
                    <p className="capitalize">{loan.fuel_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vehicle Value</Label>
                    <p>${loan.vehicle_value.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Est. Annual KM</Label>
                    <p>{loan.estimated_annual_km?.toLocaleString() || 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Emission Factor</Label>
                  <p>{loan.emission_factor_kg_co2_km} kg CO₂/km</p>
                  <p className="text-xs text-muted-foreground">
                    Based on {loan.fuel_type} vehicle emission standards
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">PCAF Data Quality Score</span>
                    <span className={`font-semibold ${getDataQualityColor(loan.data_quality_score)}`}>
                      {loan.data_quality_score}/5
                    </span>
                  </div>
                  <Progress value={((6 - loan.data_quality_score) / 5) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {getDataQualityDescription(loan.data_quality_score)}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Verification Status</Label>
                  <Badge variant={
                    loan.verification_status === 'verified' ? 'default' :
                    loan.verification_status === 'partially_verified' ? 'secondary' : 'outline'
                  }>
                    {loan.verification_status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Methodology & Sources</Label>
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Likely PCAF Option</span>
                      <Badge variant="secondary">{likelyPCAF}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Activity Basis</span>
                      <span className="text-muted-foreground">
                        {category?.basis === 'fuel' ? 'Fuel (measured liters)' : category?.basis === 'distance' ? 'Distance (statistical km)' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Annual Distance Assumption</span>
                      <span className="text-muted-foreground">{category?.annual_km ? `${category.annual_km.toLocaleString()} km` : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Region</span>
                      <span className="text-muted-foreground capitalize">{category?.region || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Source</span>
                      <span className="text-muted-foreground truncate max-w-[60%] text-right" title={category?.source_label || ''}>
                        {category?.source_label || '—'}
                      </span>
                    </div>
                    {category?.evidence_url && (
                      <div className="flex items-center justify-between">
                        <span>Evidence</span>
                        <a className="text-primary underline truncate max-w-[60%] text-right" href={category.evidence_url} target="_blank" rel="noreferrer">
                          {category.evidence_url}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={category?.approved ? 'default' : 'outline'}>
                          {category?.approved ? 'Approved' : 'Draft'}
                        </Badge>
                        {category?.version && (
                          <span className="text-xs text-muted-foreground">v {new Date(category.version).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Year-by-Year Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Breakdown</CardTitle>
              <CardDescription>
                Detailed year-by-year emissions and attribution analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Outstanding Balance</th>
                      <th className="text-right p-2">Attribution Factor</th>
                      <th className="text-right p-2">Financed Emissions</th>
                      <th className="text-right p-2">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiYearData.map((yearData, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">
                          Year {yearData.year} ({currentYear + yearData.year - 1})
                        </td>
                        <td className="p-2 text-right">${yearData.outstandingBalance.toLocaleString()}</td>
                        <td className="p-2 text-right">{(yearData.attributionFactor * 100).toFixed(1)}%</td>
                        <td className="p-2 text-right font-medium text-primary">
                          {yearData.financedEmissions.toFixed(2)} tCO₂e
                        </td>
                        <td className="p-2 text-right text-muted-foreground">
                          {yearData.cumulativeEmissions.toFixed(2)} tCO₂e
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className || ''}`}>{children}</label>;
}