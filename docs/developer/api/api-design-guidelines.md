# API Design Guidelines

This document outlines the standardized patterns and best practices for FitCopilot's REST API design. These guidelines ensure consistency, maintainability, and developer-friendly interactions across all API endpoints.

## Table of Contents

- [Core Principles](#core-principles)
- [API Endpoints Structure](#api-endpoints-structure)
- [Request Format Standards](#request-format-standards)
- [Response Format Standards](#response-format-standards)
- [Error Handling Standards](#error-handling-standards)
- [Naming Conventions](#naming-conventions)
- [Data Type Validation](#data-type-validation)
- [Implementation Best Practices](#implementation-best-practices)

## Core Principles

FitCopilot's API design follows these core principles:

1. **Consistency** - Maintain consistent patterns across all endpoints
2. **Predictability** - Developers should be able to predict how endpoints will behave
3. **Self-documentation** - APIs should be intuitive and self-explanatory
4. **Compatibility** - Changes should maintain backward compatibility when possible
5. **Security** - Follow best practices for secure API design

## API Endpoints Structure

All FitCopilot API endpoints follow this URL structure:

```
/wp-json/fitcopilot/v1/{resource}[/{identifier}][/{sub-resource}]
```

Examples:
- `/wp-json/fitcopilot/v1/workouts` - List all workouts
- `/wp-json/fitcopilot/v1/workouts/123` - Get a specific workout
- `/wp-json/fitcopilot/v1/workouts/123/complete` - Resource with sub-resource action

## Request Format Standards

### GET Requests

- Use URL parameters directly without wrappers
- Use query parameters for filtering, sorting, and pagination
- Example: `/workouts?limit=10&page=2&sort=date`

### POST/PUT/PATCH Requests

For consistency, all POST/PUT/PATCH requests should use a wrapped object format:

```json
{
  "resource_type": {
    "field1": "value1",
    "field2": "value2",
    "nested_object": {
      "nested_field": "value"
    }
  }
}
```

Where:
- `resource_type` is the name of the resource (e.g., "profile", "workout")
- This wrapper provides context and flexibility for complex objects

Examples:

```json
// POST /generate
{
  "workout": {
    "duration": 30,
    "difficulty": "intermediate",
    "equipment": ["dumbbells", "resistance-bands"],
    "goals": "build-muscle",
    "restrictions": "low impact only"
  }
}

// PUT /profile
{
  "profile": {
    "fitnessLevel": "intermediate",
    "goals": ["strength", "endurance"],
    "limitations": "knee injury"
  }
}
```

## Response Format Standards

All API responses MUST follow this standardized format:

```json
{
  "success": true|false,
  "data": { /* payload */ } | null,
  "message": "Human-readable message",
  "code": "machine_readable_code" // For errors only
}
```

Where:
- `success` is a boolean indicating if the request succeeded
- `data` contains the response payload (object or array) or null for errors
- `message` is ALWAYS included for both success and error cases
- `code` is included ONLY for error responses

### Success Response Examples

```json
// GET /workouts
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "30-Minute HIIT Workout",
      "date": "2023-07-15T14:30:00"
    },
    {
      "id": 124,
      "title": "Strength Training Session",
      "date": "2023-07-16T09:00:00"
    }
  ],
  "message": "Workouts retrieved successfully"
}

// GET /profile
{
  "success": true,
  "data": {
    "id": 456,
    "fitnessLevel": "intermediate",
    "goals": ["strength", "endurance"]
  },
  "message": "Profile retrieved successfully"
}
```

## Error Handling Standards

Error responses follow the same structure but with additional error information:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "machine_readable_error_code",
  "data": {
    // Optional additional error data
  }
}
```

### Error Types and Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_params` | Missing or invalid parameters |
| 400 | `validation_error` | Input validation failed |
| 401 | `not_authenticated` | User not logged in |
| 403 | `forbidden` | User lacks permission |
| 404 | `not_found` | Resource not found |
| 429 | `rate_limited` | Too many requests |
| 500 | `server_error` | Server-side error |

### Validation Error Example

For validation errors, include field-specific messages:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "validation_error",
  "data": {
    "validation_errors": {
      "duration": "Duration must be between 10 and 120 minutes",
      "difficulty": "Difficulty must be one of: beginner, intermediate, advanced"
    }
  }
}
```

## Naming Conventions

### Resource Names
- Use plural nouns for collections (e.g., `/workouts`, `/profiles`)
- Use singular nouns for specific resources (e.g., `/profile` for the current user's profile)

### Field Names
- Use camelCase for all field names in frontend code (JavaScript/TypeScript)
- Use snake_case for all field names in backend code (PHP)
- The backend should handle the conversion between these formats

Example:
```json
// Frontend sends and receives:
{
  "fitnessLevel": "intermediate",
  "workoutDuration": 30
}

// Backend stores and processes:
{
  "fitness_level": "intermediate",
  "workout_duration": 30
}
```

## Data Type Validation

### Type Coercion Rules

- Numeric strings should be converted to numbers when appropriate
- Boolean strings ("true"/"false") should be converted to boolean values
- Arrays should be validated for correct item types
- Empty strings for optional fields should be treated as null or undefined

### Required vs Optional Fields

Documentation for each endpoint should clearly specify:
- Which fields are required vs optional
- Default values for optional fields
- Validation constraints (min/max values, allowed options, etc.)

## Implementation Best Practices

### Backend Implementation

PHP endpoints should follow this pattern:

```php
/**
 * Handler for resource endpoint
 */
function handle_resource_request($request) {
  // 1. Parse and validate the request
  $params = json_decode($request->get_body(), true);
  
  // 2. Extract the resource data from wrapper if present
  if (isset($params['resource_type']) && is_array($params['resource_type'])) {
    $params = $params['resource_type'];
  }
  
  // 3. Validate the parameters
  $validation_errors = validate_params($params);
  if (!empty($validation_errors)) {
    return new WP_REST_Response([
      'success' => false,
      'message' => 'Validation failed',
      'code' => 'validation_error',
      'data' => [
        'validation_errors' => $validation_errors
      ]
    ], 400);
  }
  
  // 4. Process the request
  // ...
  
  // 5. Return a standardized response
  return new WP_REST_Response([
    'success' => true,
    'data' => $result,
    'message' => 'Operation completed successfully'
  ]);
}
```

### Frontend Implementation

TypeScript API calls should use a consistent pattern:

```typescript
/**
 * Generic API call function
 */
async function apiCall<T, R>(endpoint: string, method: string, data?: T): Promise<ApiResponse<R>> {
  const response = await fetch(`/wp-json/fitcopilot/v1${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': wpApiSettings.nonce
    },
    body: data ? JSON.stringify(data) : undefined
  });
  
  const result = await response.json();
  
  if (!result.success) {
    // Handle error
    throw new ApiError(result.message, result.code, result.data);
  }
  
  return result;
}

// Example usage:
const updateProfile = async (profileData: ProfileData): Promise<Profile> => {
  const response = await apiCall<{profile: ProfileData}, Profile>(
    '/profile',
    'PUT',
    { profile: profileData }
  );
  return response.data;
};
```

## Conclusion

Following these guidelines ensures a consistent, predictable, and developer-friendly API experience. All new endpoints should adhere to these standards, and existing endpoints should be gradually updated to match these patterns when possible.

For specific endpoint implementation details, refer to the [Endpoints Documentation](./endpoints.md) and [OpenAPI Specification](./openapi-spec.md). 