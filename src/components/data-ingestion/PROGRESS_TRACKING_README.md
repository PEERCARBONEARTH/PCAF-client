# Real-time Progress Tracking Implementation

This document describes the comprehensive real-time progress tracking system implemented for the Data Ingestion Wizard, addressing task 11 requirements.

## Overview

The progress tracking system provides:
- **Real-time progress updates** with accurate status messages
- **Estimated time remaining** calculations based on historical data
- **Progress persistence** across browser sessions and page refreshes
- **Integration with real-time services** for live updates
- **Comprehensive error handling** and recovery mechanisms

## Architecture

### Core Components

1. **ProgressTrackingService** (`src/services/progressTrackingService.ts`)
   - Singleton service managing all progress operations
   - Handles state persistence and real-time integration
   - Provides metrics calculation and historical data

2. **useProgressTracking Hook** (`src/hooks/useProgressTracking.ts`)
   - React hook for easy component integration
   - Provides reactive state updates and control methods
   - Includes specialized hooks for step-specific tracking

3. **ProgressTracker Components** (`src/components/data-ingestion/ProgressTracker.tsx`)
   - Visual components for displaying progress
   - Multiple variants: full, compact, inline, step-specific
   - Real-time updates with meaningful status messages

## Key Features

### 1. Real-time Progress Updates

```typescript
// Start an operation
const operationId = progressTrackingService.startOperation(
  'validation', 
  'data_validation', 
  1000 // total items
);

// Update progress
progressTrackingService.updateProgressById(
  operationId, 
  50, // progress percentage
  'Validating records...', // status message
  500 // processed items
);

// Complete operation
progressTrackingService.completeOperation(
  operationId, 
  'Validation completed successfully'
);
```

### 2. Estimated Time Remaining

The system calculates ETA using:
- **Historical data** from similar operations
- **Current progress rate** for real-time estimation
- **Adaptive algorithms** that improve over time

```typescript
interface ProgressUpdate {
  estimatedTimeRemaining?: number; // in milliseconds
  // ... other properties
}
```

### 3. Progress Persistence

State is automatically persisted to localStorage:
- **Automatic saving** every 2 seconds during active operations
- **Session recovery** on page refresh or browser restart
- **Expiration handling** for stale data (1 hour timeout)
- **Graceful degradation** when localStorage is unavailable

### 4. Real-time Service Integration

Integrates with the existing real-time service:
- **WebSocket/SSE updates** for server-side progress
- **Automatic subscription** to progress events
- **Bidirectional communication** for progress requests

```typescript
// Real-time updates are automatically handled
realTimeService.subscribe('upload_progress', (update) => {
  // Automatically converted to progress updates
});
```

## Usage Examples

### Basic Usage in Components

```tsx
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { ProgressTracker } from '@/components/data-ingestion/ProgressTracker';

function MyComponent() {
  const { startOperation, updateProgress, completeOperation } = useProgressTracking();
  
  const handleUpload = async () => {
    const opId = startOperation('upload', 'file_upload', 1000);
    
    // Simulate progress updates
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      updateProgress(opId, i, `Processing... ${i}%`);
    }
    
    completeOperation(opId, 'Upload completed!');
  };

  return (
    <div>
      <button onClick={handleUpload}>Start Upload</button>
      <ProgressTracker showHistory={true} />
    </div>
  );
}
```

### Step-specific Progress Tracking

```tsx
import { StepProgressTracker } from '@/components/data-ingestion/ProgressTracker';

function ValidationStep({ stepId }: { stepId: string }) {
  return (
    <div>
      <h3>Data Validation</h3>
      <StepProgressTracker stepId={stepId} />
      {/* Step content */}
    </div>
  );
}
```

### Inline Progress Indicators

```tsx
import { InlineProgressIndicator } from '@/components/data-ingestion/ProgressTracker';

function UploadButton({ operationId }: { operationId?: string }) {
  return (
    <button disabled={!!operationId}>
      Upload File
      <InlineProgressIndicator operationId={operationId} />
    </button>
  );
}
```

## Integration with Data Ingestion Workflow

The progress tracking is fully integrated with the existing workflow service:

### 1. Step Completion Tracking

```typescript
async completeStep(stepId: string, data: any): Promise<void> {
  const operationId = progressTrackingService.startOperation(
    stepId, 
    `complete_${stepId}`, 
    1
  );

  try {
    // Progress updates during step completion
    progressTrackingService.updateProgressById(operationId, 25, 'Validating...');
    await this.validateStepCompletion(stepId, data);
    
    progressTrackingService.updateProgressById(operationId, 75, 'Updating state...');
    // ... step completion logic
    
    progressTrackingService.completeOperation(operationId, 'Step completed');
  } catch (error) {
    progressTrackingService.failOperation(operationId, error.message);
    throw error;
  }
}
```

