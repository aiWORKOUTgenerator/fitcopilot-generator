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
                'get-workout-versions-pagination'
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
                        workoutGoals: ['strength', 'cardio'],
                        equipmentAvailable: 'full-gym',
                        workoutFrequency: 4,
                        workoutDuration: 45,
                        preferences: {
                            darkMode: true,
                            metrics: 'imperial'
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
                            workoutGoals: ['weight-loss', 'flexibility'],
                            equipmentAvailable: 'minimal',
                            workoutFrequency: 3,
                            workoutDuration: 30,
                            preferences: {
                                darkMode: false,
                                metrics: 'metric'
                            }
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
    </script>
</body>
</html> 