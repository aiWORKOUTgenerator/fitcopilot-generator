/**
 * MuscleTargeting Module Integration Test Script
 * 
 * Tests complete Sprint 2 implementation:
 * 1. Module instantiation and capabilities
 * 2. REST API endpoints functionality
 * 3. Data persistence and retrieval
 * 4. AI-powered muscle suggestions
 * 5. End-to-end workflow testing
 * 
 * Run this in browser console on WordPress admin page
 */

console.log('🎯 Starting MuscleTargeting Module Integration Tests...');

// Test configuration
const TEST_CONFIG = {
    apiBase: '/wp-json/fitcopilot/v1',
    nonce: document.querySelector('meta[name="wp-rest-nonce"]')?.content || 
           document.querySelector('#_wpnonce')?.value ||
           'test-nonce-123',
    userId: 1, // Test user ID
    testTimeout: 10000 // 10 seconds timeout
};

// Test data for muscle selection
const TEST_MUSCLE_SELECTION = {
    selectedGroups: ['back', 'chest', 'legs'],
    selectedMuscles: {
        'back': ['Lats', 'Rhomboids', 'Middle Traps'],
        'chest': ['Upper Chest', 'Middle Chest'],
        'legs': ['Quadriceps', 'Hamstrings', 'Glutes']
    },
    preferences: {
        intensity: 'moderate',
        focus: 'strength'
    }
};

// Test profile data for AI suggestions
const TEST_PROFILE_DATA = {
    goals: ['strength', 'muscle_building'],
    fitness_level: 'intermediate',
    available_equipment: ['dumbbells', 'barbell', 'pull_up_bar'],
    limitations: ['left knee pain']
};

// Test results storage
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = TEST_CONFIG.apiBase + endpoint;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': TEST_CONFIG.nonce
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    console.log(`📡 API Request: ${method} ${url}`);
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        console.log(`📡 API Response: ${response.status}`, result);
        
        return {
            success: response.ok,
            status: response.status,
            data: result
        };
    } catch (error) {
        console.error(`❌ API Request failed: ${error.message}`);
        return {
            success: false,
            status: 0,
            error: error.message
        };
    }
}

/**
 * Test framework functions
 */
