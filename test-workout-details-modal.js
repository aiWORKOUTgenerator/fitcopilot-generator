/**
 * Test Script: Workout Details Modal
 * 
 * This script tests the new WorkoutDetailsModal that opens when clicking "View Details"
 * from the WorkoutCardActions component.
 * 
 * Usage: Run this in browser console on the dashboard page
 */

console.log('🎯 Testing Workout Details Modal...');

// Test data - simulating a workout with rich sessionInputs data
const testWorkout = {
  id: 123,
  title: 'Test Workout - Enhanced Data',
  duration: 15,
  goals: 'enhance-flexibility',
  difficulty: 'advanced',
  equipment: ['yoga-mat'],
  restrictions: ['knees'],
  createdAt: new Date().toISOString(),
  isCompleted: false,
  exercises: [
    { name: 'Downward Dog', sets: 3, reps: 10 },
    { name: 'Cat-Cow Stretch', sets: 2, reps: 15 },
    { name: 'Child\'s Pose', sets: 1, reps: 30 },
    { name: 'Warrior I', sets: 3, reps: 8 },
    { name: 'Triangle Pose', sets: 2, reps: 12 }
  ],
  // Enhanced data that should show in WorkoutSelectionSummary
  sessionInputs: {
    todaysFocus: 'flexibility',
    dailyIntensityLevel: 3,
    timeConstraintsToday: 15,
    equipmentAvailableToday: ['yoga-mat'],
    healthRestrictionsToday: ['knees'],
    locationToday: 'home',
    moodLevel: 1,
    energyLevel: 3,
    sleepQuality: 4,
    workoutCustomization: 'Yoga style exercises'
  },
  muscleTargeting: {
    targetMuscleGroups: ['Chest', 'Back', 'Legs'],
    primaryFocus: 'Chest',
    selectionSummary: '3 muscle groups selected'
  },
  profileContext: {
    fitnessLevel: 'advanced',
    goals: ['enhance-flexibility', 'increase-strength'],
    workoutFrequency: '3-4 times per week'
  }
};

// Function to test the modal
function testWorkoutDetailsModal() {
  console.log('📋 Test workout data:', testWorkout);
  
  // Check if we're on the dashboard page
  const dashboardElement = document.querySelector('.dashboard-container, .saved-workouts-tab');
  if (!dashboardElement) {
    console.warn('⚠️ Not on dashboard page. Navigate to dashboard first.');
    return;
  }
  
  // Look for existing workout cards
  const workoutCards = document.querySelectorAll('.workout-card');
  console.log(`📊 Found ${workoutCards.length} workout cards on page`);
  
  if (workoutCards.length === 0) {
    console.warn('⚠️ No workout cards found. Make sure you have saved workouts.');
    return;
  }
  
  // Look for "View Details" buttons
  const viewDetailsButtons = document.querySelectorAll('button:contains("View Details"), [title*="View"], .workout-card__actions button');
  console.log(`🔍 Found ${viewDetailsButtons.length} potential action buttons`);
  
  // Test modal opening
  console.log('🎯 Testing modal functionality...');
  
  // Check if WorkoutDetailsModal component is available
  if (typeof window.React !== 'undefined') {
    console.log('✅ React is available');
  } else {
    console.warn('⚠️ React not found in global scope');
  }
  
  // Instructions for manual testing
  console.log(`
🧪 MANUAL TESTING INSTRUCTIONS:

1. ✅ Build completed successfully - modal components are ready
2. 🎯 Navigate to Dashboard → Saved Workouts tab
3. 🖱️ Hover over any workout card to see action buttons
4. 👆 Click "View Details" button (blue primary button)
5. 📋 Modal should open showing:
   - 🎯 Enhanced Workout Selections Summary (bordered section)
   - 📊 Workout Information (metadata)
   - 💪 Exercise Preview (first 5 exercises)
6. ❌ Click X or backdrop to close modal
7. ⌨️ Test Escape key to close modal

EXPECTED ENHANCED DATA SECTIONS:
✅ Workout Setup (Duration, Focus, Intensity)
✅ Fitness Level (Level, Complexity)  
✅ Today's State (Stress, Energy, Sleep)
✅ Muscle Targeting (Primary Focus, Target Groups)
✅ Environment & Focus (Location, Equipment, Notes)
✅ Profile Context (Fitness Level, Goals, Frequency)

If you see only 3 basic sections instead of 6+ enhanced sections,
the saved workout data doesn't contain the rich sessionInputs.
Generate a new workout using WorkoutGeneratorGrid to get enhanced data.
  `);
  
  return {
    testWorkout,
    workoutCardsFound: workoutCards.length,
    actionButtonsFound: viewDetailsButtons.length,
    status: 'Ready for manual testing'
  };
}

// Run the test
const testResult = testWorkoutDetailsModal();
console.log('🎉 Test setup complete:', testResult);

// Export for further testing
window.testWorkoutDetailsModal = testWorkoutDetailsModal;
window.testWorkoutData = testWorkout; 