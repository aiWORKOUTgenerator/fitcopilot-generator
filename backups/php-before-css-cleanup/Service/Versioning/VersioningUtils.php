<?php
/**
 * Versioning Utilities
 *
 * Provides utility functions for handling workout versioning across the application
 */

namespace FitCopilot\Service\Versioning;

use FitCopilot\API\APIUtils;
use FitCopilot\API\WorkoutEndpoints\Utilities;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Versioning Utilities class
 */
class VersioningUtils {
    
    /**
     * Get versioning service instance
     *
     * @return VersioningService|null VersioningService instance or null
     */
    public static function get_versioning_service() {
        if (class_exists('\\FitCopilot\\Service\\Versioning\\VersioningService')) {
            return new VersioningService();
        }
        
        return null;
    }
    
    /**
     * Get current version metadata for a workout
     *
     * @param int $workout_id Workout post ID
     * @param \WP_Post|null $post Optional post object to avoid extra query
     * @return array Version metadata including version, last_modified, and modified_by
     */
    public static function get_version_metadata($workout_id, $post = null) {
        if (!$post) {
            $post = get_post($workout_id);
        }
        
        $version = (int) get_post_meta($workout_id, '_workout_version', true) ?: 1;
        $last_modified = get_post_meta($workout_id, '_workout_last_modified', true) ?: 
                        ($post ? $post->post_modified : current_time('mysql'));
        $modified_by = (int) get_post_meta($workout_id, '_workout_modified_by', true) ?: 
                      ($post ? $post->post_author : get_current_user_id());
        
        return [
            'version' => $version,
            'last_modified' => $last_modified,
            'modified_by' => $modified_by
        ];
    }
    
    /**
     * Validate client version against current version
     *
     * @param int $workout_id Workout post ID
     * @param int|null $client_version Client-provided version
     * @param \WP_REST_Request $request The request object for ETag validation
     * @return array|false Result array on validation failure, false on success
     */
    public static function validate_client_version($workout_id, $client_version, $request) {
        // Get current version metadata
        $metadata = self::get_version_metadata($workout_id);
        $current_version = $metadata['version'];
        
        // Check If-Match header for conditional requests
        if (!APIUtils::check_if_match($current_version, $request)) {
            return [
                'response' => APIUtils::create_precondition_failed($current_version),
                'error' => 'precondition_failed'
            ];
        }
        
        // If client version is provided, validate it
        if ($client_version !== null) {
            $versioning_service = self::get_versioning_service();
            
            $validation = $versioning_service ? 
                $versioning_service->validate_workout_version($workout_id, $client_version) :
                ['valid' => ($client_version === $current_version), 
                 'current_version' => $current_version,
                 'message' => __('Version mismatch. Current version is ' . $current_version . '.', 'fitcopilot')];
            
            if (!$validation['valid']) {
                // Return conflict information
                return [
                    'response' => APIUtils::create_api_response(
                        [
                            'id' => $workout_id,
                            'current_version' => $validation['current_version'],
                            'client_version' => $client_version
                        ],
                        $validation['message'],
                        false,
                        'version_conflict',
                        409
                    ),
                    'error' => 'version_conflict'
                ];
            }
        }
        
        // Validation passed
        return false;
    }
    
    /**
     * Start a database transaction using the appropriate service
     *
     * @return VersioningService|null The service used or null
     */
    public static function start_transaction() {
        $versioning_service = self::get_versioning_service();
        
        if ($versioning_service) {
            $versioning_service->start_transaction();
        } else {
            Utilities::start_transaction();
        }
        
        return $versioning_service;
    }
    
    /**
     * Commit a database transaction using the appropriate service
     *
     * @param VersioningService|null $versioning_service The service to use or null
     */
    public static function commit_transaction($versioning_service) {
        if ($versioning_service) {
            $versioning_service->commit_transaction();
        } else {
            Utilities::commit_transaction();
        }
    }
    
    /**
     * Rollback a database transaction using the appropriate service
     *
     * @param VersioningService|null $versioning_service The service to use or null
     */
    public static function rollback_transaction($versioning_service) {
        if ($versioning_service) {
            $versioning_service->rollback_transaction();
        } else {
            Utilities::rollback_transaction();
        }
    }
    
    /**
     * Get workout state using the appropriate service
     *
     * @param int $workout_id Workout post ID
     * @param int $user_id User ID
     * @param VersioningService|null $versioning_service The service to use or null
     * @return array|null Workout state or null on failure
     */
    public static function get_workout_state($workout_id, $user_id, $versioning_service) {
        return $versioning_service ? 
            $versioning_service->get_current_workout_state($workout_id) : 
            Utilities::get_workout($workout_id, $user_id);
    }
    
    /**
     * Create a version record using the appropriate service
     *
     * @param int $workout_id Workout post ID
     * @param array $before_state Workout state before changes
     * @param int $user_id User ID
     * @param string $change_type Type of change
     * @param string $change_summary Summary of changes
     * @param VersioningService|null $versioning_service The service to use or null
     * @return int|false New version number or false on failure
     */
    public static function create_version_record($workout_id, $before_state, $user_id, $change_type, $change_summary, $versioning_service) {
        return $versioning_service ? 
            $versioning_service->create_workout_version_record(
                $workout_id,
                $before_state,
                $user_id,
                $change_type,
                $change_summary
            ) : 
            Utilities::save_workout_version(
                $workout_id,
                $user_id,
                $before_state,
                $change_type,
                $change_summary
            );
    }
} 