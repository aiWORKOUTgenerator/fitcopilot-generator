<?php
/**
 * Debug Profile Data Script
 * 
 * Test script to check if profile data is being saved and retrieved correctly
 */

// Include WordPress
require_once dirname(__FILE__) . '/../../../wp-config.php';

// Get current user ID (you may need to change this to test with a specific user)
$user_id = 1; // Change this to the user ID you want to test

echo "=== PROFILE DATA DEBUG SCRIPT ===\n";
echo "Testing User ID: $user_id\n\n";

// 1. Check if user exists
$user = get_user_by('ID', $user_id);
if (!$user) {
    echo "❌ User with ID $user_id does not exist!\n";
    exit;
}

echo "✅ User found: {$user->user_login} ({$user->user_email})\n\n";

// 2. Get all user meta with _profile_ prefix
echo "=== CURRENT PROFILE DATA IN DATABASE ===\n";
$profile_meta = get_user_meta($user_id);
$profile_fields = [];

foreach ($profile_meta as $key => $value) {
    if (strpos($key, '_profile_') === 0) {
        $profile_fields[$key] = $value[0];
        echo "$key: " . (is_array($value[0]) ? json_encode($value[0]) : $value[0]) . "\n";
    }
}

if (empty($profile_fields)) {
    echo "❌ No profile data found in database!\n";
} else {
    echo "✅ Found " . count($profile_fields) . " profile fields\n";
}

echo "\n=== TESTING API ENDPOINTS ===\n";

// 3. Test GET profile endpoint
echo "Testing GET /wp-json/fitcopilot/v1/profile...\n";

// Simulate REST API request
$request = new WP_REST_Request('GET', '/fitcopilot/v1/profile');
$request->set_param('user_id', $user_id);

// Get the REST server
$server = rest_get_server();
$response = $server->dispatch($request);

if ($response->is_error()) {
    echo "❌ GET Profile API Error: " . $response->get_error_message() . "\n";
} else {
    $data = $response->get_data();
    echo "✅ GET Profile API Success\n";
    echo "Response data: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
}

echo "\n=== TESTING DRAFT SAVE ===\n";

// 4. Test saving draft data (simulating BasicInfoStep data)
$test_data = [
    'firstName' => 'Test',
    'lastName' => 'User',
    'email' => 'test@example.com',
    'fitnessLevel' => 'intermediate',
    'goals' => ['weight_loss', 'muscle_building'],
    'customGoal' => 'Custom fitness goal test',
    'profileComplete' => false
];

echo "Testing draft save with data: " . json_encode($test_data, JSON_PRETTY_PRINT) . "\n";

// Simulate PUT request for draft save
$put_request = new WP_REST_Request('PUT', '/fitcopilot/v1/profile');
$put_request->set_param('user_id', $user_id);
$put_request->set_body(json_encode($test_data));
$put_request->set_header('Content-Type', 'application/json');

$put_response = $server->dispatch($put_request);

if ($put_response->is_error()) {
    echo "❌ PUT Profile API Error: " . $put_response->get_error_message() . "\n";
} else {
    $put_data = $put_response->get_data();
    echo "✅ PUT Profile API Success\n";
    echo "Response data: " . json_encode($put_data, JSON_PRETTY_PRINT) . "\n";
}

echo "\n=== VERIFYING SAVED DATA ===\n";

// 5. Check if the data was actually saved
$saved_meta = get_user_meta($user_id);
echo "Profile data after save attempt:\n";

foreach ($saved_meta as $key => $value) {
    if (strpos($key, '_profile_') === 0) {
        echo "$key: " . (is_array($value[0]) ? json_encode($value[0]) : $value[0]) . "\n";
    }
}

echo "\n=== TESTING GET AFTER SAVE ===\n";

// 6. Test GET again to see if data is retrieved correctly
$get_request2 = new WP_REST_Request('GET', '/fitcopilot/v1/profile');
$get_request2->set_param('user_id', $user_id);

$get_response2 = $server->dispatch($get_request2);

if ($get_response2->is_error()) {
    echo "❌ GET Profile API Error (after save): " . $get_response2->get_error_message() . "\n";
} else {
    $get_data2 = $get_response2->get_data();
    echo "✅ GET Profile API Success (after save)\n";
    echo "Retrieved data: " . json_encode($get_data2, JSON_PRETTY_PRINT) . "\n";
}

echo "\n=== FIELD MAPPING TEST ===\n";

// 7. Test the field mapping functions
echo "Testing field mapping functions...\n";

// Check if the mapping functions exist
if (function_exists('mapApiResponseToUserProfile')) {
    echo "✅ mapApiResponseToUserProfile function exists\n";
} else {
    echo "❌ mapApiResponseToUserProfile function NOT found\n";
}

if (function_exists('mapUserProfileToApiFormat')) {
    echo "✅ mapUserProfileToApiFormat function exists\n";
} else {
    echo "❌ mapUserProfileToApiFormat function NOT found\n";
}

echo "\n=== DEBUG COMPLETE ===\n";
echo "Check the output above to identify any issues with data saving or retrieval.\n";
?> 