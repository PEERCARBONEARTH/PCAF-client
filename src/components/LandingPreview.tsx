import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  Leaf, 
  Shield, 
  CheckCircle, 
  DollarSign,
  Clock,
  Zap
} from 'lucide-react';

export const LandingPreview: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in animation-delay-300">
      {/* Enhanced Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini Dashboard Preview */}
        <Card className="card-enhanced bg-card/60 backdrop-blur-sm border-border/30 hover:border-primary/20 transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Live Impact Dashboard
              </h3>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Real-time
              </Badge>
            </div>
            
            {/* Progress Example */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tranche Progress</span>
                  <span className="text-foreground font-medium">73%</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>
              
              {/* Impact Metric */}
              <div className="flex items-center justify-between p-3 rounded-sm bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">Impact Verified</span>
                </div>
                <span className="text-sm font-semibold text-primary">1,247 tCO₂</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <Card className="card-enhanced bg-card/60 backdrop-blur-sm border-border/30 hover:border-accent/20 transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Live Analytics</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Active Projects</span>
                <span className="text-sm font-semibold text-accent">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Disbursed</span>
                <span className="text-sm font-semibold text-accent">$2.4M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Compliance Rate</span>
                <span className="text-sm font-semibold text-accent">98.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IVB Logic Preview - Enhanced */}
      <Card className="card-enhanced bg-card/60 backdrop-blur-sm border-border/30 hover:border-finance/20 transition-all duration-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-finance" />
              <h3 className="text-sm font-semibold text-foreground">IVB Logic Engine</h3>
            </div>
            <Badge variant="outline" className="text-xs border-finance/30 text-finance">
              Automated
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Current Trigger:</div>
              <div className="bg-finance/5 border border-finance/20 rounded-sm p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-finance" />
                  <span className="text-foreground">200 hrs verified cooking</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <DollarSign className="h-3 w-3 text-finance" />
                  <span className="font-medium text-finance">→ $15K auto-released</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Next Actions:</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-finance/60"></div>
                  <span className="text-muted-foreground">Compliance verification pending</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-finance/60"></div>
                  <span className="text-muted-foreground">Report generation scheduled</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-finance/60"></div>
                  <span className="text-muted-foreground">Stakeholder notification queued</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};