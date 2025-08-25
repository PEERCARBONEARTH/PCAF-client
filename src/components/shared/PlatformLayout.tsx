import { ReactNode } from "react";
import { usePlatform } from "@/contexts/PlatformContext";
import { CollapsiblePlatformSidebar } from "@/components/CollapsiblePlatformSidebar";
import { NotificationSystem, useNotifications } from "@/components/NotificationSystem";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

interface PlatformLayoutProps {
  children: ReactNode;
}

export function PlatformLayout({ children }: PlatformLayoutProps) {
  const { currentPlatform, clearPlatform } = usePlatform();
  const navigate = useNavigate();
  const {
    notifications,
    addNotification,
    markAsRead,
    dismiss,
    markAllAsRead
  } = useNotifications();

  const handleSwitchPlatform = () => {
    clearPlatform();
    navigate('/platform-selection');
  };

  const platformTitle = currentPlatform === 'green-finance' 
    ? 'Green Finance Investments' 
    : 'Financed Emissions';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <CollapsiblePlatformSidebar />
        <SidebarInset className="flex-1">
          <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b p-2 mb-4 flex items-center justify-between">
            <SidebarTrigger className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </SidebarTrigger>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwitchPlatform}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Switch Platform
              </Button>
              <ModeToggle />
              <NotificationSystem
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDismiss={dismiss}
                onMarkAllAsRead={markAllAsRead}
              />
              <UserMenu />
            </div>
          </div>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}