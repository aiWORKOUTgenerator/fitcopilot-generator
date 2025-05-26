<?php
/**
 * Test BasicInfoStep Data Persistence
 * 
 * This script tests if BasicInfoStep data is being saved and retrieved correctly
 */

// Include WordPress
require_once dirname(__FILE__) . '/../../../wp-config.php';

// Force login as admin for testing
if (!is_user_logged_in()) {
    $user = get_user_by('login', 'admin');
    if ($user) {
        wp_set_current_user($user->ID);
        wp_set_auth_cookie($user->ID);
    }
}

$user_id = get_current_user_id();

echo "=== BASIC INFO STEP DATA TEST ===\n";
echo "Testing User ID: $user_id\n\n";

// Test data that matches BasicInfoStep
$test_data = [
    'firstName' => 'John',
    'lastName' => 'Doe',
    'email' => 'john.doe@example.com',
    'fitnessLevel' => 'intermediate',
    'workoutGoals' => ['weight_loss', 'muscle_building'],
    'customGoal' => 'I want to get stronger for hiking',
    'profileComplete' => false
];

echo "=== TESTING SAVE ===\n";
echo "Saving test data: " . json_encode($test_data, JSON_PRETTY_PRINT) . "\n\n";

// Simulate PUT request
$request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
$request->set_body(json_encode($test_data));
$request->set_header('Content-Type', 'application/json');

// Get the REST server and dispatch
$server = rest_get_server();
$response = $server->dispatch($request);

if ($response->is_error()) {
    echo "❌ SAVE FAILED: " . $response->get_error_message() . "\n";
    exit;
} else {
    $data = $response->get_data();
    echo "✅ SAVE SUCCESS\n";
    echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
}

echo "=== CHECKING DATABASE ===\n";
$saved_fields = [
    '_profile_first_name' => get_user_meta($user_id, '_profile_first_name', true),
    '_profile_last_name' => get_user_meta($user_id, '_profile_last_name', true),
    '_profile_email' => get_user_meta($user_id, '_profile_email', true),
    '_profile_fitness_level' => get_user_meta($user_id, '_profile_fitness_level', true),
    '_profile_workout_goals' => get_user_meta($user_id, '_profile_workout_goals', true),
    '_profile_custom_goal' => get_user_meta($user_id, '_profile_custom_goal', true),
    '_profile_complete' => get_user_meta($user_id, '_profile_complete', true)
];

foreach ($saved_fields as $key => $value) {
    echo "$key: " . (is_array($value) ? json_encode($value) : $value) . "\n";
}

echo "\n=== TESTING RETRIEVE ===\n";

// Test GET request
$get_request = new WP_REST_Request('GET', '/fitcopilot/v1/profile');
$get_response = $server->dispatch($get_request);

if ($get_response->is_error()) {
    echo "❌ RETRIEVE FAILED: " . $get_response->get_error_message() . "\n";
} else {
    $get_data = $get_response->get_data();
    echo "✅ RETRIEVE SUCCESS\n";
    echo "Retrieved data: " . json_encode($get_data, JSON_PRETTY_PRINT) . "\n\n";
    
    // Check if BasicInfoStep fields are present
    $basic_info_fields = ['firstName', 'lastName', 'email', 'fitnessLevel', 'workoutGoals', 'customGoal'];
    echo "=== BASIC INFO FIELDS CHECK ===\n";
    
    foreach ($basic_info_fields as $field) {
        if (isset($get_data['data'][$field])) {
            echo "✅ $field: " . (is_array($get_data['data'][$field]) ? json_encode($get_data['data'][$field]) : $get_data['data'][$field]) . "\n";
        } else {
            echo "❌ $field: MISSING\n";
        }
    }
}

echo "\n=== TEST COMPLETE ===\n";
?> 