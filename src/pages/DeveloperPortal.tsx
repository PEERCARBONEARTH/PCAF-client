
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Book, 
  Key, 
  Activity, 
  Users, 
  Zap,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

const apiEndpoints = [
  {
    method: "GET",
    endpoint: "/api/v1/projects",
    description: "Fetch all projects with impact metrics",
    authentication: "API Key required"
  },
  {
    method: "POST",
    endpoint: "/api/v1/integrations/webhook",
    description: "Receive webhook notifications for integration events",
    authentication: "API Key + Signature verification"
  },
  {
    method: "GET",
    endpoint: "/api/v1/sdg-metrics/{projectId}",
    description: "Get SDG alignment data for a specific project",
    authentication: "API Key required"
  },
  {
    method: "POST",
    endpoint: "/api/v1/impact-verification",
    description: "Submit impact verification data",
    authentication: "API Key + OAuth 2.0"
  }
];

const sdkExamples = [
  {
    language: "JavaScript",
    code: `// Install: npm install @peercarbon/sdk
import { PeercarbonSDK } from '@peercarbon/sdk';

const client = new PeercarbonSDK({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Fetch project impact metrics
const metrics = await client.projects.getImpactMetrics('project-123');
console.log(metrics.sdgAlignment);`
  },
  {
    language: "Python",
    code: `# Install: pip install peercarbon-sdk
from peercarbon import PeercarbonClient

client = PeercarbonClient(
    api_key='your-api-key',
    environment='production'
)

# Submit impact verification
response = client.impact.verify_data({
    'project_id': 'project-123',
    'metric_type': 'co2_reduction',
    'value': 1500.5,
    'verification_source': 'satellite_data'
})
print(response.status)`
  },
  {
    language: "cURL",
    code: `# Fetch SDG metrics
curl -X GET "https://api.peercarbon.com/v1/sdg-metrics/project-123" \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json"

# Response
{
  "project_id": "project-123",
  "primary_sdgs": [7, 13, 15],
  "impact_scores": {
    "sdg_7": 8.5,
    "sdg_13": 9.2,
    "sdg_15": 7.8
  }
}`
  }
];

export default function DeveloperPortal() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Developer Portal</h1>
            <p className="text-muted-foreground">
              Build integrations and extend the Peercarbon platform with our APIs and SDKs
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api-reference">API Reference</TabsTrigger>
            <TabsTrigger value="sdks">SDKs & Code Examples</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" />
                    <CardTitle>Quick Start Guide</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Get started with our APIs in minutes. Follow our comprehensive guide to build your first integration.
                  </CardDescription>
                  <Button size="sm">
                    View Guide
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <CardTitle>API Keys</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Manage your API keys, set rate limits, and monitor usage across your integrations.
                  </CardDescription>
                  <Button size="sm">Manage Keys</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <CardTitle>API Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">All systems operational</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Status Page
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Popular Integration Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Impact Verification", count: 12, icon: <CheckCircle className="h-4 w-4" /> },
                  { name: "Payment Processing", count: 8, icon: <Zap className="h-4 w-4" /> },
                  { name: "Data Analytics", count: 15, icon: <Activity className="h-4 w-4" /> },
                  { name: "Communication", count: 6, icon: <Users className="h-4 w-4" /> }
                ].map((category) => (
                  <Card key={category.name} className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center mb-2 text-primary">
                        {category.icon}
                      </div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.count} integrations</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-reference">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Base URL</CardTitle>
                  <CardDescription>All API requests should be made to:</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">
                    https://api.peercarbon.com/v1
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endpoints</h3>
                {apiEndpoints.map((endpoint, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono">{endpoint.endpoint}</code>
                        </div>
                        <Button size="sm" variant="outline">Try it</Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{endpoint.description}</p>
                      <p className="text-xs text-muted-foreground">{endpoint.authentication}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sdks">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Official SDKs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["JavaScript", "Python", "Go"].map((lang) => (
                    <Card key={lang}>
                      <CardContent className="pt-6 text-center">
                        <Code className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">{lang} SDK</p>
                        <Button size="sm" className="mt-2">Download</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Code Examples</h3>
                {sdkExamples.map((example, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{example.language}</CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(example.code, `${example.language}-${index}`)}
                        >
                          {copiedCode === `${example.language}-${index}` ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                        <code>{example.code}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhooks">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Configuration</CardTitle>
                  <CardDescription>
                    Set up webhooks to receive real-time notifications about platform events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Available Events:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• project.created</li>
                        <li>• project.updated</li>
                        <li>• impact.verified</li>
                        <li>• disbursement.completed</li>
                        <li>• integration.installed</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Security:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• HMAC-SHA256 signatures</li>
                        <li>• Retry mechanism (3 attempts)</li>
                        <li>• Timeout: 30 seconds</li>
                        <li>• Rate limiting: 100/min</li>
                      </ul>
                    </div>
                  </div>
                  <Button>Configure Webhooks</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}