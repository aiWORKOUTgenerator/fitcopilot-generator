// ULTRA SIMPLE TEST - View Code
console.log('🔧 SIMPLE VIEW CODE TEST');

const testSimpleViewCode = async () => {
    console.log('Testing simplified view code...');
    
    const formData = new FormData();
    formData.append('action', 'fitcopilot_prompt_builder_view_code');
    formData.append('strategy_name', 'SingleWorkoutStrategy');
    formData.append('nonce', window.fitcopilotData?.nonce || '');
    
    try {
        const response = await fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        const text = await response.text();
        console.log('Response length:', text.length);
        console.log('Response preview:', text.substring(0, 200));
        
        if (response.status === 200) {
            const data = JSON.parse(text);
            if (data.success) {
                console.log('✅ SUCCESS! Code loaded:', data.code_content.length, 'chars');
                return true;
            } else {
                console.log('❌ FAILED:', data.error);
                return false;
            }
        } else {
            console.log('❌ HTTP ERROR:', response.status);
            console.log('Response:', text);
            return false;
        }
    } catch (error) {
        console.log('❌ EXCEPTION:', error.message);
        return false;
    }
};

// Run the test
testSimpleViewCode().then(success => {
    if (success) {
        console.log('🎉 FIXED! The view code functionality is now working.');
    } else {
        console.log('💀 STILL BROKEN. Check the response details above.');
    }
});

// Make it available globally
window.testSimpleViewCode = testSimpleViewCode; 