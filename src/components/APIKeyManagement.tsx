import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Check,
  AlertCircle,
  Globe,
  Server
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: Date;
  lastUsed?: Date;
  status: 'active' | 'inactive';
}

export function APIKeyManagement() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production LMS Integration',
      key: 'pk_live_1234567890abcdef',
      permissions: ['loans:read', 'loans:write', 'emissions:read'],
      created: new Date('2024-01-15'),
      lastUsed: new Date('2024-01-20'),
      status: 'active'
    }
  ]);
  
  const [newKeyName, setNewKeyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookActive, setWebhookActive] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingWebhook, setTestingWebhook] = useState(false);

  const generateAPIKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive"
      });
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `pk_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      permissions: ['loans:read', 'loans:write', 'emissions:read'],
      created: new Date(),
      status: 'active'
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    
    toast({
      title: "API Key Generated",
      description: `New API key "${newKey.name}" has been created`,
    });
  };

  const revokeKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast({
      title: "API Key Revoked",
      description: "The API key has been permanently deleted",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL to test",
        variant: "destructive"
      });
      return;
    }

    setTestingWebhook(true);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          event: 'webhook_test'
        })
      });

      toast({
        title: "Webhook Test Sent",
        description: "Test payload sent to webhook URL. Check your endpoint logs.",
      });
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: "Failed to send test webhook. Please check the URL.",
        variant: "destructive"
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const maskKey = (key: string) => {
    const prefix = key.substring(0, 7);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'*'.repeat(key.length - 11)}${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Generate and manage API keys for loan management system integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generate New Key */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium">Generate New API Key</h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="keyName">API Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production LMS Integration"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={generateAPIKey} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Key
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Keys */}
          <div className="space-y-4">
            <h4 className="font-medium">Active API Keys</h4>
            {apiKeys.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No API keys generated yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{key.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          Created {key.created.toLocaleDateString()}
                          {key.lastUsed && ` • Last used ${key.lastUsed.toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                          {key.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeKey(key.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-sm bg-muted p-2 rounded">
                        {showKeys[key.id] ? key.key : maskKey(key.key)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {showKeys[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure webhook endpoints for real-time loan data sync
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Webhooks</Label>
              <p className="text-sm text-muted-foreground">
                Receive real-time notifications for loan updates
              </p>
            </div>
            <Switch checked={webhookActive} onCheckedChange={setWebhookActive} />
          </div>

          {webhookActive && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-system.com/webhooks/peercarbon"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={testWebhook}
                  disabled={testingWebhook || !webhookUrl}
                  className="flex items-center gap-2"
                >
                  {testingWebhook ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Server className="h-4 w-4" />
                  )}
                  Test Webhook
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Webhook Events:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>loan.created - New loan added to portfolio</li>
                  <li>loan.updated - Loan data modified</li>
                  <li>loan.deleted - Loan removed from portfolio</li>
                  <li>emissions.calculated - Emissions recalculated</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Integration Health
          </CardTitle>
          <CardDescription>
            Monitor the status of your API integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">API Status</span>
              </div>
              <p className="text-sm text-muted-foreground">All endpoints operational</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">Last Sync</span>
              </div>
              <p className="text-sm text-muted-foreground">2 minutes ago</p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="font-medium">Daily Requests</span>
              </div>
              <p className="text-sm text-muted-foreground">1,247 / 10,000</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
