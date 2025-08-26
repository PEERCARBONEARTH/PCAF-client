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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Navigation items for different platforms
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
  }
];

export function CollapsiblePlatformSidebar() {
  const location = useLocation();
  const { currentPlatform } = usePlatform();
  const { open } = useSidebar();

  const getNavigationItems = () => {
    return currentPlatform === 'financed-emissions' ? financedEmissionsItems : greenFinanceItems;
  };

  const platformTitle = currentPlatform === 'financed-emissions' 
    ? 'Financed Emissions' 
    : 'Green Finance';

  const renderNavigationItem = (item: typeof greenFinanceItems[0]) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    
    const menuButton = (
      <SidebarMenuButton asChild isActive={isActive}>
        <NavLink
          to={item.href}
          className={cn(
            "flex items-center gap-3 rounded-sm text-sm font-medium transition-all",
            isActive 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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
      </SidebarMenuButton>
    );

    // Show tooltip when sidebar is collapsed
    if (!open) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {menuButton}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={item.id}>{menuButton}</div>;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground shrink-0">
            <PeercarbonLogo size={16} />
          </div>
          {open && (
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-foreground truncate">Peercarbon</h1>
              <p className="text-xs text-muted-foreground truncate">
                {platformTitle}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {getNavigationItems().map(item => (
                <SidebarMenuItem key={item.id}>
                  {renderNavigationItem(item)}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to={`/${currentPlatform}/settings`}
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
              >
                <Settings className="h-4 w-4 shrink-0" />
                {open && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}