/**
 * Final Module Integration Validation Test - Complete Fix Verification
 * Validates all 20 form fields, CSS classes, and integration components
 */

// Test Configuration
const REQUIRED_FIELDS = [
    'name', 'age', 'gender', 'height', 'height-unit', 'fitness-level',
    'primary-goal', 'secondary-goals', 'workout-focus', 'available-equipment',
    'preferred-location', 'workout-frequency', 'medical-conditions', 'injuries',
    'favorite-exercises', 'disliked-exercises', 'workout-duration', 'intensity-preference',
    'target-muscle-groups', 'specific-muscles'
];

const REQUIRED_CSS_CLASSES = [
    '.prompt-builder-form',
    '.form-section',
    '.muscle-selection-container',
    '.height-input-group',
    '#muscle-selection-summary'
];

const MUSCLE_GROUP_CONTAINERS = ['back', 'chest', 'arms', 'shoulders', 'core', 'legs'];
const ACTION_BUTTONS = ['load-profile', 'load-muscle-saved', 'get-muscle-suggestions'];

console.log('🔍 STARTING FINAL MODULE INTEGRATION VALIDATION - COMPLETE FIX');
console.log('============================================================');

// Test 1: Form Field Coverage (20 fields)
console.log('📋 TEST 1: Form Field Coverage (20 Required Fields)');
let fieldsFound = 0;
let fieldsMissing = [];

