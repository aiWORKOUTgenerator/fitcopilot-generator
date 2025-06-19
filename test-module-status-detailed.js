/**
 * Detailed Module Status Test
 * Run this in browser console to see full module status
 */

console.log('🔍 SPRINT 2 PHASE 1: MODULE STATUS VERIFICATION');
console.log('===============================================');

// Task 1.1: Run Detailed Module Status Test
console.log('\n📊 Testing Module System Status...');

// Check if ajaxurl is available
if (typeof ajaxurl === 'undefined') {
    console.error('❌ ajaxurl not available - make sure this is run in WordPress admin');
    console.log('💡 Navigate to PromptBuilder admin page first');
} else {
    console.log('✅ WordPress AJAX URL available:', ajaxurl);
}

// Test 1: Check if ModuleManager is responding
fetch(ajaxurl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
        action: 'fitcopilot_debug_module_status',
        nonce: 'test'
    })
})
.then(response => {
    console.log('📡 Module Status Response Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('\n🎯 MODULE SYSTEM STATUS RESULTS:');
    console.log('===================================');
    
    if (data.success) {
        const moduleData = data.data;
        
        // Format results as requested
        console.log(`${moduleData.initialized ? '✅' : '❌'} ModuleManager initialized: ${moduleData.initialized}`);
        console.log(`${moduleData.modules_count >= 2 ? '✅' : '❌'} Modules registered: ${moduleData.modules_count} (Expected: 2)`);
        
        // Check specific modules
        const hasProfile = moduleData.modules.hasOwnProperty('profile');
        const hasMuscle = moduleData.modules.hasOwnProperty('muscle');
        
        console.log(`${hasProfile ? '✅' : '❌'} Profile module: ${hasProfile ? 'registered' : 'missing'}`);
        console.log(`${hasMuscle ? '✅' : '❌'} Muscle module: ${hasMuscle ? 'registered' : 'missing'}`);
        
        const capabilitiesCount = moduleData.capabilities.length;
        console.log(`${capabilitiesCount >= 6 ? '✅' : '❌'} Capabilities count: ${capabilitiesCount} (Expected: 6+)`);
        
        console.log('\n📋 DETAILED MODULE INFORMATION:');
        console.log('================================');
        
        // Show module details
        Object.keys(moduleData.modules).forEach(moduleName => {
            const module = moduleData.modules[moduleName];
            console.log(`\n🔧 ${moduleName.toUpperCase()} MODULE:`);
            console.log(`   Class: ${module.class}`);
            console.log(`   Capabilities: ${module.capabilities.join(', ')}`);
            console.log(`   Loaded: ${module.loaded ? '✅' : '❌'}`);
        });
        
        console.log('\n🎯 ALL CAPABILITIES:');
        console.log('====================');
        moduleData.capabilities.forEach(capability => {
            console.log(`   • ${capability}`);
        });
        
        console.log('\n📊 SYSTEM INFO:');
        console.log('===============');
        console.log(`   Timestamp: ${moduleData.timestamp}`);
        console.log(`   Modules Count: ${moduleData.modules_count}`);
        console.log(`   Initialized: ${moduleData.initialized}`);
        
        // Calculate success rate
        const tests = [
            moduleData.initialized,
            moduleData.modules_count >= 2,
            hasProfile,
            hasMuscle,
            capabilitiesCount >= 6
        ];
        
        const passedTests = tests.filter(test => test).length;
        const successRate = Math.round((passedTests / tests.length) * 100);
        
        console.log('\n🏆 PHASE 1 SUCCESS RATE:');
        console.log('========================');
        console.log(`   ${passedTests}/${tests.length} tests passed (${successRate}%)`);
        
        if (successRate >= 95) {
            console.log('✅ SUCCESS: Ready for Phase 2 (Module Integration)');
        } else if (successRate >= 80) {
            console.log('⚠️  PARTIAL SUCCESS: Check failed tests before proceeding');
        } else {
            console.log('❌ FAILURE: Address critical issues before proceeding');
        }
        
    } else {
        console.error('❌ Module status request failed:', data);
        console.log('\n🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Check wp-content/debug.log for [ModuleManager] entries');
        console.log('2. Verify FITCOPILOT_DIR constant is defined');
        console.log('3. Run PHP syntax check on module files');
        console.log('4. Check WordPress admin error log');
    }
})
.catch(error => {
    console.error('❌ Module status test failed:', error);
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Ensure you are on PromptBuilder admin page');
    console.log('2. Check browser network tab for failed requests');
    console.log('3. Verify WordPress AJAX is working');
    console.log('4. Check for JavaScript errors in console');
});

console.log('\n⏱️  Test initiated. Results will appear above when complete...'); 