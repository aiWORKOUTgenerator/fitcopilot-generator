/**
 * Final Test Script: View Code Functionality
 * 
 * This script tests the "View Code" functionality with the simplified
 * extractBuildPromptMethod function to ensure the 500 error is resolved.
 */

console.log('🔍 Testing View Code Functionality - Final Verification');
console.log('=' .repeat(60));

// Test configuration
const testConfig = {
    strategy: 'SingleWorkoutStrategy',
    ajaxUrl: window.ajaxurl || '/wp-admin/admin-ajax.php',
    nonce: window.fitcopilotData?.nonce || ''
};

console.log('📋 Test Configuration:');
console.log('   Strategy:', testConfig.strategy);
console.log('   AJAX URL:', testConfig.ajaxUrl);
console.log('   Nonce Available:', testConfig.nonce ? 'YES' : 'NO');

// Test 1: AJAX Request
async function testViewCodeRequest() {
    console.log('\n🧪 Test 1: AJAX Request');
    console.log('-'.repeat(40));
    
    try {
        const formData = new FormData();
        formData.append('action', 'fitcopilot_prompt_builder_view_code');
        formData.append('strategy_name', testConfig.strategy);
        formData.append('nonce', testConfig.nonce);
        
        console.log('📤 Sending request...');
        console.log('   Action:', 'fitcopilot_prompt_builder_view_code');
        console.log('   Strategy:', testConfig.strategy);
        
        const response = await fetch(testConfig.ajaxUrl, {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Response received');
        console.log('   Status:', response.status, response.statusText);
        console.log('   Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log('   Response Length:', responseText.length, 'characters');
        console.log('   Response Preview:', responseText.substring(0, 200) + '...');
        
        // Try to parse as JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
            console.log('   JSON Parsing: SUCCESS');
            console.log('   Response Keys:', Object.keys(responseData));
        } catch (jsonError) {
            console.error('   JSON Parsing: FAILED');
            console.error('   JSON Error:', jsonError.message);
            console.log('   Raw Response:', responseText);
            return false;
        }
        
        // Check response structure
        if (responseData.success) {
            console.log('✅ Request successful');
            console.log('   Strategy:', responseData.strategy_name);
            console.log('   File Path:', responseData.file_path);
            console.log('   Code Length:', responseData.code_content?.length || 0, 'characters');
            console.log('   Build Method Length:', responseData.build_prompt_method?.length || 0, 'characters');
            
            // Test the UI update
            testUIUpdate(responseData);
            
            return true;
        } else {
            console.error('❌ Request failed');
            console.error('   Error:', responseData.error || 'Unknown error');
            return false;
        }
        
    } catch (error) {
        console.error('❌ AJAX Request failed');
        console.error('   Error:', error.message);
        return false;
    }
}

// Test 2: UI Update
function testUIUpdate(responseData) {
    console.log('\n🧪 Test 2: UI Update');
    console.log('-'.repeat(40));
    
    try {
        // Check if UI elements exist
        const codeContainer = document.getElementById('strategy-code-content');
        const strategySummary = document.getElementById('strategy-summary');
        
        console.log('📱 UI Elements:');
        console.log('   Code Container:', codeContainer ? 'FOUND' : 'NOT FOUND');
        console.log('   Strategy Summary:', strategySummary ? 'FOUND' : 'NOT FOUND');
        
        if (codeContainer) {
            // Update code content
            codeContainer.innerHTML = `
                <div class="strategy-code-header">
                    <h4>📄 ${responseData.strategy_name} Code</h4>
                    <div class="code-stats">
                        <span>📊 ${responseData.class_info?.lines || 0} lines</span>
                        <span>📏 ${responseData.class_info?.file_size || 0} bytes</span>
                    </div>
                </div>
                <div class="strategy-build-method">
                    <h5>🔧 buildPrompt() Method</h5>
                    <pre><code>${escapeHtml(responseData.build_prompt_method || 'Method not available')}</code></pre>
                </div>
                <div class="strategy-full-code">
                    <h5>📋 Full Strategy Code</h5>
                    <pre><code>${escapeHtml(responseData.code_content || 'Code not available')}</code></pre>
                </div>
            `;
            
            console.log('✅ Code container updated');
        }
        
        if (strategySummary) {
            strategySummary.innerHTML = `
                <div class="strategy-info">
                    <h4>📖 Strategy Information</h4>
                    <div class="info-item">
                        <strong>Strategy:</strong> ${responseData.strategy_name}
                    </div>
                    <div class="info-item">
                        <strong>File:</strong> ${responseData.file_path}
                    </div>
                    <div class="info-item">
                        <strong>Last Updated:</strong> ${responseData.timestamp}
                    </div>
                </div>
            `;
            
            console.log('✅ Strategy summary updated');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ UI Update failed');
        console.error('   Error:', error.message);
        return false;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Test 3: Manual Button Click Simulation
function testButtonClick() {
    console.log('\n🧪 Test 3: Button Click Simulation');
    console.log('-'.repeat(40));
    
    const viewCodeBtn = document.querySelector('[data-strategy="SingleWorkoutStrategy"]');
    if (viewCodeBtn) {
        console.log('🔘 View Code button found');
        console.log('   Button text:', viewCodeBtn.textContent.trim());
        console.log('   Data attributes:', Object.fromEntries(
            Object.entries(viewCodeBtn.dataset)
        ));
        
        // Simulate click
        viewCodeBtn.click();
        console.log('✅ Button click simulated');
        
        return true;
    } else {
        console.log('❌ View Code button not found');
        return false;
    }
}

// Main test execution
async function runTests() {
    console.log('\n🚀 Starting Tests...');
    
    // Test 1: Direct AJAX Request
    const ajaxSuccess = await testViewCodeRequest();
    
    // Test 2: Button Click (if button exists)
    const buttonSuccess = testButtonClick();
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('   AJAX Request:', ajaxSuccess ? '✅ PASSED' : '❌ FAILED');
    console.log('   Button Click:', buttonSuccess ? '✅ PASSED' : '❌ FAILED');
    
    if (ajaxSuccess) {
        console.log('\n🎉 SUCCESS: View Code functionality is working!');
        console.log('   The 500 Internal Server Error has been resolved.');
        console.log('   You should now be able to view the SingleWorkoutStrategy code.');
    } else {
        console.log('\n❌ FAILURE: View Code functionality still has issues.');
        console.log('   Check the browser console and server logs for more details.');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Test completed');
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}

// Make functions available globally for manual testing
window.testViewCodeFunctionality = {
    runTests,
    testViewCodeRequest,
    testUIUpdate,
    testButtonClick
};

console.log('\n💡 Manual Testing Available:');
console.log('   Run: window.testViewCodeFunctionality.runTests()');
console.log('   Test AJAX: window.testViewCodeFunctionality.testViewCodeRequest()');
console.log('   Test Button: window.testViewCodeFunctionality.testButtonClick()'); 