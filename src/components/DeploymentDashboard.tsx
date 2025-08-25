import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin,
  Camera,
  QrCode,
  Clock,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectData {
  id: string;
  schoolName: string;
  location: string;
  assetType: string;
  status: string;
  serialNumber: string;
  partnerOEM: string;
}

interface DeploymentDashboardProps {
  projects: ProjectData[];
}

export function DeploymentDashboard({ projects }: DeploymentDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const { toast } = useToast();

  const handleMilestoneUpdate = (milestone: string) => {
    toast({
      title: "Milestone Updated",
      description: `${milestone} status has been updated successfully.`,
    });
  };

  const handleFileUpload = () => {
    toast({
      title: "Files Uploaded",
      description: "Installation verification documents uploaded successfully.",
    });
  };

  const deploymentMilestones = [
    {
      id: 'manufacturing',
      title: 'Manufacturing Complete',
      description: 'Equipment manufactured and quality tested',
      icon: Package,
      status: 'completed'
    },
    {
      id: 'shipping',
      title: 'Shipping & Logistics',
      description: 'Asset shipped and in transit to deployment site',
      icon: Truck,
      status: 'completed'
    },
    {
      id: 'delivery',
      title: 'Site Delivery',
      description: 'Equipment delivered to installation site',
      icon: MapPin,
      status: 'current'
    },
    {
      id: 'installation',
      title: 'Installation & Setup',
      description: 'Physical installation and initial configuration',
      icon: CheckCircle,
      status: 'pending'
    },
    {
      id: 'commissioning',
      title: 'Commissioning & Testing',
      description: 'System testing and performance validation',
      icon: FileText,
      status: 'pending'
    }
  ];

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'current': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-400 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Project for Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProject?.id === project.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm">{project.schoolName}</h3>
                      <p className="text-xs text-muted-foreground">{project.location}</p>
                      <p className="text-xs text-muted-foreground">Serial: {project.serialNumber}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {project.partnerOEM}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Scan Asset QR Code
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Upload Installation Photos
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Submit Commissioning Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Update GPS Coordinates
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment Progress - {selectedProject.schoolName}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="milestones" className="space-y-4">
              <TabsList>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="uploads">Document Uploads</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="milestones" className="space-y-4">
                <div className="space-y-4">
                  {deploymentMilestones.map((milestone, index) => {
                    const Icon = milestone.icon;
                    
                    return (
                      <div key={milestone.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className={`p-2 rounded-full ${getMilestoneColor(milestone.status)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-sm">{milestone.title}</h3>
                              <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            </div>
                            <Badge className={getMilestoneColor(milestone.status)}>
                              {milestone.status}
                            </Badge>
                          </div>
                          
                          {milestone.status === 'current' && (
                            <div className="mt-3 space-y-2">
                              <Progress value={65} className="h-2" />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleMilestoneUpdate(milestone.title)}
                                >
                                  Mark Complete
                                </Button>
                                <Button size="sm" variant="outline">
                                  Add Note
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="uploads" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to select
                  </p>
                  <Button variant="outline" size="sm" onClick={handleFileUpload}>
                    Choose Files
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Notes</label>
                  <Textarea
                    placeholder="Add notes about the uploaded documents..."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="min-h-20"
                  />
                </div>
              </TabsContent>

              <TabsContent value="verification" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">Installation Checklist</h3>
                      <div className="space-y-2">
                        {[
                          'Equipment physically installed',
                          'Electrical connections verified',
                          'Safety systems functional',
                          'Initial performance test passed'
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">Verification Team</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Field Engineer: John Mbeki</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Verified: March 15, 2024</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}