<?php
/**
 * Workout Data Migration Script v1.0
 * Migrates all workout data to standard format version 1.0
 * 
 * Usage: 
 *   wp eval-file wp-content/plugins/Fitcopilot-Generator/scripts/migrate-workout-data.php
 *   wp eval-file wp-content/plugins/Fitcopilot-Generator/scripts/migrate-workout-data.php --dry-run
 */

// Ensure WordPress is loaded
if (!defined('ABSPATH')) {
    echo "Error: This script must be run through WP-CLI\n";
    exit(1);
}

class WorkoutDataMigrator {
    
    const CURRENT_FORMAT_VERSION = '1.0';
    
    private $dry_run = false;
    private $batch_size = 50;
    private $stats = [
        'total_processed' => 0,
        'migrated' => 0,
        'already_standard' => 0,
        'errors' => 0,
        'skipped' => 0
    ];
    
    public function __construct($dry_run = false) {
        $this->dry_run = $dry_run;
        if ($dry_run) {
            echo "🔍 DRY RUN MODE - No data will be changed\n";
        }
    }
    
    public function run() {
        echo "🚀 Starting Workout Data Migration to Standard Format v1.0\n";
        echo "📊 Batch Size: {$this->batch_size}\n";
        echo "⏰ Migration Date: " . date('Y-m-d H:i:s') . "\n\n";
        
        $workouts = $this->get_workouts_to_migrate();
        $total = count($workouts);
        
        echo "📋 Found {$total} workouts to process\n\n";
        
        if ($total === 0) {
            echo "✅ No workouts found to migrate\n";
            return;
        }
        
        $batches = array_chunk($workouts, $this->batch_size);
        
        foreach ($batches as $batch_num => $batch) {
            $batch_number = $batch_num + 1;
            echo "🔄 Processing Batch {$batch_number}/" . count($batches) . " (" . count($batch) . " workouts)\n";
            
            foreach ($batch as $workout) {
                $this->migrate_workout($workout);
            }
            
            // Small delay between batches to prevent overload
            if ($batch_number < count($batches)) {
                echo "   ⏸️  Pausing 0.1s between batches...\n";
                usleep(100000); // 0.1 seconds
            }
            echo "\n";
        }
        
        $this->print_summary();
    }
    
