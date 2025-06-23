<?php
/**
 * API Tracker Endpoint
 *
 * Registers REST API endpoints for accessing API usage statistics.
 */

namespace FitCopilot\API;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Tracker Endpoint class
 */
class APITrackerEndpoint {
    
    /**
     * API namespace
     *
     * @var string
     */
    const API_NAMESPACE = 'fitcopilot/v1';
    
    /**
     * API tracker instance
     *
     * @var APITracker
     */
    private $tracker;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->tracker = new APITracker();
        
        // Register REST routes
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Get summary statistics
        register_rest_route(
            self::API_NAMESPACE,
            '/api-tracker/summary',
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_summary'],
                'permission_callback' => [$this, 'check_admin_permission'],
            ]
        );
        
        // Get daily statistics
        register_rest_route(
            self::API_NAMESPACE,
            '/api-tracker/daily',
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_daily_stats'],
                'permission_callback' => [$this, 'check_admin_permission'],
                'args' => [
                    'days' => [
                        'default' => 30,
                        'sanitize_callback' => 'absint',
                    ],
                ],
            ]
        );
        
        // Get monthly statistics
        register_rest_route(
            self::API_NAMESPACE,
            '/api-tracker/monthly',
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_monthly_stats'],
                'permission_callback' => [$this, 'check_admin_permission'],
                'args' => [
                    'months' => [
                        'default' => 12,
                        'sanitize_callback' => 'absint',
                    ],
                ],
            ]
        );
        
        // Reset statistics
        register_rest_route(
            self::API_NAMESPACE,
            '/api-tracker/reset',
            [
                'methods' => 'POST',
                'callback' => [$this, 'reset_stats'],
                'permission_callback' => [$this, 'check_admin_permission'],
            ]
        );
        
        // Update token cost
        register_rest_route(
            self::API_NAMESPACE,
            '/api-tracker/token-cost',
            [
                'methods' => 'POST',
                'callback' => [$this, 'update_token_cost'],
                'permission_callback' => [$this, 'check_admin_permission'],
                'args' => [
                    'cost' => [
                        'required' => true,
                        'sanitize_callback' => 'floatval',
                    ],
                ],
            ]
        );
    }
    
    /**
     * Check if the current user has admin permissions
     *
     * @return bool Whether the current user has admin permissions
     */
    public function check_admin_permission() {
        return current_user_can('manage_options');
    }
    
    /**
     * Get summary statistics
     *
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response The response object
     */
    public function get_summary($request) {
        $summary = $this->tracker->get_summary();
        
        return rest_ensure_response([
            'success' => true,
            'data' => $summary,
        ]);
    }
    
    /**
     * Get daily statistics
     *
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response The response object
     */
    public function get_daily_stats($request) {
        $days = $request->get_param('days');
        $stats = $this->tracker->get_daily_stats($days);
        
        return rest_ensure_response([
            'success' => true,
            'data' => $stats,
        ]);
    }
    
    /**
     * Get monthly statistics
     *
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response The response object
     */
    public function get_monthly_stats($request) {
        $months = $request->get_param('months');
        $stats = $this->tracker->get_monthly_stats($months);
        
        return rest_ensure_response([
            'success' => true,
            'data' => $stats,
        ]);
    }
    
    /**
     * Reset statistics
     *
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response The response object
     */
    public function reset_stats($request) {
        $result = $this->tracker->reset_stats();
        
        if ($result === false) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Failed to reset API statistics', 'fitcopilot'),
            ]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => __('API statistics have been reset', 'fitcopilot'),
        ]);
    }
    
    /**
     * Update token cost
     *
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response The response object
     */
    public function update_token_cost($request) {
        $cost = $request->get_param('cost');
        $result = $this->tracker->update_token_cost($cost);
        
        if (!$result) {
            return rest_ensure_response([
                'success' => false,
                'message' => __('Failed to update token cost', 'fitcopilot'),
            ]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => sprintf(__('Token cost updated to $%s per 1M tokens', 'fitcopilot'), number_format($cost, 4)),
            'data' => [
                'token_cost' => $cost,
            ],
        ]);
    }
}

// Initialize the endpoint
new APITrackerEndpoint(); 