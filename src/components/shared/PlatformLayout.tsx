import { ReactNode } from "react";
import { usePlatform } from "@/contexts/PlatformContext";
import { Sidebar } from "@/components/Sidebar";
import { NotificationSystem, useNotifications } from "@/components/NotificationSystem";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b p-4 flex items-center justify-between md:pl-6">
          <div className="flex items-center gap-4 ml-12 md:ml-0">
            <h1 className="text-xl font-semibold text-foreground">{platformTitle}</h1>
          </div>
          
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
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}