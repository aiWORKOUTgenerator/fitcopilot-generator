<?php
/**
 * Workout Versioning Service - Comparison Functionality
 *
 * Provides functionality for comparing workout versions.
 */

namespace FitCopilot\Service\Versioning;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class VersioningServiceCompare
 */
class VersioningServiceCompare {
    
    /**
     * Compare two versions of a workout and generate a diff
     *
     * @param int $workout_id Workout post ID
     * @param int $version1 First version number
     * @param int $version2 Second version number
     * @return array Comparison result with diff and metadata
     */
    public function compare_workout_versions($workout_id, $version1, $version2) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'fc_workout_versions';
        
        // Retrieve both versions from database
        $v1_data = $this->get_version_data($workout_id, $version1);
        $v2_data = $this->get_version_data($workout_id, $version2);
        
        if (!$v1_data || !$v2_data) {
            return [
                'error' => 'version_not_found',
                'message' => __('One or both versions could not be found', 'fitcopilot')
            ];
        }
        
        // Generate field-by-field comparison
        $diff = $this->generate_field_diff($v1_data, $v2_data);
        
        // Add metadata about the comparison
        return [
            'comparison' => [
                'workout_id' => $workout_id,
                'v1' => $version1,
                'v2' => $version2,
                'v1_created_at' => $v1_data['created_at'],
                'v2_created_at' => $v2_data['created_at'],
                'v1_author' => $this->get_author_data($v1_data['user_id']),
                'v2_author' => $this->get_author_data($v2_data['user_id']),
                'change_summary' => $this->generate_comparison_summary($diff),
                'diff' => $diff
            ]
        ];
    }
    
    /**
     * Get data for a specific version of a workout
     *
     * @param int $workout_id Workout post ID
     * @param int $version Version number
     * @return array|false Version data or false if not found
     */
    private function get_version_data($workout_id, $version) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'fc_workout_versions';
        
        $query = $wpdb->prepare(
            "SELECT * FROM $table_name WHERE workout_id = %d AND version = %d LIMIT 1",
            $workout_id,
            $version
        );
        
        $result = $wpdb->get_row($query, ARRAY_A);
        
        return $result;
    }
    
    /**
     * Get author information for a user ID
     *
     * @param int $user_id User ID
     * @return array Author data
     */
    private function get_author_data($user_id) {
        $user = get_userdata($user_id);
        
        if (!$user) {
            return [
                'id' => $user_id,
                'name' => __('Unknown User', 'fitcopilot')
            ];
        }
        
        return [
            'id' => $user_id,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'avatar' => get_avatar_url($user_id)
        ];
    }
    
    /**
     * Generate field-by-field comparison between two versions
     *
     * @param array $v1_data First version data
     * @param array $v2_data Second version data
     * @return array Diff array with changes categorized
     */
    private function generate_field_diff($v1_data, $v2_data) {
        $diff = [];
        $v1_content = json_decode($v1_data['data'], true);
        $v2_content = json_decode($v2_data['data'], true);
        
        if (!$v1_content || !$v2_content) {
            return ['error' => 'invalid_data_format'];
        }
        
        // Compare basic fields
        foreach (['title', 'content', 'status'] as $field) {
            if (isset($v1_content[$field], $v2_content[$field])) {
                if ($v1_content[$field] !== $v2_content[$field]) {
                    $diff[$field] = [
                        'type' => 'modified',
                        'old' => $v1_content[$field],
                        'new' => $v2_content[$field]
                    ];
                }
            } else if (isset($v1_content[$field]) && !isset($v2_content[$field])) {
                $diff[$field] = [
                    'type' => 'removed',
                    'old' => $v1_content[$field]
                ];
            } else if (!isset($v1_content[$field]) && isset($v2_content[$field])) {
                $diff[$field] = [
                    'type' => 'added',
                    'new' => $v2_content[$field]
                ];
            }
        }
        
        // Compare metadata fields
        if (isset($v1_content['meta'], $v2_content['meta'])) {
            $meta_diff = $this->compare_metadata($v1_content['meta'], $v2_content['meta']);
            if (!empty($meta_diff)) {
                $diff['meta'] = $meta_diff;
            }
        }
        
        return $diff;
    }
    
    /**
     * Compare metadata fields
     *
     * @param array $v1_meta First version metadata
     * @param array $v2_meta Second version metadata
     * @return array Metadata diff
     */
    private function compare_metadata($v1_meta, $v2_meta) {
        $diff = [];
        
        // Get all keys from both versions
        $all_keys = array_unique(array_merge(array_keys($v1_meta), array_keys($v2_meta)));
        
        foreach ($all_keys as $key) {
            // Handle case where field exists in both versions
            if (isset($v1_meta[$key], $v2_meta[$key])) {
                // Special handling for arrays
                if (is_array($v1_meta[$key]) && is_array($v2_meta[$key])) {
                    // Convert to JSON for comparison
                    $v1_json = json_encode($v1_meta[$key]);
                    $v2_json = json_encode($v2_meta[$key]);
                    
                    if ($v1_json !== $v2_json) {
                        $diff[$key] = [
                            'type' => 'modified',
                            'old' => $v1_meta[$key],
                            'new' => $v2_meta[$key]
                        ];
                    }
                } 
                // Simple comparison for non-array values
                else if ($v1_meta[$key] !== $v2_meta[$key]) {
                    $diff[$key] = [
                        'type' => 'modified',
                        'old' => $v1_meta[$key],
                        'new' => $v2_meta[$key]
                    ];
                }
            } 
            // Field removed
            else if (isset($v1_meta[$key]) && !isset($v2_meta[$key])) {
                $diff[$key] = [
                    'type' => 'removed',
                    'old' => $v1_meta[$key]
                ];
            } 
            // Field added
            else if (!isset($v1_meta[$key]) && isset($v2_meta[$key])) {
                $diff[$key] = [
                    'type' => 'added',
                    'new' => $v2_meta[$key]
                ];
            }
        }
        
        return $diff;
    }
    
    /**
     * Generate a summary of changes based on the diff
     *
     * @param array $diff Diff array
     * @return string Summary of changes
     */
    private function generate_comparison_summary($diff) {
        $changes = [];
        
        // Check for basic field changes
        foreach (['title', 'content', 'status'] as $field) {
            if (isset($diff[$field])) {
                $changes[] = $field;
            }
        }
        
        // Check for metadata changes
        if (isset($diff['meta'])) {
            foreach ($diff['meta'] as $key => $change) {
                // Get friendly name for metadata field
                $field_name = $this->get_friendly_field_name($key);
                $changes[] = $field_name;
            }
        }
        
        if (empty($changes)) {
            return __('No changes detected', 'fitcopilot');
        }
        
        if (count($changes) <= 3) {
            return sprintf(
                __('Changed: %s', 'fitcopilot'),
                implode(', ', $changes)
            );
        } else {
            $count = count($changes);
            return sprintf(
                __('Changed %d fields including: %s', 'fitcopilot'),
                $count,
                implode(', ', array_slice($changes, 0, 3)) . '...'
            );
        }
    }
    
    /**
     * Get friendly field name for metadata key
     *
     * @param string $key Metadata key
     * @return string Friendly field name
     */
    private function get_friendly_field_name($key) {
        $field_names = [
            '_workout_difficulty' => __('difficulty', 'fitcopilot'),
            '_workout_duration' => __('duration', 'fitcopilot'),
            '_workout_equipment' => __('equipment', 'fitcopilot'),
            '_workout_goals' => __('goals', 'fitcopilot'),
            '_workout_restrictions' => __('restrictions', 'fitcopilot'),
            '_workout_data' => __('workout data', 'fitcopilot'),
            '_workout_completions' => __('completions', 'fitcopilot'),
            '_workout_last_completed' => __('last completed date', 'fitcopilot'),
        ];
        
        return isset($field_names[$key]) ? $field_names[$key] : $key;
    }
} 