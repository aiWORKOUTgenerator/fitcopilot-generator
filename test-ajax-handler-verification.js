// Test AJAX Handler Registration and Response
// Run this in browser console on the Testing Lab page

console.log('🔍 AJAX Handler Registration Test');
console.log('================================');

// Test 1: Check if action is properly formed
const testAction = 'fitcopilot_debug_test_workout';
console.log('✅ Action name:', testAction);

// Test 2: Check nonce availability
const nonce = window.fitcopilotTestingLab?.nonce || window.fitcopilotData?.nonce;
console.log('✅ Nonce available:', nonce ? 'Yes' : 'No');
console.log('✅ Nonce value:', nonce);

// Test 3: Test minimal AJAX request (no test data)
async function testMinimalAjax() {
    console.log('\n📡 Testing minimal AJAX request...');
    
    const formData = new FormData();
    formData.append('action', testAction);
    formData.append('nonce', nonce);
    // Don't include test_data to test if handler exists
    
    try {
        const response = await fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('Response text (first 500 chars):', text.substring(0, 500));
        
        // Try to parse as JSON
        try {
            const json = JSON.parse(text);
            console.log('✅ JSON response:', json);
        } catch (e) {
            console.log('❌ Not valid JSON. Raw response:', text);
        }
        
    } catch (error) {
        console.error('❌ Request failed:', error);
    }
}

// Test 4: Test with minimal test data
async function testWithData() {
    console.log('\n📊 Testing with minimal test data...');
    
    const formData = new FormData();
    formData.append('action', testAction);
    formData.append('nonce', nonce);
    formData.append('test_data', JSON.stringify({
        duration: 30,
        fitness_level: 'intermediate'
    }));
    
    try {
        const response = await fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response text (first 500 chars):', text.substring(0, 500));
        
        try {
            const json = JSON.parse(text);
            console.log('✅ JSON response:', json);
        } catch (e) {
            console.log('❌ Not valid JSON. Raw response:', text);
        }
        
    } catch (error) {
        console.error('❌ Request failed:', error);
    }
}

// Run tests
if (nonce) {
    console.log('\n🚀 Running tests...');
    testMinimalAjax().then(() => {
        console.log('\n' + '='.repeat(50));
        testWithData();
    });
} else {
    console.error('❌ Cannot run tests - no nonce available');
} 