function logTest(name, passed, message = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}${message ? ' - ' + message : ''}`);
    
    testResults.tests.push({ name, passed, message });
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
}

function expect(actual, expected, testName) {
    const passed = actual === expected;
    logTest(testName, passed, `Expected: ${expected}, Got: ${actual}`);
    return passed;
}

function expectTruthy(value, testName) {
    const passed = !!value;
    logTest(testName, passed, `Value: ${value}`);
    return passed;
}

function expectProperty(object, property, testName) {
    const passed = object && object.hasOwnProperty(property);
    logTest(testName, passed, `Property '${property}' ${passed ? 'exists' : 'missing'}`);
    return passed;
}

/**
 * Test Suite 1: REST API Endpoints
 */
async function testRESTAPIEndpoints() {
    console.log('\n🔗 Testing REST API Endpoints...');
    
    // Test 1: Get muscle groups
    const muscleGroupsResponse = await apiRequest('/muscle-groups');
    expectTruthy(muscleGroupsResponse.success, 'Muscle groups endpoint accessible');
    if (muscleGroupsResponse.success) {
        expectProperty(muscleGroupsResponse.data, 'data', 'Muscle groups data structure');
        expect(typeof muscleGroupsResponse.data.data, 'object', 'Muscle groups data type');
    }
    
    // Test 2: Get specific muscle group details
    const backGroupResponse = await apiRequest('/muscle-groups/back');
    expectTruthy(backGroupResponse.success, 'Specific muscle group endpoint accessible');
    if (backGroupResponse.success) {
        expectProperty(backGroupResponse.data, 'data', 'Muscle group details structure');
    }
    
    // Test 3: Save muscle selection
    const saveResponse = await apiRequest('/muscle-selection', 'POST', TEST_MUSCLE_SELECTION);
    expectTruthy(saveResponse.success, 'Save muscle selection endpoint');
    if (saveResponse.success) {
        expectProperty(saveResponse.data, 'data', 'Save response structure');
    }
    
    // Test 4: Retrieve saved muscle selection
    const loadResponse = await apiRequest('/muscle-selection');
    expectTruthy(loadResponse.success, 'Load muscle selection endpoint');
    if (loadResponse.success) {
        expectProperty(loadResponse.data, 'data', 'Load response structure');
        const loadedData = loadResponse.data.data;
        if (loadedData.selectedGroups) {
            expect(loadedData.selectedGroups.length, 3, 'Loaded muscle groups count');
        }
    }
    
    // Test 5: Get muscle suggestions
    const suggestionsResponse = await apiRequest('/muscle-suggestions', 'POST', TEST_PROFILE_DATA);
    expectTruthy(suggestionsResponse.success, 'Muscle suggestions endpoint');
    if (suggestionsResponse.success) {
        expectProperty(suggestionsResponse.data, 'data', 'Suggestions response structure');
    }
}

/**
 * Test Suite 2: Data Validation and Processing
 */
async function testDataValidation() {
    console.log('\n✅ Testing Data Validation...');
    
    // Test invalid muscle selection (too many groups)
    const invalidSelection = {
        selectedGroups: ['back', 'chest', 'arms', 'shoulders', 'core', 'legs'], // More than 3
        selectedMuscles: {}
    };
    
    const invalidResponse = await apiRequest('/muscle-selection', 'POST', invalidSelection);
    
    // Should fail validation
    if (!invalidResponse.success && invalidResponse.status === 400) {
        logTest('Invalid selection validation', true, 'Correctly rejected invalid selection');
    } else {
        logTest('Invalid selection validation', false, 'Should reject selections with too many groups');
    }
    
    // Test empty selection
    const emptySelection = {
        selectedGroups: [],
        selectedMuscles: {}
    };
    
    const emptyResponse = await apiRequest('/muscle-selection', 'POST', emptySelection);
    expectTruthy(emptyResponse.success, 'Empty selection handling');
}

/**
 * Test Suite 3: Module Integration
 */
async function testModuleIntegration() {
    console.log('\n🔧 Testing Module Integration...');
    
    // Test WordPress debug endpoint to verify modules are loaded
    const debugResponse = await apiRequest('/debug');
    expectTruthy(debugResponse.success, 'Debug endpoint accessibility');
    
    // Check if muscle-related routes are registered
    console.log('🔍 Checking registered routes...');
    
    const routesToTest = [
        '/muscle-groups',
        '/muscle-selection', 
        '/muscle-suggestions'
    ];
    
    for (const route of routesToTest) {
        const response = await apiRequest(route);
        const routeWorks = response.success || response.status !== 404;
        logTest(`Route registration: ${route}`, routeWorks);
    }
}

/**
 * Test Suite 4: End-to-End Workflow
 */
async function testEndToEndWorkflow() {
    console.log('\n🔄 Testing End-to-End Workflow...');
    
    // Step 1: Clear existing selection
    await apiRequest('/muscle-selection', 'DELETE');
    
    // Step 2: Get initial empty state
    const emptyState = await apiRequest('/muscle-selection');
    if (emptyState.success) {
        const isEmpty = !emptyState.data.data.selectedGroups || 
                       emptyState.data.data.selectedGroups.length === 0;
        logTest('Initial empty state', isEmpty);
    }
    
    // Step 3: Save new selection
    const saveResult = await apiRequest('/muscle-selection', 'POST', TEST_MUSCLE_SELECTION);
    expectTruthy(saveResult.success, 'Save muscle selection');
    
    // Step 4: Verify saved data
    const verifyResult = await apiRequest('/muscle-selection');
    if (verifyResult.success) {
        const savedData = verifyResult.data.data;
        expect(savedData.selectedGroups.length, 3, 'Saved groups count verification');
        
        // Check specific groups
        const hasBack = savedData.selectedGroups.includes('back');
        const hasChest = savedData.selectedGroups.includes('chest');
        const hasLegs = savedData.selectedGroups.includes('legs');
        
        logTest('Saved groups content', hasBack && hasChest && hasLegs);
    }
    
    // Step 5: Get suggestions based on profile
    const suggestionsResult = await apiRequest('/muscle-suggestions', 'POST', TEST_PROFILE_DATA);
    expectTruthy(suggestionsResult.success, 'AI suggestions generation');
    
    if (suggestionsResult.success) {
        const suggestions = suggestionsResult.data.data;
        expectProperty(suggestions, 'suggestions', 'Suggestions structure');
        expectProperty(suggestions, 'reasoning', 'Suggestions reasoning');
        expectProperty(suggestions, 'profile_context', 'Profile context');
    }
}

/**
 * Test Suite 5: Performance and Error Handling
 */
async function testPerformanceAndErrors() {
    console.log('\n⚡ Testing Performance and Error Handling...');
    
    // Test API response times
    const startTime = Date.now();
    const response = await apiRequest('/muscle-groups');
    const responseTime = Date.now() - startTime;
    
    logTest('API response time', responseTime < 2000, `${responseTime}ms`);
    
    // Test malformed requests
    const malformedResponse = await apiRequest('/muscle-selection', 'POST', { invalid: 'data' });
    const handlesErrors = !malformedResponse.success && malformedResponse.status >= 400;
    logTest('Error handling for malformed requests', handlesErrors);
    
    // Test non-existent endpoints
    const notFoundResponse = await apiRequest('/non-existent-endpoint');
    const handles404 = notFoundResponse.status === 404 || !notFoundResponse.success;
    logTest('404 handling for non-existent endpoints', handles404);
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.log('🚀 FitCopilot MuscleTargeting Module - Complete Integration Test Suite');
    console.log('=' .repeat(80));
    
    const startTime = Date.now();
    
    try {
        await testRESTAPIEndpoints();
        await testDataValidation();
        await testModuleIntegration();
        await testEndToEndWorkflow();
        await testPerformanceAndErrors();
        
    } catch (error) {
        console.error('❌ Test suite execution error:', error);
        logTest('Test suite execution', false, error.message);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Summary Report
    console.log('\n' + '=' .repeat(80));
    console.log('📊 TEST SUMMARY REPORT');
    console.log('=' .repeat(80));
    console.log(`⏱️  Total execution time: ${duration}ms`);
    console.log(`✅ Tests passed: ${testResults.passed}`);
    console.log(`❌ Tests failed: ${testResults.failed}`);
    console.log(`📈 Success rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! MuscleTargeting Module is ready for production.');
    } else {
        console.log('⚠️  Some tests failed. Review the issues above before proceeding.');
    }
    
    // Detailed test results
    console.log('\n📋 DETAILED TEST RESULTS:');
    testResults.tests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        console.log(`${status} ${test.name}${test.message ? ': ' + test.message : ''}`);
    });
    
    return {
        passed: testResults.passed,
        failed: testResults.failed,
        duration: duration,
        success: testResults.failed === 0
    };
}

// Auto-run tests
runAllTests().then(results => {
    console.log('\n🏁 Testing completed!');
    
    if (results.success) {
        console.log('🎯 Sprint 2 MuscleTargeting Module Implementation: COMPLETE ✅');
        console.log('📋 Ready for Sprint 3: PromptGeneration Module');
    } else {
        console.log('🔧 Review failed tests and make necessary fixes before proceeding');
    }
}); 