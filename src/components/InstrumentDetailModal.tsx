import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { type LoanPortfolioItem } from '@/lib/db';
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
    Share,
    Shield,
    Building2,
    Users,
    CreditCard,
    Percent,
    Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InstrumentDetailModalProps {
    instrument: LoanPortfolioItem;
    isOpen: boolean;
    onClose: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    hasPrevious?: boolean;
    hasNext?: boolean;
    currentIndex?: number;
    totalCount?: number;
}

export function InstrumentDetailModal({
    instrument,
    isOpen,
    onClose,
    onPrevious,
    onNext,
    hasPrevious = false,
    hasNext = false,
    currentIndex,
    totalCount
}: InstrumentDetailModalProps) {
    const instrumentType = instrument.instrument_type || 'loan';
    
    // Generate multi-year emissions data based on instrument type
    const generateMultiYearData = () => {
        const data = [];
        const term = instrumentType === 'loan' ? (instrument.loan_term_years || 5) : 3; // LCs/Guarantees typically shorter
        
        for (let year = 1; year <= term; year++) {
            let outstandingBalance = instrument.outstanding_balance;
            let attributionFactor = instrument.attribution_factor;
            
            if (instrumentType === 'loan') {
                // Declining balance for loans
                const annualPayment = instrument.loan_amount / term;
                outstandingBalance = Math.max(0, instrument.outstanding_balance - (annualPayment * (year - 1)));
                attributionFactor = outstandingBalance / instrument.vehicle_value;
            } else if (instrumentType === 'guarantee') {
                // Risk-weighted exposure for guarantees
                const probabilityDecay = Math.pow(0.9, year - 1); // Risk decreases over time
                attributionFactor = instrument.attribution_factor * probabilityDecay;
                outstandingBalance = instrument.loan_amount * attributionFactor;
            }
            // LCs maintain constant exposure until expiry
            
            const financedEmissions = instrument.annual_emissions * attributionFactor;

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

    const getInstrumentIcon = () => {
        switch (instrumentType) {
            case 'lc': return <FileText className="h-6 w-6 text-blue-500" />;
            case 'guarantee': return <Shield className="h-6 w-6 text-purple-500" />;
            default: return <Car className="h-6 w-6 text-green-500" />;
        }
    };

    const getInstrumentTitle = () => {
        switch (instrumentType) {
            case 'lc': return 'Letter of Credit Details';
            case 'guarantee': return 'Guarantee Details';
            default: return 'Loan Details';
        }
    };

    const getInstrumentSubtitle = () => {
        switch (instrumentType) {
            case 'lc': return `Fleet financing LC • ${instrument.fuel_type} vehicles`;
            case 'guarantee': return `Risk coverage guarantee • ${instrument.fuel_type} portfolio`;
            default: return `${instrument.vehicle_make || 'Unknown'} ${instrument.vehicle_model || 'Vehicle'} • ${instrument.fuel_type}`;
        }
    };

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

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Mock LC-specific data (in real app, this would come from the database)
    const getLCSpecificData = () => ({
        lcNumber: `LC${new Date().getFullYear()}${instrument.loan_id.slice(-4)}`,
        beneficiary: 'AutoMax Dealership',
        issuingBank: 'First National Bank',
        advisingBank: 'Regional Trust Bank',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
        lcType: 'dealer_floor_plan',
        drawnAmount: instrument.outstanding_balance * 0.7, // 70% drawn
        availableAmount: instrument.loan_amount - (instrument.outstanding_balance * 0.7),
        fleetSize: Math.floor(10 + Math.random() * 40),
        vehicleTypes: 'Mixed passenger and commercial vehicles'
    });

    // Mock Guarantee-specific data
    const getGuaranteeSpecificData = () => ({
        guaranteeNumber: `GU${new Date().getFullYear()}${instrument.loan_id.slice(-4)}`,
        guaranteeType: 'residual_value',
        probabilityOfActivation: instrument.attribution_factor / (instrument.loan_amount / instrument.vehicle_value), // Reverse calculate
        coveredObligations: 'Vehicle residual value protection',
        triggerEvents: ['Market value decline', 'Early termination', 'Default event'],
        portfolioSize: Math.floor(5 + Math.random() * 25),
        riskRating: instrument.data_quality_score <= 3 ? 'Low' : instrument.data_quality_score <= 4 ? 'Medium' : 'High'
    });

    const lcData = instrumentType === 'lc' ? getLCSpecificData() : null;
    const guaranteeData = instrumentType === 'guarantee' ? getGuaranteeSpecificData() : null;

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

    const exportInstrumentData = () => {
        const exportData = {
            instrument_id: instrument.loan_id,
            instrument_type: instrumentType,
            amount: instrument.loan_amount,
            outstanding_balance: instrument.outstanding_balance,
            vehicle_details: {
                make: instrument.vehicle_make,
                model: instrument.vehicle_model,
                category: instrument.vehicle_category,
                fuel_type: instrument.fuel_type
            },
            emissions_data: {
                annual_emissions: instrument.annual_emissions,
                financed_emissions: instrument.financed_emissions,
                attribution_factor: instrument.attribution_factor,
                data_quality_score: instrument.data_quality_score
            },
            lc_data: lcData,
            guarantee_data: guaranteeData,
            multi_year_projections: multiYearData,
            total_lifetime_emissions: totalLifetimeEmissions,
            exported_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${instrumentType}_${instrument.loan_id}_details.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getInstrumentIcon()}
                            <div>
                                <DialogTitle className="text-xl">{getInstrumentTitle()}: {instrument.loan_id}</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {getInstrumentSubtitle()}
                                </p>
                                {currentIndex !== undefined && totalCount && (
                                    <p className="text-xs text-muted-foreground">
                                        Instrument {currentIndex + 1} of {totalCount}
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
                                        title="Previous instrument (←)"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onNext}
                                        disabled={!hasNext}
                                        title="Next instrument (→)"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <Button variant="outline" size="sm" onClick={exportInstrumentData} title="Export instrument data">
                                <Download className="h-4 w-4" />
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
                                    <span className="text-sm font-medium">
                                        {instrumentType === 'lc' ? 'LC Amount' : 
                                         instrumentType === 'guarantee' ? 'Guarantee Amount' : 'Loan Amount'}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">{formatCurrency(instrument.loan_amount)}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(instrument.outstanding_balance)} 
                                    {instrumentType === 'lc' ? ' drawn' : 
                                     instrumentType === 'guarantee' ? ' at risk' : ' outstanding'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Attribution</span>
                                </div>
                                <p className="text-2xl font-bold">{(instrument.attribution_factor * 100).toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">
                                    {instrumentType === 'guarantee' ? 'risk-weighted' : 'of vehicle emissions'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Financed Emissions</span>
                                </div>
                                <p className="text-2xl font-bold">{instrument.financed_emissions.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">tCO₂e annually</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Data Quality</span>
                                </div>
                                <p className={`text-2xl font-bold ${getDataQualityColor(instrument.data_quality_score)}`}>
                                    {instrument.data_quality_score.toFixed(1)}/5
                                </p>
                                <p className="text-xs text-muted-foreground">PCAF hierarchy</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* LC-Specific Information */}
                    {instrumentType === 'lc' && lcData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Letter of Credit Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">LC Number</label>
                                                <p className="font-medium font-mono">{lcData.lcNumber}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">LC Type</label>
                                                <p className="font-medium capitalize">{lcData.lcType.replace('_', ' ')}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Beneficiary</label>
                                                <p className="font-medium">{lcData.beneficiary}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                                                <p className="font-medium">{formatDate(lcData.expiryDate)}</p>
                                            </div>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Issuing Bank</label>
                                                <p className="font-medium">{lcData.issuingBank}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Advising Bank</label>
                                                <p className="font-medium">{lcData.advisingBank}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Utilization</label>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Drawn Amount</span>
                                                    <span className="font-medium">{formatCurrency(lcData.drawnAmount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Available Amount</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(lcData.availableAmount)}</span>
                                                </div>
                                                <Progress value={(lcData.drawnAmount / instrument.loan_amount) * 100} className="h-2" />
                                                <p className="text-xs text-muted-foreground">
                                                    {((lcData.drawnAmount / instrument.loan_amount) * 100).toFixed(1)}% utilized
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Fleet Size</label>
                                                <p className="font-medium">{lcData.fleetSize} vehicles</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Vehicle Types</label>
                                                <p className="font-medium text-sm">{lcData.vehicleTypes}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Guarantee-Specific Information */}
                    {instrumentType === 'guarantee' && guaranteeData && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    Guarantee Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Guarantee Number</label>
                                                <p className="font-medium font-mono">{guaranteeData.guaranteeNumber}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Guarantee Type</label>
                                                <p className="font-medium capitalize">{guaranteeData.guaranteeType.replace('_', ' ')}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Risk Rating</label>
                                                <Badge variant={guaranteeData.riskRating === 'Low' ? 'default' : 
                                                              guaranteeData.riskRating === 'Medium' ? 'secondary' : 'destructive'}>
                                                    {guaranteeData.riskRating} Risk
                                                </Badge>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Portfolio Size</label>
                                                <p className="font-medium">{guaranteeData.portfolioSize} vehicles</p>
                                            </div>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Covered Obligations</label>
                                            <p className="font-medium text-sm mt-1">{guaranteeData.coveredObligations}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Probability of Activation</label>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-2xl font-bold text-purple-600">
                                                        {(guaranteeData.probabilityOfActivation * 100).toFixed(1)}%
                                                    </span>
                                                    <Percent className="h-5 w-5 text-purple-500" />
                                                </div>
                                                <Progress value={guaranteeData.probabilityOfActivation * 100} className="h-2" />
                                                <p className="text-xs text-muted-foreground">
                                                    Expected exposure: {formatCurrency(instrument.loan_amount * guaranteeData.probabilityOfActivation)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Trigger Events</label>
                                            <div className="mt-2 space-y-1">
                                                {guaranteeData.triggerEvents.map((event, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm">
                                                        <Target className="h-3 w-3 text-purple-500" />
                                                        <span>{event}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Multi-Year Emissions Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Multi-Year Emissions Profile
                            </CardTitle>
                            <CardDescription>
                                Financed emissions over the {instrumentType} lifecycle
                                {instrumentType === 'guarantee' && ' (risk-weighted)'}
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
                                                            instrumentType === 'lc' ? 'LC Exposure' :
                                                            instrumentType === 'guarantee' ? 'Risk Exposure' :
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
                                        <span className="text-sm text-muted-foreground">
                                            {instrumentType === 'lc' ? 'Fleet Annual Emissions' :
                                             instrumentType === 'guarantee' ? 'Portfolio Annual Emissions' :
                                             'Annual Vehicle Emissions'}
                                        </span>
                                        <span className="font-medium">{instrument.annual_emissions.toFixed(3)} tCO₂e</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            {instrumentType === 'guarantee' ? 'Risk-Weighted Attribution' : 'Attribution Factor'}
                                        </span>
                                        <span className="font-medium">{(instrument.attribution_factor * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Financed Emissions</span>
                                        <span className="font-medium text-primary">{instrument.financed_emissions.toFixed(3)} tCO₂e</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Calculation Method</label>
                                    <p className="text-sm">
                                        {instrumentType === 'lc' ? 'Portfolio-based approach' :
                                         instrumentType === 'guarantee' ? 'Risk-weighted attribution approach' :
                                         'Asset-specific method'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Source: PCAF Global Standard 2024
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
                                            <span className={`font-semibold ${getDataQualityColor(instrument.data_quality_score)}`}>
                                                {instrument.data_quality_score.toFixed(1)}/5
                                            </span>
                                            {getDataQualityBadge(instrument.data_quality_score)}
                                        </div>
                                    </div>
                                    <Progress value={((5 - instrument.data_quality_score) / 4) * 100} className="h-2" />
                                    <p className="text-xs text-muted-foreground">
                                        {getDataQualityDescription(instrument.data_quality_score)}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">PCAF Data Option</span>
                                        <Badge variant="secondary">
                                            {instrument.pcaf_data_option || 'Option 3'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Verification Status</span>
                                        <Badge variant={instrument.verification_status === 'verified' ? 'default' : 'outline'}>
                                            {instrument.verification_status || 'Unverified'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}