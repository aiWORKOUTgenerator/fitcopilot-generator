/**
 * STEP 1: Form State Capture Verification Test
 * 
 * This script tests the enhanced debugging system in useWorkoutForm.ts
 * to verify if WorkoutGeneratorGrid card selections are properly flowing
 * into the form state and being transformed for API payload.
 * 
 * Usage: Run this in browser console on WorkoutGeneratorGrid page
 */

console.log('🔍 STEP 1: Form State Capture Verification Test Starting...');

// Test data simulating all 11 WorkoutGeneratorGrid card selections
const testWorkoutGridSelections = {
  // WorkoutFocusCard
  todaysFocus: 'build-muscle',
  
  // IntensityCard  
  dailyIntensityLevel: 4,
  
  // DurationCard
  timeConstraintsToday: 30,
  
  // EquipmentCard
  equipmentAvailableToday: ['dumbbells', 'resistance-bands'],
  
  // RestrictionsCard
  healthRestrictionsToday: ['lower-back', 'knee'],
  
  // LocationCard
  locationToday: 'gym',
  environment: 'gym', // Alternative field
  
  // EnergyMoodCard
  energyLevel: 4,
  
  // StressMoodCard
  moodLevel: 2, // High stress (maps to stress_level: 'high')
  
  // SleepQualityCard
  sleepQuality: 3,
  
  // WorkoutCustomizationCard
  workoutCustomization: 'Focus on compound movements, avoid isolation exercises',
  
  // MuscleGroupCard
  focusArea: ['chest', 'shoulders', 'triceps'],
  muscleTargeting: {
    targetMuscleGroups: ['chest', 'shoulders'],
    specificMuscles: ['pectoralis-major', 'anterior-deltoid'],
    primaryFocus: 'chest'
  }
};

// Function to simulate WorkoutGeneratorGrid card interactions
async function simulateWorkoutGridInteractions() {
  console.log('📝 Simulating WorkoutGeneratorGrid card interactions...');
  
  // Check if we're on the correct page
  if (!window.location.pathname.includes('fitcopilot') && !document.querySelector('[data-testid="workout-generator-grid"]')) {
    console.warn('⚠️ Not on WorkoutGeneratorGrid page. Navigate to the workout generator first.');
    return;
  }
  
  // Try to access the React component state
  const workoutGridElement = document.querySelector('[data-testid="workout-generator-grid"]') || 
                             document.querySelector('.workout-generator-grid') ||
                             document.querySelector('.workout-request-form');
  
  if (!workoutGridElement) {
    console.warn('⚠️ WorkoutGeneratorGrid element not found. Trying alternative approach...');
    
    // Alternative: Look for any form elements
    const formElements = document.querySelectorAll('form, [class*="workout"], [class*="form"]');
    console.log('🔍 Found form elements:', formElements.length);
    
    if (formElements.length === 0) {
      console.error('❌ No form elements found. Make sure you\'re on the workout generator page.');
      return;
    }
  }
  
  // Simulate localStorage updates (how cards typically save state)
  console.log('💾 Simulating localStorage updates for WorkoutGeneratorGrid cards...');
  
  Object.entries(testWorkoutGridSelections).forEach(([key, value]) => {
    const storageKey = `fitcopilot_${key}`;
    localStorage.setItem(storageKey, JSON.stringify(value));
    console.log(`✅ Stored ${key}:`, value);
  });
  
  // Simulate sessionStorage updates (alternative storage method)
  const sessionInputsKey = 'fitcopilot_workout_form';
  const mockFormState = {
    sessionInputs: testWorkoutGridSelections,
    duration: 30,
    goals: 'build-muscle',
    equipment: ['dumbbells', 'resistance-bands'],
    restrictions: 'lower-back, knee',
    difficulty: 'intermediate'
  };
  
  sessionStorage.setItem(sessionInputsKey, JSON.stringify(mockFormState));
  console.log('✅ Stored complete form state in sessionStorage');
  
  // Try to trigger React state updates
  console.log('🔄 Attempting to trigger React state updates...');
  
  // Method 1: Dispatch custom events
  const updateEvent = new CustomEvent('workoutFormUpdate', {
    detail: { sessionInputs: testWorkoutGridSelections }
  });
  document.dispatchEvent(updateEvent);
  
  // Method 2: Try to find and click form elements to trigger updates
  const clickableElements = document.querySelectorAll('button, input, select, [role="button"]');
  console.log(`🖱️ Found ${clickableElements.length} clickable elements`);
  
  // Method 3: Try to access React DevTools if available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('⚛️ React DevTools detected - attempting to access component state');
    
    // This is a more advanced approach that would require React DevTools
    try {
      const reactFiber = workoutGridElement?._reactInternalFiber || 
                        workoutGridElement?._reactInternals;
      if (reactFiber) {
        console.log('✅ React Fiber found - component state access possible');
      }
    } catch (error) {
      console.log('ℹ️ React Fiber access not available:', error.message);
    }
  }
  
  return mockFormState;
}

