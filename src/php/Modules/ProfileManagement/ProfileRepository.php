<?php

namespace FitCopilot\Modules\ProfileManagement;

/**
 * Profile Repository
 * 
 * Handles all database operations for user profile data
 * Uses WordPress user meta for storage with proper prefixing
 */
class ProfileRepository {
    
    /**
     * Meta key prefix for profile data
     */
    private const META_PREFIX = '_profile_';
    
    /**
     * Get user profile data from WordPress user meta
     */
    public function getUserProfile(int $user_id): array {
        $profile_data = [];
        
        // Get all profile meta keys
        $meta_keys = $this->getProfileMetaKeys();
        
        foreach ($meta_keys as $key) {
            $meta_key = self::META_PREFIX . $key;
            $value = get_user_meta($user_id, $meta_key, true);
            
            // Handle array fields
            if (in_array($key, ['goals', 'available_equipment', 'limitations'])) {
                $profile_data[$key] = $this->unserializeArrayField($value);
            } else {
                $profile_data[$key] = $value;
            }
        }
        
        return array_filter($profile_data, function($value) {
            return $value !== '' && $value !== null && $value !== false;
        });
    }
    
    /**
     * Save user profile data to WordPress user meta
     */
    public function saveUserProfile(int $user_id, array $profile_data): bool {
        try {
            $saved_count = 0;
            $total_fields = count($profile_data);
            
            foreach ($profile_data as $key => $value) {
                $meta_key = self::META_PREFIX . $key;
                
                // Handle array fields
                if (is_array($value)) {
                    $value = $this->serializeArrayField($value);
                }
                
                // Update user meta
                $result = update_user_meta($user_id, $meta_key, $value);
                
                if ($result !== false) {
                    $saved_count++;
                }
            }
            
            // Log the save operation
            error_log("[ProfileRepository] Saved {$saved_count}/{$total_fields} profile fields for user {$user_id}");
            
            return $saved_count > 0;
            
        } catch (\Exception $e) {
            error_log('[ProfileRepository] Failed to save profile: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get specific profile field
     */
    public function getProfileField(int $user_id, string $field_name) {
        $meta_key = self::META_PREFIX . $field_name;
        $value = get_user_meta($user_id, $meta_key, true);
        
        // Handle array fields
        if (in_array($field_name, ['goals', 'available_equipment', 'limitations'])) {
            return $this->unserializeArrayField($value);
        }
        
        return $value;
    }
    
    /**
     * Set specific profile field
     */
    public function setProfileField(int $user_id, string $field_name, $value): bool {
        $meta_key = self::META_PREFIX . $field_name;
        
        // Handle array fields
        if (is_array($value)) {
            $value = $this->serializeArrayField($value);
        }
        
        $result = update_user_meta($user_id, $meta_key, $value);
        return $result !== false;
    }
    
    /**
     * Delete profile field
     */
    public function deleteProfileField(int $user_id, string $field_name): bool {
        $meta_key = self::META_PREFIX . $field_name;
        return delete_user_meta($user_id, $meta_key);
    }
    
    /**
     * Delete entire user profile
     */
    public function deleteUserProfile(int $user_id): bool {
        $meta_keys = $this->getProfileMetaKeys();
        $deleted_count = 0;
        
        foreach ($meta_keys as $key) {
            $meta_key = self::META_PREFIX . $key;
            if (delete_user_meta($user_id, $meta_key)) {
                $deleted_count++;
            }
        }
        
        return $deleted_count > 0;
    }
    
    /**
     * Check if user has profile data
     */
    public function hasProfile(int $user_id): bool {
        $required_fields = ['first_name', 'last_name', 'fitness_level'];
        
        foreach ($required_fields as $field) {
            $value = $this->getProfileField($user_id, $field);
            if (!empty($value)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get all users with profiles
     */
    public function getUsersWithProfiles(): array {
        global $wpdb;
        
        $meta_key = self::META_PREFIX . 'fitness_level';
        
        $results = $wpdb->get_results($wpdb->prepare("
            SELECT DISTINCT user_id, meta_value as fitness_level
            FROM {$wpdb->usermeta} 
            WHERE meta_key = %s 
            AND meta_value != ''
        ", $meta_key));
        
        $users = [];
        foreach ($results as $result) {
            $user = get_userdata($result->user_id);
            if ($user) {
                $users[] = [
                    'id' => $result->user_id,
                    'name' => $user->display_name,
                    'email' => $user->user_email,
                    'fitness_level' => $result->fitness_level
                ];
            }
        }
        
        return $users;
    }
    
    /**
     * Get profile completion statistics
     */
    public function getProfileStats(int $user_id): array {
        $profile_data = $this->getUserProfile($user_id);
        $meta_keys = $this->getProfileMetaKeys();
        
        $completed = 0;
        $total = count($meta_keys);
        
        foreach ($meta_keys as $key) {
            if (!empty($profile_data[$key])) {
                $completed++;
            }
        }
        
        return [
            'completed_fields' => $completed,
            'total_fields' => $total,
            'completion_percentage' => round(($completed / $total) * 100, 1),
            'missing_fields' => array_diff($meta_keys, array_keys($profile_data))
        ];
    }
    
    /**
     * Get all profile meta keys
     */
    private function getProfileMetaKeys(): array {
        return [
            'first_name',
            'last_name',
            'age',
            'gender',
            'fitness_level',
            'weight',
            'weight_unit',
            'height',
            'height_unit',
            'goals',
            'custom_goal',
            'available_equipment',
            'preferred_location',
            'workout_frequency',
            'preferred_workout_duration',
            'limitations',
            'medical_conditions',
            'injuries',
            'limitation_notes',
            'favorite_exercises',
            'disliked_exercises',
            'last_updated'
        ];
    }
    
    /**
     * Serialize array field for storage
     */
    private function serializeArrayField(array $value): string {
        return json_encode($value, JSON_UNESCAPED_UNICODE);
    }
    
    /**
     * Unserialize array field from storage
     */
    private function unserializeArrayField($value): array {
        if (is_array($value)) {
            return $value;
        }
        
        if (is_string($value) && !empty($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
        }
        
        return [];
    }
    
    /**
     * Backup profile data to a JSON file
     */
    public function backupProfile(int $user_id): string {
        $profile_data = $this->getUserProfile($user_id);
        $user = get_userdata($user_id);
        
        $backup_data = [
            'user_id' => $user_id,
            'user_login' => $user->user_login,
            'user_email' => $user->user_email,
            'profile_data' => $profile_data,
            'backup_date' => current_time('mysql'),
            'backup_version' => '1.0'
        ];
        
        $backup_json = json_encode($backup_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        // Save to uploads directory
        $upload_dir = wp_upload_dir();
        $backup_filename = 'profile_backup_' . $user_id . '_' . time() . '.json';
        $backup_path = $upload_dir['path'] . '/' . $backup_filename;
        
        if (file_put_contents($backup_path, $backup_json)) {
            return $backup_path;
        }
        
        throw new \Exception('Failed to create profile backup file');
    }
    
    /**
     * Restore profile data from backup
     */
    public function restoreProfile(int $user_id, string $backup_path): bool {
        if (!file_exists($backup_path)) {
            throw new \Exception('Backup file not found');
        }
        
        $backup_json = file_get_contents($backup_path);
        $backup_data = json_decode($backup_json, true);
        
        if (!$backup_data || !isset($backup_data['profile_data'])) {
            throw new \Exception('Invalid backup file format');
        }
        
        return $this->saveUserProfile($user_id, $backup_data['profile_data']);
    }
} 