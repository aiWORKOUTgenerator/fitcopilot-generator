/**
 * Test AJAX Handler Conflict Fix
 * 
 * This script tests whether the ProfileModule conflict has been resolved
 * and the PromptBuilderController handler is now being used correctly.
 */

console.log('🔧 Testing AJAX Handler Conflict Fix...');

// Test Configuration
const testConfig = {
    ajaxAction: 'fitcopilot_prompt_builder_load_profile',
    testUserId: 1,
    expectedHandlerSource: 'PromptBuilderController'
};

/**
 * Test if the correct handler is being called
 */
async function testHandlerResolution() {
    console.log('\n📋 Testing Handler Resolution...');
    
    if (typeof jQuery === 'undefined' || typeof ajaxurl === 'undefined') {
        console.log('❌ WordPress AJAX environment not available');
        return false;
    }
    
    try {
        const response = await performAjaxTest();
        
        if (response.success) {
            console.log('✅ AJAX request successful');
            console.log('📦 Response data structure:', Object.keys(response.data));
            
            // Check response structure to determine which handler responded
            if (response.data.data && response.data.data.profile_data) {
                console.log('✅ PromptBuilderController handler is responding');
                console.log('📋 Profile data available');
                return true;
            } else if (response.data.profile_data) {
                console.log('⚠️ ProfileModule handler is still responding');
                console.log('📋 Profile data available but wrong structure');
                return false;
            } else {
                console.log('❓ Unknown handler responding');
                return false;
            }
            
        } else {
            console.log('❌ AJAX request failed');
            console.log('📋 Error:', response.error || response.message);
            
            if (response.error && response.error.includes('403')) {
                console.log('🚨 403 Error still occurring - handler conflict not resolved');
            }
            
            return false;
        }
        
    } catch (error) {
        console.log('❌ Test failed with exception:', error.message);
        return false;
    }
}

/**
 * Perform AJAX test
 */
async function performAjaxTest() {
    return new Promise((resolve) => {
        const formData = new FormData();
        formData.append('action', testConfig.ajaxAction);
        formData.append('nonce', fitcopilotData?.nonce || fitcopilotPromptBuilder?.nonce || '');
        formData.append('user_id', testConfig.testUserId);
        
        console.log('📡 Sending AJAX request...');
        console.log('   Action:', testConfig.ajaxAction);
        console.log('   Nonce:', fitcopilotData?.nonce || fitcopilotPromptBuilder?.nonce || 'NOT FOUND');
        console.log('   User ID:', testConfig.testUserId);
        
        jQuery.ajax({
            url: ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log('📥 AJAX Success Response:', response);
                resolve({
                    success: true,
                    data: response.data || response,
                    message: response.data?.message || 'Success'
                });
            },
            error: function(xhr, status, error) {
                console.log('📥 AJAX Error Response:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                
                resolve({
                    success: false,
                    error: `HTTP ${xhr.status}: ${xhr.statusText || error}`,
                    details: xhr.responseText
                });
            }
        });
    });
}

/**
 * Test Permission Scenarios
 */
async function testPermissions() {
    console.log('\n🔒 Testing Permission Scenarios...');
    
    // Test authenticated user access
    const currentUserId = fitcopilotData?.currentUserId || 0;
    console.log(`👤 Current User ID: ${currentUserId}`);
    console.log(`🔑 User Logged In: ${fitcopilotData?.isLoggedIn || 'unknown'}`);
    
    if (currentUserId > 0) {
        console.log('✅ User appears to be logged in');
        return true;
    } else {
        console.log('❌ User does not appear to be logged in');
        return false;
    }
}

/**
 * Main Test Execution
 */
async function runHandlerConflictTests() {
    console.log('🔧 Starting AJAX Handler Conflict Fix Tests...');
    console.log(`🌐 Test Environment: ${window.location.origin}`);
    console.log(`📡 AJAX URL: ${ajaxurl || 'Not available'}`);
    
    let totalTests = 0;
    let passedTests = 0;
    
    try {
        // Test 1: Permission check
        totalTests++;
        if (await testPermissions()) {
            passedTests++;
            console.log('✅ Permission test: PASSED');
        } else {
            console.log('❌ Permission test: FAILED');
        }
        
        // Test 2: Handler resolution
        totalTests++;
        if (await testHandlerResolution()) {
            passedTests++;
            console.log('✅ Handler resolution test: PASSED');
        } else {
            console.log('❌ Handler resolution test: FAILED');
        }
        
        // Summary
        console.log('\n📊 TEST SUMMARY');
        console.log('================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${totalTests - passedTests}`);
        console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! Handler conflict is resolved.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the implementation.');
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// Execute tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runHandlerConflictTests);
} else {
    runHandlerConflictTests();
}

// Also provide manual execution function
window.testHandlerConflictFix = runHandlerConflictTests;

console.log('✅ AJAX Handler Conflict Fix Test Suite loaded.');
console.log('💡 Run manually: testHandlerConflictFix()'); 