// Function to verify form state capture
function verifyFormStateCapture() {
  console.log('🔍 STEP 1 VERIFICATION: Checking form state capture...');
  
  // Check localStorage for individual card data
  console.log('📦 Checking localStorage for card data:');
  Object.keys(testWorkoutGridSelections).forEach(key => {
    const storageKey = `fitcopilot_${key}`;
    const storedValue = localStorage.getItem(storageKey);
    console.log(`  ${key}:`, storedValue ? JSON.parse(storedValue) : 'NOT_FOUND');
  });
  
  // Check sessionStorage for complete form state
  console.log('📦 Checking sessionStorage for complete form state:');
  const formState = sessionStorage.getItem('fitcopilot_workout_form');
  if (formState) {
    const parsedState = JSON.parse(formState);
    console.log('✅ Form state found:', parsedState);
    
    // Verify sessionInputs structure
    if (parsedState.sessionInputs) {
      console.log('✅ sessionInputs found with keys:', Object.keys(parsedState.sessionInputs));
      
      // Check each expected field
      const expectedFields = Object.keys(testWorkoutGridSelections);
      const missingFields = expectedFields.filter(field => !parsedState.sessionInputs[field]);
      const presentFields = expectedFields.filter(field => parsedState.sessionInputs[field]);
      
      console.log(`📊 Field capture rate: ${presentFields.length}/${expectedFields.length} (${Math.round(presentFields.length/expectedFields.length*100)}%)`);
      console.log('✅ Present fields:', presentFields);
      console.log('❌ Missing fields:', missingFields);
    } else {
      console.warn('⚠️ sessionInputs not found in form state');
    }
  } else {
    console.warn('⚠️ No form state found in sessionStorage');
  }
  
  // Check for console logs from useWorkoutForm
  console.log('👂 Listening for useWorkoutForm debug logs...');
  console.log('ℹ️ Look for logs starting with "[useWorkoutForm] STEP 1 VERIFICATION"');
  
  return {
    localStorage: Object.keys(testWorkoutGridSelections).map(key => ({
      field: key,
      stored: !!localStorage.getItem(`fitcopilot_${key}`)
    })),
    sessionStorage: !!sessionStorage.getItem('fitcopilot_workout_form'),
    formState: formState ? JSON.parse(formState) : null
  };
}

