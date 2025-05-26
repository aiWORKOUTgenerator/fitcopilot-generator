<?php
/**
 * Profile API Debug Script
 * 
 * This script helps debug profile data storage and retrieval issues.
 * Access at: http://fitcopilot-generator.local/wp-content/plugins/Fitcopilot-Generator/debug-profile.php
 */

// Bootstrap WordPress
if (!defined('ABSPATH')) {
    $wp_root = '/Users/justinfassio/Local Sites/fitcopilot-generator/app/public/';
    if (file_exists($wp_root . 'wp-load.php')) {
        require_once $wp_root . 'wp-load.php';
    } else {
        die('WordPress not found');
    }
}

// Force login as admin for testing
if (!is_user_logged_in()) {
    $user = get_user_by('login', 'admin');
    if ($user) {
        wp_set_current_user($user->ID);
        wp_set_auth_cookie($user->ID);
    }
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Profile API Debug</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
        .success { color: green; }
        .error { color: red; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
        button { padding: 10px 15px; margin: 5px; }
    </style>
</head>
<body>
    <h1>Profile API Debug Tool</h1>
    
    <div class="section">
        <h2>Current User Info</h2>
        <?php
        $current_user = wp_get_current_user();
        echo "<p>User ID: {$current_user->ID}</p>";
        echo "<p>Username: {$current_user->user_login}</p>";
        echo "<p>Email: {$current_user->user_email}</p>";
        ?>
    </div>
    
    <div class="section">
        <h2>Raw User Meta Data</h2>
        <?php
        $user_id = get_current_user_id();
        $all_meta = get_user_meta($user_id);
        
        echo "<h3>All Profile-Related Meta:</h3>";
        foreach ($all_meta as $key => $value) {
            if (strpos($key, 'profile') !== false || strpos($key, 'fitness') !== false || strpos($key, 'workout') !== false) {
                echo "<p><strong>{$key}:</strong> " . print_r($value, true) . "</p>";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>Test Profile API Endpoints</h2>
        
        <button onclick="testGetProfile()">Test GET Profile</button>
        <button onclick="testUpdateProfile()">Test UPDATE Profile</button>
        <button onclick="clearProfileData()">Clear Profile Data</button>
        
        <div id="api-results"></div>
    </div>
    
    <script>
        async function testGetProfile() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<h3>Testing GET Profile...</h3>';
            
            try {
                const response = await fetch('/wp-json/fitcopilot/v1/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
                    }
                });
                
                const data = await response.json();
                resultsDiv.innerHTML += `
                    <h4>GET Response (Status: ${response.status}):</h4>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                resultsDiv.innerHTML += `<p class="error">Error: ${error.message}</p>`;
            }
        }
        
        async function testUpdateProfile() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<h3>Testing UPDATE Profile...</h3>';
            
            const testData = {
                fitnessLevel: 'intermediate',
                workoutGoals: ['strength', 'endurance'],
                workoutFrequency: 4,
                workoutDuration: 45,
                equipmentAvailable: 'dumbbells'
            };
            
            try {
                const response = await fetch('/wp-json/fitcopilot/v1/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': '<?php echo wp_create_nonce('wp_rest'); ?>'
                    },
                    body: JSON.stringify(testData)
                });
                
                const data = await response.json();
                resultsDiv.innerHTML += `
                    <h4>UPDATE Response (Status: ${response.status}):</h4>
                    <pre>Sent: ${JSON.stringify(testData, null, 2)}</pre>
                    <pre>Received: ${JSON.stringify(data, null, 2)}</pre>
                `;
                
                // Test GET again to see if data persisted
                setTimeout(testGetProfile, 1000);
            } catch (error) {
                resultsDiv.innerHTML += `<p class="error">Error: ${error.message}</p>`;
            }
        }
        
        async function clearProfileData() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<h3>Clearing Profile Data...</h3>';
            
            // This will be implemented by calling the backend to clear user meta
            const response = await fetch(window.location.href + '?action=clear_profile', {
                method: 'POST'
            });
            
            if (response.ok) {
                resultsDiv.innerHTML += '<p class="success">Profile data cleared. Refresh page to see changes.</p>';
                setTimeout(() => window.location.reload(), 2000);
            }
        }
    </script>
    
    <?php
    // Handle clear profile action
    if (isset($_GET['action']) && $_GET['action'] === 'clear_profile') {
        $user_id = get_current_user_id();
        
        // Delete all profile-related meta
        $meta_keys = [
            '_profile_fitness_level',
            '_profile_workout_goals', 
            '_profile_equipment',
            '_profile_frequency',
            '_profile_duration',
            '_profile_preferences',
            '_profile_medical_conditions',
            '_profile_created_at',
            '_profile_updated_at'
        ];
        
        foreach ($meta_keys as $key) {
            delete_user_meta($user_id, $key);
        }
        
        echo '<div class="section"><p class="success">Profile data cleared successfully!</p></div>';
        exit;
    }
    ?>
    
</body>
</html> 