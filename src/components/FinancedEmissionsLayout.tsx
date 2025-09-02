import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Upload, 
  Settings, 
  PieChart, 
  TrendingUp,
  Calculator,
  Users,
  Shield,
  Menu,
  X,
  Building2,
  Target,
  Activity,
  ArrowLeft,
  Brain,
  BookOpen,
  Globe,
  Zap,
  Database,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PeercarbonLogo } from '@/components/PeercarbonLogo';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';
import { usePlatform } from '@/contexts/PlatformContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { OnboardingWizard } from './onboarding/OnboardingWizard';
import { OnboardingChecklistPanel } from './onboarding/OnboardingChecklistPanel';
import { OnboardingCoachBubble } from './onboarding/OnboardingCoachBubble';
import { useOnboardingTrigger } from '@/hooks/useOnboardingTrigger';


const navigation = [
  {
    name: 'Overview',
    href: '/financed-emissions',
    icon: BarChart3,
    description: 'Portfolio Carbon Footprint summary'
  },
  {
    name: 'Loan Ledger',
    href: '/financed-emissions/ledger',
    icon: FileText,
    description: 'Emissions attributed to loans breakdown'
  },
  {
    name: 'Upload Data',
    href: '/financed-emissions/upload',
    icon: Upload,
    description: 'Import loan portfolio for carbon attribution'
  },
  {
    name: 'Reports',
    href: '/financed-emissions/reports',
    icon: PieChart,
    description: 'Scope 3 Category 15 compliance reports'
  },
  {
    name: 'AI Insights',
    href: '/financed-emissions/ai-insights',
    icon: Brain,
    description: 'AI analytics, climate risk assessment, and scenario modeling'
  },
  {
    name: 'RAG Management',
    href: '/financed-emissions/rag-management',
    icon: Database,
    description: 'Upload and manage knowledge base documents'
  },
  {
    name: 'AI Chat',
    href: '/financed-emissions/rag-chat',
    icon: MessageCircle,
    description: 'Chat with AI assistant about PCAF methodology'
  },
  {
    name: 'Settings',
    href: '/financed-emissions/settings',
    icon: Settings,
    description: 'Carbon-linked exposure configuration'
  },
  {
    name: 'Methodology',
    href: '/financed-emissions/methodology',
    icon: BookOpen,
    description: 'Data quality methodology & sources'
  },
  {
    name: 'Pipeline Demo',
    href: '/financed-emissions/pipeline-demo',
    icon: Zap,
    description: 'Data pipeline demonstration and testing'
  },
  {
    name: 'AI Narrative Insights',
    href: '/financed-emissions/narrative-insights',
    icon: Brain,
    description: 'Humanized AI insights with actionable business strategy'
  }
];

const quickStats = [
  { label: 'Total Loans', value: '2,847', icon: Building2, trend: '+12%' },
  { label: 'Portfolio Carbon Footprint', value: '15.2k tCO₂e', icon: Target, trend: '-5%' },
  { label: 'PCAF Score', value: '2.8', icon: Activity, trend: '↓0.2' }
];

interface FinancedEmissionsLayoutProps {
  children: React.ReactNode;
}

