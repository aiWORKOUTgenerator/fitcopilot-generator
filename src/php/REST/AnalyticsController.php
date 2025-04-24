<?php
/**
 * Analytics REST Controller
 * 
 * Handles tracking user events via the WordPress REST API
 */

namespace FitCopilot\REST;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the analytics REST routes
 */
function register_analytics_routes() {
    register_rest_route('fitcopilot/v1', '/analytics', [
        'methods'             => 'POST',
        'callback'            => __NAMESPACE__ . '\\track_event',
        'permission_callback' => '__return_true', // Allow anonymous tracking
        'args' => [
            'event_type' => [
                'required' => true,
                'type'     => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'event_data' => [
                'required' => false,
                'type'     => 'object',
                'default'  => [],
            ],
        ],
    ]);
}
add_action('rest_api_init', __NAMESPACE__ . '\\register_analytics_routes');

/**
 * Track an analytics event
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response
 */
function track_event(\WP_REST_Request $request) {
    $params = $request->get_json_params();
    $event_type = $params['event_type'] ?? '';
    $event_data = $params['event_data'] ?? [];
    
    if (empty($event_type)) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Event type is required',
        ], 400);
    }
    
    // Get user ID (0 for anonymous users)
    $user_id = get_current_user_id();
    
    // Log the event using the existing function from EventTracking
    $logged = \FitCopilot\Analytics\log_event($user_id, $event_type, $event_data);
    
    if ($logged) {
        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Event tracked successfully',
        ]);
    } else {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Failed to track event',
        ], 500);
    }
} 