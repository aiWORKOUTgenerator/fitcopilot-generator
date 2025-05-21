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
            // Remove schema validation since we handle it in the callback
        ]);
        error_log('FitCopilot registered endpoint: ' . self::API_NAMESPACE . '/generate');
        
        // Compatibility endpoint for generate-workout (maps to /generate)
        register_rest_route(self::API_NAMESPACE, '/generate-workout', [
            'methods'             => 'POST',
            'callback'            => [$this, 'generate_workout'],
            'permission_callback' => [$this, 'user_permissions_check'],
            // Remove schema validation
        ]);
        error_log('FitCopilot registered compatibility endpoint: ' . self::API_NAMESPACE . '/generate-workout');
        
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
        
        // Debug endpoint for request parameters (TEMPORARY - REMOVE IN PRODUCTION)
        register_rest_route(self::API_NAMESPACE, '/debug-request', [
            'methods'             => 'POST',
            'callback'            => [$this, 'debug_request'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
        
        // Direct generate endpoint with no WordPress validation (TEMPORARY - FOR TESTING)
        register_rest_route(self::API_NAMESPACE, '/generate-direct', [
            'methods'             => 'POST',
            'callback'            => [$this, 'direct_generate_workout'],
            'permission_callback' => function() { return true; }, // Allow anyone to access for testing
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
     * Get the schema for workout generation API
     * This schema allows both direct and wrapped formats
     * 
     * @return array The schema
     */
    public function get_workout_schema() {
        $direct_props = [
            'duration' => [
                'type' => 'integer',
                'required' => false,
                'description' => 'Workout duration in minutes',
                'default' => 30,
            ],
            'difficulty' => [
                'type' => 'string',
                'required' => false,
                'enum' => ['beginner', 'intermediate', 'advanced'],
                'description' => 'Workout difficulty level',
                'default' => 'intermediate',
            ],
            'goals' => [
                'type' => ['string', 'array'],
                'required' => false,
                'description' => 'Training goals',
                'default' => 'general fitness',
            ],
            'equipment' => [
                'type' => 'array',
                'required' => false,
                'description' => 'Available equipment',
                'default' => [],
                'items' => [
                    'type' => 'string',
                ],
            ],
            'restrictions' => [
                'type' => 'string',
                'required' => false,
                'description' => 'Health restrictions or limitations',
                'default' => '',
            ],
            'specific_request' => [
                'type' => 'string',
                'required' => false,
                'description' => 'Specific workout request',
            ],
        ];
        
        // Return a schema that accepts either format
        // NOTE: We need to disable the automatic validation in the endpoint definition
        // and handle it ourselves in the callback
        return [
            '$schema' => 'http://json-schema.org/draft-04/schema#',
            'title' => 'workout',
            'type' => 'object'
        ];
    }
    
    /**
     * Extract workout parameters from the request, handling both direct and wrapped formats
     *
     * @param \WP_REST_Request $request The request object
     * @return array Extracted parameters
     */
    private function extract_workout_params(\WP_REST_Request $request) {
        // Get body as JSON
        $body_raw = $request->get_body();
        error_log('Raw request body: ' . $body_raw);
        
        // Get JSON body params (WordPress parsed)
        $body_params = $request->get_json_params() ?: [];
        
        // Get URL query params
        $url_params = $request->get_query_params();
        
        // Debug logs
        error_log('Body params (WP parsed): ' . print_r($body_params, true));
        error_log('URL params: ' . print_r($url_params, true));
        
        // Try to parse JSON ourselves to ensure WordPress didn't mess with it
        $manual_json = json_decode($body_raw, true);
        error_log('Manual JSON parse: ' . print_r($manual_json, true));
        
        $workout_params = [];
        
        // Option 1: Try using APIUtils normalize_request_data
        if (class_exists('\\FitCopilot\\API\\APIUtils')) {
            error_log('Using APIUtils to normalize request data');
            $workout_params = \FitCopilot\API\APIUtils::normalize_request_data($manual_json ?: $body_params, 'workout');
        } 
        // Option 2: Fall back to manual extraction
        else {
            error_log('APIUtils not available, extracting params manually');
            
            // First check manually parsed JSON for wrapped format
            if ($manual_json && isset($manual_json['workout']) && is_array($manual_json['workout'])) {
                error_log('Found wrapped workout format in manually parsed JSON');
                $workout_params = $manual_json['workout'];
            }
            // Then check WordPress parsed JSON for wrapped format
            else if (isset($body_params['workout']) && is_array($body_params['workout'])) {
                error_log('Found wrapped workout format in WP parsed JSON');
                $workout_params = $body_params['workout'];
            }
            // Finally fall back to direct format
            else {
                error_log('Using direct format params');
                $workout_params = $body_params;
            }
        }
        
        // Apply defaults for required fields
        $defaults = [
            'duration' => 30,
            'difficulty' => 'intermediate',
            'goals' => 'general fitness',
            'equipment' => [],
            'restrictions' => '',
        ];
        
        // Merge in defaults for missing fields
        foreach ($defaults as $key => $default_value) {
            if (empty($workout_params[$key])) {
                error_log("Setting default for $key: " . print_r($default_value, true));
                $workout_params[$key] = $default_value;
            }
        }
        
        // Merge in any URL parameters (they override body params)
        $params = array_merge($workout_params, $url_params);
        
        // Debug log
        error_log('Final merged params with defaults: ' . print_r($params, true));
        
        return $params;
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
        $params = $this->extract_workout_params($request);
        
        // Debug log - show what we received
        error_log('Raw request params: ' . print_r($params, true));
        
        // For extremely detailed debugging - dump the entire request
        error_log('Full request details: ' . print_r([
            'method' => $request->get_method(),
            'url' => $request->get_route(),
            'headers' => $request->get_headers(),
            'params' => $request->get_params(),
            'json_params' => $request->get_json_params(),
            'body' => $request->get_body(),
        ], true));
        
        // Validate required fields
        $validation_errors = [];
        $required_fields = [
            'specific_request' => __('Specific request is required.', 'fitcopilot')
        ];
        
        foreach ($required_fields as $field => $error_message) {
            if (empty($params[$field])) {
                $validation_errors[$field] = $error_message;
            }
        }
        
        // Return validation errors if any
        if (!empty($validation_errors)) {
            error_log('Validation errors: ' . print_r($validation_errors, true));
            return APIUtils::create_validation_error(
                $validation_errors,
                __('Missing required parameter(s)', 'fitcopilot')
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
            
            // Debug log - parameters sent to generator
            error_log('Parameters sent to generator: ' . print_r($generation_params, true));
            
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
            error_log('Workout generation error: ' . $e->getMessage());
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

    /**
     * Debug request parameters
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function debug_request(\WP_REST_Request $request) {
        // Get raw data
        $raw_data = $request->get_body();
        
        // Parse JSON parameters (direct)
        $params = $request->get_json_params();
        
        // Extract params using our helper (handles wrapped format)
        $extracted_params = $this->extract_workout_params($request);
        
        // Try normalizing with different wrapper keys
        $normalized_workout = APIUtils::normalize_request_data($params, 'workout');
        
        // Return all the data for debugging
        return APIUtils::create_api_response([
            'raw_data' => $raw_data,
            'request_params' => $params,
            'extracted_params' => $extracted_params,
            'normalized_workout' => $normalized_workout,
            'content_type' => $request->get_content_type(),
            'headers' => $request->get_headers(),
            'query_params' => $request->get_query_params(),
            'url_params' => $request->get_url_params()
        ], 'Debug information');
    }
    
    /**
     * Direct workout generator with no WordPress validation
     * TEMPORARY - FOR TESTING ONLY
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function direct_generate_workout(\WP_REST_Request $request) {
        // Get raw request body
        $body = $request->get_body();
        
        // Log raw request for debugging
        error_log('Raw request to direct-generate: ' . $body);
        
        try {
            // Parse JSON manually
            $data = json_decode($body, true);
            if (!$data) {
                throw new \Exception('Invalid JSON format');
            }
            
            // Extract workout data from wrapper if it exists
            $workout_data = isset($data['workout']) ? $data['workout'] : $data;
            
            // Apply defaults for missing fields
            $defaults = [
                'duration' => 30,
                'difficulty' => 'intermediate',
                'goals' => 'general fitness',
                'equipment' => [],
                'restrictions' => '',
                'specific_request' => 'A general full-body workout'
            ];
            
            // Merge with defaults
            $params = array_merge($defaults, $workout_data);
            
            // Create a test workout response
            $workout = [
                'title' => 'Direct ' . ucfirst($params['difficulty']) . ' ' . $params['duration'] . '-Minute Workout',
                'description' => 'Workout based on: ' . $params['specific_request'],
                'difficulty' => $params['difficulty'],
                'duration' => $params['duration'],
                'sections' => [
                    [
                        'name' => 'Warm-up',
                        'duration' => 5,
                        'exercises' => [
                            [
                                'name' => 'Jumping Jacks',
                                'duration' => '2 minutes',
                                'description' => 'Jump your feet out wide while raising your arms overhead'
                            ],
                            [
                                'name' => 'Arm Circles',
                                'duration' => '1 minute',
                                'description' => 'Circle your arms forward, then backward'
                            ],
                        ],
                    ],
                    [
                        'name' => 'Main Workout',
                        'duration' => $params['duration'] - 10,
                        'exercises' => [
                            [
                                'name' => 'Push-ups',
                                'sets' => 3,
                                'reps' => 10,
                                'description' => 'Keep your body straight and lower to the ground'
                            ],
                            [
                                'name' => 'Squats',
                                'sets' => 3,
                                'reps' => 15,
                                'description' => 'Lower your body as if sitting in a chair'
                            ],
                        ],
                    ],
                    [
                        'name' => 'Cool Down',
                        'duration' => 5,
                        'exercises' => [
                            [
                                'name' => 'Stretching',
                                'duration' => '5 minutes',
                                'description' => 'Various full-body stretches'
                            ],
                        ],
                    ],
                ],
            ];
            
            // Create a post ID for the generated workout
            $post_id = wp_insert_post([
                'post_title' => $workout['title'],
                'post_content' => 'This is a test workout generated by the direct endpoint.',
                'post_status' => 'publish',
                'post_type' => 'wg_workout',
            ]);
            
            // Add post_id directly to the data object
            $workout['post_id'] = $post_id;
            
            // Return success response with the workout data
            return APIUtils::create_api_response(
                $workout,
                'Direct workout created successfully'
            );
        } catch (\Exception $e) {
            return APIUtils::create_api_response(
                null,
                'Error: ' . $e->getMessage(),
                false,
                'direct_generation_error',
                400
            );
        }
    }
}

// Initialize endpoints
new WorkoutEndpoints(); 