<?php
/**
 * Plugin Name: FitCopilot Workout Generator
 * Description: AI-powered workout generation plugin using OpenAI integration
 * Version: 1.0.0
 * Author: FitCopilot
 * Text Domain: fitcopilot-generator
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

define('FITCOPILOT_VERSION', '1.0.0');
define('FITCOPILOT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FITCOPILOT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('FITCOPILOT_PLUGIN_FILE', __FILE__);

// Load autoloader if it exists
if (file_exists(FITCOPILOT_PLUGIN_DIR . 'vendor/autoload.php')) {
    require_once FITCOPILOT_PLUGIN_DIR . 'vendor/autoload.php';
}

// Bootstrap the plugin
require_once FITCOPILOT_PLUGIN_DIR . 'src/php/bootstrap.php';

// Initialize plugin
function fitcopilot_init() {
    // Load text domain for translations
    load_plugin_textdomain('fitcopilot-generator', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('plugins_loaded', 'fitcopilot_init'); 