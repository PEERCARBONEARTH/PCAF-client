import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Settings, MapPin, CheckCircle } from 'lucide-react';

interface EmissionCalculatorGuideProps {
  stepId: string;
}

export function EmissionCalculatorGuide({ stepId }: EmissionCalculatorGuideProps) {
  const renderPCAFCalculatorContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Calculator className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold">PCAF Carbon Calculator</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Learn how the PCAF methodology calculates financed emissions for motor vehicle loans 
          using the attribution approach.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Attribution Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="inline-block bg-background border rounded-lg p-4">
              <p className="text-lg font-mono">
                <span className="text-primary font-semibold">Financed Emissions</span> = 
                <span className="text-blue-600"> Outstanding Amount</span> ÷ 
                <span className="text-green-600"> Vehicle Value</span> × 
                <span className="text-orange-600"> Annual Emissions</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scope 1 Emissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Direct emissions from fuel combustion in the vehicles you finance.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Gasoline vehicles:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">8.89 kg CO₂/gallon</code>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Diesel vehicles:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">10.21 kg CO₂/gallon</code>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Electric vehicles:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">Grid emission factor</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Quality Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[
                { quality: "Score 1-2", method: "Actual fuel consumption data", accuracy: "Highest" },
                { quality: "Score 3", method: "Mileage + fuel efficiency", accuracy: "High" },
                { quality: "Score 4-5", method: "Vehicle type averages", accuracy: "Lower" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="text-xs">{item.quality}</Badge>
                    <p className="text-sm mt-1">{item.method}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.accuracy}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calculation Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted rounded">
                <p className="text-xs text-muted-foreground">Outstanding Amount</p>
                <p className="font-semibold text-blue-600">$25,000</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-xs text-muted-foreground">Vehicle Value</p>
                <p className="font-semibold text-green-600">$35,000</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-xs text-muted-foreground">Annual Emissions</p>
                <p className="font-semibold text-orange-600">4.2 tCO₂e</p>
              </div>
              <div className="p-3 bg-primary/10 rounded">
                <p className="text-xs text-muted-foreground">Financed Emissions</p>
                <p className="font-semibold text-primary">3.0 tCO₂e</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                $25,000 ÷ $35,000 × 4.2 tCO₂e = <span className="font-semibold text-primary">3.0 tCO₂e</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmissionFactorsContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold">Regional Emission Factors</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Configure emission factors based on your portfolio's geographic distribution 
          for accurate regional calculations.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Why Regional Factors Matter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Grid Electricity</p>
                <p className="text-sm text-muted-foreground">
                  Electric vehicle emissions vary by regional grid composition
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Fuel Standards</p>
                <p className="text-sm text-muted-foreground">
                  Different regions have varying fuel carbon content
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Climate Factors</p>
                <p className="text-sm text-muted-foreground">
                  Temperature affects vehicle efficiency and emissions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Default Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              PCAF 2024 standard emission factors by region:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">United States</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">0.395 kg CO₂/kWh</code>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">European Union</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">0.275 kg CO₂/kWh</code>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">United Kingdom</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">0.193 kg CO₂/kWh</code>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Canada</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">0.130 kg CO₂/kWh</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Custom Factors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              You can override default factors with custom values:
            </p>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-sm">When to use custom factors:</p>
                <ul className="text-xs text-muted-foreground space-y-1 mt-1 ml-4">
                  <li>• More recent regional data available</li>
                  <li>• Specific utility provider factors</li>
                  <li>• Regulatory requirements</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-sm">Data quality impact:</p>
                <p className="text-xs text-muted-foreground">
                  Custom factors may improve or reduce quality score depending on source
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded">
              <p className="font-medium text-sm mb-2">Start Simple</p>
              <p className="text-xs text-muted-foreground">
                Use default PCAF factors initially
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded">
              <p className="font-medium text-sm mb-2">Review Regularly</p>
              <p className="text-xs text-muted-foreground">
                Update factors annually with new data
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded">
              <p className="font-medium text-sm mb-2">Document Changes</p>
              <p className="text-xs text-muted-foreground">
                Keep records of custom factor sources
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (stepId) {
    case 'pcaf-calculator':
      return renderPCAFCalculatorContent();
    case 'emission-factors':
      return renderEmissionFactorsContent();
    default:
      return <div>Step content not found</div>;
  }
}