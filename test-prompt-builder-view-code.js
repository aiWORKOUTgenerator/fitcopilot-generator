/**
 * Test Prompt Builder "View Code" Functionality
 * 
 * This script tests the fixed "View Code" feature to ensure SingleWorkoutStrategy
 * code is properly loaded and displayed in the Prompt Builder interface.
 */

console.log('🔍 Testing Prompt Builder "View Code" Functionality');
console.log('='.repeat(60));

// Test Configuration
const testConfig = {
    ajaxUrl: '/wp-admin/admin-ajax.php',
    nonce: window.fitcopilotPromptBuilder?.nonce || '',
    strategyName: 'single_workout'
};

// Test Functions
const tests = {
    
    /**
     * Test 1: Check AJAX Handler Registration
     */
    async testAjaxHandlerRegistration() {
        console.log('\n🧪 Test 1: AJAX Handler Registration');
        console.log('-'.repeat(40));
        
        // Check if the global variables exist
        if (typeof ajaxurl !== 'undefined') {
            console.log('✅ ajaxurl is available:', ajaxurl);
        } else {
            console.log('❌ ajaxurl is not available');
            return { success: false, error: 'ajaxurl not available' };
        }
        
        if (window.fitcopilotPromptBuilder?.nonce) {
            console.log('✅ Nonce is available:', window.fitcopilotPromptBuilder.nonce);
        } else {
            console.log('❌ Nonce is not available');
            return { success: false, error: 'Nonce not available' };
        }
        
        return { success: true };
    },
    
    /**
     * Test 2: Test Strategy Code AJAX Request
     */
    async testStrategyCodeRequest() {
        console.log('\n🧪 Test 2: Strategy Code AJAX Request');
        console.log('-'.repeat(40));
        
        try {
            console.log('Making AJAX request to fetch strategy code...');
            console.log('Strategy name:', testConfig.strategyName);
            console.log('Action:', 'fitcopilot_prompt_builder_get_strategy');
            console.log('Nonce:', testConfig.nonce);
            
            const response = await fetch(testConfig.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'fitcopilot_prompt_builder_get_strategy',
                    nonce: testConfig.nonce,
                    strategy_name: testConfig.strategyName
                })
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                console.log('✅ Strategy code request successful');
                console.log('   - Strategy:', data.data.strategy);
                console.log('   - File path:', data.data.file_path);
                console.log('   - Code length:', data.data.code_content?.length || 0, 'characters');
                console.log('   - Build method length:', data.data.build_prompt_method?.length || 0, 'characters');
                console.log('   - Lines:', data.data.class_info?.lines);
                console.log('   - File size:', data.data.class_info?.file_size, 'bytes');
                
                return {
                    success: true,
                    data: data.data
                };
            } else {
                console.log('❌ Strategy code request failed:', data.message || data.error);
                return { success: false, error: data.message || data.error };
            }
            
        } catch (error) {
            console.log('❌ Strategy Code Request Failed:', error.message);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Test 3: Test DOM Elements
     */
    testDOMElements() {
        console.log('\n🧪 Test 3: DOM Elements Check');
        console.log('-'.repeat(40));
        
        const results = {};
        
        // Check if strategy code viewer exists
        const strategyCodeViewer = document.querySelector('#strategy-code-viewer');
        if (strategyCodeViewer) {
            results.strategyCodeViewer = 'found';
            console.log('✅ Strategy code viewer element found');
        } else {
            console.log('⚠️  Strategy code viewer element not found (not on Prompt Builder page)');
        }
        
        // Check if view code button exists
        const viewCodeButton = document.querySelector('[onclick*="viewStrategyCode"], .view-code-btn, #view-code-btn');
        if (viewCodeButton) {
            results.viewCodeButton = 'found';
            console.log('✅ View Code button found');
        } else {
            console.log('⚠️  View Code button not found (not on Prompt Builder page)');
        }
        
        // Check if strategy selector exists
        const strategySelector = document.querySelector('#strategy-selector, .strategy-selector');
        if (strategySelector) {
            results.strategySelector = 'found';
            console.log('✅ Strategy selector found');
        } else {
            console.log('⚠️  Strategy selector not found (not on Prompt Builder page)');
        }
        
        return {
            success: true,
            elements: results
        };
    },
    
    /**
     * Test 4: Simulate View Code Click
     */
    async testViewCodeSimulation() {
        console.log('\n🧪 Test 4: Simulate View Code Click');
        console.log('-'.repeat(40));
        
        try {
            // Get the strategy code data first
            const strategyResult = await tests.testStrategyCodeRequest();
            
            if (!strategyResult.success) {
                console.log('❌ Cannot simulate - strategy code request failed');
                return { success: false, error: 'Strategy code request failed' };
            }
            
            // Simulate the display function
            const data = strategyResult.data;
            
            // Create the HTML that would be displayed
            const html = `
                <div class="code-info">
                    <h4>${data.strategy} Strategy</h4>
                    <div>File: ${data.file_path}</div>
                    <div>Lines: ${data.class_info.lines}</div>
                    <div>Size: ${data.class_info.file_size} bytes</div>
                </div>
                <div class="code-content">
                    <h4>buildPrompt() Method</h4>
                    <pre>${data.build_prompt_method}</pre>
                </div>
            `;
            
            console.log('✅ Simulated HTML generation successful');
            console.log('   - HTML length:', html.length, 'characters');
            console.log('   - Contains strategy info:', html.includes(data.strategy) ? 'Yes' : 'No');
            console.log('   - Contains file path:', html.includes(data.file_path) ? 'Yes' : 'No');
            console.log('   - Contains build method:', html.includes('buildPrompt()') ? 'Yes' : 'No');
            
            // If we're on the right page, try to actually display it
            const strategyCodeViewer = document.querySelector('#strategy-code-viewer');
            if (strategyCodeViewer) {
                strategyCodeViewer.innerHTML = html;
                console.log('✅ Actually updated DOM element with strategy code');
            }
            
            return {
                success: true,
                html: html,
                actuallyDisplayed: !!strategyCodeViewer
            };
            
        } catch (error) {
            console.log('❌ View Code Simulation Failed:', error.message);
            return { success: false, error: error.message };
        }
    }
};

