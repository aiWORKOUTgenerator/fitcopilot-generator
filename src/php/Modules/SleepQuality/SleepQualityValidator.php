<?php
/**
 * SleepQuality Validator
 * 
 * Validation layer for sleep quality data.
 * Ensures data integrity and validates user inputs for sleep quality functionality.
 */

namespace FitCopilot\Modules\SleepQuality;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SleepQuality Validator Class
 * 
 * Handles validation of sleep quality related data
 */
class SleepQualityValidator {
    
    /**
     * Valid sleep quality levels
     */
    const VALID_SLEEP_QUALITY_LEVELS = [1, 2, 3, 4, 5];
    
    /**
     * Maximum context field lengths
     */
    const MAX_CONTEXT_LENGTH = 500;
    
    /**
     * Validate sleep quality level
     *
     * @param int $sleep_quality Sleep quality level
     * @param array $context Additional context data
     * @return array Validation result
     */
    public function validateSleepQuality(int $sleep_quality, array $context = []): array {
        $errors = [];
        
        // Validate sleep quality level
        if (!in_array($sleep_quality, self::VALID_SLEEP_QUALITY_LEVELS)) {
            $errors[] = sprintf(
                'Invalid sleep quality level: %d. Must be between 1 and 5.',
                $sleep_quality
            );
        }
        
        // Validate context data
        $context_validation = $this->validateContext($context);
        if (!$context_validation['valid']) {
            $errors = array_merge($errors, $context_validation['errors']);
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'sanitized_data' => [
                'level' => $sleep_quality,
                'context' => $this->sanitizeContext($context)
            ]
        ];
    }
    
