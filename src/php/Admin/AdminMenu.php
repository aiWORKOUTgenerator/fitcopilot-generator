<?php
/**
 * Admin Menu
 *
 * Manages the admin menu structure for FitCopilot.
 */

namespace FitCopilot\Admin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin Menu class
 */
class AdminMenu {
    
    /**
     * Constructor
     */
    public function __construct() {
        // Register main admin menu
        add_action('admin_menu', [$this, 'register_admin_menu']);
    }
    
    /**
     * Register the main admin menu and parent page
     */
    public function register_admin_menu() {
        // Add the main menu item with a dashboard page
        add_menu_page(
            __('FitCopilot', 'fitcopilot'), // Page title
            __('FitCopilot', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot', // Menu slug
            [$this, 'render_dashboard_page'], // Callback function
            'dashicons-universal-access-alt', // Icon
            30 // Position
        );
        
        // Add Dashboard submenu (duplicate of parent to keep proper naming)
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('Dashboard', 'fitcopilot'), // Page title
            __('Dashboard', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot', // Menu slug (same as parent)
            [$this, 'render_dashboard_page'] // Callback function
        );
        
        // Add Settings submenu
        add_submenu_page(
            'fitcopilot', // Parent slug
            __('Settings', 'fitcopilot'), // Page title
            __('Settings', 'fitcopilot'), // Menu title
            'manage_options', // Capability
            'fitcopilot', // Menu slug (using 'fitcopilot' instead of 'fitcopilot-settings' to match Settings)
            'FitCopilot\\Admin\\render_settings' // Use the render_settings function from Settings class
        );
    }
    
    /**
     * Render the dashboard page
     */
    public function render_dashboard_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('FitCopilot Dashboard', 'fitcopilot'); ?></h1>
            
            <style>
                .dashboard-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                .dashboard-card {
                    background: white;
                    border-radius: 5px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    padding: 20px;
                    border-left: 4px solid #2271b1;
                }
                .dashboard-card h2 {
                    margin-top: 0;
                    color: #2271b1;
                }
                .dashboard-card p {
                    margin-bottom: 15px;
                }
                .dashboard-card .button {
                    display: inline-block;
                    margin-top: 5px;
                }
                @media (max-width: 782px) {
                    .dashboard-container {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <div class="dashboard-container">
                <div class="dashboard-card">
                    <h2><?php echo esc_html__('Recent Activity', 'fitcopilot'); ?></h2>
                    <p><?php echo esc_html__('View your recent workout generation activity.', 'fitcopilot'); ?></p>
                </div>
                
                <div class="dashboard-card">
                    <h2><?php echo esc_html__('API Usage', 'fitcopilot'); ?></h2>
                    <p><?php echo esc_html__('Monitor your OpenAI API usage and costs.', 'fitcopilot'); ?></p>
                    <p><a href="<?php echo esc_url(admin_url('admin.php?page=fitcopilot-api-tracker')); ?>" class="button"><?php echo esc_html__('View API Tracker', 'fitcopilot'); ?></a></p>
                </div>
                
                <div class="dashboard-card">
                    <h2><?php echo esc_html__('Documentation', 'fitcopilot'); ?></h2>
                    <p><?php echo esc_html__('Learn how to use FitCopilot in your WordPress site.', 'fitcopilot'); ?></p>
                </div>
            </div>
            
            <script>
            /* <![CDATA[ */
            document.addEventListener('DOMContentLoaded', function() {
                // Any JavaScript code here will not be entity-encoded
                var container = document.querySelector('.dashboard-container');
                if (container && container.children.length > 0) {
                    console.log('Dashboard loaded with ' + container.children.length + ' cards');
                }
            });
            /* ]]> */
            </script>
        </div>
        <?php
    }
}

// Initialize the admin menu
new AdminMenu(); 