import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { db, type LoanPortfolioItem, type EmissionFactor, type GridEmissionFactor } from "@/lib/db";
import { pcafApi } from "@/lib/pcaf-api";
import {
  Car,
  Calculator,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Fuel,
  Building,
  Truck,
  Bike,
  Ship,
  Factory,
  Leaf,
  Globe,
  Settings,
  Database,
  Lightbulb
} from "lucide-react";

interface EnhancedMotorVehicleLoan {
  loan_id: string;
  loan_amount: number;
  
  // Enhanced PCAF vehicle classification
  vehicle_category: 'passenger_car' | 'motorcycle' | 'light_commercial_truck' | 'medium_heavy_commercial_truck' | 'recreational_vehicle' | 'bus' | 'snowmobile_atv' | 'boat' | 'yellow_equipment';
  vehicle_subcategory?: string;
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'natural_gas' | 'propane';
  engine_size: string;
  
  // PCAF lending type
  lending_type: 'consumer' | 'business';
  fleet_id?: string;
  fleet_size?: number;
  
  vehicle_value: number;
  estimated_km_per_year: number;
  loan_term_years: number;
  outstanding_balance: number;
  share_of_financing?: number;
  loan_origination_date: string;
  reporting_date: string;
  
  // Regional settings
  country: string;
  region?: string;
  
  // New vehicle options
  is_new_vehicle: boolean;
  manufacturing_year?: number;
  embodied_emissions_kg?: number; // For Scope 3
}

interface EnhancedCalculationResult {
  // PCAF calculations
  attribution_factor: number;
  temporal_attribution: number;
  
  // Scope-based emissions
  scope_1_emissions: number;
  scope_2_emissions: number;
  scope_3_emissions: number;
  total_annual_emissions: number;
  financed_emissions: number;
  
  // Data quality
  pcaf_data_option: '1a' | '1b' | '2a' | '2b' | '3a' | '3b';
  data_quality_score: number;
  data_quality_drivers: string[];
  
  // Factors used
  emission_factor_used: number;
  grid_emission_factor_used?: number;
  electricity_consumption?: number;
  
  pcaf_compliant: boolean;
}

const VEHICLE_CATEGORY_OPTIONS = [
  { value: 'passenger_car', label: 'Passenger Car', icon: Car },
  { value: 'motorcycle', label: 'Motorcycle', icon: Bike },
  { value: 'light_commercial_truck', label: 'Light Commercial Truck (Van)', icon: Truck },
  { value: 'medium_heavy_commercial_truck', label: 'Medium/Heavy Commercial Truck', icon: Truck },
  { value: 'recreational_vehicle', label: 'Recreational Vehicle', icon: Car },
  { value: 'bus', label: 'Bus', icon: Building },
  { value: 'snowmobile_atv', label: 'Snowmobile/ATV', icon: Car },
  { value: 'boat', label: 'Boat', icon: Ship },
  { value: 'yellow_equipment', label: 'Yellow Equipment (Construction/Mining)', icon: Factory }
];

const FUEL_TYPE_OPTIONS = [
  { value: 'gasoline', label: 'Gasoline', icon: Fuel },
  { value: 'diesel', label: 'Diesel', icon: Fuel },
  { value: 'electric', label: 'Electric', icon: Zap },
  { value: 'hybrid', label: 'Hybrid', icon: Leaf },
  { value: 'natural_gas', label: 'Natural Gas', icon: Globe },
  { value: 'propane', label: 'Propane', icon: Globe }
];

const COUNTRY_OPTIONS = [
  { value: 'Global Average', label: 'Global Average' },
  { value: 'United States', label: 'United States' },
  { value: 'European Union', label: 'European Union' },
  { value: 'China', label: 'China' },
  { value: 'India', label: 'India' },
];

