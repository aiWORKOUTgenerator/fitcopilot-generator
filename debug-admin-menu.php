<?php
/**
 * Debug Admin Menu Loading
 * 
 * Run this script to check if the AdminMenu is loading properly.
 * Place this file in your plugin root and access via browser.
 */

// WordPress environment setup
define('WP_USE_THEMES', false);
require_once('../../../wp-load.php');

// Check if we're in WordPress admin context
if (!is_admin()) {
    echo "<h1>🚨 Not in Admin Context</h1>";
    echo "<p>This script should be run from WordPress admin context.</p>";
    exit;
}

echo "<h1>🔍 FitCopilot Admin Menu Debug Report</h1>";
echo "<hr>";

// 1. Check if AdminMenu class exists
echo "<h2>1. Class Loading Check</h2>";
if (class_exists('FitCopilot\\Admin\\AdminMenu')) {
    echo "✅ <strong>AdminMenu class loaded successfully</strong><br>";
} else {
    echo "❌ <strong>AdminMenu class NOT found</strong><br>";
    echo "🔧 <strong>Fix:</strong> Check if bootstrap.php is loading AdminMenu.php<br>";
}

// 2. Check if bootstrap is loading AdminMenu
echo "<h2>2. Bootstrap Loading Check</h2>";
$bootstrap_file = __DIR__ . '/src/php/bootstrap.php';
if (file_exists($bootstrap_file)) {
    $bootstrap_content = file_get_contents($bootstrap_file);
    if (strpos($bootstrap_content, 'AdminMenu.php') !== false) {
        echo "✅ <strong>AdminMenu.php is required in bootstrap.php</strong><br>";
    } else {
        echo "❌ <strong>AdminMenu.php NOT found in bootstrap.php</strong><br>";
        echo "🔧 <strong>Fix:</strong> Add require_once for AdminMenu.php in bootstrap.php<br>";
    }
} else {
    echo "❌ <strong>bootstrap.php not found</strong><br>";
}

// 3. Check WordPress admin menu registration
echo "<h2>3. WordPress Menu Registration Check</h2>";
global $menu, $submenu;

$fitcopilot_found = false;
$ai_prompt_system_found = false;

if (isset($menu)) {
    foreach ($menu as $menu_item) {
        if (isset($menu_item[0]) && strpos($menu_item[0], 'FitCopilot') !== false) {
            $fitcopilot_found = true;
            echo "✅ <strong>FitCopilot main menu found:</strong> " . esc_html($menu_item[0]) . "<br>";
        }
    }
}

if (isset($submenu['fitcopilot'])) {
    echo "✅ <strong>FitCopilot submenus found:</strong><br>";
    foreach ($submenu['fitcopilot'] as $submenu_item) {
        echo "&nbsp;&nbsp;&nbsp;&nbsp;📄 " . esc_html($submenu_item[0]) . " (slug: " . esc_html($submenu_item[2]) . ")<br>";
        if (strpos($submenu_item[0], 'AI Prompt System') !== false) {
            $ai_prompt_system_found = true;
        }
    }
} else {
    echo "❌ <strong>No FitCopilot submenus found</strong><br>";
}

// 4. Check current user capabilities
echo "<h2>4. User Permissions Check</h2>";
if (current_user_can('manage_options')) {
    echo "✅ <strong>Current user has 'manage_options' capability</strong><br>";
} else {
    echo "❌ <strong>Current user lacks 'manage_options' capability</strong><br>";
    echo "🔧 <strong>Fix:</strong> Login as Administrator or user with manage_options capability<br>";
}

// 5. Check plugin constants
echo "<h2>5. Plugin Constants Check</h2>";
if (defined('FITCOPILOT_DIR')) {
    echo "✅ <strong>FITCOPILOT_DIR defined:</strong> " . FITCOPILOT_DIR . "<br>";
} else {
    echo "❌ <strong>FITCOPILOT_DIR not defined</strong><br>";
}

