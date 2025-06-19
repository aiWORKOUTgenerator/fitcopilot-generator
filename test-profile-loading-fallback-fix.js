/**
 * Test Profile Loading Fallback Fix
 * 
 * This script tests the fix for empty firstName/lastName fields by adding
 * proper fallbacks to WordPress user fields when profile meta is empty.
 */

console.log('🔧 Profile Loading Fallback Fix Test');
console.log('====================================');

console.log('\n📋 Fix Applied:');
console.log('1. Check _profile_firstName meta first');
console.log('2. Fallback to WordPress user.first_name');
console.log('3. Check _profile_lastName meta first');
console.log('4. Fallback to WordPress user.last_name');

// Test the live AJAX call if WordPress environment is available
if (typeof jQuery !== 'undefined' && typeof ajaxurl !== 'undefined') {
    console.log('\n🌐 Testing Live AJAX Call...');
    
    jQuery.post(ajaxurl, {
        action: 'fitcopilot_prompt_builder_load_profile',
        nonce: fitcopilotPromptBuilder?.nonce || 'test-nonce',
        user_id: fitcopilotPromptBuilder?.currentUserId || 1
    })
    .done(function(response) {
        console.log('📥 AJAX Response:', response);
        
        if (response.success && response.data && response.data.profile_data) {
            const basicInfo = response.data.profile_data.basic_info;
            
            console.log('\n🔍 Profile Data Analysis:');
            console.log(`  first_name: "${basicInfo.first_name || 'EMPTY'}"`);
            console.log(`  last_name: "${basicInfo.last_name || 'EMPTY'}"`);
            
            // Test if fields would populate
            const hasFirstName = basicInfo.first_name && basicInfo.first_name.length > 0;
            const hasLastName = basicInfo.last_name && basicInfo.last_name.length > 0;
            
            console.log('\n📝 Form Population Test:');
            console.log(`  FirstName field would populate: ${hasFirstName ? '✅ YES' : '❌ NO'}`);
            console.log(`  LastName field would populate: ${hasLastName ? '✅ YES' : '❌ NO'}`);
            
            if (hasFirstName || hasLastName) {
                console.log('🎉 SUCCESS: Profile data is now loading correctly!');
                
                // Simulate actual form population
                if (hasFirstName) {
                    console.log(`  FirstName would show: "${basicInfo.first_name}"`);
                }
                if (hasLastName) {
                    console.log(`  LastName would show: "${basicInfo.last_name}"`);
                }
            } else {
                console.log('⚠️  ISSUE: Still no profile data loading');
                console.log('   This might mean the user has no WordPress first_name/last_name either');
            }
            
            // Check for username contamination
            const isUsername = basicInfo.first_name === 'JustinFassio' || 
                              basicInfo.first_name?.includes('Fassio') ||
                              basicInfo.last_name === 'JustinFassio';
            
            if (isUsername) {
                console.log('❌ USERNAME CONTAMINATION: Still showing username data');
            } else {
                console.log('✅ CLEAN DATA: No username contamination detected');
            }
            
        } else {
            console.log('❌ Invalid response structure');
        }
    })
    .fail(function(xhr, status, error) {
        console.log('❌ AJAX request failed:', error);
    });
} else {
    console.log('⚠️  WordPress environment not detected. Run on admin page.');
}

console.log('\n📊 Expected Results:');
console.log('1. FirstName field should populate from _profile_firstName OR user.first_name');
console.log('2. LastName field should populate from _profile_lastName OR user.last_name');
console.log('3. No more empty fields if WordPress user data exists');
console.log('4. No username contamination (no "JustinFassio" in FirstName)');

console.log('\n🧪 Manual Test:');
console.log('1. Go to PromptBuilder page');
console.log('2. Select a user and click "Load Profile"');
console.log('3. Check if FirstName and LastName fields populate');
console.log('4. Verify data looks correct (proper names, not usernames)');

console.log('\n✅ Test Complete!'); 