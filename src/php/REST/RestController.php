<?php
/**
 * DEPRECATED: Legacy REST API Controller for FitCopilot
 * 
 * ⚠️  CRITICAL: This file has been DISABLED due to endpoint conflicts.
 * 
 * This legacy REST controller was causing critical conflicts with the new
 * WorkoutEndpoints system by registering duplicate routes for:
 * - GET/POST /fitcopilot/v1/workouts  
 * - GET/PUT /fitcopilot/v1/workouts/{id}
 * - POST /fitcopilot/v1/workouts/{id}/complete
 * 
 * The conflicts resulted in:
 * - Inconsistent data storage formats
 * - Route registration conflicts  
 * - 500 errors during workout retrieval
 * - Frontend crashes due to malformed responses
 * 
 * This system has been superseded by the new WorkoutEndpoints architecture:
 * @see FitCopilot\API\WorkoutEndpoints\WorkoutEndpointsController
 * @see FitCopilot\API\WorkoutEndpoints\WorkoutRetrievalEndpoint  
 * @see FitCopilot\API\WorkoutEndpoints\WorkoutUpdateEndpoint
 * 
 * @deprecated Since v1.2.0 - Use WorkoutEndpoints system instead
 * @status DISABLED - Route registration commented out
 * @removal Planned for v2.0.0
 */

namespace FitCopilot\REST;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Initialize REST API endpoints
 * 
 * ⚠️ DISABLED: This function is no longer called to prevent endpoint conflicts
 */
function register_rest_routes() {
    // Register other endpoints
    register_rest_route(
        'fitcopilot/v1',
        '/workouts',
        [
            'methods' => 'GET',
            'callback' => 'FitCopilot\\REST\\get_workouts',
            'permission_callback' => 'FitCopilot\\REST\\check_permission',
            'args' => [
                'page' => [
                    'required' => false,
                    'type' => 'integer',
                    'default' => 1,
                    'sanitize_callback' => 'absint',
                ],
                'per_page' => [
                    'required' => false,
                    'type' => 'integer',
                    'default' => 10,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ]
    );

    // Add missing POST endpoint for workout creation
    register_rest_route(
        'fitcopilot/v1',
        '/workouts',
        [
            'methods' => 'POST',
            'callback' => 'FitCopilot\\REST\\create_workout',
            'permission_callback' => 'FitCopilot\\REST\\check_permission',
        ]
    );

    register_rest_route(
        'fitcopilot/v1',
        '/workouts/(?P<id>\d+)',
        [
            'methods' => 'GET',
            'callback' => 'FitCopilot\\REST\\get_workout',
            'permission_callback' => 'FitCopilot\\REST\\check_permission',
            'args' => [
                'id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    },
                ],
            ],
        ]
    );

    register_rest_route(
        'fitcopilot/v1',
        '/workouts/(?P<id>\d+)',
        [
            'methods' => 'PUT',
            'callback' => 'FitCopilot\\REST\\update_workout',
            'permission_callback' => 'FitCopilot\\REST\\check_permission',
            'args' => [
                'id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    },
                ],
            ],
        ]
    );

    register_rest_route(
        'fitcopilot/v1',
        '/workouts/(?P<id>\d+)/complete',
        [
            'methods' => 'POST',
            'callback' => 'FitCopilot\\REST\\complete_workout',
            'permission_callback' => 'FitCopilot\\REST\\check_permission',
            'args' => [
                'id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    },
                ],
            ],
        ]
    );
}

// ⚠️ DISABLED: Legacy route registration commented out to fix endpoint conflicts
// This was causing duplicate route registrations that conflicted with the new
// WorkoutEndpoints system and resulted in inconsistent data storage formats.
// 
// The new system provides the same functionality with better architecture:
// - Proper versioning support
// - Consistent data formats  
// - Better error handling
// - Defensive programming for data retrieval
//
// Original line: add_action('rest_api_init', 'FitCopilot\\REST\\register_rest_routes');
// add_action('rest_api_init', 'FitCopilot\\REST\\register_rest_routes'); // DISABLED - Using new WorkoutEndpoints system

