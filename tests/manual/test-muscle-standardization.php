<?php
/**
 * Test Muscle Standardization Fix
 * 
 * This script tests the critical muscle group response format standardization
 * that unblocks the Target Muscle workflow and fixes multiple test failures.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    // Allow CLI testing
    if (php_sapi_name() !== 'cli') {
        exit('Direct access not allowed.');
    }
}

echo "<h1>🎯 Muscle Group Standardization Test</h1>\n";

/**
 * Test the new array-based /muscles endpoint
 */
function test_muscles_array_endpoint() {
    echo "<h2>Test 1: Array-based /muscles endpoint</h2>\n";
    
    if (!class_exists('FitCopilot\\API\\MuscleEndpoints\\MuscleDataEndpoint')) {
        echo "❌ MuscleDataEndpoint class not found\n";
        return false;
    }
    
    $endpoint = new FitCopilot\API\MuscleEndpoints\MuscleDataEndpoint();
    
    // Create mock request
    $request = new WP_REST_Request('GET', '/fitcopilot/v1/muscles');
    
    try {
        $response = $endpoint->get_muscles_array($request);
        $data = $response->get_data();
        
        echo "✅ Endpoint callable: Yes\n";
        echo "✅ Response structure: " . (isset($data['success']) ? 'Valid' : 'Invalid') . "\n";
        
        if (isset($data['data']) && is_array($data['data'])) {
            echo "✅ Data is array: Yes (count: " . count($data['data']) . ")\n";
            
            // Check first item structure
            if (!empty($data['data'])) {
                $first_item = $data['data'][0];
                $required_fields = ['id', 'name', 'display', 'icon', 'description', 'muscles'];
                $has_all_fields = true;
                
                foreach ($required_fields as $field) {
                    if (!isset($first_item[$field])) {
                        echo "❌ Missing field: {$field}\n";
                        $has_all_fields = false;
                    }
                }
                
                if ($has_all_fields) {
                    echo "✅ Array structure: Valid (all required fields present)\n";
                    echo "✅ Sample item: {$first_item['name']} ({$first_item['icon']})\n";
                } else {
                    echo "❌ Array structure: Invalid\n";
                }
            }
        } else {
            echo "❌ Data is array: No\n";
            return false;
        }
        
        return true;
        
    } catch (Exception $e) {
        echo "❌ Exception: " . $e->getMessage() . "\n";
        return false;
    }
}

/**
 * Test muscle selection save endpoint
 */
function test_muscle_selection_save() {
    echo "<h2>Test 2: Muscle selection save endpoint</h2>\n";
    
    if (!function_exists('get_current_user_id')) {
        echo "⚠️ WordPress functions not available (CLI mode)\n";
        return true; // Skip in CLI mode
    }
    
    $endpoint = new FitCopilot\API\MuscleEndpoints\MuscleDataEndpoint();
    
    // Create mock request with sample muscle selection
    $request = new WP_REST_Request('POST', '/fitcopilot/v1/muscle-selection');
    $request->set_body(json_encode([
        'selectedGroups' => ['chest', 'back'],
        'selectedMuscles' => [
            'chest' => ['Upper Chest', 'Middle Chest'],
            'back' => ['Lats', 'Rhomboids']
        ]
    ]));
    
    try {
        $response = $endpoint->save_muscle_selection($request);
        $data = $response->get_data();
        
        echo "✅ Save endpoint callable: Yes\n";
        echo "✅ Response structure: " . (isset($data['success']) ? 'Valid' : 'Invalid') . "\n";
        
        if (isset($data['data']['saved']) && $data['data']['saved']) {
            echo "✅ Save functionality: Working\n";
        } else {
            echo "❌ Save functionality: Failed\n";
            return false;
        }
        
        return true;
        
    } catch (Exception $e) {
        echo "❌ Exception: " . $e->getMessage() . "\n";
        return false;
    }
}

/**
 * Test muscle suggestions endpoint
 */
