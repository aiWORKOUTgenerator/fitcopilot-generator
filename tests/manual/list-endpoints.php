<?php
/**
 * List Endpoints Script
 * 
 * This script scans the source code files to find all REST API endpoints 
 * without requiring WordPress or database access.
 */

// Configuration
$src_dir = __DIR__ . '/../../src/php';
$api_patterns = [
    'register_rest_route',
    'API_NAMESPACE',
    'fitcopilot/v1',
    'wg/v1',
    'my-wg/v1',
];

// Results storage
$endpoints = [];

/**
 * Find all PHP files recursively in a directory
 */
function find_php_files($dir) {
    $results = [];
    $files = scandir($dir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $path = $dir . '/' . $file;
        
        if (is_dir($path)) {
            $results = array_merge($results, find_php_files($path));
        } else if (pathinfo($path, PATHINFO_EXTENSION) === 'php') {
            $results[] = $path;
        }
    }
    
    return $results;
}

/**
 * Scan file content for endpoint registrations
 */
function scan_file_for_endpoints($file, $patterns) {
    $matches = [];
    $content = file_get_contents($file);
    
    // Search for register_rest_route calls
    if (preg_match_all('/register_rest_route\s*\(\s*[\'"]([^\'"]+)[\'"],\s*[\'"]([^\'"]+)[\'"]/', $content, $direct_matches, PREG_SET_ORDER)) {
        foreach ($direct_matches as $match) {
            $namespace = $match[1];
            $route = $match[2];
            $matches[] = [
                'namespace' => $namespace,
                'route' => $route,
                'file' => $file,
                'source' => 'direct_match',
            ];
        }
    }
    
    // Search for routes defined with constants
    if (preg_match_all('/const\s+API_NAMESPACE\s*=\s*[\'"]([^\'"]+)[\'"]/', $content, $namespace_matches, PREG_SET_ORDER)) {
        foreach ($namespace_matches as $ns_match) {
            $namespace = $ns_match[1];
            
            // Now find route registrations using this namespace
            if (preg_match_all('/register_rest_route\s*\(\s*self::API_NAMESPACE\s*,\s*[\'"]([^\'"]+)[\'"]/', $content, $route_matches, PREG_SET_ORDER)) {
                foreach ($route_matches as $route_match) {
                    $route = $route_match[1];
                    $matches[] = [
                        'namespace' => $namespace,
                        'route' => $route,
                        'file' => $file,
                        'source' => 'namespace_const',
                    ];
                }
            }
        }
    }
    
    return $matches;
}

/**
 * Format a route for display
 */
function format_route($namespace, $route) {
    // Handle leading slashes consistently
    $namespace = ltrim($namespace, '/');
    $route = ltrim($route, '/');
    
    return "/{$namespace}/{$route}";
}

// Main execution
echo "Scanning for API endpoints in: {$src_dir}\n\n";

$php_files = find_php_files($src_dir);
echo "Found " . count($php_files) . " PHP files to scan.\n\n";

foreach ($php_files as $file) {
    $relative_path = str_replace($src_dir . '/', '', $file);
    $file_endpoints = scan_file_for_endpoints($file, $api_patterns);
    
    if (!empty($file_endpoints)) {
        echo "File: {$relative_path}\n";
        echo str_repeat('-', strlen("File: {$relative_path}")) . "\n";
        
        foreach ($file_endpoints as $endpoint) {
            $full_route = format_route($endpoint['namespace'], $endpoint['route']);
            echo "  {$full_route}\n";
            
            // Store for summary
            $endpoints[] = [
                'route' => $full_route,
                'file' => $relative_path,
            ];
        }
        
        echo "\n";
    }
}

// Print summary
echo "=== ENDPOINT SUMMARY ===\n";
echo "Total endpoints found: " . count($endpoints) . "\n\n";

usort($endpoints, function($a, $b) {
    return strcmp($a['route'], $b['route']);
});

echo "All endpoints:\n";
echo "-------------\n";
foreach ($endpoints as $endpoint) {
    echo sprintf("%-40s | %s\n", $endpoint['route'], $endpoint['file']);
} 