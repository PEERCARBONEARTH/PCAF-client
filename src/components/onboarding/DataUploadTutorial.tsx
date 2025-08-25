import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Upload, FileText, AlertCircle, Download } from 'lucide-react';

interface DataUploadTutorialProps {
  stepId: string;
}

export function DataUploadTutorial({ stepId }: DataUploadTutorialProps) {
  const renderDataRequirementsContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold">Data Requirements for Motor Vehicle Loans</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          To calculate PCAF-compliant emissions, we need specific data points for each loan in your portfolio.
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Required Fields
              <Badge variant="destructive" className="ml-auto">Mandatory</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { field: "Loan ID", description: "Unique identifier for each loan", example: "MVL-2024-001" },
              { field: "Outstanding Amount", description: "Current loan balance", example: "$25,000" },
              { field: "Vehicle Type", description: "Car, SUV, truck, etc.", example: "Passenger Car" },
              { field: "Fuel Type", description: "Gasoline, diesel, electric, hybrid", example: "Gasoline" },
              { field: "Model Year", description: "Year the vehicle was manufactured", example: "2022" }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.field}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">{item.example}</code>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Optional Fields (Higher Data Quality)
              <Badge variant="secondary" className="ml-auto">Recommended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { field: "Annual Mileage", description: "Actual or estimated miles driven per year", quality: "Score 2-3" },
              { field: "Vehicle Value", description: "Current market value of the vehicle", quality: "Score 2" },
              { field: "Engine Size", description: "Engine displacement in liters", quality: "Score 2" },
              { field: "Location", description: "State/country for regional factors", quality: "Score 2-3" }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.field}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">{item.quality}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">Data Quality Impact</p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                More complete data leads to better PCAF quality scores (1-3) and more accurate emission calculations.
                Missing optional fields will result in lower quality scores (4-5) using industry averages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUploadTutorialContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold">Upload Process Walkthrough</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Follow these steps to upload your motor vehicle loan data for PCAF emissions calculation.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            step: 1,
            title: "Download Template",
            description: "Get the CSV template with required column headers",
            action: "Navigate to Upload → CSV Template tab",
            icon: Download,
            color: "bg-blue-500"
          },
          {
            step: 2,
            title: "Prepare Your Data",
            description: "Format your loan data according to the template",
            action: "Fill in required fields, add optional data for better quality",
            icon: FileText,
            color: "bg-green-500"
          },
          {
            step: 3,
            title: "Upload CSV File",
            description: "Upload your formatted CSV file to the platform",
            action: "Navigate to Upload → CSV Upload tab",
            icon: Upload,
            color: "bg-purple-500"
          },
          {
            step: 4,
            title: "Review & Validate",
            description: "Check data quality and resolve any validation errors",
            action: "Review the validation results and data quality scores",
            icon: CheckCircle,
            color: "bg-emerald-500"
          }
        ].map((item) => (
          <Card key={item.step}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4" />
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {item.action}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium">Ready to try it yourself?</p>
              <p className="text-sm text-muted-foreground">
                You can navigate to the Upload section at any time to start uploading your data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSampleDataContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-semibold">Explore Sample Data</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Use our sample motor vehicle loan portfolio to understand how the platform works 
          before uploading your own data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sample Portfolio Includes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">500 diverse motor vehicle loans</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Various vehicle types and fuel types</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Range of data quality scores (1-5)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Pre-calculated emissions data</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What You Can Learn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm">How emissions are calculated</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Impact of data quality on results</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Report generation process</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Dashboard features and insights</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Load Sample Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Loading sample data will allow you to explore all platform features with realistic data. 
            You can clear it at any time and upload your own data.
          </p>
          <Button className="w-full">
            Load Sample Motor Vehicle Portfolio
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  switch (stepId) {
    case 'data-requirements':
      return renderDataRequirementsContent();
    case 'upload-tutorial':
      return renderUploadTutorialContent();
    case 'sample-data':
      return renderSampleDataContent();
    default:
      return <div>Step content not found</div>;
  }
}