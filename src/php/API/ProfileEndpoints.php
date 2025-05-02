<?php
/**
 * Profile API Endpoints
 *
 * Handles the REST API endpoints for user profiles
 */

namespace FitCopilot\API;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register REST API endpoints for profiles
 */
function register_profile_endpoints() {
    // Register the GET endpoint for retrieving a user's profile
    register_rest_route('fitcopilot/v1', '/profile', [
        'methods' => 'GET',
        'callback' => 'FitCopilot\\API\\get_user_profile',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ]);

    // Register the PUT endpoint for updating a user's profile
    register_rest_route('fitcopilot/v1', '/profile', [
        'methods' => 'PUT',
        'callback' => 'FitCopilot\\API\\update_user_profile',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ]);
}
add_action('rest_api_init', 'FitCopilot\\API\\register_profile_endpoints');

/**
 * Get the user's profile
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response Response object
 */
function get_user_profile($request) {
    $user_id = get_current_user_id();
    
    // Get the profile data from user meta
    $fitness_level = get_user_meta($user_id, 'fitness_level', true);
    $workout_goals = get_user_meta($user_id, 'workout_goals', true);
    $equipment_available = get_user_meta($user_id, 'equipment_available', true);
    $workout_frequency = get_user_meta($user_id, 'workout_frequency', true);
    $workout_duration = get_user_meta($user_id, 'workout_duration', true);
    $preferences = get_user_meta($user_id, 'fitness_preferences', true);
    $medical_conditions = get_user_meta($user_id, 'medical_conditions', true);
    
    // Set default values if not set
    if (empty($fitness_level)) {
        $fitness_level = 'beginner';
    }
    
    if (empty($workout_goals) || !is_array($workout_goals)) {
        $workout_goals = ['strength'];
    }
    
    if (empty($equipment_available)) {
        $equipment_available = 'minimal';
    }
    
    if (empty($workout_frequency)) {
        $workout_frequency = 3;
    }
    
    if (empty($workout_duration)) {
        $workout_duration = 30;
    }
    
    if (empty($preferences) || !is_array($preferences)) {
        $preferences = [
            'darkMode' => false,
            'notifications' => true,
            'metrics' => 'imperial'
        ];
    }
    
    if (empty($medical_conditions) || !is_array($medical_conditions)) {
        $medical_conditions = [];
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
        'createdAt' => get_user_meta($user_id, 'profile_created_at', true),
        'updatedAt' => get_user_meta($user_id, 'profile_updated_at', true)
    ];
    
    return new \WP_REST_Response([
        'success' => true,
        'data' => $profile
    ]);
}

/**
 * Update the user's profile
 *
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response Response object
 */
function update_user_profile($request) {
    $user_id = get_current_user_id();
    $params = json_decode($request->get_body(), true);
    
    if (!is_array($params)) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Invalid request data',
            'code' => 'invalid_data'
        ], 400);
    }
    
    // Update profile data in user meta
    if (isset($params['fitnessLevel'])) {
        update_user_meta($user_id, 'fitness_level', sanitize_text_field($params['fitnessLevel']));
    }
    
    if (isset($params['workoutGoals']) && is_array($params['workoutGoals'])) {
        // Sanitize each goal
        $sanitized_goals = array_map('sanitize_text_field', $params['workoutGoals']);
        update_user_meta($user_id, 'workout_goals', $sanitized_goals);
    }
    
    if (isset($params['equipmentAvailable'])) {
        update_user_meta($user_id, 'equipment_available', sanitize_text_field($params['equipmentAvailable']));
    }
    
    if (isset($params['workoutFrequency'])) {
        update_user_meta($user_id, 'workout_frequency', intval($params['workoutFrequency']));
    }
    
    if (isset($params['workoutDuration'])) {
        update_user_meta($user_id, 'workout_duration', intval($params['workoutDuration']));
    }
    
    if (isset($params['preferences']) && is_array($params['preferences'])) {
        // Get existing preferences
        $existing_preferences = get_user_meta($user_id, 'fitness_preferences', true);
        if (!is_array($existing_preferences)) {
            $existing_preferences = [
                'darkMode' => false,
                'notifications' => true,
                'metrics' => 'imperial'
            ];
        }
        
        // Update only the provided preferences
        $updated_preferences = array_merge($existing_preferences, $params['preferences']);
        update_user_meta($user_id, 'fitness_preferences', $updated_preferences);
    }
    
    if (isset($params['medicalConditions']) && is_array($params['medicalConditions'])) {
        update_user_meta($user_id, 'medical_conditions', $params['medicalConditions']);
    }
    
    // Update the updated_at timestamp
    $now = current_time('mysql');
    update_user_meta($user_id, 'profile_updated_at', $now);
    
    // If this is the first update, set the created_at timestamp
    $created_at = get_user_meta($user_id, 'profile_created_at', true);
    if (empty($created_at)) {
        update_user_meta($user_id, 'profile_created_at', $now);
        $created_at = $now;
    }
    
    // Get the updated profile
    return get_user_profile($request);
} 