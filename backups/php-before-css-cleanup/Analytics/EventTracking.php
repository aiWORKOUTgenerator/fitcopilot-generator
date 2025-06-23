<?php
/**
 * Analytics Event Tracking
 * 
 * Handles tracking user events via AJAX
 */

namespace FitCopilot\Analytics;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Initialize analytics event tracking
 */
function init() {
    // Register AJAX handlers
    add_action('wp_ajax_fitcopilot_track_event', __NAMESPACE__ . '\\handle_track_event');
    add_action('wp_ajax_nopriv_fitcopilot_track_event', __NAMESPACE__ . '\\handle_track_event');

    // Add analytics nonce to frontend
    add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\localize_analytics_data');
}
add_action('init', __NAMESPACE__ . '\\init');

/**
 * Add analytics data to frontend
 */
function localize_analytics_data() {
    // Only add when the main script is enqueued
    if (wp_script_is('fitcopilot-frontend', 'enqueued')) {
        wp_localize_script(
            'fitcopilot-frontend',
            'workoutGenerator',
            [
                'nonce' => wp_create_nonce('fitcopilot_analytics'),
            ]
        );
    }
}

/**
 * Handle AJAX tracking event
 */
function handle_track_event() {
    // Verify nonce
    if (!check_ajax_referer('fitcopilot_analytics', 'security', false)) {
        wp_send_json_error(['message' => 'Invalid security token'], 403);
        exit;
    }

    // Get event data
    $event_json = isset($_POST['event_data']) ? $_POST['event_data'] : '';
    $event_data = json_decode($event_json, true);
    
    if (!$event_data || !isset($event_data['event_type'])) {
        wp_send_json_error(['message' => 'Invalid event data'], 400);
        exit;
    }

    // Get user ID (0 for anonymous users)
    $user_id = get_current_user_id();
    
    // Log the event
    $logged = log_event($user_id, $event_data['event_type'], $event_data['event_data'] ?? []);
    
    if ($logged) {
        wp_send_json_success(['message' => 'Event tracked successfully']);
    } else {
        wp_send_json_error(['message' => 'Failed to track event'], 500);
    }
    
    exit;
}

/**
 * Log an event to the database
 * 
 * @param int $user_id User ID
 * @param string $event_type Type of event
 * @param array $event_data Additional event data
 * @return bool Whether the event was logged successfully
 */
function log_event($user_id, $event_type, $event_data = []) {
    // In a production implementation, you would log this to the database
    // For now, just log to the error log for debugging
    error_log(
        sprintf(
            'FitCopilot Analytics: [User: %d] [Event: %s] [Data: %s]',
            $user_id,
            $event_type,
            json_encode($event_data)
        )
    );
    
    // Return true as if we successfully logged the event
    return true;
} 