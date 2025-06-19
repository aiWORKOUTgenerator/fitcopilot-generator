/**
 * Test Profile Loading 403 Forbidden Fix
 * 
 * This script tests the resolution of the 403 Forbidden error when loading user profiles
 * in the PromptBuilder system.
 */

console.log('🧪 Testing Profile Loading 403 Forbidden Fix...');

// Test Configuration
const testConfig = {
    endpoint: '/wp-json/wp/v2/users/me', // WordPress user endpoint
    ajaxAction: 'fitcopilot_prompt_builder_load_profile',
    testUserIds: [1, 0], // Test with user ID 1 and current user (0)
    expectedFields: [
        'basic_info', 'goals', 'equipment', 'location', 
        'session_params', 'limitations', 'exercise_preferences'
    ]
};

// Test Results Storage
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

/**
 * Test Profile Loading with Different User IDs
 */
async function testProfileLoading() {
    console.log('\n📋 Testing Profile Loading with User ID Parameters...');
    
    for (const userId of testConfig.testUserIds) {
        testResults.total++;
        
        try {
            const result = await performAjaxTest(userId);
            
            if (result.success) {
                testResults.passed++;
                console.log(`✅ Profile loading test PASSED for user ID: ${userId}`);
                testResults.details.push(`User ID ${userId}: SUCCESS`);
            } else {
                testResults.failed++;
                console.log(`❌ Profile loading test FAILED for user ID: ${userId}`);
                console.log(`   Error: ${result.error}`);
                testResults.details.push(`User ID ${userId}: FAILED - ${result.error}`);
            }
            
        } catch (error) {
            testResults.failed++;
            console.log(`❌ Profile loading test ERROR for user ID: ${userId}`);
            console.log(`   Exception: ${error.message}`);
            testResults.details.push(`User ID ${userId}: ERROR - ${error.message}`);
        }
    }
}

/**
 * Perform AJAX Test for Profile Loading
 */
async function performAjaxTest(userId) {
    return new Promise((resolve) => {
        // Create FormData for AJAX request
        const formData = new FormData();
        formData.append('action', testConfig.ajaxAction);
        formData.append('nonce', fitcopilotData?.nonce || '');
        
        if (userId > 0) {
            formData.append('user_id', userId);
        }
        
        // Perform AJAX request
        jQuery.ajax({
            url: ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log(`📡 AJAX Response for user ${userId}:`, response);
                
                if (response.success) {
                    // Validate response structure
                    const validation = validateProfileResponse(response.data);
                    resolve({
                        success: validation.valid,
                        error: validation.valid ? null : validation.error,
                        data: response.data
                    });
                } else {
                    resolve({
                        success: false,
                        error: response.data?.message || 'Unknown error',
                        data: response.data
                    });
                }
            },
            error: function(xhr, status, error) {
                console.log(`❌ AJAX Error for user ${userId}:`, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText
                });
                
                resolve({
                    success: false,
                    error: `HTTP ${xhr.status}: ${xhr.statusText}`,
                    data: null
                });
            }
        });
    });
}

/**
 * Validate Profile Response Structure
 */
function validateProfileResponse(data) {
    if (!data || typeof data !== 'object') {
        return {
            valid: false,
            error: 'Invalid response data structure'
        };
    }
    
    // Check for required profile_data structure
    if (!data.profile_data) {
        return {
            valid: false,
            error: 'Missing profile_data in response'
        };
    }
    
    // Check for expected fields
    const missingFields = testConfig.expectedFields.filter(field => 
        !data.profile_data.hasOwnProperty(field)
    );
    
    if (missingFields.length > 0) {
        return {
            valid: false,
            error: `Missing profile fields: ${missingFields.join(', ')}`
        };
    }
    
    return {
        valid: true,
        error: null
    };
}

/**
 * Test Permission Scenarios
 */
async function testPermissionScenarios() {
    console.log('\n🔒 Testing Permission Scenarios...');
    
    // Test 1: Authenticated user loading own profile
    testResults.total++;
    try {
        const ownProfileResult = await performAjaxTest(0); // Current user
        
        if (ownProfileResult.success) {
            testResults.passed++;
            console.log('✅ Own profile loading: PASSED');
            testResults.details.push('Own profile loading: SUCCESS');
        } else {
            testResults.failed++;
            console.log('❌ Own profile loading: FAILED');
            console.log(`   Error: ${ownProfileResult.error}`);
            testResults.details.push(`Own profile loading: FAILED - ${ownProfileResult.error}`);
        }
    } catch (error) {
        testResults.failed++;
        console.log('❌ Own profile loading: ERROR');
        console.log(`   Exception: ${error.message}`);
        testResults.details.push(`Own profile loading: ERROR - ${error.message}`);
    }
}

/**
 * Test AJAX Handler Registration
 */
function testAjaxHandlerRegistration() {
    console.log('\n⚙️ Testing AJAX Handler Registration...');
    
    testResults.total++;
    
    // Check if WordPress AJAX is available
    if (typeof ajaxurl === 'undefined') {
        testResults.failed++;
        console.log('❌ WordPress AJAX URL not available');
        testResults.details.push('AJAX URL: FAILED - ajaxurl not defined');
        return;
    }
    
    // Check if nonce is available
    if (!fitcopilotData?.nonce) {
        console.log('⚠️ Warning: No nonce available for AJAX requests');
    }
    
    testResults.passed++;
    console.log('✅ AJAX handler registration environment: PASSED');
    testResults.details.push('AJAX Environment: SUCCESS');
}

/**
 * Display Test Summary
 */
function displayTestSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    
    console.log('\n📋 Detailed Results:');
    testResults.details.forEach((detail, index) => {
        console.log(`${index + 1}. ${detail}`);
    });
    
    if (testResults.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Profile loading 403 issue is resolved.');
    } else {
        console.log('\n⚠️ Some tests failed. Please review the implementation.');
    }
}

/**
 * Main Test Execution
 */
async function runProfileLoadingTests() {
    console.log('🔧 Starting Profile Loading 403 Forbidden Fix Tests...');
    console.log(`Test Environment: ${window.location.origin}`);
    console.log(`Current User ID: ${fitcopilotData?.currentUserId || 'Unknown'}`);
    console.log(`AJAX URL: ${ajaxurl || 'Not available'}`);
    
    try {
        // Test AJAX environment
        testAjaxHandlerRegistration();
        
        // Test permission scenarios
        await testPermissionScenarios();
        
        // Test profile loading with different user IDs
        await testProfileLoading();
        
        // Display results
        displayTestSummary();
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// Execute tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runProfileLoadingTests);
} else {
    runProfileLoadingTests();
}

// Also provide manual execution function
window.testProfileLoading403Fix = runProfileLoadingTests;

console.log('✅ Profile Loading 403 Fix Test Suite loaded.');
console.log('💡 Run manually: testProfileLoading403Fix()'); 