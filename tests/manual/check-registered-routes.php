<?php
/**
 * Check Registered Routes
 * 
 * This script displays all registered REST API routes to help debug missing endpoints.
 */

// Bootstrap WordPress
$wp_root = dirname(dirname(dirname(dirname(dirname(dirname(__FILE__))))));
if (file_exists($wp_root . '/wp-load.php')) {
    require_once $wp_root . '/wp-load.php';
} else {
    die('WordPress installation not found.');
}

global $wp_rest_server;

// Ensure the REST API is initialized
do_action('rest_api_init');

// Get all registered routes
$routes = $wp_rest_server->get_routes();

// Display the output as HTML
header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>REST API Routes</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2, h3 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .route { margin-bottom: 10px; padding: 5px; border-bottom: 1px solid #eee; }
        .highlight { background-color: #ffffcc; }
    </style>
</head>
<body>
    <h1>Registered REST API Routes</h1>
    <p>This page shows all registered REST API routes in your WordPress installation.</p>
    
    <h2>FitCopilot Routes</h2>
    <?php 
    $found_fitcopilot_routes = false;
    foreach ($routes as $route => $route_data) {
        if (strpos($route, 'fitcopilot/v1') !== false) {
            $found_fitcopilot_routes = true;
            echo '<div class="route">';
            echo '<h3>' . esc_html($route) . '</h3>';
            echo '<pre>';
            
            foreach ($route_data as $route_endpoint) {
                $methods = implode(', ', $route_endpoint['methods']);
                $callback = is_array($route_endpoint['callback']) 
                    ? (is_object($route_endpoint['callback'][0]) 
                        ? get_class($route_endpoint['callback'][0]) . '->' . $route_endpoint['callback'][1]
                        : $route_endpoint['callback'][0] . '::' . $route_endpoint['callback'][1])
                    : (is_callable($route_endpoint['callback']) ? 'function()' : print_r($route_endpoint['callback'], true));
                
                echo 'Methods: ' . esc_html($methods) . "\n";
                echo 'Callback: ' . esc_html($callback) . "\n\n";
            }
            
            echo '</pre>';
            echo '</div>';
        }
    }
    
    if (!$found_fitcopilot_routes) {
        echo '<p class="highlight">No routes found with namespace "fitcopilot/v1"</p>';
    }
    ?>
    
    <h2>All Routes</h2>
    <p>
        <input type="text" id="routeFilter" placeholder="Filter routes..." style="width: 300px; padding: 5px;">
        <button id="toggleAll">Toggle All Routes</button>
    </p>
    <div id="allRoutes">
    <?php
    foreach ($routes as $route => $route_data) {
        echo '<div class="route">';
        echo '<h3>' . esc_html($route) . '</h3>';
        echo '<pre>';
        
        foreach ($route_data as $route_endpoint) {
            $methods = implode(', ', $route_endpoint['methods']);
            $callback = is_array($route_endpoint['callback']) 
                ? (is_object($route_endpoint['callback'][0]) 
                    ? get_class($route_endpoint['callback'][0]) . '->' . $route_endpoint['callback'][1]
                    : $route_endpoint['callback'][0] . '::' . $route_endpoint['callback'][1])
                : (is_callable($route_endpoint['callback']) ? 'function()' : print_r($route_endpoint['callback'], true));
            
            echo 'Methods: ' . esc_html($methods) . "\n";
            echo 'Callback: ' . esc_html($callback) . "\n\n";
        }
        
        echo '</pre>';
        echo '</div>';
    }
    ?>
    </div>
    
    <script>
        // Filter routes based on input
        const routeFilter = document.getElementById('routeFilter');
        const allRoutes = document.querySelectorAll('#allRoutes .route');
        
        routeFilter.addEventListener('input', function() {
            const filterText = this.value.toLowerCase();
            
            allRoutes.forEach(route => {
                const routeName = route.querySelector('h3').innerText.toLowerCase();
                if (routeName.includes(filterText)) {
                    route.style.display = 'block';
                } else {
                    route.style.display = 'none';
                }
            });
        });
        
        // Toggle all routes visibility
        const toggleButton = document.getElementById('toggleAll');
        let routesVisible = true;
        
        toggleButton.addEventListener('click', function() {
            routesVisible = !routesVisible;
            document.getElementById('allRoutes').style.display = routesVisible ? 'block' : 'none';
            this.innerText = routesVisible ? 'Hide All Routes' : 'Show All Routes';
        });
    </script>
</body>
</html> 