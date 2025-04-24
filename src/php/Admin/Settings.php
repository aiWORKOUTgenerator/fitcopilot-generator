<?php
/**
 * Admin Settings Handler for FitCopilot
 */

namespace FitCopilot\Admin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Initialize admin menu and settings
 */
function register_admin_menu() {
    // Top-level FitCopilot menu
    add_menu_page(
        'FitCopilot',                // page title
        'FitCopilot',                // menu title
        'manage_options',            // capability
        'fitcopilot',                // menu slug
        'FitCopilot\\Admin\\render_settings',// callback to render the page
        'dashicons-heart',           // icon (heart icon for fitness)
        80                           // position
    );

    // Settings submenu (under FitCopilot)
    add_submenu_page(
        'fitcopilot',                // parent slug
        'Settings',                  // page title
        'Settings',                  // submenu title
        'manage_options',            // capability
        'fitcopilot',                // menu slug (same as parent to avoid duplicate)
        'FitCopilot\\Admin\\render_settings' // same render callback
    );
}
add_action('admin_menu', 'FitCopilot\\Admin\\register_admin_menu');

/**
 * Register settings
 */
function register_settings() {
    // Register a new setting under the WP options table
    register_setting(
        'fitcopilot_settings_group',     // option group name
        'fitcopilot_openai_api_key',     // option name
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        ]
    );

    // Add a settings section (optional if you want grouping)
    add_settings_section(
        'fitcopilot_api_section',        // ID
        'OpenAI Configuration',          // Title
        function() { 
            echo '<p>Enter your OpenAI API key below to enable AI-powered workout generation.</p>'; 
        },
        'fitcopilot'                     // Page (menu slug)
    );

    // Add the actual API key field
    add_settings_field(
        'fitcopilot_openai_api_key',     // ID
        'OpenAI API Key',                // Label
        function() {
            $key = esc_attr(get_option('fitcopilot_openai_api_key', ''));
            echo "<input type='text' name='fitcopilot_openai_api_key' value='{$key}' style='width:400px;' />";
            echo "<p class='description'>Get your API key from <a href='https://platform.openai.com/api-keys' target='_blank'>OpenAI's API Dashboard</a>.</p>";
        },
        'fitcopilot',                     // Page (menu slug)
        'fitcopilot_api_section'          // Section ID
    );
}
add_action('admin_init', 'FitCopilot\\Admin\\register_settings');

/**
 * Render the settings page
 */
function render_settings() {
    ?>
    <div class="wrap">
      <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
      <form method="post" action="options.php">
        <?php
          settings_fields('fitcopilot_settings_group'); // must match register_setting group
          do_settings_sections('fitcopilot');           // page slug
          submit_button('Save Settings');
        ?>
      </form>
    </div>
    <?php
} 