<?php
/**
 * SingleWorkoutStrategy - Single Workout Generation Strategy
 * 
 * Strategy for generating individual workout prompts.
 * Migrates the current OpenAIProvider prompt logic into a modular system.
 */

namespace FitCopilot\Service\AI\PromptEngineering\Strategies;

use FitCopilot\Service\AI\PromptEngineering\Core\ContextManager;
use FitCopilot\Service\AI\PromptEngineering\Strategies\PromptStrategyInterface;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SingleWorkoutStrategy Class
 * 
 * Generates prompts for individual workout sessions
 */
class SingleWorkoutStrategy implements PromptStrategyInterface {
    
    /**
     * Build a prompt for single workout generation
     *
     * @param ContextManager $contextManager Context data manager
     * @param array $options Additional options for prompt generation
     * @return string The generated prompt
     */
    public function buildPrompt(ContextManager $contextManager, array $options = []): string {
        $context = $contextManager->getMergedContext();
        
        // Extract key parameters with fallbacks
        $fitness_level = $contextManager->getContextValue('fitness_level', 
                        $contextManager->getContextValue('difficulty', 'intermediate'));
        $duration = $contextManager->getContextValue('duration', 30);
        $equipment = $contextManager->getContextValue('equipment', []);
        $daily_focus = $contextManager->getContextValue('daily_focus', 
                      $contextManager->getContextValue('goals', 'general fitness'));
        
        $equipment_text = is_array($equipment) ? implode(', ', $equipment) : $equipment;
        if (empty($equipment_text)) $equipment_text = 'no equipment';
        
        // Build the modular prompt
        $prompt = "ENHANCED WORKOUT GENERATION REQUEST\n\n";
        
        // Section 1: Comprehensive User Profile
        $prompt .= "USER PROFILE:\n";
        
        // Basic Profile Information
        $profile_first_name = $contextManager->getContextValue('profile_first_name');
        $profile_last_name = $contextManager->getContextValue('profile_last_name');
        if (!empty($profile_first_name) || !empty($profile_last_name)) {
            $full_name = trim(($profile_first_name ?? '') . ' ' . ($profile_last_name ?? ''));
            $prompt .= "- Name: {$full_name}\n";
        }
        
        // Physical Stats
        $profile_age = $contextManager->getContextValue('profile_age');
        $profile_weight = $contextManager->getContextValue('profile_weight');
        $profile_weight_unit = $contextManager->getContextValue('profile_weight_unit', 'lbs');
        $profile_height = $contextManager->getContextValue('profile_height');
        $profile_height_unit = $contextManager->getContextValue('profile_height_unit', 'ft');
        $profile_gender = $contextManager->getContextValue('profile_gender');
        
        if (!empty($profile_age)) {
            $prompt .= "- Age: {$profile_age} years\n";
        }
        if (!empty($profile_gender)) {
            $prompt .= "- Gender: {$profile_gender}\n";
        }
        if (!empty($profile_weight)) {
            $prompt .= "- Weight: {$profile_weight} {$profile_weight_unit}\n";
        }
        if (!empty($profile_height)) {
            if ($profile_height_unit === 'ft') {
                $feet = floor($profile_height / 12);
                $inches = $profile_height % 12;
                $prompt .= "- Height: {$feet}'{$inches}\"\n";
            } else {
                $prompt .= "- Height: {$profile_height} {$profile_height_unit}\n";
            }
        }
        
        // Fitness & Goals
        $prompt .= "- Fitness Level: {$fitness_level}\n";
        
        $profile_goals = $contextManager->getContextValue('profile_goals');
        if (!empty($profile_goals)) {
            $goals_text = is_array($profile_goals) ? implode(', ', $profile_goals) : $profile_goals;
            $prompt .= "- Profile Goals: {$goals_text}\n";
        }
        $prompt .= "- Primary Focus: {$daily_focus}\n";
        
        // Equipment & Location Preferences
        $profile_equipment = $contextManager->getContextValue('profile_equipment');
        if (!empty($profile_equipment)) {
            $profile_equipment_text = is_array($profile_equipment) ? implode(', ', $profile_equipment) : $profile_equipment;
            $prompt .= "- Available Equipment: {$profile_equipment_text}\n";
        }
        
        $profile_location = $contextManager->getContextValue('profile_location');
        if (!empty($profile_location)) {
            $prompt .= "- Preferred Location: {$profile_location}\n";
        }
        
        $profile_frequency = $contextManager->getContextValue('profile_frequency');
        if (!empty($profile_frequency)) {
            $prompt .= "- Workout Frequency: {$profile_frequency}\n";
        }
        
        // Exercise Preferences
        $profile_favorite_exercises = $contextManager->getContextValue('profile_favorite_exercises');
        if (!empty($profile_favorite_exercises)) {
            $prompt .= "- Favorite Exercises: {$profile_favorite_exercises}\n";
        }
        
        $profile_disliked_exercises = $contextManager->getContextValue('profile_disliked_exercises');
        if (!empty($profile_disliked_exercises)) {
            $prompt .= "- Disliked Exercises: {$profile_disliked_exercises}\n";
        }
        
        // Health Considerations
        $profile_limitations = $contextManager->getContextValue('profile_limitations');
        $profile_limitation_notes = $contextManager->getContextValue('profile_limitation_notes');
        $profile_medical_conditions = $contextManager->getContextValue('profile_medical_conditions');
        
        if (!empty($profile_limitations)) {
            $limitations_text = is_array($profile_limitations) ? implode(', ', $profile_limitations) : $profile_limitations;
            $prompt .= "- Physical Limitations: {$limitations_text}\n";
        }
        if (!empty($profile_limitation_notes)) {
            $prompt .= "- Limitation Notes: {$profile_limitation_notes}\n";
        }
        if (!empty($profile_medical_conditions)) {
            $prompt .= "- Medical Conditions: {$profile_medical_conditions}\n";
        }
        
        $prompt .= "\n";
        
        // Section 2: Today's Workout Parameters
        $prompt .= "TODAY'S WORKOUT PARAMETERS:\n";
        $prompt .= "- Duration: {$duration} minutes\n";
        $prompt .= "- Equipment Available: {$equipment_text}\n\n";
        
        // Section 3: Daily State (if available)
        $stress_level = $contextManager->getContextValue('stress_level');
        $energy_level = $contextManager->getContextValue('energy_level');
        $sleep_quality = $contextManager->getContextValue('sleep_quality');
        
        if (!empty($stress_level) || !empty($energy_level) || !empty($sleep_quality)) {
            $prompt .= "TODAY'S PHYSICAL & MENTAL STATE:\n";
            
            if (!empty($stress_level)) {
                $prompt .= "- Stress Level: {$stress_level}\n";
            }
            if (!empty($energy_level)) {
                $prompt .= "- Energy Level: {$energy_level}\n";
            }
            if (!empty($sleep_quality)) {
                $prompt .= "- Sleep Quality: {$sleep_quality}\n";
            }
            
            $prompt .= "- Adaptation: Adjust workout intensity and exercise selection based on current state\n\n";
        }
        
        // Section 4: Additional Restrictions (if any beyond profile)
        $restrictions = $contextManager->getContextValue('restrictions');
        
        if (!empty($restrictions) && $restrictions !== 'none') {
            $prompt .= "ADDITIONAL TODAY'S RESTRICTIONS:\n";
            
            if (is_array($restrictions)) {
                $restrictions_text = implode(', ', $restrictions);
                $prompt .= "- Body Areas to Avoid Today: {$restrictions_text}\n";
            } else {
                $prompt .= "- Today's Health Considerations: {$restrictions}\n";
            }
            
            $prompt .= "- Safety Priority: Ensure all exercises are safe and appropriate for all limitations (profile + today's)\n\n";
        }
        
        // Section 5: Generation Instructions
        $prompt .= "GENERATION INSTRUCTIONS:\n";
        $prompt .= "1. Create a personalized workout based on the user's profile and current state\n";
        $prompt .= "2. Adapt intensity and exercise selection based on fitness level and daily state\n";
        $prompt .= "3. Consider equipment limitations and provide alternatives when needed\n";
        $prompt .= "4. Ensure workout duration matches the requested time\n";
        $prompt .= "5. Include proper warm-up and cool-down phases\n";
        $prompt .= "6. Provide clear exercise descriptions with form cues\n\n";
        
        // Section 6: JSON Format Requirements
        $prompt .= "REQUIRED JSON FORMAT:\n";
        $prompt .= "{\n";
        $prompt .= "  \"title\": \"Descriptive workout title\",\n";
        $prompt .= "  \"sections\": [\n";
        $prompt .= "    {\n";
        $prompt .= "      \"name\": \"Section Name\",\n";
        $prompt .= "      \"duration\": 5,\n";
        $prompt .= "      \"exercises\": [\n";
        $prompt .= "        {\n";
        $prompt .= "          \"name\": \"Exercise Name\",\n";
        $prompt .= "          \"duration\": \"Duration or reps\",\n";
        $prompt .= "          \"description\": \"Detailed description with form cues\"\n";
        $prompt .= "        }\n";
        $prompt .= "      ]\n";
        $prompt .= "    }\n";
        $prompt .= "  ]\n";
        $prompt .= "}";
        
        return $prompt;
    }

