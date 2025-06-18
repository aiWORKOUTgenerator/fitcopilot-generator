// Final test of the View Code functionality
console.log('🎯 FINAL TEST - View Code Functionality');

const testFinalFix = async () => {
    const formData = new FormData();
    formData.append('action', 'fitcopilot_prompt_builder_view_code');
    formData.append('strategy_name', 'SingleWorkoutStrategy');
    formData.append('nonce', window.fitcopilotPromptBuilder?.nonce || window.fitcopilotData?.nonce || '');
    
    try {
        const response = await fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('Status:', response.status);
        const text = await response.text();
        
        if (response.status === 200) {
            const data = JSON.parse(text);
            console.log('Response structure:', {
                success: data.success,
                hasData: !!data.data,
                hasStrategyName: !!data.data?.strategy_name,
                hasCodeContent: !!data.data?.code_content,
                hasClassInfo: !!data.data?.class_info,
                hasLines: !!data.data?.class_info?.lines,
                codeLength: data.data?.code_content?.length,
                lines: data.data?.class_info?.lines
            });
            
            if (data.success && data.data?.class_info?.lines) {
                console.log('✅ COMPLETE SUCCESS!');
                console.log('   Strategy:', data.data.strategy_name);
                console.log('   Lines:', data.data.class_info.lines);
                console.log('   File Size:', data.data.class_info.file_size, 'bytes');
                console.log('   Code Preview:', data.data.code_content.substring(0, 100) + '...');
                return true;
            } else {
                console.log('❌ Data structure issue:', data);
                return false;
            }
        } else {
            console.log('❌ HTTP Error:', response.status, text);
            return false;
        }
    } catch (error) {
        console.log('❌ Exception:', error.message);
        return false;
    }
};

testFinalFix().then(success => {
    if (success) {
        console.log('🎉 VIEW CODE IS NOW FULLY WORKING!');
        console.log('   You can now click "View Code" buttons in the Prompt Builder');
    } else {
        console.log('💀 Still broken. Check the details above.');
    }
}); 