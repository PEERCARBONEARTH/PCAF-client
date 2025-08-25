import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Building2,
  Globe
} from "lucide-react";

interface ComplianceTrackerProps {
  clientType: "bank" | "fund";
}

export function ComplianceTracker({ clientType }: ComplianceTrackerProps) {
  const regulatoryFrameworks = [
    {
      name: "TCFD",
      fullName: "Task Force on Climate-related Financial Disclosures",
      status: "compliant",
      progress: 95,
      nextDeadline: "2024-12-31",
      description: "Climate risk disclosure framework"
    },
    {
      name: "EU Taxonomy",
      fullName: "EU Taxonomy for Sustainable Activities",
      status: "in-progress",
      progress: 78,
      nextDeadline: "2024-06-30",
      description: "Classification system for sustainable economic activities"
    },
    {
      name: "SFDR",
      fullName: "Sustainable Finance Disclosure Regulation",
      status: "compliant",
      progress: 100,
      nextDeadline: "2025-01-31",
      description: "Disclosure requirements for financial market participants"
    },
    {
      name: "NZBA",
      fullName: "Net-Zero Banking Alliance",
      status: "on-track",
      progress: 65,
      nextDeadline: "2024-09-30",
      description: "Commitment to align lending with net-zero by 2050"
    },
    {
      name: "SBTi",
      fullName: "Science Based Targets initiative",
      status: "submitted",
      progress: 85,
      nextDeadline: "2024-08-15",
      description: "Science-based emission reduction targets"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle className="h-4 w-4 text-success" />;
      case "on-track": return <Target className="h-4 w-4 text-primary" />;
      case "in-progress": return <Clock className="h-4 w-4 text-warning" />;
      case "submitted": return <FileCheck className="h-4 w-4 text-primary" />;
      default: return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant": return <Badge className="bg-success/10 text-success border-success/20">Compliant</Badge>;
      case "on-track": return <Badge className="bg-primary/10 text-primary border-primary/20">On Track</Badge>;
      case "in-progress": return <Badge className="bg-warning/10 text-warning border-warning/20">In Progress</Badge>;
      case "submitted": return <Badge className="bg-primary/10 text-primary border-primary/20">Submitted</Badge>;
      default: return <Badge variant="destructive">Non-Compliant</Badge>;
    }
  };

  const overallCompliance = Math.round(
    regulatoryFrameworks.reduce((acc, framework) => acc + framework.progress, 0) / regulatoryFrameworks.length
  );

  return (
    <div className="space-y-6">
      {/* Overall Compliance Status */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Regulatory Compliance Overview</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">{overallCompliance}%</div>
            <p className="text-sm font-medium text-foreground">Overall Compliance</p>
            <Progress value={overallCompliance} className="h-3 mt-3" />
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-2">3</div>
            <p className="text-sm font-medium text-foreground">Frameworks Compliant</p>
            <p className="text-xs text-muted-foreground">TCFD, SFDR, and 1 more</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-warning mb-2">2</div>
            <p className="text-sm font-medium text-foreground">In Progress</p>
            <p className="text-xs text-muted-foreground">EU Taxonomy, NZBA</p>
          </div>
        </div>
      </Card>

      {/* Detailed Framework Status */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Framework Compliance Details</h3>
        </div>
        
        <div className="space-y-4">
          {regulatoryFrameworks.map((framework, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(framework.status)}
                  <div>
                    <h4 className="font-semibold text-foreground">{framework.name}</h4>
                    <p className="text-sm text-muted-foreground">{framework.fullName}</p>
                  </div>
                </div>
                {getStatusBadge(framework.status)}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{framework.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{framework.progress}%</span>
                </div>
                <Progress value={framework.progress} className="h-2" />
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Next milestone: {new Date(framework.nextDeadline).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.ceil((new Date(framework.nextDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Deadlines */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Upcoming Compliance Deadlines</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div>
                <p className="font-medium text-sm">EU Taxonomy Report</p>
                <p className="text-xs text-muted-foreground">Portfolio alignment disclosure</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">June 30, 2024</p>
              <p className="text-xs text-warning">45 days remaining</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-sm">SBTi Validation</p>
                <p className="text-xs text-muted-foreground">Target validation response</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">August 15, 2024</p>
              <p className="text-xs text-primary">91 days remaining</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/5 rounded-lg border border-muted/20">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">NZBA Progress Report</p>
                <p className="text-xs text-muted-foreground">Annual commitment update</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">September 30, 2024</p>
              <p className="text-xs text-muted-foreground">137 days remaining</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}