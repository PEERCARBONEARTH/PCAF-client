import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Calendar, MapPin } from "lucide-react";

interface OrganizationSetupProps {
  activeSubsection?: string;
}

export function OrganizationSetup({ activeSubsection }: OrganizationSetupProps) {
  const renderProfileSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organization Profile
        </CardTitle>
        <CardDescription>
          Configure your bank or partner institution details for PCAF reporting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="institution-name">Institution Name *</Label>
            <Input 
              id="institution-name" 
              placeholder="Enter institution name"
              defaultValue=""
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country-region">Country/Region</Label>
            <Select defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Select country/region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="gb">United Kingdom</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="sg">Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporting-unit">Primary PCAF Reporting Unit</Label>
            <Select defaultValue="branch">
              <SelectTrigger>
                <SelectValue placeholder="Select reporting unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="branch">Branch Level</SelectItem>
                <SelectItem value="subsidiary">Subsidiary Level</SelectItem>
                <SelectItem value="holding-group">Holding Group</SelectItem>
                <SelectItem value="consolidated">Consolidated Entity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Primary Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD - US Dollar</SelectItem>
                <SelectItem value="eur">EUR - Euro</SelectItem>
                <SelectItem value="gbp">GBP - British Pound</SelectItem>
                <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
                <SelectItem value="sgd">SGD - Singapore Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution-description">Institution Description (Optional)</Label>
          <Textarea 
            id="institution-description"
            placeholder="Brief description of your institution and its sustainability goals"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <Button>Save Organization Profile</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFiscalYearSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Fiscal Year Configuration
        </CardTitle>
        <CardDescription>
          Set your institution's fiscal year for consistent reporting periods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="fiscal-year-start">Fiscal Year Start</Label>
            <Select defaultValue="jan">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select start month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jan">January</SelectItem>
                <SelectItem value="feb">February</SelectItem>
                <SelectItem value="mar">March</SelectItem>
                <SelectItem value="apr">April</SelectItem>
                <SelectItem value="may">May</SelectItem>
                <SelectItem value="jun">June</SelectItem>
                <SelectItem value="jul">July</SelectItem>
                <SelectItem value="aug">August</SelectItem>
                <SelectItem value="sep">September</SelectItem>
                <SelectItem value="oct">October</SelectItem>
                <SelectItem value="nov">November</SelectItem>
                <SelectItem value="dec">December</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiscal-year-end">Fiscal Year End</Label>
            <Select defaultValue="dec">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select end month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jan">January</SelectItem>
                <SelectItem value="feb">February</SelectItem>
                <SelectItem value="mar">March</SelectItem>
                <SelectItem value="apr">April</SelectItem>
                <SelectItem value="may">May</SelectItem>
                <SelectItem value="jun">June</SelectItem>
                <SelectItem value="jul">July</SelectItem>
                <SelectItem value="aug">August</SelectItem>
                <SelectItem value="sep">September</SelectItem>
                <SelectItem value="oct">October</SelectItem>
                <SelectItem value="nov">November</SelectItem>
                <SelectItem value="dec">December</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Fiscal Year Settings</Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderRegionalSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Regional Configuration
        </CardTitle>
        <CardDescription>
          Configure regional settings for accurate emission calculations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-2">
            <Label htmlFor="primary-region">Primary Operating Region</Label>
            <Select defaultValue="">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select primary region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north-america">North America</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                <SelectItem value="latin-america">Latin America</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Default Timezone</Label>
            <Select defaultValue="utc">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">EST (UTC-5)</SelectItem>
                <SelectItem value="pst">PST (UTC-8)</SelectItem>
                <SelectItem value="cet">CET (UTC+1)</SelectItem>
                <SelectItem value="jst">JST (UTC+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Regional Settings</Button>
        </div>
      </CardContent>
    </Card>
  );

  if (activeSubsection === "fiscal-year") {
    return <div className="space-y-6">{renderFiscalYearSection()}</div>;
  }

  if (activeSubsection === "regional") {
    return <div className="space-y-6">{renderRegionalSection()}</div>;
  }

  // Default to profile or show all if no subsection
  if (activeSubsection === "profile" || !activeSubsection) {
    return (
      <div className="space-y-6">
        {renderProfileSection()}
        {!activeSubsection && (
          <>
            {renderFiscalYearSection()}
            {renderRegionalSection()}
          </>
        )}
      </div>
    );
  }

  return null;
}