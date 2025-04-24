<?php
/**
 * Bootstrap file for FitCopilot Workout Generator
 *
 * Handles initialization of all PHP components, REST API registration, and
 * frontend assets enqueuing.
 */

namespace FitCopilot;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Register Custom Post Type for workouts
require_once FITCOPILOT_PLUGIN_DIR . 'src/php/Domain/WorkoutPostType.php';

// Register REST API endpoints
require_once FITCOPILOT_PLUGIN_DIR . 'src/php/REST/RestController.php';
require_once FITCOPILOT_PLUGIN_DIR . 'src/php/REST/AnalyticsController.php';
require_once FITCOPILOT_PLUGIN_DIR . 'src/php/REST/WorkoutController.php';

// Register Service components
require_once FITCOPILOT_PLUGIN_DIR . 'src/php/Service/AI/OpenAIProvider.php';

// Register Analytics components
require_once FITCOPILOT_PLUGIN_DIR . 'src/php/Analytics/EventTracking.php';

// Register Admin components
require_once FITCOPILOT_PLUGIN_DIR . 'src/php/Admin/Settings.php';

/**
 * Enqueue scripts and styles for the frontend
 */
function enqueue_frontend_assets() {
    // Only load assets when shortcode is present
    global $post;
    if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'fitcopilot_generator')) {
        // Enqueue main script
        wp_enqueue_script(
            'fitcopilot-frontend',
            FITCOPILOT_PLUGIN_URL . 'dist/frontend.js',
            ['wp-element', 'wp-api-fetch'],
            FITCOPILOT_VERSION,
            true
        );

        // Enqueue styles
        wp_enqueue_style(
            'fitcopilot-styles',
            FITCOPILOT_PLUGIN_URL . 'dist/frontend.css',
            [],
            FITCOPILOT_VERSION
        );

        // Localize script with necessary data
        wp_localize_script(
            'fitcopilot-frontend',
            'fitcopilotData',
            [
                'nonce' => wp_create_nonce('wp_rest'),
                'apiBase' => rest_url('fitcopilot/v1'),
                'isLoggedIn' => is_user_logged_in(),
            ]
        );
    }
}
add_action('wp_enqueue_scripts', 'FitCopilot\\enqueue_frontend_assets');

/**
 * Register shortcode for the workout generator
 */
function register_generator_shortcode() {
    add_shortcode('fitcopilot_generator', 'FitCopilot\\render_generator_shortcode');
}
add_action('init', 'FitCopilot\\register_generator_shortcode');

/**
 * Render the workout generator shortcode
 *
 * @return string HTML content
 */
function render_generator_shortcode() {
    ob_start();
    ?>
    <div id="fitcopilot-generator-root" class="fitcopilot-container"></div>
    <?php
    return ob_get_clean();
} 