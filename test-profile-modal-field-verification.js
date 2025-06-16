/**
 * Profile Edit Modal Field Verification Test
 * 
 * Verifies that all 14 profile data points are accessible in the ProfileEditModal
 * Run this script on the Dashboard Profile tab with the modal OPEN
 */

console.log('🔧 PROFILE EDIT MODAL FIELD VERIFICATION TEST');
console.log('==============================================');

// The 14 expected profile data points from the API
const EXPECTED_PROFILE_FIELDS = [
  { field: 'firstName', step: 1, stepName: 'BasicInfoStep' },
  { field: 'lastName', step: 1, stepName: 'BasicInfoStep' },
  { field: 'fitnessLevel', step: 1, stepName: 'BasicInfoStep' },
  { field: 'goals', step: 1, stepName: 'BasicInfoStep' },
  { field: 'age', step: 2, stepName: 'BodyMetricsStep' },
  { field: 'weight', step: 2, stepName: 'BodyMetricsStep' },
  { field: 'height', step: 2, stepName: 'BodyMetricsStep' },
  { field: 'gender', step: 2, stepName: 'BodyMetricsStep' },
  { field: 'availableEquipment', step: 3, stepName: 'EquipmentStep' },
  { field: 'preferredLocation', step: 3, stepName: 'EquipmentStep' },
  { field: 'limitations', step: 4, stepName: 'HealthStep' },
  { field: 'limitationNotes', step: 4, stepName: 'HealthStep' },
  { field: 'workoutFrequency', step: 5, stepName: 'PreferencesStep' },
  { field: 'preferredWorkoutDuration', step: 5, stepName: 'PreferencesStep' }, // NEWLY ADDED
  { field: 'favoriteExercises', step: 5, stepName: 'PreferencesStep' },
  { field: 'dislikedExercises', step: 5, stepName: 'PreferencesStep' }
];

function checkModalState() {
  console.log('\n🔍 STEP 1: Modal State Check');
  console.log('============================');
  
  const modalOverlay = document.querySelector('.profile-edit-modal__overlay');
  const modalContent = document.querySelector('.profile-edit-modal__content');
  const profileForm = document.querySelector('.profile-form');
  
  if (!modalOverlay) {
    console.log('❌ ProfileEditModal overlay not found');
    console.log('💡 Please open the Profile Edit Modal first:');
    console.log('   1. Go to Dashboard → Profile tab');
    console.log('   2. Click "Edit Profile" button');
    console.log('   3. Re-run this test script');
    return false;
  }
  
  const isVisible = modalOverlay.classList.contains('visible') || 
                   getComputedStyle(modalOverlay).visibility === 'visible';
  
  if (!isVisible) {
    console.log('⚠️  ProfileEditModal found but not visible');
    console.log('💡 Please ensure the modal is open and visible');
    return false;
  }
  
  console.log('✅ ProfileEditModal is open and visible');
  console.log(`   Modal overlay: ${modalOverlay ? '✅' : '❌'}`);
  console.log(`   Modal content: ${modalContent ? '✅' : '❌'}`);
  console.log(`   Profile form: ${profileForm ? '✅' : '❌'}`);
  
  return true;
}

function checkFormSteps() {
  console.log('\n📋 STEP 2: Form Steps Analysis');
  console.log('==============================');
  
  // Check current step indicator
  const stepIndicators = document.querySelectorAll('.form-progress .step-indicator');
  const currentStepElement = document.querySelector('.form-progress .step-indicator.current, .form-progress .step-indicator.active');
  
  console.log(`📊 Total form steps: ${stepIndicators.length}`);
  
  if (currentStepElement) {
    const currentStepNumber = Array.from(stepIndicators).indexOf(currentStepElement) + 1;
    console.log(`📍 Current step: ${currentStepNumber}`);
  } else {
    console.log('⚠️  Could not determine current step');
  }
  
  // Check step navigation
  const prevButton = document.querySelector('button[type="button"]:not(.modal-close-button)');
  const nextButton = document.querySelector('button[type="submit"], button:contains("Next")');
  
  console.log(`   Previous button: ${prevButton ? '✅' : '❌'}`);
  console.log(`   Next/Submit button: ${nextButton ? '✅' : '❌'}`);
  
  return {
    totalSteps: stepIndicators.length,
    currentStep: currentStepElement ? Array.from(stepIndicators).indexOf(currentStepElement) + 1 : 1
  };
}

function checkFieldsInCurrentStep(currentStep) {
  console.log(`\n🔍 STEP 3: Field Check - Step ${currentStep}`);
  console.log('=====================================');
  
  const fieldsInCurrentStep = EXPECTED_PROFILE_FIELDS.filter(f => f.step === currentStep);
  const foundFields = [];
  const missingFields = [];
  
  console.log(`📋 Expected fields in Step ${currentStep} (${fieldsInCurrentStep[0]?.stepName}):`);
  
  fieldsInCurrentStep.forEach(fieldInfo => {
    const { field } = fieldInfo;
    
    // Try multiple selector patterns for each field type
    const selectors = [
      `input[name="${field}"]`,
      `input[name*="${field}"]`,
      `select[name="${field}"]`,
      `select[name*="${field}"]`,
      `textarea[name="${field}"]`,
      `textarea[name*="${field}"]`,
      `input[id="${field}"]`,
      `input[id*="${field}"]`,
      `select[id="${field}"]`,
      `select[id*="${field}"]`,
      `textarea[id="${field}"]`,
      `textarea[id*="${field}"]`
    ];
    
    let fieldElement = null;
    let usedSelector = '';
    
    for (const selector of selectors) {
      fieldElement = document.querySelector(selector);
      if (fieldElement) {
        usedSelector = selector;
        break;
      }
    }
    
    if (fieldElement) {
      foundFields.push({
        field,
        element: fieldElement,
        selector: usedSelector,
        type: fieldElement.tagName.toLowerCase(),
        value: fieldElement.value || fieldElement.checked || 'N/A'
      });
      console.log(`   ✅ ${field}: Found (${fieldElement.tagName.toLowerCase()})`);
    } else {
      missingFields.push(field);
      console.log(`   ❌ ${field}: Not found`);
    }
  });
  
  return { foundFields, missingFields, fieldsInCurrentStep };
}