    /**
     * Validate sleep quality context data
     *
     * @param array $context Context data to validate
     * @return array Validation result
     */
    public function validateContext(array $context): array {
        $errors = [];
        
        // Validate sleep hours if provided
        if (isset($context['sleep_hours'])) {
            $hours = floatval($context['sleep_hours']);
            if ($hours < 0 || $hours > 24) {
                $errors[] = 'Sleep hours must be between 0 and 24';
            }
        }
        
        // Validate sleep efficiency if provided
        if (isset($context['sleep_efficiency'])) {
            $efficiency = intval($context['sleep_efficiency']);
            if ($efficiency < 0 || $efficiency > 100) {
                $errors[] = 'Sleep efficiency must be between 0 and 100 percent';
            }
        }
        
        // Validate wake up times if provided
        if (isset($context['wake_up_count'])) {
            $wake_ups = intval($context['wake_up_count']);
            if ($wake_ups < 0 || $wake_ups > 50) {
                $errors[] = 'Wake up count must be a reasonable number (0-50)';
            }
        }
        
        // Validate bedtime and wake time format
        if (isset($context['bedtime'])) {
            if (!$this->isValidTimeFormat($context['bedtime'])) {
                $errors[] = 'Bedtime must be in HH:MM format';
            }
        }
        
        if (isset($context['wake_time'])) {
            if (!$this->isValidTimeFormat($context['wake_time'])) {
                $errors[] = 'Wake time must be in HH:MM format';
            }
        }
        
        // Validate sleep factors array
        if (isset($context['sleep_factors']) && is_array($context['sleep_factors'])) {
            $valid_factors = [
                'stress', 'caffeine', 'alcohol', 'exercise', 'screen_time',
                'temperature', 'noise', 'light', 'medication', 'other'
            ];
            
            foreach ($context['sleep_factors'] as $factor) {
                if (!in_array($factor, $valid_factors)) {
                    $errors[] = "Invalid sleep factor: {$factor}";
                }
            }
        }
        
        // Validate notes length
        if (isset($context['notes'])) {
            if (strlen($context['notes']) > self::MAX_CONTEXT_LENGTH) {
                $errors[] = sprintf(
                    'Sleep quality notes too long. Maximum %d characters allowed.',
                    self::MAX_CONTEXT_LENGTH
                );
            }
        }
        
        // Validate consecutive poor nights count
        if (isset($context['consecutive_poor_nights'])) {
            $count = intval($context['consecutive_poor_nights']);
            if ($count < 0 || $count > 365) {
                $errors[] = 'Consecutive poor nights count must be reasonable (0-365)';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Validate sleep quality preferences
     *
     * @param array $preferences Preferences to validate
     * @return array Validation result
     */
    public function validatePreferences(array $preferences): array {
        $errors = [];
        
        // Validate daily reminder boolean
        if (isset($preferences['daily_reminder'])) {
            if (!is_bool($preferences['daily_reminder'])) {
                $errors[] = 'Daily reminder must be true or false';
            }
        }
        
        // Validate reminder time format
        if (isset($preferences['reminder_time'])) {
            if (!$this->isValidTimeFormat($preferences['reminder_time'])) {
                $errors[] = 'Reminder time must be in HH:MM format';
            }
        }
        
        // Validate auto adapt workouts boolean
        if (isset($preferences['auto_adapt_workouts'])) {
            if (!is_bool($preferences['auto_adapt_workouts'])) {
                $errors[] = 'Auto adapt workouts must be true or false';
            }
        }
        
        // Validate minimum adaptation threshold
        if (isset($preferences['minimum_adaptation_threshold'])) {
            $threshold = intval($preferences['minimum_adaptation_threshold']);
            if (!in_array($threshold, self::VALID_SLEEP_QUALITY_LEVELS)) {
                $errors[] = 'Minimum adaptation threshold must be between 1 and 5';
            }
        }
        
        // Validate share with trainer boolean
        if (isset($preferences['share_with_trainer'])) {
            if (!is_bool($preferences['share_with_trainer'])) {
                $errors[] = 'Share with trainer must be true or false';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'sanitized_preferences' => $this->sanitizePreferences($preferences)
        ];
    }
    
    /**
     * Validate sleep quality history data
     *
     * @param array $history_data History data to validate
     * @return array Validation result
     */
    public function validateHistoryData(array $history_data): array {
        $errors = [];
        
        foreach ($history_data as $date => $entry) {
            // Validate date format
            if (!$this->isValidDateFormat($date)) {
                $errors[] = "Invalid date format: {$date}. Use YYYY-MM-DD format";
                continue;
            }
            
            // Validate entry structure
            if (!is_array($entry)) {
                $errors[] = "Invalid entry format for date {$date}";
                continue;
            }
            
            // Validate required fields
            if (empty($entry['level'])) {
                $errors[] = "Missing sleep quality level for date {$date}";
            }
            
            if (empty($entry['timestamp'])) {
                $errors[] = "Missing timestamp for date {$date}";
            }
            
            // Validate sleep quality level
            if (isset($entry['level']) && !in_array(intval($entry['level']), self::VALID_SLEEP_QUALITY_LEVELS)) {
                $errors[] = "Invalid sleep quality level for date {$date}";
            }
            
            // Validate context if present
            if (isset($entry['context'])) {
                $context_validation = $this->validateContext($entry['context']);
                if (!$context_validation['valid']) {
                    $errors[] = "Invalid context data for date {$date}: " . implode(', ', $context_validation['errors']);
                }
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Sanitize sleep quality context data
     *
     * @param array $context Raw context data
     * @return array Sanitized context data
     */
    public function sanitizeContext(array $context): array {
        $sanitized = [];
        
        // Sanitize sleep hours
        if (isset($context['sleep_hours'])) {
            $hours = floatval($context['sleep_hours']);
            if ($hours >= 0 && $hours <= 24) {
                $sanitized['sleep_hours'] = round($hours, 1);
            }
        }
        
        // Sanitize sleep efficiency
        if (isset($context['sleep_efficiency'])) {
            $efficiency = intval($context['sleep_efficiency']);
            if ($efficiency >= 0 && $efficiency <= 100) {
                $sanitized['sleep_efficiency'] = $efficiency;
            }
        }
        
        // Sanitize wake up count
        if (isset($context['wake_up_count'])) {
            $wake_ups = intval($context['wake_up_count']);
            if ($wake_ups >= 0 && $wake_ups <= 50) {
                $sanitized['wake_up_count'] = $wake_ups;
            }
        }
        
        // Sanitize times
        if (isset($context['bedtime']) && $this->isValidTimeFormat($context['bedtime'])) {
            $sanitized['bedtime'] = sanitize_text_field($context['bedtime']);
        }
        
        if (isset($context['wake_time']) && $this->isValidTimeFormat($context['wake_time'])) {
            $sanitized['wake_time'] = sanitize_text_field($context['wake_time']);
        }
        
        // Sanitize sleep factors
        if (isset($context['sleep_factors']) && is_array($context['sleep_factors'])) {
            $valid_factors = [
                'stress', 'caffeine', 'alcohol', 'exercise', 'screen_time',
                'temperature', 'noise', 'light', 'medication', 'other'
            ];
            
            $sanitized['sleep_factors'] = array_intersect($context['sleep_factors'], $valid_factors);
        }
        
        // Sanitize notes
        if (isset($context['notes'])) {
            $notes = sanitize_textarea_field($context['notes']);
            if (strlen($notes) <= self::MAX_CONTEXT_LENGTH) {
                $sanitized['notes'] = $notes;
            }
        }
        
        // Sanitize consecutive poor nights
        if (isset($context['consecutive_poor_nights'])) {
            $count = intval($context['consecutive_poor_nights']);
            if ($count >= 0 && $count <= 365) {
                $sanitized['consecutive_poor_nights'] = $count;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize sleep quality preferences
     *
     * @param array $preferences Raw preferences data
     * @return array Sanitized preferences
     */
    public function sanitizePreferences(array $preferences): array {
        $sanitized = [];
        
        // Sanitize boolean values
        if (isset($preferences['daily_reminder'])) {
            $sanitized['daily_reminder'] = (bool) $preferences['daily_reminder'];
        }
        
        if (isset($preferences['auto_adapt_workouts'])) {
            $sanitized['auto_adapt_workouts'] = (bool) $preferences['auto_adapt_workouts'];
        }
        
        if (isset($preferences['share_with_trainer'])) {
            $sanitized['share_with_trainer'] = (bool) $preferences['share_with_trainer'];
        }
        
        // Sanitize time format
        if (isset($preferences['reminder_time']) && $this->isValidTimeFormat($preferences['reminder_time'])) {
            $sanitized['reminder_time'] = sanitize_text_field($preferences['reminder_time']);
        }
        
        // Sanitize threshold
        if (isset($preferences['minimum_adaptation_threshold'])) {
            $threshold = intval($preferences['minimum_adaptation_threshold']);
            if (in_array($threshold, self::VALID_SLEEP_QUALITY_LEVELS)) {
                $sanitized['minimum_adaptation_threshold'] = $threshold;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Check if time format is valid (HH:MM)
     *
     * @param string $time Time string to validate
     * @return bool Whether time format is valid
     */
    private function isValidTimeFormat(string $time): bool {
        return preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $time) === 1;
    }
    
    /**
     * Check if date format is valid (YYYY-MM-DD)
     *
     * @param string $date Date string to validate
     * @return bool Whether date format is valid
     */
    private function isValidDateFormat(string $date): bool {
        $parsed = date_parse_from_format('Y-m-d', $date);
        return $parsed['error_count'] === 0 && $parsed['warning_count'] === 0;
    }
    
    /**
     * Validate sleep quality level against user context
     *
     * @param int $sleep_quality Sleep quality level
     * @param array $user_profile User profile data
     * @return array Validation with recommendations
     */
    public function validateWithUserContext(int $sleep_quality, array $user_profile = []): array {
        $validation = $this->validateSleepQuality($sleep_quality);
        
        if (!$validation['valid']) {
            return $validation;
        }
        
        $recommendations = [];
        
        // Age-based recommendations
        $age = intval($user_profile['age'] ?? 0);
        if ($age > 60 && $sleep_quality <= 2) {
            $recommendations[] = 'Poor sleep quality can significantly impact recovery for older adults. Consider consulting a healthcare provider.';
        }
        
        // Fitness level considerations
        $fitness_level = strtolower($user_profile['fitness_level'] ?? '');
        if ($fitness_level === 'advanced' && $sleep_quality <= 2) {
            $recommendations[] = 'Advanced training requires quality sleep. Consider adjusting workout intensity until sleep improves.';
        }
        
        // Add recommendations to validation result
        if (!empty($recommendations)) {
            $validation['recommendations'] = $recommendations;
        }
        
        return $validation;
    }
    
    /**
     * Get validation rules summary
     *
     * @return array Validation rules information
     */
    public function getValidationRules(): array {
        return [
            'sleep_quality_levels' => self::VALID_SLEEP_QUALITY_LEVELS,
            'context_fields' => [
                'sleep_hours' => 'Float between 0 and 24',
                'sleep_efficiency' => 'Integer between 0 and 100',
                'wake_up_count' => 'Integer between 0 and 50',
                'bedtime' => 'Time format HH:MM',
                'wake_time' => 'Time format HH:MM',
                'sleep_factors' => 'Array of valid factors',
                'notes' => 'String max ' . self::MAX_CONTEXT_LENGTH . ' characters',
                'consecutive_poor_nights' => 'Integer between 0 and 365'
            ],
            'preferences_fields' => [
                'daily_reminder' => 'Boolean',
                'reminder_time' => 'Time format HH:MM',
                'auto_adapt_workouts' => 'Boolean',
                'minimum_adaptation_threshold' => 'Integer 1-5',
                'share_with_trainer' => 'Boolean'
            ]
        ];
    }
} 