// Enhanced Profile Data Integration Test Script
// Copy and paste this into browser console on the dashboard page

console.log('🔧 ENHANCED PROFILE DATA INTEGRATION TEST');
console.log('='.repeat(60));

// Test 1: Verify Enhanced Profile Fields in Registration Data
function testProfileFieldsDisplay() {
    console.log('\n1️⃣ Testing Profile Fields Display:');
    
    const profileSections = {
        userInfo: ['Full Name', 'Email', 'Username', 'Display Name'],
        fitnessProfile: ['Fitness Level', 'Goals', 'Workout Frequency', 'Preferred Duration', 'Available Equipment', 'Preferred Location'],
        physicalInfo: ['Age', 'Weight', 'Height', 'Gender', 'Limitations', 'Limitation Notes']
    };
    
    Object.entries(profileSections).forEach(([section, fields]) => {
        console.log(`\n📋 ${section.toUpperCase()} SECTION:`);
        fields.forEach(field => {
            const found = document.body.textContent.includes(field);
            console.log(`  ${found ? '✅' : '❌'} ${field}: ${found ? 'Found' : 'Missing'}`);
        });
    });
}

// Test 2: Generate Test Workout to Verify API Data Flow
async function testEnhancedAPIDataFlow() {
    console.log('\n2️⃣ Testing Enhanced API Data Flow:');
    
    try {
        const testParams = {
            duration: 30,
            fitness_level: 'advanced',
            intensity_level: 4,
            equipment: ['none'],
            goals: ['strength', 'muscle_building'],
            stress_level: 'moderate',
            energy_level: 'high',
            sleep_quality: 'good',
            location: 'home',
            custom_notes: 'Test workout generation with enhanced profile data',
            restrictions: []
        };
        
        console.log('📤 Sending test workout generation request...');
        console.log('Parameters:', testParams);
        
        const response = await fetch('/wp-json/fitcopilot/v1/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || ''
            },
            body: JSON.stringify(testParams)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response received:', data.success ? 'Success' : 'Failed');
            
            if (data.success && data.data) {
                console.log('🎯 Generated workout title:', data.data.title || 'No title');
                console.log('📊 Workout sections:', data.data.sections?.length || 0);
                
                // Check if profile data influenced the workout
                const workoutText = JSON.stringify(data.data).toLowerCase();
                const profileInfluenceIndicators = [
                    'advanced', 'strength', 'muscle', 'home',
                    'moderate stress', 'high energy', 'good sleep'
                ];
                
                console.log('\n🔍 Profile Influence Analysis:');
                profileInfluenceIndicators.forEach(indicator => {
                    const found = workoutText.includes(indicator.toLowerCase());
                    console.log(`  ${found ? '✅' : '⚠️'} ${indicator}: ${found ? 'Present' : 'Not found'}`);
                });
            }
        } else {
            console.log('❌ API Request failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.log('❌ API Test Error:', error.message);
    }
}

// Test 3: Verify Console Logging for Profile Data Retrieval
function testConsoleLogging() {
    console.log('\n3️⃣ Profile Data Logging Verification:');
    console.log('📝 Check browser network tab and console for:');
    console.log('  - "[GenerateEndpoint] ENHANCED Profile data retrieved"');
    console.log('  - Profile fields: name, fitness_level, goals, equipment, physical_data');
    console.log('  - "[OpenAI Provider] SPRINT 3 Enhanced Parameter Usage Summary"');
    console.log('  - Profile integration parameters count');
    console.log('\n💡 Generate a workout to see these logs in action!');
}

// Test 4: Check Profile Data Storage Format
async function testProfileDataStorage() {
    console.log('\n4️⃣ Testing Profile Data Storage Format:');
    
    try {
        const response = await fetch('/wp-json/fitcopilot/v1/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || ''
            }
        });
        
        if (response.ok) {
            const profileData = await response.json();
            console.log('✅ Profile API Response:', profileData.success ? 'Success' : 'Failed');
            
            if (profileData.success && profileData.data) {
                const profile = profileData.data;
                
                console.log('\n📊 Profile Data Analysis:');
                
                // Enhanced profile fields check
                const enhancedFields = {
                    'Personal Info': ['firstName', 'lastName'],
                    'Fitness Profile': ['fitnessLevel', 'goals', 'workoutFrequency', 'preferredDuration'],
                    'Physical Stats': ['age', 'weight', 'height', 'gender'],
                    'Preferences': ['availableEquipment', 'preferredLocation'],  
                    'Limitations': ['limitations', 'limitationNotes']
                };
                
                Object.entries(enhancedFields).forEach(([category, fields]) => {
                    console.log(`\n${category}:`);
                    fields.forEach(field => {
                        const value = profile[field];
                        const hasValue = value !== undefined && value !== null && value !== '';
                        console.log(`  ${hasValue ? '✅' : '⚠️'} ${field}: ${hasValue ? JSON.stringify(value) : 'Empty/Missing'}`);
                    });
                });
                
                // Data completeness score
                const allFields = Object.values(enhancedFields).flat();
                const completedFields = allFields.filter(field => {
                    const value = profile[field];
                    return value !== undefined && value !== null && value !== '';
                });
                
                const completionPercentage = Math.round((completedFields.length / allFields.length) * 100);
                console.log(`\n📈 Profile Completeness: ${completionPercentage}% (${completedFields.length}/${allFields.length} fields)`);
                
                if (completionPercentage < 70) {
                    console.log('⚠️ Profile completion below 70% - some personalization features may be limited');
                } else {
                    console.log('✅ Profile completion sufficient for enhanced personalization');
                }
            }
        } else {
            console.log('❌ Profile API Request failed:', response.status);
        }
    } catch (error) {
        console.log('❌ Profile Storage Test Error:', error.message);
    }
}