if (defined('FITCOPILOT_URL')) {
    echo "✅ <strong>FITCOPILOT_URL defined:</strong> " . FITCOPILOT_URL . "<br>";
} else {
    echo "❌ <strong>FITCOPILOT_URL not defined</strong><br>";
}

if (defined('FITCOPILOT_VERSION')) {
    echo "✅ <strong>FITCOPILOT_VERSION defined:</strong> " . FITCOPILOT_VERSION . "<br>";
} else {
    echo "❌ <strong>FITCOPILOT_VERSION not defined</strong><br>";
}

// 6. Check asset files
echo "<h2>6. Asset Files Check</h2>";
$css_file = __DIR__ . '/assets/css/admin-prompt-system.css';
$js_file = __DIR__ . '/assets/js/admin-prompt-system.js';

if (file_exists($css_file)) {
    echo "✅ <strong>Admin CSS file exists:</strong> " . filesize($css_file) . " bytes<br>";
} else {
    echo "❌ <strong>Admin CSS file missing:</strong> $css_file<br>";
}

if (file_exists($js_file)) {
    echo "✅ <strong>Admin JS file exists:</strong> " . filesize($js_file) . " bytes<br>";
} else {
    echo "❌ <strong>Admin JS file missing:</strong> $js_file<br>";
}

// 7. Check WordPress hooks
echo "<h2>7. WordPress Hooks Check</h2>";
if (has_action('admin_menu')) {
    echo "✅ <strong>admin_menu hook has actions registered</strong><br>";
} else {
    echo "❌ <strong>No admin_menu actions found</strong><br>";
}

// 8. Summary and recommendations
echo "<h2>8. Summary & Next Steps</h2>";

if ($fitcopilot_found && $ai_prompt_system_found) {
    echo "🎉 <strong style='color: green;'>SUCCESS: Admin menu should be visible!</strong><br>";
    echo "📍 <strong>Navigate to:</strong> WordPress Admin → FitCopilot → AI Prompt System<br>";
} elseif ($fitcopilot_found && !$ai_prompt_system_found) {
    echo "⚠️ <strong style='color: orange;'>PARTIAL: FitCopilot menu exists but AI Prompt System missing</strong><br>";
    echo "🔧 <strong>Check:</strong> AdminMenu class instantiation and admin_menu hook<br>";
} else {
    echo "❌ <strong style='color: red;'>ISSUE: FitCopilot menu not found</strong><br>";
    echo "🔧 <strong>Possible fixes:</strong><br>";
    echo "&nbsp;&nbsp;&nbsp;&nbsp;1. Check if plugin is activated<br>";
    echo "&nbsp;&nbsp;&nbsp;&nbsp;2. Check if bootstrap.php is being loaded<br>";
    echo "&nbsp;&nbsp;&nbsp;&nbsp;3. Check for PHP errors in error logs<br>";
    echo "&nbsp;&nbsp;&nbsp;&nbsp;4. Verify user has admin permissions<br>";
}

echo "<hr>";
echo "<h3>🛠️ Manual Check Instructions</h3>";
echo "<ol>";
echo "<li><strong>Go to WordPress Admin Dashboard</strong></li>";
echo "<li><strong>Look in left sidebar for 'FitCopilot' menu</strong></li>";
echo "<li><strong>Click on 'FitCopilot' to expand submenu</strong></li>";
echo "<li><strong>Look for 'AI Prompt System' submenu item</strong></li>";
echo "<li><strong>Click 'AI Prompt System' to see the new dashboard</strong></li>";
echo "</ol>";

echo "<h3>🔍 If Still Not Visible</h3>";
echo "<ol>";
echo "<li><strong>Check WordPress error logs</strong> (wp-content/debug.log)</li>";
echo "<li><strong>Deactivate and reactivate the plugin</strong></li>";
echo "<li><strong>Clear any caching plugins</strong></li>";
echo "<li><strong>Try a different browser or incognito mode</strong></li>";
echo "</ol>";

echo "<hr>";
echo "<p><em>Debug script completed at " . current_time('mysql') . "</em></p>";
?> 