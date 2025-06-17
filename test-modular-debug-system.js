/**
 * Test Script: Modular Debug System
 * 
 * Tests the new modular debug architecture to ensure it resolves the 500 errors
 */

console.log('🧪 Testing Modular Debug System...');

// Test data for workout generation
const testData = {
    test_data: {
        duration: 30,
        fitness_level: 'intermediate',
        goals: ['strength', 'muscle_building'],
        equipment: ['dumbbells', 'bodyweight'],
        stress_level: 'moderate',
        energy_level: 'high',
        sleep_quality: 'good'
    }
};

// Test functions
const tests = {
    
    async testWorkoutGeneration() {
        console.log('📋 Testing Workout Generation...');
        try {
            const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'fitcopilot_debug_test_workout',
                    nonce: window.fitcopilotData?.nonce || '',
                    test_data: JSON.stringify(testData)
                })
            });
            
            const result = await response.json();
            console.log('✅ Workout Generation Response:', result);
            
            if (result.success) {
                console.log('✅ Workout generation test PASSED');
                return true;
            } else {
                console.error('❌ Workout generation test FAILED:', result.data);
                return false;
            }
        } catch (error) {
            console.error('❌ Workout generation test ERROR:', error);
            return false;
        }
    },
    
    async testPromptBuilding() {
        console.log('📝 Testing Prompt Building...');
        try {
            const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'fitcopilot_debug_test_prompt',
                    nonce: window.fitcopilotData?.nonce || '',
                    test_data: JSON.stringify(testData)
                })
            });
            
            const result = await response.json();
            console.log('✅ Prompt Building Response:', result);
            
            if (result.success) {
                console.log('✅ Prompt building test PASSED');
                return true;
            } else {
                console.error('❌ Prompt building test FAILED:', result.data);
                return false;
            }
        } catch (error) {
            console.error('❌ Prompt building test ERROR:', error);
            return false;
        }
    },
    
    async testContextValidation() {
        console.log('🔍 Testing Context Validation...');
        try {
            const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'fitcopilot_debug_validate_context',
                    nonce: window.fitcopilotData?.nonce || '',
                    test_data: JSON.stringify(testData)
                })
            });
            
            const result = await response.json();
            console.log('✅ Context Validation Response:', result);
            
            if (result.success) {
                console.log('✅ Context validation test PASSED');
                return true;
            } else {
                console.error('❌ Context validation test FAILED:', result.data);
                return false;
            }
        } catch (error) {
            console.error('❌ Context validation test ERROR:', error);
            return false;
        }
    },
    
    async testSystemLogs() {
        console.log('📊 Testing System Logs...');
        try {
            const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'fitcopilot_debug_get_logs',
                    nonce: window.fitcopilotData?.nonce || ''
                })
            });
            
            const result = await response.json();
            console.log('✅ System Logs Response:', result);
            
            if (result.success) {
                console.log('✅ System logs test PASSED');
                return true;
            } else {
                console.error('❌ System logs test FAILED:', result.data);
                return false;
            }
        } catch (error) {
            console.error('❌ System logs test ERROR:', error);
            return false;
        }
    }
};

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Modular Debug System Tests...');
    
    const results = {
        workoutGeneration: await tests.testWorkoutGeneration(),
        promptBuilding: await tests.testPromptBuilding(),
        contextValidation: await tests.testContextValidation(),
        systemLogs: await tests.testSystemLogs()
    };
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('🎉 All tests PASSED! Modular debug system is working correctly.');
    } else {
        console.log('⚠️ Some tests FAILED. Check the detailed logs above.');
    }
    
    return results;
}

// Auto-run tests if we're in the admin area
if (window.location.pathname.includes('/wp-admin/')) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(runAllTests, 1000); // Wait for page to fully load
    });
}

// Export for manual testing
window.testModularDebugSystem = runAllTests; 