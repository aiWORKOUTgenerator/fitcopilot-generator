<?php
/**
 * Workout Versioning Service
 *
 * Provides functionality for creating and managing workout versions.
 */

namespace FitCopilot\Service\Versioning;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class VersioningService
 */
class VersioningService {
    
    /**
     * Relevant meta keys to track in version history
     * 
     * @var array
     */
    private $relevant_meta_keys = [
        // PHASE 4: New fitness-specific meta fields
        '_workout_fitness_level',
        '_workout_intensity_level',
        '_workout_exercise_complexity',
        // BACKWARD COMPATIBILITY: Keep difficulty field during transition
        '_workout_difficulty',
        '_workout_duration',
        '_workout_equipment',
        '_workout_goals',
        '_workout_restrictions',
        '_workout_data',
        '_workout_completions',
        '_workout_last_completed',
    ];
    
    /**
     * Get current workout state including all metadata
     *
     * @param int $workout_id Workout post ID
     * @return array|null Workout data or null if not found
     */
    public function get_current_workout_state($workout_id) {
        $workout = get_post($workout_id);
        
        if (!$workout || $workout->post_type !== 'fc_workout') {
            return null;
        }
        
        // Get all post meta
        $meta = get_post_meta($workout_id);
        
        // Prepare workout data
        $workout_data = [
            'id' => $workout_id,
            'title' => $workout->post_title,
            'content' => $workout->post_content,
            'status' => $workout->post_status,
            'author' => $workout->post_author,
            'modified' => $workout->post_modified,
            'meta' => [],
        ];
        
        // Include relevant meta data
        foreach ($this->relevant_meta_keys as $key) {
            if (isset($meta[$key]) && !empty($meta[$key][0])) {
                $workout_data['meta'][$key] = maybe_unserialize($meta[$key][0]);
            }
        }
        
        return $workout_data;
    }
    
    /**
     * Create a version record for a workout
     *
     * @param int $workout_id Workout post ID
     * @param array $workout_data Workout data snapshot
     * @param int $user_id User ID who made the change
     * @param string $change_type Type of change (content, metadata, settings)
     * @param string $change_summary Summary of changes made
     * @return int|false The version number or false on failure
     */
    public function create_workout_version_record($workout_id, $workout_data, $user_id, $change_type = 'update', $change_summary = '') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'fc_workout_versions';
        
