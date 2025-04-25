<?php
/**
 * API Tracker Endpoints
 *
 * Registers REST API endpoints for the API Tracker.
 */

namespace FitCopilot\API;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Tracker Endpoints class
 */
class APITrackerEndpoints {
    
    /**
     * API namespace
     */
    const API_NAMESPACE = 'fitcopilot/v1';
    
    /**
     * API Tracker instance
     *
     * @var APITracker
     */
    private $tracker;
    
    /**
     * Constructor
     *
     * @param APITracker $tracker The API Tracker instance
     */
    public function __construct(APITracker $tracker) {
        $this->tracker = $tracker;
        
        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'register_endpoints']);
    }
    
    /**
     * Register REST API endpoints
     */
    public function register_endpoints() {
        // Get summary statistics
        register_rest_route(self::API_NAMESPACE, '/api-tracker/summary', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_summary'],
            'permission_callback' => [$this, 'admin_permissions_check'],
        ]);
        
        // Get daily statistics
        register_rest_route(self::API_NAMESPACE, '/api-tracker/daily', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_daily_stats'],
            'permission_callback' => [$this, 'admin_permissions_check'],
        ]);
        
        // Get monthly statistics
        register_rest_route(self::API_NAMESPACE, '/api-tracker/monthly', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_monthly_stats'],
            'permission_callback' => [$this, 'admin_permissions_check'],
        ]);
        
        // Update token cost
        register_rest_route(self::API_NAMESPACE, '/api-tracker/token-cost', [
            'methods'             => 'POST',
            'callback'            => [$this, 'update_token_cost'],
            'permission_callback' => [$this, 'admin_permissions_check'],
            'args'                => [
                'cost' => [
                    'required'          => true,
                    'type'              => 'number',
                    'validate_callback' => function($param) {
                        return is_numeric($param) && floatval($param) > 0;
                    },
                    'sanitize_callback' => 'floatval',
                ],
            ],
        ]);
        
        // Reset statistics
        register_rest_route(self::API_NAMESPACE, '/api-tracker/reset', [
            'methods'             => 'POST',
            'callback'            => [$this, 'reset_stats'],
            'permission_callback' => [$this, 'admin_permissions_check'],
        ]);
    }
    
    /**
     * Check if the current user has administrator permissions
     *
     * @return bool Whether the user has permission
     */
    public function admin_permissions_check() {
        return current_user_can('manage_options');
    }
    
    /**
     * Get summary statistics
     *
     * @return \WP_REST_Response REST response
     */
    public function get_summary() {
        $summary = $this->tracker->get_summary();
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $summary,
        ]);
    }
    
    /**
     * Get daily statistics
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function get_daily_stats(\WP_REST_Request $request) {
        $days = $request->get_param('days');
        
        if (!$days) {
            $days = 30;
        } else {
            $days = max(1, min(90, intval($days)));
        }
        
        $stats = $this->tracker->get_daily_stats($days);
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $stats,
        ]);
    }
    
    /**
     * Get monthly statistics
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function get_monthly_stats(\WP_REST_Request $request) {
        $months = $request->get_param('months');
        
        if (!$months) {
            $months = 12;
        } else {
            $months = max(1, min(24, intval($months)));
        }
        
        $stats = $this->tracker->get_monthly_stats($months);
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $stats,
        ]);
    }
    
    /**
     * Update token cost
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function update_token_cost(\WP_REST_Request $request) {
        $cost = $request->get_param('cost');
        
        $result = $this->tracker->update_token_cost($cost);
        
        if (!$result) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Failed to update token cost',
            ]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => 'Token cost updated successfully',
            'data'    => [
                'cost' => $this->tracker->get_token_cost(),
            ],
        ]);
    }
    
    /**
     * Reset statistics
     *
     * @return \WP_REST_Response REST response
     */
    public function reset_stats() {
        $result = $this->tracker->reset_stats();
        
        if (!$result) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Failed to reset statistics',
            ]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => 'Statistics reset successfully',
        ]);
    }
}

// Initialize endpoints with the shared tracker instance
global $fitcopilot_api_tracker;
if (!isset($fitcopilot_api_tracker)) {
    $fitcopilot_api_tracker = new APITracker();
}
new APITrackerEndpoints($fitcopilot_api_tracker); 