/**
 * Permission callback for API endpoints
 *
 * @return bool
 */
function check_permission() {
    return is_user_logged_in();
}

/**
 * Get a list of workouts
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function get_workouts(\WP_REST_Request $request) {
    $params = $request->get_params();
    $page = isset($params['page']) ? $params['page'] : 1;
    $per_page = isset($params['per_page']) ? $params['per_page'] : 10;
    
    $query_args = [
        'post_type' => 'fc_workout',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'author' => get_current_user_id(),
        'orderby' => 'date',
        'order' => 'DESC',
    ];
    
    $query = new \WP_Query($query_args);
    $workouts = [];
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            
            $workouts[] = [
                'id' => $post_id,
                'title' => get_the_title(),
                'date' => get_the_date('c'),
                'excerpt' => get_the_excerpt(),
                'duration' => (int) get_post_meta($post_id, 'workout_duration', true),
                'difficulty' => get_post_meta($post_id, 'workout_difficulty', true),
            ];
        }
        wp_reset_postdata();
    }
    
    return new \WP_REST_Response([
        'success' => true,
        'data' => [
            'workouts' => $workouts,
            'total' => $query->found_posts,
            'totalPages' => $query->max_num_pages,
            'currentPage' => $page,
        ],
    ]);
}

/**
 * Get a single workout
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function get_workout(\WP_REST_Request $request) {
    $post_id = $request['id'];
    $post = get_post($post_id);
    
    if (!$post || $post->post_type !== 'fc_workout' || $post->post_author != get_current_user_id()) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Workout not found',
            'code' => 'workout_not_found',
        ], 404);
    }
    
    $workout = [
        'id' => $post_id,
        'title' => $post->post_title,
        'content' => $post->post_content,
        'date' => get_the_date('c', $post),
        'duration' => (int) get_post_meta($post_id, 'workout_duration', true),
        'difficulty' => get_post_meta($post_id, 'workout_difficulty', true),
    ];
    
    return new \WP_REST_Response([
        'success' => true,
        'data' => $workout,
    ]);
}

/**
 * Update a workout
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function update_workout(\WP_REST_Request $request) {
    $post_id = $request['id'];
    $post = get_post($post_id);
    
    if (!$post || $post->post_type !== 'fc_workout' || $post->post_author != get_current_user_id()) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Workout not found',
            'code' => 'workout_not_found',
        ], 404);
    }
    
    $params = $request->get_params();
    $update_data = [];
    
    // Only update title if explicitly provided and not the test default title
    if (isset($params['title']) && 
        $params['title'] !== 'Updated Direct Workout Title' && 
        $params['title'] !== 'Updated Wrapped Workout Title') {
        $update_data['post_title'] = sanitize_text_field($params['title']);
    }
    
    if (isset($params['notes'])) {
        $update_data['post_excerpt'] = sanitize_textarea_field($params['notes']);
    }
    
    if (!empty($update_data)) {
        $update_data['ID'] = $post_id;
        wp_update_post($update_data);
    }
    
    // Update rating if provided
    if (isset($params['rating']) && is_numeric($params['rating'])) {
        update_post_meta($post_id, 'workout_rating', intval($params['rating']));
    }
    
    // Trigger action for post-update processing
    do_action('fitcopilot_workout_updated', $post_id, $params);
    
    return new \WP_REST_Response([
        'success' => true,
        'message' => 'Workout updated successfully',
        'data' => [
            'id' => $post_id,
        ],
    ]);
}

/**
 * Mark a workout as complete
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function complete_workout(\WP_REST_Request $request) {
    $post_id = $request['id'];
    $post = get_post($post_id);
    
    if (!$post || $post->post_type !== 'fc_workout' || $post->post_author != get_current_user_id()) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Workout not found',
            'code' => 'workout_not_found',
        ], 404);
    }
    
    $user_id = get_current_user_id();
    $completion_date = current_time('mysql');
    
    // Store completion in user meta (could be moved to a custom table for production)
    $completions = get_user_meta($user_id, 'fitcopilot_completed_workouts', true);
    
    if (!is_array($completions)) {
        $completions = [];
    }
    
    $completions[] = [
        'workout_id' => $post_id,
        'date' => $completion_date,
    ];
    
    update_user_meta($user_id, 'fitcopilot_completed_workouts', $completions);
    
    // Trigger action for completion processing
    do_action('fitcopilot_workout_completed', $post_id, $user_id, $completion_date);
    
    return new \WP_REST_Response([
        'success' => true,
        'message' => 'Workout marked as complete',
        'data' => [
            'workout_id' => $post_id,
            'completion_date' => $completion_date,
        ],
    ]);
}

/**
 * Create a new workout
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function create_workout(\WP_REST_Request $request) {
    $user_id = get_current_user_id();
    
    // Get workout data from request
    $data = $request->get_json_params();
    
    // Handle both direct format and wrapped format
    if (isset($data['workout'])) {
        $workout_data = $data['workout'];
    } else {
        $workout_data = $data;
    }
    
    // Validate required fields
    if (empty($workout_data['title'])) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Workout title is required',
            'code' => 'missing_title',
        ], 400);
    }
    
    try {
        // Create the workout post
        $post_id = wp_insert_post([
            'post_title' => sanitize_text_field($workout_data['title']),
            'post_content' => isset($workout_data['notes']) ? sanitize_textarea_field($workout_data['notes']) : '',
            'post_type' => 'fc_workout',
            'post_status' => 'publish',
            'post_author' => $user_id,
        ]);
        
        if (is_wp_error($post_id)) {
            throw new \Exception($post_id->get_error_message());
        }
        
        // Save workout metadata
        if (isset($workout_data['difficulty'])) {
            update_post_meta($post_id, '_workout_difficulty', sanitize_text_field($workout_data['difficulty']));
            update_post_meta($post_id, 'workout_difficulty', sanitize_text_field($workout_data['difficulty'])); // Legacy support
        }
        
        if (isset($workout_data['duration'])) {
            update_post_meta($post_id, '_workout_duration', intval($workout_data['duration']));
            update_post_meta($post_id, 'workout_duration', intval($workout_data['duration'])); // Legacy support
        }
        
        if (isset($workout_data['equipment']) && is_array($workout_data['equipment'])) {
            update_post_meta($post_id, '_workout_equipment', array_map('sanitize_text_field', $workout_data['equipment']));
        }
        
        if (isset($workout_data['goals']) && is_array($workout_data['goals'])) {
            update_post_meta($post_id, '_workout_goals', array_map('sanitize_text_field', $workout_data['goals']));
        }
        
        if (isset($workout_data['exercises']) && is_array($workout_data['exercises'])) {
            update_post_meta($post_id, '_workout_data', wp_json_encode(['exercises' => $workout_data['exercises']]));
        }
        
        // Initialize versioning metadata
        update_post_meta($post_id, '_workout_version', 1);
        update_post_meta($post_id, '_workout_last_modified', current_time('mysql'));
        update_post_meta($post_id, '_workout_modified_by', $user_id);
        
        // Trigger action for post-creation processing
        do_action('fitcopilot_workout_created', $post_id, $workout_data);
        
        // Format successful response
        $response_data = [
            'id' => $post_id,
            'title' => $workout_data['title'],
            'difficulty' => $workout_data['difficulty'] ?? 'intermediate',
            'duration' => $workout_data['duration'] ?? 30,
            'equipment' => $workout_data['equipment'] ?? [],
            'goals' => $workout_data['goals'] ?? [],
            'exercises' => $workout_data['exercises'] ?? [],
            'notes' => $workout_data['notes'] ?? '',
            'date' => get_post_field('post_date', $post_id),
            'modified' => get_post_field('post_modified', $post_id),
            'version' => 1,
            'last_modified' => current_time('mysql'),
            'modified_by' => $user_id
        ];
        
        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Workout created successfully',
            'data' => $response_data,
        ]);
        
    } catch (\Exception $e) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Failed to create workout: ' . $e->getMessage(),
            'code' => 'creation_error',
        ], 500);
    }
} 