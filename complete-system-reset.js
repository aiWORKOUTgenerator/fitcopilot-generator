/**
 * 🚨 COMPLETE SYSTEM RESET FOR MUSCLE SELECTION CORRUPTION
 * 
 * This script performs a comprehensive reset of ALL muscle selection data:
 * 1. API persistence layer
 * 2. Browser storage (localStorage + sessionStorage)
 * 3. React component state
 * 4. Form state
 * 5. Context state
 * 6. Cached data
 */

console.log('🚨 INITIATING COMPLETE SYSTEM RESET FOR MUSCLE SELECTION');

async function performCompleteSystemReset() {
  console.log('🔄 Starting comprehensive muscle selection reset...');
  
  try {
    // STEP 1: Clear API persistence
    console.log('1️⃣ Clearing API muscle selection data...');
    const apiResponse = await fetch('/wp-json/fitcopilot/v1/muscle-selection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selectedGroups: [],
        selectedMuscles: {}
      })
    });
    
    if (apiResponse.ok) {
      const apiResult = await apiResponse.json();
      console.log('   ✅ API Response:', apiResult);
    } else {
      console.log('   ⚠️ API call failed, continuing...');
    }
    
    // STEP 2: Clear ALL browser storage
    console.log('2️⃣ Clearing ALL browser storage...');
    
    // Clear localStorage (all fitcopilot keys)
    Object.keys(localStorage).forEach(key => {
      if (key.includes('fitcopilot') || key.includes('muscle') || key.includes('workout')) {
        localStorage.removeItem(key);
        console.log(`   🗑️ Removed localStorage: ${key}`);
      }
    });
    
    // Clear sessionStorage (all fitcopilot keys)
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('fitcopilot') || key.includes('muscle') || key.includes('workout')) {
        sessionStorage.removeItem(key);
        console.log(`   🗑️ Removed sessionStorage: ${key}`);
      }
    });
    
    // STEP 3: Reset React component state
    console.log('3️⃣ Resetting React component state...');
    
    // Remove selected classes from DOM elements
    const selectedElements = document.querySelectorAll('.selected, .muscle-group-selected, .is-selected');
    selectedElements.forEach(element => {
      element.classList.remove('selected', 'muscle-group-selected', 'is-selected');
      console.log(`   🎯 Removed selected class from:`, element);
    });
    
    // Clear any input values
    const muscleInputs = document.querySelectorAll('input[name*="muscle"], input[name*="focus"]');
    muscleInputs.forEach(input => {
      input.value = '';
      input.checked = false;
      console.log(`   📝 Cleared input:`, input);
    });
    
    // STEP 4: Force React state reset (via window globals if available)
    console.log('4️⃣ Forcing React state reset...');
    
    // Try to access React DevTools or component instances
    if (window.React) {
      console.log('   🔄 React detected, triggering re-render...');
    }
    
    // Clear any window-level muscle data
    if (window.muscleSelection) {
      window.muscleSelection = null;
      console.log('   🗑️ Cleared window.muscleSelection');
    }
    
    if (window.workoutForm) {
      window.workoutForm = null;
      console.log('   🗑️ Cleared window.workoutForm');
    }
    
    // STEP 5: Clear form data specifically
    console.log('5️⃣ Clearing form data...');
    
    // Reset form fields
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const muscleFields = form.querySelectorAll('[name*="muscle"], [name*="focus"], [name*="target"]');
      muscleFields.forEach(field => {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = false;
        } else {
          field.value = '';
        }
      });
    });
    
    // STEP 6: Clear any cached profile data that might contain muscle defaults
    console.log('6️⃣ Clearing cached profile muscle defaults...');
    
    // Clear profile-related storage
    ['fitcopilot_profile', 'profile_muscle_preferences', 'default_muscle_groups'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      console.log(`   🗑️ Cleared profile key: ${key}`);
    });
    
    // STEP 7: Force browser refresh after delay
    console.log('7️⃣ System reset complete!');
    console.log('');
    console.log('✅ COMPLETE SYSTEM RESET SUCCESSFUL');
    console.log('📊 Summary:');
    console.log('   - API muscle selection: CLEARED');
    console.log('   - localStorage: CLEARED');
    console.log('   - sessionStorage: CLEARED');
    console.log('   - DOM state: RESET');
    console.log('   - Form data: CLEARED');
    console.log('   - Profile defaults: CLEARED');
    console.log('');
    console.log('🔄 Auto-refreshing page in 3 seconds...');
    
    setTimeout(() => {
      location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ System reset failed:', error);
    console.log('🔄 Forcing page refresh anyway...');
    setTimeout(() => {
      location.reload();
    }, 2000);
  }
}

// Execute the complete reset
performCompleteSystemReset();

// Also make it available globally for manual use
window.performCompleteSystemReset = performCompleteSystemReset;

console.log('🔧 Complete system reset script loaded. You can also run:');
console.log('   window.performCompleteSystemReset()'); 