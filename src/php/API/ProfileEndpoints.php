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
        // Profile endpoints
        register_rest_route('fitcopilot/v1', '/profile', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_profile'],
                'permission_callback' => [$this, 'user_permissions_check'],
            ],
            [
                'methods' => 'PUT',
                'callback' => [$this, 'update_profile'],
                'permission_callback' => [$this, 'user_permissions_check'],
            ],
        ]);
        
        // Add diagnostic endpoint for troubleshooting
        register_rest_route('fitcopilot/v1', '/profile/debug', [
            'methods' => 'GET',
            'callback' => [$this, 'debug_profile_auth'],
            'permission_callback' => '__return_true', // Allow access for debugging
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
     * Get WordPress user data with error handling
     *
     * @param int $user_id The user ID
     * @return \WP_User WordPress user object
     * @throws \Exception If user not found
     */
    private function get_wordpress_user($user_id) {
        $wp_user = get_userdata($user_id);
        if (!$wp_user) {
            throw new \Exception("WordPress user with ID {$user_id} not found");
        }
        return $wp_user;
    }
    
    /**
     * Build user identity data with WordPress fallbacks
     *
     * @param int $user_id The user ID
     * @param \WP_User $wp_user WordPress user object
     * @return array User identity data with fallbacks
     */
    private function build_user_identity($user_id, $wp_user) {
        // Get profile meta for user identity fields
        $first_name = get_user_meta($user_id, '_profile_firstName', true);
        $last_name = get_user_meta($user_id, '_profile_lastName', true);
        $email = get_user_meta($user_id, '_profile_email', true);
        
        return [
            'username' => $wp_user->user_login,
            'firstName' => $first_name ?: $wp_user->first_name,
            'lastName' => $last_name ?: $wp_user->last_name,
            'email' => $email ?: $wp_user->user_email,
            'displayName' => $wp_user->display_name,
            'avatarUrl' => get_avatar_url($user_id, [
                'size' => 80, 
                'default' => 'identicon',
                'force_default' => false
            ])
        ];
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
            
            // Get WordPress user data for fallback integration
            $wp_user = $this->get_wordpress_user($user_id);
            
            // Get user identity data with WordPress fallbacks
            $user_identity = $this->build_user_identity($user_id, $wp_user);
            
            // Get the profile data from user meta using frontend field names
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
            
            // Build the profile data with WordPress user fallbacks
            $profile = array_merge([
                'id' => $user_id,
            ], $user_identity, [
                // Fitness profile data (no fallbacks needed)
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
                'medicalConditions' => is_array($medical_conditions) ? implode(', ', $medical_conditions) : ($medical_conditions ?: ''),
                'profileComplete' => (bool) $profile_complete,
                'lastUpdated' => $updated_at,
                'completedWorkouts' => 0 // This would come from workout logs in the future
            ]);
            
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
            
            if (isset($params['medicalConditions'])) {
                if (is_array($params['medicalConditions'])) {
                    $sanitized_conditions = array_map('sanitize_text_field', $params['medicalConditions']);
                    update_user_meta($user_id, '_profile_medicalConditions', $sanitized_conditions);
                } else {
                    // Handle string format (frontend sends as string)
                    update_user_meta($user_id, '_profile_medicalConditions', sanitize_textarea_field($params['medicalConditions']));
                }
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

    /**
     * Debug profile authentication and user data
     * 
     * @param \WP_REST_Request $request The request object
     * @return \WP_REST_Response Response object
     */
    public function debug_profile_auth(\WP_REST_Request $request) {
        $debug_info = [
            'timestamp' => current_time('mysql'),
            'authentication' => [
                'is_user_logged_in' => is_user_logged_in(),
                'current_user_id' => get_current_user_id(),
            ],
            'wordpress_user' => null,
            'profile_meta_exists' => false,
            'profile_meta_sample' => [],
            'nonce_verification' => [
                'wp_rest_nonce' => wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest'),
                'nonce_header_present' => !empty($request->get_header('X-WP-Nonce')),
                'nonce_value' => $request->get_header('X-WP-Nonce') ? 'Present' : 'Missing'
            ]
        ];
        
        $user_id = get_current_user_id();
        
        if ($user_id > 0) {
            // Get WordPress user data
            $wp_user = get_userdata($user_id);
            if ($wp_user) {
                $debug_info['wordpress_user'] = [
                    'ID' => $wp_user->ID,
                    'user_login' => $wp_user->user_login,
                    'user_email' => $wp_user->user_email,
                    'display_name' => $wp_user->display_name,
                    'first_name' => $wp_user->first_name,
                    'last_name' => $wp_user->last_name,
                    'user_registered' => $wp_user->user_registered,
                ];
            }
            
            // Check for profile meta data
            $profile_meta_keys = [
                '_profile_firstName',
                '_profile_lastName', 
                '_profile_email',
                '_profile_fitnessLevel',
                '_profile_goals',
                '_profile_profileComplete',
                '_profile_createdAt',
                '_profile_updatedAt'
            ];
            
            $profile_meta_found = [];
            foreach ($profile_meta_keys as $key) {
                $value = get_user_meta($user_id, $key, true);
                if (!empty($value)) {
                    $profile_meta_found[$key] = $value;
                }
            }
            
            $debug_info['profile_meta_exists'] = !empty($profile_meta_found);
            $debug_info['profile_meta_sample'] = $profile_meta_found;
        }
        
        // Add session information
        $debug_info['session'] = [
            'session_id' => session_id(),
            'session_status' => session_status(),
            'cookie_domain' => COOKIE_DOMAIN,
            'wp_cookies' => [
                'logged_in_cookie' => isset($_COOKIE[LOGGED_IN_COOKIE]) ? 'Present' : 'Missing',
                'auth_cookie' => isset($_COOKIE[AUTH_COOKIE]) ? 'Present' : 'Missing',
                'secure_auth_cookie' => isset($_COOKIE[SECURE_AUTH_COOKIE]) ? 'Present' : 'Missing',
            ]
        ];
        
        return APIUtils::create_api_response(
            $debug_info,
            'Debug information retrieved successfully'
        );
    }
}

// Initialize the class
new ProfileEndpoints(); 