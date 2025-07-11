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

// Register Database components
require_once FITCOPILOT_DIR . 'src/php/Database/VersioningSchema.php';
require_once FITCOPILOT_DIR . 'src/php/Database/VersioningMigration.php';

// Register NEW API endpoint system with versioning support
require_once FITCOPILOT_DIR . 'src/php/API/APIUtils.php';
require_once FITCOPILOT_DIR . 'src/php/Service/Versioning/VersioningUtils.php';
require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints/AbstractEndpoint.php';
require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints/WorkoutEndpointsController.php';

// Initialize the workout endpoints controller
add_action('init', function() {
    new \FitCopilot\API\WorkoutEndpoints\WorkoutEndpointsController();
}, 5); // Early priority to register endpoints before other systems

// Register Muscle Data API endpoint
require_once FITCOPILOT_DIR . 'src/php/API/MuscleEndpoints/MuscleDataEndpoint.php';

// Register Analytics API endpoint  
require_once FITCOPILOT_DIR . 'src/php/REST/AnalyticsController.php';

// Register Service components
require_once FITCOPILOT_DIR . 'src/php/Service/AI/OpenAIProvider.php';
require_once FITCOPILOT_DIR . 'src/php/Service/Versioning/VersioningService.php';

// Register Analytics components
require_once FITCOPILOT_DIR . 'src/php/Analytics/EventTracking.php';
require_once FITCOPILOT_DIR . 'src/php/Analytics/WorkoutFocusTracking.php';

// Register Admin components
require_once FITCOPILOT_DIR . 'src/php/Admin/Settings.php';

// Register Module System
require_once FITCOPILOT_DIR . 'src/php/Modules/Core/ModuleInterface.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/Core/ModuleManager.php';

// Initialize Module System immediately
add_action('init', function() {
    $moduleManager = \FitCopilot\Modules\Core\ModuleManager::getInstance();
    $moduleManager->init();
}, 3); // Very early priority to ensure modules are available

// Register NEW modular debug system
require_once FITCOPILOT_DIR . 'src/php/Admin/Debug/DebugBootstrap.php';

// Initialize debug system immediately for AJAX handlers
add_action('init', function() {
    \FitCopilot\Admin\Debug\DebugBootstrap::init();
}, 5); // Early priority to ensure AJAX handlers are registered

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
        
        // Note: TabbedWorkoutDisplay.scss removed - functionality integrated into WorkoutDisplay.scss
        
        // Add fullwidth styles inline
        wp_add_inline_style('fitcopilot-styles', '
            .fitcopilot-fullwidth-container {
                width: 100vw;
                position: relative;
                left: 50%;
                right: 50%;
                margin-left: -50vw;
                margin-right: -50vw;
                box-sizing: border-box;
                padding: 0;
            }
            
            .fitcopilot-container {
                width: 100%;
                max-width: 100%;
                margin: 0;
                padding: 0;
            }
        ');

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
    <div class="fitcopilot-fullwidth-container">
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
    </div>
    
    <script>
    /* <![CDATA[ */
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
    /* ]]> */
    </script>
    <?php
    return ob_get_clean();
}

// Load API endpoints
require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints/Utilities.php';
// Load implemented endpoints
require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints/GenerateEndpoint.php';
require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints/WorkoutRetrievalEndpoint.php';
require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints/WorkoutUpdateEndpoint.php';
require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints/WorkoutCompletionEndpoint.php';
// DISABLED: Causing class name collision with Admin\DebugEndpoints
// require_once FITCOPILOT_DIR . 'src/php/API/WorkoutEndpoints/DebugEndpoints.php';

// Load Profile endpoints
require_once FITCOPILOT_DIR . 'src/php/API/ProfileEndpoints.php';

// Load Modular System (Sprint 2 Implementation)
require_once FITCOPILOT_DIR . 'src/php/Modules/Core/ModuleInterface.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/Core/ModuleManager.php';

// Load ProfileManagement Module
require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileModule.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileRepository.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileValidator.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileView.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/ProfileManagement/ProfileService.php';

// Load MuscleTargeting Module
require_once FITCOPILOT_DIR . 'src/php/Modules/MuscleTargeting/MuscleModule.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/MuscleTargeting/MuscleRepository.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/MuscleTargeting/MuscleService.php';
require_once FITCOPILOT_DIR . 'src/php/Modules/MuscleTargeting/MuscleView.php';

// Initialize ModuleManager System (Sprint 2 - Modularization First Strategy)
add_action('init', function() {
    try {
        error_log('[Bootstrap] Initializing ModuleManager system...');
        
        // Get ModuleManager singleton instance
        $moduleManager = \FitCopilot\Modules\Core\ModuleManager::getInstance();
        
        // Initialize the module system
        $moduleManager->init();
        
        error_log('[Bootstrap] ModuleManager system initialized successfully');
        
    } catch (\Exception $e) {
        error_log('[Bootstrap] Failed to initialize ModuleManager: ' . $e->getMessage());
        error_log('[Bootstrap] Exception trace: ' . $e->getTraceAsString());
        
        // Fallback to legacy module initialization
        error_log('[Bootstrap] Falling back to legacy module initialization...');
        
        // Initialize ProfileModule
        $profile_module = new \FitCopilot\Modules\ProfileManagement\ProfileModule();
        $profile_module->boot();
        $profile_module->registerRoutes();
        $profile_module->registerAssets();
        
        // Initialize MuscleModule  
        $muscle_module = new \FitCopilot\Modules\MuscleTargeting\MuscleModule();
        $muscle_module->boot();
        $muscle_module->registerRoutes();
        $muscle_module->registerAssets();
        
        error_log('[Bootstrap] Legacy module initialization completed');
    }
}, 10);

