<?php
/**
 * Compatibility Endpoints
 *
 * Registers additional compatibility endpoints to support tests and legacy clients.
 */

namespace FitCopilot\API;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add compatibility endpoints for testing
 */
add_action('rest_api_init', function() {
    // Get an instance of the WorkoutEndpoints class
    $workout_endpoints = new WorkoutEndpoints();
    
    // Register the generate endpoint at multiple paths for compatibility
    register_rest_route('fitcopilot/v1', 'generate', [
        'methods'             => 'POST',
        'callback'            => [$workout_endpoints, 'generate_workout'],
        'permission_callback' => [$workout_endpoints, 'user_permissions_check'],
    ]);
    
    // Also register with a leading slash for some test environments
    register_rest_route('fitcopilot/v1', '/generate', [
        'methods'             => 'POST',
        'callback'            => [$workout_endpoints, 'generate_workout'],
        'permission_callback' => [$workout_endpoints, 'user_permissions_check'],
    ]);
    
    error_log('FitCopilot registered compatibility endpoints');
}); 