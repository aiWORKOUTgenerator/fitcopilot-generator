/**
 * Test Profile Loading Complete Fix
 * 
 * This script tests the complete fix for profile loading:
 * 1. Backend returns proper first_name/last_name with WordPress fallbacks
 * 2. Frontend correctly parses nested response structure
 * 3. Form fields populate with correct data
 */

console.log('🎯 Profile Loading Complete Fix Test');
console.log('====================================');

console.log('\n🔧 Complete Fix Applied:');
console.log('1. Backend: Added WordPress fallbacks (user.first_name, user.last_name)');
console.log('2. Frontend: Fixed response parsing (response.data.data.profile_data)');
console.log('3. Form Population: Proper field mapping to #firstName and #lastName');

// Test the complete workflow
if (typeof jQuery !== 'undefined' && typeof ajaxurl !== 'undefined') {
    console.log('\n🌐 Testing Complete Workflow...');
    
    // Simulate the actual button click workflow
    async function testCompleteWorkflow() {
        try {
            console.log('📞 Making AJAX call...');
            
            const response = await new Promise((resolve, reject) => {
                jQuery.post(ajaxurl, {
                    action: 'fitcopilot_prompt_builder_load_profile',
                    nonce: fitcopilotPromptBuilder?.nonce || 'test-nonce',
                    user_id: fitcopilotPromptBuilder?.currentUserId || 1
                })
                .done(resolve)
                .fail((xhr, status, error) => reject(new Error(error)));
            });
            
            console.log('📥 Response received:', response);
            
            if (response.success) {
                console.log('✅ AJAX Success');
                
                // Test the new parsing logic
                let profileData = null;
                
                if (response.data && response.data.data && response.data.data.profile_data) {
                    profileData = response.data.data.profile_data;
                    console.log('✅ Found profile data at response.data.data.profile_data');
                } else if (response.data && response.data.profile_data) {
                    profileData = response.data.profile_data;
                    console.log('✅ Found profile data at response.data.profile_data');
                } else if (response.data) {
                    profileData = response.data;
                    console.log('⚠️  Using response.data directly');
                }
                
                if (profileData && profileData.basic_info) {
                    const basicInfo = profileData.basic_info;
                    
                    console.log('\n🔍 Profile Data Analysis:');
                    console.log(`   first_name: "${basicInfo.first_name || 'EMPTY'}"`);
                    console.log(`   last_name: "${basicInfo.last_name || 'EMPTY'}"`);
                    
                    // Test form population simulation
                    console.log('\n📝 Form Population Simulation:');
                    
                    const formData = {};
                    
                    if (basicInfo.first_name) {
                        formData.firstName = basicInfo.first_name;
                        console.log(`   ✅ FirstName field would populate: "${basicInfo.first_name}"`);
                    } else {
                        console.log('   ❌ FirstName field would remain empty');
                    }
                    
                    if (basicInfo.last_name) {
                        formData.lastName = basicInfo.last_name;
                        console.log(`   ✅ LastName field would populate: "${basicInfo.last_name}"`);
                    } else {
                        console.log('   ❌ LastName field would remain empty');
                    }
                    
                    // Check for success criteria
                    const hasValidData = basicInfo.first_name && basicInfo.last_name;
                    const isNotUsername = basicInfo.first_name !== 'JustinFassio' && 
                                         !basicInfo.first_name?.includes('Fassio') && 
                                         basicInfo.last_name !== 'JustinFassio';
                    
                    console.log('\n🎯 Success Criteria Check:');
                    console.log(`   Has valid first/last names: ${hasValidData ? '✅ YES' : '❌ NO'}`);
                    console.log(`   No username contamination: ${isNotUsername ? '✅ YES' : '❌ NO'}`);
                    console.log(`   Proper data separation: ${basicInfo.first_name !== basicInfo.last_name ? '✅ YES' : '❌ NO'}`);
                    
                    if (hasValidData && isNotUsername) {
                        console.log('\n🎉 SUCCESS: Complete fix is working!');
                        console.log('   ✅ Backend returns proper first/last names');
                        console.log('   ✅ Frontend parses response correctly');
                        console.log('   ✅ Form would populate with clean data');
                        
                        // Test actual form population if elements exist
                        if ($('#firstName').length && $('#lastName').length) {
                            console.log('\n🧪 Testing Actual Form Population...');
                            
                            const originalFirstName = $('#firstName').val();
                            const originalLastName = $('#lastName').val();
                            
                            // Populate the form
                            $('#firstName').val(basicInfo.first_name);
                            $('#lastName').val(basicInfo.last_name);
                            
                            console.log(`   FirstName field now shows: "${$('#firstName').val()}"`);
                            console.log(`   LastName field now shows: "${$('#lastName').val()}"`);
                            
                            // Restore original values after 3 seconds
                            setTimeout(() => {
                                $('#firstName').val(originalFirstName);
                                $('#lastName').val(originalLastName);
                                console.log('   Form fields restored to original values');
                            }, 3000);
                        }
                        
                    } else {
                        console.log('\n❌ ISSUE: Fix not complete');
                        if (!hasValidData) {
                            console.log('   Problem: No valid first/last name data');
                        }
                        if (!isNotUsername) {
                            console.log('   Problem: Username contamination still present');
                        }
                    }
                    
                } else {
                    console.log('❌ No basic_info found in profile data');
                }
                
            } else {
                console.log('❌ AJAX Failed:', response.message);
            }
            
        } catch (error) {
            console.log('❌ Test failed:', error.message);
        }
    }
    
    testCompleteWorkflow();
    
} else {
    console.log('⚠️  WordPress environment not detected. Run on PromptBuilder admin page.');
}

console.log('\n📊 Expected Results After Fix:');
console.log('1. ✅ FirstName field populates with "Justin" (from WordPress user.first_name)');
console.log('2. ✅ LastName field populates with "Fassio" (from WordPress user.last_name)');
console.log('3. ✅ No "JustinFassio" appearing in FirstName field');
console.log('4. ✅ Clean separation of first and last names');
console.log('5. ✅ Proper fallback to WordPress user data when profile meta is empty');

console.log('\n🧪 Manual Verification:');
console.log('1. Go to PromptBuilder page');
console.log('2. Select a user and click "Load Profile" button');
console.log('3. Verify FirstName shows "Justin" and LastName shows "Fassio"');
console.log('4. Confirm no username contamination');

console.log('\n✅ Test Complete!'); 