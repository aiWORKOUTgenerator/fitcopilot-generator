<?php
/**
 * Version History Endpoint
 *
 * Handles workout version history retrieval through the REST API
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;
use FitCopilot\Service\Versioning\VersioningUtils;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Version History Endpoint class
 */
class VersionHistoryEndpoint extends AbstractEndpoint {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->route = '/workouts/(?P<id>\d+)/versions';
        $this->method = 'GET';
        
        parent::__construct();
        
        error_log('FitCopilot VersionHistoryEndpoint initialized');
    }
    
    /**
     * Handle version history request
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function handle_request(\WP_REST_Request $request) {
        // Get workout ID from path
        $workout_id = $request->get_param('id');
        $post = get_post($workout_id);
        
        // Validate workout exists and user has access
        if (!$post || ($post->post_type !== 'fc_workout' && $post->post_type !== 'wg_workout') || $post->post_author != get_current_user_id()) {
            return APIUtils::create_not_found_error(__('Workout not found.', 'fitcopilot'));
        }
        
        // Extract and sanitize query parameters for filtering and pagination
        $from_version = (int) $request->get_param('from_version');
        $to_version = (int) $request->get_param('to_version');
        
        // Validate and sanitize date parameters
        $from_date = $request->get_param('from_date');
        $to_date = $request->get_param('to_date');
        
        // Validate date format (YYYY-MM-DD)
        if (!empty($from_date) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $from_date)) {
            $from_date = '';
        }
        
        if (!empty($to_date) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to_date)) {
            $to_date = '';
        }
        
        // Sanitize pagination parameters with reasonable defaults and limits
        $per_page = (int) $request->get_param('per_page');
        $per_page = ($per_page > 0) ? min($per_page, 100) : 10; // Limit to 100 max, default to 10
        
        $page = (int) $request->get_param('page');
        $page = ($page > 0) ? $page : 1; // Default to page 1
        
        // Calculate offset for pagination
        $offset = ($page - 1) * $per_page;
        
        // Get versioning service
        $versioning_service = VersioningUtils::get_versioning_service();
        
        if (!$versioning_service) {
            return APIUtils::create_api_error(
                'service_not_available',
                __('Versioning service is not available.', 'fitcopilot')
            );
        }
        
        // Get version history with filters
        $history = $versioning_service->get_workout_version_history(
            $workout_id,
            [
                'from_version' => $from_version,
                'to_version' => $to_version,
                'from_date' => $from_date,
                'to_date' => $to_date,
                'limit' => $per_page,
                'offset' => $offset
            ]
        );
        
        // Include pagination information
        $response_data = [
            'versions' => $history['versions'],
            'total' => $history['total'],
            'totalPages' => ceil($history['total'] / $per_page),
            'currentPage' => $page
        ];
        
        // Return formatted API response
        return APIUtils::create_api_response(
            $response_data,
            __('Workout version history retrieved successfully.', 'fitcopilot')
        );
    }
} 