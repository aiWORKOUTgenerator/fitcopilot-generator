<?php
/**
 * OpenAI Provider for FitCopilot
 */

namespace FitCopilot\Service\AI;

use FitCopilot\Service\AI\PromptEngineering\Fragments\Context\FitnessLevelContexts;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Context\IntensityContexts;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Context\ComplexityContexts;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Context\DailyStateContexts;
use FitCopilot\Service\AI\PromptEngineering\Fragments\Context\EnvironmentContexts;

// SPRINT 1: Add modular prompt system imports
use FitCopilot\Service\AI\PromptEngineering\Core\PromptBuilder;
use FitCopilot\Service\AI\PromptEngineering\Core\ContextManager;
use FitCopilot\Service\AI\PromptEngineering\Strategies\SingleWorkoutStrategy;

// SPRINT 2: Add enhanced fragment system imports
use FitCopilot\Service\AI\PromptEngineering\Core\FragmentManager;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * OpenAI Provider Class
 * 
 * Handles requests to OpenAI API for workout generation
 */
class OpenAIProvider {
    /**
     * OpenAI API key
     *
     * @var string
     */
    private $api_key;

    /**
     * OpenAI API endpoint
     *
     * @var string
     */
    private $api_endpoint = 'https://api.openai.com/v1/chat/completions';

    // SPRINT 1: Add modular prompt system properties
    /**
     * Use modular prompt system (configurable via filter)
     *
     * @var bool
     */
    private $use_modular_system;

    /**
     * Modular prompt builder instance
     *
     * @var PromptBuilder|null
     */
    private $prompt_builder;

