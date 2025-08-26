import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { platformRAGService } from '@/services/platform-rag-service';
import { 
  Leaf, 
  Zap, 
  Users, 
  TrendingDown,
  Globe,
  Target,
  Gauge,
  Award,
  Clock,
  Flame,
  Heart,
  TreePine,
  Bot,
  Brain,
  Lightbulb
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

export function ImpactAnalyticsDashboard() {
  const { portfolioProjects, portfolioStats } = usePortfolio();
  const { toast } = useToast();
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Calculate impact metrics from portfolio with focus on clean cooking
  const impactMetrics = React.useMemo(() => {
    let totalCO2Avoided = 0;
    let totalBeneficiaries = 0;
    let totalEnergyGenerated = 0;
    let ecoboxUnitsDeployed = 0;
    let fuelSavingsLiters = 0;
    let healthBeneficiaries = 0;
    let cleanCookingHours = 0;
    
    portfolioProjects.forEach(project => {
      // Extract estimated values from project data
      const beneficiaries = parseInt(project.beneficiaries?.replace(/[^0-9]/g, '') || '0');
      totalBeneficiaries += beneficiaries;
      
      // Estimate CO2 based on investment amount and project type
      const investment = project.investmentAmount || 0;
      if (project.category === 'Solar Energy') {
        totalCO2Avoided += investment * 0.5; // 0.5 tons CO2 per $ invested
        totalEnergyGenerated += investment * 0.8; // 0.8 kWh per $ invested
      } else if (project.category === 'Clean Cooking') {
        // Enhanced clean cooking calculations
        totalCO2Avoided += investment * 0.3;
        
        // Specific calculations for ecobox units
        const estimatedUnits = Math.floor(investment / 150); // ~$150 per ecobox unit
        ecoboxUnitsDeployed += estimatedUnits;
        
        // Each ecobox saves ~500 liters of firewood equivalent per year
        fuelSavingsLiters += estimatedUnits * 500;
        
        // Health benefits: ~4 people per household benefit from reduced smoke exposure
        healthBeneficiaries += estimatedUnits * 4;
        
        // Usage hours: ~3 hours per day per unit
        cleanCookingHours += estimatedUnits * 3 * 365; // Annual hours
      }
    });

    return {
      totalCO2Avoided,
      totalBeneficiaries,
      totalEnergyGenerated,
      ecoboxUnitsDeployed,
      fuelSavingsLiters,
      healthBeneficiaries,
      cleanCookingHours,
      avgCO2PerDollar: portfolioStats.totalInvested > 0 ? totalCO2Avoided / portfolioStats.totalInvested : 0,
      costPerTonCO2: totalCO2Avoided > 0 ? portfolioStats.totalInvested / totalCO2Avoided : 0,
      costPerEcobox: ecoboxUnitsDeployed > 0 ? portfolioStats.totalInvested / ecoboxUnitsDeployed : 150
    };
  }, [portfolioProjects, portfolioStats]);

  const generateImpactRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const response = await platformRAGService.queryAgent(
        'advisory',
        'Based on this clean cooking portfolio performance, provide recommendations for maximizing impact and scaling deployment',
        {
          ecoboxUnitsDeployed: impactMetrics.ecoboxUnitsDeployed,
          totalCO2Avoided: impactMetrics.totalCO2Avoided,
          healthBeneficiaries: impactMetrics.healthBeneficiaries,
          costPerTonCO2: impactMetrics.costPerTonCO2,
          fuelSavings: impactMetrics.fuelSavingsLiters
        }
      );
      setAiRecommendations(response.response);
      toast({
        title: "Impact Analysis Complete",
        description: "AI recommendations generated based on portfolio performance.",
      });
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to generate AI recommendations.",
        variant: "destructive"
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const impactCards = [
    {
      title: 'CO₂ Emissions Avoided',
      value: `${(impactMetrics.totalCO2Avoided / 1000).toFixed(1)}k`,
      subtitle: 'tons CO₂ equivalent',
      icon: TrendingDown,
      color: 'success',
      trend: '+15% vs target'
    },
    {
      title: 'Ecobox Units Deployed',
      value: `${impactMetrics.ecoboxUnitsDeployed.toLocaleString()}`,
      subtitle: 'steam clean cooking units',
      icon: Zap,
      color: 'warning',
      progress: Math.min((impactMetrics.ecoboxUnitsDeployed / 1000) * 100, 100)
    },
    {
      title: 'People with Clean Air',
      value: `${(impactMetrics.healthBeneficiaries / 1000).toFixed(1)}k`,
      subtitle: 'reduced smoke exposure',
      icon: Users,
      color: 'primary',
      trend: `+${(impactMetrics.healthBeneficiaries / 7).toFixed(0)} this week`
    },
    {
      title: 'Fuel Savings',
      value: `${(impactMetrics.fuelSavingsLiters / 1000).toFixed(1)}k`,
      subtitle: 'liters wood equivalent/year',
      icon: Target,
      color: 'blue',
      progress: 85
    },
    {
      title: 'Clean Cooking Hours',
      value: `${(impactMetrics.cleanCookingHours / 1000000).toFixed(1)}M`,
      subtitle: 'hours annually',
      icon: Clock,
      color: 'success',
      trend: '+24/7 operation'
    }
  ];

  // Impact by project category
  const categoryImpact = React.useMemo(() => {
    const categories = portfolioProjects.reduce((acc, project) => {
      const category = project.category || 'Other';
      if (!acc[category]) {
        acc[category] = { category, projects: 0, investment: 0, co2Avoided: 0 };
      }
      acc[category].projects += 1;
      acc[category].investment += project.investmentAmount || 0;
      
      // Estimate CO2 based on category
      const investment = project.investmentAmount || 0;
      if (category === 'Solar Energy') {
        acc[category].co2Avoided += investment * 0.5;
      } else if (category === 'Clean Cooking') {
        const investment = project.investmentAmount || 0;
        acc[category].co2Avoided += investment * 0.3;
        // Add ecobox unit count
        acc[category].ecoboxUnits = (acc[category].ecoboxUnits || 0) + Math.floor(investment / 150);
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categories);
  }, [portfolioProjects]);

  // Clean cooking specific analytics
  const cleanCookingAnalytics = React.useMemo(() => {
    const cleanCookingProjects = portfolioProjects.filter(p => p.category === 'Clean Cooking');
    
    return {
      totalProjects: cleanCookingProjects.length,
      totalInvestment: cleanCookingProjects.reduce((sum, p) => sum + (p.investmentAmount || 0), 0),
      averageUnitsPerProject: cleanCookingProjects.length > 0 
        ? impactMetrics.ecoboxUnitsDeployed / cleanCookingProjects.length 
        : 0,
      fuelEfficiencyImprovement: 75, // 75% fuel efficiency improvement
      smokeReductionPercent: 95, // 95% smoke reduction
      cookingTimeReduction: 40 // 40% cooking time reduction
    };
  }, [portfolioProjects, impactMetrics.ecoboxUnitsDeployed]);

  // Ecobox performance data over time (simulated)
  const ecoboxPerformanceData = [
    { month: 'Jan', unitsDeployed: 45, fuelSaved: 22500, co2Avoided: 67, healthBeneficiaries: 180 },
    { month: 'Feb', unitsDeployed: 67, fuelSaved: 33500, co2Avoided: 98, healthBeneficiaries: 268 },
    { month: 'Mar', unitsDeployed: 89, fuelSaved: 44500, co2Avoided: 134, healthBeneficiaries: 356 },
    { month: 'Apr', unitsDeployed: 123, fuelSaved: 61500, co2Avoided: 185, healthBeneficiaries: 492 },
    { month: 'May', unitsDeployed: 156, fuelSaved: 78000, co2Avoided: 234, healthBeneficiaries: 624 },
    { month: 'Jun', unitsDeployed: 189, fuelSaved: 94500, co2Avoided: 283, healthBeneficiaries: 756 }
  ];

  // Health impact breakdown
  const healthImpactData = [
    { category: 'Respiratory Health', improvement: 95, affected: impactMetrics.healthBeneficiaries * 0.8 },
    { category: 'Eye Irritation', improvement: 90, affected: impactMetrics.healthBeneficiaries * 0.7 },
    { category: 'Burns Prevention', improvement: 85, affected: impactMetrics.healthBeneficiaries * 0.3 },
    { category: 'Time Savings', improvement: 40, affected: impactMetrics.healthBeneficiaries * 0.9 }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'primary': return 'text-primary bg-primary/10';
      case 'blue': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Impact Recommendations */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Impact Optimization
            <Button 
              onClick={generateImpactRecommendations} 
              disabled={loadingRecommendations}
              variant="outline" 
              size="sm" 
              className="ml-auto"
            >
              {loadingRecommendations ? (
                <Brain className="h-4 w-4 animate-pulse mr-2" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              Generate Recommendations
            </Button>
          </CardTitle>
        </CardHeader>
        {aiRecommendations && (
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed">{aiRecommendations}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Impact Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactCards.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-sm ${getIconColor(metric.color)}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Impact by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryImpact.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(category.co2Avoided / 1000).toFixed(1)}k tons</p>
                    <p className="text-xs text-muted-foreground">{category.projects} projects</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryImpact}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="co2Avoided"
                    label={(entry) => entry.category}
                  >
                    {categoryImpact.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${(value / 1000).toFixed(1)}k tons`, 'CO₂ Avoided']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ecobox Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Steam Ecobox Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ecoboxPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="unitsDeployed" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Units Deployed"
                  />
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="healthBeneficiaries" 
                    stackId="2"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                    name="Health Beneficiaries"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clean Cooking Specific Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Impact Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthImpactData.map((health, index) => (
                <div key={health.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{health.category}</span>
                    <span className="text-green-600 font-semibold">{health.improvement}% improvement</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{(health.affected / 1000).toFixed(1)}k people affected</span>
                    <Progress value={health.improvement} className="w-32 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clean Cooking Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5" />
              Environmental Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {cleanCookingAnalytics.fuelEfficiencyImprovement}%
                </div>
                <p className="text-sm text-muted-foreground">Fuel Efficiency</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {cleanCookingAnalytics.smokeReductionPercent}%
                </div>
                <p className="text-sm text-muted-foreground">Smoke Reduction</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {cleanCookingAnalytics.cookingTimeReduction}%
                </div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {cleanCookingAnalytics.averageUnitsPerProject.toFixed(0)}
                </div>
                <p className="text-sm text-muted-foreground">Units/Project</p>
              </div>
            </div>
            
            <div className="mt-6 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ecoboxPerformanceData.slice(-3)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fuelSaved" fill="hsl(var(--primary))" name="Fuel Saved (L)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Clean Cooking Impact Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                ${impactMetrics.costPerEcobox.toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Cost per Ecobox unit</p>
              <Progress value={75} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {impactMetrics.ecoboxUnitsDeployed > 0 
                  ? (impactMetrics.fuelSavingsLiters / impactMetrics.ecoboxUnitsDeployed).toFixed(0)
                  : '0'}L
              </div>
              <p className="text-sm text-muted-foreground">Fuel saved per unit/year</p>
              <Progress value={82} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {impactMetrics.ecoboxUnitsDeployed > 0 
                  ? (impactMetrics.healthBeneficiaries / impactMetrics.ecoboxUnitsDeployed).toFixed(1)
                  : '0'}
              </div>
              <p className="text-sm text-muted-foreground">Health beneficiaries per unit</p>
              <Progress value={88} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {impactMetrics.ecoboxUnitsDeployed > 0 
                  ? ((impactMetrics.totalCO2Avoided * 1000) / impactMetrics.ecoboxUnitsDeployed).toFixed(1)
                  : '0'}kg
              </div>
              <p className="text-sm text-muted-foreground">CO₂ avoided per unit/year</p>
              <Progress value={92} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}