function FinancedEmissionsLayoutContent({ children }: FinancedEmissionsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { clearPlatform } = usePlatform();
  
  useOnboardingTrigger();

  const handleSwitchPlatform = () => {
    clearPlatform();
    navigate('/platform-selection');
  };

  const isActiveRoute = (href: string) => {
    if (href === '/financed-emissions') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r border-border transition-[var(--transition-premium)] ease-in-out lg:translate-x-0 flex flex-col shadow-[var(--shadow-strong)] backdrop-blur-sm",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Enhanced Sidebar header with glassmorphism */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border bg-gradient-to-r from-muted/50 to-card backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-sm bg-muted/50 backdrop-blur-sm shadow-[var(--shadow-xs)]">
              <PeercarbonLogo size={28} className="text-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground transition-colors duration-300">PeerCarbon</h1>
              <p className="text-xs text-muted-foreground font-medium">Financed Emissions</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-foreground hover:bg-muted hover:scale-105 transition-[var(--transition-smooth)] rounded-sm shadow-[var(--shadow-xs)]"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>


        {/* Enhanced Navigation with premium interactions */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigation.map((item, index) => {
              const isActive = isActiveRoute(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3.5 text-left rounded-sm  transition-[var(--transition-premium)] group relative overflow-hidden backdrop-blur-sm",
                    isActive
                      ? "bg-accent text-primary border border-accent/40 shadow-[var(--shadow-elevated)] scale-[1.02] translate-x-1"
                      : "text-muted-foreground hover:bg-muted/20 hover:text-foreground hover:scale-[1.01] hover:translate-x-1 hover:shadow-[var(--shadow-card)]"
                  )}
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  {/* Background glow effect for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent opacity-60" />
                  )}
                  
                  <div className={cn(
                    "p-2 rounded-sm transition-[var(--transition-bounce)] relative z-10 shadow-[var(--shadow-xs)]",
                    isActive 
                      ? "bg-primary/20 text-primary group-hover:scale-110 shadow-[var(--shadow-glow)]" 
                      : "bg-muted/20 text-muted-foreground group-hover:bg-muted/30 group-hover:text-foreground group-hover:scale-110"
                  )}>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  
                  <div className="min-w-0 relative z-10">
                    <div className={cn(
                      "text-sm font-semibold transition-colors duration-300",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {item.name}
                    </div>
                    <div className={cn(
                      "text-xs transition-colors duration-300 mt-0.5",
                      isActive ? "text-primary/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-[var(--shadow-glow)] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Enhanced Sidebar footer with premium styling */}
        <div className="border-t border-border p-6 bg-gradient-to-t from-muted/20 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-4 p-3 rounded-sm  bg-muted/10 border border-border backdrop-blur-sm hover:bg-muted/15 transition-[var(--transition-smooth)] hover:scale-[1.02] hover:shadow-[var(--shadow-card)] group">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shadow-[var(--shadow-xs)] group-hover:shadow-[var(--shadow-glow)] group-hover:scale-110 transition-[var(--transition-bounce)]">
              <Shield className="h-5 w-5 text-accent group-hover:text-accent-light transition-colors duration-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors duration-300">PCAF Compliant</div>
              <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">Data quality assured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main content area */}
      <div className="lg:ml-72">
        {/* Premium Top header with glassmorphism */}
        <header className="bg-card/95 backdrop-blur-md border-b border-border/60 px-6 h-16 flex items-center justify-between shadow-[var(--shadow-sm)] relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[2%] via-transparent to-accent/[2%] opacity-60" />
          
          <div className="flex items-center gap-4 relative z-10">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-foreground hover:bg-muted hover:scale-105 transition-[var(--transition-smooth)] rounded-sm shadow-[var(--shadow-xs)]"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-bold text-foreground transition-colors duration-300 hover:text-primary">
                {navigation.find(item => isActiveRoute(item.href))?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-muted-foreground transition-colors duration-300">
                {navigation.find(item => isActiveRoute(item.href))?.description || 'Portfolio Carbon Footprint overview'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchPlatform}
              className="flex items-center gap-2 hover:scale-105 transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-card)] bg-card/80 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Switch Platform
            </Button>
            <div className="p-1 rounded-sm bg-muted/50 backdrop-blur-sm">
              <ModeToggle />
            </div>
            <div className="p-1 rounded-sm bg-muted/50 backdrop-blur-sm hover:bg-muted/70 transition-colors duration-300">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Enhanced Page content with premium spacing */}
        <main className="flex-1 p-6 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/[1%] relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(147,102,78,0.03),transparent_50%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
      <OnboardingChecklistPanel />
      <OnboardingCoachBubble />
      <OnboardingWizard />
    </div>
  );
}

export function FinancedEmissionsLayout({ children }: FinancedEmissionsLayoutProps) {
  return (
    <OnboardingProvider>
      <FinancedEmissionsLayoutContent>
        {children}
      </FinancedEmissionsLayoutContent>
    </OnboardingProvider>
  );
}