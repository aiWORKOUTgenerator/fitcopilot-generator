<?php
/**
 * FragmentManager - Intelligent Fragment Orchestration
 * 
 * Manages the selection and combination of prompt fragments based on context.
 * Provides intelligent fragment selection and composition for optimal prompts.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Core;

use FitCopilot\Service\AI\PromptEngineering\Fragments\FitnessLevel\BeginnerFragments;
use FitCopilot\Service\AI\PromptEngineering\Fragments\FitnessLevel\IntermediateFragments;
use FitCopilot\Service\AI\PromptEngineering\Fragments\FitnessLevel\AdvancedFragments;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Goals\StrengthFragments;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Goals\CardioFragments;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Goals\FlexibilityFragments;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Context\FitnessLevelContexts;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Context\DailyStateContexts;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Context\EnvironmentContexts;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * FragmentManager Class
 * 
 * Intelligent selection and composition of prompt fragments
 */
class FragmentManager {
    
    /**
     * Available fitness level fragments
     *
     * @var array
     */
    private static $fitnessLevelFragments = [
        'beginner' => BeginnerFragments::class,
        'intermediate' => IntermediateFragments::class,
        'advanced' => AdvancedFragments::class
    ];
    
    /**
     * Available goal-specific fragments
     *
     * @var array
     */
    private static $goalFragments = [
        'strength' => StrengthFragments::class,
        'strength_building' => StrengthFragments::class,
        'muscle_building' => StrengthFragments::class,
        'power' => StrengthFragments::class,
        'cardio' => CardioFragments::class,
        'cardiovascular' => CardioFragments::class,
        'endurance' => CardioFragments::class,
        'weight_loss' => CardioFragments::class,
        'flexibility' => FlexibilityFragments::class,
        'mobility' => FlexibilityFragments::class,
        'yoga' => FlexibilityFragments::class,
        'recovery' => FlexibilityFragments::class
    ];
    
    /**
     * Fragment inclusion rules based on context
     *
     * @var array
     */
    private static $inclusionRules = [
        'equipment_guidance' => ['has_equipment_context', 'duration_over_20'],
        'progression' => ['fitness_level_intermediate_plus', 'duration_over_30'],
        'safety' => ['beginner_level', 'has_restrictions', 'over_40_years'],
        'motivation' => ['beginner_level', 'has_stress_context'],
        'recovery' => ['advanced_level', 'duration_over_45'],
        'structure_guidance' => ['duration_over_20'],
        'performance_tracking' => ['intermediate_plus', 'strength_goal'],
        'challenges' => ['intermediate_plus'],
        'specialization' => ['advanced_level'],
        'targeted_areas' => ['flexibility_goal', 'has_restrictions'],
        'benefits' => ['beginner_level', 'motivation_needed']
    ];
    
    /**
     * Get appropriate fitness level fragment
     *
     * @param string $fitness_level User's fitness level
     * @param array $context Additional context for fragment selection
     * @return string Fitness level-specific fragment
     */
    public static function getFitnessLevelFragment(string $fitness_level, array $context = []): string {
        $level = strtolower($fitness_level);
        
        if (!isset(self::$fitnessLevelFragments[$level])) {
            $level = 'intermediate'; // Default fallback
        }
        
        $fragmentClass = self::$fitnessLevelFragments[$level];
        $inclusionContext = self::determineInclusionContext($context);
        
        return $fragmentClass::getCompleteFragment($inclusionContext);
    }
    
    /**
     * Get appropriate goal-specific fragment
     *
     * @param string $goal Primary training goal
     * @param array $context Additional context for fragment selection
     * @return string Goal-specific fragment
     */
    public static function getGoalFragment(string $goal, array $context = []): string {
        $goalKey = strtolower(str_replace([' ', '-'], '_', $goal));
        
        if (!isset(self::$goalFragments[$goalKey])) {
            // Try to match partial goals
            foreach (self::$goalFragments as $key => $fragmentClass) {
                if (strpos($goalKey, $key) !== false || strpos($key, $goalKey) !== false) {
                    $goalKey = $key;
                    break;
                }
            }
            
            // Default fallback to strength if no match
            if (!isset(self::$goalFragments[$goalKey])) {
                $goalKey = 'strength';
            }
        }
        
        $fragmentClass = self::$goalFragments[$goalKey];
        $inclusionContext = self::determineInclusionContext($context);
        
        // Add goal-specific methods based on fragment type
        if ($fragmentClass === StrengthFragments::class) {
            return $fragmentClass::getCompleteStrengthFragment($inclusionContext);
        } elseif ($fragmentClass === CardioFragments::class) {
            return $fragmentClass::getCompleteCardioFragment($inclusionContext);
        } elseif ($fragmentClass === FlexibilityFragments::class) {
            return $fragmentClass::getCompleteFlexibilityFragment($inclusionContext);
        }
        
        return '';
    }
    
