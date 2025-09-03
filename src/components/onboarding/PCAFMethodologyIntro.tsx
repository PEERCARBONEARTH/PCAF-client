import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, BarChart3, Calculator } from 'lucide-react';

interface PCAFMethodologyIntroProps {
  stepId: string;
}

export function PCAFMethodologyIntro({ stepId }: PCAFMethodologyIntroProps) {
  const renderWelcomeContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold">Welcome to PCAF Financed Emissions</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The Partnership for Carbon Accounting Financials (PCAF) provides the global standard 
          for measuring and disclosing greenhouse gas emissions from financial activities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Why PCAF Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Regulatory Compliance</p>
                <p className="text-sm text-muted-foreground">Meet disclosure requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Risk Management</p>
                <p className="text-sm text-muted-foreground">Identify climate-related risks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Strategic Planning</p>
                <p className="text-sm text-muted-foreground">Set science-based targets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              PeerCarbon Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Automated Calculations</p>
                <p className="text-sm text-muted-foreground">PCAF-compliant methodologies</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Data Quality Tracking</p>
                <p className="text-sm text-muted-foreground">Monitor and improve accuracy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Standardized Reporting</p>
                <p className="text-sm text-muted-foreground">Generate compliant reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAssetClassContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold">Motor Vehicle Loans Focus</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We're starting with motor vehicle loans as they represent a significant portion 
          of many portfolios and have well-established emission calculation methodologies.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Asset Class: Motor Vehicles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="font-medium">Scope 1 Emissions</p>
              <p className="text-sm text-muted-foreground">
                Direct emissions from fuel combustion in financed vehicles
              </p>
            </div>
            <div>
              <p className="font-medium">Attribution Method</p>
              <p className="text-sm text-muted-foreground">
                Outstanding loan amount ÷ Vehicle value × Annual emissions
              </p>
            </div>
            <div>
              <p className="font-medium">Data Requirements</p>
              <p className="text-sm text-muted-foreground">
                Loan amount, vehicle type, model year, fuel type, and mileage data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🚗</span>
            </div>
            <p className="font-medium">Passenger Cars</p>
            <p className="text-sm text-muted-foreground">Personal vehicles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🚐</span>
            </div>
            <p className="font-medium">Light Commercial</p>
            <p className="text-sm text-muted-foreground">Vans and light trucks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🚛</span>
            </div>
            <p className="font-medium">Heavy Duty</p>
            <p className="text-sm text-muted-foreground">Trucks and buses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDataQualityContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold">PCAF Data Quality Scoring</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          PCAF uses a 1-5 scale to rate the quality of data used in emission calculations. 
          Higher quality data leads to more accurate emission estimates.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            score: 1,
            quality: "Highest",
            description: "Actual emissions or fuel consumption data",
            color: "bg-green-500",
            example: "Direct fuel consumption records"
          },
          {
            score: 2,
            quality: "High",
            description: "Activity data with verified emission factors",
            color: "bg-lime-500",
            example: "Verified mileage with standard factors"
          },
          {
            score: 3,
            quality: "Medium",
            description: "Estimated activity data with average factors",
            color: "bg-yellow-500",
            example: "Average mileage by vehicle type"
          },
          {
            score: 4,
            quality: "Low",
            description: "Limited activity data or emission factors",
            color: "bg-orange-500",
            example: "Basic vehicle information only"
          },
          {
            score: 5,
            quality: "Lowest",
            description: "Asset class averages or proxies",
            color: "bg-red-500",
            example: "Industry average emissions"
          }
        ].map((item) => (
          <Card key={item.score}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-white font-bold`}>
                  {item.score}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{item.quality} Quality</p>
                    <Badge variant="outline" className="text-xs">
                      Score {item.score}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Example: {item.example}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-medium">Goal:</span> Strive for data quality scores of 1-3 
            for the most accurate emission calculations and regulatory compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  switch (stepId) {
    case 'welcome':
      return renderWelcomeContent();
    case 'asset-classes':
      return renderAssetClassContent();
    case 'data-quality':
      return renderDataQualityContent();
    default:
      return <div>Step content not found</div>;
  }
}