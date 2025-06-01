<?php
/**
 * Workout 218 Investigation Script
 * 
 * Run this script to analyze workout 218's database structure and identify data issues
 * Usage: wp eval-file investigate-workout-218.php
 */

if (!defined('ABSPATH')) {
    echo "This script must be run in WordPress context\n";
    echo "Usage: wp eval-file investigate-workout-218.php\n";
    exit(1);
}

echo "🔍 WORKOUT 218 INVESTIGATION REPORT\n";
echo "===================================\n\n";

/**
 * Step 1: Basic Post Data Analysis
 */
function investigate_workout_218_post_data() {
    global $wpdb;
    
    echo "📊 STEP 1: POST DATA ANALYSIS\n";
    echo "------------------------------\n";
    
    $workout_data = $wpdb->get_row($wpdb->prepare("
        SELECT 
            p.ID,
            p.post_title,
            p.post_content,
            p.post_excerpt,
            p.post_date,
            p.post_modified,
            p.post_status,
            p.post_author,
            p.post_type
        FROM {$wpdb->posts} p 
        WHERE p.ID = %d
    ", 218));
    
    if (!$workout_data) {
        echo "❌ ERROR: Workout 218 not found in posts table\n\n";
        return false;
    }
    
    echo "✅ Post found in database\n";
    echo "ID: {$workout_data->ID}\n";
    echo "Title: '{$workout_data->post_title}'\n";
    echo "Type: {$workout_data->post_type}\n";
    echo "Status: {$workout_data->post_status}\n";
    echo "Author: {$workout_data->post_author}\n";
    echo "Created: {$workout_data->post_date}\n";
    echo "Modified: {$workout_data->post_modified}\n";
    echo "Content Length: " . strlen($workout_data->post_content) . " chars\n";
    
    if (strlen($workout_data->post_content) > 0) {
        echo "Content Preview: " . substr($workout_data->post_content, 0, 200) . "...\n";
    } else {
        echo "⚠️  Content: EMPTY\n";
    }
    
    if (strlen($workout_data->post_excerpt) > 0) {
        echo "Excerpt: " . substr($workout_data->post_excerpt, 0, 100) . "...\n";
    } else {
        echo "Excerpt: EMPTY\n";
    }
    
    echo "\n";
    return true;
}

/**
 * Step 2: Metadata Analysis
 */
function investigate_workout_218_metadata() {
    global $wpdb;
    
    echo "🔧 STEP 2: METADATA ANALYSIS\n";
    echo "-----------------------------\n";
    
    $metadata = $wpdb->get_results($wpdb->prepare("
        SELECT meta_key, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE post_id = %d
        ORDER BY meta_key
    ", 218));
    
    if (empty($metadata)) {
        echo "❌ ERROR: No metadata found for workout 218\n\n";
        return false;
    }
    
    echo "📋 Found " . count($metadata) . " metadata entries:\n\n";
    
    $workout_data_found = false;
    
    foreach ($metadata as $meta) {
        echo "🔑 {$meta->meta_key}:\n";
        
        if ($meta->meta_key === '_workout_data') {
            $workout_data_found = true;
            echo "  📏 Length: " . strlen($meta->meta_value) . " chars\n";
            
            if (empty($meta->meta_value)) {
                echo "  ❌ Status: EMPTY\n";
            } else {
                // Try to decode JSON
                $decoded = json_decode($meta->meta_value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    echo "  ✅ JSON Status: Valid\n";
                    echo "  📦 Top-level keys: " . implode(', ', array_keys($decoded)) . "\n";
                    
                    if (isset($decoded['exercises'])) {
                        $exercise_count = is_array($decoded['exercises']) ? count($decoded['exercises']) : 0;
                        echo "  🏋️  Exercises: {$exercise_count}\n";
                        
                        if ($exercise_count > 0) {
                            $first_exercise = $decoded['exercises'][0];
                            echo "  📝 First Exercise: " . ($first_exercise['name'] ?? 'Unnamed') . "\n";
                            echo "  📝 Exercise Keys: " . implode(', ', array_keys($first_exercise)) . "\n";
                        }
                    }
                    
                    if (isset($decoded['sections'])) {
                        $section_count = is_array($decoded['sections']) ? count($decoded['sections']) : 0;
                        echo "  📚 Sections: {$section_count}\n";
                    }
                    
                    if (isset($decoded['metadata'])) {
                        echo "  🏷️  Format: " . ($decoded['metadata']['format'] ?? 'unknown') . "\n";
                        echo "  📅 Normalized: " . ($decoded['metadata']['normalized_at'] ?? 'unknown') . "\n";
                    }
                } else {
                    echo "  ❌ JSON Status: Invalid - " . json_last_error_msg() . "\n";
                    echo "  📄 Raw Preview: " . substr($meta->meta_value, 0, 200) . "...\n";
                }
            }
        } else {
            $value_length = strlen($meta->meta_value);
            if ($value_length > 100) {
                echo "  📄 Value: [Large content - {$value_length} chars]\n";
                echo "  📄 Preview: " . substr($meta->meta_value, 0, 100) . "...\n";
            } else {
                echo "  📄 Value: {$meta->meta_value}\n";
            }
        }
        echo "\n";
    }
    
    if (!$workout_data_found) {
        echo "🚨 CRITICAL: _workout_data field not found!\n";
        echo "This explains why the frontend shows no exercises.\n\n";
    }
    
    return true;
}

/**
 * Step 3: Compare with Working Workout
 */
function compare_with_working_workout() {
    global $wpdb;
    
    echo "🔄 STEP 3: COMPARISON WITH WORKING WORKOUT\n";
    echo "------------------------------------------\n";
    
    // Find a recent working workout
    $working_workout = $wpdb->get_row("
        SELECT p.ID, p.post_title, p.post_date
        FROM {$wpdb->posts} p
        WHERE p.post_type = 'fc_workout' 
        AND p.ID != 218
        AND p.post_status = 'publish'
        ORDER BY p.post_date DESC
        LIMIT 1
    ");
    
    if (!$working_workout) {
        echo "❌ No other workouts found for comparison\n\n";
        return false;
    }
    
    echo "📊 Comparing with Workout {$working_workout->ID}: '{$working_workout->post_title}'\n";
    echo "Created: {$working_workout->post_date}\n\n";
    
    // Get metadata for both workouts
    $working_meta = $wpdb->get_results($wpdb->prepare("
        SELECT meta_key, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE post_id = %d
        AND meta_key LIKE '_workout_%'
        ORDER BY meta_key
    ", $working_workout->ID));
    
    $problem_meta = $wpdb->get_results($wpdb->prepare("
        SELECT meta_key, meta_value 
        FROM {$wpdb->postmeta} 
        WHERE post_id = %d
        AND meta_key LIKE '_workout_%'
        ORDER BY meta_key
    ", 218));
    
    echo "🔑 METADATA KEY COMPARISON:\n";
    $working_keys = array_column($working_meta, 'meta_key');
    $problem_keys = array_column($problem_meta, 'meta_key');
    
    echo "Working Workout Keys: " . implode(', ', $working_keys) . "\n";
    echo "Problem Workout Keys: " . implode(', ', $problem_keys) . "\n";
    
    $missing_keys = array_diff($working_keys, $problem_keys);
    $extra_keys = array_diff($problem_keys, $working_keys);
    
    if (!empty($missing_keys)) {
        echo "⚠️  Missing from 218: " . implode(', ', $missing_keys) . "\n";
    }
    if (!empty($extra_keys)) {
        echo "ℹ️  Extra in 218: " . implode(', ', $extra_keys) . "\n";
    }
    
    // Compare _workout_data specifically
    echo "\n📦 _workout_data COMPARISON:\n";
    
    $working_data = '';
    $problem_data = '';
    
    foreach ($working_meta as $meta) {
        if ($meta->meta_key === '_workout_data') {
            $working_data = $meta->meta_value;
            break;
        }
    }
    
    foreach ($problem_meta as $meta) {
        if ($meta->meta_key === '_workout_data') {
            $problem_data = $meta->meta_value;
            break;
        }
    }
    
    echo "Working workout _workout_data: " . (empty($working_data) ? 'EMPTY' : strlen($working_data) . ' chars') . "\n";
    echo "Problem workout _workout_data: " . (empty($problem_data) ? 'EMPTY' : strlen($problem_data) . ' chars') . "\n";
    
    if (!empty($working_data) && !empty($problem_data)) {
        $working_decoded = json_decode($working_data, true);
        $problem_decoded = json_decode($problem_data, true);
        
        if ($working_decoded && $problem_decoded) {
            echo "\n📊 STRUCTURE COMPARISON:\n";
            echo "Working keys: " . implode(', ', array_keys($working_decoded)) . "\n";
            echo "Problem keys: " . implode(', ', array_keys($problem_decoded)) . "\n";
            
            $working_exercises = count($working_decoded['exercises'] ?? []);
            $problem_exercises = count($problem_decoded['exercises'] ?? []);
            
            echo "Working exercises: {$working_exercises}\n";
            echo "Problem exercises: {$problem_exercises}\n";
            
            if ($working_exercises > 0 && $problem_exercises === 0) {
                echo "🚨 ROOT CAUSE IDENTIFIED: Problem workout has no exercises in _workout_data\n";
            }
        }
    } elseif (empty($problem_data)) {
        echo "🚨 ROOT CAUSE IDENTIFIED: Problem workout has no _workout_data at all\n";
    }
    
    echo "\n";
    return true;
}

/**
 * Step 4: API Processing Test
 */
function test_api_processing() {
    echo "🔍 STEP 4: API PROCESSING TEST\n";
    echo "------------------------------\n";
    
    try {
        // Test if the workout can be retrieved via Utilities::get_workout()
        if (class_exists('\\FitCopilot\\API\\WorkoutEndpoints\\Utilities')) {
            echo "✅ Utilities class found\n";
            
            $user_id = get_current_user_id();
            echo "🔐 Testing with user ID: {$user_id}\n";
            
            $workout_data = \FitCopilot\API\WorkoutEndpoints\Utilities::get_workout(218, $user_id);
            
            if ($workout_data === false) {
                echo "❌ Utilities::get_workout() returned FALSE\n";
                echo "This means the workout was not found or access denied\n";
            } else {
                echo "✅ Utilities::get_workout() succeeded\n";
                echo "📦 Returned data keys: " . implode(', ', array_keys($workout_data)) . "\n";
                
                if (isset($workout_data['workout_data'])) {
                    echo "📊 workout_data field: " . (is_array($workout_data['workout_data']) ? 'ARRAY' : gettype($workout_data['workout_data'])) . "\n";
                    
                    if (is_array($workout_data['workout_data'])) {
                        $exercises = $workout_data['workout_data']['exercises'] ?? [];
                        echo "🏋️  Exercises in API response: " . count($exercises) . "\n";
                    }
                } else {
                    echo "⚠️  No workout_data field in API response\n";
                }
            }
        } else {
            echo "❌ Utilities class not found\n";
        }
    } catch (Exception $e) {
        echo "❌ API processing test failed: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

/**
 * Step 5: Generate Summary Report
 */
function generate_summary_report() {
    echo "📋 STEP 5: INVESTIGATION SUMMARY\n";
    echo "================================\n";
    
    global $wpdb;
    
    // Check basic post existence
    $post_exists = $wpdb->get_var($wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE ID = %d", 218));
    
    // Check _workout_data existence and validity
    $workout_data_raw = get_post_meta(218, '_workout_data', true);
    $has_workout_data = !empty($workout_data_raw);
    $valid_json = false;
    $exercise_count = 0;
    
    if ($has_workout_data) {
        $decoded = json_decode($workout_data_raw, true);
        $valid_json = (json_last_error() === JSON_ERROR_NONE);
        if ($valid_json && isset($decoded['exercises'])) {
            $exercise_count = count($decoded['exercises']);
        }
    }
    
    // Check post content
    $post_content = get_post_field('post_content', 218);
    $has_content = !empty($post_content);
    
    echo "🔍 FINDINGS:\n";
    echo "Post exists: " . ($post_exists ? '✅ YES' : '❌ NO') . "\n";
    echo "_workout_data exists: " . ($has_workout_data ? '✅ YES' : '❌ NO') . "\n";
    echo "_workout_data valid JSON: " . ($valid_json ? '✅ YES' : '❌ NO') . "\n";
    echo "Exercise count: " . ($exercise_count > 0 ? "✅ {$exercise_count}" : "❌ 0") . "\n";
    echo "Post content exists: " . ($has_content ? '✅ YES' : '❌ NO') . "\n";
    
    echo "\n💡 DIAGNOSIS:\n";
    
    if (!$post_exists) {
        echo "🚨 CRITICAL: Workout 218 does not exist in the database\n";
    } elseif (!$has_workout_data) {
        echo "🚨 CRITICAL: _workout_data meta field is missing\n";
        echo "   This explains why frontend shows 0 exercises\n";
        echo "   CAUSE: Data was never saved or was deleted\n";
    } elseif (!$valid_json) {
        echo "🚨 CRITICAL: _workout_data contains invalid JSON\n";
        echo "   This explains why frontend can't parse exercises\n";
        echo "   CAUSE: Data corruption during save process\n";
    } elseif ($exercise_count === 0) {
        echo "🚨 CRITICAL: _workout_data exists but contains no exercises\n";
        echo "   JSON is valid but exercises array is empty\n";
        echo "   CAUSE: Exercise data was not saved properly\n";
    } else {
        echo "🤔 MYSTERY: Data appears correct but frontend issues persist\n";
        echo "   This suggests a frontend transformation problem\n";
        echo "   CAUSE: Likely in transformWorkoutResponse() logic\n";
    }
    
    echo "\n🛠️  RECOMMENDED ACTIONS:\n";
    
    if (!$has_workout_data || !$valid_json || $exercise_count === 0) {
        echo "1. Examine how workout 218 was originally created\n";
        echo "2. Check GenerateEndpoint save process for bugs\n";
        echo "3. Consider data recovery from logs or backups\n";
        echo "4. Implement data validation in save process\n";
    } else {
        echo "1. Debug frontend transformWorkoutResponse() function\n";
        echo "2. Check API response format consistency\n";
        echo "3. Verify data is reaching frontend correctly\n";
    }
    
    echo "\n";
}

// Run the investigation
echo "Starting comprehensive investigation of Workout 218...\n\n";

investigate_workout_218_post_data();
investigate_workout_218_metadata();
compare_with_working_workout();
test_api_processing();
generate_summary_report();

echo "🏁 Investigation complete!\n";
echo "Review the findings above to understand the root cause.\n"; 