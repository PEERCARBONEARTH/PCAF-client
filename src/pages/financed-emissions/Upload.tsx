import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CSVUploadInterface } from "@/components/CSVUploadInterface";
import { SampleDataManager } from "@/components/SampleDataManager";
import { CSVTemplateDownload } from "@/components/CSVTemplateDownload";
import { APIKeyManagement } from "@/components/APIKeyManagement";
import { DataIngestionWizard } from "@/components/data-ingestion/DataIngestionWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Database, Settings, CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import { enhancedUploadService, type UploadProgress, type UploadResult } from "@/services/enhancedUploadService";
import { realTimeService, type RealTimeUpdate } from "@/services/realTimeService";
import { integrationService } from "@/services/integrationService";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showWizard, setShowWizard] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [activeUploads, setActiveUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);

  useEffect(() => {
    // Simplified initialization - remove complex service calls that might be causing issues
    console.log('Upload page useEffect running');
    
    // Connect to real-time service for upload progress updates
    try {
      realTimeService.connect();
      
      const unsubscribe = realTimeService.subscribe('upload_progress', (update: RealTimeUpdate) => {
        if (update.data.jobId) {
          setActiveUploads(prev => {
            const newMap = new Map(prev);
            newMap.set(update.data.jobId, update.data);
            return newMap;
          });
        }
      });

      // Load upload history
      loadUploadHistory();
      
      // Load integration status
      loadIntegrationStatus();

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error in Upload page useEffect:', error);
    }
  }, []);

  const loadUploadHistory = async () => {
    try {
      const history = await enhancedUploadService.getUploadHistory(5);
      setUploadHistory(history);
    } catch (error) {
      console.error('Failed to load upload history:', error);
      // Set empty array to prevent blocking
      setUploadHistory([]);
    }
  };

  const loadIntegrationStatus = async () => {
    try {
      const status = await integrationService.getExternalServicesStatus();
      setIntegrationStatus(status);
    } catch (error) {
      console.error('Failed to load integration status:', error);
      // Set default status to prevent blocking
      setIntegrationStatus({
        lms: { connected: false },
        epa_api: { connected: false },
        vehicle_db: { connected: false },
        emission_factors_api: { connected: false }
      });
    }
  };

  const handleUploadProgress = (progress: UploadProgress) => {
    setActiveUploads(prev => {
      const newMap = new Map(prev);
      newMap.set(progress.jobId, progress);
      return newMap;
    });
  };

  const handleUploadComplete = (result: UploadResult) => {
    setActiveUploads(prev => {
      const newMap = new Map(prev);
      newMap.delete(result.jobId);
      return newMap;
    });
    
    loadUploadHistory(); // Refresh history
    
    if (result.success) {
      toast({
        title: "Upload Successful",
        description: `Processed ${result.summary.successful} of ${result.summary.totalProcessed} loans successfully.`,
      });
    }
  };

  const cancelUpload = async (uploadId: string) => {
    try {
      await enhancedUploadService.cancelUpload(uploadId);
      setActiveUploads(prev => {
        const newMap = new Map(prev);
        newMap.delete(uploadId);
        return newMap;
      });
    } catch (error) {
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel upload.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'calculating':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Upload className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  console.log('Upload page rendering');
  
  const handleWizardComplete = (data: any) => {
    console.log('Wizard completed with data:', data);
    setShowWizard(false);
    toast({
      title: "Data Ingestion Complete",
      description: "Your data has been processed with the configured methodology.",
    });
    // Navigate to overview or ledger to see results
    navigate('/financed-emissions/overview');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Ingestion</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Import your portfolio data with methodology validation and assumptions
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Uploads</p>
                <p className="text-2xl font-bold">{activeUploads.size}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Recent Uploads</p>
                <p className="text-2xl font-bold">{uploadHistory.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Validation Errors</p>
                <p className="text-2xl font-bold">{errorCount}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Methodology-First Data Ingestion Wizard */}
      {showWizard && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Methodology-First Data Ingestion
            </CardTitle>
            <p className="text-muted-foreground">
              Configure your PCAF methodology before uploading data for accurate calculations
            </p>
          </CardHeader>
          <CardContent>
            <DataIngestionWizard 
              onComplete={handleWizardComplete}
              className="w-full"
            />
          </CardContent>
        </Card>
      )}

      {/* Toggle between Wizard and Traditional Upload */}
      {!showWizard && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="font-medium">Traditional Upload Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Using legacy upload without methodology validation
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Use Methodology Wizard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Uploads Status */}
      {activeUploads.size > 0 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Active Uploads ({activeUploads.size})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Monitor your ongoing data uploads and processing status
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from(activeUploads.values()).map((upload) => (
              <Card key={upload.jobId} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(upload.status)}
                      <div>
                        <span className="font-medium">Upload {upload.jobId.slice(-8)}</span>
                        <Badge variant="outline" className="ml-2">{upload.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {upload.processedItems}/{upload.totalItems} items
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelUpload(upload.jobId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress value={upload.progress} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{upload.currentStep}</span>
                      {upload.estimatedTimeRemaining && (
                        <span>~{formatDuration(upload.estimatedTimeRemaining)} remaining</span>
                      )}
                    </div>
                  </div>
                  {upload.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {upload.errors.length} error(s) encountered during processing
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Data Capture Methods */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Data Import Methods</h2>
          <p className="text-muted-foreground mt-1">
            Choose your preferred method to import portfolio data
          </p>
        </div>
        
        <Tabs defaultValue="csv" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="csv" className="flex items-center gap-2 h-10">
              <FileText className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2 h-10">
              <Settings className="h-4 w-4" />
              System Integration
            </TabsTrigger>
            <TabsTrigger value="sample" className="flex items-center gap-2 h-10">
              <Database className="h-4 w-4" />
              Sample Data
            </TabsTrigger>
          </TabsList>
        
          {/* CSV Upload & Template */}
          <TabsContent value="csv" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* CSV Upload */}
              <div className="xl:col-span-3 space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload CSV Data
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Upload your portfolio data using our standardized CSV template
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CSVUploadInterface
                      onValidationSummaryChange={({ errors }) => setErrorCount(errors)}
                      onUploadProgress={handleUploadProgress}
                      onUploadComplete={handleUploadComplete}
                      enhancedMode={true}
                    />
                  </CardContent>
                </Card>

                {/* Upload History */}
                {uploadHistory.length > 0 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Recent Uploads
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={loadUploadHistory}>
                          Refresh History
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {uploadHistory.map((upload, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(upload.status)}
                                <div>
                                  <p className="font-medium">
                                    {new Date(upload.timestamp).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(upload.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-medium">
                                    {upload.successfulItems}/{upload.totalItems}
                                  </p>
                                  <p className="text-sm text-muted-foreground">successful</p>
                                </div>
                                <Badge variant={upload.status === 'completed' ? 'default' : 'destructive'}>
                                  {upload.status}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* CSV Template Download */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      CSV Template
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Download the standardized template for data uploads
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CSVTemplateDownload />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        
          {/* System Integration */}
          <TabsContent value="integration" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* API Integration */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    API Integration
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Configure API keys and external service connections
                  </p>
                </CardHeader>
                <CardContent>
                  <APIKeyManagement />
                </CardContent>
              </Card>

              {/* LMS Integration Status */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Integration Status
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Monitor external service connections and data feeds
                  </p>
                </CardHeader>
                <CardContent>
                  {integrationStatus ? (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">LMS Connection</span>
                          <Badge variant={integrationStatus.lms?.connected ? 'default' : 'destructive'}>
                            {integrationStatus.lms?.connected ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">EPA API</span>
                          <Badge variant={integrationStatus.epa_api?.connected ? 'default' : 'destructive'}>
                            {integrationStatus.epa_api?.connected ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">Vehicle Database</span>
                          <Badge variant={integrationStatus.vehicle_db?.connected ? 'default' : 'destructive'}>
                            {integrationStatus.vehicle_db?.connected ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">Emission Factors API</span>
                          <Badge variant={integrationStatus.emission_factors_api?.connected ? 'default' : 'destructive'}>
                            {integrationStatus.emission_factors_api?.connected ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t">
                        <Button 
                          onClick={() => integrationService.testExternalServices()}
                          className="w-full"
                        >
                          Test All Connections
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={loadIntegrationStatus}
                          className="w-full"
                        >
                          Refresh Status
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading integration status...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sample Data */}
          <TabsContent value="sample" className="space-y-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sample Data Management
                </CardTitle>
                <p className="text-muted-foreground">
                  Load demonstration data to explore the platform features and test workflows
                </p>
              </CardHeader>
              <CardContent>
                <SampleDataManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