    private function get_workouts_to_migrate() {
        global $wpdb;
        
        return $wpdb->get_results("
            SELECT p.ID, p.post_title, p.post_date, pm.meta_value as workout_data
            FROM {$wpdb->posts} p
            LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = '_workout_data'
            WHERE p.post_type = 'fc_workout'
            AND p.post_status != 'trash'
            ORDER BY p.ID ASC
        ");
    }
    
    private function migrate_workout($workout) {
        $this->stats['total_processed']++;
        
        try {
            if (empty($workout->workout_data)) {
                echo "  ⚠️  Workout {$workout->ID}: No data to migrate\n";
                $this->stats['skipped']++;
                return;
            }
            
            $current_data = json_decode($workout->workout_data, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo "  ❌ Workout {$workout->ID}: Invalid JSON - " . json_last_error_msg() . "\n";
                $this->stats['errors']++;
                return;
            }
            
            // Check if already in standard format
            if (isset($current_data['metadata']['format_version']) && 
                $current_data['metadata']['format_version'] === self::CURRENT_FORMAT_VERSION) {
                echo "  ✅ Workout {$workout->ID}: Already in standard format\n";
                $this->stats['already_standard']++;
                return;
            }
            
            // Perform migration
            $migrated_data = $this->convert_to_standard_format($current_data, $workout);
            
            if (!$this->dry_run) {
                $success = update_post_meta(
                    $workout->ID, 
                    '_workout_data', 
                    wp_json_encode($migrated_data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
                );
                
                if ($success !== false) {
                    echo "  🔄 Workout {$workout->ID}: Migrated successfully ({$this->detect_original_format($current_data)})\n";
                    $this->stats['migrated']++;
                    
                    // Also update a migration log meta field
                    update_post_meta($workout->ID, '_migration_log', [
                        'migrated_at' => current_time('mysql'),
                        'original_format' => $this->detect_original_format($current_data),
                        'migration_version' => '1.0'
                    ]);
                } else {
                    echo "  ❌ Workout {$workout->ID}: Failed to save migrated data\n";
                    $this->stats['errors']++;
                }
            } else {
                echo "  🔍 Workout {$workout->ID}: Would migrate ({$this->detect_original_format($current_data)} → standard_v1)\n";
                $this->stats['migrated']++;
            }
            
        } catch (Exception $e) {
            echo "  ❌ Workout {$workout->ID}: Exception - " . $e->getMessage() . "\n";
            $this->stats['errors']++;
        }
    }
    
    private function convert_to_standard_format($data, $workout) {
        $standard = [
            'title' => '',
            'exercises' => [],
            'sections' => [],
            'duration' => null,
            'difficulty' => 'intermediate',
            'equipment' => [],
            'goals' => [],
            'restrictions' => '',
            'metadata' => [
                'format_version' => self::CURRENT_FORMAT_VERSION,
                'migrated_at' => current_time('mysql'),
                'original_format' => $this->detect_original_format($data),
                'migration_script_version' => '1.0'
            ]
        ];
        
        // Extract title
        if (isset($data['title'])) {
            $standard['title'] = $data['title'];
        } else {
            $standard['title'] = $workout->post_title ?? 'Untitled Workout';
        }
        
        // Extract exercises - handle different formats
        if (isset($data['exercises']) && is_array($data['exercises'])) {
            $standard['exercises'] = $this->normalize_exercises($data['exercises']);
        } elseif (is_array($data) && isset($data[0]) && is_array($data[0])) {
            // Direct exercise array format
            $standard['exercises'] = $this->normalize_exercises($data);
        }
        
        // Extract sections
        if (isset($data['sections']) && is_array($data['sections'])) {
            $standard['sections'] = $data['sections'];
        }
        
        // Extract metadata and preserve what exists
        if (isset($data['metadata']) && is_array($data['metadata'])) {
            $standard['metadata'] = array_merge($standard['metadata'], $data['metadata']);
        }
        
        // Extract other standard fields
        $fields_to_copy = ['duration', 'difficulty', 'equipment', 'goals', 'restrictions'];
        foreach ($fields_to_copy as $field) {
            if (isset($data[$field])) {
                $standard[$field] = $data[$field];
            }
        }
        
        // Add creation date if missing
        if (!isset($standard['metadata']['created_at'])) {
            $standard['metadata']['created_at'] = $workout->post_date;
        }
        
        // Ensure format version is set correctly
        $standard['metadata']['format_version'] = self::CURRENT_FORMAT_VERSION;
        
        return $standard;
    }
    
    private function normalize_exercises($exercises) {
        $normalized = [];
        
        foreach ($exercises as $exercise) {
            if (!is_array($exercise)) {
                continue;
            }
            
            // Ensure all exercises have required fields
            $normalized_exercise = [
                'name' => $exercise['name'] ?? 'Unknown Exercise',
                'sets' => $exercise['sets'] ?? null,
                'reps' => $exercise['reps'] ?? null,
                'weight' => $exercise['weight'] ?? null,
                'duration' => $exercise['duration'] ?? null,
                'rest' => $exercise['rest'] ?? null
            ];
            
            // Copy over any additional fields
            foreach ($exercise as $key => $value) {
                if (!isset($normalized_exercise[$key])) {
                    $normalized_exercise[$key] = $value;
                }
            }
            
            $normalized[] = $normalized_exercise;
        }
        
        return $normalized;
    }
    
    private function detect_original_format($data) {
        if (isset($data['title']) && isset($data['exercises']) && isset($data['metadata'])) {
            return 'ai_generated_legacy';
        } elseif (isset($data['exercises']) && !isset($data['title'])) {
            return 'exercises_wrapper';
        } elseif (is_array($data) && isset($data[0]) && is_array($data[0])) {
            return 'exercise_array';
        } elseif (is_array($data) && !empty($data)) {
            return 'custom_legacy';
        } else {
            return 'unknown';
        }
    }
    
    private function print_summary() {
        echo "📊 MIGRATION SUMMARY\n";
        echo "==================\n";
        echo "Total Processed: {$this->stats['total_processed']}\n";
        echo "Migrated: {$this->stats['migrated']}\n";
        echo "Already Standard: {$this->stats['already_standard']}\n";
        echo "Errors: {$this->stats['errors']}\n";
        echo "Skipped: {$this->stats['skipped']}\n";
        
        if ($this->stats['total_processed'] > 0) {
            $success_rate = round((($this->stats['migrated'] + $this->stats['already_standard']) / $this->stats['total_processed']) * 100, 1);
            echo "Success Rate: {$success_rate}%\n";
        }
        
        if ($this->dry_run) {
            echo "\n🔍 This was a DRY RUN - no changes were made\n";
            echo "To perform actual migration, run without --dry-run flag\n";
        } else {
            echo "\n✅ Migration completed!\n";
            
            if ($this->stats['errors'] > 0) {
                echo "⚠️  Some workouts had errors - check output above for details\n";
            }
            
            echo "\n🔍 Verification steps:\n";
            echo "1. Run audit again: wp eval-file scripts/audit-workout-data.php\n";
            echo "2. Test frontend functionality\n";
            echo "3. Check WordPress admin for any issues\n";
        }
    }
}

// Parse command line arguments
$args = $_SERVER['argv'] ?? [];
$dry_run = in_array('--dry-run', $args) || in_array('-n', $args);

// Run migration
echo "🏃‍♂️ FITCOPILOT WORKOUT DATA MIGRATION\n";
echo "====================================\n\n";

try {
    $migrator = new WorkoutDataMigrator($dry_run);
    $migrator->run();
} catch (Exception $e) {
    echo "\n💥 MIGRATION FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
} 