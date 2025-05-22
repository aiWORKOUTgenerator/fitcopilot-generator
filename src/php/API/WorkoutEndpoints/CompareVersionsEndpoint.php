<?php
/**
 * Compare Versions Endpoint
 *
 * Handles workout version comparison through the REST API
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;
use FitCopilot\Service\Versioning\VersioningUtils;
use FitCopilot\Service\Versioning\VersioningServiceCompare;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Compare Versions Endpoint class
 */
class CompareVersionsEndpoint extends AbstractEndpoint {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->route = '/workouts/(?P<id>\d+)/versions/compare';
        $this->method = 'GET';
        
        parent::__construct();
        
        error_log('FitCopilot CompareVersionsEndpoint initialized');
    }
    
    /**
     * Handle version comparison request
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
        
        // Validate and get version numbers
        $version1 = (int) $request->get_param('v1');
        $version2 = (int) $request->get_param('v2');
        
        if ($version1 <= 0 || $version2 <= 0) {
            return APIUtils::create_api_error(
                'invalid_version',
                __('Version numbers must be positive integers.', 'fitcopilot')
            );
        }
        
        // Use VersioningServiceCompare directly
        $versioning_service = new VersioningServiceCompare();
        
        // Generate comparison
        $comparison = $versioning_service->compare_workout_versions(
            $workout_id,
            $version1,
            $version2
        );
        
        // Return formatted API response
        return APIUtils::create_api_response(
            $comparison,
            __('Workout versions comparison generated successfully.', 'fitcopilot')
        );
    }
} 