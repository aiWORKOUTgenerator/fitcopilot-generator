<?php
/**
 * Debug Endpoints
 *
 * Handles debug and test endpoints for the API
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Debug Endpoints class
 */
class DebugEndpoints extends AbstractEndpoint {
    
    /**
     * Constructor
     */
    public function __construct() {
        // We'll use a different approach for debug endpoints
        // since they have multiple routes
        parent::__construct();
        
        // Register all debug endpoints
        add_action('rest_api_init', [$this, 'register_debug_endpoints']);
        
        // Execute immediately if already fired
        if (did_action('rest_api_init')) {
            $this->register_debug_endpoints();
        }
        
        error_log('FitCopilot DebugEndpoints initialized');
    }
    
    /**
     * Register REST endpoint (overridden to prevent default registration)
     */
    public function register_endpoint() {
        // Intentionally empty - we'll register via register_debug_endpoints
    }
    
    /**
     * Register all debug endpoints
     */
    public function register_debug_endpoints() {
        // Debug request parameters endpoint
        register_rest_route(self::API_NAMESPACE, '/debug-request', [
            'methods'             => 'POST',
            'callback'            => [$this, 'debug_request'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);
        
        // Direct generate endpoint with no WordPress validation (for testing)
        register_rest_route(self::API_NAMESPACE, '/generate-direct', [
            'methods'             => 'POST',
            'callback'            => [$this, 'direct_generate_workout'],
            'permission_callback' => function() { return true; }, // Allow anyone to access for testing
        ]);
        
        error_log('FitCopilot registered debug endpoints');
    }
    
    /**
     * Handle API requests (dummy implementation required by abstract class)
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function handle_request(\WP_REST_Request $request) {
        // This method is required by the abstract class but won't be used
        return APIUtils::create_api_response(
            ['message' => 'Not implemented'],
            'Not implemented',
            false,
            'not_implemented',
            501
        );
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
        $extracted_params = $this->extract_params($request);
        
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
                'post_type' => 'fc_workout',
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