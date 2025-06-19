<?php

namespace FitCopilot\Modules\ProfileManagement;

/**
 * Profile Service
 * 
 * Handles the business logic for profile management including:
 * - Loading user profiles from WordPress user meta
 * - Saving profile data with validation
 * - Unit conversions for height/weight
 * - Profile data formatting and transformation
 */
class ProfileService {
    
    private ProfileRepository $repository;
    private ProfileValidator $validator;
    
    public function __construct(ProfileRepository $repository, ProfileValidator $validator) {
        $this->repository = $repository;
        $this->validator = $validator;
    }
    
    /**
     * Load user profile data
     */
    public function loadUserProfile(int $user_id): array {
        try {
            // Get WordPress user data
            $user = get_userdata($user_id);
            if (!$user) {
                throw new \Exception('User not found');
            }
            
            // Load profile data from repository
            $profile_data = $this->repository->getUserProfile($user_id);
            
            // Format and structure the data
            return $this->formatProfileData($profile_data, $user);
            
        } catch (\Exception $e) {
            error_log('[ProfileService] Failed to load profile for user ' . $user_id . ': ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Save user profile data
     */
    public function saveUserProfile(int $user_id, array $profile_data): bool {
        try {
            // Validate profile data
            $validation_result = $this->validator->validate($profile_data);
            if (!$validation_result['is_valid']) {
                throw new \Exception('Invalid profile data: ' . implode(', ', $validation_result['errors']));
            }
            
            // Transform data for storage
            $storage_data = $this->transformForStorage($profile_data);
            
            // Save to repository
            return $this->repository->saveUserProfile($user_id, $storage_data);
            
        } catch (\Exception $e) {
            error_log('[ProfileService] Failed to save profile for user ' . $user_id . ': ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Format profile data for frontend consumption
     */
    private function formatProfileData(array $profile_data, \WP_User $user): array {
        return [
            'basic_info' => [
                'first_name' => $profile_data['first_name'] ?? $user->first_name ?? '',
                'last_name' => $profile_data['last_name'] ?? $user->last_name ?? '',
                'age' => intval($profile_data['age'] ?? 0),
                'gender' => $profile_data['gender'] ?? '',
                'fitness_level' => $profile_data['fitness_level'] ?? '',
                'weight' => floatval($profile_data['weight'] ?? 0),
                'weight_unit' => $profile_data['weight_unit'] ?? 'lbs',
                'height' => floatval($profile_data['height'] ?? 0),
                'height_unit' => $profile_data['height_unit'] ?? 'ft'
            ],
            'goals' => [
                'primary_goals' => $this->parseArrayField($profile_data['goals'] ?? []),
                'custom_goal' => $profile_data['custom_goal'] ?? ''
            ],
            'equipment' => $this->parseArrayField($profile_data['available_equipment'] ?? []),
            'preferences' => [
                'preferred_location' => $profile_data['preferred_location'] ?? '',
                'workout_frequency' => $profile_data['workout_frequency'] ?? '',
                'preferred_duration' => intval($profile_data['preferred_workout_duration'] ?? 30)
            ],
            'limitations' => [
                'physical_limitations' => $this->parseArrayField($profile_data['limitations'] ?? []),
                'medical_conditions' => $profile_data['medical_conditions'] ?? '',
                'injuries' => $profile_data['injuries'] ?? '',
                'limitation_notes' => $profile_data['limitation_notes'] ?? ''
            ],
            'exercise_preferences' => [
                'favorite_exercises' => $profile_data['favorite_exercises'] ?? '',
                'disliked_exercises' => $profile_data['disliked_exercises'] ?? ''
            ],
            'meta' => [
                'last_updated' => $profile_data['last_updated'] ?? current_time('mysql'),
                'profile_completion' => $this->calculateProfileCompletion($profile_data)
            ]
        ];
    }
    
    /**
     * Transform profile data for storage
     */
    private function transformForStorage(array $profile_data): array {
        $storage_data = [];
        
        // Basic info
        if (isset($profile_data['basic_info'])) {
            $basic = $profile_data['basic_info'];
            $storage_data['first_name'] = sanitize_text_field($basic['first_name'] ?? '');
            $storage_data['last_name'] = sanitize_text_field($basic['last_name'] ?? '');
            $storage_data['age'] = intval($basic['age'] ?? 0);
            $storage_data['gender'] = sanitize_text_field($basic['gender'] ?? '');
            $storage_data['fitness_level'] = sanitize_text_field($basic['fitness_level'] ?? '');
            $storage_data['weight'] = floatval($basic['weight'] ?? 0);
            $storage_data['weight_unit'] = sanitize_text_field($basic['weight_unit'] ?? 'lbs');
            $storage_data['height'] = floatval($basic['height'] ?? 0);
            $storage_data['height_unit'] = sanitize_text_field($basic['height_unit'] ?? 'ft');
        }
        
        // Goals
        if (isset($profile_data['goals'])) {
            $goals = $profile_data['goals'];
            $storage_data['goals'] = is_array($goals['primary_goals'] ?? []) ? $goals['primary_goals'] : [];
            $storage_data['custom_goal'] = sanitize_textarea_field($goals['custom_goal'] ?? '');
        }
        
        // Equipment
        if (isset($profile_data['equipment'])) {
            $storage_data['available_equipment'] = is_array($profile_data['equipment']) ? $profile_data['equipment'] : [];
        }
        
        // Preferences
        if (isset($profile_data['preferences'])) {
            $prefs = $profile_data['preferences'];
            $storage_data['preferred_location'] = sanitize_text_field($prefs['preferred_location'] ?? '');
            $storage_data['workout_frequency'] = sanitize_text_field($prefs['workout_frequency'] ?? '');
            $storage_data['preferred_workout_duration'] = intval($prefs['preferred_duration'] ?? 30);
        }
        
        // Limitations
        if (isset($profile_data['limitations'])) {
            $limits = $profile_data['limitations'];
            $storage_data['limitations'] = is_array($limits['physical_limitations'] ?? []) ? $limits['physical_limitations'] : [];
            $storage_data['medical_conditions'] = sanitize_textarea_field($limits['medical_conditions'] ?? '');
            $storage_data['injuries'] = sanitize_textarea_field($limits['injuries'] ?? '');
            $storage_data['limitation_notes'] = sanitize_textarea_field($limits['limitation_notes'] ?? '');
        }
        
        // Exercise preferences
        if (isset($profile_data['exercise_preferences'])) {
            $exercise_prefs = $profile_data['exercise_preferences'];
            $storage_data['favorite_exercises'] = sanitize_textarea_field($exercise_prefs['favorite_exercises'] ?? '');
            $storage_data['disliked_exercises'] = sanitize_textarea_field($exercise_prefs['disliked_exercises'] ?? '');
        }
        
        // Add metadata
        $storage_data['last_updated'] = current_time('mysql');
        
        return $storage_data;
    }
    
    /**
     * Parse array fields that might be stored as strings
     */
    private function parseArrayField($field): array {
        if (is_array($field)) {
            return $field;
        }
        
        if (is_string($field) && !empty($field)) {
            // Try to decode JSON
            $decoded = json_decode($field, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
            
            // Fallback to comma-separated values
            return array_map('trim', explode(',', $field));
        }
        
        return [];
    }
    
    /**
     * Calculate profile completion percentage
     */
    private function calculateProfileCompletion(array $profile_data): float {
        $required_fields = [
            'first_name', 'last_name', 'age', 'gender', 'fitness_level',
            'weight', 'height', 'goals', 'available_equipment'
        ];
        
        $completed = 0;
        $total = count($required_fields);
        
        foreach ($required_fields as $field) {
            if (!empty($profile_data[$field])) {
                $completed++;
            }
        }
        
        return round(($completed / $total) * 100, 1);
    }
    
    /**
     * Convert height between units
     */
    public function convertHeight(float $height, string $from_unit, string $to_unit): float {
        if ($from_unit === $to_unit) {
            return $height;
        }
        
        // Convert to inches first (base unit)
        $inches = $from_unit === 'cm' ? $height / 2.54 : $height;
        
        // Convert from inches to target unit
        return $to_unit === 'cm' ? $inches * 2.54 : $inches;
    }
    
    /**
     * Convert weight between units
     */
    public function convertWeight(float $weight, string $from_unit, string $to_unit): float {
        if ($from_unit === $to_unit) {
            return $weight;
        }
        
        // Convert to pounds first (base unit)
        $pounds = $from_unit === 'kg' ? $weight * 2.20462 : $weight;
        
        // Convert from pounds to target unit
        return $to_unit === 'kg' ? $pounds / 2.20462 : $pounds;
    }
    
    /**
     * Get profile summary for display
     */
    public function getProfileSummary(int $user_id): array {
        $profile_data = $this->loadUserProfile($user_id);
        
        return [
            'name' => trim($profile_data['basic_info']['first_name'] . ' ' . $profile_data['basic_info']['last_name']),
            'fitness_level' => $profile_data['basic_info']['fitness_level'],
            'primary_goals' => $profile_data['goals']['primary_goals'],
            'completion' => $profile_data['meta']['profile_completion'],
            'last_updated' => $profile_data['meta']['last_updated']
        ];
    }
} 