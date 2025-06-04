<?php
/**
 * EXHAUSTIVE Debug Workout Save Process
 * 
 * This script replicates the EXACT modal save workflow to identify where version data is lost
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    require_once(__DIR__ . '/../../wp-load.php');
}

class ExhaustiveWorkoutSaveDebugger {
    
    /**
     * Test the EXACT modal save workflow with full logging
     */
    public static function test_modal_save_workflow() {
        echo "=== EXHAUSTIVE MODAL SAVE WORKFLOW DEBUG ===\n\n";
        
        // Step 1: Find a workout to test with
        $workout_id = self::find_test_workout();
        if (!$workout_id) {
            echo "❌ No workout found to test with\n";
            return;
        }
        
        // Step 2: Test exact API data flow
        self::test_exact_api_flow($workout_id);
        
        // Step 3: Test transform functions
        self::test_transform_functions($workout_id);
        
        // Step 4: Test backend handling
        self::test_backend_handling($workout_id);
    }
    
    private static function find_test_workout() {
        echo "🔍 Finding test workout...\n";
        
        $workouts = get_posts([
            'post_type' => 'wg_workout',
            'numberposts' => 1,
            'post_status' => 'publish'
        ]);
        
        if (empty($workouts)) {
            return null;
        }
        
        $workout = $workouts[0];
        echo "✅ Found workout: {$workout->ID} - {$workout->post_title}\n";
        
        // Get current version info
        $version = get_post_meta($workout->ID, '_workout_version', true) ?: 1;
        $last_modified = get_post_meta($workout->ID, '_workout_last_modified', true);
        $modified_by = get_post_meta($workout->ID, '_workout_modified_by', true);
        
        echo "   Current version: $version\n";
        echo "   Last modified: $last_modified\n";
        echo "   Modified by: $modified_by\n\n";
        
        return $workout->ID;
    }
    
    private static function test_exact_api_flow($workout_id) {
        echo "🔬 TESTING EXACT API FLOW\n";
        echo "================================\n\n";
        
        // Step 1: Simulate what frontend SHOULD send
        echo "📤 STEP 1: Frontend sends data (what modal SHOULD send)\n";
        $modal_data = [
            'workout' => [
                'title' => 'Updated via Modal Debug',
                'difficulty' => 'advanced', 
                'duration' => 45,
                'version' => 1,  // CRITICAL: Version should be included
                'exercises' => [
                    ['name' => 'Test Exercise 1', 'sets' => 3, 'reps' => 10],
                    ['name' => 'Test Exercise 2', 'sets' => 3, 'reps' => 12]
                ]
            ]
        ];
        
        echo "Modal sends:\n";
        echo json_encode($modal_data, JSON_PRETTY_PRINT) . "\n\n";
        
        // Step 2: Test what backend receives
        echo "📥 STEP 2: Backend receives and processes\n";
        
        // Simulate the WordPress REST API request handler
        $request_body = json_encode($modal_data);
        $parsed_data = json_decode($request_body, true);
        
        echo "Backend receives:\n";
        echo json_encode($parsed_data, JSON_PRETTY_PRINT) . "\n\n";
        
        // Step 3: Test API normalization
        if (class_exists('FitCopilot\\API\\APIUtils')) {
            echo "📋 STEP 3: API Utils normalization\n";
            $normalized = \FitCopilot\API\APIUtils::normalize_request_data($parsed_data);
            echo "After normalization:\n";
            echo json_encode($normalized, JSON_PRETTY_PRINT) . "\n\n";
        }
        
        // Step 4: Test actual API call
        echo "🌐 STEP 4: Actual REST API Call\n";
        self::test_rest_api_call($workout_id, $modal_data);
    }
    
    private static function test_rest_api_call($workout_id, $data) {
        // Simulate the actual REST API call
        $request = new WP_REST_Request('PUT', "/fitcopilot/v1/workouts/$workout_id");
        $request->set_header('content-type', 'application/json');
        $request->set_body(json_encode($data));
        
        // Parse the request body
        $body = $request->get_body();
        $parsed = json_decode($body, true);
        
        echo "REST API receives body:\n";
        echo json_encode($parsed, JSON_PRETTY_PRINT) . "\n";
        
        // Test parameter extraction
        $params = $request->get_params();
        echo "REST API params:\n";
        echo json_encode($params, JSON_PRETTY_PRINT) . "\n\n";
        
        // Test if the endpoint exists and processes correctly
        if (class_exists('FitCopilot\\API\\WorkoutEndpoints\\WorkoutUpdateEndpoint')) {
            echo "🔧 STEP 5: WorkoutUpdateEndpoint processing\n";
            
            $endpoint = new \FitCopilot\API\WorkoutEndpoints\WorkoutUpdateEndpoint();
            
            // Check if it can handle the request
            echo "Endpoint exists: ✅\n";
            
            // Test the actual update (commented out to avoid side effects)
            /*
            try {
                $response = $endpoint->update_workout($request);
                echo "Update response:\n";
                echo json_encode($response, JSON_PRETTY_PRINT) . "\n\n";
            } catch (Exception $e) {
                echo "❌ Update failed: " . $e->getMessage() . "\n\n";
            }
            */
        }
    }
    
    private static function test_transform_functions($workout_id) {
        echo "🔄 TESTING TRANSFORM FUNCTIONS\n";
        echo "================================\n\n";
        
        // Test what happens to version data in transforms
        $test_workout_data = [
            'title' => 'Transform Test',
            'difficulty' => 'intermediate',
            'duration' => 30,
            'version' => 1,
            'exercises' => [
                ['name' => 'Test Exercise', 'sets' => 3, 'reps' => 10]
            ]
        ];
        
        echo "Original workout data:\n";
        echo json_encode($test_workout_data, JSON_PRETTY_PRINT) . "\n\n";
        
        // Test conditional spread operator (the suspected issue)
        echo "🧪 Testing conditional spread operator:\n";
        
        $version = $test_workout_data['version'];
        echo "Version value: " . var_export($version, true) . "\n";
        echo "Truthy check: " . ($version ? 'true' : 'false') . "\n";
        echo "Type: " . gettype($version) . "\n";
        
        // Test the problematic spread
        $spread_test = [
            'title' => $test_workout_data['title'],
            'difficulty' => $test_workout_data['difficulty'],
            ...($test_workout_data['version'] ? ['version' => $test_workout_data['version']] : [])
        ];
        
        echo "After conditional spread:\n";
        echo json_encode($spread_test, JSON_PRETTY_PRINT) . "\n\n";
        
        // Test the fixed spread
        $fixed_spread = [
            'title' => $test_workout_data['title'],
            'difficulty' => $test_workout_data['difficulty'],
            'version' => $test_workout_data['version'] ?? 1
        ];
        
        echo "With fixed spread:\n";
        echo json_encode($fixed_spread, JSON_PRETTY_PRINT) . "\n\n";
    }
    
    private static function test_backend_handling($workout_id) {
        echo "⚙️ TESTING BACKEND HANDLING\n";
        echo "================================\n\n";
        
        // Test if the backend can properly handle version increments
        echo "📊 Current workout state:\n";
        
        $post = get_post($workout_id);
        $version = get_post_meta($workout_id, '_workout_version', true) ?: 1;
        $workout_data = get_post_meta($workout_id, '_workout_data', true);
        
        echo "Post ID: $workout_id\n";
        echo "Title: {$post->post_title}\n";
        echo "Current version: $version\n";
        echo "Has workout_data: " . (empty($workout_data) ? 'No' : 'Yes') . "\n";
        
        if (!empty($workout_data)) {
            $parsed_data = is_string($workout_data) ? json_decode($workout_data, true) : $workout_data;
            if ($parsed_data && isset($parsed_data['exercises'])) {
                echo "Exercise count in data: " . count($parsed_data['exercises']) . "\n";
            }
        }
        
        echo "\n";
        
        // Test what versioning service would do
        if (class_exists('FitCopilot\\Service\\Versioning\\VersioningService')) {
            echo "🔢 Testing VersioningService:\n";
            $versioning = new \FitCopilot\Service\Versioning\VersioningService();
            
            if (method_exists($versioning, 'get_current_version')) {
                $current_version = $versioning->get_current_version($workout_id);
                echo "VersioningService current version: $current_version\n";
            }
            
            // Test increment logic
            $next_version = $version + 1;
            echo "Next version would be: $next_version\n\n";
        }
    }
    
    /**
     * Test the specific conditional spread issue
     */
    public static function test_spread_operator_issue() {
        echo "🔬 TESTING SPREAD OPERATOR ISSUE\n";
        echo "================================\n\n";
        
        $test_cases = [
            ['version' => 1, 'description' => 'Integer 1'],
            ['version' => 0, 'description' => 'Integer 0'],
            ['version' => null, 'description' => 'null'],
            ['version' => '', 'description' => 'Empty string'],
            ['version' => false, 'description' => 'Boolean false'],
            ['version' => '1', 'description' => 'String "1"'],
            ['version' => 2, 'description' => 'Integer 2'],
        ];
        
        foreach ($test_cases as $test) {
            $version = $test['version'];
            $desc = $test['description'];
            
            echo "Testing $desc (value: " . var_export($version, true) . "):\n";
            
            // Test the problematic conditional spread
            $result = [
                'title' => 'Test',
                ...($version ? ['version' => $version] : [])
            ];
            
            echo "  Conditional spread result: " . json_encode($result) . "\n";
            echo "  Has version: " . (isset($result['version']) ? 'Yes' : 'No') . "\n\n";
        }
    }
}

// Run the tests if called directly
if (php_sapi_name() === 'cli' || !isset($_SERVER['HTTP_HOST'])) {
    echo "Running from command line...\n\n";
    
    ExhaustiveWorkoutSaveDebugger::test_modal_save_workflow();
    echo "\n" . str_repeat("=", 50) . "\n\n";
    ExhaustiveWorkoutSaveDebugger::test_spread_operator_issue();
    
} else {
    echo "Debug script must be run from command line or WordPress admin context.\n";
}
?> 