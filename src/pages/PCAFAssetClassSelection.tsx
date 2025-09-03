import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PeercarbonLogo } from '@/components/PeercarbonLogo';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { ArrowLeft, Car, Building2, Factory, Home, Zap, Wind, Banknote, TrendingUp } from 'lucide-react';

const assetClasses = [
  {
    id: 'motor-vehicle-loans',
    title: 'Motor Vehicle Loans',
    description: 'Passenger cars, motorcycles, and commercial vehicles',
    icon: Car,
    available: true,
    route: '/financed-emissions'
  },
  {
    id: 'green-finance-platform',
    title: 'Green Finance Platform',
    description: 'Automated green portfolio management with performance-driven disbursements',
    icon: TrendingUp,
    available: true,
    route: '/green-finance'
  },
  {
    id: 'listed-equity-corporate-bonds',
    title: 'Listed Equity and Corporate Bonds',
    description: 'Publicly traded equity investments and corporate debt securities',
    icon: Building2,
    available: false,
    route: null
  },
  {
    id: 'business-loans-unlisted-equity',
    title: 'Business Loans and Unlisted Equity',
    description: 'Corporate lending and private equity investments',
    icon: Factory,
    available: false,
    route: null
  },
  {
    id: 'project-finance',
    title: 'Project Finance',
    description: 'Energy, infrastructure, and industrial projects',
    icon: Wind,
    available: false,
    route: null
  },
  {
    id: 'commercial-real-estate',
    title: 'Commercial Real Estate',
    description: 'Office buildings, retail, and industrial properties',
    icon: Building2,
    available: false,
    route: null
  },
  {
    id: 'mortgages',
    title: 'Mortgages',
    description: 'Residential property financing and home loans',
    icon: Home,
    available: false,
    route: null
  },
  {
    id: 'sovereign-debt',
    title: 'Sovereign Debt',
    description: 'Government bonds and sovereign debt instruments',
    icon: Banknote,
    available: false,
    route: null
  }
];

export default function PCAFAssetClassSelection() {
  const navigate = useNavigate();
  const { setPlatform } = usePlatform();

  const handleAssetClassSelect = (assetClass: typeof assetClasses[0]) => {
    if (!assetClass.available) return;
    
    setPlatform('financed-emissions');
    navigate(assetClass.route!);
  };

  const handleBackToPlatforms = () => {
    navigate('/pcaf-asset-class');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-finance/5 relative overflow-hidden">
      {/* Header */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToPlatforms}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Platforms
          </Button>
        </div>
        <div className="flex items-center justify-center gap-3 flex-1 px-8 -ml-8">
          <PeercarbonLogo size={32} className="text-finance" />
          <h1 className="text-xl font-semibold text-foreground">PeerCarbon</h1>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(66,153,225,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(66,153,225,0.08),transparent_50%)]" />

      {/* Main content */}
      <div className="relative z-10 pt-20 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline" className="text-finance border-finance/30">
                PCAF Compliant
              </Badge>
              <Badge variant="secondary">
                Asset Class Selection
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Select PCAF Asset Class
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the asset class for your financed emissions tracking. Each class follows PCAF methodology standards for accurate carbon attribution.
            </p>
          </div>

          {/* Asset Class Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {assetClasses.map((assetClass) => (
              <Card 
                key={assetClass.id}
                className={`group transition-all duration-300 bg-card/80 backdrop-blur-sm border-border/50 ${
                  assetClass.available 
                    ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer hover:border-finance/30' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => handleAssetClassSelect(assetClass)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-sm ${
                      assetClass.available 
                        ? 'bg-finance/10 group-hover:bg-finance/20' 
                        : 'bg-muted/20'
                    }`}>
                      <assetClass.icon className={`h-6 w-6 ${
                        assetClass.available ? 'text-finance' : 'text-muted-foreground'
                      }`} />
                    </div>
                    {assetClass.available ? (
                      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/30">
                        Closed Beta
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                        In Development
                      </Badge>
                    )}
                  </div>
                  <CardTitle className={`text-lg ${
                    assetClass.available ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {assetClass.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {assetClass.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assetClass.available ? (
                    <Button 
                      className="w-full bg-finance hover:bg-finance/90"
                      size="sm"
                    >
                      Enter Platform
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      size="sm"
                      disabled
                    >
                      In Development
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* PCAF Compliance Notice */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-sm p-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-sm bg-finance/10">
                <Building2 className="h-5 w-5 text-finance" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">PCAF Accreditation Status</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  PeerCarbon is currently undergoing PCAF (Partnership for Carbon Accounting Financials) accreditation. 
                  Our Motor Vehicle Loans asset class is fully operational and compliant with PCAF methodology.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/30">
                    ✓ Motor Vehicle Loans - Closed Beta
                  </Badge>
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                    ⏳ Other Asset Classes - In Development
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Need access to additional asset classes? Contact our team for early access and implementation timelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}