import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  MapPin,
  TrendingUp,
  Wallet,
  Shield,
  FileText,
  AlertTriangle,
  Users,
  MessageSquare,
  Settings,
  Store,
  Star,
  ChevronDown,
  ChevronRight,
  Menu,
  Minimize2,
  Calculator,
  Leaf,
  Target,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PeercarbonLogo } from "./PeercarbonLogo";
import { useNavigationStore } from "@/hooks/useNavigationStore";
import { usePlatform } from "@/contexts/PlatformContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload } from "lucide-react";

const greenFinanceItems = [
  {
    id: "dashboard",
    name: "Impact Portfolio",
    href: "/green-finance",
    icon: BarChart3,
    description: "Portfolio analytics & insights",
    category: "analytics"
  },
  {
    id: "projects",
    name: "Assets",
    href: "/green-finance/projects",
    icon: MapPin,
    description: "Investment locations & assets",
    category: "operations"
  },
  {
    id: "varl",
    name: "VARL Dashboard",
    href: "/green-finance/varl",
    icon: Target,
    description: "Asset readiness & deployment tracking",
    category: "operations",
    isNew: true
  },
  {
    id: "tranches-builder",
    name: "Disbursement Builder",
    href: "/green-finance/tranches/builder",
    icon: TrendingUp,
    description: "Results-based payments",
    category: "finance"
  },
  {
    id: "tranches",
    name: "Payment Monitoring",
    href: "/green-finance/tranches",
    icon: Wallet,
    description: "Track & release funds",
    category: "finance"
  },
  {
    id: "compliance",
    name: "ESG Compliance",
    href: "/green-finance/compliance",
    icon: Shield,
    description: "Standards & verification",
    category: "governance"
  },
  {
    id: "reports",
    name: "Impact Reporting",
    href: "/green-finance/reports",
    icon: FileText,
    description: "Impact & financial reports",
    category: "analytics"
  },
  {
    id: "alerts",
    name: "Risk Management",
    href: "/green-finance/alerts-risk",
    icon: AlertTriangle,
    description: "Performance monitoring",
    category: "governance"
  },
  {
    id: "users",
    name: "Access Control",
    href: "/green-finance/users",
    icon: Users,
    description: "User permissions & roles",
    category: "governance"
  },
  {
    id: "tasks",
    name: "Communication Hub",
    href: "/green-finance/tasks",
    icon: MessageSquare,
    description: "Task & workflow center",
    category: "operations"
  },
  {
    id: "workflows",
    name: "Process Automation",
    href: "/green-finance/workflows",
    icon: TrendingUp,
    description: "Automated workflows",
    category: "operations"
  },
  {
    id: "marketplace",
    name: "Integration Hub",
    href: "/green-finance/marketplace",
    icon: Store,
    description: "Third-party integrations",
    category: "integrations"
  }
];

const financedEmissionsItems = [
  {
    id: "upload",
    name: "Link Data", 
    href: "/financed-emissions/upload",
    icon: Upload,
    description: "CSV upload & API sync",
    category: "workflow"
  },
  {
    id: "summary",
    name: "Portfolio Overview",
    href: "/financed-emissions/summary", 
    icon: Calculator,
    description: "Emissions Summary",
    category: "workflow"
  },
  {
    id: "ledger",
    name: "Loan Ledger",
    href: "/financed-emissions/ledger",
    icon: Wallet,
    description: "Per-loan breakdown",
    category: "workflow"
  },
  {
    id: "fe-reports",
    name: "Reports & Export",
    href: "/financed-emissions/reports",
    icon: FileText,
    description: "PCAF compliance",
    category: "reporting"
  },
  {
    id: "amortization",
    name: "Amortization Manager",
    href: "/financed-emissions/amortization",
    icon: TrendingDown,
    description: "Loan lifecycle & attribution",
    category: "advanced"
  },
  {
    id: "settings",
    name: "Settings",
    href: "/financed-emissions/settings", 
    icon: Settings,
    description: "Configuration",
    category: "advanced"
  }
];

const categories = {
  workflow: { name: "Core Workflow", icon: BarChart3 },
  reporting: { name: "Reporting", icon: FileText },
  advanced: { name: "Advanced", icon: Settings },
  analytics: { name: "Analytics", icon: BarChart3 },
  operations: { name: "Operations", icon: MapPin },
  finance: { name: "Finance", icon: Wallet },
  governance: { name: "Governance", icon: Shield },
  admin: { name: "Settings", icon: Settings },
  integrations: { name: "Integrations", icon: Store }
};