// Test 5: Expected AI Prompt Enhancement Verification
function testAIPromptEnhancements() {
    console.log('\n5️⃣ AI Prompt Enhancement Verification:');
    console.log('📝 The enhanced OpenAI Provider should now include:');
    
    const enhancements = [
        '👤 Personal identification (user name) for workout personalization',
        '🎂 Age-based workout context (young adult, mature adult, senior, etc.)',
        '📏 Physical stats integration (height, weight) for exercise modifications',
        '⚧ Gender-informed workout approach (strength patterns, preferences)',  
        '⏱️ Preferred duration consideration from profile',
        '🏋️ Enhanced profile equipment and location integration',
        '🚫 Detailed limitation notes with safety priorities',
        '🧠 AI system message updated with physical adaptation expertise'
    ];
    
    enhancements.forEach((enhancement, index) => {
        console.log(`  ${index + 1}. ${enhancement}`);
    });
    
    console.log('\n💡 Generate a workout and check the console logs to see these enhancements in action!');
}

// Main Test Execution
async function runEnhancedProfileTests() {
    console.log('🚀 Starting Enhanced Profile Integration Tests...\n');
    
    // Run all tests
    testProfileFieldsDisplay();
    await testEnhancedAPIDataFlow();
    testConsoleLogging();
    await testProfileDataStorage();
    testAIPromptEnhancements();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ENHANCED PROFILE INTEGRATION TESTS COMPLETED');
    console.log('📋 Summary:');
    console.log('  1. Profile fields display verification');
    console.log('  2. API data flow with enhanced profile data');
    console.log('  3. Console logging verification guide');
    console.log('  4. Profile data storage format analysis');
    console.log('  5. AI prompt enhancement verification');
    console.log('\n💡 Next Steps:');
    console.log('  - Generate a workout to see enhanced profile data in action');
    console.log('  - Check browser console for detailed logging');
    console.log('  - Verify workout personalization based on profile data');
    console.log('  - Complete profile data if completion percentage is low');
}

// Auto-run the tests
runEnhancedProfileTests(); 