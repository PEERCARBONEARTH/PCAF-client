import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle,
  Info
} from 'lucide-react';

export function CSVTemplateDownload() {
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = [
      'loan_id',
      'borrower_name',
      'loan_amount',
      'outstanding_balance',
      'interest_rate',
      'term_months',
      'origination_date',
      'vehicle_make',
      'vehicle_model',
      'vehicle_year',
      'vehicle_type',
      'fuel_type',
      'value_at_origination',
      'efficiency_mpg',
      'annual_mileage',
      'vin'
    ];

    const sampleRows = [
      [
        'VL-000001',
        'John Smith',
        '35000',
        '28000',
        '0.055',
        '60',
        '2023-01-15',
        'Toyota',
        'Camry',
        '2023',
        'Sedan',
        'gasoline',
        '35000',
        '28',
        '15000',
        '1HGBH41JXMN123456'
      ],
      [
        'VL-000002',
        'Sarah Johnson',
        '50000',
        '42000',
        '0.048',
        '60',
        '2023-03-22',
        'Tesla',
        'Model 3',
        '2023',
        'Sedan',
        'electric',
        '50000',
        '120',
        '12000',
        '5YJ3E1EA4KF234567'
      ],
      [
        'VL-000003',
        'Michael Brown',
        '45000',
        '38000',
        '0.062',
        '72',
        '2023-02-10',
        'Ford',
        'F-150',
        '2022',
        'Truck',
        'gasoline',
        '45000',
        '22',
        '18000',
        '1FTFW1ET5DFC345678'
      ]
    ];

    const csvContent = [headers, ...sampleRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'peercarbon_loan_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template with sample data has been downloaded.",
    });
  };

  const fieldDescriptions = [
    { field: 'loan_id', description: 'Unique identifier for the loan', required: true, example: 'VL-000001' },
    { field: 'borrower_name', description: 'Name of the borrower', required: true, example: 'John Smith' },
    { field: 'loan_amount', description: 'Total loan amount in USD', required: true, example: '35000' },
    { field: 'outstanding_balance', description: 'Current outstanding balance', required: true, example: '28000' },
    { field: 'interest_rate', description: 'Annual interest rate (decimal)', required: true, example: '0.055' },
    { field: 'term_months', description: 'Loan term in months', required: true, example: '60' },
    { field: 'origination_date', description: 'Loan origination date (YYYY-MM-DD)', required: true, example: '2023-01-15' },
    { field: 'vehicle_make', description: 'Vehicle manufacturer', required: true, example: 'Toyota, Tesla, Ford' },
    { field: 'vehicle_model', description: 'Vehicle model', required: true, example: 'Camry, Model 3, F-150' },
    { field: 'vehicle_year', description: 'Vehicle model year', required: true, example: '2023' },
    { field: 'vehicle_type', description: 'Type of vehicle', required: true, example: 'Sedan, Truck, SUV' },
    { field: 'fuel_type', description: 'Primary fuel type', required: true, example: 'gasoline, diesel, hybrid, electric' },
    { field: 'value_at_origination', description: 'Vehicle value at loan origination', required: true, example: '35000' },
    { field: 'efficiency_mpg', description: 'Vehicle fuel efficiency (MPG or MPGe)', required: false, example: '28' },
    { field: 'annual_mileage', description: 'Expected annual mileage', required: false, example: '15000' },
    { field: 'vin', description: 'Vehicle Identification Number', required: false, example: '1HGBH41JXMN123456' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          CSV Upload Template
        </CardTitle>
        <CardDescription>
          Download a pre-formatted CSV template for uploading motor vehicle loan data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Download Button */}
        <div className="flex items-center gap-4">
          <Button onClick={downloadTemplate} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download CSV Template
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            Includes sample data and field descriptions
          </div>
        </div>

        <Separator />

        {/* Field Documentation */}
        <div className="space-y-4">
          <h4 className="font-medium">Required and Optional Fields</h4>
          
          <div className="space-y-3">
            {fieldDescriptions.map((field) => (
              <div key={field.field} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {field.field}
                      </code>
                      {field.required ? (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {field.description}
                    </p>
                    <div className="text-xs">
                      <span className="font-medium">Example: </span>
                      <code className="bg-muted px-1 rounded">{field.example}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Upload Guidelines */}
        <div className="space-y-4">
          <h4 className="font-medium">Upload Guidelines</h4>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-200">Best Practices</p>
                <ul className="mt-1 space-y-1 text-green-700 dark:text-green-300">
                  <li>• Use the exact column headers from the template</li>
                  <li>• Ensure all required fields are populated</li>
                  <li>• Use consistent vehicle_type and fuel_type values</li>
                  <li>• Include annual mileage data when available for better accuracy</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-green-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Important Notes</p>
                <ul className="mt-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• Loan IDs must be unique within your portfolio</li>
                  <li>• Outstanding balance should not exceed loan amount</li>
                  <li>• Vehicle value should reflect current market value</li>
                  <li>• Missing emission factors will use regional defaults</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Values */}
        <div className="space-y-4">
          <h4 className="font-medium">Supported Field Values</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Vehicle Types</h5>
              <div className="flex flex-wrap gap-1">
                {['passenger_car', 'motorcycle', 'commercial_vehicle'].map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Fuel Types</h5>
              <div className="flex flex-wrap gap-1">
                {['gasoline', 'diesel', 'hybrid', 'electric'].map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Regions</h5>
              <div className="flex flex-wrap gap-1">
                {['kenya', 'ghana', 'nigeria', 'rwanda'].map(region => (
                  <Badge key={region} variant="outline" className="text-xs">
                    {region}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Verification Status</h5>
              <div className="flex flex-wrap gap-1">
                {['verified', 'partially_verified', 'unverified'].map(status => (
                  <Badge key={status} variant="outline" className="text-xs">
                    {status}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}