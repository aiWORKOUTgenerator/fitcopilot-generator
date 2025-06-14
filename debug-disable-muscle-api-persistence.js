/**
 * Disable Muscle API Persistence Script
 * 
 * This script temporarily disables the muscle selection API persistence
 * to prevent corrupted "Chest/Arms" data from being loaded on initialization.
 * 
 * Usage: Run this in browser console BEFORE making muscle selections
 */

console.log('🚫 DISABLING MUSCLE API PERSISTENCE');
console.log('='.repeat(50));

// Function to disable API persistence in muscle integration
function disableMuscleApiPersistence() {
  console.log('🔧 Attempting to disable muscle API persistence...');
  
  // Try to find and modify the muscle integration configuration
  try {
    // Method 1: Override the API load function to return null
    if (window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        // Intercept muscle selection API calls
        if (url && url.includes('/wp-json/fitcopilot/v1/muscle-selection')) {
          console.log('🚫 Intercepted muscle selection API call:', url);
          
          // For GET requests (loading), return empty data
          if (!options || !options.method || options.method === 'GET') {
            console.log('   Returning empty muscle selection data');
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                data: {
                  selectedGroups: [],
                  selectedMuscles: {}
                }
              })
            });
          }
          
          // For POST requests (saving), allow but log
          if (options.method === 'POST') {
            console.log('   Allowing muscle selection save:', options.body);
          }
        }
        
        // For all other requests, use original fetch
        return originalFetch.apply(this, arguments);
      };
      
      console.log('✅ API interception enabled');
    }
    
    // Method 2: Clear any existing muscle selection data from storage
    localStorage.removeItem('fitcopilot_muscle_selection');
    sessionStorage.removeItem('fitcopilot_workout_form');
    
    // Method 3: Try to access and modify React component state
    const muscleCards = document.querySelectorAll('[data-muscle-group]');
    console.log(`Found ${muscleCards.length} muscle group buttons to reset`);
    
    muscleCards.forEach((button, index) => {
      button.classList.remove('selected', 'active', 'chosen');
      if (button.hasAttribute('aria-pressed')) {
        button.setAttribute('aria-pressed', 'false');
      }
    });
    
    console.log('✅ Muscle API persistence disabled');
    console.log('💡 Now try selecting Back + Arms again');
    
  } catch (error) {
    console.error('❌ Failed to disable API persistence:', error);
  }
}

// Function to restore normal API behavior
function restoreMuscleApiPersistence() {
  console.log('🔄 Restoring normal muscle API persistence...');
  
  // Restore original fetch if we modified it
  if (window.originalFetch) {
    window.fetch = window.originalFetch;
    delete window.originalFetch;
    console.log('✅ Original fetch restored');
  } else {
    console.log('⚠️ No modified fetch found to restore');
  }
}

// Function to test muscle selection without API interference
function testMuscleSelectionClean() {
  console.log('🧪 Testing clean muscle selection...');
  
  // Clear all storage
  localStorage.removeItem('fitcopilot_muscle_selection');
  sessionStorage.removeItem('fitcopilot_workout_form');
  
  // Reset all muscle buttons
  document.querySelectorAll('[data-muscle-group]').forEach(button => {
    button.classList.remove('selected', 'active', 'chosen');
    if (button.hasAttribute('aria-pressed')) {
      button.setAttribute('aria-pressed', 'false');
    }
  });
  
  console.log('✅ Clean state prepared');
  console.log('💡 Instructions:');
  console.log('   1. Select "Back" muscle group');
  console.log('   2. Select "Arms" muscle group');
  console.log('   3. Check console for correct data flow');
  console.log('   4. Proceed to Premium Preview');
}

// Export functions for manual use
window.muscleApiDebugFunctions = {
  disableMuscleApiPersistence,
  restoreMuscleApiPersistence,
  testMuscleSelectionClean
};

console.log('💡 AVAILABLE FUNCTIONS:');
console.log('- window.muscleApiDebugFunctions.disableMuscleApiPersistence() // Disable API loading');
console.log('- window.muscleApiDebugFunctions.testMuscleSelectionClean() // Clean test');
console.log('- window.muscleApiDebugFunctions.restoreMuscleApiPersistence() // Restore normal behavior');

// Auto-run the disable function
console.log('🎬 Auto-running API persistence disable...');
disableMuscleApiPersistence(); 