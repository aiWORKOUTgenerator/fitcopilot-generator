<?php
/**
 * Workout Controller for FitCopilot
 */

namespace FitCopilot\REST;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Initialize REST API endpoints for direct workout generation
 */
add_action('rest_api_init', function() {
    register_rest_route(
        'fitcopilot/v1',
        '/generate-workout',
        [
            'methods' => 'POST',
            'callback' => 'FitCopilot\\REST\\handle_generate_workout',
            'permission_callback' => function() { return current_user_can('read'); },
        ]
    );
});

/**
 * Handle the workout generation request
 * 
 * @param \WP_REST_Request $request The request object
 * @return \WP_REST_Response The response object
 */
function handle_generate_workout(\WP_REST_Request $request) {
    // Get the OpenAI API key
    $api_key = get_option('fitcopilot_openai_api_key', '');
    if (empty($api_key)) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'OpenAI API key not configured. Please set it in the FitCopilot settings.',
            'code' => 'missing_api_key'
        ], 400);
    }

    // Parse & validate the JSON parameters
    $params = $request->get_json_params();
    $user_id = get_current_user_id();

    if (empty($user_id) || empty($params['specific_request'])) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => 'Invalid request parameters',
            'code' => 'invalid_params'
        ], 400);
    }

    try {
        // Use the OpenAI provider to generate the workout
        $provider = new \FitCopilot\Service\AI\OpenAIProvider($api_key);
        
        // Prepare parameters for workout generation
        $generation_params = [
            'duration' => $params['duration'] ?? 30,
            'difficulty' => $params['difficulty'] ?? 'intermediate',
            'equipment' => $params['equipment'] ?? [],
            'goals' => $params['goals'] ?? 'general fitness',
            'restrictions' => $params['restrictions'] ?? '',
            'specific_request' => $params['specific_request']
        ];
        
        // Generate the workout
        $workout = $provider->generateWorkout($generation_params);
        
        // Save the workout to the database if needed
        $post_id = save_generated_workout($workout, $user_id, $generation_params);
        
        // Return the success response
        return new \WP_REST_Response([
            'success' => true,
            'data' => [
                'workout' => $workout,
                'post_id' => $post_id
            ],
            'message' => 'Workout generated successfully'
        ]);
    } catch (\Exception $e) {
        return new \WP_REST_Response([
            'success' => false,
            'message' => $e->getMessage(),
            'code' => 'generation_error'
        ], 500);
    }
}

/**
 * Save the generated workout to the database
 * 
 * @param array $workout The generated workout data
 * @param int $user_id The user ID
 * @param array $params The generation parameters
 * @return int The post ID
 */
function save_generated_workout($workout, $user_id, $params) {
    // Create the post content from the workout data
    $content = '';
    
    // Add sections to the content
    if (!empty($workout['sections'])) {
        foreach ($workout['sections'] as $section) {
            $content .= '<h3>' . esc_html($section['name']) . '</h3>';
            $content .= '<p>Duration: ' . esc_html($section['duration']) . ' minutes</p>';
            
            if (!empty($section['exercises'])) {
                $content .= '<ul>';
                foreach ($section['exercises'] as $exercise) {
                    $content .= '<li>';
                    $content .= '<strong>' . esc_html($exercise['name']) . '</strong>';
                    
                    if (!empty($exercise['duration'])) {
                        $content .= ' - ' . esc_html($exercise['duration']);
                    } elseif (!empty($exercise['sets']) && !empty($exercise['reps'])) {
                        $content .= ' - ' . esc_html($exercise['sets']) . ' sets of ' . esc_html($exercise['reps']) . ' reps';
                    }
                    
                    if (!empty($exercise['description'])) {
                        $content .= '<p>' . esc_html($exercise['description']) . '</p>';
                    }
                    
                    $content .= '</li>';
                }
                $content .= '</ul>';
            }
        }
    }
    
    // Insert the post
    $post_data = [
        'post_title' => sanitize_text_field($workout['title']),
        'post_content' => $content,
        'post_status' => 'publish',
        'post_author' => $user_id,
        'post_type' => 'fc_workout'
    ];
    
    $post_id = wp_insert_post($post_data);
    
    if (is_wp_error($post_id)) {
        throw new \Exception('Failed to save workout: ' . $post_id->get_error_message());
    }
    
    // Save the generation parameters as post meta
    update_post_meta($post_id, 'workout_duration', $params['duration']);
    update_post_meta($post_id, 'workout_difficulty', $params['difficulty']);
    update_post_meta($post_id, 'workout_equipment', $params['equipment']);
    update_post_meta($post_id, 'workout_goals', $params['goals']);
    update_post_meta($post_id, 'workout_restrictions', $params['restrictions']);
    update_post_meta($post_id, 'workout_specific_request', $params['specific_request']);
    
    // Save the raw workout data for future reference
    update_post_meta($post_id, 'workout_data', $workout);
    
    return $post_id;
} 