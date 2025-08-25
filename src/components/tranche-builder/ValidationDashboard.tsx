
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  FileCheck,
  Play,
  Settings
} from "lucide-react";

interface ValidationCheck {
  id: string;
  category: string;
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface ValidationDashboardProps {
  onValidationComplete: () => void;
}

const validationChecks: ValidationCheck[] = [
  {
    id: 'compliance-dfi',
    category: 'Compliance',
    name: 'DFI Requirements',
    status: 'passed',
    message: 'All DFI compliance requirements met',
    severity: 'high'
  },
  {
    id: 'data-availability',
    category: 'Data Sources',
    name: 'MRV Data Availability',
    status: 'passed',
    message: 'Saastain MRV feed active and validated',
    severity: 'high'
  },
  {
    id: 'threshold-feasibility',
    category: 'Logic',
    name: 'Threshold Feasibility',
    status: 'warning',
    message: 'Cooking hours threshold is ambitious - 85% historical achievement rate',
    severity: 'medium'
  },
  {
    id: 'approval-workflow',
    category: 'Approval',
    name: 'Approval Workflow',
    status: 'passed',
    message: 'Multi-level approval hierarchy configured',
    severity: 'medium'
  },
  {
    id: 'payment-methods',
    category: 'Payment',
    name: 'Payment Method Setup',
    status: 'failed',
    message: 'M-Pesa integration requires additional KYC verification',
    severity: 'high'
  },
  {
    id: 'risk-controls',
    category: 'Risk',
    name: 'Risk Controls',
    status: 'passed',
    message: 'Auto-hold triggers and manual overrides configured',
    severity: 'medium'
  }
];

export function ValidationDashboard({ onValidationComplete }: ValidationDashboardProps) {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  const getStatusIcon = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'destructive';
      case 'warning': return 'warning';
      case 'pending': return 'secondary';
    }
  };

  const runSandboxTest = async () => {
    setIsRunningTests(true);
    setTestProgress(0);

    // Simulate testing progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setTestProgress(i);
    }

    setIsRunningTests(false);
  };

  const passedChecks = validationChecks.filter(check => check.status === 'passed').length;
  const totalChecks = validationChecks.length;
  const overallScore = Math.round((passedChecks / totalChecks) * 100);

  const criticalIssues = validationChecks.filter(check => 
    check.status === 'failed' && check.severity === 'high'
  );

  const canDeploy = criticalIssues.length === 0;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Validation Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{overallScore}%</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{passedChecks}</div>
              <p className="text-sm text-muted-foreground">Checks Passed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">{criticalIssues.length}</div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(
              validationChecks.reduce((acc, check) => {
                if (!acc[check.category]) acc[check.category] = [];
                acc[check.category].push(check);
                return acc;
              }, {} as Record<string, ValidationCheck[]>)
            ).map(([category, checks]) => (
              <div key={category}>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  {category}
                </h4>
                <div className="space-y-2">
                  {checks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <p className="font-medium text-sm">{check.name}</p>
                          <p className="text-xs text-muted-foreground">{check.message}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`status-${getStatusColor(check.status)}`}>
                        {check.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sandbox Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Sandbox Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Test your tranche configuration with historical data to validate trigger accuracy and performance.
          </p>
          
          {isRunningTests && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Running sandbox tests...</span>
                <span>{testProgress}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={runSandboxTest} 
              disabled={isRunningTests}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunningTests ? 'Running Tests...' : 'Run Sandbox Test'}
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Test Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert className="border-destructive/20 bg-destructive/5">
          <XCircle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <strong>Critical Issues Found:</strong> Please resolve the following issues before deployment:
            <ul className="mt-2 space-y-1">
              {criticalIssues.map((issue) => (
                <li key={issue.id} className="text-sm">• {issue.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Deployment Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={onValidationComplete}
          disabled={!canDeploy}
          className="flex-1"
        >
          {canDeploy ? 'Deploy Tranche' : 'Resolve Issues to Deploy'}
        </Button>
        <Button variant="outline">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}
