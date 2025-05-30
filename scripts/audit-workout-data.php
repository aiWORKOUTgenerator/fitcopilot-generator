<?php
/**
 * Audit script to analyze existing workout data formats
 * Usage: wp eval-file wp-content/plugins/Fitcopilot-Generator/scripts/audit-workout-data.php
 */

// Ensure WordPress is loaded
if (!defined('ABSPATH')) {
    echo "Error: This script must be run through WP-CLI\n";
    exit(1);
}

// Load the Utilities class if not already loaded
if (!class_exists('FitCopilot\\API\\WorkoutEndpoints\\Utilities')) {
    $utilities_path = plugin_dir_path(__FILE__) . '../src/php/API/WorkoutEndpoints/Utilities.php';
    if (file_exists($utilities_path)) {
        require_once $utilities_path;
    }
}

function audit_workout_data() {
    global $wpdb;
    
    $results = [
        'total_workouts' => 0,
        'format_types' => [],
        'problematic_workouts' => [],
        'migration_needed' => [],
        'sample_data' => []
    ];
    
    // Get all fc_workout posts
    $workouts = $wpdb->get_results("
        SELECT p.ID, p.post_title, pm.meta_value as workout_data
        FROM {$wpdb->posts} p
        LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = '_workout_data'
        WHERE p.post_type = 'fc_workout'
        AND p.post_status != 'trash'
        ORDER BY p.ID DESC
    ");
    
    $results['total_workouts'] = count($workouts);
    
    if ($results['total_workouts'] === 0) {
        echo "No fc_workout posts found in database.\n";
        
        // Check if any workout posts exist at all
        $all_workout_posts = $wpdb->get_results("
            SELECT p.ID, p.post_title, p.post_type
            FROM {$wpdb->posts} p
            WHERE p.post_type LIKE '%workout%'
            AND p.post_status != 'trash'
        ");
        
        if (!empty($all_workout_posts)) {
            echo "Found " . count($all_workout_posts) . " posts with 'workout' in post type:\n";
            foreach ($all_workout_posts as $post) {
                echo "  - ID {$post->ID}: {$post->post_title} (type: {$post->post_type})\n";
            }
        }
        
        return $results;
    }
    
    foreach ($workouts as $workout) {
        $analysis = analyze_workout_format($workout);
        
        $format_key = $analysis['format_type'];
        if (!isset($results['format_types'][$format_key])) {
            $results['format_types'][$format_key] = 0;
        }
        $results['format_types'][$format_key]++;
        
        if ($analysis['needs_migration']) {
            $results['migration_needed'][] = [
                'id' => $workout->ID,
                'title' => $workout->post_title,
                'current_format' => $analysis['format_type'],
                'issues' => $analysis['issues']
            ];
        }
        
        if (!empty($analysis['errors'])) {
            $results['problematic_workouts'][] = [
                'id' => $workout->ID,
                'title' => $workout->post_title,
                'errors' => $analysis['errors']
            ];
        }
        
        // Collect sample data for the first few workouts of each type
        if (count($results['sample_data']) < 10) {
            $results['sample_data'][] = [
                'id' => $workout->ID,
                'title' => $workout->post_title,
                'format' => $analysis['format_type'],
                'data_sample' => substr($workout->workout_data, 0, 200) . '...'
            ];
        }
    }
    
    return $results;
}

function analyze_workout_format($workout) {
    $analysis = [
        'format_type' => 'unknown',
        'needs_migration' => false,
        'issues' => [],
        'errors' => []
    ];
    
    if (empty($workout->workout_data)) {
        $analysis['format_type'] = 'missing_data';
        $analysis['errors'][] = 'No workout data found';
        return $analysis;
    }
    
    $data = json_decode($workout->workout_data, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        $analysis['format_type'] = 'invalid_json';
        $analysis['errors'][] = 'Invalid JSON: ' . json_last_error_msg();
        return $analysis;
    }
    
    // Check format version - this is the new standard format
    if (isset($data['metadata']['format_version']) && $data['metadata']['format_version'] === '1.0') {
        $analysis['format_type'] = 'standard_v1';
        return $analysis; // Already in standard format
    }
    
    // Identify legacy format types
    if (isset($data['title']) && isset($data['exercises']) && isset($data['metadata'])) {
        $analysis['format_type'] = 'ai_generated_legacy';
        $analysis['needs_migration'] = true;
        $analysis['issues'][] = 'AI generated format missing version number';
    } elseif (isset($data['exercises']) && !isset($data['title'])) {
        $analysis['format_type'] = 'exercises_wrapper';
        $analysis['needs_migration'] = true;
        $analysis['issues'][] = 'Exercises-only format - missing title, metadata, and standardized structure';
    } elseif (is_array($data) && count($data) > 0) {
        // Check if it's a direct exercise array
        if (isset($data[0]) && is_array($data[0])) {
            $analysis['format_type'] = 'exercise_array';
            $analysis['needs_migration'] = true;
            $analysis['issues'][] = 'Direct exercise array format';
        } else {
            $analysis['format_type'] = 'custom_legacy';
            $analysis['needs_migration'] = true;
            $analysis['issues'][] = 'Unknown legacy format - needs investigation';
        }
    } else {
        $analysis['format_type'] = 'empty_or_invalid';
        $analysis['errors'][] = 'Empty or invalid data structure';
    }
    
    return $analysis;
}

// Run audit
echo "🔍 STARTING WORKOUT DATA AUDIT...\n\n";

try {
    $audit_results = audit_workout_data();
    
    // Output results
    echo "=== WORKOUT DATA AUDIT RESULTS ===\n";
    echo "Audit Date: " . date('Y-m-d H:i:s') . "\n";
    echo "Total Workouts: {$audit_results['total_workouts']}\n\n";

    if ($audit_results['total_workouts'] > 0) {
        echo "📊 FORMAT DISTRIBUTION:\n";
        foreach ($audit_results['format_types'] as $format => $count) {
            $percentage = round(($count / $audit_results['total_workouts']) * 100, 1);
            echo "  {$format}: {$count} workouts ({$percentage}%)\n";
        }

        echo "\n🔄 WORKOUTS NEEDING MIGRATION: " . count($audit_results['migration_needed']) . "\n";
        if (!empty($audit_results['migration_needed'])) {
            foreach ($audit_results['migration_needed'] as $workout) {
                echo "  - ID {$workout['id']}: \"{$workout['title']}\" ({$workout['current_format']})\n";
                foreach ($workout['issues'] as $issue) {
                    echo "    → {$issue}\n";
                }
            }
        }

        echo "\n⚠️  PROBLEMATIC WORKOUTS: " . count($audit_results['problematic_workouts']) . "\n";
        if (!empty($audit_results['problematic_workouts'])) {
            foreach ($audit_results['problematic_workouts'] as $workout) {
                echo "  - ID {$workout['id']}: \"{$workout['title']}\"\n";
                foreach ($workout['errors'] as $error) {
                    echo "    ❌ {$error}\n";
                }
            }
        }

        echo "\n📝 SAMPLE DATA INSPECTION:\n";
        foreach ($audit_results['sample_data'] as $sample) {
            echo "  - ID {$sample['id']} ({$sample['format']}): {$sample['data_sample']}\n";
        }
    }
    
    echo "\n=== AUDIT COMPLETE ===\n";
    
    // Summary and recommendations
    $migration_percentage = $audit_results['total_workouts'] > 0 
        ? round((count($audit_results['migration_needed']) / $audit_results['total_workouts']) * 100, 1)
        : 0;
    
    echo "\n🎯 MIGRATION SUMMARY:\n";
    echo "  • Total workouts requiring migration: " . count($audit_results['migration_needed']) . " ({$migration_percentage}%)\n";
    echo "  • Problematic workouts needing attention: " . count($audit_results['problematic_workouts']) . "\n";
    
    if (count($audit_results['migration_needed']) > 0) {
        echo "\n✅ NEXT STEPS:\n";
        echo "  1. Run backup script: wp eval-file scripts/backup-workout-data.php\n";
        echo "  2. Test migration on development copy\n";
        echo "  3. Run migration script: wp eval-file scripts/migrate-workout-data.php\n";
    } else {
        echo "\n✅ All workouts are in standard format - no migration needed!\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR DURING AUDIT: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 