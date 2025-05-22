<?php
/**
 * Manual Test for Version History Endpoint
 * 
 * Usage: This file should be run from WordPress admin via a browser or WP-CLI.
 * It manually checks if our endpoints are properly registered.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit('Direct access not allowed.');
}

/**
 * Test function to verify Version History Endpoint
 */
function fitcopilot_test_version_history_endpoint() {
    echo "<h1>FitCopilot Version History Endpoint Test</h1>";
    
    // Test 1: Check if endpoint class exists
    echo "<h2>Test 1: Check if VersionHistoryEndpoint class exists</h2>";
    $class_exists = class_exists('FitCopilot\\API\\WorkoutEndpoints\\VersionHistoryEndpoint');
    echo "VersionHistoryEndpoint class exists: " . ($class_exists ? 'Yes' : 'No') . "<br>";
    
    // Test 2: Check if endpoint is registered in controller
    echo "<h2>Test 2: Check if endpoint is registered in WorkoutEndpointsController</h2>";
    $controller = new FitCopilot\API\WorkoutEndpoints\WorkoutEndpointsController();
    $endpoints = $controller->get_endpoints();
    $has_endpoint = isset($endpoints['VersionHistoryEndpoint']);
    echo "VersionHistoryEndpoint registered in controller: " . ($has_endpoint ? 'Yes' : 'No') . "<br>";
    
    // Test 3: Check REST API registration
    echo "<h2>Test 3: Check REST API registration</h2>";
    $routes = rest_get_server()->get_routes();
    $has_route = false;
    foreach ($routes as $route => $handlers) {
        if (strpos($route, 'fitcopilot/v1/workouts/(?P<id>\d+)/versions') !== false) {
            $has_route = true;
            break;
        }
    }
    echo "REST API route for version history exists: " . ($has_route ? 'Yes' : 'No') . "<br>";
    
    // Test 4: Test VersioningService method existence
    echo "<h2>Test 4: Check VersioningService method</h2>";
    $versioning_service = new FitCopilot\Service\Versioning\VersioningService();
    $method_exists = method_exists($versioning_service, 'get_workout_version_history');
    echo "get_workout_version_history method exists: " . ($method_exists ? 'Yes' : 'No') . "<br>";
    
    // Overall result
    echo "<h2>Overall Result</h2>";
    $overall = $class_exists && $has_endpoint && $has_route && $method_exists;
    echo "All tests passed: " . ($overall ? 'Yes' : 'No') . "<br>";
    
    return $overall;
}

/**
 * Test function to verify Compare Versions Endpoint
 */
function fitcopilot_test_compare_versions_endpoint() {
    echo "<h1>FitCopilot Compare Versions Endpoint Test</h1>";
    
    // Test 1: Check if endpoint class exists
    echo "<h2>Test 1: Check if CompareVersionsEndpoint class exists</h2>";
    $class_exists = class_exists('FitCopilot\\API\\WorkoutEndpoints\\CompareVersionsEndpoint');
    echo "CompareVersionsEndpoint class exists: " . ($class_exists ? 'Yes' : 'No') . "<br>";
    
    // Test 2: Check if endpoint is registered in controller
    echo "<h2>Test 2: Check if endpoint is registered in WorkoutEndpointsController</h2>";
    $controller = new FitCopilot\API\WorkoutEndpoints\WorkoutEndpointsController();
    $endpoints = $controller->get_endpoints();
    $has_endpoint = isset($endpoints['CompareVersionsEndpoint']);
    echo "CompareVersionsEndpoint registered in controller: " . ($has_endpoint ? 'Yes' : 'No') . "<br>";
    
    // Test 3: Check REST API registration
    echo "<h2>Test 3: Check REST API registration</h2>";
    $routes = rest_get_server()->get_routes();
    $has_route = false;
    foreach ($routes as $route => $handlers) {
        if (strpos($route, 'fitcopilot/v1/workouts/(?P<id>\d+)/versions/compare') !== false) {
            $has_route = true;
            break;
        }
    }
    echo "REST API route for version comparison exists: " . ($has_route ? 'Yes' : 'No') . "<br>";
    
    // Test 4: Test VersioningService method existence
    echo "<h2>Test 4: Check VersioningService method</h2>";
    $versioning_service = new FitCopilot\Service\Versioning\VersioningService();
    $method_exists = method_exists($versioning_service, 'compare_workout_versions');
    echo "compare_workout_versions method exists: " . ($method_exists ? 'Yes' : 'No') . "<br>";
    
    // Overall result
    echo "<h2>Overall Result</h2>";
    $overall = $class_exists && $has_endpoint && $has_route && $method_exists;
    echo "All tests passed: " . ($overall ? 'Yes' : 'No') . "<br>";
    
    return $overall;
}

