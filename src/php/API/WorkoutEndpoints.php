<?php
/**
 * Workout Endpoints
 *
 * Registers REST API endpoints for workout generation and management.
 */

namespace FitCopilot\API;

use FitCopilot\Service\AI\OpenAIProvider;
use FitCopilot\API\APIUtils;

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
        // Debug log to verify initialization
        error_log('FitCopilot WorkoutEndpoints initialized');
        
        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'register_endpoints']);
        
        // Execute the action immediately if it's already fired
        if (did_action('rest_api_init')) {
            error_log('rest_api_init already fired, registering endpoints immediately');
            $this->register_endpoints();
        }
    }
    
    /**
     * Register REST API endpoints
     */
    public function register_endpoints() {
        // Debug log to verify route registration
        error_log('FitCopilot WorkoutEndpoints registering endpoints');
        
        // Generate workout endpoint
        register_rest_route(self::API_NAMESPACE, '/generate', [
            'methods'             => 'POST',
            'callback'            => [$this, 'generate_workout'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
        error_log('FitCopilot registered endpoint: ' . self::API_NAMESPACE . '/generate');
        
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
            return APIUtils::create_api_response(
                null,
                __('OpenAI API key not configured. Please set it in the FitCopilot settings.', 'fitcopilot'),
                false,
                'missing_api_key',
                400
            );
        }

        // Parse & validate the JSON parameters
        $params = $request->get_json_params();
        
        // Normalize request data to support both direct and wrapped formats
        $params = APIUtils::normalize_request_data($params, 'workout');
        
        if (empty($params['specific_request'])) {
            return APIUtils::create_validation_error(
                ['specific_request' => __('Specific request is required.', 'fitcopilot')],
                __('Missing required parameters.', 'fitcopilot')
            );
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
            
            // Add post_id directly to the data object (not nested inside workout)
            $response_data = $workout;
            $response_data['post_id'] = $post_id;
            
            // Apply wg_after_generate_workout filter for extensibility
            do_action('wg_after_generate_workout', $post_id, $workout, $generation_params);
            
            // Return the success response
            return APIUtils::create_api_response(
                $response_data,
                APIUtils::get_success_message('create', 'workout')
            );
        } catch (\Exception $e) {
            return APIUtils::create_api_response(
                null,
                $e->getMessage(),
                false,
                'generation_error',
                500
            );
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
        
        return APIUtils::create_api_response(
            $workouts, 
            APIUtils::get_success_message('list', 'workout')
        );
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
            return APIUtils::create_not_found_error(__('Workout not found.', 'fitcopilot'));
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
        
        return APIUtils::create_api_response(
            $workout, 
            APIUtils::get_success_message('get', 'workout')
        );
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
            return APIUtils::create_not_found_error(__('Workout not found.', 'fitcopilot'));
        }
        
        $params = $request->get_json_params();
        
        // Normalize request data to support both direct and wrapped formats
        $params = APIUtils::normalize_request_data($params, 'workout');
        
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
        
        return APIUtils::create_api_response(
            ['id' => $post_id], 
            APIUtils::get_success_message('update', 'workout')
        );
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
            return APIUtils::create_not_found_error(__('Workout not found.', 'fitcopilot'));
        }
        
        $params = $request->get_json_params() ?: [];
        
        // Normalize request data to support both direct and wrapped formats
        $params = APIUtils::normalize_request_data($params, 'completion');
        
        $user_id = get_current_user_id();
        $completion_date = current_time('mysql');
        
        // Get existing completions
        $completions = get_post_meta($post_id, '_workout_completions', true);
        
        if (!$completions) {
            $completions = [];
        }
        
        // Add new completion with any additional data
        $completion_data = array_merge([
            'user_id' => $user_id,
            'date'    => $completion_date,
        ], $params);
        
        $completions[] = $completion_data;
        
        // Update post meta
        update_post_meta($post_id, '_workout_completions', $completions);
        update_post_meta($post_id, '_workout_last_completed', $completion_date);
        
        return APIUtils::create_api_response(
            [
                'completion_date' => $completion_date,
                'completion_data' => $completion_data,
            ],
            APIUtils::get_success_message('complete', 'workout')
        );
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