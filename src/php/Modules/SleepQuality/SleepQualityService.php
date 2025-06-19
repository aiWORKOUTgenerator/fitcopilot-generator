<?php
/**
 * SleepQuality Service
 * 
 * Business logic layer for sleep quality management.
 * Handles sleep quality selection, validation, persistence, and workout adaptation logic.
 */

namespace FitCopilot\Modules\SleepQuality;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SleepQuality Service Class
 * 
 * Core business logic for sleep quality functionality
 */
class SleepQualityService {
    
    /**
     * Sleep quality repository
     *
     * @var SleepQualityRepository
     */
    private $repository;
    
    /**
     * Sleep quality validator
     *
     * @var SleepQualityValidator
     */
    private $validator;
    
    /**
     * Sleep quality levels configuration
     *
     * @var array
     */
    private $sleepQualityLevels = [
        1 => [
            'label' => 'Poor',
            'description' => 'Very restless sleep, feeling exhausted',
            'icon' => '😴',
            'workout_impact' => 'low_intensity',
            'adaptation' => 'Focus on gentle movement and recovery',
            'intensity_modifier' => -0.3,
            'duration_modifier' => -0.2
        ],
        2 => [
            'label' => 'Below Average',
            'description' => 'Somewhat restless, tired but functional',
            'icon' => '😪',
            'workout_impact' => 'reduced_intensity',
            'adaptation' => 'Light to moderate exercise, avoid high intensity',
            'intensity_modifier' => -0.2,
            'duration_modifier' => -0.1
        ],
        3 => [
            'label' => 'Average',
            'description' => 'Adequate sleep, feeling okay',
            'icon' => '😌',
            'workout_impact' => 'normal',
            'adaptation' => 'Standard workout intensity appropriate',
            'intensity_modifier' => 0,
            'duration_modifier' => 0
        ],
        4 => [
            'label' => 'Good',
            'description' => 'Refreshing sleep, feeling energized',
            'icon' => '😊',
            'workout_impact' => 'enhanced',
            'adaptation' => 'Can handle higher intensity and volume',
            'intensity_modifier' => 0.1,
            'duration_modifier' => 0.1
        ],
        5 => [
            'label' => 'Excellent',
            'description' => 'Deep, restorative sleep, fully refreshed',
            'icon' => '🌟',
            'workout_impact' => 'optimal',
            'adaptation' => 'Prime for challenging workouts and progression',
            'intensity_modifier' => 0.2,
            'duration_modifier' => 0.15
        ]
    ];
    
    /**
     * Constructor
     *
     * @param SleepQualityRepository $repository Repository instance
     * @param SleepQualityValidator $validator Validator instance
     */
    public function __construct(SleepQualityRepository $repository, SleepQualityValidator $validator) {
        $this->repository = $repository;
        $this->validator = $validator;
    }
    
    /**
     * Save user's sleep quality selection
     *
     * @param int $user_id User ID
     * @param int $sleep_quality Sleep quality level (1-5)
     * @param array $context Additional context data
     * @return array Result with success status and data
     */
    public function saveSleepQuality(int $user_id, int $sleep_quality, array $context = []): array {
        try {
            // Validate sleep quality input
            $validation = $this->validator->validateSleepQuality($sleep_quality, $context);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'message' => 'Invalid sleep quality data',
                    'errors' => $validation['errors']
                ];
            }
            
            // Prepare sleep quality data
            $sleep_data = [
                'level' => $sleep_quality,
                'timestamp' => current_time('mysql'),
                'context' => $context,
                'workout_adaptations' => $this->calculateWorkoutAdaptations($sleep_quality, $context)
            ];
            
            // Save to repository
            $saved = $this->repository->saveSleepQuality($user_id, $sleep_data);
            
