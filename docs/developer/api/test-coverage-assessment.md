# API Test Coverage Assessment

This document analyzes the current test coverage for API endpoints and identifies gaps that need to be addressed as part of the API standardization initiative.

## Current Test Coverage Summary

| Endpoint | Unit Tests | Integration Tests | Manual Tests | Coverage Level |
|----------|------------|-------------------|--------------|---------------|
| `/generate` | Partial | Minimal | Yes | LOW |
| `/workouts` | Minimal | None | Yes | LOW |
| `/workouts/{id}` | Minimal | None | Yes | LOW |
| `/workouts/{id}/complete` | None | None | Yes | VERY LOW |
| `/profile` | Good | Minimal | Yes | MEDIUM |
| `/api-tracker/*` | Minimal | None | Minimal | VERY LOW |

## Detailed Analysis by Endpoint

### Profile Endpoints

**Current Coverage:**
- Unit tests exist for `ProfileEndpointsTest.php` testing both wrapped and direct formats
- Manual test script available (`test-profile-api.js`)

**Test Gaps:**
- No integration tests with frontend components
- Limited validation error testing
- No performance testing

**Required Tests:**
- Test all profile fields with both formats
- Test malformed requests and error handling
- Test frontend integration

### Workout Generation Endpoint

**Current Coverage:**
- Basic unit tests for generation process
- Manual testing via UI

**Test Gaps:**
- No tests for invalid parameters
- No tests for API request/response format
- No load testing for large requests

**Required Tests:**
- Test with wrapped format
- Test error scenarios (API key missing, invalid parameters)
- Test with various workout types and parameters

### Workout Management Endpoints

**Current Coverage:**
- Minimal unit tests for core functionality
- Manual testing via UI

**Test Gaps:**
- No dedicated API endpoint tests
- No tests for error conditions
- No tests for request/response format validation

**Required Tests:**
- Test all CRUD operations
- Test pagination and filtering
- Test error handling
- Test with both direct and wrapped formats

### API Tracker Endpoints

**Current Coverage:**
- Very limited testing
- Some manual admin panel testing

**Test Gaps:**
- No automated tests
- No format validation tests
- No permission tests

**Required Tests:**
- Test all endpoints with proper permissions
- Test response format consistency
- Test error handling

## Test Plan for Each Endpoint

### 1. Profile Endpoints (`/profile`)

#### Unit Tests
- Test GET response format and required fields
- Test PUT with direct format (backward compatibility)
- Test PUT with wrapped format (preferred)
- Test validation errors and handling
- Test with empty/malformed data
- Test permission checks

#### Integration Tests
- Test frontend components with API responses
- Test error handling in UI
- Test form submission and data flow

#### Performance Tests
- Test response times with different profile sizes
- Test concurrent requests

### 2. Workout Generation Endpoint (`/generate`)

#### Unit Tests
- Test request normalization (direct and wrapped formats)
- Test parameter validation
- Test response format
- Test error scenarios (API key missing, rate limits)
- Test with minimal vs. complex workout requests

#### Integration Tests
- Test UI form submission
- Test error display
- Test loading states
- Test workout rendering with various types

#### Performance Tests
- Test generation time
- Test with large workout definitions

### 3. Workout Management Endpoints (`/workouts/*`)

#### Unit Tests
- Test all endpoints (GET list, GET single, PUT, POST complete)
- Test request format normalization
- Test response format standards
- Test error handling
- Test parameter validation
- Test permissions

#### Integration Tests
- Test UI for workout list and details
- Test completion flow
- Test error handling in UI

#### Performance Tests
- Test with large workout lists
- Test pagination performance

### 4. API Tracker Endpoints (`/api-tracker/*`)

#### Unit Tests
- Test all endpoints
- Test permissions and access control
- Test request/response formats
- Test data accuracy

#### Integration Tests
- Test admin UI integration
- Test data visualization
- Test settings changes

## Testing Tools and Methodology

### Unit Testing
- Use PHPUnit for PHP backend testing
- Use Jest for JavaScript/TypeScript frontend testing
- Create mock API requests and validate responses
- Test both formats for backward compatibility

### Integration Testing
- Use Cypress for end-to-end testing
- Test complete user flows
- Verify correct data flow between components

### Performance Testing
- Benchmark API response times before and after changes
- Test with realistic data volumes
- Set performance baselines for API endpoints

## Test Implementation Priority

1. **High Priority:** 
   - Unit tests for wrapper pattern in `/generate` endpoint
   - Basic format validation for all endpoints

2. **Medium Priority:**
   - Unit tests for all other endpoints
   - Integration tests for critical user flows

3. **Low Priority:**
   - Performance testing
   - Edge case testing
   - Comprehensive integration testing

## Success Criteria

1. **Complete Coverage:** Every endpoint has unit tests for both formats
2. **Format Validation:** All tests validate correct request/response formats
3. **Error Handling:** Tests for all error scenarios
4. **Performance:** Performance tests to ensure no regressions
5. **Documentation:** All tests are documented and maintainable 