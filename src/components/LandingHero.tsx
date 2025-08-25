import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, LineChart, ArrowRight, Shield, Zap, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingHero: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
          Choose Your
          <span className="block text-primary">Carbon Finance Engine</span>
        </h1>
        <p className="text-base text-muted-foreground mb-5 max-w-lg">
          Automated compliance. Verified outcomes. Intelligent capital flow.
        </p>
      </div>

      {/* Platform Selection Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Green Finance Platform */}
        <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Performance
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">Green Project Finance</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Performance-based capital disbursements with built-in impact verification & emissions tracking
            </p>
            <div className="flex items-center text-primary text-sm font-medium group-hover:gap-3 gap-2 transition-all">
              <span>Explore Platform</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Financed Emissions Platform */}
        <Link to="/financed-emissions" className="block">
          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/30 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20">
                  <LineChart className="h-5 w-5 text-accent" />
                </div>
                <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                  PCAF Ready
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                Financed Emissions Engine
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Loan-level emissions tracking and portfolio-wide insights built for PCAF compliance from day one.
              </p>
              <div className="flex items-center text-accent text-sm font-medium group-hover:gap-3 gap-2 transition-all">
                <span>Explore Platform</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* CTA Section */}
      <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-5">
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Ready to Transform Your Portfolio?
            </h2>
            <p className="text-sm text-muted-foreground">
              Unlock carbon intelligence across your lending and investment book — Scope 3 Category 15, simplified.
            </p>
          </div>
          
          <Link to="/auth">
            <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
              Sign In to Portal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span>Real-time Processing</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Leaf className="h-3.5 w-3.5 text-finance" />
              <span>Impact Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};