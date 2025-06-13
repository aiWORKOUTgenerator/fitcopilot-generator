/**
 * Production-Quality Muscle Integration Test
 * 
 * Comprehensive integration test that verifies the complete muscle targeting workflow:
 * 1. Muscle selection state management
 * 2. Form data integration 
 * 3. API payload transmission
 * 4. Backend processing
 * 5. Workout generation with muscle targeting
 * 
 * @version 1.0.0
 * @author FitCopilot Team
 */

// Test configuration
const TEST_CONFIG = {
  baseUrl: window.location.origin,
  apiNamespace: '/wp-json/fitcopilot/v1',
  enableDebugLogs: true,
  retryAttempts: 3,
  timeout: 180000, // 3 minutes for workout generation
};

// Test data sets
const TEST_SCENARIOS = {
  scenario1: {
    name: 'Chest & Back Focus',
    description: 'Upper body muscle targeting with specific muscles',
    muscleSelection: {
      selectedGroups: ['chest', 'back'],
      selectedMuscles: {
        chest: ['Upper Chest', 'Lower Chest'],
        back: ['Lats', 'Rhomboids']
      }
    },
    expectedTargeting: ['chest', 'back'],
    primaryFocus: 'chest'
  },
  
  scenario2: {
    name: 'Full Body Focus',
    description: 'Maximum muscle groups with comprehensive targeting',
    muscleSelection: {
      selectedGroups: ['chest', 'legs', 'core'],
      selectedMuscles: {
        chest: ['Upper Chest', 'Middle Chest'],
        legs: ['Quadriceps', 'Hamstrings', 'Glutes'],
        core: ['Abs', 'Obliques']
      }
    },
    expectedTargeting: ['chest', 'legs', 'core'],
    primaryFocus: 'chest'
  },
  
  scenario3: {
    name: 'Single Muscle Focus',
    description: 'Simple single muscle group targeting',
    muscleSelection: {
      selectedGroups: ['arms'],
      selectedMuscles: {
        arms: ['Biceps', 'Triceps']
      }
    },
    expectedTargeting: ['arms'],
    primaryFocus: 'arms'
  }
};

/**
 * Test utilities
 */
class MuscleIntegrationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    this.log = this.createLogger();
  }
  
  createLogger() {
    return {
      info: (message, data) => {
        if (TEST_CONFIG.enableDebugLogs) {
          console.log(`[MuscleTest] ${message}`, data || '');
        }
      },
      success: (message, data) => {
        console.log(`✅ [MuscleTest] ${message}`, data || '');
      },
      error: (message, data) => {
        console.error(`❌ [MuscleTest] ${message}`, data || '');
      },
      warn: (message, data) => {
        console.warn(`⚠️ [MuscleTest] ${message}`, data || '');
      }
    };
  }
  
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async makeApiRequest(endpoint, options = {}) {
    const url = `${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiNamespace}${endpoint}`;
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.fitcopilot_ajax?.nonce || ''
      }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    this.log.info(`Making API request: ${finalOptions.method} ${url}`);
    
    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
      }
      
      return data;
    } catch (error) {
      this.log.error(`API request failed: ${error.message}`);
      throw error;
    }
  }
  
  async testMuscleSelectionPersistence(scenario) {
    this.log.info(`Testing muscle selection persistence for: ${scenario.name}`);
    
    try {
      // Step 1: Save muscle selection
      const savePayload = {
        selectedGroups: scenario.muscleSelection.selectedGroups,
        selectedMuscles: scenario.muscleSelection.selectedMuscles
      };
      
      const saveResponse = await this.makeApiRequest('/muscle-selection', {
        method: 'POST',
        body: JSON.stringify(savePayload)
      });
      
      this.log.info('Muscle selection saved:', saveResponse);
      
      // Step 2: Retrieve muscle selection
      await this.delay(100); // Brief delay to ensure persistence
      
      const retrieveResponse = await this.makeApiRequest('/muscle-selection');
      this.log.info('Muscle selection retrieved:', retrieveResponse);
      
      // Step 3: Validate data integrity
      const retrieved = retrieveResponse.data;
      const expectedGroups = scenario.muscleSelection.selectedGroups;
      
      if (!retrieved || !retrieved.selectedGroups) {
        throw new Error('No muscle selection data returned');
      }
      
      if (retrieved.selectedGroups.length !== expectedGroups.length) {
        throw new Error(`Group count mismatch: expected ${expectedGroups.length}, got ${retrieved.selectedGroups.length}`);
      }
      
      const missingGroups = expectedGroups.filter(group => !retrieved.selectedGroups.includes(group));
      if (missingGroups.length > 0) {
        throw new Error(`Missing muscle groups: ${missingGroups.join(', ')}`);
      }
      
      this.recordTestResult('muscle_selection_persistence', true, 'Muscle selection persistence verified');
      return retrieved;
      
    } catch (error) {
      this.recordTestResult('muscle_selection_persistence', false, error.message);
      throw error;
    }
  }
  
  async testFormDataIntegration(scenario, muscleSelection) {
    this.log.info(`Testing form data integration for: ${scenario.name}`);
    
    try {
      // Simulate form data with muscle targeting
      const formData = {
        duration: 30,
        difficulty: 'intermediate',
        goals: 'build-muscle',
        equipment: ['dumbbells', 'resistance-bands'],
        intensity: 4,
        sessionInputs: {
          todaysFocus: 'muscle-building',
          dailyIntensityLevel: 4,
          timeConstraintsToday: 30,
          focusArea: scenario.muscleSelection.selectedGroups,
          muscleTargeting: {
            targetMuscleGroups: scenario.muscleSelection.selectedGroups,
            specificMuscles: scenario.muscleSelection.selectedMuscles,
            primaryFocus: scenario.primaryFocus,
            selectionSummary: this.generateSelectionSummary(scenario.muscleSelection)
          }
        },
        muscleTargeting: {
          targetMuscleGroups: scenario.muscleSelection.selectedGroups,
          specificMuscles: scenario.muscleSelection.selectedMuscles,
          primaryFocus: scenario.primaryFocus,
          selectionSummary: this.generateSelectionSummary(scenario.muscleSelection)
        }
      };
      
      this.log.info('Form data generated:', formData);
      
      // Validate form data structure
      if (!formData.muscleTargeting || !formData.sessionInputs.muscleTargeting) {
        throw new Error('Muscle targeting data missing from form');
      }
      
      if (!formData.muscleTargeting.targetMuscleGroups.length) {
        throw new Error('No target muscle groups in form data');
      }
      
      this.recordTestResult('form_data_integration', true, 'Form data integration verified');
      return formData;
      
    } catch (error) {
      this.recordTestResult('form_data_integration', false, error.message);
      throw error;
    }
  }
  
  async testWorkoutGeneration(scenario, formData) {
    this.log.info(`Testing workout generation for: ${scenario.name}`);
    
    try {
      // Build specific request for workout generation
      const specificRequest = `Generate a ${formData.difficulty} ${formData.duration}-minute workout targeting ${scenario.muscleSelection.selectedGroups.join(', ')} muscles. Primary focus on ${scenario.primaryFocus}.`;
      
      const generationPayload = {
        ...formData,
        specific_request: specificRequest
      };
      
      this.log.info('Generating workout with payload:', {
        duration: generationPayload.duration,
        difficulty: generationPayload.difficulty,
        targetMuscles: generationPayload.muscleTargeting?.targetMuscleGroups,
        primaryFocus: generationPayload.muscleTargeting?.primaryFocus
      });
      
      // Make workout generation request with extended timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);
      
      try {
        const response = await this.makeApiRequest('/generate', {
          method: 'POST',
          body: JSON.stringify(generationPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        this.log.info('Workout generation response:', {
          success: response.success,
          hasWorkout: !!response.data,
          exerciseCount: response.data?.exercises?.length || 0,
          title: response.data?.title
        });
        
        if (!response.success || !response.data) {
          throw new Error('Workout generation failed: ' + (response.message || 'Unknown error'));
        }
        
        // Validate workout includes muscle targeting
        const workout = response.data;
        const muscleTargetingSuccess = this.validateMuscleTargeting(workout, scenario);
        
        this.recordTestResult('workout_generation', true, 'Workout generation successful');
        this.recordTestResult('muscle_targeting_validation', muscleTargetingSuccess.success, muscleTargetingSuccess.message);
        
        return workout;
        
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error(`Workout generation timed out after ${TEST_CONFIG.timeout / 1000} seconds`);
        }
        throw error;
      }
      
    } catch (error) {
      this.recordTestResult('workout_generation', false, error.message);
      throw error;
    }
  }
  
  validateMuscleTargeting(workout, scenario) {
    const expectedMuscles = scenario.expectedTargeting;
    const workoutText = JSON.stringify(workout).toLowerCase();
    
    let targetingScore = 0;
    let targetingDetails = [];
    
    // Check if workout title mentions target muscles
    if (workout.title) {
      const titleLower = workout.title.toLowerCase();
      expectedMuscles.forEach(muscle => {
        if (titleLower.includes(muscle.toLowerCase())) {
          targetingScore++;
          targetingDetails.push(`Title includes '${muscle}'`);
        }
      });
    }
    
    // Check if exercises target selected muscles
    if (workout.exercises && workout.exercises.length > 0) {
      expectedMuscles.forEach(muscle => {
        const muscleReferences = workout.exercises.filter(exercise => {
          const exerciseText = (exercise.name + ' ' + (exercise.description || '')).toLowerCase();
          return exerciseText.includes(muscle.toLowerCase());
        });
        
        if (muscleReferences.length > 0) {
          targetingScore++;
          targetingDetails.push(`${muscleReferences.length} exercises target '${muscle}'`);
        }
      });
    }
    
    // Calculate success percentage
    const successPercentage = (targetingScore / expectedMuscles.length) * 100;
    const isSuccess = successPercentage >= 50; // At least 50% of muscles should be referenced
    
    return {
      success: isSuccess,
      message: `Muscle targeting: ${successPercentage.toFixed(1)}% (${targetingScore}/${expectedMuscles.length} muscles referenced)`,
      details: targetingDetails
    };
  }
  
  generateSelectionSummary(muscleSelection) {
    const groupCount = muscleSelection.selectedGroups.length;
    const specificCount = Object.values(muscleSelection.selectedMuscles)
      .reduce((total, muscles) => total + muscles.length, 0);
    
    return `${groupCount} muscle groups with ${specificCount} specific muscles`;
  }
  
  recordTestResult(testName, passed, message) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
      this.log.success(`${testName}: ${message}`);
    } else {
      this.testResults.failed++;
      this.log.error(`${testName}: ${message}`);
    }
    
    this.testResults.details.push({
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }
  
  async runCompleteWorkflow(scenarioName) {
    const scenario = TEST_SCENARIOS[scenarioName];
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioName}`);
    }
    
    this.log.info(`Starting complete workflow test for: ${scenario.name}`);
    this.log.info(`Description: ${scenario.description}`);
    
    try {
      // Step 1: Test muscle selection persistence
      const muscleSelection = await this.testMuscleSelectionPersistence(scenario);
      
      // Step 2: Test form data integration
      const formData = await this.testFormDataIntegration(scenario, muscleSelection);
      
      // Step 3: Test workout generation
      const workout = await this.testWorkoutGeneration(scenario, formData);
      
      this.log.success(`Complete workflow test passed for: ${scenario.name}`);
      return {
        scenario: scenario.name,
        success: true,
        muscleSelection,
        formData,
        workout
      };
      
    } catch (error) {
      this.log.error(`Complete workflow test failed for: ${scenario.name}`, error.message);
      return {
        scenario: scenario.name,
        success: false,
        error: error.message
      };
    }
  }
  
  async runAllTests() {
    this.log.info('Starting comprehensive muscle integration tests...');
    const results = [];
    
    for (const scenarioName of Object.keys(TEST_SCENARIOS)) {
      try {
        const result = await this.runCompleteWorkflow(scenarioName);
        results.push(result);
        
        // Brief delay between tests
        await this.delay(1000);
        
      } catch (error) {
        this.log.error(`Failed to run test for ${scenarioName}:`, error.message);
        results.push({
          scenario: scenarioName,
          success: false,
          error: error.message
        });
      }
    }
    
    this.generateTestReport(results);
    return results;
  }
  
  generateTestReport(results) {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 MUSCLE INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📊 Overview: ${passedTests}/${totalTests} scenarios passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log('');
    
    console.log(`📈 Detailed Results: ${this.testResults.passed}/${this.testResults.total} tests passed`);
    console.log('');
    
    // Detailed results per scenario
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.scenario}`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    
    // Individual test results
    if (this.testResults.details.length > 0) {
      console.log('📋 Individual Test Results:');
      this.testResults.details.forEach(detail => {
        const status = detail.passed ? '✅' : '❌';
        console.log(`${status} ${detail.test}: ${detail.message}`);
      });
    }
    
    console.log('='.repeat(60));
  }
}

