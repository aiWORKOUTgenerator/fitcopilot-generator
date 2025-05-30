<?php
/**
 * Phase 1 Stabilization Tests
 * 
 * Manual tests to validate workout data storage stabilization
 * Run these tests to verify Phase 1 fixes are working correctly.
 */

// Load WordPress if not already loaded
if (!defined('ABSPATH')) {
    if (file_exists('../../../wp-load.php')) {
        require_once('../../../wp-load.php');
    } else {
        die('WordPress not found. Run this script from the correct directory.');
    }
}

// Security check
if (!current_user_can('administrator')) {
    wp_die('Access denied. Administrator privileges required.');
}

/**
 * Test runner class
 */
class Phase1StabilizationTests {
    private $test_results = [];
    private $test_user_id;
    private $test_workouts = [];
    
    public function __construct() {
        echo "<style>
            body { font-family: -apple-system, sans-serif; margin: 20px; }
            .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
            .pass { color: #28a745; font-weight: bold; }
            .fail { color: #dc3545; font-weight: bold; }
            .warning { color: #ffc107; font-weight: bold; }
            .info { color: #17a2b8; }
            pre { background: #f8f9fa; padding: 10px; overflow-x: auto; }
        </style>";
        
        echo "<h1>🧪 Phase 1 Stabilization Tests</h1>";
        echo "<p>Testing defensive programming and data format standardization...</p>";
        
        $this->setup_test_environment();
    }
    
    public function run_all_tests() {
        $this->test_defensive_programming();
        $this->test_data_format_standardization();
        $this->test_api_endpoints();
        $this->test_error_handling();
        $this->test_backward_compatibility();
        
        $this->cleanup_test_environment();
        $this->display_summary();
    }
    
    private function setup_test_environment() {
        echo "<div class='test-section'>";
        echo "<h2>🔧 Setting Up Test Environment</h2>";
        
        // Create test user
        $this->test_user_id = wp_insert_user([
            'user_login' => 'fitcopilot_test_' . time(),
            'user_pass' => wp_generate_password(),
            'user_email' => 'test_' . time() . '@example.com',
            'role' => 'subscriber'
        ]);
        
        if (is_wp_error($this->test_user_id)) {
            echo "<p class='fail'>❌ Failed to create test user</p>";
            return;
        }
        
        wp_set_current_user($this->test_user_id);
        echo "<p class='pass'>✅ Test user created (ID: {$this->test_user_id})</p>";
        echo "</div>";
    }
    
    private function test_defensive_programming() {
        echo "<div class='test-section'>";
        echo "<h2>🛡️ Testing Defensive Programming</h2>";
        
        // Test 1: AI-generated workout format
        $this->test_ai_workout_format();
        
        // Test 2: Exercises wrapper format
        $this->test_exercises_wrapper_format();
        
        // Test 3: Invalid JSON format
        $this->test_invalid_json_format();
        
        // Test 4: Empty workout data
        $this->test_empty_workout_data();
        
        // Test 5: Unknown data format
        $this->test_unknown_data_format();
        
        echo "</div>";
    }
    
    private function test_ai_workout_format() {
        echo "<h3>Test 1: AI-Generated Workout Format</h3>";
        
        $workout_data = [
            'title' => 'AI Generated Test Workout',
            'exercises' => [
                ['name' => 'Push-ups', 'sets' => 3, 'reps' => 10],
                ['name' => 'Squats', 'sets' => 3, 'reps' => 15]
            ],
            'sections' => [
                ['name' => 'Warm-up', 'duration' => 300]
            ],
            'duration' => 30,
            'difficulty' => 'intermediate'
        ];
        
        $workout_id = $this->create_test_workout('AI Format Test', $workout_data);
        $retrieved = $this->test_workout_retrieval($workout_id, 'AI format');
        
        if ($retrieved && isset($retrieved['workout_data']['exercises'])) {
            echo "<p class='pass'>✅ AI format handled correctly</p>";
            $this->test_results['ai_format'] = true;
        } else {
            echo "<p class='fail'>❌ AI format not handled correctly</p>";
            $this->test_results['ai_format'] = false;
        }
    }
    
    private function test_exercises_wrapper_format() {
        echo "<h3>Test 2: Exercises Wrapper Format</h3>";
        
        $workout_data = [
            'exercises' => [
                ['name' => 'Lunges', 'sets' => 2, 'reps' => 12],
                ['name' => 'Planks', 'duration' => '30 seconds']
            ]
        ];
        
        $workout_id = $this->create_test_workout('Wrapper Format Test', $workout_data);
        $retrieved = $this->test_workout_retrieval($workout_id, 'wrapper format');
        
        if ($retrieved && isset($retrieved['workout_data']['exercises'])) {
            echo "<p class='pass'>✅ Wrapper format handled correctly</p>";
            $this->test_results['wrapper_format'] = true;
        } else {
            echo "<p class='fail'>❌ Wrapper format not handled correctly</p>";
            $this->test_results['wrapper_format'] = false;
        }
    }
    
    private function test_invalid_json_format() {
        echo "<h3>Test 3: Invalid JSON Format</h3>";
        
        $workout_id = wp_insert_post([
            'post_title' => 'Invalid JSON Test',
            'post_type' => 'fc_workout',
            'post_status' => 'publish',
            'post_author' => $this->test_user_id
        ]);
        
        // Store invalid JSON
        update_post_meta($workout_id, '_workout_data', 'invalid json string {not valid}');
        $this->test_workouts[] = $workout_id;
        
        $retrieved = $this->test_workout_retrieval($workout_id, 'invalid JSON');
        
        if ($retrieved && isset($retrieved['workout_data'])) {
            echo "<p class='pass'>✅ Invalid JSON handled gracefully with fallback</p>";
            $this->test_results['invalid_json'] = true;
        } else {
            echo "<p class='fail'>❌ Invalid JSON caused failure</p>";
            $this->test_results['invalid_json'] = false;
        }
    }
    
    private function test_empty_workout_data() {
        echo "<h3>Test 4: Empty Workout Data</h3>";
        
        $workout_id = wp_insert_post([
            'post_title' => 'Empty Data Test',
            'post_type' => 'fc_workout',
            'post_status' => 'publish',
            'post_author' => $this->test_user_id
        ]);
        
        // Don't set any _workout_data
        $this->test_workouts[] = $workout_id;
        
        $retrieved = $this->test_workout_retrieval($workout_id, 'empty data');
        
        if ($retrieved && isset($retrieved['workout_data'])) {
            echo "<p class='pass'>✅ Empty data handled with default structure</p>";
            $this->test_results['empty_data'] = true;
        } else {
            echo "<p class='fail'>❌ Empty data caused failure</p>";
            $this->test_results['empty_data'] = false;
        }
    }
    
    private function test_unknown_data_format() {
        echo "<h3>Test 5: Unknown Data Format</h3>";
        
        $workout_data = [
            'workout' => [
                'moves' => ['jumping jacks', 'burpees'],
                'custom_field' => 'some value'
            ],
            'metadata' => ['source' => 'unknown']
        ];
        
        $workout_id = $this->create_test_workout('Unknown Format Test', $workout_data);
        $retrieved = $this->test_workout_retrieval($workout_id, 'unknown format');
        
        if ($retrieved && isset($retrieved['workout_data'])) {
            echo "<p class='pass'>✅ Unknown format handled with extraction attempt</p>";
            $this->test_results['unknown_format'] = true;
        } else {
            echo "<p class='fail'>❌ Unknown format caused failure</p>";
            $this->test_results['unknown_format'] = false;
        }
    }
    
    private function test_data_format_standardization() {
        echo "<div class='test-section'>";
        echo "<h2>📐 Testing Data Format Standardization</h2>";
        
        // Test GenerateEndpoint format
        echo "<h3>Testing GenerateEndpoint Standard Format</h3>";
        if (class_exists('FitCopilot\\API\\WorkoutEndpoints\\GenerateEndpoint')) {
            echo "<p class='pass'>✅ GenerateEndpoint class exists</p>";
            
            // Check if save_workout method uses standardized format
            $reflection = new ReflectionClass('FitCopilot\\API\\WorkoutEndpoints\\GenerateEndpoint');
            $source = file_get_contents($reflection->getFileName());
            
            if (strpos($source, 'standardized_workout') !== false) {
                echo "<p class='pass'>✅ GenerateEndpoint implements standardized format</p>";
            } else {
                echo "<p class='fail'>❌ GenerateEndpoint does not use standardized format</p>";
            }
        } else {
            echo "<p class='fail'>❌ GenerateEndpoint class not found</p>";
        }
        
        // Test WorkoutRetrievalEndpoint format
        echo "<h3>Testing WorkoutRetrievalEndpoint Standard Format</h3>";
        if (class_exists('FitCopilot\\API\\WorkoutEndpoints\\WorkoutRetrievalEndpoint')) {
            echo "<p class='pass'>✅ WorkoutRetrievalEndpoint class exists</p>";
            
            $reflection = new ReflectionClass('FitCopilot\\API\\WorkoutEndpoints\\WorkoutRetrievalEndpoint');
            $source = file_get_contents($reflection->getFileName());
            
            if (strpos($source, 'standardized_workout') !== false) {
                echo "<p class='pass'>✅ WorkoutRetrievalEndpoint implements standardized format</p>";
            } else {
                echo "<p class='fail'>❌ WorkoutRetrievalEndpoint does not use standardized format</p>";
            }
        } else {
            echo "<p class='fail'>❌ WorkoutRetrievalEndpoint class not found</p>";
        }
        
        echo "</div>";
    }
    
    private function test_api_endpoints() {
        echo "<div class='test-section'>";
        echo "<h2>🔌 Testing API Endpoints</h2>";
        
        // Test if endpoints are registered
        global $wp_rest_server;
        if (!$wp_rest_server) {
            $wp_rest_server = rest_get_server();
        }
        
        $routes = $wp_rest_server->get_routes();
        
        $expected_routes = [
            '/fitcopilot/v1/generate',
            '/fitcopilot/v1/workouts',
            '/fitcopilot/v1/workouts/(?P<id>\\d+)'
        ];
        
        foreach ($expected_routes as $route) {
            if (isset($routes[$route])) {
                echo "<p class='pass'>✅ Route {$route} is registered</p>";
            } else {
                echo "<p class='fail'>❌ Route {$route} is NOT registered</p>";
            }
        }
        
        echo "</div>";
    }
    
    private function test_error_handling() {
        echo "<div class='test-section'>";
        echo "<h2>⚠️ Testing Error Handling</h2>";
        
        // Test Utilities class methods
        if (class_exists('FitCopilot\\API\\WorkoutEndpoints\\Utilities')) {
            echo "<p class='pass'>✅ Utilities class exists</p>";
            
            $reflection = new ReflectionClass('FitCopilot\\API\\WorkoutEndpoints\\Utilities');
            $source = file_get_contents($reflection->getFileName());
            
            $error_handling_checks = [
                'normalize_workout_data' => 'Data normalization method',
                'get_default_workout_data' => 'Default fallback method',
                'json_last_error' => 'JSON error checking',
                'error_log.*FitCopilot' => 'FitCopilot error logging'
            ];
            
            foreach ($error_handling_checks as $pattern => $description) {
                if (preg_match("/$pattern/", $source)) {
                    echo "<p class='pass'>✅ {$description} implemented</p>";
                } else {
                    echo "<p class='fail'>❌ {$description} NOT found</p>";
                }
            }
        } else {
            echo "<p class='fail'>❌ Utilities class not found</p>";
        }
        
        echo "</div>";
    }
    
    private function test_backward_compatibility() {
        echo "<div class='test-section'>";
        echo "<h2>🔄 Testing Backward Compatibility</h2>";
        
        // Test that old data formats can still be retrieved
        echo "<p class='info'>Backward compatibility tested through defensive programming tests above.</p>";
        
        // Check if legacy post type is supported
        $post_types = ['fc_workout', 'wg_workout'];
        foreach ($post_types as $post_type) {
            if (post_type_exists($post_type)) {
                echo "<p class='pass'>✅ Post type {$post_type} is supported</p>";
            } else {
                echo "<p class='warning'>⚠️ Post type {$post_type} not registered</p>";
            }
        }
        
        echo "</div>";
    }
    
    private function create_test_workout($title, $workout_data) {
        $workout_id = wp_insert_post([
            'post_title' => $title,
            'post_type' => 'fc_workout',
            'post_status' => 'publish',
            'post_author' => $this->test_user_id
        ]);
        
        if (!is_wp_error($workout_id)) {
            update_post_meta($workout_id, '_workout_data', wp_json_encode($workout_data));
            $this->test_workouts[] = $workout_id;
            return $workout_id;
        }
        
        return false;
    }
    
    private function test_workout_retrieval($workout_id, $format_name) {
        if (!class_exists('FitCopilot\\API\\WorkoutEndpoints\\Utilities')) {
            echo "<p class='fail'>❌ Utilities class not available</p>";
            return false;
        }
        
        try {
            $result = FitCopilot\API\WorkoutEndpoints\Utilities::get_workout($workout_id, $this->test_user_id);
            
            if ($result === false) {
                echo "<p class='fail'>❌ {$format_name}: get_workout returned false</p>";
                return false;
            }
            
            echo "<p class='info'>ℹ️ {$format_name}: Retrieved successfully</p>";
            return $result;
            
        } catch (Exception $e) {
            echo "<p class='fail'>❌ {$format_name}: Exception - {$e->getMessage()}</p>";
            return false;
        } catch (Error $e) {
            echo "<p class='fail'>❌ {$format_name}: Fatal Error - {$e->getMessage()}</p>";
            return false;
        }
    }
    
    private function cleanup_test_environment() {
        echo "<div class='test-section'>";
        echo "<h2>🧹 Cleaning Up Test Environment</h2>";
        
        // Delete test workouts
        foreach ($this->test_workouts as $workout_id) {
            wp_delete_post($workout_id, true);
        }
        echo "<p class='pass'>✅ Deleted " . count($this->test_workouts) . " test workouts</p>";
        
        // Delete test user
        if ($this->test_user_id) {
            wp_delete_user($this->test_user_id);
            echo "<p class='pass'>✅ Deleted test user</p>";
        }
        
        echo "</div>";
    }
    
    private function display_summary() {
        echo "<div class='test-section'>";
        echo "<h2>📊 Test Results Summary</h2>";
        
        $total_tests = count($this->test_results);
        $passed_tests = array_sum($this->test_results);
        $failed_tests = $total_tests - $passed_tests;
        
        echo "<p><strong>Total Tests:</strong> {$total_tests}</p>";
        echo "<p class='pass'><strong>Passed:</strong> {$passed_tests}</p>";
        echo "<p class='fail'><strong>Failed:</strong> {$failed_tests}</p>";
        
        if ($failed_tests === 0) {
            echo "<h3 class='pass'>🎉 All Tests Passed! Phase 1 Stabilization is Working Correctly</h3>";
        } else {
            echo "<h3 class='fail'>❌ Some Tests Failed. Review the issues above.</h3>";
        }
        
        echo "<h3>Detailed Results:</h3>";
        echo "<ul>";
        foreach ($this->test_results as $test => $result) {
            $status = $result ? "✅ PASS" : "❌ FAIL";
            echo "<li><strong>{$test}:</strong> {$status}</li>";
        }
        echo "</ul>";
        
        echo "</div>";
    }
}

// Run the tests
$tests = new Phase1StabilizationTests();
$tests->run_all_tests();

?> 