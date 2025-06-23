<?php
/**
 * Workout Retrieval Endpoint
 *
 * Handles workout retrieval requests through the REST API
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;
use FitCopilot\Service\Versioning\VersioningUtils;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Workout Retrieval Endpoint class
 */
class WorkoutRetrievalEndpoint extends AbstractEndpoint {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->route = '/workouts';
        $this->method = 'GET';
        
        parent::__construct();
        
        // Register the single workout endpoint
        add_action('rest_api_init', [$this, 'register_single_workout_endpoint']);
        
        // Register the POST endpoint for workout creation
        add_action('rest_api_init', [$this, 'register_create_endpoint']);
        
        // Execute immediately if already fired
        if (did_action('rest_api_init')) {
            $this->register_single_workout_endpoint();
            $this->register_create_endpoint();
        }
        
        error_log('FitCopilot WorkoutRetrievalEndpoint initialized');
    }
    
    /**
     * Register single workout endpoint
     */
    public function register_single_workout_endpoint() {
        register_rest_route(self::API_NAMESPACE, '/workouts/(?P<id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_workout'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);
        
        error_log('FitCopilot registered endpoint: ' . self::API_NAMESPACE . '/workouts/(?P<id>\d+)');
    }
    
    /**
     * Register workout creation endpoint
     */
    public function register_create_endpoint() {
        register_rest_route(self::API_NAMESPACE, '/workouts', [
            'methods'             => 'POST',
            'callback'            => [$this, 'create_workout'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);
        
        error_log('FitCopilot registered endpoint: ' . self::API_NAMESPACE . '/workouts (POST)');
    }
    
    /**
     * Handle request to get all workouts
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function handle_request(\WP_REST_Request $request) {
        $user_id = get_current_user_id();
        
        $query_args = [
            'post_type'      => ['fc_workout', 'wg_workout'], // Support both post types for compatibility
            'author'         => $user_id,
            'posts_per_page' => 10,
            'post_status'    => 'publish',
            'orderby'        => 'date',
            'order'          => 'DESC',
        ];
        
        // Apply pagination if requested
        $page = (int) $request->get_param('page');
        $per_page = (int) $request->get_param('per_page');
        
        if ($page > 0) {
            $query_args['paged'] = $page;
        }
        
        if ($per_page > 0) {
            $query_args['posts_per_page'] = min($per_page, 100); // Limit to 100 max
        }
        
        $query = new \WP_Query($query_args);
        $workouts = [];
        
        foreach ($query->posts as $post) {
            $post_id = $post->ID;
            
            // Get version metadata
            $metadata = VersioningUtils::get_version_metadata($post_id, $post);
            
            // Build basic workout data
            $workout_data = [
                'id'          => $post_id,
                'title'       => $post->post_title,
                'date'        => $post->post_date,
                'modified'    => $post->post_modified,
                'difficulty'  => get_post_meta($post_id, '_workout_difficulty', true) ?: get_post_meta($post_id, 'workout_difficulty', true),
                'duration'    => get_post_meta($post_id, '_workout_duration', true) ?: get_post_meta($post_id, 'workout_duration', true),
                'excerpt'     => wp_trim_words($post->post_content, 20),
            ];
            
            // Add version metadata to the response
            $workout_data = APIUtils::add_version_metadata_to_response($workout_data, $metadata);
            
            $workouts[] = $workout_data;
        }
        
        // Include pagination information in the response
        $response_data = [
            'workouts' => $workouts,
            'total' => $query->found_posts,
            'totalPages' => $query->max_num_pages,
            'currentPage' => max(1, $page)
        ];
        
        return APIUtils::create_api_response(
            $response_data, 
            APIUtils::get_success_message('list', 'workouts')
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
        
        if (!$post || ($post->post_type !== 'fc_workout' && $post->post_type !== 'wg_workout') || $post->post_author != get_current_user_id()) {
            return APIUtils::create_not_found_error(__('Workout not found.', 'fitcopilot'));
        }
        
        // Get version metadata
        $metadata = VersioningUtils::get_version_metadata($post_id, $post);
        
        // Check If-None-Match header for conditional GET
        if (!APIUtils::is_modified($metadata['version'], $request)) {
            return APIUtils::create_not_modified_response($metadata['version']);
        }
        
        // Get the workout data
        $workout_data = get_post_meta($post_id, '_workout_data', true);
        $workout_data = $workout_data ? json_decode($workout_data, true) : [];
        
        // Get workout metadata
        $difficulty = get_post_meta($post_id, '_workout_difficulty', true);
        $duration = get_post_meta($post_id, '_workout_duration', true);
        $equipment = get_post_meta($post_id, '_workout_equipment', true);
        $goals = get_post_meta($post_id, '_workout_goals', true);
        $restrictions = get_post_meta($post_id, '_workout_restrictions', true);
        $specific_request = get_post_meta($post_id, '_workout_specific_request', true);
        
        // Set the ETag header for the response
        APIUtils::set_etag_header($metadata['version']);
        
        // Format the response
        $workout = [
            'id' => $post_id,
            'title' => $post->post_title,
            'date' => $post->post_date,
            'modified' => $post->post_modified,
            'difficulty' => $difficulty,
            'duration' => $duration,
            'equipment' => $equipment,
            'goals' => $goals,
            'restrictions' => $restrictions,
            'specific_request' => $specific_request,
            'workout_data' => $workout_data,
        ];
        
        // Add version metadata to the response
        $workout = APIUtils::add_version_metadata_to_response($workout, $metadata);
        
        return APIUtils::create_api_response(
            $workout, 
            APIUtils::get_success_message('get', 'workout')
        );
    }
    
    /**
     * Create a new workout
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function create_workout(\WP_REST_Request $request) {
        $user_id = get_current_user_id();
        $params = $this->extract_params($request, 'workout');
        
        // Validate required fields
        $validation_errors = [];
        if (empty($params['title'])) {
            $validation_errors['title'] = __('Workout title is required', 'fitcopilot');
        }
        
        if (!empty($validation_errors)) {
            return APIUtils::create_api_response(
                null,
                __('Validation failed', 'fitcopilot'),
                false,
                'validation_error',
                400,
                $validation_errors
            );
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
                'date' => get_post_field('post_date', $post_id),
                'modified' => get_post_field('post_modified', $post_id),
            ];
            
            // Add version metadata
            $response_data = APIUtils::add_version_metadata_to_response($response_data, $metadata);
            
            // Set ETag header for the response
            APIUtils::set_etag_header($metadata['version']);
            
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
} 