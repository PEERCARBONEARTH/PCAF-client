/**
 * Create Instrument Form
 * Comprehensive form supporting Loans, Letters of Credit, and Guarantees
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  pcafApiClient, 
  type CreateInstrumentRequest,
  PERMISSIONS
} from "@/services/pcafApiClient";
import {
  DollarSign,
  FileText,
  Shield,
  Car,
  Leaf,
  Calendar,
  Building,
  ArrowLeft,
  Save,
  AlertCircle
} from "lucide-react";

type InstrumentType = 'LOAN' | 'LC' | 'GUARANTEE';

interface FormData extends Omit<CreateInstrumentRequest, 'lcDetails' | 'guaranteeDetails'> {
  lcDetails?: {
    lcType: 'DEALER_FLOOR_PLAN' | 'IMPORT_VEHICLE' | 'FLEET_PURCHASE';
    beneficiary: string;
    expiryDate: string;
    lcNumber: string;
    issuingBank: string;
  };
  guaranteeDetails?: {
    guaranteeType: 'PERFORMANCE' | 'PAYMENT' | 'RESIDUAL_VALUE';
    probabilityOfActivation: number;
    guaranteeNumber: string;
    coveredObligations: string;
    triggerEvents: string[];
  };
}

export function CreateInstrumentForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<InstrumentType>('LOAN');
  
  const [formData, setFormData] = useState<FormData>({
    borrowerName: '',
    instrumentType: 'LOAN',
    instrumentAmount: 0,
    instrumentCurrency: 'USD',
    vehicleValue: 0,
    vehicleCurrency: 'USD',
    vehicle: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'passenger_car',
      fuelType: 'gasoline'
    },
    emissionsData: {
      dataQualityScore: 3,
      annualEmissions: 0,
      emissionsUnit: 'tCO2e'
    }
  });

  // Check permissions
  const canCreate = pcafApiClient.hasPermission(PERMISSIONS.INSTRUMENTS_CREATE);

  if (!canCreate) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to create instruments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.borrowerName || !formData.instrumentAmount || !formData.vehicleValue) {
        throw new Error('Please fill in all required fields');
      }

      // Type-specific validation
      if (selectedType === 'LC' && (!formData.lcDetails?.beneficiary || !formData.lcDetails?.expiryDate)) {
        throw new Error('Please fill in all LC details');
      }

      if (selectedType === 'GUARANTEE' && (!formData.guaranteeDetails?.guaranteeType || 
          formData.guaranteeDetails?.probabilityOfActivation === undefined)) {
        throw new Error('Please fill in all guarantee details');
      }

      const instrumentData: CreateInstrumentRequest = {
        ...formData,
        instrumentType: selectedType
      };

      let result;
      switch (selectedType) {
        case 'LOAN':
          result = await pcafApiClient.createLoan(instrumentData);
          break;
        case 'LC':
          result = await pcafApiClient.createLC(instrumentData);
          break;
        case 'GUARANTEE':
          result = await pcafApiClient.createGuarantee(instrumentData);
          break;
      }

      toast({
        title: "Instrument Created",
        description: `${selectedType} has been created successfully with ID: ${result.id}`,
      });

      // Redirect to ledger
      window.location.href = '/instruments';

    } catch (error) {
      console.error('Failed to create instrument:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create instrument",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateVehicleData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value
      }
    }));
  };

  const updateEmissionsData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      emissionsData: {
        ...prev.emissionsData,
        [field]: value
      }
    }));
  };

  const updateLCDetails = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      lcDetails: {
        ...prev.lcDetails,
        [field]: value
      } as any
    }));
  };

  const updateGuaranteeDetails = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      guaranteeDetails: {
        ...prev.guaranteeDetails,
        [field]: value
      } as any
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Instrument</h1>
          <p className="text-muted-foreground">
            Add a new motor vehicle financing instrument to your portfolio
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/instruments'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ledger
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Instrument Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Instrument Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as InstrumentType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="LOAN" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Loan
                </TabsTrigger>
                <TabsTrigger value="LC" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Letter of Credit
                </TabsTrigger>
                <TabsTrigger value="GUARANTEE" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Guarantee
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>      
  {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="borrowerName">Borrower Name *</Label>
                <Input
                  id="borrowerName"
                  value={formData.borrowerName}
                  onChange={(e) => updateFormData('borrowerName', e.target.value)}
                  placeholder="Enter borrower name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="instrumentAmount">Instrument Amount *</Label>
                <div className="flex">
                  <Select 
                    value={formData.instrumentCurrency} 
                    onValueChange={(value) => updateFormData('instrumentCurrency', value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="instrumentAmount"
                    type="number"
                    value={formData.instrumentAmount}
                    onChange={(e) => updateFormData('instrumentAmount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="flex-1 ml-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicleValue">Vehicle Value *</Label>
                <div className="flex">
                  <Select 
                    value={formData.vehicleCurrency} 
                    onValueChange={(value) => updateFormData('vehicleCurrency', value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="vehicleValue"
                    type="number"
                    value={formData.vehicleValue}
                    onChange={(e) => updateFormData('vehicleValue', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="flex-1 ml-2"
                    required
                  />
                </div>
              </div>

              {(selectedType === 'LC' || selectedType === 'GUARANTEE') && (
                <div>
                  <Label htmlFor="underlyingValue">Underlying Transaction Value</Label>
                  <div className="flex">
                    <Select 
                      value={formData.underlyingTransactionCurrency || formData.instrumentCurrency} 
                      onValueChange={(value) => updateFormData('underlyingTransactionCurrency', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="underlyingValue"
                      type="number"
                      value={formData.underlyingTransactionValue || ''}
                      onChange={(e) => updateFormData('underlyingTransactionValue', parseFloat(e.target.value) || undefined)}
                      placeholder="Optional"
                      className="flex-1 ml-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.vehicle.make}
                  onChange={(e) => updateVehicleData('make', e.target.value)}
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.vehicle.model}
                  onChange={(e) => updateVehicleData('model', e.target.value)}
                  placeholder="e.g., Camry"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.vehicle.year}
                  onChange={(e) => updateVehicleData('year', parseInt(e.target.value) || new Date().getFullYear())}
                  min="1900"
                  max={new Date().getFullYear() + 2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select 
                  value={formData.vehicle.type} 
                  onValueChange={(value) => updateVehicleData('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passenger_car">Passenger Car</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="commercial">Commercial Vehicle</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fuelType">Fuel Type *</Label>
                <Select 
                  value={formData.vehicle.fuelType} 
                  onValueChange={(value) => updateVehicleData('fuelType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="plug_in_hybrid">Plug-in Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>  
      {/* Emissions Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Emissions Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dataQualityScore">PCAF Data Quality Score *</Label>
                <Select 
                  value={formData.emissionsData.dataQualityScore.toString()} 
                  onValueChange={(value) => updateEmissionsData('dataQualityScore', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Excellent (Primary data, asset level)</SelectItem>
                    <SelectItem value="2">2 - Good (Primary data, company level)</SelectItem>
                    <SelectItem value="3">3 - Fair (Average data, asset level)</SelectItem>
                    <SelectItem value="4">4 - Poor (Average data, company level)</SelectItem>
                    <SelectItem value="5">5 - Very Poor (Estimated data)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="annualEmissions">Annual Emissions *</Label>
                <div className="flex">
                  <Input
                    id="annualEmissions"
                    type="number"
                    step="0.001"
                    value={formData.emissionsData.annualEmissions}
                    onChange={(e) => updateEmissionsData('annualEmissions', parseFloat(e.target.value) || 0)}
                    placeholder="0.000"
                    className="flex-1"
                    required
                  />
                  <Select 
                    value={formData.emissionsData.emissionsUnit} 
                    onValueChange={(value) => updateEmissionsData('emissionsUnit', value)}
                  >
                    <SelectTrigger className="w-24 ml-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tCO2e">tCO₂e</SelectItem>
                      <SelectItem value="kgCO2e">kgCO₂e</SelectItem>
                      <SelectItem value="gCO2e">gCO₂e</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type-specific Details */}
        {selectedType === 'LC' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Letter of Credit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lcType">LC Type *</Label>
                  <Select 
                    value={formData.lcDetails?.lcType || ''} 
                    onValueChange={(value) => updateLCDetails('lcType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select LC type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEALER_FLOOR_PLAN">Dealer Floor Plan</SelectItem>
                      <SelectItem value="IMPORT_VEHICLE">Import Vehicle</SelectItem>
                      <SelectItem value="FLEET_PURCHASE">Fleet Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="beneficiary">Beneficiary *</Label>
                  <Input
                    id="beneficiary"
                    value={formData.lcDetails?.beneficiary || ''}
                    onChange={(e) => updateLCDetails('beneficiary', e.target.value)}
                    placeholder="Enter beneficiary name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.lcDetails?.expiryDate || ''}
                    onChange={(e) => updateLCDetails('expiryDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lcNumber">LC Number</Label>
                  <Input
                    id="lcNumber"
                    value={formData.lcDetails?.lcNumber || ''}
                    onChange={(e) => updateLCDetails('lcNumber', e.target.value)}
                    placeholder="Optional LC number"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="issuingBank">Issuing Bank</Label>
                  <Input
                    id="issuingBank"
                    value={formData.lcDetails?.issuingBank || ''}
                    onChange={(e) => updateLCDetails('issuingBank', e.target.value)}
                    placeholder="Optional issuing bank"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedType === 'GUARANTEE' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Guarantee Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guaranteeType">Guarantee Type *</Label>
                  <Select 
                    value={formData.guaranteeDetails?.guaranteeType || ''} 
                    onValueChange={(value) => updateGuaranteeDetails('guaranteeType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guarantee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERFORMANCE">Performance Guarantee</SelectItem>
                      <SelectItem value="PAYMENT">Payment Guarantee</SelectItem>
                      <SelectItem value="RESIDUAL_VALUE">Residual Value Guarantee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="probabilityOfActivation">Probability of Activation (0-1) *</Label>
                  <Input
                    id="probabilityOfActivation"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.guaranteeDetails?.probabilityOfActivation || ''}
                    onChange={(e) => updateGuaranteeDetails('probabilityOfActivation', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 0.3"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="guaranteeNumber">Guarantee Number</Label>
                  <Input
                    id="guaranteeNumber"
                    value={formData.guaranteeDetails?.guaranteeNumber || ''}
                    onChange={(e) => updateGuaranteeDetails('guaranteeNumber', e.target.value)}
                    placeholder="Optional guarantee number"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="coveredObligations">Covered Obligations</Label>
                  <Textarea
                    id="coveredObligations"
                    value={formData.guaranteeDetails?.coveredObligations || ''}
                    onChange={(e) => updateGuaranteeDetails('coveredObligations', e.target.value)}
                    placeholder="Describe the obligations covered by this guarantee"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.href = '/instruments'}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create {selectedType}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}