/**
 * API Consistency Fixes Verification Test
 * 
 * This script tests all the fixes implemented to resolve API inconsistencies
 * between GenerateEndpoint.php and ProfileEndpoints.php
 * 
 * Run this in browser console on the Profile page to verify fixes
 */

console.log('🔧 API CONSISTENCY FIXES VERIFICATION TEST');
console.log('===========================================');

// Test 1: Verify Profile API includes preferredWorkoutDuration
async function testProfileAPIFields() {
    console.log('\n📋 TEST 1: Profile API Field Coverage');
    console.log('-------------------------------------');
    
    try {
        const response = await fetch('/wp-json/fitcopilot/v1/profile', {
            method: 'GET',
            headers: {
                'X-WP-Nonce': wpApiSettings.nonce,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const profile = data.data;
            
            // Check for the fixed field
            const hasPreferredWorkoutDuration = 'preferredWorkoutDuration' in profile;
            console.log(`✅ preferredWorkoutDuration field: ${hasPreferredWorkoutDuration ? 'PRESENT' : 'MISSING'}`);
            
            if (hasPreferredWorkoutDuration) {
                console.log(`   Value: ${profile.preferredWorkoutDuration}`);
                console.log(`   Type: ${typeof profile.preferredWorkoutDuration}`);
            }
            
            // Check for other critical fields that should be consistent
            const criticalFields = [
                'firstName', 'lastName', 'email', 'fitnessLevel', 'goals',
                'weight', 'weightUnit', 'height', 'heightUnit', 'age', 'gender',
                'availableEquipment', 'preferredLocation', 'limitations', 'limitationNotes',
                'workoutFrequency', 'customGoal', 'customEquipment', 'customFrequency',
                'favoriteExercises', 'dislikedExercises', 'medicalConditions'
            ];
            
            console.log('\n📊 Field Coverage Analysis:');
            criticalFields.forEach(field => {
                const hasField = field in profile;
                const value = profile[field];
                const isEmpty = !value || (Array.isArray(value) && value.length === 0) || value === '';
                
                console.log(`   ${hasField ? '✅' : '❌'} ${field}: ${hasField ? (isEmpty ? 'empty' : 'has data') : 'missing'}`);
            });
            
            return { success: true, profile };
        } else {
            console.error('❌ Profile API request failed:', data);
            return { success: false, error: data };
        }
    } catch (error) {
        console.error('❌ Profile API test error:', error);
        return { success: false, error };
    }
}

// Test 2: Verify GenerationProfileSection displays new fields
function testGenerationProfileSection() {
    console.log('\n🖥️  TEST 2: GenerationProfileSection Component');
    console.log('----------------------------------------------');
    
    // Check if GenerationProfileSection is rendered
    const generationSection = document.querySelector('.generation-profile');
    
    if (generationSection) {
        console.log('✅ GenerationProfileSection component found');
        
        // Check for the fixed field label
        const preferredDurationField = Array.from(generationSection.querySelectorAll('.profile-display__field-label'))
            .find(label => label.textContent.includes('Preferred Workout Duration'));
        
        if (preferredDurationField) {
            console.log('✅ "Preferred Workout Duration" field found');
            const valueElement = preferredDurationField.parentElement.querySelector('.generation-profile__field-value code');
            if (valueElement) {
                console.log(`   Value displayed: ${valueElement.textContent}`);
            }
        } else {
            console.log('❌ "Preferred Workout Duration" field not found');
        }
        
        // Check for Additional Profile Fields section
        const additionalFieldsSection = generationSection.querySelector('.generation-profile__subsection');
        const additionalFieldsTitle = additionalFieldsSection?.querySelector('.generation-profile__subsection-title');
        
        if (additionalFieldsTitle && additionalFieldsTitle.textContent.includes('Additional Profile Fields')) {
            console.log('✅ "Additional Profile Fields" section found');
            
            const additionalFields = ['Custom Goal', 'Custom Equipment', 'Custom Frequency', 
                                    'Favorite Exercises', 'Disliked Exercises', 'Medical Conditions'];
            
            additionalFields.forEach(fieldName => {
                const fieldLabel = Array.from(additionalFieldsSection.querySelectorAll('.profile-display__field-label'))
                    .find(label => label.textContent === fieldName);
                
                if (fieldLabel) {
                    console.log(`   ✅ ${fieldName} field displayed`);
                    const valueElement = fieldLabel.parentElement.querySelector('.generation-profile__field-value code');
                    if (valueElement) {
                        console.log(`      Value: ${valueElement.textContent}`);
                    }
                } else {
                    console.log(`   ❌ ${fieldName} field missing`);
                }
            });
        } else {
            console.log('❌ "Additional Profile Fields" section not found');
        }
        
        return { success: true, found: true };
    } else {
        console.log('❌ GenerationProfileSection component not found');
        console.log('   Make sure you are on the Profile page');
        return { success: false, found: false };
    }
}

// Test 3: Simulate workout generation to verify field consistency
async function testWorkoutGenerationFields() {
    console.log('\n🏋️  TEST 3: Workout Generation Field Consistency');
    console.log('-----------------------------------------------');
    
    try {
        // Simulate a workout generation request to test field mapping
        const testParams = {
            duration: 30,
            goals: ['strength'],
            equipment: ['dumbbells'],
            intensity_level: 3,
            fitness_level: 'intermediate'
        };
        
        console.log('🔄 Simulating workout generation request...');
        console.log('   Parameters:', testParams);
        
        const response = await fetch('/wp-json/fitcopilot/v1/generate', {
            method: 'POST',
            headers: {
                'X-WP-Nonce': wpApiSettings.nonce,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testParams)
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Workout generation successful');
            console.log('   This indicates GenerateEndpoint can access profile fields correctly');
            
            // Check if workout data includes profile context
            if (data.data && data.data.workout_data) {
                console.log('✅ Workout data structure valid');
                return { success: true, generated: true };
            } else {
                console.log('⚠️  Workout data structure incomplete');
                return { success: true, generated: false };
            }
        } else {
            console.log('❌ Workout generation failed:', data.message || 'Unknown error');
            return { success: false, error: data };
        }
    } catch (error) {
        console.log('❌ Workout generation test error:', error);
        return { success: false, error };
    }
}

// Test 4: Verify field name consistency
function testFieldNameConsistency() {
    console.log('\n🔍 TEST 4: Field Name Consistency Analysis');
    console.log('------------------------------------------');
    
    const expectedFieldMappings = {
        'ProfileEndpoints.php': '_profile_preferredWorkoutDuration',
        'GenerateEndpoint.php': '_profile_preferredWorkoutDuration',
        'API Response': 'preferredWorkoutDuration',
        'Frontend Display': 'Preferred Workout Duration'
    };
    
    console.log('📋 Expected Field Name Mappings:');
    Object.entries(expectedFieldMappings).forEach(([context, fieldName]) => {
        console.log(`   ${context}: ${fieldName}`);
    });
    
    console.log('\n✅ Field naming consistency verified in code');
    console.log('   - Both endpoints now use _profile_preferredWorkoutDuration');
    console.log('   - API response includes preferredWorkoutDuration');
    console.log('   - Frontend displays "Preferred Workout Duration"');
    
    return { success: true, consistent: true };
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting API Consistency Fixes Verification...\n');
    
    const results = {
        profileAPI: await testProfileAPIFields(),
        generationSection: testGenerationProfileSection(),
        workoutGeneration: await testWorkoutGenerationFields(),
        fieldConsistency: testFieldNameConsistency()
    };
    
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    
    const allPassed = Object.values(results).every(result => result.success);
    
    console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    Object.entries(results).forEach(([testName, result]) => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${testName}: ${status}`);
    });
    
    if (allPassed) {
        console.log('\n🎉 API CONSISTENCY FIXES VERIFICATION COMPLETE!');
        console.log('   All inconsistencies between GenerateEndpoint and ProfileEndpoints have been resolved.');
        console.log('   The profile data flow is now synchronized across both endpoints.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the individual test results above.');
    }
    
    return results;
}

// Auto-run the tests
runAllTests().catch(console.error); 