import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu,
  Target, 
  BarChart3, 
  Trophy, 
  HelpCircle,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Upload,
  Zap,
  Bell,
  Settings,
  User,
  Home,
  FileText,
  Calculator
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileOptimizedDashboardProps {
  portfolioMetrics?: any;
  onActionStart?: (action: any) => void;
  children?: React.ReactNode;
}

export function MobileOptimizedDashboard({ 
  portfolioMetrics, 
  onActionStart,
  children 
}: MobileOptimizedDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const { toast } = useToast();

  // Mobile-specific state
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    // Add mobile-specific viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;

    if (Math.abs(diff) > 50) {
      setSwipeDirection(diff > 0 ? 'left' : 'right');
    }
  };

  const handleTouchEnd = () => {
    if (swipeDirection) {
      const tabs = ['overview', 'goals', 'progress', 'help'];
      const currentIndex = tabs.indexOf(activeTab);
      
      if (swipeDirection === 'left' && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      } else if (swipeDirection === 'right' && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
    
    setSwipeDirection(null);
    setTouchStart(null);
  };

  const quickActions = [
    {
      title: 'Upload Data',
      description: 'Add new portfolio data',
      icon: <Upload className="h-5 w-5" />,
      color: 'bg-blue-500',
      action: () => window.location.href = '/financed-emissions/upload'
    },
    {
      title: 'Calculate',
      description: 'Run PCAF calculations',
      icon: <Calculator className="h-5 w-5" />,
      color: 'bg-green-500',
      action: () => toast({ title: 'Starting calculations...', description: 'Processing your portfolio data' })
    },
    {
      title: 'Report',
      description: 'Generate compliance report',
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-purple-500',
      action: () => toast({ title: 'Generating report...', description: 'Creating your PCAF compliance report' })
    },
    {
      title: 'Insights',
      description: 'AI-powered recommendations',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-orange-500',
      action: () => setActiveTab('goals')
    }
  ];

  const statusCards = [
    {
      title: 'PCAF Score',
      value: portfolioMetrics?.weightedDataQualityScore?.toFixed(1) || '3.2',
      target: '≤ 3.0',
      status: 'warning',
      icon: <Target className="h-4 w-4" />
    },
    {
      title: 'Emissions',
      value: portfolioMetrics?.emissionsIntensity?.toFixed(1) || '2.8',
      target: '≤ 2.5 kg/$1k',
      status: 'warning',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: 'Coverage',
      value: `${Math.round((portfolioMetrics?.dataCoverage || 0.87) * 100)}%`,
      target: '≥ 95%',
      status: 'good',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div 



className="flex-1"


onTouchStart={handleTouchStart}


onTouchMove={handleTouchMove}


onTouchEnd={handleTouchEnd}


>


<Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">


  <TabsList className="grid w-full grid-cols-4 mx-4 mb-4">


    <TabsTrigger value="overview" className="text-xs">


      <Home className="h-3 w-3 mr-1" />


      Home


    </TabsTrigger>


    <TabsTrigger value="goals" className="text-xs">


      <Target className="h-3 w-3 mr-1" />


      Goals


    </TabsTrigger>


    <TabsTrigger value="progress" className="text-xs">


      <Trophy className="h-3 w-3 mr-1" />


      Progress


    </TabsTrigger>


    <TabsTrigger value="help" className="text-xs">


      <HelpCircle className="h-3 w-3 mr-1" />


      Help


    </TabsTrigger>


  </TabsList>





  <div className="px-4 pb-20">


    <TabsContent value="overview" className="mt-0">


      <MobileOverview portfolioMetrics={portfolioMetrics} />


    </TabsContent>


    


    <TabsContent value="goals" className="mt-0">


      <MobileGoals onActionStart={onActionStart} />


    </TabsContent>


    


    <TabsContent value="progress" className="mt-0">


      <MobileProgress portfolioMetrics={portfolioMetrics} />


    </TabsContent>


    


    <TabsContent value="help" className="mt-0">


      <MobileHelp />


    </TabsContent>


  </div>


</Tabs>


</div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-2">
        <div className="flex justify-center">
          <Button 
            className="w-full max-w-sm"
            onClick={() => window.location.href = '/financed-emissions/upload'}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Portfolio Data
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileNavigation({ onNavigate }: { onNavigate: () => void }) {
  const navItems = [
    { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/financed-emissions' },
    { title: 'Upload Data', icon: <Upload className="h-4 w-4" />, href: '/financed-emissions/upload' },
    { title: 'Calculations', icon: <Calculator className="h-4 w-4" />, href: '/financed-emissions/calculations' },
    { title: 'Reports', icon: <FileText className="h-4 w-4" />, href: '/financed-emissions/reports' },
    { title: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, href: '/financed-emissions/analytics' },
    { title: 'Settings', icon: <Settings className="h-4 w-4" />, href: '/settings' },
    { title: 'Profile', icon: <User className="h-4 w-4" />, href: '/profile' }
  ];

  return (
    <nav className="mt-6 space-y-2">
      {navItems.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            window.location.href = item.href;
            onNavigate();
          }}
        >
          {item.icon}
          <span className="ml-3">{item.title}</span>
        </Button>
      ))}
    </nav>
  );
}

function MobileOverview({ portfolioMetrics }: { portfolioMetrics?: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Portfolio Summary</CardTitle>
          <CardDescription>Your PCAF compliance overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total Loans</span>
            <span className="font-semibold">{portfolioMetrics?.totalLoans || 1247}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Outstanding Balance</span>
            <span className="font-semibold">${(portfolioMetrics?.totalOutstandingBalance || 45600000).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Total Emissions</span>
            <span className="font-semibold">{(portfolioMetrics?.totalFinancedEmissions || 8400).toLocaleString()} tCO₂e</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-500 rounded-full text-white">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Improve Data Quality</div>
              <div className="text-xs text-muted-foreground">Focus on 23 high-value loans</div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-500" />
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-500 rounded-full text-white">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Generate Report</div>
              <div className="text-xs text-muted-foreground">Ready for compliance reporting</div>
            </div>
            <ArrowRight className="h-4 w-4 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MobileGoals({ onActionStart }: { onActionStart?: (action: any) => void }) {
  const goals = [
    {
      title: 'PCAF Compliance',
      current: 3.2,
      target: 3.0,
      progress: 85,
      color: 'bg-blue-500'
    },
    {
      title: 'Emissions Intensity',
      current: 2.8,
      target: 2.5,
      progress: 75,
      color: 'bg-green-500'
    },
    {
      title: 'Data Coverage',
      current: 87,
      target: 95,
      progress: 92,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-4">
      {goals.map((goal, index) => (
        <Card key={index}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{goal.title}</h3>
              <Badge variant="outline">{goal.progress}%</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current: {goal.current}</span>
                <span>Target: {goal.target}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${goal.color}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => onActionStart?.(goal)}
            >
              View Action Plan
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MobileProgress({ portfolioMetrics }: { portfolioMetrics?: any }) {
  const achievements = [
    { title: 'First Upload', description: 'Uploaded your first portfolio', unlocked: true, points: 100 },
    { title: 'Data Quality Pro', description: 'Achieved WDQS < 3.5', unlocked: true, points: 250 },
    { title: 'PCAF Expert', description: 'Generated 10 compliance reports', unlocked: false, points: 500 },
    { title: 'Emissions Master', description: 'Reduced portfolio intensity by 20%', unlocked: false, points: 750 }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Progress</CardTitle>
          <CardDescription>Level 3 • 850 / 1000 XP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{ width: '85%' }} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">850</div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold">6</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold">Recent Achievements</h3>
        {achievements.map((achievement, index) => (
          <Card key={index} className={achievement.unlocked ? 'border-green-200 bg-green-50' : 'opacity-60'}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                  <Trophy className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
                <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                  {achievement.points} pts
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MobileHelp() {
  const helpTopics = [
    { title: 'Getting Started', description: 'Learn the basics of PCAF methodology', duration: '5 min' },
    { title: 'Data Quality', description: 'Improve your portfolio data quality', duration: '8 min' },
    { title: 'Calculations', description: 'Understanding emission calculations', duration: '10 min' },
    { title: 'Compliance', description: 'Meet PCAF reporting requirements', duration: '12 min' }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Help</CardTitle>
          <CardDescription>Get instant answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <HelpCircle className="h-4 w-4 mr-2" />
            Ask AI Assistant
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold">Learning Resources</h3>
        {helpTopics.map((topic, index) => (
          <Card key={index} className="cursor-pointer hover:bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{topic.title}</div>
                  <div className="text-xs text-muted-foreground">{topic.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{topic.duration}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MobileOptimizedDashboard;