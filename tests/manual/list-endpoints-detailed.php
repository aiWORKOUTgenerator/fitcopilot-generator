<?php
/**
 * List Endpoints Detailed Script
 * 
 * This script scans the source code files to find all REST API endpoints
 * and provides detailed information including HTTP methods and auth requirements.
 */

// Configuration
$src_dir = __DIR__ . '/../../src/php';

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
 * Scan file content for endpoint registrations with more details
 */
function scan_file_for_endpoints($file) {
    $matches = [];
    $content = file_get_contents($file);
    
    // First find all namespace definitions
    if (preg_match_all('/const\s+API_NAMESPACE\s*=\s*[\'"]([^\'"]+)[\'"]/', $content, $namespace_consts, PREG_SET_ORDER)) {
        foreach ($namespace_consts as $const_match) {
            $namespace = $const_match[1];
            
            // Find route registrations using this namespace constant
            $pattern = '/register_rest_route\s*\(\s*self::API_NAMESPACE\s*,\s*[\'"]([^\'"]+)[\'"]\s*,\s*\[(.*?)\]\s*\)/s';
            if (preg_match_all($pattern, $content, $route_matches, PREG_SET_ORDER)) {
                foreach ($route_matches as $route_match) {
                    $route = $route_match[1];
                    $config = $route_match[2];
                    
                    // Extract methods
                    $methods = [];
                    if (preg_match('/[\'"]methods[\'"]\s*=>\s*[\'"]([^\'"]+)[\'"]/', $config, $method_match)) {
                        $methods = explode(',', $method_match[1]);
                        array_walk($methods, 'trim');
                    }
                    
                    // Extract auth requirements
                    $requires_auth = false;
                    if (preg_match('/[\'"]permission_callback[\'"]\s*=>\s*\[\s*\$this\s*,\s*[\'"]([^\'"]+)[\'"]/', $config, $auth_match)) {
                        $auth_method = $auth_match[1];
                        $requires_auth = ($auth_method === 'user_permissions_check');
                    }
                    
                    $matches[] = [
                        'namespace' => $namespace,
                        'route' => $route,
                        'methods' => $methods,
                        'requires_auth' => $requires_auth,
                        'file' => $file
                    ];
                }
            }
        }
    }
    
    // Also search for direct register_rest_route calls
    $direct_pattern = '/register_rest_route\s*\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*[\'"]([^\'"]+)[\'"]\s*,\s*\[(.*?)\]\s*\)/s';
    if (preg_match_all($direct_pattern, $content, $direct_matches, PREG_SET_ORDER)) {
        foreach ($direct_matches as $match) {
            $namespace = $match[1];
            $route = $match[2];
            $config = $match[3];
            
            // Extract methods
            $methods = [];
            if (preg_match('/[\'"]methods[\'"]\s*=>\s*[\'"]([^\'"]+)[\'"]/', $config, $method_match)) {
                $methods = explode(',', $method_match[1]);
                array_walk($methods, 'trim');
            } else if (preg_match('/[\'"]methods[\'"]\s*=>\s*\[([^\]]+)\]/', $config, $method_match)) {
                $method_array = $method_match[1];
                preg_match_all('/[\'"]([^\'"]+)[\'"]/', $method_array, $method_items);
                $methods = $method_items[1];
            }
            
            // Extract auth requirements
            $requires_auth = false;
            if (preg_match('/[\'"]permission_callback[\'"]\s*=>\s*function\s*\(\s*\)\s*{\s*return\s+([^;]+);/', $config, $anon_auth_match)) {
                $auth_check = trim($anon_auth_match[1]);
                $requires_auth = ($auth_check !== 'true');
            } else if (preg_match('/[\'"]permission_callback[\'"]\s*=>\s*\[\s*\$this\s*,\s*[\'"]([^\'"]+)[\'"]/', $config, $auth_match)) {
                $auth_method = $auth_match[1];
                $requires_auth = ($auth_method === 'user_permissions_check');
            }
            
            $matches[] = [
                'namespace' => $namespace,
                'route' => $route,
                'methods' => $methods,
                'requires_auth' => $requires_auth,
                'file' => $file
            ];
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

/**
 * Format methods for display
 */
function format_methods($methods) {
    if (empty($methods)) {
        return "GET"; // Default method in WordPress REST API
    }
    return implode(', ', $methods);
}

// Main execution
echo "Scanning for API endpoints in: {$src_dir}\n\n";

$php_files = find_php_files($src_dir);
echo "Found " . count($php_files) . " PHP files to scan.\n\n";

foreach ($php_files as $file) {
    $relative_path = str_replace($src_dir . '/', '', $file);
    $file_endpoints = scan_file_for_endpoints($file);
    
    if (!empty($file_endpoints)) {
        echo "File: {$relative_path}\n";
        echo str_repeat('-', strlen("File: {$relative_path}")) . "\n";
        
        foreach ($file_endpoints as $endpoint) {
            $full_route = format_route($endpoint['namespace'], $endpoint['route']);
            $methods = format_methods($endpoint['methods']);
            $auth = $endpoint['requires_auth'] ? 'Yes' : 'No';
            
            echo "  {$full_route}\n";
            echo "    Methods: {$methods}\n";
            echo "    Requires Auth: {$auth}\n";
            echo "\n";
            
            // Store for summary
            $endpoints[] = [
                'route' => $full_route,
                'methods' => $methods,
                'requires_auth' => $auth,
                'file' => $relative_path,
            ];
        }
    }
}

// Remove duplicates by route name (keeping the first occurrence)
$unique_endpoints = [];
$seen_routes = [];

foreach ($endpoints as $endpoint) {
    $route_key = $endpoint['route'] . '|' . $endpoint['methods'];
    if (!isset($seen_routes[$route_key])) {
        $seen_routes[$route_key] = true;
        $unique_endpoints[] = $endpoint;
    }
}

// Sort endpoints
usort($unique_endpoints, function($a, $b) {
    return strcmp($a['route'], $b['route']);
});

// Print summary
echo "=== ENDPOINT SUMMARY ===\n";
echo "Total unique endpoints found: " . count($unique_endpoints) . "\n\n";

echo "All endpoints:\n";
echo "-------------\n";
printf("%-40s | %-15s | %-14s | %s\n", "Route", "HTTP Methods", "Requires Auth", "File");
echo str_repeat('-', 100) . "\n";

foreach ($unique_endpoints as $endpoint) {
    printf("%-40s | %-15s | %-14s | %s\n", 
        $endpoint['route'], 
        $endpoint['methods'], 
        $endpoint['requires_auth'],
        $endpoint['file']
    );
} 