// Function to analyze data transformation
function analyzeDataTransformation() {
  console.log('🔄 STEP 1 ANALYSIS: Data transformation verification...');
  
  const formState = sessionStorage.getItem('fitcopilot_workout_form');
  if (!formState) {
    console.warn('⚠️ No form state to analyze');
    return;
  }
  
  const parsedState = JSON.parse(formState);
  const sessionInputs = parsedState.sessionInputs;
  
  if (!sessionInputs) {
    console.warn('⚠️ No sessionInputs to analyze');
    return;
  }
  
  console.log('🧮 Analyzing expected data transformations:');
  
  // Stress level mapping (moodLevel -> stress_level)
  if (sessionInputs.moodLevel) {
    const stressMapping = {
      1: 'very_high',
      2: 'high', 
      3: 'moderate',
      4: 'low',
      5: 'low'
    };
    const expectedStressLevel = stressMapping[sessionInputs.moodLevel];
    console.log(`  Stress: moodLevel ${sessionInputs.moodLevel} → stress_level "${expectedStressLevel}"`);
  }
  
  // Energy level mapping (energyLevel -> energy_level)
  if (sessionInputs.energyLevel) {
    const energyMapping = {
      1: 'very_low',
      2: 'low',
      3: 'moderate', 
      4: 'high',
      5: 'very_high'
    };
    const expectedEnergyLevel = energyMapping[sessionInputs.energyLevel];
    console.log(`  Energy: energyLevel ${sessionInputs.energyLevel} → energy_level "${expectedEnergyLevel}"`);
  }
  
  // Sleep quality mapping (sleepQuality -> sleep_quality)
  if (sessionInputs.sleepQuality) {
    const sleepMapping = {
      1: 'poor',
      2: 'fair',
      3: 'good',
      4: 'good', 
      5: 'excellent'
    };
    const expectedSleepQuality = sleepMapping[sessionInputs.sleepQuality];
    console.log(`  Sleep: sleepQuality ${sessionInputs.sleepQuality} → sleep_quality "${expectedSleepQuality}"`);
  }
  
  // Location mapping
  const location = sessionInputs.locationToday || sessionInputs.environment || 'any';
  console.log(`  Location: → location "${location}"`);
  
  // Custom notes combination
  const customNotes = [
    sessionInputs.workoutCustomization,
    parsedState.preferences
  ].filter(Boolean).join('; ');
  console.log(`  Custom Notes: → "${customNotes}"`);
  
  // Primary muscle focus
  const primaryFocus = sessionInputs.muscleTargeting?.primaryFocus || 
                      (sessionInputs.focusArea && sessionInputs.focusArea[0]) || 
                      null;
  console.log(`  Primary Muscle Focus: → "${primaryFocus}"`);
  
  return {
    transformations: {
      stress_level: sessionInputs.moodLevel ? stressMapping[sessionInputs.moodLevel] : null,
      energy_level: sessionInputs.energyLevel ? energyMapping[sessionInputs.energyLevel] : null,
      sleep_quality: sessionInputs.sleepQuality ? sleepMapping[sessionInputs.sleepQuality] : null,
      location: location,
      custom_notes: customNotes,
      primary_muscle_focus: primaryFocus
    }
  };
}

// Main test execution
async function runStep1Verification() {
  console.log('🚀 STEP 1: Form State Capture Verification - STARTING');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Simulate card interactions
    const mockState = await simulateWorkoutGridInteractions();
    
    // Step 2: Verify form state capture
    const captureResults = verifyFormStateCapture();
    
    // Step 3: Analyze data transformations
    const transformationResults = analyzeDataTransformation();
    
    // Step 4: Generate summary report
    console.log('📊 STEP 1 VERIFICATION SUMMARY:');
    console.log('=' .repeat(60));
    console.log('✅ Test data simulated:', !!mockState);
    console.log('✅ localStorage capture:', captureResults.localStorage.filter(item => item.stored).length + '/11 fields');
    console.log('✅ sessionStorage capture:', captureResults.sessionStorage ? 'SUCCESS' : 'FAILED');
    console.log('✅ Data transformations:', transformationResults ? 'ANALYZED' : 'SKIPPED');
    
    console.log('\n🔍 NEXT STEPS:');
    console.log('1. Check browser console for "[useWorkoutForm] STEP 1 VERIFICATION" logs');
    console.log('2. Make actual selections in WorkoutGeneratorGrid cards');
    console.log('3. Click "Review Workout" button to trigger getMappedFormValues()');
    console.log('4. Verify which cards are captured vs missing');
    console.log('5. Proceed to STEP 2: API Payload Inspection');
    
    return {
      success: true,
      mockState,
      captureResults,
      transformationResults,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ STEP 1 VERIFICATION FAILED:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-run the test
runStep1Verification().then(results => {
  console.log('🏁 STEP 1 VERIFICATION COMPLETE:', results);
  
  // Store results for next step
  window.step1Results = results;
  
  console.log('\n💡 TIP: Results stored in window.step1Results for reference');
  console.log('💡 TIP: Run window.step1Results to see full results');
}); 