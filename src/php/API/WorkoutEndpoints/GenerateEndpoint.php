<?php
/**
 * Generate Endpoint
 *
 * Handles workout generation requests through the REST API
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;
use FitCopilot\Service\Versioning\VersioningUtils;
use FitCopilot\Service\AI\OpenAIProvider;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Generate Endpoint class
 */
class GenerateEndpoint extends AbstractEndpoint {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->route = '/generate';
        $this->method = 'POST';
        
        parent::__construct();
        
        // Register compatibility endpoint for generate-workout (maps to /generate)
        add_action('rest_api_init', [$this, 'register_compatibility_endpoint']);
        
        // Execute immediately if already fired
        if (did_action('rest_api_init')) {
            $this->register_compatibility_endpoint();
        }
        
        error_log('FitCopilot GenerateEndpoint initialized');
    }
    
    /**
     * Register compatibility endpoint
     */
    public function register_compatibility_endpoint() {
        register_rest_route(self::API_NAMESPACE, '/generate-workout', [
            'methods'             => 'POST',
            'callback'            => [$this, 'handle_request'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);
        
        error_log('FitCopilot registered compatibility endpoint: ' . self::API_NAMESPACE . '/generate-workout');
    }
    
    /**
     * Handle workout generation request
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function handle_request(\WP_REST_Request $request) {
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
        $params = $this->extract_params($request);
        
        // Debug log - show what we received
        error_log('Raw request params: ' . print_r($params, true));
        
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
            
            // Get version metadata for the newly created workout
            $metadata = VersioningUtils::get_version_metadata($post_id);
            
            // Add post_id and version metadata to response
            $response_data = $workout;
            $response_data['post_id'] = $post_id;
            $response_data = APIUtils::add_version_metadata_to_response(
                $response_data, 
                $metadata,
                'create',
                'Workout generated'
            );
            
            // Apply wg_after_generate_workout filter for extensibility
            do_action('wg_after_generate_workout', $post_id, $workout, $generation_params);
            
            // Set ETag header for the response
            APIUtils::set_etag_header($metadata['version']);
            
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
     * Save a workout to the database
     *
     * @param array $workout The workout data
     * @param array $params The generation parameters
     * @return int Post ID
     */
    private function save_workout($workout, $params) {
        $user_id = get_current_user_id();
        $now = current_time('mysql');
        
        // Create post
        $post_id = wp_insert_post([
            'post_title'  => $workout['title'] ?? __('Generated Workout', 'fitcopilot'),
            'post_type'   => 'fc_workout',
            'post_status' => 'publish',
            'post_author' => $user_id,
        ]);
        
        if (is_wp_error($post_id)) {
            throw new \Exception($post_id->get_error_message());
        }
        
        // Standardize workout data format for consistency
        $standardized_workout = [
            'title' => $workout['title'] ?? __('Generated Workout', 'fitcopilot'),
            'exercises' => $workout['exercises'] ?? [],
            'sections' => $workout['sections'] ?? [],
            'duration' => $workout['duration'] ?? $params['duration'],
            'difficulty' => $workout['difficulty'] ?? $params['difficulty'],
            'equipment' => $workout['equipment'] ?? $params['equipment'],
            'goals' => $workout['goals'] ?? $params['goals'],
            'restrictions' => $workout['restrictions'] ?? $params['restrictions'],
            'metadata' => [
                'ai_generated' => true,
                'created_at' => $now,
                'generation_params' => $params,
                'openai_model' => $workout['model'] ?? 'unknown',
                'format_version' => '1.0'
            ]
        ];
        
        // Save standardized workout data
        update_post_meta($post_id, '_workout_data', wp_json_encode($standardized_workout));
        
        // Save generation parameters as separate meta for backward compatibility
        update_post_meta($post_id, '_workout_difficulty', $params['difficulty']);
        update_post_meta($post_id, '_workout_duration', $params['duration']);
        update_post_meta($post_id, '_workout_equipment', $params['equipment']);
        update_post_meta($post_id, '_workout_goals', $params['goals']);
        update_post_meta($post_id, '_workout_restrictions', $params['restrictions']);
        update_post_meta($post_id, '_workout_specific_request', $params['specific_request']);
        
        // Initialize version information
        update_post_meta($post_id, '_workout_version', 1);
        update_post_meta($post_id, '_workout_last_modified', $now);
        update_post_meta($post_id, '_workout_modified_by', $user_id);
        
        return $post_id;
    }
} 