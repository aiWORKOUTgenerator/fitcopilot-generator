/**
 * Comprehensive Profile Fields Test
 * Tests all profile data fields in PromptBuilder form population
 */

console.log('🧪 Starting Comprehensive Profile Fields Test...');

// Test data structure matching the enhanced backend
const testProfileData = {
    basic_info: {
        first_name: "Justin",
        last_name: "Fassio", 
        age: 35,
        gender: "male",
        fitness_level: "advanced",
        weight: 180,
        weight_unit: "lbs",
        height: 72,
        height_unit: "ft"
    },
    goals: {
        primary_goal: "strength",
        secondary_goals: ["muscle_building"],
        target_areas: ["chest", "arms"]
    },
    equipment: ["dumbbells", "resistance_bands", "pull_up_bar"],
    location: {
        preferred_location: "home"
    },
    session_params: {
        duration: 45,
        frequency: "4-5",
        focus: "upper_body",
        energy_level: 4,
        stress_level: 2,
        sleep_quality: 4
    },
    limitations: {
        physical_limitations: ["knee_issues", "back_problems"],
        limitation_notes: "Left knee pain from old injury",
        medical_conditions: "Mild arthritis in knees",
        injuries: "Previous ACL tear (recovered)"
    },
    exercise_preferences: {
        favorite_exercises: "Push-ups, pull-ups, deadlifts",
        disliked_exercises: "Burpees, high-impact cardio"
    },
    custom_instructions: "Prefer compound movements, avoid jumping exercises"
};

// Test 1: Check if all form fields exist
console.log('\n📋 Test 1: Form Field Existence Check');
const expectedFields = [
    // Basic Info
    'firstName', 'lastName', 'age', 'gender', 'fitnessLevel', 
    'weight', 'weightUnit', 'height', 'heightUnit',
    
    // Location & Preferences
    'preferredLocation', 'workoutFrequency', 'testDuration',
    
    // Limitations & Health
    'limitationNotes', 'medicalConditions', 'injuries',
    
    // Exercise Preferences
    'favoriteExercises', 'dislikedExercises',
    
    // Session Parameters
    'testFocus', 'energyLevel', 'stressLevel',
    
    // Custom Instructions
    'customNotes'
];

const missingFields = [];
const existingFields = [];

expectedFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        existingFields.push(fieldId);
        console.log(`✅ ${fieldId}: Found (${field.tagName})`);
    } else {
        missingFields.push(fieldId);
        console.log(`❌ ${fieldId}: Missing`);
    }
});

console.log(`\n📊 Field Existence Summary:`);
console.log(`✅ Existing: ${existingFields.length}/${expectedFields.length}`);
console.log(`❌ Missing: ${missingFields.length}/${expectedFields.length}`);

if (missingFields.length > 0) {
    console.log(`\n⚠️ Missing fields: ${missingFields.join(', ')}`);
}

// Test 2: Simulate profile data population
console.log('\n📋 Test 2: Profile Data Population Simulation');

// Mock the populateFormWithProfile method
function testPopulateFormWithProfile(profileData) {
    console.log('🔄 Simulating profile population...');
    
    const results = {
        populated: [],
        failed: [],
        skipped: []
    };
    
    try {
        // Basic info mapping
        if (profileData.basic_info) {
            const basicInfo = profileData.basic_info;
            
            // Test each basic field
            const basicFields = [
                {key: 'first_name', id: 'firstName'},
                {key: 'last_name', id: 'lastName'},
                {key: 'age', id: 'age'},
                {key: 'gender', id: 'gender'},
                {key: 'fitness_level', id: 'fitnessLevel'},
                {key: 'weight', id: 'weight'},
                {key: 'weight_unit', id: 'weightUnit'},
                {key: 'height', id: 'height'},
                {key: 'height_unit', id: 'heightUnit'}
            ];
            
            basicFields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element && basicInfo[field.key]) {
                    element.value = basicInfo[field.key];
                    results.populated.push(`${field.id} = "${basicInfo[field.key]}"`);
                } else if (!element) {
                    results.failed.push(`${field.id} (element not found)`);
                } else {
                    results.skipped.push(`${field.id} (no data)`);
                }
            });
        }
        
        // Location preferences
        if (profileData.location && profileData.location.preferred_location) {
            const element = document.getElementById('preferredLocation');
            if (element) {
                element.value = profileData.location.preferred_location;
                results.populated.push(`preferredLocation = "${profileData.location.preferred_location}"`);
            } else {
                results.failed.push('preferredLocation (element not found)');
            }
        }
        
        // Session params
        if (profileData.session_params) {
            const sessionFields = [
                {key: 'duration', id: 'testDuration'},
                {key: 'frequency', id: 'workoutFrequency'},
                {key: 'focus', id: 'testFocus'},
                {key: 'energy_level', id: 'energyLevel'},
                {key: 'stress_level', id: 'stressLevel'}
            ];
            
            sessionFields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element && profileData.session_params[field.key]) {
                    element.value = profileData.session_params[field.key];
                    results.populated.push(`${field.id} = "${profileData.session_params[field.key]}"`);
                } else if (!element) {
                    results.failed.push(`${field.id} (element not found)`);
                } else {
                    results.skipped.push(`${field.id} (no data)`);
                }
            });
        }
        
        // Limitations
        if (profileData.limitations) {
            const limitationFields = [
                {key: 'limitation_notes', id: 'limitationNotes'},
                {key: 'medical_conditions', id: 'medicalConditions'},
                {key: 'injuries', id: 'injuries'}
            ];
            
            limitationFields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element && profileData.limitations[field.key]) {
                    element.value = profileData.limitations[field.key];
                    results.populated.push(`${field.id} = "${profileData.limitations[field.key]}"`);
                } else if (!element) {
                    results.failed.push(`${field.id} (element not found)`);
                } else {
                    results.skipped.push(`${field.id} (no data)`);
                }
            });
        }
        
        // Exercise preferences
        if (profileData.exercise_preferences) {
            const exerciseFields = [
                {key: 'favorite_exercises', id: 'favoriteExercises'},
                {key: 'disliked_exercises', id: 'dislikedExercises'}
            ];
            
            exerciseFields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element && profileData.exercise_preferences[field.key]) {
                    element.value = profileData.exercise_preferences[field.key];
                    results.populated.push(`${field.id} = "${profileData.exercise_preferences[field.key]}"`);
                } else if (!element) {
                    results.failed.push(`${field.id} (element not found)`);
                } else {
                    results.skipped.push(`${field.id} (no data)`);
                }
            });
        }
        
        // Custom instructions
        if (profileData.custom_instructions) {
            const element = document.getElementById('customNotes');
            if (element) {
                element.value = profileData.custom_instructions;
                results.populated.push(`customNotes = "${profileData.custom_instructions}"`);
            } else {
                results.failed.push('customNotes (element not found)');
            }
        }
        
    } catch (error) {
        console.error('❌ Error during population:', error);
        results.failed.push(`Error: ${error.message}`);
    }
    
    return results;
}

