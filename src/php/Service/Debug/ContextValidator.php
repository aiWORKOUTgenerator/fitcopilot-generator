<?php
/**
 * ContextValidator - Context Validation Service
 * 
 * Validates context data structure, checks completeness, identifies missing required fields,
 * and generates comprehensive validation reports for debugging purposes.
 */

namespace FitCopilot\Service\Debug;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * ContextValidator Class
 * 
 * Comprehensive context validation and analysis
 */
class ContextValidator {
    
    /**
     * Required fields for different context types
     */
    const REQUIRED_FIELDS = [
        'profile' => [
            'fitness_level' => 'string',
        ],
        'session' => [
            'duration' => 'integer',
        ],
        'workout_generation' => [
            'duration' => 'integer',
            'fitness_level' => 'string',
        ]
    ];
    
    /**
     * Optional but recommended fields
     */
    const RECOMMENDED_FIELDS = [
        'profile' => [
            'profile_age' => 'integer',
            'profile_weight' => 'numeric',
            'profile_gender' => 'string',
            'profile_limitation_notes' => 'string'
        ],
        'session' => [
            'equipment' => 'array',
            'daily_focus' => 'string',
            'stress_level' => 'string',
            'energy_level' => 'string',
            'sleep_quality' => 'string',
            'restrictions' => 'array'
        ]
    ];
    
    /**
     * Valid values for specific fields
     */
    const VALID_VALUES = [
        'fitness_level' => ['beginner', 'intermediate', 'advanced'],
        'stress_level' => ['low', 'moderate', 'high', 'very_high'],
        'energy_level' => ['very_low', 'low', 'moderate', 'high', 'very_high'],
        'sleep_quality' => ['poor', 'fair', 'good', 'excellent'],
        'profile_gender' => ['male', 'female', 'other', 'prefer_not_to_say']
    ];
    
    /**
     * Validate complete context data
     *
     * @param array $context_data Context data to validate
     * @param string $validation_type Type of validation (profile, session, workout_generation)
     * @return array Validation result
     */
    public function validateContext(array $context_data, string $validation_type = 'workout_generation'): array {
        $validation_result = [
            'is_valid' => true,
            'validation_type' => $validation_type,
            'timestamp' => current_time('mysql'),
            'errors' => [],
            'warnings' => [],
            'recommendations' => [],
            'completeness_score' => 0,
            'field_analysis' => [],
            'summary' => []
        ];
        
        // Validate required fields
        $required_validation = $this->validateRequiredFields($context_data, $validation_type);
        $validation_result['errors'] = array_merge($validation_result['errors'], $required_validation['errors']);
        
        // Validate field types and values
        $type_validation = $this->validateFieldTypes($context_data);
        $validation_result['errors'] = array_merge($validation_result['errors'], $type_validation['errors']);
        $validation_result['warnings'] = array_merge($validation_result['warnings'], $type_validation['warnings']);
        
        // Check recommended fields
        $recommended_validation = $this->validateRecommendedFields($context_data, $validation_type);
        $validation_result['recommendations'] = $recommended_validation['recommendations'];
        
        // Calculate completeness score
        $validation_result['completeness_score'] = $this->calculateCompletenessScore($context_data, $validation_type);
        
        // Analyze individual fields
        $validation_result['field_analysis'] = $this->analyzeFields($context_data);
        
        // Generate summary
        $validation_result['summary'] = $this->generateValidationSummary($validation_result);
        
        // Set overall validity
        $validation_result['is_valid'] = empty($validation_result['errors']);
        
        return $validation_result;
    }
    
    /**
     * Validate required fields
     *
     * @param array $context_data Context data
     * @param string $validation_type Validation type
     * @return array Validation result
     */
    private function validateRequiredFields(array $context_data, string $validation_type): array {
        $errors = [];
        $required_fields = self::REQUIRED_FIELDS[$validation_type] ?? [];
        
        foreach ($required_fields as $field => $expected_type) {
            if (!isset($context_data[$field])) {
                $errors[] = [
                    'type' => 'missing_required_field',
                    'field' => $field,
                    'message' => "Required field '{$field}' is missing",
                    'expected_type' => $expected_type
                ];
            } elseif (empty($context_data[$field]) && $context_data[$field] !== 0) {
                $errors[] = [
                    'type' => 'empty_required_field',
                    'field' => $field,
                    'message' => "Required field '{$field}' is empty",
                    'expected_type' => $expected_type,
                    'actual_value' => $context_data[$field]
                ];
            }
        }
        
        return ['errors' => $errors];
    }
    
