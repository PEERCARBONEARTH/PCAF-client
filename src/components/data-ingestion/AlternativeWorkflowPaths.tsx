import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  Database,
  FileText,
  Settings,
  Cloud,
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';

interface WorkflowPath {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  availability: 'always' | 'offline' | 'degraded' | 'emergency';
  reliability: 'high' | 'medium' | 'low';
  features: string[];
  limitations: string[];
  estimatedTime: number;
  dataAccuracy: 'full' | 'partial' | 'simulated';
  onSelect: () => Promise<void>;
}

interface AlternativeWorkflowPathsProps {
  currentError?: Error;
  failedStep?: string;
  onPathSelected?: (pathId: string) => void;
  className?: string;
}

export function AlternativeWorkflowPaths({
  currentError,
  failedStep,
  onPathSelected,
  className = '',
}: AlternativeWorkflowPathsProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);

  // Define alternative workflow paths based on the type of failure
  const getAlternativePaths = (): WorkflowPath[] => {
    const basePaths: WorkflowPath[] = [
      {
        id: 'mock_data_mode',
        title: 'Demo Mode with Mock Data',
        description: 'Continue with realistic simulated data while services are unavailable',
        icon: Database,
        availability: 'always',
        reliability: 'high',
        features: [
          'Complete workflow simulation',
          'Realistic data patterns',
          'Full UI functionality',
          'Progress tracking',
        ],
        limitations: [
          'Data is not real',
          'Cannot save to production',
          'Limited to demo scenarios',
        ],
        estimatedTime: 30000, // 30 seconds
        dataAccuracy: 'simulated',
        onSelect: async () => {
          console.log('Enabling mock data mode...');
          // Implementation would enable mock services
        },
      },
      {
        id: 'offline_mode',
        title: 'Offline Processing',
        description: 'Process data locally without server connectivity',
        icon: HardDrive,
        availability: 'offline',
        reliability: 'medium',
        features: [
          'Local data processing',
          'Client-side validation',
          'Cached calculations',
          'Resume when online',
        ],
        limitations: [
          'Limited validation rules',
          'No real-time updates',
          'Reduced accuracy',
          'Manual sync required',
        ],
        estimatedTime: 120000, // 2 minutes
        dataAccuracy: 'partial',
        onSelect: async () => {
          console.log('Enabling offline mode...');
          // Implementation would switch to offline processing
        },
      },
      {
        id: 'simplified_workflow',
        title: 'Simplified Workflow',
        description: 'Skip optional steps and use basic validation',
        icon: Zap,
        availability: 'degraded',
        reliability: 'medium',
        features: [
          'Essential steps only',
          'Basic validation',
          'Faster processing',
          'Core functionality',
        ],
        limitations: [
          'Reduced data quality checks',
          'Limited methodology options',
          'Basic error handling',
          'May need manual review',
        ],
        estimatedTime: 45000, // 45 seconds
        dataAccuracy: 'partial',
        onSelect: async () => {
          console.log('Enabling simplified workflow...');
          // Implementation would skip non-essential steps
        },
      },
      {
        id: 'manual_override',
        title: 'Manual Override Mode',
        description: 'Bypass automated processes with manual data entry',
        icon: Settings,
        availability: 'emergency',
        reliability: 'low',
        features: [
          'Manual data entry',
          'Custom calculations',
          'Flexible validation',
          'Expert mode',
        ],
        limitations: [
          'Requires expertise',
          'Time-intensive',
          'Error-prone',
          'No automation',
        ],
        estimatedTime: 600000, // 10 minutes
        dataAccuracy: 'full',
        onSelect: async () => {
          console.log('Enabling manual override mode...');
          // Implementation would provide manual entry forms
        },
      },
      {
        id: 'cached_results',
        title: 'Use Cached Results',
        description: 'Continue with previously calculated results',
        icon: Clock,
        availability: 'degraded',
        reliability: 'high',
        features: [
          'Previously validated data',
          'Fast completion',
          'Known good results',
          'Immediate progress',
        ],
        limitations: [
          'Data may be outdated',
          'Limited to cached scenarios',
          'No new calculations',
          'Reduced flexibility',
        ],
        estimatedTime: 5000, // 5 seconds
        dataAccuracy: 'partial',
        onSelect: async () => {
          console.log('Using cached results...');
          // Implementation would load cached data
        },
      },
      {
        id: 'export_import',
        title: 'Export/Import Workflow',
        description: 'Export data for external processing and re-import results',
        icon: Download,
        availability: 'always',
        reliability: 'medium',
        features: [
          'External processing',
          'Full data export',
          'Flexible tools',
          'Custom workflows',
        ],
        limitations: [
          'Manual process',
          'Requires external tools',
          'Data format constraints',
          'Security considerations',
        ],
        estimatedTime: 300000, // 5 minutes
        dataAccuracy: 'full',
        onSelect: async () => {
          console.log('Starting export/import workflow...');
          // Implementation would generate export files
        },
      },
    ];

    // Filter paths based on current error type and context
    if (currentError) {
      const errorMessage = currentError.message.toLowerCase();
      
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        return basePaths.filter(path => 
          ['mock_data_mode', 'offline_mode', 'cached_results', 'export_import'].includes(path.id)
        );
      }
      
      if (errorMessage.includes('service') || errorMessage.includes('api')) {
        return basePaths.filter(path => 
          ['mock_data_mode', 'simplified_workflow', 'manual_override', 'cached_results'].includes(path.id)
        );
      }
      
      if (errorMessage.includes('validation') || errorMessage.includes('data')) {
        return basePaths.filter(path => 
          ['simplified_workflow', 'manual_override', 'export_import'].includes(path.id)
        );
      }
    }

    return basePaths;
  };

  const alternativePaths = getAlternativePaths();

  const getAvailabilityColor = (availability: WorkflowPath['availability']) => {
    switch (availability) {
      case 'always':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'offline':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'degraded':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'emergency':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getReliabilityColor = (reliability: WorkflowPath['reliability']) => {
    switch (reliability) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDataAccuracyIcon = (accuracy: WorkflowPath['dataAccuracy']) => {
    switch (accuracy) {
      case 'full':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'simulated':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  };

  const executeWorkflowPath = async (path: WorkflowPath) => {
    setSelectedPath(path.id);
    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, path.estimatedTime / 10);

      // Execute the path
      await path.onSelect();

      // Complete progress
      clearInterval(progressInterval);
      setExecutionProgress(100);

      // Notify parent component
      onPathSelected?.(path.id);

      setTimeout(() => {
        setIsExecuting(false);
        setSelectedPath(null);
        setExecutionProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Workflow path execution failed:', error);
      setIsExecuting(false);
      setSelectedPath(null);
      setExecutionProgress(0);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Alternative Workflow Paths</h2>
        <p className="text-muted-foreground">
          Choose an alternative approach to continue your data ingestion workflow
        </p>
      </div>

      {/* Current Error Context */}
      {currentError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div><strong>Current Issue:</strong> {currentError.message}</div>
              {failedStep && <div><strong>Failed Step:</strong> {failedStep}</div>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Execution Progress */}
      {isExecuting && selectedPath && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Executing: {alternativePaths.find(p => p.id === selectedPath)?.title}
                </span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                  In Progress
                </Badge>
              </div>
              <Progress value={executionProgress} className="h-2" />
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Setting up alternative workflow...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Paths Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {alternativePaths.map((path) => (
          <Card
            key={path.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPath === path.id && isExecuting
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => !isExecuting && executeWorkflowPath(path)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <path.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {path.description}
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>

              {/* Path Metadata */}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className={getAvailabilityColor(path.availability)}>
                  {path.availability}
                </Badge>
                <Badge variant="outline" className={`${getReliabilityColor(path.reliability)} border-current`}>
                  {path.reliability} reliability
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="h-3 w-3" />
                  ~{formatTime(path.estimatedTime)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Data Accuracy */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Data Accuracy</span>
                <div className="flex items-center gap-2">
                  {getDataAccuracyIcon(path.dataAccuracy)}
                  <span className="text-sm capitalize">{path.dataAccuracy}</span>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">✓ Features</h4>
                <ul className="space-y-1">
                  {path.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-xs flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-green-500" />
                      {feature}
                    </li>
                  ))}
                  {path.features.length > 3 && (
                    <li className="text-xs text-gray-500">
                      +{path.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Limitations */}
              <div>
                <h4 className="text-sm font-medium text-orange-700 mb-2">⚠ Limitations</h4>
                <ul className="space-y-1">
                  {path.limitations.slice(0, 2).map((limitation, index) => (
                    <li key={index} className="text-xs flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-orange-500" />
                      {limitation}
                    </li>
                  ))}
                  {path.limitations.length > 2 && (
                    <li className="text-xs text-gray-500">
                      +{path.limitations.length - 2} more limitations
                    </li>
                  )}
                </ul>
              </div>

              <Separator />

              {/* Action Button */}
              <Button
                className="w-full"
                variant={path.availability === 'emergency' ? 'destructive' : 'default'}
                disabled={isExecuting}
              >
                {isExecuting && selectedPath === path.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <path.icon className="h-4 w-4 mr-2" />
                    Use This Path
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Paths Available */}
      {alternativePaths.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Alternative Paths Available</h3>
            <p className="text-muted-foreground mb-4">
              No suitable alternative workflows are available for the current error type.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" asChild>
                <a href="/help" target="_blank">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Get Help
                </a>
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div>
              <strong>Choosing the Right Path:</strong>
            </div>
            <ul className="text-sm space-y-1 ml-4">
              <li>• <strong>Demo Mode:</strong> Best for testing and demonstrations</li>
              <li>• <strong>Offline Mode:</strong> When network connectivity is limited</li>
              <li>• <strong>Simplified Workflow:</strong> For quick processing with basic validation</li>
              <li>• <strong>Manual Override:</strong> When you need full control over the process</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}