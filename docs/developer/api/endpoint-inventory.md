# API Endpoint Inventory & Gap Analysis

This document provides a comprehensive inventory of all API endpoints in the FitCopilot system, analyzing their adherence to our API design guidelines and identifying areas for standardization.

## Endpoint Inventory

| Endpoint | Method | Current Request Format | Current Response Format | Standardization Gaps |
|----------|--------|------------------------|-------------------------|----------------------|
| `/generate` | POST | Direct object | Standard with message | Needs wrapper pattern |
| `/workouts` | GET | N/A (query params) | Standard without message | Missing message field |
| `/workouts/{id}` | GET | N/A (path params) | Standard without message | Missing message field |
| `/workouts/{id}` | PUT | Direct object | Standard with message | Needs wrapper pattern |
| `/workouts/{id}/complete` | POST | Direct object | Standard with message | Needs wrapper pattern |
| `/profile` | GET | N/A | Standard without message | Missing message field |
| `/profile` | PUT | Wrapped object (`profile`) | Standard with message | Already standardized ✓ |
| `/api-tracker/summary` | GET | N/A | Standard without message | Missing message field |
| `/api-tracker/daily` | GET | Query params | Standard without message | Missing message field |
| `/api-tracker/monthly` | GET | Query params | Standard without message | Missing message field |
| `/api-tracker/endpoints` | GET | N/A | Standard without message | Missing message field |
| `/api-tracker/token-cost` | POST | Direct object | Standard with message | Needs wrapper pattern |
| `/api-tracker/reset` | POST | N/A | Standard with message | N/A (no request body) |

## Request Format Analysis

### Wrapped vs Direct Object Patterns

Currently, most endpoints use a direct object pattern for request bodies:

```json
// Direct object pattern (current)
{
  "duration": 30,
  "difficulty": "intermediate",
  "equipment": ["dumbbells"]
}
```

Only the `/profile` PUT endpoint consistently uses a wrapped object pattern:

```json
// Wrapped object pattern (target)
{
  "profile": {
    "fitnessLevel": "intermediate",
    "workoutGoals": ["strength"]
  }
}
```

### Parameter Naming Conventions

There's inconsistency in parameter naming:
- Frontend code uses camelCase (`fitnessLevel`)
- Backend code uses snake_case (`fitness_level`)
- Some parameters don't follow either convention consistently

## Response Format Analysis

### Response Structure

All endpoints use a standardized response format with some variations:

```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operation completed successfully" // Sometimes missing
}
```

Key inconsistencies:
1. The `message` field is sometimes omitted in successful responses
2. Some error responses don't follow the standard error format
3. Validation errors have inconsistent structures

## Gap Analysis by Endpoint Category

### Workout Generation

**Endpoints:**
- `POST /generate`

**Gaps:**
- Uses direct object for request
- Missing detailed validation error responses
- Inconsistent camelCase/snake_case parameter naming

**Priority:** HIGH (core functionality)

### Workout Management

**Endpoints:**
- `GET /workouts`
- `GET /workouts/{id}`
- `PUT /workouts/{id}`
- `POST /workouts/{id}/complete`

**Gaps:**
- Inconsistent request formats
- Missing message field in GET responses
- Inconsistent error handling
- Direct object pattern for PUT/POST requests

**Priority:** HIGH (frequently used)

### Profile Management

**Endpoints:**
- `GET /profile`
- `PUT /profile`

**Gaps:**
- GET response missing message field
- PUT request already using wrapper pattern (standard compliant)

**Priority:** MEDIUM (already partially standardized)

### API Tracking

**Endpoints:**
- `GET /api-tracker/*` (multiple endpoints)
- `POST /api-tracker/token-cost`
- `POST /api-tracker/reset`

**Gaps:**
- Inconsistent response formats
- Direct object for POST requests

**Priority:** LOW (admin-only endpoints)

## Frontend Code Analysis

Frontend code is already using wrapper patterns in some areas:
- `profileApi.ts` uses the wrapper pattern for PUT requests
- Many API calls construct proper response objects

However, there are inconsistencies:
- Some direct API calls don't use wrappers
- Handling of response formats varies

## Prioritization Matrix

| Endpoint | Usage Frequency | Complexity | Business Impact | Priority |
|----------|----------------|------------|-----------------|----------|
| `/generate` | High | Medium | High | 1 |
| `/workouts` (all) | High | Medium | High | 2 |
| `/profile` (all) | Medium | Low | Medium | 3 |
| `/api-tracker/*` | Low | Low | Low | 4 |

## Recommended Implementation Approach

1. Create helper functions for request/response standardization:
   - `normalize_request_data($params, $resource_key)`
   - `create_standard_response($data, $message, $success = true)`

2. Focus first on high-impact, high-usage endpoints:
   - Begin with `/generate` endpoint
   - Then update `/workouts/*` endpoints

3. Implement changes with backward compatibility:
   - Accept both direct and wrapped formats
   - Document the preferred (wrapped) format
   - Add deprecation notices for direct format

4. Update frontend code:
   - Standardize all API calls
   - Ensure proper error handling
   - Use wrapper pattern consistently

## Testing Approach

For each endpoint:
1. Test with direct format (backward compatibility)
2. Test with wrapped format (new standard)
3. Test error scenarios and validation
4. Test response structure compliance 