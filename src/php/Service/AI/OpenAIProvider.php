<?php
/**
 * OpenAI Provider for FitCopilot
 */

namespace FitCopilot\Service\AI;

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

    /**
     * Constructor
     *
     * @param string $api_key OpenAI API key
     */
    public function __construct($api_key) {
        $this->api_key = $api_key;
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
        
        // Build the npm based on params
        $prompt = $this->buildPrompt($params);

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
            $profile_params = ['profile_goals', 'profileContext'];
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
        $fitness_level_contexts = [
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
        $fitness_context = $fitness_level_contexts[$fitness_level] ?? $fitness_level_contexts['intermediate'];
        
        $intensity_level_contexts = [
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
        $intensity_context = $intensity_level_contexts[$intensity_level] ?? $intensity_level_contexts[3];
        
        $complexity_contexts = [
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
        $complexity_context = $complexity_contexts[$exercise_complexity] ?? $complexity_contexts['moderate'];

        // SPRINT 3: Enhanced WorkoutGeneratorGrid context descriptions following fitness model
        $stress_contexts = [
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

        $energy_contexts = [
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

        $sleep_contexts = [
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

        $location_contexts = [
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
        
        if (!empty($stress_level) && isset($stress_contexts[$stress_level])) {
            $stress_context = $stress_contexts[$stress_level];
            $daily_state_factors[] = "Stress Level: {$stress_context['description']}";
            $daily_state_factors[] = "  → Workout Adaptation: {$stress_context['workout_adaptation']}";
            $daily_state_factors[] = "  → Exercise Guidance: {$stress_context['exercise_guidance']}";
            $daily_state_factors[] = "  → Mental State: {$stress_context['mental_state']}";
        }
        
        if (!empty($energy_level) && isset($energy_contexts[$energy_level])) {
            $energy_context = $energy_contexts[$energy_level];
            $daily_state_factors[] = "Energy Level: {$energy_context['description']}";
            $daily_state_factors[] = "  → Workout Adaptation: {$energy_context['workout_adaptation']}";
            $daily_state_factors[] = "  → Exercise Guidance: {$energy_context['exercise_guidance']}";
            $daily_state_factors[] = "  → Intensity Adjustment: {$energy_context['intensity_adjustment']}";
        }
        
        if (!empty($sleep_quality) && isset($sleep_contexts[$sleep_quality])) {
            $sleep_context = $sleep_contexts[$sleep_quality];
            $daily_state_factors[] = "Sleep Quality: {$sleep_context['description']}";
            $daily_state_factors[] = "  → Workout Adaptation: {$sleep_context['workout_adaptation']}";
            $daily_state_factors[] = "  → Exercise Guidance: {$sleep_context['exercise_guidance']}";
            $daily_state_factors[] = "  → Recovery Priority: {$sleep_context['recovery_priority']}";
        }
        
        if (!empty($daily_state_factors)) {
            $prompt .= "TODAY'S PHYSICAL & MENTAL STATE:\n";
            foreach ($daily_state_factors as $factor) {
                $prompt .= "- {$factor}\n";
            }
            $prompt .= "\nIMPORTANT: Prioritize the user's current state in exercise selection and intensity. Today's workout should feel personally relevant and achievable.\n\n";
        }
        
        // SPRINT 3: NEW Section 4 - Environment & Location Context
        if (!empty($location) && $location !== 'any' && isset($location_contexts[$location])) {
            $location_context = $location_contexts[$location];
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
        
        // Section 6: Long-term Goals & Profile Context - EXISTING
        if (!empty($profile_goals)) {
            $profile_goals_text = implode(', ', $profile_goals);
            $prompt .= "LONG-TERM FITNESS GOALS:\n";
            $prompt .= "- User's Goals: {$profile_goals_text}\n";
            $prompt .= "- Integration Strategy: Prioritize today's focus while supporting overall fitness progression\n\n";
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
     * Make API request to OpenAI
     *
     * @param string $prompt The prompt to send to OpenAI
     * @return string Raw response from OpenAI
     * @throws \Exception If API call fails
     */
    private function makeOpenAIRequest($prompt) {
        $start_time = microtime(true);
        
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
                        'content' => 'You are an elite fitness coach and exercise physiologist specializing in highly personalized workout design. PHASE 6 ENHANCEMENT: You now receive comprehensive, structured workout requests with separated fitness parameters and detailed contextual guidance.

KEY EXPERTISE AREAS:
- Exercise Prescription: Match exercises to fitness levels (beginner/intermediate/advanced) with appropriate progressions
- Intensity Management: Design workouts using heart rate zones and perceived exertion scales (1-5 intensity levels)
- Movement Complexity: Select exercises based on coordination requirements (basic/moderate/advanced complexity)
- Contextual Adaptation: Modify workouts based on stress, energy, sleep quality, and environmental factors
- Safety & Progression: Ensure proper warm-up, cool-down, and exercise modifications for restrictions

WORKOUT DESIGN PRINCIPLES:
1. FITNESS LEVEL ALIGNMENT: Beginners get foundational movements with form focus; Intermediates get standard exercises with variations; Advanced get complex, challenging movements
2. INTENSITY PRECISION: Use the specified heart rate zones and pacing guidance to design appropriate work-to-rest ratios
3. COMPLEXITY MATCHING: Basic = simple movements; Moderate = compound exercises; Advanced = complex patterns and skills
4. STATE ADAPTATION: Adjust intensity and exercise selection based on current stress, energy, and sleep quality
5. ENVIRONMENTAL OPTIMIZATION: Tailor exercises to available space, equipment, and location constraints
6. PROGRESSIVE STRUCTURE: Include proper warm-up, main workout phases, and cool-down with logical exercise sequencing
7. SAFETY FIRST: Always consider restrictions and provide modifications when needed

RESPONSE REQUIREMENTS:
- Follow the exact JSON format specified in the request
- Provide detailed exercise descriptions with form cues and safety notes
- Create engaging workout titles that reflect the focus and intensity
- Ensure total workout duration matches the requested time
- Include specific rep counts, durations, or time-based instructions for each exercise
- Structure workouts with logical progression and appropriate rest periods

Your goal is to create workouts that are perfectly matched to the user\'s current fitness level, today\'s physical/mental state, available resources, and long-term goals while maintaining the highest standards of safety and effectiveness.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
            ]),
            'timeout' => 60,
        ];

        $response = wp_remote_post($this->api_endpoint, $args);
        
        $end_time = microtime(true);
        $duration_ms = round(($end_time - $start_time) * 1000, 2);

        if (is_wp_error($response)) {
            throw new \Exception('OpenAI API request failed: ' . $response->get_error_message());
        }

        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            $body = wp_remote_retrieve_body($response);
            $error = json_decode($body, true);
            $error_message = isset($error['error']['message']) ? $error['error']['message'] : 'Unknown error';
            throw new \Exception('OpenAI API error (' . $response_code . '): ' . $error_message);
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!isset($data['choices'][0]['message']['content'])) {
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