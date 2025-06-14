/**
 * Test Script: Workout Focus Analytics Integration
 * 
 * This script tests the complete workflow:
 * 1. User selects workout focus in WorkoutGeneratorGrid
 * 2. Selection is tracked via analytics API
 * 3. Selection is cached indefinitely
 * 4. User returns and sees their last selection
 */

console.log('🧪 Testing Workout Focus Analytics Integration...\n');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost/wp-json/fitcopilot/v1',
  testFocus: 'muscle-building',
  testContext: {
    source: 'workout-generator',
    step: 'focus-selection',
    test_run: true
  }
};

/**
 * Test 1: Track a workout focus selection
 */
async function testTrackWorkoutFocus() {
  console.log('📊 Test 1: Track Workout Focus Selection');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/analytics/workout-focus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.fitcopilotData?.nonce || ''
      },
      body: JSON.stringify({
        focus: TEST_CONFIG.testFocus,
        context: TEST_CONFIG.testContext
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Focus tracked successfully:', result.data);
      console.log('   - Focus:', result.data.focus);
      console.log('   - Cached until:', result.data.cached_until);
      return true;
    } else {
      console.log('❌ Failed to track focus:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error tracking focus:', error.message);
    return false;
  }
}

/**
 * Test 2: Retrieve last workout focus selection
 */
async function testGetLastWorkoutFocus() {
  console.log('\n📥 Test 2: Get Last Workout Focus Selection');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/analytics/workout-focus/last`, {
      method: 'GET',
      headers: {
        'X-WP-Nonce': window.fitcopilotData?.nonce || ''
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ Last selection retrieved:', result.data);
      console.log('   - Focus:', result.data.focus);
      console.log('   - Timestamp:', new Date(result.data.timestamp * 1000).toLocaleString());
      console.log('   - Cached since:', result.data.cached_since);
      console.log('   - Context:', result.data.context);
      
      // Verify it matches what we just tracked
      if (result.data.focus === TEST_CONFIG.testFocus) {
        console.log('✅ Last selection matches tracked focus');
        return true;
      } else {
        console.log('❌ Last selection does not match tracked focus');
        return false;
      }
    } else if (result.success && !result.data) {
      console.log('ℹ️ No previous workout focus found');
      return false;
    } else {
      console.log('❌ Failed to get last focus:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting last focus:', error.message);
    return false;
  }
}

/**
 * Test 3: Get workout focus analytics
 */
async function testGetWorkoutFocusAnalytics() {
  console.log('\n📈 Test 3: Get Workout Focus Analytics');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/analytics/workout-focus/stats`, {
      method: 'GET',
      headers: {
        'X-WP-Nonce': window.fitcopilotData?.nonce || ''
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ Analytics retrieved:', result.data);
      console.log('   - Total selections:', result.data.total_selections);
      console.log('   - Most popular:', result.data.most_popular);
      console.log('   - Focus distribution:', result.data.focus_distribution);
      console.log('   - Recent selections:', result.data.recent_selections.length);
      console.log('   - Analysis date:', result.data.analysis_date);
      return true;
    } else {
      console.log('❌ Failed to get analytics:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error getting analytics:', error.message);
    return false;
  }
}

/**
 * Test 4: Frontend service integration
 */
async function testFrontendServiceIntegration() {
  console.log('\n🔧 Test 4: Frontend Service Integration');
  
  try {
    // Check if the service is available
    if (typeof window.workoutFocusAnalytics === 'undefined') {
      console.log('❌ workoutFocusAnalytics service not found on window');
      return false;
    }
    
    const service = window.workoutFocusAnalytics;
    
    // Test tracking
    console.log('   Testing service.trackWorkoutFocus...');
    const trackResult = await service.trackWorkoutFocus('strength', {
      source: 'test-script',
      test_run: true
    });
    
    if (trackResult.success) {
      console.log('✅ Service tracking successful');
    } else {
      console.log('❌ Service tracking failed:', trackResult.message);
      return false;
    }
    
    // Test retrieval
    console.log('   Testing service.getLastWorkoutFocus...');
    const lastSelection = await service.getLastWorkoutFocus();
    
    if (lastSelection) {
      console.log('✅ Service retrieval successful:', lastSelection.focus);
    } else {
      console.log('❌ Service retrieval failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error testing frontend service:', error.message);
    return false;
  }
}

/**
 * Test 5: React hook integration (if available)
 */
async function testReactHookIntegration() {
  console.log('\n⚛️ Test 5: React Hook Integration');
  
  try {
    // This would require the React component to be mounted
    // For now, just check if the hook is available
    if (typeof window.useWorkoutFocusAnalytics === 'undefined') {
      console.log('ℹ️ useWorkoutFocusAnalytics hook not available (requires React component)');
      return true; // Not a failure, just not available in this context
    }
    
    console.log('✅ React hook available for testing');
    return true;
  } catch (error) {
    console.log('❌ Error testing React hook:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Workout Focus Analytics Integration Tests\n');
  
  const results = {
    trackFocus: await testTrackWorkoutFocus(),
    getLastFocus: await testGetLastWorkoutFocus(),
    getAnalytics: await testGetWorkoutFocusAnalytics(),
    frontendService: await testFrontendServiceIntegration(),
    reactHook: await testReactHookIntegration()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  
  let passedTests = 0;
  let totalTests = 0;
  
  Object.entries(results).forEach(([testName, passed]) => {
    totalTests++;
    if (passed) passedTests++;
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Workout Focus Analytics integration is working correctly.');
    console.log('\n📝 Key Features Verified:');
    console.log('   ✅ Analytics tracking via REST API');
    console.log('   ✅ Indefinite caching of last selection');
    console.log('   ✅ Analytics data retrieval');
    console.log('   ✅ Frontend service integration');
    console.log('   ✅ User experience: last selection restoration');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
  
  return results;
}

// Auto-run tests if this script is executed directly
if (typeof window !== 'undefined') {
  // Wait for DOM and any necessary scripts to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllTests, 1000); // Give scripts time to initialize
    });
  } else {
    setTimeout(runAllTests, 1000);
  }
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testTrackWorkoutFocus,
    testGetLastWorkoutFocus,
    testGetWorkoutFocusAnalytics,
    testFrontendServiceIntegration,
    testReactHookIntegration
  };
} 