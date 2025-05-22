<?php
/**
 * Workout Versioning Schema
 *
 * Handles database schema creation and updates for workout versioning.
 */

namespace FitCopilot\Database;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class VersioningSchema
 */
class VersioningSchema {
    
    /**
     * Initialize schema and hooks
     */
    public function __construct() {
        // Register activation hook for creating tables
        register_activation_hook(\FITCOPILOT_FILE, [$this, 'create_tables']);
        
        // Add version fields to fc_workout post type
        add_action('init', [$this, 'register_version_meta_fields']);
        
        // Hook to run migration for existing workouts
        add_action('admin_init', [$this, 'maybe_migrate_existing_workouts']);
    }
    
    /**
     * Create database tables for versioning
     */
    public function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'fc_workout_versions';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            workout_id bigint(20) unsigned NOT NULL,
            version int(11) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            data longtext NOT NULL,
            change_type varchar(50) DEFAULT NULL,
            change_summary text DEFAULT NULL,
            PRIMARY KEY  (id),
            KEY workout_id (workout_id),
            KEY version (version)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Register versioning meta fields for workout post type
     */
    public function register_version_meta_fields() {
        register_post_meta(
            'fc_workout',
            '_workout_version',
            [
                'type' => 'integer',
                'description' => __('Workout version number', 'fitcopilot'),
                'single' => true,
                'default' => 1,
                'show_in_rest' => true,
            ]
        );
        
        register_post_meta(
            'fc_workout',
            '_workout_last_modified',
            [
                'type' => 'string',
                'description' => __('Workout last modified timestamp', 'fitcopilot'),
                'single' => true,
                'default' => current_time('mysql'),
                'show_in_rest' => true,
            ]
        );
        
        register_post_meta(
            'fc_workout',
            '_workout_modified_by',
            [
                'type' => 'integer',
                'description' => __('User ID who last modified the workout', 'fitcopilot'),
                'single' => true,
                'default' => 0,
                'show_in_rest' => true,
            ]
        );
    }
    
    /**
     * Migrate existing workouts to include version data
     */
    public function maybe_migrate_existing_workouts() {
        // Check if migration has been performed
        if (get_option('fc_workout_version_migration_complete')) {
            return;
        }
        
        global $wpdb;
        
        // Get all existing workouts without version data
        $workout_ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT ID FROM $wpdb->posts p
                LEFT JOIN $wpdb->postmeta pm ON p.ID = pm.post_id AND pm.meta_key = %s
                WHERE p.post_type = %s AND pm.meta_value IS NULL",
                '_workout_version',
                'fc_workout'
            )
        );
        
        // Initialize version data for each workout
        if (!empty($workout_ids)) {
            foreach ($workout_ids as $workout_id) {
                // Set initial version to 1
                update_post_meta($workout_id, '_workout_version', 1);
                
                // Set initial last_modified time to post_modified
                $post_modified = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT post_modified FROM $wpdb->posts WHERE ID = %d",
                        $workout_id
                    )
                );
                update_post_meta($workout_id, '_workout_last_modified', $post_modified);
                
                // Set initial modified_by to post_author
                $post_author = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT post_author FROM $wpdb->posts WHERE ID = %d",
                        $workout_id
                    )
                );
                update_post_meta($workout_id, '_workout_modified_by', $post_author);
                
                // Create initial version record
                $this->create_initial_version_record($workout_id, $post_author);
            }
        }
        
        // Mark migration as complete
        update_option('fc_workout_version_migration_complete', true);
    }
    
    /**
     * Create initial version record for an existing workout
     *
     * @param int $workout_id Workout post ID
     * @param int $user_id User ID who created the workout
     */
    private function create_initial_version_record($workout_id, $user_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'fc_workout_versions';
        
        // Gather all workout data
        $workout = get_post($workout_id);
        
        if (!$workout) {
            return;
        }
        
        // Get all post meta
        $meta = get_post_meta($workout_id);
        
        // Prepare data to store as version record
        $workout_data = [
            'id' => $workout_id,
            'title' => $workout->post_title,
            'content' => $workout->post_content,
            'meta' => [],
        ];
        
        // Include relevant meta data
        $relevant_meta_keys = [
            '_workout_difficulty',
            '_workout_duration',
            '_workout_equipment',
            '_workout_goals',
            '_workout_restrictions',
            '_workout_data',
        ];
        
        foreach ($relevant_meta_keys as $key) {
            if (isset($meta[$key]) && !empty($meta[$key][0])) {
                $workout_data['meta'][$key] = maybe_unserialize($meta[$key][0]);
            }
        }
        
        // Insert version record
        $wpdb->insert(
            $table_name,
            [
                'workout_id' => $workout_id,
                'version' => 1,
                'user_id' => $user_id,
                'created_at' => $workout->post_modified,
                'data' => wp_json_encode($workout_data),
                'change_type' => 'initial',
                'change_summary' => 'Initial version',
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
    }
}

// Initialize the versioning schema
new VersioningSchema(); 