<?php
/**
 * Test Script for Generate Endpoint
 *
 * This is a simple script to verify the generate endpoint works as expected.
 * Place this file in the tests/manual directory and run it directly.
 */

// Bootstrap WordPress - find the WordPress installation
$dir = dirname(__FILE__);
$wp_root = '';

// Navigate up until we find wp-load.php
for ($i = 0; $i < 10; $i++) {
    if (file_exists($dir . '/wp-load.php')) {
        $wp_root = $dir;
        break;
    }
    $dir = dirname($dir);
}

// If not found in parent directories, try absolute paths
if (empty($wp_root)) {
    $possible_paths = [
        '/Users/justinfassio/Local Sites/fitcopilot-generator/app/public/wp-load.php',
        dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/wp-load.php',
    ];
    
    foreach ($possible_paths as $path) {
        if (file_exists($path)) {
            $wp_root = dirname($path);
            break;
        }
    }
}

if (empty($wp_root)) {
    die("Cannot find WordPress installation. Please check paths.");
}

// Load WordPress
require_once $wp_root . '/wp-load.php';

// Ensure we're logged in as admin for testing
function ensure_admin_login() {
    if (!is_user_logged_in()) {
        $user = get_user_by('login', 'admin');
        if (!$user) {
            $user = get_user_by('login', 'justinfassio'); // Fallback to another admin account
        }
        
        if ($user) {
            wp_set_current_user($user->ID);
            wp_set_auth_cookie($user->ID);
            return true;
        }
        return false;
    }
    return true;
}

// Simple function to test the generate endpoint
function test_generate_endpoint() {
    // Create a direct request body for testing
    $request_body = [
        'duration' => 30,
        'difficulty' => 'intermediate',
        'equipment' => ['dumbbells'],
        'goals' => 'strength',
        'specific_request' => 'A quick strength workout for testing'
    ];
    
    // Create a fake WP_REST_Request
    $request = new WP_REST_Request('POST', '/fitcopilot/v1/generate');
    $request->set_body(json_encode($request_body));
    $request->set_header('content-type', 'application/json');
    
    // Get the WorkoutEndpoints class
    $endpoints = new FitCopilot\API\WorkoutEndpoints();
    
    // Call the generate_workout method
    $response = $endpoints->generate_workout($request);
    
    // Display the response
    echo "Response status: " . $response->get_status() . "\n";
    echo "Response data:\n";
    echo json_encode($response->get_data(), JSON_PRETTY_PRINT) . "\n";
    
    // Verify the response structure
    $data = $response->get_data();
    if ($data['success'] && isset($data['data']['post_id'])) {
        echo "\n✅ TEST PASSED: Response contains post_id directly in the data object\n";
    } else {
        echo "\n❌ TEST FAILED: Response does not contain post_id in the expected location\n";
        if (isset($data['data']['workout']['post_id'])) {
            echo "   post_id is nested inside 'workout' object instead of being directly in 'data'\n";
        } elseif (!isset($data['data']['post_id'])) {
            echo "   post_id is missing entirely from the response\n";
        }
    }
}

// Run the test
echo "Starting test for generate endpoint...\n";
echo "WordPress root found at: " . $wp_root . "\n";

if (ensure_admin_login()) {
    echo "Logged in as: " . wp_get_current_user()->user_login . "\n";
    test_generate_endpoint();
} else {
    echo "Failed to log in as admin for testing. Please check admin credentials.\n";
} 