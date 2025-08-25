import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useDealPipeline } from '@/contexts/DealPipelineContext';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Activity,
  CheckCircle,
  Clock,
  Banknote,
  Users,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PortfolioOverviewDashboard() {
  const { portfolioProjects, portfolioStats } = usePortfolio();
  const { pipelineProjects } = useDealPipeline();
  const navigate = useNavigate();

  // Calculate additional metrics
  const avgInvestmentSize = portfolioStats.totalProjects > 0 
    ? portfolioStats.totalInvested / portfolioStats.totalProjects 
    : 0;
  
  const disbursementRate = portfolioStats.totalInvested > 0 
    ? (portfolioStats.totalDisbursed / portfolioStats.totalInvested) * 100 
    : 0;

  const pipelineValue = pipelineProjects.reduce((sum, p) => {
    const funding = p.funding?.replace(/[$,]/g, '') || '0';
    return sum + parseFloat(funding);
  }, 0);

  const keyMetrics = [
    {
      title: 'Total Portfolio Value',
      value: `$${(portfolioStats.totalInvested / 1000000).toFixed(1)}M`,
      subtitle: `${portfolioStats.totalProjects} active projects`,
      icon: DollarSign,
      color: 'primary',
      trend: '+12% vs last quarter'
    },
    {
      title: 'Capital Deployed',
      value: `$${(portfolioStats.totalDisbursed / 1000000).toFixed(1)}M`,
      subtitle: `${disbursementRate.toFixed(1)}% deployment rate`,
      icon: Banknote,
      color: 'success',
      progress: disbursementRate
    },
    {
      title: 'Active Projects',
      value: portfolioStats.activeProjects.toString(),
      subtitle: `${portfolioStats.completedProjects} completed`,
      icon: Activity,
      color: 'blue',
      trend: `+${portfolioStats.activeProjects - portfolioStats.completedProjects} vs last month`
    },
    {
      title: 'Pipeline Value',
      value: `$${(pipelineValue / 1000000).toFixed(1)}M`,
      subtitle: `${pipelineProjects.length} opportunities`,
      icon: Target,
      color: 'orange',
      trend: '+8% this month'
    }
  ];

  const recentProjects = portfolioProjects
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'approved': return 'warning';
      case 'completed': return 'primary';
      default: return 'secondary';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary bg-primary/10';
      case 'success': return 'text-green-600 bg-green-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${getIconColor(metric.color)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <h3 className="text-xs font-medium text-muted-foreground mb-1">
                      {metric.title}
                    </h3>
                    
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">
                        {metric.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metric.subtitle}
                      </p>
                    </div>

                    {metric.progress && (
                      <div className="mt-3">
                        <Progress value={metric.progress} className="h-1.5" />
                      </div>
                    )}

                    {metric.trend && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {metric.trend}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Portfolio Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Portfolio Activity</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Latest updates from your active investments
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/green-finance/portfolio-overview')}
          >
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{project.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {project.lifecycleStatus}
                        </Badge>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{project.location}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          ${((project.investmentAmount || 0) / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {project.progress}% Complete
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {project.lastUpdated}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No portfolio projects yet</p>
                <p className="text-sm">Add projects from your deal pipeline to start tracking performance</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}