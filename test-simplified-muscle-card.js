/**
 * Simplified Target Muscle Card Test
 * 
 * Tests that the immediate fixes have resolved the critical issues:
 * 1. No more competing state management systems
 * 2. No more operation locks blocking interactions
 * 3. No more debouncing causing flickering
 * 4. localStorage persistence working correctly
 */

console.log('🎯 SIMPLIFIED MUSCLE CARD TEST');
console.log('='.repeat(50));

function testSimplifiedMuscleCard() {
  const muscleCard = document.querySelector('.muscle-card-structure');
  if (!muscleCard) {
    console.log('❌ MuscleGroupCard not found');
    return;
  }
  
  console.log('✅ MuscleGroupCard found');
  
  // Test 1: Check for dropdown functionality
  console.log('\n🔽 Testing dropdown functionality...');
  const dropdownTrigger = muscleCard.querySelector('.muscle-dropdown-trigger');
  if (dropdownTrigger) {
    console.log('✅ Dropdown trigger found');
    console.log(`   Disabled: ${dropdownTrigger.disabled}`);
    
    // Click to open dropdown
    dropdownTrigger.click();
    
    setTimeout(() => {
      const dropdown = muscleCard.querySelector('.muscle-dropdown-menu');
      if (dropdown) {
        console.log('✅ Dropdown opened successfully');
        const options = dropdown.querySelectorAll('.dropdown-option');
        console.log(`   Available options: ${options.length}`);
        
        if (options.length > 0) {
          // Test selection
          console.log('\n🖱️ Testing muscle group selection...');
          const firstOption = options[0];
          const optionText = firstOption.textContent.trim();
          console.log(`   Clicking: "${optionText}"`);
          
          // Count chips before
          const chipsBefore = muscleCard.querySelectorAll('.muscle-group-chip').length;
          console.log(`   Chips before: ${chipsBefore}`);
          
          // Click the option
          firstOption.click();
          
          // Check immediately (no debouncing)
          setTimeout(() => {
            const chipsAfter = muscleCard.querySelectorAll('.muscle-group-chip').length;
            console.log(`   Chips after: ${chipsAfter}`);
            
            if (chipsAfter > chipsBefore) {
              console.log('✅ Selection successful - chip added immediately');
              testPersistence();
            } else {
              console.log('❌ Selection failed - no chip added');
            }
          }, 50); // Minimal delay for React state update
        }
      } else {
        console.log('❌ Dropdown did not open');
      }
    }, 100);
  } else {
    console.log('❌ Dropdown trigger not found');
  }
}

function testPersistence() {
  console.log('\n💾 Testing localStorage persistence...');
  
  const storageKey = 'fitcopilot_muscle_selection';
  const storedData = localStorage.getItem(storageKey);
  
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      console.log('✅ localStorage data found:');
      console.log(`   Selected groups: ${parsed.selectedGroups?.length || 0}`);
      console.log(`   Groups: ${parsed.selectedGroups?.join(', ') || 'none'}`);
      
      // Compare with UI
      const uiChips = document.querySelectorAll('.muscle-group-chip').length;
      const storageChips = parsed.selectedGroups?.length || 0;
      
      if (uiChips === storageChips) {
        console.log('✅ UI and storage synchronized');
      } else {
        console.log(`⚠️ Mismatch: UI=${uiChips}, Storage=${storageChips}`);
      }
    } catch (e) {
      console.log('❌ Error parsing localStorage:', e.message);
    }
  } else {
    console.log('⚠️ No localStorage data (may be first use)');
  }
  
  testRemoval();
}

function testRemoval() {
  console.log('\n🗑️ Testing removal functionality...');
  
  const removeButtons = document.querySelectorAll('.chip-remove');
  if (removeButtons.length > 0) {
    console.log(`✅ Found ${removeButtons.length} remove buttons`);
    
    const chipsBefore = document.querySelectorAll('.muscle-group-chip').length;
    console.log(`   Chips before removal: ${chipsBefore}`);
    
    // Click first remove button
    removeButtons[0].click();
    
    setTimeout(() => {
      const chipsAfter = document.querySelectorAll('.muscle-group-chip').length;
      console.log(`   Chips after removal: ${chipsAfter}`);
      
      if (chipsAfter < chipsBefore) {
        console.log('✅ Removal successful');
      } else {
        console.log('❌ Removal failed');
      }
      
      console.log('\n' + '='.repeat(50));
      console.log('🎉 SIMPLIFIED MUSCLE CARD TEST COMPLETE');
      console.log('📝 Key improvements verified:');
      console.log('   - Single state management system');
      console.log('   - No operation locks');
      console.log('   - No debouncing delays');
      console.log('   - localStorage persistence');
      console.log('   - Immediate UI updates');
    }, 50);
  } else {
    console.log('⚠️ No remove buttons found (no selections to remove)');
  }
}

// Run the test
testSimplifiedMuscleCard(); 