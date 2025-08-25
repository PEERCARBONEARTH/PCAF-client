import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Smartphone, 
  X, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Bell,
  Zap,
  Shield,
  Gauge
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobileDevice } from '@/hooks/useMobileGestures';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  const { toast } = useToast();
  const { isMobile, platform } = useMobileDevice();

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay (better UX)
      setTimeout(() => {
        if (!isStandalone) {
          setShowInstallPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      toast({
        title: "🎉 App Installed!",
        description: "PCAF Engine is now available on your home screen",
      });
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing data...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
      toast({
        title: "You're Offline",
        description: "Don't worry, you can still use cached features",
        variant: "destructive"
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Register service worker and check for updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('Service Worker registered:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPLOAD_SYNCED') {
          toast({
            title: "Data Synced",
            description: "Your offline uploads have been processed",
          });
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show manual install instructions
      setShowInstallPrompt(false);
      showManualInstallInstructions();
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const showManualInstallInstructions = () => {
    let instructions = '';
    
    if (platform === 'ios') {
      instructions = 'Tap the Share button and select "Add to Home Screen"';
    } else if (platform === 'android') {
      instructions = 'Tap the menu (⋮) and select "Add to Home screen"';
    } else {
      instructions = 'Look for the install option in your browser menu';
    }

    toast({
      title: "Install PCAF Engine",
      description: instructions,
    });
  };

  const handleUpdateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <>
      {/* Offline Alert */}
      {showOfflineAlert && (
        <Alert className="fixed top-4 left-4 right-4 z-50 border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You're offline. Using cached data.</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowOfflineAlert(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Update Available Alert */}
      {updateAvailable && (
        <Alert className="fixed top-4 left-4 right-4 z-50 border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>App update available!</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleUpdateApp}>
                Update
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUpdateAvailable(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-primary/20 bg-primary/5 md:max-w-sm md:left-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm">Install PCAF Engine</CardTitle>
                  <CardDescription className="text-xs">
                    Get the full app experience
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={dismissInstallPrompt}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-green-600" />
                <span>Faster loading</span>
              </div>
              <div className="flex items-center gap-1">
                <WifiOff className="h-3 w-3 text-blue-600" />
                <span>Offline access</span>
              </div>
              <div className="flex items-center gap-1">
                <Bell className="h-3 w-3 text-purple-600" />
                <span>Push notifications</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-orange-600" />
                <span>Secure storage</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleInstallClick}
                size="sm"
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={dismissInstallPrompt}
              >
                Later
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className="flex items-center gap-1"
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* PWA Features Showcase (for installed app) */}
      {isInstalled && (
        <PWAFeaturesShowcase />
      )}
    </>
  );
}

function PWAFeaturesShowcase() {
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Show features showcase once after install
    const hasSeenFeatures = localStorage.getItem('pwa-features-seen');
    if (!hasSeenFeatures) {
      setTimeout(() => setShowFeatures(true), 2000);
    }
  }, []);

  const handleDismiss = () => {
    setShowFeatures(false);
    localStorage.setItem('pwa-features-seen', 'true');
  };

  if (!showFeatures) return null;

  return (
    <Card className="fixed inset-4 z-50 shadow-xl bg-gradient-to-br from-primary/10 to-secondary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Welcome to PCAF Engine!
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          You now have access to these powerful features:
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <WifiOff className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Offline Access</h4>
              <p className="text-xs text-muted-foreground">
                View cached data and work without internet
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Push Notifications</h4>
              <p className="text-xs text-muted-foreground">
                Get notified when calculations complete
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gauge className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Faster Performance</h4>
              <p className="text-xs text-muted-foreground">
                Instant loading with cached resources
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Secure Storage</h4>
              <p className="text-xs text-muted-foreground">
                Your data is safely stored locally
              </p>
            </div>
          </div>
        </div>
        
        <Button onClick={handleDismiss} className="w-full">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}

export default PWAInstallPrompt;