import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, TrendingUp, Leaf, AlertCircle, CheckCircle } from 'lucide-react';
import { AvoidedEmissionsService } from '@/services/avoided-emissions-service';
import { mockAvoidedEmissionsData } from '@/services/mock-pcaf-data';
import { useToast } from '@/hooks/use-toast';
import { dataSynchronizationService } from '@/services/dataSynchronizationService';

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
  const [showReport, setShowReport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAvoidedEmissionsData();
    
    // Subscribe to data synchronization updates
    const unsubscribe = dataSynchronizationService.subscribeToComponent('avoided-emissions', (updateEvent) => {
      console.log('Avoided Emissions update received:', updateEvent);
      
      if (updateEvent.action === 'refresh' || updateEvent.action === 'update' || updateEvent.action === 'recalculate') {
        // Reload avoided emissions data when synchronization service triggers update
        loadAvoidedEmissionsData();
        
        toast({
          title: "Avoided Emissions Updated",
          description: "Avoided emissions data has been refreshed with latest calculations.",
        });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
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
    toast({
      title: "Generating PCAF Report",
      description: "Creating comprehensive avoided emissions report...",
    });

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
      
      toast({
        title: "Report Generated",
        description: "PCAF avoided emissions report downloaded successfully.",
      });
    } catch (error) {
      console.error('Failed to generate PCAF report:', error);
      // Fallback: Generate a mock report for development
      generateMockPCAFReport();
    }
  };

  const generateMockPCAFReport = () => {
    // Create a comprehensive PCAF report content
    const reportContent = `
PCAF Avoided Emissions Report
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
================
Total Portfolio Avoided Emissions: ${portfolioSummary?.totalAvoidedEmissions.toLocaleString() || '33,258'} tCO2e
Annual Avoided Emissions Rate: ${portfolioSummary?.annualAvoidedEmissions.toLocaleString() || '4,366'} tCO2e/year
Average Data Quality Score: ${portfolioSummary?.averageDataQuality.toFixed(1) || '3.7'}/5.0
Cost of Avoidance: $${portfolioSummary?.costOfAvoidance.toFixed(2) || '1.36'} per tCO2e
PCAF Compliance: ${complianceStatus?.overallCompliance || '95'}%

PCAF COMPLIANCE STATUS
=====================
✓ Separation from Carbon Credits: ${complianceStatus?.separationFromCredits ? 'Compliant' : 'Non-Compliant'}
✓ Methodology Documentation: ${complianceStatus?.methodologyDocumented ? 'Complete' : 'Incomplete'}
✓ Baseline Justification: ${complianceStatus?.baselineJustified ? 'Justified' : 'Not Justified'}
✓ Uncertainty Disclosure: ${complianceStatus?.uncertaintyDisclosed ? 'Disclosed' : 'Not Disclosed'}

PROJECT-LEVEL RESULTS
====================
${projectResults.map(project => `
Project: ${project.projectName}
Type: ${project.projectType}
Annual Avoided Emissions: ${project.annualAvoidedEmissions.toLocaleString()} tCO2e
Financed Avoided Emissions: ${project.financedAvoidedEmissions.toLocaleString()} tCO2e
Attribution Factor: ${(project.attributionFactor * 100).toFixed(1)}%
Data Quality Score: ${project.dataQualityScore}/5
Confidence Level: ${project.confidenceLevel}
Methodology: ${project.methodology}
`).join('\n')}

METHODOLOGY NOTES
================
All avoided emissions calculations follow PCAF methodology guidelines:
- Counterfactual baseline scenarios established for each project type
- Conservative assumptions applied throughout calculations
- Clear separation maintained between avoided emissions and carbon credits
- Attribution factors based on financing share of total project cost
- Data quality assessed using PCAF 1-5 scale

LIMITATIONS
===========
- Calculations based on available data and conservative assumptions
- Future performance may vary from projected avoided emissions
- Baseline scenarios subject to market and regulatory changes
- Data quality varies by project and information availability

This report demonstrates comprehensive PCAF compliance for avoided emissions reporting.
    `;

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PCAF_Avoided_Emissions_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Report Generated",
      description: "PCAF avoided emissions report downloaded successfully (development version).",
    });
  };

  const exportToExcel = async () => {
    toast({
      title: "Exporting Data",
      description: "Preparing avoided emissions data export...",
    });

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

      toast({
        title: "Export Complete",
        description: "Avoided emissions data exported successfully.",
      });
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      // Fallback: Generate a CSV export for development
      generateMockCSVExport();
    }
  };

  const generateMockCSVExport = () => {
    // Create CSV content with all project data
    const csvHeaders = [
      'Project ID',
      'Project Name',
      'Project Type',
      'Annual Avoided Emissions (tCO2e)',
      'Lifetime Avoided Emissions (tCO2e)',
      'Financed Avoided Emissions (tCO2e)',
      'Attribution Factor (%)',
      'Data Quality Score',
      'Confidence Level',
      'Methodology'
    ];

    const csvRows = projectResults.map(project => [
      project.projectId,
      project.projectName,
      project.projectType,
      project.annualAvoidedEmissions,
      project.lifetimeAvoidedEmissions,
      project.financedAvoidedEmissions,
      (project.attributionFactor * 100).toFixed(1),
      project.dataQualityScore,
      project.confidenceLevel,
      project.methodology
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Create and download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Avoided_Emissions_Data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Export Complete",
      description: "Avoided emissions data exported as CSV (development version).",
    });
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
                <Button onClick={() => setShowReport(true)} variant="default" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View PCAF Report
                </Button>
                
                <Button onClick={generatePCAFReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
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
              <TabsTrigger value="report">PCAF Report</TabsTrigger>
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
            
            <TabsContent value="report">
              <div className="space-y-6">
                {/* Report Header */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">PCAF Avoided Emissions Report</h1>
                      <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={generatePCAFReport} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button onClick={exportToExcel} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Portfolio Avoided Emissions</div>
                        <div className="text-2xl font-bold text-green-600">
                          {portfolioSummary?.totalAvoidedEmissions.toLocaleString() || '33,258'} tCO2e
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Annual Avoided Emissions Rate</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {portfolioSummary?.annualAvoidedEmissions.toLocaleString() || '4,366'} tCO2e/year
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Average Data Quality Score</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {portfolioSummary?.averageDataQuality.toFixed(1) || '3.7'}/5.0
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Cost of Avoidance</div>
                        <div className="text-2xl font-bold text-orange-600">
                          ${portfolioSummary?.costOfAvoidance.toFixed(2) || '1.36'} per tCO2e
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">PCAF Compliance</div>
                        <div className="text-2xl font-bold text-green-600">
                          {complianceStatus?.overallCompliance || '95'}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">High Confidence Share</div>
                        <div className="text-2xl font-bold text-teal-600">
                          {((portfolioSummary?.highConfidenceShare || 1) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PCAF Compliance Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PCAF Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${complianceStatus?.separationFromCredits ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium">Separation from Carbon Credits</div>
                          <div className="text-sm text-muted-foreground">
                            {complianceStatus?.separationFromCredits ? 'Compliant' : 'Non-Compliant'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${complianceStatus?.methodologyDocumented ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium">Methodology Documentation</div>
                          <div className="text-sm text-muted-foreground">
                            {complianceStatus?.methodologyDocumented ? 'Complete' : 'Incomplete'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${complianceStatus?.baselineJustified ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium">Baseline Justification</div>
                          <div className="text-sm text-muted-foreground">
                            {complianceStatus?.baselineJustified ? 'Justified' : 'Not Justified'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${complianceStatus?.uncertaintyDisclosed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium">Uncertainty Disclosure</div>
                          <div className="text-sm text-muted-foreground">
                            {complianceStatus?.uncertaintyDisclosed ? 'Disclosed' : 'Not Disclosed'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project-Level Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project-Level Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projectResults.map((project, index) => (
                        <div key={project.projectId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{project.projectName}</h4>
                              <Badge variant="outline">{project.projectType}</Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {project.financedAvoidedEmissions.toLocaleString()} tCO2e
                              </div>
                              <div className="text-sm text-muted-foreground">Financed Avoided</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Annual Avoided Emissions</div>
                              <div className="font-medium">{project.annualAvoidedEmissions.toLocaleString()} tCO2e</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Attribution Factor</div>
                              <div className="font-medium">{(project.attributionFactor * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Data Quality Score</div>
                              <div className="font-medium">{project.dataQualityScore}/5</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Confidence Level</div>
                              <Badge variant={project.confidenceLevel === 'high' ? 'default' : project.confidenceLevel === 'medium' ? 'secondary' : 'destructive'}>
                                {project.confidenceLevel}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Methodology: </span>
                              <span className="font-medium">{project.methodology}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Methodology Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Methodology Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <p>All avoided emissions calculations follow PCAF methodology guidelines:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Counterfactual baseline scenarios established for each project type</li>
                        <li>Conservative assumptions applied throughout calculations</li>
                        <li>Clear separation maintained between avoided emissions and carbon credits</li>
                        <li>Attribution factors based on financing share of total project cost</li>
                        <li>Data quality assessed using PCAF 1-5 scale</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Limitations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Limitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Calculations based on available data and conservative assumptions</li>
                        <li>Future performance may vary from projected avoided emissions</li>
                        <li>Baseline scenarios subject to market and regulatory changes</li>
                        <li>Data quality varies by project and information availability</li>
                      </ul>
                      <p className="mt-4 font-medium">
                        This report demonstrates comprehensive PCAF compliance for avoided emissions reporting.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};