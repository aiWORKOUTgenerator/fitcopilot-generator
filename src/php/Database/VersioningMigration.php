<?php
/**
 * Workout Versioning Migration
 *
 * Manual migration script for workout versioning.
 */

namespace FitCopilot\Database;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class VersioningMigration
 */
class VersioningMigration {
    
    /**
     * Initialize migration
     */
    public function __construct() {
        // Add admin menu page
        add_action('admin_menu', [$this, 'add_migration_page']);
    }
    
    /**
     * Add migration admin page
     */
    public function add_migration_page() {
        add_submenu_page(
            'edit.php?post_type=fc_workout',
            __('Versioning Migration', 'fitcopilot'),
            __('Versioning Migration', 'fitcopilot'),
            'manage_options',
            'fitcopilot-versioning-migration',
            [$this, 'render_migration_page']
        );
    }
    
    /**
     * Render migration page
     */
    public function render_migration_page() {
        // Handle form submission
        $migration_status = '';
        if (isset($_POST['fitcopilot_run_migration']) && check_admin_referer('fitcopilot_versioning_migration')) {
            $migration_status = $this->run_migration();
        }
        
        // Check if migration has already been run
        $migration_complete = get_option('fc_workout_version_migration_complete', false);
        
        // Render page
        ?>
        <div class="wrap">
            <h1><?php _e('Workout Versioning Migration', 'fitcopilot'); ?></h1>
            
            <?php if ($migration_status): ?>
                <div class="notice notice-<?php echo $migration_status['type']; ?> is-dismissible">
                    <p><?php echo $migration_status['message']; ?></p>
                </div>
            <?php endif; ?>
            
            <div class="card">
                <h2><?php _e('Migration Status', 'fitcopilot'); ?></h2>
                <?php if ($migration_complete): ?>
                    <p><?php _e('The versioning migration has already been completed.', 'fitcopilot'); ?></p>
                    <p>
                        <button class="button" onclick="return confirm('<?php _e('Are you sure you want to reset the migration status? This will not remove any data.', 'fitcopilot'); ?>');">
                            <?php _e('Reset Migration Status', 'fitcopilot'); ?>
                        </button>
                    </p>
                <?php else: ?>
                    <p><?php _e('The versioning migration has not been run yet. This migration will add version tracking to all existing workouts.', 'fitcopilot'); ?></p>
                    
                    <form method="post" action="">
                        <?php wp_nonce_field('fitcopilot_versioning_migration'); ?>
                        <p>
                            <button type="submit" name="fitcopilot_run_migration" class="button button-primary">
                                <?php _e('Run Migration', 'fitcopilot'); ?>
                            </button>
                        </p>
                    </form>
                <?php endif; ?>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h2><?php _e('What This Migration Does', 'fitcopilot'); ?></h2>
                <p><?php _e('This migration performs the following operations:', 'fitcopilot'); ?></p>
                <ol>
                    <li><?php _e('Creates the workout_versions table if it doesn\'t exist', 'fitcopilot'); ?></li>
                    <li><?php _e('Adds version tracking fields to all existing workouts (_workout_version, _workout_last_modified, _workout_modified_by)', 'fitcopilot'); ?></li>
                    <li><?php _e('Creates initial version records for all existing workouts', 'fitcopilot'); ?></li>
                </ol>
            </div>
        </div>
        <?php
    }
    
    /**
     * Run migration
     *
     * @return array Migration status
     */
    private function run_migration() {
        global $wpdb;
        
        try {
            // First make sure the table exists
            $versioning_schema = new VersioningSchema();
            $versioning_schema->create_tables();
            
            // Clear the migration flag to force re-migration
            delete_option('fc_workout_version_migration_complete');
            
            // Run the migration
            $versioning_schema->maybe_migrate_existing_workouts();
            
            // Count migrated records
            $table_name = $wpdb->prefix . 'fc_workout_versions';
            $records_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
            
            return [
                'type' => 'success',
                'message' => sprintf(
                    __('Migration completed successfully. %d workout version records created.', 'fitcopilot'),
                    $records_count
                )
            ];
        } catch (\Exception $e) {
            return [
                'type' => 'error',
                'message' => sprintf(
                    __('Migration failed: %s', 'fitcopilot'),
                    $e->getMessage()
                )
            ];
        }
    }
}

// Initialize migration
new VersioningMigration(); 