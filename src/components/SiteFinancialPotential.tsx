import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Leaf, 
  Shield, 
  Building, 
  Warehouse,
  CreditCard,
  Calculator,
  Target,
  PiggyBank
} from 'lucide-react';

interface FinancialPotentialProps {
  projectId: string;
  schoolName: string;
}

interface PayAsYouCookMetrics {
  monthlyRevenue: string;
  annualRevenue: string;
  usageHours: number;
  pricePerHour: string;
  projectedGrowth: string;
}

interface CarbonCreditsData {
  creditsEarned: string;
  creditValue: string;
  annualCredits: string;
  verificationStatus: string;
  marketPrice: string;
  projectedEarnings: string;
}

interface FundingBreakdown {
  capex: {
    amount: string;
    percentage: number;
    description: string;
  };
  warehouseRecovery: {
    amount: string;
    percentage: number;
    description: string;
  };
  workingCapital: {
    amount: string;
    percentage: number;
    description: string;
  };
}

interface CatalyticMechanisms {
  derisking: string[];
  guarantees: string[];
  blendedFinance: string[];
  incentives: string[];
}

export default function SiteFinancialPotential({ projectId, schoolName }: FinancialPotentialProps) {
  const payAsYouCook: PayAsYouCookMetrics = {
    monthlyRevenue: "$1,850",
    annualRevenue: "$22,200",
    usageHours: 8.5,
    pricePerHour: "$7.25",
    projectedGrowth: "12% annually"
  };

  const carbonCredits: CarbonCreditsData = {
    creditsEarned: "14.4 tCO₂e",
    creditValue: "$50/tCO₂e",
    annualCredits: "14.4 tCO₂e",
    verificationStatus: "Gold Standard Verified",
    marketPrice: "$45-55/tCO₂e",
    projectedEarnings: "$720/year"
  };

  const fundingBreakdown: FundingBreakdown = {
    capex: {
      amount: "$45,000",
      percentage: 75,
      description: "Equipment purchase & installation"
    },
    warehouseRecovery: {
      amount: "$12,000",
      percentage: 20,
      description: "Inventory & working capital recovery"
    },
    workingCapital: {
      amount: "$3,000",
      percentage: 5,
      description: "Operational buffer & maintenance"
    }
  };

  const catalyticMechanisms: CatalyticMechanisms = {
    derisking: [
      "Technical performance insurance",
      "School creditworthiness assessment",
      "Equipment warranty coverage"
    ],
    guarantees: [
      "OEM performance guarantee",
      "Revenue guarantee (min 80% of projections)",
      "Partial credit guarantee from local bank"
    ],
    blendedFinance: [
      "50% grant funding from climate fund",
      "30% concessional loan",
      "20% market-rate financing"
    ],
    incentives: [
      "Carbon credit premium pricing",
      "Feed-in tariff for excess energy",
      "Tax incentives for clean cooking"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Financial Potential Analysis</h3>
          <p className="text-sm text-muted-foreground">{schoolName} - Revenue & Impact Projections</p>
        </div>
        <Badge className="bg-finance/10 text-finance border-finance/20">
          Financial Model Validated
        </Badge>
      </div>

      {/* Pay-As-You-Cook Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-finance" />
            Pay-As-You-Cook Revenue Model
          </CardTitle>
          <CardDescription>
            Revenue generated from cooking service usage based on hours operated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold text-finance">{payAsYouCook.monthlyRevenue}</p>
              <p className="text-xs text-muted-foreground">Based on {payAsYouCook.usageHours}h/day avg</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Annual Revenue</p>
              <p className="text-2xl font-bold text-finance">{payAsYouCook.annualRevenue}</p>
              <p className="text-xs text-success">+{payAsYouCook.projectedGrowth} growth projected</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rate Structure</p>
              <p className="text-2xl font-bold text-foreground">{payAsYouCook.pricePerHour}</p>
              <p className="text-xs text-muted-foreground">Per cooking hour</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carbon Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-success" />
            Carbon Credits Potential
          </CardTitle>
          <CardDescription>
            Verified carbon reduction credits and market value projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Annual Credits</p>
              <p className="text-2xl font-bold text-success">{carbonCredits.annualCredits}</p>
              <Badge className="bg-success/10 text-success border-success/20 text-xs">
                {carbonCredits.verificationStatus}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Market Price</p>
              <p className="text-2xl font-bold text-success">{carbonCredits.marketPrice}</p>
              <p className="text-xs text-muted-foreground">Current market range</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Annual Earnings</p>
              <p className="text-2xl font-bold text-finance">{carbonCredits.projectedEarnings}</p>
              <p className="text-xs text-muted-foreground">Conservative estimate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            Funding Allocation Breakdown
          </CardTitle>
          <CardDescription>
            How investment capital is allocated across different use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">CapEx Investment</p>
                  <p className="text-sm text-muted-foreground">{fundingBreakdown.capex.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{fundingBreakdown.capex.amount}</p>
                <p className="text-sm text-muted-foreground">{fundingBreakdown.capex.percentage}% of total</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Warehouse className="h-5 w-5 text-finance" />
                <div>
                  <p className="font-medium text-foreground">Warehouse Recovery</p>
                  <p className="text-sm text-muted-foreground">{fundingBreakdown.warehouseRecovery.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{fundingBreakdown.warehouseRecovery.amount}</p>
                <p className="text-sm text-muted-foreground">{fundingBreakdown.warehouseRecovery.percentage}% of total</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-foreground">Working Capital</p>
                  <p className="text-sm text-muted-foreground">{fundingBreakdown.workingCapital.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{fundingBreakdown.workingCapital.amount}</p>
                <p className="text-sm text-muted-foreground">{fundingBreakdown.workingCapital.percentage}% of total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalytic & Derisking Mechanisms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Catalytic & Derisking Mechanisms
          </CardTitle>
          <CardDescription>
            Risk mitigation and financial incentive structures in place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Risk Mitigation
              </h4>
              <div className="space-y-2">
                {catalyticMechanisms.derisking.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-finance" />
                Performance Guarantees
              </h4>
              <div className="space-y-2">
                {catalyticMechanisms.guarantees.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-finance rounded-full" />
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                Blended Finance Structure
              </h4>
              <div className="space-y-2">
                {catalyticMechanisms.blendedFinance.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                Market Incentives
              </h4>
              <div className="space-y-2">
                {catalyticMechanisms.incentives.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full" />
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}