    /**
     * Get daily state context fragments
     *
     * @param array $context User's daily state data
     * @return string Daily state context fragments
     */
    public static function getDailyStateFragments(array $context): string {
        $fragments = '';
        
        if (!empty($context['stress_level'])) {
            $stressContext = DailyStateContexts::getStressContext($context['stress_level']);
            if (!empty($stressContext)) {
                $fragments .= "STRESS LEVEL ADAPTATION:\n";
                $fragments .= "- Current State: " . $stressContext['description'] . "\n";
                $fragments .= "- Workout Adaptation: " . $stressContext['workout_adaptation'] . "\n";
                $fragments .= "- Exercise Guidance: " . $stressContext['exercise_guidance'] . "\n\n";
            }
        }
        
        if (!empty($context['energy_level'])) {
            $energyContext = DailyStateContexts::getEnergyContext($context['energy_level']);
            if (!empty($energyContext)) {
                $fragments .= "ENERGY LEVEL ADAPTATION:\n";
                $fragments .= "- Current State: " . $energyContext['description'] . "\n";
                $fragments .= "- Workout Adaptation: " . $energyContext['workout_adaptation'] . "\n";
                $fragments .= "- Intensity Adjustment: " . $energyContext['intensity_adjustment'] . "\n\n";
            }
        }
        
        if (!empty($context['sleep_quality'])) {
            $sleepContext = DailyStateContexts::getSleepContext($context['sleep_quality']);
            if (!empty($sleepContext)) {
                $fragments .= "SLEEP QUALITY ADAPTATION:\n";
                $fragments .= "- Current State: " . $sleepContext['description'] . "\n";
                $fragments .= "- Workout Adaptation: " . $sleepContext['workout_adaptation'] . "\n";
                $fragments .= "- Recovery Priority: " . $sleepContext['recovery_priority'] . "\n\n";
            }
        }
        
        return $fragments;
    }
    
    /**
     * Get environment-specific fragments
     *
     * @param array $context Environment and location data
     * @return string Environment-specific fragments
     */
    public static function getEnvironmentFragments(array $context): string {
        $fragments = '';
        
        if (!empty($context['location'])) {
            $locationContext = EnvironmentContexts::getLocationContext($context['location']);
            if (!empty($locationContext)) {
                $fragments .= "LOCATION ADAPTATION:\n";
                $fragments .= "- Environment: " . $locationContext['description'] . "\n";
                $fragments .= "- Space Guidance: " . $locationContext['space_guidance'] . "\n";
                $fragments .= "- Equipment Adaptation: " . $locationContext['equipment_adaptation'] . "\n";
                
                if (!empty($locationContext['noise_consideration'])) {
                    $fragments .= "- Noise Consideration: " . $locationContext['noise_consideration'] . "\n";
                }
                
                $fragments .= "\n";
            }
        }
        
        return $fragments;
    }
    
    /**
     * Get comprehensive fragment combination
     *
     * @param array $context Complete context data
     * @return string Combined fragment composition
     */
    public static function getComprehensiveFragments(array $context): string {
        $fragments = '';
        
        // Add fitness level fragments
        if (!empty($context['fitness_level'])) {
            $fragments .= self::getFitnessLevelFragment($context['fitness_level'], $context);
        }
        
        // Add goal-specific fragments
        if (!empty($context['daily_focus']) || !empty($context['goals'])) {
            $goal = $context['daily_focus'] ?? $context['goals'] ?? 'general fitness';
            $fragments .= self::getGoalFragment($goal, $context);
        }
        
        // Add daily state adaptations
        if (self::hasDailyStateContext($context)) {
            $fragments .= self::getDailyStateFragments($context);
        }
        
        // Add environment adaptations
        if (!empty($context['location'])) {
            $fragments .= self::getEnvironmentFragments($context);
        }
        
        return $fragments;
    }
    
    /**
     * Determine inclusion context based on rules
     *
     * @param array $context Full context data
     * @return array Inclusion flags for fragment selection
     */
    private static function determineInclusionContext(array $context): array {
        $inclusion = [];
        
        foreach (self::$inclusionRules as $flag => $rules) {
            $inclusion['include_' . $flag] = self::evaluateRules($rules, $context);
        }
        
        return $inclusion;
    }
    
    /**
     * Evaluate inclusion rules
     *
     * @param array $rules Rules to evaluate
     * @param array $context Context data
     * @return bool Whether rules are satisfied
     */
    private static function evaluateRules(array $rules, array $context): bool {
        foreach ($rules as $rule) {
            if (self::evaluateRule($rule, $context)) {
                return true; // OR logic - any rule satisfied
            }
        }
        return false;
    }
    
