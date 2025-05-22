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
        
        // Check if parameters are wrapped in the wrapper_key (e.g., 'workout')
        if (isset($params[$wrapper_key]) && is_array($params[$wrapper_key])) {
            // Debug log to help troubleshoot
            error_log('Unwrapping params from wrapper: ' . $wrapper_key);
            error_log('Wrapped params: ' . print_r($params[$wrapper_key], true));
            return $params[$wrapper_key];
        }
        
        // If not wrapped, return params as is
        error_log('Using direct params format');
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
    
    /**
     * Create an API error response
     * 
     * @param string $code Error code
     * @param string $message Error message
     * @param mixed $data Additional error data
     * @param int $status HTTP status code
     * @return \WP_REST_Response
     */
    public static function create_api_error($code, $message, $data = null, $status = 400) {
        return self::create_api_response(
            $data,
            $message,
            false,
            $code,
            $status
        );
    }
    
    /**
     * Generate an ETag for a resource based on its version
     * 
     * @param mixed $version Version number or string
     * @return string The ETag with quotes (W/ for weak ETags)
     */
    public static function generate_etag($version) {
        return '"' . $version . '"';
    }
    
    /**
     * Set ETag headers for a response
     * 
     * @param int|string $version Version number or identifier
     * @param bool $weak Whether to use a weak ETag
     * @return void
     */
    public static function set_etag_header($version, $weak = false) {
        $etag = $weak ? 'W/' : '';
        $etag .= self::generate_etag($version);
        header('ETag: ' . $etag);
    }
    
    /**
     * Check if the client's If-Match header matches the current version
     * 
     * @param int|string $current_version Current version from server
     * @param \WP_REST_Request $request The request object containing headers
     * @return bool True if versions match or no If-Match header is present
     */
    public static function check_if_match($current_version, $request) {
        $headers = $request->get_headers();
        
        // If If-Match header is not present, return true (no validation required)
        if (!isset($headers['IF_MATCH']) || empty($headers['IF_MATCH'][0])) {
            return true;
        }
        
        // Get the If-Match header value
        $if_match = $headers['IF_MATCH'][0];
        
        // Strip quotes and weak indicator if present
        $if_match = str_replace(['W/', '"'], '', $if_match);
        $current_version = (string) $current_version;
        
        // Compare versions
        return $if_match === $current_version;
    }
    
    /**
     * Create a precondition failed response for ETag mismatch
     * 
     * @param int|string $current_version Current version from server
     * @return \WP_REST_Response
     */
    public static function create_precondition_failed($current_version) {
        self::set_etag_header($current_version);
        
        return self::create_api_error(
            'precondition_failed',
            __('The resource has been modified. Please get the latest version and try again.', 'fitcopilot'),
            ['current_version' => $current_version],
            412
        );
    }
    
    /**
     * Check If-None-Match header for conditional GET requests
     * 
     * @param int|string $current_version Current version from server
     * @param \WP_REST_Request $request The request object containing headers
     * @return bool True if the resource is modified, false if the client's cache is still valid
     */
    public static function is_modified($current_version, $request) {
        $headers = $request->get_headers();
        
        // If If-None-Match header is not present, return true (resource is considered modified)
        if (!isset($headers['IF_NONE_MATCH']) || empty($headers['IF_NONE_MATCH'][0])) {
            return true;
        }
        
        // Get the If-None-Match header value
        $if_none_match = $headers['IF_NONE_MATCH'][0];
        
        // Strip quotes and weak indicator if present
        $if_none_match = str_replace(['W/', '"'], '', $if_none_match);
        $current_version = (string) $current_version;
        
        // If versions match, the resource is not modified
        return $if_none_match !== $current_version;
    }
    
    /**
     * Create a not modified response with appropriate headers
     * 
     * @param int|string $version The current version
     * @return \WP_REST_Response
     */
    public static function create_not_modified_response($version) {
        // Set the ETag header
        self::set_etag_header($version);
        
        // Return a 304 Not Modified response
        // Note: 304 responses MUST NOT include a message-body
        return new \WP_REST_Response(null, 304);
    }
    
    /**
     * Add version metadata to response data
     * 
     * @param array $data The response data array
     * @param array $metadata Version metadata (version, last_modified, modified_by)
     * @param string|null $change_type Optional change type
     * @param string|null $change_summary Optional change summary
     * @return array Updated response data with version metadata
     */
    public static function add_version_metadata_to_response($data, $metadata, $change_type = null, $change_summary = null) {
        // Add the version metadata
        $data['version'] = $metadata['version'];
        $data['last_modified'] = $metadata['last_modified'];
        $data['modified_by'] = $metadata['modified_by'];
        
        // Add change information if provided
        if ($change_type !== null) {
            $data['change_type'] = $change_type;
        }
        
        if ($change_summary !== null) {
            $data['change_summary'] = $change_summary;
        }
        
        return $data;
    }
} 