export function Sidebar() {
  const location = useLocation();
  const { currentPlatform } = usePlatform();
  const {
    visibleItems,
    pinnedItems,
    collapsedGroups,
    compactMode,
    toggleGroupCollapse,
    togglePin,
    resetToDefaults
  } = useNavigationStore();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getNavigationItems = () => {
    return currentPlatform === 'financed-emissions' ? financedEmissionsItems : greenFinanceItems;
  };

  const getVisibleItems = () => {
    const navItems = getNavigationItems();
    // For financed emissions, show all items since we have a limited set
    if (currentPlatform === 'financed-emissions') {
      return navItems;
    }
    return navItems.filter(item => visibleItems.includes(item.id));
  };

  const getPinnedItems = () => {
    return getNavigationItems().filter(item => pinnedItems.includes(item.id));
  };

  const getItemsByCategory = (categoryId: string) => {
    return getVisibleItems().filter(item => item.category === categoryId);
  };

  const renderNavigationItem = (item: typeof greenFinanceItems[0], isPinned = false) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    
    const content = (
      <NavLink
        key={`${item.id}-${isPinned ? 'pinned' : 'regular'}`}
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all hover:bg-accent group relative",
          isActive 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground",
          compactMode && !sidebarCollapsed && "justify-center px-2",
          sidebarCollapsed && "justify-center px-2"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 transition-colors shrink-0",
          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
        )} />
        
        {!compactMode && !sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <div className={cn(
              "font-medium truncate",
              isActive ? "text-primary-foreground" : "text-foreground"
            )}>
              {item.name}
            </div>
            <div className={cn(
              "text-xs truncate",
              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {item.description}
            </div>
          </div>
        )}

        {isPinned && !compactMode && !sidebarCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePin(item.id);
            }}
          >
            <Star className="h-3 w-3 fill-current text-yellow-500" />
          </Button>
        )}
      </NavLink>
    );

    if ((compactMode || sidebarCollapsed) && !isPinned) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  const sidebarWidth = sidebarCollapsed ? "w-16" : compactMode ? "w-20" : "w-64";

  return (
    <div className={cn("flex h-screen flex-col bg-card border-r border-border transition-all duration-300", sidebarWidth)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        {!sidebarCollapsed && (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <PeercarbonLogo size={24} />
            </div>
            {!compactMode && (
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-foreground truncate">Peercarbon</h1>
                <p className="text-xs text-muted-foreground">
                  {currentPlatform === 'financed-emissions' ? 'Scope 3 Category 15 Portal' : 'Impact Investment Hub'}
                </p>
              </div>
            )}
          </>
        )}
        
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => resetToDefaults()}
          title="Reset Navigation"
        >
          🔄
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0 ml-auto"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Access (Pinned Items) */}
      {getPinnedItems().length > 0 && !sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-border">
          {!compactMode && (
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-xs font-medium text-muted-foreground">Quick Access</span>
            </div>
          )}
          <div className="space-y-1">
            {getPinnedItems().map(item => renderNavigationItem(item, true))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        {currentPlatform === 'financed-emissions' ? (
          // Simplified flat navigation for financed emissions
          <div className="space-y-1">
            {getVisibleItems().map(item => renderNavigationItem(item))}
          </div>
        ) : (
          // Grouped navigation for green finance
          Object.entries(categories).map(([categoryId, category]) => {
            const categoryItems = getItemsByCategory(categoryId);
            if (categoryItems.length === 0) return null;

            const isCollapsed = collapsedGroups.includes(categoryId);
            const CategoryIcon = category.icon;

            if (sidebarCollapsed) {
              return (
                <div key={categoryId} className="space-y-1">
                  {categoryItems.map(item => renderNavigationItem(item))}
                </div>
              );
            }

            return (
              <Collapsible key={categoryId} open={!isCollapsed}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 h-auto text-left font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => toggleGroupCollapse(categoryId)}
                  >
                    <div className="flex items-center gap-2">
                      {!compactMode && <CategoryIcon className="h-4 w-4" />}
                      {!compactMode && <span className="text-sm">{category.name}</span>}
                      <Badge variant="outline" className="text-xs">
                        {categoryItems.length}
                      </Badge>
                    </div>
                    {!compactMode && (
                      isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  {categoryItems.map(item => renderNavigationItem(item))}
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to={`/${currentPlatform}/settings`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all",
                  (compactMode || sidebarCollapsed) && "justify-center px-2"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!compactMode && !sidebarCollapsed && "Settings"}
              </NavLink>
            </TooltipTrigger>
            {(compactMode || sidebarCollapsed) && (
              <TooltipContent side="right">
                Settings
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}