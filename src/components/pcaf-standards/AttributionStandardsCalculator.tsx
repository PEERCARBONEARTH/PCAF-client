import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Building, Factory, Zap } from 'lucide-react';
import { PCAFAttributionService } from '@/services/pcaf-attribution-service';
import { mockAttributionResult } from '@/services/mock-pcaf-data';

interface AttributionInputs {
  standard: 'A' | 'B' | 'C';
  assetClass: string;
  // Standard A (Enterprise Value-based)
  outstandingAmount?: number;
  enterpriseValueIncludingCash?: number;
  // Standard B (Outstanding Amount-based)
  totalEquityPlusDebt?: number;
  vehicleValueAtOrigination?: number; // For motor vehicles
  // Standard C (Committed Amount-based)
  committedAmount?: number;
  totalProjectCost?: number;
  drawdownAmount?: number;
  // Common
  dataQualityLevel: number;
}

interface AttributionResult {
  attributionFactor: number;
  standard: string;
  assetClass: string;
  methodology: string;
  dataQualityAdjustment: number;
  finalAttributionFactor: number;
  validationChecks: {
    inputValidation: boolean;
    rangeValidation: boolean;
    consistencyCheck: boolean;
  };
  recommendations: string[];
}

const ASSET_CLASSES = {
  'A': [
    { value: 'listed_equity', label: 'Listed Equity' },
    { value: 'corporate_bonds', label: 'Corporate Bonds' },
    { value: 'sovereign_bonds', label: 'Sovereign Bonds' }
  ],
  'B': [
    { value: 'business_loans', label: 'Business Loans' },
    { value: 'unlisted_equity', label: 'Unlisted Equity' },
    { value: 'motor_vehicles', label: 'Motor Vehicles' },
    { value: 'mortgages', label: 'Mortgages' },
    { value: 'commercial_real_estate', label: 'Commercial Real Estate' }
  ],
  'C': [
    { value: 'project_finance', label: 'Project Finance' }
  ]
};

