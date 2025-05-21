<?php
/**
 * Debug Path Script
 * 
 * This script helps identify the correct path to WordPress files
 * and diagnose path-related issues.
 */

// Output basic server info
echo "<h1>WordPress Path Debugging</h1>";
echo "<p>Current script path: " . __FILE__ . "</p>";
echo "<p>Current directory: " . dirname(__FILE__) . "</p>";

// Try to identify WP paths
$possible_wp_load_paths = [
    // Navigate up directories from current location
    dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/wp-load.php',
    dirname(dirname(dirname(dirname(dirname(dirname(__FILE__)))))) . '/wp-load.php',
    dirname(dirname(dirname(dirname(dirname(dirname(dirname(__FILE__))))))) . '/wp-load.php',
    
    // Absolute paths based on known structure
    '/Users/justinfassio/Local Sites/fitcopilot-generator/app/public/wp-load.php',
    '/Users/justinfassio/Local Sites/fitcopilot-generator/app/public/wordpress/wp-load.php',
];

echo "<h2>Possible wp-load.php Locations</h2>";
echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>Path</th><th>Exists?</th></tr>";

foreach ($possible_wp_load_paths as $path) {
    $exists = file_exists($path);
    $exists_text = $exists ? "✅ YES" : "❌ NO";
    $row_style = $exists ? "background-color: #dff0d8;" : "background-color: #f2dede;";
    
    echo "<tr style='{$row_style}'>";
    echo "<td>" . htmlspecialchars($path) . "</td>";
    echo "<td>" . $exists_text . "</td>";
    echo "</tr>";
}

echo "</table>";

// Check parent directories
echo "<h2>Parent Directory Listing</h2>";
$current_dir = dirname(__FILE__);
$max_levels = 7;

echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>Level</th><th>Path</th><th>Is Directory?</th><th>Is Readable?</th></tr>";

for ($i = 0; $i <= $max_levels; $i++) {
    $is_dir = is_dir($current_dir);
    $is_readable = is_readable($current_dir);
    
    echo "<tr>";
    echo "<td>" . $i . "</td>";
    echo "<td>" . htmlspecialchars($current_dir) . "</td>";
    echo "<td>" . ($is_dir ? "✅ YES" : "❌ NO") . "</td>";
    echo "<td>" . ($is_readable ? "✅ YES" : "❌ NO") . "</td>";
    echo "</tr>";
    
    // Move up one level
    $current_dir = dirname($current_dir);
}

echo "</table>";

// Look for wp-config.php as an alternative marker for WordPress root
echo "<h2>wp-config.php Search</h2>";
$current_dir = dirname(__FILE__);
$wp_config_found = false;

echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>Level</th><th>Path</th><th>wp-config.php Exists?</th></tr>";

for ($i = 0; $i <= $max_levels; $i++) {
    $wp_config_path = $current_dir . '/wp-config.php';
    $exists = file_exists($wp_config_path);
    $row_style = $exists ? "background-color: #dff0d8;" : "";
    
    if ($exists) {
        $wp_config_found = true;
    }
    
    echo "<tr style='{$row_style}'>";
    echo "<td>" . $i . "</td>";
    echo "<td>" . htmlspecialchars($wp_config_path) . "</td>";
    echo "<td>" . ($exists ? "✅ YES" : "❌ NO") . "</td>";
    echo "</tr>";
    
    // Move up one level
    $current_dir = dirname($current_dir);
}

echo "</table>";

// Show file system details
echo "<h2>System Info</h2>";
echo "<ul>";
echo "<li>PHP Version: " . phpversion() . "</li>";
echo "<li>Server Software: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</li>";
echo "<li>Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "</li>";
echo "<li>Current Working Directory: " . getcwd() . "</li>";
echo "</ul>";

// Provide suggestions based on findings
echo "<h2>Recommendations</h2>";

if ($wp_config_found) {
    echo "<p>Found wp-config.php in one of the parent directories. Try using this path structure in your script.</p>";
} else {
    echo "<p>Could not find wp-config.php. Your WordPress installation might be in a non-standard location.</p>";
}

echo "<p>Based on the debugging information above, update the path in your test-api-endpoints.php file.</p>";
echo "<p>Example:</p>";
echo "<code>require_once '/path/to/your/wordpress/wp-load.php';</code>"; 