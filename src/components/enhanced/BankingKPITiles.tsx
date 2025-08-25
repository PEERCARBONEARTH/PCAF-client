import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Shield, Target, TrendingUp, Car, Leaf } from "lucide-react";
import { type LoanPortfolioItem } from "@/lib/db";

interface BankingKPITilesProps {
  loans: LoanPortfolioItem[];
}

export function BankingKPITiles({ loans }: BankingKPITilesProps) {
  // Calculate PCAF option coverage
  const pcafDistribution = loans.reduce((acc, loan) => {
    const option = loan.pcaf_data_option || '3b';
    acc[option] = (acc[option] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const option1Coverage = ((pcafDistribution['1a'] || 0) + (pcafDistribution['1b'] || 0)) / loans.length * 100;
  
  // Calculate WDQS
  const totalValue = loans.reduce((sum, loan) => sum + loan.loan_amount, 0);
  const weightedQualitySum = loans.reduce((sum, loan) => sum + (loan.data_quality_score * loan.loan_amount), 0);
  const wdqs = totalValue > 0 ? weightedQualitySum / totalValue : 0;
  
  // Calculate emissions intensity  
  const totalEmissions = loans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
  const emissionsIntensity = totalValue > 0 ? (totalEmissions * 1000) / totalValue : 0;
  
  // Calculate verification coverage
  const verifiedLoans = loans.filter(loan => loan.data_quality_score <= 3).length;
  const verificationCoverage = loans.length > 0 ? (verifiedLoans / loans.length) * 100 : 0;
  
  // Calculate ICE vs EV split
  const evLoans = loans.filter(loan => 
    loan.fuel_type.toLowerCase().includes('electric') || 
    loan.fuel_type.toLowerCase().includes('hybrid')
  ).length;
  const evPercentage = loans.length > 0 ? (evLoans / loans.length) * 100 : 0;
  
  // Calculate risk metrics
  const highRiskLoans = loans.filter(loan => loan.data_quality_score >= 4).length;
  const riskExposure = loans.length > 0 ? (highRiskLoans / loans.length) * 100 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {/* PCAF Option 1 Coverage */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Shield className="h-4 w-4 text-primary" />
            <Badge variant={option1Coverage >= 80 ? "default" : option1Coverage >= 60 ? "secondary" : "destructive"} className="text-xs">
              {option1Coverage >= 80 ? "Excellent" : option1Coverage >= 60 ? "Good" : "Needs Work"}
            </Badge>
          </div>
          <CardTitle className="text-sm font-medium">PCAF 1a/1b Coverage</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{option1Coverage.toFixed(1)}%</div>
            <Progress value={option1Coverage} className="h-2" />
            <p className="text-xs text-muted-foreground">Target: 80%+</p>
          </div>
        </CardContent>
      </Card>

      {/* Weighted Data Quality Score */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Target className="h-4 w-4 text-primary" />
            <Badge variant={wdqs <= 2.5 ? "default" : wdqs <= 3.5 ? "secondary" : "destructive"} className="text-xs">
              {wdqs <= 2.5 ? "High" : wdqs <= 3.5 ? "Medium" : "Low"}
            </Badge>
          </div>
          <CardTitle className="text-sm font-medium">WDQS</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{wdqs.toFixed(2)}</div>
            <Progress value={Math.max(0, (5 - wdqs) / 5 * 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">Lower is better</p>
          </div>
        </CardContent>
      </Card>

      {/* Emissions Intensity */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-4 w-4 text-primary" />
            <Badge variant={emissionsIntensity <= 2.5 ? "default" : emissionsIntensity <= 4.0 ? "secondary" : "destructive"} className="text-xs">
              {emissionsIntensity <= 2.5 ? "Low" : emissionsIntensity <= 4.0 ? "Medium" : "High"}
            </Badge>
          </div>
          <CardTitle className="text-sm font-medium">Emissions Intensity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{emissionsIntensity.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">kg CO₂e/$1k</p>
          </div>
        </CardContent>
      </Card>

      {/* Verification Coverage */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Shield className="h-4 w-4 text-primary" />
            <Badge variant={verificationCoverage >= 85 ? "default" : verificationCoverage >= 70 ? "secondary" : "destructive"} className="text-xs">
              {verificationCoverage >= 85 ? "Strong" : verificationCoverage >= 70 ? "Moderate" : "Weak"}
            </Badge>
          </div>
          <CardTitle className="text-sm font-medium">Verification Coverage</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{verificationCoverage.toFixed(1)}%</div>
            <Progress value={verificationCoverage} className="h-2" />
            <p className="text-xs text-muted-foreground">Target: 85%+</p>
          </div>
        </CardContent>
      </Card>

      {/* EV/Clean Energy Split */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Leaf className="h-4 w-4 text-primary" />
            <Badge variant={evPercentage >= 25 ? "default" : evPercentage >= 15 ? "secondary" : "outline"} className="text-xs">
              {evPercentage >= 25 ? "Leading" : evPercentage >= 15 ? "Growing" : "Emerging"}
            </Badge>
          </div>
          <CardTitle className="text-sm font-medium">EV/Hybrid Share</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{evPercentage.toFixed(1)}%</div>
            <Progress value={evPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">vs ICE vehicles</p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Exposure */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Car className="h-4 w-4 text-primary" />
            <Badge variant={riskExposure <= 15 ? "default" : riskExposure <= 25 ? "secondary" : "destructive"} className="text-xs">
              {riskExposure <= 15 ? "Low Risk" : riskExposure <= 25 ? "Medium Risk" : "High Risk"}
            </Badge>
          </div>
          <CardTitle className="text-sm font-medium">Risk Exposure</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="text-2xl font-bold">{riskExposure.toFixed(1)}%</div>
            <Progress value={100 - riskExposure} className="h-2" />
            <p className="text-xs text-muted-foreground">Poor data quality</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}