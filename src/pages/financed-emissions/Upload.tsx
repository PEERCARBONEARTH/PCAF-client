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
  const [activeTab, setActiveTab] = useState<"csv" | "integration">("csv");
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

  console.log('Upload page rendering, activeTab:', activeTab);
  
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CSV Management
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Integration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv">
          <Card>
            <CardHeader>
              <CardTitle>CSV Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">Upload CSV</TabsTrigger>
                  <TabsTrigger value="template">Download Template</TabsTrigger>
                  <TabsTrigger value="sample">Sample Data</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Upload your loan portfolio data using our CSV template
                      </p>
                      {uploadHistory.length > 0 && (
                        <Button variant="outline" size="sm" onClick={loadUploadHistory}>
                          Refresh History
                        </Button>
                      )}
                    </div>
                    
                    <CSVUploadInterface
                      onValidationSummaryChange={({ errors }) => setErrorCount(errors)}
                      onUploadProgress={handleUploadProgress}
                      onUploadComplete={handleUploadComplete}
                      enhancedMode={true}
                    />

                    {/* Upload History */}
                    {uploadHistory.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Uploads</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {uploadHistory.map((upload, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(upload.status)}
                                  <span className="text-sm">
                                    {new Date(upload.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{upload.successfulItems}/{upload.totalItems} successful</span>
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
                </TabsContent>

                <TabsContent value="template">
                  <CSVTemplateDownload />
                </TabsContent>

                <TabsContent value="sample">
                  <SampleDataManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>System Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="api" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="api">API Integration</TabsTrigger>
                  <TabsTrigger value="lms">LMS Integration</TabsTrigger>
                </TabsList>

                <TabsContent value="api">
                  <APIKeyManagement />
                </TabsContent>

                <TabsContent value="lms">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>LMS Integration Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {integrationStatus ? (
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span>LMS Connection</span>
                                <Badge variant={integrationStatus.lms?.connected ? 'default' : 'destructive'}>
                                  {integrationStatus.lms?.connected ? 'Connected' : 'Disconnected'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>EPA API</span>
                                <Badge variant={integrationStatus.epa_api?.connected ? 'default' : 'destructive'}>
                                  {integrationStatus.epa_api?.connected ? 'Connected' : 'Disconnected'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Vehicle Database</span>
                                <Badge variant={integrationStatus.vehicle_db?.connected ? 'default' : 'destructive'}>
                                  {integrationStatus.vehicle_db?.connected ? 'Connected' : 'Disconnected'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Emission Factors API</span>
                                <Badge variant={integrationStatus.emission_factors_api?.connected ? 'default' : 'destructive'}>
                                  {integrationStatus.emission_factors_api?.connected ? 'Connected' : 'Disconnected'}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
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
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">Loading integration status...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
