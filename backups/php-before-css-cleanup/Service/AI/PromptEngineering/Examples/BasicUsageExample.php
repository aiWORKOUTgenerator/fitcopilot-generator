<?php
/**
 * Basic Usage Example - Modular Prompt Engineering System
 * 
 * Demonstrates how to use the new modular prompt system
 * and shows the migration path from OpenAIProvider.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Examples;

use FitCopilot\Service\AI\PromptEngineering\Core\PromptBuilder;
use FitCopilot\Service\AI\PromptEngineering\Core\ContextManager;
use FitCopilot\Service\AI\PromptEngineering\Strategies\SingleWorkoutStrategy;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * BasicUsageExample Class
 * 
 * Shows how to use the modular prompt engineering system
 */
class BasicUsageExample {
    
    /**
     * Example 1: Basic workout prompt generation
     */
    public static function basicWorkoutGeneration() {
        // Create context manager and add data
        $contextManager = new ContextManager();
        
        // Add profile context (static user data)
        $contextManager->addProfileContext([
            'fitness_level' => 'intermediate',
            'profile_age' => 48,
            'profile_weight' => 200,
            'profile_weight_unit' => 'lbs',
            'profile_gender' => 'male',
            'profile_first_name' => 'Justin',
            'profile_last_name' => 'Fassio',
            'profile_limitation_notes' => 'Left knee pain'
        ]);
        
        // Add session context (current workout parameters)
        $contextManager->addSessionContext([
            'duration' => 30,
            'equipment' => ['dumbbells', 'resistance_bands'],
            'daily_focus' => 'strength_building',
            'stress_level' => 'moderate',
            'energy_level' => 'high',
            'sleep_quality' => 'good',
            'restrictions' => ['knee']
        ]);
        
        // Build the prompt using the strategy
        $promptBuilder = PromptBuilder::create()
            ->useStrategy(new SingleWorkoutStrategy())
            ->withContext($contextManager);
        
        // Generate the prompt
        $prompt = $promptBuilder->build();
        
        // Get statistics
        $stats = $promptBuilder->getStats();
        
        return [
            'prompt' => $prompt,
            'stats' => $stats,
            'context_summary' => $contextManager->getSummary()
        ];
    }
    
    /**
     * Example 2: Fluent interface usage
     */
    public static function fluentInterfaceExample() {
        $prompt = PromptBuilder::create()
            ->useStrategy(new SingleWorkoutStrategy())
            ->withProfileContext([
                'fitness_level' => 'beginner',
                'profile_age' => 25
            ])
            ->withSessionContext([
                'duration' => 20,
                'equipment' => [],
                'daily_focus' => 'cardio'
            ])
            ->withOptions([
                'include_warm_up' => true,
                'include_cool_down' => true
            ])
            ->build();
        
        return $prompt;
    }
    
    /**
     * Example 3: Migration from OpenAIProvider
     * 
     * Shows how to convert existing OpenAIProvider usage
     */
    public static function migrationExample($params) {
        // OLD WAY (OpenAIProvider):
        // $prompt = $openAIProvider->buildPrompt($params);
        
        // NEW WAY (Modular System):
        $contextManager = new ContextManager();
        
        // Map old params to new context structure
        if (isset($params['profile_age'])) {
            $contextManager->addProfileContext([
                'profile_age' => $params['profile_age'],
                'profile_weight' => $params['profile_weight'] ?? null,
                'profile_gender' => $params['profile_gender'] ?? null,
                'fitness_level' => $params['profile_fitness_level'] ?? $params['difficulty'] ?? 'intermediate'
            ]);
        }
        
        $contextManager->addSessionContext([
            'duration' => $params['duration'] ?? 30,
            'equipment' => $params['equipment'] ?? [],
            'daily_focus' => $params['daily_focus'] ?? $params['goals'] ?? 'general fitness',
            'stress_level' => $params['stress_level'] ?? null,
            'energy_level' => $params['energy_level'] ?? null,
            'sleep_quality' => $params['sleep_quality'] ?? null,
            'restrictions' => $params['restrictions'] ?? null
        ]);
        
        $prompt = PromptBuilder::create()
            ->useStrategy(new SingleWorkoutStrategy())
            ->withContext($contextManager)
            ->build();
        
        return $prompt;
    }
    
    /**
     * Example 4: Validation and error handling
     */
    public static function validationExample() {
        $promptBuilder = PromptBuilder::create()
            ->useStrategy(new SingleWorkoutStrategy());
        
        // Validate before building
        $errors = $promptBuilder->validate();
        
        if (!empty($errors)) {
            return [
                'success' => false,
                'errors' => $errors
            ];
        }
        
        try {
            $prompt = $promptBuilder->build();
            return [
                'success' => true,
                'prompt' => $prompt
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Example 5: Context priority demonstration
     */
    public static function contextPriorityExample() {
        $contextManager = new ContextManager();
        
        // Add profile context (lowest priority)
        $contextManager->addProfileContext([
            'fitness_level' => 'beginner',
            'duration' => 45
        ]);
        
        // Add session context (highest priority)
        $contextManager->addSessionContext([
            'fitness_level' => 'advanced',  // This will override profile
            'duration' => 30                // This will override profile
        ]);
        
        // Test priority resolution
        $fitness_level = $contextManager->getContextValue('fitness_level'); // Returns 'advanced'
        $duration = $contextManager->getContextValue('duration');           // Returns 30
        
        return [
            'fitness_level' => $fitness_level,
            'duration' => $duration,
            'merged_context' => $contextManager->getMergedContext()
        ];
    }
    
    /**
     * Example 6: Token estimation
     */
    public static function tokenEstimationExample() {
        $contextManager = new ContextManager();
        $contextManager->addProfileContext(['fitness_level' => 'intermediate']);
        $contextManager->addSessionContext(['duration' => 30, 'equipment' => ['dumbbells']]);
        
        $strategy = new SingleWorkoutStrategy();
        $estimatedTokens = $strategy->estimateTokenUsage($contextManager);
        
        $promptBuilder = PromptBuilder::create()
            ->useStrategy($strategy)
            ->withContext($contextManager);
        
        $prompt = $promptBuilder->build();
        $actualStats = $promptBuilder->getStats();
        
        return [
            'estimated_tokens' => $estimatedTokens,
            'actual_stats' => $actualStats,
            'accuracy' => abs($estimatedTokens - $actualStats['estimated_tokens']) / $actualStats['estimated_tokens'] * 100
        ];
    }
} 