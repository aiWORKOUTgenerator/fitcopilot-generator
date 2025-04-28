# Enhanced AbortController Hook

## Overview

The `useAbortController` hook provides a robust wrapper around the browser's native AbortController API with significant enhancements for FitCopilot's multi-step form architecture and API interaction patterns.

This hook centralizes abort logic with reason tracking, automatic cleanup, and form step awareness, solving critical reliability issues in workout generation flows.

## Key Benefits

- **Explicit abort reasons** for better error identification and user messaging
- **Automatic request cleanup** on component unmount and form step transitions
- **Step-aware cancellation** specifically designed for multi-step forms
- **Prevention of memory leaks** from orphaned AbortController instances
- **Standardized error handling** across the application

## Hook API

```typescript
function useAbortController(currentStep?: FormSteps) {
  // Returns:
  return {
    getSignal,      // Get a new AbortSignal for requests
    abort,          // Manually abort the current request
    hasActiveRequest, // Check if there is an active request
    getCurrentReason, // Get the current abort reason if any
    clear           // Clear controller references
  };
}
```

### Standardized Abort Reasons

```typescript
export type AbortReason = 
  | 'user_cancelled'      // User explicitly cancelled the request
  | 'step_transition'     // Form step changed during request
  | 'timeout'             // Request took too long
  | 'component_unmount'   // Component unmounted during request
  | 'form_reset'          // Form was reset during request
  | 'new_request_started'; // New request superseded this one
```

## Usage Guide

### Basic Usage

```tsx
import { useAbortController } from '../../hooks';

function MyApiComponent() {
  const { getSignal, abort } = useAbortController();
  
  const fetchData = async () => {
    try {
      // Get a fresh signal for this request
      const signal = getSignal();
      
      const response = await fetch('/api/data', { signal });
      // Process response...
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handle abort case specifically
        console.log(`Request aborted: ${error.message}`);
      } else {
        // Handle other errors
      }
    }
  };
  
  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      <button onClick={() => abort('user_cancelled')}>Cancel</button>
    </div>
  );
}
```

### With Form Steps

```tsx
import { useAbortController } from '../../hooks';
import { useFormFlow } from '../../context/FormFlowContext';

function WorkoutGenerationComponent() {
  const { state: { currentStep } } = useFormFlow();
  const { getSignal, abort } = useAbortController(currentStep);
  
  // Requests will automatically abort when currentStep changes
  // ...
}
```

## Migration Strategy

We recommend a gradual migration approach for existing AbortController implementations in the FitCopilot codebase:

### 1. Preserve Existing Implementations

**Do not remove or refactor existing AbortController code immediately.** The current implementations are functional and have been tested in production. Sudden wholesale changes could introduce regressions.

```typescript
// KEEP existing code like this for now
const abortControllerRef = useRef<AbortController | null>(null);

// Later in the code
abortControllerRef.current = new AbortController();
// ...
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}
```

### 2. Incremental Migration

When working on components with existing AbortController logic, follow this migration checklist:

1. **Identify** all places where AbortController is used in the component
2. **Replace** with `useAbortController` hook
3. **Update** error handling to utilize the abort reason
4. **Test** thoroughly to ensure functionality is preserved
5. **Document** the changes in pull request

Example migration diff:

```diff
- const abortControllerRef = useRef<AbortController | null>(null);
- 
- // Later in the code
- if (abortControllerRef.current) {
-   abortControllerRef.current.abort();
- }
- abortControllerRef.current = new AbortController();
- const signal = abortControllerRef.current.signal;

+ const { getSignal, abort } = useAbortController(currentStep);
+ 
+ // Later in the code
+ const signal = getSignal();
+ 
+ // When cancellation is needed
+ abort('user_cancelled');
```

### 3. New Component Development

For all new components or features, use the `useAbortController` hook exclusively:

- Never use raw AbortController instances in new code
- Always leverage the reason tracking capabilities for better error messaging
- Integrate with form steps where appropriate

## Error Handling Best Practices

When using the `useAbortController` hook, follow these error handling patterns:

```typescript
try {
  const signal = getSignal();
  const response = await fetchWithSignal(signal);
  // Handle success
} catch (error) {
  if (error.name === 'AbortError') {
    // Extract the abort reason from the error message
    const reason = error.message.includes(':') 
      ? error.message.split(':')[1].trim()
      : 'unknown';
      
    switch (reason) {
      case 'user_cancelled':
        // User initiated - no error message needed
        break;
      case 'timeout':
        setError('The request took too long. Please try again.');
        break;
      case 'step_transition':
        // Expected during navigation - no error message needed
        break;
      case 'component_unmount':
        // Expected during navigation - no error message needed
        break;
      default:
        setError('The request was cancelled unexpectedly.');
    }
  } else {
    // Handle other API errors
    setError('An error occurred: ' + error.message);
  }
}
```

## Integrating with FormFlowContext

For workout generation components that use `FormFlowContext`, integrate AbortController with form transitions:

```typescript
function WorkoutGenerationComponent() {
  const { 
    state: { currentStep },
    setGenerationStatus 
  } = useFormFlow();
  
  const { getSignal, abort } = useAbortController(currentStep);
  
  const generateWorkout = async (params) => {
    try {
      setGenerationStatus('generating');
      
      const signal = getSignal();
      const response = await api.generateWorkout(params, { signal });
      
      setGenerationStatus('completed');
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        const reason = error.message.includes(':') 
          ? error.message.split(':')[1].trim()
          : 'unknown';
          
        if (reason === 'user_cancelled') {
          setGenerationStatus('idle');
        } else {
          setGenerationStatus('error');
        }
      } else {
        setGenerationStatus('error');
      }
    }
  };
  
  // ...
}
```

## Testing Components with useAbortController

When testing components that use `useAbortController`, mock the abort behavior:

```typescript
// In your test
test('should handle abort correctly', async () => {
  // Setup component with mock implementations
  const { result, waitForNextUpdate } = renderHook(() => {
    const abortController = useAbortController();
    const [data, setData] = useState(null);
    
    const fetchData = async () => {
      try {
        const signal = abortController.getSignal();
        const response = await mockFetch(signal);
        setData(response);
      } catch (error) {
        // Error handling
      }
    };
    
    return { fetchData, abort: () => abortController.abort('user_cancelled'), data };
  });
  
  // Start fetch then abort it
  act(() => {
    result.current.fetchData();
  });
  
  act(() => {
    result.current.abort();
  });
  
  // Assert expected behavior after abort
  // ...
});
```

## Conclusion

The `useAbortController` hook represents a significant improvement in FitCopilot's request lifecycle management, particularly for the complex workout generation flow. By standardizing abort patterns, tracking reasons, and integrating with the form flow, it addresses key reliability challenges in the application.

Follow the gradual migration strategy to implement these improvements while minimizing risk to existing functionality. 