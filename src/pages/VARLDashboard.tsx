import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Radio, 
  DollarSign, 
  AlertTriangle,
  Search,
  Filter,
  TrendingUp,
  Users,
  Settings,
  Download
} from 'lucide-react';
import { AssetReadinessTimeline } from '@/components/AssetReadinessTimeline';
import { VARLPortfolioMetrics } from '@/components/VARLPortfolioMetrics';
import { DeploymentDashboard } from '@/components/DeploymentDashboard';
import { MRVIntegrationPanel } from '@/components/MRVIntegrationPanel';

// Mock data for demonstration
const projectsData = [
  {
    id: 'PRJ-001',
    schoolName: 'Green Valley Primary',
    location: 'Kenya, Nakuru',
    assetType: 'Ecobox Cooking System',
    status: 'operational',
    progress: 100,
    orderDate: '2024-01-15',
    deploymentDate: '2024-02-20',
    verificationDate: '2024-03-01',
    mrvData: {
      operationalDays: 45,
      dailyUsageHours: 3.2,
      fuelSavings: '85%',
      co2Reduction: '2.1 tCO2e'
    },
    disbursementAmount: 15000,
    disbursementStatus: 'completed',
    partnerOEM: 'EcoTech Solutions',
    serialNumber: 'ECO-2024-001'
  },
  {
    id: 'PRJ-002',
    schoolName: 'Sunrise Academy',
    location: 'Tanzania, Arusha',
    assetType: 'Ecobox Cooking System',
    status: 'installed',
    progress: 80,
    orderDate: '2024-02-01',
    deploymentDate: '2024-03-10',
    verificationDate: null,
    mrvData: {
      operationalDays: 12,
      dailyUsageHours: 2.8,
      fuelSavings: '78%',
      co2Reduction: '0.8 tCO2e'
    },
    disbursementAmount: 18000,
    disbursementStatus: 'pending',
    partnerOEM: 'GreenCook Ltd',
    serialNumber: 'ECO-2024-002'
  },
  {
    id: 'PRJ-003',
    schoolName: 'Hope International School',
    location: 'Uganda, Kampala',
    assetType: 'Ecobox Cooking System',
    status: 'in-deployment',
    progress: 60,
    orderDate: '2024-02-15',
    deploymentDate: null,
    verificationDate: null,
    mrvData: null,
    disbursementAmount: 22000,
    disbursementStatus: 'held',
    partnerOEM: 'EcoTech Solutions',
    serialNumber: 'ECO-2024-003'
  }
];

const portfolioMetrics = {
  totalProjects: 847,
  totalAssets: 1234,
  assetsDeployed: 892,
  assetsOperational: 678,
  totalDisbursed: 12400000,
  pendingDisbursement: 3200000,
  averageDeploymentTime: 28,
  verificationRate: 94
};

export default function VARLDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<typeof projectsData[0] | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pre-approved': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'po-issued': return <Package className="h-4 w-4 text-purple-500" />;
      case 'in-deployment': return <Truck className="h-4 w-4 text-orange-500" />;
      case 'installed': return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'operational': return <Radio className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pre-approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'po-issued': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'in-deployment': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'installed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredProjects = projectsData.filter(project => {
    const matchesSearch = project.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">VARL Dashboard</h1>
              <p className="text-sm text-muted-foreground">Verified Asset Readiness Layer - Real-time deployment & disbursement tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="mrv">MRV Integration</TabsTrigger>
            <TabsTrigger value="partners">Partner Portal</TabsTrigger>
            <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <VARLPortfolioMetrics metrics={portfolioMetrics} />
            
            {/* Quick Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Asset Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search projects, schools, or locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pre-approved">Pre-approved</SelectItem>
                      <SelectItem value="po-issued">PO Issued</SelectItem>
                      <SelectItem value="in-deployment">In Deployment</SelectItem>
                      <SelectItem value="installed">Installed</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => (
                    <Card key={project.id} className="border border-border/50 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedProject(project)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-sm">{project.schoolName}</h3>
                            <p className="text-xs text-muted-foreground">{project.location}</p>
                          </div>
                          <Badge className={`text-xs px-2 py-1 ${getStatusColor(project.status)}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(project.status)}
                              {project.status.replace('-', ' ')}
                            </span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Deployment Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/30">
                          <span className="text-xs text-muted-foreground">
                            ${project.disbursementAmount.toLocaleString()}
                          </span>
                          <Badge variant={project.disbursementStatus === 'completed' ? 'default' : 
                                         project.disbursementStatus === 'pending' ? 'secondary' : 'outline'}
                                 className="text-xs">
                            {project.disbursementStatus}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <AssetReadinessTimeline projects={projectsData} />
          </TabsContent>

          <TabsContent value="mrv">
            <MRVIntegrationPanel projects={projectsData} />
          </TabsContent>

          <TabsContent value="partners">
            <DeploymentDashboard projects={projectsData} />
          </TabsContent>

          <TabsContent value="disbursements">
            <Card>
              <CardHeader>
                <CardTitle>Disbursement Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Disbursement management functionality will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
