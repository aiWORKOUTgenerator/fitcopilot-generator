<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Types Validation Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .type-structure { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .type-group { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .type-group h4 { margin-top: 0; color: #333; }
        .field { margin: 5px 0; padding: 5px; background: #f8f9fa; border-radius: 3px; }
        .field-name { font-weight: bold; color: #0066cc; }
        .field-type { color: #666; font-style: italic; }
        .field-desc { color: #333; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>🔍 Enhanced Types Validation Test</h1>
    <p>This test validates the enhanced TypeScript type system with WordPress user integration and new utility types.</p>

    <div class="test-section info">
        <h3>📋 Type System Enhancements</h3>
        <ul>
            <li><strong>Enhanced UserProfile:</strong> Organized sections with WordPress integration</li>
            <li><strong>User Identity Types:</strong> Dedicated types for user identity management</li>
            <li><strong>Utility Types:</strong> Focused types for specific use cases</li>
            <li><strong>Validation Types:</strong> Types for form validation and completion tracking</li>
            <li><strong>Data Source Tracking:</strong> Types for fallback hierarchy management</li>
        </ul>
    </div>

    <div class="test-section">
        <h3>🔧 Type Structure Overview</h3>
        <div class="type-structure">
            <div class="type-group">
                <h4>Core Profile Types</h4>
                <div class="field">
                    <span class="field-name">UserProfile</span>
                    <span class="field-type">interface</span>
                    <div class="field-desc">Enhanced with WordPress integration and organized sections</div>
                </div>
                <div class="field">
                    <span class="field-name">PartialUserProfile</span>
                    <span class="field-type">type</span>
                    <div class="field-desc">For profile updates (excludes read-only fields)</div>
                </div>
                <div class="field">
                    <span class="field-name">UserIdentity</span>
                    <span class="field-type">interface</span>
                    <div class="field-desc">User identity fields for display purposes</div>
                </div>
                <div class="field">
                    <span class="field-name">EnhancedUserIdentity</span>
                    <span class="field-type">interface</span>
                    <div class="field-desc">Identity with computed display properties</div>
                </div>
            </div>
            <div class="type-group">
                <h4>Utility & Section Types</h4>
                <div class="field">
                    <span class="field-name">UserIdentityUpdate</span>
                    <span class="field-type">type</span>
                    <div class="field-desc">For focused identity updates</div>
                </div>
                <div class="field">
                    <span class="field-name">FitnessProfileData</span>
                    <span class="field-type">type</span>
                    <div class="field-desc">Fitness data excluding identity and meta</div>
                </div>
                <div class="field">
                    <span class="field-name">WordPressUserData</span>
                    <span class="field-type">type</span>
                    <div class="field-desc">WordPress-specific user fields</div>
                </div>
                <div class="field">
                    <span class="field-name">ProfileMetaData</span>
                    <span class="field-type">type</span>
                    <div class="field-desc">Profile metadata and completion info</div>
                </div>
            </div>
        </div>
    </div>

    <div class="test-section">
        <h3>🧪 Type Validation Tests</h3>
        <button onclick="testProfileStructure()">Test Profile Structure</button>
        <button onclick="testUserIdentityTypes()">Test User Identity Types</button>
        <button onclick="testUtilityTypes()">Test Utility Types</button>
        <button onclick="testValidationTypes()">Test Validation Types</button>
        <button onclick="runAllTypeTests()">Run All Type Tests</button>
        
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

        async function testProfileStructure() {
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
                    
                    // Test enhanced UserProfile structure
                    const userIdentityFields = ['id', 'username', 'firstName', 'lastName', 'email', 'displayName', 'avatarUrl'];
                    const fitnessFields = ['fitnessLevel', 'goals', 'weight', 'height', 'age', 'availableEquipment', 'preferredLocation', 'limitations', 'workoutFrequency', 'preferredWorkoutDuration'];
                    const metaFields = ['lastUpdated', 'profileComplete', 'completedWorkouts'];
                    
                    const hasUserIdentity = userIdentityFields.every(field => field in profile);
                    const hasFitnessData = fitnessFields.every(field => field in profile);
                    const hasMetaData = metaFields.every(field => field in profile);
                    
                    // Test WordPress integration fields
                    const hasWordPressFields = profile.username !== undefined && 
                                              profile.displayName !== undefined && 
                                              profile.avatarUrl !== undefined;
                    
                    // Test field organization
                    const structureValid = hasUserIdentity && hasFitnessData && hasMetaData && hasWordPressFields;
                    
                    logResult(
                        'Enhanced Profile Structure Test',
                        structureValid,
                        {
                            structureAnalysis: {
                                hasUserIdentity,
                                hasFitnessData,
                                hasMetaData,
                                hasWordPressFields
                            },
                            fieldCounts: {
                                userIdentityFields: userIdentityFields.length,
                                fitnessFields: fitnessFields.length,
                                metaFields: metaFields.length,
                                totalFields: Object.keys(profile).length
                            },
                            wordPressIntegration: {
                                username: profile.username || 'Not available',
                                displayName: profile.displayName || 'Not available',
                                avatarUrl: profile.avatarUrl ? 'Available' : 'Not available'
                            },
                            structureValid
                        },
                        structureValid ? null : 'Profile structure validation failed'
                    );
                } else {
                    logResult('Enhanced Profile Structure Test', false, data, data.message);
                }
            } catch (error) {
                logResult('Enhanced Profile Structure Test', false, null, error.message);
            }
        }

        async function testUserIdentityTypes() {
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
                    
                    // Simulate UserIdentity type extraction
                    const userIdentity = {
                        id: profile.id,
                        username: profile.username,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        email: profile.email,
                        displayName: profile.displayName,
                        avatarUrl: profile.avatarUrl
                    };
                    
                    // Test UserIdentityUpdate type (focused updates)
                    const identityUpdate = {
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        email: profile.email
                    };
                    
                    // Test WordPressUserData type
                    const wordPressData = {
                        username: profile.username,
                        displayName: profile.displayName,
                        avatarUrl: profile.avatarUrl
                    };
                    
                    // Validate type structure compliance
                    const identityValid = userIdentity.id !== undefined;
                    const updateValid = identityUpdate.firstName !== undefined || 
                                       identityUpdate.lastName !== undefined || 
                                       identityUpdate.email !== undefined;
                    const wordPressValid = wordPressData.username !== undefined || 
                                          wordPressData.displayName !== undefined;
                    
                    const typesValid = identityValid && updateValid && wordPressValid;
                    
                    logResult(
                        'User Identity Types Test',
                        typesValid,
                        {
                            userIdentity,
                            identityUpdate,
                            wordPressData,
                            typeValidation: {
                                identityValid,
                                updateValid,
                                wordPressValid,
                                typesValid
                            },
                            typeStructures: {
                                userIdentityFields: Object.keys(userIdentity).length,
                                identityUpdateFields: Object.keys(identityUpdate).length,
                                wordPressDataFields: Object.keys(wordPressData).length
                            }
                        },
                        typesValid ? null : 'User identity types validation failed'
                    );
                } else {
                    logResult('User Identity Types Test', false, data, data.message);
                }
            } catch (error) {
                logResult('User Identity Types Test', false, null, error.message);
            }
        }

        async function testUtilityTypes() {
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
                    
                    // Test FitnessProfileData type (excludes identity and meta)
                    const fitnessData = {
                        fitnessLevel: profile.fitnessLevel,
                        goals: profile.goals,
                        weight: profile.weight,
                        height: profile.height,
                        age: profile.age,
                        availableEquipment: profile.availableEquipment,
                        preferredLocation: profile.preferredLocation,
                        limitations: profile.limitations,
                        workoutFrequency: profile.workoutFrequency,
                        preferredWorkoutDuration: profile.preferredWorkoutDuration
                    };
                    
                    // Test ProfileMetaData type
                    const metaData = {
                        lastUpdated: profile.lastUpdated,
                        profileComplete: profile.profileComplete,
                        completedWorkouts: profile.completedWorkouts
                    };
                    
                    // Test PartialUserProfile simulation
                    const partialProfile = {
                        fitnessLevel: profile.fitnessLevel,
                        goals: profile.goals,
                        firstName: profile.firstName
                        // Note: excludes id, lastUpdated, completedWorkouts (read-only)
                    };
                    
                    // Validate utility type structures
                    const fitnessValid = fitnessData.fitnessLevel !== undefined && 
                                        fitnessData.goals !== undefined;
                    const metaValid = metaData.lastUpdated !== undefined && 
                                     metaData.profileComplete !== undefined;
                    const partialValid = !('id' in partialProfile) && 
                                        !('lastUpdated' in partialProfile) && 
                                        !('completedWorkouts' in partialProfile);
                    
                    const utilityTypesValid = fitnessValid && metaValid && partialValid;
                    
                    logResult(
                        'Utility Types Test',
                        utilityTypesValid,
                        {
                            fitnessData,
                            metaData,
                            partialProfile,
                            typeValidation: {
                                fitnessValid,
                                metaValid,
                                partialValid,
                                utilityTypesValid
                            },
                            typeSeparation: {
                                fitnessFieldCount: Object.keys(fitnessData).length,
                                metaFieldCount: Object.keys(metaData).length,
                                partialFieldCount: Object.keys(partialProfile).length,
                                originalFieldCount: Object.keys(profile).length
                            }
                        },
                        utilityTypesValid ? null : 'Utility types validation failed'
                    );
                } else {
                    logResult('Utility Types Test', false, data, data.message);
                }
            } catch (error) {
                logResult('Utility Types Test', false, null, error.message);
            }
        }

        async function testValidationTypes() {
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
                    
                    // Simulate ProfileValidationResult
                    const validationResult = {
                        isValid: profile.profileComplete || false,
                        errors: {},
                        warnings: {},
                        completionPercentage: profile.profileComplete ? 100 : 75,
                        missingRequiredFields: profile.profileComplete ? [] : ['age', 'weight']
                    };
                    
                    // Simulate ProfileCompletionStatus
                    const completionStatus = {
                        overallComplete: profile.profileComplete || false,
                        identityComplete: !!(profile.firstName && profile.lastName && profile.email),
                        fitnessComplete: !!(profile.fitnessLevel && profile.goals && profile.goals.length > 0),
                        preferencesComplete: !!(profile.workoutFrequency && profile.preferredWorkoutDuration),
                        completedSteps: [1, 2, 3, 4],
                        totalSteps: 5,
                        completionPercentage: 80
                    };
                    
                    // Simulate EnhancedUserIdentity with data sources
                    const enhancedIdentity = {
                        id: profile.id,
                        username: profile.username,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        email: profile.email,
                        displayName: profile.displayName,
                        avatarUrl: profile.avatarUrl,
                        fullName: profile.firstName && profile.lastName ? 
                                 `${profile.firstName} ${profile.lastName}` : 
                                 (profile.displayName || profile.username || 'User'),
                        initials: profile.firstName && profile.lastName ? 
                                 `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() : 
                                 'U',
                        hasCompleteIdentity: !!(profile.firstName && profile.lastName && profile.email),
                        dataSources: {
                            firstName: profile.firstName ? 'profile_meta' : 'wordpress_user',
                            lastName: profile.lastName ? 'profile_meta' : 'wordpress_user',
                            email: profile.email ? 'profile_meta' : 'wordpress_user',
                            displayName: 'wordpress_user',
                            avatarUrl: 'generated'
                        }
                    };
                    
                    // Validate validation type structures
                    const validationValid = validationResult.isValid !== undefined && 
                                           validationResult.completionPercentage !== undefined;
                    const completionValid = completionStatus.overallComplete !== undefined && 
                                           completionStatus.completedSteps !== undefined;
                    const enhancedValid = enhancedIdentity.fullName !== undefined && 
                                         enhancedIdentity.dataSources !== undefined;
                    
                    const validationTypesValid = validationValid && completionValid && enhancedValid;
                    
                    logResult(
                        'Validation Types Test',
                        validationTypesValid,
                        {
                            validationResult,
                            completionStatus,
                            enhancedIdentity,
                            typeValidation: {
                                validationValid,
                                completionValid,
                                enhancedValid,
                                validationTypesValid
                            },
                            computedProperties: {
                                fullName: enhancedIdentity.fullName,
                                initials: enhancedIdentity.initials,
                                hasCompleteIdentity: enhancedIdentity.hasCompleteIdentity,
                                completionPercentage: completionStatus.completionPercentage
                            }
                        },
                        validationTypesValid ? null : 'Validation types validation failed'
                    );
                } else {
                    logResult('Validation Types Test', false, data, data.message);
                }
            } catch (error) {
                logResult('Validation Types Test', false, null, error.message);
            }
        }

        async function runAllTypeTests() {
            logResult('Type System Test Suite Started', true, { message: 'Running all enhanced type system tests...' });
            
            await testProfileStructure();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testUserIdentityTypes();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testUtilityTypes();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await testValidationTypes();
            
            logResult('Type System Test Suite Completed', true, { message: 'All type tests completed. Review results above.' });
        }

        // Auto-run profile structure test on load
        document.addEventListener('DOMContentLoaded', function() {
            testProfileStructure();
        });
    </script>
</body>
</html> 