// Run the population test
const populationResults = testPopulateFormWithProfile(testProfileData);

console.log('\n📊 Population Results:');
console.log(`✅ Successfully Populated: ${populationResults.populated.length}`);
populationResults.populated.forEach(item => console.log(`  ✅ ${item}`));

console.log(`\n❌ Failed to Populate: ${populationResults.failed.length}`);
populationResults.failed.forEach(item => console.log(`  ❌ ${item}`));

console.log(`\n⏩ Skipped (No Data): ${populationResults.skipped.length}`);
populationResults.skipped.forEach(item => console.log(`  ⏩ ${item}`));

// Test 3: Check current form values
console.log('\n📋 Test 3: Current Form Values Check');
const currentValues = {};
expectedFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        currentValues[fieldId] = field.value || '(empty)';
        console.log(`📝 ${fieldId}: "${field.value || '(empty)'}"`);
    }
});

// Test 4: Equipment and limitations checkboxes
console.log('\n📋 Test 4: Checkbox Field Tests');
const checkboxTests = [
    {name: 'availableEquipment[]', values: testProfileData.equipment},
    {name: 'limitations[]', values: testProfileData.limitations.physical_limitations}
];

checkboxTests.forEach(test => {
    const checkboxes = document.querySelectorAll(`input[name="${test.name}"]`);
    console.log(`\n🔲 ${test.name}:`);
    console.log(`  Found ${checkboxes.length} checkboxes`);
    
    if (test.values && Array.isArray(test.values)) {
        test.values.forEach(value => {
            const checkbox = document.querySelector(`input[name="${test.name}"][value="${value}"]`);
            if (checkbox) {
                checkbox.checked = true;
                console.log(`  ✅ Checked: ${value}`);
            } else {
                console.log(`  ❌ Not found: ${value}`);
            }
        });
    }
});

// Final Summary
console.log('\n🎯 COMPREHENSIVE TEST SUMMARY');
console.log('=====================================');
console.log(`📋 Total Expected Fields: ${expectedFields.length}`);
console.log(`✅ Fields Found: ${existingFields.length}`);
console.log(`❌ Fields Missing: ${missingFields.length}`);
console.log(`📝 Fields Populated: ${populationResults.populated.length}`);
console.log(`❌ Population Failures: ${populationResults.failed.length}`);

const successRate = Math.round((existingFields.length / expectedFields.length) * 100);
console.log(`\n📊 Form Completeness: ${successRate}%`);

if (successRate >= 90) {
    console.log('🎉 EXCELLENT: Form is comprehensive and ready for all profile data!');
} else if (successRate >= 75) {
    console.log('✅ GOOD: Most fields available, minor improvements needed');
} else {
    console.log('⚠️ NEEDS WORK: Significant fields missing, form needs updates');
}

console.log('\n🔧 RECOMMENDATIONS:');
if (missingFields.length > 0) {
    console.log('1. Add missing form fields to PromptBuilder HTML');
    console.log('2. Update form population logic for new fields');
    console.log('3. Test backend data structure matches frontend expectations');
}

console.log('\n✅ Comprehensive Profile Fields Test Complete!'); 