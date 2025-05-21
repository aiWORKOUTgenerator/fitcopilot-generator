<?php
/**
 * Profile API Endpoints
 *
 * Handles the REST API endpoints for user profiles with standardized format handling
 */

namespace FitCopilot\API;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Profile Endpoints class
 */
class ProfileEndpoints {
    
    /**
     * API namespace
     */
    const API_NAMESPACE = 'fitcopilot/v1';
    
    /**
     * Constructor
     */
    public function __construct() {
        // Register REST API endpoints
        add_action('rest_api_init', [$this, 'register_endpoints']);
    }
    
    /**
     * Register REST API endpoints
     */
    public function register_endpoints() {
        // Get profile endpoint
        register_rest_route(self::API_NAMESPACE, '/profile', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_profile'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
        
        // Update profile endpoint
        register_rest_route(self::API_NAMESPACE, '/profile', [
            'methods'             => 'PUT',
            'callback'            => [$this, 'update_profile'],
            'permission_callback' => [$this, 'user_permissions_check'],
        ]);
    }
    
    /**
     * Check if the current user has necessary permissions
     *
     * @return bool Whether the user has permission
     */
    public function user_permissions_check() {
        return is_user_logged_in();
    }
    
    /**
     * Extract profile parameters from the request, handling both direct and wrapped formats
     *
     * @param \WP_REST_Request $request The request object
     * @return array Extracted parameters
     */
    private function extract_profile_params(\WP_REST_Request $request) {
        // Get body as JSON
        $body_raw = $request->get_body();
        
        // Get JSON body params (WordPress parsed)
        $body_params = $request->get_json_params() ?: [];
        
        // Get URL query params
        $url_params = $request->get_query_params();
        
        // Try to parse JSON ourselves to ensure WordPress didn't mess with it
        $manual_json = json_decode($body_raw, true);
        
        $profile_params = [];
        
        // Use APIUtils to normalize request data with 'profile' as the wrapper key
        $profile_params = APIUtils::normalize_request_data($manual_json ?: $body_params, 'profile');
        
        // Apply defaults for required fields
        $defaults = [
            'fitnessLevel' => 'beginner',
            'workoutGoals' => ['strength'],
            'equipmentAvailable' => 'minimal',
            'workoutFrequency' => 3,
            'workoutDuration' => 30,
            'preferences' => [
                'darkMode' => false,
                'notifications' => true,
                'metrics' => 'imperial'
            ],
            'medicalConditions' => [],
        ];
        
        // Merge in defaults for missing fields
        foreach ($defaults as $key => $default_value) {
            if (empty($profile_params[$key])) {
                $profile_params[$key] = $default_value;
            }
        }
        
        // Merge in any URL parameters (they override body params)
        $params = array_merge($profile_params, $url_params);
        
        return $params;
    }
    
    /**
     * Get the user's profile
     *
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response Response object
     */
    public function get_profile(\WP_REST_Request $request) {
        try {
            $user_id = get_current_user_id();
            
            // Get the profile data from user meta with consistent _profile_ prefix
            $fitness_level = get_user_meta($user_id, '_profile_fitness_level', true);
            $workout_goals = get_user_meta($user_id, '_profile_workout_goals', true);
            $equipment_available = get_user_meta($user_id, '_profile_equipment', true);
            $workout_frequency = get_user_meta($user_id, '_profile_frequency', true);
            $workout_duration = get_user_meta($user_id, '_profile_duration', true);
            $preferences = get_user_meta($user_id, '_profile_preferences', true);
            $medical_conditions = get_user_meta($user_id, '_profile_medical_conditions', true);
            
            // Check for legacy data format and migrate if necessary
            if (empty($fitness_level)) {
                $fitness_level = get_user_meta($user_id, 'fitness_level', true);
                if (!empty($fitness_level)) {
                    update_user_meta($user_id, '_profile_fitness_level', $fitness_level);
                } else {
                    $fitness_level = 'beginner';
                }
            }
            
            if (empty($workout_goals) || !is_array($workout_goals)) {
                $workout_goals = get_user_meta($user_id, 'workout_goals', true);
                if (!empty($workout_goals) && is_array($workout_goals)) {
                    update_user_meta($user_id, '_profile_workout_goals', $workout_goals);
                } else {
                    $workout_goals = ['strength'];
                }
            }
            
            if (empty($equipment_available)) {
                $equipment_available = get_user_meta($user_id, 'equipment_available', true);
                if (!empty($equipment_available)) {
                    update_user_meta($user_id, '_profile_equipment', $equipment_available);
                } else {
                    $equipment_available = 'minimal';
                }
            }
            
            if (empty($workout_frequency)) {
                $workout_frequency = get_user_meta($user_id, 'workout_frequency', true);
                if (!empty($workout_frequency)) {
                    update_user_meta($user_id, '_profile_frequency', $workout_frequency);
                } else {
                    $workout_frequency = 3;
                }
            }
            
            if (empty($workout_duration)) {
                $workout_duration = get_user_meta($user_id, 'workout_duration', true);
                if (!empty($workout_duration)) {
                    update_user_meta($user_id, '_profile_duration', $workout_duration);
                } else {
                    $workout_duration = 30;
                }
            }
            
            if (empty($preferences) || !is_array($preferences)) {
                $preferences = get_user_meta($user_id, 'fitness_preferences', true);
                if (!empty($preferences) && is_array($preferences)) {
                    update_user_meta($user_id, '_profile_preferences', $preferences);
                } else {
                    $preferences = [
                        'darkMode' => false,
                        'notifications' => true,
                        'metrics' => 'imperial'
                    ];
                }
            }
            
            if (empty($medical_conditions) || !is_array($medical_conditions)) {
                $medical_conditions = get_user_meta($user_id, 'medical_conditions', true);
                if (!empty($medical_conditions) && is_array($medical_conditions)) {
                    update_user_meta($user_id, '_profile_medical_conditions', $medical_conditions);
                } else {
                    $medical_conditions = [];
                }
            }
            
            // Get timestamps with consistent naming
            $created_at = get_user_meta($user_id, '_profile_created_at', true);
            if (empty($created_at)) {
                $created_at = get_user_meta($user_id, 'profile_created_at', true);
                if (!empty($created_at)) {
                    update_user_meta($user_id, '_profile_created_at', $created_at);
                }
            }
            
            $updated_at = get_user_meta($user_id, '_profile_updated_at', true);
            if (empty($updated_at)) {
                $updated_at = get_user_meta($user_id, 'profile_updated_at', true);
                if (!empty($updated_at)) {
                    update_user_meta($user_id, '_profile_updated_at', $updated_at);
                }
            }
            
            // Build the profile data
            $profile = [
                'id' => $user_id,
                'userId' => $user_id,
                'fitnessLevel' => $fitness_level,
                'workoutGoals' => $workout_goals,
                'equipmentAvailable' => $equipment_available,
                'workoutFrequency' => intval($workout_frequency),
                'workoutDuration' => intval($workout_duration),
                'medicalConditions' => $medical_conditions,
                'preferences' => $preferences,
                'createdAt' => $created_at,
                'updatedAt' => $updated_at
            ];
            
            // Return success response with standardized format
            return APIUtils::create_api_response(
                $profile,
                APIUtils::get_success_message('get', 'profile')
            );
        } catch (\Exception $e) {
            return APIUtils::create_api_response(
                null,
                $e->getMessage(),
                false,
                'profile_fetch_error',
                500
            );
        }
    }
    
    /**
     * Update the user's profile
     *
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response Response object
     */
    public function update_profile(\WP_REST_Request $request) {
        try {
            $user_id = get_current_user_id();
            
            // Extract parameters, handling both direct and wrapped formats
            $params = $this->extract_profile_params($request);
            
            if (!is_array($params)) {
                return APIUtils::create_validation_error(
                    ['request' => 'Invalid request format'],
                    'Invalid request data'
                );
            }
            
            // Validate parameters
            $validation_errors = [];
            
            // Validate fitnessLevel
            if (isset($params['fitnessLevel']) && !in_array($params['fitnessLevel'], ['beginner', 'intermediate', 'advanced'])) {
                $validation_errors['fitnessLevel'] = 'Fitness level must be one of: beginner, intermediate, advanced';
            }
            
            // Validate workoutFrequency
            if (isset($params['workoutFrequency']) && (!is_numeric($params['workoutFrequency']) || $params['workoutFrequency'] < 1 || $params['workoutFrequency'] > 7)) {
                $validation_errors['workoutFrequency'] = 'Workout frequency must be a number between 1 and 7';
            }
            
            // Validate workoutDuration
            if (isset($params['workoutDuration']) && (!is_numeric($params['workoutDuration']) || $params['workoutDuration'] < 10 || $params['workoutDuration'] > 120)) {
                $validation_errors['workoutDuration'] = 'Workout duration must be a number between 10 and 120';
            }
            
            // Validate workoutGoals
            if (isset($params['workoutGoals']) && !is_array($params['workoutGoals'])) {
                $validation_errors['workoutGoals'] = 'Workout goals must be an array';
            }
            
            // Return validation errors if any
            if (!empty($validation_errors)) {
                return APIUtils::create_validation_error(
                    $validation_errors,
                    'Invalid profile data'
                );
            }
            
            // Update profile data in user meta with consistent _profile_ prefix
            if (isset($params['fitnessLevel'])) {
                update_user_meta($user_id, '_profile_fitness_level', sanitize_text_field($params['fitnessLevel']));
            }
            
            if (isset($params['workoutGoals']) && is_array($params['workoutGoals'])) {
                // Sanitize each goal
                $sanitized_goals = array_map('sanitize_text_field', $params['workoutGoals']);
                update_user_meta($user_id, '_profile_workout_goals', $sanitized_goals);
            }
            
            if (isset($params['equipmentAvailable'])) {
                update_user_meta($user_id, '_profile_equipment', sanitize_text_field($params['equipmentAvailable']));
            }
            
            if (isset($params['workoutFrequency'])) {
                update_user_meta($user_id, '_profile_frequency', intval($params['workoutFrequency']));
            }
            
            if (isset($params['workoutDuration'])) {
                update_user_meta($user_id, '_profile_duration', intval($params['workoutDuration']));
            }
            
            if (isset($params['preferences']) && is_array($params['preferences'])) {
                // Get existing preferences
                $existing_preferences = get_user_meta($user_id, '_profile_preferences', true);
                if (!is_array($existing_preferences)) {
                    $existing_preferences = [
                        'darkMode' => false,
                        'notifications' => true,
                        'metrics' => 'imperial'
                    ];
                }
                
                // Update only the provided preferences
                $updated_preferences = array_merge($existing_preferences, $params['preferences']);
                update_user_meta($user_id, '_profile_preferences', $updated_preferences);
            }
            
            if (isset($params['medicalConditions']) && is_array($params['medicalConditions'])) {
                update_user_meta($user_id, '_profile_medical_conditions', $params['medicalConditions']);
            }
            
            // Update the updated_at timestamp
            $now = current_time('mysql');
            update_user_meta($user_id, '_profile_updated_at', $now);
            
            // If this is the first update, set the created_at timestamp
            $created_at = get_user_meta($user_id, '_profile_created_at', true);
            if (empty($created_at)) {
                update_user_meta($user_id, '_profile_created_at', $now);
            }
            
            // Get the updated profile
            $updated_profile = $this->get_profile($request);
            
            // Apply filter for extensibility
            do_action('fitcopilot_profile_updated', $user_id, $params);
            
            return $updated_profile;
        } catch (\Exception $e) {
            return APIUtils::create_api_response(
                null,
                $e->getMessage(),
                false,
                'profile_update_error',
                500
            );
        }
    }
}

// Initialize the class
new ProfileEndpoints(); 