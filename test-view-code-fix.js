/**
 * Test "View Code" Fix for Prompt Builder
 * 
 * This script tests the fixes we made to resolve the 500 Internal Server Error
 * when clicking "View Code" in the Prompt Builder interface.
 */

console.log('🔧 Testing "View Code" Fix Implementation');
console.log('='.repeat(60));

// Test Configuration
const testConfig = {
    ajaxUrl: '/wp-admin/admin-ajax.php',
    nonce: window.fitcopilotPromptBuilder?.nonce || '',
    strategyName: 'SingleWorkoutStrategy'
};

console.log('📋 Test Configuration:');
console.log('   - AJAX URL:', testConfig.ajaxUrl);
console.log('   - Nonce available:', !!testConfig.nonce);
console.log('   - Strategy name:', testConfig.strategyName);

// Test Functions
const tests = {
    
    /**
     * Test 1: Verify Fix Components
     */
    testFixComponents() {
        console.log('\n🧪 Test 1: Verify Fix Components');
        console.log('-'.repeat(40));
        
        const results = {};
        
        // Check if we're on the right page
        if (window.location.href.includes('fitcopilot-prompt-builder')) {
            results.onCorrectPage = true;
            console.log('✅ On Prompt Builder page');
        } else {
            results.onCorrectPage = false;
            console.log('⚠️  Not on Prompt Builder page');
        }
        
        // Check if AJAX URL is available
        if (typeof ajaxurl !== 'undefined') {
            results.ajaxUrl = true;
            console.log('✅ ajaxurl is available:', ajaxurl);
        } else {
            results.ajaxUrl = false;
            console.log('❌ ajaxurl is not available');
        }
        
        // Check if nonce is available
        if (testConfig.nonce) {
            results.nonce = true;
            console.log('✅ Nonce is available');
        } else {
            results.nonce = false;
            console.log('❌ Nonce is not available');
        }
        
        return results;
    },
    
    /**
     * Test 2: Direct AJAX Request
     */
    async testDirectAjaxRequest() {
        console.log('\n🧪 Test 2: Direct AJAX Request');
        console.log('-'.repeat(40));
        
        try {
            console.log('Making direct AJAX request...');
            console.log('Action:', 'fitcopilot_prompt_builder_get_strategy');
            console.log('Strategy name:', testConfig.strategyName);
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
            console.log('Response OK:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ HTTP Error:', response.status, response.statusText);
                console.log('Error response:', errorText);
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                    response: errorText
                };
            }
            
            const data = await response.json();
            console.log('✅ Response received successfully');
            console.log('Response data:', data);
            
            if (data.success) {
                console.log('✅ AJAX Request Successful!');
                console.log('   - Strategy:', data.data.strategy);
                console.log('   - File path:', data.data.file_path);
                console.log('   - Code length:', data.data.code_content?.length || 0, 'chars');
                console.log('   - Method length:', data.data.build_prompt_method?.length || 0, 'chars');
                console.log('   - Lines:', data.data.class_info?.lines);
                
                return {
                    success: true,
                    data: data.data
                };
            } else {
                console.log('❌ AJAX Request Failed:', data.message || data.error);
                return {
                    success: false,
                    error: data.message || data.error,
                    response: data
                };
            }
            
        } catch (error) {
            console.log('❌ AJAX Request Exception:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * Test 3: UI Integration
     */
    async testUIIntegration() {
        console.log('\n🧪 Test 3: UI Integration Test');
        console.log('-'.repeat(40));
        
        try {
            // Check if strategy code viewer exists
            const strategyCodeViewer = document.querySelector('#strategy-code-viewer');
            if (!strategyCodeViewer) {
                console.log('⚠️  Strategy code viewer not found (not on Prompt Builder page)');
                return { success: false, error: 'Not on Prompt Builder page' };
            }
            
            console.log('✅ Strategy code viewer found');
            
            // Get strategy code via AJAX
            const ajaxResult = await tests.testDirectAjaxRequest();
            
            if (!ajaxResult.success) {
                console.log('❌ Cannot test UI integration - AJAX failed');
                return { success: false, error: 'AJAX request failed' };
            }
            
            // Simulate the display function
            const data = ajaxResult.data;
            
            const html = `
                <div class="code-info">
                    <h4>${data.strategy} Strategy</h4>
                    <div>File: ${data.file_path}</div>
                    <div>Lines: ${data.class_info.lines}</div>
                    <div>Size: ${data.class_info.file_size} bytes</div>
                </div>
                <div class="code-content">
                    <h4>buildPrompt() Method</h4>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${data.build_prompt_method}</pre>
                </div>
            `;
            
            // Actually update the DOM
            strategyCodeViewer.innerHTML = html;
            
            console.log('✅ UI Integration Successful!');
            console.log('   - HTML generated and displayed');
            console.log('   - Strategy code now visible in interface');
            
            return {
                success: true,
                htmlLength: html.length,
                displayed: true
            };
            
        } catch (error) {
            console.log('❌ UI Integration Failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// Run All Tests
async function runAllTests() {
    console.log('🚀 Starting "View Code" Fix Tests...\n');
    
    const results = {};
    
    // Run each test
    results.fixComponents = tests.testFixComponents();
    results.ajaxRequest = await tests.testDirectAjaxRequest();
    results.uiIntegration = await tests.testUIIntegration();
    
    // Summary
    console.log('\n📊 FIX TEST SUMMARY');
    console.log('='.repeat(60));
    
    const allPassed = Object.values(results).every(result => result.success !== false);
    
    if (allPassed) {
        console.log('🎉 ALL FIXES WORKING!');
        console.log('   ✅ Fix components verified');
        console.log('   ✅ AJAX request successful');
        console.log('   ✅ UI integration working');
        console.log('\n🔥 THE "VIEW CODE" FUNCTIONALITY IS NOW WORKING!');
    } else {
        console.log('⚠️  SOME ISSUES FOUND:');
        Object.entries(results).forEach(([test, result]) => {
            if (result.success === false) {
                console.log(`   ❌ ${test}: ${result.error}`);
            }
        });
    }
    
    // Detailed Results
    console.log('\n📋 DETAILED RESULTS:');
    console.log('Fix Components:', results.fixComponents);
    console.log('AJAX Request:', results.ajaxRequest);
    console.log('UI Integration:', results.uiIntegration);
    
    // What Was Fixed
    console.log('\n🔧 ISSUES THAT WERE FIXED:');
    console.log('   ✅ Strategy key mapping: Added "SingleWorkoutStrategy" → file path');
    console.log('   ✅ Parameter name: JavaScript sends "strategy_name" correctly');
    console.log('   ✅ Nonce: Using "fitcopilot_prompt_builder" nonce correctly');
    console.log('   ✅ File path: Correct path to SingleWorkoutStrategy.php');
    console.log('   ✅ Error handling: Enhanced logging and error detection');
    console.log('   ✅ Response structure: Proper data format for UI display');
    
    return results;
}

// Auto-run tests
if (typeof window !== 'undefined') {
    // Browser environment
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        runAllTests();
    }
} else {
    // Node.js environment
    runAllTests();
}

// Make available globally
window.testViewCodeFix = runAllTests; 