    /**
     * Evaluate a single rule
     *
     * @param string $rule Rule to evaluate
     * @param array $context Context data
     * @return bool Whether rule is satisfied
     */
    private static function evaluateRule(string $rule, array $context): bool {
        switch ($rule) {
            case 'has_equipment_context':
                return !empty($context['equipment']) && is_array($context['equipment']) && count($context['equipment']) > 0;
                
            case 'duration_over_20':
                return !empty($context['duration']) && $context['duration'] > 20;
                
            case 'duration_over_30':
                return !empty($context['duration']) && $context['duration'] > 30;
                
            case 'duration_over_45':
                return !empty($context['duration']) && $context['duration'] > 45;
                
            case 'fitness_level_intermediate_plus':
            case 'intermediate_plus':
                $level = strtolower($context['fitness_level'] ?? '');
                return in_array($level, ['intermediate', 'advanced']);
                
            case 'beginner_level':
                return strtolower($context['fitness_level'] ?? '') === 'beginner';
                
            case 'advanced_level':
                return strtolower($context['fitness_level'] ?? '') === 'advanced';
                
            case 'has_restrictions':
                return !empty($context['restrictions']) || !empty($context['profile_limitation_notes']);
                
            case 'over_40_years':
                return !empty($context['profile_age']) && $context['profile_age'] > 40;
                
            case 'has_stress_context':
                return !empty($context['stress_level']) && $context['stress_level'] !== 'low';
                
            case 'strength_goal':
                $goal = strtolower($context['daily_focus'] ?? $context['goals'] ?? '');
                return strpos($goal, 'strength') !== false || strpos($goal, 'muscle') !== false;
                
            case 'flexibility_goal':
                $goal = strtolower($context['daily_focus'] ?? $context['goals'] ?? '');
                return strpos($goal, 'flexibility') !== false || strpos($goal, 'mobility') !== false;
                
            case 'motivation_needed':
                return strtolower($context['fitness_level'] ?? '') === 'beginner' || 
                       (!empty($context['energy_level']) && in_array($context['energy_level'], ['low', 'very_low']));
                
            default:
                return false;
        }
    }
    
    /**
     * Check if context has daily state data
     *
     * @param array $context Context data
     * @return bool Whether daily state context exists
     */
    private static function hasDailyStateContext(array $context): bool {
        return !empty($context['stress_level']) || 
               !empty($context['energy_level']) || 
               !empty($context['sleep_quality']);
    }
    
    /**
     * Get fragment statistics
     *
     * @param array $context Context data
     * @return array Fragment usage statistics
     */
    public static function getFragmentStats(array $context): array {
        $stats = [
            'fitness_level_fragments_available' => count(self::$fitnessLevelFragments),
            'goal_fragments_available' => count(self::$goalFragments),
            'inclusion_rules_available' => count(self::$inclusionRules),
            'context_completeness' => self::calculateContextCompleteness($context),
            'estimated_fragment_count' => self::estimateFragmentCount($context),
            'personalization_score' => self::calculatePersonalizationScore($context)
        ];
        
        return $stats;
    }
    
    /**
     * Calculate context completeness percentage
     *
     * @param array $context Context data
     * @return float Completeness percentage (0-100)
     */
    private static function calculateContextCompleteness(array $context): float {
        $expectedFields = [
            'fitness_level', 'daily_focus', 'duration', 'equipment',
            'stress_level', 'energy_level', 'sleep_quality', 'location'
        ];
        
        $presentFields = 0;
        foreach ($expectedFields as $field) {
            if (!empty($context[$field])) {
                $presentFields++;
            }
        }
        
        return round(($presentFields / count($expectedFields)) * 100, 1);
    }
    
    /**
     * Estimate number of fragments that will be used
     *
     * @param array $context Context data
     * @return int Estimated fragment count
     */
    private static function estimateFragmentCount(array $context): int {
        $count = 0;
        
        // Base fragments always included
        if (!empty($context['fitness_level'])) $count++;
        if (!empty($context['daily_focus']) || !empty($context['goals'])) $count++;
        
        // Conditional fragments
        $inclusion = self::determineInclusionContext($context);
        $count += count(array_filter($inclusion));
        
        // Daily state fragments
        if (self::hasDailyStateContext($context)) $count += 3;
        
        // Environment fragments
        if (!empty($context['location'])) $count++;
        
        return $count;
    }
    
    /**
     * Calculate personalization score
     *
     * @param array $context Context data
     * @return float Personalization score (0-100)
     */
    private static function calculatePersonalizationScore(array $context): float {
        $score = 0;
        $maxScore = 100;
        
        // Base personalization (40 points)
        if (!empty($context['fitness_level'])) $score += 15;
        if (!empty($context['daily_focus']) || !empty($context['goals'])) $score += 15;
        if (!empty($context['duration'])) $score += 10;
        
        // Advanced personalization (30 points)
        if (!empty($context['equipment'])) $score += 10;
        if (self::hasDailyStateContext($context)) $score += 15;
        if (!empty($context['location'])) $score += 5;
        
        // Profile personalization (30 points)
        if (!empty($context['profile_age'])) $score += 5;
        if (!empty($context['profile_limitation_notes'])) $score += 10;
        if (!empty($context['restrictions'])) $score += 10;
        if (!empty($context['profile_gender'])) $score += 5;
        
        return min($score, $maxScore);
    }
    
    /**
     * Get available fragment types
     *
     * @return array Available fragment categories and types
     */
    public static function getAvailableFragmentTypes(): array {
        return [
            'fitness_levels' => array_keys(self::$fitnessLevelFragments),
            'goals' => array_keys(self::$goalFragments),
            'inclusion_rules' => array_keys(self::$inclusionRules),
            'context_processors' => ['daily_state', 'environment', 'profile']
        ];
    }
} 