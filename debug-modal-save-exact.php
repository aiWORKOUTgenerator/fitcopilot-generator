<?php
/**
 * Debug Modal Save - EXACT REPLICATION
 * 
 * This script replicates the EXACT flow from the working API test
 * and compares it to what the modal is actually doing.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    // Try multiple possible paths to wp-load.php
    $wp_load_paths = [
        __DIR__ . '/../../../../wp-load.php',
        __DIR__ . '/../../../wp-load.php', 
        __DIR__ . '/../../wp-load.php',
        '/Users/justinfassio/Local Sites/fitcopilot-generator/app/public/wp-load.php'
    ];
    
    $wp_loaded = false;
    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            $wp_loaded = true;
            break;
        }
    }
    
    if (!$wp_loaded) {
        die("Could not find wp-load.php. Please run this script from within WordPress.\n");
    }
}

echo "=== DEBUGGING MODAL SAVE vs WORKING API TEST ===\n\n";

// Find a workout to test with
$workouts = get_posts([
    'post_type' => 'wg_workout',
    'numberposts' => 1,
    'post_status' => 'publish'
]);

if (empty($workouts)) {
    echo "❌ No workout found to test with\n";
    exit;
}

$workout = $workouts[0];
$workout_id = $workout->ID;

echo "🔍 Testing with workout: {$workout_id} - {$workout->post_title}\n\n";

// STEP 1: Get current workout data (what the modal loads)
echo "📥 STEP 1: What the modal loads from getWorkout():\n";
echo "================================\n";

// Simulate the API call that the modal makes
$api_data = [];

// Get basic post data
$api_data['id'] = $workout_id;
$api_data['title'] = $workout->post_title;
$api_data['content'] = $workout->post_content;
$api_data['date'] = $workout->post_date;

// Get meta data
$api_data['difficulty'] = get_post_meta($workout_id, '_difficulty', true) ?: 'intermediate';
$api_data['duration'] = get_post_meta($workout_id, '_duration', true) ?: 30;
$api_data['version'] = get_post_meta($workout_id, '_workout_version', true) ?: 1;
$api_data['workout_data'] = get_post_meta($workout_id, '_workout_data', true);

echo "Modal loads this data:\n";
echo json_encode($api_data, JSON_PRETTY_PRINT) . "\n\n";

// STEP 2: Test WORKING API format (from test-api-endpoints.php)
echo "✅ STEP 2: WORKING API TEST Format:\n";
echo "================================\n";

$working_test_data = [
    'title' => 'Updated Direct Workout Title',
    'difficulty' => 'advanced',
    'duration' => 45
];

echo "Working test sends (DIRECT format):\n";
echo json_encode($working_test_data, JSON_PRETTY_PRINT) . "\n\n";

$working_wrapped_data = [
    'workout' => [
        'title' => 'Updated Wrapped Workout Title',
        'difficulty' => 'beginner',
        'duration' => 20
    ]
];

echo "Working test sends (WRAPPED format):\n";
echo json_encode($working_wrapped_data, JSON_PRETTY_PRINT) . "\n\n";

// STEP 3: Test what the modal SHOULD send
echo "🔧 STEP 3: What modal SHOULD send with exercises:\n";
echo "================================\n";

// Parse the workout_data to get exercises
$workout_data = is_string($api_data['workout_data']) ? json_decode($api_data['workout_data'], true) : $api_data['workout_data'];
$exercises = [];

if (!empty($workout_data)) {
    if (isset($workout_data['exercises'])) {
        $exercises = $workout_data['exercises'];
    } elseif (isset($workout_data['sections'])) {
        foreach ($workout_data['sections'] as $section) {
            if (isset($section['exercises'])) {
                $exercises = array_merge($exercises, $section['exercises']);
            }
        }
    }
}

$modal_should_send = [
    'workout' => [
        'title' => 'Updated via Modal Test',
        'difficulty' => 'advanced',
        'duration' => 45,
        'version' => $api_data['version'],
        'exercises' => $exercises,
        'notes' => 'Test description'
    ]
];

echo "Modal SHOULD send (with exercises):\n";
echo json_encode([
    'workout' => [
        'title' => $modal_should_send['workout']['title'],
        'difficulty' => $modal_should_send['workout']['difficulty'],
        'duration' => $modal_should_send['workout']['duration'],
        'version' => $modal_should_send['workout']['version'],
        'exercise_count' => count($modal_should_send['workout']['exercises']),
        'notes' => $modal_should_send['workout']['notes']
    ]
], JSON_PRETTY_PRINT) . "\n\n";

// STEP 4: Test the transformWorkoutForSave equivalent
echo "🔄 STEP 4: Transform function test:\n";
echo "================================\n";

function test_transform_workout_for_save($workout_data) {
    echo "Input workout data:\n";
    echo "  - ID: " . ($workout_data['id'] ?? 'null') . "\n";
    echo "  - Title: " . ($workout_data['title'] ?? 'null') . "\n";
    echo "  - Version: " . ($workout_data['version'] ?? 'null') . "\n";
    echo "  - Exercise count: " . (isset($workout_data['exercises']) ? count($workout_data['exercises']) : 0) . "\n\n";
    
    // Test the conditional spread (the bug we found)
    $version = $workout_data['version'] ?? null;
    echo "Version conditional test:\n";
    echo "  - Version value: " . var_export($version, true) . "\n";
    echo "  - Truthy check: " . ($version ? 'true' : 'false') . "\n";
    echo "  - Type: " . gettype($version) . "\n";
    
    // Test BROKEN spread (original bug)
    $broken_result = [
        'title' => $workout_data['title'],
        'difficulty' => $workout_data['difficulty'],
        'duration' => $workout_data['duration'],
        'exercises' => $workout_data['exercises'] ?? []
    ];
    if ($version) {
        $broken_result['version'] = $version;
    }
    
    echo "  - BROKEN conditional result: " . (isset($broken_result['version']) ? 'version included' : 'VERSION MISSING!') . "\n";
    
    // Test FIXED spread
    $fixed_result = [
        'title' => $workout_data['title'],
        'difficulty' => $workout_data['difficulty'], 
        'duration' => $workout_data['duration'],
        'exercises' => $workout_data['exercises'] ?? []
    ];
    if ($version !== null) {
        $fixed_result['version'] = $version;
    }
    
    echo "  - FIXED conditional result: " . (isset($fixed_result['version']) ? 'version included' : 'version missing') . "\n\n";
    
    return $fixed_result;
}

// Test with different version values
echo "Testing transform with version 1:\n";
test_transform_workout_for_save([
    'id' => $workout_id,
    'title' => 'Test Workout',
    'difficulty' => 'intermediate',
    'duration' => 30,
    'version' => 1,
    'exercises' => $exercises
]);

echo "Testing transform with version 0 (the problematic case):\n";
test_transform_workout_for_save([
    'id' => $workout_id,
    'title' => 'Test Workout',
    'difficulty' => 'intermediate',
    'duration' => 30,
    'version' => 0,
    'exercises' => $exercises
]);

// STEP 5: Test the isUpdate logic
echo "🔍 STEP 5: isUpdate logic test:\n";
echo "================================\n";

function test_is_update($workout_id) {
    echo "Testing isUpdate logic:\n";
    echo "  - workout.id: " . var_export($workout_id, true) . "\n";
    echo "  - Type: " . gettype($workout_id) . "\n";
    
    // Test the original logic
    $is_update = $workout_id && $workout_id !== 'new';
    echo "  - isUpdate result: " . ($is_update ? 'true (UPDATE)' : 'false (CREATE)') . "\n";
    
    if ($is_update) {
        echo "  - Would use PUT /workouts/{$workout_id}\n";
    } else {
        echo "  - Would use POST /workouts (creates new workout!)\n";
    }
    echo "\n";
}

test_is_update($workout_id);
test_is_update("$workout_id");  // String version
test_is_update(null);
test_is_update('new');
test_is_update('');

echo "=== SUMMARY ===\n";
echo "1. Working API test uses: PUT /workouts/{id} with simple data\n";
echo "2. Modal should use: PUT /workouts/{id} with workout wrapper\n";
echo "3. Key issues to check:\n";
echo "   - Is workout.id properly set?\n";
echo "   - Is version being included correctly?\n";
echo "   - Are exercises being preserved?\n";
echo "   - Is it doing UPDATE vs CREATE?\n\n";

// STEP 6: Actual API test
echo "🌐 STEP 6: Test actual API call:\n";
echo "================================\n";

// Simulate the REST API request (but don't actually save)
$test_request_data = [
    'workout' => [
        'title' => 'Modal Debug Test - ' . date('H:i:s'),
        'difficulty' => 'advanced',
        'duration' => 45,
        'version' => $api_data['version'],
        'exercises' => array_slice($exercises, 0, 3), // First 3 exercises
        'notes' => 'Debug test - ' . date('Y-m-d H:i:s')
    ]
];

echo "Would send to PUT /wp-json/fitcopilot/v1/workouts/{$workout_id}:\n";
echo json_encode($test_request_data, JSON_PRETTY_PRINT) . "\n\n";

echo "✅ Debug complete. Check the data flow above to identify the issue.\n";
?> 