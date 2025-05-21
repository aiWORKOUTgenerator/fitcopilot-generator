<?php
/**
 * Debug Endpoints
 * 
 * This file helps debug which endpoints are available and what response they return.
 */

// Make a direct request to the WordPress REST API
function debug_rest_endpoint($endpoint, $method = 'GET', $data = null) {
    $url = get_rest_url(null, 'fitcopilot/v1/' . $endpoint);
    
    echo "<h3>Testing endpoint: {$url}</h3>";
    
    $args = [
        'method' => $method,
        'headers' => [
            'Content-Type' => 'application/json',
            'X-WP-Nonce' => wp_create_nonce('wp_rest')
        ],
        'timeout' => 60
    ];
    
    if ($data && ($method === 'POST' || $method === 'PUT')) {
        $args['body'] = json_encode($data);
    }
    
    $response = wp_remote_request($url, $args);
    
    if (is_wp_error($response)) {
        echo "<p>Error: " . $response->get_error_message() . "</p>";
        return;
    }
    
    $status = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    echo "<h4>Response Status: {$status}</h4>";
    echo "<pre>" . htmlspecialchars(json_encode(json_decode($body), JSON_PRETTY_PRINT)) . "</pre>";
}

// Bootstrap WordPress
require_once dirname(__FILE__, 6) . '/wp-load.php';

// Ensure user is logged in
if (!is_user_logged_in()) {
    auth_redirect();
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Endpoint Debug Tool</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
        }
        h1, h2, h3, h4 {
            color: #333;
        }
        .endpoint {
            border: 1px solid #ddd;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <h1>API Endpoint Debug Tool</h1>
    <p>This tool helps debug which API endpoints are available and what response they return.</p>
    
    <div class="endpoint">
        <?php 
        // Test the REST info endpoint
        debug_rest_endpoint('', 'GET');
        ?>
    </div>
    
    <div class="endpoint">
        <?php 
        // Test the 'generate' endpoint
        debug_rest_endpoint('generate', 'POST', [
            'duration' => 30,
            'difficulty' => 'intermediate',
            'equipment' => ['dumbbells'],
            'goals' => 'strength',
            'specific_request' => 'A quick strength workout for testing'
        ]);
        ?>
    </div>
    
    <div class="endpoint">
        <?php 
        // Test the 'generate-workout' endpoint
        debug_rest_endpoint('generate-workout', 'POST', [
            'duration' => 30,
            'difficulty' => 'intermediate',
            'equipment' => ['dumbbells'],
            'goals' => 'strength',
            'specific_request' => 'A quick strength workout for testing'
        ]);
        ?>
    </div>
    
    <div class="endpoint">
        <?php
        // Test the wrapped format
        debug_rest_endpoint('generate', 'POST', [
            'workout' => [
                'duration' => 30,
                'difficulty' => 'intermediate',
                'equipment' => ['dumbbells'],
                'goals' => 'strength',
                'specific_request' => 'A quick strength workout for testing'
            ]
        ]);
        ?>
    </div>
</body>
</html> 