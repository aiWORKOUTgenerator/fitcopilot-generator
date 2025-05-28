<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Profile Data Structure Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .data-structure { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .field-group { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .field-group h4 { margin-top: 0; color: #333; }
        .field { margin: 5px 0; padding: 5px; background: #f8f9fa; border-radius: 3px; }
        .field-name { font-weight: bold; color: #0066cc; }
        .field-value { color: #333; }
        .field-source { font-size: 0.8em; color: #666; font-style: italic; }
    </style>
</head>
<body>
    <h1>🔍 Enhanced Profile Data Structure Test</h1>
    <p>This test validates the enhanced profile data structure with WordPress user integration and fallback hierarchy.</p>

    <div class="test-section info">
        <h3>📋 Test Objectives</h3>
        <ul>
            <li><strong>Data Structure Validation:</strong> Verify all new WordPress fields are present</li>
            <li><strong>Fallback Hierarchy:</strong> Test profile meta → WordPress user data → empty fallbacks</li>
            <li><strong>Avatar Integration:</strong> Validate avatar URL generation and handling</li>
            <li><strong>Type Safety:</strong> Ensure frontend receives properly structured data</li>
            <li><strong>Backward Compatibility:</strong> Verify existing functionality remains intact</li>
        </ul>
    </div>

    <div class="test-section">
        <h3>🔧 Current WordPress User Context</h3>
        <div class="data-structure">
            <div class="field-group">
                <h4>WordPress User Table</h4>
                <div class="field">
                    <span class="field-name">ID:</span>
                    <span class="field-value"><?php echo get_current_user_id(); ?></span>
                </div>
                <div class="field">
                    <span class="field-name">user_login:</span>
                    <span class="field-value"><?php echo wp_get_current_user()->user_login; ?></span>
                </div>
                <div class="field">
                    <span class="field-name">user_email:</span>
                    <span class="field-value"><?php echo wp_get_current_user()->user_email; ?></span>
                </div>
                <div class="field">
                    <span class="field-name">display_name:</span>
                    <span class="field-value"><?php echo wp_get_current_user()->display_name; ?></span>
                </div>
            </div>
            <div class="field-group">
                <h4>WordPress User Meta</h4>
                <div class="field">
                    <span class="field-name">first_name:</span>
                    <span class="field-value"><?php echo wp_get_current_user()->first_name ?: '<em>Empty</em>'; ?></span>
                </div>
                <div class="field">
                    <span class="field-name">last_name:</span>
                    <span class="field-value"><?php echo wp_get_current_user()->last_name ?: '<em>Empty</em>'; ?></span>
                </div>
                <div class="field">
                    <span class="field-name">avatar_url:</span>
                    <span class="field-value"><?php echo get_avatar_url(get_current_user_id(), ['size' => 32]); ?></span>
                </div>
            </div>
        </div>
    </div>

    <div class="test-section">
        <h3>🧪 Profile Data Structure Tests</h3>
        <button onclick="testEnhancedDataStructure()">Test Enhanced Data Structure</button>
        <button onclick="testFallbackHierarchy()">Test Fallback Hierarchy</button>
        <button onclick="testAvatarIntegration()">Test Avatar Integration</button>
        <button onclick="testBackwardCompatibility()">Test Backward Compatibility</button>
        <button onclick="runAllTests()">Run All Tests</button>
        
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

        async function testEnhancedDataStructure() {
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
                    const profile = data.data;
                    
                    // Check for required WordPress integration fields
                    const requiredFields = ['username', 'displayName', 'avatarUrl'];
                    const missingFields = requiredFields.filter(field => !(field in profile));
                    
                    // Check data structure organization
                    const hasUserIdentity = profile.username !== undefined && 
                                           profile.displayName !== undefined && 
                                           profile.avatarUrl !== undefined;
                    
                    const hasFitnessData = profile.fitnessLevel !== undefined && 
                                          profile.goals !== undefined;
                    
                    const hasMetaData = profile.lastUpdated !== undefined && 
                                       profile.profileComplete !== undefined;
                    
                    const structureValid = hasUserIdentity && hasFitnessData && hasMetaData;
                    
                    logResult(
                        'Enhanced Data Structure Validation',
                        structureValid && missingFields.length === 0,
                        {
                            structureAnalysis: {
                                hasUserIdentity,
                                hasFitnessData,
                                hasMetaData,
                                missingFields: missingFields.length > 0 ? missingFields : 'None'
                            },
                            userIdentityFields: {
                                username: profile.username,
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                email: profile.email,
                                displayName: profile.displayName,
                                avatarUrl: profile.avatarUrl ? 'Present' : 'Missing'
                            },
                            dataStructureValid: structureValid
                        },
                        missingFields.length > 0 ? `Missing fields: ${missingFields.join(', ')}` : null
                    );
                } else {
                    logResult('Enhanced Data Structure Validation', false, data, data.message);
                }
            } catch (error) {
                logResult('Enhanced Data Structure Validation', false, null, error.message);
            }
        }

        async function testFallbackHierarchy() {
            try {
                // First, clear profile meta to test fallbacks
                await fetch(`${baseUrl}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        firstName: '',
                        lastName: '',
                        email: ''
                    }),
                    credentials: 'same-origin'
                });

                // Wait a moment then fetch to test fallbacks
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
                        
                        // Analyze fallback sources
                        const fallbackAnalysis = {
                            firstName: {
                                value: profile.firstName,
                                source: profile.firstName ? 'WordPress user meta' : 'Empty (expected)'
                            },
                            lastName: {
                                value: profile.lastName,
                                source: profile.lastName ? 'WordPress user meta' : 'Empty (expected)'
                            },
                            email: {
                                value: profile.email,
                                source: profile.email ? 'WordPress user email' : 'Empty (unexpected)'
                            },
                            username: {
                                value: profile.username,
                                source: 'WordPress user_login (always present)'
                            },
                            displayName: {
                                value: profile.displayName,
                                source: 'WordPress display_name (always present)'
                            },
                            avatarUrl: {
                                value: profile.avatarUrl ? 'Generated' : 'Missing',
                                source: 'get_avatar_url() function'
                            }
                        };
                        
                        // Fallback hierarchy should work
                        const fallbacksWorking = profile.username && profile.displayName && profile.avatarUrl;
                        
                        logResult(
                            'Fallback Hierarchy Test',
                            fallbacksWorking,
                            {
                                message: 'Testing WordPress fallback hierarchy after clearing profile meta',
                                fallbackAnalysis,
                                hierarchyWorking: fallbacksWorking
                            },
                            fallbacksWorking ? null : 'Fallback hierarchy not working properly'
                        );
                    } else {
                        logResult('Fallback Hierarchy Test', false, data, data.message);
                    }
                }, 1000);
                
            } catch (error) {
                logResult('Fallback Hierarchy Test', false, null, error.message);
            }
        }

        async function testAvatarIntegration() {
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
                    const profile = data.data;
                    
                    // Test avatar URL structure and accessibility
                    const avatarUrl = profile.avatarUrl;
                    const hasAvatarUrl = Boolean(avatarUrl);
                    
                    let avatarAccessible = false;
                    if (avatarUrl) {
                        try {
                            // Test if avatar URL is accessible (basic validation)
                            const isValidUrl = avatarUrl.startsWith('http') && avatarUrl.includes('gravatar');
                            avatarAccessible = isValidUrl;
                        } catch (e) {
                            avatarAccessible = false;
                        }
                    }
                    
                    logResult(
                        'Avatar Integration Test',
                        hasAvatarUrl,
                        {
                            avatarUrl: avatarUrl || 'Not generated',
                            hasAvatarUrl,
                            avatarAccessible,
                            avatarAnalysis: {
                                isGravatar: avatarUrl ? avatarUrl.includes('gravatar') : false,
                                hasSize: avatarUrl ? avatarUrl.includes('s=80') : false,
                                hasDefault: avatarUrl ? avatarUrl.includes('d=identicon') : false
                            }
                        },
                        hasAvatarUrl ? null : 'Avatar URL not generated'
                    );
                } else {
                    logResult('Avatar Integration Test', false, data, data.message);
                }
            } catch (error) {
                logResult('Avatar Integration Test', false, null, error.message);
            }
        }

        async function testBackwardCompatibility() {
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
                    const profile = data.data;
                    
                    // Check that all existing fields are still present
                    const existingFields = [
                        'id', 'firstName', 'lastName', 'email', 'fitnessLevel', 'goals',
                        'weight', 'height', 'age', 'availableEquipment', 'preferredLocation',
                        'limitations', 'workoutFrequency', 'preferredWorkoutDuration',
                        'lastUpdated', 'profileComplete', 'completedWorkouts'
                    ];
                    
                    const missingExistingFields = existingFields.filter(field => !(field in profile));
                    const backwardCompatible = missingExistingFields.length === 0;
                    
                    // Check API response structure
                    const hasStandardStructure = data.success !== undefined && data.data !== undefined;
                    
                    logResult(
                        'Backward Compatibility Test',
                        backwardCompatible && hasStandardStructure,
                        {
                            backwardCompatible,
                            hasStandardStructure,
                            missingExistingFields: missingExistingFields.length > 0 ? missingExistingFields : 'None',
                            apiStructure: {
                                hasSuccess: 'success' in data,
                                hasData: 'data' in data,
                                hasMessage: 'message' in data
                            },
                            existingFieldsCount: existingFields.length - missingExistingFields.length,
                            totalFieldsCount: Object.keys(profile).length
                        },
                        backwardCompatible ? null : `Missing existing fields: ${missingExistingFields.join(', ')}`
                    );
                } else {
                    logResult('Backward Compatibility Test', false, data, data.message);
                }
            } catch (error) {
                logResult('Backward Compatibility Test', false, null, error.message);
            }
        }

        async function runAllTests() {
            logResult('Test Suite Started', true, { message: 'Running all enhanced profile data structure tests...' });
            
            await testEnhancedDataStructure();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testAvatarIntegration();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testBackwardCompatibility();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testFallbackHierarchy();
            
            logResult('Test Suite Completed', true, { message: 'All tests completed. Review results above.' });
        }

        // Auto-run enhanced data structure test on load
        document.addEventListener('DOMContentLoaded', function() {
            testEnhancedDataStructure();
        });
    </script>
</body>
</html> 