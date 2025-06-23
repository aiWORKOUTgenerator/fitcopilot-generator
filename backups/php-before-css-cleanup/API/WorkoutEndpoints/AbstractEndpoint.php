<?php
/**
 * Abstract Endpoint Base Class
 *
 * Base abstract class for all workout endpoint implementations
 * Provides common methods for permission checking, response formatting, and error handling
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Abstract Endpoint class that all specific endpoint classes will extend
 */
abstract class AbstractEndpoint {
    
    /**
     * API namespace
     */
    const API_NAMESPACE = 'fitcopilot/v1';
    
    /**
     * Route for the endpoint
     */
    protected $route;
    
    /**
     * HTTP method for the endpoint
     */
    protected $method;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Register the endpoint when class is instantiated
        add_action('rest_api_init', [$this, 'register_endpoint']);
        
        // Execute the action immediately if it's already fired
        if (did_action('rest_api_init')) {
            $this->register_endpoint();
        }
    }
    
    /**
     * Register REST endpoint
     * This method will be called to register the endpoint with WP REST API
     */
    public function register_endpoint() {
        register_rest_route(self::API_NAMESPACE, $this->route, [
            'methods'             => $this->method,
            'callback'            => [$this, 'handle_request'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);
    }
    
    /**
     * Check if the current user has necessary permissions
     * Default implementation requires user to be logged in
     *
     * @return bool Whether the user has permission
     */
    public function check_permissions() {
        return is_user_logged_in();
    }
    
    /**
     * Handle the API request
     * This method must be implemented by child classes
     *
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response The response object
     */
    abstract public function handle_request(\WP_REST_Request $request);
    
    /**
     * Extract workout parameters from the request
     * Handles both direct and wrapped formats
     *
     * @param \WP_REST_Request $request The request object
     * @param string $wrapper_key The key for wrapped parameters
     * @return array Extracted parameters
     */
    protected function extract_params(\WP_REST_Request $request, $wrapper_key = 'workout') {
        // Get body as JSON
        $body_raw = $request->get_body();
        
        // Get JSON body params (WordPress parsed)
        $body_params = $request->get_json_params() ?: [];
        
        // Get URL query params
        $url_params = $request->get_query_params();
        
        // Try to parse JSON ourselves to ensure WordPress didn't mess with it
        $manual_json = json_decode($body_raw, true);
        
        $params = [];
        
        // Use APIUtils if available
        if (class_exists('\\FitCopilot\\API\\APIUtils')) {
            $params = \FitCopilot\API\APIUtils::normalize_request_data($manual_json ?: $body_params, $wrapper_key);
        } 
        // Fall back to manual extraction
        else {
            // First check manually parsed JSON for wrapped format
            if ($manual_json && isset($manual_json[$wrapper_key]) && is_array($manual_json[$wrapper_key])) {
                $params = $manual_json[$wrapper_key];
            }
            // Then check WordPress parsed JSON for wrapped format
            else if (isset($body_params[$wrapper_key]) && is_array($body_params[$wrapper_key])) {
                $params = $body_params[$wrapper_key];
            }
            // Finally fall back to direct format
            else {
                $params = $body_params;
            }
        }
        
        // Merge in any URL parameters (they override body params)
        return array_merge($params, $url_params);
    }
} 