
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, HelpCircle, ExternalLink } from "lucide-react";
import { UserFriendlyError } from "@/types/improved-types";

// User-Friendly Error Display
export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  showTechnical = false 
}: { 
  error: string | UserFriendlyError; 
  onRetry?: () => void;
  showTechnical?: boolean;
}) => {
  const errorData = typeof error === 'string' 
    ? { title: 'Something went wrong', message: error, actionable: !!onRetry }
    : error;

  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {errorData.title}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{errorData.message}</p>
        
        {(onRetry || errorData.actions) && (
          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {errorData.actions?.map((action, index) => (
              <Button 
                key={index} 
                onClick={action.action} 
                size="sm" 
                variant="outline"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
        
        {showTechnical && typeof error === 'object' && error.technical && (
          <details className="mt-2">
            <summary className="text-xs cursor-pointer">Technical Details</summary>
            <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
              {error.technical}
            </pre>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Connection Error Handler
export const ConnectionError = ({ onRetry }: { onRetry: () => void }) => (
  <Card className="max-w-md mx-auto">
    <CardHeader className="text-center">
      <CardTitle className="flex items-center justify-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        Connection Issue
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center space-y-4">
      <p className="text-muted-foreground">
        We're having trouble connecting to our servers. Your data is safe.
      </p>
      <div className="flex gap-2 justify-center">
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
        <Button variant="outline" asChild>
          <a href="/help" target="_blank">
            <HelpCircle className="h-4 w-4 mr-2" />
            Get Help
          </a>
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Data Loading Error
export const DataError = ({ 
  dataType = "data", 
  onRetry 
}: { 
  dataType?: string; 
  onRetry: () => void; 
}) => (
  <ErrorDisplay
    error={{
      title: `Unable to load ${dataType}`,
      message: `We couldn't retrieve your ${dataType}. This might be a temporary issue.`,
      actionable: true,
      actions: [
        { label: 'Retry', action: onRetry },
        { label: 'Refresh Page', action: () => window.location.reload() }
      ]
    }}
  />
);

// AI Processing Error
export const AIError = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorDisplay
    error={{
      title: 'AI Analysis Unavailable',
      message: 'Our AI services are temporarily unavailable. You can still view your data and try the analysis again.',
      actionable: true,
      actions: [
        { label: 'Retry Analysis', action: onRetry },
        { label: 'View Raw Data', action: () => window.location.href = '/data' }
      ]
    }}
  />
);
