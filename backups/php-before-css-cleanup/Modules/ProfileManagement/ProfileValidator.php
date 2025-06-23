<?php

namespace FitCopilot\Modules\ProfileManagement;

/**
 * Profile Validator
 * 
 * Handles validation of user profile data with comprehensive
 * field-level validation and business rule enforcement
 */
class ProfileValidator {
    
    /**
     * Validate complete profile data
     */
    public function validate(array $profile_data): array {
        $errors = [];
        $warnings = [];
        
        // Validate basic info
        if (isset($profile_data['basic_info'])) {
            $basic_errors = $this->validateBasicInfo($profile_data['basic_info']);
            $errors = array_merge($errors, $basic_errors);
        }
        
        // Validate goals
        if (isset($profile_data['goals'])) {
            $goal_errors = $this->validateGoals($profile_data['goals']);
            $errors = array_merge($errors, $goal_errors);
        }
        
        // Validate equipment
        if (isset($profile_data['equipment'])) {
            $equipment_errors = $this->validateEquipment($profile_data['equipment']);
            $errors = array_merge($errors, $equipment_errors);
        }
        
        // Validate preferences
        if (isset($profile_data['preferences'])) {
            $pref_errors = $this->validatePreferences($profile_data['preferences']);
            $errors = array_merge($errors, $pref_errors);
        }
        
        // Validate limitations
        if (isset($profile_data['limitations'])) {
            $limit_warnings = $this->validateLimitations($profile_data['limitations']);
            $warnings = array_merge($warnings, $limit_warnings);
        }
        
        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
            'validation_score' => $this->calculateValidationScore($profile_data, $errors, $warnings)
        ];
    }
    
    /**
     * Validate basic info section
     */
    private function validateBasicInfo(array $basic_info): array {
        $errors = [];
        
        // First name validation
        if (empty($basic_info['first_name'])) {
            $errors['first_name'] = 'First name is required';
        } elseif (strlen($basic_info['first_name']) < 2) {
            $errors['first_name'] = 'First name must be at least 2 characters';
        } elseif (strlen($basic_info['first_name']) > 50) {
            $errors['first_name'] = 'First name must be less than 50 characters';
        } elseif (!preg_match('/^[a-zA-Z\s\-\'\.]+$/', $basic_info['first_name'])) {
            $errors['first_name'] = 'First name contains invalid characters';
        }
        
        // Last name validation
        if (empty($basic_info['last_name'])) {
            $errors['last_name'] = 'Last name is required';
        } elseif (strlen($basic_info['last_name']) < 2) {
            $errors['last_name'] = 'Last name must be at least 2 characters';
        } elseif (strlen($basic_info['last_name']) > 50) {
            $errors['last_name'] = 'Last name must be less than 50 characters';
        } elseif (!preg_match('/^[a-zA-Z\s\-\'\.]+$/', $basic_info['last_name'])) {
            $errors['last_name'] = 'Last name contains invalid characters';
        }
        
        // Age validation
        if (isset($basic_info['age'])) {
            $age = intval($basic_info['age']);
            if ($age < 13) {
                $errors['age'] = 'Age must be at least 13 years';
            } elseif ($age > 120) {
                $errors['age'] = 'Age must be less than 120 years';
            }
        }
        
        // Gender validation
        if (isset($basic_info['gender']) && !empty($basic_info['gender'])) {
            $valid_genders = ['male', 'female', 'other', 'prefer_not_to_say'];
            if (!in_array($basic_info['gender'], $valid_genders)) {
                $errors['gender'] = 'Invalid gender selection';
            }
        }
        
        // Fitness level validation
        if (isset($basic_info['fitness_level']) && !empty($basic_info['fitness_level'])) {
            $valid_levels = ['beginner', 'intermediate', 'advanced', 'expert'];
            if (!in_array($basic_info['fitness_level'], $valid_levels)) {
                $errors['fitness_level'] = 'Invalid fitness level selection';
            }
        }
        
        // Weight validation
        if (isset($basic_info['weight']) && $basic_info['weight'] > 0) {
            $weight = floatval($basic_info['weight']);
            $unit = $basic_info['weight_unit'] ?? 'lbs';
            
            if ($unit === 'kg') {
                if ($weight < 20 || $weight > 300) {
                    $errors['weight'] = 'Weight must be between 20-300 kg';
                }
            } else { // lbs
                if ($weight < 44 || $weight > 660) {
                    $errors['weight'] = 'Weight must be between 44-660 lbs';
                }
            }
        }
        
        // Height validation
        if (isset($basic_info['height']) && $basic_info['height'] > 0) {
            $height = floatval($basic_info['height']);
            $unit = $basic_info['height_unit'] ?? 'ft';
            
            if ($unit === 'cm') {
                if ($height < 90 || $height > 250) {
                    $errors['height'] = 'Height must be between 90-250 cm';
                }
            } else { // inches (converted from ft/in)
                if ($height < 36 || $height > 96) {
                    $errors['height'] = 'Height must be between 3-8 feet';
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * Validate goals section
     */
    private function validateGoals(array $goals): array {
        $errors = [];
        
        // Primary goals validation
        if (isset($goals['primary_goals']) && is_array($goals['primary_goals'])) {
            $valid_goals = [
                'weight_loss', 'muscle_building', 'strength', 'endurance', 
                'flexibility', 'general_fitness', 'athletic_performance',
                'rehabilitation', 'stress_relief', 'body_composition'
            ];
            
            $invalid_goals = array_diff($goals['primary_goals'], $valid_goals);
            if (!empty($invalid_goals)) {
                $errors['primary_goals'] = 'Invalid goal selections: ' . implode(', ', $invalid_goals);
            }
            
            if (count($goals['primary_goals']) > 5) {
                $errors['primary_goals'] = 'Maximum 5 goals can be selected';
            }
        }
        
        // Custom goal validation
        if (isset($goals['custom_goal']) && !empty($goals['custom_goal'])) {
            if (strlen($goals['custom_goal']) > 500) {
                $errors['custom_goal'] = 'Custom goal description must be less than 500 characters';
            }
        }
        
        return $errors;
    }
    
    /**
     * Validate equipment section
     */
    private function validateEquipment(array $equipment): array {
        $errors = [];
        
        if (is_array($equipment)) {
            $valid_equipment = [
                'bodyweight', 'dumbbells', 'barbell', 'resistance_bands',
                'pull_up_bar', 'kettlebells', 'cable_machine', 'treadmill',
                'stationary_bike', 'rowing_machine', 'yoga_mat', 'foam_roller',
                'medicine_ball', 'suspension_trainer', 'battle_ropes'
            ];
            
            $invalid_equipment = array_diff($equipment, $valid_equipment);
            if (!empty($invalid_equipment)) {
                $errors['equipment'] = 'Invalid equipment selections: ' . implode(', ', $invalid_equipment);
            }
        }
        
        return $errors;
    }
    
    /**
     * Validate preferences section
     */
    private function validatePreferences(array $preferences): array {
        $errors = [];
        
        // Location validation
        if (isset($preferences['preferred_location']) && !empty($preferences['preferred_location'])) {
            $valid_locations = ['home', 'gym', 'outdoor', 'travel', 'office', 'studio'];
            if (!in_array($preferences['preferred_location'], $valid_locations)) {
                $errors['preferred_location'] = 'Invalid location selection';
            }
        }
        
        // Frequency validation
        if (isset($preferences['workout_frequency']) && !empty($preferences['workout_frequency'])) {
            $valid_frequencies = ['1-2', '3-4', '5-6', 'daily', '2-3', '4-5'];
            if (!in_array($preferences['workout_frequency'], $valid_frequencies)) {
                $errors['workout_frequency'] = 'Invalid frequency selection';
            }
        }
        
        // Duration validation
        if (isset($preferences['preferred_duration'])) {
            $duration = intval($preferences['preferred_duration']);
            if ($duration < 10 || $duration > 180) {
                $errors['preferred_duration'] = 'Workout duration must be between 10-180 minutes';
            }
        }
        
        return $errors;
    }
    
    /**
     * Validate limitations section (returns warnings, not errors)
     */
    private function validateLimitations(array $limitations): array {
        $warnings = [];
        
        // Physical limitations
        if (isset($limitations['physical_limitations']) && is_array($limitations['physical_limitations'])) {
            $valid_limitations = [
                'lower_back', 'knee', 'shoulder', 'wrist', 'ankle', 'neck',
                'hip', 'elbow', 'spine', 'heart', 'breathing'
            ];
            
            $high_risk_limitations = ['heart', 'breathing', 'spine'];
            $user_limitations = $limitations['physical_limitations'];
            
            $high_risk_present = array_intersect($user_limitations, $high_risk_limitations);
            if (!empty($high_risk_present)) {
                $warnings['high_risk_limitations'] = 'High-risk limitations detected: ' . implode(', ', $high_risk_present) . '. Medical clearance recommended.';
            }
        }
        
        // Medical conditions warning
        if (isset($limitations['medical_conditions']) && !empty($limitations['medical_conditions'])) {
            if (strlen($limitations['medical_conditions']) > 1000) {
                $warnings['medical_conditions'] = 'Medical conditions description is very long. Consider summarizing key points.';
            }
        }
        
        // Injuries warning
        if (isset($limitations['injuries']) && !empty($limitations['injuries'])) {
            $injury_keywords = ['recent', 'acute', 'severe', 'surgery', 'fracture'];
            $injuries_text = strtolower($limitations['injuries']);
            
            foreach ($injury_keywords as $keyword) {
                if (strpos($injuries_text, $keyword) !== false) {
                    $warnings['recent_injuries'] = 'Recent or severe injuries detected. Professional assessment recommended.';
                    break;
                }
            }
        }
        
        return $warnings;
    }
    
    /**
     * Calculate validation score (0-100)
     */
    private function calculateValidationScore(array $profile_data, array $errors, array $warnings): int {
        $score = 100;
        
        // Deduct points for errors
        $score -= count($errors) * 10;
        
        // Deduct points for warnings
        $score -= count($warnings) * 5;
        
        // Deduct points for missing optional fields
        $optional_fields = ['age', 'weight', 'height', 'goals', 'equipment', 'preferences'];
        $missing_optional = 0;
        
        foreach ($optional_fields as $field) {
            if (!isset($profile_data[$field]) || empty($profile_data[$field])) {
                $missing_optional++;
            }
        }
        
        $score -= $missing_optional * 2;
        
        return max(0, min(100, $score));
    }
    
    /**
     * Validate single field
     */
    public function validateField(string $field_name, $value): array {
        $errors = [];
        
        switch ($field_name) {
            case 'first_name':
            case 'last_name':
                if (empty($value)) {
                    $errors[] = ucfirst($field_name) . ' is required';
                } elseif (strlen($value) < 2 || strlen($value) > 50) {
                    $errors[] = ucfirst($field_name) . ' must be 2-50 characters';
                }
                break;
                
            case 'age':
                $age = intval($value);
                if ($age < 13 || $age > 120) {
                    $errors[] = 'Age must be between 13-120 years';
                }
                break;
                
            case 'weight':
                $weight = floatval($value);
                if ($weight < 44 || $weight > 660) {
                    $errors[] = 'Weight must be between 44-660 lbs';
                }
                break;
                
            case 'height':
                $height = floatval($value);
                if ($height < 36 || $height > 96) {
                    $errors[] = 'Height must be between 3-8 feet';
                }
                break;
        }
        
        return [
            'is_valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Check if profile meets minimum requirements
     */
    public function meetsMinimumRequirements(array $profile_data): bool {
        $required_fields = ['basic_info.first_name', 'basic_info.last_name', 'basic_info.fitness_level'];
        
        foreach ($required_fields as $field) {
            $keys = explode('.', $field);
            $value = $profile_data;
            
            foreach ($keys as $key) {
                if (!isset($value[$key])) {
                    return false;
                }
                $value = $value[$key];
            }
            
            if (empty($value)) {
                return false;
            }
        }
        
        return true;
    }
} 