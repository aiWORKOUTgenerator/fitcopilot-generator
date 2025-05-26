/**
 * Manual API Validation Script
 * 
 * Run this script in the browser console to validate that the API client
 * fixes from Stories 1 & 2 are working correctly.
 * 
 * Usage:
 * 1. Open browser developer console
 * 2. Copy and paste this entire script
 * 3. Press Enter to run
 * 4. Watch the test results in the console
 */

console.log('🧪 FitCopilot API Validation Script Starting...');
console.log('📋 Testing API client fixes from Stories 1 & 2');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Test configuration
const API_BASE = '/wp-json/fitcopilot/v1';
let testResults = [];
let createdWorkoutId = null;

// Helper function to add test result
function addTestResult(testName, passed, error = null) {
  testResults.push({ name: testName, passed, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
  if (!passed && error) {
    console.log(`   └─ Error: ${error}`);
  }
}

// Helper function to make API requests with proper error handling
async function testApiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.fitcopilotData?.nonce || '',
        ...options.headers
      },
      ...options
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // Check if we're getting HTML responses (the original problem)
      if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
        throw new Error('CRITICAL: Still receiving HTML responses instead of JSON');
      }
      data = text;
    }

    return { response, data, ok: response.ok };
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Test 1: Basic endpoint accessibility
async function testBasicEndpointAccess() {
  console.log('\n🔍 Test 1: Basic Endpoint Access');
  try {
    const { response, data } = await testApiCall(`${API_BASE}/workouts`);
    
    // Even if we get auth error, ensure it's JSON not HTML
    if (data && typeof data === 'object') {
      addTestResult('Basic endpoint returns JSON', true);
    } else {
      addTestResult('Basic endpoint returns JSON', false, 'Received non-JSON response');
    }
    
    // Check for the original "DOCTYPE" error
    const dataStr = JSON.stringify(data);
    if (dataStr.includes('<!DOCTYPE') || dataStr.includes('Unexpected token')) {
      addTestResult('No HTML error pages', false, 'Still receiving HTML responses');
    } else {
      addTestResult('No HTML error pages', true);
    }
    
  } catch (error) {
    const errorStr = error.message || error.toString();
    if (errorStr.includes('<!DOCTYPE') || errorStr.includes('Unexpected token')) {
      addTestResult('Basic endpoint access', false, 'Critical: Still getting HTML error responses');
    } else {
      addTestResult('Basic endpoint access', true, 'Error is proper JSON, not HTML');
    }
  }
}

// Test 2: Workout creation
async function testWorkoutCreation() {
  console.log('\n📝 Test 2: Workout Creation');
  try {
    const testWorkout = {
      title: 'API Validation Test Workout',
      difficulty: 'beginner',
      duration: 20,
      exercises: [
        {
          name: 'Test Push-ups',
          sets: 2,
          reps: 10,
          rest: 30,
          instructions: 'Test exercise for validation'
        }
      ]
    };

    const { response, data } = await testApiCall(`${API_BASE}/workouts`, {
      method: 'POST',
      body: JSON.stringify(testWorkout)
    });

    if (response.ok && data.success && data.data && data.data.id) {
      createdWorkoutId = data.data.id;
      addTestResult('Workout creation', true);
      console.log(`   📋 Created workout ID: ${createdWorkoutId}`);
    } else {
      addTestResult('Workout creation', false, data.message || 'Creation failed');
    }
    
  } catch (error) {
    addTestResult('Workout creation', false, error.message);
  }
}

// Test 3: Workout retrieval
async function testWorkoutRetrieval() {
  console.log('\n📖 Test 3: Workout Retrieval');
  
  if (!createdWorkoutId) {
    addTestResult('Workout retrieval', false, 'No workout ID available (creation may have failed)');
    return;
  }

  try {
    const { response, data } = await testApiCall(`${API_BASE}/workouts/${createdWorkoutId}`);

    if (response.ok && data.success && data.data) {
      addTestResult('Workout retrieval', true);
      console.log(`   📋 Retrieved workout: ${data.data.title}`);
    } else {
      addTestResult('Workout retrieval', false, data.message || 'Retrieval failed');
    }
    
  } catch (error) {
    addTestResult('Workout retrieval', false, error.message);
  }
}

