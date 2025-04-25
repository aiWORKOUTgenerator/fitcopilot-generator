<?php
/**
 * FitCopilot Generator Bootstrap
 *
 * This file bootstraps the plugin by loading required files
 * and setting up necessary hooks.
 */

namespace FitCopilot;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Register Custom Post Type for workouts
require_once FITCOPILOT_DIR . 'src/php/Domain/WorkoutPostType.php';

// Register REST API endpoints
require_once FITCOPILOT_DIR . 'src/php/REST/RestController.php';
require_once FITCOPILOT_DIR . 'src/php/REST/AnalyticsController.php';
require_once FITCOPILOT_DIR . 'src/php/REST/WorkoutController.php';

// Register Service components
require_once FITCOPILOT_DIR . 'src/php/Service/AI/OpenAIProvider.php';

// Register Analytics components
require_once FITCOPILOT_DIR . 'src/php/Analytics/EventTracking.php';

// Register Admin components
require_once FITCOPILOT_DIR . 'src/php/Admin/Settings.php';

/**
 * Enqueue frontend assets
 */
function enqueue_frontend_assets() {
    // Only load assets when shortcode is present
    global $post;
    if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'fitcopilot_generator')) {
        // Enqueue vendors first to avoid dependency issues
        wp_enqueue_script(
            'fitcopilot-vendors',
            FITCOPILOT_URL . 'dist/js/vendors.js',
            [],
            FITCOPILOT_VERSION,
            true
        );
        
        // Enqueue main script
        wp_enqueue_script(
            'fitcopilot-frontend',
            FITCOPILOT_URL . 'dist/js/frontend.js',
            ['wp-element', 'wp-api-fetch', 'fitcopilot-vendors'],
            FITCOPILOT_VERSION,
            true
        );

        // Add defer attribute to vendors script
        add_filter('script_loader_tag', function($tag, $handle) {
            if ('fitcopilot-vendors' === $handle || 'fitcopilot-frontend' === $handle) {
                return str_replace(' src', ' defer src', $tag);
            }
            return $tag;
        }, 10, 2);

        // Enqueue styles
        wp_enqueue_style(
            'fitcopilot-styles',
            FITCOPILOT_URL . 'dist/css/frontend.css',
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
                'debug' => true, // Enable debug mode
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
    $plugin_url = FITCOPILOT_URL;
    $version = FITCOPILOT_VERSION;
    ?>
    <div id="fitcopilot-generator-root" class="fitcopilot-container"></div>
    
    <div id="fitcopilot-debug-info" style="display:none; margin-top: 20px; padding: 15px; background: #f8f8f8; border: 1px solid #ddd; border-radius: 4px;">
        <h3>FitCopilot Workout Generator Troubleshooting</h3>
        <p>The workout generator component failed to load. Here are some possible reasons:</p>
        <ul>
            <li>JavaScript files didn't load properly</li>
            <li>React couldn't initialize the component</li>
            <li>A JavaScript error occurred during initialization</li>
        </ul>
        <p>Required scripts:</p>
        <ul>
            <li>vendors.js: <span id="fitcopilot-check-vendors">❓</span></li>
            <li>frontend.js: <span id="fitcopilot-check-frontend">❓</span></li>
        </ul>
        <p>Please check the browser console for detailed error messages.</p>
    </div>
    
    <script>
        // Debug logging function
        function fcDebugLog(message) {
            if (console && console.log) {
                console.log('[FitCopilot Debug] ' + message);
            }
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            // Check if the container exists
            var container = document.getElementById('fitcopilot-generator-root');
            fcDebugLog('Container element found: ' + (container ? 'Yes' : 'No'));
            
            // Check if scripts were loaded
            function checkScript(url, elementId) {
                var loaded = false;
                var scripts = document.getElementsByTagName('script');
                for (var i = 0; i < scripts.length; i++) {
                    if (scripts[i].src.indexOf(url) !== -1) {
                        document.getElementById(elementId).innerHTML = '✅';
                        loaded = true;
                        break;
                    }
                }
                if (!loaded) {
                    document.getElementById(elementId).innerHTML = '❌';
                }
                return loaded;
            }
            
            // Check if container is empty after a short delay
            setTimeout(function() {
                var container = document.getElementById('fitcopilot-generator-root');
                if (container && container.children.length === 0) {
                    fcDebugLog('Container is empty. Display debug information.');
                    
                    // Check if scripts were loaded
                    checkScript('vendors.js', 'fitcopilot-check-vendors');
                    checkScript('frontend.js', 'fitcopilot-check-frontend');
                    
                    // Show debug info
                    document.getElementById('fitcopilot-debug-info').style.display = 'block';
                    
                    fcDebugLog('Container is empty. Attempting to directly load scripts...');
                    
                    // Get plugin URL from PHP variable
                    var pluginUrl = '<?php echo esc_url($plugin_url); ?>';
                    fcDebugLog('Plugin URL: ' + pluginUrl);
                    
                    // Create vendors script element
                    var vendorsScript = document.createElement('script');
                    vendorsScript.src = pluginUrl + 'dist/js/vendors.js?ver=<?php echo esc_attr($version); ?>';
                    vendorsScript.onload = function() {
                        fcDebugLog('Vendors script loaded');
                        document.getElementById('fitcopilot-check-vendors').innerHTML = '✅ (manual)';
                        
                        // Create frontend script element
                        var frontendScript = document.createElement('script');
                        frontendScript.src = pluginUrl + 'dist/js/frontend.js?ver=<?php echo esc_attr($version); ?>';
                        frontendScript.onload = function() {
                            fcDebugLog('Frontend script loaded');
                            document.getElementById('fitcopilot-check-frontend').innerHTML = '✅ (manual)';
                            fcDebugLog('Checking if React is available: ' + (typeof React !== 'undefined'));
                            fcDebugLog('Checking if ReactDOM is available: ' + (typeof ReactDOM !== 'undefined'));
                            
                            // Try to initialize after a short delay
                            setTimeout(function() {
                                if (container.children.length === 0 && typeof initializeApp === 'function') {
                                    fcDebugLog('Manually calling initializeApp()');
                                    initializeApp();
                                }
                            }, 500);
                        };
                        document.body.appendChild(frontendScript);
                    };
                    document.body.appendChild(vendorsScript);
                }
            }, 3000);
        });
    </script>
    <?php
    return ob_get_clean();
}

// Load API endpoints
require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints.php';

// Load API Tracker
require_once FITCOPILOT_DIR . 'src/php/API/APITracker.php';
require_once FITCOPILOT_DIR . 'src/php/API/APITrackerEndpoints.php';

// Load admin pages
require_once FITCOPILOT_DIR . 'src/php/Admin/AdminMenu.php';
require_once FITCOPILOT_DIR . 'src/php/Admin/APITrackerPage.php';
require_once FITCOPILOT_DIR . 'src/php/Admin/TokenUsagePage.php'; 