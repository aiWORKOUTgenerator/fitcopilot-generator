/**
 * Profile Form Navigation Debug Test
 * 
 * Run this script on the Dashboard Profile tab with the ProfileEditModal OPEN
 * This will help identify why Step 4 is triggering save instead of going to Step 5
 */

console.log('🔧 PROFILE FORM NAVIGATION DEBUG TEST');
console.log('=====================================');

function debugFormNavigation() {
    console.log('\n📋 STEP 1: Form State Analysis');
    console.log('==============================');
    
    // Check if modal is open
    const modal = document.querySelector('.profile-edit-modal__overlay');
    if (!modal) {
        console.log('❌ ProfileEditModal is not open');
        console.log('💡 Please click "Edit Profile" button first, then re-run this test');
        return;
    }
    
    console.log('✅ ProfileEditModal is open');
    
    // Check form progress indicators
    const stepIndicators = document.querySelectorAll('.form-progress .step-indicator');
    const currentStepElement = document.querySelector('.form-progress .step-indicator.active');
    
    console.log(`📊 Total step indicators found: ${stepIndicators.length}`);
    
    if (currentStepElement) {
        const currentStepIndex = Array.from(stepIndicators).indexOf(currentStepElement);
        const currentStepNumber = currentStepIndex + 1;
        console.log(`📍 Current step: ${currentStepNumber}`);
        
        // Check step labels
        stepIndicators.forEach((indicator, index) => {
            const stepNumber = index + 1;
            const stepLabel = indicator.querySelector('.step-label')?.textContent || 'Unknown';
            const isActive = indicator.classList.contains('active');
            const isCompleted = indicator.classList.contains('completed');
            
            console.log(`   Step ${stepNumber}: ${stepLabel} ${isActive ? '(ACTIVE)' : ''} ${isCompleted ? '(COMPLETED)' : ''}`);
        });
    } else {
        console.log('⚠️  Could not determine current step');
    }
    
    // Check navigation buttons
    console.log('\n🔍 STEP 2: Navigation Buttons Analysis');
    console.log('======================================');
    
    const prevButton = document.querySelector('.form-navigation button[type="button"]:not(.button-text)');
    const nextButton = document.querySelector('.form-navigation button[type="button"]:not(.button-text):not(.button-secondary)');
    const submitButton = document.querySelector('.form-navigation button[type="submit"]');
    
    console.log(`   Previous button: ${prevButton ? '✅ Found' : '❌ Not found'}`);
    if (prevButton) {
        console.log(`      Text: "${prevButton.textContent}"`);
        console.log(`      Disabled: ${prevButton.disabled}`);
    }
    
    console.log(`   Next button: ${nextButton ? '✅ Found' : '❌ Not found'}`);
    if (nextButton) {
        console.log(`      Text: "${nextButton.textContent}"`);
        console.log(`      Disabled: ${nextButton.disabled}`);
    }
    
    console.log(`   Submit button: ${submitButton ? '✅ Found' : '❌ Not found'}`);
    if (submitButton) {
        console.log(`      Text: "${submitButton.textContent}"`);
        console.log(`      Disabled: ${submitButton.disabled}`);
    }
    
    // Check which button is actually visible
    const allNavButtons = document.querySelectorAll('.form-navigation button');
    console.log(`\n   All navigation buttons (${allNavButtons.length}):`);
    allNavButtons.forEach((button, index) => {
        const isVisible = window.getComputedStyle(button).display !== 'none';
        const buttonType = button.getAttribute('type') || 'button';
        console.log(`      ${index + 1}. "${button.textContent}" (type: ${buttonType}) ${isVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    });
    
    // Check form state in React DevTools (if available)
    console.log('\n🔍 STEP 3: React State Analysis');
    console.log('===============================');
    
    // Try to access React fiber data
    const formElement = document.querySelector('.profile-form');
    if (formElement && formElement._reactInternalFiber) {
        console.log('✅ React fiber data found - checking form state...');
        // This is a simplified check - in practice you'd need React DevTools
    } else {
        console.log('⚠️  React fiber data not accessible');
        console.log('   💡 Use React DevTools to inspect ProfileForm component state');
        console.log('   💡 Look for: currentStep, totalSteps, isLastStep values');
    }
    
    return {
        totalSteps: stepIndicators.length,
        currentStep: currentStepElement ? Array.from(stepIndicators).indexOf(currentStepElement) + 1 : null,
        hasNextButton: !!nextButton,
        hasSubmitButton: !!submitButton
    };
}

function debugStepContent() {
    console.log('\n📋 STEP 4: Current Step Content Analysis');
    console.log('=========================================');
    
    // Check what step content is currently displayed
    const stepContainer = document.querySelector('.form-step-container');
    if (!stepContainer) {
        console.log('❌ Form step container not found');
        return;
    }
    
    // Look for step-specific content
    const basicInfoInputs = stepContainer.querySelectorAll('input[name*="firstName"], input[name*="lastName"]');
    const bodyMetricInputs = stepContainer.querySelectorAll('input[name*="age"], input[name*="weight"], input[name*="height"]');
    const equipmentInputs = stepContainer.querySelectorAll('input[type="checkbox"], select[name*="equipment"]');
    const healthInputs = stepContainer.querySelectorAll('input[name*="limitation"], textarea[name*="limitation"]');
    const preferenceInputs = stepContainer.querySelectorAll('input[name*="frequency"], input[name*="duration"], textarea[name*="exercise"]');
    
    console.log('📊 Step Content Detection:');
    console.log(`   Basic Info fields: ${basicInfoInputs.length} ${basicInfoInputs.length > 0 ? '(Step 1)' : ''}`);
    console.log(`   Body Metrics fields: ${bodyMetricInputs.length} ${bodyMetricInputs.length > 0 ? '(Step 2)' : ''}`);
    console.log(`   Equipment fields: ${equipmentInputs.length} ${equipmentInputs.length > 0 ? '(Step 3)' : ''}`);
    console.log(`   Health fields: ${healthInputs.length} ${healthInputs.length > 0 ? '(Step 4)' : ''}`);
    console.log(`   Preference fields: ${preferenceInputs.length} ${preferenceInputs.length > 0 ? '(Step 5)' : ''}`);
    
    // Check for the new preferredWorkoutDuration field specifically
    const durationField = stepContainer.querySelector('input[name*="duration"], input[id*="duration"]');
    console.log(`\n🎯 Duration Field Check:`);
    console.log(`   Duration field found: ${durationField ? '✅ YES' : '❌ NO'}`);
    if (durationField) {
        console.log(`      Field name: ${durationField.name || durationField.id}`);
        console.log(`      Field value: "${durationField.value}"`);
        console.log(`      Field type: ${durationField.type}`);
    }
    
    // Check for workout frequency and exercise preference fields
    const frequencyField = stepContainer.querySelector('select[name*="frequency"], input[name*="frequency"]');
    const exerciseFields = stepContainer.querySelectorAll('textarea[name*="exercise"], input[name*="exercise"]');
    
    console.log(`   Frequency field: ${frequencyField ? '✅ YES' : '❌ NO'}`);
    console.log(`   Exercise preference fields: ${exerciseFields.length}`);
    
    if (exerciseFields.length > 0) {
        exerciseFields.forEach((field, index) => {
            console.log(`      ${index + 1}. ${field.name || field.id}: "${field.value}"`);
        });
    }
}

function provideFix() {
    console.log('\n🔧 STEP 5: Debugging Instructions');
    console.log('==================================');
    
    const result = debugFormNavigation();
    
    if (!result) {
        console.log('❌ Could not analyze form - modal may not be open');
        return;
    }
    
    console.log('\n💡 POTENTIAL ISSUES TO CHECK:');
    
    if (result.totalSteps !== 5) {
        console.log(`❌ ISSUE: Expected 5 steps, found ${result.totalSteps}`);
        console.log('   🔧 Check useProfileForm.ts TOTAL_STEPS constant');
    }
    
    if (result.currentStep === 4 && result.hasSubmitButton && !result.hasNextButton) {
        console.log('❌ ISSUE: Step 4 showing Submit button instead of Next');
        console.log('   🔧 Check isLastStep calculation in ProfileForm.tsx');
        console.log('   🔧 Verify: isLastStep={currentStep === totalSteps}');
    }
    
    if (result.currentStep === 4) {
        console.log('\n🧪 MANUAL TEST: Try clicking Next button');
        console.log('   1. Look at browser console for [ProfileForm] logs');
        console.log('   2. Check if validation is failing');
        console.log('   3. Verify step advances to 5');
        
        // Try to find and highlight the next button
        const nextBtn = document.querySelector('.form-navigation button[type="button"]:not(.button-secondary)');
        if (nextBtn) {
            console.log('   💡 Next button found - highlighting it...');
            nextBtn.style.border = '3px solid red';
            nextBtn.style.boxShadow = '0 0 10px red';
            setTimeout(() => {
                nextBtn.style.border = '';
                nextBtn.style.boxShadow = '';
            }, 3000);
        }
    }
    
    console.log('\n🔍 REACT DEVTOOLS INSPECTION:');
    console.log('   1. Open React DevTools');
    console.log('   2. Find ProfileForm component');
    console.log('   3. Check these values:');
    console.log('      - currentStep (should be 1-5)');
    console.log('      - totalSteps (should be 5)');
    console.log('      - isLastStep (should be false for steps 1-4)');
    
    console.log('\n📝 CONSOLE COMMANDS TO TRY:');
    console.log('   // Force navigate to step 5:');
    console.log('   // (This won\'t work without React context, but shows the concept)');
    console.log('   // setCurrentStep(5)');
}

// Run the debug analysis
debugFormNavigation();
debugStepContent();
provideFix();

console.log('\n🎯 SUMMARY');
console.log('==========');
console.log('This test analyzes the ProfileEditModal navigation issue.');
console.log('If Step 4 is showing "Save Profile" instead of "Next",');
console.log('the issue is likely in the isLastStep calculation.');
console.log('');
console.log('Expected behavior:');
console.log('  Steps 1-4: Show "Next" button');
console.log('  Step 5: Show "Save Profile" button'); 