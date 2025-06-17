// Test Direct AJAX Endpoint
// Run this in browser console on the Testing Lab page

console.log('🧪 Testing Direct AJAX Endpoint...');

async function testDirectAjax() {
    const testData = {
        duration: 30,
        fitness_level: 'intermediate',
        goals: 'strength',
        equipment: [],
        restrictions: [],
        stress_level: 'moderate',
        energy_level: 'moderate',
        sleep_quality: 'good'
    };
    
    const formData = new FormData();
    formData.append('action', 'test_direct_workout');
    formData.append('test_id', 'direct_test_' + Date.now());
    formData.append('test_data', JSON.stringify(testData));
    
    try {
        console.log('📡 Sending request to direct endpoint...');
        
        const response = await fetch('/wp-content/plugins/Fitcopilot-Generator/test-simple-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📊 Raw response:', responseText);
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ Direct AJAX test successful!');
                console.log('📋 Response data:', data);
                return data;
            } catch (parseError) {
                console.log('❌ JSON parse error:', parseError);
                console.log('📄 Response was not valid JSON:', responseText);
            }
        } else {
            console.log('❌ Direct AJAX test failed with status:', response.status);
        }
        
    } catch (error) {
        console.log('❌ Direct AJAX test error:', error);
    }
}

// Also test the original WordPress AJAX for comparison
async function testWordPressAjax() {
    const testData = {
        duration: 30,
        fitness_level: 'intermediate',
        goals: 'strength',
        equipment: [],
        restrictions: [],
        stress_level: 'moderate',
        energy_level: 'moderate',
        sleep_quality: 'good'
    };
    
    const formData = new FormData();
    formData.append('action', 'fitcopilot_debug_test_workout');
    formData.append('nonce', window.fitcopilotTestingLab?.nonce || '99a23a02d6');
    formData.append('test_id', 'wp_test_' + Date.now());
    formData.append('test_data', JSON.stringify(testData));
    formData.append('include_debug', 'true');
    
    try {
        console.log('📡 Sending request to WordPress AJAX...');
        
        const response = await fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('📊 WP AJAX Response status:', response.status);
        
        const responseText = await response.text();
        console.log('📊 WP AJAX Raw response:', responseText.substring(0, 500) + '...');
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ WordPress AJAX test successful!');
                console.log('📋 WP Response data:', data);
                return data;
            } catch (parseError) {
                console.log('❌ WP AJAX JSON parse error:', parseError);
            }
        } else {
            console.log('❌ WordPress AJAX test failed with status:', response.status);
        }
        
    } catch (error) {
        console.log('❌ WordPress AJAX test error:', error);
    }
}

// Run both tests
async function runComparison() {
    console.log('🔬 Running AJAX Comparison Test...');
    
    console.log('\n1️⃣ Testing Direct Endpoint:');
    const directResult = await testDirectAjax();
    
    console.log('\n2️⃣ Testing WordPress AJAX:');
    const wpResult = await testWordPressAjax();
    
    console.log('\n📊 Comparison Results:');
    console.log('Direct endpoint worked:', !!directResult?.success);
    console.log('WordPress AJAX worked:', !!wpResult?.success);
    
    if (directResult?.success && !wpResult?.success) {
        console.log('🎯 CONCLUSION: Issue is with WordPress AJAX processing, not the backend code');
    } else if (!directResult?.success && !wpResult?.success) {
        console.log('🎯 CONCLUSION: Issue is with the backend code itself');
    } else if (directResult?.success && wpResult?.success) {
        console.log('🎯 CONCLUSION: Both work - may be an intermittent issue');
    }
}

// Auto-run the test
runComparison(); 