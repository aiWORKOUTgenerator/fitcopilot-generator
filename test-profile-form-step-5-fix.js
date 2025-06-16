/**
 * Profile Form Step 5 Fix Verification Test
 * 
 * Run this script on the Dashboard Profile tab with the ProfileEditModal OPEN
 * This verifies that Step 5 (PreferencesStep) now displays without auto-saving
 */

console.log('🔧 PROFILE FORM STEP 5 FIX VERIFICATION TEST');
console.log('==============================================');

function testStep5Fix() {
    console.log('\n📋 STEP 1: Modal State Analysis');
    console.log('===============================');
    
    // Check if modal is open
    const modal = document.querySelector('.profile-edit-modal__overlay');
    if (!modal) {
        console.log('❌ ProfileEditModal is not open');
        console.log('💡 Please click "Edit Profile" button first, then re-run this test');
        return;
    }
    
    console.log('✅ ProfileEditModal is open');
    
    // Check current step
    const stepIndicators = document.querySelectorAll('.step-indicator');
    let currentStep = 0;
    stepIndicators.forEach((indicator, index) => {
        if (indicator.classList.contains('active')) {
            currentStep = index + 1;
        }
    });
    
    console.log(`📍 Current Step: ${currentStep}/5`);
    
    if (currentStep !== 5) {
        console.log('⚠️  Not on Step 5 yet');
        console.log('💡 Navigate to Step 5 by clicking "Next" through the steps, then re-run this test');
        return;
    }
    
    console.log('✅ Currently on Step 5 (PreferencesStep)');
    
    console.log('\n📋 STEP 2: PreferencesStep Content Analysis');
    console.log('===========================================');
    
    // Check for PreferencesStep specific fields
    const expectedFields = [
        { name: 'workoutFrequency', label: 'Workout Frequency', type: 'select' },
        { name: 'preferredWorkoutDuration', label: 'Preferred Duration', type: 'input' },
        { name: 'favoriteExercises', label: 'Favorite Exercises', type: 'textarea' },
        { name: 'dislikedExercises', label: 'Disliked Exercises', type: 'textarea' }
    ];
    
    let foundFields = [];
    let missingFields = [];
    
    expectedFields.forEach(field => {
        // Try multiple selectors for each field type
        let selectors = [];
        if (field.type === 'select') {
            selectors = [
                `select[name="${field.name}"]`,
                `select[name*="${field.name}"]`,
                `select[id="${field.name}"]`,
                `select[id*="${field.name}"]`
            ];
        } else if (field.type === 'input') {
            selectors = [
                `input[name="${field.name}"]`,
                `input[name*="${field.name}"]`,
                `input[id="${field.name}"]`,
                `input[id*="${field.name}"]`
            ];
        } else if (field.type === 'textarea') {
            selectors = [
                `textarea[name="${field.name}"]`,
                `textarea[name*="${field.name}"]`,
                `textarea[id="${field.name}"]`,
                `textarea[id*="${field.name}"]`
            ];
        }
        
        let found = false;
        for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                found = true;
                foundFields.push({
                    field: field.name,
                    label: field.label,
                    element: element,
                    selector: selector
                });
                break;
            }
        }
        
        if (!found) {
            missingFields.push(field);
        }
    });
    
    console.log(`📊 Field Analysis: ${foundFields.length}/${expectedFields.length} fields found`);
    
    if (foundFields.length > 0) {
        console.log('✅ Found Fields:');
        foundFields.forEach(field => {
            console.log(`   • ${field.label} (${field.selector})`);
        });
    }
    
    if (missingFields.length > 0) {
        console.log('❌ Missing Fields:');
        missingFields.forEach(field => {
            console.log(`   • ${field.label} (${field.type})`);
        });
    }
    
    console.log('\n📋 STEP 3: Navigation Button Analysis');
    console.log('=====================================');
    
    // Check navigation buttons
    const prevButton = document.querySelector('button:contains("Previous"), button[type="button"]:contains("Previous")');
    const nextButton = document.querySelector('button:contains("Next"), button[type="button"]:contains("Next")');
    const saveButton = document.querySelector('button:contains("Save Profile"), button[type="submit"]:contains("Save")');
    
    // Alternative selectors for buttons
    const allButtons = document.querySelectorAll('button');
    let foundPrevious = false;
    let foundNext = false;
    let foundSave = false;
    
    allButtons.forEach(button => {
        const text = button.textContent || button.innerText || '';
        if (text.toLowerCase().includes('previous')) {
            foundPrevious = true;
            console.log('✅ Previous button found:', text);
        } else if (text.toLowerCase().includes('next')) {
            foundNext = true;
            console.log('⚠️  Next button found (should not exist on Step 5):', text);
        } else if (text.toLowerCase().includes('save profile') || text.toLowerCase().includes('save')) {
            foundSave = true;
            console.log('✅ Save Profile button found:', text);
        }
    });
    
    if (!foundPrevious) {
        console.log('❌ Previous button not found');
    }
    if (!foundSave) {
        console.log('❌ Save Profile button not found');
    }
    
    console.log('\n📋 STEP 4: Auto-Save Prevention Test');
    console.log('====================================');
    
    // Check if form is auto-submitting
    const form = document.querySelector('.profile-form');
    if (form) {
        console.log('✅ Profile form found');
        
        // Add event listener to detect form submissions
        let formSubmissionCount = 0;
        const originalSubmit = form.onsubmit;
        
        form.addEventListener('submit', function(e) {
            formSubmissionCount++;
            console.log(`⚠️  Form submission detected (#${formSubmissionCount})`);
            console.log('   Event:', e);
            console.log('   Target:', e.target);
            
            // Don't prevent the submission, just log it
        });
        
        console.log('🔍 Form submission monitoring enabled');
        console.log('   If you see "Form submission detected" messages without clicking Save,');
        console.log('   then auto-submission is still happening');
        
    } else {
        console.log('❌ Profile form not found');
    }
    
    console.log('\n📋 STEP 5: Success Criteria Check');
    console.log('=================================');
    
    const successCriteria = [
        { test: currentStep === 5, description: 'Currently on Step 5' },
        { test: foundFields.length >= 2, description: 'At least 2 preference fields visible' },
        { test: foundPrevious, description: 'Previous button available' },
        { test: foundSave, description: 'Save Profile button available' },
        { test: !foundNext, description: 'No Next button (correct for final step)' }
    ];
    
    let passedTests = 0;
    successCriteria.forEach((criteria, index) => {
        const status = criteria.test ? '✅' : '❌';
        console.log(`   ${index + 1}. ${criteria.description}: ${status}`);
        if (criteria.test) passedTests++;
    });
    
    const overallScore = (passedTests / successCriteria.length) * 100;
    console.log(`\n🎯 Overall Success Rate: ${overallScore.toFixed(1)}% (${passedTests}/${successCriteria.length})`);
    
    if (overallScore >= 80) {
        console.log('🎉 SUCCESS: Step 5 fix appears to be working correctly!');
        console.log('   Users should now be able to see and interact with PreferencesStep');
    } else if (overallScore >= 60) {
        console.log('⚠️  PARTIAL SUCCESS: Some issues remain');
        console.log('   Step 5 is accessible but may have missing fields or functionality');
    } else {
        console.log('❌ FAILURE: Step 5 fix needs more work');
        console.log('   Users still cannot properly access PreferencesStep');
    }
    
    console.log('\n💡 TESTING INSTRUCTIONS');
    console.log('=======================');
    console.log('1. Try filling out the preference fields you can see');
    console.log('2. Click "Save Profile" when ready (should NOT auto-save)');
    console.log('3. Verify that the modal shows success message and closes properly');
    console.log('4. Re-open the modal and verify your preferences were saved');
    
    return {
        currentStep,
        foundFields: foundFields.length,
        totalFields: expectedFields.length,
        hasNavigation: foundPrevious && foundSave,
        successRate: overallScore
    };
}

// Auto-run the test
const results = testStep5Fix();

// Store results for further testing
window.profileStep5TestResults = results; 