import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { ProgressTracker } from './ProgressTracker';
import { Play, Square, RotateCcw } from 'lucide-react';

/**
 * Example component demonstrating progress tracking functionality
 * This shows how to integrate real-time progress tracking in the data ingestion wizard
 */
export function ProgressTrackingExample() {
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);
  const {
    isActive,
    startOperation,
    updateProgress,
    completeOperation,
    failOperation,
    clearHistory
  } = useProgressTracking();

  const simulateFileUpload = async () => {
    const operationId = startOperation('source', 'file_upload', 1000);
    setCurrentOperationId(operationId);

    try {
      // Simulate file upload progress
      const steps = [
        { progress: 10, message: 'Validating file format...', delay: 500 },
        { progress: 25, message: 'Reading file contents...', delay: 800 },
        { progress: 50, message: 'Parsing CSV data...', delay: 1200 },
        { progress: 75, message: 'Validating data structure...', delay: 900 },
        { progress: 90, message: 'Finalizing upload...', delay: 600 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        updateProgress(
          operationId, 
          step.progress, 
          step.message, 
          Math.floor((step.progress / 100) * 1000)
        );
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      completeOperation(operationId, 'File uploaded successfully! 1000 records processed.');
    } catch (error) {
      failOperation(operationId, `Upload failed: ${error}`);
    } finally {
      setCurrentOperationId(null);
    }
  };

  const simulateDataValidation = async () => {
    const operationId = startOperation('validation', 'data_validation', 1000);
    setCurrentOperationId(operationId);

    try {
      // Simulate data validation progress
      const steps = [
        { progress: 15, message: 'Loading validation rules...', delay: 400 },
        { progress: 30, message: 'Checking data quality...', delay: 1000 },
        { progress: 50, message: 'Validating PCAF compliance...', delay: 1500 },
        { progress: 70, message: 'Identifying data gaps...', delay: 800 },
        { progress: 85, message: 'Generating validation report...', delay: 600 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        updateProgress(
          operationId, 
          step.progress, 
          step.message, 
          Math.floor((step.progress / 100) * 1000)
        );
      }

      await new Promise(resolve => setTimeout(resolve, 400));
      completeOperation(operationId, 'Validation complete! 987 valid records, 13 warnings.');
    } catch (error) {
      failOperation(operationId, `Validation failed: ${error}`);
    } finally {
      setCurrentOperationId(null);
    }
  };

  const simulateEmissionsProcessing = async () => {
    const operationId = startOperation('processing', 'emissions_calculation', 987);
    setCurrentOperationId(operationId);

    try {
      // Simulate emissions processing with realistic progress
      const steps = [
        { progress: 5, message: 'Initializing calculation engine...', delay: 300 },
        { progress: 15, message: 'Loading methodology factors...', delay: 600 },
        { progress: 25, message: 'Processing loan data...', delay: 1200 },
        { progress: 45, message: 'Calculating financed emissions...', delay: 2000 },
        { progress: 65, message: 'Applying data quality scores...', delay: 1500 },
        { progress: 80, message: 'Generating portfolio metrics...', delay: 1000 },
        { progress: 95, message: 'Finalizing calculations...', delay: 500 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        updateProgress(
          operationId, 
          step.progress, 
          step.message, 
          Math.floor((step.progress / 100) * 987)
        );
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      completeOperation(operationId, 'Processing complete! Total emissions: 45,678.9 tCO2e');
    } catch (error) {
      failOperation(operationId, `Processing failed: ${error}`);
    } finally {
      setCurrentOperationId(null);
    }
  };

  const simulateFailure = async () => {
    const operationId = startOperation('source', 'failing_operation', 100);
    setCurrentOperationId(operationId);

    try {
      // Simulate some progress before failure
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(operationId, 25, 'Starting operation...');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      updateProgress(operationId, 50, 'Processing data...');
      
      await new Promise(resolve => setTimeout(resolve, 600));
      // Simulate failure
      throw new Error('Network connection lost');
    } catch (error) {
      failOperation(operationId, `Operation failed: ${(error as Error).message}`);
    } finally {
      setCurrentOperationId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Progress Tracking Demo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Demonstration of real-time progress tracking for data ingestion operations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={simulateFileUpload}
              disabled={isActive}
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              File Upload
            </Button>
            
            <Button
              onClick={simulateDataValidation}
              disabled={isActive}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Validation
            </Button>
            
            <Button
              onClick={simulateEmissionsProcessing}
              disabled={isActive}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Processing
            </Button>
            
            <Button
              onClick={simulateFailure}
              disabled={isActive}
              size="sm"
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Simulate Error
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={clearHistory}
              size="sm"
              variant="ghost"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear History
            </Button>
            
            {isActive && (
              <div className="text-sm text-muted-foreground">
                Operation in progress...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracker Component */}
      <ProgressTracker 
        showHistory={true}
        showMetrics={true}
        compact={false}
      />
    </div>
  );
}