/**
 * Test API request with a given workout and version parameters
 */
function fitcopilot_test_version_api_requests() {
    $api_namespace = 'fitcopilot/v1';
    $nonce = wp_create_nonce('wp_rest');
    
    echo "<h1>API Testing Interface</h1>";
    echo "<div style='margin: 20px 0; padding: 20px; background: #f8f8f8; border: 1px solid #ddd;'>";
    echo "<h2>Test Version History API</h2>";
    echo "<form id='version-history-form'>";
    echo "<div style='margin-bottom: 10px;'>";
    echo "<label for='workout-id'>Workout ID:</label>";
    echo "<input type='text' id='workout-id' name='workout-id' required style='margin-left: 10px;'>";
    echo "</div>";
    echo "<button type='submit' style='background: #0073aa; color: white; border: none; padding: 8px 15px; cursor: pointer;'>Test Version History</button>";
    echo "</form>";
    echo "<div id='version-history-result' style='margin-top: 20px; display: none;'></div>";
    
    echo "<h2 style='margin-top: 30px;'>Test Version Comparison API</h2>";
    echo "<form id='compare-versions-form'>";
    echo "<div style='margin-bottom: 10px;'>";
    echo "<label for='compare-workout-id'>Workout ID:</label>";
    echo "<input type='text' id='compare-workout-id' name='compare-workout-id' required style='margin-left: 10px;'>";
    echo "</div>";
    echo "<div style='margin-bottom: 10px;'>";
    echo "<label for='version1'>Version 1:</label>";
    echo "<input type='number' id='version1' name='version1' required min='1' style='margin-left: 10px;'>";
    echo "</div>";
    echo "<div style='margin-bottom: 10px;'>";
    echo "<label for='version2'>Version 2:</label>";
    echo "<input type='number' id='version2' name='version2' required min='1' style='margin-left: 10px;'>";
    echo "</div>";
    echo "<button type='submit' style='background: #0073aa; color: white; border: none; padding: 8px 15px; cursor: pointer;'>Compare Versions</button>";
    echo "</form>";
    echo "<div id='compare-versions-result' style='margin-top: 20px; display: none;'></div>";
    echo "</div>";
    
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const baseUrl = '<?php echo rest_url($api_namespace); ?>';
        const nonce = '<?php echo $nonce; ?>';
        
        // Version History Form
        document.getElementById('version-history-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const workoutId = document.getElementById('workout-id').value;
            
            if (!workoutId) {
                alert('Please enter a workout ID');
                return;
            }
            
            const resultElement = document.getElementById('version-history-result');
            resultElement.style.display = 'block';
            resultElement.innerHTML = '<p>Loading...</p>';
            
            fetch(`${baseUrl}/workouts/${workoutId}/versions`, {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': nonce
                },
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                resultElement.innerHTML = `
                    <h3>API Response</h3>
                    <pre style="background: #f0f0f0; padding: 15px; overflow: auto;">${JSON.stringify(data, null, 2)}</pre>
                `;
            })
            .catch(error => {
                resultElement.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            });
        });
        
        // Compare Versions Form
        document.getElementById('compare-versions-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const workoutId = document.getElementById('compare-workout-id').value;
            const version1 = document.getElementById('version1').value;
            const version2 = document.getElementById('version2').value;
            
            if (!workoutId || !version1 || !version2) {
                alert('Please fill in all fields');
                return;
            }
            
            const resultElement = document.getElementById('compare-versions-result');
            resultElement.style.display = 'block';
            resultElement.innerHTML = '<p>Loading...</p>';
            
            fetch(`${baseUrl}/workouts/${workoutId}/versions/compare?v1=${version1}&v2=${version2}`, {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': nonce
                },
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                resultElement.innerHTML = `
                    <h3>API Response</h3>
                    <pre style="background: #f0f0f0; padding: 15px; overflow: auto;">${JSON.stringify(data, null, 2)}</pre>
                `;
            })
            .catch(error => {
                resultElement.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            });
        });
    });
    </script>
    <?php
}

// Run all tests
echo "<div style='max-width: 1200px; margin: 0 auto; padding: 20px;'>";
fitcopilot_test_version_history_endpoint();
echo "<hr style='margin: 30px 0;'>";
fitcopilot_test_compare_versions_endpoint();
echo "<hr style='margin: 30px 0;'>";
fitcopilot_test_version_api_requests();
echo "</div>"; 