    /**
     * Validate field types and values
     *
     * @param array $context_data Context data
     * @return array Validation result
     */
    private function validateFieldTypes(array $context_data): array {
        $errors = [];
        $warnings = [];
        
        foreach ($context_data as $field => $value) {
            if ($value === null || $value === '') {
                continue; // Skip empty values
            }
            
            $validation = $this->validateSingleField($field, $value);
            
            if (!$validation['is_valid']) {
                if ($validation['severity'] === 'error') {
                    $errors[] = $validation;
                } else {
                    $warnings[] = $validation;
                }
            }
        }
        
        return [
            'errors' => $errors,
            'warnings' => $warnings
        ];
    }
    
    /**
     * Validate a single field
     *
     * @param string $field Field name
     * @param mixed $value Field value
     * @return array Validation result
     */
    private function validateSingleField(string $field, $value): array {
        $validation = [
            'is_valid' => true,
            'field' => $field,
            'value' => $value,
            'severity' => 'info'
        ];
        
        // Type validation
        switch ($field) {
            case 'duration':
            case 'profile_age':
                if (!is_numeric($value) || $value <= 0) {
                    $validation['is_valid'] = false;
                    $validation['severity'] = 'error';
                    $validation['message'] = "Field '{$field}' must be a positive number";
                    $validation['type'] = 'invalid_type';
                }
                break;
                
            case 'profile_weight':
                if (!is_numeric($value) || $value <= 0) {
                    $validation['is_valid'] = false;
                    $validation['severity'] = 'error';
                    $validation['message'] = "Field '{$field}' must be a positive number";
                    $validation['type'] = 'invalid_type';
                }
                break;
                
            case 'equipment':
            case 'restrictions':
                if (!is_array($value)) {
                    $validation['is_valid'] = false;
                    $validation['severity'] = 'error';
                    $validation['message'] = "Field '{$field}' must be an array";
                    $validation['type'] = 'invalid_type';
                }
                break;
        }
        
        // Value validation
        if (isset(self::VALID_VALUES[$field])) {
            $valid_values = self::VALID_VALUES[$field];
            if (!in_array($value, $valid_values)) {
                $validation['is_valid'] = false;
                $validation['severity'] = 'warning';
                $validation['message'] = "Field '{$field}' has unexpected value '{$value}'. Valid values: " . implode(', ', $valid_values);
                $validation['type'] = 'invalid_value';
                $validation['valid_values'] = $valid_values;
            }
        }
        
        // Range validation
        switch ($field) {
            case 'duration':
                if (is_numeric($value)) {
                    if ($value < 5) {
                        $validation['is_valid'] = false;
                        $validation['severity'] = 'warning';
                        $validation['message'] = "Duration of {$value} minutes is very short. Minimum recommended: 5 minutes";
                        $validation['type'] = 'value_out_of_range';
                    } elseif ($value > 120) {
                        $validation['is_valid'] = false;
                        $validation['severity'] = 'warning';
                        $validation['message'] = "Duration of {$value} minutes is very long. Maximum recommended: 120 minutes";
                        $validation['type'] = 'value_out_of_range';
                    }
                }
                break;
                
            case 'profile_age':
                if (is_numeric($value)) {
                    if ($value < 13) {
                        $validation['is_valid'] = false;
                        $validation['severity'] = 'error';
                        $validation['message'] = "Age must be 13 or older";
                        $validation['type'] = 'value_out_of_range';
                    } elseif ($value > 100) {
                        $validation['is_valid'] = false;
                        $validation['severity'] = 'warning';
                        $validation['message'] = "Age of {$value} seems unusually high";
                        $validation['type'] = 'value_out_of_range';
                    }
                }
                break;
        }
        
        return $validation;
    }
    
