import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Database, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from 'lucide-react';

interface DataSourceIndicatorProps {
  source: 'lms' | 'csv' | 'manual' | 'api';
  lastUpdated?: Date;
  quality?: 'high' | 'medium' | 'low';
  verified?: boolean;
  className?: string;
}

export function DataSourceIndicator({ 
  source, 
  lastUpdated, 
  quality = 'medium', 
  verified = false,
  className = '' 
}: DataSourceIndicatorProps) {
  const getSourceConfig = () => {
    switch (source) {
      case 'lms':
        return {
          icon: <Database className="h-3 w-3" />,
          label: 'LMS',
          description: 'Synchronized from Loan Management System',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'csv':
        return {
          icon: <Upload className="h-3 w-3" />,
          label: 'CSV',
          description: 'Uploaded via CSV file',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'manual':
        return {
          icon: <RefreshCw className="h-3 w-3" />,
          label: 'Manual',
          description: 'Manually entered data',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'api':
        return {
          icon: <RefreshCw className="h-3 w-3" />,
          label: 'API',
          description: 'Retrieved via API integration',
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      default:
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          label: 'Unknown',
          description: 'Unknown data source',
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const getQualityIcon = () => {
    switch (quality) {
      case 'high':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
    }
  };

  const sourceConfig = getSourceConfig();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            <Badge 
              variant="outline" 
              className={`${sourceConfig.color} text-xs px-2 py-1 flex items-center gap-1`}
            >
              {sourceConfig.icon}
              {sourceConfig.label}
            </Badge>
            {getQualityIcon()}
            {verified && <CheckCircle className="h-3 w-3 text-green-600" />}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <div className="font-medium">{sourceConfig.description}</div>
            <div className="text-sm text-muted-foreground">
              Quality: {quality.charAt(0).toUpperCase() + quality.slice(1)}
            </div>
            {lastUpdated && (
              <div className="text-sm text-muted-foreground">
                Updated: {lastUpdated.toLocaleString()}
              </div>
            )}
            {verified && (
              <div className="text-sm text-green-600">✓ Verified</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}