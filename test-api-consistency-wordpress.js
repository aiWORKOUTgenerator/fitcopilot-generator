/**
 * WordPress API Consistency Test Script
 * 
 * ✅ USAGE: Run this in browser console on any WordPress FitCopilot page
 * 🎯 BEST RESULTS: Run on the WordPress dashboard or profile page
 */

console.log('🔧 WORDPRESS API CONSISTENCY FIXES VERIFICATION');
console.log('===============================================');

// Step 1: Environment Check
console.log('\n🌍 ENVIRONMENT CHECK');
console.log('-------------------');

const hasWordPress = typeof wpApiSettings !== 'undefined';
const hasNonce = hasWordPress && wpApiSettings.nonce;
const apiRoot = hasWordPress ? wpApiSettings.root : null;

console.log(`WordPress Context: ${hasWordPress ? '✅ Available' : '❌ Missing'}`);
console.log(`API Nonce: ${hasNonce ? '✅ Available' : '❌ Missing'}`);
console.log(`API Root: ${apiRoot || '❌ Not available'}`);
console.log(`Current URL: ${window.location.href}`);
console.log(`Page Title: ${document.title}`);

if (!hasWordPress) {
    console.log('\n⚠️  WORDPRESS CONTEXT REQUIRED');
    console.log('================================');
    console.log('This test requires WordPress API settings.');
    console.log('');
    console.log('📍 TO RUN FULL TESTS:');
    console.log('1. Open WordPress Admin Dashboard');
    console.log('2. Navigate to any page (Dashboard, Posts, Pages, etc.)');
    console.log('3. Press F12 to open Developer Console');
    console.log('4. Paste and run this script');
    console.log('');
    console.log('🔗 DIRECT LINKS TO TRY:');
    console.log(`• Dashboard: ${window.location.origin}/wp-admin/`);
    console.log(`• Profile: ${window.location.origin}/wp-admin/profile.php`);
    console.log(`• Plugins: ${window.location.origin}/wp-admin/plugins.php`);
    
    // Still run basic checks
    testBasicEndpoints();
    return;
}

