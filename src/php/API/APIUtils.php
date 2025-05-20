<?php
/**
 * API Utilities
 *
 * Provides utility functions for standardizing API requests and responses.
 */

namespace FitCopilot\API;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Utilities class
 */
class APIUtils {
    
    /**
     * Extract data from wrapper if present
     * 
     * @param array|null $params Request parameters
     * @param string $wrapper_key The wrapper key to look for
     * @return array Normalized parameters
     */
    public static function normalize_request_data($params, $wrapper_key) {
        if (!is_array($params)) {
            return [];
        }
        
        if (isset($params[$wrapper_key]) && is_array($params[$wrapper_key])) {
            return $params[$wrapper_key];
        }
        
        return $params;
    }
    
    /**
     * Create a standardized response object
     * 
     * @param mixed $data Response data
     * @param string $message Response message
     * @param bool $success Success indicator
     * @param string|null $code Error code (for errors only)
     * @param int $status HTTP status code
     * @return \WP_REST_Response
     */
    public static function create_api_response($data, $message, $success = true, $code = null, $status = 200) {
        $response = [
            'success' => $success,
            'message' => $message,
        ];
        
        if ($success) {
            $response['data'] = $data;
        } else {
            $response['code'] = $code ?: 'error';
            if ($data) {
                $response['data'] = $data;
            }
        }
        
        return new \WP_REST_Response($response, $status);
    }
    
    /**
     * Create a validation error response
     * 
     * @param array $validation_errors Array of field errors
     * @param string $message Error message
     * @param int $status HTTP status code
     * @return \WP_REST_Response
     */
    public static function create_validation_error($validation_errors, $message = 'Validation failed', $status = 400) {
        return self::create_api_response(
            ['validation_errors' => $validation_errors],
            $message,
            false,
            'validation_error',
            $status
        );
    }
    
    /**
     * Create a not found error response
     * 
     * @param string $message Error message
     * @param string $code Error code
     * @return \WP_REST_Response
     */
    public static function create_not_found_error($message = 'Resource not found', $code = 'not_found') {
        return self::create_api_response(
            null,
            $message,
            false,
            $code,
            404
        );
    }
    
    /**
     * Create a permission error response
     * 
     * @param string $message Error message
     * @return \WP_REST_Response
     */
    public static function create_permission_error($message = 'Permission denied') {
        return self::create_api_response(
            null,
            $message,
            false,
            'permission_denied',
            403
        );
    }
    
    /**
     * Create a server error response
     * 
     * @param string $message Error message
     * @param mixed $data Additional error data
     * @return \WP_REST_Response
     */
    public static function create_server_error($message = 'Server error', $data = null) {
        return self::create_api_response(
            $data,
            $message,
            false,
            'server_error',
            500
        );
    }
    
    /**
     * Get a standardized success message for an operation
     * 
     * @param string $operation The operation that was performed
     * @param string $resource The resource type
     * @return string
     */
    public static function get_success_message($operation, $resource) {
        $messages = [
            'get' => '%s retrieved successfully',
            'list' => '%s list retrieved successfully',
            'create' => '%s created successfully',
            'update' => '%s updated successfully',
            'delete' => '%s deleted successfully',
            'complete' => '%s completed successfully',
        ];
        
        $operation = strtolower($operation);
        $message_template = isset($messages[$operation]) ? $messages[$operation] : '%s processed successfully';
        
        return sprintf($message_template, ucfirst($resource));
    }
} 