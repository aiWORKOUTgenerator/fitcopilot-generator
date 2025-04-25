<?php
/**
 * API Tracker Controller
 * 
 * Handles API endpoints for the API usage tracker.
 */

namespace FitCopilot\API;

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
 * APITrackerController class
 */
class APITrackerController extends WP_REST_Controller {
    /**
     * API Tracker instance
     *
     * @var APITracker
     */
    private $tracker;

    /**
     * Constructor
     */
    public function __construct() {
        $this->namespace = 'fitcopilot/v1';
        $this->rest_base = 'api-tracker';
        $this->tracker = new APITracker();
    }

    /**
     * Register routes
     */
    public function register_routes() {
        // GET /fitcopilot/v1/api-tracker - Get summary statistics
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base,
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [$this, 'get_stats'],
                    'permission_callback' => [$this, 'get_items_permissions_check'],
                ],
            ]
        );

        // GET /fitcopilot/v1/api-tracker/daily - Get daily statistics
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/daily',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [$this, 'get_daily_stats'],
                    'permission_callback' => [$this, 'get_items_permissions_check'],
                    'args'                => [
                        'days' => [
                            'description' => __('Number of days to retrieve statistics for.', 'fitcopilot'),
                            'type'        => 'integer',
                            'default'     => 30,
                            'minimum'     => 1,
                            'maximum'     => 365,
                        ],
                    ],
                ],
            ]
        );

        // GET /fitcopilot/v1/api-tracker/monthly - Get monthly statistics
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/monthly',
            [
                [
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => [$this, 'get_monthly_stats'],
                    'permission_callback' => [$this, 'get_items_permissions_check'],
                    'args'                => [
                        'months' => [
                            'description' => __('Number of months to retrieve statistics for.', 'fitcopilot'),
                            'type'        => 'integer',
                            'default'     => 12,
                            'minimum'     => 1,
                            'maximum'     => 36,
                        ],
                    ],
                ],
            ]
        );

        // DELETE /fitcopilot/v1/api-tracker/reset - Reset all statistics
        register_rest_route(
            $this->namespace,
            '/' . $this->rest_base . '/reset',
            [
                [
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => [$this, 'reset_stats'],
                    'permission_callback' => [$this, 'update_item_permissions_check'],
                ],
            ]
        );
    }

    /**
     * Check if a given request has access to get items
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_Error|bool
     */
    public function get_items_permissions_check($request) {
        return current_user_can('manage_options');
    }

    /**
     * Check if a given request has access to update items
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_Error|bool
     */
    public function update_item_permissions_check($request) {
        return current_user_can('manage_options');
    }

    /**
     * Get summary statistics
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_stats($request) {
        $stats = $this->tracker->get_summary_stats();
        
        if (is_wp_error($stats)) {
            return rest_ensure_response([
                'success' => false,
                'message' => $stats->get_error_message(),
                'code'    => $stats->get_error_code(),
            ]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $stats,
        ]);
    }

    /**
     * Get daily statistics
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_daily_stats($request) {
        $days = $request->get_param('days');
        $stats = $this->tracker->get_daily_stats($days);
        
        if (is_wp_error($stats)) {
            return rest_ensure_response([
                'success' => false,
                'message' => $stats->get_error_message(),
                'code'    => $stats->get_error_code(),
            ]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $stats,
        ]);
    }

    /**
     * Get monthly statistics
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function get_monthly_stats($request) {
        $months = $request->get_param('months');
        $stats = $this->tracker->get_monthly_stats($months);
        
        if (is_wp_error($stats)) {
            return rest_ensure_response([
                'success' => false,
                'message' => $stats->get_error_message(),
                'code'    => $stats->get_error_code(),
            ]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'data'    => $stats,
        ]);
    }

    /**
     * Reset all statistics
     *
     * @param WP_REST_Request $request Full data about the request.
     * @return WP_Error|WP_REST_Response
     */
    public function reset_stats($request) {
        $result = $this->tracker->reset_stats();
        
        if (is_wp_error($result)) {
            return rest_ensure_response([
                'success' => false,
                'message' => $result->get_error_message(),
                'code'    => $result->get_error_code(),
            ]);
        }
        
        return rest_ensure_response([
            'success' => true,
            'message' => __('API statistics have been reset successfully.', 'fitcopilot'),
        ]);
    }
} 