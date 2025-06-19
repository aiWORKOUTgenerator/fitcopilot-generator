/**
 * PromptBuilder Form Cleanup Verification Test
 * 
 * Tests that all duplicate fields have been successfully removed
 * and that the remaining modular fields are functioning correctly.
 */

console.log('🧹 PROMPTBUILDER FORM CLEANUP VERIFICATION');
console.log('===========================================');

// Test 1: Verify no duplicate field IDs exist
function testNoDuplicateFields() {
    console.log('\n📋 Test 1: Checking for Duplicate Fields');
    
    const duplicateTests = [
        // Legacy vs Modular field name pairs
        { legacy: 'fitness-level', modular: 'fitnessLevel', description: 'Fitness Level' },
        { legacy: 'preferred-location', modular: 'preferredLocation', description: 'Preferred Location' },
        { legacy: 'workout-frequency', modular: 'workoutFrequency', description: 'Workout Frequency' },
        { legacy: 'workout-duration', modular: 'testDuration', description: 'Workout Duration' },
        { legacy: 'medical-conditions', modular: 'medicalConditions', description: 'Medical Conditions' },
        { legacy: 'favorite-exercises', modular: 'favoriteExercises', description: 'Favorite Exercises' },
        { legacy: 'disliked-exercises', modular: 'dislikedExercises', description: 'Disliked Exercises' },
        { legacy: 'height-unit', modular: 'heightUnit', description: 'Height Unit' }
    ];
    
    let duplicatesFound = 0;
    let cleanFields = 0;
    
    duplicateTests.forEach(test => {
        const legacyField = document.getElementById(test.legacy);
        const modularField = document.getElementById(test.modular);
        
        if (legacyField && modularField) {
            console.log(`❌ DUPLICATE FOUND: ${test.description} has both ${test.legacy} AND ${test.modular}`);
            duplicatesFound++;
        } else if (legacyField && !modularField) {
            console.log(`⚠️  LEGACY ONLY: ${test.description} only has legacy field ${test.legacy}`);
        } else if (!legacyField && modularField) {
            console.log(`✅ CLEAN: ${test.description} only has modular field ${test.modular}`);
            cleanFields++;
        } else {
            console.log(`❌ MISSING: ${test.description} has neither field!`);
        }
    });
    
    console.log(`\n📊 Duplicate Field Results:`);
    console.log(`   - Duplicates Found: ${duplicatesFound}`);
    console.log(`   - Clean Fields: ${cleanFields}`);
    console.log(`   - Total Tests: ${duplicateTests.length}`);
    
    return duplicatesFound === 0;
}

// Test 2: Verify all essential form fields exist
function testEssentialFieldsExist() {
    console.log('\n📋 Test 2: Checking Essential Fields Exist');
    
    const essentialFields = [
        { id: 'firstName', description: 'First Name', type: 'input' },
        { id: 'lastName', description: 'Last Name', type: 'input' },
        { id: 'fitnessLevel', description: 'Fitness Level', type: 'select' },
        { id: 'gender', description: 'Gender', type: 'select' },
        { id: 'age', description: 'Age', type: 'input' },
        { id: 'weight', description: 'Weight', type: 'input' },
        { id: 'weightUnit', description: 'Weight Unit', type: 'select' },
        { id: 'heightFeet', description: 'Height Feet', type: 'input' },
        { id: 'heightInches', description: 'Height Inches', type: 'input' },
        { id: 'heightCm', description: 'Height CM', type: 'input' },
        { id: 'heightUnit', description: 'Height Unit', type: 'select' },
        { id: 'preferredLocation', description: 'Preferred Location', type: 'select' },
        { id: 'workoutFrequency', description: 'Workout Frequency', type: 'select' },
        { id: 'testDuration', description: 'Test Duration', type: 'select' },
        { id: 'testFocus', description: 'Test Focus', type: 'select' },
        { id: 'intensity-preference', description: 'Intensity Preference', type: 'select' },
        { id: 'energyLevel', description: 'Energy Level', type: 'select' },
        { id: 'stressLevel', description: 'Stress Level', type: 'select' },
        { id: 'medicalConditions', description: 'Medical Conditions', type: 'textarea' },
        { id: 'injuries', description: 'Injuries', type: 'textarea' },
        { id: 'favoriteExercises', description: 'Favorite Exercises', type: 'textarea' },
        { id: 'dislikedExercises', description: 'Disliked Exercises', type: 'textarea' },
        { id: 'customNotes', description: 'Custom Notes', type: 'textarea' }
    ];
    
    let missingFields = 0;
    let presentFields = 0;
    
    essentialFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            console.log(`✅ ${field.description}: Found (${field.type})`);
            presentFields++;
        } else {
            console.log(`❌ ${field.description}: MISSING (${field.type})`);
            missingFields++;
        }
    });
    
    console.log(`\n📊 Essential Fields Results:`);
    console.log(`   - Present Fields: ${presentFields}`);
    console.log(`   - Missing Fields: ${missingFields}`);
    console.log(`   - Total Expected: ${essentialFields.length}`);
    
    return missingFields === 0;
}

