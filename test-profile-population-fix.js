// Test the Profile Population fix
console.log('🔧 TESTING PROFILE POPULATION FIX');

const testProfilePopulation = async () => {
    console.log('1. Testing profile load and form population...');
    
    // First, clear any existing form data
    $('#prompt-builder-form')[0]?.reset();
    
    const formData = new FormData();
    formData.append('action', 'fitcopilot_prompt_builder_load_profile');
    formData.append('user_id', '1');
    formData.append('nonce', window.fitcopilotPromptBuilder?.nonce || '');
    
    try {
        const response = await fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ API Response received');
            
            // Extract profile data like the fixed function does
            const profileData = data.data.data.profile_data;
            console.log('📊 Profile data structure:', profileData);
            
            // Test form field population
            console.log('2. Checking form field population...');
            
            // Wait a moment for any async population
            setTimeout(() => {
                const formValues = {
                    firstName: $('#firstName').val(),
                    lastName: $('#lastName').val(),
                    age: $('#age').val(),
                    gender: $('#gender').val(),
                    fitnessLevel: $('#fitnessLevel').val(),
                    weight: $('#weight').val(),
                    testDuration: $('#testDuration').val(),
                    energyLevel: $('#energyLevel').val(),
                    stressLevel: $('#stressLevel').val()
                };
                
                console.log('📝 Form field values after population:', formValues);
                
                // Check checkboxes
                const checkedGoals = $('input[name="goals[]"]:checked').map(function() {
                    return this.value;
                }).get();
                
                const checkedEquipment = $('input[name="availableEquipment[]"]:checked').map(function() {
                    return this.value;
                }).get();
                
                console.log('☑️ Checked goals:', checkedGoals);
                console.log('☑️ Checked equipment:', checkedEquipment);
                
                // Verify population worked
                let populatedFields = 0;
                let totalFields = 0;
                
                Object.keys(formValues).forEach(key => {
                    totalFields++;
                    if (formValues[key] && formValues[key] !== '') {
                        populatedFields++;
                        console.log(`   ✅ ${key}: ${formValues[key]}`);
                    } else {
                        console.log(`   ❌ ${key}: empty`);
                    }
                });
                
                if (checkedGoals.length > 0) {
                    console.log(`   ✅ goals: ${checkedGoals.length} selected`);
                    populatedFields++;
                }
                totalFields++;
                
                if (checkedEquipment.length > 0) {
                    console.log(`   ✅ equipment: ${checkedEquipment.length} selected`);
                    populatedFields++;
                }
                totalFields++;
                
                const populationRate = (populatedFields / totalFields * 100).toFixed(1);
                console.log(`📈 Population success rate: ${populationRate}% (${populatedFields}/${totalFields})`);
                
                if (populationRate > 50) {
                    console.log('🎉 SUCCESS! Form population is working');
                } else {
                    console.log('⚠️ LOW population rate - may need further fixes');
                }
                
            }, 500);
            
        } else {
            console.log('❌ API Error:', data);
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
    }
};

testProfilePopulation(); 