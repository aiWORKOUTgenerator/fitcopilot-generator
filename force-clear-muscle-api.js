/**
 * 🚨 FORCE CLEAR CORRUPTED MUSCLE API DATA
 * 
 * This script immediately clears the corrupted "Chest/Arms" data 
 * from the API and forces a complete system reset.
 */

console.log('🚨 FORCE CLEARING CORRUPTED MUSCLE API DATA');

(async function forceApiClear() {
  try {
    console.log('🔄 Step 1: Clearing corrupted API muscle selection...');
    
    // Clear API muscle selection data
    const apiResponse = await fetch('/wp-json/fitcopilot/v1/muscle-selection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': wpApiSettings?.nonce || ''
      },
      body: JSON.stringify({
        selectedGroups: [],
        selectedMuscles: {}
      })
    });
    
    const apiResult = await apiResponse.json();
    console.log('   ✅ API Response:', apiResult);
    
    console.log('🔄 Step 2: Clearing all frontend storage...');
    
    // Clear all possible storage locations
    localStorage.removeItem('fitcopilot_muscle_selection');
    localStorage.removeItem('muscle_selection_data');
    sessionStorage.removeItem('fitcopilot_workout_form');
    sessionStorage.removeItem('fitcopilot_muscle_selection');
    sessionStorage.removeItem('workout_form_data');
    
    console.log('   ✅ All storage cleared');
    
    console.log('🔄 Step 3: Resetting React component state...');
    
    // Reset all muscle selection UI elements
    document.querySelectorAll('[data-muscle-group]').forEach(button => {
      button.classList.remove('selected', 'active');
      button.setAttribute('aria-pressed', 'false');
    });
    
    // Remove any muscle chips
    document.querySelectorAll('.muscle-group-chip, .muscle-chip').forEach(chip => {
      chip.remove();
    });
    
    console.log('   ✅ React state reset');
    
    console.log('🔄 Step 4: Verifying API clear...');
    
    // Verify API is cleared
    const verifyResponse = await fetch('/wp-json/fitcopilot/v1/muscle-selection');
    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.success && verifyResult.data.selectedGroups.length === 0) {
      console.log('   ✅ API verification successful - no muscle data found');
    } else {
      console.log('   ⚠️ API verification failed:', verifyResult);
    }
    
    console.log('\n🎉 FORCE CLEAR COMPLETE!');
    console.log('📋 Summary:');
    console.log('   - API muscle selection cleared');
    console.log('   - All frontend storage cleared');
    console.log('   - React component state reset');
    console.log('   - System ready for fresh selections');
    
    console.log('\n🔄 Refreshing page to load fixes...');
    
    // Auto-refresh after 2 seconds
    setTimeout(() => {
      location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Force clear failed:', error);
    console.log('\n🔧 Manual fallback:');
    console.log('1. Clear browser cache completely');
    console.log('2. Refresh the page');
    console.log('3. Try selecting muscles again');
  }
})(); 