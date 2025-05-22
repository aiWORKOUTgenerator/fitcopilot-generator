<?php
/**
 * Workout Endpoints Utilities
 *
 * Shared utility functions for workout endpoints
 */

namespace FitCopilot\API\WorkoutEndpoints;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Utilities class
 */
class Utilities {
    
    /**
     * Apply defaults to workout parameters
     *
     * @param array $params The parameters
     * @return array Parameters with defaults applied
     */
    public static function apply_workout_defaults($params) {
        $defaults = [
            'duration' => 30,
            'difficulty' => 'intermediate',
            'goals' => 'general fitness',
            'equipment' => [],
            'restrictions' => '',
        ];
        
        return array_merge($defaults, $params);
    }
    
    /**
     * Validate required workout parameters
     *
     * @param array $params The parameters
     * @param array $required_fields Array of required field names and error messages
     * @return array Validation errors, empty if valid
     */
    public static function validate_required_workout_params($params, $required_fields) {
        $validation_errors = [];
        
        foreach ($required_fields as $field => $error_message) {
            if (empty($params[$field])) {
                $validation_errors[$field] = $error_message;
            }
        }
        
        return $validation_errors;
    }
    
    /**
     * Get workout from database
     *
     * @param int $post_id The post ID
     * @param int $user_id The user ID
     * @return array|false Workout data or false if not found/not authorized
     */
    public static function get_workout($post_id, $user_id) {
        $post = get_post($post_id);
        
        if (!$post || 
            ($post->post_type !== 'fc_workout' && $post->post_type !== 'wg_workout') || 
            $post->post_author != $user_id) {
            return false;
        }
        
        // Get the workout data
        $workout_data = get_post_meta($post_id, '_workout_data', true);
        $workout_data = $workout_data ? json_decode($workout_data, true) : [];
        
        // Get workout metadata
        $difficulty = get_post_meta($post_id, '_workout_difficulty', true);
        $duration = get_post_meta($post_id, '_workout_duration', true);
        $equipment = get_post_meta($post_id, '_workout_equipment', true);
        $goals = get_post_meta($post_id, '_workout_goals', true);
        $restrictions = get_post_meta($post_id, '_workout_restrictions', true);
        $specific_request = get_post_meta($post_id, '_workout_specific_request', true);
        
        // Get versioning metadata
        $version = (int) get_post_meta($post_id, '_workout_version', true) ?: 1;
        $last_modified = get_post_meta($post_id, '_workout_last_modified', true) ?: $post->post_modified;
        $modified_by = (int) get_post_meta($post_id, '_workout_modified_by', true) ?: $post->post_author;
        
        // Format the response
        return [
            'id' => $post_id,
            'title' => $post->post_title,
            'date' => $post->post_date,
            'modified' => $post->post_modified,
            'difficulty' => $difficulty,
            'duration' => $duration,
            'equipment' => $equipment,
            'goals' => $goals,
            'restrictions' => $restrictions,
            'specific_request' => $specific_request,
            'workout_data' => $workout_data,
            'version' => $version,
            'last_modified' => $last_modified,
            'modified_by' => $modified_by
        ];
    }
    
    /**
     * Save workout version
     *
     * @param int $post_id The post ID
     * @param int $user_id The user ID
     * @param array $state The workout state
     * @param string $change_type The type of change
     * @param string $change_summary Summary of changes
     * @return int|false New version number or false on failure
     */
    public static function save_workout_version($post_id, $user_id, $state, $change_type, $change_summary) {
        // Check if versioning service is available
        if (class_exists('\\FitCopilot\\Service\\Versioning\\VersioningService')) {
            $versioning_service = new \FitCopilot\Service\Versioning\VersioningService();
            return $versioning_service->create_workout_version_record(
                $post_id,
                $state,
                $user_id,
                $change_type,
                $change_summary
            );
        }
        
        // Fallback if versioning service is not available
        $current_version = (int) get_post_meta($post_id, '_workout_version', true) ?: 1;
        $new_version = $current_version + 1;
        $now = current_time('mysql');
        
        // Update version metadata
        update_post_meta($post_id, '_workout_version', $new_version);
        update_post_meta($post_id, '_workout_last_modified', $now);
        update_post_meta($post_id, '_workout_modified_by', $user_id);
        
        // Save version history if we have a custom table
        global $wpdb;
        $table_name = $wpdb->prefix . 'fc_workout_versions';
        
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name) {
            $wpdb->insert(
                $table_name,
                [
                    'workout_id' => $post_id,
                    'version' => $new_version,
                    'user_id' => $user_id,
                    'date_created' => $now,
                    'state' => wp_json_encode($state),
                    'change_type' => $change_type,
                    'change_summary' => $change_summary
                ]
            );
        }
        
        return $new_version;
    }
    
    /**
     * Start a database transaction
     *
     * @return bool Whether transaction was started
     */
    public static function start_transaction() {
        global $wpdb;
        
        // Check if we're in a transaction already
        if (self::in_transaction()) {
            return false;
        }
        
        // Start transaction
        $wpdb->query('START TRANSACTION');
        
        return true;
    }
    
    /**
     * Commit a database transaction
     *
     * @return bool Whether transaction was committed
     */
    public static function commit_transaction() {
        global $wpdb;
        
        // Check if we're in a transaction
        if (!self::in_transaction()) {
            return false;
        }
        
        // Commit transaction
        $wpdb->query('COMMIT');
        
        return true;
    }
    
    /**
     * Rollback a database transaction
     *
     * @return bool Whether transaction was rolled back
     */
    public static function rollback_transaction() {
        global $wpdb;
        
        // Check if we're in a transaction
        if (!self::in_transaction()) {
            return false;
        }
        
        // Rollback transaction
        $wpdb->query('ROLLBACK');
        
        return true;
    }
    
    /**
     * Check if we're in a database transaction
     *
     * @return bool Whether we're in a transaction
     */
    public static function in_transaction() {
        global $wpdb;
        
        // Check if we're in a transaction
        $in_transaction = $wpdb->get_var("SELECT @@in_transaction");
        
        return $in_transaction == 1;
    }
} 