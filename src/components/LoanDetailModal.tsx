import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { type LoanData } from '@/services/portfolioService';
import {
    Car,
    TrendingDown,
    Calendar,
    DollarSign,
    BarChart3,
    Info,
    Zap,
    MapPin,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    X,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Download,
    Share
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LoanDetailModalProps {
    loan: LoanData;
    isOpen: boolean;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    currentIndex?: number;
    totalCount?: number;
}

export function LoanDetailModal({
    loan,
    isOpen,
    onClose,
    onPrevious,
    onNext,
    hasPrevious = false,
    hasNext = false,
    currentIndex,
    totalCount
}: LoanDetailModalProps) {
    // Generate multi-year emissions data based on loan term and declining balance
    const generateMultiYearData = () => {
        const data = [];
        const loanTerm = Math.ceil(loan.term_months / 12) || 5; // Convert months to years
        const annualPayment = loan.outstanding_balance / loanTerm;

        for (let year = 1; year <= loanTerm; year++) {
            const outstandingBalance = Math.max(0, loan.outstanding_balance - (annualPayment * (year - 1)));
            const attributionFactor = outstandingBalance / loan.vehicle_details.value_at_origination;
            const financedEmissions = loan.emissions_data.annual_emissions_tco2e * attributionFactor;

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

    const getDataQualityBadge = (score: number) => {
        if (score <= 2) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
        if (score <= 3) return <Badge variant="secondary">Good</Badge>;
        if (score <= 4) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Fair</Badge>;
        return <Badge variant="destructive">Poor</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;

            switch (event.key) {
                case 'ArrowLeft':
                    if (hasPrevious && onPrevious) {
                        event.preventDefault();
                        onPrevious();
                    }
                    break;
                case 'ArrowRight':
                    if (hasNext && onNext) {
                        event.preventDefault();
                        onNext();
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, hasPrevious, hasNext, onPrevious, onNext, onClose]);

    const exportLoanData = () => {
        const exportData = {
            loan_id: loan.loan_id,
            borrower_name: loan.borrower_name,
            loan_amount: loan.loan_amount,
            outstanding_balance: loan.outstanding_balance,
            vehicle_details: loan.vehicle_details,
            emissions_data: loan.emissions_data,
            data_quality_assessment: loan.data_quality_assessment,
            multi_year_projections: multiYearData,
            total_lifetime_emissions: totalLifetimeEmissions,
            exported_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `loan_${loan.loan_id}_details.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const shareLoan = async () => {
        const shareData = {
            title: `Loan Details: ${loan.loan_id}`,
            text: `${loan.vehicle_details.make} ${loan.vehicle_details.model} - ${loan.emissions_data.financed_emissions_tco2e.toFixed(2)} tCO₂e financed emissions`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Car className="h-6 w-6 text-primary" />
                            <div>
                                <DialogTitle className="text-xl">Loan Details: {loan.loan_id}</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {loan.vehicle_details.make} {loan.vehicle_details.model} • {loan.vehicle_details.fuel_type} • Originated {formatDate(loan.origination_date)}
                                </p>
                                {currentIndex !== undefined && totalCount && (
                                    <p className="text-xs text-muted-foreground">
                                        Loan {currentIndex + 1} of {totalCount}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Navigation Controls */}
                            {(hasPrevious || hasNext) && (
                                <div className="flex items-center gap-1 mr-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onPrevious}
                                        disabled={!hasPrevious}
                                        title="Previous loan (←)"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onNext}
                                        disabled={!hasNext}
                                        title="Next loan (→)"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <Button variant="outline" size="sm" onClick={exportLoanData} title="Export loan data">
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={shareLoan} title="Share loan">
                                <Share className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose} title="Close (Esc)">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Key Metrics Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Loan Amount</span>
                                </div>
                                <p className="text-2xl font-bold">{formatCurrency(loan.loan_amount)}</p>
                                <p className="text-xs text-muted-foreground">{formatCurrency(loan.outstanding_balance)} outstanding</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Attribution</span>
                                </div>
                                <p className="text-2xl font-bold">{(loan.emissions_data.attribution_factor * 100).toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">of vehicle emissions</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Financed Emissions</span>
                                </div>
                                <p className="text-2xl font-bold">{loan.emissions_data.financed_emissions_tco2e.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">tCO₂e annually</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Data Quality</span>
                                </div>
                                <p className={`text-2xl font-bold ${getDataQualityColor(loan.emissions_data.data_quality_score)}`}>
                                    {loan.emissions_data.data_quality_score.toFixed(1)}/5
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
                                                tickFormatter={(value) => `Year ${value}`}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value: number, name: string) => [
                                                    name === 'financedEmissions' ? `${value.toFixed(2)} tCO₂e` :
                                                        name === 'attributionFactor' ? `${(value * 100).toFixed(1)}%` :
                                                            formatCurrency(value),
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
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Vehicle Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Make & Model</label>
                                        <p className="font-medium">{loan.vehicle_details.make} {loan.vehicle_details.model}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Year</label>
                                        <p className="font-medium">{loan.vehicle_details.year}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Vehicle Type</label>
                                        <p className="font-medium capitalize">{loan.vehicle_details.type.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Fuel Type</label>
                                        <p className="font-medium capitalize">{loan.vehicle_details.fuel_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Vehicle Value</label>
                                        <p className="font-medium">{formatCurrency(loan.vehicle_details.value_at_origination)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Annual Mileage</label>
                                        <p className="font-medium">{loan.vehicle_details.annual_mileage?.toLocaleString() || 'Not specified'} miles</p>
                                    </div>
                                </div>

                                {loan.vehicle_details.vin && (
                                    <>
                                        <Separator />
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">VIN</label>
                                            <p className="font-mono text-sm">{loan.vehicle_details.vin}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Loan Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Borrower</label>
                                        <p className="font-medium">{loan.borrower_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Interest Rate</label>
                                        <p className="font-medium">{(loan.interest_rate * 100).toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Term</label>
                                        <p className="font-medium">{loan.term_months} months</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Origination Date</label>
                                        <p className="font-medium">{formatDate(loan.origination_date)}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Loan Status</label>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">Active</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Emissions & Data Quality Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Emissions Calculation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Annual Vehicle Emissions</span>
                                        <span className="font-medium">{loan.emissions_data.annual_emissions_tco2e.toFixed(3)} tCO₂e</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Attribution Factor</span>
                                        <span className="font-medium">{(loan.emissions_data.attribution_factor * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Financed Emissions</span>
                                        <span className="font-medium text-primary">{loan.emissions_data.financed_emissions_tco2e.toFixed(3)} tCO₂e</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Scope 1 Emissions</span>
                                        <span className="font-medium">{loan.emissions_data.scope_1_emissions.toFixed(3)} tCO₂e</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Scope 2 Emissions</span>
                                        <span className="font-medium">{loan.emissions_data.scope_2_emissions.toFixed(3)} tCO₂e</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Scope 3 Emissions</span>
                                        <span className="font-medium">{loan.emissions_data.scope_3_emissions.toFixed(3)} tCO₂e</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Calculation Method</label>
                                    <p className="text-sm">{loan.emissions_data.calculation_method}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Source: {loan.emissions_data.emission_factor_source}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Data Quality Assessment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">PCAF Data Quality Score</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold ${getDataQualityColor(loan.emissions_data.data_quality_score)}`}>
                                                {loan.emissions_data.data_quality_score.toFixed(1)}/5
                                            </span>
                                            {getDataQualityBadge(loan.emissions_data.data_quality_score)}
                                        </div>
                                    </div>
                                    <Progress value={((5 - loan.emissions_data.data_quality_score) / 4) * 100} className="h-2" />
                                    <p className="text-xs text-muted-foreground">
                                        {getDataQualityDescription(loan.emissions_data.data_quality_score)}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">PCAF Data Option</span>
                                        <Badge variant="secondary">{loan.emissions_data.pcaf_data_option.toUpperCase()}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Last Calculated</span>
                                        <span className="text-sm">{formatDate(loan.emissions_data.last_calculated)}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Data Quality Breakdown</label>
                                    <div className="space-y-2">
                                        {Object.entries(loan.data_quality_assessment.category_scores).map(([category, score]) => (
                                            <div key={category} className="flex justify-between items-center text-sm">
                                                <span className="capitalize">{category.replace('_', ' ')}</span>
                                                <span className="font-medium">{score}/5</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {loan.data_quality_assessment.warnings.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                                Warnings
                                            </label>
                                            <ul className="text-xs space-y-1">
                                                {loan.data_quality_assessment.warnings.map((warning, index) => (
                                                    <li key={index} className="text-muted-foreground">• {warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Year-by-Year Breakdown Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Annual Breakdown
                            </CardTitle>
                            <CardDescription>
                                Detailed year-by-year emissions and attribution analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3">Year</th>
                                            <th className="text-right p-3">Outstanding Balance</th>
                                            <th className="text-right p-3">Attribution Factor</th>
                                            <th className="text-right p-3">Financed Emissions</th>
                                            <th className="text-right p-3">Cumulative</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {multiYearData.map((yearData, index) => (
                                            <tr key={index} className="border-b hover:bg-muted/50">
                                                <td className="p-3 font-medium">
                                                    Year {yearData.year} ({currentYear + yearData.year - 1})
                                                </td>
                                                <td className="p-3 text-right">{formatCurrency(yearData.outstandingBalance)}</td>
                                                <td className="p-3 text-right">{(yearData.attributionFactor * 100).toFixed(1)}%</td>
                                                <td className="p-3 text-right font-medium text-primary">
                                                    {yearData.financedEmissions.toFixed(2)} tCO₂e
                                                </td>
                                                <td className="p-3 text-right text-muted-foreground">
                                                    {yearData.cumulativeEmissions.toFixed(2)} tCO₂e
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Trail */}
                    {loan.audit_trail.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Audit Trail
                                </CardTitle>
                                <CardDescription>
                                    Recent changes and updates to this loan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {loan.audit_trail.slice(0, 5).map((entry, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{entry.action}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(entry.timestamp)}
                                                    </span>
                                                </div>
                                                {entry.details && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}