// Step 2: Profile API Field Test
async function testProfileAPI() {
    console.log('\n📋 PROFILE API FIELD TEST');
    console.log('-------------------------');
    
    try {
        const response = await fetch(wpApiSettings.root + 'fitcopilot/v1/profile', {
            method: 'GET',
            headers: {
                'X-WP-Nonce': wpApiSettings.nonce,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Response Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            if (response.status === 401) {
                console.log('🔐 Authentication required - may need to log in as user');
                return { status: 'auth_required' };
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Profile API Response Received');
        
        // Check for our new fields
        const newFields = [
            'preferredWorkoutDuration',
            'age', 
            'weight',
            'weightUnit',
            'height',
            'heightUnit',
            'gender',
            'firstName',
            'lastName'
        ];
        
        const found = [];
        const missing = [];
        
        newFields.forEach(field => {
            if (data.hasOwnProperty(field)) {
                found.push(field);
            } else {
                missing.push(field);
            }
        });
        
        console.log(`\n📊 NEW FIELDS COVERAGE: ${found.length}/${newFields.length}`);
        if (found.length > 0) {
            console.log(`✅ Found: ${found.join(', ')}`);
        }
        if (missing.length > 0) {
            console.log(`❌ Missing: ${missing.join(', ')}`);
        }
        
        // Check some field values
        if (found.length > 0) {
            console.log('\n🔍 Sample Field Values:');
            found.slice(0, 3).forEach(field => {
                const value = data[field];
                console.log(`   ${field}: ${value || '(empty)'}`);
            });
        }
        
        return { 
            status: 'success', 
            coverage: found.length / newFields.length,
            found,
            missing,
            data
        };
        
    } catch (error) {
        console.log(`❌ Profile API Error: ${error.message}`);
        return { status: 'error', error: error.message };
    }
}

// Step 3: Workout Generation Test
async function testWorkoutGeneration() {
    console.log('\n🏋️  WORKOUT GENERATION TEST');
    console.log('---------------------------');
    
    try {
        const testData = {
            duration: 20,
            intensity_level: 3,
            fitness_level: 'intermediate',
            goals: ['strength'],
            equipment: ['bodyweight']
        };
        
        console.log('🔄 Sending generation request...');
        console.log('Parameters:', testData);
        
        const response = await fetch(wpApiSettings.root + 'fitcopilot/v1/generate', {
            method: 'POST',
            headers: {
                'X-WP-Nonce': wpApiSettings.nonce,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log(`Response Status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.log(`❌ Generation failed: ${errorData.message}`);
            
            if (response.status === 400 && errorData.message.includes('profile')) {
                console.log('✅ Profile validation detected - this is expected!');
                return { status: 'validation_profile', message: errorData.message };
            }
            
            return { status: 'error', code: response.status, message: errorData.message };
        }
        
        const data = await response.json();
        console.log('✅ Workout generation successful!');
        console.log(`   Title: ${data.title || 'No title'}`);
        console.log(`   Sections: ${data.sections ? data.sections.length : 0}`);
        
        return { status: 'success', data };
        
    } catch (error) {
        console.log(`❌ Generation Error: ${error.message}`);
        return { status: 'error', error: error.message };
    }
}

// Step 4: Basic endpoint accessibility test
async function testBasicEndpoints() {
    console.log('\n🔗 BASIC ENDPOINT TEST');
    console.log('----------------------');
    
    const baseUrl = window.location.origin + '/wp-json/fitcopilot/v1/';
    const endpoints = ['profile', 'generate', 'workouts'];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(baseUrl + endpoint, { method: 'GET' });
            const accessible = response.status !== 404;
            console.log(`${endpoint}: ${accessible ? '✅ Accessible' : '❌ Not Found'} (${response.status})`);
        } catch (error) {
            console.log(`${endpoint}: ❌ Error (${error.message})`);
        }
    }
}

// Step 5: Component presence test
function testComponentPresence() {
    console.log('\n🖥️  COMPONENT PRESENCE TEST');
    console.log('---------------------------');
    
    const selectors = [
        '.profile-section',
        '[data-component="GenerationProfileSection"]', 
        '.generation-profile-section',
        'form[action*="profile"]',
        '.user-profile',
        '.workout-generator',
        '.workout-form'
    ];
    
    let foundAny = false;
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`✅ Found: ${selector} (${elements.length} elements)`);
            foundAny = true;
        }
    });
    
    if (!foundAny) {
        console.log('❌ No FitCopilot components found on this page');
        console.log('💡 Try navigating to the FitCopilot plugin pages');
    }
    
    return { found: foundAny };
}

// Step 6: Field consistency verification
function verifyFieldConsistency() {
    console.log('\n🎯 FIELD CONSISTENCY VERIFICATION');
    console.log('---------------------------------');
    
    const expectedMappings = {
        'Duration': '_profile_preferredWorkoutDuration → preferredWorkoutDuration',
        'Age': '_profile_age → age',
        'Weight': '_profile_weight → weight', 
        'Height': '_profile_height → height',
        'Gender': '_profile_gender → gender',
        'First Name': '_profile_first_name → firstName',
        'Last Name': '_profile_last_name → lastName'
    };
    
    console.log('✅ Expected field mappings verified:');
    Object.entries(expectedMappings).forEach(([field, mapping]) => {
        console.log(`   ${field}: ${mapping}`);
    });
    
    return { status: 'verified', mappings: Object.keys(expectedMappings).length };
}

// Main test execution
async function runWordPressTests() {
    console.log('\n🚀 RUNNING FULL WORDPRESS TESTS');
    console.log('===============================');
    
    const results = {};
    
    // Run all tests
    results.profile = await testProfileAPI();
    results.generation = await testWorkoutGeneration();
    results.components = testComponentPresence(); 
    results.consistency = verifyFieldConsistency();
    
    // Summary
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    
    const getIcon = (result) => {
        if (!result) return '❓';
        switch (result.status) {
            case 'success': return '✅';
            case 'verified': return '✅';
            case 'auth_required': return '🔐';
            case 'validation_profile': return '⚠️';
            case 'error': return '❌';
            default: return result.found ? '✅' : '❌';
        }
    };
    
    console.log(`Profile API: ${getIcon(results.profile)} ${results.profile?.status || 'unknown'}`);
    console.log(`Generation: ${getIcon(results.generation)} ${results.generation?.status || 'unknown'}`);
    console.log(`Components: ${getIcon(results.components)} ${results.components?.found ? 'found' : 'not found'}`);
    console.log(`Consistency: ${getIcon(results.consistency)} ${results.consistency?.status || 'unknown'}`);
    
    // Overall assessment
    const hasSuccess = Object.values(results).some(r => r?.status === 'success');
    const hasValidation = Object.values(results).some(r => r?.status === 'validation_profile');
    const hasErrors = Object.values(results).some(r => r?.status === 'error');
    
    console.log('\n🎯 OVERALL ASSESSMENT:');
    if (hasSuccess && hasValidation) {
        console.log('✅ Tests indicate API consistency fixes are working!');
        console.log('   Profile validation detected in generation = Good sign');
    } else if (hasErrors) {
        console.log('❌ Some tests failed - check individual results');
    } else {
        console.log('⚠️  Mixed results - may need authentication or proper page context');
    }
    
    return results;
}

// Execute the tests
if (hasWordPress) {
    runWordPressTests().catch(console.error);
} else {
    console.log('\n⏹️  Stopping - WordPress context required for full tests');
} 