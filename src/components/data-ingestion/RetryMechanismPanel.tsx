import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Pause,
  Play,
  Square,
  Info,
} from 'lucide-react';
import { retryService } from '@/services/retryService';

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  enableExponentialBackoff: boolean;
  enableCircuitBreaker: boolean;
  timeoutMs: number;
}

interface RetryAttempt {
  attempt: number;
  timestamp: Date;
  delay: number;
  success: boolean;
  error?: string;
}

interface RetryMechanismPanelProps {
  onRetry: (config: RetryConfig) => Promise<void>;
  error?: Error;
  isRetrying?: boolean;
  canRetry?: boolean;
  className?: string;
}

export function RetryMechanismPanel({
  onRetry,
  error,
  isRetrying = false,
  canRetry = true,
  className = '',
}: RetryMechanismPanelProps) {
  const [config, setConfig] = useState<RetryConfig>({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    enableExponentialBackoff: true,
    enableCircuitBreaker: true,
    timeoutMs: 30000,
  });

  const [attempts, setAttempts] = useState<RetryAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [retryProgress, setRetryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [estimatedNextRetry, setEstimatedNextRetry] = useState<Date | null>(null);

  // Calculate next retry delay based on configuration
  const calculateNextDelay = (attemptNumber: number): number => {
    if (!config.enableExponentialBackoff) {
      return config.baseDelay;
    }

    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attemptNumber - 1);
    return Math.min(exponentialDelay, config.maxDelay);
  };

  // Format delay time for display
  const formatDelay = (milliseconds: number): string => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Handle retry execution with progress tracking
  const executeRetry = async () => {
    if (!canRetry || isRetrying) return;

    const newAttempts: RetryAttempt[] = [];
    setAttempts([]);
    setCurrentAttempt(0);
    setRetryProgress(0);

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      if (isPaused) {
        break;
      }

      setCurrentAttempt(attempt);
      const delay = calculateNextDelay(attempt);
      
      // Add attempt to history
      const attemptRecord: RetryAttempt = {
        attempt,
        timestamp: new Date(),
        delay,
        success: false,
      };

      newAttempts.push(attemptRecord);
      setAttempts([...newAttempts]);

      // Show delay countdown if not first attempt
      if (attempt > 1) {
        setEstimatedNextRetry(new Date(Date.now() + delay));
        
        // Countdown progress
        const countdownInterval = setInterval(() => {
          const remaining = estimatedNextRetry ? estimatedNextRetry.getTime() - Date.now() : 0;
          const progress = Math.max(0, 100 - (remaining / delay) * 100);
          setRetryProgress(progress);
          
          if (remaining <= 0) {
            clearInterval(countdownInterval);
            setRetryProgress(0);
          }
        }, 100);

        // Wait for delay
        await new Promise(resolve => setTimeout(resolve, delay));
        clearInterval(countdownInterval);
        setEstimatedNextRetry(null);
      }

      try {
        // Execute the retry
        await onRetry(config);
        
        // Mark as successful
        attemptRecord.success = true;
        setAttempts([...newAttempts]);
        setRetryProgress(100);
        
        // Success - break out of retry loop
        break;
      } catch (retryError) {
        // Mark as failed
        attemptRecord.success = false;
        attemptRecord.error = (retryError as Error).message;
        setAttempts([...newAttempts]);
        
        // If this was the last attempt, show final failure
        if (attempt === config.maxAttempts) {
          setRetryProgress(0);
        }
      }
    }

    setCurrentAttempt(0);
  };

  // Preset configurations
  const presetConfigs = {
    conservative: {
      maxAttempts: 2,
      baseDelay: 2000,
      maxDelay: 5000,
      backoffMultiplier: 1.5,
      enableExponentialBackoff: true,
      enableCircuitBreaker: true,
      timeoutMs: 15000,
    },
    balanced: {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      enableExponentialBackoff: true,
      enableCircuitBreaker: true,
      timeoutMs: 30000,
    },
    aggressive: {
      maxAttempts: 5,
      baseDelay: 500,
      maxDelay: 15000,
      backoffMultiplier: 2.5,
      enableExponentialBackoff: true,
      enableCircuitBreaker: false,
      timeoutMs: 60000,
    },
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Retry Status */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Operation failed: {error.message}</span>
            {canRetry && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Retryable
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Retry Progress */}
      {isRetrying && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Retry Attempt {currentAttempt} of {config.maxAttempts}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPaused(!isPaused)}
                    className="h-8"
                  >
                    {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                </div>
              </div>

              {estimatedNextRetry && (
                <>
                  <Progress value={retryProgress} className="h-2" />
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span>
                      Next attempt in {formatDelay(estimatedNextRetry.getTime() - Date.now())}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retry Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Retry Configuration
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvancedConfig ? 'Simple' : 'Advanced'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset Configurations */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(presetConfigs).map(([name, preset]) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig(preset)}
                  className="h-auto p-3"
                >
                  <div className="text-center">
                    <div className="font-medium capitalize">{name}</div>
                    <div className="text-xs text-gray-600">
                      {preset.maxAttempts} attempts, {formatDelay(preset.baseDelay)} delay
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Basic Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Max Attempts: {config.maxAttempts}
              </Label>
              <Slider
                value={[config.maxAttempts]}
                onValueChange={([value]) => setConfig({ ...config, maxAttempts: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Base Delay: {formatDelay(config.baseDelay)}
              </Label>
              <Slider
                value={[config.baseDelay]}
                onValueChange={([value]) => setConfig({ ...config, baseDelay: value })}
                min={500}
                max={5000}
                step={250}
                className="w-full"
              />
            </div>
          </div>

          {/* Advanced Configuration */}
          {showAdvancedConfig && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Max Delay: {formatDelay(config.maxDelay)}
                  </Label>
                  <Slider
                    value={[config.maxDelay]}
                    onValueChange={([value]) => setConfig({ ...config, maxDelay: value })}
                    min={5000}
                    max={60000}
                    step={2500}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Backoff Multiplier: {config.backoffMultiplier}x
                  </Label>
                  <Slider
                    value={[config.backoffMultiplier]}
                    onValueChange={([value]) => setConfig({ ...config, backoffMultiplier: value })}
                    min={1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="exponential-backoff"
                    checked={config.enableExponentialBackoff}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, enableExponentialBackoff: checked })
                    }
                  />
                  <Label htmlFor="exponential-backoff" className="text-sm">
                    Exponential Backoff
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="circuit-breaker"
                    checked={config.enableCircuitBreaker}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, enableCircuitBreaker: checked })
                    }
                  />
                  <Label htmlFor="circuit-breaker" className="text-sm">
                    Circuit Breaker
                  </Label>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Timeout: {formatDelay(config.timeoutMs)}
                </Label>
                <Slider
                  value={[config.timeoutMs]}
                  onValueChange={([value]) => setConfig({ ...config, timeoutMs: value })}
                  min={5000}
                  max={120000}
                  step={5000}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Retry Preview */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  <strong>Retry Strategy:</strong> {config.maxAttempts} attempts with{' '}
                  {config.enableExponentialBackoff ? 'exponential' : 'fixed'} backoff
                </div>
                <div className="text-xs text-gray-600">
                  Delays: {Array.from({ length: Math.min(config.maxAttempts, 3) }, (_, i) =>
                    formatDelay(calculateNextDelay(i + 1))
                  ).join(' → ')}
                  {config.maxAttempts > 3 && '...'}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Retry History */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Retry History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attempts.map((attempt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {attempt.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        Attempt {attempt.attempt}
                      </div>
                      <div className="text-xs text-gray-600">
                        {attempt.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">
                      {attempt.success ? (
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Failed
                        </Badge>
                      )}
                    </div>
                    {attempt.error && (
                      <div className="text-xs text-gray-600 mt-1 max-w-48 truncate">
                        {attempt.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={executeRetry}
          disabled={!canRetry || isRetrying}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Start Retry'}
        </Button>

        {isRetrying && (
          <Button
            variant="outline"
            onClick={() => {
              setIsPaused(false);
              setCurrentAttempt(0);
              setAttempts([]);
              setRetryProgress(0);
            }}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => setConfig(presetConfigs.balanced)}
        >
          Reset to Default
        </Button>
      </div>
    </div>
  );
}