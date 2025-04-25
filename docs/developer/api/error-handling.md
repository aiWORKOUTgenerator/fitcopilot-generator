# API Error Handling

The FitCopilot Workout Generator API implements a standardized error handling system to make error responses consistent and easy to process. This document describes the error response format, common error codes, and best practices for handling errors in your applications.

## Error Response Format

All API error responses follow this standardized format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "error_code",
  "data": {
    // Optional additional error data
  }
}
```

### Fields Explanation

- **`success`**: Always `false` for error responses
- **`message`**: Human-readable description of the error
- **`code`**: Machine-readable error code for programmatic handling
- **`data`**: Optional additional data providing context for the error

## Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_params` | Missing or invalid parameters in the request |
| 400 | `already_completed` | Workout already marked as completed |
| 400 | `missing_api_key` | OpenAI API key not configured |
| 401 | `rest_forbidden` | User not logged in |
| 403 | `rest_cookie_invalid_nonce` | Invalid nonce for cookie authentication |
| 403 | `unauthorized_access` | User doesn't have permission to access the resource |
| 404 | `not_found` | Requested resource not found |
| 429 | `rate_limit_exceeded` | Too many requests within the time limit |
| 500 | `generation_error` | Error occurred during workout generation |
| 503 | `ai_service_unavailable` | OpenAI service temporarily unavailable |

## WordPress REST API Errors

In addition to custom error codes, the WordPress REST API may also return standard error responses:

```json
{
  "code": "rest_no_route",
  "message": "No route was found matching the URL and request method",
  "data": {
    "status": 404
  }
}
```

These errors typically occur at the WordPress REST API level before reaching the plugin's code.

## OpenAI API Errors

When errors occur during interaction with the OpenAI API, they are translated into a standardized format:

```json
{
  "success": false,
  "message": "Error from OpenAI: Rate limit exceeded",
  "code": "generation_error",
  "data": {
    "openai_error": {
      "type": "rate_limit_exceeded",
      "message": "You have reached your rate limit."
    }
  }
}
```

## Error Handling Best Practices

### Front-End Error Handling

```javascript
async function generateWorkout(params) {
  try {
    const response = await fetch('/wp-json/fitcopilot/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': wpApiSettings.nonce
      },
      body: JSON.stringify(params)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      // Handle specific error codes
      switch (data.code) {
        case 'missing_api_key':
          // Show message about configuring API key
          displayError('Please configure your OpenAI API key in the settings.');
          break;
        case 'invalid_params':
          // Highlight form fields with errors
          highlightFormErrors(data.data?.validation_errors);
          break;
        case 'generation_error':
          // Show a message about AI generation issues
          displayError('There was a problem generating your workout. Please try again later.');
          break;
        default:
          // Generic error handling
          displayError(data.message || 'An unknown error occurred');
      }
      return null;
    }
    
    return data.data;
  } catch (error) {
    // Network errors or JSON parsing errors
    displayError('Network error. Please check your connection.');
    console.error('API request failed:', error);
    return null;
  }
}
```

### Back-End Error Implementation

In PHP, errors are structured using the `rest_ensure_response` function:

```php
/**
 * Return an error response
 *
 * @param string $message Error message
 * @param string $code Error code
 * @param array $data Additional error data
 * @param int $status HTTP status code
 * @return \WP_REST_Response
 */
private function error_response($message, $code, $data = [], $status = 400) {
    return rest_ensure_response([
        'success' => false,
        'message' => $message,
        'code'    => $code,
        'data'    => $data,
    ], $status);
}
```

Example usage in an endpoint:

```php
if (empty($params['specific_request'])) {
    return $this->error_response(
        __('Missing required parameters.', 'fitcopilot'),
        'invalid_params',
        ['required' => ['specific_request']],
        400
    );
}
```

## Validation Errors

For form validation errors, the `data` field may contain field-specific error information:

```json
{
  "success": false,
  "message": "Invalid parameters in request",
  "code": "invalid_params",
  "data": {
    "validation_errors": {
      "duration": "Duration must be between 10 and 120 minutes",
      "difficulty": "Difficulty must be one of: beginner, intermediate, advanced"
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. When rate limits are exceeded, you'll receive:

```json
{
  "success": false,
  "message": "Too many requests. Please try again in 60 seconds.",
  "code": "rate_limit_exceeded",
  "data": {
    "retry_after": 60
  }
}
```

Rate limits:
- 60 requests per minute per user
- 10 workout generation requests per hour per user

## Logging and Debugging

Error responses may include additional debugging information in development environments when the `debug` flag is set to `true`:

```json
{
  "success": false,
  "message": "Error generating workout",
  "code": "generation_error",
  "data": {
    "debug_info": {
      "request_id": "abc123",
      "stacktrace": "...",
      "request_params": {
        // Sanitized request parameters
      }
    }
  }
}
```

This information is not included in production environments.

## Related Documentation

- [API Endpoints](./endpoints.md)
- [Authentication](./authentication.md)
- [OpenAPI Specification](./openapi-spec.md) 