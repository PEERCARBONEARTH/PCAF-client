import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { realTimeService, ConnectionStatus as ConnectionStatusType } from "@/services/realTimeService";

export function ConnectionStatus() {
    const [status, setStatus] = useState<ConnectionStatusType>({
        connected: false,
        lastHeartbeat: null,
        reconnectAttempts: 0,
        latency: 0
    });
    const [isGracefulDegradation, setIsGracefulDegradation] = useState(false);

    useEffect(() => {
        // Subscribe to connection status updates
        const unsubscribe = realTimeService.subscribe('connection_status', (update) => {
            setStatus(update.data);
        });

        // Get initial status
        setStatus(realTimeService.getConnectionStatus());
        setIsGracefulDegradation(realTimeService.isGracefulDegradation());

        // Check graceful degradation status periodically
        const statusInterval = setInterval(() => {
            setIsGracefulDegradation(realTimeService.isGracefulDegradation());
        }, 5000);

        return () => {
            unsubscribe();
            clearInterval(statusInterval);
        };
    }, []);

    const handleReconnect = () => {
        realTimeService.connect();
    };

    // Don't show anything if gracefully degraded or connected
    if (isGracefulDegradation || status.connected) {
        return null;
    }

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
            <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 shadow-lg">
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">
                    Real-time updates unavailable
                </span>
                <Badge variant="outline" className="text-xs">
                    Offline Mode
                </Badge>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReconnect}
                    className="h-6 w-6 p-0"
                    title="Retry connection"
                >
                    <RefreshCw className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}