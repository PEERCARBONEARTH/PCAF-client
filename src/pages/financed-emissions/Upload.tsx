import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CSVUploadInterface } from "@/components/CSVUploadInterface";
import { SampleDataManager } from "@/components/SampleDataManager";
import { CSVTemplateDownload } from "@/components/CSVTemplateDownload";
import { APIKeyManagement } from "@/components/APIKeyManagement";
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
  
  return (
    <div className="space-y-6">
      {/* Active Uploads Status */}
      {activeUploads.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Active Uploads ({activeUploads.size})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from(activeUploads.values()).map((upload) => (
              <div key={upload.jobId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(upload.status)}
                    <span className="font-medium">Upload {upload.jobId.slice(-8)}</span>
                    <Badge variant="outline">{upload.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {upload.processedItems}/{upload.totalItems}
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
                <div className="space-y-1">
                  <Progress value={upload.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
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
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Data Capture Methods */}
      <Tabs defaultValue="csv" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Integration
          </TabsTrigger>
          <TabsTrigger value="sample" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sample Data
          </TabsTrigger>
        </TabsList>
        
        {/* CSV Upload & Template */}
        <TabsContent value="csv">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CSV Upload */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload CSV Data
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
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
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Uploads</CardTitle>
                      <Button variant="outline" size="sm" onClick={loadUploadHistory}>
                        Refresh History
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {uploadHistory.map((upload, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(upload.status)}
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(upload.timestamp).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(upload.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {upload.successfulItems}/{upload.totalItems}
                              </p>
                              <p className="text-xs text-muted-foreground">successful</p>
                            </div>
                            <Badge variant={upload.status === 'completed' ? 'default' : 'destructive'}>
                              {upload.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* CSV Template Download */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    CSV Template
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
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
        <TabsContent value="integration">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  API Integration
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure API keys and external service connections
                </p>
              </CardHeader>
              <CardContent>
                <APIKeyManagement />
              </CardContent>
            </Card>

            {/* LMS Integration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  LMS Integration Status
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Monitor external service connections and data feeds
                </p>
              </CardHeader>
              <CardContent>
                {integrationStatus ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">LMS Connection</span>
                        <Badge variant={integrationStatus.lms?.connected ? 'default' : 'destructive'}>
                          {integrationStatus.lms?.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">EPA API</span>
                        <Badge variant={integrationStatus.epa_api?.connected ? 'default' : 'destructive'}>
                          {integrationStatus.epa_api?.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Vehicle Database</span>
                        <Badge variant={integrationStatus.vehicle_db?.connected ? 'default' : 'destructive'}>
                          {integrationStatus.vehicle_db?.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Emission Factors API</span>
                        <Badge variant={integrationStatus.emission_factors_api?.connected ? 'default' : 'destructive'}>
                          {integrationStatus.emission_factors_api?.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t">
                      <Button 
                        onClick={() => integrationService.testExternalServices()}
                        className="w-full"
                        size="sm"
                      >
                        Test All Connections
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={loadIntegrationStatus}
                        className="w-full"
                        size="sm"
                      >
                        Refresh Status
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading integration status...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sample Data */}
        <TabsContent value="sample">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Sample Data Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Load demonstration data to explore the platform features
              </p>
            </CardHeader>
            <CardContent>
              <SampleDataManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
