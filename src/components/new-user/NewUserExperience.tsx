import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Target, 
  BookOpen, 
  Play, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  BarChart3,
  Shield,
  Calculator,
  FileText,
  TrendingUp,
  Zap,
  Clock,
  Users,
  Award,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface NewUserExperienceProps {
  onGetStarted?: () => void;
}

export function NewUserExperience({ onGetStarted }: NewUserExperienceProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStartJourney = () => {
    navigate('/financed-emissions/upload');
    onGetStarted?.();
  };

  const handleLearnMore = (topic: string) => {
    toast({
      title: "Learning Resource",
      description: `Opening ${topic} guide...`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Section */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome to PCAF Emissions Engine</h1>
                <p className="text-muted-foreground">
                  Calculate, track, and report your financed emissions with confidence
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <div className="p-2 bg-green-100 rounded-full w-fit mx-auto">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Upload Data</h3>
                <p className="text-sm text-muted-foreground">
                  Import your loan portfolio in minutes
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="p-2 bg-blue-100 rounded-full w-fit mx-auto">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Calculate Emissions</h3>
                <p className="text-sm text-muted-foreground">
                  Get PCAF-compliant emissions instantly
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="p-2 bg-purple-100 rounded-full w-fit mx-auto">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Generate Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Professional stakeholder reports
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleStartJourney} size="lg" className="px-8">
                Start Your PCAF Journey
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('learn')}>
                Learn PCAF Basics
                <BookOpen className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="learn">Learn PCAF</TabsTrigger>
          <TabsTrigger value="demo">See Demo Data</TabsTrigger>
          <TabsTrigger value="benefits">Why PCAF?</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PlatformOverview onGetStarted={handleStartJourney} />
        </TabsContent>

        <TabsContent value="learn" className="space-y-6">
          <PCAFLearningCenter onLearnMore={handleLearnMore} />
        </TabsContent>

        <TabsContent value="demo" className="space-y-6">
          <DemoDataShowcase />
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <PCAFBenefits />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlatformOverview({ onGetStarted }: { onGetStarted: () => void }) {
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'PCAF Compliant',
      description: 'Built to PCAF Global Standard for motor vehicle loans',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Real-time Analytics',
      description: 'Live portfolio emissions tracking and insights',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'AI-Powered',
      description: 'Smart recommendations for data quality improvement',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Professional Reports',
      description: 'Stakeholder-ready PCAF compliance reports',
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Ready to Calculate Your Emissions?</h3>
            <p className="text-muted-foreground">
              Upload your loan portfolio and get PCAF-compliant emissions in under 5 minutes
            </p>
            <Button onClick={onGetStarted} className="px-8">
              Upload Portfolio Data
              <Upload className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PCAFLearningCenter({ onLearnMore }: { onLearnMore: (topic: string) => void }) {
  const topics = [
    {
      title: 'What is PCAF?',
      description: 'Learn about the Partnership for Carbon Accounting Financials and why it matters',
      duration: '5 min read',
      level: 'Beginner',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      title: 'Motor Vehicle Methodology',
      description: 'Understand how PCAF calculates emissions for motor vehicle loans',
      duration: '8 min read',
      level: 'Intermediate',
      icon: <Calculator className="h-5 w-5" />
    },
    {
      title: 'Data Quality Scores',
      description: 'Master PCAF data quality assessment and improvement strategies',
      duration: '6 min read',
      level: 'Intermediate',
      icon: <Target className="h-5 w-5" />
    },
    {
      title: 'Attribution Factors',
      description: 'Learn how to calculate and apply attribution factors correctly',
      duration: '10 min read',
      level: 'Advanced',
      icon: <BarChart3 className="h-5 w-5" />
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Master PCAF Methodology</h2>
        <p className="text-muted-foreground">
          Build your expertise with our comprehensive learning resources
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {topic.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getLevelColor(topic.level)}>
                      {topic.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {topic.duration}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onLearnMore(topic.title)}
                  >
                    Read More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Start with "What is PCAF?" if you're new to financed emissions, 
          or jump to "Data Quality Scores" if you want to optimize your portfolio immediately.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function DemoDataShowcase() {
  const demoMetrics = [
    { label: 'Total Loans', value: '1,247', change: '+12%', icon: <Users className="h-5 w-5" /> },
    { label: 'Financed Emissions', value: '8.4k tCO₂e', change: '-5%', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'WDQS Score', value: '2.8', change: '↓0.3', icon: <Target className="h-5 w-5" /> },
    { label: 'Emissions Intensity', value: '2.1 kg/$1k', change: '-8%', icon: <TrendingUp className="h-5 w-5" /> }
  ];

  const sampleInsights = [
    "Electric vehicle loans show 75% lower emissions intensity",
    "23% of loans could improve to PCAF Option 2a with vehicle data",
    "Portfolio is on track for PCAF compliance with current improvements"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">See What Your Dashboard Could Look Like</h2>
        <p className="text-muted-foreground">
          Preview the insights and analytics you'll get with your portfolio data
        </p>
      </div>

      {/* Demo Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {demoMetrics.map((metric, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {metric.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                <Badge variant="outline" className="text-xs">
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sample AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI-Powered Insights (Sample)
          </CardTitle>
          <CardDescription>
            See the kind of intelligent recommendations you'll receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Play className="h-4 w-4" />
        <AlertDescription>
          This is sample data to show platform capabilities. 
          <strong> Upload your portfolio to see real insights for your loans.</strong>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function PCAFBenefits() {
  const benefits = [
    {
      category: 'Regulatory Compliance',
      items: [
        'Meet TCFD disclosure requirements',
        'Prepare for EU Taxonomy compliance',
        'Satisfy investor ESG reporting needs',
        'Stay ahead of regulatory changes'
      ],
      icon: <Shield className="h-6 w-6" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      category: 'Business Intelligence',
      items: [
        'Identify high-emission loan segments',
        'Optimize portfolio composition',
        'Track decarbonization progress',
        'Benchmark against industry peers'
      ],
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      category: 'Risk Management',
      items: [
        'Assess climate transition risks',
        'Monitor stranded asset exposure',
        'Evaluate portfolio resilience',
        'Plan for scenario stress testing'
      ],
      icon: <Target className="h-6 w-6" />,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      category: 'Stakeholder Value',
      items: [
        'Transparent emissions reporting',
        'Professional compliance documentation',
        'Enhanced ESG credentials',
        'Competitive market positioning'
      ],
      icon: <Award className="h-6 w-6" />,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Why PCAF Matters for Your Business</h2>
        <p className="text-muted-foreground">
          Discover the strategic advantages of financed emissions tracking
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {benefits.map((benefit, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${benefit.color}`}>
                  {benefit.icon}
                </div>
                {benefit.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {benefit.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Globe className="h-12 w-12 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Join the Global Movement</h3>
              <p className="text-sm text-muted-foreground">
                Over 450 financial institutions worldwide use PCAF methodology to measure and disclose 
                their financed emissions. Be part of the solution to climate change.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewUserExperience;