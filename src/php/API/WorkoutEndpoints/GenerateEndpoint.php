<?php
/**
 * Generate Endpoint
 *
 * Handles workout generation requests through the REST API
 */

namespace FitCopilot\API\WorkoutEndpoints;

use FitCopilot\API\APIUtils;
use FitCopilot\Service\Versioning\VersioningUtils;
use FitCopilot\Service\AI\OpenAIProvider;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Generate Endpoint class
 */
class GenerateEndpoint extends AbstractEndpoint {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->route = '/generate';
        $this->method = 'POST';
        
        parent::__construct();
        
        // Register compatibility endpoint for generate-workout (maps to /generate)
        add_action('rest_api_init', [$this, 'register_compatibility_endpoint']);
        
        // Execute immediately if already fired
        if (did_action('rest_api_init')) {
            $this->register_compatibility_endpoint();
        }
        
        error_log('FitCopilot GenerateEndpoint initialized');
    }
    
    /**
     * Register compatibility endpoint
     */
    public function register_compatibility_endpoint() {
        register_rest_route(self::API_NAMESPACE, '/generate-workout', [
            'methods'             => 'POST',
            'callback'            => [$this, 'handle_request'],
            'permission_callback' => [$this, 'check_permissions'],
        ]);
        
        error_log('FitCopilot registered compatibility endpoint: ' . self::API_NAMESPACE . '/generate-workout');
    }
    
    /**
     * Handle workout generation request
     *
     * @param \WP_REST_Request $request The request
     * @return \WP_REST_Response REST response
     */
    public function handle_request(\WP_REST_Request $request) {
        // Get the OpenAI API key
        $api_key = get_option('fitcopilot_openai_api_key', '');
        if (empty($api_key)) {
            return APIUtils::create_api_response(
                null,
                __('OpenAI API key not configured. Please set it in the FitCopilot settings.', 'fitcopilot'),
                false,
                'missing_api_key',
                400
            );
        }

        // Parse & validate the JSON parameters
        $params = $this->extract_params($request);
        
        // Debug log - show what we received
        error_log('Raw request params: ' . print_r($params, true));
        
        // Validate required fields
        $validation_errors = [];
        $required_fields = [
            'specific_request' => __('Specific request is required.', 'fitcopilot')
        ];
        
        foreach ($required_fields as $field => $error_message) {
            if (empty($params[$field])) {
                $validation_errors[$field] = $error_message;
            }
        }
        
        // Return validation errors if any
        if (!empty($validation_errors)) {
            error_log('Validation errors: ' . print_r($validation_errors, true));
            return APIUtils::create_validation_error(
                $validation_errors,
                __('Missing required parameter(s)', 'fitcopilot')
            );
        }

        try {
            // Use the OpenAI provider to generate the workout
            $provider = new OpenAIProvider($api_key);
            
            // Extract session inputs from the request
            $session_inputs = $params['sessionInputs'] ?? [];
            
            // 🔧 FIXED: Get user profile data with configurable defaults (no hardcoded values)
            $user_id = get_current_user_id();
            
            // Use WordPress filters for default values - allowing customization
            $default_fitness_level = apply_filters('wg_default_fitness_level', 'beginner');
            $default_frequency = apply_filters('wg_default_workout_frequency', '2-3');
            $default_location = apply_filters('wg_default_workout_location', 'any');
            
            // Get profile data with dynamic defaults
            $user_goals = get_user_meta($user_id, '_profile_goals', true) ?: [];
            $user_equipment = get_user_meta($user_id, '_profile_availableEquipment', true) ?: [];
            $user_fitness_level = get_user_meta($user_id, '_profile_fitnessLevel', true) ?: $default_fitness_level;
            $user_frequency = get_user_meta($user_id, '_profile_workoutFrequency', true) ?: $default_frequency;
            $user_location = get_user_meta($user_id, '_profile_preferredLocation', true) ?: $default_location;
            $user_limitations = get_user_meta($user_id, '_profile_limitations', true) ?: [];
            $user_limitation_notes = get_user_meta($user_id, '_profile_limitationNotes', true) ?: '';
            
            // 🔧 NEW: Retrieve missing critical profile fields for enhanced personalization
            $user_age = get_user_meta($user_id, '_profile_age', true) ?: null;
            $user_weight = get_user_meta($user_id, '_profile_weight', true) ?: null;
            $user_height = get_user_meta($user_id, '_profile_height', true) ?: null;
            $user_gender = get_user_meta($user_id, '_profile_gender', true) ?: '';
            $user_weight_unit = get_user_meta($user_id, '_profile_weightUnit', true) ?: 'lbs';
            $user_height_unit = get_user_meta($user_id, '_profile_heightUnit', true) ?: 'ft';
            $user_preferred_duration = get_user_meta($user_id, '_profile_preferredWorkoutDuration', true) ?: null;
            $user_first_name = get_user_meta($user_id, '_profile_firstName', true) ?: '';
            $user_last_name = get_user_meta($user_id, '_profile_lastName', true) ?: '';
            
            // 🔧 NEW: Additional profile fields for comprehensive AI personalization
            $user_custom_goal = get_user_meta($user_id, '_profile_customGoal', true) ?: '';
            $user_custom_equipment = get_user_meta($user_id, '_profile_customEquipment', true) ?: '';
            $user_custom_frequency = get_user_meta($user_id, '_profile_customFrequency', true) ?: '';
            $user_favorite_exercises = get_user_meta($user_id, '_profile_favoriteExercises', true) ?: [];
            $user_disliked_exercises = get_user_meta($user_id, '_profile_dislikedExercises', true) ?: [];
            $user_medical_conditions = get_user_meta($user_id, '_profile_medicalConditions', true) ?: '';
            
            // 🔧 ENHANCED: Comprehensive profile logging including physical data
            $goals_summary = is_array($user_goals) && !empty($user_goals) ? implode(',', $user_goals) : 'not_specified';
            $equipment_summary = is_array($user_equipment) && !empty($user_equipment) ? implode(',', $user_equipment) : 'not_specified';
            $limitations_summary = 'none';
            if (!empty($user_limitation_notes) || (is_array($user_limitations) && !empty($user_limitations) && !in_array('none', $user_limitations))) {
                $limitation_details = [];
                
                // Add structured limitations
                if (is_array($user_limitations) && !empty($user_limitations)) {
                    $filtered_limitations = array_filter($user_limitations, function($limitation) {
                        return $limitation !== 'none';
                    });
                    
                    if (!empty($filtered_limitations)) {
                        $limitation_labels = array_map(function($limitation) {
                            return str_replace('_', ' ', ucwords($limitation, '_'));
                        }, $filtered_limitations);
                        $limitation_details[] = implode(', ', $limitation_labels);
                    }
                }
                
                // Add limitation notes
                if (!empty($user_limitation_notes)) {
                    $limitation_details[] = $user_limitation_notes;
                }
                
                $limitations_summary = !empty($limitation_details) ? implode(' - ', $limitation_details) : 'specified';
            }
            
            // Build physical stats summary for logging
            $physical_stats = [];
            if (!empty($user_age)) $physical_stats[] = "age={$user_age}";
            if (!empty($user_weight)) $physical_stats[] = "weight={$user_weight}{$user_weight_unit}";
            if (!empty($user_height)) {
                if ($user_height_unit === 'ft') {
                    // Convert total inches to feet'inches" format for logging
                    $feet = floor($user_height / 12);
                    $inches = round($user_height % 12);
                    $physical_stats[] = "height={$feet}'{$inches}\"";
                } else {
                    $physical_stats[] = "height={$user_height}{$user_height_unit}";
                }
            }
            if (!empty($user_gender)) $physical_stats[] = "gender={$user_gender}";
            $physical_summary = !empty($physical_stats) ? implode(', ', $physical_stats) : 'not_specified';
            
            $name_summary = trim($user_first_name . ' ' . $user_last_name) ?: 'not_specified';
            
            // 🔧 NEW: Enhanced logging with additional profile fields
            $custom_fields_summary = [];
            if (!empty($user_custom_goal)) $custom_fields_summary[] = "custom_goal=specified";
            if (!empty($user_custom_equipment)) $custom_fields_summary[] = "custom_equipment=specified";
            if (!empty($user_custom_frequency)) $custom_fields_summary[] = "custom_frequency=specified";
            if (!empty($user_favorite_exercises)) $custom_fields_summary[] = "favorite_exercises=" . count($user_favorite_exercises);
            if (!empty($user_disliked_exercises)) $custom_fields_summary[] = "disliked_exercises=" . count($user_disliked_exercises);
            if (!empty($user_medical_conditions)) $custom_fields_summary[] = "medical_conditions=specified";
            $custom_summary = !empty($custom_fields_summary) ? implode(', ', $custom_fields_summary) : 'none';
            
            error_log("[GenerateEndpoint] ENHANCED Profile data retrieved for user {$user_id}: " .
                     "name={$name_summary}, fitness_level={$user_fitness_level}, goals={$goals_summary}, " .
                     "equipment={$equipment_summary}, limitations={$limitations_summary}, " .
                     "physical_data=({$physical_summary}), preferred_duration={$user_preferred_duration}min, " .
                     "custom_fields=({$custom_summary})");
            
            // 🔧 FIXED: Dynamic parameter preparation with proper fallback hierarchy
            $generation_params = [
                'duration'        => $params['duration'] ?? apply_filters('wg_default_workout_duration', 30),
                // Use parameter → profile → filtered default (no hardcoded 'intermediate')
                'fitness_level'   => $params['fitness_level'] ?? $user_fitness_level,
                'intensity_level' => $params['intensity_level'] ?? $params['intensity'] ?? 
                                   apply_filters('wg_default_intensity_level', 3),
                'exercise_complexity' => $params['exercise_complexity'] ?? 
                                       self::derive_exercise_complexity($params['fitness_level'] ?? $user_fitness_level),
                'equipment'       => $params['equipment'] ?? $user_equipment,
                'goals'           => $params['goals'] ?? apply_filters('wg_default_workout_goals', 'general fitness'),
                'daily_focus'     => $params['daily_focus'] ?? $params['goals'] ?? 
                                   apply_filters('wg_default_workout_goals', 'general fitness'),
                
                // Profile integration - use actual profile data, not hardcoded assumptions
                'profile_goals'   => $user_goals,
                'profile_equipment' => $user_equipment,
                'profile_fitness_level' => $user_fitness_level,
                'profile_frequency' => $user_frequency,
                'profile_location' => $user_location,
                'profile_limitations' => $user_limitations,
                'profile_limitation_notes' => $user_limitation_notes,
                
                // 🔧 NEW: Enhanced profile context with physical data for AI personalization
                'profile_age' => $user_age,
                'profile_weight' => $user_weight,
                'profile_weight_unit' => $user_weight_unit,
                'profile_height' => $user_height,
                'profile_height_unit' => $user_height_unit,
                'profile_gender' => $user_gender,
                'profile_preferred_duration' => $user_preferred_duration,
                'profile_first_name' => $user_first_name,
                'profile_last_name' => $user_last_name,
                
                // 🔧 NEW: Additional profile context for enhanced AI personalization
                'profile_custom_goal' => $user_custom_goal,
                'profile_custom_equipment' => $user_custom_equipment,
                'profile_custom_frequency' => $user_custom_frequency,
                'profile_favorite_exercises' => $user_favorite_exercises,
                'profile_disliked_exercises' => $user_disliked_exercises,
                'profile_medical_conditions' => $user_medical_conditions,
                'restrictions'    => $params['restrictions'] ?? $user_limitation_notes,
                'specific_request' => $params['specific_request'],
                
                // SPRINT 1: NEW WorkoutGeneratorGrid parameters following fitness model
                'stress_level'    => $params['stress_level'] ?? ($session_inputs['stressLevel'] ?? null),
                'energy_level'    => $params['energy_level'] ?? ($session_inputs['energyLevel'] ?? null),
                'sleep_quality'   => $params['sleep_quality'] ?? ($session_inputs['sleepQuality'] ?? null),
                'location'        => $params['location'] ?? ($session_inputs['location'] ?? 'any'),
                'custom_notes'    => $params['custom_notes'] ?? ($session_inputs['customNotes'] ?? ''),
                'primary_muscle_focus' => $params['primary_muscle_focus'] ?? ($session_inputs['primaryMuscleGroup'] ?? null),
                
                // Add session inputs to generation parameters
                'session_inputs'  => $session_inputs,
                
                // SPRINT 1: NEW Structured session context (all daily selections)
                'session_context' => [
                    'daily_state' => [
                        'stress' => $params['stress_level'] ?? ($session_inputs['stressLevel'] ?? null),
                        'energy' => $params['energy_level'] ?? ($session_inputs['energyLevel'] ?? null),
                        'sleep' => $params['sleep_quality'] ?? ($session_inputs['sleepQuality'] ?? null)
                    ],
                    'environment' => [
                        'location' => $params['location'] ?? ($session_inputs['location'] ?? 'any'),
                        'equipment' => $params['equipment'] ?? []
                    ],
                    'focus' => [
                        'primary_goal' => $params['goals'] ?? 'general fitness',
                        'muscle_groups' => $session_inputs['selectedMuscleGroups'] ?? [],
                        'restrictions' => $params['restrictions'] ?? ''
                    ],
                    'customization' => [
                        'notes' => $params['custom_notes'] ?? ($session_inputs['customNotes'] ?? ''),
                        'intensity_preference' => $params['intensity_level'] ?? 3
                    ]
                ],
                
                // Include muscle targeting data for OpenAI provider
                'muscleTargeting' => $params['muscleTargeting'] ?? null,
                'focusArea'       => $params['focusArea'] ?? ($session_inputs['focusArea'] ?? []),
                'targetMuscleGroups' => $params['targetMuscleGroups'] ?? ($session_inputs['targetMuscles'] ?? []),
                'specificMuscles' => $params['specificMuscles'] ?? ($session_inputs['specificMuscles'] ?? []),
                'primaryFocus'    => $params['primaryFocus'] ?? ($session_inputs['primaryMuscleGroup'] ?? null),
                'muscleSelectionSummary' => $params['selectionSummary'] ?? ($session_inputs['muscleSelectionSummary'] ?? ''),
                // BACKWARD COMPATIBILITY: Keep difficulty for transition period
                'difficulty'      => $params['fitness_level'] ?? $params['difficulty'] ?? 'intermediate',
            ];
            
            // Debug log muscle targeting data
            if (!empty($params['muscleTargeting']) || !empty($session_inputs['focusArea'])) {
                error_log('[GenerateEndpoint] Processing muscle targeting data: ' . print_r([
                    'has_muscleTargeting' => !empty($params['muscleTargeting']),
                    'has_focusArea' => !empty($params['focusArea']),
                    'session_focusArea' => $session_inputs['focusArea'] ?? 'none',
                    'muscleTargeting_data' => $params['muscleTargeting'] ?? 'none',
                    'focusArea_data' => $params['focusArea'] ?? 'none'
                ], true));
            }
            
            // Debug log - parameters sent to generator
            error_log('Parameters sent to generator: ' . print_r($generation_params, true));
            
            // Generate the workout
            $workout = $provider->generateWorkout($generation_params);
            
            // Save the workout to the database
            $post_id = $this->save_workout($workout, $generation_params);
            
            // Get version metadata for the newly created workout
            $metadata = VersioningUtils::get_version_metadata($post_id);
            
            // CRITICAL FIX: Return standardized workout data with new fitness-specific fields
            // Get the standardized workout that includes the user's duration from params
            $standardized_workout = [
                'title' => $workout['title'] ?? __('Generated Workout', 'fitcopilot'),
                'exercises' => $workout['exercises'] ?? [],
                'sections' => $workout['sections'] ?? [],
                'duration' => $workout['duration'] ?? $generation_params['duration'], // ✅ User's duration preserved
                // PHASE 1: New fitness-specific response fields
                'fitness_level' => $workout['fitness_level'] ?? $generation_params['fitness_level'],
                'intensity_level' => $workout['intensity_level'] ?? $generation_params['intensity_level'],
                'exercise_complexity' => $workout['exercise_complexity'] ?? $generation_params['exercise_complexity'],
                // BACKWARD COMPATIBILITY: Keep difficulty field during transition
                'difficulty' => $workout['difficulty'] ?? $generation_params['difficulty'],
                'equipment' => $workout['equipment'] ?? $generation_params['equipment'],
                'goals' => $workout['goals'] ?? $generation_params['goals'],
                'restrictions' => $workout['restrictions'] ?? $generation_params['restrictions'],
                
                // SPRINT 1: NEW WorkoutGeneratorGrid response fields following fitness model
                'stress_level' => $workout['stress_level'] ?? $generation_params['stress_level'],
                'energy_level' => $workout['energy_level'] ?? $generation_params['energy_level'],
                'sleep_quality' => $workout['sleep_quality'] ?? $generation_params['sleep_quality'],
                'location' => $workout['location'] ?? $generation_params['location'],
                'custom_notes' => $workout['custom_notes'] ?? $generation_params['custom_notes'],
                'primary_muscle_focus' => $workout['primary_muscle_focus'] ?? $generation_params['primary_muscle_focus'],
                'session_context' => $generation_params['session_context'],
                
                // Include session inputs in the response
                'sessionInputs' => $session_inputs,
            ];
            
            // 🔍 DEBUG: Log sessionInputs being included in response (one-time)
            if (!empty($session_inputs)) {
                error_log('[GenerateEndpoint] sessionInputs included in response: ' . count($session_inputs) . ' fields');
            } else {
                error_log('[GenerateEndpoint] ❌ NO sessionInputs in response');
            }
            
            // Add post_id and version metadata to response
            $response_data = $standardized_workout;
            $response_data['post_id'] = $post_id;
            $response_data = APIUtils::add_version_metadata_to_response(
                $response_data, 
                $metadata,
                'create',
                'Workout generated'
            );
            
            // Apply wg_after_generate_workout filter for extensibility
            do_action('wg_after_generate_workout', $post_id, $workout, $generation_params);
            
            // Set ETag header for the response
            APIUtils::set_etag_header($metadata['version']);
            
            // Return the success response
            return APIUtils::create_api_response(
                $response_data,
                APIUtils::get_success_message('create', 'workout')
            );
        } catch (\Exception $e) {
            error_log('Workout generation error: ' . $e->getMessage());
            return APIUtils::create_api_response(
                null,
                $e->getMessage(),
                false,
                'generation_error',
                500
            );
        }
    }
    
    /**
     * Derive exercise complexity from fitness level
     *
     * @param string $fitness_level User's fitness level (beginner, intermediate, advanced)
     * @return string Exercise complexity level (basic, moderate, advanced)
     */
    private static function derive_exercise_complexity($fitness_level) {
        $complexity_mapping = [
            'beginner'     => 'basic',
            'intermediate' => 'moderate', 
            'advanced'     => 'advanced'
        ];
        
        return $complexity_mapping[$fitness_level] ?? 'moderate';
    }
    
    /**
     * Save a workout to the database
     *
     * @param array $workout The workout data
     * @param array $params The generation parameters
     * @return int Post ID
     */
    private function save_workout($workout, $params) {
        $user_id = get_current_user_id();
        $now = current_time('mysql');
        
        // Create post with proper content
        $post_content = '';
        if (!empty($workout['description'])) {
            $post_content = $workout['description'];
        } elseif (!empty($workout['notes'])) {
            $post_content = $workout['notes'];
        }
        
        $post_id = wp_insert_post([
            'post_title'  => $workout['title'] ?? __('Generated Workout', 'fitcopilot'),
            'post_content' => sanitize_textarea_field($post_content),
            'post_type'   => 'fc_workout',
            'post_status' => 'publish',
            'post_author' => $user_id,
        ]);
        
        if (is_wp_error($post_id)) {
            throw new \Exception($post_id->get_error_message());
        }
        
        // CRITICAL FIX: Extract exercises from sections if they exist
        $exercises = $workout['exercises'] ?? [];
        
        // If exercises array is empty but sections contain exercises, extract them
        if (empty($exercises) && !empty($workout['sections'])) {
            error_log('FitCopilot: Extracting exercises from sections for workout ' . $post_id);
            
            foreach ($workout['sections'] as $section) {
                if (isset($section['exercises']) && is_array($section['exercises'])) {
                    foreach ($section['exercises'] as $exercise) {
                        // Add section context to exercise
                        $exercise['section'] = $section['name'] ?? 'Unnamed Section';
                        $exercises[] = $exercise;
                    }
                }
            }
            
            error_log('FitCopilot: Extracted ' . count($exercises) . ' exercises from sections');
        }
        
        // Standardize workout data format for consistency with new fitness-specific fields
        $standardized_workout = [
            'title' => $workout['title'] ?? __('Generated Workout', 'fitcopilot'),
            'exercises' => $exercises,  // Now properly populated from sections
            'sections' => $workout['sections'] ?? [],
            'duration' => $workout['duration'] ?? $params['duration'],
            // PHASE 1: New fitness-specific data fields
            'fitness_level' => $workout['fitness_level'] ?? $params['fitness_level'],
            'intensity_level' => $workout['intensity_level'] ?? $params['intensity_level'],
            'exercise_complexity' => $workout['exercise_complexity'] ?? $params['exercise_complexity'],
            // BACKWARD COMPATIBILITY: Keep difficulty field during transition
            'difficulty' => $workout['difficulty'] ?? $params['difficulty'],
            'equipment' => $workout['equipment'] ?? $params['equipment'],
            'goals' => $workout['goals'] ?? $params['goals'],
            'restrictions' => $workout['restrictions'] ?? $params['restrictions'],
            
            // SPRINT 1: NEW WorkoutGeneratorGrid data fields following fitness model
            'stress_level' => $workout['stress_level'] ?? $params['stress_level'],
            'energy_level' => $workout['energy_level'] ?? $params['energy_level'],
            'sleep_quality' => $workout['sleep_quality'] ?? $params['sleep_quality'],
            'location' => $workout['location'] ?? $params['location'],
            'custom_notes' => $workout['custom_notes'] ?? $params['custom_notes'],
            'primary_muscle_focus' => $workout['primary_muscle_focus'] ?? $params['primary_muscle_focus'],
            'session_context' => $params['session_context'],
            
            'metadata' => [
                'ai_generated' => true,
                'created_at' => $now,
                'generation_params' => $params,
                'openai_model' => $workout['model'] ?? 'unknown',
                'format_version' => '1.2', // Updated version for WorkoutGeneratorGrid fields
                'exercises_extracted_from_sections' => !empty($workout['sections']) && empty($workout['exercises']),
                'fitness_refactor_phase' => 1, // Track refactoring progress
                'workoutgrid_integration_phase' => 1 // Track WorkoutGeneratorGrid integration progress
            ]
        ];
        
        // Save standardized workout data
        update_post_meta($post_id, '_workout_data', wp_json_encode($standardized_workout));
        
        // Save generation parameters as separate meta for backward compatibility and new fitness-specific fields
        // PHASE 1: New fitness-specific meta fields
        update_post_meta($post_id, '_workout_fitness_level', $params['fitness_level'] ?? $params['difficulty']);
        update_post_meta($post_id, '_workout_intensity_level', $params['intensity_level'] ?? 3);
        update_post_meta($post_id, '_workout_exercise_complexity', $params['exercise_complexity'] ?? 'moderate');
        
        // SPRINT 1: NEW WorkoutGeneratorGrid meta fields following fitness model
        if (!empty($params['stress_level'])) {
            update_post_meta($post_id, '_workout_stress_level', sanitize_text_field($params['stress_level']));
        }
        if (!empty($params['energy_level'])) {
            update_post_meta($post_id, '_workout_energy_level', sanitize_text_field($params['energy_level']));
        }
        if (!empty($params['sleep_quality'])) {
            update_post_meta($post_id, '_workout_sleep_quality', sanitize_text_field($params['sleep_quality']));
        }
        if (!empty($params['location']) && $params['location'] !== 'any') {
            update_post_meta($post_id, '_workout_location', sanitize_text_field($params['location']));
        }
        if (!empty($params['custom_notes'])) {
            update_post_meta($post_id, '_workout_custom_notes', sanitize_textarea_field($params['custom_notes']));
        }
        if (!empty($params['primary_muscle_focus'])) {
            update_post_meta($post_id, '_workout_primary_focus', sanitize_text_field($params['primary_muscle_focus']));
        }
        // Save complete session context as JSON
        if (!empty($params['session_context'])) {
            update_post_meta($post_id, '_workout_session_context', wp_json_encode($params['session_context']));
        }
        
        // BACKWARD COMPATIBILITY: Keep existing meta fields during transition
        update_post_meta($post_id, '_workout_difficulty', $params['difficulty']);
        update_post_meta($post_id, '_workout_duration', $params['duration']);
        update_post_meta($post_id, '_workout_equipment', $params['equipment']);
        update_post_meta($post_id, '_workout_goals', $params['goals']);
        update_post_meta($post_id, '_workout_restrictions', $params['restrictions']);
        update_post_meta($post_id, '_workout_specific_request', $params['specific_request']);
        
        // Save session inputs if provided
        if (!empty($params['session_inputs'])) {
            update_post_meta($post_id, '_workout_session_inputs', wp_json_encode($params['session_inputs']));
        }
        
        // Initialize version information
        update_post_meta($post_id, '_workout_version', 1);
        update_post_meta($post_id, '_workout_last_modified', $now);
        update_post_meta($post_id, '_workout_modified_by', $user_id);
        
        error_log("FitCopilot: Saved workout {$post_id} with " . count($exercises) . " exercises");
        
        return $post_id;
    }
} 