    /**
     * Constructor
     *
     * @param string $api_key OpenAI API key
     */
    public function __construct($api_key) {
        $this->api_key = $api_key;
        
        // SPRINT 1: Initialize modular system configuration
        // Check both WordPress option and filter for configuration
        $option_enabled = get_option('fitcopilot_use_modular_prompts', false);
        $filter_enabled = apply_filters('fitcopilot_use_modular_prompts', $option_enabled);
        
        $this->use_modular_system = $filter_enabled;
        $this->prompt_builder = null;
        
        // Log modular system status for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[OpenAI Provider] SPRINT 1: Modular system ' . ($this->use_modular_system ? 'enabled' : 'disabled'));
        }
    }

    /**
     * Generate a workout using OpenAI
     *
     * @param array $params Parameters for the workout generation
     * @return array Generated workout data
     * @throws \Exception If API call fails
     */
    public function generateWorkout($params) {
        // ✅ ENHANCED: Log parameter completeness for debugging
        $this->logParameterUsage($params);
        
        // SPRINT 1: Use hybrid prompt generation (modular or legacy)
        $prompt = $this->generatePrompt($params);

        try {
            // Make API request to OpenAI
            $response = $this->makeOpenAIRequest($prompt);
            
            // Parse the response into structured workout
            $workout = $this->parseResponse($response, $params);
            
            return $workout;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * SPRINT 1: Hybrid prompt generation method
     * Uses modular system if enabled, falls back to legacy system
     *
     * @param array $params Workout parameters
     * @return string Generated prompt
     */
    private function generatePrompt($params) {
        if ($this->use_modular_system) {
            return $this->generateModularPrompt($params);
        } else {
            return $this->buildPrompt($params);
        }
    }

    /**
     * SPRINT 1: Generate prompt using modular system
     * SPRINT 2: Enhanced with FragmentManager for intelligent personalization
     *
     * @param array $params Workout parameters
     * @return string Generated prompt
     */
    private function generateModularPrompt($params) {
        try {
            // SPRINT 2: Use FragmentManager for enhanced fragment selection
            $enhancedPrompt = $this->generateEnhancedFragmentPrompt($params);
            
            // If enhanced fragments are successful, use them
            if (!empty($enhancedPrompt)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('[OpenAI Provider] SPRINT 2: Enhanced Fragment prompt generated successfully');
                }
                return $enhancedPrompt;
            }

            // Fall back to SPRINT 1 modular system
            if (!$this->prompt_builder) {
                $this->prompt_builder = PromptBuilder::create()
                    ->useStrategy(new SingleWorkoutStrategy());
            }

            // Create context manager and populate with data
            $contextManager = new ContextManager();

            // Map parameters to context structure
            $this->mapParamsToContext($params, $contextManager);

            // Build and return the prompt
            $prompt = $this->prompt_builder
                ->withContext($contextManager)
                ->build();

            // Log modular system usage
            if (defined('WP_DEBUG') && WP_DEBUG) {
                $stats = $this->prompt_builder->getStats();
                error_log('[OpenAI Provider] SPRINT 1: Modular prompt generated. Stats: ' . json_encode($stats));
            }

            return $prompt;

        } catch (\Exception $e) {
            // Log error and fall back to legacy system
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('[OpenAI Provider] SPRINT 1: Modular prompt failed, falling back to legacy: ' . $e->getMessage());
            }
            return $this->buildPrompt($params);
        }
    }

    /**
     * SPRINT 2: Generate prompt using enhanced FragmentManager
     *
     * @param array $params Workout parameters
     * @return string Generated prompt with intelligent fragment selection
     */
    private function generateEnhancedFragmentPrompt($params) {
        try {
            // Map parameters to context for FragmentManager
            $context = $this->mapParamsToFragmentContext($params);
            
            // Get fragment statistics for debugging
            $fragmentStats = FragmentManager::getFragmentStats($context);
            
            // Generate comprehensive fragments
            $fragments = FragmentManager::getComprehensiveFragments($context);
            
            // Build the complete prompt with fragments
            $systemMessage = $this->buildEnhancedSystemMessage($fragments, $context);
            $userMessage = $this->buildEnhancedUserMessage($params, $context);
            
            // Combine into final prompt
            $prompt = $systemMessage . "\n\n" . $userMessage;
            
            // Log enhanced fragment usage
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('[OpenAI Provider] SPRINT 2: Enhanced fragments - ' . 
                         'Personalization Score: ' . $fragmentStats['personalization_score'] . '%, ' .
                         'Context Completeness: ' . $fragmentStats['context_completeness'] . '%, ' .
                         'Fragment Count: ' . $fragmentStats['estimated_fragment_count']);
            }
            
            return $prompt;
            
        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('[OpenAI Provider] SPRINT 2: Enhanced fragment generation failed: ' . $e->getMessage());
            }
            return '';
        }
    }

    /**
     * SPRINT 2: Map parameters to FragmentManager context structure
     *
     * @param array $params Workout parameters
     * @return array Context array for FragmentManager
     */
    private function mapParamsToFragmentContext($params) {
        $context = [];
        
        // Core workout parameters
        $context['duration'] = $params['duration'] ?? 30;
        $context['fitness_level'] = $params['profile_fitness_level'] ?? $params['difficulty'] ?? 'intermediate';
        $context['daily_focus'] = $params['daily_focus'] ?? $params['goals'] ?? 'general fitness';
        
        // Equipment context
        if (!empty($params['equipment'])) {
            $context['equipment'] = is_array($params['equipment']) ? $params['equipment'] : [$params['equipment']];
        }
        
        // Daily state context
        if (!empty($params['stress_level'])) $context['stress_level'] = $params['stress_level'];
        if (!empty($params['energy_level'])) $context['energy_level'] = $params['energy_level'];
        if (!empty($params['sleep_quality'])) $context['sleep_quality'] = $params['sleep_quality'];
        
        // Environment context
        if (!empty($params['location'])) $context['location'] = $params['location'];
        
        // Profile context
        if (!empty($params['profile_age'])) $context['profile_age'] = $params['profile_age'];
        if (!empty($params['profile_gender'])) $context['profile_gender'] = $params['profile_gender'];
        if (!empty($params['profile_limitation_notes'])) $context['profile_limitation_notes'] = $params['profile_limitation_notes'];
        
        // Restrictions context
        if (!empty($params['restrictions'])) $context['restrictions'] = $params['restrictions'];
        
        // Intensity context
        if (!empty($params['intensity_level'])) $context['intensity_level'] = $params['intensity_level'];
        if (!empty($params['intensity'])) $context['intensity_level'] = $params['intensity'];
        
        return $context;
    }

    /**
     * SPRINT 2: Build enhanced system message with intelligent fragments
     *
     * @param string $fragments Generated fragments from FragmentManager
     * @param array $context Context data for personalization
     * @return string Enhanced system message
     */
    private function buildEnhancedSystemMessage($fragments, $context) {
        $systemMessage = "You are an expert fitness trainer and workout designer. ";
        $systemMessage .= "Create a personalized workout based on the user's specific context and needs.\n\n";
        
        // Add personalization context
        $personalizationScore = FragmentManager::getFragmentStats($context)['personalization_score'];
        if ($personalizationScore > 80) {
            $systemMessage .= "PERSONALIZATION LEVEL: HIGH - Use the detailed context provided to create a highly customized workout.\n\n";
        } elseif ($personalizationScore > 50) {
            $systemMessage .= "PERSONALIZATION LEVEL: MODERATE - Adapt the workout based on available context.\n\n";
        } else {
            $systemMessage .= "PERSONALIZATION LEVEL: BASIC - Create a general workout with basic adaptations.\n\n";
        }
        
        // Add the intelligent fragments
        $systemMessage .= "INTELLIGENT TRAINING GUIDANCE:\n";
        $systemMessage .= $fragments;
        
        // Add output format instructions
        $systemMessage .= "\nWORKOUT OUTPUT FORMAT:\n";
        $systemMessage .= "- Provide a complete workout with warm-up, main exercises, and cool-down\n";
        $systemMessage .= "- Include exercise descriptions, sets, reps, and rest periods\n";
        $systemMessage .= "- Add safety notes and form cues where appropriate\n";
        $systemMessage .= "- Structure the workout logically for the specified duration\n";
        $systemMessage .= "- Include motivational guidance and progression tips\n\n";
        
        return $systemMessage;
    }

    /**
     * SPRINT 2: Build enhanced user message with context summary
     *
     * @param array $params Workout parameters
     * @param array $context Mapped context data
     * @return string Enhanced user message
     */
    private function buildEnhancedUserMessage($params, $context) {
        $userMessage = "Please create a personalized workout with the following specifications:\n\n";
        
        // Core specifications
        $userMessage .= "WORKOUT SPECIFICATIONS:\n";
        $userMessage .= "- Duration: " . ($context['duration'] ?? 30) . " minutes\n";
        $userMessage .= "- Fitness Level: " . ucfirst($context['fitness_level'] ?? 'intermediate') . "\n";
        $userMessage .= "- Focus: " . ucwords(str_replace('_', ' ', $context['daily_focus'] ?? 'general fitness')) . "\n";
        
        // Equipment
        if (!empty($context['equipment'])) {
            $userMessage .= "- Available Equipment: " . implode(', ', $context['equipment']) . "\n";
        }
        
        // Current state
        $stateItems = [];
        if (!empty($context['stress_level'])) $stateItems[] = "Stress: " . ucfirst($context['stress_level']);
        if (!empty($context['energy_level'])) $stateItems[] = "Energy: " . ucfirst($context['energy_level']);
        if (!empty($context['sleep_quality'])) $stateItems[] = "Sleep: " . ucfirst($context['sleep_quality']);
        
        if (!empty($stateItems)) {
            $userMessage .= "- Current State: " . implode(', ', $stateItems) . "\n";
        }
        
        // Location and restrictions
        if (!empty($context['location'])) {
            $userMessage .= "- Location: " . ucfirst($context['location']) . "\n";
        }
        
        if (!empty($context['restrictions']) || !empty($context['profile_limitation_notes'])) {
            $restrictions = $context['restrictions'] ?? $context['profile_limitation_notes'];
            $userMessage .= "- Restrictions/Limitations: " . $restrictions . "\n";
        }
        
        $userMessage .= "\nPlease design a workout that incorporates all the intelligent training guidance provided above.";
        
        return $userMessage;
    }

    /**
     * SPRINT 1: Map parameters to modular context structure
     *
     * @param array $params Workout parameters
     * @param ContextManager $contextManager Context manager to populate
     */
    private function mapParamsToContext($params, $contextManager) {
        // Profile context
        $profileContext = [];
        if (!empty($params['profile_age'])) $profileContext['profile_age'] = $params['profile_age'];
        if (!empty($params['profile_weight'])) $profileContext['profile_weight'] = $params['profile_weight'];
        if (!empty($params['profile_weight_unit'])) $profileContext['profile_weight_unit'] = $params['profile_weight_unit'];
        if (!empty($params['profile_height'])) $profileContext['profile_height'] = $params['profile_height'];
        if (!empty($params['profile_height_unit'])) $profileContext['profile_height_unit'] = $params['profile_height_unit'];
        if (!empty($params['profile_gender'])) $profileContext['profile_gender'] = $params['profile_gender'];
        if (!empty($params['profile_first_name'])) $profileContext['profile_first_name'] = $params['profile_first_name'];
        if (!empty($params['profile_last_name'])) $profileContext['profile_last_name'] = $params['profile_last_name'];
        if (!empty($params['profile_fitness_level'])) $profileContext['fitness_level'] = $params['profile_fitness_level'];
        if (!empty($params['difficulty'])) $profileContext['fitness_level'] = $params['difficulty'];
        if (!empty($params['profile_limitation_notes'])) $profileContext['profile_limitation_notes'] = $params['profile_limitation_notes'];

        if (!empty($profileContext)) {
            $contextManager->addProfileContext($profileContext);
        }

        // Session context
        $sessionContext = [];
        $sessionContext['duration'] = $params['duration'] ?? 30;
        if (!empty($params['equipment'])) $sessionContext['equipment'] = $params['equipment'];
        if (!empty($params['daily_focus'])) $sessionContext['daily_focus'] = $params['daily_focus'];
        if (!empty($params['goals'])) $sessionContext['daily_focus'] = $params['goals'];
        if (!empty($params['intensity_level'])) $sessionContext['intensity_level'] = $params['intensity_level'];
        if (!empty($params['intensity'])) $sessionContext['intensity_level'] = $params['intensity'];
        if (!empty($params['stress_level'])) $sessionContext['stress_level'] = $params['stress_level'];
        if (!empty($params['energy_level'])) $sessionContext['energy_level'] = $params['energy_level'];
        if (!empty($params['sleep_quality'])) $sessionContext['sleep_quality'] = $params['sleep_quality'];
        if (!empty($params['location'])) $sessionContext['location'] = $params['location'];
        if (!empty($params['custom_notes'])) $sessionContext['custom_notes'] = $params['custom_notes'];
        if (!empty($params['restrictions'])) $sessionContext['restrictions'] = $params['restrictions'];
        if (!empty($params['primary_muscle_focus'])) $sessionContext['primary_muscle_focus'] = $params['primary_muscle_focus'];

        $contextManager->addSessionContext($sessionContext);

        // Environment context (if location specified)
        if (!empty($params['location'])) {
            $contextManager->addEnvironmentContext([
                'location' => $params['location'],
                'equipment' => $params['equipment'] ?? []
            ]);
        }
    }

    /**
     * Log parameter usage for debugging and validation
     * SPRINT 3: Enhanced to track WorkoutGeneratorGrid parameters and structured session context
     *
     * @param array $params Workout parameters
     */
    private function logParameterUsage($params) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            // SPRINT 3: Updated parameter categories with enhanced WorkoutGeneratorGrid tracking
            $fitness_params = ['fitness_level', 'intensity_level', 'exercise_complexity'];
            $legacy_params = ['difficulty', 'intensity']; // Backward compatibility tracking
            $core_params = ['duration', 'equipment', 'goals', 'daily_focus'];
            $workoutgrid_params = ['stress_level', 'energy_level', 'sleep_quality', 'location', 'custom_notes', 'primary_muscle_focus']; // SPRINT 3: NEW
            $session_context_params = ['session_context']; // SPRINT 3: NEW structured context
            $muscle_params = ['muscleTargeting', 'focusArea', 'targetMuscleGroups', 'specificMuscles'];
            $profile_params = ['profile_goals', 'profileContext', 'profile_age', 'profile_weight', 'profile_height', 'profile_gender', 'profile_preferred_duration', 'profile_first_name', 'profile_last_name'];
            $restrictions_params = ['restrictions'];
            
            $used_fitness = array_intersect_key($params, array_flip($fitness_params));
            $used_legacy = array_intersect_key($params, array_flip($legacy_params));
            $used_core = array_intersect_key($params, array_flip($core_params));
            $used_workoutgrid = array_intersect_key($params, array_flip($workoutgrid_params)); // SPRINT 3: NEW
            $used_session_context = array_intersect_key($params, array_flip($session_context_params)); // SPRINT 3: NEW
            $used_profile = array_intersect_key($params, array_flip($profile_params));
            $used_restrictions = array_intersect_key($params, array_flip($restrictions_params));
            $has_muscle_data = !empty(array_intersect_key($params, array_flip($muscle_params)));
            
            // SPRINT 3: Calculate WorkoutGeneratorGrid integration completion
            $fitness_completion = count($used_fitness) / count($fitness_params) * 100;
            $workoutgrid_completion = count($used_workoutgrid) / count($workoutgrid_params) * 100; // SPRINT 3: NEW
            $session_context_available = !empty($used_session_context); // SPRINT 3: NEW
            
            $total_modern_params = count($fitness_params) + count($core_params) + count($workoutgrid_params) + count($session_context_params) + count($profile_params);
            $used_modern_params = count($used_fitness) + count($used_core) + count($used_workoutgrid) + count($used_session_context) + count($used_profile);
            $modernization_percentage = ($used_modern_params / $total_modern_params) * 100;
            
            // SPRINT 3: Enhanced session context analysis
            $session_context_details = '';
            if (!empty($params['session_context'])) {
                $context = $params['session_context'];
                $context_sections = [];
                if (!empty($context['daily_state'])) $context_sections[] = 'daily_state';
                if (!empty($context['environment'])) $context_sections[] = 'environment';
                if (!empty($context['focus'])) $context_sections[] = 'focus';
                if (!empty($context['customization'])) $context_sections[] = 'customization';
                $session_context_details = ' [Sections: ' . implode(', ', $context_sections) . ']';
            }
            
            error_log('[OpenAI Provider] SPRINT 3 Enhanced Parameter Usage Summary:');
            error_log('- Fitness-specific parameters: ' . count($used_fitness) . '/' . count($fitness_params) . ' (' . round($fitness_completion, 1) . '% complete) [' . implode(', ', array_keys($used_fitness)) . ']');
            error_log('- Core workout parameters: ' . count($used_core) . '/' . count($core_params) . ' (' . implode(', ', array_keys($used_core)) . ')');
            error_log('- WorkoutGeneratorGrid parameters: ' . count($used_workoutgrid) . '/' . count($workoutgrid_params) . ' (' . round($workoutgrid_completion, 1) . '% complete) [' . implode(', ', array_keys($used_workoutgrid)) . ']'); // SPRINT 3: NEW
            error_log('- Session context structure: ' . ($session_context_available ? 'Available' : 'Not Available') . $session_context_details); // SPRINT 3: NEW
            error_log('- Profile integration parameters: ' . count($used_profile) . '/' . count($profile_params) . ' (' . implode(', ', array_keys($used_profile)) . ')');
            error_log('- Restrictions parameters: ' . count($used_restrictions) . '/' . count($restrictions_params) . ' (' . implode(', ', array_keys($used_restrictions)) . ')');
            error_log('- Legacy parameters (backward compatibility): ' . count($used_legacy) . '/' . count($legacy_params) . ' (' . implode(', ', array_keys($used_legacy)) . ')');
            error_log('- Muscle targeting integration: ' . ($has_muscle_data ? 'Active' : 'Inactive'));
            error_log('- Total parameter coverage: ' . count($params) . ' parameters received');
            error_log('- Modernization status: ' . round($modernization_percentage, 1) . '% (Sprint 3 Enhanced WorkoutGeneratorGrid Integration)');
            error_log('- Integration phase: SPRINT 3 - Complete WorkoutGeneratorGrid parameter integration with AI prompt optimization');
            
            // SPRINT 3: Detailed WorkoutGeneratorGrid parameter tracking
            if (!empty($used_workoutgrid)) {
                error_log('[OpenAI Provider] WorkoutGeneratorGrid Parameter Details:');
                foreach ($used_workoutgrid as $param => $value) {
                    if (is_array($value)) {
                        $value_str = '[' . implode(', ', $value) . ']';
                    } else {
                        $value_str = (string)$value;
                    }
                    error_log("  - {$param}: {$value_str}");
                }
            }
            
            // SPRINT 3: Session context structure logging
            if ($session_context_available && !empty($params['session_context'])) {
                error_log('[OpenAI Provider] Session Context Structure:');
                $context = $params['session_context'];
                if (!empty($context['daily_state'])) {
                    $daily_state = $context['daily_state'];
                    error_log('  - Daily State: stress=' . ($daily_state['stress'] ?? 'null') . 
                             ', energy=' . ($daily_state['energy'] ?? 'null') . 
                             ', sleep=' . ($daily_state['sleep'] ?? 'null'));
                }
                if (!empty($context['environment'])) {
                    $environment = $context['environment'];
                    error_log('  - Environment: location=' . ($environment['location'] ?? 'null') . 
                             ', equipment_count=' . (is_array($environment['equipment'] ?? []) ? count($environment['equipment']) : 0));
                }
                if (!empty($context['focus'])) {
                    $focus = $context['focus'];
                    error_log('  - Focus: goal=' . ($focus['primary_goal'] ?? 'null') . 
                             ', muscle_groups_count=' . (is_array($focus['muscle_groups'] ?? []) ? count($focus['muscle_groups']) : 0) .
                             ', restrictions_count=' . (is_array($focus['restrictions'] ?? []) ? count($focus['restrictions']) : 0));
                }
                if (!empty($context['customization'])) {
                    $customization = $context['customization'];
                    error_log('  - Customization: notes_length=' . strlen($customization['notes'] ?? '') . 
                             ', intensity_preference=' . ($customization['intensity_preference'] ?? 'null'));
                }
            }
        }
    }

    /**
     * Build a prompt for OpenAI based on workout parameters
     * SPRINT 3: Enhanced WorkoutGeneratorGrid parameter integration following fitness model
     *
     * @param array $params Workout parameters
     * @return string Prompt for OpenAI
     */
    private function buildPrompt($params) {
        // PHASE 6: Enhanced fitness-specific parameters with detailed context
        $fitness_level = $params['fitness_level'] ?? $params['difficulty'] ?? 'intermediate';
        $intensity_level = $params['intensity_level'] ?? $params['intensity'] ?? 3;
        $exercise_complexity = $params['exercise_complexity'] ?? 'moderate';
        
        // Core workout parameters
        $duration = $params['duration'] ?? 30;
        $equipment = isset($params['equipment']) ? implode(', ', $params['equipment']) : 'no equipment';
        $daily_focus = $params['daily_focus'] ?? $params['goals'] ?? 'general fitness';
        $profile_goals = isset($params['profile_goals']) && is_array($params['profile_goals']) ? $params['profile_goals'] : [];
        $restrictions = $params['restrictions'] ?? 'none';

        // SPRINT 3: NEW WorkoutGeneratorGrid parameters with comprehensive context
        $stress_level = $params['stress_level'] ?? null;
        $energy_level = $params['energy_level'] ?? null;
        $sleep_quality = $params['sleep_quality'] ?? null;
        $location = $params['location'] ?? null;
        $custom_notes = $params['custom_notes'] ?? '';
        $primary_muscle_focus = $params['primary_muscle_focus'] ?? null;
        
        // SPRINT 3: NEW Structured session context (complete daily state)
        $session_context = $params['session_context'] ?? null;

        // PHASE 6: Enhanced fitness-specific descriptions with detailed AI guidance
        $fitness_context = FitnessLevelContexts::getContext($fitness_level);
        
        $intensity_context = IntensityContexts::getContext($intensity_level);
        
        $complexity_context = ComplexityContexts::getContext($exercise_complexity);

        // SPRINT 3: Enhanced WorkoutGeneratorGrid context descriptions following fitness model
        // Context data now extracted to modular classes







        // SPRINT 3: Structured prompt with enhanced WorkoutGeneratorGrid sections
        $prompt = "ENHANCED WORKOUT GENERATION REQUEST\n\n";
        
        // Section 1: User Profile & Fitness Context (EXISTING)
        $prompt .= "USER PROFILE:\n";
        $prompt .= "- Fitness Level: {$fitness_context['description']} ({$fitness_context['characteristics']})\n";
        $prompt .= "- Exercise Guidance: {$fitness_context['exercise_guidance']}\n";
        $prompt .= "- Intensity Adjustment: {$fitness_context['intensity_adjustment']}\n\n";
        
        // Section 2: Today's Workout Parameters (EXISTING)  
        $prompt .= "TODAY'S WORKOUT PARAMETERS:\n";
        $prompt .= "- Duration: {$duration} minutes\n";
        $prompt .= "- Intensity Level: {$intensity_context['description']} ({$intensity_context['characteristics']})\n";
        $prompt .= "- Pacing Guidance: {$intensity_context['pacing_guidance']}\n";
        $prompt .= "- Target Heart Rate: {$intensity_context['heart_rate_zone']}\n";
        $prompt .= "- Exercise Complexity: {$complexity_context['description']} ({$complexity_context['characteristics']})\n";
        $prompt .= "- Movement Guidance: {$complexity_context['movement_guidance']}\n";
        $prompt .= "- Equipment Available: {$equipment}\n";
        $prompt .= "- Primary Focus: {$daily_focus}\n\n";
        
        // SPRINT 3: NEW Section 3 - Daily Physical & Mental State
        $daily_state_factors = [];
        
        if (!empty($stress_level)) {
            $stress_context = DailyStateContexts::getStressContext($stress_level);
            if (!empty($stress_context)) {
                $daily_state_factors[] = "Stress Level: {$stress_context['description']}";
                $daily_state_factors[] = "  → Workout Adaptation: {$stress_context['workout_adaptation']}";
                $daily_state_factors[] = "  → Exercise Guidance: {$stress_context['exercise_guidance']}";
                $daily_state_factors[] = "  → Mental State: {$stress_context['mental_state']}";
            }
        }
        
        if (!empty($energy_level)) {
            $energy_context = DailyStateContexts::getEnergyContext($energy_level);
            if (!empty($energy_context)) {
                $daily_state_factors[] = "Energy Level: {$energy_context['description']}";
                $daily_state_factors[] = "  → Workout Adaptation: {$energy_context['workout_adaptation']}";
                $daily_state_factors[] = "  → Exercise Guidance: {$energy_context['exercise_guidance']}";
                $daily_state_factors[] = "  → Intensity Adjustment: {$energy_context['intensity_adjustment']}";
            }
        }
        
        if (!empty($sleep_quality)) {
            $sleep_context = DailyStateContexts::getSleepContext($sleep_quality);
            if (!empty($sleep_context)) {
                $daily_state_factors[] = "Sleep Quality: {$sleep_context['description']}";
                $daily_state_factors[] = "  → Workout Adaptation: {$sleep_context['workout_adaptation']}";
                $daily_state_factors[] = "  → Exercise Guidance: {$sleep_context['exercise_guidance']}";
                $daily_state_factors[] = "  → Recovery Priority: {$sleep_context['recovery_priority']}";
            }
        }
        
        if (!empty($daily_state_factors)) {
            $prompt .= "TODAY'S PHYSICAL & MENTAL STATE:\n";
            foreach ($daily_state_factors as $factor) {
                $prompt .= "- {$factor}\n";
            }
            $prompt .= "\nIMPORTANT: Prioritize the user's current state in exercise selection and intensity. Today's workout should feel personally relevant and achievable.\n\n";
        }
        
        // SPRINT 3: NEW Section 4 - Environment & Location Context
        if (!empty($location) && $location !== 'any') {
            $location_context = EnvironmentContexts::getLocationContext($location);
            if (!empty($location_context)) {
                $prompt .= "WORKOUT ENVIRONMENT:\n";
                $prompt .= "- Location: {$location_context['description']}\n";
                $prompt .= "- Space Considerations: {$location_context['space_guidance']}\n";
                $prompt .= "- Equipment Access: {$location_context['equipment_adaptation']}\n";
                if (isset($location_context['noise_consideration'])) {
                    $prompt .= "- Noise Considerations: {$location_context['noise_consideration']}\n";
                }
                if (isset($location_context['environment_benefits'])) {
                    $prompt .= "- Environment Benefits: {$location_context['environment_benefits']}\n";
                }
                $prompt .= "\n";
            }
        }
        
        // Section 3: Muscle Targeting (if specified) - EXISTING
        $muscle_targeting = $this->buildMuscleTargetingText($params);
        if (!empty($muscle_targeting)) {
            $prompt .= "MUSCLE TARGETING:\n";
            $prompt .= "- {$muscle_targeting}\n\n";
        }
        
        // SPRINT 3: NEW Section 5 - Enhanced Primary Muscle Focus
        if (!empty($primary_muscle_focus)) {
            $prompt .= "PRIMARY MUSCLE FOCUS:\n";
            $prompt .= "- Target Area: {$primary_muscle_focus}\n";
            $prompt .= "- Integration: Emphasize {$primary_muscle_focus} exercises while maintaining workout balance\n";
            $prompt .= "- Exercise Selection: Include multiple {$primary_muscle_focus}-focused movements throughout the workout\n\n";
        }
        
        // Section 6: Enhanced Long-term Goals & Profile Context - 🔧 FIX #3
        if (!empty($profile_goals)) {
            $profile_goals_text = implode(', ', $profile_goals);
            $prompt .= "LONG-TERM FITNESS GOALS:\n";
            $prompt .= "- User's Goals: {$profile_goals_text}\n";
            $prompt .= "- Integration Strategy: Prioritize today's focus while supporting overall fitness progression\n\n";
        }
        
        // 🔧 ENHANCED: Comprehensive profile context section with physical data
        $profile_equipment = $params['profile_equipment'] ?? [];
        $profile_fitness_level = $params['profile_fitness_level'] ?? '';
        $profile_frequency = $params['profile_frequency'] ?? '';
        $profile_location = $params['profile_location'] ?? '';
        $profile_limitations = $params['profile_limitations'] ?? [];
        $profile_limitation_notes = $params['profile_limitation_notes'] ?? '';
        
        // 🔧 NEW: Enhanced physical profile data
        $profile_age = $params['profile_age'] ?? null;
        $profile_weight = $params['profile_weight'] ?? null;
        $profile_weight_unit = $params['profile_weight_unit'] ?? 'lbs';
        $profile_height = $params['profile_height'] ?? null;
        $profile_height_unit = $params['profile_height_unit'] ?? 'ft';
        $profile_gender = $params['profile_gender'] ?? '';
        $profile_preferred_duration = $params['profile_preferred_duration'] ?? null;
        $profile_first_name = $params['profile_first_name'] ?? '';
        $profile_last_name = $params['profile_last_name'] ?? '';
        
        // 🔧 NEW: Additional profile fields for comprehensive AI personalization
        $profile_medical_conditions = $params['profile_medical_conditions'] ?? '';
        $profile_favorite_exercises = $params['profile_favorite_exercises'] ?? [];
        $profile_disliked_exercises = $params['profile_disliked_exercises'] ?? [];
        
        if (!empty($profile_equipment) || !empty($profile_fitness_level) || !empty($profile_limitation_notes) || 
            !empty($profile_limitations) || !empty($profile_age) || !empty($profile_weight) || !empty($profile_gender)) {
            $prompt .= "USER PROFILE CONTEXT:\n";
            
            // Personal identification for workout customization
            $full_name = trim($profile_first_name . ' ' . $profile_last_name);
            if (!empty($full_name)) {
                $prompt .= "- User Name: {$full_name} (personalize workout communication)\n";
            }
            
            if (!empty($profile_fitness_level)) {
                $prompt .= "- Fitness Level: {$profile_fitness_level} (from user profile)\n";
            }
            
            // 🔧 NEW: Enhanced physical characteristics section
            $physical_stats = [];
            if (!empty($profile_age)) {
                $age_context = $this->getAgeBasedContext($profile_age);
                $prompt .= "- Age: {$profile_age} years ({$age_context})\n";
            }
            
            if (!empty($profile_weight) && !empty($profile_height)) {
                // Format height properly for AI prompt
                $height_display = $profile_height;
                if ($profile_height_unit === 'ft') {
                    // Convert total inches to feet'inches" format
                    $feet = floor($profile_height / 12);
                    $inches = round($profile_height % 12);
                    $height_display = "{$feet}'{$inches}\"";
                } else {
                    $height_display = "{$profile_height} {$profile_height_unit}";
                }
                
                $prompt .= "- Physical Stats: {$profile_weight} {$profile_weight_unit}, {$height_display}\n";
                $prompt .= "- Body Considerations: Adjust exercise load and range of motion accordingly\n";
            } elseif (!empty($profile_weight)) {
                $prompt .= "- Weight: {$profile_weight} {$profile_weight_unit} (consider for bodyweight exercise modifications)\n";
            } elseif (!empty($profile_height)) {
                // Format height properly for AI prompt
                $height_display = $profile_height;
                if ($profile_height_unit === 'ft') {
                    // Convert total inches to feet'inches" format
                    $feet = floor($profile_height / 12);
                    $inches = round($profile_height % 12);
                    $height_display = "{$feet}'{$inches}\"";
                } else {
                    $height_display = "{$profile_height} {$profile_height_unit}";
                }
                
                $prompt .= "- Height: {$height_display} (consider for range of motion and posture)\n";
            }
            
            if (!empty($profile_gender)) {
                $gender_context = $this->getGenderBasedContext($profile_gender);
                $prompt .= "- Gender: {$profile_gender} ({$gender_context})\n";
            }
            
            if (!empty($profile_preferred_duration)) {
                $prompt .= "- Preferred Workout Duration: {$profile_preferred_duration} minutes (user's time preference)\n";
            }
            
            if (!empty($profile_equipment)) {
                $equipment_text = is_array($profile_equipment) ? implode(', ', $profile_equipment) : $profile_equipment;
                $prompt .= "- Profile Equipment: {$equipment_text}\n";
            }
            
            if (!empty($profile_frequency)) {
                $prompt .= "- Typical Workout Frequency: {$profile_frequency} times per week\n";
            }
            
            if (!empty($profile_location)) {
                $prompt .= "- Preferred Location: {$profile_location}\n";
            }
            
            // 🔧 ENHANCED: Comprehensive limitations display with both structured and notes
            if (!empty($profile_limitations) || !empty($profile_limitation_notes)) {
                $limitation_details = [];
                
                // Add structured limitations (body areas)
                if (is_array($profile_limitations) && !empty($profile_limitations)) {
                    $filtered_limitations = array_filter($profile_limitations, function($limitation) {
                        return $limitation !== 'none';
                    });
                    
                    if (!empty($filtered_limitations)) {
                        $limitation_labels = array_map(function($limitation) {
                            return str_replace('_', ' ', ucwords($limitation, '_'));
                        }, $filtered_limitations);
                        $limitation_details[] = "Body Areas: " . implode(', ', $limitation_labels);
                    }
                }
                
                // Add limitation notes (specific details)
                if (!empty($profile_limitation_notes)) {
                    $limitation_details[] = "Details: {$profile_limitation_notes}";
                }
                
                if (!empty($limitation_details)) {
                    $prompt .= "- Health Limitations: " . implode(' | ', $limitation_details) . "\n";
                    $prompt .= "- Safety Priority: Pay special attention to these limitations when selecting exercises\n";
                }
            }
            
            // 🔧 NEW: Medical conditions and exercise preferences
            if (!empty($profile_medical_conditions)) {
                $prompt .= "- Medical Conditions: {$profile_medical_conditions}\n";
                $prompt .= "- Medical Considerations: Ensure all exercises are appropriate for these conditions\n";
            }
            
            if (!empty($profile_favorite_exercises)) {
                $favorite_count = is_array($profile_favorite_exercises) ? count($profile_favorite_exercises) : 0;
                if ($favorite_count > 0) {
                    $favorites_text = is_array($profile_favorite_exercises) ? implode(', ', $profile_favorite_exercises) : $profile_favorite_exercises;
                    $prompt .= "- Favorite Exercises: {$favorites_text} (try to include when appropriate)\n";
                }
            }
            
            if (!empty($profile_disliked_exercises)) {
                $disliked_text = is_array($profile_disliked_exercises) ? implode(', ', $profile_disliked_exercises) : $profile_disliked_exercises;
                $prompt .= "- Exercises to Avoid: {$disliked_text} (do not include these exercises)\n";
            }
            
            $prompt .= "- Profile Integration: Consider the user's complete profile (physical stats, age, gender, preferences, limitations) throughout the workout design for maximum personalization\n\n";
        }
        
        // Section 7: Restrictions & Limitations - EXISTING
        if ($restrictions !== 'none' && !empty($restrictions)) {
            $prompt .= "RESTRICTIONS & LIMITATIONS:\n";
            if (is_array($restrictions)) {
                $restrictions_text = implode(', ', $restrictions);
                $prompt .= "- Body Areas to Avoid: {$restrictions_text}\n";
                $prompt .= "- Modification Strategy: Provide alternative exercises that avoid strain on restricted areas\n\n";
            } else {
                $prompt .= "- Health Considerations: {$restrictions}\n";
                $prompt .= "- Safety Priority: Ensure all exercises are safe and appropriate for these limitations\n\n";
            }
        }
        
        // SPRINT 3: NEW Section 8 - Custom User Preferences & Session Context
        if (!empty($custom_notes) || !empty($session_context)) {
            $prompt .= "CUSTOM USER PREFERENCES & SESSION CONTEXT:\n";
            
            if (!empty($custom_notes)) {
                $prompt .= "- Special Requests: {$custom_notes}\n";
            }
            
            // SPRINT 3: Include structured session context if available
            if (!empty($session_context)) {
                if (isset($session_context['focus']['muscle_groups']) && !empty($session_context['focus']['muscle_groups'])) {
                    $muscle_groups = implode(', ', $session_context['focus']['muscle_groups']);
                    $prompt .= "- Focus Areas: {$muscle_groups}\n";
                }
                if (isset($session_context['focus']['restrictions']) && !empty($session_context['focus']['restrictions'])) {
                    $session_restrictions = implode(', ', $session_context['focus']['restrictions']);
                    $prompt .= "- Today's Restrictions: {$session_restrictions}\n";
                }
                if (isset($session_context['customization']['intensity_preference'])) {
                    $intensity_pref = $session_context['customization']['intensity_preference'];
                    $prompt .= "- Intensity Preference: {$intensity_pref}/5\n";
                }
            }
            
            $prompt .= "- Integration Priority: Incorporate these preferences while maintaining workout effectiveness and safety\n\n";
        }
        
        // SPRINT 3: Enhanced AI Generation Instructions
        $prompt .= "ENHANCED GENERATION INSTRUCTIONS:\n";
        $prompt .= "1. Prioritize the user's current physical and mental state in exercise selection\n";
        $prompt .= "2. Adapt workout intensity based on stress, energy, and sleep quality\n";
        $prompt .= "3. Consider location constraints for space and equipment requirements\n";
        $prompt .= "4. Integrate custom preferences while maintaining workout effectiveness\n";
        $prompt .= "5. Create a cohesive workout that addresses both fitness goals and daily state\n";
        $prompt .= "6. Include modifications for different energy/stress levels within the workout\n";
        $prompt .= "7. Ensure the workout feels personally relevant and achievable today\n";
        $prompt .= "8. Balance challenge with the user's current capacity and state\n";
        $prompt .= "9. Provide clear rationale for exercise selection based on the user's context\n\n";
        
        // Section 9: JSON Format Requirements - EXISTING
        $prompt .= "REQUIRED JSON FORMAT:\n";
        $prompt .= "{\n";
        $prompt .= "  \"title\": \"Descriptive workout title that reflects the focus and intensity\",\n";
        $prompt .= "  \"sections\": [\n";
        $prompt .= "    {\n";
        $prompt .= "      \"name\": \"Section Name (e.g., Warm-Up, Main Workout, Cool-Down)\",\n";
        $prompt .= "      \"duration\": 5,\n";
        $prompt .= "      \"exercises\": [\n";
        $prompt .= "        {\n";
        $prompt .= "          \"name\": \"Exercise Name\",\n";
        $prompt .= "          \"duration\": \"Duration or reps (e.g., '2 minutes', '10 reps', '30 seconds')\",\n";
        $prompt .= "          \"description\": \"Detailed description with form cues and safety notes\"\n";
        $prompt .= "        }\n";
        $prompt .= "      ]\n";
        $prompt .= "    }\n";
        $prompt .= "  ]\n";
        $prompt .= "}";

        return $prompt;
    }

    /**
     * Build muscle targeting text for the workout prompt
     *
     * @param array $params Workout parameters
     * @return string Muscle targeting text for the prompt
     */
    private function buildMuscleTargetingText($params) {
        $muscle_text = '';
        
        // Check for muscle targeting data (new integration format)
        if (isset($params['muscleTargeting']) && is_array($params['muscleTargeting'])) {
            $muscle_targeting = $params['muscleTargeting'];
            
            if (!empty($muscle_targeting['selectionSummary'])) {
                $muscle_text = "MUSCLE TARGETING: " . $muscle_targeting['selectionSummary'] . ".";
            } else if (!empty($muscle_targeting['targetMuscleGroups'])) {
                $groups = is_array($muscle_targeting['targetMuscleGroups']) 
                    ? implode(', ', $muscle_targeting['targetMuscleGroups']) 
                    : $muscle_targeting['targetMuscleGroups'];
                $muscle_text = "TARGET MUSCLE GROUPS: Focus primarily on {$groups}.";
                
                if (!empty($muscle_targeting['primaryFocus'])) {
                    $muscle_text .= " Primary emphasis on {$muscle_targeting['primaryFocus']}.";
                }
            }
        }
        
        // Check for legacy focusArea format (backward compatibility)
        else if (isset($params['focusArea']) && is_array($params['focusArea']) && !empty($params['focusArea'])) {
            $focus_areas = implode(', ', $params['focusArea']);
            $muscle_text = "TARGET MUSCLE GROUPS: Focus primarily on {$focus_areas}.";
        }
        
        // Check for direct muscle targeting fields (backward compatibility)
        else if (isset($params['targetMuscleGroups']) && !empty($params['targetMuscleGroups'])) {
            $groups = is_array($params['targetMuscleGroups']) 
                ? implode(', ', $params['targetMuscleGroups']) 
                : $params['targetMuscleGroups'];
            $muscle_text = "TARGET MUSCLE GROUPS: Focus primarily on {$groups}.";
            
            if (isset($params['primaryFocus']) && !empty($params['primaryFocus'])) {
                $muscle_text .= " Primary emphasis on {$params['primaryFocus']}.";
            }
        }
        
        // Check for sessionInputs muscle targeting (integration hook format)
        else if (isset($params['sessionInputs']['muscleTargeting']) && is_array($params['sessionInputs']['muscleTargeting'])) {
            $session_targeting = $params['sessionInputs']['muscleTargeting'];
            
            if (!empty($session_targeting['selectionSummary'])) {
                $muscle_text = "MUSCLE TARGETING: " . $session_targeting['selectionSummary'] . ".";
            }
        }
        
        // Check for sessionInputs focus area (integration hook format)
        else if (isset($params['sessionInputs']['focusArea']) && is_array($params['sessionInputs']['focusArea']) && !empty($params['sessionInputs']['focusArea'])) {
            $focus_areas = implode(', ', $params['sessionInputs']['focusArea']);
            $muscle_text = "TARGET MUSCLE GROUPS: Focus primarily on {$focus_areas}.";
        }
        
        return $muscle_text;
    }

    /**
     * Get age-based workout context for AI prompts
     *
     * @param int $age User's age
     * @return string Age-appropriate workout context
     */
    private function getAgeBasedContext($age) {
        if ($age < 20) {
            return 'young adult - high energy capacity, focus on form and habit building';
        } elseif ($age < 30) {
            return 'young adult - peak physical capacity, can handle high intensity';
        } elseif ($age < 40) {
            return 'adult - excellent capacity with recovery awareness needed';
        } elseif ($age < 50) {
            return 'mature adult - focus on joint health and sustainable intensity';
        } elseif ($age < 60) {
            return 'middle-aged - emphasize mobility, joint protection, and progressive loading';
        } else {
            return 'senior - prioritize functional movement, balance, and gentle progression';
        }
    }

    /**
     * Get gender-based workout context for AI prompts
     *
     * @param string $gender User's gender
     * @return string Gender-appropriate workout considerations
     */
    private function getGenderBasedContext($gender) {
        switch (strtolower($gender)) {
            case 'male':
                return 'typically higher upper body strength, may prefer strength-focused training';
            case 'female':
                return 'often higher lower body strength ratio, may benefit from balanced strength training';
            case 'other':
            case 'non-binary':
                return 'individualized approach based on personal preferences and goals';
            case 'prefer_not_to_say':
                return 'gender-neutral exercise selection and programming';
            default:
                return 'personalized approach regardless of gender identity';
        }
    }

    /**
     * Make API request to OpenAI
     *
     * @param string $prompt The prompt to send to OpenAI
     * @return string Raw response from OpenAI
     * @throws \Exception If API call fails
     */
    private function makeOpenAIRequest($prompt) {
        $start_time = microtime(true);
        
        // CRITICAL FIX: Increase timeout and add configurable option
        $timeout = apply_filters('fitcopilot_openai_timeout', 180); // 3 minutes default
        
        $args = [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'model' => 'gpt-4.1',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => "You are an elite fitness coach and exercise physiologist specializing in highly personalized workout design. ENHANCED PROFILE INTEGRATION: You now receive comprehensive user profile data including age, physical stats, gender, and personal preferences for maximum workout personalization.

KEY EXPERTISE AREAS:
- Exercise Prescription: Match exercises to fitness levels (beginner/intermediate/advanced) with appropriate progressions
- Age-Specific Programming: Adapt intensity and exercise selection based on user age and life stage
- Physical Adaptation: Consider height, weight, and gender for exercise modifications and load recommendations
- Intensity Management: Design workouts using heart rate zones and perceived exertion scales (1-6 intensity levels)
- Movement Complexity: Select exercises based on coordination requirements (basic/moderate/advanced complexity)
- Contextual Adaptation: Modify workouts based on stress, energy, sleep quality, and environmental factors
- Safety & Progression: Ensure proper warm-up, cool-down, and exercise modifications for restrictions

WORKOUT DESIGN PRINCIPLES:
1. FITNESS LEVEL ALIGNMENT: Beginners get foundational movements with form focus; Intermediates get standard exercises with variations; Advanced get complex, challenging movements
2. AGE-APPROPRIATE PROGRAMMING: Adapt exercise selection, intensity, and recovery based on user's age and life stage considerations
3. PHYSICAL ADAPTATION: Consider height, weight, and body composition for exercise load, range of motion, and movement modifications
4. GENDER-INFORMED APPROACH: Respect individual preferences while considering typical strength patterns and training preferences
5. INTENSITY PRECISION: Use the specified heart rate zones and pacing guidance to design appropriate work-to-rest ratios
6. COMPLEXITY MATCHING: Basic = simple movements; Moderate = compound exercises; Advanced = complex patterns and skills
7. STATE ADAPTATION: Adjust intensity and exercise selection based on current stress, energy, and sleep quality
8. ENVIRONMENTAL OPTIMIZATION: Tailor exercises to available space, equipment, and location constraints
9. PROGRESSIVE STRUCTURE: Include proper warm-up, main workout phases, and cool-down with logical exercise sequencing
10. SAFETY FIRST: Always consider restrictions and provide modifications when needed
11. PERSONAL PREFERENCES: Honor user's preferred workout duration and individual customization requests

CRITICAL FORMATTING REQUIREMENT:
You MUST respond with valid JSON in the following exact format:
{
  \"title\": \"Descriptive workout title\",
  \"sections\": [
    {
      \"name\": \"Section Name\",
      \"duration\": 5,
      \"exercises\": [
        {
          \"name\": \"Exercise Name\",
          \"duration\": \"Duration or reps\",
          \"description\": \"Detailed description with form cues\"
        }
      ]
    }
  ]
}

