console.log('🧪 SPRINT 2 PHASE 1: MODULE DELEGATION TESTING');
console.log('===============================================');

// Task 1.2: Test Module Capability Delegation
console.log('\n🔗 Testing Module Delegation Capabilities...');

// Check if ajaxurl is available
if (typeof ajaxurl === 'undefined') {
    console.error('❌ ajaxurl not available - make sure this is run in WordPress admin');
    console.log('💡 Navigate to PromptBuilder admin page first');
} else {
    console.log('✅ WordPress AJAX URL available:', ajaxurl);
    
    // Test 1: Profile form rendering delegation
    console.log('\n📋 Test 1: Profile Form Rendering Delegation');
    console.log('==============================================');
    
    fetch(ajaxurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'fitcopilot_test_profile_delegation',
            nonce: 'test'
        })
    })
    .then(response => {
        console.log('📡 Profile Delegation Response Status:', response.status);
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const result = data.data;
            console.log(`${result.delegated ? '✅' : '❌'} Profile Delegation: ${result.delegated ? 'SUCCESS' : 'FAILED'}`);
            console.log(`   Module Found: ${result.module_found ? '✅' : '❌'}`);
            console.log(`   Result Type: ${result.result_type}`);
            console.log(`   Delegated Successfully: ${result.delegated}`);
        } else {
            console.error('❌ Profile delegation test failed:', data);
        }
    })
    .catch(error => {
        console.error('❌ Profile delegation request failed:', error);
    });
    
    // Test 2: Muscle selection rendering delegation
    console.log('\n🎯 Test 2: Muscle Selection Rendering Delegation');
    console.log('================================================');
    
    setTimeout(() => {
        fetch(ajaxurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'fitcopilot_test_muscle_delegation',
                nonce: 'test'
            })
        })
        .then(response => {
            console.log('📡 Muscle Delegation Response Status:', response.status);
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const result = data.data;
                console.log(`${result.delegated ? '✅' : '❌'} Muscle Delegation: ${result.delegated ? 'SUCCESS' : 'FAILED'}`);
                console.log(`   Module Found: ${result.module_found ? '✅' : '❌'}`);
                console.log(`   Result Type: ${result.result_type}`);
                console.log(`   Delegated Successfully: ${result.delegated}`);
            } else {
                console.error('❌ Muscle delegation test failed:', data);
            }
            
            // Summary after both tests
            setTimeout(() => {
                console.log('\n🏆 DELEGATION TEST SUMMARY');
                console.log('===========================');
                console.log('If both tests show SUCCESS: ✅ Module delegation is working!');
                console.log('If tests show FAILED: ❌ Check module method implementations');
                console.log('If module not found: ❌ Check capability definitions');
                console.log('\n📝 Next: Add these methods to ModuleManager.php and test again');
                console.log('   - testProfileDelegation()');
                console.log('   - testMuscleDelegation()');
                console.log('   - Register AJAX handlers for both methods');
            }, 500);
        })
        .catch(error => {
            console.error('❌ Muscle delegation request failed:', error);
        });
    }, 1000);
}

console.log('\n⏱️  Delegation tests initiated. Results will appear above when complete...'); 