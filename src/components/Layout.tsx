import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { NotificationSystem, useNotifications } from "./NotificationSystem";
import { ModeToggle } from "./mode-toggle";
import { UserMenu } from "./auth/UserMenu";


interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const {
    notifications,
    addNotification,
    markAsRead,
    dismiss,
    markAllAsRead
  } = useNotifications();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          
          <ModeToggle />
          <NotificationSystem
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onDismiss={dismiss}
            onMarkAllAsRead={markAllAsRead}
          />
          <UserMenu />
        </div>
        {children}
      </main>
    </div>
  );
}