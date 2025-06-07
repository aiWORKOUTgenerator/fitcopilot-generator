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
        
        // Get the workout data with defensive programming
        $workout_data_raw = get_post_meta($post_id, '_workout_data', true);
        $workout_data = [];
        
        if ($workout_data_raw) {
            $decoded = json_decode($workout_data_raw, true);
            
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                // Detect and normalize different data formats
                $workout_data = self::normalize_workout_data($decoded, $post_id);
            } else {
                error_log("FitCopilot: Invalid JSON in _workout_data for post {$post_id}: " . json_last_error_msg());
                $workout_data = self::get_default_workout_data();
            }
        } else {
            // No workout data found - use default empty structure
            $workout_data = self::get_default_workout_data();
        }
        
        // Get workout metadata
        $difficulty = get_post_meta($post_id, '_workout_difficulty', true);
        $duration = get_post_meta($post_id, '_workout_duration', true);
        $equipment = get_post_meta($post_id, '_workout_equipment', true);
        $goals = get_post_meta($post_id, '_workout_goals', true);
        $restrictions = get_post_meta($post_id, '_workout_restrictions', true);
        $specific_request = get_post_meta($post_id, '_workout_specific_request', true);
        
        // Get session inputs
        $session_inputs_raw = get_post_meta($post_id, '_workout_session_inputs', true);
        $session_inputs = [];
        if ($session_inputs_raw) {
            $decoded = json_decode($session_inputs_raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $session_inputs = $decoded;
            }
        }
        
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
            'sessionInputs' => $session_inputs,
            'version' => $version,
            'last_modified' => $last_modified,
            'modified_by' => $modified_by
        ];
    }
    
    /**
     * Normalize workout data to consistent format
     * Handles different data structures gracefully
     *
     * @param array $data The decoded workout data
     * @param int $post_id The post ID for logging
     * @return array Normalized workout data
     */
    private static function normalize_workout_data($data, $post_id) {
        // Format 1: Full workout object from AI (GenerateEndpoint)
        // Expected keys: title, exercises, sections, duration, etc.
        if (isset($data['title']) && isset($data['exercises']) && is_array($data['exercises'])) {
            error_log("FitCopilot: Workout {$post_id} using AI-generated format");
            return [
                'title' => $data['title'],
                'exercises' => $data['exercises'],
                'sections' => $data['sections'] ?? [],
                'duration' => $data['duration'] ?? null,
                'difficulty' => $data['difficulty'] ?? null,
                'equipment' => $data['equipment'] ?? [],
                'metadata' => [
                    'format' => 'ai_generated',
                    'normalized_at' => current_time('mysql')
                ]
            ];
        }
        
        // Format 2: Wrapped exercises format (WorkoutRetrievalEndpoint create)
        // Expected keys: exercises, possibly sections
        if (isset($data['exercises']) && is_array($data['exercises']) && !isset($data['title'])) {
            error_log("FitCopilot: Workout {$post_id} using exercises wrapper format");
            return [
                'title' => '', // Will be populated from post_title
                'exercises' => $data['exercises'],
                'sections' => $data['sections'] ?? [],
                'metadata' => [
                    'format' => 'exercises_wrapper',
                    'normalized_at' => current_time('mysql')
                ]
            ];
        }
        
        // Format 3: Legacy or custom format - try to extract what we can
        if (is_array($data)) {
            error_log("FitCopilot: Workout {$post_id} using unknown format, attempting extraction. Keys: " . implode(', ', array_keys($data)));
            
            // Try to find exercises in various possible locations
            $exercises = [];
            if (isset($data['exercises'])) {
                $exercises = is_array($data['exercises']) ? $data['exercises'] : [];
            } elseif (isset($data['workout']) && isset($data['workout']['exercises'])) {
                $exercises = is_array($data['workout']['exercises']) ? $data['workout']['exercises'] : [];
            }
            
            return [
                'title' => $data['title'] ?? '',
                'exercises' => $exercises,
                'sections' => $data['sections'] ?? [],
                'metadata' => [
                    'format' => 'unknown_extracted',
                    'original_keys' => array_keys($data),
                    'normalized_at' => current_time('mysql')
                ]
            ];
        }
        
        // Format 4: Completely unknown - return safe default
        error_log("FitCopilot: Workout {$post_id} has unrecognizable data format: " . print_r($data, true));
        return self::get_default_workout_data();
    }
    
    /**
     * Get default workout data structure
     *
     * @return array Default workout data
     */
    private static function get_default_workout_data() {
        return [
            'title' => '',
            'exercises' => [],
            'sections' => [],
            'metadata' => [
                'format' => 'default_fallback',
                'created_at' => current_time('mysql')
            ]
        ];
    }
    
    /**
     * Save a workout version record
     *
     * @param int $post_id The post ID
     * @param int $user_id The user ID
     * @param array $state The workout state
     * @param string $change_type The type of change
     * @param string $change_summary Summary of changes
     * @return int|false New version number or false on failure
     */
    public static function save_workout_version($post_id, $user_id, $state, $change_type, $change_summary) {
        // ARCHITECTURAL FIX: Always use VersioningService as the single source of truth
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
        
        // CRITICAL ERROR: VersioningService should always be available
        error_log("FitCopilot CRITICAL ERROR: VersioningService class not found! Version record not created for workout $post_id");
        
        // Fallback: Only update version metadata without creating version record
        $current_version = (int) get_post_meta($post_id, '_workout_version', true) ?: 1;
        $new_version = $current_version + 1;
        $now = current_time('mysql');
        
        // Update version metadata
        update_post_meta($post_id, '_workout_version', $new_version);
        update_post_meta($post_id, '_workout_last_modified', $now);
        update_post_meta($post_id, '_workout_modified_by', $user_id);
        
        error_log("FitCopilot: Version metadata updated to $new_version for workout $post_id (no version record created)");
        
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
    
    /**
     * Debug method to analyze workout data formats across all workouts
     * Useful for monitoring data consistency and identifying issues
     *
     * @param int $limit Number of workouts to analyze (default: 10)
     * @return array Analysis results
     */
    public static function analyze_workout_data_formats($limit = 10) {
        $analysis = [
            'total_analyzed' => 0,
            'formats_found' => [],
            'issues' => [],
            'recommendations' => []
        ];
        
        $workouts = get_posts([
            'post_type' => ['fc_workout', 'wg_workout'],
            'numberposts' => $limit,
            'post_status' => 'any'
        ]);
        
        foreach ($workouts as $workout) {
            $analysis['total_analyzed']++;
            
            $workout_data_raw = get_post_meta($workout->ID, '_workout_data', true);
            
            if (empty($workout_data_raw)) {
                $analysis['issues'][] = "Workout {$workout->ID}: No _workout_data found";
                continue;
            }
            
            $decoded = json_decode($workout_data_raw, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $analysis['issues'][] = "Workout {$workout->ID}: Invalid JSON - " . json_last_error_msg();
                continue;
            }
            
            if (!is_array($decoded)) {
                $analysis['issues'][] = "Workout {$workout->ID}: Data is not an array";
                continue;
            }
            
            // Determine format
            $format = 'unknown';
            if (isset($decoded['title']) && isset($decoded['exercises'])) {
                $format = 'ai_generated';
            } elseif (isset($decoded['exercises']) && !isset($decoded['title'])) {
                $format = 'exercises_wrapper';
            } elseif (is_array($decoded)) {
                $format = 'custom_format';
            }
            
            if (!isset($analysis['formats_found'][$format])) {
                $analysis['formats_found'][$format] = [];
            }
            
            $analysis['formats_found'][$format][] = [
                'workout_id' => $workout->ID,
                'keys' => array_keys($decoded),
                'title' => $workout->post_title
            ];
        }
        
        // Generate recommendations
        if (count($analysis['formats_found']) > 1) {
            $analysis['recommendations'][] = "Multiple data formats detected - consider standardizing";
        }
        
        if (!empty($analysis['issues'])) {
            $analysis['recommendations'][] = "Fix JSON/data issues before proceeding";
        }
        
        return $analysis;
    }
} 