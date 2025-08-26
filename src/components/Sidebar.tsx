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
          "group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out",
          "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10",
          isActive
            ? "bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 border border-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-accent/30 hover:backdrop-blur-sm",
          compactMode && !sidebarCollapsed && "justify-center px-3",
          sidebarCollapsed && "justify-center px-3",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
        )}
      >
        <div className={cn(
          "relative z-10 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300",
          isActive
            ? "bg-white/20 backdrop-blur-sm shadow-inner"
            : "bg-muted/30 group-hover:bg-primary/10 group-hover:scale-110"
        )}>
          <Icon className={cn(
            "h-5 w-5 transition-all duration-300 shrink-0",
            isActive ? "text-primary-foreground drop-shadow-sm" : "text-muted-foreground group-hover:text-primary"
          )} />
        </div>

        {!compactMode && !sidebarCollapsed && (
          <div className="flex-1 min-w-0 relative z-10">
            <div className={cn(
              "font-semibold truncate transition-colors duration-300",
              isActive ? "text-primary-foreground drop-shadow-sm" : "text-foreground"
            )}>
              {item.name}
              {item.isNew && (
                <Badge className="ml-2 px-1.5 py-0.5 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm">
                  New
                </Badge>
              )}
            </div>
            <div className={cn(
              "text-xs truncate mt-0.5 transition-colors duration-300",
              isActive ? "text-primary-foreground/90" : "text-muted-foreground group-hover:text-muted-foreground/80"
            )}>
              {item.description}
            </div>
          </div>
        )}

        {isPinned && !compactMode && !sidebarCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="relative z-10 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white/20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePin(item.id);
            }}
          >
            <Star className="h-3.5 w-3.5 fill-current text-yellow-400 drop-shadow-sm" />
          </Button>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/40 rounded-l-full shadow-sm" />
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

  const sidebarWidth = sidebarCollapsed ? "w-20" : compactMode ? "w-24" : "w-72";

  return (
    <div className={cn(
      "flex h-screen flex-col transition-all duration-500 ease-out relative",
      "bg-gradient-to-b from-card/95 via-card to-card/98 backdrop-blur-xl",
      "border-r border-border/50 shadow-2xl shadow-black/5",
      sidebarWidth
    )}>
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-primary/[0.03] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 px-6 py-8 border-b border-border/30 bg-gradient-to-r from-muted/20 via-transparent to-muted/10">
        {!sidebarCollapsed && (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shrink-0 shadow-lg shadow-primary/25 ring-1 ring-white/20">
              <PeercarbonLogo size={28} />
            </div>
            {!compactMode && (
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-foreground truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  Peercarbon
                </h1>
                <p className="text-sm text-muted-foreground/90 font-medium mt-0.5">
                  {currentPlatform === 'financed-emissions' ? 'Scope 3 Category 15 Portal' : 'Impact Investment Hub'}
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 shrink-0 rounded-xl hover:bg-muted/50 hover:scale-110 transition-all duration-300"
            onClick={() => resetToDefaults()}
            title="Reset Navigation"
          >
            <span className="text-lg">🔄</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 shrink-0 rounded-xl hover:bg-muted/50 hover:scale-110 transition-all duration-300"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Quick Access (Pinned Items) */}
      {getPinnedItems().length > 0 && !sidebarCollapsed && (
        <div className="relative z-10 px-6 py-5 border-b border-border/30 bg-gradient-to-r from-yellow-500/5 via-transparent to-amber-500/5">
          {!compactMode && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/25">
                <Star className="h-4 w-4 text-white fill-current drop-shadow-sm" />
              </div>
              <span className="text-sm font-semibold text-foreground">Quick Access</span>
            </div>
          )}
          <div className="space-y-2">
            {getPinnedItems().map(item => renderNavigationItem(item, true))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-6 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/30 scrollbar-track-transparent">
        {currentPlatform === 'financed-emissions' ? (
          // Simplified flat navigation for financed emissions
          <div className="space-y-3">
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
                <div key={categoryId} className="space-y-3">
                  {categoryItems.map(item => renderNavigationItem(item))}
                </div>
              );
            }

            return (
              <Collapsible key={categoryId} open={!isCollapsed}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto text-left font-semibold rounded-xl hover:bg-gradient-to-r hover:from-muted/40 hover:to-accent/20 transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => toggleGroupCollapse(categoryId)}
                  >
                    <div className="flex items-center gap-3">
                      {!compactMode && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted/50 shadow-sm">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      {!compactMode && <span className="text-sm text-foreground">{category.name}</span>}
                      <Badge variant="outline" className="text-xs bg-muted/50 border-muted text-muted-foreground">
                        {categoryItems.length}
                      </Badge>
                    </div>
                    {!compactMode && (
                      <div className="transition-transform duration-300">
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-3 ml-2">
                  {categoryItems.map(item => renderNavigationItem(item))}
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div className="relative z-10 border-t border-border/30 p-6 bg-gradient-to-t from-muted/10 via-transparent to-transparent">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to={`/${currentPlatform}/settings`}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]",
                  "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-accent/30 hover:shadow-lg hover:shadow-muted/20",
                  (compactMode || sidebarCollapsed) && "justify-center px-3"
                )}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/30 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                  <Settings className="h-5 w-5 shrink-0 group-hover:text-primary transition-colors duration-300" />
                </div>
                {!compactMode && !sidebarCollapsed && (
                  <span className="font-semibold">Settings</span>
                )}
              </NavLink>
            </TooltipTrigger>
            {(compactMode || sidebarCollapsed) && (
              <TooltipContent side="right" className="bg-card/95 backdrop-blur-sm border border-border/50">
                <p className="font-medium">Settings</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Version indicator */}
        {!sidebarCollapsed && !compactMode && (
          <div className="mt-4 pt-4 border-t border-border/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground/60">
              <span>v2.1.0</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}