<?php
/**
 * Browser vs Script Debug Test
 * 
 * This test will help identify exactly what's different between the browser AJAX request
 * and the direct script execution that works
 */

// Include WordPress
require_once('../../../wp-config.php');

echo "<h1>🔍 Browser vs Script Debug Test</h1>\n";
echo "<pre>\n";

// Simulate exact browser environment
wp_set_current_user(1);

echo "=== Environment Comparison ===\n";
echo "WordPress loaded: " . (defined('ABSPATH') ? 'Yes' : 'No') . "\n";
echo "is_admin(): " . (is_admin() ? 'true' : 'false') . "\n";
echo "current_user_can('manage_options'): " . (current_user_can('manage_options') ? 'true' : 'false') . "\n";
echo "doing_ajax(): " . (wp_doing_ajax() ? 'true' : 'false') . "\n";
echo "is_user_logged_in(): " . (is_user_logged_in() ? 'true' : 'false') . "\n";

// Test 1: Simulate browser AJAX environment
echo "\n=== Test 1: Simulating Browser AJAX Environment ===\n";

// Set up the exact same environment as browser AJAX
$_POST['action'] = 'fitcopilot_debug_test_workout';
$_POST['nonce'] = '99a23a02d6';
$_POST['test_id'] = 'browser_sim_' . time();
$_POST['test_data'] = json_encode([
    'duration' => 30,
    'fitness_level' => 'intermediate',
    'goals' => 'strength',
    'equipment' => [],
    'restrictions' => [],
    'stress_level' => 'moderate',
    'energy_level' => 'moderate',
    'sleep_quality' => 'good'
]);
$_POST['include_debug'] = 'true';

// Define DOING_AJAX to simulate browser environment
if (!defined('DOING_AJAX')) {
    define('DOING_AJAX', true);
}

echo "DOING_AJAX defined: " . (defined('DOING_AJAX') ? 'true' : 'false') . "\n";
echo "wp_doing_ajax(): " . (wp_doing_ajax() ? 'true' : 'false') . "\n";

// Test 2: Check if handler is still registered in AJAX context
echo "\n=== Test 2: AJAX Handler Registration Check ===\n";

global $wp_filter;
$action = 'wp_ajax_fitcopilot_debug_test_workout';

if (isset($wp_filter[$action])) {
    echo "✅ AJAX action '{$action}' is registered\n";
    foreach ($wp_filter[$action]->callbacks as $priority => $callbacks) {
        foreach ($callbacks as $callback_info) {
            $callback = $callback_info['function'];
            if (is_array($callback)) {
                $class = is_object($callback[0]) ? get_class($callback[0]) : $callback[0];
                $method = $callback[1];
                echo "   └─ Callback: {$class}::{$method} (Priority: {$priority})\n";
            }
        }
    }
} else {
    echo "❌ AJAX action '{$action}' is NOT registered\n";
}

// Test 3: Try to call the handler directly in AJAX context
echo "\n=== Test 3: Direct Handler Call in AJAX Context ===\n";

try {
    // Get the debug manager
    $debug_manager = \FitCopilot\Admin\Debug\DebugBootstrap::getDebugManager();
    if (!$debug_manager) {
        echo "❌ Debug manager not available\n";
        throw new Exception("Debug manager not initialized");
    }
    
    $controller = $debug_manager->getController('testing_lab');
    if (!$controller) {
        echo "❌ Testing Lab Controller not available\n";
        throw new Exception("Testing Lab Controller not found");
    }
    
    echo "✅ About to call handleWorkoutTest in AJAX context...\n";
    
    // Capture output
    ob_start();
    
    // Call the handler
    $controller->handleWorkoutTest();
    
    $output = ob_get_contents();
    ob_end_clean();
    
    echo "✅ Handler executed successfully!\n";
    echo "Output: " . $output . "\n";
    
} catch (\Exception $e) {
    echo "❌ Error calling handler in AJAX context:\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
    echo "   Stack Trace:\n";
    echo "   " . str_replace("\n", "\n   ", $e->getTraceAsString()) . "\n";
}

// Test 4: Check WordPress AJAX processing
echo "\n=== Test 4: WordPress AJAX Processing Test ===\n";

try {
    // Simulate what WordPress does for AJAX
    echo "Testing WordPress AJAX processing...\n";
    
    // Check if we can access wp_ajax actions
    if (has_action('wp_ajax_fitcopilot_debug_test_workout')) {
        echo "✅ wp_ajax_fitcopilot_debug_test_workout action exists\n";
        
        // Try to run the action
        ob_start();
        do_action('wp_ajax_fitcopilot_debug_test_workout');
        $action_output = ob_get_contents();
        ob_end_clean();
        
        echo "✅ Action executed\n";
        echo "Action output: " . $action_output . "\n";
        
    } else {
        echo "❌ wp_ajax_fitcopilot_debug_test_workout action not found\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error in WordPress AJAX processing:\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
}

// Test 5: Check for fatal errors with error handling
echo "\n=== Test 5: Error Handling Test ===\n";

// Set up error handler
set_error_handler(function($severity, $message, $file, $line) {
    echo "PHP Error: {$message} in {$file} on line {$line}\n";
});

// Set up exception handler
set_exception_handler(function($exception) {
    echo "Uncaught Exception: " . $exception->getMessage() . "\n";
    echo "File: " . $exception->getFile() . "\n";
    echo "Line: " . $exception->getLine() . "\n";
});

try {
    echo "Testing with enhanced error handling...\n";
    
    // Try the exact same call that works in the test script
    $controller = new \FitCopilot\Admin\Debug\Controllers\TestingLabController();
    $testing_service = $controller->getTestingService();
    
    $test_data = json_decode($_POST['test_data'], true);
    $test_id = $_POST['test_id'];
    
    echo "About to call testWorkoutGeneration with error handling...\n";
    $result = $testing_service->testWorkoutGeneration($test_data, $test_id);
    
    echo "✅ testWorkoutGeneration completed with error handling!\n";
    echo "Result preview: " . substr(json_encode($result), 0, 200) . "...\n";
    
} catch (\Error $e) {
    echo "❌ Fatal Error caught:\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
    echo "   Stack Trace:\n";
    echo "   " . str_replace("\n", "\n   ", $e->getTraceAsString()) . "\n";
} catch (\Exception $e) {
    echo "❌ Exception caught:\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
}

// Restore error handlers
restore_error_handler();
restore_exception_handler();

echo "\n=== Test Complete ===\n";
echo "If this script runs without errors but the browser AJAX fails,\n";
echo "the issue is likely in WordPress's AJAX processing pipeline.\n";

echo "</pre>\n";
?> 