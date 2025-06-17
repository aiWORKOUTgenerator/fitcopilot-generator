<?php
/**
 * Test AJAX Handler Registration
 * 
 * Run this script to check if the AJAX handlers are properly registered
 * Place in plugin root and access via: /wp-content/plugins/Fitcopilot-Generator/test-ajax-registration.php
 */

// Include WordPress
require_once('../../../wp-config.php');

echo "<h1>🔍 AJAX Handler Registration Test</h1>\n";
echo "<pre>\n";

// Test 1: Check if WordPress is loaded
echo "✅ WordPress loaded: " . (defined('ABSPATH') ? 'Yes' : 'No') . "\n";
echo "✅ WP_DEBUG: " . (defined('WP_DEBUG') && WP_DEBUG ? 'Enabled' : 'Disabled') . "\n\n";

// Test 2: Check if debug system is initialized
echo "=== Debug System Status ===\n";
if (class_exists('FitCopilot\\Admin\\Debug\\DebugBootstrap')) {
    $debug_manager = \FitCopilot\Admin\Debug\DebugBootstrap::getDebugManager();
    
    if ($debug_manager) {
        echo "✅ Debug Manager: Initialized\n";
        echo "✅ Debug System Healthy: " . ($debug_manager->isHealthy() ? 'Yes' : 'No') . "\n";
        
        $status = $debug_manager->getStatus();
        echo "✅ Controllers Loaded: " . $status['controllers_loaded'] . "\n";
        echo "✅ Available Controllers: " . implode(', ', $status['controllers']) . "\n";
        
        // Test controller access
        $testing_controller = $debug_manager->getController('testing_lab');
        echo "✅ Testing Lab Controller: " . ($testing_controller ? 'Available' : 'Not Found') . "\n";
        
    } else {
        echo "❌ Debug Manager: Not Initialized\n";
    }
} else {
    echo "❌ DebugBootstrap class not found\n";
}

echo "\n=== AJAX Action Registration ===\n";

// Test 3: Check global $wp_filter for AJAX actions
global $wp_filter;

$ajax_actions_to_check = [
    'wp_ajax_fitcopilot_debug_test_workout',
    'wp_ajax_fitcopilot_debug_test_prompt',
    'wp_ajax_fitcopilot_debug_validate_context',
    'wp_ajax_fitcopilot_debug_performance_test'
];

foreach ($ajax_actions_to_check as $action) {
    if (isset($wp_filter[$action])) {
        echo "✅ {$action}: Registered\n";
        
        // Show callbacks
        foreach ($wp_filter[$action]->callbacks as $priority => $callbacks) {
            foreach ($callbacks as $callback_info) {
                $callback = $callback_info['function'];
                if (is_array($callback)) {
                    $class = is_object($callback[0]) ? get_class($callback[0]) : $callback[0];
                    $method = $callback[1];
                    echo "   └─ Priority {$priority}: {$class}::{$method}\n";
                } else {
                    echo "   └─ Priority {$priority}: {$callback}\n";
                }
            }
        }
    } else {
        echo "❌ {$action}: Not Registered\n";
    }
}

echo "\n=== Testing Direct Handler Call ===\n";

// Test 4: Try to call handler directly
if (class_exists('FitCopilot\\Admin\\Debug\\Controllers\\TestingLabController')) {
    echo "✅ TestingLabController class found\n";
    
    try {
        // Simulate being logged in as admin
        wp_set_current_user(1);
        
        // Simulate POST data
        $_POST['action'] = 'fitcopilot_debug_test_workout';
        $_POST['nonce'] = wp_create_nonce('fitcopilot_admin_ajax');
        $_POST['test_data'] = json_encode([
            'duration' => 30,
            'fitness_level' => 'intermediate'
        ]);
        
        echo "✅ Simulated POST data set\n";
        echo "✅ User ID: " . get_current_user_id() . "\n";
        echo "✅ User can manage_options: " . (current_user_can('manage_options') ? 'Yes' : 'No') . "\n";
        
        // Try to instantiate controller
        $controller = new \FitCopilot\Admin\Debug\Controllers\TestingLabController();
        echo "✅ Controller instantiated successfully\n";
        
        // Check if method exists
        if (method_exists($controller, 'handleWorkoutTest')) {
            echo "✅ handleWorkoutTest method exists\n";
            
            // Note: Don't actually call it as it would output JSON and exit
            echo "✅ Ready to handle AJAX requests\n";
        } else {
            echo "❌ handleWorkoutTest method not found\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Error testing controller: " . $e->getMessage() . "\n";
        echo "❌ Stack trace: " . $e->getTraceAsString() . "\n";
    }
} else {
    echo "❌ TestingLabController class not found\n";
}

echo "\n=== File System Check ===\n";

// Test 5: Check if required files exist
$required_files = [
    'src/php/Admin/Debug/DebugBootstrap.php',
    'src/php/Admin/Debug/DebugManager.php',
    'src/php/Admin/Debug/Controllers/TestingLabController.php',
    'src/php/Admin/Debug/Services/TestingService.php',
    'src/php/Admin/Debug/Traits/AjaxHandlerTrait.php'
];

foreach ($required_files as $file) {
    $full_path = FITCOPILOT_DIR . $file;
    if (file_exists($full_path)) {
        echo "✅ {$file}: Exists\n";
    } else {
        echo "❌ {$file}: Missing\n";
    }
}

echo "\n=== Constants Check ===\n";

// Test 6: Check required constants
$required_constants = [
    'FITCOPILOT_DIR',
    'FITCOPILOT_URL',
    'FITCOPILOT_VERSION',
    'FITCOPILOT_FILE'
];

foreach ($required_constants as $constant) {
    if (defined($constant)) {
        echo "✅ {$constant}: " . constant($constant) . "\n";
    } else {
        echo "❌ {$constant}: Not defined\n";
    }
}

echo "\n=== Memory and Performance ===\n";
echo "✅ Memory Usage: " . size_format(memory_get_usage(true)) . "\n";
echo "✅ Memory Peak: " . size_format(memory_get_peak_usage(true)) . "\n";
echo "✅ Time Limit: " . ini_get('max_execution_time') . " seconds\n";

echo "</pre>\n";
echo "<h2>✅ Test Complete</h2>\n";
echo "<p>If you see any ❌ errors above, those need to be fixed for the AJAX handlers to work properly.</p>\n";
?> 