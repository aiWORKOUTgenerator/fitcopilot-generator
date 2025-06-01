/**
 * Frontend Workout Debug Script
 * 
 * Run this in the browser console on the saved workouts page
 * to debug why workouts show "0 exercises" and date issues
 */

console.clear();
console.log('🔍 Starting Frontend Workout Debug...');

// 1. Check if we can access the API directly
async function testDirectAPI() {
  console.group('📡 Direct API Test');
  
  try {
    // First test: Basic request (this failed with 401)
    console.log('🔐 Testing basic API access...');
    const response = await fetch('/wp-json/fitcopilot/v1/workouts');
    const text = await response.text();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('📥 Raw response text:', text);
    
    if (response.status === 401) {
      console.log('🚨 Authentication required! Testing with WordPress nonce...');
      
      // Try to get WordPress nonce for API requests
      const nonce = await getWordPressNonce();
      
      if (nonce) {
        console.log('✅ Found WordPress nonce:', nonce);
        
        const authedResponse = await fetch('/wp-json/fitcopilot/v1/workouts', {
          method: 'GET',
          headers: {
            'X-WP-Nonce': nonce,
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin'
        });
        
        console.log('🔐 Authenticated response status:', authedResponse.status);
        
        if (authedResponse.ok) {
          const authedData = await authedResponse.json();
          console.log('✅ Authenticated data:', authedData);
          
          if (Array.isArray(authedData)) {
            console.log(`📊 Found ${authedData.length} workouts with authentication`);
            authedData.slice(0, 3).forEach((workout, index) => {
              console.log(`🏋️ Workout ${index + 1}:`, {
                id: workout.id || workout.post_id,
                title: workout.title || workout.post_title,
                exercises_count: workout.exercises?.length || 0,
                sections_count: workout.sections?.length || 0,
                workout_data: !!workout.workout_data,
                created: workout.post_date || workout.date || workout.created_at
              });
            });
          }
        } else {
          const authedText = await authedResponse.text();
          console.error('❌ Still unauthorized with nonce:', authedText);
        }
      } else {
        console.error('❌ Could not find WordPress nonce');
      }
    } else if (response.headers.get('content-type')?.includes('application/json')) {
      const data = JSON.parse(text);
      console.log('✅ Parsed JSON data:', data);
      
      if (Array.isArray(data)) {
        console.log(`📊 Found ${data.length} workouts`);
        data.slice(0, 3).forEach((workout, index) => {
          console.log(`🏋️ Workout ${index + 1}:`, {
            id: workout.id || workout.post_id,
            title: workout.title || workout.post_title,
            exercises_count: workout.exercises?.length || 0,
            sections_count: workout.sections?.length || 0,
            workout_data: !!workout.workout_data,
            created: workout.post_date || workout.date || workout.created_at
          });
        });
      }
    } else {
      console.error('❌ Response is not JSON:', text);
    }
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
  
  console.groupEnd();
}

// Helper function to get WordPress nonce
async function getWordPressNonce() {
  try {
    // Method 1: Check if nonce is available in global variables
    if (window.wpApiSettings && window.wpApiSettings.nonce) {
      return window.wpApiSettings.nonce;
    }
    
    // Method 2: Check common WordPress nonce patterns
    if (window.wp && window.wp.apiFetch) {
      // Try to get nonce from wp.apiFetch
      const middleware = window.wp.apiFetch.createNonceMiddleware();
      return middleware?.nonce;
    }
    
    // Method 3: Look for nonce in meta tags
    const nonceMeta = document.querySelector('meta[name="wp-rest-nonce"]');
    if (nonceMeta) {
      return nonceMeta.getAttribute('content');
    }
    
    // Method 4: Try to extract from any existing AJAX requests
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || script.innerText;
      const nonceMatch = content.match(/["\']nonce["\']:\s*["\']([^"\']+)["\']/) || 
                        content.match(/wp_rest_nonce["\']:\s*["\']([^"\']+)["\']/) ||
                        content.match(/_wpnonce["\']:\s*["\']([^"\']+)["\']/) ||
                        content.match(/X-WP-Nonce["\']:\s*["\']([^"\']+)["\']/) ||
                        content.match(/restNonce["\']:\s*["\']([^"\']+)["\']/) ||
                        content.match(/apiNonce["\']:\s*["\']([^"\']+)["\']/) ||
                        content.match(/fitcopilot.*nonce["\']:\s*["\']([^"\']+)["\']/) ||
                        content.match(/nonce["\']:\s*["\']([a-f0-9]{10})["\']/) ||
                        content.match(/["\']([a-f0-9]{10})["\'].*nonce/);
      
      if (nonceMatch) {
        console.log('🔍 Found potential nonce in script:', nonceMatch[1]);
        return nonceMatch[1];
      }
    }
    
    // Method 5: Check localStorage/sessionStorage for any saved nonces
    const storageKeys = ['wp_rest_nonce', 'wordpress_nonce', 'fitcopilot_nonce', 'api_nonce'];
    for (const key of storageKeys) {
      const stored = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (stored) {
        console.log(`🔍 Found nonce in storage (${key}):`, stored);
        return stored;
      }
    }
    
    console.warn('⚠️ No WordPress nonce found using any method');
    return null;
  } catch (error) {
    console.error('❌ Error getting WordPress nonce:', error);
    return null;
  }
}

// 2. Check React component state
function checkReactState() {
  console.group('⚛️ React State Check');
  
  // Find React fiber in the DOM
  const workoutGridElement = document.querySelector('.enhanced-workout-grid, .workout-grid');
  if (workoutGridElement) {
    const reactKey = Object.keys(workoutGridElement).find(key => 
      key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
    );
    
    if (reactKey) {
      const fiber = workoutGridElement[reactKey];
      console.log('📊 React fiber found:', fiber);
      
      // Try to find workout data in component state
      let currentFiber = fiber;
      let workoutData = null;
      
      while (currentFiber && !workoutData) {
        if (currentFiber.memoizedProps?.workouts) {
          workoutData = currentFiber.memoizedProps.workouts;
          break;
        }
        if (currentFiber.memoizedState?.workouts) {
          workoutData = currentFiber.memoizedState.workouts;
          break;
        }
        currentFiber = currentFiber.return;
      }
      
      if (workoutData) {
        console.log('✅ Found workout data in React state:', workoutData);
        console.log(`📊 Workout count: ${workoutData.length}`);
        workoutData.slice(0, 3).forEach((workout, index) => {
          console.log(`🏋️ React Workout ${index + 1}:`, {
            id: workout.id,
            title: workout.title,
            exercises: workout.exercises?.length || 0,
            sections: workout.sections?.length || 0,
            workoutType: workout.workoutType,
            createdAt: workout.createdAt
          });
        });
      } else {
        console.warn('⚠️ No workout data found in React state');
      }
    } else {
      console.warn('⚠️ React fiber not found');
    }
  } else {
    console.warn('⚠️ Workout grid element not found');
  }
  
  console.groupEnd();
}

// 3. Check for console logs from our debugging
function checkDebugLogs() {
  console.group('🐛 Debug Log Analysis');
  console.log('Look for logs starting with:');
  console.log('🔍 Transforming Workout ID: [ID]');
  console.log('📥 Raw workout data: [data]');
  console.log('🏋️ Exercise extraction: [info]');
  console.log('📊 Final exercises array: [exercises]');
  console.log('📅 Date handling: [dates]');
  console.log('✨ Transformed workout: [workout]');
  console.groupEnd();
}

// 4. Check localStorage for any cached data
function checkLocalStorage() {
  console.group('💾 Local Storage Check');
  
  const relevantKeys = Object.keys(localStorage).filter(key => 
    key.includes('workout') || key.includes('fitcopilot')
  );
  
  console.log('🔑 Relevant localStorage keys:', relevantKeys);
  relevantKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      console.log(`📦 ${key}:`, JSON.parse(value));
    } catch (e) {
      console.log(`📦 ${key}:`, localStorage.getItem(key));
    }
  });
  
  console.groupEnd();
}

// Run all tests
async function runFullDebug() {
  console.log('🚀 Running full frontend workout debug...');
  
  await testDirectAPI();
  await testAuthenticationFix();
  checkReactState();
  checkDebugLogs();
  checkLocalStorage();
  
  console.log('✅ Debug complete! Check the logs above for issues.');
  console.log('💡 Tip: Refresh the page and run this again to see the transformation logs in real-time.');
}

// Auto-run if this script is executed
runFullDebug();

// 🔧 ADDITION: Test authentication fix
async function testAuthenticationFix() {
  console.group('🔧 Authentication Fix Test');
  
  // Check if fitcopilotData is available
  if (window.fitcopilotData) {
    console.log('✅ window.fitcopilotData found:', window.fitcopilotData);
    console.log('🔐 Nonce available:', !!window.fitcopilotData.nonce);
    console.log('📡 API Base:', window.fitcopilotData.apiBase);
    
    if (window.fitcopilotData.nonce) {
      console.log('🧪 Testing API with provided nonce...');
      
      try {
        const response = await fetch('/wp-json/fitcopilot/v1/workouts', {
          method: 'GET',
          headers: {
            'X-WP-Nonce': window.fitcopilotData.nonce,
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin'
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ SUCCESS! API authentication working with fitcopilotData.nonce');
          console.log('📊 Received workout data:', data);
          return true;
        } else {
          const errorText = await response.text();
          console.error('❌ Still getting error with fitcopilotData.nonce:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ Network error with fitcopilotData.nonce:', error);
      }
    } else {
      console.warn('⚠️ fitcopilotData found but no nonce available');
    }
  } else {
    console.warn('⚠️ window.fitcopilotData not found');
  }
  
  // Test the new global auth headers
  if (window.fitcopilotApiHeaders) {
    console.log('✅ window.fitcopilotApiHeaders found:', window.fitcopilotApiHeaders);
    
    try {
      console.log('🧪 Testing API with global auth headers...');
      const response = await fetch('/wp-json/fitcopilot/v1/workouts', {
        method: 'GET',
        headers: window.fitcopilotApiHeaders,
        credentials: 'same-origin'
      });
      
      console.log('📡 Response status with global headers:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SUCCESS! API authentication working with global headers');
        console.log('📊 Received workout data:', data);
        console.groupEnd();
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Still getting error with global headers:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Network error with global headers:', error);
    }
  } else {
    console.warn('⚠️ window.fitcopilotApiHeaders not found');
  }
  
  // Test wp.apiFetch if available
  if (window.wp && window.wp.apiFetch) {
    console.log('✅ wp.apiFetch available, testing...');
    
    try {
      const data = await window.wp.apiFetch({ path: '/fitcopilot/v1/workouts' });
      console.log('✅ SUCCESS! wp.apiFetch working with middleware');
      console.log('📊 Received workout data via wp.apiFetch:', data);
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('❌ wp.apiFetch failed:', error);
    }
  } else {
    console.warn('⚠️ wp.apiFetch not available');
  }
  
  console.log('💡 Manual test command available: window.debugWorkouts.manualApiTest()');
  console.groupEnd();
  return false;
}

// 🔧 ADDITION: Manual API test function
async function manualApiTest() {
  console.group('🔧 Manual API Test');
  
  // Get all available nonces and try them
  const nonceSources = [];
  
  // Try fitcopilotData
  if (window.fitcopilotData?.nonce) {
    nonceSources.push({ source: 'fitcopilotData', nonce: window.fitcopilotData.nonce });
  }
  
  // Try fitcopilotApiHeaders
  if (window.fitcopilotApiHeaders?.['X-WP-Nonce']) {
    nonceSources.push({ source: 'fitcopilotApiHeaders', nonce: window.fitcopilotApiHeaders['X-WP-Nonce'] });
  }
  
  // Try wpApiSettings
  if (window.wpApiSettings?.nonce) {
    nonceSources.push({ source: 'wpApiSettings', nonce: window.wpApiSettings.nonce });
  }
  
  // Try meta tag
  const nonceMeta = document.querySelector('meta[name="wp-rest-nonce"]');
  if (nonceMeta) {
    nonceSources.push({ source: 'meta tag', nonce: nonceMeta.getAttribute('content') });
  }
  
  console.log('🔍 Found nonce sources:', nonceSources);
  
  if (nonceSources.length === 0) {
    console.error('❌ No nonce sources found! This is the root cause of the 401 error.');
    console.log('💡 The WordPress admin page is not properly setting up REST API authentication.');
    console.groupEnd();
    return false;
  }
  
  // Test each nonce source
  for (const { source, nonce } of nonceSources) {
    console.log(`🧪 Testing nonce from ${source}: ${nonce.substring(0, 10)}...`);
    
    try {
      const response = await fetch('/wp-json/fitcopilot/v1/workouts', {
        method: 'GET',
        headers: {
          'X-WP-Nonce': nonce,
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });
      
      console.log(`📡 Response status (${source}):`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS! Working nonce from ${source}`);
        console.log('📊 Received workout data:', data);
        console.groupEnd();
        return true;
      } else {
        const errorText = await response.text();
        console.warn(`⚠️ Failed with ${source} nonce:`, response.status, errorText.substring(0, 200));
      }
    } catch (error) {
      console.error(`❌ Network error with ${source} nonce:`, error);
    }
  }
  
  console.error('❌ All nonce sources failed. Authentication setup is not working.');
  console.groupEnd();
  return false;
}

// 🔧 Story 2.1: Frontend Data Transformation Trace
async function debugWorkout218Transformation() {
  console.group('🔍 WORKOUT 218 TRANSFORMATION DEBUG');
  console.log('='.repeat(50));
  console.log('Starting comprehensive transformation analysis...');
  
  try {
    // Step 1: Test direct API call
    console.log('\n📡 Step 1: Direct API Call for Workout 218');
    console.log('-'.repeat(30));
    
    const nonce = window.fitcopilotData?.nonce || window.fitcopilotApiHeaders?.['X-WP-Nonce'] || '';
    
    if (!nonce) {
      console.error('❌ No authentication nonce found. Cannot proceed.');
      console.groupEnd();
      return;
    }
    
    console.log('🔐 Using nonce:', nonce.substring(0, 10) + '...');
    
    const apiResponse = await fetch('/wp-json/fitcopilot/v1/workouts/218', {
      method: 'GET',
      headers: {
        'X-WP-Nonce': nonce,
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });
    
    console.log('📡 API Response Status:', apiResponse.status);
    console.log('📡 API Response Headers:', Object.fromEntries(apiResponse.headers.entries()));
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ API call failed:', apiResponse.status, errorText);
      console.groupEnd();
      return;
    }
    
    const apiData = await apiResponse.json();
    console.log('✅ Raw API response:', apiData);
    
    // Step 2: Analyze API response structure
    console.log('\n📊 Step 2: API Response Structure Analysis');
    console.log('-'.repeat(40));
    
    const workoutData = apiData.data || apiData;
    console.log('📦 Extracted workout data:', workoutData);
    console.log('🔑 Available keys:', Object.keys(workoutData));
    
    // Step 3: Detailed field analysis
    console.log('\n🔬 Step 3: Field-by-Field Analysis');
    console.log('-'.repeat(35));
    
    const analyzeField = (fieldName, data) => {
      const value = data[fieldName];
      console.log(`\n${fieldName}:`);
      console.log(`  Type: ${typeof value}`);
      console.log(`  Is Array: ${Array.isArray(value)}`);
      console.log(`  Length/Value: ${Array.isArray(value) ? value.length : value}`);
      
      if (fieldName === 'workout_data' && value) {
        console.log(`  Raw value preview: ${typeof value === 'string' ? value.substring(0, 100) + '...' : 'Object'}`);
        
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            console.log(`  ✅ JSON Parse Success`);
            console.log(`  Parsed keys: ${Object.keys(parsed)}`);
            if (parsed.exercises) {
              console.log(`  Exercises in parsed data: ${Array.isArray(parsed.exercises) ? parsed.exercises.length : 'Not array'}`);
            }
            if (parsed.sections) {
              console.log(`  Sections in parsed data: ${Array.isArray(parsed.sections) ? parsed.sections.length : 'Not array'}`);
            }
          } catch (e) {
            console.log(`  ❌ JSON Parse Failed: ${e.message}`);
          }
        } else if (typeof value === 'object') {
          console.log(`  Object keys: ${Object.keys(value)}`);
          if (value.exercises) {
            console.log(`  Exercises in object: ${Array.isArray(value.exercises) ? value.exercises.length : 'Not array'}`);
          }
          if (value.sections) {
            console.log(`  Sections in object: ${Array.isArray(value.sections) ? value.sections.length : 'Not array'}`);
          }
        }
      }
      
      if (Array.isArray(value) && value.length > 0) {
        console.log(`  First item: ${JSON.stringify(value[0]).substring(0, 100)}...`);
      }
    };
    
    ['id', 'post_id', 'title', 'post_title', 'exercises', 'workout_data', 'sections', 'difficulty', 'duration'].forEach(field => {
      if (workoutData.hasOwnProperty(field)) {
        analyzeField(field, workoutData);
      }
    });
    
    // Step 4: Exercise extraction simulation
    console.log('\n🏋️ Step 4: Exercise Extraction Simulation');
    console.log('-'.repeat(45));
    
    let exercises = [];
    let extractionPath = 'none';
    const extractionLog = [];
    
    // Path 1: Root level exercises
    if (Array.isArray(workoutData.exercises) && workoutData.exercises.length > 0) {
      exercises = workoutData.exercises;
      extractionPath = 'root.exercises';
      extractionLog.push(`✅ Found ${exercises.length} exercises at root level`);
      console.log(`✅ PATH 1 SUCCESS: Root exercises (${exercises.length} found)`);
    }
    // Path 2: workout_data.exercises
    else if (workoutData.workout_data) {
      console.log('🔍 PATH 2: Trying workout_data extraction...');
      try {
        let workoutDataParsed = workoutData.workout_data;
        if (typeof workoutDataParsed === 'string') {
          console.log('🔄 Parsing workout_data string...');
          workoutDataParsed = JSON.parse(workoutDataParsed);
          console.log('✅ Successfully parsed workout_data');
        }
        
        if (Array.isArray(workoutDataParsed.exercises) && workoutDataParsed.exercises.length > 0) {
          exercises = workoutDataParsed.exercises;
          extractionPath = 'workout_data.exercises';
          extractionLog.push(`✅ Found ${exercises.length} exercises in workout_data.exercises`);
          console.log(`✅ PATH 2 SUCCESS: workout_data.exercises (${exercises.length} found)`);
        } else if (Array.isArray(workoutDataParsed.sections)) {
          console.log('🔍 PATH 2b: Trying sections within workout_data...');
          exercises = [];
          workoutDataParsed.sections.forEach((section, index) => {
            if (section.exercises && Array.isArray(section.exercises)) {
              console.log(`  Section ${index}: ${section.exercises.length} exercises`);
              exercises.push(...section.exercises);
            }
          });
          extractionPath = 'workout_data.sections.exercises';
          extractionLog.push(`✅ Extracted ${exercises.length} exercises from ${workoutDataParsed.sections.length} sections`);
          console.log(`✅ PATH 2b SUCCESS: workout_data.sections (${exercises.length} found)`);
        } else {
          console.log('❌ PATH 2 FAILED: No exercises in workout_data');
          console.log('  Available keys in workout_data:', Object.keys(workoutDataParsed));
        }
      } catch (e) {
        console.error(`❌ PATH 2 ERROR: Failed to parse workout_data: ${e.message}`);
        extractionLog.push(`❌ Failed to parse workout_data: ${e.message}`);
      }
    }
    // Path 3: Root level sections
    else if (workoutData.sections && Array.isArray(workoutData.sections)) {
      console.log('🔍 PATH 3: Trying root level sections...');
      exercises = [];
      workoutData.sections.forEach((section, index) => {
        if (section.exercises && Array.isArray(section.exercises)) {
          console.log(`  Section ${index}: ${section.exercises.length} exercises`);
          exercises.push(...section.exercises);
        }
      });
      extractionPath = 'root.sections.exercises';
      extractionLog.push(`✅ Extracted ${exercises.length} exercises from ${workoutData.sections.length} sections`);
      console.log(`✅ PATH 3 SUCCESS: root.sections (${exercises.length} found)`);
    } else {
      console.error('❌ ALL PATHS FAILED: No exercises found');
      extractionLog.push('❌ No exercises found in any location');
    }
    
    // Step 5: Exercise structure analysis
    console.log('\n📋 Step 5: Exercise Structure Analysis');
    console.log('-'.repeat(40));
    console.log(`Extraction path used: ${extractionPath}`);
    console.log(`Total exercises found: ${exercises.length}`);
    
    if (exercises.length > 0) {
      console.log('\n🔍 First exercise analysis:');
      const firstExercise = exercises[0];
      console.log('  Raw exercise:', firstExercise);
      console.log('  Exercise keys:', Object.keys(firstExercise || {}));
      console.log('  Exercise name:', firstExercise?.name);
      console.log('  Exercise type/structure:', {
        hasName: !!firstExercise?.name,
        hasDescription: !!firstExercise?.description,
        hasSets: !!firstExercise?.sets,
        hasReps: !!firstExercise?.reps,
        hasDuration: !!firstExercise?.duration,
        hasInstructions: !!firstExercise?.instructions,
        hasSection: !!firstExercise?.section
      });
      
      if (exercises.length > 1) {
        console.log('\n🔍 Exercise variety check:');
        const exerciseStructures = exercises.slice(0, 3).map(ex => Object.keys(ex || {}));
        console.log('  Exercise structures (first 3):', exerciseStructures);
      }
    } else {
      console.log('❌ No exercises to analyze');
    }
    
    // Step 6: Frontend transformation simulation
    console.log('\n✨ Step 6: Frontend Transformation Simulation');
    console.log('-'.repeat(50));
    
    // Simulate the transformWorkoutForDisplay function
    const transformedWorkout = {
      id: workoutData.id || workoutData.post_id || '218',
      title: workoutData.title || workoutData.post_title || 'Untitled Workout',
      description: workoutData.description || workoutData.notes || workoutData.post_content || '',
      duration: typeof workoutData.duration === 'number' ? workoutData.duration : 30,
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(workoutData.difficulty) ? workoutData.difficulty : 'intermediate',
      exercises: exercises,
      created_at: workoutData.post_date || workoutData.date || workoutData.created_at || new Date().toISOString(),
      updated_at: workoutData.post_modified || workoutData.modified || workoutData.updated_at || new Date().toISOString(),
      workoutType: 'General', // Simplified for debugging
      equipment: [],
      isCompleted: false,
      tags: [],
      createdAt: workoutData.post_date || workoutData.date || workoutData.created_at || new Date().toISOString(),
      lastModified: workoutData.post_modified || workoutData.modified || workoutData.updated_at || new Date().toISOString(),
      isFavorite: false
    };
    
    console.log('📊 Final transformed workout:', transformedWorkout);
    
    // Step 7: Validation and diagnosis
    console.log('\n✅ Step 7: Validation and Diagnosis');
    console.log('-'.repeat(40));
    
    const validationResults = {
      hasValidId: !!(transformedWorkout.id && transformedWorkout.id !== 'temp'),
      hasValidTitle: !!(transformedWorkout.title && transformedWorkout.title !== 'Untitled Workout'),
      hasValidExercises: !!(transformedWorkout.exercises && transformedWorkout.exercises.length > 0),
      hasValidDuration: !!(transformedWorkout.duration && transformedWorkout.duration > 0),
      hasValidDifficulty: ['beginner', 'intermediate', 'advanced'].includes(transformedWorkout.difficulty)
    };
    
    console.log('🔍 Validation Results:');
    Object.entries(validationResults).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? '✅ PASS' : '❌ FAIL'}`);
    });
    
    const overallSuccess = Object.values(validationResults).every(Boolean);
    console.log(`\n📊 Overall Transform Success: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (!validationResults.hasValidExercises) {
      console.log('\n🚨 ROOT CAUSE ANALYSIS:');
      console.log('❌ Exercise extraction failed for workout 218');
      console.log('📋 Extraction attempt log:', extractionLog.join(' | '));
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('1. Check database _workout_data format for workout 218');
      console.log('2. Verify normalize_workout_data() processing in PHP backend');
      console.log('3. Check for data corruption in WordPress database');
      console.log('4. Compare with working workout structure');
      console.log('5. Implement fallback logic for this data format');
    } else {
      console.log('\n✅ Transformation succeeded! If frontend still shows issues, check:');
      console.log('1. React component state management');
      console.log('2. Rendering logic in WorkoutGrid');
      console.log('3. Data flow through context providers');
    }
    
  } catch (error) {
    console.error('❌ Transformation debug failed:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Transformation debug complete!');
  console.groupEnd();
}

// 🔧 Story 2.2: Data Format Comparison Analysis
async function compareWorkout218WithWorking() {
  console.group('🔄 WORKOUT COMPARISON ANALYSIS');
  console.log('='.repeat(50));
  console.log('Comparing workout 218 with working workouts...');
  
  try {
    const nonce = window.fitcopilotData?.nonce || window.fitcopilotApiHeaders?.['X-WP-Nonce'] || '';
    
    if (!nonce) {
      console.error('❌ No authentication nonce found. Cannot proceed.');
      console.groupEnd();
      return;
    }
    
    // Get workout 218 (problematic)
    console.log('\n📊 Step 1: Fetching workout 218 (problematic)...');
    console.log('-'.repeat(45));
    
    const workout218Response = await fetch('/wp-json/fitcopilot/v1/workouts/218', {
      headers: { 'X-WP-Nonce': nonce, 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    
    if (!workout218Response.ok) {
      console.error(`❌ Failed to fetch workout 218: ${workout218Response.status}`);
      console.groupEnd();
      return;
    }
    
    const workout218 = await workout218Response.json();
    console.log('✅ Workout 218 fetched successfully');
    
    // Get a recent working workout
    console.log('\n📊 Step 2: Fetching recent working workouts...');
    console.log('-'.repeat(45));
    
    const workoutsResponse = await fetch('/wp-json/fitcopilot/v1/workouts?per_page=5', {
      headers: { 'X-WP-Nonce': nonce, 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    
    if (!workoutsResponse.ok) {
      console.error(`❌ Failed to fetch workouts list: ${workoutsResponse.status}`);
      console.groupEnd();
      return;
    }
    
    const workoutsList = await workoutsResponse.json();
    
    if (!workoutsList.data?.workouts?.length) {
      console.error('❌ No working workouts found for comparison');
      console.groupEnd();
      return;
    }
    
    // Find a working workout (not 218, has exercises)
    let workingWorkout = null;
    let workingWorkoutId = null;
    
    for (const workout of workoutsList.data.workouts) {
      if (workout.id != 218) {
        console.log(`🔍 Checking workout ${workout.id} for comparison...`);
        
        const testResponse = await fetch(`/wp-json/fitcopilot/v1/workouts/${workout.id}`, {
          headers: { 'X-WP-Nonce': nonce, 'Content-Type': 'application/json' },
          credentials: 'same-origin'
        });
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          const testWorkoutData = testData.data || testData;
          
          // Check if this workout has exercises
          let hasExercises = false;
          if (Array.isArray(testWorkoutData.exercises) && testWorkoutData.exercises.length > 0) {
            hasExercises = true;
          } else if (testWorkoutData.workout_data) {
            try {
              const workoutData = typeof testWorkoutData.workout_data === 'string' 
                ? JSON.parse(testWorkoutData.workout_data) 
                : testWorkoutData.workout_data;
              if (Array.isArray(workoutData.exercises) && workoutData.exercises.length > 0) {
                hasExercises = true;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
          
          if (hasExercises) {
            workingWorkout = testData;
            workingWorkoutId = workout.id;
            console.log(`✅ Found working workout ${workingWorkoutId} for comparison`);
            break;
          }
        }
      }
    }
    
    if (!workingWorkout) {
      console.error('❌ No working workout found for comparison');
      console.groupEnd();
      return;
    }
    
    // Compare structures
    console.log('\n🔍 Step 3: Structure Comparison');
    console.log('-'.repeat(35));
    
    const w218Data = workout218.data || workout218;
    const workingData = workingWorkout.data || workingWorkout;
    
    console.log('📋 Data Structure Comparison:');
    console.log(`Workout 218 keys: [${Object.keys(w218Data).join(', ')}]`);
    console.log(`Working workout keys: [${Object.keys(workingData).join(', ')}]`);
    
    // Find key differences
    const w218Keys = Object.keys(w218Data);
    const workingKeys = Object.keys(workingData);
    const missingIn218 = workingKeys.filter(key => !w218Keys.includes(key));
    const extraIn218 = w218Keys.filter(key => !workingKeys.includes(key));
    
    if (missingIn218.length > 0) {
      console.log(`⚠️ Missing in 218: [${missingIn218.join(', ')}]`);
    }
    if (extraIn218.length > 0) {
      console.log(`ℹ️ Extra in 218: [${extraIn218.join(', ')}]`);
    }
    if (missingIn218.length === 0 && extraIn218.length === 0) {
      console.log('✅ Both workouts have identical key structures');
    }
    
    // Compare specific critical fields
    console.log('\n🔬 Step 4: Critical Field Comparison');
    console.log('-'.repeat(40));
    
    const compareField = (field) => {
      const w218Value = w218Data[field];
      const workingValue = workingData[field];
      
      console.log(`\n📋 ${field.toUpperCase()}:`);
      console.log(`  218: ${typeof w218Value} - ${Array.isArray(w218Value) ? `Array(${w218Value.length})` : w218Value}`);
      console.log(`  Working: ${typeof workingValue} - ${Array.isArray(workingValue) ? `Array(${workingValue.length})` : workingValue}`);
      
      const typesMatch = typeof w218Value === typeof workingValue;
      const arraysMatch = Array.isArray(w218Value) === Array.isArray(workingValue);
      
      if (!typesMatch || !arraysMatch) {
        console.log(`  🚨 TYPE MISMATCH detected!`);
        return false;
      } else {
        console.log(`  ✅ Types match`);
        return true;
      }
    };
    
    const criticalFields = ['exercises', 'sections', 'workout_data', 'title', 'difficulty', 'duration'];
    const fieldComparisons = {};
    
    criticalFields.forEach(field => {
      fieldComparisons[field] = compareField(field);
    });
    
    // Deep dive into workout_data
    console.log('\n🔬 Step 5: workout_data Deep Analysis');
    console.log('-'.repeat(40));
    
    const analyzeWorkoutData = (data, label) => {
      console.log(`\n${label.toUpperCase()} workout_data analysis:`);
      if (!data.workout_data) {
        console.log('  ❌ No workout_data field');
        return { hasData: false };
      }
      
      const result = { hasData: true };
      
      let workoutData = data.workout_data;
      if (typeof workoutData === 'string') {
        try {
          workoutData = JSON.parse(workoutData);
          console.log('  ✅ Successfully parsed JSON string');
          result.parseSuccess = true;
        } catch (e) {
          console.log(`  ❌ Failed to parse JSON: ${e.message}`);
          result.parseSuccess = false;
          return result;
        }
      } else {
        console.log('  ℹ️ Already an object');
        result.parseSuccess = true;
      }
      
      result.keys = Object.keys(workoutData);
      result.exerciseCount = workoutData.exercises?.length || 0;
      result.sectionCount = workoutData.sections?.length || 0;
      result.format = workoutData.metadata?.format || 'Unknown';
      
      console.log(`  Keys: [${result.keys.join(', ')}]`);
      console.log(`  Exercises: ${result.exerciseCount}`);
      console.log(`  Sections: ${result.sectionCount}`);
      console.log(`  Format: ${result.format}`);
      
      return result;
    };
    
    const w218Analysis = analyzeWorkoutData(w218Data, 'workout 218');
    const workingAnalysis = analyzeWorkoutData(workingData, 'working workout');
    
    // Transformation test comparison
    console.log('\n🔄 Step 6: Transformation Test Comparison');
    console.log('-'.repeat(45));
    
    const testTransform = (data, label) => {
      console.log(`\n🔧 Transforming ${label}:`);
      
      let exercises = [];
      let path = 'none';
      
      // Root exercises
      if (Array.isArray(data.exercises) && data.exercises.length > 0) {
        exercises = data.exercises;
        path = 'root.exercises';
        console.log(`  ✅ Root exercises: ${exercises.length}`);
      } 
      // workout_data exercises
      else if (data.workout_data) {
        let workoutData = data.workout_data;
        if (typeof workoutData === 'string') {
          try {
            workoutData = JSON.parse(workoutData);
          } catch (e) {
            console.log(`  ❌ Parse failed: ${e.message}`);
            return { success: false, exerciseCount: 0, path: 'parse_error' };
          }
        }
        
        if (Array.isArray(workoutData.exercises) && workoutData.exercises.length > 0) {
          exercises = workoutData.exercises;
          path = 'workout_data.exercises';
          console.log(`  ✅ workout_data exercises: ${exercises.length}`);
        } 
        // sections
        else if (Array.isArray(workoutData.sections)) {
          workoutData.sections.forEach((section) => {
            if (section.exercises && Array.isArray(section.exercises)) {
              exercises.push(...section.exercises);
            }
          });
          path = 'workout_data.sections.exercises';
          console.log(`  ✅ Section exercises: ${exercises.length}`);
        }
      }
      
      const success = exercises.length > 0;
      console.log(`  📊 Result: ${success ? '✅ SUCCESS' : '❌ FAILED'} (${exercises.length} exercises via ${path})`);
      
      return { success, exerciseCount: exercises.length, path, exercises: exercises.slice(0, 2) };
    };
    
    const w218Transform = testTransform(w218Data, 'Workout 218');
    const workingTransform = testTransform(workingData, 'Working Workout');
    
    // Final diagnosis
    console.log('\n📊 Step 7: Final Diagnosis');
    console.log('-'.repeat(30));
    
    console.log('🔍 TRANSFORMATION RESULTS:');
    console.log(`Workout 218: ${w218Transform.success ? '✅ SUCCESS' : '❌ FAILED'} (${w218Transform.exerciseCount} exercises)`);
    console.log(`Working Workout: ${workingTransform.success ? '✅ SUCCESS' : '❌ FAILED'} (${workingTransform.exerciseCount} exercises)`);
    
    if (!w218Transform.success && workingTransform.success) {
      console.log('\n🚨 ROOT CAUSE IDENTIFIED:');
      console.log('Workout 218 has a different/incompatible data structure');
      
      console.log('\n📋 KEY DIFFERENCES:');
      console.log(`• Data extraction path: 218="${w218Transform.path}" vs Working="${workingTransform.path}"`);
      console.log(`• workout_data format: 218="${w218Analysis.format}" vs Working="${workingAnalysis.format}"`);
      console.log(`• Structure compatibility: ${fieldComparisons.workout_data ? 'Compatible' : 'Incompatible'}`);
      
      console.log('\n💡 RECOMMENDED FIXES:');
      console.log('1. Update normalize_workout_data() to handle workout 218 format');
      console.log('2. Migrate workout 218 to standard format in database');
      console.log('3. Add fallback logic in transformWorkoutForDisplay()');
      console.log('4. Implement data validation in save process');
    } else if (w218Transform.success && workingTransform.success) {
      console.log('\n🤔 UNEXPECTED RESULT:');
      console.log('Both workouts transform successfully, but 218 still shows issues');
      console.log('The problem may be in:');
      console.log('1. React component rendering logic');
      console.log('2. State management or context providers');
      console.log('3. Timing/caching issues');
      console.log('4. UI display logic rather than data transformation');
    }
    
  } catch (error) {
    console.error('❌ Comparison analysis failed:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Comparison analysis complete!');
  console.groupEnd();
}

// 🔧 Story 2.1 & 2.2: Complete Frontend Analysis
async function runCompleteFrontendAnalysis() {
  console.clear();
  console.log('🚀 STARTING COMPLETE FRONTEND TRANSFORMATION ANALYSIS');
  console.log('='.repeat(60));
  console.log('This will analyze workout 218 transformation issues comprehensively');
  console.log('');
  
  // Run both analysis functions
  await debugWorkout218Transformation();
  console.log('\n');
  await compareWorkout218WithWorking();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ COMPLETE FRONTEND ANALYSIS FINISHED');
  console.log('Review the detailed logs above to understand the transformation issues.');
  console.log('');
  console.log('Available functions for manual testing:');
  console.log('• window.debugWorkouts.debugWorkout218Transformation()');
  console.log('• window.debugWorkouts.compareWorkout218WithWorking()');
  console.log('• window.debugWorkouts.manualApiTest()');
}

// Export functions for manual use
window.debugWorkouts = {
  testDirectAPI,
  testAuthenticationFix,
  checkReactState,
  checkDebugLogs,
  checkLocalStorage,
  runFullDebug,
  manualApiTest,
  debugWorkout218Transformation,
  compareWorkout218WithWorking,
  runCompleteFrontendAnalysis
};

console.log('🔧 Debug functions available on window.debugWorkouts'); 