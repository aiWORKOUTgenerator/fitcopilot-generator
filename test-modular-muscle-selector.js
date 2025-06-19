/**
 * Test Script: Modular Muscle Selector Verification
 * 
 * This script tests the properly modularized muscle selection functionality
 * in the PromptBuilder interface, ensuring the MuscleModule is working correctly.
 */

console.log('=== Modular Muscle Selector Test ===');

// Test 1: Check if MuscleModule assets are loaded
function testMuscleModuleAssets() {
    console.log('\n1. Testing MuscleModule Asset Loading...');
    
    // Check if muscle-targeting.js is loaded
    const scripts = document.querySelectorAll('script[src*="muscle-targeting.js"]');
    console.log('✓ Muscle targeting script loaded:', scripts.length > 0);
    
    // Check if muscle-targeting.css is loaded
    const styles = document.querySelectorAll('link[href*="muscle-targeting.css"]');
    console.log('✓ Muscle targeting styles loaded:', styles.length > 0);
    
    // Check if muscleModule global is available
    console.log('✓ MuscleModule global config:', typeof window.muscleModule !== 'undefined');
    
    return scripts.length > 0 && styles.length > 0;
}

// Test 2: Check if muscle selection HTML is rendered via module delegation
function testMuscleSelectionHTML() {
    console.log('\n2. Testing Muscle Selection HTML Structure...');
    
    // Check if muscle selection container exists
    const container = document.querySelector('.muscle-selection-container');
    console.log('✓ Muscle selection container:', !!container);
    
    // Check if muscle groups are present
    const muscleGroups = document.querySelectorAll('input[name="targetMuscleGroups[]"]');
    console.log('✓ Muscle group checkboxes:', muscleGroups.length, 'found');
    
    // Check if detail grids exist
    const detailGrids = document.querySelectorAll('.muscle-detail-grid');
    console.log('✓ Muscle detail grids:', detailGrids.length, 'found');
    
    // Check if action buttons exist
    const actionButtons = document.querySelectorAll('#load-saved-muscles, #load-muscle-suggestions, #clear-muscle-selection');
    console.log('✓ Action buttons:', actionButtons.length, 'found');
    
    // Check if summary element exists
    const summary = document.getElementById('muscle-selection-summary');
    console.log('✓ Selection summary element:', !!summary);
    
    return container && muscleGroups.length >= 6 && detailGrids.length >= 6 && actionButtons.length >= 3 && summary;
}

// Test 3: Check if muscle selection functions are available
function testMuscleSelectionFunctions() {
    console.log('\n3. Testing Muscle Selection Functions...');
    
    // Check if global functions are available
    const functions = [
        'toggleMuscleGroup',
        'updateMuscleSelectionSummary', 
        'clearMuscleSelection'
    ];
    
    functions.forEach(func => {
        const available = typeof window[func] === 'function';
        console.log(`✓ ${func}:`, available);
    });
    
    return functions.every(func => typeof window[func] === 'function');
}

// Test 4: Test muscle group toggle functionality
function testMuscleGroupToggle() {
    console.log('\n4. Testing Muscle Group Toggle...');
    
    try {
        // Find a muscle group checkbox
        const backCheckbox = document.querySelector('input[name="targetMuscleGroups[]"][value="back"]');
        if (!backCheckbox) {
            console.log('✗ Back muscle group checkbox not found');
            return false;
        }
        
        // Test toggle function
        if (typeof window.toggleMuscleGroup === 'function') {
            // Clear any existing selections first
            backCheckbox.checked = false;
            
            // Test toggle on
            backCheckbox.checked = true;
            window.toggleMuscleGroup('back');
            
            const detailGrid = document.getElementById('muscle-detail-back');
            const isVisible = detailGrid && detailGrid.style.display !== 'none';
            console.log('✓ Toggle muscle group (expand):', isVisible);
            
            // Test toggle off
            backCheckbox.checked = false;
            window.toggleMuscleGroup('back');
            
            const isHidden = detailGrid && detailGrid.style.display === 'none';
            console.log('✓ Toggle muscle group (collapse):', isHidden);
            
            return isVisible && isHidden;
        } else {
            console.log('✗ toggleMuscleGroup function not available');
            return false;
        }
    } catch (error) {
        console.log('✗ Error testing muscle group toggle:', error.message);
        return false;
    }
}

// Test 5: Test summary update functionality
function testSummaryUpdate() {
    console.log('\n5. Testing Summary Update...');
    
    try {
        if (typeof window.updateMuscleSelectionSummary === 'function') {
            // Clear selections first
            if (typeof window.clearMuscleSelection === 'function') {
                window.clearMuscleSelection();
            }
            
            // Update summary
            window.updateMuscleSelectionSummary();
            
            const summary = document.getElementById('muscle-selection-summary');
            if (summary) {
                const isEmpty = summary.textContent.includes('No muscle groups selected');
                console.log('✓ Summary shows empty state:', isEmpty);
                
                // Test with selection
                const chestCheckbox = document.querySelector('input[name="targetMuscleGroups[]"][value="chest"]');
                if (chestCheckbox) {
                    chestCheckbox.checked = true;
                    window.updateMuscleSelectionSummary();
                    
                    const hasSelection = summary.textContent.includes('1 muscle group');
                    console.log('✓ Summary shows selection:', hasSelection);
                    
                    // Clean up
                    chestCheckbox.checked = false;
                    window.updateMuscleSelectionSummary();
                    
                    return isEmpty && hasSelection;
                }
            }
        }
        
        console.log('✗ Summary update test failed');
        return false;
    } catch (error) {
        console.log('✗ Error testing summary update:', error.message);
        return false;
    }
}

// Test 6: Test clear functionality
function testClearFunctionality() {
    console.log('\n6. Testing Clear Functionality...');
    
    try {
        if (typeof window.clearMuscleSelection === 'function') {
            // Set some selections first
            const backCheckbox = document.querySelector('input[name="targetMuscleGroups[]"][value="back"]');
            const armsCheckbox = document.querySelector('input[name="targetMuscleGroups[]"][value="arms"]');
            
            if (backCheckbox && armsCheckbox) {
                backCheckbox.checked = true;
                armsCheckbox.checked = true;
                
                // Clear selections
                window.clearMuscleSelection();
                
                const allCleared = !backCheckbox.checked && !armsCheckbox.checked;
                console.log('✓ Clear muscle selections:', allCleared);
                
                // Check if detail grids are hidden
                const detailGrids = document.querySelectorAll('.muscle-detail-grid');
                const allHidden = Array.from(detailGrids).every(grid => grid.style.display === 'none');
                console.log('✓ Detail grids hidden after clear:', allHidden);
                
                return allCleared && allHidden;
            }
        }
        
        console.log('✗ Clear functionality test failed');
        return false;
    } catch (error) {
        console.log('✗ Error testing clear functionality:', error.message);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('Starting Modular Muscle Selector Tests...\n');
    
    const results = {
        assetsLoaded: testMuscleModuleAssets(),
        htmlStructure: testMuscleSelectionHTML(),
        functionsAvailable: testMuscleSelectionFunctions(),
        toggleWorks: testMuscleGroupToggle(),
        summaryWorks: testSummaryUpdate(),
        clearWorks: testClearFunctionality()
    };
    
    console.log('\n=== Test Results Summary ===');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('🎉 Modular muscle selector is working correctly!');
        console.log('The MuscleModule is properly handling muscle selection functionality.');
    } else {
        console.log('⚠️ Some issues detected with the modular muscle selector.');
        console.log('Check the individual test results above for details.');
    }
    
    return allPassed;
}

// Auto-run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
} 