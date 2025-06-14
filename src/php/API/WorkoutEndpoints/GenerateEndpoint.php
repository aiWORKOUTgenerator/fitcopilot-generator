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
            
            // Prepare parameters for workout generation with fitness-specific context
            $generation_params = [
                'duration'        => $params['duration'] ?? 30,
                // REFACTOR: Replace difficulty with fitness_level + intensity + complexity
                'fitness_level'   => $params['fitness_level'] ?? $params['difficulty'] ?? 'intermediate', // Backward compatibility
                'intensity_level' => $params['intensity_level'] ?? $params['intensity'] ?? 3,
                'exercise_complexity' => $params['exercise_complexity'] ?? self::derive_exercise_complexity($params['fitness_level'] ?? $params['difficulty'] ?? 'intermediate'),
                'equipment'       => $params['equipment'] ?? [],
                'goals'           => $params['goals'] ?? 'general fitness',
                'daily_focus'     => $params['daily_focus'] ?? $params['goals'] ?? 'general fitness',
                'profile_goals'   => $params['profile_goals'] ?? [],
                'restrictions'    => $params['restrictions'] ?? '',
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