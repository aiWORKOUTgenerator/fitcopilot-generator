/**
 * Debug Profile Loading Response Structure
 * 
 * This script examines the actual AJAX response to understand
 * why the profile data parsing is failing.
 */

console.log('🔍 Profile Loading Response Debug');
console.log('=================================');

if (typeof jQuery !== 'undefined' && typeof ajaxurl !== 'undefined') {
    console.log('🌐 Making AJAX call to examine response structure...');
    
    jQuery.post(ajaxurl, {
        action: 'fitcopilot_prompt_builder_load_profile',
        nonce: fitcopilotPromptBuilder?.nonce || 'test-nonce',
        user_id: fitcopilotPromptBuilder?.currentUserId || 1
    })
    .done(function(response) {
        console.log('📥 Full AJAX Response:', response);
        console.log('📥 Response Type:', typeof response);
        console.log('📥 Response Keys:', Object.keys(response));
        
        if (response.success) {
            console.log('✅ Success: true');
            console.log('📦 Data Object:', response.data);
            console.log('📦 Data Type:', typeof response.data);
            console.log('📦 Data Keys:', Object.keys(response.data || {}));
            
            // Check different possible structures
            console.log('\n🔍 Checking possible data structures...');
            
            // Structure 1: response.data.profile_data
            if (response.data && response.data.profile_data) {
                console.log('✅ Found: response.data.profile_data');
                console.log('   Structure:', response.data.profile_data);
                
                if (response.data.profile_data.basic_info) {
                    console.log('✅ Found: response.data.profile_data.basic_info');
                    const basicInfo = response.data.profile_data.basic_info;
                    console.log('   first_name:', basicInfo.first_name);
                    console.log('   last_name:', basicInfo.last_name);
                }
            }
            
            // Structure 2: response.data directly
            if (response.data && response.data.basic_info) {
                console.log('✅ Found: response.data.basic_info');
                const basicInfo = response.data.basic_info;
                console.log('   first_name:', basicInfo.first_name);
                console.log('   last_name:', basicInfo.last_name);
            }
            
            // Structure 3: response.data.data
            if (response.data && response.data.data) {
                console.log('✅ Found: response.data.data');
                console.log('   Structure:', response.data.data);
                
                if (response.data.data.profile_data) {
                    console.log('✅ Found: response.data.data.profile_data');
                    console.log('   Structure:', response.data.data.profile_data);
                    
                    if (response.data.data.profile_data.basic_info) {
                        console.log('✅ Found: response.data.data.profile_data.basic_info');
                        const basicInfo = response.data.data.profile_data.basic_info;
                        console.log('   first_name:', basicInfo.first_name);
                        console.log('   last_name:', basicInfo.last_name);
                    }
                }
            }
            
            // Try to find the actual data path
            console.log('\n🎯 Attempting to find the correct data path...');
            
            function findBasicInfo(obj, path = '') {
                if (typeof obj !== 'object' || obj === null) return;
                
                if (obj.basic_info) {
                    console.log(`✅ Found basic_info at: ${path}.basic_info`);
                    console.log('   first_name:', obj.basic_info.first_name);
                    console.log('   last_name:', obj.basic_info.last_name);
                    return obj.basic_info;
                }
                
                for (const key in obj) {
                    if (typeof obj[key] === 'object') {
                        const result = findBasicInfo(obj[key], path ? `${path}.${key}` : key);
                        if (result) return result;
                    }
                }
            }
            
            const foundBasicInfo = findBasicInfo(response.data, 'response.data');
            
            if (foundBasicInfo) {
                console.log('\n🎉 SUCCESS: Found profile data!');
                console.log(`   FirstName: "${foundBasicInfo.first_name || 'EMPTY'}"`);
                console.log(`   LastName: "${foundBasicInfo.last_name || 'EMPTY'}"`);
                
                // Test if this would fix the form population
                const hasData = foundBasicInfo.first_name || foundBasicInfo.last_name;
                console.log(`   Has data to populate: ${hasData ? '✅ YES' : '❌ NO'}`);
                
                if (hasData) {
                    console.log('\n📝 This would populate the form with:');
                    if (foundBasicInfo.first_name) {
                        console.log(`   FirstName field: "${foundBasicInfo.first_name}"`);
                    }
                    if (foundBasicInfo.last_name) {
                        console.log(`   LastName field: "${foundBasicInfo.last_name}"`);
                    }
                }
            } else {
                console.log('\n❌ Could not find basic_info in response structure');
            }
            
        } else {
            console.log('❌ Response success: false');
            console.log('   Message:', response.message);
        }
    })
    .fail(function(xhr, status, error) {
        console.log('❌ AJAX request failed:', error);
        console.log('   Status:', status);
        console.log('   Response Text:', xhr.responseText);
    });
} else {
    console.log('⚠️  WordPress environment not detected');
}

console.log('\n📋 This script will help identify:');
console.log('1. The exact response structure from the backend');
console.log('2. Where the profile data is actually located');
console.log('3. Whether first_name and last_name are being returned');
console.log('4. The correct path to access the data in JavaScript'); 