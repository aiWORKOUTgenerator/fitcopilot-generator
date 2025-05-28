<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced API Types Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .api-structure { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .api-group { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .api-group h4 { margin-top: 0; color: #333; }
        .field { margin: 5px 0; padding: 5px; background: #f8f9fa; border-radius: 3px; }
        .field-name { font-weight: bold; color: #0066cc; }
        .field-type { color: #666; font-style: italic; }
        .field-desc { color: #333; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>🔍 Enhanced API Types Test</h1>
    <p>This test validates the enhanced API response types with WordPress user integration and metadata support.</p>

    <div class="test-section info">
        <h3>📋 API Type Enhancements</h3>
        <ul>
            <li><strong>Enhanced Response Types:</strong> GetProfileResponse and UpdateProfileResponse with metadata</li>
            <li><strong>WordPress Integration:</strong> Support for WordPress user data and fallback hierarchy</li>
            <li><strong>Type Safety:</strong> Proper TypeScript types for all API interactions</li>
            <li><strong>Error Handling:</strong> Enhanced error responses with context information</li>
            <li><strong>Request Options:</strong> Configurable API request options for enhanced functionality</li>
        </ul>
    </div>

    <div class="test-section">
        <h3>🔧 API Response Structure Overview</h3>
        <div class="api-structure">
            <div class="api-group">
                <h4>Enhanced Profile Response</h4>
                <div class="field">
                    <span class="field-name">success</span>
                    <span class="field-type">boolean</span>
                    <div class="field-desc">API call success status</div>
                </div>
                <div class="field">
                    <span class="field-name">data</span>
                    <span class="field-type">UserProfile</span>
                    <div class="field-desc">Complete user profile with WordPress integration</div>
                </div>
                <div class="field">
                    <span class="field-name">meta</span>
                    <span class="field-type">object</span>
                    <div class="field-desc">WordPress integration metadata</div>
                </div>
                <div class="field">
                    <span class="field-name">message</span>
                    <span class="field-type">string</span>
                    <div class="field-desc">Optional response message</div>
                </div>
            </div>
            <div class="api-group">
                <h4>WordPress Integration Metadata</h4>
                <div class="field">
                    <span class="field-name">hasWordPressData</span>
                    <span class="field-type">boolean</span>
                    <div class="field-desc">Whether WordPress user data is available</div>
                </div>
                <div class="field">
                    <span class="field-name">dataSources</span>
                    <span class="field-type">Record&lt;string, UserDataSource&gt;</span>
                    <div class="field-desc">Data source tracking for each field</div>
                </div>
                <div class="field">
                    <span class="field-name">avatarGenerated</span>
                    <span class="field-type">boolean</span>
                    <div class="field-desc">Whether avatar URL was generated</div>
                </div>
            </div>
        </div>
    </div>

    <div class="test-section">
        <h3>🧪 API Type Validation Tests</h3>
        <button onclick="testEnhancedGetProfile()">Test Enhanced Get Profile</button>
        <button onclick="testEnhancedUpdateProfile()">Test Enhanced Update Profile</button>
        <button onclick="testApiResponseStructure()">Test API Response Structure</button>
        <button onclick="testWordPressIntegration()">Test WordPress Integration</button>
        <button onclick="runAllApiTests()">Run All API Tests</button>
        
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

        async function testEnhancedGetProfile() {
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
                    // Validate enhanced response structure
                    const hasRequiredFields = data.success !== undefined && 
                                             data.data !== undefined;
                    
                    const hasEnhancedFields = data.data.username !== undefined && 
                                             data.data.displayName !== undefined && 
                                             data.data.avatarUrl !== undefined;
                    
                    // Check for metadata (optional but expected in enhanced version)
                    const hasMetadata = data.meta !== undefined;
                    
                    const responseValid = hasRequiredFields && hasEnhancedFields;
                    
                    logResult(
                        'Enhanced Get Profile API Test',
                        responseValid,
                        {
                            responseStructure: {
                                hasRequiredFields,
                                hasEnhancedFields,
                                hasMetadata
                            },
                            enhancedFields: {
                                username: data.data.username || 'Not available',
                                displayName: data.data.displayName || 'Not available',
                                avatarUrl: data.data.avatarUrl ? 'Available' : 'Not available'
                            },
                            metadata: data.meta || 'No metadata provided',
                            profileData: {
                                totalFields: Object.keys(data.data).length,
                                identityFields: ['username', 'displayName', 'avatarUrl'].filter(field => 
                                    data.data[field] !== undefined).length,
                                fitnessFields: ['fitnessLevel', 'goals', 'workoutFrequency'].filter(field => 
                                    data.data[field] !== undefined).length
                            }
                        },
                        responseValid ? null : 'Enhanced API response structure validation failed'
                    );
                } else {
                    logResult('Enhanced Get Profile API Test', false, data, data.message);
                }
            } catch (error) {
                logResult('Enhanced Get Profile API Test', false, null, error.message);
            }
        }

        async function testEnhancedUpdateProfile() {
            try {
                // Test update with enhanced request structure
                const updateData = {
                    firstName: 'Test',
                    lastName: 'User',
                    fitnessLevel: 'intermediate'
                };

                const response = await fetch(`${baseUrl}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpRestNonce
                    },
                    body: JSON.stringify({
                        profile: updateData
                    }),
                    credentials: 'same-origin'
                });

                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Validate enhanced update response
                    const hasRequiredFields = data.success !== undefined && 
                                             data.data !== undefined;
                    
                    const hasUpdatedFields = data.data.firstName === updateData.firstName && 
                                            data.data.lastName === updateData.lastName && 
                                            data.data.fitnessLevel === updateData.fitnessLevel;
                    
                    const hasEnhancedFields = data.data.username !== undefined && 
                                             data.data.displayName !== undefined;
                    
                    // Check for update metadata (optional)
                    const hasUpdateMetadata = data.meta !== undefined;
                    
                    const updateValid = hasRequiredFields && hasUpdatedFields && hasEnhancedFields;
                    
                    logResult(
                        'Enhanced Update Profile API Test',
                        updateValid,
                        {
                            updateValidation: {
                                hasRequiredFields,
                                hasUpdatedFields,
                                hasEnhancedFields,
                                hasUpdateMetadata
                            },
                            updatedFields: {
                                firstName: data.data.firstName,
                                lastName: data.data.lastName,
                                fitnessLevel: data.data.fitnessLevel
                            },
                            enhancedFields: {
                                username: data.data.username || 'Not available',
                                displayName: data.data.displayName || 'Not available',
                                avatarUrl: data.data.avatarUrl ? 'Available' : 'Not available'
                            },
                            updateMetadata: data.meta || 'No update metadata provided'
                        },
                        updateValid ? null : 'Enhanced update API response validation failed'
                    );
                } else {
                    logResult('Enhanced Update Profile API Test', false, data, data.message);
                }
            } catch (error) {
                logResult('Enhanced Update Profile API Test', false, null, error.message);
            }
        }

        async function testApiResponseStructure() {
            try {
                const response = await fetch(`${baseUrl}/profile`, {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': wpRestNonce
                    },
                    credentials: 'same-origin'
                });

                const data = await response.json();
                
                if (response.ok) {
                    // Test API response structure compliance
                    const structureTests = {
                        hasSuccessField: 'success' in data,
                        hasDataField: 'data' in data,
                        hasOptionalMessage: true, // message is optional
                        hasOptionalMeta: true,    // meta is optional
                        successIsBoolean: typeof data.success === 'boolean',
                        dataIsObject: typeof data.data === 'object' && data.data !== null
                    };
                    
                    // Test UserProfile structure within data
                    const profileStructure = {
                        hasId: 'id' in data.data,
                        hasRequiredFitnessFields: ['fitnessLevel', 'goals', 'workoutFrequency'].every(field => 
                            field in data.data),
                        hasEnhancedUserFields: ['username', 'displayName', 'avatarUrl'].every(field => 
                            field in data.data),
                        hasMetaFields: ['lastUpdated', 'profileComplete', 'completedWorkouts'].every(field => 
                            field in data.data)
                    };
                    
                    const allStructureValid = Object.values(structureTests).every(test => test) && 
                                             Object.values(profileStructure).every(test => test);
                    
                    logResult(
                        'API Response Structure Test',
                        allStructureValid,
                        {
                            responseStructure: structureTests,
                            profileStructure: profileStructure,
                            responseFields: Object.keys(data),
                            profileFields: Object.keys(data.data),
                            structureCompliant: allStructureValid
                        },
                        allStructureValid ? null : 'API response structure does not match expected types'
                    );
                } else {
                    logResult('API Response Structure Test', false, data, 'API request failed');
                }
            } catch (error) {
                logResult('API Response Structure Test', false, null, error.message);
            }
        }

        async function testWordPressIntegration() {
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
                    // Test WordPress integration fields
                    const wordPressFields = {
                        username: data.data.username,
                        displayName: data.data.displayName,
                        avatarUrl: data.data.avatarUrl
                    };
                    
                    const hasWordPressData = Object.values(wordPressFields).some(value => 
                        value !== undefined && value !== null && value !== '');
                    
                    // Test metadata if available
                    let metadataAnalysis = {};
                    if (data.meta) {
                        metadataAnalysis = {
                            hasWordPressData: data.meta.hasWordPressData,
                            dataSources: data.meta.dataSources,
                            avatarGenerated: data.meta.avatarGenerated
                        };
                    }
                    
                    // Test fallback hierarchy indicators
                    const fallbackAnalysis = {
                        hasFirstName: !!data.data.firstName,
                        hasLastName: !!data.data.lastName,
                        hasEmail: !!data.data.email,
                        hasUsername: !!data.data.username,
                        hasDisplayName: !!data.data.displayName,
                        canGenerateDisplayName: !!(data.data.firstName && data.data.lastName) || 
                                               !!data.data.displayName || 
                                               !!data.data.username
                    };
                    
                    logResult(
                        'WordPress Integration Test',
                        hasWordPressData,
                        {
                            wordPressFields,
                            hasWordPressData,
                            metadataAnalysis,
                            fallbackAnalysis,
                            integrationWorking: hasWordPressData && fallbackAnalysis.canGenerateDisplayName
                        },
                        hasWordPressData ? null : 'WordPress integration not working - no WordPress data found'
                    );
                } else {
                    logResult('WordPress Integration Test', false, data, data.message);
                }
            } catch (error) {
                logResult('WordPress Integration Test', false, null, error.message);
            }
        }

        async function runAllApiTests() {
            logResult('API Types Test Suite Started', true, { message: 'Running all enhanced API types tests...' });
            
            await testEnhancedGetProfile();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testEnhancedUpdateProfile();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testApiResponseStructure();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testWordPressIntegration();
            
            logResult('API Types Test Suite Completed', true, { message: 'All API tests completed. Review results above.' });
        }

        // Auto-run enhanced get profile test on load
        document.addEventListener('DOMContentLoaded', function() {
            testEnhancedGetProfile();
        });
    </script>
</body>
</html> 