    /**
     * Validate the context and options for this strategy
     *
     * @param ContextManager $contextManager
     * @param array $options
     * @return array
     */
    public function validate(ContextManager $contextManager, array $options = []): array {
        $errors = [];
        
        // Check for required context
        if (!$contextManager->hasContext('session') && !$contextManager->hasContext('profile')) {
            $errors[] = 'SingleWorkoutStrategy requires either session or profile context';
        }
        
        // Check for duration
        $duration = $contextManager->getContextValue('duration');
        if (empty($duration)) {
            $errors[] = 'Duration is required for workout generation';
        }
        
        return $errors;
    }

    /**
     * Get the strategy name
     *
     * @return string
     */
    public function getName(): string {
        return 'SingleWorkoutStrategy';
    }

    /**
     * Get the strategy description
     *
     * @return string
     */
    public function getDescription(): string {
        return 'Generates prompts for individual workout sessions with comprehensive personalization';
    }

    /**
     * Get required context types
     *
     * @return array
     */
    public function getRequiredContextTypes(): array {
        return ['session']; // At minimum, need session context
    }

    /**
     * Get supported options
     *
     * @return array
     */
    public function getSupportedOptions(): array {
        return ['include_warm_up', 'include_cool_down', 'focus_areas', 'avoid_exercises'];
    }

    /**
     * Estimate token usage
     *
     * @param ContextManager $contextManager
     * @param array $options
     * @return int
     */
    public function estimateTokenUsage(ContextManager $contextManager, array $options = []): int {
        // Base prompt is approximately 800-1200 tokens
        $baseTokens = 1000;
        
        // Add tokens based on context complexity
        $contextStats = $contextManager->getStats();
        $additionalTokens = $contextStats['total_fields'] * 8; // ~8 tokens per field
        
        return $baseTokens + $additionalTokens;
    }
} 