function checkAllStepsFields() {
  console.log('\n🔍 STEP 4: Complete Field Coverage Analysis');
  console.log('===========================================');
  
  const allFoundFields = [];
  const allMissingFields = [];
  
  // Group fields by step
  const fieldsByStep = {};
  EXPECTED_PROFILE_FIELDS.forEach(fieldInfo => {
    if (!fieldsByStep[fieldInfo.step]) {
      fieldsByStep[fieldInfo.step] = [];
    }
    fieldsByStep[fieldInfo.step].push(fieldInfo);
  });
  
  // Check each step
  Object.keys(fieldsByStep).forEach(step => {
    const stepNum = parseInt(step);
    const fieldsInStep = fieldsByStep[step];
    
    console.log(`\n📋 Step ${stepNum} (${fieldsInStep[0].stepName}):`);
    
    fieldsInStep.forEach(fieldInfo => {
      const { field } = fieldInfo;
      
      // Use broader search since we're checking all steps
      const fieldExists = document.querySelector(`[name*="${field}"], [id*="${field}"]`) !== null;
      
      if (fieldExists) {
        allFoundFields.push(field);
        console.log(`   ✅ ${field}`);
      } else {
        allMissingFields.push(field);
        console.log(`   ❌ ${field}`);
      }
    });
  });
  
  return { allFoundFields, allMissingFields };
}

function generateNavigationInstructions(missingFields) {
  if (missingFields.length === 0) {
    console.log('\n🎉 SUCCESS: All fields are accessible!');
    return;
  }
  
  console.log('\n🧭 NAVIGATION INSTRUCTIONS');
  console.log('==========================');
  console.log('To verify missing fields, navigate through the form steps:');
  
  const fieldsByStep = {};
  EXPECTED_PROFILE_FIELDS.forEach(fieldInfo => {
    if (missingFields.includes(fieldInfo.field)) {
      if (!fieldsByStep[fieldInfo.step]) {
        fieldsByStep[fieldInfo.step] = [];
      }
      fieldsByStep[fieldInfo.step].push(fieldInfo);
    }
  });
  
  Object.keys(fieldsByStep).forEach(step => {
    const stepNum = parseInt(step);
    const fieldsInStep = fieldsByStep[step];
    
    console.log(`\n📍 Step ${stepNum} (${fieldsInStep[0].stepName}):`);
    console.log(`   Missing fields: ${fieldsInStep.map(f => f.field).join(', ')}`);
    console.log(`   💡 Navigate to step ${stepNum} and re-run this test`);
  });
}

function runCompleteTest() {
  console.log('🚀 Starting complete ProfileEditModal field verification...\n');
  
  // Step 1: Check modal state
  if (!checkModalState()) {
    return;
  }
  
  // Step 2: Analyze form steps
  const stepInfo = checkFormSteps();
  
  // Step 3: Check fields in current step
  const currentStepResults = checkFieldsInCurrentStep(stepInfo.currentStep);
  
  // Step 4: Check all fields (broader search)
  const allFieldsResults = checkAllStepsFields();
  
  // Step 5: Generate summary
  console.log('\n📊 FINAL SUMMARY');
  console.log('================');
  
  const totalExpected = EXPECTED_PROFILE_FIELDS.length;
  const totalFound = allFieldsResults.allFoundFields.length;
  const completionPercentage = Math.round((totalFound / totalExpected) * 100);
  
  console.log(`📈 Field Coverage: ${totalFound}/${totalExpected} (${completionPercentage}%)`);
  
  if (totalFound === totalExpected) {
    console.log('🎉 SUCCESS: All 14 profile fields are accessible in the modal!');
    console.log('✅ ProfileEditModal is now complete');
  } else {
    console.log(`⚠️  Missing ${totalExpected - totalFound} field(s):`);
    allFieldsResults.allMissingFields.forEach(field => {
      const fieldInfo = EXPECTED_PROFILE_FIELDS.find(f => f.field === field);
      console.log(`   ❌ ${field} (Step ${fieldInfo.step} - ${fieldInfo.stepName})`);
    });
    
    generateNavigationInstructions(allFieldsResults.allMissingFields);
  }
  
  // Special check for the newly added preferredWorkoutDuration
  const durationField = allFieldsResults.allFoundFields.includes('preferredWorkoutDuration');
  console.log(`\n🎯 NEW FIELD CHECK:`);
  console.log(`   preferredWorkoutDuration: ${durationField ? '✅ FOUND' : '❌ MISSING'}`);
  
  if (durationField) {
    console.log('   🎉 Successfully added to PreferencesStep!');
  } else {
    console.log('   💡 Navigate to Step 5 (PreferencesStep) to verify');
  }
}

// Auto-run the test
runCompleteTest(); 