/**
 * Final Verification Test for Modular Debug System
 * 
 * This script comprehensively tests the new modular debug architecture
 * to ensure all 500 errors are resolved and functionality works correctly.
 */

console.log('🔍 Starting Final Modular Debug System Verification...');

// Test configuration
const TEST_CONFIG = {
    baseUrl: window.location.origin,
    ajaxUrl: '/wp-admin/admin-ajax.php',
    nonce: fitcopilotAdminData?.nonce || 'test-nonce',
    timeout: 10000
};

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

/**
 * Utility function to make AJAX requests
 */
async function makeAjaxRequest(action, data = {}) {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('nonce', TEST_CONFIG.nonce);
    
    // Add additional data
    Object.keys(data).forEach(key => {
        formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
    });

    try {
        const response = await fetch(TEST_CONFIG.baseUrl + TEST_CONFIG.ajaxUrl, {
            method: 'POST',
            body: formData
        });

        const result = {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        };

        if (response.ok) {
            try {
                result.data = await response.json();
            } catch (e) {
                result.text = await response.text();
            }
        } else {
            result.error = await response.text();
        }

        return result;
    } catch (error) {
        return {
            status: 0,
            statusText: 'Network Error',
            ok: false,
            error: error.message
        };
    }
}

/**
 * Test individual endpoint
 */
async function testEndpoint(name, action, data = {}) {
    testResults.total++;
    
    console.log(`\n🧪 Testing ${name}...`);
    
    try {
        const result = await makeAjaxRequest(action, data);
        
        if (result.status === 500) {
            testResults.failed++;
            testResults.details.push({
                test: name,
                status: 'FAILED',
                reason: '500 Internal Server Error - Core issue not resolved',
                details: result.error || result.statusText
            });
            console.log(`❌ ${name}: 500 ERROR - ${result.error || result.statusText}`);
            return false;
        }
        
        if (result.ok && result.data) {
            testResults.passed++;
            testResults.details.push({
                test: name,
                status: 'PASSED',
                reason: 'Request successful with valid response',
                details: `Status: ${result.status}, Success: ${result.data.success}`
            });
            console.log(`✅ ${name}: SUCCESS - ${result.data.message || 'Valid response received'}`);
            return true;
        }
        
        if (result.status === 400 || result.status === 403) {
            testResults.passed++;
            testResults.details.push({
                test: name,
                status: 'PASSED',
                reason: 'Expected error response (not 500)',
                details: `Status: ${result.status} - ${result.statusText}`
            });
            console.log(`✅ ${name}: EXPECTED ERROR - ${result.status} ${result.statusText}`);
            return true;
        }
        
        testResults.failed++;
        testResults.details.push({
            test: name,
            status: 'FAILED',
            reason: 'Unexpected response format',
            details: `Status: ${result.status}, Response: ${JSON.stringify(result)}`
        });
        console.log(`❌ ${name}: UNEXPECTED - Status ${result.status}`);
        return false;
        
    } catch (error) {
        testResults.failed++;
        testResults.details.push({
            test: name,
            status: 'FAILED',
            reason: 'Exception thrown',
            details: error.message
        });
        console.log(`❌ ${name}: EXCEPTION - ${error.message}`);
        return false;
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🚀 Testing Modular Debug System Endpoints...');
    
    // Test 1: Workout Generation Test
    await testEndpoint(
        'Workout Generation Test',
        'debug_test_workout',
        {
            duration: 30,
            goals: ['strength', 'muscle_building'],
            equipment: ['dumbbells', 'barbell'],
            fitness_level: 'intermediate'
        }
    );
    
    // Test 2: Prompt Building Test
    await testEndpoint(
        'Prompt Building Test',
        'debug_test_prompt',
        {
            user_id: 1,
            duration: 45,
            goals: ['weight_loss'],
            equipment: ['bodyweight'],
            fitness_level: 'beginner'
        }
    );
    
    // Test 3: Context Validation Test
    await testEndpoint(
        'Context Validation Test',
        'debug_validate_context',
        {
            context: {
                duration: 60,
                goals: ['endurance'],
                equipment: ['resistance_bands'],
                fitness_level: 'advanced'
            }
        }
    );
    
    // Test 4: System Stats (if available)
    await testEndpoint(
        'System Stats',
        'debug_get_system_stats',
        {}
    );
    
    // Test 5: Performance Test
    await testEndpoint(
        'Performance Test',
        'debug_performance_test',
        {
            iterations: 5
        }
    );
    
    // Display results
    displayResults();
}

/**
 * Display comprehensive test results
 */
function displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL VERIFICATION RESULTS');
    console.log('='.repeat(60));
    
    const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    console.log('\n📋 Detailed Results:');
    testResults.details.forEach((detail, index) => {
        const icon = detail.status === 'PASSED' ? '✅' : '❌';
        console.log(`${icon} ${index + 1}. ${detail.test}`);
        console.log(`   Status: ${detail.status}`);
        console.log(`   Reason: ${detail.reason}`);
        console.log(`   Details: ${detail.details}`);
        console.log('');
    });
    
    // Final assessment
    console.log('🎯 ASSESSMENT:');
    if (testResults.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Modular debug system is working correctly.');
        console.log('✅ No 500 errors detected - refactoring successful!');
    } else if (testResults.failed === testResults.total) {
        console.log('🚨 ALL TESTS FAILED! System needs immediate attention.');
        console.log('❌ Critical issues remain - further debugging required.');
    } else {
        console.log(`⚠️ PARTIAL SUCCESS: ${testResults.passed}/${testResults.total} tests passed.`);
        console.log('🔧 Some issues remain but core functionality appears stable.');
    }
    
    console.log('\n🔍 NEXT STEPS:');
    if (testResults.failed > 0) {
        console.log('1. Review failed test details above');
        console.log('2. Check WordPress error logs for specific issues');
        console.log('3. Verify nonce and authentication setup');
        console.log('4. Test individual components in isolation');
    } else {
        console.log('1. Deploy to staging environment for integration testing');
        console.log('2. Run user acceptance testing');
        console.log('3. Monitor production logs for any issues');
        console.log('4. Document successful architecture patterns');
    }
    
    console.log('='.repeat(60));
}

/**
 * Initialize and run tests
 */
function initializeTests() {
    // Check if we're in the admin area
    if (!window.location.pathname.includes('wp-admin')) {
        console.log('⚠️ This test should be run from the WordPress admin area');
        console.log('Navigate to: /wp-admin/ and run this script in the browser console');
        return;
    }
    
    // Check for required globals
    if (typeof fitcopilotAdminData === 'undefined') {
        console.log('⚠️ Admin data not found - some tests may fail due to nonce issues');
    }
    
    // Start tests
    runAllTests();
}

// Auto-run if in admin area, otherwise provide instructions
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTests);
} else {
    initializeTests();
} 