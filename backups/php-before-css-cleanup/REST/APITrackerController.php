<?php
/**
 * API Tracker REST Controller
 * 
 * Provides REST API endpoints for the API Tracker admin interface.
 */

namespace FitCopilot\REST;

use FitCopilot\API\APITracker;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Tracker controller class
 */
class APITrackerController extends WP_REST_Controller {
    
    /**
     * API Tracker instance
     *
     * @var APITracker
     */
    private $api_tracker;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->namespace = 'fitcopilot/v1';
        $this->rest_base = 'api-tracker';
        $this->api_tracker = new APITracker();
    }
    
    /**
     * Register routes
     */
    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->rest_base . '/summary', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_summary'],
                'permission_callback' => [$this, 'admin_permissions_check'],
            ],
        ]);
        
        register_rest_route($this->namespace, '/' . $this->rest_base . '/daily', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_daily_stats'],
                'permission_callback' => [$this, 'admin_permissions_check'],
                'args'                => [
                    'days' => [
                        'default'           => 30,
                        'sanitize_callback' => 'absint',
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0 && $param <= 365;
                        },
                    ],
                ],
            ],
        ]);
        
        register_rest_route($this->namespace, '/' . $this->rest_base . '/monthly', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_monthly_stats'],
                'permission_callback' => [$this, 'admin_permissions_check'],
                'args'                => [
                    'months' => [
                        'default'           => 12,
                        'sanitize_callback' => 'absint',
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param > 0 && $param <= 36;
                        },
                    ],
                ],
            ],
        ]);
        
        register_rest_route($this->namespace, '/' . $this->rest_base . '/reset', [
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'reset_stats'],
                'permission_callback' => [$this, 'admin_permissions_check'],
            ],
        ]);
        
        register_rest_route($this->namespace, '/' . $this->rest_base . '/token-cost', [
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_token_cost'],
                'permission_callback' => [$this, 'admin_permissions_check'],
            ],
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => [$this, 'update_token_cost'],
                'permission_callback' => [$this, 'admin_permissions_check'],
                'args'                => [
                    'cost' => [
                        'required'          => true,
                        'sanitize_callback' => function($param) {
                            return (float) $param;
                        },
                        'validate_callback' => function($param) {
                            return is_numeric($param) && $param >= 0;
                        },
                    ],
                ],
            ],
        ]);
    }
    
    /**
     * Check if current user has admin permissions
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|WP_Error True if the request has admin access, WP_Error otherwise.
     */
    public function admin_permissions_check($request) {
        if (!current_user_can('manage_options')) {
            return new WP_Error(
                'rest_forbidden',
                esc_html__('You do not have permissions to view this data.', 'fitcopilot'),
                ['status' => 403]
            );
        }
        return true;
    }
    
    /**
     * Get summary statistics
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response.
     */
    public function get_summary($request) {
        $summary = $this->api_tracker->get_summary();
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $summary,
        ]);
    }
    
    /**
     * Get daily statistics
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response.
     */
    public function get_daily_stats($request) {
        $days = $request->get_param('days');
        $stats = $this->api_tracker->get_daily_stats($days);
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $stats,
        ]);
    }
    
    /**
     * Get monthly statistics
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response.
     */
    public function get_monthly_stats($request) {
        $months = $request->get_param('months');
        $stats = $this->api_tracker->get_monthly_stats($months);
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $stats,
        ]);
    }
    
    /**
     * Reset all statistics
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response.
     */
    public function reset_stats($request) {
        $success = $this->api_tracker->reset_stats();
        
        if ($success) {
            return rest_ensure_response([
                'success' => true,
                'message' => __('Statistics reset successfully.', 'fitcopilot'),
            ]);
        }
        
        return new WP_Error(
            'reset_failed',
            esc_html__('Failed to reset statistics.', 'fitcopilot'),
            ['status' => 500]
        );
    }
    
    /**
     * Get token cost
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response.
     */
    public function get_token_cost($request) {
        $cost = $this->api_tracker->get_token_cost();
        
        return rest_ensure_response([
            'success' => true,
            'data'    => ['cost' => $cost],
        ]);
    }
    
    /**
     * Update token cost
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The response.
     */
    public function update_token_cost($request) {
        $cost = $request->get_param('cost');
        $success = $this->api_tracker->update_token_cost($cost);
        
        if ($success) {
            return rest_ensure_response([
                'success' => true,
                'message' => __('Token cost updated successfully.', 'fitcopilot'),
                'data'    => ['cost' => $cost],
            ]);
        }
        
        return new WP_Error(
            'update_failed',
            esc_html__('Failed to update token cost.', 'fitcopilot'),
            ['status' => 500]
        );
    }
} 