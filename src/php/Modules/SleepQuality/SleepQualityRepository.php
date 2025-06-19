<?php
/**
 * SleepQuality Repository
 * 
 * Data access layer for sleep quality management.
 * Handles all database operations for sleep quality data.
 */

namespace FitCopilot\Modules\SleepQuality;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SleepQuality Repository Class
 * 
 * Manages sleep quality data persistence and retrieval
 */
class SleepQualityRepository {
    
    /**
     * User meta key for current sleep quality
     */
    const CURRENT_SLEEP_QUALITY_KEY = '_sleep_quality_current';
    
    /**
     * User meta key for sleep quality history
     */
    const SLEEP_QUALITY_HISTORY_KEY = '_sleep_quality_history';
    
    /**
     * User meta key for sleep quality preferences
     */
    const SLEEP_QUALITY_PREFERENCES_KEY = '_sleep_quality_preferences';
    
    /**
     * Maximum history entries to keep
     */
    const MAX_HISTORY_ENTRIES = 30;
    
    /**
     * Save user's current sleep quality
     *
     * @param int $user_id User ID
     * @param array $sleep_data Sleep quality data
     * @return bool Success status
     */
    public function saveSleepQuality(int $user_id, array $sleep_data): bool {
        try {
            // Save current sleep quality
            $current_saved = update_user_meta($user_id, self::CURRENT_SLEEP_QUALITY_KEY, $sleep_data);
            
            // Add to history
            $this->addToHistory($user_id, $sleep_data);
            
            // Clean up old history entries
            $this->cleanupHistory($user_id);
            
            error_log("[SleepQualityRepository] Sleep quality saved for user {$user_id}");
            return $current_saved !== false;
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error saving sleep quality: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get user's current sleep quality
     *
     * @param int $user_id User ID
     * @return array|null Sleep quality data
     */
    public function getSleepQuality(int $user_id): ?array {
        try {
            $sleep_data = get_user_meta($user_id, self::CURRENT_SLEEP_QUALITY_KEY, true);
            
            if (empty($sleep_data) || !is_array($sleep_data)) {
                return null;
            }
            
            // Check if data is from today (sleep quality is daily)
            $saved_date = date('Y-m-d', strtotime($sleep_data['timestamp'] ?? ''));
            $today = date('Y-m-d');
            
            if ($saved_date !== $today) {
                // Data is from previous day, return null to prompt new selection
                return null;
            }
            
            return $sleep_data;
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error getting sleep quality: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get sleep quality history for a user
     *
     * @param int $user_id User ID
     * @param int $days Number of days to retrieve (default 7)
     * @return array Sleep quality history
     */
    public function getSleepQualityHistory(int $user_id, int $days = 7): array {
        try {
            $history = get_user_meta($user_id, self::SLEEP_QUALITY_HISTORY_KEY, true);
            
            if (empty($history) || !is_array($history)) {
                return [];
            }
            
            // Filter by date range
            $cutoff_date = date('Y-m-d', strtotime("-{$days} days"));
            
            return array_filter($history, function($entry) use ($cutoff_date) {
                $entry_date = date('Y-m-d', strtotime($entry['timestamp'] ?? ''));
                return $entry_date >= $cutoff_date;
            });
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error getting sleep quality history: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Save user's sleep quality preferences
     *
     * @param int $user_id User ID
     * @param array $preferences Sleep quality preferences
     * @return bool Success status
     */
    public function saveSleepQualityPreferences(int $user_id, array $preferences): bool {
        try {
            $sanitized_preferences = $this->sanitizePreferences($preferences);
            return update_user_meta($user_id, self::SLEEP_QUALITY_PREFERENCES_KEY, $sanitized_preferences) !== false;
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error saving sleep quality preferences: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get user's sleep quality preferences
     *
     * @param int $user_id User ID
     * @return array Sleep quality preferences
     */
    public function getSleepQualityPreferences(int $user_id): array {
        try {
            $preferences = get_user_meta($user_id, self::SLEEP_QUALITY_PREFERENCES_KEY, true);
            
            return is_array($preferences) ? $preferences : $this->getDefaultPreferences();
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error getting sleep quality preferences: " . $e->getMessage());
            return $this->getDefaultPreferences();
        }
    }
    
    /**
     * Delete user's sleep quality data
     *
     * @param int $user_id User ID
     * @return bool Success status
     */
    public function deleteSleepQualityData(int $user_id): bool {
        try {
            $current_deleted = delete_user_meta($user_id, self::CURRENT_SLEEP_QUALITY_KEY);
            $history_deleted = delete_user_meta($user_id, self::SLEEP_QUALITY_HISTORY_KEY);
            $preferences_deleted = delete_user_meta($user_id, self::SLEEP_QUALITY_PREFERENCES_KEY);
            
            return $current_deleted || $history_deleted || $preferences_deleted;
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error deleting sleep quality data: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get sleep quality statistics across all users (admin functionality)
     *
     * @param int $days Number of days to analyze
     * @return array Sleep quality statistics
     */
    public function getGlobalSleepQualityStats(int $days = 7): array {
        global $wpdb;
        
        try {
            $cutoff_date = date('Y-m-d', strtotime("-{$days} days"));
            
            // Get all users' current sleep quality data
            $results = $wpdb->get_results($wpdb->prepare("
                SELECT user_id, meta_value 
                FROM {$wpdb->usermeta} 
                WHERE meta_key = %s
            ", self::CURRENT_SLEEP_QUALITY_KEY));
            
            $stats = [
                'total_users' => 0,
                'average_sleep_quality' => 0,
                'distribution' => [],
                'active_users_today' => 0
            ];
            
            $today = date('Y-m-d');
            $total_quality = 0;
            $valid_entries = 0;
            
            foreach ($results as $result) {
                $sleep_data = maybe_unserialize($result->meta_value);
                
                if (!is_array($sleep_data) || empty($sleep_data['level'])) {
                    continue;
                }
                
                $stats['total_users']++;
                
                // Check if entry is from today
                $entry_date = date('Y-m-d', strtotime($sleep_data['timestamp'] ?? ''));
                if ($entry_date === $today) {
                    $stats['active_users_today']++;
                }
                
                // Add to statistics if recent enough
                if ($entry_date >= $cutoff_date) {
                    $level = intval($sleep_data['level']);
                    $total_quality += $level;
                    $valid_entries++;
                    
                    if (!isset($stats['distribution'][$level])) {
                        $stats['distribution'][$level] = 0;
                    }
                    $stats['distribution'][$level]++;
                }
            }
            
            if ($valid_entries > 0) {
                $stats['average_sleep_quality'] = round($total_quality / $valid_entries, 1);
            }
            
            return $stats;
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error getting global sleep quality stats: " . $e->getMessage());
            return [
                'total_users' => 0,
                'average_sleep_quality' => 0,
                'distribution' => [],
                'active_users_today' => 0,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Add entry to sleep quality history
     *
     * @param int $user_id User ID
     * @param array $sleep_data Sleep quality data
     * @return void
     */
    private function addToHistory(int $user_id, array $sleep_data): void {
        $history = get_user_meta($user_id, self::SLEEP_QUALITY_HISTORY_KEY, true);
        
        if (!is_array($history)) {
            $history = [];
        }
        
        // Add new entry with date as key to prevent duplicates for the same day
        $date_key = date('Y-m-d', strtotime($sleep_data['timestamp']));
        $history[$date_key] = $sleep_data;
        
        // Sort by date (newest first)
        krsort($history);
        
        update_user_meta($user_id, self::SLEEP_QUALITY_HISTORY_KEY, $history);
    }
    
    /**
     * Clean up old history entries
     *
     * @param int $user_id User ID
     * @return void
     */
    private function cleanupHistory(int $user_id): void {
        $history = get_user_meta($user_id, self::SLEEP_QUALITY_HISTORY_KEY, true);
        
        if (!is_array($history) || count($history) <= self::MAX_HISTORY_ENTRIES) {
            return;
        }
        
        // Keep only the most recent entries
        $history = array_slice($history, 0, self::MAX_HISTORY_ENTRIES, true);
        
        update_user_meta($user_id, self::SLEEP_QUALITY_HISTORY_KEY, $history);
    }
    
    /**
     * Sanitize sleep quality preferences
     *
     * @param array $preferences Raw preferences data
     * @return array Sanitized preferences
     */
    private function sanitizePreferences(array $preferences): array {
        $sanitized = [];
        
        // Reminder preferences
        if (isset($preferences['daily_reminder'])) {
            $sanitized['daily_reminder'] = (bool) $preferences['daily_reminder'];
        }
        
        if (isset($preferences['reminder_time'])) {
            $time = sanitize_text_field($preferences['reminder_time']);
            if (preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $time)) {
                $sanitized['reminder_time'] = $time;
            }
        }
        
        // Workout adaptation preferences
        if (isset($preferences['auto_adapt_workouts'])) {
            $sanitized['auto_adapt_workouts'] = (bool) $preferences['auto_adapt_workouts'];
        }
        
        if (isset($preferences['minimum_adaptation_threshold'])) {
            $threshold = intval($preferences['minimum_adaptation_threshold']);
            if ($threshold >= 1 && $threshold <= 5) {
                $sanitized['minimum_adaptation_threshold'] = $threshold;
            }
        }
        
        // Privacy preferences
        if (isset($preferences['share_with_trainer'])) {
            $sanitized['share_with_trainer'] = (bool) $preferences['share_with_trainer'];
        }
        
        return $sanitized;
    }
    
    /**
     * Get default sleep quality preferences
     *
     * @return array Default preferences
     */
    private function getDefaultPreferences(): array {
        return [
            'daily_reminder' => true,
            'reminder_time' => '08:00',
            'auto_adapt_workouts' => true,
            'minimum_adaptation_threshold' => 2,
            'share_with_trainer' => false
        ];
    }
    
    /**
     * Export user's sleep quality data (GDPR compliance)
     *
     * @param int $user_id User ID
     * @return array Exported data
     */
    public function exportSleepQualityData(int $user_id): array {
        try {
            return [
                'current_sleep_quality' => $this->getSleepQuality($user_id),
                'sleep_quality_history' => $this->getSleepQualityHistory($user_id, 365), // Full year
                'sleep_quality_preferences' => $this->getSleepQualityPreferences($user_id),
                'export_date' => current_time('mysql'),
                'user_id' => $user_id
            ];
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error exporting sleep quality data: " . $e->getMessage());
            return [
                'error' => 'Failed to export sleep quality data',
                'export_date' => current_time('mysql'),
                'user_id' => $user_id
            ];
        }
    }
    
    /**
     * Import user's sleep quality data (data migration)
     *
     * @param int $user_id User ID
     * @param array $data Sleep quality data to import
     * @return bool Success status
     */
    public function importSleepQualityData(int $user_id, array $data): bool {
        try {
            $success = true;
            
            // Import current sleep quality
            if (!empty($data['current_sleep_quality'])) {
                $success = $success && $this->saveSleepQuality($user_id, $data['current_sleep_quality']);
            }
            
            // Import preferences
            if (!empty($data['sleep_quality_preferences'])) {
                $success = $success && $this->saveSleepQualityPreferences($user_id, $data['sleep_quality_preferences']);
            }
            
            // Import history (manually update to avoid cleanup)
            if (!empty($data['sleep_quality_history']) && is_array($data['sleep_quality_history'])) {
                $success = $success && update_user_meta($user_id, self::SLEEP_QUALITY_HISTORY_KEY, $data['sleep_quality_history']) !== false;
            }
            
            return $success;
            
        } catch (\Exception $e) {
            error_log("[SleepQualityRepository] Error importing sleep quality data: " . $e->getMessage());
            return false;
        }
    }
} 