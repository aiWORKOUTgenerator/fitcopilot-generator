# Form-Aware API Client

## Overview

The `WorkoutApiClient` is a specialized API client for workout generation that addresses critical state synchronization gaps between form transitions and API requests. It provides robust error handling, request cancellation, and progress reporting specifically designed for multi-step form flows.

## Key Features

- **AbortSignal Integration**: Properly handles abort signals from form transitions
- **Timeout Management**: Automatically cancels requests that take too long
- **Progress Simulation**: Provides realistic progress updates for long-running requests
- **Automatic Retry**: Intelligently retries recoverable errors with exponential backoff
- **Error Classification**: Converts errors into user-friendly messages based on context

## API Client Architecture

The client is designed to work seamlessly with the FormFlowContext and useAbortController hook:

```
┌─────────────────────┐     ┌─────────────────────┐
│  useAbortController  │────▶│  workoutApiClient   │
└─────────────────────┘     └─────────────────────┘
           ▲                           │
           │                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│   FormFlowContext   │◀────│ WordPress REST API   │
└─────────────────────┘     └─────────────────────┘
```

## Request/Form State Synchronization

The client solves several critical synchronization issues:

1. **Signal Propagation**: Ensures abort signals propagate properly through the request lifecycle
2. **Timeout Coordination**: Combines user cancellation and timeout signals for proper cleanup
3. **Progress Reporting**: Ties progress simulation to the request lifecycle
4. **Error Context**: Preserves context about why a request was cancelled

## Usage Examples

### Basic Integration with useAbortController

```typescript
import { useAbortController } from '../hooks';
import { workoutApiClient } from '../services/workoutApiClient';

function MyComponent() {
  const { getSignal, abort } = useAbortController();
  
  const generateWorkout = async (params) => {
    try {
      const signal = getSignal('user_initiated');
      const result = await workoutApiClient.generateWorkout(
        params, 
        { signal },
        (progress) => setProgress(progress)
      );
      
      if (result.success) {
        // Handle success...
      } else {
        // Handle error...
      }
    } catch (error) {
      // Handle unexpected errors...
    }
  };
  
  const cancelRequest = () => {
    abort('user_cancelled');
  };
  
  // Component JSX...
}
```

### Integration with FormFlowContext

```typescript
import { useFormFlow } from '../context/FormFlowContext';
import { useAbortController } from '../hooks';
import { workoutApiClient } from '../services/workoutApiClient';

function WorkoutGenerationComponent() {
  const { 
    state: { currentStep },
    setProgress,
    setError,
    goToCompletedStep
  } = useFormFlow();
  
  const { getSignal, abort } = useAbortController(currentStep);
  
  const generateWorkout = async (params) => {
    try {
      const signal = getSignal();
      
      const result = await workoutApiClient.generateWorkout(
        params,
        { signal },
        setProgress
      );
      
      if (result.success) {
        goToCompletedStep();
        return result.data;
      } else {
        setError(result.message || 'Failed to generate workout');
        return null;
      }
    } catch (error) {
      setError('Unexpected error occurred');
      return null;
    }
  };
  
  // Component logic...
}
```

## Solving Request/Form State Synchronization Gaps

The WorkoutApiClient specifically addresses these key synchronization issues:

### 1. Orphaned Requests

**Problem**: When users navigate between form steps, requests continue in the background, potentially causing state conflicts.

**Solution**: The client uses a combined signal approach where:
- Form step transitions automatically trigger abort signals
- All pending requests are properly cleaned up
- Progress simulation stops immediately

```typescript
// In the Form component
const { getSignal } = useAbortController(currentStep); // Step-aware signal

// When step changes, the abort signal is automatically triggered
```

### 2. Inconsistent Error States

**Problem**: Errors from cancelled requests can show misleading messages to users.

**Solution**: The client transforms error responses based on abort reason:
- User-initiated cancellations show "Request cancelled" messages
- Timeout errors show appropriate timeout messages
- Form navigation cancellations are handled silently

### 3. Progress Indicator Desynchronization

**Problem**: Progress indicators continue after requests are cancelled.

**Solution**: The client's progress simulation is tied to the request lifecycle:
- Progress callbacks stop immediately when requests are aborted
- Intervals are properly cleaned up to prevent memory leaks
- Signal listeners ensure synchronization

## Implementation Details

### Signal Combination

The client combines multiple signals (user abort, timeout) to ensure proper cancellation:

```typescript
private combineSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  
  signals.forEach(signal => {
    const onAbort = () => {
      controller.abort(signal.reason);
      signals.forEach(s => s.removeEventListener('abort', onAbort));
    };
    
    if (signal.aborted) {
      onAbort();
    } else {
      signal.addEventListener('abort', onAbort);
    }
  });
  
  return controller.signal;
}
```

### Progress Simulation

Progress simulation is tied to the request lifecycle:

```typescript
private simulateProgress(
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): void {
  // Set up progress simulation...
  
  // Clean up when signal aborts
  signal?.addEventListener('abort', () => {
    intervals.forEach(clearInterval);
  });
}
```

## Error Handling Strategy

The client implements a comprehensive error handling strategy:

1. **Classification**: Errors are classified by type (abort, network, API, etc.)
2. **Context Preservation**: The abort reason is extracted and preserved
3. **User Messaging**: Error messages are tailored based on the context
4. **Recovery**: Recoverable errors are automatically retried 