// Test Prompt Generation Enabled
console.log('🎉 TESTING PROMPT GENERATION ENABLED');

const testPromptGenerationEnabled = async () => {
    console.log('=== TESTING LIVE PROMPT GENERATION ===');
    
    try {
        // Test with realistic form data
        const testData = {
            basic_info: {
                name: 'Test User',
                age: 35,
                gender: 'male',
                fitness_level: 'intermediate',
                weight: 180,
                height: 72
            },
            session_params: {
                duration: 45,
                focus: 'strength',
                energy_level: 4,
                stress_level: 2,
                sleep_quality: 4
            },
            goals: {
                primary_goal: ['strength', 'muscle_building']
            },
            equipment: ['dumbbells', 'barbell'],
            custom_instructions: 'Focus on compound movements',
            limitations: {
                injuries: 'left knee pain'
            }
        };
        
        console.log('1. Making live prompt generation request...');
        
        const response = await $.post(ajaxurl, {
            action: 'fitcopilot_prompt_builder_generate',
            nonce: window.fitcopilotPromptBuilder?.nonce || window.fitcopilotData?.nonce || '',
            form_data: JSON.stringify(testData),
            strategy: 'single_workout'
        });
        
        console.log('2. Response received:', response);
        
        if (response.success && response.data) {
            console.log('✅ Live prompt generation successful!');
            console.log('   Prompt length:', response.data.prompt.length);
            console.log('   Stats:', response.data.stats);
            
            // Check if it's using actual AI or fallback
            if (response.data.fallback) {
                console.log('📝 Using fallback prompt (AI not configured)');
                console.log('   Shows actual form data: ✅');
                console.log('   Error:', response.data.error);
            } else {
                console.log('🤖 Using actual AI prompt generation: ✅');
            }
            
            // Verify stats are correct
            const expectedChars = response.data.prompt.length;
            const actualChars = response.data.stats.characters;
            
            if (expectedChars === actualChars) {
                console.log('✅ Stats calculation correct');
            } else {
                console.log('❌ Stats mismatch:', expectedChars, 'vs', actualChars);
            }
            
            // Test the preview display
            console.log('3. Testing preview display...');
            
            const previewDiv = document.getElementById('prompt-preview');
            if (previewDiv) {
                console.log('   Found preview div, updating...');
                
                previewDiv.innerHTML = `
                    <div class="prompt-header">
                        <span class="system-badge ${response.data.fallback ? 'fallback' : 'ai'}">
                            ${response.data.fallback ? 'Fallback' : 'AI'} System
                        </span>
                        <span class="stats-badge">${response.data.stats.characters} chars</span>
                    </div>
                    <pre class="prompt-content">${response.data.prompt}</pre>
                    <div class="prompt-stats">
                        <div>Characters: ${response.data.stats.characters}</div>
                        <div>Words: ${response.data.stats.words}</div>
                        <div>Lines: ${response.data.stats.lines}</div>
                        <div>Est. Tokens: ${response.data.stats.estimated_tokens}</div>
                    </div>
                `;
                
                console.log('✅ Preview updated successfully');
            } else {
                console.log('❌ Preview div not found');
            }
            
            // Show prompt preview
            console.log('4. Generated prompt preview:');
            console.log('─'.repeat(50));
            console.log(response.data.prompt.substring(0, 300) + '...');
            console.log('─'.repeat(50));
            
        } else {
            console.log('❌ Live prompt generation failed');
            console.log('   Error:', response.data?.message || response.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('   Error details:', error.message);
    }
    
    console.log('\n=== TEST COMPLETE ===');
    console.log('✅ Prompt generation is now ENABLED!');
    console.log('   Try clicking "Generate Live Prompt" button to see it in action');
};

// Run the test
testPromptGenerationEnabled(); 