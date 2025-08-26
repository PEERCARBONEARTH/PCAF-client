import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Settings, 
  Radio, 
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ProjectData {
  id: string;
  schoolName: string;
  location: string;
  assetType: string;
  status: string;
  progress: number;
  orderDate: string;
  deploymentDate: string | null;
  verificationDate: string | null;
  serialNumber: string;
  partnerOEM: string;
}

interface AssetReadinessTimelineProps {
  projects: ProjectData[];
}

const statusSteps = [
  { key: 'pre-approved', label: 'Pre-approved', icon: CheckCircle, color: 'blue' },
  { key: 'po-issued', label: 'PO Issued', icon: Package, color: 'purple' },
  { key: 'in-deployment', label: 'In Deployment', icon: Truck, color: 'orange' },
  { key: 'installed', label: 'Installed & Verified', icon: Settings, color: 'yellow' },
  { key: 'operational', label: 'Operational', icon: Radio, color: 'green' }
];

export function AssetReadinessTimeline({ projects }: AssetReadinessTimelineProps) {
  const getStepStatus = (projectStatus: string, stepKey: string) => {
    const projectStepIndex = statusSteps.findIndex(step => step.key === projectStatus);
    const currentStepIndex = statusSteps.findIndex(step => step.key === stepKey);
    
    if (currentStepIndex < projectStepIndex) return 'completed';
    if (currentStepIndex === projectStepIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Readiness Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-sm p-4 bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{project.schoolName}</h3>
                    <p className="text-sm text-muted-foreground">{project.location}</p>
                    <p className="text-xs text-muted-foreground">Serial: {project.serialNumber}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {project.partnerOEM}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Ordered: {new Date(project.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Timeline Steps */}
                <div className="relative">
                  <div className="flex justify-between items-center">
                    {statusSteps.map((step, index) => {
                      const stepStatus = getStepStatus(project.status, step.key);
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center relative">
                          {/* Connection Line */}
                          {index < statusSteps.length - 1 && (
                            <div className={`absolute top-4 left-8 w-full h-0.5 ${
                              getStepStatus(project.status, statusSteps[index + 1].key) === 'completed' 
                                ? 'bg-green-400' 
                                : 'bg-gray-200'
                            }`} />
                          )}
                          
                          {/* Step Circle */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(stepStatus)} z-10`}>
                            {stepStatus === 'completed' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          
                          {/* Step Label */}
                          <span className="text-xs text-center mt-2 max-w-20">
                            {step.label}
                          </span>
                          
                          {/* Status Indicator */}
                          {stepStatus === 'current' && (
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-blue-500 mr-1" />
                              <span className="text-xs text-blue-600">In Progress</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Dates */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Order Date:</span>
                      <p>{new Date(project.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deployment:</span>
                      <p>{project.deploymentDate ? new Date(project.deploymentDate).toLocaleDateString() : 'Pending'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verification:</span>
                      <p>{project.verificationDate ? new Date(project.verificationDate).toLocaleDateString() : 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}