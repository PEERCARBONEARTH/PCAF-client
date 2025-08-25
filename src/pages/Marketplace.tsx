import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Search,
  Satellite,
  DollarSign,
  Bot,
  MessageCircle,
  Star,
  Download,
  CheckCircle,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Calculator,
  Leaf
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: string;
  rating: number;
  downloads: string;
  verified: boolean;
  price: string;
  features: string[];
  icon: React.ReactNode;
}

const integrations: Integration[] = [
  // Data Providers & Analytics
  {
    id: "planet-labs",
    name: "Planet Labs Satellite Data",
    provider: "Planet Labs",
    description: "Real-time satellite imagery and environmental monitoring for impact verification",
    category: "data-analytics",
    rating: 4.8,
    downloads: "2.3k",
    verified: true,
    price: "Custom",
    features: ["Daily satellite imagery", "Environmental monitoring", "Deforestation tracking", "API access"],
    icon: <Satellite className="h-6 w-6" />
  },
  {
    id: "world-bank-data",
    name: "World Bank Data API",
    provider: "World Bank",
    description: "Access to comprehensive socioeconomic indicators and development data",
    category: "data-analytics",
    rating: 4.9,
    downloads: "5.1k",
    verified: true,
    price: "Free",
    features: ["Country indicators", "Development metrics", "Historical data", "Real-time updates"],
    icon: <Globe className="h-6 w-6" />
  },
  {
    id: "gold-standard",
    name: "Gold Standard Registry",
    provider: "Gold Standard",
    description: "Carbon credit verification and impact certification services",
    category: "data-analytics",
    rating: 4.7,
    downloads: "1.8k",
    verified: true,
    price: "$99/month",
    features: ["Impact verification", "Carbon credit registry", "Certification workflow", "Audit trails"],
    icon: <Shield className="h-6 w-6" />
  },
  // Peercarbon Tools
  {
    id: "pcaf-carbon-calculator",
    name: "PCAF Carbon Calculator",
    provider: "Peercarbon",
    description: "PCAF-aligned Scope 1 & 2 carbon accounting calculator for financial institutions",
    category: "data-analytics",
    rating: 4.9,
    downloads: "1.4k",
    verified: true,
    price: "Included",
    features: ["PCAF Standard v2.0", "Scope 1 & 2 emissions", "Data quality scoring", "Compliance reporting"],
    icon: <Calculator className="h-6 w-6" />
  },
  {
    id: "sustainability-tracker",
    name: "Sustainability Impact Tracker",
    provider: "Peercarbon",
    description: "Track and measure sustainability commitments across your entire portfolio",
    category: "data-analytics",
    rating: 4.8,
    downloads: "956",
    verified: true,
    price: "Included",
    features: ["Portfolio tracking", "Impact measurement", "ESG scoring", "Net-zero alignment"],
    icon: <Leaf className="h-6 w-6" />
  },
  // Financial Services
  {
    id: "stripe-payments",
    name: "Stripe Payments",
    provider: "Stripe",
    description: "Global payment processing for project disbursements and donor contributions",
    category: "financial",
    rating: 4.9,
    downloads: "12.5k",
    verified: true,
    price: "2.9% + 30¢",
    features: ["Global payments", "Multi-currency", "Instant disbursements", "Fraud protection"],
    icon: <DollarSign className="h-6 w-6" />
  },
  {
    id: "open-banking",
    name: "Open Banking Connect",
    provider: "Plaid",
    description: "Direct bank transfers and financial account verification for beneficiaries",
    category: "financial",
    rating: 4.6,
    downloads: "3.2k",
    verified: true,
    price: "$1 per verification",
    features: ["Bank verification", "Direct transfers", "Account linking", "Real-time balance"],
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: "defi-protocol",
    name: "DeFi Disbursement Protocol",
    provider: "Polygon Network",
    description: "Automated fund disbursement through smart contracts with multi-signature security",
    category: "financial",
    rating: 4.3,
    downloads: "1.2k",
    verified: true,
    price: "0.1% per transaction",
    features: ["Smart contract automation", "Multi-sig wallets", "Cross-chain support", "Governance tokens"],
    icon: <Zap className="h-6 w-6" />
  },
  // AI & ML Services
  {
    id: "ml-risk-assessment",
    name: "AI Risk Assessment Engine",
    provider: "Peercarbon AI",
    description: "Machine learning models for project risk scoring and outcome prediction",
    category: "ai-ml",
    rating: 4.5,
    downloads: "892",
    verified: true,
    price: "$199/month",
    features: ["Risk scoring", "Outcome prediction", "Early warnings", "Custom models"],
    icon: <Bot className="h-6 w-6" />
  },
  {
    id: "nlp-feedback",
    name: "Beneficiary Sentiment Analysis",
    provider: "TextAnalytics Co",
    description: "Natural language processing for analyzing beneficiary feedback and satisfaction",
    category: "ai-ml",
    rating: 4.4,
    downloads: "567",
    verified: false,
    price: "$149/month",
    features: ["Sentiment analysis", "Feedback categorization", "Multi-language support", "Real-time processing"],
    icon: <TrendingUp className="h-6 w-6" />
  },
  // Communication & Collaboration
  {
    id: "whatsapp-business",
    name: "WhatsApp Business API",
    provider: "Meta",
    description: "Direct communication with field teams and beneficiaries via WhatsApp",
    category: "communication",
    rating: 4.7,
    downloads: "4.1k",
    verified: true,
    price: "$0.005 per message",
    features: ["Broadcast messaging", "Two-way communication", "Media sharing", "Template messages"],
    icon: <MessageCircle className="h-6 w-6" />
  },
  {
    id: "google-workspace",
    name: "Google Workspace Integration",
    provider: "Google",
    description: "Collaborative document editing and file storage for project teams",
    category: "communication",
    rating: 4.8,
    downloads: "8.7k",
    verified: true,
    price: "$6/user/month",
    features: ["Document collaboration", "Cloud storage", "Video conferencing", "Calendar sync"],
    icon: <Globe className="h-6 w-6" />
  }
];

const categories = [
  { id: "all", label: "All Integrations", icon: <Search className="h-4 w-4" /> },
  { id: "data-analytics", label: "Data & Analytics", icon: <Satellite className="h-4 w-4" /> },
  { id: "financial", label: "Financial Services", icon: <DollarSign className="h-4 w-4" /> },
  { id: "ai-ml", label: "AI & Machine Learning", icon: <Bot className="h-4 w-4" /> },
  { id: "communication", label: "Communication", icon: <MessageCircle className="h-4 w-4" /> }
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const handleInstallIntegration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    toast({
      title: "Installation Started",
      description: `${integration?.name} installation initiated. Next: Complete configuration wizard.`,
    });
    // Navigate to guided installation flow with step-by-step setup
  };

  const handleViewDetails = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    toast({
      title: "Preview Mode",
      description: `Opening ${integration?.name} preview with test environment and feature demo.`,
    });
    // Navigate to preview interface with testing capabilities
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Integration Marketplace</h1>
            <p className="text-muted-foreground">
              Extend your platform with powerful third-party integrations and services
            </p>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription className="text-sm">{integration.provider}</CardDescription>
                        </div>
                      </div>
                      {integration.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {integration.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {integration.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {integration.downloads}
                      </div>
                      <div className="ml-auto font-semibold text-foreground">
                        {integration.price}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{integration.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm" onClick={() => handleInstallIntegration(integration.id)}>
                        Install & Configure
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(integration.id)}>
                        Preview & Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No integrations found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}