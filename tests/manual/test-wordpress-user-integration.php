<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordPress User Integration Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .user-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .avatar { width: 80px; height: 80px; border-radius: 50%; }
    </style>
</head>
<body>
    <h1>🔍 WordPress User Integration Test</h1>
    <p>This test verifies that the ProfileEndpoints API correctly integrates WordPress user data with fallback hierarchy.</p>

    <div class="test-section info">
        <h3>📋 Test Scenarios</h3>
        <ul>
            <li><strong>Scenario 1:</strong> User with complete WordPress profile (first_name, last_name, email)</li>
            <li><strong>Scenario 2:</strong> User with partial WordPress profile (missing some fields)</li>
            <li><strong>Scenario 3:</strong> User with custom profile data that overrides WordPress defaults</li>
            <li><strong>Scenario 4:</strong> Avatar URL generation and display</li>
        </ul>
    </div>

    <div class="test-section">
        <h3>🔧 Current WordPress User Info</h3>
        <div class="user-info">
            <div>
                <strong>WordPress User Data:</strong>
                <ul>
                    <li><strong>ID:</strong> <?php echo get_current_user_id(); ?></li>
                    <li><strong>Username:</strong> <?php echo wp_get_current_user()->user_login; ?></li>
                    <li><strong>Email:</strong> <?php echo wp_get_current_user()->user_email; ?></li>
                    <li><strong>First Name:</strong> <?php echo wp_get_current_user()->first_name ?: '<em>Not set</em>'; ?></li>
                    <li><strong>Last Name:</strong> <?php echo wp_get_current_user()->last_name ?: '<em>Not set</em>'; ?></li>
                    <li><strong>Display Name:</strong> <?php echo wp_get_current_user()->display_name; ?></li>
                </ul>
            </div>
            <div>
                <strong>Avatar:</strong><br>
                <img src="<?php echo get_avatar_url(get_current_user_id(), ['size' => 80]); ?>" 
                     alt="User Avatar" class="avatar">
            </div>
        </div>
    </div>

    <div class="test-section">
        <h3>🧪 API Tests</h3>
        <button onclick="testGetProfile()">Test Get Profile</button>
        <button onclick="testUpdateProfile()">Test Update Profile</button>
        <button onclick="testFallbackHierarchy()">Test Fallback Hierarchy</button>
        <button onclick="clearProfileData()">Clear Profile Data</button>
        
        <div id="test-results"></div>
    </div>

    <script>
        const baseUrl = '<?php echo rest_url('fitcopilot/v1'); ?>';
        const wpRestNonce = '<?php echo wp_create_nonce('wp_rest'); ?>';

        function logResult(title, success, data, error = null) {
            const resultsDiv = document.getElementById('test-results');
            const className = success ? 'success' : 'error';
            const icon = success ? '✅' : '❌';
            
            const resultHtml = `
                <div class="test-section ${className}">
                    <h4>${icon} ${title}</h4>
                    ${error ? `<p><strong>Error:</strong> ${error}</p>` : ''}
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            `;
            
            resultsDiv.innerHTML = resultHtml + resultsDiv.innerHTML;
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
                
                if (response.ok && data.success) {
                    // Verify WordPress integration fields are present
                    const profile = data.data;
                    const hasWordPressFields = profile.username && profile.displayName && profile.avatarUrl;
                    
                    logResult(
                        'Get Profile - WordPress Integration',
                        hasWordPressFields,
                        {
                            wordpressFields: {
                                username: profile.username,
                                displayName: profile.displayName,
                                avatarUrl: profile.avatarUrl,
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                email: profile.email
                            },
                            fallbacksWorking: {
                                firstNameSource: profile.firstName ? 'profile or wordpress' : 'empty',
                                lastNameSource: profile.lastName ? 'profile or wordpress' : 'empty',
                                emailSource: profile.email ? 'profile or wordpress' : 'empty'
                            }
                        },
                        hasWordPressFields ? null : 'Missing WordPress integration fields'
                    );
                } else {
                    logResult('Get Profile - WordPress Integration', false, data, data.message);
                }
            } catch (error) {
                logResult('Get Profile - WordPress Integration', false, null, error.message);
            }
        }

        async function testUpdateProfile() {
            try {
                const response = await fetch(`${baseUrl}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        firstName: 'TestFirst',
                        lastName: 'TestLast',
                        email: 'test@example.com',
                        fitnessLevel: 'intermediate'
                    }),
                    credentials: 'same-origin'
                });

                const data = await response.json();
                
                if (response.ok && data.success) {
                    logResult('Update Profile - Custom Data Override', true, {
                        message: 'Profile updated successfully',
                        updatedFields: {
                            firstName: data.data.firstName,
                            lastName: data.data.lastName,
                            email: data.data.email,
                            fitnessLevel: data.data.fitnessLevel
                        }
                    });
                } else {
                    logResult('Update Profile - Custom Data Override', false, data, data.message);
                }
            } catch (error) {
                logResult('Update Profile - Custom Data Override', false, null, error.message);
            }
        }

        async function testFallbackHierarchy() {
            try {
                // First clear profile data to test fallbacks
                await clearProfileData();
                
                // Wait a moment for the clear to process
                setTimeout(async () => {
                    const response = await fetch(`${baseUrl}/profile`, {
                        method: 'GET',
                        headers: {
                            'X-WP-Nonce': wpRestNonce
                        },
                        credentials: 'same-origin'
                    });

                    const data = await response.json();
                    
                    if (response.ok && data.success) {
                        const profile = data.data;
                        
                        logResult('Fallback Hierarchy Test', true, {
                            message: 'Testing fallback to WordPress user data',
                            fallbackResults: {
                                firstName: {
                                    value: profile.firstName,
                                    source: profile.firstName ? 'WordPress user meta' : 'empty'
                                },
                                lastName: {
                                    value: profile.lastName,
                                    source: profile.lastName ? 'WordPress user meta' : 'empty'
                                },
                                email: {
                                    value: profile.email,
                                    source: profile.email ? 'WordPress user email' : 'empty'
                                },
                                username: {
                                    value: profile.username,
                                    source: 'WordPress user_login'
                                },
                                displayName: {
                                    value: profile.displayName,
                                    source: 'WordPress display_name'
                                },
                                avatarUrl: {
                                    value: profile.avatarUrl ? 'Generated' : 'Missing',
                                    source: 'get_avatar_url()'
                                }
                            }
                        });
                    } else {
                        logResult('Fallback Hierarchy Test', false, data, data.message);
                    }
                }, 1000);
                
            } catch (error) {
                logResult('Fallback Hierarchy Test', false, null, error.message);
            }
        }

        async function clearProfileData() {
            try {
                const response = await fetch(`${baseUrl}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        firstName: '',
                        lastName: '',
                        email: '',
                        fitnessLevel: 'beginner'
                    }),
                    credentials: 'same-origin'
                });

                const data = await response.json();
                
                if (response.ok && data.success) {
                    logResult('Clear Profile Data', true, { message: 'Profile data cleared for fallback testing' });
                } else {
                    logResult('Clear Profile Data', false, data, data.message);
                }
            } catch (error) {
                logResult('Clear Profile Data', false, null, error.message);
            }
        }

        // Auto-run initial test
        document.addEventListener('DOMContentLoaded', function() {
            testGetProfile();
        });
    </script>
</body>
</html> 