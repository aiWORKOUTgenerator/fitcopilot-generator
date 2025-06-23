<?php
/**
 * EnvironmentContexts - Environment & Location Context Data
 * 
 * Provides context data for different workout environments used in AI prompt generation.
 * Extracted from OpenAIProvider.php for modular reuse.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Fragments\Context;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * EnvironmentContexts Class
 * 
 * Static context data for environment and location descriptions and guidance
 */
class EnvironmentContexts {
    
    /**
     * Get all location contexts
     *
     * @return array Location context data
     */
    public static function getLocationContexts(): array {
        return [
            'home' => [
                'description' => 'home environment (limited space, household items)',
                'space_guidance' => 'Focus on bodyweight and compact exercises',
                'equipment_adaptation' => 'Use furniture, books, water bottles as equipment',
                'noise_consideration' => 'Avoid jumping or loud movements'
            ],
            'gym' => [
                'description' => 'gym setting (full equipment access)',
                'space_guidance' => 'Can utilize all available equipment and space',
                'equipment_adaptation' => 'Take advantage of full range of gym equipment',
                'environment_benefits' => 'Motivating atmosphere, professional equipment'
            ],
            'outdoors' => [
                'description' => 'outdoor location (fresh air, natural terrain)',
                'space_guidance' => 'Incorporate natural movement patterns',
                'equipment_adaptation' => 'Use natural features (hills, logs, rocks)',
                'environment_benefits' => 'Fresh air, vitamin D, connection with nature'
            ],
            'travel' => [
                'description' => 'travel/hotel setting (minimal equipment, compact space)',
                'space_guidance' => 'Focus on portable, quiet exercises',
                'equipment_adaptation' => 'Bodyweight only or travel-friendly items',
                'noise_consideration' => 'Respectful of neighbors, minimal impact'
            ]
        ];
    }
    
    /**
     * Get context for a specific location
     *
     * @param string $location The location
     * @return array Context data for the location
     */
    public static function getLocationContext(string $location): array {
        $contexts = self::getLocationContexts();
        return $contexts[$location] ?? [];
    }
    
    /**
     * Get available locations
     *
     * @return array List of available locations
     */
    public static function getAvailableLocations(): array {
        return array_keys(self::getLocationContexts());
    }
} 