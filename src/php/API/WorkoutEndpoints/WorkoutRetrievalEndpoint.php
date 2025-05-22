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
        
        // Execute immediately if already fired
        if (did_action('rest_api_init')) {
            $this->register_single_workout_endpoint();
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
} 