    /**
     * Validate recommended fields
     *
     * @param array $context_data Context data
     * @param string $validation_type Validation type
     * @return array Validation result
     */
    private function validateRecommendedFields(array $context_data, string $validation_type): array {
        $recommendations = [];
        $recommended_fields = self::RECOMMENDED_FIELDS[$validation_type] ?? [];
        
        foreach ($recommended_fields as $field => $expected_type) {
            if (!isset($context_data[$field]) || empty($context_data[$field])) {
                $recommendations[] = [
                    'type' => 'missing_recommended_field',
                    'field' => $field,
                    'message' => "Recommended field '{$field}' is missing. This could improve workout personalization.",
                    'expected_type' => $expected_type,
                    'benefit' => $this->getFieldBenefit($field)
                ];
            }
        }
        
        return ['recommendations' => $recommendations];
    }
    
    /**
     * Calculate completeness score
     *
     * @param array $context_data Context data
     * @param string $validation_type Validation type
     * @return float Completeness score (0-100)
     */
    private function calculateCompletenessScore(array $context_data, string $validation_type): float {
        $required_fields = self::REQUIRED_FIELDS[$validation_type] ?? [];
        $recommended_fields = self::RECOMMENDED_FIELDS[$validation_type] ?? [];
        
        $total_fields = count($required_fields) + count($recommended_fields);
        if ($total_fields === 0) {
            return 100.0;
        }
        
        $present_fields = 0;
        
        // Count required fields (weighted more heavily)
        foreach ($required_fields as $field => $type) {
            if (isset($context_data[$field]) && !empty($context_data[$field])) {
                $present_fields += 2; // Required fields count double
            }
        }
        
        // Count recommended fields
        foreach ($recommended_fields as $field => $type) {
            if (isset($context_data[$field]) && !empty($context_data[$field])) {
                $present_fields += 1;
            }
        }
        
        $max_score = (count($required_fields) * 2) + count($recommended_fields);
        return round(($present_fields / $max_score) * 100, 1);
    }
    
    /**
     * Analyze individual fields
     *
     * @param array $context_data Context data
     * @return array Field analysis
     */
    private function analyzeFields(array $context_data): array {
        $analysis = [];
        
        foreach ($context_data as $field => $value) {
            $field_analysis = [
                'field' => $field,
                'value' => $value,
                'type' => gettype($value),
                'is_empty' => empty($value) && $value !== 0,
                'length' => is_string($value) ? strlen($value) : (is_array($value) ? count($value) : null),
                'quality_score' => $this->calculateFieldQualityScore($field, $value)
            ];
            
            // Add specific analysis based on field type
            switch ($field) {
                case 'equipment':
                    if (is_array($value)) {
                        $field_analysis['equipment_count'] = count($value);
                        $field_analysis['equipment_types'] = $value;
                    }
                    break;
                    
                case 'profile_limitation_notes':
                    if (is_string($value)) {
                        $field_analysis['word_count'] = str_word_count($value);
                        $field_analysis['has_specific_limitations'] = $this->hasSpecificLimitations($value);
                    }
                    break;
            }
            
            $analysis[$field] = $field_analysis;
        }
        
        return $analysis;
    }
    
    /**
     * Calculate quality score for a field
     *
     * @param string $field Field name
     * @param mixed $value Field value
     * @return int Quality score (0-100)
     */
    private function calculateFieldQualityScore(string $field, $value): int {
        if (empty($value) && $value !== 0) {
            return 0;
        }
        
        $score = 50; // Base score for having a value
        
        // Field-specific quality checks
        switch ($field) {
            case 'fitness_level':
                if (in_array($value, self::VALID_VALUES[$field])) {
                    $score = 100;
                }
                break;
                
            case 'duration':
                if (is_numeric($value) && $value >= 15 && $value <= 90) {
                    $score = 100;
                } elseif (is_numeric($value) && $value >= 5 && $value <= 120) {
                    $score = 80;
                }
                break;
                
            case 'equipment':
                if (is_array($value)) {
                    $score = 70 + min(30, count($value) * 10); // More equipment = higher score
                }
                break;
                
            case 'profile_limitation_notes':
                if (is_string($value) && strlen($value) > 10) {
                    $score = 90; // Detailed notes are valuable
                }
                break;
                
            default:
                if (isset(self::VALID_VALUES[$field]) && in_array($value, self::VALID_VALUES[$field])) {
                    $score = 100;
                } else {
                    $score = 70; // Has value but not validated
                }
        }
        
        return $score;
    }
    
