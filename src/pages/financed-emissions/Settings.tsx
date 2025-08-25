import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { OrganizationSetup } from "@/components/settings/OrganizationSetup";
import { DataQualityManagement } from "@/components/settings/DataQualityManagement";
import { ReportsExportSettings } from "@/components/settings/ReportsExportSettings";
import { IntegrationsAPISettings } from "@/components/settings/IntegrationsAPISettings";
import { AdvancedConfiguration } from "@/components/settings/AdvancedConfiguration";
import { LMSConfigurationManager } from "@/components/LMSConfigurationManager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function FinancedEmissionsSettings() {
  const [activeSection, setActiveSection] = useState("organization");
  const [activeSubsection, setActiveSubsection] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionLabels: Record<string, string> = {
    "organization": "Organization",
    "data-quality": "Data quality",
    "reports-export": "Reports & export",
    "integrations-api": "Integrations & API",
    "lms-sync": "LMS Sync",
    "advanced": "Advanced",
  };

  // Initialize from URL or localStorage on mount
  useEffect(() => {
    const section = searchParams.get("section") || localStorage.getItem("fe:settings:section") || "organization";
    const subsection = searchParams.get("subsection") || localStorage.getItem("fe:settings:subsection") || undefined;
    setActiveSection(section);
    setActiveSubsection(subsection || undefined);
    // SEO meta tags
    const title = "Financed Emissions Settings | PeerCarbon";
    const desc = "Configure organization, data quality, integrations, and export settings for financed emissions.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${location.origin}/financed-emissions/settings`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to URL and localStorage
  useEffect(() => {
    const params: Record<string, string> = { section: activeSection };
    if (activeSubsection) params.subsection = activeSubsection;
    setSearchParams(params, { replace: true });
    localStorage.setItem("fe:settings:section", activeSection);
    if (activeSubsection) localStorage.setItem("fe:settings:subsection", activeSubsection);
    else localStorage.removeItem("fe:settings:subsection");
  }, [activeSection, activeSubsection, setSearchParams]);

  const handleSectionChange = (section: string, subsection?: string) => {
    setActiveSection(section);
    setActiveSubsection(subsection);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "organization":
        return <OrganizationSetup activeSubsection={activeSubsection} />;
      case "data-quality":
        return <DataQualityManagement activeSubsection={activeSubsection} />;
      case "reports-export":
        return <ReportsExportSettings activeSubsection={activeSubsection} />;
      case "integrations-api":
        return <IntegrationsAPISettings activeSubsection={activeSubsection} />;
      case "lms-sync":
        return <LMSConfigurationManager />;
      case "advanced":
        return <AdvancedConfiguration activeSubsection={activeSubsection} />;
      default:
        return <OrganizationSetup activeSubsection={activeSubsection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:block sticky top-0 self-start max-h-screen overflow-y-auto">
        <SettingsSidebar 
          activeSection={activeSection}
          activeSubsection={activeSubsection}
          onSectionChange={handleSectionChange}
        />
      </aside>
      
      <main className="flex-1 min-w-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4 lg:p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <header className="space-y-2">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/financed-emissions/overview">Financed emissions</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Settings</BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{sectionLabels[activeSection] || "Organization"}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-2xl font-semibold tracking-tight">Financed Emissions Settings</h1>
                <p className="text-muted-foreground">Configure your organization, data quality, integrations, and exports.</p>
              </header>

              <div className="lg:hidden">
                <Select value={activeSection} onValueChange={(val) => handleSectionChange(val)}>
                  <SelectTrigger aria-label="Jump to section">
                    <SelectValue placeholder="Jump to section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="data-quality">Data quality</SelectItem>
                    <SelectItem value="reports-export">Reports & export</SelectItem>
                    <SelectItem value="integrations-api">Integrations & API</SelectItem>
                    <SelectItem value="lms-sync">LMS Sync</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderMainContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}