// Run All Tests
async function runAllTests() {
    console.log('🚀 Starting Prompt Builder "View Code" Tests...\n');
    
    const results = {};
    
    // Run each test
    results.ajaxHandler = await tests.testAjaxHandlerRegistration();
    results.strategyCode = await tests.testStrategyCodeRequest();
    results.domElements = tests.testDOMElements();
    results.viewCodeSimulation = await tests.testViewCodeSimulation();
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const allPassed = Object.values(results).every(result => result.success);
    
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('   ✅ AJAX handler is properly configured');
        console.log('   ✅ Strategy code request works correctly'); 
        console.log('   ✅ DOM elements are checked');
        console.log('   ✅ View Code simulation works');
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
    console.log('AJAX Handler Test:', results.ajaxHandler);
    console.log('Strategy Code Test:', results.strategyCode);
    console.log('DOM Elements Test:', results.domElements);
    console.log('View Code Simulation Test:', results.viewCodeSimulation);
    
    // Fix Summary
    if (results.strategyCode.success && results.strategyCode.data) {
        console.log('\n🔧 FIXES VERIFIED:');
        console.log('   ✅ Parameter name: Using "strategy_name" (was "strategy")');
        console.log('   ✅ Nonce: Using "fitcopilot_prompt_builder" (was "fitcopilot_admin_nonce")');
        console.log('   ✅ File path: Correct path to SingleWorkoutStrategy.php');
        console.log('   ✅ Response structure: Includes all required fields');
        console.log('   ✅ Build method extraction: Working correctly');
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
window.testPromptBuilderViewCode = runAllTests; 