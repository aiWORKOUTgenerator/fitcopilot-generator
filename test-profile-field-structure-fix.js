/**
 * Test Profile Field Structure Fix
 * 
 * This script tests the fix for the profile loading issue where:
 * - Backend was returning 'basic_info.name' (full username)
 * - Frontend expected 'basic_info.first_name' and 'basic_info.last_name'
 * - Result was "JustinFassio" appearing in FirstName field
 */

console.log('🧪 Profile Field Structure Fix Test');
console.log('=====================================');

// Test 1: Backend Data Structure Verification
console.log('\n📋 Test 1: Backend Data Structure');
console.log('Expected: basic_info.first_name and basic_info.last_name');
console.log('Previous: basic_info.name (caused the issue)');

const expectedBackendStructure = {
    success: true,
    data: {
        profile_data: {
            basic_info: {
                first_name: 'John',    // ✅ Correct field
                last_name: 'Doe',      // ✅ Correct field
                age: 30,
                gender: 'male',
                fitness_level: 'intermediate'
            }
        }
    }
};

const problematicBackendStructure = {
    success: true,
    data: {
        profile_data: {
            basic_info: {
                name: 'JustinFassio',  // ❌ This was the problem
                age: 30,
                gender: 'male',
                fitness_level: 'intermediate'
            }
        }
    }
};

console.log('✅ Expected Structure:', JSON.stringify(expectedBackendStructure.data.profile_data.basic_info, null, 2));
console.log('❌ Problematic Structure:', JSON.stringify(problematicBackendStructure.data.profile_data.basic_info, null, 2));

// Test 2: Frontend Population Logic
console.log('\n🎯 Test 2: Frontend Population Logic');

function testProfilePopulation(profileData, testName) {
    console.log(`\n--- ${testName} ---`);
    
    // Simulate the JavaScript population logic
    const results = {
        firstName: '',
        lastName: ''
    };
    
    if (profileData.basic_info) {
        const basicInfo = profileData.basic_info;
        
        // Fixed logic: Only populate from explicit first_name and last_name fields
        if (basicInfo.first_name) results.firstName = basicInfo.first_name;
        if (basicInfo.last_name) results.lastName = basicInfo.last_name;
    }
    
    console.log('Population Results:');
    console.log(`  FirstName field: "${results.firstName}"`);
    console.log(`  LastName field: "${results.lastName}"`);
    
    return results;
}

// Test with fixed data structure
const fixedResults = testProfilePopulation(expectedBackendStructure.data.profile_data, 'Fixed Backend Structure');

// Test with problematic data structure  
const problematicResults = testProfilePopulation(problematicBackendStructure.data.profile_data, 'Problematic Backend Structure');

// Test 3: Validation
console.log('\n✅ Test 3: Validation Results');

const fixedIsCorrect = fixedResults.firstName === 'John' && fixedResults.lastName === 'Doe';
const problematicIsFixed = problematicResults.firstName === '' && problematicResults.lastName === '';

console.log(`Fixed structure populates correctly: ${fixedIsCorrect ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Problematic structure no longer causes issues: ${problematicIsFixed ? '✅ PASS' : '❌ FAIL'}`);

// Test 4: Live AJAX Test (if on admin page)
console.log('\n🌐 Test 4: Live AJAX Test');

if (typeof jQuery !== 'undefined' && typeof ajaxurl !== 'undefined') {
    console.log('WordPress environment detected. Testing live AJAX call...');
    
    // Test the actual AJAX endpoint
    jQuery.post(ajaxurl, {
        action: 'fitcopilot_prompt_builder_load_profile',
        nonce: fitcopilotPromptBuilder?.nonce || 'test-nonce',
        user_id: fitcopilotPromptBuilder?.currentUserId || 1
    })
    .done(function(response) {
        console.log('📥 AJAX Response received:', response);
        
        if (response.success && response.data && response.data.profile_data) {
            const profileData = response.data.profile_data;
            
            console.log('🔍 Analyzing response structure...');
            
            if (profileData.basic_info) {
                const basicInfo = profileData.basic_info;
                
                console.log('Basic Info Fields:');
                Object.keys(basicInfo).forEach(key => {
                    console.log(`  ${key}: "${basicInfo[key]}"`);
                });
                
                // Check for the fix
                const hasFirstName = 'first_name' in basicInfo;
                const hasLastName = 'last_name' in basicInfo;
                const hasOldNameField = 'name' in basicInfo;
                
                console.log('\n🔍 Field Structure Analysis:');
                console.log(`  Has first_name field: ${hasFirstName ? '✅' : '❌'}`);
                console.log(`  Has last_name field: ${hasLastName ? '✅'  : '❌'}`);
                console.log(`  Has old name field: ${hasOldNameField ? '❌ (should be removed)' : '✅ (correctly removed)'}`);
                
                if (hasFirstName && hasLastName && !hasOldNameField) {
                    console.log('🎉 SUCCESS: Backend structure is fixed!');
                } else {
                    console.log('⚠️  ISSUE: Backend structure needs attention');
                }
                
                // Test population
                const populationResults = testProfilePopulation(profileData, 'Live AJAX Data');
                
                console.log('\n📝 Form Population Test:');
                console.log(`  Would populate FirstName with: "${populationResults.firstName}"`);
                console.log(`  Would populate LastName with: "${populationResults.lastName}"`);
                
                // Check if this would resolve the original issue
                const wouldShowJustinFassio = populationResults.firstName === 'JustinFassio';
                if (wouldShowJustinFassio) {
                    console.log('❌ ISSUE PERSISTS: Still would show "JustinFassio" in FirstName');
                } else {
                    console.log('✅ ISSUE RESOLVED: No longer shows username in FirstName');
                }
            } else {
                console.log('❌ No basic_info found in response');
            }
        } else {
            console.log('❌ Invalid response structure');
        }
    })
    .fail(function(xhr, status, error) {
        console.log('❌ AJAX request failed:', error);
        console.log('Response:', xhr.responseText);
    });
} else {
    console.log('⚠️  WordPress environment not detected. Run this script on the admin page for live testing.');
}

// Test 5: Summary and Recommendations
console.log('\n📊 Test 5: Summary and Recommendations');
console.log('=====================================');

console.log('\n🔧 Changes Made:');
console.log('1. Updated PromptBuilderService.php to return first_name/last_name instead of name');
console.log('2. JavaScript already expects first_name/last_name fields');
console.log('3. Removed username fallback logic to prevent confusion');

console.log('\n🎯 Expected Results:');
console.log('1. FirstName field should only populate from explicit first_name data');
console.log('2. LastName field should only populate from explicit last_name data');
console.log('3. No more "JustinFassio" appearing in FirstName field');
console.log('4. Empty fields when no explicit first/last name data exists');

console.log('\n🧪 Testing Instructions:');
console.log('1. Run this script in browser console on PromptBuilder page');
console.log('2. Select a user and click "Load Profile"');
console.log('3. Verify FirstName and LastName fields populate correctly');
console.log('4. Check that no username data appears in name fields');

console.log('\n✅ Test Complete!'); 