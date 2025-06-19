<?php

namespace FitCopilot\Modules\MuscleTargeting;

/**
 * Muscle Repository
 * 
 * Handles all database operations for muscle targeting data
 * Uses WordPress user meta for storage with proper prefixing
 * Supports nested muscle group structure with specific muscle selections
 */
class MuscleRepository {
    
    /**
     * Meta key prefix for muscle data
     */
    private const META_PREFIX = '_muscle_';
    
    /**
     * Maximum muscle groups allowed per selection
     */
    private const MAX_MUSCLE_GROUPS = 3;
    
    /**
     * Get user muscle selection from WordPress user meta
     */
    public function getUserMuscleSelection(int $user_id): array {
        $meta_key = self::META_PREFIX . 'selection';
        $selection_data = get_user_meta($user_id, $meta_key, true);
        
        // Return default structure if no data exists
        if (empty($selection_data)) {
            return [
                'selectedGroups' => [],
                'selectedMuscles' => [],
                'savedAt' => null,
                'preferences' => []
            ];
        }
        
        // Ensure required keys exist
        return array_merge([
            'selectedGroups' => [],
            'selectedMuscles' => [],
            'savedAt' => null,
            'preferences' => []
        ], $selection_data);
    }
    
    /**
     * Save user muscle selection to WordPress user meta
     */
    public function saveMuscleSelection(int $user_id, array $selection_data): bool {
        try {
            $meta_key = self::META_PREFIX . 'selection';
            
            // Validate and sanitize the selection data
            $sanitized_data = $this->sanitizeSelectionData($selection_data);
            
            // Add timestamp
            $sanitized_data['savedAt'] = current_time('mysql');
            
            $result = update_user_meta($user_id, $meta_key, $sanitized_data);
            
            // Log the save operation
            $group_count = count($sanitized_data['selectedGroups']);
            $muscle_count = is_array($sanitized_data['selectedMuscles']) ? 
                array_sum(array_map('count', $sanitized_data['selectedMuscles'])) : 0;
            
            error_log("[MuscleRepository] Saved muscle selection for user {$user_id}: {$group_count} groups, {$muscle_count} specific muscles");
            
            return $result !== false;
            
        } catch (\Exception $e) {
            error_log('[MuscleRepository] Failed to save muscle selection: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clear user muscle selection
     */
    public function clearMuscleSelection(int $user_id): bool {
        $meta_key = self::META_PREFIX . 'selection';
        $result = delete_user_meta($user_id, $meta_key);
        
        if ($result) {
            error_log("[MuscleRepository] Cleared muscle selection for user {$user_id}");
        }
        
        return $result;
    }
    
    /**
     * Get muscle groups data structure
     */
    public function getMuscleGroups(): array {
        return [
            'back' => [
                'display' => 'Back',
                'icon' => '🏋️',
                'description' => 'Upper and lower back muscles for posture and pulling strength',
                'muscles' => ['Lats', 'Rhomboids', 'Middle Traps', 'Lower Traps', 'Rear Delts']
            ],
            'chest' => [
                'display' => 'Chest',
                'icon' => '💪',
                'description' => 'Pectoral muscles for pushing movements and upper body strength',
                'muscles' => ['Upper Chest', 'Middle Chest', 'Lower Chest']
            ],
            'arms' => [
                'display' => 'Arms',
                'icon' => '💪',
                'description' => 'Biceps, triceps, and forearms for arm strength and definition',
                'muscles' => ['Biceps', 'Triceps', 'Forearms']
            ],
            'shoulders' => [
                'display' => 'Shoulders',
                'icon' => '🤸',
                'description' => 'Deltoid muscles for shoulder stability and overhead movements',
                'muscles' => ['Front Delts', 'Side Delts', 'Rear Delts']
            ],
            'core' => [
                'display' => 'Core',
                'icon' => '🧘',
                'description' => 'Abdominal and core muscles for stability and functional strength',
                'muscles' => ['Upper Abs', 'Lower Abs', 'Obliques', 'Transverse Abdominis']
            ],
            'legs' => [
                'display' => 'Legs',
                'icon' => '🦵',
                'description' => 'Lower body muscles for power, stability, and functional movement',
                'muscles' => ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves']
            ]
        ];
    }
    
    /**
     * Get muscles for a specific group
     */
    public function getMuscleGroupDetails(string $group): array {
        $muscle_groups = $this->getMuscleGroups();
        $normalized_group = strtolower($group);
        
        return $muscle_groups[$normalized_group] ?? [];
    }
    
    /**
     * Check if user has muscle selection data
     */
    public function hasMuscleSelection(int $user_id): bool {
        $selection = $this->getUserMuscleSelection($user_id);
        return !empty($selection['selectedGroups']);
    }
    
    /**
     * Get muscle selection statistics
     */
    public function getMuscleSelectionStats(int $user_id): array {
        $selection = $this->getUserMuscleSelection($user_id);
        
        $total_groups = count($selection['selectedGroups']);
        $total_muscles = is_array($selection['selectedMuscles']) ? 
            array_sum(array_map('count', $selection['selectedMuscles'])) : 0;
        
        return [
            'total_groups' => $total_groups,
            'total_muscles' => $total_muscles,
            'can_add_more' => $total_groups < self::MAX_MUSCLE_GROUPS,
            'max_groups_reached' => $total_groups >= self::MAX_MUSCLE_GROUPS,
            'last_updated' => $selection['savedAt']
        ];
    }
    
    /**
     * Get all users with muscle selections
     */
    public function getUsersWithMuscleSelections(): array {
        global $wpdb;
        
        $meta_key = self::META_PREFIX . 'selection';
        
        $results = $wpdb->get_results($wpdb->prepare("
            SELECT DISTINCT user_id, meta_value
            FROM {$wpdb->usermeta} 
            WHERE meta_key = %s 
            AND meta_value != ''
        ", $meta_key));
        
        $users = [];
        foreach ($results as $result) {
            $user = get_userdata($result->user_id);
            if ($user) {
                $selection_data = maybe_unserialize($result->meta_value);
                $users[] = [
                    'id' => $result->user_id,
                    'name' => $user->display_name,
                    'email' => $user->user_email,
                    'muscle_groups' => $selection_data['selectedGroups'] ?? [],
                    'last_updated' => $selection_data['savedAt'] ?? null
                ];
            }
        }
        
        return $users;
    }
    
    /**
     * Validate muscle selection data structure
     */
    public function validateSelectionData(array $selection_data): array {
        $errors = [];
        $warnings = [];
        
        // Check required structure
        if (!isset($selection_data['selectedGroups']) || !is_array($selection_data['selectedGroups'])) {
            $errors[] = 'Invalid selection data structure: selectedGroups must be an array';
            return [
                'is_valid' => false,
                'errors' => $errors,
                'warnings' => $warnings
            ];
        }
        
        $selected_groups = $selection_data['selectedGroups'];
        $selected_muscles = $selection_data['selectedMuscles'] ?? [];
        
        // Check group limits
        if (count($selected_groups) > self::MAX_MUSCLE_GROUPS) {
            $errors[] = 'Maximum ' . self::MAX_MUSCLE_GROUPS . ' muscle groups allowed';
        }
        
        if (empty($selected_groups)) {
            $warnings[] = 'At least one muscle group is recommended';
        }
        
        // Validate group names
        $valid_groups = array_keys($this->getMuscleGroups());
        foreach ($selected_groups as $group) {
            $normalized_group = strtolower($group);
            if (!in_array($normalized_group, $valid_groups)) {
                $errors[] = "Invalid muscle group: {$group}";
            }
        }
        
        // Validate specific muscles if provided
        if (is_array($selected_muscles)) {
            foreach ($selected_muscles as $group => $muscles) {
                if (!is_array($muscles)) continue;
                
                $group_details = $this->getMuscleGroupDetails($group);
                $valid_muscles = $group_details['muscles'] ?? [];
                
                foreach ($muscles as $muscle) {
                    if (!in_array($muscle, $valid_muscles)) {
                        $warnings[] = "Invalid muscle '{$muscle}' for group '{$group}'";
                    }
                }
            }
        }
        
        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'can_add_more' => count($selected_groups) < self::MAX_MUSCLE_GROUPS,
            'max_groups_reached' => count($selected_groups) >= self::MAX_MUSCLE_GROUPS
        ];
    }
    
    /**
     * Backup muscle selection data
     */
    public function backupMuscleSelection(int $user_id): string {
        $selection_data = $this->getUserMuscleSelection($user_id);
        
        $backup_data = [
            'user_id' => $user_id,
            'selection_data' => $selection_data,
            'backup_date' => current_time('mysql'),
            'version' => '1.0'
        ];
        
        $backup_path = wp_upload_dir()['basedir'] . "/muscle-selection-backup-{$user_id}-" . time() . '.json';
        file_put_contents($backup_path, json_encode($backup_data, JSON_PRETTY_PRINT));
        
        return $backup_path;
    }
    
    /**
     * Restore muscle selection from backup
     */
    public function restoreMuscleSelection(int $user_id, string $backup_path): bool {
        if (!file_exists($backup_path)) {
            return false;
        }
        
        $backup_data = json_decode(file_get_contents($backup_path), true);
        
        if (!$backup_data || !isset($backup_data['selection_data'])) {
            return false;
        }
        
        return $this->saveMuscleSelection($user_id, $backup_data['selection_data']);
    }
    
    /**
     * Sanitize selection data before saving
     */
    private function sanitizeSelectionData(array $selection_data): array {
        $sanitized = [];
        
        // Sanitize selected groups
        $sanitized['selectedGroups'] = [];
        if (isset($selection_data['selectedGroups']) && is_array($selection_data['selectedGroups'])) {
            foreach ($selection_data['selectedGroups'] as $group) {
                $clean_group = sanitize_text_field($group);
                if (!empty($clean_group)) {
                    $sanitized['selectedGroups'][] = strtolower($clean_group);
                }
            }
        }
        
        // Sanitize selected muscles
        $sanitized['selectedMuscles'] = [];
        if (isset($selection_data['selectedMuscles']) && is_array($selection_data['selectedMuscles'])) {
            foreach ($selection_data['selectedMuscles'] as $group => $muscles) {
                if (is_array($muscles)) {
                    $clean_group = sanitize_text_field($group);
                    $sanitized['selectedMuscles'][$clean_group] = [];
                    
                    foreach ($muscles as $muscle) {
                        $clean_muscle = sanitize_text_field($muscle);
                        if (!empty($clean_muscle)) {
                            $sanitized['selectedMuscles'][$clean_group][] = $clean_muscle;
                        }
                    }
                }
            }
        }
        
        // Sanitize preferences
        $sanitized['preferences'] = [];
        if (isset($selection_data['preferences']) && is_array($selection_data['preferences'])) {
            foreach ($selection_data['preferences'] as $key => $value) {
                $clean_key = sanitize_text_field($key);
                $clean_value = is_array($value) ? $value : sanitize_text_field($value);
                $sanitized['preferences'][$clean_key] = $clean_value;
            }
        }
        
        return $sanitized;
    }
} 