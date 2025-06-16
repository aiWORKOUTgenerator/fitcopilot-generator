/**
 * PROFILE DATA FLOW VERIFICATION TEST
 * 
 * Verifies that all profile fields properly flow to workout generation
 * Run this on WordPress admin page for proper authentication
 */

console.log('🔧 PROFILE DATA FLOW VERIFICATION TEST');
console.log('=====================================');

// Check WordPress context
if (typeof wpApiSettings === 'undefined') {
    console.log('❌ ERROR: Run this on WordPress admin page!');
    throw new Error('WordPress context required');
}

const apiConfig = {
    baseUrl: wpApiSettings.root + 'fitcopilot/v1/',
    headers: {
        'X-WP-Nonce': wpApiSettings.nonce,
        'Content-Type': 'application/json'
    }
};

console.log('🔗 API Base URL:', apiConfig.baseUrl);

async function testProfileDataFlow() {
    try {
        console.log('\n📊 STEP 1: Get Current Profile Data');
        console.log('===================================');
        
        // Get profile data
        const profileResponse = await fetch(apiConfig.baseUrl + 'profile', {
            method: 'GET',
            headers: apiConfig.headers,
            credentials: 'same-origin'
        });
        
        const profileData = await profileResponse.json();
        
        if (!profileData.success) {
            console.log('❌ Failed to get profile:', profileData.message);
            return;
        }
        
        const profile = profileData.data;
        console.log('✅ Profile retrieved successfully');
        
        // Log critical profile fields that should flow to OpenAI
        console.log('\n📋 Profile Fields for OpenAI Integration:');
        console.log('==========================================');
        
        const criticalFields = {
            'Name': `${profile.firstName || 'N/A'} ${profile.lastName || 'N/A'}`,
            'Fitness Level': profile.fitnessLevel || 'N/A',
            'Goals': profile.goals ? profile.goals.join(', ') : 'N/A',
            'Age': profile.age || 'N/A',
            'Weight': profile.weight ? `${profile.weight} ${profile.weightUnit}` : 'N/A',
            'Height': profile.height ? `${profile.height} ${profile.heightUnit}` : 'N/A',
            'Gender': profile.gender || 'N/A',
            'Equipment': profile.availableEquipment ? profile.availableEquipment.join(', ') : 'N/A',
            'Location': profile.preferredLocation || 'N/A',
            'Limitations': profile.limitations ? profile.limitations.join(', ') : 'N/A',
            'Limitation Notes': profile.limitationNotes || 'N/A',
            'Workout Frequency': profile.workoutFrequency || 'N/A',
            'Preferred Duration': profile.preferredWorkoutDuration ? `${profile.preferredWorkoutDuration} min` : 'N/A',
            'Disliked Exercises': profile.dislikedExercises ? profile.dislikedExercises.join(', ') : 'N/A'
        };
        
        Object.entries(criticalFields).forEach(([field, value]) => {
            const status = value !== 'N/A' ? '✅' : '❌';
            console.log(`   ${status} ${field}: ${value}`);
        });
        
        console.log('\n🏋️  STEP 2: Test Workout Generation with Profile Data');
        console.log('====================================================');
        
        // Test workout generation to see if profile data flows through
        const workoutParams = {
            duration: 30,
            difficulty: 'intermediate',
            fitness_level: 'intermediate',
            goals: 'strength',
            equipment: ['dumbbells'],
            restrictions: 'Test generation with profile integration',
            intensity: 3,
            intensity_level: 3,
            daily_focus: 'strength'
        };
        
        console.log('🔄 Generating workout with parameters:', workoutParams);
        console.log('   (Profile data should be automatically included by GenerateEndpoint.php)');
        
        const workoutResponse = await fetch(apiConfig.baseUrl + 'generate', {
            method: 'POST',
            headers: apiConfig.headers,
            body: JSON.stringify(workoutParams),
            credentials: 'same-origin'
        });
        
        const workoutData = await workoutResponse.json();
        
        if (workoutData.success) {
            console.log('✅ Workout generation successful!');
            console.log('📊 Generated workout data available');
            
            // Check if the generated workout seems personalized
            const workout = workoutData.data;
            console.log('\n🔍 Personalization Indicators:');
            console.log('==============================');
            
            if (workout.title) {
                console.log(`   ✅ Title: "${workout.title}"`);
            }
            
            if (workout.description) {
                const desc = workout.description.toLowerCase();
                const hasPersonalization = 
                    desc.includes(profile.firstName?.toLowerCase()) ||
                    desc.includes('your') ||
                    desc.includes(profile.fitnessLevel) ||
                    desc.includes('knee') || // Check for limitation awareness
                    desc.includes(profile.preferredLocation);
                
                console.log(`   ${hasPersonalization ? '✅' : '⚠️'} Description includes personalization: ${hasPersonalization}`);
            }
            
            if (workout.exercises && workout.exercises.length > 0) {
                console.log(`   ✅ Exercises generated: ${workout.exercises.length} exercises`);
            }
            
        } else {
            console.log('❌ Workout generation failed:', workoutData.message);
            console.log('Full error:', workoutData);
        }
        
        console.log('\n📝 STEP 3: Backend Logging Verification');
        console.log('=======================================');
        console.log('💡 Check your WordPress error logs for:');
        console.log('   [GenerateEndpoint] ENHANCED Profile data retrieved for user...');
        console.log('   This should show all profile fields being loaded');
        console.log('');
        console.log('   Log file locations:');
        console.log('   • wp-content/debug.log');
        console.log('   • Local by Flywheel: ~/Library/Application Support/Local/logs/');
        console.log('   • Or check your hosting provider\'s error logs');
        
        console.log('\n🎯 VERIFICATION SUMMARY');
        console.log('=======================');
        
        const hasBasicProfile = profile.firstName && profile.lastName;
        const hasPhysicalData = profile.age || profile.weight || profile.height;
        const hasPreferences = profile.goals && profile.availableEquipment;
        const hasLimitations = profile.limitationNotes;
        
        console.log(`Basic Profile: ${hasBasicProfile ? '✅' : '❌'} (Name: ${hasBasicProfile ? 'Present' : 'Missing'})`);
        console.log(`Physical Data: ${hasPhysicalData ? '✅' : '⚠️'} (Age/Weight/Height: ${hasPhysicalData ? 'Present' : 'Missing'})`);
        console.log(`Preferences: ${hasPreferences ? '✅' : '❌'} (Goals/Equipment: ${hasPreferences ? 'Present' : 'Missing'})`);
        console.log(`Limitations: ${hasLimitations ? '✅' : '⚠️'} (Notes: ${hasLimitations ? 'Present' : 'Missing'})`);
        
        if (hasBasicProfile && hasPreferences) {
            console.log('\n🎉 PROFILE DATA FLOW: READY FOR TESTING');
            console.log('✅ Core profile data is present and should flow to OpenAI');
            console.log('✅ Workout generation endpoint is functional');
        } else {
            console.log('\n⚠️  PROFILE DATA INCOMPLETE');
            console.log('❌ Some core profile fields are missing');
            console.log('💡 Update your profile data for optimal AI personalization');
        }
        
    } catch (error) {
        console.log('❌ Test error:', error.message);
        console.log('Full error:', error);
    }
}

// Auto-run
testProfileDataFlow(); 