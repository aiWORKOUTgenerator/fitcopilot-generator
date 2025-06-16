// Test script to debug WorkoutSelectionSummary data flow
// Run this in browser console when viewing a workout in UnifiedWorkoutModal

console.log('🔍 DEBUGGING WorkoutSelectionSummary Data Flow');

// 1. Check if WorkoutSelectionSummary component exists
const summaryElement = document.querySelector('.workout-selection-summary');
if (summaryElement) {
    console.log('✅ WorkoutSelectionSummary component found');
} else {
    console.log('❌ WorkoutSelectionSummary component NOT found');
}

// 2. Check React DevTools for component props
if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('✅ React DevTools available');
    
    // Try to find the component instance
    const reactFiber = summaryElement?._reactInternalFiber || summaryElement?.__reactInternalInstance;
    if (reactFiber) {
        console.log('✅ React fiber found');
        console.log('Props:', reactFiber.memoizedProps);
    }
}

// 3. Check for workout data in global scope or localStorage
console.log('📊 Checking for workout data sources:');

// Check localStorage
const sessionInputs = localStorage.getItem('workoutGeneratorInputs');
if (sessionInputs) {
    console.log('✅ sessionInputs in localStorage:', JSON.parse(sessionInputs));
} else {
    console.log('❌ No sessionInputs in localStorage');
}

// Check sessionStorage
const sessionData = sessionStorage.getItem('workoutGeneratorInputs');
if (sessionData) {
    console.log('✅ sessionInputs in sessionStorage:', JSON.parse(sessionData));
} else {
    console.log('❌ No sessionInputs in sessionStorage');
}

// 4. Check for workout data in DOM attributes
const workoutElements = document.querySelectorAll('[data-workout-id], [data-workout]');
console.log(`📋 Found ${workoutElements.length} elements with workout data`);

workoutElements.forEach((el, index) => {
    console.log(`Element ${index + 1}:`, {
        id: el.dataset.workoutId,
        workout: el.dataset.workout,
        element: el
    });
});

// 5. Check for API calls in network tab
console.log('🌐 Check Network tab for recent API calls to:');
console.log('- /wp-json/fitcopilot/v1/workouts/');
console.log('- /wp-json/fitcopilot/v1/generate');

// 6. Manual data inspection
console.log('🔧 Manual inspection commands:');
console.log('Run these in console:');
console.log('1. Check workout data: window.currentWorkout');
console.log('2. Check profile data: window.userProfile');
console.log('3. Check form state: window.workoutFormState');

// 7. Look for specific data points
console.log('🎯 Looking for specific data points:');
console.log('Expected: fitness_level = "advanced"');
console.log('Expected: exercise_complexity = "advanced"');

// Check if data is in component state
const checkComponentState = () => {
    const summaryComponent = document.querySelector('.workout-selection-summary');
    if (summaryComponent && summaryComponent._reactInternalFiber) {
        const props = summaryComponent._reactInternalFiber.memoizedProps;
        console.log('🎯 Component Props:', props);
        
        if (props.workout) {
            console.log('📊 Workout Data:', props.workout);
            console.log('🏋️ fitness_level:', props.workout.fitness_level);
            console.log('🔧 exercise_complexity:', props.workout.exercise_complexity);
            console.log('📝 sessionInputs:', props.workout.sessionInputs);
        }
    }
};

checkComponentState();

console.log('🔍 Debug complete. Check the logs above for data flow issues.'); 