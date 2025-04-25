<?php
/**
 * Token Usage Admin Page
 *
 * Renders the admin page for Token Usage tracking
 */

namespace FitCopilot\Admin;

use FitCopilot\API\APITracker;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Token Usage Admin Page
 */
class TokenUsagePage {
    
    /**
     * Page slug
     */
    const PAGE_SLUG = 'fitcopilot-token-usage';
    
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
            __('Token Usage', 'fitcopilot'), // Page title
            __('Token Usage', 'fitcopilot'), // Menu title
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
        // Only load on Token Usage page
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
        
        // Enqueue our app scripts
        wp_enqueue_script(
            'fitcopilot-token-usage',
            FITCOPILOT_URL . 'dist/js/token-usage.js',
            ['wp-element', 'wp-api-fetch', 'wp-i18n', 'wp-url', 'chartjs', 'fitcopilot-vendors'],
            FITCOPILOT_VERSION,
            true
        );
        
        // Enqueue our app styles
        wp_enqueue_style(
            'fitcopilot-token-usage',
            FITCOPILOT_URL . 'dist/css/token-usage.css',
            [],
            FITCOPILOT_VERSION
        );
        
        // Localize script with data for the frontend
        wp_localize_script(
            'fitcopilot-token-usage',
            'fitcopilotTokenUsage',
            [
                'nonce' => wp_create_nonce('wp_rest'),
                'rootApiUrl' => esc_url_raw(rest_url()),
                'apiBase' => esc_url_raw(rest_url('fitcopilot/v1')),
                'endpoints' => [
                    'modelSummary' => esc_url_raw(rest_url('fitcopilot/v1/token-usage/model-summary')),
                    'daily' => esc_url_raw(rest_url('fitcopilot/v1/token-usage/daily')),
                    'monthly' => esc_url_raw(rest_url('fitcopilot/v1/token-usage/monthly')),
                    'costBreakdown' => esc_url_raw(rest_url('fitcopilot/v1/token-usage/cost-breakdown')),
                    'reset' => esc_url_raw(rest_url('fitcopilot/v1/token-usage/reset')),
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
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('Token Usage', 'fitcopilot'); ?></h1>
            <div id="fitcopilot-token-usage-root"></div>
            <div class="debug-info" style="margin-top: 20px; padding: 10px; background: #f8f8f8; border: 1px solid #ddd; display: none;">
                <h2>Debug Information</h2>
                <p>If you're seeing this message, the React app hasn't initialized properly.</p>
                <p>Verify that the following JavaScript files are loaded:</p>
                <ul>
                    <li>js/vendors.js</li>
                    <li>js/token-usage.js</li>
                </ul>
                <p>Also check the browser console for any JavaScript errors.</p>
                <script>
                /* <![CDATA[ */
                    document.addEventListener('DOMContentLoaded', function() {
                        // Hide debug info if the app loads successfully
                        window.addEventListener('token-usage-loaded', function() {
                            document.querySelector('.debug-info').style.display = 'none';
                        });
                        
                        // After 3 seconds, if the app hasn't loaded, show debug info
                        setTimeout(function() {
                            var rootElement = document.getElementById('fitcopilot-token-usage-root');
                            if (rootElement && rootElement.children.length === 0) {
                                document.querySelector('.debug-info').style.display = 'block';
                            }
                        }, 3000);
                    });
                /* ]]> */
                </script>
            </div>
        </div>
        <?php
    }
}

// Initialize the admin page
new TokenUsagePage(); 