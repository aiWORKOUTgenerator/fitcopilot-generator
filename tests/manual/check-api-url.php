<?php
/**
 * API URL Check
 * 
 * This file checks what API URL is being used by the test scripts.
 */

// Bootstrap WordPress
require_once dirname(dirname(dirname(dirname(dirname(dirname(__FILE__)))))) . '/wp-load.php';

// Function to check API URLs
function check_api_urls() {
    // Get the REST API base URL
    $rest_url_fitcopilot = rest_url('fitcopilot/v1');
    
    // Test URL from the test file (PHP version)
    $test_url_php = function_exists("rest_url") ? 
        rest_url("fitcopilot/v1") : 
        site_url("/wp-json/fitcopilot/v1");
    
    // Output the results
    ?>
    <h1>API URL Check</h1>
    
    <h2>REST API URLs</h2>
    <ul>
        <li><strong>REST URL (fitcopilot/v1):</strong> <?php echo $rest_url_fitcopilot; ?></li>
        <li><strong>Test URL (PHP):</strong> <?php echo $test_url_php; ?></li>
    </ul>
    
    <h2>Site Info</h2>
    <ul>
        <li><strong>Site URL:</strong> <?php echo site_url(); ?></li>
        <li><strong>Home URL:</strong> <?php echo home_url(); ?></li>
        <li><strong>Admin URL:</strong> <?php echo admin_url(); ?></li>
        <li><strong>Plugin URL:</strong> <?php echo plugin_dir_url(dirname(dirname(__FILE__))); ?></li>
    </ul>
    
    <h2>Endpoint Check</h2>
    <div>
        <?php
        // Try to make a simple request to the endpoint
        $response = wp_remote_get(
            add_query_arg(
                array('_wpnonce' => wp_create_nonce('wp_rest')),
                $rest_url_fitcopilot
            ),
            array(
                'headers' => array(
                    'X-WP-Nonce' => wp_create_nonce('wp_rest')
                )
            )
        );
        
        if (is_wp_error($response)) {
            echo '<p>Error: ' . $response->get_error_message() . '</p>';
        } else {
            $status_code = wp_remote_retrieve_response_code($response);
            $body = wp_remote_retrieve_body($response);
            
            echo '<p><strong>Status Code:</strong> ' . $status_code . '</p>';
            echo '<p><strong>Response:</strong></p>';
            echo '<pre>' . htmlspecialchars(print_r(json_decode($body, true), true)) . '</pre>';
        }
        ?>
    </div>
    
    <h2>JavaScript URL Check</h2>
    <p>Open the browser console to see the JavaScript URLs:</p>
    <script>
        // Get the REST API URL using WordPress' built-in JS variable
        var wp_api_settings = window.wpApiSettings || {};
        var wp_rest_url = wp_api_settings.root || 'not available';
        
        // Log the API URLs
        console.log('WordPress REST URL:', wp_rest_url);
        console.log('Fitcopilot endpoint:', wp_rest_url + 'fitcopilot/v1');
        
        // Test URL from the test file (JS version)
        var js_test_url = '<?php echo function_exists("rest_url") ? esc_js(rest_url("fitcopilot/v1")) : site_url("/wp-json/fitcopilot/v1"); ?>';
        console.log('JS Test URL:', js_test_url);
    </script>
    <?php
}

// Output the HTML
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>API URL Check</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1, h2 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
        ul { margin-bottom: 20px; }
        li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <?php check_api_urls(); ?>
</body>
</html>
<?php 