### 2. Data Processing Operations

```typescript
async processEmissions(config: any): Promise<any> {
  const operationId = progressTrackingService.startOperation(
    'processing', 
    'emissions_calculation',
    recordCount
  );

  // Detailed progress tracking throughout processing
  const steps = [
    { progress: 25, message: 'Loading loan data...' },
    { progress: 50, message: 'Calculating emissions...' },
    { progress: 75, message: 'Generating reports...' }
  ];

  for (const step of steps) {
    progressTrackingService.updateProgressById(
      operationId, 
      step.progress, 
      step.message
    );
    // ... processing logic
  }
}
```

## Performance Metrics

The system tracks comprehensive metrics:

```typescript
interface ProgressMetrics {
  averageProcessingTime: number;  // Average operation duration
  itemsPerSecond: number;         // Processing throughput
  successRate: number;            // Percentage of successful operations
  errorRate: number;              // Percentage of failed operations
}
```

Access metrics via:
```typescript
const metrics = progressTrackingService.getProgressMetrics();
```

## Error Handling and Recovery

### Graceful Degradation
- **Service unavailability**: Falls back to local-only tracking
- **Network issues**: Maintains local state, syncs when reconnected
- **Storage limitations**: Continues without persistence

### Error Recovery
```typescript
// Pause/resume operations
progressTrackingService.pauseOperation(operationId, 'User requested');
progressTrackingService.resumeOperation(operationId);

// Handle failures
progressTrackingService.failOperation(operationId, 'Network error');
```

## Testing

Comprehensive test suite covers:
- **Operation lifecycle** (start, update, complete, fail)
- **State persistence** and recovery
- **Real-time integration** and event handling
- **Error scenarios** and graceful degradation
- **Performance metrics** calculation

Run tests:
```bash
npm test -- progressTrackingService.test.ts
```

## Configuration

### Persistence Settings
```typescript
private readonly STORAGE_KEY = 'pcaf_progress_state';
private readonly PERSISTENCE_INTERVAL = 2000; // 2 seconds
private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
```

### History Management
```typescript
private readonly MAX_HISTORY = 100; // Maximum stored operations
```

## Browser Compatibility

- **Modern browsers**: Full functionality with WebSocket/SSE
- **Legacy browsers**: Graceful degradation to polling
- **Mobile browsers**: Optimized for touch interfaces
- **Offline support**: Local state management when disconnected

## Security Considerations

- **No sensitive data** stored in localStorage
- **Session isolation** with unique session IDs
- **Automatic cleanup** of expired data
- **Error message sanitization** to prevent XSS

## Future Enhancements

1. **Advanced Analytics**: More detailed performance insights
2. **Custom Notifications**: User-configurable progress alerts
3. **Batch Operations**: Support for multiple concurrent operations
4. **Export Functionality**: Download progress reports and metrics
5. **Integration APIs**: Webhook support for external systems

## Troubleshooting

### Common Issues

1. **Progress not updating**
   - Check real-time service connection
   - Verify operation ID matches
   - Ensure component is subscribed to updates

2. **State not persisting**
   - Check localStorage availability
   - Verify browser storage limits
   - Check for private browsing mode

3. **Performance issues**
   - Review update frequency
   - Check for memory leaks in listeners
   - Monitor localStorage size

### Debug Mode

Enable detailed logging:
```typescript
// In development
localStorage.setItem('debug_progress_tracking', 'true');
```

## API Reference

### ProgressTrackingService

#### Methods
- `startOperation(stepId, operation, totalItems?)` - Start new operation
- `updateProgressById(id, progress, message?, processedItems?)` - Update progress
- `completeOperation(id, message?)` - Mark operation complete
- `failOperation(id, error)` - Mark operation failed
- `pauseOperation(id, reason?)` - Pause operation
- `resumeOperation(id)` - Resume paused operation
- `getProgressState()` - Get current state
- `getProgressMetrics()` - Get performance metrics
- `subscribe(listener)` - Subscribe to state changes
- `clearHistory()` - Clear operation history

#### Events
- `progress_update` - Progress changed
- `operation_started` - New operation began
- `operation_completed` - Operation finished
- `operation_failed` - Operation failed

### React Hooks

#### useProgressTracking()
Returns complete progress tracking interface with all control methods.

#### useStepProgressTracking(stepId)
Returns step-specific progress tracking for a particular workflow step.

#### useFormattedTimeRemaining(milliseconds)
Utility hook for formatting time remaining in human-readable format.

---

This implementation fully addresses the requirements for task 11:
- ✅ **Real-time service integration** with accurate progress updates
- ✅ **Meaningful status messages** and estimated time remaining
- ✅ **Progress persistence** across page refreshes and sessions
- ✅ **Comprehensive error handling** and graceful degradation
- ✅ **Performance optimization** and memory management
- ✅ **Extensive testing** and documentation