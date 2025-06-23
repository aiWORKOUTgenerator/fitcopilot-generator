<?php
/**
 * ComplexityContexts - Exercise Complexity Context Data
 * 
 * Provides context data for different exercise complexity levels used in AI prompt generation.
 * Extracted from OpenAIProvider.php for modular reuse.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\Context;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * ComplexityContexts Class
 * 
 * Static context data for exercise complexity descriptions and guidance
 */
class ComplexityContexts {
    
    /**
     * Get all complexity level contexts
     *
     * @return array Complexity level context data
     */
    public static function getContexts(): array {
        return [
            'basic' => [
                'description' => 'basic exercise complexity',
                'characteristics' => 'simple, fundamental movements that are easy to learn and execute',
                'movement_guidance' => 'Use single-joint movements, basic bodyweight exercises, and simple equipment usage. Prioritize form over complexity.',
                'progression_strategy' => 'Progress through repetitions, duration, or simple resistance changes'
            ],
            'moderate' => [
                'description' => 'moderate exercise complexity',
                'characteristics' => 'standard exercises with some variation and multi-joint movements',
                'movement_guidance' => 'Include compound movements, exercise combinations, and moderate coordination challenges.',
                'progression_strategy' => 'Progress through movement variations, tempo changes, and moderate complexity increases'
            ],
            'advanced' => [
                'description' => 'advanced exercise complexity',
                'characteristics' => 'complex movements requiring high coordination, balance, and technical skill',
                'movement_guidance' => 'Include plyometrics, complex movement patterns, advanced exercise combinations, and technical skills.',
                'progression_strategy' => 'Progress through advanced variations, complex movement chains, and sport-specific skills'
            ]
        ];
    }
    
    /**
     * Get context for a specific complexity level
     *
     * @param string $complexity_level The complexity level
     * @return array Context data for the complexity level
     */
    public static function getContext(string $complexity_level): array {
        $contexts = self::getContexts();
        return $contexts[$complexity_level] ?? $contexts['moderate'];
    }
    
    /**
     * Get available complexity levels
     *
     * @return array List of available complexity levels
     */
    public static function getAvailableLevels(): array {
        return array_keys(self::getContexts());
    }
} 