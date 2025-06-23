<?php
/**
 * IntensityContexts - Intensity Level Context Data
 * 
 * Provides context data for different intensity levels used in AI prompt generation.
 * Extracted from OpenAIProvider.php for modular reuse.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\Context;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * IntensityContexts Class
 * 
 * Static context data for intensity level descriptions and guidance
 */
class IntensityContexts {
    
    /**
     * Get all intensity level contexts
     *
     * @return array Intensity level context data
     */
    public static function getContexts(): array {
        return [
            1 => [
                'description' => 'very low intensity',
                'characteristics' => 'gentle, recovery-focused effort',
                'pacing_guidance' => 'Emphasize slow, controlled movements with extended rest periods. Focus on mobility and light activation.',
                'heart_rate_zone' => 'Zone 1-2 (50-70% max HR)'
            ],
            2 => [
                'description' => 'low intensity',
                'characteristics' => 'light activity, easy conversational pace',
                'pacing_guidance' => 'Comfortable effort that allows for easy conversation. Moderate rest periods between exercises.',
                'heart_rate_zone' => 'Zone 2 (60-70% max HR)'
            ],
            3 => [
                'description' => 'moderate intensity',
                'characteristics' => 'comfortable challenge, sustainable effort',
                'pacing_guidance' => 'Challenging but sustainable pace. Standard rest periods. Should feel worked but not exhausted.',
                'heart_rate_zone' => 'Zone 3 (70-80% max HR)'
            ],
            4 => [
                'description' => 'high intensity',
                'characteristics' => 'vigorous, challenging effort',
                'pacing_guidance' => 'High effort with shorter, more intense work periods. Adequate rest for quality maintenance.',
                'heart_rate_zone' => 'Zone 4 (80-90% max HR)'
            ],
            5 => [
                'description' => 'very high intensity',
                'characteristics' => 'maximum effort, elite-level challenge',
                'pacing_guidance' => 'All-out effort with work-to-rest ratios favoring recovery. Focus on power and peak performance.',
                'heart_rate_zone' => 'Zone 5 (90-100% max HR)'
            ]
        ];
    }
    
    /**
     * Get context for a specific intensity level
     *
     * @param int $intensity_level The intensity level (1-5)
     * @return array Context data for the intensity level
     */
    public static function getContext(int $intensity_level): array {
        $contexts = self::getContexts();
        return $contexts[$intensity_level] ?? $contexts[3];
    }
    
    /**
     * Get available intensity levels
     *
     * @return array List of available intensity levels
     */
    public static function getAvailableLevels(): array {
        return array_keys(self::getContexts());
    }
} 