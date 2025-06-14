/**
 * Clear Corrupted Muscle Selection API Data
 * 
 * This script clears the corrupted "Chest/Arms" muscle selection data 
 * from the API persistence layer and resets the system to a clean state.
 * 
 * Usage: Run this in browser console after deploying the fixes
 */

console.log('🧹 CLEARING CORRUPTED MUSCLE SELECTION API DATA');

async function clearCorruptedMuscleAPI() {
  console.log('🔄 Starting corrupted muscle API data cleanup...');
  
  try {
    // Step 1: Clear API muscle selection data
    console.log('1. Clearing API muscle selection...');
    const apiClearResponse = await fetch('/wp-json/fitcopilot/v1/muscle-selection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedGroups: [],
        selectedMuscles: {}
      })
    });
    
    const apiResult = await apiClearResponse.json();
    console.log('   API clear result:', apiResult);
    
    // Step 2: Clear all frontend storage
    console.log('2. Clearing frontend storage...');
    localStorage.removeItem('fitcopilot_muscle_selection');
    sessionStorage.removeItem('fitcopilot_workout_form');
    sessionStorage.removeItem('fitcopilot_muscle_selection');
    console.log('   ✅ Frontend storage cleared');
    
    // Step 3: Reset React component state
    console.log('3. Resetting React component state...');
    const muscleButtons = document.querySelectorAll('[data-muscle-group]');
    muscleButtons.forEach(button => {
      button.classList.remove('selected', 'active');
      button.setAttribute('aria-pressed', 'false');
    });
    
    const muscleChips = document.querySelectorAll('.muscle-group-chip');
    muscleChips.forEach(chip => chip.remove());
    console.log(`   ✅ Reset ${muscleButtons.length} muscle buttons and removed ${muscleChips.length} chips`);
    
    // Step 4: Verify cleanup
    console.log('4. Verifying cleanup...');
    const verifyResponse = await fetch('/wp-json/fitcopilot/v1/muscle-selection');
    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.success && 
        verifyResult.data.selectedGroups.length === 0 && 
        Object.keys(verifyResult.data.selectedMuscles).length === 0) {
      console.log('   ✅ API cleanup verified - no muscle selections found');
    } else {
      console.log('   ❌ API cleanup verification failed:', verifyResult);
      return false;
    }
    
    console.log('\n🎉 CORRUPTED MUSCLE API DATA CLEANUP COMPLETE!');
    console.log('   - API muscle selection cleared');
    console.log('   - Frontend storage cleared');  
    console.log('   - React component state reset');
    console.log('   - System ready for fresh muscle selections');
    
    return true;
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return false;
  }
}

// Execute the cleanup
clearCorruptedMuscleAPI().then(success => {
  if (success) {
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Refresh the page to load the fixed integration hook');
    console.log('2. Make a fresh muscle selection (e.g., Back, Arms)');
    console.log('3. Navigate to PremiumPreview to verify the fix');
    console.log('\nThe fixes should now prevent API data from overriding fresh selections!');
    
    // Offer to refresh page
    if (confirm('Cleanup complete! Refresh page to load fixes?')) {
      location.reload();
    }
  } else {
    console.log('\n❌ Cleanup failed. Manual intervention may be required.');
  }
}); 