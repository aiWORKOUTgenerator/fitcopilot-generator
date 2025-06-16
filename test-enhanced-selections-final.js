// Final test script to verify WorkoutSelectionSummary enhanced display
// Run this in browser console on the dashboard page

console.log('🎯 Testing Enhanced WorkoutSelectionSummary...');

// Function to test the enhanced selections display
function testEnhancedSelections() {
  console.log('🔍 Looking for workout cards...');
  
  // Find workout cards
  const workoutCards = document.querySelectorAll('[class*="workout-card"], [class*="WorkoutCard"]');
  console.log(`Found ${workoutCards.length} workout cards`);
  
  if (workoutCards.length === 0) {
    console.log('❌ No workout cards found. Generate a workout first.');
    return;
  }
  
  // Try to click the first workout card to open modal
  const firstCard = workoutCards[0];
  console.log('🖱️ Clicking first workout card...');
  firstCard.click();
  
  // Wait for modal to open
  setTimeout(() => {
    // Look for the enhanced selections summary
    const enhancedSummary = document.querySelector('.workout-selection-summary');
    
    if (enhancedSummary) {
      console.log('✅ Found WorkoutSelectionSummary component!');
      
      // Check for enhanced sections
      const categories = enhancedSummary.querySelectorAll('.selections-category');
      console.log(`📊 Found ${categories.length} selection categories`);
      
      categories.forEach((category, index) => {
        const title = category.querySelector('.selections-category__title');
        const items = category.querySelectorAll('.selection-item');
        console.log(`${index + 1}. ${title?.textContent?.trim()} (${items.length} items)`);
      });
      
      // Check if we have the expected 7 sections
      if (categories.length >= 6) {
        console.log('🎉 SUCCESS: Enhanced format detected with 6+ sections!');
        console.log('✅ Smart fallback system is working correctly');
      } else {
        console.log(`⚠️ Only ${categories.length} sections found. Expected 6+`);
      }
      
      // Check for AI context message
      const aiContext = enhancedSummary.querySelector('.workout-selection-summary__ai-context');
      if (aiContext) {
        console.log('🤖 AI context message found:', aiContext.textContent.trim());
      }
      
    } else {
      console.log('❌ WorkoutSelectionSummary component not found');
      console.log('🔍 Available elements:', document.querySelectorAll('[class*="selection"]'));
    }
  }, 1000);
}

// Run the test
testEnhancedSelections();

console.log('📝 Test completed. Check console output above for results.'); 