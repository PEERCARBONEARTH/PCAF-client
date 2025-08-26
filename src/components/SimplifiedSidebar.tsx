import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  MapPin,
  TrendingUp,
  Wallet,
  Shield,
  FileText,
  AlertTriangle,
  Upload,
  Calculator,
  Settings,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PeercarbonLogo } from "./PeercarbonLogo";
import { usePlatform } from "@/contexts/PlatformContext";

// Simplified navigation items - only essential features for MVP
const greenFinanceItems = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/green-finance",
    icon: BarChart3,
  },
  {
    id: "projects",
    name: "Projects",
    href: "/green-finance/projects",
    icon: MapPin,
  },
  {
    id: "tranches",
    name: "Payments",
    href: "/green-finance/tranches",
    icon: Wallet,
  },
  {
    id: "reports",
    name: "Reports",
    href: "/green-finance/reports",
    icon: FileText,
  },
  {
    id: "compliance",
    name: "Compliance",
    href: "/green-finance/compliance",
    icon: Shield,
  },
  {
    id: "alerts",
    name: "Alerts",
    href: "/green-finance/alerts-risk",
    icon: AlertTriangle,
  }
];

const financedEmissionsItems = [
  {
    id: "upload",
    name: "Data Upload", 
    href: "/financed-emissions/upload",
    icon: Upload,
  },
  {
    id: "summary",
    name: "Overview",
    href: "/financed-emissions/summary", 
    icon: Calculator,
  },
  {
    id: "ledger",
    name: "Loan Ledger",
    href: "/financed-emissions/ledger",
    icon: Wallet,
  },
  {
    id: "fe-reports",
    name: "Reports",
    href: "/financed-emissions/reports",
    icon: FileText,
  },
  {
    id: "amortization",
    name: "Amortization",
    href: "/financed-emissions/amortization",
    icon: TrendingDown,
  },
  {
    id: "settings",
    name: "Settings",
    href: "/financed-emissions/settings", 
    icon: Settings,
  }
];

export function SimplifiedSidebar() {
  const location = useLocation();
  const { currentPlatform } = usePlatform();

  const getNavigationItems = () => {
    return currentPlatform === 'financed-emissions' ? financedEmissionsItems : greenFinanceItems;
  };

  const renderNavigationItem = (item: typeof greenFinanceItems[0]) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    
    return (
      <NavLink
        key={item.id}
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all hover:bg-accent/50",
          isActive 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className={cn(
          "h-5 w-5 transition-colors shrink-0",
          isActive ? "text-primary-foreground" : "text-muted-foreground"
        )} />
        <span className={cn(
          "font-medium",
          isActive ? "text-primary-foreground" : "text-foreground"
        )}>
          {item.name}
        </span>
      </NavLink>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-card border-r border-border w-64">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground shrink-0">
          <PeercarbonLogo size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-foreground truncate">Peercarbon</h1>
          <p className="text-xs text-muted-foreground">
            {currentPlatform === 'financed-emissions' ? 'Financed Emissions' : 'Green Finance'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {getNavigationItems().map(item => renderNavigationItem(item))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <NavLink
          to={`/${currentPlatform}/settings`}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </NavLink>
      </div>
    </div>
  );
}