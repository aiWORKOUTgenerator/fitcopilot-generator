<?php
/**
 * FitnessLevelContexts - Fitness Level Context Data
 * 
 * Provides context data for different fitness levels used in AI prompt generation.
 * Extracted from OpenAIProvider.php for modular reuse.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\Context;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * FitnessLevelContexts Class
 * 
 * Static context data for fitness level descriptions and guidance
 */
class FitnessLevelContexts {
    
    /**
     * Get all fitness level contexts
     *
     * @return array Fitness level context data
     */
    public static function getContexts(): array {
        return [
            'beginner' => [
                'description' => 'beginner fitness level',
                'characteristics' => 'new to exercise, building foundation and proper form',
                'exercise_guidance' => 'Focus on basic movements, proper form instruction, and gradual progression. Avoid complex or high-impact exercises.',
                'intensity_adjustment' => 'Keep intensity conservative, prioritize learning over challenge'
            ],
            'intermediate' => [
                'description' => 'intermediate fitness level',
                'characteristics' => 'established routine with 6+ months experience, comfortable with standard exercises',
                'exercise_guidance' => 'Include standard exercises with variations, moderate complexity movements, and progressive challenges.',
                'intensity_adjustment' => 'Can handle moderate to high intensity with proper recovery periods'
            ],
            'advanced' => [
                'description' => 'advanced fitness level',
                'characteristics' => 'experienced with 2+ years training, high fitness capacity and movement competency',
                'exercise_guidance' => 'Include complex movements, advanced techniques, and challenging exercise combinations.',
                'intensity_adjustment' => 'Can handle high intensity and complex movement patterns with minimal rest'
            ]
        ];
    }
    
    /**
     * Get context for a specific fitness level
     *
     * @param string $fitness_level The fitness level
     * @return array Context data for the fitness level
     */
    public static function getContext(string $fitness_level): array {
        $contexts = self::getContexts();
        return $contexts[$fitness_level] ?? $contexts['intermediate'];
    }
    
    /**
     * Get available fitness levels
     *
     * @return array List of available fitness levels
     */
    public static function getAvailableLevels(): array {
        return array_keys(self::getContexts());
    }
} 