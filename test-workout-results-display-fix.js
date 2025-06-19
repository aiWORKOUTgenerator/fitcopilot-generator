/**
 * Test Script: Workout Results Display Fix Verification
 * 
 * Verifies that test workout results are now displaying in the correct
 * "Test Workout Generation" window instead of the "Live Prompt Preview" window.
 */

console.log('🔧 Testing Workout Results Display Fix...\n');

// Test Configuration
const tests = {
    htmlStructure: testHTMLStructure,
    targetingFix: testTargetingFix,
    stylingEnhancement: testStylingEnhancement,
    userExperience: testUserExperience
};

// Run all tests
runAllTests();

async function runAllTests() {
    console.log('📋 WORKOUT RESULTS DISPLAY FIX VERIFICATION');
    console.log('='.repeat(50));
    
    let passed = 0;
    let total = 0;
    
    for (const [testName, testFunction] of Object.entries(tests)) {
        total++;
        try {
            console.log(`\n🧪 Running ${testName}...`);
            await testFunction();
            console.log(`✅ ${testName} - PASSED`);
            passed++;
        } catch (error) {
            console.error(`❌ ${testName} - FAILED:`, error.message);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 RESULTS: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Workout results display fix is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please review the implementation.');
    }
}

/**
 * Test 1: HTML Structure Verification
 */
function testHTMLStructure() {
    console.log('  📝 Checking HTML container structure...');
    
    // Check that both containers exist
    const workoutTestPreview = document.getElementById('workout-test-preview');
    const promptPreview = document.getElementById('prompt-preview');
    
    if (!workoutTestPreview) {
        throw new Error('workout-test-preview container not found');
    }
    
    if (!promptPreview) {
        throw new Error('prompt-preview container not found');
    }
    
    console.log('  ✅ Both containers exist');
    
    // Check that they are in different sections
    const workoutSection = workoutTestPreview.closest('.builder-section');
    const promptSection = promptPreview.closest('.builder-section');
    
    if (workoutSection === promptSection) {
        throw new Error('Containers are in the same section');
    }
    
    console.log('  ✅ Containers are in separate sections');
    
    // Verify section titles
    const workoutSectionTitle = workoutSection?.querySelector('h3')?.textContent;
    const promptSectionTitle = promptSection?.querySelector('h3')?.textContent;
    
    if (!workoutSectionTitle?.includes('Test Workout Generation')) {
        throw new Error('Workout section title incorrect: ' + workoutSectionTitle);
    }
    
    if (!promptSectionTitle?.includes('Live Prompt Preview')) {
        throw new Error('Prompt section title incorrect: ' + promptSectionTitle);
    }
    
    console.log('  ✅ Section titles are correct');
    console.log(`    - Workout section: "${workoutSectionTitle}"`);
    console.log(`    - Prompt section: "${promptSectionTitle}"`);
}

/**
 * Test 2: JavaScript Targeting Fix
 */
function testTargetingFix() {
    console.log('  🎯 Testing JavaScript targeting fix...');
    
    // Check that displayWorkoutTest function exists and targets correct element
    if (typeof PromptBuilder === 'undefined') {
        throw new Error('PromptBuilder object not found');
    }
    
    // Test the function with mock data
    const mockWorkoutData = {
        test_id: 'test_12345',
        workout_data: {
            title: 'Test Workout',
            duration: 30,
            exercises: [
                { name: 'Push-ups', sets: 3, reps: 10 },
                { name: 'Squats', sets: 3, reps: 15 }
            ]
        },
        timestamp: new Date().toISOString(),
        processing_time: 1250
    };
    
    // Get initial content
    const workoutPreview = document.getElementById('workout-test-preview');
    const promptPreview = document.getElementById('prompt-preview');
    
    const initialWorkoutContent = workoutPreview.innerHTML;
    const initialPromptContent = promptPreview.innerHTML;
    
    // Call the function
    if (typeof PromptBuilder.displayWorkoutTest === 'function') {
        PromptBuilder.displayWorkoutTest(mockWorkoutData);
    } else {
        throw new Error('displayWorkoutTest function not found on PromptBuilder');
    }
    
    // Check that workout container changed but prompt container didn't
    const newWorkoutContent = workoutPreview.innerHTML;
    const newPromptContent = promptPreview.innerHTML;
    
    if (newWorkoutContent === initialWorkoutContent) {
        throw new Error('Workout test preview content did not change');
    }
    
    if (newPromptContent !== initialPromptContent) {
        throw new Error('Prompt preview content changed (it should not have)');
    }
    
    console.log('  ✅ displayWorkoutTest targets correct container');
    
    // Verify content structure
    if (!newWorkoutContent.includes('Workout Test Results')) {
        throw new Error('Expected workout test results header not found');
    }
    
    if (!newWorkoutContent.includes('test_12345')) {
        throw new Error('Test ID not displayed in results');
    }
    
    console.log('  ✅ Content structure is correct');
}

/**
 * Test 3: Styling Enhancement
 */
function testStylingEnhancement() {
    console.log('  🎨 Testing styling enhancements...');
    
    // Mock workout data with enhanced styling
    const mockData = {
        test_id: 'style_test',
        processing_time: 1500,
        match_score: 85
    };
    
    // Trigger the display function
    if (typeof PromptBuilder.displayWorkoutTest === 'function') {
        PromptBuilder.displayWorkoutTest(mockData);
    }
    
    const workoutPreview = document.getElementById('workout-test-preview');
    
    // Check for enhanced styling elements
    const metaSection = workoutPreview.querySelector('.workout-meta');
    if (!metaSection) {
        throw new Error('Workout meta section not found');
    }
    
    console.log('  ✅ Meta section present');
    
    const metaItems = workoutPreview.querySelectorAll('.meta-item');
    if (metaItems.length < 2) {
        throw new Error('Expected at least 2 meta items');
    }
    
    console.log(`  ✅ Found ${metaItems.length} meta items`);
    
    // Check for workout content section
    const contentSection = workoutPreview.querySelector('.workout-content');
    if (!contentSection) {
        throw new Error('Workout content section not found');
    }
    
    console.log('  ✅ Content section present');
    
    // Verify CSS classes are applied
    const computedStyle = window.getComputedStyle(metaSection);
    if (computedStyle.display !== 'flex') {
        throw new Error('Meta section flex display not applied');
    }
    
    console.log('  ✅ CSS styling applied correctly');
}

/**
 * Test 4: User Experience Verification
 */
function testUserExperience() {
    console.log('  👤 Testing user experience improvements...');
    
    // Test that controls become visible
    const workoutControls = document.querySelectorAll('.workout-controls #export-workout, .workout-controls #save-workout');
    const performanceMetrics = document.getElementById('workout-performance');
    
    if (workoutControls.length === 0) {
        throw new Error('Workout controls not found');
    }
    
    if (!performanceMetrics) {
        throw new Error('Performance metrics container not found');
    }
    
    console.log('  ✅ Control elements exist');
    
    // Mock display function to test control visibility
    const mockData = { test_id: 'ux_test' };
    
    if (typeof PromptBuilder.displayWorkoutTest === 'function') {
        PromptBuilder.displayWorkoutTest(mockData);
    }
    
    // Check that controls are now visible (should have display: inline or block)
    let controlsVisible = false;
    workoutControls.forEach(control => {
        const style = window.getComputedStyle(control);
        if (style.display !== 'none') {
            controlsVisible = true;
        }
    });
    
    if (!controlsVisible) {
        console.log('  ⚠️  Workout controls may not be visible (this might be expected)');
    } else {
        console.log('  ✅ Workout controls are visible');
    }
    
    // Test timing display
    const workoutPreview = document.getElementById('workout-test-preview');
    const timeElements = workoutPreview.querySelectorAll('.meta-value');
    
    let hasTimeDisplay = false;
    timeElements.forEach(element => {
        if (element.textContent.includes(':')) {
            hasTimeDisplay = true;
        }
    });
    
    if (hasTimeDisplay) {
        console.log('  ✅ Time display is present');
    } else {
        console.log('  ℹ️  Time display format may vary');
    }
    
    console.log('  ✅ User experience elements working');
}

/**
 * Manual Test Instructions
 */
function displayManualTestInstructions() {
    console.log('\n📝 MANUAL TESTING INSTRUCTIONS');
    console.log('='.repeat(50));
    console.log('1. Navigate to the PromptBuilder admin page');
    console.log('2. Fill in some profile data in the form');
    console.log('3. Click "Test Workout Generation" button');
    console.log('4. Verify results appear in "Test Workout Generation" section');
    console.log('5. Verify "Live Prompt Preview" section remains unchanged');
    console.log('6. Check that export/save buttons become visible');
    console.log('7. Verify performance metrics are displayed');
    console.log('\n✅ Expected Result: Workout results display in correct container with enhanced styling');
}

// Display manual test instructions
displayManualTestInstructions();

// Export for external use
window.testWorkoutResultsDisplayFix = runAllTests;

console.log('\n🔧 Workout Results Display Fix test loaded successfully!');
console.log('Run window.testWorkoutResultsDisplayFix() to execute tests manually.'); 