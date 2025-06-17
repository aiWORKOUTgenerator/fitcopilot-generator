<?php
/**
 * Simple AJAX Test - Bypasses WordPress AJAX processing
 * 
 * This creates a direct endpoint to test if the issue is with WordPress AJAX processing
 */

// Include WordPress
require_once('../../../wp-config.php');

// Set JSON header
header('Content-Type: application/json');

// Enable CORS for testing
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Set user context
    wp_set_current_user(1);
    
    // Check if this is our test request
    if ($_POST['action'] !== 'test_direct_workout') {
        throw new Exception('Invalid action');
    }
    
    // Get test data
    $test_data = json_decode($_POST['test_data'] ?? '{}', true);
    $test_id = $_POST['test_id'] ?? 'direct_test_' . time();
    
    // Log the attempt
    error_log('[Direct AJAX Test] Starting test with ID: ' . $test_id);
    error_log('[Direct AJAX Test] Test data: ' . json_encode($test_data));
    
    // Initialize debug system
    \FitCopilot\Admin\Debug\DebugBootstrap::init();
    
    // Get controller and run test
    $debug_manager = \FitCopilot\Admin\Debug\DebugBootstrap::getDebugManager();
    $controller = $debug_manager->getController('testing_lab');
    $testing_service = $controller->getTestingService();
    
    // Run the test
    $result = $testing_service->testWorkoutGeneration($test_data, $test_id);
    
    error_log('[Direct AJAX Test] Test completed successfully');
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $result,
        'message' => 'Direct AJAX test completed successfully'
    ]);
    
} catch (\Exception $e) {
    error_log('[Direct AJAX Test] Error: ' . $e->getMessage());
    error_log('[Direct AJAX Test] Trace: ' . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
?> 