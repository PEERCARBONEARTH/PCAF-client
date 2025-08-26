import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Menu,
  Home,
  Upload,
  Calculator,
  FileText,
  BarChart3,
  Target,
  Trophy,
  HelpCircle,
  Settings,
  User,
  Bell,
  Zap,
  Shield,
  ChevronRight,
  Dot,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMobileDevice } from '@/hooks/useMobileGestures';

interface NavigationItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
  category: 'main' | 'tools' | 'insights' | 'settings';
  requiresOnline?: boolean;
  isNew?: boolean;
}

interface MobileNavigationProps {
  onNavigate?: (href: string) => void;
  notifications?: number;
}

export function MobileNavigation({ onNavigate, notifications = 0 }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeCategory, setActiveCategory] = useState<string>('main');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useMobileDevice();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navigationItems: NavigationItem[] = [
    // Main Navigation
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Portfolio overview and metrics',
      icon: <Home className="h-4 w-4" />,
      href: '/financed-emissions',
      category: 'main'
    },
    {
      id: 'overview',
      title: 'Portfolio Overview',
      description: 'Detailed portfolio analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/financed-emissions/overview',
      category: 'main'
    },
    {
      id: 'upload',
      title: 'Upload Data',
      description: 'Add new portfolio data',
      icon: <Upload className="h-4 w-4" />,
      href: '/financed-emissions/upload',
      category: 'main',
      requiresOnline: true
    },
    {
      id: 'ledger',
      title: 'Loan Ledger',
      description: 'Individual loan details',
      icon: <FileText className="h-4 w-4" />,
      href: '/financed-emissions/ledger',
      category: 'main'
    },

    // Tools
    {
      id: 'calculator',
      title: 'PCAF Calculator',
      description: 'Manual emissions calculations',
      icon: <Calculator className="h-4 w-4" />,
      href: '/financed-emissions/calculator',
      category: 'tools'
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate compliance reports',
      icon: <FileText className="h-4 w-4" />,
      href: '/financed-emissions/reports',
      category: 'tools',
      requiresOnline: true
    },
    {
      id: 'compliance',
      title: 'Compliance Center',
      description: 'PCAF compliance tracking',
      icon: <Shield className="h-4 w-4" />,
      href: '/financed-emissions/compliance',
      category: 'tools',
      badge: 'New',
      isNew: true
    },

    // Insights
    {
      id: 'ai-insights',
      title: 'AI Insights',
      description: 'AI analytics, climate risk & scenarios',
      icon: <Zap className="h-4 w-4" />,
      href: '/financed-emissions/ai-insights',
      category: 'insights',
      requiresOnline: true,
      badge: 'Enhanced'
    },
    {
      id: 'goals',
      title: 'Your Goals',
      description: 'Track progress toward outcomes',
      icon: <Target className="h-4 w-4" />,
      href: '/financed-emissions/goals',
      category: 'insights'
    },
    {
      id: 'progress',
      title: 'Progress Tracker',
      description: 'Achievements and skill levels',
      icon: <Trophy className="h-4 w-4" />,
      href: '/financed-emissions/progress',
      category: 'insights'
    },
    {
      id: 'help',
      title: 'Help & Learning',
      description: 'Guides and AI assistance',
      icon: <HelpCircle className="h-4 w-4" />,
      href: '/financed-emissions/help',
      category: 'insights'
    },

    // Settings
    {
      id: 'settings',
      title: 'Settings',
      description: 'App preferences and configuration',
      icon: <Settings className="h-4 w-4" />,
      href: '/settings',
      category: 'settings'
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Account and organization details',
      icon: <User className="h-4 w-4" />,
      href: '/profile',
      category: 'settings'
    }
  ];

  const categories = [
    { id: 'main', title: 'Main', icon: <Home className="h-4 w-4" /> },
    { id: 'tools', title: 'Tools', icon: <Calculator className="h-4 w-4" /> },
    { id: 'insights', title: 'Insights', icon: <Zap className="h-4 w-4" /> },
    { id: 'settings', title: 'Settings', icon: <Settings className="h-4 w-4" /> }
  ];

  const handleNavigation = (href: string, requiresOnline?: boolean) => {
    if (requiresOnline && !isOnline) {
      toast({
        title: "Offline Mode",
        description: "This feature requires an internet connection",
        variant: "destructive"
      });
      return;
    }

    navigate(href);
    setIsOpen(false);
    onNavigate?.(href);
  };

  const isCurrentPage = (href: string) => {
    return location.pathname === href || 
           (href !== '/financed-emissions' && location.pathname.startsWith(href));
  };

  const getItemsByCategory = (category: string) => {
    return navigationItems.filter(item => item.category === category);
  };

  if (!isMobile) {
    return null; // Use desktop navigation
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Menu className="h-5 w-5" />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              {notifications > 99 ? '99+' : notifications}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>PCAF Engine</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                Navigation
                <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
                  {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </SheetDescription>
            </div>
            {notifications > 0 && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {notifications}
                </Badge>
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {/* Category Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "ghost"}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                <span className="ml-1 hidden sm:inline">{category.title}</span>
              </Button>
            ))}
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {getItemsByCategory(activeCategory).map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                isActive={isCurrentPage(item.href)}
                isOnline={isOnline}
                onClick={() => handleNavigation(item.href, item.requiresOnline)}
              />
            ))}
          </div>

          {/* Quick Actions */}
          {activeCategory === 'main' && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center gap-1"
                    onClick={() => handleNavigation('/financed-emissions/upload', true)}
                    disabled={!isOnline}
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-xs">Upload</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center gap-1"
                    onClick={() => handleNavigation('/financed-emissions/calculator')}
                  >
                    <Calculator className="h-4 w-4" />
                    <span className="text-xs">Calculate</span>
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Offline Features */}
          {!isOnline && (
            <>
              <Separator className="my-4" />
              <div className="p-3 bg-orange-50 rounded-sm border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <WifiOff className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Offline Mode</span>
                </div>
                <p className="text-xs text-orange-700">
                  You can still view cached data and use offline features.
                </p>
              </div>
            </>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>PCAF Engine v1.0.0</span>
            <div className="flex items-center gap-1">
              <Dot className="h-3 w-3 text-green-500" />
              <span>Synced</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  isOnline: boolean;
  onClick: () => void;
}

function NavigationItem({ item, isActive, isOnline, onClick }: NavigationItemProps) {
  const isDisabled = item.requiresOnline && !isOnline;

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={`w-full justify-start h-auto p-3 ${isDisabled ? 'opacity-50' : ''}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      <div className="flex items-center gap-3 w-full">
        <div className={`p-1 rounded ${isActive ? 'bg-primary/10' : ''}`}>
          {item.icon}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{item.title}</span>
            {item.badge && (
              <Badge 
                variant={item.isNew ? "default" : "secondary"} 
                className="text-xs h-4"
              >
                {item.badge}
              </Badge>
            )}
            {isDisabled && (
              <WifiOff className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Button>
  );
}

export default MobileNavigation;