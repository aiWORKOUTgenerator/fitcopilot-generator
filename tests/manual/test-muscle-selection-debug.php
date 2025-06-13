<?php
/**
 * Debug Muscle Selection Save Issue
 * 
 * This script tests the muscle selection save functionality to identify
 * why the API Testing Tool is getting HTTP 400 errors.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    // Allow CLI testing
    if (php_sapi_name() !== 'cli') {
        exit('Direct access not allowed.');
    }
}

echo "<h1>🔍 Muscle Selection Debug Test</h1>\n";

/**
 * Test muscle selection save with various data formats
 */
function test_muscle_selection_save_debug() {
    echo "<h2>Debug Test: Muscle Selection Save</h2>\n";
    
    if (!class_exists('FitCopilot\\API\\MuscleEndpoints\\MuscleDataEndpoint')) {
        echo "❌ MuscleDataEndpoint class not found\n";
        return false;
    }
    
    $endpoint = new FitCopilot\API\MuscleEndpoints\MuscleDataEndpoint();
    
    // Test 1: Valid data that should work
    echo "\n--- Test 1: Valid Selection Data ---\n";
    $valid_data = array(
        'selectedGroups' => array('chest', 'back'),
        'selectedMuscles' => array(
            'chest' => array('Upper Chest', 'Middle Chest'),
            'back' => array('Lats', 'Rhomboids')
        )
    );
    
    $request = new WP_REST_Request('POST', '/fitcopilot/v1/muscle-selection');
    $request->set_body(json_encode($valid_data));
    $request->set_header('Content-Type', 'application/json');
    
    try {
        $response = $endpoint->save_muscle_selection($request);
        $data = $response->get_data();
        $status = $response->get_status();
        
        echo "Status Code: {$status}\n";
        echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
        
        if ($status === 200) {
            echo "✅ Test 1: PASSED - Valid data saved successfully\n";
        } else {
            echo "❌ Test 1: FAILED - Valid data rejected\n";
            if (isset($data['debug'])) {
                echo "Debug Info: " . json_encode($data['debug'], JSON_PRETTY_PRINT) . "\n";
            }
        }
    } catch (Exception $e) {
        echo "❌ Test 1: EXCEPTION - " . $e->getMessage() . "\n";
    }
    
    // Test 2: Minimal valid data
    echo "\n--- Test 2: Minimal Valid Data ---\n";
    $minimal_data = array(
        'selectedGroups' => array('chest')
    );
    
    $request2 = new WP_REST_Request('POST', '/fitcopilot/v1/muscle-selection');
    $request2->set_body(json_encode($minimal_data));
    $request2->set_header('Content-Type', 'application/json');
    
    try {
        $response2 = $endpoint->save_muscle_selection($request2);
        $data2 = $response2->get_data();
        $status2 = $response2->get_status();
        
        echo "Status Code: {$status2}\n";
        echo "Response: " . json_encode($data2, JSON_PRETTY_PRINT) . "\n";
        
        if ($status2 === 200) {
            echo "✅ Test 2: PASSED - Minimal data saved successfully\n";
        } else {
            echo "❌ Test 2: FAILED - Minimal data rejected\n";
        }
    } catch (Exception $e) {
        echo "❌ Test 2: EXCEPTION - " . $e->getMessage() . "\n";
    }
    
    // Test 3: Invalid data (should fail)
    echo "\n--- Test 3: Invalid Data (Should Fail) ---\n";
    $invalid_data = array(
        'selectedGroups' => array('invalid_muscle_group')
    );
    
    $request3 = new WP_REST_Request('POST', '/fitcopilot/v1/muscle-selection');
    $request3->set_body(json_encode($invalid_data));
    $request3->set_header('Content-Type', 'application/json');
    
    try {
        $response3 = $endpoint->save_muscle_selection($request3);
        $data3 = $response3->get_data();
        $status3 = $response3->get_status();
        
        echo "Status Code: {$status3}\n";
        echo "Response: " . json_encode($data3, JSON_PRETTY_PRINT) . "\n";
        
        if ($status3 === 400) {
            echo "✅ Test 3: PASSED - Invalid data properly rejected\n";
        } else {
            echo "❌ Test 3: FAILED - Invalid data should have been rejected\n";
        }
    } catch (Exception $e) {
        echo "❌ Test 3: EXCEPTION - " . $e->getMessage() . "\n";
    }
    
    // Test 4: Test retrieval
    echo "\n--- Test 4: Retrieve Saved Selection ---\n";
    $request4 = new WP_REST_Request('GET', '/fitcopilot/v1/muscle-selection');
    
    try {
        $response4 = $endpoint->get_muscle_selection($request4);
        $data4 = $response4->get_data();
        $status4 = $response4->get_status();
        
        echo "Status Code: {$status4}\n";
        echo "Response: " . json_encode($data4, JSON_PRETTY_PRINT) . "\n";
        
        if ($status4 === 200) {
            echo "✅ Test 4: PASSED - Selection retrieved successfully\n";
        } else {
            echo "❌ Test 4: FAILED - Could not retrieve selection\n";
        }
    } catch (Exception $e) {
        echo "❌ Test 4: EXCEPTION - " . $e->getMessage() . "\n";
    }
    
    return true;
}

/**
 * Test validation logic directly
 */
function test_validation_logic() {
    echo "<h2>Debug Test: Validation Logic</h2>\n";
    
    $endpoint = new FitCopilot\API\MuscleEndpoints\MuscleDataEndpoint();
    
    // Use reflection to access private method
    $reflection = new ReflectionClass($endpoint);
    $validate_method = $reflection->getMethod('validate_selection_data');
    $validate_method->setAccessible(true);
    
    // Test valid data
    $valid_data = array(
        'selectedGroups' => array('chest', 'back'),
        'selectedMuscles' => array(
            'chest' => array('Upper Chest'),
            'back' => array('Lats')
        )
    );
    
    $result = $validate_method->invoke($endpoint, $valid_data);
    echo "Valid Data Validation: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
    
    // Test invalid data
    $invalid_data = array(
        'selectedGroups' => array('invalid_group')
    );
    
    $result2 = $validate_method->invoke($endpoint, $invalid_data);
    echo "Invalid Data Validation: " . json_encode($result2, JSON_PRETTY_PRINT) . "\n";
    
    return true;
}

// Run debug tests
echo "🚀 Starting Muscle Selection Debug Tests...\n\n";

$test1 = test_muscle_selection_save_debug();
$test2 = test_validation_logic();

echo "\n" . str_repeat("=", 50) . "\n";
echo "📊 DEBUG TEST RESULTS\n";
echo str_repeat("=", 50) . "\n";

echo "Save Functionality Test: " . ($test1 ? "✅ COMPLETED" : "❌ FAILED") . "\n";
echo "Validation Logic Test: " . ($test2 ? "✅ COMPLETED" : "❌ FAILED") . "\n";

echo "\n🔍 Check error logs for detailed debug information\n";
echo "📝 If tests pass here but API Testing Tool fails, the issue is in the test environment setup\n";

echo "\n" . str_repeat("=", 50) . "\n";
?> 