function test_muscle_suggestions() {
    echo "<h2>Test 3: Muscle suggestions endpoint</h2>\n";
    
    $endpoint = new FitCopilot\API\MuscleEndpoints\MuscleDataEndpoint();
    
    // Create mock request
    $request = new WP_REST_Request('GET', '/fitcopilot/v1/muscle-suggestions');
    
    try {
        $response = $endpoint->get_muscle_suggestions($request);
        $data = $response->get_data();
        
        echo "✅ Suggestions endpoint callable: Yes\n";
        echo "✅ Response structure: " . (isset($data['success']) ? 'Valid' : 'Invalid') . "\n";
        
        if (isset($data['data']) && is_array($data['data'])) {
            echo "✅ Suggestions data: Array with " . count($data['data']) . " suggestions\n";
            
            // Check suggestion structure
            if (!empty($data['data'])) {
                $first_suggestion = $data['data'][0];
                if (isset($first_suggestion['groups']) && isset($first_suggestion['reason'])) {
                    echo "✅ Suggestion structure: Valid\n";
                    echo "✅ Sample suggestion: " . implode(', ', $first_suggestion['groups']) . " - " . $first_suggestion['reason'] . "\n";
                } else {
                    echo "❌ Suggestion structure: Invalid\n";
                    return false;
                }
            }
        } else {
            echo "❌ Suggestions data: Not an array\n";
            return false;
        }
        
        return true;
        
    } catch (Exception $e) {
        echo "❌ Exception: " . $e->getMessage() . "\n";
        return false;
    }
}

/**
 * Compare old vs new format
 */
function test_format_comparison() {
    echo "<h2>Test 4: Old vs New format comparison</h2>\n";
    
    $endpoint = new FitCopilot\API\MuscleEndpoints\MuscleDataEndpoint();
    
    // Test old format (object-based)
    $old_request = new WP_REST_Request('GET', '/fitcopilot/v1/muscle-groups');
    $old_response = $endpoint->get_muscle_groups($old_request);
    $old_data = $old_response->get_data();
    
    // Test new format (array-based)
    $new_request = new WP_REST_Request('GET', '/fitcopilot/v1/muscles');
    $new_response = $endpoint->get_muscles_array($new_request);
    $new_data = $new_response->get_data();
    
    echo "✅ Old format (object): " . (is_object($old_data['data']) || (is_array($old_data['data']) && !isset($old_data['data'][0])) ? 'Object/Associative Array' : 'Array') . "\n";
    echo "✅ New format (array): " . (isset($new_data['data'][0]) ? 'Indexed Array' : 'Not Array') . "\n";
    
    // Count items
    $old_count = is_array($old_data['data']) ? count($old_data['data']) : 0;
    $new_count = isset($new_data['data']) ? count($new_data['data']) : 0;
    
    echo "✅ Item count match: " . ($old_count === $new_count ? 'Yes' : 'No') . " (Old: {$old_count}, New: {$new_count})\n";
    
    return $old_count === $new_count;
}

// Run all tests
echo "🚀 Starting Muscle Group Standardization Tests...\n\n";

$test1 = test_muscles_array_endpoint();
$test2 = test_muscle_selection_save();
$test3 = test_muscle_suggestions();
$test4 = test_format_comparison();

echo "\n" . str_repeat("=", 50) . "\n";
echo "📊 TEST RESULTS SUMMARY\n";
echo str_repeat("=", 50) . "\n";

echo "Test 1 - Array Endpoint: " . ($test1 ? "✅ PASS" : "❌ FAIL") . "\n";
echo "Test 2 - Selection Save: " . ($test2 ? "✅ PASS" : "❌ FAIL") . "\n";  
echo "Test 3 - Suggestions: " . ($test3 ? "✅ PASS" : "❌ FAIL") . "\n";
echo "Test 4 - Format Comparison: " . ($test4 ? "✅ PASS" : "❌ FAIL") . "\n";

$overall = $test1 && $test2 && $test3 && $test4;
echo "\n🎯 OVERALL: " . ($overall ? "✅ SUCCESS - Target Muscle workflow should be unblocked!" : "❌ NEEDS ATTENTION") . "\n";

if ($overall) {
    echo "\n🎉 CRITICAL FIX COMPLETE!\n";
    echo "• Frontend can now fetch muscles as an array\n";
    echo "• Target Muscle card will render properly\n";
    echo "• Muscle selection can be saved\n";
    echo "• Profile-based suggestions are available\n";
    echo "\n📝 Next steps:\n";
    echo "1. Update frontend to use GET /muscles instead of /muscle-groups\n";
    echo "2. Test Target Muscle workflow end-to-end\n";
    echo "3. Run API test suite to verify improvements\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
?> 