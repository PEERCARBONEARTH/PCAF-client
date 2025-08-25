import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Key, Settings2 } from "lucide-react";
import { LMSConfigurationManager } from "@/components/LMSConfigurationManager";
import { APIKeyManagement } from "@/components/APIKeyManagement";

interface IntegrationsAPISettingsProps {
  activeSubsection?: string;
}

export function IntegrationsAPISettings({ activeSubsection }: IntegrationsAPISettingsProps) {
  const renderExternalProvidersSection = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            External Emission Factor Providers
          </CardTitle>
          <CardDescription>
            Configure connections to external emission factor databases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">PCAF Database</p>
                <p className="text-sm text-muted-foreground">Partnership for Carbon Accounting Financials</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Climatiq API</p>
                <p className="text-sm text-muted-foreground">Comprehensive emission factor database</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Disconnected</span>
                <Switch />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">EPA eGRID</p>
                <p className="text-sm text-muted-foreground">US Electricity grid emission factors</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-sync Emission Factors</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update emission factors from connected providers
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Save Provider Settings</Button>
          </div>
        </CardContent>
      </Card>

      <LMSConfigurationManager />
    </>
  );

  const renderAPIKeysSection = () => (
    <APIKeyManagement />
  );

  const renderMCPConfigSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          MCP Configuration
        </CardTitle>
        <CardDescription>
          Configure Model Context Protocol settings for AI agents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="mcp-endpoint">MCP Endpoint URL</Label>
            <Input 
              id="mcp-endpoint" 
              placeholder="https://api.example.com/mcp"
              defaultValue=""
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mcp-version">MCP Protocol Version</Label>
            <Select defaultValue="v1">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">Version 1.0</SelectItem>
                <SelectItem value="v1.1">Version 1.1</SelectItem>
                <SelectItem value="beta">Beta Version</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mcp-api-key">MCP API Key</Label>
          <Input 
            id="mcp-api-key"
            type="password"
            placeholder="Enter MCP API key"
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable MCP Agent Communication</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI agents to communicate via MCP protocol
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-update Agent Capabilities</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync agent capabilities from MCP server
              </p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Test Connection</Button>
          <Button>Save MCP Settings</Button>
        </div>
      </CardContent>
    </Card>
  );

  if (activeSubsection === "api-keys") {
    return <div className="space-y-6">{renderAPIKeysSection()}</div>;
  }

  if (activeSubsection === "mcp-config") {
    return <div className="space-y-6">{renderMCPConfigSection()}</div>;
  }

  // Default to external providers or show all if no subsection
  if (activeSubsection === "external-providers" || !activeSubsection) {
    return (
      <div className="space-y-6">
        {renderExternalProvidersSection()}
        {!activeSubsection && (
          <>
            {renderAPIKeysSection()}
            {renderMCPConfigSection()}
          </>
        )}
      </div>
    );
  }

  return null;
}