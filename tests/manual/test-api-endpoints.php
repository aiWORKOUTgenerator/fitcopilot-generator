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
    </style>
</head>
<body>
    <div class="container">
        <h1>API Standardization Testing Tool</h1>
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
    
    <script>
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
                'get-workout',
                'update-workout-direct',
                'complete-workout-direct',
                'generate-wrapped',
                'update-workout-wrapped',
                'complete-workout-wrapped'
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
                        `${baseUrl.replace('/generate', '/generate')}`, // Try with explicit path
                        `${baseUrl}/emergency-generate` // Try our emergency endpoint
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
                
                if (data.success && Array.isArray(data.data)) {
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
    </script>
</body>
</html> 