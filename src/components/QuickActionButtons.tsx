import { useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { NewProgramForm } from "@/components/NewProgramForm";
import { Plus, DollarSign, FileText, Users, Settings, Bell, Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const QuickActionButtons = () => {
  const navigate = useNavigate();
  const { currentPlatform } = usePlatform();
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleProgramSubmit = (data: any) => {
    console.log('New program data:', data);
    toast({
      title: "Program Created",
      description: `${data.programName} has been successfully created and is ready for configuration.`,
    });
    setProgramDialogOpen(false);
    // Navigate to configuration after creation
    const configPath = currentPlatform ? `/${currentPlatform}/program-configuration` : "/program-configuration";
    navigate(configPath);
  };

  const handleDisburseTranche = () => {
    toast({
      title: "Disbursement Initiated",
      description: "Opening disbursement workflow with verification checks.",
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Export Started",
      description: "Generating comprehensive portfolio report. Download will start shortly.",
    });
  };

  const handleManageUsers = () => {
    const usersPath = currentPlatform ? `/${currentPlatform}/user-access` : "/user-access";
    navigate(usersPath);
  };

  const handleSystemSettings = () => {
    const settingsPath = currentPlatform ? `/${currentPlatform}/settings` : "/settings";
    navigate(settingsPath);
  };

  const handleViewReports = () => {
    const reportsPath = currentPlatform ? `/${currentPlatform}/reporting` : "/reporting";
    navigate(reportsPath);
  };

  const handleNotifications = () => {
    toast({
      title: "Notification Center",
      description: "Opening notification settings and alert preferences.",
    });
  };

  const actions = [
    {
      title: "Add New Program",
      description: "Create a new clean cooking program",
      icon: Plus,
      color: "primary",
      action: () => setProgramDialogOpen(true),
      urgent: false
    },
    {
      title: "Disburse Tranche",
      description: "Process pending disbursements",
      icon: DollarSign,
      color: "finance",
      action: handleDisburseTranche,
      urgent: true,
      badge: "3 pending"
    },
    {
      title: "Export Report",
      description: "Generate portfolio insights",
      icon: FileText,
      color: "success",
      action: handleViewReports,
      urgent: false
    },
    {
      title: "Manage Users",
      description: "Configure access & permissions",
      icon: Users,
      color: "secondary",
      action: handleManageUsers,
      urgent: false
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      color: "muted",
      action: handleSystemSettings,
      urgent: false
    },
    {
      title: "Notifications",
      description: "View alerts & messages",
      icon: Bell,
      color: "warning",
      action: handleNotifications,
      urgent: false,
      badge: "2 new"
    }
  ];

  const getButtonClasses = (color: string, urgent: boolean) => {
    const baseClasses = "h-auto p-6 text-left justify-start hover-scale";
    
    if (urgent) {
      return `${baseClasses} gradient-finance text-finance-foreground hover-glow`;
    }
    
    switch (color) {
      case "primary":
        return `${baseClasses} gradient-primary text-primary-foreground hover-glow`;
      case "finance":
        return `${baseClasses} bg-finance/10 text-finance border-finance/20 hover:bg-finance/20`;
      case "success":
        return `${baseClasses} bg-success/10 text-success border-success/20 hover:bg-success/20`;
      case "warning":
        return `${baseClasses} bg-warning/10 text-warning border-warning/20 hover:bg-warning/20`;
      case "secondary":
        return `${baseClasses} bg-secondary/50 text-secondary-foreground hover:bg-secondary/70`;
      default:
        return `${baseClasses} bg-muted/20 text-muted-foreground hover:bg-muted/30`;
    }
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Streamlined access to key portfolio management tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={getButtonClasses(action.color, action.urgent)}
                onClick={action.action}
              >
                <div className="flex items-start gap-3 w-full">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{action.title}</p>
                      {action.badge && (
                        <Badge variant="outline" className="text-xs bg-background/50">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-80">{action.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Emergency Actions */}
        <div className="mt-6 p-4 bg-destructive/5 rounded-sm border border-destructive/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Emergency Actions</p>
              <p className="text-xs text-muted-foreground">Quick access to critical operations</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                Pause All Programs
              </Button>
              <Button variant="outline" size="sm" className="text-warning border-warning/20 hover:bg-warning/10">
                Alert System Admin
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* New Program Dialog */}
      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Clean Cooking Program</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <NewProgramForm 
              onSubmit={handleProgramSubmit}
              onCancel={() => setProgramDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};