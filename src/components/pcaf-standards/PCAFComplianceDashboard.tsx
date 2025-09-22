import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Leaf, 
  Building, 
  Factory, 
  Zap,
  FileText,
  Download,
  BarChart3
} from 'lucide-react';
import { apiClient } from '@/services/api';
import { mockComplianceData } from '@/services/mock-pcaf-data';

interface PCAFComplianceOverview {
  overallCompliance: number;
  methodologyImplementation: {
    motorVehicles: number;
    multiAssetClass: number;
    avoidedEmissions: number;
    dataQuality: number;
    attribution: number;
  };
  standardsCoverage: {
    standardA: { implemented: boolean; assetClasses: string[]; coverage: number };
    standardB: { implemented: boolean; assetClasses: string[]; coverage: number };
    standardC: { implemented: boolean; assetClasses: string[]; coverage: number };
  };
  dataQualityMetrics: {
    averageScore: number;
    distribution: { [level: number]: number };
    improvementOpportunities: string[];
  };
  avoidedEmissionsStatus: {
    implemented: boolean;
    projectTypes: string[];
    totalAvoidedEmissions: number;
    pcafCompliant: boolean;
  };
}

export const PCAFComplianceDashboard: React.FC = () => {
  const [complianceData, setComplianceData] = useState<PCAFComplianceOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      try {
        const response = await apiClient.getPCAFComplianceOverview();
        setComplianceData(response.data);
      } catch (apiError) {
        console.log('API not available, using mock data for development');
        // Use mock data for development
        setComplianceData(mockComplianceData);
      }
    } catch (error) {
      console.error('Failed to load PCAF compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async () => {
    try {
      const blob = await apiClient.generatePCAFComplianceReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PCAF_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
    }
  };

  const getComplianceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading PCAF compliance data...</div>;
  }

  if (!complianceData) {
    return <div className="text-center text-gray-500">No compliance data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Compliance Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              PCAF Compliance Dashboard
            </div>
            <div className="flex gap-2">
              <Button onClick={generateComplianceReport} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button onClick={loadComplianceData} variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getComplianceColor(complianceData.overallCompliance)}`}>
                {complianceData.overallCompliance}%
              </div>
              <div className="text-lg text-gray-600 mb-2">Overall PCAF Compliance</div>
              <Badge variant={getComplianceBadgeVariant(complianceData.overallCompliance)} className="text-sm">
                {complianceData.overallCompliance >= 90 ? 'Excellent' : 
                 complianceData.overallCompliance >= 70 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {complianceData.methodologyImplementation.motorVehicles}%
              </div>
              <div className="text-sm text-gray-600">Motor Vehicles</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {complianceData.methodologyImplementation.multiAssetClass}%
              </div>
              <div className="text-sm text-gray-600">Multi-Asset Class</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {complianceData.methodologyImplementation.avoidedEmissions}%
              </div>
              <div className="text-sm text-gray-600">Avoided Emissions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {complianceData.methodologyImplementation.dataQuality}%
              </div>
              <div className="text-sm text-gray-600">Data Quality</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {complianceData.methodologyImplementation.attribution}%
              </div>
              <div className="text-sm text-gray-600">Attribution</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="standards">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="standards">Attribution Standards</TabsTrigger>
          <TabsTrigger value="avoided">Avoided Emissions</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Attribution Standards Tab */}
        <TabsContent value="standards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard A */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Standard A
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Implementation:</span>
                    <Badge variant={complianceData.standardsCoverage.standardA.implemented ? 'default' : 'destructive'}>
                      {complianceData.standardsCoverage.standardA.implemented ? 'Implemented' : 'Not Implemented'}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Coverage:</span>
                      <span className="text-sm font-medium">
                        {complianceData.standardsCoverage.standardA.coverage}%
                      </span>
                    </div>
                    <Progress value={complianceData.standardsCoverage.standardA.coverage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Asset Classes:</div>
                    <div className="space-y-1">
                      {complianceData.standardsCoverage.standardA.assetClasses.map((assetClass) => (
                        <Badge key={assetClass} variant="outline" className="text-xs">
                          {assetClass}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Enterprise Value-Based Attribution
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Standard B */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-green-600" />
                  Standard B
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Implementation:</span>
                    <Badge variant={complianceData.standardsCoverage.standardB.implemented ? 'default' : 'destructive'}>
                      {complianceData.standardsCoverage.standardB.implemented ? 'Implemented' : 'Not Implemented'}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Coverage:</span>
                      <span className="text-sm font-medium">
                        {complianceData.standardsCoverage.standardB.coverage}%
                      </span>
                    </div>
                    <Progress value={complianceData.standardsCoverage.standardB.coverage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Asset Classes:</div>
                    <div className="flex flex-wrap gap-1">
                      {complianceData.standardsCoverage.standardB.assetClasses.map((assetClass) => (
                        <Badge key={assetClass} variant="outline" className="text-xs">
                          {assetClass}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Outstanding Amount-Based Attribution
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Standard C */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Standard C
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Implementation:</span>
                    <Badge variant={complianceData.standardsCoverage.standardC.implemented ? 'default' : 'destructive'}>
                      {complianceData.standardsCoverage.standardC.implemented ? 'Implemented' : 'Not Implemented'}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Coverage:</span>
                      <span className="text-sm font-medium">
                        {complianceData.standardsCoverage.standardC.coverage}%
                      </span>
                    </div>
                    <Progress value={complianceData.standardsCoverage.standardC.coverage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Asset Classes:</div>
                    <div className="space-y-1">
                      {complianceData.standardsCoverage.standardC.assetClasses.map((assetClass) => (
                        <Badge key={assetClass} variant="outline" className="text-xs">
                          {assetClass}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Committed Amount-Based Attribution
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Avoided Emissions Tab */}
        <TabsContent value="avoided">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Avoided Emissions Implementation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Implementation Status:</span>
                      <Badge variant={complianceData.avoidedEmissionsStatus.implemented ? 'default' : 'destructive'}>
                        {complianceData.avoidedEmissionsStatus.implemented ? 'Implemented' : 'Not Implemented'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">PCAF Compliant:</span>
                      <Badge variant={complianceData.avoidedEmissionsStatus.pcafCompliant ? 'default' : 'destructive'}>
                        {complianceData.avoidedEmissionsStatus.pcafCompliant ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Total Avoided Emissions:</div>
                      <div className="text-2xl font-bold text-green-600">
                        {complianceData.avoidedEmissionsStatus.totalAvoidedEmissions.toLocaleString()} tCO2e
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-2">Supported Project Types:</div>
                  <div className="space-y-2">
                    {complianceData.avoidedEmissionsStatus.projectTypes.map((projectType) => (
                      <div key={projectType} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{projectType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Data Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {complianceData.dataQualityMetrics.averageScore.toFixed(1)}/5.0
                    </div>
                    <div className="text-sm text-gray-600">Average Data Quality Score</div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(complianceData.dataQualityMetrics.distribution).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <span className="text-sm">Level {level}:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / Math.max(...Object.values(complianceData.dataQualityMetrics.distribution))) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-3">Improvement Opportunities:</div>
                  <div className="space-y-2">
                    {complianceData.dataQualityMetrics.improvementOpportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{opportunity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                PCAF Compliance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData.overallCompliance < 100 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-800">Priority Actions</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-yellow-700">
                      {!complianceData.avoidedEmissionsStatus.implemented && (
                        <li>• Complete avoided emissions implementation for full PCAF Section 5.8 compliance</li>
                      )}
                      {complianceData.dataQualityMetrics.averageScore < 3.5 && (
                        <li>• Improve data quality by collecting more specific and verified data</li>
                      )}
                      {!complianceData.standardsCoverage.standardA.implemented && (
                        <li>• Implement Standard A attribution for listed equity and corporate bonds</li>
                      )}
                      {!complianceData.standardsCoverage.standardC.implemented && (
                        <li>• Implement Standard C attribution for project finance assets</li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Strengths</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Comprehensive motor vehicle methodology implementation</li>
                    <li>• Multi-asset class attribution support</li>
                    <li>• Professional data quality framework</li>
                    <li>• Complete audit trail and transparency</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Enhancement Opportunities</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Integrate additional emission factor databases</li>
                    <li>• Implement automated data quality monitoring</li>
                    <li>• Add support for additional project types in avoided emissions</li>
                    <li>• Enhance real-time portfolio monitoring capabilities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};