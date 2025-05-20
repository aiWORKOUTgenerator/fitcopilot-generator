# API Standardization Implementation Strategy

This document outlines the implementation strategy and rollout plan for standardizing all FitCopilot API endpoints while maintaining backward compatibility.

## Core Implementation Principles

1. **Backward Compatibility:** All changes must maintain backward compatibility with existing clients
2. **Gradual Rollout:** Implement changes in phases, starting with highest priority endpoints
3. **Comprehensive Testing:** Each change must be thoroughly tested before deployment
4. **Clear Documentation:** Update documentation with each change, highlighting both old and new patterns

## Implementation Components

### 1. Core Utility Functions

Create reusable utility functions to standardize API request/response handling:

```php
/**
 * Extract data from wrapper if present
 * 
 * @param array $params Request parameters
 * @param string $wrapper_key The wrapper key to look for
 * @return array Normalized parameters
 */
function normalize_request_data($params, $wrapper_key) {
  if (isset($params[$wrapper_key]) && is_array($params[$wrapper_key])) {
    return $params[$wrapper_key];
  }
  return $params;
}

/**
 * Create a standardized response object
 * 
 * @param mixed $data Response data
 * @param string $message Response message
 * @param bool $success Success indicator
 * @param string|null $code Error code (for errors only)
 * @param int $status HTTP status code
 * @return \WP_REST_Response
 */
function create_api_response($data, $message, $success = true, $code = null, $status = 200) {
  $response = [
    'success' => $success,
    'message' => $message,
  ];
  
  if ($success) {
    $response['data'] = $data;
  } else {
    $response['code'] = $code;
    if ($data) {
      $response['data'] = $data;
    }
  }
  
  return new \WP_REST_Response($response, $status);
}
```

### 2. Endpoint-Specific Standardization

#### Common Update Pattern

For each endpoint:

1. Modify request handling:
   ```php
   $params = json_decode($request->get_body(), true);
   $params = normalize_request_data($params, 'resource_name');
   ```

2. Standardize responses:
   ```php
   return create_api_response(
     $data,
     'Operation completed successfully'
   );
   ```

3. Standardize error handling:
   ```php
   return create_api_response(
     null,
     'Error message',
     false,
     'error_code',
     400
   );
   ```

## Phased Implementation Plan

### Phase 1: Foundation (Week 1)

1. **Create Utility Functions**
   - Implement `normalize_request_data()` and `create_api_response()`
   - Add them to a common utility file
   - Write unit tests

2. **Update Documentation**
   - Update API Design Guidelines
   - Create migration guide for client developers
   - Document both formats (with preferred format highlighted)

### Phase 2: High-Priority Endpoints (Week 2)

1. **Workout Generation Endpoint**
   - Update `generate_workout()` to use utility functions
   - Accept both direct and wrapped formats
   - Standardize response format
   - Add comprehensive tests

2. **Workout Management Endpoints**
   - Update all workout endpoints to use utility functions
   - Standardize request/response formats
   - Add tests for both formats

### Phase 3: Medium-Priority Endpoints (Week 3)

1. **Profile Endpoints**
   - Update GET responses to include consistent message field
   - Ensure PUT endpoint properly documents both formats
   - Complete test coverage

2. **API Tracker Endpoints**
   - Update admin-facing endpoints
   - Standardize response formats
   - Add basic tests

### Phase 4: Frontend Integration (Week 4)

1. **Update Frontend API Clients**
   - Update common API utility functions
   - Standardize request construction
   - Add proper error handling

2. **Deprecation Notices**
   - Add console warnings for direct format usage
   - Provide migration examples in logs

## Rollout Strategy

### Feature Flags

Implement feature flags to gradually enable new API patterns:

```php
// Check if new API standards are enabled
$use_new_standards = get_option('fitcopilot_use_new_api_standards', false);

if ($use_new_standards) {
  // Use new standardized functions
} else {
  // Use legacy approach
}
```

This allows for quick rollback if issues are discovered.

### Backward Compatibility Guarantees

1. **Request Format Compatibility:**
   - Accept both direct and wrapped formats
   - Document both with clear preference for wrapped

2. **Response Format Evolution:**
   - Add fields (like `message`) without breaking existing clients
   - Maintain existing field structure and types

3. **Deprecation Timeline:**
   - Maintain dual support for at least 6 months
   - Add deprecation notices in documentation
   - Plan for eventual deprecation of direct format

## Testing Strategy

### Pre-Deployment Testing

1. **Unit Tests:**
   - Test each endpoint with both formats
   - Test error handling and edge cases
   - Verify response format compliance

2. **Integration Tests:**
   - Test with existing frontend components
   - Verify backward compatibility
   - Test new client code with standardized format

### Post-Deployment Monitoring

1. **Error Rate Monitoring:**
   - Track API errors by endpoint
   - Monitor for increased error rates

2. **Performance Monitoring:**
   - Track response times before and after changes
   - Ensure no performance regressions

3. **Client Usage Analysis:**
   - Track adoption of wrapped format
   - Monitor for unexpected client issues

## Rollback Plan

In case of critical issues:

1. **Immediate Rollback:**
   - Disable feature flag for new standards
   - Revert to previous endpoint implementations

2. **Partial Rollback:**
   - Roll back specific problematic endpoints
   - Keep working endpoints on new standard

3. **Communication Plan:**
   - Notify developers of rollback
   - Provide workaround instructions if needed

## Documentation Updates

With each phase, update:

1. **API Reference Documentation:**
   - Document both formats
   - Clearly mark preferred format
   - Add migration examples

2. **OpenAPI Specification:**
   - Update to reflect new patterns
   - Include both formats in specification

3. **Code Examples:**
   - Update all examples to use preferred format
   - Include migration examples

## Success Criteria

Implementation will be considered successful when:

1. All endpoints support both formats
2. All responses follow standardized structure
3. Test coverage meets quality targets
4. Documentation is complete and accurate
5. No increase in client error rates
6. Performance metrics remain stable or improve 