import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, TrendingUp, Leaf, AlertCircle, CheckCircle } from 'lucide-react';
import { AvoidedEmissionsService } from '@/services/avoided-emissions-service';
import { mockAvoidedEmissionsData } from '@/services/mock-pcaf-data';

interface AvoidedEmissionsPortfolioSummary {
  totalAvoidedEmissions: number;
  annualAvoidedEmissions: number;
  averageDataQuality: number;
  costOfAvoidance: number;
  projectCount: number;
  highConfidenceShare: number;
}

interface AvoidedEmissionsResult {
  projectId: string;
  projectName: string;
  projectType: string;
  annualAvoidedEmissions: number;
  lifetimeAvoidedEmissions: number;
  financedAvoidedEmissions: number;
  attributionFactor: number;
  dataQualityScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  methodology: string;
}

interface PCAFComplianceStatus {
  separationFromCredits: boolean;
  methodologyDocumented: boolean;
  baselineJustified: boolean;
  uncertaintyDisclosed: boolean;
  overallCompliance: number;
}

export const AvoidedEmissionsReporting: React.FC = () => {
  const [portfolioSummary, setPortfolioSummary] = useState<AvoidedEmissionsPortfolioSummary | null>(null);
  const [projectResults, setProjectResults] = useState<AvoidedEmissionsResult[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<PCAFComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvoidedEmissionsData();
  }, []);

  const loadAvoidedEmissionsData = async () => {
    setLoading(true);
    try {
      // Try to load from API, fallback to mock data
      try {
        const summaryData = await AvoidedEmissionsService.getPortfolioSummary();
        setPortfolioSummary(summaryData);

        const resultsData = await AvoidedEmissionsService.getProjectResults();
        setProjectResults(resultsData);

        const complianceData = await AvoidedEmissionsService.getPCAFComplianceStatus();
        setComplianceStatus(complianceData);
      } catch (apiError) {
        console.log('API not available, using mock data for development');
        // Use mock data for development
        setPortfolioSummary(mockAvoidedEmissionsData.portfolioSummary);
        setProjectResults(mockAvoidedEmissionsData.projectResults);
        setComplianceStatus(mockAvoidedEmissionsData.complianceStatus);
      }
    } catch (error) {
      console.error('Failed to load avoided emissions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePCAFReport = async () => {
    try {
      const blob = await AvoidedEmissionsService.generatePCAFReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PCAF_Avoided_Emissions_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to generate PCAF report:', error);
    }
  };

  const exportToExcel = async () => {
    try {
      const blob = await AvoidedEmissionsService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Avoided_Emissions_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export to Excel:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading avoided emissions data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      {portfolioSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Portfolio Avoided Emissions Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {portfolioSummary.totalAvoidedEmissions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">tCO2e</div>
                <div className="text-xs text-gray-500">Total Avoided</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {portfolioSummary.annualAvoidedEmissions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">tCO2e/year</div>
                <div className="text-xs text-gray-500">Annual Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {portfolioSummary.averageDataQuality.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">/5.0</div>
                <div className="text-xs text-gray-500">Avg Quality</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${portfolioSummary.costOfAvoidance.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">per tCO2e</div>
                <div className="text-xs text-gray-500">Cost of Avoidance</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {portfolioSummary.projectCount}
                </div>
                <div className="text-sm text-gray-600">projects</div>
                <div className="text-xs text-gray-500">Total Projects</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {(portfolioSummary.highConfidenceShare * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">high conf.</div>
                <div className="text-xs text-gray-500">High Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PCAF Compliance Status */}
      {complianceStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              PCAF Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className={`flex items-center gap-2 ${complianceStatus.separationFromCredits ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${complianceStatus.separationFromCredits ? 'bg-green-600' : 'bg-red-600'}`} />
                <span className="text-sm">Credit Separation</span>
              </div>
              
              <div className={`flex items-center gap-2 ${complianceStatus.methodologyDocumented ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${complianceStatus.methodologyDocumented ? 'bg-green-600' : 'bg-red-600'}`} />
                <span className="text-sm">Methodology Docs</span>
              </div>
              
              <div className={`flex items-center gap-2 ${complianceStatus.baselineJustified ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${complianceStatus.baselineJustified ? 'bg-green-600' : 'bg-red-600'}`} />
                <span className="text-sm">Baseline Justified</span>
              </div>
              
              <div className={`flex items-center gap-2 ${complianceStatus.uncertaintyDisclosed ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${complianceStatus.uncertaintyDisclosed ? 'bg-green-600' : 'bg-red-600'}`} />
                <span className="text-sm">Uncertainty Disclosed</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant={complianceStatus.overallCompliance >= 90 ? 'default' : complianceStatus.overallCompliance >= 70 ? 'secondary' : 'destructive'}>
                {complianceStatus.overallCompliance}% PCAF Compliant
              </Badge>
              
              <div className="flex gap-2">
                <Button onClick={generatePCAFReport} variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PCAF Report
                </Button>
                
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Project-Level Avoided Emissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="summary">Summary View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Annual Avoided (tCO2e)</TableHead>
                    <TableHead>Financed Avoided (tCO2e)</TableHead>
                    <TableHead>Attribution %</TableHead>
                    <TableHead>Data Quality</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Methodology</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectResults.map((project) => (
                    <TableRow key={project.projectId}>
                      <TableCell className="font-medium">{project.projectName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.projectType}</Badge>
                      </TableCell>
                      <TableCell>{project.annualAvoidedEmissions.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {project.financedAvoidedEmissions.toLocaleString()}
                      </TableCell>
                      <TableCell>{(project.attributionFactor * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={project.dataQualityScore >= 4 ? 'default' : project.dataQualityScore >= 3 ? 'secondary' : 'destructive'}>
                          {project.dataQualityScore}/5
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={project.confidenceLevel === 'high' ? 'default' : project.confidenceLevel === 'medium' ? 'secondary' : 'destructive'}>
                          {project.confidenceLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{project.methodology}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectResults.map((project) => (
                  <Card key={project.projectId}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{project.projectName}</CardTitle>
                      <Badge variant="outline" className="w-fit">{project.projectType}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Financed Avoided:</span>
                          <span className="font-semibold text-green-600">
                            {project.financedAvoidedEmissions.toLocaleString()} tCO2e
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Attribution:</span>
                          <span className="font-medium">
                            {(project.attributionFactor * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Data Quality:</span>
                          <Badge variant={project.dataQualityScore >= 4 ? 'default' : project.dataQualityScore >= 3 ? 'secondary' : 'destructive'}>
                            {project.dataQualityScore}/5
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <Badge variant={project.confidenceLevel === 'high' ? 'default' : project.confidenceLevel === 'medium' ? 'secondary' : 'destructive'}>
                            {project.confidenceLevel}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};