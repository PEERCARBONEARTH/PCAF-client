import { useEffect, useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { NavigationService } from '@/lib/navigation';

export default function Auth() {
  const { user, loading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to the appropriate page
    if (!loading && user && !isNavigating) {
      setIsNavigating(true);
      // Use navigation service for reliable redirect
      NavigationService.navigateAfterAuth();
    }
  }, [user, loading, isNavigating]);

  const handleAuthSuccess = () => {
    setIsNavigating(true);
    // Force navigation to ensure proper state sync
    NavigationService.navigateAfterAuth();
  };

  if (loading || isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin mx-auto border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">
            {isNavigating ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return <AuthForm onSuccess={handleAuthSuccess} />;
}