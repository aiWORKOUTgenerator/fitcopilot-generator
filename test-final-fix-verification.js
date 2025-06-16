// Test script to verify WorkoutSelectionSummary fix is working
// Run this in browser console when viewing a workout in UnifiedWorkoutModal

console.log('🔍 VERIFYING WorkoutSelectionSummary Fix');

// 1. Check if WorkoutSelectionSummary component exists
const summaryElement = document.querySelector('.workout-selection-summary');
if (summaryElement) {
    console.log('✅ WorkoutSelectionSummary component found');
} else {
    console.log('❌ WorkoutSelectionSummary component NOT found');
}

// 2. Check for "Complexity" field specifically
const complexityElements = document.querySelectorAll('.selection-item');
let foundComplexity = false;
let complexityValue = null;

complexityElements.forEach(element => {
    const text = element.textContent || '';
    if (text.includes('Complexity:')) {
        foundComplexity = true;
        complexityValue = text.replace('Complexity:', '').trim();
        console.log('✅ Found Complexity field:', complexityValue);
    }
});

if (!foundComplexity) {
    console.log('❌ Complexity field NOT found');
}

// 3. Check for "Fitness Level" field
let foundFitnessLevel = false;
let fitnessLevelValue = null;

complexityElements.forEach(element => {
    const text = element.textContent || '';
    if (text.includes('Fitness Level:')) {
        foundFitnessLevel = true;
        fitnessLevelValue = text.replace('Fitness Level:', '').trim();
        console.log('✅ Found Fitness Level field:', fitnessLevelValue);
    }
});

if (!foundFitnessLevel) {
    console.log('❌ Fitness Level field NOT found');
}

// 4. Verify the values are correct (should be "Advanced" not "Moderate"/"Intermediate")
if (foundComplexity && complexityValue) {
    if (complexityValue.toLowerCase().includes('advanced')) {
        console.log('✅ Complexity shows CORRECT value: Advanced');
    } else if (complexityValue.toLowerCase().includes('moderate')) {
        console.log('❌ Complexity still shows WRONG value: Moderate (fix not working)');
    } else {
        console.log('⚠️ Complexity shows unexpected value:', complexityValue);
    }
}

if (foundFitnessLevel && fitnessLevelValue) {
    if (fitnessLevelValue.toLowerCase().includes('advanced')) {
        console.log('✅ Fitness Level shows CORRECT value: Advanced');
    } else if (fitnessLevelValue.toLowerCase().includes('intermediate')) {
        console.log('❌ Fitness Level still shows WRONG value: Intermediate (fix not working)');
    } else {
        console.log('⚠️ Fitness Level shows unexpected value:', fitnessLevelValue);
    }
}

// 5. Summary
console.log('\n📊 VERIFICATION SUMMARY:');
console.log('- WorkoutSelectionSummary component:', summaryElement ? '✅ Found' : '❌ Missing');
console.log('- Complexity field:', foundComplexity ? `✅ Found (${complexityValue})` : '❌ Missing');
console.log('- Fitness Level field:', foundFitnessLevel ? `✅ Found (${fitnessLevelValue})` : '❌ Missing');

if (foundComplexity && foundFitnessLevel) {
    const complexityCorrect = complexityValue && complexityValue.toLowerCase().includes('advanced');
    const fitnessCorrect = fitnessLevelValue && fitnessLevelValue.toLowerCase().includes('advanced');
    
    if (complexityCorrect && fitnessCorrect) {
        console.log('🎉 SUCCESS: Both fields show correct "Advanced" values!');
    } else {
        console.log('❌ ISSUE: One or both fields still show incorrect values');
    }
} else {
    console.log('❌ ISSUE: Missing required fields');
} 