// Load API Tracker
require_once FITCOPILOT_DIR . 'src/php/API/APITracker.php';
require_once FITCOPILOT_DIR . 'src/php/API/APITrackerEndpoints.php';

// Load admin pages
require_once FITCOPILOT_DIR . 'src/php/Admin/AdminMenu.php';
require_once FITCOPILOT_DIR . 'src/php/Admin/APITrackerPage.php';
require_once FITCOPILOT_DIR . 'src/php/Admin/TokenUsagePage.php';

// Load shortcodes
require_once FITCOPILOT_DIR . 'includes/shortcodes.php';

// Debug registered REST routes
function fitcopilot_debug_rest_routes() {
    global $wp_rest_server;
    
    if (!$wp_rest_server) {
        return;
    }
    
    $routes = $wp_rest_server->get_routes();
    $fitcopilot_routes = [];
    
    foreach ($routes as $route => $route_data) {
        if (strpos($route, 'fitcopilot/v1') !== false) {
            $fitcopilot_routes[$route] = [];
            foreach ($route_data as $endpoint) {
                $methods = implode(', ', $endpoint['methods']);
                $callback = is_array($endpoint['callback']) 
                    ? (is_object($endpoint['callback'][0]) 
                        ? get_class($endpoint['callback'][0]) . '->' . $endpoint['callback'][1]
                        : $endpoint['callback'][0] . '::' . $endpoint['callback'][1])
                    : 'function()';
                $fitcopilot_routes[$route][] = ['methods' => $methods, 'callback' => $callback];
            }
        }
    }
    
    error_log('FitCopilot registered REST routes: ' . print_r($fitcopilot_routes, true));
}
add_action('rest_api_init', 'FitCopilot\\fitcopilot_debug_rest_routes', 999);

// Direct debug endpoint
add_action('rest_api_init', function() {
    register_rest_route('fitcopilot/v1', '/debug', [
        'methods' => 'GET',
        'callback' => function() {
            return new \WP_REST_Response([
                'success' => true,
                'data' => [
                    'message' => 'Debug endpoint accessible',
                    'time' => current_time('mysql'),
                    'plugin_version' => FITCOPILOT_VERSION,
                ],
            ]);
        },
        'permission_callback' => function() {
            return true; // Public endpoint for testing
        },
    ]);
    
    error_log('FitCopilot registered debug endpoints');
});

/**
 * Enqueue admin dashboard assets
 */
function enqueue_admin_dashboard_assets() {
    // Check if we're on the FitCopilot dashboard page
    $screen = get_current_screen();
    if (!$screen || $screen->id !== 'toplevel_page_fitcopilot') {
        return;
    }

    // 🔧 CRITICAL FIX: Add universal authentication setup for ALL dashboard functionality
    // This ensures API authentication works regardless of which specific scripts are loaded
    wp_add_inline_script(
        'wp-api-fetch', // WordPress core script that's always loaded in admin
        '
        // 🔧 UNIVERSAL API AUTHENTICATION SETUP
        (function() {
            console.log("🔧 Setting up universal FitCopilot API authentication...");
            
            // Set up global fitcopilotData for all components
            window.fitcopilotData = window.fitcopilotData || {
                nonce: "' . wp_create_nonce('wp_rest') . '",
                apiBase: "' . rest_url('fitcopilot/v1') . '",
                restUrl: "' . rest_url() . '",
                isLoggedIn: ' . (is_user_logged_in() ? 'true' : 'false') . ',
                currentUserId: ' . get_current_user_id() . ',
                debug: true
            };
            
            // Set up wp.apiFetch with proper authentication
            if (window.wp && window.wp.apiFetch) {
                // Clear any existing middleware to avoid conflicts
                window.wp.apiFetch.use(window.wp.apiFetch.createNonceMiddleware("' . wp_create_nonce('wp_rest') . '"));
                window.wp.apiFetch.use(window.wp.apiFetch.createRootURLMiddleware("' . rest_url() . '"));
                console.log("✅ wp.apiFetch configured with nonce middleware");
            }
            
            // Set up standard fetch headers for manual API calls
            window.fitcopilotApiHeaders = {
                "Content-Type": "application/json",
                "X-WP-Nonce": "' . wp_create_nonce('wp_rest') . '"
            };
            
            console.log("🔧 FitCopilot API authentication configured globally");
            console.log("📡 API Base:", window.fitcopilotData.apiBase);
            console.log("🔐 Nonce available:", !!window.fitcopilotData.nonce);
            console.log("👤 User logged in:", window.fitcopilotData.isLoggedIn);
            console.log("🔑 Auth headers:", window.fitcopilotApiHeaders);
        })();
        ',
        'after'
    );

    // Enqueue vendors script
    wp_enqueue_script(
        'fitcopilot-vendors-admin',
        FITCOPILOT_URL . 'dist/js/vendors.js',
        [],
        FITCOPILOT_VERSION,
        true
    );
    
    // Enqueue profile feature script
    wp_enqueue_script(
        'fitcopilot-profile',
        FITCOPILOT_URL . 'dist/js/profile.js',
        ['wp-element', 'wp-api-fetch', 'fitcopilot-vendors-admin'],
        FITCOPILOT_VERSION,
        true
    );

    // Enqueue profile feature styles
    wp_enqueue_style(
        'fitcopilot-profile-styles',
        FITCOPILOT_URL . 'dist/css/profile.css',
        [],
        FITCOPILOT_VERSION
    );
}
add_action('admin_enqueue_scripts', 'FitCopilot\\enqueue_admin_dashboard_assets'); 