import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { db, type LoanPortfolioItem, type EmissionFactor } from "@/lib/db";
import { pcafApi } from "@/lib/pcaf-api";
import {
  Car,
  Calculator,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Fuel
} from "lucide-react";

interface MotorVehicleLoan {
  loan_id: string;
  loan_amount: number;
  vehicle_type: string;
  fuel_type: string;
  engine_size: string;
  vehicle_value: number;
  estimated_km_per_year: number;
  loan_term_years: number;
  outstanding_balance: number;
  loan_origination_date: string;
  reporting_date: string;
}

interface CalculationResult {
  attribution_factor: number;
  annual_emissions: number;
  financed_emissions: number;
  temporal_attribution: number;
  data_quality_score: number;
  emission_factor_used: number;
  pcaf_compliant: boolean;
}

export function MotorVehicleLoanCalculator() {
  const { toast } = useToast();
  const [loanData, setLoanData] = useState<MotorVehicleLoan>({
    loan_id: "",
    loan_amount: 0,
    vehicle_type: "",
    fuel_type: "",
    engine_size: "",
    vehicle_value: 0,
    estimated_km_per_year: 15000, // Default average
    loan_term_years: 5,
    outstanding_balance: 0,
    loan_origination_date: "",
    reporting_date: new Date().toISOString().split('T')[0]
  });

  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Load emission factors from IndexedDB
  useEffect(() => {
    loadEmissionFactors();
  }, []);

  const loadEmissionFactors = async () => {
    try {
      const factors = await db.emission_factors.toArray();
      setEmissionFactors(factors);
    } catch (error) {
      console.error('Failed to load emission factors:', error);
      toast({
        title: "Database Error",
        description: "Failed to load emission factors database.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof MotorVehicleLoan, value: string | number) => {
    setLoanData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate outstanding balance if loan amount changes
    if (field === 'loan_amount' && typeof value === 'number') {
      // Simple calculation - in reality this would be more complex
      const estimatedOutstanding = value * 0.7; // Assume 70% outstanding
      setLoanData(prev => ({ ...prev, outstanding_balance: estimatedOutstanding }));
    }
  };

  const getMatchingEmissionFactor = (): EmissionFactor | null => {
    return emissionFactors.find(factor => 
      factor.vehicle_type === loanData.vehicle_type &&
      factor.fuel_type === loanData.fuel_type &&
      (factor.engine_size_range === loanData.engine_size || factor.engine_size_range === 'all')
    ) || null;
  };

  const calculateTemporalAttribution = (): number => {
    if (!loanData.loan_origination_date || !loanData.reporting_date) return 1;
    
    const originationDate = new Date(loanData.loan_origination_date);
    const reportingDate = new Date(loanData.reporting_date);
    const reportingYear = reportingDate.getFullYear();
    
    // Calculate months of the loan that fall within the reporting year
    const yearStart = new Date(reportingYear, 0, 1);
    const yearEnd = new Date(reportingYear, 11, 31);
    
    const loanStartInYear = originationDate > yearStart ? originationDate : yearStart;
    const loanEndInYear = reportingDate < yearEnd ? reportingDate : yearEnd;
    
    if (loanStartInYear > loanEndInYear) return 0;
    
    const monthsInYear = (loanEndInYear.getTime() - loanStartInYear.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return Math.min(monthsInYear / 12, 1);
  };

  const calculateFinancedEmissions = async () => {
    setIsCalculating(true);
    
    try {
      // Validate inputs
      if (!loanData.loan_id || !loanData.vehicle_type || !loanData.fuel_type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      if (loanData.outstanding_balance <= 0 || loanData.vehicle_value <= 0) {
        toast({
          title: "Validation Error", 
          description: "Outstanding balance and vehicle value must be greater than 0.",
          variant: "destructive"
        });
        return;
      }

      // Always compute temporal attribution locally (uniform across app)
      const temporal_attribution = calculateTemporalAttribution();

      // Prefer Supabase Edge Function as single source of truth
      try {
        const edgePayload = {
          loan_id: loanData.loan_id,
          borrower_name: "Demo Borrower",
          loan_amount: loanData.loan_amount,
          outstanding_balance: loanData.outstanding_balance,
          interest_rate: 0,
          term_months: loanData.loan_term_years * 12,
          origination_date: loanData.loan_origination_date || new Date().toISOString().split('T')[0],
          vehicle_details: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            type: loanData.vehicle_type,
            fuel_type: loanData.fuel_type,
            value_at_origination: loanData.vehicle_value,
            // Convert km -> miles for the edge function's per-mile factors
            annual_mileage: Math.round(loanData.estimated_km_per_year * 0.621371)
          }
        } as const;

        const edgeRes = await pcafApi.calculateEmissions(edgePayload as any);

        const efPerMile = edgeRes.data.calculations.emission_factor_used as number;
        const efPerKm = efPerMile / 1.60934;
        const attribution_factor = edgeRes.data.calculations.attribution_factor as number;
        const annual_emissions = edgeRes.data.calculations.annual_vehicle_emissions as number; // already in tCO2e
        const financed_emissions = annual_emissions * attribution_factor * temporal_attribution;
        const data_quality_score = edgeRes.data.data_quality.score as number;
        const pcaf_compliant = data_quality_score <= 3;

        const result: CalculationResult = {
          attribution_factor,
          annual_emissions,
          financed_emissions,
          temporal_attribution,
          data_quality_score,
          emission_factor_used: Number(efPerKm.toFixed(6)),
          pcaf_compliant
        };

        setCalculation(result);

        const loanPortfolioItem: LoanPortfolioItem = {
          loan_id: loanData.loan_id,
          loan_amount: loanData.loan_amount,
          vehicle_type: loanData.vehicle_type,
          vehicle_category: 'passenger_car',
          fuel_type: loanData.fuel_type as any,
          engine_size: loanData.engine_size,
          vehicle_value: loanData.vehicle_value,
          estimated_km_per_year: loanData.estimated_km_per_year,
          loan_term_years: loanData.loan_term_years,
          outstanding_balance: loanData.outstanding_balance,
          attribution_factor,
          annual_emissions,
          financed_emissions,
          emission_factor_kg_co2_km: Number(efPerKm.toFixed(6)),
          data_quality_score,
          loan_origination_date: loanData.loan_origination_date,
          reporting_date: loanData.reporting_date,
          temporal_attribution,
          data_source: 'edge_function',
          emission_factor_source: 'supabase:emission_factors',
          verification_status: 'unverified',
          pcaf_asset_class: 'motor_vehicle_loans',
          created_at: new Date(),
          updated_at: new Date()
        };
        await db.loans.add(loanPortfolioItem);

        toast({
          title: "Calculation Complete",
          description: `Financed emissions: ${financed_emissions.toFixed(3)} tCO₂e. PCAF Quality: Level ${data_quality_score}`,
        });
        return; // done via edge path
      } catch (edgeErr) {
        console.warn('Edge calculation failed:', edgeErr);
        toast({
          title: "Edge Calculation Error",
          description: "Unable to complete calculation via server. Please try again.",
          variant: "destructive"
        });
        return;
      }

    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate financed emissions.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getDataQualityInfo = (score: number) => {
    const levels = {
      1: { label: "Verified Actual", color: "text-green-600", description: "Asset-specific measured data" },
      2: { label: "Partially Verified", color: "text-blue-600", description: "Mix of asset-specific and proxy data" },
      3: { label: "Estimated Proxy", color: "text-yellow-600", description: "Representative proxy data" },
      4: { label: "Estimated Average", color: "text-orange-600", description: "Average proxy data" },
      5: { label: "Very Estimated", color: "text-red-600", description: "Highly uncertain data" }
    };
    return levels[score as keyof typeof levels] || levels[5];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Motor Vehicle Loan PCAF Calculator
          </CardTitle>
          <CardDescription>
            Calculate PCAF Category 15 financed emissions for motor vehicle loans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loan Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="loanId">Loan ID *</Label>
              <Input
                id="loanId"
                value={loanData.loan_id}
                onChange={(e) => handleInputChange('loan_id', e.target.value)}
                placeholder="e.g., MVL-2024-001"
              />
            </div>
            
            <div>
              <Label htmlFor="loanAmount">Loan Amount ($) *</Label>
              <Input
                id="loanAmount"
                type="number"
                value={loanData.loan_amount}
                onChange={(e) => handleInputChange('loan_amount', parseFloat(e.target.value) || 0)}
                placeholder="50000"
              />
            </div>

            <div>
              <Label htmlFor="outstandingBalance">Outstanding Balance ($) *</Label>
              <Input
                id="outstandingBalance"
                type="number"
                value={loanData.outstanding_balance}
                onChange={(e) => handleInputChange('outstanding_balance', parseFloat(e.target.value) || 0)}
                placeholder="35000"
              />
            </div>

            <div>
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select value={loanData.vehicle_type} onValueChange={(value) => handleInputChange('vehicle_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passenger_car">Passenger Car</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="commercial_vehicle">Commercial Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fuelType">Fuel Type *</Label>
              <Select value={loanData.fuel_type} onValueChange={(value) => handleInputChange('fuel_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="engineSize">Engine Size</Label>
              <Select value={loanData.engine_size} onValueChange={(value) => handleInputChange('engine_size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select engine size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0-1.5L">1.0-1.5L</SelectItem>
                  <SelectItem value="1.5-2.0L">1.5-2.0L</SelectItem>
                  <SelectItem value="2.0L+">2.0L+</SelectItem>
                  <SelectItem value="all">All (Electric/Hybrid)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehicleValue">Vehicle Value ($) *</Label>
              <Input
                id="vehicleValue"
                type="number"
                value={loanData.vehicle_value}
                onChange={(e) => handleInputChange('vehicle_value', parseFloat(e.target.value) || 0)}
                placeholder="45000"
              />
            </div>

            <div>
              <Label htmlFor="kmPerYear">Estimated km/year</Label>
              <Input
                id="kmPerYear"
                type="number"
                value={loanData.estimated_km_per_year}
                onChange={(e) => handleInputChange('estimated_km_per_year', parseFloat(e.target.value) || 15000)}
                placeholder="15000"
              />
            </div>

            <div>
              <Label htmlFor="loanTerm">Loan Term (years)</Label>
              <Input
                id="loanTerm"
                type="number"
                value={loanData.loan_term_years}
                onChange={(e) => handleInputChange('loan_term_years', parseFloat(e.target.value) || 5)}
                placeholder="5"
              />
            </div>

            <div>
              <Label htmlFor="originationDate">Loan Origination Date</Label>
              <Input
                id="originationDate"
                type="date"
                value={loanData.loan_origination_date}
                onChange={(e) => handleInputChange('loan_origination_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="reportingDate">Reporting Date</Label>
              <Input
                id="reportingDate"
                type="date"
                value={loanData.reporting_date}
                onChange={(e) => handleInputChange('reporting_date', e.target.value)}
              />
            </div>
          </div>

          {/* Emission Factor Preview */}
          {loanData.vehicle_type && loanData.fuel_type && (
            <Alert>
              <Fuel className="h-4 w-4" />
              <AlertDescription>
                {(() => {
                  const factor = getMatchingEmissionFactor();
                  return factor ? (
                    <div>
                      <strong>Emission Factor:</strong> {factor.emission_factor_kg_co2_km} kg CO₂/km 
                      <span className="ml-2">
                        <Badge variant="outline">PCAF Level {factor.data_quality_level}</Badge>
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        Source: {factor.source}
                      </div>
                    </div>
                  ) : (
                    <span className="text-destructive">No matching emission factor found for this vehicle configuration.</span>
                  );
                })()}
              </AlertDescription>
            </Alert>
          )}

          {/* Calculate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={calculateFinancedEmissions} 
              disabled={isCalculating}
              size="lg"
              className="min-w-48"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? "Calculating..." : "Calculate Financed Emissions"}
            </Button>
          </div>

          {/* Results */}
          {calculation && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  PCAF Calculation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Attribution Factor</div>
                    <div className="text-2xl font-bold">{(calculation.attribution_factor * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Outstanding/Vehicle Value</div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Annual Emissions</div>
                    <div className="text-2xl font-bold">{calculation.annual_emissions.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground">tCO₂e/year</div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-sm border border-primary/20">
                    <div className="text-sm text-muted-foreground">Financed Emissions</div>
                    <div className="text-2xl font-bold text-primary">{calculation.financed_emissions.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground">tCO₂e (PCAF Cat. 15)</div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Data Quality</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{calculation.data_quality_score}</div>
                      {calculation.pcaf_compliant ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className={`text-xs ${getDataQualityInfo(calculation.data_quality_score).color}`}>
                      {getDataQualityInfo(calculation.data_quality_score).label}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium mb-2">Calculation Details:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Emission Factor: {calculation.emission_factor_used} kg CO₂/km</div>
                    <div>Temporal Attribution: {(calculation.temporal_attribution * 100).toFixed(1)}%</div>
                    <div>PCAF Compliant: {calculation.pcaf_compliant ? "Yes" : "No"}</div>
                    <div>Data Quality: {getDataQualityInfo(calculation.data_quality_score).description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Alert className="mt-4">
            <AlertDescription>
              Demo methodology disclosure: calculations run via Supabase Edge Function using placeholder emission factors (TTW basis), scope limited to motor vehicle loans. Official PCAF factors will be integrated upon accreditation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}