export function EnhancedPCAFCalculator() {
  const { toast } = useToast();
  const [loanData, setLoanData] = useState<EnhancedMotorVehicleLoan>({
    loan_id: "",
    loan_amount: 0,
    vehicle_category: 'passenger_car',
    fuel_type: 'gasoline',
    engine_size: "",
    lending_type: 'consumer',
    vehicle_value: 0,
    estimated_km_per_year: 15000,
    loan_term_years: 5,
    outstanding_balance: 0,
    share_of_financing: 1,
    loan_origination_date: "",
    reporting_date: new Date().toISOString().split('T')[0],
    country: 'Global Average',
    is_new_vehicle: false
  });

  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [gridFactors, setGridFactors] = useState<GridEmissionFactor[]>([]);
  const [calculation, setCalculation] = useState<EnhancedCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Load emission factors and grid factors from IndexedDB
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [factors, gridFactors] = await Promise.all([
        db.emission_factors.toArray(),
        db.grid_emission_factors.toArray()
      ]);
      setEmissionFactors(factors);
      setGridFactors(gridFactors);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Database Error",
        description: "Failed to load emission factors database.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof EnhancedMotorVehicleLoan, value: string | number | boolean) => {
    setLoanData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate outstanding balance if loan amount changes
    if (field === 'loan_amount' && typeof value === 'number') {
      const estimatedOutstanding = value * 0.7; // Assume 70% outstanding
      setLoanData(prev => ({ ...prev, outstanding_balance: estimatedOutstanding }));
    }
  };

  const getMatchingEmissionFactor = (): EmissionFactor | null => {
    return emissionFactors.find(factor => 
      (factor.vehicle_category === loanData.vehicle_category || factor.vehicle_type === loanData.vehicle_category) &&
      factor.fuel_type === loanData.fuel_type &&
      (factor.engine_size_range === loanData.engine_size || factor.engine_size_range === 'all')
    ) || null;
  };

  const getMatchingGridFactor = (): GridEmissionFactor | null => {
    return gridFactors.find(factor => 
      factor.country === loanData.country
    ) || gridFactors.find(factor => factor.country === 'Global Average') || null;
  };

  const calculateTemporalAttribution = (): number => {
    if (!loanData.loan_origination_date || !loanData.reporting_date) return 1;
    
    const originationDate = new Date(loanData.loan_origination_date);
    const reportingDate = new Date(loanData.reporting_date);
    const reportingYear = reportingDate.getFullYear();
    
    const yearStart = new Date(reportingYear, 0, 1);
    const yearEnd = new Date(reportingYear, 11, 31);
    
    const loanStartInYear = originationDate > yearStart ? originationDate : yearStart;
    const loanEndInYear = reportingDate < yearEnd ? reportingDate : yearEnd;
    
    if (loanStartInYear > loanEndInYear) return 0;
    
    const monthsInYear = (loanEndInYear.getTime() - loanStartInYear.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return Math.min(monthsInYear / 12, 1);
  };

  const determinePCAFDataOption = (emissionFactor: EmissionFactor): { option: '1a' | '1b' | '2a' | '2b' | '3a' | '3b', drivers: string[] } => {
    const drivers: string[] = [];
    
    // Check data completeness
    const hasVehicleSpecific = loanData.vehicle_subcategory && loanData.engine_size;
    const hasActualKm = loanData.estimated_km_per_year !== 15000; // Not default
    const hasOriginationDate = !!loanData.loan_origination_date;
    
    if (hasVehicleSpecific && hasActualKm && hasOriginationDate) {
      drivers.push('Vehicle-specific data available', 'Actual km/year provided', 'Complete temporal data');
      return { option: '1b', drivers };
    }
    
    if (hasVehicleSpecific && hasActualKm) {
      drivers.push('Vehicle-specific data available', 'Actual km/year provided');
      return { option: '2a', drivers };
    }
    
    if (hasVehicleSpecific) {
      drivers.push('Vehicle-specific data available', 'Statistical km/year used');
      return { option: '2b', drivers };
    }
    
    if (loanData.vehicle_category) {
      drivers.push('Vehicle category provided', 'Average proxy data used');
      return { option: '3a', drivers };
    }
    
    drivers.push('Limited vehicle data', 'Assumed average values');
    return { option: '3b', drivers };
  };

  const calculateFinancedEmissions = async () => {
    setIsCalculating(true);
    
    try {
      // Validate inputs
      if (!loanData.loan_id || !loanData.vehicle_category || !loanData.fuel_type) {
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
      // Attempt Edge Function first (single source of truth)
      const temporal_attr = calculateTemporalAttribution();
      try {
        const edgeVehicleType = (() => {
          switch (loanData.vehicle_category) {
            case 'light_commercial_truck':
            case 'medium_heavy_commercial_truck':
              return 'commercial_vehicle';
            case 'motorcycle':
              return 'motorcycle';
            case 'passenger_car':
            default:
              return 'passenger_car';
          }
        })();

        const edgePayload = {
          loan_id: loanData.loan_id,
          borrower_name: 'Demo Borrower',
          loan_amount: loanData.loan_amount,
          outstanding_balance: loanData.outstanding_balance,
          interest_rate: 0,
          term_months: loanData.loan_term_years * 12,
          origination_date: loanData.loan_origination_date || new Date().toISOString().split('T')[0],
          share_of_financing: loanData.share_of_financing,
          vehicle_details: {
            make: '',
            model: '',
            year: new Date().getFullYear(),
            type: edgeVehicleType,
            fuel_type: loanData.fuel_type,
            value_at_origination: loanData.vehicle_value,
            annual_mileage: Math.round(loanData.estimated_km_per_year * 0.621371),
          },
        } as const;

        const edgeRes = await pcafApi.calculateEmissions(edgePayload as any);

        const efPerMile = edgeRes.data.calculations.emission_factor_used as number;
        const efPerKm = efPerMile / 1.60934;
        const attribution_factor = edgeRes.data.calculations.attribution_factor as number;
        const annual_emissions_edge = edgeRes.data.calculations.annual_vehicle_emissions as number;
        const financed_emissions = annual_emissions_edge * attribution_factor * temporal_attr;
        const data_quality_score = edgeRes.data.data_quality.score as number;
        const data_quality_drivers: string[] = edgeRes.data.data_quality.drivers || [];
        const pcaf_data_option = edgeRes.data.data_option as '1a' | '1b' | '2a' | '2b' | '3a' | '3b' | undefined;

        const emissionFactorLocal = getMatchingEmissionFactor();
        const gridFactorLocal = loanData.fuel_type === 'electric' || loanData.fuel_type === 'hybrid' 
          ? getMatchingGridFactor() 
          : null;

        let scope_1_emissions = 0;
        let scope_2_emissions = 0;
        let scope_3_emissions = 0;
        let electricity_consumption = 0;

        if (emissionFactorLocal) {
          if (loanData.fuel_type !== 'electric') {
            scope_1_emissions = (loanData.estimated_km_per_year * emissionFactorLocal.emission_factor_kg_co2_km) / 1000;
          }
          if ((loanData.fuel_type === 'electric' || loanData.fuel_type === 'hybrid') && gridFactorLocal && emissionFactorLocal.electricity_consumption_kwh_km) {
            electricity_consumption = loanData.estimated_km_per_year * emissionFactorLocal.electricity_consumption_kwh_km;
            scope_2_emissions = (electricity_consumption * gridFactorLocal.emission_factor_kg_co2_kwh) / 1000;
            if (loanData.fuel_type === 'hybrid') {
              scope_1_emissions = scope_1_emissions * 0.6;
              scope_2_emissions = scope_2_emissions * 0.4;
            }
          }
          if (loanData.is_new_vehicle && loanData.embodied_emissions_kg) {
            scope_3_emissions = loanData.embodied_emissions_kg / 1000;
          }
        } else {
          scope_1_emissions = annual_emissions_edge;
        }

        const total_local = scope_1_emissions + scope_2_emissions + scope_3_emissions;
        const scale = total_local > 0 ? (annual_emissions_edge / total_local) : 1;
        scope_1_emissions *= scale;
        scope_2_emissions *= scale;
        scope_3_emissions *= scale;
        const total_annual_emissions = scope_1_emissions + scope_2_emissions + scope_3_emissions;

        const pcaf_compliant = data_quality_score <= 3;

        const result: EnhancedCalculationResult = {
          attribution_factor,
          temporal_attribution: temporal_attr,
          scope_1_emissions,
          scope_2_emissions,
          scope_3_emissions,
          total_annual_emissions,
          financed_emissions,
          pcaf_data_option: (pcaf_data_option || '2b') as any,
          data_quality_score,
          data_quality_drivers,
          emission_factor_used: Number(efPerKm.toFixed(6)),
          grid_emission_factor_used: gridFactorLocal?.emission_factor_kg_co2_kwh,
          electricity_consumption,
          pcaf_compliant,
        };

        setCalculation(result);

        const loanPortfolioItem: Omit<LoanPortfolioItem, 'id'> = {
          loan_id: loanData.loan_id,
          loan_amount: loanData.loan_amount,
          vehicle_category: loanData.vehicle_category,
          vehicle_type: loanData.vehicle_category,
          vehicle_subcategory: loanData.vehicle_subcategory,
          fuel_type: loanData.fuel_type,
          engine_size: loanData.engine_size,
          lending_type: loanData.lending_type,
          fleet_id: loanData.fleet_id,
          fleet_size: loanData.fleet_size,
          vehicle_value: loanData.vehicle_value,
          estimated_km_per_year: loanData.estimated_km_per_year,
          loan_term_years: loanData.loan_term_years,
          outstanding_balance: loanData.outstanding_balance,

          scope_1_emissions,
          scope_2_emissions,
          scope_3_emissions,

          attribution_factor,
          annual_emissions: total_annual_emissions,
          financed_emissions,
          emission_factor_kg_co2_km: Number(efPerKm.toFixed(6)),
          grid_emission_factor: gridFactorLocal?.emission_factor_kg_co2_kwh,

          pcaf_data_option: (pcaf_data_option || '2b') as any,
          data_quality_score,
          data_quality_drivers,

          loan_origination_date: loanData.loan_origination_date,
          reporting_date: loanData.reporting_date,
          temporal_attribution: temporal_attr,
          data_source: 'edge_function',
          emission_factor_source: 'supabase:emission_factors',
          verification_status: 'unverified' as const,
          pcaf_asset_class: 'motor_vehicle_loans',
          country: loanData.country,
          region: loanData.region,

          is_new_vehicle: loanData.is_new_vehicle,
          manufacturing_year: loanData.manufacturing_year,

          created_at: new Date(),
          updated_at: new Date(),
        };

        await db.loans.add(loanPortfolioItem);

        // Attempt to persist to Supabase loans when available
        try {
          await pcafApi.updateLoanByLoanId(loanData.loan_id, {
            attribution_factor,
            annual_emissions_tco2e: total_annual_emissions,
            financed_emissions_tco2e: financed_emissions,
            data_quality_score,
            pcaf_data_option,
            share_of_financing: loanData.share_of_financing,
          });
        } catch (e) {
          console.warn('Supabase persistence skipped:', e);
        }

        toast({
          title: 'Enhanced PCAF Calculation Complete',
          description: `Financed emissions: ${financed_emissions.toFixed(3)} tCO₂e. PCAF Option: ${(pcaf_data_option || '2b').toUpperCase()}, Quality: Level ${data_quality_score}`,
        });

        return;
      } catch (edgeErr) {
        console.warn('Edge calculation failed:', edgeErr);
        toast({
          title: 'Edge Calculation Error',
          description: 'Unable to complete calculation via server. Please try again.',
          variant: 'destructive',
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

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ComponentType> = {
      passenger_car: Car,
      motorcycle: Bike,
      light_commercial_truck: Truck,
      medium_heavy_commercial_truck: Truck,
      recreational_vehicle: Car,
      bus: Building,
      snowmobile_atv: Car,
      boat: Ship,
      yellow_equipment: Factory
    };
    return iconMap[category] || Car;
  };

  const emissionFactor = getMatchingEmissionFactor();
  const gridFactor = getMatchingGridFactor();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Enhanced PCAF Motor Vehicle Loan Calculator
          </CardTitle>
          <CardDescription>
            Full PCAF Category 15 compliance with Scope 1, 2, and 3 emissions calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="classification">PCAF Classification</TabsTrigger>
              <TabsTrigger value="emissions">Emissions Scope</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
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
                  <Label htmlFor="shareOfFinancing">Share of Financing (0-1)</Label>
                  <Input
                    id="shareOfFinancing"
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={loanData.share_of_financing ?? 1}
                    onChange={(e) => handleInputChange('share_of_financing', Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
                    placeholder="1.00"
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
              </div>
            </TabsContent>

            <TabsContent value="classification" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleCategory">PCAF Vehicle Category *</Label>
                  <Select value={loanData.vehicle_category} onValueChange={(value: any) => handleInputChange('vehicle_category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PCAF vehicle category" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_CATEGORY_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fuelType">Fuel Type *</Label>
                  <Select value={loanData.fuel_type} onValueChange={(value: any) => handleInputChange('fuel_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPE_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lendingType">PCAF Lending Type *</Label>
                  <Select value={loanData.lending_type} onValueChange={(value: any) => handleInputChange('lending_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lending type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumer">Consumer Lending</SelectItem>
                      <SelectItem value="business">Business Lending (Fleet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loanData.lending_type === 'business' && (
                  <>
                    <div>
                      <Label htmlFor="fleetId">Fleet ID</Label>
                      <Input
                        id="fleetId"
                        value={loanData.fleet_id || ''}
                        onChange={(e) => handleInputChange('fleet_id', e.target.value)}
                        placeholder="FLEET-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fleetSize">Fleet Size</Label>
                      <Input
                        id="fleetSize"
                        type="number"
                        value={loanData.fleet_size || ''}
                        onChange={(e) => handleInputChange('fleet_size', parseInt(e.target.value) || undefined)}
                        placeholder="25"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="country">Country/Region</Label>
                  <Select value={loanData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emissions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="newVehicle"
                    checked={loanData.is_new_vehicle}
                    onCheckedChange={(checked) => handleInputChange('is_new_vehicle', checked)}
                  />
                  <Label htmlFor="newVehicle">New Vehicle (enables Scope 3)</Label>
                </div>

                {loanData.is_new_vehicle && (
                  <>
                    <div>
                      <Label htmlFor="manufacturingYear">Manufacturing Year</Label>
                      <Input
                        id="manufacturingYear"
                        type="number"
                        value={loanData.manufacturing_year || ''}
                        onChange={(e) => handleInputChange('manufacturing_year', parseInt(e.target.value) || undefined)}
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <Label htmlFor="embodiedEmissions">Embodied Emissions (kg CO₂)</Label>
                      <Input
                        id="embodiedEmissions"
                        type="number"
                        value={loanData.embodied_emissions_kg || ''}
                        onChange={(e) => handleInputChange('embodied_emissions_kg', parseFloat(e.target.value) || undefined)}
                        placeholder="8000"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Emission Factor Preview */}
              {emissionFactor && (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>Scope 1 Emission Factor:</strong> {emissionFactor.emission_factor_kg_co2_km} kg CO₂/km
                        <Badge variant="outline" className="ml-2">PCAF {emissionFactor.pcaf_data_option}</Badge>
                      </div>
                      {emissionFactor.electricity_consumption_kwh_km && (
                        <div>
                          <strong>Electricity Consumption:</strong> {emissionFactor.electricity_consumption_kwh_km} kWh/km
                        </div>
                      )}
                      {gridFactor && (loanData.fuel_type === 'electric' || loanData.fuel_type === 'hybrid') && (
                        <div>
                          <strong>Grid Emission Factor ({loanData.country}):</strong> {gridFactor.emission_factor_kg_co2_kwh} kg CO₂/kWh
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Source: {emissionFactor.source}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleSubcategory">Vehicle Subcategory</Label>
                  <Input
                    id="vehicleSubcategory"
                    value={loanData.vehicle_subcategory || ''}
                    onChange={(e) => handleInputChange('vehicle_subcategory', e.target.value)}
                    placeholder="e.g., Compact SUV, Sedan"
                  />
                </div>

                <div>
                  <Label htmlFor="engineSize">Engine Size/Range</Label>
                  <Select value={loanData.engine_size} onValueChange={(value) => handleInputChange('engine_size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engine size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0-1.5L">1.0-1.5L</SelectItem>
                      <SelectItem value="1.5-2.0L">1.5-2.0L</SelectItem>
                      <SelectItem value="2.0L+">2.0L+</SelectItem>
                      <SelectItem value="all">All (Electric/Hybrid)</SelectItem>
                      <SelectItem value="125-400cc">125-400cc (Motorcycle)</SelectItem>
                      <SelectItem value="2.0-3.0L">2.0-3.0L (Light Commercial)</SelectItem>
                      <SelectItem value="6.0L+">6.0L+ (Heavy Commercial)</SelectItem>
                      <SelectItem value="8.0L+">8.0L+ (Bus)</SelectItem>
                      <SelectItem value="3.0L+">3.0L+ (Recreational)</SelectItem>
                      <SelectItem value="outboard">Outboard (Boat)</SelectItem>
                      <SelectItem value="10.0L+">10.0L+ (Construction Equipment)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="region">Region (Optional)</Label>
                  <Input
                    id="region"
                    value={loanData.region || ''}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    placeholder="e.g., California, Ontario"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Calculate Button */}
          <div className="flex justify-center mt-6">
            <Button 
              onClick={calculateFinancedEmissions} 
              disabled={isCalculating}
              size="lg"
              className="min-w-48"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? "Calculating..." : "Calculate Enhanced PCAF Emissions"}
            </Button>
          </div>

          {/* Enhanced Results */}
          {calculation && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Enhanced PCAF Calculation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Attribution Factor</div>
                    <div className="text-2xl font-bold">{(calculation.attribution_factor * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Outstanding/Vehicle Value</div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Annual Emissions</div>
                    <div className="text-2xl font-bold">{calculation.total_annual_emissions.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground">tCO₂e/year (All Scopes)</div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="text-sm text-muted-foreground">Financed Emissions</div>
                    <div className="text-2xl font-bold text-primary">{calculation.financed_emissions.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground">tCO₂e (PCAF Result)</div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">PCAF Data Quality</div>
                    <div className="text-2xl font-bold">
                      {calculation.pcaf_data_option}
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${getDataQualityInfo(calculation.data_quality_score).color}`}
                      >
                        Level {calculation.data_quality_score}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getDataQualityInfo(calculation.data_quality_score).label}
                    </div>
                  </div>
                </div>

                {/* Scope Breakdown */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">PCAF Scope Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Fuel className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Scope 1 (Direct)</span>
                      </div>
                      <div className="text-xl font-bold">{calculation.scope_1_emissions.toFixed(3)}</div>
                      <div className="text-sm text-muted-foreground">tCO₂e - Fuel combustion</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Scope 2 (Indirect)</span>
                      </div>
                      <div className="text-xl font-bold">{calculation.scope_2_emissions.toFixed(3)}</div>
                      <div className="text-sm text-muted-foreground">tCO₂e - Electricity use</div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Factory className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Scope 3 (Value Chain)</span>
                      </div>
                      <div className="text-xl font-bold">{calculation.scope_3_emissions.toFixed(3)}</div>
                      <div className="text-sm text-muted-foreground">tCO₂e - Embodied emissions</div>
                    </div>
                  </div>
                </div>

                {/* Data Quality Drivers */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Data Quality Assessment</h4>
                  <div className="space-y-2">
                    {calculation.data_quality_drivers.map((driver, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{driver}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Badge variant={calculation.pcaf_compliant ? "default" : "destructive"}>
                      {calculation.pcaf_compliant ? "PCAF Compliant" : "Requires Improvement"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}