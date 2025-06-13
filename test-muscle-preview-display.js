/**
 * Target Muscle Card PremiumPreview Display Test
 * 
 * Tests the Target Muscle Card rendering in PremiumPreview after 
 * fixing the bridge integration issue that was preventing display.
 */

console.log('🎯 Target Muscle Card PremiumPreview Display Test');
console.log('='.repeat(50));

// Test muscle selection and preview display
function testMusclePreviewDisplay() {
  // Check if Target Muscle Card is rendered
  const muscleCard = document.querySelector('.muscle-card-structure');
  console.log('1. Target Muscle Card found:', !!muscleCard);
  
  if (muscleCard) {
    // Test muscle group buttons
    const muscleButtons = muscleCard.querySelectorAll('[data-muscle-group]');
    console.log('2. Muscle group buttons found:', muscleButtons.length);
    
    // Test clicking chest muscle group
    const chestButton = Array.from(muscleButtons).find(btn => 
      btn.dataset.muscleGroup === 'chest' || 
      btn.textContent.toLowerCase().includes('chest')
    );
    
    if (chestButton) {
      console.log('3. Testing chest muscle selection...');
      
      // Simulate click
      chestButton.click();
      
      // Wait for state update
      setTimeout(() => {
        // Check if muscle chip appears
        const muscleChips = document.querySelectorAll('.muscle-group-chip');
        console.log('4. Muscle chips after selection:', muscleChips.length);
        
        // Check if selection flows to preview
        setTimeout(() => {
          testPremiumPreviewDisplay();
        }, 500);
        
      }, 200);
    } else {
      console.log('3. ❌ Chest button not found');
      testPremiumPreviewDisplay();
    }
  } else {
    console.log('❌ Target Muscle Card not found in DOM');
  }
}

// Test PremiumPreview display of muscle data
function testPremiumPreviewDisplay() {
  console.log('\n🎯 Testing PremiumPreview Display');
  console.log('-'.repeat(30));
  
  // Look for Premium Preview Step
  const premiumPreview = document.querySelector('.premium-preview-step');
  console.log('1. Premium Preview Step found:', !!premiumPreview);
  
  if (premiumPreview) {
    // Check for modular cards section
    const modularCardsSection = premiumPreview.querySelector('.modular-cards-grid');
    console.log('2. Modular cards section found:', !!modularCardsSection);
    
    if (modularCardsSection) {
      // Look for Target Muscle card specifically
      const musclePreviewCards = modularCardsSection.querySelectorAll('.modular-preview-card');
      console.log('3. Total modular preview cards:', musclePreviewCards.length);
      
      // Check each card for muscle data
      let muscleCardFound = false;
      musclePreviewCards.forEach((card, index) => {
        const label = card.querySelector('.modular-preview-card__label');
        const value = card.querySelector('.modular-preview-card__value');
        
        if (label && value) {
          const labelText = label.textContent.toLowerCase();
          console.log(`   Card ${index + 1}: ${label.textContent} = ${value.textContent}`);
          
          if (labelText.includes('muscle') || labelText.includes('target')) {
            muscleCardFound = true;
            console.log('   ✅ TARGET MUSCLE CARD FOUND!');
          }
        }
      });
      
      if (!muscleCardFound) {
        console.log('4. ❌ Target Muscle card not found in preview');
        
        // Debug: Check form values that preview uses
        console.log('\n🔍 Debug: Checking form values...');
        
        // Check sessionInputs.focusArea
        if (window.workoutForm && window.workoutForm.formValues) {
          const sessionInputs = window.workoutForm.formValues.sessionInputs || {};
          const muscleTargeting = window.workoutForm.formValues.muscleTargeting || {};
          
          console.log('   sessionInputs.focusArea:', sessionInputs.focusArea);
          console.log('   muscleTargeting.selectionSummary:', muscleTargeting.selectionSummary);
          console.log('   muscleTargeting.targetMuscleGroups:', muscleTargeting.targetMuscleGroups);
        } else {
          console.log('   ❌ workoutForm not available for debugging');
        }
      } else {
        console.log('4. ✅ SUCCESS: Target Muscle card displaying in PremiumPreview!');
      }
    } else {
      console.log('❌ Modular cards section not found');
    }
  } else {
    console.log('❌ Premium Preview Step not found');
  }
}

// Run the test
console.log('Starting test in 2 seconds...');
setTimeout(() => {
  testMusclePreviewDisplay();
}, 2000);

// Also provide manual test commands
console.log('\n📋 Manual Test Commands:');
console.log('// 1. Check if Target Muscle Card renders:');
console.log('document.querySelector(".muscle-card-structure")');
console.log('// 2. Check PremiumPreview muscle cards:');
console.log('document.querySelectorAll(".modular-preview-card")');
console.log('// 3. Check form muscle data:');
console.log('window.workoutForm?.formValues?.muscleTargeting'); 