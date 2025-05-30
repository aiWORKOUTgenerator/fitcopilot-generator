<?php
/**
 * Backup workout data before migration
 * Usage: wp eval-file wp-content/plugins/Fitcopilot-Generator/scripts/backup-workout-data.php
 */

// Ensure WordPress is loaded
if (!defined('ABSPATH')) {
    echo "Error: This script must be run through WP-CLI\n";
    exit(1);
}

function backup_workout_data() {
    global $wpdb;
    
    $timestamp = date('Y-m-d-H-i-s');
    $backup_file = "workout-data-backup-{$timestamp}.sql";
    
    echo "📦 Creating backup of workout data...\n";
    echo "⏰ Backup timestamp: {$timestamp}\n";
    
    // Get all workout posts and their meta
    $workouts = $wpdb->get_results("
        SELECT p.ID, p.post_title, p.post_content, p.post_status, p.post_date, p.post_date_gmt, p.post_modified, p.post_modified_gmt, p.post_type
        FROM {$wpdb->posts} p
        WHERE p.post_type = 'fc_workout'
        AND p.post_status != 'trash'
        ORDER BY p.ID ASC
    ");
    
    $meta_data = $wpdb->get_results("
        SELECT pm.post_id, pm.meta_key, pm.meta_value
        FROM {$wpdb->postmeta} pm
        INNER JOIN {$wpdb->posts} p ON pm.post_id = p.ID
        WHERE p.post_type = 'fc_workout'
        AND p.post_status != 'trash'
        ORDER BY pm.post_id, pm.meta_key
    ");
    
    $total_workouts = count($workouts);
    $total_meta_entries = count($meta_data);
    
    echo "📊 Found {$total_workouts} workout posts\n";
    echo "📊 Found {$total_meta_entries} meta entries\n";
    
    if ($total_workouts === 0) {
        echo "⚠️  No workout data found to backup\n";
        return false;
    }
    
    // Create backup content
    $backup_content = "-- FitCopilot Workout Data Backup\n";
    $backup_content .= "-- Created: " . date('Y-m-d H:i:s') . "\n";
    $backup_content .= "-- Total workouts: {$total_workouts}\n";
    $backup_content .= "-- Total meta entries: {$total_meta_entries}\n";
    $backup_content .= "-- WordPress Version: " . get_bloginfo('version') . "\n";
    $backup_content .= "-- Plugin: FitCopilot Generator\n";
    $backup_content .= "-- Backup Type: Pre-Migration Safety Backup\n\n";
    
    $backup_content .= "-- ========================================\n";
    $backup_content .= "-- WORKOUT POSTS BACKUP\n";
    $backup_content .= "-- ========================================\n\n";
    
    foreach ($workouts as $post) {
        $backup_content .= sprintf(
            "-- Workout ID: %d, Title: %s\n",
            $post->ID,
            addslashes($post->post_title)
        );
        
        $backup_content .= sprintf(
            "INSERT INTO `%s` (`ID`, `post_title`, `post_content`, `post_status`, `post_date`, `post_date_gmt`, `post_modified`, `post_modified_gmt`, `post_type`) VALUES (%d, %s, %s, %s, %s, %s, %s, %s, %s);\n",
            $wpdb->posts,
            $post->ID,
            "'" . addslashes($post->post_title) . "'",
            "'" . addslashes($post->post_content) . "'",
            "'" . addslashes($post->post_status) . "'",
            "'" . addslashes($post->post_date) . "'",
            "'" . addslashes($post->post_date_gmt) . "'",
            "'" . addslashes($post->post_modified) . "'",
            "'" . addslashes($post->post_modified_gmt) . "'",
            "'" . addslashes($post->post_type) . "'"
        );
    }
    
    $backup_content .= "\n-- ========================================\n";
    $backup_content .= "-- WORKOUT META DATA BACKUP\n";
    $backup_content .= "-- ========================================\n\n";
    
    foreach ($meta_data as $meta) {
        if (!empty($meta->meta_value)) {
            $backup_content .= sprintf(
                "INSERT INTO `%s` (`post_id`, `meta_key`, `meta_value`) VALUES (%d, %s, %s);\n",
                $wpdb->postmeta,
                $meta->post_id,
                "'" . addslashes($meta->meta_key) . "'",
                "'" . addslashes($meta->meta_value) . "'"
            );
        }
    }
    
    $backup_content .= "\n-- ========================================\n";
    $backup_content .= "-- RESTORE INSTRUCTIONS\n";
    $backup_content .= "-- ========================================\n";
    $backup_content .= "-- To restore this backup:\n";
    $backup_content .= "-- 1. Delete current workout data (if needed):\n";
    $backup_content .= "--    DELETE FROM {$wpdb->postmeta} WHERE post_id IN (SELECT ID FROM {$wpdb->posts} WHERE post_type = 'fc_workout');\n";
    $backup_content .= "--    DELETE FROM {$wpdb->posts} WHERE post_type = 'fc_workout';\n";
    $backup_content .= "-- 2. Import this backup file:\n";
    $backup_content .= "--    wp db import {$backup_file}\n";
    $backup_content .= "-- \n";
    $backup_content .= "-- WARNING: Always test restoration on development environment first!\n";
    $backup_content .= "-- ========================================\n\n";
    
    // Write to file
    $bytes_written = file_put_contents($backup_file, $backup_content);
    
    if ($bytes_written === false) {
        echo "❌ Failed to create backup file\n";
        return false;
    }
    
    $file_size = filesize($backup_file);
    $file_size_mb = round($file_size / 1024 / 1024, 2);
    
    echo "✅ Backup created successfully!\n";
    echo "📁 File: {$backup_file}\n";
    echo "📊 Size: {$file_size} bytes ({$file_size_mb} MB)\n";
    echo "💾 Location: " . getcwd() . "/{$backup_file}\n";
    
    // Create a JSON summary file as well
    $summary_file = "workout-backup-summary-{$timestamp}.json";
    $summary = [
        'backup_date' => date('Y-m-d H:i:s'),
        'backup_file' => $backup_file,
        'total_workouts' => $total_workouts,
        'total_meta_entries' => $total_meta_entries,
        'file_size_bytes' => $file_size,
        'wordpress_version' => get_bloginfo('version'),
        'plugin_version' => 'FitCopilot Generator',
        'backup_type' => 'pre_migration_safety_backup'
    ];
    
    file_put_contents($summary_file, wp_json_encode($summary, JSON_PRETTY_PRINT));
    echo "📋 Summary: {$summary_file}\n";
    
    return $backup_file;
}

function verify_backup($backup_file) {
    if (!file_exists($backup_file)) {
        echo "❌ Backup file not found: {$backup_file}\n";
        return false;
    }
    
    $content = file_get_contents($backup_file);
    if (empty($content)) {
        echo "❌ Backup file is empty\n";
        return false;
    }
    
    // Basic validation
    if (strpos($content, 'INSERT INTO') === false) {
        echo "❌ Backup file doesn't contain expected SQL statements\n";
        return false;
    }
    
    echo "✅ Backup file validation passed\n";
    return true;
}

// Run backup
echo "🏃‍♂️ FITCOPILOT WORKOUT DATA BACKUP\n";
echo "===================================\n\n";

try {
    $backup_file = backup_workout_data();
    
    if ($backup_file) {
        echo "\n🔍 Verifying backup...\n";
        $verification_passed = verify_backup($backup_file);
        
        if ($verification_passed) {
            echo "\n🎯 BACKUP COMPLETE & VERIFIED\n";
            echo "============================\n";
            echo "Your workout data has been safely backed up.\n";
            echo "Keep this backup file safe until migration is complete.\n\n";
            echo "Next steps:\n";
            echo "1. Test migration: wp eval-file scripts/migrate-workout-data.php --dry-run\n";
            echo "2. Run migration: wp eval-file scripts/migrate-workout-data.php\n";
        } else {
            echo "\n⚠️  Backup verification failed - check backup manually\n";
        }
    } else {
        echo "\n❌ Backup failed\n";
        exit(1);
    }
    
} catch (Exception $e) {
    echo "\n💥 BACKUP FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
} 