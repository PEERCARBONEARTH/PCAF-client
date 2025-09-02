
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Skeleton Loaders for Different Content Types
export const MetricsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    <div className="flex space-x-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex space-x-4">
        {[...Array(4)].map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// AI Processing Indicator
export const AIProcessingIndicator = ({ 
  message = "AI is analyzing your data...", 
  progress 
}: { 
  message?: string; 
  progress?: number; 
}) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
    </div>
    <div className="text-center space-y-2">
      <p className="text-sm font-medium">{message}</p>
      {progress !== undefined && (
        <div className="w-64">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
        </div>
      )}
    </div>
  </div>
);

// Smart Loading Wrapper
export const SmartLoader = ({ 
  isLoading, 
  error, 
  children, 
  skeleton,
  loadingMessage 
}: {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  loadingMessage?: string;
}) => {
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  if (isLoading) {
    return skeleton || <AIProcessingIndicator message={loadingMessage} />;
  }
  
  return <>{children}</>;
};
