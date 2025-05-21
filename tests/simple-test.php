<?php
/**
 * Simple test script to verify the ProfileEndpoints class
 * 
 * This script does not require the WordPress testing framework
 */

// Define ABSPATH to prevent "accessed directly" guards from exiting
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/../');
}

// Mock WordPress functions
if (!function_exists('add_action')) {
    function add_action() { return true; }
}

if (!function_exists('register_rest_route')) {
    function register_rest_route() { return true; }
}

if (!function_exists('is_user_logged_in')) {
    function is_user_logged_in() { return true; }
}

if (!function_exists('get_current_user_id')) {
    function get_current_user_id() { return 1; }
}

if (!function_exists('get_user_meta')) {
    function get_user_meta($user_id, $key, $single = false) { 
        return $key === '_profile_fitness_level' ? 'intermediate' : 
              ($key === '_profile_workout_goals' ? ['strength'] : '');
    }
}

if (!function_exists('update_user_meta')) {
    function update_user_meta() { return true; }
}

if (!function_exists('do_action')) {
    function do_action() { return true; }
}

if (!function_exists('current_time')) {
    function current_time() { return date('Y-m-d H:i:s'); }
}

if (!function_exists('sanitize_text_field')) {
    function sanitize_text_field($text) { return $text; }
}

if (!function_exists('sanitize_textarea_field')) {
    function sanitize_textarea_field($text) { return $text; }
}

if (!class_exists('WP_REST_Request')) {
    class WP_REST_Request {
        private $body = '';
        
        public function __construct() {}
        
        public function set_body($body) {
            $this->body = $body;
        }
        
        public function get_body() {
            return $this->body;
        }
        
        public function get_json_params() {
            return json_decode($this->body, true);
        }
        
        public function get_query_params() {
            return [];
        }
    }
}

if (!class_exists('WP_REST_Response')) {
    class WP_REST_Response {
        private $data;
        private $status;
        
        public function __construct($data, $status = 200) {
            $this->data = $data;
            $this->status = $status;
        }
        
        public function get_data() {
            return $this->data;
        }
        
        public function get_status() {
            return $this->status;
        }
    }
}

// Include autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Include the required files manually
require_once __DIR__ . '/../src/php/API/APIUtils.php';
require_once __DIR__ . '/../src/php/API/ProfileEndpoints.php';

// Create a simple test class
class SimpleProfileEndpointsTest {
    
    /**
     * Run tests
     */
    public function run() {
        echo "Running simple ProfileEndpoints tests...\n\n";
        
        // Test class exists
        $this->test_class_exists();
        
        // Test method exists 
        $this->test_method_exists();
        
        // Test basic functionality
        $this->test_basic_functionality();
        
        echo "\nAll tests completed.\n";
    }
    
    /**
     * Test that the class exists
     */
    private function test_class_exists() {
        $result = class_exists('FitCopilot\API\ProfileEndpoints');
        echo "Class FitCopilot\API\ProfileEndpoints exists: " . ($result ? "PASS" : "FAIL") . "\n";
        
        if (!$result) {
            echo "Error: Class not found\n";
            exit(1);
        }
        
        $result = class_exists('FitCopilot\API\APIUtils');
        echo "Class FitCopilot\API\APIUtils exists: " . ($result ? "PASS" : "FAIL") . "\n";
        
        if (!$result) {
            echo "Error: APIUtils class not found\n";
            exit(1);
        }
    }
    
    /**
     * Test that required methods exist
     */
    private function test_method_exists() {
        $endpoints = new FitCopilot\API\ProfileEndpoints();
        
        $methods = [
            'register_endpoints', 
            'user_permissions_check',
            'get_profile',
            'update_profile'
        ];
        
        foreach ($methods as $method) {
            $result = method_exists($endpoints, $method);
            echo "Method $method exists: " . ($result ? "PASS" : "FAIL") . "\n";
            
            if (!$result) {
                echo "Error: Method $method not found\n";
                exit(1);
            }
        }
        
        $utils_methods = [
            'normalize_request_data',
            'create_api_response',
            'create_validation_error',
            'get_success_message'
        ];
        
        foreach ($utils_methods as $method) {
            $result = method_exists('FitCopilot\API\APIUtils', $method);
            echo "APIUtils method $method exists: " . ($result ? "PASS" : "FAIL") . "\n";
            
            if (!$result) {
                echo "Error: APIUtils method $method not found\n";
                exit(1);
            }
        }
    }
    
    /**
     * Test basic functionality
     */
    private function test_basic_functionality() {
        $endpoints = new FitCopilot\API\ProfileEndpoints();
        
        // Test get_profile
        $request = new WP_REST_Request();
        $response = $endpoints->get_profile($request);
        
        $result = $response instanceof WP_REST_Response;
        echo "get_profile returns WP_REST_Response: " . ($result ? "PASS" : "FAIL") . "\n";
        
        if (!$result) {
            echo "Error: get_profile did not return WP_REST_Response\n";
            exit(1);
        }
        
        $data = $response->get_data();
        $result = isset($data['success']) && $data['success'] === true;
        echo "get_profile response has success=true: " . ($result ? "PASS" : "FAIL") . "\n";
        
        // Test update_profile with valid data
        $request = new WP_REST_Request();
        $request->set_body(json_encode([
            'fitnessLevel' => 'advanced',
            'workoutGoals' => ['cardio'],
        ]));
        
        $response = $endpoints->update_profile($request);
        
        $result = $response instanceof WP_REST_Response;
        echo "update_profile returns WP_REST_Response: " . ($result ? "PASS" : "FAIL") . "\n";
        
        if (!$result) {
            echo "Error: update_profile did not return WP_REST_Response\n";
            exit(1);
        }
        
        $data = $response->get_data();
        $result = isset($data['success']) && $data['success'] === true;
        echo "update_profile response has success=true: " . ($result ? "PASS" : "FAIL") . "\n";
    }
}

// Run the test
$test = new SimpleProfileEndpointsTest();
$test->run(); 