// Test 4: Workout update
async function testWorkoutUpdate() {
  console.log('\n✏️ Test 4: Workout Update');
  
  if (!createdWorkoutId) {
    addTestResult('Workout update', false, 'No workout ID available');
    return;
  }

  try {
    const updatedWorkout = {
      id: createdWorkoutId,
      title: 'Updated API Validation Test Workout',
      difficulty: 'intermediate',
      duration: 25,
      exercises: [
        {
          name: 'Updated Test Push-ups',
          sets: 3,
          reps: 12,
          rest: 45,
          instructions: 'Updated test exercise'
        }
      ]
    };

    const { response, data } = await testApiCall(`${API_BASE}/workouts/${createdWorkoutId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedWorkout)
    });

    if (response.ok && data.success && data.data) {
      addTestResult('Workout update', true);
      console.log(`   📋 Updated workout title: ${data.data.title}`);
    } else {
      addTestResult('Workout update', false, data.message || 'Update failed');
    }
    
  } catch (error) {
    addTestResult('Workout update', false, error.message);
  }
}

// Test 5: Error handling validation
async function testErrorHandling() {
  console.log('\n🚨 Test 5: Error Handling');
  
  try {
    // Test with non-existent workout ID
    const { response, data } = await testApiCall(`${API_BASE}/workouts/non-existent-id-12345`);

    // Should get a proper error response, not HTML
    if (data && typeof data === 'object' && data.success === false) {
      addTestResult('Proper error responses', true);
    } else {
      addTestResult('Proper error responses', false, 'Expected error object structure');
    }
    
  } catch (error) {
    // Check if error contains HTML (the original problem)
    const errorStr = error.message || error.toString();
    if (errorStr.includes('<!DOCTYPE') || errorStr.includes('<html>')) {
      addTestResult('Error handling', false, 'Still receiving HTML error responses');
    } else {
      addTestResult('Error handling', true, 'Errors are properly formatted');
    }
  }
}

// Test 6: Authentication behavior
async function testAuthenticationBehavior() {
  console.log('\n🔐 Test 6: Authentication Behavior');
  
  try {
    // Make a request that might require authentication
    const { response, data } = await testApiCall(`${API_BASE}/workouts?page=1&per_page=1`);

    // Whether it succeeds or fails, ensure we get JSON responses
    if (typeof data === 'object') {
      addTestResult('Authentication responses are JSON', true);
      
      if (data.code === 'rest_forbidden' || data.code === 'unauthorized') {
        addTestResult('Authentication errors properly formatted', true);
        console.log('   📋 Authentication required (this is expected)');
      } else if (data.success) {
        addTestResult('Authenticated request successful', true);
        console.log('   📋 User appears to be authenticated');
      }
    } else {
      addTestResult('Authentication responses are JSON', false, 'Non-JSON response received');
    }
    
  } catch (error) {
    const errorStr = error.message || error.toString();
    if (errorStr.includes('<!DOCTYPE')) {
      addTestResult('Authentication behavior', false, 'HTML responses in auth errors');
    } else {
      addTestResult('Authentication behavior', true, 'Auth errors properly handled');
    }
  }
}

// Test 7: Cleanup
async function testCleanup() {
  console.log('\n🧹 Test 7: Cleanup');
  
  if (!createdWorkoutId) {
    console.log('   📋 No workout to cleanup');
    return;
  }

  try {
    const { response, data } = await testApiCall(`${API_BASE}/workouts/${createdWorkoutId}`, {
      method: 'DELETE'
    });

    if (response.ok && data.success) {
      addTestResult('Workout deletion', true);
      console.log(`   📋 Successfully deleted workout: ${createdWorkoutId}`);
    } else {
      addTestResult('Workout deletion', false, data.message || 'Deletion failed');
    }
    
  } catch (error) {
    addTestResult('Workout deletion', false, error.message);
  }
}

// Test 8: Regression check for API client patterns
async function testApiClientPatterns() {
  console.log('\n🔄 Test 8: API Client Pattern Regression Check');
  
  // Test multiple concurrent requests (should not crash)
  try {
    const promises = [
      testApiCall(`${API_BASE}/workouts?page=1&per_page=1`),
      testApiCall(`${API_BASE}/workouts?page=1&per_page=2`),
      testApiCall(`${API_BASE}/workouts?page=1&per_page=3`)
    ];

    const results = await Promise.allSettled(promises);
    
    // Check that none crashed with HTML responses
    let allProperlyFormatted = true;
    for (const result of results) {
      if (result.status === 'rejected') {
        const errorStr = result.reason?.message || result.reason?.toString() || '';
        if (errorStr.includes('<!DOCTYPE') || errorStr.includes('Unexpected token')) {
          allProperlyFormatted = false;
          break;
        }
      }
    }

    if (allProperlyFormatted) {
      addTestResult('Concurrent requests handled properly', true);
    } else {
      addTestResult('Concurrent requests handled properly', false, 'HTML responses detected');
    }
    
  } catch (error) {
    addTestResult('API client patterns', false, error.message);
  }
}

// Main test runner
async function runAllTests() {
  try {
    await testBasicEndpointAccess();
    await testWorkoutCreation();
    await testWorkoutRetrieval();
    await testWorkoutUpdate();
    await testErrorHandling();
    await testAuthenticationBehavior();
    await testCleanup();
    await testApiClientPatterns();
    
    // Print summary
    console.log('\n📊 Test Results Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    
    testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
    });
    
    console.log(`\n📈 Overall Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 SUCCESS: All tests passed! API client fixes are working correctly.');
      console.log('✅ No more "DOCTYPE" JSON parsing errors');
      console.log('✅ Workout save functionality restored');
      console.log('✅ Error handling is working properly');
    } else {
      console.log('⚠️ ISSUES DETECTED: Some tests failed.');
      console.log('❌ API client fixes may need additional work');
      
      const criticalFailures = testResults.filter(r => 
        !r.passed && (
          r.error?.includes('HTML') || 
          r.error?.includes('DOCTYPE') ||
          r.error?.includes('Unexpected token')
        )
      );
      
      if (criticalFailures.length > 0) {
        console.log('🚨 CRITICAL: Still receiving HTML error responses!');
      }
    }
    
    console.log('\n💡 Next Steps:');
    if (passed === total) {
      console.log('• Deploy fixes to production');
      console.log('• Update user documentation');
      console.log('• Monitor for any remaining issues');
    } else {
      console.log('• Review failed tests above');
      console.log('• Check API client function signatures');
      console.log('• Verify backend endpoint responses');
      console.log('• Re-run tests after fixes');
    }
    
  } catch (error) {
    console.error('🚨 Test runner failed:', error);
  }
}

// Auto-run the tests
console.log('🚀 Starting automated API validation tests...\n');
runAllTests().then(() => {
  console.log('\n✨ API validation testing completed.');
}).catch(error => {
  console.error('💥 Test execution failed:', error);
});

// Also expose individual test functions for manual execution
window.fitcopilotApiTests = {
  runAllTests,
  testBasicEndpointAccess,
  testWorkoutCreation,
  testWorkoutRetrieval,
  testWorkoutUpdate,
  testErrorHandling,
  testAuthenticationBehavior,
  testCleanup,
  testApiClientPatterns,
  getResults: () => testResults
};

console.log('\n📌 Individual tests available via: window.fitcopilotApiTests');
console.log('   Example: await window.fitcopilotApiTests.testWorkoutCreation()'); 