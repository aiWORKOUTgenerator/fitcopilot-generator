<?php
/**
 * Profile API Endpoints
 *
 * Handles the REST API endpoints for user profiles with clean, unified field naming
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
     * Extract profile parameters from the request
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
        
        // Apply defaults for required fields using frontend field names
        $defaults = [
            'fitnessLevel' => 'beginner',
            'goals' => ['general_fitness'],
            'availableEquipment' => ['none'],
            'workoutFrequency' => '3-4',
            'preferredWorkoutDuration' => 30,
            'preferredLocation' => 'home',
            'limitations' => ['none'],
            'profileComplete' => false,
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
            
            // Get the profile data from user meta using frontend field names
            $first_name = get_user_meta($user_id, '_profile_firstName', true);
            $last_name = get_user_meta($user_id, '_profile_lastName', true);
            $email = get_user_meta($user_id, '_profile_email', true);
            $fitness_level = get_user_meta($user_id, '_profile_fitnessLevel', true);
            $goals = get_user_meta($user_id, '_profile_goals', true);
            $custom_goal = get_user_meta($user_id, '_profile_customGoal', true);
            $weight = get_user_meta($user_id, '_profile_weight', true);
            $weight_unit = get_user_meta($user_id, '_profile_weightUnit', true);
            $height = get_user_meta($user_id, '_profile_height', true);
            $height_unit = get_user_meta($user_id, '_profile_heightUnit', true);
            $age = get_user_meta($user_id, '_profile_age', true);
            $gender = get_user_meta($user_id, '_profile_gender', true);
            $available_equipment = get_user_meta($user_id, '_profile_availableEquipment', true);
            $custom_equipment = get_user_meta($user_id, '_profile_customEquipment', true);
            $preferred_location = get_user_meta($user_id, '_profile_preferredLocation', true);
            $limitations = get_user_meta($user_id, '_profile_limitations', true);
            $limitation_notes = get_user_meta($user_id, '_profile_limitationNotes', true);
            $workout_frequency = get_user_meta($user_id, '_profile_workoutFrequency', true);
            $custom_frequency = get_user_meta($user_id, '_profile_customFrequency', true);
            $preferred_workout_duration = get_user_meta($user_id, '_profile_preferredWorkoutDuration', true);
            $favorite_exercises = get_user_meta($user_id, '_profile_favoriteExercises', true);
            $disliked_exercises = get_user_meta($user_id, '_profile_dislikedExercises', true);
            $medical_conditions = get_user_meta($user_id, '_profile_medicalConditions', true);
            $profile_complete = get_user_meta($user_id, '_profile_profileComplete', true);
            $created_at = get_user_meta($user_id, '_profile_createdAt', true);
            $updated_at = get_user_meta($user_id, '_profile_updatedAt', true);
            
            // Set timestamps if not present
            if (empty($created_at)) {
                $created_at = current_time('mysql');
                update_user_meta($user_id, '_profile_createdAt', $created_at);
            }
            
            if (empty($updated_at)) {
                $updated_at = current_time('mysql');
                update_user_meta($user_id, '_profile_updatedAt', $updated_at);
            }
            
            // Build the profile data using frontend field names
            $profile = [
                'id' => $user_id,
                'firstName' => $first_name ?: '',
                'lastName' => $last_name ?: '',
                'email' => $email ?: '',
                'fitnessLevel' => $fitness_level ?: 'beginner',
                'goals' => is_array($goals) ? $goals : ['general_fitness'],
                'customGoal' => $custom_goal ?: '',
                'weight' => intval($weight),
                'weightUnit' => $weight_unit ?: 'lbs',
                'height' => intval($height),
                'heightUnit' => $height_unit ?: 'ft',
                'age' => intval($age),
                'gender' => $gender ?: '',
                'availableEquipment' => is_array($available_equipment) ? $available_equipment : ['none'],
                'customEquipment' => $custom_equipment ?: '',
                'preferredLocation' => $preferred_location ?: 'home',
                'limitations' => is_array($limitations) ? $limitations : ['none'],
                'limitationNotes' => $limitation_notes ?: '',
                'workoutFrequency' => $workout_frequency ?: '3-4',
                'customFrequency' => $custom_frequency ?: '',
                'preferredWorkoutDuration' => intval($preferred_workout_duration) ?: 30,
                'favoriteExercises' => is_array($favorite_exercises) ? $favorite_exercises : [],
                'dislikedExercises' => is_array($disliked_exercises) ? $disliked_exercises : [],
                'medicalConditions' => is_array($medical_conditions) ? $medical_conditions : [],
                'profileComplete' => (bool) $profile_complete,
                'lastUpdated' => $updated_at,
                'completedWorkouts' => 0 // This would come from workout logs in the future
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
            
            // Validate parameters using frontend field names
            $validation_errors = [];
            
            // Validate fitnessLevel
            if (isset($params['fitnessLevel']) && !in_array($params['fitnessLevel'], ['beginner', 'intermediate', 'advanced'])) {
                $validation_errors['fitnessLevel'] = 'Fitness level must be one of: beginner, intermediate, advanced';
            }
            
            // Validate workoutFrequency
            if (isset($params['workoutFrequency']) && !in_array($params['workoutFrequency'], ['1-2', '3-4', '5+', 'custom'])) {
                $validation_errors['workoutFrequency'] = 'Workout frequency must be one of: 1-2, 3-4, 5+, custom';
            }
            
            // Validate preferredWorkoutDuration
            if (isset($params['preferredWorkoutDuration']) && (!is_numeric($params['preferredWorkoutDuration']) || $params['preferredWorkoutDuration'] < 10 || $params['preferredWorkoutDuration'] > 120)) {
                $validation_errors['preferredWorkoutDuration'] = 'Workout duration must be a number between 10 and 120';
            }
            
            // Validate goals
            if (isset($params['goals']) && !is_array($params['goals'])) {
                $validation_errors['goals'] = 'Goals must be an array';
            }
            
            // Return validation errors if any
            if (!empty($validation_errors)) {
                return APIUtils::create_validation_error(
                    $validation_errors,
                    'Invalid profile data'
                );
            }
            
            // Update profile data in user meta using frontend field names
            if (isset($params['firstName'])) {
                update_user_meta($user_id, '_profile_firstName', sanitize_text_field($params['firstName']));
            }
            
            if (isset($params['lastName'])) {
                update_user_meta($user_id, '_profile_lastName', sanitize_text_field($params['lastName']));
            }
            
            if (isset($params['email'])) {
                update_user_meta($user_id, '_profile_email', sanitize_email($params['email']));
            }
            
            if (isset($params['fitnessLevel'])) {
                update_user_meta($user_id, '_profile_fitnessLevel', sanitize_text_field($params['fitnessLevel']));
            }
            
            if (isset($params['goals']) && is_array($params['goals'])) {
                $sanitized_goals = array_map('sanitize_text_field', $params['goals']);
                update_user_meta($user_id, '_profile_goals', $sanitized_goals);
            }
            
            if (isset($params['customGoal'])) {
                update_user_meta($user_id, '_profile_customGoal', sanitize_textarea_field($params['customGoal']));
            }
            
            if (isset($params['weight'])) {
                update_user_meta($user_id, '_profile_weight', intval($params['weight']));
            }
            
            if (isset($params['weightUnit'])) {
                update_user_meta($user_id, '_profile_weightUnit', sanitize_text_field($params['weightUnit']));
            }
            
            if (isset($params['height'])) {
                update_user_meta($user_id, '_profile_height', intval($params['height']));
            }
            
            if (isset($params['heightUnit'])) {
                update_user_meta($user_id, '_profile_heightUnit', sanitize_text_field($params['heightUnit']));
            }
            
            if (isset($params['age'])) {
                update_user_meta($user_id, '_profile_age', intval($params['age']));
            }
            
            if (isset($params['gender'])) {
                update_user_meta($user_id, '_profile_gender', sanitize_text_field($params['gender']));
            }
            
            if (isset($params['availableEquipment']) && is_array($params['availableEquipment'])) {
                $sanitized_equipment = array_map('sanitize_text_field', $params['availableEquipment']);
                update_user_meta($user_id, '_profile_availableEquipment', $sanitized_equipment);
            }
            
            if (isset($params['customEquipment'])) {
                update_user_meta($user_id, '_profile_customEquipment', sanitize_textarea_field($params['customEquipment']));
            }
            
            if (isset($params['preferredLocation'])) {
                update_user_meta($user_id, '_profile_preferredLocation', sanitize_text_field($params['preferredLocation']));
            }
            
            if (isset($params['limitations']) && is_array($params['limitations'])) {
                $sanitized_limitations = array_map('sanitize_text_field', $params['limitations']);
                update_user_meta($user_id, '_profile_limitations', $sanitized_limitations);
            }
            
            if (isset($params['limitationNotes'])) {
                update_user_meta($user_id, '_profile_limitationNotes', sanitize_textarea_field($params['limitationNotes']));
            }
            
            if (isset($params['workoutFrequency'])) {
                update_user_meta($user_id, '_profile_workoutFrequency', sanitize_text_field($params['workoutFrequency']));
            }
            
            if (isset($params['customFrequency'])) {
                update_user_meta($user_id, '_profile_customFrequency', sanitize_textarea_field($params['customFrequency']));
            }
            
            if (isset($params['preferredWorkoutDuration'])) {
                update_user_meta($user_id, '_profile_preferredWorkoutDuration', intval($params['preferredWorkoutDuration']));
            }
            
            if (isset($params['favoriteExercises']) && is_array($params['favoriteExercises'])) {
                $sanitized_exercises = array_map('sanitize_text_field', $params['favoriteExercises']);
                update_user_meta($user_id, '_profile_favoriteExercises', $sanitized_exercises);
            }
            
            if (isset($params['dislikedExercises']) && is_array($params['dislikedExercises'])) {
                $sanitized_exercises = array_map('sanitize_text_field', $params['dislikedExercises']);
                update_user_meta($user_id, '_profile_dislikedExercises', $sanitized_exercises);
            }
            
            if (isset($params['medicalConditions']) && is_array($params['medicalConditions'])) {
                $sanitized_conditions = array_map('sanitize_text_field', $params['medicalConditions']);
                update_user_meta($user_id, '_profile_medicalConditions', $sanitized_conditions);
            }
            
            if (isset($params['profileComplete'])) {
                update_user_meta($user_id, '_profile_profileComplete', (bool) $params['profileComplete']);
            }
            
            // Update the updated timestamp
            $now = current_time('mysql');
            update_user_meta($user_id, '_profile_updatedAt', $now);
            
            // If this is the first update, set the created timestamp
            $created_at = get_user_meta($user_id, '_profile_createdAt', true);
            if (empty($created_at)) {
                update_user_meta($user_id, '_profile_createdAt', $now);
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