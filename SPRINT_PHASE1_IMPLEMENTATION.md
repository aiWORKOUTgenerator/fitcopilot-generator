# Phase 1 Implementation Guide

## Task 2.1: Add Workout Creation to WorkoutRetrievalEndpoint

### Current State
```php
// WorkoutRetrievalEndpoint.php - Currently only handles GET
class WorkoutRetrievalEndpoint extends AbstractEndpoint {
    public function __construct() {
        $this->route = '/workouts';
        $this->method = 'GET';  // Only GET method registered
    }
}
```

### Required Implementation
```php
// Need to add POST method for workout creation
public function __construct() {
    $this->route = '/workouts';
    $this->method = 'GET';
    
    parent::__construct();
    
    // Add POST registration for workout creation
    add_action('rest_api_init', [$this, 'register_post_endpoint']);
}

public function register_post_endpoint() {
    register_rest_route(self::API_NAMESPACE, '/workouts', [
        'methods'             => 'POST',
        'callback'            => [$this, 'create_workout'],
        'permission_callback' => [$this, 'check_permissions'],
    ]);
}

public function create_workout(\WP_REST_Request $request) {
    $user_id = get_current_user_id();
    $params = $request->get_json_params();
    
    // Normalize request data to support both direct and wrapped formats
    $params = APIUtils::normalize_request_data($params, 'workout');
    
    // Validate required fields
    $validation_errors = Utilities::validate_required_workout_params($params, [
        'title' => 'Workout title is required',
    ]);
    
    if (!empty($validation_errors)) {
        return APIUtils::create_validation_error($validation_errors);
    }
    
    // Start transaction for versioning
    $versioning_service = VersioningUtils::start_transaction();
    
    try {
        // Create the workout post
        $post_id = wp_insert_post([
            'post_title'   => sanitize_text_field($params['title']),
            'post_content' => isset($params['notes']) ? sanitize_textarea_field($params['notes']) : '',
            'post_type'    => 'fc_workout',
            'post_status'  => 'publish',
            'post_author'  => $user_id,
        ]);
        
        if (is_wp_error($post_id)) {
            throw new \Exception($post_id->get_error_message());
        }
        
        // Save workout metadata
        if (isset($params['difficulty'])) {
            update_post_meta($post_id, '_workout_difficulty', sanitize_text_field($params['difficulty']));
        }
        if (isset($params['duration'])) {
            update_post_meta($post_id, '_workout_duration', intval($params['duration']));
        }
        if (isset($params['equipment']) && is_array($params['equipment'])) {
            update_post_meta($post_id, '_workout_equipment', array_map('sanitize_text_field', $params['equipment']));
        }
        if (isset($params['goals']) && is_array($params['goals'])) {
            update_post_meta($post_id, '_workout_goals', array_map('sanitize_text_field', $params['goals']));
        }
        if (isset($params['exercises']) && is_array($params['exercises'])) {
            update_post_meta($post_id, '_workout_data', wp_json_encode(['exercises' => $params['exercises']]));
        }
        
        // Initialize versioning
        update_post_meta($post_id, '_workout_version', 1);
        update_post_meta($post_id, '_workout_last_modified', current_time('mysql'));
        update_post_meta($post_id, '_workout_modified_by', $user_id);
        
        // Create initial version record
        $workout_state = VersioningUtils::get_workout_state($post_id, $user_id, $versioning_service);
        VersioningUtils::create_version_record(
            $post_id,
            $workout_state,
            $user_id,
            'create',
            'Initial workout creation',
            $versioning_service
        );
        
        // Commit transaction
        VersioningUtils::commit_transaction($versioning_service);
        
        // Get version metadata for response
        $metadata = VersioningUtils::get_version_metadata($post_id);
        
        // Format response
        $response_data = [
            'id' => $post_id,
            'title' => $params['title'],
            'difficulty' => $params['difficulty'] ?? 'intermediate',
            'duration' => $params['duration'] ?? 30,
            'equipment' => $params['equipment'] ?? [],
            'goals' => $params['goals'] ?? [],
            'exercises' => $params['exercises'] ?? [],
            'notes' => $params['notes'] ?? '',
        ];
        
        // Add version metadata
        $response_data = APIUtils::add_version_metadata_to_response($response_data, $metadata);
        
        return APIUtils::create_api_response(
            $response_data,
            APIUtils::get_success_message('create', 'workout')
        );
        
    } catch (\Exception $e) {
        VersioningUtils::rollback_transaction($versioning_service);
        return APIUtils::create_api_response(
            null,
            $e->getMessage(),
            false,
            'creation_error',
            500
        );
    }
}
```

### Testing Commands
```bash
# Test workout creation
curl -X POST /wp-json/fitcopilot/v1/workouts \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: NONCE_HERE" \
  -d '{
    "title": "Test Workout",
    "difficulty": "intermediate",
    "duration": 30,
    "exercises": [
      {
        "id": "exercise-1",
        "name": "Push-ups",
        "sets": 3,
        "reps": "10-12"
      }
    ]
  }'
``` 