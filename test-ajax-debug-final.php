<?php
/**
 * Final AJAX Debug Test
 * 
 * This script simulates the exact AJAX request that's failing with 500 error
 * Run this to see the actual PHP error that's causing the issue
 */

// Include WordPress
require_once('../../../wp-config.php');

echo "<h1>🔍 Final AJAX Debug Test</h1>\n";
echo "<pre>\n";

// Simulate admin user
wp_set_current_user(1);

// Simulate the exact POST data from the browser
$_POST = [
    'action' => 'fitcopilot_debug_test_workout',
    'nonce' => wp_create_nonce('fitcopilot_admin_ajax'),
    'test_id' => 'test_' . time() . '_debug',
    'test_data' => json_encode([
        'duration' => 30,
        'fitness_level' => 'intermediate',
        'goals' => 'strength',
        'equipment' => [],
        'restrictions' => [],
        'stress_level' => 'moderate',
        'energy_level' => 'moderate',
        'sleep_quality' => 'good'
    ]),
    'include_debug' => 'true'
];

echo "=== Simulated POST Data ===\n";
foreach ($_POST as $key => $value) {
    echo "{$key}: " . (is_string($value) ? $value : json_encode($value)) . "\n";
}

echo "\n=== Testing Debug System Initialization ===\n";

// Test if debug system is properly initialized
if (class_exists('FitCopilot\\Admin\\Debug\\DebugBootstrap')) {
    echo "✅ DebugBootstrap class found\n";
    
    // Initialize the debug system
    \FitCopilot\Admin\Debug\DebugBootstrap::init();
    
    $debug_manager = \FitCopilot\Admin\Debug\DebugBootstrap::getDebugManager();
    if ($debug_manager) {
        echo "✅ Debug Manager initialized\n";
        
        $controller = $debug_manager->getController('testing_lab');
        if ($controller) {
            echo "✅ Testing Lab Controller available\n";
            
            if (method_exists($controller, 'handleWorkoutTest')) {
                echo "✅ handleWorkoutTest method exists\n";
            } else {
                echo "❌ handleWorkoutTest method missing\n";
            }
        } else {
            echo "❌ Testing Lab Controller not found\n";
        }
    } else {
        echo "❌ Debug Manager not initialized\n";
    }
} else {
    echo "❌ DebugBootstrap class not found\n";
}

echo "\n=== Testing AJAX Handler Registration ===\n";

// Check if AJAX action is registered
global $wp_filter;
$action = 'wp_ajax_fitcopilot_debug_test_workout';

if (isset($wp_filter[$action])) {
    echo "✅ AJAX action '{$action}' is registered\n";
    
    // List all callbacks
    foreach ($wp_filter[$action]->callbacks as $priority => $callbacks) {
        foreach ($callbacks as $callback_info) {
            $callback = $callback_info['function'];
            if (is_array($callback)) {
                $class = is_object($callback[0]) ? get_class($callback[0]) : $callback[0];
                $method = $callback[1];
                echo "   └─ Callback: {$class}::{$method} (Priority: {$priority})\n";
            } else {
                echo "   └─ Callback: {$callback} (Priority: {$priority})\n";
            }
        }
    }
} else {
    echo "❌ AJAX action '{$action}' is NOT registered\n";
}

echo "\n=== Testing Direct Controller Call ===\n";

try {
    // Test if we can create the controller directly
    $controller = new \FitCopilot\Admin\Debug\Controllers\TestingLabController();
    echo "✅ TestingLabController instantiated successfully\n";
    
    // Test if we can create the testing service
    $testing_service = $controller->getTestingService();
    echo "✅ TestingService retrieved successfully\n";
    
    // Test the actual method that's failing
    $test_data = json_decode($_POST['test_data'], true);
    $test_id = $_POST['test_id'];
    
    echo "✅ About to call testWorkoutGeneration...\n";
    
    // This is where the error likely occurs
    $result = $testing_service->testWorkoutGeneration($test_data, $test_id);
    
    echo "✅ testWorkoutGeneration completed successfully!\n";
    echo "Result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
    
} catch (\Exception $e) {
    echo "❌ Error in direct controller call:\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
    echo "   Stack Trace:\n";
    echo "   " . str_replace("\n", "\n   ", $e->getTraceAsString()) . "\n";
}

echo "\n=== Testing OpenAI Provider Directly ===\n";

try {
    if (class_exists('FitCopilot\\Service\\AI\\OpenAIProvider')) {
        echo "✅ OpenAIProvider class found\n";
        
        $api_key = get_option('fitcopilot_openai_api_key', 'test_key');
        echo "✅ API key retrieved: " . (empty($api_key) ? 'EMPTY' : 'SET') . "\n";
        
        $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
        echo "✅ OpenAIProvider instantiated successfully\n";
        
        $test_params = [
            'duration' => 30,
            'fitness_level' => 'intermediate',
            'goals' => 'strength'
        ];
        
        $prompt = $provider->buildPrompt($test_params);
        echo "✅ buildPrompt completed successfully\n";
        echo "Prompt length: " . strlen($prompt) . " characters\n";
        
    } else {
        echo "❌ OpenAIProvider class not found\n";
    }
} catch (\Exception $e) {
    echo "❌ Error testing OpenAI Provider:\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
}

echo "\n=== Memory and Error Information ===\n";
echo "Memory Usage: " . size_format(memory_get_usage(true)) . "\n";
echo "Memory Peak: " . size_format(memory_get_peak_usage(true)) . "\n";
echo "Error Reporting: " . error_reporting() . "\n";
echo "Display Errors: " . (ini_get('display_errors') ? 'On' : 'Off') . "\n";
echo "Log Errors: " . (ini_get('log_errors') ? 'On' : 'Off') . "\n";

echo "\n=== Final Test: Simulate Complete AJAX Flow ===\n";

// Capture output buffer to prevent JSON output
ob_start();

try {
    // This is exactly what WordPress does when processing AJAX
    do_action('wp_ajax_fitcopilot_debug_test_workout');
    
    $output = ob_get_contents();
    ob_end_clean();
    
    echo "✅ AJAX action completed without fatal error\n";
    echo "Output: " . $output . "\n";
    
} catch (\Exception $e) {
    ob_end_clean();
    echo "❌ Fatal error in AJAX action:\n";
    echo "   Message: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
}

echo "</pre>\n";
echo "<h2>✅ Debug Test Complete</h2>\n";
?> 