            if ($saved) {
                error_log("[SleepQualityService] Sleep quality saved for user {$user_id}: level {$sleep_quality}");
                
                return [
                    'success' => true,
                    'message' => 'Sleep quality saved successfully',
                    'data' => [
                        'sleep_quality' => $sleep_quality,
                        'level_info' => $this->sleepQualityLevels[$sleep_quality],
                        'workout_adaptations' => $sleep_data['workout_adaptations']
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to save sleep quality'
                ];
            }
            
        } catch (\Exception $e) {
            error_log("[SleepQualityService] Error saving sleep quality: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error saving sleep quality: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get user's current sleep quality
     *
     * @param int $user_id User ID
     * @return array Result with sleep quality data
     */
    public function getSleepQuality(int $user_id): array {
        try {
            $sleep_data = $this->repository->getSleepQuality($user_id);
            
            if ($sleep_data) {
                return [
                    'success' => true,
                    'data' => [
                        'sleep_quality' => $sleep_data['level'],
                        'level_info' => $this->sleepQualityLevels[$sleep_data['level']],
                        'timestamp' => $sleep_data['timestamp'],
                        'context' => $sleep_data['context'] ?? [],
                        'workout_adaptations' => $sleep_data['workout_adaptations'] ?? []
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'No sleep quality data found'
                ];
            }
            
        } catch (\Exception $e) {
            error_log("[SleepQualityService] Error getting sleep quality: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error retrieving sleep quality data'
            ];
        }
    }
    
    /**
     * Get sleep quality recommendations based on user profile
     *
     * @param array $user_profile User profile data
     * @return array Sleep quality recommendations
     */
    public function getSleepRecommendations(array $user_profile): array {
        $recommendations = [];
        
        // Age-based recommendations
        $age = intval($user_profile['age'] ?? 30);
        if ($age > 50) {
            $recommendations[] = [
                'type' => 'age_consideration',
                'message' => 'Sleep quality becomes increasingly important for recovery as we age',
                'suggestion' => 'Consider prioritizing sleep consistency and aiming for 7-9 hours'
            ];
        }
        
        // Fitness level considerations
        $fitness_level = strtolower($user_profile['fitness_level'] ?? 'intermediate');
        if ($fitness_level === 'advanced') {
            $recommendations[] = [
                'type' => 'training_intensity',
                'message' => 'Advanced training requires optimal recovery',
                'suggestion' => 'Poor sleep quality may require reducing workout intensity by 20-30%'
            ];
        } else if ($fitness_level === 'beginner') {
            $recommendations[] = [
                'type' => 'adaptation',
                'message' => 'New to exercise? Sleep quality affects adaptation',
                'suggestion' => 'Even with poor sleep, light exercise can help improve sleep patterns'
            ];
        }
        
        // Stress level interactions
        if (!empty($user_profile['stress_level']) && $user_profile['stress_level'] > 3) {
            $recommendations[] = [
                'type' => 'stress_sleep_cycle',
                'message' => 'High stress and poor sleep create a challenging cycle',
                'suggestion' => 'Focus on recovery-based workouts when both stress and sleep are poor'
            ];
        }
        
        // Equipment-based adaptations
        if (!empty($user_profile['equipment'])) {
            $has_minimal_equipment = count($user_profile['equipment']) <= 2;
            if ($has_minimal_equipment) {
                $recommendations[] = [
                    'type' => 'equipment_adaptation',
                    'message' => 'Bodyweight exercises are excellent for poor sleep days',
                    'suggestion' => 'Gentle yoga or stretching routines require no equipment and aid recovery'
                ];
            }
        }
        
        return [
            'recommendations' => $recommendations,
            'general_guidance' => [
                'poor_sleep' => 'Focus on gentle movement, stretching, and light cardio',
                'average_sleep' => 'Normal workout intensity is appropriate',
                'good_sleep' => 'Great time for challenging workouts and skill development'
            ]
        ];
    }
    
    /**
     * Calculate workout adaptations based on sleep quality
     *
     * @param int $sleep_quality Sleep quality level (1-5)
     * @param array $context Additional context
     * @return array Workout adaptation recommendations
     */
    private function calculateWorkoutAdaptations(int $sleep_quality, array $context = []): array {
        $level_info = $this->sleepQualityLevels[$sleep_quality];
        
        $adaptations = [
            'intensity_adjustment' => $level_info['intensity_modifier'],
            'duration_adjustment' => $level_info['duration_modifier'],
            'workout_focus' => $this->getRecommendedFocus($sleep_quality),
            'exercise_types' => $this->getRecommendedExerciseTypes($sleep_quality),
            'recovery_priority' => $this->getRecoveryPriority($sleep_quality),
            'motivation_strategy' => $this->getMotivationStrategy($sleep_quality)
        ];
        
        // Context-specific adjustments
        if (!empty($context['consecutive_poor_nights']) && $context['consecutive_poor_nights'] > 2) {
            $adaptations['special_consideration'] = 'Multiple nights of poor sleep - prioritize complete rest or very gentle movement';
            $adaptations['intensity_adjustment'] = min($adaptations['intensity_adjustment'], -0.4);
        }
        
        return $adaptations;
    }
    
    /**
     * Get recommended workout focus based on sleep quality
     *
     * @param int $sleep_quality Sleep quality level
     * @return string Recommended focus
     */
    private function getRecommendedFocus(int $sleep_quality): string {
        switch ($sleep_quality) {
            case 1:
            case 2:
                return 'recovery_and_mobility';
            case 3:
                return 'moderate_activity';
            case 4:
                return 'strength_or_cardio';
            case 5:
                return 'high_intensity_or_skill';
            default:
                return 'moderate_activity';
        }
    }
    
    /**
     * Get recommended exercise types based on sleep quality
     *
     * @param int $sleep_quality Sleep quality level
     * @return array Recommended exercise types
     */
    private function getRecommendedExerciseTypes(int $sleep_quality): array {
        switch ($sleep_quality) {
            case 1:
                return ['gentle_stretching', 'breathing_exercises', 'light_walking'];
            case 2:
                return ['yoga', 'light_bodyweight', 'easy_cardio'];
            case 3:
                return ['moderate_strength', 'steady_cardio', 'flexibility'];
            case 4:
                return ['strength_training', 'interval_cardio', 'skill_work'];
            case 5:
                return ['high_intensity_training', 'heavy_lifting', 'complex_movements', 'sport_specific'];
            default:
                return ['moderate_strength', 'steady_cardio'];
        }
    }
    
    /**
     * Get recovery priority level
     *
     * @param int $sleep_quality Sleep quality level
     * @return string Recovery priority
     */
    private function getRecoveryPriority(int $sleep_quality): string {
        if ($sleep_quality <= 2) {
            return 'high';
        } else if ($sleep_quality == 3) {
            return 'moderate';
        } else {
            return 'normal';
        }
    }
    
    /**
     * Get motivation strategy based on sleep quality
     *
     * @param int $sleep_quality Sleep quality level
     * @return string Motivation strategy
     */
    private function getMotivationStrategy(int $sleep_quality): string {
        switch ($sleep_quality) {
            case 1:
            case 2:
                return 'gentle_encouragement';
            case 3:
                return 'standard_motivation';
            case 4:
            case 5:
                return 'challenge_focused';
            default:
                return 'standard_motivation';
        }
    }
    
    /**
     * Get all sleep quality levels
     *
     * @return array Sleep quality levels configuration
     */
    public function getSleepQualityLevels(): array {
        return $this->sleepQualityLevels;
    }
    
    /**
     * Get sleep quality level info
     *
     * @param int $level Sleep quality level
     * @return array|null Level information
     */
    public function getSleepQualityLevelInfo(int $level): ?array {
        return $this->sleepQualityLevels[$level] ?? null;
    }
    
    /**
     * Check if sleep quality level is valid
     *
     * @param int $level Sleep quality level
     * @return bool Whether level is valid
     */
    public function isValidSleepQualityLevel(int $level): bool {
        return isset($this->sleepQualityLevels[$level]);
    }
    
    /**
     * Get sleep quality statistics for a user
     *
     * @param int $user_id User ID
     * @param int $days Number of days to analyze (default 7)
     * @return array Sleep quality statistics
     */
    public function getSleepQualityStats(int $user_id, int $days = 7): array {
        try {
            $sleep_history = $this->repository->getSleepQualityHistory($user_id, $days);
            
            if (empty($sleep_history)) {
                return [
                    'success' => false,
                    'message' => 'No sleep quality data available'
                ];
            }
            
            $levels = array_column($sleep_history, 'level');
            $average = array_sum($levels) / count($levels);
            
            return [
                'success' => true,
                'data' => [
                    'average_sleep_quality' => round($average, 1),
                    'total_entries' => count($sleep_history),
                    'days_analyzed' => $days,
                    'trend' => $this->calculateSleepTrend($levels),
                    'distribution' => array_count_values($levels),
                    'recommendations' => $this->generateTrendRecommendations($average, $levels)
                ]
            ];
            
        } catch (\Exception $e) {
            error_log("[SleepQualityService] Error getting sleep stats: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error retrieving sleep quality statistics'
            ];
        }
    }
    
    /**
     * Calculate sleep quality trend
     *
     * @param array $levels Array of sleep quality levels
     * @return string Trend description
     */
    private function calculateSleepTrend(array $levels): string {
        if (count($levels) < 3) {
            return 'insufficient_data';
        }
        
        $recent = array_slice($levels, -3);
        $earlier = array_slice($levels, 0, -3);
        
        $recent_avg = array_sum($recent) / count($recent);
        $earlier_avg = array_sum($earlier) / count($earlier);
        
        $difference = $recent_avg - $earlier_avg;
        
        if ($difference > 0.5) {
            return 'improving';
        } else if ($difference < -0.5) {
            return 'declining';
        } else {
            return 'stable';
        }
    }
    
    /**
     * Generate trend-based recommendations
     *
     * @param float $average Average sleep quality
     * @param array $levels Sleep quality levels
     * @return array Recommendations
     */
    private function generateTrendRecommendations(float $average, array $levels): array {
        $recommendations = [];
        
        if ($average < 2.5) {
            $recommendations[] = 'Consider consulting a healthcare provider about sleep quality';
            $recommendations[] = 'Focus on recovery-based workouts until sleep improves';
        } else if ($average > 4.0) {
            $recommendations[] = 'Excellent sleep quality! Great time for challenging workouts';
        }
        
        $trend = $this->calculateSleepTrend($levels);
        switch ($trend) {
            case 'declining':
                $recommendations[] = 'Sleep quality declining - review sleep hygiene practices';
                break;
            case 'improving':
                $recommendations[] = 'Sleep quality improving - gradually increase workout intensity';
                break;
        }
        
        return $recommendations;
    }
} 