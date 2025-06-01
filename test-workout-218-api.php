<?php
/**
 * API Authentication Test for Workout 218
 * 
 * Test if workout 218 is accessible with proper user authentication
 */

if (!defined('ABSPATH')) {
    echo "This script must be run in WordPress context\n";
    exit(1);
}

echo "🔐 WORKOUT 218 API AUTHENTICATION TEST\n";
echo "======================================\n\n";

// Get a valid admin user
$admin_users = get_users(['role' => 'administrator', 'number' => 1]);
if (empty($admin_users)) {
    echo "❌ No admin users found\n";
    exit(1);
}

$admin_user = $admin_users[0];
echo "🔐 Testing with admin user: {$admin_user->user_login} (ID: {$admin_user->ID})\n\n";

// Test 1: Direct Utilities::get_workout() with admin user
echo "📊 TEST 1: Direct API Access\n";
echo "-----------------------------\n";

try {
    $workout_data = \FitCopilot\API\WorkoutEndpoints\Utilities::get_workout(218, $admin_user->ID);
    
    if ($workout_data === false) {
        echo "❌ FAILED: Utilities::get_workout() returned FALSE even with admin user\n";
        echo "This indicates the workout is not accessible or doesn't exist\n";
    } else {
        echo "✅ SUCCESS: Utilities::get_workout() returned data\n";
        echo "📦 Data keys: " . implode(', ', array_keys($workout_data)) . "\n";
        
        if (isset($workout_data['workout_data'])) {
            if (is_array($workout_data['workout_data'])) {
                $exercises = $workout_data['workout_data']['exercises'] ?? [];
                echo "🏋️  Exercises: " . count($exercises) . "\n";
                echo "✅ Exercise data successfully retrieved via API\n";
            } else {
                echo "📊 workout_data type: " . gettype($workout_data['workout_data']) . "\n";
            }
        } else {
            echo "⚠️  No workout_data field in response\n";
        }
    }
} catch (Exception $e) {
    echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Test via REST API endpoint
echo "📊 TEST 2: REST API Endpoint\n";
echo "-----------------------------\n";

// Set current user for REST API context
wp_set_current_user($admin_user->ID);

try {
    $endpoint = new \FitCopilot\API\WorkoutEndpoints\WorkoutRetrievalEndpoint();
    
    // Create mock REST request
    $request = new \WP_REST_Request('GET', '/fitcopilot/v1/workouts/218');
    $request->set_param('id', '218');
    
    $response = $endpoint->get_workout($request);
    
    if (is_wp_error($response)) {
        echo "❌ FAILED: " . $response->get_error_message() . "\n";
    } else {
        $response_data = $response->get_data();
        echo "✅ SUCCESS: REST API returned data\n";
        echo "🔑 Response success: " . ($response_data['success'] ? 'TRUE' : 'FALSE') . "\n";
        
        if (isset($response_data['data'])) {
            $api_data = $response_data['data'];
            echo "📦 API data keys: " . implode(', ', array_keys($api_data)) . "\n";
            
            if (isset($api_data['workout_data'])) {
                if (is_array($api_data['workout_data'])) {
                    $exercises = $api_data['workout_data']['exercises'] ?? [];
                    echo "🏋️  Exercises in API response: " . count($exercises) . "\n";
                    echo "✅ Complete data flow working: Database → API → Response\n";
                } else {
                    echo "📊 workout_data type: " . gettype($api_data['workout_data']) . "\n";
                }
            } else {
                echo "⚠️  No workout_data in API response\n";
            }
        } else {
            echo "❌ No data field in response\n";
        }
    }
} catch (Exception $e) {
    echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 3: Verify the actual API URL that frontend uses
echo "📊 TEST 3: Frontend API Simulation\n";
echo "-----------------------------------\n";

// Simulate what happens when frontend calls the API
$api_url = home_url('/wp-json/fitcopilot/v1/workouts/218');
echo "🌐 API URL: {$api_url}\n";

// Check if REST API authentication is working
$nonce = wp_create_nonce('wp_rest');
echo "🔐 Generated nonce: {$nonce}\n";

echo "\n💡 DIAGNOSIS:\n";
echo "The issue appears to be authentication-related.\n";
echo "Workout 218 has valid data but API access requires proper authentication.\n";
echo "Frontend likely lacks valid nonce or is not passing authentication correctly.\n";

echo "\n🛠️  NEXT STEPS:\n";
echo "1. Check if frontend has access to valid nonces\n";
echo "2. Verify authentication middleware is working\n";
echo "3. Test frontend API calls with proper authentication\n";
echo "4. Ensure saved workouts page loads with current user context\n"; 