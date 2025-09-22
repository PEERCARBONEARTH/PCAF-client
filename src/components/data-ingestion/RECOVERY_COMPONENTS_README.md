# Data Ingestion Recovery Components

This document describes the recovery options UI components that provide comprehensive error handling and recovery mechanisms for the data ingestion wizard.

## Overview

The recovery components implement the requirements from task 10:

- Error dialog components with specific recovery action buttons
- Retry mechanisms with user-controlled options
- Alternative workflow paths for when primary methods fail

## Components

### 1. RecoveryOptionsDialog

A comprehensive dialog that presents users with specific recovery actions based on the error type.

**Features:**

- Error classification and user-friendly messaging
- Context-aware recovery options
- Progress tracking during recovery execution
- Alternative workflow suggestions
- Help and support links

**Usage:**

```tsx
import { RecoveryOptionsDialog } from '@/components/data-ingestion';

<RecoveryOptionsDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  error={currentError}
  context={errorContext}
  onRecoveryComplete={success => {
    if (success) {
      // Handle successful recovery
    }
  }}
/>;
```

### 2. RetryMechanismPanel

A configurable retry mechanism with user-controlled options and real-time progress tracking.

**Features:**

- Preset retry configurations (Conservative, Balanced, Aggressive)
- Advanced configuration options (exponential backoff, circuit breaker, timeouts)
- Real-time progress tracking with pause/resume
- Retry history and attempt logging
- Visual countdown timers

**Usage:**

```tsx
import { RetryMechanismPanel } from '@/components/data-ingestion';

<RetryMechanismPanel
  onRetry={async config => {
    // Execute retry with custom configuration
    await performOperation(config);
  }}
  error={currentError}
  isRetrying={isRetrying}
  canRetry={isRetryable}
/>;
```

### 3. AlternativeWorkflowPaths

Provides alternative approaches when primary methods fail, with context-aware path filtering.

**Features:**

- Multiple workflow alternatives (Mock Data, Offline, Simplified, Manual, etc.)
- Error-type based path filtering
- Path metadata (availability, reliability, data accuracy)
- Estimated completion times
- Feature and limitation descriptions

**Usage:**

```tsx
import { AlternativeWorkflowPaths } from '@/components/data-ingestion';

<AlternativeWorkflowPaths
  currentError={error}
  failedStep={stepId}
  onPathSelected={pathId => {
    // Handle alternative path selection
    switch (pathId) {
      case 'mock_data_mode':
        enableMockMode();
        break;
      case 'offline_mode':
        enableOfflineMode();
        break;
      // ... other paths
    }
  }}
/>;
```

### 4. ErrorRecoveryManager

A comprehensive manager that integrates all recovery components with tabbed interface and workflow coordination.

**Features:**

- Integrated tabbed interface (Quick Actions, Retry Config, Alternatives, History)
- Error severity assessment and color coding
- Quick action buttons for common recovery scenarios
- Error history tracking and management
- Auto-show logic for critical errors

**Usage:**

```tsx
import { ErrorRecoveryManager } from '@/components/data-ingestion';

<ErrorRecoveryManager
  error={currentError}
  context={errorContext}
  onRecoverySuccess={() => {
    // Handle successful recovery
  }}
  onRecoveryFailed={error => {
    // Handle failed recovery
  }}
  onAlternativePathSelected={pathId => {
    // Handle alternative path selection
  }}
/>;
```

### 5. DataIngestionWizardWithRecovery

An enhanced version of the data ingestion wizard that integrates all recovery components.

**Features:**

- Automatic error detection and handling
- Smart recovery suggestion based on error type
- Toast notifications for minor errors
- Full recovery manager for critical errors
- State management and error history
- Mock mode indicators

**Usage:**

```tsx
import { DataIngestionWizardWithRecovery } from '@/components/data-ingestion';

<DataIngestionWizardWithRecovery
  onComplete={data => {
    // Handle successful completion
  }}
/>;
```

## Error Types and Recovery Strategies

### Network Errors

- **Recovery Options:** Retry connection, Work offline
- **Alternative Paths:** Mock data mode, Offline processing, Cached results, Export/Import
- **Severity:** Low (retryable)

### Service Errors

- **Recovery Options:** Retry request, Use backup service
- **Alternative Paths:** Mock data mode, Simplified workflow, Manual override, Cached results
- **Severity:** Medium (retryable)

### Validation Errors

- **Recovery Options:** Fix data issues, Skip validation
- **Alternative Paths:** Simplified workflow, Manual override, Export/Import
- **Severity:** High (requires user action)

### Authentication Errors

- **Recovery Options:** Re-authenticate
- **Alternative Paths:** Limited options available
- **Severity:** High (requires user action)

### System Errors

- **Recovery Options:** Generic retry, Contact support
- **Alternative Paths:** All alternatives available
- **Severity:** High (may not be retryable)

## Configuration Options

### Retry Configuration

```typescript
interface RetryConfig {
  maxAttempts: number; // 1-10 attempts
  baseDelay: number; // 500-5000ms base delay
  maxDelay: number; // 5000-60000ms maximum delay
  backoffMultiplier: number; // 1-5x multiplier
  enableExponentialBackoff: boolean;
  enableCircuitBreaker: boolean;
  timeoutMs: number; // 5000-120000ms timeout
}
```

### Preset Configurations

- **Conservative:** 2 attempts, 2s base delay, 1.5x multiplier
- **Balanced:** 3 attempts, 1s base delay, 2x multiplier
- **Aggressive:** 5 attempts, 0.5s base delay, 2.5x multiplier

## Integration with Error Handling Service

The components integrate with the `errorHandlingService` to:

- Classify errors by type
- Determine if errors are retryable
- Generate user-friendly messages
- Provide context-aware recovery options
- Track error history and resolution

## Testing

Comprehensive tests are provided in `__tests__/RecoveryComponents.test.tsx` covering:

- Error handling service integration
- Retry configuration logic
- Alternative workflow path filtering
- Recovery option generation
- Error severity assessment
- Component integration flows

Run tests with:

```bash
npm test -- --run src/components/data-ingestion/__tests__/RecoveryComponents.test.tsx
```

## Best Practices

### Error Handling

1. Always provide user-friendly error messages
2. Offer specific, actionable recovery options
3. Track error history for debugging
4. Use appropriate severity levels

### Retry Logic

1. Use exponential backoff for network errors
2. Implement circuit breakers for failing services
3. Provide user control over retry parameters
4. Show progress and allow cancellation

### Alternative Paths

1. Filter paths based on error context
2. Clearly communicate limitations
3. Provide realistic time estimates
4. Maintain data accuracy indicators

### User Experience

1. Auto-show recovery for critical errors
2. Use toast notifications for minor issues
3. Provide clear progress indicators
4. Allow users to hide/show recovery options

## Requirements Mapping

This implementation addresses the following requirements:

**Requirement 4.1:** Error dialog components provide specific, actionable error messages with recovery action buttons.

**Requirement 4.2:** Retry mechanisms offer user-controlled options with retry, alternative approaches, and recovery instructions.

**Requirement 4.4:** Alternative workflow paths are provided when primary methods fail, with clear explanations and recovery guidance.

The components work together to create a comprehensive error recovery system that helps users resolve issues independently and continue their data ingestion workflow even when services fail or errors occur.