// Test 3: Verify muscle selection functionality
function testMuscleSelectionSystem() {
    console.log('\n📋 Test 3: Checking Muscle Selection System');
    
    const muscleTests = [
        { id: 'load-saved-muscles', description: 'Load Saved Muscles Button' },
        { id: 'load-muscle-suggestions', description: 'Load Muscle Suggestions Button' },
        { id: 'clear-muscle-selection', description: 'Clear Muscle Selection Button' },
        { id: 'muscle-selection-summary', description: 'Muscle Selection Summary' },
        { id: 'target-muscle-groups', description: 'Target Muscle Groups Textarea' },
        { id: 'specific-muscles', description: 'Specific Muscles Textarea' }
    ];
    
    let muscleSystemWorking = 0;
    let muscleSystemBroken = 0;
    
    muscleTests.forEach(test => {
        const element = document.getElementById(test.id);
        if (element) {
            console.log(`✅ ${test.description}: Found`);
            muscleSystemWorking++;
        } else {
            console.log(`❌ ${test.description}: MISSING`);
            muscleSystemBroken++;
        }
    });
    
    // Test muscle groups exist
    const muscleGroups = ['back', 'chest', 'arms', 'shoulders', 'core', 'legs'];
    let muscleGroupsPresent = 0;
    
    muscleGroups.forEach(group => {
        const groupCheckbox = document.querySelector(`input[name="targetMuscleGroups[]"][value="${group}"]`);
        const groupDetail = document.getElementById(`muscle-detail-${group}`);
        
        if (groupCheckbox && groupDetail) {
            console.log(`✅ Muscle Group "${group}": Present with detail grid`);
            muscleGroupsPresent++;
        } else {
            console.log(`❌ Muscle Group "${group}": Missing components`);
        }
    });
    
    console.log(`\n📊 Muscle Selection Results:`);
    console.log(`   - System Components Working: ${muscleSystemWorking}`);
    console.log(`   - System Components Broken: ${muscleSystemBroken}`);
    console.log(`   - Muscle Groups Present: ${muscleGroupsPresent}/${muscleGroups.length}`);
    
    return muscleSystemBroken === 0 && muscleGroupsPresent === muscleGroups.length;
}

// Test 4: Verify JavaScript functions exist
function testJavaScriptFunctions() {
    console.log('\n📋 Test 4: Checking JavaScript Functions');
    
    const functions = [
        { name: 'toggleHeightFields', description: 'Height Fields Toggle' },
        { name: 'toggleMuscleGroup', description: 'Muscle Group Toggle' },
        { name: 'updateMuscleSelectionSummary', description: 'Muscle Selection Summary Update' },
        { name: 'clearMuscleSelection', description: 'Clear Muscle Selection' },
        { name: 'loadMuscleSelections', description: 'Load Muscle Selections' },
        { name: 'loadMuscleSuggestions', description: 'Load Muscle Suggestions' }
    ];
    
    let functionsPresent = 0;
    let functionsMissing = 0;
    
    functions.forEach(func => {
        if (typeof window[func.name] === 'function') {
            console.log(`✅ ${func.description}: Function exists`);
            functionsPresent++;
        } else {
            console.log(`❌ ${func.description}: Function missing`);
            functionsMissing++;
        }
    });
    
    console.log(`\n📊 JavaScript Functions Results:`);
    console.log(`   - Functions Present: ${functionsPresent}`);
    console.log(`   - Functions Missing: ${functionsMissing}`);
    console.log(`   - Total Expected: ${functions.length}`);
    
    return functionsMissing === 0;
}

// Test 5: Test form data collection
function testFormDataCollection() {
    console.log('\n📋 Test 5: Testing Form Data Collection');
    
    try {
        // Fill out some test data
        document.getElementById('firstName').value = 'Test';
        document.getElementById('lastName').value = 'User';
        document.getElementById('fitnessLevel').value = 'intermediate';
        document.getElementById('age').value = '30';
        document.getElementById('testDuration').value = '30';
        
        // Test PromptBuilder.collectFormData() if it exists
        if (typeof PromptBuilder !== 'undefined' && PromptBuilder.collectFormData) {
            const formData = PromptBuilder.collectFormData();
            console.log('✅ Form data collection successful');
            console.log('📊 Sample collected data:', formData);
            return true;
        } else {
            console.log('⚠️  PromptBuilder.collectFormData() not available for testing');
            
            // Test basic form serialization as fallback
            const formElement = document.getElementById('prompt-builder-form');
            if (formElement) {
                const formData = new FormData(formElement);
                console.log('✅ Basic form serialization works');
                return true;
            } else {
                console.log('❌ Form element not found');
                return false;
            }
        }
    } catch (error) {
        console.log('❌ Form data collection failed:', error.message);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting Form Cleanup Verification Tests...\n');
    
    const testResults = {
        noDuplicates: testNoDuplicateFields(),
        essentialFields: testEssentialFieldsExist(),
        muscleSelection: testMuscleSelectionSystem(),
        javaScriptFunctions: testJavaScriptFunctions(),
        formDataCollection: testFormDataCollection()
    };
    
    console.log('\n🏁 FINAL RESULTS');
    console.log('================');
    
    const passed = Object.values(testResults).filter(result => result === true).length;
    const total = Object.keys(testResults).length;
    
    Object.entries(testResults).forEach(([test, result]) => {
        const status = result ? '✅ PASS' : '❌ FAIL';
        const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`${status} - ${testName}`);
    });
    
    console.log(`\n📊 Overall Score: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
        console.log('🎉 ALL TESTS PASSED! Form cleanup successful!');
        console.log('\n✨ BENEFITS ACHIEVED:');
        console.log('   • Eliminated confusing duplicate fields');
        console.log('   • Consistent field naming (camelCase)');
        console.log('   • Clean, maintainable form structure');
        console.log('   • Proper modular architecture');
        console.log('   • Enhanced user experience');
    } else {
        console.log('⚠️  Some issues found. Review failed tests above.');
    }
    
    return testResults;
}

// Auto-run tests when script loads
runAllTests(); 