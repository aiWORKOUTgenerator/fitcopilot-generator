<?php
/**
 * AjaxHandlerTrait - Shared AJAX handling functionality
 * 
 * Provides common AJAX handling methods that can be used by all debug controllers
 */

namespace FitCopilot\Admin\Debug\Traits;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * AjaxHandlerTrait
 * 
 * Shared functionality for AJAX request handling
 */
trait AjaxHandlerTrait {
    
    /**
     * Validate AJAX request with nonce and permissions
     *
     * @param string $nonce_action Nonce action name
     * @param string $capability Required capability (default: manage_options)
     * @return bool True if valid, dies with error if invalid
     */
    protected function validateAjaxRequest(string $nonce_action = 'fitcopilot_admin_ajax', string $capability = 'manage_options'): bool {
        // Check if user is logged in first
        if (!is_user_logged_in()) {
            wp_send_json_error([
                'message' => 'You must be logged in to access this feature',
                'code' => 'not_logged_in',
                'redirect_url' => wp_login_url(admin_url('admin.php?page=fitcopilot-testing-lab'))
            ]);
            return false;
        }
        
        // Check permissions
        if (!current_user_can($capability)) {
            wp_send_json_error([
                'message' => 'You do not have sufficient permissions to access this feature. Administrator access required.',
                'code' => 'insufficient_permissions',
                'debug_info' => [
                    'user_id' => get_current_user_id(),
                    'capability_required' => $capability,
                    'user_roles' => wp_get_current_user()->roles ?? [],
                    'is_admin' => current_user_can('administrator')
                ]
            ]);
            return false;
        }

        // Check nonce if provided (flexible nonce validation)
        if (isset($_POST['nonce']) && !empty($_POST['nonce'])) {
            $nonce_actions = [$nonce_action, 'fitcopilot_debug_test', 'wp_rest'];
            $nonce_valid = false;
            
            foreach ($nonce_actions as $action) {
                if (wp_verify_nonce($_POST['nonce'], $action)) {
                    $nonce_valid = true;
                    break;
                }
            }
            
            if (!$nonce_valid) {
                wp_send_json_error([
                    'message' => 'Invalid security token',
                    'code' => 'invalid_nonce'
                ]);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get request data from POST or input stream
     *
     * @return array Request data
     */
    protected function getRequestData(): array {
        // Try to get data from POST first
        if (!empty($_POST['test_data'])) {
            return is_array($_POST['test_data']) ? $_POST['test_data'] : json_decode($_POST['test_data'], true);
        }
        
        // Try to get data from input stream
        $input = file_get_contents('php://input');
        if (!empty($input)) {
            $data = json_decode($input, true);
            return $data ?? [];
        }
        
        return [];
    }
    
    /**
     * Send JSON success response with consistent format
     *
     * @param mixed $data Response data
     * @param string $message Optional success message
     * @return void
     */
    protected function sendSuccessResponse($data, string $message = ''): void {
        $response = [
            'success' => true,
            'data' => $data
        ];
        
        if (!empty($message)) {
            $response['message'] = $message;
        }
        
        wp_send_json_success($response);
    }
    
    /**
     * Send JSON error response with consistent format
     *
     * @param string $message Error message
     * @param string $code Error code
     * @param mixed $data Additional error data
     * @return void
     */
    protected function sendErrorResponse(string $message, string $code = 'error', $data = null): void {
        $response = [
            'message' => $message,
            'code' => $code
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        wp_send_json_error($response);
    }
    
    /**
     * Log AJAX request for debugging
     *
     * @param string $action AJAX action name
     * @param array $data Request data
     * @param float $start_time Request start time
     * @return void
     */
    protected function logAjaxRequest(string $action, array $data, float $start_time): void {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $duration = (microtime(true) - $start_time) * 1000;
            error_log(sprintf(
                '[FitCopilot Debug] AJAX %s completed in %.2fms with %d bytes of data',
                $action,
                $duration,
                strlen(json_encode($data))
            ));
        }
    }
    
    /**
     * Sanitize test data input
     *
     * @param array $data Raw input data
     * @return array Sanitized data
     */
    protected function sanitizeTestData(array $data): array {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeTestData($value);
            } elseif (is_string($value)) {
                $sanitized[$key] = sanitize_text_field($value);
            } elseif (is_numeric($value)) {
                $sanitized[$key] = is_float($value) ? floatval($value) : intval($value);
            } elseif (is_bool($value)) {
                $sanitized[$key] = (bool) $value;
            } else {
                $sanitized[$key] = $value;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Generate test ID for tracking
     *
     * @param string $prefix Test ID prefix
     * @return string Unique test ID
     */
    protected function generateTestId(string $prefix = 'test'): string {
        return $prefix . '_' . time() . '_' . wp_generate_password(8, false);
    }
    
    /**
     * Get performance metrics for a test
     *
     * @param float $start_time Test start time
     * @param string $prompt Generated prompt (optional)
     * @param string $response API response (optional)
     * @return array Performance metrics
     */
    protected function getPerformanceMetrics(float $start_time, string $prompt = '', string $response = ''): array {
        $total_time = (microtime(true) - $start_time) * 1000;
        
        return [
            'total_time' => round($total_time, 2),
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true),
            'prompt_length' => strlen($prompt),
            'response_length' => strlen($response),
            'estimated_tokens' => round((strlen($prompt) + strlen($response)) / 4),
            'timestamp' => time()
        ];
    }
} 