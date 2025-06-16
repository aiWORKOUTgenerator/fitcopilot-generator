<?php
/**
 * DailyStateContexts - Daily Physical & Mental State Context Data
 * 
 * Provides context data for stress, energy, and sleep states used in AI prompt generation.
 * Extracted from OpenAIProvider.php for modular reuse.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\Context;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * DailyStateContexts Class
 * 
 * Static context data for daily state descriptions and guidance
 */
class DailyStateContexts {
    
    /**
     * Get all stress level contexts
     *
     * @return array Stress level context data
     */
    public static function getStressContexts(): array {
        return [
            'low' => [
                'description' => 'low stress (calm and relaxed)',
                'workout_adaptation' => 'Can handle normal workout intensity and complexity',
                'exercise_guidance' => 'Standard exercise selection with full range of movements',
                'mental_state' => 'Clear focus, good mind-muscle connection potential'
            ],
            'moderate' => [
                'description' => 'moderate stress (manageable tension)',
                'workout_adaptation' => 'May benefit from stress-relieving exercises',
                'exercise_guidance' => 'Include flow-based movements and mindful transitions',
                'mental_state' => 'May need movement to help process stress'
            ],
            'high' => [
                'description' => 'high stress (feeling overwhelmed)',
                'workout_adaptation' => 'Focus on stress reduction and gentle movement',
                'exercise_guidance' => 'Prioritize yoga-style movements, deep breathing, gentle cardio',
                'mental_state' => 'Needs calming, centering activities'
            ],
            'very_high' => [
                'description' => 'very high stress (significant tension)',
                'workout_adaptation' => 'Prioritize calming, restorative exercises',
                'exercise_guidance' => 'Focus on meditation, gentle stretching, walking, breathing exercises',
                'mental_state' => 'Requires gentle, therapeutic movement'
            ]
        ];
    }
    
    /**
     * Get all energy level contexts
     *
     * @return array Energy level context data
     */
    public static function getEnergyContexts(): array {
        return [
            'very_low' => [
                'description' => 'very low energy (drained/exhausted)',
                'workout_adaptation' => 'Use gentle, energizing movements',
                'exercise_guidance' => 'Light stretching, easy walking, gentle yoga',
                'intensity_adjustment' => 'Significantly reduce intensity, focus on restoration'
            ],
            'low' => [
                'description' => 'low energy (sluggish but functional)',
                'workout_adaptation' => 'Start slow, build gradually',
                'exercise_guidance' => 'Extended warm-up, build energy through movement',
                'intensity_adjustment' => 'Reduce planned intensity by 20-30%'
            ],
            'moderate' => [
                'description' => 'moderate energy (balanced and steady)',
                'workout_adaptation' => 'Standard workout approach',
                'exercise_guidance' => 'Proceed with planned workout structure',
                'intensity_adjustment' => 'Maintain planned intensity levels'
            ],
            'high' => [
                'description' => 'high energy (energetic and motivated)',
                'workout_adaptation' => 'Can handle challenging workouts',
                'exercise_guidance' => 'Take advantage of motivation for harder exercises',
                'intensity_adjustment' => 'Can increase intensity by 10-20%'
            ],
            'very_high' => [
                'description' => 'very high energy (pumped and ready)',
                'workout_adaptation' => 'Perfect for high-intensity training',
                'exercise_guidance' => 'Include explosive movements, challenging variations',
                'intensity_adjustment' => 'Can handle maximum planned intensity'
            ]
        ];
    }
    
    /**
     * Get all sleep quality contexts
     *
     * @return array Sleep quality context data
     */
    public static function getSleepContexts(): array {
        return [
            'poor' => [
                'description' => 'poor sleep (restless night, tired)',
                'workout_adaptation' => 'Reduce intensity, focus on gentle movement',
                'exercise_guidance' => 'Avoid high-impact, emphasize recovery movements',
                'recovery_priority' => 'Prioritize movement quality over quantity'
            ],
            'fair' => [
                'description' => 'fair sleep (some rest, not fully refreshed)',
                'workout_adaptation' => 'Moderate intensity with extra warm-up',
                'exercise_guidance' => 'Extended preparation, listen to body cues',
                'recovery_priority' => 'Monitor fatigue levels throughout workout'
            ],
            'good' => [
                'description' => 'good sleep (well-rested and refreshed)',
                'workout_adaptation' => 'Normal workout intensity',
                'exercise_guidance' => 'Proceed with standard workout plan',
                'recovery_priority' => 'Normal recovery expectations'
            ],
            'excellent' => [
                'description' => 'excellent sleep (fully recharged)',
                'workout_adaptation' => 'Can handle high-intensity training',
                'exercise_guidance' => 'Take advantage of peak recovery state',
                'recovery_priority' => 'Optimal conditions for challenging workout'
            ]
        ];
    }
    
    /**
     * Get context for a specific stress level
     *
     * @param string $stress_level The stress level
     * @return array Context data for the stress level
     */
    public static function getStressContext(string $stress_level): array {
        $contexts = self::getStressContexts();
        return $contexts[$stress_level] ?? [];
    }
    
    /**
     * Get context for a specific energy level
     *
     * @param string $energy_level The energy level
     * @return array Context data for the energy level
     */
    public static function getEnergyContext(string $energy_level): array {
        $contexts = self::getEnergyContexts();
        return $contexts[$energy_level] ?? [];
    }
    
    /**
     * Get context for a specific sleep quality
     *
     * @param string $sleep_quality The sleep quality
     * @return array Context data for the sleep quality
     */
    public static function getSleepContext(string $sleep_quality): array {
        $contexts = self::getSleepContexts();
        return $contexts[$sleep_quality] ?? [];
    }
} 