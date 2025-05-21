# API Developer Notes

## API Standardization Initiative - Phase 2 Implementation

### Fix: Generate Endpoint Response Structure

Date: Current date
Author: API Team

#### Issue Summary
The `/generate` and `/generate-workout` endpoints were not conforming to the standardized API response structure required for the test suite. Specifically, the test expected `post_id` to be directly in the data object, but it was being nested inside a `workout` object along with the workout content.

#### Changes Implemented
1. Modified `WorkoutEndpoints.php` to restructure the response data in the `/generate` endpoint:

```php
// BEFORE:
return APIUtils::create_api_response(
    [
        'workout' => $workout,
        'post_id' => $post_id,
    ],
    APIUtils::get_success_message('create', 'workout')
);

// AFTER:
$response_data = $workout;
$response_data['post_id'] = $post_id;

return APIUtils::create_api_response(
    $response_data,
    APIUtils::get_success_message('create', 'workout')
);
```

2. Modified `WorkoutController.php` to update the legacy `/generate-workout` endpoint with the same pattern:

```php
// BEFORE:
return new \WP_REST_Response([
    'success' => true,
    'data' => [
        'workout' => $workout,
        'post_id' => $post_id
    ],
    'message' => 'Workout generated successfully'
]);

// AFTER:
$response_data = $workout;
$response_data['post_id'] = $post_id;

return new \WP_REST_Response([
    'success' => true,
    'data' => $response_data,
    'message' => 'Workout generated successfully'
]);
```

3. Added extensibility hook:
```php
do_action('wg_after_generate_workout', $post_id, $workout, $generation_params);
```

4. Updated the test file to support both endpoints and check for the correct response structure.

#### Testing
- The change has been verified against the test suite
- Both direct and wrapped request formats are supported
- Both the new `/generate` and legacy `/generate-workout` endpoints use the standardized response format
- The response now contains:
  - `success`: true
  - `data`: {workout data with post_id at top level}
  - `message`: "Workout created successfully"

#### Additional Notes
This change maintains the standardized API response structure we're implementing across all endpoints for consistency. It ensures that the `post_id` is immediately available in the response data object, which is required for the client to reference the workout in subsequent requests.

Future endpoints should follow this pattern of placing key identifiers directly in the data object rather than nesting them in sub-objects. 