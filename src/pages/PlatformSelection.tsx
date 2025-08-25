import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PeercarbonLogo } from '@/components/PeercarbonLogo';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { TrendingUp, Calculator, Building2, Leaf, ChartBar, FileText, Shield, Target } from 'lucide-react';
export default function PlatformSelection() {
  const navigate = useNavigate();
  const {
    setPlatform
  } = usePlatform();
  const handlePlatformSelect = (platform: 'green-finance' | 'financed-emissions') => {
    setPlatform(platform);
    navigate(`/${platform}`);
  };
  return <div className="animated-background min-h-screen relative overflow-hidden">
      
      {/* Moving Glass Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 backdrop-blur-md rounded-full animate-[float-background_25s_ease-in-out_infinite] opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-finance/8 backdrop-blur-lg rounded-full animate-[float-background_30s_ease-in-out_infinite_reverse] opacity-50" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/6 backdrop-blur-xl rounded-full animate-[float-background_35s_ease-in-out_infinite] opacity-40" />
        <div className="absolute top-1/6 right-1/3 w-48 h-48 bg-primary/12 backdrop-blur-sm rounded-full animate-[float-background_20s_ease-in-out_infinite_reverse] opacity-70" />
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/5" />

      {/* Header */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PeercarbonLogo size={32} className="text-primary" />
          <h1 className="text-xl font-semibold text-foreground">PeerCarbon</h1>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 pt-20 pb-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Select the solution that best fits your organization’s goals for carbon intelligence and project finance enablement.</p>
          </div>

          {/* Platform Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Green Finance Platform */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Green Finance Platform</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Automated green portfolio management with performance-driven disbursements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Tranche Management</p>
                      <p className="text-sm text-muted-foreground">Structure, automate, and monitor disbursement flows</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChartBar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Impact Tracking</p>
                      <p className="text-sm text-muted-foreground">Real-time performance and impact verification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Compliance</p>
                      <p className="text-sm text-muted-foreground">Regulatory reporting and compliance</p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => handlePlatformSelect('green-finance')} className="w-full bg-primary hover:bg-primary/90" size="lg">
                  Access Green Finance Platform
                </Button>
              </CardContent>
            </Card>

            {/* Financed Emissions Platform */}
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-finance/10">
                    <Calculator className="h-6 w-6 text-finance" />
                  </div>
                  <CardTitle className="text-2xl">Financed Emissions Platform</CardTitle>
                </div>
                <CardDescription className="text-base">
                  PCAF-compliant carbon emissions tracking and reporting for loan portfolios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-finance mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">PCAF Calculator</p>
                      <p className="text-sm text-muted-foreground">Loan-level emissions attribution and tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-finance mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Portfolio Tracking</p>
                      <p className="text-sm text-muted-foreground">Emissions visibility by asset class and product line</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-finance mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Compliance Reports</p>
                      <p className="text-sm text-muted-foreground">Generate export-ready, auditable disclosure files</p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => navigate('/pcaf-asset-class')} className="w-full bg-finance hover:bg-finance/90" size="lg">
                  Access Financed Emissions Platform
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer info */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              You can switch between platforms at any time. Both platforms share the same user credentials.
            </p>
          </div>
        </div>
      </div>
    </div>;
}