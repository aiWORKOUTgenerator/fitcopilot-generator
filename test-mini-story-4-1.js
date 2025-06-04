/**
 * MINI-STORY 4.1 TEST: Fix Data Transformation
 * 
 * This test verifies the convertToEditorFormat function properly maps
 * workout.id to postId, preventing duplicate workout creation.
 * 
 * Run this in browser console on WordPress admin page to test the fix.
 */

console.clear();
console.log('🧪 MINI-STORY 4.1 TEST: Fix Data Transformation');
console.log('='.repeat(60));

// Test data simulating WordPress API response with workout ID
const testWorkoutFromApi = {
  id: 123, // ← This comes from WordPress API
  title: 'Test Workout From API',
  difficulty: 'intermediate',
  duration: 30,
  equipment: ['dumbbells'],
  goals: ['strength'],
  exercises: [
    {
      name: 'Push-ups',
      sets: 3,
      reps: 10,
      description: 'Standard push-ups'
    },
    {
      name: 'Squats', 
      sets: 3,
      reps: 15,
      description: 'Bodyweight squats'
    }
  ]
};

// Test the fix by importing and calling convertToEditorFormat
async function testMiniStory41() {
  console.group('🔧 Testing Mini-Story 4.1 Fix');
  
  try {
    // Import the fixed convertToEditorFormat function
    const { convertToEditorFormat } = await import('./src/features/workout-generator/types/editor.js');
    
    console.log('✅ Successfully imported convertToEditorFormat');
    
    // TEST 1: Existing workout with ID (should have postId)
    console.log('\n📋 TEST 1: Existing workout with ID');
    const existingWorkoutData = convertToEditorFormat(testWorkoutFromApi);
    
    console.log('Input workout.id:', testWorkoutFromApi.id);
    console.log('Output postId:', existingWorkoutData.postId);
    console.log('Is existing workout?', existingWorkoutData.postId !== undefined);
    console.log('Will save correctly?', existingWorkoutData.postId === 123);
    
    // Validation
    if (existingWorkoutData.postId === 123) {
      console.log('✅ SUCCESS: postId correctly mapped from workout.id');
    } else {
      console.error('❌ FAILED: postId not mapped correctly');
      console.error('Expected: 123, Got:', existingWorkoutData.postId);
    }
    
    // TEST 2: New workout without ID (should not have postId)
    console.log('\n📋 TEST 2: New workout without ID');
    const newWorkoutFromApi = { ...testWorkoutFromApi };
    delete newWorkoutFromApi.id; // Remove ID to simulate new workout
    
    const newWorkoutData = convertToEditorFormat(newWorkoutFromApi);
    
    console.log('Input workout.id:', newWorkoutFromApi.id);
    console.log('Output postId:', newWorkoutData.postId);
    console.log('Is new workout?', newWorkoutData.postId === undefined);
    
    // Validation
    if (newWorkoutData.postId === undefined) {
      console.log('✅ SUCCESS: New workout correctly has no postId');
    } else {
      console.error('❌ FAILED: New workout should not have postId');
    }
    
    // TEST 3: String ID (WordPress sometimes returns string IDs)
    console.log('\n📋 TEST 3: String ID from WordPress');
    const stringIdWorkout = { ...testWorkoutFromApi, id: "456" };
    const stringIdData = convertToEditorFormat(stringIdWorkout);
    
    console.log('Input workout.id (string):', stringIdWorkout.id);
    console.log('Output postId (number):', stringIdData.postId);
    console.log('Correctly converted?', stringIdData.postId === 456);
    
    // Validation
    if (stringIdData.postId === 456) {
      console.log('✅ SUCCESS: String ID correctly converted to number');
    } else {
      console.error('❌ FAILED: String ID not converted properly');
    }
    
    // SUMMARY
    console.log('\n📊 MINI-STORY 4.1 TEST SUMMARY:');
    console.log('='.repeat(40));
    
    const allTestsPassed = 
      existingWorkoutData.postId === 123 &&
      newWorkoutData.postId === undefined &&
      stringIdData.postId === 456;
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! Mini-Story 4.1 fix is working correctly.');
      console.log('✅ Existing workouts will UPDATE (not create duplicates)');
      console.log('✅ New workouts will CREATE properly'); 
      console.log('✅ String IDs handled correctly');
    } else {
      console.error('❌ SOME TESTS FAILED! Fix needs additional work.');
    }
    
    return allTestsPassed;
    
  } catch (error) {
    console.error('❌ Error testing Mini-Story 4.1:', error);
    return false;
  } finally {
    console.groupEnd();
  }
}

// Run the test
testMiniStory41().then(success => {
  if (success) {
    console.log('\n🚀 Mini-Story 4.1 is ready for real-world testing!');
    console.log('Next: Test with actual WordPress workouts in the editor');
  } else {
    console.log('\n🔧 Mini-Story 4.1 needs additional fixes');
  }
}); 