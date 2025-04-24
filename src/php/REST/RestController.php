<?php
/**
 * REST API Controller for FitCopilot
 */

namespace FitCopilot\REST;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Initialize REST API endpoints
 */
function register_rest_routes() {
    // Register API namespace
    register_rest_route(
        'fitcopilot/v1',
        '/generate',
        [
            'methods' => 'POST',
            'callback' => 'FitCopilot\\REST\\generate_workout',
            'permission_callback' => 'FitCopilot\\REST\\check_permission',
            'args' => [
                'duration' => [
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ],
                'difficulty' => [
                    'required' => true,
                    'type' => 'string',
                    'enum' => ['beginner', 'intermediate', 'advanced'],
                ],
                'equipment' => [
                    'required' => false,
                    'type' => 'array',
                    'items' => [
                        'type' => 'string',
                    ],
                ],
                'goals' => [
                    'required' => true,
                    'type' => 'string',
                ],
                'restrictions' => [
                    'required' => false,
                    'type' => 'string',
                ],
            ],
        ]
    );

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

    register_rest_route(
        'fitcopilot/v1',
        '/profile',
        [
            'methods' => 'GET',
            'callback' => 'FitCopilot\\REST\\get_profile',
            'permission_callback' => 'FitCopilot\\REST\\check_permission',
        ]
    );

    register_rest_route(
        'fitcopilot/v1',
        '/profile',
        [
            'methods' => 'PUT',
            'callback' => 'FitCopilot\\REST\\update_profile',
            'permission_callback' => 'FitCopilot\\REST\\check_permission',
        ]
    );
}
add_action('rest_api_init', 'FitCopilot\\REST\\register_rest_routes');

/**
 * Permission callback for API endpoints
 *
 * @return bool
 */
function check_permission() {
    return is_user_logged_in();
}

/**
 * Generate a workout via AI
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function generate_workout(\WP_REST_Request $request) {
    // Check for API key first
    $api_key = get_option('fitcopilot_openai_api_key', '');
    if (empty($api_key)) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'OpenAI API key not configured. Please set it in the FitCopilot settings.',
            'code' => 'missing_api_key'
        ], 400);
    }

    $params = $request->get_params();

    try {
        // Use the OpenAI provider to generate the workout
        $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
        $workout = $provider->generateWorkout($params);
        
        // Optional: Save the workout if needed
        // $workout_id = save_workout($workout, $params);
        
        return new \WP_REST_Response([
            'success' => true,
            'data' => $workout,
            'message' => 'Workout generated successfully',
        ]);
    } catch (\Exception $e) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => $e->getMessage(),
            'code' => 'generation_error'
        ], 500);
    }
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
    
    if (isset($params['title'])) {
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
 * Get user profile data
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function get_profile(\WP_REST_Request $request) {
    $user_id = get_current_user_id();
    
    $profile = [
        'user_id' => $user_id,
        'fitness_level' => get_user_meta($user_id, 'fitness_level', true) ?: 'beginner',
        'equipment_available' => get_user_meta($user_id, 'equipment_available', true) ?: [],
        'workout_goals' => get_user_meta($user_id, 'workout_goals', true) ?: '',
        'physical_limitations' => get_user_meta($user_id, 'physical_limitations', true) ?: '',
        'completed_workouts_count' => count(get_user_meta($user_id, 'fitcopilot_completed_workouts', true) ?: []),
    ];
    
    return new \WP_REST_Response([
        'success' => true,
        'data' => $profile,
    ]);
}

/**
 * Update user profile data
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function update_profile(\WP_REST_Request $request) {
    $user_id = get_current_user_id();
    $params = $request->get_params();
    
    $fields = [
        'fitness_level' => 'sanitize_text_field',
        'equipment_available' => function($value) {
            return is_array($value) ? array_map('sanitize_text_field', $value) : [];
        },
        'workout_goals' => 'sanitize_textarea_field',
        'physical_limitations' => 'sanitize_textarea_field',
    ];
    
    foreach ($fields as $field => $sanitize) {
        if (isset($params[$field])) {
            $value = is_callable($sanitize) ? $sanitize($params[$field]) : $sanitize($params[$field]);
            update_user_meta($user_id, $field, $value);
        }
    }
    
    // Trigger action for post-update processing
    do_action('fitcopilot_profile_updated', $user_id, $params);
    
    return new \WP_REST_Response([
        'success' => true,
        'message' => 'Profile updated successfully',
    ]);
} 