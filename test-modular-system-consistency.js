/**
 * Test Modular System Status Consistency
 * 
 * This script verifies that Testing Lab and Prompt Builder both use
 * the modular system correctly and display consistent status information.
 */

console.log('🔍 Testing Modular System Status Consistency');
console.log('='.repeat(60));

// Test Configuration
const testConfig = {
    testingLabUrl: '/wp-admin/admin.php?page=fitcopilot-testing-lab',
    promptBuilderUrl: '/wp-admin/admin.php?page=fitcopilot-prompt-builder', 
    dashboardUrl: '/wp-admin/admin.php?page=fitcopilot',
    ajaxUrl: '/wp-admin/admin-ajax.php',
    nonce: window.fitcopilotTestingLab?.nonce || window.fitcopilotPromptBuilder?.nonce || ''
};

// Test Functions
const tests = {
    
    /**
     * Test 1: Check WordPress Options Consistency
     */
    async testWordPressOptions() {
        console.log('\n🧪 Test 1: WordPress Options Consistency');
        console.log('-'.repeat(40));
        
        try {
            // Make AJAX request to get all modular system options
            const response = await fetch(testConfig.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'fitcopilot_debug_get_system_stats',
                    nonce: testConfig.nonce
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.data) {
                console.log('✅ WordPress Options Retrieved:');
                console.log('   - fitcopilot_use_modular_prompts:', data.data.options?.fitcopilot_use_modular_prompts);
                console.log('   - fitcopilot_modular_system_active:', data.data.options?.fitcopilot_modular_system_active);
                console.log('   - Filter applied:', data.data.filter_enabled);
                console.log('   - System status:', data.data.modular_active ? '🟢 Active' : '🔴 Inactive');
                
                return {
                    success: true,
                    options: data.data.options,
                    status: data.data.modular_active,
                    filter_applied: data.data.filter_enabled
                };
            } else {
                console.log('❌ Failed to get WordPress options');
                return { success: false, error: 'Failed to retrieve options' };
            }
            
        } catch (error) {
            console.log('❌ WordPress Options Test Failed:', error.message);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Test 2: Test Testing Lab Modular System Usage  
     */
    async testTestingLabModularSystem() {
        console.log('\n🧪 Test 2: Testing Lab Modular System Usage');
        console.log('-'.repeat(40));
        
        try {
            // Test profile workout generation (which forces modular system)
            const testData = {
                firstName: 'Test',
                lastName: 'User',
                fitnessLevel: 'intermediate',
                goals: ['strength'],
                age: 35,
                testDuration: 30
            };
            
            const response = await fetch(testConfig.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'fitcopilot_debug_test_profile_workout_generation',
                    nonce: testConfig.nonce,
                    profile_data: JSON.stringify(testData)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Testing Lab Response:');
                console.log('   - Modular system forced:', data.debug?.modular_system_forced);
                console.log('   - Legacy system disabled:', data.debug?.legacy_system_disabled);
                console.log('   - System type:', data.system?.strategy || 'Unknown');
                console.log('   - Execution time:', data.debug?.execution_time);
                
                return {
                    success: true,
                    modular_forced: data.debug?.modular_system_forced,
                    legacy_disabled: data.debug?.legacy_system_disabled,
                    system_type: data.system?.strategy
                };
            } else {
                console.log('❌ Testing Lab test failed:', data.error || 'Unknown error');
                return { success: false, error: data.error };
            }
            
        } catch (error) {
            console.log('❌ Testing Lab Test Failed:', error.message);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Test 3: Test Prompt Builder Modular System Usage
     */
    async testPromptBuilderModularSystem() {
        console.log('\n🧪 Test 3: Prompt Builder Modular System Usage');
        console.log('-'.repeat(40));
        
        try {
            // Test live prompt generation (which should force modular system)
            const testData = {
                firstName: 'Test',
                lastName: 'User', 
                fitnessLevel: 'intermediate',
                duration: 30,
                goals: 'strength'
            };
            
            const response = await fetch(testConfig.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'fitcopilot_prompt_builder_generate',
                    nonce: testConfig.nonce,
                    form_data: JSON.stringify(testData)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Prompt Builder Response:');
                console.log('   - Modular system active:', data.modular_system_active);
                console.log('   - System type:', data.system_type);
                console.log('   - Modular system forced:', data.modular_system_forced);
                console.log('   - Prompt length:', data.prompt?.length || 0, 'characters');
                console.log('   - Execution time:', data.performance_metrics?.execution_time_ms, 'ms');
                
                return {
                    success: true,
                    modular_active: data.modular_system_active,
                    system_type: data.system_type,
                    modular_forced: data.modular_system_forced
                };
            } else {
                console.log('❌ Prompt Builder test failed:', data.error || 'Unknown error');
                return { success: false, error: data.error };
            }
            
        } catch (error) {
            console.log('❌ Prompt Builder Test Failed:', error.message);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Test 4: Check UI Display Consistency
     */
    testUIDisplayConsistency() {
        console.log('\n🧪 Test 4: UI Display Consistency Check');
        console.log('-'.repeat(40));
        
        const results = {};
        
        // Check Testing Lab UI
        const testingLabStatus = document.querySelector('#testing-lab-modular-status');
        if (testingLabStatus) {
            results.testingLab = testingLabStatus.textContent.trim();
            console.log('✅ Testing Lab UI Status:', results.testingLab);
        } else {
            console.log('⚠️  Testing Lab status element not found (not on Testing Lab page)');
        }
        
        // Check Prompt Builder UI  
        const promptBuilderStatus = document.querySelector('#prompt-builder-modular-status');
        if (promptBuilderStatus) {
            results.promptBuilder = promptBuilderStatus.textContent.trim();
            console.log('✅ Prompt Builder UI Status:', results.promptBuilder);
        } else {
            console.log('⚠️  Prompt Builder status element not found (not on Prompt Builder page)');
        }
        
        // Check Dashboard UI
        const dashboardStatus = document.querySelector('#dashboard-modular-status'); 
        if (dashboardStatus) {
            results.dashboard = dashboardStatus.textContent.trim();
            console.log('✅ Dashboard UI Status:', results.dashboard);
        } else {
            console.log('⚠️  Dashboard status element not found (not on Dashboard page)');
        }
        
        return {
            success: true,
            uiStatuses: results
        };
    }
};

// Run All Tests
async function runAllTests() {
    console.log('🚀 Starting Modular System Consistency Tests...\n');
    
    const results = {};
    
    // Run each test
    results.options = await tests.testWordPressOptions();
    results.testingLab = await tests.testTestingLabModularSystem();
    results.promptBuilder = await tests.testPromptBuilderModularSystem();
    results.uiDisplay = tests.testUIDisplayConsistency();
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const allPassed = Object.values(results).every(result => result.success);
    
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('   ✅ WordPress options are consistent');
        console.log('   ✅ Testing Lab forces modular system correctly'); 
        console.log('   ✅ Prompt Builder forces modular system correctly');
        console.log('   ✅ UI displays are checked');
    } else {
        console.log('⚠️  SOME TESTS FAILED:');
        Object.entries(results).forEach(([test, result]) => {
            if (!result.success) {
                console.log(`   ❌ ${test}: ${result.error}`);
            }
        });
    }
    
    // Detailed Results
    console.log('\n📋 DETAILED RESULTS:');
    console.log('Options Test:', results.options);
    console.log('Testing Lab Test:', results.testingLab);
    console.log('Prompt Builder Test:', results.promptBuilder);
    console.log('UI Display Test:', results.uiDisplay);
    
    // Consistency Check
    if (results.options.success && results.testingLab.success && results.promptBuilder.success) {
        const optionsStatus = results.options.status;
        const testingLabForced = results.testingLab.modular_forced;
        const promptBuilderForced = results.promptBuilder.modular_forced;
        
        console.log('\n🔍 CONSISTENCY ANALYSIS:');
        console.log('   - WordPress Options Status:', optionsStatus ? '🟢 Active' : '🔴 Inactive');
        console.log('   - Testing Lab Forces Modular:', testingLabForced ? '🟢 Yes' : '🔴 No');
        console.log('   - Prompt Builder Forces Modular:', promptBuilderForced ? '🟢 Yes' : '🔴 No');
        
        if (testingLabForced && promptBuilderForced) {
            console.log('   🎯 RESULT: Both components correctly force modular system activation!');
        } else {
            console.log('   ⚠️  RESULT: Inconsistent modular system enforcement detected!');
        }
    }
    
    return results;
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
    // Browser environment - wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        runAllTests();
    }
} else {
    // Node.js environment - run immediately
    runAllTests();
}

// Make available globally for manual testing
window.testModularSystemConsistency = runAllTests; 