export const AttributionStandardsCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<AttributionInputs>({
    standard: 'B',
    assetClass: 'motor_vehicles',
    dataQualityLevel: 3
  });
  
  const [result, setResult] = useState<AttributionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateAttribution = async () => {
    setLoading(true);
    try {
      try {
        const result = await PCAFAttributionService.calculateAttribution(inputs);
        setResult(result);
      } catch (apiError) {
        console.log('API not available, using mock data for development');
        // Use mock data for development
        setResult({
          ...mockAttributionResult,
          standard: inputs.standard,
          assetClass: inputs.assetClass
        });
      }
    } catch (error) {
      console.error('Attribution calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStandardInputs = () => {
    switch (inputs.standard) {
      case 'A':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="outstandingAmount">Outstanding Amount ($)</Label>
              <Input
                id="outstandingAmount"
                type="number"
                value={inputs.outstandingAmount || ''}
                onChange={(e) => setInputs({...inputs, outstandingAmount: parseFloat(e.target.value)})}
                placeholder="1000000"
              />
            </div>
            
            <div>
              <Label htmlFor="enterpriseValue">Enterprise Value Including Cash ($)</Label>
              <Input
                id="enterpriseValue"
                type="number"
                value={inputs.enterpriseValueIncludingCash || ''}
                onChange={(e) => setInputs({...inputs, enterpriseValueIncludingCash: parseFloat(e.target.value)})}
                placeholder="50000000"
              />
            </div>
          </div>
        );
        
      case 'B':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="outstandingAmount">Outstanding Amount ($)</Label>
              <Input
                id="outstandingAmount"
                type="number"
                value={inputs.outstandingAmount || ''}
                onChange={(e) => setInputs({...inputs, outstandingAmount: parseFloat(e.target.value)})}
                placeholder="750000"
              />
            </div>
            
            {inputs.assetClass === 'motor_vehicles' ? (
              <div>
                <Label htmlFor="vehicleValue">Vehicle Value at Origination ($)</Label>
                <Input
                  id="vehicleValue"
                  type="number"
                  value={inputs.vehicleValueAtOrigination || ''}
                  onChange={(e) => setInputs({...inputs, vehicleValueAtOrigination: parseFloat(e.target.value)})}
                  placeholder="35000"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="totalEquityDebt">Total Equity Plus Debt ($)</Label>
                <Input
                  id="totalEquityDebt"
                  type="number"
                  value={inputs.totalEquityPlusDebt || ''}
                  onChange={(e) => setInputs({...inputs, totalEquityPlusDebt: parseFloat(e.target.value)})}
                  placeholder="5000000"
                />
              </div>
            )}
          </div>
        );
        
      case 'C':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="committedAmount">Committed Amount ($)</Label>
              <Input
                id="committedAmount"
                type="number"
                value={inputs.committedAmount || ''}
                onChange={(e) => setInputs({...inputs, committedAmount: parseFloat(e.target.value)})}
                placeholder="15000000"
              />
            </div>
            
            <div>
              <Label htmlFor="totalProjectCost">Total Project Cost ($)</Label>
              <Input
                id="totalProjectCost"
                type="number"
                value={inputs.totalProjectCost || ''}
                onChange={(e) => setInputs({...inputs, totalProjectCost: parseFloat(e.target.value)})}
                placeholder="50000000"
              />
            </div>
            
            <div>
              <Label htmlFor="drawdownAmount">Drawdown Amount ($) - Optional</Label>
              <Input
                id="drawdownAmount"
                type="number"
                value={inputs.drawdownAmount || ''}
                onChange={(e) => setInputs({...inputs, drawdownAmount: parseFloat(e.target.value)})}
                placeholder="12000000"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getStandardIcon = (standard: string) => {
    switch (standard) {
      case 'A': return <Building className="h-5 w-5 text-blue-600" />;
      case 'B': return <Factory className="h-5 w-5 text-green-600" />;
      case 'C': return <Zap className="h-5 w-5 text-purple-600" />;
      default: return <Calculator className="h-5 w-5" />;
    }
  };

  const getStandardDescription = (standard: string) => {
    switch (standard) {
      case 'A': return 'Enterprise Value-Based Attribution (Listed Equity, Corporate Bonds)';
      case 'B': return 'Outstanding Amount-Based Attribution (Loans, Unlisted Equity, Motor Vehicles)';
      case 'C': return 'Committed Amount-Based Attribution (Project Finance)';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            PCAF Attribution Standards Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={inputs.standard} onValueChange={(value) => setInputs({...inputs, standard: value as 'A' | 'B' | 'C', assetClass: ASSET_CLASSES[value as 'A' | 'B' | 'C'][0].value})}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="A" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Standard A
              </TabsTrigger>
              <TabsTrigger value="B" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Standard B
              </TabsTrigger>
              <TabsTrigger value="C" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Standard C
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={inputs.standard} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStandardIcon(inputs.standard)}
                  <h3 className="font-semibold">Standard {inputs.standard}</h3>
                </div>
                <p className="text-sm text-gray-600">{getStandardDescription(inputs.standard)}</p>
              </div>
              
              <div>
                <Label htmlFor="assetClass">Asset Class</Label>
                <Select value={inputs.assetClass} onValueChange={(value) => setInputs({...inputs, assetClass: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset class" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CLASSES[inputs.standard].map((assetClass) => (
                      <SelectItem key={assetClass.value} value={assetClass.value}>
                        {assetClass.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {renderStandardInputs()}
              
              <div>
                <Label htmlFor="dataQuality">Data Quality Level (1-5)</Label>
                <Select value={inputs.dataQualityLevel.toString()} onValueChange={(value) => setInputs({...inputs, dataQualityLevel: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Verified Actual Data</SelectItem>
                    <SelectItem value="4">4 - Specific Data</SelectItem>
                    <SelectItem value="3">3 - Average Data</SelectItem>
                    <SelectItem value="2">2 - Proxy Data</SelectItem>
                    <SelectItem value="1">1 - Estimated Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={calculateAttribution} 
                disabled={loading}
                className="w-full"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {loading ? 'Calculating...' : 'Calculate Attribution Factor'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Attribution Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {(result.attributionFactor * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Base Attribution Factor</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  +{(result.dataQualityAdjustment * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Data Quality Adjustment</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(result.finalAttributionFactor * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Final Attribution Factor</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Calculation Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Standard:</span>
                    <Badge variant="outline">Standard {result.standard}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Asset Class:</span>
                    <span className="text-sm font-medium">{result.assetClass.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Methodology:</span>
                    <span className="text-sm font-medium">{result.methodology}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Validation Checks</h4>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${result.validationChecks.inputValidation ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${result.validationChecks.inputValidation ? 'bg-green-600' : 'bg-red-600'}`} />
                    <span className="text-sm">Input Validation</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${result.validationChecks.rangeValidation ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${result.validationChecks.rangeValidation ? 'bg-green-600' : 'bg-red-600'}`} />
                    <span className="text-sm">Range Validation</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 ${result.validationChecks.consistencyCheck ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${result.validationChecks.consistencyCheck ? 'bg-green-600' : 'bg-red-600'}`} />
                    <span className="text-sm">Consistency Check</span>
                  </div>
                </div>
              </div>
            </div>
            
            {result.recommendations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-1">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};