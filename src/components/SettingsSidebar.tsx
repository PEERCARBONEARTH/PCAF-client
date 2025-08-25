import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Building2, 
  Zap, 
  Database, 
  FileText, 
  Settings2,
  Key,
  Bot,
  Brain,
  Upload,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  Factory,
  Fuel,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  subsections?: SettingsSubsection[];
  isRequired?: boolean;
  isComplete?: boolean;
}

interface SettingsSubsection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete?: boolean;
  isRequired?: boolean;
}

const settingsStructure: SettingsSection[] = [
  {
    id: "organization",
    title: "Organization Setup",
    icon: Building2,
    description: "Configure your institution profile and regional settings",
    isRequired: true,
    isComplete: false,
    subsections: [
      { id: "profile", title: "Profile & Details", icon: Building2, isRequired: true, isComplete: false },
      { id: "fiscal-year", title: "Fiscal Year Settings", icon: Calendar, isRequired: true, isComplete: false },
      { id: "regional", title: "Regional Configuration", icon: MapPin, isRequired: true, isComplete: false }
    ]
  },
  {
    id: "data-quality",
    title: "Data & Quality Management",
    icon: Database,
    description: "Manage data sources, quality rules, and emission factors",
    isRequired: true,
    isComplete: false,
    subsections: [
      { id: "data-sources", title: "Data Sources & Upload", icon: Upload, isRequired: true, isComplete: false },
      { id: "quality-rules", title: "Quality Rules & Thresholds", icon: Shield, isRequired: true, isComplete: false },
      { id: "emission-factors", title: "Emission Factors", icon: Zap, isRequired: true, isComplete: false },
      { id: "sample-data", title: "Sample Data Tools", icon: Database, isRequired: false, isComplete: true }
    ]
  },
  {
    id: "reports-export",
    title: "Reports & Export",
    icon: FileText,
    description: "Configure reporting templates and export preferences",
    isRequired: false,
    isComplete: true,
    subsections: [
      { id: "templates", title: "Template Configuration", icon: FileText, isRequired: false, isComplete: true },
      { id: "auto-generation", title: "Auto-generation Settings", icon: Settings2, isRequired: false, isComplete: true },
      { id: "export-prefs", title: "Export Preferences", icon: FileText, isRequired: false, isComplete: true }
    ]
  },
  {
    id: "integrations-api",
    title: "Integrations & APIs",
    icon: Settings2,
    description: "Configure external providers and API connections",
    isRequired: false,
    isComplete: false,
    subsections: [
      { id: "external-providers", title: "External Providers", icon: Bot, isRequired: false, isComplete: false },
      { id: "api-keys", title: "API Key Management", icon: Key, isRequired: false, isComplete: false },
      { id: "mcp-config", title: "MCP Configuration", icon: Settings2, isRequired: false, isComplete: false }
    ]
  },
  {
    id: "advanced",
    title: "Advanced Configuration",
    icon: Settings2,
    description: "AI agents, client documents, and system settings",
    isRequired: false,
    isComplete: true,
    subsections: [
      { id: "ai-agents", title: "AI Agents", icon: Brain, isRequired: false, isComplete: true },
      { id: "client-docs", title: "Client Documents", icon: Upload, isRequired: false, isComplete: true }
    ]
  }
];

interface SettingsSidebarProps {
  activeSection: string;
  activeSubsection?: string;
  onSectionChange: (section: string, subsection?: string) => void;
}

export function SettingsSidebar({ activeSection, activeSubsection, onSectionChange }: SettingsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([activeSection]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getCompletionProgress = () => {
    const totalRequired = settingsStructure.reduce((acc, section) => {
      if (section.isRequired) acc++;
      if (section.subsections) {
        acc += section.subsections.filter(sub => sub.isRequired).length;
      }
      return acc;
    }, 0);

    const completedRequired = settingsStructure.reduce((acc, section) => {
      if (section.isRequired && section.isComplete) acc++;
      if (section.subsections) {
        acc += section.subsections.filter(sub => sub.isRequired && sub.isComplete).length;
      }
      return acc;
    }, 0);

    return Math.round((completedRequired / totalRequired) * 100);
  };

  const progress = getCompletionProgress();

  return (
    <div className="w-80 lg:w-80 md:w-72 sm:w-64 border-r bg-background/50 backdrop-blur-sm flex flex-col max-h-screen">
      <div className="p-4 lg:p-6 border-b flex-shrink-0">
        <h2 className="text-lg font-semibold mb-2 truncate">Settings Configuration</h2>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          Configure your financed emissions platform
        </p>
        
        {/* Quick Setup Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Setup Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Complete required sections to begin tracking emissions
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 lg:p-4 space-y-2">
          {settingsStructure.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const isActive = activeSection === section.id;
            const hasSubsections = section.subsections && section.subsections.length > 0;

          return (
            <div key={section.id} className="space-y-1">
                <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start h-auto p-2 lg:p-3 space-y-1",
                  isActive && "bg-muted"
                )}
                onClick={() => {
                  if (hasSubsections) {
                    toggleSection(section.id);
                  } else {
                    onSectionChange(section.id);
                  }
                }}
              >
                <div className="flex items-start justify-between w-full min-w-0">
                  <div className="flex items-start gap-2 lg:gap-3 min-w-0 flex-1">
                    <section.icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="text-left min-w-0 flex-1">
                      <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{section.title}</span>
                        {section.isRequired && (
                          <Badge variant="outline" className="h-3 lg:h-4 text-xs flex-shrink-0">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight line-clamp-2 mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {section.isComplete ? (
                      <CheckCircle className="h-3 lg:h-4 w-3 lg:w-4 text-green-600" />
                    ) : section.isRequired ? (
                      <AlertCircle className="h-3 lg:h-4 w-3 lg:w-4 text-amber-600" />
                    ) : null}
                    {hasSubsections && (
                      isExpanded ? (
                        <ChevronDown className="h-3 lg:h-4 w-3 lg:w-4" />
                      ) : (
                        <ChevronRight className="h-3 lg:h-4 w-3 lg:w-4" />
                      )
                    )}
                  </div>
                </div>
              </Button>

              {/* Subsections */}
              {hasSubsections && isExpanded && (
                <div className="ml-3 lg:ml-4 space-y-1">
                  {section.subsections!.map((subsection) => {
                    const isSubActive = activeSection === section.id && activeSubsection === subsection.id;
                    
                    return (
                      <Button
                        key={subsection.id}
                        variant={isSubActive ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start h-auto p-1.5 lg:p-2",
                          isSubActive && "bg-muted"
                        )}
                        onClick={() => onSectionChange(section.id, subsection.id)}
                      >
                        <div className="flex items-center justify-between w-full min-w-0">
                          <div className="flex items-center gap-1.5 lg:gap-2 min-w-0 flex-1">
                            <subsection.icon className="h-3 w-3 flex-shrink-0" />
                            <span className="text-sm truncate">{subsection.title}</span>
                            {subsection.isRequired && (
                              <Badge variant="outline" className="h-3 text-xs flex-shrink-0">
                                *
                              </Badge>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {subsection.isComplete ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : subsection.isRequired ? (
                              <AlertCircle className="h-3 w-3 text-amber-600" />
                            ) : null}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 lg:p-4 border-t flex-shrink-0">
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full text-xs lg:text-sm">
            Quick Setup Wizard
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-xs lg:text-sm">
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}