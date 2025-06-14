/**
 * Muscle Selection Storage Reset Script
 * 
 * This script clears all corrupted muscle selection data from storage
 * and resets the system to a clean state to fix the hardcoded "Chest/Arms" issue.
 * 
 * Usage: Run this in browser console on WorkoutGeneratorGrid page
 */

console.log('🧹 MUSCLE SELECTION STORAGE RESET');
console.log('='.repeat(50));

// Function to clear all muscle-related storage
function clearMuscleStorage() {
  console.log('🗑️ Clearing all muscle selection storage...');
  
  // 1. Clear localStorage muscle data
  const localStorageKeys = Object.keys(localStorage);
  const muscleKeys = localStorageKeys.filter(key => 
    key.includes('muscle') || 
    key.includes('fitcopilot_muscle') ||
    key.includes('target_muscle') ||
    key.includes('muscle_selection')
  );
  
  console.log('📦 Found localStorage muscle keys:', muscleKeys);
  muscleKeys.forEach(key => {
    console.log(`   Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  // 2. Clear sessionStorage workout data
  const sessionStorageKeys = Object.keys(sessionStorage);
  const workoutKeys = sessionStorageKeys.filter(key => 
    key.includes('workout') || 
    key.includes('fitcopilot') ||
    key.includes('muscle')
  );
  
  console.log('📦 Found sessionStorage workout keys:', workoutKeys);
  workoutKeys.forEach(key => {
    console.log(`   Removing: ${key}`);
    sessionStorage.removeItem(key);
  });
  
  // 3. Clear specific known storage keys
  const knownKeys = [
    'fitcopilot_muscle_selection',
    'fitcopilot_workout_form',
    'workout_form_data',
    'muscle_selection_data',
    'target_muscle_selection'
  ];
  
  console.log('🎯 Clearing known muscle storage keys...');
  knownKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`   Removing localStorage: ${key}`);
      localStorage.removeItem(key);
    }
    if (sessionStorage.getItem(key)) {
      console.log(`   Removing sessionStorage: ${key}`);
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('✅ Storage clearing complete');
}

// Function to reset muscle selection API data
async function resetMuscleSelectionAPI() {
  console.log('🔄 Resetting muscle selection API data...');
  
  try {
    // Clear muscle selection via API
    const response = await fetch('/wp-json/fitcopilot/v1/muscle-selection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedGroups: [],
        selectedMuscles: {}
      })
    });
    
    const result = await response.json();
    console.log('📡 API reset result:', result);
    
    if (result.success) {
      console.log('✅ API muscle selection cleared successfully');
    } else {
      console.log('❌ API reset failed:', result.message);
    }
  } catch (error) {
    console.log('❌ API reset error:', error.message);
  }
}

// Function to reset React component state
function resetReactComponentState() {
  console.log('⚛️ Attempting to reset React component state...');
  
  // Try to find and reset muscle selection components
  const muscleCards = document.querySelectorAll('[data-muscle-group]');
  console.log(`Found ${muscleCards.length} muscle group buttons`);
  
  // Remove any selected states
  muscleCards.forEach((button, index) => {
    const muscleGroup = button.dataset.muscleGroup || button.textContent?.toLowerCase();
    
    // Remove selected classes
    button.classList.remove('selected', 'active', 'chosen');
    
    // Reset aria-pressed if present
    if (button.hasAttribute('aria-pressed')) {
      button.setAttribute('aria-pressed', 'false');
    }
    
    console.log(`   Reset button ${index + 1}: ${muscleGroup}`);
  });
  
  // Try to find and clear muscle chips/pills
  const muscleChips = document.querySelectorAll('.muscle-group-chip, .muscle-pill, .selected-muscle');
  console.log(`Found ${muscleChips.length} muscle chips to remove`);
  
  muscleChips.forEach((chip, index) => {
    console.log(`   Removing chip ${index + 1}: ${chip.textContent}`);
    chip.remove();
  });
  
  console.log('✅ React component state reset complete');
}

// Function to force page refresh to ensure clean state
function forceCleanRefresh() {
  console.log('🔄 Forcing clean page refresh...');
  
  // Clear any remaining cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('fitcopilot') || name.includes('workout')) {
          console.log(`   Clearing cache: ${name}`);
          caches.delete(name);
        }
      });
    });
  }
  
  // Force hard refresh
  setTimeout(() => {
    console.log('🔄 Refreshing page in 2 seconds...');
    window.location.reload(true);
  }, 2000);
}

// Function to verify clean state
function verifyCleanState() {
  console.log('🔍 Verifying clean state...');
  
  // Check localStorage
  const remainingLocalKeys = Object.keys(localStorage).filter(key => 
    key.includes('muscle') || key.includes('fitcopilot')
  );
  
  // Check sessionStorage
  const remainingSessionKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('muscle') || key.includes('workout') || key.includes('fitcopilot')
  );
  
  console.log('📊 Verification Results:');
  console.log(`   Remaining localStorage keys: ${remainingLocalKeys.length}`);
  console.log(`   Remaining sessionStorage keys: ${remainingSessionKeys.length}`);
  
  if (remainingLocalKeys.length > 0) {
    console.log('   LocalStorage keys:', remainingLocalKeys);
  }
  
  if (remainingSessionKeys.length > 0) {
    console.log('   SessionStorage keys:', remainingSessionKeys);
  }
  
  if (remainingLocalKeys.length === 0 && remainingSessionKeys.length === 0) {
    console.log('✅ Clean state verified - no muscle data remaining');
  } else {
    console.log('⚠️ Some data still present - may need manual cleanup');
  }
}

// Main reset function
async function performCompleteReset() {
  console.log('🚀 STARTING COMPLETE MUSCLE SELECTION RESET');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Clear all storage
    clearMuscleStorage();
    
    // Step 2: Reset API data
    await resetMuscleSelectionAPI();
    
    // Step 3: Reset React component state
    resetReactComponentState();
    
    // Step 4: Verify clean state
    verifyCleanState();
    
    console.log('✅ RESET COMPLETE - System should now be clean');
    console.log('💡 Try selecting Back + Arms again to test');
    
    // Optional: Force refresh for complete clean state
    const shouldRefresh = confirm('Reset complete! Refresh page for completely clean state?');
    if (shouldRefresh) {
      forceCleanRefresh();
    }
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  }
}

// Quick fix function for immediate testing
function quickFix() {
  console.log('⚡ QUICK FIX: Clearing muscle selection storage');
  
  // Clear the main storage key
  localStorage.removeItem('fitcopilot_muscle_selection');
  sessionStorage.removeItem('fitcopilot_workout_form');
  
  // Reset any visible muscle buttons
  document.querySelectorAll('[data-muscle-group]').forEach(button => {
    button.classList.remove('selected', 'active', 'chosen');
    if (button.hasAttribute('aria-pressed')) {
      button.setAttribute('aria-pressed', 'false');
    }
  });
  
  console.log('✅ Quick fix complete - try selecting muscles again');
}

// Export functions for manual use
window.muscleResetFunctions = {
  performCompleteReset,
  quickFix,
  clearMuscleStorage,
  resetMuscleSelectionAPI,
  resetReactComponentState,
  verifyCleanState
};

console.log('💡 AVAILABLE FUNCTIONS:');
console.log('- window.muscleResetFunctions.performCompleteReset() // Complete reset');
console.log('- window.muscleResetFunctions.quickFix() // Quick storage clear');
console.log('- window.muscleResetFunctions.verifyCleanState() // Check current state');

// Auto-run quick fix
console.log('🎬 Auto-running quick fix...');
quickFix(); 