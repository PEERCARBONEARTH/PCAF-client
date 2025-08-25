import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Crown, 
  Lock, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  PieChart,
  Target,
  Calendar,
  Building2,
  Leaf,
  Globe,
  FileCheck
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface InstitutionData {
  name: string;
  greenInvestment: string;
  pcafAlignment: number;
  co2Reductions: string;
  riskScore: "Low" | "Medium" | "High";
  sector: string;
  location: string;
  lastUpdated: string;
}

interface EmissionsData {
  year: number;
  scope1: number;
  scope2: number;
  scope3: number;
  target: number;
  actual: number;
}

interface SectorRiskData {
  sector: string;
  exposure: number;
  riskLevel: "Low" | "Medium" | "High";
  transitionScore: number;
}

interface InstitutionViewDashboardProps {
  onBackToProject: () => void;
}

export const InstitutionViewDashboard: React.FC<InstitutionViewDashboardProps> = ({ onBackToProject }) => {
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedStandard, setSelectedStandard] = useState("pcaf");

  const institutionsData: InstitutionData[] = [
    {
      name: "Green Development Bank",
      greenInvestment: "$12.4M",
      pcafAlignment: 87,
      co2Reductions: "2,340 tCO₂e",
      riskScore: "Low",
      sector: "Renewable Energy",
      location: "Kenya, Uganda",
      lastUpdated: "Dec 15, 2024"
    },
    {
      name: "Sustainable Capital Fund",
      greenInvestment: "$8.7M",
      pcafAlignment: 72,
      co2Reductions: "1,890 tCO₂e",
      riskScore: "Medium",
      sector: "Clean Cooking",
      location: "Tanzania, Rwanda",
      lastUpdated: "Dec 12, 2024"
    },
    {
      name: "Climate Investment Corp",
      greenInvestment: "$15.2M",
      pcafAlignment: 94,
      co2Reductions: "3,120 tCO₂e",
      riskScore: "Low",
      sector: "Sustainable Transport",
      location: "Ghana, Nigeria",
      lastUpdated: "Dec 18, 2024"
    },
    {
      name: "Impact Finance Partners",
      greenInvestment: "$6.3M",
      pcafAlignment: 65,
      co2Reductions: "1,245 tCO₂e",
      riskScore: "High",
      sector: "Agriculture",
      location: "Ethiopia, Malawi",
      lastUpdated: "Dec 10, 2024"
    },
    {
      name: "Blue Ocean Capital",
      greenInvestment: "$18.9M",
      pcafAlignment: 91,
      co2Reductions: "4,567 tCO₂e",
      riskScore: "Low",
      sector: "Water & Sanitation",
      location: "Senegal, Mali",
      lastUpdated: "Dec 20, 2024"
    }
  ];

  const emissionsData: EmissionsData[] = [
    { year: 2020, scope1: 125000, scope2: 89000, scope3: 456000, target: 670000, actual: 670000 },
    { year: 2021, scope1: 118000, scope2: 82000, scope3: 425000, target: 625000, actual: 625000 },
    { year: 2022, scope1: 112000, scope2: 76000, scope3: 398000, target: 586000, actual: 586000 },
    { year: 2023, scope1: 105000, scope2: 71000, scope3: 365000, target: 541000, actual: 541000 },
    { year: 2024, scope1: 98000, scope2: 65000, scope3: 342000, target: 505000, actual: 505000 },
    { year: 2025, scope1: 91000, scope2: 59000, scope3: 318000, target: 468000, actual: 0 },
    { year: 2026, scope1: 84000, scope2: 53000, scope3: 295000, target: 432000, actual: 0 },
    { year: 2027, scope1: 77000, scope2: 47000, scope3: 271000, target: 395000, actual: 0 },
    { year: 2028, scope1: 70000, scope2: 41000, scope3: 248000, target: 359000, actual: 0 },
    { year: 2029, scope1: 63000, scope2: 35000, scope3: 224000, target: 322000, actual: 0 },
    { year: 2030, scope1: 56000, scope2: 29000, scope3: 201000, target: 286000, actual: 0 }
  ];

  const sectorRiskData: SectorRiskData[] = [
    { sector: "Coal & Mining", exposure: 8.5, riskLevel: "High", transitionScore: 25 },
    { sector: "Oil & Gas", exposure: 12.3, riskLevel: "High", transitionScore: 32 },
    { sector: "Traditional Agriculture", exposure: 15.7, riskLevel: "Medium", transitionScore: 58 },
    { sector: "Manufacturing", exposure: 22.1, riskLevel: "Medium", transitionScore: 65 },
    { sector: "Sustainable Transport", exposure: 18.4, riskLevel: "Low", transitionScore: 84 },
    { sector: "Renewable Energy", exposure: 23.0, riskLevel: "Low", transitionScore: 92 }
  ];

  const handleExportReport = () => {
    toast({
      title: "Exporting Institution Report",
      description: "Your portfolio-level sustainability report is being generated...",
    });
  };

  const handleConfigureData = () => {
    toast({
      title: "Opening Data Configurator",
      description: "Configure emissions factors and reporting logic for your portfolio...",
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-600 bg-green-50";
      case "Medium": return "text-yellow-600 bg-yellow-50";
      case "High": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "Low": return <CheckCircle className="h-4 w-4" />;
      case "Medium": return <AlertTriangle className="h-4 w-4" />;
      case "High": return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Premium Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={onBackToProject}
                className="hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project View
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Institution View – Sustainability & Climate Impact
                </h1>
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro Feature
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="latam">Latin America</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="2024" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleExportReport} className="bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Premium Sustainability Overview */}
        <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Portfolio Sustainability Overview
                </CardTitle>
                <CardDescription>Institution-level climate impact and net-zero alignment</CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-3 py-1">
                <Lock className="h-3 w-3 mr-1" />
                Premium Feature
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-green-600">2030</div>
                <div className="text-sm text-muted-foreground">Net Zero Target</div>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  On Track
                </Badge>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">505k</div>
                <div className="text-sm text-muted-foreground">Total Portfolio Emissions</div>
                <div className="text-xs text-green-600 mt-1">↓ 24.6% vs 2020</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-purple-600">78%</div>
                <div className="text-sm text-muted-foreground">PCAF Coverage</div>
                <Progress value={78} className="mt-2 h-2" />
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-orange-600">$61.5M</div>
                <div className="text-sm text-muted-foreground">Green Finance Deployed</div>
                <div className="text-xs text-green-600 mt-1">↑ 34% YoY</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-red-600">15.8%</div>
                <div className="text-sm text-muted-foreground">High Risk Exposure</div>
                <div className="text-xs text-green-600 mt-1">↓ 5.2% vs 2023</div>
              </div>
            </div>
            
            {/* Additional Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-700 font-medium">Scope 1 & 2 Emissions</div>
                    <div className="text-xl font-bold text-green-800">163k tCO₂e</div>
                  </div>
                  <div className="text-green-600">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-700 font-medium">Scope 3 Emissions</div>
                    <div className="text-xl font-bold text-blue-800">342k tCO₂e</div>
                  </div>
                  <div className="text-blue-600">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-700 font-medium">Portfolio Institutions</div>
                    <div className="text-xl font-bold text-purple-800">127</div>
                  </div>
                  <div className="text-purple-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-yellow-700 font-medium">Data Quality Score</div>
                    <div className="text-xl font-bold text-yellow-800">87%</div>
                  </div>
                  <div className="text-yellow-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institutional Climate Scorecard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Institutional Climate Scorecard
            </CardTitle>
            <CardDescription>Portfolio-level performance across institutional clients</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution Name</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Green Investment</TableHead>
                  <TableHead>PCAF Alignment</TableHead>
                  <TableHead>CO₂ Reductions</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutionsData.map((institution, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{institution.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {institution.sector}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{institution.location}</TableCell>
                    <TableCell className="font-semibold">{institution.greenInvestment}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={institution.pcafAlignment} className="w-16 h-2" />
                        <span className="text-sm font-medium">{institution.pcafAlignment}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">{institution.co2Reductions}</TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(institution.riskScore)}>
                        {getRiskIcon(institution.riskScore)}
                        <span className="ml-1">{institution.riskScore}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{institution.lastUpdated}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          View Report
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Net Zero Progress Visual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Net Zero Progress Timeline
              </CardTitle>
              <CardDescription>CO₂e reduction progress toward 2030 target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">2024 Net Zero Progress</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">67% complete</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Target className="h-3 w-3 mr-1" />
                      On Track
                    </Badge>
                  </div>
                </div>
                <Progress value={67} className="h-4" />
                
                {/* Current vs Target */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">505k</div>
                    <div className="text-sm text-blue-700">Current Emissions (tCO₂e)</div>
                    <div className="text-xs text-blue-600">2024 Actual</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">286k</div>
                    <div className="text-sm text-green-700">2030 Target (tCO₂e)</div>
                    <div className="text-xs text-green-600">57% reduction needed</div>
                  </div>
                </div>
                
                {/* Sector Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Emissions by Sector (2024)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-lg font-bold text-green-600">163k</div>
                      <div className="text-xs text-green-700">Scope 1 & 2</div>
                      <div className="text-xs text-muted-foreground">32% of total</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-lg font-bold text-blue-600">342k</div>
                      <div className="text-xs text-blue-700">Scope 3</div>
                      <div className="text-xs text-muted-foreground">68% of total</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-lg font-bold text-purple-600">-43k</div>
                      <div className="text-xs text-purple-700">Carbon Credits</div>
                      <div className="text-xs text-muted-foreground">8.5% offset</div>
                    </div>
                  </div>
                </div>
                
                {/* Year over Year Trend */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Historical Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>2020 Baseline</span>
                      <span className="font-medium">670k tCO₂e</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>2024 Current</span>
                      <span className="font-medium text-green-600">505k tCO₂e (-24.6%)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>2030 Target</span>
                      <span className="font-medium text-blue-600">286k tCO₂e (-57.3%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Standards Alignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Standards Alignment
              </CardTitle>
              <CardDescription>Compliance with international reporting standards</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedStandard} onValueChange={setSelectedStandard}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pcaf">PCAF</TabsTrigger>
                  <TabsTrigger value="issb">ISSB</TabsTrigger>
                  <TabsTrigger value="tcfd">TCFD</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pcaf" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Asset Coverage</span>
                      <span className="text-sm font-bold">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Data Quality Score</span>
                      <span className="text-sm font-bold">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </TabsContent>
                
                <TabsContent value="issb" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Disclosure Completeness</span>
                      <span className="text-sm font-bold">74%</span>
                    </div>
                    <Progress value={74} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Materiality Assessment</span>
                      <span className="text-sm font-bold">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </TabsContent>
                
                <TabsContent value="tcfd" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Risk Disclosure</span>
                      <span className="text-sm font-bold">81%</span>
                    </div>
                    <Progress value={81} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Scenario Analysis</span>
                      <span className="text-sm font-bold">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Climate Risk & Data Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                Climate Risk & Transition Exposure
              </CardTitle>
              <CardDescription>Sector-wise transition risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Risk Distribution */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-700">High Risk</div>
                    <div className="text-2xl font-bold text-red-600">20.8%</div>
                    <div className="text-xs text-red-600">Coal, Oil & Gas</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-700">Medium Risk</div>
                    <div className="text-2xl font-bold text-yellow-600">37.8%</div>
                    <div className="text-xs text-yellow-600">Agriculture, Manufacturing</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-700">Low Risk</div>
                    <div className="text-2xl font-bold text-green-600">41.4%</div>
                    <div className="text-xs text-green-600">Renewables, Clean Tech</div>
                  </div>
                </div>
                
                {/* Detailed Sector Breakdown */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Sector Risk Assessment</h4>
                  <div className="space-y-3">
                    {sectorRiskData.map((sector, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getRiskColor(sector.riskLevel)} variant="secondary">
                            {sector.sector}
                          </Badge>
                          <span className="text-sm font-medium">{sector.exposure}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground">Transition Score:</div>
                          <div className="text-sm font-bold">{sector.transitionScore}/100</div>
                          <Progress value={sector.transitionScore} className="w-12 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Climate Scenario Selector */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Climate Scenario Analysis</h4>
                  <Select defaultValue="1.5c">
                    <SelectTrigger>
                      <SelectValue placeholder="Select climate scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.5c">1.5°C Pathway (Net Zero 2050)</SelectItem>
                      <SelectItem value="2c">2°C Pathway (Below 2°C)</SelectItem>
                      <SelectItem value="business">Business as Usual</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-700">1.5°C Scenario Impact</div>
                    <div className="text-xs text-blue-600 mt-1">
                      Portfolio at-risk value: $8.4M (13.7% of total)
                    </div>
                    <div className="text-xs text-blue-600">
                      Recommended action: Accelerate transition financing
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Data Configurator & Export
              </CardTitle>
              <CardDescription>Customize reporting parameters and export options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleConfigureData}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Emissions Factors / Reporting Logic
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export XLSX
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
                
                {/* Additional Export Options */}
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Download TCFD Report
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Export PCAF Compliance Pack
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Generate Executive Summary
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground text-center mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium mb-1">Institution-level Reporting Pack Includes:</div>
                  <div>• PCAF-aligned financed emissions data</div>
                  <div>• Transition risk assessments by sector</div>
                  <div>• Net-zero progress tracking & targets</div>
                  <div>• Climate scenario analysis results</div>
                  <div>• Regulatory compliance documentation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Footer Notice */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-dashed border-2 border-gray-300">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span className="text-lg font-semibold">Pro Feature Active</span>
              </div>
              <p className="text-muted-foreground">
                You have access to climate portfolio analytics. Contact Peercarbon support for additional features or enterprise deployment.
              </p>
              <Button variant="outline" className="mt-3">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};