    /**
     * Generate validation summary
     *
     * @param array $validation_result Validation result
     * @return array Summary
     */
    private function generateValidationSummary(array $validation_result): array {
        return [
            'overall_status' => $validation_result['is_valid'] ? 'valid' : 'invalid',
            'error_count' => count($validation_result['errors']),
            'warning_count' => count($validation_result['warnings']),
            'recommendation_count' => count($validation_result['recommendations']),
            'completeness_score' => $validation_result['completeness_score'],
            'quality_assessment' => $this->getQualityAssessment($validation_result['completeness_score']),
            'primary_issues' => $this->getPrimaryIssues($validation_result),
            'next_steps' => $this->getNextSteps($validation_result)
        ];
    }
    
    /**
     * Get field benefit description
     *
     * @param string $field Field name
     * @return string Benefit description
     */
    private function getFieldBenefit(string $field): string {
        $benefits = [
            'profile_age' => 'Enables age-appropriate exercise selection and intensity adjustments',
            'profile_weight' => 'Allows for weight-based exercise modifications and progression tracking',
            'profile_gender' => 'Enables gender-informed exercise recommendations',
            'profile_limitation_notes' => 'Critical for safety and exercise modifications',
            'equipment' => 'Enables equipment-specific workout customization',
            'stress_level' => 'Allows workout intensity adjustment based on current stress',
            'energy_level' => 'Enables energy-appropriate workout selection',
            'sleep_quality' => 'Allows recovery-based workout adjustments',
            'restrictions' => 'Critical for safety and injury prevention'
        ];
        
        return $benefits[$field] ?? 'Improves workout personalization';
    }
    
    /**
     * Get quality assessment
     *
     * @param float $completeness_score Completeness score
     * @return string Quality assessment
     */
    private function getQualityAssessment(float $completeness_score): string {
        if ($completeness_score >= 90) {
            return 'excellent';
        } elseif ($completeness_score >= 75) {
            return 'good';
        } elseif ($completeness_score >= 50) {
            return 'fair';
        } else {
            return 'poor';
        }
    }
    
    /**
     * Get primary issues
     *
     * @param array $validation_result Validation result
     * @return array Primary issues
     */
    private function getPrimaryIssues(array $validation_result): array {
        $issues = [];
        
        // Critical errors
        foreach ($validation_result['errors'] as $error) {
            if ($error['type'] === 'missing_required_field') {
                $issues[] = "Missing required field: {$error['field']}";
            }
        }
        
        // Major warnings
        foreach ($validation_result['warnings'] as $warning) {
            if ($warning['type'] === 'invalid_value') {
                $issues[] = "Invalid value for {$warning['field']}: {$warning['value']}";
            }
        }
        
        return array_slice($issues, 0, 3); // Top 3 issues
    }
    
    /**
     * Get next steps
     *
     * @param array $validation_result Validation result
     * @return array Next steps
     */
    private function getNextSteps(array $validation_result): array {
        $steps = [];
        
        if (!empty($validation_result['errors'])) {
            $steps[] = 'Fix validation errors before proceeding';
        }
        
        if ($validation_result['completeness_score'] < 75) {
            $steps[] = 'Add recommended fields to improve personalization';
        }
        
        if (!empty($validation_result['warnings'])) {
            $steps[] = 'Review and correct field values with warnings';
        }
        
        if (empty($steps)) {
            $steps[] = 'Context validation passed - ready for workout generation';
        }
        
        return $steps;
    }
    
    /**
     * Check if limitation notes contain specific limitations
     *
     * @param string $notes Limitation notes
     * @return bool Whether notes contain specific limitations
     */
    private function hasSpecificLimitations(string $notes): bool {
        $limitation_keywords = [
            'knee', 'back', 'shoulder', 'ankle', 'wrist', 'neck', 'hip',
            'injury', 'pain', 'surgery', 'arthritis', 'diabetes',
            'heart', 'blood pressure', 'asthma'
        ];
        
        $notes_lower = strtolower($notes);
        foreach ($limitation_keywords as $keyword) {
            if (strpos($notes_lower, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
} 