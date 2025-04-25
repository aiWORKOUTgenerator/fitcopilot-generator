<?php
/**
 * Workout Endpoints
 *
 * Registers REST API endpoints for workout generation and management.
 */

namespace FitCopilot\API;

use FitCopilot\Service\AI\OpenAIProvider;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Workout Endpoints class
 */
class WorkoutEndpoints {
    
    /**
     * API namespace
     */
    const API_NAMESPACE = 'fitcopilot/v1';
    
    /**
     * Constructor
     */
    public function __construct() {
        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'register_endpoints']);
    }
    
    /**
     * Register REST API endpoints
     */
    public function register_endpoints() {
        // Generate workout endpoint
        register_rest_route(self::API_NAMESPACE, '/generate', [
            'methods'             => 'POST',
            'callback'            => [$this, 'generate_workout'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
        
        // Get workouts list
        register_rest_route(self::API_NAMESPACE, '/workouts', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_workouts'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
        
        // Get single workout
        register_rest_route(self::API_NAMESPACE, '/workouts/(?P<id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_workout'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
        
        // Update workout metadata
        register_rest_route(self::API_NAMESPACE, '/workouts/(?P<id>\d+)', [
            'methods'             => 'PUT',
            'callback'            => [$this, 'update_workout'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
        
        // Log workout completion
        register_rest_route(self::API_NAMESPACE, '/workouts/(?P<id>\d+)/complete', [
            'methods'             => 'POST',
            'callback'            => [$this, 'complete_workout'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
    }
    
    /**
     * Check if the current user has necessary permissions
     *
     * @return bool Whether the user has permission
     */
    public function user_permissions_check() {
        return is_user_logged_in();
    }
    
    /**
     * Generate a workout
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function generate_workout(\WP_REST_Request $request) {
        // Get the OpenAI API key
        $api_key = get_option('fitcopilot_openai_api_key', '');
        if (empty($api_key)) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('OpenAI API key not configured. Please set it in the FitCopilot settings.', 'fitcopilot'),
                'code'    => 'missing_api_key',
            ]);
        }

        // Parse & validate the JSON parameters
        $params = $request->get_json_params();
        
        if (empty($params['specific_request'])) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Missing required parameters.', 'fitcopilot'),
                'code'    => 'invalid_params',
            ]);
        }

        try {
            // Use the OpenAI provider to generate the workout
            $provider = new OpenAIProvider($api_key);
            
            // Prepare parameters for workout generation
            $generation_params = [
                'duration'        => $params['duration'] ?? 30,
                'difficulty'      => $params['difficulty'] ?? 'intermediate',
                'equipment'       => $params['equipment'] ?? [],
                'goals'           => $params['goals'] ?? 'general fitness',
                'restrictions'    => $params['restrictions'] ?? '',
                'specific_request' => $params['specific_request'],
            ];
            
            // Generate the workout
            $workout = $provider->generateWorkout($generation_params);
            
            // Save the workout to the database
            $post_id = $this->save_workout($workout, $generation_params);
            
            // Return the success response
            return rest_ensure_response([
                'success' => true,
                'data'    => [
                    'workout' => $workout,
                    'post_id' => $post_id,
                ],
                'message' => __('Workout generated successfully.', 'fitcopilot'),
            ]);
        } catch (\Exception $e) {
            return rest_ensure_response([
                'success' => false,
                'message' => $e->getMessage(),
                'code'    => 'generation_error',
            ]);
        }
    }
    
    /**
     * Get a list of workouts for the current user
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function get_workouts(\WP_REST_Request $request) {
        $user_id = get_current_user_id();
        
        $args = [
            'post_type'      => 'wg_workout',
            'post_status'    => 'publish',
            'author'         => $user_id,
            'posts_per_page' => 10,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ];
        
        $query = new \WP_Query($args);
        $workouts = [];
        
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();
                
                $workouts[] = [
                    'id'          => $post_id,
                    'title'       => get_the_title(),
                    'date'        => get_the_date('c'),
                    'difficulty'  => get_post_meta($post_id, '_workout_difficulty', true),
                    'duration'    => get_post_meta($post_id, '_workout_duration', true),
                    'equipment'   => get_post_meta($post_id, '_workout_equipment', true),
                    'goals'       => get_post_meta($post_id, '_workout_goals', true),
                ];
            }
            wp_reset_postdata();
        }
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $workouts,
        ]);
    }
    
    /**
     * Get a single workout
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function get_workout(\WP_REST_Request $request) {
        $post_id = $request->get_param('id');
        $post = get_post($post_id);
        
        if (!$post || $post->post_type !== 'wg_workout' || $post->post_author != get_current_user_id()) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Workout not found.', 'fitcopilot'),
                'code'    => 'not_found',
            ]);
        }
        
        $workout_data = json_decode(get_post_meta($post_id, '_workout_data', true), true);
        
        $workout = [
            'id'          => $post_id,
            'title'       => $post->post_title,
            'date'        => get_the_date('c', $post_id),
            'difficulty'  => get_post_meta($post_id, '_workout_difficulty', true),
            'duration'    => get_post_meta($post_id, '_workout_duration', true),
            'equipment'   => get_post_meta($post_id, '_workout_equipment', true),
            'goals'       => get_post_meta($post_id, '_workout_goals', true),
            'restrictions' => get_post_meta($post_id, '_workout_restrictions', true),
            'workout_data' => $workout_data,
        ];
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $workout,
        ]);
    }
    
    /**
     * Update workout metadata
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function update_workout(\WP_REST_Request $request) {
        $post_id = $request->get_param('id');
        $post = get_post($post_id);
        
        if (!$post || $post->post_type !== 'wg_workout' || $post->post_author != get_current_user_id()) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Workout not found.', 'fitcopilot'),
                'code'    => 'not_found',
            ]);
        }
        
        $params = $request->get_json_params();
        
        // Update title if provided
        if (!empty($params['title'])) {
            wp_update_post([
                'ID'         => $post_id,
                'post_title' => sanitize_text_field($params['title']),
            ]);
        }
        
        // Update metadata if provided
        $meta_fields = [
            'difficulty', 'duration', 'equipment', 'goals', 'restrictions',
        ];
        
        foreach ($meta_fields as $field) {
            if (isset($params[$field])) {
                update_post_meta($post_id, '_workout_' . $field, $params[$field]);
            }
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => __('Workout updated successfully.', 'fitcopilot'),
        ]);
    }
    
    /**
     * Log workout completion
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function complete_workout(\WP_REST_Request $request) {
        $post_id = $request->get_param('id');
        $post = get_post($post_id);
        
        if (!$post || $post->post_type !== 'wg_workout' || $post->post_author != get_current_user_id()) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Workout not found.', 'fitcopilot'),
                'code'    => 'not_found',
            ]);
        }
        
        $user_id = get_current_user_id();
        $completion_date = current_time('mysql');
        
        // Get existing completions
        $completions = get_post_meta($post_id, '_workout_completions', true);
        
        if (!$completions) {
            $completions = [];
        }
        
        // Add new completion
        $completions[] = [
            'user_id' => $user_id,
            'date'    => $completion_date,
        ];
        
        // Update post meta
        update_post_meta($post_id, '_workout_completions', $completions);
        update_post_meta($post_id, '_workout_last_completed', $completion_date);
        
        return rest_ensure_response([
            'success' => true,
            'message' => __('Workout completion logged successfully.', 'fitcopilot'),
            'data'    => [
                'completion_date' => $completion_date,
            ],
        ]);
    }
    
    /**
     * Save a workout to the database
     *
     * @param array $workout The workout data
     * @param array $params The generation parameters
     * @return int Post ID
     */
    private function save_workout($workout, $params) {
        $user_id = get_current_user_id();
        
        // Create post
        $post_id = wp_insert_post([
            'post_title'  => $workout['title'] ?? __('Generated Workout', 'fitcopilot'),
            'post_type'   => 'wg_workout',
            'post_status' => 'publish',
            'post_author' => $user_id,
        ]);
        
        if (is_wp_error($post_id)) {
            throw new \Exception($post_id->get_error_message());
        }
        
        // Save workout data
        update_post_meta($post_id, '_workout_data', wp_json_encode($workout));
        
        // Save generation parameters
        update_post_meta($post_id, '_workout_difficulty', $params['difficulty']);
        update_post_meta($post_id, '_workout_duration', $params['duration']);
        update_post_meta($post_id, '_workout_equipment', $params['equipment']);
        update_post_meta($post_id, '_workout_goals', $params['goals']);
        update_post_meta($post_id, '_workout_restrictions', $params['restrictions']);
        update_post_meta($post_id, '_workout_specific_request', $params['specific_request']);
        
        return $post_id;
    }
}

// Initialize endpoints
new WorkoutEndpoints(); 