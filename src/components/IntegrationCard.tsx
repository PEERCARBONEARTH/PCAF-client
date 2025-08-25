import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, CheckCircle, Settings } from "lucide-react";
import { useState } from "react";

interface Integration {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: string;
  rating: number;
  downloads: string;
  verified: boolean;
  price: string;
  features: string[];
  icon: React.ReactNode;
  installed?: boolean;
}

interface IntegrationCardProps {
  integration: Integration;
  onInstall?: (integrationId: string) => void;
  onConfigure?: (integrationId: string) => void;
}

export function IntegrationCard({ integration, onInstall, onConfigure }: IntegrationCardProps) {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    // Simulate installation delay
    setTimeout(() => {
      onInstall?.(integration.id);
      setIsInstalling(false);
    }, 2000);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {integration.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription className="text-sm">{integration.provider}</CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {integration.verified && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {integration.installed && (
              <Badge variant="default" className="text-xs">
                Installed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {integration.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {integration.rating}
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {integration.downloads}
          </div>
          <div className="ml-auto font-semibold text-foreground">
            {integration.price}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Key Features:</p>
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {integration.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {integration.installed ? (
            <Button 
              className="flex-1" 
              size="sm" 
              variant="outline"
              onClick={() => onConfigure?.(integration.id)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              size="sm"
              onClick={handleInstall}
              disabled={isInstalling}
            >
              {isInstalling ? "Installing..." : "Install"}
            </Button>
          )}
          <Button variant="outline" size="sm">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}