        // ARCHITECTURAL FIX: Validate table exists before attempting insert
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            error_log("FitCopilot ERROR: Version table $table_name does not exist when trying to create version record for workout $workout_id");
            return false;
        }
        
        // Get the current version number
        $current_version = (int) get_post_meta($workout_id, '_workout_version', true) ?: 1;
        
        // New version will be current + 1
        $new_version = $current_version + 1;
        
        error_log("FitCopilot: Creating version record for workout $workout_id - version $current_version -> $new_version");
        
        // Insert version record with CORRECT schema (created_at, data)
        $result = $wpdb->insert(
            $table_name,
            [
                'workout_id' => $workout_id,
                'version' => $new_version,
                'user_id' => $user_id,
                'created_at' => current_time('mysql'),
                'data' => wp_json_encode($workout_data),
                'change_type' => $change_type,
                'change_summary' => $change_summary,
            ],
            [
                '%d', // workout_id
                '%d', // version
                '%d', // user_id
                '%s', // created_at
                '%s', // data
                '%s', // change_type
                '%s', // change_summary
            ]
        );
        
        if ($result === false) {
            error_log("FitCopilot ERROR: Failed to insert version record for workout $workout_id. WPDB Error: " . $wpdb->last_error);
            return false;
        }
        
        // Update workout version metadata
        update_post_meta($workout_id, '_workout_version', $new_version);
        update_post_meta($workout_id, '_workout_last_modified', current_time('mysql'));
        update_post_meta($workout_id, '_workout_modified_by', $user_id);
        
        error_log("FitCopilot SUCCESS: Created version record $new_version for workout $workout_id with change: $change_summary");
        
        return $new_version;
    }
    
    /**
     * Determine the type of change based on what was updated
     *
     * @param array $before_data Data before changes
     * @param array $after_data Data after changes
     * @return string Change type (content, metadata, settings)
     */
    public function determine_change_type($before_data, $after_data) {
        // Check for title or content changes
        if ($before_data['title'] !== $after_data['title'] || 
            $before_data['content'] !== $after_data['content']) {
            return 'content';
        }
        
        // Check for metadata changes
        $metadata_keys = ['_workout_difficulty', '_workout_duration', '_workout_equipment', 
                         '_workout_goals', '_workout_restrictions'];
        
        foreach ($metadata_keys as $key) {
            if (isset($before_data['meta'][$key], $after_data['meta'][$key]) && 
                $before_data['meta'][$key] !== $after_data['meta'][$key]) {
                return 'metadata';
            }
        }
        
        // Check for completion data changes
        if (isset($before_data['meta']['_workout_completions'], $after_data['meta']['_workout_completions']) && 
            $before_data['meta']['_workout_completions'] !== $after_data['meta']['_workout_completions']) {
            return 'completion';
        }
        
        // Default to general update
        return 'update';
    }
    
    /**
     * Generate a summary of changes between versions
     *
     * @param array $before_data Data before changes
     * @param array $after_data Data after changes
     * @return string Change summary
     */
    public function generate_change_summary($before_data, $after_data) {
        $changes = [];
        
        // Check title changes
        if ($before_data['title'] !== $after_data['title']) {
            $changes[] = 'title updated';
        }
        
        // Check content changes
        if ($before_data['content'] !== $after_data['content']) {
            $changes[] = 'content updated';
        }
        
        // Check metadata changes
        $metadata_labels = [
            '_workout_difficulty' => 'difficulty',
            '_workout_duration' => 'duration',
            '_workout_equipment' => 'equipment',
            '_workout_goals' => 'goals',
            '_workout_restrictions' => 'restrictions'
        ];
        
        foreach ($metadata_labels as $key => $label) {
            if (isset($before_data['meta'][$key], $after_data['meta'][$key]) && 
                $before_data['meta'][$key] !== $after_data['meta'][$key]) {
                $changes[] = $label . ' updated';
            }
        }
        
        // Check for completion data changes
        if (isset($before_data['meta']['_workout_completions'], $after_data['meta']['_workout_completions'])) {
            $before_count = is_array($before_data['meta']['_workout_completions']) ? 
                count($before_data['meta']['_workout_completions']) : 0;
                
            $after_count = is_array($after_data['meta']['_workout_completions']) ? 
                count($after_data['meta']['_workout_completions']) : 0;
                
            if ($after_count > $before_count) {
                $changes[] = 'workout completed';
            }
        }
        
        // Return summary
        if (empty($changes)) {
            return 'General update';
        }
        
        return implode(', ', $changes);
    }
    
    /**
     * Validate a workout version against the current version in the database
     *
     * @param int $workout_id Workout post ID
     * @param int $client_version The version to validate
     * @return array Validation result array with keys: valid, current_version, message
     */
    public function validate_workout_version($workout_id, $client_version) {
        // Get the current version from the database
        $current_version = (int) get_post_meta($workout_id, '_workout_version', true) ?: 1;
        
        // Check if the client version matches the database version
        if ($client_version !== $current_version) {
            return [
                'valid' => false,
                'current_version' => $current_version,
                'message' => sprintf(
                    __('Version conflict: Client version %d does not match server version %d.', 'fitcopilot'),
                    $client_version,
                    $current_version
                )
            ];
        }
        
        return [
            'valid' => true,
            'current_version' => $current_version,
            'message' => ''
        ];
    }
    
    /**
     * Check if a workout has changed between two states
     *
     * @param array $before_data Data before changes
     * @param array $after_data Data after changes
     * @return bool True if the workout has changed, false otherwise
     */
    public function has_workout_changed($before_data, $after_data) {
        // Check for title or content changes
        if ($before_data['title'] !== $after_data['title'] || 
            $before_data['content'] !== $after_data['content']) {
            return true;
        }
        
        // Check for metadata changes
        foreach ($this->relevant_meta_keys as $key) {
            if (isset($before_data['meta'][$key], $after_data['meta'][$key])) {
                // For array values, we need to serialize for comparison
                if (is_array($before_data['meta'][$key]) && is_array($after_data['meta'][$key])) {
                    $before_serialized = maybe_serialize($before_data['meta'][$key]);
                    $after_serialized = maybe_serialize($after_data['meta'][$key]);
                    
                    if ($before_serialized !== $after_serialized) {
                        return true;
                    }
                } 
                // For non-array values, direct comparison
                else if ($before_data['meta'][$key] !== $after_data['meta'][$key]) {
                    return true;
                }
            } else if (isset($before_data['meta'][$key]) !== isset($after_data['meta'][$key])) {
                // One state has the key, the other doesn't
                return true;
            }
        }
        
        // No changes detected
        return false;
    }
    
    /**
     * Start a database transaction
     */
    public function start_transaction() {
        global $wpdb;
        $wpdb->query('START TRANSACTION');
    }
    
    /**
     * Commit a database transaction
     */
    public function commit_transaction() {
        global $wpdb;
        $wpdb->query('COMMIT');
    }
    
    /**
     * Rollback a database transaction
     */
    public function rollback_transaction() {
        global $wpdb;
        $wpdb->query('ROLLBACK');
    }
    
    /**
     * Get workout version history with filtering
     *
     * @param int $workout_id Workout post ID
     * @param array $args {
     *     Optional. Arguments to filter version history.
     *
     *     @type int    $from_version   Minimum version number to include
     *     @type int    $to_version     Maximum version number to include
     *     @type string $from_date      Include versions created on or after this date (Y-m-d format)
     *     @type string $to_date        Include versions created on or before this date (Y-m-d format)
     *     @type int    $limit          Maximum number of versions to return
     *     @type int    $offset         Offset for pagination
     * }
     * @return array Array with 'versions' array and 'total' count
     */
    public function get_workout_version_history($workout_id, $args = []) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'fc_workout_versions';
        
        // Check if table exists
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            error_log("FitCopilot: Version history table $table_name does not exist");
            return [
                'versions' => [],
                'total' => 0,
            ];
        }
        
        // Default arguments
        $defaults = [
            'from_version' => 0,
            'to_version' => 0,
            'from_date' => '',
            'to_date' => '',
            'limit' => 10,
            'offset' => 0
        ];
        
        // Parse arguments
        $args = wp_parse_args($args, $defaults);
        
        // Base query
        $where = $wpdb->prepare("WHERE workout_id = %d", $workout_id);
        
        // Add version range filters if specified
        if ($args['from_version'] > 0) {
            $where .= $wpdb->prepare(" AND version >= %d", $args['from_version']);
        }
        
        if ($args['to_version'] > 0) {
            $where .= $wpdb->prepare(" AND version <= %d", $args['to_version']);
        }
        
        // Add date range filters if specified
        if (!empty($args['from_date'])) {
            $where .= $wpdb->prepare(" AND created_at >= %s", $args['from_date'] . ' 00:00:00');
        }
        
        if (!empty($args['to_date'])) {
            $where .= $wpdb->prepare(" AND created_at <= %s", $args['to_date'] . ' 23:59:59');
        }
        
        // Get total count for pagination
        $total_query = "SELECT COUNT(*) FROM $table_name $where";
        $total = (int) $wpdb->get_var($total_query);
        
        // Get versions with limit and offset
        $query = "SELECT * FROM $table_name $where ORDER BY version DESC LIMIT %d OFFSET %d";
        $query = $wpdb->prepare($query, $args['limit'], $args['offset']);
        
        $raw_versions = $wpdb->get_results($query, ARRAY_A);
        
        // Transform versions for API response
        $versions = [];
        if ($raw_versions) {
            foreach ($raw_versions as $version) {
                $versions[] = [
                    'version' => (int) $version['version'],
                    'user_id' => (int) $version['user_id'],
                    'created_at' => $version['created_at'],
                    'change_type' => $version['change_type'],
                    'change_summary' => $version['change_summary'],
                    // Don't include full data in list view for performance
                    'has_data' => !empty($version['data'])
                ];
            }
        }
        
        error_log("FitCopilot: Version history query for workout $workout_id returned " . count($versions) . " versions");
        
        // Return results
        return [
            'versions' => $versions,
            'total' => $total,
        ];
    }
    
    /**
     * Compare two versions of a workout and generate a diff
     *
     * @param int $workout_id Workout post ID
     * @param int $version1 First version number
     * @param int $version2 Second version number
     * @return array Comparison result with diff and metadata
     */
    public function compare_workout_versions($workout_id, $version1, $version2) {
        $compare_service = new VersioningServiceCompare();
        return $compare_service->compare_workout_versions($workout_id, $version1, $version2);
    }
} 