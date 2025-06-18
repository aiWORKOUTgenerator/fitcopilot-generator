// Test script to verify live prompt generation fix
console.log('🔧 Testing Live Prompt Generation Fix...');

// Simulate form data collection and AJAX request
function testLivePromptGeneration() {
    console.log('📋 Simulating form data collection...');
    
    const testFormData = {
        basic_info: {
            name: 'Test User',
            fitness_level: 'intermediate'
        },
        goals: {
            primary_goal: 'strength'
        },
        equipment: ['dumbbells', 'bodyweight'],
        session_params: {
            duration: 45,
            stress_level: 3,
            energy_level: 4,
            sleep_quality: 3
        },
        custom_instructions: 'Focus on upper body strength'
    };
    
    console.log('📊 Test form data:', testFormData);
    
    // Test AJAX request
    console.log('🔄 Making AJAX request...');
    
    fetch(ajaxurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: 'fitcopilot_prompt_builder_generate_live_prompt',
            nonce: fitcopilotPromptBuilder.nonce,
            form_data: JSON.stringify(testFormData)
        })
    })
    .then(response => {
        console.log('📥 Response status:', response.status);
        return response.text();
    })
    .then(responseText => {
        console.log('📄 Raw response:', responseText.substring(0, 200) + '...');
        
        try {
            const result = JSON.parse(responseText);
            console.log('✅ Parsed response:', result);
            
            if (result.success && result.data) {
                console.log('🎉 SUCCESS! Live prompt generation is working');
                console.log('📝 Generated prompt preview:', result.data.prompt.substring(0, 300) + '...');
                console.log('📊 Statistics:', result.data.stats);
                
                // Check if prompt contains our test data
                if (result.data.prompt.includes('Test User') || 
                    result.data.prompt.includes('intermediate') ||
                    result.data.prompt.includes('strength')) {
                    console.log('✅ VERIFICATION: Prompt contains form data - data flow working!');
                } else {
                    console.log('⚠️ WARNING: Prompt may not contain form data');
                }
                
                return true;
            } else {
                console.log('❌ FAILED: Response indicates failure');
                console.log('Error:', result.data || result.message);
                return false;
            }
        } catch (e) {
            console.log('❌ FAILED: Could not parse JSON response');
            console.log('Parse error:', e.message);
            return false;
        }
    })
    .catch(error => {
        console.log('❌ FAILED: Network or request error');
        console.log('Error:', error.message);
        return false;
    });
}

// Run the test
if (typeof ajaxurl !== 'undefined' && typeof fitcopilotPromptBuilder !== 'undefined') {
    testLivePromptGeneration();
} else {
    console.log('❌ Cannot run test - missing ajaxurl or fitcopilotPromptBuilder');
    console.log('Please run this script on the PromptBuilder admin page');
} 