<?php
/**
 * API Tracker Admin Page
 *
 * Renders the admin page for API Tracker
 */

namespace FitCopilot\Admin;

use FitCopilot\API\APITracker;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Tracker Admin Page
 */
class APITrackerPage {
    
    /**
     * Page slug
     */
    const PAGE_SLUG = 'fitcopilot-api-tracker';
    
    /**
     * API Tracker instance
     *
     * @var APITracker
     */
    private $tracker;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Use the global tracker instance
        global $fitcopilot_api_tracker;
        
        if (!isset($fitcopilot_api_tracker)) {
            $fitcopilot_api_tracker = new APITracker();
        }
        
        $this->tracker = $fitcopilot_api_tracker;
        
        // Register admin page
        add_action('admin_menu', [$this, 'register_admin_page']);
        
        // Register scripts and styles
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
    }
    
    /**
     * Register admin page
     */
    public function register_admin_page() {
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('API Tracker', 'fitcopilot'), // Page title
            __('API Tracker', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            self::PAGE_SLUG, // Menu slug
            [$this, 'render_admin_page'] // Callback
        );
    }
    
    /**
     * Enqueue scripts and styles
     *
     * @param string $hook Current admin page
     */
    public function enqueue_scripts($hook) {
        // Only load on API Tracker page
        if ('fitcopilot_page_' . self::PAGE_SLUG !== $hook) {
            return;
        }
        
        // Enqueue WordPress dependencies
        wp_enqueue_script('wp-api-fetch');
        wp_enqueue_script('wp-i18n');
        wp_enqueue_script('wp-url');
        
        // Enqueue Chart.js - make sure it's loaded before our app
        wp_enqueue_script(
            'chartjs',
            'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
            [],
            '3.9.1',
            true
        );
        
        // Enqueue vendors first to avoid dependency issues
        wp_enqueue_script(
            'fitcopilot-vendors',
            FITCOPILOT_URL . 'dist/js/vendors.js',
            [],
            FITCOPILOT_VERSION,
            true
        );
        
        // Add defer attribute to vendors script
        add_filter('script_loader_tag', function($tag, $handle) {
            if ('fitcopilot-vendors' === $handle) {
                return str_replace(' src', ' defer src', $tag);
            }
            return $tag;
        }, 10, 2);
        
        // Enqueue our app scripts
        wp_enqueue_script(
            'fitcopilot-api-tracker',
            FITCOPILOT_URL . 'dist/js/api-tracker.js',
            ['wp-element', 'wp-api-fetch', 'wp-i18n', 'wp-url', 'chartjs', 'fitcopilot-vendors'],
            FITCOPILOT_VERSION,
            true
        );
        
        // Add defer attribute to api-tracker script
        add_filter('script_loader_tag', function($tag, $handle) {
            if ('fitcopilot-api-tracker' === $handle) {
                return str_replace(' src', ' defer src', $tag);
            }
            return $tag;
        }, 10, 2);
        
        // Enqueue our app styles
        wp_enqueue_style(
            'fitcopilot-api-tracker',
            FITCOPILOT_URL . 'dist/css/api-tracker.css',
            [],
            FITCOPILOT_VERSION
        );
        
        // Localize script with data for the frontend
        wp_localize_script(
            'fitcopilot-api-tracker',
            'fitcopilotApiTracker',
            [
                'nonce' => wp_create_nonce('wp_rest'),
                'rootApiUrl' => esc_url_raw(rest_url()),
                'apiBase' => esc_url_raw(rest_url('fitcopilot/v1')),
                'endpoints' => [
                    'summary' => esc_url_raw(rest_url('fitcopilot/v1/api-tracker/summary')),
                    'daily' => esc_url_raw(rest_url('fitcopilot/v1/api-tracker/daily')),
                    'monthly' => esc_url_raw(rest_url('fitcopilot/v1/api-tracker/monthly')),
                    'tokenCost' => esc_url_raw(rest_url('fitcopilot/v1/api-tracker/token-cost')),
                    'reset' => esc_url_raw(rest_url('fitcopilot/v1/api-tracker/reset')),
                ],
                'pluginVersion' => FITCOPILOT_VERSION,
                'debugInfo' => [
                    'adminHook' => $hook,
                    'pageSlug' => self::PAGE_SLUG,
                    'expectedHook' => 'fitcopilot_page_' . self::PAGE_SLUG,
                ],
            ]
        );
    }
    
    /**
     * Render admin page
     */
    public function render_admin_page() {
        // Enable error reporting to help diagnose issues
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('API Tracker', 'fitcopilot'); ?></h1>
            <!-- Isolated container with higher z-index for event handling -->
            <div id="fitcopilot-api-tracker-root" class="api-tracker-container"></div>
            
            <?php 
            // Directly include scripts as a fallback
            $plugin_url = FITCOPILOT_URL;
            $version = FITCOPILOT_VERSION;
            ?>
            
            <script>
                // Check if scripts are already loaded
                if (typeof window.fitcopilotApiTracker === 'undefined' || 
                    typeof window.fitcopilotApiTracker.initAPITracker === 'undefined') {
                    console.log('Directly loading scripts...');
                    
                    // Create vendors script element
                    var vendorsScript = document.createElement('script');
                    vendorsScript.src = '<?php echo esc_url($plugin_url . "dist/js/vendors.js?ver=" . $version); ?>';
                    vendorsScript.onload = function() {
                        console.log('Vendors script loaded directly');
                        
                        // Create api-tracker script element after vendors is loaded
                        var apiTrackerScript = document.createElement('script');
                        apiTrackerScript.src = '<?php echo esc_url($plugin_url . "dist/js/api-tracker.js?ver=" . $version); ?>';
                        apiTrackerScript.onload = function() {
                            console.log('API Tracker script loaded directly');
                            
                            // Initialize if the global function is now available
                            if (typeof window.fitcopilotApiTracker !== 'undefined' && 
                                typeof window.fitcopilotApiTracker.initAPITracker === 'function') {
                                console.log('Initializing API Tracker after direct load');
                                // Add a slight delay to ensure WordPress scripts have initialized
                                setTimeout(function() {
                                    window.fitcopilotApiTracker.initAPITracker('fitcopilot-api-tracker-root');
                                }, 100);
                            }
                        };
                        document.body.appendChild(apiTrackerScript);
                    };
                    document.body.appendChild(vendorsScript);
                }
            </script>
            
            <div class="debug-info" style="display: none; margin-top: 20px; padding: 10px; background: #f8f8f8; border: 1px solid #ddd;">
                <h2>Debug Information</h2>
                <p>If you're seeing this message, the React app hasn't initialized properly.</p>
                <p>Verify that the following JavaScript files are loaded:</p>
                <ul>
                    <li>js/vendors.js</li>
                    <li>js/api-tracker.js</li>
                </ul>
                <p>Also check the browser console for any JavaScript errors.</p>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        console.log('DOMContentLoaded event fired');
                        
                        // Check loaded scripts
                        var scripts = document.querySelectorAll('script');
                        console.log('Loaded scripts:', scripts.length);
                        scripts.forEach(function(script) {
                            if (script.src) {
                                console.log(' - ' + script.src);
                            }
                        });
                        
                        // Check if the root element exists
                        var rootElement = document.getElementById('fitcopilot-api-tracker-root');
                        console.log('Root element found:', rootElement);
                        
                        // Check if wp.element exists
                        console.log('wp.element exists:', typeof wp !== 'undefined' && typeof wp.element !== 'undefined');
                        
                        // Check if window.fitcopilotApiTracker exists
                        console.log('window.fitcopilotApiTracker exists:', typeof window.fitcopilotApiTracker !== 'undefined');
                        console.log('fitcopilotApiTracker object:', window.fitcopilotApiTracker);
                        
                        // Try to manually trigger initialization if the global function exists
                        if (typeof window.fitcopilotApiTracker !== 'undefined' && 
                            typeof window.fitcopilotApiTracker.initAPITracker === 'function') {
                            console.log('Manually initializing API Tracker');
                            // Add a slight delay to ensure WordPress scripts have initialized
                            setTimeout(function() {
                                window.fitcopilotApiTracker.initAPITracker('fitcopilot-api-tracker-root');
                            }, 100);
                        } else {
                            console.error('window.fitcopilotApiTracker.initAPITracker function not found');
                        }
                    });
                </script>
            </div>
        </div>
        <?php
    }
}

// Initialize the admin page
new APITrackerPage(); 