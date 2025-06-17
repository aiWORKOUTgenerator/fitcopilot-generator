# API Helper Functions Documentation

This module provides a comprehensive set of utility functions for API interactions within the FitCopilot Workout Generator. These helpers standardize common patterns for URL construction, request preparation, error handling, and response processing.

## Table of Contents

- [Quick Start](#quick-start)
- [Core Functions](#core-functions)
- [URL Building](#url-building)
- [Request Preparation](#request-preparation)
- [Error Handling](#error-handling)
- [Advanced Utilities](#advanced-utilities)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## Quick Start

```typescript
import { 
  buildApiUrl, 
  preparePostRequest, 
  apiFetch, 
  extractErrorMessage,
  API_ENDPOINTS 
} from '../api';

// Basic usage example
async function saveWorkout(workout: GeneratedWorkout) {
  try {
    const url = buildApiUrl(API_ENDPOINTS.WORKOUTS);
    const options = preparePostRequest(workout);
    const response = await apiFetch(url, options);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}
```

## Core Functions

### apiFetch

The primary function for making API requests with built-in retry logic, timeout, and error handling.

```typescript
import { apiFetch, ApiResponse } from '../api';

const response = await apiFetch<ApiResponse<WorkoutData>>(url, options);
```

### buildApiUrl

Constructs complete API URLs from endpoint paths.

```typescript
import { buildApiUrl, API_ENDPOINTS } from '../api';

// Basic usage
const url = buildApiUrl('/workouts');
// Result: "/wp-json/fitcopilot/v1/workouts"

// Using predefined endpoints
const workoutUrl = buildApiUrl(API_ENDPOINTS.WORKOUT('123'));
// Result: "/wp-json/fitcopilot/v1/workouts/123"

// Custom base URL
const customUrl = buildApiUrl('/custom', '/wp-json/myapi/v1');
// Result: "/wp-json/myapi/v1/custom"
```

## URL Building

### buildUrlWithParams

Adds query parameters to URLs with proper encoding and array handling.

```typescript
import { buildUrlWithParams } from '../api';

const baseUrl = '/wp-json/fitcopilot/v1/workouts';
const params = {
  page: 1,
  per_page: 10,
  tags: ['strength', 'cardio'],
  difficulty: 'intermediate'
};

const url = buildUrlWithParams(baseUrl, params);
// Result: "/wp-json/fitcopilot/v1/workouts?page=1&per_page=10&tags=strength%2Ccardio&difficulty=intermediate"
```

### createPaginationParams

Creates standardized pagination parameter objects.

```typescript
import { createPaginationParams } from '../api';

// Basic pagination
const params = createPaginationParams(2, 20);
// Result: { page: 2, per_page: 20 }

// With additional filters
const advancedParams = createPaginationParams(1, 10, {
  difficulty: 'beginner',
  equipment: 'bodyweight'
});
// Result: { page: 1, per_page: 10, difficulty: 'beginner', equipment: 'bodyweight' }
```

## Request Preparation

### preparePostRequest

Prepares POST request options with proper headers and body serialization.

```typescript
import { preparePostRequest } from '../api';

const workout = { title: 'My Workout', difficulty: 'intermediate' };
const options = preparePostRequest(workout);

// Automatically includes:
// - Content-Type: application/json
// - X-WP-Nonce: [WordPress nonce]
// - Properly JSON-stringified body
```

### preparePutRequest

Prepares PUT request options for updates.

```typescript
import { preparePutRequest } from '../api';

const updatedWorkout = { id: '123', title: 'Updated Workout' };
const options = preparePutRequest(updatedWorkout);
```

### prepareDeleteRequest

Prepares DELETE request options.

```typescript
import { prepareDeleteRequest } from '../api';

const options = prepareDeleteRequest();
// Includes proper headers and authentication
```

### prepareHeaders

Creates standardized headers with WordPress authentication.

```typescript
import { prepareHeaders } from '../api';

// Standard headers
const headers = prepareHeaders();
// Result: { 'Content-Type': 'application/json', 'X-WP-Nonce': '...' }

// Custom headers
const customHeaders = prepareHeaders({
  'Custom-Header': 'value'
}, false); // false = don't include nonce
```

## Error Handling

### extractErrorMessage

Extracts human-readable error messages from various error types.

```typescript
import { extractErrorMessage } from '../api';

try {
  await apiCall();
} catch (error) {
  const message = extractErrorMessage(error);
  console.error('Operation failed:', message);
}
```

### Error Type Checking

Check for specific error types to provide appropriate user feedback.

```typescript
import { isNetworkError, isAuthError, isValidationError } from '../api';

try {
  await apiCall();
} catch (error) {
  if (isNetworkError(error)) {
    showMessage('Please check your internet connection');
  } else if (isAuthError(error)) {
    showMessage('Please log in to continue');
  } else if (isValidationError(error)) {
    showMessage('Please check your input and try again');
  } else {
    showMessage('An unexpected error occurred');
  }
}
```

## Advanced Utilities

### withRetry

Automatically retry failed requests with exponential backoff.

```typescript
import { withRetry } from '../api';

// Retry a function up to 3 times
const result = await withRetry(
  () => apiFetch(url, options),
  3,     // max attempts
  1000   // base delay in ms
);
```

### withTimeout

Add timeout functionality to promises.

```typescript
import { withTimeout } from '../api';

// Timeout after 10 seconds
const result = await withTimeout(
  apiFetch(url, options),
  10000
);
```

### debounce

Debounce API calls to prevent excessive requests.

```typescript
import { debounce } from '../api';

const debouncedSearch = debounce(async (query: string) => {
  return await searchWorkouts(query);
}, 300);

// Usage in component
const handleSearch = (query: string) => {
  debouncedSearch(query).then(results => {
    setSearchResults(results);
  });
};
```

### batchRequests

Execute multiple API requests with controlled concurrency.

```typescript
import { batchRequests } from '../api';

const workoutIds = ['1', '2', '3', '4', '5'];
const requests = workoutIds.map(id => 
  () => getWorkout(id)
);

// Execute 3 requests at a time
const workouts = await batchRequests(requests, 3);
```

## Best Practices

### 1. Always Use Helper Functions

```typescript
// ❌ Manual URL construction
const url = `/wp-json/fitcopilot/v1/workouts/${id}`;

// ✅ Using helpers
const url = buildApiUrl(API_ENDPOINTS.WORKOUT(id));
```

### 2. Use Predefined Endpoints

```typescript
// ❌ Magic strings
const url = buildApiUrl('/workouts/123/complete');

// ✅ Predefined endpoints
const url = buildApiUrl(API_ENDPOINTS.WORKOUT_COMPLETE('123'));
```

### 3. Handle Errors Appropriately

```typescript
// ❌ Generic error handling
try {
  await apiCall();
} catch (error) {
  throw error; // Unhelpful to users
}

// ✅ Specific error handling
try {
  await apiCall();
} catch (error) {
  if (isNetworkError(error)) {
    throw new Error('Network error. Please check your connection.');
  } else if (isAuthError(error)) {
    throw new Error('You are not authorized to perform this action.');
  } else {
    throw new Error(extractErrorMessage(error));
  }
}
```

### 4. Use Appropriate Request Helpers

```typescript
// ❌ Manual request preparation
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': getNonce()
  },
  body: JSON.stringify(data)
};

// ✅ Using helpers
const options = preparePostRequest(data);
```

## Migration Guide

### From Old workoutService.ts

If you're migrating from the old implementation:

```typescript
// OLD
const response = await apiFetch({
  path: `${API_PATH}/workouts/${id}`,
  method: 'GET',
});

// NEW
const url = buildApiUrl(API_ENDPOINTS.WORKOUT(id));
const response = await apiFetch(url, { method: HTTP_METHODS.GET });
```

### From Other API Patterns

```typescript
// OLD - Direct fetch calls
const response = await fetch('/wp-json/fitcopilot/v1/workouts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// NEW - Using helpers
const url = buildApiUrl(API_ENDPOINTS.WORKOUTS);
const options = preparePostRequest(data);
const response = await apiFetch(url, options);
```

## Configuration

### API_CONFIG

Default configuration values:

```typescript
export const API_CONFIG = {
  BASE_PATH: '/wp-json/fitcopilot/v1',
  TIMEOUT: 180000,       // 3 minutes to match backend timeout
  RETRY_ATTEMPTS: 3,     // 3 retry attempts
  RETRY_DELAY: 1000,     // 1 second base delay
} as const;
```

### API_ENDPOINTS

Predefined endpoint paths:

```typescript
export const API_ENDPOINTS = {
  WORKOUTS: '/workouts',
  WORKOUT: (id: string) => `/workouts/${id}`,
  WORKOUT_COMPLETE: (id: string) => `/workouts/${id}/complete`,
  PROFILE: '/profile',
  GENERATE: '/generate',
  HEALTH_CHECK: '/health',
} as const;
```

## TypeScript Support

All functions are fully typed with TypeScript for excellent developer experience:

```typescript
// Type-safe API responses
const response = await apiFetch<ApiResponse<GeneratedWorkout>>(url, options);
response.data; // TypeScript knows this is GeneratedWorkout

// Type-safe error checking
if (isValidApiResponse<WorkoutData>(response)) {
  // TypeScript knows response.data is WorkoutData
}
```

This API helper system provides a robust, consistent, and developer-friendly way to interact with the WordPress REST API while maintaining type safety and error resilience. 