<?php
/**
 * API Testing Tool
 *
 * This file allows testing API endpoints directly through the browser
 * without relying on command-line tools or external environments.
 *
 * Usage: Access this file directly in your browser at:
 * http://fitcopilot-generator.local/wp-content/plugins/Fitcopilot-Generator/tests/manual/test-api-endpoints.php
 */

// Ensure this is being run in WordPress
if (!defined('ABSPATH')) {
    define('WP_USE_THEMES', false);
    
    // Alternate bootstrap method for WordPress
    function locate_wordpress_root() {
        $dir = dirname(__FILE__);
        $prev_dir = null;
        $found = false;
        
        // Navigate up until we find wp-config.php or reach the filesystem root
        while ($dir !== $prev_dir) {
            if (file_exists($dir . '/wp-config.php')) {
                return $dir;
            }
            $prev_dir = $dir;
            $dir = dirname($dir);
        }
        
        // Fallback paths - common locations for WordPress installation
        $fallback_paths = [
            '/Users/justinfassio/Local Sites/fitcopilot-generator/app/public/',
            dirname(dirname(dirname(dirname(dirname(dirname(__FILE__)))))),
        ];
        
        foreach ($fallback_paths as $path) {
            if (file_exists($path . '/wp-config.php')) {
                return $path;
            }
        }
        
        return false;
    }
    
    $wp_root = locate_wordpress_root();
    
    if ($wp_root) {
        require_once $wp_root . '/wp-load.php';
    } else {
        // Failed to locate WordPress
        echo '<h1>WordPress Not Found</h1>';
        echo '<p>Could not locate WordPress installation. Please visit the <a href="debug-path.php">debug-path.php</a> script for diagnosis.</p>';
        exit;
    }
}

// Force login for testing if not already logged in
if (!is_user_logged_in()) {
    $user = get_user_by('login', 'admin');
    if ($user) {
        wp_set_current_user($user->ID);
        wp_set_auth_cookie($user->ID);
    }
}

