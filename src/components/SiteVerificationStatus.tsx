import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  Package, 
  Truck, 
  Wrench, 
  Wifi, 
  DollarSign,
  Clock,
  AlertTriangle,
  Eye,
  FileCheck,
  Calendar
} from 'lucide-react';

interface VerificationStatusProps {
  projectId: string;
  schoolName: string;
}

interface VerificationStage {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
  completedDate?: string;
  expectedDate?: string;
  documents?: string[];
  criticalPath: boolean;
}

export default function SiteVerificationStatus({ projectId, schoolName }: VerificationStatusProps) {
  const verificationStages: VerificationStage[] = [
    {
      id: 'pre-approved',
      title: '✅ Pre-approved',
      description: 'School approved for finance (baseline done)',
      status: 'completed',
      icon: <CheckCircle className="h-5 w-5" />,
      completedDate: '2024-01-15',
      documents: ['Baseline Assessment Report', 'Financial Pre-approval', 'School MOU'],
      criticalPath: true
    },
    {
      id: 'po-issued',
      title: '📦 PO Issued',
      description: 'Equipment ordered via partner OEM',
      status: 'completed',
      icon: <Package className="h-5 w-5" />,
      completedDate: '2024-02-01',
      documents: ['Purchase Order', 'OEM Agreement', 'Delivery Schedule'],
      criticalPath: true
    },
    {
      id: 'in-deployment',
      title: '🏗️ In Deployment',
      description: 'Asset shipped or staged',
      status: 'completed',
      icon: <Truck className="h-5 w-5" />,
      completedDate: '2024-03-15',
      documents: ['Shipping Manifest', 'Site Preparation Checklist', 'Installation Plan'],
      criticalPath: true
    },
    {
      id: 'installed-verified',
      title: '🛠️ Installed & Verified',
      description: 'Commissioning checklist submitted',
      status: 'completed',
      icon: <Wrench className="h-5 w-5" />,
      completedDate: '2024-04-01',
      documents: ['Commissioning Report', 'Performance Test Results', 'Safety Certification'],
      criticalPath: true
    },
    {
      id: 'operational',
      title: '📡 Operational',
      description: 'MRV data meets threshold (e.g., hours used or fuel shift)',
      status: 'current',
      icon: <Wifi className="h-5 w-5" />,
      expectedDate: '2024-06-30',
      documents: ['MRV Data Report', 'Performance Metrics', 'Usage Analytics'],
      criticalPath: true
    },
    {
      id: 'disbursement-ready',
      title: '💸 Disbursement Ready',
      description: 'Triggers RBF payout or loan refinancing',
      status: 'pending',
      icon: <DollarSign className="h-5 w-5" />,
      expectedDate: '2024-07-15',
      documents: ['Performance Verification', 'Financial Reconciliation', 'Disbursement Authorization'],
      criticalPath: true
    }
  ];

  const currentStage = verificationStages.find(stage => stage.status === 'current');
  const completedStages = verificationStages.filter(stage => stage.status === 'completed');
  const progressPercentage = Math.round((completedStages.length / verificationStages.length) * 100);

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'current':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'pending':
        return 'bg-muted/50 text-muted-foreground border-muted';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'current':
        return <Clock className="h-6 w-6 text-warning animate-pulse" />;
      case 'pending':
        return <Circle className="h-6 w-6 text-muted-foreground" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Site Verification Status</h3>
          <p className="text-sm text-muted-foreground">{schoolName} - Deployment & Verification Progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStageStatusColor(currentStage?.status || 'pending')}>
            {currentStage?.title || 'All Stages Complete'}
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Documents
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Overall Verification Progress
            </span>
            <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
          </CardTitle>
          <CardDescription>
            {completedStages.length} of {verificationStages.length} stages completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Started: {verificationStages[0].completedDate}</span>
              <span>Expected Completion: {verificationStages[verificationStages.length - 1].expectedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Stages Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Verification Stages Timeline
          </CardTitle>
          <CardDescription>
            Detailed progress through each verification milestone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {verificationStages.map((stage, index) => (
              <div key={stage.id} className="relative">
                {/* Timeline Line */}
                {index < verificationStages.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                )}
                
                <div className="flex items-start gap-4">
                  {/* Stage Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStageIcon(stage.status)}
                  </div>
                  
                  {/* Stage Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-foreground">{stage.title}</h4>
                        <Badge className={getStageStatusColor(stage.status)}>
                          {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                        </Badge>
                        {stage.criticalPath && (
                          <Badge variant="outline" className="text-xs">
                            Critical Path
                          </Badge>
                        )}
                      </div>
                      {stage.completedDate && (
                        <span className="text-sm text-muted-foreground">
                          Completed: {stage.completedDate}
                        </span>
                      )}
                      {stage.expectedDate && stage.status === 'pending' && (
                        <span className="text-sm text-muted-foreground">
                          Expected: {stage.expectedDate}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
                    
                    {/* Documents */}
                    {stage.documents && stage.documents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Required Documents:</p>
                        <div className="flex flex-wrap gap-2">
                          {stage.documents.map((doc, docIndex) => (
                            <Badge 
                              key={docIndex} 
                              variant="outline" 
                              className={`text-xs ${
                                stage.status === 'completed' 
                                  ? 'bg-success/10 text-success border-success/20' 
                                  : 'bg-muted/50 text-muted-foreground'
                              }`}
                            >
                              {stage.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Current Stage Actions */}
                    {stage.status === 'current' && (
                      <div className="mt-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium text-warning">Action Required</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          MRV data collection in progress. System must maintain minimum 6 hours/day operation 
                          for 30 consecutive days to complete this stage.
                        </p>
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Current: </span>
                          <span className="font-medium text-foreground">8.5 hours/day average</span>
                          <span className="text-success ml-2">✓ Meeting threshold</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Path Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Critical Path Analysis
          </CardTitle>
          <CardDescription>
            Timeline risks and dependencies for disbursement readiness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="text-2xl font-bold text-success mb-1">18 days</div>
                <div className="text-sm text-muted-foreground">Ahead of Schedule</div>
              </div>
              
              <div className="text-center p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="text-2xl font-bold text-warning mb-1">15 days</div>
                <div className="text-sm text-muted-foreground">To Disbursement</div>
              </div>
              
              <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">98.5%</div>
                <div className="text-sm text-muted-foreground">Completion Confidence</div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Next Milestone Dependencies</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• MRV data threshold maintained for 12 more days</li>
                <li>• Performance verification report by technical team</li>
                <li>• Final financial reconciliation and audit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}