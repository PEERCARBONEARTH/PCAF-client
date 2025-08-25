import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Code,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Key,
  Webhook,
  Database,
  CheckCircle,
  Info
} from "lucide-react";

export function APIDocumentation() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      method: "POST",
      path: "/api/loans/calculate",
      description: "Calculate emissions for a single loan without storing",
      example: `{
  "loan_id": "MVL-2024-0098",
  "loan_amount": 18000,
  "vehicle_type": "passenger_car",
  "fuel_type": "gasoline",
  "engine_size": "1.5-2.0L",
  "vehicle_value": 24000,
  "estimated_km_per_year": 12000,
  "loan_term_years": 5
}`,
      response: `{
  "success": true,
  "data": {
    "loan_id": "MVL-2024-0098",
    "annual_emissions_tCO2": 1.8,
    "attribution_factor": 0.75,
    "financed_emissions_tCO2": 1.35,
    "data_quality_score": 3,
    "calculation_timestamp": "2024-07-15T10:30:00Z"
  },
  "message": "Emissions calculated successfully"
}`
    },
    {
      method: "POST",
      path: "/api/loans/intake",
      description: "Add a single loan to portfolio with emissions calculation",
      example: `{
  "loan_id": "MVL-2024-0099",
  "loan_amount": 25000,
  "vehicle_type": "passenger_car",
  "fuel_type": "diesel",
  "engine_size": "2.0L+",
  "vehicle_value": 30000,
  "estimated_km_per_year": 15000,
  "loan_term_years": 6,
  "data_source": "api_integration",
  "country": "Kenya"
}`,
      response: `{
  "success": true,
  "data": {
    "id": 123,
    "loan_id": "MVL-2024-0099",
    "financed_emissions": 2.16,
    "attribution_factor": 0.83,
    "data_quality_score": 3,
    "created_at": "2024-07-15T10:30:00Z"
  },
  "message": "Loan added to portfolio successfully"
}`
    },
    {
      method: "POST",
      path: "/api/loans/bulk-intake",
      description: "Add multiple loans to portfolio in batch",
      example: `{
  "loans": [
    {
      "loan_id": "MVL-2024-0100",
      "loan_amount": 20000,
      "vehicle_type": "passenger_car",
      "fuel_type": "gasoline",
      "engine_size": "1.5-2.0L",
      "vehicle_value": 25000,
      "estimated_km_per_year": 10000,
      "loan_term_years": 5
    },
    {
      "loan_id": "MVL-2024-0101",
      "loan_amount": 35000,
      "vehicle_type": "suv",
      "fuel_type": "diesel",
      "engine_size": "2.5L+",
      "vehicle_value": 45000,
      "estimated_km_per_year": 18000,
      "loan_term_years": 7
    }
  ],
  "institution_id": "KCB_001",
  "batch_reference": "BATCH_2024_07_15"
}`,
      response: `{
  "success": true,
  "data": {
    "processed": 2,
    "failed": 0,
    "errors": []
  },
  "message": "Processed 2 loans, 0 failed"
}`
    },
    {
      method: "GET",
      path: "/api/loans/portfolio",
      description: "Get portfolio summary with aggregated metrics",
      example: "No request body required",
      response: `{
  "success": true,
  "data": {
    "total_loans": 156,
    "total_loan_value": 4500000,
    "total_outstanding_balance": 3200000,
    "total_financed_emissions": 425.67,
    "weighted_avg_data_quality": 3.2,
    "avg_attribution_factor": 0.71,
    "last_updated": "2024-07-15T10:30:00Z"
  }
}`
    }
  ];

  const webhookExample = `{
  "event_type": "loan_approved",
  "timestamp": "2024-07-15T10:30:00Z",
  "loan_reference": "KCB-MVL-2024-5678",
  "approved_amount": 22000,
  "tenure_years": 5,
  "collateral": {
    "vehicle_type": "passenger_car",
    "fuel_type": "gasoline",
    "engine_size": "1.8L",
    "market_value": 28000,
    "estimated_annual_mileage": 12000
  },
  "source_bank": "KCB",
  "country": "Kenya",
  "branch_code": "001",
  "loan_officer": "J.MWANGI"
}`;

  const pythonSDK = `import requests
import json

class PeerCarbonAPI:
    def __init__(self, api_key, base_url="https://api.peercarbon.com/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def calculate_loan_emissions(self, loan_data):
        """Calculate emissions for a loan without storing it"""
        response = requests.post(
            f"{self.base_url}/loans/calculate",
            headers=self.headers,
            json=loan_data
        )
        return response.json()
    
    def add_loan_to_portfolio(self, loan_data):
        """Add a loan to the portfolio with emissions calculation"""
        response = requests.post(
            f"{self.base_url}/loans/intake",
            headers=self.headers,
            json=loan_data
        )
        return response.json()
    
    def bulk_upload_loans(self, loans_list):
        """Upload multiple loans in batch"""
        response = requests.post(
            f"{self.base_url}/loans/bulk-intake",
            headers=self.headers,
            json={"loans": loans_list}
        )
        return response.json()
    
    def get_portfolio_summary(self):
        """Get portfolio summary and metrics"""
        response = requests.get(
            f"{self.base_url}/loans/portfolio",
            headers=self.headers
        )
        return response.json()

# Usage Example
api = PeerCarbonAPI("your_api_key_here")

# Calculate emissions for a single loan
loan_data = {
    "loan_id": "MVL-2024-0150",
    "loan_amount": 20000,
    "vehicle_type": "passenger_car",
    "fuel_type": "gasoline",
    "engine_size": "1.5-2.0L",
    "vehicle_value": 25000,
    "estimated_km_per_year": 12000,
    "loan_term_years": 5
}

result = api.calculate_loan_emissions(loan_data)
print(f"Financed Emissions: {result['data']['financed_emissions_tCO2']} tCO2e")`;

  const nodeSDK = `const axios = require('axios');

class PeerCarbonAPI {
  constructor(apiKey, baseUrl = 'https://api.peercarbon.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    };
  }

  async calculateLoanEmissions(loanData) {
    try {
      const response = await axios.post(
        \`\${this.baseUrl}/loans/calculate\`,
        loanData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      throw new Error(\`API Error: \${error.response?.data?.error || error.message}\`);
    }
  }

  async addLoanToPortfolio(loanData) {
    try {
      const response = await axios.post(
        \`\${this.baseUrl}/loans/intake\`,
        loanData,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      throw new Error(\`API Error: \${error.response?.data?.error || error.message}\`);
    }
  }

  async bulkUploadLoans(loansList) {
    try {
      const response = await axios.post(
        \`\${this.baseUrl}/loans/bulk-intake\`,
        { loans: loansList },
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      throw new Error(\`API Error: \${error.response?.data?.error || error.message}\`);
    }
  }

  async getPortfolioSummary() {
    try {
      const response = await axios.get(
        \`\${this.baseUrl}/loans/portfolio\`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      throw new Error(\`API Error: \${error.response?.data?.error || error.message}\`);
    }
  }
}

// Usage Example
const api = new PeerCarbonAPI('your_api_key_here');

(async () => {
  try {
    const loanData = {
      loan_id: 'MVL-2024-0150',
      loan_amount: 20000,
      vehicle_type: 'passenger_car',
      fuel_type: 'gasoline',
      engine_size: '1.5-2.0L',
      vehicle_value: 25000,
      estimated_km_per_year: 12000,
      loan_term_years: 5
    };

    const result = await api.calculateLoanEmissions(loanData);
    console.log(\`Financed Emissions: \${result.data.financed_emissions_tCO2} tCO2e\`);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            API Documentation
          </CardTitle>
          <CardDescription>
            Complete API reference for integrating PeerCarbon Financed Emissions Engine with your loan management system
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="python">Python SDK</TabsTrigger>
          <TabsTrigger value="nodejs">Node.js SDK</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
        </TabsList>

        {/* API Endpoints */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                REST API Endpoints
              </CardTitle>
              <CardDescription>
                Base URL: <code className="bg-muted px-2 py-1 rounded">https://api.peercarbon.com/v1</code>
              </CardDescription>
            </CardHeader>
          </Card>

          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm">{endpoint.path}</code>
                </CardTitle>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Request Body</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.example, `${endpoint.method} ${endpoint.path} Request`)}
                      >
                        {copiedCode === `${endpoint.method} ${endpoint.path} Request` ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <ScrollArea className="h-64 w-full rounded-md border">
                      <pre className="p-4 text-sm">
                        <code>{endpoint.example}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Response</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.response, `${endpoint.method} ${endpoint.path} Response`)}
                      >
                        {copiedCode === `${endpoint.method} ${endpoint.path} Response` ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <ScrollArea className="h-64 w-full rounded-md border">
                      <pre className="p-4 text-sm">
                        <code>{endpoint.response}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-4 w-4 text-primary" />
                Webhook Integration
              </CardTitle>
              <CardDescription>
                Receive real-time loan approval notifications from your LMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Configure your LMS to send POST requests to: <code>https://api.peercarbon.com/v1/webhooks/loan-approval</code>
                </AlertDescription>
              </Alert>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Webhook Payload Example</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(webhookExample, 'Webhook Payload')}
                  >
                    {copiedCode === 'Webhook Payload' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <ScrollArea className="h-80 w-full rounded-md border">
                  <pre className="p-4 text-sm">
                    <code>{webhookExample}</code>
                  </pre>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Python SDK */}
        <TabsContent value="python" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Python SDK
              </CardTitle>
              <CardDescription>
                Official Python SDK for PeerCarbon API integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Install the SDK: <code>pip install peercarbon-api</code>
                  </AlertDescription>
                </Alert>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Python Implementation</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(pythonSDK, 'Python SDK')}
                    >
                      {copiedCode === 'Python SDK' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <ScrollArea className="h-96 w-full rounded-md border">
                    <pre className="p-4 text-sm">
                      <code>{pythonSDK}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Node.js SDK */}
        <TabsContent value="nodejs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Node.js SDK
              </CardTitle>
              <CardDescription>
                Official Node.js SDK for PeerCarbon API integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Install the SDK: <code>npm install @peercarbon/api-client</code>
                  </AlertDescription>
                </Alert>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Node.js Implementation</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(nodeSDK, 'Node.js SDK')}
                    >
                      {copiedCode === 'Node.js SDK' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <ScrollArea className="h-96 w-full rounded-md border">
                    <pre className="p-4 text-sm">
                      <code>{nodeSDK}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication */}
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Authentication
              </CardTitle>
              <CardDescription>
                API key authentication and security requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Bearer Token Authentication:</strong> Include your API key in the Authorization header: 
                  <code className="block mt-2 p-2 bg-muted rounded">Authorization: Bearer your_api_key_here</code>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">API Key Management</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• API keys are institution-specific</li>
                    <li>• Keys can be rotated for security</li>
                    <li>• Rate limited to 1000 requests/hour</li>
                    <li>• All requests are logged for audit</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Security Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• HTTPS required for all requests</li>
                    <li>• Webhook signature verification</li>
                    <li>• IP allowlisting available</li>
                    <li>• Request/response encryption</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Error Codes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <code>401 Unauthorized</code>
                    <span className="text-sm text-muted-foreground">Invalid or missing API key</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <code>403 Forbidden</code>
                    <span className="text-sm text-muted-foreground">API key lacks required permissions</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <code>429 Too Many Requests</code>
                    <span className="text-sm text-muted-foreground">Rate limit exceeded</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <code>422 Unprocessable Entity</code>
                    <span className="text-sm text-muted-foreground">Invalid loan data or calculation error</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact and Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Support & Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="mailto:api-support@peercarbon.com">
                <ExternalLink className="h-4 w-4" />
                API Support
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="https://docs.peercarbon.com" target="_blank" rel="noopener">
                <FileText className="h-4 w-4" />
                Full Documentation
              </a>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href="https://github.com/peercarbon/examples" target="_blank" rel="noopener">
                <Code className="h-4 w-4" />
                Code Examples
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}