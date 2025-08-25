import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Settings2, Download } from "lucide-react";

interface ReportsExportSettingsProps {
  activeSubsection?: string;
}

export function ReportsExportSettings({ activeSubsection }: ReportsExportSettingsProps) {
  const renderTemplatesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Template Configuration
        </CardTitle>
        <CardDescription>
          Configure default report templates and formatting options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="default-template">Default Report Template</Label>
            <Select defaultValue="pcaf-standard">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcaf-standard">PCAF Standard Report</SelectItem>
                <SelectItem value="ghg-protocol">GHG Protocol Format</SelectItem>
                <SelectItem value="tcfd-aligned">TCFD Aligned Report</SelectItem>
                <SelectItem value="custom">Custom Template</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="report-frequency">Default Report Frequency</Label>
            <Select defaultValue="quarterly">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label>Include Methodology Section</Label>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Add detailed methodology explanation to reports
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label>Include Data Quality Scores</Label>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Show PCAF data quality scores in reports
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label>Include Attribution Factors</Label>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Add attribution factor details to calculations
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch />
              </div>
            </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Template Settings</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAutoGenerationSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Auto-generation Settings
        </CardTitle>
        <CardDescription>
          Configure automatic report generation and distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Auto-generation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically generate reports at scheduled intervals
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-distribute to Stakeholders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send reports to configured recipients
              </p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="generation-day">Generation Day</Label>
            <Select defaultValue="15">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st of Month</SelectItem>
                <SelectItem value="15">15th of Month</SelectItem>
                <SelectItem value="last">Last Day of Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notification-lead">Notification Lead Time (Days)</Label>
            <Input 
              id="notification-lead"
              placeholder="3"
              defaultValue="3"
              type="number"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Auto-generation Settings</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderExportPrefsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Preferences
        </CardTitle>
        <CardDescription>
          Configure default export formats and calculation preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency-display">Currency Display</Label>
            <Select defaultValue="usd">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="local">Local Currency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="distance-unit">Distance Unit</Label>
            <Select defaultValue="km">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="km">Kilometers</SelectItem>
                <SelectItem value="miles">Miles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emission-unit">Emission Unit</Label>
            <Select defaultValue="tco2e">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tco2e">tCO₂e</SelectItem>
                <SelectItem value="kgco2e">kgCO₂e</SelectItem>
                <SelectItem value="mtco2e">MtCO₂e</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="default-export-format">Default Export Format</Label>
            <Select defaultValue="xlsx">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="decimal-places">Decimal Places</Label>
            <Select defaultValue="2">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select precision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (Whole numbers)</SelectItem>
                <SelectItem value="1">1 decimal place</SelectItem>
                <SelectItem value="2">2 decimal places</SelectItem>
                <SelectItem value="3">3 decimal places</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Raw Data Sheets</Label>
              <p className="text-sm text-muted-foreground">
                Add raw data worksheets to Excel exports
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compress Large Exports</Label>
              <p className="text-sm text-muted-foreground">
                Automatically zip large export files
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Export Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );

  if (activeSubsection === "auto-generation") {
    return <div className="space-y-6">{renderAutoGenerationSection()}</div>;
  }

  if (activeSubsection === "export-prefs") {
    return <div className="space-y-6">{renderExportPrefsSection()}</div>;
  }

  // Default to templates or show all if no subsection
  if (activeSubsection === "templates" || !activeSubsection) {
    return (
      <div className="space-y-6">
        {renderTemplatesSection()}
        {!activeSubsection && (
          <>
            {renderAutoGenerationSection()}
            {renderExportPrefsSection()}
          </>
        )}
      </div>
    );
  }

  return null;
}