REQUIRED_FIELDS.forEach(fieldId => {
    const element = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`) || document.querySelector(`[name="${fieldId}[]"]`);
    if (element) {
        console.log(`✅ Field found: ${fieldId} (${element.tagName})`);
        fieldsFound++;
    } else {
        console.log(`❌ Field missing: ${fieldId}`);
        fieldsMissing.push(fieldId);
    }
});

console.log(`📊 Field Coverage: ${fieldsFound}/${REQUIRED_FIELDS.length} (${Math.round(fieldsFound/REQUIRED_FIELDS.length*100)}%)`);

// Test 2: CSS Classes Coverage  
console.log('\n🎨 TEST 2: CSS Classes Coverage');
let cssFound = 0;
let cssMissing = [];

REQUIRED_CSS_CLASSES.forEach(className => {
    const elements = document.querySelectorAll(className);
    if (elements.length > 0) {
        console.log(`✅ Style applied: ${className} (${elements.length} elements)`);
        cssFound++;
    } else {
        console.log(`❌ Style missing: ${className}`);
        cssMissing.push(className);
    }
});

console.log(`📊 CSS Coverage: ${cssFound}/${REQUIRED_CSS_CLASSES.length} (${Math.round(cssFound/REQUIRED_CSS_CLASSES.length*100)}%)`);

// Test 3: Muscle Group Containers
console.log('\n💪 TEST 3: Muscle Group Containers');
let muscleContainersFound = 0;

MUSCLE_GROUP_CONTAINERS.forEach(muscleGroup => {
    const container = document.getElementById(`muscle-group-${muscleGroup}`);
    if (container) {
        console.log(`✅ Muscle group container found: ${muscleGroup}`);
        muscleContainersFound++;
    } else {
        console.log(`❌ Muscle group container missing: ${muscleGroup}`);
    }
});

console.log(`📊 Muscle Containers: ${muscleContainersFound}/${MUSCLE_GROUP_CONTAINERS.length} (${Math.round(muscleContainersFound/MUSCLE_GROUP_CONTAINERS.length*100)}%)`);

// Test 4: Action Buttons
console.log('\n⚡ TEST 4: Action Buttons');
let buttonsFound = 0;

ACTION_BUTTONS.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
        console.log(`✅ Action button found: ${buttonId}`);
        buttonsFound++;
    } else {
        console.log(`❌ Action button missing: ${buttonId}`);
    }
});

console.log(`📊 Action Buttons: ${buttonsFound}/${ACTION_BUTTONS.length} (${Math.round(buttonsFound/ACTION_BUTTONS.length*100)}%)`);

// Test 5: Profile Integration Functions
console.log('\n👤 TEST 5: Profile Integration Functions');
let profileFunctionsFound = 0;

if (typeof window.loadUserProfile === 'function') {
    console.log('✅ loadUserProfile function exists');
    profileFunctionsFound++;
} else {
    console.log('❌ loadUserProfile function missing');
}

if (typeof window.populateFormWithProfile === 'function') {
    console.log('✅ populateFormWithProfile function exists');
    profileFunctionsFound++;
} else {
    console.log('❌ populateFormWithProfile function missing');
}

console.log(`📊 Profile Functions: ${profileFunctionsFound}/2 (${Math.round(profileFunctionsFound/2*100)}%)`);

// Test 6: Height Dual System
console.log('\n📏 TEST 6: Height Dual System');
let heightSystemFound = 0;

const heightImperial = document.getElementById('height-imperial');
const heightMetric = document.getElementById('height-metric');
if (heightImperial && heightMetric) {
    console.log('✅ Height dual system containers found');
    heightSystemFound++;
}

if (typeof toggleHeightFields === 'function') {
    console.log('✅ toggleHeightFields function exists');
    heightSystemFound++;
} else {
    console.log('❌ toggleHeightFields function missing');
}

console.log(`📊 Height System: ${heightSystemFound}/2 (${Math.round(heightSystemFound/2*100)}%)`);

// Test 7: Muscle Selection Functions
console.log('\n🎯 TEST 7: Muscle Selection Functions');
const MUSCLE_FUNCTIONS = [
    'toggleMuscleGroup', 'updateMuscleSelectionSummary', 'clearMuscleSelection',
    'populateNestedMuscleFields', 'collectNestedMuscleSelectionData',
    'loadMuscleSelections', 'loadMuscleSuggestions', 'applyNestedSuggestions'
];

let muscleFunctionsFound = 0;
MUSCLE_FUNCTIONS.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
        console.log(`✅ Muscle function found: ${funcName}`);
        muscleFunctionsFound++;
    } else {
        console.log(`❌ Muscle function missing: ${funcName}`);
    }
});

console.log(`📊 Muscle Functions: ${muscleFunctionsFound}/${MUSCLE_FUNCTIONS.length} (${Math.round(muscleFunctionsFound/MUSCLE_FUNCTIONS.length*100)}%)`);

// Test 8: Preview System
console.log('\n🔄 TEST 8: Dual Preview System');
let previewSystemFound = 0;

const workoutPreview = document.getElementById('workout-preview');
const strategyPreview = document.getElementById('strategy-preview');

if (workoutPreview) {
    console.log('✅ Workout preview container found');
    previewSystemFound++;
} else {
    console.log('❌ Workout preview container missing');
}

if (strategyPreview) {
    console.log('✅ Strategy preview container found');
    previewSystemFound++;
} else {
    console.log('❌ Strategy preview container missing');
}

console.log(`📊 Preview System: ${previewSystemFound}/2 (${Math.round(previewSystemFound/2*100)}%)`);

// FINAL SCORE CALCULATION
console.log('\n🏆 FINAL MODULE INTEGRATION VALIDATION RESULTS');
console.log('============================================================');

const totalComponents = REQUIRED_FIELDS.length + REQUIRED_CSS_CLASSES.length + MUSCLE_GROUP_CONTAINERS.length + 
                       ACTION_BUTTONS.length + 2 + 2 + MUSCLE_FUNCTIONS.length + 2; // 42 total components

const totalFound = fieldsFound + cssFound + muscleContainersFound + buttonsFound + 
                  profileFunctionsFound + heightSystemFound + muscleFunctionsFound + previewSystemFound;

const finalScore = Math.round((totalFound / totalComponents) * 100);

console.log(`📊 Overall Integration Score: ${totalFound}/${totalComponents} (${finalScore}%)`);

// Status Assessment
if (finalScore >= 95) {
    console.log('🌟 EXCELLENT: Production ready with comprehensive integration');
} else if (finalScore >= 90) {
    console.log('✅ GOOD: Production ready with minor optimization opportunities');  
} else if (finalScore >= 80) {
    console.log('⚠️ FAIR: Functional but needs attention to missing components');
} else {
    console.log('❌ NEEDS WORK: Critical components missing, requires fixes');
}

console.log('\n📋 DETAILED BREAKDOWN:');
console.log(`• Form Fields: ${fieldsFound}/${REQUIRED_FIELDS.length} (${Math.round(fieldsFound/REQUIRED_FIELDS.length*100)}%)`);
console.log(`• CSS Classes: ${cssFound}/${REQUIRED_CSS_CLASSES.length} (${Math.round(cssFound/REQUIRED_CSS_CLASSES.length*100)}%)`);
console.log(`• Muscle Containers: ${muscleContainersFound}/${MUSCLE_GROUP_CONTAINERS.length} (${Math.round(muscleContainersFound/MUSCLE_GROUP_CONTAINERS.length*100)}%)`);
console.log(`• Action Buttons: ${buttonsFound}/${ACTION_BUTTONS.length} (${Math.round(buttonsFound/ACTION_BUTTONS.length*100)}%)`);
console.log(`• Profile Functions: ${profileFunctionsFound}/2 (${Math.round(profileFunctionsFound/2*100)}%)`);
console.log(`• Height System: ${heightSystemFound}/2 (${Math.round(heightSystemFound/2*100)}%)`);
console.log(`• Muscle Functions: ${muscleFunctionsFound}/${MUSCLE_FUNCTIONS.length} (${Math.round(muscleFunctionsFound/MUSCLE_FUNCTIONS.length*100)}%)`);
console.log(`• Preview System: ${previewSystemFound}/2 (${Math.round(previewSystemFound/2*100)}%)`);

if (fieldsMissing.length > 0) {
    console.log('\n⚠️ MISSING FORM FIELDS:');
    fieldsMissing.forEach(field => console.log(`   - ${field}`));
}

if (cssMissing.length > 0) {
    console.log('\n⚠️ MISSING CSS CLASSES:');
    cssMissing.forEach(css => console.log(`   - ${css}`));
}

console.log('\n✅ FINAL MODULE INTEGRATION VALIDATION COMPLETE');
console.log('============================================================');

// Results object for automated testing
const validationResults = {
    score: finalScore,
    totalFound: totalFound,
    totalComponents: totalComponents,
    fieldsCoverage: Math.round(fieldsFound/REQUIRED_FIELDS.length*100),
    cssCoverage: Math.round(cssFound/REQUIRED_CSS_CLASSES.length*100),
    status: finalScore >= 90 ? 'PRODUCTION_READY' : finalScore >= 80 ? 'FUNCTIONAL' : 'NEEDS_WORK'
};

console.log('\n📈 VALIDATION RESULTS OBJECT:', validationResults); 