// Set up headers
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Standardization Testing Tool</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        h1, h2, h3 {
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .card {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .success {
            color: green;
            font-weight: bold;
        }
        .error {
            color: red;
            font-weight: bold;
        }
        .response {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: monospace;
            white-space: pre;
        }
        .controls {
            margin: 20px 0;
        }
        button {
            background: #0073aa;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background: #005177;
        }
        .test-status {
            margin-left: 10px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        /* Tab styles */
        .tabs {
            display: flex;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        .tab {
            padding: 10px 20px;
            background: #f1f1f1;
            border: 1px solid #ddd;
            border-bottom: none;
            margin-right: 5px;
            cursor: pointer;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }
        .tab.active {
            background: white;
            border-bottom: 1px solid white;
            margin-bottom: -1px;
            font-weight: bold;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>FitCopilot API Testing Tool</h1>
        
        <div class="tabs">
            <div class="tab active" onclick="openTab(event, 'api-standardization')">API Standardization Testing</div>
            <div class="tab" onclick="openTab(event, 'version-history')">Version History Testing</div>
        </div>
        
        <div id="api-standardization" class="tab-content active">
            <p>This tool tests the standardized API endpoints implemented in Phase 2 of the API Standardization Initiative.</p>
            
            <div class="card">
                <h2>Authentication Status</h2>
                <?php if (is_user_logged_in()): ?>
                    <p class="success">You are logged in as: <?php echo wp_get_current_user()->user_login; ?></p>
                <?php else: ?>
                    <p class="error">You are not logged in. Tests may fail due to authentication issues.</p>
                <?php endif; ?>
            </div>
            
            <div class="card">
                <h2>Test Results Summary</h2>
                
                <!-- Test Categories Legend -->
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; border-radius: 4px;">
                    <h4 style="margin-top: 0;">Test Categories Legend:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <div style="padding: 5px 10px; background-color: #ffffff; border: 1px solid #ccc; border-radius: 3px;">⚪ Core APIs (existing)</div>
                        <div style="padding: 5px 10px; background-color: #ffe6e6; border-radius: 3px;">🔴 Response Structure Validation</div>
                        <div style="padding: 5px 10px; background-color: #e6f3ff; border-radius: 3px;">🔵 Muscle Group APIs (Target Muscle)</div>
                        <div style="padding: 5px 10px; background-color: #fff0e6; border-radius: 3px;">🟠 Delete Operations</div>
                        <div style="padding: 5px 10px; background-color: #f0fff0; border-radius: 3px;">🟢 Search & Filtering</div>
                        <div style="padding: 5px 10px; background-color: #f5f0ff; border-radius: 3px;">🟣 Analytics</div>
                        <div style="padding: 5px 10px; background-color: #fff5f0; border-radius: 3px;">🟡 Settings & Configuration</div>
                        <div style="padding: 5px 10px; background-color: #f0f8ff; border-radius: 3px;">⚪ Health Check</div>
                    </div>
                </div>
                
                <table id="results-table">
                    <thead>
                        <tr>
                            <th>Endpoint</th>
                            <th>Format</th>
                            <th>Result</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>POST /generate</td>
                            <td>Direct</td>
                            <td id="generate-direct-status">Not tested</td>
                            <td><button onclick="runTest('generate-direct')">Test</button></td>
                        </tr>
                        <tr>
                            <td>POST /generate</td>
                            <td>Wrapped</td>
                            <td id="generate-wrapped-status">Not tested</td>
                            <td><button onclick="runTest('generate-wrapped')">Test</button></td>
                        </tr>
                        <tr>
                            <td>GET /workouts</td>
                            <td>-</td>
                            <td id="get-workouts-status">Not tested</td>
                            <td><button onclick="runTest('get-workouts')">Test</button></td>
                        </tr>
                        <tr>
                            <td>GET /workouts (pagination)</td>
                            <td>per_page=3, page=2</td>
                            <td id="get-workouts-pagination-status">Not tested</td>
                            <td><button onclick="runTest('get-workouts-pagination')">Test</button></td>
                        </tr>
                        <tr>
                            <td>GET /workouts/{id}</td>
                            <td>-</td>
                            <td id="get-workout-status">Not tested</td>
                            <td><button onclick="runTest('get-workout')">Test</button></td>
                        </tr>
                        <tr>
                            <td>PUT /workouts/{id}</td>
                            <td>Direct</td>
                            <td id="update-workout-direct-status">Not tested</td>
                            <td><button onclick="runTest('update-workout-direct')">Test</button></td>
                        </tr>
                        <tr>
                            <td>PUT /workouts/{id}</td>
                            <td>Wrapped</td>
                            <td id="update-workout-wrapped-status">Not tested</td>
                            <td><button onclick="runTest('update-workout-wrapped')">Test</button></td>
                        </tr>
                        <tr>
                            <td>POST /workouts/{id}/complete</td>
                            <td>Direct</td>
                            <td id="complete-workout-direct-status">Not tested</td>
                            <td><button onclick="runTest('complete-workout-direct')">Test</button></td>
                        </tr>
                        <tr>
                            <td>POST /workouts/{id}/complete</td>
                            <td>Wrapped</td>
                            <td id="complete-workout-wrapped-status">Not tested</td>
                            <td><button onclick="runTest('complete-workout-wrapped')">Test</button></td>
                        </tr>
                        <tr>
                            <td>GET /profile</td>
                            <td>-</td>
                            <td id="get-profile-status">Not tested</td>
                            <td><button onclick="runTest('get-profile')">Test</button></td>
                        </tr>
                        <tr>
                            <td>PUT /profile</td>
                            <td>Direct</td>
                            <td id="update-profile-direct-status">Not tested</td>
                            <td><button onclick="runTest('update-profile-direct')">Test</button></td>
                        </tr>
                        <tr>
                            <td>PUT /profile</td>
                            <td>Wrapped</td>
                            <td id="update-profile-wrapped-status">Not tested</td>
                            <td><button onclick="runTest('update-profile-wrapped')">Test</button></td>
                        </tr>
                        <tr>
                            <td>GET /workouts/{id}/versions</td>
                            <td>-</td>
                            <td id="get-workout-versions-status">Not tested</td>
                            <td><button onclick="runTest('get-workout-versions')">Test</button></td>
                        </tr>
                        <tr>
                            <td>GET /workouts/{id}/versions (filtered)</td>
                            <td>from_version=1&to_version=3</td>
                            <td id="get-workout-versions-filtered-status">Not tested</td>
                            <td><button onclick="runTest('get-workout-versions-filtered')">Test</button></td>
                        </tr>
                        <tr>
                            <td>GET /workouts/{id}/versions (date filtered)</td>
                            <td>Last 30 days</td>
                            <td id="get-workout-versions-date-filtered-status">Not tested</td>
                            <td><button onclick="runTest('get-workout-versions-date-filtered')">Test</button></td>
                        </tr>
                        <tr>
                            <td>GET /workouts/{id}/versions (pagination)</td>
                            <td>per_page=2&page=1</td>
                            <td id="get-workout-versions-pagination-status">Not tested</td>
                            <td><button onclick="runTest('get-workout-versions-pagination')">Test</button></td>
                        </tr>
                        <!-- Response Structure Validation -->
                        <tr style="background-color: #ffe6e6;">
                            <td>POST /generate (structure validation)</td>
                            <td>Response Format Check</td>
                            <td id="validate-generate-structure-status">Not tested</td>
                            <td><button onclick="runTest('validate-generate-structure')">Test</button></td>
                        </tr>
                        <!-- Muscle Group APIs -->
                        <tr style="background-color: #e6f3ff;">
                            <td>GET /muscle-groups</td>
                            <td>-</td>
                            <td id="get-muscle-groups-status">Not tested</td>
                            <td><button onclick="runTest('get-muscle-groups')">Test</button></td>
                        </tr>
                        <tr style="background-color: #e6f3ff;">
                            <td>GET /muscles</td>
                            <td>-</td>
                            <td id="get-muscles-status">Not tested</td>
                            <td><button onclick="runTest('get-muscles')">Test</button></td>
                        </tr>
                        <tr style="background-color: #e6f3ff;">
                            <td>GET /muscle-groups/{id}</td>
                            <td>-</td>
                            <td id="get-muscle-group-status">Not tested</td>
                            <td><button onclick="runTest('get-muscle-group')">Test</button></td>
                        </tr>
                        <tr style="background-color: #e6f3ff;">
                            <td>POST /muscle-selection</td>
                            <td>Save muscle selection</td>
                            <td id="save-muscle-selection-status">Not tested</td>
                            <td><button onclick="runTest('save-muscle-selection')">Test</button></td>
                        </tr>
                        <tr style="background-color: #e6f3ff;">
                            <td>GET /muscle-suggestions</td>
                            <td>Profile-based suggestions</td>
                            <td id="get-muscle-suggestions-status">Not tested</td>
                            <td><button onclick="runTest('get-muscle-suggestions')">Test</button></td>
                        </tr>
                        <!-- Delete Operations -->
                        <tr style="background-color: #fff0e6;">
                            <td>DELETE /workouts/{id}</td>
                            <td>-</td>
                            <td id="delete-workout-status">Not tested</td>
                            <td><button onclick="runTest('delete-workout')">Test</button></td>
                        </tr>
                        <tr style="background-color: #fff0e6;">
                            <td>DELETE /workouts/{id}/versions/{version}</td>
                            <td>-</td>
                            <td id="delete-workout-version-status">Not tested</td>
                            <td><button onclick="runTest('delete-workout-version')">Test</button></td>
                        </tr>
                        <tr style="background-color: #fff0e6;">
                            <td>DELETE /profile</td>
                            <td>Reset profile</td>
                            <td id="delete-profile-status">Not tested</td>
                            <td><button onclick="runTest('delete-profile')">Test</button></td>
                        </tr>
                        <!-- Search & Filtering -->
                        <tr style="background-color: #f0fff0;">
                            <td>GET /workouts/search</td>
                            <td>q=strength</td>
                            <td id="search-workouts-status">Not tested</td>
                            <td><button onclick="runTest('search-workouts')">Test</button></td>
                        </tr>
                        <tr style="background-color: #f0fff0;">
                            <td>GET /workouts (difficulty filter)</td>
                            <td>difficulty=intermediate</td>
                            <td id="filter-workouts-difficulty-status">Not tested</td>
                            <td><button onclick="runTest('filter-workouts-difficulty')">Test</button></td>
                        </tr>
                        <tr style="background-color: #f0fff0;">
                            <td>GET /workouts (duration filter)</td>
                            <td>duration_min=20&duration_max=40</td>
                            <td id="filter-workouts-duration-status">Not tested</td>
                            <td><button onclick="runTest('filter-workouts-duration')">Test</button></td>
                        </tr>
                        <tr style="background-color: #f0fff0;">
                            <td>GET /workouts (equipment filter)</td>
                            <td>equipment=dumbbells</td>
                            <td id="filter-workouts-equipment-status">Not tested</td>
                            <td><button onclick="runTest('filter-workouts-equipment')">Test</button></td>
                        </tr>
                        <tr style="background-color: #f0fff0;">
                            <td>GET /workouts (muscle groups filter)</td>
                            <td>muscle_groups=chest,arms</td>
                            <td id="filter-workouts-muscles-status">Not tested</td>
                            <td><button onclick="runTest('filter-workouts-muscles')">Test</button></td>
                        </tr>
                        <!-- Analytics -->
                        <tr style="background-color: #f5f0ff;">
                            <td>GET /analytics/workout-stats</td>
                            <td>-</td>
                            <td id="get-workout-stats-status">Not tested</td>
                            <td><button onclick="runTest('get-workout-stats')">Test</button></td>
                        </tr>
                        <tr style="background-color: #f5f0ff;">
                            <td>GET /analytics/progress</td>
                            <td>-</td>
                            <td id="get-progress-status">Not tested</td>
                            <td><button onclick="runTest('get-progress')">Test</button></td>
                        </tr>
                        <tr style="background-color: #f5f0ff;">
                            <td>GET /analytics/completion-rates</td>
                            <td>-</td>
                            <td id="get-completion-rates-status">Not tested</td>
                            <td><button onclick="runTest('get-completion-rates')">Test</button></td>
                        </tr>
                        <!-- Settings & Configuration -->
                        <tr style="background-color: #fff5f0;">
                            <td>GET /settings</td>
                            <td>-</td>
                            <td id="get-settings-status">Not tested</td>
                            <td><button onclick="runTest('get-settings')">Test</button></td>
                        </tr>
                        <tr style="background-color: #fff5f0;">
                            <td>PUT /settings</td>
                            <td>Update settings</td>
                            <td id="update-settings-status">Not tested</td>
                            <td><button onclick="runTest('update-settings')">Test</button></td>
                        </tr>
                        <tr style="background-color: #fff5f0;">
                            <td>GET /equipment-options</td>
                            <td>-</td>
                            <td id="get-equipment-options-status">Not tested</td>
                            <td><button onclick="runTest('get-equipment-options')">Test</button></td>
                        </tr>
                        <tr style="background-color: #fff5f0;">
                            <td>GET /difficulty-levels</td>
                            <td>-</td>
                            <td id="get-difficulty-levels-status">Not tested</td>
                            <td><button onclick="runTest('get-difficulty-levels')">Test</button></td>
                        </tr>
                        <!-- Health Check -->
                        <tr style="background-color: #f0f8ff;">
                            <td>GET /health</td>
                            <td>API health check</td>
                            <td id="get-health-status">Not tested</td>
                            <td><button onclick="runTest('get-health')">Test</button></td>
                        </tr>
                        <tr style="background-color: #f0f8ff;">
                            <td>GET /status</td>
                            <td>System status</td>
                            <td id="get-status-status">Not tested</td>
                            <td><button onclick="runTest('get-status')">Test</button></td>
                        </tr>
                        <tr style="background-color: #f0f8ff;">
                            <td>GET /version</td>
                            <td>API version info</td>
                            <td id="get-version-status">Not tested</td>
                            <td><button onclick="runTest('get-version')">Test</button></td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="controls">
                    <button onclick="runAllTests()">Run All Tests</button>
                    <button onclick="window.location.reload()">Reset</button>
                </div>
            </div>
            
            <div class="card">
                <h2>Test Results Detail</h2>
                <div id="test-results"></div>
            </div>
        </div>
        
        <!-- Version History Testing Tab -->
        <div id="version-history" class="tab-content">
            <p>This tool tests the Version History Endpoint implementation from the Versioning Initiative.</p>
            
            <div class="card">
                <h2>Version History Endpoint Test</h2>
                <div id="version-history-tests">
                    <?php 
                    if (function_exists('is_user_logged_in') && is_user_logged_in()) {
                        
                        // Test 1: Check if endpoint class exists
                        echo "<h3>Test 1: Check if VersionHistoryEndpoint class exists</h3>";
                        $class_exists = class_exists('FitCopilot\\API\\WorkoutEndpoints\\VersionHistoryEndpoint');
                        echo "<p>VersionHistoryEndpoint class exists: <span class='" . ($class_exists ? "success" : "error") . "'>" . 
                            ($class_exists ? 'Yes' : 'No') . "</span></p>";
                        
                        // Test 2: Check if endpoint is registered in controller
                        echo "<h3>Test 2: Check if endpoint is registered in WorkoutEndpointsController</h3>";
                        $has_endpoint = false;
                        if (class_exists('FitCopilot\\API\\WorkoutEndpoints\\WorkoutEndpointsController')) {
                            $controller = new FitCopilot\API\WorkoutEndpoints\WorkoutEndpointsController();
                            if (method_exists($controller, 'get_endpoints')) {
                                $endpoints = $controller->get_endpoints();
                                $has_endpoint = isset($endpoints['VersionHistoryEndpoint']);
                            }
                        }
                        echo "<p>VersionHistoryEndpoint registered in controller: <span class='" . ($has_endpoint ? "success" : "error") . "'>" . 
                            ($has_endpoint ? 'Yes' : 'No') . "</span></p>";
                        
                        // Test 3: Check REST API registration
                        echo "<h3>Test 3: Check REST API registration</h3>";
                        $has_route = false;
                        if (function_exists('rest_get_server')) {
                            $routes = rest_get_server()->get_routes();
                            foreach ($routes as $route => $handlers) {
                                if (strpos($route, 'fitcopilot/v1/workouts/(?P<id>\d+)/versions') !== false) {
                                    $has_route = true;
                                    break;
                                }
                            }
                        }
                        echo "<p>REST API route for version history exists: <span class='" . ($has_route ? "success" : "error") . "'>" . 
                            ($has_route ? 'Yes' : 'No') . "</span></p>";
                        
                        // Test 4: Test VersioningService method existence
                        echo "<h3>Test 4: Check VersioningService method</h3>";
                        $method_exists = false;
                        if (class_exists('FitCopilot\\Service\\Versioning\\VersioningService')) {
                            $versioning_service = new FitCopilot\Service\Versioning\VersioningService();
                            $method_exists = method_exists($versioning_service, 'get_workout_version_history');
                        }
                        echo "<p>get_workout_version_history method exists: <span class='" . ($method_exists ? "success" : "error") . "'>" . 
                            ($method_exists ? 'Yes' : 'No') . "</span></p>";
                        
                        // Overall result
                        echo "<h3>Overall Result</h3>";
                        $overall = $class_exists && $has_endpoint && $has_route && $method_exists;
                        echo "<p>All tests passed: <span class='" . ($overall ? "success" : "error") . "'>" . 
                            ($overall ? 'Yes' : 'No') . "</span></p>";
                    } else {
                        echo "<p class='error'>You need to be logged in to run these tests.</p>";
                    }
                    ?>
                </div>
                
                <div class="card">
                    <h3>Manual API Testing</h3>
                    <p>Test the Version History Endpoint with a specific workout:</p>
                    <div>
                        <label for="workout-id">Workout ID:</label>
                        <input type="text" id="workout-id" placeholder="Enter workout ID">
                        <button onclick="testVersionHistory()">Test Version History</button>
                    </div>
                    <div id="version-history-result" class="response" style="margin-top: 15px; display: none;"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Tab switching functionality
        function openTab(evt, tabName) {
            // Hide all tab content
            const tabContents = document.getElementsByClassName("tab-content");
            for (let i = 0; i < tabContents.length; i++) {
                tabContents[i].classList.remove("active");
            }
            
            // Remove active class from all tabs
            const tabs = document.getElementsByClassName("tab");
            for (let i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove("active");
            }
            
            // Show the selected tab content and mark tab as active
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }

        // Manual test for Version History endpoint
        function testVersionHistory() {
            const workoutId = document.getElementById('workout-id').value;
            if (!workoutId) {
                alert('Please enter a workout ID');
                return;
            }
            
            const resultElement = document.getElementById('version-history-result');
            resultElement.style.display = 'block';
            resultElement.innerHTML = 'Loading...';
            
            fetch(`${baseUrl}/workouts/${workoutId}/versions`, {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': wpRestNonce
                },
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                resultElement.innerHTML = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                resultElement.innerHTML = `Error: ${error.message}`;
            });
        }
        
        // Store workout IDs for testing
        let directWorkoutId = null;
        let wrappedWorkoutId = null;
        
        // Base URL for API
        const baseUrl = '<?php echo function_exists("rest_url") ? esc_js(rest_url("fitcopilot/v1")) : site_url("/wp-json/fitcopilot/v1"); ?>';
        console.log('API Base URL:', baseUrl);
        
        // Rest Nonce
        const wpRestNonce = '<?php echo wp_create_nonce("wp_rest"); ?>';
        console.log('WP REST Nonce:', wpRestNonce);
        
        // Run API test
        async function runTest(testName) {
            const statusElement = document.getElementById(`${testName}-status`);
            statusElement.innerHTML = '<span style="color: blue;">Running...</span>';
            
            try {
                let result = null;
                
                switch (testName) {
                    case 'generate-direct':
                        result = await testGenerateWorkoutDirect();
                        break;
                    case 'generate-wrapped':
                        result = await testGenerateWorkoutWrapped();
                        break;
                    case 'get-workouts':
                        result = await testGetWorkouts();
                        break;
                    case 'get-workouts-pagination':
                        result = await testGetWorkoutsPagination();
                        break;
                    case 'get-workout':
                        result = await testGetWorkout();
                        break;
                    case 'update-workout-direct':
                        result = await testUpdateWorkoutDirect();
                        break;
                    case 'update-workout-wrapped':
                        result = await testUpdateWorkoutWrapped();
                        break;
                    case 'complete-workout-direct':
                        result = await testCompleteWorkoutDirect();
                        break;
                    case 'complete-workout-wrapped':
                        result = await testCompleteWorkoutWrapped();
                        break;
                    case 'get-profile':
                        result = await testGetProfile();
                        break;
                    case 'update-profile-direct':
                        result = await testUpdateProfileDirect();
                        break;
                    case 'update-profile-wrapped':
                        result = await testUpdateProfileWrapped();
                        break;
                    case 'get-workout-versions':
                        result = await testGetWorkoutVersions();
                        break;
                    case 'get-workout-versions-filtered':
                        result = await testGetWorkoutVersionsFiltered();
                        break;
                    case 'get-workout-versions-date-filtered':
                        result = await testGetWorkoutVersionsDateFiltered();
                        break;
                    case 'get-workout-versions-pagination':
                        result = await testGetWorkoutVersionsPagination();
                        break;
                    // Response Structure Validation
                    case 'validate-generate-structure':
                        result = await testValidateGenerateStructure();
                        break;
                    // Muscle Group APIs
                    case 'get-muscle-groups':
                        result = await testGetMuscleGroups();
                        break;
                    case 'get-muscles':
                        result = await testGetMuscles();
                        break;
                    case 'get-muscle-group':
                        result = await testGetMuscleGroup();
                        break;
                    case 'save-muscle-selection':
                        result = await testSaveMuscleSelection();
                        break;
                    case 'get-muscle-suggestions':
                        result = await testGetMuscleSuggestions();
                        break;
                    // Delete Operations
                    case 'delete-workout':
                        result = await testDeleteWorkout();
                        break;
                    case 'delete-workout-version':
                        result = await testDeleteWorkoutVersion();
                        break;
                    case 'delete-profile':
                        result = await testDeleteProfile();
                        break;
                    // Search & Filtering
                    case 'search-workouts':
                        result = await testSearchWorkouts();
                        break;
                    case 'filter-workouts-difficulty':
                        result = await testFilterWorkoutsDifficulty();
                        break;
                    case 'filter-workouts-duration':
                        result = await testFilterWorkoutsDuration();
                        break;
                    case 'filter-workouts-equipment':
                        result = await testFilterWorkoutsEquipment();
                        break;
                    case 'filter-workouts-muscles':
                        result = await testFilterWorkoutsMuscles();
                        break;
                    // Analytics
                    case 'get-workout-stats':
                        result = await testGetWorkoutStats();
                        break;
                    case 'get-progress':
                        result = await testGetProgress();
                        break;
                    case 'get-completion-rates':
                        result = await testGetCompletionRates();
                        break;
                    // Settings & Configuration
                    case 'get-settings':
                        result = await testGetSettings();
                        break;
                    case 'update-settings':
                        result = await testUpdateSettings();
                        break;
                    case 'get-equipment-options':
                        result = await testGetEquipmentOptions();
                        break;
                    case 'get-difficulty-levels':
                        result = await testGetDifficultyLevels();
                        break;
                    // Health Check
                    case 'get-health':
                        result = await testGetHealth();
                        break;
                    case 'get-status':
                        result = await testGetStatus();
                        break;
                    case 'get-version':
                        result = await testGetVersion();
                        break;
                }
                
                if (result.success) {
                    statusElement.innerHTML = '<span class="success">Pass</span>';
                } else {
                    statusElement.innerHTML = '<span class="error">Fail</span>';
                }
                
                displayResult(testName, result);
            } catch (error) {
                statusElement.innerHTML = '<span class="error">Error</span>';
                displayResult(testName, { 
                    success: false, 
                    error: error.message, 
                    response: null 
                });
            }
        }
        
        // Run all tests in sequence
        async function runAllTests() {
            const testOrder = [
                // Core API Tests (existing)
                'generate-direct',
                'get-workouts',
                'get-workouts-pagination',
                'get-workout',
                'update-workout-direct',
                'complete-workout-direct',
                'generate-wrapped',
                'update-workout-wrapped',
                'complete-workout-wrapped',
                'get-profile',
                'update-profile-direct',
                'update-profile-wrapped',
                'get-workout-versions',
                'get-workout-versions-filtered',
                'get-workout-versions-date-filtered',
                'get-workout-versions-pagination',
                // Response Structure Validation
                'validate-generate-structure',
                // Muscle Group APIs
                'get-muscle-groups',
                'get-muscles',
                'get-muscle-group',
                'save-muscle-selection',
                'get-muscle-suggestions',
                // Delete Operations
                'delete-workout',
                'delete-workout-version',
                'delete-profile',
                // Search & Filtering
                'search-workouts',
                'filter-workouts-difficulty',
                'filter-workouts-duration',
                'filter-workouts-equipment',
                'filter-workouts-muscles',
                // Analytics
                'get-workout-stats',
                'get-progress',
                'get-completion-rates',
                // Settings & Configuration
                'get-settings',
                'update-settings',
                'get-equipment-options',
                'get-difficulty-levels',
                // Health Check
                'get-health',
                'get-status',
                'get-version'
            ];
            
            for (const test of testOrder) {
                await runTest(test);
                // Small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        // Display test result
        function displayResult(testName, result) {
            const resultsDiv = document.getElementById('test-results');
            
            const resultCard = document.createElement('div');
            resultCard.className = 'card';
            resultCard.innerHTML = `
                <h3>${testName} ${result.success ? 
                    '<span class="success">✓ Passed</span>' : 
                    '<span class="error">✗ Failed</span>'}</h3>
                ${result.error ? `<p class="error">Error: ${result.error}</p>` : ''}
                <h4>Response:</h4>
                <div class="response">${JSON.stringify(result.response, null, 2)}</div>
            `;
            
            // Add to top of results
            resultsDiv.insertBefore(resultCard, resultsDiv.firstChild);
        }
        
        // Test functions
        async function testGenerateWorkoutDirect() {
            try {
                console.log("Testing /generate endpoint (direct format)...");
                
                // First try the /generate endpoint
                console.log("Attempting /generate endpoint first...");
                let response = await fetch(`${baseUrl}/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        duration: 30,
                        difficulty: 'intermediate',
                        equipment: ['dumbbells'],
                        goals: 'strength',
                        specific_request: 'A quick strength workout for testing'
                    }),
                    credentials: 'same-origin'
                });
                
                let data = await response.json();
                console.log("Response from /generate:", data);
                
                // Try alternate paths if first attempt fails
                if (!data.success || !data.data || !data.data.post_id) {
                    console.log("/generate endpoint didn't return expected response, trying alternatives...");
                    
                    // Try each of these possible endpoints
                    const alternateEndpoints = [
                        `${baseUrl}/generate-workout`,  // Try the legacy endpoint
                        `${baseUrl}generate`,           // Try without leading slash
                        `${baseUrl.replace('/generate', '/generate')}` // Try with explicit path
                    ];
                    
                    for (const endpoint of alternateEndpoints) {
                        console.log(`Trying alternate endpoint: ${endpoint}`);
                        
                        response = await fetch(endpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-WP-Nonce': wpRestNonce
                            },
                            body: JSON.stringify({
                                duration: 30,
                                difficulty: 'intermediate',
                                equipment: ['dumbbells'],
                                goals: 'strength',
                                specific_request: 'A quick strength workout for testing'
                            }),
                            credentials: 'same-origin'
                        });
                        
                        data = await response.json();
                        console.log(`Response from ${endpoint}:`, data);
                        
                        // If this endpoint worked, break the loop
                        if (data.success && data.data && data.data.post_id) {
                            console.log(`Found working endpoint: ${endpoint}`);
                            break;
                        }
                    }
                }
                
                // Enhanced debugging
                if (data.success) {
                    console.log("Response has success: true");
                    if (data.data) {
                        console.log("Response has data object");
                        
                        // For /generate-workout, the post_id might be in data.data.post_id
                        // For modified /generate, it should be directly in data.data.post_id
                        let post_id = data.data.post_id;
                        
                        if (data.data.workout && data.data.workout.post_id) {
                            post_id = data.data.workout.post_id;
                        }
                        
                        if (post_id) {
                            console.log("post_id found:", post_id);
                            directWorkoutId = post_id;
                            return { success: true, response: data };
                        } else {
                            console.log("post_id is missing from data");
                            console.log("Data object keys:", Object.keys(data.data));
                            return { 
                                success: false, 
                                error: "Missing post_id in response",
                                response: data 
                            };
                        }
                    } else {
                        console.log("Response is missing data object");
                        return { 
                            success: false, 
                            error: "Missing data object in response",
                            response: data 
                        };
                    }
                } else {
                    console.log("Response has success: false");
                    return { success: false, response: data };
                }
            } catch (error) {
                console.error("Error in testGenerateWorkoutDirect:", error);
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testGenerateWorkoutWrapped() {
            try {
                const response = await fetch(`${baseUrl}/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        workout: {
                            duration: 30,
                            difficulty: 'advanced',
                            equipment: ['resistance bands'],
                            goals: 'mobility',
                            specific_request: 'A yoga-focused mobility routine for testing'
                        }
                    }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.post_id) {
                    wrappedWorkoutId = data.data.post_id;
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testGetWorkouts() {
            try {
                const response = await fetch(`${baseUrl}/workouts`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                // Updated validation to check for proper pagination format
                if (data.success && 
                    data.data && 
                    Array.isArray(data.data.workouts) && 
                    typeof data.data.total === 'number' && 
                    typeof data.data.totalPages === 'number' && 
                    typeof data.data.currentPage === 'number') {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testGetWorkout() {
            try {
                if (!directWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No workout ID available. Please run generate workout test first.', 
                        response: null 
                    };
                }
                
                const response = await fetch(`${baseUrl}/workouts/${directWorkoutId}`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.id) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testUpdateWorkoutDirect() {
            try {
                if (!directWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No workout ID available. Please run generate workout test first.', 
                        response: null 
                    };
                }
                
                const response = await fetch(`${baseUrl}/workouts/${directWorkoutId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        title: 'Updated Direct Workout Title',
                        difficulty: 'advanced',
                        duration: 45
                    }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testUpdateWorkoutWrapped() {
            try {
                if (!wrappedWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No wrapped workout ID available. Please run generate wrapped workout test first.', 
                        response: null 
                    };
                }
                
                const response = await fetch(`${baseUrl}/workouts/${wrappedWorkoutId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        workout: {
                            title: 'Updated Wrapped Workout Title',
                            difficulty: 'beginner',
                            duration: 20
                        }
                    }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testCompleteWorkoutDirect() {
            try {
                if (!directWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No workout ID available. Please run generate workout test first.', 
                        response: null 
                    };
                }
                
                const response = await fetch(`${baseUrl}/workouts/${directWorkoutId}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        rating: 5,
                        feedback: 'Great workout for testing',
                        duration_actual: 35
                    }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testCompleteWorkoutWrapped() {
            try {
                if (!wrappedWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No wrapped workout ID available. Please run generate wrapped workout test first.', 
                        response: null 
                    };
                }
                
                const response = await fetch(`${baseUrl}/workouts/${wrappedWorkoutId}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        completion: {
                            rating: 4,
                            feedback: 'Good workout, easy testing',
                            duration_actual: 25
                        }
                    }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testGetProfile() {
            try {
                const response = await fetch(`${baseUrl}/profile`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testUpdateProfileDirect() {
            try {
                const response = await fetch(`${baseUrl}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        fitnessLevel: 'advanced',
                        goals: ['strength', 'muscle_building'],
                        availableEquipment: ['dumbbells', 'barbell', 'bench'],
                        workoutFrequency: '5+',
                        preferredWorkoutDuration: 45,
                        firstName: 'Test',
                        lastName: 'User',
                        age: 30,
                        weight: 180,
                        weightUnit: 'lbs'
                    }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }
        
        async function testUpdateProfileWrapped() {
            try {
                const response = await fetch(`${baseUrl}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        profile: {
                            fitnessLevel: 'beginner',
                            goals: ['weight_loss', 'flexibility'],
                            availableEquipment: ['resistance_bands', 'none'],
                            workoutFrequency: '3-4',
                            preferredWorkoutDuration: 30,
                            firstName: 'Jane',
                            lastName: 'Doe',
                            age: 25,
                            weight: 140,
                            weightUnit: 'lbs',
                            limitations: ['none'],
                            preferredLocation: 'home'
                        }
                    }),
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Test the workouts endpoint with pagination parameters
        async function testGetWorkoutsPagination() {
            try {
                // Test with per_page=3 and page=2
                const response = await fetch(`${baseUrl}/workouts?per_page=3&page=2`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                // Verify pagination parameters were applied correctly
                if (data.success && 
                    data.data && 
                    Array.isArray(data.data.workouts) && 
                    data.data.currentPage === 2 && 
                    data.data.workouts.length <= 3) { // Should be 3 or fewer items
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetWorkoutVersions() {
            try {
                if (!directWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No workout ID available. Please run generate workout test first.', 
                        response: null 
                    };
                }
                
                const response = await fetch(`${baseUrl}/workouts/${directWorkoutId}/versions`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success && data.data && Array.isArray(data.data.versions)) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetWorkoutVersionsFiltered() {
            try {
                if (!directWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No workout ID available. Please run generate workout test first.', 
                        response: null 
                    };
                }
                
                const response = await fetch(`${baseUrl}/workouts/${directWorkoutId}/versions?from_version=1&to_version=3`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success && data.data && Array.isArray(data.data.versions)) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetWorkoutVersionsDateFiltered() {
            try {
                if (!directWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No workout ID available. Please run generate workout test first.', 
                        response: null 
                    };
                }
                
                // Get dates for last 30 days
                const today = new Date();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(today.getDate() - 30);
                
                // Format dates as YYYY-MM-DD
                const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
                const toDate = today.toISOString().split('T')[0];
                
                const response = await fetch(`${baseUrl}/workouts/${directWorkoutId}/versions?from_date=${fromDate}&to_date=${toDate}`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                if (data.success && data.data && Array.isArray(data.data.versions)) {
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Test the workouts endpoint with pagination parameters
        async function testGetWorkoutVersionsPagination() {
            try {
                if (!directWorkoutId) {
                    return { 
                        success: false, 
                        error: 'No workout ID available. Please run generate workout test first.', 
                        response: null 
                    };
                }
                
                // Test with per_page=2 and page=1
                const response = await fetch(`${baseUrl}/workouts/${directWorkoutId}/versions?per_page=2&page=1`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });
                
                const data = await response.json();
                
                // Verify pagination parameters were applied correctly
                if (data.success && 
                    data.data && 
                    Array.isArray(data.data.versions) && 
                    data.data.currentPage === 1 && 
                    data.data.versions.length <= 2) { // Should be 2 or fewer items
                    return { success: true, response: data };
                } else {
                    return { success: false, response: data };
                }
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Response Structure Validation
        async function testValidateGenerateStructure() {
            try {
                const result = await generateWorkout({
                    fitness_goals: ['strength'],
                    experience_level: 'intermediate',
                    workout_duration: 30
                });
                
                // Check if response is Object (not Array)
                if (Array.isArray(result.data)) {
                    return { 
                        success: false, 
                        error: `Expected Object, got Array[${result.data.length}]`, 
                        response: result 
                    };
                }
                
                // Check for expected structure
                if (!result.data.workout_data || !result.data.workout_data.sections) {
                    return { 
                        success: false, 
                        error: 'Missing workout_data.sections structure', 
                        response: result 
                    };
                }
                
                return { success: true, response: result };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Muscle Group APIs
        async function testGetMuscleGroups() {
            try {
                const response = await apiCall('GET', '/muscle-groups');
                
                // Legacy endpoint returns object format (not array)
                if (Array.isArray(response.data) || typeof response.data !== 'object' || response.data === null) {
                    return { 
                        success: false, 
                        error: 'Expected muscle groups object', 
                        response: response 
                    };
                }
                
                // Check if it has the expected muscle group keys
                const expectedGroups = ['back', 'chest', 'arms', 'shoulders', 'core', 'legs'];
                const hasValidStructure = expectedGroups.some(group => response.data[group]);
                
                if (!hasValidStructure) {
                    return { 
                        success: false, 
                        error: 'Expected muscle groups object with valid structure', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetMuscles() {
            try {
                const response = await apiCall('GET', '/muscles');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected muscles array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetMuscleGroup() {
            try {
                const response = await apiCall('GET', '/muscle-groups/chest');
                
                // API returns { group: "chest", muscles: [...] }
                if (!response.data || !response.data.group || !response.data.muscles) {
                    return { 
                        success: false, 
                        error: 'Expected muscle group data with group and muscles fields', 
                        response: response 
                    };
                }
                
                // Verify muscles is an array
                if (!Array.isArray(response.data.muscles)) {
                    return { 
                        success: false, 
                        error: 'Expected muscles to be an array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testSaveMuscleSelection() {
            try {
                const response = await apiCall('POST', '/muscle-selection', {
                    selectedGroups: ['chest', 'arms'],
                    selectedMuscles: {
                        chest: ['Upper Chest', 'Middle Chest'],
                        arms: ['Biceps', 'Triceps']
                    }
                });
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetMuscleSuggestions() {
            try {
                const response = await apiCall('GET', '/muscle-suggestions');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected suggestions array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Delete Operations
        async function testDeleteWorkout() {
            try {
                // Create a test workout first
                const createResult = await generateWorkout({
                    fitness_goals: ['strength'],
                    experience_level: 'beginner',
                    workout_duration: 15
                });
                
                if (!createResult.data || !createResult.data.id) {
                    return { 
                        success: false, 
                        error: 'Failed to create test workout for deletion', 
                        response: createResult 
                    };
                }
                
                const deleteResponse = await apiCall('DELETE', `/workouts/${createResult.data.id}`);
                
                return { success: true, response: deleteResponse };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testDeleteWorkoutVersion() {
            try {
                // Try to delete a non-existent version (graceful handling test)
                const response = await apiCall('DELETE', '/workouts/999/versions/1');
                
                return { success: true, response: response };
            } catch (error) {
                // This is expected for non-existent resources
                return { success: true, response: { message: 'Graceful handling of non-existent version: ' + error.message } };
            }
        }

        async function testDeleteProfile() {
            try {
                const response = await apiCall('DELETE', '/profile');
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Search & Filtering
        async function testSearchWorkouts() {
            try {
                const response = await apiCall('GET', '/workouts/search?q=strength');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected workouts array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testFilterWorkoutsDifficulty() {
            try {
                const response = await apiCall('GET', '/workouts?difficulty=intermediate');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected workouts array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testFilterWorkoutsDuration() {
            try {
                const response = await apiCall('GET', '/workouts?duration_min=20&duration_max=40');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected workouts array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testFilterWorkoutsEquipment() {
            try {
                const response = await apiCall('GET', '/workouts?equipment=dumbbells');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected workouts array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testFilterWorkoutsMuscles() {
            try {
                const response = await apiCall('GET', '/workouts?muscle_groups=chest,arms');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected workouts array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Analytics
        async function testGetWorkoutStats() {
            try {
                const response = await apiCall('GET', '/analytics/workout-stats');
                
                if (!response.data) {
                    return { 
                        success: false, 
                        error: 'Expected stats data', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetProgress() {
            try {
                const response = await apiCall('GET', '/analytics/progress');
                
                if (!response.data) {
                    return { 
                        success: false, 
                        error: 'Expected progress data', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetCompletionRates() {
            try {
                const response = await apiCall('GET', '/analytics/completion-rates');
                
                if (!response.data) {
                    return { 
                        success: false, 
                        error: 'Expected completion rates data', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Settings & Configuration
        async function testGetSettings() {
            try {
                const response = await apiCall('GET', '/settings');
                
                if (!response.data) {
                    return { 
                        success: false, 
                        error: 'Expected settings data', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testUpdateSettings() {
            try {
                const response = await apiCall('PUT', '/settings', {
                    theme: 'dark',
                    notifications: true
                });
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetEquipmentOptions() {
            try {
                const response = await apiCall('GET', '/equipment-options');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected equipment options array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetDifficultyLevels() {
            try {
                const response = await apiCall('GET', '/difficulty-levels');
                
                if (!Array.isArray(response.data)) {
                    return { 
                        success: false, 
                        error: 'Expected difficulty levels array', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Health Check
        async function testGetHealth() {
            try {
                const response = await apiCall('GET', '/health');
                
                if (!response.data || !response.data.status) {
                    return { 
                        success: false, 
                        error: 'Expected health status', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetStatus() {
            try {
                const response = await apiCall('GET', '/status');
                
                if (!response.data) {
                    return { 
                        success: false, 
                        error: 'Expected status data', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        async function testGetVersion() {
            try {
                const response = await apiCall('GET', '/version');
                
                if (!response.data || !response.data.version) {
                    return { 
                        success: false, 
                        error: 'Expected version data', 
                        response: response 
                    };
                }
                
                return { success: true, response: response };
            } catch (error) {
                return { success: false, error: error.message, response: null };
            }
        }

        // Generic API call helper
        async function apiCall(method, endpoint, data = null) {
            try {
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                };
                
                if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                    options.body = JSON.stringify(data);
                }
                
                const response = await fetch(`${baseUrl}${endpoint}`, options);
                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${responseData.message || 'Request failed'}`);
                }
                
                return responseData;
            } catch (error) {
                throw new Error(`API call failed: ${error.message}`);
            }
        }

        // Show test results summary
        function showTestSummary() {
            const passed = document.querySelectorAll('.success').length;
            const failed = document.querySelectorAll('.error').length;
            const total = passed + failed;
            
            document.getElementById('test-summary').innerHTML = `
                <h3>Test Summary</h3>
                <p>Total: ${total}, Passed: ${passed}, Failed: ${failed}</p>
                <p>Success Rate: ${total > 0 ? Math.round((passed / total) * 100) : 0}%</p>
            `;
        }

    </script>
</body>
</html> 