DO NOT include any text before or after the JSON. DO NOT wrap in markdown code blocks."
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
            ]),
            'timeout' => $timeout,
        ];

        // Log timeout setting for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("[OpenAI Provider] Using timeout: {$timeout} seconds");
        }

        $response = wp_remote_post($this->api_endpoint, $args);
        
        $end_time = microtime(true);
        $duration_ms = round(($end_time - $start_time) * 1000, 2);

        // Enhanced error logging for debugging
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            error_log("[OpenAI Provider] API request failed: {$error_message}");
            throw new \Exception('OpenAI API request failed: ' . $error_message);
        }

        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            $body = wp_remote_retrieve_body($response);
            $error = json_decode($body, true);
            $error_message = isset($error['error']['message']) ? $error['error']['message'] : 'Unknown error';
            error_log("[OpenAI Provider] API error ({$response_code}): {$error_message}");
            throw new \Exception('OpenAI API error (' . $response_code . '): ' . $error_message);
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!isset($data['choices'][0]['message']['content'])) {
            error_log("[OpenAI Provider] Invalid response structure from OpenAI API");
            throw new \Exception('Invalid response from OpenAI API');
        }
        
        // Track the API request for analytics
        do_action('fitcopilot_api_request_complete', $data, $duration_ms, $this->api_endpoint);

        return $data['choices'][0]['message']['content'];
    }

    /**
     * Parse OpenAI response into structured workout
     *
     * @param string $response Raw response from OpenAI
     * @param array $params Original workout parameters
     * @return array Structured workout
     * @throws \Exception If response parsing fails
     */
    private function parseResponse($response, $params) {
        try {
            // Remove any markdown code block markers if present (```json and ```)
            $response = preg_replace('/```json\s*/', '', $response);
            $response = preg_replace('/```\s*/', '', $response);
            
            $workout = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Failed to parse OpenAI response: ' . json_last_error_msg());
            }
            
            // Validate the structure
            if (!isset($workout['title']) || !isset($workout['sections']) || !is_array($workout['sections'])) {
                throw new \Exception('Invalid workout format in OpenAI response');
            }
            
            return $workout;
        } catch (\Exception $e) {
            throw new \Exception('Failed to parse workout from OpenAI: ' . $e->getMessage());
        }
    }
} 