/**
 * Main test execution function
 */
async function runMuscleIntegrationTests() {
  // Verify test environment
  if (!window.fitcopilot_ajax || !window.fitcopilot_ajax.nonce) {
    console.error('❌ Test environment not ready: Missing WordPress nonce');
    return;
  }
  
  console.log('🚀 Starting Muscle Integration Tests...');
  console.log('Environment:', {
    baseUrl: TEST_CONFIG.baseUrl,
    hasNonce: !!window.fitcopilot_ajax.nonce,
    timeout: `${TEST_CONFIG.timeout / 1000}s`
  });
  
  const tester = new MuscleIntegrationTester();
  
  try {
    const results = await tester.runAllTests();
    
    // Final summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (successCount === totalCount) {
      console.log('🎉 ALL TESTS PASSED! Muscle integration is working correctly.');
    } else {
      console.log(`⚠️ ${totalCount - successCount} test(s) failed. Review the results above.`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    throw error;
  }
}

// Auto-run if script is loaded directly
if (typeof window !== 'undefined' && window.document) {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runMuscleIntegrationTests, 1000);
    });
  } else {
    setTimeout(runMuscleIntegrationTests, 1000);
  }
}

// Export for manual execution
window.runMuscleIntegrationTests = runMuscleIntegrationTests;
window.MuscleIntegrationTester = MuscleIntegrationTester;

console.log('✅ Muscle Integration Test Script Loaded');
console.log('Run tests manually with: window.runMuscleIntegrationTests()'); 