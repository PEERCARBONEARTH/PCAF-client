import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, Leaf, DollarSign, BarChart3, Activity, CheckCircle, Clock, Zap, LineChart, Target } from 'lucide-react';
export const DashboardMockup: React.FC = () => {
  const [activeView, setActiveView] = useState<'green-finance' | 'emissions'>('green-finance');
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animate progress values
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValue(prev => (prev + 1) % 101);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  const greenFinanceView = <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Green Finance Dashboard</h3>
          <p className="text-sm text-muted-foreground">Performance-driven disbursements</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/30">
          Live
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Portfolio Value</span>
            </div>
            <div className="text-lg font-semibold text-primary">$24.7M</div>
          </CardContent>
        </Card>
        
        <Card className="bg-finance/5 border-finance/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-4 w-4 text-finance" />
              <span className="text-xs text-muted-foreground">Impact Units</span>
            </div>
            <div className="text-lg font-semibold text-finance">12,847</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tracking */}
      <Card className="bg-card/60 border-border/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Tranche Progress</span>
            <span className="text-sm text-primary font-semibold">{Math.floor(animatedValue * 0.73)}%</span>
          </div>
          <Progress value={animatedValue * 0.73} className="h-2" />
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-finance" />
            <span>Auto-verification active</span>
          </div>
        </CardContent>
      </Card>

      {/* IVB Logic Preview */}
      <Card className="bg-finance/5 border-finance/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-finance" />
            <span className="text-sm font-semibold text-foreground">Smart Disbursement</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next release</span>
              <span className="text-finance font-medium">$15,000</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Trigger</span>
              <span className="text-foreground">200hr verified</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
  const emissionsView = <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Financed Emissions Dashboard</h3>
          <p className="text-sm text-muted-foreground">PCAF-compliant reporting</p>
        </div>
        <Badge className="bg-accent/10 text-accent border-accent/30">
          PCAF Ready
        </Badge>
      </div>

      {/* Emissions Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-accent/5 border-accent/20 hover:bg-accent/10 hover:border-accent/40 transition-all duration-200 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Total Emissions</span>
            </div>
            <div className="text-lg font-semibold text-accent">147k tCO₂</div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Scope 3 Coverage</span>
            </div>
            <div className="text-lg font-semibold text-primary">94.2%</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Score */}
      <Card className="bg-card/60 border-border/30 hover:bg-card/80 hover:border-border/50 transition-all duration-200 hover:scale-105">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Data Quality Score</span>
            <span className="text-sm text-accent font-semibold">{Math.floor(animatedValue * 0.94)}%</span>
          </div>
          <Progress value={animatedValue * 0.94} className="h-2" />
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Activity className="h-3 w-3 text-accent" />
            <span>Real-time validation</span>
          </div>
        </CardContent>
      </Card>

      {/* PCAF Categories */}
      <Card className="bg-accent/5 border-accent/20 hover:bg-accent/10 hover:border-accent/40 transition-all duration-200 hover:scale-105">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <LineChart className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">PCAF Breakdown</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Motor vehicle loans</span>
              <span className="text-accent font-medium">67%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Project Finance</span>
              <span className="text-foreground">33%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
  return <div className="space-y-6">
      {/* Platform Switcher */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
        <Button variant={activeView === 'green-finance' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveView('green-finance')} className="flex-1 text-xs">
          Green Finance
        </Button>
        <Button variant={activeView === 'emissions' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveView('emissions')} className="flex-1 text-xs">
          Loan Emissions
        </Button>
      </div>

      {/* Dashboard Content */}
      <div className="min-h-[500px] animate-fade-in">
        {activeView === 'green-finance' ? greenFinanceView : emissionsView}
      </div>

      {/* Floating Data Points */}
      <div className="relative">
        <div className="absolute -top-2 -right-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1 animate-pulse">
          <span className="text-xs text-primary font-medium">
            Live Data
          </span>
        </div>
      </div>
    </div>;
};